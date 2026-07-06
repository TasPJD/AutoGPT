# GeoLedger — Vector / Semantic Layer (v0.6)

**Honest finding first:** the records contain *no* vector-DB work — no design, no schema, no
code. It exists only as a line in the NEXUS vision ("pgvector, 2027 H1"). You remembered it as
a differentiating feature because it *is* one — the competitive sweep confirms incumbent AI
money is going into scanners and core-photo ML (Datarock/IMDEX, GeologicAI, Micromine
Panorama), while **semantic search over free-text logging data is shipped by nobody**. This
package closes the gap with a working implementation, not another plan.

## 1. What it does (the demo that sells)

- *"shear-hosted quartz veining with sericite alteration"* → ranked intervals across every
  hole and project, even where the log says `ser alt, qv common` — synonym- and
  abbreviation-aware.
- **More-like-this** on any interval: "find me everything that looks like this mineralised zone
  across the company's history." Data gravity made tangible: the more they log, the smarter it gets.
- Hybrid ranking (vector + keyword) so exact codes (`CHB0241D`, `TKB`) always win when typed.
- `explain()` on every result — matched terms and expansions, so a Competent Person can audit
  why the machine surfaced an interval. No black boxes in a JORC workflow.

## 2. Architecture (offline-first, like everything else)

`reference-impl/semantic-core/` (zero-dependency, tested):

- **Embedder** is pluggable: ships with a deterministic offline `HashingEmbedder`
  (char-n-gram + token hashing + geological synonym expansion, 384-dim, L2-normalised) that
  needs no model download and no network — the field-camp baseline. Drop-in upgrade path:
  transformers.js MiniLM in the Electron main process → API models, same interface.
- **VectorIndex**: exact brute-force cosine over a packed Float32Array. 100k intervals × 384
  dims ≈ 150 MB, ~50 ms scan — the honest envelope for years of junior-explorer data. Persisted
  as a sidecar `<dbDir>/semantic/index.glvec` (binary header + raw block), so the SQLite DB and
  sync are untouched. sqlite-vec documented as an optional native accelerator later; pgvector is
  the server-era backend with identical semantics.
- **CorpusSync** consumes the existing `logChange()` events — the index stays live with every
  save, no rebuild jobs. Full rebuild is one command for recovery.
- **Corpus builder** is schema-aware: lith codes expanded via the project Rock Board
  (`tbl_rock_boards` — the v28 work pays off here), descriptions, alteration/mineralisation
  side tables, structural notes, weathering.

## 3. Integration into GeoLedger

1. New `electron/semantic.js` wrapping semantic-core; IPC namespace
   `corelogAPI.semantic.{query, similar, rebuild, explain}`.
2. UI: global search bar in the header (07 §3) + "Similar intervals" panel on GeoCard.
3. GeoLexis synergy: its 212-term/439-misspelling tables merge into the synonym expansion —
   the two systems share one geological vocabulary asset (Multiplier Doctrine: engine vs
   content; the lexicon is content usable by every NEXUS member).
4. Schema: only `tbl_semantic_meta` (index version, embedder name/dim, last seq) in v30.

## 4. Roadmap honesty (what to claim, when)

- **v0.6 (now):** semantic + hybrid search and more-like-this, offline, explainable. Claim it.
- **v0.6.x:** MiniLM local embeddings (quality jump, still offline). A/B against hashing on
  Barton data before switching default.
- **Server era (Postgres/pgvector):** cross-project, org-wide search in the web SPA; geochem
  signature vectors (multi-element fingerprints) and structural-population similarity join the
  corpus — that's the "understands your data" story maturing, per the NEXUS positioning line.
- **Never:** cross-company data pooling without explicit legal review (VISION 2029 note stands).

## 5. Marketing line (approved wording basis)

"Other tools store your data. GeoLedger understands it." — this layer is the proof point.
Every logging keystroke since day one becomes searchable institutional memory; the incumbents'
answer is a SQL query and a consultant.
