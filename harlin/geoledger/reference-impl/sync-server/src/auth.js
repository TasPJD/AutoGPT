/**
 * GeoLedger Sync Server — authentication & device registry.
 *
 * Model:
 *   - One admin token (bootstrap): from GL_ADMIN_TOKEN / options, or
 *     auto-generated. Grants register / revoke / audit only.
 *   - Per-device bearer tokens: 32 bytes of CSPRNG output, shown once at
 *     registration; only the sha256 hash is persisted in fleet.json.
 *   - All comparisons are constant-time (crypto.timingSafeEqual over
 *     fixed-length sha256 digests), so neither token length nor prefix
 *     leaks through timing.
 *
 * fleet.json is rewritten atomically (temp + rename + fsync) on every
 * mutation; the registry is small (fleet-scale ≤ 50 devices).
 *
 * Zero runtime dependencies (node:crypto, node:fs, node:path).
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { isSafeName } from './storage.js';

/**
 * @typedef {object} DeviceRecord
 * @property {string} deviceId
 * @property {string} deviceName
 * @property {string} operator
 * @property {string} tokenHash    hex sha256 of the device bearer token
 * @property {string} registeredAt ISO-8601
 * @property {boolean} revoked
 * @property {string | null} revokedAt ISO-8601 or null
 */

/**
 * Constant-time equality of two secrets via their sha256 digests.
 * Hashing first makes the comparison fixed-length, so timingSafeEqual
 * never throws on length mismatch and leaks nothing about either input.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function secretsEqual(a, b) {
  const da = crypto.createHash('sha256').update(a).digest();
  const db = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(da, db);
}

/**
 * @param {string} token
 * @returns {string} hex sha256
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Device registry + token verification, persisted in `<dataDir>/fleet.json`.
 */
export class Auth {
  /**
   * @param {{ dataDir: string, adminToken?: string | null }} options
   *   `adminToken`: plaintext admin token to use; when omitted/empty one is
   *   generated and `adminTokenGenerated` is set so the caller can print it
   *   exactly once.
   */
  constructor({ dataDir, adminToken = null }) {
    /** @type {string} */
    this.fleetPath = path.join(path.resolve(dataDir), 'fleet.json');
    /** @type {string} */
    this.tmpDir = path.join(path.resolve(dataDir), 'tmp');
    fs.mkdirSync(this.tmpDir, { recursive: true });

    /** @type {boolean} true when the admin token was auto-generated this boot */
    this.adminTokenGenerated = !adminToken;
    /** @type {string} plaintext admin token (kept in memory only) */
    this.adminToken = adminToken || `gla_${crypto.randomBytes(32).toString('base64url')}`;
    /** @type {Buffer} sha256 of the admin token, for constant-time compare */
    this._adminHash = crypto.createHash('sha256').update(this.adminToken).digest();

    /** @type {Map<string, DeviceRecord>} deviceId → record */
    this.devices = new Map();
    this._load();
  }

  /** Load fleet.json if present. */
  _load() {
    let raw;
    try {
      raw = fs.readFileSync(this.fleetPath, 'utf8');
    } catch {
      return; // first boot
    }
    const parsed = JSON.parse(raw);
    for (const device of parsed.devices ?? []) {
      if (typeof device?.deviceId === 'string' && typeof device?.tokenHash === 'string') {
        this.devices.set(device.deviceId, device);
      }
    }
  }

  /** Persist fleet.json atomically (temp + rename + fsync). */
  _persist() {
    const body = JSON.stringify(
      { version: 1, updatedAt: new Date().toISOString(), devices: [...this.devices.values()] },
      null,
      2,
    );
    const tmpPath = path.join(this.tmpDir, `fleet-${crypto.randomUUID()}`);
    const fd = fs.openSync(tmpPath, 'w');
    try {
      fs.writeSync(fd, body);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(tmpPath, this.fleetPath);
    try {
      const dirFd = fs.openSync(path.dirname(this.fleetPath), 'r');
      try {
        fs.fsyncSync(dirFd);
      } finally {
        fs.closeSync(dirFd);
      }
    } catch {
      /* best-effort */
    }
  }

  /**
   * Constant-time admin token check.
   * @param {string | null} token
   * @returns {boolean}
   */
  verifyAdmin(token) {
    if (typeof token !== 'string' || token.length === 0) return false;
    const digest = crypto.createHash('sha256').update(token).digest();
    return crypto.timingSafeEqual(digest, this._adminHash);
  }

  /**
   * Register (or re-register) a device. Re-registration rotates the token
   * and clears any revocation — it is an admin-only action, used when a
   * field laptop is re-imaged or a token is lost.
   *
   * @param {{ deviceId: string, deviceName?: string, operator?: string }} input
   * @returns {{ deviceId: string, deviceName: string, operator: string, token: string, registeredAt: string }}
   *   `token` is the plaintext bearer token — shown once, never stored.
   */
  registerDevice({ deviceId, deviceName = '', operator = '' }) {
    if (!isSafeName(deviceId)) {
      throw new Error('deviceId must match ^[A-Za-z0-9._-]+$ with no leading dot');
    }
    const token = `gld_${crypto.randomBytes(32).toString('base64url')}`;
    const registeredAt = new Date().toISOString();
    /** @type {DeviceRecord} */
    const record = {
      deviceId,
      deviceName: String(deviceName),
      operator: String(operator),
      tokenHash: hashToken(token),
      registeredAt,
      revoked: false,
      revokedAt: null,
    };
    this.devices.set(deviceId, record);
    this._persist();
    return { deviceId, deviceName: record.deviceName, operator: record.operator, token, registeredAt };
  }

  /**
   * Revoke a device's token. Idempotent.
   * @param {string} deviceId
   * @returns {boolean} false when the device is unknown
   */
  revokeDevice(deviceId) {
    const record = this.devices.get(deviceId);
    if (!record) return false;
    if (!record.revoked) {
      record.revoked = true;
      record.revokedAt = new Date().toISOString();
      this._persist();
    }
    return true;
  }

  /**
   * Resolve a presented bearer token to its device, or null.
   *
   * Every registered device's hash is compared with timingSafeEqual over
   * fixed-length digests — no early-exit map lookup on secret material.
   *
   * @param {string | null} token
   * @returns {DeviceRecord | null}
   */
  authenticateDevice(token) {
    if (typeof token !== 'string' || token.length === 0) return null;
    const digest = crypto.createHash('sha256').update(token).digest();
    /** @type {DeviceRecord | null} */
    let matched = null;
    for (const record of this.devices.values()) {
      const stored = Buffer.from(record.tokenHash, 'hex');
      if (stored.length === digest.length && crypto.timingSafeEqual(digest, stored)) {
        matched = record; // keep scanning: uniform work regardless of position
      }
    }
    if (!matched || matched.revoked) return null;
    return matched;
  }

  /** @returns {number} count of registered, non-revoked devices */
  activeDeviceCount() {
    let n = 0;
    for (const record of this.devices.values()) if (!record.revoked) n += 1;
    return n;
  }
}
