'use strict';
// Keeps ONE region window on the desktop layer and puts it back when the shell
// takes it away. State machine:
//   pending  -> no usable parent yet; window hidden; retry every tick
//   attached -> WS_CHILD of the icon-view host (Progman or WorkerW)
//   fallback -> ordinary top-level tool window just above the desktop
//               (unknown layout / Explorer gone for too long / kill switch)
// The watchdog is a poll: cheap checks each tick, full tree re-read only when
// something looks wrong.

const { EventEmitter } = require('node:events');
const d = require('./desktop-layer');

class RegionHost extends EventEmitter {
  constructor(opts) {
    super();
    this.createWindow = opts.createWindow; // () => Promise<BrowserWindow> (hidden, ready-to-show)
    this.screenRect = opts.screenRect; // physical px {left, top, right, bottom}
    this.pollMs = opts.pollMs || 1000;
    this.fallbackAfterMs = opts.fallbackAfterMs || 10000;
    this.killSwitch = !!opts.killSwitch;
    this.forceHost = opts.forceHost || 0; // test hook: attach here first instead of the desktop
    this.simulateUnknown = false; // test hook: finder reports an unknown layout
    this.log = opts.log || (() => {});
    this.mode = 'pending';
    this.host = 0;
    this.layout = null;
    this.win = null;
    this.hwnd = 0;
    this.pendingSince = Date.now();
    this.lostAt = 0; // when the panel last left the desktop layer (0 = not lost)
    this.stopping = false;
    this.busy = false;
    this.stats = { attaches: 0, losses: 0, recreated: 0, raises: 0, fallbacks: 0 };
  }

  async start() {
    await this._ensureWindow();
    this.timer = setInterval(() => this.tick(), this.pollMs);
    await this.tick();
  }

  async _ensureWindow() {
    if (this.win && !this.win.isDestroyed()) return;
    this.win = await this.createWindow();
    this.hwnd = d.hwndOf(this.win);
    this.win.once('closed', () => {
      const lostHwnd = this.hwnd;
      this.win = null;
      this.hwnd = 0;
      if (this.stopping) return;
      // Not closed by us: the shell destroyed our HWND along with its parent.
      this.stats.recreated++;
      if (!this.lostAt) this.lostAt = Date.now();
      this._setMode('pending', { reason: 'window destroyed with its parent', hwnd: d.hex(lostHwnd) });
    });
    this.emit('window', this.win);
  }

  _setMode(mode, info = {}) {
    const prev = this.mode;
    this.mode = mode;
    if (mode === 'pending' && prev !== 'pending') this.pendingSince = Date.now();
    this.log({ event: 'mode', from: prev, to: mode, layout: this.layout, host: d.hex(this.host), ...info });
    this.emit('mode', mode, { from: prev, ...info });
  }

  _tryAttach() {
    const from = this.mode;
    const r = this._attachOnce();
    // Every re-parent attempt is logged with its result.
    this.log({ event: 'attach-attempt', from, ...r });
    return r;
  }

  _attachOnce() {
    let host = 0;
    let layout = null;
    if (this.forceHost) {
      host = this.forceHost;
      layout = 'forced-test-parent';
      this.forceHost = 0; // one-shot
      if (!d.W.IsWindow(host)) return { ok: false, reason: 'forced parent not a window' };
    } else {
      const pick = d.findHost({ simulateUnknown: this.simulateUnknown });
      if (!pick.ok) return { ok: false, reason: pick.reason, layout: pick.layout };
      host = pick.host;
      layout = pick.layout;
    }
    const hostCls = d.className(host);
    const hostPid = d.threadAndPid(host).pid;
    const r = d.attachToHost(this.hwnd, host, this.screenRect);
    if (!r.ok) return { ok: false, reason: r.error, layout, host: d.hex(host), hostCls, hostPid };
    this.host = host;
    this.layout = layout;
    // Show without activation. Z-order among siblings was set by attachToHost.
    this.win.showInactive();
    this.stats.attaches++;
    const info = { layout, hostCls, hostPid };
    if (this.lostAt) {
      info.recovered = true;
      info.recoveredMs = Date.now() - this.lostAt;
      this.lostAt = 0;
    }
    this._setMode('attached', info);
    return { ok: true, layout, host: d.hex(host), hostCls, hostPid, prevParent: d.hex(r.prevParent), recoveredMs: info.recoveredMs };
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }

  async tick() {
    if (this.stopping || this.busy || this.paused) return;
    this.busy = true;
    try {
      await this._tick();
    } catch (e) {
      this.log({ event: 'tick-error', error: String(e && e.stack || e) });
    } finally {
      this.busy = false;
    }
  }

  async _tick() {
    if (!this.win || this.win.isDestroyed()) {
      await this._ensureWindow();
      if (this.stopping) return;
    }
    if (this.killSwitch) {
      if (this.mode !== 'fallback') this._goFallback('kill switch');
      return;
    }
    if (this.mode === 'attached') {
      const reason = this._lostReason();
      if (!reason) return;
      this.stats.losses++;
      if (!this.lostAt) this.lostAt = Date.now();
      d.W.ShowWindow(this.hwnd, d.C.SW_HIDE); // never leave a stray window on screen
      this._setMode('pending', { reason });
      this.host = 0;
    }
    // pending or fallback: look for a desktop to attach to.
    const r = this._tryAttach();
    if (r.ok) return;
    if (this.mode === 'pending' && Date.now() - this.pendingSince >= this.fallbackAfterMs) {
      this._goFallback(r.reason);
    }
  }

  _lostReason() {
    const W = d.W;
    if (!W.IsWindow(this.host)) return 'host window destroyed';
    if (W.GetAncestor(this.hwnd, d.C.GA_PARENT) !== this.host) return 'parent changed';
    if (this.layout === 'forced-test-parent') return null;
    // Follow the icon view: if Explorer moved DefView to another window, re-pick.
    if (!W.FindWindowExW(this.host, 0, 'SHELLDLL_DefView', null)) return 'icon view left our host';
    const z = d.isAboveDefView(this.hwnd, this.host);
    if (!z.above) {
      d.raiseAmongSiblings(this.hwnd);
      this.stats.raises++;
      this.log({ event: 'raised-above-icons', me: z.me, defView: z.defView });
    }
    return null;
  }

  _goFallback(reason) {
    const r = d.detachToTopLevel(this.hwnd, this.screenRect);
    this.host = 0;
    this.layout = null;
    this.stats.fallbacks++;
    this._setMode('fallback', { reason, ok: r.ok, insertAfter: d.hex(r.insertAfter) });
  }

  // Test hook: yank the window out from under us the way a shell change would.
  simulateParentChange(newParent) {
    return d.W.SetParent(this.hwnd, newParent);
  }

  stop() {
    this.stopping = true;
    clearInterval(this.timer);
    let released = false;
    if (this.win && !this.win.isDestroyed()) {
      released = d.releaseFromShell(this.hwnd);
      this.win.destroy();
    }
    return { released };
  }
}

module.exports = { RegionHost };
