# Current Site — Snapshot (pre-refresh)

Documents the site **as it exists today**, before the full refresh. Reference for
what's being replaced, not a spec for what comes next.

## ⚠️ Two versions exist — mind which branch you're on

There are **two completely different designs** in this repo, on different branches:

| Branch | Design | Matches live? |
|---|---|---|
| `main` | Old blue/cream multi-page portfolio (photos/kenya/linktree) | ❌ no |
| `portfolio-redesign` | Dark game-dev single page (Quartermaster) | ✅ **yes** (this is what's live) |

**The live site = the `portfolio-redesign` branch**, and the redesign (including all
images) is safely committed there. The `main` branch is the *old* design.

The live site differs from `portfolio-redesign` in only two ways:

1. **Asset paths** — the branch nests files under `pages/index/`, so it references
   `../../images/…`. The live site is flattened into `public_html/`, so it uses
   `images/…`. Structural, expected.
2. **One uncommitted live edit** — the Quartermaster `<h2>` on the live site was
   wrapped in a **Steam store link**
   (`store.steampowered.com/app/3673980/Quartermaster/`) directly on the server.
   This change exists **only on the live server**, not in any branch. The `index.css`
   and `index.js` are otherwise byte-identical between branch and live.

**Recommended first moves:**
- Fold the Steam-link edit back into `portfolio-redesign` (or the refresh branch)
  so nothing lives only on the server.
- Decide whether the refresh continues from `portfolio-redesign` (likely) and
  whether `main` should be reset to it / the old design archived in a tag.
- Flatten the repo layout to match deploy (drop `pages/index/` nesting → root),
  which also fixes the `../../images/` vs `images/` path mismatch permanently.

## Stack

- Pure **static HTML / CSS / JS**. No framework, no build step, no bundler.
- Hosted on **Hostinger** shared hosting. Domain: **nathanshturm.com**.
- Web root: `~/public_html` → symlink to `domains/nathanshturm.com/public_html`.

---

## The LIVE site (what's actually deployed)

A single-page **game-developer portfolio**. Files in `public_html/`:

```
index.html          index.css          index.js
resume.pdf
images/
  quartermaster/    qm_primary.png, qm_screenshot_1..7.png
  duckaround/       da_primary.png, da_screenshot_1..2.png
  icons/            github.png, linkedin.png, artstation.png, phone.png
  out_on_steam.png
```

### Layout

- **Header:** "Nathan Shturm — Game Developer", LinkedIn + Resume links, and a
  🌙/☀️ **dark/light theme toggle** (a checkbox styled as a sliding switch).
- **Main project (Quartermaster):** hero image with a hover overlay
  ("SENIOR CAPSTONE PROJECT"). Clicking expands a detail panel with a
  drag-scrollable screenshot carousel and a bullet list of contributions. Links
  to the Steam store page.
- **"Other Projects" divider**, then a **project list** (currently just
  "Duck Around (WIP)"). Each row expands/collapses an inline detail panel with its
  own carousel. Only one panel is open at a time.
- **Fixed bottom bar:** GitHub / LinkedIn / ArtStation icons + a phone icon with a
  click-to-reveal popup (`+1 (408) 800-7215`).

### Design language (live)

- **Colors:** near-black bg `#0f0c0c` / `#0a0606`, text `#ece8e9`, signature red
  accent `#fc314f` (hover `#ff5b6f`). Light mode: pink-cream bg `#feecf6`, text
  `#161213`, accent `#ce0322`, pink bottom bar `#fa95cd`.
- **Font:** `Space Grotesk` (Google Fonts) throughout; a Typekit stylesheet is
  also loaded (`use.typekit.net/hfp1oou.css`) but doesn't appear to be applied.
- **Sizing:** mostly `rem`-based (much healthier than the old repo's `vw` units),
  though there are no media queries — `.main-project-wrapper { width: 50% }` and
  fixed `150px` thumbnails will be cramped on mobile.

### JS behavior (`index.js`)

- Theme toggle: flips `body.light`.
- Accordion logic: expanding the main project or any project row closes the
  others (single-open behavior).
- Phone popup toggle.
- Custom **pointer-drag carousel** — click-drag to scroll horizontally
  (`.project-carousel`), cross-platform via Pointer Events.

### Known issues in the live version

- CSS opens with an `OVERRIDES` block whose selectors (e.g. `.subtitle a.linkedin`)
  reference markup that isn't in the HTML — dead rules.
- `index.html` header `<div>` isn't closed before `</header>` (unbalanced tags).
- Typekit `<link>` loaded but unused.
- Duck Around detail references `da_screenshot_1/2.png` — confirm they exist.
- No favicon, no meta description / OpenGraph tags, no responsive breakpoints.

---

## The OLD version — `main` branch (being replaced)

Kept here for context; **not what's live.** This is what's on the `main` branch:
a blue/cream multi-page portfolio under `pages/<name>/`. Note the internal links are all *flat* (`href="photos.html"`,
`src="images/…"`, `src="fonts/…"`) even though the repo nests each page in its own
folder — so this version was also deployed flat into `public_html/`, and its
`images/`, `fonts/`, `photos/` assets were never committed to git.

| Page | Purpose |
|---|---|
| `index.html` | Landing: Photography / Coding / Digital Design cards + LinkTree CTA |
| `photos.html` | Photography index → Kenya collection |
| `kenya.html` | "Kenya 2022" JSON-driven image grid + lightbox modal |
| `coding.html` | Redirect → github.com/exterminathan |
| `design.html` | Redirect → artstation.com/nathanshturm |
| `linktree.html` | Standalone link hub (Instagram/GitHub/ArtStation) + contact |

- **Colors:** blue `#5285AC`, cream `#EEEDE7`/`#FAE8E0`, green `#14C494`,
  orange `#EF813E` (Kenya), slate `#4a6273` (LinkTree).
- **Fonts:** Eina / ArvoBold / Neuz (local `.woff`/`.ttf`/`.otf`, not in repo).
- **Sizing:** viewport-unit-heavy (`vw`/`vh`) → poor mobile/ultrawide scaling.
- Duplicated scroll-shrink header CSS+JS across every page.

---

## Refresh checklist (suggested first moves)

1. **Reconcile git with live** — commit the current live `index.*` so the repo is
   the source of truth again. Otherwise any deploy from this repo reverts the site.
2. Decide the new information architecture (single-page vs. multi-page).
3. Add responsive breakpoints / mobile layout.
4. Add favicon + meta/OG tags for link previews & SEO.
5. Set up the SSH deploy workflow so future changes go repo → server (see
   `docs/DEPLOY.md`).
</content>
