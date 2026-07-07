# GeoLedger — Deep-Dive Review (2026-07-06)

Full review of the GeoLedger program state, grounded in the project records at
`C:/AI/AI_Projects/NEXUS.prj/GeoLedger.prj/` (CHANGELOG, PROGRESS, MEMORY, PROJECT_LOG,
ISSUES_COMPILED, OVERNIGHT_FINDINGS, FORENSIC_CHB0241D, GT_CHURN_HEATMAP, GL_BACKUPS_REGISTER,
and the Docs/ architecture set) as at 2026-07-06.

**Verdict in one line:** the product core is genuinely strong (offline-first data model,
Data Truth Architecture, audit-grade capture, real field validation at Barton Gold), but it is
carrying three classes of unshipped-but-designed critical work (sync transport, tombstones,
dual-stream integrity), one class of systemic drift (per-card copy-paste of shared rules), and
one vision/reality gap (the vector/semantic layer was never started). All five are addressed by
the v0.6 package in this directory.

---

## 1. Recurring problems (from the logs)

| # | Problem | Incidents / IDs | Root cause | Status at 2026-07-06 |
|---|---|---|---|---|
| R1 | OneDrive/SharePoint sync corruption & conflict copies | L-19, L-22, L-23; D-46 (DELETE journal) | Cloud folder sync is not a transactional transport; WAL/SHM artefacts; timing races | Structurally mitigated by 2026-04-08 changeset architecture (DB out of OneDrive), but the **transport itself is still a synced folder** — conflict copies continued; sync server "needed" per MEMORY.md, never built. **→ Fixed by `reference-impl/sync-server`** |
| R2 | Photo path construction drift | 2026-05-21 dual-path bug; 377 orphan rows | `batch_photo_import.js` built paths inline instead of via `photo.js::getTrayDir()` | Both files patched *in mirror* (drift risk remains); 305 stale-filename + 72 Tunkillia-misrooted orphans unresolved. **→ `gl-core/paths` is the single implementation; `repairLegacyTrayPath()` covers the orphan classes** |
| R3 | Wrong/stray DB resolution | 2026-05-22 hotfix (empty DB at backup root, login greyed out) | Directory-existence used as opt-in signal; backup root overlaps DB-resolution candidate | Fixed for that instance; underlying rule ("test the file, never the parent dir") not enforced anywhere. **→ codified in `gl-core` + v0.6 rules** |
| R4 | Silent data loss on field-name mismatch | **L-18**: 223 MagSus records unrecoverable | `insertRecord()` silently drops keys that match no column | The *instance* was fixed; the silent-drop behaviour was never changed. **→ `gl-core/records.strictInsert` throws with nearest-column suggestion** |
| R5 | Sync omissions — imports invisible to peers | batch_photo_import bypasses `meta_change_log` (2026-05-20); George's CHB0241D splits never propagated | Multiple write paths; only the app's IPC path logs changes | Open. **→ v0.6 rule: every write path routes through one save API (see 02, §3)** |
| R6 | GT dual-stream interval duplication / churn | CHB0241D 69→153 rows; 11 bulk-add events ≥20 rows; oscillating hole counts | Field-tech and geologist streams write overlapping rows with no stream identity | Requirement doc exists (`GT_DUAL_STREAM_INTEGRITY_REQUIREMENT.md`); **not implemented**. **→ `gl-core/intervals.checkDualStreamConflict` + schema change in 02 §4** |
| R7 | UUID collisions on multi-machine hole creation | L-20; CHB0244D/CHB0245D; Richard Hills 243D (35+58 rows remapped by hand) | Same hole created on two devices before sync | Merge rule exists (first-created-wins remap across 23 FK tables) but reconciliation was manual each time. **→ automate as a sync-server-assisted flow (03 §5)** |
| R8 | Validation lock-outs | C1 (all cards) | `alert() + return` gates leaving stale state | Fixed 2026-04-05; rule re-stated as an L-entry. Pattern still duplicated per card. **→ `gl-core/validation`** |
| R9 | Backup sprawl | 1,327 artefacts across 15+ locations; 4+ historical roots | No enforced single root; backup root reused as a path signal (caused R3) | Register built, cleanup list produced; execution not logged. **→ ops runbook in 05/08** |
| R10 | Governance ledger drift | D-46–D-51 double-assigned; L-18–L-20 two incompatible sets; MEMORY.md header stuck at v0.4.0/schema v18 | Multiple sessions appending without a uniqueness check | Open. **→ `gl-core/ledger` + single registers file (02 §7)** |

## 2. Unresolved items register

Carried forward from the logs with no later closure entry:

**Data integrity**
- 377 orphaned photo-path rows (305 stale filenames — Barton renamed files on disk; 72 Tunkillia-misrooted with `_FC_TRAY_<hex>` names).
- GT dual-stream constraint unimplemented; 17 LOW-confidence CHB0241D rows awaiting Keep/Delete; OVERNIGHT_FINDINGS' three open questions.
- SP DBs stale re aberrant-hole cleanup and George's recovery (T-64, T-65).
- `batch_photo_import.js` missing `meta_change_log` writes.
- Sync rule 5a (empty-cell-overwrites-populated exception) specified, not in `sync.js`.

**Architecture debt**
- Tombstone plan (v0.5.5, schema v27) designed, unshipped — hard deletes still race and lose unsynced peer edits.
- Photo BLOB/relative-path migration (T-63/T-66) — absolute AppData paths still break cross-machine.
- GeoTechCard 2,400+ lines refactor; TanStack Hole Setup table; Tasks page automation.
- cr-sqlite decision correctly parked (revisit at >4–5 users or cr-sqlite 1.0).

**Features promised in ISSUES_COMPILED with no closure**
- M1 batch delete; M2/M3 MagSus recording types + continuous import; M6 photo strip
  tracking active interval; M7 duplicate readings UI; M8 lith/regolith on MagSus; M9 SG
  standalone card + dual-axis plot; L2 outdoor/high-contrast mode; pXRF card.
- Session 006 leftovers: PhotoRefInput forceSave review, Barton export mapping (4 schemas),
  veining card, help system, external-drive backup run.

**Vision/reality gaps**
- **Vector DB / semantic search: zero artefacts exist in the project** — no design doc, no
  schema, no code. It exists only at NEXUS-vision level ("pgvector, 2027 H1"). Given it is a
  headline differentiator, this is the largest single gap between the story and the product.
  **→ closed by `04_VECTOR_SEMANTIC_LAYER.md` + working `reference-impl/semantic-core`.**
- "Design for the thousands, test on the one" reflection (TODO.md 2026-06-08) — org/user/role
  multi-tenancy, auth model, sync-at-scale review — not yet designed. **→ 02 §6 and 03 §6.**

## 3. Rules Paul baked in vs what actually happened

The pattern you suspected is real and visible in the record. Rules were stated as immutable,
then violated by later work because nothing *enforced* them:

| Baked-in rule | Where stated | What happened |
|---|---|---|
| Save-on-blur, no Save buttons | MEMORY.md "Standing Rules (IMMUTABLE)" | MagSus and pXRF both shipped with Save buttons; removed later |
| Single backup root (D-18/D-20) | PROJECT_LOG decisions | 15+ locations, 4+ roots; the sprawl then caused the 05-22 stray-DB bug |
| Storage conventions "locked — DO NOT DRIFT" | Docs/CLAUDE.md (2026-05-21) | Regression shipped the very next day (getDbPath); 377 rows still violate the path law |
| Field-name verification before save code | MEMORY.md Ground Rule 5 | Rule written *after* L-18; the silent-drop code it guards against was never hardened |
| No blocking dialogs in save/blur paths | DATA_TRUTH_ARCHITECTURE §4 | 67 `alert()/confirm()` calls remained at last audit |
| Validation clears offending state | ISSUES A1 | Had to be re-fixed card by card (C1) |
| Registers unique & monotonic | implicit | D-/L- IDs double-assigned across sessions |

**The lesson is structural, not behavioural:** rules stated in Markdown do not survive
sessions. Rules survive only when they are (a) a single shared implementation that all callers
must import, or (b) an automated check that fails the build. The v0.6 architecture (doc 02)
converts every one of the invariants above into one of those two forms. This is the central
idea of the "semantic iteration": *the program's rules become code, not prose.*

## 4. Duplication/drift map (what gets modularised)

Confirmed sites where similar-but-not-identical logic exists in parallel:

1. Tray-path construction — `electron/photo.js` vs `batch_photo_import.js` (mirrored, not shared).
2. Interval logic — `propagateDepths` in GeoTechCard + CoreTraysCard only; split in GeoTech only;
   gap-healing delete in GeoTech only; smart default selection inconsistent (A3/A5, H1, H5, H6).
3. Validation gates — hand-written per card ×7 (A1/C1).
4. Save semantics — blur-save in most cards, Save buttons in others (A2/C2).
5. Depth/number formatting — per-card `toFixed` and input types; no shared `formatDepth`/`DepthInput` (H2/M10).
6. Version constants — APP_VERSION and SCHEMA_VERSION each historically duplicated and drifted
   (`sync.js` stale v18 hardcode; `main.js` hardcoded APP_VERSION).
7. Photo storage — file-path scheme in production and an empty BLOB store (`geoledger_photos.db`) in parallel.
8. GT logging — two data streams as parallel row sets with no stream identity column.
9. Drag thresholds — 3 px vs 4 px in two overlay components (INPUT_CONVENTIONS §7).
10. Registers — decisions/learnings appended in two documents with colliding IDs.

Every one of these maps to a `gl-core` module or a v0.6 schema/UI change — see
`02_V06_SEMANTIC_ITERATION_ARCHITECTURE.md` §2–§4 for the assignment.

## 5. What is genuinely good (keep, and say so in marketing)

- The 2026-04-08 changeset architecture (DB never transits the cloud) was the right call and is
  the foundation the sync server builds on — not a rewrite.
- Data Truth Architecture (§5A of VISION) is a real differentiator: source-of-truth cascade,
  advisory-never-coercive validation, auto-population with provenance, EOH-declared-never-assumed.
  No incumbent has an equivalent, and it is exactly what a JORC Competent Person needs.
- `reconcileSchema()` self-healing is a support-cost weapon at customer scale (bounded caveats in 02 §6).
- The merge tooling discipline (MERGE_PREFLIGHT, delta reports, human-adjudicated zombie holes)
  is audit-pack gold — productise it, don't hide it.
- 38 GB of real field data, 4 daily operators, 284 holes: live validation few competitors' new
  features get before launch.
