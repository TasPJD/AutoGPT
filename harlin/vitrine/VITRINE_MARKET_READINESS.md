# Vitrine ("NEXUS Handover") — Market-Readiness Review & Plan (2026-07-06)

Priority 4 of the 2026-07-06 directive. Grounded in `Vitrine.prj/` VISION/PROGRESS/TODO/
BARTON_PRIORITY_PLAN + Forge research cycles. Status 🟠 AWAITING CONFIRM.

## 1. State

Self-contained HTML image-catalog-with-data viewer (84 KB) + Python builder. **Proven in
production twice** (Barton handover 2026-05-13; 2026-05-21 delta — 1,572 photos/529 MB, 221
delta photos to harlin.com.au). Strategic Option A already selected by default: **NEXUS-internal
feature ("NEXUS Handover"), not standalone SaaS** — the right call, confirmed; the standalone
market was falsified in cycle-2 red-teaming. SUITE_EXPANSION ranks it a 2-week finish.

## 2. Why its priority is higher than it looks

Every Vitrine handover sits in a client's data room and gets opened by *their* consultants,
JV partners, and acquirers — it is the suite's only artefact that markets NEXUS to people who
never installed it (08 §4 of the GeoLedger package). "Built with HarLin NEXUS" footer + a
tasteful link belongs in every build. That makes the 2-week finish one of the highest
marketing-ROI items in the whole pipeline.

## 3. Findings & actions (from the recorded v1 blocker list, sequenced)

- **V1 — Security before any wider distribution:** XSS hardening of the HTML shell
  (photo/data fields are attacker-controlled at build time — escape everything), and **EXIF
  GPS-leak stripping by default** (client photo sets leak pit/office coordinates; strip on
  build, keep originals untouched — same originals-inviolable rule as GL photos).
- **V2 — Builder productisation:** versioned CLI (`vitrine build <manifest>`), manifest schema,
  deterministic output, golden-output test. This is the "similar scripts drift" antidote —
  right now each deploy is a hand-run script.
- **V3 — Format friction:** HEIC/TIFF handling (already bit Barton with .heic strays) and
  OneDrive placeholder detection (fail loudly, don't package 0-byte stubs).
- **V4 — Shell/plug-in split:** Vitrine = generic shell (MIT open-source candidate per
  TODO), mining overlays (tray depth strips, GL sidecar data) = NEXUS plug-in. Open-sourcing
  the shell is a genuine Continuity Charter proof point ("your handover archives render from
  public code forever") at near-zero moat cost — the moat is the GL data pipeline feeding it.
  Recommend: yes, after V1 hardening. Paul's call (it is an IP-posture decision, 06 §4).
- **V5 — Deep zoom (OpenSeadragon)** — the one polish item worth doing for wow-factor in
  data rooms; the rest of the design-polish list waits for demand.

## 4. Ordered plan

1. V1 security pass (days).
2. V2 CLI + manifest + golden test (the 2-week SUITE_EXPANSION estimate covers 1+2+3).
3. Wire as GL export: "Export → Client handover (Vitrine)" straight from a project selection —
   this is when it becomes "NEXUS Handover" in the product, with the branded footer.
4. V4 open-source decision at Paul's gate; V5 deep zoom opportunistically.
