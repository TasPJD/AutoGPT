# Project Lifecycle Taxonomy — v1.0

**Purpose:** objective, countable definitions for pillar 4 (portfolio velocity) and the stage input to `VALUATION_FRAMEWORK.md`. A project event only counts if it is *provable* from the named evidence source (Rule #15 — no reconstruction; unprovable events are recorded as gaps).
**Status:** 🟢 ADOPTED (decision D11) — v1.0 reconciles the v0.1 draft with the calibrated valuation ladder from Research Leg A. Key change from v0.1: S4 now requires an **external demand signal**, because external validation — not internal routine — is what published funnels show actually moves success probability.

## 1. Lifecycle stages

Every catalogued entity is in exactly one stage at any time. Stage is asserted by the catalog (`status`/`maturity` fields) and evidenced by the project's own files. P values are the valuation ladder (calibration in `RESEARCH_FINDINGS_A_peer_reports.md` §2.4).

| Stage | Objective test (ALL criteria must hold) | Evidence source | P(reach S6) |
|---|---|---|---|
| **S0 Conceived** | Idea recorded in the SoR with a one-line value hypothesis; no scaffold | Console/Pulse record, ideas ledger | 2% |
| **S1 Scaffolded & scoped** | `.prj` exists via catalog write-path with descriptor; problem/user/anchor-value stated; kill criteria registered | catalog entry + descriptor + kill-criteria line | 5% |
| **S2 Building / prototype** | ≥1 substantive CHANGELOG entry beyond scaffolding; a runnable prototype passes a pre-registered check | project CHANGELOG + check record | 10% |
| **S3 Functional (internal use)** | Runs for its stated purpose and is in real internal use; health signals observable | PROGRESS.md claim + demonstrable artifact + Pulse usage evidence | 20% |
| **S4 Validated (external signal)** | S3 **plus** at least one external demand signal: outside user, pilot, LOI, or documented paying intent | the signal itself, filed in the project | 35% |
| **S5 Commercial-ready / launched** | Meets the HP-40 commercial-grade test for sale/lease; onboarding path exists | readiness review record | 60% |
| **S6 Revenue-bearing** | Actual recurring revenue | ledger/financial record | exits pipeline valuation |
| **SX Shelved** | Deliberately paused; may resume | CHANGELOG/TODO entry stating shelving + reason | 0 (floor value retained) |
| **SZ Closed** | Deliberately ended; will not resume | CHANGELOG entry stating closure + reason | 0 (transferable components salvaged to floor) |

Notes:
- Routine internal use **without** an external signal caps a project at S3 for valuation, however operationally embedded it is. This is deliberate: internal indispensability is not market evidence.
- Stage transitions are the atomic events the monthly report counts, and they change value only at report time (VALUATION_FRAMEWORK §5.2).

## 1a. Mapping to existing HarLin ladders (HP-22: integrate, never duplicate)

The estate already runs two maturity vocabularies: the **HRL 0–9** lifecycle grid (`HarLin_OS\LIFECYCLE_STANDARD.md`) and the **pipeline ladder** (`HarLin_OS\PRODUCT_PIPELINE.md`: CONCEPT → RESEARCH → MVP → PRE-PROD → PRODUCTION → SCALE). This taxonomy is the *valuation lens* over the same reality — stages map, they don't compete. Where the grids disagree on an edge case, the LIFECYCLE_STANDARD gate question governs and this table gets a FRAMEWORK_CHANGELOG entry.

| Valuation stage | HRL | Pipeline ladder | Lifecycle-grid gate question |
|---|---|---|---|
| S0 Conceived | 0–1 | CONCEPT | Worth preserving? Coherent? |
| S1 Scaffolded & scoped | 2–3 | RESEARCH | Real opportunity? Consume active capacity? |
| S2 Building / prototype | 4–5 | MVP (building) | In scope? Works for real use? |
| S3 Functional (internal use) | 5–6 | MVP (dogfood) | Real user validated? (internal) |
| S4 Validated (external signal) | 6–7 | PRE-PROD | Real *external* user validated? |
| S5 Commercial-ready / launched | 7 | PRODUCTION | Sellable, supportable, defensible? |
| S6 Revenue-bearing | 8–9 | PRODUCTION/SCALE | Sustained, measured? |

## 2. Period event definitions (pillar 4 counters)

Counted per calendar month, from CHANGELOGs + catalog + Pulse:

| Event | Objective test |
|---|---|
| **Conceived** | first record of the idea falls in the period (S0 entry) |
| **Touched** | ≥1 CHANGELOG entry or Pulse session naming the project in the period |
| **Scope-expanded** | CHANGELOG/TODO records a material addition to stated purpose (descriptor purpose changed, or new sub-workstream created) |
| **Advanced** | ≥1 forward stage transition in the period, evidence test met |
| **Shelved / Closed** | SX/SZ transition recorded in the period |

"Touched" is deliberately the loosest counter (activity), "Advanced" the strictest (progress). Reporting both prevents activity being mistaken for progress.

## 3. Provenance marking

Every counted event carries one of:
- **confirmed** — named evidence line exists (file + date)
- **inferred** — strong indirect evidence (e.g., git commits without CHANGELOG); stated as inferred
- **gap** — believed to have happened but no evidence; listed in the Gaps ledger with a capture plan

## 4. Interaction with valuation

The valuation framework keys P off these stages. Stage inflation is the main gaming risk: a stage claim above S2 requires the stated evidence, promotions land only at report time, and the standing demotion question + successor countersign (VALUATION_FRAMEWORK §5) apply.
