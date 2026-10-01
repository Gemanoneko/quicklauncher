/* Region window behaviour (regions spec 2.1, 3.2, 4, 7). Loaded after app.js:
   the grid itself is app.js, unchanged; this file adds what makes the page a
   region. It uses app.js globals at call time: apps, renderGrid,
   enterEditMode, exitEditMode, clearFilter, startRename, removeApp,
   addAppFromDialog, createAppTile, saveApps, cancelReorder; and
   tile-order.js (window.QL_TILE_ORDER), loaded before it.
   global api, apps, renderGrid, enterEditMode, exitEditMode, clearFilter,
   startRename, removeApp, addAppFromDialog, createAppTile, saveApps, cancelReorder */
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

  // The main process stopped a move or resize (display change, sleep, hide all):
  // drop the local state without sending anything back.
  function cancelRegionDrag() {
    const d = drag;
    if (d) {
      drag = null;
      d.ended = true;
      try { elHeader.releasePointerCapture(d.id); } catch { /* noop */ }
      body.classList.remove('region-moving');
      setCue(null);
    }
    const s = sizing;
    if (s) {
      sizing = null;
      s.ended = true;
      try { document.documentElement.releasePointerCapture(s.id); } catch { /* noop */ }
      setRimCursor('');
    }
  }

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

  // The Menu key and Shift+F10 also make Chromium send a contextmenu event to
  // the focused element after our keydown has opened the menu: skip that one.
  let keyMenuUntil = 0;
  window.addEventListener('contextmenu', (e) => {
    if (performance.now() < keyMenuUntil) { keyMenuUntil = 0; stop(e); return; }
    if (isTextTarget(e.target)) return;
    // Right-click on the handle = region menu; elsewhere app.js enters edit mode.
    if (e.target.closest('#header')) { stop(e); openRegionMenuAt(e.clientX, e.clientY); return; }
    const tile = e.target.closest('.app-tile');
    if (tile && isEditing()) { stop(e); api.invoke('region:tile-menu', { itemId: tile.dataset.id, x: e.clientX, y: e.clientY }); }
  }, true);

  function tileOf(id) {
    return [...document.querySelectorAll('.app-tile:not(.drop-slot)')].find((t) => t.dataset.id === id) || null;
  }

  // ── A tile carried to another region (spec 5.3): the source side ─────────
  // app.js's drag-to-reorder keeps the pointer for the whole drag; it calls
  // these hooks. While the pointer is outside this window the position goes
  // to the main process, which finds the region under it and has that page
  // show the slot and a copy of the tile. Nothing is reordered here then, and
  // the tile's placeholder goes back to where it started.
  const T = window.QL_TILE_ORDER;
  let carry = null;
  const outside = (e) => e.clientX < 0 || e.clientY < 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight;
  const gridTiles = () => [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')];

  function restorePlaceholder(c, state) {
    const src = state && state.srcEl;
    if (!src || !src.parentNode) return;
    const others = gridTiles().filter((t) => t !== src);
    src.parentNode.insertBefore(src, others[c.origIndex] || null);
  }

  async function pumpCarry(c) {
    while (c.pending && !c.ended) {
      const p = c.pending;
      c.pending = null;
      c.inflight = true;
      try { await api.invoke('region:tile-drag', { phase: 'move', x: p.x, y: p.y }); } catch { /* window closing */ }
      c.inflight = false;
    }
  }

  window.qlTileDragOut = {
    start(state) {
      const src = state && state.srcEl;
      if (!src || !src.dataset.id) return;
      carry = { itemId: src.dataset.id, origIndex: gridTiles().indexOf(src), out: false, reported: false, pending: null, inflight: false, ended: false };
      api.invoke('region:tile-drag', { phase: 'start', itemId: carry.itemId }).catch(() => {});
    },
    /** Returns true while the pointer is outside this window (app.js then skips its reorder). */
    move(e, state) {
      const c = carry;
      if (!c) return false;
      const out = outside(e);
      if (out && !c.out) restorePlaceholder(c, state);
      c.out = out;
      // Outside: report every position. Back inside: one last report, so the
      // main process clears the slot it had another region draw.
      if (out || c.reported) {
        c.pending = { x: e.clientX, y: e.clientY };
        c.reported = out;
        if (!c.inflight) pumpCarry(c);
      }
      return out;
    },
    /** Returns true when the release was outside this window: the main process decides, app.js does nothing more. */
    end(e, state) {
      const c = carry;
      carry = null;
      if (!c) return false;
      c.ended = true;
      if (!e || !outside(e)) {
        // Released in this region: app.js reorders; the main process forgets the drag.
        api.invoke('region:tile-drag', { phase: 'cancel' }).catch(() => {});
        return false;
      }
      restorePlaceholder(c, state);
      // Calls reach the main process in order, so the last position is in.
      api.invoke('region:tile-drag', { phase: 'end', x: e.clientX, y: e.clientY })
        .then((r) => {
          // Moved: the main process already sent this page its new items.
          if (!r || r.result !== 'moved') renderGrid();
        })
        .catch(() => renderGrid());
      return true;
    },
    cancel() {
      const c = carry;
      carry = null;
      if (!c) return;
      c.ended = true;
      api.invoke('region:tile-drag', { phase: 'cancel' }).catch(() => {});
    },
  };

  // ── A tile carried here from another region (spec 2.1, 5.3): the target ──
  // The main process sends where the pointer is over this page. The region
  // shows the valid-drop outline, a dashed slot at the nearest position, and
  // a copy of the tile under the pointer; a full region shows the rejected
  // outline and the FULL text in the banner instead of a slot.
  let drop = null; // { dragId, item, ghost, slot, slotIndex, rejected, bannerText }
  const elGrid = $('app-grid');
  const elBannerText = $('theme-banner-text');
  const reducedMotion = () => body.classList.contains('reduced-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A tile's layout rect; during the 120 ms reflow its final rect, so the
  // slot is placed against where tiles are going, not where they are drawn.
  function rectOf(el) {
    if (el._qlFinalRect && el._qlFinalUntil > performance.now()) return el._qlFinalRect;
    return el.getBoundingClientRect();
  }

  function slotIndexAt(x, y) {
    const all = gridTiles();
    const tiles = all.map((el, index) => ({ el, index }))
      .filter((t) => !t.el.classList.contains('filter-hidden'))
      .map((t) => ({ index: t.index, rect: rectOf(t.el) }));
    const slot = drop.slot && drop.slot.isConnected ? { index: drop.slotIndex, rect: drop.slot.getBoundingClientRect() } : null;
    return { index: T.insertionIndex(tiles, slot, { x, y }, all.length), all };
  }

  // Reflow animation: 120 ms ease when tiles move to make room; off under reduced motion (spec 2.1).
  function reflow(mutate) {
    const els = gridTiles();
    if (reducedMotion()) { mutate(); return; }
    const before = new Map(els.map((el) => [el, el.getBoundingClientRect()]));
    mutate();
    const until = performance.now() + 140;
    for (const el of els) {
      const a = before.get(el);
      const b = el.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (!dx && !dy) continue;
      el._qlFinalRect = b;
      el._qlFinalUntil = until;
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 120, easing: 'ease' });
    }
  }

  function makeSlot() {
    // Same inner boxes as a tile (both hidden, region.css), so the slot is a tile's size in every theme.
    const el = document.createElement('div');
    el.className = 'app-tile drop-slot';
    el.setAttribute('aria-hidden', 'true');
    const wrap = document.createElement('div');
    wrap.className = 'tile-icon-wrap';
    const label = document.createElement('span');
    label.className = 'tile-label';
    label.textContent = String.fromCharCode(160); // one line of label height (nbsp)
    el.append(wrap, label);
    return el;
  }

  function placeSlot(x, y) {
    const { index, all } = slotIndexAt(x, y);
    if (drop.slot && drop.slot.isConnected && index === drop.slotIndex) return;
    reflow(() => {
      if (!drop.slot) drop.slot = makeSlot();
      elGrid.insertBefore(drop.slot, all[index] || null);
    });
    drop.slotIndex = index;
  }

  function removeSlot() {
    if (drop && drop.slot) { drop.slot.remove(); drop.slot = null; drop.slotIndex = -1; }
  }

  function placeGhost(x, y) {
    if (!drop.ghost && drop.item) {
      // Today's drag ghost, built from this page's own tile markup (listeners are not cloned).
      const g = createAppTile({ id: '', name: drop.item.name, path: '', iconDataUrl: drop.item.iconDataUrl }).cloneNode(true);
      g.removeAttribute('data-id');
      g.removeAttribute('tabindex');
      g.removeAttribute('role');
      g.setAttribute('aria-hidden', 'true');
      g.className = 'app-tile drag-ghost';
      const img = g.querySelector('.tile-icon');
      if (img && !drop.item.iconDataUrl) img.style.visibility = 'hidden';
      const ref = drop.slot || gridTiles()[0];
      if (ref) { g.style.width = `${ref.offsetWidth}px`; g.style.height = `${ref.offsetHeight}px`; }
      document.body.appendChild(g);
      drop.ghost = g;
    }
    const g = drop.ghost;
    if (!g) return;
    g.style.left = `${x - g.offsetWidth / 2}px`;
    g.style.top = `${y - g.offsetHeight / 2}px`;
  }

  function setRejected(text) {
    drop.rejected = text;
    body.classList.toggle('tile-drop-rejected', !!text);
    body.classList.toggle('tile-drop-valid', !text);
    // Grid shows the refusal in its banner (spec 2.1); colour is never the only cue.
    if (text) {
      if (drop.bannerText === null) drop.bannerText = elBannerText.textContent;
      elBannerText.textContent = text;
    } else if (drop.bannerText !== null) {
      elBannerText.textContent = drop.bannerText;
      drop.bannerText = null;
    }
  }

  function endDropPreview() {
    if (!drop) return;
    removeSlot();
    if (drop.ghost) drop.ghost.remove();
    if (drop.bannerText !== null) elBannerText.textContent = drop.bannerText;
    body.classList.remove('tile-drop-valid', 'tile-drop-rejected', 'tile-drop-preview');
    drop = null;
  }

  function dropOver(m) {
    if (!drop || drop.dragId !== m.dragId) {
      endDropPreview();
      drop = { dragId: m.dragId, item: null, ghost: null, slot: null, slotIndex: -1, rejected: undefined, bannerText: null };
      body.classList.add('tile-drop-preview');
    }
    if (m.item && typeof m.item === 'object') drop.item = m.item;
    const rej = typeof m.rejected === 'string' && m.rejected ? m.rejected : null;
    if (rej !== drop.rejected) setRejected(rej);
    if (rej) removeSlot(); else placeSlot(m.x, m.y);
    placeGhost(m.x, m.y);
  }

  function dropHere(m) {
    // Released here: the slot under the pointer (computed fresh if no 'over' arrived first).
    if (!drop || drop.dragId !== m.dragId) {
      endDropPreview();
      drop = { dragId: m.dragId, item: null, ghost: null, slot: null, slotIndex: -1, rejected: null, bannerText: null };
    }
    const index = slotIndexAt(m.x, m.y).index;
    endDropPreview();
    api.invoke('region:tile-drop', { dragId: m.dragId, index }).catch(() => {});
  }

  api.on('region:tile-drop-preview', (m) => {
    if (!m || typeof m !== 'object' || !Number.isFinite(m.dragId)) return;
    if (m.phase === 'over' && Number.isFinite(m.x) && Number.isFinite(m.y)) dropOver(m);
    else if (m.phase === 'leave') { if (drop && drop.dragId === m.dragId) endDropPreview(); }
    else if (m.phase === 'drop' && Number.isFinite(m.x) && Number.isFinite(m.y)) dropHere(m);
  });

  // Ctrl+Arrow (edit mode): one place earlier or later among the visible tiles (spec 5.3, 7.4).
  async function moveTileBy(id, delta) {
    const visible = [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot):not(.filter-hidden)')].map((t) => t.dataset.id);
    const next = T.stepOrder(apps.map((a) => a.id), visible, id, delta);
    if (!next) return;
    const byId = new Map(apps.map((a) => [a.id, a]));
    apps = next.map((x) => byId.get(x));
    renderGrid();
    const tile = tileOf(id);
    if (tile) tile.focus();
    await saveApps();
  }

  // Delete (edit mode): the badge action; focus stays on the tile now in that place.
  async function removeFocusedTile(tile) {
    const visible = [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot):not(.filter-hidden)')];
    const at = visible.indexOf(tile);
    await removeApp(tile.dataset.id);
    const after = [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot):not(.filter-hidden)')];
    if (after.length) after[Math.max(0, Math.min(at, after.length - 1))].focus();
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
    if (handleFocused && menuKey) { stop(e); keyMenuUntil = performance.now() + 800; openRegionMenuAtButton(); return; }
    const tile = focus && focus.closest ? focus.closest('.app-tile:not(.drop-slot)') : null;
    if (tile && isEditing()) {
      if (e.key === 'F2') { stop(e); renameTile(tile.dataset.id); return; }
      if (e.key === 'Delete') { stop(e); removeFocusedTile(tile); return; }
      if (e.ctrlKey && !e.altKey && !e.metaKey && ARROWS[e.key]) {
        stop(e);
        moveTileBy(tile.dataset.id, e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1);
        return;
      }
      if (menuKey) {
        stop(e);
        keyMenuUntil = performance.now() + 800;
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
    // A display change, sleep or hide-all stopped a drag in flight.
    else if (cmd === 'cancel-drag') cancelRegionDrag();
    else if (cmd === 'cancel-tile-drag') { endDropPreview(); if (typeof cancelReorder === 'function') cancelReorder(); }
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
