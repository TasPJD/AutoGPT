import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { runValidations, assertNonBlocking } from '../src/validation.js';

const record = { id: 41, depth_from: 10, depth_to: 5, rqd: 130 };

const rules = [
  {
    id: 'DEPTH_REVERSED',
    level: 'flag',
    entity_table: 'tbl_geotech',
    test: (r) => r.depth_to < r.depth_from,
    message: (r) => `depth_to ${r.depth_to} is above depth_from ${r.depth_from}`,
  },
  {
    id: 'RQD_OVER_100',
    level: 'warn',
    test: (r) => r.rqd > 100,
    message: (r) => `RQD ${r.rqd}% exceeds 100%`,
  },
  {
    id: 'HAS_COMMENT',
    level: 'info',
    test: (r) => !r.comment,
    message: () => 'No comment recorded',
  },
];

describe('validation.runValidations', () => {
  test('collects messages for fired rules only', () => {
    const clean = { id: 1, depth_from: 0, depth_to: 5, rqd: 90, comment: 'ok' };
    const res = runValidations(clean, rules);
    assert.deepEqual(res.messages, []);
    assert.deepEqual(res.flags, []);
  });

  test('level flag produces a ready-to-insert tbl_validation_flags row', () => {
    const res = runValidations(record, rules);
    assert.equal(res.messages.length, 3);
    assert.equal(res.flags.length, 1);
    assert.deepEqual(res.flags[0], {
      flag_type: 'DEPTH_REVERSED',
      severity: 'flag',
      entity_table: 'tbl_geotech',
      entity_id: 41,
      detail: 'depth_to 5 is above depth_from 10',
      created_at: null, // the caller stamps this
    });
  });

  test('info and warn levels never produce flags', () => {
    const res = runValidations(record, rules);
    const nonFlagLevels = res.messages.filter((m) => m.level !== 'flag');
    assert.equal(nonFlagLevels.length, 2);
    assert.equal(res.flags.every((f) => f.severity === 'flag'), true);
  });

  test('meta overrides entity targeting', () => {
    const res = runValidations(record, [rules[0]], { entityTable: 'tbl_other', entityId: 'X9' });
    // rule.entity_table wins over meta.entityTable, meta.entityId wins over record.id
    assert.equal(res.flags[0].entity_table, 'tbl_geotech');
    assert.equal(res.flags[0].entity_id, 'X9');
    const bare = { ...rules[0] };
    delete bare.entity_table;
    const res2 = runValidations(record, [bare], { entityTable: 'tbl_other' });
    assert.equal(res2.flags[0].entity_table, 'tbl_other');
  });

  test('REGRESSION C1: NEVER throws — even when a rule itself throws', () => {
    const evil = [
      { id: 'BOOM_TEST', level: 'warn', test: () => { throw new Error('kaboom'); }, message: () => 'x' },
      { id: 'BOOM_MSG', level: 'flag', test: () => true, message: () => { throw new Error('msg boom'); } },
      null,
      { id: 'NO_TEST', level: 'info' },
    ];
    let res;
    assert.doesNotThrow(() => { res = runValidations(record, evil); });
    // broken test() is reported, not propagated
    assert.equal(res.messages.some((m) => m.id === 'BOOM_TEST' && /skipped/.test(m.message)), true);
    // broken message() falls back to the rule id
    assert.equal(res.flags.some((f) => f.flag_type === 'BOOM_MSG'), true);
    // garbage rules and records are tolerated
    assert.doesNotThrow(() => runValidations(null, rules));
    assert.doesNotThrow(() => runValidations(record, null));
  });

  test('validation is advisory: result carries no blocking signal', () => {
    const res = runValidations(record, rules);
    assert.equal('blocked' in res, false);
    assert.equal('ok' in res, false);
    assert.deepEqual(Object.keys(res).sort(), ['flags', 'messages']);
  });
});

describe('validation.assertNonBlocking', () => {
  test('flags alert( and confirm( in function source', () => {
    /* eslint-disable no-alert, no-undef */
    const bad1 = function check(v) { if (!v) alert('missing!'); };
    const bad2 = (v) => confirm(`delete ${v}?`);
    /* eslint-enable no-alert, no-undef */
    assert.equal(assertNonBlocking(bad1), false);
    assert.equal(assertNonBlocking(bad2), false);
    assert.equal(assertNonBlocking('if (bad) window.alert("no")'), false);
  });

  test('passes non-blocking source', () => {
    const good = (v) => (v ? [] : [{ level: 'warn', message: 'missing' }]);
    assert.equal(assertNonBlocking(good), true);
    // names merely containing the words are fine
    assert.equal(assertNonBlocking('const alerted = confirmationText;'), true);
  });

  test('this package itself is non-blocking', async () => {
    const mod = await import('../src/validation.js');
    for (const fn of Object.values(mod)) {
      if (typeof fn === 'function' && fn !== mod.assertNonBlocking) {
        assert.equal(assertNonBlocking(fn), true);
      }
    }
  });
});
