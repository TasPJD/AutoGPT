# RISK — Marketing and Sales

> Transitional local view pending the central MetaRef-backed System Risk Register. Migrated from `RISKS.md` on 2026-07-14.

| ID | Risk | L | I | Current control / response |
|---|---|---|---|---|
| MS-R01 | Helios is a single-machine dependency for DB, gateway and tunnel | M | H | Backups, git mirror and exports; implement scheduled weekly export. |
| MS-R02 | Tone-deaf or unsupported outreach damages reputation | L | H | Human send gate, evidence controls, brand voice, cadence/rest rules and audit. |
| MS-R03 | Spam/Privacy non-compliance | L | H | Consent evidence, DNC enforcement and refusal audit; unsubscribe infrastructure is a hard gate before sequences. |
| MS-R04 | CRM staleness, duplicates or orphan records distort decisions | M | M | Hygiene views, dedup controls, monthly review and staleness monitoring. |
| MS-R05 | Gateway remains unwired and encourages ad-hoc writes | M | H | Sole-write-path rule; register tools only in the coordinated AEOS stabilisation session. |
| MS-R06 | Phase discipline erodes and outreach starts before readiness | M | H | Readiness rule in `DESIGN.md`; Foreman/Paul gates and accepted plan. |
| MS-R07 | Key-person dependency on Paul | M | H | Succession-executable operations manual and plain SQL/files; quarterly review. |
| MS-R08 | Agent identity in audit is spoofed or incorrect | M | L | Paul-initiated sessions and session cross-reference; add authenticated identity before unattended operation. |
| MS-R09 | Market data and ICP rubric become stale | H | M | Versioned rubric, quarterly back-test and observed funnel evidence. |
| MS-R10 | CRM data is not encrypted at rest | L | M | Local-first posture; estate-level disk-control decision remains with Paul. |
| MS-R11 | Revenue Bridge and CRM become competing opportunity stores | M | H | Bridge owns portfolio strategy; this project owns CRM execution; route qualified records once with stable references. |

Owner: Paul Dale / Commercial Foreman. Review quarterly and at every major outbound-capability change.
