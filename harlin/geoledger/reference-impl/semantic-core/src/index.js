/**
 * @file VectorIndex — brute-force exact cosine search over a packed
 * Float32Array matrix, plus persistence adapters.
 *
 * Scale envelope (why brute force is the right call here):
 *   GeoLedger's realistic ceiling is ~100k logged intervals per database.
 *   100,000 rows x 384 dims x 4 bytes = ~150 MB resident — fine on any
 *   logging laptop. A full exact scan is one fused dot-product loop over
 *   contiguous memory: ~40-80 ms for 100k x 384 on commodity hardware,
 *   i.e. interactive. Exact search also means zero recall loss — every
 *   result is reproducible, which matters for Competent Person sign-off.
 *   If a deployment ever outgrows this, the documented upgrade path is
 *   sqlite-vec as an optional native accelerator with identical semantics
 *   (see README); the API here does not change.
 *
 * File format (.glvec), written by {@link VectorIndex#save}:
 *   bytes 0-5   ASCII magic "GLVEC1"
 *   bytes 6-9   uint32 LE: header JSON byte length H
 *   bytes 10..  UTF-8 JSON header { dim, count, embedder, ids, metadata, savedAt }
 *   then        count * dim little-endian float32 values (raw vector block)
 *
 * @module index
 */

import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';

const MAGIC = 'GLVEC1';
const FORMAT_VERSION = 1;

/**
 * Cosine similarity between two equal-length vectors.
 * @param {Float32Array|number[]} a
 * @param {Float32Array|number[]} b
 * @returns {number} in [-1, 1]; 0 when either vector is zero
 */
export function cosine(a, b) {
  if (a.length !== b.length) throw new RangeError(`dim mismatch: ${a.length} vs ${b.length}`);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Persistence adapter interface (duck-typed):
 *   interface Store {
 *     write(buffer: Buffer): Promise<void>;
 *     read(): Promise<Buffer>;
 *   }
 */

/**
 * In-memory store — useful for tests and for snapshotting.
 * @implements {Store}
 */
export class MemoryStore {
  constructor() {
    /** @type {Buffer|null} */
    this.buffer = null;
  }

  /** @param {Buffer} buffer */
  async write(buffer) {
    this.buffer = Buffer.from(buffer); // defensive copy
  }

  /** @returns {Promise<Buffer>} */
  async read() {
    if (!this.buffer) throw new Error('MemoryStore is empty — nothing has been written');
    return this.buffer;
  }
}

/**
 * Single-file binary store. Writes atomically (temp file + rename) so a crash
 * mid-save never corrupts an existing index — important for the offline-first
 * guarantee that the app always boots with a usable index.
 * @implements {Store}
 */
export class FileStore {
  /** @param {string} filePath e.g. `<dbDir>/semantic/index.glvec` */
  constructor(filePath) {
    if (!filePath) throw new TypeError('FileStore requires a file path');
    this.filePath = filePath;
  }

  /** @param {Buffer} buffer */
  async write(buffer) {
    const dir = dirname(this.filePath);
    await mkdir(dir, { recursive: true });
    const tmp = join(dir, `.${randomBytes(6).toString('hex')}.glvec.tmp`);
    await writeFile(tmp, buffer);
    await rename(tmp, this.filePath);
  }

  /** @returns {Promise<Buffer>} */
  async read() {
    return readFile(this.filePath);
  }
}

/**
 * Exact (brute-force) cosine vector index over a packed Float32Array matrix.
 *
 * - add / addBatch / remove / search / size
 * - remove() is O(1): swap-with-last keeps the matrix packed
 * - search() is an exact linear scan (see scale envelope above)
 * - save(store) / VectorIndex.load(store) via the Store adapter interface
 */
export class VectorIndex {
  /**
   * @param {object} opts
   * @param {number} opts.dim vector dimensionality (must match the embedder)
   * @param {string} [opts.embedderName=''] recorded in the file header so the
   *   app can detect embedder/index mismatch on load
   * @param {number} [opts.initialCapacity=1024]
   */
  constructor({ dim, embedderName = '', initialCapacity = 1024 } = {}) {
    if (!Number.isInteger(dim) || dim <= 0) throw new RangeError(`dim must be a positive integer, got ${dim}`);
    /** @type {number} */
    this.dim = dim;
    /** @type {string} */
    this.embedderName = embedderName;
    this._capacity = Math.max(1, initialCapacity);
    this._count = 0;
    /** @type {Float32Array} packed row-major matrix, rows 0.._count-1 live */
    this._data = new Float32Array(this._capacity * dim);
    /** @type {Float64Array} cached L2 norm per row */
    this._norms = new Float64Array(this._capacity);
    /** @type {Array<string|number>} row -> id */
    this._ids = [];
    /** @type {object[]} row -> metadata */
    this._meta = [];
    /** @type {Map<string|number, number>} id -> row */
    this._rowOf = new Map();
  }

  /** @returns {number} number of vectors currently in the index */
  get size() {
    return this._count;
  }

  /** @param {string|number} id */
  has(id) {
    return this._rowOf.has(id);
  }

  /** @returns {Array<string|number>} all ids (row order, not sorted) */
  ids() {
    return this._ids.slice(0, this._count);
  }

  _grow(minCapacity) {
    let cap = this._capacity;
    while (cap < minCapacity) cap *= 2;
    if (cap === this._capacity) return;
    const data = new Float32Array(cap * this.dim);
    data.set(this._data.subarray(0, this._count * this.dim));
    const norms = new Float64Array(cap);
    norms.set(this._norms.subarray(0, this._count));
    this._data = data;
    this._norms = norms;
    this._capacity = cap;
  }

  _rowNorm(vector) {
    let ss = 0;
    for (let i = 0; i < vector.length; i++) ss += vector[i] * vector[i];
    return Math.sqrt(ss);
  }

  /**
   * Insert or overwrite (upsert) a vector.
   * @param {string|number} id
   * @param {Float32Array|number[]} vector length must equal this.dim
   * @param {object} [metadata={}] arbitrary JSON-serialisable metadata
   */
  add(id, vector, metadata = {}) {
    if (id === undefined || id === null) throw new TypeError('id is required');
    if (!vector || vector.length !== this.dim) {
      throw new RangeError(`vector length ${vector ? vector.length : 'null'} != index dim ${this.dim}`);
    }
    let row = this._rowOf.get(id);
    if (row === undefined) {
      this._grow(this._count + 1);
      row = this._count++;
      this._rowOf.set(id, row);
      this._ids[row] = id;
    }
    this._data.set(vector, row * this.dim);
    this._norms[row] = this._rowNorm(vector);
    this._meta[row] = metadata;
  }

  /**
   * @param {Array<{id: string|number, vector: Float32Array|number[], metadata?: object}>} entries
   */
  addBatch(entries) {
    for (const { id, vector, metadata } of entries) this.add(id, vector, metadata);
  }

  /**
   * Remove a vector by id. O(1) via swap-with-last.
   * @param {string|number} id
   * @returns {boolean} true if the id was present
   */
  remove(id) {
    const row = this._rowOf.get(id);
    if (row === undefined) return false;
    const last = this._count - 1;
    if (row !== last) {
      this._data.copyWithin(row * this.dim, last * this.dim, (last + 1) * this.dim);
      this._norms[row] = this._norms[last];
      const lastId = this._ids[last];
      this._ids[row] = lastId;
      this._meta[row] = this._meta[last];
      this._rowOf.set(lastId, row);
    }
    this._count = last;
    this._ids.length = last;
    this._meta.length = last;
    this._rowOf.delete(id);
    return true;
  }

  /**
   * Copy of the stored vector for an id (safe to mutate), or null.
   * @param {string|number} id
   * @returns {Float32Array|null}
   */
  getVector(id) {
    const row = this._rowOf.get(id);
    if (row === undefined) return null;
    return this._data.slice(row * this.dim, (row + 1) * this.dim);
  }

  /**
   * @param {string|number} id
   * @returns {object|null} stored metadata, or null if absent
   */
  getMetadata(id) {
    const row = this._rowOf.get(id);
    return row === undefined ? null : this._meta[row];
  }

  /**
   * Cosine similarity between a query vector and a single stored id.
   * @param {string|number} id
   * @param {Float32Array|number[]} vector
   * @returns {number|null} null if id is absent
   */
  similarity(id, vector) {
    const row = this._rowOf.get(id);
    if (row === undefined) return null;
    if (vector.length !== this.dim) throw new RangeError(`vector length ${vector.length} != dim ${this.dim}`);
    let dot = 0;
    let qss = 0;
    const off = row * this.dim;
    for (let i = 0; i < this.dim; i++) {
      dot += vector[i] * this._data[off + i];
      qss += vector[i] * vector[i];
    }
    const denom = Math.sqrt(qss) * this._norms[row];
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Exact top-k cosine search.
   * @param {Float32Array|number[]} vector query vector, length == dim
   * @param {object} [opts]
   * @param {number} [opts.k=10] number of results
   * @param {(metadata: object, id: string|number) => boolean} [opts.filter]
   *   metadata predicate applied BEFORE ranking (so k survivors are returned
   *   even under narrow filters)
   * @returns {Array<{id: string|number, score: number, metadata: object}>}
   *   sorted by score descending
   */
  search(vector, { k = 10, filter } = {}) {
    if (vector.length !== this.dim) throw new RangeError(`query length ${vector.length} != dim ${this.dim}`);
    let qss = 0;
    for (let i = 0; i < vector.length; i++) qss += vector[i] * vector[i];
    const qNorm = Math.sqrt(qss);
    if (qNorm === 0 || this._count === 0 || k <= 0) return [];

    // Bounded top-k: sorted insertion into a small array. k << count, so this
    // beats sorting the full score list.
    /** @type {Array<{id: string|number, score: number, metadata: object}>} */
    const top = [];
    const dim = this.dim;
    const data = this._data;
    for (let row = 0; row < this._count; row++) {
      const meta = this._meta[row];
      if (filter && !filter(meta, this._ids[row])) continue;
      const norm = this._norms[row];
      if (norm === 0) continue;
      let dot = 0;
      const off = row * dim;
      for (let i = 0; i < dim; i++) dot += vector[i] * data[off + i];
      const score = dot / (qNorm * norm);
      if (top.length < k) {
        top.push({ id: this._ids[row], score, metadata: meta });
        if (top.length === k) top.sort((a, b) => b.score - a.score);
      } else if (score > top[k - 1].score) {
        // insert in order
        let lo = 0;
        while (lo < k && top[lo].score >= score) lo++;
        top.splice(lo, 0, { id: this._ids[row], score, metadata: meta });
        top.pop();
      }
    }
    if (top.length < k) top.sort((a, b) => b.score - a.score);
    return top;
  }

  /**
   * Serialise the index to a Store (see file format at top of module).
   * Vector bytes round-trip exactly.
   * @param {Store} store
   * @returns {Promise<void>}
   */
  async save(store) {
    const header = {
      format: MAGIC,
      version: FORMAT_VERSION,
      dim: this.dim,
      count: this._count,
      embedder: this.embedderName,
      ids: this._ids.slice(0, this._count),
      metadata: this._meta.slice(0, this._count),
      savedAt: new Date().toISOString(),
    };
    const headerBuf = Buffer.from(JSON.stringify(header), 'utf8');
    const preamble = Buffer.alloc(MAGIC.length + 4);
    preamble.write(MAGIC, 0, 'ascii');
    preamble.writeUInt32LE(headerBuf.length, MAGIC.length);
    // Copy the live rows into a tight little-endian float block.
    const live = this._data.slice(0, this._count * this.dim);
    const floatBuf = Buffer.from(live.buffer, live.byteOffset, live.byteLength);
    await store.write(Buffer.concat([preamble, headerBuf, floatBuf]));
  }

  /**
   * Load an index previously written by {@link VectorIndex#save}.
   * @param {Store} store
   * @returns {Promise<VectorIndex>}
   */
  static async load(store) {
    const buf = await store.read();
    if (buf.length < MAGIC.length + 4 || buf.toString('ascii', 0, MAGIC.length) !== MAGIC) {
      throw new Error('Not a GLVEC index file (bad magic)');
    }
    const headerLen = buf.readUInt32LE(MAGIC.length);
    const headerStart = MAGIC.length + 4;
    const header = JSON.parse(buf.toString('utf8', headerStart, headerStart + headerLen));
    if (header.version !== FORMAT_VERSION) {
      throw new Error(`Unsupported GLVEC version ${header.version} (this build reads v${FORMAT_VERSION})`);
    }
    const { dim, count, ids, metadata, embedder } = header;
    const floatStart = headerStart + headerLen;
    const byteLen = count * dim * 4;
    if (buf.length < floatStart + byteLen) throw new Error('GLVEC file truncated: vector block incomplete');

    const idx = new VectorIndex({ dim, embedderName: embedder ?? '', initialCapacity: Math.max(1, count) });
    // Copy into an aligned buffer (Buffer slices may be misaligned for Float32Array views).
    const aligned = new Uint8Array(byteLen);
    aligned.set(buf.subarray(floatStart, floatStart + byteLen));
    const floats = new Float32Array(aligned.buffer);
    idx._grow(count);
    idx._data.set(floats);
    idx._count = count;
    for (let row = 0; row < count; row++) {
      idx._ids[row] = ids[row];
      idx._meta[row] = metadata[row] ?? {};
      idx._rowOf.set(ids[row], row);
      idx._norms[row] = idx._rowNorm(floats.subarray(row * dim, (row + 1) * dim));
    }
    return idx;
  }
}
