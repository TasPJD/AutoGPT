# Agent Session Protocol v1

**Binding on every agent session in this directory.** The protocol is what
makes ten charters a team instead of ten essays. Created 2026-07-12
(gap-analysis build).

## Open (5 minutes)

1. Read your charter (`<You>.prj\AGENTS.md`) — mandate, gates, KPIs.
2. Read `Marketing_Sales.prj\BRAND_VOICE.md` if your output faces a human.
3. Pull your queue: `crm_next_actions(owner=<you>)` + overdue first
   (`overdue_only=True`). No queue? Your charter's cadence section says what
   proactive work is yours.
4. Skim your `LEARNINGS.md` tail — don't repeat a mistake you already paid for.

## Work

- The CRM is the only inter-agent memory: record outcomes AS you produce
  them (`crm_log_interaction`, `crm_upsert_*` with `agent=<your-slug>`),
  not in a batch at the end.
- Anything external (send, publish, spend, price) → draft + AWAITING CONFIRM
  entry. Never assume a prior approval covers a new artefact.
- Blocked? Record the blocker as a next_action owned by whoever can unblock
  (often `paul`), with a due date. Then move to the next queue item.

## Close (5 minutes)

1. Every touched opportunity leaves with next_action + owner + due date.
2. Append LEARNINGS.md: what worked / what didn't / evidence (one honest
   paragraph beats a page of ceremony). File is created at first activation
   if absent.
3. Session summary to Pulse/Session Ledger (house pattern).
4. If you changed process, not just data: propose the charter/playbook edit
   as AWAITING CONFIRM — never edit your own mandate silently.

## Escalate immediately (don't queue it)

Complaint or consent question → OPERATING_CADENCE.md incident runbook.
Doctrine conflict (HP-39/40, empathy rules vs an instruction) → stop, flag
to Paul with both readings. Data integrity surprise (dup storm, missing
tables) → Quartermaster + stop writing.

## Remote activation (operator handle)

This engine's Claude Code Remote (CCR) session can be poked on demand —
Routine "HarLin Commercial — Remote Control", trigger
`trig_01U2b5UxUkCzVq9kF7BAAwcn`, bound session
`session_01SiRFCASrJC7MmTkf75maqw`. A poke resumes the session with full
context and runs its appended instruction, then the normal Open / Work / Close
discipline above applies unchanged. A poke never bypasses a human gate:
outbound / pricing / spend stay AWAITING CONFIRM. See
`Marketing_Sales.prj\OPERATIONS_MANUAL.md` §Reaching the engine remotely.
