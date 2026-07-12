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

1. **Gather** (mechanical): pull the month's Pulse summaries, every project CHANGELOG delta, catalog snapshot pair (start/end of month), dispatch cost ledger slice, git logs (Nexus, GeoLedger).
2. **Count** (pillar 4): apply `LIFECYCLE_TAXONOMY.md` event tests; provenance-mark every count.
3. **Measure** (pillars 2–3, 5–6): read from snapshot log + benchmark captures; no synthesis.
4. **Value** (pillar 1): apply `VALUATION_FRAMEWORK.md`; record inputs beside outputs so the number is reproducible.
5. **Write** from `REPORT_TEMPLATE.md`; every field either filled from a named source or marked **not captured** with its capture plan.
6. **Gaps ledger + Decisions sought** last — they fall out of steps 1–5.
7. File as `Reports/<YYYY-MM>.md`; log a CHANGELOG line; flag Paul.

## Standing checkpoints

- **Early-appraisal FYI:** the first time step 4 produces a pipeline number, flag Paul immediately — rough and caveated beats polished and late.
- **Quota watch:** if model usage ceiling is near, report production defers, snapshots never do.
