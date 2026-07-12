# Commercial Metrics Dictionary v1

**Owner:** Quartermaster. One definition per metric; if a report and this
document disagree, one of them gets fixed the same day. All metrics compute
from the CRM store — never hand-asserted (HP-12 spirit: actuals come from
systems of record).

| Metric | Definition (exact) | Source | Cadence |
|---|---|---|---|
| Account universe | COUNT(crm_companies) per stream | crm_companies | weekly |
| Graded coverage | % of universe with icp_grade NOT NULL | crm_companies | weekly |
| A-grade accounts | COUNT WHERE icp_grade='A' | crm_companies | weekly |
| Contactable | COUNT(v_crm_contactable) — consented, not resting, not DNC | view | weekly |
| Open pipeline (AUD) | SUM(value_aud) open stages | v_crm_pipeline | weekly |
| Weighted pipeline | SUM(value_aud × probability) open stages | v_crm_pipeline | weekly |
| Pipeline velocity | Δ weighted pipeline between snapshots | crm_pipeline_snapshots | weekly |
| Reply rate | outbound interactions with outcome ∈ {reply, meeting} ÷ outbound sent, per sequence | crm_interactions | monthly |
| Meeting rate | opportunities reaching `meeting` ÷ opportunities entering `qualified` | crm_stage_history | monthly |
| Proposal→won | won ÷ (won+lost) among opps that reached `proposal` | crm_stage_history | quarterly |
| Days-in-stage | median days between stage transitions, per stage | crm_stage_history | quarterly |
| Lost-reason mix | distribution of lost_reason (taxonomy) | crm_opportunities | quarterly |
| Action hygiene | % open opps with next_action + owner + due date (target 100%) | crm_opportunities | weekly |
| Overdue actions | COUNT(v_crm_overdue_actions) (target 0) | view | weekly |
| Consent hygiene | contacts with consent_basis='none' being touched (target 0 — tool-enforced) | crm_audit refusals | monthly |
| Data freshness | % companies last_touched within 90 days (active segments) | crm_companies | monthly |
| Won revenue (AUD) | SUM(value_aud) WHERE stage='won', reconciled vs Xero invoices | crm_opportunities + Xero | quarterly |
| CAC-equivalent | agent-session count attributable per won deal (session ledger) | Pulse + CRM | quarterly |
| NRR (Phase 3) | renewal + expansion value ÷ prior-period value, per client cohort | CRM + ClientLedger | quarterly |

**Anti-vanity rule:** no metric enters a report without a decision it serves.
Follower counts, raw send volumes, and page views are recorded nowhere.
