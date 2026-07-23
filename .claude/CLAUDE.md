# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit conventions

- **NEVER** mark yourself as a co-author on commits. Do not add any `Co-Authored-By` trailer, and do not add any Claude/AI attribution line.
- **Commit title:** 6-7 words max.
- **Commit description:** 3-4 bullet points, 4-5 words each max.

## What this is

Nathan Shturm's personal portfolio site: static HTML/CSS output, no runtime framework and (almost) no JS on the rendered site — interactivity (mobile nav, photo viewer, phone-number reveal) is pure CSS (`:checked`/`:target` selectors, `<details>`). Two JS exceptions, both pure progressive enhancement: (1) a tiny inline script on generated photo album pages that adds arrow-key/Escape viewer navigation and routes all in-page `#photo-N` hops through `location.replace` so browsing photos never stacks browser history (Back always leaves the album page, not the previous photo) — without it, clicks/swipes still work; (2) `starred.js` (repo root, copied to `dist/` with a cache-bust hash like `style.css`), a localStorage star/favorites system: build-emitted `.star-btn` buttons on game/project cards, detail-page headings, and lightbox slides, plus a floating `.starred` quick-access button pinned bottom-right (markup in `src/partials/starred.html`), all `display:none` until the script tags `<html class="js">` — without JS the star UI simply doesn't exist. A starred item's own button disappears (no badge on the item); the item appears only in the floating list, which is also the only place to unstar it. The whole feature is gated behind the `STARRED_ENABLED` flag at the top of `build.js` — flip it to false and rebuild to deploy with zero trace of it (buttons, widget, script tag, and the `starred.js` copy all drop out). Don't add other JS.

Pages are **not** hand-written at the repo root anymore. They are authored in `src/` and assembled into flat, deployable HTML in `dist/` by a small zero-dependency Node script, `build.js`. This kills the old copy-pasted header/nav/footer and adds per-project / per-game detail sub-pages.

- **Build:** `node build.js` (or `npm run build`) → writes `dist/`. No other dependencies; `package.json` has no `dependencies`, only the `build` script.
- **Preview:** run the build, then open `dist/*.html` in a browser or serve `dist/` with any static file server.
- There is no lint or test command.

## How the build works (`build.js` + `src/`)

- **`src/layouts/base.html`** — the one HTML shell (doctype → head → nav → `<main>` → footer). Uses `{{> partial }}` includes and `{{ var }}` substitutions.
- **`src/partials/`** — `head.html`, `nav.html`, `footer.html`. Edit the nav/header/footer **here once** — it propagates to every page. (nav active state comes from each page's `active:` front-matter; the footer's About/Contact link is omitted when a page sets `footerSocial: false`, as About does.)
- **`src/pages/*.html`** — one file per page, containing only the `<main>` inner content plus a leading `<!-- key: value -->` front-matter block (`title`, `active`, optional `mainAttrs`, `footerSocial`). Data-driven regions are tokens the build fills: `{{gamesCards}}`, `{{projectsCards}}`, `{{gamesPreview}}`, `{{projectsPreview}}`.
- **`src/data/games.js` & `src/data/projects.js`** — the content for each game/project (title, media, blurb, tag color, links). These drive the listing cards, the home-page previews, AND the detail sub-pages.
- **`src/data/albums.js`** — photo albums (title, blurb, optional per-day sub-albums). The photos themselves are NOT listed there: each album is one flat folder `images/photos/<album>/` of `<prefix><NNN>-FULL.jpg` + `<prefix><NNN>-THUMB.jpg` pairs (e.g. `hakone004-FULL.jpg`; `<prefix>` = day slug, or the album's `prefix` field for day-less albums like `kenya001-…`). The build scans those and generates `photos-<slug>.html` (flat album grid + lightbox, or a trip page of day cards) and `photos-<slug>-<day>.html` per day. Albums/days with no photos on disk are skipped, so a photo-less clone still builds. Populate the folders with `scripts/ingest-photos.ps1` (ffmpeg-resizes curated exports from `F:\Photography\_PORTFOLIO`: FULL = 1920px lightbox image, THUMB = 640px grid image; slugs/prefixes there must match `albums.js`), and curate with `scripts/prune-photos.ps1` (delete either half of a pair, it removes the orphan).
- **Detail sub-pages:** any item with `detail: true` gets its own generated page (`game-<slug>.html` / `project-<slug>.html`) built from its `detailBody` HTML, and its card/preview link to it; `detail: false` items get no page and no link. **Only `duck-around` is enabled by default** — that's the reference example. To add a project/game page, edit the data entry: set `detail: true` and fill `detailBody` (free-form HTML: text, `<img>`, gifs, `.detail-block` / `.detail-gallery`).
- `style.css` and `images/` live at the repo root and are copied into `dist/` verbatim by the build. `dist/` and `node_modules/` are gitignored (build output, not committed).

## Repo layout

- **`src/` + `build.js` + `style.css`** — the source of the live site. **This is what future work should target** (never edit `dist/` by hand — it's regenerated).
- **`dist/`** — build output (gitignored). This is what gets deployed.
- **`docs/`** — planning docs written *during* the current redesign:
  - `REFRESH_PLAN.md` — running list of decided/undecided redesign choices. Not final; treat as a source of intent, not a spec, and update it as decisions are made in conversation.
  - `CURRENT_SITE.md` — a snapshot of the site *before* this redesign (the old multi-page design and the dark single-page design that was actually live on Hostinger at the time). Historical reference only — describes branch/layout state that has since been flattened into root.
  - `DEPLOY.md` — SSH/rsync deploy instructions for Hostinger (see Deployment below).
- **`archive/`** — two previous versions of the site, kept for reference only, not built or linked from the live site:
  - `archive/old-multipage/` — original blue/cream multi-page portfolio (photos/kenya/linktree pages).
  - `archive/live-single-page/` — the dark, game-dev-themed single-page design that was actually deployed to Hostinger before this redesign.
- **`scripts/deploy.sh`** — rsync deploy helper (see Deployment below).
- **`scripts/pull-images.sh`** — rsyncs the server's `images/` back down (additive, no `--delete`); recovers gitignored `images/photos/` on a fresh clone before deploying.
- **`images/`** — has three subfolders: `images/projects/` (per-project/game screenshot & primary assets, one folder per slug, e.g. `images/projects/quartermaster/`, `images/projects/duckaround/`), `images/photos/` (photography album assets — **gitignored** like `resume.pdf`: too large for git, they live locally and on the server only, and must be present locally when building/deploying), and `images/icons/` (UI/social icons plus site-level assets like `webicon.svg` favicon and `out_on_steam.png` badge). Nothing lives loose at the `images/` root.

## Site structure

Rendered pages (in `dist/`): `index.html` (home), `games.html`, `projects.html`, `design.html`, `photos.html`, `about.html`, plus one `game-<slug>.html` / `project-<slug>.html` per enabled detail item and the generated photo album pages (`photos-<slug>.html`, `photos-<slug>-<day>.html`). Each corresponds to a `src/pages/*.html` file (detail and album pages are generated from `src/data/`, not authored). Nav/header/footer are no longer repeated per page — they live in `src/partials/`.

- `index.html` is a landing page with a short preview grid for each section (Games/Projects/Design/Photos) linking out to that section's full page. The Games/Projects previews are generated from the first two entries in `src/data/`; the Photos preview reuses the same `{{photoAlbums}}` album rows as `photos.html`. Design/3D is still a blurred "coming soon" section and its nav link stays commented out in `src/partials/nav.html`.
- Photo album pages (grid + CSS-only lightbox) are fully generated — see `src/data/albums.js` above. Kenya 2022 is a flat album; Japan 2025 is a trip page of 17 per-day sub-albums; Europe 2026 is pending edited exports (sources are RAW-only so far).
- The mobile nav menu is a "checkbox hack": `<input type="checkbox" id="nav-toggle">` + a `<label for="nav-toggle" class="hamburger">` + `.nav-scrim`, all styled in `style.css`. No JS involved.
- The photo viewer on album pages is pure CSS: one persistent fixed overlay (`.viewer`) holds every photo as a slide in a horizontal scroll-snap strip. A thumbnail links to `#photo-N`; `:target` + `body:has()` shows the overlay and the browser scrolls the strip to that slide. Prev/next are anchor links to neighboring slides (wrapping at the ends) — they smooth-scroll the strip in place, no page navigation and no overlay re-mount; touch swiping works natively. Close links use `#_` (clears `:target` without scrolling the page). Closed, the viewer is `display:none` so its lazy `-FULL` images aren't fetched; open, the browser only loads slides near the scrollport. Thumbnails load `-THUMB` images, slides load `-FULL`, everything `loading="lazy"`.

## Styling conventions (`style.css`)

- Design tokens live in `:root` at the top (colors, fonts, container width, nav height, radii) — reuse these custom properties rather than hardcoding values.
- `.placeholder-media` + one of `.media-a` through `.media-e` are gradient placeholder blocks used wherever real imagery isn't in yet; a real `<img>` dropped inside a `.placeholder-media` container is styled to fill it (see the `.placeholder-media > img` rule). Several sections (Projects, Design/3D, Photos albums) are still using these placeholders rather than final assets.
- **Per-item tag colors:** `.tag-list li` reads `--tag-color` / `--tag-bg`. Named themes `.tag-red` / `.tag-violet` / `.tag-teal` / `.tag-orange` / `.tag-blue` set those; put one on a card/row (driven by the `tag:` field in `src/data/`) to recolor just that item's tags. No class → falls back to the red accent.
- **Detail sub-pages** use `.detail-section`, `.detail-hero`, `.detail-block` (text section), `.detail-gallery` (image/gif grid), `.detail-links`.
- Responsive breakpoints exist at `900px`, `760px`, and `600px` — check all three when changing layout-affecting CSS, since narrower breakpoints selectively hide/rearrange elements (e.g. album thumbnails).

## Deployment

Static site hosted on Hostinger shared hosting (domain `nathanshturm.com`), deployed via SSH/rsync — see `docs/DEPLOY.md` for full setup (SSH host alias, key location, gotchas).

- **Run `node build.js` first**, then deploy. `scripts/deploy.sh` has `SRC="dist"` — it rsyncs the freshly built `dist/` to `~/public_html` on the `hostinger` SSH host, with `--delete`, so it mirrors exactly (files not in `dist/` are removed on the server). Because the build only emits the site's own files into `dist/`, `docs/`, `archive/`, `src/`, etc. are naturally excluded.
- Deploy with `./scripts/deploy.sh --dry-run` first, then `./scripts/deploy.sh` to push for real.
- `resume.pdf` is linked from every page's nav but is **not committed to the repo** — drop it at the repo root before building and the build copies it into `dist/` (it's gitignored); it must be present for that nav link to resolve on the live site.
