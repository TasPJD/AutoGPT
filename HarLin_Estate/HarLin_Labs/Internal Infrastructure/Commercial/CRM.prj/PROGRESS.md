# PROGRESS — CRM.prj

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
