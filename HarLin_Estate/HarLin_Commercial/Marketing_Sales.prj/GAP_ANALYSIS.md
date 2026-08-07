# Gap Analysis — HarLin Commercial vs Peer-Grade Commercial Infrastructure

**Date:** 2026-07-12 · **Requested by:** Paul ("gap analysis … against best practice
and world-leading commercial infrastructure systems … peer level") · **Author:** Claude session
**Disposition key:** ✅ BUILT (this session) · 📋 TODO(phase → owner) · ⛔ REJECTED (reasoned)

## Benchmark set

What "peer level" means here, honestly scoped: HarLin is a solo-operator,
agent-first commercial engine — the fair comparison is the *capability set* of
world-class systems, not their scale:

1. **CRM platforms** — Salesforce Sales Cloud, HubSpot, Dynamics 365: data
   model depth, audit/field history, dedup, stage governance, forecast
   categories, activity timelines.
2. **RevOps practice** (the discipline layer world-class teams run on top):
   pipeline snapshots & velocity, stage-conversion analytics, metrics
   dictionaries, forecast hygiene, data-hygiene SLAs.
3. **Sales methodology** — MEDDICC/SPICED-class qualification, documented
   playbooks, win/loss taxonomies, cadence governance.
4. **Marketing ops** — consent-first lifecycle (Spam Act/GDPR-grade),
   campaign attribution, content ops with briefs and templates.
5. **Governance** — SOC2-flavoured operational discipline scaled to a
   single-operator estate: audit trails, backups/DR, risk register,
   incident runbooks, succession documentation.

## Findings

### A. Data platform (vs Salesforce/HubSpot data model)

| # | Gap | Severity | Disposition |
|---|---|---|---|
| A1 | No immutable **audit trail** of record mutations (SFDC field history class) | High | ✅ BUILT — `crm_audit` append-only table; every tool write and every consent refusal audited (schema v2) |
| A2 | No **stage history** → no conversion rates, days-in-stage, velocity | High | ✅ BUILT — `crm_stage_history` + `v_crm_stage_conversion`; transitions recorded with actor |
| A3 | No **point-in-time pipeline snapshots** → no trend/slippage analysis (core RevOps) | High | ✅ BUILT — `crm_pipeline_snapshots` + `crm_snapshot_pipeline` tool (weekly cadence in OPERATING_CADENCE) |
| A4 | No **dedup guards** (SFDC duplicate rules) | Med | ✅ BUILT (exact): case-insensitive unique index on contact email; name-lookup index + merge protocol in SALES_PLAYBOOK. 📋 TODO(2 → Quartermaster): fuzzy company matching in hygiene runs |
| A5 | **Consent evidence** not captured (who/what proves the basis — GDPR-grade practice) | Med | ✅ BUILT — `consent_evidence` column + tool support |
| A6 | No **closed-record governance** (SFDC validation rules): won/lost silently reopenable | Med | ✅ BUILT — reopen requires explicit `reopen=True`, recorded in history |
| A7 | No **overdue-action** hygiene surface (task SLAs) | Med | ✅ BUILT — `v_crm_overdue_actions` + `crm_next_actions(overdue_only=True)` |
| A8 | Lead-vs-contact split (SFDC Lead→convert model) | Low | ⛔ REJECTED — deliberate simplification; grades on companies + consent on contacts covers the solo-operator case without conversion ceremony. Revisit only if a human team joins |
| A9 | Forecast **categories** (commit/best-case/pipeline) | Low | 📋 TODO(2 → Quartermaster): add category column when Envoy goes live; weighted pipeline suffices until real deals exist |

### B. Reporting & visibility (vs HubSpot dashboards / RevOps BI)

| # | Gap | Severity | Disposition |
|---|---|---|---|
| B1 | No **pipeline dashboard** (numbers lived only in SQL) | High | ✅ BUILT — `generate_dashboard.py` → `Dashboards\pipeline_dashboard.html` (house standalone-HTML pattern, generation-stamped), registered in Alfred's Workflows menu |
| B2 | No **metrics dictionary** (every world-class RevOps team defines terms before measuring) | High | ✅ BUILT — `Playbooks\METRICS_DICTIONARY.md` |
| B3 | Live/auto-refreshing dashboards & morning-brief KPI feed | Med | 📋 TODO(1 → Quartermaster): wire `crm_pipeline_report` into PAi morning brief once gateway tools registered; regenerate dashboard in the weekly standup run |

### C. Process & methodology (vs MEDDICC-class sales practice)

| # | Gap | Severity | Disposition |
|---|---|---|---|
| C1 | **Playbooks dir empty** — no sales process, qualification framework, cadence spec | High | ✅ BUILT — `SALES_PLAYBOOK.md` (stage definitions + entry/exit criteria, MERIT qualification — MEDDICC adapted to mining, cadence & rest rules, merge protocol, win/loss taxonomy) |
| C2 | **ICP rubric** referenced everywhere, existed nowhere | High | ✅ BUILT — `ICP_RUBRIC_v0.md` (v0 skeleton with scoring axes; Cartographer owns v1 with real market data) |
| C3 | No **operating cadence** doc (standup format, snapshot ritual, hygiene runs, retro, incident runbook) | High | ✅ BUILT — `OPERATING_CADENCE.md` |
| C4 | No campaign-brief / case-study **templates** | Low | 📋 TODO(1 → Herald+Scribe): produce with the first real campaign/case study — templates without content are ceremony |
| C5 | **Attribution model** undefined (first/multi-touch) | Low | 📋 TODO(2 → Quartermaster): define at first multi-campaign quarter; `crm_campaign_touches` already captures the raw data |

### D. Org & learning system (vs world-class enablement)

| # | Gap | Severity | Disposition |
|---|---|---|---|
| D1 | No **agent session protocol** (how a session opens, works, closes — repeatability) | High | ✅ BUILT — `Internal Infrastructure\Commercial\SESSION_PROTOCOL.md` |
| D2 | **LEARNINGS.md** files didn't exist (the learning loop had no substrate) | High | ✅ BUILT — seeded for the four active Phase 0 agents; others created at activation per protocol |
| D3 | No **risk register** | Med | ✅ BUILT — `RISKS.md` (Marketing_Sales.prj) |
| D4 | No **operations manual** for a successor (HP-39 was a principle, not a document) | High | ✅ BUILT — `OPERATIONS_MANUAL.md` — how to run/inherit the whole engine |

### E. Platform integration & resilience (vs SOC2-flavoured ops)

| # | Gap | Severity | Disposition |
|---|---|---|---|
| E1 | CRM tools not yet **registered in the MCP Gateway** | High | 📋 TODO(0 → Paul/AEOS session) — standing item; not executable over the tunnel it would restart (governance constraint) |
| E2 | No **scheduled backups/exports** (quarterly export is documented, not automated) | Med | 📋 TODO(1 → Quartermaster): Windows Task Scheduler entry for weekly `crm_export` + snapshot; needs on-machine shell (governance constraint) |
| E3 | **ContextGraph mirror** (companies/contacts ↔ COMPANY/PERSON nodes) unbuilt | Med | 📋 TODO(1 → Quartermaster+AEOS): spec'd in ADR-001; touches the live brain store — belongs in an on-machine AEOS session |
| E4 | **Xero reconciliation** (forecast honesty vs actuals) unbuilt | Med | 📋 TODO(2 → Quartermaster): needs won deals + invoices to reconcile; Xero MCP already connected |
| E5 | No **unsubscribe/preference infrastructure** (Spam Act mechanics need a working channel before ANY outbound email) | High (gates Phase 2) | 📋 TODO(2 → Envoy/Herald, HARD GATE): unsubscribe path + preference handling MUST exist before the first outbound sequence; consent layer already refuses at tool level meanwhile |
| E6 | DB unencrypted at rest; single-machine residency | Low | ⛔ ACCEPTED RISK (documented in RISKS.md): local-first is doctrine (HP-39); BitLocker/whole-disk posture is an estate-level matter, not CRM-level |
| E7 | Agent identity is honour-system (`agent` param, not authenticated) | Low | 📋 TODO(3 → gateway): per-agent tokens if/when agents run unattended; today every session is Paul-initiated |

## Scorecard after this build

Capability parity with the benchmark set, honestly assessed: **data model
and governance now at parity for this scale** (audit, history, snapshots,
consent, dedup, hygiene views — the things Salesforce charges for and
solo operators never build). **Process layer now documented** (playbook,
rubric, metrics, cadence) at v0/v1 depth — content matures with real market
contact. **Remaining structural gaps are all integration jobs** (gateway,
scheduler, ContextGraph, Xero, unsubscribe) — allocated, owned, and phased
in TODO.md; none block Phase 0 work.
