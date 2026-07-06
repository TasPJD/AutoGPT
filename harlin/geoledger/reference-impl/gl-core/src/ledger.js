/**
 * ledger.js — governance ledger id utilities for MEMORY.md / PROJECT_LOG.md.
 *
 * INVARIANT: decision (D-###) and lesson (L-###) ids are assigned
 * monotonically from the set of ids already on record, and the same id is
 * never attached to two different texts.
 *
 * PREVENTS: D-46..D-51 and L-18..L-20 double-assignment, where parallel
 * edits both "took the next number" by eye and collided.
 */

/**
 * Next monotonic ledger id for a prefix, zero-padded 'D-052' / 'L-024' style.
 * Ids that do not match `<prefix>-<digits>` are ignored. Padding width is
 * the widest digit run seen among existing ids for the prefix (minimum 3).
 *
 * @param {string[]} existingIds - all ids already assigned (any prefixes; filtered here).
 * @param {string} prefix - e.g. 'D' or 'L'.
 * @returns {string} e.g. 'D-052'.
 * @throws {TypeError} on empty prefix.
 */
export function nextId(existingIds, prefix) {
  if (typeof prefix !== 'string' || prefix.trim() === '') {
    throw new TypeError('nextId: prefix must be a non-empty string');
  }
  const re = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)$`);
  let max = 0;
  let width = 3;
  for (const id of Array.isArray(existingIds) ? existingIds : []) {
    const m = re.exec(String(id).trim());
    if (!m) continue;
    const n = Number.parseInt(m[1], 10);
    if (n > max) max = n;
    if (m[1].length > width) width = m[1].length;
  }
  return `${prefix}-${String(max + 1).padStart(width, '0')}`;
}

/**
 * Detect ledger id collisions: the same id used with materially different
 * text (compared after trimming and collapsing whitespace). Exact duplicate
 * entries (same id, same text) are NOT collisions.
 *
 * @param {Array<{id: string, text: string}>} entries
 * @returns {Array<{id: string, count: number, texts: string[]}>}
 *   one element per colliding id, texts = the distinct conflicting texts.
 */
export function findCollisions(entries) {
  const byId = new Map();
  for (const e of Array.isArray(entries) ? entries : []) {
    if (!e || typeof e.id !== 'string') continue;
    const id = e.id.trim();
    const text = String(e.text ?? '').trim().replace(/\s+/g, ' ');
    if (!byId.has(id)) byId.set(id, new Map());
    const texts = byId.get(id);
    texts.set(text, (texts.get(text) ?? 0) + 1);
  }

  const collisions = [];
  for (const [id, texts] of byId) {
    if (texts.size > 1) {
      let count = 0;
      for (const c of texts.values()) count += c;
      collisions.push({ id, count, texts: [...texts.keys()] });
    }
  }
  return collisions;
}
