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

## Next steps
- [ ] Collect 3 agent digests (AEOS, PAi, Alfred/Harness_Review)
- [ ] Synthesize into review pack: 00_EXECUTIVE_SUMMARY, 01_STATE_OF_THE_HARNESS, 02_GAP_TO_OBJECTIVES, 03_STREAMLINE_CONSISTENTISE, 04_BEST_IN_MARKET_PLAY, 05_90_DAY_PLAN
- [ ] Commit + push to claude/harlin-harness-review-lyqz0a
- [ ] Consider HTML dashboard artifact for Paul
