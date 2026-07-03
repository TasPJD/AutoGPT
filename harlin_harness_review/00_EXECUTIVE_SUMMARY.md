# HarLin Harness Review — Executive Summary

**Review ID:** REV-EXT-001 (external, independent — conducted from outside the estate's own lineage)
**Date:** 2026-07-03
**Reviewer:** Claude (Fable 5), via HarLin_MCP read-only access + three parallel deep-dive agents (AEOS code-level, PAi, Alfred/Harness_Review/System-of-Record)
**Scope:** HarLin_OS, AEOS, PAi, Alfred, Harness_Review/REV-001, System of Record, Pipeline/COG, commercial state (Millionaire.prj, NEXUS/GeoLedger)

---

## The one-paragraph verdict

You have built something genuinely unusual: a governed, self-documenting AI operating environment with real production software (GeoLedger, in daily field use on Barton drill programs) living inside it. The skeleton — Pulse capture, the AGENTS.md standard, the System-of-Record catalog, the visibility doctrine — is ahead of what most professional teams run today. But the system has three compounding pathologies that are now costing you more than the harness earns: **(1) the learning loop, the system's declared purpose, has never completed a single cycle** — capture works, mining is built but unwired, application is a `NotImplementedError` stub; **(2) every path to action runs through your confirmation**, and the backlog (78 AWAITING CONFIRM items, guardrail questions unanswered since May/June) has turned a safety mechanism into the system's central bottleneck; **(3) the estate's creative energy flows into meta-work** — registries, doctrine, strategy dossiers, dashboards — while the commercial objective sits at literal zero (Millionaire.prj: 0 of 5 streams launched, AUD 0 revenue, ~89 days to target). And one urgent, unrelated-to-strategy issue: **PAi's cloud API is unauthenticated and exposes your Gmail, Outlook and calendars to anyone who finds the URL, with live client secrets committed in plaintext.** That must be fixed before anything else.

## The five headline findings

1. **SECURITY (urgent, fix today).** PAi's Cloud Functions `api` endpoint has no authentication and CORS `*`; because the email/calendar endpoints use your stored refresh tokens server-side, any internet caller can read your Gmail/Outlook/calendars, write into your Firestore, and burn your Anthropic credits. Separately, live secrets (Microsoft client secret, Xero client secret, Google OAuth secret) sit in plaintext in `CONCEPT.md` §5.6, `functions/src/index.ts`, and `Creds.json` (which AGENTS.md wrongly labels "encrypted"). Fixes are hours, not days: verify Firebase ID tokens, restrict CORS, rotate all three secrets, purge them from the files. (Full detail: 01_FINDINGS §2.)

2. **The cog has never turned.** Your own COG_WATCH correctly identifies closing the learning loop as the single highest-leverage move. The miner (PatternEngine v0.1) is built and proven against 86 summaries; the wiring is fully specified in `PatternEngine.prj/WIRING.md`; AutoConfig is a stub. Four small steps — all waiting on your nod — separate the estate from its first completed capture→learn→apply cycle. This review found additional latent breakage that would have undermined it silently: two of the eight AEOS gateway tools crash on invocation (missing `import duckdb`), file-change capture has never worked on Windows (Unix `find` on a Windows box, error swallowed), and transcript capture only sees sessions started from `C:\AI`. Roughly one focused week fixes all of it and turns the cog. (01_FINDINGS §3.)

3. **The confirmation ladder became a decision pile.** The estate was built as an executive-function prosthetic, yet it *requires* executive function to operate: 78 🟠 items, REV-001 and its uplift plan unconfirmed since 2026-06-12, PLAN.md §7 questions unanswered since 2026-05-10, 11 armed pipeline plays all triggered by "Paul authorises". The prior review diagnosed this — then added ~15 more confirm items and never built Phase 2 (the decision-cheapening machinery). The fix is structural: a generated Gate Register that collapses the backlog into ~10 real decisions with recommended defaults, plus a default-with-veto convention for the reversible ones. This review's 05_DECISION_SHEET does the first pass for you. (02_RECOMMENDATIONS §1.)

4. **Meta-work is crowding out revenue work — and nothing measures it.** In the same window that produced NORTH_STAR, 28 launch dossiers, MOONSHOTS, COG_WATCH, CLAIMS_LEDGER and multiple dashboards, zero revenue streams launched and Phase 0 of the uplift plan (12 hours of stabilisation, including the PAi credential risk) did not happen. The harness's own review found "design outruns build 2.5:1" and the response was more design. GeoLedger — the one asset with paying-customer gravity and genuine market differentiation — is the primary wedge and should absorb the majority of build capacity between now and Sep 30. (02_RECOMMENDATIONS §2.)

5. **What you have is closer to market-leading than you think — in two places, and neither is where most of the effort is going.** (a) **GeoLedger/NEXUS**: offline-first, photo-first, field-proven logging built by a working geologist is a real moat; competitors (CorePlan, DataShed, Imago, AQuire) do not have your field-iteration loop. (b) **The governance layer itself**: the AGENTS.md standard + Pulse + System-of-Record combo is ahead of nearly all published "AI-native firm" practice, and is monetisable as the S6 Agentic Maturity Index / S1 Autonomous Firm OS plays. Meanwhile the parts of the harness that replicate what Claude Code and agent platforms now ship natively (memory, scheduling, subagents, connectors) should be thinned, not extended. PAi is a personal exoskeleton, not a product — keep it, shrink it, stop designing its commercial future. (02_RECOMMENDATIONS §3.)

## What to do, in order

| Horizon | Move | Why |
|---|---|---|
| **Today** | PAi security lockdown + secret rotation; database backups | Live exposure of email/calendar; zero backups of the "persistent brain" |
| **Week 1–2** | The Cog Sprint: fix the 3 latent bugs, wire PatternEngine per WIRING.md, build AutoConfig v0.1 as a human-in-the-loop `promote` command, schedule the miners | First completed learning cycle; the system finally does what it is for |
| **Week 1–2 (parallel)** | Drain the gate: one batch session over the generated decision sheet; adopt default-with-veto for reversible items | Removes the bottleneck the whole pipeline is queued behind |
| **Week 3–8** | Revenue push: GeoLedger commercial packaging (pricing, licence, trial, website page) + the fastest Millionaire stream + publish S6 (AMI benchmark) as thought-leadership | The objective is commercial; the wedge is ready; S6 is cheap and markets the whole story |
| **Week 6–12** | Consolidation: finish SoR Phases C–E (generated views *adopted*, write-path, per-session reconcile), collapse 5 data stores → 2, Alfred → presentation layer over catalog, freeze new names/projects | Streamlining + consistency; converts 15 manual rules into tooling defaults |
| **Sep** | REV-002 with true independence (external lineage), scored against the same SCORECARD + a new meta:revenue ratio metric | Makes the review function honest and the compounding claim falsifiable |

Full sequencing with effort estimates: **04_ACTION_PLAN.md**. The ~10 decisions that genuinely need you, each with a recommended default: **05_DECISION_SHEET.md**.

## Documents in this pack

| File | Contents |
|---|---|
| `00_EXECUTIVE_SUMMARY.md` | This document |
| `01_FINDINGS.md` | Component-by-component state: AEOS, PAi, Alfred, HarLin_OS/governance, Harness_Review/REV-001, SoR, Pipeline; assets & infrastructure register; cross-cutting diagnosis |
| `02_RECOMMENDATIONS.md` | The three questions answered: achieving objectives; streamlining & consistentising; best-in-market |
| `03_ANTHROPIC_COMPARISON.md` | Component-by-component comparison against Anthropic's 2026 agent stack (Claude Code, Cowork, Routines, Workflows, Skills, connectors) with RIDE / KEEP / HYBRID verdicts |
| `04_ACTION_PLAN.md` | Day-0 / 2-week / 90-day sequenced plan with effort estimates |
| `05_DECISION_SHEET.md` | The decision backlog collapsed to ~10 real decisions with recommended defaults |
| `WORKING_NOTES.md` | Session working notes (raw digests, provenance) |

*Provenance note: every factual claim traces to files read via HarLin_MCP on 2026-07-03 or to the three agent digests recorded in WORKING_NOTES.md. Per your Ground-Truth Derivation rule (OSB-001), anything you can't verify against the filesystem should be treated as UNVERIFIED and checked before acting.*
