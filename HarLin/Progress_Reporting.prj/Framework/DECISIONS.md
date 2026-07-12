# Progress Reporting — Decision Log

Paul delegated framework decisions (2026-07-12): *"You make the decisions based on the HarLin Business Plan and System level Vision and Design documents, and keep building."* Decisions below are made under that delegation; each names its grounding. Items grounded only in doctrine/context rather than a read of the Business Plan carry a **verify** flag for the doc-alignment pass (estate access was intermittently down when these were logged).

| # | Decision | Grounding | Verify? |
|---|---|---|---|
| D1 | **Currency: AUD**, whole dollars, no cents in report figures | HarLin is an Australian business (operator, accounts) | verify against Business Plan financials on next estate access |
| D2 | **Report audience: family-legible from day one.** Written so Harry, Lincoln, Madeline, Shanice, and Tim could pick it up — technical detail lives in appendices/links, the body reads as a board update | HP-39 (Family Access & Succession by Design) — settled doctrine; a succession-designed business needs succession-legible reporting | no — doctrine is sufficient |
| D3 | **Pillar 5–6 snapshot: automate on the HarLin side** (small script appending orient counts to `Reports/_snapshots.log`); manual capture only as interim | HP-40 (Commercial-Grade by Default) — a measurement system fed by hand-copying is not commercial-grade; near-zero build cost | no — doctrine is sufficient |
| D4 | **July cadence: `2026-07a` and `2026-07b` are both standalone report instances**; from 2026-08 a single monthly. `2026-07b` additionally carries the before/after comparison section (the paradigm-shift measurement) | Founding brief: the split is deliberate and boundary-marking | no — founding brief is explicit |
| D5 | **Report format: Markdown canonical in `Reports/`**, with any dashboard/visual surface built later as a proper product surface, not a disposable HTML shell | HP-40 + Rule #21 (no disposable HTML shells as product surfaces without ADR'd exception) | no |
| D6 | **Valuation method: stage-gated expected value with cost floor** as drafted in `VALUATION_FRAMEWORK.md` v0.1 — adopted as the working method; probability ladder and AV anchors remain provisional | PLAN §6 hypothesis; anti-gaming rules included | AV anchors REQUIRE Business Plan read; ladder calibration awaits Research Leg A |
| D7 | **Framework gate retained.** Delegation covers framework *design* decisions; the founding-brief gate ("Paul confirms the framework before any report is written") stays — writing reports and publishing valuation numbers still waits for Paul's word | Founding brief §3 step 4 is a gate Paul set for himself; delegation of design ≠ waiver of the gate | no — conservative reading stands unless Paul says otherwise |

## Pending on estate access (doc-alignment pass)

- Read Business Plan + system Vision/Design docs; fill AV anchors per key project in `VALUATION_FRAMEWORK.md` §2
- Verify D1; capture any Business Plan reporting conventions the template should mirror
- Confirm the key-project list (Harness, OS, PAi, Alfred/AEOS, Nexus, GFM) matches current Vision-doc framing
