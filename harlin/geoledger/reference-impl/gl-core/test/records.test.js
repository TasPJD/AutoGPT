import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  strictInsert,
  strictUpdate,
  diffColumns,
  StrictFieldError,
  levenshtein,
} from '../src/records.js';

// e.g. from: SELECT name FROM pragma_table_info('tbl_magsus')
const MAGSUS_COLUMNS = ['id', 'hole_id', 'depth_from', 'depth_to', 'magsus_value', 'reading_no', 'created_at'];

/** Run fn, assert it throws, and return the thrown error for inspection. */
function capture(fn) {
  try {
    fn();
  } catch (err) {
    return err;
  }
  assert.fail('expected function to throw');
}

describe('records.levenshtein', () => {
  test('classic distances', () => {
    assert.equal(levenshtein('', ''), 0);
    assert.equal(levenshtein('abc', 'abc'), 0);
    assert.equal(levenshtein('abc', ''), 3);
    assert.equal(levenshtein('kitten', 'sitting'), 3);
    assert.equal(levenshtein('magsus_val', 'magsus_value'), 2);
  });
});

describe('records.strictInsert', () => {
  test('accepts a fully valid record and returns columns/values/placeholders', () => {
    const out = strictInsert(MAGSUS_COLUMNS, {
      hole_id: 'CHB0241D', depth_from: 10, depth_to: 10.1, magsus_value: 0.55,
    });
    assert.deepEqual(out.columns, ['hole_id', 'depth_from', 'depth_to', 'magsus_value']);
    assert.deepEqual(out.values, ['CHB0241D', 10, 10.1, 0.55]);
    assert.equal(out.placeholders, '?, ?, ?, ?');
  });

  test('REGRESSION L-18: an unknown key THROWS with a magsus_value suggestion instead of silently dropping data', () => {
    // The bug: insertRecord() silently discarded 'magsus_val' → 223 readings lost.
    const err = capture(() => strictInsert(MAGSUS_COLUMNS, { hole_id: 'H1', magsus_val: 0.55 }));
    assert.equal(err instanceof StrictFieldError, true);
    assert.equal(err.name, 'StrictFieldError');
    assert.equal(err.operation, 'insert');
    assert.deepEqual(err.unknownKeys, ['magsus_val']);
    assert.equal(err.suggestions.magsus_val, 'magsus_value');
    assert.match(err.message, /magsus_val/);
    assert.match(err.message, /did you mean "magsus_value"\?/);
  });

  test('lists ALL offending keys, not just the first', () => {
    const err = capture(() => strictInsert(MAGSUS_COLUMNS, { hole_idd: 'H1', deph_from: 1, totally_bogus: true }));
    assert.equal(err instanceof StrictFieldError, true);
    assert.deepEqual([...err.unknownKeys].sort(), ['deph_from', 'hole_idd', 'totally_bogus']);
    assert.equal(err.suggestions.hole_idd, 'hole_id');
    assert.equal(err.suggestions.deph_from, 'depth_from');
    assert.equal(err.suggestions.totally_bogus, null); // nothing within distance 2
  });

  test('rejects empty records and bad inputs', () => {
    assert.throws(() => strictInsert(MAGSUS_COLUMNS, {}), TypeError);
    assert.throws(() => strictInsert(MAGSUS_COLUMNS, null), TypeError);
    assert.throws(() => strictInsert(MAGSUS_COLUMNS, [1, 2]), TypeError);
    assert.throws(() => strictInsert([], { a: 1 }), TypeError);
    assert.throws(() => strictInsert(undefined, { a: 1 }), TypeError);
  });
});

describe('records.strictUpdate', () => {
  test('builds a set clause for valid fields', () => {
    const out = strictUpdate(MAGSUS_COLUMNS, { magsus_value: 0.6, depth_to: 10.2 });
    assert.equal(out.setClause, 'depth_to = ?, magsus_value = ?');
    assert.deepEqual(out.columns, ['depth_to', 'magsus_value']);
    assert.deepEqual(out.values, [10.2, 0.6]);
  });

  test('throws StrictFieldError with suggestions, tagged as update', () => {
    const err = capture(() => strictUpdate(MAGSUS_COLUMNS, { magsus_valu: 0.6 }));
    assert.equal(err instanceof StrictFieldError, true);
    assert.equal(err.operation, 'update');
    assert.equal(err.suggestions.magsus_valu, 'magsus_value');
  });
});

describe('records.diffColumns', () => {
  test('dry-run report partitions known/unknown/missing', () => {
    const report = diffColumns(MAGSUS_COLUMNS, { hole_id: 'H1', magsus_val: 0.5 });
    assert.deepEqual(report.known, ['hole_id']);
    assert.deepEqual(report.unknown, [{ key: 'magsus_val', suggestion: 'magsus_value' }]);
    assert.deepEqual(report.missing, ['id', 'depth_from', 'depth_to', 'magsus_value', 'reading_no', 'created_at']);
  });

  test('never throws for mismatches — it is the reporting twin of strictInsert', () => {
    assert.doesNotThrow(() => diffColumns(MAGSUS_COLUMNS, { junk: 1 }));
    assert.doesNotThrow(() => diffColumns(MAGSUS_COLUMNS, null));
  });

  test('suggestion matching is case-insensitive', () => {
    const report = diffColumns(MAGSUS_COLUMNS, { Magsus_Value: 1 });
    assert.equal(report.unknown[0].suggestion, 'magsus_value');
  });
});
