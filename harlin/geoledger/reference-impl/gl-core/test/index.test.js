import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../src/index.js';

describe('index re-exports', () => {
  test('every kernel API is reachable from the single entry point', () => {
    const expected = [
      // version
      'APP_VERSION', 'SCHEMA_VERSION', 'assertVersionCompatible',
      // paths
      'getTrayDir', 'getOriginalsDir', 'getThumbsDir',
      'isCanonicalTrayPath', 'repairLegacyTrayPath',
      'CONSULTANT_FOLDERS', 'GEOLEDGER_SEGMENT',
      // format
      'formatDepth', 'formatCompassAlpha', 'formatCompassBearing', 'roundForStorage',
      // truth
      'effectiveTargetDepth', 'reconcileEoh',
      // intervals
      'propagateDepths', 'splitInterval', 'mergeIntervals', 'gapHealDelete',
      'findSmartDefaultInterval', 'findOverlaps', 'checkDualStreamConflict', 'LOGGING_SYSTEMS',
      // validation
      'runValidations', 'assertNonBlocking',
      // records
      'strictInsert', 'strictUpdate', 'diffColumns', 'StrictFieldError', 'levenshtein',
      // ledger
      'nextId', 'findCollisions',
    ];
    for (const name of expected) {
      assert.ok(name in core, `missing export: ${name}`);
    }
  });

  test('package has zero runtime dependencies', async () => {
    const { readFile } = await import('node:fs/promises');
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
    assert.deepEqual(pkg.dependencies ?? {}, {});
    assert.equal(pkg.type, 'module');
    assert.equal(pkg.name, '@geoledger/core');
  });

  test('APP_VERSION in code matches nothing hardcoded elsewhere — constants agree', () => {
    assert.equal(core.APP_VERSION, '0.6.0-dev');
    assert.equal(core.SCHEMA_VERSION, 29);
  });
});
