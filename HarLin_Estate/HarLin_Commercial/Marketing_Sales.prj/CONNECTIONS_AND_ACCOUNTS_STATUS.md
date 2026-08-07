# Connections & Accounts — verified status (ground truth)

**Status:** ✅ VERIFIED by live probe — for the Revenue-Pipeline collaboration (Claude + Charlie) to review
**Prepared by:** HarLin Commercial engine (CCR session) · **Date:** 2026-07-30
**Provenance (HP-12 / Standing Rule #15):** every row below was confirmed by a live read-only call this session (identity/list endpoint) or the Alfred estate scan at 2026-07-30 10:25Z — not reconstructed from memory. Scope note: these are the connectors reachable **from this CCR/claude.ai session**; the **estate harness** (MCP Gateway) has its own wiring, called out separately in §3.

---

## 1. Correction to my earlier roadmap (Paul was right)

Three items I'd marked "missing" are, in fact, already in place. Corrected here:

| Earlier claim | Verified reality |
|---|---|
| "No outbound send channel" | **Wrong.** Two live email channels exist: **Microsoft 365 / Outlook** on the business domain (`pdale@harlin.com.au`) and **Gmail** (`pauldale.oz@gmail.com`). Outbound *capability* is present. What's genuinely missing is the *governed layer on top* — consent/unsubscribe compliance + human-gated send discipline. |
| "Billing/Stripe missing" | **Partly wrong.** **Xero invoicing is live** (entity connected), and a **Stripe merchant account exists** (proven by the `Stripe Fees` account in the Xero CoA). What's missing is the Stripe *MCP wiring* to this session + subscription-billing automation. |
| "Website lead-capture missing" | **Still true**, but with context: Vercel is connected (empty), and a **marketing content pipeline is already active in Google Drive** (`Marketing/`, `Digital Twins/` folders, created 27–28 Jul). |

---

## 2. Live connections (probed this session)

| Service | Account / identity | State | Commercial relevance |
|---|---|---|---|
| **Xero** | HarLin Consulting Pty Ltd (ACN/ABN 90 642 382 447), AU / AUD, FY 2026-07-01→2027-06-30 | 🟢 live | Money system of record; CoA reviewed; invoicing/receivables readable |
| **Microsoft 365** | `pdale@harlin.com.au` (display "HarLin", tenant on the business domain) | 🟢 live | **Business email/Outlook + SharePoint + Teams** — the professional outbound channel |
| **Gmail** | `pauldale.oz@gmail.com` (personal; has a `0_HarLin Consulting/*` label tree, 77 drafts) | 🟢 live | Secondary email channel; draft/send capable |
| **Google Calendar** | `pauldale.oz@gmail.com` + Family | 🟢 live | Meeting/booking scheduling |
| **Google Drive** | `pauldale.oz@gmail.com` — active `Marketing/` & `Digital Twins/` folders | 🟢 live | **Marketing asset production already underway** |
| **HarLin estate (HarLin_MCP)** | Alfred/AEOS harness; 258 entities catalogued; Pulse + PatternEngine live | 🟢 live | CRM store, System of Record, MCP Gateway |
| **Vercel** | Team "HarLin's projects" — **0 projects deployed** | 🟢 connected, empty | Ready for product/site deployment; nothing live yet |
| **GitHub** | `TasPJD` (this repo `taspjd/autogpt`, PR #4) | 🟢 live | Version-controlled estate mirror |
| **Hugging Face** | `TasPJD` | 🟢 live | Model/dataset infra (Geoscience AI) |
| **Quartr** | `pauldale.oz@gmail.com` — **free tier (no paid subscription)** | 🟢 live, unpaid | Public-company financial research |
| **Miro / Zoom** | connected | 🟢 live | Design boards / meetings |

## 3. Estate harness integrations (from the Alfred scan — distinct from this session's connectors)

- **MCP Gateway** live (the channel estate agents query the brain through); **CRM `crm_tools.register()` still NOT wired** — the standing on-machine blocker.
- **PAi web app** on Firebase (`harlin-api.web.app`) + **ElevenLabs briefings** flagged as "non-dispatch remote hop pending."
- **Cost/subscription telemetry:** metered spend **$1.46 MTD** (cap $50/mo); subscription burn **Claude 38%**, **ChatGPT/Codex + Gemini "unseeded"** (i.e. cross-platform actors present but not cost-seeded).
- **Estate health:** backup receipt exists for `D:\00_Backups\C_Drive\AI` but **restore-drill uncertified**; 737 AWAITING CONFIRM estate-wide; 51 projects with cascade gaps.

## 4. Accounts that exist but are NOT wired to this session

| Account | Evidence it exists | Gap |
|---|---|---|
| **Stripe** (merchant) | `Stripe Fees` account in the Xero CoA | MCP connector needs auth (claude.ai connector settings); no subscription-billing automation |
| **Zapier** | connector present | needs auth; integration inventory unknown until authorised |
| **Bank feed(s)** | Xero cash position / `Bank Revaluations` account | confirm live bank feeds are flowing into Xero (Xero-side check) |

## 5. Financial accounts (Xero Chart of Accounts) — snapshot

Reviewed in full in `HarLin_Admin.prj/SCHEDULE_OF_ACCOUNTS_PROPOSAL_2026-07.md`: **11 income accounts (client-named), 0 Cost-of-Sales, 61 expense accounts (legacy codes, single Marketing line)**, FY26. The proposal restructures this into a divisional + tracking model.

## 6. The parallel collaboration (synergy map)

The Alfred scan's **last session on record** is: *"Revenue Bridge — oriented on Revenue Bridge tag-team assignment from Charlie, verified ground truth against shared ledger protocol, and identified a hash binding mismatch in the [shared ledger]."* So the **Claude + Charlie revenue-pipeline collaboration is live and estate-integrated**, coordinating through the estate's **shared actor-comms / tag-team ledger** — and currently has a known **hash-binding mismatch** in that ledger to resolve.

**Join points between the two programs:**
- Their **Revenue Bridge** owns portfolio prioritisation and routes qualified opportunity → my **Commercial engine** owns CRM/campaign execution + the account architecture. (This boundary is already written into `DESIGN.md`.)
- Both should converge on **one shared ledger** as the coordination substrate (the hash-mismatch is the first thing to fix so the two programs read the same truth).
- The **Schedule of Accounts** + **Infrastructure Roadmap** (this branch) are the financial + build substrate their pipeline will run on.

---

## 7. What this changes in the roadmap

- **Wave 2 (outbound):** re-scope from "build a send channel" to "**build the governed/consent/unsubscribe layer over the M365 + Gmail channels that already exist**" — faster than assumed.
- **Wave 3 (billing):** Xero invoicing + a live Stripe account already exist → the task is **authorise Stripe MCP + automate**, not stand up billing from zero.
- **Wave 1 (inbound):** website lead-capture remains the real net-new build; marketing-asset production is already moving in Drive.

*Ready for the Claude + Charlie collaboration to review and steer.*
