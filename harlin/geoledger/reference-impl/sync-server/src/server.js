/**
 * GeoLedger Sync Server ("GL Relay") — HTTP API.
 *
 * A durable, ordered, authenticated relay for GeoLedger changesets and
 * field photos. It replaces OneDrive/SharePoint folder sync as the
 * transport; it does NOT interpret changeset contents (merge semantics
 * are row-level last-write-wins, applied client-side).
 *
 * API (all JSON unless noted; bearer auth unless noted):
 *   GET  /api/v1/health                             no auth
 *   POST /api/v1/devices/register                   admin
 *   POST /api/v1/devices/revoke                     admin
 *   POST /api/v1/changesets                         device
 *   GET  /api/v1/changesets?since=&limit=&excludeDevice=&waitMs=   device
 *   POST /api/v1/photos/<holeId>/<filename>         device, raw body
 *   GET  /api/v1/photos/<holeId>                    device
 *   GET  /api/v1/photos/<holeId>/<filename>         device, streamed
 *   GET  /api/v1/audit?since=&limit=                admin
 *
 * Zero runtime dependencies (node:http, node:https, node:crypto).
 */

import http from 'node:http';
import https from 'node:https';

import { Auth } from './auth.js';
import { Storage, StorageError, isSafeName, sha256Hex } from './storage.js';

/** Hard ceiling on long-poll wait, ms. */
const MAX_WAIT_MS = 60_000;
/** Default page size for GET /changesets. */
const DEFAULT_LIMIT = 100;
/** Max page size for GET /changesets and /audit. */
const MAX_LIMIT = 1000;

/** HTTP error carrying status + machine-readable code. */
export class HttpError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   */
  constructor(status, code, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

/**
 * In-memory token bucket per client IP. Deliberately simple: the relay
 * serves a known fleet (≤ 50 devices), so this only has to blunt runaway
 * clients and unauthenticated scanning, not survive a distributed DoS
 * (that is the reverse proxy's job — see SECURITY.md).
 */
class RateLimiter {
  /**
   * @param {{ capacity?: number, refillPerSecond?: number }} [opts]
   */
  constructor({ capacity = 300, refillPerSecond = 60 } = {}) {
    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
    /** @type {Map<string, { tokens: number, last: number }>} */
    this.buckets = new Map();
  }

  /**
   * @param {string} ip
   * @returns {boolean} true when the request may proceed
   */
  allow(ip) {
    if (this.capacity <= 0) return true; // limiter disabled
    const now = Date.now();
    let bucket = this.buckets.get(ip);
    if (!bucket) {
      if (this.buckets.size > 10_000) this.buckets.clear(); // bounded memory
      bucket = { tokens: this.capacity, last: now };
      this.buckets.set(ip, bucket);
    }
    bucket.tokens = Math.min(this.capacity, bucket.tokens + ((now - bucket.last) / 1000) * this.refillPerSecond);
    bucket.last = now;
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }
    return false;
  }
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {unknown} body
 */
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  });
  res.end(payload);
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @returns {string | null} bearer token, if any
 */
function bearerToken(req) {
  const header = req.headers.authorization ?? '';
  const match = /^Bearer\s+(\S+)$/.exec(header);
  return match ? match[1] : null;
}

/**
 * Collect a request body with a hard size cap.
 * @param {import('node:http').IncomingMessage} req
 * @param {number} maxBytes
 * @returns {Promise<Buffer>}
 */
function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers['content-length']);
    if (Number.isFinite(declared) && declared > maxBytes) {
      req.resume();
      reject(new HttpError(413, 'BODY_TOO_LARGE', `body exceeds limit of ${maxBytes} bytes`));
      return;
    }
    /** @type {Buffer[] | null} */
    let chunks = [];
    let size = 0;
    let settled = false;
    req.on('data', (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > maxBytes) {
        settled = true;
        chunks = null;
        req.resume();
        reject(new HttpError(413, 'BODY_TOO_LARGE', `body exceeds limit of ${maxBytes} bytes`));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!settled) resolve(Buffer.concat(/** @type {Buffer[]} */ (chunks)));
    });
    req.on('error', (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });
  });
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {number} maxBytes
 * @returns {Promise<any>} parsed JSON body (object expected)
 */
async function readJsonBody(req, maxBytes) {
  const raw = await readBody(req, maxBytes);
  try {
    return JSON.parse(raw.toString('utf8'));
  } catch {
    throw new HttpError(400, 'BAD_JSON', 'request body is not valid JSON');
  }
}

/**
 * Parse a non-negative integer query param with bounds.
 * @param {URLSearchParams} params
 * @param {string} name
 * @param {number} fallback
 * @param {number} max
 * @returns {number}
 */
function intParam(params, name, fallback, max) {
  const raw = params.get(name);
  if (raw === null || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new HttpError(400, 'BAD_PARAM', `query parameter '${name}' must be a non-negative integer`);
  }
  return Math.min(n, max);
}

/** @param {string} ext */
function photoContentType(ext) {
  return (
    {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.heic': 'image/heic',
      '.gif': 'image/gif',
    }[ext.toLowerCase()] ?? 'application/octet-stream'
  );
}

/**
 * @typedef {object} SyncServerOptions
 * @property {string} dataDir            storage directory (created if missing)
 * @property {string | null} [adminToken] plaintext admin token; auto-generated when omitted
 * @property {number} [maxBodyBytes]     request body cap, default 25 MiB
 * @property {{ capacity?: number, refillPerSecond?: number }} [rateLimit]
 * @property {{ cert: string | Buffer, key: string | Buffer } | null} [tls]
 *   PEM contents; when set the server speaks HTTPS (node:https)
 * @property {boolean} [quiet]           suppress the one-time generated-admin-token print
 */

/**
 * @typedef {object} SyncServerHandle
 * @property {import('node:http').Server} server
 * @property {Storage} storage
 * @property {Auth} auth
 * @property {string} adminToken
 * @property {(port?: number, host?: string) => Promise<{ port: number, address: string }>} listen
 * @property {() => Promise<void>} close
 */

/**
 * Create a GL Relay instance (not yet listening).
 *
 * @param {SyncServerOptions} options
 * @returns {SyncServerHandle}
 */
export function createSyncServer(options) {
  const {
    dataDir,
    adminToken = null,
    maxBodyBytes = 25 * 1024 * 1024,
    rateLimit = {},
    tls = null,
    quiet = false,
  } = options;
  if (!dataDir) throw new Error('createSyncServer: options.dataDir is required');

  const storage = new Storage(dataDir);
  const auth = new Auth({ dataDir, adminToken });
  const limiter = new RateLimiter(rateLimit);
  const startedAt = Date.now();

  if (auth.adminTokenGenerated && !quiet) {
    // Printed exactly once per boot; the token itself is never persisted.
    console.log(`[gl-sync-server] generated admin token (set GL_ADMIN_TOKEN to pin it): ${auth.adminToken}`);
  }

  /** @param {import('node:http').IncomingMessage} req */
  function requireAdmin(req) {
    if (!auth.verifyAdmin(bearerToken(req))) {
      throw new HttpError(401, 'UNAUTHORIZED', 'valid admin bearer token required');
    }
  }

  /**
   * @param {import('node:http').IncomingMessage} req
   * @returns {import('./auth.js').DeviceRecord}
   */
  function requireDevice(req) {
    const device = auth.authenticateDevice(bearerToken(req));
    if (!device) {
      throw new HttpError(401, 'UNAUTHORIZED', 'valid device bearer token required');
    }
    return device;
  }

  /**
   * @param {import('node:http').IncomingMessage} req
   * @param {import('node:http').ServerResponse} res
   */
  async function route(req, res) {
    /** @type {URL} */
    let url;
    try {
      url = new URL(/** @type {string} */ (req.url), 'http://relay.invalid');
    } catch {
      throw new HttpError(400, 'BAD_URL', 'malformed request URL');
    }
    const { pathname, searchParams } = url;
    const method = req.method ?? 'GET';

    // ------------------------------------------------------------- health
    if (pathname === '/api/v1/health') {
      if (method !== 'GET') throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'use GET');
      sendJson(res, 200, {
        ok: true,
        seq: storage.maxSeq,
        devices: auth.activeDeviceCount(),
        uptime: Math.floor((Date.now() - startedAt) / 1000),
      });
      return;
    }

    // ------------------------------------------------------------ devices
    if (pathname === '/api/v1/devices/register') {
      if (method !== 'POST') throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'use POST');
      requireAdmin(req);
      const body = await readJsonBody(req, maxBodyBytes);
      if (!isSafeName(body?.deviceId)) {
        throw new HttpError(400, 'BAD_DEVICE_ID', 'deviceId must match ^[A-Za-z0-9._-]+$ with no leading dot');
      }
      const result = auth.registerDevice({
        deviceId: body.deviceId,
        deviceName: body.deviceName ?? '',
        operator: body.operator ?? '',
      });
      sendJson(res, 201, result);
      return;
    }

    if (pathname === '/api/v1/devices/revoke') {
      if (method !== 'POST') throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'use POST');
      requireAdmin(req);
      const body = await readJsonBody(req, maxBodyBytes);
      if (!isSafeName(body?.deviceId)) {
        throw new HttpError(400, 'BAD_DEVICE_ID', 'deviceId must match ^[A-Za-z0-9._-]+$ with no leading dot');
      }
      if (!auth.revokeDevice(body.deviceId)) {
        throw new HttpError(404, 'UNKNOWN_DEVICE', `device '${body.deviceId}' is not registered`);
      }
      sendJson(res, 200, { deviceId: body.deviceId, revoked: true });
      return;
    }

    // --------------------------------------------------------- changesets
    if (pathname === '/api/v1/changesets') {
      if (method === 'POST') {
        const device = requireDevice(req);
        const body = await readJsonBody(req, maxBodyBytes);
        if (!isSafeName(body?.changesetId)) {
          throw new HttpError(400, 'BAD_CHANGESET_ID', 'changesetId must match ^[A-Za-z0-9._-]+$ with no leading dot');
        }
        if (!isSafeName(body?.deviceId)) {
          throw new HttpError(400, 'BAD_DEVICE_ID', 'deviceId must match ^[A-Za-z0-9._-]+$ with no leading dot');
        }
        if (body.deviceId !== device.deviceId) {
          throw new HttpError(403, 'DEVICE_MISMATCH', `token belongs to '${device.deviceId}', not '${body.deviceId}'`);
        }
        if (typeof body.schemaVersion !== 'string' && typeof body.schemaVersion !== 'number') {
          throw new HttpError(400, 'BAD_SCHEMA_VERSION', 'schemaVersion (string or number) is required');
        }
        if (!('payload' in body)) {
          throw new HttpError(400, 'MISSING_PAYLOAD', 'payload is required');
        }
        const result = storage.appendChangeset({
          changesetId: body.changesetId,
          deviceId: body.deviceId,
          schemaVersion: body.schemaVersion,
          payload: body.payload,
        });
        sendJson(res, result.duplicate ? 200 : 201, result);
        return;
      }

      if (method === 'GET') {
        requireDevice(req);
        const since = intParam(searchParams, 'since', 0, Number.MAX_SAFE_INTEGER);
        const limit = Math.max(1, intParam(searchParams, 'limit', DEFAULT_LIMIT, MAX_LIMIT));
        const excludeDevice = searchParams.get('excludeDevice');
        const waitMs = Math.min(intParam(searchParams, 'waitMs', 0, MAX_WAIT_MS), MAX_WAIT_MS);

        let page = storage.listChangesets({ since, limit, excludeDevice });
        if (page.items.length === 0 && page.nextSince === since && waitMs > 0) {
          // Event-driven long-poll: park until a new changeset lands or the
          // wait window closes; also released by client abort / shutdown.
          let aborted = false;
          const onAbort = () => {
            aborted = true;
          };
          req.on('close', onAbort);
          await storage.waitForChange(since, waitMs);
          req.off('close', onAbort);
          if (aborted || res.writableEnded || storage.closed) {
            res.destroy();
            return;
          }
          page = storage.listChangesets({ since, limit, excludeDevice });
        }
        sendJson(res, 200, page);
        return;
      }

      throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'use GET or POST');
    }

    // -------------------------------------------------------------- audit
    if (pathname === '/api/v1/audit') {
      if (method !== 'GET') throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'use GET');
      requireAdmin(req);
      const since = intParam(searchParams, 'since', 0, Number.MAX_SAFE_INTEGER);
      const limit = Math.max(1, intParam(searchParams, 'limit', MAX_LIMIT, MAX_LIMIT));
      sendJson(res, 200, storage.listAudit({ since, limit }));
      return;
    }

    // ------------------------------------------------------------- photos
    const photoMatch = /^\/api\/v1\/photos\/([^/]+)(?:\/([^/]+))?$/.exec(pathname);
    if (photoMatch) {
      /** @type {string} */
      let holeId;
      /** @type {string | undefined} */
      let filename;
      try {
        holeId = decodeURIComponent(photoMatch[1]);
        filename = photoMatch[2] === undefined ? undefined : decodeURIComponent(photoMatch[2]);
      } catch {
        throw new HttpError(400, 'BAD_NAME', 'malformed percent-encoding in path');
      }
      if (!isSafeName(holeId) || (filename !== undefined && !isSafeName(filename))) {
        throw new HttpError(400, 'BAD_NAME', 'holeId and filename must match ^[A-Za-z0-9._-]+$ with no leading dot');
      }

      requireDevice(req);

      if (filename === undefined) {
        // Manifest for a hole.
        if (method !== 'GET') throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'use GET');
        sendJson(res, 200, storage.listPhotos(holeId));
        return;
      }

      if (method === 'POST') {
        const declaredSha = String(req.headers['content-sha256'] ?? '').toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(declaredSha)) {
          throw new HttpError(400, 'MISSING_SHA256', 'Content-SHA256 header (hex sha256 of the body) is required');
        }
        const body = await readBody(req, maxBodyBytes);
        const actualSha = sha256Hex(body);
        if (actualSha !== declaredSha) {
          throw new HttpError(
            400,
            'SHA256_BODY_MISMATCH',
            `Content-SHA256 (${declaredSha}) does not match received body (${actualSha}) — retry the upload`,
          );
        }
        const result = storage.storePhoto(holeId, filename, body);
        sendJson(res, result.duplicate ? 200 : 201, result);
        return;
      }

      if (method === 'GET') {
        const photo = storage.openPhoto(holeId, filename);
        if (!photo) throw new HttpError(404, 'NOT_FOUND', `no photo ${holeId}/${filename}`);
        res.writeHead(200, {
          'content-type': photoContentType(filename.slice(filename.lastIndexOf('.'))),
          'content-length': photo.size,
          'content-sha256': photo.sha256,
          'cache-control': 'no-store',
        });
        photo.stream.pipe(res);
        photo.stream.on('error', () => res.destroy());
        return;
      }

      throw new HttpError(405, 'METHOD_NOT_ALLOWED', 'use GET or POST');
    }

    throw new HttpError(404, 'NOT_FOUND', `no route for ${method} ${pathname}`);
  }

  /**
   * @param {import('node:http').IncomingMessage} req
   * @param {import('node:http').ServerResponse} res
   */
  async function handle(req, res) {
    const ip = req.socket.remoteAddress ?? 'unknown';
    try {
      if (!limiter.allow(ip)) {
        res.setHeader('retry-after', '1');
        throw new HttpError(429, 'RATE_LIMITED', 'too many requests from this address');
      }
      await route(req, res);
    } catch (err) {
      if (res.headersSent) {
        res.destroy();
        return;
      }
      if (err instanceof HttpError || err instanceof StorageError) {
        sendJson(res, err.status, { error: { code: err.code, message: err.message } });
        return;
      }
      console.error('[gl-sync-server] internal error:', err);
      sendJson(res, 500, { error: { code: 'INTERNAL', message: 'internal server error' } });
    }
  }

  const server = tls
    ? https.createServer({ cert: tls.cert, key: tls.key }, handle)
    : http.createServer(handle);
  // Long-polls may legitimately hold a request open for up to MAX_WAIT_MS.
  server.requestTimeout = MAX_WAIT_MS + 30_000;
  server.headersTimeout = 30_000;

  return {
    server,
    storage,
    auth,
    adminToken: auth.adminToken,

    /**
     * @param {number} [port] 0 → ephemeral
     * @param {string} [host]
     */
    listen(port = 0, host = '127.0.0.1') {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, host, () => {
          const addr = /** @type {import('node:net').AddressInfo} */ (server.address());
          resolve({ port: addr.port, address: addr.address });
        });
      });
    },

    /** Graceful shutdown: release long-polls, drop connections, close storage. */
    close() {
      return new Promise((resolve) => {
        storage.close(); // wakes long-poll waiters so responses flush
        server.close(() => resolve());
        // Node >= 18.2: force-close anything still open (keep-alive sockets).
        server.closeAllConnections?.();
      });
    },
  };
}
