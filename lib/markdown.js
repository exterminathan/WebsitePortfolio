// Front-matter + Markdown subset -> HTML (zero deps). Used by lib/content.js.

'use strict';

// leaves existing entities (&amp; &#8594;) and real tags alone, so hand-written
// HTML and entities keep working inside Markdown
function smartEscape(s) {
  return String(s)
    .replace(/&(?![a-zA-Z][a-zA-Z0-9]*;|#\d+;|#[xX][0-9a-fA-F]+;)/g, '&amp;')
    .replace(/<(?![a-zA-Z/!])/g, '&lt;');
}

const escAttr = (s) => smartEscape(s).replace(/"/g, '&quot;');

const isExternal = (href) => /^(https?:)?\/\//.test(href);

// there is no volume attribute; the property is the only way to set a default
const VIDEO_VOLUME = 0.75;

/* front matter (YAML subset) */

function tokenize(src) {
  return src.split('\n').map((raw) => {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) return { blank: true, raw: line };
    return { indent: line.match(/^ */)[0].length, text: line.trim(), raw: line };
  });
}

function scalar(str) {
  if (str === '') return '';
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str === 'null' || str === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(str)) return Number(str);
  const quoted = str.match(/^"([\s\S]*)"$/) || str.match(/^'([\s\S]*)'$/);
  if (quoted) return quoted[1];
  if (/^\[[\s\S]*\]$/.test(str))
    return str
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map(scalar);
  return str;
}

function readBlockScalar(toks, start, indent) {
  const lines = [];
  let i = start;
  let base = null;
  while (i < toks.length) {
    const t = toks[i];
    if (t.blank) {
      lines.push('');
      i++;
      continue;
    }
    if (t.indent <= indent) break;
    if (base === null) base = t.indent;
    lines.push(t.raw.slice(base));
    i++;
  }
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  return [lines.join('\n'), i];
}

function parseMap(toks, start, indent) {
  const out = {};
  let i = start;
  while (i < toks.length) {
    const t = toks[i];
    if (t.blank) {
      i++;
      continue;
    }
    if (t.indent < indent) break;
    if (t.text.startsWith('#')) {
      i++;
      continue;
    }
    const m = t.text.match(/^([\w-]+):\s*([\s\S]*)$/);
    if (!m) throw new Error(`Bad front-matter line: ${t.raw}`);
    const [, key, rest] = m;
    if (rest === '|' || rest === '|-' || rest === '>') {
      const [val, next] = readBlockScalar(toks, i + 1, t.indent);
      out[key] = rest === '>' ? val.replace(/\n+/g, ' ') : val;
      i = next;
    } else if (rest === '') {
      const [val, next] = parseNested(toks, i + 1, t.indent);
      out[key] = val;
      i = next;
    } else {
      out[key] = scalar(rest);
      i++;
    }
  }
  return [out, i];
}

function parseList(toks, start, indent) {
  const out = [];
  let i = start;
  while (i < toks.length) {
    const t = toks[i];
    if (t.blank) {
      i++;
      continue;
    }
    if (t.indent < indent || !/^- /.test(t.text)) break;
    const inner = t.text.slice(2).trim();
    if (/^[\w-]+:(\s|$)/.test(inner)) {
      // re-anchor the item as a map line so nested keys parse at one indent
      const saved = toks[i];
      toks[i] = { indent: t.indent + 2, text: inner, raw: saved.raw };
      const [val, next] = parseMap(toks, i, t.indent + 2);
      toks[i] = saved;
      out.push(val);
      i = next;
    } else {
      out.push(scalar(inner));
      i++;
    }
  }
  return [out, i];
}

function parseNested(toks, start, parentIndent) {
  let j = start;
  while (j < toks.length && toks[j].blank) j++;
  if (j >= toks.length || toks[j].indent <= parentIndent) return ['', start];
  return /^- /.test(toks[j].text)
    ? parseList(toks, j, toks[j].indent)
    : parseMap(toks, j, toks[j].indent);
}

function parseYaml(src) {
  return parseMap(tokenize(src), 0, 0)[0];
}

function splitFrontMatter(raw) {
  const m = raw
    .replace(/^﻿/, '')
    .replace(/\r\n/g, '\n')
    .match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  return { meta: parseYaml(m[1]), body: m[2] };
}

/* inline */

function inline(s, ctx) {
  const codes = [];
  let out = String(s).replace(/`([^`]+)`/g, (m, c) => {
    codes.push(`<code>${smartEscape(c)}</code>`);
    return `%%C%%${codes.length - 1}%%C%%`;
  });
  out = smartEscape(out);
  out = out.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (m, alt, src) =>
      `<img src="${ctx.asset(src)}" alt="${escAttr(alt)}" loading="lazy" />`
  );
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (m, text, href) =>
      `<a href="${href}"${isExternal(href) ? ' target="_blank"' : ''}>${text}</a>`
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return out.replace(/%%C%%(\d+)%%C%%/g, (m, i) => codes[Number(i)]);
}

/* directives */

const pad = (n) => ' '.repeat(n);

function figure(src, alt, caption, ctx, indent) {
  const cap = caption
    ? `\n${pad(indent + 2)}<figcaption>\n${pad(indent + 4)}${inline(caption, ctx)}\n${pad(indent + 2)}</figcaption>`
    : '';
  return (
    `${pad(indent)}<figure>\n` +
    `${pad(indent + 2)}<img src="${ctx.asset(src)}" alt="${escAttr(alt)}" loading="lazy" />${cap}\n` +
    `${pad(indent)}</figure>`
  );
}

// figures separated by blank lines: an image line, then its caption paragraph
function galleryFigures(lines, ctx, indent) {
  const groups = [];
  let cur = [];
  for (const l of lines) {
    if (!l.trim()) {
      if (cur.length) groups.push(cur);
      cur = [];
    } else cur.push(l.trim());
  }
  if (cur.length) groups.push(cur);
  return groups.map((g) => {
    const m = g[0].match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (!m) throw new Error(`gallery: expected an image line, got: ${g[0]}`);
    return figure(m[2], m[1], g.slice(1).join(' '), ctx, indent);
  });
}

function directive(name, args, lines, ctx, indent) {
  if (name === 'gallery') {
    const cls = args.includes('1col') ? 'shot-gallery shots-1col' : 'shot-gallery';
    const figs = galleryFigures(lines, ctx, indent + 2);
    return `${pad(indent)}<div class="${cls}">\n${figs.join('\n')}\n${pad(indent)}</div>`;
  }
  if (name === 'placeholders') {
    const items = args
      .map((c) => `${pad(indent + 2)}<div class="placeholder-media ${c}"></div>`)
      .join('\n');
    return `${pad(indent)}<div class="detail-gallery">\n${items}\n${pad(indent)}</div>`;
  }
  if (name === 'video') {
    const opts = {};
    for (const l of lines) {
      const m = l.trim().match(/^([\w-]+):\s*(.*)$/);
      if (m) opts[m[1]] = m[2].trim();
    }
    const caption = args.join(' ');
    const [w, h] = (opts.size || '1280x720').split('x');
    const attrs = [
      'controls',
      'preload="none"',
      'playsinline',
      `onloadstart="this.volume=${VIDEO_VOLUME}"`,
      opts.poster ? `poster="${ctx.asset(opts.poster)}"` : '',
      `width="${w}"`,
      `height="${h}"`,
    ]
      .filter(Boolean)
      .join(' ');
    const sources = ['webm', 'mp4']
      .filter((k) => opts[k])
      .map(
        (k) =>
          `${pad(indent + 4)}<source src="${ctx.asset(opts[k])}" type="video/${k}" />`
      );
    const fallback = opts.fallback
      ? `\n${pad(indent + 4)}${inline(opts.fallback, ctx)}`
      : '';
    const video =
      `${pad(indent + 2)}<video ${attrs}>\n` +
      `${sources.join('\n')}${fallback}\n` +
      `${pad(indent + 2)}</video>`;
    if (!caption) {
      return `${pad(indent)}<figure class="detail-video">\n${video}\n${pad(indent)}</figure>`;
    }
    return (
      `${pad(indent)}<details class="detail-video">\n` +
      `${pad(indent + 2)}<summary><span>${inline(caption, ctx)}</span></summary>\n` +
      `${video}\n` +
      `${pad(indent)}</details>`
    );
  }
  throw new Error(`Unknown directive: ::: ${name}`);
}

/* blocks */

// these take everything from their own line; the rest are fenced by a closing :::
const SINGLE_LINE = new Set(['placeholders']);

const BLOCK_TAG =
  /^<(div|figure|section|video|table|ul|ol|pre|iframe|aside|blockquote|details|script|p|h[1-6]|img|hr|br|span|a)\b/;

// wrap: false emits headings and prose bare, for contexts that are already
// inside a .detail-block (tool sections)
function render(src, ctx, { wrap = true } = {}) {
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const nodes = [];
  let block = null;

  const flush = () => {
    if (!block) return;
    const parts = block.parts.filter((p) => p.trim());
    if (block.title || parts.length) {
      const heading = block.title
        ? `${pad(8)}<h2>${inline(block.title, ctx)}</h2>`
        : '';
      const inner = [heading, ...parts].filter(Boolean).join('\n');
      nodes.push(
        wrap
          ? `${pad(6)}<div class="detail-block">\n${inner}\n${pad(6)}</div>`
          : inner
      );
    }
    block = null;
  };
  const top = (html) => {
    flush();
    nodes.push(html);
  };
  const into = (html) => {
    if (!block) block = { title: '', parts: [] };
    block.parts.push(html);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!t) continue;

    if (/^## +/.test(t)) {
      flush();
      block = { title: t.replace(/^## +/, ''), parts: [] };
      continue;
    }
    if (/^#{3,6} +/.test(t)) {
      const level = t.match(/^#+/)[0].length;
      into(
        `${pad(8)}<h${level}>${inline(t.replace(/^#+ +/, ''), ctx)}</h${level}>`
      );
      continue;
    }
    if (/^:::/.test(t)) {
      const [name, ...args] = t.replace(/^:::\s*/, '').split(/\s+/);
      const body = [];
      if (!SINGLE_LINE.has(name)) {
        const open = i;
        for (i++; i < lines.length && lines[i].trim() !== ':::'; i++) body.push(lines[i]);
        if (i >= lines.length)
          throw new Error(`::: ${name} on line ${open + 1} is never closed by :::`);
      }
      top(directive(name, args, body, ctx, 6));
      continue;
    }
    // a bare image line is a full-width figure, not part of the text block
    const img = t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      top(
        `${pad(6)}<div class="shot-gallery shots-1col">\n${figure(img[2], img[1], '', ctx, 8)}\n${pad(6)}</div>`
      );
      continue;
    }
    if (t.startsWith('```')) {
      const body = [];
      i++;
      for (; i < lines.length && !lines[i].trim().startsWith('```'); i++)
        body.push(lines[i]);
      into(
        `${pad(8)}<pre><code>${smartEscape(body.join('\n'))}</code></pre>`
      );
      continue;
    }
    if (/^(---+|\*\*\*+)$/.test(t)) {
      into(`${pad(8)}<hr />`);
      continue;
    }
    if (BLOCK_TAG.test(t) || t.startsWith('<!--')) {
      const raw = [line];
      const close = t.startsWith('<!--')
        ? (s) => s.includes('-->')
        : (() => {
            const tag = t.match(/^<([a-zA-Z][\w-]*)/)[1];
            return (s) => s.trim() === `</${tag}>`;
          })();
      if (!close(t) && !/\/>\s*$/.test(t)) {
        while (++i < lines.length) {
          raw.push(lines[i]);
          if (close(lines[i])) break;
        }
      }
      top(raw.join('\n'));
      continue;
    }
    if (/^([-*] |\d+\. )/.test(t)) {
      const ordered = /^\d+\. /.test(t);
      const items = [];
      for (; i < lines.length; i++) {
        const li = lines[i].trim();
        if (!li) break;
        if (!/^([-*] |\d+\. )/.test(li)) break;
        items.push(
          `${pad(10)}<li>${inline(li.replace(/^([-*] |\d+\. )/, ''), ctx)}</li>`
        );
      }
      i--;
      const tag = ordered ? 'ol' : 'ul';
      into(`${pad(8)}<${tag}>\n${items.join('\n')}\n${pad(8)}</${tag}>`);
      continue;
    }
    if (t.startsWith('> ')) {
      const quote = [];
      for (; i < lines.length && lines[i].trim().startsWith('> '); i++)
        quote.push(lines[i].trim().slice(2));
      i--;
      into(
        `${pad(8)}<blockquote><p>${inline(quote.join(' '), ctx)}</p></blockquote>`
      );
      continue;
    }
    const para = [t];
    while (i + 1 < lines.length) {
      const next = lines[i + 1].trim();
      if (
        !next ||
        /^(#{2,6} |:::|```|> |[-*] |\d+\. )/.test(next) ||
        /^!\[/.test(next) ||
        BLOCK_TAG.test(next)
      )
        break;
      para.push(next);
      i++;
    }
    into(`${pad(8)}<p>${inline(para.join(' '), ctx)}</p>`);
  }
  flush();
  return nodes.join('\n\n');
}

module.exports = { splitFrontMatter, parseYaml, render, inline, smartEscape, escAttr, isExternal };
