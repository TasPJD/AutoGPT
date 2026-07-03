# 02 — Recommendations: the three questions answered

**Date:** 2026-07-03. Builds on 01_FINDINGS. Sequencing and effort in 04_ACTION_PLAN; decisions needing Paul in 05_DECISION_SHEET.

Your objectives, extrapolated from the estate itself (NORTH_STAR, Millionaire.prj, PRODUCT_PIPELINE, HARLIN_OS.md) and taken as given here:
- **O1 — Commercial:** near-term revenue (AUD 200k cash + 25k MRR by 30 Sep 2026) building to a strong product company (NEXUS wedge → Labs portfolio → GFM ambition).
- **O2 — The harness:** a self-improving AI operating system that compensates executive function — "if Paul has to remember, it has failed" — and eventually proves the "autonomous firm" thesis.
- **O3 — Leverage:** everything Paul knows (25 years of exploration judgment, PNG/Melanesia corpus, methodology) converted into durable, sellable assets.

---

## Question 1 — What needs to be done to achieve the objectives

### 1.1 Close the one loop that makes everything else compound (O2, then everything)
The learning loop is correctly identified as the cog. It is one focused week away, and this review de-risked it by finding the latent breakage that would have silently undermined it:

1. Fix `mcp_server.py` NameError (2 dead gateway tools) — 15 min.
2. Fix `capture_session.py` Windows `find` bug (FILE_CHANGE capture) — 1–2 h.
3. Generalise transcript discovery beyond `c--AI` — 2–4 h.
4. Apply `PatternEngine.prj/WIRING.md` steps 1–2 (SessionStart learning injection + 2 gateway tools) — half a day.
5. Build AutoConfig v0.1 as a **human-in-the-loop** `promote <id>` command (writes to memory, audit log, backup) — 1 day. Not autonomous application; just make promotion *possible*.
6. Schedule the miners + reconcile + hygiene (Windows Task Scheduler now; anything fancier later) — 2 h.

**Definition of done: one candidate learning, mined from a real session, promoted, visibly injected into the next session's handoff, and logged.** The day that happens, the system's core claim becomes true.

### 1.2 Break the founder-gate (O2; unblocks O1)
The confirmation ladder is sound *doctrine* wired to an unsound *queue*. Three changes:

- **Triage the 78 🟠 items once** (most are FYI-shipped-work, not decisions; batch-confirm those in one pass). This review's 05_DECISION_SHEET collapses what remains into ~10 genuine decisions, each with a recommended default.
- **Adopt default-with-veto for reversible, in-doctrine actions**: sessions state "doing X in 72h unless vetoed" instead of "may I X?". Keep hard gates only for the irreversible (spending, publishing, deleting, client-facing, credentials). This single convention converts the ladder from a brake into a ratchet, and it is consistent with your own TRACKING_PROTOCOL if 🟠 is redefined as "will proceed unless stopped" for the reversible class.
- **Build P2 from the Beast plan** (generated Gate Register + one-page decision briefs + a weekly 30-minute decision session delivered through PAi/Telegram). REV-001 specified it; nothing built it; it is ~2 days of work and it pays back every week forever.

### 1.3 Recenter revenue — GeoLedger is the wedge, drive it (O1)
- **GeoLedger commercial packaging sprint (weeks 3–6):** close the v0.6 gap list (VISION.md §11), then the unglamorous commercial wrapper it entirely lacks: licence + pricing (per-seat/per-project, anchored against CorePlan/DataShed — you have live competitor intel), a real product page on harlin.com.au, a trial/onboarding path that doesn't require you, and 2–3 written case studies from Barton (Challenger + Tunkillia — with permission). Barton is a paying reference customer *already in production* — that is a sales asset most seed-stage competitors would kill for.
- **Millionaire.prj: pick ONE stream and ship it.** The plan's own Crucible review ranked Crucible-as-a-Service fastest-to-first-dollar; S6 (below) is even cheaper. Either way: one stream, live payment link (this requires **Stripe** — currently connected nowhere; authorising the Stripe connector and creating the account is on the Day-0 list), first dollar before September. Five parallel streams at 0% each is a portfolio of zeros.
- **Guard your consulting pipeline** (Barton, Globacore/SPMC/Ascend/Sudest): nearest-term cash runs on your hours; the harness's job in Q3 is to *protect* those hours, not consume them.
- **Freeze new fronts.** Conduit/Cairn is a plausible product — park it as a dossier until GeoLedger's wedge is driven or a customer pulls it. Same for any new name, family, or .prj. (See streamlining.)
- **Measure the meta:revenue ratio weekly.** One number in Alfred's briefing: hours/tokens on harness-and-strategy vs product-and-client work. Nothing keeps a system honest like printing its own ratio.

### 1.4 Make the estate survivable (O2, O3)
- Git-init AEOS, PAi (post-secret-purge), HarLin_OS; push to private GitHub. Nightly DB backups (5 databases) to OneDrive/R2. Effort: half a day. This converts "one disk failure from amnesia" into an inconvenience.
- Minimal pytest suite over the pure functions (parsers, classifiers, path-resolvers) so AI agents editing the harness have a net. 1 day.
- Replace `except: pass` with log-and-continue to a rotating file + a one-line failure count in Alfred's briefing ("3 hook errors this week" — the fail-loud principle, made real). 1 day.

### 1.5 Fix PAi to its right size (O2)
Day 0: security lockdown + secret rotation (01_FINDINGS §2.1). Then one week, strictly ordered: deploy `/chat`; re-enable inbound via a **cloud webhook** Telegram bot (kills the laptop-poller failure class entirely); move remaining schedulers to cloud and resolve the duplicate-briefing question; wire Xero (`/finance/summary` + Friday summary + BAS countdown in the morning briefing — finance was the headline CONCEPT pain and it's still absent); add token-expiry alerting. Archive `backend/`, `desktop/`, `desktop-electron/`, `mobile/`, and stale status docs. Success metric: **days per week PAi changed what you did next.** Everything else in the PAi vision waits for four green weeks on that metric.

---

## Question 2 — Streamlining and consistentising

### 2.1 One source of truth — finish the SoR and let it retire the rules
The single highest-leverage streamlining move. Phases C–E, in order:
- **C, adopted:** generated PROJECT_INDEX + ConnectionPad data *replace* the hand-written ones (hand-written become read-only archives). The 34k-token PROJECT_INDEX becomes a view; the "MANY PATHS BELOW ARE STALE" banner disappears permanently.
- **D:** `catalog scaffold` becomes the only way a .prj is born — it writes AGENTS.md from template, registers the entity, creates the CP box, updates the parent, appends the CHANGELOG entry. **Rule 12's 65-minute, 7-obligation cascade becomes one command.** Rules that survive as prose should be the ones tooling can't do (judgment calls), not clerical work.
- **E:** crawler + reconcile run per-session (Stop hook) and fail loud. Drift becomes a daily two-line report instead of a quarterly archaeology project.
- Then burn down the 227-finding drift list, dominated by ~150 stub AGENTS.md files — a perfect batch job for cheap agent sessions (10/night, two weeks, done).

### 2.2 Collapse the machinery
- **Data stores 5 → 2:** catalog.sqlite (truth: entities, learnings, promotions) + one DuckDB (events + embeddings). ContextGraph formally becomes a *generated view* of the catalog; semantic_index and nexusboard fold into the event store. Removes the drift-between-brains problem and most locking incidents.
- **One config module** (`aeos_paths.py`) replacing hardcoded paths in 9+ scripts — kills the relocation-rot class the estate currently pays two subsystems to mop up.
- **One frontmatter parser, one briefing composer, one watchdog implementation** — deduplicate alfred.py/session_handoff.py/catalog.py.
- **Alfred = presentation layer over the catalog** (briefing, watch, Chesh orientation). Drift detection consolidates into Crawler; keyword routing parks until a dispatcher exists; every number Alfred prints becomes a catalog query, not a prose grep (fixes the 12-vs-11 bug class structurally).
- **One health surface:** merge `pai_health.py`, the stress engine, and gateway health into a single `harlin health` command whose summary line lands in Alfred's briefing and (on red) in Telegram.

### 2.3 Consistentise the products
- **Naming freeze + a two-tier naming system.** The cast (Alfred, Chesh, Charlie, Lodestone, Crucible, Forge, Helios, Vitrine, Cairn, Conduit, gAIa…) is delightful internally and costly externally — every name is onboarding overhead and none carries brand equity yet. Keep internal codenames if they spark joy, but the *commercial* naming should be boring and hierarchical: HarLin <Family> <Function> (e.g. "NEXUS GeoLedger", "HarLin Field"). No new names without a product that has a customer.
- **One product skeleton.** Every product/project gets the same six files (AGENTS.md, README, CHANGELOG, PROGRESS, TODO, VISION) — you're nearly there — but *generated and pre-filled by scaffold*, and nothing else at root. Session transcripts, handshakes, and narrative logs go under a standard `logs/` (Pulse already captures the substance).
- **One design system.** The brand tokens (gold #D9B44A / copper / charcoal, Inter, JetBrains Mono) exist; apply them as a single shared CSS/token file across the website, PAi PWA, Vitrine, and every dashboard — several currently freelance.
- **One delivery pattern for clients** (you have this: Vitrine + Client Portal playbook) — make every engagement use it, which turns each delivery into marketing for the format.
- **One doc-status convention:** every architecture/vision doc carries a LIVE / PARTIAL / DESIGN header (REV-001's P3.5) so the design:build ratio is visible on contact — this review repeatedly had to code-read to learn a doc was aspirational.

### 2.4 Process diet
- Batch documentation at session end via Pulse (it already summarises) instead of hand-writing PROGRESS + CHANGELOG + TODO + transcript narratives per session — generate the first drafts, hand-edit only what matters.
- Cap the standing-rule count: a new rule requires retiring or automating an old one.
- The Visibility Contract's need-gated registration is good doctrine — enforce it *through the scaffold*, not through memory.

---

## Question 3 — Being as good as or better than anything on the market

### 3.1 Where you genuinely lead today (protect and press these)
1. **GeoLedger/NEXUS — the real moat.** Offline-first + photo-first + built-in-the-field by a working economic geologist, with a live production deployment and a field-iteration loop measured in *days*. CorePlan, DataShed, Imago, AQuire compete on cloud workflow management; none has your logging UX depth, your evidence-chain instinct, or a founder who logs core with the product on active drill programs. The **S4 "evidence-grade exploration data"** framing (chain of custody for geological truth: hashes, audit trails, JORC/NI 43-101-ready provenance) is a category-defining wedge nobody in the market owns — and it converts your governance obsession into *product*.
2. **The governance layer itself.** AGENTS.md-at-every-root + Pulse capture + System-of-Record + tracking protocol is ahead of virtually all published "how to run a firm on AI agents" practice. This is S1/S6 raw material: the **Agentic Maturity Index (S6)** — your SCORECARD generalised into a published benchmark with a self-assessment tool — is the cheapest credible thought-leadership play in the estate (rubric v0.1 already drafted), markets everything else, and costs days, not months.
3. **Domain corpus + judgment (O3).** The PNG/Melanesia intelligence estate, the Balochistan library method, ExplorationPhilosophy — expertise capsules (S2) become real *after* the learning loop runs; the corpus is already licensable as briefs (S7).

### 3.2 Where the market has moved past parts of the harness (stop rebuilding these)
*Full component-by-component comparison against Anthropic's stack, with RIDE/KEEP/HYBRID verdicts: `03_ANTHROPIC_COMPARISON.md`.*

Agent platforms (Claude Code and peers) now ship natively: persistent memory, hooks, scheduled routines, subagents/orchestration, connectors to Gmail/Calendar/Drive/Xero, mobile access, and remote MCP. Practical consequences:
- **Don't extend home-built equivalents** (heartbeat schedulers, custom sync agents, bespoke session routing, PAi integration matrix). Ride the platform layer; keep your differentiated data layer (Pulse corpus, catalog, learnings) portable underneath it — which your MCP-first gateway design already gets right.
- **Re-platform PAi's assistant surface progressively onto Claude-native capabilities** (connectors + routines + memory) with your Firestore task graph and persona as the thin custom layer. The custom code that survives should be only what the platforms *can't* do: your data, your gates, your domain.
- **Cheap wins from the platform you already pay for:** Claude Code hooks can replace the VBS/BAT wrapper chain; scheduled Claude sessions can run the miners and reviews; this review itself (remote session + HarLin_MCP) is the laptop-independent pattern Phase 1.5 was reaching for.

### 3.3 The bar for "best on market", concretely
- **For the harness (internal):** the standard is *closed-loop and self-verifying* — every capture feeds a miner, every miner feeds a gated promoter, every promotion is measured, every generated number is queried not scraped, and the system reports its own failures. Nothing commercial ships this today for solo operators; your skeleton + one week of wiring genuinely reaches it. Then S6 lets you *say* so with receipts.
- **For GeoLedger (commercial):** the standard is CorePlan-class workflow polish *plus* two things they can't copy quickly — the offline/photo/voice field UX and evidence-grade provenance. v1.0 = v0.6 gap list + multi-user sync hardening (the known UUID/sync fragilities are the one genuine engineering risk in the wedge — fix before scaling seats) + commercial wrapper. Aim: 3 paying sites by Q1 2027 on Barton's reference.
- **For PAi (personal):** the standard is "the assistant reaches out correctly, daily, without maintenance." That's the security fix + cloud webhook + /chat deploy + Xero — two weeks, then stop.

### 3.4 One structural upgrade to how you work with AI (meta, but decisive)
Give the estate what it gave you in this review: **independent, adversarial, external-lineage review on a schedule.** REV-002 (September) should be run by a fresh session with no authorship stake, scored against the same SCORECARD plus a meta:revenue ratio, with the "no-trimming-recommendations" feedback memory rescinded (a standing reviewer must be allowed to repeat findings). A review function you can't be captured by is itself a best-on-market practice — almost nobody has one.
