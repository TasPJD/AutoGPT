# Benchmarks Instrumentation Spec — v1.0

**Status:** 🟢 ADOPTED — formalizes Research Findings B §3–4 (`RESEARCH_FINDINGS_B_benchmarks.md`) as the pillar-2 measurement system. Peer-comparison stance: vs-self-over-time (no like-for-like peer population exists; see Findings B §2).

## The nine KPIs

As specified in Findings B §3, adopted unchanged: (1) dispatch success rate, (2) human-intervention rate (correction/completion/override), (3) selftest pass rate + pass^k consistency, (4) latency by interaction class (median + p95, never cross-class), (5) error/incident count by severity S1/S2/S3, (6) probe-based availability, (7) cost per dispatch / cost per resolution, (8) usage-ceiling proximity, (9) storage footprint & growth.

## Files — `C:\AI\HarLin_OS\metrics\` (append-only JSONL, OTel GenAI field names)

| File | Writer | Covers KPI |
|---|---|---|
| `dispatches.jsonl` | dispatch close hook (extends cost-ledger write) | 1, 2, 4, 7, 9b |
| `selftest.jsonl` | steward selftest (persist what it already computes) | 3 |
| `probes.jsonl` | scheduled probe (selftest subset: mcp/console/fs) | 6 |
| `storage.jsonl` | weekly snapshot script | 9 |
| `incidents.jsonl` | console one-liner at occurrence | 5 |
| `rollup-YYYY-MM.json` | monthly rollup script | all → report §7 |

Record schemas: Findings B §4.2 verbatim. The two ★new fields (`outcome`, `intervention`) are set at dispatch close-out — Alfred proposes, operator confirms with one keystroke.

**Naming boundary:** `metrics/incidents.jsonl` holds *technical* incidents (pillar 3). *Governance* incidents (pillar 7) live separately in `Progress_Reporting.prj\Reports\_incidents.log` per `MONTH_TWO_PREP.md` — do not merge them; they answer different questions.

## Hygiene rules (Findings B §4.4, adopted)

1. Never delete or rewrite ledger lines — corrections are appended amendments.
2. Refresh the selftest quarterly: retire ~20% of items, add items drawn from real failed/intervened dispatches (contamination discipline).
3. Segment before aggregating — no cross-class latency or cost statistic, ever.
4. **First month is baseline, not judgment** — publish with no targets; set SLOs only after two months of data.

## Build order (HarLin-side work, small)

1. Add `outcome` + `intervention` fields to the dispatch close path; start `dispatches.jsonl`. *(highest value, lowest cost)*
2. Persist selftest results to `selftest.jsonl`; add the k-repeat core.
3. Probe timer (hourly) → `probes.jsonl`.
4. Weekly `storage.jsonl` snapshot; monthly rollup script.

Until each piece exists, its KPI reports **not captured** with this build order as the capture plan (CAPTURE_MAP CM#6).
