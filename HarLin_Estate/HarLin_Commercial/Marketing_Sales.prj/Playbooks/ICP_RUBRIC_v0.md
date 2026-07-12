# ICP Scoring Rubric — v0 (skeleton)

**Owner:** Cartographer (versioned; back-tested quarterly against won/lost)
**Used by:** Assayer (grading), Prospector (sweep priorities)
**Status:** v0 = structure + priors from the master plan. v1 requires
Cartographer's Market Map session with real market data. Version every
change; Assayer re-grades on re-version.

## Grading

Score each axis 0–2; grade = A (≥12), B (9–11), C (6–8), D (<6).
**Every grade carries an `icp_rationale` — a grade without a why is invalid.**

### Stream: `nexus` (GeoLedger / FieldCam / GeoLexis subscriptions)

| Axis | 0 | 1 | 2 |
|---|---|---|---|
| Active drilling | none 12mo | planned/announced | rigs turning now |
| Data pain surface | outsourced/none | in-house, tolerated | visible pain (job ads, paper logging, audit findings) |
| Team size fit | solo consultant | 2–10 geos | 10–50 geos (sweet spot; majors = long cycles, score 1) |
| Tech posture | hostile/locked-in | neutral | early-adopter signals (modern stack, cloud, digital talk in reports) |
| Budget visibility | pre-raise shell | funded 1 season | multi-year funding / producing |
| Reachability | no consented path | conference/mutual | existing relationship |
| Geography/ops | remote-only ops we can't support | AU adjacent | AU/international with AU decision-makers |

### Stream: `consulting` (TDD, Governance & Board Advisory, targeting)

Axes: deal/transaction activity (M&A, IPO, farm-in) · board composition gap ·
technical-report red flags · commodity/deposit fit to Paul's expertise ·
budget signal · reachability. Same 0–2 scale, grade thresholds ÷ scaled to 12.

## Priors to validate in v1 (Cartographer)

- ASX gold/copper juniors post-raise are the highest-velocity nexus segment.
- Mid-tiers (2–5 sites) beat majors on cycle time at equal ACV.
- Conference-sourced contacts convert ≥3× cold-consent lists (validate; if
  false, Prospector's sweep order changes).

## Back-test protocol (quarterly, Cartographer + Assayer)

Pull win rate and meeting rate by grade from `crm_stage_history` ×
`crm_companies.icp_grade`. If A-grade meeting rate ≤ B-grade, the rubric is
mis-weighted: fix the axes, bump the version, re-grade. The rubric serves
the outcomes, never the reverse.
