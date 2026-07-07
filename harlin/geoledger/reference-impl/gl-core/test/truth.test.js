import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as truth from '../src/truth.js';

const { effectiveTargetDepth, reconcileEoh } = truth;

describe('truth.effectiveTargetDepth cascade', () => {
  test('declared final_depth wins over everything', () => {
    assert.deepEqual(
      effectiveTargetDepth({ final_depth: 153.2, as_drilled_depth: 150, planned_depth: 120 }),
      { value: 153.2, source: 'declared' },
    );
  });

  test('as_drilled_depth is used when final_depth absent', () => {
    assert.deepEqual(
      effectiveTargetDepth({ as_drilled_depth: 150, planned_depth: 120 }),
      { value: 150, source: 'as_drilled' },
    );
  });

  test('planned_depth is the third rung', () => {
    assert.deepEqual(
      effectiveTargetDepth({ planned_depth: 120 }),
      { value: 120, source: 'planned' },
    );
  });

  test('falls back to 300 m when nothing usable', () => {
    assert.deepEqual(effectiveTargetDepth({}), { value: 300, source: 'fallback' });
    assert.deepEqual(effectiveTargetDepth(null), { value: 300, source: 'fallback' });
    assert.deepEqual(effectiveTargetDepth(undefined), { value: 300, source: 'fallback' });
  });

  test('null, NaN and non-positive rungs are skipped, not treated as declared', () => {
    assert.deepEqual(
      effectiveTargetDepth({ final_depth: null, as_drilled_depth: NaN, planned_depth: 90 }),
      { value: 90, source: 'planned' },
    );
    assert.deepEqual(
      effectiveTargetDepth({ final_depth: 0, planned_depth: -5 }),
      { value: 300, source: 'fallback' },
    );
  });
});

describe('truth.reconcileEoh', () => {
  test('agreement within tolerance produces no flags', () => {
    assert.deepEqual(
      reconcileEoh({ declaredFinalDepth: 153.2, deepestLoggedDepth: 153.24, eohDeclarations: [153.2] }),
      [],
    );
  });

  test('deeper logged data than declared EOH raises EOH_MISMATCH and EOH_BELOW_DEEPER_DATA', () => {
    const flags = reconcileEoh({
      declaredFinalDepth: 150,
      deepestLoggedDepth: 153.2,
      holeId: 'CHB0241D',
    });
    const types = flags.map((f) => f.flag_type).sort();
    assert.deepEqual(types, ['EOH_BELOW_DEEPER_DATA', 'EOH_MISMATCH']);
    for (const f of flags) {
      assert.equal(f.entity_table, 'tbl_holes');
      assert.equal(f.entity_id, 'CHB0241D');
      assert.equal(f.created_at, null); // caller stamps
      assert.equal(typeof f.detail, 'string');
    }
  });

  test('shallower logged data than declared EOH is not a mismatch (still drilling)', () => {
    assert.deepEqual(
      reconcileEoh({ declaredFinalDepth: 300, deepestLoggedDepth: 120 }),
      [],
    );
  });

  test('multiple disagreeing declarations raise MULTIPLE_EOH_DECLARATIONS', () => {
    const flags = reconcileEoh({ eohDeclarations: [153.2, 150.0, { depth: 153.2 }] });
    assert.equal(flags.length, 1);
    assert.equal(flags[0].flag_type, 'MULTIPLE_EOH_DECLARATIONS');
  });

  test('multiple agreeing declarations (within 0.05) do not flag', () => {
    assert.deepEqual(reconcileEoh({ eohDeclarations: [153.2, 153.24] }), []);
  });

  test('missing inputs never throw and never flag', () => {
    assert.deepEqual(reconcileEoh({}), []);
    assert.deepEqual(reconcileEoh(), []);
    assert.deepEqual(reconcileEoh({ declaredFinalDepth: NaN, deepestLoggedDepth: null }), []);
  });

  test('REGRESSION: EOH is never auto-set — module exports no final_depth setter', () => {
    // No exported function name may suggest writing final_depth / EOH.
    const exportNames = Object.keys(truth);
    for (const name of exportNames) {
      assert.doesNotMatch(name, /set|write|apply|update|save|assume/i,
        `truth.js must not export a mutator, found: ${name}`);
    }
    // reconcileEoh is pure: the input object is untouched and the output
    // contains flags only — no final_depth value anywhere.
    const input = { declaredFinalDepth: 150, deepestLoggedDepth: 160 };
    const frozen = Object.freeze({ ...input });
    const flags = reconcileEoh(frozen);
    assert.deepEqual(frozen, input);
    for (const f of flags) {
      assert.equal('final_depth' in f, false);
      assert.equal(Object.hasOwn(f, 'flag_type'), true);
    }
  });
});
