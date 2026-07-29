# Operations Manual — running (and inheriting) the HarLin Commercial engine

**Purpose:** HP-39 made executable. If Paul hands this engine to Harry,
Lincoln, Madeline, Shanice, or Tim tomorrow, this single document gets them
operating it. Everything referenced is plain files + SQLite inside the estate —
nothing dies with a subscription or a password Paul alone holds (vault access
per the estate's family-access provisions).

## What this thing is, in one paragraph

A marketing & sales team where the staff are AI agents. Ten roles (charters in
`Internal Infrastructure\Commercial\`), one shared memory (the CRM in AEOS's
store), one rule that matters above all: **agents draft, the human signs.**
Every external send, price, and commitment passes a human gate. The team's
work product lives in `HarLin_Commercial\Marketing_Sales.prj\`.

## The map

| Thing | Where |
|---|---|
| Master plan / why it's shaped this way | `COMMERCIAL_TEAM_PLAN.md` |
| The CRM decision | `ADR-001_CRM_Decision.md` |
| The data (single source of truth) | `AEOS.prj\runtime\business\aeos_events.db` |
| CRM code + schema + tests | `Internal Infrastructure\Commercial\CRM.prj\` |
| How to sell (stages, MERIT, cadence, taxonomy) | `Playbooks\SALES_PLAYBOOK.md` |
| Who to sell to | `Playbooks\ICP_RUBRIC_v0.md` |
| What the numbers mean | `Playbooks\METRICS_DICTIONARY.md` |
| The weekly/monthly/quarterly rituals | `Playbooks\OPERATING_CADENCE.md` |
| Voice & consent rules (non-negotiable) | `BRAND_VOICE.md` |
| How an agent session runs | `Internal Infrastructure\Commercial\SESSION_PROTOCOL.md` |
| Known risks | `RISKS.md` |
| The gaps ledger | `GAP_ANALYSIS.md` |
| The dashboard | `Dashboards\pipeline_dashboard.html` (also in Alfred → Workflows → Commercial) |
| Git record | github.com/TasPJD/AutoGPT branch `claude/harlin-commercial-ai-team-lf1d12`, `HarLin_Estate/` |
| Remote control of this engine (on-demand) | CCR Routine `trig_01U2b5UxUkCzVq9kF7BAAwcn` — see §Reaching the engine remotely |

## Operating it (the 90% case)

1. **Run an agent session:** open Claude Code, point it at the agent's
   charter, follow SESSION_PROTOCOL.md. The charter tells the agent its
   inputs, outputs, and gates.
2. **Weekly:** run the standup ritual (OPERATING_CADENCE.md §Weekly). It is
   ~3 commands + one written note.
3. **Approve or decline** whatever lands in AWAITING CONFIRM. That queue is
   the steering wheel; everything else is machinery.
4. **Quarterly:** retro + export + re-grade (OPERATING_CADENCE.md §Quarterly).

## Reaching the engine remotely (on-demand)

A Claude Code Remote (CCR) session runs this engine in the cloud and can be
**poked on demand** — it resumes with full context and does whatever the poke
says. This is the operator's remote handle; it fires nothing on its own.

- **Routine:** `HarLin Commercial — Remote Control (on-demand poke)`
- **Trigger ID:** `trig_01U2b5UxUkCzVq9kF7BAAwcn` (poke-only, no schedule)
- **Bound session:** `session_01SiRFCASrJC7MmTkf75maqw` (resumes, not fresh)
- **Fire it:** claude.ai → Routines, or any bridge/Alfred that can reach the
  CCR layer; append run-specific instructions as the fire's text payload.
- **With no payload:** it reports status (PR, gateway-wiring block, Phase 0)
  and awaits direction.
- **Gates still apply:** a remote poke cannot bypass the human gate — outbound,
  pricing, and spend stay AWAITING CONFIRM regardless of how the session was
  started. (Activated + smoke-tested 2026-07-29.)

## Recovery & continuity

- **CRM corrupted/lost:** latest `.bak` beside the DB (auto-made before every
  migration) or the quarterly JSON export in HL_Data → re-run
  `crm_migrate.py` → re-import. Schema rebuilds from `schema_v*.sql` in
  seconds; the exports are plain JSON.
- **Machine lost:** the git branch holds every document and all CRM code;
  the HL_Data export holds the data. Rebuild = clone + migrate + import.
- **Agent misbehaving:** its charter is the contract — amend it (AWAITING
  CONFIRM), or simply stop running its sessions. Nothing external can happen
  without a human approval anyway.
- **A contact complains:** OPERATING_CADENCE.md incident runbook. The human
  responds personally, always.

## What a successor may NOT do (doctrines, settled)

Sell the contact data · outsource the system of record to a rented SaaS ·
remove the human gates on outbound/pricing · dilute family access. These are
HP-39/HP-40 and the empathy standards — the engine's identity, not its
settings.
