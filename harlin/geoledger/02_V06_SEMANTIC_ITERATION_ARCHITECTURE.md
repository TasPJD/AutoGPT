# GeoLedger v0.6 — Semantic Iteration Architecture

**Thesis:** v0.5.x proved the product; v0.6 makes the *rules* survivable. Every invariant that
was stated in prose and later drifted becomes either (a) a single shared implementation all
callers must import, or (b) an automated check that fails the build. This is the response to
HP-13 (*Automate over Remember*), HP-23 (*Make the right thing the only easy thing*), and
HP-24 (*Architecture over exhortation*) applied to GeoLedger's own codebase.

Cross-references: findings in `01_DEEP_DIVE_REVIEW.md` (R1–R10, drift map D1–D10);
reference code in `reference-impl/` (gl-core, sync-server, semantic-core).

---

## 1. Version plan

| Version | Scope | Gate |
|---|---|---|
| v0.6.0 | gl-core adoption + schema v29→v30 (tombstones, logging_system, semantic tables) + sync server transport + strict insert | Lifecycle stage 5→6 engineering gate |
| v0.6.x | UI/UX upgrade waves (07), semantic search UI, security hardening (05) | Launch pack (stage 6) |
| v0.7 | Licensing/activation + Continuity Charter mechanics in-product (06, 08) | First external paying customer |

## 2. The anti-drift kernel: `@geoledger/core` (gl-core)

New workspace package consumed by the Electron main process, the React renderer, and **every
standalone script** (batch importers, migration tools). One implementation per rule; deleting
the per-card copies is part of the migration, per the estate rule of retiring in the same
motion (HP-06).

| Module | Replaces / prevents | Drift item |
|---|---|---|
| `version.js` | `sync.js` stale SCHEMA_VERSION; `main.js` APP_VERSION hardcode | D6 |
| `paths.js` (`getTrayDir`, `repairLegacyTrayPath`) | photo.js + batch_photo_import.js mirrored path code | D1, R2 |
| `format.js` (`formatDepth`, compass, storage rounding) | per-card toFixed/precision | D5 |
| `truth.js` (`effectiveTargetDepth`, `reconcileEoh`) | App.reconcileEoh + per-card SOH/EOH awareness | A4 |
| `intervals.js` (propagate/split/merge/gap-heal/smart-default/dual-stream) | GeoTechCard/CoreTraysCard-only copies | D2, R6 |
| `validation.js` (advisory runner + flag emitter) | 7 hand-written card gates | D3, R8 |
| `records.js` (`strictInsert`/`strictUpdate`) | `insertRecord()` silent field drop | R4 / L-18 |
| `ledger.js` (monotonic D-/L- ids, collision detector) | register drift | R10 |

**Adoption order** (each step ships alone, testable on the real DB):
1. `records.strictInsert` wrapped around `insertRecord`/`updateRecord` in `database.js`
   (log-only mode for one release: log would-be rejections to `tbl_validation_flags`, then throw).
2. `version.js` + `paths.js` (includes orphan-repair pass for the 377 rows using `repairLegacyTrayPath`
   + filename parsing; unresolvable rows flagged, not deleted).
3. `intervals.js` into GeoCard + MeasurementsCard first (the cards that never had the logic),
   then swap GeoTechCard/CoreTraysCard internals.
4. `truth.js` + `validation.js`; delete per-card gates.
5. `ledger.js` + registers consolidation (§7).

## 3. One write path (closes R5)

**Rule: every mutation of the DB goes through the same save API** — the IPC handlers in
`database.js` (now backed by `strictInsert`/`strictUpdate` + `logChange()`). Standalone
scripts import a `HeadlessWriter` from gl-core-electron that opens the DB with the same code
path (including `meta_change_log` writes and tombstone semantics). `batch_photo_import.js` is
the first conversion — its missing changelog writes made imports invisible to peers.

**Enforcement:** a CI/lint check (`scripts/check-invariants.mjs`) greps for
`INSERT INTO|UPDATE .* SET|DELETE FROM` outside the sanctioned modules and fails the build;
`assertNonBlocking` test forbids `alert(`/`confirm(` in save/blur handler sources. These checks
are the mechanical form of the "baked-in rules" — they cannot be forgotten because they run on
every build (HP-13).

## 4. Schema v30 (one migration, all designed-but-unshipped items)

1. **Tombstones** (from v0.5.5 plan, unchanged): `deleted_at`/`deleted_by` on the 18 tables;
   soft-delete rides LWW as UPDATE; sticky-tombstone guard in sync; DeletedItemsPanel; 30-day
   compaction. Closes the hard-delete race.
2. **`logging_system TEXT NOT NULL CHECK (IN ('FIELD_TECH','GEOLOGIST','RECONCILED'))`** on GT
   interval tables + `parent_interval_id`; backfill by operator/date heuristic with a review
   flag per row (the CHB0241D punchlist becomes the pilot). Same-stream overlap → structured
   `INTERVAL_CONFLICT` rejection; cross-stream overlap → soft warning. Closes R6.
3. **Sync rule 5a**: empty-cell-overwrites-populated exception → keep populated value, raise
   `LWW_EMPTY_OVERWRITE` validation flag for adjudication. (In `sync.js` merge, not schema, but
   ships in the same release because it changes fleet behaviour.)
4. **Semantic tables** (see 04): `tbl_semantic_meta` (index bookkeeping) only — vectors live in
   a sidecar `.glvec` file, not the DB, so DB size/sync is unaffected.
5. **Multi-tenant-ready identity columns** (Design for the thousands, test on the one —
   NEXUS VISION §5 #11): nullable `org_id` on `tbl_projects`, `role` on operators table,
   `tbl_orgs` stub. Costless now; means the SaaS/Enterprise SKU is a data-fill, not a migration.

## 5. Sync transport: GL Relay (closes R1, L-19/22/23)

Design + working reference implementation in `03_SYNC_CONCURRENCY.md` and
`reference-impl/sync-server/`. Summary: keep the changeset format and client-side LWW exactly
as-is; replace the OneDrive folder with an authenticated HTTP relay that assigns a strictly
monotonic global sequence (total order ends folder races), long-polls for low-latency fleet
sync, relays photos on the same channel (ends stranded-photo split-channel failures), and keeps
a JORC-grade transport audit trail. UUID hole-collision reconciliation becomes a server-flagged,
one-click remap (R7). cr-sqlite remains correctly parked; the relay is transport, not merge.

## 6. Scale posture (thousands, not four)

- `reconcileSchema()` stays for self-heal but v0.6 documents its ceiling: at >40 tables and
  customer fleets, migrations become versioned + tested against golden DBs in CI; reconcile
  remains the safety net, not the mechanism.
- Changelog growth: relay-side compaction snapshots (full-DB seed for new devices) replace
  "replay everything"; `meta_change_log` gets a retention policy after snapshot.
- Auth: device tokens now (relay), org/user/role columns in v30, OIDC/SSO deferred to the
  Enterprise SKU — but the schema no longer blocks it.

## 7. Governance: registers become data

Single `REGISTERS.md` (or registers.json) per project with monotonic D-/L- ids enforced by
`gl-core/ledger` in a pre-commit/CI check; MEMORY.md keeps narrative only, never ids. The
duplicate D-46–D-51 / L-18–L-20 sets are renumbered once, with a mapping table appended for
historical reference (never delete without trace, HP-28).

## 8. What this buys commercially

- Support cost: self-healing + one write path + strict inserts kill the whole class of
  "mystery data loss" tickets that would sink a solo vendor at 30 customers.
- Auditability: every rule of the Data Truth Architecture is now demonstrably enforced in code —
  that claim goes in the Competent Person audit pack and the sales deck.
- Velocity: new cards/modules consume gl-core; the port-a-copy pattern (and its drift) ends.
