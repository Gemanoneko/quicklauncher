/* Region window behaviour (regions spec 2.1, 3.2, 4, 7). Loaded after app.js:
   the grid itself is app.js, unchanged; this file adds what makes the page a
   region. It uses app.js globals at call time: apps, renderGrid,
   enterEditMode, exitEditMode, clearFilter, startRename, removeApp,
   addAppFromDialog.
   global api, apps, renderGrid, enterEditMode, exitEditMode, clearFilter,
   startRename, removeApp, addAppFromDialog */
(function () {
  'use strict';
  const api = window.api;
  const params = new URLSearchParams(location.search);
  const body = document.body;
  body.classList.add('region', 'layout-grid');
  // An Explorer restart rebuilt this window: no entrance fade (spec 1).
  if (params.get('rebuilt') === '1') body.classList.add('no-entrance');

  const $ = (id) => document.getElementById(id);
  const elHeader = $('header');
  const elTitleArea = $('title-area');
  const elTitle = $('title');
  const elIcon = $('region-icon');
  const elEditBar = $('edit-bar');
  const btnMenu = $('btn-region-menu');
  const btnRandom = $('btn-random-theme');
  const ICONS = window.QL_REGION_ICONS || {};

  let info = { name: '', icon: 'apps', active: false, matchAll: false, layout: 'grid' };
  let renaming = null;

  const isEditing = () => !elEditBar.classList.contains('hidden');
  const isTextTarget = (t) => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  // ── Handle: title, icon, tooltips ──────────────────────────────────────────
  elTitleArea.tabIndex = 0;
  elHeader.title = 'Drag to move';

  function renderTitle() {
    if (renaming || !info.name) return;
    const name = info.name;
    elTitle.textContent = '';
    // The first '.' takes the accent colour, so QUICK.LAUNCH looks as before.
    const i = name.indexOf('.');
    if (i >= 0) {
      const dot = document.createElement('span');
      dot.className = 'accent';
      dot.textContent = '.';
      elTitle.append(name.slice(0, i), dot, name.slice(i + 1));
    } else {
      elTitle.textContent = name;
    }
    const glyph = ICONS[info.icon] || ICONS.apps;
    if (glyph) elIcon.innerHTML = glyph.svg; // our own static markup, never user text
    document.title = name;
    elTitleArea.setAttribute('aria-label', name);
    updateTitleAffordance();
  }

  function updateTitleAffordance() {
    const editing = isEditing();
    body.classList.toggle('edit-mode', editing);
    elTitle.classList.toggle('renameable', editing);
    if (editing) elTitle.title = 'Click to rename'; else elTitle.removeAttribute('title');
  }

  function applyState() {
    body.classList.toggle('region-active', !!info.active);
    const rnd = info.matchAll ? 'Random theme for all regions' : 'Random theme for this region';
    btnRandom.title = rnd;
    btnRandom.setAttribute('aria-label', rnd);
    renderTitle();
  }

  new MutationObserver(() => {
    updateTitleAffordance();
    if (!isEditing()) cancelRename();
  }).observe(elEditBar, { attributes: true, attributeFilter: ['class'] });

  // ── Rename in the handle (spec 3.2; Enter or blur commits, Esc cancels) ────
  function cancelRename() {
    if (!renaming) return;
    const input = renaming;
    renaming = null;
    input.replaceWith(elTitle);
    renderTitle();
  }

  function startRegionRename() {
    if (renaming) return;
    if (!isEditing()) enterEditMode();
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'region-rename-input';
    input.maxLength = 24;
    input.value = info.name;
    input.title = 'Region name';
    input.setAttribute('aria-label', 'Region name');
    elTitle.replaceWith(input);
    renaming = input;
    input.focus();
    input.select();
    let busy = false;
    const commit = async () => {
      if (busy || renaming !== input) return;
      busy = true;
      const r = await api.invoke('region:rename', { name: input.value });
      busy = false;
      if (renaming !== input) return;
      if (r && r.ok) {
        info.name = r.name;
        cancelRename();
      } else {
        // No room for a line under a 40 px header: the error is the field's tooltip.
        input.classList.add('invalid');
        input.title = (r && r.error) || 'Enter a name.';
        input.setAttribute('aria-invalid', 'true');
      }
    };
    input.addEventListener('keydown', (e) => {
      e.stopPropagation(); // the grid's type-to-filter and Esc handling stay out of it
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
    });
    input.addEventListener('input', () => {
      input.classList.remove('invalid');
      input.title = 'Region name';
      input.removeAttribute('aria-invalid');
    });
    input.addEventListener('blur', () => { commit(); });
  }

  // ── Move by the handle (spec 4.2): pointer capture, main process places ────
  let drag = null;

  async function pumpDrag(d) {
    while (d.pending && !d.ended) {
      const p = d.pending;
      d.pending = null;
      d.inflight = true;
      let r = null;
      try { r = await api.invoke('region:drag', { phase: 'move', ...p }); } catch { /* window closing */ }
      d.inflight = false;
      if (!d.ended) setCue(r);
    }
  }

  function setCue(r) {
    body.classList.toggle('region-snapped', !!(r && r.snapped));
    body.classList.toggle('region-blocked', !!(r && r.blocked));
  }

  elHeader.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, input, #filter-chip')) return;
    drag = { id: e.pointerId, sx: e.screenX, sy: e.screenY, moving: false, onTitle: !!e.target.closest('#title'), pending: null, inflight: false, ended: false };
    try { elHeader.setPointerCapture(e.pointerId); } catch { /* noop */ }
  });

  elHeader.addEventListener('pointermove', (e) => {
    const d = drag;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.screenX - d.sx;
    const dy = e.screenY - d.sy;
    if (!d.moving) {
      if (Math.hypot(dx, dy) < 6) return; // 6 px threshold
      d.moving = true;
      body.classList.add('region-moving');
      api.invoke('region:drag', { phase: 'start' });
    }
    d.pending = { dx, dy, alt: e.altKey };
    if (!d.inflight) pumpDrag(d);
  });

  function endDrag(e) {
    const d = drag;
    if (!d || (e && e.pointerId !== d.id)) return;
    drag = null;
    d.ended = true;
    try { elHeader.releasePointerCapture(d.id); } catch { /* noop */ }
    body.classList.remove('region-moving');
    setCue(null);
    if (d.moving) {
      // Calls reach the main process in order: the last move, then the end.
      if (d.pending) api.invoke('region:drag', { phase: 'move', ...d.pending });
      api.invoke('region:drag', { phase: 'end' });
    } else if (e && e.type === 'pointerup' && d.onTitle && isEditing()) {
      startRegionRename();
    }
  }
  elHeader.addEventListener('pointerup', endDrag);
  elHeader.addEventListener('pointercancel', endDrag);
  elHeader.addEventListener('lostpointercapture', endDrag);

  // ── Resize from the rim (Grid, spec 4.3): edges 6 px, corners 12 x 12 ──────
  const RIM = 6;
  const CORNER = 12;
  const grip = document.createElement('div');
  grip.id = 'resize-grip';
  grip.title = 'Drag to resize';
  grip.setAttribute('aria-hidden', 'true');
  grip.innerHTML = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M11 4L4 11M11 7.5L7.5 11M11 10.5l-.5.5"/></svg>';
  body.appendChild(grip);

  function zoneAt(x, y) {
    if (!body.classList.contains('layout-grid')) return null;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cl = x < CORNER; const cr = x >= w - CORNER; const ct = y < CORNER; const cb = y >= h - CORNER;
    if ((cl || cr) && (ct || cb)) return { left: cl, right: cr, top: ct, bottom: cb };
    const l = x < RIM; const r = x >= w - RIM; const t = y < RIM; const b = y >= h - RIM;
    if (l || r || t || b) return { left: l, right: r, top: t, bottom: b };
    return null;
  }
  function cursorFor(z) {
    if (!z) return '';
    if ((z.left && z.top) || (z.right && z.bottom)) return 'nwse-resize';
    if ((z.right && z.top) || (z.left && z.bottom)) return 'nesw-resize';
    return z.left || z.right ? 'ew-resize' : 'ns-resize';
  }
  let sizing = null;
  let rimCursor = '';
  const RIM_CLASSES = { 'nwse-resize': 'rim-nwse', 'nesw-resize': 'rim-nesw', 'ew-resize': 'rim-ew', 'ns-resize': 'rim-ns' };
  function setRimCursor(c) {
    if (c === rimCursor) return;
    const root = document.documentElement;
    if (rimCursor) root.classList.remove(RIM_CLASSES[rimCursor]);
    rimCursor = c;
    // While in a zone every element shows the resize cursor (region.css), so
    // a corner over the panel does not show the header's move cursor.
    if (c) root.classList.add(RIM_CLASSES[c]);
  }

  window.addEventListener('pointermove', (e) => {
    if (sizing) {
      if (e.pointerId !== sizing.id) return;
      sizing.pending = { dx: e.screenX - sizing.sx, dy: e.screenY - sizing.sy, alt: e.altKey };
      if (!sizing.inflight) pumpResize(sizing);
      return;
    }
    if (drag) return;
    setRimCursor(cursorFor(zoneAt(e.clientX, e.clientY)));
  }, true);

  async function pumpResize(s) {
    while (s.pending && !s.ended) {
      const p = s.pending;
      s.pending = null;
      s.inflight = true;
      try { await api.invoke('region:resize', { phase: 'move', ...p }); } catch { /* window closing */ }
      s.inflight = false;
    }
  }

  window.addEventListener('pointerdown', (e) => {
    // Any press makes this the active region and gives it keyboard focus
    // (the main process only does that when the desktop is foreground).
    api.invoke('region:pointer-down');
    if (e.button !== 0 || drag) return;
    const z = zoneAt(e.clientX, e.clientY);
    if (!z) return;
    stop(e); // no header drag, no tile press under a corner zone
    sizing = { id: e.pointerId, sx: e.screenX, sy: e.screenY, pending: null, inflight: false, ended: false, cursor: cursorFor(z) };
    try { document.documentElement.setPointerCapture(e.pointerId); } catch { /* noop */ }
    api.invoke('region:resize', { phase: 'start', edges: z });
  }, true);

  function endResize(e) {
    const s = sizing;
    if (!s || (e && e.pointerId !== s.id)) return;
    sizing = null;
    s.ended = true;
    try { document.documentElement.releasePointerCapture(s.id); } catch { /* noop */ }
    if (s.pending) api.invoke('region:resize', { phase: 'move', ...s.pending });
    api.invoke('region:resize', { phase: 'end' });
    setRimCursor('');
  }
  window.addEventListener('pointerup', endResize, true);
  window.addEventListener('pointercancel', endResize, true);

  document.documentElement.addEventListener('mouseenter', () => body.classList.add('pointer-inside'));
  document.documentElement.addEventListener('mouseleave', () => {
    body.classList.remove('pointer-inside');
    if (!sizing) setRimCursor('');
  });

  // ── Region menu and tile menu (native, from the main process; spec 9.2) ────
  function openRegionMenuAt(x, y) { api.invoke('region:menu', { x, y }); }
  function openRegionMenuAtButton() {
    const r = btnMenu.getBoundingClientRect();
    openRegionMenuAt(r.left, r.bottom);
  }
  btnMenu.addEventListener('click', openRegionMenuAtButton);

  window.addEventListener('contextmenu', (e) => {
    if (isTextTarget(e.target)) return;
    // Right-click on the handle = region menu; elsewhere app.js enters edit mode.
    if (e.target.closest('#header')) { stop(e); openRegionMenuAt(e.clientX, e.clientY); return; }
    const tile = e.target.closest('.app-tile');
    if (tile && isEditing()) { stop(e); api.invoke('region:tile-menu', { itemId: tile.dataset.id, x: e.clientX, y: e.clientY }); }
  }, true);

  function tileOf(id) {
    return [...document.querySelectorAll('.app-tile')].find((t) => t.dataset.id === id) || null;
  }
  function renameTile(id) {
    const item = (apps || []).find((a) => a.id === id);
    if (!item) return;
    if (!isEditing()) enterEditMode(); // re-renders the grid
    const tile = tileOf(id);
    const label = tile && tile.querySelector('.tile-label');
    if (label) startRename(item, label);
  }

  // ── Keys (spec 7.4): captured before app.js's own router ─────────────────
  const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  window.addEventListener('keydown', (e) => {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === 'F6') { stop(e); api.invoke('region:cycle', { dir: e.shiftKey ? -1 : 1 }); return; }
    if (isTextTarget(e.target)) return;
    const focus = document.activeElement;
    const handleFocused = focus === elTitleArea || focus === btnMenu;
    const menuKey = e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10');
    if (!e.ctrlKey && !e.altKey && !e.metaKey && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
      stop(e);
      api.invoke('region:open-manager', { view: 'cheatsheet' });
      return;
    }
    if (handleFocused && e.altKey && ARROWS[e.key]) {
      stop(e);
      const step = e.shiftKey ? 32 : 8;
      api.invoke('region:nudge', { dx: ARROWS[e.key][0] * step, dy: ARROWS[e.key][1] * step });
      return;
    }
    if (handleFocused && e.key === 'F2') { stop(e); startRegionRename(); return; }
    if (handleFocused && menuKey) { stop(e); openRegionMenuAtButton(); return; }
    const tile = focus && focus.closest ? focus.closest('.app-tile') : null;
    if (tile && isEditing()) {
      if (e.key === 'F2') { stop(e); renameTile(tile.dataset.id); return; }
      if (e.key === 'Delete') { stop(e); removeApp(tile.dataset.id); return; }
      if (menuKey) {
        stop(e);
        const r = tile.getBoundingClientRect();
        api.invoke('region:tile-menu', { itemId: tile.dataset.id, x: r.left, y: r.bottom });
      }
    }
  }, true);

  // ── From the main process ─────────────────────────────────────────────────
  api.on('region:state', (s) => { if (s && typeof s === 'object') { info = { ...info, ...s }; applyState(); } });
  api.on('region:command', (c) => {
    const cmd = c && c.cmd;
    if (cmd === 'edit') enterEditMode();
    else if (cmd === 'add-file') addAppFromDialog();
    else if (cmd === 'rename-region') startRegionRename();
    else if (cmd === 'rename-tile') renameTile(c.itemId);
    else if (cmd === 'remove-tile') removeApp(c.itemId);
  });
  // The main process changed this region's items (Manager picker, Move to).
  api.on('region:items-changed', (items) => {
    if (!Array.isArray(items)) return;
    apps = items;
    renderGrid();
  });
  // Hidden and shown again: back in view mode (spec 7.2).
  api.on('region:reset-view', () => {
    cancelRename();
    if (isEditing()) exitEditMode();
    clearFilter();
  });

  api.invoke('region:info').then((s) => {
    if (s && typeof s === 'object') { info = { ...info, ...s }; applyState(); }
  }).catch(() => {});
})();
