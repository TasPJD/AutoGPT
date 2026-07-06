# GeoLedger — Security Hardening (v0.6 → launch)

Threat model + concrete work list for a commercial desktop product handling
exploration-sensitive data (drill results are market-sensitive information for listed juniors —
treat the DB as inside-information-grade).

## 1. Threat model (what actually matters here)

| Threat | Vector | Priority |
|---|---|---|
| T1 Lost/stolen field laptop | Whole SQLite DB + photos readable | **High** |
| T2 Rogue LAN device | FieldCam HTTP receiver (port 18765) accepts posts unauthenticated | **High** |
| T3 Malicious changeset | Sync import executes structured writes | High |
| T4 Renderer compromise | Electron misconfig → full node access | High |
| T5 Tampered installer/update | No signing/verified updates → supply chain | High (launch blocker) |
| T6 Insider/market leak | Assay-adjacent data exfil | Medium (contractual + audit) |
| T7 Relay compromise | Sync server holds fleet changesets | Medium (it never holds the only copy) |

## 2. Electron baseline (audit checklist for the local session)

Verify and enforce in `main.js`/preload — each is a one-line check, all must be CI-asserted:
`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` on all BrowserWindows;
preload exposes only the `corelogAPI` allowlist via `contextBridge` (no generic `ipcRenderer`
passthrough); `webSecurity` on; `shell.openExternal` only through a URL allowlist;
CSP meta on index.html (default-src 'self'; no remote content — the app is offline anyway);
disable `remote`-style patterns; deny all `new-window`/`will-navigate` to external origins.
**Every IPC handler validates inputs** — with gl-core `strictInsert` this is largely free; add
type/range validation on the photo and file-path handlers (path traversal on hole/tray ids).

## 3. FieldCam receiver (T2) — the biggest current hole

Port 18765 accepts device posts on the LAN. v0.6: pairing-code flow (desktop shows 6-digit
code, FieldCam enters it once, receives a device token; token required on every request),
HMAC of body with the token, and bind to the LAN interface only. The relay (03) uses the same
token model — one auth story across the suite.

## 4. Data at rest (T1)

- Ship **SQLCipher** (drop-in for better-sqlite3 via better-sqlite3-multiple-ciphers) as an
  opt-in "Encrypted project" setting in v0.6.x; default-on for new customer installs at launch.
  Key from OS keychain (DPAPI/Keychain), never a typed password in the field.
- Photos: NTFS/BitLocker guidance in the deployment doc now; per-file encryption only if a
  customer demands it (cost/benefit documented).
- Backups inherit DB encryption automatically (they're file copies).

## 5. Sync/changeset integrity (T3, T7)

- Changesets carry SHA-256 (relay verifies); import validates schema-version compatibility
  (gl-core `assertVersionCompatible`) and rejects rows for unknown tables/columns
  (strictInsert) — a malicious or corrupt changeset degrades to flagged rejects, not writes.
- Relay: tokens hashed at rest, admin/device separation, rate limiting, max body size, strict
  path validation (implemented in reference-impl; see its SECURITY.md for the
  implemented-vs-deferred table).
- Device revocation drill in the ops runbook (lost laptop: revoke token, rotate, done —
  the DB on the laptop is T1/SQLCipher's job).

## 6. Supply chain & updates (T5 — launch blocker)

- Code-sign Windows builds (OV cert via Certum/Sectigo, ~AUD 500/yr; EV later kills
  SmartScreen warnings — worth it before self-serve trials).
- electron-updater with signed releases from a private update endpoint; staged rollout
  (Barton fleet = ring 0).
- `npm audit` + lockfile + dependency pinning in CI; better-sqlite3/electron upgrades on a
  quarterly cadence with the golden-DB migration test.

## 7. Organisational (SOC 2 posture, right-sized)

Full SOC 2 Type 2 is *not* required to sell to juniors — but the policy skeleton costs little
and majors' procurement will ask eventually: infosec policy, access control, incident response
(with a customer-notification clause), change management (the deploy gates already exist —
write them down as the policy), backup/DR (the backup register work becomes the evidence),
patch SLAs (critical ≤14 days). Put "SOC 2 Type 1 on first enterprise deal" in the plan, not
before (cost AUD 8–30k — trigger it on revenue, per HP-15).

## 8. Order of work

1. Electron baseline audit + CI asserts (hours, do first).
2. FieldCam receiver pairing/auth (with the relay client work — same tokens).
3. Code signing + updater (before any external trial).
4. SQLCipher opt-in.
5. Policy skeleton + audit-pack security section (with 08's launch checklist).
