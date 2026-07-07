/**
 * @file Package entry point — re-exports the full public API.
 * @module @geoledger/semantic-core
 */

export { HashingEmbedder, ExternalEmbedder, GEO_SYNONYMS, tokenize, expandTokens } from './embedder.js';
export { VectorIndex, FileStore, MemoryStore, cosine } from './index.js';
export { buildIntervalDoc, buildCorpus, CorpusSync, DEFAULT_TABLE } from './corpus.js';
export { SemanticSearch } from './search.js';
export { moreLikeThis } from './similar.js';
