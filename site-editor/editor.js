/* Site editor, browser side. Editing starts off. Double-click text to edit it; hover a block for its controls. */
(() => {
  if (window.__siteEditor) return;
  window.__siteEditor = true;
  const API = '/__editor/';
  let on = false;
  let cur = null;
  let rich = null;

  const style = document.createElement('style');
  style.textContent = `
    #se-bar,#se-fmt,#se-h{z-index:2147483000;display:flex;gap:6px;align-items:center;padding:6px 8px;background:#101216;color:#e8eaf0;border:1px solid #3a3f4d;border-radius:10px;font:600 12px/1.2 system-ui,Segoe UI,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45)}
    #se-bar{position:fixed;left:50%;bottom:44px;transform:translateX(-50%);padding:7px 10px;gap:8px;max-width:94vw}
    #se-fmt{position:fixed;display:none;flex-wrap:wrap;max-width:94vw}
    #se-h{position:absolute;display:none;padding:3px 4px;gap:3px;border-radius:7px}
    #se-bar button,#se-fmt button,#se-h button{font:inherit;color:inherit;background:#1d212a;border:1px solid #3a3f4d;border-radius:6px;padding:4px 8px;cursor:pointer}
    #se-bar button:hover,#se-fmt button:hover,#se-h button:hover{border-color:#fc314f}
    #se-bar button.on,#se-fmt button.on{background:#fc314f;border-color:#fc314f;color:#fff}
    #se-fmt i{width:1px;height:18px;background:#3a3f4d}
    #se-msg{opacity:.85;font-weight:500;min-width:6em}
    body.se-on .se-hover{outline:1.5px dashed #fc314f !important;outline-offset:1px;cursor:text !important}
    body.se-on .se-blk{outline:1.5px solid rgba(252,49,79,.7) !important;outline-offset:2px}
    [data-se-edit]{outline:2px solid #fc314f !important;outline-offset:2px;background:rgba(252,49,79,.12);cursor:text;white-space:pre-wrap}
    [data-se-rich-on]{outline:2px solid #fc314f !important;outline-offset:3px;background:rgba(252,49,79,.08);cursor:text}
  `;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.id = 'se-bar';
  bar.innerHTML = '<button id="se-t" title="Turn editing on or off. Off lets you click around the site.">Editing: off</button><button id="se-title" title="Edit the page title shown in the tab">Page title</button><button id="se-undo" title="Undo the last saved edit">Undo</button><span id="se-msg">Editing is off. Click Editing to start.</span>';
  document.body.appendChild(bar);

  const fmt = document.createElement('div');
  fmt.id = 'se-fmt';
  document.body.appendChild(fmt);

  const handle = document.createElement('div');
  handle.id = 'se-h';
  document.body.appendChild(handle);

  const file = document.createElement('input');
  file.type = 'file';
  file.accept = 'image/*';
  file.style.display = 'none';
  document.body.appendChild(file);

  const msg = t => { document.getElementById('se-msg').textContent = t; };
  const norm = s => s.replace(/\s+/g, ' ').trim();
  const UI = '#se-bar,#se-fmt,#se-h';

  function textNodes() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement && !n.parentElement.closest(UI + ',script,style,noscript,textarea') && n.data.trim()) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    const out = []; let n; while ((n = w.nextNode())) out.push(n);
    return out;
  }
  function selOf(el) {
    const parts = [];
    while (el && el !== document.body && el.nodeType === 1) {
      let p = el.tagName.toLowerCase();
      if (el.id) { parts.unshift(p + '#' + CSS.escape(el.id)); break; }
      const cls = [...el.classList].filter(c => !c.startsWith('se-')).slice(0, 2);
      if (cls.length) p += '.' + cls.map(c => CSS.escape(c)).join('.');
      const sib = [...el.parentNode.children].filter(c => c.tagName === el.tagName);
      if (sib.length > 1) p += ':nth-of-type(' + (sib.indexOf(el) + 1) + ')';
      parts.unshift(p); el = el.parentElement;
    }
    return parts.join(' > ');
  }
  function nodeAt(x, y, target) {
    let node = null;
    if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (p) node = p.offsetNode; }
    else if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); if (r) node = r.startContainer; }
    if (node && node.nodeType === 3 && node.data.trim() && !node.parentElement.closest(UI + ',script,style,textarea')) {
      const r = document.createRange(); r.selectNodeContents(node);
      const box = [...r.getClientRects()].some(b => x >= b.left - 6 && x <= b.right + 6 && y >= b.top - 6 && y <= b.bottom + 6);
      if (box) return node;
    }
    const w = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { if (n.data.trim() && !n.parentElement.closest(UI + ',script,style,textarea')) return n; }
    return null;
  }

  async function post(path, body) {
    const r = await fetch(API + path, { method: 'POST', body: JSON.stringify(body) });
    return r.json();
  }
  const reload = () => { try { sessionStorage.setItem('se-on', '1'); } catch (e) {} location.reload(); };
  async function refreshRefs() {
    try {
      const html = await (await fetch(location.href, { cache: 'no-store' })).text();
      const next = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('[data-se]')];
      const now = [...document.querySelectorAll('[data-se]')];
      if (next.length !== now.length) return reload();
      now.forEach((n, i) => n.setAttribute('data-se', next[i].getAttribute('data-se')));
    } catch (e) { reload(); }
  }
  async function send(info) {
    msg('Saving...');
    try {
      const r = await post('save', { edits: [info] });
      const x = r.results[0];
      if (!x.ok) { msg(x.msg || 'Not saved'); return false; }
      msg(x.mode === 'source' ? 'Saved to ' + x.file : x.msg);
      if (r.rebuilt) await refreshRefs();
      return true;
    } catch (e) { msg('Could not reach the editor server'); return false; }
  }
  async function op(body) {
    msg('Saving...');
    try {
      const r = await post('op', { ...body, page: location.pathname });
      msg(r.msg);
      if (r.ok) setTimeout(reload, 300);
    } catch (e) { msg('Could not reach the editor server'); }
  }



  function startEdit(node) {
    const parent = node.parentNode, orig = node.data, before = norm(orig);
    const same = textNodes().filter(n => norm(n.data) === before);
    const info = {
      before, page: location.pathname, sel: selOf(parent), total: same.length, nth: same.indexOf(node),
      idx: [...parent.childNodes].filter(n => n.nodeType === 3 && n.data.trim()).indexOf(node),
    };
    const span = document.createElement('span');
    span.setAttribute('data-se-edit', '');
    span.contentEditable = 'plaintext-only';
    if (span.contentEditable !== 'plaintext-only') span.contentEditable = 'true';
    span.textContent = orig;
    parent.replaceChild(span, node);
    span.focus();
    const r = document.createRange(); r.selectNodeContents(span);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    const session = String(Date.now());
    let last = before, done = false, timer = null, chain = Promise.resolve();
    const flush = () => {
      clearTimeout(timer);
      chain = chain.then(async () => {
        const val = norm(span.textContent.replace(/\u00a0/g, ' '));
        if (!val || val === last) return;
        if (await send({ ...info, before: last, after: val, session })) { last = val; info.total = 1; info.nth = 0; }
      });
      return chain;
    };
    span.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(flush, 600); });
    const finish = () => {
      if (done) return;
      done = true;
      const val = span.textContent.replace(/\u00a0/g, ' ');
      parent.replaceChild(document.createTextNode(val.trim() ? val : orig), span);
      flush();
    };
    span.addEventListener('blur', () => finish());
    span.addEventListener('keydown', k => {
      if (k.key === 'Escape' || (k.key === 'Enter' && !k.shiftKey)) { k.preventDefault(); finish(); }
      k.stopPropagation();
    });
    span.addEventListener('paste', k => { k.preventDefault(); document.execCommand('insertText', false, (k.clipboardData || window.clipboardData).getData('text')); });
  }

  /* blocks */

  const isMd = el => el.getAttribute('data-se').split('|')[1] === 'l';
  const MD_RICH = /^(p|ul|ol|quote|h[2-6])$/;
  const canRich = el => el.hasAttribute('data-se-rich') || (isMd(el) && MD_RICH.test(el.dataset.seKind || ''));
  const role = el => el.dataset.seRole;
  const fileOf = el => el.getAttribute('data-se').split('|')[0];
  const sibling = (el, dir) => {
    for (let n = dir < 0 ? el.previousElementSibling : el.nextElementSibling; n; n = dir < 0 ? n.previousElementSibling : n.nextElementSibling) {
      if (n.hasAttribute('data-se') && (role(n) === 'sec' || role(n) === 'top') && fileOf(n) === fileOf(el)) return n;
    }
    return null;
  };

  function place(el) {
    cur = el;
    document.querySelectorAll('.se-blk').forEach(n => n.classList.remove('se-blk'));
    if (!el) { handle.style.display = 'none'; return; }
    el.classList.add('se-blk');
    const r = el.getBoundingClientRect();
    const btn = (id, label, title) => `<button data-a="${id}" title="${title}">${label}</button>`;
    const struct = role(el) === 'sec' || role(el) === 'top';
    handle.innerHTML =
      (canRich(el) ? btn('edit', 'Edit', 'Edit this text with formatting (or double-click)') : '') +
      (struct ? btn('up', '↑', 'Move up') + btn('down', '↓', 'Move down') + btn('section', '+ section', 'Add a section after this block') : '') +
      btn('image', '+ image', 'Add an image after this block (or drop or paste one)') + btn('del', '✕', 'Delete this block');
    handle.style.display = 'flex';
    handle.style.top = Math.max(0, r.top + scrollY - 2) + 'px';
    handle.style.left = Math.max(4, r.right + scrollX - handle.offsetWidth) + 'px';
  }

  handle.addEventListener('mousedown', e => e.preventDefault());
  handle.addEventListener('click', e => {
    const a = e.target.closest('button');
    if (!a || !cur) return;
    const el = cur, ref = el.getAttribute('data-se');
    const k = a.dataset.a;
    if (k === 'edit') startRich(el);
    else if (k === 'section') op({ op: 'insert', ref });
    else if (k === 'image') { file.onchange = () => file.files[0] && addImage(el, file.files[0]); file.value = ''; file.click(); }
    else if (k === 'del') { if (confirm('Delete this block from the source? Undo can bring it back.')) op({ op: 'delete', ref }); }
    else { const o = sibling(el, k === 'up' ? -1 : 1); if (!o) msg('Already at the ' + (k === 'up' ? 'top' : 'end')); else op({ op: 'swap', ref, ref2: o.getAttribute('data-se') }); }
  });

  function readFile(f) {
    return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(f); });
  }
  async function addImage(el, f) {
    if (!/^image\//.test(f.type)) return msg('That is not an image');
    const stem = (f.name || 'pasted-image.png').replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    const alt = prompt('Alt text for the image (describe it):', stem);
    if (alt === null) return msg('Image cancelled');
    const name = f.name && /\.\w+$/.test(f.name) ? f.name : 'pasted-image.' + (f.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
    op({ op: 'image', ref: el.getAttribute('data-se'), name, alt, data: await readFile(f) });
  }

  /* rich text edit */

  const KINDS = { p: 'P', h2: 'H2', h3: 'H3', ul: '• List', ol: '1. List', quote: 'Quote' };

  function inlineMd(node) {
    let o = '';
    node.childNodes.forEach(c => {
      if (c.nodeType === 3) { o += c.data.replace(/[ ]/g, ' ').replace(/</g, '&lt;'); return; }
      if (c.nodeType !== 1) return;
      const t = c.tagName, inner = inlineMd(c);
      const wrap = m => { const l = inner.match(/^\s*/)[0], r = inner.match(/\s*$/)[0], core = inner.trim(); return core ? l + m + core + m + r : inner; };
      if (t === 'STRONG' || t === 'B') o += wrap('**');
      else if (t === 'EM' || t === 'I') o += wrap('*');
      else if (t === 'CODE') o += wrap('`');
      else if (t === 'A' && c.getAttribute('href')) o += '[' + inner + '](' + c.getAttribute('href') + ')';
      else if (t === 'BR') o += ' ';
      else if (t === 'IMG') o += '![' + (c.getAttribute('alt') || '') + '](' + c.getAttribute('src') + ')';
      else o += inner + (/^(P|DIV|LI)$/.test(t) ? ' ' : '');
    });
    return o;
  }
  function inlineHtml(node) {
    let o = '';
    node.childNodes.forEach(c => {
      if (c.nodeType === 3) { o += c.data.replace(/[ ]/g, ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); return; }
      if (c.nodeType !== 1) return;
      const t = c.tagName, inner = inlineHtml(c);
      if (t === 'STRONG' || t === 'B') o += '<strong>' + inner + '</strong>';
      else if (t === 'EM' || t === 'I') o += '<em>' + inner + '</em>';
      else if (t === 'CODE') o += '<code>' + inner + '</code>';
      else if (t === 'A' && c.getAttribute('href')) o += '<a href="' + c.getAttribute('href').replace(/"/g, '&quot;') + '"' + (c.getAttribute('target') ? ' target="' + c.getAttribute('target') + '"' : '') + '>' + inner + '</a>';
      else if (t === 'BR') o += '<br />';
      else o += inner;
    });
    return o;
  }
  function serialize(el, kind, md) {
    if (!md) return inlineHtml(el).replace(/\s+/g, ' ').trim();
    const items = (el.tagName === 'UL' || el.tagName === 'OL')
      ? [...el.children].map(li => norm(inlineMd(li))).filter(Boolean)
      : [norm(inlineMd(el))].filter(Boolean);
    if (!items.length) return '';
    if (kind === 'h2') return '## ' + items.join(' ');
    if (kind === 'h3') return '### ' + items.join(' ');
    if (kind === 'ul') return items.map(i => '- ' + i).join('\n');
    if (kind === 'ol') return items.map((i, n) => (n + 1) + '. ' + i).join('\n');
    if (kind === 'quote') return '> ' + items.join(' ');
    return items.join('\n\n');
  }

  function wrapCode() {
    const s = getSelection();
    if (!s.rangeCount) return;
    const anc = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement).closest('code');
    if (anc) { anc.replaceWith(...anc.childNodes); return; }
    const r = s.getRangeAt(0);
    if (r.collapsed) return;
    const c = document.createElement('code');
    c.appendChild(r.extractContents());
    r.insertNode(c);
  }
  function link() {
    const u = prompt('Link address (leave empty to remove the link):', 'https://');
    if (u === null) return;
    if (!u.trim() || u.trim() === 'https://') document.execCommand('unlink');
    else document.execCommand('createLink', false, u.trim());
  }

  function startRich(el) {
    if (rich) return;
    place(null);
    const md = isMd(el), ref = el.getAttribute('data-se');
    const start = el.dataset.seKind;
    let kind = md ? start : 'p';
    const session = String(Date.now());
    let ref0 = ref, last = serialize(el, kind, md), lastKind = kind, timer = null, chain = Promise.resolve(), needsReload = false;
    el.setAttribute('data-se-rich-on', '');
    el.contentEditable = 'true';
    rich = el;

    const btns = [['bold', 'B', 'Bold (Ctrl+B)', () => document.execCommand('bold')], ['italic', 'I', 'Italic (Ctrl+I)', () => document.execCommand('italic')],
      ['code', '</>', 'Inline code', wrapCode], ['link', 'Link', 'Link (Ctrl+K)', link]];
    fmt.innerHTML = btns.map(b => `<button data-c="${b[0]}" title="${b[2]}">${b[1]}</button>`).join('') +
      (md ? '<i></i>' + Object.keys(KINDS).map(k => `<button data-k="${k}" class="${k === kind ? 'on' : ''}">${KINDS[k]}</button>`).join('') : '') +
      '<i></i><button data-c="save">Done</button><span style="opacity:.7;font-weight:500">saves as you type</span>';
    fmt.style.display = 'flex';
    const r = el.getBoundingClientRect();
    fmt.style.left = Math.max(4, Math.min(r.left, innerWidth - fmt.offsetWidth - 4)) + 'px';
    fmt.style.top = (r.top > fmt.offsetHeight + 12 ? r.top - fmt.offsetHeight - 8 : r.bottom + 8) + 'px';
    el.focus();
    let done = false;
    const save = () => {
      clearTimeout(timer);
      chain = chain.then(async () => {
        const text = serialize(el, kind, md);
        if (!text || (text === last && kind === lastKind)) return;
        msg('Saving...');
        try {
          const r = await post('op', { op: 'replace', ref: ref0, text, session, page: location.pathname });
          if (!r.ok) return msg(r.msg);
          last = text;
          lastKind = kind;
          if (kind !== start) needsReload = true;
          await refreshRefs();
          ref0 = el.getAttribute('data-se');
          msg('Saved');
        } catch (e) { msg('Could not reach the editor server'); }
      });
      return chain;
    };
    el.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(save, 600); });
    const finish = async () => {
      if (done) return;
      done = true;
      await save();
      rich = null;
      fmt.style.display = 'none';
      el.removeAttribute('data-se-rich-on');
      el.removeAttribute('contenteditable');
      if (needsReload) reload();
    };
    const onFmt = e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.k) { kind = b.dataset.k; fmt.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('on', x === b)); finish(); return; }
      const c = b.dataset.c;
      if (c === 'save') return finish();
      btns.find(x => x[0] === c)[3]();
    };
    fmt.onmousedown = e => e.preventDefault();
    fmt.onclick = onFmt;
    el.addEventListener('keydown', k => {
      const list = el.tagName === 'UL' || el.tagName === 'OL';
      if (k.key === 'Escape') { k.preventDefault(); finish(); }
      else if (k.key === 'Enter' && (!list || k.ctrlKey)) { k.preventDefault(); finish(); }
      else if ((k.ctrlKey || k.metaKey) && k.key.toLowerCase() === 'k') { k.preventDefault(); link(); }
      k.stopPropagation();
    });
    el.addEventListener('paste', k => { k.preventDefault(); document.execCommand('insertText', false, (k.clipboardData || window.clipboardData).getData('text')); });
    el.addEventListener('focusout', e => { if (!e.relatedTarget || !fmt.contains(e.relatedTarget)) setTimeout(() => finish(), 120); });
    msg('Saves as you type. Ctrl+B bold, Ctrl+I italic, Enter or Done to finish');
  }

  /* wiring */

  const inUi = t => t.closest(UI + ',[data-se-edit],[data-se-rich-on]');

  document.addEventListener('dblclick', e => {
    if (!on || inUi(e.target)) return;
    const blk = e.target.closest('[data-se]');
    if (blk && canRich(blk)) { e.preventDefault(); e.stopImmediatePropagation(); startRich(blk); return; }
    const node = nodeAt(e.clientX, e.clientY, e.target);
    if (!node) return;
    e.preventDefault(); e.stopImmediatePropagation();
    startEdit(node);
  }, true);

  document.addEventListener('click', e => {
    if (!on || e.altKey || inUi(e.target)) return;
    e.preventDefault(); e.stopPropagation();
  }, true);
  document.addEventListener('submit', e => { if (on) e.preventDefault(); }, true);

  let hov = null;
  document.addEventListener('mouseover', e => {
    if (hov) hov.classList.remove('se-hover');
    hov = null;
    if (!on || e.target.closest(UI) || rich) return;
    const t = e.target;
    if ([...t.childNodes].some(n => n.nodeType === 3 && n.data.trim())) { hov = t; t.classList.add('se-hover'); }
    const blk = t.closest('[data-se]');
    if (blk !== cur) place(blk);
  });

  document.addEventListener('dragover', e => { if (on && [...(e.dataTransfer.types || [])].includes('Files')) e.preventDefault(); });
  document.addEventListener('drop', e => {
    const f = e.dataTransfer && e.dataTransfer.files[0];
    if (!on || !f) return;
    e.preventDefault();
    const blk = e.target.closest && e.target.closest('[data-se]');
    if (!blk) return msg('Drop the image onto a block');
    addImage(blk, f);
  });
  document.addEventListener('paste', e => {
    if (!on || rich || e.target.closest('[data-se-edit]')) return;
    const f = [...((e.clipboardData && e.clipboardData.files) || [])].find(x => /^image\//.test(x.type));
    if (!f) return;
    e.preventDefault();
    if (!cur) return msg('Hover a block first, then paste');
    addImage(cur, f);
  });

  const setOn = v => {
    on = v;
    const b = document.getElementById('se-t');
    b.classList.toggle('on', on);
    b.textContent = 'Editing: ' + (on ? 'on' : 'off');
    document.body.classList.toggle('se-on', on);
    if (!on) place(null);
    msg(on ? 'Double-click text to edit. Changes save as you type. Hover a block for its controls.' : 'Editing is off. Click around, then turn it back on.');
  };
  document.getElementById('se-t').onclick = () => setOn(!on);
  try { if (sessionStorage.getItem('se-on')) { sessionStorage.removeItem('se-on'); setOn(true); } } catch (e) {}
  document.getElementById('se-title').onclick = () => {
    const old = document.title, t = prompt('Page title (the text on the browser tab):', old);
    if (t && t.trim() && t.trim() !== old.trim()) { document.title = t.trim(); send({ before: norm(old), after: norm(t), page: location.pathname, total: 1, nth: 0 }); }
  };
  document.getElementById('se-undo').onclick = async () => {
    try {
      const r = await post('undo', {});
      msg(r.msg); if (r.ok) setTimeout(reload, 400);
    } catch (e) { msg('Could not reach the editor server'); }
  };
})();
