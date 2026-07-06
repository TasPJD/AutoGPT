import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getTrayDir,
  getOriginalsDir,
  getThumbsDir,
  isCanonicalTrayPath,
  repairLegacyTrayPath,
  CONSULTANT_FOLDERS,
} from '../src/paths.js';

describe('paths.getTrayDir', () => {
  test('builds canonical posix tray dir with mandatory GeoLedger segment', () => {
    assert.equal(
      getTrayDir('/data/photos', 'CHB0241D', 12),
      '/data/photos/CHB0241D/GeoLedger/12/',
    );
  });

  test('builds windows-style tray dir preserving backslashes', () => {
    assert.equal(
      getTrayDir('C:\\Photos', 'CHB0241D', '012'),
      'C:\\Photos\\CHB0241D\\GeoLedger\\012\\',
    );
  });

  test('strips trailing separators from baseDir', () => {
    assert.equal(getTrayDir('/data/photos/', 'H1', 3), '/data/photos/H1/GeoLedger/3/');
    assert.equal(getTrayDir('C:\\Photos\\', 'H1', 3), 'C:\\Photos\\H1\\GeoLedger\\3\\');
  });

  test('rejects missing arguments', () => {
    assert.throws(() => getTrayDir('', 'H1', 1), TypeError);
    assert.throws(() => getTrayDir('/base', '', 1), TypeError);
    assert.throws(() => getTrayDir('/base', 'H1', ''), TypeError);
    assert.throws(() => getTrayDir('/base', 'H1', null), TypeError);
  });
});

describe('paths.getOriginalsDir / getThumbsDir', () => {
  test('appends originals/ and thumbs/ under the canonical tray dir', () => {
    assert.equal(
      getOriginalsDir('/data', 'H1', 5),
      '/data/H1/GeoLedger/5/originals/',
    );
    assert.equal(
      getThumbsDir('/data', 'H1', 5),
      '/data/H1/GeoLedger/5/thumbs/',
    );
  });

  test('windows separator style flows through subdirs', () => {
    assert.equal(getOriginalsDir('D:\\pics', 'H1', 5), 'D:\\pics\\H1\\GeoLedger\\5\\originals\\');
    assert.equal(getThumbsDir('D:\\pics', 'H1', 5), 'D:\\pics\\H1\\GeoLedger\\5\\thumbs\\');
  });
});

describe('paths.isCanonicalTrayPath', () => {
  test('accepts canonical paths, both separators, with/without trailing sep', () => {
    assert.equal(isCanonicalTrayPath('/data/CHB0241D/GeoLedger/12/'), true);
    assert.equal(isCanonicalTrayPath('/data/CHB0241D/GeoLedger/12'), true);
    assert.equal(isCanonicalTrayPath('C:\\Photos\\CHB0241D\\GeoLedger\\12\\'), true);
  });

  test('rejects the legacy form missing the GeoLedger segment', () => {
    assert.equal(isCanonicalTrayPath('/data/CHB0241D/12/'), false);
  });

  test('rejects consultant folders posing as trays', () => {
    for (const folder of CONSULTANT_FOLDERS) {
      assert.equal(isCanonicalTrayPath(`/data/CHB0241D/GeoLedger/${folder}/`), false);
    }
  });

  test('rejects junk and non-strings', () => {
    assert.equal(isCanonicalTrayPath('GeoLedger'), false);
    assert.equal(isCanonicalTrayPath('/GeoLedger/12'), false);
    assert.equal(isCanonicalTrayPath(null), false);
    assert.equal(isCanonicalTrayPath(42), false);
  });
});

describe('paths.repairLegacyTrayPath', () => {
  test('REGRESSION 2026-05-21: repairs the legacy <hole>/<tray>/ form built by batch_photo_import.js', () => {
    assert.equal(
      repairLegacyTrayPath('/data/photos/CHB0241D/12/'),
      '/data/photos/CHB0241D/GeoLedger/12/',
    );
  });

  test('preserves windows separators and trailing-sep presence', () => {
    assert.equal(
      repairLegacyTrayPath('C:\\Photos\\CHB0241D\\12'),
      'C:\\Photos\\CHB0241D\\GeoLedger\\12',
    );
    assert.equal(
      repairLegacyTrayPath('C:\\Photos\\CHB0241D\\12\\'),
      'C:\\Photos\\CHB0241D\\GeoLedger\\12\\',
    );
  });

  test('preserves absolute (leading separator) form', () => {
    assert.equal(repairLegacyTrayPath('/CHB0241D/12'), '/CHB0241D/GeoLedger/12');
    assert.equal(repairLegacyTrayPath('CHB0241D/12'), 'CHB0241D/GeoLedger/12');
  });

  test('already-canonical paths pass through unchanged', () => {
    const p = '/data/CHB0241D/GeoLedger/12/';
    assert.equal(repairLegacyTrayPath(p), p);
  });

  test('returns null for unrecognisable paths', () => {
    assert.equal(repairLegacyTrayPath(''), null);
    assert.equal(repairLegacyTrayPath('/onlyone'), null);
    // consultant folders are never GL trays
    assert.equal(repairLegacyTrayPath('/data/CHB0241D/Wet/'), null);
    assert.equal(repairLegacyTrayPath('/data/CHB0241D/Geotech Samples/'), null);
    // stray GeoLedger in a non-canonical position
    assert.equal(repairLegacyTrayPath('/GeoLedger/12/'), null); // GeoLedger where the hole should be
    assert.equal(repairLegacyTrayPath('/data/CHB0241D/12/GeoLedger'), null); // GeoLedger where the tray should be
    assert.equal(repairLegacyTrayPath(null), null);
  });

  test('repaired output validates as canonical', () => {
    const repaired = repairLegacyTrayPath('/data/photos/CHB0241D/12/');
    assert.equal(isCanonicalTrayPath(repaired), true);
  });
});
