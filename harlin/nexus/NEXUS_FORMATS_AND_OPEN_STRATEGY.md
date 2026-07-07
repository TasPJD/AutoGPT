# NEXUS File-Format Strategy & Open/Free Doctrine (2026-07-07)

The file-format deep dive Paul requested (suite-level; each product's docs inherit it), plus
the open-source/free-tier business doctrine, both proposed for baking into HarLin philosophy.
Status 🟠 AWAITING CONFIRM. Companion: `NEXUS_INTEROP_ARCHITECTURE.md`.

---

## PART A — File formats: "Open at the Boundary"

### A1. The doctrine (proposed principle for the registry)

> **PROPOSED HP: "Open at the Boundary."** NEXUS competes on understanding, never on
> captivity. Anything a customer's data touches at the edge of a NEXUS product is an open,
> documented format; imports are courtship, exports are freedom. We are deliberately the
> anti-ESRI: reading us requires no licence, and leaving us requires no consultant.
> (Child of Continuity-by-Design: "no hostage data" made mechanically true; and of the
> Multiplier Doctrine: one format layer serves every product.)

This is also the sharpest marketing wedge available against the incumbents' behaviour
(Surpac/Datamine binary silos, ESRI gravity): *"Your Surpac guy can read our exports this
afternoon."*

### A2. The canonical open spine (what NEXUS speaks natively)

Rather than chasing every proprietary binary, NEXUS standardises on four open carriers, with
targeted dialect importers/exporters around them:

| Carrier | Role |
|---|---|
| **CSV / XLSX** | Universal tabular escape hatch. 100% schema coverage both directions, enforced by a CI test (the Charter's export promise, mechanised). |
| **GeoPackage** (+ GeoJSON/KML) | Canonical 2D/spatial. QGIS-native, ESRI-readable. One geometry model across GL/Field/Maps. |
| **OMF v2** (Open Mining Format, GMG) | Canonical 3D: drillholes, surfaces, point sets, block models. Leapfrog, Datamine, Micromine, Vulcan and Seequent Evo all read OMF — it is the industry's agreed neutral 3D exchange and our bridge into every 3D package without writing their binaries. Join the GMG OMF community (cheap, credibility). |
| **DXF** | Universal CAD/3D fallback for anything that predates OMF adoption (strings, traces, wireframes) — every mining package reads DXF. |

### A3. Import matrix (read the world)

- **Tabular/legacy:** CSV, XLSX, MS Access (legacy juniors), fixed-width; **dialect profiles**
  for acQuire/GIM, DataShed, Geobank, MX Deposit CSV exports (the migration weapon — one-click
  "leave your incumbent" importers with validation flags on their dirty data).
- **Drilling/logging:** LAS 1.2/2.0/3.0 (wireline), collar/survey/interval CSV conventions,
  ioGAS CSV round-trip.
- **Spatial 2D:** GeoPackage, Shapefile, GeoJSON, KML/KMZ, GeoTIFF/COG, MBTiles/PMTiles,
  GeoPDF (PlanView already ingests), DXF.
- **3D:** OMF v1/v2; Surpac `.str`/`.dtm` (documented ASCII — read directly); Datamine `.dm`
  (binary — best-effort via established open readers, else require CSV/OMF export from
  Datamine side; be honest in docs about fidelity); Leapfrog via OMF or Central API (later).
- **Imagery:** JPG/PNG/HEIC/TIFF (+ RAW via conversion), EXIF preserved on originals always.
- **Explicit non-goals (for now):** ESRI geodatabase (.gdb) write, Vulcan/GOCAD binaries,
  proprietary geophysics (Oasis .grd is worth a reader later). Documented as decisions, not
  omissions (HP-28).

### A4. Export matrix (be read by the world)

Everything in A2 plus: Surpac-friendly collar/string CSV templates, Datamine-compatible CSV
templates, LAS for downhole data, PDF/HTML audit packs, Vitrine self-contained HTML, and
per-tool "recipe" docs (QGIS in 3 clicks; Leapfrog via OMF in 2). Rule: **every NEXUS product
page lists its formats publicly** — format transparency is a trust signal incumbents refuse
to give.

### A5. Engineering shape (Multiplier: one engine)

A single suite package — `@nexus/formats` — owns every reader/writer (thin adapters over
proven open libs: GDAL/OGR via bindings where heavy, `omf` Python/JS libs, custom light
parsers for Surpac ASCII). Products call it; scripts call it; the CLI exposes it
(`nexus convert in.str out.gpkg`). No product ever hand-rolls a parser (the drift rule again).
Each format ships with: a golden-file round-trip test, a fidelity note (what survives, what
doesn't), and a version stamp in the audit trail.

---

## PART B — Open source & free tiers: "Familiarity precedes purchase"

### B1. The doctrine (proposed principle for the registry)

> **PROPOSED HP: "Familiarity precedes purchase."** We give away trust-building layers so the
> paid step is small. Every free or open artefact must create a *path* to a paid product —
> a reader that renders our exports, a free tier that fills with data worth syncing, a spec
> others build against. Open where it builds trust; paid where value recurs. Never open the
> moat (domain rule content, semantic tuning, sync engine, fleet management).

This is textbook **product-led growth (PLG)** adapted to a solo-founder, high-trust niche:
the product itself is the salesperson, and openness is the trust mechanism a one-person
vendor needs more than any enterprise does.

### B2. The ladder (each rung feeds the next)

1. **Open standards participation** (free): OMF/GMG membership, published NEXUS schema.
   Buys: credibility, "plays well with others" proof.
2. **Open-source the boundary** (MIT): Vitrine viewer shell; `@nexus/formats` readers (read
   our files forever — the Continuity Charter made executable); TrayClip manifest spec;
   eventually a Python/R client SDK. Buys: developer trust, GitHub presence, SEO, and it
   makes escrow almost redundant for data access.
3. **Free tiers** (closed source, $0): FieldCam free (capture + open exports — every field
   geo in Australia can carry us for nothing); GeoLedger free (single hole/project, no sync);
   Academy intro course; university licences. Buys: habit, data gravity, word-of-mouth in a
   tiny industry where every geo moves companies every two years — **the person is the
   distribution channel**.
4. **Paid** (where value recurs): multi-user sync/relay, semantic search, QAQC monitoring,
   Handover generation at volume, support SLAs, TrayClip batch runs.
5. **Enterprise:** SSO, on-prem relay, audit support, escrow riders.

The viral mechanic to protect deliberately: **artefacts other people must open** — Vitrine
handovers in data rooms, FieldCam exports mailed to consultants — each carries a quiet
"Built with NEXUS" and *is* the demo. Free users creating artefacts paid prospects receive
is the loop; never paywall the *opening* of anything.

### B3. Guardrails

- Licence hygiene: MIT for boundary components; product EULA elsewhere; trademark enforced
  even on OSS (the mark, not the code, is the brand asset — 06 §3).
- One-way door awareness: open-sourcing is irreversible (HP-16 patience applies — each rung
  is a Paul gate, taken when the funnel above it exists to catch the interest).
- Measure it: free→paid conversion and artefact-open counts become scoreboard metrics at
  stage 8, so the doctrine is testable, not vibes.
- CRUCIBLE check per release: "does this free thing cannibalise a paid thing, or feed it?"

### B4. What this changes in existing plans (delta, small)

- Vitrine V4 (open-source shell): decision reframed from "maybe" to "yes at rung 2, after V1
  security pass" — pending Paul.
- FieldCam free tier confirmed as the suite's top-of-funnel (already in its doc §3).
- `@nexus/formats` added to the suite build queue (it is the enabler for rung 2 and Part A).
- Both PROPOSED principles above go to `PRINCIPLES_REGISTRY.md` for Paul's ratification —
  wording is drafted to sit beside "Continuity by Design" and the Multiplier Doctrine.
