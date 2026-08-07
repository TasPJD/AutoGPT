# HarLin Sales Playbook v1

**Owner:** Foreman (process) / Envoy (execution) · **Created:** 2026-07-12 (gap-analysis build)
**Binding on:** every agent touching an opportunity. BRAND_VOICE.md empathy rules override
anything here if they ever conflict.

## 1. Pipeline stages — entry & exit criteria

A record may not sit in a stage it hasn't earned. Stage changes are recorded
in `crm_stage_history` automatically; reopening won/lost requires an explicit,
deliberate `reopen=True`.

| Stage | Entry criteria | Exit forward when |
|---|---|---|
| `identified` | Company in universe, ICP-graded A/B, trigger event noted | Why-now brief exists |
| `qualified` | MERIT score ≥ 3/5 (below), named contact with lawful consent basis | Outreach approved by Paul |
| `meeting` | A meeting is booked (not "promised") | Meeting held, need confirmed, next step agreed |
| `proposal` | Paul has approved scope + price; proposal sent | Client responds substantively |
| `negotiation` | Client is negotiating terms (not silent) | Signature or a clean no |
| `won` | Signed / paid. Company auto-promotes to `client` | → Shepherd onboarding |
| `lost` | A clean no, or 2 sequences + 6-month rest elapsed twice | `lost_reason` REQUIRED (taxonomy §4) |
| `parked` | Real interest, wrong timing — with a dated revisit action | Revisit date arrives |

**Hygiene law:** every open opportunity carries a `next_action`, an owner, and
a due date. An opportunity with none is a bug (v_crm_overdue_actions catches
the late; the weekly standup catches the empty).

## 2. Qualification — MERIT (MEDDICC adapted to mining/geoscience)

Score 0–1 each; qualified = ≥3 and no hard zero on M or T.

- **M — Money:** exploration budget/raise visible (ASX announcements, quarterly
  cash position)? A junior mid-raise scores 0 *now*, park with a revisit date.
- **E — Evidence of pain:** are they logging on paper, wrestling AQuire/DataShed,
  posting for data managers, re-assaying from bad records?
- **R — Reach:** can we get to the person who owns the problem (Expl. Manager,
  Chief Geo, DB admin) through consented channels?
- **I — Impact:** can we quantify time/cost/risk saved for THIS company
  (deposit style, rig count, team size)?
- **T — Timing trigger:** drilling program starting, new project acquired,
  audit coming, person just hired — why NOW?

## 3. Cadence & respect rules (hard, tool-enforced where possible)

1. Sequence = max 3 touches over 3 weeks (T+0 email, T+7 value-add follow-up,
   T+18 courteous close). No "just bumping this."
2. Two silent sequences → `rest_until` +6 months. Enforced by the consent layer.
3. Every touch is personalised from the why-now brief — no mail-merge blasts, ever.
4. A reply — any reply — moves the record to a human decision within 1 business day.
5. `do_not_contact` is forever unless the person themselves reverses it.

## 4. Lost-reason taxonomy (pick ONE primary; free text for colour)

`no_budget` · `timing` · `competitor_chosen` · `status_quo` (kept spreadsheets/AQuire) ·
`no_response` · `bad_fit_product` (we lacked a capability — feeds NexusBoard) ·
`bad_fit_segment` (ICP rubric wrong — feeds Cartographer) · `price` · `trust_newvendor` ·
`champion_left` · `other`

Quarterly: Foreman charts the distribution; the top reason gets a named
counter-move in the retro.

## 5. Duplicate & merge protocol

- Contacts: unique by email (enforced, case-insensitive). Same human, new
  employer = NEW contact at the new company; note the move in both records
  (relationship intelligence — people move between miners constantly).
- Companies: before insert, search `lower(name)` + ticker. True duplicate →
  keep the older id, move children (contacts/opps/interactions) to it, note
  merge in both `notes`, mark loser `status='dormant'` + note "MERGED → <id>".
  (Hard-delete never — audit trail is sacred.)

## 6. Proposal & pricing

Agents draft; **pricing is Paul's alone**, every time. Proposal drafts carry:
scope, deliverables, timeline, price *placeholder*, reference case, single
clear next step. One page beats ten.
