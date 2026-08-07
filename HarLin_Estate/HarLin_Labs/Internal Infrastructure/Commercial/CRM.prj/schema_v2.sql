-- ============================================================
-- HarLin CRM — schema v2 (gap-analysis build, 2026-07-12)
-- Additive on top of v1. Idempotent. Applied by crm_migrate.py
-- (which also adds the consent_evidence column via guarded ALTER).
--
-- Closes peer-practice gaps: audit trail (Salesforce field-history
-- class), stage history + conversion analytics, point-in-time
-- pipeline snapshots (RevOps velocity/slippage), dedup guard,
-- overdue-action hygiene view.
-- ============================================================

-- ---- Audit trail: append-only record of every mutation -------
CREATE TABLE IF NOT EXISTS crm_audit (
  id        TEXT PRIMARY KEY,                 -- 'au_' + hex
  entity    TEXT NOT NULL,                    -- company/contact/interaction/opportunity/campaign
  entity_id TEXT NOT NULL,
  action    TEXT NOT NULL,                    -- created/updated/stage_change/refused/...
  agent     TEXT,
  detail    TEXT,
  at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON crm_audit(entity, entity_id, at);

-- ---- Stage history: every pipeline transition, forever -------
CREATE TABLE IF NOT EXISTS crm_stage_history (
  id             TEXT PRIMARY KEY,            -- 'sh_' + hex
  opportunity_id TEXT NOT NULL REFERENCES crm_opportunities(id),
  from_stage     TEXT,                        -- NULL on creation
  to_stage       TEXT NOT NULL,
  changed_by     TEXT NOT NULL,               -- agent slug or 'paul'
  changed_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_stage_hist_opp ON crm_stage_history(opportunity_id, changed_at);

-- ---- Pipeline snapshots: point-in-time, for velocity/trend ---
CREATE TABLE IF NOT EXISTS crm_pipeline_snapshots (
  snapshot_date TEXT NOT NULL,                -- YYYY-MM-DD
  stream        TEXT NOT NULL,
  stage         TEXT NOT NULL,
  n             INTEGER NOT NULL,
  total_aud     REAL,
  weighted_aud  REAL,
  PRIMARY KEY (snapshot_date, stream, stage)
);

-- ---- Dedup guards ---------------------------------------------
-- One contact per email address, case-insensitive (empty/NULL exempt).
CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_email
  ON crm_contacts(lower(email)) WHERE email IS NOT NULL AND email != '';
-- Company-name lookup support (merge protocol in SALES_PLAYBOOK — names
-- are deliberately NOT unique: legitimate collisions exist across regions).
CREATE INDEX IF NOT EXISTS idx_companies_name ON crm_companies(lower(name));

-- ---- Hygiene & analytics views --------------------------------
CREATE VIEW IF NOT EXISTS v_crm_overdue_actions AS
  SELECT * FROM v_crm_next_actions
  WHERE next_action_due IS NOT NULL
    AND next_action_due < strftime('%Y-%m-%d','now');

CREATE VIEW IF NOT EXISTS v_crm_stage_conversion AS
  SELECT from_stage, to_stage, COUNT(*) AS n,
         MIN(changed_at) AS first_seen, MAX(changed_at) AS last_seen
  FROM crm_stage_history
  WHERE from_stage IS NOT NULL
  GROUP BY from_stage, to_stage;
