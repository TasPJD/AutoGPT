-- ============================================================
-- HarLin CRM — schema v3 (commercial measurement companion, 2026-08-07)
-- Additive on top of v1+v2. Idempotent. Applied by crm_migrate.py.
--
-- Purpose: anonymous exposure/interest/intent/conversion metrics for
-- reputation-independent revenue experiments (Etsy/Gumroad/social),
-- kept OUT of the named-contact CRM tables. Reconciled with Revenue
-- Bridge under PROC-RB-COMMERCIAL-INTERFACE-20260731 (TT-0606/0607).
--
-- Design rules:
--   * One physical store (aeos_events.db); companion tables live here.
--   * Named, consent-governed people/opportunities stay in crm_* tables.
--   * Anonymous funnel metrics never create crm_contacts/interactions.
--   * Join spine: commercial_item_id (Revenue) + product/listing/
--     campaign/experiment ids. Soft references (no hard FK) so an
--     anonymous observation is never blocked by a missing parent row.
--   * Cash truth is a distinct table, never a funnel metric (R1).
--   * Experiment decision is Revenue's; CRM stores the measured
--     comparison + resulting gate only (R2).
-- ============================================================

-- ---- Normalized commercial events (append-only funnel evidence) ----
CREATE TABLE IF NOT EXISTS commercial_event (
  event_id              TEXT PRIMARY KEY,        -- 'ce_' + sha256(natural key)[:16] (deterministic -> idempotent)
  observed_period_start TEXT NOT NULL,
  observed_period_end   TEXT NOT NULL,
  source_platform       TEXT NOT NULL,           -- etsy/gumroad/pinterest/instagram/tiktok/vercel/...
  source_object_id      TEXT NOT NULL,           -- listing/post/page id at the source
  commercial_item_id    TEXT,                    -- Revenue-owned lane spine
  product_id            TEXT,
  listing_id            TEXT,
  campaign_id           TEXT,                    -- soft ref to crm campaign attribution
  experiment_id         TEXT,
  funnel_stage          TEXT NOT NULL,           -- exposure/interest/intent/conversion/retention/refund
  metric_name           TEXT NOT NULL,           -- impressions/visits/favourites/carts/orders/...
  metric_value          REAL NOT NULL,
  unit                  TEXT,                     -- count/AUD/USD_cents/boolean_int/...
  currency              TEXT,                     -- set only where the metric is monetary
  value_basis           TEXT NOT NULL,           -- cumulative | interval | point_in_time
  analysis_inclusion    TEXT NOT NULL DEFAULT 'include',  -- include | evidence_only (S5)
  attribution_source    TEXT NOT NULL DEFAULT 'unknown',
  attribution_confidence TEXT,                   -- S5 vocab: platform_reported/direct/NULL
  evidence_locator      TEXT NOT NULL,           -- where the raw evidence lives (HP-12)
  collection_method     TEXT NOT NULL,           -- manual/api/export/screenshot-ocr/...
  collected_at          TEXT NOT NULL,
  is_test_traffic       INTEGER NOT NULL DEFAULT 0,
  data_quality_flags    TEXT,                     -- CSV of flags; NULL when clean
  ingest_run_id         TEXT NOT NULL,
  row_hash              TEXT NOT NULL,
  created_at            TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
-- Idempotency: one logical observation per (platform, object, metric, period).
CREATE UNIQUE INDEX IF NOT EXISTS uq_commercial_event_natural
  ON commercial_event(source_platform, source_object_id, metric_name,
                      observed_period_start, observed_period_end);
CREATE INDEX IF NOT EXISTS idx_commercial_event_item
  ON commercial_event(commercial_item_id, funnel_stage, observed_period_end);
CREATE INDEX IF NOT EXISTS idx_commercial_event_exp
  ON commercial_event(experiment_id, funnel_stage);

-- ---- Cash truth (distinct from funnel metrics — R1) ---------------
CREATE TABLE IF NOT EXISTS commercial_cash (
  cash_id            TEXT PRIMARY KEY,           -- 'cash_' + hex
  commercial_item_id TEXT,
  product_id         TEXT,
  source_platform    TEXT NOT NULL,
  source_object_id   TEXT,
  gross              REAL NOT NULL DEFAULT 0,
  fees               REAL NOT NULL DEFAULT 0,
  refunds            REAL NOT NULL DEFAULT 0,
  net_verified       REAL,                        -- set only with a receipt_locator
  currency           TEXT NOT NULL,
  occurred_at        TEXT NOT NULL,
  receipt_locator    TEXT,
  verified           INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_commercial_cash_item
  ON commercial_cash(commercial_item_id, occurred_at);

-- ---- Experiment measured state (decision stays Revenue's — R2) -----
CREATE TABLE IF NOT EXISTS commercial_experiment_state (
  experiment_id      TEXT NOT NULL,
  variant            TEXT NOT NULL DEFAULT 'default',
  commercial_item_id TEXT,
  gate_metric        TEXT NOT NULL,
  pass_threshold     REAL,
  kill_threshold     REAL,
  measured_value     REAL,
  gate_result        TEXT,                        -- running/pass/change/kill
  decided_by         TEXT,                        -- 'revenue' when Revenue rules; else NULL
  measured_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  PRIMARY KEY (experiment_id, variant)
);

-- ---- Periodic aggregate snapshots (reporting; mirrors v2 pattern) --
CREATE TABLE IF NOT EXISTS commercial_snapshot (
  snapshot_id  TEXT PRIMARY KEY,                  -- 'csnap_' + hex
  generated_at TEXT NOT NULL,
  scope        TEXT NOT NULL,                     -- e.g. product:xyz / experiment:abc / all
  window       TEXT NOT NULL,                     -- e.g. 24h / 7d
  metrics_json TEXT NOT NULL
);

-- ---- Append-only evidence receipts (reuses the v2 audit PATTERN,
--      but kept separate so anonymous-metric evidence never pollutes
--      the crm_audit entity-mutation trail) --------------------------
CREATE TABLE IF NOT EXISTS commercial_event_receipt (
  receipt_id   TEXT PRIMARY KEY,                  -- 're_' + hex
  event_id     TEXT NOT NULL,
  ingest_run_id TEXT NOT NULL,
  row_hash     TEXT NOT NULL,
  outcome      TEXT NOT NULL,                     -- inserted / duplicate / rejected
  detail       TEXT,
  at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_commercial_receipt_event
  ON commercial_event_receipt(event_id, at);
