import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HashingEmbedder,
  ExternalEmbedder,
  GEO_SYNONYMS,
  tokenize,
  expandTokens,
} from '../src/embedder.js';
import { cosine } from '../src/index.js';

test('tokenize lowercases and splits on non-alphanumerics', () => {
  assert.deepEqual(tokenize('Mod ser-alt; QV 2%'), ['mod', 'ser', 'alt', 'qv', '2']);
  assert.deepEqual(tokenize(''), []);
  assert.deepEqual(tokenize(null), []);
});

test('expandTokens keeps originals and appends synonym expansions', () => {
  const out = expandTokens('ser alt, qv common');
  assert.ok(out.includes('ser'), 'original abbreviation retained');
  assert.ok(out.includes('sericite'), 'ser expanded');
  assert.ok(out.includes('altered') && out.includes('alteration'), 'alt expanded to both forms');
  assert.ok(out.includes('quartz') && out.includes('vein'), 'qv expanded to quartz vein');
  assert.ok(out.includes('common'), 'plain words pass through');
});

test('HashingEmbedder is deterministic across calls and instances', async () => {
  const text = 'strongly sheared basalt with qtz-carb veining and diss py';
  const e1 = new HashingEmbedder();
  const e2 = new HashingEmbedder();
  const [a] = await e1.embed([text]);
  const [b] = await e1.embed([text]);
  const [c] = await e2.embed([text]);
  assert.deepEqual(Array.from(a), Array.from(b), 'same instance, same bytes');
  assert.deepEqual(Array.from(a), Array.from(c), 'fresh instance, same bytes');
  assert.equal(a.length, 384);
  assert.equal(e1.dim, 384);
  assert.ok(typeof e1.name === 'string' && e1.name.length > 0);
});

test('HashingEmbedder vectors are L2-normalised', async () => {
  const e = new HashingEmbedder({ dim: 128 });
  const [v] = await e.embed(['moderate chlorite-sericite alteration of andesite']);
  let ss = 0;
  for (const x of v) ss += x * x;
  assert.ok(Math.abs(Math.sqrt(ss) - 1) < 1e-5, `norm ${Math.sqrt(ss)} should be ~1`);
});

test('empty text embeds to a zero vector without throwing', async () => {
  const e = new HashingEmbedder();
  const [v] = await e.embed(['']);
  assert.equal(v.length, 384);
  assert.ok(v.every((x) => x === 0));
});

test('synonym recall: abbreviated log ranks above unrelated doc for full-term query', async () => {
  const e = new HashingEmbedder();
  const [query, abbreviated, unrelated] = await e.embed([
    'sericite alteration with quartz veins',
    'ser alt, qv common', // how a geologist actually logs it
    'massive fresh basalt, fine grained, chilled margin at base',
  ]);
  const simAbbrev = cosine(query, abbreviated);
  const simUnrelated = cosine(query, unrelated);
  assert.ok(
    simAbbrev > simUnrelated,
    `expected abbreviated log (${simAbbrev.toFixed(3)}) to outrank basalt doc (${simUnrelated.toFixed(3)})`,
  );
  assert.ok(simAbbrev > 0.2, `expected meaningful similarity, got ${simAbbrev.toFixed(3)}`);
});

test('mineral abbreviations map to full names (spot checks)', () => {
  for (const [abbr, full] of [
    ['py', 'pyrite'],
    ['cpy', 'chalcopyrite'],
    ['po', 'pyrrhotite'],
    ['aspy', 'arsenopyrite'],
    ['hem', 'hematite'],
    ['mag', 'magnetite'],
    ['bx', 'breccia'],
    ['fol', 'foliation'],
    ['shr', 'shear'],
    ['um', 'ultramafic'],
  ]) {
    assert.ok(GEO_SYNONYMS[abbr].includes(full), `${abbr} -> ${full}`);
  }
});

test('ExternalEmbedder adapts a user function and validates shape', async () => {
  const calls = [];
  const ext = new ExternalEmbedder({
    name: 'fake-minilm',
    dim: 4,
    embed: async (texts) => {
      calls.push(texts);
      return texts.map((t) => [t.length, 1, 0, -1]);
    },
  });
  const out = await ext.embed(['ab', 'abc']);
  assert.equal(out.length, 2);
  assert.ok(out[0] instanceof Float32Array);
  assert.deepEqual(Array.from(out[0]), [2, 1, 0, -1]);
  assert.deepEqual(calls, [['ab', 'abc']]);

  const bad = new ExternalEmbedder({ dim: 4, embed: async (texts) => texts.map(() => [1, 2]) });
  await assert.rejects(() => bad.embed(['x']), /dim 2, expected 4/);
  const wrongCount = new ExternalEmbedder({ dim: 4, embed: async () => [] });
  await assert.rejects(() => wrongCount.embed(['x']), /expected 1 vectors/);
});

test('constructor validation', () => {
  assert.throws(() => new HashingEmbedder({ dim: 0 }), RangeError);
  assert.throws(() => new HashingEmbedder({ ngramMin: 6, ngramMax: 5 }), RangeError);
  assert.throws(() => new ExternalEmbedder({ dim: 384 }), TypeError);
});
