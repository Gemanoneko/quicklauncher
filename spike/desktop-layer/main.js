'use strict';
// QuickLaunch regions - desktop-layer spike. Standalone Electron entry; not
// wired into the app. One plain rounded panel parented to the desktop's icon
// host (Progman on Win11 24H2+, WorkerW on the classic split layout), kept
// there by a watchdog.
//
//   Try-it:       node spike/desktop-layer/tryit.mjs        (run log + summary)
//                 npx electron spike/desktop-layer/main.js  (run log, no exit check)
//   Read a run:   node spike/desktop-layer/read-run.mjs [run.jsonl] [--timeline]
//   Kill switch:  add --ql-no-desktop-layer
//   Self-test:    node spike/desktop-layer/test/run-selftest.mjs <outDir>
//
// Try-it records itself (recorder.js) to %TEMP%\ql-regions-spike\runs\run-<stamp>.jsonl,
// with panel captures in the folder of the same name, and ends with a summary
// line (run-summary.js). Test-only flags: --ql-no-focus, --ql-sim-sd=<onMs>,<offMs>,
// --ql-sim-parent=<hwnd>, --ql-max-minutes=<n>, --ql-exit-after-ms=<n>.
//
// Never writes the Run key, never registers hotkeys, never activates its own
// windows, plays no audio. The x button (or Ctrl+C in the launch terminal)
// quits the whole process.

const { app, BrowserWindow, ipcMain, screen, nativeImage, powerMonitor } = require('electron');
const { EventEmitter } = require('node:events');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

function arg(name, dflt) {
  const pre = `--ql-${name}`;
  for (const a of process.argv) {
    if (a === pre) return true;
    if (a.startsWith(pre + '=')) return a.slice(pre.length + 1);
  }
  return dflt;
}

const MODE = arg('mode', 'tryit');
const S = require('./run-summary');
// Try-it always keeps a run log (default path below; the launcher passes one).
const RUN = MODE === 'tryit' ? (() => {
  const given = arg('log', null);
  const logFile = typeof given === 'string' ? given : path.join(S.defaultRunsDir(), `run-${S.runStamp()}.jsonl`);
  const runDir = logFile.replace(/\.jsonl$/i, '');
  fs.mkdirSync(runDir, { recursive: true });
  const ctl = arg('control', null);
  return { logFile, runDir, controlFile: typeof ctl === 'string' ? ctl : null, events: [] };
})() : null;
const LOG_FILE = RUN ? RUN.logFile : arg('log', null);
app.setPath('userData', path.join(os.tmpdir(), 'ql-regions-spike', MODE));

// Per-second lines stay out of the terminal; everything goes to the log.
const QUIET = new Set(['sample', 'fg', 'attach-attempt', 'pids', 'input', 'state-change', 'page-visibility']);
function log(obj) {
  const now = Date.now();
  const entry = { t: now, ts: new Date(now).toISOString(), mode: MODE, ...obj };
  const line = JSON.stringify(entry);
  if (!RUN || !QUIET.has(entry.event)) console.log(line);
  if (LOG_FILE) { try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch { /* keep running without the log */ } }
  if (RUN) RUN.events.push(entry);
}

const d = require('./desktop-layer');
const { RegionHost } = require('./region-host');
const { createRecorder } = require('./recorder');

// Try-it panel carries the big numbered steps; self-test keeps the old size.
const PANEL = MODE === 'tryit' ? { width: 400, height: 440 } : { width: 240, height: 240 };
const bus = new EventEmitter();
let host = null;
let rec = null;
let quitting = false;

function quit(code = 0, reason = 'unknown') {
  if (quitting) return;
  quitting = true;
  log({ event: 'quit', code, reason });
  if (rec) { try { rec.stop(); } catch (e) { log({ event: 'stop-error', error: String(e) }); } }
  let stopInfo = { ok: true, released: false };
  try { if (host) stopInfo = { ok: true, ...host.stop() }; } catch (e) {
    stopInfo = { ok: false, error: String(e) };
    log({ event: 'stop-error', error: String(e) });
  }
  if (RUN) {
    log({ event: 'stop', ...stopInfo });
    try {
      const r = S.analyze(RUN.events);
      log({ event: 'summary', by: 'app', ...S.summaryFields(r) });
    } catch (e) { log({ event: 'summary-error', error: String(e && e.stack || e) }); }
  }
  for (const w of BrowserWindow.getAllWindows()) if (!w.isDestroyed()) w.destroy();
  app.exit(code);
}
process.on('SIGINT', () => quit(0, 'sigint'));
process.on('SIGTERM', () => quit(0, 'sigterm'));
app.on('window-all-closed', () => { if (quitting) app.quit(); /* else: watchdog recreates */ });

// Self-test panels are created NON-focusable: a synthetic click on a focusable
// Chromium window makes Chromium activate it, and for a desktop child that
// activates the desktop - i.e. moves the foreground away from whatever
// Sergei is using (seen in self-test run 1). Try-it panels stay focusable.
const PANEL_FOCUSABLE = MODE !== 'selftest' && !arg('no-focus', false);

function createPanelWindow(bounds) {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      ...bounds,
      show: false,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      thickFrame: false,
      hasShadow: false,
      skipTaskbar: true,
      alwaysOnTop: false,
      focusable: PANEL_FOCUSABLE,
      title: 'Regions spike',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
        spellcheck: false,
      },
    });
    win.once('ready-to-show', () => resolve(win));
    win.webContents.once('did-fail-load', (_e, code, desc) => reject(new Error(`panel load failed ${code} ${desc}`)));
    win.loadFile(path.join(__dirname, 'panel.html'), { query: { view: MODE === 'tryit' ? 'steps' : 'compact' } });
  });
}

function defaultBoundsDip() {
  const wa = screen.getPrimaryDisplay().workArea;
  return {
    x: Math.round(wa.x + wa.width - PANEL.width - 80),
    y: Math.round(wa.y + (wa.height - PANEL.height) / 2),
    width: PANEL.width,
    height: PANEL.height,
  };
}

function toScreenRect(dip) {
  const p = screen.dipToScreenRect(null, dip);
  return { left: p.x, top: p.y, right: p.x + p.width, bottom: p.y + p.height };
}

function statusText(h) {
  if (h.mode === 'attached') return `On the desktop layer (${h.layout}). Watchdog on.`;
  if (h.mode === 'fallback') return 'Fallback: normal window (desktop layer not available).';
  return 'Waiting for the desktop…';
}

function wireIpc() {
  ipcMain.on('spike:close', () => quit(0, 'x'));
  ipcMain.on('spike:clicked', (_e, p) => {
    const c = { clicks: Number(p && p.clicks) || 0, x: Number(p && p.x) || 0, y: Number(p && p.y) || 0 };
    log({ event: 'panel-click', ...c });
    bus.emit('clicked', c);
  });
  ipcMain.on('spike:input-focus', () => { log({ event: 'panel-input-focus', focused: true }); bus.emit('input-focus', {}); });
  // Counts only: the page sends {kind} per pointer-down / key-down, never a key or text.
  ipcMain.on('spike:input', (_e, p) => { if (rec) rec.onInput(p); });
  ipcMain.on('spike:beat', (_e, p) => { if (rec) rec.onBeat(p); });
  ipcMain.on('spike:layout', (_e, p) => bus.emit('layout', p));
  // Keyboard focus for a desktop child: Windows activates the desktop on a
  // real click but does not give our child HWND keyboard focus. Give it
  // focus ourselves - but only when the desktop already is the foreground
  // window (i.e. the user just clicked us), so this can never steal focus.
  ipcMain.on('spike:pointerdown', () => {
    if (!host || host.mode !== 'attached' || !host.hwnd) return;
    const fg = d.W.GetForegroundWindow();
    const root = d.W.GetAncestor(host.hwnd, d.C.GA_ROOT);
    if (fg === root) {
      d.W.SetFocus(host.hwnd);
      log({ event: 'focus-hook', set: true, focus: d.hex(d.W.GetFocus()) });
    } else {
      log({ event: 'focus-hook', set: false, reason: 'desktop is not the foreground window' });
    }
  });
}

function makeHost(bounds, extra = {}) {
  const h = new RegionHost({
    createWindow: () => createPanelWindow(bounds),
    screenRect: toScreenRect(bounds),
    killSwitch: !!arg('no-desktop-layer', false),
    log,
    ...extra,
  });
  h.on('mode', () => {
    if (h.win && !h.win.isDestroyed()) h.win.webContents.send('spike:status', statusText(h));
    bus.emit('mode', h.mode);
  });
  h.on('window', (w) => {
    w.webContents.on('did-finish-load', () => w.webContents.send('spike:status', statusText(h)));
  });
  return h;
}

// ---------------------------------------------------------------- fake desktop
// A hidden window in a separate process that the self-test parents the panel
// to first, then kills - a stand-in for Explorer dying, without touching Explorer.
function runFakeDesktop() {
  const win = new BrowserWindow({
    show: false, width: 640, height: 480, frame: false, skipTaskbar: true, focusable: false,
    resizable: false, hasShadow: false, backgroundColor: '#ff00ff',
    webPreferences: { sandbox: true, contextIsolation: true },
  });
  win.loadURL('data:text/html,<body style="margin:0;background:%23ff00ff"></body>');
  const hwnd = d.hwndOf(win);
  // The self-test panel asks us (via a command file) to show as a magenta
  // container for the look proxy, then to hide again.
  const cmdFile = arg('cmd', null);
  let lastCmd = '';
  if (cmdFile) setInterval(() => {
    let raw = '';
    try { raw = fs.readFileSync(cmdFile, 'utf8'); } catch { return; }
    if (!raw || raw === lastCmd) return;
    lastCmd = raw;
    let cmd = null;
    try { cmd = JSON.parse(raw); } catch { return; }
    if (cmd.show) {
      win.setBounds(screen.screenToDipRect(null, cmd.show));
      win.showInactive();
      log({ event: 'fake-desktop-shown', box: cmd.show });
    } else if (cmd.hide) {
      win.hide();
      log({ event: 'fake-desktop-hidden' });
    }
  }, 100);
  win.webContents.once('did-finish-load', () => setTimeout(() => {
    const pids = app.getAppMetrics().map((m) => m.pid);
    fs.writeFileSync(arg('hwnd-out'), JSON.stringify({ hwnd, pid: process.pid, pids }));
    log({ event: 'fake-desktop-ready', hwnd: d.hex(hwnd), pids });
  }, 800));
  setTimeout(() => quit(0, 'lifetime'), Number(arg('lifetime-ms', 60000)));
}

// ------------------------------------------------------------------- self-test
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function waitFor(pred, timeoutMs, stepMs = 50) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      let v = false;
      try { v = pred(); } catch { v = false; }
      if (v || Date.now() - t0 > timeoutMs) { clearInterval(iv); resolve(!!v); }
    }, stepMs);
  });
}
function waitEvent(name, timeoutMs) {
  return new Promise((resolve) => {
    const to = setTimeout(() => { bus.off(name, on); resolve(null); }, timeoutMs);
    function on(p) { clearTimeout(to); bus.off(name, on); resolve(p || {}); }
    bus.on(name, on);
  });
}

function fgInfo() {
  const fg = d.W.GetForegroundWindow();
  const { pid } = d.threadAndPid(fg);
  const roots = d.desktopRoots();
  return { hwnd: d.hex(fg), cls: d.className(fg), ours: pid === process.pid, desktop: roots.has(fg) || roots.has(rootOf(fg)) };
}

function rootOf(h) { return d.W.GetAncestor(h, d.C.GA_ROOT); }
function isOurs(h) { return h && d.threadAndPid(h).pid === process.pid; }
function chainHas(h, target) {
  for (let x = h, n = 0; x && n < 64; x = d.W.GetAncestor(x, d.C.GA_PARENT), n++) if (x === target) return true;
  return false;
}

// Find a spot where nothing but the desktop is showing, so the pixel check
// never reads anyone else's windows.
function findFreeSpot() {
  const disp = screen.getPrimaryDisplay();
  const wa = disp.workArea;
  const roots = d.desktopRoots();
  const fx = [0.85, 0.65, 0.45, 0.25, 0.06];
  const fy = [0.5, 0.2, 0.8];
  for (const y0 of fy) for (const x0 of fx) {
    const dip = {
      x: Math.round(wa.x + x0 * (wa.width - PANEL.width)),
      y: Math.round(wa.y + y0 * (wa.height - PANEL.height)),
      width: PANEL.width, height: PANEL.height,
    };
    const p = screen.dipToScreenRect(null, dip);
    let free = true;
    for (let i = 0; i <= 8 && free; i++) for (let j = 0; j <= 8 && free; j++) {
      const hit = d.W.WindowFromPoint({ x: Math.round(p.x + (p.width - 1) * i / 8), y: Math.round(p.y + (p.height - 1) * j / 8) });
      if (!roots.has(rootOf(hit))) free = false;
    }
    if (free) return { dip, phys: p, free: true };
  }
  const dip = defaultBoundsDip();
  return { dip, phys: screen.dipToScreenRect(null, dip), free: false };
}

// Is the rect still showing only desktop (or our own) windows?
function rectOnlyDesktopOrOurs(p) {
  const roots = d.desktopRoots();
  for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
    const hit = d.W.WindowFromPoint({ x: Math.round(p.x + (p.width - 1) * i / 8), y: Math.round(p.y + (p.height - 1) * j / 8) });
    if (!roots.has(rootOf(hit)) && !isOurs(hit)) return false;
  }
  return true;
}

function savePng(cap, file) {
  const bits = Buffer.from(cap.bits);
  for (let i = 3; i < bits.length; i += 4) bits[i] = 255;
  fs.writeFileSync(file, nativeImage.createFromBitmap(bits, { width: cap.w, height: cap.h }).toPNG());
}
const near = (a, b, tol) => Math.abs(a.r - b.r) <= tol && Math.abs(a.g - b.g) <= tol && Math.abs(a.b - b.b) <= tol;
const rgb = (p) => `rgb(${p.r},${p.g},${p.b})`;
const PANEL_RGB = { r: 30, g: 34, b: 48 };
const TEST_RGB = { r: 0, g: 160, b: 255 };

async function runSelftest() {
  const outDir = arg('out');
  fs.mkdirSync(outDir, { recursive: true });
  const R = { checks: {}, notes: [] };
  const check = (name, pass, detail) => { R.checks[name] = { pass: !!pass, ...detail }; log({ event: 'check', name, pass: !!pass, ...detail }); };
  const fgLog = [];
  const fgCheck = (step) => { const f = fgInfo(); fgLog.push({ step, ...f }); return f; };
  const safety = setTimeout(() => { log({ event: 'selftest-timeout' }); quit(3, 'selftest-timeout'); }, 150000);

  R.env = {
    electron: process.versions.electron, chrome: process.versions.chrome, osRelease: os.release(),
    display: (() => { const x = screen.getPrimaryDisplay(); return { bounds: x.bounds, workArea: x.workArea, scaleFactor: x.scaleFactor }; })(),
    displays: screen.getAllDisplays().length,
  };
  const tree0 = d.readDesktopTree();
  R.tree = d.describeTree(tree0);
  R.pick = (({ ok, layout, reason }) => ({ ok, layout, reason }))(d.findHost());
  fgCheck('start');

  const spot = findFreeSpot();
  R.spot = { dip: spot.dip, phys: spot.phys, free: spot.free };
  const P = spot.phys;
  const before = spot.free ? d.captureRect(P.x, P.y, P.width, P.height) : null;
  if (before) savePng(before, path.join(outDir, 'pixels-1-before.png'));

  const fake = arg('fake-parent', null);
  host = makeHost(spot.dip, { pollMs: 500, fallbackAfterMs: 3000, forceHost: fake ? Number(fake) : 0 });
  const tStart = Date.now();
  await host.start();

  // ---- Phase A: cross-process parent dies (stand-in for an Explorer restart)
  if (fake) {
    const okFake = await waitFor(() => host.mode === 'attached' && host.layout === 'forced-test-parent', 8000);
    check('A0 attached to the fake desktop (other process)', okFake, { host: d.hex(host.host) });

    // Look proxy: the real desktop spot is covered by Sergei's windows, so the
    // rounded/transparent look is measured with the panel as a child of OUR
    // other-process window (magenta), briefly shown on top without activation.
    // Same code path as the desktop (WS_CHILD, cross-process parent).
    const fakeHwnd = Number(fake);
    const cmdFile = arg('fake-cmd', null);
    const M = 24;
    const box = { x: P.x - M, y: P.y - M, width: P.width + 2 * M, height: P.height + 2 * M };
    if (cmdFile) fs.writeFileSync(cmdFile, JSON.stringify({ show: box, n: 1 }));
    await waitFor(() => { const r = d.windowRect(fakeHwnd); return d.W.IsWindowVisible(fakeHwnd) && r && r.left === box.x && r.top === box.y; }, 3000);
    const rcc = { left: P.x, top: P.y, right: P.x + P.width, bottom: P.y + P.height };
    const pts = Buffer.alloc(8); pts.writeInt32LE(rcc.left, 0); pts.writeInt32LE(rcc.top, 4);
    d.W.MapWindowPoints(0, fakeHwnd, pts, 1);
    d.W.SetWindowPos(host.hwnd, 0, pts.readInt32LE(0), pts.readInt32LE(4), 0, 0, d.C.SWP_NOSIZE | d.C.SWP_NOZORDER | d.C.SWP_NOACTIVATE);
    // wait until the container has actually painted (positive control)
    await waitFor(() => near(d.pixel(d.captureRect(box.x + 4, box.y + 4, 1, 1), 0, 0), { r: 255, g: 0, b: 255 }, 12), 3000, 100);
    await sleep(300);
    const onlyOursBox = (() => {
      for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
        const hit = d.W.WindowFromPoint({ x: Math.round(box.x + (box.width - 1) * i / 8), y: Math.round(box.y + (box.height - 1) * j / 8) });
        if (rootOf(hit) !== fakeHwnd) return false;
      }
      return true;
    })();
    if (onlyOursBox) {
      const cap = d.captureRect(box.x, box.y, box.width, box.height);
      savePng(cap, path.join(outDir, 'look-proxy-panel-in-magenta-container.png'));
      const MAG = { r: 255, g: 0, b: 255 };
      const margin = d.pixel(cap, 4, 4);
      const body = d.pixel(cap, M + Math.round(7 * R.env.display.scaleFactor), M + Math.round(P.height / 2));
      const cs = [[M + 2, M + 2], [M + P.width - 3, M + 2], [M + 2, M + P.height - 3], [M + P.width - 3, M + P.height - 3]]
        .map(([x, y]) => ({ x, y, px: rgb(d.pixel(cap, x, y)), magenta: near(d.pixel(cap, x, y), MAG, 12) }));
      check('A-look1 controls: container paints magenta, panel body paints panel colour', near(margin, MAG, 12) && near(body, PANEL_RGB, 6), { margin: rgb(margin), body: rgb(body) });
      check('A-look2 rounded corners are see-through when parented (corner pixels show the parent)', cs.every((c) => c.magenta), { corners: cs });
    } else {
      R.notes.push('look proxy skipped: something covers our container (a topmost window?)');
    }
    fgCheck('after-look-proxy');
    if (cmdFile) fs.writeFileSync(cmdFile, JSON.stringify({ hide: true, n: 2 }));
    await waitFor(() => !d.W.IsWindowVisible(fakeHwnd), 3000);

    const hwndBefore = host.hwnd;
    const tReady = Date.now();
    log({ event: 'ready-for-parent-kill', hwnd: d.hex(hwndBefore) });
    const back = await waitFor(() => host.mode === 'attached' && host.layout !== 'forced-test-parent', 25000);
    check('A1 watchdog re-attached to the real desktop after the parent process was killed', back, {
      msFromReadyToReattach: Date.now() - tReady,
      windowRecreated: host.stats.recreated > 0,
      sameHwnd: host.hwnd === hwndBefore,
      losses: host.stats.losses, layout: host.layout,
    });
  } else {
    const ok = await waitFor(() => host.mode === 'attached', 8000);
    check('A1 attached to the real desktop at start', ok, { ms: Date.now() - tStart, layout: host.layout });
  }
  if (host.mode !== 'attached') {
    R.notes.push('never attached to the real desktop; later checks skipped');
    return finish(R, fgLog, outDir, safety);
  }

  // ---- Phase B: structure, z-order, pixels, clicks, keys
  const hwnd = host.hwnd;
  const style = d.W.GetWindowLongW(hwnd, d.C.GWL_STYLE);
  const exStyle = d.W.GetWindowLongW(hwnd, d.C.GWL_EXSTYLE);
  check('B1 parent is the icon-view host', d.W.GetAncestor(hwnd, d.C.GA_PARENT) === host.host, {
    parentClass: d.className(host.host), rootClass: d.className(rootOf(hwnd)), layout: host.layout,
    wsChild: !!(style & d.C.WS_CHILD), layered: !!(exStyle & d.C.WS_EX_LAYERED),
    noRedirBitmap: !!(exStyle & d.C.WS_EX_NOREDIRECTIONBITMAP),
    dpiPanel: d.W.GetDpiForWindow(hwnd), dpiHost: d.W.GetDpiForWindow(host.host),
  });
  const z = d.isAboveDefView(hwnd, host.host);
  check('B2 in front of the desktop icons (above SHELLDLL_DefView among siblings)', z.above, { panelIndex: z.me, defViewIndex: z.defView });
  const rect = d.windowRect(hwnd);
  check('B3 on screen where we put it', rect && Math.abs(rect.left - P.x) <= 1 && Math.abs(rect.top - P.y) <= 1 && Math.abs(rect.width - P.width) <= 1, { rect, wanted: P });
  fgCheck('after-attach');

  // Pixels with the panel alone (transparency + rounded corners)
  await sleep(700);
  let freeNow = spot.free && rectOnlyDesktopOrOurs(P);
  if (freeNow) {
    const after = d.captureRect(P.x, P.y, P.width, P.height);
    savePng(after, path.join(outDir, 'pixels-2-panel.png'));
    const bg = { x: Math.round(7 * R.env.display.scaleFactor), y: Math.round(P.height / 2) };
    const pb = d.pixel(before, bg.x, bg.y); const pa = d.pixel(after, bg.x, bg.y);
    check('B4 panel paints (positive control: body pixel is the panel colour)', near(pa, PANEL_RGB, 6), { before: rgb(pb), after: rgb(pa) });
    const corners = [[2, 2], [P.width - 3, 2], [2, P.height - 3], [P.width - 3, P.height - 3]];
    const cornerRes = corners.map(([x, y]) => ({ x, y, before: rgb(d.pixel(before, x, y)), after: rgb(d.pixel(after, x, y)), same: near(d.pixel(before, x, y), d.pixel(after, x, y), 8) }));
    check('B5 rounded corners are transparent (corner pixels unchanged from the bare desktop)', cornerRes.every((c) => c.same), { corners: cornerRes });
  } else {
    R.notes.push('pixel checks skipped: no uncovered desktop spot (another window covers it)');
  }

  // A test window of our own, overlapping the panel: it must cover the panel.
  const tw = { x: Math.round(spot.dip.x + PANEL.width * 0.55), y: Math.round(spot.dip.y + PANEL.height * 0.6), width: 160, height: 140 };
  const testWin = new BrowserWindow({
    ...tw, show: false, frame: false, focusable: false, skipTaskbar: true, resizable: false, hasShadow: false,
    backgroundColor: '#00a0ff', webPreferences: { sandbox: true, contextIsolation: true },
  });
  await testWin.loadURL('data:text/html,<body style="margin:0;background:%2300a0ff"></body>');
  testWin.showInactive();
  await sleep(700);
  const testHwnd = d.hwndOf(testWin);
  const tl = d.topLevelWindows();
  const idxTest = tl.indexOf(testHwnd);
  const idxRoot = tl.indexOf(rootOf(hwnd));
  check('B6 panel is under a normal window (test window above the panel\'s desktop root in z-order)', idxTest >= 0 && idxRoot > idxTest, { idxTest, idxRoot, rootClass: d.className(rootOf(hwnd)), topLevelCount: tl.length });
  const tp = screen.dipToScreenRect(null, tw);
  const ov = { x: Math.round((tp.x + P.x + P.width) / 2), y: Math.round((tp.y + P.y + P.height) / 2) };
  const hitOv = d.W.WindowFromPoint(ov);
  check('B7 overlap point hits the test window, not the panel', rootOf(hitOv) === testHwnd, { hitClass: d.className(hitOv), hitIsTestWindow: rootOf(hitOv) === testHwnd, hitIsPanel: chainHas(hitOv, hwnd) });
  if (freeNow && rectOnlyDesktopOrOurs(P)) {
    const cap = d.captureRect(P.x, P.y, P.width, P.height);
    savePng(cap, path.join(outDir, 'pixels-3-under-test-window.png'));
    const po = d.pixel(cap, ov.x - P.x, ov.y - P.y);
    const pp = d.pixel(cap, Math.round(7 * R.env.display.scaleFactor), Math.round(P.height / 2));
    check('B8 pixels: test window drawn over the panel, panel still drawn beside it', near(po, TEST_RGB, 10) && near(pp, PANEL_RGB, 6), { overlap: rgb(po), panelOnly: rgb(pp) });
  }
  fgCheck('after-test-window');
  testWin.destroy();

  // Clicks: the OS hit-test must land on the panel, and Chromium must turn
  // mouse messages into a DOM click. (Posted to our own HWND: the real
  // cursor is never moved.)
  let layout = await waitEvent('layout', 300);
  if (!layout) {
    host.win.webContents.executeJavaScript('reportLayout()').catch(() => {});
    layout = await waitEvent('layout', 2000);
  }
  if (PANEL_FOCUSABLE) {
    R.notes.push('click test skipped: panel is focusable, a synthetic click would activate the desktop');
  } else if (layout && layout.btn) {
    const sf = R.env.display.scaleFactor;
    const cx = Math.round((layout.btn.x + layout.btn.w / 2) * sf);
    const cy = Math.round((layout.btn.y + layout.btn.h / 2) * sf);
    const sx = rect.left + cx; const sy = rect.top + cy;
    const hit = d.W.WindowFromPoint({ x: sx, y: sy });
    const coveredByOthers = !chainHas(hit, hwnd) && !d.desktopRoots().has(rootOf(hit));
    if (coveredByOthers) {
      R.notes.push('B9 skipped: another window covers the panel button');
    } else {
      check('B9 OS hit-test at the button lands on the panel (not the icon view)', chainHas(hit, hwnd), { hitClass: d.className(hit) });
    }
    const res = Buffer.alloc(8);
    d.W.SendMessageTimeoutW(hwnd, d.C.WM_NCHITTEST, 0, ((sy & 0xffff) << 16) | (sx & 0xffff), d.C.SMTO_ABORTIFHUNG, 1000, res);
    const ht = Number(res.readBigInt64LE(0));
    check('B10 WM_NCHITTEST says client area', ht === d.C.HTCLIENT, { hitTest: ht });
    const lp = ((cy & 0xffff) << 16) | (cx & 0xffff);
    const clicked = waitEvent('clicked', 3000);
    d.W.PostMessageW(hwnd, d.C.WM_MOUSEMOVE, 0, lp);
    d.W.PostMessageW(hwnd, d.C.WM_LBUTTONDOWN, d.C.MK_LBUTTON, lp);
    d.W.PostMessageW(hwnd, d.C.WM_LBUTTONUP, 0, lp);
    const c = await clicked;
    check('B11 click on the button reaches the page (DOM click event)', !!c, c || {});
  } else {
    R.notes.push('click test skipped: renderer did not report the button layout');
  }
  fgCheck('after-click');

  // Keys are NOT tested here: keyboard focus only exists after a real click
  // activates the desktop, and a self-test must never activate anything.
  // Run 1 (focusable panel) showed the path works once the desktop is
  // active: the focus hook put OS focus on the panel and key messages typed
  // into the input. Real keyboard input is Sergei's try-it step.

  // ---- Phase C: watchdog against simulated losses (our own windows only)
  const decoy = new BrowserWindow({ show: false, width: 300, height: 300, frame: false, skipTaskbar: true, focusable: false, webPreferences: { sandbox: true } });
  await decoy.loadURL('about:blank');
  const decoyHwnd = d.hwndOf(decoy);

  // C1: someone re-parents us
  const lossesBefore = host.stats.losses;
  host.pause();
  d.W.SetParent(host.hwnd, decoyHwnd);
  let t0 = Date.now();
  host.resume();
  let ok = await waitFor(() => host.stats.losses > lossesBefore && host.mode === 'attached'
    && d.W.GetAncestor(host.hwnd, d.C.GA_PARENT) === host.host && host.host !== decoyHwnd, 5000);
  check('C1 parent changed under us -> watchdog re-attaches', ok, { ms: Date.now() - t0, losses: host.stats.losses - lossesBefore, hostClass: d.className(host.host) });

  // C2: our parent is destroyed with us inside (window dies with it)
  const recreatedBefore = host.stats.recreated;
  const hwndC2 = host.hwnd;
  host.pause();
  d.W.SetParent(host.hwnd, decoyHwnd);
  decoy.destroy();
  t0 = Date.now();
  host.resume();
  ok = await waitFor(() => host.mode === 'attached' && host.hwnd && host.hwnd !== hwndC2, 10000);
  check('C2 parent destroyed with the panel inside -> window rebuilt and re-attached', ok && host.stats.recreated > recreatedBefore, {
    ms: Date.now() - t0, oldHwndStillWindow: !!d.W.IsWindow(hwndC2), recreated: host.stats.recreated - recreatedBefore,
  });

  // C3: the desktop layout is not one we know -> clean fallback, then recovery
  const decoy2 = new BrowserWindow({ show: false, width: 300, height: 300, frame: false, skipTaskbar: true, focusable: false, webPreferences: { sandbox: true } });
  await decoy2.loadURL('about:blank');
  host.pause();
  host.simulateUnknown = true;
  d.W.SetParent(host.hwnd, d.hwndOf(decoy2));
  t0 = Date.now();
  host.resume();
  ok = await waitFor(() => host.mode === 'fallback', 8000);
  const fh = host.hwnd;
  const topLevel = d.W.GetAncestor(fh, d.C.GA_PARENT) === d.W.GetDesktopWindow();
  const fex = d.W.GetWindowLongW(fh, d.C.GWL_EXSTYLE);
  const tl2 = d.topLevelWindows();
  const roots = d.desktopRoots();
  const iMe = tl2.indexOf(fh);
  const iRoot = tl2.findIndex((h) => roots.has(h) && d.W.IsWindowVisible(h));
  const visibleBetween = tl2.slice(iMe + 1, iRoot).filter((h) => d.W.IsWindowVisible(h) && !isOurs(h)).length;
  check('C3a unknown layout -> clean fallback to a top-level tool window just above the desktop', ok && topLevel && !!(fex & d.C.WS_EX_TOOLWINDOW) && d.W.IsWindowVisible(fh) && iMe >= 0 && iMe < iRoot && visibleBetween === 0, {
    ms: Date.now() - t0, topLevel, toolWindow: !!(fex & d.C.WS_EX_TOOLWINDOW), visible: !!d.W.IsWindowVisible(fh),
    zIndex: iMe, desktopRootIndex: iRoot, visibleWindowsBetweenPanelAndDesktop: visibleBetween,
  });
  fgCheck('in-fallback');
  host.simulateUnknown = false;
  t0 = Date.now();
  ok = await waitFor(() => host.mode === 'attached', 5000);
  check('C3b layout known again -> back on the desktop layer', ok, { ms: Date.now() - t0, layout: host.layout, above: d.isAboveDefView(host.hwnd, host.host).above });
  decoy2.destroy();
  fgCheck('end');

  return finish(R, fgLog, outDir, safety);
}

function finish(R, fgLog, outDir, safety) {
  R.foreground = fgLog;
  // A steal = foreground became one of our windows, or became the desktop
  // when it was not the desktop at start (run 1 failed exactly this way).
  const startDesktop = fgLog.length && fgLog[0].desktop;
  const stolen = fgLog.filter((f) => f.ours || (f.desktop && !startDesktop));
  R.checks['Z never moved the foreground to us or to the desktop'] = { pass: stolen.length === 0, samples: fgLog.length, steps: stolen.map((f) => f.step) };
  R.stats = host ? host.stats : null;
  R.pids = app.getAppMetrics().map((m) => ({ pid: m.pid, type: m.type }));
  const failed = Object.entries(R.checks).filter(([, v]) => !v.pass).map(([k]) => k);
  R.summary = { total: Object.keys(R.checks).length, failed };
  fs.writeFileSync(path.join(outDir, 'selftest-results.json'), JSON.stringify(R, null, 2));
  log({ event: 'selftest-done', failed });
  clearTimeout(safety);
  setTimeout(() => quit(failed.length ? 1 : 0, 'selftest-done'), 100);
}

// ------------------------------------------------------------------- try-it
function parseSim() {
  const sim = {};
  const sd = arg('sim-sd', null);
  if (typeof sd === 'string') {
    const v = sd.split(',').map(Number).filter((x) => Number.isFinite(x));
    sim.sd = [];
    for (let i = 0; i + 1 < v.length; i += 2) sim.sd.push([v[i], v[i + 1]]);
  }
  const parent = arg('sim-parent', null);
  if (typeof parent === 'string') sim.parent = Number(parent);
  return Object.keys(sim).length ? sim : null;
}

function displayInfo(x, primaryId) {
  return { id: x.id, primary: x.id === primaryId, bounds: x.bounds, workArea: x.workArea, scaleFactor: x.scaleFactor };
}

async function runTryit() {
  const bounds = defaultBoundsDip();
  const sim = parseSim();
  const prim = screen.getPrimaryDisplay();
  log({
    event: 'launch', pid: process.pid, electron: process.versions.electron, chrome: process.versions.chrome, os: os.release(),
    displays: screen.getAllDisplays().map((x) => displayInfo(x, prim.id)),
    panelDip: bounds, panelPx: toScreenRect(bounds), focusable: PANEL_FOCUSABLE,
    logFile: RUN.logFile, runDir: RUN.runDir, sim,
  });
  const primId = () => screen.getPrimaryDisplay().id;
  screen.on('display-metrics-changed', (_e, x, what) => log({ event: 'display', what, ...displayInfo(x, primId()) }));
  screen.on('display-added', (_e, x) => log({ event: 'display', what: ['added'], ...displayInfo(x, primId()) }));
  screen.on('display-removed', (_e, x) => log({ event: 'display', what: ['removed'], ...displayInfo(x, primId()) }));
  for (const what of ['suspend', 'resume', 'lock-screen', 'unlock-screen']) powerMonitor.on(what, () => log({ event: 'power', what }));

  host = makeHost(bounds, sim && sim.parent ? { forceHost: sim.parent } : {});
  rec = createRecorder({
    log, host, app, panelDip: bounds, runDir: RUN.runDir, controlFile: RUN.controlFile, sim,
    onQuitRequest: (reason) => quit(0, reason),
  });
  await host.start();
  rec.start();
  log({ event: 'tryit-ready', tip: 'Follow the steps on the panel. Close with its x, or Ctrl+C here.' });
  // Never outlive the task: a forgotten run closes itself.
  const maxMin = Number(arg('max-minutes', 30)) || 30;
  setTimeout(() => quit(0, 'time-limit'), maxMin * 60000);
  // Smoke-test hook: leave through the same quit() the x button uses.
  const exitAfter = Number(arg('exit-after-ms', 0));
  if (exitAfter > 0) setTimeout(() => quit(0, 'exit-after'), exitAfter);
}

app.whenReady().then(async () => {
  wireIpc();
  try {
    if (MODE === 'fake-desktop') return runFakeDesktop();
    if (MODE === 'selftest') return await runSelftest();
    return await runTryit();
  } catch (e) {
    log({ event: 'fatal', error: String(e && e.stack || e) });
    quit(2, 'fatal');
  }
});
