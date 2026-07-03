# HarLin Harness Review — REV-EXT-001

**Independent external review of the HarLin AI estate.** Conducted 2026-07-03 by Claude (Fable 5) via read-only HarLin_MCP access plus parallel deep-dive agents. Scope: HarLin_OS, AEOS, PAi, Alfred, Harness_Review/REV-001, System of Record, Pipeline/COG, and the commercial state (Millionaire.prj, NEXUS/GeoLedger).

## Read in this order

| # | Document | What it is |
|---|---|---|
| **00** | `00_EXECUTIVE_SUMMARY.md` | **Start here.** One-paragraph verdict, five headline findings, what to do in order. |
| **05** | `05_DECISION_SHEET.md` | The ~12 decisions that unblock everything, each with a recommended default. A one-line reply is enough. |
| 01 | `01_FINDINGS.md` | Component-by-component state, the security findings, cross-cutting diagnosis, assets register. |
| 02 | `02_RECOMMENDATIONS.md` | Your three questions answered: achieve objectives / streamline & consistentise / best-in-market. |
| 03 | `03_ANTHROPIC_COMPARISON.md` | Every component vs Anthropic's 2026 stack, with RIDE / KEEP / HYBRID verdicts. |
| 04 | `04_ACTION_PLAN.md` | Day-0 → 30-Sep sequenced plan with effort estimates. |
| 06 | `06_GATE_REGISTER.md` | The 🟠 backlog triaged: batch-confirm vs decide vs park. |

## Build-ahead deliverables (produced without waiting for input)

| # | Document | Ready to… |
|---|---|---|
| 07 | `07_PAI_SECURITY_PATCHES.md` | Apply the auth fix + rotate secrets (values redacted here; locations preserved). **Do first.** |
| 08 | `08_AEOS_COG_PATCHES.md` | Apply the 3 verified bug fixes + config module that turn the learning loop. |
| 09 | `09_GEOLEDGER_COMMERCIAL_PACK.md` | Draft pricing, product page, case studies, GTM for the primary wedge. |
| 10 | `10_APPLY_RUNBOOK.md` | **Single ordered checklist to execute the critical path locally** (unstick Pulse → security → cog → survivability → gate), tunnel-independent. |
| 11 | `11_S6_AMI_LAUNCH.md` | Agentic Maturity Index: framework, self-assessment tool spec, launch post — the cheapest marketing play. |
| 12 | `12_DEFAULT_WITH_VETO_AMENDMENT.md` | Draft Tracking-Protocol amendment that breaks the confirmation bottleneck (Decision D3). |

**`scripts/`** — ready-to-run PowerShell: `backup_aeos.ps1` (nightly brain backup), `schedule_aeos_tasks.ps1` (register the standing cadence), `git_init_harness.ps1` (version-control the harness, with a PAi secret-purge guard).

`WORKING_NOTES.md` holds raw agent digests and provenance.

## The three things that matter most

1. **PAi has a live security hole** (unauthenticated public API exposing Gmail/Outlook/calendars; secrets in plaintext). Patch is ready in `07`. Fix today.
2. **The learning loop has never completed a cycle** — the system's whole purpose. It's ~one focused week away; verified patches in `08`.
3. **Revenue is at zero with ~89 days to target.** GeoLedger is the ready wedge; commercial pack in `09`.

*Every factual claim traces to files read via HarLin_MCP on 2026-07-03 or to the agent digests in WORKING_NOTES.md. Per the Ground-Truth Derivation rule (OSB-001), treat anything not yet verified against the live filesystem as UNVERIFIED until checked — several items carry explicit `[NEEDS:]`/`CONFIRM` flags.*
