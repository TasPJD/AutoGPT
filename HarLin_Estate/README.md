# HarLin Estate — Commercial Branch Staging

This directory is a 1:1 staging mirror of files written into the HarLin estate
(`C:\AI\...`) via the HarLin MCP on 2026-07-11, establishing the **HarLin
Commercial digital team** (AI agent marketing & sales branch).

Mapping:

| Repo path | Estate path |
|---|---|
| `HarLin_Commercial/Marketing_Sales.prj/` | `C:\AI\HarLin_Commercial\Marketing_Sales.prj\` |
| `HarLin_Labs/Internal Infrastructure/Commercial/` | `C:\AI\HarLin_Labs\Internal Infrastructure\Commercial\` |
| `HarLin_Labs/Internal Infrastructure/Alfred.prj/console/` | `C:\AI\...\Alfred.prj\console\` (boards.py + test_boards.py only — Workflows-menu hook, 2026-07-12) |

Estate-side changes NOT mirrored as files here (recorded in PROGRESS docs):
Alfred.prj CHANGELOG entry (2026-07-12 Workflows/Commercial), the live CRM
store `AEOS.prj\runtime\business\aeos_events.db` (binary, created on-machine),
and catalog.sqlite ingest of the 13 Commercial descriptors.

The estate copies are canonical once confirmed by Paul (Connection Pad remains
the source of truth for hierarchy). This mirror exists so the plan is
version-controlled, reviewable as a PR, and recoverable.

Start with:
`HarLin_Commercial/Marketing_Sales.prj/COMMERCIAL_TEAM_PLAN.md`
