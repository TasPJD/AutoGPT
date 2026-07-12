---
name: Commercial (agent team)
slug: infra-commercial
pillar: labs
parent: Internal Infrastructure
level: 3
status: active
maturity: active
canonical_path: C:\AI\HarLin_Labs\Internal Infrastructure\Commercial
relocation_status: in_place
cp_box_id: pending_crawler
ai_context_doc_version: 1.1
last_reviewed: 2026-07-12
owner: Paul Dale
---

# Commercial — the digital marketing & sales team

> Category dir under Internal Infrastructure (same pattern as
> `Connectors\`, est. 2026-07-11). Houses the AI-agent commercial team.
> **The machinery lives here; the work product lives in
> `C:\AI\HarLin_Commercial\Marketing_Sales.prj\`.** Master plan:
> `Marketing_Sales.prj\COMMERCIAL_TEAM_PLAN.md`.

## Purpose
A full go-to-market team staffed by AI agents — one `.prj` per role per
the agent doctrine (AEOS.prj\AGENT_ARCHITECTURE.md). Internal
infrastructure because agents are machinery, not customer-facing artefacts.

## Roster

| .prj | Role | Phase |
|---|---|---|
| Foreman.prj | Commercial Director / orchestrator | 1 |
| Quartermaster.prj | RevOps & CRM steward | 0 |
| Cartographer.prj | Market intelligence & segmentation | 0 |
| Prospector.prj | Lead generation & list building | 1 |
| Assayer.prj | Lead qualification & scoring | 1 |
| Herald.prj | Brand & communications | 0 |
| Scribe.prj | Content production | 0 |
| Envoy.prj | Outreach & sales development | 2 |
| Shepherd.prj | Customer success & renewals | 3 |
| Advocate.prj | Voice-of-customer & empathy loop | 3 |
| CRM.prj | The CRM system itself (infrastructure, not a team member) | 0 |

## Standing rules (bind every agent in this dir)
1. All external sends/spends are human-gated (AWAITING CONFIRM → Paul).
2. The CRM is the only inter-agent memory for commercial state; no
   side-channel files between agents.
3. Every session logs to Pulse/Session Ledger and appends LEARNINGS.md.
4. BRAND_VOICE.md empathy standards (Marketing_Sales.prj) are mandatory,
   including absolute `do_not_contact` and consent rules.
5. Charters are runtime-agnostic: runnable as Claude Code sessions or
   scheduled Routines today, portable to a dedicated agent runtime later.
6. Every session follows `SESSION_PROTOCOL.md` (this dir): open from the
   charter + queue, record as you work, close with next-actions + LEARNINGS.

## Current Status
CONFIRMED by Paul 2026-07-12 (roster, ADR-001, Phase 0 activation set).
Phase 0 agents active: Quartermaster, Cartographer, Herald, Scribe.
CRM v1 kit built and sandbox-tested (CRM.prj — pre-prod; live migration
pending an on-machine AEOS session). Run crawler.py to register CP boxes.
