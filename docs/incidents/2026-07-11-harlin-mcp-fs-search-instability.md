# Incident: HarLin MCP instability — `harlin_fs_search` unbounded full-tree walk

- **Date:** 2026-07-11
- **Reported by:** Paul — "a session last night did a heap of work on the MCP, and it has not been stable since."
- **Component:** HarLin MCP remote server (`bridge.harlin.dev`) → `server/harlin_mcp.py :: harlin_fs_search`
- **Severity:** S2 (intermittent tool failure + server starvation; no data loss)
- **Status:** Diagnosed + reproduced + fix verified against the live tree; **at-desk apply pending** (see below)
- **Estate ledger:** `HarLin_OS/OS_Bug_Analysis/bugs/OSB-020_harlin_mcp_unbounded_fs_search.md`

> This repo is not where the HarLin MCP server code lives (it is on Paul's machine under
> `C:/AI/HarLin_Labs/Internal Infrastructure/HarLin_MCP.prj`). This branch is the durable
> record of the investigation + the ready-to-apply fix, because the MCP's own security guard
> deliberately blocks editing its server code over the tunnel (see "Why not applied remotely").

## TL;DR

`harlin_fs_search` called with **no `subpath`** defaults to walking the **entire `C:/AI` estate
(≥60,000 candidate text/doc files)** synchronously, reading every text file and parsing every
Office/PDF document inline. The only stop condition is `len(hits) >= max_results` — a cap on
*hits*, not on *work*. A rare or absent search term therefore scans the whole estate, which
takes minutes, blows past the Cloudflare named-tunnel response window, and returns a **502
`origin_bad_gateway`** to the caller while pinning a worker + disk/CPU. That is the "not stable"
experience Paul reported.

## How it was reproduced (remote, read-only)

| Call | Result |
|---|---|
| `harlin_fs_search(query, subpath="HarLin_MCP.prj")` (small tree) | ✅ returns < 1s |
| `harlin_fs_search(query, subpath="AEOS.prj/runtime")` (large tree) | ❌ 502 timeout |
| `harlin_fs_search(query)` (no subpath → whole `C:/AI`) | ❌ 502 timeout, every time |
| `harlin_orient`, `harlin_catalog`, `harlin_pulse_recent`, `harlin_fs_list`, `harlin_fs_read` | ✅ all healthy throughout |

The failure scales with the size of the walked tree ⇒ it is a **time-out**, not a crash. The
server process stayed up (`_live.err.log` shows steady request processing, no traceback).

## Root cause

```python
# server/harlin_mcp.py — harlin_fs_search (before)
base = _safe(subpath) if subpath else FS_ROOT          # FS_ROOT = C:/AI (the whole estate)
for f in base.rglob("*"):
    if len(hits) >= max_results:                       # the ONLY bound — on HITS
        break
    ...
    elif ext in text_exts and ... q in f.read_text(...).lower(): ...            # read every text file
    elif ext in doc_exts  and ... q in extractors.extract(f, 200_000).lower(): # parse every Office/PDF
```

Live measurement of the real tree (probe run via `harlin_run pytest`, since removed):

- **≥ 60,000** candidate text/doc files under `C:/AI` (the file-walk alone took 32.5s just to
  *reach* 60k and was still going).
- Content-reading + document-parsing that many files takes **minutes** — far beyond the
  ~100s tunnel window → 502 for the caller, and worker/disk/CPU pressure that makes concurrent
  calls intermittently 502 too.

Latent since Phase 1 of the server; **not** introduced by last night's session (see below).

## What last night's session actually did (and why it is NOT the bug)

The "heap of work on the MCP" was the **2026-07-11 MetaRef estate-wide session** on the *AEOS
gateway* MCP (`gateway/mcp_server.py`, `brain/semantic_index.py`, `brain/context_graph.py`,
`utils/metaref.py`), closing OSB-019 by stamping `data_class` onto the vector stores. It was
**verified sound**, not the instability:

- `utils/test_metaref.py` → **6/6 pass**.
- Live DB check: `file_embeddings.data_class` present on **all 88,293 rows** (0 NULL; 88,275
  internal / 17 client_confidential / 1 credentials — matches the changelog exactly); the
  guarded `aeos_file_search` query returns 88,275 rows; `cg_nodes` migrated (240 non-sensitive).
- No leftover `.wal`, no gateway tracebacks.
- No evidence any session edited `harlin_mcp.py` since 2026-07-10 (Pulse project `HarLin_MCP`
  has no later session; the workspace is not under git, so no diff was available — stated
  rather than guessed).

Most plausibly the heavy estate-wide session **surfaced** the latent `harlin_fs_search` defect
by exercising broad search; it did not create it.

**One real loose end from last night (flagged, OSB-010 recurrence):** the MetaRef deploy left
the persistent **`aeos_rest` REST API on `127.0.0.1:8000` running pre-MetaRef code**, so the
OSB-019 sensitivity filter is not yet live on that surface. On-disk code + DBs are correct;
the outstanding step is a **restart of that service** (at-desk).

## The fix

Bound the walk. See [`fix/harlin_fs_search.patch`](../../fix/harlin_fs_search.patch) for the
drop-in replacement function. Load-bearing changes:

1. `SCAN_CAP = 20_000` files-scanned **and** `TIME_BUDGET = 20s` wall-clock, checked every iteration.
2. `DOC_EXTRACT_CAP` bounds inline Office/PDF parses; past it, documents match by **filename**
   (use `harlin_fs_read` for a document's contents).
3. Skip `__pycache__`, `.git`, `state/backups` (in addition to `node_modules`, `.next`).
4. On early stop, return partial hits **plus** an explicit `[bounded: scanned N files in Ms …]`
   note (NO_QUIET_FAILING).
5. Recommended: wrap the walk in `anyio.to_thread.run_sync` so a slow search can never stall
   the event loop / health probe.

### Verified (fix logic, against the real live tree)

| Search | Before | After (bounded) |
|---|---|---|
| rare term, whole `C:/AI` | hangs → 502 | **10.0s**, `truncated=True`, 1527 files scanned, returns |
| common term "changelog" | (n/a) | **0.4s**, 40 hits |

## Why not applied remotely

The MCP's own `WRITE_DENY` guard deliberately refuses every write to
`HarLin_MCP.prj/server|state|logs` — confirmed live (an attempted edit returned
`"DENIED … protected MCP/security path"`). That self-protection is correct: it stops the remote
tool surface being used to disable its own security, and must stay. The fix is therefore an
**at-desk apply**:

1. Replace `harlin_fs_search` in `server/harlin_mcp.py` with the patched function.
2. Syntax-check: `python -c "import ast,pathlib; ast.parse(pathlib.Path('server/harlin_mcp.py').read_text())"`.
3. `scripts\restart_harlin_mcp.ps1` (or let the supervisor's next health cycle adopt it).
4. Verify: a no-`subpath` `harlin_fs_search` for a rare term returns a bounded note in seconds,
   not a 502.

## Prevention (owed — keeps this FIXED, not yet PREVENTED)

- Add an `harlin_mcp_health.py` (F3 battery) check that calls the default (no-subpath)
  `harlin_fs_search` and asserts it returns under a threshold (~25s) — a planted regression
  guard so any future re-widening fails loudly.
- Standing pattern: every MCP tool that walks/reads the estate must carry an explicit
  scan/time budget by construction.
