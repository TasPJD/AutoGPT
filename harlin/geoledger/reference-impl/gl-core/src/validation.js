/**
 * validation.js — advisory validation runner.
 *
 * INVARIANT: validation in GeoLedger is SOFT — it informs, it never blocks.
 * runValidations() never throws and never prevents a save; problems become
 * messages and tbl_validation_flags rows for later review. No rule may pop
 * a modal (alert/confirm) — assertNonBlocking() lets tests lint for that.
 *
 * PREVENTS: C1 validation lock-outs, where blocking modal validation froze
 * field logging mid-shift. Codifies "soft validation, never coercive".
 */

/**
 * @typedef {Object} ValidationRule
 * @property {string} id - stable rule id; used as flag_type for 'flag' level.
 * @property {'info'|'warn'|'flag'} level
 * @property {(record: Object) => boolean} test - truthy when the rule FIRES (a problem exists).
 * @property {(record: Object) => string} message - human-readable description.
 * @property {string} [entity_table] - table the flag attaches to (for level 'flag').
 */

/**
 * @typedef {Object} ValidationFlagRow
 * @property {string} flag_type
 * @property {'info'|'warn'|'flag'} severity
 * @property {string|null} entity_table
 * @property {string|number|null} entity_id
 * @property {string} detail
 * @property {null} created_at - always null; the CALLER stamps the timestamp at insert time.
 */

/**
 * Run advisory validation rules over a record. NEVER throws and never
 * blocks: a rule whose test() or message() throws is reported as a broken
 * rule (level 'warn') rather than propagating.
 *
 * @param {Object} record - the record under validation (record.id, if present, becomes entity_id).
 * @param {ValidationRule[]} rules
 * @param {{entityTable?: string|null, entityId?: string|number|null}} [meta] - flag targeting overrides.
 * @returns {{messages: Array<{id: string, level: 'info'|'warn'|'flag', message: string}>,
 *            flags: ValidationFlagRow[]}}
 */
export function runValidations(record, rules, meta = {}) {
  const messages = [];
  const flags = [];
  if (!Array.isArray(rules)) return { messages, flags };

  for (const rule of rules) {
    if (!rule || typeof rule.test !== 'function') continue;

    let fired = false;
    try {
      fired = Boolean(rule.test(record));
    } catch (err) {
      messages.push({
        id: String(rule.id ?? 'unknown_rule'),
        level: 'warn',
        message: `Validation rule ${String(rule.id ?? '(unnamed)')} threw and was skipped: ${err && err.message ? err.message : String(err)}`,
      });
      continue;
    }
    if (!fired) continue;

    let text;
    try {
      text = typeof rule.message === 'function' ? String(rule.message(record)) : String(rule.message ?? rule.id);
    } catch {
      text = String(rule.id ?? 'validation issue');
    }

    const level = rule.level === 'info' || rule.level === 'warn' || rule.level === 'flag' ? rule.level : 'info';
    messages.push({ id: String(rule.id), level, message: text });

    if (level === 'flag') {
      flags.push({
        flag_type: String(rule.id),
        severity: level,
        entity_table: rule.entity_table ?? meta.entityTable ?? null,
        entity_id: meta.entityId ?? (record && record.id !== undefined ? record.id : null),
        detail: text,
        created_at: null,
      });
    }
  }

  return { messages, flags };
}

/**
 * Test-time lint: returns false when a function's source contains a blocking
 * browser modal call (`alert(` or `confirm(`), true otherwise. Use it in unit
 * tests to guarantee validation code stays non-blocking.
 *
 * @param {Function|string} fnSource - a function, or its source text.
 * @returns {boolean} true when no blocking call is present.
 */
export function assertNonBlocking(fnSource) {
  const src = typeof fnSource === 'function' ? fnSource.toString() : String(fnSource ?? '');
  return !/\b(?:alert|confirm)\s*\(/.test(src);
}
