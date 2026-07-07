import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDepth,
  formatCompassAlpha,
  formatCompassBearing,
  roundForStorage,
} from '../src/format.js';

describe('format.formatDepth', () => {
  test('driller sees 1 decimal place', () => {
    assert.equal(formatDepth(123.456, 'driller'), '123.5');
    assert.equal(formatDepth(0, 'driller'), '0.0');
  });

  test('geologist sees 2 decimal places', () => {
    assert.equal(formatDepth(123.456, 'geologist'), '123.46');
    assert.equal(formatDepth(7, 'geologist'), '7.00');
  });

  test('rejects non-finite input and unknown roles with null', () => {
    assert.equal(formatDepth(NaN, 'driller'), null);
    assert.equal(formatDepth(Infinity, 'geologist'), null);
    assert.equal(formatDepth('12', 'driller'), null);
    assert.equal(formatDepth(12, 'surveyor'), null);
    assert.equal(formatDepth(12), null);
  });
});

describe('format.formatCompassAlpha', () => {
  test('2-digit zero-padded within 0-90', () => {
    assert.equal(formatCompassAlpha(0), '00');
    assert.equal(formatCompassAlpha(5), '05');
    assert.equal(formatCompassAlpha(45.4), '45');
    assert.equal(formatCompassAlpha(90), '90');
  });

  test('out-of-range and non-finite return null', () => {
    assert.equal(formatCompassAlpha(-1), null);
    assert.equal(formatCompassAlpha(91), null);
    assert.equal(formatCompassAlpha(NaN), null);
    assert.equal(formatCompassAlpha(undefined), null);
  });
});

describe('format.formatCompassBearing', () => {
  test('3-digit zero-padded', () => {
    assert.equal(formatCompassBearing(1), '001');
    assert.equal(formatCompassBearing(90), '090');
    assert.equal(formatCompassBearing(359), '359');
  });

  test('normalises 0 to 360', () => {
    assert.equal(formatCompassBearing(0), '360');
  });

  test('wraps values >= 360 and < 0 into [1, 360]', () => {
    assert.equal(formatCompassBearing(360), '360');
    assert.equal(formatCompassBearing(361), '001');
    assert.equal(formatCompassBearing(725), '005');
    assert.equal(formatCompassBearing(-10), '350');
    assert.equal(formatCompassBearing(-360), '360');
  });

  test('non-finite returns null', () => {
    assert.equal(formatCompassBearing(NaN), null);
    assert.equal(formatCompassBearing(Infinity), null);
    assert.equal(formatCompassBearing(null), null);
  });
});

describe('format.roundForStorage', () => {
  test('rounds to 2dp as a Number', () => {
    assert.equal(roundForStorage(1.005), Number((1.005).toFixed(2)));
    assert.equal(roundForStorage(123.456), 123.46);
    assert.equal(roundForStorage(7), 7);
    assert.equal(typeof roundForStorage(1.239), 'number');
    assert.equal(roundForStorage(1.239), 1.24);
  });

  test('non-finite returns null', () => {
    assert.equal(roundForStorage(NaN), null);
    assert.equal(roundForStorage(-Infinity), null);
    assert.equal(roundForStorage('1.23'), null);
  });
});
