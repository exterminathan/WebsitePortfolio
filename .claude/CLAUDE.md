# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit conventions

- **NEVER** mark yourself as a co-author on commits. Do not add any `Co-Authored-By` trailer, and do not add any Claude/AI attribution line.
- **Commit title:** 6-7 words max.
- **Commit description:** 3-4 bullet points, 4-5 words each max.

## What this is

Nathan Shturm's personal portfolio site: static HTML/CSS output, no runtime framework and no JS on the rendered site — interactivity (mobile nav, photo lightbox, phone-number reveal) is pure CSS (`:checked`/`:target` selectors, `<details>`).

Pages are **not** hand-written at the repo root anymore. They are authored in `src/` and assembled into flat, deployable HTML in `dist/` by a small zero-dependency Node script, `build.js`. This kills the old copy-pasted header/nav/footer and adds per-project / per-game detail sub-pages.

- **Build:** `node build.js` (or `npm run build`) → writes `dist/`. No other dependencies; `package.json` has no `dependencies`, only the `build` script.
- **Preview:** run the build, then open `dist/*.html` in a browser or serve `dist/` with any static file server.
- There is no lint or test command.

## How the build works (`build.js` + `src/`)

- **`src/layouts/base.html`** — the one HTML shell (doctype → head → nav → `<main>` → footer). Uses `{{> partial }}` includes and `{{ var }}` substitutions.
- **`src/partials/`** — `head.html`, `nav.html`, `footer.html`. Edit the nav/header/footer **here once** — it propagates to every page. (nav active state comes from each page's `active:` front-matter; the footer's About/Contact link is omitted when a page sets `footerSocial: false`, as About does.)
- **`src/pages/*.html`** — one file per page, containing only the `<main>` inner content plus a leading `<!-- key: value -->` front-matter block (`title`, `active`, optional `mainAttrs`, `footerSocial`). Data-driven regions are tokens the build fills: `{{gamesCards}}`, `{{projectsCards}}`, `{{gamesPreview}}`, `{{projectsPreview}}`.
- **`src/data/games.js` & `src/data/projects.js`** — the content for each game/project (title, media, blurb, tag color, links). These drive the listing cards, the home-page previews, AND the detail sub-pages.
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
- **`images/`** — has three subfolders: `images/projects/` (per-project/game screenshot & primary assets, one folder per slug, e.g. `images/projects/quartermaster/`, `images/projects/duckaround/`), `images/photos/` (photography album assets), and `images/icons/` (UI/social icons plus site-level assets like `webicon.svg` favicon and `out_on_steam.png` badge). Nothing lives loose at the `images/` root.

## Site structure

Rendered pages (in `dist/`): `index.html` (home), `games.html`, `projects.html`, `design.html`, `photos.html`, `photos-album.html`, `about.html`, plus one `game-<slug>.html` / `project-<slug>.html` per enabled detail item. Each corresponds to a `src/pages/*.html` file (detail pages are generated from `src/data/`, not authored). Nav/header/footer are no longer repeated per page — they live in `src/partials/`.

- `index.html` is a landing page with a short preview grid for each section (Games/Projects/Design/Photos) linking out to that section's full page. The Games/Projects previews are generated from the first two entries in `src/data/`.
- `src/pages/photos-album.html` is a **template**, standing in for however many photo albums exist — each real album is meant to be a copy of this file with its own title/photo set and its own CSS-only lightbox block.
- The mobile nav menu is a "checkbox hack": `<input type="checkbox" id="nav-toggle">` + a `<label for="nav-toggle" class="hamburger">` + `.nav-scrim`, all styled in `style.css`. No JS involved.
- The photo lightbox on `photos-album.html` is pure CSS `:target` navigation — each thumbnail links to `#photo-N`, and prev/next links point to neighboring anchor IDs, wrapping at the ends.

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
