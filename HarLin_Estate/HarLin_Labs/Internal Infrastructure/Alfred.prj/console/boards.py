"""Workflows gallery — the registry of HarLin illustration boards & diagrams.

Paul's ask (2026-07-12): surface every workflow/architecture diagram and Miro/Lattice board that
illustrates HarLin, in the LHS Rail → **Workflows** menu, displayable in the main window (with Pop
Out). This is that curated registry — a single source of truth the Console renders the menu from.

Three display kinds:
  * **html**    — a self-contained HTML visual on disk, served same-origin by the Console
                  (`/boards/html/<id>`) and shown in an <iframe>. Works over the tunnel.
  * **lattice** — a board in Paul's Lattice app (generated-from-the-SoR graphs). The Lattice app
                  dir is mounted at `/boards/lattice/`; a board is `lattice.html?g=<gid>`.
  * **miro**    — an EXTERNAL miro.com board (hand-built, drift-prone snapshot). Not embeddable
                  (private), so it opens out to Miro; the pad view offers the link + Pop Out.

Inventory sourced from an estate-wide sweep (2026-07-12). Stale/superseded/test-fixture assets are
deliberately excluded (ConnectionPad archive, Lattice stress-* fixtures, PAi guide v1). Mermaid-in-
markdown diagrams (MINDMAP.md, GFM, Vitrine) are NOT yet here — they need a bundled Mermaid renderer
(no local mermaid.js in the estate); tracked as a follow-up.
"""
from __future__ import annotations

from pathlib import Path

_AI = Path(r"C:\AI")
_DASH = _AI / "HarLin_OS" / "Harness_Review.prj" / "Dashboards"
_AEOS = _AI / "HarLin_Labs" / "Internal Infrastructure" / "AEOS.prj"
_ALFRED = _AI / "HarLin_Labs" / "Internal Infrastructure" / "Alfred.prj"
_PAI = _AEOS / "PersonalAI.prj" / "Research"
_COMMERCIAL = _AI / "HarLin_Commercial" / "Marketing_Sales.prj" / "Flowcharts"

# The Lattice viz app (local-first; we mount its dir so boards embed same-origin).
LATTICE_APP_DIR = _AI / "HarLin_Labs" / "Lattice.prj" / "app"

# group order controls how the menu sections render, top→bottom.
GROUP_ORDER = ["Estate & stack", "AEOS", "Alfred & PAi", "Commercial", "Comparison & status", "Boards (Miro)"]

# Each board: id, title, group, kind, note, + a source (path for html, gid for lattice, href for miro).
# `live` marks self-updating/generated views (vs hand-built point-in-time snapshots — labelled so Paul
# is never misled about staleness; OSB-001).
_BOARDS: list[dict] = [
    # ---- Estate & stack ----
    {"id": "lattice-estate", "title": "HarLin Estate (Lattice)", "group": "Estate & stack",
     "kind": "lattice", "gid": "harlin-estate", "live": True,
     "note": "The whole estate, generated live from the System of Record (~190 nodes). Flagship."},
    {"id": "infrastructure-map", "title": "Infrastructure Map", "group": "Estate & stack",
     "kind": "html", "path": _DASH / "infrastructure_map.html", "live": False,
     "note": "The integrated stack (OS → AEOS → Harness → PAi) + the Visibility Contract."},
    {"id": "harness-anatomy", "title": "Harness Anatomy", "group": "Estate & stack",
     "kind": "html", "path": _DASH / "harness_anatomy.html", "live": False,
     "note": "The four-layer stack anatomy — HTML companion to the Miro Design Map."},
    {"id": "ecosystem-brain", "title": "Ecosystem — the Brain", "group": "Estate & stack",
     "kind": "html", "path": _DASH / "harlin_ecosystem_brain.html", "live": False,
     "note": "The whole ecosystem as a brain/node graph."},
    {"id": "ecosystem-orrery", "title": "Ecosystem — the Orrery", "group": "Estate & stack",
     "kind": "html", "path": _DASH / "harlin_ecosystem_orrery.html", "live": False,
     "note": "Orbital (orrery) view of the ecosystem's projects."},

    # ---- AEOS ----
    {"id": "aeos-brain", "title": "AEOS — the Brain", "group": "AEOS",
     "kind": "html", "path": _DASH / "aeos_brain.html", "live": False,
     "note": "AEOS internals as a brain graph (Pulse / Catalog / ContextGraph / PatternEngine)."},
    {"id": "aeos-orrery", "title": "AEOS — the Orrery", "group": "AEOS",
     "kind": "html", "path": _DASH / "aeos_orrery.html", "live": False,
     "note": "AEOS subsystems, orbital view."},
    {"id": "aeos-review", "title": "AEOS Architecture Review", "group": "AEOS",
     "kind": "html", "path": _AEOS / "AEOS_REVIEW.html", "live": False,
     "note": "The AEOS architecture review visual."},
    {"id": "meta-referencing", "title": "Meta-Referencing Memory", "group": "AEOS",
     "kind": "html", "path": _AEOS / "MetaReferencing_Memory_Architecture.html", "live": False,
     "note": "The memory/estate architecture — four strata by 'temperature'."},
    {"id": "dispatch-dashboard", "title": "Dispatch — the Assay Office", "group": "AEOS",
     "kind": "html", "path": _AEOS / "runtime" / "dispatch" / "dashboard.html", "live": False,
     "note": "The runtime dispatch dashboard (Alfred's hands)."},

    # ---- Alfred & PAi ----
    {"id": "decision-board", "title": "Decision Board", "group": "Alfred & PAi",
     "kind": "html", "path": _ALFRED / "decision_board" / "DECISION_BOARD.html", "live": False,
     "note": "Alfred's open-questions / decision board."},
    {"id": "pai-architecture", "title": "PAi — Architecture Guide", "group": "Alfred & PAi",
     "kind": "html", "path": _PAI / "pai_architecture_guide_v2.html", "live": False,
     "note": "The Personal-AI architecture (v2, canonical)."},
    {"id": "pai-ingestion", "title": "PAi — Document Ingestion", "group": "Alfred & PAi",
     "kind": "html", "path": _PAI / "document_ingestion_architecture.html", "live": False,
     "note": "The PAi document-ingestion pipeline (geo knowledge base)."},
    {"id": "lattice-connectionpad", "title": "ConnectionPad map (Lattice)", "group": "Alfred & PAi",
     "kind": "lattice", "gid": "connectionpad", "live": True,
     "note": "The ConnectionPad estate map, generated from lodestone state (~152 nodes)."},

    # ---- Commercial ----
    {"id": "commercial-team-flow", "title": "Commercial Team Flowchart", "group": "Commercial",
     "kind": "html", "path": _COMMERCIAL / "Commercial_Team_Flowchart.html", "live": False,
     "note": "The ten-agent marketing & sales engine: intelligence → demand gen → gated sales → "
             "post-sale, with the CRM spine and Paul's confirm gates. v1.0 (2026-07-12)."},

    # ---- Comparison & status ----
    {"id": "vs-jarvis", "title": "HarLin vs Jarvis", "group": "Comparison & status",
     "kind": "html", "path": _DASH / "harlin_vs_jarvis_architecture.html", "live": False,
     "note": "Architecture comparison vs the 'Jarvis' archetype."},
    {"id": "vs-landscape", "title": "Harness vs Global Landscape", "group": "Comparison & status",
     "kind": "html", "path": _DASH / "harness_vs_global_landscape.html", "live": False,
     "note": "Positioning of the harness against the external AI-assistant landscape."},
    {"id": "harness-matrix", "title": "Harness Matrix", "group": "Comparison & status",
     "kind": "html", "path": _DASH / "harness_matrix.html", "live": False,
     "note": "Derived capability matrix of the harness."},
    {"id": "completion-priority", "title": "Completion & Priority", "group": "Comparison & status",
     "kind": "html", "path": _DASH / "completion_priority.html", "live": False,
     "note": "Project completion / priority status board."},
    {"id": "harness-health", "title": "Harness Health", "group": "Comparison & status",
     "kind": "html", "path": _DASH / "health_test.html", "live": True,
     "note": "Cumulative harness stress-test health (regenerated by the stress-test skill)."},

    # ---- Miro (external, hand-built snapshots — drift-prone, OSB-001) ----
    {"id": "miro-stack-alfred", "title": "① Stack + Alfred", "group": "Boards (Miro)",
     "kind": "miro", "href": "https://miro.com/app/board/uXjVH-kZ3gw=/", "live": False,
     "note": "The primary Design Map — four-layer stack + an Alfred worked example. Snapshot."},
    {"id": "miro-hub", "title": "Hub / Index", "group": "Boards (Miro)",
     "kind": "miro", "href": "https://miro.com/app/board/uXjVH-k7ytE=/", "live": False,
     "note": "Series hub cross-linking the Design-Map boards. Snapshot."},
    {"id": "miro-doctrine", "title": "② Doctrine & Principles", "group": "Boards (Miro)",
     "kind": "miro", "href": "https://miro.com/app/board/uXjVH-kbT6c=/", "live": False,
     "note": "HarLin doctrine / principles. Snapshot."},
    {"id": "miro-dataflow", "title": "③ Data & Learning Flow", "group": "Boards (Miro)",
     "kind": "miro", "href": "https://miro.com/app/board/uXjVH-kYNRQ=/", "live": False,
     "note": "capture → learn → promote → inherit data-flow. Snapshot."},
]

_BY_ID = {b["id"]: b for b in _BOARDS}


def _public_url(b: dict) -> str:
    """The URL the pad/board view embeds or opens for this board."""
    if b["kind"] == "html":
        return f"/boards/html/{b['id']}"
    if b["kind"] == "lattice":
        # &t=<now> makes each open a fresh HTTP-cache key: a stale heuristically-cached
        # lattice.html can never mask an updated board (bit Paul 2026-07-12 — the GH-sync
        # checkboxes were invisible after refresh). Pairs with api.py's /boards/ no-cache
        # middleware, which keeps it correct on every subsequent revalidation too.
        import time
        return f"/boards/lattice/lattice.html?g={b['gid']}&t={int(time.time())}"
    return b["href"]  # miro (external)


def _available(b: dict) -> bool:
    if b["kind"] == "html":
        return Path(b["path"]).exists()
    if b["kind"] == "lattice":
        return (LATTICE_APP_DIR / "graphs" / f"{b['gid']}.lattice.js").exists()
    return True  # miro is a remote URL — assume reachable


def listing() -> dict:
    """The Workflows-menu payload: boards grouped, with resolved URLs + live availability."""
    items = []
    for b in _BOARDS:
        items.append({
            "id": b["id"], "title": b["title"], "group": b["group"], "kind": b["kind"],
            "url": _public_url(b), "external": b["kind"] == "miro",
            "live": bool(b.get("live")), "available": _available(b), "note": b.get("note", ""),
        })
    return {"groups": GROUP_ORDER, "boards": items}


def html_path(board_id: str) -> Path:
    """Resolve an html-kind board id to its on-disk file (whitelisted — never an arbitrary path)."""
    b = _BY_ID.get(board_id)
    if not b or b["kind"] != "html":
        raise KeyError(board_id)
    return Path(b["path"])
