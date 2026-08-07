#!/usr/bin/env python3
"""Tests for the deterministic S5->S2 snapshot adapter.

Uses synthetic snapshots that mirror the real Revenue S5 raw contract
(schema_version 1) so the test is self-contained and does not duplicate
S5-owned data. Runs against an in-memory sandbox DB.

    pytest test_commercial_snapshot_adapter.py -q
"""
import sqlite3

import commercial_events as ce
import commercial_snapshot_adapter as ad


def fresh():
    cx = sqlite3.connect(":memory:")
    ce.apply_schema(cx)
    return cx


ETSY_SHOP = {
    "schema_version": 1, "source_platform": "etsy", "source_account_ref": "MSHarLinCreations",
    "source_object_id": None, "scope": "shop",
    "observed_period_start": "2026-08-01T00:00:00+10:00",
    "observed_period_end": "2026-08-07T14:07:44+10:00",
    "collected_at": "2026-08-07T14:07:44+10:00", "collection_method": "manual_ui",
    "evidence_locator": "C:/AI/.../ETSY_STATS.md",
    "data_quality_flags": ["possible_operator_traffic"],
    "metrics": [
        {"metric_name": "visits", "metric_value": 7, "unit": "count", "value_basis": "interval",
         "funnel_stage": "interest", "analysis_inclusion": "evidence_only",
         "attribution_source": "all_sources", "attribution_confidence": "platform_reported"},
        {"metric_name": "favourites", "metric_value": 0, "unit": "count", "value_basis": "interval",
         "funnel_stage": "intent", "analysis_inclusion": "include",
         "attribution_source": None, "attribution_confidence": "platform_reported"},
        {"metric_name": "orders", "metric_value": 0, "unit": "count", "value_basis": "interval",
         "funnel_stage": "conversion", "analysis_inclusion": "include",
         "attribution_source": None, "attribution_confidence": "platform_reported"},
    ],
    "cash": [],
}

GUMROAD = {
    "schema_version": 1, "source_platform": "gumroad", "source_account_ref": "msharlincreations",
    "source_object_id": "73VcN2P2MKEgP4Gg59nROQ==", "scope": "product",
    "commercial_item_id": "MERCH-DIG-001", "product_id": "au-sole-trader-finance-kit-v2",
    "observed_period_start": "2026-08-07T14:01:33+10:00",
    "observed_period_end": "2026-08-07T14:01:33+10:00",
    "collected_at": "2026-08-07T14:01:33+10:00", "collection_method": "api",
    "evidence_locator": "C:/AI/.../GUMROAD_API.md",
    "data_quality_flags": ["product_disabled", "zero_sales_endpoint_records"],
    "metrics": [
        {"metric_name": "published", "metric_value": 0, "unit": "boolean_int",
         "value_basis": "point_in_time", "funnel_stage": "operational",
         "analysis_inclusion": "include", "attribution_source": "gumroad_api_v2",
         "attribution_confidence": "direct"},
        {"metric_name": "platform_reported_revenue", "metric_value": 0, "unit": "USD_cents",
         "value_basis": "cumulative", "funnel_stage": "conversion",
         "analysis_inclusion": "include", "attribution_source": "gumroad_api_v2",
         "attribution_confidence": "direct"},
    ],
    "cash": [],
}


def test_explode_metrics():
    events, cash = ad.adapt_snapshot(ETSY_SHOP, "run_1")
    assert len(events) == 3 and cash == []


def test_null_object_id_gets_stable_key_and_is_idempotent():
    cx = fresh()
    events, _ = ad.adapt_snapshot(ETSY_SHOP, "run_1")
    assert all(e["source_object_id"] == "shop:MSHarLinCreations" for e in events)
    for e in events:
        ce.ingest_event(cx, e)
    # re-ingest the same snapshot -> no new rows (deterministic natural key)
    for e in ad.adapt_snapshot(ETSY_SHOP, "run_2")[0]:
        assert ce.ingest_event(cx, e)["outcome"] == "duplicate"
    assert cx.execute("SELECT COUNT(*) FROM commercial_event").fetchone()[0] == 3


def test_evidence_only_excluded_from_analysis():
    cx = fresh()
    for e in ad.adapt_snapshot(ETSY_SHOP, "run_1")[0]:
        ce.ingest_event(cx, e)
    # 7 'visits' are evidence_only -> excluded from analysed interest
    assert ce._conversion_sum(cx, "interest") == 0
    # but retained as evidence
    assert cx.execute("SELECT COUNT(*) FROM commercial_event WHERE metric_name='visits'"
                      ).fetchone()[0] == 1


def test_gumroad_point_in_time_and_operational_ingest():
    cx = fresh()
    for e in ad.adapt_snapshot(GUMROAD, "run_1")[0]:
        assert ce.ingest_event(cx, e)["outcome"] == "inserted"
    row = cx.execute("SELECT unit, currency, value_basis, funnel_stage FROM commercial_event "
                     "WHERE metric_name='published'").fetchone()
    assert row == ("boolean_int", None, "point_in_time", "operational")  # non-monetary -> no currency
    rev = cx.execute("SELECT unit, currency FROM commercial_event "
                     "WHERE metric_name='platform_reported_revenue'").fetchone()
    assert rev == ("USD_cents", "USD_cents")  # monetary unit -> currency carried


def test_deterministic_event_ids():
    a = [ce._event_id(e) for e in ad.adapt_snapshot(GUMROAD, "run_a")[0]]
    b = [ce._event_id(e) for e in ad.adapt_snapshot(GUMROAD, "run_b")[0]]
    assert a == b  # ingest_run_id does not affect identity
