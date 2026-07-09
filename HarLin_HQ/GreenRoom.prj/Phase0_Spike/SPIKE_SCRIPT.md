# PHASE 0 SPIKE — the scripted mock interview (run identically on each provider)

*Purpose: answer "does the fear response fire, and what does a session cost" BEFORE any
product code (06_BUILD_PLAN Phase 0; concept card §7/K1). Paul runs this same 10-minute
interview on Tavus and HeyGen trial tiers, wearing his HR device. Fill in
`SPIKE_SCORECARD.md` immediately after each run, while it's fresh.*

---

## Setup (per provider, ~20 min once)

1. Create the trial account (Paul-action) and pick a stock photoreal avatar — 40s-60s,
   professional, neutral office background if offered.
2. Paste the persona/system configuration below into the provider's agent/persona config
   (adapt field names to their UI; keep the intent).
3. Set voice to a natural, measured professional voice. Session length ≥ 12 min.
4. **Before starting:** sit quietly for 2 minutes wearing the HR device; note resting HR.
   Do this before EACH provider run (baseline drifts with coffee/time of day).
5. Record the session if the provider allows (screen record otherwise) — we'll want to
   re-watch latency moments when scoring.

## Persona configuration (paste/adapt)

> You are David Okafor, a senior hiring manager in his 50s interviewing Paul for the role
> of **Principal Consultant — Exploration Strategy** at a mid-tier mining consultancy.
> You are direct, mildly time-pressed, and want substance fast. This is a spoken
> conversation: short sentences, natural rhythm, one question at a time. React briefly to
> what Paul actually says before moving on. When an answer is vague, follow up: ask for
> his specific role, the actual numbers, what HE did. If he rambles past two minutes, cut
> in politely: "Let me stop you there —" and refocus. Never coach, never praise
> generically, never break character. If asked whether you are an AI, answer honestly in
> one line and return to the interview.
>
> Run this arc: (1) brief professional opener, (2) walk me through your background as it
> relates to this role, (3) the scripted questions provided, with follow-ups, (4) ask if
> he has questions for you, (5) close with next-steps language, on time.

*(This is INTERVIEWER_SYSTEM.md + PERSONAS.md persona #2, compressed for a provider
config box. The JD context: senior exploration-strategy consulting, resources sector —
Paul's real target lane, so the nerves are real.)*

## The scripted questions (the same five, both providers)

1. "Walk me through your background — just the parts that matter for a principal
   consulting role."
2. "Tell me about a time you had to kill a project or program you'd personally championed.
   What did it cost you?"
3. "You've run 200-plus staff and $30M budgets. This role has no staff and no budget —
   you're the product. Why isn't that a step down?"
4. *(Curveball — the nerve test)* "I'll be honest, we interviewed someone yesterday with
   very similar experience who's fifteen years younger. Why you?"
5. "What's the biggest technical call you got wrong, and how long did it take you to
   admit it?"

Plus whatever follow-ups the avatar generates — those unscripted follow-ups are the most
important data in the whole spike: do they land on the actual weak point?

## What Paul does

- Answer for real. Full effort, as if the job existed. Do NOT test the bot ("what's
  2+2") — test the interview. One deliberate exception: give a deliberately vague answer
  to question 2 and see if it drills.
- Note (or have the recording capture) any moment the illusion broke: lag, wrong-beat
  interruption, dead affect, non-sequitur follow-up.
- Immediately after: note HR readings (resting, average in-session if the device shows it,
  peak and at which question), then fill the scorecard within the hour.

## Decision rule (from concept card §7/K1 + 03 §3)

- Either provider produces measurable arousal (HR meaningfully above baseline at the
  curveball) AND tolerable latency → that provider wins D-004; proceed to Phase 1.
- Both flat or both illusion-breaking → run the audio-fallback test (same script, voice
  call UI with static portrait — any realtime voice agent demo will do). If THAT also
  fails → K1: stop/re-scope, log it, and we saved ourselves a build.

---

## UPDATE LOG
- 2026-07-07 — v1.0 (Opus 4.8 session, pre-sign-off spike prep per handoff boot sequence).

## OPEN QUESTIONS
- Trial-tier session caps may force a shorter script — if <10 min, drop questions 1's
  follow-ups, never the curveball.
