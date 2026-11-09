#!/usr/bin/env python3
"""Site text editor.

Serves a local copy of a site. Double-click any text on the page to edit it. The change is written to the
site's source files, and it is also logged, so that it can be re-applied if the source changes later.

    python -I site-editor/editor.py tools            edit the site named "tools" in site-editor.json
    python -I site-editor/editor.py --list           list the sites
    python -I site-editor/editor.py tools --reapply  re-apply every logged edit to the current source
    python -I site-editor/editor.py --serve DIR      ad hoc: serve and edit DIR (add --edits FILE to keep a log)

Only the Python standard library is used. The server listens on 127.0.0.1 only.
See TOOLKIT.md for how to add this to another project.
"""
import argparse
import base64
import hashlib
import html
import http.server
import json
import mimetypes
import os
import re
import shutil
import socketserver
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path
from urllib.parse import unquote, urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
TEXT_EXT = {'.html', '.htm', '.md', '.js', '.mjs', '.json', '.txt', '.xml', '.njk', '.hbs'}
SKIP_DIRS = {'node_modules', '.git', '.site-editor', '__pycache__', '.backups'}
MAX_FILE = 3_000_000
TAG = '<script src="/site-overrides.js"></script>'

ENT = {
    '&': ['&amp;'], '<': ['&lt;'], '>': ['&gt;'], '"': ['&quot;', '\\"'], "'": ['&apos;', "\\'"],
    '·': ['&middot;'], '→': ['&rarr;'], '←': ['&larr;'], '↗': ['&nearr;'], '—': ['&mdash;'],
    '–': ['&ndash;'], ' ': ['&nbsp;'], '…': ['&hellip;'], '©': ['&copy;'], '’': ['&rsquo;'],
    '‘': ['&lsquo;'], '“': ['&ldquo;'], '”': ['&rdquo;'], '×': ['&times;'], '•': ['&bull;'],
}


class Site:
    def __init__(self, name, serve, sources, port, build=None, edits=None, env=None):
        self.name, self.serve, self.sources, self.port, self.build = name, serve, sources, port, build
        self.env = env or {}
        self.edits = edits or HERE / 'edits' / (name + '.json')
        self.backups = HERE / '.backups' / name
        self.lock = threading.Lock()

    def files(self):
        out = []
        for root in self.sources:
            for p in sorted(root.rglob('*')):
                if p.is_file() and p.suffix.lower() in TEXT_EXT and not (set(p.parts) & SKIP_DIRS) and p.stat().st_size < MAX_FILE and p.name != 'site-overrides.js':
                    out.append(p)
        return out

    def log(self):
        try:
            return json.loads(self.edits.read_text(encoding='utf-8')).get('edits', [])
        except Exception:
            return []

    def save_log(self, edits):
        self.edits.parent.mkdir(parents=True, exist_ok=True)
        self.edits.write_text(json.dumps({'site': self.name, 'note': 'Owner edits. They win over any later change to the same text. Do not delete.', 'edits': edits}, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')


def load_sites():
    cfg = json.loads((HERE / 'site-editor.json').read_text(encoding='utf-8'))
    sites = {}
    for name, c in cfg['sites'].items():
        serve = ROOT / c['serve']
        sources = [ROOT / s for s in c.get('sources', [c['serve']])]
        sites[name] = Site(name, serve, sources, c.get('port', 5200), c.get('build'), env=c.get('env'))
    return sites


# ---------- matching text in source ----------

def pattern(text):
    parts = []
    for tok in re.split(r'(\s+)', text.strip()):
        if not tok:
            continue
        if tok.isspace():
            parts.append(r'(?:\s|\\n|&nbsp;)+')
            continue
        for ch in tok:
            alts = [re.escape(ch)] + [re.escape(a) for a in ENT.get(ch, [])]
            if ord(ch) > 127 or ch in '&<>"\'':
                alts += ['&#%d;' % ord(ch), '&#[xX]%x;' % ord(ch)]
            parts.append('(?:' + '|'.join(alts) + ')' if len(alts) > 1 else alts[0])
    return re.compile(r'(?<![\w])' + ''.join(parts) + r'(?![\w])')


class Hit:
    def __init__(self, file, text, start, end):
        self.file, self.text, self.start, self.end = file, text, start, end


def read(f):
    with open(f, encoding='utf-8', newline='') as fh:
        return fh.read()


def find_all(site, rx):
    hits = []
    for f in site.files():
        try:
            t = read(f)
        except Exception:
            continue
        for m in rx.finditer(t):
            hits.append(Hit(f, t, m.start(), m.end()))
    return hits


def preferred(site, page):
    rel = unquote(urlparse(page or '/').path).lstrip('/')
    served = resolve(site.serve, '/' + rel)
    if not served:
        return None
    r = served.relative_to(site.serve)
    for s in site.sources:
        c = s / r
        if c.is_file():
            return c
    return None


def html_escape(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def encode(hit, after):
    ext = hit.file.suffix.lower()
    if ext in ('.html', '.htm', '.xml', '.njk', '.hbs'):
        return html_escape(after)
    if ext == '.json':
        return json.dumps(after, ensure_ascii=False)[1:-1]
    if ext in ('.js', '.mjs'):
        t, s = hit.text, hit.start
        ls = t.rfind('\n', 0, s) + 1
        prefix = t[ls:s]
        q, opened, i = None, 0, 0
        while i < len(prefix):
            ch = prefix[i]
            if q:
                if ch == '\\':
                    i += 1
                elif ch == q:
                    q = None
            elif ch in '\'"`':
                q, opened = ch, i
            i += 1
        out = after
        if q and re.search(r'[<>]', prefix[opened:]):
            out = html_escape(out)
        out = out.replace('\\', '\\\\')
        if q:
            out = out.replace(q, '\\' + q)
        return out.replace('\n', '\\n')
    return after


def write_patch(site, entry_id, hit, new):
    rel = hit.file.relative_to(ROOT)
    bdir = site.backups / entry_id
    dest = bdir / rel
    if not dest.exists():
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(hit.file, dest)
    t = hit.text
    with open(hit.file, 'w', encoding='utf-8', newline='') as fh:
        fh.write(t[:hit.start] + new + t[hit.end:])
    return str(rel).replace('\\', '/')


def write_overrides(site):
    ov = [{'page': e.get('page', '/'), 'sel': e.get('sel'), 'idx': e.get('idx'), 'before': e['before'], 'after': e['after']} for e in site.log() if e.get('mode') == 'override']
    path = site.serve / 'site-overrides.js'
    if not ov:
        if path.exists():
            path.unlink()
        return
    js = ('/* Written by site-editor. Text the owner edited that code generates. */\n(function(){var E=' + json.dumps(ov, ensure_ascii=False) + ';\n'
          'function n(s){return s.replace(/\\s+/g," ").trim()}\n'
          'function put(node,v){var d=node.data,l=d.match(/^\\s*/)[0],r=d.match(/\\s*$/)[0];node.data=l+v+r}\n'
          'function run(){var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),x,all=[];while((x=w.nextNode()))all.push(x);\n'
          'E.forEach(function(e){if(e.page!=="*"&&e.page!==location.pathname)return;var hit=false;\n'
          'all.forEach(function(t){if(n(t.data)===e.before){put(t,e.after);hit=true}});\n'
          'if(!hit&&e.sel){try{var el=document.querySelector(e.sel);if(el){var k=[].filter.call(el.childNodes,function(c){return c.nodeType===3&&c.data.trim()})[e.idx||0];if(k&&n(k.data)!==e.after)put(k,e.after)}}catch(_){}}})}\n'
          'var busy=false;function go(){if(busy)return;busy=true;run();busy=false}\n'
          'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();\n'
          'var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(go,60)}).observe(document.documentElement,{childList:true,subtree:true,characterData:false});})();\n')
    path.write_text(js, encoding='utf-8')


def ensure_tag(site, page):
    f = preferred(site, page)
    served = resolve(site.serve, page or '/')
    if not f or not served or f != served:
        return False
    t = read(f)
    if TAG in t or 'site-overrides.js' in t:
        return True
    i = t.lower().rfind('</body>')
    t = t[:i] + '  ' + TAG + '\n' + t[i:] if i >= 0 else t + '\n' + TAG + '\n'
    with open(f, 'w', encoding='utf-8', newline='') as fh:
        fh.write(t)
    return True


def apply_edit(site, e):
    before, after = (e.get('before') or '').strip(), (e.get('after') or '').strip()
    if not before or before == after:
        return {'ok': False, 'msg': 'Nothing to change.'}
    rx = pattern(before)
    pref = preferred(site, e.get('page'))
    hits = find_all(site, rx)
    mine = [h for h in hits if pref and h.file == pref]
    pool = mine or hits
    choice = None
    total, nth = int(e.get('total') or 0), int(e.get('nth') or 0)
    if len(pool) == 1:
        choice = pool[0]
    elif len(pool) > 1:
        if mine and total == len(mine) and nth < len(mine):
            choice = mine[nth]
        elif total == len(pool) and nth < len(pool):
            choice = pool[nth]
    eid = str(int(time.time() * 1000))
    entry = {'id': eid, 'ts': time.strftime('%Y-%m-%d %H:%M:%S'), 'page': e.get('page', '/'), 'sel': e.get('sel'), 'idx': e.get('idx'), 'before': before, 'after': after}
    with site.lock:
        log = site.log()
        if choice:
            entry['mode'] = 'source'
            entry['file'] = write_patch(site, eid, choice, encode(choice, after))
            log.append(entry)
            site.save_log(log)
            return {'ok': True, 'mode': 'source', 'file': entry['file'], 'id': eid}
        entry['mode'] = 'override'
        log.append(entry)
        site.save_log(log)
        write_overrides(site)
        tagged = ensure_tag(site, e.get('page'))
        return {'ok': True, 'mode': 'override', 'tagged': tagged, 'id': eid, 'msg': 'Saved as an override: the text is built by code, so the editor keeps it in a small file.'}


def undo(site):
    with site.lock:
        log = site.log()
        if not log:
            return {'ok': False, 'msg': 'Nothing to undo.'}
        e = log.pop()
        for rel in e.get('created') or []:
            f = ROOT / rel
            if f.is_file() and inside(f, 'images'):
                f.unlink()
        if e.get('mode') in ('source', 'struct'):
            bdir = site.backups / e['id']
            for f in bdir.rglob('*'):
                if f.is_file():
                    shutil.copy2(f, ROOT / f.relative_to(bdir))
        site.save_log(log)
        write_overrides(site)
        return {'ok': True, 'msg': 'Undid: ' + e['before'][:40]}


def reapply(site):
    report = []
    with site.lock:
        log = site.log()
        for e in log:
            if e.get('mode') == 'struct':
                report.append('NOT REPLAYED  %s on %s (%s): structure edits are not re-applied; check the page' % (e.get('op'), e.get('file'), e.get('ts')))
                continue
            if e.get('mode') != 'source':
                continue
            hits = find_all(site, pattern(e['before']))
            same = [h for h in hits if str(h.file.relative_to(ROOT)).replace('\\', '/') == e.get('file')]
            hit = (same or hits)[0] if (same or len(hits) == 1) else None
            if hit:
                write_patch(site, 'reapply-' + str(int(time.time() * 1000)), hit, encode(hit, e['after']))
                report.append('applied   ' + e['before'][:50] + '  ->  ' + e['after'][:50])
            elif find_all(site, pattern(e['after'])):
                report.append('already    ' + e['after'][:60])
            else:
                e['mode'] = 'override'
                report.append('CONFLICT   "' + e['before'][:50] + '" is gone from the source; kept as an override so the owner text still wins')
        site.save_log(log)
        write_overrides(site)
    return report


def run_build(site):
    if not site.build:
        return False
    r = subprocess.run(site.build, shell=True, cwd=ROOT, capture_output=True, text=True, env={**os.environ, **site.env})
    return r.returncode == 0


# ---------- structural edits (blocks, sections, images) ----------

FROZEN = 'src/content/projects/efficient-asset-ripper.md'
IMG_EXT = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'}
MAX_IMG = 25_000_000
NEW_MD = '## New section\n\nWrite here.'
NEW_HTML = ('<section class="section">\n  <div class="section-heading">\n    <h2>New section</h2>\n'
            '    <span class="section-line"></span>\n  </div>\n  <p>Write here.</p>\n</section>')


class Refuse(Exception):
    pass


def inside(p, base):
    try:
        p.resolve().relative_to((ROOT / base).resolve())
        return True
    except ValueError:
        return False


def h6(s):
    return hashlib.md5(s.replace('\r', '').encode('utf-8')).hexdigest()[:6]


def backup(site, eid, path):
    dest = site.backups / eid / path.relative_to(ROOT)
    if not dest.exists():
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)


def locate(ref):
    file, unit, rng, inn, hsh = ref.split('|')
    rel = file.replace('\\', '/')
    if rel == FROZEN:
        raise Refuse('This page is frozen by the owner. The editor will not change it.')
    path = ROOT / rel
    if not inside(path, 'src') or path.suffix not in ('.md', '.html') or not path.is_file():
        raise Refuse('The editor only changes .md and .html files under src/.')
    s, e = map(int, rng.split('-'))
    text = read(path)
    if unit == 'l':
        seg = '\n'.join(text.split('\n')[s:e])
    else:
        if any(ord(c) > 0xFFFF for c in text):
            raise Refuse('This page has emoji; structure edits are not supported on it.')
        seg = text[s:e]
    if h6(seg) != hsh:
        raise Refuse('The source changed since this page loaded. Reload the page.')
    i = tuple(map(int, inn.split('-'))) if inn else None
    return {'rel': rel, 'path': path, 'text': text, 'unit': unit, 's': s, 'e': e, 'in': i}


def new_lines(text, block):
    cr = '\r' if '\r\n' in block['text'] else ''
    return [ln + cr for ln in text.split('\n')]


def indent_of(text, s):
    ls = text.rfind('\n', 0, s) + 1
    m = re.match(r'[ \t]*', text[ls:s])
    return m.group(0) if m and ls + len(m.group(0)) == s else ''


def splice(b, op, payload=None, other=None):
    text = b['text']
    if b['unit'] == 'l':
        lines = text.split('\n')
        blank = '\r' if '\r\n' in text else ''
        if op == 'insert':
            lines[b['e']:b['e']] = [blank] + new_lines(payload, b)
        elif op == 'replace':
            lines[b['s']:b['e']] = new_lines(payload, b)
        elif op == 'delete':
            del lines[b['s']:b['e']]
            k = b['s']
            if k < len(lines) and not lines[k].strip() and (k == 0 or not lines[k - 1].strip()):
                del lines[k]
            elif k >= len(lines):
                while lines and not lines[-1].strip():
                    lines.pop()
        elif op == 'swap':
            a, c = (b, other) if b['s'] < other['s'] else (other, b)
            lines[a['s']:c['e']] = lines[c['s']:c['e']] + lines[a['e']:c['s']] + lines[a['s']:a['e']]
        return '\n'.join(lines)
    if op == 'insert':
        ind = indent_of(text, b['s'])
        body = payload.replace('\n', '\n' + ind)
        return text[:b['e']] + '\n\n' + ind + body + text[b['e']:]
    if op == 'replace':
        i0, i1 = b['in']
        old = text[i0:i1]
        lead, trail = old[:len(old) - len(old.lstrip())], old[len(old.rstrip()):]
        return text[:i0] + lead + payload + trail + text[i1:]
    if op == 'delete':
        s, e = b['s'], b['e']
        while s > 0 and text[s - 1] in ' \t':
            s -= 1
        while e < len(text) and text[e] in ' \t':
            e += 1
        if text[e:e + 2] == '\r\n':
            e += 2
        elif text[e:e + 1] == '\n':
            e += 1
        return text[:s] + text[e:]
    a, c = (b, other) if b['s'] < other['s'] else (other, b)
    return text[:a['s']] + text[c['s']:c['e']] + text[a['e']:c['s']] + text[a['s']:a['e']] + text[c['e']:]


def asset_dir(rel):
    parts = rel.split('/')
    if parts[:2] == ['src', 'pages']:
        return 'images'
    typ, slug = parts[2], parts[3]
    slug = slug[:-3] if slug.endswith('.md') else slug
    index = ROOT / 'src' / 'content' / typ / slug / 'index.md'
    item = index if index.is_file() else ROOT / rel
    m = re.search(r'^assets:\s*(.+?)\s*$', read(item).split('\n---', 1)[0], re.M)
    if m:
        return m.group(1).strip('\'"').rstrip('/')
    return ('images/design/' if typ == 'design' else 'images/projects/') + slug


def save_image(rel, name, data):
    raw = base64.b64decode(data)
    if len(raw) > MAX_IMG:
        raise Refuse('Image is larger than 25 MB.')
    stem, ext = os.path.splitext(os.path.basename(name or 'image'))
    ext = ext.lower()
    if ext not in IMG_EXT:
        raise Refuse('Use a png, jpg, gif, webp, svg or avif image.')
    stem = re.sub(r'[^a-z0-9]+', '-', stem.lower()).strip('-') or 'image'
    folder = ROOT / asset_dir(rel)
    if not inside(folder, 'images'):
        raise Refuse('Asset folder is outside images/.')
    folder.mkdir(parents=True, exist_ok=True)
    final, n = stem + ext, 1
    while (folder / final).exists():
        n += 1
        final = '%s-%d%s' % (stem, n, ext)
    (folder / final).write_bytes(raw)
    return final, (folder / final)


def struct_op(site, body):
    op = body.get('op')
    with site.lock:
        try:
            b = locate(body['ref'])
            other = locate(body['ref2']) if body.get('ref2') else None
            if other and other['path'] != b['path']:
                raise Refuse('Blocks are in different files.')
            eid = str(int(time.time() * 1000))
            md = b['unit'] == 'l'
            created = []
            if op == 'insert':
                text = splice(b, 'insert', NEW_MD if md else NEW_HTML)
                summary = 'insert section'
            elif op == 'image':
                alt = re.sub(r'[\[\]\r\n]', ' ', body.get('alt') or '').strip()
                final, dest = save_image(b['rel'], body.get('name'), body.get('data', ''))
                created.append(str(dest.relative_to(ROOT)).replace('\\', '/'))
                if md:
                    snippet = '![%s](%s)' % (alt, final)
                else:
                    snippet = ('<div class="shot-gallery shots-1col">\n  <figure>\n    <img src="images/%s" alt="%s" loading="lazy" />\n  </figure>\n</div>'
                               % (final, html.escape(alt, quote=True)))
                text = splice(b, 'insert', snippet)
                summary = 'insert image ' + final
            elif op == 'delete':
                text = splice(b, 'delete')
                summary = 'delete block'
            elif op == 'swap':
                if not other:
                    raise Refuse('Nothing to swap with.')
                text = splice(b, 'swap', other=other)
                summary = 'move block'
            elif op == 'replace':
                if not md and not b['in']:
                    raise Refuse('This element cannot be edited as rich text.')
                text = splice(b, 'replace', body.get('text', ''))
                summary = 'format text'
            else:
                raise Refuse('Unknown edit.')
            backup(site, eid, b['path'])
            with open(b['path'], 'w', encoding='utf-8', newline='') as fh:
                fh.write(text)
            log = site.log()
            log.append({'id': eid, 'ts': time.strftime('%Y-%m-%d %H:%M:%S'), 'mode': 'struct', 'op': op, 'file': b['rel'],
                        'created': created, 'before': summary, 'after': summary, 'page': body.get('page', '/')})
            site.save_log(log)
            return {'ok': True, 'msg': summary.capitalize()}
        except Refuse as ex:
            return {'ok': False, 'msg': str(ex)}
        except (ValueError, KeyError, IndexError):
            return {'ok': False, 'msg': 'Could not read that block. Reload the page.'}


# ---------- server ----------

def resolve(serve, path):
    p = (serve / path.lstrip('/')).resolve()
    if serve != p and serve not in p.parents:
        return None
    if p.is_dir():
        p = p / 'index.html'
    if not p.exists() and p.with_suffix('.html').exists():
        p = p.with_suffix('.html')
    return p if p.is_file() else None


class Handler(http.server.BaseHTTPRequestHandler):
    site = None

    def log_message(self, *a):
        pass

    def send(self, code, body, ctype='text/html; charset=utf-8'):
        if isinstance(body, str):
            body = body.encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = unquote(urlparse(self.path).path)
        if path == '/__editor/editor.js':
            return self.send(200, (HERE / 'editor.js').read_text(encoding='utf-8'), 'text/javascript; charset=utf-8')
        if path == '/__editor/edits':
            return self.send(200, json.dumps(self.site.log()), 'application/json')
        f = resolve(self.site.serve, path)
        if not f and self.site.env.get('SE_PREVIEW') and (path.startswith('/images/') or path == '/resume.pdf'):
            f = resolve(ROOT, path)
        if not f:
            return self.send(404, 'Not found')
        data = f.read_bytes()
        ctype = mimetypes.guess_type(str(f))[0] or 'application/octet-stream'
        if f.suffix.lower() in ('.html', '.htm'):
            t = data.decode('utf-8', 'replace')
            tag = '<script src="/__editor/editor.js"></script>'
            i = t.lower().rfind('</body>')
            t = t[:i] + tag + t[i:] if i >= 0 else t + tag
            return self.send(200, t, 'text/html; charset=utf-8')
        self.send(200, data, ctype)

    def do_POST(self):
        path = urlparse(self.path).path
        n = int(self.headers.get('Content-Length') or 0)
        if n > 40_000_000:
            return self.send(413, '{}', 'application/json')
        body = json.loads(self.rfile.read(n) or b'{}')
        if path == '/__editor/save':
            res = [apply_edit(self.site, e) for e in body.get('edits', [])]
            built = False
            if any(r.get('mode') == 'source' for r in res):
                built = run_build(self.site)
            return self.send(200, json.dumps({'results': res, 'rebuilt': built}), 'application/json')
        if path == '/__editor/op':
            r = struct_op(self.site, body)
            r['rebuilt'] = run_build(self.site) if r['ok'] else False
            return self.send(200, json.dumps(r), 'application/json')
        if path == '/__editor/undo':
            r = undo(self.site)
            r['rebuilt'] = run_build(self.site)
            return self.send(200, json.dumps(r), 'application/json')
        self.send(404, '{}', 'application/json')


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('site', nargs='?')
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--reapply', action='store_true')
    ap.add_argument('--serve')
    ap.add_argument('--sources', nargs='*')
    ap.add_argument('--edits')
    ap.add_argument('--build')
    ap.add_argument('--port', type=int)
    ap.add_argument('--no-open', action='store_true')
    a = ap.parse_args()
    if a.list:
        for n, s in load_sites().items():
            print('%-14s port %d  serves %s' % (n, s.port, s.serve.relative_to(ROOT)))
        return
    if a.serve:
        serve = Path(a.serve).resolve()
        site = Site('adhoc', serve, [Path(s).resolve() for s in (a.sources or [a.serve])], a.port or 5200, a.build, Path(a.edits).resolve() if a.edits else HERE / 'edits' / 'adhoc.json')
    else:
        sites = load_sites()
        if a.site not in sites:
            sys.exit('Choose a site: ' + ', '.join(sites) + '   (or use --serve DIR)')
        site = sites[a.site]
        if a.port:
            site.port = a.port
    if a.reapply:
        for line in reapply(site) or ['no source edits logged']:
            print(line)
        return
    Handler.site = site
    if site.env.get('SE_PREVIEW'):
        run_build(site)
    srv = Server(('127.0.0.1', site.port), Handler)
    url = 'http://127.0.0.1:%d/' % site.port
    print('Editing %s at %s  (double-click any text; Ctrl+C to stop)' % (site.name, url))
    if not a.no_open:
        webbrowser.open(url)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
