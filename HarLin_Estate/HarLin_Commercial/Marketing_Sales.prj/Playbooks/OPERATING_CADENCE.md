# Operating Cadence v1 — how the commercial engine runs on rails

**Owner:** Foreman · **Created:** 2026-07-12. The rituals below are the
difference between a team and a pile of charters. Every ritual outputs to a
named place; silence is never a valid output.

## Weekly — Commercial Standup (Foreman)

1. `crm_snapshot_pipeline` (the week's point-in-time record — non-negotiable,
   trends are impossible without it).
2. Regenerate the dashboard (`generate_dashboard.py`).
3. Standup note → morning brief via Pulse/Alfred:
   - Pipeline delta vs last snapshot (velocity, from crm_pipeline_snapshots)
   - Overdue actions (v_crm_overdue_actions) — each gets an owner + new date TODAY
   - Stuck deals (no stage change in 21 days) — advance, park, or lose honestly
   - KPI movement vs METRICS_DICTIONARY weekly set
   - AWAITING CONFIRM queue for Paul (sends, prices, publications)

## Monthly — Hygiene & Voice (Quartermaster + Advocate)

- Quartermaster: dedup sweep, orphan-activity check, consent audit
  (crm_audit refusals review), data-freshness report, metabolism decay of
  untouched segments.
- Advocate (once active; Herald covers until): tone audit of the month's
  drafts vs BRAND_VOICE.md; complaint ledger MUST be empty or escalated.
- Reply/meeting rates per sequence → Scribe kills losing formats.

## Quarterly — Retro, Export, Re-grade

- Commercial Retro (the armed Pipeline play): lost-reason distribution →
  one named counter-move; charter amendments as AWAITING CONFIRM;
  LEARNINGS.md mined (PatternEngine) and distilled.
- `crm_export` full succession export → HL_Data (HP-39; verify the files open).
- Cartographer + Assayer: ICP rubric back-test → re-version → re-grade.
- Metrics dictionary review: every metric still serving a decision?

## Event-driven — Incident runbook (comms/complaint)

Severity 1 (complaint, consent breach claim, public criticism):
1. STOP the related sequence/campaign immediately (no debate).
2. Same-day escalation to Paul with the full interaction history from the CRM.
3. Paul responds personally — agents NEVER handle a live complaint.
4. Root cause into LEARNINGS.md + crm_audit note; rule fix as AWAITING CONFIRM.
5. `do_not_contact` set if the person wants out — instantly, graciously.

Severity 2 (bounce storms, wrong-person sends, factual error published):
pause channel → correct honestly (no stealth edits) → log → monthly review.

## Standing gates (never cadence-dependent)

Outbound sends · pricing/discounts · publications · spend · contract terms:
**Paul, every time, via AWAITING CONFIRM.** Cadence never overrides a gate.
