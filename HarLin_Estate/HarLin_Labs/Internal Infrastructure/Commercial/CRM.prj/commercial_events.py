#!/usr/bin/env python3
"""HarLin commercial measurement — companion event ingestion & reporting.

The single write path for anonymous exposure/interest/intent/conversion
metrics from reputation-independent revenue experiments (Etsy/Gumroad/
social). Named, consent-governed people/opportunities stay in the crm_*
tables; this module never touches them.

Reconciled with Revenue Bridge under PROC-RB-COMMERCIAL-INTERFACE-20260731
(TT-0606 request / TT-0607 response). Design notes live in
`Revenue_Bridge.prj/Tag_Team/COMMERCIAL_MEASUREMENT_RECONCILIATION_RESPONSE_20260807.md`.

Guarantees:
  * Provenance enforced (HP-12): no observation without evidence locator,
    collection method and timestamp.
  * Idempotent ingest: deterministic event_id from the natural key, so a
    re-ingested snapshot yields one logical record.
  * Cash truth (gross/fees/refunds/net) is distinct from funnel metrics.
  * Experiment gate decision is Revenue's; we record the measured comparison.
  * Every ingest writes an append-only evidence receipt.

Pure sqlite3 + stdlib, so it dry-runs against a sandbox DB copy off-machine.
It is NOT wired into the live gateway and mutates no live store by itself.
"""
from __future__ import annotations

import hashlib
import json
import sqlite3
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCHEMA_V3 = HERE / "schema_v3.sql"

FUNNEL_STAGES = {"exposure", "interest", "intent", "conversion", "retention", "refund"}
VALUE_BASES = {"cumulative", "interval"}
REQUIRED_FIELDS = (
    "observed_period_start", "observed_period_end", "source_platform",
    "source_object_id", "funnel_stage", "metric_name", "metric_value",
    "value_basis", "evidence_locator", "collection_method", "collected_at",
    "ingest_run_id",
)


class ValidationError(ValueError):
    """Raised when a normalized record fails the provenance/shape contract."""


def apply_schema(cx: sqlite3.Connection) -> None:
    """Apply the companion schema (idempotent). Used for sandbox/tests."""
    cx.executescript(SCHEMA_V3.read_text(encoding="utf-8"))


def _natural_key(rec: dict) -> str:
    return "|".join(str(rec[k]) for k in (
        "source_platform", "source_object_id", "metric_name",
        "observed_period_start", "observed_period_end"))


def _event_id(rec: dict) -> str:
    return "ce_" + hashlib.sha256(_natural_key(rec).encode("utf-8")).hexdigest()[:16]


def _row_hash(rec: dict) -> str:
    canonical = json.dumps(rec, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _validate(rec: dict) -> None:
    missing = [f for f in REQUIRED_FIELDS
               if rec.get(f) in (None, "") and rec.get(f) != 0]
    if missing:
        raise ValidationError(f"missing required field(s): {', '.join(missing)}")
    if rec["funnel_stage"] not in FUNNEL_STAGES:
        raise ValidationError(f"funnel_stage must be one of {sorted(FUNNEL_STAGES)}")
    if rec["value_basis"] not in VALUE_BASES:
        raise ValidationError(f"value_basis must be one of {sorted(VALUE_BASES)}")
    try:
        float(rec["metric_value"])
    except (TypeError, ValueError):
        raise ValidationError("metric_value must be numeric")


def ingest_event(cx: sqlite3.Connection, rec: dict) -> dict:
    """Validate, idempotently insert one normalized observation, and receipt it.

    Returns {'event_id', 'outcome'} where outcome is 'inserted' or 'duplicate'.
    Attribution left unknown stays unknown (never fabricated).
    """
    _validate(rec)
    event_id = _event_id(rec)
    row_hash = _row_hash(rec)
    cur = cx.execute(
        """INSERT OR IGNORE INTO commercial_event
           (event_id, observed_period_start, observed_period_end, source_platform,
            source_object_id, commercial_item_id, product_id, listing_id, campaign_id,
            experiment_id, funnel_stage, metric_name, metric_value, currency,
            value_basis, attribution_source, attribution_confidence, evidence_locator,
            collection_method, collected_at, is_test_traffic, data_quality_flags,
            ingest_run_id, row_hash)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (event_id, rec["observed_period_start"], rec["observed_period_end"],
         rec["source_platform"], rec["source_object_id"], rec.get("commercial_item_id"),
         rec.get("product_id"), rec.get("listing_id"), rec.get("campaign_id"),
         rec.get("experiment_id"), rec["funnel_stage"], rec["metric_name"],
         float(rec["metric_value"]), rec.get("currency"), rec["value_basis"],
         rec.get("attribution_source", "unknown"), rec.get("attribution_confidence"),
         rec["evidence_locator"], rec["collection_method"], rec["collected_at"],
         1 if rec.get("is_test_traffic") else 0, rec.get("data_quality_flags"),
         rec["ingest_run_id"], row_hash),
    )
    outcome = "inserted" if cur.rowcount == 1 else "duplicate"
    cx.execute(
        """INSERT INTO commercial_event_receipt
           (receipt_id, event_id, ingest_run_id, row_hash, outcome, detail)
           VALUES (?,?,?,?,?,?)""",
        ("re_" + uuid.uuid4().hex[:12], event_id, rec["ingest_run_id"], row_hash,
         outcome, _natural_key(rec)),
    )
    return {"event_id": event_id, "outcome": outcome}


def record_cash(cx: sqlite3.Connection, rec: dict) -> str:
    """Record a cash fact. gross/fees/refunds distinct; net_verified only with a receipt."""
    for f in ("source_platform", "currency", "occurred_at"):
        if not rec.get(f):
            raise ValidationError(f"cash record missing '{f}'")
    verified = bool(rec.get("receipt_locator"))
    net = rec.get("net_verified")
    if net is not None and not verified:
        raise ValidationError("net_verified may only be set with a receipt_locator")
    cash_id = "cash_" + uuid.uuid4().hex[:12]
    cx.execute(
        """INSERT INTO commercial_cash
           (cash_id, commercial_item_id, product_id, source_platform, source_object_id,
            gross, fees, refunds, net_verified, currency, occurred_at, receipt_locator, verified)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (cash_id, rec.get("commercial_item_id"), rec.get("product_id"),
         rec["source_platform"], rec.get("source_object_id"),
         float(rec.get("gross", 0)), float(rec.get("fees", 0)), float(rec.get("refunds", 0)),
         net, rec["currency"], rec["occurred_at"], rec.get("receipt_locator"),
         1 if verified else 0),
    )
    return cash_id


def upsert_experiment_state(cx: sqlite3.Connection, rec: dict) -> dict:
    """Record the measured comparison and resulting gate.

    gate_result is derived from thresholds unless Revenue supplies an explicit
    decision (decided_by='revenue'), which always wins (R2).
    """
    measured = rec.get("measured_value")
    pass_t = rec.get("pass_threshold")
    kill_t = rec.get("kill_threshold")
    gate = rec.get("gate_result")
    if gate is None and measured is not None:
        if pass_t is not None and measured >= pass_t:
            gate = "pass"
        elif kill_t is not None and measured <= kill_t:
            gate = "kill"
        else:
            gate = "running"
    cx.execute(
        """INSERT INTO commercial_experiment_state
           (experiment_id, variant, commercial_item_id, gate_metric, pass_threshold,
            kill_threshold, measured_value, gate_result, decided_by)
           VALUES (?,?,?,?,?,?,?,?,?)
           ON CONFLICT(experiment_id, variant) DO UPDATE SET
             measured_value=excluded.measured_value,
             gate_result=excluded.gate_result,
             decided_by=excluded.decided_by,
             measured_at=strftime('%Y-%m-%dT%H:%M:%SZ','now')""",
        (rec["experiment_id"], rec.get("variant", "default"), rec.get("commercial_item_id"),
         rec["gate_metric"], pass_t, kill_t, measured, gate, rec.get("decided_by")),
    )
    return {"experiment_id": rec["experiment_id"], "variant": rec.get("variant", "default"),
            "gate_result": gate}


def _conversion_sum(cx, stage: str, where: str = "", args=()) -> float:
    q = ("SELECT COALESCE(SUM(metric_value),0) FROM commercial_event "
         "WHERE funnel_stage=? AND is_test_traffic=0")
    return cx.execute(q + where, (stage, *args)).fetchone()[0]


def report_daily_exceptions(cx: sqlite3.Connection) -> list[dict]:
    """Anomalies a human should look at: data-quality flags, test-traffic
    reaching conversion, and exposure-without-conversion per product."""
    out: list[dict] = []
    for r in cx.execute(
        "SELECT event_id, source_platform, data_quality_flags FROM commercial_event "
        "WHERE data_quality_flags IS NOT NULL AND data_quality_flags != ''"):
        out.append({"type": "data_quality", "event_id": r[0],
                    "platform": r[1], "flags": r[2]})
    for r in cx.execute(
        "SELECT event_id, source_platform FROM commercial_event "
        "WHERE is_test_traffic=1 AND funnel_stage='conversion'"):
        out.append({"type": "test_traffic_conversion", "event_id": r[0], "platform": r[1]})
    for r in cx.execute(
        """SELECT product_id,
                  SUM(CASE WHEN funnel_stage='exposure' THEN metric_value ELSE 0 END) exp,
                  SUM(CASE WHEN funnel_stage='conversion' THEN metric_value ELSE 0 END) conv
           FROM commercial_event WHERE is_test_traffic=0 AND product_id IS NOT NULL
           GROUP BY product_id"""):
        if r[1] and r[1] > 0 and (r[2] or 0) == 0:
            out.append({"type": "zero_conversion", "product_id": r[0], "exposure": r[1]})
    return out


def report_weekly_learning(cx: sqlite3.Connection) -> dict:
    """Funnel by product, net cash by item, and experiment gate status."""
    funnel: dict[str, dict[str, float]] = {}
    for r in cx.execute(
        """SELECT product_id, funnel_stage, SUM(metric_value)
           FROM commercial_event WHERE is_test_traffic=0
           GROUP BY product_id, funnel_stage"""):
        funnel.setdefault(r[0] or "(unassigned)", {})[r[1]] = r[2]
    cash = {}
    for r in cx.execute(
        """SELECT commercial_item_id,
                  SUM(gross), SUM(fees), SUM(refunds),
                  SUM(COALESCE(net_verified,0))
           FROM commercial_cash GROUP BY commercial_item_id"""):
        cash[r[0] or "(unassigned)"] = {"gross": r[1], "fees": r[2],
                                        "refunds": r[3], "net_verified": r[4]}
    experiments = [dict(zip(
        ("experiment_id", "variant", "gate_metric", "measured_value", "gate_result", "decided_by"), r))
        for r in cx.execute(
            "SELECT experiment_id, variant, gate_metric, measured_value, gate_result, decided_by "
            "FROM commercial_experiment_state")]
    return {"funnel_by_product": funnel, "cash_by_item": cash, "experiments": experiments}


def generate_snapshot(cx: sqlite3.Connection, scope: str, window: str) -> str:
    """Persist a point-in-time aggregate for reporting/Alfred read-only surface."""
    metrics = report_weekly_learning(cx)
    snap_id = "csnap_" + uuid.uuid4().hex[:12]
    cx.execute(
        "INSERT INTO commercial_snapshot (snapshot_id, generated_at, scope, window, metrics_json) "
        "VALUES (?, strftime('%Y-%m-%dT%H:%M:%SZ','now'), ?, ?, ?)",
        (snap_id, scope, window, json.dumps(metrics, default=str)),
    )
    return snap_id
