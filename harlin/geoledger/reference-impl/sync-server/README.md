# GeoLedger Sync Server ("GL Relay")

A zero-dependency Node.js relay that replaces the OneDrive/SharePoint sync
folder as GeoLedger's changeset transport. Devices keep their own SQLite
databases and merge with row-level last-write-wins exactly as before — the
relay is a **durable, ordered, authenticated pipe**. It never interprets
changeset contents.

## Why it exists

Folder sync was the source of a whole class of field failures:

| Folder-sync failure | How the relay fixes it |
| --- | --- |
| OneDrive conflict copies (`changeset (1).json`, issue L-19) | Server assigns a strictly monotonic global `seq`; every peer sees one total order. Uploads are idempotent on `changesetId`, so retries never fork. |
| Stale WAL/SHM blocking sync (L-23) | Nothing watches the filesystem anymore. Devices talk plain HTTP when they have connectivity. |
| Timing races / blank pages (L-22) | Downloads are cursor-based (`since=<seq>`) — a client can never observe a half-written file or an out-of-order batch. |
| Photos stranded when the SharePoint mount was down | Photos upload directly with sha256 verification; the server never overwrites a field original. |

## Requirements

- Node.js >= 18 (uses `node:http`, `node:https`, `node:crypto`, `node:fs`,
  global `fetch` in tests).
- **Zero runtime dependencies.** `npm install` is not needed.

## Quick start

```bash
node bin/gl-sync-server.js
# [gl-sync-server] generated admin token (set GL_ADMIN_TOKEN to pin it): gla_...
# [gl-sync-server] GL Relay listening on http://0.0.0.0:8787 (dataDir: ./gl-data)
```

Register a device (admin token) and upload a changeset (device token):

```bash
curl -s -X POST http://relay:8787/api/v1/devices/register \
  -H "Authorization: Bearer $GL_ADMIN_TOKEN" \
  -d '{"deviceId":"RIG-01","deviceName":"Rig 1 Toughbook","operator":"A. Geo"}'
# → {"deviceId":"RIG-01", "token":"gld_...", ...}   ← shown once, store on the device

curl -s -X POST http://relay:8787/api/v1/changesets \
  -H "Authorization: Bearer gld_..." \
  -d '{"changesetId":"RIG-01-20260706-0001","deviceId":"RIG-01","schemaVersion":"0.6.0","payload":{...}}'
# → {"seq":42,"changesetId":"RIG-01-20260706-0001","sha256":"...","duplicate":false}
```

### Configuration (environment)

| Variable | Default | Meaning |
| --- | --- | --- |
| `GL_DATA_DIR` | `./gl-data` | Storage directory (created if missing) |
| `GL_PORT` | `8787` | Listen port |
| `GL_HOST` | `0.0.0.0` | Bind address |
| `GL_ADMIN_TOKEN` | generated + printed once | Admin bearer token |
| `GL_MAX_BODY` | `26214400` (25 MiB) | Request body cap → `413` beyond |
| `GL_TLS_CERT` / `GL_TLS_KEY` | unset | PEM paths; set both to serve HTTPS in-process |

## API

Base path `/api/v1`. JSON bodies unless noted. Errors are
`{"error":{"code":"...","message":"..."}}`.

| Endpoint | Auth | Notes |
| --- | --- | --- |
| `GET /health` | none | `{ok, seq, devices, uptime}` |
| `POST /devices/register` | admin | `{deviceId, deviceName, operator}` → `{token, ...}` (token shown once; re-register rotates) |
| `POST /devices/revoke` | admin | `{deviceId}`; idempotent; 404 for unknown device |
| `POST /changesets` | device | `{changesetId, deviceId, schemaVersion, payload}`; `deviceId` must match the token (403 otherwise); idempotent on `changesetId` (replay → `200 {seq, duplicate:true}`); success → `201 {seq, changesetId, sha256}` |
| `GET /changesets?since=&limit=&excludeDevice=&waitMs=` | device | Ordered `{items:[{seq, changesetId, deviceId, schemaVersion, sha256, payload}], nextSince, more}`. `limit` defaults 100 (max 1000). `waitMs` (≤ 60000) long-polls: the request parks until new data arrives or the window closes — event-driven, no server-side polling loop. |
| `POST /photos/<holeId>/<filename>` | device | Raw body; `Content-SHA256` header required and verified. Idempotent on identical content; same name + different content → `409` (field originals are never overwritten). |
| `GET /photos/<holeId>` | device | Manifest `{holeId, photos:[{filename, size, sha256, modifiedAt}]}` |
| `GET /photos/<holeId>/<filename>` | device | Streamed bytes with `Content-SHA256` response header |
| `GET /audit?since=&limit=` | admin | The `index.jsonl` entries — JORC-grade transport audit trail (who sent what, when, hash, size, seq) |

`holeId`, `filename`, `changesetId`, `deviceId` must match
`^[A-Za-z0-9._-]+$` with no leading dot — anything else is `400`
(this is the path-traversal guard; see SECURITY.md).

## Data directory layout

```
<dataDir>/
  fleet.json                       device registry (token *hashes* only)
  seq                              persisted sequence counter (fsync'd)
  index.jsonl                      one line per accepted changeset (audit trail)
  changesets/<seq>_<changesetId>.json
  photos/<holeId>/<filename>
  tmp/                             staging for atomic writes (safe to empty when stopped)
```

Every write is temp-file → fsync → rename → directory fsync, and on boot the
sequence counter is recovered as the max of the counter file, the index tail
and a changesets-directory scan — a crash at any point never re-issues a
`seq` and never acknowledges data that isn't durable.

## Client integration (electron/sync.js)

Replace the OneDrive folder watcher with two small loops and keep everything
else — the exported changeset format, `meta_change_log`, and the row-level
LWW merge are unchanged.

**Upload (after the existing save debounce):** where sync.js used to write
the debounced changeset file into the sync folder, POST it to
`/api/v1/changesets` instead. Use the changeset's existing id as
`changesetId` — the relay is idempotent on it, so the retry queue can be
dumb: keep the changeset in an outbox table until a 2xx/`duplicate:true`
response, then delete. `413` means split the export; `403` means the device
token and local device identity disagree — surface to the operator.

**Download loop:** persist a single integer cursor in `meta_sync_state`
(e.g. key `relay_since`). Loop:
`GET /changesets?since=<cursor>&limit=100&excludeDevice=<selfId>&waitMs=25000`
→ apply each `payload` through the existing merge path (identical to reading
a changeset file from the old sync folder) → set cursor to `nextSince`
**after** the local transaction commits → repeat immediately if `more`,
otherwise the long-poll makes the next call block until there is news. Verify
`sha256` of each payload before applying; mismatch → refetch, never apply.

**Photos:** on capture-ingest, compute sha256 and POST the bytes with the
`Content-SHA256` header. `duplicate:true` and `409` are both terminal (the
`409` case means a filename collision with different bytes — keep the local
file and flag it, never delete). Peers pull manifests per hole and fetch
missing files.

**Offline tolerance:** server-unreachable is *normal* in the field. Treat
every network error as "try again later" with jittered backoff (e.g. 5 s →
5 min cap). Nothing is ever lost: uploads sit in the outbox, downloads resume
from the cursor. The app must remain fully usable with the relay down —
exactly as it was with an unmounted SharePoint folder, minus the data races.

## Deployment options

- **Office mini-PC** (recommended): any small box on the office network,
  `GL_DATA_DIR` on its disk, behind Caddy/nginx for TLS. Devices sync
  whenever they're back in coverage / on the office Wi-Fi.
- **Cheap VPS:** same thing on a $5 VM for fleets that sync over cellular.
  Put TLS in front (see below) — tokens travel in headers.
- **Laptop-as-server on camp LAN:** run the binary on the geologist lead's
  laptop with `GL_HOST=0.0.0.0`; other devices point at its LAN address.
  Fine for a camp with no internet; snapshot the dataDir nightly.

### TLS

Preferred: terminate TLS at a reverse proxy and keep the relay on loopback.

```caddyfile
relay.example.com {
    reverse_proxy 127.0.0.1:8787
}
```

(nginx: a stock `proxy_pass http://127.0.0.1:8787;` server block with
`client_max_body_size 26m;`.) Alternatively set `GL_TLS_CERT`/`GL_TLS_KEY`
to PEM paths and the relay serves HTTPS itself via `node:https` — adequate
for a camp LAN with a self-signed cert pinned in the client.

## Backup story

`dataDir` is a plain directory of plain files — snapshot it with anything
(`rsync -a`, `tar`, ZFS/btrfs snapshots, Windows File History). For a
consistent snapshot either stop the server briefly or snapshot at the
filesystem layer; because all writes are append/rename-atomic, even a live
`rsync` yields a directory a fresh server instance will recover cleanly
(at worst dropping a torn, never-acknowledged tail entry). Restoring = point
a new instance at the restored directory.

## Scale envelope

Designed for **≤ 50 devices per fleet**. The in-memory index, per-request
file reads, and single-process fsync-per-changeset writes are deliberate
simplicity — at drill-core logging rates (tens of changesets per device per
day, photos in the tens of MB) this is orders of magnitude below the
hardware's limits. The client-visible contract — total-order `seq` plus
client-side LWW — is unchanged from the folder era and would survive a
future storage swap (e.g. SQLite) untouched.

## Development

```bash
npm test          # node --test "test/*.test.js" — real HTTP against ephemeral ports
node bin/gl-sync-server.js
```

See `SECURITY.md` for the threat model.
