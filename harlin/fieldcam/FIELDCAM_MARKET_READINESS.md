# FieldCam ("HarLin Field") — Market-Readiness Review & Upgrade Plan (2026-07-06)

Priority 2 of the 2026-07-06 directive. Grounded in `FIELDCAM_VISION.md`, NEXUS
PROGRESS/CHANGELOG/TODO, and the GeoLedger package in `../geoledger/` (which carries the shared
sync/security/longevity architecture FieldCam inherits). Status 🟠 AWAITING CONFIRM.

## 1. State of the product

Android-native Kotlin capture app, build train at **0.8.24** (2026-06-24), field-proven daily
at Tunkillia; rename to **HarLin Field** (`com.harlin.field`) queued for v0.6.0. It is the
suite's mobile wedge and a standalone sellable product (Avenza+QField+Fulcrum class).

## 2. Deep-dive findings

**F1 — The June data-loss arc is GeoLedger's L-18 pattern on Android.** Three serious
silent-data-loss bugs in one month: REPLACE+UNIQUE silent delete (0.8.21 sweep), carousel
`replaceByKey` depth-overwrite (13 vein rows, recovered), Structure blank-overwrite —
**TKB0559D lost 447/450 structure rows unrecoverably** (0.8.24 fix via central
`ContentGuard`/`CardSaveGuard`). The fixes were reactive and per-incident, same as GL's
history. **Action:** `ContentGuard` is FieldCam's gl-core moment — make it the single write
gate for every card and every Room DAO write path, with a regression test per historical
incident, and adopt the same "no write path outside the guarded API" CI grep as GL (02 §3).
A tombstone/soft-delete scheme in Room (mirroring GL schema v30) removes the unrecoverable
class entirely.

**F2 — Sync is one-directional and unauthenticated.** `TransferService → GL http_receiver.js`
(port 18765) has no auth (GL package 05 §3 threat T2) and no cross-fleet pull. **Action:**
adopt the pairing-token flow (one code, one token store shared with GL Relay), then point
TransferService at the **GL Relay** (03) instead of a single desktop: FieldCam uploads
changesets+photos to the relay like any fleet device, desktop(s) pull. This removes the
"desktop must be on the camp LAN" constraint, closes the 0.8.19/v0.6.0 outstanding items
(GEOTECH_STRUCT_SET receiver, RUN_PROCESSED/GEOLOGY_INTERVAL/SG uploads, GET endpoints for
Review) with ONE mechanism instead of per-record-type endpoint work.

**F3 — Outstanding record-type gaps** (0.8.19/v0.6.0 lists) are symptoms of per-type endpoint
duplication — the same drift pattern GL had per-card. The relay/changeset model makes record
types data, not endpoints.

**F4 — Voice + GeoLexis** remains the highest-value unbuilt differentiator (vision §3):
on-device Whisper-class transcription + GeoLexis correction → interval fields. No incumbent
mobile logger has it. Sequence after v0.6.0 rename; reuse the semantic-core synonym asset
(GL package 04 §3) so voice, search, and lexicon are one vocabulary system (Multiplier).

## 3. Market readiness specifics

- **Play Store presence** (closed track → production): signing keys in escrow scope, privacy
  policy (camera/GPS/mic), data-safety form — none exist yet; needed even for design partners.
- **Device matrix:** currently one Samsung. Define a 3-device support tier (cheap rugged,
  mid Samsung, flagship) and a monthly smoke script.
- **Offline claims audit:** verify every capture context works airplane-mode end-to-end and
  queues for relay sync (this is the differentiator — test it like one).
- **Free tier = FieldCam alone** (capture + export CSV/XLSX); paid = sync to GL + voice.
  Standalone free tier is the top-of-funnel for the whole suite (VISION §6 posture).
- **Longevity:** exports are open (XLSX/CSV, photos are files); state in the Continuity
  Charter that field captures are never hostage — same clause as GL.

## 4. Ordered plan

1. ContentGuard→single-write-gate + Room tombstones + incident regression tests.
2. Pairing auth (with GL receiver) — closes the security hole this quarter.
3. Relay client (replaces per-type endpoint backlog); retire direct-to-desktop as fallback.
4. v0.6.0 rename + Play Store closed track + privacy/data-safety pack.
5. Voice+GeoLexis MVP; then Maps decision (see PlanView §4 — recommend PV merges in).
