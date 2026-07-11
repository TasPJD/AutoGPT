# ADR-001 — CRM: Build on AEOS, not rent, not GitHub

**Date:** 2026-07-11 · **Status:** PROPOSED (AWAITING CONFIRM — Paul)
**Deciders:** Paul Dale (final) · Prepared by Claude commercial-planning session

## Context

The HarLin Commercial digital team needs a CRM: the single system of record
for companies, people, consent, interactions, opportunities, and outcomes
across all market streams (nexus, consulting, labs, masha). The question
raised: *"do we get a free one off GitHub, or do we create one, possibly
using AEOS' DB for the client contact and info store? Consider
interoperability."*

Constraints that bind the decision:

- **HP-40 Commercial-Grade by Default** — favour robust, secure,
  future-proof, ownable options; artefacts should be productisable.
- **HP-39 Family Access & Succession** — the record must be inheritable:
  no per-seat subscriptions, no vendor-hostage data.
- **Agent-first workload** — the primary "users" are AI agents making
  frequent programmatic reads/writes via MCP; humans read dashboards.
- **Existing assets** — AEOS already runs `aeos_events.db` with
  `clients`/`billing` tables (ClientLedger), ContextGraph with
  PERSON/COMPANY node types and edges, and an MCP Gateway exposing tools to
  every AI platform Paul uses, plus a REST wrapper and Cloudflare tunnel.

## Options considered

### A. "Free CRM off GitHub"
GitHub does not offer a CRM product. The nearest interpretations:
1. *Abuse Issues/Projects as a CRM* — no relational contact model, no
   consent/preference tracking, no pipeline math, API rate limits vs agent
   traffic, contact PII in a code platform. **Rejected.**
2. *Self-host an open-source CRM from GitHub* (SuiteCRM, Twenty, EspoCRM…)
   — real CRMs, but each is a full web app + its own database to run,
   patch, and secure; agents would integrate via each product's REST API
   instead of the estate's native MCP; the contact store would sit outside
   ContextGraph, so relationship intelligence would not compound. Viable
   fallback, not preferred. **Rejected for now** (revisit only if a human
   sales hire someday needs a heavy UI).

### B. Free-tier SaaS CRM (HubSpot Free, Zoho, Pipedrive trial…)
Fast to start, polished UI, free email tooling. But: system of record
leaves the estate; free tiers are acquisition funnels with per-seat cliffs;
API rate limits throttle agent workloads; export is lossy (notes,
automations); fails HP-39 (subscription-coupled) and HP-40 (not ownable,
not productisable). **Rejected as system of record.** Permitted later as a
*disposable peripheral* (e.g. bulk email delivery) behind a sync adapter,
where losing it loses nothing.

### C. Build on AEOS — extend ClientLedger into the CRM ✅
New tables beside the existing `clients`/`billing` in the AEOS store, new
MCP Gateway tools as the sole write path, mirror into ContextGraph nodes.

- **Leverage:** ~70% of the substrate exists (DB, gateway, tunnel, graph,
  briefing integration). The build is schema + tools + dashboards, not a
  platform.
- **Interoperability:** MCP-native for every agent and AI platform; REST
  via the existing FastAPI wrapper for anything else; standard SQL
  underneath; scheduled CSV/JSON/vCard exports to HL_Data. A versioned
  schema contract (`crm_schema_v1`) makes future adapters (SaaS email,
  accounting, a future web UI) plug-ins rather than migrations.
- **Doctrine:** fully ownable, file+SQL inheritable (HP-39); itself a
  candidate NEXUS-adjacent product — an AI-native, local-first, MCP-served
  CRM (HP-40).
- **Risk & mitigation:** no polished human UI at first → dashboards via
  the existing standalone-HTML dashboard pattern + Alfred queries; single
  operator DB discipline → additive-only migrations, quarterly exports,
  Quartermaster owns hygiene.

## Decision

**Option C.** The CRM is an AEOS-hosted, MCP-served extension of
ClientLedger, stewarded by Quartermaster, documented in
`Internal Infrastructure\Commercial\CRM.prj`.

## Schema v1 (contract sketch — additive migrations only)

```sql
-- Companies: the account universe (all streams)
CREATE TABLE crm_companies (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, stream TEXT NOT NULL,
  segment TEXT, exchange_ticker TEXT, region TEXT, website TEXT,
  icp_grade TEXT,            -- A/B/C/D per Assayer scoring
  status TEXT,               -- prospect/engaged/client/dormant/do_not_contact
  owner_agent TEXT, notes TEXT,
  created_at TEXT, last_touched TEXT
);
-- People: contacts, with consent as a first-class column set
CREATE TABLE crm_contacts (
  id TEXT PRIMARY KEY, company_id TEXT REFERENCES crm_companies(id),
  name TEXT NOT NULL, role TEXT, email TEXT, phone TEXT, linkedin TEXT,
  consent_basis TEXT,        -- inferred_b2b/express/existing_relationship/none
  consent_date TEXT, do_not_contact INTEGER DEFAULT 0,
  comm_preferences TEXT, created_at TEXT, last_touched TEXT
);
-- Every touch, inbound or outbound, by human or agent
CREATE TABLE crm_interactions (
  id TEXT PRIMARY KEY, contact_id TEXT, company_id TEXT,
  direction TEXT, channel TEXT, agent TEXT, human_approved INTEGER,
  summary TEXT, outcome TEXT, occurred_at TEXT
);
-- Deals/opportunities across streams
CREATE TABLE crm_opportunities (
  id TEXT PRIMARY KEY, company_id TEXT, stream TEXT, name TEXT,
  stage TEXT,   -- identified/qualified/meeting/proposal/negotiation/won/lost/parked
  value_aud REAL, probability REAL, next_action TEXT, next_action_due TEXT,
  lost_reason TEXT, opened_at TEXT, closed_at TEXT
);
-- Campaign & content attribution
CREATE TABLE crm_campaigns (
  id TEXT PRIMARY KEY, name TEXT, stream TEXT, type TEXT, status TEXT,
  started_at TEXT, ended_at TEXT, learnings TEXT
);
CREATE TABLE crm_campaign_touches (
  campaign_id TEXT, interaction_id TEXT, PRIMARY KEY (campaign_id, interaction_id)
);
```

Existing `clients`/`billing` tables remain; won opportunities promote a
company to `client` and link to ClientLedger for invoicing (reconciled
against Xero by Quartermaster).

## Gateway tools v1

`crm_upsert_company`, `crm_upsert_contact`, `crm_log_interaction`,
`crm_upsert_opportunity`, `crm_pipeline_report(stream?)`,
`crm_next_actions(agent?)`, `crm_export(format)`.
Writes validate consent rules at the tool layer (e.g. an outbound
interaction against `do_not_contact=1` is refused, hard).

## Consequences

- Quartermaster becomes a real role immediately (schema, hygiene, exports).
- ContextGraph mirror job: crm_companies/contacts ↔ COMPANY/PERSON nodes.
- Every future tool choice (email delivery, enrichment, a web UI) is an
  adapter against the schema contract — swap-in, swap-out, never a rebuild.
