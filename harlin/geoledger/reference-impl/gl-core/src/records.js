/**
 * records.js — strict field validation for INSERT/UPDATE record objects.
 *
 * INVARIANT: a record key that does not match a real table column is a HARD
 * error, thrown loudly with did-you-mean suggestions — data is never
 * silently dropped on the floor.
 *
 * PREVENTS: L-18 — insertRecord() silently dropped mismatched fields, and
 * 223 MagSus readings were lost unrecoverably because a caller spelled a
 * column name wrong and nothing complained.
 */

/**
 * Error thrown when a record carries keys that are not table columns.
 * @property {string[]} unknownKeys - the offending record keys.
 * @property {Object<string, string|null>} suggestions - unknown key → nearest column name (levenshtein ≤ 2) or null.
 * @property {string} operation - 'insert' | 'update'.
 */
export class StrictFieldError extends Error {
  /**
   * @param {'insert'|'update'} operation
   * @param {string[]} unknownKeys
   * @param {Object<string, string|null>} suggestions
   */
  constructor(operation, unknownKeys, suggestions) {
    const parts = unknownKeys.map((k) => {
      const s = suggestions[k];
      return s ? `"${k}" (did you mean "${s}"?)` : `"${k}"`;
    });
    super(`Strict ${operation} rejected unknown field(s): ${parts.join(', ')}. `
      + 'Fields must exactly match table columns — nothing is silently dropped.');
    this.name = 'StrictFieldError';
    this.operation = operation;
    this.unknownKeys = unknownKeys;
    this.suggestions = suggestions;
  }
}

/**
 * Levenshtein edit distance between two strings.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[n];
}

/**
 * Nearest column name within edit distance 2 (case-insensitive), or null.
 * @param {string} key
 * @param {string[]} columns
 * @returns {string|null}
 */
function nearestColumn(key, columns) {
  let best = null;
  let bestDist = 3; // suggestions require distance <= 2
  const lower = key.toLowerCase();
  for (const col of columns) {
    const d = levenshtein(lower, col.toLowerCase());
    if (d < bestDist) {
      bestDist = d;
      best = col;
    }
  }
  return best;
}

/**
 * Partition a record's keys against a table's column list — dry-run report.
 * @param {string[]} tableColumns - column names, e.g. from PRAGMA table_info.
 * @param {Object} record
 * @returns {{known: string[],
 *            unknown: Array<{key: string, suggestion: string|null}>,
 *            missing: string[]}} missing = columns the record does not populate.
 */
export function diffColumns(tableColumns, record) {
  const cols = normaliseColumns(tableColumns);
  const keys = Object.keys(record ?? {});
  const colSet = new Set(cols);
  const known = keys.filter((k) => colSet.has(k));
  const unknown = keys
    .filter((k) => !colSet.has(k))
    .map((key) => ({ key, suggestion: nearestColumn(key, cols) }));
  const keySet = new Set(keys);
  const missing = cols.filter((c) => !keySet.has(c));
  return { known, unknown, missing };
}

/**
 * @param {string[]} tableColumns
 * @returns {string[]}
 */
function normaliseColumns(tableColumns) {
  if (!Array.isArray(tableColumns) || tableColumns.length === 0) {
    throw new TypeError('tableColumns must be a non-empty array of column names');
  }
  return tableColumns.map((c) => String(c));
}

/**
 * @param {'insert'|'update'} operation
 * @param {string[]} tableColumns
 * @param {Object} record
 * @returns {{columns: string[], values: unknown[]}}
 */
function strictCheck(operation, tableColumns, record) {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) {
    throw new TypeError(`strict ${operation}: record must be a plain object`);
  }
  const { unknown } = diffColumns(tableColumns, record);
  if (unknown.length > 0) {
    const suggestions = {};
    for (const u of unknown) suggestions[u.key] = u.suggestion;
    throw new StrictFieldError(operation, unknown.map((u) => u.key), suggestions);
  }
  const cols = normaliseColumns(tableColumns).filter((c) => Object.prototype.hasOwnProperty.call(record, c));
  return { columns: cols, values: cols.map((c) => record[c]) };
}

/**
 * Validate a record for INSERT. Every key must be a real column, or a
 * StrictFieldError is thrown (with did-you-mean suggestions).
 *
 * @param {string[]} tableColumns - column names from PRAGMA table_info.
 * @param {Object} record
 * @returns {{columns: string[], values: unknown[], placeholders: string}}
 *   columns/values in table-column order; placeholders like '?, ?, ?'.
 * @throws {StrictFieldError} on any unknown key.
 */
export function strictInsert(tableColumns, record) {
  const { columns, values } = strictCheck('insert', tableColumns, record);
  if (columns.length === 0) throw new TypeError('strict insert: record has no insertable fields');
  return { columns, values, placeholders: columns.map(() => '?').join(', ') };
}

/**
 * Validate a record for UPDATE. Every key must be a real column, or a
 * StrictFieldError is thrown (with did-you-mean suggestions).
 *
 * @param {string[]} tableColumns - column names from PRAGMA table_info.
 * @param {Object} record - fields to set (the caller supplies its own WHERE clause).
 * @returns {{columns: string[], values: unknown[], setClause: string}}
 *   setClause like 'depth_from = ?, depth_to = ?'.
 * @throws {StrictFieldError} on any unknown key.
 */
export function strictUpdate(tableColumns, record) {
  const { columns, values } = strictCheck('update', tableColumns, record);
  if (columns.length === 0) throw new TypeError('strict update: record has no updatable fields');
  return { columns, values, setClause: columns.map((c) => `${c} = ?`).join(', ') };
}
