/**
 * @geoledger/core — the anti-drift kernel.
 *
 * Re-exports every module so Electron main, the React renderer and
 * standalone scripts all import ONE implementation:
 *
 *   import { getTrayDir, strictInsert, SCHEMA_VERSION } from '@geoledger/core';
 */

export * from './version.js';
export * from './paths.js';
export * from './format.js';
export * from './truth.js';
export * from './intervals.js';
export * from './validation.js';
export * from './records.js';
export * from './ledger.js';
