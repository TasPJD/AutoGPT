---
name: CRM.prj
slug: crm-prj
pillar: labs
parent: Commercial (agent team)
level: 4
status: active
maturity: concept
canonical_path: C:\AI\HarLin_Labs\Internal Infrastructure\Commercial\CRM.prj
relocation_status: in_place
cp_box_id: pending_crawler
ai_context_doc_version: 1.0
last_reviewed: 2026-07-11
owner: Paul Dale
code_location: AEOS.prj runtime + AEOS data store (planned; not yet built)
activation_phase: 0
---

# CRM — the client record system (infrastructure, not a team member)

> Working name. Naming candidates if Paul wants house style: Ledgerstone,
> Claim (as in mining claim), Muster. The role matters, not the name.

## Purpose
The single system of record for companies, people, consent, interactions,
opportunities, campaigns, and outcomes across all market streams. An
extension of AEOS ClientLedger — NOT a new platform. Decision record:
`HarLin_Commercial\Marketing_Sales.prj\ADR-001_CRM_Decision.md`
(AWAITING CONFIRM).

## Shape (per ADR-001)
- Tables `crm_*` beside `clients`/`billing` in the AEOS store
  (companies, contacts, interactions, opportunities, campaigns, touches)
- MCP Gateway tools as the SOLE write path (`crm_upsert_company`,
  `crm_upsert_contact`, `crm_log_interaction`, `crm_upsert_opportunity`,
  `crm_pipeline_report`, `crm_next_actions`, `crm_export`)
- Consent enforced at the tool layer: outbound against
  `do_not_contact=1` is refused, hard
- Mirror to ContextGraph COMPANY/PERSON nodes (relationship intelligence
  compounds estate-wide)
- Versioned schema contract, additive migrations only
- Quarterly CSV/JSON export to HL_Data (succession copy, HP-39)

## Interoperability posture
MCP-native (all agents, all AI platforms), REST via existing FastAPI
wrapper, plain SQL underneath. External SaaS (email delivery, enrichment)
only ever as adapters against the schema contract — swappable
peripherals, never the record.

## Steward
Quartermaster.prj (operations); build sessions run under AEOS.prj with
this project as the spec.

## Status
Concept. Build starts on Paul's confirm of ADR-001.

## Product angle (HP-40)
A local-first, AI-native, MCP-served CRM is a credible NEXUS-adjacent
product candidate. Build it commercial-grade; keep a clean seam between
HarLin's data and the engine.
