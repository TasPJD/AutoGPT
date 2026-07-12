# Valuation Framework — v0.1 (provisional)

**Status:** 🟠 DRAFT — method skeleton only. Two alignment passes outstanding: (1) against the HarLin Business Plan / Vision documents (in progress — estate access pending), (2) against Research Leg A findings (peer valuation methods). **No number may be produced from this document until it passes the framework gate.**

## 1. What gets valued

Three levels, computed in order:

1. **Per-project revenue potential** — a scored, staged estimate per key project (Harness, OS, PAi, Alfred/AEOS, Nexus, GFM) and any other pipeline entity above stage S1.
2. **Pipeline balance-sheet value** — the portfolio sum with confidence bands.
3. **Business value** — pipeline value plus operating capability premium (the demonstrated ability to conceive→ship, which the monthly report itself evidences) minus concentration/key-person discounts.

## 2. Method: stage-gated expected value with a cost floor

For each project *p*:

```
EV(p) = AV(p) × P(stage(p)) × Q(p)
value(p) = max( EV(p), CostBasis(p) )
```

- **AV(p) — addressable value:** what the project could plausibly earn per year at maturity × a capitalisation multiple. Anchored to the Business Plan's revenue model for that product line *(alignment pass 1 fills this per project)*.
- **P(stage) — stage probability:** the probability the project reaches revenue, keyed to `LIFECYCLE_TAXONOMY.md` stages. Provisional ladder (Leg A to validate against Berkus/Payne/First-Chicago practice):

  | Stage | P |
  |---|---|
  | S0 Conceived | 0.02 |
  | S1 Scaffolded | 0.05 |
  | S2 Active-building | 0.10 |
  | S3 Functional | 0.25 |
  | S4 Operational | 0.40 |
  | S5 Commercial-ready | 0.65 |
  | S6 Revenue-bearing | 1.00 (value from actuals, not EV) |
  | SX/SZ | 0 (cost basis noted as sunk) |

- **Q(p) — quality/risk modifier (0.5–1.5):** bounded scorecard on 4 factors — doctrine fit (commercial-grade build, HP-40), dependency risk (platform/model reliance), differentiation, and evidence quality (a project whose stage is only *inferred* gets marked down). Factors and weights to be finalised in alignment passes.
- **CostBasis(p):** dispatch cost ledger + attributable time. Floors the value: a real artifact that cost X to build is worth at least its replication saving.

**Anti-gaming rules:** stage claims above S2 require taxonomy evidence; AV anchors must cite a Business Plan line or an external comparable (never invented); Q is bounded so it cannot dominate; every reported number publishes its inputs beside it (reproducibility).

## 3. Confidence bands

Each value(p) is reported as low/base/high: base as above; low uses P(stage−1) and Q floor; high uses P(stage+1) and Q as scored. Pipeline value sums each band. Precision theatre is worse than honest width — bands are expected to be wide in month one and narrow as capture improves.

## 4. Business-value roll-up (level 3)

`BV = Σ value(p) + capability premium − discounts`

- **Capability premium:** valued as the cost-to-duplicate of the operating system around the pipeline (harness, catalog, Alfred) — itself estimable from the cost ledger.
- **Discounts:** key-person (Paul) concentration; single-platform dependency. Rates set in alignment pass 1; succession design (HP-39, family access) is the stated mitigant to the key-person discount and should be reflected once evidenced.

## 5. Cadence and drift

Re-score monthly during report production (RUNBOOK step 4). Score *deltas* are pillar-1's time series: a project whose EV rises because scope expanded (AV↑) is distinguished from one that advanced (P↑) — the report says which.

## 6. Open items for the alignment passes

1. AV anchors per key project — from Business Plan revenue model *(pass 1)*
2. Capitalisation multiple convention *(pass 1 + Leg A)*
3. Probability ladder calibration *(Leg A)*
4. Q factor weights *(pass 1 + Leg A)*
5. Discount rates for key-person / platform concentration *(Leg A)*
6. Currency + rounding convention *(pass 1; AUD assumed)*
