# Decision Throughput Protocol — v0.1 (StandingRules candidate)

**Status:** 🟠 PROPOSED — drafted 2026-07-12 under Paul's delegation, for adoption into `HarLin_OS\StandingRules\` after his review. Gap register #2.
**Problem, quantified:** AWAITING CONFIRM stood at 134 (2026-07-10), 148 (07-11), 239 (07-12). The v0.3 post-mortem attributes 56 revenue-free days to a seven-question decision pile. Backfill calibration across Apr–Jul: autonomous-buildable milestones get achieved; confirm-gated ones stall. The queue is generated faster than any single human can clear it — this is an infrastructure defect, and PLAN_v0.4 §5 already proved the cure locally (defaults D1–D7 dissolved the pile same-day). This protocol generalizes that cure estate-wide.

## 1. Confirmable classes (every AWAITING CONFIRM item gets exactly one)

| Class | Definition | Handling |
|---|---|---|
| **C1 Paul-only** | Legally/financially his alone: signatures, account opening, spending above cap, pricing, launch word, anything in his name, family/data-class calls | Queue to PAUL_ACTIONS; never defaults; surfaced via Console/briefing (HP-10) |
| **C2 Default-with-window** | Judgment calls an agent can take defensibly under doctrine: naming inside conventions, structure choices, scope adjustments, method adoptions | Actor states the default + rationale; **7-day objection window** from Paul's first sight; silence = default governs (the v0.4 §5 inversion) |
| **C3 Notify-only** | Work executed under existing doctrine that today files as AWAITING CONFIRM out of caution: file moves per REORG_LEDGER, path repoints, records housekeeping, generated-view refreshes | Reclassify: log + notify, no confirm required. Rule #12 cascade and Pulse are the audit trail |
| **C4 Countersign** | Items where a second signature substitutes for Paul's: stage promotions above S3 (VALUATION_FRAMEWORK §5.4), sensitive-data boundary calls | Family successor countersign once stood up; until then C1 |

## 2. Standing rules

1. **Class at creation.** Whatever creates a confirmable names its class inline. Unclassed items default to C2.
2. **Expiry.** C2 items: window lapses → default governs → item auto-moves to 🟢-by-default with a distinct marker (`🟢d`) so ratified-by-silence is always distinguishable from ratified-by-word. C3 items never enter the queue at all.
3. **Escalation honesty.** An actor may not launder a C1 into C2 to move faster; misclassification found in review is a provenance incident (pillar 7).
4. **Weekly compaction.** Alfred's briefing shows: C1 count (the only number Paul owes attention), C2 items inside window, `🟢d` count last week. The orient headline number becomes **C1-only** — 239 undifferentiated items is noise; the C1 subset is the real operator load.
5. **Pillar-5 wiring.** `_snapshots.log` gains class columns when the estate adopts this (capture plan: extend snapshot_pillars.py parsing once orient reports per-class counts).

## 3. Backlog triage runsheet (the standing 239)

One-time sweep, mechanical, delegable to any T2/T3 session with estate write access:
1. Export all AWAITING CONFIRM items with source + date.
2. Classify each (rules above). Expected shape based on sampled items: the bulk is C3 (housekeeping already executed — e.g., the 2026-06-12 Env_Reorg items still queued a month later) and stale C2.
3. C3 → close with `🟢d`-style marker + one ledger line. C2 older than 30 days → treat window as long-lapsed; default governs; close likewise.
4. Genuine C1s → PAUL_ACTIONS with a one-line recommendation each (never a bare question — v0.4 lesson).
5. Report the before/after counts to Pulse; that delta is a pillar-5 event the 07b report cites.

**Predicted outcome:** C1 residue in the low tens. If the sweep instead finds hundreds of true C1s, that finding falsifies this protocol's premise and goes to Harness_Review — either way the estate learns something true.

## 4. Interlocks

- WP-12 Console = the *surface* (one-tap CONFIRM/OBJECT); this protocol = the *policy* deciding what reaches the surface. Both needed; neither substitutes.
- PLAN_v0.4 §5 defaults D1–D7 remain governing precedent and are grandfathered as C2-lapsed or C1 per their own table.
- HP-19 (destructive/costly/external gates) is untouched — nothing here authorizes spending, deletion, or external sends by default.
