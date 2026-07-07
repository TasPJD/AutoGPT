import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { nextId, findCollisions } from '../src/ledger.js';

describe('ledger.nextId', () => {
  test('returns the next monotonic id, zero-padded to 3', () => {
    assert.equal(nextId(['D-049', 'D-050', 'D-051'], 'D'), 'D-052');
    assert.equal(nextId(['L-023'], 'L'), 'L-024');
  });

  test('starts at 001 with no existing ids', () => {
    assert.equal(nextId([], 'D'), 'D-001');
    assert.equal(nextId(undefined, 'D'), 'D-001');
  });

  test('ignores other prefixes and malformed ids', () => {
    assert.equal(nextId(['L-100', 'D-007', 'D-notanumber', 'X999', 'D-3'], 'D'), 'D-008');
  });

  test('is monotonic over gaps — always max+1, never gap-filling', () => {
    assert.equal(nextId(['D-002', 'D-050'], 'D'), 'D-051');
  });

  test('grows padding width with the ledger', () => {
    assert.equal(nextId(['D-1042'], 'D'), 'D-1043');
  });

  test('REGRESSION D-46..D-51: two writers using the same snapshot both compute the same next id (collision is detectable, not silent)', () => {
    const snapshot = ['D-045'];
    const a = nextId(snapshot, 'D');
    const b = nextId(snapshot, 'D');
    assert.equal(a, 'D-046');
    assert.equal(a, b); // deterministic — so a later findCollisions() catches the double-assignment
    const collisions = findCollisions([
      { id: a, text: 'Adopt canonical tray paths' },
      { id: b, text: 'Freeze schema at v29' },
    ]);
    assert.equal(collisions.length, 1);
    assert.equal(collisions[0].id, 'D-046');
  });

  test('rejects an empty prefix', () => {
    assert.throws(() => nextId([], ''), TypeError);
    assert.throws(() => nextId([], null), TypeError);
  });
});

describe('ledger.findCollisions', () => {
  test('REGRESSION L-18..L-20: detects duplicate ids with differing text', () => {
    const entries = [
      { id: 'L-018', text: 'insertRecord silently dropped fields' },
      { id: 'L-018', text: 'Never trust file mtimes for sync' },
      { id: 'L-019', text: 'unique lesson' },
    ];
    const out = findCollisions(entries);
    assert.equal(out.length, 1);
    assert.equal(out[0].id, 'L-018');
    assert.equal(out[0].count, 2);
    assert.deepEqual(out[0].texts.sort(), [
      'Never trust file mtimes for sync',
      'insertRecord silently dropped fields',
    ].sort());
  });

  test('exact duplicates (same id, same text) are not collisions', () => {
    const out = findCollisions([
      { id: 'D-001', text: 'same' },
      { id: 'D-001', text: 'same' },
    ]);
    assert.deepEqual(out, []);
  });

  test('whitespace-only differences are not collisions', () => {
    const out = findCollisions([
      { id: 'D-002', text: 'adopt  gl-core' },
      { id: 'D-002', text: ' adopt gl-core ' },
    ]);
    assert.deepEqual(out, []);
  });

  test('tolerates junk entries and empty input', () => {
    assert.deepEqual(findCollisions([]), []);
    assert.deepEqual(findCollisions([null, {}, { id: 42 }]), []);
    assert.deepEqual(findCollisions(undefined), []);
  });
});
