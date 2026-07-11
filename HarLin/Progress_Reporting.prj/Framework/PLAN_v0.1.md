# HarLin Monthly Progress Report System — Initial Plan v0.1

**Authored:** 2026-07-11, Claude Code planning session
**Source of intent:** `Progress_Reporting.prj/FOUNDING_BRIEF.md` (Paul × Alfred, Console thread `th_af53114ccbd4`, 2026-07-10)
**Status:** 🟠 DRAFT — for Paul's review. Nothing in this plan is a commitment to a number, a valuation, or a report until the framework gate (Phase 4) is passed.
**Canonical home:** `C:\AI\HarLin_HQ\Progress_Reporting.prj\Framework\` — this file is delivered via repo and should be copied there on acceptance.

---

## 1. Context

Bringing Alfred online is intended to be a paradigm shift in the economic potential and actual economic success of HarLin's digital business plan. The founding conversation ratified a recurring **monthly HarLin Progress Report** (whole-of-HarLin plus key-project sections: Harness, OS, PAi, Alfred/AEOS, Nexus, GFM), with backfilled instances for April–June 2026 and a deliberate July split (Jul 1–10 / Jul 11–EOM) so the before/after of Alfred's commencement is *measured, not asserted*.

The founding brief captures **what** to measure (8 pillars) and **in what order** to build (5 steps). This plan turns that into an executable system design: the artifacts, the phase hand-offs between sessions, the gates, and the research briefs that feed the framework.

## 2. What is being built (the system, not just the report)

Four layers, each an artifact set under `Progress_Reporting.prj`:

| Layer | What it is | Artifacts |
|---|---|---|
| **Frameworks** | The objective definitions that make the numbers mean something: project lifecycle taxonomy, per-project revenue-potential scoring, pipeline balance-sheet valuation method, business-value roll-up | `Framework/VALUATION_FRAMEWORK.md`, `Framework/LIFECYCLE_TAXONOMY.md` |
| **Measurement** | The 8 pillars, each field mapped to a data source — or explicitly marked **"not captured"** with a capture plan (Rule #15: no reconstruction) | `Framework/CAPTURE_MAP.md`, `Benchmarks/` instrumentation spec |
| **Report** | The monthly template and its instances | `Framework/REPORT_TEMPLATE.md`, `Reports/2026-04.md` … `2026-07a.md`, `2026-07b.md` |
| **Process** | The monthly production runbook: who/what runs it, when, and the standing FYI checkpoint (early pipeline appraisal flagged the moment a method produces a number) | `Framework/RUNBOOK.md` |

Doctrine check (HP-40, Rule #21 — Commercial-Grade by Default): the report system is designed as a durable, repeatable process with versioned frameworks — the kind of progress/valuation reporting discipline that is itself saleable practice, not a one-off document run.

## 3. The 8 pillars — planning notes and current baselines

Pillars and definitions are as ratified in the founding brief. Planning additions:

| # | Pillar | Baseline 2026-07-10 (founding) | Snapshot 2026-07-11 (this session, from Alfred's orient) |
|---|---|---|---|
| 5 | Decision backlog / operator load | 134–135 AWAITING CONFIRM; 77 open questions (9 PAUL_ACTIONS) | **148 AWAITING CONFIRM** |
| 6 | System-of-Record integrity | 159/207 stub descriptors; 57 missing CP boxes (208 entities) | **214 entities; 159 stubs; 64 missing CP boxes** |

Two consecutive daily data points already exist for pillars 5–6 — the time series has effectively started. The runbook should specify a lightweight periodic snapshot (orient output → dated log line) so these pillars accrue data with zero synthesis cost while the heavier pillars are still being designed.

Core six (pillars 1–6) in scope now; 7 (governance) and 8 (cost/ROI) join month two, per the founding brief.

## 4. Phase plan and session hand-offs

The work is deliberately split across model sessions to respect the quota constraint (heavy synthesis after the Friday 5pm reset or on Paul's explicit go; research legs are light).

### Phase 1 — Initial planning (this session) ✅
Deliverables: this plan; two research briefs (below); repo delivery + PR for Paul's review.

### Phase 2 — Research (Opus sessions, light on quota)
Two independent legs, each with a self-contained brief so the session needs no re-orientation:

- **Leg A — Peer report & valuation research:** `Framework/RESEARCH_BRIEF_A_peer_reports.md`
  How comparable orgs structure monthly progress/board reports, and which early-stage/pre-revenue valuation methods fit a pipeline of internal AI projects. 4–6 frameworks, cited, with borrow/reject recommendations mapped to the 8 pillars.
- **Leg B — Benchmark standards research:** `Benchmarks/RESEARCH_BRIEF_B_benchmarks.md`
  Established suites and practices for agent-system accuracy / latency / reliability / storage; applicable-vs-inapplicable verdict for Alfred/AEOS/Harness; a proposed minimal KPI set and instrumentation sketch.

Each leg's output lands as a `RESEARCH_FINDINGS_*.md` beside its brief. Legs are independent — run in either order or in parallel sessions.

### Phase 3 — Framework + capture-gap design (heavy synthesis; post-reset or Paul's go)
Consumes both research findings. Produces:
1. `REPORT_TEMPLATE.md` — every field names its data source or is marked **not captured** + capture plan. This is the paradigm-shift piece: Alfred's commencement is where capture becomes systematic instead of retrofitted.
2. `VALUATION_FRAMEWORK.md` — the method for revenue-potential per project, pipeline balance-sheet value, and business value. **Method before any number** (standing constraint).
3. `LIFECYCLE_TAXONOMY.md` — objective definitions for conceived / touched / scope-expanded / closed / shelved, so pillar 4 counts are countable, not vibes.
4. `RUNBOOK.md` — monthly production process + the daily/weekly snapshot cadence for pillars 5–6.

### Phase 4 — GATE: Paul confirms the framework
Nothing is written into `Reports/` until this gate passes. Standing FYI checkpoint activates here: the first rough, caveated pipeline balance-sheet number is flagged to Paul the moment the method produces one — rough and early beats polished and late.

### Phase 5 — Backfill and first live report
In order: `2026-04` → `2026-05` → `2026-06` → `2026-07a` (Jul 1–10) → `2026-07b` (Jul 11–EOM). Every claim provenance-marked **confirmed / inferred / gap** (Rule #15 / OSB-014). Data sources per the founding brief: Pulse + SESSION_INDEX, project CHANGELOGs (mandatory since 2026-04-12 — richest backbone), PROJECT_INDEX + catalog snapshots, dispatch cost ledger, git history (Nexus, GeoLedger).

## 5. Report template — v0 skeleton (for Phase 3 to flesh out)

```
# HarLin Progress Report — <YYYY-MM>
1. Executive summary (5 bullets max; the month in one screen)
2. Pillar dashboard (one row per pillar: value, Δ vs prior month, trend, provenance mix)
3. Portfolio movement (pillar 4): conceived / touched / expanded / closed / shelved — per lifecycle taxonomy
4. Value & pipeline (pillar 1): per-project revenue-potential deltas; pipeline balance-sheet value (only after Phase 4 gate)
5. Key project sections: Harness · OS · PAi · Alfred/AEOS · Nexus · GFM
   (each: what moved, what it means for value, provenance)
6. System health & performance (pillars 2–3): benchmarks vs self-over-time; incidents; usage-ceiling watch
7. Operator load (pillar 5): AWAITING CONFIRM backlog + resolution rate — is the executive-function prosthetic working?
8. Record integrity (pillar 6): catalog completeness trend
9. Gaps ledger: every "not captured" field + its capture plan and ETA
10. Decisions sought: the ≤5 things Paul's word is needed on
```

Field-level data-source mapping is Phase 3 work (`CAPTURE_MAP.md`); the skeleton exists now so both research legs know the shape they're feeding.

## 6. Valuation framework — initial direction (hypothesis for Leg A to test, not a decision)

Pre-revenue internal projects can't be DCF'd honestly. Working hypothesis: a **stage-gated expected-value scorecard** — each project gets (a) a lifecycle stage from the taxonomy, (b) an addressable-value estimate, (c) a stage-dependent probability/discount, with (d) a cost-basis floor from the dispatch cost ledger, and the pipeline balance-sheet value is the sum with explicit confidence bands. Leg A must test this against established methods (Berkus, Payne scorecard, risk-factor summation, First Chicago / expected-value, cost-to-duplicate, VC portfolio marking practice) and recommend borrow/adapt/reject. The Millionaire gate ladder (`Millionaire.prj\PLAN_v0.4.md`) stays the *revenue milestone* frame the report references, not something this replaces.

## 7. Constraints (standing, restated)

1. **Method before number** — no balance-sheet or valuation figure until `VALUATION_FRAMEWORK.md` exists and passes the Phase 4 gate.
2. **Rule #15 / OSB-014** — no reconstruction; gaps are marked and capture-planned, never backfilled from vibes.
3. **Quota** — heavy synthesis (Phase 3, Phase 5 writing) sequences after the Friday 5pm reset or Paul's explicit go; research legs are light.
4. **Priority** — Phone-by-Saturday (task #54) outranks this workstream until Paul flies.
5. **Write path** — all HarLin_HQ writes go through the catalog single write-path on Paul's side; this session's MCP access is read-only, so deliverables travel via this repo/PR.

## 8. Open questions for Paul (non-blocking for Phase 2)

1. Currency and unit conventions for valuation (AUD assumed?).
2. Report audience: Paul-only for now, or drafted from day one to be board/family-legible (succession doctrine HP-39 suggests the latter)?
3. Should the pillar 5–6 daily snapshot be automated on the HarLin side (a small script logging orient counts), or captured manually until Phase 3?
4. Does `2026-07b` land at EOM as a normal monthly, making `2026-07a` a one-off appendix — or are both standalone instances? (Plan assumes both standalone, per founding brief.)
