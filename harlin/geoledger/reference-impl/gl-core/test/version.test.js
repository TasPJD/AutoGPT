import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { APP_VERSION, SCHEMA_VERSION, assertVersionCompatible } from '../src/version.js';

describe('version', () => {
  test('exports the single-source constants', () => {
    assert.equal(APP_VERSION, '0.6.0-dev');
    assert.equal(SCHEMA_VERSION, 29);
  });

  test('matching schema versions apply', () => {
    assert.deepEqual(assertVersionCompatible(29, 29), { ok: true, action: 'apply' });
  });

  test('defaults local version to SCHEMA_VERSION', () => {
    assert.deepEqual(assertVersionCompatible(SCHEMA_VERSION), { ok: true, action: 'apply' });
  });

  test('changeset from an older schema is skipped (local newer)', () => {
    assert.deepEqual(assertVersionCompatible(28, 29), { ok: false, action: 'skip_newer' });
  });

  test('changeset from a newer schema requires local upgrade', () => {
    assert.deepEqual(assertVersionCompatible(30, 29), { ok: false, action: 'upgrade_required' });
  });

  test('REGRESSION: sync.js stale hardcoded SCHEMA_VERSION=18 vs live schema 29', () => {
    // sync.js once believed schema 18; a changeset it produced must be
    // skipped by an up-to-date peer, not silently applied.
    const decision = assertVersionCompatible(18, SCHEMA_VERSION);
    assert.equal(decision.ok, false);
    assert.equal(decision.action, 'skip_newer');
    // ...and the stale node itself, receiving a schema-29 changeset,
    // must be told to upgrade.
    const inverse = assertVersionCompatible(SCHEMA_VERSION, 18);
    assert.equal(inverse.ok, false);
    assert.equal(inverse.action, 'upgrade_required');
  });

  test('rejects non-integer versions', () => {
    assert.throws(() => assertVersionCompatible('29', 29), TypeError);
    assert.throws(() => assertVersionCompatible(29.5, 29), TypeError);
    assert.throws(() => assertVersionCompatible(29, NaN), TypeError);
    assert.throws(() => assertVersionCompatible(-1, 29), TypeError);
    assert.throws(() => assertVersionCompatible(undefined), TypeError);
  });
});
