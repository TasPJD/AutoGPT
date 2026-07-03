# 07 — PAi Security Remediation Pack (copy-pasteable fixes)

> **Status:** Prepared 2026-07-03, read-only review, no files modified.
> **⚠ SECRET VALUES REDACTED IN THIS FILE ON PURPOSE.** The review that produced this identified the *actual live secret values* in Paul's source. Committing them here would re-leak them. Every secret is shown as `<REDACTED — see the exact file+line on the laptop>`. The file/line locations and rotation steps are preserved so a laptop-side session can act. **The exposure is real regardless of this redaction — rotate all secrets per Section B.**
> **Target:** `HarLin_Labs/Internal Infrastructure/AEOS.prj/PersonalAI.prj`. Live: `https://harlin--api.web.app` → Cloud Function `api` in `australia-southeast1`, project `harlin-youtube-api`.
> Line numbers for `functions/src/index.ts` counted from top of file. `CONCEPT.md`/`AGENTS.md` referenced by section + quoted text (read tool emits no line numbers). `app/src/lib/firebase.ts` could not be opened (MCP timeout) — the one dependent assumption is flagged in A.2.

---

## Finding summary

1. **The `api` Cloud Function has no authentication.** Every endpoint reads `userId` from the request body and trusts it. Anyone who knows the URL can pull any user's tasks, mood logs, emails, calendar, and trigger AI/email actions. CORS is wide open (`*`).
2. **Live secrets hard-coded in source:** `functions/src/index.ts` contains a Google OAuth client secret (line 26) and the Microsoft client secret (line 28) as string literals.
3. **`Creds.json` is plaintext** (not encrypted) and contains the same Google OAuth client secret. `AGENTS.md` wrongly calls it "encrypted creds."
4. **`CONCEPT.md` §5.6 embeds live secrets** (Microsoft client secret, Xero client secret, Firebase web API key, MS admin-consent Grant ID).

---

## A. AUTH FIX

### A.1 — Server: verify Firebase ID tokens + lock CORS

File: `functions/src/index.ts`. Current handler head (~lines 33–46) sets `Access-Control-Allow-Origin: *`, no auth, then `const path = req.path`. Replace:

```diff
 export const api = onRequest(
   { region: "australia-southeast1", secrets: [anthropicKey, geminiKey, gmailRefreshToken, msRefreshToken], timeoutSeconds: 120, memory: "512MiB" },
   async (req, res) => {
-    // CORS
-    res.set("Access-Control-Allow-Origin", "*");
-    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
-    res.set("Access-Control-Allow-Headers", "Content-Type");
-    if (req.method === "OPTIONS") { res.status(204).send(""); return; }
-
-    const path = req.path;
+    // CORS — restrict to the deployed PWA origin only
+    res.set("Access-Control-Allow-Origin", "https://harlin--api.web.app");
+    res.set("Vary", "Origin");
+    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
+    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
+    if (req.method === "OPTIONS") { res.status(204).send(""); return; }
+
+    const path = req.path;
+
+    // ── Auth: require a valid Firebase ID token on everything except health ──
+    if (path !== "/" && path !== "/health") {
+      const authHeader = req.get("Authorization") || "";
+      const match = authHeader.match(/^Bearer (.+)$/);
+      if (!match) {
+        res.status(401).json({ error: "Missing or malformed Authorization header" });
+        return;
+      }
+      let decoded: admin.auth.DecodedIdToken;
+      try {
+        decoded = await admin.auth().verifyIdToken(match[1]);
+      } catch {
+        res.status(401).json({ error: "Invalid or expired ID token" });
+        return;
+      }
+      // Derive caller identity from the verified token — never trust body.userId
+      req.body = req.body || {};
+      req.body.userId = decoded.uid;
+    }

     try {
       // Health check
       if (path === "/" || path === "/health") {
```

**Why it's safe with existing code:** every protected endpoint already does `const { userId } = req.body;` then `if (!userId) res.status(400)…`. Overwriting `req.body.userId` with the verified `decoded.uid` makes all downstream handlers operate on the authenticated user only — no per-handler edits. `admin.auth()` is available (`admin.initializeApp()` runs ~line 13).

### A.2 — Client: send `Authorization: Bearer <idToken>`

File: `app/src/lib/api.ts`. Every function currently posts `headers: { "Content-Type": "application/json" }` with `userId` in the body. Add a token helper and swap headers in **every** exported function (`classifyTask`, `processCapture`, `getMorningBriefing`, `reprioritiseProjects`, `triageEmails`, `getCalendarEvents`, `chatWithPai`):

```diff
 // PAi API client — calls the deployed Cloud Functions backend
+import { getAuth } from "firebase/auth";

 const API_BASE = "https://australia-southeast1-harlin-youtube-api.cloudfunctions.net/api";
+
+async function authHeaders(): Promise<Record<string, string>> {
+  const user = getAuth().currentUser;
+  if (!user) throw new Error("Not signed in");
+  const idToken = await user.getIdToken();
+  return { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` };
+}

 export async function classifyTask(title: string, description?: string) {
   const res = await fetch(`${API_BASE}/triage/classify-task`, {
     method: "POST",
-    headers: { "Content-Type": "application/json" },
+    headers: await authHeaders(),
     body: JSON.stringify({ title, description }),
   });
   return res.json();
 }
```

**Assumption flag (unverified — MCP timed out on `app/src/lib/firebase.ts`):** the `getAuth` import assumes the app initializes a Firebase app (CONCEPT.md Phase 0 confirms Auth enabled, Google + Microsoft providers). If `firebase.ts` exports a pre-built `auth` instance, prefer `import { auth } from "./firebase"; const user = auth.currentUser;`.

---

## B. SECRET ROTATION CHECKLIST

Rotate first, then store in Secret Manager, then change code to read it. **Rotation is mandatory** — these values sat in source (see D).

### B.1 — Google OAuth client secret
- **Appears:** `functions/src/index.ts` line 26 (`const GMAIL_CLIENT_SECRET = "<REDACTED>"`) **and** `Creds.json` (`"client_secret":"<REDACTED>"`).
- **Rotate at:** Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → web client of project `harlin-youtube-api` → **Reset secret**. `https://console.cloud.google.com/apis/credentials?project=harlin-youtube-api`
- **Store:** `firebase functions:secrets:set GMAIL_CLIENT_SECRET`
- **Code:** add `const gmailClientSecret = defineSecret("GMAIL_CLIENT_SECRET");` to the secret block (~L17–22); add `gmailClientSecret` to the `secrets:[...]` array (L34); at top of handler body `const GMAIL_CLIENT_SECRET = gmailClientSecret.value();`; delete L26.

### B.2 — Microsoft (Entra) client secret
- **Appears:** `functions/src/index.ts` line 28 (`const MS_CLIENT_SECRET = "<REDACTED>"`) **and** `CONCEPT.md` §5.6 Microsoft Graph subsection ("Client secret (PAi-dev): `<REDACTED>` (expires 2028-03-13)").
- **Rotate at:** Entra/Azure Portal → App registrations → app `1550659a-33fa-493f-8f3d-0385f3d643e4` → Certificates & secrets → **New client secret**, delete old. `https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Credentials/appId/1550659a-33fa-493f-8f3d-0385f3d643e4`
- **Store:** `firebase functions:secrets:set MICROSOFT_CLIENT_SECRET`
- **Code:** mirror B.1 (`const msClientSecret = defineSecret("MICROSOFT_CLIENT_SECRET");` → add to `secrets:[...]` → `const MS_CLIENT_SECRET = msClientSecret.value();` → delete L28). `MS_CLIENT_ID` (L27) and `MS_TENANT_ID` (L29) are public identifiers — may stay.

### B.3 — Xero client secret
- **Appears:** `CONCEPT.md` §5.6 Xero subsection ("Client secret: `<REDACTED>`"; client ID `B77F46A2D5D643F19451B67CB4E259CE`). Not in the code read.
- **Rotate at:** Xero Developer portal → My Apps → PAi app → Configuration → **Generate a secret**. `https://developer.xero.com/app/manage`
- **Store (when Xero is wired):** `firebase functions:secrets:set XERO_CLIENT_SECRET`

### B.4 — Firebase web API key (not a true secret)
- **Appears:** `CONCEPT.md` §5.6 Firebase Config block (`apiKey: "<REDACTED>"`). This is a public client identifier shipped in the PWA — **no rotation needed.** Protect with Firestore rules + Firebase App Check + an HTTP-referrer restriction on the browser key (Cloud Console → Credentials). Replace in the doc with `<see Firebase console>` so the doc stops being a secret store.

---

## C. PURGE LIST

- **`functions/src/index.ts`** — delete line 26 (Google secret literal) and line 28 (MS secret literal); both replaced by the `defineSecret`+`.value()` pattern above.
- **`Creds.json`** (root) — plaintext Google OAuth client secret. Remove from the working tree once the value is in Secret Manager. Already in `.gitignore`, so untracked going forward — but if ever committed, rotate (Section D). Don't re-encrypt in place; the value is burned.
- **`CONCEPT.md` §5.6** — redact these exact lines (replace value with `<stored in Secret Manager — rotated 2026-07-03>`): MS "Client secret (PAi-dev): …"; MS "Admin consent … (Grant ID: …)"; Xero "Client secret: …"; Firebase "apiKey: …" (optional, low risk).
- **`.gitignore`** — currently one line (`Creds.json`). Add:
  ```gitignore
  # Secrets / local env — never commit
  Creds*.json
  functions/.secret.local
  .env
  .env.*
  *.tmp
  .gmail-refresh-token.tmp
  .firebase/
  ```
- **`AGENTS.md`** — the Key Files line `- \`Creds.json\` … encrypted creds (do NOT commit)` is factually wrong. Correct to: `- \`Creds.json\` … PLAINTEXT OAuth client credentials (NOT encrypted). Gitignored; must never be committed. If it ever was committed, the secret must be rotated, not just deleted.`

---

## D. GIT-HISTORY WARNING

Deleting a secret from current files does **not** remove it from git history. If `functions/src/index.ts`, `Creds.json`, or `CONCEPT.md` was ever committed to any branch/remote:
- **Rotation is mandatory** — treat every value in B.1–B.3 as compromised and rotate regardless of history scrubbing. Redaction alone is insufficient once a secret has been in a commit.
- To scrub history: `git filter-repo` (preferred) or BFG Repo-Cleaner, then force-push and re-clone everywhere. Coordinate before rewriting history.
- Quick check: `git log --all --oneline -- Creds.json functions/src/index.ts CONCEPT.md` — any output means those paths have history and the rotation-first rule applies.

---

## E. VERIFICATION

```bash
# 1. Unauthenticated protected call → 401
curl -i -X POST https://australia-southeast1-harlin-youtube-api.cloudfunctions.net/api/briefing/morning \
  -H "Content-Type: application/json" -d '{"userId":"anything"}'
# Expect: 401 {"error":"Missing or malformed Authorization header"}

# 2. Bogus token → 401
curl -i -X POST https://australia-southeast1-harlin-youtube-api.cloudfunctions.net/api/briefing/morning \
  -H "Authorization: Bearer not-a-real-token" -H "Content-Type: application/json" -d '{}'
# Expect: 401 {"error":"Invalid or expired ID token"}

# 3. Health stays public
curl -i https://australia-southeast1-harlin-youtube-api.cloudfunctions.net/api/health
# Expect: 200 {"status":"ok",...}

# 4. Valid token succeeds — in the PWA console: await firebase.auth().currentUser.getIdToken()
curl -i -X POST https://australia-southeast1-harlin-youtube-api.cloudfunctions.net/api/briefing/morning \
  -H "Authorization: Bearer <PASTE_ID_TOKEN>" -H "Content-Type: application/json" -d '{}'
# Expect: 200, briefing for the token's uid (body userId ignored)

# 5. CORS restricted
curl -is -X OPTIONS https://australia-southeast1-harlin-youtube-api.cloudfunctions.net/api/briefing/morning \
  -H "Origin: https://evil.example" -H "Access-Control-Request-Method: POST" | grep -i "access-control-allow-origin"
# Expect: access-control-allow-origin: https://harlin--api.web.app  (never evil, never *)
```

---

### Notes / limitations
- `functions/package.json`: `firebase-admin ^13.4.0`, `firebase-functions ^6.3.0`, Node 22 — `verifyIdToken()` and `defineSecret` are supported; no dependency bumps needed.
- `Creds.json` confirmed plaintext by direct read (returned raw JSON with `client_secret`) — which is what makes the AGENTS.md "encrypted" wording false.
- `app/src/lib/` could not be enumerated (MCP timeout); only the A.2 import line depends on it. Everything else drawn from files read in full.
