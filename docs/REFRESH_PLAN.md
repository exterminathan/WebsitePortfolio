# Refresh Plan

Running list of changes for the full site refresh. Built up over conversation —
not final until we say so. See `docs/CURRENT_SITE.md` for the current-state
reference this is based on.

## Decided

- **Remove the light/dark theme switch.** The current live site's toggle goes away.
- **Every section gets its own header/nav entry** (Games, Products, Graphic Design/3D,
  Photos, About Me — one nav link each, no nesting).
- **Photos:** manual export from Google Drive into the repo (see below), no live
  embedding or sync automation.
- **Design inspiration references:**
  - [brittanychiang.com](https://brittanychiang.com/) — single-page with anchored
    nav sections (#about/#experience/#projects/#writing). Dark, minimal, high
    contrast, Inter typeface. Skill tags under each project/job. Generous
    whitespace. Nav = name/logo + section anchors + social icons.
  - [joshwcomeau.com](https://www.joshwcomeau.com/) — content-card layout, sparse
    top nav (logo + few top-level links), strong typographic hierarchy over color
    blocking, lots of breathing room between cards, playful personality touches
    (emoji, animated details) without clutter.
  - Takeaway to riff on: minimal top nav + generous whitespace + hierarchy via
    type/size rather than heavy chrome; anchored single-page sectioning is worth
    considering given the new multi-section IA below.

- **Mobile standardization (2026-07-22).** The site is responsive down to 320px
  with the same design language as desktop. Decisions made:
  - Album titles (Photos page + home) are hover-revealed on desktop, but pinned
    to a bottom-left gradient label on touch devices (`@media (hover: none)`).
  - The lightbox's invisible tap-around-the-photo close area is disabled on
    touch — only the ✕ (44px) closes, so swipes can't accidentally exit.
  - Nav bar drops from 72px to 64px on ≤760px screens (via the `--nav-height`
    token); horizontal gutters unified behind a `--gutter` token.
  - Still zero JS: scroll lock behind the open drawer and all touch behavior is
    pure CSS (`:has()`, `hover: none`).

## Under discussion

- **Site sections/IA** — split the portfolio into distinct sections instead of
  one flat page, since the amount of work Nathan does has expanded beyond just
  game dev. Candidate sections:
  - **Games** — projects where he's working as a game designer (e.g. Quartermaster,
    Duck Around).
  - **Products (name TBD)** — non-game projects that are still good portfolio
    pieces. "Products" is a placeholder name, not settled.
  - **Graphic Design / 3D (shape TBD)** — a section for graphic design / 3D work;
    scope and name still undecided.
  - **Photos** — photography. Source photos live in Nathan's Google Drive, kept
    private (not shared out). Decided: manual export — pick photos, copy into the
    repo's `images`/`photos` folder, commit, deploy. Same pattern as the old
    Kenya gallery. No live Drive embedding, no sync-script automation.
  - **About Me** — short bio + contact info.

## Out of scope / explicitly rejected

- (none yet)
</content>
