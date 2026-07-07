/**
 * intervals.js — the shared interval engine for ALL cards
 * (GeoTech, Geology, Measurements, CoreTrays, ...).
 *
 * INVARIANT: there is exactly one implementation of depth propagation,
 * split/merge, gap-heal delete, overlap detection and the GT dual-stream
 * rule. Cards call these pure functions over arrays of
 * {id, depth_from, depth_to, ...rest}; no card carries its own copy.
 *
 * PREVENTS: CHB0241D 69→153 row churn (split logic re-implemented per card
 * losing parent columns); per-card propagateDepths drift; ISSUES A3/H1/H5/H6.
 */

/** Valid GT dual-stream logging systems. */
export const LOGGING_SYSTEMS = Object.freeze(['FIELD_TECH', 'GEOLOGIST', 'RECONCILED']);

const EPS = 1e-9;

/**
 * @typedef {Object} IntervalRow
 * @property {string|number} id
 * @property {number} depth_from
 * @property {number} depth_to
 */

/**
 * Sort rows by depth_from (stable copy; input never mutated).
 * @param {IntervalRow[]} rows
 * @returns {IntervalRow[]}
 */
function sortRows(rows) {
  return [...rows].sort((a, b) => a.depth_from - b.depth_from || a.depth_to - b.depth_to);
}

/**
 * Apply an edited row and propagate its depth change to immediate
 * neighbours: adjusting a to-depth moves the NEXT row's from-depth;
 * adjusting a from-depth moves the PREVIOUS row's to-depth.
 * Pure — returns a new array sorted by depth_from.
 *
 * @param {IntervalRow[]} rows
 * @param {IntervalRow & {id: string|number}} changedRow - partial or full row; matched by id.
 * @returns {IntervalRow[]}
 * @throws {RangeError} when changedRow.id is not present in rows.
 */
export function propagateDepths(rows, changedRow) {
  const sorted = sortRows(rows);
  const idx = sorted.findIndex((r) => r.id === changedRow.id);
  if (idx === -1) throw new RangeError(`propagateDepths: no row with id ${String(changedRow.id)}`);

  const old = sorted[idx];
  const updated = { ...old, ...changedRow };
  const out = sorted.slice();
  out[idx] = updated;

  if (updated.depth_to !== old.depth_to && idx + 1 < out.length) {
    out[idx + 1] = { ...out[idx + 1], depth_from: updated.depth_to };
  }
  if (updated.depth_from !== old.depth_from && idx > 0) {
    out[idx - 1] = { ...out[idx - 1], depth_to: updated.depth_from };
  }
  return sortRows(out);
}

/**
 * Split one interval at `atDepth` into two child rows. Both children
 * replicate ALL parent columns (every non-depth field is copied verbatim to
 * BOTH halves) and are flagged for human review — never silently trusted.
 *
 * @param {IntervalRow[]} rows
 * @param {string|number} id - row to split.
 * @param {number} atDepth - must be strictly inside (depth_from, depth_to).
 * @returns {{rows: IntervalRow[], review: 'SPLIT_CHILD_RECORDS_REVIEW'}}
 * @throws {RangeError} on unknown id or atDepth outside the open interval.
 */
export function splitInterval(rows, id, atDepth) {
  const sorted = sortRows(rows);
  const idx = sorted.findIndex((r) => r.id === id);
  if (idx === -1) throw new RangeError(`splitInterval: no row with id ${String(id)}`);
  const parent = sorted[idx];
  if (!(typeof atDepth === 'number' && Number.isFinite(atDepth))
      || atDepth <= parent.depth_from + EPS || atDepth >= parent.depth_to - EPS) {
    throw new RangeError(
      `splitInterval: atDepth ${String(atDepth)} is not strictly inside (${parent.depth_from}, ${parent.depth_to})`,
    );
  }

  const upper = { ...parent, id: `${parent.id}.1`, depth_from: parent.depth_from, depth_to: atDepth };
  const lower = { ...parent, id: `${parent.id}.2`, depth_from: atDepth, depth_to: parent.depth_to };

  const out = sorted.slice();
  out.splice(idx, 1, upper, lower);
  return { rows: sortRows(out), review: 'SPLIT_CHILD_RECORDS_REVIEW' };
}

/**
 * Merge two adjacent intervals into one row spanning both. The shallower
 * row's non-depth columns are kept; the merged row keeps the shallower id.
 *
 * @param {IntervalRow[]} rows
 * @param {string|number} idA
 * @param {string|number} idB
 * @returns {IntervalRow[]}
 * @throws {RangeError} on unknown ids or non-adjacent intervals.
 */
export function mergeIntervals(rows, idA, idB) {
  const sorted = sortRows(rows);
  const a = sorted.find((r) => r.id === idA);
  const b = sorted.find((r) => r.id === idB);
  if (!a) throw new RangeError(`mergeIntervals: no row with id ${String(idA)}`);
  if (!b) throw new RangeError(`mergeIntervals: no row with id ${String(idB)}`);
  if (a === b) throw new RangeError('mergeIntervals: idA and idB refer to the same row');

  const [first, second] = a.depth_from <= b.depth_from ? [a, b] : [b, a];
  if (Math.abs(first.depth_to - second.depth_from) > 0.001) {
    throw new RangeError(
      `mergeIntervals: rows ${String(first.id)} and ${String(second.id)} are not adjacent `
      + `(${first.depth_to} vs ${second.depth_from})`,
    );
  }

  const merged = { ...first, depth_from: first.depth_from, depth_to: second.depth_to };
  return sortRows(sorted.filter((r) => r !== a && r !== b).concat(merged));
}

/**
 * Delete a row and heal the gap it leaves: the previous row's depth_to is
 * extended down to the deleted row's depth_to (or, for the first row, the
 * next row's depth_from is extended up).
 *
 * @param {IntervalRow[]} rows
 * @param {string|number} id
 * @returns {IntervalRow[]}
 * @throws {RangeError} on unknown id.
 */
export function gapHealDelete(rows, id) {
  const sorted = sortRows(rows);
  const idx = sorted.findIndex((r) => r.id === id);
  if (idx === -1) throw new RangeError(`gapHealDelete: no row with id ${String(id)}`);
  const removed = sorted[idx];
  const out = sorted.slice(0, idx).concat(sorted.slice(idx + 1));
  if (idx > 0) {
    out[idx - 1] = { ...out[idx - 1], depth_to: removed.depth_to };
  } else if (out.length > 0) {
    out[0] = { ...out[0], depth_from: removed.depth_from };
  }
  return out;
}

/**
 * Suggest the default {depth_from, depth_to} for a NEW interval:
 * from = deepest existing depth_to (0 if no rows);
 * to   = currentDepth when it is deeper than from, otherwise from + 1.
 *
 * @param {IntervalRow[]} rows
 * @param {number} [currentDepth] - e.g. current drilling/logging depth.
 * @returns {{depth_from: number, depth_to: number}}
 */
export function findSmartDefaultInterval(rows, currentDepth) {
  const from = rows.length === 0 ? 0 : Math.max(...rows.map((r) => r.depth_to));
  const to = typeof currentDepth === 'number' && Number.isFinite(currentDepth) && currentDepth > from + EPS
    ? currentDepth
    : from + 1;
  return { depth_from: from, depth_to: to };
}

/**
 * Find all strictly-overlapping pairs (shared endpoints do not overlap).
 * @param {IntervalRow[]} rows
 * @returns {Array<{a: string|number, b: string|number, overlap_from: number, overlap_to: number}>}
 */
export function findOverlaps(rows) {
  const sorted = sortRows(rows);
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      if (b.depth_from >= a.depth_to - EPS) break; // sorted: no later row can overlap a
      out.push({
        a: a.id,
        b: b.id,
        overlap_from: Math.max(a.depth_from, b.depth_from),
        overlap_to: Math.min(a.depth_to, b.depth_to),
      });
    }
  }
  return out;
}

/**
 * Enforce the GT dual-stream rule:
 * - Every row MUST carry logging_system ∈ {'FIELD_TECH','GEOLOGIST','RECONCILED'}.
 * - Overlapping rows from DIFFERENT streams are legitimate (a geologist may
 *   re-log the field tech's intervals) → reported as soft warnings only.
 * - Overlapping rows within the SAME stream are a data error → structured
 *   {code:'INTERVAL_CONFLICT', ...} error objects.
 *
 * @param {Array<IntervalRow & {logging_system?: string}>} rows
 * @returns {{ok: boolean,
 *   errors: Array<{code: 'INTERVAL_CONFLICT'|'INVALID_LOGGING_SYSTEM', ids: Array<string|number>,
 *     logging_system?: string, overlap_from?: number, overlap_to?: number, message: string}>,
 *   warnings: Array<{code: 'CROSS_STREAM_OVERLAP', ids: Array<string|number>,
 *     streams: string[], overlap_from: number, overlap_to: number, message: string}>}}
 */
export function checkDualStreamConflict(rows) {
  const errors = [];
  const warnings = [];

  for (const r of rows) {
    if (!LOGGING_SYSTEMS.includes(r.logging_system)) {
      errors.push({
        code: 'INVALID_LOGGING_SYSTEM',
        ids: [r.id],
        logging_system: r.logging_system,
        message: `Row ${String(r.id)} has logging_system ${JSON.stringify(r.logging_system ?? null)}; `
          + `must be one of ${LOGGING_SYSTEMS.join(', ')}.`,
      });
    }
  }

  for (const ov of findOverlaps(rows)) {
    const a = rows.find((r) => r.id === ov.a);
    const b = rows.find((r) => r.id === ov.b);
    if (a.logging_system === b.logging_system) {
      errors.push({
        code: 'INTERVAL_CONFLICT',
        ids: [a.id, b.id],
        logging_system: a.logging_system,
        overlap_from: ov.overlap_from,
        overlap_to: ov.overlap_to,
        message: `Rows ${String(a.id)} and ${String(b.id)} in stream ${String(a.logging_system)} `
          + `overlap ${ov.overlap_from}–${ov.overlap_to} m.`,
      });
    } else {
      warnings.push({
        code: 'CROSS_STREAM_OVERLAP',
        ids: [a.id, b.id],
        streams: [a.logging_system, b.logging_system],
        overlap_from: ov.overlap_from,
        overlap_to: ov.overlap_to,
        message: `Rows ${String(a.id)} (${String(a.logging_system)}) and ${String(b.id)} `
          + `(${String(b.logging_system)}) overlap ${ov.overlap_from}–${ov.overlap_to} m across streams.`,
      });
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
