# 07. HANDOFF — entry point for the building agent (Opus 4.8)

*You are the builder. This file is your boot sequence. Written 2026-07-06 by the framing
agent (Fable-class session) that set up this project.*

---

## Boot sequence
1. Read `README.md` (map), then `01_CONCEPT_CARD.md` — **check the sign-off box. If Paul
   has not signed, your job this session is the Phase 0 spike prep and card questions,
   NOT building.**
2. Read `03_ARCHITECTURE.md`, `06_BUILD_PLAN.md` for what to build; `05_ETHICS_SAFETY.md`
   is binding; `04_FEEDBACK_ENGINE.md` when you touch the coach.
3. Skim `DECISIONS_LOG.md` for anything decided after this handoff was written.
4. Work on branch discipline: feature branches off this project's branch; PR per phase;
   LESSONS_LOG entry per session that learned anything.

## What is already decided (don't re-litigate)
- Buy the face (avatar API behind an adapter), own the brain (prompts) and the feedback
  engine. (03 §1)
- Two AI roles, never merged: realtime Interviewer stays in character; async Coach
  debriefs. (03 §4)
- PWA-first on harlin.dev subdomain, Cloudflare rails. (HarLin standing decision)
- Zero-deception realism: disclosure + badge + honest-if-asked. Non-negotiable. (05 §1)
- The refusals in concept card §8 (no cheating mode, no likeness cloning, etc.).
- Interviews first, speech mode fast-follow. MVP scope = Phases 1-3 of 06_BUILD_PLAN.

## What is NOT decided (open — flag, don't assume)
- Avatar provider (Phase 0 spike decides; Tavus is priority-1 candidate only).
- Product name + brand home (D-001/D-002 — Paul at G2; "GreenRoom" is a working title,
  do not bake it into user-facing copy in a hard-to-change way).
- Backend runtime (Workers vs Node — provider SDK constraints decide).
- Pricing (credits-first is the lean; G2 decision).

## Paul-actions to request early (you cannot do these)
- Sign the concept card (or edit then sign).
- Create avatar-provider trial accounts + billing; Anthropic API credit top-up (HarLin
  Consulting org was out of credits as of 2026-07-04).
- Cloudflare DNS: pick the harlin.dev subdomain.
- Draft the 15-name beta list (Phase 3).
- Mirror this project into HarLin_OS on Helios + register in project index; mirror
  SECURITY_CHECKLIST here.

## Where things live
- Prompt kits (product code, version carefully): `app/prompts/`
- App code goes in: `app/web/` (PWA) and `app/server/` (session service) — currently
  scaffold READMEs only; structure is yours to lay out within 03's architecture.
- This AutoGPT fork is a workspace; do not couple the product to the AutoGPT runtime.

## Quality bar
The spectacle moments (card §3) are the product: the greeting-by-name jolt, the
mid-ramble interruption, the best/worst-15-seconds mirror. If a sprint doesn't make one
of those moments more real, question the sprint. And the FTUE doctrine applies: a nervous
job-seeker must get from landing page to "the avatar said hello" in under two minutes,
with nothing asked of them but mic/camera permission.

---

## UPDATE LOG
- 2026-07-06 — v0.1, initial handoff.

## OPEN QUESTIONS
- (none — see per-file open questions)
