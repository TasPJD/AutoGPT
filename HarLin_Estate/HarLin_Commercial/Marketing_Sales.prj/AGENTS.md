---
name: Marketing_Sales.prj
slug: marketing-sales-prj
pillar: operations
parent: HarLin Commercial
level: 2
status: active
maturity: concept
canonical_path: C:\AI\HarLin_Commercial\Marketing_Sales.prj
relocation_status: in_place
cp_box_id: pending_crawler
ai_context_doc_version: 1.0
last_reviewed: 2026-07-11
owner: Paul Dale
---

# Marketing_Sales.prj

> **Connection Pad is the canonical source of truth for this project's
> position in the HarLin OS hierarchy.** New project — run crawler.py to
> register the CP box.

## Purpose
The commercial engine's work-product home: go-to-market strategy, brand
voice, playbooks, campaigns, and collateral for all HarLin market streams
(nexus, consulting, labs, masha). This is what a human CMO's shared drive
would hold. The AI agents that *do* this work live under
`Internal Infrastructure\Commercial\` — machinery there, output here.

## Vision
When the tech is ready, the market already knows us, the pipeline is
already graded, and selling is execution — not a scramble.

## Scope & Non-Goals
- In scope: GTM strategy, brand & comms, content, campaign records,
  playbooks, market-facing collateral, this plan and its ADRs.
- Out of scope: agent charters and code (Internal Infrastructure\Commercial),
  CRM data (AEOS store), market research corpus (sibling
  `Market Intelligence\`), trading (sibling `Markets Trading\`), grant
  work (sibling `Grant Applications\`).

## Current Status
Scaffolded 2026-07-11 with the master plan and CRM ADR. AWAITING CONFIRM:
roster names, ADR-001, activation order. Nothing outbound has occurred.

## Dependencies & Relationships
- Depends on: AEOS (CRM store, ContextGraph, gateway), HarLin Identity
  Library (brand), NexusBoard (product truth), Pipeline plays.
- Used by: all ten commercial agents; Alfred (pipeline queries); PAi
  morning brief.
- Sibling/peer: Market Intelligence, Markets, Markets Trading, Lightning
  Foundation, Millionaire.prj under HarLin Commercial.

## Key Files & Entry Points
- `COMMERCIAL_TEAM_PLAN.md` — the master plan (start here)
- `OPERATIONS_MANUAL.md` — how to run/inherit the engine (HP-39)
- `ADR-001_CRM_Decision.md` — CRM decision record (ACCEPTED)
- `GAP_ANALYSIS.md` — vs peer-grade systems; the gaps ledger
- `BRAND_VOICE.md` — voice, tone, empathy standards (binding)
- `RISKS.md` — risk register (quarterly review)
- `Playbooks\` — SALES_PLAYBOOK, ICP_RUBRIC_v0, METRICS_DICTIONARY,
  OPERATING_CADENCE
- `Dashboards\pipeline_dashboard.html` — generated; also in Alfred → Workflows
- `Flowcharts\Commercial_Team_Flowchart.html` — in Alfred → Workflows
- `Campaigns\`, `Collateral\` — populated as work happens
