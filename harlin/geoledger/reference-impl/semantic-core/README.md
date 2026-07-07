# @geoledger/semantic-core

Semantic and vector search for GeoLedger — the layer that lets a geologist type

> "shear-hosted quartz veining with sericite alteration"

and get ranked drill intervals across **every hole and every project**, even when the
original log says `"ser alt, qv common"`. Zero runtime dependencies, ESM,
Node >= 18, fully offline by default.

## Why this is the differentiator

Incumbent core-logging packages (LogChief, Geobank, MX Deposit, acQuire, …) ship
exact-match filtering at best: you can find `lith_code = 'BAS'`, you cannot find
"anything that *reads like* shear-hosted mineralisation". Meanwhile every mature
exploration project sits on **decades of free-text logging** — descriptions,
comments, alteration and structure notes — written by dozens of geologists with
inconsistent shorthand. That text is the single richest, least accessible dataset
on site.

Semantic search over it is the feature nobody ships because incumbents assume a
connected server and a data-science team. GeoLedger is offline-first Electron +
SQLite, so this package delivers the capability with the same constraints:

- **No network, no model download, no GPU** — the default `HashingEmbedder` is a
  deterministic feature-hashing embedder with a built-in geological synonym table
  (`qtz→quartz`, `ser→sericite`, `py→pyrite`, `qv→quartz vein`, `bx→breccia`, …).
  It runs on the core shed laptop with no internet, forever.
- **Explainable** — `explain(query, id)` returns the matched terms, applied
  abbreviation expansions, and both score components for any result. A Competent
  Person can audit exactly why an interval ranked (JORC/NI 43-101 friendly: no
  black-box results).
- **Exact, reproducible ranking** — brute-force cosine, not approximate ANN. The
  same query on the same data returns the same intervals on every machine.
- **Hybrid ranking** — vector similarity blended with a BM25-lite keyword score
  (default 0.7 / 0.3), so exact tokens like hole ids (`CHB0241D`) and lith codes
  (`TKB`) can never be lost to a fuzzy-vector miss.

## Architecture

```
                          GeoLedger Electron app
  ┌────────────────────────────────────────────────────────────────────┐
  │  renderer (UI)                                                     │
  │   global search bar ─┐          ┌─ "Similar intervals" panel       │
  │                      │   IPC    │      (GeoCard)                   │
  │        corelogAPI.semantic.query / .similar / .explain             │
  ├──────────────────────┼──────────┼──────────────────────────────────┤
  │  main process        ▼          ▼                                  │
  │   electron/semantic.js  ──────  @geoledger/semantic-core           │
  │        │                                                           │
  │        │  ┌───────────────────────────────────────────────────┐   │
  │        │  │ SemanticSearch (search.js)                        │   │
  │        │  │   hybrid = 0.7 · cosine  +  0.3 · BM25-lite       │   │
  │        │  │   explain() audit trail                           │   │
  │        │  ├──────────────┬────────────────┬───────────────────┤   │
  │        │  │ Embedder     │ VectorIndex    │ corpus.js         │   │
  │        │  │ (embedder.js)│ (index.js)     │ buildIntervalDoc  │   │
  │        │  │ Hashing /    │ packed f32     │ buildCorpus       │   │
  │        │  │ External     │ exact cosine   │ CorpusSync        │   │
  │        │  └──────────────┴───────┬────────┴─────────┬─────────┘   │
  │        │                         │                  │             │
  │        ▼                         ▼                  ▼             │
  │   SQLite (better-sqlite3)   <dbDir>/semantic/   meta_change_log   │
  │   tbl_geology_intervals     index.glvec         (logChange hook)  │
  └────────────────────────────────────────────────────────────────────┘
```

Data flow:

1. `corpus.js` turns `tbl_geology_intervals` rows into documents — lith codes
   expanded via the rock-board `codeMap`, plus description/comment, alteration,
   mineralisation, veins, structure, weathering/oxidation. Metadata carries
   `{hole_id, project_id, depth_from, depth_to, table}` for filtering.
2. The embedder turns each document into a 384-dim vector.
3. `VectorIndex` holds all vectors in one packed `Float32Array` and answers exact
   top-k cosine queries; `FileStore` persists it to a single `.glvec` file.
4. `SemanticSearch` blends vector and keyword scores, applies project/hole/depth
   filters, and returns `{id, score, metadata, snippet}`.
5. `CorpusSync` consumes GeoLedger's existing change-log events to keep the index
   live as geologists log.

## Quick start

```js
import {
  HashingEmbedder, VectorIndex, SemanticSearch,
  FileStore, CorpusSync, moreLikeThis,
} from '@geoledger/semantic-core';

const embedder = new HashingEmbedder();                     // offline, deterministic
const index = new VectorIndex({ dim: embedder.dim, embedderName: embedder.name });
const search = new SemanticSearch({ embedder, index });

// Full (re)build from SQLite
const rows = db.prepare('SELECT * FROM tbl_geology_intervals').all();
await search.indexRows(rows, rockBoardCodeMap);             // codeMap: { BAS: 'basalt', ... }

// Query — wording does not need to match the logs
const hits = await search.query('shear-hosted quartz veining with sericite alteration', {
  k: 20,
  filters: { project_id: 'proj-chb', depthMin: 50, depthMax: 400 },
});
// -> [{ id, score, vectorScore, keywordScore, metadata, snippet }, ...]

// Audit any result
const why = await search.explain('ser alt with qv', hits[0].id);
// -> { expansions: [{token:'ser', expandedTo:['sericite']}, ...], matchedTerms, vectorScore, keywordScore, ... }

// Interval-to-interval similarity across all projects
const similar = moreLikeThis(index, hits[0].id, { k: 10 }); // or: await search.similar(id, {k})

// Persist
await index.save(new FileStore(`${dbDir}/semantic/index.glvec`));
// later:
const restored = await VectorIndex.load(new FileStore(`${dbDir}/semantic/index.glvec`));
```

## Integration plan into GeoLedger

1. **`electron/semantic.js`** (new, main process): owns one `SemanticSearch`
   instance per open database. On DB open: try `VectorIndex.load(new
   FileStore(join(dbDir, 'semantic', 'index.glvec')))`; if missing or the header's
   `embedder` name mismatches the active embedder, run a full rebuild
   (`SELECT * FROM tbl_geology_intervals` → `search.indexRows(rows, codeMap)`).
   Debounce `index.save()` after mutations (e.g. 5 s idle).
2. **IPC namespace** (preload): expose
   - `corelogAPI.semantic.query(text, opts)` → ranked results
   - `corelogAPI.semantic.similar(intervalId, opts)` → more-like-this
   - `corelogAPI.semantic.explain(text, intervalId)` → audit payload
   - `corelogAPI.semantic.rebuild()` → full re-index (also a menu command:
     *Tools → Rebuild semantic index*)
3. **Incremental updates**: GeoLedger already funnels every write through the
   `logChange(table, rowId, op)` hook that feeds `meta_change_log`. Add one line
   there: `corpusSync.apply({ table, row_id: rowId, op })`, with

   ```js
   const corpusSync = new CorpusSync({
     search,
     getRow: (table, rowId) =>
       db.prepare(`SELECT * FROM ${table} WHERE interval_id = ?`).get(rowId),
     codeMap: rockBoardCodeMap,
   });
   ```

   Insert/update re-embeds the row; delete removes it. The index is never stale.
4. **Index file location**: `<dbDir>/semantic/index.glvec` — sits beside the
   SQLite file so project backup/copy semantics carry the index along; it is also
   safe to delete (rebuildable) and excluded from sync conflict logic.
5. **UI**: a global search bar (semantic by default, filters for project/hole/
   depth) plus a **"Similar intervals"** panel on GeoCard backed by
   `semantic.similar(intervalId)`. Each result row gets a "why?" affordance that
   renders `explain()` output — matched terms and expansions, so results are never
   a black box.

## Embedder upgrade path (drop-in, no API change)

| Stage | Embedder | Offline | Quality | Notes |
|---|---|---|---|---|
| 1 (now) | `HashingEmbedder` | always | strong lexical-semantic recall | deterministic baseline; synonym table bridges logging shorthand |
| 2 | `ExternalEmbedder` + transformers.js `all-MiniLM-L6-v2` | after one-time model download (~25 MB, cached locally) | true neural semantics | runs in the Electron main process via ONNX; same 384 dims |
| 3 | `ExternalEmbedder` + hosted API | online only | best available | for connected head-office deployments |

The `Embedder` interface is `{ name, dim, embed(texts) → Promise<Float32Array[]> }`.
Because MiniLM is also 384-dim, upgrading is: construct the new embedder, run
rebuild, done — the index file format and every API above are unchanged. The
embedder `name` is stored in the `.glvec` header so a mismatch is detected at
load time and triggers a rebuild instead of silently mixing vector spaces.
Stage-2 hookup code is documented on `ExternalEmbedder` in `src/embedder.js`
(no model or network code lives in this package).

## Scale envelope

- 100,000 intervals × 384 dims × 4 bytes ≈ **150 MB** resident — fine for a
  logging laptop; a very large single project DB is typically 10–50k intervals.
- Query = one fused dot-product pass over contiguous memory: **~40–80 ms** for
  100k×384 on commodity hardware (measured ~55 ms/scan on this reference build).
  Brute force is *exact*: no recall loss, reproducible rankings.
- `.glvec` save/load is a single sequential read/write (~150 MB worst case);
  writes are atomic (temp file + rename), so a crash never corrupts the index.
- **Beyond that**: adopt [`sqlite-vec`](https://github.com/asg017/sqlite-vec) as an
  optional native accelerator — a loadable SQLite extension storing the same
  float32 vectors in a `vec0` virtual table inside the main DB. Because it is
  also exact KNN over float32 cosine, semantics are **identical**; implement it as
  a third persistence/scan backend behind the same `VectorIndex` API
  (`add/remove/search/save/load`) and gate it behind a capability check so the
  pure-JS path remains the guaranteed fallback. No schema or API change for
  callers.

## File format (`.glvec`)

```
bytes 0-5    ASCII magic "GLVEC1"
bytes 6-9    uint32 LE header length H
bytes 10..   UTF-8 JSON header { dim, count, embedder, ids, metadata, savedAt }
then         count × dim little-endian float32 (raw vector block)
```

Vectors round-trip byte-exactly (covered by tests).

## Module map

| File | Exports | Role |
|---|---|---|
| `src/embedder.js` | `HashingEmbedder`, `ExternalEmbedder`, `GEO_SYNONYMS`, `tokenize`, `expandTokens` | pluggable embedders + geological abbreviation expansion |
| `src/index.js` | `VectorIndex`, `FileStore`, `MemoryStore`, `cosine` | exact cosine index, packed matrix, persistence |
| `src/corpus.js` | `buildIntervalDoc`, `buildCorpus`, `CorpusSync` | schema-aware doc building + change-log driven sync |
| `src/search.js` | `SemanticSearch` | hybrid query facade, filters, snippets, `explain()` |
| `src/similar.js` | `moreLikeThis` | interval-to-interval similarity |

## Tests

```
npm test        # = node --test "test/*.test.js"
```

32 tests cover: embedder determinism and synonym recall, index add/remove/search/
filters, byte-exact persistence round-trips (memory + file), corpus building with
alteration/mineralisation arrays, incremental `CorpusSync`, hybrid exact-code
ranking, `moreLikeThis`, and `explain()` auditability.
