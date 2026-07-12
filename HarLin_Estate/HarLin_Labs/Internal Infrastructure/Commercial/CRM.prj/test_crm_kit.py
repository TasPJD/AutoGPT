"""CRM v1 kit validation suite (schema + migration + tools) — pure, throwaway DB.

Everything here runs against a temp-directory database; the estate is never
touched. The live-store bootstrap lives separately in test_live_bootstrap.py.
"""
import sqlite3
import sys
from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import crm_migrate  # noqa: E402
import crm_tools as t  # noqa: E402


@pytest.fixture()
def db(tmp_path, monkeypatch):
    path = tmp_path / "crm_test.db"
    monkeypatch.setattr(sys, "argv", ["crm_migrate.py", "--db", str(path)])
    assert crm_migrate.main() == 0
    cx = t._connect(str(path))
    yield cx
    cx.close()


def test_migration_idempotent(tmp_path, monkeypatch):
    path = tmp_path / "crm_idem.db"
    for _ in range(2):
        monkeypatch.setattr(sys, "argv", ["crm_migrate.py", "--db", str(path), "--no-backup"])
        assert crm_migrate.main() == 0
    cx = sqlite3.connect(path)
    names = {r[0] for r in cx.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    cx.close()
    assert {"crm_companies", "crm_contacts", "crm_interactions",
            "crm_opportunities", "crm_campaigns", "crm_campaign_touches", "crm_meta"} <= names


def _seed(cx):
    t.crm_upsert_company(cx, name="Barton Gold", stream="consulting", status="client")
    t.crm_upsert_contact(cx, name="Jane Doe", company_id="co_barton_gold",
                         consent_basis="existing_relationship")


def test_unapproved_outbound_refused(db):
    _seed(db)
    with pytest.raises(t.ConsentError):
        t.crm_log_interaction(db, "outbound", "email", "envoy", "hi",
                              contact_id="ct_jane_doe_barton_gold")


def test_no_consent_refused(db):
    _seed(db)
    t.crm_upsert_contact(db, name="No Consent", company_id="co_barton_gold")
    with pytest.raises(t.ConsentError):
        t.crm_log_interaction(db, "outbound", "email", "envoy", "hi",
                              human_approved=True, contact_id="ct_no_consent_barton_gold")


def test_do_not_contact_absolute(db):
    _seed(db)
    db.execute("UPDATE crm_contacts SET do_not_contact=1 WHERE id='ct_jane_doe_barton_gold'")
    db.commit()
    with pytest.raises(t.ConsentError):   # approved send still refused
        t.crm_log_interaction(db, "outbound", "email", "envoy", "hi",
                              human_approved=True, contact_id="ct_jane_doe_barton_gold")
    with pytest.raises(t.ConsentError):   # agents cannot clear the flag
        t.crm_upsert_contact(db, name="Jane Doe", company_id="co_barton_gold",
                             id="ct_jane_doe_barton_gold", do_not_contact=0)


def test_lost_requires_reason_and_won_promotes(db):
    _seed(db)
    with pytest.raises(ValueError):
        t.crm_upsert_opportunity(db, "co_barton_gold", "nexus", "Pilot", stage="lost")
    t.crm_upsert_opportunity(db, "co_barton_gold", "nexus", "Pilot",
                             stage="won", value_aud=25000)
    status = db.execute("SELECT status FROM crm_companies WHERE id='co_barton_gold'").fetchone()
    assert status["status"] == "client"


def test_pipeline_and_export(db, tmp_path):
    _seed(db)
    t.crm_upsert_opportunity(db, "co_barton_gold", "nexus", "Pilot",
                             stage="qualified", value_aud=25000, probability=0.4,
                             next_action="demo", next_action_owner="paul")
    rep = t.crm_pipeline_report(db)
    assert rep and rep[0]["weighted_aud"] == 10000.0
    assert t.crm_next_actions(db, owner="paul")
    out = t.crm_export(db, str(tmp_path / "exp"))
    assert out["tables"] == 7
