# 01. CONCEPT CARD — GreenRoom (working title)

*HarLin harness concept-stage protocol. Paul's sign-off on this card = the build gate for
Phase 1. Drafted 2026-07-06 by the framing agent; Paul edits then signs.*

**SIGN-OFF: ☐ Paul — date: ________** (unsigned = Opus 4.8 does not start building)

---

## 1. One-breath pitch
A synthetic video call with a photorealistic AI interviewer or audience that feels real
enough to trigger real nerves — so you can practice job interviews, pitches, and speeches
under genuine pressure, then get precise coaching on exactly what to fix.

## 2. The internal trigger (which recurring feeling)
The 2 a.m. dread before a high-stakes conversation: *"I'm going to blank / ramble / get
found out, and I can't practice this anywhere without being judged."* The product is the
private rehearsal room. Trigger fires every time an interview invite, pitch date, or
speaking slot lands in someone's calendar.

## 3. The three spectacle moments
1. **First contact:** the avatar greets you by name, makes eye contact, and asks a sharp
   opening question — the "oh, this is *actually* a person… wait, no" jolt.
2. **The interruption:** you waffle, and the interviewer politely cuts in with a probing
   follow-up on the exact weak point — like a real tough interviewer.
3. **The mirror:** the post-session report plays back your worst 15 seconds next to your
   best 15 seconds, with the transformation curve across sessions ("session 1 you vs
   session 5 you").

## 4. The share artifact
The **before/after progress card**: side-by-side stats (filler words, pace, confidence
score, answer structure) from first session to latest, optionally with a 10-second clip.
"I did 6 mock interviews with an AI before the real one — look at the delta." Shareable to
LinkedIn (this product's TikTok is LinkedIn). Nobody shares failure; everybody shares
improvement.

## 5. STEPPS score (0-3 each; GDKB file 04 §3)
- **S**ocial currency: 2 — "I train with an AI interviewer" signals savvy + diligence.
- **T**riggers: 3 — every interview invite/speech slot is a trigger; job-hunt season is
  perpetual.
- **E**motion: 3 — fear → relief → pride arc is strong.
- **P**ublic: 1 — practice is private by design; only the artifact is public.
- **P**ractical value: 3 — directly attached to income/career outcomes.
- **S**tories: 2 — "the AI grilled me harder than the real panel did" is a told story.
- **Total: 14/18.** Weakness is Public; the share artifact must carry virality alone.

## 6. Genre economics + retention targets
Closest genre: career/edtech SaaS with consumable usage (per-minute avatar cost), not F2P
games. Comparators price $20-60/mo or ~$5-15 per mock session. Retention is *episodic by
nature* (people churn when they get the job) — that is acceptable IF: (a) LTV per episode
covers CAC (target: organic CAC ≈ $0 per standing no-paid-marketing decision), (b) the
public-speaking mode gives a non-episodic retention floor. Targets at G1: ≥60% of testers
complete a full session; ≥40% voluntarily do a second session within 7 days; qualitative
"felt real / got nervous" from ≥7/10 testers. Unit-cost ceiling: COGS ≤ $1.50 per 20-min
session at retail ≥ $5 equivalent (see 03_ARCHITECTURE §5).

## 7. Most-likely failure mode + earliest cheap test
**Failure mode:** the uncanny-valley/latency gap — avatar lag or dead-fish affect breaks
the illusion, nerves never fire, and it becomes a worse Yoodli. **Earliest cheap test:**
Phase 0 spike — Paul does one 10-minute mock interview on a raw provider demo (Tavus/HeyGen
trial tier) BEFORE any product code is written. If Paul's pulse doesn't go up, stop and
re-scope to audio-first with a static portrait. Second failure mode: unit economics (avatar
minutes too expensive) — killed by the same spike's cost readout.

## 8. The refusals (what we will NOT add)
- No deception: users always know it's AI (see 05_ETHICS_SAFETY — non-negotiable).
- No "apply to jobs for you" / ATS-spam features. Practice room only.
- No therapy/anxiety-treatment claims. It's rehearsal, not treatment.
- No live-interview cheating mode (real-time whisper answers during actual interviews) —
  a competitor feature (Final Round AI class) we deliberately refuse; it's the integrity
  moat and the LinkedIn-safe positioning.
- No engagement-bait mechanics (streak guilt, FOMO timers). Professionals, not whales.
- No selling of session recordings/transcripts. Ever.

## 9. Kill criteria (dated)
- **K1 (Phase 0, by ~2026-07-20):** realism spike fails (no nerves) AND audio-first
  fallback also fails Paul's hand-test → kill or shelve.
- **K2 (G1, ~6 weeks after build start):** <40% of 10+ external testers complete a session,
  or nobody returns for session 2 unprompted → pivot or kill.
- **K3 (G2):** zero willingness-to-pay signals (nobody accepts a mock paywall / preorder)
  after 25+ completed external sessions → keep as portfolio demo, stop investment.
- **Standing:** any month where per-session COGS cannot plausibly reach ≤30% of price → kill
  the video tier, keep audio tier or kill.

## 10. Hand-test date commitment
- **Phase 0 spike (provider demo, no code):** within 2 weeks of card sign-off.
- **G0 hand-test (our own MVP, Paul does a full mock interview):** within 6 weeks of
  build start. Calendar it at kickoff.

---

## UPDATE LOG
- 2026-07-06 — v0.1 drafted for Paul's review. All scores/targets are the framing agent's
  proposals (`reasoned` grade), not observed data.

## OPEN QUESTIONS
- Does Paul sign as-is, or narrow scope to interviews-only for MVP (recommendation:
  interviews-only first — sharper trigger, and Paul can self-test daily)?
- Price anchor: subscription vs per-session credits (lean: credits first — matches
  episodic usage and consumable COGS).
