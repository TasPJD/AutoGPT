/**
 * GeoLedger Sync Server — file-backed, crash-safe storage.
 *
 * Layout under `<dataDir>`:
 *   fleet.json                          device registry (owned by auth.js)
 *   seq                                 persisted global sequence counter
 *   index.jsonl                         one line per accepted changeset
 *   changesets/<seq>_<changesetId>.json full changeset records
 *   photos/<holeId>/<filename>          field-original photos (never overwritten)
 *   tmp/                                staging area for atomic writes
 *
 * Durability discipline: every accepted artifact is written to a temp file,
 * fsync'd, renamed into place, and the containing directory is fsync'd
 * (best-effort — some filesystems reject directory fsync). The sequence
 * counter is persisted the same way, and on startup the counter is recovered
 * as max(counter file, index tail, changesets directory scan) so a crash at
 * any point can never re-issue a sequence number.
 *
 * The server does NOT interpret changeset payloads — merge semantics are
 * row-level last-write-wins applied client-side. This module only provides
 * a total order (`seq`) and integrity hashes.
 *
 * Zero runtime dependencies (node:fs, node:path, node:crypto, node:events).
 */

import { EventEmitter } from 'node:events';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** Width of the zero-padded seq prefix in changeset filenames. */
const SEQ_PAD = 12;

/**
 * Strict safe-name check for anything that becomes a path segment
 * (holeId, filename, changesetId, deviceId). Alphanumerics plus `.`, `_`,
 * `-`; no leading dot (blocks dotfiles, `.`, `..` and hence traversal);
 * bounded length.
 *
 * @param {unknown} name
 * @returns {boolean}
 */
export function isSafeName(name) {
  return (
    typeof name === 'string' &&
    name.length >= 1 &&
    name.length <= 200 &&
    !name.startsWith('.') &&
    /^[A-Za-z0-9._-]+$/.test(name)
  );
}

/**
 * @param {Buffer | string} data
 * @returns {string} lowercase hex sha256
 */
export function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * fsync a directory so a preceding rename() is durable. Best-effort:
 * some platforms/filesystems do not support opening directories for sync.
 *
 * @param {string} dir
 */
function fsyncDirSync(dir) {
  try {
    const fd = fs.openSync(dir, 'r');
    try {
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    /* best-effort */
  }
}

/**
 * Crash-safe file write: temp file in `tmpDir` → write → fsync → rename →
 * fsync parent dir. Readers never observe a partial file.
 *
 * @param {string} finalPath
 * @param {Buffer | string} data
 * @param {string} tmpDir
 */
function writeFileAtomicSync(finalPath, data, tmpDir) {
  const tmpPath = path.join(tmpDir, `w-${crypto.randomUUID()}`);
  const fd = fs.openSync(tmpPath, 'w');
  try {
    fs.writeSync(fd, typeof data === 'string' ? Buffer.from(data) : data);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmpPath, finalPath);
  fsyncDirSync(path.dirname(finalPath));
}

/**
 * @typedef {object} IndexEntry
 * @property {number} seq            server-assigned strictly monotonic sequence
 * @property {string} changesetId    client-generated id (idempotency key)
 * @property {string} deviceId       originating device
 * @property {string | number} schemaVersion GeoLedger schema version of the payload
 * @property {string} sha256         hex sha256 of the JSON-serialized payload
 * @property {string} receivedAt     ISO-8601 server receive time
 * @property {number} size           bytes of the stored changeset record
 */

/**
 * @typedef {object} AppendResult
 * @property {number} seq
 * @property {string} changesetId
 * @property {string} sha256
 * @property {boolean} duplicate     true when this changesetId was already stored
 */

/** Error with a machine code + suggested HTTP status, thrown by storage ops. */
export class StorageError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   */
  constructor(status, code, message) {
    super(message);
    this.name = 'StorageError';
    this.status = status;
    this.code = code;
  }
}

/**
 * File-backed changeset log + photo store.
 *
 * Emits: `'changeset'` (IndexEntry) after each newly accepted changeset,
 * `'close'` when the store shuts down (used to release long-poll waiters).
 */
export class Storage extends EventEmitter {
  /**
   * @param {string} dataDir directory to own; created if missing
   */
  constructor(dataDir) {
    super();
    // Long-poll waiters can exceed the default listener cap; that is expected.
    this.setMaxListeners(0);

    /** @type {string} */
    this.dataDir = path.resolve(dataDir);
    /** @type {string} */
    this.changesetsDir = path.join(this.dataDir, 'changesets');
    /** @type {string} */
    this.photosDir = path.join(this.dataDir, 'photos');
    /** @type {string} */
    this.tmpDir = path.join(this.dataDir, 'tmp');
    /** @type {string} */
    this.seqPath = path.join(this.dataDir, 'seq');
    /** @type {string} */
    this.indexPath = path.join(this.dataDir, 'index.jsonl');

    for (const dir of [this.dataDir, this.changesetsDir, this.photosDir, this.tmpDir]) {
      fs.mkdirSync(dir, { recursive: true });
    }

    /** @type {IndexEntry[]} in-memory index, ordered by seq */
    this.index = [];
    /** @type {Map<string, IndexEntry>} changesetId → entry (idempotency) */
    this.byChangesetId = new Map();
    /** @type {Map<string, string>} "holeId/filename" → sha256 (photo hash cache) */
    this.photoShaCache = new Map();
    /** @type {number} highest sequence number ever issued */
    this.seq = 0;
    /** @type {number | null} append fd for index.jsonl, opened lazily */
    this._indexFd = null;
    /** @type {boolean} */
    this.closed = false;

    this._recover();
  }

  /**
   * Recover in-memory state from disk. Tolerates a torn trailing index line
   * (crash mid-append): such a line was never acknowledged to any client,
   * so dropping it is safe — the client will re-upload idempotently.
   */
  _recover() {
    let maxSeq = 0;

    // 1. Persisted counter.
    try {
      const n = Number.parseInt(fs.readFileSync(this.seqPath, 'utf8').trim(), 10);
      if (Number.isSafeInteger(n) && n > maxSeq) maxSeq = n;
    } catch {
      /* first boot */
    }

    // 2. Index log.
    let raw = '';
    try {
      raw = fs.readFileSync(this.indexPath, 'utf8');
    } catch {
      /* first boot */
    }
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      /** @type {IndexEntry} */
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue; // torn/corrupt line — never acknowledged, safe to drop
      }
      if (!Number.isSafeInteger(entry.seq) || typeof entry.changesetId !== 'string') continue;
      this.index.push(entry);
      this.byChangesetId.set(entry.changesetId, entry);
      if (entry.seq > maxSeq) maxSeq = entry.seq;
    }
    this.index.sort((a, b) => a.seq - b.seq);

    // 3. Changesets directory scan — covers a crash after the changeset file
    //    rename but before the index append: that seq must not be re-issued.
    for (const name of fs.readdirSync(this.changesetsDir)) {
      const m = /^(\d+)_/.exec(name);
      if (!m) continue;
      const n = Number.parseInt(m[1], 10);
      if (Number.isSafeInteger(n) && n > maxSeq) maxSeq = n;
    }

    this.seq = maxSeq;
  }

  /** @returns {number} highest issued sequence number */
  get maxSeq() {
    return this.seq;
  }

  /** @returns {number} count of accepted changesets */
  get changesetCount() {
    return this.index.length;
  }

  /** Persist the sequence counter (temp + rename + fsync). */
  _persistSeq() {
    writeFileAtomicSync(this.seqPath, `${this.seq}\n`, this.tmpDir);
  }

  /**
   * Append one line to index.jsonl and fsync it.
   * @param {IndexEntry} entry
   */
  _appendIndexLine(entry) {
    if (this._indexFd === null) {
      this._indexFd = fs.openSync(this.indexPath, 'a');
    }
    fs.writeSync(this._indexFd, `${JSON.stringify(entry)}\n`);
    fs.fsyncSync(this._indexFd);
  }

  /**
   * Accept a changeset. Idempotent on `changesetId`: replays return the
   * originally assigned seq with `duplicate: true`.
   *
   * @param {{ changesetId: string, deviceId: string, schemaVersion: string | number, payload: unknown }} input
   * @returns {AppendResult}
   */
  appendChangeset({ changesetId, deviceId, schemaVersion, payload }) {
    if (this.closed) throw new StorageError(503, 'SHUTTING_DOWN', 'storage is closed');

    const existing = this.byChangesetId.get(changesetId);
    if (existing) {
      return {
        seq: existing.seq,
        changesetId: existing.changesetId,
        sha256: existing.sha256,
        duplicate: true,
      };
    }

    const payloadJson = JSON.stringify(payload);
    const sha256 = sha256Hex(payloadJson);
    const seq = this.seq + 1;
    const record = { seq, changesetId, deviceId, schemaVersion, sha256, payload };
    const body = JSON.stringify(record);
    const fileName = `${String(seq).padStart(SEQ_PAD, '0')}_${changesetId}.json`;

    // Durable write order: changeset file → index line → counter. A crash
    // between any two steps is recovered by _recover() without ever
    // re-issuing a seq or acknowledging data that is not on disk.
    writeFileAtomicSync(path.join(this.changesetsDir, fileName), body, this.tmpDir);

    /** @type {IndexEntry} */
    const entry = {
      seq,
      changesetId,
      deviceId,
      schemaVersion,
      sha256,
      receivedAt: new Date().toISOString(),
      size: Buffer.byteLength(body),
    };
    this._appendIndexLine(entry);

    this.seq = seq;
    this._persistSeq();

    this.index.push(entry);
    this.byChangesetId.set(changesetId, entry);
    this.emit('changeset', entry);

    return { seq, changesetId, sha256, duplicate: false };
  }

  /**
   * Read the stored record (including payload) for an index entry.
   * @param {IndexEntry} entry
   * @returns {{ seq: number, changesetId: string, deviceId: string, schemaVersion: string | number, sha256: string, payload: unknown }}
   */
  readChangeset(entry) {
    const fileName = `${String(entry.seq).padStart(SEQ_PAD, '0')}_${entry.changesetId}.json`;
    return JSON.parse(fs.readFileSync(path.join(this.changesetsDir, fileName), 'utf8'));
  }

  /**
   * Ordered retrieval for the client download loop.
   *
   * `nextSince` always advances past every scanned entry (including entries
   * skipped by `excludeDevice`), so a client cursor never stalls on its own
   * uploads.
   *
   * @param {{ since?: number, limit?: number, excludeDevice?: string | null, withPayload?: boolean }} [opts]
   * @returns {{ items: object[], nextSince: number, more: boolean }}
   */
  listChangesets({ since = 0, limit = 100, excludeDevice = null, withPayload = true } = {}) {
    const items = [];
    let nextSince = since;
    for (const entry of this.index) {
      if (entry.seq <= since) continue;
      nextSince = entry.seq;
      if (excludeDevice !== null && entry.deviceId === excludeDevice) continue;
      items.push(withPayload ? this.readChangeset(entry) : { ...entry });
      if (items.length >= limit) break;
    }
    return { items, nextSince, more: nextSince < this.seq };
  }

  /**
   * Audit view: raw index entries (no payloads).
   *
   * @param {{ since?: number, limit?: number }} [opts]
   * @returns {{ items: IndexEntry[], nextSince: number, more: boolean }}
   */
  listAudit({ since = 0, limit = 1000 } = {}) {
    const items = [];
    let nextSince = since;
    for (const entry of this.index) {
      if (entry.seq <= since) continue;
      items.push({ ...entry });
      nextSince = entry.seq;
      if (items.length >= limit) break;
    }
    return { items, nextSince, more: nextSince < this.seq };
  }

  /**
   * Long-poll support: resolve `true` as soon as any seq > `since` exists
   * (immediately if it already does), `false` on timeout or storage close.
   * Purely event-driven — no polling loop.
   *
   * @param {number} since
   * @param {number} waitMs
   * @returns {Promise<boolean>}
   */
  waitForChange(since, waitMs) {
    if (this.seq > since || this.closed || waitMs <= 0) {
      return Promise.resolve(this.seq > since);
    }
    return new Promise((resolve) => {
      /** @type {NodeJS.Timeout} */
      let timer;
      const settle = (/** @type {boolean} */ value) => {
        clearTimeout(timer);
        this.off('changeset', onChange);
        this.off('close', onClose);
        resolve(value);
      };
      const onChange = () => settle(true);
      const onClose = () => settle(false);
      timer = setTimeout(() => settle(false), waitMs);
      this.on('changeset', onChange);
      this.on('close', onClose);
    });
  }

  // ---------------------------------------------------------------- photos

  /**
   * Absolute path for a photo after validating both segments.
   * @param {string} holeId
   * @param {string} filename
   * @returns {string}
   */
  _photoPath(holeId, filename) {
    if (!isSafeName(holeId) || !isSafeName(filename)) {
      throw new StorageError(400, 'BAD_NAME', 'holeId and filename must match ^[A-Za-z0-9._-]+$ with no leading dot');
    }
    return path.join(this.photosDir, holeId, filename);
  }

  /**
   * sha256 of a photo already on disk, cached in memory.
   * @param {string} holeId
   * @param {string} filename
   * @param {string} filePath
   * @returns {string}
   */
  _photoSha(holeId, filename, filePath) {
    const key = `${holeId}/${filename}`;
    let sha = this.photoShaCache.get(key);
    if (!sha) {
      sha = sha256Hex(fs.readFileSync(filePath));
      this.photoShaCache.set(key, sha);
    }
    return sha;
  }

  /**
   * Store a photo. Photos are field originals: an existing file is NEVER
   * overwritten. Same (holeId, filename, sha256) → idempotent success;
   * same name but different content → 409 conflict.
   *
   * @param {string} holeId
   * @param {string} filename
   * @param {Buffer} body
   * @returns {{ holeId: string, filename: string, sha256: string, size: number, duplicate: boolean }}
   */
  storePhoto(holeId, filename, body) {
    if (this.closed) throw new StorageError(503, 'SHUTTING_DOWN', 'storage is closed');
    const filePath = this._photoPath(holeId, filename);
    const sha256 = sha256Hex(body);

    if (fs.existsSync(filePath)) {
      const existingSha = this._photoSha(holeId, filename, filePath);
      if (existingSha === sha256) {
        return { holeId, filename, sha256, size: body.length, duplicate: true };
      }
      throw new StorageError(
        409,
        'PHOTO_CONFLICT',
        `photo ${holeId}/${filename} already exists with different content (existing sha256 ${existingSha}); photos are never overwritten`,
      );
    }

    fs.mkdirSync(path.join(this.photosDir, holeId), { recursive: true });
    writeFileAtomicSync(filePath, body, this.tmpDir);
    this.photoShaCache.set(`${holeId}/${filename}`, sha256);
    return { holeId, filename, sha256, size: body.length, duplicate: false };
  }

  /**
   * Manifest of all photos for a hole. Unknown hole → empty manifest
   * (idempotent client sync-friendliness).
   *
   * @param {string} holeId
   * @returns {{ holeId: string, photos: Array<{ filename: string, size: number, sha256: string, modifiedAt: string }> }}
   */
  listPhotos(holeId) {
    if (!isSafeName(holeId)) {
      throw new StorageError(400, 'BAD_NAME', 'holeId must match ^[A-Za-z0-9._-]+$ with no leading dot');
    }
    const dir = path.join(this.photosDir, holeId);
    /** @type {string[]} */
    let names = [];
    try {
      names = fs.readdirSync(dir);
    } catch {
      return { holeId, photos: [] };
    }
    const photos = [];
    for (const name of names.sort()) {
      if (!isSafeName(name)) continue; // never expose dotfiles/temp junk
      const filePath = path.join(dir, name);
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;
      photos.push({
        filename: name,
        size: stat.size,
        sha256: this._photoSha(holeId, name, filePath),
        modifiedAt: stat.mtime.toISOString(),
      });
    }
    return { holeId, photos };
  }

  /**
   * Open a read stream for a stored photo, or null if absent.
   * @param {string} holeId
   * @param {string} filename
   * @returns {{ stream: fs.ReadStream, size: number, sha256: string } | null}
   */
  openPhoto(holeId, filename) {
    const filePath = this._photoPath(holeId, filename);
    /** @type {fs.Stats} */
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      return null;
    }
    if (!stat.isFile()) return null;
    return {
      stream: fs.createReadStream(filePath),
      size: stat.size,
      sha256: this._photoSha(holeId, filename, filePath),
    };
  }

  /** Release resources and wake any long-poll waiters. */
  close() {
    if (this.closed) return;
    this.closed = true;
    this.emit('close');
    if (this._indexFd !== null) {
      try {
        fs.closeSync(this._indexFd);
      } catch {
        /* already closed */
      }
      this._indexFd = null;
    }
  }
}
