'use strict';
// Try-it run recorder for the desktop-layer spike. Sergei does the physical
// steps without watching; this writes what happened to the run log so the
// result can be read afterwards (read-run.mjs).
//
//   probe   every 250 ms, cheap: foreground window kind, Explorer's PID, and
//           the launcher's Ctrl+C control file. Logs only on change.
//   sample  every 1 s (and 300 ms after any probe change): the panel's state,
//           parent, z-order against the icon view, coverage, DPI, the app
//           windows' shown/minimised counts, the page's paint heartbeat.
//   capture the panel's OWN pixels (webContents.capturePage) after launch,
//           after each Show Desktop change, after a recovery or fallback.
//
// Towards other windows it is read-only and reads STATE only (class name,
// style, z-order, minimised/cloaked, rect). Never titles, never their pixels.
// No hooks, no input, no activation. Win+D is inferred from window state; see
// run-summary.js.

const fs = require('node:fs');
const path = require('node:path');
const d = require('./desktop-layer');
const { DEFVIEW } = require('./pick-host');
const S = require('./run-summary');

const PROBE_MS = 250;
const SAMPLE_MS = 1000;
const PIDS_MS = 5000;
const MAX_CAPTURES = 30;
const CAPTURE_TIMEOUT_MS = 4000;
const PANEL_BG = { r: 30, g: 34, b: 48 };
const SHELL_TRAY = new Set(['Shell_TrayWnd', 'Shell_SecondaryTrayWnd']);

function createRecorder(o) {
  const { log, host, app, panelDip, runDir, controlFile, sim, onQuitRequest } = o;
  const selfPid = process.pid;
  const t0 = Date.now();
  const timers = [];
  let stopped = false;
  let n = 0;
  let soonTimer = null;
  let lastFg = '';
  let lastShellPid = -1;
  const track = S.toggleTracker();
  const sdCount = { on: 0, off: 0 };
  let sceneKey = null;
  let sceneCand = null;
  let sceneCandN = 0;
  let captures = 0;
  let lastCaptureAt = 0;
  let capturePending = false;
  let attachedOnce = false;
  let recoveredN = 0;
  let lastPids = '';
  const beat = { last: null, t: 0, vis: null };
  const input = { clicks: 0, keys: 0, loggedClicks: 0, loggedKeys: 0 };

  // ------------------------------------------------------------ signals
  function fgInfo(shellTid) {
    const h = d.W.GetForegroundWindow();
    if (!h) return { kind: 'none', cls: '', hwnd: '0' };
    const cls = d.className(h);
    const hwnd = d.hex(h);
    const { tid, pid } = d.threadAndPid(h);
    if (pid === selfPid) return { kind: 'ours', cls, hwnd };
    if ((cls === 'Progman' || cls === 'WorkerW') && tid === shellTid) return { kind: 'desktop', cls, hwnd };
    if (SHELL_TRAY.has(cls)) return { kind: 'taskbar', cls, hwnd };
    return { kind: 'other', cls, hwnd };
  }

  function rootsOf(tree) {
    return new Set([tree.progman, ...tree.workerWs.map((w) => w.hwnd)].filter(Boolean));
  }

  function defHostOf(tree) {
    if (!tree.progman) return 'none';
    if (tree.progmanChildren.some((c) => c.cls === DEFVIEW)) return 'Progman';
    const w = tree.workerWs.find((x) => x.children.some((c) => c.cls === DEFVIEW));
    return w ? (w.visible ? 'WorkerW' : 'WorkerW(hidden)') : 'none';
  }

  function inPanel(hit, hwnd) {
    for (let x = hit, i = 0; x && i < 64; x = d.W.GetAncestor(x, d.C.GA_PARENT), i++) if (x === hwnd) return true;
    return false;
  }

  // 3x3 grid inside the panel (clear of the transparent rounded corners):
  // what does the OS hit-test find at each point?
  function coverage(r, hwnd, roots) {
    const c = { panel: 0, app: 0, desktop: 0, ours: 0, n: 0 };
    for (const fx of [0.2, 0.5, 0.8]) {
      for (const fy of [0.2, 0.5, 0.8]) {
        c.n++;
        const hit = d.W.WindowFromPoint({ x: Math.round(r.left + fx * r.width), y: Math.round(r.top + fy * r.height) });
        if (!hit) continue;
        if (inPanel(hit, hwnd)) { c.panel++; continue; }
        const root = d.W.GetAncestor(hit, d.C.GA_ROOT);
        if (roots.has(root)) c.desktop++;
        else if (d.threadAndPid(hit).pid === selfPid) c.ours++;
        else c.app++;
      }
    }
    return c;
  }

  function simActive(kind) {
    if (!sim || !sim[kind]) return false;
    const el = Date.now() - t0;
    return sim[kind].some(([a, b]) => el >= a && el < b);
  }

  // ------------------------------------------------------------ probe
  function probe() {
    if (stopped) return;
    if (controlFile) {
      try {
        if (fs.existsSync(controlFile) && fs.readFileSync(controlFile, 'utf8').includes('quit')) { onQuitRequest('ctrl-c'); return; }
      } catch { /* launcher still writing */ }
    }
    const progman = d.W.FindWindowW('Progman', null);
    const shell = progman ? d.threadAndPid(progman) : { tid: 0, pid: 0 };
    if (shell.pid !== lastShellPid) {
      log({ event: 'explorer', from: lastShellPid === -1 ? null : lastShellPid, to: shell.pid, progman: d.hex(progman) });
      lastShellPid = shell.pid;
      soon();
    }
    const fg = fgInfo(shell.tid);
    const key = `${fg.kind}|${fg.hwnd}`;
    if (key !== lastFg) { lastFg = key; log({ event: 'fg', ...fg }); soon(); }
  }

  function soon() {
    if (soonTimer || stopped) return;
    soonTimer = setTimeout(() => { soonTimer = null; sample(); }, 300);
  }

  // ------------------------------------------------------------ sample
  function sample() {
    if (stopped) return;
    const tStart = process.hrtime.bigint();
    const s = { event: 'sample', n: ++n, state: host.mode, layout: host.layout };
    const tree = d.readDesktopTree();
    const roots = rootsOf(tree);
    s.shell = { pid: tree.shellPid || 0 };
    s.defHost = defHostOf(tree);
    const sc = d.windowScene(roots, selfPid);
    s.apps = sc.apps;
    s.desktopAboveApps = sc.desktopAboveApps;
    s.zDesktop = sc.desktopZ;
    s.zFirstApp = sc.firstAppZ;
    s.fg = fgInfo(tree.shellTid);
    const hwnd = host.hwnd;
    s.hwnd = d.hex(hwnd);
    if (hwnd && d.W.IsWindow(hwnd)) {
      s.alive = true;
      s.visible = !!d.W.IsWindowVisible(hwnd);
      const style = d.W.GetWindowLongW(hwnd, d.C.GWL_STYLE);
      s.wsVisible = !!(style & d.C.WS_VISIBLE);
      s.wsChild = !!(style & d.C.WS_CHILD);
      const parent = d.W.GetAncestor(hwnd, d.C.GA_PARENT);
      s.parent = d.hex(parent);
      s.parentCls = d.className(parent);
      s.parented = !!host.host && parent === host.host;
      s.hostPid = parent ? d.threadAndPid(parent).pid : 0;
      const root = d.W.GetAncestor(hwnd, d.C.GA_ROOT);
      s.rootCls = d.className(root);
      s.rootDesktop = roots.has(root);
      s.rootCloaked = d.isCloaked(root);
      if (s.parented) {
        const z = d.isAboveDefView(hwnd, host.host);
        s.z = { me: z.me, defView: z.defView, above: z.above };
        const dv = d.W.FindWindowExW(host.host, 0, DEFVIEW, null);
        s.dvVisible = !!(dv && d.W.IsWindowVisible(dv));
      }
      const r = d.windowRect(hwnd);
      s.dpi = d.W.GetDpiForWindow(hwnd);
      if (r) {
        s.rect = { x: r.left, y: r.top, w: r.width, h: r.height };
        s.sizeOk = Math.abs(r.width - Math.round(panelDip.width * s.dpi / 96)) <= 2
          && Math.abs(r.height - Math.round(panelDip.height * s.dpi / 96)) <= 2;
        if (s.visible) s.cover = coverage(r, hwnd, roots);
      }
    } else {
      s.alive = false;
    }
    s.rend = beat.last ? { ...beat.last, ageMs: Date.now() - beat.t } : null;
    s.input = { clicks: input.clicks, keys: input.keys };
    s.stats = { ...host.stats };
    if (simActive('sd')) {
      // Test hook only (--ql-sim-sd): pretend Show Desktop is on.
      s.sim = 'show-desktop';
      s.fg = { kind: 'desktop', cls: 'Progman' };
      s.apps = { ...s.apps, min: s.apps.min + s.apps.shown, shown: 0 };
      s.desktopAboveApps = false;
      if (s.cover) s.cover = { panel: 9, app: 0, desktop: 0, ours: 0, n: 9 };
    }
    s.ms = Math.round(Number(process.hrtime.bigint() - tStart) / 1e5) / 10;
    log(s);

    if (input.clicks !== input.loggedClicks || input.keys !== input.loggedKeys) {
      log({ event: 'input', clicks: input.clicks, keys: input.keys, newClicks: input.clicks - input.loggedClicks, newKeys: input.keys - input.loggedKeys });
      input.loggedClicks = input.clicks;
      input.loggedKeys = input.keys;
    }

    // Show Desktop, live (same tracker the analyzer replays).
    const x = track(s);
    if (x) {
      const kind = x.on ? 'on' : 'off';
      sdCount[kind]++;
      log({ event: 'show-desktop', on: x.on, n: sdCount[kind], since: x.t, basis: x.basis });
      scheduleCapture(`show-desktop-${kind}-${sdCount[kind]}`, 1200, false);
    }
    // Any other stable change of what is on screen gets a capture too, so a
    // Win+D the rule above misses still has pixels next to it.
    const key = `${s.fg.kind === 'desktop'}|${s.apps.shown === 0}|${!!s.desktopAboveApps}|${!s.cover || s.cover.panel >= S.MIN_UNCOVERED}`;
    if (sceneKey === null) sceneKey = key;
    else if (key !== sceneKey) {
      if (key === sceneCand) sceneCandN++; else { sceneCand = key; sceneCandN = 1; }
      if (sceneCandN >= 2) {
        sceneKey = key;
        sceneCand = null;
        log({ event: 'state-change', key });
        scheduleCapture(`change-${n}`, 800, true);
      }
    } else { sceneCand = null; sceneCandN = 0; }
  }

  // ------------------------------------------------------------ captures
  function scheduleCapture(label, delayMs, dedupe) {
    if (stopped || captures >= MAX_CAPTURES) return;
    if (dedupe && (capturePending || Date.now() - lastCaptureAt < 2000)) return;
    capturePending = true;
    const tm = setTimeout(() => { capturePending = false; capture(label); }, delayMs);
    timers.push(tm);
  }

  function withTimeout(p, ms) {
    return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout ${ms} ms`)), ms))]);
  }

  async function capture(label) {
    if (stopped || captures >= MAX_CAPTURES) return;
    const win = host.win;
    const t = Date.now();
    lastCaptureAt = t;
    if (!win || win.isDestroyed()) { log({ event: 'capture', label, ok: false, why: 'no window' }); return; }
    captures++;
    let img = null;
    let why = '';
    try { img = await withTimeout(win.webContents.capturePage(), CAPTURE_TIMEOUT_MS); } catch (e) { why = String(e && e.message || e); }
    if (stopped) return;
    if (!img || img.isEmpty()) { log({ event: 'capture', label, ok: false, why: why || 'empty image', ms: Date.now() - t }); return; }
    const sfs = img.getScaleFactors();
    const sf = sfs.length ? Math.max(...sfs) : 1;
    const size = img.getSize(sf);
    const bmp = img.toBitmap({ scaleFactor: sf });
    let opaque = 0;
    let bg = 0;
    let seen = 0;
    for (let i = 0; i + 3 < bmp.length; i += 16) { // every 4th pixel, BGRA
      seen++;
      if (bmp[i + 3] > 200) opaque++;
      if (Math.abs(bmp[i + 2] - PANEL_BG.r) <= 8 && Math.abs(bmp[i + 1] - PANEL_BG.g) <= 8 && Math.abs(bmp[i] - PANEL_BG.b) <= 8) bg++;
    }
    // Chromium hands back physical pixels: expect DIP size x the window's DPI.
    const dpi = (host.hwnd && d.W.GetDpiForWindow(host.hwnd)) || 96;
    const expectPx = { w: Math.round(panelDip.width * dpi / 96), h: Math.round(panelDip.height * dpi / 96) };
    const file = path.join(runDir, `${String(captures).padStart(2, '0')}-${label}.png`);
    try { fs.writeFileSync(file, img.toPNG({ scaleFactor: sf })); } catch (e) { why = `png not saved: ${e.message}`; }
    const opaqueF = seen ? Math.round((opaque / seen) * 1000) / 1000 : 0;
    const bgF = seen ? Math.round((bg / seen) * 1000) / 1000 : 0;
    log({
      event: 'capture', label, ok: true, file, w: size.width, h: size.height, imageScale: sf, dpi, expectPx,
      scaleOk: Math.abs(size.width - expectPx.w) <= 2 && Math.abs(size.height - expectPx.h) <= 2,
      opaque: opaqueF, panelBg: bgF, rendered: opaqueF >= 0.6 && bgF >= 0.25, ms: Date.now() - t, ...(why ? { note: why } : {}),
    });
  }

  // ------------------------------------------------------------ host events
  host.on('mode', (mode, info) => {
    if (stopped) return;
    if (mode === 'attached') {
      if (!attachedOnce) { attachedOnce = true; scheduleCapture('launch', 1500, false); }
      else if (info.from === 'fallback') scheduleCapture('fallback-out', 1500, false);
      else if (info.recovered) scheduleCapture(`recovered-${++recoveredN}`, 1500, false);
    } else if (mode === 'fallback') {
      scheduleCapture('fallback-in', 1500, false);
    }
    soon();
  });
  host.on('window', () => {
    beat.last = null;
    beat.vis = null;
    log({ event: 'window', hwnd: d.hex(host.hwnd), rebuilt: host.stats.recreated });
  });

  function logPids(final) {
    let pids = [];
    try { pids = app.getAppMetrics().map((m) => ({ pid: m.pid, type: m.type })); } catch { return; }
    const key = pids.map((p) => p.pid).sort().join(',');
    if (key === lastPids && !final) return;
    lastPids = key;
    log({ event: 'pids', pids, ...(final ? { final: true } : {}) });
  }

  return {
    start() {
      timers.push(setInterval(probe, PROBE_MS));
      timers.push(setInterval(sample, SAMPLE_MS));
      timers.push(setInterval(() => logPids(false), PIDS_MS));
      probe();
      sample();
      logPids(false);
    },
    stop() {
      logPids(true);
      stopped = true;
      for (const tm of timers) { clearInterval(tm); clearTimeout(tm); }
      if (soonTimer) clearTimeout(soonTimer);
    },
    onBeat(p) {
      const b = S.cleanBeat(p);
      beat.last = b;
      beat.t = Date.now();
      if (b.vis !== beat.vis) { beat.vis = b.vis; log({ event: 'page-visibility', vis: b.vis }); }
    },
    onInput(p) {
      const k = S.cleanInputKind(p);
      if (k === 'key') input.keys++;
      else if (k === 'pointer') input.clicks++;
    },
  };
}

module.exports = { createRecorder };
