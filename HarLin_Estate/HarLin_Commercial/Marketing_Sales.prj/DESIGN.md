# DESIGN — Marketing and Sales

## Architecture

This project owns commercial work product and operating policy. Commercial agent definitions and code live under Internal Infrastructure; the CRM database lives in the approved AEOS store; external-facing collateral and campaign records live here.

```text
Revenue Bridge / product projects -> qualified intent and evidence
                                     |
                                     v
Marketing and Sales -> campaign, message, pipeline and follow-up controls
                                     |
                                     v
AEOS CRM via the approved single writer -> audit, stage, consent and outcome evidence
```

## Control boundaries

- One CRM write path through registered gateway tools; no ad-hoc database writers.
- Consent, do-not-contact, unsubscribe and human-send gates are enforcement controls, not prose preferences.
- Agents may prepare, grade and recommend; Paul authorises external communication until an explicit governed delegation exists.
- Revenue Bridge prioritises the aggregate portfolio but does not become a shadow CRM.
- Approved, dated Commercial Assessment snapshots may inform prioritisation; Marketing and Sales records the observed funnel evidence used for calibration.

## Principles applied

HP-10 visibility, HP-12 ground truth, HP-14 derived views, HP-18 founder-capacity protection, HP-19 human gates, HP-23 one write path, HP-25 staleness control, HP-27 rationale, HP-31 register cascade and HP-40 commercial-grade delivery.

## Readiness rule

“Built” or “active” means the internal capability exists; it does not authorise outreach. Outbound readiness additionally requires a live write/audit path, consent basis, unsubscribe mechanics where applicable, approved claim evidence, a reviewed target/message and Paul authority.
