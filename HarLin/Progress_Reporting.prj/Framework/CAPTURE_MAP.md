# Capture Map — report field → data source — v0.1

**Status:** 🟠 DRAFT. Every report field is listed here with its feeding source. A field with no live source is **not captured** and carries a capture plan — it is never reconstructed (Rule #15 / OSB-014). This map is the paradigm-shift artifact: from Alfred's commencement (2026-07-11) forward, capture is systematic.

Legend: ✅ captured today · 🔶 partially captured · ❌ not captured (capture plan given)

| # | Report field (template §) | Pillar | Source | Status | Capture plan if ❌/🔶 |
|---|---|---|---|---|---|
| 1 | Pillar dashboard deltas | all | this map's rows | ✅ | — |
| 2 | Projects touched / conceived / expanded / advanced / shelved / closed | 4 | project CHANGELOGs (mandatory since 2026-04-12) + catalog + Pulse | ✅ | backfill months rely on CHANGELOG density; sparse months marked inferred/gap |
| 3 | Per-project revenue-potential score + delta | 1 | ❌ none — framework first | ❌ | `VALUATION_FRAMEWORK.md` defines inputs; first scoring pass after gate |
| 4 | Pipeline balance-sheet value | 1 | ❌ none — framework first | ❌ | as above; early-appraisal FYI on first number |
| 5 | Business value roll-up | 1 | ❌ | ❌ | derived from 3+4 once they exist |
| 6 | Benchmarks: speed / accuracy / error rate / storage | 2 | ❌ no instrumentation yet | ❌ | Research Leg B → KPI set → instrumentation per Benchmarks spec |
| 7 | System health: uptime, incidents, drift | 3 | 🔶 Console /watch + steward selftest exist; no periodic log | 🔶 | add health snapshot line to `_snapshots.log` cadence |
| 8 | Usage-ceiling watch (quota) | 3 | 🔶 Paul's manual readings (e.g. 2026-07-10: Fable 38%, all-Claude 32%) | 🔶 | log reading whenever observed; investigate automated capture |
| 9 | AWAITING CONFIRM backlog + resolution rate | 5 | `harlin_orient` counts → `Reports/_snapshots.log` | ✅ | backlog ✅ today; *resolution rate* needs opened/closed deltas — derive from consecutive snapshots |
| 10 | Open questions / PAUL_ACTIONS counts | 5 | orient/Console | 🔶 | include in snapshot line each time visible |
| 11 | Catalog entities / stubs / missing CP boxes | 6 | catalog + orient → `_snapshots.log` | ✅ | — |
| 12 | Dispatch / agent cost | 8 (month 2) | `runtime\logs\dispatch_cost.log` | ✅ | staged for month-two reporting |
| 13 | Governance / sensitivity-gate incidents | 7 (month 2) | ❌ no incident log | ❌ | define incident record format in month-two prep |
| 14 | Session narrative (key project sections) | — | Pulse SESSION_INDEX + summaries (auto since June) | ✅ | pre-June backfill months: CHANGELOGs only, marked accordingly |
| 15 | Git-based activity (Nexus, GeoLedger) | 4 | repo git history | ✅ | — |

## Backfill provenance expectations

| Period | Expected provenance mix |
|---|---|
| 2026-04 | CHANGELOGs only → mostly confirmed for pillar 4, gaps elsewhere |
| 2026-05 | CHANGELOGs + early Pulse → improving |
| 2026-06 | CHANGELOGs + Pulse + SESSION_INDEX → good pillar 4/5 coverage |
| 2026-07a (1–10) | full sources, pre-Alfred baseline |
| 2026-07b (11–EOM) | full sources + systematic snapshots → first fully-captured period |

The visible improvement in provenance mix across these five reports is itself evidence of the paradigm shift — worth a chart in `2026-07b`.
