import test from 'node:test';
import assert from 'node:assert/strict';
import { HashingEmbedder } from '../src/embedder.js';
import { VectorIndex } from '../src/index.js';
import { SemanticSearch } from '../src/search.js';
import { moreLikeThis } from '../src/similar.js';

const ROWS = [
  {
    interval_id: 'a1',
    hole_id: 'H1',
    project_id: 'P1',
    depth_from: 10,
    depth_to: 12,
    description: 'shear-hosted quartz veining with sericite alteration, diss py',
  },
  {
    interval_id: 'a2',
    hole_id: 'H9',
    project_id: 'P2', // different project — MLT must cross projects
    depth_from: 300,
    depth_to: 305,
    description: 'sheared quartz veins, sericite altered wall rock, pyrite disseminations',
  },
  {
    interval_id: 'b1',
    hole_id: 'H2',
    project_id: 'P1',
    depth_from: 50,
    depth_to: 60,
    description: 'fresh massive basalt, no alteration, no veining',
  },
  {
    interval_id: 'c1',
    hole_id: 'H3',
    project_id: 'P1',
    depth_from: 80,
    depth_to: 90,
    description: 'coarse biotite granite, equigranular',
  },
];

async function makeIndexed() {
  const embedder = new HashingEmbedder();
  const index = new VectorIndex({ dim: embedder.dim });
  const search = new SemanticSearch({ embedder, index });
  await search.indexRows(ROWS, {});
  return { search, index };
}

test('moreLikeThis finds the near-duplicate interval across projects, excluding self', async () => {
  const { index } = await makeIndexed();
  const results = moreLikeThis(index, 'a1', { k: 2 });
  assert.equal(results.length, 2);
  assert.ok(!results.some((r) => r.id === 'a1'), 'self excluded by default');
  assert.equal(results[0].id, 'a2', 'the reworded twin interval ranks first');
  assert.equal(results[0].metadata.project_id, 'P2', 'similarity crosses project boundaries');
  assert.ok(results[0].score > results[1].score);
});

test('moreLikeThis accepts a SemanticSearch facade and the .similar() method delegates', async () => {
  const { search } = await makeIndexed();
  const viaFn = moreLikeThis(search, 'a1', { k: 1 });
  const viaMethod = await search.similar('a1', { k: 1 });
  assert.equal(viaFn[0].id, 'a2');
  assert.equal(viaMethod[0].id, 'a2');
  assert.equal(viaFn[0].score, viaMethod[0].score);
});

test('moreLikeThis honours metadata filters', async () => {
  const { index } = await makeIndexed();
  const p1Only = moreLikeThis(index, 'a1', { k: 5, filter: (m) => m.project_id === 'P1' });
  assert.ok(p1Only.length > 0);
  assert.ok(p1Only.every((r) => r.metadata.project_id === 'P1'));
  assert.ok(!p1Only.some((r) => r.id === 'a2'), 'P2 twin filtered out');
});

test('moreLikeThis errors clearly on unknown id or bad source', async () => {
  const { index } = await makeIndexed();
  assert.throws(() => moreLikeThis(index, 'does-not-exist'), /not in the index/);
  assert.throws(() => moreLikeThis({}, 'a1'), TypeError);
});
