#!/usr/bin/env python3
"""Commercial Pipeline Dashboard generator (Quartermaster's tool).

Reads the CRM store and emits a self-contained, theme-aware HTML dashboard
(house standalone-HTML pattern) with pipeline by stream/stage, next and
overdue actions, snapshot trend, and data-hygiene counters. A GENERATED
view over the data — never hand-edited; regenerate to refresh (the file
carries its generation timestamp so staleness is always visible, OSB-001).

Usage:
  python generate_dashboard.py --db <store> [--out <html path>]
Defaults: CRM_DB env for --db; Marketing_Sales.prj\\Dashboards\\pipeline_dashboard.html for --out.
"""
import argparse
import datetime as dt
import html
import os
import sqlite3
from pathlib import Path

DEFAULT_OUT = Path(r"C:\AI\HarLin_Commercial\Marketing_Sales.prj\Dashboards\pipeline_dashboard.html")

CSS = """
:root { --bg:#f7f6f2; --panel:#fff; --ink:#1c2430; --muted:#5c6672; --line:#c9cdd4;
        --accent:#1f6f54; --warn:#b3541e; --crm:#2b4a7a; --chip:#eceae4; }
@media (prefers-color-scheme: dark) {
 :root { --bg:#14181e; --panel:#1d232c; --ink:#e8e6e1; --muted:#9aa3ad; --line:#3a424d;
         --accent:#4dab87; --warn:#d97b3f; --crm:#6f94c9; --chip:#262d37; } }
*{box-sizing:border-box;margin:0} body{background:var(--bg);color:var(--ink);
font:15px/1.5 "Segoe UI",system-ui,sans-serif;padding:26px 22px 44px}
h1{font-size:1.3rem} .sub{color:var(--muted);font-size:.85rem;margin:2px 0 18px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;max-width:1080px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 16px}
.card h2{font-size:.75rem;text-transform:uppercase;letter-spacing:.11em;color:var(--muted);margin-bottom:8px}
.big{font-size:1.7rem;font-weight:600} .unit{color:var(--muted);font-size:.8rem}
table{width:100%;border-collapse:collapse;font-size:.85rem}
th{color:var(--muted);text-align:left;font-weight:500;padding:4px 8px 4px 0}
td{padding:4px 8px 4px 0;border-top:1px solid var(--line)}
.warn{color:var(--warn);font-weight:600} .ok{color:var(--accent)}
.wide{grid-column:1/-1} footer{color:var(--muted);font-size:.72rem;margin-top:20px;max-width:1080px}
"""


def q(cx, sql, args=()):
    try:
        return [dict(r) for r in cx.execute(sql, args)]
    except sqlite3.OperationalError:
        return []


def rows_table(rows, cols):
    if not rows:
        return "<p class='unit'>none</p>"
    head = "".join(f"<th>{html.escape(c)}</th>" for c in cols)
    body = "".join("<tr>" + "".join(f"<td>{html.escape(str(r.get(c, '') if r.get(c) is not None else ''))}</td>"
                                    for c in cols) + "</tr>" for r in rows)
    return f"<table><tr>{head}</tr>{body}</table>"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.environ.get("CRM_DB"))
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    a = ap.parse_args()
    if not a.db:
        raise SystemExit("no --db and CRM_DB unset")
    cx = sqlite3.connect(a.db)
    cx.row_factory = sqlite3.Row

    pipeline = q(cx, "SELECT * FROM v_crm_pipeline ORDER BY stream, stage")
    next_actions = q(cx, "SELECT * FROM v_crm_next_actions LIMIT 12")
    overdue = q(cx, "SELECT * FROM v_crm_overdue_actions")
    snaps = q(cx, "SELECT snapshot_date, SUM(weighted_aud) w FROM crm_pipeline_snapshots "
                  "GROUP BY snapshot_date ORDER BY snapshot_date DESC LIMIT 8")
    counters = {
        "companies": q(cx, "SELECT COUNT(*) c FROM crm_companies"),
        "graded": q(cx, "SELECT COUNT(*) c FROM crm_companies WHERE icp_grade IS NOT NULL"),
        "contacts": q(cx, "SELECT COUNT(*) c FROM crm_contacts"),
        "consented": q(cx, "SELECT COUNT(*) c FROM crm_contacts WHERE consent_basis != 'none'"),
        "open_opps": q(cx, "SELECT COUNT(*) c FROM crm_opportunities WHERE stage NOT IN ('won','lost')"),
        "won": q(cx, "SELECT COUNT(*) c, ROUND(SUM(COALESCE(value_aud,0)),0) v "
                     "FROM crm_opportunities WHERE stage='won'"),
    }
    n = {k: (v[0] if v else {"c": 0}) for k, v in counters.items()}
    weighted = round(sum(r.get("weighted_aud") or 0 for r in pipeline))
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%MZ")
    cx.close()

    page = f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Commercial Pipeline Dashboard</title><style>{CSS}</style></head><body>
<h1>Commercial Pipeline Dashboard</h1>
<div class="sub">GENERATED {stamp} by generate_dashboard.py (Quartermaster) — regenerate to refresh; never hand-edit.</div>
<div class="grid">
 <div class="card"><h2>Weighted pipeline</h2><div class="big">${weighted:,}</div><div class="unit">AUD, open stages, probability-weighted</div></div>
 <div class="card"><h2>Open opportunities</h2><div class="big">{n['open_opps']['c']}</div><div class="unit">won to date: {n['won'].get('c',0)} (${int(n['won'].get('v') or 0):,})</div></div>
 <div class="card"><h2>Account universe</h2><div class="big">{n['companies']['c']}</div><div class="unit">{n['graded']['c']} ICP-graded</div></div>
 <div class="card"><h2>Contacts</h2><div class="big">{n['contacts']['c']}</div><div class="unit">{n['consented']['c']} with a lawful consent basis</div></div>
 <div class="card wide"><h2>Pipeline by stream &amp; stage</h2>{rows_table(pipeline, ['stream','stage','n','total_aud','weighted_aud'])}</div>
 <div class="card wide"><h2>Overdue actions {'<span class=warn>('+str(len(overdue))+')</span>' if overdue else '<span class=ok>(0)</span>'}</h2>{rows_table(overdue, ['company','stream','stage','next_action','next_action_owner','next_action_due'])}</div>
 <div class="card wide"><h2>Next actions (top 12)</h2>{rows_table(next_actions, ['company','stream','stage','next_action','next_action_owner','next_action_due'])}</div>
 <div class="card wide"><h2>Weighted-pipeline snapshots (recent)</h2>{rows_table(snaps, ['snapshot_date','w'])}</div>
</div>
<footer>Source of truth: the CRM store (ADR-001). Views: v_crm_pipeline / v_crm_next_actions / v_crm_overdue_actions / crm_pipeline_snapshots.
Empty tables are expected until Phase 0 population begins.</footer>
</body></html>"""

    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")
    print(f"dashboard written: {out} ({len(page)} chars)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
