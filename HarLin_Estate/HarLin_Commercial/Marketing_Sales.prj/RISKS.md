# Risk Register — HarLin Commercial engine

**Owner:** Foreman (review at quarterly retro) · **Created:** 2026-07-12
Likelihood/Impact: L/M/H. Every risk has a mitigation that exists TODAY or a
TODO with an owner — no orphan risks.

| # | Risk | L | I | Mitigation (current) | Residual action |
|---|---|---|---|---|---|
| R1 | Single-machine dependency (Helios holds DB + gateway + tunnel) | M | H | Auto .bak on migration; git mirror of all code/docs; quarterly HL_Data export | TODO(1): scheduled weekly export (Task Scheduler) |
| R2 | Reputation damage from tone-deaf agent outreach in a small market | L | H | Human gate on ALL sends; consent enforced in code; cadence/rest rules; Advocate audits | Standing — never relax the gate |
| R3 | Spam Act / Privacy Act breach | L | H | consent_basis + evidence columns; tool-layer refusals; DNC absolute; audit trail of refusals | TODO(2, HARD GATE): unsubscribe infra before first outbound email |
| R4 | CRM data rots (stale, dup, orphaned) → decisions on fiction | M | M | Hygiene views, dedup index, monthly Quartermaster run, metabolism decay | Watch: hygiene metrics in weekly standup |
| R5 | Gateway tools never wired → agents write via ad-hoc paths, audit gaps | M | M | Sole-write-path rule in charters; register() shim ready; standing TODO(0) | Close at next on-machine AEOS session |
| R6 | Phase discipline erodes (outreach starts before product ready) | M | H | Phased activation in charters (Envoy=Phase 2, gated on NEXUS GA); plan CONFIRMED | Foreman enforces at standup |
| R7 | Key-person risk: only Paul understands the engine | M | H | OPERATIONS_MANUAL.md (succession-executable); plain files+SQL everywhere | Review manual each quarter — does it still match reality? |
| R8 | Agent identity honour-system: a buggy session mislabels `agent` in audit | M | L | Every session is Paul-initiated today; Pulse session ledger cross-references | TODO(3): per-agent auth at gateway if unattended agents arrive |
| R9 | Market-data staleness (rubric built on priors, not data) | H | M | Rubric is v0 by name; quarterly back-test protocol baked in | Cartographer v1 session is the fix |
| R10 | DB unencrypted at rest | L | M | Local-first doctrine; estate-level disk posture; no cloud copies of PII | ACCEPTED (estate-level BitLocker decision is Paul's, outside this project) |
