# 01 — Findings: the state of the HarLin Harness

**Date:** 2026-07-03 · **Method:** direct reads of the estate via HarLin_MCP + three parallel deep-dive agents (AEOS at code level; PAi; Alfred + Harness_Review + System of Record). All paths relative to `C:\AI` unless noted.

---

## 1. What exists — the honest component register

Your INFRASTRUCTURE_MAP's four-layer model (L4 governance → L3 AEOS brain → L2 Claude Code harness → L1 human delivery) is accurate and good. Within it, the verified state:

### Genuinely live and load-bearing
| Component | Evidence | Note |
|---|---|---|
| Pulse capture → Haiku summariser → SessionStart handoff | `AEOS.prj/runtime/pulse/` (capture_session.py, session_summariser.py, session_handoff.py); 86+ summaries | **The spine.** This is the single most valuable piece of the harness and it works |
| Catalog / System of Record v0 | `runtime/catalog/catalog.py`, `crawler.py`; ~190 entities; SQLite | Phases A/B done; reconcile ran once (2026-06-13: 227 drift findings) and never again |
| MCP Gateway | `runtime/gateway/mcp_server.py` (8 FastMCP tools) + HarLin_MCP.prj remote surface (8/8 health, this review ran on it) | 2 of 8 gateway tools are dead-on-invocation (see §3) |
| Alfred F1 briefing | `runtime/agents/alfred.py`; consumed by `harlin_orient` | Works; scrapes prose, one live counting bug (§4) |
| memory_hygiene, auto_review, Lodestone v0, PatternEngine v0.1 | `runtime/agents/` | Built; PatternEngine/Lodestone **unwired** (manual invocation only) |
| GeoLedger + FieldCam | NEXUS.prj; GL 0.5.4, FC 0.8.18 sandbox; daily Barton Tunkillia exports | **Production software with real users.** The crown jewel |
| PAi briefing pipeline | Firebase functions; 7am/9pm Telegram outbound; email triage; unified calendar | Live but outbound-only (Telegram inbound disabled 2026-06-11; `/chat` built, undeployed) |
| Phone tunnel, ConnectionPad, governance doc set | Phone_Tunnel.prj; HarLin_OS/*.md | ConnectionPad hand-updated ~10% |

### Built-but-idle or specified-only
- **AutoConfig** (the "apply" half of the learning loop): `raise NotImplementedError`.
- **Heartbeat**: disabled since 2026-06-11. No scheduler runs anything — mining, reconcile, hygiene all depend on someone remembering, in a system built because remembering is the failure mode.
- **ContextGraph**: was effectively empty for ~11 weeks until the 2026-06-28 catalog projection; now largely a duplicate view of the catalog (+39 acknowledged stale nodes).
- **Crucible**: dormant; its first real output has awaited review since April.
- **10 of AEOS's 19 specified components** (Whisper, DataConsolidator, Metabolism, Sync, Dispatch, CompetitorRadar, ReleaseForge, ClientLedger, QueryBridge, Crawler-healer): unbuilt. The architecture doc is an April brainstorm artefact; the de facto architecture is leaner and better.
- **PAi's designed surface** (proactive engine, 8 autonomous workflows, 3-store memory, digital twin, 30+ integrations): ~15–20% built. Actual live integrations: 5.

---

## 2. PAi — including the urgent security findings

### 2.1 Security (act today)
1. **Unauthenticated public API.** `functions/src/index.ts` `api` handler: no Firebase ID-token verification, CORS `*`, client-supplied `userId`. Email/calendar endpoints use *your* stored refresh tokens server-side, so **any internet caller who finds the function URL can read your Gmail and Outlook inboxes and full calendars** (`POST /email/inbox/outlook`, `/calendar/events`), write tasks/knowledge into Firestore (`/capture/process`, `/brain/parse` — which *executes* parsed actions), and spend your Anthropic/Gemini credits (`/chat`, `/briefing/morning`). Your UID is published in PROGRESS.md and hardcoded in the source. Firestore rules are correct but irrelevant — the Admin SDK bypasses them.
2. **Live secrets in plaintext**: Microsoft client secret + Xero client secret in `CONCEPT.md` §5.6; Google OAuth client secret hardcoded in `functions/src/index.ts` (~lines 26–30) **and** in root `Creds.json` — which `AGENTS.md` incorrectly describes as "encrypted creds". `.gitignore` covers only Creds.json; the other two files are unprotected. Anything that syncs, publishes, or shares this tree leaks credentials. (This includes the OneDrive orientation Alfred publishes for Chesh, and any git init — REV-001's Phase 0 flagged "PAi git init + secrets removal" and it never happened.)
3. **Prompt-injection surface**: raw email subjects/senders and (when enabled) Telegram text are interpolated into prompts whose output is `JSON.parse`d and executed against Firestore with no schema validation. A hostile email can plausibly steer task creation or triage.

**Fixes (hours):** verify `Authorization: Bearer` Firebase ID tokens in the `api` handler and derive userId from the token; restrict CORS to `https://harlin--api.web.app`; rotate all three secrets and move them to Secret Manager (where the AI keys already live); purge plaintext copies; correct AGENTS.md; extend .gitignore.

### 2.2 Product state
- Live: morning/evening Telegram briefings (cloud-delivered), Gmail+Graph email triage, unified 4-calendar view, "brain" free-text parser, 13-page PWA, health probe script (11/11 green, the project's only test asset).
- **The interaction loop is inverted**: the ADHD value proposition is the assistant reaching *out*; today the inbound channels are all down (Telegram inbound disabled over a cosmetic window-flash bug rooted in laptop VBS/BAT wrappers; `/chat` co-pilot built 2026-06-14 but never `firebase deploy`ed — the live API is still v0.2.0).
- **Xero registered since Phase 0, never wired** — despite bills/BAS being a headline problem in CONCEPT.md.
- Zero automated tests; 900-line single-file router; briefing logic duplicated between HTTP route and scheduler (already diverged); split-brain runtime (half cloud, half Windows Task Scheduler — the least reliable component, with a 13-zombie-process/two-weeks-of-swallowed-messages incident on record); silent failure as default (`catch {}` around email/calendar fetches means a dead OAuth token quietly degrades briefings); possible duplicate 7am briefing (cloud + local both enabled per TODO.md); pinned model `claude-sonnet-4-20250514` is a year stale.
- Dead weight in-tree: superseded `backend/` Express server (with its own creds), `desktop/` (Tauri, abandoned), `desktop-electron/`, `mobile/` (Expo, never built), plus stale status docs (MVP_STATUS claims "No Remaining Blockers" and bidirectional Telegram).

### 2.3 Verdict
The "Donna model" concept — two fixed anchors + event-driven everything else, confidence-gated autonomy, capacity-adjusted planning — is genuinely sharp thinking for one specific ADHD operator. As a **personal exoskeleton** it deserves a small, reliable core. As a **product** it is being eaten from above by native Claude/ChatGPT assistants (connectors, memory, scheduled routines — several PAi integrations are now table stakes; this very review reached your Gmail, Calendar and Xero through standard connectors). The sellable asset is the playbook, not the codebase. The commercial-SaaS deferral in CONCEPT §10 was right; make it permanent.

---

## 3. AEOS — the brain, at code level

### 3.1 Concrete defects found (all verifiable)
1. **`runtime/gateway/mcp_server.py`: `aeos_nexusboard` and `aeos_file_search` raise `NameError`** — they call `duckdb.connect(...)` but `duckdb` is only imported function-locally in *other* tools, never at module scope. Two of the eight brain tools have likely never worked from the gateway — which also proves nothing exercises them.
2. **`runtime/pulse/capture_session.py: get_modified_files()` shells out to Unix `find` with GNU flags on Windows.** Windows `find.exe` is a string matcher; the call fails; the broad `except` returns `[]`. **FILE_CHANGE events have silently never been captured.**
3. **Transcript capture is hardcoded to `C:/Users/pauld/.claude/projects/c--AI`** (capture_session.py, session_summariser.py). Sessions started from any other working directory are invisible to the learning loop — a structural hole in the "captures everything" claim.
4. **Hardcoded absolute paths in 9+ scripts** (runtime root, miniconda python.exe, OneDrive dir). This is precisely the relocation-rot failure class that memory_hygiene and the RELOCATIONS register exist to clean up — the system builds machinery to mitigate a problem its own code keeps creating. No shared config module.
5. **`except Exception: pass` as policy** across alfred.py, lodestone.py, session_handoff.py — "never break the hook" is the right instinct, but with no logging fallback the watchman fails dark, contradicting REV-001's own "fail loud" principle.
6. **Performance landmines**: SessionStart globs `**/TODO.md` across all of C:\AI (with duplicated roots) on every session; Alfred does similar full-tree walks. (A single scoped search during this review timed out at 60s.)
7. **Five data stores across two engines** for one laptop (pulse.duckdb, context.duckdb, semantic_index.duckdb, nexusboard.duckdb, catalog.sqlite). DuckDB is single-writer; the 19-zombie-gateway lock incident and today's live `pulse.duckdb` lock error (observed during this review) are the predictable result. The JSONL fallback is never re-ingested. The SoR design doc specifies DuckDB; the catalog was built on SQLite — an unremarked divergence.
8. **Two hand-rolled YAML frontmatter parsers** (catalog.py, alfred.py); Haiku output parsed by line-prefix convention (breaks silently on model drift); Lodestone-watchdog and catalog-status logic copy-pasted between alfred.py and session_handoff.py.
9. **Zero tests anywhere in the runtime tree.** For code edited by AI agents under a never-break-the-hook doctrine, there is no safety net at all.
10. **No backups** of the five databases, no log rotation, no retention policy (the 416MB pulse.duckdb junk-event purge will recur once capture is fixed).

Credit where due: parameterised SQL throughout; memory_hygiene's provably-safe healing (unique-match-only, .bak backups, longest-path-first — with a caught-and-fixed prefix bug on record); crawler's fail-loud/hook-safe split; the gated AutoConfig stub with a written blast-radius rationale. The instincts are good; the engineering hygiene layer is missing.

### 3.2 The learning loop, end to end
- **Capture: partial** (one project dir; FILE_CHANGE broken; ChatGPT/Gemini/Telegram sessions never captured; fallback JSONL orphaned).
- **Learn: built, unwired, crude** (PatternEngine manual-only; deterministic word-key clustering under-clusters — acknowledged in WIRING.md; Lodestone validated on one simulated run).
- **Apply: does not exist** (AutoConfig stub; LEARNING_QUEUE.md checkboxes with no executor; no promotion audit log; no evidence any learning has ever been promoted).
- **Measure: absent** ("1% per day" is the thesis; nothing measures first-shot acceptance, correction-rate trends, or briefing usefulness; `access_count` columns exist unused).

**The loop has never completed one full cycle.** The entire remaining distance is: ~4 hours of bug fixes (items 1–3 above) + the four wiring steps already specified in `PatternEngine.prj/WIRING.md` + a human-in-the-loop `promote` command (~1 day). This is the cog, and it is roughly one focused week away.

---

## 4. Alfred

~1,100-line deterministic single-file CLI, four faculties all built (F1 briefing; F2 keyword routing + Chesh publish/intake; F3 watch; F4 external-handoff verification). Zero LLM calls, read-only with three sanctioned writes, 55/55 stress tests. Genuinely charming and better-written than typical personal-harness code — with real problems:
- **A live bug in every briefing**: `armed_plays()` counts substring occurrences of "ARMED" in PIPELINE.md; the status-ladder legend line matches, so Alfred reports **12 armed plays where the table holds 11** — a wrong number fed to you and to the published Chesh orientation for weeks, uncaught by any review. For a system whose motto is "docs are claims, the filesystem is evidence," its own generated views are unverified claims.
- **Brittle prose-scraping**: `current_cog()` greps for the literal substring "is the cog"; a copyedit to COG_WATCH.md silently blanks the briefing's top item.
- **F2 routing is advisory theatre**: a keyword table prints a recommendation nobody is bound to; there is no dispatch mechanism behind it. Its real value is the ~150-line Chesh publish/intake protocol.
- **F3 duplicates the Crawler/reconcile function** — drift detection now lives in two homes.
- Pervasive silent exception swallowing; hardcoded paths; no colocated unit tests (the stress engine was written by the same lineage it certifies).

**Right shape:** Alfred = the *presentation layer* over the catalog (briefing, watch rendering, external-AI orientation) — which is exactly SoR Phase F. Detection consolidates into Crawler; routing parks until something can actually dispatch; scraped numbers become catalog queries.

---

## 5. Governance, Harness_Review and the System of Record

### 5.1 REV-001 (2026-06-12) was right — and then the estate did the opposite
Its verdict ("best-in-class skeleton around a broken feedback loop and an oversubscribed founder"; capture 9/10, learning-loop 3, autonomy 3, robustness 3; design outruns build 2.5:1; 130+ projects, 2 earning) matches this review's independent findings almost exactly. Its 6-phase uplift plan is sound, P1 (close the loop) correctly starred. **Execution since:** the plan itself is still 🟠 unconfirmed; Phase 0's ~12 hours of stabilisation (hook logging, heartbeat, PAi git+secrets — a live credential risk) show no evidence of having happened; the following 48 hours instead produced NORTH_STAR, 28 launch dossiers, MOONSHOTS, COG_WATCH, CLAIMS_LEDGER, dashboards. File activity in Harness_Review.prj stops 2026-06-14. No REV-002, no L1 rotation ever scheduled, SCORECARD one column, the reconcile report ran once — the exact "one-off audits decay" pattern the SoR exists to kill.

### 5.2 Structural problems in the review function itself
1. **It amplifies the bottleneck it diagnosed** — the review generated ~15 new confirm items for you and never built Phase 2 (decision-cheapening).
2. **Design-artefact production is functioning as the avoidance behaviour**, and the framing never asks that question.
3. **The immune system got captured**: after NORTH_STAR reframed pruning ("cold is a temperature, not a verdict"), a feedback memory was written *so no future session recommends trimming* — the standing review is now structurally forbidden from re-raising one of its own baseline findings. Whatever the merits of the philosophy, a review that can be instructed never to repeat a finding is not adversarial.
4. **Independence rules are violated by the project itself**: the same lineage built PatternEngine/COG_WATCH/the stress engine and then certified them "55/55 CONFIDENT" — self-graded homework.
5. **No self-execution**: quarterly/monthly cadences are declared; nothing schedules them.
6. **Revenue is graded but never centered**: REV-002's success criteria are all harness-internal; nothing measures the meta:revenue work ratio or whether the harness's ~12–13k token overhead + 65-min Rule-12 compliance cost has payback.

### 5.3 System of Record
The design (AGENTS.md frontmatter → one catalog → registries as generated views → validated write path → policy-as-code + continuous reconcile; "self-correcting, not self-preventing") is the correct fix for six-places-by-hand, and v0 proves it: Phases A/B done, ~190 entities. Remaining: **C adopted** (generated PROJECT_INDEX/CP *replacing* the hand-written ones, not sitting beside them), **D** (scaffold + MCP write path), **E** (per-session crawler + fail-loud Stop hook — the actual enforcement), **F** (Alfred fully reading from catalog), plus clearing the 227-finding drift list (dominated by ~150 stub AGENTS.md files) and re-running reconcile on a schedule.

### 5.4 The rule stack
15 standing rules, mostly sound in intent, increasingly expensive in practice: Rule 12's register cascade is 7 manual obligations per new artefact (~65 min measured); empirical unprompted compliance is 10–40%. The pattern — *governance scales by rule-addition, not by automation* — is REV-001's theme #4 and it is still true. Every rule whose obligations the SoR can generate should become a tooling default, not prose.

---

## 6. Commercial state (the objective the harness serves)

- **Millionaire.prj**: reframed target AUD 200k cash + 25k MRR by 2026-09-30. As of last progress entry: **0 of 5 streams launched, AUD 0 revenue, AUD 0 capital deployed**, §7 questions Q1–Q7 unanswered since 2026-05-10, Track-6 infrastructure unshipped. ~89 days remain. The plan's own Crucible-reviewed floor probability (35–45%) was conditioned on execution starting in May.
- **GeoLedger/NEXUS**: the real asset. GL 0.5.4 + FC 0.8.18 in daily production on Barton Tunkillia; field-driven iteration loop working (0.8.13→0.8.18 in one field rotation); known sync/UUID fragilities documented; v0.6→v1.0 commercial gap list exists (VISION.md §11). Declared primary commercial wedge for H2 2026 — **which is now**. No pricing, packaging, licence, trial path, or public product page yet.
- **Consulting**: Barton engagements active (revenue-earning); Globacore/SPMC/Ascend/Sudest pursuits in flight — these are your nearest-term cash and they run on your time, not the harness's.
- **New spend of attention**: Conduit.prj/Cairn founded 2026-07-03 (day of this review) — a *sixth* product family while streams sit at zero. The idea (QGIS plugin auto-heal; freemium + $99/seat Pro) is commercially plausible and adjacent to real pain, but it is another wedge opened before any existing wedge has been driven.

## 7. Assets & infrastructure register (what you already have)

| Class | Asset | State |
|---|---|---|
| Hardware | Helios laptop (RTX 4080), Samsung field phone (RFCY326STEW), field phones ×4 (Barton) | Single-laptop SPOF for the entire brain; no automated backups found |
| Domains/web | harlin.com.au (website WIP), harlin--api.web.app (PAi), vscode.dev tunnel `harlin-helios`, planned `bridge.harlin.dev` | Named-tunnel + OAuth (HarLin_MCP Phase 1.5) is the gate to laptop-independent access |
| Cloud | Firebase (Hosting/Firestore/Functions/Auth), Cloudflare (tunnels; Workers/D1/KV/R2 available), Google Workspace, M365, OneDrive | Firebase AU region; free tiers |
| Repos | GitHub TasPJD: Nexus, GeoLedger, Help_is_Here, AutoGPT fork (+ this review branch) | AEOS/PAi/HarLin_OS **not under git** — REV-001 flagged, still true |
| APIs/accounts | Anthropic, Gemini, Telegram Bot, Xero (registered, unwired), HuggingFace (TasPJD) | Stripe not yet connected anywhere — required for first self-serve revenue |
| This session's connectors | HarLin_MCP, Gmail, Google Calendar/Drive, M365, Xero, Cloudflare, Vercel, GitHub, HuggingFace, Miro, Zoom, Quartr | **Stripe and Zapier connectors exist but need authorisation** (claude.ai connector settings) before any AI session can use them |
| Data/IP | GeoLedger production DBs + 2.5GB field photos; 135k-file semantic index; PNG/Melanesia intelligence; 304-paper Balochistan library; ExplorationPhilosophy; brand system (gold/copper/charcoal) | The PNG/Melanesia corpus is the S7 play's raw material |

## 8. Cross-cutting diagnosis (the five patterns behind all of the above)

1. **Open loops.** Capture without promotion; reviews without execution; reconcile without re-run; plays armed without ignition. The estate is superb at starting loops and has not yet closed one.
2. **The founder is the runtime.** Every consequential action awaits your confirm; the queue grows faster than it clears; the system built to *compensate* executive function currently *consumes* it.
3. **Silent failure as default.** `except: pass`, `catch {}`, disabled heartbeat, dead tools undiscovered, wrong numbers in briefings. The harness cannot currently tell you when it is broken.
4. **Generative displacement.** Under uncertainty, the estate's reflex is to produce another artefact (doctrine, dossier, dashboard, name). Each is individually good; collectively they defer the uncomfortable smaller act (deploy, wire, sell, decide).
5. **One machine, no net.** No git for the harness, no tests, no backups, no scheduler, one laptop. The "persistent brain" is one disk failure away from amnesia.

None of these is fatal; all five are addressable with the specific, mostly-small actions in 02/04. The underlying asset quality — doctrine, capture spine, GeoLedger, the domain moat — is high.
