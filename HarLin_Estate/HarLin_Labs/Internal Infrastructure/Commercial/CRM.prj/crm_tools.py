#!/usr/bin/env python3
"""HarLin CRM gateway tools (ADR-001; schema v1 + v2).

Framework-agnostic tool functions — the SOLE write path to the CRM.
Designed to be registered with the AEOS MCP Gateway (or its FastAPI
wrapper) with a thin adapter; also runnable from the CLI for testing.

Hard rules enforced here, not in agent prompts:
  * An outbound interaction against a do_not_contact contact, a resting
    contact, or a consent_basis of 'none' is REFUSED (ConsentError).
  * stage='lost' requires lost_reason.
  * Reopening a won/lost opportunity requires an explicit reopen=True.
  * Every write stamps last_touched/updated_at, appends to crm_audit,
    and stage changes are recorded in crm_stage_history (v2).

Stdlib only. DB path comes from CRM_DB env var or --db.
"""
from __future__ import annotations

import json
import os
import re
import sqlite3
import sys
import uuid
import datetime as dt
from pathlib import Path

STREAMS = {"nexus", "consulting", "labs", "masha"}
STAGES = {"identified", "qualified", "meeting", "proposal", "negotiation", "won", "lost", "parked"}
CLOSED = {"won", "lost"}


class ConsentError(PermissionError):
    """Raised when a write would violate the consent/empathy rules."""


def utcnow() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.strip().lower()).strip("_")[:48]


def _connect(db: str | None = None) -> sqlite3.Connection:
    path = db or os.environ.get("CRM_DB")
    if not path:
        raise RuntimeError("CRM_DB env var not set and no --db given")
    cx = sqlite3.connect(path)
    cx.row_factory = sqlite3.Row
    cx.execute("PRAGMA foreign_keys = ON")
    return cx


def _audit(cx, entity: str, entity_id: str, action: str, agent: str, detail: str = "") -> None:
    """Append-only audit trail (v2). Never raises past a missing table (pre-v2 DB)."""
    try:
        cx.execute("INSERT INTO crm_audit (id, entity, entity_id, action, agent, detail) "
                   "VALUES (?,?,?,?,?,?)",
                   (f"au_{uuid.uuid4().hex[:12]}", entity, entity_id, action, agent, detail[:500]))
    except sqlite3.OperationalError:
        pass  # v1 store without crm_audit — migration brings it in


# ---------------------------------------------------------------- writes

def crm_upsert_company(cx, name: str, stream: str, agent: str = "unknown", **kw) -> dict:
    if stream not in STREAMS:
        raise ValueError(f"stream must be one of {sorted(STREAMS)}")
    cid = kw.pop("id", None) or f"co_{_slug(name)}"
    fields = {k: kw[k] for k in
              ("segment", "exchange_ticker", "region", "website", "icp_grade",
               "icp_rationale", "status", "owner_agent", "notes") if k in kw}
    row = cx.execute("SELECT id FROM crm_companies WHERE id=?", (cid,)).fetchone()
    if row:
        if fields:
            sets = ", ".join(f"{k}=?" for k in fields)
            cx.execute(f"UPDATE crm_companies SET {sets}, last_touched=? WHERE id=?",
                       (*fields.values(), utcnow(), cid))
    else:
        cx.execute(
            "INSERT INTO crm_companies (id, name, stream, last_touched"
            + ("".join(f", {k}" for k in fields)) + ") VALUES (?,?,?,?"
            + ",?" * len(fields) + ")",
            (cid, name, stream, utcnow(), *fields.values()))
    _audit(cx, "company", cid, "updated" if row else "created", agent,
           json.dumps({k: str(v)[:80] for k, v in fields.items()}))
    cx.commit()
    return {"id": cid, "action": "updated" if row else "created"}


def crm_upsert_contact(cx, name: str, company_id: str, agent: str = "unknown", **kw) -> dict:
    ctid = kw.pop("id", None) or f"ct_{_slug(name)}_{_slug(company_id.removeprefix('co_'))}"
    fields = {k: kw[k] for k in
              ("role", "email", "phone", "linkedin", "consent_basis", "consent_date",
               "consent_evidence", "do_not_contact", "comm_preferences", "rest_until") if k in kw}
    row = cx.execute("SELECT id, do_not_contact FROM crm_contacts WHERE id=?", (ctid,)).fetchone()
    # do_not_contact may only be cleared with an explicit audit note recorded by a human
    if row and row["do_not_contact"] == 1 and fields.get("do_not_contact") == 0:
        _audit(cx, "contact", ctid, "refused_dnc_clear", agent)
        cx.commit()
        raise ConsentError("do_not_contact is absolute; clearing it requires Paul via a manual, "
                           "logged interaction — not an agent upsert.")
    if row:
        if fields:
            sets = ", ".join(f"{k}=?" for k in fields)
            cx.execute(f"UPDATE crm_contacts SET {sets}, last_touched=? WHERE id=?",
                       (*fields.values(), utcnow(), ctid))
    else:
        cx.execute(
            "INSERT INTO crm_contacts (id, name, company_id, last_touched"
            + ("".join(f", {k}" for k in fields)) + ") VALUES (?,?,?,?"
            + ",?" * len(fields) + ")",
            (ctid, name, company_id, utcnow(), *fields.values()))
    _audit(cx, "contact", ctid, "updated" if row else "created", agent,
           json.dumps({k: str(v)[:80] for k, v in fields.items() if k != "email"}))
    cx.commit()
    return {"id": ctid, "action": "updated" if row else "created"}


def crm_log_interaction(cx, direction: str, channel: str, agent: str, summary: str,
                        contact_id: str | None = None, company_id: str | None = None,
                        human_approved: bool = False, outcome: str | None = None,
                        campaign_id: str | None = None) -> dict:
    if direction == "outbound":
        if not human_approved:
            _audit(cx, "interaction", contact_id or company_id or "?", "refused_unapproved", agent)
            cx.commit()
            raise ConsentError("Outbound interactions require human approval (AWAITING CONFIRM → Paul).")
        if contact_id:
            ct = cx.execute(
                "SELECT do_not_contact, consent_basis, rest_until FROM crm_contacts WHERE id=?",
                (contact_id,)).fetchone()
            if ct is None:
                raise ValueError(f"unknown contact {contact_id}")
            refusal = None
            if ct["do_not_contact"]:
                refusal = "REFUSED: contact is do_not_contact. This is absolute."
            elif ct["consent_basis"] == "none":
                refusal = "REFUSED: no lawful consent basis recorded for this contact."
            elif ct["rest_until"] and ct["rest_until"] > utcnow():
                refusal = f"REFUSED: contact resting until {ct['rest_until']}."
            if refusal:
                _audit(cx, "interaction", contact_id, "refused_consent", agent, refusal)
                cx.commit()
                raise ConsentError(refusal)
    iid = f"ix_{uuid.uuid4().hex[:12]}"
    cx.execute(
        """INSERT INTO crm_interactions
           (id, contact_id, company_id, direction, channel, agent, human_approved,
            summary, outcome, campaign_id)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (iid, contact_id, company_id, direction, channel, agent,
         int(human_approved), summary, outcome, campaign_id))
    for table, col, key in (("crm_contacts", "id", contact_id), ("crm_companies", "id", company_id)):
        if key:
            cx.execute(f"UPDATE {table} SET last_touched=? WHERE {col}=?", (utcnow(), key))
    _audit(cx, "interaction", iid, "created", agent, f"{direction}/{channel}")
    cx.commit()
    return {"id": iid}


def crm_upsert_opportunity(cx, company_id: str, stream: str, name: str,
                           agent: str = "unknown", reopen: bool = False, **kw) -> dict:
    if stream not in STREAMS:
        raise ValueError(f"stream must be one of {sorted(STREAMS)}")
    stage = kw.get("stage", "identified")
    if stage not in STAGES:
        raise ValueError(f"stage must be one of {sorted(STAGES)}")
    if stage == "lost" and not kw.get("lost_reason"):
        raise ValueError("stage='lost' requires lost_reason — the learning loop depends on it.")
    oid = kw.pop("id", None) or f"op_{_slug(company_id.removeprefix('co_'))}_{_slug(name)}"
    fields = {k: kw[k] for k in
              ("stage", "value_aud", "probability", "next_action", "next_action_owner",
               "next_action_due", "lost_reason") if k in kw}
    if stage in CLOSED:
        fields["closed_at"] = utcnow()
    row = cx.execute("SELECT id, stage FROM crm_opportunities WHERE id=?", (oid,)).fetchone()
    old_stage = row["stage"] if row else None
    if old_stage in CLOSED and stage not in CLOSED and not reopen:
        raise ValueError(f"opportunity is closed ({old_stage}); pass reopen=True to reopen it "
                         "(a deliberate act, recorded in stage history).")
    if row:
        sets = ", ".join(f"{k}=?" for k in fields)
        cx.execute(f"UPDATE crm_opportunities SET {sets}, updated_at=? WHERE id=?",
                   (*fields.values(), utcnow(), oid))
    else:
        cx.execute(
            "INSERT INTO crm_opportunities (id, company_id, stream, name, updated_at"
            + ("".join(f", {k}" for k in fields)) + ") VALUES (?,?,?,?,?"
            + ",?" * len(fields) + ")",
            (oid, company_id, stream, name, utcnow(), *fields.values()))
    if old_stage != stage:  # includes creation (old_stage=None)
        try:
            cx.execute("INSERT INTO crm_stage_history (id, opportunity_id, from_stage, to_stage, "
                       "changed_by) VALUES (?,?,?,?,?)",
                       (f"sh_{uuid.uuid4().hex[:12]}", oid, old_stage, stage, agent))
        except sqlite3.OperationalError:
            pass  # pre-v2 store
        _audit(cx, "opportunity", oid, "stage_change", agent, f"{old_stage} -> {stage}")
    else:
        _audit(cx, "opportunity", oid, "updated" if row else "created", agent)
    if stage == "won":  # promote the account
        cx.execute("UPDATE crm_companies SET status='client', last_touched=? WHERE id=?",
                   (utcnow(), company_id))
    cx.commit()
    return {"id": oid, "action": "updated" if row else "created"}


def crm_snapshot_pipeline(cx, agent: str = "quartermaster") -> dict:
    """Point-in-time pipeline snapshot (v2) — run weekly; REPLACE within the same day."""
    today = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d")
    rows = cx.execute("SELECT stream, stage, n, total_aud, weighted_aud FROM v_crm_pipeline").fetchall()
    for r in rows:
        cx.execute("INSERT OR REPLACE INTO crm_pipeline_snapshots "
                   "(snapshot_date, stream, stage, n, total_aud, weighted_aud) VALUES (?,?,?,?,?,?)",
                   (today, r["stream"], r["stage"], r["n"], r["total_aud"], r["weighted_aud"]))
    _audit(cx, "snapshot", today, "created", agent, f"{len(rows)} rows")
    cx.commit()
    return {"snapshot_date": today, "rows": len(rows)}


# ----------------------------------------------------------------- reads

def crm_pipeline_report(cx, stream: str | None = None) -> list[dict]:
    q, args = "SELECT * FROM v_crm_pipeline", ()
    if stream:
        q, args = q + " WHERE stream=?", (stream,)
    return [dict(r) for r in cx.execute(q, args)]


def crm_next_actions(cx, owner: str | None = None, overdue_only: bool = False) -> list[dict]:
    view = "v_crm_overdue_actions" if overdue_only else "v_crm_next_actions"
    q, args = f"SELECT * FROM {view}", ()
    if owner:
        q, args = q + " WHERE next_action_owner=?", (owner,)
    return [dict(r) for r in cx.execute(q, args)]


def crm_export(cx, out_dir: str, fmt: str = "json") -> dict:
    """Quarterly succession export (HP-39): every crm_* table, plain files."""
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d")
    written = []
    tables = [r[0] for r in cx.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'crm_%'")]
    for t in tables:
        rows = [dict(r) for r in cx.execute(f"SELECT * FROM {t}")]
        if fmt == "json":
            p = out / f"{t}_{stamp}.json"
            p.write_text(json.dumps(rows, indent=1, default=str), encoding="utf-8")
        else:  # csv
            import csv
            p = out / f"{t}_{stamp}.csv"
            with open(p, "w", newline="", encoding="utf-8") as fh:
                if rows:
                    w = csv.DictWriter(fh, fieldnames=rows[0].keys())
                    w.writeheader()
                    w.writerows(rows)
        written.append(str(p))
    return {"tables": len(tables), "files": written}


# ------------------------------------------------------------ gateway glue

TOOLS = {
    "crm_upsert_company": crm_upsert_company,
    "crm_upsert_contact": crm_upsert_contact,
    "crm_log_interaction": crm_log_interaction,
    "crm_upsert_opportunity": crm_upsert_opportunity,
    "crm_snapshot_pipeline": crm_snapshot_pipeline,
    "crm_pipeline_report": crm_pipeline_report,
    "crm_next_actions": crm_next_actions,
    "crm_export": crm_export,
}


def register(gateway, db_path: str | None = None):
    """Register all CRM tools with the AEOS MCP Gateway.

    `gateway` is expected to expose .tool(name)(fn) or an equivalent
    decorator/registry — adapt this shim to the gateway's actual API at
    integration time (one place to change, by design).
    """
    for name, fn in TOOLS.items():
        def _bound(fn=fn, **kwargs):
            cx = _connect(db_path)
            try:
                return fn(cx, **kwargs)
            finally:
                cx.close()
        gateway.tool(name)(_bound)


if __name__ == "__main__":  # minimal CLI: python crm_tools.py <tool> '<json-kwargs>'
    if len(sys.argv) < 2 or sys.argv[1] not in TOOLS:
        print("usage: crm_tools.py <tool> '<json-kwargs>'  tools: " + ", ".join(TOOLS))
        raise SystemExit(2)
    kwargs = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    cx = _connect(kwargs.pop("db", None))
    try:
        print(json.dumps(TOOLS[sys.argv[1]](cx, **kwargs), indent=1, default=str))
    finally:
        cx.close()
