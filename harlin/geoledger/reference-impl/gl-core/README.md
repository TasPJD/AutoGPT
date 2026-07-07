# @geoledger/core — the anti-drift kernel

Pure, **zero-dependency** ES modules (`"type": "module"`, Node >= 18) that centralise the
rules GeoLedger kept re-implementing per component and per script. The Electron main
process, the React renderer and every standalone import script consume **one**
implementation — so the rules cannot drift apart again.

Every module is a pure function library: no I/O, no SQLite handles, no Electron imports,
no globals. That is what lets all three runtimes share it.

```js
import { getTrayDir, strictInsert, SCHEMA_VERSION, reconcileEoh } from '@geoledger/core';
// or per-module:
import { propagateDepths } from '@geoledger/core/intervals';
```

Run the tests:

```sh
npm test        # node --test "test/**/*.test.js"
```

## Why this package exists — the drift incidents it prevents

| Module | Incident it prevents |
| --- | --- |
| `src/version.js` | `sync.js` hardcoded its own stale `SCHEMA_VERSION = 18` while the DB was at a later schema, mis-gating changesets; `main.js` separately hardcoded `APP_VERSION`. |
| `src/paths.js` | **2026-05-21 dual-path duplication** — `batch_photo_import.js` built tray paths inline (`<hole>/<tray>/`) and drifted from `electron/photo.js` (`<hole>/GeoLedger/<tray>/`), duplicating photo trees and clashing with consultant folders (`Wet/`, `Dry/`, `Pre-Comp/`, `Geotech Samples/`). |
| `src/format.js` | Per-card copy-pasted `toFixed()` calls: mixed 1 dp / 2 dp depth displays, bearings rendered `0` / `000` / `360` inconsistently. |
| `src/truth.js` | Components inventing their own depth fallback chains, and any regression toward auto-stamping `final_depth` from logged data. **EOH is declared, never assumed** — this module exports no setter, by design and by test. |
| `src/intervals.js` | **CHB0241D 69→153 row churn** (per-card split logic losing parent columns); per-card `propagateDepths` drift; ISSUES **A3 / H1 / H5 / H6**. Includes the GT dual-stream rule. |
| `src/validation.js` | **C1 validation lock-outs** — blocking modal validation froze field logging. Codifies "soft validation, never coercive": never throws, never blocks, emits advisory flags. |
| `src/records.js` | **L-18** — `insertRecord()` silently dropped mismatched fields; **223 MagSus records lost unrecoverably**. Unknown keys now throw `StrictFieldError` with did-you-mean suggestions. |
| `src/ledger.js` | **D-46..D-51** and **L-18..L-20** governance-id double-assignment in `MEMORY.md` / `PROJECT_LOG.md`. |

## Module reference

| Module | Exports |
| --- | --- |
| `version.js` | `APP_VERSION`, `SCHEMA_VERSION`, `assertVersionCompatible(changeset, local)` → `{ok, action: 'apply'\|'skip_newer'\|'upgrade_required'}` |
| `paths.js` | `getTrayDir`, `getOriginalsDir`, `getThumbsDir`, `isCanonicalTrayPath`, `repairLegacyTrayPath`, `CONSULTANT_FOLDERS`, `GEOLEDGER_SEGMENT` — Windows and posix separators both accepted; output keeps the input's style. |
| `format.js` | `formatDepth(v, 'driller'\|'geologist')` (1 dp / 2 dp), `formatCompassAlpha` (00–90), `formatCompassBearing` (001–360, 0→360, wraps), `roundForStorage` (2 dp Number). Non-finite input → `null`. |
| `truth.js` | `effectiveTargetDepth(hole)` — `final_depth` → `as_drilled_depth` → `planned_depth` → 300 m fallback, with `source`; `reconcileEoh({...})` — pure, returns advisory flags (`EOH_MISMATCH`, `MULTIPLE_EOH_DECLARATIONS`, `EOH_BELOW_DEEPER_DATA`), never writes. |
| `intervals.js` | `propagateDepths`, `splitInterval` (children replicate ALL parent columns; returns `SPLIT_CHILD_RECORDS_REVIEW`), `mergeIntervals`, `gapHealDelete`, `findSmartDefaultInterval`, `findOverlaps`, `checkDualStreamConflict` (same-stream overlap → `INTERVAL_CONFLICT` error; cross-stream → soft warning), `LOGGING_SYSTEMS`. |
| `validation.js` | `runValidations(record, rules)` → `{messages, flags}` (flags are ready-to-insert `tbl_validation_flags` rows, `created_at: null` — caller stamps); `assertNonBlocking(fnSource)` test-time lint against `alert(` / `confirm(`. |
| `records.js` | `strictInsert`, `strictUpdate`, `diffColumns`, `StrictFieldError`, `levenshtein`. Column lists come straight from `PRAGMA table_info`. |
| `ledger.js` | `nextId(existingIds, prefix)` → `'D-052'`-style monotonic ids; `findCollisions(entries)` → duplicate ids with differing text. |

## INTEGRATION — refactoring the existing app onto the kernel

Each existing implementation below must be deleted and replaced with an import from
`@geoledger/core`. Suggested **incremental adoption order** (lowest risk / highest bleed
first):

1. **`records.js` → `electron/database.js`** (`insertRecord` / `updateRecord`).
   Highest data-loss risk today (L-18 class). Feed each table's `PRAGMA table_info`
   column names into `strictInsert` / `strictUpdate`; surface `StrictFieldError` to the
   caller instead of silently dropping fields. Use `diffColumns` for a dry-run report
   in import scripts before committing a batch.
2. **`paths.js` → `electron/photo.js` and `batch_photo_import.js`.**
   Both must call `getTrayDir` / `getOriginalsDir` / `getThumbsDir`; the importer must
   run `repairLegacyTrayPath` over any stored legacy paths and `isCanonicalTrayPath`
   as a guard before writing files. This retires the 2026-05-21 dual-path bug class.
3. **`version.js` → `electron/sync.js` and `electron/main.js`.**
   Delete both hardcoded constants; sync gates every incoming changeset through
   `assertVersionCompatible(changeset.schema_version)` and acts on `action`.
4. **`truth.js` → `App.reconcileEoh` (renderer).**
   Replace the in-component reconciliation with `reconcileEoh(...)` and insert the
   returned flag rows (stamping `created_at`). Replace ad-hoc depth fallbacks with
   `effectiveTargetDepth(hole)`. Nothing may write `final_depth` except explicit user
   declaration handlers.
5. **`intervals.js` + `validation.js` + `format.js` → the seven card components**
   (GeoTech, Geology, Measurements, CoreTrays and the remaining interval-logging
   cards). One card at a time: swap its private `propagateDepths` / split / merge /
   delete handlers for the kernel functions, route its checks through
   `runValidations` (flags advisory, never blocking — keep `assertNonBlocking` in each
   card's tests), and replace inline `toFixed()` with `formatDepth` /
   `formatCompassAlpha` / `formatCompassBearing` / `roundForStorage`. Start with the
   GeoTech card since it also needs `checkDualStreamConflict`.
6. **`ledger.js` → governance tooling** for `MEMORY.md` / `PROJECT_LOG.md`:
   assign new D-/L- ids with `nextId` and run `findCollisions` in CI over the parsed
   ledgers.

Rule of thumb after adoption: if a component contains its own copy of anything in this
package, that copy is the bug.

## Testing

`test/` contains a suite per module (105 tests), including regression cases for each
historical incident: legacy path repair, the `magsus_val` → `magsus_value` unknown-field
throw, EOH-never-auto-set, same-stream overlap rejection, split-children column
replication, and stale-schema skip/upgrade decisions.
