#!/usr/bin/env node
// Static site builder (zero deps): src/ -> dist/. Run: node build.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const PREVIEW = !!process.env.SE_PREVIEW;
const DIST = PREVIEW ? path.join(ROOT, 'site-editor', '.preview') : path.join(ROOT, 'dist');

const read = (p) => fs.readFileSync(p, 'utf8');

// cache-bust token so a rebuilt stylesheet is never served stale
const cssVersion = crypto
  .createHash('md5')
  .update(read(path.join(ROOT, 'style.css')))
  .digest('hex')
  .slice(0, 8);

// false ships the site with zero trace of the star/favorites feature
const STARRED_ENABLED = false;

const jsVersion = crypto
  .createHash('md5')
  .update(read(path.join(ROOT, 'starred.js')))
  .digest('hex')
  .slice(0, 8);

// template engine: {{> partial }} includes, {{ var }} substitutions
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

function fillVars(str, vars) {
  return str.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (m, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : m
  );
}

// repeat so tokens introduced by {{content}} also resolve
function renderLoop(str, vars) {
  let out = str;
  for (let i = 0; i < 8; i++) {
    const next = fillVars(out, vars);
    if (next === out) break;
    out = next;
  }
  return out;
}

// hidden: true drops an entry from the whole build — card, preview, detail page
const visible = (items) => items.filter((x) => !x.hidden);

const content = require('./lib/content');

const allGames = content.load('games');
const allProjects = content.load('projects');
const allTools = content.load('tools');
const allDesign = content.load('design');
const games = visible(allGames);
const projects = visible(allProjects);
const tools = visible(allTools);
const design = visible(allDesign);
const albums = require(path.join(SRC, 'data', 'albums.js'));

// singular prefix -> the collection it names, for detail pages and `from:` refs
const COLLECTIONS = { game: allGames, project: allProjects, tool: allTools, design: allDesign };
const SECTION = {
  game: { href: 'games.html', label: 'Games', active: 'games' },
  project: { href: 'projects.html', label: 'Projects', active: 'projects' },
  tool: { href: 'tools.html', label: 'Tools', active: 'tools' },
  design: { href: 'design.html', label: 'Design / 3D', active: 'design' },
};

const FOOTER_SOCIAL =
  '      <div class="footer-social">\n' +
  '        <a href="about.html">About &amp; Contact</a>\n' +
  '      </div>';

const linkAnchor = (l) =>
  `                <a href="${l.href}"${l.external ? ' target="_blank"' : ''}>${l.label}</a>`;

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

const HOME_PICKS = {
  games: ['quartermaster', 'duck-around', 'bleak'],
  projects: ['brick-osint', 'flight-track', 'creator-bot', 'patchbay', '3d-painter'],
  tools: ['efficient-asset-ripper', 'win4kss', 'lightweight-taskbar-groups'],
};
const homePicks = (kind, items) =>
  HOME_PICKS[kind].map((slug) => items.find((i) => i.slug === slug)).filter(Boolean);

const itemCard = (kind) => (item) => {
  const listPage = `${kind}s.html`;
  const detailHref = `${kind}-${item.slug}.html`;
  const cls = ['card', item.detail && 'card-linked', item.tag && `tag-${item.tag}`]
    .filter(Boolean)
    .join(' ');
  const star = starButton(
    'star-btn-card',
    `${kind}:${item.slug}`,
    item.title,
    item.detail ? detailHref : `${listPage}#${item.slug}`,
    item.media && item.media.img
  );
  const news = item.news ? `\n              <p class="news-banner">${item.news}</p>` : '';
  let media;
  if (item.media && item.media.img) {
    const badge = item.media.badge
      ? `\n              <span class="media-tag">${item.media.badge}</span>`
      : '';
    media = `            <div class="card-media placeholder-media">\n              <img src="${item.media.img}" alt="${item.media.alt}" loading="lazy" />${news}${badge}\n              ${star}\n            </div>`;
  } else {
    media = `            <div class="card-media placeholder-media ${item.mediaClass}">\n              ${star}\n            </div>`;
  }
  const blurb = item.body[0] || item.tagline;
  const tags = item.tags.map((t) => `                <li>${t}</li>`).join('\n');
  const overlay = item.detail
    ? `\n            <a class="card-overlay" href="${detailHref}" aria-label="${item.title}"></a>`
    : '';
  const linkItems = item.links.map(linkAnchor);
  if (item.detail)
    linkItems.push(`                <a href="${detailHref}">View details &#8594;</a>`);
  const links = linkItems.length
    ? `\n              <div class="card-links">\n${linkItems.join('\n')}\n              </div>`
    : '';
  return `          <article class="${cls}" id="${item.slug}">${overlay}
${media}
            <div class="card-body">
              <h3>${item.title}</h3>${blurb ? `\n              <p>${blurb}</p>` : ''}
              <ul class="tag-list">
${tags}
              </ul>${links}
            </div>
          </article>`;
};

const listing = (kind, items) =>
  `        <div class="card-grid">\n${items.map(itemCard(kind)).join('\n\n')}\n        </div>`;

function gamePreview(g) {
  const href = g.detail ? `game-${g.slug}.html` : `games.html#${g.slug}`;
  const media = g.media
    ? `<div class="placeholder-media">
              <img src="${g.media.img}" alt="${g.media.alt}" loading="lazy" />
            </div>`
    : `<div class="placeholder-media ${g.mediaClass}"></div>`;
  return `          <a class="quick-card" href="${href}">
            ${media}
            <span class="quick-card-label">${g.title}</span>
          </a>`;
}

function designCard(d) {
  const cls = ['gallery-item', 'placeholder-media', !d.media && d.mediaClass, d.tag && `tag-${d.tag}`]
    .filter(Boolean)
    .join(' ');
  const img = d.media
    ? `\n            <img src="${d.media.img}" alt="${d.media.alt}" loading="lazy" />`
    : '';
  const overlay = d.detail
    ? `\n            <a class="card-overlay" href="design-${d.slug}.html" aria-label="${d.title}"></a>`
    : '';
  const star = starButton(
    'star-btn-card',
    `design:${d.slug}`,
    d.title,
    d.detail ? `design-${d.slug}.html` : `design.html#${d.slug}`,
    d.media && d.media.img
  );
  const caption = `            <figcaption>${d.title}</figcaption>`;
  const rows = [caption, star && `            ${star}`].filter(Boolean).join('\n');
  return `          <figure class="${cls}" id="${d.slug}">${img}${overlay}
${rows}
          </figure>`;
}

// stand-ins stay inert <div>s: the home preview sits inside an aria-hidden blur
function designPreview(d) {
  const media = d.media
    ? `<div class="placeholder-media">\n                  <img src="${d.media.img}" alt="${d.media.alt}" loading="lazy" />\n                </div>`
    : `<div class="placeholder-media ${d.mediaClass}"></div>`;
  const label = `<span class="quick-card-label">${d.title}</span>`;
  if (!d.detail)
    return `              <div class="quick-card">\n                ${media}\n                ${label}\n              </div>`;
  return `              <a class="quick-card" href="design-${d.slug}.html">\n                ${media}\n                ${label}\n              </a>`;
}

// the sunset Design section keeps its blurred stand-ins until real pieces land
const PLACEHOLDER_NAMES = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const designFallback = (classes, render) =>
  classes.map((c, i) =>
    render({ slug: `piece-${i + 1}`, title: `Piece ${PLACEHOLDER_NAMES[i]}`, mediaClass: c, detail: false })
  );

const projectPreview = (p) => previewCard('project', p);
const toolPreview = (t) => previewCard('tool', t);

function previewCard(kind, p) {
  const href = p.detail ? `${kind}-${p.slug}.html` : `${kind}s.html`;
  const media =
    p.media && p.media.img
      ? `<div class="placeholder-media">\n              <img src="${p.media.img}" alt="${p.media.alt}" loading="lazy" />\n            </div>`
      : `<div class="placeholder-media ${p.mediaClass}"></div>`;
  return `          <a class="quick-card" href="${href}">
            ${media}
            <span class="quick-card-label">${p.title}</span>
          </a>`;
}

// photos are scanned off disk, not listed in albums.js; empty albums are skipped
const PHOTOS = path.join(ROOT, 'images', 'photos');

// one flat folder per album: images/photos/<album>/<prefix><NNN>-{FULL,THUMB}.jpg
function partFiles(albumSlug, prefix) {
  const dir = path.join(PHOTOS, albumSlug);
  if (!fs.existsSync(dir)) return [];
  const re = new RegExp(`^${prefix}\\d+-FULL\\.jpe?g$`, 'i');
  return fs
    .readdirSync(dir)
    .filter((f) => re.test(f))
    .sort();
}

// an album's renderable parts: its days, or itself as one part
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

function coverThumb(album, base) {
  const src = `images/photos/${album.slug}/${base}-THUMB.jpg`;
  if (!fs.existsSync(path.join(ROOT, src)))
    console.warn(`WARN: cover ${src} not found (album ${album.slug})`);
  return src;
}

// album row card: title over 3 covers (albums.js `covers`, else the first photos)
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

// trip page: one sub-album card per day
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

      <!-- image viewer: thumbnails :target a slide in this one persistent overlay -->
      <div class="lightbox-scrim" aria-hidden="true"></div>
      <div class="viewer">
        <a href="#_" class="lightbox-close" aria-label="Close">&#10005;</a>
        <div class="viewer-strip">
${slides}
        </div>
      </div>

      <!-- progressive enhancement: keyboard nav, and location.replace so
           browsing photos never stacks history -->
      <script>
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

const anchor = (l, indent) =>
  `${indent}<a href="${l.href}"${l.external ? ' target="_blank"' : ''}${l.ariaLabel ? ` aria-label="${escAttr(l.ariaLabel)}"` : ''}>${l.label}</a>`;

// a tool's `from:` entry is 'project:slug' / 'game:slug', or a raw link object
function resolveFrom(ref, owner) {
  if (typeof ref !== 'string') return ref;
  const [type, slug] = ref.split(':');
  const item = (COLLECTIONS[type] || []).find((x) => x.slug === slug);
  if (!item) throw new Error(`Unknown from: "${ref}" on ${owner}`);
  if (item.hidden || !item.detail) {
    console.warn(`WARN: from: "${ref}" on ${owner} has no page — link dropped`);
    return null;
  }
  return { href: `${type}-${slug}.html`, label: item.title };
}

// an index plus one #slug-anchored section per tool, for cross-page deep links
function toolSections(item) {
  const tools = item.tools || [];
  if (!tools.length) return '';
  const index = tools
    .map(
      (t) =>
        `          <li><a href="#${t.slug}">${t.title}</a>${t.blurb ? `<span>${t.blurb}</span>` : ''}</li>`
    )
    .join('\n');
  const blocks = tools
    .map((t) => {
      const from = (t.from || [])
        .map((r) => resolveFrom(r, `${item.slug}/${t.slug}`))
        .filter(Boolean)
        .map((l) => anchor(l, ''));
      const meta = from.length
        ? `\n        <p class="tool-from">From ${from.join(', ')}</p>`
        : '';
      const body = (t.body || '').replace(/^\n+|\s+$/g, '');
      const links = (t.links || []).map((l) => anchor(l, '          '));
      const linkBlock = links.length
        ? `\n        <div class="detail-links">\n${links.join('\n')}\n        </div>`
        : '';
      return `      <section class="detail-block tool-block" id="${t.slug}">
        <h2><a class="tool-anchor" href="#${t.slug}">${t.title}</a></h2>${meta}
${body}${linkBlock}
      </section>`;
    })
    .join('\n\n');
  return `      <div class="detail-block tool-index" id="tools">
        <h2>Tools</h2>
        <ul>
${index}
        </ul>
      </div>

${blocks}`;
}

// sub-page renderer — one per item with detail: true
function detailContent(item, type) {
  const back = SECTION[type];
  const taglineAt = (pad) =>
    item.tagline ? `\n${pad}<p class="page-intro">${item.tagline}</p>` : '';
  const tagline = taglineAt('        ');
  const sectionCls = item.tag ? `detail-section tag-${item.tag}` : 'detail-section';
  const heroImg = item.heroImg || (item.media && item.media.img);
  const body = (item.detailBody || '').replace(/^\n+|\s+$/g, '');
  const tags =
    item.tags && item.tags.length
      ? `\n        <ul class="tag-list">\n${item.tags
          .map((t) => `          <li>${t}</li>`)
          .join('\n')}\n        </ul>`
      : '';
  const linkItems = (item.detailLinks || item.links || []).map((l) =>
    anchor(l, '          ')
  );
  const links = linkItems.length
    ? `\n        <div class="detail-links">\n${linkItems.join('\n')}\n        </div>`
    : '';
  const linksTop = item.detailLinksTop ? links : '';
  const news = item.news ? `\n        <p class="news-banner">${item.news}</p>` : '';
  const star = starButton(
    'star-btn-detail',
    `${type}:${item.slug}`,
    item.title,
    `${type}-${item.slug}.html`,
    item.media && item.media.img
  );
  const tools = toolSections(item);
  if (heroImg) {
    return `      <div class="page-header">
        <a href="${back.href}" class="back-link">&#8592; Back to ${back.label}</a>
        <header class="detail-banner placeholder-media">
          <img src="${heroImg}" alt="${(item.media && item.media.alt) || item.title}" />${news}
          <div class="detail-banner-text">
            <div class="section-heading">
              <h1>${item.title}</h1>
              ${star}
            </div>${taglineAt('            ')}
          </div>
        </header>
      </div>

      <section class="section ${sectionCls} detail-section-banner">${linksTop}
${body}${tools ? `\n\n${tools}` : ''}${tags}${links}
      </section>`;
  }
  return `      <div class="page-header">
        <a href="${back.href}" class="back-link">&#8592; Back to ${back.label}</a>
        <div class="section-heading">
          <h1>${item.title}</h1>
          ${star}
          <span class="section-line"></span>
        </div>${tagline}
      </div>

      <section class="section ${sectionCls}">${linksTop}${news}
${body}${tools ? `\n\n${tools}` : ''}${tags}${links}
      </section>`;
}

// page front-matter parsing + assembly
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

const NAV_KEYS = ['games', 'projects', 'tools', 'design', 'photos', 'about'];

function pageVars(meta, content) {
  const vars = {
    title: meta.title || 'Nathan Shturm',
    content,
    cssVersion,
    starredScript: STARRED_ENABLED
      ? `<script src="starred.js?v=${jsVersion}" defer></script>`
      : '',
    starredWidget: STARRED_ENABLED ? partials.starred : '',
    robotsMeta: meta.robots
      ? `\n<meta name="robots" content="${meta.robots}" />`
      : '',
    mainAttrs: meta.mainAttrs ? ` ${meta.mainAttrs}` : '',
    footerSocial: meta.footerSocial === 'false' ? '' : FOOTER_SOCIAL,
    gamesCards: listing('game', games),
    projectsCards: listing('project', projects),
    toolsCards: listing('tool', tools),
    gamesPreview: homePicks('games', games).map(gamePreview).join('\n'),
    projectsPreview: homePicks('projects', projects).map(projectPreview).join('\n'),
    toolsPreview: homePicks('tools', tools).map(toolPreview).join('\n'),
    designCards: (design.length
      ? design.map(designCard)
      : designFallback(
          ['media-a', 'media-b', 'media-c', 'media-d', 'media-e', 'media-b', 'media-a', 'media-c', 'media-d'],
          designCard
        )
    ).join('\n'),
    designPreview: (design.length
      ? design.slice(0, 3).map(designPreview)
      : designFallback(['media-a', 'media-b', 'media-e'], designPreview)
    ).join('\n'),
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

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const written = [];

// regular pages
for (const file of fs.readdirSync(path.join(SRC, 'pages'))) {
  if (!file.endsWith('.html')) continue;
  const raw = read(path.join(SRC, 'pages', file));
  const { meta, body } = parsePage(raw);
  const shown = PREVIEW
    ? require('./lib/annotate').annotate(body, `src/pages/${file}`, raw.length - body.length)
    : body;
  fs.writeFileSync(path.join(DIST, file), assemble(pageVars(meta, shown)));
  written.push(file);
}

// detail sub-pages
function writeDetails(items, type) {
  for (const item of items) {
    if (!item.detail) continue;
    const meta = {
      title: `${item.title} — Nathan Shturm`,
      active: SECTION[type].active,
    };
    const out = assemble(pageVars(meta, detailContent(item, type)));
    const name = `${type}-${item.slug}.html`;
    fs.writeFileSync(path.join(DIST, name), out);
    written.push(name);
  }
}
writeDetails(games, 'game');
writeDetails(projects, 'project');
writeDetails(tools, 'tool');
writeDetails(design, 'design');

// photo album pages
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
if (!PREVIEW) fs.cpSync(path.join(ROOT, 'images'), path.join(DIST, 'images'), { recursive: true });
if (!PREVIEW && fs.existsSync(path.join(ROOT, 'resume.pdf')))
  fs.copyFileSync(path.join(ROOT, 'resume.pdf'), path.join(DIST, 'resume.pdf'));

content.reportMissing();
console.log(`Built ${written.length} pages -> ${PREVIEW ? 'site-editor/.preview' : 'dist'}/`);
for (const f of written) console.log(`  ${f}`);
