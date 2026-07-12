# Research Findings B — Benchmarks, Reliability Practice, and a Self-Benchmark KPI Set for Alfred/AEOS/Harness

**Leg B of the Monthly Progress Report research series — Pillar 2 (Technical Performance)**
Prepared 2026-07-12. All named suites and practices are cited; no scores are reproduced or invented. Where no like-for-like peer data exists, the recommendation is vs-self-over-time, with reasoning given.

---

## 1. Landscape Survey

### 1a. Agentic benchmarks — what each measures and what harness it assumes

| Suite | What it measures | Harness it assumes | Citation |
|---|---|---|---|
| **GAIA** | Multi-step "assistant" questions requiring reasoning, web browsing, multi-modality, and tool use; graded against unambiguous single answers. Conceptually easy for humans, hard for AI. | A general assistant with web browser, code interpreter, and file-reading tools; single-shot Q→A with exact-match scoring. | [arXiv:2311.12983](https://arxiv.org/abs/2311.12983) |
| **AgentBench** | LLM-as-agent reasoning and decision-making across 8 interactive environments (OS shell, database, knowledge graph, card game, lateral-thinking puzzles, household/ALFWorld, web shopping, web browsing). | Text-in/text-out LLM dropped into standardized simulated environments; measures the *model*, not a bespoke harness. | [arXiv:2308.03688](https://arxiv.org/abs/2308.03688) |
| **SWE-bench** | Resolving real GitHub issues in real Python repos; patch is applied and judged by the repo's own tests. | A code-editing agent with repo checkout, file edit, and test-execution ability. | [arXiv:2310.06770](https://arxiv.org/abs/2310.06770) |
| **SWE-bench Verified** | Human-validated 500-task subset removing ambiguous/broken items — a cleaner measure of the same skill. | Same as SWE-bench; curated for scoring reliability. | [OpenAI announcement](https://openai.com/index/introducing-swe-bench-verified/) |
| **SWE-bench Live** | Continuously refreshed, contamination-resistant issue set; tests generalization to genuinely unseen issues (scores drop sharply vs Verified, suggesting overfitting to the static set). | Same agent shape; automated monthly curation pipeline. | [arXiv:2505.23419](https://arxiv.org/abs/2505.23419) |
| **τ-bench (tau-bench)** | Agent + simulated *user* conversation in retail/airline domains with domain policy rules; success = final database state matches goal state. Introduces **pass^k** — probability the agent succeeds on *all* of k independent trials — as a *reliability* (consistency) metric, not just capability. | Function-calling agent with domain APIs, policy document, and an LLM-simulated customer. | [arXiv:2406.12045](https://arxiv.org/abs/2406.12045), [GitHub](https://github.com/sierra-research/tau-bench) |
| **τ²-bench (tau2-bench)** | Dual-control extension (telecom domain): both agent *and* user hold tools and act on shared state; measures coordination, guiding a user, multi-turn communication — modeled as a Dec-POMDP. | Agent and user simulator with disjoint tool access; programmatic state verification. | [arXiv:2506.07982](https://arxiv.org/abs/2506.07982) |
| **WebArena** | Long-horizon tasks on realistic self-hosted websites (e-commerce, forum, GitLab, CMS); functional-correctness checks on end state. | Browser-driving agent in a reproducible sandboxed web environment. | [arXiv:2307.13854](https://arxiv.org/abs/2307.13854) |
| **OSWorld** | Open-ended real-computer tasks across OSes/applications with execution-based evaluation scripts. | Multimodal agent controlling a full desktop VM (screenshot + keyboard/mouse or a11y tree). | [arXiv:2404.07972](https://arxiv.org/abs/2404.07972) |
| **TheAgentCompany** | 175 long-horizon "digital worker" tasks (SWE, PM, data science, admin, HR, finance) in a simulated software company with GitLab/OwnCloud/Plane/RocketChat and LLM-simulated coworkers; granular checkpoints, partial credit, and **cost-per-task** reporting alongside success. | Agent with browser, code execution, and chat; sandboxed Docker company intranet. | [arXiv:2412.14161](https://arxiv.org/abs/2412.14161), [the-agent-company.com](https://the-agent-company.com/) |

**What transfers as method** (the durable takeaways for a bespoke harness):
1. **Outcome-state grading** (τ-bench, WebArena): judge success by the end state of the world, not by transcript vibes.
2. **Repeat-trial reliability** (τ-bench's pass^k): a harness that succeeds *sometimes* is different from one that succeeds *dependably*; measure consistency, not just capability.
3. **Checkpointed partial credit + cost per task** (TheAgentCompany): long tasks deserve milestone scoring and an efficiency denominator.
4. **Contamination/refresh discipline** (SWE-bench Live): a fixed private test set goes stale; rotate or refresh the selftest corpus.
5. **Human-anchored task realism** (GAIA): the right test items are things the operator actually asks, with unambiguous checkable answers.

### 1b. Reliability / ops practice — SRE and LLM observability norms

- **SRE SLI/SLO/error-budget canon.** Google's SRE Book defines Service Level Indicators (carefully chosen quantitative measures — typically availability, latency percentiles, error rate, throughput), Service Level Objectives (targets over a window), and error budgets (the allowed unreliability = 1 − SLO, spent deliberately). Latency is conventionally reported as percentile distributions (median + tail, e.g. p95/p99) because averages hide tail pain. ([Google SRE Book, "Service Level Objectives"](https://sre.google/sre-book/service-level-objectives/); [SRE Workbook, "Implementing SLOs"](https://sre.google/workbook/implementing-slos/).) Applied to LLM-backed services, the emerging consensus is that **task-completion rate is the closest analog to availability** for an agent, with latency and cost as companion SLIs.
- **OpenTelemetry GenAI semantic conventions.** The vendor-neutral standard vocabulary for LLM/agent telemetry: client spans for model calls, `invoke_agent`/`execute_tool` spans for agent lifecycle, the required metric `gen_ai.client.operation.duration` and recommended `gen_ai.client.token.usage`, plus standard attributes (provider, model, token counts, error type). Still marked "Development" status but already adopted by Datadog, New Relic, Langfuse, and major frameworks. ([OTel GenAI span conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/); [OTel blog, GenAI observability](https://opentelemetry.io/blog/2026/genai-observability/).) **Relevance to HarLin: even a flat JSONL ledger should borrow these field names so data is portable later.**
- **LLM observability platforms — the metric vocabulary.**
  - **LangSmith** distinguishes *offline* evaluation (curated datasets with reference outputs; regression/benchmark/unit testing) from *online* evaluation (scoring live traffic without references; drift and anomaly detection). ([LangSmith evaluation concepts](https://docs.langchain.com/langsmith/evaluation-concepts).)
  - **Langfuse** (open source) centers tracing plus cost and latency broken down by user, session, model, and prompt version; supports LLM-as-judge, code evaluators, and human feedback as score channels. ([Langfuse observability docs](https://langfuse.com/docs/observability/overview); [token & cost tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking).)
  - **Arize** codifies the agent-metric trio most relevant here: **task success rate** (completed correctly end-to-end without human help), **human-intervention rate** — with a three-way taxonomy of interventions: *corrections* (agent was wrong), *completions* (agent couldn't finish), *overrides* (agent was fine, human chose differently) — and **cost per resolution** (total agent cost ÷ successful task outcomes, inclusive of retries and tool calls). ([Arize, "Agent evaluation metrics"](https://arize.com/resource-hub/agent-evaluation-metrics/).)
  - **Anthropic's own guidance** on agent evals emphasizes grading outcomes over transcripts and building small, owned eval sets from real usage. ([Anthropic Engineering, "Demystifying evals for AI agents"](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents).)

### 1c. Storage / efficiency norms — thinner, but not empty

This area is genuinely less standardized; there is no widely accepted "storage footprint" benchmark for agent systems. What exists:

- **Context/token efficiency as a cost lever.** Anthropic's context-engineering guidance treats context as a finite budget to be curated (compaction, structured note-taking, sub-agents) ([Anthropic Engineering, "Effective context engineering for AI agents"](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)); recent work quantifies that a large share of agent context (especially accumulated tool results) is removable without performance loss ([arXiv:2606.10209, "Less Context, Better Agents"](https://arxiv.org/pdf/2606.10209)). The practical metric norm is **tokens per task** and **cost per task**, not bytes on disk.
- **Memory-tier architecture.** MemGPT established the now-common framing of a small in-context working set backed by larger external storage with paging ([arXiv:2310.08560](https://arxiv.org/abs/2310.08560)) — the relevant *ratio* to watch is how much stored corpus a session actually touches.
- **Long-term memory / retrieval quality evaluation.** LoCoMo evaluates recall, multi-hop and temporal reasoning over very long multi-session dialogues ([arXiv:2402.17753](https://arxiv.org/abs/2402.17753); [project page](https://snap-research.github.io/locomo/)); RAGAS provides the standard retrieval-quality decomposition — context precision, context recall, faithfulness, answer relevance ([arXiv:2309.15217](https://arxiv.org/abs/2309.15217); [docs.ragas.io](https://docs.ragas.io/)).
- **Verdict: thin.** For a filesystem-based System-of-Record, the honest norms are (a) footprint growth tracked vs-self over time, (b) tokens/cost per task as the efficiency proxy, and (c) *optionally* a tiny RAGAS-style spot-check of whether searches over the corpus return the right files. There is no peer baseline to compare a personal harness's storage against; report it as a trend line.

---

## 2. Applicability Table — for a bespoke single-operator personal harness

**Legend:** Applicable = usable roughly as-is · Adaptable = the *method* transfers, the suite does not · Inapplicable = neither suite nor method fits this context.

| Item | Verdict | One-line reasoning |
|---|---|---|
| GAIA | **Adaptable** | Can't run the public set meaningfully (assumes a different harness, risks contamination), but its pattern — human-easy, unambiguously checkable assistant questions — is exactly how to build a private selftest corpus. |
| AgentBench | **Inapplicable** | Measures base-model ability in synthetic environments; HarLin's variable is the *harness*, not the underlying Claude model, which Anthropic already benchmarks. |
| SWE-bench / Verified | **Inapplicable** | Purpose-built for repo-issue resolution with test-suite grading; Alfred is a concierge, not a SWE agent, and scores wouldn't describe its actual workload. |
| SWE-bench Live | **Adaptable (method only)** | The refresh-to-avoid-contamination discipline transfers directly: rotate selftest items so Alfred never memorizes its own exam. |
| τ-bench | **Adaptable** | Two transferable methods: end-state grading (check the file/calendar/ledger actually changed correctly) and pass^k repeat-trial consistency for the steward selftest. |
| τ²-bench | **Inapplicable** | Dual-control user-simulation is built for customer-support products; with a single expert operator there is no user population to simulate. |
| WebArena | **Inapplicable** | Requires its sandboxed website stack; Alfred's surface is filesystem/console/MCP, not autonomous web browsing. |
| OSWorld | **Inapplicable** | Full-desktop GUI control benchmark; wrong I/O modality for a console/MCP harness. |
| TheAgentCompany | **Adaptable (method only)** | The suite needs a Docker company intranet, but checkpointed partial credit and reporting cost-per-task next to success rate is the right template for grading Alfred's long dispatches. |
| SRE SLI/SLO/error budgets | **Applicable** | Fully transferable at any scale: define SLIs (success, latency p50/p95, error count), set modest SLOs, and treat misses as an error-budget conversation with yourself. |
| OTel GenAI semantic conventions | **Applicable (as vocabulary)** | No need to run an OTel collector; adopting the standard field names in the JSONL ledger costs nothing and keeps the data portable. |
| LangSmith offline/online eval split | **Applicable (as concept)** | Maps cleanly: steward selftest = offline eval; Pulse logs + ledger = online eval; keep both and feed online failures back into the offline set. |
| Langfuse cost/latency-per-session model | **Applicable (as schema)** | Its trace→session→cost/latency rollup is exactly what the dispatch ledger + Pulse should emulate; self-hosting the platform itself is optional. |
| Arize success/intervention/cost-per-resolution trio | **Applicable** | The three metrics and the correction/completion/override intervention taxonomy work unchanged for a single operator. |
| RAGAS retrieval metrics | **Adaptable** | Full framework is overkill, but a quarterly hand-scored spot-check of "did harness search retrieve the right SoR files" borrows context precision/recall directly. |
| LoCoMo | **Inapplicable** | A research dataset of synthetic multi-session dialogues; useful to *know* the memory-consistency failure modes it tests, not to run. |
| MemGPT memory-tier framing | **Adaptable (as lens)** | The working-set-vs-archive ratio is the right way to think about SoR growth; the system itself isn't being adopted. |

**Bottom line:** every public *suite* is inapplicable as-is — they benchmark models or purpose-built agents inside their own sandboxes, and none has a peer population of bespoke personal harnesses to compare against. What transfers is **method**: end-state grading, repeat-trial consistency, refresh discipline, partial credit, cost-per-task denominators, SLI/SLO framing, and a standard telemetry vocabulary. Consequently, Pillar 2 should be measured **vs-self-over-time**, with the monthly report showing trend lines and month-deltas rather than league tables.

---

## 3. Proposed Self-Benchmark KPI Set (9 metrics, all ≤10)

All sourced from existing instruments (Console `/watch`, steward selftest, dispatch cost ledger, Pulse session logs) or flagged **not captured** with the capture path named.

| # | Metric | Definition | Source | Cadence | Aggregation |
|---|--------|-----------|--------|---------|-------------|
| 1 | **Dispatch success rate** | % of dispatches whose end state matched intent without rework (success / partial / fail / abandoned). | **Partially captured** — Pulse summarizes sessions but likely lacks a structured outcome field; add `outcome` to Pulse schema or a ledger column. | Per dispatch | Monthly % + raw counts by outcome class |
| 2 | **Human-intervention rate** | % of dispatches where the operator had to correct, finish, or override (Arize taxonomy: correction / completion / override). | **Not captured** — add one `intervention` enum to the same record as #1; cheapest high-value addition. | Per dispatch | Monthly % overall + split by type |
| 3 | **Selftest pass rate & consistency** | % of steward selftest checks passing; plus pass^k-style repeat consistency on a small fixed core (run key checks k times, count all-k-pass). | **Captured** (steward selftest) — consistency mode may need a small extension; persist results rather than discarding them. | Weekly scheduled run | % pass per run; monthly worst-run; all-k-pass fraction |
| 4 | **Latency by interaction class** | Wall-clock start→done, segmented into classes (e.g., quick-answer / standard dispatch / long-run job) — never averaged across classes. | **Partially captured** — `/watch` observes activity; needs start/end timestamps written to ledger or Pulse. | Per dispatch | Median + p95 per class, per month |
| 5 | **Error/incident count** | Count of hard failures (crashes, MCP disconnects, tool errors, wrong-action-on-world), tagged by severity (S1 damage / S2 failed task / S3 nuisance). | **Partially captured** — visible in `/watch` and Pulse narratives; needs an explicit incident line in the metrics log. | On occurrence | Monthly count by severity + one-line log of S1/S2s |
| 6 | **Harness availability (probe-based)** | % of scheduled selftest probes in which core surfaces (MCP server, console, SoR filesystem) responded correctly — a synthetic-monitoring proxy for uptime, appropriate for a system without 24/7 traffic. | **Adaptable from selftest** — run a lightweight probe subset on a timer; log pass/fail. | Hourly or daily probe | Monthly % probes passed; longest outage |
| 7 | **Cost per dispatch / per session** | API cost per dispatch (existing ledger) and per Pulse session; plus monthly total. | **Captured** (dispatch cost ledger) — join to sessions via a session/dispatch ID. | Per dispatch | Median + p95 per dispatch; monthly total; cost ÷ *successful* dispatches (cost per resolution) |
| 8 | **Usage-ceiling proximity** | Peak daily spend/tokens as % of the operator's plan or rate-limit ceiling — early warning before throttling distorts other metrics. | **Derivable** from cost ledger daily rollup + a config line stating the ceiling. | Daily rollup | Monthly max and mean daily utilization % |
| 9 | **Storage footprint & growth** | Total SoR/workspace bytes and file count, plus month-over-month delta; optionally tokens-per-dispatch as the context-efficiency companion. | **Not captured** — one `du`-style snapshot script writing a line per run; token counts likely already in ledger. | Weekly snapshot | Month-end absolute + Δ% vs prior month; median tokens/dispatch |

*Deliberately excluded to stay minimal:* retrieval quality (run as a **quarterly** hand-scored spot-check of 10 SoR searches using RAGAS-style precision/recall, not a monthly KPI) and a standalone "drift" metric (drift is read *from* this table — any KPI moving adversely for 2+ consecutive months, or selftest items that used to pass and now fail, is the drift signal; a dashboard row, not a new measurement).

**Peer comparison stance:** for #7 the only near-peer figures are per-task cost ranges published by suites like TheAgentCompany for lab agents on synthetic tasks — context is different enough that they merit at most a footnote. Everything else is vs-self: the population of Claude-based bespoke personal harnesses with published metrics is effectively zero, so trend-vs-self is not a fallback, it is the correct design.

---

## 4. Instrumentation Spec Sketch (one page)

**Principle:** one append-only JSONL metrics ledger, OTel-GenAI-flavored field names, written at dispatch close; three small side logs; one monthly rollup the report reads. No new platforms required — extend the four instruments that already exist.

### 4.1 Files (all under a single `metrics/` directory in the SoR)

| File | Writer | One record per |
|---|---|---|
| `dispatches.jsonl` | Dispatch close hook (extend the existing cost-ledger write) | dispatch |
| `selftest.jsonl` | Steward selftest (persist results it already computes) | selftest run |
| `probes.jsonl` | Scheduled lightweight probe (selftest subset) | probe |
| `storage.jsonl` | Weekly snapshot script | snapshot |
| `incidents.jsonl` | Manual/console one-liner (`/watch` annotation or console command) | incident |
| `rollup-YYYY-MM.json` | Monthly rollup script | month |

### 4.2 Record schemas (fields marked ★ are new; others exist in some form today)

**`dispatches.jsonl`** — the workhorse; extends the cost ledger:
```json
{"ts_start": "...", "ts_end": "...", "dispatch_id": "...", "session_id": "...",
 "class": "quick|standard|longrun",
 "outcome": "success|partial|fail|abandoned",        // ★ #1
 "intervention": "none|correction|completion|override", // ★ #2
 "gen_ai.request.model": "...",
 "gen_ai.usage.input_tokens": 0, "gen_ai.usage.output_tokens": 0,
 "cost_usd": 0.0, "error.type": null, "notes": ""}
```
`outcome` and `intervention` are set at close-out — either Alfred proposes and the operator confirms/edits (one keystroke), or Pulse's session summarizer emits them for operator review. Latency (#4) = `ts_end − ts_start`; cost (#7) and tokens (#9b) come free from the ledger.

**`selftest.jsonl`**: `{ts, run_id, items_total, items_passed, failed_item_ids[], k_repeats, all_k_pass_count}` — covers #3; `probes.jsonl`: `{ts, surface: "mcp|console|fs", ok, latency_ms}` — covers #6; `storage.jsonl`: `{ts, path, bytes, file_count}` — covers #9; `incidents.jsonl`: `{ts, severity: "S1|S2|S3", surface, summary, dispatch_id?}` — covers #5.

### 4.3 Rollup & what the monthly report reads

A single script (runnable by Alfred itself on a monthly trigger) scans the month's JSONL, emits `rollup-YYYY-MM.json` containing exactly the nine KPI aggregates from Section 3 plus the previous month's values and a 3-month sparkline series per KPI. **The Pillar 2 section of the monthly report reads only the rollup file**, rendering: (a) a nine-row KPI table with current value, Δ vs last month, and 3-month trend arrow; (b) the S1/S2 incident one-liners; (c) a drift call-out for any KPI adverse 2+ months running or any newly failing selftest item.

### 4.4 Hygiene rules

1. **Never delete or rewrite ledger lines** — corrections are appended as amendment records.
2. **Refresh the selftest** quarterly: retire ~20% of items, add new ones drawn from real recent dispatches that failed or required intervention (SWE-bench-Live discipline; LangSmith online→offline feedback loop).
3. **Segment before aggregating** — no latency or cost statistic is ever reported across interaction classes.
4. **First month is baseline, not judgment** — publish values with no targets; set initial SLOs (e.g., a success-rate and p95-latency objective per class) only after two months of data, per SRE Workbook guidance of measuring before targeting.

---

## Sources

**Benchmarks:** [GAIA (arXiv:2311.12983)](https://arxiv.org/abs/2311.12983) · [AgentBench (arXiv:2308.03688)](https://arxiv.org/abs/2308.03688) · [SWE-bench (arXiv:2310.06770)](https://arxiv.org/abs/2310.06770) · [SWE-bench Verified (OpenAI)](https://openai.com/index/introducing-swe-bench-verified/) · [SWE-bench Live (arXiv:2505.23419)](https://arxiv.org/abs/2505.23419) · [τ-bench (arXiv:2406.12045)](https://arxiv.org/abs/2406.12045) / [GitHub](https://github.com/sierra-research/tau-bench) · [τ²-bench (arXiv:2506.07982)](https://huggingface.co/papers/2506.07982) · [WebArena (arXiv:2307.13854)](https://arxiv.org/abs/2307.13854) · [OSWorld (arXiv:2404.07972)](https://arxiv.org/abs/2404.07972) · [TheAgentCompany (arXiv:2412.14161)](https://arxiv.org/abs/2412.14161) / [site](https://the-agent-company.com/)

**Reliability/observability:** [Google SRE Book — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) · [SRE Workbook — Implementing SLOs](https://sre.google/workbook/implementing-slos/) · [OTel GenAI span conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/) · [OTel blog — GenAI observability](https://opentelemetry.io/blog/2026/genai-observability/) · [LangSmith evaluation concepts](https://docs.langchain.com/langsmith/evaluation-concepts) · [Langfuse observability](https://langfuse.com/docs/observability/overview) / [cost tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking) · [Arize — Agent evaluation metrics](https://arize.com/resource-hub/agent-evaluation-metrics/) · [Anthropic — Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

**Storage/memory/efficiency:** [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) · [Less Context, Better Agents (arXiv:2606.10209)](https://arxiv.org/pdf/2606.10209) · [MemGPT (arXiv:2310.08560)](https://arxiv.org/abs/2310.08560) · [LoCoMo (arXiv:2402.17753)](https://arxiv.org/abs/2402.17753) / [project page](https://snap-research.github.io/locomo/) · [RAGAS (arXiv:2309.15217)](https://arxiv.org/abs/2309.15217) / [docs](https://docs.ragas.io/)
