# RESEARCH FINDINGS A — Peer Report Structures & Pre-Revenue Pipeline Valuation

**Research Leg A for HarLin Monthly Progress Report system**
**Date:** 2026-07-12 | **Status:** Survey + recommendation (not final design) | **Currency:** agnostic (all published figures converted to ratios/probabilities where possible)

---

## Part 1 — Survey of Report Structures

Six frameworks surveyed across five requested categories: VC/board reporting (two variants), AI-lab capability reporting, agency delivery reporting, open-source health metrics, and solo/holding-company operator reporting.

### 1.1 YC-style investor update (VC portfolio reporting, written-update variant)

- **Structure/sections:** TL;DR/highlights → KPIs and growth percentages first → challenges/lowlights (each paired with a mitigation) → qualitative recap → specific asks. YC partner Aaron Harris explicitly advises leading with metrics and pushing narrative recap to the bottom so investors see numbers and asks before prose ([Visible.vc — Tips from YC](https://visible.vc/blog/tips-from-yc-using-asks-metrics-and-a-recap-to-power-your-investor-updates/); [Visible.vc YC template](https://visible.vc/templates/y-combinator-investor-update-template/)).
- **Cadence:** monthly (sometimes weekly pre-launch).
- **Metric set:** small and stable — revenue, active users/customers, each shown as current / prior / % change; runway/burn. The discipline is *same metrics every period* so trend-breaks are visible ([Opstart guide](https://www.opstart.co/investor-update-template/); [Carta guide](https://carta.com/learn/private-funds/management/portfolio-management/investor-updates/)).
- **Narrative vs numbers:** numbers-led; narrative is short and subordinate.
- **Fact vs judgment separation:** structural — metrics section is measured fact; "challenges" and "asks" are explicitly labeled judgment/uncertainty. Pairing each lowlight with a response is the honesty mechanism.

### 1.2 Sequoia/Bessemer-style board deck (VC portfolio reporting, meeting variant)

- **Structure/sections:** Sequoia's canonical agenda: Big Picture (~15 min) → Calibration against plan (45–60 min) → Company Building (30 min) → Working Session (1 hr) → Closing. Deck: CEO update, highlights, lowlights, where the company needs help; narrative → numbers → ask ([Sequoia — Preparing a Board Deck](https://articles.sequoiacap.com/preparing-a-board-deck); [Stanford-hosted Sequoia PDF](https://conferences.law.stanford.edu/vcs2020/wp-content/uploads/sites/79/2019/10/Sequoia-Preparing-a-Board-Deck.pdf); [Sequoia Notion template](https://www.notion.com/templates/board-meeting-sequoia)).
- **Cadence:** quarterly (sometimes 6–8 weekly early stage); materials circulated 1–2 days ahead so meeting time is discussion, not presentation.
- **Metric set:** plan-vs-actual calibration is the core — every number is shown against what was previously committed.
- **Narrative vs numbers:** balanced; the "Calibration" block is the largest single time allocation, i.e., variance-against-plan dominates.
- **Fact vs judgment separation:** via the plan/actual split — forecasts are recorded, then future meetings measure against them. Judgment lives in the "Working Session" (one or two strategic questions), deliberately fenced off from the reporting blocks.

### 1.3 AI labs / research orgs — capability & risk reporting

Two sub-patterns:

- **Frontier safety frameworks (OpenAI Preparedness Framework, Anthropic Responsible Scaling Policy):** define *capability thresholds* in advance; run standing evaluations; report a scorecard of where the system sits against each threshold; safeguards/actions are pre-committed per threshold level, and results may be third-party audited ([OpenAI Preparedness Framework v2 PDF](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf); [Anthropic RSP v3](https://www.anthropic.com/news/responsible-scaling-policy-v3); [FAS analysis](https://fas.org/publication/scaling-ai-safety/)). The transferable idea: **thresholds and the response to crossing them are defined before measurement** — the direct analogue of HarLin's "no number before the method exists" rule.
- **Stanford AI Index (annual, ecosystem-wide):** fixed chapter structure (R&D, Technical Performance, Responsible AI, Economy, etc.); benchmark-driven; every claim tied to a named benchmark with a time series ([Stanford HAI AI Index](https://hai.stanford.edu/ai-index/2025-ai-index-report); [Technical Performance chapter](https://hai.stanford.edu/ai-index/2024-ai-index-report/technical-performance)).
- **Cadence:** continuous evaluation + event-triggered reporting (frameworks); annual (Index).
- **Narrative vs numbers:** benchmark scores are primary; narrative interprets deltas.
- **Fact vs judgment separation:** the cleanest of any surveyed framework — measured evals vs pre-registered thresholds; forecasting is a separate, labeled activity.

### 1.4 Dev studio / agency monthly delivery report

- **Structure/sections:** executive summary → deliverables completed (with links/evidence, e.g., "published 4 posts (links below)") → key metrics with trend charts → budget burn vs scope delivered (e.g., "60% of budget spent, 65% of scoped work delivered, projected total spend leaves X buffer") → insights/analysis → next month's 3–5 priorities with owners ([TapClicks monthly client report guide](https://www.tapclicks.com/blog/monthly-client-report-template); [Teamwork project status guide](https://www.teamwork.com/blog/project-status-report/); [ClickUp client report templates](https://clickup.com/blog/client-report-templates/)).
- **Cadence:** monthly, sometimes with weekly status interim.
- **Metric set:** deliverable count/completion, budget burn %, scope-delivered %, RAG status per workstream.
- **Narrative vs numbers:** evidence-led — the distinctive feature is that every claim of work done links to the artifact.
- **Fact vs judgment separation:** weak formally, but the *burn-vs-scope ratio* is an honest measured pairing, and "next month priorities with owners" creates the accountability loop.

### 1.5 Open-source project health (CHAOSS / GitHub)

- **Structure/sections:** CHAOSS "Starter Project Health" metrics model: four metrics covering responsiveness to change requests (e.g., time to first response, change request closure ratio), contributor robustness (bus factor/contributor absence), and repository activity (release frequency) ([CHAOSS Starter Project Health model](https://chaoss.community/kb/metrics-model-starter-project-health/); [CHAOSS Practitioner Guide — Responsiveness](https://chaoss.community/practitioner-guide-responsiveness/); [CHAOSS practitioner guides repo](https://github.com/chaoss/wg-data-science/tree/main/practitioner-guides)).
- **Cadence:** continuous dashboards; reviewed on whatever rhythm the maintainer sets.
- **Metric set:** leading indicators of *sustainability* rather than output: responsiveness, contributor concentration risk, cadence of releases.
- **Narrative vs numbers:** almost entirely numbers; the practitioner guides supply interpretation rules ("if X trends down, investigate Y").
- **Fact vs judgment separation:** total — dashboards are fact; interpretation is deliberately externalized to guides.

### 1.6 Solo-operator / holding-company reporting

Two sub-patterns:

- **Open-startup dashboards (indie hackers):** continuously published MRR, users, churn, uptime; Cal.com's dashboard adds productivity ("weekly merged PRs") and even team-health metrics ([Open Startup List](https://openstartuplist.com/); [Baremetrics Open Startups](https://baremetrics.com/open-startups); [Metabase open startup dashboard example](https://www.metabase.com/examples/open-startup-dashboard)). Strength: honesty-by-automation — numbers come from the system of record, not from the operator's memory. Weakness: no valuation, no forward-looking layer.
- **Constellation Software president's letters (multi-unit software holding company):** a single composite metric — ROIC + Organic Net Revenue Growth — used consistently for years as "a proxy for the annual increase in shareholders' value," plus capital-deployment discussion ([Constellation shareholder letters archive](https://www.csisoftware.com/docs/default-source/investor-relations/presidents-letter/shareholder-letter---2010.pdf); [25iq on Mark Leonard](https://25iq.com/2018/04/07/business-lessons-from-mark-leonard-constellation-software/); [Quartr collection](https://quartr.com/insights/business-philosophy/collection-mark-leonards-shareholder-letters)). Transferable idea for a holding company: **one headline composite that is stable across years**, with everything else subordinate.
- **Cadence:** continuous (dashboards) / annual (letters).
- **Fact vs judgment separation:** dashboards are pure fact; Leonard's letters explicitly flag forecasts and refuse guidance — judgment is confined to capital-allocation commentary.

### 1.7 Comparison table

| Framework | Cadence | Core sections | Metric set | Narrative:numbers | Fact/judgment separation mechanism | Best-fit HarLin pillars |
|---|---|---|---|---|---|---|
| YC investor update | Monthly | TL;DR, KPIs, challenges, recap, asks | Few, fixed, MoM deltas | 30:70 | Metrics block vs labeled challenges/asks | 1, 4, 5, 8 |
| Sequoia board deck | Quarterly | Big picture, calibration vs plan, company building, working session | Plan-vs-actual | 50:50 | Recorded plan → later variance measurement | 1, 5, 7 |
| AI-lab frameworks (RSP/Preparedness) + AI Index | Continuous evals + event triggers / annual | Pre-registered thresholds, eval scorecard, pre-committed responses | Benchmarks vs thresholds | 20:80 | Thresholds fixed before measurement | 2, 3, 7 |
| Agency monthly delivery report | Monthly | Exec summary, deliverables w/ evidence links, burn vs scope, next-month priorities | Deliverables, burn %, RAG | 40:60 | Evidence links; burn-vs-scope pairing | 3, 4, 8 |
| CHAOSS / OSS health | Continuous dashboard | Responsiveness, contributor robustness, activity | Leading sustainability indicators | 5:95 | Dashboard = fact; interpretation guides separate | 3, 4, 6 |
| Open-startup dashboard + Constellation letter | Continuous / annual | Auto-published SoR metrics; one composite headline metric | MRR/users/uptime; ROIC+OGr | 10:90 / 70:30 | Automation from system of record; forecast refusal | 1, 6, 8 |

### 1.8 Borrow / adapt / reject, mapped to the 8 pillars

| Framework | Verdict | What to take, per pillar |
|---|---|---|
| YC update | **Borrow** | Overall monthly skeleton: fixed KPI block first (pillars 1, 4, 8), "challenges paired with mitigation" for pillar 5 (decision backlog), "asks" section becomes "decisions required of operator" — a natural operator-load queue. Reject: revenue-centric KPI choice (mostly pre-revenue portfolio). |
| Sequoia board deck | **Adapt** | Calibration-vs-plan is the single most valuable import: each monthly report records next month's expected milestones per project; the following report measures variance (pillars 4, 7). Adapt cadence: HarLin has no board, so "working session" becomes a written "operator judgment" section, clearly fenced. Reject: 18–26 slide format and meeting choreography — wrong for one operator. |
| AI-lab frameworks / AI Index | **Borrow** | Pre-registered thresholds and standing evals for pillar 2 (technical benchmarks) and pillar 3 (system health): define per-project benchmark suites and stage-gate thresholds *before* scoring, exactly as capability thresholds precede evaluation. Also underwrites governance (pillar 7): stage promotions require pre-defined evidence, mirroring "no number before the method." Reject: audit apparatus scale — a one-operator version is a checklist, not a third-party audit. |
| Agency delivery report | **Adapt** | Evidence-linked deliverables (every claimed output links to repo/commit/artifact) for pillars 4 and 6; burn-vs-scope ratio per project for pillar 8. Reject: client-pleasing framing and RAG theater without thresholds. |
| CHAOSS | **Borrow** | Responsiveness/activity/robustness metrics repurposed for pillar 3 (system health) and pillar 6 (system-of-record integrity — e.g., "% of work items with SoR entries," "median time from event to ledger"). Bus-factor metric is *directly* relevant to a one-operator-plus-family-succession company (pillar 7). Reject: community-growth metrics — no external community. |
| Open-startup / Constellation | **Adapt** | Automation-from-system-of-record principle for pillar 6: no hand-typed numbers; every figure queried from the harness/ledger. From Constellation: one stable composite headline (candidate: pipeline expected value delta + cost efficiency, once the valuation method below exists) for pillar 1/8. Reject: public transparency (internal report) and annual-only cadence. |

**Synthesis for the monthly report skeleton:** YC skeleton (order and brevity) + Sequoia plan-vs-actual calibration + AI-lab pre-registered thresholds + agency evidence links + CHAOSS health/bus-factor metrics + open-startup automation, with one Constellation-style headline composite. Judgment is confined to two labeled sections: "challenges + mitigations" and "operator decisions required."

---

## Part 2 — Valuation Methods for a Pre-Revenue Internal Pipeline

### 2.1 Method-by-method assessment

**Berkus method.** Assigns a capped notional amount to each of five risk-reduction factors (sound idea, prototype, team quality, strategic relationships, product rollout/sales), summing to a capped pre-money maximum ([StartUs magazine explainer](https://magazine.startus.cc/berkus-risk-factor-summation-pre-money-valuation-methods-explained/); [Allied VC comparison](https://www.allied.vc/guides/berkus-method-vs-other-valuation-models)). *Fit:* poor as a primary method — the cap is arbitrary, calibrated to angel-deal norms, and the "team" factor is constant across a one-operator portfolio, so it cannot differentiate projects. *Useful residue:* the idea that value accrues by *risk retired, not features shipped* — worth keeping as a stage-definition principle.

**Payne/Scorecard method.** Starts from average pre-money valuation of comparable recently funded startups in region/sector, adjusted by weighted factors (team 25%, opportunity size 20%, product/tech 18%, etc.) ([Viswanathan comparison](https://viswanathanassociates.com/berkus-vs-scorecard-valuation-method.html); [Waveup 8-method guide](https://waveup.com/blog/startup-valuation-methods/)). *Fit:* weak — the anchor is a *market price of funded peers*, which HarLin explicitly lacks and does not want to import; the weights double-count the same operator across projects. *Useful residue:* the weighting discipline (opportunity size should matter more than tech polish).

**Risk-factor summation.** Comparable-average base adjusted across 12 risk categories rated low/medium/high ([StartUs](https://magazine.startus.cc/berkus-risk-factor-summation-pre-money-valuation-methods-explained/)). *Fit:* same anchor problem as Scorecard. *Useful residue:* its risk taxonomy (management, stage, legislation, competition, technology, litigation, international, reputation, funding, exit) is a good checklist for the confidence-band width per project.

**First Chicago / expected value.** Probability-weighted best/base/worst scenarios, each valued by discounted outcome ([VC Careers explainer](https://venturecapitalcareers.com/blog/first-chicago-method); [Eqvista](https://eqvista.com/first-chicago-method-for-startup-valuation/)). *Fit:* strong conceptually — it is the formal parent of the working hypothesis. The AICPA-recognized PWERM variant is the audited-world version of the same idea, though noted to be best "when the path to liquidity is short" and assumption-heavy ([Vinod Kothari PWERM chapter](https://vinodkothari.com/wp-content/uploads/2025/04/Chapter-7-Probability-Weighted-Method.pdf); [Redwood Valuation on 409A PWERM](https://www.redwoodvaluation.com/blog/409a-pwerm-method); [Carta ASC 820 guide](https://carta.com/learn/private-funds/management/asc-820/)).

**Cost-to-duplicate.** Values the project at replication cost of its current state. Well documented as a *floor*, not a value: it ignores future earning potential and intangibles, and "tends to attribute the base price" ([Finro explainer](https://www.finrofca.com/startup-qa/the-cost-to-duplicate-valuation-method); [FasterCapital on limitations](https://fastercapital.com/content/The-Realities-of-the-Cost-to-Duplicate-Valuation.html)). *Fit:* exactly the role the hypothesis assigns it — a floor fed by the existing cost ledger. One correction: the defensible floor is *cost to duplicate*, not *cost incurred*. Where AI tooling has cut rebuild cost below historical spend, historical spend is a sunk cost, not a floor. Track both; floor on the lower.

**IPEV fair-value marking.** The industry standard for VC portfolio fair value. Key relevant machinery: fair value at each measurement date; for seed/early-stage, scenario-based and **milestone** approaches — set milestones at investment, then at each measurement date assess achievement and adjust; and **calibration** — anchor technique inputs at a point where price is known to be fair, then update inputs, not conclusions ([IPEV Valuation Guidelines, Dec 2022 PDF](https://www.privateequityvaluation.com/Portals/0/Documents/Guidelines/IPEV%20Valuation%20Guidelines%20-%20December%202022.pdf); [2025 edition](https://www.privateequityvaluation.com/Portals/0/Documents/Guidelines/2025%20IPEV%20Valuation%20Guidelines.pdf); [IPEV site](https://www.privateequityvaluation.com/Valuation-Guidelines)). *Fit:* HarLin has no transaction to calibrate to — the recognized weak point — but IPEV's *milestone* discipline (pre-defined milestones, assessed each period) maps one-to-one onto stage gates, and IPEV legitimizes documenting technique + inputs + judgment for auditability (pillar 7).

**Real options.** Values managerial flexibility — stage, abandon, expand — as compound options; standard framing for R&D pipelines and staged investment; a negative-static-NPV project can be worth holding if its embedded options are valuable ([Wikipedia — Real options valuation](https://en.wikipedia.org/wiki/Real_options_valuation); [WIPO on real options in pharma/biotech IP](https://www.wipo.int/web-publications/intellectual-property-valuation-in-biotechnology-and-pharmaceuticals/en/4-the-real-options-method.html); [Umbrex framework summary](https://umbrex.com/resources/frameworks/strategy-frameworks/real-options-valuation/)). *Fit:* full option-pricing math (volatility estimation, binomial lattices) is over-engineered for six internal projects and would produce false precision. But two real-options *ideas* are load-bearing: (a) **platform value = option value on follow-on projects**, which should be valued once at the platform layer (see failure modes); (b) the **abandonment option** means early-stage projects are never worth less than zero plus salvageable components — a reason the cost floor should be *transferable-component* cost, not total spend.

### 2.2 Testing the working hypothesis

> "Stage-gated expected-value scorecard — lifecycle stage (S0 conceived → S6 revenue-bearing) × addressable-value estimate × stage-dependent probability, with a cost-basis floor from an existing cost ledger, summed with confidence bands."

**Where it holds:**

1. It is a legitimate simplification of First Chicago/PWERM with the scenario tree collapsed to one success scenario per project — defensible at this portfolio size, and consistent with IPEV's acceptance of "simplified scenario analysis" for early-stage assets ([IPEV 2022 Guidelines](https://www.privateequityvaluation.com/Portals/0/Documents/Guidelines/IPEV%20Valuation%20Guidelines%20-%20December%202022.pdf)).
2. Stage-dependent probability is empirically the right shape: every published funnel (VC, NPD, pharma) shows survival probability rising monotonically and steeply with stage — CB Insights: 48% of seed companies raise a second round, ~15% a fourth, ~1% reach unicorn ([CB Insights VC funnel](https://www.cbinsights.com/research/venture-capital-funnel-2/)); Stevens & Burley: 3,000 raw ideas → 300 shortlisted → 125 small projects → 9 large projects → 1.7 launches → 1 commercial success ([Stevens & Burley 1997, Research-Technology Management 40(3)](https://www.tandfonline.com/doi/abs/10.1080/08956308.1997.11671126)).
3. The cost floor is standard practice for the earliest stages (cost approach as floor — [Finro](https://www.finrofca.com/startup-qa/the-cost-to-duplicate-valuation-method)) and prevents EV from collapsing to noise at S0–S1 where probability × addressable value is tiny and unstable.
4. Milestone-gated revaluation matches IPEV's milestone approach: value moves only when a pre-defined gate is passed or failed — which directly enforces "no number before the method."

**Where established methods do better:**

1. **Single-scenario EV understates dispersion.** First Chicago's worst/base/best structure is cheap to keep: three addressable-value points per project instead of one, probability-weighted. This *is* the confidence band, but generated from explicit scenarios rather than an arbitrary ±%. Recommendation: keep three scenarios, drop the hypothesis's free-floating band.
2. **Discipline on addressable value.** The hypothesis's weakest input is the operator's own addressable-value estimate — with no market check it is the softest number in the system. The Scorecard method's insight applies: anchor addressable value to an external observable (comparable product price × plausible seat/customer count, published comparable-company revenue multiples) and document the anchor per IPEV's "documented inputs" discipline.
3. **Platform projects.** Simple per-project EV misprices Harness/OS-type platform assets whose value is mostly the option value they confer on PAi/Alfred/Nexus/GFM. Real-options framing handles this correctly; the per-project scorecard alone does not.
4. **Governance of probability updates.** IPEV calibration says: when a gate is passed, update the *stage* (hence probability), not the operator's feelings about probability. The hypothesis permits, but does not force, this. Make probabilities a fixed ladder property of the stage, not a per-project judgment.

**Failure modes (named + additional):**

- **Double-counting platform synergies.** If OS is valued partly on "enables PAi" and PAi's addressable value already assumes OS exists, the synergy is booked twice. Rule: each unit of downstream value is attributed to exactly one project; platform projects are valued at cost floor + a single explicit *enablement option premium*, and dependent projects' probabilities are *conditional on the platform existing* (which lowers them if the platform is early-stage).
- **Stage-inflation bias.** The operator both defines stage attainment and benefits (psychologically) from promotion — one-operator setups have no adversarial check. Mitigations: written, pre-registered gate criteria with evidence links (AI-lab threshold pattern); promotions only in the monthly report, never mid-month; a standing "demotion review" question each month; family-successor countersign on any promotion above S3.
- **Correlated failure.** All projects share one operator, one toolchain, one funding source. Summing independent EVs overstates portfolio value; published funnels assume independent companies. Mitigation: report the sum *and* a "key-person-adjusted" figure, and disclose the correlation in the method notes rather than pretending to model it.
- **Sunk-cost floor inflation.** Ledger cost ≠ duplication cost (see 2.1). Floor on min(ledger cost of transferable components, estimated re-build cost).
- **Small-N instability.** With ~6 projects, one stage change swings the total materially. Mitigation: always report month-on-month *bridge* (which project, which gate) rather than the bare total — Sequoia calibration logic applied to valuation.
- **Base-rate mismatch.** Internal projects with an existing operator, shared infrastructure, and no fundraising requirement are not seed startups; VC graduation rates embed fundraising-market conditions (seed→A fell from ~30.6% for 2018 cohorts to ~15.4% for 2022 cohorts — [Crunchbase News](https://news.crunchbase.com/seed/funding-startups-timeline-series-a-venture/)). Hence: triangulate across VC *and* corporate-NPD funnels, and treat the ladder as a prior to be updated with HarLin's own kill/graduate history over time.

### 2.3 Recommended method: **"Gated Expected Value with Cost Floor" (GEV-CF)** — a First Chicago × IPEV-milestone hybrid

Per project *i*:

```
GEV_i = max( Floor_i ,  P(stage_i) × Σ_s [ w_s × AV_{i,s} ] − CostToComplete_i )
Floor_i = min( transferable-component ledger cost , estimated cost-to-duplicate )
```

where s ∈ {worst, base, best} with fixed weights w = {0.25, 0.50, 0.25} (First Chicago structure), P(stage) comes from the fixed ladder below (IPEV milestone discipline), and platform projects add one explicitly-labeled enablement option premium line (real-options residue), never embedded in downstream AVs.

Portfolio value = Σ GEV_i, reported with (a) the month-on-month bridge, (b) the key-person disclosure, (c) floor-only total as the hard-conservative line.

**Exact inputs each project must supply (all evidence-linked to the system of record):**

1. Current stage S0–S6 + link to evidence satisfying every gate criterion of that stage.
2. Three addressable-value scenarios (worst/base/best) at maturity, each with a named external anchor (comparable product pricing, market-size source) and date of estimate.
3. Cost ledger to date, split into transferable vs project-specific components.
4. Estimated cost-to-duplicate current state (updated ≤ 6-monthly).
5. Estimated cost-to-complete to S6.
6. Dependencies: which platform project(s) it is conditional on, and their stages.
7. Gate history: dates of each promotion/demotion (feeds internal calibration).
8. Kill criteria: pre-registered conditions under which the project is written down to floor.

### 2.4 Recommended stage-probability ladder (calibrated)

Calibration sources triangulated: **(A)** CB Insights VC funnel — 1,119 seed cos., 2008–2010: 48% raised follow-on; ~14% exited post-seed; ~15% reached 4th round; ~1% unicorn ([CB Insights](https://www.cbinsights.com/research/venture-capital-funnel-2/)); **(B)** Dealroom seed-cohort progression chart (~31% seed→A, ~16% →B, ~9% →C, ~5% →D; [Dealroom PDF](https://content.dealroom.co/uploaded/2020/08/Probability-2.pdf)); **(C)** Crunchbase seed→A two-year graduation, 15–30% depending on cohort ([Crunchbase News](https://news.crunchbase.com/seed/funding-startups-timeline-series-a-venture/)); **(D)** Stevens & Burley NPD funnel, 3,000 ideas → 1 commercial success, with 125 small projects → 1 success (~0.8%) and 4 near-launch → 1 success (~25–60% from late stages) ([Stevens & Burley 1997](https://www.tandfonline.com/doi/abs/10.1080/08956308.1997.11671126)); **(E)** Cooper Stage-Gate: roughly 1 in 4 development projects succeeds commercially, ~1/3 of launches fail; formal gate processes materially raise success rates ([Cooper & Edgett, BPTrends](https://bptrends.info/wp-content/publicationfiles/07-06-ART-Stage-GateForProductDev-Cooper-Edgett1.pdf); [Wiley — The Stage-Gate Idea-to-Launch System](https://onlinelibrary.wiley.com/doi/full/10.1002/9781444316568.wiem05014)).

P = probability of reaching S6 (revenue-bearing) from the current stage. Point estimates sit between the harsh NPD idea-funnel and the milder VC funnel, reflecting that HarLin projects are gated (Cooper uplift) but single-operator (concentration discount). Bands are the calibration ranges, not statistical CIs.

| Stage | Definition (gate passed) | P(reach S6) | Band | Primary calibration anchor |
|---|---|---|---|---|
| S0 Conceived | Written concept + pillar-1 hypothesis in SoR | 2% | 0.5–5% | Idea-stage NPD funnel: ~0.03–1% raw-idea→success (D); gated concepts do better (E) |
| S1 Scoped | Problem/user/anchor-value defined; kill criteria registered | 5% | 2–10% | "Shortlisted idea" tier (D: 300→1 ≈ 0.3%, but post-screen gated projects ≫; E) |
| S2 Prototype | Working prototype passes pre-registered technical benchmark | 10% | 5–20% | "Small project" tier (D: 125→1 ≈ 0.8% ungated; E gated uplift); pre-seed analogue |
| S3 Working system (internal use) | In real internal use; system-health metrics live | 20% | 10–35% | Seed analogue: seed→meaningful outcome ≈ 14–48% partial (A); seed→A 15–31% (B, C) |
| S4 Validated (external signal) | External user/pilot/LOI or equivalent demand evidence | 35% | 25–50% | Series-A analogue: A-stage cos. ~2–3× seed survival (A, B); Cooper development-stage ~25% (E) |
| S5 Launch-ready / launched pre-revenue | Shipped, onboarding path exists | 60% | 40–75% | Near-launch NPD tier: 1.7 launches → 1 success ≈ 59% (D); 2/3 of launches succeed (E) |
| S6 Revenue-bearing | First recurring revenue | 100% (of "reach S6") | — | Definition. Project then exits pipeline valuation and is valued on actuals (Constellation-style ROIC+growth lens) |

Governance notes on the ladder: (i) probabilities are properties of the stage, never per-project overrides — project-specific pessimism is expressed through scenarios/AV, not P; (ii) revisit the ladder annually against HarLin's own gate history (IPEV-style recalibration); (iii) any use of the resulting number outside internal reporting (banking, tax, sale) requires an independent valuation — this ladder is a management-reporting device, consistent with IPEV's fair-value-for-reporting framing.

---

## Recommendations for VALUATION_FRAMEWORK.md

1. **Adopt GEV-CF** (§2.3): First Chicago three-scenario expected value × fixed stage-probability ladder, floored at min(transferable ledger cost, cost-to-duplicate), governed by IPEV-style milestone revaluation. Anchor citations: [First Chicago](https://venturecapitalcareers.com/blog/first-chicago-method), [IPEV Guidelines](https://www.privateequityvaluation.com/Valuation-Guidelines), [cost-approach-as-floor](https://www.finrofca.com/startup-qa/the-cost-to-duplicate-valuation-method).
2. **Parameters:** scenario weights 0.25/0.50/0.25; stage ladder S0–S6 = 2/5/10/20/35/60/100% with the bands in §2.4; ladder review annually; AV estimates re-anchored at least every 6 months; value changes only at monthly report time.
3. **Platform rule:** Harness/OS valued at floor + one labeled "enablement option premium" line; downstream projects (PAi, Alfred/AEOS, Nexus, GFM) carry probabilities *conditional* on platform stage; no downstream AV may cite platform capability the platform hasn't reached. (Real-options rationale: [WIPO](https://www.wipo.int/web-publications/intellectual-property-valuation-in-biotechnology-and-pharmaceuticals/en/4-the-real-options-method.html), [Real options overview](https://en.wikipedia.org/wiki/Real_options_valuation).)
4. **Anti-stage-inflation controls:** pre-registered gate criteria with SoR evidence links (AI-lab threshold pattern: [OpenAI Preparedness Framework](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf), [Anthropic RSP](https://www.anthropic.com/news/responsible-scaling-policy-v3)); promotions only at report time; successor countersign above S3; standing monthly demotion question; pre-registered kill criteria per project.
5. **Presentation:** report portfolio GEV as a *bridge* (last month → gates passed/failed → AV re-anchors → this month), plus floor-only conservative total and key-person disclosure — never the bare number alone.
6. **Report integration (from Part 1):** YC-skeleton monthly report; Sequoia plan-vs-actual calibration block; CHAOSS-style health + bus-factor metrics for pillars 3/6/7 ([CHAOSS Starter Project Health](https://chaoss.community/kb/metrics-model-starter-project-health/)); agency-style evidence-linked deliverables and burn-vs-scope for pillars 4/8; all figures queried from the system of record, none hand-typed (open-startup automation principle); one stable Constellation-style headline composite: **ΔGEV + cost efficiency**, defined once and never restated without a documented method change.
7. **Explicit non-goals:** no Berkus/Scorecard/RFS as primary methods (no market anchor; single-operator team factor is degenerate); no full option-pricing math (false precision at N≈6); no external use of the number without independent valuation.
