/**
 * truth.js — Data Truth Architecture cascade for hole depth.
 *
 * INVARIANT: the effective target depth of a hole is resolved through ONE
 * cascade — declared final_depth → as_drilled_depth → planned_depth → 300 m
 * fallback — and End-Of-Hole is DECLARED by a person, never assumed by code.
 * This module deliberately exports NO function that writes final_depth;
 * reconciliation only ever emits advisory validation flags.
 *
 * PREVENTS: components each inventing their own depth fallback chain, and
 * any regression toward auto-stamping final_depth from logged data (EOH is
 * declared, never assumed).
 */

const EOH_TOLERANCE = 0.05; // metres
const FALLBACK_DEPTH = 300; // metres

/**
 * @param {*} v
 * @returns {boolean} true for a finite, positive number.
 */
function isUsableDepth(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

/**
 * @typedef {Object} EffectiveDepth
 * @property {number} value - resolved depth in metres.
 * @property {'declared'|'as_drilled'|'planned'|'fallback'} source
 */

/**
 * Resolve the effective target depth of a hole through the truth cascade.
 * @param {{final_depth?:number, as_drilled_depth?:number, planned_depth?:number}|null|undefined} hole
 * @returns {EffectiveDepth}
 */
export function effectiveTargetDepth(hole) {
  const h = hole ?? {};
  if (isUsableDepth(h.final_depth)) return { value: h.final_depth, source: 'declared' };
  if (isUsableDepth(h.as_drilled_depth)) return { value: h.as_drilled_depth, source: 'as_drilled' };
  if (isUsableDepth(h.planned_depth)) return { value: h.planned_depth, source: 'planned' };
  return { value: FALLBACK_DEPTH, source: 'fallback' };
}

/**
 * @typedef {Object} EohFlag
 * @property {'EOH_MISMATCH'|'MULTIPLE_EOH_DECLARATIONS'|'EOH_BELOW_DEEPER_DATA'} flag_type
 * @property {'warn'|'flag'} severity
 * @property {string} entity_table
 * @property {string|number|null} entity_id
 * @property {string} detail
 * @property {null} created_at - caller stamps the timestamp on insert.
 */

/**
 * Reconcile declared End-Of-Hole against logged data. PURE — returns an
 * array of advisory validation-flag objects and performs NO writes. It never
 * sets or suggests setting final_depth: EOH is declared, never assumed.
 *
 * Flags emitted:
 * - EOH_MISMATCH: deepest logged depth exceeds the declared final depth by
 *   more than 0.05 m.
 * - EOH_BELOW_DEEPER_DATA: declared final depth sits below (shallower than)
 *   deeper logged data — declared < deepest − 0.05.
 * - MULTIPLE_EOH_DECLARATIONS: more than one EOH declaration exists and they
 *   disagree by more than 0.05 m.
 *
 * @param {Object} input
 * @param {number|null|undefined} [input.declaredFinalDepth] - user-declared final depth (m).
 * @param {Array<number|{depth:number}>} [input.eohDeclarations] - all EOH declarations on record.
 * @param {number|null|undefined} [input.deepestLoggedDepth] - deepest depth_to across all logged records (m).
 * @param {string|number|null} [input.holeId] - optional entity id stamped onto flags.
 * @returns {EohFlag[]}
 */
export function reconcileEoh({ declaredFinalDepth, eohDeclarations = [], deepestLoggedDepth, holeId = null } = {}) {
  /** @type {EohFlag[]} */
  const flags = [];

  const makeFlag = (flag_type, severity, detail) => ({
    flag_type,
    severity,
    entity_table: 'tbl_holes',
    entity_id: holeId,
    detail,
    created_at: null,
  });

  const declared = typeof declaredFinalDepth === 'number' && Number.isFinite(declaredFinalDepth)
    ? declaredFinalDepth
    : null;
  const deepest = typeof deepestLoggedDepth === 'number' && Number.isFinite(deepestLoggedDepth)
    ? deepestLoggedDepth
    : null;

  if (declared !== null && deepest !== null && deepest > declared
      && Math.abs(declared - deepest) > EOH_TOLERANCE) {
    flags.push(makeFlag(
      'EOH_MISMATCH',
      'warn',
      `Deepest logged depth ${deepest} m exceeds declared final depth ${declared} m by more than ${EOH_TOLERANCE} m.`,
    ));
  }

  if (declared !== null && deepest !== null && declared < deepest - EOH_TOLERANCE) {
    flags.push(makeFlag(
      'EOH_BELOW_DEEPER_DATA',
      'flag',
      `Declared final depth ${declared} m is shallower than logged data reaching ${deepest} m. EOH is declared, never assumed — review the declaration; final_depth will not be changed automatically.`,
    ));
  }

  const declValues = (Array.isArray(eohDeclarations) ? eohDeclarations : [])
    .map((d) => (typeof d === 'number' ? d : d && typeof d.depth === 'number' ? d.depth : NaN))
    .filter((n) => Number.isFinite(n));

  if (declValues.length > 1) {
    const min = Math.min(...declValues);
    const max = Math.max(...declValues);
    if (max - min > EOH_TOLERANCE) {
      flags.push(makeFlag(
        'MULTIPLE_EOH_DECLARATIONS',
        'flag',
        `${declValues.length} EOH declarations disagree (${min} m to ${max} m, spread ${Number((max - min).toFixed(3))} m > ${EOH_TOLERANCE} m).`,
      ));
    }
  }

  return flags;
}
