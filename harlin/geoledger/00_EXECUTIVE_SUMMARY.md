# GeoLedger v0.6 "Semantic Iteration" — Executive Summary (2026-07-06)

**Status: 🟠 AWAITING CONFIRM** (ships at orange per Tracking Protocol; only Paul moves to 🟢).

## What this package is

The full market-readiness deep dive you asked for: review of the whole program and its logs,
the recurring/unresolved problems, the modularisation you suspected was needed, and working
code for the three make-or-break commercial items — sync, vector search, and rule enforcement —
plus security, IP, UI/UX, and competitive/launch positioning aligned to LIFECYCLE_STANDARD
stages 6–8 and Continuity by Design.

## The five headline findings

1. **Your drift suspicion is confirmed by the record.** Rules stated as immutable (save-on-blur,
   single backup root, storage conventions, field-name verification) were each violated by later
   work; even the D-/L- registers double-assigned IDs. Fix is structural: every invariant becomes
   shared code or a failing build check — `reference-impl/gl-core` implements all of them (01 §3, 02).
2. **The vector DB was never started.** Zero artefacts in the records — it existed only as a
   vision line. It is now built: `reference-impl/semantic-core`, offline-first, explainable,
   with the GeoLexis lexicon as a shared asset (04). Competitive sweep confirms nobody ships this.
3. **Multi-user: your architecture instinct was right.** SharePoint/OneDrive aggravated it, but
   the category error was using file-sync as a message transport. The changeset design was the
   correct half; `reference-impl/sync-server` (GL Relay: authenticated, totally-ordered,
   long-polling, photo-carrying) is the other half (03). cr-sqlite stays correctly parked.
4. **Three critical designs were finished but never shipped:** tombstones (v0.5.5 plan),
   GT dual-stream integrity, sync rule 5a. All three land in one schema v30 migration (02 §4).
5. **The longevity issue is the pitch, not a weakness.** Bentley's gINT sunset + the
   Minalytix/Imago/Datarock/Krux roll-ups are the documented fear; Continuity by Design
   (already doctrine as of 2026-07-05) answers it in writing. GeoLedger-specific mechanics —
   machine-readable fallback licence, escrow from CI, 100%-export CI test — in 08 §2, 06.

## The package

| Doc | Contents |
|---|---|
| 01 | Deep-dive review: recurring problems R1–R10, unresolved register, rule-drift table, duplication map |
| 02 | v0.6 architecture: gl-core adoption plan, one-write-path rule, schema v30, CI invariant checks |
| 03 | Concurrency: GL Relay design + migration + 5,000-device statement |
| 04 | Vector/semantic layer: working design, integration, honest claims ladder |
| 05 | Security: threat model, Electron baseline, FieldCam receiver auth, SQLCipher, signing |
| 06 | IP protection: where the moat is, proportionate technical measures, legal, open-core dial |
| 07 | UI/UX: three waves from friction-killers to the semantic search bar |
| 08 | Market readiness: competition (GIM Essentials is the one to watch), endurance story, stage-6 launch checklist, suite mesh |
| reference-impl/ | gl-core, sync-server, semantic-core — zero-dependency, tested Node packages |

## What needs Paul (nothing else is blocked)

PI insurance (R-01, launch-blocking) · pricing + launch word (stage gates) · NEXUS trade-mark
form · design-partner picks · Continuity Charter sign-off (WP-14). Everything engineering-side
can proceed in local sessions from this package.
