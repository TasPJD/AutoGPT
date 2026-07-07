# 03. ARCHITECTURE — GreenRoom technical framework

*For the building agent. Decisions marked PROPOSED need the Phase 0 spike to confirm;
decisions marked STANDING inherit from HarLin OS doctrine. Vendor facts are knowledge-dated
(≤ Jan 2026) — re-verify pricing/latency/API shape at build time and log corrections.*

---

## 1. Design principle

**Buy the face, own the brain.** The photoreal realtime avatar is a commodity API race
(Tavus / HeyGen / D-ID / Anam / Simli / Azure) — renting it means we surf their quality
curve for cents per minute. The defensible layers we build ourselves:
1. The **interviewer brain** (persona + pressure model + follow-up strategy — `app/prompts/`).
2. The **feedback engine** (rubric, scoring, longitudinal progress — `04_FEEDBACK_ENGINE.md`).
3. The **session product** (setup → call → debrief loop, progress artifacts).

Corollary: the avatar provider sits behind our own thin adapter interface from day one
(`AvatarProvider`: startSession, sendContext, events, endSession) so we can swap vendors
without touching product code. No provider lock-in above that seam.

## 2. System overview

```
┌──────────────────────────── Browser (PWA, harlin.dev subdomain) ───────────────────────────┐
│  Setup wizard          Call room (WebRTC)                 Debrief room                     │
│  - role/JD paste       - provider's avatar video          - report, scores, clips          │
│  - persona pick        - user cam/mic (local record)      - drills, progress card          │
│  - difficulty          - live captions (optional)         - share artifact export          │
└─────────┬──────────────────────────┬───────────────────────────────┬───────────────────────┘
          │ REST                     │ WebRTC via provider SDK       │ REST
┌─────────▼──────────────────────────▼───────────────────────────────▼───────────────────────┐
│                        Session service (thin backend, Cloudflare Workers                    │
│                        or small Node service — builder's call)                              │
│  - auth (email magic link)     - session broker: creates provider conversation,             │
│  - credits/usage metering        injects system prompt + JD context, receives transcript    │
│  - AvatarProvider adapter      - post-session pipeline: transcript + audio metrics →        │
│  - storage: sessions, scores     Claude analysis → report JSON                              │
└──────────────┬───────────────────────────────┬──────────────────────────────────────────────┘
               │                               │
     Avatar provider API              Claude API (claude-opus-4-8 / sonnet)
     (Tavus CVI / HeyGen              - interviewer brain (if provider allows BYO-LLM)
      Interactive / fallback)         - post-session coach analysis (always ours)
```

## 3. Avatar provider trade study (PROPOSED — Phase 0 spike decides)

| Criterion | Tavus (CVI) | HeyGen Interactive | D-ID Agents | Simli | Azure TTS Avatar |
|---|---|---|---|---|---|
| Photorealism (live) | High | High | Medium-high | Medium (fast, smaller window) | Medium |
| Turn latency | ~sub-1s class | ~1s class | ~1-2s | Very low | Higher |
| BYO-LLM (our brain drives it) | Yes | Partial (LiveKit pipeline) | Limited | Yes (it's a face for your pipeline) | Yes |
| Interruption handling | Yes | Yes | Basic | Ours to build | Ours to build |
| Cost order (video min) | ~$0.10-0.30 | similar | similar | lower | lower |
| Spike priority | **1** | **2** | 3 | 4 (fallback/low-cost tier) | 5 |

**Spike protocol (Phase 0, before product code):** run the same 10-min scripted mock
interview on providers 1 and 2 (trial tiers). Score: (a) did Paul feel nerves, (b) measured
response latency, (c) interruption naturalness, (d) $/session extrapolated, (e) BYO-LLM
ergonomics. Winner becomes default; runner-up stays wired in the adapter. Log to
DECISIONS_LOG as D-004 and LESSONS_LOG.

**Degraded tiers (also product tiers):** video call (premium) → voice-only call with
static portrait + waveform (cheap tier, ~10x lower COGS) → text chat (free drill mode).
Voice-only is not just a fallback: phone-screen practice is a real interview format.

## 4. The two AI roles (never merged)

- **The Interviewer** (realtime): stays in character for the entire call. Never coaches,
  never breaks role mid-session (except safety stop-word, see 05). Runs on the fastest
  adequate model (latency budget ~500ms to first token). Prompt kit: `app/prompts/INTERVIEWER_SYSTEM.md` + `app/prompts/PERSONAS.md`.
- **The Coach** (post-session, async): analyzes transcript + delivery metrics, writes the
  debrief, prescribes drills. Runs on the strongest model (no latency constraint;
  claude-opus-4-8). Prompt kit: `app/prompts/COACH_SYSTEM.md`. Optional mid-session
  "pause & coach" mode explicitly switches context with a visual mode change.

## 5. Delivery metrics (computed, not vibed)

Client-side (in-browser, privacy-friendly, zero server cost):
- WPM, pauses, filler-word count (from live captions / Whisper-class STT on recorded audio)
- Talk/listen ratio, interruption recovery time
- Optional CV via MediaPipe: eye-contact-with-camera %, posture drift (LOCAL ONLY,
  never uploaded raw — see 05_ETHICS_SAFETY)

Server-side (Claude over transcript): answer structure (STAR), specificity, quantification,
question-dodging, rambling segments, confidence language. Full rubric in 04_FEEDBACK_ENGINE.

## 6. Unit economics guardrail (STANDING kill criterion, card §9)

Per 20-min video session target: avatar minutes (~$2-6 at list — THE number the spike must
pin down) + STT + Claude analysis (~$0.10-0.30) + infra (~cents). If video COGS can't
plausibly path to ≤$1.50/session (negotiated rates, shorter default sessions, voice tier
mix), the video tier price floor rises or the tier dies. Meter everything from day one.

## 7. Stack choices (PROPOSED)

- **Frontend:** Next.js PWA (React), installable, camera/mic APIs, provider WebRTC SDK.
  Deployed on Cloudflare Pages at a `harlin.dev` subdomain (rails: PWA → TWA → native).
- **Backend:** Cloudflare Workers + D1/Postgres (or one small Node service if provider
  SDKs demand it). Keep it thin; the providers carry the heavy realtime load.
- **Auth:** email magic link. No social login at MVP.
- **Storage:** session metadata + transcripts + scores. Raw A/V retained only per user
  choice (default OFF for video upload; metrics extracted client-side — see 05).
- **This repo (AutoGPT fork) is the workspace, not the runtime.** MVP does NOT depend on
  the AutoGPT platform. If later we want agentic workflows (e.g. JD-research agent that
  briefs the interviewer), rnd/autogpt_server blocks are available — do not couple early.

## 8. Biometrics layer — wearable heart rate (opt-in; Paul's addition 2026-07-07)

Physiological signal turns the composure story from inference ("your voice tightened")
into measurement ("your HR hit 112 when the salary question landed — and here's how it
sounded"). Two ingestion tiers, both behind one `BiometricsSource` interface (mirror of
the AvatarProvider seam — no vendor lock-in above it):

1. **Live tier — Web Bluetooth, in-browser.** The standard BLE Heart Rate Service profile
   is readable directly from Chrome/Edge with no native app — fits the PWA rail. Covers
   chest straps (Polar, Wahoo) and watches with HR-broadcast mode (Garmin, Polar, Amazfit,
   Apple Watch via companion broadcast apps). Real-time samples timestamped against the
   session clock → live alignment with transcript moments.
2. **Sync tier — vendor cloud APIs, post-session.** Fitbit does NOT broadcast standard
   BLE HR; its intraday HR comes via the Fitbit Web API after the fact (intraday access
   requires their approval — apply early). Same pattern for Google Health Connect /
   Apple HealthKit later (HealthKit = native iOS only, so it waits for the native rail).
   Debrief pipeline pulls the session window, aligns on timestamps, coarser granularity.

Design rules:
- **Baseline first:** capture 1-2 min resting HR during setup (persona intro screen doubles
  as the calm window). All in-session numbers are reported relative to baseline — absolute
  HR varies too much person-to-person to score raw.
- Degrade gracefully: no device → composure arc runs on voice metrics alone, as designed.
  Biometrics is an enhancement channel, never a requirement.
- COGS: ~zero (browser API / user's own vendor account). Product value per dollar is the
  best in the whole stack.
- Data handling per 05 §3a (biometric data rules — stricter than everything else).

---

## UPDATE LOG
- 2026-07-07 — v0.2: added §8 biometrics layer (Paul's directive: tap fitness devices,
  e.g. Fitbit, for assessment depth). Vendor API facts knowledge-dated; verify Fitbit
  intraday approval process + current Web Bluetooth device coverage at build time.
- 2026-07-06 — v0.1. Provider table is knowledge-dated; re-verify at spike.

## OPEN QUESTIONS
- Does the chosen provider allow full BYO-LLM with Claude, or only their hosted brains?
  (Determines whether the Interviewer prompt runs on our keys or as provider config.)
- Cheapest STT path that gives word-level timestamps for filler/pace metrics in-browser?
- Anthropic API credits: HarLin Consulting org showed a credits-exhausted notice
  (2026-07-04 email). Top up before Phase 1.
