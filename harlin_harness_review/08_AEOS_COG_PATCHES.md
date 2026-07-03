# 08 — AEOS "Cog Sprint" Bug-Fix Patch Pack

> **Status:** Prepared 2026-07-03, read-only from the live runtime. Patches 1–3 read in full and faithful to actual source. Patch 4 module ready; 2 of ~11 path literals need a one-line confirm on the laptop. The PatternEngine WIRING.md step could not be read (MCP filesystem outage) — flagged, not fabricated.

Files under patch (all under `C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime/`):
- `gateway/mcp_server.py`
- `pulse/capture_session.py`
- `pulse/session_summariser.py`
- NEW: `aeos_paths.py`

---

## Patch 1 — `gateway/mcp_server.py`: `duckdb` NameError in `aeos_nexusboard` and `aeos_file_search`

**Confirmed:** `duckdb` is never imported at module scope. Every *working* DB tool imports it function-locally (`aeos_search`, `aeos_pulse_recent`, `aeos_pulse_log`, `aeos_projects` each begin with `import duckdb`). The two newer tools don't → `NameError` on invocation. Fix: function-local `import duckdb`, matching the file's existing style (two one-line insertions).

### 1a — `aeos_nexusboard`
```diff
         view: "products" (list all), "roadmap" (planned features), "deps" (dependencies)
     """
+    import duckdb
     NEXUS_DB_PATH = Path("C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime/products/nexusboard.duckdb")
```

### 1b — `aeos_file_search`
```diff
     sys.path.insert(0, str(Path("C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime/brain")))
     from context_graph import get_embed_model
+    import duckdb

     model = get_embed_model()
```

**Risk:** none material — `duckdb` is already a hard dependency (5 other tools import it). If Patch 4's module-scope import is adopted later, these become redundant but harmless.

---

## Patch 2 — `pulse/capture_session.py`: `get_modified_files()` uses GNU `find` (dead on Windows)

**Confirmed:** current impl shells out to Unix `find` with GNU-only flags (`-maxdepth`, `-mmin`, `-not -path`) inside `try/except: return []`. On Windows this raises and is swallowed → always returns `[]` → **no `FILE_CHANGE` events ever emitted** (SESSION_END still fires). Contract to preserve: `get_modified_files(cwd: str, minutes: int = 60) -> list[str]`, de-duplicated path strings, cap 30, IGNORE_PATTERNS applied, node_modules/.git/__pycache__/*.pyc/*.tmp excluded. Caller uses `os.path.basename(filepath)` + `{"path": filepath}`, so plain path strings keep the shape.

### After (replaces the whole function)
```python
def get_modified_files(cwd: str, minutes: int = 60) -> list[str]:
    """Get files modified recently (proxy for session changes).

    Pure-Python os.walk + mtime scan. Cross-platform (the old GNU `find`
    shell-out silently returned [] on Windows). Mirrors the old filters:
    maxdepth 4, skip node_modules/.git/__pycache__, drop *.pyc/*.tmp,
    apply IGNORE_PATTERNS, cap at 30 results.
    """
    try:
        import time
        cutoff = time.time() - minutes * 60
        base_depth = len(Path(cwd).parts)
        prune_dirs = {"node_modules", ".git", "__pycache__"}
        filtered: list[str] = []

        for root, dirs, files in os.walk(cwd):
            dirs[:] = [d for d in dirs if d not in prune_dirs]
            depth = len(Path(root).parts) - base_depth
            if depth >= 4:
                dirs[:] = []
                continue
            for name in files:
                if name.endswith((".pyc", ".tmp")):
                    continue
                fpath = os.path.join(root, name)
                if any(p in fpath for p in IGNORE_PATTERNS):
                    continue
                try:
                    if os.path.getmtime(fpath) >= cutoff:
                        filtered.append(fpath.replace("\\", "/"))
                except OSError:
                    continue
                if len(filtered) >= 30:
                    return filtered
        return filtered[:30]
    except Exception:
        return []
```

**Risk/assumptions:** depth mapping reproduces GNU `find -maxdepth 4` (off-by-one-prone area, flagged); path separators normalised to `/` (downstream only does basename); leave the module `subprocess` import (still used by `check_unsummarised_sessions`/`main`); outer try/except kept so a scan failure never crashes the Stop hook.

---

## Patch 3 — Transcript discovery hardcoded to `C:/Users/pauld/.claude/projects/c--AI`

**Confirmed:** the literal appears in 3 places across 2 files (+ the `TRANSCRIPTS_DIR` constant). `c--AI` is Claude Code's encoding of `C:\AI`; sessions opened in any other cwd land under a different `~/.claude/projects/<encoded>` dir and are invisible. Fix: glob every `~/.claude/projects/*` dir.

### 3a — `capture_session.py`: add helper + constant near other constants
```diff
 IGNORE_PATTERNS = [
     "node_modules", ".git", "__pycache__", ".pyc", ".tmp",
     "package-lock.json", ".DS_Store", "Thumbs.db"
 ]
+
+CLAUDE_PROJECTS_DIR = Path.home() / ".claude" / "projects"
+
+def _all_transcripts() -> list[Path]:
+    if not CLAUDE_PROJECTS_DIR.exists():
+        return []
+    return [p for d in CLAUDE_PROJECTS_DIR.glob("*") if d.is_dir()
+            for p in d.glob("*.jsonl")]
+
+def _find_transcript(session_id: str) -> Path | None:
+    if not CLAUDE_PROJECTS_DIR.exists():
+        return None
+    for d in CLAUDE_PROJECTS_DIR.glob("*"):
+        cand = d / f"{session_id}.jsonl"
+        if cand.exists():
+            return cand
+    return None
```

### 3b — `check_unsummarised_sessions()`
```diff
         summaries_dir = Path("C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime/pulse/summaries")
-        transcripts_dir = Path("C:/Users/pauld/.claude/projects/c--AI")
         summariser = Path("C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime/pulse/session_summariser.py")
-        if not summariser.exists() or not transcripts_dir.exists():
+        if not summariser.exists() or not CLAUDE_PROJECTS_DIR.exists():
             return
         summarised = {f.stem for f in summaries_dir.glob("*.md")} if summaries_dir.exists() else set()
-        jsonl_files = list(transcripts_dir.glob("*.jsonl"))
+        jsonl_files = _all_transcripts()
```

### 3c — `main()` summarisation trigger
```diff
-        jsonl_path = Path(f"C:/Users/pauld/.claude/projects/c--AI/{session_id}.jsonl")
-        if jsonl_path.exists():
+        jsonl_path = _find_transcript(session_id)
+        if jsonl_path is not None:
```

### 3d–3f — `session_summariser.py`: replace `TRANSCRIPTS_DIR` constant with `CLAUDE_PROJECTS_DIR` + `all_transcripts()`/`find_transcript()` helpers (same bodies as 3a); `backfill_all()` uses `sorted(all_transcripts())`; the `summarise` subcommand falls back to `find_transcript(args.session_id)`.

**Risk/assumptions:** broadening picks up other workspaces (intended); dedup intact (UUID session IDs, early-return on existing `.md`); `unsummarised[-5:]` cap still bounds per-startup work. Optional `AEOS_CLAUDE_PROJECT` env override if a single dir is ever wanted.

---

## Patch 4 — NEW shared config module `runtime/aeos_paths.py`

Real hardcoded paths collected from source (all verified except the two flagged **CONFIRM**):

| Purpose | Path |
|---|---|
| Runtime root | `.../AEOS.prj/runtime` (all files) |
| ContextGraph DB | `.../brain/context.duckdb` |
| Semantic index DB | `.../brain/semantic_index.duckdb` |
| Pulse DB | `.../pulse/pulse.duckdb` |
| NexusBoard DB | `.../products/nexusboard.duckdb` |
| Pulse fallback log | `.../pulse/pulse_fallback.jsonl` |
| Summaries dir | `.../pulse/summaries` |
| Session index | `.../pulse/SESSION_INDEX.md` |
| `.env` (ANTHROPIC_API_KEY) | `.../runtime/.env` |
| Claude transcripts | `~/.claude/projects/*` |
| Miniconda python | **CONFIRM** in `agents/alfred.py` + `brain/context_graph.py` |
| OneDrive dir | **CONFIRM** in same two files (search timed out) |

```python
"""AEOS shared path config — single source of truth for absolute paths.

Import from here instead of hardcoding `C:/AI/HarLin_Labs/...` in each script.
Every value is overridable by an env var so the tree can move without edits.
"""
import os
from pathlib import Path

RUNTIME = Path(os.environ.get(
    "AEOS_RUNTIME",
    "C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime",
))

BRAIN    = RUNTIME / "brain"
PULSE    = RUNTIME / "pulse"
PRODUCTS = RUNTIME / "products"
AGENTS   = RUNTIME / "agents"

CONTEXT_DB  = BRAIN / "context.duckdb"
SEMANTIC_DB = BRAIN / "semantic_index.duckdb"
PULSE_DB    = PULSE / "pulse.duckdb"
NEXUS_DB    = PRODUCTS / "nexusboard.duckdb"

FALLBACK_LOG  = PULSE / "pulse_fallback.jsonl"
SUMMARIES_DIR = PULSE / "summaries"
SESSION_INDEX = PULSE / "SESSION_INDEX.md"

ENV_FILE = RUNTIME / ".env"

CLAUDE_PROJECTS_DIR = Path.home() / ".claude" / "projects"

# CONFIRMED against alfred.py on 2026-07-03 (laptop session):
MINICONDA_PYTHON = Path(os.environ.get("AEOS_PYTHON", "C:/Users/pauld/miniconda3/python.exe"))
# NOTE: the earlier best-effort guess "C:/Users/pauld/OneDrive" was WRONG.
# alfred.py uses the tenant OneDrive with an "/AI" suffix (ONEDRIVE_AI):
ONEDRIVE_DIR = Path(os.environ.get("AEOS_ONEDRIVE", "C:/Users/pauld/OneDrive - HarLin Consulting Pty Ltd/AI"))
```

**Confirmation (laptop session, 2026-07-03):** `alfred.py` defines `PYW = Path("C:/Users/pauld/miniconda3/python.exe")` (guess correct) and `ONEDRIVE_AI = Path("C:/Users/pauld/OneDrive - HarLin Consulting Pty Ltd/AI")  # Chesh reads here` (guess was wrong — corrected above). `context_graph.py` not separately re-checked; grep it if it also references these before relying on the module there.

### Example adoption in `gateway/mcp_server.py`
```diff
 sys.path.insert(0, str(Path("C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime/brain")))
 sys.path.insert(0, str(Path("C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime/pulse")))
+sys.path.insert(0, str(Path("C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime")))
+from aeos_paths import CONTEXT_DB, PULSE_DB, NEXUS_DB, SEMANTIC_DB
 ...
-CONTEXT_DB = Path("C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime/brain/context.duckdb")
-PULSE_DB = Path("C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime/pulse/pulse.duckdb")
```
Then `aeos_nexusboard`'s `NEXUS_DB_PATH = NEXUS_DB` and `aeos_file_search`'s `INDEX_DB = SEMANTIC_DB`.

**Risk/assumptions:** `aeos_paths` must be on `sys.path` before use (hence the extra insert); adoption is incremental (nothing breaks until a script imports it); the two flagged literals are best-effort placeholders — verify before relying on them (the env-var override makes a wrong default recoverable without code edits).

---

## Wiring checklist (PatternEngine.prj/WIRING.md) — CONFIRMED 2026-07-03

Read in full on the laptop session. The two live-runtime steps (both additive, low-risk, held only because they touch code that runs every session):

**Step 1 — SessionStart learning injection.**
- Where: `runtime/pulse/session_handoff.py` (runs at the SessionStart hook).
- Do: add a fully try/except-wrapped block that reads `runtime/agents/pattern_engine_data/learning_queue.json`, takes the top N high-confidence candidates, and appends a short "Recent learnings under review" section to the injected `additionalContext`. If the file is missing/malformed, inject nothing and never raise (handoff must never break session start).
- Verify: one clean session start after the change.

**Step 2 — two MCP gateway tools.**
- Where: `runtime/gateway/mcp_server.py` (alongside the existing 8 tools).
- Add `aeos_learnings_recent(limit=10)` → reads `learning_queue.json`, returns top candidates (theme, section, count, confidence, examples); and `aeos_promotion_log(limit=20)` → returns what AutoConfig has promoted (reads an audit log; empty until AutoConfig exists).
- **Apply Patch 1's `import duckdb` convention** to either new tool if it touches a DuckDB file, so the NameError isn't reintroduced.
- Verify: the gateway still lists all its tools next session.

**Deferred (do NOT do now):** Step 3 AutoConfig auto-apply (gated — real blast radius; requires standing authorisation for high-confidence non-destructive learnings only, per-application audit log, memory-hygiene pass, one-tap Telegram approval for the rest). Step 4 optional `--use-llm` Haiku semantic clustering (~$0.05/run, no blast radius, add anytime). Until Step 3 is built, promotion stays a manual human action from `LEARNING_QUEUE.md` — which is what `05_DECISION_SHEET.md` D2's "human-in-the-loop `promote`" command builds.

---

### Ready to apply now (all gaps closed 2026-07-03)
- **Patches 1, 2, 3:** fully verified, copy-paste ready.
- **Patch 4:** module ready; both path literals now confirmed (ONEDRIVE_DIR corrected).
- **Wiring:** steps 1–2 confirmed above; apply then verify one clean session start + tool listing.

**Suggested apply order for the laptop-side session:** Patch 1 (15 min, unblocks 2 dead tools) → verify all 8 gateway tools list → Patch 2 (file capture) → Patch 3 (transcript discovery) → Wiring Step 1 + 2 → build the human-in-the-loop `promote` command (D2) → schedule the miners. That sequence turns the cog end-to-end.
