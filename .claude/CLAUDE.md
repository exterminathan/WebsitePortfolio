# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit conventions

- **NEVER** mark yourself as a co-author on commits. Do not add any `Co-Authored-By` trailer, and do not add any Claude/AI attribution line.
- **Commit title:** 6-7 words max.
- **Commit description:** 3-4 bullet points, 4-5 words each max.

## What this is

Nathan Shturm's personal portfolio site: static HTML/CSS, no framework, no build step, no bundler, no package.json. Every page is a hand-written `.html` file at the repo root sharing one stylesheet, `style.css`. There is no JS on the current site — interactivity (mobile nav, photo lightbox, phone-number reveal) is done with pure CSS (`:checked`/`:target` selectors, `<details>`).

Edit HTML/CSS directly and preview with any static file server or by opening the file in a browser — there is no dev server, lint, build, or test command in this repo.

## Repo layout

- **Root `*.html` + `style.css`** — the live/current site. This is what future work should target.
- **`docs/`** — planning docs written *during* the current redesign:
  - `REFRESH_PLAN.md` — running list of decided/undecided redesign choices. Not final; treat as a source of intent, not a spec, and update it as decisions are made in conversation.
  - `CURRENT_SITE.md` — a snapshot of the site *before* this redesign (the old multi-page design and the dark single-page design that was actually live on Hostinger at the time). Historical reference only — describes branch/layout state that has since been flattened into root.
  - `DEPLOY.md` — SSH/rsync deploy instructions for Hostinger (see Deployment below).
- **`archive/`** — two previous versions of the site, kept for reference only, not built or linked from the live site:
  - `archive/old-multipage/` — original blue/cream multi-page portfolio (photos/kenya/linktree pages).
  - `archive/live-single-page/` — the dark, game-dev-themed single-page design that was actually deployed to Hostinger before this redesign.
- **`scripts/deploy.sh`** — rsync deploy helper (see Deployment below).
- **`images/`** — real project/screenshot assets, organized per-project (`images/quartermaster/`, `images/duckaround/`, `images/icons/`).

## Site structure

Pages: `index.html` (home), `games.html`, `projects.html`, `design.html`, `photos.html`, `photos-album.html`, `about.html`. Every page repeats the same header/nav markup verbatim (no templating layer) — when changing nav structure, links, or the mobile-menu markup, update it identically across **every** HTML file. The current page's nav link carries `class="active"`.

- `index.html` is a landing page with a short preview grid for each section (Games/Projects/Design/Photos) linking out to that section's full page.
- `photos-album.html` is a **template**, standing in for however many photo albums exist — each real album is meant to be a copy of this file with its own title/photo set and its own CSS-only lightbox block (see the comment at the top of that file).
- The mobile nav menu is a "checkbox hack": `<input type="checkbox" id="nav-toggle">` + a `<label for="nav-toggle" class="hamburger">` + `.nav-scrim`, all styled in `style.css`. No JS involved.
- The photo lightbox on `photos-album.html` is pure CSS `:target` navigation — each thumbnail links to `#photo-N`, and prev/next links point to neighboring anchor IDs, wrapping at the ends.

## Styling conventions (`style.css`)

- Design tokens live in `:root` at the top (colors, fonts, container width, nav height, radii) — reuse these custom properties rather than hardcoding values.
- `.placeholder-media` + one of `.media-a` through `.media-e` are gradient placeholder blocks used wherever real imagery isn't in yet; a real `<img>` dropped inside a `.placeholder-media` container is styled to fill it (see the `.placeholder-media > img` rule). Several sections (Projects, Design/3D, Photos albums) are still using these placeholders rather than final assets.
- Responsive breakpoints exist at `900px`, `760px`, and `600px` — check all three when changing layout-affecting CSS, since narrower breakpoints selectively hide/rearrange elements (e.g. album thumbnails).

## Deployment

Static site hosted on Hostinger shared hosting (domain `nathanshturm.com`), deployed via SSH/rsync — see `docs/DEPLOY.md` for full setup (SSH host alias, key location, gotchas).

- Deploy with `./scripts/deploy.sh --dry-run` first, then `./scripts/deploy.sh` to push for real. It rsyncs `SRC` (currently a placeholder value, `dist`) to `~/public_html` on the `hostinger` SSH host, with `--delete`, so it mirrors exactly — files removed locally are removed on the server.
- **Before deploying**, update `SRC` at the top of `scripts/deploy.sh` to point at the flat, deploy-ready site — since the repo root is now already flat (matches the server's expected layout), that likely just means setting `SRC="."`, but confirm nothing in root shouldn't be shipped (e.g. `docs/`, `archive/`, `scripts/`) before doing so, since rsync with `--delete` will remove anything on the server not present in `SRC`.
- `resume.pdf` is linked from every page's nav but is **not committed to the repo** — it must be present in the deploy source directory for that link to resolve on the live site.
