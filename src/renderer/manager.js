/* Manager window (regions spec 8): REGIONS and SETTINGS views, the
   installed-app picker and the keyboard cheat-sheet. All state comes from
   the main process (manager:state, get-settings); this page never holds data
   of its own. */
(function () {
  'use strict';
  const api = window.api;
  const $ = (id) => document.getElementById(id);
  const NAMES = window.QL_THEME_NAMES || {};
  const ICONS = window.QL_REGION_ICONS || {};
  const themeName = (k) => NAMES[k] || String(k || '').toUpperCase();

  let state = null;     // manager:state
  let settings = {};    // get-settings
  let themes = [];      // sorted keys
  let view = 'regions';
  let pickerRegionId = null;
  let focusNewId = null;
  const rows = new Map(); // region id -> row elements

  // ── theme of the Manager: the primary region's effective theme ─────────────
  function applyTheme(theme) {
    const t = themes.includes(theme) ? theme : 'cyberpunk';
    const link = $('theme-stylesheet');
    const href = `styles/themes/${t}.css`;
    if (link.getAttribute('href') !== href) link.setAttribute('href', href);
    const size = settings.iconSize || 64;
    document.documentElement.style.setProperty('--icon-size', `${size}px`);
    const os = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.toggle('reduced-motion', os || settings.reducedMotion === true);
  }

  // Same CPU rule as a region: ambient animation only while focused.
  function updatePause() {
    document.body.classList.toggle('ql-paused', document.hidden || !document.hasFocus());
  }
  window.addEventListener('focus', updatePause);
  window.addEventListener('blur', updatePause);
  document.addEventListener('visibilitychange', updatePause);

  // ── views ──────────────────────────────────────────────────────────────────
  function showView(v) {
    view = v === 'settings' ? 'settings' : 'regions';
    $('view-regions').classList.toggle('hidden', view !== 'regions');
    $('view-settings').classList.toggle('hidden', view !== 'settings');
    $('mgr-footer').classList.toggle('hidden', view !== 'settings');
    $('tab-regions').setAttribute('aria-selected', String(view === 'regions'));
    $('tab-settings').setAttribute('aria-selected', String(view === 'settings'));
    $('tab-regions').classList.toggle('active', view === 'regions');
    $('tab-settings').classList.toggle('active', view === 'settings');
  }
  $('tab-regions').addEventListener('click', () => showView('regions'));
  $('tab-settings').addEventListener('click', () => showView('settings'));

  // ── shared theme dropdown (the searchable SKIN picker, one list for all) ───
  const listEl = $('theme-picker-list');
  let openPicker = null; // { input, current, onPick }

  function buildThemeList(filter) {
    const q = (filter || '').toLowerCase().trim();
    const matches = q ? themes.filter((k) => themeName(k).toLowerCase().includes(q)) : themes;
    listEl.innerHTML = '';
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'theme-picker-empty';
      empty.textContent = 'NO MATCHES';
      listEl.appendChild(empty);
      return;
    }
    for (const key of matches) {
      const item = document.createElement('div');
      item.className = 'theme-picker-item' + (openPicker && key === openPicker.current ? ' selected' : '');
      item.setAttribute('role', 'option');
      item.textContent = themeName(key);
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const p = openPicker;
        closeThemeList();
        if (p) p.onPick(key);
      });
      listEl.appendChild(item);
    }
  }

  function placeThemeList(input) {
    const r = input.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 10;
    const above = r.top - 10;
    listEl.style.left = `${Math.max(8, r.left)}px`;
    listEl.style.right = 'auto';
    listEl.style.width = `${Math.max(200, r.width)}px`;
    if (below >= 140 || below >= above) {
      listEl.style.top = `${r.bottom + 3}px`;
      listEl.style.bottom = 'auto';
      listEl.style.maxHeight = `${Math.max(80, below)}px`;
    } else {
      listEl.style.top = 'auto';
      listEl.style.bottom = `${window.innerHeight - r.top + 3}px`;
      listEl.style.maxHeight = `${Math.max(80, above)}px`;
    }
  }

  function closeThemeList() {
    if (!openPicker) return;
    const p = openPicker;
    openPicker = null;
    listEl.classList.add('hidden');
    p.input.value = themeName(p.current);
  }

  function moveActive(dir) {
    const items = [...listEl.querySelectorAll('.theme-picker-item')];
    if (!items.length) return;
    const cur = listEl.querySelector('.theme-picker-item.active');
    let idx = items.indexOf(cur) + dir;
    idx = Math.max(0, Math.min(items.length - 1, idx));
    items.forEach((i) => i.classList.remove('active'));
    items[idx].classList.add('active');
    items[idx].scrollIntoView({ block: 'nearest' });
  }

  // A theme field: shows the theme's name; focus turns it into a search.
  function makeThemePicker({ title, onPick }) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'theme-search mgr-theme';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.title = title;
    input.setAttribute('aria-label', title);
    const picker = { input, current: null, disabled: false, onPick };
    input.addEventListener('focus', () => {
      if (picker.disabled) { input.blur(); return; }
      openPicker = { input, current: picker.current, onPick: (k) => { picker.current = k; input.value = themeName(k); onPick(k); } };
      input.value = '';
      input.placeholder = themeName(picker.current);
      buildThemeList('');
      placeThemeList(input);
      listEl.classList.remove('hidden');
      const sel = listEl.querySelector('.theme-picker-item.selected');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    });
    input.addEventListener('input', () => { if (openPicker && openPicker.input === input) buildThemeList(input.value); });
    input.addEventListener('blur', () => setTimeout(() => { if (openPicker && openPicker.input === input) closeThemeList(); }, 150));
    input.addEventListener('keydown', (e) => {
      if (!openPicker || openPicker.input !== input) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeThemeList(); input.blur(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        const active = listEl.querySelector('.theme-picker-item.active') || listEl.querySelector('.theme-picker-item');
        if (active) active.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        input.blur();
      }
    });
    picker.set = (key, { disabled = false, disabledTitle = null } = {}) => {
      picker.current = key;
      picker.disabled = disabled;
      input.classList.toggle('mgr-disabled', disabled);
      input.setAttribute('aria-disabled', String(disabled));
      input.title = disabled && disabledTitle ? disabledTitle : title;
      if (document.activeElement !== input) input.value = themeName(key);
    };
    return picker;
  }

  const sharedPicker = makeThemePicker({
    title: 'Theme shown in every region',
    onPick: (k) => api.invoke('manager:set-shared-theme', k),
  });
  $('shared-theme-slot').appendChild(sharedPicker.input);

  // ── glyph popover ──────────────────────────────────────────────────────────
  const popover = $('glyph-popover');
  let popoverFor = null;
  function openGlyphs(regionId, anchor) {
    popover.innerHTML = '';
    for (const key of Object.keys(ICONS)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mgr-glyph';
      b.title = ICONS[key].name;
      b.setAttribute('aria-label', ICONS[key].name);
      b.innerHTML = ICONS[key].svg;
      b.addEventListener('click', () => {
        closeGlyphs();
        api.invoke('manager:update-region', regionId, { icon: key });
      });
      popover.appendChild(b);
    }
    const r = anchor.getBoundingClientRect();
    popover.classList.remove('hidden');
    const h = popover.offsetHeight;
    const top = r.bottom + 4 + h > window.innerHeight ? Math.max(4, r.top - h - 4) : r.bottom + 4;
    popover.style.left = `${Math.max(4, Math.min(r.left, window.innerWidth - popover.offsetWidth - 4))}px`;
    popover.style.top = `${top}px`;
    popoverFor = regionId;
    const first = popover.querySelector('button');
    if (first) first.focus();
  }
  function closeGlyphs() { popover.classList.add('hidden'); popoverFor = null; }
  document.addEventListener('mousedown', (e) => {
    if (popoverFor && !popover.contains(e.target) && !e.target.closest('.mgr-icon-btn')) closeGlyphs();
  });

  // ── REGIONS view ───────────────────────────────────────────────────────────
  function makeRow(region) {
    const row = document.createElement('div');
    row.className = 'mgr-region';
    row.setAttribute('role', 'listitem');

    const iconBtn = document.createElement('button');
    iconBtn.type = 'button';
    iconBtn.className = 'mgr-icon-btn';
    iconBtn.title = 'Choose an icon';
    iconBtn.setAttribute('aria-label', 'Choose an icon');
    iconBtn.addEventListener('click', () => {
      if (popoverFor === region.id) closeGlyphs(); else openGlyphs(region.id, iconBtn);
    });

    const nameWrap = document.createElement('div');
    nameWrap.className = 'mgr-name-wrap';
    const name = document.createElement('input');
    name.type = 'text';
    name.className = 'mgr-name';
    name.maxLength = 24;
    name.spellcheck = false;
    name.title = 'Region name';
    name.setAttribute('aria-label', 'Region name');
    const err = document.createElement('div');
    err.className = 'mgr-error hidden';
    err.setAttribute('role', 'alert');
    nameWrap.append(name, err);
    const description = document.createElement('div');
    description.className = 'mgr-description';
    nameWrap.appendChild(description);
    let committed = region.name;
    const commitName = async () => {
      const r = await api.invoke('manager:update-region', region.id, { name: name.value });
      if (r && r.ok) {
        committed = r.name;
        name.value = r.name;
        name.classList.remove('invalid');
        err.classList.add('hidden');
      } else {
        name.classList.add('invalid');
        err.textContent = (r && r.error) || 'Enter a name.';
        err.classList.remove('hidden');
      }
    };
    name.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commitName(); }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        name.value = committed;
        name.classList.remove('invalid');
        err.classList.add('hidden');
        name.blur();
      }
    });
    name.addEventListener('blur', () => { if (name.value !== committed || name.classList.contains('invalid')) commitName(); });

    const layout = document.createElement('select');
    layout.className = 'mgr-layout';
    layout.title = 'Layout';
    layout.setAttribute('aria-label', 'Layout');
    // Spec 3.3: applies at once; a refusal is a box and the select shows the layout kept.
    layout.addEventListener('change', async () => {
      const want = layout.value;
      await api.invoke('manager:update-region', region.id, { layout: want });
      await refresh();
    });

    const theme = makeThemePicker({
      title: 'Theme of this region',
      onPick: (k) => api.invoke('manager:update-region', region.id, { theme: k }),
    });

    const count = document.createElement('span');
    count.className = 'mgr-count';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'mgr-delete';
    del.textContent = '✕';
    del.addEventListener('click', async () => {
      if (del.getAttribute('aria-disabled') === 'true') return;
      await api.invoke('manager:delete-region', region.id);
    });

    row.append(iconBtn, nameWrap, layout, theme.input, count, del);
    const r = { row, iconBtn, name, err, description, layout, theme, count, del, setCommitted: (n) => { committed = n; } };
    return r;
  }

  function renderRegions() {
    if (!state) return;
    const list = $('region-list');
    const ids = new Set(state.regions.map((r) => r.id));
    for (const [id, r] of rows) if (!ids.has(id)) { r.row.remove(); rows.delete(id); }
    const last = state.regions.length <= 1;
    state.regions.forEach((region, i) => {
      let r = rows.get(region.id);
      if (!r) { r = makeRow(region); rows.set(region.id, r); }
      if (list.children[i] !== r.row) list.insertBefore(r.row, list.children[i] || null);
      const glyph = ICONS[region.icon] || ICONS.apps;
      r.iconBtn.innerHTML = glyph ? glyph.svg : '';
      if (document.activeElement !== r.name) {
        r.name.value = region.name;
        r.setCommitted(region.name);
      }
      if (!r.layout.options.length || r.layout.dataset.layouts !== state.layouts.join(',')) {
        r.layout.innerHTML = '';
        for (const l of state.layouts) {
          const o = document.createElement('option');
          o.value = l;
          o.textContent = l.charAt(0).toUpperCase() + l.slice(1);
          r.layout.appendChild(o);
        }
        r.layout.dataset.layouts = state.layouts.join(',');
      }
      for (const option of r.layout.options) {
        const cap = region.layoutCaps && region.layoutCaps[option.value];
        option.disabled = Number.isFinite(cap) && (cap < 1 || region.count > cap);
        option.textContent = option.value.charAt(0).toUpperCase()+option.value.slice(1)+(Number.isFinite(cap) ? ` (max ${cap})` : '');
        option.title = option.disabled ? `${region.count} shortcuts. ${option.value.charAt(0).toUpperCase()+option.value.slice(1)} holds ${cap}.` : '';
      }
      r.layout.value = region.layout;
      r.description.textContent = region.displaySuppressed ? 'Not shown · display too small' : region.displayFallback ? `${region.layout.charAt(0).toUpperCase()+region.layout.slice(1)} · using Grid` : '';
      r.description.title = r.description.textContent ? region.displayTitle : '';
      r.theme.set(region.theme, {
        disabled: state.matchAll,
        disabledTitle: 'Match all is on. Turn it off to set this region\'s theme.',
      });
      r.count.textContent = String(region.count);
      r.count.title = `${region.count} shortcut${region.count === 1 ? '' : 's'}`;
      r.del.setAttribute('aria-disabled', String(last));
      r.del.classList.toggle('mgr-disabled', last);
      const delTitle = last ? state.strings.lastRegion : 'Delete region';
      r.del.title = delTitle;
      r.del.setAttribute('aria-label', delTitle);
      r.row.classList.toggle('primary', region.primary);
    });

    const atCap = state.regions.length >= state.cap;
    const newBtn = $('btn-new-region');
    newBtn.setAttribute('aria-disabled', String(atCap));
    newBtn.classList.toggle('mgr-disabled', atCap);
    newBtn.title = atCap ? state.strings.cap : 'Create a region';
    const cap = $('mgr-cap');
    cap.textContent = atCap ? state.strings.cap : '';
    cap.classList.toggle('hidden', !atCap);

    $('chk-match-all').checked = state.matchAll;
    $('shared-theme-wrap').classList.toggle('hidden', !state.matchAll);
    sharedPicker.set(state.sharedTheme || state.theme);

    if (focusNewId && rows.has(focusNewId)) {
      const n = rows.get(focusNewId).name;
      focusNewId = null;
      n.focus();
      n.select();
    }
  }

  // + NEW REGION ▾ (spec 8.1, 3.1): a native menu of the layouts, under the button.
  $('btn-new-region').addEventListener('click', () => {
    const b = $('btn-new-region');
    if (b.getAttribute('aria-disabled') === 'true') return;
    const r = b.getBoundingClientRect();
    api.invoke('manager:new-region-menu', { x: r.left, y: r.bottom }).catch(() => {});
  });
  // The pick from that menu: the new row's name is focused and selected (spec 3.1).
  api.on('manager:created', async (r) => {
    const cap = $('mgr-cap');
    if (r && r.ok) {
      focusNewId = r.id;
      await refresh();
    } else if (r && r.error) {
      cap.textContent = r.error;
      cap.classList.remove('hidden');
    }
  });

  $('chk-match-all').addEventListener('change', (e) => api.invoke('manager:set-match-all', e.target.checked));

  // ── Moved shortcuts (spec 8.1, 5.4, 5.5) ───────────────────────────────────
  function renderMoved() {
    const m = state && state.moved;
    if (!m) return;
    const tips = m.tips || {};
    $('moved-count').textContent = m.countText;
    const od = $('moved-onedrive');
    od.textContent = m.oneDrive || '';
    od.classList.toggle('hidden', !m.oneDrive);
    // Moving unavailable (read-only store, no Win32): a standing line, and every
    // button that would move a file is disabled and says why (addendum B5).
    const un = $('moved-unavailable');
    un.textContent = m.unavailableText || '';
    un.classList.toggle('hidden', !m.unavailableText);
    const disable = (b, off, offTip, onTip) => {
      b.setAttribute('aria-disabled', String(off));
      b.classList.toggle('mgr-disabled', off);
      const tip = off ? offTip : onTip;
      b.title = tip;
      b.setAttribute('aria-label', tip);
    };
    const back = $('btn-move-all-back');
    if (!m.available) disable(back, true, tips.unavailable, tips.moveAllBack);
    else disable(back, !m.count, tips.noneToMoveBack, tips.moveAllBack);
    const oc = $('orphan-count');
    oc.textContent = m.orphanText || '';
    oc.classList.toggle('hidden', !m.orphanText);
    const list = $('orphan-list');
    list.innerHTML = '';
    for (const o of m.orphans || []) {
      const row = document.createElement('div');
      row.className = 'mgr-orphan';
      row.setAttribute('role', 'listitem');
      const nm = document.createElement('span');
      nm.className = 'mgr-orphan-name';
      nm.textContent = o.name;
      nm.title = o.fileName || o.name; // with its extension: Steam.lnk and Steam.url can both be here (B5)
      const add = document.createElement('button');
      add.type = 'button';
      add.textContent = 'ADD BACK';
      disable(add, !m.available, tips.unavailable, tips.addBack);
      add.addEventListener('click', () => { if (add.getAttribute('aria-disabled') !== 'true') api.invoke('manager:orphan', 'add', o.file); });
      const desk = document.createElement('button');
      desk.type = 'button';
      desk.textContent = 'MOVE TO DESKTOP';
      disable(desk, !m.available, tips.unavailable, tips.moveToDesktop);
      desk.addEventListener('click', () => { if (desk.getAttribute('aria-disabled') !== 'true') api.invoke('manager:orphan', 'desktop', o.file); });
      row.append(nm, add, desk);
      list.appendChild(row);
    }
  }
  $('btn-open-store').addEventListener('click', () => api.invoke('manager:open-store'));
  $('btn-move-all-back').addEventListener('click', () => {
    if ($('btn-move-all-back').getAttribute('aria-disabled') === 'true') return;
    api.invoke('manager:move-all-back');
  });

  // ── SETTINGS view ──────────────────────────────────────────────────────────
  const elSlider = $('slider-icon-size');
  const elSize = $('icon-size-val');
  const ICON_SIZE_TITLE = 'Icon size in every region';
  const ICON_FIT_ERROR = 'No room at this icon size. Use a smaller size.';
  let iconRequestRevision = 0, iconSettlementRevision = 0, iconRequestPending = false;
  let iconFitRefusal = '', iconFitTimer = null, updateStatusText = '';
  function drawStatus(announce = false) {
    const status = $('update-status');
    const text = iconFitRefusal || updateStatusText;
    if (announce || status.textContent !== text) status.replaceChildren(document.createTextNode(text));
    status.title = text;
  }
  function clearIconRefusal() {
    clearTimeout(iconFitTimer); iconFitTimer = null;
    iconFitRefusal = ''; elSlider.title = ICON_SIZE_TITLE;
    drawStatus();
  }
  function showIconRefusal(text) {
    clearTimeout(iconFitTimer);
    iconFitRefusal = text || ICON_FIT_ERROR;
    elSlider.title = iconFitRefusal;
    drawStatus(true); // one announcement per refusal, including repeated equal messages
    iconFitTimer = setTimeout(clearIconRefusal, 8000);
  }
  function renderSettings() {
    const size = settings.iconSize || 64;
    if (!iconRequestPending) {
      if (document.activeElement !== elSlider) elSlider.value = size;
      elSize.textContent = `${size}px`;
    }
    $('chk-startup').checked = settings.startWithWindows !== false;
    $('chk-random-theme').checked = settings.randomTheme !== false;
    $('chk-reduced-motion').checked = settings.reducedMotion === true;
    if (!recording) $('input-hotkey').value = settings.globalHotkey || '';
  }
  const savePatch = (patch) => api.invoke('save-settings', patch);
  elSlider.addEventListener('input', async (e) => {
    const size = parseInt(e.target.value, 10);
    const revision = ++iconRequestRevision;
    iconRequestPending = true;
    elSize.textContent = `${size}px`;
    let result;
    try { result = await savePatch({ iconSize: size }); }
    catch (error) {
      console.error('Icon size change failed:', error);
      if (revision !== iconRequestRevision) return;
      iconRequestPending = false;
      elSlider.value = settings.iconSize || 64;
      elSize.textContent = `${settings.iconSize || 64}px`;
      return;
    }
    if (revision !== iconRequestRevision) return; // a later request owns the UI
    iconRequestPending = false;
    iconSettlementRevision++;
    const accepted = result && Number.isFinite(result.iconSize) ? result.iconSize : settings.iconSize || 64;
    settings.iconSize = accepted;
    elSlider.value = accepted; // focused native range must also roll back
    elSize.textContent = `${accepted}px`;
    applyTheme(state ? state.theme : 'cyberpunk');
    if (result && result.ok) clearIconRefusal();
    else showIconRefusal(result && result.error);
  });
  $('chk-startup').addEventListener('change', async (e) => {
    settings.startWithWindows = e.target.checked;
    await savePatch({ startWithWindows: e.target.checked });
    await api.invoke('set-auto-launch', e.target.checked);
  });
  $('chk-random-theme').addEventListener('change', (e) => {
    settings.randomTheme = e.target.checked;
    savePatch({ randomTheme: e.target.checked });
  });
  $('chk-reduced-motion').addEventListener('change', (e) => {
    settings.reducedMotion = e.target.checked;
    savePatch({ reducedMotion: e.target.checked });
    applyTheme(state ? state.theme : 'cyberpunk');
  });
  let updateState = { offer: 'none', checking: false, percent: 0 };
  let updateRevision = 0;
  function disabled(button, off, title) {
    button.setAttribute('aria-disabled', String(off));
    button.classList.toggle('mgr-disabled', off);
    button.title = title;
    button.setAttribute('aria-label', title);
  }
  function drawUpdate(s, channel, arg) {
    updateState = s;
    const offered = s.offer !== 'none';
    $('mgr-update').classList.toggle('hidden', !offered);
    const button = $('btn-mgr-update');
    let text = '', label = '', title = '';
    if (s.offer === 'available') { text = `UPDATE AVAILABLE — v${s.version}`; label = 'DOWNLOAD'; title = 'Download the update. QuickLauncher keeps running.'; }
    if (s.offer === 'downloading') { text = `DOWNLOADING... ${Math.floor(s.percent / 5) * 5}%`; label = 'DOWNLOADING...'; title = 'The update is downloading.'; }
    if (s.offer === 'ready') { text = 'UPDATE READY — WILL INSTALL AND RESTART'; label = 'INSTALL NOW'; title = 'Close QuickLauncher, install the update, and start it again.'; }
    $('mgr-update-text').textContent = text;
    button.textContent = label;
    disabled(button, s.offer === 'downloading', title);
    const checkOff = s.checking || s.offer === 'downloading' || s.offer === 'ready';
    disabled($('btn-check-update'), checkOff, s.checking ? 'Checking for updates.' : s.offer === 'downloading' ? 'The update is downloading.' : s.offer === 'ready' ? 'The update is ready to install.' : 'Check for a newer version');
    if (s.checking) updateStatusText = 'CHECKING FOR UPDATES...';
    else if (channel === 'update-not-available') updateStatusText = 'SYSTEM IS UP TO DATE';
    else if (channel === 'update-error') updateStatusText = `UPDATE ERROR: ${arg}`;
    else if (channel) updateStatusText = '';
    drawStatus();
  }
  api.on('manager:update-state', (msg) => { updateRevision++; drawUpdate(msg.state, msg.channel, msg.arg); });
  $('btn-check-update').addEventListener('click', () => {
    if ($('btn-check-update').getAttribute('aria-disabled') !== 'true') api.invoke('check-update');
  });
  $('btn-mgr-update').addEventListener('click', () => {
    if (updateState.offer === 'available') api.invoke('download-update');
    else if (updateState.offer === 'ready') api.invoke('install-update');
  });
  $('btn-close-settings').addEventListener('click', () => api.invoke('manager:close'));
  $('btn-mgr-close').addEventListener('click', () => api.invoke('manager:close'));

  // Global hotkey rebinding: click, press the keys; Esc cancels (as before).
  const hkInput = $('input-hotkey');
  const hkStatus = $('hotkey-status');
  let recording = false;
  function setHkStatus(msg, isError) {
    hkStatus.textContent = msg || '';
    hkStatus.classList.toggle('error', !!isError);
  }
  function eventToAccelerator(e) {
    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Super');
    const k = e.key;
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(k)) return null;
    let keyName;
    if (k === ' ') keyName = 'Space';
    else if (k === 'Escape') keyName = 'Escape';
    else if (k === 'Enter') keyName = 'Return';
    else if (k === 'Tab') keyName = 'Tab';
    else if (k === 'Backspace') keyName = 'Backspace';
    else if (k.length === 1) keyName = k.toUpperCase();
    else keyName = k;
    parts.push(keyName);
    return parts.join('+');
  }
  async function tryApply(accel) {
    const result = await api.invoke('apply-global-hotkey', accel);
    if (result && result.ok) {
      settings.globalHotkey = accel;
      await savePatch({ globalHotkey: accel });
      hkInput.value = accel || '';
      setHkStatus(accel ? 'BOUND.' : 'DISABLED.', false);
    } else {
      setHkStatus(result && result.reason === 'CONFLICT' ? 'CONFLICT — IN USE BY ANOTHER APP' : 'INVALID BINDING', true);
      hkInput.value = settings.globalHotkey || '';
    }
    renderCheatsheet();
  }
  hkInput.addEventListener('focus', () => {
    if (recording) return;
    recording = true;
    hkInput.classList.add('recording');
    hkInput.value = 'PRESS KEYS...';
    setHkStatus('Press your binding (Esc to cancel)', false);
  });
  const endRecording = () => { recording = false; hkInput.classList.remove('recording'); hkInput.blur(); };
  hkInput.addEventListener('mousedown', (e) => { if (recording) e.preventDefault(); });
  hkInput.addEventListener('blur', () => { if (recording) { recording = false; hkInput.classList.remove('recording'); hkInput.value = settings.globalHotkey || ''; } });
  hkInput.addEventListener('keydown', async (e) => {
    if (!recording) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Escape') {
      hkInput.value = settings.globalHotkey || '';
      setHkStatus('CANCELLED.', false);
      endRecording();
      return;
    }
    const accel = eventToAccelerator(e);
    if (!accel) return;
    await tryApply(accel);
    endRecording();
  });
  $('btn-hotkey-clear').addEventListener('click', () => tryApply(null));

  // ── cheat-sheet (spec 7.4, the keys this build has) ─────────────────────────
  function renderCheatsheet() {
    const hk = (settings.globalHotkey || '').toUpperCase();
    const rowsList = [
      ...(hk ? [[hk, 'Show or hide all regions']] : []),
      ['ARROWS', 'Move between tiles'],
      ['ENTER', 'Launch the focused tile'],
      ['A–Z / 0–9', 'Filter the active region'],
      ['BACKSPACE', 'Edit the filter'],
      ['ESC', 'Clear the filter, then leave edit mode'],
      ['F6 / SHIFT+F6', 'Next / previous region'],
      ['F2', 'Rename the focused tile (edit mode) or region name'],
      ['DELETE', 'Remove the focused tile; a moved shortcut goes back to the desktop (edit mode)'],
      ['CTRL+ARROWS', 'Move the focused tile; Up and Down move a row (edit mode)'],
      ['MENU / SHIFT+F10', 'Tile menu (edit mode); region menu (name focused)'],
      ['ALT+ARROWS', 'Nudge the region 8 px (name focused); with SHIFT 32 px'],
      ['DRAG HEADER', 'Move the region; hold ALT to skip snapping'],
      ['DRAG A TILE', 'Reorder it, or drop it on another region'],
      ['RIGHT-CLICK', 'Edit mode; on the header: region menu'],
      ['?', 'This list'],
    ];
    const el = $('cheat-list');
    el.innerHTML = '';
    for (const [k, d] of rowsList) {
      const row = document.createElement('div');
      row.className = 'cheat-row';
      const key = document.createElement('span');
      key.className = 'cheat-key';
      key.textContent = k;
      const desc = document.createElement('span');
      desc.className = 'cheat-desc';
      desc.textContent = d;
      row.append(key, desc);
      el.appendChild(row);
    }
  }
  const openCheatsheet = () => { renderCheatsheet(); $('cheatsheet-overlay').classList.remove('hidden'); };
  const closeCheatsheet = () => $('cheatsheet-overlay').classList.add('hidden');
  $('btn-open-cheatsheet').addEventListener('click', openCheatsheet);
  $('btn-close-cheatsheet').addEventListener('click', closeCheatsheet);

  // ── installed-app picker, for one region ───────────────────────────────────
  const elPicker = $('apps-picker');
  let installed = [];
  async function openAppPicker(regionId) {
    const region = state && state.regions.find((r) => r.id === regionId);
    if (!region) return;
    pickerRegionId = regionId;
    $('picker-title').textContent = `// ADD INSTALLED APP · ${region.name}`;
    const listEl2 = $('picker-list');
    listEl2.innerHTML = '';
    $('picker-search').value = '';
    $('picker-loading').classList.remove('hidden');
    elPicker.classList.remove('hidden');
    $('picker-search').focus();
    try { installed = await api.invoke('get-installed-apps'); } catch { installed = []; }
    if (pickerRegionId !== regionId) return;
    $('picker-loading').classList.add('hidden');
    renderPickerList(installed);
  }
  function closeAppPicker() { elPicker.classList.add('hidden'); pickerRegionId = null; }
  function renderPickerList(items) {
    const el = $('picker-list');
    el.innerHTML = '';
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'picker-empty';
      empty.textContent = 'NO MATCHES — USE BROWSE TO ADD BY FILE';
      el.appendChild(empty);
      return;
    }
    for (const item of items) {
      const row = document.createElement('div');
      row.className = 'picker-item';
      if (item.iconDataUrl) {
        const img = document.createElement('img');
        img.src = item.iconDataUrl;
        img.alt = '';
        row.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'picker-icon-placeholder';
        row.appendChild(ph);
      }
      const nm = document.createElement('span');
      nm.className = 'picker-item-name';
      nm.textContent = item.name;
      row.appendChild(nm);
      row.addEventListener('click', async () => {
        const target = pickerRegionId;
        closeAppPicker();
        if (target) await api.invoke('manager:add-installed', target, { name: item.name, appId: item.appId, iconDataUrl: item.iconDataUrl });
      });
      el.appendChild(row);
    }
  }
  $('picker-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    renderPickerList(q ? installed.filter((a) => a.name.toLowerCase().includes(q)) : installed);
  });
  $('btn-browse-picker').addEventListener('click', async () => {
    const target = pickerRegionId;
    closeAppPicker();
    if (target) await api.invoke('manager:add-file', target);
  });
  $('btn-close-picker').addEventListener('click', closeAppPicker);

  // ── Esc: close what is open first, then the Manager (spec 8) ───────────────
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (openPicker) { closeThemeList(); return; }
    if (popoverFor) { closeGlyphs(); return; }
    if (!elPicker.classList.contains('hidden')) { closeAppPicker(); return; }
    if (!$('cheatsheet-overlay').classList.contains('hidden')) { closeCheatsheet(); return; }
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT') && t !== document.body) { t.blur(); return; }
    api.invoke('manager:close');
  });

  // ── state from the main process ────────────────────────────────────────────
  let refreshing = null;
  let again = false;
  async function refresh() {
    if (refreshing) { again = true; return refreshing; }
    refreshing = (async () => {
      do {
        again = false;
        const iconRevision = iconRequestRevision, iconSettlement = iconSettlementRevision;
        const [st, se] = await Promise.all([api.invoke('manager:state'), api.invoke('get-settings')]);
        if (st) state = st;
        if (se) settings = { ...se, ...(iconRequestPending || iconRevision !== iconRequestRevision || iconSettlement !== iconSettlementRevision ? { iconSize: settings.iconSize || 64 } : {}) };
        applyTheme(state.theme);
        renderRegions();
        renderMoved();
        renderSettings();
      } while (again);
    })();
    try { await refreshing; } finally { refreshing = null; }
  }

  api.on('manager:changed', () => { refresh(); });
  api.on('settings-changed-externally', () => { refresh(); });
  api.on('manager:show-view', async (msg) => {
    const v = msg && msg.view;
    await refresh();
    if (v === 'picker') { showView('regions'); openAppPicker(msg.regionId); return; }
    if (v === 'cheatsheet') { openCheatsheet(); return; }
    showView(v === 'settings' ? 'settings' : 'regions');
    if (v === 'regions' && msg.regionId && rows.has(msg.regionId)) {
      const r = rows.get(msg.regionId);
      r.row.scrollIntoView({ block: 'nearest' });
      r.row.classList.add('mgr-flash');
      setTimeout(() => r.row.classList.remove('mgr-flash'), 1200);
      if (!state.matchAll) r.theme.input.focus();
    }
  });

  (async function init() {
    try {
      const list = await api.invoke('get-valid-themes');
      themes = (Array.isArray(list) ? list : []).slice().sort((a, b) => themeName(a).localeCompare(themeName(b)));
    } catch { themes = []; }
    $('app-version').textContent = `v${api.version}`;
    showView('regions');
    await refresh();
    const revision = updateRevision;
    const initialUpdate = await api.invoke('get-update-state');
    if (revision === updateRevision && initialUpdate) drawUpdate(initialUpdate);
    updatePause();
    // Listening: the main process delivers the view this window was opened for.
    api.invoke('renderer-ready').catch(() => {});
  })();
})();
