# Refresh Plan

Running list of changes for the full site refresh. Built up over conversation —
not final until we say so. See `docs/CURRENT_SITE.md` for the current-state
reference this is based on.

## Decided

- **Remove the light/dark theme switch.** The current live site's toggle goes away.
- **Every section gets its own header/nav entry**, one link each, no nesting. The
  sections are Games, Projects, Photos and About (Design/3D is sunset, below). The
  "Products" placeholder name became **Projects**.
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

- **Site sections/IA (settled).** The portfolio is split into distinct sections
  instead of one flat page, since the work has expanded beyond game dev:
  - **Games** — projects where he's working as a game designer (Quartermaster,
    Duck Around, Bleak).
  - **Projects** — non-game projects that are still good portfolio pieces.
  - **Design/3D — sunset.** The section is still wired up in the build but has no
    real entries, so its nav link stays commented out and the page and home preview
    show blurred "coming soon" stand-ins. Real work can bring it back later.
  - **Photos** — photography. Source photos live in Nathan's Google Drive, kept
    private (not shared out). Manual export: pick photos, run the ingest script into
    `images/photos/`, deploy. No live Drive embedding, no sync automation. The photos
    themselves stay out of git.
  - **About** — short bio + contact info.
- **Hosting moves to Firebase (2026-10).** Firebase Hosting replaces Hostinger. The
  domain is at Namecheap, and a holding page is live until launch. See
  `docs/DEPLOY.md`. Launch itself is not approved yet.
- **Block, Tile and Island become three Games entries.** Each gets a banner linking
  to its live site (block., tile. and islands.innate.games). The BlockGameOnline
  entry goes away, and Island moves out of Projects.
- **Five new project entries**: WindowsVoiceControl, VSTBuddy/DAWdler, VoxMidi,
  ColorPalettes and LightweightTaskbarGroups. Pitches are drafted by an agent for
  Nate to fix later. Skipped: RemoteDesktopViewer, VSTDecomper, LegoBuildSuggestions.

## Under discussion

- (nothing open)

## Out of scope / explicitly rejected

- (none yet)
