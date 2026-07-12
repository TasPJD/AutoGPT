# Capture Map — report field → data source — v0.1

**Status:** 🟠 DRAFT. Every report field is listed here with its feeding source. A field with no live source is **not captured** and carries a capture plan — it is never reconstructed (Rule #15 / OSB-014). This map is the paradigm-shift artifact: from Alfred's commencement (2026-07-11) forward, capture is systematic.

Legend: ✅ captured today · 🔶 partially captured · ❌ not captured (capture plan given)

| # | Report field (template §) | Pillar | Source | Status | Capture plan if ❌/🔶 |
|---|---|---|---|---|---|
| 1 | Pillar dashboard deltas | all | this map's rows | ✅ | — |
| 2 | Projects touched / conceived / expanded / advanced / shelved / closed | 4 | project CHANGELOGs (mandatory since 2026-04-12) + catalog + Pulse | ✅ | backfill months rely on CHANGELOG density; sparse months marked inferred/gap |
| 3 | Per-project GEV + delta | 1 | 🔶 method adopted (VALUATION_FRAMEWORK v1.0); AV anchors pending Business Plan read | 🔶 | fill anchors → first scoring pass → early-appraisal FYI |
| 4 | Pipeline value bridge + floor-only total | 1 | 🔶 as row 3 | 🔶 | as row 3 |
| 5 | Business value roll-up | 1 | 🔶 derived from 3+4 + capability premium | 🔶 | after rows 3–4 |
| 6 | Benchmarks: 9-KPI set (success, intervention, selftest, latency, incidents, availability, cost, ceiling, storage) | 2 | ❌ instrumentation not built | ❌ | build order in `Benchmarks/INSTRUMENTATION_SPEC.md`; step 1 (outcome+intervention fields) first |
| 7 | System health: availability, incidents, drift | 3 | 🔶 Console /watch + steward selftest exist; no persisted log | 🔶 | `probes.jsonl` + `incidents.jsonl` per `Benchmarks/INSTRUMENTATION_SPEC.md` build order |
| 8 | Usage-ceiling watch (quota) | 3 | 🔶 Paul's manual readings (e.g. 2026-07-10: Fable 38%, all-Claude 32%) | 🔶 | KPI 8 (ceiling proximity) from cost-ledger daily rollup per instrumentation spec; manual readings logged until then |
| 9 | AWAITING CONFIRM backlog + resolution rate | 5 | `harlin_orient` counts → `Reports/_snapshots.log` | ✅ | backlog ✅ today; *resolution rate* needs opened/closed deltas — derive from consecutive snapshots |
| 10 | Open questions / PAUL_ACTIONS counts | 5 | orient/Console | 🔶 | include in snapshot line each time visible |
| 11 | Catalog entities / stubs / missing CP boxes | 6 | catalog + orient → `_snapshots.log` | ✅ | — |
| 12 | Dispatch / agent cost | 8 (month 2) | `runtime\logs\dispatch_cost.log` | ✅ | staged for month-two reporting |
| 13 | Governance / sensitivity-gate incidents | 7 (month 2) | ❌ no incident log | ❌ | define incident record format in month-two prep |
| 14 | Session narrative (key project sections) | — | Pulse SESSION_INDEX + summaries (auto since June) | ✅ | pre-June backfill months: CHANGELOGs only, marked accordingly |
| 15 | Git-based activity (Nexus, GeoLedger) | 4 | repo git history | ✅ | — |
| 16 | Calibration block (planned vs achieved milestones) | 4/7 | prior report §10 | ✅ from second report | first report records "calibration begins next period" |
| 17 | Valuation input records (stage evidence, AV anchors, gate history, kill criteria) | 1 | VALUATION_FRAMEWORK §6 records | ❌ until first scoring pass | created during first scoring pass; AV anchors from Business Plan ⏳ |

## Backfill provenance expectations

| Period | Expected provenance mix |
|---|---|
| 2026-04 | CHANGELOGs only → mostly confirmed for pillar 4, gaps elsewhere |
| 2026-05 | CHANGELOGs + early Pulse → improving |
| 2026-06 | CHANGELOGs + Pulse + SESSION_INDEX → good pillar 4/5 coverage |
| 2026-07a (1–10) | full sources, pre-Alfred baseline |
| 2026-07b (11–EOM) | full sources + systematic snapshots → first fully-captured period |

The visible improvement in provenance mix across these five reports is itself evidence of the paradigm shift — worth a chart in `2026-07b`.
