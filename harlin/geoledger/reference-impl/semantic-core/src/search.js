/**
 * @file SemanticSearch — the facade the GeoLedger Electron app talks to.
 *
 * Hybrid ranking: a weighted blend of exact cosine similarity (vector recall,
 * bridges wording differences) and a tiny in-module BM25 keyword scorer
 * (precision guard — protects exact tokens like hole ids "CHB0241D" or lith
 * codes "TKB" from pure-vector misses). Default blend 0.7 vector / 0.3 keyword.
 *
 * Every result is explainable via {@link SemanticSearch#explain} — matched
 * terms, applied synonym expansions, and both score components — so a
 * Competent Person can audit why an interval was returned.
 *
 * @module search
 */

import { expandTokens, tokenize, GEO_SYNONYMS } from './embedder.js';
import { buildCorpus } from './corpus.js';

const BM25_K1 = 1.2;
const BM25_B = 0.75;

/**
 * @typedef {object} SearchResult
 * @property {string|number} id
 * @property {number} score blended score (0..~1)
 * @property {number} vectorScore raw cosine component
 * @property {number} keywordScore raw BM25 component (unnormalised)
 * @property {object} metadata stored interval metadata
 * @property {string} snippet text excerpt around the first query-term hit
 */

/**
 * Build a metadata predicate from the app-level filter object.
 * Depth filters match on interval OVERLAP with [depthMin, depthMax].
 * @param {{project_id?: any, hole_id?: any, depthMin?: number, depthMax?: number}} [filters]
 * @returns {((meta: object) => boolean)|undefined}
 */
function compileFilters(filters) {
  if (!filters) return undefined;
  const { project_id, hole_id, depthMin, depthMax } = filters;
  if (project_id === undefined && hole_id === undefined && depthMin === undefined && depthMax === undefined) {
    return undefined;
  }
  return (meta) => {
    if (!meta) return false;
    if (project_id !== undefined && meta.project_id !== project_id) return false;
    if (hole_id !== undefined && meta.hole_id !== hole_id) return false;
    if (depthMin !== undefined && !(meta.depth_to === null || meta.depth_to === undefined || meta.depth_to >= depthMin)) return false;
    if (depthMax !== undefined && !(meta.depth_from === null || meta.depth_from === undefined || meta.depth_from <= depthMax)) return false;
    return true;
  };
}

/**
 * Excerpt of `text` centred on the first occurrence of any query token.
 * @param {string} text
 * @param {string[]} qTokens lower-cased query tokens
 * @param {number} [width=160]
 * @returns {string}
 */
function makeSnippet(text, qTokens, width = 160) {
  if (!text) return '';
  if (text.length <= width) return text;
  const lower = text.toLowerCase();
  let pos = -1;
  for (const t of qTokens) {
    const i = lower.indexOf(t);
    if (i !== -1 && (pos === -1 || i < pos)) pos = i;
  }
  if (pos === -1) return `${text.slice(0, width - 1).trimEnd()}…`;
  const start = Math.max(0, pos - Math.floor(width / 3));
  const end = Math.min(text.length, start + width);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

/**
 * Semantic search facade combining an Embedder, a VectorIndex, and an
 * internal BM25-lite keyword store over the same documents.
 */
export class SemanticSearch {
  /**
   * @param {object} opts
   * @param {import('./embedder.js').HashingEmbedder|import('./embedder.js').ExternalEmbedder} opts.embedder
   * @param {import('./index.js').VectorIndex} opts.index must have dim === embedder.dim
   * @param {number} [opts.vectorWeight=0.7] blend weight for the cosine component
   * @param {number} [opts.keywordWeight=0.3] blend weight for the BM25 component
   * @param {Record<string,string>} [opts.synonyms] expansion table used for
   *   keyword tokenisation and explain(); defaults to the embedder's table or GEO_SYNONYMS
   */
  constructor({ embedder, index, vectorWeight = 0.7, keywordWeight = 0.3, synonyms } = {}) {
    if (!embedder || typeof embedder.embed !== 'function') throw new TypeError('SemanticSearch requires an embedder');
    if (!index || typeof index.search !== 'function') throw new TypeError('SemanticSearch requires a VectorIndex');
    if (index.dim !== embedder.dim) {
      throw new RangeError(`embedder dim ${embedder.dim} != index dim ${index.dim}`);
    }
    this.embedder = embedder;
    this.index = index;
    this.vectorWeight = vectorWeight;
    this.keywordWeight = keywordWeight;
    this.synonyms = synonyms ?? embedder.synonyms ?? GEO_SYNONYMS;

    // BM25-lite state over indexed documents.
    /** @type {Map<string|number, string>} id -> original text */
    this._texts = new Map();
    /** @type {Map<string|number, Map<string, number>>} id -> token tf map (expanded tokens) */
    this._docTokens = new Map();
    /** @type {Map<string, Map<string|number, number>>} token -> (id -> tf) postings */
    this._postings = new Map();
    this._totalLen = 0;
  }

  /** @returns {number} number of indexed documents */
  get size() {
    return this.index.size;
  }

  // ---------------------------------------------------------------- indexing

  /**
   * Build docs from raw GeoLedger interval rows and index them.
   * @param {object[]} rows tbl_geology_intervals rows
   * @param {Record<string,string>} [codeMap] rock-board lithology code map
   * @returns {Promise<number>} number of documents indexed
   */
  async indexRows(rows, codeMap) {
    return this.upsertDocs(buildCorpus(rows, { codeMap }));
  }

  /**
   * Embed and upsert prebuilt documents ({id, text, metadata}).
   * @param {import('./corpus.js').IntervalDoc[]} docs
   * @returns {Promise<number>}
   */
  async upsertDocs(docs) {
    if (docs.length === 0) return 0;
    const vectors = await this.embedder.embed(docs.map((d) => d.text));
    for (let i = 0; i < docs.length; i++) {
      const { id, text, metadata } = docs[i];
      if (this._texts.has(id)) this._removeKeywordStats(id);
      this.index.add(id, vectors[i], metadata ?? {});
      this._addKeywordStats(id, text);
    }
    return docs.length;
  }

  /**
   * Remove a document from both the vector index and the keyword store.
   * @param {string|number} id
   * @returns {boolean} true if the id was present
   */
  remove(id) {
    const had = this.index.remove(id);
    if (this._texts.has(id)) this._removeKeywordStats(id);
    return had;
  }

  _addKeywordStats(id, text) {
    const tokens = expandTokens(text, this.synonyms);
    /** @type {Map<string, number>} */
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    this._texts.set(id, text ?? '');
    this._docTokens.set(id, tf);
    this._totalLen += tokens.length;
    for (const [t, n] of tf) {
      let posting = this._postings.get(t);
      if (!posting) this._postings.set(t, (posting = new Map()));
      posting.set(id, n);
    }
  }

  _removeKeywordStats(id) {
    const tf = this._docTokens.get(id);
    if (!tf) return;
    let len = 0;
    for (const [t, n] of tf) {
      len += n;
      const posting = this._postings.get(t);
      if (posting) {
        posting.delete(id);
        if (posting.size === 0) this._postings.delete(t);
      }
    }
    this._totalLen -= len;
    this._docTokens.delete(id);
    this._texts.delete(id);
  }

  _docLength(id) {
    const tf = this._docTokens.get(id);
    if (!tf) return 0;
    let len = 0;
    for (const n of tf.values()) len += n;
    return len;
  }

  // ----------------------------------------------------------------- scoring

  /**
   * BM25-lite scores for all docs sharing at least one query token.
   * @param {string[]} qTokens expanded query tokens (deduplicated internally)
   * @param {((meta: object) => boolean)} [filter]
   * @returns {Map<string|number, number>} id -> BM25 score
   */
  _keywordScores(qTokens, filter) {
    /** @type {Map<string|number, number>} */
    const scores = new Map();
    const N = this._docTokens.size;
    if (N === 0) return scores;
    const avgLen = this._totalLen / N || 1;
    /** @type {Map<string|number, boolean>} */
    const filterCache = new Map();
    const passes = (id) => {
      if (!filter) return true;
      let ok = filterCache.get(id);
      if (ok === undefined) {
        ok = filter(this.index.getMetadata(id));
        filterCache.set(id, ok);
      }
      return ok;
    };

    for (const t of new Set(qTokens)) {
      const posting = this._postings.get(t);
      if (!posting) continue;
      const df = posting.size;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      for (const [id, tf] of posting) {
        if (!passes(id)) continue;
        const len = this._docLength(id);
        const norm = (tf * (BM25_K1 + 1)) / (tf + BM25_K1 * (1 - BM25_B + (BM25_B * len) / avgLen));
        scores.set(id, (scores.get(id) ?? 0) + idf * norm);
      }
    }
    return scores;
  }

  /**
   * Hybrid semantic query.
   *
   * @param {string} text free-text query, e.g. "shear-hosted quartz veining
   *   with sericite alteration"
   * @param {object} [opts]
   * @param {number} [opts.k=20] number of results
   * @param {{project_id?: any, hole_id?: any, depthMin?: number, depthMax?: number}} [opts.filters]
   * @param {boolean} [opts.hybrid=true] false = pure vector ranking
   * @returns {Promise<SearchResult[]>} ranked results, best first
   */
  async query(text, { k = 20, filters, hybrid = true } = {}) {
    const filter = compileFilters(filters);
    const [qvec] = await this.embedder.embed([text]);
    const candidateK = Math.max(k * 4, 64);
    const vecResults = this.index.search(qvec, { k: candidateK, filter });

    /** @type {Map<string|number, number>} */
    const vecScore = new Map();
    for (const r of vecResults) vecScore.set(r.id, r.score);

    const qTokens = expandTokens(text, this.synonyms);
    const kwScores = hybrid && this.keywordWeight > 0 ? this._keywordScores(qTokens, filter) : new Map();

    // Union candidates; compute exact cosine for keyword-only candidates.
    const ids = new Set([...vecScore.keys(), ...kwScores.keys()]);
    let kwMax = 0;
    for (const s of kwScores.values()) if (s > kwMax) kwMax = s;

    /** @type {SearchResult[]} */
    const results = [];
    for (const id of ids) {
      let v = vecScore.get(id);
      if (v === undefined) v = this.index.similarity(id, qvec) ?? 0;
      const kw = kwScores.get(id) ?? 0;
      const blended = hybrid
        ? this.vectorWeight * Math.max(0, v) + this.keywordWeight * (kwMax > 0 ? kw / kwMax : 0)
        : Math.max(0, v);
      results.push({
        id,
        score: blended,
        vectorScore: v,
        keywordScore: kw,
        metadata: this.index.getMetadata(id) ?? {},
        snippet: makeSnippet(this._texts.get(id) ?? '', qTokens),
      });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  /**
   * "More like this" — see {@link module:similar~moreLikeThis}. Provided as a
   * method for convenience.
   * @param {string|number} id
   * @param {object} [opts] {k, filters}
   */
  async similar(id, opts = {}) {
    const { moreLikeThis } = await import('./similar.js');
    return moreLikeThis(this, id, opts);
  }

  // ------------------------------------------------------------ auditability

  /**
   * Explain why a document matched (or did not match) a query — the
   * Competent-Person audit trail behind every ranked result.
   *
   * @param {string} queryText
   * @param {string|number} id document id
   * @returns {Promise<{
   *   query: string,
   *   id: string|number,
   *   found: boolean,
   *   expansions: Array<{token: string, expandedTo: string[]}>,
   *   queryTokens: string[],
   *   matchedTerms: string[],
   *   vectorScore: number|null,
   *   keywordScore: number,
   *   blendedScore: number|null,
   *   weights: {vector: number, keyword: number},
   *   snippet: string
   * }>}
   */
  async explain(queryText, id) {
    const rawTokens = tokenize(queryText);
    const expansions = [];
    for (const t of new Set(rawTokens)) {
      const exp = this.synonyms[t];
      if (exp) expansions.push({ token: t, expandedTo: exp.split(' ').filter(Boolean) });
    }
    const qTokens = expandTokens(queryText, this.synonyms);
    const docTf = this._docTokens.get(id);
    const found = this.index.has(id);

    const matchedTerms = [];
    if (docTf) {
      for (const t of new Set(qTokens)) if (docTf.has(t)) matchedTerms.push(t);
    }

    let vectorScore = null;
    if (found) {
      const [qvec] = await this.embedder.embed([queryText]);
      vectorScore = this.index.similarity(id, qvec);
    }
    const kwScores = this._keywordScores(qTokens);
    const keywordScore = kwScores.get(id) ?? 0;
    let kwMax = 0;
    for (const s of kwScores.values()) if (s > kwMax) kwMax = s;
    const blendedScore = vectorScore === null
      ? null
      : this.vectorWeight * Math.max(0, vectorScore) + this.keywordWeight * (kwMax > 0 ? keywordScore / kwMax : 0);

    return {
      query: queryText,
      id,
      found,
      expansions,
      queryTokens: [...new Set(qTokens)],
      matchedTerms,
      vectorScore,
      keywordScore,
      blendedScore,
      weights: { vector: this.vectorWeight, keyword: this.keywordWeight },
      snippet: makeSnippet(this._texts.get(id) ?? '', qTokens),
    };
  }
}
