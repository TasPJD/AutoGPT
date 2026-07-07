# PlanView — Market-Readiness Review & Recommendation (2026-07-06)

Priority 3 of the 2026-07-06 directive. Grounded in `PlanView.prj/` VISION/PROGRESS/CRUCIBLE/
TODO and SESSION_CLOSURE_2026-06-14. Status 🟠 AWAITING CONFIRM.

## 1. State

Phone-first offline plan-view/field-map. Concept 2026-06-08 → tech locked same day (Kotlin +
Compose + Room + MapLibre; iOS later via KMP) → **PWA v0.1 dogfood prototype shipped
2026-06-14** (GeoPDF ingest, ESRI imagery, offline tile cache, GPS/waypoints, multi-tenant
IndexedDB, 40 tests green). Paul's PV-1/2/3 (install validation, Vodien deploy, first field
use) still open.

## 2. The one decision that matters: standalone vs FieldCam module

VISION §7 leaves this open. **Recommendation: PlanView becomes the Maps module of HarLin
Field (FieldCam), not a standalone app.** Reasons:
- FieldCam's roadmap already lists "Maps module (MapLibre)" — building it twice is the exact
  multiple-similar-components drift this whole review exists to end.
- Same stack (Kotlin/Compose/Room/MapLibre), same sync spine (Bridge → GL Relay), same users
  in the same field session. A separate app forces app-switching at the outcrop.
- Commercially, "maps included" strengthens the FieldCam Pro tier; a second SKU adds Play
  Store/support/branding overhead with no distinct buyer.
- The PWA remains valuable as-is: keep it as the **zero-install demo + emergency fallback**
  (works on iOS today, which native won't for a year) and the test bed for map-pack tooling.

If Paul prefers standalone (e.g. as a non-mining wedge — hikers/agronomy), the counter-case
is distribution breadth; but that violates the wedge focus (Crucible discipline risk) and is
better revisited post-GL-launch. Decision is Paul's gate; everything below is valid either way.

## 3. Findings & actions

- **P1 — Licence audit (Crucible C1) is the only launch-blocking legal item:** state-survey
  geology redistribution at fleet scale. Action: per-state licence matrix before any bundled
  map packs ship; user-fetches-own-pack is the safe default until cleared.
- **P2 — GPS drift on waypoint→GL round-trip:** adopt GL's advisory-validation pattern —
  never silently move a surveyed collar; write a validation flag on >tolerance mismatch
  (gl-core `validation.js` is directly reusable at the schema level).
- **P3 — Tile-source terms:** Google already rejected (TOS) — good catch; ESRI World Imagery
  terms need the same written check for offline caching before commercial use.
- **P4 — Map packs as content product:** curated state-geology packs (where licensed) are a
  Multiplier content asset — one engine, per-region content, possible micro-revenue.

## 4. Ordered plan

1. Paul: PV-1/2/3 (install, deploy URL, first field use) — unchanged, cheap, do now.
2. Paul: standalone-vs-module decision (recommendation above).
3. Licence matrix (P1) + tile-terms check (P3).
4. If module: port PWA ingest/cache logic into FieldCam's Maps tab on the FC v0.6.0 train;
   PWA demoted to demo/fallback. If standalone: native v0.1 per PV VISION, sharing the
   relay client and pairing auth from the FieldCam plan.
5. GL round-trip (traverse/collar/station/sample) through the relay changeset path — not
   bespoke endpoints (same lesson as FieldCam F3).
