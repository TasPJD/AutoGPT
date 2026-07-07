# HarLin Web Estate — Brand & Domain Architecture (2026-07-07)

Answering Paul's question: should HarLin Labs be a branch of the HarLin Consulting website,
and can we "mask origins" so NEXUS appears standalone while remaining part of HarLin?
Status 🟠 AWAITING CONFIRM.

## Recommendation: honest three-tier multi-brand (no masking)

```
harlin.com.au ............ HarLin Consulting (exists; credibility layer, consulting clients)
harlin.com.au/labs ....... HarLin Labs hub (portfolio + pipeline + "how we build")
<nexus domain> ........... NEXUS standalone product site (the funnel entry point)
```

**Do not cloak or mask origins.** Technically possible (separate WHOIS privacy, no cross-links,
distinct hosting) but: (a) search engines treat doorway/cloaked networks as spam — real SEO
risk; (b) procurement due-diligence at any exploration company runs an ABN/ASIC lookup in
minutes and finds HarLin Consulting anyway — discovered concealment reads as deceptive;
(c) it directly contradicts the Continuity Charter, whose entire pitch is "we answer the
who-stands-behind-this question in writing, before you ask."

**The honest version achieves exactly the goal.** Standard multi-brand practice (the
Atlassian/P&G pattern): the product gets its own domain, own design language, own funnel —
so NEXUS is never cluttered by Labs' other products — while a single quiet footer line,
*"A HarLin Labs product · Hobart, Tasmania"*, links up the chain. That line is not clutter;
it is the longevity answer working for us. Visitors who click it find a disciplined pipeline
page (credibility), not a garage sale.

## The psychology (what actually optimises conversion here)

1. **Focus signals commitment.** A junior's geo evaluating logging software wants to see a
   company that does *this one thing*. A standalone NEXUS site = perceived focus, even though
   the estate is broad. (Choice overload cuts conversion; one product, one CTA.)
2. **Depth beats breadth for trust.** The Labs hub shows the *pipeline discipline* (stages,
   red-teaming, kill-cheerfully) rather than shouting every product equally — breadth
   presented as engineering culture, not as a catalogue. That converts the "unfocused" risk
   into a strength: "these people build carefully."
3. **Two audiences, two doors.** Consulting clients enter at harlin.com.au (person-brand,
   experience); product buyers enter at NEXUS (product-brand, capability). Neither sees the
   other's clutter; both can find the other in one click, which reads as transparency.
4. **Enter the funnel at NEXUS level, not GeoLedger level.** Sell the platform story with
   GeoLedger as the flagship module (per SUITE_EXPANSION positioning). Product pages for
   modules live under the NEXUS site as sections/anchors, not separate domains.

## Domain notes (decision for Paul)

- Candidates: `nexusgeo.com.au` / `harlinnexus.com` / `nexus.harlin.com.au` (subdomain = free,
  weakest standalone signal but zero cost — fine for design-partner phase; buy the real
  domain before public launch). "Nexus" alone is unregistrable/crowded — this interacts with
  the trade-mark question already flagged in the IP doc (06 §3): the registered form may need
  to be "HarLin NEXUS", with "NEXUS" as the presented mark.
- Whatever is chosen, set canonical URLs + 301s once, before any backlinks accrue.

## What was built in this session (sandbox)

- `nexus.html` — the standalone NEXUS product site: particle drill-core hero (explodes into a
  strip-log data constellation and contracts back — click to toggle), page-as-drillhole scroll
  conceit with depth ruler, suite modules, live-typed semantic-search demo, Data Truth
  principles, Continuity Charter section, design-partner CTA. Dark-first, GL-teal identity,
  monospace instrument typography; both themes; reduced-motion respected; zero external
  dependencies (single file, procedural graphics — no image assets to license or load).
- `labs.html` — the HarLin Labs hub: pipeline framing (Flagship / NEXUS family / Beyond
  geoscience) with status dots per lifecycle stage, vision-statement stubs for nascent
  products (Reporter, Assay/QAQC, Academy, TrayClip, Discipline Lexicons, DriftGuard),
  "How we build" doctrine, quiet ambient pipeline animation.
- Deployment intent: `labs.html` content → harlin.com.au/labs (matching harlin.com.au's
  header/footer when integrated); `nexus.html` → the chosen NEXUS domain. Both are
  self-contained static files — host anywhere (Vodien per current practice).

## Not done / Paul's gates

Domain purchase + registered-mark form · final copy sign-off (all claims sourced from VISION
docs but pricing deliberately omitted pending Paul's pricing word — CTA is the design-partner
programme instead) · Barton named nowhere (case-study permission not yet obtained) ·
integration with the live harlin.com.au shell.
