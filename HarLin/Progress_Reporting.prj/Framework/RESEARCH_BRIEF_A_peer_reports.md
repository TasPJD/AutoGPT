# Research Brief A — Peer Progress Reports & Pipeline Valuation Methods

**For:** Opus research session (light on quota; web research + contained synthesis)
**✅ EXECUTED 2026-07-12** by in-session research subagent (decision D9) → `RESEARCH_FINDINGS_A_peer_reports.md`
**Feeds:** Phase 3 framework design (`PLAN_v0.1.md` §4, §6)
**Output:** `Framework/RESEARCH_FINDINGS_A_peer_reports.md`, cited throughout

## Context (self-contained — no re-orientation needed)

HarLin is building a recurring monthly whole-of-business progress report over a portfolio of internal, mostly pre-revenue AI/software projects (Harness, OS, PAi, Alfred/AEOS, Nexus, GFM), measured on 8 pillars: (1) business value/revenue potential, (2) technical benchmarks, (3) system health, (4) portfolio velocity, (5) decision backlog/operator load, (6) system-of-record integrity, (7) governance, (8) cost/ROI. It also needs a defensible method to put a balance-sheet value on the project pipeline. No number may be produced before the method exists.

## Question 1 — Report structures: what do comparable orgs actually do?

Survey **4–6 frameworks** across at least three of these categories:

- **VC portfolio / board reporting:** standard monthly/quarterly investor-update formats (e.g., YC-style founder updates, Sequoia/Bessemer board-deck conventions, portfolio-company KPI templates).
- **AI labs / research orgs:** how progress is reported when output is capability, not revenue (e.g., published progress reports, OKR-driven research reviews).
- **Dev studios / agencies:** monthly client/portfolio delivery reports.
- **Open-source project health:** CHAOSS metrics, GitHub project health dashboards — relevant to pillars 4 and 6.
- **Solo/holding-company operators:** how one-operator multi-project shops report to themselves or family stakeholders.

For each framework, capture: structure/sections, cadence, metric set, how narrative vs numbers are balanced, and how forward-looking judgment is separated from measured fact.

**Deliverable:** a comparison table + a **borrow / adapt / reject** recommendation per framework, each mapped to the 8 pillars and to the v0 template skeleton in `PLAN_v0.1.md` §5.

## Question 2 — Valuation methods for a pre-revenue internal pipeline

Assess the established early-stage methods for fitness to *internal projects* (no external funding round to anchor price):

- Berkus method; Payne/scorecard method; risk-factor summation
- First Chicago / expected-value (scenario-weighted)
- Cost-to-duplicate / cost-basis approaches
- VC portfolio fair-value marking practice (IPEV guidelines) — how portfolios re-mark between events
- Real-options thinking for platform/tool projects whose value is optionality

**Test this working hypothesis** (from `PLAN_v0.1.md` §6): a stage-gated expected-value scorecard — lifecycle stage × addressable-value estimate × stage-dependent probability, with a cost-basis floor from the existing dispatch cost ledger, summed with confidence bands. State where the hypothesis holds, where an established method does it better, and what the failure modes are (e.g., double-counting platform synergies, stage-inflation bias).

**Deliverable:** recommended method (or hybrid) with the exact inputs each project must supply, so Phase 3 can write `VALUATION_FRAMEWORK.md` directly from it.

## Constraints

- Cite every framework/method claim (link or named publication). No invented sources.
- Keep it light: this is a survey, not the framework itself — recommendations, not final design.
- Currency/units question is open with Paul; keep findings currency-agnostic.
