'use strict';
// The Manager: one normal top-level window for region management and
// settings (spec 8). Created on demand; its ✕ closes only the Manager, the
// process lives on in the tray. With --ql-test-hooks it is created but never
// shown or focused, so a self-test can drive it without taking focus.

const { BrowserWindow, screen, app } = require('electron');
const path = require('path');

const HTML = path.join(__dirname, '../renderer/manager.html');
const PRELOAD = path.join(__dirname, 'manager-preload.js');
const DEFAULT = { width: 560, height: 560 };
const MIN = { width: 440, height: 420 };

function visible(b) {
  return screen.getAllDisplays().some((d) => {
    const wa = d.workArea;
    const ox = Math.min(b.x + b.width, wa.x + wa.width) - Math.max(b.x, wa.x);
    const oy = Math.min(b.y + b.height, wa.y + wa.height) - Math.max(b.y, wa.y);
    return ox >= 100 && oy >= 50;
  });
}

class Manager {
  constructor({ store, testHooks = false, log = () => {} }) {
    this.store = store;
    this.testHooks = testHooks;
    this.log = log;
    this.win = null;
    this.ready = false;
    this.pendingView = null;
    this._boundsTimer = null;
  }

  get window() { return this.win && !this.win.isDestroyed() ? this.win : null; }

  isSender(wc) {
    return !!(wc && this.win && !this.win.isDestroyed() && this.win.webContents.id === wc.id);
  }

  _bounds() {
    const saved = (this.store.get('settings') || {}).managerBounds;
    if (saved && [saved.x, saved.y, saved.width, saved.height].every(Number.isFinite)) {
      const b = {
        x: Math.round(saved.x), y: Math.round(saved.y),
        width: Math.max(MIN.width, Math.round(saved.width)), height: Math.max(MIN.height, Math.round(saved.height)),
      };
      if (visible(b)) return b;
    }
    const wa = screen.getPrimaryDisplay().workArea;
    return {
      x: Math.round(wa.x + (wa.width - DEFAULT.width) / 2),
      y: Math.round(wa.y + (wa.height - DEFAULT.height) / 2),
      ...DEFAULT,
    };
  }

  _create() {
    const b = this._bounds();
    const win = new BrowserWindow({
      ...b, minWidth: MIN.width, minHeight: MIN.height,
      show: false, frame: false, transparent: true, backgroundColor: '#00000000', hasShadow: false,
      skipTaskbar: false, resizable: true, title: 'QuickLauncher',
      webPreferences: {
        preload: PRELOAD, contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: false,
        additionalArguments: [`--app-version=${app.getVersion()}`],
      },
    });
    this.win = win;
    this.ready = false;
    win.on('closed', () => {
      if (this.win === win) { this.win = null; this.ready = false; }
    });
    const saveBounds = () => {
      if (win.isDestroyed() || win.isMinimized() || !win.isVisible()) return;
      clearTimeout(this._boundsTimer);
      this._boundsTimer = setTimeout(() => {
        if (win.isDestroyed()) return;
        const s = this.store.get('settings') || {};
        this.store.set('settings', { ...s, managerBounds: win.getBounds() });
      }, 400);
    };
    win.on('moved', saveBounds);
    win.on('resize', saveBounds);
    win.on('focus', () => { try { this.store.recheck(); } catch { /* noop */ } });
    win.webContents.on('did-start-navigation', (d) => { if (d && d.isMainFrame && !d.isSameDocument) this.ready = false; });
    win.loadFile(HTML);
    return win;
  }

  /** The page announced itself: deliver the view it was opened for. */
  rendererReady() {
    this.ready = true;
    if (this.pendingView && this.win) {
      this.win.webContents.send('manager:show-view', this.pendingView);
      this.pendingView = null;
    }
  }

  open(view = 'regions', { regionId = null } = {}) {
    const win = this.window || this._create();
    const msg = { view, regionId };
    if (this.ready) win.webContents.send('manager:show-view', msg); else this.pendingView = msg;
    if (this.testHooks) {
      this.log({ event: 'manager-open', view, hidden: true });
      return;
    }
    if (win.isMinimized()) win.restore();
    if (!win.isVisible()) {
      win.once('ready-to-show', () => { if (!win.isDestroyed()) { win.show(); win.focus(); } });
      if (this.ready) { win.show(); win.focus(); }
    } else {
      win.focus();
    }
  }

  close() { if (this.window) this.win.close(); }

  changed() {
    if (this.window && this.ready) this.win.webContents.send('manager:changed');
  }

  send(channel, ...args) {
    if (this.window && this.ready) this.win.webContents.send(channel, ...args);
  }
}

module.exports = { Manager };
