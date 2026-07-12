# TODO — Marketing_Sales.prj

## Confirmed by Paul 2026-07-12
- [x] Confirm/rename agent roster (names are proposals; roles are the substance)
- [x] Approve ADR-001 (CRM on AEOS)
- [x] Confirm Phase 0 activation set (Quartermaster, Cartographer, Herald, Scribe)

## Phase 0 (in progress)
- [x] Build CRM v1 kit: schema + migration + gateway tools + consent
      enforcement (sandbox + on-machine tested; see CRM.prj\PROGRESS.md)
- [x] Create live CRM store (2026-07-12: aeos_events.db bootstrapped in
      AEOS runtime\business — 7 tables, 3 views, schema v1)
- [x] Hook Commercial_Team_Flowchart.html into Alfred's Workflows menu
      (console/boards.py `Commercial` group; 25 console tests green)
- [x] Register Commercial descriptors in the System of Record
      (catalog.py ingest — 13 slugs verified in catalog.sqlite)
- [ ] Wire crm_tools.register() into the MCP Gateway (next AEOS on-machine
      session — not attempted over the tunnel; would restart the live gateway)
- [ ] ContextGraph mirror job (companies/contacts ↔ COMPANY/PERSON nodes)
- [ ] Cartographer #1: NEXUS market map v1 (fold in existing Market
      Intelligence material; ≥200 companies mapped and streamed)
- [ ] Herald/Scribe #1: BRAND_VOICE v1 from HarLin Identity Library
- [ ] Scribe: 3 seed case studies from active engagements (Barton Gold
      Challenger/Tunkillia et al. — client-approved before any use)
- [ ] Quartermaster: pipeline dashboard (standalone-HTML house pattern)
- [ ] Arm "Quarterly Commercial Retro" play in PIPELINE.md
- [ ] Migrate existing consulting clients into CRM from ClientLedger

## Later phases
- [ ] Prospector/Assayer activation + first graded target list (Phase 1)
- [ ] Envoy activation with human-gated sequences (Phase 2, NEXUS GA)
- [ ] Shepherd/Advocate full cadence + renewals engine (Phase 3)
- [ ] Evaluate disposable peripherals (email delivery adapter) only when
      volume demands
