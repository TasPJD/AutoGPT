# Backfill Runsheet — 2026-04 → 2026-07b

**Purpose:** make backfill production purely mechanical. Everything judgment-shaped was decided in the framework (v1.0); what remains is data gathering + template filling. Any session — or Alfred locally — executes this when the estate is reachable. Rule #15 applies absolutely: a claim without a gathered evidence line is a **gap**, never a reconstruction.

**Blocked on:** estate access (HarLin MCP origin was down when this was written, 2026-07-12 ~12:20Z, repeated 502s).

## Order

`2026-04.md` → `2026-05.md` → `2026-06.md` → `2026-07a.md` (Jul 1–10) → `2026-07b.md` (Jul 11–EOM, produced early August). Strict order: each report's §2 calibration and §5 bridge read the previous instance.

## Per-report data gathering (identical for each period)

| # | Pull | From | Feeds template § |
|---|---|---|---|
| G1 | Every project CHANGELOG entry dated in-period | all `.prj` CHANGELOGs (mandatory since 2026-04-12) | §4, §6 |
| G2 | Pulse session summaries + SESSION_INDEX entries in-period | Pulse (auto since June — expect gaps in Apr/May, mark them) | §4, §6 |
| G3 | Catalog snapshot at period start + end (entities/stubs/CP) | catalog; where no historical snapshot exists, mark **not captured** — do not reconstruct | §9 |
| G4 | AWAITING CONFIRM / open questions counts if recorded in-period | Console records, orient logs | §8 |
| G5 | Dispatch cost ledger slice | `runtime\logs\dispatch_cost.log` | §6 (burn), month-2 pillar 8 |
| G6 | Git log in-period | Nexus, GeoLedger repos | §4 evidence links |
| G7 | Key-project file state (PROGRESS/TODO) as of period end where determinable from file history | project files | §6 |

## Per-report production

1. Fill template v1.0 from G1–G7; provenance-mark every claim.
2. §2 calibration: Apr = "no prior plan recorded"; May onward = against the prior backfill's §10 (backfills write §10 *retrospectively honest*: what the records show was intended, marked inferred — or "no plan recorded").
3. §5 valuation: stage each key project **as at period end** using taxonomy evidence tests; run GEV only if AV anchors exist by then (they need the Business Plan read); otherwise "not captured — anchors pending" with the stage table still filled.
4. Run `scripts/validate_report.py`; file only on PASS.
5. Expected provenance mix degrades backward (CAPTURE_MAP backfill table) — Apr will be gap-heavy. That's the finding, not a failure.

## The 07a/07b comparison (the paradigm-shift measurement)

`2026-07b.md` additionally carries a **Before/After section**: pillar-4 counts, pillar-5 backlog trajectory, provenance mix, and (if instrumented by then) pillar-2 KPIs — July 1–10 vs July 11–EOM, normalized per-day. This is the founding brief's central question — *is Alfred's commencement a measured paradigm shift?* — answered with the framework's own numbers.

## Also on first estate contact (before or alongside backfill)

- [ ] Read Business Plan + Vision/Design docs → fill AV anchors (VALUATION_FRAMEWORK §2 ⏳), verify D1 (AUD), confirm key-project list
- [ ] Capture today's orient counts → `_snapshots.log`
- [ ] Copy this project's staged files from the repo into `C:\AI\HarLin_HQ\Progress_Reporting.prj\` via the catalog write-path (see `records/` staging notes)
