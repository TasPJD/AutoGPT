/**
 * paths.js — canonical photo/tray path construction.
 *
 * INVARIANT: every GeoLedger working path is
 *   <baseDir>/<holeId>/GeoLedger/<trayNumber>/
 * The `GeoLedger` segment is MANDATORY: it isolates GL working files from
 * consultant-managed folders (Wet/, Dry/, Pre-Comp/, Geotech Samples/) that
 * live directly under the hole folder. All producers and consumers of photo
 * paths MUST build them through this module — never inline string concat.
 *
 * PREVENTS: 2026-05-21 dual-path duplication — batch_photo_import.js built
 * tray paths inline ("<hole>/<tray>/") and drifted from electron/photo.js,
 * duplicating photo trees and orphaning thumbnails.
 */

/** Consultant-managed folder names that live beside GeoLedger/ under a hole. */
export const CONSULTANT_FOLDERS = Object.freeze(['Wet', 'Dry', 'Pre-Comp', 'Geotech Samples']);

/** The mandatory working-directory segment. */
export const GEOLEDGER_SEGMENT = 'GeoLedger';

/**
 * Determine the separator style of an input path.
 * A path containing any backslash is treated as Windows-style.
 * @param {string} p
 * @returns {'\\'|'/'}
 */
function sepOf(p) {
  return String(p).includes('\\') ? '\\' : '/';
}

/**
 * Split a path into non-empty segments, accepting both separator styles.
 * @param {string} p
 * @returns {string[]}
 */
function segmentsOf(p) {
  return String(p).split(/[\\/]+/).filter((s) => s.length > 0);
}

/**
 * Join base + extra segments using the base path's separator style,
 * always ending with a trailing separator (directory form).
 * @param {string} baseDir
 * @param {string[]} segments
 * @returns {string}
 */
function joinDir(baseDir, segments) {
  const sep = sepOf(baseDir);
  const base = String(baseDir).replace(/[\\/]+$/, '');
  return base + sep + segments.join(sep) + sep;
}

/**
 * Canonical tray directory: <baseDir>/<holeId>/GeoLedger/<trayNumber>/
 * @param {string} baseDir - project photo root.
 * @param {string} holeId - e.g. 'CHB0241D'.
 * @param {string|number} trayNumber - e.g. 12 or '012'.
 * @returns {string} directory path (trailing separator, input's separator style).
 * @throws {TypeError} on empty baseDir/holeId/trayNumber.
 */
export function getTrayDir(baseDir, holeId, trayNumber) {
  if (!baseDir || !String(baseDir).trim()) throw new TypeError('getTrayDir: baseDir is required');
  if (!holeId || !String(holeId).trim()) throw new TypeError('getTrayDir: holeId is required');
  if (trayNumber === null || trayNumber === undefined || String(trayNumber).trim() === '') {
    throw new TypeError('getTrayDir: trayNumber is required');
  }
  return joinDir(baseDir, [String(holeId), GEOLEDGER_SEGMENT, String(trayNumber)]);
}

/**
 * Canonical originals directory: <trayDir>/originals/
 * @param {string} baseDir
 * @param {string} holeId
 * @param {string|number} trayNumber
 * @returns {string}
 */
export function getOriginalsDir(baseDir, holeId, trayNumber) {
  const tray = getTrayDir(baseDir, holeId, trayNumber);
  return tray + 'originals' + sepOf(tray);
}

/**
 * Canonical thumbnails directory: <trayDir>/thumbs/
 * @param {string} baseDir
 * @param {string} holeId
 * @param {string|number} trayNumber
 * @returns {string}
 */
export function getThumbsDir(baseDir, holeId, trayNumber) {
  const tray = getTrayDir(baseDir, holeId, trayNumber);
  return tray + 'thumbs' + sepOf(tray);
}

/**
 * True when `p` ends in the canonical `<hole>/GeoLedger/<tray>` shape
 * (with or without a trailing separator, either separator style).
 * @param {string} p
 * @returns {boolean}
 */
export function isCanonicalTrayPath(p) {
  if (typeof p !== 'string') return false;
  const segs = segmentsOf(p);
  if (segs.length < 3) return false;
  const tray = segs[segs.length - 1];
  const gl = segs[segs.length - 2];
  const hole = segs[segs.length - 3];
  if (gl !== GEOLEDGER_SEGMENT) return false;
  if (tray === GEOLEDGER_SEGMENT || hole === GEOLEDGER_SEGMENT) return false;
  if (CONSULTANT_FOLDERS.includes(tray)) return false;
  return true;
}

/**
 * Repair a legacy tray path of the form `<...>/<hole>/<tray>/` (missing the
 * GeoLedger segment) by inserting `GeoLedger` before the tray segment.
 *
 * - Already-canonical paths are returned unchanged.
 * - Returns null when the path is unrecognisable as a tray path:
 *   fewer than two segments, the tray or hole segment is a consultant folder
 *   (Wet/Dry/Pre-Comp/Geotech Samples), or a stray `GeoLedger` segment sits
 *   in a non-canonical position.
 *
 * Output preserves the input's separator style, leading separator (absolute
 * paths) and trailing-separator presence.
 *
 * @param {string} p
 * @returns {string|null}
 */
export function repairLegacyTrayPath(p) {
  if (typeof p !== 'string' || p.trim() === '') return null;
  if (isCanonicalTrayPath(p)) return p;

  const segs = segmentsOf(p);
  if (segs.length < 2) return null;

  const tray = segs[segs.length - 1];
  const hole = segs[segs.length - 2];

  // A GeoLedger segment anywhere in the tail means this isn't the plain
  // legacy `<hole>/<tray>` form — refuse to guess.
  if (tray === GEOLEDGER_SEGMENT || hole === GEOLEDGER_SEGMENT) return null;
  // Consultant folders are never GeoLedger trays, and never hole ids.
  if (CONSULTANT_FOLDERS.includes(tray) || CONSULTANT_FOLDERS.includes(hole)) return null;

  const sep = sepOf(p);
  const hadLeading = /^[\\/]/.test(p);
  const hadTrailing = /[\\/]$/.test(p);

  const repaired = [...segs.slice(0, -1), GEOLEDGER_SEGMENT, tray];
  return (hadLeading ? sep : '') + repaired.join(sep) + (hadTrailing ? sep : '');
}
