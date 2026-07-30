# Commercial Infrastructure Roadmap — what we still need, prioritised

**Status:** 🟠 PROPOSAL — for Paul's steer; design-only, nothing outbound activated
**Prepared by:** HarLin Commercial engine (Foreman/Quartermaster duty), CCR session
**Date:** 2026-07-30 · **Owner:** Paul Dale
**Grounded in (not reconstructed):** `GAP_ANALYSIS.md` (2026-07-12), `COMMERCIAL_TEAM_PLAN.md` phasing, `HarLin_Admin.prj/SCHEDULE_OF_ACCOUNTS_PROPOSAL_2026-07.md`, the agent roster.
**Governing doctrine:** HP-12 ground truth · HP-19 human gates · HP-39 succession · HP-40 commercial-grade · reputation hold (Paul, 2026-07-14; post-R5).

> **Work Loop (Standing Rule #28) — Whetstone distillation**
> - **Purpose:** know the critical path to a fully operational commercial engine so HarLin can capture and convert revenue the moment it's required — no scramble.
> - **Intent:** prioritise the commercial infrastructure still to design/build as a dependency-aware, gated roadmap. Design only; nothing outbound.
> - **First-Tier Outcome:** capability-layer map (current state) + prioritised waves, with inbound treated as the reputation-safe channel that can earn during the hold.

---

## The organising insight

Two facts shape the whole priority order:

1. **Inbound is reputation-safe; outbound is on hold.** People coming *to* HarLin (website enquiry, referral, warm intro) trips no reputation gate. So the inbound capture-and-close path can be made operational **now** and earn during the hold, while the outbound rails are built in parallel, ready to switch on at R5.
2. **What's built is the record; what's missing is the plumbing around it.** The CRM data/governance layer is at peer parity (GAP_ANALYSIS §A–D). Almost everything remaining is *integration and channel* infrastructure — the pipes that let the engine take work in, move money, and keep customers.

---

## The commercial operating stack (current state)

| # | Capability layer | State | Evidence / gap |
|---|---|---|---|
| L1 | **System of Record (CRM)** | 🟢 built, not wired | CRM v2 live + tested; **gateway registration pending** (GAP E1, on-machine) |
| L2 | **Money & metrics** | 🟠 partial | Schedule of Accounts *proposed*; **Bookkeeper agent = charter only**; Xero recon unbuilt (E4) |
| L3 | **Demand — inbound** | 🔴 missing | no website→CRM lead capture; no form/tracking pipeline |
| L4 | **Demand — outbound** | 🔴 missing (gated) | no unsubscribe/preference infra (E5 HARD GATE); no send channel; sequence engine = Phase 2 |
| L5 | **Market intelligence** | 🟠 partial | ICP rubric v0 built; **market map v1 + target sourcing unbuilt** (Cartographer/Prospector) |
| L6 | **Content & brand** | 🟠 seed only | BRAND_VOICE seed; **no v1, no case studies, no collateral templates** (C4) |
| L7 | **Sales execution (quote-to-cash, front)** | 🟠 partial | proposal/scope pattern exists (DES campaign); **no quote/CPQ, contract, e-sign** |
| L8 | **Billing & payments** | 🔴 missing | Xero invoicing manual; **no Stripe wiring, no subscription billing**; Stripe MCP needs auth |
| L9 | **Customer success & support** | 🔴 not started | Steward/Shepherd charters only; no support runbook/SLA/renewals engine |
| L10 | **Orchestration & reporting** | 🟠 partial | dashboard built; **KPI→PAi feed (B3), attribution (C5), forecast categories (A9), Foreman standup automation** unbuilt |
| L11 | **Resilience & identity** | 🟠 partial | scheduled backup/export (E2), ContextGraph mirror (E3), per-agent auth (E7) unbuilt |

---

## Prioritised waves

Priority = critical-path dependency first, then legal prerequisites, then value. Each item notes **owner**, **on-machine?** (can't be done over the tunnel), and **gate**.

### Wave 0 — Finish the foundations (unblock the engine; no reputation dependency)

| P | Item | Why it's first | Owner | On-machine? |
|---|---|---|---|---|
| 0.1 | **Wire `crm_tools.register()` into the MCP Gateway** (E1) | Nothing routes through the sanctioned CRM path until this lands; it gates L1→everything | Paul/AEOS | **Yes** |
| 0.2 | **Scheduled weekly CRM export + snapshot** (E2) | Continuity/DR (risk R1); protects the compounding asset; cheap | Quartermaster | **Yes** |
| 0.3 | **Bookkeeper agent + Schedule of Accounts (design-freeze)** | The money-truth layer (HP-12); prerequisite for divisional P&L, forecasting, unit economics | Bookkeeper/Quartermaster | design off-machine; Xero build on-machine + accountant gate |

### Wave 1 — Reputation-safe revenue rails (can operate NOW, during the hold)

| P | Item | Why | Owner | Gate |
|---|---|---|---|---|
| 1.1 | **Website → CRM lead capture** (form + tracking + routing into CRM) | Inbound is reputation-safe; this is the first channel that can earn during the hold | Herald/Quartermaster | inbound only; consent captured at form |
| 1.2 | **BRAND_VOICE v1 + 2–3 client-approved case studies + one-page collateral** | Credibility assets both inbound and (later) outbound depend on; buildable during hold | Herald/Scribe | client consent before any case-study use |
| 1.3 | **Quote-to-cash front half: proposal/scope builder → contract templates → e-signature** | Needed to actually *close* a warm/inbound deal; proposal pattern already exists to build on | Foreman/Legal | human sign on every quote/price (HP-19) |
| 1.4 | **Market map v1 + ICP rubric v1** (fold in Market Intelligence corpus) | Research is reputation-safe; sharpens inbound targeting and pre-loads outbound | Cartographer/Assayer | research only |

### Wave 2 — Outbound readiness (build during hold, activate at R5)

| P | Item | Why | Owner | Gate |
|---|---|---|---|---|
| 2.1 | **Unsubscribe / preference / consent infrastructure** (E5) | **HARD LEGAL GATE** — must exist before *any* outbound email (Spam Act); perfect to build during the hold | Envoy/Herald | blocks all outbound until done |
| 2.2 | **Outbound send channel** (email delivery adapter, human-gated send) | The actual mechanism to send; pairs with 2.1 | Envoy | every send AWAITING CONFIRM |
| 2.3 | **Sequence/cadence engine + Prospector sourcing** | Turns target lists into governed, rest-limited cadences | Envoy/Prospector | R5 release + per-send gate |

### Wave 3 — Money-in & scale

| P | Item | Why | Owner |
|---|---|---|---|
| 3.1 | **Billing & payments: Stripe wiring + Xero invoicing automation + subscription billing/dunning** | Converts closed deals to cash; required once products bill recurring revenue (needs Stripe MCP auth) | Quartermaster/Bookkeeper |
| 3.2 | **KPI feed → PAi morning brief (B3); forecast categories (A9); attribution (C5)** | Turns the record into steering signal; matures with real deals | Quartermaster |
| 3.3 | **Foreman standup automation + ContextGraph mirror (E3)** | Weekly pipeline delta automated; relationship intelligence compounds | Foreman/AEOS |

### Wave 4 — Retain & harden

| P | Item | Why | Owner |
|---|---|---|---|
| 4.1 | **Customer success + support: onboarding, health scores, SLA runbook, renewals engine** | Needed once products/services have live customers (Phase 3) | Shepherd/Steward |
| 4.2 | **Per-agent authenticated identity** (E7) | When agents run unattended rather than Paul-initiated | Gateway |

---

## Critical path (the shortest line to "operational")

**0.1 gateway wiring → 1.1 inbound capture → 1.3 quote-to-cash front → 3.1 billing.** That single chain makes HarLin able to *take an inbound enquiry, record it, close it, and get paid* — all within reputation-safe bounds. Everything else widens the funnel (outbound, Wave 2) or hardens/scales it (Waves 3–4). The two on-machine blockers (0.1, 0.2) are the only hard dependencies that can't be advanced over the tunnel.

## Standing constraints (unchanged)

- External/market activation on **REPUTATION HOLD** (post-R5); nothing outbound built here is *switched on* without Paul's release.
- Every outbound send, price and spend stays **AWAITING CONFIRM** (HP-19).
- On-machine-only items (gateway, scheduler, ContextGraph, live Xero, subscription billing) are **not** attempted over the tunnel.
- Live Xero structural change requires **registered-tax-agent sign-off** (per the Schedule of Accounts proposal).

## Register-cascade note (Standing Rule #12)

New artefact in `Marketing_Sales.prj`. Pending cascade (flagged): `CHANGELOG.md` + `PROGRESS.md` entries, `PROJECT_INDEX.md` reference. No new `.prj` created (Standing Rule #1).
