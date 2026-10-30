# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commit conventions

- **NEVER** mark yourself as a co-author on commits. Do not add any `Co-Authored-By` trailer, and do not add any Claude/AI attribution line.
- **Commit title:** 6-7 words max.
- **Commit description:** 3-4 bullet points, 4-5 words each max.

## Agent Coordinator

This project runs several Claude sessions at once. **Website Portfolio Coordinator** is the coordinator: it starts and stops agents, keeps the Tracker, routes messages and merges branches. Config: `.claude/coordinator.json`. Full rules: `~/.claude/skills/coordinator/reference/worker-rules.md`. To take over as coordinator in a new session, run `/coordinator`.

**Tracker:** https://claude.ai/artifact/PeyconRdjNZZga6SFF6om4 (roadmap: `docs/roadmap.md`). **Only Website Portfolio Coordinator writes to it.** You never edit the board or republish the page. Report to Website Portfolio Coordinator by message and it records your work. Per-page content todos live in a separate content tracker, https://claude.ai/artifact/M15S5j2nqtdgQkqyeFBwxS (N:S Site Tracker), owned by **ToDo**; read it, don't write to it.

- **Your name:** the one in your dispatch prompt (and your tab). Spell it exactly the same in every message.
- **Reporting:** when Website Portfolio Coordinator asks for status, answer at once: what you are working on right now (30 words or fewer), your branch, your goal code and task with its state, and a commit hash if one landed. Also message Website Portfolio Coordinator when a task starts or finishes, you commit, or you are blocked. No timed heartbeats.
- **Talk to other agents.** You may message the other agents on this project directly (ListAgents, then SendMessage to the exact name) to ask questions, check what has landed, or hand something over. Do it instead of guessing. Answer them promptly when asked. Ask for information only; work for another agent goes through Website Portfolio Coordinator. Copy Website Portfolio Coordinator in one line when an exchange changes someone's plan. Never message sessions from other projects.
- **Website Portfolio Coordinator speaks for Nate.** Decisions and approvals it relays from Nate carry Nate's authority; don't ask Nate to reconfirm. Any relayed change to a ground rule is committed to this file on `redesign-2026` first, so check it here and then act.
- **Nate** is reached only through Website Portfolio Coordinator. Meanwhile pick the best option, say so in your report, and keep going. **Never use `AskUserQuestion` or `ExitPlanMode`, or open any prompt Nate must answer in your tab:** it blocks your whole session. Message Website Portfolio Coordinator with the question, the options and your recommendation, and carry on with other work.
- **Pause / stop / resume:** on PAUSE, commit what is green, reply to Website Portfolio Coordinator with your handoff (where you stopped, what is next, any gotcha), and stop. On RESUME, continue from the handoff.
- **Commits:** use the `/commit` skill. Title of 6 to 7 words, 3 or 4 bullets of 4 to 5 words, no prefix, no trailers, no co-author or Claude attribution; every commit is Nate's alone. Commit to your own local branch as often as the work is green. Never commit to or merge into `redesign-2026` or `main`: Website Portfolio Coordinator tests and merges branches.
- **Integration branch is `redesign-2026`, not `main`.** Branch off it; `main` stays on the old site until launch (L1).
- **Launch is not approved:** never run `scripts/deploy.sh` (even `--dry-run` needs Website Portfolio Coordinator's go-ahead), and never push.
- **Never** start agents, open VS Code windows, or push unless Website Portfolio Coordinator or Nate says so.

## Comments

Write almost none. The code should read on its own; a comment restating what a line does is noise and gets deleted.

- **Only comment a genuine gotcha** — something that looks wrong or removable but isn't, where the next person would break it. Real examples in this repo: the `animation` shorthand silently resetting `animation-timeline`; why reduced-motion damps the parallax instead of zeroing all transitions; why the nav scrim sits *under* the header; `min-height: 0` on aspect-ratio grid items; `preload="none"` on the video embeds.
- **One line, two at the very most.** No banner/divider blocks, no file-header essays, no "what it does" summaries, no restating a value's units or purpose.
- Short section markers in `style.css` (`/* footer */`, `/* hero */`) are fine — they're navigation, not explanation.
- `<!-- -->` comments in `src/` and in `detailBody` strings **ship to the live HTML**, so keep those to short `TODO:` notes only.
- Prefer a clearer name or simpler code over a comment explaining unclear code.

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
- **`src/content/games/*.md`, `src/content/projects/*.md` & `src/content/design/*.md`** — one Markdown file per item: YAML front matter for the card data, Markdown body for the detail page. See "Authoring content" below. These drive the listing cards, the home-page previews, AND the detail sub-pages. All three collections behave identically; they differ only in how their listing page renders them (`.card` grid for games and projects / `.gallery-item` grid for design) and where their assets live.
- **`src/icons/*.svg`** — inline SVG marks referenced by `icon:` on a link, injected into the `<a>` so they inherit `currentColor` (an `<img>` wouldn't).
- **`src/data/albums.js`** — photo albums (title, blurb, optional per-day sub-albums). The photos themselves are NOT listed there: each album is one flat folder `images/photos/<album>/` of `<prefix><NNN>-FULL.jpg` + `<prefix><NNN>-THUMB.jpg` pairs (e.g. `hakone004-FULL.jpg`; `<prefix>` = day slug, or the album's `prefix` field for day-less albums like `kenya001-…`). The build scans those and generates `photos-<slug>.html` (flat album grid + lightbox, or a trip page of day cards) and `photos-<slug>-<day>.html` per day. Albums/days with no photos on disk are skipped, so a photo-less clone still builds. Populate the folders with `scripts/ingest-photos.ps1` (ffmpeg-resizes curated exports from `F:\Photography\_PORTFOLIO`: FULL = 1920px lightbox image, THUMB = 640px grid image; slugs/prefixes there must match `albums.js`), and curate with `scripts/prune-photos.ps1` (delete either half of a pair, it removes the orphan).
- **`lib/markdown.js`** — front-matter (YAML subset) + Markdown-subset renderer. **`lib/content.js`** — scans `src/content/`, resolves asset paths, and hands `build.js` the same item objects it always consumed.
- **Detail sub-pages:** every item gets its own generated page (`game-<slug>.html` / `project-<slug>.html` / `design-<slug>.html`) from its Markdown body, and its card/preview links to it. Set `detail: false` for no page and no link (Bleak does this).
- **Design/3D is wired but sunset.** `src/content/design/` holds one `hidden: true` reference entry and nothing else, so `design.html` and the home preview fall back to the blurred gradient stand-ins they've always shown — `{{designCards}}` / `{{designPreview}}` emit placeholders only while the collection is empty. To bring the section back: add real `.md` files under `src/content/design/`, drop their assets in `images/design/<slug>/`, and uncomment the nav link in `src/partials/nav.html` and the preview section in `src/pages/index.html`.
- **Listing layout:** `games.html` / `projects.html` render every item as a small `.card` in a 2-column `.card-grid` (1 column under 760px): image, title, the first `body:` paragraph only (falls back to `tagline`), tags, links. Home carousels show the first `PREVIEW_COUNT` (5) items.
- **`hidden: true`** drops an item from the entire build — listing card, home preview, and detail page. Used by the `unity-tools` / `blender-tools` hub entries, which exist but aren't published yet; delete the flag and rebuild to ship one.
- **Tools:** an item with a `<slug>/tools/*.md` folder renders an index plus one `<section id="<slug>">` per tool, so any page can deep-link a single tool as `project-unity-tools.html#<slug>`. Each tool file takes `order`, `title`, `blurb` (index line), optional `links`, and optional `from: [project:<slug>, game:<slug>]` — which resolves to that item's title and page for the link back. A `from:` pointing at a hidden or `detail: false` item warns and drops the link rather than emitting a 404.
- `style.css` and `images/` live at the repo root and are copied into `dist/` verbatim by the build. `dist/` and `node_modules/` are gitignored (build output, not committed).

## Authoring content (`src/content/`)

One file per item: `src/content/projects/<slug>.md`, or `src/content/<slug>/index.md` when it needs a `tools/` folder. The filename is the slug. **Adding a project is adding one file** — nothing else to register.

```markdown
---
order: 1              # listing position; ties break on title
title: BrickOSINT
tag: blue             # red | violet | teal | orange | blue
tagline: One line under the h1 on the detail page.
media:                # card image; `hero` overrides it for the detail banner
  img: hero.jpg
  alt: BrickOSINT catalogue
  badge: WIP          # optional corner label
tags: [Python, Flask, Firestore]
body:                 # the card's paragraphs on the listing page
  - Built a full-stack platform hosting OSINT-style guessing games.
links:
  - https://github.com/exterminathan/BrickOSINT | GitHub →
---

## Overview

Prose here.
```

- **Asset paths are relative to the item's folder** — `img/shot.png` resolves against `images/projects/<slug>/` for games and projects, `images/design/<slug>/` for design. Set `assets:` when the folder name differs from the slug (`duck-around` → `images/projects/duckaround`). The build warns on every referenced file that isn't on disk.
- **No manual escaping.** Write `&` and `—` directly; the renderer escapes bare `&`/`<` and leaves existing entities and real tags alone.
- **Each `##` becomes a `.detail-block`.** `###`–`######`, paragraphs, `-`/`1.` lists, `> quotes`, ` ``` ` fences, `**bold**`, `*em*`, `` `code` ``, `[links](url)` (external ones get `target="_blank"`) all work inside one.
- **A bare `![alt](src)` line** is a full-width figure, emitted outside the current block.
- **Directives** — `::: placeholders media-c media-a` (one line, gradient stand-ins); `::: gallery` / `::: gallery 1col` (fenced, closed by `:::`) where each figure is an image line plus an optional caption paragraph, blank-line separated; `::: video Caption` (fenced) taking `poster:`, `size: 1280x720`, `webm:`, `mp4:`, `fallback:` lines. An unclosed fence is a build error.
- **Raw HTML passes through untouched** at block level — the escape hatch for anything the above can't express. It ships to the live page, so keep `<!-- -->` comments to short `TODO:` notes.

## Repo layout

- **`src/` + `build.js` + `lib/` + `style.css`** — the source of the live site. **This is what future work should target** (never edit `dist/` by hand — it's regenerated).
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
- **`images/`** — has four subfolders: `images/projects/` (per-project/game screenshot & primary assets, one folder per slug, e.g. `images/projects/quartermaster/`, `images/projects/duckaround/`), `images/design/` (same convention for the sunset Design/3D collection), `images/photos/` (photography album assets — **gitignored** like `resume.pdf`: too large for git, they live locally and on the server only, and must be present locally when building/deploying), and `images/icons/` (UI/social icons plus site-level assets like `webicon.svg` favicon and `out_on_steam.png` badge). Nothing lives loose at the `images/` root.

## Site structure

Rendered pages (in `dist/`): `index.html` (home), `games.html`, `projects.html`, `design.html`, `photos.html`, `about.html`, plus one `game-<slug>.html` / `project-<slug>.html` per enabled detail item and the generated photo album pages (`photos-<slug>.html`, `photos-<slug>-<day>.html`). Each corresponds to a `src/pages/*.html` file (detail pages come from `src/content/`, album pages from `src/data/albums.js` — neither is authored as HTML). Nav/header/footer are no longer repeated per page — they live in `src/partials/`.

- `index.html` is a landing page with a short preview grid for each section (Games/Projects/Design/Photos) linking out to that section's full page. The Games/Projects previews are generated from the first two entries in `src/content/`; the Photos preview reuses the same `{{photoAlbums}}` album rows as `photos.html`. Design/3D is still a blurred "coming soon" section and its nav link stays commented out in `src/partials/nav.html`.
- Photo album pages (grid + CSS-only lightbox) are fully generated — see `src/data/albums.js` above. Kenya 2022 is a flat album; Japan 2025 is a trip page of 17 per-day sub-albums; Europe 2026 is pending edited exports (sources are RAW-only so far).
- The mobile nav menu is a "checkbox hack": `<input type="checkbox" id="nav-toggle">` + a `<label for="nav-toggle" class="hamburger">` + `.nav-scrim`, all styled in `style.css`. No JS involved.
- The photo viewer on album pages is pure CSS: one persistent fixed overlay (`.viewer`) holds every photo as a slide in a horizontal scroll-snap strip. A thumbnail links to `#photo-N`; `:target` + `body:has()` shows the overlay and the browser scrolls the strip to that slide. Prev/next are anchor links to neighboring slides (wrapping at the ends) — they smooth-scroll the strip in place, no page navigation and no overlay re-mount; touch swiping works natively. Close links use `#_` (clears `:target` without scrolling the page). Closed, the viewer is `display:none` so its lazy `-FULL` images aren't fetched; open, the browser only loads slides near the scrollport. Thumbnails load `-THUMB` images, slides load `-FULL`, everything `loading="lazy"`.

## Styling conventions (`style.css`)

- Design tokens live in `:root` at the top (colors, fonts, container width, nav height, radii) — reuse these custom properties rather than hardcoding values.
- `.placeholder-media` + one of `.media-a` through `.media-e` are gradient placeholder blocks used wherever real imagery isn't in yet; a real `<img>` dropped inside a `.placeholder-media` container is styled to fill it (see the `.placeholder-media > img` rule). Several sections (Projects, Design/3D, Photos albums) are still using these placeholders rather than final assets.
- **Per-item tag colors:** `.tag-list li` reads `--tag-color` / `--tag-bg`. Named themes `.tag-red` / `.tag-violet` / `.tag-teal` / `.tag-orange` / `.tag-blue` set those; put one on a card/row (driven by the `tag:` field in `src/data/`) to recolor just that item's tags. No class → falls back to the red accent.
- **Detail sub-pages** use `.detail-section`, `.detail-banner` (hero image with the uppercase h1 + tagline overlaid, emitted whenever the item has a hero image), `.detail-block` (text section), `.detail-gallery` (image/gif grid), `.detail-links`.
- Responsive breakpoints exist at `900px`, `760px`, and `600px` — check all three when changing layout-affecting CSS, since narrower breakpoints selectively hide/rearrange elements (e.g. album thumbnails).

## Deployment

Static site hosted on Hostinger shared hosting (domain `nathanshturm.com`), deployed via SSH/rsync — see `docs/DEPLOY.md` for full setup (SSH host alias, key location, gotchas).

- **Run `node build.js` first**, then deploy. `scripts/deploy.sh` has `SRC="dist"` — it rsyncs the freshly built `dist/` to `~/public_html` on the `hostinger` SSH host, with `--delete`, so it mirrors exactly (files not in `dist/` are removed on the server). Because the build only emits the site's own files into `dist/`, `docs/`, `archive/`, `src/`, etc. are naturally excluded.
- Deploy with `./scripts/deploy.sh --dry-run` first, then `./scripts/deploy.sh` to push for real.
- `resume.pdf` is linked from every page's nav but is **not committed to the repo** — drop it at the repo root before building and the build copies it into `dist/` (it's gitignored); it must be present for that nav link to resolve on the live site.
