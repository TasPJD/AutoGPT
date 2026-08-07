# HarLin Commercial — Digital Team Master Plan

**Version:** 1.0 · **Date:** 2026-07-11 (confirmed 2026-07-12) · **Owner:** Paul Dale
**Status:** CONFIRMED by Paul 2026-07-12 (roster, ADR-001, Phase 0 activation set). Phase 0 build under way. Outbound remains human-gated always.
**Prepared by:** Claude (Fable 5 session, HarLin Commercial branch planning)

---

## 1. Why this exists

HarLin is deep in build mode — NEXUS (GeoLedger, FieldCam, GeoLexis), AEOS,
the consulting service streams. None of it returns a dollar unless it can be
marketed and sold when it's ready. This plan stands up a **full commercial
team — marketing, sales, intelligence, and customer success — staffed
entirely by AI agents**, structured like a real human team with distinct
roles, skills, and accountabilities, wired into the existing HarLin harness
(AEOS brain, Pulse, Alfred, MCP Gateway) rather than bolted on beside it.

Design requirements, in Paul's words: robust, reliable, **empathetic**,
consistently learning and improving, scalable, and future-proofed — sized
for the scale of the project pipeline and the scope of the markets available.

---

## 2. Where things live (architecture hygiene)

Per the settled agent doctrine (AEOS.prj/AGENT_ARCHITECTURE.md, 2026-06-13):
each named agent is its own `.prj`; placement is by hygiene. The deciding
split here is **the team vs. its work product**:

- **The agents (the team) are internal infrastructure.** They are not
  customer-facing artefacts; they are machinery. They live under a new
  category sub-header, following the `Connectors\` precedent:

  ```
  C:\AI\HarLin_Labs\Internal Infrastructure\Commercial\
      AGENTS.md            (category descriptor + team roster)
      Foreman.prj\         Commercial Director / orchestrator
      Quartermaster.prj\   RevOps & CRM steward
      Cartographer.prj\    Market intelligence & segmentation
      Prospector.prj\      Lead generation & list building
      Assayer.prj\         Lead qualification & scoring
      Herald.prj\          Brand & communications
      Scribe.prj\          Content production
      Envoy.prj\           Outreach & sales development
      Shepherd.prj\        Customer success & renewals
      Advocate.prj\        Voice-of-customer & empathy loop
      CRM.prj\             The CRM itself (infrastructure, not a team member)
  ```

- **The commercial work product is business content.** Strategy, brand,
  campaigns, playbooks, collateral, market maps — everything a human CMO's
  shared drive would hold — lives in its own directory under the commercial
  pillar:

  ```
  C:\AI\HarLin_Commercial\Marketing_Sales.prj\
      AGENTS.md                    (project descriptor)
      COMMERCIAL_TEAM_PLAN.md      (this document)
      ADR-001_CRM_Decision.md      (CRM architecture decision record)
      BRAND_VOICE.md               (voice, tone, empathy standards — seed)
      PROGRESS.md / TODO.md
      Playbooks\                   (sales & marketing playbooks, as built)
      Campaigns\                   (one dir per campaign, as run)
      Collateral\                  (decks, one-pagers, case studies, as made)
  ```

This respects the existing estate: `Market Intelligence\`, `Markets\`,
`Markets Trading\`, `Lightning Foundation\`, `Millionaire.prj\` stay
untouched as siblings. Cartographer *feeds* Market Intelligence; it does not
replace it.

---

## 3. The team

Ten roles — the same shape as a competent human go-to-market team, named in
the estate's house style with exploration metaphors that are also
native to the mining market HarLin sells into. Each has its own `.prj`
charter under `Internal Infrastructure\Commercial\`.

| Agent | Human-team equivalent | One-line mandate |
|---|---|---|
| **Foreman** | Commercial Director | Owns the commercial pipeline end-to-end; routes work to specialists; runs the weekly commercial standup; reports to Paul via Alfred/Pulse. |
| **Quartermaster** | Revenue Operations Manager | Owns the CRM: schema, data hygiene, dashboards, forecasting, KPI reporting. The team's single source of numbers. |
| **Cartographer** | Market Intelligence Analyst | Maps the territory: TAM/SAM/SOM per market stream, segment definitions, ideal-customer profiles, competitor movements (extends CompetitorRadar). |
| **Prospector** | Lead Generation Specialist | Finds the targets: ASX/TSX explorers and mid-tiers, service companies, conference delegate lists (Diggers & Dealers, PDAC, AEGC, IMARC), tenders, news triggers. |
| **Assayer** | Sales Development (qualification) | Grades the ore: scores every lead against the ICP, enriches records, routes qualified leads to Envoy with a why-now brief. |
| **Herald** | Brand & Communications Manager | Guards the brand voice (HarLin Identity Library); owns PR, LinkedIn presence, launch announcements, conference presence planning. |
| **Scribe** | Content Marketer / Writer | Produces the material: case studies, white papers, demo scripts, website copy, decks (HL_Preso_Images, HL_Logos), nurture emails. |
| **Envoy** | Account Executive / SDR | Carries the message out: outreach sequences, follow-ups, meeting prep briefs, proposals, quotes. **Every external send is human-gated.** |
| **Shepherd** | Customer Success Manager | Keeps clients thriving post-sale: onboarding, adoption checkins, health scores, renewal runway, support triage into NexusBoard. |
| **Advocate** | Voice-of-Customer / Research | The empathy organ: synthesises feedback, interviews, NPS, complaints; feeds NexusBoard `user_feedback`; audits all team output for tone and respect. |

**Reporting lines:** Foreman orchestrates all nine specialists. Foreman
reports upward through the existing harness — session summaries to Pulse,
morning-briefing items via the PAi/Alfred channel, decisions surfaced as
AWAITING CONFIRM entries for Paul. Paul is, and remains, the only closer:
agents create and advance opportunities; a human signs.

**Why one agent per role rather than one mega-agent:** the same reason human
teams specialise — bounded context, auditable handoffs, independent
improvement loops, and graceful degradation (a broken Prospector doesn't
take down customer success). Each `.prj` carries its own LEARNINGS.md, so
PatternEngine can mine improvement per discipline.

**Runtime note:** charters are runtime-agnostic markdown + MCP tool access.
Day one they run as Claude Code sessions / scheduled Routines against the
MCP Gateway. If a dedicated agent runtime is adopted later (e.g. a Forge /
AutoGPT-style loop), the charters port unchanged. That is deliberate
future-proofing: **the org design outlives any particular agent framework.**

---

## 4. The CRM decision (summary — full ADR in ADR-001)

**Question:** free hosted CRM, GitHub-as-CRM, or build on AEOS' DB?

**Decision: build on AEOS — extend ClientLedger into a full CRM.**

- AEOS already has the bones: `clients` and `billing` tables in
  `aeos_events.db`, PERSON/COMPANY node types in ContextGraph, and an MCP
  Gateway every agent (and every AI platform Paul uses) can reach. The CRM
  becomes new tables + new gateway tools, not a new system.
- GitHub has no CRM product; abusing Issues/Projects as one fails on
  relational contact data, consent tracking, and reporting. Rejected.
- Free SaaS CRMs (HubSpot Free, Zoho) are rejected **as system of record**:
  data silo outside the estate, vendor lock-in, per-seat costs the moment it
  works, API rate limits against agent traffic, and they fail both settled
  doctrines — not commercial-grade-ownable (HP-40) and not cleanly
  inheritable by the family (HP-39). A SaaS tool may later be used as a
  *disposable peripheral* (e.g. email delivery) via a sync adapter, never as
  the record.
- Interoperability is designed in: a versioned schema contract, standard
  SQL, CSV/JSON/vCard export, and MCP tools as the sole write path. Anything
  can be plugged in later; nothing is locked in now.
- Doctrine bonus: a local-first, AI-native, MCP-served CRM is itself a
  saleable product candidate for the NEXUS stable — commercial-grade by
  default, twice over.

Owner: **Quartermaster** (steward) with **CRM.prj** holding schema and docs;
physical DB and code live with AEOS (`code_location` recorded in the
charter, consistent with the shared-runtime pattern).

---

## 5. Interoperability

One rule: **agents talk to systems through the MCP Gateway; agents talk to
each other through the CRM and the pipeline file — never through private
side-channels.** That keeps every handoff auditable and every tool
swappable.

- **AEOS ContextGraph** — CRM companies/contacts mirror to COMPANY/PERSON
  nodes; relationship intelligence compounds with everything else Paul knows.
- **Pulse / Session Ledger** — every agent session logs; commercial work
  shows up in the same morning briefing as everything else.
- **Alfred** — front-of-house: "Alfred, where's the pipeline at?" answers
  from CRM data via gateway tools.
- **NexusBoard** — Advocate writes `user_feedback`; Cartographer writes
  `competitive_intel`; product and commercial share one truth about the
  market.
- **PIPELINE.md / plays** — commercial plays are armed in the existing
  Harness Review pipeline, not a parallel one.
- **Xero** (already connected) — Quartermaster reconciles won-deal values
  against actual invoicing; forecast honesty is enforced by accounting data.
- **Exports** — quarterly automated CSV/JSON snapshots of the full CRM to
  `HL_Data`, so the record survives any component failure.

---

## 6. Learning & improvement loop (non-negotiable design)

1. **Per-agent LEARNINGS.md** — every session appends what worked, what
   didn't, with evidence. House pattern, already mined by PatternEngine.
2. **Closed-loop outcomes** — every outreach, piece of content, and campaign
   gets an outcome recorded in the CRM (reply/no-reply, meeting/no-meeting,
   won/lost + reason). No orphan activity. Lost-reason taxonomy feeds
   product (NexusBoard) and positioning (Herald).
3. **Weekly commercial standup (Foreman)** — automated: pipeline delta, KPI
   movement, stuck deals, learning candidates. Lands in the morning brief.
4. **Quarterly retro play** — armed in PIPELINE.md: what the market taught
   us, charter amendments proposed as AWAITING CONFIRM.
5. **Metabolism** — CRM records carry `last_touched`; stale segments decay
   in priority exactly like ContextGraph nodes. The team forgets gracefully
   instead of drowning.

## 7. Empathy standards (what "empathetic" means operationally)

- **Consent-first:** no cold electronic outreach without a lawful basis;
  Spam Act 2003 (identify sender, working unsubscribe, consent), Privacy Act
  1988 APPs for all personal data; GDPR posture before any EU campaign.
- **Human-gated sends:** Envoy and Herald draft; Paul approves. Nothing
  external leaves the estate on agent authority alone. (AWAITING CONFIRM is
  the mechanism — same gate the estate already runs on.)
- **Tone contract:** BRAND_VOICE.md defines it — peer-to-peer geologist
  voice, no growth-hacker cadence, no false urgency, no dark patterns.
  Advocate audits samples monthly.
- **Respect for the person:** every contact record carries communication
  preferences and a do-not-contact flag that every agent must honour; two
  unanswered sequences → automatic 6-month rest, no exceptions.
- **Losses handled gracefully:** a "no" gets a courteous close and a clean
  record, because this market is small and reputations are long.

## 8. Market scope & scaling model

The CRM and all charters carry a `stream` dimension from day one, so new
markets are configuration, not re-architecture:

| Stream | Offering | Market | Phase |
|---|---|---|---|
| `nexus` | GeoLedger, FieldCam, GeoLexis subscriptions | Global geoscience software (displacing AQuire, DataShed, Leapfrog, ioGAS) | 1 |
| `consulting` | Technical Due Diligence, Governance & Board Advisory, exploration targeting | AU/international miners, explorers, funds | 1 (revenue today) |
| `labs` | VetOS, IMaiS, future Labs products | Vertical AI markets | 2+ |
| `masha` | Consumer AI | Consumer | 3+ |

Scaling levers, in order: more sessions per agent (cadence), more streams
per agent (config), then — only if a stream's volume demands it — splitting
an agent (e.g. Envoy-Nexus vs Envoy-Consulting). The org chart is designed
to split along stream lines without renaming anything.

## 9. "Should we just acquire free infrastructure and guidelines?"

**Adopt commodity, own the record.** Free/open things worth taking:
playbook and messaging frameworks (HubSpot Academy, open GTM templates) as
*inputs* Scribe and Herald adapt to HarLin's voice; open brand-guideline
skeletons; GitHub (already free) for agent code and CI. Things never
outsourced: contact data, pipeline state, consent records, learnings — the
compounding assets. Rented tools churn; the record is the business.

## 10. Phasing & KPIs

- **Phase 0 — Foundations (now → product-ready):** CRM v1 schema live;
  market map v1; BRAND_VOICE v1; 3 seed case studies from current
  engagements (Barton Gold etc.). Active: Quartermaster, Cartographer,
  Herald, Scribe. KPI: CRM populated with ≥200 mapped companies, ≥3
  publishable assets.
- **Phase 1 — Pipeline warm-up (product beta):** target lists graded;
  nurture content flowing; consulting stream fully tracked in CRM.
  Active: + Prospector, Assayer, Foreman. KPI: ≥50 A-grade accounts, weekly
  standup running.
- **Phase 2 — Launch (NEXUS GA):** launch comms, outbound sequences (gated),
  proposals. Active: + Envoy. KPI: meetings booked, proposals out,
  first subscription revenue.
- **Phase 3 — Scale:** renewals engine, referral loop, second stream
  onboarded. Active: + Shepherd, Advocate at full cadence. KPI: net revenue
  retention, CAC-equivalent (agent-hours per won deal).

**Cost posture:** zero new infrastructure spend — runs on existing AEOS,
MCP Gateway, and AI subscriptions already in place.

## 11. Governance & doctrine compliance

- **HP-40 Commercial-Grade by Default:** the CRM is a real relational
  system with a versioned schema, not a disposable shell; every artefact
  (playbooks, brand system, the CRM itself) is built to be productisable.
- **HP-39 Family Access & Succession:** everything is plain files + SQL
  inside the estate; no subscription dies with a credit card; the
  commercial engine is inheritable as-is.
- **Human gates:** outbound comms, spend, pricing, and contract terms are
  Paul-only decisions, surfaced through the standing AWAITING CONFIRM
  mechanism.
- **This plan itself** is AWAITING CONFIRM: the structure is scaffolded and
  catalogued as concept-status; no agent is activated until Paul confirms
  the roster and the CRM ADR.

## 12. Immediate next steps (on Paul's confirm)

1. Confirm/rename the roster (names are proposals; roles are the substance).
2. Approve ADR-001 → Quartermaster + AEOS session builds CRM v1 tables and
   gateway tools (crm_upsert_company, crm_upsert_contact,
   crm_log_interaction, crm_opportunity, crm_pipeline_report).
3. Run crawler.py so the new `.prj` boxes register in the Catalog/Connection
   Pad.
4. Cartographer session #1: NEXUS market map v1 (merge existing Market
   Intelligence material).
5. Herald + Scribe session #1: BRAND_VOICE v1 from the HarLin Identity
   Library; first case-study drafts from active engagements.
