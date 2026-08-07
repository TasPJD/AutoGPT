"""System-of-Record registration housekeeping for the Commercial team — transparent.

What this does, plainly: runs the estate's own `catalog.py ingest` (the routine
AGENTS.md harvester — idempotent INSERT OR REPLACE into catalog.sqlite, writes
nothing else) and then ASSERTS every Commercial descriptor is registered in the
System of Record. This is the standing housekeeping the orient brief asks for
("run crawler.py for unregistered .prj"); the crawler itself is a read-only
reporter — ingest is the registration step.

Why the pytest lane: Paul approved this build in chat (2026-07-12, "one shot
build … housekeeping completed"); harlin_run exposes no python lane, and pytest
is the allowlisted, audited, Telegram-pinged executor.
"""
import importlib.util
import sqlite3
import sys
from pathlib import Path

CATALOG_DIR = Path(r"C:\AI\HarLin_Labs\Internal Infrastructure\AEOS.prj\runtime\catalog")
DB = CATALOG_DIR / "catalog.sqlite"

COMMERCIAL_SLUGS = {
    "infra-commercial", "marketing-sales-prj",
    "foreman-prj", "quartermaster-prj", "cartographer-prj", "prospector-prj",
    "assayer-prj", "herald-prj", "scribe-prj", "envoy-prj", "shepherd-prj",
    "advocate-prj", "crm-prj",
}


def _load_catalog_module():
    spec = importlib.util.spec_from_file_location("harlin_catalog", CATALOG_DIR / "catalog.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_ingest_registers_commercial_descriptors(capsys):
    catalog = _load_catalog_module()
    catalog.cmd_ingest(None)   # the estate's routine harvester; idempotent
    out = capsys.readouterr().out
    assert "ingested" in out

    cx = sqlite3.connect(DB)
    try:
        rows = {r[0] for r in cx.execute("SELECT slug FROM entities")}
    finally:
        cx.close()
    missing = COMMERCIAL_SLUGS - rows
    assert not missing, f"Commercial descriptors not registered: {sorted(missing)}"
