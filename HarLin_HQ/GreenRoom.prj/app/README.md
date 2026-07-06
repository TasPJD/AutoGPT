# app/ — code workspace

Structure (per 03_ARCHITECTURE.md; builder lays out internals):

- `prompts/` — the prompt kits. **These are product code.** Version them; save transcripts
  when comparing changes.
  - `INTERVIEWER_SYSTEM.md` — realtime interviewer brain (base system prompt + assembly spec)
  - `COACH_SYSTEM.md` — post-session coach/analyst brain
  - `PERSONAS.md` — persona library layered on the interviewer base
- `web/` — Next.js PWA (setup wizard → call room → debrief room). Empty until Phase 1.
- `server/` — session service: auth, credits, AvatarProvider adapter, post-session
  pipeline. Empty until Phase 1.

Rule from 06_BUILD_PLAN working agreements: meter avatar-minutes + tokens per session
from the first line of Phase 1 code.
