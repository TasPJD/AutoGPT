# 11 — S6 Agentic Maturity Index: launch pack (DRAFT)

> **Status:** DRAFT for Paul's review, 2026-07-03. The cheapest credible thought-leadership play in the estate: it generalises your own SCORECARD into a public benchmark, markets the whole "autonomous firm" story, and costs days not months. Rubric v0.1 already exists in `Pipeline/S6_Workbench/`. Nothing here is published until you approve (Decision **D8**).

## Why S6 is the right first marketing move
- **You already did the hard part.** REV-001's SCORECARD (session capture, governance, learning loop, autonomy, robustness) is a working maturity model, applied to a real firm. Turning an internal rubric outward is far cheaper than building a new artefact.
- **It markets everything else.** A credible benchmark positions HarLin as the party that *defines* how to measure AI-run firms — which is the S1 "Autonomous Firm OS" thesis in miniature, and lends authority to GeoLedger, the consulting, and the writing.
- **It's honest.** You can publish your own scores — including the low ones (learning loop, robustness) — as a build-in-public narrative. Nobody else is scoring themselves this transparently, and that candour *is* the differentiation (per POSITIONING: confidence from track record, not hype).
- **Timing:** with Anthropic's stack (Cowork, Routines, Workflows) making agent-run work mainstream in 2026, "how mature is your AI operation, really?" is a question the market is just starting to ask. First credible framework wins the citation.

## The framework — 5 dimensions × 5 levels
Generalised from your SCORECARD. Each dimension scored 0–4 (Level 0 = ad hoc … Level 4 = self-improving).

| Dimension | What it measures | L0 | L2 | L4 |
|---|---|---|---|---|
| **1. Memory & Capture** | Does work persist across sessions/tools? | Nothing persists; every session cold-starts | Sessions captured + summarised; recalled on demand | Cross-tool, cross-year corpus auto-injected into every new session |
| **2. Governance & Record** | Is there one source of truth, enforced? | Facts live in people's heads | Documented standards, hand-maintained | Single system-of-record; registries are generated views; drift auto-reconciled |
| **3. Learning Loop** | Does the system get better from its own history? | No feedback | Patterns reviewed manually | Capture→mine→gated-promote→measure, closed and running |
| **4. Autonomy & Delegation** | How much runs without a human in the path? | Human drives every step | Agents act within confidence gates | Reversible work proceeds by default; humans decide only the irreversible |
| **5. Robustness & Observability** | Does it fail safe and tell you? | Silent failure; no tests/backups | Some tests, manual monitoring | Fails loud, self-heals within gates, tested, backed up, alerting |

**Overall maturity** = the profile across all five (radar chart), not a single number — a firm can be L4 on capture and L1 on learning (which, candidly, is roughly where HarLin sits today, and saying so is the credibility).

## The self-assessment tool
A single self-contained HTML page (no backend, works offline, hostable on harlin.com.au or as a Claude Artifact):
- 5 dimensions × ~4 questions each = ~20 questions, each mapping to a 0–4 level.
- Outputs a radar chart + a one-paragraph profile + the top-2 highest-leverage moves for that firm's profile.
- Gated email capture for a fuller PDF report (lead-gen for consulting).
- Footer: "Built by HarLin — we run our own firm on this. See our scores: [link]."
- *Build note:* this is a `dataviz`-skill radar + a scoring function; ~1 day. Brand tokens: gold #D9B44A / copper #B07A3B / charcoal #2D2D2D.

## Draft launch post (LinkedIn / harlin.com.au Insights)

> **How mature is your AI operation, really? I built an index to find out — and scored my own firm first.**
>
> Everyone's running agents now. Almost nobody can say how *well*. "We use AI" has become as meaningless as "we use computers."
>
> So I built the Agentic Maturity Index — five dimensions (Memory, Governance, Learning, Autonomy, Robustness), five levels each, from ad-hoc to self-improving. Then I scored my own firm, HarLin, and I'll show you the results including the parts that aren't flattering.
>
> We score high on capture and governance — every session is remembered, and we run a single system of record. We score *low* on the learning loop: our system captures everything and, until recently, promoted almost none of it back into how it works. That gap is the most important thing I learned this quarter, and I only saw it because I measured.
>
> That's the point of the Index: not a badge, a mirror. Most "AI-native" firms are Level 4 on the demo and Level 1 on the plumbing.
>
> Score your own operation in 5 minutes: [link]. It's free, runs in your browser, tells you the two highest-leverage things to fix. I'll publish HarLin's full scorecard and what we're doing about it over the coming weeks — build in public, including the ugly parts.
>
> — Paul Dale, HarLin Consulting

*(Voice-checked against POSITIONING: no "best-in-class"/"cutting-edge"/"powered by AI"; plain, honest, track-record-led; the candour about low scores is the differentiator.)*

## Rollout (all cheap)
1. Finish rubric v0.1 → the 5×5 table above, refined from `Pipeline/S6_Workbench/`.
2. Build the self-assessment HTML (1 day; `dataviz` skill).
3. Publish HarLin's own scorecard as the anchor case study (you have it — the REV-001 SCORECARD).
4. Launch post + the tool on harlin.com.au/insights.
5. Weekly build-in-public follow-ups as you turn the cog and the scores move (ties the marketing to the actual uplift work — each real improvement is a post).

## Guardrails
- **Publish real scores, including low ones.** The moment it looks like a self-congratulation badge, it loses the credibility that makes it work.
- **Keep it vendor-neutral.** Score the *operation*, not "how much Claude you use" — that's what makes it a benchmark others cite rather than a HarLin ad.
- **Don't over-build.** ~20 questions, one page, one radar. If it needs a login and a database, it's too heavy for a top-of-funnel asset.
- **Tie it to consulting, not product.** The AMI sells HarLin's judgment (the S1/S2 plays), not a SaaS. The gated PDF → advisory conversation is the funnel.
