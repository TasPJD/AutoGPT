# Valuation Framework — v1.0 "GEV-CF" (Gated Expected Value with Cost Floor)

**Status:** 🟢 ADOPTED (decision D10) — method finalized from Research Leg A (`RESEARCH_FINDINGS_A_peer_reports.md`, all parameter choices cited there). One input set outstanding: per-project AV anchors from the Business Plan (marked ⏳ below).
**Lineage:** First Chicago three-scenario expected value × IPEV milestone revaluation × cost-approach floor, with real-options handling for platform projects. Supersedes v0.1 (provisional).
**Standing rule:** any figure this framework produces is a *management-reporting* number. External use (banking, tax, sale) requires an independent valuation.

## 1. What gets valued

1. **Per-project GEV** — each key project (Harness, OS, PAi, Alfred/AEOS, Nexus, GFM) and any pipeline entity at stage S1+.
2. **Pipeline value** — Σ GEV, always presented as a month-on-month *bridge* plus a floor-only conservative total.
3. **Business value** — pipeline value + capability premium (cost-to-duplicate of the operating system around the pipeline: harness, catalog, Alfred) − key-person disclosure adjustment.

## 2. The formula

For each project *i*:

```
GEV_i   = max( Floor_i ,  P(stage_i) × [0.25·AV_worst + 0.50·AV_base + 0.25·AV_best] − CostToComplete_i )
Floor_i = min( transferable-component ledger cost , estimated cost-to-duplicate )
```

- **AV scenarios** (worst/base/best at maturity): each must cite a named external anchor — a Business Plan revenue-model line, comparable product pricing, or a market-size source — with the date of estimate. ⏳ *Anchors per key project to be filled from the Business Plan on next estate access.*
- **P(stage):** fixed ladder below. Probabilities are properties of the stage, never per-project overrides — project-specific pessimism is expressed through the AV scenarios, not P.
- **CostToComplete:** estimated spend to reach S6 from current state.
- **Floor:** cost-to-duplicate, not cost incurred — historical spend above rebuild cost is sunk, not floor. Only transferable components count.

## 3. Stage-probability ladder (calibrated — sources in Findings A §2.4)

| Stage | Gate (see LIFECYCLE_TAXONOMY.md for evidence tests) | P(reach S6) | Band |
|---|---|---|---|
| S0 Conceived | written concept in SoR | 2% | 0.5–5% |
| S1 Scaffolded & scoped | .prj + kill criteria registered | 5% | 2–10% |
| S2 Building / prototype | prototype passes pre-registered check | 10% | 5–20% |
| S3 Functional (internal use) | in real internal use, health metrics live | 20% | 10–35% |
| S4 Validated (external signal) | external user / pilot / LOI / demand evidence | 35% | 25–50% |
| S5 Commercial-ready / launched | shipped per HP-40 test, onboarding path exists | 60% | 40–75% |
| S6 Revenue-bearing | first recurring revenue | exits pipeline valuation → valued on actuals | — |

Ladder calibration: triangulated from the CB Insights/Dealroom/Crunchbase VC funnels and the Stevens & Burley / Cooper NPD funnels — points sit between the harsh idea-funnel and the milder VC funnel because HarLin projects are *gated* (uplift) but *single-operator* (discount). Recalibrate annually against HarLin's own gate history.

## 4. Platform rule (no synergy double-counting)

Harness and OS are platform assets: valued at **floor + one explicitly-labeled "enablement option premium" line** — never via downstream AV. Downstream projects (PAi, Alfred/AEOS, Nexus, GFM) carry P *conditional on their platform's stage* (a dependency on an early-stage platform lowers effective P), and no downstream AV may assume platform capability the platform hasn't demonstrably reached. Each unit of future value is attributed to exactly one project.

## 5. Governance (anti-gaming controls)

1. **Pre-registered gates:** stage promotion requires the taxonomy's written evidence test — promotion claims without evidence are recorded as gaps, not granted.
2. **Report-time-only revaluation:** stages and values change only during monthly report production, never mid-month.
3. **Standing demotion question:** every report asks, per project, "what evidence would justify demotion, and does it exist?"
4. **Successor countersign:** promotions above S3 require a second signature (family successor per HP-39) once that process is stood up; until then the report flags such promotions as single-signed.
5. **Kill criteria:** every S1+ project pre-registers the conditions under which it writes down to floor.
6. **Reproducibility:** every published number sits beside its inputs (stage, AVs + anchors + dates, P, cost figures).

## 6. Required inputs per project (the valuation record)

| # | Input | Source |
|---|---|---|
| 1 | Stage + evidence links satisfying every gate criterion | catalog + project files |
| 2 | AV worst/base/best + named external anchor + date | Business Plan ⏳ / comparables |
| 3 | Ledger cost to date, split transferable vs specific | dispatch cost ledger |
| 4 | Cost-to-duplicate estimate (≤6-monthly refresh) | operator estimate, documented |
| 5 | Cost-to-complete to S6 | operator estimate, documented |
| 6 | Platform dependencies + their stages | catalog |
| 7 | Gate history (promotion/demotion dates) | this framework's records |
| 8 | Kill criteria | registered at S1 |

## 7. Presentation rules

- Pipeline value is always a **bridge**: last month → gates passed/failed → AV re-anchors → this month. Never the bare total alone.
- Always include the **floor-only total** (hard-conservative line) and the **key-person disclosure** (all projects share one operator, one toolchain — the sum overstates independence).
- **Headline composite** (Constellation-style, stable across years, decision D12): **ΔGEV (pipeline value bridge delta) + cost efficiency (spend ÷ stage-advances)** — defined once here; never restated without a FRAMEWORK_CHANGELOG entry.
- First produced number triggers the standing early-appraisal FYI to Paul regardless of report cadence.

## 8. Explicit non-goals

No Berkus/Scorecard/risk-factor-summation as primary methods (no market anchor; single-operator team factor is degenerate). No full option-pricing math (false precision at N≈6). No external use without independent valuation.
