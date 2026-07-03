# HarLin Harness Review — Working Notes (session scratch, 2026-07-03)

> Purpose: durable state for this review session. If context is compressed, resume from here.
> Deliverables will live in this directory and be pushed to branch `claude/harlin-harness-review-lyqz0a` on TasPJD/AutoGPT.

## Task
Paul asked for: (1) review HarLin_OS to orient; (2) thorough big-picture review of AEOS, PAi, Alfred + key harness parts; determine
(a) what's needed to achieve objectives, (b) how to streamline/consistentise the products, (c) how to make objectives+products best-in-market.
Proceed on own initiative. Fully document. Paul is a geologist, self-taught builder, wants strong commercial outcome.

## Access
- HarLin_MCP MCP server = read-only view of C:\AI on Paul's laptop (harlin_fs_read/list/search, harlin_orient, harlin_catalog, harlin_pulse_recent, harlin_run). Write tools exist in schema but server described read-only — untested.
- Three background review agents launched (AEOS deep-dive; PAi deep-dive; Alfred + Harness_Review/REV-001 + System of Record).

## Findings so far (my own reads)

### Orientation (HARLIN_OS.md, INFRASTRUCTURE_MAP.md, PROJECT_INDEX.md, catalog)
- Estate: 4 pillars (Consulting services / Labs products / Strategy / Operations). ~190 catalogued entities, 160 stub descriptors, 45 missing CP box.
- 4-layer stack: L4 governance (HarLin_OS docs/rules) → L3 brain (AEOS: Pulse capture, handoff, semantic index, catalog, agents) → L2 Claude Code harness (hooks, memory, MCP) → L1 human delivery (PAi, Telegram, phone tunnel).
- The "cog" = the learning loop (PatternEngine miner v0.1 built, AutoConfig gated) — capture→learn→apply not yet closed.
- Known gaps (their own map, still valid): ContextGraph has no ingestion; Alfred manual-only; ConnectionPad hand-updated ~10%; registry facts duplicated in up to 6 places by hand; System of Record catalog v0 is the intended fix; observability weak (silent hook errors).
- 15 standing rules; heavy process (Rule 12 register cascade = 7 obligations per new artefact).
- 78 items "AWAITING CONFIRM" queued on Paul — the confirmation ladder has become a decision pile (ironic: AuDHD profile = "no decision-piles").

### Commercial reality check (Millionaire.prj PROGRESS.md, 2026-06-11)
- Target reframed: AUD 200k cash + 25k MRR by 30 Sep 2026. Revenue to date: AUD 0. Streams launched: 0 of 5.
- Gated ~2 months on Paul's answers to PLAN.md §7 Q1–Q7. Calendar drift called "severe" at 32 days; now ~54 days elapsed, ~89 days remain.
- Pattern: sessions produce housekeeping/meta-work (reorg, registries, path sweeps), not revenue execution.

### Product pipeline (PRODUCT_PIPELINE.md, last updated 2026-05-08 — stale)
- GeoLedger = PRIMARY commercial wedge (PRE-PROD v0.5.3, launch H2 2026); FieldCam production; GeoLexis MVP; Vitrine, DriftGuard, GFM concept; gAIa MVP (rename pending). New: Conduit.prj/Cairn (QGIS plugin, founded 2026-07-03).
- Internal infra (AEOS, PAi, Pulse) declared internal-only 2026; productisation review 2027 H1.

### Live fragility observed
- harlin_pulse_recent failed: pulse.duckdb locked by another python process (PID 254044) — single-writer DuckDB contention, no WAL/retry. Symptom of single-laptop SPOF + no service isolation.

## Emerging synthesis themes (draft)
1. **Meta-work crowds out revenue work.** Harness is impressive but the estate's #1 objective (commercial revenue) has 0 execution. Ratio of governance docs to shipped product code is inverted.
2. **Decision bottleneck on Paul.** 78 AWAITING CONFIRM + Q1–Q7 unanswered since May. Need: batch decision surface, defaults-with-veto ("act unless vetoed in 72h"), and a weekly 30-min decision queue in PAi/Telegram.
3. **Registry sprawl → finish the System of Record.** Catalog v0 exists; make CP/PROJECT_INDEX/AGENTS.md generated views; kill hand-maintenance (Rule 12 cost is high).
4. **Naming/brand proliferation** (Alfred, Chesh, Lodestone, Crucible, Forge, Helios, Conduit, Cairn, Vitrine, gAIa…) — high cognitive + onboarding cost, dilutes commercial story.
5. **Single-laptop SPOF**; no git/CI/tests/backups story visible yet for the harness itself (agents verifying).
6. **Market context:** much of the harness duplicates what Claude Code/agent platforms now ship natively (memory, hooks, subagents, MCP); differentiation should concentrate on geoscience domain products (GeoLedger/NEXUS) where Paul has unfair advantage.

## Agent digest 1/3 received: PAi (full digest stored in synthesis; key points)
- **CRITICAL SECURITY**: (1) Cloud Functions `api` endpoint is UNAUTHENTICATED, CORS *, uses Paul's stored refresh tokens → anyone with the URL can read his Gmail/Outlook/calendar, write to Firestore, burn API credits. Fix: verify Firebase ID tokens, restrict CORS. (2) Live secrets in plaintext: MS + Xero client secrets in CONCEPT.md §5.6, Google OAuth secret hardcoded in functions/src/index.ts and Creds.json (AGENTS.md falsely says "encrypted"). Rotate + purge. (3) Prompt-injection: raw email/Telegram text → LLM → JSON.parse → Firestore execution, no schema validation.
- Reality vs vision: ~15-20% of documented vision built. Live: briefing pipeline (7am/9pm Telegram outbound), email triage (Gmail+Graph), unified calendar, brain parser, 13-page PWA. Designed-only: proactive engine, 8 autonomous workflows, 3-store memory, digital twin, 30+ integrations (actual: 5). Telegram INBOUND disabled since 2026-06-11; /chat built but NOT deployed (needs `firebase deploy`). Xero registered, never wired.
- Zero automated tests; 900-line monolith router; laptop-scheduler split-brain (VBS/BAT wrappers = flash bug, zombie processes); silent failure history; possible duplicate 7am briefing.
- Product verdict: ADHD-first "Donna" framing is genuinely differentiated as a personal exoskeleton, NOT commercial (Claude/ChatGPT native assistants eating category). Sellable asset = the playbook, not the codebase.
- Top recs: 1 lock API (hours), 2 rotate secrets (hours), 3 deploy /chat + actions, 4 cloud-side Telegram webhook (kill laptop pollers), 5 move schedulers to cloud, 6 wire Xero /finance/summary, 7 failure alerting on token expiry, 8 archive dead surface (backend/, desktop/, mobile/), 9 Zod-validate LLM outputs + tests, 10 one metric: "days/week PAi changed what Paul did next".

## Agent digest 2/3 received: Alfred + Harness_Review + SoR (key points)
- **Alfred**: ~1,100-line deterministic CLI, 4 faculties built (briefing/routing+Chesh/watch/process). Code better than typical but: pervasive silent `except:pass` (watchman fails dark), brittle prose-scraping (greps "is the cog"), found live bug (reports 12 armed plays, actually 11 — legend line counted), hardcoded paths. F2 routing is advisory theater (no dispatch behind it). F3 drift-watch duplicates Crawler/reconcile. Recommendation: REFOCUS — Alfred = presentation layer over the catalog; detection consolidated in Crawler; routing parked. 5th named character in a sprawling cast.
- **REV-001 (2026-06-12)**: verdict "best-in-class skeleton around a broken feedback loop and an oversubscribed founder". Capture 9/10 but closed-loop 3, autonomy 3, robustness 3. Design:build 2.5:1. 130+ projects, 2 earning. 6-phase uplift plan ("Beast"): P0 stop-bleeding → P1 close learning loop (THE COG) → P2 make Paul's decisions cheap → P3 self-maintaining governance → P4 consolidate → P5 harden. **Execution: plan itself still 🟠 unconfirmed since 06-12; P0 never done; instead 48h produced NORTH_STAR, 28 play dossiers, MOONSHOTS, dashboards. File activity in Harness_Review stops 06-14, Alfred 06-23.**
- **Pipeline/COG**: 28 plays, 11 armed, 0 ever ignited; every trigger = "Paul authorises". COG = C-A learning loop; miner built, 4 wiring steps remain, all awaiting Paul's nod.
- **SoR**: catalog v0 SQLite built (Phases A/B done); reconcile ran ONCE 06-13 (194 entities, 227 drift findings, 16 unregistered .prj) and never re-ran. Phases C-F remain: adopt generated views, MCP write-path, policy-as-code enforcement, auto-visibility.
- **What REV-001 missed** (agent's independent critique — very strong, use in synthesis): (1) review amplified the Paul-bottleneck it diagnosed (+15 new confirm items; P2 decision-cheapening never built); (2) design-artifact production is the avoidance behavior; (3) immune system doctrinally captured (feedback memory forbids recommending trimming); (4) independence rules violated — builder/tester/scorer same lineage, "55/55 CONFIDENT" self-graded; (5) no self-execution — cadence declared, nothing schedules it; (6) revenue graded but never centered — no metric for meta-work cost vs product/client work; (7) generated views unverified (Alfred bug fed wrong number to every briefing).

## Agent digest 3/3 received: AEOS (key points)
- Reality vs 19-component/6-layer architecture doc: 9/19 built (scorecard itself stale). Live spine: Pulse capture → Haiku summariser → session_handoff injection; catalog/SoR v0; MCP gateway (8 tools); agents (Alfred, PatternEngine UNWIRED, Lodestone, memory_hygiene, Crucible dormant, auto_review). ContextGraph was near-EMPTY for ~11 weeks until 2026-06-28 catalog projection.
- **Concrete bugs**: (1) mcp_server.py — `aeos_nexusboard` + `aeos_file_search` raise NameError (duckdb imported function-locally elsewhere, never at module scope) → 2/8 brain tools dead, proving nobody exercises them. (2) capture_session.py get_modified_files() uses Unix `find` with GNU flags on Windows → FILE_CHANGE events silently never captured. (3) Transcript capture hardcoded to `c--AI` project dir only → sessions from other cwds invisible. (4) Hardcoded absolute paths in 9+ scripts (relocation-rot: system builds machinery to clean up a failure class its own code creates). (5) except:pass everywhere, no logging. (6) Per-SessionStart full-tree `**/TODO.md` globs. (7) Two hand-rolled frontmatter parsers. (8) 5 data stores/2 engines for one laptop. (9) DuckDB single-writer contention (19-zombie-server incident; 416MB junk purge; JSONL fallback never re-ingested). (10) ZERO tests anywhere.
- Learning loop: capture partial, mining unwired (WIRING.md fully specs the fix, held for Paul), **apply = raise NotImplementedError**, no promotion has ever happened, no metrics ("1%/day improvement" thesis unmeasured).
- Heartbeat disabled since 06-11. No scheduler, no backups, no CI. Everything on one Windows laptop.
- Top recs: fix NameError (15min), fix find bug (1-2h), wire PatternEngine per WIRING.md + schedule (0.5d), aeos_paths.py config (1d), pytest suite for pure functions (1d), generalise transcript discovery (2-4h), AutoConfig v0.1 as human-in-loop promote cmd (1d), merge ContextGraph into catalog (1-2d), outcome metrics (1d), ops hygiene bundle (1d). "Highest-leverage week": items 1-4.

## STATUS 2026-07-03 (durable checkpoint)
Review pack DELIVERED + pushed (commit ca93619, 27b0891):
- 00_EXECUTIVE_SUMMARY, 01_FINDINGS, 02_RECOMMENDATIONS, 03_ANTHROPIC_COMPARISON, 04_ACTION_PLAN, 05_DECISION_SHEET, 06_GATE_REGISTER.
- Paul asked (mid-work) to add Anthropic-stack comparison → done (03).
- Paul then asked: "What can you proceed with now without my input?" → I launched 3 build-ahead agents:
  1. PAi security remediation patch doc (agent a6866ba9) — exact auth fix + secret rotation + purge list.
  2. AEOS cog-sprint patch doc (agent af6965d7) — mcp_server NameError, capture find-bug, transcript discovery, aeos_paths.py, WIRING steps.
  3. GeoLedger commercial pack draft (agent a8ad3602) — positioning, pricing, product page, case studies, GTM.
  Will save outputs as 07_PAI_SECURITY_PATCHES.md, 08_AEOS_COG_PATCHES.md, 09_GEOLEDGER_COMMERCIAL_PACK.md.
- Also built 06_GATE_REGISTER myself from Harness_Review TODO.md (batch-confirm ~10 FYIs; decisions→05; park rest w/ dates).

## What I CAN'T do without Paul (remote session, read-only MCP)
- Cannot write to his laptop disk (HarLin_MCP is read-only; write tools untested/likely denied). All code fixes delivered as patch docs for a laptop-side Claude Code session to apply.
- Cannot rotate secrets / deploy Firebase / touch Stripe (needs his consoles + auth).
- Cannot answer the genuine decisions (D1-D12 in 05).
- Stripe + Zapier connectors need his authorisation in claude.ai settings.

## FINAL STATE 2026-07-03 — all build-ahead work delivered
Full pack pushed to branch claude/harlin-harness-review-lyqz0a:
- README.md (index), 00–06 review docs, 07 PAi security patches (secrets REDACTED in repo; real values were in agent transcripts only), 08 AEOS cog patches (1-3 verified, 4 needs 2 path confirms, WIRING blocked by MCP outage), 09 GeoLedger commercial pack (draft, [NEEDS] flags).
- Gate Register (06) triaged the backlog myself.
Three build-ahead agents all completed: a6866ba9 (PAi security), af6965d7 (AEOS patches), a8ad3602 (GeoLedger).

IMPORTANT for any resuming session:
- The PAi security agent surfaced ACTUAL live secret values (Google OAuth, MS, Xero client secrets). I redacted them from 07 before committing. They are compromised regardless — rotation is mandatory. Do NOT paste real secret values into any committed file.
- MCP filesystem server was intermittently timing out late in the session (pulse.duckdb also locked by a running python process). Some secondary reads incomplete — flagged in-doc.

## SESSION 2 (Paul on laptop) — delivered
- Confirmed WIRING.md steps 1-2 + corrected ONEDRIVE_DIR literal in 08 (guess was wrong: real = "C:/Users/pauld/OneDrive - HarLin Consulting Pty Ltd/AI").
- 10_APPLY_RUNBOOK.md — single ordered local checklist (unstick Pulse PID 254044 → security → cog → survivability → gate). Tunnel-independent.
- scripts/backup_aeos.ps1, schedule_aeos_tasks.ps1, git_init_harness.ps1 (with PAi secret-purge guard).
- 11_S6_AMI_LAUNCH.md (framework + self-assessment spec + launch post).
- 12_DEFAULT_WITH_VETO_AMENDMENT.md (Tracking Protocol amendment for D3).
- README updated. All pushed (through commit c6c93b7 + this notes update).

## BLOCKED on HarLin_MCP tunnel (down/read-only, flapping all session)
- Kill PID 254044 (pulse.duckdb lock) — needs harlin_run or Paul local. Step 0 of runbook.
- Apply patches to C:\AI — needs harlin_fs_edit/write (tunnel) or Paul's local Claude Code session.
- These are the ONLY two open tasks; both are laptop-side. Runbook 10 lets Paul do them himself now.
- Stripe + Zapier connectors still need Paul's auth in claude.ai settings.

## Optional remaining (offer only)
- [ ] Glossy HTML review dashboard artifact.
- [ ] REV-002 external-review harness for September.
