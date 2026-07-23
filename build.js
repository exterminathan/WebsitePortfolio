#!/usr/bin/env node
/*
 * Static site builder — zero dependencies, just Node stdlib.
 *
 *   node build.js        # build the site into dist/
 *
 * What it does:
 *   1. Wraps every page in src/pages/ with the shared shell (src/layouts/base.html
 *      + src/partials/*), so the nav/head/footer live in ONE place.
 *   2. Renders the Games/Projects listing cards + home previews from the data in
 *      src/data/*.js.
 *   3. Generates a standalone detail page (game-<slug>.html / project-<slug>.html)
 *      for every item whose `detail` flag is true — that's the per-project /
 *      per-game sub-page. Items with `detail: false` get no page and no link.
 *   4. Copies static assets (style.css, images/, resume.pdf) into dist/.
 *
 * The whole dist/ folder is what gets deployed (see scripts/deploy.sh, SRC="dist").
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const read = (p) => fs.readFileSync(p, 'utf8');

// short content hash of style.css → cache-busting token on the <link> so a
// rebuilt stylesheet is never served from a stale browser cache.
const cssVersion = crypto
  .createHash('md5')
  .update(read(path.join(ROOT, 'style.css')))
  .digest('hex')
  .slice(0, 8);

// ---------------------------------------------------------------------------
// feature flag: the localStorage star/favorites system (starred.js).
// Flip to false and rebuild to ship a site with ZERO trace of the feature —
// no star buttons, no floating widget, no <script> tag, no starred.js copied.
// (Visitors' saved favorites survive in their localStorage for when it's back.)
// ---------------------------------------------------------------------------
const STARRED_ENABLED = false;

// same cache-busting for starred.js (the localStorage star/favorites script)
const jsVersion = crypto
  .createHash('md5')
  .update(read(path.join(ROOT, 'starred.js')))
  .digest('hex')
  .slice(0, 8);

// ---------------------------------------------------------------------------
// tiny template engine: {{> partial }} includes, {{ var }} substitutions
// ---------------------------------------------------------------------------
const partials = {};
for (const f of fs.readdirSync(path.join(SRC, 'partials'))) {
  partials[path.basename(f, '.html')] = read(path.join(SRC, 'partials', f));
}
const layout = read(path.join(SRC, 'layouts', 'base.html'));

function includePartials(str) {
  return str.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (m, name) => {
    if (!(name in partials)) throw new Error(`Unknown partial: ${name}`);
    return partials[name];
  });
}

// replace {{ key }} for every key present in vars; leave unknown tokens untouched
function fillVars(str, vars) {
  return str.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (m, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : m
  );
}

// fill repeatedly so tokens introduced by {{content}} (e.g. {{gamesCards}}) resolve
function renderLoop(str, vars) {
  let out = str;
  for (let i = 0; i < 8; i++) {
    const next = fillVars(out, vars);
    if (next === out) break;
    out = next;
  }
  return out;
}

// ---------------------------------------------------------------------------
// data + card renderers
// ---------------------------------------------------------------------------
const games = require(path.join(SRC, 'data', 'games.js'));
const projects = require(path.join(SRC, 'data', 'projects.js'));
const albums = require(path.join(SRC, 'data', 'albums.js'));

const FOOTER_SOCIAL =
  '      <div class="footer-social">\n' +
  '        <a href="about.html">About &amp; Contact</a>\n' +
  '      </div>';

const linkAnchor = (l) =>
  `                <a href="${l.href}"${l.external ? ' target="_blank"' : ''}>${l.label}</a>`;

// star/favorite buttons (localStorage, starred.js) — display:none without JS.
// data-star-* carries everything the nav panel needs to list the item later.
const escAttr = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const STAR_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.1l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.4l-5.6 2.9 1.1-6.2-4.6-4.4 6.3-.9z"/></svg>';

function starButton(cls, id, title, href, img) {
  if (!STARRED_ENABLED) return '';
  return (
    `<button type="button" class="star-btn ${cls}"` +
    ` data-star-id="${escAttr(id)}" data-star-title="${escAttr(title)}"` +
    ` data-star-href="${escAttr(href)}"${img ? ` data-star-img="${escAttr(img)}"` : ''}` +
    ` aria-pressed="false" aria-label="Star ${escAttr(title)}">${STAR_SVG}</button>`
  );
}

function gameCard(g) {
  const cls = ['card', g.detail && 'card-linked', g.featured && 'card-featured', g.tag && `tag-${g.tag}`]
    .filter(Boolean)
    .join(' ');
  const badge = g.media.badge
    ? `\n              <span class="media-tag">${g.media.badge}</span>`
    : '';
  const paras = g.body.map((p) => `              <p>${p}</p>`).join('\n');
  const tags = g.tags.map((t) => `                <li>${t}</li>`).join('\n');
  const overlay = g.detail
    ? `\n            <a class="card-overlay" href="game-${g.slug}.html" aria-label="${g.title}"></a>`
    : '';
  const linkItems = (g.links || []).map(linkAnchor);
  if (g.detail)
    linkItems.push(
      `                <a href="game-${g.slug}.html">View details &#8594;</a>`
    );
  const links = linkItems.length
    ? `\n              <div class="card-links">\n${linkItems.join('\n')}\n              </div>`
    : '';
  const star = starButton(
    'star-btn-card',
    `game:${g.slug}`,
    g.title,
    g.detail ? `game-${g.slug}.html` : `games.html#${g.slug}`,
    g.media.img
  );
  return `          <article class="${cls}" id="${g.slug}">${overlay}
            <div class="card-media placeholder-media">
              <img src="${g.media.img}" alt="${g.media.alt}" loading="lazy" />${badge}
              ${star}
            </div>
            <div class="card-body">
              <h3>${g.title}</h3>
${paras}
              <ul class="tag-list">
${tags}
              </ul>${links}
            </div>
          </article>`;
}

function projectRow(p, i) {
  const cls = ['row-item', p.detail && 'card-linked', i % 2 === 1 && 'reverse', p.tag && `tag-${p.tag}`]
    .filter(Boolean)
    .join(' ');
  const star = starButton(
    'star-btn-card',
    `project:${p.slug}`,
    p.title,
    p.detail ? `project-${p.slug}.html` : `projects.html#${p.slug}`,
    p.media && p.media.img
  );
  let media;
  if (p.media && p.media.img) {
    const badge = p.media.badge
      ? `\n              <span class="media-tag">${p.media.badge}</span>`
      : '';
    media = `            <div class="card-media placeholder-media row-media">\n              <img src="${p.media.img}" alt="${p.media.alt}" loading="lazy" />${badge}\n              ${star}\n            </div>`;
  } else {
    media = `            <div class="card-media placeholder-media ${p.mediaClass} row-media">\n              ${star}\n            </div>`;
  }
  const paras = p.body.map((x) => `              <p>${x}</p>`).join('\n');
  const tags = p.tags.map((t) => `                <li>${t}</li>`).join('\n');
  const overlay = p.detail
    ? `\n            <a class="card-overlay" href="project-${p.slug}.html" aria-label="${p.title}"></a>`
    : '';
  const linkItems = (p.links || []).map(linkAnchor);
  if (p.detail)
    linkItems.push(
      `                <a href="project-${p.slug}.html">View details &#8594;</a>`
    );
  const links = linkItems.length
    ? `\n              <div class="card-links">\n${linkItems.join('\n')}\n              </div>`
    : '';
  return `          <article class="${cls}" id="${p.slug}">${overlay}
${media}
            <div class="row-body">
              <h3>${p.title}</h3>
${paras}
              <ul class="tag-list">
${tags}
              </ul>${links}
            </div>
          </article>`;
}

function gamePreview(g) {
  const href = g.detail ? `game-${g.slug}.html` : `games.html#${g.slug}`;
  return `          <a class="quick-card" href="${href}">
            <div class="placeholder-media">
              <img src="${g.media.img}" alt="${g.media.alt}" loading="lazy" />
            </div>
            <span class="quick-card-label">${g.title}</span>
          </a>`;
}

function projectPreview(p) {
  const href = p.detail ? `project-${p.slug}.html` : 'projects.html';
  const media =
    p.media && p.media.img
      ? `<div class="placeholder-media">\n              <img src="${p.media.img}" alt="${p.media.alt}" loading="lazy" />\n            </div>`
      : `<div class="placeholder-media ${p.mediaClass}"></div>`;
  return `          <a class="quick-card" href="${href}">
            ${media}
            <span class="quick-card-label">${p.title}</span>
          </a>`;
}

// ---------------------------------------------------------------------------
// photo albums — src/data/albums.js names them; the actual photos are scanned
// from images/photos/<album>[/<day>]/{full,thumb}/ (see scripts/ingest-photos.ps1).
// Albums/days with no photos on disk are skipped, so a photo-less clone builds.
// ---------------------------------------------------------------------------
const PHOTOS = path.join(ROOT, 'images', 'photos');

// each album is ONE flat folder: images/photos/<album>/<prefix><NNN>-FULL.jpg
// plus a matching -THUMB.jpg. <prefix> is the day slug (day albums) or the
// album's `prefix` (flat albums, e.g. kenya001-FULL.jpg). Grids use THUMB,
// lightboxes use FULL. `files` below are the -FULL basenames, sorted.
function partFiles(albumSlug, prefix) {
  const dir = path.join(PHOTOS, albumSlug);
  if (!fs.existsSync(dir)) return [];
  const re = new RegExp(`^${prefix}\\d+-FULL\\.jpe?g$`, 'i');
  return fs
    .readdirSync(dir)
    .filter((f) => re.test(f))
    .sort();
}

// an album's renderable parts: its days (with photos), or itself as one part
function albumParts(album) {
  if (album.days)
    return album.days
      .map((d) => ({ ...d, files: partFiles(album.slug, d.slug) }))
      .filter((d) => d.files.length);
  return [{ files: partFiles(album.slug, album.prefix || album.slug) }].filter(
    (p) => p.files.length
  );
}

const thumbOf = (f) => f.replace(/-FULL(\.jpe?g)$/i, '-THUMB$1');
const photoSrc = (album, file) => `images/photos/${album.slug}/${file}`;

// resolve a hand-picked cover base name (e.g. 'hakone014') to its -THUMB url,
// warning on typos so a broken cover never ships silently
function coverThumb(album, base) {
  const src = `images/photos/${album.slug}/${base}-THUMB.jpg`;
  if (!fs.existsSync(path.join(ROOT, src)))
    console.warn(`WARN: cover ${src} not found (album ${album.slug})`);
  return src;
}

// photos.html row + home-page preview: title overlay over 3 cover thumbnails.
// `covers` in albums.js picks them; default is first photo of the first 3
// days / first 3 photos of a flat album.
function albumRow(album) {
  const parts = albumParts(album);
  if (!parts.length) return '';
  let covers;
  if (album.covers) {
    covers = album.covers.map((base) => coverThumb(album, base));
  } else {
    covers = [];
    for (const p of parts) {
      if (covers.length === 3) break;
      covers.push(photoSrc(album, thumbOf(p.files[0])));
    }
    for (let i = 1; covers.length < 3 && i < parts[0].files.length; i++)
      covers.push(photoSrc(album, thumbOf(parts[0].files[i])));
  }
  const imgs = covers
    .map(
      (src) =>
        `              <div class="placeholder-media"><img src="${src}" alt="" loading="lazy" /></div>`
    )
    .join('\n');
  return `          <a class="album-row" href="photos-${album.slug}.html">
            <div class="album-images">
${imgs}
            </div>
            <div class="album-overlay"><span>${album.title}</span></div>
          </a>`;
}

// trip page for an album with days: one sub-album card per day
function tripContent(album, parts) {
  const cards = parts
    .map((d) => {
      const cover = d.cover
        ? coverThumb(album, d.cover)
        : photoSrc(album, thumbOf(d.files[0]));
      return `          <a class="quick-card day-card" href="photos-${album.slug}-${d.slug}.html">
            <div class="placeholder-media"><img src="${cover}" alt="${d.title}" loading="lazy" /></div>
            <span class="quick-card-label">${d.title}</span>
            <span class="day-card-meta">${d.date} &middot; ${d.files.length} photos</span>
          </a>`;
    })
    .join('\n');
  return `      <div class="page-header">
        <a href="photos.html" class="back-link">&#8592; All photos</a>
        <div class="section-heading">
          <h1>${album.title}</h1>
          <span class="section-line"></span>
        </div>
        <p class="page-intro">${album.blurb || ''}</p>
      </div>

      <section class="section">
        <div class="quick-grid day-grid">
${cards}
        </div>
      </section>`;
}

// photo grid + CSS-only :target lightbox for one part (a day, or a flat album)
function photoGridContent(album, part, day) {
  const files = part.files;
  // this page's output filename (sans .html) — the stable id + href stem for stars
  const pageName = day ? `photos-${album.slug}-${day.slug}` : `photos-${album.slug}`;
  const back = day
    ? { href: `photos-${album.slug}.html`, label: album.title }
    : { href: 'photos.html', label: 'All photos' };
  const title = day ? day.title : album.title;
  const intro = day ? `${album.title} &mdash; ${day.date}` : album.blurb || '';
  const items = files
    .map(
      (f, i) =>
        `          <a href="#photo-${i + 1}" class="photo-item"><img src="${photoSrc(album, thumbOf(f))}" alt="${title} photo ${i + 1}" loading="lazy" /></a>`
    )
    .join('\n');
  const slides = files
    .map((f, i) => {
      const n = i + 1;
      const prev = n === 1 ? files.length : n - 1;
      const next = n === files.length ? 1 : n + 1;
      const star = starButton(
        'star-btn-bar',
        `photo:${pageName}:${n}`,
        `${title} — photo ${n}`,
        `${pageName}.html#photo-${n}`,
        photoSrc(album, thumbOf(f))
      );
      return `          <figure class="viewer-slide" id="photo-${n}">
            <a href="#_" class="slide-close" aria-label="Close image viewer"></a>
            <div class="lightbox-image"><img src="${photoSrc(album, f)}" alt="${title} photo ${n}" loading="lazy" /></div>
            <div class="lightbox-bar">
              <a href="#photo-${prev}" class="lightbox-nav" aria-label="Previous photo">&#8249;</a>
              <span class="lightbox-count">${n} / ${files.length}</span>
              <a href="#photo-${next}" class="lightbox-nav" aria-label="Next photo">&#8250;</a>
              ${star}
            </div>
          </figure>`;
    })
    .join('\n');
  return `      <div class="page-header">
        <a href="${back.href}" class="back-link">&#8592; ${back.label}</a>
        <div class="section-heading">
          <h1>${title}</h1>
          <span class="section-line"></span>
        </div>${intro ? `\n        <p class="page-intro">${intro}</p>` : ''}
      </div>

      <section class="section">
        <div class="photo-grid">
${items}
        </div>
      </section>

      <!-- embedded image viewer — a thumbnail :targets its slide inside one
           persistent overlay; prev/next glide the scroll-snap strip in place
           instead of re-rendering anything -->
      <div class="lightbox-scrim" aria-hidden="true"></div>
      <div class="viewer">
        <a href="#_" class="lightbox-close" aria-label="Close">&#10005;</a>
        <div class="viewer-strip">
${slides}
        </div>
      </div>

      <!-- the site's one JS exception: keyboard nav + history-clean hash hops
           for the viewer. Pure progressive enhancement — without it, clicks
           still work, they just leave per-photo history entries -->
      <script>
        // location.replace instead of anchor-default pushState: browsing
        // photos never stacks history — Back always leaves the album page
        document.addEventListener('click', (e) => {
          const a = e.target.closest('a[href^="#"]');
          if (!a) return;
          e.preventDefault();
          location.replace(a.getAttribute('href'));
        });
        addEventListener('keydown', (e) => {
          if (e.altKey || e.ctrlKey || e.metaKey) return;
          const m = /^#photo-(\\d+)$/.exec(location.hash);
          if (!m) return;
          const total = ${files.length}, n = +m[1];
          if (e.key === 'ArrowRight') location.replace('#photo-' + ((n % total) + 1));
          else if (e.key === 'ArrowLeft') location.replace('#photo-' + (((n + total - 2) % total) + 1));
          else if (e.key === 'Escape') location.replace('#_');
          else return;
          e.preventDefault();
        });
      </script>`;
}

// ---------------------------------------------------------------------------
// detail (sub-page) renderer — one per item with detail: true
// ---------------------------------------------------------------------------
function detailContent(item, type) {
  const back =
    type === 'game'
      ? { href: 'games.html', label: 'Games' }
      : { href: 'projects.html', label: 'Projects' };
  const tagline = item.tagline
    ? `\n        <p class="page-intro">${item.tagline}</p>`
    : '';
  const sectionCls = item.tag ? `detail-section tag-${item.tag}` : 'detail-section';
  const hero =
    item.media && item.media.img
      ? `        <div class="detail-hero placeholder-media">
          <img src="${item.media.img}" alt="${item.media.alt}" />
        </div>\n`
      : '';
  const body = (item.detailBody || '').replace(/^\n+|\s+$/g, '');
  const tags =
    item.tags && item.tags.length
      ? `\n        <ul class="tag-list">\n${item.tags
          .map((t) => `          <li>${t}</li>`)
          .join('\n')}\n        </ul>`
      : '';
  const linkItems = (item.links || []).map(
    (l) => `          <a href="${l.href}"${l.external ? ' target="_blank"' : ''}>${l.label}</a>`
  );
  const links = linkItems.length
    ? `\n        <div class="detail-links">\n${linkItems.join('\n')}\n        </div>`
    : '';
  // same star id as the listing card, so either page stars the same favorite
  const star = starButton(
    'star-btn-detail',
    `${type}:${item.slug}`,
    item.title,
    `${type}-${item.slug}.html`,
    item.media && item.media.img
  );
  return `      <div class="page-header">
        <a href="${back.href}" class="back-link">&#8592; Back to ${back.label}</a>
        <div class="section-heading">
          <h1>${item.title}</h1>
          ${star}
          <span class="section-line"></span>
        </div>${tagline}
      </div>

      <section class="section ${sectionCls}">
${hero}${body}${tags}${links}
      </section>`;
}

// ---------------------------------------------------------------------------
// page front-matter parsing + assembly
// ---------------------------------------------------------------------------
function parsePage(raw) {
  const m = raw.match(/^\s*<!--([\s\S]*?)-->\s*\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    if (k) meta[k] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

const NAV_KEYS = ['games', 'projects', 'design', 'photos', 'about'];

function pageVars(meta, content) {
  const vars = {
    title: meta.title || 'Nathan Shturm',
    content,
    cssVersion,
    // starred feature: the head <script> and the floating widget markup
    // (src/partials/starred.html) drop out entirely when the flag is off
    starredScript: STARRED_ENABLED
      ? `<script src="starred.js?v=${jsVersion}" defer></script>`
      : '',
    starredWidget: STARRED_ENABLED ? partials.starred : '',
    // `robots:` front-matter → a per-page robots meta (e.g. hidden pages set
    // "noindex, nofollow"). Absent on normal pages, so the token drops out.
    robotsMeta: meta.robots
      ? `\n<meta name="robots" content="${meta.robots}" />`
      : '',
    mainAttrs: meta.mainAttrs ? ` ${meta.mainAttrs}` : '',
    footerSocial: meta.footerSocial === 'false' ? '' : FOOTER_SOCIAL,
    gamesCards: games.map(gameCard).join('\n\n'),
    projectsCards: projects.map(projectRow).join('\n\n'),
    gamesPreview: games.map(gamePreview).join('\n'),
    projectsPreview: projects.map(projectPreview).join('\n'),
    photoAlbums: albums.map(albumRow).filter(Boolean).join('\n\n'),
  };
  for (const k of NAV_KEYS) {
    vars[`nav${k[0].toUpperCase()}${k.slice(1)}`] =
      meta.active === k ? ' class="active"' : '';
  }
  return vars;
}

function assemble(vars) {
  return renderLoop(includePartials(layout), vars);
}

// ---------------------------------------------------------------------------
// build
// ---------------------------------------------------------------------------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const written = [];

// regular pages
for (const file of fs.readdirSync(path.join(SRC, 'pages'))) {
  if (!file.endsWith('.html')) continue;
  const { meta, body } = parsePage(read(path.join(SRC, 'pages', file)));
  fs.writeFileSync(path.join(DIST, file), assemble(pageVars(meta, body)));
  written.push(file);
}

// detail sub-pages (only for items flagged detail: true)
function writeDetails(items, type) {
  for (const item of items) {
    if (!item.detail) continue;
    const meta = {
      title: `${item.title} — Nathan Shturm`,
      active: type === 'game' ? 'games' : 'projects',
    };
    const out = assemble(pageVars(meta, detailContent(item, type)));
    const name = `${type}-${item.slug}.html`;
    fs.writeFileSync(path.join(DIST, name), out);
    written.push(name);
  }
}
writeDetails(games, 'game');
writeDetails(projects, 'project');

// photo album pages — trip page + one page per day, or one page per flat album
for (const album of albums) {
  const parts = albumParts(album);
  if (!parts.length) continue;
  const page = (name, title, content) => {
    fs.writeFileSync(
      path.join(DIST, name),
      assemble(pageVars({ title, active: 'photos' }, content))
    );
    written.push(name);
  };
  if (album.days) {
    page(
      `photos-${album.slug}.html`,
      `${album.title} — Nathan Shturm`,
      tripContent(album, parts)
    );
    for (const d of parts)
      page(
        `photos-${album.slug}-${d.slug}.html`,
        `${d.title} — ${album.title} — Nathan Shturm`,
        photoGridContent(album, d, d)
      );
  } else {
    page(
      `photos-${album.slug}.html`,
      `${album.title} — Nathan Shturm`,
      photoGridContent(album, parts[0], null)
    );
  }
}

// static assets
fs.copyFileSync(path.join(ROOT, 'style.css'), path.join(DIST, 'style.css'));
if (STARRED_ENABLED)
  fs.copyFileSync(path.join(ROOT, 'starred.js'), path.join(DIST, 'starred.js'));
fs.cpSync(path.join(ROOT, 'images'), path.join(DIST, 'images'), { recursive: true });
if (fs.existsSync(path.join(ROOT, 'resume.pdf')))
  fs.copyFileSync(path.join(ROOT, 'resume.pdf'), path.join(DIST, 'resume.pdf'));

console.log(`Built ${written.length} pages -> dist/`);
for (const f of written) console.log(`  ${f}`);
