#!/usr/bin/env python3
"""Append a pillar 5-6 snapshot line to Reports/_snapshots.log (decision D3).

Runs on the HarLin side (needs C:/AI access). Parses Alfred's orient output —
the same text harlin_orient serves — and appends one dated line. Never
interpolates: a count it cannot parse is recorded as '?'.

Usage:
    python snapshot_pillars.py            # runs orient via harlin CLI if available
    python snapshot_pillars.py --stdin    # parse orient text piped in
    python snapshot_pillars.py --dry-run  # print the line, don't append

Idempotent per day: if today's line already exists the script exits 0 without
writing, so it can sit on any scheduler (Task Scheduler hourly is fine).
"""

import argparse
import datetime as dt
import re
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOG_PATH = PROJECT_ROOT / "Reports" / "_snapshots.log"

PATTERNS = {
    "awaiting_confirm": re.compile(r"(\d+)\s+item\(s\)\s+marked\s+AWAITING\s+CONFIRM", re.I),
    "open_questions": re.compile(r"(\d+)\s+open\s+questions?", re.I),
    "paul_actions": re.compile(r"(\d+)\s+PAUL_ACTIONS", re.I),
    "entities": re.compile(r"(\d+)\s+entities\s+catalogued", re.I),
    "stubs": re.compile(r"(\d+)\s+stub\s+descriptor", re.I),
    "missing_cp": re.compile(r"(\d+)\s+missing\s+a?\s*CP\s+box", re.I),
}
FIELD_ORDER = ["awaiting_confirm", "open_questions", "paul_actions", "entities", "stubs", "missing_cp"]


def get_orient_text(use_stdin: bool) -> str:
    if use_stdin:
        return sys.stdin.read()
    # Fall back through known local entry points; adjust when the harness names change.
    for cmd in (["harlin", "orient"], [sys.executable, str(PROJECT_ROOT.parent / "HarLin_OS" / "orient.py")]):
        try:
            out = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            if out.returncode == 0 and out.stdout.strip():
                return out.stdout
        except (OSError, subprocess.TimeoutExpired):
            continue
    sys.exit("could not obtain orient output; pipe it in with --stdin")


def parse_counts(text: str) -> dict:
    return {
        field: (m.group(1) if (m := PATTERNS[field].search(text)) else "?")
        for field in FIELD_ORDER
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stdin", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    today = dt.date.today().isoformat()
    counts = parse_counts(get_orient_text(args.stdin))
    line = f"{today} | " + " | ".join(counts[f] for f in FIELD_ORDER) + " | snapshot_pillars.py"

    if args.dry_run:
        print(line)
        return

    existing = LOG_PATH.read_text(encoding="utf-8") if LOG_PATH.exists() else ""
    if any(row.startswith(today + " ") for row in existing.splitlines()):
        return  # already snapshotted today
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(line + "\n")
    print(line)


if __name__ == "__main__":
    main()
