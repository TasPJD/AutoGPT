# 12 — Default-with-Veto: draft amendment to the Tracking Protocol

> **Status:** DRAFT amendment for Paul's ratification (Decision **D3**). Ready to paste into `HarLin_OS/TRACKING_PROTOCOL.md` as a new section, and to add as a clause to Standing Rule #7. Solves the review's central operational finding: the confirmation ladder — built to protect an executive-function-limited founder — has become the estate's bottleneck (78 🟠 items; plans unconfirmed for weeks; every pipeline play gated on "Paul authorises").

## The problem in one line
The current protocol ships everything at `🟠 AWAITING CONFIRM` and only Paul can move it to `🟢 CONFIRMED`. That is correct for irreversible actions and wrong for reversible ones — it turns a safety brake into a queue that grows faster than it clears, in a system whose whole purpose is to *not* require Paul to remember things.

## The fix: two classes of shipped work

Introduce a **reversibility test** at ship time. Every shipped item is classified as one of:

### Class R — Reversible / in-doctrine → `🟢 PROCEEDING (veto window)`
Work that is easily undone and follows established doctrine ships as **"proceeding — will stand unless vetoed by [date]"**, with a default **72-hour** window. If Paul says nothing, it auto-confirms. No action = consent, because the action is cheap to reverse.

Examples: internal doc edits, refactors, new analysis, registry updates, dashboards, drafts, scaffolding, read-only tools, anything captured by Pulse and revertable by git.

### Class H — Hard gate → `🟠 AWAITING CONFIRM` (unchanged)
Work that is hard or impossible to undo, or crosses a risk line, **stays a hard gate** and waits for explicit `🟢`. No veto window; silence is *not* consent.

The hard-gate triggers (any one forces Class H):
- **Money** — spending, pricing, billing, financial commitments.
- **Publishing** — anything that leaves the estate (website, LinkedIn, client-facing, external AI surfaces, sending email).
- **Deletion / destruction** — removing data, killing a project, irreversible migrations.
- **Credentials / security** — anything touching secrets, auth, access.
- **Client data** — anything involving a live engagement's confidential material.
- **New commitments** — new .prj, new product family, new standing rule, new recurring cost.

## Draft text to insert

> ### Reversibility classes (adopted 2026-07-DD)
>
> Shipped work is classified by reversibility:
>
> **Class R (reversible, in-doctrine)** ships as `🟢 PROCEEDING` with a stated veto window (default 72h). It stands automatically when the window closes unless Paul vetoes. Rationale: for work that is cheap to undo and follows established doctrine, requiring an explicit confirmation adds a bottleneck without adding safety. Silence is consent.
>
> **Class H (hard gate)** ships as `🟠 AWAITING CONFIRM` and stands only on explicit `🟢 CONFIRMED`. Silence is *not* consent; the item waits. An item is Class H if it touches any of: money, publishing/external surfaces, deletion, credentials/security, client-confidential data, or a new standing commitment (new .prj / product / rule / recurring cost).
>
> When in doubt, an item is Class H. The classifier is stated at ship time ("Class R, veto by Fri" / "Class H — needs your explicit yes"). Class R items still appear in the weekly decision digest as an FYI so nothing is invisible; they simply don't block.

## How it composes with the rest of the estate
- **Standing Rule #7** gains: *"Reversible in-doctrine work ships Class R (proceeding, 72h veto); irreversible or risk-crossing work ships Class H (hard gate). See TRACKING_PROTOCOL reversibility classes."*
- **Alfred's briefing** already lists AWAITING-CONFIRM items — it should now show Class H (blocking) separately from Class R (veto window, with time remaining), so the "AWAITING YOUR WORD" section only contains things that genuinely await Paul.
- **The weekly decision digest** (PAi/Telegram, the S6-Phase-2 machinery) delivers the Class H list every Friday; Class R items appear as a "proceeded this week" FYI.
- **The Gate Register** (`06`) becomes the generated view that applies this classification automatically.

## Why this is safe
- It *narrows* nothing about irreversible actions — every genuinely risky thing still needs an explicit yes.
- It only changes the default for work that git + Pulse can revert in seconds.
- It makes the estate's own principle true: "if it requires Paul to remember, it has failed" — Class R stops requiring Paul to remember to approve reversible work.
- The 72h window is a parameter; start conservative (7 days) if you want, tighten as trust builds.

**Decision for Paul (D3):** adopt as drafted? Set the default veto window (72h recommended; 7 days if you want to ease in). Confirm the hard-gate trigger list is complete.
