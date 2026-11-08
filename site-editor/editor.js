/* Site text editor, browser side. Double-click any text to edit it. Enter saves, Esc cancels. */
(() => {
  if (window.__siteEditor) return;
  window.__siteEditor = true;
  const API = '/__editor/';
  let on = true;

  const style = document.createElement('style');
  style.textContent = `
    #se-bar{position:fixed;left:50%;bottom:44px;transform:translateX(-50%);z-index:2147483000;display:flex;gap:8px;align-items:center;padding:7px 10px;background:#101216;color:#e8eaf0;border:1px solid #3a3f4d;border-radius:10px;font:600 12px/1.2 system-ui,Segoe UI,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45);max-width:94vw}
    #se-bar button{font:inherit;color:inherit;background:#1d212a;border:1px solid #3a3f4d;border-radius:6px;padding:5px 9px;cursor:pointer}
    #se-bar button:hover{border-color:#fc314f}
    #se-bar button.on{background:#fc314f;border-color:#fc314f;color:#fff}
    #se-msg{opacity:.85;font-weight:500;min-width:6em}
    body.se-on .se-hover{outline:1.5px dashed #fc314f !important;outline-offset:1px;cursor:text !important}
    [data-se-edit]{outline:2px solid #fc314f !important;outline-offset:2px;background:rgba(252,49,79,.12);cursor:text;white-space:pre-wrap}
  `;
  document.head.appendChild(style);
  document.body.classList.add('se-on');

  const bar = document.createElement('div');
  bar.id = 'se-bar';
  bar.innerHTML = '<button id="se-t" class="on" title="Turn editing on or off. Off lets you click around the site.">Editing: on</button><button id="se-title" title="Edit the page title shown in the tab">Page title</button><button id="se-undo" title="Undo the last saved edit">Undo</button><span id="se-msg">Double-click any text to edit it</span>';
  document.body.appendChild(bar);
  const msg = t => { document.getElementById('se-msg').textContent = t; };
  const norm = s => s.replace(/\s+/g, ' ').trim();

  function textNodes() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement && !n.parentElement.closest('#se-bar,script,style,noscript,textarea') && n.data.trim()) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
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
    if (node && node.nodeType === 3 && node.data.trim() && !node.parentElement.closest('#se-bar,script,style,textarea')) {
      const r = document.createRange(); r.selectNodeContents(node);
      const box = [...r.getClientRects()].some(b => x >= b.left - 6 && x <= b.right + 6 && y >= b.top - 6 && y <= b.bottom + 6);
      if (box) return node;
    }
    const w = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { if (n.data.trim() && !n.parentElement.closest('#se-bar,script,style,textarea')) return n; }
    return null;
  }

  async function send(info) {
    msg('Saving...');
    try {
      const r = await (await fetch(API + 'save', { method: 'POST', body: JSON.stringify({ edits: [info] }) })).json();
      const x = r.results[0];
      if (!x.ok) msg(x.msg || 'Not saved');
      else if (x.mode === 'source') msg('Saved to ' + x.file);
      else msg(x.msg);
      if (r.rebuilt) setTimeout(() => location.reload(), 300);
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
    let done = false;
    const finish = save => {
      if (done) return; done = true;
      const val = span.textContent.replace(/ /g, ' ');
      parent.replaceChild(document.createTextNode(save ? val : orig), span);
      if (save && norm(val) !== before) { info.after = norm(val); send(info); }
      else msg('No change');
    };
    span.addEventListener('blur', () => finish(true));
    span.addEventListener('keydown', k => {
      if (k.key === 'Escape') { k.preventDefault(); finish(false); }
      else if (k.key === 'Enter' && !k.shiftKey) { k.preventDefault(); finish(true); }
      k.stopPropagation();
    });
    span.addEventListener('paste', k => { k.preventDefault(); document.execCommand('insertText', false, (k.clipboardData || window.clipboardData).getData('text')); });
  }

  document.addEventListener('dblclick', e => {
    if (!on || e.target.closest('#se-bar') || e.target.closest('[data-se-edit]')) return;
    const node = nodeAt(e.clientX, e.clientY, e.target);
    if (!node) return;
    e.preventDefault(); e.stopImmediatePropagation();
    startEdit(node);
  }, true);

  document.addEventListener('click', e => {
    if (!on || e.altKey || e.target.closest('#se-bar') || e.target.closest('[data-se-edit]')) return;
    e.preventDefault(); e.stopPropagation();
  }, true);
  document.addEventListener('submit', e => { if (on) e.preventDefault(); }, true);

  let hov = null;
  document.addEventListener('mouseover', e => {
    if (hov) hov.classList.remove('se-hover');
    hov = null;
    if (!on || e.target.closest('#se-bar')) return;
    const t = e.target;
    if ([...t.childNodes].some(n => n.nodeType === 3 && n.data.trim())) { hov = t; t.classList.add('se-hover'); }
  });

  document.getElementById('se-t').onclick = ev => {
    on = !on; ev.target.classList.toggle('on', on); ev.target.textContent = 'Editing: ' + (on ? 'on' : 'off');
    document.body.classList.toggle('se-on', on);
    msg(on ? 'Double-click any text to edit it' : 'Editing is off. Click around, then turn it back on.');
  };
  document.getElementById('se-title').onclick = () => {
    const old = document.title, t = prompt('Page title (the text on the browser tab):', old);
    if (t && t.trim() && t.trim() !== old.trim()) { document.title = t.trim(); send({ before: norm(old), after: norm(t), page: location.pathname, total: 1, nth: 0 }); }
  };
  document.getElementById('se-undo').onclick = async () => {
    try {
      const r = await (await fetch(API + 'undo', { method: 'POST', body: '{}' })).json();
      msg(r.msg); if (r.ok) setTimeout(() => location.reload(), 400);
    } catch (e) { msg('Could not reach the editor server'); }
  };
})();
