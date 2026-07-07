/**
 * format.js — single source for numeric display/storage formatting.
 *
 * INVARIANT: every card, report and export formats depths, compass readings
 * and stored numerics through these functions, so a driller always sees 1 dp,
 * a geologist 2 dp, and bearings are always 3-digit 001–360. Non-finite
 * input is rejected by returning null — never NaN strings, never throws.
 *
 * PREVENTS: per-card copy-pasted toFixed() calls drifting (mixed 1dp/2dp
 * depth displays, bearings shown as '0'/'360'/'000' inconsistently).
 */

/**
 * Format a depth for display by role.
 * @param {number} value - depth in metres.
 * @param {'driller'|'geologist'} role - 'driller' → 1 decimal place, 'geologist' → 2.
 * @returns {string|null} formatted string, or null for non-finite input or unknown role.
 */
export function formatDepth(value, role) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (role === 'driller') return value.toFixed(1);
  if (role === 'geologist') return value.toFixed(2);
  return null;
}

/**
 * Format a compass alpha angle: 2-digit zero-padded, valid range 0–90.
 * @param {number} v - alpha angle in degrees.
 * @returns {string|null} e.g. '05', '90'; null for non-finite or out-of-range input.
 */
export function formatCompassAlpha(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  const n = Math.round(v);
  if (n < 0 || n > 90) return null;
  return String(n).padStart(2, '0');
}

/**
 * Format a compass bearing: 3-digit zero-padded in [1, 360].
 * 0 normalises to 360; values >= 360 or < 0 wrap into range.
 * @param {number} v - bearing in degrees.
 * @returns {string|null} e.g. '001', '090', '360'; null for non-finite input.
 */
export function formatCompassBearing(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  let n = Math.round(v) % 360;
  if (n < 0) n += 360;
  if (n === 0) n = 360;
  return String(n).padStart(3, '0');
}

/**
 * Round a numeric value for storage: 2 decimal places, returned as a Number.
 * @param {number} v
 * @returns {number|null} null for non-finite input.
 */
export function roundForStorage(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  return Number(v.toFixed(2));
}
