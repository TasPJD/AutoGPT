# 09 — GeoLedger Commercial Pack (DRAFT)

> **Status:** DRAFT v0.1, 2026-07-03. Prepared as build-ahead work for Paul's review. NOT for external release.
> Grounded in NEXUS `VISION.md` (§6 has a full commercial model), NEXUS `PROGRESS.md` (Barton field record), and `HarLin_OS/POSITIONING.md` (voice/brand). The GeoLedger sub-project `VISION.md` and a competitor sweep both timed out on the MCP during drafting — a second pass against `AI_Projects/NEXUS.prj/GeoLedger.prj/VISION.md` is recommended before release.
> Every claim about what GeoLedger *does* is drawn from estate docs or marked `[NEEDS: ...]`. Competitor prices are `[ASSUMPTION]` — verify before customer-facing use.

---

## A. Positioning statement + elevator pitch

**Positioning statement:**

GeoLedger is a drill-core logging system for exploration geologists who work where the signal doesn't reach. It runs on a desktop at the core shed and on an Android phone at the rig (FieldCam), captures lithology, structure, mineralisation, alteration and core photography in the field, and holds every entry as an immutable, source-attributed record — so a Competent Person can sign a log knowing exactly who logged what, when, and from what evidence. It was not designed in an office and demonstrated on a lab bench; it was built in daily production on live diamond drill programs, and every feature earned its place by surviving a real field rotation. Where the established tools assume a connection and bolt provenance on afterwards, GeoLedger is offline-first and evidence-grade from the first keystroke.

**Elevator pitch:**

> GeoLedger logs drill core offline, photo-first, with a signed provenance trail a Competent Person can stand behind.

*(Voice check: no "best-in-class", "cutting-edge", "powered by AI", "solutions", "disruptive". Uses sanctioned vocabulary — offline-first, photo-first, drill core, logging, field-tested.)*

---

## B. Pricing model options

**Competitor anchoring `[ASSUMPTION — verify all figures]`:**

| Competitor | Shape | Indicative pricing (estimate) |
|---|---|---|
| **CorePlan** | Per-project/per-program drilling & core management SaaS, enterprise-quoted | ~AUD 30k–100k+/program/year `[ASSUMPTION]` |
| **DataShed / acQuire (GIM)** | Enterprise geoscience database, DBA-heavy, seat + server | ~AUD 50k–250k+/year all-in `[ASSUMPTION]` |
| **Imago** | Core photography/imagery SaaS, storage + seat metered | ~AUD 10k–50k/year by volume `[ASSUMPTION]` |

Pattern: incumbents price for majors/mid-tiers, quoted not listed, heavy setup overhead. The junior segment is priced out — the wedge NEXUS VISION §2 identifies. GeoLedger should be **listed, self-serve-able, radically cheaper to start**, with headroom to grow into the incumbents' band as accounts mature.

### Option 1 — Per-seat SaaS (recommended)
| Tier | Price (AUD) | Basis |
|---|---|---|
| Starter | $150/user/mo (or $1,500/yr) | Named user |
| Pro | $350/user/mo (or $3,500/yr) | Named user, volume breaks at 5+ |
| Enterprise | Quoted, from ~$40k/yr | Unlimited seats, on-prem/private, SSO |

### Option 2 — Per-project / per-program
| Tier | Price (AUD) | Basis |
|---|---|---|
| Single program | $6,000/program/yr | One active project, unlimited users |
| Multi-program | $4,000/program/yr (3+) | Volume-discounted |
| Enterprise | Quoted | Unlimited programs |

### Option 3 — Per-site / hybrid
Org base (1 project, 3 seats) $4,000/yr + additional project $2,500/yr + additional seat $600/yr + metered storage `[NEEDS: photo-storage cost basis]`.

### Recommendation
**Lead with Option 1 (per-seat), with a per-program annual cap from Option 2 as an escape hatch for big crews** (e.g. "$150/seat/mo or $6k/program/year, whichever is lower"). Per-seat is the norm buyers understand; publishing a real Starter price is itself a differentiator (no incumbent does). Starter at ~$150 undercuts incumbents by an order of magnitude — a two-conversation buy for a junior.

**⚠ Open decision for Paul:** VISION §6 bands (Explorer $200–400/seat/mo, Pro $600–1,200) are **higher** than recommended here. The §6 numbers may target the mature-product state; a *launch* price to win the first non-Barton customer likely wants to be lower/simpler. **Reconcile before publishing.**

---

## C. Licence / packaging

**Free trial:** 30-day full-featured Pro, single project, self-serve, no card to start; converts to Starter by default; data never held hostage (open-format export always available). Permanent **Free tier** for students/academics/single-hole prospectors (top-of-funnel + university seeding).

| | **Starter** | **Pro** | **Enterprise** |
|---|---|---|---|
| Price | $150/seat/mo | $350/seat/mo | Quoted, from ~$40k/yr |
| GeoLedger desktop logging | ✓ | ✓ | ✓ |
| FieldCam mobile capture (photo, voice, GPS) | ✓ | ✓ | ✓ |
| Offline-first + DriftGuard sync | ✓ | ✓ | ✓ |
| Provenance / audit trail (event-sourced) | ✓ | ✓ | ✓ |
| GeoLexis vocabulary correction | ✓ | ✓ | ✓ |
| Projects | 1 active | Unlimited | Unlimited |
| Seats | up to 3 | Unlimited (volume) | Unlimited |
| Custom project code libraries | Basic | Full | Full + managed onboarding |
| Templated export (XLSX/LAS) | Standard | Custom | Custom + client-schema mapped |
| DataShed/acQuire migration importer | — | ✓ `[NEEDS: confirm importer status — §10 build target, may not ship at launch]` | ✓ white-glove |
| SSO / on-prem / private cloud | — | — | ✓ |
| Support | Community + docs | Email NBD | Priority + named contact |

*Caveat:* items above the line are in field use today per PROGRESS.md, **except** the DataShed migration importer (a build target — don't list as available until built). `[NEEDS: confirm demo-ready vs roadmap for the launch tier sheet]`

---

## D. Product page outline — harlin.com.au/geoledger

Brand: gold #D9B44A / copper #B07A3B / charcoal #2D2D2D. Tone: plain, technical, honest.

1. **Hero** — Headline: *"Log drill core where the signal doesn't reach."* Sub: "GeoLedger captures lithology, structure and core photography offline — and keeps a signed provenance trail your Competent Person can stand behind." CTA: *Start a 30-day trial* / *Watch the 10-minute walkthrough*. Visual: real core-shed + FieldCam-at-rig photo (Barton, with permission).
2. **The problem** — one honest ~60-word paragraph from VISION §2 (the re-typing chain, fidelity leaking at every tool boundary).
3. **What it does — three blocks:** **Offline-first** ("no sync-conflict screen — because there is no sync conflict"); **Photo-first** ("core photography is the record, not an attachment" `[NEEDS: confirm photo workflow]`); **Evidence-grade** ("every entry immutable and source-attributed; rebuild any log to any point in time; built for JORC/NI 43-101 sign-off"). *See §G — lead with this.*
4. **Built in the field, not the office** — credibility block: runs daily on live diamond drilling (Challenger, Tunkillia), with permission. Your most defensible asset — give it room.
5. **FieldCam companion** — Android rig capture (photos, voice, GPS, magnetometer, interval logging) `[NEEDS: confirm shipping feature list; PROGRESS shows 0.8.18 sandbox]`.
6. **GeoLexis** — "Say 'quartz-carbonate vein', get the right code — not a phonetic guess." Specify what it does; don't say "powered by AI".
7. **How it fits your stack** — open formats on the boundary (LAS, XLSX, GeoPackage; VISION §5.7). "We don't lock your data in."
8. **Pricing** — the three tiers, real published Starter price, *Start trial* button. Transparency is the differentiator.
9. **Case studies** — two cards → Challenger + Tunkillia (pending permission).
10. **FAQ + trust** — data sovereignty (offline-first, your data stays yours), Competent Person/audit questions, migration path.
11. **Footer CTA** — "Built by geologists, for geologists." HarLin Labs / NEXUS lockup. Entity: HarLin Consulting Pty Ltd.

---

## E. Case-study skeletons ×2 (Barton — Challenger + Tunkillia)

**Common structure:** (1) client + program `[NEEDS: hole count/metres/timeframe Paul will publish]`; (2) situation before (re-typing, delay, provenance gaps); (3) what GeoLedger/FieldCam did (offline rig logging, photo capture, daily templated export into Barton's schema — PROGRESS documents this; per-project code libraries); (4) result `[NEEDS: quantified outcomes only if substantiable — do NOT invent]`; (5) quote from Paul + ideally a Barton rep.

- **Challenger** — angle: *established methodology made faster + auditable* (rock boards, legacy 190-code library, mature workflow).
- **Tunkillia** — angle: *greenfield ramp-up under pressure* (625-code project library stood up, TKB diamond holes logged daily, daily XLSX to Barton's exact schema during an active rotation).

**Permission to ask Barton for:** named use of Barton Gold / Challenger / Tunkillia; program-level figures; core photography/screenshots; a named quote/logo; any quantified metrics.

**Draft permission-ask email:**

> **Subject:** Permission to reference the Tunkillia & Challenger logging work
>
> Hi [Barton contact],
>
> As you know, I've been logging Challenger and Tunkillia core using GeoLedger and FieldCam, the field-logging tools I've built through HarLin. I'm now putting together a short product page and two case studies, and I'd like to reference the Barton work — because it's the real thing, and it's the most honest way to describe what the tools do.
>
> Before I publish anything, I want your sign-off. Specifically, I'd like permission to:
>
> - Name Barton Gold, Challenger and Tunkillia in the case studies and on the product page.
> - Publish program-level detail (hole counts, metres, dates) — I'll send you exact wording to approve.
> - Use a small number of core-tray photos / app screenshots from the programs.
> - Optionally include a short quote from Barton, if someone's willing.
>
> I'll send you every word and image for approval before it goes live, and I'm happy to keep anything commercially sensitive out. Nothing is published without your yes.
>
> Would a quick call this week suit to talk it through?
>
> Thanks,
> Paul Dale
> HarLin Consulting Pty Ltd

---

## F. Go-to-market checklist — to first paying customer beyond Barton

1. **Reconcile pricing** (§B) — settle launch numbers vs VISION §6; publish a real Starter price.
2. **Lock the launch feature list** — resolve every `[NEEDS:]`; no tier sheet or page overclaims.
3. **Ship the product page** (§D) with self-serve trial signup.
4. **Record the 10-minute onboarding video** — the self-serve activation moment.
5. **Get Barton's permission** (§E); publish both case studies — strongest sales asset.
6. **Write ToS + data sovereignty statement** — juniors won't sign without the data-ownership answer in writing.
7. **Trial→paid mechanics** — signup, trial clock, billing `[NEEDS: Stripe — connector requires auth]`, export-on-cancel.
8. **Build the target list** — 15–25 named junior explorers in SA/WA drilling now, reachable through Paul's network.
9. **Warm outreach** — offer 3–5 lighthouse juniors founder-led onboarding for feedback + testimonial; convert best fit to first paying logo.
10. **Instrument and iterate** — opt-in telemetry on trial activation/drop-off; fix the top friction point before scaling.

---

## G. Lead differentiator — "evidence-grade / chain-of-custody drill data"

**Assessment: credible, and the strongest angle you have — with two guardrails.**

**Why it's real (VISION §5):** event-sourced (§5.2 — every change immutable, state derived, any record rebuildable to any point in time = a literal chain of custody, not a bolt-on); source attribution + confidence metadata + version lineage as substrate (§5.10); AI-assisted not AI-autonomous (§5.9 — accept/reject/correct, correction logged; "JORC does not accept 'the model said so'"); Competent-Person sign-off support (§5.10, §8). No incumbent leads with this because most bolt provenance onto a mutable DB after the fact. It's also *defensible* in a way "AI" and "offline" increasingly aren't.

**How to frame it:** lead with the buyer's job. The Competent Person is personally, professionally and legally accountable for what they sign. GeoLedger's promise: **"When you sign the log, you can prove where every number came from."** Category line to test: **"Evidence-grade drill data — provenance built in, not bolted on."**

**Two guardrails (honesty):**
1. Say **"JORC/NI 43-101-*ready* provenance", never "compliant"/"certified."** GeoLedger provides the auditable substrate; the CP makes the report compliant. Claiming compliance is false and a liability.
2. Don't imply legal/regulatory endorsement you don't have. "Chain of custody" carries forensic connotations — pair it with the concrete mechanism ("every entry is immutable and source-attributed") so it reads as engineering fact. `[NEEDS: Paul's call — I lean "provenance" for headlines, "chain-of-custody" in the technical body.]`

**Bottom line:** make evidence-grade provenance the **first** of the three hero blocks. Offline-first gets you in the door with the field geo; evidence-grade provenance is what makes the *Competent Person* — who carries the risk — insist on it.

---

*Resolve all `[NEEDS:]` and `[ASSUMPTION]` markers before any external use. Recommended second pass: read `GeoLedger.prj/VISION.md` to confirm feature-level copy.*
