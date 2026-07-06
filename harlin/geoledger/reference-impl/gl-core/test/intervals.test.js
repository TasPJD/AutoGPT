import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  propagateDepths,
  splitInterval,
  mergeIntervals,
  gapHealDelete,
  findSmartDefaultInterval,
  findOverlaps,
  checkDualStreamConflict,
  LOGGING_SYSTEMS,
} from '../src/intervals.js';

const rows3 = () => [
  { id: 'r1', depth_from: 0, depth_to: 10, lith: 'BAS', logging_system: 'GEOLOGIST' },
  { id: 'r2', depth_from: 10, depth_to: 20, lith: 'DOL', logging_system: 'GEOLOGIST' },
  { id: 'r3', depth_from: 20, depth_to: 30, lith: 'SHL', logging_system: 'GEOLOGIST' },
];

describe('intervals.propagateDepths', () => {
  test('moving a to-depth moves the next row from-depth', () => {
    const out = propagateDepths(rows3(), { id: 'r1', depth_to: 12 });
    assert.equal(out[0].depth_to, 12);
    assert.equal(out[1].depth_from, 12);
    assert.equal(out[2].depth_from, 20); // untouched
  });

  test('moving a from-depth moves the previous row to-depth', () => {
    const out = propagateDepths(rows3(), { id: 'r2', depth_from: 8 });
    assert.equal(out[0].depth_to, 8);
    assert.equal(out[1].depth_from, 8);
  });

  test('is pure — input rows are not mutated', () => {
    const input = rows3();
    const snapshot = JSON.parse(JSON.stringify(input));
    propagateDepths(input, { id: 'r1', depth_to: 15 });
    assert.deepEqual(input, snapshot);
  });

  test('non-depth fields survive propagation', () => {
    const out = propagateDepths(rows3(), { id: 'r1', depth_to: 12 });
    assert.equal(out[0].lith, 'BAS');
    assert.equal(out[1].lith, 'DOL');
  });

  test('throws on unknown id', () => {
    assert.throws(() => propagateDepths(rows3(), { id: 'nope', depth_to: 5 }), RangeError);
  });
});

describe('intervals.splitInterval', () => {
  test('REGRESSION CHB0241D: children replicate ALL parent columns to BOTH halves', () => {
    const rows = [{
      id: 'gt7', depth_from: 60, depth_to: 80,
      rqd: 92, recovery: 0.98, comment: 'blocky', logging_system: 'FIELD_TECH',
    }];
    const { rows: out, review } = splitInterval(rows, 'gt7', 69);
    assert.equal(review, 'SPLIT_CHILD_RECORDS_REVIEW');
    assert.equal(out.length, 2);
    const [a, b] = out;
    assert.deepEqual([a.depth_from, a.depth_to], [60, 69]);
    assert.deepEqual([b.depth_from, b.depth_to], [69, 80]);
    for (const child of out) {
      assert.equal(child.rqd, 92);
      assert.equal(child.recovery, 0.98);
      assert.equal(child.comment, 'blocky');
      assert.equal(child.logging_system, 'FIELD_TECH');
      assert.notEqual(child.id, 'gt7'); // children get new ids
    }
    assert.notEqual(a.id, b.id);
  });

  test('other rows are preserved and result stays sorted', () => {
    const { rows: out } = splitInterval(rows3(), 'r2', 15);
    assert.equal(out.length, 4);
    assert.deepEqual(out.map((r) => r.depth_from), [0, 10, 15, 20]);
  });

  test('throws when atDepth not strictly inside interval, or id unknown', () => {
    assert.throws(() => splitInterval(rows3(), 'r1', 0), RangeError);
    assert.throws(() => splitInterval(rows3(), 'r1', 10), RangeError);
    assert.throws(() => splitInterval(rows3(), 'r1', 99), RangeError);
    assert.throws(() => splitInterval(rows3(), 'r1', NaN), RangeError);
    assert.throws(() => splitInterval(rows3(), 'ghost', 5), RangeError);
  });
});

describe('intervals.mergeIntervals', () => {
  test('merges adjacent rows into a single span keeping the shallower row data', () => {
    const out = mergeIntervals(rows3(), 'r1', 'r2');
    assert.equal(out.length, 2);
    assert.deepEqual([out[0].depth_from, out[0].depth_to], [0, 20]);
    assert.equal(out[0].id, 'r1');
    assert.equal(out[0].lith, 'BAS');
  });

  test('argument order does not matter', () => {
    const out = mergeIntervals(rows3(), 'r2', 'r1');
    assert.deepEqual([out[0].depth_from, out[0].depth_to], [0, 20]);
  });

  test('rejects non-adjacent rows and unknown ids', () => {
    assert.throws(() => mergeIntervals(rows3(), 'r1', 'r3'), RangeError);
    assert.throws(() => mergeIntervals(rows3(), 'r1', 'ghost'), RangeError);
    assert.throws(() => mergeIntervals(rows3(), 'r1', 'r1'), RangeError);
  });
});

describe('intervals.gapHealDelete', () => {
  test('deleting a middle row extends the previous row to close the gap', () => {
    const out = gapHealDelete(rows3(), 'r2');
    assert.equal(out.length, 2);
    assert.deepEqual([out[0].depth_from, out[0].depth_to], [0, 20]);
    assert.deepEqual([out[1].depth_from, out[1].depth_to], [20, 30]);
  });

  test('deleting the first row extends the next row upward', () => {
    const out = gapHealDelete(rows3(), 'r1');
    assert.deepEqual([out[0].depth_from, out[0].depth_to], [0, 20]);
  });

  test('deleting the last row extends the previous row down', () => {
    const out = gapHealDelete(rows3(), 'r3');
    assert.deepEqual([out[1].depth_from, out[1].depth_to], [10, 30]);
  });

  test('throws on unknown id, pure over input', () => {
    const input = rows3();
    assert.throws(() => gapHealDelete(input, 'ghost'), RangeError);
    const snapshot = JSON.parse(JSON.stringify(input));
    gapHealDelete(input, 'r2');
    assert.deepEqual(input, snapshot);
  });
});

describe('intervals.findSmartDefaultInterval', () => {
  test('starts at deepest existing depth_to', () => {
    assert.deepEqual(findSmartDefaultInterval(rows3(), 35), { depth_from: 30, depth_to: 35 });
  });

  test('empty rows start at zero', () => {
    assert.deepEqual(findSmartDefaultInterval([], 4.5), { depth_from: 0, depth_to: 4.5 });
  });

  test('currentDepth not deeper than existing data falls back to +1 m', () => {
    assert.deepEqual(findSmartDefaultInterval(rows3(), 25), { depth_from: 30, depth_to: 31 });
    assert.deepEqual(findSmartDefaultInterval(rows3()), { depth_from: 30, depth_to: 31 });
  });
});

describe('intervals.findOverlaps', () => {
  test('contiguous rows do not overlap', () => {
    assert.deepEqual(findOverlaps(rows3()), []);
  });

  test('detects strict overlap with the overlapping range', () => {
    const rows = [
      { id: 'a', depth_from: 0, depth_to: 12 },
      { id: 'b', depth_from: 10, depth_to: 20 },
    ];
    assert.deepEqual(findOverlaps(rows), [{ a: 'a', b: 'b', overlap_from: 10, overlap_to: 12 }]);
  });

  test('containment counts as overlap', () => {
    const rows = [
      { id: 'outer', depth_from: 0, depth_to: 30 },
      { id: 'inner', depth_from: 5, depth_to: 10 },
    ];
    const out = findOverlaps(rows);
    assert.equal(out.length, 1);
    assert.deepEqual([out[0].overlap_from, out[0].overlap_to], [5, 10]);
  });
});

describe('intervals.checkDualStreamConflict', () => {
  test('exposes the three valid streams', () => {
    assert.deepEqual([...LOGGING_SYSTEMS], ['FIELD_TECH', 'GEOLOGIST', 'RECONCILED']);
  });

  test('clean dual-stream data is ok', () => {
    const res = checkDualStreamConflict(rows3());
    assert.equal(res.ok, true);
    assert.deepEqual(res.errors, []);
    assert.deepEqual(res.warnings, []);
  });

  test('missing or invalid logging_system is an error', () => {
    const res = checkDualStreamConflict([{ id: 'x', depth_from: 0, depth_to: 5 }]);
    assert.equal(res.ok, false);
    assert.equal(res.errors[0].code, 'INVALID_LOGGING_SYSTEM');
    const res2 = checkDualStreamConflict([
      { id: 'y', depth_from: 0, depth_to: 5, logging_system: 'geologist' }, // wrong case
    ]);
    assert.equal(res2.ok, false);
  });

  test('cross-stream overlap is a soft warning, not an error', () => {
    const res = checkDualStreamConflict([
      { id: 'ft1', depth_from: 0, depth_to: 10, logging_system: 'FIELD_TECH' },
      { id: 'ge1', depth_from: 5, depth_to: 15, logging_system: 'GEOLOGIST' },
    ]);
    assert.equal(res.ok, true);
    assert.deepEqual(res.errors, []);
    assert.equal(res.warnings.length, 1);
    assert.equal(res.warnings[0].code, 'CROSS_STREAM_OVERLAP');
    assert.deepEqual(res.warnings[0].streams.sort(), ['FIELD_TECH', 'GEOLOGIST']);
  });

  test('REGRESSION: same-stream overlap returns a structured INTERVAL_CONFLICT error', () => {
    const res = checkDualStreamConflict([
      { id: 'g1', depth_from: 0, depth_to: 10, logging_system: 'GEOLOGIST' },
      { id: 'g2', depth_from: 8, depth_to: 15, logging_system: 'GEOLOGIST' },
    ]);
    assert.equal(res.ok, false);
    assert.equal(res.errors.length, 1);
    const err = res.errors[0];
    assert.equal(err.code, 'INTERVAL_CONFLICT');
    assert.deepEqual(err.ids.sort(), ['g1', 'g2']);
    assert.equal(err.logging_system, 'GEOLOGIST');
    assert.equal(err.overlap_from, 8);
    assert.equal(err.overlap_to, 10);
  });
});
