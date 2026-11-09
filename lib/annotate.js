// Editor preview only: tags elements of a page source with their character range.
'use strict';

const crypto = require('crypto');

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);
const RICH = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']);
const INLINE = new Set(['strong', 'em', 'b', 'i', 'code', 'br', 'a']);

const hash = (s) => crypto.createHash('md5').update(s.replace(/\r/g, '')).digest('hex').slice(0, 6);

function plainInline(inner) {
  if (inner.includes('{{')) return false;
  const tags = inner.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g);
  for (const [, , name, attrs] of tags) {
    if (!INLINE.has(name.toLowerCase())) return false;
    if (name.toLowerCase() === 'a' && /\s(?!href\b|target\b)[\w-]+\s*=/.test(attrs)) return false;
  }
  return !/<!--/.test(inner);
}

function annotate(body, file, base) {
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;
  const stack = [];
  const done = [];
  let m;
  while ((m = re.exec(body))) {
    if (m[0].startsWith('<!--')) continue;
    const [all, close, rawName, attrs] = m;
    const name = rawName.toLowerCase();
    if (close) {
      let k = stack.length - 1;
      while (k >= 0 && stack[k].name !== name) k--;
      if (k < 0) continue;
      const el = stack[k];
      stack.length = k;
      el.cs = m.index;
      el.e = m.index + all.length;
      done.push(el);
    } else {
      if (/\/$/.test(attrs) || VOID.has(name)) continue;
      stack.push({ name, s: m.index, is: m.index + all.length, nameEnd: m.index + 1 + rawName.length, depth: stack.length });
      if (RAW.has(name)) {
        const end = body.indexOf('</' + name, re.lastIndex);
        re.lastIndex = end < 0 ? body.length : end;
      }
    }
  }
  const edits = [];
  for (const el of done) {
    const top = el.depth === 0 && !RAW.has(el.name);
    const rich = RICH.has(el.name) && plainInline(body.slice(el.is, el.cs));
    if (!top && !rich) continue;
    const range = `${file}|c|${base + el.s}-${base + el.e}|${base + el.is}-${base + el.cs}|${hash(body.slice(el.s, el.e))}`;
    const attr = ` data-se="${range}" data-se-role="${top ? 'top' : 'blk'}" data-se-kind="${el.name}"${rich ? ' data-se-rich' : ''}`;
    edits.push([el.nameEnd, attr]);
  }
  edits.sort((a, b) => b[0] - a[0]);
  let out = body;
  for (const [at, attr] of edits) out = out.slice(0, at) + attr + out.slice(at);
  return out;
}

module.exports = { annotate };
