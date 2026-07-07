import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIntervalDoc, buildCorpus, CorpusSync, DEFAULT_TABLE } from '../src/corpus.js';
import { HashingEmbedder } from '../src/embedder.js';
import { VectorIndex } from '../src/index.js';
import { SemanticSearch } from '../src/search.js';

const CODE_MAP = { BAS: 'basalt', TKB: 'talc komatiite breccia', SHZ: 'shear zone', GRT: 'granite' };

test('buildIntervalDoc composes text and metadata from a full row', () => {
  const row = {
    interval_id: 'iv-001',
    hole_id: 'CHB0241D',
    project_id: 'proj-chb',
    depth_from: 124.5,
    depth_to: 127.2,
    lith_code: 'BAS',
    description: 'strongly sheared, qtz-carb veining throughout',
    comment: 'possible mylonite at 126m',
    alteration: [
      { mineral: 'ser', intensity: 'mod', style: 'pervasive' },
      { mineral: 'chl', intensity: 'wk' },
    ],
    mineralisation: [
      { mineral: 'py', percent: 3, style: 'diss' },
      { mineral: 'cpy', pct: 0.5, style: 'stringer' },
    ],
    veins: [{ mineral: 'qtz', type: 'shear-parallel', percent: 10 }],
    structure: [{ type: 'shear zone', note: 'foliation at 45 tca' }],
    weathering: 'fresh',
    oxidation: 'unoxidised',
  };
  const doc = buildIntervalDoc(row, { codeMap: CODE_MAP });

  assert.equal(doc.id, 'iv-001');
  assert.deepEqual(doc.metadata, {
    table: DEFAULT_TABLE,
    hole_id: 'CHB0241D',
    project_id: 'proj-chb',
    depth_from: 124.5,
    depth_to: 127.2,
    lith_code: 'BAS',
  });
  const t = doc.text;
  assert.match(t, /CHB0241D/, 'hole id searchable in text');
  assert.match(t, /BAS basalt/, 'lith code kept AND expanded via codeMap');
  assert.match(t, /strongly sheared/, 'description present');
  assert.match(t, /possible mylonite/, 'comment present');
  assert.match(t, /mod ser pervasive alteration/, 'alteration mineral+intensity+style rendered');
  assert.match(t, /wk chl alteration/, 'partial alteration entry rendered');
  assert.match(t, /py 3% diss mineralisation/, 'mineralisation rendered');
  assert.match(t, /cpy 0\.5% stringer mineralisation/, 'pct alias handled');
  assert.match(t, /qtz shear-parallel 10% vein/, 'vein rendered');
  assert.match(t, /shear zone foliation at 45 tca/, 'structure rendered');
  assert.match(t, /fresh weathering/, 'weathering rendered');
  assert.match(t, /unoxidised oxidation/, 'oxidation rendered');
});

test('buildIntervalDoc tolerates minimal rows, aliases, and JSON-string arrays', () => {
  const doc = buildIntervalDoc(
    {
      id: 7,
      holeid: 'TKB001',
      from: 10,
      to: 12,
      lith: 'TKB',
      comments: 'rubbly core',
      alteration: '[{"mineral":"serp","intensity":"stg"}]', // stored as JSON text in SQLite
    },
    { codeMap: CODE_MAP },
  );
  assert.equal(doc.id, 7);
  assert.equal(doc.metadata.hole_id, 'TKB001');
  assert.equal(doc.metadata.depth_from, 10);
  assert.equal(doc.metadata.depth_to, 12);
  assert.match(doc.text, /TKB talc komatiite breccia/);
  assert.match(doc.text, /rubbly core/);
  assert.match(doc.text, /stg serp alteration/);

  // no explicit id -> composed fallback
  const noId = buildIntervalDoc({ hole_id: 'H1', depth_from: 1, depth_to: 2 });
  assert.equal(noId.id, 'H1:1-2');
});

test('buildCorpus maps rows to docs and skips malformed rows unless strict', () => {
  const rows = [
    { id: 1, hole_id: 'H1', description: 'basalt' },
    null, // malformed
    { id: 2, hole_id: 'H2', description: 'granite' },
  ];
  const docs = buildCorpus(rows, { codeMap: CODE_MAP });
  assert.equal(docs.length, 2);
  assert.deepEqual(docs.map((d) => d.id), [1, 2]);
  assert.throws(() => buildCorpus(rows, { strict: true }), TypeError);
});

function makeSearch() {
  const embedder = new HashingEmbedder({ dim: 128 });
  const index = new VectorIndex({ dim: 128, embedderName: embedder.name });
  return new SemanticSearch({ embedder, index });
}

test('CorpusSync applies insert / update / delete change-log events', async () => {
  const db = new Map([
    [1, { interval_id: 1, hole_id: 'H1', description: 'ser alt basalt', project_id: 'P1' }],
    [2, { interval_id: 2, hole_id: 'H2', description: 'fresh granite', project_id: 'P1' }],
  ]);
  const search = makeSearch();
  const sync = new CorpusSync({
    search,
    getRow: (table, rowId) => db.get(rowId) ?? null,
    codeMap: CODE_MAP,
  });

  // insert both rows
  let summary = await sync.applyBatch([
    { table: DEFAULT_TABLE, row_id: 1, op: 'insert' },
    { table: DEFAULT_TABLE, row_id: 2, op: 'insert' },
    { table: 'tbl_assays', row_id: 99, op: 'insert' }, // other table -> ignored
  ]);
  assert.deepEqual(summary, { upserted: 2, removed: 0, skipped: 1 });
  assert.equal(search.size, 2);

  // update row 1: description changes, search results must follow
  let hits = await search.query('sericite alteration', { k: 1 });
  assert.equal(hits[0].id, 1, 'pre-update: row 1 matches sericite');

  db.set(1, { interval_id: 1, hole_id: 'H1', description: 'massive pyrite stringers', project_id: 'P1' });
  await sync.apply({ table: DEFAULT_TABLE, row_id: 1, op: 'update' });
  assert.equal(search.size, 2, 'update re-embeds in place, no duplicate');

  hits = await search.query('massive py stringers', { k: 1 });
  assert.equal(hits[0].id, 1, 'post-update: new wording found');
  const explainOld = await search.explain('sericite alteration', 1);
  assert.equal(explainOld.matchedTerms.length, 0, 'old wording no longer matches row 1');

  // delete row 2
  const res = await sync.apply({ table: DEFAULT_TABLE, row_id: 2, op: 'delete' });
  assert.equal(res, 'removed');
  assert.equal(search.size, 1);

  // update event for a row that vanished -> treated as delete
  db.delete(1);
  const gone = await sync.apply({ table: DEFAULT_TABLE, row_id: 1, op: 'update' });
  assert.equal(gone, 'removed');
  assert.equal(search.size, 0);
});

test('CorpusSync validates its wiring', () => {
  const search = makeSearch();
  assert.throws(() => new CorpusSync({ search: {}, getRow: () => null }), TypeError);
  assert.throws(() => new CorpusSync({ search }), TypeError);
});
