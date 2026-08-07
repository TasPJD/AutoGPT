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
    assert out["tables"] == 10  # v1's 7 + v2's audit/stage_history/snapshots


# ---------------------------------------------------------------- v2 features

def test_stage_history_recorded(db):
    _seed(db)
    t.crm_upsert_opportunity(db, "co_barton_gold", "nexus", "Pilot",
                             stage="identified", agent="foreman")
    t.crm_upsert_opportunity(db, "co_barton_gold", "nexus", "Pilot",
                             stage="qualified", agent="assayer")
    hist = db.execute("SELECT from_stage, to_stage, changed_by FROM crm_stage_history "
                      "ORDER BY changed_at").fetchall()
    assert [(h["from_stage"], h["to_stage"]) for h in hist] == \
           [(None, "identified"), ("identified", "qualified")]
    assert hist[1]["changed_by"] == "assayer"


def test_reopen_guard(db):
    _seed(db)
    t.crm_upsert_opportunity(db, "co_barton_gold", "nexus", "Pilot",
                             stage="lost", lost_reason="budget cut")
    with pytest.raises(ValueError):
        t.crm_upsert_opportunity(db, "co_barton_gold", "nexus", "Pilot", stage="qualified")
    r = t.crm_upsert_opportunity(db, "co_barton_gold", "nexus", "Pilot",
                                 stage="qualified", reopen=True, agent="paul")
    assert r["action"] == "updated"


def test_audit_trail_written(db):
    _seed(db)
    rows = db.execute("SELECT entity, action FROM crm_audit").fetchall()
    assert ("company", "created") in [(r["entity"], r["action"]) for r in rows]
    # refusals are audited too
    with pytest.raises(t.ConsentError):
        t.crm_log_interaction(db, "outbound", "email", "envoy", "hi",
                              contact_id="ct_jane_doe_barton_gold")
    assert db.execute("SELECT 1 FROM crm_audit WHERE action='refused_unapproved'").fetchone()


def test_snapshot_and_overdue(db):
    _seed(db)
    t.crm_upsert_opportunity(db, "co_barton_gold", "nexus", "Pilot",
                             stage="qualified", value_aud=10000, probability=0.5,
                             next_action="follow up", next_action_owner="paul",
                             next_action_due="2020-01-01")
    snap = t.crm_snapshot_pipeline(db)
    assert snap["rows"] == 1
    assert db.execute("SELECT COUNT(*) c FROM crm_pipeline_snapshots").fetchone()["c"] == 1
    overdue = t.crm_next_actions(db, overdue_only=True)
    assert overdue and overdue[0]["next_action_due"] == "2020-01-01"


def test_email_dedup_guard(db):
    _seed(db)
    t.crm_upsert_contact(db, name="Jane Doe", company_id="co_barton_gold",
                         id="ct_jane_doe_barton_gold", email="jane@barton.com")
    with pytest.raises(sqlite3.IntegrityError):
        t.crm_upsert_contact(db, name="J. Doe", company_id="co_barton_gold",
                             email="JANE@barton.com", consent_basis="express")


def test_consent_evidence_column(db):
    _seed(db)
    t.crm_upsert_contact(db, name="Jane Doe", company_id="co_barton_gold",
                         id="ct_jane_doe_barton_gold",
                         consent_evidence="met at Diggers 2026, exchanged cards")
    row = db.execute("SELECT consent_evidence FROM crm_contacts "
                     "WHERE id='ct_jane_doe_barton_gold'").fetchone()
    assert "Diggers" in row["consent_evidence"]
