'use strict';
// Keeps ONE region window on the desktop layer and puts it back when the
// shell takes it away. Ported from the 2026-09-30 spike; differences:
//   - no timer of its own: the controller ticks every host from one watchdog
//   - a `hidden` flag that survives rebuilds (a hidden region stays hidden)
//   - setScreenRect() moves/resizes in the right coordinate space per mode
//
// States:
//   pending  -> no usable parent yet; window hidden; retried every tick
//   attached -> WS_CHILD of the icon-view host (Progman or a WorkerW)
//   fallback -> ordinary top-level tool window just above the desktop
//               (kill switch, koffi unavailable, or no desktop for too long)

const { EventEmitter } = require('node:events');
const d = require('./desktop-layer');

class RegionHost extends EventEmitter {
  constructor(opts) {
    super();
    this.createWindow = opts.createWindow; // () => Promise<BrowserWindow> (hidden, ready-to-show)
    this.screenRect = opts.screenRect;     // physical px {left, top, right, bottom}
    this.fallbackAfterMs = opts.fallbackAfterMs || 10000;
    this.killSwitch = !!opts.killSwitch || !d.available;
    this.hidden = !!opts.hidden;
    this.log = opts.log || (() => {});
    this.tag = opts.tag || '';
    this.mode = 'pending';
    this.host = 0;
    this.layout = null;
    this.win = null;
    this.hwnd = 0;
    this.dragOrder = null;
    this.foreground = null;
    this.pendingSince = Date.now();
    this.lostAt = 0;
    this.stopping = false;
    this.busy = false;
    this.stats = { attaches: 0, losses: 0, rebuilds: 0, raises: 0, fallbacks: 0 };
  }

  // Through tick(), so start() and the watchdog can never both build a window.
  async start() {
    await this.tick();
  }

  // One window at a time: a second caller waits for the creation in flight.
  _ensureWindow() {
    if (this.win && !this.win.isDestroyed()) return Promise.resolve();
    if (!this._creating) {
      this._creating = this._createOne().finally(() => { this._creating = null; });
    }
    return this._creating;
  }

  async _createOne() {
    const win = await this.createWindow();
    if (this.stopping) { try { win.destroy(); } catch { /* gone */ } return; }
    this.win = win;
    this.hwnd = d.hwndOf(win);
    win.once('closed', () => {
      if (this.win !== win) return;
      const lost = this.hwnd;
      this.dragOrder = null;
      this.foreground = null;
      this.win = null;
      this.hwnd = 0;
      if (this.stopping) return;
      // Not closed by us: the shell destroyed our HWND along with its parent.
      this.stats.rebuilds++;
      if (!this.lostAt) this.lostAt = Date.now();
      this._setMode('pending', { reason: 'window destroyed with its parent', hwnd: d.hex(lost) });
    });
    this.emit('window', win);
  }

  _setMode(mode, info = {}) {
    if (mode !== this.mode) this.endDragRaise();
    const prev = this.mode;
    this.mode = mode;
    if (mode === 'pending' && prev !== 'pending') this.pendingSince = Date.now();
    this.log({ event: 'mode', region: this.tag, from: prev, to: mode, layout: this.layout, host: d.hex(this.host), ...info });
    this.emit('mode', mode, { from: prev, ...info });
  }

  _attachOnce() {
    const pick = d.findHost();
    if (!pick.ok) return { ok: false, reason: pick.reason, layout: pick.layout };
    const r = d.attachToHost(this.hwnd, pick.host, this.screenRect);
    if (!r.ok) return { ok: false, reason: r.error, layout: pick.layout };
    this.host = pick.host;
    this.layout = pick.layout;
    if (!this.hidden) this.win.showInactive();
    this.stats.attaches++;
    const info = { layout: pick.layout, hostClass: d.className(pick.host) };
    if (this.lostAt) {
      info.recovered = true;
      info.recoveredMs = Date.now() - this.lostAt;
      this.lostAt = 0;
    }
    this._setMode('attached', info);
    return { ok: true };
  }

  async tick() {
    if (this.stopping || this.busy) return;
    this.busy = true;
    try {
      await this._tick();
    } catch (e) {
      this.log({ event: 'tick-error', region: this.tag, error: String((e && e.stack) || e) });
    } finally {
      this.busy = false;
    }
  }

  async _tick() {
    if (!this.win || this.win.isDestroyed()) {
      await this._ensureWindow();
      if (this.stopping || !this.win) return;
    }
    if (this.mode === 'foreground') return;
    if (this._clearTopmostPending) {
      if (!d.clearTopmost(this.hwnd)) return;
      this._clearTopmostPending = false;
    }
    if (this.killSwitch) {
      if (this.mode !== 'fallback') this._goFallback(d.available ? 'kill switch' : 'desktop layer unavailable');
      return;
    }
    if (this.mode === 'attached') {
      const reason = this._lostReason();
      if (!reason) return;
      this.stats.losses++;
      if (!this.lostAt) this.lostAt = Date.now();
      d.hide(this.hwnd); // never leave a stray window on screen
      this._setMode('pending', { reason });
      this.host = 0;
    }
    const r = this._attachOnce();
    if (r.ok) return;
    if (this.mode === 'pending' && Date.now() - this.pendingSince >= this.fallbackAfterMs) {
      this._goFallback(r.reason);
    }
  }

  _lostReason() {
    if (!d.isWindow(this.host)) return 'host window destroyed';
    if (d.parentOf(this.hwnd) !== this.host) return 'parent changed';
    if (!d.hasDefView(this.host)) return 'icon view left our host';
    const z = d.isAboveDefView(this.hwnd, this.host);
    if (!z.above) {
      d.raiseAmongSiblings(this.hwnd);
      this.stats.raises++;
      this.log({ event: 'raised-above-icons', region: this.tag, me: z.me, defView: z.defView });
    }
    return null;
  }

  // F-2: Chromium paints a window and routes its input only after Electron's
  // own show. A window that only Win32 made visible (SetWindowPos with
  // SWP_SHOWWINDOW, ShowWindow) is visible to Windows, which hit-tests it
  // and gives it clicks, but its compositor makes no frames and its page gets
  // no mouse or key event: blank and inert. So every Win32 show is followed
  // by this. The window already is visible in its slot, so Electron's
  // ShowWindow(SW_SHOWNOACTIVATE) neither moves it in the z-order nor
  // activates it (measured in TechPlan section 8.3).
  _showToChromium() {
    if (this.hidden || !this.win || this.win.isDestroyed()) return;
    this.win.showInactive();
  }

  _goFallback(reason) {
    if (d.available) {
      const r = d.detachToTopLevel(this.hwnd, this.screenRect, { show: !this.hidden });
      this._showToChromium();
      this.host = 0;
      this.layout = null;
      this.stats.fallbacks++;
      this._setMode('fallback', { reason, ok: r.ok });
    } else {
      // No Win32 access at all: a plain Electron window, shown without activation.
      this.host = 0;
      this.layout = null;
      const b = this.screenRect;
      this.win.setBounds(require('electron').screen.screenToDipRect(null, {
        x: b.left, y: b.top, width: b.right - b.left, height: b.bottom - b.top,
      }));
      if (!this.hidden) this.win.showInactive();
      this.stats.fallbacks++;
      this._setMode('fallback', { reason, ok: true });
    }
  }

  /** Move/resize to a screen rect (physical px). */
  setScreenRect(rect) {
    this.screenRect = rect;
    if (!this.win || this.win.isDestroyed() || !this.hwnd) return false;
    if (this.mode === 'attached' && d.isWindow(this.host)) return d.setChildRect(this.hwnd, this.host, rect);
    if (this.mode === 'fallback' || this.mode === 'foreground') {
      if (d.available) return d.setTopLevelRect(this.hwnd, rect);
      this.win.setBounds(require('electron').screen.screenToDipRect(null, {
        x: rect.left, y: rect.top, width: rect.right - rect.left, height: rect.bottom - rect.top,
      }));
      return true;
    }
    return false; // pending: applied on the next attach
  }

  setHidden(hidden) {
    this.hidden = !!hidden;
    if (this.hidden) this.endDragRaise();
    if (!this.win || this.win.isDestroyed() || !this.hwnd) return;
    if (this.hidden) {
      if (d.available) d.hide(this.hwnd); else this.win.hide();
      return;
    }
    if (this.mode === 'attached') {
      d.showNoActivate(this.hwnd);
      this._showToChromium(); // a region attached while hidden was never shown to Chromium
    } else if (this.mode === 'foreground') {
      if (d.available) d.showNoActivate(this.hwnd);
      this._showToChromium();
    } else if (this.mode === 'fallback') {
      if (d.available) { d.showTopLevelAtBottom(this.hwnd); this._showToChromium(); } else this.win.showInactive();
    }
    // pending: shown when it attaches
  }

  /** Give the window keyboard focus after a click on it (never steals focus). */
  focusAfterClick() {
    if (this.mode !== 'attached') return false;
    return d.focusIfDesktopForeground(this.hwnd);
  }

  captureForeground() {
    return { window: this.win, hidden: this.hidden, mode: this.mode,
      native: d.available ? d.captureForeground(this.hwnd) : null };
  }

  beginForeground(saved = this.captureForeground()) {
    if (this.foreground || !this.win || this.win.isDestroyed()
        || (this.mode !== 'attached' && this.mode !== 'fallback') || this.busy) return false;
    this.endDragRaise();
    if (saved.window !== this.win) return false;
    if (d.available) {
      saved.native = d.beginForeground(this.hwnd, this.screenRect, saved.native);
      if (!saved.native) return false;
      if (saved.native.failed) {
        this.foreground = saved;
        this.endForeground();
        return false;
      }
    } else {
      this.win.setAlwaysOnTop(true);
    }
    this.foreground = saved;
    this.hidden = false;
    this._setMode('foreground');
    this._showToChromium();
    return true;
  }

  endForeground() {
    const saved = this.foreground;
    this.foreground = null;
    if (!saved) return true;
    this.hidden = saved.hidden;
    if (saved.window !== this.win || !this.win || this.win.isDestroyed()) return false;
    if (d.available) {
      const restored = d.restoreForeground(saved.native, this.screenRect);
      this.host = restored.host || 0;
      if (!restored.ok) {
        d.hide(this.hwnd);
        this._clearTopmostPending = true;
        this._setMode('pending', { reason: 'foreground restore failed' });
        return false;
      }
      this._setMode(restored.attached ? 'attached' : 'fallback');
      if (restored.attached && restored.host === saved.native.parent) this._foregroundOrder = saved;
    } else {
      this.win.setAlwaysOnTop(false);
      this._setMode('fallback');
    }
    this.setHidden(saved.hidden);
    return true;
  }

  finishForegroundOrder() {
    const saved = this._foregroundOrder;
    this._foregroundOrder = null;
    if (!saved || this.mode !== 'attached' || this.win !== saved.window || this.win.isDestroyed()
        || this.hwnd !== saved.native.hwnd || this.host !== saved.native.parent) return;
    d.endDragRaise({ hwnd: this.hwnd, host: this.host, previous: saved.native.previous, next: saved.native.next });
  }

  beginDragRaise() {
    this.endDragRaise();
    if (this.mode !== 'attached' || !this.win || this.win.isDestroyed()) return false;
    const order = d.beginDragRaise(this.hwnd, this.host);
    this.dragOrder = order ? { order, window: this.win } : null;
    return !!order;
  }

  endDragRaise() {
    const saved = this.dragOrder;
    this.dragOrder = null;
    if (!saved) return true;
    if (saved.window !== this.win || !this.win || this.win.isDestroyed()
        || saved.order.hwnd !== this.hwnd || saved.order.host !== this.host) return false;
    return d.endDragRaise(saved.order);
  }

  /** --ql-test-hooks: drop an attached region to fallback now (the desktop-child to top-level path); the next tick re-attaches it. */
  testDropToFallback() {
    if (this.mode !== 'attached' || !this.win || this.win.isDestroyed()) return false;
    this._goFallback('test: drop to fallback');
    return true;
  }

  describe() {
    return { mode: this.mode, layout: this.layout, hidden: this.hidden, stats: { ...this.stats }, win: d.describe(this.hwnd) };
  }

  stop() {
    this.endDragRaise();
    this.foreground = null;
    this.stopping = true;
    let released = false;
    if (this.win && !this.win.isDestroyed()) {
      if (d.available) d.clearTopmost(this.hwnd); else this.win.setAlwaysOnTop(false);
      released = d.releaseFromShell(this.hwnd);
      this.win.destroy();
    }
    this.win = null;
    this.hwnd = 0;
    return { released };
  }
}

module.exports = { RegionHost };
