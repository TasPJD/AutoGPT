# 04 — Action Plan: Day 0 → 30 September 2026

Sequenced, effort-estimated, and matched to the Millionaire.prj window (89 days from 2026-07-03). Assumes most build work is done by Claude Code sessions with you approving via the decision sheet; your personal hours are reserved for consulting delivery, sales conversations, and the weekly decision session.

Effort key: **h** = hours in one session · **d** = focused agent-days.

---

## Day 0–1 — Stop the bleeding (≈1 day total; do before anything else)

| # | Action | Effort | Notes |
|---|---|---|---|
| 0.1 | **PAi API lockdown**: verify Firebase ID tokens in `functions/src/index.ts` `api` handler; derive userId from token; CORS → `https://harlin--api.web.app`; deploy | 2–3h | Closes public access to your email/calendar/Firestore |
| 0.2 | **Rotate secrets** (MS client secret, Xero secret, Google OAuth secret); move to Secret Manager; purge plaintext from CONCEPT.md §5.6, index.ts, Creds.json; fix AGENTS.md "encrypted" claim; extend .gitignore | 2–3h | Rotation first, then purge — order matters |
| 0.3 | **Backups**: nightly copy of the 5 DBs (pulse, context, semantic_index, nexusboard, catalog) + `~/.claude/projects` memory to OneDrive (or R2); one restore test | 2h | The persistent brain gets persistence |
| 0.4 | **Git-init** AEOS runtime + HarLin_OS + PAi (post-purge) → private GitHub repos | 2h | REV-001 P0 item, still open |
| 0.5 | Authorise **Stripe** connector / create Stripe account | 0.5h | Gate for any self-serve revenue; currently connected nowhere |

## Week 1–2 — The Cog Sprint + the Gate Drain (parallel tracks)

### Track A: turn the cog (≈1 week of agent-days)
| # | Action | Effort |
|---|---|---|
| A.1 | Fix `mcp_server.py` NameError (aeos_nexusboard, aeos_file_search) + smoke test all 8 tools | 1h |
| A.2 | Fix `get_modified_files()` Windows `find` bug (os.walk/mtime or transcript-derived) | 2h |
| A.3 | Generalise transcript discovery to all `~/.claude/projects/*` | 3h |
| A.4 | Extract `aeos_paths.py`; refactor the 9+ hardcoded-path scripts onto it | 1d |
| A.5 | Wire PatternEngine per WIRING.md (SessionStart injection + 2 gateway tools) | 0.5d |
| A.6 | AutoConfig v0.1: `pattern_engine.py promote <id>` — writes memory, audit log, .bak | 1d |
| A.7 | Schedule: nightly miners (PatternEngine, Lodestone), reconcile, memory_hygiene, backup — Task Scheduler or a scheduled Claude session | 2h |
| A.8 | Logging bundle: rotating-file logger replacing `except: pass`; failure-count line in Alfred briefing; re-enable heartbeat or formally retire it | 1d |
| A.9 | Pytest suite over pure functions (both frontmatter parsers, parse_summary, theme_key, classify_correction, scan_awaiting_confirm) | 1d |
| A.10 | **Milestone: first full cycle** — a real mined learning, promoted, injected into the next session, logged. Record it in COG_WATCH's turned-cog log (currently empty) | — |

### Track B: drain the gate (≈2 days + 30 min of Paul)
| # | Action | Effort |
|---|---|---|
| B.1 | Generate the Gate Register from all TODO.md 🟠 items (catalog query, not glob) | 0.5d |
| B.2 | Triage: auto-classify FYI-confirmations vs real decisions; batch-confirm the former in one Paul pass | 0.5d + 30min Paul |
| B.3 | Adopt **default-with-veto** for reversible in-doctrine actions (72h veto window); document as amendment to TRACKING_PROTOCOL | 2h + Paul sign-off |
| B.4 | Weekly 30-min decision session: PAi/Telegram delivers the open decision brief every Friday | 0.5d |
| B.5 | Paul answers 05_DECISION_SHEET (~10 items, defaults provided) | 30–60min Paul |

### Track C: PAi right-sizing (≈1 week, can trail into week 3)
Deploy `/chat` (it's built) → cloud-webhook Telegram bot (kill laptop pollers/VBS) → schedulers to cloud + resolve duplicate 7am briefing → wire Xero (`/finance/summary`, Friday summary, BAS countdown) → token-expiry alerting → archive `backend/`, `desktop/`, `desktop-electron/`, `mobile/`, stale MVP_STATUS. Metric from week 3: *days/week PAi changed what you did next.*

## Week 3–8 — The Revenue Push (majority of build capacity)

| # | Action | Effort | Target |
|---|---|---|---|
| R.1 | GeoLedger v0.6: close VISION.md §11 gap list; harden sync/UUID (the one real engineering risk in the wedge) | 2–3wk agent + field validation | v0.6 cut |
| R.2 | Commercial wrapper: licence, pricing (anchor vs CorePlan/DataShed), product page on harlin.com.au, trial/onboarding path that doesn't need you | 1wk | Public by mid-Aug |
| R.3 | Barton case studies ×2 (with permission) + 10-prospect outreach list from Companies.prj | 3d + Paul review | First demos Aug |
| R.4 | **S6 — Agentic Maturity Index**: finish rubric v0.1 → public page + self-assessment + LinkedIn launch post | 3–4d | Published July; markets everything |
| R.5 | ONE Millionaire stream live with Stripe checkout (default: Crucible-as-a-Service using the existing engine; S6 Pro assessment is the cheaper alternative) | 1–2wk | First dollar ≤ Aug 31 |
| R.6 | Weekly meta:revenue ratio line in Alfred's briefing | 2h | Keeps everyone honest |

Consulting pursuits (Globacore/SPMC/Ascend/Sudest/Barton) continue on your hours — the harness prepares materials, briefs, and follow-ups but never displaces delivery time.

## Week 6–12 — Consolidation (interleaved, lower priority than revenue)

| # | Action | Effort |
|---|---|---|
| S.1 | SoR Phase C **adopted**: generated PROJECT_INDEX + CP replace hand-written; archive originals | 2d |
| S.2 | SoR Phase D: `catalog scaffold` = the only birth path for .prj; Rule 12 collapses to one command | 2d |
| S.3 | SoR Phase E: per-session crawler/reconcile in Stop hook, fail-loud | 1d |
| S.4 | Drift burn-down: ~150 stub AGENTS.md via nightly batch agent sessions | 2wk background |
| S.5 | Stores 5→2 (catalog.sqlite + one DuckDB); ContextGraph becomes generated view | 1–2d |
| S.6 | Alfred → presentation layer over catalog (all numbers = queries; fixes 12-vs-11 class); drift detection consolidated into Crawler; routing parked | 1–2d |
| S.7 | One health surface: `harlin health` (merges pai_health + stress engine + gateway checks) → briefing line + Telegram on red | 1d |
| S.8 | Naming freeze + commercial naming convention (HarLin <Family> <Product>); internal codenames stay internal | Paul decision |
| S.9 | Doc-status headers (LIVE/PARTIAL/DESIGN) across architecture docs | 0.5d |
| S.10 | Design tokens: one shared brand CSS across website, PAi, Vitrine, dashboards | 1d |

## September — Prove it

- **REV-002** run by an external-lineage session (this session's successor, or a fresh remote session): same SCORECARD + meta:revenue ratio; rescind the no-trimming feedback memory first; success criteria per REV-001 (learning loop ≥7, robustness ≥5, gates <30 days, auto-promotions >0 — plus: first GeoLedger paying site beyond Barton, first stream dollar).
- **Millionaire checkpoint (Sep 30):** honest scoring against the reframed floor. Whatever the number, the estate should exit September with: a turning cog, a drained gate, a priced and public GeoLedger, one live revenue stream, and a survivable (backed-up, tested, git-tracked) brain.

## Standing cadence (after week 2, all automated)
- **Nightly:** capture→summarise→mine→reconcile→hygiene→backup (scheduled).
- **Weekly:** Friday decision session (30 min, Paul); health + meta:revenue lines in briefing; gate register refresh.
- **Monthly:** L1 area review — *scheduled by trigger, not memory* (a Routine/scheduled session, so the cadence exists even when nobody remembers it).
- **Quarterly:** L0 (REV-00N), external lineage.
