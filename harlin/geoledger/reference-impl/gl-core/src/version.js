/**
 * version.js — single source of truth for application and schema versions.
 *
 * INVARIANT: exactly ONE place in the whole GeoLedger codebase declares
 * APP_VERSION and SCHEMA_VERSION. Every process (Electron main, renderer,
 * sync engine, import scripts) imports them from here and uses
 * assertVersionCompatible() to decide whether a changeset may be applied.
 *
 * PREVENTS: sync.js once hardcoded its own stale SCHEMA_VERSION=18 while the
 * database was at a later schema, silently mis-gating changesets; main.js
 * separately hardcoded APP_VERSION. Both drifted independently.
 */

/** Application version string. The only place it is declared. */
export const APP_VERSION = '0.6.0-dev';

/** Database schema version. The only place it is declared. */
export const SCHEMA_VERSION = 29;

/**
 * @typedef {Object} VersionDecision
 * @property {boolean} ok - true only when the changeset may be applied as-is.
 * @property {'apply'|'skip_newer'|'upgrade_required'} action
 *   - 'apply': schema versions match, apply the changeset.
 *   - 'skip_newer': the local schema is NEWER than the changeset's; skip it
 *     (the producer must upgrade and re-emit).
 *   - 'upgrade_required': the changeset was produced by a NEWER schema than
 *     ours; the local install must upgrade before it can apply it.
 */

/**
 * Decide whether a changeset produced under `changesetSchemaVersion` can be
 * applied to a database at `localSchemaVersion`.
 *
 * @param {number} changesetSchemaVersion - schema version stamped on the incoming changeset.
 * @param {number} [localSchemaVersion=SCHEMA_VERSION] - schema version of the local database.
 * @returns {VersionDecision}
 * @throws {TypeError} if either version is not a non-negative integer.
 */
export function assertVersionCompatible(changesetSchemaVersion, localSchemaVersion = SCHEMA_VERSION) {
  for (const [name, v] of [
    ['changesetSchemaVersion', changesetSchemaVersion],
    ['localSchemaVersion', localSchemaVersion],
  ]) {
    if (!Number.isInteger(v) || v < 0) {
      throw new TypeError(`${name} must be a non-negative integer, got ${String(v)}`);
    }
  }

  if (changesetSchemaVersion === localSchemaVersion) {
    return { ok: true, action: 'apply' };
  }
  if (changesetSchemaVersion < localSchemaVersion) {
    return { ok: false, action: 'skip_newer' };
  }
  return { ok: false, action: 'upgrade_required' };
}
