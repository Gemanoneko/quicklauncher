/* Region window behaviour (regions spec 2.1, 3.2, 4, 7). Loaded after app.js:
   the grid itself is app.js, unchanged; this file adds what makes the page a
   region. It uses app.js globals at call time: apps, renderGrid,
   enterEditMode, exitEditMode, clearFilter, startRename, removeApp,
   addAppFromDialog, createAppTile, saveApps, cancelReorder, computeColumnCount,
   suppressNextClick, editMode, showNotice; and tile-order.js (window.QL_TILE_ORDER), loaded before it.
   app.js calls back into window.qlTileDragOut (M2) and window.qlDecorateTile (M3).
   global api, apps, renderGrid, enterEditMode, exitEditMode, clearFilter,
   startRename, removeApp, addAppFromDialog, createAppTile, saveApps, cancelReorder, computeColumnCount,
   suppressNextClick, editMode, showNotice */
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
    // Same inner boxes as a tile (both hidden, region.css). Its height is a
    // real tile's, to the pixel (addendum A1): the slot's 2 px border against
    // the tile's 1 px, or edit mode's renameable label, would otherwise make
    // its row taller and shift every row below. The width comes from the grid.
    const el = document.createElement('div');
    el.className = 'app-tile drop-slot';
    el.setAttribute('aria-hidden', 'true');
    const wrap = document.createElement('div');
    wrap.className = 'tile-icon-wrap';
    const label = document.createElement('span');
    label.className = 'tile-label';
    label.textContent = String.fromCharCode(160); // one line of label height (nbsp)
    el.append(wrap, label);
    const ref = gridTiles().find((t) => !t.classList.contains('filter-hidden'));
    if (ref && ref.offsetHeight) el.style.height = `${ref.offsetHeight}px`;
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

  // The slot goes through the same reflow when the pointer leaves, so the gap
  // closes as it opened (addendum A6); at once on a system cancel.
  function removeSlot({ animate = false } = {}) {
    if (!drop || !drop.slot) return;
    const s = drop.slot;
    drop.slot = null;
    drop.slotIndex = -1;
    if (animate && s.isConnected) reflow(() => s.remove()); else s.remove();
  }

  // After a drop the slot stays until this page's new items replace it
  // (renderGrid), so no frame shows the gap closed (A6). A refused drop, or
  // items that never come, take it away.
  let kept = null; // { dragId, slot, timer }
  function dropKeptSlot() {
    if (!kept) return;
    clearTimeout(kept.timer);
    kept.slot.remove();
    kept = null;
    if (!drop) body.classList.remove('tile-drop-preview');
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

  function endDropPreview({ animate = false, keepHintHidden = false } = {}) {
    if (!drop) return;
    removeSlot({ animate });
    if (drop.ghost) drop.ghost.remove();
    if (drop.bannerText !== null) elBannerText.textContent = drop.bannerText;
    body.classList.remove('tile-drop-valid', 'tile-drop-rejected');
    if (!keepHintHidden) body.classList.remove('tile-drop-preview');
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
    dropKeptSlot();
    if (!drop || drop.dragId !== m.dragId) {
      endDropPreview();
      drop = { dragId: m.dragId, item: null, ghost: null, slot: null, slotIndex: -1, rejected: null, bannerText: null };
    }
    const index = slotIndexAt(m.x, m.y).index;
    const slot = drop.slot && drop.slot.isConnected ? drop.slot : null;
    drop.slot = null;
    endDropPreview({ keepHintHidden: !!slot });
    if (slot) kept = { dragId: m.dragId, slot, timer: setTimeout(dropKeptSlot, 2500) };
    api.invoke('region:tile-drop', { dragId: m.dragId, index }).catch(() => dropKeptSlot());
  }

  api.on('region:tile-drop-preview', (m) => {
    if (!m || typeof m !== 'object' || !Number.isFinite(m.dragId)) return;
    if (m.phase === 'over' && Number.isFinite(m.x) && Number.isFinite(m.y)) dropOver(m);
    else if (m.phase === 'leave') {
      if (drop && drop.dragId === m.dragId) endDropPreview({ animate: !m.instant });
      if (kept && kept.dragId === m.dragId) dropKeptSlot();
    }
    else if (m.phase === 'drop' && Number.isFinite(m.x) && Number.isFinite(m.y)) dropHere(m);
  });

  // ── M3: files dragged in from the desktop or Explorer (spec 5.2, 2.1) ────
  // The same drop-target states as a tile from another region: the outline
  // and the dashed slot at the nearest place (the OS draws the dragged icons,
  // so no copy of a tile). A drop that would overfill a capped region shows
  // FULL and is refused before anything moves. On release the paths go to the
  // main process, which moves desktop shortcuts and adds the tiles; the slot
  // stays until they arrive. These capture listeners replace app.js's file drop.
  const FILES = 0; // the preview id of a file drag (tile drags count from 1)
  const isFileDrag = (e) => !!(e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files'));
  let fileDepth = 0;
  let fileIdle = null;
  function endFilePreview(opts) {
    clearTimeout(fileIdle);
    fileIdle = null;
    fileDepth = 0;
    if (drop && drop.dragId === FILES) endDropPreview(opts);
  }
  function fileOver(e) {
    const n = e.dataTransfer.items ? [...e.dataTransfer.items].filter((i) => i.kind === 'file').length : 1;
    const cap = Number.isFinite(info.cap) ? info.cap : null;
    const rejected = cap !== null && (apps || []).length + Math.max(1, n) > cap ? `FULL (${cap} max)` : null;
    dropOver({ dragId: FILES, x: e.clientX, y: e.clientY, rejected });
    // Always 'copy', never 'move': a drop answered with Move tells the drag source
    // (Explorer's desktop) to delete what it handed over (addendum B7).
    e.dataTransfer.dropEffect = rejected ? 'none' : 'copy';
    // A drag that ends somewhere else sends this page nothing more.
    clearTimeout(fileIdle);
    fileIdle = setTimeout(() => endFilePreview({ animate: true }), 700);
  }
  function fileDrop(e) {
    const paths = [...((e.dataTransfer && e.dataTransfer.files) || [])]
      .map((f) => { try { return api.getPathForFile(f); } catch { return ''; } })
      .filter(Boolean);
    return acceptDrop(paths, e.clientX, e.clientY);
  }
  // The drop itself, from the paths on: the slot under the point, then the main process.
  function acceptDrop(paths, x, y) {
    if (!drop || drop.dragId !== FILES) {
      const cap = Number.isFinite(info.cap) ? info.cap : null;
      const full = cap !== null && (apps || []).length + Math.max(1, paths.length) > cap ? `FULL (${cap} max)` : null;
      dropOver({ dragId: FILES, x, y, rejected: full });
    }
    clearTimeout(fileIdle);
    fileIdle = null;
    fileDepth = 0;
    if (drop.rejected || !paths.length) { endDropPreview(); return Promise.resolve(null); }
    const index = slotIndexAt(x, y).index;
    const slot = drop.slot && drop.slot.isConnected ? drop.slot : null;
    drop.slot = null;
    endDropPreview({ keepHintHidden: !!slot });
    dropKeptSlot();
    if (slot) kept = { dragId: FILES, slot, timer: setTimeout(dropKeptSlot, 30000) };
    // An accepted drop clears the type-to-filter, so the new tile never lands hidden
    // (addendum B10). The slot is at its real index, so the tiles around it show.
    clearFilter();
    return api.invoke('region:drop-files', { paths, index }).then((r) => {
      dropKeptSlot();
      // Files that are not shortcuts: a notice, never a box (addendum B7). It takes the banner
      // slot for 8 s; an update offer there comes back after it (fix-pass addendum C5).
      if (r && r.notice) showNotice(r.notice);
      return r;
    }, () => { dropKeptSlot(); return null; });
  }
  // --ql-test-hooks only: the self-test drives a drop from its paths (a page cannot
  // make the File objects an OS drop carries). Same code from the slot on.
  function testSeam() {
    if (info.testHooks && !window.__qlFileDrop) window.__qlFileDrop = (paths, x, y) => acceptDrop(Array.isArray(paths) ? paths : [], x, y);
  }
  window.addEventListener('dragenter', (e) => { if (!isFileDrag(e)) return; stop(e); fileDepth++; fileOver(e); }, true);
  window.addEventListener('dragover', (e) => { if (!isFileDrag(e)) return; stop(e); fileOver(e); }, true);
  window.addEventListener('dragleave', (e) => {
    if (!isFileDrag(e)) return;
    e.stopPropagation();
    fileDepth = Math.max(0, fileDepth - 1);
    if (fileDepth === 0) endFilePreview({ animate: true });
  }, true);
  window.addEventListener('drop', (e) => { if (!isFileDrag(e)) return; stop(e); fileDrop(e); }, true);

  // ── M3: moved and broken tiles (spec 5.4, 2.1, 9.1; addendum B4, B12.1) ──
  // app.js calls this for every tile it builds. A moved tile's badge is ↩ in
  // its own look and moves its file back; a reference keeps ✕ Remove. A broken
  // tile (its file is gone from the store folder) shows the icon at 60% and a
  // "!" pip at its top-left in both modes; in view mode a click, Enter or Space
  // shows the "missing" box instead of launching; in edit mode its badge is
  // ✕ Remove tile, which removes the tile record at once.
  function moveBack(id) {
    return api.invoke('region:move-back', { itemIds: [id] }).catch(() => null);
  }
  function removeBroken(id) {
    return api.invoke('region:remove-broken', { itemId: id }).catch(() => null);
  }
  // A 12 x 12 "!" disc: --text fill, the mark in --bg (region.css colours it).
  const PIP_SVG = '<svg viewBox="0 0 12 12" width="12" height="12" focusable="false"><circle cx="6" cy="6" r="6"/><rect x="5" y="2.4" width="2" height="4.4" rx="1"/><rect x="5" y="7.6" width="2" height="2" rx="1"/></svg>';
  window.qlDecorateTile = (tile, item) => {
    if (!tile || !item) return;
    const badge = tile.querySelector('.btn-remove');
    const relabel = (b, text, tip, onClick) => {
      const n = b.cloneNode(false); // no listeners: app.js's one would only remove the tile
      n.textContent = text;
      n.title = tip;
      n.setAttribute('aria-label', tip);
      n.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
      b.replaceWith(n);
      return n;
    };
    if (item.kind === 'moved') {
      tile.dataset.kind = 'moved';
      if (badge && item.broken) relabel(badge, '✕', 'Remove tile', () => removeBroken(item.id));
      else if (badge) {
        // ↩ is the safe action: its own look, none of ✕'s danger colours (addendum B12.1).
        const b = relabel(badge, '↩', 'Move back to desktop', () => moveBack(item.id));
        b.className = 'btn-move-back';
      }
    } else if (badge) {
      badge.setAttribute('aria-label', 'Remove');
    }
    if (item.broken) {
      tile.classList.add('tile-broken');
      tile.dataset.broken = '1';
      tile.setAttribute('aria-label', `${item.name}, missing`);
      if (!editMode) {
        const tip = `${item.name} is missing. Click to remove the tile or keep it.`;
        tile.title = tip;
        const label = tile.querySelector('.tile-label');
        if (label) label.title = tip;
      }
      const pip = document.createElement('span');
      pip.className = 'tile-broken-pip';
      pip.setAttribute('aria-hidden', 'true');
      pip.innerHTML = PIP_SVG; // our own static markup
      tile.appendChild(pip);
      // Capture on the tile runs before app.js's launch listener on it.
      const activate = (e) => {
        if (isEditing() || suppressNextClick) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        api.invoke('region:broken-click', { itemId: item.id }).catch(() => {});
      };
      tile.addEventListener('click', activate, true);
      tile.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') activate(e); }, true);
    }
  };

  // Each Ctrl+Arrow move is announced in a visually hidden status line (A5).
  const srStatus = document.createElement('div');
  srStatus.className = 'ql-sr-status';
  srStatus.setAttribute('role', 'status');
  srStatus.setAttribute('aria-live', 'polite');
  body.appendChild(srStatus);
  const visibleTiles = () => [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot):not(.filter-hidden)')];

  // Ctrl+Arrow (edit mode, addendum A5): Left / Right one place, Up / Down one
  // row (the column count the plain arrows use), among the visible tiles.
  async function moveTileBy(id, delta) {
    const visible = visibleTiles().map((t) => t.dataset.id);
    const next = T.stepOrder(apps.map((a) => a.id), visible, id, delta);
    if (!next) return;
    const byId = new Map(apps.map((a) => [a.id, a]));
    apps = next.map((x) => byId.get(x));
    renderGrid();
    const tile = tileOf(id);
    if (tile) tile.focus();
    const shown = visibleTiles();
    srStatus.textContent = `Moved to ${shown.indexOf(tile) + 1} of ${shown.length}.`;
    await saveApps();
  }

  // Delete (edit mode): the badge action (↩ on a moved tile, ✕ on a reference);
  // focus stays on the tile now in that place.
  async function removeFocusedTile(tile) {
    const visible = [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot):not(.filter-hidden)')];
    const at = visible.indexOf(tile);
    const item = (apps || []).find((a) => a.id === tile.dataset.id);
    if (item && item.kind === 'moved' && item.broken) await removeBroken(item.id);
    else if (item && item.kind === 'moved') await moveBack(item.id);
    else await removeApp(tile.dataset.id);
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
    // Menu key or Shift+F10 on a tile in view mode: as a right-click on a tile,
    // the region enters edit mode; focus stays on that tile, so the next press
    // opens its menu (addendum A4).
    if (tile && !isEditing() && menuKey) {
      stop(e);
      keyMenuUntil = performance.now() + 800;
      const id = tile.dataset.id;
      enterEditMode(); // re-renders the grid
      const again = tileOf(id);
      if (again) again.focus();
      return;
    }
    if (tile && isEditing()) {
      if (e.key === 'F2') { stop(e); renameTile(tile.dataset.id); return; }
      if (e.key === 'Delete') { stop(e); removeFocusedTile(tile); return; }
      if (e.ctrlKey && !e.altKey && !e.metaKey && ARROWS[e.key]) {
        stop(e);
        const row = e.key === 'ArrowUp' || e.key === 'ArrowDown';
        const step = row ? computeColumnCount(visibleTiles()) : 1;
        moveTileBy(tile.dataset.id, (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) * step);
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
  api.on('region:state', (s) => { if (s && typeof s === 'object') { info = { ...info, ...s }; applyState(); testSeam(); } });
  api.on('region:command', (c) => {
    const cmd = c && c.cmd;
    if (cmd === 'edit') enterEditMode();
    else if (cmd === 'add-file') addAppFromDialog();
    else if (cmd === 'rename-region') startRegionRename();
    else if (cmd === 'rename-tile') renameTile(c.itemId);
    else if (cmd === 'remove-tile') removeApp(c.itemId);
    else if (cmd === 'clear-filter') clearFilter();
    // A display change, sleep or hide-all stopped a drag in flight.
    else if (cmd === 'cancel-drag') cancelRegionDrag();
    else if (cmd === 'cancel-tile-drag') { endDropPreview(); if (typeof cancelReorder === 'function') cancelReorder(); }
  });
  // The main process changed this region's items (Manager picker, Move to).
  api.on('region:items-changed', (items) => {
    if (!Array.isArray(items)) return;
    apps = items;
    renderGrid(); // also replaces a slot kept after a drop
    dropKeptSlot();
  });
  // Hidden and shown again: back in view mode (spec 7.2).
  api.on('region:reset-view', () => {
    cancelRename();
    if (isEditing()) exitEditMode();
    clearFilter();
  });

  api.invoke('region:info').then((s) => {
    if (s && typeof s === 'object') { info = { ...info, ...s }; applyState(); testSeam(); }
  }).catch(() => {});
})();
