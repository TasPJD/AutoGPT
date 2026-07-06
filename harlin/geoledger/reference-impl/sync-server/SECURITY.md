# GL Relay — Security Notes

Scope: the sync server is a transport for one exploration fleet (≤ 50
devices) holding drill-core logging data. It is commercially sensitive but
not life-safety data; the realistic adversaries are opportunistic network
attackers, a stolen/compromised field device, and operator error.

## Threat model & mitigations

### 1. Token theft

**Threat:** a device bearer token (or the admin token) is captured — from a
stolen laptop, a leaked log, or a sniffed plaintext connection.

**Implemented**
- Tokens are 32 bytes of CSPRNG output; only sha256 hashes are persisted
  (`fleet.json`), so the data directory itself never leaks usable secrets.
- Per-device tokens: a stolen token impersonates exactly one device, and
  `POST /changesets` enforces `deviceId` = token identity (403), so a thief
  cannot forge history *as another device*.
- Revocation (`POST /devices/revoke`) takes effect immediately;
  re-registration rotates the token.
- All token comparisons use `crypto.timingSafeEqual` over fixed-length
  sha256 digests — no timing side channel on length or prefix.
- Tokens travel only in the `Authorization` header, never in URLs (no log
  leakage via access logs / proxies).

**Deferred**
- Token expiry / automatic rotation (revoke + re-register is the manual
  path).
- TLS is required to make header transport safe on hostile networks —
  deploy behind Caddy/nginx or set `GL_TLS_CERT`/`GL_TLS_KEY` (see README).
  On a camp LAN of trusted hardware, plaintext HTTP is an accepted risk.

### 2. Replay

**Threat:** a captured upload is re-sent to duplicate or reorder history;
a client is tricked into re-applying old data.

**Implemented**
- Changeset uploads are idempotent on `changesetId`: replaying an accepted
  upload returns the original `seq` (`duplicate:true`) and writes nothing.
- The server assigns a strictly monotonic `seq` that never regresses across
  restarts (counter is fsync'd and re-derived from index + directory scan on
  boot), so replay cannot reorder the stream.
- Photo replay with identical bytes is a no-op; with different bytes it is
  refused (409).

**Deferred**
- Replay of a *fresh, never-uploaded* changeset stolen in transit is
  indistinguishable from the legitimate upload — TLS is the mitigation.
- No per-request nonces/signatures; bearer auth is the accepted model.

### 3. Tamper (data integrity)

**Threat:** changeset or photo bytes are corrupted or maliciously altered
in transit or at rest.

**Implemented**
- Server computes sha256 of every changeset payload; it is returned to the
  uploader (end-to-end check), stored in `index.jsonl`, and served with every
  download so clients verify before applying.
- Photos require a client `Content-SHA256` header; the server verifies it
  against the received bytes (mismatch → 400, nothing stored), never
  overwrites an existing file (409 on content mismatch), and serves the hash
  back on download.
- All writes are atomic (temp + fsync + rename): a crash cannot leave a
  half-written changeset visible to readers.
- `index.jsonl` is append-only, giving a tamper-*evident* (not tamper-proof)
  transport audit trail exposed via `GET /audit`.

**Deferred**
- Hash chaining / signing of the audit log (tamper-proofing against an
  attacker with server disk access).
- At-rest encryption — use full-disk encryption on the host.

### 4. Path traversal

**Threat:** crafted `holeId` / `filename` / `changesetId` escapes the data
directory (`../../etc/passwd`, encoded slashes, NUL bytes, dotfiles).

**Implemented**
- Every path-forming identifier must match `^[A-Za-z0-9._-]+$`, length ≤ 200,
  with **no leading dot** — rejects `.`, `..`, dotfiles, separators, NUL and
  all percent-encoded variants (segments are decoded *then* validated) → 400.
- Validation is enforced in the storage layer as well as the router
  (defense in depth), and photo listings never expose non-conforming names.
- Tests cover encoded-slash traversal, raw `..` segments sent without client
  URL normalization, NUL bytes, and dotfiles.

**Deferred:** nothing — this surface is closed by construction.

### 5. Denial of service

**Threat:** a runaway client, a malicious peer, or an internet scanner
exhausts memory, disk, or sockets.

**Implemented**
- Request body cap (default 25 MiB, `GL_MAX_BODY`) → 413; the
  `Content-Length` fast path rejects before buffering, and streamed bodies
  are cut off at the cap.
- Per-IP token-bucket rate limiting (in-memory, bounded map) → 429 with
  `Retry-After`.
- Long-polls are capped at 60 s, event-driven (no busy loops), and released
  on client abort and on shutdown; header timeout is 30 s.
- Pagination caps (`limit` ≤ 1000) bound response sizes.

**Deferred**
- Disk quota / retention policy (dataDir growth is unbounded by design —
  it *is* the archive; monitor free space).
- Connection-count limits and distributed-DoS resistance — put the relay
  behind a reverse proxy if it must face the internet.
- Per-device (rather than per-IP) rate limits.

## Non-goals

- The server does not parse or validate changeset payload *contents* —
  garbage-in/garbage-out is resolved by the clients' schema validation and
  LWW merge, exactly as in the folder-sync era.
- Multi-tenant isolation: one relay instance = one fleet = one trust domain.
  Run separate instances (separate dataDirs/ports) for separate projects.

## Reporting

This is a reference implementation inside the GeoLedger repo — report issues
through the usual GeoLedger channels rather than public trackers.
