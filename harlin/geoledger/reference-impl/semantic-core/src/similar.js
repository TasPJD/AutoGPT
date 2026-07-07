/**
 * @file Interval-to-interval similarity — "find other intervals like this one
 * across all holes and projects" — using the vector already stored in the
 * index (no re-embedding, works even when the original text is gone).
 *
 * @module similar
 */

/**
 * Find the k intervals most similar to a given interval.
 *
 * @param {import('./index.js').VectorIndex | import('./search.js').SemanticSearch} source
 *   a VectorIndex, or a SemanticSearch facade (its .index is used)
 * @param {string|number} id the reference interval id (must be indexed)
 * @param {object} [opts]
 * @param {number} [opts.k=10] number of similar intervals to return
 * @param {(metadata: object, id: string|number) => boolean} [opts.filter]
 *   optional metadata predicate (e.g. restrict to another project)
 * @param {boolean} [opts.excludeSelf=true] drop the reference interval itself
 * @returns {Array<{id: string|number, score: number, metadata: object}>}
 *   ranked by cosine similarity, best first
 * @throws {Error} if the id is not in the index
 */
export function moreLikeThis(source, id, { k = 10, filter, excludeSelf = true } = {}) {
  const index = source && typeof source.getVector === 'function' ? source : source?.index;
  if (!index || typeof index.getVector !== 'function') {
    throw new TypeError('moreLikeThis requires a VectorIndex or SemanticSearch');
  }
  const vector = index.getVector(id);
  if (!vector) throw new Error(`moreLikeThis: id ${JSON.stringify(id)} is not in the index`);

  const results = index.search(vector, { k: excludeSelf ? k + 1 : k, filter });
  const out = excludeSelf ? results.filter((r) => r.id !== id) : results;
  return out.slice(0, k);
}
