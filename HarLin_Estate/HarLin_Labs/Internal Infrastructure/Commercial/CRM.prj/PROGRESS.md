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
- PENDING (needs HarLin tunnel / AEOS session): run crm_migrate.py against
  the live AEOS store (locate aeos_events.db; use --seed-from-clients),
  wire register() into the MCP Gateway, set CRM_DB env for the gateway.
