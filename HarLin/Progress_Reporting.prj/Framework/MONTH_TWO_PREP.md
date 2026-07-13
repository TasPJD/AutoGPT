# Month-Two Pillar Prep — Governance (7) and Cost/ROI (8)

Pillars 7–8 join the report from the second full cycle (2026-08 report, produced early September). This spec exists now so their capture starts before their reporting — the capture-before-report ordering is the whole lesson of the backfill.

## Pillar 7 — Governance / data-class compliance

**Metric:** incident count + resolution state, not a vibe.

**Incident record format** (append to `Reports/_incidents.log` as they occur):
```
date | class | description | detected_by | resolved (date|open)
2026-07-15 | sensitivity-gate | example: family data nearly surfaced in a shared artifact | steward selftest | 2026-07-15
```
Classes: `sensitivity-gate`, `access-control`, `data-loss`, `provenance` (a report claim found wrong post-filing counts as a provenance incident). Zero incidents is a reportable number only if the log demonstrably existed all month — which is why it starts now.

## Pillar 8 — Cost / efficiency (burn vs output)

**Sources already live:** dispatch cost ledger (`runtime\logs\dispatch_cost.log`), Console `/activity`.

**Monthly derivation:** total spend; spend per key project (where dispatch is attributable); cost per stage-advance (spend ÷ pillar-4 "Advanced" count) as the first ROI proxy. Refine the attribution rule after one month of observed ledger shape rather than guessing it now.

**Not captured yet:** subscription/tooling costs outside the dispatch ledger (Claude plan, hosting, domains). Capture plan: one-line monthly entry in `Reports/_costs_fixed.log` from the accounts — small enough to do by hand until Xero export is wired in.
