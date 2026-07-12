#!/usr/bin/env python3
"""Validate a monthly report instance against the framework's hard rules.

Commercial-grade discipline (HP-40): a report that fails validation is not
filed. Checks are structural, not semantic — they catch process violations,
not bad judgment.

Usage:
    python validate_report.py Reports/2026-07b.md

Checks:
  V1  required sections 1-10 from REPORT_TEMPLATE.md all present
  V2  provenance mix line present in the header
  V3  every pillar-dashboard row is filled or says "not captured"
  V4  any valuation figure (currency amount) is accompanied by the word
      "inputs" within its section (reproducibility rule) and a confidence band
  V5  no bare "TBD"/"TODO" left in the body
  V6  a Gaps ledger section exists and is non-empty OR explicitly says "none"
Exit code 0 = pass, 1 = violations (listed on stdout).
"""

import re
import sys
from pathlib import Path

REQUIRED_SECTIONS = [
    "Executive summary",
    "Pillar dashboard",
    "Portfolio movement",
    "Value & pipeline",
    "Key project sections",
    "System health",
    "Operator load",
    "Record integrity",
    "Gaps ledger",
    "Decisions sought",
]

CURRENCY = re.compile(r"(?:AUD|\$)\s?[\d,]+")


def validate(path: Path) -> list:
    text = path.read_text(encoding="utf-8")
    problems = []

    for section in REQUIRED_SECTIONS:
        if not re.search(rf"^#+\s*\d*\.?\s*{re.escape(section)}", text, re.M | re.I):
            problems.append(f"V1 missing section: {section}")

    if not re.search(r"Provenance mix", text, re.I):
        problems.append("V2 missing provenance-mix line in header")

    dash = re.search(r"Pillar dashboard(.*?)(?=\n#+ )", text, re.S | re.I)
    if dash:
        for row in re.findall(r"^\|\s*\d.*$", dash.group(1), re.M):
            cells = [c.strip() for c in row.split("|")[2:-1]]
            if cells and not any(cells) and "month 2" not in row:
                problems.append(f"V3 empty dashboard row: {row.strip()[:60]}")

    for m in CURRENCY.finditer(text):
        window = text[max(0, m.start() - 1500): m.end() + 1500]
        if "inputs" not in window.lower():
            problems.append(f"V4 figure without published inputs near: {m.group(0)}")
        if not re.search(r"low|base|high|band", window, re.I):
            problems.append(f"V4 figure without confidence band near: {m.group(0)}")

    for m in re.finditer(r"\b(TBD|TODO)\b", text):
        problems.append(f"V5 unresolved {m.group(0)} at offset {m.start()}")

    gaps = re.search(r"Gaps ledger(.*?)(?=\n#+ |\Z)", text, re.S | re.I)
    if gaps and len(gaps.group(1).strip()) < 10:
        problems.append("V6 gaps ledger empty — state gaps or write 'none'")

    return problems


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    problems = validate(Path(sys.argv[1]))
    for p in problems:
        print(p)
    print(f"{'FAIL' if problems else 'PASS'}: {len(problems)} violation(s)")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
