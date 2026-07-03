# 06 — Gate Register: the 🟠 backlog triaged

**What this is.** A first pass at the "make Paul's decisions cheap" machinery (REV-001 Phase 2, never built). It takes the 🟠 AWAITING CONFIRM items from `Harness_Review.prj/TODO.md` (the densest gate cluster; Alfred reports 78 across the estate) and sorts each into one of three buckets so you can clear most of them in a single reading pass rather than one-at-a-time over weeks.

**Buckets:**
- **✅ BATCH-CONFIRM** — an FYI of already-shipped, in-doctrine, reversible work. Recommended action: bulk 🟢. No real decision; confirming just tells the system "seen, fine."
- **🎯 DECISION** — a genuine choice with consequences; routed to `05_DECISION_SHEET.md`.
- **⚫ PARK** — real but not now; give it an explicit revisit date instead of leaving it silently open.

*This is a proposal from an external reviewer, generated from a file read on 2026-07-03. Per your Ground-Truth rule, treat it as UNVERIFIED until a laptop-side session regenerates it from the live catalog. But the classification logic is sound and you can act on the batch-confirm bucket immediately.*

---

## ✅ BATCH-CONFIRM — recommend one bulk 🟢 (with spot-checks noted)

These are notifications that reversible, on-doctrine work shipped. None needs a decision; none is irreversible; none touches money, clients, or credentials. Confirm the lot.

| Item (abbreviated) | Date | Spot-check before confirming? |
|---|---|---|
| Alfred (Concierge) F1 built, read-only, registered | 06-13 | No — but note the 12-vs-11 armed-plays bug (01_FINDINGS §4) is in this code |
| Memory hygiene checker built + run (129/282 stale flagged, read-only) | 06-13 | No — the *repair* of the 129 is separate work, still in progress |
| PatternEngine v0.1 built into AEOS, unwired, zero blast radius | 06-13 | No — wiring it is DECISION D2, not this |
| INFRASTRUCTURE_MAP.md + dashboards + duplication audit | 06-13 | No |
| CP boxes added (Harness_Review, Alfred, PatternEngine, Crawler) | 06-13 | No |
| Harness_Review.prj created (doctrine, REV-001 relocated, SCORECARD, dashboards) | 06-12 | No |
| Pipeline build-out: NORTH_STAR + 28 dossiers written | 06-13 | Light — see PARK note on the philosophy-capture question below |
| MOONSHOTS.md v1.0 delivered | 06-12 | No — *authorising probes* is separate (PARK) |
| ELEVATION_REPORT v2.0 delivered | 06-12 | No — *promoting a play* is DECISION (D6/D8) |
| S6 AMI rubric v0.1 + CLAIMS_LEDGER + COG_WATCH (autonomous elevation block) | 06-13 | Light — spot-check the cog reasoning; publishing S6 is D8 |

**Net: ~10 items → one "confirmed, seen" reply.** They've been holding a queue slot for three weeks for no decision-value.

---

## 🎯 DECISION — routed to the Decision Sheet

| Item | Maps to |
|---|---|
| System of Record: "is this THE next initiative; green-light phases" | **D5** (and it's a YES — it's the streamlining capstone) |
| REV-001 confirm + §10 guardrail questions + green-light Phase 0 | **D5** |
| Wire PatternEngine's 2 live-runtime steps (WIRING.md) | **D2** (turn the cog) |
| Adopt Nothing-Invisible as a numbered Standing Rule | **New micro-decision** — recommend YES but *enforced via scaffold, not memory* (see 02_RECOMMENDATIONS §2.4). Rule count should hold flat: automate one as you add this one |
| PAi reparent to peer-of-AEOS (graph done; physical move deferred) | **D11-adjacent** — recommend: do the logical reparent, keep physical move deferred until the cloud-webhook migration removes the 5 hardcoded scheduled-task paths anyway |

---

## ⚫ PARK — real, but give it a date, don't leave it open

| Item | Recommended disposition |
|---|---|
| Crawler/healer NAME (Plumb / Sentinel / Datum / Assay / Cairn-reserve) | **PARK to naming-freeze decision (D10).** Naming is not on the critical path; pick when the healer is actually built. Interim: call it "Crawler" (descriptive) in code |
| Sentinel/healer concept — appetite + green-light read-only v0.1 | **PARK behind D2.** The read-only detector overlaps memory_hygiene + Alfred F3 + crawler; build it *as part of* SoR Phase E consolidation, not as a separate character. Revisit after the cog turns |
| Alfred access modes / richer front-ends (VS Code / standalone) | **PARK.** `harlin_orient` (MCP) already gives every AI the briefing; a richer human front-end is polish, post-revenue. Revisit Sep |
| "Inspiring infrastructure graphic" + Jarvis-comparison graphic | **PARK / DESCOPE.** `03_ANTHROPIC_COMPARISON.md` now covers the Jarvis-comparison substance in text. A glossy graphic is nice-to-have; do it as a byproduct of the S6/website work if at all |
| Token-usage review of LLM-calling assets | **PARK to the consolidation window.** Do it alongside model-pin hygiene (S-series) — one pass: audit auto_review/summariser/briefing costs, set caps, update stale model pins. ~half a day, real savings, but not urgent |
| Repair 129 stale memory stumps | **Fold into the SoR drift burn-down** (04 §S.4) — same class of work (relocation rot), same batch-agent solution. Don't do it by hand |
| MOONSHOTS probe authorisation (MS-1 GeoGenesis, MS-4 Guild, MS-10 Family Studio) | **PARK to post-Sep.** Cheap probes are good discipline, but not while streams sit at zero. Revisit at the Sep checkpoint with revenue context |
| Schedule first L1 area review | **Convert to a Routine** (04 standing cadence) rather than a PENDING item — the whole point is it shouldn't need remembering |
| NORTH_STAR "captures your philosophy faithfully?" | **Genuine, worth 10 min** when you next read it — but see the note in 01_FINDINGS §5.2 about the anti-trimming feedback memory: confirm the *philosophy*, but rescind the clause that forbids the review from ever recommending pruning. A charter should guide the reviewer, not gag it |

---

## The mechanism going forward (so this never re-accretes)

1. **Redefine 🟠 for the reversible class** (Decision D3): reversible, in-doctrine work ships as "proceeding in 72h unless vetoed," not "awaiting confirm." That alone would have emptied most of this register automatically.
2. **Generate this register from the catalog**, not by hand — a `gate register` command that queries all TODO.md 🟠 items, auto-classifies by keywords (built/created/delivered/written → likely BATCH; decide/pick/green-light/authorise → DECISION), and renders the table. ~half a day (SoR Phase C work).
3. **Deliver it every Friday** through PAi/Telegram as the 30-minute decision session. Unanswered items get re-presented once, then auto-park with a revisit date. Nothing waits silently again.
