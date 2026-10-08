'use strict';
// RegionController: the main process owns every region. It keeps the store's
// `regions` and `apps`, one desktop-layer window per region (RegionHost), the
// webContents -> region map used to scope IPC, the active region, the shared
// hidden flag, placement while dragging, and the fan-out of the store's
// read-only merge to several renderers. See the tech plan § 1.

const { BrowserWindow, Menu, dialog, screen, powerMonitor, app, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { EventEmitter } = require('events');
const M = require('./model');
const P = require('./placement');
const L = require('./layouts');
const R = require('../../renderer/radial-layout');
const { RegionHost } = require('../desktop/region-host');
const MR = require('../moves/rules');
const { Mover } = require('../moves/mover');

const INDEX_HTML = path.join(__dirname, '../../renderer/index.html');
const PRELOAD = path.join(__dirname, '../preload.js');
const WATCHDOG_MS = 1000;
const SAVE_RECT_MS = 400;
const DISPLAY_SETTLE_MS = 300;  // display events come in bursts
const RESUME_SETTLE_MS = 1000;  // the work area is often not final the moment the PC wakes
const DROP_REPLY_MS = 2000;     // a target page that does not answer a drop cancels it

const sameRect = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
const menuLabel = (s) => String(s).replace(/&/g, '&&'); // Windows menus read & as a mnemonic
const layoutLabel = (l) => l.charAt(0).toUpperCase() + l.slice(1);
const NO_EXTRAS = Object.freeze({ edit: false, notice: false });

class RegionController extends EventEmitter {
  constructor({ store, validThemes, killSwitch = false, testHooks = false, log = () => {},
    moveSetup = null, win32 = null, buildEntry = null, env = process.env }) {
    super();
    this.store = store;
    this.validThemes = validThemes;
    this.killSwitch = killSwitch;
    this.testHooks = testHooks;
    this.log = log;
    // M3, the safe file move (tech plan § 3): set up in init(); null until then.
    this.moveSetup = moveSetup;
    this.win32 = win32;
    this.buildEntry = buildEntry;
    this.env = env;
    this.mover = null;
    // --ql-test-hooks only: message boxes are recorded and answered from a
    // queue (default: the cancel button), never shown; "Open folder" is
    // recorded, never run; move steps can pause, crash or fail on purpose.
    this.boxLog = [];
    this._boxAnswers = [];
    this.openedLog = [];
    this._mh = { pauseAt: null, crashAt: null, fault: null, stepFault: null, paused: null, resume: null };
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
    this.tileDrag = null;      // a tile dragged out of its region (spec 5.3), see tileDragFrom
    this._tileDragSeq = 0;
    // --ql-test-hooks only: a stand-in work area (no display is changed), item
    // caps per region, and native menus recorded instead of shown.
    this._testWorkArea = null;
    this._testCaps = new Map();
    this.menuLog = [];
    this._lastMenu = null;
  }

  // ── store accessors ────────────────────────────────────────────────────────
  regions() { return this.store.get('regions') || []; }
  region(id) { return this.regions().find((r) => r.id === id) || null; }
  settings() { return this.store.get('settings') || {}; }
  apps() { return this.store.get('apps') || []; }
  primaryId() { const r = this.regions(); return r.length ? r[0].id : null; }
  workArea() { return this._testWorkArea ? { ...this._testWorkArea } : screen.getPrimaryDisplay().workArea; }
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
    // Display changes and sleep/resume (spec 4.4): the home-layout rule in
    // relayoutAll. A drag in flight is cancelled first (its coordinates
    // belong to the old work area).
    this._onDisplay = (reason = 'display change') => {
      this._cancelGestures(reason);
      clearTimeout(this._displayTimer);
      this._displayTimer = setTimeout(() => this.relayoutAll(reason), DISPLAY_SETTLE_MS);
    };
    this._onResume = () => {
      this._cancelGestures('resume');
      clearTimeout(this._resumeTimer);
      this._resumeTimer = setTimeout(() => this.relayoutAll('resume'), RESUME_SETTLE_MS);
    };
    screen.on('display-metrics-changed', () => this._onDisplay());
    screen.on('display-added', () => this._onDisplay());
    screen.on('display-removed', () => this._onDisplay());
    try {
      powerMonitor.on('suspend', () => this._cancelGestures('suspend'));
      powerMonitor.on('resume', () => this._onResume());
    } catch { /* noop */ }
    if (this.testHooks) {
      this._metricsTimer = setInterval(() => this.log({ event: 'metrics', ...this.metrics() }), 10000);
    }
    this._initMoves();
  }

  // ── M3: the safe file move (tech plan § 3) ────────────────────────────────
  // The mover owns every file operation; the controller is its data adapter
  // (items in the store, committed to disk at once) and shows its boxes.
  _initMoves() {
    const s = this.moveSetup || { available: false, reason: 'not set up', folders: {} };
    const win32 = this.win32 || require('../moves/win32');
    const data = {
      apps: () => this.apps(),
      // Set and write now: a journal entry is marked done only once this is on disk.
      commit: (apps) => {
        this.store.set('apps', apps);
        const onDisk = typeof this.store.flush === 'function' ? this.store.flush() : true;
        this._managerChanged();
        return onDisk !== false;
      },
      regionExists: (id) => !!this.region(id),
      regionIds: () => this.regions().map((r) => r.id), // region order: which of several tiles on one file takes a drop (C2)
      primaryId: () => this.primaryId(),
      writable: () => !(typeof this.store.isReadOnly === 'function' && this.store.isReadOnly()),
      capOf: (id) => { const r = this.region(id); return r ? this._capOf(r) : Infinity; },
      canAccept: (id, count) => { const r = this.region(id); return !r || !R.isRadial(r.layout) || (count <= this._capOf(r) && !!this._findRadialFit(r, count)); },
    };
    this.mover = new Mover({
      folders: s.folders || {}, journalDir: path.dirname(this.store.dataPath), data, win32, confineTo: s.confineTo || null,
      available: !!s.available, reason: s.reason,
      buildEntry: this.buildEntry || undefined,
      log: (o) => this.log(o),
      hooks: this.testHooks ? this._moveHooks() : null,
    });
    // After a commit is on disk and its journal entry is done: only now the page gets the tile.
    this.mover.on('changed', ({ regionIds }) => {
      for (const id of regionIds || []) this._pushItems(id);
      this._managerChanged();
    });
    this.mover.init()
      .then(() => { for (const r of this.regions()) this._pushItems(r.id); this._managerChanged(); })
      .catch((e) => this.log({ event: 'moves-init-error', error: String(e && e.message) }));
  }

  _moveHooks() {
    return {
      step: async (name, ctx) => {
        const h = this._mh;
        if (h.crashAt === name) {
          // A crash at this step: nothing after it runs (no journal update, no
          // flush of a pending debounce). The windows leave Explorer's tree first.
          this.log({ event: 'test-crash', step: name });
          try { this.releaseAll(); } catch { /* noop */ }
          app.exit(70);
          await new Promise(() => {});
        }
        if (h.pauseAt === name) {
          h.pauseAt = null;
          h.paused = { step: name, src: ctx && ctx.src, dst: ctx && ctx.dst };
          await new Promise((r) => { h.resume = r; });
          h.paused = null;
          h.resume = null;
        }
      },
      fault: (op) => {
        const f = this._mh.fault;
        if (!f || f.count <= 0 || (f.op && f.op !== op)) return null;
        f.count -= 1;
        return f.code;
      },
      // A Node error at a step before the move: 'store' (the store folder) or 'journal' (fix-pass C1).
      stepFault: (at) => {
        const f = this._mh.stepFault;
        if (!f || f.count <= 0 || (f.at && f.at !== at)) return null;
        f.count -= 1;
        return f.code;
      },
    };
  }

  /** A native message box, or (test hooks) a recorded one answered from the queue. */
  async _box(opts, parent = null) {
    const o = { title: 'QuickLauncher', noLink: true, ...opts };
    if (this.testHooks) {
      const answer = this._boxAnswers.length ? this._boxAnswers.shift() : (Number.isInteger(o.cancelId) ? o.cancelId : 0);
      this.boxLog.push({ message: o.message, detail: o.detail || '', buttons: o.buttons || [], defaultId: o.defaultId, cancelId: o.cancelId, answer, at: Date.now() });
      if (this.boxLog.length > 100) this.boxLog.shift();
      return { response: answer };
    }
    return parent ? dialog.showMessageBox(parent, o) : dialog.showMessageBox(o);
  }

  _movedItems(regionId = null, { withFile = false } = {}) {
    return this.apps().filter((a) => a && a.kind === 'moved' && (!regionId || a.regionId === regionId) && !(withFile && this._isBroken(a)));
  }

  /** A moved item whose file is gone from the store folder (spec 2.1; addendum B11: nothing else is broken). */
  _isBroken(item) {
    return !!(item && item.kind === 'moved' && this.mover && this.mover.missing.has(item.id));
  }

  /**
   * Files dropped on a region, or chosen with + FILE (spec 5.2): desktop
   * shortcuts move, the rest are references. One box per drop for the files
   * that did not move.
   */
  async dropFiles(regionId, paths, index = Infinity, { parent = null } = {}) {
    if (!this.mover || !this.region(regionId)) return { ok: false };
    let res;
    try {
      res = await this.mover.addPaths(regionId, paths, index);
    } catch (e) {
      // Not expected (the steps before a move are guarded): a drop still never ends unanswered (C1).
      // The box names the dropped shortcuts that are still where they were.
      this.log({ event: 'drop-files-error', region: regionId.slice(0, 8), error: String(e && (e.code || e.message)) });
      const failures = (Array.isArray(paths) ? paths : []).filter((p) => typeof p === 'string' && MR.isShortcut(p) && fs.existsSync(p))
        .map((p) => ({ name: MR.displayName(p), file: p, code: -1, reason: MR.reasonFor(-1) }));
      res = { refused: null, added: [], refs: [], taken: [], failures, ignored: [] };
    }
    this._pushItems(regionId); // also replaces a slot the page kept for the drop
    if (res.refused === 'no-room') {
      await this._box({ type: 'info', message: M.STRINGS.layoutNoRoom, buttons: ['OK'] }, parent);
    } else if (res.refused === 'unavailable') {
      await this._box({ type: 'warning', message: MR.STRINGS.unavailable, buttons: ['OK'] }, parent);
    } else if (res.failures.length) {
      const t = MR.moveFailedBox(res.failures);
      await this._box({ type: 'warning', message: t.message, detail: t.detail, buttons: ['OK'] }, parent);
    }
    // Files that are not shortcuts (a folder, a document) were ignored: the region says so in its
    // notice slot, never a box (addendum B7). A refused drop (full, region gone) says nothing.
    const ignored = res.ignored.filter((x) => typeof x === 'string' && x).length;
    const notice = ignored && res.refused !== 'full' && res.refused !== 'region' ? MR.notShortcutNotice(ignored) : null;
    const taken = (res.taken || []).length;
    this.log({ event: 'drop-files', region: regionId.slice(0, 8), refused: res.refused, moved: res.added.length, refs: res.refs.length, taken, failed: res.failures.length, ignored: res.ignored.length });
    return { ok: !res.refused, refused: res.refused, moved: res.added.length, refs: res.refs.length, taken, failed: res.failures.length, ignored: res.ignored.length, notice };
  }

  /** ↩, Delete on a moved tile, tile menu "Move back to desktop", Move all back (spec 5.4). */
  async moveBackItems(itemIds, { parent = null, regionKept = false, quiet = false } = {}) {
    if (!this.mover) return { moved: [], failures: [] };
    const before = new Map(this.apps().filter((a) => a && itemIds.includes(a.id)).map((a) => [a.id, a.regionId]));
    const res = await this.mover.moveBack(itemIds);
    for (const id of new Set(before.values())) this._pushItems(id);
    this._managerChanged();
    if (res.failures.length && !quiet) {
      const t = MR.moveBackFailedBox(res.failures, { regionKept });
      await this._box({ type: 'warning', message: t.message, detail: t.detail, buttons: ['OK'] }, parent);
    }
    return res;
  }

  /** From a page: only that region's own moved items. */
  moveBackFromPage(regionId, itemIds) {
    const mine = new Set(this._movedItems(regionId).map((a) => a.id));
    const ids = (itemIds || []).filter((id) => mine.has(id));
    if (!ids.length) return Promise.resolve({ moved: [], failures: [] });
    return this.moveBackItems(ids).then((r) => ({ moved: r.moved.length, failed: r.failures.length }));
  }

  /** Region menu "Move all shortcuts back to desktop…" (one region) or the Manager's (every region). */
  async moveAllBack(regionId = null, { parent = null } = {}) {
    const region = regionId ? this.region(regionId) : null;
    if (regionId && !region) return { ok: false };
    await this.refreshMoves(); // a tile whose file is gone is skipped, never counted (addendum B4b)
    const moved = this._movedItems(regionId, { withFile: true });
    if (!moved.length) return { ok: false, none: true };
    const inRegions = [...new Set(moved.map((a) => a.regionId))];
    const only = region || (inRegions.length === 1 ? this.region(inRegions[0]) : null);
    const t = MR.moveAllConfirm(moved.length, { regionName: only ? only.name : null, regionCount: inRegions.length });
    const r = await this._box({ type: 'question', message: t.message, detail: t.detail, buttons: t.buttons, defaultId: 1, cancelId: 1 }, parent);
    if (r.response !== 0) return { ok: false, cancelled: true };
    const res = await this.moveBackItems(moved.map((a) => a.id), { parent });
    return { ok: true, moved: res.moved.length, failed: res.failures.length };
  }

  /** A click on a broken tile (spec 2.1): "Remove tile" or "Keep". */
  async brokenClick(regionId, itemId) {
    const item = this.apps().find((a) => a && a.id === itemId && a.regionId === regionId && a.kind === 'moved');
    if (!item || !this.mover) return { ok: false };
    await this.refreshMoves();
    if (!this.mover.missing.has(itemId)) return { ok: true, broken: false }; // the file is back
    const t = MR.brokenBox(item.name);
    const r = await this._box({ type: 'warning', message: t.message, buttons: t.buttons, defaultId: 1, cancelId: 1 });
    if (r.response !== 0) return { ok: true, kept: true };
    const res = await this.mover.removeMissing(itemId);
    this._pushItems(regionId);
    return { ok: !!res.ok, removed: !!res.ok };
  }

  /**
   * From a page: a broken tile's ✕ (edit mode), its Delete key or its tile menu
   * "Remove tile" (addendum B4). The tile record goes at once, no box. If the
   * file is back, nothing is removed and the page gets the tile unbroken.
   */
  async removeBrokenFromPage(regionId, itemId) {
    const item = this.apps().find((a) => a && a.id === itemId && a.regionId === regionId && a.kind === 'moved');
    if (!item || !this.mover) return { ok: false };
    const res = await this.mover.removeMissing(itemId);
    if (!res.ok) await this.refreshMoves();
    this._pushItems(regionId);
    return { ok: !!res.ok, removed: !!res.ok };
  }

  /** A launch found a moved item's file missing: show it broken from now on. */
  noteMissing(itemId) {
    const item = this.apps().find((a) => a && a.id === itemId && a.kind === 'moved');
    if (!item || !this.mover || this.mover.missing.has(itemId)) return;
    this.mover.missing.add(itemId);
    this._pushItems(item.regionId);
    this._managerChanged();
  }

  /** Re-check broken tiles and files without a tile; pages and the Manager hear of any change. */
  async refreshMoves() {
    if (!this.mover) return null;
    const oldMissing = new Set(this.mover.missing);
    const oldOrphans = this.mover.orphans.map((o) => o.file).join('|');
    const r = await this.mover.scan();
    const changed = new Set();
    for (const id of new Set([...oldMissing, ...this.mover.missing])) {
      if (oldMissing.has(id) !== this.mover.missing.has(id)) {
        const it = this.apps().find((a) => a && a.id === id);
        if (it) changed.add(it.regionId);
      }
    }
    for (const id of changed) this._pushItems(id);
    if (changed.size || oldOrphans !== this.mover.orphans.map((o) => o.file).join('|')) this._managerChanged();
    return r;
  }

  /**
   * Manager "Open folder": the store folder (made, with its README, if it is not there yet).
   * If it cannot be made or opened, a box says so and nothing is passed to the shell (C1):
   * with a file in the way, that file is never opened.
   */
  async openStoreFolder({ parent = null } = {}) {
    if (!this.mover || !this.mover.folders.store) return { ok: false };
    const dir = this.mover.folders.store;
    const failed = async (code, why) => {
      this.log({ event: 'open-store', result: 'failed', why });
      const t = MR.openFolderFailedBox(code);
      await this._box({ type: 'warning', message: t.message, detail: t.detail, buttons: ['OK'] }, parent);
      return { ok: false, error: why };
    };
    try {
      await this.mover._run(() => { this.mover._stepFault('store'); return this.mover._ensureStore(); });
    } catch (e) {
      return failed(MR.storeErrorCode(e && e.code), String(e && e.code));
    }
    if (this.testHooks) { this.openedLog.push(dir); return { ok: true, recorded: true }; }
    const err = await shell.openPath(dir);
    if (err) return failed(-1, err);
    return { ok: true };
  }

  /** Manager, a file without a tile: "Add back" (first region) or "Move to desktop". */
  async orphanAction(action, file, { parent = null } = {}) {
    if (!this.mover || typeof file !== 'string') return { ok: false };
    // Both buttons are disabled while moving is unavailable (addendum B5).
    if (!this.mover.canMove()) return { ok: false, unavailable: true };
    if (action === 'add') {
      const r = await this.mover.adoptOrphan(file);
      if (!r.ok && (r.reason === 'full' || r.reason === 'no-room')) { const primary = this.regions()[0]; await this._box({type:'info',message:r.reason==='full' ? M.fullText(this._capOf(primary)) : M.STRINGS.layoutNoRoom,buttons:['OK']},parent); }
      this._managerChanged();
      return { ok: !!r.ok };
    }
    if (action === 'desktop') {
      const r = await this.mover.orphanToDesktop(file);
      this._managerChanged();
      if (!r.ok && r.failure) {
        const t = MR.orphanFailedBox(r.failure);
        await this._box({ type: 'warning', message: t.message, detail: t.detail, buttons: ['OK'] }, parent);
      }
      return { ok: !!r.ok };
    }
    return { ok: false };
  }

  movesManagerState() {
    const m = this.mover;
    const moved = this._movedItems(null, { withFile: true }); // a tile whose file is gone is not counted (B4b)
    const desktop = m ? (m.real.desktop || m.folders.desktop) : null;
    const orphans = m ? m.orphans.map((o) => ({ file: o.file, name: o.name, fileName: path.basename(o.file) })) : [];
    const available = !!(m && m.canMove());
    const first = this.regions()[0];
    return {
      available,
      reason: m ? m.unavailableReason() : 'not set up',
      unavailableText: available ? null : MR.STRINGS.unavailableLine,
      count: moved.length,
      countText: MR.movedCountText(moved.length),
      oneDrive: desktop && MR.underOneDrive(desktop, this.env) ? MR.STRINGS.oneDrive : null,
      orphans,
      orphanText: orphans.length ? MR.orphanCountText(orphans.length) : null,
      store: m ? m.folders.store : null,
      tips: {
        moveAllBack: 'Move every moved shortcut back to the desktop',
        noneToMoveBack: MR.STRINGS.noneToMoveBack,
        unavailable: MR.STRINGS.unavailableLine,
        addBack: MR.addBackTip(first ? first.name : ''),
        moveToDesktop: MR.STRINGS.moveToDesktopTip,
      },
    };
  }

  movesTestState() {
    const m = this.mover;
    if (!m) return { ok: false };
    return {
      ok: true, ready: !!m.initDone, available: m.available, canMove: m.canMove(), reason: m.unavailableReason(),
      testMode: !!(this.moveSetup && this.moveSetup.testMode), folders: m.folders, real: m.real,
      pending: m.journal.pending(), missing: [...m.missing], orphans: m.orphans.slice(),
      paused: this._mh.paused, manager: this.movesManagerState(),
    };
  }

  setMoveHook({ pauseAt = null, crashAt = null, fault = null, stepFault = null } = {}) {
    this._mh.pauseAt = typeof pauseAt === 'string' ? pauseAt : null;
    this._mh.crashAt = typeof crashAt === 'string' ? crashAt : null;
    this._mh.fault = fault && Number.isInteger(fault.code)
      ? { code: fault.code, op: typeof fault.op === 'string' ? fault.op : null, count: Number.isInteger(fault.count) ? fault.count : 1 } : null;
    this._mh.stepFault = stepFault && typeof stepFault.code === 'string' && /^E[A-Z]+$/.test(stepFault.code)
      ? { code: stepFault.code, at: typeof stepFault.at === 'string' ? stepFault.at : null, count: Number.isInteger(stepFault.count) ? stepFault.count : 1 } : null;
    return { ok: true };
  }

  moveContinue() {
    const h = this._mh;
    if (!h.resume) return { ok: false };
    h.resume();
    return { ok: true };
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
    if (region.layout === 'grid') return { width: M.GRID.minWidth, height: M.GRID.minHeight };
    // Column and Row: a display change may shorten them to one cell (they scroll); the other side is fixed.
    if (L.isContentSized(region.layout)) return L.minSize(region.layout, this._iconSize());
    if (R.isRadial(region.layout)) { const g = this._radialGeometry(region); return { width: g.width, height: g.height }; }
    return { width: 0, height: 0 };
  }

  // ── M4: Column and Row (spec 2.3, 2.4, 3.3; tech plan § 9) ────────────────
  _iconSize() { return L.iconSizeOf(this.settings()); }
  _count(id) { return M.itemsOf(this.apps(), id).length; }
  _extras(id) { const rt = this.rt.get(id); return (rt && rt.extras) || NO_EXTRAS; }

  _radialGeometry(region, count = this._count(region.id), direction = region.fanDirection || 'up') {
    if (this._extras(region.id).preview && count > 0) count++;
    return R.geometry(region.layout, count, this._iconSize(), direction);
  }
  _radialAnchor(region, home = false) {
    const rt = this.rt.get(region.id);
    if (home && rt && rt.pendingSave && rt.pendingSave.radialAnchor) return { ...rt.pendingSave.radialAnchor };
    if (home && region.radialAnchor) return { ...region.radialAnchor };
    if (!home && rt && rt.radialAnchor) return { ...rt.radialAnchor };
    const at = home ? this._homeRect(region) : rt ? rt.shown : region.rect;
    const g = rt && rt.radialGeometry || R.geometry(region.layout, this._count(region.id), this._iconSize(), region.fanDirection || 'up');
    return { x: at.x + g.pivot.x, y: at.y + g.pivot.y };
  }
  _findRadialFit(region, count, direction = region.fanDirection || 'up', anchor = this._radialAnchor(region)) {
    const g = R.geometry(region.layout, count, this._iconSize(), direction);
    const wa = this.workArea();
    if (g.width > wa.width - 48 || g.height > wa.height - 48) return null;
    const want = { x: Math.round(anchor.x - g.pivot.x), y: Math.round(anchor.y - g.pivot.y), width: g.width, height: g.height };
    const inner = P.innerArea(this.workArea()), others = this._shownRects(region.id);
    return P.fits(want, inner, others) ? want : P.findFree(want, inner, others, P.GAP);
  }
  _refitRadial(region, rt) {
    const count = this._count(region.id);
    // Once committed items replace the preview, count them only once before shaping.
    if (rt.previewBase && count !== rt.previewBase.geometry.count) { rt.previewBase = null; rt.extras = { ...rt.extras, preview:false }; }
    const preview = this._extras(region.id).preview && count > 0;
    // An accepted global size also updates the stored-count cancellation box.
    if (preview && rt.previewBase && rt.previewBase.geometry.S !== this._iconSize()) {
      const base = rt.previewBase;
      const geometry = R.geometry(region.layout,count,this._iconSize(),region.fanDirection || 'up');
      const shown = this._findRadialFit(region,count,region.fanDirection || 'up',base.anchor);
      if (shown) rt.previewBase = {shown,geometry,anchor:{x:shown.x+geometry.pivot.x,y:shown.y+geometry.pivot.y}};
    }
    const g = R.geometry(region.layout, count + (preview ? 1 : 0), this._iconSize(), region.fanDirection || 'up');
    const anchor = this._radialAnchor(region);
    const rect = this._findRadialFit(region, count + (preview ? 1 : 0), region.fanDirection || 'up', anchor);
    if (!rect) { this.log({ event: 'radial-fit-unavailable', region: region.id, count }); return false; }
    if (preview && !rt.previewBase) rt.previewBase = { shown: { ...rt.shown }, anchor: { ...anchor }, geometry: rt.radialGeometry };
    if (!preview && rt.previewBase) {
      const base = rt.previewBase; rt.previewBase = null;
      if (count === base.geometry.count) { rt.radialAnchor = base.anchor; this._applyShown(rt, base.shown); this._notifyState(region.id); return true; }
    }
    rt.radialAnchor = Math.abs(rect.x + g.pivot.x - anchor.x) <= .5 && Math.abs(rect.y + g.pivot.y - anchor.y) <= .5
      ? anchor : { x: rect.x + g.pivot.x, y: rect.y + g.pivot.y };
    const changed = !sameRect(rect, rt.shown); this._applyShown(rt, rect); this._notifyState(region.id); return changed;
  }
  _applyShape(rt, region) {
    if (R.isRadial(region.layout)) rt.radialGeometry = this._radialGeometry(region);
    if (!rt.win || rt.win.isDestroyed()) return;
    try {
      if (R.isRadial(region.layout)) {
        const g = this._radialGeometry(region); rt.radialGeometry = g;
        if (typeof rt.win.setShape !== 'function') throw new Error('radial window shaping unavailable');
        rt.win.setShape(R.shapeRects(g)); rt.radialShape = true;
      } else if (rt.radialShape && typeof rt.win.setShape === 'function') { rt.win.setShape([]); rt.radialShape = false; }
      if (rt.shapeBlocked) { rt.shapeBlocked = false; rt.host.setHidden(this.hidden); }
    } catch (error) {
      // Fail closed rather than let transparent gaps cover the user's desktop.
      rt.shapeBlocked = true; if (rt.host) rt.host.setHidden(true);
      this.log({ event: 'radial-shape-error', region: region.id, error: String(error.message || error) });
    }
  }
  setFanDirection(id, direction) {
    const region = this.region(id), rt = this.rt.get(id);
    if (!region || !rt || region.layout !== 'fan' || !R.DIRECTIONS.includes(direction)) return { ok: false };
    const count = this._count(id), cap = R.capacity('fan', this._iconSize(), this.workArea(), direction);
    const anchor = this._radialAnchor(region), rect = count <= cap ? this._findRadialFit(region, count, direction, anchor) : null;
    if (!rect) return { ok: false, error: M.STRINGS.layoutNoRoom };
    const g = R.geometry('fan', count, this._iconSize(), direction), wa = this.workArea();
    this._updateRegion(id, { fanDirection: direction, rect, radialAnchor: { x: rect.x + g.pivot.x, y: rect.y + g.pivot.y }, home: { ...wa } });
    rt.radialAnchor = { x: rect.x + g.pivot.x, y: rect.y + g.pivot.y };
    this._applyShown(rt, rect); this._notifyState(id); this._managerChanged(); return { ok: true, rect };
  }

  /**
   * A Column or Row box at the anchor (top-left) of `at`: the size its items
   * want (spec 2.3, 2.4), stopped at 90% of the work area and, given the other
   * regions, at the room it has there. It grows from the fixed corner and never
   * moves; past what fits, the list scrolls.
   */
  _contentRect(region, at, { others = null, keep = 0 } = {}) {
    const wa = this.workArea();
    const want = L.contentSize(region.layout, this._count(region.id), this._iconSize(), this._extras(region.id));
    const anchor = { x: at.x, y: at.y };
    const room = others
      ? P.roomAlong({ ...anchor, width: want.width, height: want.height }, L.growAxis(region.layout), P.innerArea(wa), others)
      : Infinity;
    return L.boxAt(region.layout, anchor, want, wa, room, keep, { S: this._iconSize(), ...this._extras(region.id) }).rect;
  }

  /**
   * The rects every region wants on the current work area, before the fit:
   * the user's rect (Grid), or its anchor with the size the items want
   * (Column, Row; the others' boxes are known after the first pass).
   */
  _wantedRects() {
    const regs = this.regions();
    const base = regs.map((r) => this._homeRect(r));
    let rects = base.map((h, i) => {
      if (R.isRadial(regs[i].layout)) { const g = this._radialGeometry(regs[i]), a = this._radialAnchor(regs[i], true); return { x: Math.round(a.x-g.pivot.x), y: Math.round(a.y-g.pivot.y), width:g.width,height:g.height }; }
      return L.isContentSized(regs[i].layout) ? this._contentRect(regs[i], h) : h;
    });
    for (let pass = 0; pass < 2; pass++) {
      const prev = rects;
      rects = prev.map((h, i) => (L.isContentSized(regs[i].layout)
        ? this._contentRect(regs[i], base[i], { others: prev.filter((_, j) => j !== i) }) : h));
    }
    return rects;
  }

  /**
   * Items, the icon size, the edit bar or a notice changed the size a Column
   * or Row wants: its box follows at the same anchor (nothing saved: the home
   * rule, spec 4.4; only a move or a layout switch saves). A box that a
   * neighbour or the margin now crosses on its fixed side (a larger icon size)
   * moves by the smallest step that fits, as a layout switch does (spec 3.3).
   */
  _refitContent(id) {
    const rt = this.rt.get(id);
    const region = this.region(id);
    if (!rt || !region || rt.drag) return false;
    if (R.isRadial(region.layout)) return this._refitRadial(region, rt);
    if (!L.isContentSized(region.layout)) return false;
    const inner = P.innerArea(this.workArea());
    const others = this._shownRects(id);
    const keep = L.growAxis(region.layout) === 'x' ? rt.shown.width : rt.shown.height;
    let rect = this._contentRect(region, rt.shown, { others, keep });
    if (!P.fits(rect, inner, others)) {
      const f = P.findFree(rect, inner, others, P.GAP);
      if (f) rect = f;
    }
    if (sameRect(rect, rt.shown)) return false;
    this._applyShown(rt, rect);
    if (this.testHooks) this.log({ event: 'refit', region: id.slice(0, 8), rect });
    return true;
  }

  _refitAllContent() { for (const r of this.regions()) this._refitContent(r.id); }

  /** From the region page: its edit bar or notice slot shows or hides (Column grows by 38 for each, spec 2.3). */
  setExtras(id, { edit = false, notice = false, preview = false } = {}) {
    const rt = this.rt.get(id);
    if (!rt) return { ok: false };
    const region = this.region(id), count = this._count(id);
    const allowPreview = !!preview && region && R.isRadial(region.layout) && count > 0 && count < this._capOf(region) && !!this._findRadialFit(region, count + 1);
    const refusedPreview = !!preview && region && R.isRadial(region.layout) && count > 0 && !allowPreview;
    const previewResult = { preview: allowPreview, previewRejected: refusedPreview, ...(refusedPreview ? { error: M.STRINGS.layoutNoRoom } : {}) };
    const next = { edit: !!edit, notice: !!notice, preview: allowPreview };
    if (rt.extras && rt.extras.edit === next.edit && rt.extras.notice === next.notice && !!rt.extras.preview === !!next.preview) return { ok: !refusedPreview, changed: false, shown: { ...rt.shown }, ...previewResult };
    rt.extras = next;
    const changed = this._refitContent(id);
    return { ok: !refusedPreview, changed, shown: { ...rt.shown }, ...previewResult };
  }

  /**
   * Switch a region's layout (spec 3.3): items, order, theme and name are
   * kept. The top-left anchor stays; Grid comes back at its remembered size
   * (`gridSize`, tech plan § 2.1), Column and Row at the size their items want
   * (up to 90%). A box that leaves the work area or meets another region moves
   * by the smallest step that fits (12 px rings); with no room anywhere the
   * switch is refused and nothing changes. The new rect is saved.
   */
  async setLayout(id, layout, { parent = null } = {}) {
    const region = this.region(id);
    const rt = this.rt.get(id);
    if (!region || !rt) return { ok: false, error: 'Region not found.' };
    if (!M.BUILT_LAYOUTS.has(layout)) return { ok: false, error: `${layout} regions are not available yet.` };
    if (region.layout === layout) return { ok: true, unchanged: true };
    if (rt.drag || rt.resize) { rt.drag = null; rt.resize = null; this._command(id, 'cancel-drag'); }
    const wa = this.workArea();
    const inner = P.innerArea(wa);
    const others = this._shownRects(id);
    const anchor = { x: rt.shown.x, y: rt.shown.y };
    let radialAnchor = null;
    let size;
    if (R.isRadial(layout)) {
      const cap = R.capacity(layout, this._iconSize(), wa, 'up');
      if (cap < 1) return { ok:false,error:M.STRINGS.layoutNoRoom };
      if (this._count(id) > cap) return { ok: false, error: `${this._count(id)} shortcuts. ${layoutLabel(layout)} holds ${cap}.` };
      radialAnchor = R.isRadial(region.layout) ? this._radialAnchor(region) : { x: rt.shown.x + rt.shown.width/2, y: rt.shown.y + rt.shown.height/2 };
      const g = R.geometry(layout, this._count(id), this._iconSize(), 'up');
      if (g.width > wa.width - 48 || g.height > wa.height - 48) return { ok:false,error:M.STRINGS.layoutNoRoom };
      anchor.x = Math.round(radialAnchor.x - g.pivot.x); anchor.y = Math.round(radialAnchor.y - g.pivot.y);
      size = { width: g.width, height: g.height };
    } else if (layout === 'grid') {
      const g = region.gridSize || { width: M.GRID.defaultWidth, height: M.GRID.defaultHeight };
      size = { width: Math.max(M.GRID.minWidth, g.width), height: Math.max(M.GRID.minHeight, g.height) };
    } else {
      const want = L.contentSize(layout, this._count(id), this._iconSize(), this._extras(id));
      size = L.boxAt(layout, anchor, want, wa, Infinity, 0, { S: this._iconSize(), ...this._extras(id) }).rect;
    }
    let rect = { ...anchor, width: size.width, height: size.height };
    if (!P.fits(rect, inner, others)) rect = P.findFree(rect, inner, others, P.GAP);
    if (!rect) {
      this.log({ event: 'layout-refused', region: id.slice(0, 8), layout });
      await this._box({ type: 'info', message: M.STRINGS.layoutNoRoom, buttons: ['OK'] }, parent);
      return { ok: false, error: M.STRINGS.layoutNoRoom };
    }
    const patch = { layout, rect: { ...rect }, home: { x: wa.x, y: wa.y, width: wa.width, height: wa.height } };
    if (radialAnchor) { const g = R.geometry(layout, this._count(id), this._iconSize(), 'up'); patch.radialAnchor = { x: rect.x+g.pivot.x,y:rect.y+g.pivot.y }; patch.fanDirection = 'up'; rt.radialAnchor = { ...patch.radialAnchor }; }
    else rt.radialAnchor = null;
    // Grid remembers its last size (spec 3.3): the user's size, not a display fit.
    if (region.layout === 'grid') { const h = this._homeRect(region); patch.gridSize = { width: h.width, height: h.height }; }
    clearTimeout(rt.saveTimer);
    rt.saveTimer = null;
    rt.pendingSave = null;
    this._updateRegion(id, patch);
    this._applyShown(rt, rect);
    this._notifyState(id);
    this._managerChanged();
    if (this.replayUpdateOffer) this.replayUpdateOffer(id);
    this.log({ event: 'layout', region: id.slice(0, 8), from: region.layout, to: layout, rect });
    return { ok: true, rect };
  }

  // The rect the user last chose for a region: the saved one, or the one a
  // move or resize just ended on while its save is still in the debounce.
  _homeRect(region) {
    const rt = this.rt.get(region.id);
    return rt && rt.pendingSave ? rt.pendingSave.rect : region.rect;
  }

  _fitAll() {
    const inner = P.innerArea(this.workArea());
    const regs = this.regions();
    return P.relayout(this._wantedRects(), inner, regs.map((r) => this._minFor(r))).rects;
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
      pendingSave: null, extras: { ...NO_EXTRAS },
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
      rt.extras = { ...NO_EXTRAS }; // a new page starts in view mode with no notice
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
      // Fullscreen removed: consume F11 before the page/default menu accelerator.
      win.webContents.on('before-input-event',(event,input)=>{if(input.key==='F11')event.preventDefault();});
      rt.ready = false;
      this._applyShape(rt, region);
      win.webContents.on('did-start-navigation', (details) => {
        // A reloaded page must announce itself again before it gets store messages.
        if (details && details.isMainFrame && !details.isSameDocument) rt.ready = false;
      });
      win.on('closed', () => {
        this.byWc.delete(wcId);
        if (rt.win === win) { rt.win = null; rt.wc = null; rt.ready = false; }
        const t = this.tileDrag;
        if (t && (t.sourceId === rt.id || t.targetId === rt.id)) this._cancelTileDrag('window closed', { notifySource: true, instant: true });
      });
      // Activated (a click on a fallback window, or keyboard focus given to a
      // desktop child): this is the active region (spec 7.3, fallback focus 3).
      win.on('focus', () => { if (rt.win === win) this.setActive(rt.id); });
      let settled = false;
      win.once('ready-to-show', () => { settled = true; resolve(win); });
      win.webContents.once('did-fail-load', (_e, code, desc) => {
        if (settled) return;
        settled = true;
        try { win.destroy(); } catch { /* gone */ }
        reject(new Error(`region page failed to load: ${code} ${desc}`));
      });
      // The layout rides in the URL, so the page draws its first frame in it (no Grid flash).
      win.loadFile(INDEX_HTML, { query: { region: rt.id, rebuilt: rebuilt ? '1' : '0', layout: region.layout } });
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
    this._applyShape(rt, region);
  }

  _shownRects(exceptId) {
    return [...this.rt.values()].filter((r) => r.id !== exceptId).map((r) => r.shown);
  }

  /**
   * Display change, sleep/resume (spec 4.4, the home-layout rule): every
   * region is shown at its home rect fitted to the current work area
   * (clamped, then moved off any overlap, Grid may shrink) and NOTHING is
   * saved, so the same work area again brings the saved places back. Every
   * window is re-applied even when its DIP rect did not change: a scale
   * change moves the physical rect, and the shell may have moved our parent.
   */
  relayoutAll(reason) {
    this._cancelGestures(reason);
    const fitted = this._fitAll();
    let moved = 0;
    this.regions().forEach((r, i) => {
      const rt = this.rt.get(r.id);
      if (!rt) return;
      if (!sameRect(rt.shown, fitted[i])) moved++;
      this._applyShown(rt, fitted[i]);
    });
    this.log({ event: 'relayout', reason, workArea: this.workArea(), moved });
  }

  /**
   * Stop every drag in flight: region moves and resizes, and a tile on its
   * way to another region. The pages are told so they drop their own state.
   */
  _cancelGestures(reason) {
    for (const rt of this.rt.values()) {
      if (!rt.drag && !rt.resize) continue;
      rt.drag = null;
      rt.resize = null;
      this._command(rt.id, 'cancel-drag');
    }
    if (this.tileDrag) this._cancelTileDrag(reason, { notifySource: true, instant: true });
  }

  // A user move or resize ended: the rect AND the work area it was made on
  // are taken now, so a display change inside the debounce cannot replace
  // them with a fitted rect (spec 4.4: only the user changes the saved layout).
  _saveRectSoon(rt) {
    const wa = this.workArea();
    if (R.isRadial(this.region(rt.id).layout)) { const g = this._radialGeometry(this.region(rt.id)); rt.radialAnchor = { x:rt.shown.x+g.pivot.x,y:rt.shown.y+g.pivot.y }; }
    rt.pendingSave = { ...(rt.radialAnchor ? { radialAnchor: { ...rt.radialAnchor } } : {}), rect: { ...rt.shown }, home: { x: wa.x, y: wa.y, width: wa.width, height: wa.height } };
    clearTimeout(rt.saveTimer);
    rt.saveTimer = setTimeout(() => {
      rt.saveTimer = null;
      this._writePendingRect(rt);
    }, SAVE_RECT_MS);
  }

  _writePendingRect(rt) {
    const p = rt.pendingSave;
    rt.pendingSave = null;
    if (!p || !this.region(rt.id)) return;
    this._updateRegion(rt.id, { rect: p.rect, home: p.home, ...(p.radialAnchor ? { radialAnchor: p.radialAnchor } : {}) });
    if (this.testHooks) this.log({ event: 'rect-saved', region: rt.id.slice(0, 8), rect: p.rect });
  }

  // ── renderer-facing: scope by sender ─────────────────────────────────────────
  regionIdOf(wc) { return wc ? this.byWc.get(wc.id) || null : null; }

  itemsForRenderer(id) {
    const rt = this.rt.get(id);
    if (rt) rt.syncedSeq = this.latestSeq; // a page that fetches now holds the current state
    return this._itemsOut(id);
  }

  // A region's items for its page. A moved item whose file is gone carries
  // `broken: true` (spec 2.1); the flag is never stored.
  _itemsOut(id) {
    const missing = this.mover ? this.mover.missing : null;
    return M.itemsOf(this.apps(), id).map((a) => (missing && a.kind === 'moved' && missing.has(a.id) ? { ...a, broken: true } : a));
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
      fanDirection: region.fanDirection || 'up',
      radial: R.isRadial(region.layout) ? this._radialGeometry(region) : null,
      primary: this.primaryId() === id, active: this.activeId === id,
      matchAll: !!s.matchAll, regionCount: this.regions().length,
      mode: rt ? rt.host.mode : 'pending', hidden: this.hidden,
      // Items it can hold (null = no cap): a file drag that would overfill it shows FULL.
      cap: Number.isFinite(this._capOf(region)) ? this._capOf(region) : null,
      testHooks: !!this.testHooks,
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
    if (rt && rt.wc && !rt.wc.isDestroyed()) rt.wc.send('region:items-changed', this._itemsOut(id));
    this._refitContent(id); // a Column or Row follows its item count
  }
  _managerChanged() { if (this.manager) this.manager.changed(); }

  /** Any region or the Manager: settings (icon size, reduced motion, theme) were changed elsewhere. */
  broadcastSettingsChanged() {
    for (const rt of this.rt.values()) {
      if (rt.wc && !rt.wc.isDestroyed()) rt.wc.send('settings-changed-externally');
    }
    this._refitAllContent(); // the icon size sets a Column's width and a Row's height
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
    if (this.replayUpdateOffer) this.replayUpdateOffer(id);
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
    const storeDir = this.mover && this.mover.folders.store;
    // Keep fields the page does not know about (kind, origin) from the stored item.
    // A moved item belongs to the main process: a page may rename and reorder
    // it, never change its path, take it from another region, or make one.
    const items = [];
    for (const s of sanitized) {
      const stored = byId.get(s.id);
      if (stored && stored.kind === 'moved') {
        if (stored.regionId === id) items.push({ ...stored, name: s.name || stored.name, regionId: id });
        continue;
      }
      if (!stored && storeDir && MR.isInside(storeDir, s.path)) continue;
      items.push({ ...(stored || {}), ...s, regionId: id });
    }
    // A moved item leaves its region only by moving back (or Move to): one the
    // page left out goes back to its place, and the page is told.
    const kept = new Set(items.map((a) => a.id));
    let restored = 0;
    M.itemsOf(all, id).forEach((a, i) => {
      if (a.kind === 'moved' && !kept.has(a.id)) { items.splice(Math.min(i, items.length), 0, a); restored++; }
    });
    const region = this.region(id);
    if (R.isRadial(region.layout) && items.length > this._count(id)) {
      const cap = this._capOf(region);
      const error = items.length > cap ? M.fullText(cap) : !this._findRadialFit(region, items.length) ? M.STRINGS.layoutNoRoom : null;
      if (error) { this._pushItems(id); this._command(id,'add-refused',{text:error}); return {ok:false,error}; }
    }
    const view = this.store.rendererView('apps');
    if (view !== undefined && rt && rt.syncedSeq < this.latestSeq) {
      // This page still shows the pre-merge copy: merge its change against that copy.
      this.store.setFromRenderer('apps', M.replaceRegionItems(view, id, items));
      this._repairItems();
    } else {
      this.store.set('apps', M.replaceRegionItems(all, id, items));
    }
    if (restored) {
      this.log({ event: 'save-guard', region: id.slice(0, 8), note: `${restored} moved item(s) a page left out were kept` });
      this._pushItems(id);
    }
    this._refitContent(id);
    this._managerChanged();
  }

  /** From a region page: only a theme change is taken (the page has no other settings UI). */
  applyRegionSettings(id, incoming) {
    const rt = this.rt.get(id);
    if (!rt || !incoming || typeof incoming.theme !== 'string') return;
    if (incoming.theme === rt.sentTheme || !this.validThemes.has(incoming.theme)) return;
    this.setTheme(id, incoming.theme, { fromPage: true });
  }

  /** Q2 only: test this user-requested size against each radial region's display. */
  _iconSizeFits(size) {
    for (const region of this.regions()) {
      if (!R.isRadial(region.layout)) continue;
      const rt = this.rt.get(region.id);
      const at = rt ? rt.shown : region.rect;
      const wa = this._testWorkArea || (typeof screen.getDisplayMatching === 'function' && at ? screen.getDisplayMatching(at).workArea : this.workArea());
      const count = this._count(region.id);
      const counts = this._extras(region.id).preview && count > 0 ? [count, count + 1] : [count];
      for (const n of counts) {
        const g = R.geometry(region.layout, n, size, region.fanDirection || 'up');
        if (g.width > wa.width - 48 || g.height > wa.height - 48) return false;
      }
    }
    return true;
  }

  /** From the Manager or the tray: a patch of global settings. */
  applySettingsPatch(patch) {
    if (!patch || !Object.keys(patch).length) return {ok:true,iconSize:this._iconSize()};
    // Atomic refusal: no store write, broadcast, refit, preview or shape mutation.
    if (Object.prototype.hasOwnProperty.call(patch,'iconSize') && patch.iconSize !== this.settings().iconSize && !this._iconSizeFits(patch.iconSize)) {
      return {ok:false,iconSize:this._iconSize(),error:'No room at this icon size. Use a smaller size.'};
    }
    this.store.set('settings', { ...this.settings(), ...patch });
    this.broadcastSettingsChanged();
    return {ok:true,iconSize:this._iconSize()};
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
    this._refitAllContent();
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
    // Grid starts at 424 x 300 (spec 3.1); an empty Column or Row at its one-cell size (spec 2.8).
    if (R.isRadial(layout) && R.capacity(layout, this._iconSize(), wa, 'up') < 1) return { ok:false,error:M.STRINGS.noRoom };
    const size = R.isRadial(layout) ? R.geometry(layout, 0, this._iconSize(), 'up') : L.isContentSized(layout) ? L.contentSize(layout, 0, this._iconSize()) : { width: M.GRID.defaultWidth, height: M.GRID.defaultHeight };
    if (R.isRadial(layout) && (size.width > wa.width - 48 || size.height > wa.height - 48)) return { ok:false,error:M.STRINGS.noRoom };
    const rect = P.placeNew(size, P.innerArea(wa), this._shownRects());
    if (!rect) return { ok: false, error: M.STRINGS.noRoom };
    const region = {
      id: randomUUID(), name: M.nextDefaultName(regs), icon: 'apps', layout,
      theme: M.effectiveTheme(regs[0], this.settings()), rect,
      home: { x: wa.x, y: wa.y, width: wa.width, height: wa.height },
    };
    if (R.isRadial(layout)) { const g = R.geometry(layout, 0, this._iconSize(), 'up'); region.radialAnchor = { x:rect.x+g.pivot.x,y:rect.y+g.pivot.y }; region.fanDirection = 'up'; }
    this._setRegions([...regs, region]);
    this._spawn(region, rect);
    this._notifyAllStates();
    this._managerChanged();
    this.emit('regions-changed');
    this.log({ event: 'region-created', region: region.id.slice(0, 8), layout, rect });
    return { ok: true, id: region.id };
  }

  async deleteRegion(id, { parent = null, confirm = true } = {}) {
    const regs = this.regions();
    const region = regs.find((r) => r.id === id);
    if (!region) return { ok: false, error: 'Region not found.' };
    if (regs.length <= 1) return { ok: false, error: M.STRINGS.lastRegion };
    await this.refreshMoves();
    // A tile whose file is gone is a reference here: it is in line 2 of the confirm and
    // goes with the region; only its record is removed, no file (addendum B4b).
    const items = M.itemsOf(this.apps(), id).map((a) => (this._isBroken(a) ? { ...a, kind: undefined } : a));
    const text = M.deleteConfirmText(region, items);
    if (confirm && text.needsConfirm) {
      const opts = {
        type: 'warning', title: 'QuickLauncher', message: text.message, detail: text.detail,
        buttons: ['Delete region', 'Cancel'], defaultId: 1, cancelId: 1, noLink: true,
      };
      const r = await this._box(opts, parent);
      if (r.response !== 0) return { ok: false, cancelled: true };
    }
    if (!this.regions().some((r) => r.id === id)) return { ok: false, error: 'Region not found.' };
    // Every moved desktop file goes back first (spec 3.4). If any cannot, the
    // region stays with those tiles: a region that still owns desktop files
    // never disappears.
    const movedIds = this._movedItems(id, { withFile: true }).map((a) => a.id);
    if (movedIds.length) {
      const res = await this.moveBackItems(movedIds, { parent, regionKept: false, quiet: true });
      // A file found missing during the move is a broken tile now: it never keeps the region.
      const failures = res.failures.filter((f) => f.reason !== MR.STRINGS.reasonMissing);
      if (failures.length) {
        const t = MR.moveBackFailedBox(failures, { regionKept: true, othersBack: res.moved.length });
        await this._box({ type: 'warning', message: t.message, detail: t.detail, buttons: ['OK'] }, parent);
        this.log({ event: 'region-kept', region: id.slice(0, 8), failed: failures.length });
        return { ok: false, kept: true, failed: failures.length, moved: res.moved.length };
      }
    }
    const now = this.regions();
    if (now.length <= 1 || !now.some((r) => r.id === id)) return { ok: false, error: M.STRINGS.lastRegion };
    // A desktop file dropped on it meanwhile: it is not removed with the references.
    if (this._movedItems(id, { withFile: true }).length) return { ok: false, kept: true, failed: 0 };
    for (const a of this._movedItems(id)) this.mover.missing.delete(a.id); // broken tiles go as records
    // What is left are references: they go with the region (Q4).
    this.store.set('apps', this.apps().filter((a) => !(a && a.regionId === id)));
    this._setRegions(now.filter((r) => r.id !== id));
    const rt = this.rt.get(id);
    const t = this.tileDrag;
    if (t && (t.sourceId === id || t.targetId === id)) this._cancelTileDrag('region deleted', { notifySource: true, instant: true });
    if (rt) { clearTimeout(rt.saveTimer); rt.pendingSave = null; rt.host.stop(); this.rt.delete(id); }
    if (this.activeId === id) this.activeId = this.primaryId();
    this._mirrorPrimaryTheme();
    this._pushThemes();
    this._notifyAllStates();
    this._managerChanged();
    this.emit('regions-changed');
    if (this.replayUpdateOffer) this.replayUpdateOffer(this.primaryId());
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

  /** Item cap of a region (spec 2.7). Test hooks can set one to exercise the full path. */
  _capOf(region) {
    if (this.testHooks && this._testCaps.has(region.id)) return this._testCaps.get(region.id);
    return R.isRadial(region.layout) ? R.capacity(region.layout, this._iconSize(), this.workArea(), region.fanDirection || 'up') : M.capacityOf(region.layout);
  }

  _dropDecision(targetId, sourceId) {
    const target = targetId ? this.region(targetId) : null;
    if (!target) return M.dropDecision({ target: null });
    const count = this._count(targetId), decision = M.dropDecision({ target, sourceId, count, cap: this._capOf(target) });
    if (decision.ok && R.isRadial(target.layout) && !this._findRadialFit(target,count+1)) return { ok:false,reason:'no-room',text:M.STRINGS.layoutNoRoom };
    return decision;
  }

  /** Move a shortcut to another region (tile menu Move to, a tile dropped there). `index` among the target's items; default last. */
  moveItemToRegion(itemId, targetId, index = Infinity) {
    const item = this.apps().find((a) => a && a.id === itemId);
    if (!item || !this.region(targetId) || item.regionId === targetId) return { ok: false };
    const from = item.regionId;
    const dec = this._dropDecision(targetId, from);
    if (!dec.ok) return { ok: false, error: dec.text || dec.reason };
    const next = M.moveItemTo(this.apps(), itemId, targetId, index);
    if (!next) return { ok: false };
    this.store.set('apps', next);
    this._pushItems(from);
    this._pushItems(targetId);
    this._managerChanged();
    return { ok: true, index: M.itemsOf(next, targetId).findIndex((a) => a.id === itemId) };
  }

  // ── a tile dragged to another region (spec 5.3, U5) ──────────────────────
  // The source page keeps the pointer (capture) and reports where it is, in
  // its own client coordinates, only while it is outside the source window.
  // The main process knows where every region is: it turns that into a
  // desktop point, finds the region under it and has that page draw the drop
  // slot and a copy of the tile (the source window clips its own ghost). On
  // release the target page names the slot and the main process moves the
  // item. A release on no region, in a gap or rim, or on a full region
  // cancels: the tile stays where it was.
  _tileTargets(sourceId) {
    if (this.hidden) return [];
    return [...this.rt.values()]
      .filter((rt) => rt.id !== sourceId && rt.ready && rt.wc && !rt.wc.isDestroyed()
        && (rt.host.mode === 'attached' || rt.host.mode === 'fallback'))
      .map((rt) => ({ id: rt.id, rect: rt.shown }));
  }

  _pageToDesktop(id, x, y) {
    const rt = this.rt.get(id);
    const region = this.region(id);
    if (!rt || !region || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    const w = this._windowRectDip(region, rt.shown);
    return { x: w.x + x, y: w.y + y };
  }

  _desktopToPage(id, p) {
    const rt = this.rt.get(id);
    const region = this.region(id);
    if (!rt || !region) return null;
    const w = this._windowRectDip(region, rt.shown);
    return { x: Math.round(p.x - w.x), y: Math.round(p.y - w.y) };
  }

  _sendPreview(id, msg) {
    const rt = this.rt.get(id);
    if (rt && rt.wc && !rt.wc.isDestroyed()) rt.wc.send('region:tile-drop-preview', msg);
  }

  // instant: a system cancel (display change, sleep, hide all, a window or
  // region gone, no answer): the target drops its slot with no animation.
  // Otherwise (the user let go elsewhere) the gap closes through the reflow.
  _cancelTileDrag(reason, { notifySource = false, instant = false } = {}) {
    const t = this.tileDrag;
    if (!t) return;
    this.tileDrag = null;
    clearTimeout(t.replyTimer);
    if (t.targetId) this._sendPreview(t.targetId, { phase: 'leave', dragId: t.id, instant });
    if (t.reply) t.reply({ ok: true, result: 'cancelled', reason });
    if (notifySource) this._command(t.sourceId, 'cancel-tile-drag');
    this.log({ event: 'tile-drag', result: 'cancelled', reason, item: String(t.itemId).slice(0, 8) });
  }

  /** From the source page. phase: start | move | end | cancel; x, y in the source page. */
  tileDragFrom(id, { phase, itemId, x, y } = {}) {
    if (phase === 'start') {
      if (this.tileDrag) this._cancelTileDrag('replaced', { instant: true });
      const item = this.apps().find((a) => a && a.id === itemId && a.regionId === id);
      if (!item || !this.rt.has(id)) return { ok: false };
      this.tileDrag = { id: ++this._tileDragSeq, sourceId: id, itemId, targetId: null, dropping: null, reply: null, replyTimer: null };
      return { ok: true, dragId: this.tileDrag.id };
    }
    const t = this.tileDrag;
    if (!t || t.sourceId !== id || t.dropping) return { ok: false };
    if (phase === 'cancel') { this._cancelTileDrag('released in the source region'); return { ok: true }; }
    const p = this._pageToDesktop(id, x, y);
    let hitId = p ? P.regionAt(p, this._tileTargets(id)) : null;
    if (hitId && R.isRadial(this.region(hitId).layout)) { const rt=this.rt.get(hitId), g=this._radialGeometry(this.region(hitId)); const x=p.x-rt.shown.x,y=p.y-rt.shown.y; const h=g.hub; const chip=g.chips.some(c=>x>=c.x&&x<c.x+c.width&&y>=c.y&&y<c.y+c.height); const hub=(x-g.pivot.x)**2+(y-g.pivot.y)**2<=48**2; if (!chip&&!hub) hitId=null; }
    const dec = this._dropDecision(hitId, id);
    if (phase === 'move') {
      if (t.targetId && t.targetId !== hitId) this._sendPreview(t.targetId, { phase: 'leave', dragId: t.id });
      const entering = hitId && hitId !== t.targetId;
      t.targetId = hitId;
      if (hitId) {
        const item = this.apps().find((a) => a && a.id === t.itemId);
        const msg = { phase: 'over', dragId: t.id, ...this._desktopToPage(hitId, p), rejected: dec.ok ? null : (dec.text || null) };
        if (entering && item) msg.item = { name: String(item.name || ''), iconDataUrl: String(item.iconDataUrl || '') };
        this._sendPreview(hitId, msg);
      }
      return { ok: true, over: hitId, rejected: dec.ok ? null : dec.reason };
    }
    if (phase === 'end') {
      if (!dec.ok) { if (hitId && dec.text) this._sendPreview(hitId, { phase:'refused',dragId:t.id,text:dec.text }); this._cancelTileDrag(dec.reason === 'full' ? 'full region' : 'not on a region'); return { ok: true, result: 'cancelled', reason: dec.reason }; }
      if (t.targetId && t.targetId !== hitId) this._sendPreview(t.targetId, { phase: 'leave', dragId: t.id });
      t.targetId = hitId;
      t.dropping = hitId;
      // The target page names its slot (region:tile-drop); the source waits for the outcome.
      return new Promise((resolve) => {
        t.reply = resolve;
        t.replyTimer = setTimeout(() => { if (this.tileDrag === t) this._cancelTileDrag('target page did not answer', { instant: true }); }, DROP_REPLY_MS);
        this._sendPreview(hitId, { phase: 'drop', dragId: t.id, ...this._desktopToPage(hitId, p) });
      });
    }
    return { ok: false };
  }

  /** From the target page: the slot the dropped tile goes to. */
  tileDropFrom(id, { dragId, index } = {}) {
    const t = this.tileDrag;
    if (!t || t.id !== dragId || t.dropping !== id) return { ok: false };
    this.tileDrag = null;
    clearTimeout(t.replyTimer);
    const res = this.moveItemToRegion(t.itemId, id, Number.isFinite(index) ? index : Infinity);
    // The target keeps its slot until its new items arrive; refused, none come, so it drops it.
    if (!res.ok) { if (res.error) this._sendPreview(id, { phase:'refused',dragId:t.id,text:res.error }); this._sendPreview(id, { phase: 'leave', dragId: t.id, instant: true }); }
    this.log({ event: 'tile-drag', result: res.ok ? 'moved' : 'refused', item: String(t.itemId).slice(0, 8), to: id.slice(0, 8), index: res.index });
    if (t.reply) t.reply({ ok: true, result: res.ok ? 'moved' : 'cancelled', reason: res.ok ? null : res.error, index: res.index });
    return res;
  }

  addItems(regionId, entries) {
    if (!this.region(regionId)) return { ok: false, added: 0 };
    const mine = new Set(M.itemsOf(this.apps(), regionId).map((a) => a.path));
    const fresh = (entries || []).filter((e) => e && e.id && e.path && !mine.has(e.path));
    if (!fresh.length) return { ok: true, added: 0 };
    const region=this.region(regionId), total=this._count(regionId)+fresh.length;
    if (total>this._capOf(region)) return {ok:false,added:0,error:M.fullText(this._capOf(region))};
    if (R.isRadial(region.layout)&&!this._findRadialFit(region,total)) return {ok:false,added:0,error:M.STRINGS.layoutNoRoom};
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
    this._cancelGestures('hidden');
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
    this._refitContent(id); // a Column or Row at its new place: the room there
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
      // Spec 9.2: the layouts this build draws; the current one carries the check (Fan, Ring: M5).
      {
        label: 'Layout',
        submenu: [...M.BUILT_LAYOUTS].map((l) => ({
          label: R.isRadial(l) ? `${layoutLabel(l)} (max ${R.capacity(l,this._iconSize(),this.workArea(),'up')})` : layoutLabel(l), type: 'radio', checked: region.layout === l,
          enabled: !R.isRadial(l) || (R.capacity(l,this._iconSize(),this.workArea(),'up') > 0 && this._count(id)<=R.capacity(l,this._iconSize(),this.workArea(),'up')),
          click: () => { this.setLayout(id, l).catch(() => {}); },
        })),
      },
      ...(region.layout==='fan' ? [{label:'Fan direction',submenu:R.DIRECTIONS.map(direction=>({label:layoutLabel(direction),type:'radio',checked:(region.fanDirection||'up')===direction,click:()=>this.setFanDirection(id,direction)}))}] : []),
      { label: 'Place', submenu: place },
      { label: 'Theme…', click: () => this.manager && this.manager.open('regions', { regionId: id }) },
      { label: 'Random theme', click: () => this.randomTheme(id) },
      { label: 'Match all regions', type: 'checkbox', checked: !!s.matchAll, click: (item) => this.setMatchAll(item.checked, id) },
      { type: 'separator' },
      // Disabled when the region has no moved shortcuts (spec 9.2).
      { label: 'Move all shortcuts back to desktop…', enabled: this._movedItems(id, { withFile: true }).length > 0, click: () => { this.moveAllBack(id).catch(() => {}); } },
      { label: 'Delete region…', enabled: many, click: () => { this.deleteRegion(id).catch(() => {}); } },
      { type: 'separator' },
      ...(() => {
        const u = this.getUpdateState ? this.getUpdateState() : { offer: 'none' };
        const label = u.offer === 'available' ? `Update available — v${u.version}…` : u.offer === 'downloading' ? 'Update downloading…' : u.offer === 'ready' ? 'Update ready to install…' : null;
        return label ? [{ label, click: () => this.manager && this.manager.open('settings') }] : [];
      })(),
      { label: 'Settings…', click: () => this.manager && this.manager.open('settings') },
      { label: 'Hide all regions', click: () => this.hideAll() },
    ];
    this._popup('region', rt, tpl, x, y);
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
        ? {
          label: 'Move to',
          // A full Fan or Ring is listed but disabled (spec 9.2).
          submenu: others.map((r) => ({ label: menuLabel(r.name), enabled: this._dropDecision(r.id, id).ok, click: () => this.moveItemToRegion(itemId, r.id) })),
        }
        : { label: 'Move to', enabled: false },
      // A moved tile's file goes back to the desktop; a reference is removed (spec 9.2).
      // A broken one has no file to move: "Remove tile" removes its record (addendum B4).
      item.kind === 'moved' && this._isBroken(item)
        ? { label: 'Remove tile', click: () => { this.removeBrokenFromPage(id, itemId).catch(() => {}); } }
        : item.kind === 'moved'
          ? { label: 'Move back to desktop', click: () => { this.moveBackItems([itemId]).catch(() => {}); } }
          : { label: 'Remove', click: () => this._command(id, 'remove-tile', { itemId }) },
    ];
    this._popup('tile', rt, tpl, x, y, { itemId });
  }

  // Native menu at a point in the region page. With --ql-test-hooks it is
  // recorded instead (the self-test never shows a menu); menuClick() runs
  // an item of the last one through its real click handler.
  _popup(kind, rt, tpl, x, y, extra = {}) {
    if (this.testHooks) {
      const view = (items) => items.filter((i) => i.type !== 'separator').map((i) => ({
        label: i.label, enabled: i.enabled !== false, ...(i.type === 'checkbox' || i.type === 'radio' ? { checked: !!i.checked } : {}),
        ...(i.submenu ? { submenu: view(i.submenu) } : {}),
      }));
      this._lastMenu = tpl.filter((i) => i.type !== 'separator');
      this.menuLog.push({ kind, region: rt ? rt.id : null, x: Math.round(x), y: Math.round(y), items: view(tpl), ...extra, at: Date.now() });
      if (this.menuLog.length > 50) this.menuLog.shift();
      return;
    }
    Menu.buildFromTemplate(tpl).popup({ window: extra.window || rt.win, x: Math.round(x), y: Math.round(y) });
  }

  /**
   * The Manager's + NEW REGION menu (spec 8.1, 3.1): the layouts this build
   * draws, as the tray's New region menu lists them. A pick creates the region
   * and tells the Manager page, which focuses its name field.
   */
  popupNewRegionMenu(x, y) {
    const win = this.manager && this.manager.window;
    if (!win) return { ok: false };
    const atCap = this.regions().length >= M.REGION_CAP;
    const tpl = [...M.BUILT_LAYOUTS].map((l) => ({
      label: R.isRadial(l) ? `${layoutLabel(l)} (max ${R.capacity(l,this._iconSize(),this.workArea(),'up')})` : layoutLabel(l), enabled: !atCap && (!R.isRadial(l) || R.capacity(l,this._iconSize(),this.workArea(),'up') > 0),
      click: () => {
        const r = this.createRegion(l);
        if (win && !win.isDestroyed()) win.webContents.send('manager:created', { ok: !!r.ok, id: r.id || null, error: r.error || null });
      },
    }));
    if (this.testHooks) {
      // Recorded, never shown (as the region menus): the self-test clicks through menuClick.
      const view = tpl.map((i) => ({ label: i.label, enabled: i.enabled !== false }));
      this._lastMenu = tpl;
      this.menuLog.push({ kind: 'new-region', region: null, x: Math.round(x), y: Math.round(y), items: view, at: Date.now() });
      if (this.menuLog.length > 50) this.menuLog.shift();
      return { ok: true, recorded: true };
    }
    Menu.buildFromTemplate(tpl).popup({ window: win, x: Math.round(x), y: Math.round(y) });
    return { ok: true };
  }

  menuClick(path) {
    let items = this._lastMenu;
    let item = null;
    for (const i of Array.isArray(path) ? path : []) {
      item = items && items[i];
      items = item && item.submenu ? item.submenu.filter((s) => s.type !== 'separator') : null;
    }
    if (!item || typeof item.click !== 'function' || item.enabled === false) return { ok: false };
    item.click(item);
    return { ok: true, label: item.label };
  }

  // ── test hooks: a stand-in work area and resume (no display is changed) ──
  setTestWorkArea(rect) {
    this._testWorkArea = rect ? { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) } : null;
    this._onDisplay('test work area');
  }

  testResume() { this._onResume(); }

  /** Put one region's window somewhere else WITHOUT changing its rect (proves a relayout re-applies every window). */
  testDisplace(id, dx, dy) {
    const rt = this.rt.get(id);
    const region = this.region(id);
    if (!rt || !region) return { ok: false };
    const r = this._screenRect(region, rt.shown);
    return { ok: rt.host.setScreenRect({ left: r.left + dx, top: r.top + dy, right: r.right + dx, bottom: r.bottom + dy }) };
  }

  /** Drop an attached region to fallback now (desktop child to top-level); the watchdog re-attaches it. */
  testForceFallback(id) {
    const rt = this.rt.get(id);
    const ok = !!(rt && rt.host.testDropToFallback && rt.host.testDropToFallback());
    // Read now: the next watchdog tick (up to 1 s) re-attaches it.
    return { ok, after: rt ? rt.host.describe() : null };
  }

  /** Run the window's own 'focus' listeners (what an activation does) without activating anything. */
  testEmitFocus(id) {
    const rt = this.rt.get(id);
    if (!rt || !rt.win || rt.win.isDestroyed()) return { ok: false };
    rt.win.emit('focus');
    return { ok: true, active: this.activeId === id };
  }

  setTestCap(id, cap) {
    if (cap === null || cap === undefined) this._testCaps.delete(id);
    else this._testCaps.set(id, Math.max(0, Math.floor(cap)));
    this._notifyState(id); // the page knows its cap (a file drag that would overfill it shows FULL)
    return { ok: true };
  }

  // ── Manager view of the state ─────────────────────────────────────────────
  managerState() {
    const s = this.settings();
    const apps = this.apps();
    return {
      regions: this.regions().map((r, i) => ({
        id: r.id, name: r.name, icon: r.icon, layout: r.layout, theme: r.theme,
        count: M.itemsOf(apps, r.id).length, primary: i === 0,
        layoutCaps: {fan:R.capacity('fan',this._iconSize(),this.workArea(),'up'),ring:R.capacity('ring',this._iconSize(),this.workArea())},
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
      moved: this.movesManagerState(),
    };
  }

  // ── tests and diagnostics (--ql-test-hooks only) ──────────────────────────
  describe() {
    return this.regions().map((r) => {
      const rt = this.rt.get(r.id);
      return {
        id: r.id, name: r.name, saved: r.rect, home: r.home, pendingSave: rt ? rt.pendingSave : null,
        shown: rt ? rt.shown : null, ready: rt ? rt.ready : false, dragging: rt ? !!(rt.drag || rt.resize) : false,
        layout: r.layout, gridSize: r.gridSize || null, extras: rt ? { ...rt.extras } : null,
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
    clearTimeout(this._displayTimer);
    clearTimeout(this._resumeTimer);
    this._cancelTileDrag('quit', { instant: true });
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
      clearTimeout(rt.saveTimer);
      rt.saveTimer = null;
      this._writePendingRect(rt);
    }
  }
}

module.exports = { RegionController };
