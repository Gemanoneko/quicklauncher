'use strict';
// RegionController: the main process owns every region. It keeps the store's
// `regions` and `apps`, one desktop-layer window per region (RegionHost), the
// webContents -> region map used to scope IPC, the active region, the shared
// hidden flag, placement while dragging, and the fan-out of the store's
// read-only merge to several renderers. See the tech plan § 1.

const { BrowserWindow, Menu, dialog, screen, powerMonitor, app } = require('electron');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { EventEmitter } = require('events');
const M = require('./model');
const P = require('./placement');
const { RegionHost } = require('../desktop/region-host');

const INDEX_HTML = path.join(__dirname, '../../renderer/index.html');
const PRELOAD = path.join(__dirname, '../preload.js');
const WATCHDOG_MS = 1000;
const SAVE_RECT_MS = 400;

const sameRect = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
const menuLabel = (s) => String(s).replace(/&/g, '&&'); // Windows menus read & as a mnemonic

class RegionController extends EventEmitter {
  constructor({ store, validThemes, killSwitch = false, testHooks = false, log = () => {} }) {
    super();
    this.store = store;
    this.validThemes = validThemes;
    this.killSwitch = killSwitch;
    this.testHooks = testHooks;
    this.log = log;
    this.rt = new Map();      // region id -> runtime
    this.byWc = new Map();    // webContents id -> region id
    this.activeId = null;
    this.hidden = false;
    this.latestSeq = 0;       // last store renderer-sync seq fanned out
    this.manager = null;      // set by index.js
    this._watchdog = null;
    this._ticking = false;
    this._displayTimer = null;
    this.saveErrorPending = false;
  }

  // ── store accessors ────────────────────────────────────────────────────────
  regions() { return this.store.get('regions') || []; }
  region(id) { return this.regions().find((r) => r.id === id) || null; }
  settings() { return this.store.get('settings') || {}; }
  apps() { return this.store.get('apps') || []; }
  primaryId() { const r = this.regions(); return r.length ? r[0].id : null; }
  workArea() { return screen.getPrimaryDisplay().workArea; }
  themes() { return [...this.validThemes]; }

  _setRegions(list) { this.store.set('regions', list); }
  _updateRegion(id, patch) {
    this._setRegions(this.regions().map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  _mirrorPrimaryTheme() {
    const s = this.settings();
    const t = M.effectiveTheme(this.regions()[0], s);
    if (s.theme !== t) this.store.set('settings', { ...s, theme: t });
  }

  // ── boot ───────────────────────────────────────────────────────────────────
  init() {
    const wa = this.workArea();
    const res = M.migrate(this.store.data, {
      workArea: { x: wa.x, y: wa.y, width: wa.width, height: wa.height },
      validThemes: this.validThemes, newId: randomUUID, defaultTheme: 'cyberpunk',
    });
    for (const n of res.notes) this.log({ event: 'migrate', note: n });
    if (res.migrated) this._backupPreRegions();
    if (res.changed) {
      this.store.set('apps', res.data.apps);
      this.store.set('settings', res.data.settings);
      this.store.set('regions', res.data.regions);
      this.store.set('regionsVersion', res.data.regionsVersion);
    }
    this._randomThemesAtStartup();
    this.activeId = this.primaryId();

    // Shown rects: saved rects fitted to the current work area (nothing saved).
    const fitted = this._fitAll();
    this.regions().forEach((r, i) => this._spawn(r, fitted[i]));

    this._watchdog = setInterval(() => this._tickAll(), WATCHDOG_MS);
    const onDisplay = () => {
      clearTimeout(this._displayTimer);
      this._displayTimer = setTimeout(() => this.relayoutAll('display change'), 300);
    };
    screen.on('display-metrics-changed', onDisplay);
    screen.on('display-added', onDisplay);
    screen.on('display-removed', onDisplay);
    try { powerMonitor.on('resume', () => setTimeout(() => this.relayoutAll('resume'), 1000)); } catch { /* noop */ }
    if (this.testHooks) {
      this._metricsTimer = setInterval(() => this.log({ event: 'metrics', ...this.metrics() }), 10000);
    }
  }

  // One-time copy of the single-grid data file, before the first migrated save.
  _backupPreRegions() {
    try {
      const src = this.store.dataPath;
      const dest = path.join(path.dirname(src), 'quicklauncher-data.pre-regions.json');
      if (fs.existsSync(src) && !fs.existsSync(dest)) {
        fs.copyFileSync(src, dest, fs.constants.COPYFILE_EXCL);
        this.log({ event: 'migrate', note: `kept a copy of the pre-regions data file as ${path.basename(dest)}` });
      }
    } catch (e) {
      this.log({ event: 'migrate', note: `pre-regions copy not made: ${e && (e.code || e.message)}` });
    }
  }

  // Spec 6.3 / Q9: every region re-rolls; one shared theme while Match all is on.
  _randomThemesAtStartup() {
    const s = this.settings();
    if (s.randomTheme === false || !this.validThemes.size) return;
    const themes = this.themes();
    const regs = this.regions().map((r) => ({ ...r, theme: M.pickOtherTheme(themes, r.theme) }));
    const next = { ...s };
    if (s.matchAll) next.sharedTheme = M.pickOtherTheme(themes, s.sharedTheme || M.effectiveTheme(regs[0], s));
    next.theme = M.effectiveTheme(regs[0], next);
    this._setRegions(regs);
    this.store.set('settings', next);
  }

  // ── runtimes and windows ───────────────────────────────────────────────────
  _minFor(region) {
    return region.layout === 'grid' ? { width: M.GRID.minWidth, height: M.GRID.minHeight } : { width: 0, height: 0 };
  }

  _fitAll() {
    const inner = P.innerArea(this.workArea());
    const regs = this.regions();
    return P.relayout(regs.map((r) => r.rect), inner, regs.map((r) => this._minFor(r))).rects;
  }

  _windowRectDip(region, shown) {
    const rim = region.layout === 'grid' ? M.GRID.rim : 0;
    return { x: shown.x - rim, y: shown.y - rim, width: shown.width + 2 * rim, height: shown.height + 2 * rim };
  }

  _screenRect(region, shown) {
    const p = screen.dipToScreenRect(null, this._windowRectDip(region, shown));
    return { left: p.x, top: p.y, right: p.x + p.width, bottom: p.y + p.height };
  }

  _spawn(region, shown) {
    const rt = {
      id: region.id, shown: { ...(shown || region.rect) }, host: null, win: null, wc: null,
      ready: false, sentTheme: null, syncedSeq: this.latestSeq, windows: 0, drag: null, resize: null, saveTimer: null,
    };
    this.rt.set(region.id, rt);
    rt.host = new RegionHost({
      tag: region.id.slice(0, 8),
      createWindow: () => this._createRegionWindow(rt),
      screenRect: this._screenRect(region, rt.shown),
      killSwitch: this.killSwitch,
      hidden: this.hidden,
      log: (o) => this.log(o),
    });
    rt.host.on('mode', () => { this._notifyState(rt.id); this._managerChanged(); });
    rt.host.start().catch((e) => this.log({ event: 'host-start-error', region: rt.id, error: String(e && e.message) }));
    return rt;
  }

  _createRegionWindow(rt) {
    return new Promise((resolve, reject) => {
      const region = this.region(rt.id);
      if (!region) { reject(new Error('region gone')); return; }
      rt.windows++;
      const rebuilt = rt.windows > 1;
      const b = this._windowRectDip(region, rt.shown);
      const win = new BrowserWindow({
        x: b.x, y: b.y, width: b.width, height: b.height,
        show: false, frame: false, transparent: true, backgroundColor: '#00000000',
        resizable: false, minimizable: false, maximizable: false, fullscreenable: false,
        thickFrame: false, hasShadow: false, skipTaskbar: true, alwaysOnTop: false, focusable: true,
        title: 'QuickLauncher',
        webPreferences: {
          preload: PRELOAD, contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: false,
          additionalArguments: [`--app-version=${app.getVersion()}`],
        },
      });
      const wcId = win.webContents.id;
      this.byWc.set(wcId, rt.id);
      rt.win = win;
      rt.wc = win.webContents;
      rt.ready = false;
      win.webContents.on('did-start-navigation', (details) => {
        // A reloaded page must announce itself again before it gets store messages.
        if (details && details.isMainFrame && !details.isSameDocument) rt.ready = false;
      });
      win.on('closed', () => {
        this.byWc.delete(wcId);
        if (rt.win === win) { rt.win = null; rt.wc = null; rt.ready = false; }
      });
      let settled = false;
      win.once('ready-to-show', () => { settled = true; resolve(win); });
      win.webContents.once('did-fail-load', (_e, code, desc) => {
        if (settled) return;
        settled = true;
        try { win.destroy(); } catch { /* gone */ }
        reject(new Error(`region page failed to load: ${code} ${desc}`));
      });
      win.loadFile(INDEX_HTML, { query: { region: rt.id, rebuilt: rebuilt ? '1' : '0' } });
      if (rebuilt) this.log({ event: 'rebuild', region: rt.id.slice(0, 8), window: rt.windows });
    });
  }

  async _tickAll() {
    if (this._ticking) return;
    this._ticking = true;
    try {
      // Primary first; the rest in parallel so a full rebuild stays near 1 s.
      const order = this.regions().map((r) => this.rt.get(r.id)).filter(Boolean);
      if (order.length) await order[0].host.tick();
      await Promise.all(order.slice(1).map((rt) => rt.host.tick()));
    } finally {
      this._ticking = false;
    }
  }

  _applyShown(rt, rect) {
    rt.shown = { ...rect };
    const region = this.region(rt.id);
    if (!region) return;
    rt.host.setScreenRect(this._screenRect(region, rt.shown));
  }

  _shownRects(exceptId) {
    return [...this.rt.values()].filter((r) => r.id !== exceptId).map((r) => r.shown);
  }

  relayoutAll(reason) {
    const fitted = this._fitAll();
    this.regions().forEach((r, i) => {
      const rt = this.rt.get(r.id);
      if (rt && !sameRect(rt.shown, fitted[i])) this._applyShown(rt, fitted[i]);
    });
    this.log({ event: 'relayout', reason, workArea: this.workArea() });
  }

  _saveRectSoon(rt) {
    clearTimeout(rt.saveTimer);
    rt.saveTimer = setTimeout(() => {
      rt.saveTimer = null;
      if (!this.region(rt.id)) return;
      const wa = this.workArea();
      this._updateRegion(rt.id, { rect: { ...rt.shown }, home: { x: wa.x, y: wa.y, width: wa.width, height: wa.height } });
      if (this.testHooks) this.log({ event: 'rect-saved', region: rt.id.slice(0, 8), rect: rt.shown });
    }, SAVE_RECT_MS);
  }

  // ── renderer-facing: scope by sender ─────────────────────────────────────────
  regionIdOf(wc) { return wc ? this.byWc.get(wc.id) || null : null; }

  itemsForRenderer(id) {
    const rt = this.rt.get(id);
    if (rt) rt.syncedSeq = this.latestSeq; // a page that fetches now holds the current state
    return M.itemsOf(this.apps(), id);
  }

  settingsFor(id) {
    const s = this.settings();
    const theme = M.effectiveTheme(this.region(id), s);
    const rt = this.rt.get(id);
    if (rt) rt.sentTheme = theme;
    return { ...s, theme };
  }

  info(id) {
    const region = this.region(id);
    if (!region) return null;
    const rt = this.rt.get(id);
    const s = this.settings();
    return {
      id, name: region.name, icon: region.icon, layout: region.layout,
      primary: this.primaryId() === id, active: this.activeId === id,
      matchAll: !!s.matchAll, regionCount: this.regions().length,
      mode: rt ? rt.host.mode : 'pending', hidden: this.hidden,
    };
  }

  _notifyState(id) {
    const rt = this.rt.get(id);
    if (rt && rt.wc && !rt.wc.isDestroyed()) rt.wc.send('region:state', this.info(id));
  }
  _notifyAllStates() { for (const id of this.rt.keys()) this._notifyState(id); }
  _command(id, cmd, extra = {}) {
    const rt = this.rt.get(id);
    if (rt && rt.wc && !rt.wc.isDestroyed()) rt.wc.send('region:command', { cmd, ...extra });
  }
  _pushItems(id) {
    const rt = this.rt.get(id);
    if (rt && rt.wc && !rt.wc.isDestroyed()) rt.wc.send('region:items-changed', M.itemsOf(this.apps(), id));
  }
  _managerChanged() { if (this.manager) this.manager.changed(); }

  /** Any region or the Manager: settings (icon size, reduced motion, theme) were changed elsewhere. */
  broadcastSettingsChanged() {
    for (const rt of this.rt.values()) {
      if (rt.wc && !rt.wc.isDestroyed()) rt.wc.send('settings-changed-externally');
    }
    this._managerChanged();
  }

  // Send each region whose shown theme changed a nudge to re-read its settings.
  _pushThemes(exceptId = null) {
    const s = this.settings();
    for (const rt of this.rt.values()) {
      const eff = M.effectiveTheme(this.region(rt.id), s);
      if (rt.id === exceptId) { rt.sentTheme = eff; continue; }
      if (eff !== rt.sentTheme && rt.wc && !rt.wc.isDestroyed()) rt.wc.send('settings-changed-externally');
    }
    this._managerChanged();
  }

  primaryWebContents() {
    const rt = this.rt.get(this.primaryId());
    return rt && rt.wc && !rt.wc.isDestroyed() ? rt.wc : null;
  }

  /** For store messages: false when the primary page is not listening yet. */
  sendToPrimary(channel, ...args) {
    const rt = this.rt.get(this.primaryId());
    if (!rt || !rt.ready || !rt.wc || rt.wc.isDestroyed()) return false;
    rt.wc.send(channel, ...args);
    return true;
  }

  rendererReady(id) {
    const rt = this.rt.get(id);
    if (!rt) return;
    rt.ready = true;
    if (id === this.primaryId() && this.saveErrorPending) {
      this.saveErrorPending = false;
      rt.wc.send('store-save-error');
    }
  }

  // ── saves from a region page ──────────────────────────────────────────────
  saveItemsFromRenderer(id, sanitized) {
    if (!this.region(id)) return;
    const rt = this.rt.get(id);
    const all = this.apps();
    const byId = new Map(all.map((a) => [a && a.id, a]));
    // Keep fields the page does not know about (kind, origin) from the stored item.
    const items = sanitized.map((s) => ({ ...(byId.get(s.id) || {}), ...s, regionId: id }));
    const view = this.store.rendererView('apps');
    if (view !== undefined && rt && rt.syncedSeq < this.latestSeq) {
      // This page still shows the pre-merge copy: merge its change against that copy.
      this.store.setFromRenderer('apps', M.replaceRegionItems(view, id, items));
      this._repairItems();
    } else {
      this.store.set('apps', M.replaceRegionItems(all, id, items));
    }
    this._managerChanged();
  }

  /** From a region page: only a theme change is taken (the page has no other settings UI). */
  applyRegionSettings(id, incoming) {
    const rt = this.rt.get(id);
    if (!rt || !incoming || typeof incoming.theme !== 'string') return;
    if (incoming.theme === rt.sentTheme || !this.validThemes.has(incoming.theme)) return;
    this.setTheme(id, incoming.theme, { fromPage: true });
  }

  /** From the Manager or the tray: a patch of global settings. */
  applySettingsPatch(patch) {
    if (!patch || !Object.keys(patch).length) return;
    this.store.set('settings', { ...this.settings(), ...patch });
    this.broadcastSettingsChanged();
  }

  // ── store read-only merge, fanned out to every region ────────────────────
  onStoreRendererSync() {
    const p = this.store.pendingRendererState();
    if (!p) return;
    this.latestSeq = p.seq;
    this._repairItems();
    for (const rt of this.rt.values()) {
      if (!rt.ready || !rt.wc || rt.wc.isDestroyed()) continue;
      rt.wc.send('store-reloaded', { seq: p.seq, apps: M.itemsOf(this.apps(), rt.id), settings: this.settingsFor(rt.id) });
    }
    this._maybeSynced();
  }

  ack(id, seq) {
    const rt = this.rt.get(id);
    if (!rt || !Number.isInteger(seq)) return;
    rt.syncedSeq = Math.max(rt.syncedSeq, seq);
    this._maybeSynced();
  }

  _maybeSynced() {
    if (!this.store.pendingRendererState()) return;
    const all = [...this.rt.values()].every((rt) => !rt.ready || rt.syncedSeq >= this.latestSeq);
    if (all) this.store.rendererSynced(this.latestSeq);
  }

  _repairItems() {
    const r = M.repairItems(this.apps(), this.regions());
    if (r.moved) {
      this.store.set('apps', r.apps);
      this.log({ event: 'repair', note: `${r.moved} shortcut(s) went to the primary region` });
    }
  }

  /** After the store merged a read-only stretch: regions on disk may differ. */
  onStoreReconciled() {
    const res = M.migrate(this.store.data, {
      workArea: this.workArea(), validThemes: this.validThemes, newId: randomUUID, defaultTheme: 'cyberpunk',
    });
    if (res.changed) {
      this.store.set('apps', res.data.apps);
      this.store.set('settings', res.data.settings);
      this.store.set('regions', res.data.regions);
    }
    const ids = new Set(this.regions().map((r) => r.id));
    for (const [id, rt] of this.rt) if (!ids.has(id)) { rt.host.stop(); this.rt.delete(id); }
    const fitted = this._fitAll();
    this.regions().forEach((r, i) => { if (!this.rt.has(r.id)) this._spawn(r, fitted[i]); });
    this._notifyAllStates();
    this._managerChanged();
  }

  // ── region operations ──────────────────────────────────────────────────────
  createRegion(layout = 'grid') {
    if (!M.BUILT_LAYOUTS.has(layout)) return { ok: false, error: `${layout} regions are not available yet.` };
    const regs = this.regions();
    if (regs.length >= M.REGION_CAP) return { ok: false, error: M.STRINGS.cap };
    const wa = this.workArea();
    const rect = P.placeNew({ width: M.GRID.defaultWidth, height: M.GRID.defaultHeight }, P.innerArea(wa), this._shownRects());
    if (!rect) return { ok: false, error: M.STRINGS.noRoom };
    const region = {
      id: randomUUID(), name: M.nextDefaultName(regs), icon: 'apps', layout,
      theme: M.effectiveTheme(regs[0], this.settings()), rect,
      home: { x: wa.x, y: wa.y, width: wa.width, height: wa.height },
    };
    this._setRegions([...regs, region]);
    this._spawn(region, rect);
    this._notifyAllStates();
    this._managerChanged();
    this.emit('regions-changed');
    this.log({ event: 'region-created', region: region.id.slice(0, 8), rect });
    return { ok: true, id: region.id };
  }

  async deleteRegion(id, { parent = null, confirm = true } = {}) {
    const regs = this.regions();
    const region = regs.find((r) => r.id === id);
    if (!region) return { ok: false, error: 'Region not found.' };
    if (regs.length <= 1) return { ok: false, error: M.STRINGS.lastRegion };
    const items = M.itemsOf(this.apps(), id);
    const text = M.deleteConfirmText(region, items);
    if (confirm && text.needsConfirm) {
      const opts = {
        type: 'warning', title: 'QuickLauncher', message: text.message, detail: text.detail,
        buttons: ['Delete region', 'Cancel'], defaultId: 1, cancelId: 1, noLink: true,
      };
      const r = parent ? await dialog.showMessageBox(parent, opts) : await dialog.showMessageBox(opts);
      if (r.response !== 0) return { ok: false, cancelled: true };
    }
    const now = this.regions();
    if (now.length <= 1 || !now.some((r) => r.id === id)) return { ok: false, error: M.STRINGS.lastRegion };
    // M1 has no moved desktop files: every item is a reference and goes with the region (Q4).
    this.store.set('apps', this.apps().filter((a) => !(a && a.regionId === id)));
    this._setRegions(now.filter((r) => r.id !== id));
    const rt = this.rt.get(id);
    if (rt) { clearTimeout(rt.saveTimer); rt.host.stop(); this.rt.delete(id); }
    if (this.activeId === id) this.activeId = this.primaryId();
    this._mirrorPrimaryTheme();
    this._pushThemes();
    this._notifyAllStates();
    this._managerChanged();
    this.emit('regions-changed');
    this.log({ event: 'region-deleted', region: id.slice(0, 8), items: items.length });
    return { ok: true };
  }

  rename(id, name) {
    const v = M.validateName(name, this.regions(), id);
    if (!v.ok) return v;
    this._updateRegion(id, { name: v.name });
    this._notifyAllStates(); // other regions' tile menus list it by name
    this._managerChanged();
    return { ok: true, name: v.name };
  }

  setIcon(id, icon) {
    if (!M.ICONS.includes(icon) || !this.region(id)) return { ok: false };
    this._updateRegion(id, { icon });
    this._notifyState(id);
    this._managerChanged();
    return { ok: true };
  }

  setTheme(id, theme, { fromPage = false } = {}) {
    if (!this.validThemes.has(theme) || !this.region(id)) return { ok: false };
    const s = this.settings();
    if (s.matchAll) this.store.set('settings', { ...s, sharedTheme: theme });
    else this._updateRegion(id, { theme });
    this._mirrorPrimaryTheme();
    this._pushThemes(fromPage ? id : null);
    return { ok: true };
  }

  randomTheme(id) {
    const s = this.settings();
    const current = s.matchAll ? (s.sharedTheme || M.effectiveTheme(this.region(id), s)) : (this.region(id) || {}).theme;
    return this.setTheme(id, M.pickOtherTheme(this.themes(), current));
  }

  setMatchAll(on, fromId = null) {
    const s = this.settings();
    const next = { ...s, matchAll: !!on };
    if (on) next.sharedTheme = M.effectiveTheme(this.region(fromId || this.primaryId()), s);
    this.store.set('settings', next);
    this._mirrorPrimaryTheme();
    this._pushThemes();
    this._notifyAllStates();
    return { ok: true };
  }

  setSharedTheme(theme) {
    const s = this.settings();
    if (!s.matchAll || !this.validThemes.has(theme)) return { ok: false };
    this.store.set('settings', { ...s, sharedTheme: theme });
    this._mirrorPrimaryTheme();
    this._pushThemes();
    return { ok: true };
  }

  moveItemToRegion(itemId, targetId) {
    const item = this.apps().find((a) => a && a.id === itemId);
    if (!item || !this.region(targetId) || item.regionId === targetId) return { ok: false };
    const from = item.regionId;
    const next = M.moveItem(this.apps(), itemId, targetId);
    if (!next) return { ok: false };
    this.store.set('apps', next);
    this._pushItems(from);
    this._pushItems(targetId);
    this._managerChanged();
    return { ok: true };
  }

  addItems(regionId, entries) {
    if (!this.region(regionId)) return { ok: false, added: 0 };
    const mine = new Set(M.itemsOf(this.apps(), regionId).map((a) => a.path));
    const fresh = (entries || []).filter((e) => e && e.id && e.path && !mine.has(e.path));
    if (!fresh.length) return { ok: true, added: 0 };
    const all = this.apps();
    const items = [...M.itemsOf(all, regionId), ...fresh.map((e) => ({ ...e, regionId }))];
    this.store.set('apps', M.replaceRegionItems(all, regionId, items));
    this._pushItems(regionId);
    this._managerChanged();
    return { ok: true, added: fresh.length };
  }

  // ── focus, active region, hide/show ───────────────────────────────────────
  setActive(id) {
    if (!this.region(id) || this.activeId === id) return;
    const old = this.activeId;
    this.activeId = id;
    if (old) this._notifyState(old);
    this._notifyState(id);
  }

  onPointerDown(id) {
    const rt = this.rt.get(id);
    if (!rt) return;
    this.setActive(id);
    rt.host.focusAfterClick();
    try { this.store.recheck(); } catch { /* noop */ }
  }

  cycle(id, dir) {
    const regs = this.regions();
    if (regs.length < 2) return;
    const i = Math.max(0, regs.findIndex((r) => r.id === id));
    const next = regs[(i + (dir < 0 ? -1 : 1) + regs.length) % regs.length];
    this.setActive(next.id);
    const rt = this.rt.get(next.id);
    if (rt) rt.host.focusAfterClick();
  }

  isHidden() { return this.hidden; }

  hideAll() {
    this.hidden = true;
    for (const rt of this.rt.values()) {
      rt.host.setHidden(true);
      if (rt.wc && !rt.wc.isDestroyed()) rt.wc.send('region:reset-view');
    }
  }

  showAll() {
    this.hidden = false;
    for (const rt of this.rt.values()) rt.host.setHidden(false);
  }

  toggleAll() { if (this.hidden) this.showAll(); else this.hideAll(); }

  // ── move and resize (script-driven, spec 4) ───────────────────────────────
  drag(id, { phase, dx = 0, dy = 0, alt = false } = {}) {
    const rt = this.rt.get(id);
    if (!rt) return { ok: false };
    if (phase === 'start') {
      rt.drag = { start: { ...rt.shown }, last: { ...rt.shown } };
      return { ok: true };
    }
    if (!rt.drag) return { ok: false };
    if (phase === 'move') {
      const s = rt.drag.start;
      const proposed = { ...s, x: s.x + Math.round(dx), y: s.y + Math.round(dy) };
      const res = P.dragStep(rt.drag.last, proposed, P.innerArea(this.workArea()), this._shownRects(id), { alt: !!alt });
      rt.drag.last = res.rect;
      if (!sameRect(res.rect, rt.shown)) this._applyShown(rt, res.rect);
      return { ok: true, snapped: res.snapped, blocked: res.blocked };
    }
    const moved = !sameRect(rt.drag.start, rt.shown);
    rt.drag = null;
    if (moved) this._saveRectSoon(rt);
    return { ok: true, moved };
  }

  resize(id, { phase, edges = {}, dx = 0, dy = 0, alt = false } = {}) {
    const rt = this.rt.get(id);
    const region = this.region(id);
    if (!rt || !region || region.layout !== 'grid') return { ok: false };
    if (phase === 'start') {
      rt.resize = { start: { ...rt.shown }, edges: { ...edges } };
      return { ok: true };
    }
    if (!rt.resize) return { ok: false };
    if (phase === 'move') {
      const res = P.resizeStep(rt.resize.start, rt.resize.edges, Math.round(dx), Math.round(dy),
        P.innerArea(this.workArea()), this._shownRects(id), { width: M.GRID.minWidth, height: M.GRID.minHeight }, { alt: !!alt });
      if (!sameRect(res.rect, rt.shown)) this._applyShown(rt, res.rect);
      return { ok: true, blocked: res.blocked };
    }
    const changed = !sameRect(rt.resize.start, rt.shown);
    rt.resize = null;
    if (changed) this._saveRectSoon(rt);
    return { ok: true, changed };
  }

  nudge(id, dx, dy) {
    const rt = this.rt.get(id);
    if (!rt || rt.drag || rt.resize) return { ok: false };
    const proposed = { ...rt.shown, x: rt.shown.x + Math.round(dx), y: rt.shown.y + Math.round(dy) };
    const res = P.moveConstrained(rt.shown, proposed, P.innerArea(this.workArea()), this._shownRects(id));
    if (sameRect(res.rect, rt.shown)) return { ok: true, blocked: true };
    this._applyShown(rt, res.rect);
    this._saveRectSoon(rt);
    return { ok: true, blocked: res.blocked };
  }

  place(id, where) {
    const rt = this.rt.get(id);
    if (!rt) return { ok: false };
    const r = P.placeAt(where, rt.shown, P.innerArea(this.workArea()), this._shownRects(id));
    if (!r) return { ok: false };
    this._applyShown(rt, r);
    this._saveRectSoon(rt);
    return { ok: true };
  }

  // ── native menus (spec 9.2) ───────────────────────────────────────────────
  popupRegionMenu(id, x, y) {
    const rt = this.rt.get(id);
    const region = this.region(id);
    if (!rt || !rt.win || !region) return;
    const s = this.settings();
    const many = this.regions().length > 1;
    const place = [
      ['Top left', 'top-left'], ['Top right', 'top-right'], ['Bottom left', 'bottom-left'],
      ['Bottom right', 'bottom-right'], ['Center', 'center'],
    ].map(([label, where]) => ({ label, click: () => this.place(id, where) }));
    const tpl = [
      { label: 'Edit shortcuts', click: () => this._command(id, 'edit') },
      { label: 'Add file…', click: () => this._command(id, 'add-file') },
      { label: 'Add installed app…', click: () => this.manager && this.manager.open('picker', { regionId: id }) },
      { type: 'separator' },
      { label: 'Rename', click: () => this._command(id, 'rename-region') },
      { label: 'Place', submenu: place },
      { label: 'Theme…', click: () => this.manager && this.manager.open('regions', { regionId: id }) },
      { label: 'Random theme', click: () => this.randomTheme(id) },
      { label: 'Match all regions', type: 'checkbox', checked: !!s.matchAll, click: (item) => this.setMatchAll(item.checked, id) },
      { type: 'separator' },
      { label: 'Delete region…', enabled: many, click: () => { this.deleteRegion(id).catch(() => {}); } },
      { type: 'separator' },
      { label: 'Settings…', click: () => this.manager && this.manager.open('settings') },
      { label: 'Hide all regions', click: () => this.hideAll() },
    ];
    Menu.buildFromTemplate(tpl).popup({ window: rt.win, x: Math.round(x), y: Math.round(y) });
  }

  popupTileMenu(id, itemId, x, y) {
    const rt = this.rt.get(id);
    if (!rt || !rt.win) return;
    const item = this.apps().find((a) => a && a.id === itemId && a.regionId === id);
    if (!item) return;
    const others = this.regions().filter((r) => r.id !== id);
    const tpl = [
      { label: 'Rename', click: () => this._command(id, 'rename-tile', { itemId }) },
      others.length
        ? { label: 'Move to', submenu: others.map((r) => ({ label: menuLabel(r.name), click: () => this.moveItemToRegion(itemId, r.id) })) }
        : { label: 'Move to', enabled: false },
      { label: 'Remove', click: () => this._command(id, 'remove-tile', { itemId }) },
    ];
    Menu.buildFromTemplate(tpl).popup({ window: rt.win, x: Math.round(x), y: Math.round(y) });
  }

  // ── Manager view of the state ─────────────────────────────────────────────
  managerState() {
    const s = this.settings();
    const apps = this.apps();
    return {
      regions: this.regions().map((r, i) => ({
        id: r.id, name: r.name, icon: r.icon, layout: r.layout, theme: r.theme,
        count: M.itemsOf(apps, r.id).length, primary: i === 0,
        mode: this.rt.get(r.id) ? this.rt.get(r.id).host.mode : 'pending',
        shown: this.rt.get(r.id) ? { ...this.rt.get(r.id).shown } : null,
      })),
      matchAll: !!s.matchAll,
      sharedTheme: s.sharedTheme || null,
      theme: M.effectiveTheme(this.regions()[0], s),
      cap: M.REGION_CAP,
      icons: M.ICONS,
      layouts: [...M.BUILT_LAYOUTS],
      strings: { cap: M.STRINGS.cap, lastRegion: M.STRINGS.lastRegion },
    };
  }

  // ── tests and diagnostics (--ql-test-hooks only) ──────────────────────────
  describe() {
    return this.regions().map((r) => {
      const rt = this.rt.get(r.id);
      return {
        id: r.id, name: r.name, saved: r.rect, shown: rt ? rt.shown : null, ready: rt ? rt.ready : false,
        windows: rt ? rt.windows : 0, host: rt ? rt.host.describe() : null,
        windowDip: rt ? this._windowRectDip(r, rt.shown) : null,
        screenRect: rt ? this._screenRect(r, rt.shown) : null,
      };
    });
  }

  metrics() {
    const procs = app.getAppMetrics();
    const mem = procs.reduce((n, p) => n + ((p.memory && p.memory.workingSetSize) || 0), 0);
    const priv = procs.reduce((n, p) => n + ((p.memory && p.memory.privateBytes) || 0), 0);
    const tabPriv = procs.filter((p) => p.type === 'Tab').map((p) => Math.round(((p.memory && p.memory.privateBytes) || 0) / 1024));
    const cpu = procs.reduce((n, p) => n + ((p.cpu && p.cpu.percentCPUUsage) || 0), 0);
    return {
      regions: this.rt.size, processes: procs.length, workingSetMB: Math.round(mem / 1024),
      privateMB: Math.round(priv / 1024), rendererPrivateMB: tabPriv,
      cpuPercent: Math.round(cpu * 10) / 10,
      byType: procs.reduce((m, p) => { m[p.type] = (m[p.type] || 0) + 1; return m; }, {}),
    };
  }

  // ── quit ───────────────────────────────────────────────────────────────────
  releaseAll() {
    clearInterval(this._watchdog);
    clearInterval(this._metricsTimer);
    this._watchdog = null;
    let released = 0;
    for (const rt of this.rt.values()) {
      clearTimeout(rt.saveTimer);
      if (rt.host.stop().released) released++;
    }
    this.rt.clear();
    return released;
  }

  /** Write rect saves still inside their 400 ms debounce (quit paths call this before store.flush). */
  flushPendingRects() {
    for (const rt of this.rt.values()) {
      if (!rt.saveTimer) continue;
      clearTimeout(rt.saveTimer);
      rt.saveTimer = null;
      const wa = this.workArea();
      this._updateRegion(rt.id, { rect: { ...rt.shown }, home: { x: wa.x, y: wa.y, width: wa.width, height: wa.height } });
    }
  }
}

module.exports = { RegionController };
