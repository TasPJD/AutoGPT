/**
 * @file GeoLedger-schema-aware document builder + incremental sync.
 *
 * Turns rows from `tbl_geology_intervals` (and sibling tables) into
 * embeddable documents: one searchable text blob + metadata used for
 * filtering ({hole_id, project_id, depth_from, depth_to, table, ...}).
 *
 * The builder is deliberately tolerant of field-name drift (description vs
 * comments, mineralisation vs mineralization, percent vs pct) because two
 * decades of logging schemas never agree.
 *
 * @module corpus
 */

/** Default source table name in the GeoLedger SQLite schema. */
export const DEFAULT_TABLE = 'tbl_geology_intervals';

/**
 * @typedef {object} IntervalDoc
 * @property {string|number} id stable row id (interval_id / id / composed fallback)
 * @property {string} text composed searchable text
 * @property {object} metadata { hole_id, project_id, depth_from, depth_to, table, lith_code? }
 */

const first = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== '');

/** Coerce a value that may be a JSON string, array, single object, or scalar into an array. */
function asArray(v) {
  if (v === undefined || v === null || v === '') return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    const s = v.trim();
    if (s.startsWith('[') || s.startsWith('{')) {
      try {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [s];
      }
    }
    return [s];
  }
  return [v];
}

/** Render one alteration entry ({mineral,intensity,style} or string) to text. */
function alterationText(a) {
  if (typeof a === 'string') return `${a} alteration`;
  const parts = [first(a.intensity, a.intensity_code), first(a.mineral, a.mineral_code, a.alteration, a.type), first(a.style, a.style_code)];
  const s = parts.filter(Boolean).join(' ');
  return s ? `${s} alteration` : '';
}

/** Render one mineralisation entry to text. */
function mineralisationText(m) {
  if (typeof m === 'string') return `${m} mineralisation`;
  const mineral = first(m.mineral, m.mineral_code, m.min, m.type);
  const pct = first(m.percent, m.pct, m.percentage, m.abundance);
  const style = first(m.style, m.style_code, m.texture, m.habit);
  const parts = [mineral, pct !== undefined ? `${pct}%` : null, style].filter(Boolean);
  const s = parts.join(' ');
  return s ? `${s} mineralisation` : '';
}

/** Render one vein entry to text. */
function veinText(v) {
  if (typeof v === 'string') return `${v} vein`;
  const parts = [
    first(v.mineral, v.mineral_code, v.fill, v.composition),
    first(v.type, v.vein_type, v.style),
    first(v.percent, v.pct, v.percentage) !== undefined ? `${first(v.percent, v.pct, v.percentage)}%` : null,
    first(v.orientation, v.alpha) !== undefined ? `alpha ${first(v.orientation, v.alpha)}` : null,
  ].filter(Boolean);
  const s = parts.join(' ');
  return s ? `${s} vein` : '';
}

/** Render one structure entry to text. */
function structureText(s) {
  if (typeof s === 'string') return s;
  return [first(s.type, s.structure_type, s.structure), first(s.note, s.comment, s.description)]
    .filter(Boolean)
    .join(' ');
}

/**
 * Look up a lithology code in the rock-board code map, case-insensitively.
 * @param {string} code
 * @param {Record<string,string>} codeMap
 * @returns {string|undefined}
 */
function lookupCode(code, codeMap) {
  if (!codeMap) return undefined;
  return codeMap[code] ?? codeMap[String(code).toUpperCase()] ?? codeMap[String(code).toLowerCase()];
}

/**
 * Build one embeddable document from a geology interval row.
 *
 * Composes: hole id, lithology codes (expanded via the rock-board `codeMap`,
 * keeping the raw code so exact-code search still hits), description/comment
 * fields, alteration entries, mineralisation entries, vein entries,
 * structural notes, weathering and oxidation.
 *
 * @param {object} row a tbl_geology_intervals-shaped row (tolerant of aliases)
 * @param {object} [opts]
 * @param {Record<string,string>} [opts.codeMap] lithology code -> full name
 *   (from GeoLedger's rock-board lookup), e.g. { BAS: 'basalt' }
 * @param {string} [opts.table=DEFAULT_TABLE] source table recorded in metadata
 * @returns {IntervalDoc}
 */
export function buildIntervalDoc(row, opts = {}) {
  const { codeMap, table = DEFAULT_TABLE } = opts;
  if (!row || typeof row !== 'object') throw new TypeError('buildIntervalDoc requires a row object');

  const holeId = first(row.hole_id, row.holeid, row.hole);
  const depthFrom = first(row.depth_from, row.from, row.from_m);
  const depthTo = first(row.depth_to, row.to, row.to_m);
  const id = first(row.interval_id, row.id, row.row_id, row.rowid)
    ?? `${holeId ?? 'unknown'}:${depthFrom ?? '?'}-${depthTo ?? '?'}`;

  /** @type {string[]} */
  const parts = [];
  if (holeId) parts.push(String(holeId));

  // Lithology codes — raw code + rock-board expansion
  const lithCodes = [];
  for (const key of ['lith_code', 'lith', 'lith1', 'lith2', 'lithology', 'rock_type', 'rock_code']) {
    const v = row[key];
    if (v !== undefined && v !== null && v !== '') lithCodes.push(String(v));
  }
  for (const code of lithCodes) {
    const expanded = lookupCode(code, codeMap);
    parts.push(expanded && expanded.toLowerCase() !== code.toLowerCase() ? `${code} ${expanded}` : code);
  }

  const description = first(row.description, row.desc, row.geology_description);
  if (description) parts.push(String(description));
  const comment = first(row.comment, row.comments, row.notes);
  if (comment) parts.push(String(comment));

  for (const a of asArray(first(row.alteration, row.alterations, row.alt))) {
    const t = alterationText(a);
    if (t) parts.push(t);
  }
  for (const m of asArray(first(row.mineralisation, row.mineralization, row.minerals))) {
    const t = mineralisationText(m);
    if (t) parts.push(t);
  }
  for (const v of asArray(first(row.veins, row.vein, row.veining))) {
    const t = veinText(v);
    if (t) parts.push(t);
  }
  for (const s of asArray(first(row.structure, row.structures, row.structural_notes))) {
    const t = structureText(s);
    if (t) parts.push(t);
  }

  const weathering = first(row.weathering, row.weathering_code, row.wx);
  if (weathering) parts.push(`${weathering} weathering`);
  const oxidation = first(row.oxidation, row.oxidation_code, row.ox_state);
  if (oxidation) parts.push(`${oxidation} oxidation`);

  /** @type {IntervalDoc['metadata']} */
  const metadata = {
    table,
    hole_id: holeId ?? null,
    project_id: first(row.project_id, row.project) ?? null,
    depth_from: depthFrom !== undefined ? Number(depthFrom) : null,
    depth_to: depthTo !== undefined ? Number(depthTo) : null,
  };
  if (lithCodes.length > 0) metadata.lith_code = lithCodes[0];

  return { id, text: parts.join('. '), metadata };
}

/**
 * Build documents for a batch of rows. Rows that fail to build (malformed)
 * are skipped unless opts.strict is true.
 *
 * @param {object[]} rows
 * @param {object} [opts] forwarded to {@link buildIntervalDoc}; plus:
 * @param {boolean} [opts.strict=false] throw on the first malformed row
 * @returns {IntervalDoc[]}
 */
export function buildCorpus(rows, opts = {}) {
  const docs = [];
  for (const row of rows) {
    try {
      docs.push(buildIntervalDoc(row, opts));
    } catch (err) {
      if (opts.strict) throw err;
    }
  }
  return docs;
}

/**
 * Incremental index sync driven by GeoLedger's meta_change_log events.
 *
 * GeoLedger already writes every mutation through a `logChange(table, rowId,
 * op)` hook; feed those same events here and the semantic index stays live:
 *
 *   insert/update -> fetch the row, rebuild its doc, re-embed, upsert
 *   delete        -> remove from the index
 *
 * The sync target is anything exposing `upsertDocs(docs)` and `remove(id)` —
 * in practice the {@link module:search~SemanticSearch} facade.
 *
 * @example
 *   const sync = new CorpusSync({
 *     search,                                   // SemanticSearch instance
 *     getRow: (table, rowId) => db.prepare(
 *       `SELECT * FROM ${table} WHERE interval_id = ?`).get(rowId),
 *     codeMap: rockBoardCodes,
 *   });
 *   await sync.apply({ table: 'tbl_geology_intervals', row_id: 42, op: 'update' });
 */
export class CorpusSync {
  /**
   * @param {object} opts
   * @param {{upsertDocs(docs: IntervalDoc[]): Promise<any>, remove(id: string|number): any}} opts.search
   *   sync target (SemanticSearch or compatible)
   * @param {(table: string, rowId: string|number) => object|null|Promise<object|null>} opts.getRow
   *   row fetcher; return null/undefined if the row no longer exists
   * @param {Record<string,string>} [opts.codeMap] rock-board code map
   * @param {string[]} [opts.tables=[DEFAULT_TABLE]] tables this sync handles;
   *   events for other tables are ignored
   * @param {(row: object, opts: object) => IntervalDoc} [opts.buildDoc=buildIntervalDoc]
   */
  constructor({ search, getRow, codeMap, tables = [DEFAULT_TABLE], buildDoc = buildIntervalDoc }) {
    if (!search || typeof search.upsertDocs !== 'function' || typeof search.remove !== 'function') {
      throw new TypeError('CorpusSync requires a search target with upsertDocs() and remove()');
    }
    if (typeof getRow !== 'function') throw new TypeError('CorpusSync requires a getRow(table, rowId) function');
    this.search = search;
    this.getRow = getRow;
    this.codeMap = codeMap;
    this.tables = new Set(tables);
    this.buildDoc = buildDoc;
  }

  /**
   * Apply one meta_change_log-style event.
   * @param {{table: string, row_id: string|number, op: string}} event
   *   op: insert|update|upsert|I|U (re-embed) or delete|remove|D (drop)
   * @returns {Promise<'upserted'|'removed'|'skipped'>}
   */
  async apply(event) {
    const { table, row_id: rowId, op } = event;
    if (!this.tables.has(table)) return 'skipped';
    const kind = String(op).toLowerCase();
    if (kind === 'delete' || kind === 'remove' || kind === 'd') {
      this.search.remove(rowId);
      return 'removed';
    }
    if (kind === 'insert' || kind === 'update' || kind === 'upsert' || kind === 'i' || kind === 'u') {
      const row = await this.getRow(table, rowId);
      if (!row) {
        // Row vanished between the event and now — treat as delete.
        this.search.remove(rowId);
        return 'removed';
      }
      const doc = this.buildDoc(row, { codeMap: this.codeMap, table });
      await this.search.upsertDocs([doc]);
      return 'upserted';
    }
    return 'skipped';
  }

  /**
   * Apply a batch of events in order.
   * @param {Array<{table: string, row_id: string|number, op: string}>} events
   * @returns {Promise<{upserted: number, removed: number, skipped: number}>}
   */
  async applyBatch(events) {
    const summary = { upserted: 0, removed: 0, skipped: 0 };
    for (const event of events) {
      const result = await this.apply(event);
      summary[result]++;
    }
    return summary;
  }
}
