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

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const read = (p) => fs.readFileSync(p, 'utf8');

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

const FOOTER_SOCIAL =
  '      <div class="footer-social">\n' +
  '        <a href="about.html">About &amp; Contact</a>\n' +
  '      </div>';

const linkAnchor = (l) =>
  `                <a href="${l.href}"${l.external ? ' target="_blank"' : ''}>${l.label}</a>`;

function gameCard(g) {
  const cls = ['card', g.featured && 'card-featured', g.tag && `tag-${g.tag}`]
    .filter(Boolean)
    .join(' ');
  const badge = g.media.badge
    ? `\n              <span class="media-tag">${g.media.badge}</span>`
    : '';
  const paras = g.body.map((p) => `              <p>${p}</p>`).join('\n');
  const tags = g.tags.map((t) => `                <li>${t}</li>`).join('\n');
  const linkItems = (g.links || []).map(linkAnchor);
  if (g.detail)
    linkItems.push(
      `                <a href="game-${g.slug}.html">View details &#8594;</a>`
    );
  const links = linkItems.length
    ? `\n              <div class="card-links">\n${linkItems.join('\n')}\n              </div>`
    : '';
  return `          <article class="${cls}" id="${g.slug}">
            <div class="card-media placeholder-media">
              <img src="${g.media.img}" alt="${g.media.alt}" />${badge}
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
  const cls = ['row-item', i % 2 === 1 && 'reverse', p.tag && `tag-${p.tag}`]
    .filter(Boolean)
    .join(' ');
  let media;
  if (p.media && p.media.img) {
    const badge = p.media.badge
      ? `\n              <span class="media-tag">${p.media.badge}</span>`
      : '';
    media = `            <div class="card-media placeholder-media row-media">\n              <img src="${p.media.img}" alt="${p.media.alt}" />${badge}\n            </div>`;
  } else {
    media = `            <div class="card-media placeholder-media ${p.mediaClass} row-media"></div>`;
  }
  const paras = p.body.map((x) => `              <p>${x}</p>`).join('\n');
  const tags = p.tags.map((t) => `                <li>${t}</li>`).join('\n');
  const linkItems = (p.links || []).map(linkAnchor);
  if (p.detail)
    linkItems.push(
      `                <a href="project-${p.slug}.html">View details &#8594;</a>`
    );
  const links = linkItems.length
    ? `\n              <div class="card-links">\n${linkItems.join('\n')}\n              </div>`
    : '';
  return `          <article class="${cls}">
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
              <img src="${g.media.img}" alt="${g.media.alt}" />
            </div>
            <span class="quick-card-label">${g.title}</span>
          </a>`;
}

function projectPreview(p) {
  const href = p.detail ? `project-${p.slug}.html` : 'projects.html';
  return `          <a class="quick-card" href="${href}">
            <div class="placeholder-media ${p.mediaClass}"></div>
            <span class="quick-card-label">${p.title}</span>
          </a>`;
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
  return `      <div class="page-header">
        <a href="${back.href}" class="back-link">&#8592; Back to ${back.label}</a>
        <div class="section-heading">
          <h1>${item.title}</h1>
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
    mainAttrs: meta.mainAttrs ? ` ${meta.mainAttrs}` : '',
    footerSocial: meta.footerSocial === 'false' ? '' : FOOTER_SOCIAL,
    gamesCards: games.map(gameCard).join('\n\n'),
    projectsCards: projects.map(projectRow).join('\n\n'),
    gamesPreview: games.slice(0, 2).map(gamePreview).join('\n'),
    projectsPreview: projects.slice(0, 2).map(projectPreview).join('\n'),
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

// static assets
fs.copyFileSync(path.join(ROOT, 'style.css'), path.join(DIST, 'style.css'));
fs.cpSync(path.join(ROOT, 'images'), path.join(DIST, 'images'), { recursive: true });
if (fs.existsSync(path.join(ROOT, 'resume.pdf')))
  fs.copyFileSync(path.join(ROOT, 'resume.pdf'), path.join(DIST, 'resume.pdf'));

console.log(`Built ${written.length} pages -> dist/`);
for (const f of written) console.log(`  ${f}`);
