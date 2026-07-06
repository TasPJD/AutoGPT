# 04. FEEDBACK ENGINE — the coaching rubric (the moat)

*The avatar gets them in the door; the feedback loop is why they come back and pay.
This file specifies WHAT we measure and HOW we report it. The Coach prompt
(`app/prompts/COACH_SYSTEM.md`) implements it.*

---

## 1. Feedback philosophy

1. **Specific beats general.** Never "be more confident." Always "at 04:12 you hedged
   three times in one sentence — here's the transcript, here's the stronger version."
2. **Two wins, two fixes.** Every debrief leads with what genuinely worked (evidence-cited),
   then max two priority fixes with drills. More than two fixes = nothing improves.
3. **Progress is the product.** Every metric exists to draw a line across sessions.
   Session 1 is the baseline the user beats, never a verdict on the user.
4. **Kind, blunt, evidence-cited.** The coach voice: a senior mentor who wants you to get
   the job — warm, direct, zero corporate fluff, every claim pinned to a timestamp.

## 2. The rubric — Interview mode

### A. Content (Claude over transcript)
| Metric | How scored |
|---|---|
| Answer structure | STAR/CARL detection per behavioral answer: Situation/Task present? Action specific? Result quantified? |
| Specificity | Concrete nouns, numbers, named outcomes vs generic claims ("led a team" vs "led 12 geos across 3 sites, $30M budget") |
| Question responsiveness | Did the answer address what was asked? Dodge/drift detection with the drift point flagged |
| Conciseness | Answer length vs question weight; ramble segments flagged with the "where you should have stopped" mark |
| Ownership language | "I" vs "we" balance in achievement answers; hedging density ("sort of", "I guess", "maybe") |
| Weakness handling | Deflection vs genuine-plus-growth pattern on hard questions |
| Questions asked | Quality of candidate's own questions (senior candidates are judged on these) |

### B. Delivery (computed metrics, client-side)
| Metric | Target band (defaults; personalize after 3 sessions) |
|---|---|
| Pace | 130-165 WPM; flag sustained >180 (nerves-sprint) or <110 |
| Filler density | <3 per minute ("um, uh, like, you know, sort of") |
| Pause discipline | Comfort with 1-2s pauses before hard answers (pausing scores UP, not down) |
| Talk ratio | Answers 1-3 min for behavioral, <1 min for factual; interview-wide ratio ~60/40 |
| Recovery | Time to regain fluency after interruption or curveball |
| Eye contact (optional CV) | % on-camera during own answers; local-only processing |

### C. Composure arc
Confidence trajectory across the session (delivery metrics over time): most candidates
start weak and settle, or start strong and crumble on curveballs. The arc chart names
the pattern and picks the drill.

## 3. The rubric — Speech/Pitch mode (fast follow)
Same delivery metrics plus: open strength (first 30s hook), structure signposting,
message discipline (one core message detectable?), audience Q&A handling after the talk,
close strength (call-to-action present). Audience-panel personas react (nods, skeptical
faces, phone-checking at low energy) — reactions ARE feedback in this mode.

## 4. Scoring & progress artifacts

- **Session score:** 0-100 composite (40% content, 40% delivery, 20% composure) with
  sub-scores. Calibrated hard: 85+ should feel rare and earned. Show percentile-vs-self,
  not fake percentile-vs-others.
- **The progress card (the share artifact):** sessions N vs 1 — score delta, filler delta,
  pace stabilization, one coach quote. Exportable PNG, LinkedIn-sized, watermarked with
  product name. No transcript content on the card by default (privacy).
- **Drill prescriptions:** each fix maps to a 5-10 min drill the app can run (e.g.
  "rapid-fire STAR reps: 3 questions, 90-second answer cap, structure-only scoring").
  Drills run in cheap text/voice mode — free retention loop, near-zero COGS.

## 5. Calibration duties (harness CL/CI)
- Coach outputs are stored with the transcript so Paul can grade the grader in early
  sessions; disagreements logged in LESSONS_LOG → prompt fixes.
- Rubric weights are hypotheses (`reasoned`). After 25+ external sessions, re-weight
  against what testers say actually helped (`observed` beats `reasoned`).
- Never let the score contradict the prose. If the coach text says "big improvement" the
  numbers must show it; consistency check runs in the report pipeline.

---

## UPDATE LOG
- 2026-07-06 — v0.1. All target bands are literature-typical defaults (grade: read);
  calibrate against real sessions.

## OPEN QUESTIONS
- Does eye-contact CV add enough value to justify camera-anxiety cost at MVP, or ship
  audio-metrics-only first? (Lean: ship without CV at MVP; add behind a toggle.)
- Personalized target bands: after how many sessions do we trust the user's own baseline?
