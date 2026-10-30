// Starred items: localStorage['nls-starred'] = [{ id, title, href, img }].
// Progressive enhancement — the star UI stays display:none until <html class="js">.
(() => {
  const KEY = 'nls-starred';

  const load = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };
  const save = (items) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  };

  document.documentElement.classList.add('js');

  const menu = document.querySelector('.starred');
  const toggle = menu && menu.querySelector('.starred-toggle');
  const panel = menu && menu.querySelector('.starred-panel');
  const list = menu && menu.querySelector('.starred-list');
  const empty = menu && menu.querySelector('.starred-empty');
  const count = menu && menu.querySelector('.starred-count');

  // a starred item's own button hides; it lives in the floating list only
  function syncButtons() {
    const items = load();
    for (const btn of document.querySelectorAll('.star-btn')) {
      const on = items.some((s) => s.id === btn.dataset.starId);
      btn.classList.toggle('starred', on);
      btn.setAttribute('aria-pressed', String(on));
    }
  }

  function renderPanel() {
    if (!menu) return;
    const items = load();
    menu.classList.toggle('has-items', items.length > 0);
    count.hidden = !items.length;
    count.textContent = items.length;
    empty.hidden = items.length > 0;
    list.textContent = '';
    for (const s of items) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.href;
      if (s.img) {
        const img = document.createElement('img');
        img.src = s.img;
        img.alt = '';
        img.loading = 'lazy';
        a.appendChild(img);
      }
      const label = document.createElement('span');
      label.textContent = s.title;
      a.appendChild(label);
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'starred-remove';
      rm.setAttribute('aria-label', 'Remove ' + s.title);
      rm.textContent = '×';
      rm.addEventListener('click', () => {
        save(load().filter((x) => x.id !== s.id));
        renderPanel();
        syncButtons();
      });
      li.append(a, rm);
      list.appendChild(li);
    }
  }

  function closePanel() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.star-btn');
    if (!btn) return;
    e.preventDefault();
    const d = btn.dataset;
    const items = load();
    const i = items.findIndex((s) => s.id === d.starId);
    if (i >= 0) items.splice(i, 1);
    else items.push({ id: d.starId, title: d.starTitle, href: d.starHref, img: d.starImg || '' });
    save(items);
    renderPanel();
    syncButtons();
  });

  if (menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      if (open) renderPanel();
    });
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open') && !menu.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) closePanel();
    });
  }

  // another tab starred something
  addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    renderPanel();
    syncButtons();
  });

  renderPanel();
  syncButtons();
})();
