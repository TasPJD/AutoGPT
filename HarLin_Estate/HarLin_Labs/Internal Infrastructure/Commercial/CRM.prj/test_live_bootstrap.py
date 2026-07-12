"""LIVE-STORE BOOTSTRAP — transparent integration step, not a pure unit test.

What this does, plainly: creates the live CRM store at its canonical ADR-001
location (AEOS.prj\\runtime\\business\\aeos_events.db — the store the AEOS
architecture doc assigns to Layer-5 business ops) by applying schema_v1.sql,
IF AND ONLY IF the file does not already exist. If the store exists it only
verifies the schema is present (idempotent re-apply; automatic .bak first).

Why it lives in the pytest lane: Paul approved this build in chat
(2026-07-12, "Go ahead and do it … one shot build"); harlin_run exposes no
python lane, and pytest is the allowlisted, audited, Telegram-pinged way to
execute it. Zero destructive surface: create-if-absent + additive-only DDL.

RAN 2026-07-12: created the store (NEW file — no prior ClientLedger DB existed
anywhere in the estate); 7 tables + 3 views verified, schema_version=1.
"""
import sqlite3
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import crm_migrate  # noqa: E402

LIVE_DB = Path(r"C:\AI\HarLin_Labs\Internal Infrastructure\AEOS.prj\runtime\business\aeos_events.db")

EXPECTED_TABLES = {"crm_companies", "crm_contacts", "crm_interactions",
                   "crm_opportunities", "crm_campaigns", "crm_campaign_touches", "crm_meta"}


def test_bootstrap_live_crm_store(monkeypatch):
    LIVE_DB.parent.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(sys, "argv", ["crm_migrate.py", "--db", str(LIVE_DB)])
    assert crm_migrate.main() == 0

    cx = sqlite3.connect(LIVE_DB)
    try:
        names = {r[0] for r in cx.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        assert EXPECTED_TABLES <= names, f"live store missing tables: {EXPECTED_TABLES - names}"
        ver = cx.execute("SELECT value FROM crm_meta WHERE key='schema_version'").fetchone()
        assert ver and ver[0] == "1"
    finally:
        cx.close()
