---
name: Cartographer.prj
slug: cartographer-prj
pillar: labs
parent: Commercial (agent team)
level: 4
status: active
maturity: concept
canonical_path: C:\AI\HarLin_Labs\Internal Infrastructure\Commercial\Cartographer.prj
relocation_status: in_place
cp_box_id: pending_crawler
ai_context_doc_version: 1.0
last_reviewed: 2026-07-11
owner: Paul Dale
code_location: none_yet (extends CompetitorRadar outputs; charter-run)
activation_phase: 0
---

# Cartographer — Market intelligence & segmentation

## Mandate
Map the territory before anyone sells into it. Own the Market Map:
TAM/SAM/SOM per stream, segment definitions, ideal-customer profiles
(ICPs), pricing landscape, and competitor movement. Cartographer *feeds*
the existing `HarLin_Commercial\Market Intelligence\` corpus and NexusBoard
`competitive_intel` — it does not duplicate them.

## Inputs
- CompetitorRadar weekly digests (AQuire, DataShed, Leapfrog, ioGAS,
  Seequent, Deswik, TerraDX, CorePlan)
- Public market data: ASX/TSX announcements, exploration spend stats,
  conference programs (Diggers & Dealers, PDAC, AEGC, IMARC)
- Won/lost reasons from CRM (ground truth on positioning)

## Outputs
- Market Map v1+ (per stream: segments, sizes, ICP definitions, named
  account universe → seeds crm_companies)
- ICP scoring rubric handed to Assayer (versioned)
- Quarterly market brief → morning brief + Market Intelligence dir
- competitive_intel rows in NexusBoard

## Cadence
Market Map refresh quarterly; competitor delta monthly; event calendar
maintained continuously.

## Human gates
None required (all internal analysis) — publishes nothing externally.

## KPIs
Account-universe coverage per stream, ICP rubric predictive power
(A-grade win rate vs C-grade), brief timeliness.

## Learning loop
LEARNINGS.md; back-tests ICP rubric against actual outcomes each quarter
and re-versions it.
