# 05. ETHICS & SAFETY — the realism line, privacy, legal

*Binding on all agents building or operating this product. Where product ambition and
this file conflict, this file wins until Paul amends it here, dated.*

---

## 1. The realism line (core design stance)

The pitch says "photorealistic so it feels like a person." The line we hold:

**Maximum immersion, zero deception.** The user always *knows* it's AI — they bought an AI
practice tool — and then the experience is engineered to make them *forget* for stretches,
the way a flight simulator pilot knows it's a sim but still sweats a failed landing. Fear
response comes from social realism (being watched, evaluated, interrupted), which fires
even when the counterpart is known-synthetic. So:

- Onboarding states plainly: every interviewer/audience member is AI-generated.
- A subtle persistent indicator in the call UI (e.g. small "AI session" badge). Subtle is
  fine; absent is not.
- The avatar NEVER claims to be human. If asked directly mid-session, it answers honestly
  in one line and returns to role ("I'm an AI interviewer — and I'm still going to be
  tough on you. So, about that gap in 2023…").
- No third party is ever put on a call with our avatar without knowing it's AI.

This is also the legal baseline: AI-transparency obligations (EU AI Act disclosure duties,
California bot-disclosure law, and the growing pattern elsewhere) all require disclosure of
AI interaction. Design once for the strictest regime; verify current requirements at launch.

## 2. Likeness & voice integrity
- Stock/licensed or fully synthetic avatar identities only, under the provider's license.
- NEVER clone a real person's face or voice (no "practice against your actual future
  interviewer / that CEO"). Refuse the feature even when users ask. Personas may reflect
  *role archetypes* (tough CFO, warm HR lead), never identifiable individuals.
- Users may NOT upload someone else's photo to make an interviewer.

## 3. Privacy & recordings (the trust product)
- Practice sessions are among the most vulnerable recordings a person can make. Default
  posture: **local-first, minimum retention.**
- Delivery metrics computed client-side where possible; raw video never leaves the device
  by default. Cloud storage of recordings is opt-in, per session, deletable in one click.
- Transcripts stored to power progress tracking; user-deletable; encrypted at rest.
- No training on user sessions. No sale or sharing of session data. Ever (concept card §8).
- Provider due diligence: confirm the avatar vendor's policy on OUR users' audio/video
  (retention, training use) before signing — this is a selection criterion, not a nice-to-have (03 §3).
- Data residency + Australian Privacy Act compliance review before public launch.

### 3a. Biometric data (wearable HR — strictest tier of everything we touch)
Heart-rate data is health information: sensitive-category under GDPR and the Australian
Privacy Act, with vendor-side rules on top (Fitbit/Google prohibit using their health
data for advertising and require limited-use compliance). Rules:
- Opt-in per session, revocable, never required for any feature; the product is whole
  without it (03 §8 degrade rule).
- We store derived, session-scoped series (HR-relative-to-baseline aligned to session
  timestamps) — not a general health record. No resting-HR history, no data outside the
  session window, no inferences about health or anxiety conditions, ever.
- User-deletable with the session, one click; same no-training / no-sale / no-sharing
  covenant as recordings (§3).
- Coach language treats HR as performance telemetry, never diagnosis. "Your heart rate
  spiked" — yes. "You have anxiety" — never (see §4: rehearsal, not therapy).
- HR data never appears on the share artifact by default; explicit extra opt-in to
  include the inoculation-curve stat (it's compelling — that's exactly why it must be
  the user's deliberate choice to publish).
- Vendor-API compliance review (Fitbit limited-use, Health Connect policies) is part of
  the integration checklist, before the first OAuth screen ships.

## 4. Psychological safety rails
- This is rehearsal, not therapy. No anxiety-treatment claims (inherits A-branch ethic:
  never monetise the vulnerable moment — no upsells triggered by poor performance).
- **Stop-word / panic button:** user can say "pause coaching" or click stop at any time;
  interviewer drops role instantly, session ends or switches to friendly mode. No penalty,
  no shaming copy.
- Difficulty is user-chosen. "Hostile panel" mode exists because real hostility exists,
  but it is opt-in, labeled, and the coach ALWAYS debriefs after a hostile session
  (never end a user on the beatdown — peak-end rule used ethically).
- The coach never attacks the person; it critiques the performance, evidence-cited.
- If a user discloses acute distress mid-session, the interviewer breaks role, responds
  with brief genuine care, and the session moves to debrief. No crisis-counselor roleplay.

## 5. Integrity positioning (refusals, from the concept card)
- No real-time answer-feeding for live interviews. We are the gym, not the steroid.
- No fabricated-credential coaching: the coach improves the telling of TRUE stories and
  will not help invent experience. (Prompted explicitly in COACH_SYSTEM.)

## 6. Access & misuse
- Age gate 16+. Career tool, not a companion app; personas are professional-context only
  and deflect romantic/parasocial use flatly.
- Session content is user-private; standard abuse handling (the avatar disengages from
  abusive sessions after one warning — also good interview training).

---

## UPDATE LOG
- 2026-07-07 — v0.2: added §3a biometric data rules for the wearable HR channel.
- 2026-07-06 — v0.1. Legal notes are knowledge-dated (≤ Jan 2026); counsel/current-law
  check required before public launch (EU AI Act application dates, AU privacy reform).

## OPEN QUESTIONS
- Exact disclosure copy + badge design that preserves immersion (test in G0/G1).
- Which avatar providers contractually forbid training on our users' streams?
