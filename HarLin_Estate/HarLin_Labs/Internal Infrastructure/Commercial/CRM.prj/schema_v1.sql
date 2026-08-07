-- ============================================================
-- HarLin CRM — schema v1 (ADR-001, ACCEPTED 2026-07-12)
-- Dialect: SQLite. Additive & idempotent: safe to re-run.
-- Applied by crm_migrate.py; do not hand-edit the live DB.
-- Contract: crm_schema_v1 — future changes are additive
-- migrations (schema_v2.sql, ...), never destructive.
-- ============================================================

PRAGMA foreign_keys = ON;

-- ---- Companies: the account universe (all streams) ----------
CREATE TABLE IF NOT EXISTS crm_companies (
  id            TEXT PRIMARY KEY,              -- 'co_' + slug
  name          TEXT NOT NULL,
  stream        TEXT NOT NULL CHECK (stream IN ('nexus','consulting','labs','masha')),
  segment       TEXT,
  exchange_ticker TEXT,
  region        TEXT,
  website       TEXT,
  icp_grade     TEXT CHECK (icp_grade IN ('A','B','C','D') OR icp_grade IS NULL),
  icp_rationale TEXT,                          -- Assayer: every grade carries one
  status        TEXT NOT NULL DEFAULT 'prospect'
                CHECK (status IN ('prospect','engaged','client','dormant','do_not_contact')),
  owner_agent   TEXT,
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  last_touched  TEXT
);
CREATE INDEX IF NOT EXISTS idx_companies_stream ON crm_companies(stream, status);
CREATE INDEX IF NOT EXISTS idx_companies_grade  ON crm_companies(icp_grade);

-- ---- Contacts: people, consent first-class ------------------
CREATE TABLE IF NOT EXISTS crm_contacts (
  id            TEXT PRIMARY KEY,              -- 'ct_' + slug
  company_id    TEXT REFERENCES crm_companies(id),
  name          TEXT NOT NULL,
  role          TEXT,
  email         TEXT,
  phone         TEXT,
  linkedin      TEXT,
  consent_basis TEXT NOT NULL DEFAULT 'none'
                CHECK (consent_basis IN ('none','inferred_b2b','express','existing_relationship')),
  consent_date  TEXT,
  do_not_contact INTEGER NOT NULL DEFAULT 0 CHECK (do_not_contact IN (0,1)),
  comm_preferences TEXT,
  rest_until    TEXT,                          -- 2 silent sequences → 6-month rest
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  last_touched  TEXT
);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON crm_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_dnc     ON crm_contacts(do_not_contact);

-- ---- Interactions: every touch, in or out -------------------
CREATE TABLE IF NOT EXISTS crm_interactions (
  id            TEXT PRIMARY KEY,              -- 'ix_' + ulid-ish
  contact_id    TEXT REFERENCES crm_contacts(id),
  company_id    TEXT REFERENCES crm_companies(id),
  direction     TEXT NOT NULL CHECK (direction IN ('inbound','outbound','internal','research')),
  channel       TEXT NOT NULL,                 -- email/linkedin/phone/meeting/conference/research/...
  agent         TEXT NOT NULL,                 -- foreman/quartermaster/.../paul
  human_approved INTEGER NOT NULL DEFAULT 0 CHECK (human_approved IN (0,1)),
  summary       TEXT NOT NULL,
  outcome       TEXT,                          -- reply/no_reply/meeting/decline/...
  campaign_id   TEXT,
  occurred_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_interactions_company ON crm_interactions(company_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_interactions_contact ON crm_interactions(contact_id, occurred_at);

-- ---- Opportunities: the pipeline ----------------------------
CREATE TABLE IF NOT EXISTS crm_opportunities (
  id            TEXT PRIMARY KEY,              -- 'op_' + slug
  company_id    TEXT NOT NULL REFERENCES crm_companies(id),
  stream        TEXT NOT NULL CHECK (stream IN ('nexus','consulting','labs','masha')),
  name          TEXT NOT NULL,
  stage         TEXT NOT NULL DEFAULT 'identified'
                CHECK (stage IN ('identified','qualified','meeting','proposal','negotiation','won','lost','parked')),
  value_aud     REAL,
  probability   REAL CHECK (probability BETWEEN 0 AND 1 OR probability IS NULL),
  next_action   TEXT,
  next_action_owner TEXT,                      -- agent slug or 'paul'
  next_action_due   TEXT,
  lost_reason   TEXT,                          -- REQUIRED at stage='lost' (enforced in tools)
  opened_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  closed_at     TEXT,
  updated_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_opps_stage  ON crm_opportunities(stage, stream);
CREATE INDEX IF NOT EXISTS idx_opps_due    ON crm_opportunities(next_action_due);

-- ---- Campaigns & attribution --------------------------------
CREATE TABLE IF NOT EXISTS crm_campaigns (
  id            TEXT PRIMARY KEY,              -- 'cp_' + slug
  name          TEXT NOT NULL,
  stream        TEXT NOT NULL,
  type          TEXT,                          -- content/outbound/event/launch/nurture
  status        TEXT NOT NULL DEFAULT 'planned'
                CHECK (status IN ('planned','active','paused','done')),
  started_at    TEXT,
  ended_at      TEXT,
  learnings     TEXT
);
CREATE TABLE IF NOT EXISTS crm_campaign_touches (
  campaign_id    TEXT NOT NULL REFERENCES crm_campaigns(id),
  interaction_id TEXT NOT NULL REFERENCES crm_interactions(id),
  PRIMARY KEY (campaign_id, interaction_id)
);

-- ---- Migration/audit log ------------------------------------
CREATE TABLE IF NOT EXISTS crm_meta (
  key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL
);

-- ---- Reporting views (read-only convenience) ----------------
CREATE VIEW IF NOT EXISTS v_crm_pipeline AS
  SELECT o.stream, o.stage, COUNT(*) AS n,
         ROUND(SUM(COALESCE(o.value_aud,0)),2)                    AS total_aud,
         ROUND(SUM(COALESCE(o.value_aud,0)*COALESCE(o.probability,0)),2) AS weighted_aud
  FROM crm_opportunities o
  WHERE o.stage NOT IN ('won','lost')
  GROUP BY o.stream, o.stage;

CREATE VIEW IF NOT EXISTS v_crm_next_actions AS
  SELECT o.id, c.name AS company, o.stream, o.stage,
         o.next_action, o.next_action_owner, o.next_action_due
  FROM crm_opportunities o JOIN crm_companies c ON c.id = o.company_id
  WHERE o.stage NOT IN ('won','lost','parked')
  ORDER BY COALESCE(o.next_action_due,'9999') ASC;

CREATE VIEW IF NOT EXISTS v_crm_contactable AS
  SELECT ct.*, co.name AS company_name, co.icp_grade
  FROM crm_contacts ct JOIN crm_companies co ON co.id = ct.company_id
  WHERE ct.do_not_contact = 0
    AND (ct.rest_until IS NULL OR ct.rest_until <= strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    AND ct.consent_basis != 'none'
    AND co.status != 'do_not_contact';
