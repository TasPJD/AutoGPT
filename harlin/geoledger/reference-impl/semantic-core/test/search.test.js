import test from 'node:test';
import assert from 'node:assert/strict';
import { HashingEmbedder } from '../src/embedder.js';
import { VectorIndex } from '../src/index.js';
import { SemanticSearch } from '../src/search.js';

const CODE_MAP = { BAS: 'basalt', GRT: 'granite', SHZ: 'shear zone', TKB: 'talc komatiite breccia' };

/** A small but realistic mixed corpus across two projects. */
const ROWS = [
  {
    interval_id: 'iv-ser',
    hole_id: 'CHB0240D',
    project_id: 'P1',
    depth_from: 100,
    depth_to: 103,
    lith_code: 'BAS',
    description: 'ser alt, qv common', // abbreviated logging shorthand
  },
  {
    interval_id: 'iv-basalt',
    hole_id: 'CHB0240D',
    project_id: 'P1',
    depth_from: 103,
    depth_to: 110,
    lith_code: 'BAS',
    description: 'massive fresh basalt, fine grained, chilled margins, no veining',
  },
  {
    interval_id: 'iv-chb241',
    hole_id: 'CHB0241D',
    project_id: 'P1',
    depth_from: 50,
    depth_to: 55,
    lith_code: 'SHZ',
    description: 'broken core, minor gouge',
  },
  {
    interval_id: 'iv-shear-other',
    hole_id: 'MKD002',
    project_id: 'P2',
    depth_from: 200,
    depth_to: 204,
    lith_code: 'GRT',
    description: 'intense shear fabric, mylonitic, shear-hosted quartz veining with sericite alteration selvages',
  },
  {
    interval_id: 'iv-granite',
    hole_id: 'MKD002',
    project_id: 'P2',
    depth_from: 204,
    depth_to: 220,
    lith_code: 'GRT',
    description: 'coarse grained biotite granite, equigranular, fresh',
  },
];

function makeSearch(opts = {}) {
  const embedder = new HashingEmbedder();
  const index = new VectorIndex({ dim: embedder.dim, embedderName: embedder.name });
  return new SemanticSearch({ embedder, index, ...opts });
}

async function makeIndexed() {
  const search = makeSearch();
  await search.indexRows(ROWS, CODE_MAP);
  return search;
}

test('synonym recall: full-term query finds the abbreviated log above unrelated basalt', async () => {
  const search = await makeIndexed();
  const results = await search.query('sericite alteration with quartz veins', { k: 5 });
  const rank = results.map((r) => r.id);
  assert.ok(rank.indexOf('iv-ser') !== -1, 'abbreviated doc is returned');
  assert.ok(
    rank.indexOf('iv-ser') < rank.indexOf('iv-basalt'),
    `"ser alt, qv common" must outrank the basalt doc; got ${rank.join(', ')}`,
  );
  const top = results[0];
  assert.ok(typeof top.score === 'number' && top.score > 0);
  assert.ok(typeof top.snippet === 'string');
  assert.equal(top.metadata.table, 'tbl_geology_intervals');
});

test('hybrid mode: exact hole code query ranks that hole first', async () => {
  const search = await makeIndexed();
  const results = await search.query('CHB0241D shear', { k: 5 });
  assert.equal(
    results[0].id,
    'iv-chb241',
    `exact-code doc must win; got ${results.map((r) => r.id).join(', ')}`,
  );
  assert.ok(results[0].keywordScore > 0, 'keyword component fired on the exact code');
});

test('filters: project, hole, and depth-overlap narrowing', async () => {
  const search = await makeIndexed();

  const p2 = await search.query('shear quartz veining', { k: 10, filters: { project_id: 'P2' } });
  assert.ok(p2.length > 0);
  assert.ok(p2.every((r) => r.metadata.project_id === 'P2'));

  const hole = await search.query('basalt', { k: 10, filters: { hole_id: 'CHB0240D' } });
  assert.ok(hole.every((r) => r.metadata.hole_id === 'CHB0240D'));

  const deep = await search.query('granite shear', { k: 10, filters: { depthMin: 150, depthMax: 210 } });
  assert.ok(deep.length > 0);
  assert.ok(
    deep.every((r) => r.metadata.depth_to >= 150 && r.metadata.depth_from <= 210),
    'depth filter is interval overlap',
  );
  assert.ok(!deep.some((r) => r.id === 'iv-ser'), 'shallow interval excluded');
});

test('pure-vector mode is available (hybrid: false)', async () => {
  const search = await makeIndexed();
  const results = await search.query('sericite alteration', { k: 3, hybrid: false });
  assert.ok(results.length > 0);
  assert.ok(results.every((r) => r.keywordScore === 0), 'no keyword component when hybrid off');
});

test('explain() reports expansions, matched terms, and both score components', async () => {
  const search = await makeIndexed();
  const ex = await search.explain('sericite alteration with quartz veins', 'iv-ser');

  assert.equal(ex.id, 'iv-ser');
  assert.equal(ex.found, true);
  assert.ok(Array.isArray(ex.expansions));
  // "alteration" itself is not an abbreviation, but the doc used "alt";
  // matchedTerms must show the overlap the ranker actually used.
  assert.ok(ex.matchedTerms.includes('sericite'), 'sericite matched via ser->sericite expansion');
  assert.ok(ex.matchedTerms.includes('quartz'), 'quartz matched via qv->quartz vein expansion');
  assert.ok(typeof ex.vectorScore === 'number' && ex.vectorScore > 0);
  assert.ok(typeof ex.keywordScore === 'number' && ex.keywordScore > 0);
  assert.ok(typeof ex.blendedScore === 'number');
  assert.deepEqual(ex.weights, { vector: 0.7, keyword: 0.3 });
  assert.ok(ex.queryTokens.includes('veins'));

  // explaining a query with abbreviations surfaces the expansion table
  const ex2 = await search.explain('qv with ser selvages', 'iv-ser');
  const expandedTokens = Object.fromEntries(ex2.expansions.map((e) => [e.token, e.expandedTo]));
  assert.deepEqual(expandedTokens.qv, ['quartz', 'vein']);
  assert.deepEqual(expandedTokens.ser, ['sericite']);

  // unknown id: found=false, no vector score
  const missing = await search.explain('anything', 'nope');
  assert.equal(missing.found, false);
  assert.equal(missing.vectorScore, null);
});

test('upsertDocs re-embeds in place and remove() clears both stores', async () => {
  const search = await makeIndexed();
  const before = search.size;
  await search.upsertDocs([{ id: 'iv-ser', text: 'now a boring mudstone', metadata: { project_id: 'P1' } }]);
  assert.equal(search.size, before, 'upsert does not grow the index');

  const results = await search.query('sericite alteration quartz veins', { k: 5 });
  assert.notEqual(results[0]?.id, 'iv-ser', 'rewritten doc no longer tops sericite query');

  assert.equal(search.remove('iv-ser'), true);
  assert.equal(search.remove('iv-ser'), false);
  assert.equal(search.size, before - 1);
  const ex = await search.explain('mudstone', 'iv-ser');
  assert.equal(ex.found, false);
});

test('constructor validation: embedder/index dim mismatch is rejected', () => {
  const embedder = new HashingEmbedder({ dim: 128 });
  const index = new VectorIndex({ dim: 384 });
  assert.throws(() => new SemanticSearch({ embedder, index }), RangeError);
  assert.throws(() => new SemanticSearch({}), TypeError);
});
