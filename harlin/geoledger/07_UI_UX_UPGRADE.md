# GeoLedger — UI/UX Upgrade Plan (v0.6.x)

Grounded in `Docs/UI_UX_ANALYSIS.md` (2026-04-05 — most items still open) + the Data Truth /
input-conventions invariants + field realities (gloved hands, sunlight, 11 tabs, four
operators). Objective per the directive: *the best UI in the category* — which for this
category means **fastest correct logging with the least eyes-off-core time**, not decoration.

## Wave 1 — friction killers (days, do with gl-core card refactor)

1. **Context header everywhere:** persistent breadcrumb `Project › Hole › Stage` with a large
   hole ID, current depth range, and per-stage data indicators (has-data dots). Cures the
   "which hole am I in" class of field errors — cheap and highest safety value.
2. **Toast/Banner/Modal service** (one component set): finishes the 67 remaining
   `alert()/confirm()` migrations; enables the no-blocking-dialogs invariant to be CI-enforced.
   Auto-save indicator upgraded: subtle tick → status chip with last-saved time + queued-sync
   count (operators must *see* the offline queue working — trust is a feature).
3. **`<DepthInput>` + `<DualToggle>` + `<SectionHeader>` + `<DataTable>` extraction** with the
   single input grammar (3 px drag threshold everywhere). This is the renderer half of gl-core.
4. **Density fix on GeoTech:** collapsible sections with data-count badges; Structure Set grid
   virtualised horizontally instead of overflowing.

## Wave 2 — field-grade (with v0.6.x release)

5. **Outdoor/high-contrast mode** (L2, long-promised): one theme toggle, WCAG-AA-on-glass
   contrast targets; fixes `textDim`/`textMuted` sunlight illegibility. Field toggle in the
   header, remembered per device.
6. **Keyboard-first logging:** Enter-advances-down-column, arrow navigation in interval tables,
   `/`-to-search, stage-switch hotkeys (F1–F11 = tabs). Measured target: log a GT interval
   without touching the mouse. This is the demo that makes career loggers grin.
7. **≥32 px touch targets** on all controls (tablet-in-the-shed reality).
8. **Empty states with next-action** ("No runs yet — F2 to add, or import from FieldCam").

## Wave 3 — differentiators (launch adjacents)

9. **Global semantic search bar** (04): one field, searches holes/intervals/photos/flags;
   semantic results grouped with `explain()` chips. The flagship demo moment.
10. **Flags panel as a review workflow:** filter by type/severity/hole, bulk-acknowledge with
    audit note — makes the advisory-validation philosophy *visible* as a product feature
    ("your QA queue"), not hidden plumbing.
11. **Print/PDF + audit-pack export views** — CP sign-off bundle (08) needs presentable output;
    strip logs + flags + provenance in one styled export.
12. **Onboarding:** first-run guided walkthrough (create project → hole → run → interval →
    photo), sample dataset, and a help drawer keyed by current page. Ten-minute
    time-to-first-interval is the self-serve trial gate.

## Rules that keep it "best"

- No new card ships without: gl-core consumption, blur-save, advisory validation, empty state,
  keyboard path, dark + outdoor themes. (Add to the pre-release SOP checklist.)
- One design-token module (colours/spacing/type) replacing scattered inline values — inline
  styles remain the mechanism (per CLAUDE.md rule) but values come from tokens; the stage-colour
  vocabulary becomes a single map used by Dashboard, DepthStrip, and HoleHeader.
- Every AI/auto-populated value shows its provenance chip ("from Geology 12.40–13.85") with
  one-tap override — the Data Truth Architecture made visible.
