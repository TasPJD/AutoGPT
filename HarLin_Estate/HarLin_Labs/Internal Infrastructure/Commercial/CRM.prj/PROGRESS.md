# PROGRESS — CRM.prj

## 2026-08-07 (later) — v3 S2 alignment + S5->S2 adapter + supplied-snapshot ingest
- Aligned S2 to the Revenue S5 raw contract (TT-0613): commercial_event gains
  unit + analysis_inclusion; value_basis widened for point_in_time; funnel
  stages gain operational; attribution_confidence is now textual (S5 vocab).
  Reports/qualified sums exclude analysis_inclusion='evidence_only' so operator
  traffic is kept as evidence but out of qualified-demand analysis.
- commercial_snapshot_adapter.py: deterministic S5->S2 adapter — one raw
  snapshot explodes into one S2 record per metric; null source_object_id gets a
  stable scope:account key so idempotency holds; monetary unit -> currency.
- Ingested the supplied authenticated snapshots in a sandbox (4 Etsy + 1
  Gumroad = 20 events): all inserted, re-ingest fully idempotent, 37 append-only
  receipts; weekly funnel all-zero after evidence-only exclusion; verified cash
  AU$0 (matches Revenue baseline). Reports + snapshot generated.
- Tests: 13/13 green (8 acceptance + 5 adapter). Completion returned to the
  canonical ledger. Still BUILT+TESTED only; not wired/populated on the live
  store. On-machine deps unchanged: S6 gateway, S7 scheduler, S8 Alfred surface.

## 2026-08-07 — v3: commercial measurement companion (Revenue reconciliation)
- schema_v3.sql: companion tables for anonymous funnel measurement of
  reputation-independent revenue experiments (Etsy/Gumroad/social), kept OUT
  of the named-contact CRM tables — commercial_event (append-only, idempotent
  natural key), commercial_cash (gross/fees/refunds/net distinct), 
  commercial_experiment_state (measured comparison; Revenue owns the decision),
  commercial_snapshot, commercial_event_receipt. Picked up automatically by
  crm_migrate.py (v1+v2+v3 apply clean; schema_version -> 3).
- commercial_events.py: single write path — provenance-enforced ingest (HP-12),
  idempotent re-ingest, cash guard (net only with a receipt), experiment gate,
  daily-exception + weekly-learning reports, snapshot generator. Pure sqlite;
  dry-runs against a sandbox DB copy, not wired to the live gateway.
- test_commercial_events.py: 8/8 acceptance tests green (idempotency,
  test-traffic exclusion, cash distinctness, attribution honesty, multi-platform
  mapping, experiment gate, provenance, reports+snapshot).
- Reconciled with Revenue Bridge under PROC-RB-COMMERCIAL-INTERFACE-20260731
  (TT-0606 request / TT-0607 response). BUILT+TESTED off-machine; NOT wired,
  NOT populated. On-machine deps remain: gateway registration, scheduler, Alfred
  read-only surface.

## 2026-07-12 (evening) — v2: parity with peer-CRM governance (gap-analysis build)
- schema_v2.sql: crm_audit (append-only, refusals audited too),
  crm_stage_history, crm_pipeline_snapshots, email dedup unique index
  (case-insensitive), v_crm_overdue_actions, v_crm_stage_conversion.
- crm_migrate.py: multi-version (applies schema_v*.sql in order), guarded
  ALTER for crm_contacts.consent_evidence, SCHEMA_VERSION now derived.
- crm_tools.py: audit writes on every mutation; agent attribution param;
  stage transitions recorded with actor; won/lost reopen requires explicit
  reopen=True; new crm_snapshot_pipeline tool; overdue_only read flag.
- generate_dashboard.py + test_dashboard.py: standalone-HTML pipeline
  dashboard (house pattern) generated from the store; registered in
  Alfred → Workflows → Commercial.
- Tests 6→12 (stage history, reopen guard, audit trail incl. refusal
  audit, snapshot+overdue, dedup guard, consent evidence). Live store
  migrated v1→v2 (additive; auto-backup taken).

## 2026-07-12 — v1 build kit complete & tested (Claude session, Paul's confirm)
- ADR-001 ACCEPTED by Paul (session confirm 2026-07-12).
- `schema_v1.sql` — full DDL: 7 tables (companies, contacts, interactions,
  opportunities, campaigns, campaign_touches, meta) + 3 reporting views
  (v_crm_pipeline, v_crm_next_actions, v_crm_contactable). Additive,
  idempotent, consent columns first-class.
- `crm_migrate.py` — migration runner: auto-backup, dry-run, idempotent,
  optional seed of crm_companies from ClientLedger `clients` table.
- `crm_tools.py` — gateway tool module (sole write path):
  crm_upsert_company/contact/opportunity, crm_log_interaction,
  crm_pipeline_report, crm_next_actions, crm_export. `register()` shim
  ready for the AEOS MCP Gateway.
- TESTED (sandbox): migration idempotency ✅; unapproved outbound
  REFUSED ✅; consent_basis='none' outbound REFUSED ✅; do_not_contact
  send REFUSED ✅; agent clearing do_not_contact REFUSED ✅; lost-without-
  reason REFUSED ✅; won→company promoted to client ✅; 7-table export ✅.
## 2026-07-12 (later) — LIVE STORE CREATED ✅
- On-machine validation: `test_crm_kit.py` 6 passed (temp DB, full refusal
  matrix re-verified on Windows/cp1252; one encoding fix to crm_migrate
  prints: → replaced with -> for console safety).
- **Live store bootstrapped via `test_live_bootstrap.py` (pytest lane,
  Paul's chat approval 2026-07-12):**
  `C:\AI\HarLin_Labs\Internal Infrastructure\AEOS.prj\runtime\business\aeos_events.db`
  — NEW file (no prior ClientLedger DB existed anywhere; this store is the
  first inhabitant of the Layer-5 location the AEOS architecture assigns).
  7 tables + 3 views present, crm_meta.schema_version=1. No seed run:
  no legacy `clients` table exists to seed from.
- SoR: all 13 Commercial descriptors ingested into catalog.sqlite
  (`..\test_registration_housekeeping.py`, 1 passed).

## REMAINING — one integration step (next AEOS on-machine session)
- Wire tools into the MCP Gateway: import crm_tools, call
  register(gateway, db_path=r"C:\AI\HarLin_Labs\Internal Infrastructure\AEOS.prj\runtime\business\aeos_events.db")
  and set CRM_DB for the gateway process. Deliberately NOT attempted over
  the tunnel: editing/restarting the live gateway would sever the very MCP
  session doing the work (and Paul's phone bridge). Zero risk taken there.
