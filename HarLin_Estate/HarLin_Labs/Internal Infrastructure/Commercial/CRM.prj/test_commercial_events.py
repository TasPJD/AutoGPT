#!/usr/bin/env python3
"""Acceptance tests for the commercial measurement companion (schema v3).

Runs entirely against an in-memory sandbox DB — never the live store, no
gateway, no network. Covers the eight acceptance tests agreed in the
reconciliation response (TT-0607).

    pytest test_commercial_events.py -q
"""
import sqlite3

import pytest

import commercial_events as ce


def fresh():
    cx = sqlite3.connect(":memory:")
    ce.apply_schema(cx)
    return cx


def base_event(**over):
    rec = dict(
        observed_period_start="2026-08-06T00:00:00Z",
        observed_period_end="2026-08-07T00:00:00Z",
        source_platform="etsy", source_object_id="listing_1001",
        commercial_item_id="ci_masha_pack_a", product_id="prod_pack_a",
        listing_id="listing_1001", campaign_id="camp_aug", experiment_id="exp_1",
        funnel_stage="exposure", metric_name="visits", metric_value=120,
        value_basis="interval", evidence_locator="etsy://stats/2026-08-06",
        collection_method="api", collected_at="2026-08-07T00:05:00Z",
        ingest_run_id="run_1",
    )
    rec.update(over)
    return rec


# 1. Idempotent ingestion
def test_idempotent_ingest():
    cx = fresh()
    assert ce.ingest_event(cx, base_event())["outcome"] == "inserted"
    assert ce.ingest_event(cx, base_event())["outcome"] == "duplicate"
    assert cx.execute("SELECT COUNT(*) FROM commercial_event").fetchone()[0] == 1
    # both attempts leave a receipt (append-only evidence trail)
    assert cx.execute("SELECT COUNT(*) FROM commercial_event_receipt").fetchone()[0] == 2


# 2. Test-traffic excluded from conversion metrics, retained as evidence
def test_test_traffic_exclusion():
    cx = fresh()
    ce.ingest_event(cx, base_event(funnel_stage="conversion", metric_name="orders",
                                   metric_value=5, source_object_id="o_real"))
    ce.ingest_event(cx, base_event(funnel_stage="conversion", metric_name="orders",
                                   metric_value=99, source_object_id="o_test",
                                   is_test_traffic=True))
    real = ce._conversion_sum(cx, "conversion")
    assert real == 5  # the 99 test-traffic orders are excluded
    assert cx.execute("SELECT COUNT(*) FROM commercial_event").fetchone()[0] == 2  # both retained


# 3. Cash distinctness; net only with a receipt
def test_cash_distinctness_and_receipt_guard():
    cx = fresh()
    with pytest.raises(ce.ValidationError):
        ce.record_cash(cx, dict(source_platform="etsy", currency="AUD",
                                occurred_at="2026-08-07T00:00:00Z",
                                gross=50, fees=5, net_verified=45))  # no receipt
    cid = ce.record_cash(cx, dict(source_platform="etsy", currency="AUD",
                                  occurred_at="2026-08-07T00:00:00Z", gross=50, fees=5,
                                  refunds=0, net_verified=45, receipt_locator="etsy://payout/1"))
    row = cx.execute("SELECT gross, fees, refunds, net_verified, verified FROM commercial_cash "
                     "WHERE cash_id=?", (cid,)).fetchone()
    assert row == (50.0, 5.0, 0.0, 45.0, 1)


# 4. Attribution honesty — unknown stays unknown
def test_attribution_unknown_preserved():
    cx = fresh()
    ce.ingest_event(cx, base_event(attribution_source="unknown", attribution_confidence=None))
    src, conf = cx.execute(
        "SELECT attribution_source, attribution_confidence FROM commercial_event").fetchone()
    assert src == "unknown" and conf is None


# 5. Multi-platform mapping without schema change
def test_multi_platform_mapping():
    cx = fresh()
    ce.ingest_event(cx, base_event(source_platform="etsy", metric_name="favourites",
                                   funnel_stage="interest", source_object_id="e1"))
    ce.ingest_event(cx, base_event(source_platform="gumroad", metric_name="sales",
                                   funnel_stage="conversion", source_object_id="g1"))
    ce.ingest_event(cx, base_event(source_platform="tiktok", metric_name="impressions",
                                   funnel_stage="exposure", source_object_id="t1"))
    platforms = {r[0] for r in cx.execute("SELECT DISTINCT source_platform FROM commercial_event")}
    assert platforms == {"etsy", "gumroad", "tiktok"}


# 6. Experiment gate resolves pass/kill at thresholds; Revenue decision wins
def test_experiment_gate():
    cx = fresh()
    assert ce.upsert_experiment_state(cx, dict(experiment_id="e_p", gate_metric="cvr",
        pass_threshold=0.02, kill_threshold=0.005, measured_value=0.02))["gate_result"] == "pass"
    assert ce.upsert_experiment_state(cx, dict(experiment_id="e_k", gate_metric="cvr",
        pass_threshold=0.02, kill_threshold=0.005, measured_value=0.005))["gate_result"] == "kill"
    assert ce.upsert_experiment_state(cx, dict(experiment_id="e_r", gate_metric="cvr",
        pass_threshold=0.02, kill_threshold=0.005, measured_value=0.01))["gate_result"] == "running"
    # explicit Revenue decision overrides the derived gate (R2)
    r = ce.upsert_experiment_state(cx, dict(experiment_id="e_r", gate_metric="cvr",
        pass_threshold=0.02, kill_threshold=0.005, measured_value=0.01,
        gate_result="change", decided_by="revenue"))
    assert r["gate_result"] == "change"


# 7. Provenance enforced (no observation without evidence)
def test_provenance_enforced():
    cx = fresh()
    bad = base_event()
    del bad["evidence_locator"]
    with pytest.raises(ce.ValidationError):
        ce.ingest_event(cx, bad)
    with pytest.raises(ce.ValidationError):
        ce.ingest_event(cx, base_event(funnel_stage="not_a_stage"))


# 8. Reports + snapshot (the read-only surface Alfred consumes)
def test_reports_and_snapshot():
    cx = fresh()
    ce.ingest_event(cx, base_event(funnel_stage="exposure", metric_name="visits",
                                   metric_value=200, source_object_id="x1"))
    ce.ingest_event(cx, base_event(funnel_stage="conversion", metric_name="orders",
                                   metric_value=0, source_object_id="x2",
                                   data_quality_flags="late_snapshot"))
    exc = ce.report_daily_exceptions(cx)
    types = {e["type"] for e in exc}
    assert "data_quality" in types and "zero_conversion" in types
    ce.record_cash(cx, dict(source_platform="etsy", currency="AUD",
                            occurred_at="2026-08-07T00:00:00Z", gross=0))
    learning = ce.report_weekly_learning(cx)
    assert "funnel_by_product" in learning and "cash_by_item" in learning
    snap_id = ce.generate_snapshot(cx, scope="all", window="7d")
    assert cx.execute("SELECT COUNT(*) FROM commercial_snapshot WHERE snapshot_id=?",
                      (snap_id,)).fetchone()[0] == 1
