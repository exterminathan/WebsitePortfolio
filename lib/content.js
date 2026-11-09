// Loads src/content/<type>/*.md into the item objects build.js renders from.

'use strict';

const fs = require('fs');
const path = require('path');
const md = require('./markdown');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'src', 'content');
const ICONS = path.join(ROOT, 'src', 'icons');

// games, projects and tools share images/projects/; design pieces get their own root
const ASSET_ROOT = {
  games: 'images/projects',
  projects: 'images/projects',
  tools: 'images/projects',
  design: 'images/design',
};

const missing = [];
const read = (p) => fs.readFileSync(p, 'utf8');

// paths in front matter and Markdown are relative to the item's asset folder;
// anything already rooted or absolute passes through untouched
function assetResolver(base) {
  return (src) => {
    if (!src) return src;
    if (md.isExternal(src) || src.startsWith('/') || src.startsWith('images/'))
      return src;
    const rel = `${base}/${src}`.replace(/\/+/g, '/');
    if (!fs.existsSync(path.join(ROOT, rel))) missing.push(rel);
    return rel;
  };
}

function icon(name) {
  const file = path.join(ICONS, `${name}.svg`);
  if (!fs.existsSync(file)) {
    missing.push(`src/icons/${name}.svg`);
    return '';
  }
  return read(file).trim().replace(/\s*\n\s*/g, '');
}

// "https://url | Label" is shorthand for the { href, label } map form
function normalizeLink(link) {
  const l =
    typeof link === 'string'
      ? (([href, ...rest]) => ({ href: href.trim(), label: rest.join('|').trim() }))(
          link.split('|')
        )
      : { ...link };
  if (l.external === undefined) l.external = md.isExternal(l.href);
  l.label = l.icon
    ? `${icon(l.icon)}<span>${md.smartEscape(l.label)}</span>`
    : md.smartEscape(l.label || '');
  delete l.icon;
  return l;
}

const list = (v) => (Array.isArray(v) ? v : v === undefined || v === '' ? [] : [v]);
const text = (v) => (v === undefined ? undefined : md.smartEscape(v));

const PREVIEW = !!process.env.SE_PREVIEW;

// editor preview only: lets the renderer tag blocks with their source file and line
function withSource(ctx, file, raw, body) {
  if (!PREVIEW) return ctx;
  const norm = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const off = norm.split('\n').length - body.split('\n').length;
  return { ...ctx, se: { file: path.relative(ROOT, file).replace(/\\/g, '/'), off } };
}

function loadTools(dir, ctx) {
  const toolDir = path.join(dir, 'tools');
  if (!fs.existsSync(toolDir)) return [];
  return fs
    .readdirSync(toolDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const file = path.join(toolDir, f);
      const raw = read(file);
      const { meta, body } = md.splitFrontMatter(raw);
      return {
        slug: meta.slug || f.slice(0, -3),
        title: text(meta.title) || f.slice(0, -3),
        blurb: text(meta.blurb) || '',
        order: meta.order === undefined ? 999 : meta.order,
        from: list(meta.from),
        links: list(meta.links).map(normalizeLink),
        body: md.render(body, withSource(ctx, file, raw, body), { wrap: false }),
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function loadItem(entry, type) {
  const raw = read(entry.file);
  const { meta, body } = md.splitFrontMatter(raw);
  const root = ASSET_ROOT[type] || 'images/projects';
  const ctx = { asset: assetResolver(meta.assets || `${root}/${entry.slug}`) };
  const item = {
    slug: entry.slug,
    title: text(meta.title) || entry.slug,
    order: meta.order === undefined ? 999 : meta.order,
    tag: meta.tag,
    featured: meta.featured === true,
    hidden: meta.hidden === true,
    detail: meta.detail !== false,
    mediaClass: meta.mediaClass,
    tagline: text(meta.tagline),
    news: text(meta.news),
    body: list(meta.body).map(text),
    tags: list(meta.tags).map(text),
    links: list(meta.links).map(normalizeLink),
    detailLinks: list(meta.detailLinks).map(normalizeLink),
    detailLinksTop: meta.detailLinksTop === true,
    detailBody: md.render(body, withSource(ctx, entry.file, raw, body)),
    tools: entry.dir ? loadTools(entry.dir, ctx) : [],
  };
  if (meta.media && meta.media.img)
    item.media = {
      img: ctx.asset(meta.media.img),
      alt: text(meta.media.alt) || item.title,
      badge: text(meta.media.badge),
    };
  if (meta.hero) item.heroImg = ctx.asset(meta.hero);
  if (!item.detailLinks.length) delete item.detailLinks;
  if (!item.tools.length) delete item.tools;
  return item;
}

// frozen files that still sit in projects/ but are tools
const TOOLS_IN_PROJECTS = ['efficient-asset-ripper'];

// an item is <slug>.md, or <slug>/index.md when it carries tools or local files
function scan(type) {
  const dir = path.join(CONTENT, type);
  if (!fs.existsSync(dir)) return [];
  const entries = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_')) continue;
    if (e.isDirectory()) {
      const index = path.join(dir, e.name, 'index.md');
      if (fs.existsSync(index))
        entries.push({ slug: e.name, file: index, dir: path.join(dir, e.name) });
    } else if (e.name.endsWith('.md')) {
      entries.push({ slug: e.name.slice(0, -3), file: path.join(dir, e.name), dir: null });
    }
  }
  return entries;
}

function load(type) {
  let entries = scan(type);
  if (type === 'projects')
    entries = entries.filter((e) => !TOOLS_IN_PROJECTS.includes(e.slug));
  if (type === 'tools')
    entries.push(...scan('projects').filter((e) => TOOLS_IN_PROJECTS.includes(e.slug)));
  return entries
    .map((e) => loadItem(e, type))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function reportMissing() {
  if (!missing.length) return;
  const seen = [...new Set(missing)];
  for (const m of seen) console.warn(`WARN: referenced file not found — ${m}`);
  console.warn(`WARN: ${seen.length} missing asset(s)`);
}

module.exports = { load, reportMissing };
