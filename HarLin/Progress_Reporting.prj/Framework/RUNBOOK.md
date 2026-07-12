# Monthly Progress Report — Production Runbook v0.1

**Status:** 🟠 DRAFT — cadence decisions pending Business Plan / Vision alignment; activates only after the framework gate.

## Cadence

| Activity | When | Cost profile |
|---|---|---|
| Pillar 5–6 snapshot (orient counts → dated log line) | daily or per-session, whichever is sparser | near-zero — copy numbers from `harlin_orient` |
| Benchmarks capture (pillar 2 KPI set) | weekly, once instrumented | low — automated per Benchmarks spec |
| Report production | first week of each month, for the prior month | heavy synthesis — schedule inside quota headroom |

## Pillar 5–6 snapshot format

Append one line per snapshot to `Reports/_snapshots.log`:

```
2026-07-10 | awaiting_confirm=134 | open_questions=77 | paul_actions=9 | entities=208 | stubs=159 | missing_cp=57
2026-07-11 | awaiting_confirm=148 | open_questions=?  | paul_actions=?  | entities=214 | stubs=159 | missing_cp=64
```

Unknown fields stay `?` — never interpolated. This log IS the pillar 5–6 time series; the report just plots it.

## Monthly production steps

1. **Gather** (mechanical): pull the month's Pulse summaries, every project CHANGELOG delta, catalog snapshot pair (start/end of month), dispatch cost ledger slice, git logs (Nexus, GeoLedger), and `metrics/rollup-<YYYY-MM>.json` once instrumentation is live.
2. **Calibrate** (template §2): mark each of last report's §10 milestones achieved / missed / dropped, one line of variance each.
3. **Count** (pillar 4): apply `LIFECYCLE_TAXONOMY.md` event tests; provenance-mark every count; link every claimed output to its artifact.
4. **Measure** (pillars 2–3, 5–6): read from snapshot log + metrics rollup; no synthesis.
5. **Value** (pillar 1): apply `VALUATION_FRAMEWORK.md` — stage reviews (promotions/demotions land here and only here), GEV bridge, floor-only total, inputs beside outputs. Answer the standing demotion question per project.
6. **Write** from `REPORT_TEMPLATE.md`; every field either filled from a named source or marked **not captured** with its capture plan. Set §10 next-month milestones — only what we intend to be measured against.
7. **Validate**: run `scripts/validate_report.py` — a FAIL is not filed.
8. File as `Reports/<YYYY-MM>.md`; log a CHANGELOG line; flag Paul.

## Standing checkpoints

- **Early-appraisal FYI:** the first time step 4 produces a pipeline number, flag Paul immediately — rough and caveated beats polished and late.
- **Quota watch:** if model usage ceiling is near, report production defers, snapshots never do.
