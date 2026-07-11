# Research Brief B — Agent-System Benchmark Standards

**For:** Opus research session (light on quota; web research + contained synthesis)
**Feeds:** Phase 3 framework design (pillar 2) and the `Benchmarks/` instrumentation spec
**Output:** `Benchmarks/RESEARCH_FINDINGS_B_benchmarks.md`, cited throughout

## Context (self-contained — no re-orientation needed)

Pillar 2 of the HarLin monthly progress report measures technical performance of Alfred/AEOS/Harness — speed, accuracy, error rate, storage — both **vs peers** and **vs self over time**. Alfred is a personal AI concierge/harness (Claude-based, MCP-connected, file-system + console surface), not a public benchmark target, so the key judgment is which industry benchmarks *apply* and which need self-referential substitutes.

## Question 1 — What benchmark suites and practices exist?

Survey the established landscape:

- **Agentic benchmarks:** GAIA, AgentBench, SWE-bench (and Verified/Live variants), tau-bench/τ²-bench, WebArena/OSWorld, TheAgentCompany — what each measures and what harness it assumes.
- **Reliability/ops practice:** SRE-style SLI/SLO conventions (uptime, latency percentiles, error budgets) as applied to LLM-backed services; LLM observability norms (task success rate, intervention rate, cost per task).
- **Storage/efficiency:** any established norms for context/memory footprint and retrieval quality in agent systems (may be thin — say so if so).

**Deliverable:** an **applicable / adaptable / inapplicable** table for Alfred/AEOS/Harness, with one line of reasoning each. Expect most public suites to be *inapplicable as-is* (they benchmark models on standard tasks, not a bespoke harness on Paul's estate) — the value is in what transfers as *method*.

## Question 2 — Proposed minimal KPI set (vs self over time)

From the survey, propose a **small** (≤10 metric) self-benchmark set that can be captured from existing HarLin instrumentation (Console /watch, steward selftest, dispatch cost ledger, Pulse session logs), e.g.:

- Task/dispatch success rate; human-intervention rate
- Latency (median + p95) per interaction class
- Error/incident count; uptime; drift signals
- Cost per session / per task (ledger exists)
- Usage-ceiling proximity (quota exhaustion is a system-health event — pillar 3 overlap, note the boundary)
- Storage/memory footprint growth

For each metric: definition, source (existing vs "not captured" + what instrumentation would capture it), and cadence. Fields with no source get a capture plan, never a reconstruction (Rule #15).

**Deliverable:** the KPI table + a one-page instrumentation spec sketch for `Benchmarks/` that Phase 3 can adopt directly.

## Constraints

- Cite every suite/practice named. No invented benchmarks or scores.
- Do not run any benchmarks or produce numbers — this leg is survey + spec only.
- Keep peer comparison honest: where no like-for-like peer data exists, recommend "vs self over time" and say why.
