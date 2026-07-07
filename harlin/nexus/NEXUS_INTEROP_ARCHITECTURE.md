# NEXUS Interop Architecture — The Suite Bus (2026-07-07)

Answers Paul's 2026-07-07 questions: does the GL Relay account for FieldCam; are the NEXUS
products future-proofed to talk to each other (push AND pull); and how is that enforced so it
stays true. Status 🟠 AWAITING CONFIRM. Companion doc: `NEXUS_FORMATS_AND_OPEN_STRATEGY.md`.

## 1. Direct answer on the relay

**Yes — the relay was built transport-generic, and FieldCam was designed in from the start:**

- The relay reference implementation (`harlin/geoledger/reference-impl/sync-server/`, 30 tests)
  moves two things: **ordered changesets** and **content-addressed photos/blobs**. Nothing in
  it is GeoLedger-specific — any client with a device token can push and pull both. FieldCam
  becomes simply another registered fleet device: it uploads captures/changesets to the relay
  and desktops pull, which removes today's constraints (desktop must be on the camp LAN;
  receiver port 18765 unauthenticated; per-record-type endpoints).
- What is **built**: the server side, complete and tested. What is **designed but not yet
  built** (local sessions, per the FieldCam package): the FieldCam relay client, the shared
  pairing-token flow, and retiring the per-type endpoints. The FieldCam doc sequences this
  as items 2–3 of its plan.

## 2. The rule that future-proofs the suite: one bus, no bespoke pipes

The failure mode to prevent is already visible in the record: FC→GL grew per-record-type
endpoints (`RUN_ENTRY`, `TRAY_DEPTH`, `GEOTECH_STRUCT_SET`, …), each a small bespoke pipe that
drifts — the integration version of the per-card copy-paste problem. The standing rule for
every current and future NEXUS product:

> **Products never integrate with each other directly. They integrate with the contract.**
> One identity model, one transport, one changeset schema, one vocabulary. A new product that
> speaks the contract can push to and pull from every existing product on day one, including
> products that didn't exist when it was written.

The four layers of the contract:

1. **Identity & auth (who).** One pairing/token model (the relay's `fleet.json` registry) for
   every suite client — desktop, Android, script, future web SPA. Pair once, revoke centrally.
2. **Transport (how).** The relay ("**NEXUS Relay**" at suite level — same code): ordered
   changesets + content-addressed blobs + long-poll. Push = POST changeset; pull = since-cursor.
   That's the whole API surface any product ever needs. Point-to-point LAN sync (FC↔GL direct)
   remains as an offline fallback *speaking the same contract*, not a second protocol.
3. **Data contract (what).** One changeset envelope `{table, op, rowId, row, schemaVersion,
   deviceId}` with `gl-core` rules riding along: `strictInsert` field validation,
   `assertVersionCompatible` gating, tombstone semantics, advisory-flag emission. Where two
   products share a domain object, they share the TABLE (a photo is a photo; a collar is a
   collar) — no shadow copies. Product-specific tables get a namespace prefix (`fc_`, `pv_`).
4. **Vocabulary (what it means).** GeoLexis lexicon + rock boards + the semantic-core synonym
   table are versioned, signed **content packs** consumed by every product — logging, voice,
   search and map attribute forms all speak the same geology.

## 3. Push AND pull, per product (the concrete mesh)

| Product | Pushes to the bus | Pulls from the bus |
|---|---|---|
| GeoLedger | intervals, runs, flags, photos, audit events | FC/PV captures, assays (QAQC), TrayClip manifests |
| HarLin Field (+ Maps) | photos, structures, intervals, waypoints, collars | hole lists, project codes, rock boards, review data (cross-fleet Review page) |
| Semantic Core | index events | every text-bearing changeset (auto-index on save) |
| NEXUS Handover (Vitrine) | — (consumer) | photos + sidecar data for a project selection |
| TrayClip | rename/crop manifests, corner annotations (`meta_ml_training`) | hole/tray registry for naming validation |
| Reporter | generated report records | everything read-only (its whole value is pull) |
| Assay/QAQC | lab batches, QC flags | sample dispatch records from GL |
| Academy | — | sample datasets (a training org is just a fleet) |

Everything in the "pulls" column works today *architecturally* because pull = since-cursor on
the relay; per-product work is only mapping rows to UI.

## 4. Enforcement (so this stays true, per HP-13/HP-23)

- `gl-core` becomes `@nexus/core` consumed by every product (Kotlin port of the invariant
  subset for Android — small: version gate, strict fields, interval rules).
- CI check in every product repo: no HTTP calls to sibling products except the relay contract
  paths; no direct writes to another product's tables outside `strictInsert`.
- A `CONTRACT_VERSION` in `@nexus/core` with the same skip/upgrade semantics as schema
  versions — products refuse politely, never corrupt.
- New-product checklist (add to LIFECYCLE stage 3 gate): "speaks the bus" is a candidacy
  requirement, like RISK.md.
