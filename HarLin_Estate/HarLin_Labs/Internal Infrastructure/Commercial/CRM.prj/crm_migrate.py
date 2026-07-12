#!/usr/bin/env python3
"""HarLin CRM migration runner (ADR-001, schema v1).

Applies schema_v1.sql to the CRM store additively and idempotently,
after taking a timestamped backup. Optionally seeds crm_companies from
an existing ClientLedger `clients` table found in the same database.

Best-practice guarantees:
  * Backup before touching anything (skipped only with --no-backup).
  * Idempotent: re-running is a no-op (IF NOT EXISTS everywhere).
  * Additive-only: this script never drops or alters existing tables.
  * Dry-run mode prints the plan without writing.
  * Records every run in crm_meta.

Usage:
  python crm_migrate.py --db "C:/AI/HarLin_Labs/Internal Infrastructure/AEOS.prj/runtime/aeos_events.db"
  python crm_migrate.py --db <path> --dry-run
  python crm_migrate.py --db <path> --seed-from-clients
"""
import argparse
import datetime as dt
import shutil
import sqlite3
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCHEMA = HERE / "schema_v1.sql"
SCHEMA_VERSION = "1"


def utcnow() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def backup(db_path: Path) -> Path:
    stamp = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = db_path.with_suffix(f".pre_crm_v{SCHEMA_VERSION}_{stamp}.bak")
    shutil.copy2(db_path, dest)
    return dest


def existing_crm_tables(cx: sqlite3.Connection) -> list[str]:
    rows = cx.execute(
        "SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name LIKE 'crm_%' OR name LIKE 'v_crm_%'"
    ).fetchall()
    return sorted(r[0] for r in rows)


def seed_from_clients(cx: sqlite3.Connection) -> int:
    """Promote existing ClientLedger clients into crm_companies (stream=consulting).

    Non-destructive: only inserts ids not already present; never updates.
    """
    has_clients = cx.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='clients'"
    ).fetchone()
    if not has_clients:
        print("  seed: no `clients` table found in this DB — skipping (not an error).")
        return 0
    cols = {r[1] for r in cx.execute("PRAGMA table_info(clients)")}
    name_col = "name" if "name" in cols else next(iter(cols))
    n = 0
    for row in cx.execute(f"SELECT id, {name_col} FROM clients"):
        cid = f"co_{str(row[0]).strip().lower().replace(' ', '_')}"
        cur = cx.execute(
            """INSERT OR IGNORE INTO crm_companies
               (id, name, stream, status, owner_agent, notes, created_at, last_touched)
               VALUES (?, ?, 'consulting', 'client', 'quartermaster',
                       'Seeded from ClientLedger clients table', ?, ?)""",
            (cid, str(row[1]), utcnow(), utcnow()),
        )
        n += cur.rowcount
    return n


def main() -> int:
    ap = argparse.ArgumentParser(description="Apply HarLin CRM schema v1 (additive, idempotent).")
    ap.add_argument("--db", required=True, help="Path to the CRM store (AEOS events DB per ADR-001).")
    ap.add_argument("--dry-run", action="store_true", help="Show plan; write nothing.")
    ap.add_argument("--no-backup", action="store_true", help="Skip backup (not recommended).")
    ap.add_argument("--seed-from-clients", action="store_true",
                    help="Seed crm_companies from an existing ClientLedger `clients` table.")
    args = ap.parse_args()

    db_path = Path(args.db)
    if not SCHEMA.exists():
        print(f"FATAL: schema file missing: {SCHEMA}", file=sys.stderr)
        return 2

    creating = not db_path.exists()
    print(f"CRM migrate v{SCHEMA_VERSION} → {db_path}  ({'NEW DB' if creating else 'existing DB'})")

    if args.dry_run:
        print("  DRY RUN: would " + ("create DB, " if creating else "backup DB, ")
              + "apply schema_v1.sql, "
              + ("seed from clients, " if args.seed_from_clients else "")
              + "record run in crm_meta.")
        return 0

    if not creating and not args.no_backup:
        print(f"  backup → {backup(db_path)}")

    cx = sqlite3.connect(db_path)
    try:
        before = existing_crm_tables(cx)
        cx.executescript(SCHEMA.read_text(encoding="utf-8"))
        seeded = seed_from_clients(cx) if args.seed_from_clients else 0
        cx.execute(
            "INSERT OR REPLACE INTO crm_meta(key, value, updated_at) VALUES ('schema_version', ?, ?)",
            (SCHEMA_VERSION, utcnow()),
        )
        cx.execute(
            "INSERT OR REPLACE INTO crm_meta(key, value, updated_at) VALUES ('last_migration_run', ?, ?)",
            (utcnow(), utcnow()),
        )
        cx.commit()
        after = existing_crm_tables(cx)
        new = [t for t in after if t not in before]
        print(f"  objects present: {len(after)} (new this run: {len(new)})")
        if new:
            print("    " + ", ".join(new))
        if args.seed_from_clients:
            print(f"  seeded companies from ClientLedger: {seeded}")
        print("  OK — additive migration complete.")
        return 0
    finally:
        cx.close()


if __name__ == "__main__":
    raise SystemExit(main())
