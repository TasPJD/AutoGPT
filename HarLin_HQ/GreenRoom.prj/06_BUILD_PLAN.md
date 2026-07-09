# 06. BUILD PLAN — phases, gates, kill criteria

*For Opus 4.8. Phases are sequential gates, not a waterfall — each phase ends with
something Paul can touch. Velocity is strategy (doctrine): bias to the thinnest thing
that produces a real practice session.*

**Prerequisites before Phase 1:** Concept card signed (01 §sign-off); Anthropic API
credits topped up (HarLin org showed credits exhausted 2026-07-04); avatar provider trial
account(s) created by Paul (accounts/billing are Paul-actions, not agent-actions).

---

## Phase 0 — Realism spike (no product code) — target: within 2 weeks of sign-off
**Question answered:** does the fear response fire, and what does a session cost?
- Configure a stock interviewer persona on provider #1 (Tavus) and #2 (HeyGen) trial
  tiers using our INTERVIEWER_SYSTEM prompt (as far as their config allows).
- Paul does the same scripted 10-min mock interview on each — WEARING HIS WATCH/HR
  device. "Did the fear response fire" becomes a number (HR vs resting baseline), not
  a vibe. Record the readings in the spike scorecard.
- Deliverables: filled scorecard (nerves y/n, latency, interruptions, $/session, BYO-LLM
  ergonomics) → D-004 provider decision + LESSONS_LOG entries.
- Spike kit is ready: `Phase0_Spike/SPIKE_SCRIPT.md` (persona config + the five scripted
  questions + protocol) and `Phase0_Spike/SPIKE_SCORECARD.md` (fill-in template).
- **Kill check K1:** no nerves on either + audio-fallback test also flat → stop/re-scope.

## Phase 1 — Walking skeleton (weeks 1-3 of build)
**One user, one persona, end-to-end.**
- Next.js PWA shell on harlin.dev subdomain; magic-link auth; session metering stubbed.
- AvatarProvider adapter + chosen provider wired: click "Start interview" → live avatar
  call with persona #1 ("Margaret Chen — structured HR screen", PERSONAS.md).
- Setup wizard v0: paste job description + role title; injected into interviewer context.
- Transcript capture → post-session Claude coach report v0 (content rubric only, no
  delivery metrics yet) rendered as a simple debrief page.
- AI-disclosure onboarding + in-call badge + stop button (05 requirements are Phase 1
  requirements, not polish).
- **Exit:** Paul completes a full session start-to-debrief on production URL.

## Phase 2 — The coaching loop (weeks 3-5)
- Delivery metrics client-side: STT with word timestamps → WPM, fillers, pauses, ramble
  flags synced to transcript timestamps.
- Full debrief per 04: two-wins-two-fixes, session score, timestamped moments, drill
  prescriptions; text-mode drill runner (cheap retention loop).
- Session history + progress line; before/after progress card export v0.
- Persona library live: 4 interview personas + difficulty dial (PERSONAS.md).
- Voice-only tier (phone-screen mode) — validates the cheap tier + real use case.
- **Exit → G0 HAND-TEST:** Paul runs 3 real prep sessions for actual opportunities;
  grades the coach's grading; LESSONS_LOG. Fix round.

## Phase 3 — Beta hardening (weeks 5-8)
- Credits/usage system (hard COGS guardrail: sessions capped by credits from day one).
- Recording consent flows, deletion, retention per 05. Error/reconnect handling in-call
  (a dropped WebRTC call mid-answer is the #1 trust killer — resume gracefully).
- Onboarding polish: first session <2 min from landing to avatar hello. Zero asks
  beyond mic/camera permission (FTUE doctrine).
- Seed beta: 10-15 people from Paul's network (job-hunting professionals + 1-2 career
  coaches). Instrument: completion rate, session-2 return, "felt real?" survey.
- **Exit → G1:** targets per concept card §6 (≥60% completion, ≥40% return-in-7-days,
  ≥7/10 "felt real"). **Kill check K2** on miss.

## Phase 2b — Live biometrics channel (slots into weeks 4-5, small)
- `BiometricsSource` interface + Web Bluetooth HR implementation (standard BLE Heart
  Rate Service; browser-native, no backend cost). Baseline capture in setup flow.
- Composure arc gains the HR-over-baseline track + spike/recovery/inoculation stats
  (04 §C physiological channel). Consent + data rules per 05 §3a are part of this
  phase's definition-of-done, not a fast-follow.
- Defer to Phase 4+: Fitbit Web API sync tier (OAuth + intraday-access approval — Paul
  should APPLY for Fitbit intraday access early, lead times are long), Health Connect,
  HealthKit (waits for native rail).
- Rationale for early slot: near-zero COGS, unique differentiator no incumbent has, and
  it makes G0/G1 "felt real" evidence objective.

## Phase 4 — Willingness-to-pay + speech mode (post-G1)
- Mock paywall/credit purchase live for beta cohort → **G2** decision: brand, name,
  entity, pricing (Paul). **Kill check K3.**
- Speech/pitch mode v1: audience panel personas, post-talk Q&A, speech rubric (04 §3).
- LinkedIn-ready share artifact polish; organic content experiments (Paul's account,
  founder-voice: "I practice with it for my own interviews" — true story, best story).

## Working agreements (for the building agent)
- Every phase ends with a pushed branch, a PR, and a LESSONS_LOG entry.
- Meter avatar-minutes and Claude tokens per session from Phase 1; print COGS in debrief
  footer during dev builds (unit-economics kill criterion needs data, not vibes).
- Prompts are product code: version them, and A/B persona changes only with transcripts
  saved for comparison.
- Do not couple to the AutoGPT platform runtime (03 §7). This repo is the workspace.
- Security staging per `PinPals.prj/commercial/SECURITY_CHECKLIST.md` conventions
  (checklist lives on Helios; ask Paul to mirror it here — flagged for sync).

---

## UPDATE LOG
- 2026-07-07 — v0.2: Phase 2b (live biometrics via Web Bluetooth) added; Phase 0 spike
  now measures HR; Fitbit cloud sync deferred to Phase 4+ with early access application.
- 2026-07-06 — v0.1. Week counts are estimates for a solo agent+Paul cadence; gates, not
  dates, govern.

## OPEN QUESTIONS
- Backend runtime final call (Workers vs small Node) — decide when provider SDK
  constraints are known (Phase 0 output).
- Beta cohort list — Paul to draft 15 names during Phase 1.
