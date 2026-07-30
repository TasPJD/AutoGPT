# Schedule of Accounts — Proposal for HarLin Consulting Pty Ltd

**Status:** 🟠 PROPOSAL — for collaborative inter-AI review, then accountant-gated implementation
**Prepared by:** HarLin Commercial engine (Quartermaster / Bookkeeper duty), CCR session
**Date:** 2026-07-30 · **Owner:** Paul Dale · **Entity:** HarLin Consulting Pty Ltd (ACN 642 382 447 / ABN 90 642 382 447), AUD, NSW/AU
**Governing doctrine:** HP-12 ground truth · HP-19 human gates · HP-39 succession/multi-entity · HP-40 commercial-grade · Standing Rule #28 Work Loop
**Nothing live changed:** this document reviews and proposes only. No Xero account was created, renamed, merged or archived.

> **Work Loop (Standing Rule #28) — Whetstone distillation for this task**
> - **Purpose:** make divisional and product profitability visible as HarLin scales from a single consulting entity into a multi-division products+services group.
> - **Intent:** review the current Xero CoA; propose a comprehensive Schedule of Accounts across all divisions with activity-level detail, for inter-AI review and gated implementation. Change nothing live.
> - **First-Tier Outcome:** a review-ready design (current-state + target backbone + tracking model within Xero limits + subdivided Marketing + COGS/deferred-revenue + review matrix + gated rollout).

---

## 1. Current-state review (what Xero holds today)

Pulled from Xero (P&L account structure, accrual, 2026-07-01→30; all balances $0 for the young FY, so this is a *structural* read):

**Income — 11 accounts, essentially one account per client:**
`Sales` · `Sales - Mining Associates` · `Sales - Solomons Gold` · `Sales - Okapi Resources` · `Sales - Henty Gold` · `Flynn Gold Ltd` · `Sales - Durendal Resources` · `Sales - Kincora` · `Barton Gold` · `Durendal Resources Inc` · `Other income`

**Other income — 2:** `Interest received` · `Refunds`
**Cost of Sales — 0 accounts.**
**Expenses — 61 accounts:** a standard Australian small-company chart with legacy numeric codes (e.g. `1550`, `1810`, `1880`, `1885`, `1927`, `1935`); a **single** `Advertising and promotion` line; heavy field/vehicle detail (`M/V commercial - Fuel & oil / Lease / Repairs`, `Protective clothing`) reflecting the consulting-geologist origin; the usual G&A, people, occupancy, depreciation, finance and tax lines.

### What that structure can and can't tell us

| Question the business will ask | Answerable today? |
|---|---|
| Revenue by **client** | ✅ (but via GL accounts — the wrong mechanism; see §3) |
| Revenue by **division** (Consulting vs Labs vs MaSha vs Seven Fold) | ❌ no dimension exists |
| Revenue by **product/stream** (GeoLedger vs FieldCam …) | ❌ |
| **Gross margin** per product/service | ❌ no Cost of Sales at all |
| **Marketing** broken into channels/activities | ❌ one line only |
| **Recurring vs one-off** revenue (SaaS metrics) | ❌ |
| **Deferred revenue** on annual subscriptions | ❌ no liability account |

**Diagnosis:** the current CoA is a faithful *single-consulting-entity* chart. It tracks revenue by **client name in the GL** and has **no divisional dimension, no COGS, and no products/subscriptions scaffolding**. It cannot produce the divisional or product P&Ls the four-pillar, HP-40 business now needs.

---

## 2. Design principle — two layers, not a giant chart

The wrong fix is a GL account for every division × product × activity: that explodes into hundreds of accounts and still can't cross-cut. The right fix is Xero's intended model:

- **Layer 1 — a stable Chart of Accounts** answering *what kind of money* (revenue nature, COGS, opex function, assets, liabilities, equity). Kept deliberately compact.
- **Layer 2 — Tracking Categories** answering *whose / which* (division, product/stream, campaign). Every transaction is sliced without multiplying accounts.

**Hard constraint (must design around it):** **Xero supports a maximum of 2 tracking categories** (up to ~100 options each). We therefore spend those two slots on the two highest-value axes and push any finer dimension to the AEOS analytics layer (Bookkeeper pulls Xero via API into the estate's ground-truth store — HP-12 — where unlimited dimensions are cheap).

**Chosen axes:**
- **Tracking Category 1 = `Division`** — the primary P&L view; applies to *both* revenue and cost, so every division gets a full P&L including allocated shared costs. Also the clean seam for a future multi-entity split (HP-39).
- **Tracking Category 2 = `Stream / Product / Campaign`** — the secondary cut inside a division (GeoLedger, FieldCam, a named engagement, a named campaign).
- **Function detail (esp. Marketing)** is carried on the **account axis** (subdivided account blocks, §5) so it reads on the face of the P&L *and* can still be sliced by Division and Campaign.

---

## 3. Revenue architecture

**Move client names out of the GL.** Clients are already Xero **Contacts** — "revenue by client" belongs in Contact/receivables reports, not the chart. Retiring the nine per-client income accounts de-clutters the chart and stops it growing by one account per new client.

Proposed revenue accounts (numbering per §7), by **division-family + revenue nature** so the divisional P&L is readable even before tracking filters:

| Code | Account | Notes |
|---|---|---|
| 4000 | Consulting — Advisory & Technical Services | Strategic Advisory, AI-Enabled Geoscience, TDD, Governance/Board |
| 4010 | Consulting — Retainers & Interim Roles | recurring/retained; interim exec (e.g. Country/Exploration Manager) |
| 4020 | Consulting — Expert Network & Panels | GLG / Dialectica-type |
| 4050 | Decision & Evidence Systems | new Commercial category (Sprints, Data-Room Triage, White-label) |
| 4100 | Labs — Software Subscriptions (recurring) | NEXUS SaaS: GeoLedger, HarLin Field … |
| 4110 | Labs — Software Licences (term/perpetual) | |
| 4120 | Labs — Implementation & Onboarding | one-off services attached to a product |
| 4130 | Labs — Support & Maintenance Plans | |
| 4140 | Labs — Usage / Metered / API | |
| 4200 | Labs — Data Products & Portals | |
| 4300 | MaSha Labs — Consumer Revenue | app subscriptions, in-app purchases, ad revenue |
| 4400 | Seven Fold Learning — Program & Course Fees | |
| 4410 | Seven Fold Learning — Content & Curriculum Licensing | |
| 4600 | IP, Royalties & Licensing | cross-division IP income |
| 4900 | Other operating income | |
| 4950 | Grant & Co-funding income | if/when applicable (kept distinct from trading income) |

Non-operating stays separate: `Interest received`, `Refunds`, FX gains → the 8000 "Other income/expense" block (§7).

**Recurring vs one-off** falls out naturally: 4100/4130/4300-subscription/4400 are the recurring lines the SaaS metrics (MRR/ARR, churn) are built from — feed the Commercial dashboard, not asserted by hand (HP-12).

---

## 4. Cost of Sales (new — required for gross margin)

A products business cannot see gross margin without COGS. Proposed 5000 block, sliced by Division via Tracking Cat 1:

| Code | Account |
|---|---|
| 5000 | COGS — Delivery labour & subcontractors (Consulting) |
| 5010 | COGS — Expert/specialist fees (Consulting) |
| 5020 | COGS — Rechargeable client travel & disbursements |
| 5100 | COGS — Cloud & hosting (Labs/MaSha) |
| 5110 | COGS — Third-party API / LLM inference |
| 5120 | COGS — App-store & distribution fees |
| 5130 | COGS — Payment processing (Stripe etc.) |
| 5140 | COGS — Third-party data & content licences |
| 5150 | COGS — Product support labour |
| 5400 | COGS — Seven Fold facilitation & content delivery |

(`Stripe Fees` currently sits in opex; for product revenue it belongs in COGS — flag to the accountant.)

---

## 5. Operating expenses — functional blocks (Marketing fully subdivided)

Paul's explicit ask: **Marketing broken into as much detail as we need.** Carried on the account axis so it reads on the P&L and still slices by Division (Cat 1) and Campaign (Cat 2).

**6100 Marketing block**
| Code | Account |
|---|---|
| 6100 | Marketing — Brand, Identity & Creative |
| 6110 | Marketing — Content Production (case studies, white papers, video, copy) |
| 6120 | Marketing — Digital Advertising (paid search, paid social, display) |
| 6130 | Marketing — Website, SEO & SEM (hosting, dev, optimisation) |
| 6140 | Marketing — Events, Conferences & Sponsorships (Diggers & Dealers, PDAC, AEGC, IMARC) |
| 6150 | Marketing — Public Relations & Communications |
| 6160 | Marketing — MarTech & Tools (CRM, email, analytics subscriptions) |
| 6170 | Marketing — Market Intelligence & Research (data, lists) |
| 6180 | Marketing — Collateral & Print |
| 6190 | Marketing — Partnerships, Referral & Affiliate |

**6200 Sales:** Compensation & Commissions · Client Travel & Entertainment · Sales Enablement & Tools · Proposal & Bid Costs.
**6300 Product / R&D** (non-COGS): Engineering labour (if expensed) · Dev & test infrastructure · Dev tools & licences · Training-data acquisition · Prototyping & user research. *(R&D-capitalisation vs expense: accountant call — flagged §9.)*
**6400 Customer Success & Support** (non-COGS portion).
**6500 People & Culture:** salaries, superannuation, contractors, staff training, recruitment, amenities *(rationalise legacy `1880/1885/1927/1935`)*.
**6600 Technology & Infrastructure (internal):** IT hardware/software, subscriptions, AEOS/PAi run-costs *(internal, distinct from 5100 COGS)*.
**6700 Occupancy & Vehicles:** home office, rent, the `M/V commercial` set, plant hire.
**6800 General & Administrative:** professional fees, insurance, bank/filing fees, printing, postage, telephone, subscriptions, donations.
**6900 Finance & Depreciation:** interest, borrowing expenses, depreciation lines.
**8000 Other income/expense:** interest received, refunds, realised/unrealised FX, bank revaluations, loss on sale of shares.
**9000 Income tax.**

Existing legacy lines aren't deleted blindly — each is *mapped* to a new code in the migration workbook (§8), preserving history.

---

## 6. Division & sub-division taxonomy (Tracking Category 1 options)

Mapped to the four HarLin pillars; only revenue-bearing divisions get sub-division options, plus a Shared/Corporate bucket for allocation.

- **Consulting** → Strategic Advisory · AI-Enabled Geoscience · Technical Due Diligence · Governance & Board Advisory · Expert Network · Interim/Executive Roles
- **HarLin Labs** → NEXUS (GeoLedger, FieldCam/HarLin Field, GeoLexis, Vitrine, DriftGuard) · Geoscience AI (GFM, gAIa, Data-Portals) · *Internal Infra (AEOS, PAi — internal-cost, licensable later)*
- **MaSha Labs** → Consumer AI (GreenRoom) · Phone Games (PinPals) · Lightning Foundation (GeoScape, BeneathTheRocks, OpalLegends …)
- **Seven Fold Learning Labs** → Programs/Missions (Spark, Firekeeper) · Content & Licensing
- **Shared / Corporate** → Brand · Infrastructure · Administration *(cost centre; allocated to divisions on a documented basis)*

**Tracking Category 2 (`Stream / Product / Campaign`)** carries the finer live item — a specific product, a named engagement, or a campaign (e.g. `Decision_Evidence_Systems_202607`) — so Marketing and delivery spend ties back to the thing that caused it.

**Beyond two axes** (e.g. product × channel × cohort simultaneously) → the **AEOS analytics cube**: Bookkeeper pulls the Xero API into the estate store where dimensions are free. Xero stays the money ground truth; analytics richness lives downstream.

---

## 7. Numbering scheme (clean 4-digit, scale-ready)

| Range | Class |
|---|---|
| 1000–1999 | Assets |
| 2000–2999 | Liabilities *(incl. **2400 Deferred/Unearned Revenue** — new, for annual subscriptions)* |
| 3000–3999 | Equity *(incl. director loan / Div 7A tracking)* |
| 4000–4999 | Revenue |
| 5000–5999 | Cost of Sales |
| 6000–6999 | Operating Expenses (functional blocks §5) |
| 8000–8999 | Other income / expense |
| 9000–9999 | Income tax |

Retires the inconsistent legacy inline codes (`1550`, `1810`, `1880`…) in favour of one coherent scheme.

---

## 8. Balance-sheet additions for a subscriptions business

- **2400 Deferred/Unearned Revenue** — recognise annual/■term subscriptions over the service period (accrual correctness; without it, SaaS revenue is overstated at invoice).
- **1200 Accrued Revenue / Unbilled WIP** — consulting work performed but not yet invoiced.
- **Director loan / Div 7A** account in equity/liabilities, and **PSI** treatment retained (an account already exists) — accountant to confirm PSI vs personal-services-business tests as Labs revenue grows.

---

## 9. Open questions for the accountant / registered tax agent (human gate — HP-19)

Live Xero changes have tax and compliance consequences, so **nothing is implemented until a registered tax agent signs off.** Questions to resolve:

1. R&D — expense vs capitalise (and R&D Tax Incentive eligibility for Labs dev)?
2. PSI vs Personal Services Business as product revenue grows?
3. Deferred-revenue recognition policy and GST timing on annual subscriptions?
4. Stripe/app-store fees — COGS vs opex treatment?
5. Grant income tax treatment and quarantining?
6. Multi-entity trigger — at what revenue/risk does MaSha or Seven Fold warrant its own entity (HP-39), and does the Division tracking axis map cleanly to that future split? (Design intent: yes.)
7. GST/BAS coding and any FX/export-of-services zero-rating for international clients.

---

## 10. Inter-AI review plan (how to run the collaborative review)

Route this proposal through the estate's multi-actor review (Tag-Team / actor-comms ledger) with a distinct lens per reviewing platform, each returning written findings against a shared rubric:

| Lens | Reviewer focus | Key question |
|---|---|---|
| **AU tax & compliance** | account treatment, GST, PSI, Div 7A, R&DTI | "What's non-compliant or risky as written?" |
| **SaaS / unit economics** | recurring-revenue lines, COGS completeness, gross-margin visibility, MRR/ARR derivability | "Can we compute per-product gross margin and SaaS metrics from this?" |
| **Succession / multi-entity (HP-39)** | does Division axis pre-figure a clean entity split? | "Does this survive MaSha/Seven Fold becoming separate entities?" |
| **Xero mechanics** | 2-tracking-category limit, account-count sanity, migration feasibility | "Does this actually build in Xero without hitting a wall?" |
| **Commercial_Assessor** | ties to unit-economics / valuation-prep model | "Does this feed the appraisal model cleanly?" |

Consolidate findings, revise to a **design-freeze v1.0**, then proceed to §11 only on Paul's confirm.

---

## 11. Phased, gated implementation (when the time is right)

- **Phase A — Design freeze.** Incorporate inter-AI + accountant feedback → Schedule of Accounts v1.0. *(No Xero change.)*
- **Phase B — Xero build (accountant-supervised).** Create the two tracking categories and their options; add new revenue/COGS/opex/balance-sheet accounts; map every legacy account to a new code in a migration workbook; archive (never delete) superseded per-client income accounts after history is preserved. Run in a change window; back up first.
- **Phase C — Bookkeeper wiring.** Bookkeeper agent pulls Xero via API into the AEOS ground-truth store; divisional P&L + SaaS-metrics dashboards generated (HP-12, never hand-asserted); Quartermaster owns the weekly numbers.
- **Phase D — Analytics cube.** Dimensions beyond the two Xero axes materialised downstream (product × channel × cohort); feeds Commercial_Assessor unit-economics and the pipeline dashboard.

**Standing gates:** no live Xero change without registered-tax-agent sign-off; back up before any structural change; migration preserves all history; every derived number is generated from Xero, never typed by hand.

---

## 12. Register-cascade note (Standing Rule #12)

This document is a new artefact in `HarLin_Admin.prj`. Pending cascade items (flagged, not yet done from this session): `HarLin_Admin.prj/CHANGELOG.md` entry; `PROJECT_INDEX.md` reference; Connection Pad box; and — if this grows into a standing finance function — a decision on its permanent home (a Finance area vs remaining under Admin). No new `.prj` was created (Standing Rule #1).

---

*Prepared under the Work Loop (Standing Rule #28). Lodestone capture at §13.*

## 13. Lodestone capture (Work Loop stage 9 — Learning)

Signal for the preference learner (predict-vs-actual per task type):

- **Task type:** finance-architecture proposal (Chart/Schedule of Accounts design).
- **Observed Paul preferences:** divisional + product profitability visibility is the driver; wants activity-level granularity, **Marketing heavily subdivided**; explicitly wants **inter-AI review before implementation**; implementation must be **gated** ("when the time is right"); scope spans all revenue divisions (Consulting, HarLin Labs, MaSha Labs, Seven Fold) and future sub-divisions.
- **Prediction to check later:** the 2-tracking-category Xero limit will be the main design tension in review; the accountant sign-off (R&D capitalisation, PSI, deferred revenue) will drive the largest revisions.
- **Promotion:** capture only — human-gated per Lodestone MVP status; to be ingested by on-machine `lodestone.py` when this proposal is actioned.
