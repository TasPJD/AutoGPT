# GeoLedger — IP Protection & Anti-Cloning (v0.7 track)

Goal: make GeoLedger hard to clone *commercially*, without betraying the local-first/longevity
promise (08). The two must be designed together — DRM that dies with the vendor would destroy
the Continuity Charter story.

## 1. Where the moat actually is (protect these hardest)

Ranked by real-world defensibility, most first:

1. **Data gravity + migration tooling.** A customer's years of logging in GeoLedger, plus the
   one-click DataShed/Excel/Geobank importers, are worth more than any code secret. Cloners can
   copy screens; they can't copy the customer's data history or your migration corpus.
2. **Domain-rule content.** Rock boards, GeoLexis lexicon, validation rule library, Data Truth
   cascade tuning — 30 years of geology encoded as *data*. Keep these as signed, licensed data
   packs (they also become per-commodity upsells — Multiplier Doctrine: engine vs content).
3. **The audit/lineage system.** Event trail + audit-pack export is a compliance asset cloners
   must re-earn with auditors and CPs.
4. **Server-side components.** Relay fleet management, licence issuance, (later) hosted
   semantic/pgvector — never shipped to the client at all. The natural anti-clone boundary.
5. **The code itself.** Weakest moat — treat obfuscation as a speed bump, not a wall.

## 2. Technical measures (proportionate, in order)

- **Compile + minify, don't ship JSX/source.** Vite production build already minifies the
  renderer; add `bytenode` (V8 bytecode) for main-process modules containing licence logic and
  the rule engine. Cheap, reverses casual copying.
- **ASAR with integrity** (`asarIntegrity` fuse), plus Electron fuses: disable
  `runAsNode`, `nodeCliInspect` (blocks trivially attaching a debugger to lift code).
- **Licence enforcement** (v0.7): Ed25519-signed licence files {org, seats, tier, expiry,
  fallback-clause}; offline verification (public key in binary), 30-day offline grace,
  activation server issues/renews (this is the one legitimate phone-home; design it
  fail-open per the fallback licence). Per-seat device binding hashed from stable hardware ids.
- **Feature gating server-side where honest:** semantic model upgrades, fleet dashboards,
  hosted relay — value that lives beyond the binary.
- **Watermarking:** licence id embedded in exports/audit packs (deters licence sharing, aids
  enforcement).
- Do **not**: heavy VM-based obfuscators (perf + false-positive AV), kernel anti-debug, or
  anything that breaks the perpetual-fallback promise.

## 3. Legal & structural

- **Copyright + contract does the heavy lifting:** EULA with no-reverse-engineering,
  no-benchmark-publication, seat definitions; signed by the org, not the operator.
- **Trade marks now, cheap:** "GeoLedger", "FieldCam", "NEXUS" (check class 9/42 conflicts —
  "Nexus" is crowded; the suite may need "HarLin NEXUS" as the registered form). AU first, then
  Madrid for CA/ZA/CL (mining jurisdictions).
- **Patents: generally no** — cost/benefit is poor for a solo founder; a provisional on the
  Data-Truth cross-card reconciliation method is the only candidate worth a one-hour paralegal
  opinion, and only if an acquirer conversation starts (acquirers pay for filed, not granted).
- **Escrow interplay:** escrow releases *to customers under trigger conditions* — it is not
  open-sourcing. The licence content of the escrowed code remains bound by the fallback licence
  terms. State this in the Charter so the two commitments reinforce rather than contradict.
- **Trade-secret hygiene:** the rule-content data packs and lexicon marked confidential;
  contractor NDAs template ready before the first hire (bus-factor plan in VISION §8 already
  anticipates this).

## 4. The open-core dial (decision for Paul, not urgent)

Option to open-source *the file format + a read-only exporter* (not the app): strengthens the
longevity pitch enormously ("your data is readable by public code forever"), costs almost no
moat (§1 — the moat isn't the reader). Recommend: revisit at first enterprise negotiation;
until then the published schema + CSV/GeoPackage export in the Charter covers the promise.
