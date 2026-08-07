#!/usr/bin/env python3
"""Deterministic S5->S2 adapter: Revenue raw channel snapshots -> S2 records.

Maps the append-only raw channel snapshot contract (schema_version 1) produced
by Revenue Bridge S5 into the normalized commercial_event shape consumed by
`commercial_events.ingest_event`. One raw snapshot explodes into one S2 record
per metric.

Deterministic + idempotent: re-adapting and re-ingesting the same snapshot
yields the same event_ids and no duplicate rows (S2 natural key). Anonymous
funnel evidence only — never touches crm_contacts/opportunities. Setup/operator
traffic is preserved as evidence but carried out of analysis via
`analysis_inclusion='evidence_only'` (the S5 exclusion signal), not deleted.

Reconciled under PROC-RB-COMMERCIAL-INTERFACE-20260731 (TT-0613 handoff).
Pure stdlib; no network, no live store, no gateway.
"""
from __future__ import annotations

import json
from pathlib import Path

# Units that are not monetary -> no currency is recorded for them.
NON_MONETARY_UNITS = {"count", "boolean_int", "percent", "ratio"}


def _object_key(snap: dict) -> str:
    """Stable, non-null source object key.

    Raw shop/account-scope snapshots carry source_object_id=null; a NULL in the
    S2 idempotency natural key would defeat de-duplication (NULL != NULL in a
    UNIQUE index), so derive a deterministic key from scope + account.
    """
    oid = snap.get("source_object_id")
    if oid:
        return str(oid)
    return f"{snap.get('scope', 'scope')}:{snap.get('source_account_ref', '')}"


def adapt_snapshot(snap: dict, ingest_run_id: str) -> tuple[list[dict], list[dict]]:
    """Return (event_records, cash_records) for one raw snapshot object."""
    object_key = _object_key(snap)
    flags = snap.get("data_quality_flags") or []
    flags_csv = ",".join(flags) if flags else None
    common = dict(
        observed_period_start=snap["observed_period_start"],
        observed_period_end=snap["observed_period_end"],
        source_platform=snap["source_platform"],
        source_object_id=object_key,
        commercial_item_id=snap.get("commercial_item_id"),
        product_id=snap.get("product_id"),
        listing_id=snap.get("listing_id"),
        campaign_id=snap.get("campaign_id"),
        experiment_id=snap.get("experiment_id"),
        evidence_locator=snap["evidence_locator"],
        collection_method=snap["collection_method"],
        collected_at=snap["collected_at"],
        data_quality_flags=flags_csv,
        ingest_run_id=ingest_run_id,
    )
    events: list[dict] = []
    for m in snap.get("metrics", []):
        unit = m.get("unit")
        currency = unit if (unit and unit not in NON_MONETARY_UNITS) else None
        rec = dict(common)
        rec.update(
            funnel_stage=m["funnel_stage"],
            metric_name=m["metric_name"],
            metric_value=m["metric_value"],
            unit=unit,
            currency=currency,
            value_basis=m["value_basis"],
            analysis_inclusion=m.get("analysis_inclusion", "include"),
            attribution_source=m.get("attribution_source") or "unknown",
            attribution_confidence=m.get("attribution_confidence"),
            # S5 marks exclusion via analysis_inclusion; these snapshots carry no
            # explicit test flag, so is_test_traffic stays False.
            is_test_traffic=False,
        )
        events.append(rec)
    cash: list[dict] = []
    for c in snap.get("cash", []):
        cash.append(dict(
            commercial_item_id=snap.get("commercial_item_id"),
            product_id=snap.get("product_id"),
            source_platform=snap["source_platform"],
            source_object_id=object_key,
            gross=c.get("gross", 0), fees=c.get("fees", 0), refunds=c.get("refunds", 0),
            net_verified=c.get("net_verified"), currency=c.get("currency"),
            occurred_at=c.get("occurred_at"), receipt_locator=c.get("receipt_locator"),
        ))
    return events, cash


def load_and_adapt(jsonl_path, ingest_run_id: str) -> tuple[list[dict], list[dict]]:
    events: list[dict] = []
    cash: list[dict] = []
    for line in Path(jsonl_path).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        e, c = adapt_snapshot(json.loads(line), ingest_run_id)
        events += e
        cash += c
    return events, cash


def ingest_file(cx, commercial_events, jsonl_path, ingest_run_id: str) -> dict:
    """Adapt a snapshot file and ingest through S2. Returns a summary."""
    events, cash = load_and_adapt(jsonl_path, ingest_run_id)
    outcomes = {"inserted": 0, "duplicate": 0}
    for rec in events:
        outcomes[commercial_events.ingest_event(cx, rec)["outcome"]] += 1
    cash_ids = [commercial_events.record_cash(cx, c) for c in cash]
    return {"events": len(events), **outcomes, "cash_records": len(cash_ids)}
