# Project Lifecycle Taxonomy — v0.1

**Purpose:** objective, countable definitions for pillar 4 (portfolio velocity) and the stage input to the valuation framework. A project event only counts if it is *provable* from the named evidence source (Rule #15 — no reconstruction; unprovable events are recorded as gaps).
**Status:** 🟠 DRAFT — pending alignment with Business Plan / Vision docs and Paul's framework gate.

## 1. Lifecycle stages

Every catalogued entity is in exactly one stage at any time. Stage is asserted by the catalog (`status`/`maturity` fields) and evidenced by the project's own files.

| Stage | Definition (objective test) | Evidence source |
|---|---|---|
| **S0 Conceived** | Idea recorded but no project scaffold exists | Console/Pulse record, ideas ledger |
| **S1 Scaffolded** | `.prj` exists via catalog write-path with descriptor (AGENTS.md front-matter) | catalog entry + scaffold CHANGELOG line |
| **S2 Active-building** | ≥1 substantive CHANGELOG entry in the period beyond scaffolding | project CHANGELOG |
| **S3 Functional** | The thing runs / is usable for its stated purpose (even internally) | PROGRESS.md claim + a demonstrable artifact |
| **S4 Operational** | In routine use inside HarLin (part of daily/weekly operations) | Pulse session evidence of recurring use |
| **S5 Commercial-ready** | Meets the Commercial-Grade doctrine test for external sale/lease (HP-40) | explicit readiness review record |
| **S6 Revenue-bearing** | Generating actual revenue | ledger/financial record |
| **SX Shelved** | Deliberately paused; may resume | CHANGELOG/TODO entry stating shelving + reason |
| **SZ Closed** | Deliberately ended; will not resume | CHANGELOG entry stating closure + reason |

Stage transitions are the atomic events the monthly report counts. A transition without evidence is reported as **gap**, not asserted.

## 2. Period event definitions (pillar 4 counters)

Counted per calendar month, from CHANGELOGs + catalog + Pulse:

| Event | Objective test |
|---|---|
| **Conceived** | first record of the idea falls in the period (S0 entry) |
| **Touched** | ≥1 CHANGELOG entry or Pulse session naming the project in the period |
| **Scope-expanded** | CHANGELOG/TODO records a material addition to the project's stated purpose (descriptor purpose changed, or a new sub-workstream created) |
| **Advanced** | ≥1 forward stage transition in the period |
| **Shelved / Closed** | SX/SZ transition recorded in the period |

"Touched" is deliberately the loosest counter (activity), "Advanced" the strictest (progress). Reporting both prevents activity being mistaken for progress.

## 3. Provenance marking

Every counted event carries one of:
- **confirmed** — named evidence line exists (file + date)
- **inferred** — strong indirect evidence (e.g., git commits without CHANGELOG); stated as inferred
- **gap** — believed to have happened but no evidence; listed in the Gaps ledger with a capture plan

## 4. Interaction with valuation

The valuation framework (see `VALUATION_FRAMEWORK.md`) keys its stage-dependent probability off these stages. Stage inflation is the main gaming risk: a stage claim above S2 requires the stated evidence, not self-assessment.
