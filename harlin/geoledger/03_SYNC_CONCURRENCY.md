# GeoLedger — Multi-User Concurrency & Sync (v0.6)

**Your instinct was right: the architecture, not SharePoint, was the critical issue.**
OneDrive/SharePoint misbehaved (conflict copies L-19, stale WAL/SHM L-23, timing races L-22),
but the root cause was using an *eventually-consistent file-sync product as a message
transport*. No amount of journal-mode tuning fixes that category error. The 2026-04-08 move to
JSON changesets was the correct half of the fix; v0.6 completes it by replacing the folder with
a purpose-built relay.

## 1. What stays (deliberately)

- Per-device SQLite, offline-first. The DB never transits any cloud. Unchanged.
- Changeset format, `meta_change_log`, and **client-side merge rules 1–6** (row LWW,
  UUID-collision first-created-wins, unique-collision newer-wins, field-level name LWW,
  guarded DELETE, own-device filter). Proven across real merges; unchanged except rule 5a
  (empty-vs-populated → flag, not overwrite) which finally ships.
- cr-sqlite stays parked per the 2026-04-04 evaluation (solo-maintainer risk, 4–6 week UUID-PK
  migration, pre-1.0). Revisit triggers unchanged: >4–5 concurrent users per project needing
  live co-editing, or cr-sqlite 1.0.

## 2. What changes: GL Relay (reference implementation included, tested)

`reference-impl/sync-server/` is a working, zero-dependency Node service:

- **Total order.** Server assigns a strictly monotonic sequence to every accepted changeset.
  Clients pull `?since=<cursor>` — no directory scans, no "did OneDrive finish?" races, no
  conflict copies, ever. The cursor persists in `meta_sync_state`.
- **Authenticated fleet.** Per-device bearer tokens (hashed at rest, constant-time compare),
  admin-controlled registration and revocation. A lost laptop is a revocation, not a breach.
- **Idempotent + verifiable.** Replays return the original sequence; SHA-256 per changeset;
  append-only `index.jsonl` = transport audit trail for the JORC audit pack.
- **Long-poll** (`waitMs`) gives near-real-time fleet sync without polling storms.
- **Photos on the same channel.** Upload/download endpoints with hash verification and a
  never-overwrite rule (photos are field originals) — ends the split-channel stranded-photo
  failure mode. This also unlocks FieldCam→office sync without the desktop being on the camp LAN.
- **Deployment envelope.** Office mini-PC, AUD 5/mo VPS, or camp-laptop-as-server; data dir is
  a plain directory (backup = snapshot); TLS via env certs or reverse proxy. Designed ≤50
  devices/fleet — an order of magnitude above current need, honest about not being the
  5,000-device answer (that is the Postgres/CRDT era, and the changeset format ports forward).

## 3. Client changes (electron/sync.js)

Small and mechanical: the folder watcher/exporter becomes (a) POST after the existing 5-s
debounce with offline queue + retry (server unreachable is *normal* in the field, never an
error surfaced to the operator), (b) a since-cursor download loop feeding the existing import
code unchanged, (c) photo ingest upload. SharePoint/OneDrive remains supported as a *manual
export/import* fallback only.

## 4. Migration & fleet rollout

1. Stand up relay (office PC), register the 4–5 current devices.
2. v0.6 clients dual-write (folder + relay) for one week; verify sequence parity.
3. Cut folder transport; leave changeset archive read-only for the audit trail.
4. Decommission the OneDrive sync folder (ends the 526-stale-file prompts class).

## 5. UUID hole-collision automation (closes the manual-remap toil, R7/L-20)

The relay sees both creations; on detecting two `tbl_holes` inserts with equal
(project, hole name) and different UUIDs it emits a `HOLE_IDENTITY_CONFLICT` advisory
changeset. The client applies existing rule 2 (first-created-wins) and runs the 23-table FK
remap automatically, writing a remap record + validation flag. What took an evening at
Richard Hills becomes a logged one-click.

## 6. The 5,000-device statement (Design for the thousands)

Fleet-per-org relays (one dataDir per org) horizontally partition by construction; the global
sequence is per-fleet, which matches the merge domain (a fleet = a project's devices). At
customer counts where a hosted multi-tenant service is warranted, the relay's storage swaps to
Postgres (same API), org_id becomes the partition key (already in schema v30), and snapshots
bound changelog growth. Nothing in the client protocol changes. This paragraph belongs in the
Enterprise sales FAQ.
