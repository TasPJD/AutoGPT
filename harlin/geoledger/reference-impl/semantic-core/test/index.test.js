import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { VectorIndex, FileStore, MemoryStore, cosine } from '../src/index.js';

/** Deterministic pseudo-random vector for tests. */
function vec(dim, seed) {
  const v = new Float32Array(dim);
  let x = seed >>> 0 || 1;
  for (let i = 0; i < dim; i++) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    v[i] = (x / 0xffffffff) * 2 - 1;
  }
  return v;
}

test('add / size / search returns ranked exact-cosine results', () => {
  const dim = 16;
  const idx = new VectorIndex({ dim });
  const a = vec(dim, 1);
  const b = vec(dim, 2);
  const c = vec(dim, 3);
  idx.add('a', a, { hole_id: 'H1' });
  idx.addBatch([
    { id: 'b', vector: b, metadata: { hole_id: 'H2' } },
    { id: 'c', vector: c, metadata: { hole_id: 'H3' } },
  ]);
  assert.equal(idx.size, 3);

  const res = idx.search(a, { k: 3 });
  assert.equal(res[0].id, 'a');
  assert.ok(Math.abs(res[0].score - 1) < 1e-6, 'self-similarity is 1');
  assert.ok(res[0].score >= res[1].score && res[1].score >= res[2].score, 'descending order');
  // scores match the reference cosine implementation
  assert.ok(Math.abs(res[1].score - Math.max(cosine(a, b), cosine(a, c))) < 1e-6);
  assert.deepEqual(res[0].metadata, { hole_id: 'H1' });
});

test('search filter predicate excludes non-matching metadata before ranking', () => {
  const dim = 8;
  const idx = new VectorIndex({ dim });
  for (let i = 0; i < 20; i++) {
    idx.add(`r${i}`, vec(dim, i + 1), { project_id: i % 2 === 0 ? 'P1' : 'P2' });
  }
  const res = idx.search(vec(dim, 1), { k: 10, filter: (m) => m.project_id === 'P2' });
  assert.equal(res.length, 10);
  assert.ok(res.every((r) => r.metadata.project_id === 'P2'));
});

test('add with existing id is an upsert', () => {
  const idx = new VectorIndex({ dim: 4 });
  idx.add('x', [1, 0, 0, 0], { v: 1 });
  idx.add('x', [0, 1, 0, 0], { v: 2 });
  assert.equal(idx.size, 1);
  assert.deepEqual(Array.from(idx.getVector('x')), [0, 1, 0, 0]);
  assert.deepEqual(idx.getMetadata('x'), { v: 2 });
});

test('remove keeps the matrix packed (swap-with-last) and search stays correct', () => {
  const dim = 8;
  const idx = new VectorIndex({ dim, initialCapacity: 2 });
  const vs = {};
  for (const id of ['a', 'b', 'c', 'd', 'e']) {
    vs[id] = vec(dim, id.charCodeAt(0));
    idx.add(id, vs[id], { id });
  }
  assert.equal(idx.remove('b'), true);
  assert.equal(idx.remove('b'), false, 'second remove is a no-op');
  assert.equal(idx.size, 4);
  assert.equal(idx.getVector('b'), null);

  // every survivor is still retrievable byte-exact and self-matches at 1.0
  for (const id of ['a', 'c', 'd', 'e']) {
    assert.deepEqual(Array.from(idx.getVector(id)), Array.from(vs[id]), `vector ${id} intact after swap`);
    const res = idx.search(vs[id], { k: 1 });
    assert.equal(res[0].id, id);
  }
  assert.deepEqual(new Set(idx.ids()), new Set(['a', 'c', 'd', 'e']));
});

test('MemoryStore round-trip preserves vectors byte-exactly', async () => {
  const dim = 384;
  const idx = new VectorIndex({ dim, embedderName: 'hashing-ngram-v1-d384' });
  for (let i = 0; i < 25; i++) idx.add(`iv-${i}`, vec(dim, i + 7), { depth_from: i, depth_to: i + 1 });

  const store = new MemoryStore();
  await idx.save(store);
  const loaded = await VectorIndex.load(store);

  assert.equal(loaded.size, 25);
  assert.equal(loaded.dim, dim);
  assert.equal(loaded.embedderName, 'hashing-ngram-v1-d384');
  for (let i = 0; i < 25; i++) {
    const before = idx.getVector(`iv-${i}`);
    const after = loaded.getVector(`iv-${i}`);
    // byte-exact: compare underlying bytes, not just float equality
    assert.deepEqual(
      Buffer.from(after.buffer, after.byteOffset, after.byteLength),
      Buffer.from(before.buffer, before.byteOffset, before.byteLength),
      `vector iv-${i} bytes identical`,
    );
    assert.deepEqual(loaded.getMetadata(`iv-${i}`), { depth_from: i, depth_to: i + 1 });
  }
});

test('FileStore round-trip via a real .glvec file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'glvec-'));
  try {
    const path = join(dir, 'semantic', 'index.glvec'); // nested dir must be auto-created
    const dim = 32;
    const idx = new VectorIndex({ dim });
    idx.add(1, vec(dim, 11), { hole_id: 'CHB0241D' });
    idx.add(2, vec(dim, 12), { hole_id: 'CHB0242D' });
    await idx.save(new FileStore(path));

    const raw = await readFile(path);
    assert.equal(raw.toString('ascii', 0, 6), 'GLVEC1', 'file starts with magic');

    const loaded = await VectorIndex.load(new FileStore(path));
    assert.equal(loaded.size, 2);
    assert.deepEqual(Array.from(loaded.getVector(1)), Array.from(idx.getVector(1)));
    assert.deepEqual(loaded.getMetadata(2), { hole_id: 'CHB0242D' });
    // numeric ids survive JSON round-trip as numbers
    assert.deepEqual(new Set(loaded.ids()), new Set([1, 2]));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('load rejects garbage and search validates dimensions', async () => {
  const store = new MemoryStore();
  await store.write(Buffer.from('not an index'));
  await assert.rejects(() => VectorIndex.load(store), /bad magic/);

  const idx = new VectorIndex({ dim: 4 });
  assert.throws(() => idx.add('x', [1, 2, 3]), RangeError);
  assert.throws(() => idx.search([1, 2, 3], { k: 1 }), RangeError);
  assert.deepEqual(idx.search([1, 0, 0, 0], { k: 5 }), [], 'empty index returns []');
});
