# 10 — Apply Runbook: execute the critical path locally

**Purpose:** a single ordered checklist so you (or your laptop-side Claude Code session) can fix the security hole, turn the cog, and make the estate survivable — **without** depending on the remote HarLin_MCP tunnel (which has been intermittently dropping). Everything here runs on the laptop against `C:\AI` directly. Estimated total: one focused day for Steps 0–3, the rest interleaved.

Tick each box. Where a step says *verify*, do it before moving on — several of these edit code that runs on every session.

---

## Step 0 — Unstick Pulse (5 min, do first)
The `pulse.duckdb` lock has been held by **PID 254044** (`miniconda3/python.exe`) for hours — an orphaned process, almost certainly a hung summariser or gateway.

- [ ] `Get-Process -Id 254044 | Format-List Name,StartTime,Path` — confirm it's a stray python, not something mid-work.
- [ ] If stray: `Stop-Process -Id 254044 -Force`
- [ ] Verify Pulse reads again (run Alfred, or query the gateway). If the lock returns, it's a supervisor relaunching a crashing process — check the gateway/summariser logs.

## Step 1 — PAi security lockdown (2–3 h, highest urgency)
Follow **`07_PAI_SECURITY_PATCHES.md`** in order:
- [ ] **A.1** — add Firebase ID-token verification + CORS restriction to the `api` handler in `functions/src/index.ts`.
- [ ] **A.2** — send `Authorization: Bearer` from `app/src/lib/api.ts` (confirm the firebase init module name first).
- [ ] `firebase deploy --only functions,hosting`
- [ ] **E** — run the 5 verification curls; confirm unauth calls now return 401 and CORS is restricted.

## Step 2 — Rotate + purge secrets (2–3 h, mandatory — values are compromised)
Per **`07` §B–D**:
- [ ] Rotate Google OAuth, Microsoft, Xero client secrets (console links in `07`).
- [ ] `firebase functions:secrets:set` each; change code to read from `defineSecret().value()`; delete the literals (index.ts L26/L28).
- [ ] Purge secrets from `CONCEPT.md` §5.6, `Creds.json`; fix the false "encrypted" claim in `AGENTS.md`; extend `.gitignore`.
- [ ] `git log --all --oneline -- Creds.json functions/src/index.ts CONCEPT.md` — if anything returns, rotation was mandatory (done) and scrub history with git-filter-repo before any push.
- [ ] Create the sentinel so git-init is allowed later: `New-Item -ItemType File "C:\AI\HarLin_Labs\Internal Infrastructure\AEOS.prj\PersonalAI.prj\.secrets-purged"`

## Step 3 — Turn the cog (≈1 day, the highest-leverage work in the estate)
Follow **`08_AEOS_COG_PATCHES.md`** in this order (low blast radius first):
- [ ] **Patch 1** — add `import duckdb` to `aeos_nexusboard` + `aeos_file_search` in `gateway/mcp_server.py`.
- [ ] *Verify:* restart the gateway; confirm all 8 tools list and both previously-dead tools respond.
- [ ] **Patch 2** — replace `get_modified_files()` with the os.walk version in `pulse/capture_session.py`.
- [ ] *Verify:* run a session; confirm FILE_CHANGE events now appear in Pulse.
- [ ] **Patch 3** — generalise transcript discovery in `capture_session.py` + `session_summariser.py`.
- [ ] **Patch 4** — drop in `runtime/aeos_paths.py` (path literals confirmed; ONEDRIVE_DIR corrected). Migrate scripts incrementally.
- [ ] **Wiring Step 1** — add the guarded learning-injection block to `session_handoff.py`. *Verify one clean session start.*
- [ ] **Wiring Step 2** — add `aeos_learnings_recent` + `aeos_promotion_log` to `mcp_server.py` (apply the duckdb convention). *Verify tools list.*
- [ ] **Build AutoConfig v0.1** — the human-in-the-loop `promote <id>` command (writes to a memory file, appends an audit log, backs up the target). This is Decision **D2**.
- [ ] **Schedule** — run `scripts/schedule_aeos_tasks.ps1` (confirm each script's CLI subcommand first).
- [ ] **🎯 Milestone:** promote one real mined learning; confirm it appears in the next session's handoff; log it in `COG_WATCH.md`'s (currently empty) turned-cog log. **First full capture→learn→apply cycle in the estate's history.**

## Step 4 — Make it survivable (½ day, do alongside Step 3)
- [ ] Run `scripts/backup_aeos.ps1` once; confirm a snapshot lands in OneDrive.
- [ ] Run `scripts/git_init_harness.ps1` (AEOS + HarLin_OS now; PAi after the `.secrets-purged` sentinel exists).
- [ ] Create **private** GitHub repos; push each manually after confirming no secrets staged.
- [ ] Add the logging bundle (rotating file logger replacing `except: pass`; failure-count line in Alfred's briefing) — see `02_RECOMMENDATIONS` §1.4.

## Step 5 — Drain the gate (30 min of your time)
- [ ] Read **`06_GATE_REGISTER.md`**; bulk-🟢 the ~10 batch-confirm FYIs in one pass.
- [ ] Answer **`05_DECISION_SHEET.md`** (D1–D12, defaults provided) — one short reply.
- [ ] Adopt default-with-veto (**`12_DEFAULT_WITH_VETO_AMENDMENT.md`**) so the backlog can't silently re-accrete.

---

### If you'd rather I apply these
When the HarLin_MCP tunnel is stable, I can apply the **low-blast-radius** patches (Patch 1, backup script, git-init) directly and verify. I'd still hand you Steps 1–2 (security: needs your Firebase/console auth) and the every-session edits are safer applied locally where they can be tested atomically — a dropped tunnel mid-write to `session_handoff.py` would break every session start. The division above is the safe one.
