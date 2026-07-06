# GreenRoom.prj — AI Video-Call Practice for Interviews & Public Speaking

**Working title:** GreenRoom (provisional — see DECISIONS_LOG.md D-002)
**Status:** FRAMEWORK / PRE-BUILD. Established 2026-07-06. Owner: Paul.
**Canonical home:** primary `C:/AI/HarLin_OS/Projects/GreenRoom.prj/` (Helios) once synced;
this git copy (`taspjd/AutoGPT` → `HarLin_HQ/GreenRoom.prj/`) is the build workspace.
**Flag for sync:** this project is NOT yet registered in the HarLin_OS project index on
Helios or mirrored to Drive. First agent with Helios access: register it and mirror per
HarLin_OS mirror discipline.

---

## One-breath pitch

You join what looks and feels like a real Zoom call. On the other side is a photorealistic
AI interviewer (or audience). You do the interview, pitch, or speech for real — real nerves,
real pressure, real follow-up questions — and when it ends, a coach shows you exactly what
you did well, what you fumbled, and drills to fix it. Practice the scariest conversations of
your career, unlimited times, with nobody watching you fail.

## Why this, why now

- Realtime conversational avatar APIs (Tavus, HeyGen Interactive, D-ID, Simli class) crossed
  the realism/latency threshold in 2025-26: sub-second turn-taking, photoreal faces, natural
  interruption handling. The "it feels like a person" experience is now an API call, not a
  research project.
- Interview anxiety and public-speaking fear are massive, evergreen, willingness-to-pay
  markets (career outcomes are attached to them).
- Paul is living the use case right now (active senior job search) — founder-as-user gives
  free, brutal G0 hand-testing.

## Read order (any agent, any platform)

| # | File | What it is | Read when |
|---|------|-----------|-----------|
| 1 | `README.md` | This file. Map + status. | Always, first |
| 2 | `01_CONCEPT_CARD.md` | The binding concept card (HarLin harness protocol). | Before any design/build work |
| 3 | `02_MARKET_SCAN.md` | Competitors, positioning, pricing landscape. | Before positioning/pricing decisions |
| 4 | `03_ARCHITECTURE.md` | Technical stack, avatar-provider trade study, system design. | Before writing any code |
| 5 | `04_FEEDBACK_ENGINE.md` | The coaching rubric + scoring design (the actual moat). | Before building analysis/feedback |
| 6 | `05_ETHICS_SAFETY.md` | Disclosure, realism-vs-deception line, privacy, legal. | Before build AND before any launch |
| 7 | `06_BUILD_PLAN.md` | Phased milestones, gates, kill criteria. | Before starting each phase |
| 8 | `07_HANDOFF_OPUS48.md` | Entry point for the building agent (Opus 4.8). | The builder reads this FIRST |
| — | `DECISIONS_LOG.md` | Dated decisions; only Paul changes standing ones. | Skim always |
| — | `LESSONS_LOG.md` | Append-only. Every hand-test/beta/launch writes here. | After every test session |
| — | `app/` | Code scaffold + the interviewer/coach prompt kits. | Build phase |

## Harness compliance (HarLin OS)

- **Concept card is the build gate** — Paul's sign-off on `01_CONCEPT_CARD.md` before Opus
  4.8 starts Phase 1. (Concept-stage protocol per GDKB `07_MASHA_DOCTRINE.md` §3,
  generalised — this is NOT a MaSha product; see brand note below.)
- **Lessons discipline:** a session that produced a lesson and did not log it in
  `LESSONS_LOG.md` has failed the harness.
- **Update logs:** every doc here ends with an UPDATE LOG + OPEN QUESTIONS section.
  Never delete knowledge; supersede it with `[SUPERSEDED YYYY-MM-DD]`.
- **Distribution rails (standing decision 2026-07-02):** PWA on own domain (Cloudflare)
  first → Google Play via TWA → native/Apple only after BUILD gate.
- **No pre-build paid marketability tests** (standing decision 2026-07-02).

## Brand note (open — D-001)

This is a professional/career product, not a game. Default assumption: it does NOT go under
the MaSha Labs brand (comedic voice, games) and the HarLin ↔ MaSha firewall applies. Options:
HarLin-adjacent professional brand, or standalone brand. `harlin.dev` (registered 2026-06)
is available as the dev/staging domain either way. Paul decides at G2.

---

## UPDATE LOG
- 2026-07-06 — v0.1 created (framework + documentation scaffold, pre-build). Source:
  Paul's directive of 2026-07-06; harness conventions from GDKB 00_INDEX / 07_MASHA_DOCTRINE.

## OPEN QUESTIONS
- Final product name and brand home (D-001, D-002).
- Which avatar provider wins the trade study on live latency/cost (03_ARCHITECTURE §3).
