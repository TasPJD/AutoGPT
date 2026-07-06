# GeoLedger — Market Readiness & Competitive Position (2026-07-06)

Aligned to `LIFECYCLE_STANDARD.md` stages 6–8 (the outstanding block), BUSINESS_PLAN.md §7
(Continuity by Design), and `SUITE_EXPANSION_AND_MARKETING.md` (🟠). This document is the
GeoLedger-specific launch pack input; it does not re-decide anything Paul has gated.

## 1. Competitive position (mid-2026 sweep, sourced)

- **Seequent/Bentley** consolidates everything into cloud Evo (MX Deposit → Evo → Leapfrog);
  quote-only pricing; offline is a *mode*, not the architecture. Their own conduct is our best
  sales asset: **gINT sunset** (support ended Jan 2026, perpetual licences restricted to
  one-user-one-device after 2029) is the documented case of an acquirer strangling a standard.
- **acQuire GIM Essentials (mid-2025)** — the incumbent counter-move into the junior segment.
  Take it seriously: it validates the market and will be the bake-off we lose only on
  implementation weight, price transparency, offline, photos, and AI. Prepare a direct
  comparison sheet (they still need consultant-configured SQL Server DNA; we install in
  minutes, run in a core shed with no signal).
- **IMDEX** rolled up Datarock + Krux; **GeologicAI** raised US$44M (BHP, Rio participating) —
  AI capital is flowing to *scanners and imagery*. Nobody ships semantic search over free-text
  logs (04) or a true offline-first engine at junior prices.
- Juniors still run Excel/Access — the real competitor is the spreadsheet, and the killer
  feature against it is the migration importer + validation flags on their own dirty data.

**Positioning (per the 🟠 marketing plan):** "Other tools store your geoscience data.
NEXUS understands it." Sub-lines: *Punch above your weight* (majors' firepower at junior
prices); *Your data outlives every vendor — including us* (Charter).

## 2. The endurance story (yesterday's issue → sales weapon)

Continuity by Design is already doctrine (BUSINESS_PLAN §7, seven commitments; WP-14 drafts the
public Charter). GeoLedger-specific mechanics to build so the Charter is *true in the product*:

1. Local-first by architecture (done) + **published schema** and one-click full export
   (CSV/GeoPackage/SQLite copy) — verify the export covers 100% of tables; make it a CI test.
2. **Perpetual fallback licence** encoded in the licence file format (06) — the clause is
   machine-readable, not just contractual.
3. **Escrow**: Codekeeper-class agent, deposits automated from CI, triggers = insolvency /
   sustained SLA failure. Cost ~AUD 0.5–1k/yr — book at first paying customer.
4. **Support reserve** line item (12 months product-line opex) from first revenue — show it.
5. The contrast slide: gINT/Minalytix/Imago/Datarock/Krux acquisition history vs the Charter.
   Vendor-death-proofing is the differentiator the segment's consolidation anxiety has earned.

## 3. Launch checklist (stage 6 gate — GeoLedger cut)

**Engineering (this package):** gl-core adopted · schema v30 · GL Relay in fleet use ·
strictInsert on · Electron security baseline CI-asserted · FieldCam receiver auth ·
code-signed installer + updater · golden-DB migration test · semantic search demo-ready ·
orphan-photo repair run.

**Product/commercial:** pricing page (tiers per VISION §7.1 — confirm with Paul at gate) ·
EULA + fallback clause + DPA · trial build (free tier limits enforced) · 10-minute onboarding
video + sample project · DataShed/Excel importer demo · support: ticket inbox + SLA table +
versioned docs site + release notes · billing (Paddle-class merchant of record for global tax) ·
telemetry: opt-in crash reporting only, consent screen · backup/DR runbook (customer-facing).

**Trust pack:** Continuity Charter (WP-14) · security one-pager (05 §7 skeleton) · Barton case
study (with permission) · CP audit-pack sample · insurance: PI reinstatement is R-01 priority 1
and genuinely blocks commercial launch — flagging it here as the top non-engineering blocker.

**Process:** Crucible red-team on the launch plan · legal review · Paul's pricing + launch word
(stages 6–7 are his gates; nothing here presumes them).

## 4. Client/user modalities × Nexus Suite mesh

- **Operator (field):** GL desktop + FieldCam — the wedge. Per-seat licence.
- **Geologist/CP (office):** flags review, audit pack, semantic search — the renewal reason.
- **Manager/investor (read-only):** PlanView dashboards + web SPA later — the upsell; zero-seat
  "viewer" tier priced as bait.
- **Consultant (AMC-style):** Vitrine handover packages — per-project pricing, and the channel
  by which *their other clients* see NEXUS outputs (organic distribution — weight this in
  Vitrine's priority).
- **Drilling contractor:** relay + FieldCam at the rig (Imdex-adjacent later; partnership per
  VISION §7.3).
Suite mesh: one auth/token story (05), one sync relay (03), one lexicon/vocabulary asset
(GeoLexis ↔ semantic-core), one photo pipeline (FieldCam → GL → Vitrine). Reporter
(SUITE_EXPANSION ranking #1, 3–4 weeks) consumes GL's DB read-only — fastest second SKU.

## 5. Gaps this package does NOT close (Paul's decisions or external)

- PI insurance reinstatement (R-01). — blocking, external.
- Pricing confirmation; design-partner selection (3 → 2 paying); launch word (stage gates).
- Trade-mark filings (06 §3) — needs a decision on the registered form of "NEXUS".
- The 10 open decisions listed in VISION_INDEX.md.
- Continuity Charter publication (WP-14 drafting can be next session's deliverable).
