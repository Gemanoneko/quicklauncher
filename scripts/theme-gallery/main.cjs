'use strict';
// Electron main for the QuickLaunch theme gallery. Start it through run.mjs, never directly.
//
// Renders the REAL renderer (src/renderer/index.html + app.js + base.css + each theme CSS)
// in OFFSCREEN windows with a stub preload (preload.cjs) and mock data (mock-data.cjs).
// QuickLaunch's own main process (src/main/*) is never loaded: there is no tray, no global
// hotkey, no updater, no store and no login-item code in this process. src/main/preload.js
// is only READ as text, to copy its channel allowlists.
// With cfg.hover (run.mjs --hover-check) it runs the hover legibility gate (hover.cjs) instead of
// screenshots, under the same guards.
//
// Guards (all counted; the run fails if any count is non-zero):
//   - app.setLoginItemSettings / getLoginItemSettings, globalShortcut.*, BrowserWindow
//     show/focus/..., app.focus and every dialog are replaced by counting no-ops;
//   - the renderer's login-item route (IPC 'set-auto-launch') is a counting no-op too;
//   - windows are offscreen, show:false, focusable:false, never shown;
//   - every request except file: inside the rendered source tree and data: is cancelled,
//     and every host name resolves to NOTFOUND (host-resolver-rules);
//   - audio is muted at switch level and per page; media-started-playing is counted;
//   - userData / sessionData / crash dumps / logs go to the run's work folder.
//
// Determinism (two full runs gave 303/303 pixel-identical captures): software raster, sRGB,
// no partial raster, device emulation for viewport + DPR, every animation born paused and set
// to one currentTime, and a capture is accepted only when two consecutive grabs match.
const electron = require('electron');
const { app, BrowserWindow, session, ipcMain, globalShortcut, dialog } = electron;
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { fileURLToPath } = require('url');
const mock = require('./mock-data.cjs');

// ── config ───────────────────────────────────────────────────────────────────
const cfgArg = process.argv.find((a) => a.startsWith('--qlg-config='));
if (!cfgArg) { console.error('main.cjs: start the gallery through scripts/theme-gallery/run.mjs'); process.exit(2); }
const cfg = JSON.parse(fs.readFileSync(cfgArg.slice('--qlg-config='.length), 'utf8'));
const ROOT = path.resolve(cfg.root);
const RENDERER = path.join(ROOT, 'src', 'renderer');
const OUT = path.resolve(cfg.out);
const PROFILE = path.join(path.resolve(cfg.work), 'electron-profile');
const STATES = ['grid', 'settings', 'hover'];

const logLines = [];
function log(...a) { const s = a.join(' '); logLines.push(s); console.log('[gallery] ' + s); }

// Refuse anything that could touch the real app's profile.
const lc = (p) => path.resolve(p).toLowerCase();
const forbidden = [path.join(app.getPath('appData'), 'QuickLauncher'), path.join(app.getPath('appData'), 'quicklauncher')].map(lc);
for (const p of [PROFILE, OUT]) {
  if (forbidden.some((f) => lc(p) === f || lc(p).startsWith(f + path.sep))) { console.error('refusing: path inside the real QuickLauncher profile: ' + p); process.exit(2); }
}

// ── guards: counting no-ops ──────────────────────────────────────────────────
const counters = {
  loginItem: 0, globalShortcut: 0, windowShow: 0, windowFocus: 0, appFocus: 0, dialogs: 0,
  focusEvents: 0, blockedRequests: 0, permissionRequests: 0, mediaStarted: 0, windowOpens: 0, navigationsBlocked: 0,
};
const guardHits = [];
function hit(key, detail) {
  counters[key]++;
  guardHits.push({ key, detail: String(detail).slice(0, 200) });
  log(`GUARD ${key}: ${String(detail).slice(0, 200)}`);
}
const STUB = Symbol('qlg-stub');
function stub(key, name, ret) {
  const f = function () { hit(key, name); return typeof ret === 'function' ? ret() : ret; };
  f[STUB] = key;
  return f;
}
const stubbed = [];
function install(obj, objName, method, key, ret) {
  obj[method] = stub(key, `${objName}.${method}`, ret);
  stubbed.push({ obj, name: `${objName}.${method}`, method, key });
}
install(app, 'app', 'setLoginItemSettings', 'loginItem');
install(app, 'app', 'getLoginItemSettings', 'loginItem', () => ({ openAtLogin: false, executableWillLaunchAtLogin: false, launchItems: [] }));
install(app, 'app', 'focus', 'appFocus');
for (const m of ['register', 'registerAll', 'unregister', 'unregisterAll']) install(globalShortcut, 'globalShortcut', m, 'globalShortcut', false);
for (const m of ['show', 'showInactive', 'maximize', 'setFullScreen', 'flashFrame', 'setAlwaysOnTop']) install(BrowserWindow.prototype, 'BrowserWindow', m, 'windowShow');
for (const m of ['focus', 'moveTop']) install(BrowserWindow.prototype, 'BrowserWindow', m, 'windowFocus');
for (const fn of ['showErrorBox', 'showMessageBox', 'showMessageBoxSync', 'showOpenDialog', 'showOpenDialogSync', 'showSaveDialog', 'showSaveDialogSync', 'showCertificateTrustDialog']) {
  install(dialog, 'dialog', fn, 'dialogs', () => (fn.endsWith('Sync') ? (fn.includes('Message') ? 0 : undefined) : Promise.resolve({ canceled: true, response: 0, filePaths: [] })));
}
/** Every stub is still in place (nothing re-bound a real API behind our back). */
function stubsIntact() {
  const broken = stubbed.filter((s) => !(s.obj[s.method] && s.obj[s.method][STUB] === s.key)).map((s) => s.name);
  return { total: stubbed.length, broken };
}

// ── process-level isolation (must run before 'ready') ────────────────────────
app.setName('QL-Theme-Gallery');
fs.mkdirSync(PROFILE, { recursive: true });
app.setPath('userData', PROFILE);
app.setPath('sessionData', PROFILE);
app.setPath('crashDumps', path.join(PROFILE, 'crashDumps'));
app.setAppLogsPath(path.join(PROFILE, 'logs'));
if (!cfg.gpu) app.disableHardwareAcceleration(); // software raster: identical pixels run to run and machine to machine
app.commandLine.appendSwitch('force-device-scale-factor', String(cfg.scale));
app.commandLine.appendSwitch('force-color-profile', 'srgb');
// Hover repaints only the dirty region while the 0.12 s hover transitions play; with partial
// raster the final frame kept traces of those in-between frames (16/101 hover captures differed
// between two runs). Full re-raster of every changed tile makes the frame depend on state only.
app.commandLine.appendSwitch('disable-partial-raster');
app.commandLine.appendSwitch('mute-audio');
app.commandLine.appendSwitch('host-resolver-rules', 'MAP * ~NOTFOUND');
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('no-pings');
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

let finished = false;
const results = [];
const extra = { selfTest: [], sheets: [], consoleByTheme: {}, displays: null, displayEvents: [] };
function finish(code, why) {
  if (finished) return;
  finished = true;
  try {
    const intact = stubsIntact();
    fs.writeFileSync(cfg.resultFile, JSON.stringify({ code, why, counters, guardHits, stubs: intact, ipc: { calls: ipcCalls, unexpected: unexpectedIpc }, results, extra, log: logLines }, null, 1));
  } catch (e) { console.error('could not write result: ' + e.message); }
  for (const w of BrowserWindow.getAllWindows()) { try { w.destroy(); } catch { /* gone */ } }
  app.exit(code);
}
process.on('uncaughtException', (e) => { log('FATAL ' + (e && e.stack)); finish(2, 'uncaughtException: ' + (e && e.message)); });
process.on('unhandledRejection', (e) => { log('FATAL(rejection) ' + (e && e.stack)); finish(2, 'unhandledRejection: ' + (e && e.message)); });
setTimeout(() => finish(4, `WATCHDOG after ${cfg.timeoutSec}s`), cfg.timeoutSec * 1000).unref();

// ── the renderer contract, read from the real preload ────────────────────────
function parseContract() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'main', 'preload.js'), 'utf8');
  const grab = (name) => {
    const m = new RegExp(`const ${name} = new Set\\(\\[([\\s\\S]*?)\\]\\)`).exec(src);
    if (!m) throw new Error(`preload contract changed: ${name} not found in src/main/preload.js`);
    return [...m[1].replace(/\/\/.*$/gm, '').matchAll(/'([^']+)'/g)].map((x) => x[1]);
  };
  const c = { invoke: grab('INVOKE_CHANNELS'), on: grab('ON_CHANNELS') };
  for (const need of ['get-apps', 'get-settings', 'get-valid-themes', 'renderer-ready', 'set-auto-launch']) {
    if (!c.invoke.includes(need)) throw new Error(`preload contract changed: '${need}' missing from INVOKE_CHANNELS`);
  }
  return c;
}
const contract = parseContract();
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
const THEMES_ALL = fs.readdirSync(path.join(RENDERER, 'styles', 'themes')).filter((f) => f.endsWith('.css')).map((f) => f.slice(0, -4)).sort();
for (const t of THEMES_ALL) if (!/^[a-z0-9-]+$/.test(t)) { console.error('unexpected theme file name: ' + t); process.exit(2); }
// Compare mode takes its theme list from the two gallery folders (run.mjs checked them).
const THEMES = cfg.compare ? cfg.compare.themes.map((t) => t.theme) : cfg.only && cfg.only.length ? cfg.only : THEMES_ALL;
for (const t of THEMES) {
  if (!/^[a-z0-9-]+$/.test(t)) { console.error('unexpected theme name: ' + t); process.exit(2); }
  if (!cfg.compare && !THEMES_ALL.includes(t)) { console.error('unknown theme: ' + t); process.exit(2); }
}

// ── mock IPC (the only thing the renderer can reach) ─────────────────────────
// The hover gate also opens the installed-apps picker, which asks for the installed list.
const EXPECTED_IPC = new Set(['get-apps', 'get-settings', 'get-valid-themes', 'renderer-ready', ...(cfg.hover ? ['get-installed-apps'] : [])]);
const ipcCalls = {};
const unexpectedIpc = [];
const themeOfWc = new Map();
ipcMain.on('qlg:contract', (e) => { e.returnValue = { invoke: contract.invoke, on: contract.on, version }; });
ipcMain.handle('qlg:invoke', (e, channel, args) => {
  ipcCalls[channel] = (ipcCalls[channel] || 0) + 1;
  const theme = themeOfWc.get(e.sender.id) || '?';
  if (!EXPECTED_IPC.has(channel)) unexpectedIpc.push({ theme, channel });
  switch (channel) {
    case 'get-apps': return mock.apps();
    case 'get-settings': return mock.settings(theme);
    case 'get-valid-themes': return THEMES_ALL;
    case 'renderer-ready': case 'store-reload-ack': return null;
    case 'set-auto-launch': hit('loginItem', `IPC set-auto-launch(${JSON.stringify(args)}) from renderer (${theme})`); return false;
    case 'apply-global-hotkey': hit('globalShortcut', `IPC apply-global-hotkey from renderer (${theme})`); return { ok: false, reason: 'INVALID' };
    case 'get-global-hotkey-status': return { ok: true, accelerator: null };
    case 'get-installed-apps': return cfg.hover ? require('./hover.cjs').INSTALLED_ROWS.map((r) => ({ ...r })) : [];
    case 'toggle-fullscreen': case 'exit-fullscreen': return false;
    default: return null; // save-*, launch-app, add-app-*, window and update channels: counted no-ops
  }
});

// ── helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const isInside = (parent, child) => { const r = path.relative(parent, child); return r === '' || (!r.startsWith('..') && !path.isAbsolute(r)); };
const js = (win, code) => win.webContents.executeJavaScript(code, true);
async function waitFor(win, expr, ms, label) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await js(win, `!!(${expr})`)) return Date.now() - t0;
    await sleep(40);
  }
  throw new Error(`timed out after ${ms} ms waiting for ${label}`);
}
const FRAMES = `new Promise((r) => { let done = false; requestAnimationFrame(() => requestAnimationFrame(() => { done = true; r(true); })); setTimeout(() => { if (!done) r(false); }, 700); })`;

// Deterministic frame: one-shot animations and transitions are finished (their end state,
// e.g. the entrance overlay fully faded), and every looping animation is paused at
// currentTime = cfg.freezeMs, i.e. how the loop looks freezeMs after it started.
const FREEZE = `(() => {
  const o = { loops: 0, oneShots: 0, transitions: 0, errors: 0, loopNames: [] };
  for (const a of document.getAnimations()) {
    try {
      a.pause();
      const t = a.effect ? a.effect.getComputedTiming() : null;
      if (typeof CSSTransition !== 'undefined' && a instanceof CSSTransition) { a.finish(); o.transitions++; }
      else if (t && t.endTime === Infinity) { a.currentTime = ${Number(cfg.freezeMs)}; o.loops++; if (a.animationName) o.loopNames.push(a.animationName); }
      else { a.finish(); o.oneShots++; }
    } catch (e) { o.errors++; }
  }
  o.loopNames = [...new Set(o.loopNames)].sort();
  return o;
})()`;

// A compositor-driven animation (opacity/transform, e.g. dune's steps() hover flicker) can take
// the pause at its own clock before the new currentTime reaches it, leaving the frame a few ms
// off; a second pass after a rendered frame sets it again on the now-paused animation.
async function freeze(win) {
  await js(win, FREEZE);
  await js(win, FRAMES);
  return js(win, FREEZE);
}

const PAGE_STATE = (theme) => `(() => ({
  visibility: document.visibilityState,
  hasFocus: document.hasFocus(),
  qlPaused: document.body.classList.contains('ql-paused'),
  reducedMotion: document.body.classList.contains('reduced-motion'),
  osReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  dpr: devicePixelRatio,
  viewport: [innerWidth, innerHeight],
  hovered: document.querySelectorAll('.app-tile:hover, button:hover, input:hover').length,
  banner: document.getElementById('theme-banner-text').textContent,
  bannerExpected: (typeof THEME_BANNERS !== 'undefined' && THEME_BANNERS['${theme}']) ? THEME_BANNERS['${theme}'][0] : null,
  name: (typeof THEME_NAMES !== 'undefined' && THEME_NAMES['${theme}']) || null,
  bodyFont: getComputedStyle(document.body).fontFamily,
  tiles: document.querySelectorAll('#app-grid .app-tile').length,
  version: document.getElementById('header-version').textContent,
}))()`;

// CSSOM metadata: parsed by Chromium itself, so it counts what the engine keeps.
const CSSOM_META = `(() => {
  const sheet = document.getElementById('theme-stylesheet').sheet;
  const m = { rules: 0, styleRules: 0, beforeRules: 0, afterRules: 0, pseudoRules: 0, keyframes: [], groupRules: 0, fontFamilyDecls: [] };
  const walk = (list) => {
    for (const r of list) {
      m.rules++;
      if (r instanceof CSSStyleRule) {
        m.styleRules++;
        const s = r.selectorText || '';
        const b = /::?before\\b/i.test(s), a = /::?after\\b/i.test(s);
        if (b) m.beforeRules++;
        if (a) m.afterRules++;
        if (a || b) m.pseudoRules++;
        const ff = r.style.getPropertyValue('font-family');
        if (ff) m.fontFamilyDecls.push(s.slice(0, 50) + ' => ' + ff.trim());
        if (r.cssRules && r.cssRules.length) walk(r.cssRules);
      } else if (r instanceof CSSKeyframesRule) {
        m.keyframes.push(r.name);
      } else if (r.cssRules) { m.groupRules++; walk(r.cssRules); }
    }
  };
  walk(sheet.cssRules);
  const full = [...sheet.cssRules].map((r) => r.cssText).join('\\n');
  const urls = [...full.matchAll(/url\\(\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*\\)/g)].map((x) => x[1]);
  m.images = urls.length;
  m.svgImages = urls.filter((u) => /^data:image\\/svg\\+xml/i.test(u)).length;
  m.rasterImages = urls.filter((u) => /^data:image\\//i.test(u) && !/^data:image\\/svg\\+xml/i.test(u)).length;
  m.otherDataUrls = urls.filter((u) => /^data:/i.test(u) && !/^data:image\\//i.test(u)).length;
  m.fileRefs = urls.filter((u) => !/^data:/i.test(u)).length;
  m.uniqueImages = new Set(urls).size;
  m.imageChars = urls.filter((u) => /^data:/i.test(u)).reduce((n, u) => n + u.length, 0);
  m.gradients = (full.match(/(?:repeating-)?(?:linear|radial|conic)-gradient\\(/g) || []).length;
  m.fontStack = getComputedStyle(document.documentElement).getPropertyValue('--font').trim();
  return m;
})()`;

function staticMeta(text) {
  const noComments = text.replace(/\/\*[\s\S]*?\*\//g, '');
  return {
    fileBytes: Buffer.byteLength(text, 'utf8'),
    lines: text.split('\n').length,
    keyframesRaw: (noComments.match(/@(?:-webkit-)?keyframes\s+[\w-]+/g) || []).length,
  };
}

/** Sampled pixel statistics of a BGRA bitmap: is there really a picture here? */
function pixelStats(bmp, w, h) {
  let n = 0, covered = 0, sum = 0, sum2 = 0;
  const colors = new Set();
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = (y * w + x) * 4;
      const b = bmp[i], g = bmp[i + 1], r = bmp[i + 2], a = bmp[i + 3];
      n++;
      if (a > 8) covered++;
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sum += l; sum2 += l * l;
      colors.add(((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3));
    }
  }
  const mean = sum / n;
  const s = { coverage: +(covered / n).toFixed(3), colors: colors.size, lumaStd: +Math.sqrt(Math.max(0, sum2 / n - mean * mean)).toFixed(2) };
  s.blank = s.coverage < 0.5 || s.colors < 24 || s.lumaStd < 3;
  return s;
}

/** Mean per-pixel max-channel difference inside a device-pixel rect of two same-size BGRA bitmaps. */
function rectDiff(a, b, w, rect) {
  let sum = 0, n = 0;
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      const i = (y * w + x) * 4;
      sum += Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]), Math.abs(a[i + 3] - b[i + 3]));
      n++;
    }
  }
  return n ? +(sum / n).toFixed(2) : 0;
}

// Offscreen capture once returned a stale 1x frame (425x300, zoomed into the top-left) when
// the display went to sleep mid-run. Every capture must be exactly width*scale x height*scale;
// a wrong-size frame is discarded and re-captured after a fresh paint.
const EXPECT_W = Math.round(cfg.width * cfg.scale), EXPECT_H = Math.round(cfg.height * cfg.scale);
async function grab(win, attempt) {
  win.webContents.invalidate();
  await js(win, FRAMES);
  await sleep(60 + attempt * 150);
  const img = await win.webContents.capturePage({ x: 0, y: 0, width: cfg.width, height: cfg.height });
  const sf = Math.max(...img.getScaleFactors());
  const size = img.getSize(sf);
  return { img, sf, size, ok: size.width === EXPECT_W && size.height === EXPECT_H };
}
// A frame is accepted once two consecutive grabs are pixel-identical (the raster has settled).
async function capture(win, file) {
  let g, prev = null, stable = false, grabs = 0;
  const wrong = [];
  for (let attempt = 0; attempt < 8 && !stable; attempt++) {
    g = await grab(win, Math.min(attempt, 3));
    grabs++;
    if (!g.ok) { wrong.push(`${g.size.width}x${g.size.height}`); prev = null; continue; }
    const bmp = g.img.toBitmap({ scaleFactor: g.sf });
    if (prev && Buffer.compare(prev, bmp) === 0) stable = true;
    prev = bmp;
  }
  const { img, sf, size } = g;
  if (wrong.length) log(`capture ${file ? path.basename(file) : '(no file)'}: discarded ${wrong.length} wrong-size frame(s) ${wrong.join(', ')}`);
  if (!stable) log(`capture ${file ? path.basename(file) : '(no file)'}: frame never settled in ${grabs} grabs`);
  const png = img.toPNG({ scaleFactor: sf });
  const bmp = img.toBitmap({ scaleFactor: sf });
  if (file) fs.writeFileSync(file, png);
  return { size: [size.width, size.height], sizeOk: size.width === EXPECT_W && size.height === EXPECT_H, discardedFrames: wrong, stable, grabs,
    pxPerCssPx: +(size.width / cfg.width).toFixed(3), bytes: png.length, pngSha256: sha(png).slice(0, 16), pixelSha256: sha(bmp).slice(0, 16), stats: pixelStats(bmp, size.width, size.height), bmp };
}

async function platformFonts(win, selectors) {
  const d = win.webContents.debugger;
  if (!d.isAttached()) d.attach('1.3');
  await d.sendCommand('DOM.enable');
  await d.sendCommand('CSS.enable');
  const out = {};
  try {
    const { root } = await d.sendCommand('DOM.getDocument', { depth: 0 });
    for (const [k, sel] of Object.entries(selectors)) {
      const { nodeId } = await d.sendCommand('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
      if (!nodeId) { out[k] = null; continue; }
      const { fonts } = await d.sendCommand('CSS.getPlatformFontsForNode', { nodeId });
      out[k] = fonts.map((f) => ({ family: f.familyName, custom: !!f.isCustomFont, glyphs: f.glyphCount }));
    }
  } finally {
    await d.sendCommand('CSS.disable').catch(() => {});
    await d.sendCommand('DOM.disable').catch(() => {});
  }
  return out;
}

// Franchise families for the contact sheets. Themes not listed here go on alphabetical
// "standalone" sheets. This is only a viewing convenience; batching is Judy's call.
const FAMILIES = [
  ['star-wars', 'Star Wars', (t) => t.startsWith('star-wars-')],
  ['warhammer-40k', 'Warhammer 40K', (t) => t.startsWith('warhammer')],
  ['world-of-warcraft', 'World of Warcraft', (t) => t.startsWith('wow-')],
  ['final-fantasy', 'Final Fantasy', (t) => /^ff\d+$/.test(t)],
  ['harry-potter', 'Harry Potter', (t) => ['hogwarts', 'ministry-of-magic', 'gryffindor', 'hufflepuff', 'ravenclaw', 'slytherin'].includes(t)],
  ['middle-earth', 'Middle-earth', (t) => ['rivendell', 'shire', 'mordor'].includes(t)],
  ['persona', 'Persona', (t) => t.startsWith('persona-')],
  ['secret-world', 'Secret World Legends', (t) => t.startsWith('swl-')],
  ['assassins-creed', "Assassin's Creed", (t) => t.startsWith('ac-')],
  ['doom', 'Doom', (t) => t.startsWith('doom-')],
];
function familyOf(t) { const f = FAMILIES.find(([, , m]) => m(t)); return f ? f[0] : 'standalone'; }

// ── per-theme render ─────────────────────────────────────────────────────────
const INDEX = path.join(RENDERER, 'index.html');
function makeRenderWindow() {
  const win = new BrowserWindow({
    // The OS may size a hidden window a few px off what was asked (seen: 426 for 424 while the
    // display was asleep), so the window is a little larger than needed and the page viewport is
    // fixed by device emulation (emulate() below); captures take exactly the emulated view.
    x: 0, y: 0, width: cfg.width + 16, height: cfg.height + 16, useContentSize: true,
    show: false, focusable: false, skipTaskbar: true, frame: false, transparent: true,
    backgroundColor: '#00000000', hasShadow: false, resizable: false,
    webPreferences: {
      offscreen: true, sandbox: true, contextIsolation: true, nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'), backgroundThrottling: false, spellcheck: false,
      autoplayPolicy: 'document-user-activation-required',
    },
  });
  win.webContents.setFrameRate(30);
  return win;
}
// The viewport and DPR come from here, not from the physical display: cfg.width x cfg.height CSS
// px at cfg.scale, on a desktop screen the size of Sergei's (5120x1440 DIP). Call it only after
// a page has loaded: Electron 32 crashes the browser process if it runs on a fresh window.
function emulate(win) {
  win.webContents.enableDeviceEmulation({
    screenPosition: 'desktop', screenSize: { width: 5120, height: 1440 }, viewPosition: { x: 0, y: 0 },
    deviceScaleFactor: cfg.scale, viewSize: { width: cfg.width, height: cfg.height }, scale: 1,
  });
}
const viewportProblem = (p) => (p.viewport[0] !== cfg.width || p.viewport[1] !== cfg.height || Math.abs(p.dpr - cfg.scale) > 1e-6
  ? `viewport ${p.viewport.join('x')} at ${p.dpr}x, expected ${cfg.width}x${cfg.height} at ${cfg.scale}x` : null);

async function renderTheme(win, theme, outDir) {
  const wc = win.webContents;
  themeOfWc.set(wc.id, theme);
  extra.consoleByTheme[theme] = [];
  const t0 = Date.now();
  await win.loadFile(INDEX);
  emulate(win); // idempotent; re-applied per page so a navigation can never drop it
  // Every animation is born paused, so none ever runs on the compositor, and FREEZE's
  // currentTime is then the exact frame. User-origin !important outranks base.css's
  // author-level `body.ql-paused .app-tile:hover::before { animation-play-state: running !important }`,
  // which otherwise let hover animations run and race the freeze (dune's hover flicker).
  await wc.insertCSS('*, *::before, *::after { animation-play-state: paused !important; }', { cssOrigin: 'user' });
  await waitFor(win, `(() => { const l = document.getElementById('theme-stylesheet'); if (!l || !l.sheet || !l.sheet.href || !l.sheet.href.endsWith('/styles/themes/${theme}.css')) return false; try { if (!l.sheet.cssRules.length) return false; } catch { return false; } return document.querySelectorAll('#app-grid .app-tile').length === ${mock.TILE_COUNT} && document.getElementById('header-version').textContent.length > 0; })()`, 10000, `theme ${theme} applied`);
  await js(win, `(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => null))); return true; })()`);
  // The banner rotates every 14 s; stop it so every capture shows quote #1.
  await js(win, `(() => { try { clearInterval(bannerInterval); clearTimeout(bannerFadeTimer); bannerInterval = null; document.getElementById('theme-banner-text').style.opacity = '1'; return true; } catch (e) { return String(e); } })()`);
  await js(win, FRAMES);
  await sleep(150);

  const r = { theme, family: familyOf(theme), ok: true, problems: [], states: {}, freeze: {} };
  r.page = await js(win, PAGE_STATE(theme));
  r.name = r.page.name || theme.toUpperCase();
  if (r.page.hovered) r.problems.push(`${r.page.hovered} element(s) hovered before the grid capture`);
  if (r.page.visibility !== 'visible') r.problems.push(`page visibility ${r.page.visibility}`);
  if (viewportProblem(r.page)) r.problems.push(viewportProblem(r.page));
  if (r.page.bannerExpected && r.page.banner !== r.page.bannerExpected) r.problems.push('banner is not quote #1');
  r.meta = await js(win, CSSOM_META);
  Object.assign(r.meta, staticMeta(fs.readFileSync(path.join(RENDERER, 'styles', 'themes', theme + '.css'), 'utf8')));
  if (r.meta.keyframesRaw !== r.meta.keyframes.length) r.problems.push(`@keyframes: ${r.meta.keyframesRaw} in the file, ${r.meta.keyframes.length} kept by the CSS parser`);

  // (a) grid
  r.freeze.grid = await freeze(win);
  const grid = await capture(win, outDir && path.join(outDir, `${theme}-grid.png`));
  r.fonts = await platformFonts(win, { title: '#title', tileLabel: '#app-grid .app-tile .tile-label', banner: '#theme-banner-text' });

  // (b) settings overlay
  await js(win, `document.getElementById('btn-settings').click(), true`);
  await waitFor(win, `!document.getElementById('settings-overlay').classList.contains('hidden')`, 3000, 'settings overlay open');
  await sleep(250);
  r.freeze.settings = await freeze(win);
  const settings = await capture(win, outDir && path.join(outDir, `${theme}-settings.png`));
  Object.assign(r.fonts, await platformFonts(win, { overlayTitle: '#settings-overlay .overlay-title', settingLabel: '#settings-overlay .setting-row label' }));
  await js(win, `document.getElementById('btn-close-settings').click(), true`);
  await waitFor(win, `document.getElementById('settings-overlay').classList.contains('hidden')`, 3000, 'settings overlay closed');

  // (c) hover: a real synthetic mouse move over tile #2, so :hover applies as it does for Sergei.
  const i = mock.HOVER_TILE_INDEX;
  const rect = await js(win, `(() => { const b = document.querySelectorAll('#app-grid .app-tile')[${i}].getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; })()`);
  const cx = Math.round(rect.x + rect.w / 2), cy = Math.round(rect.y + rect.h / 2);
  wc.sendInputEvent({ type: 'mouseEnter', x: cx, y: cy });
  wc.sendInputEvent({ type: 'mouseMove', x: cx, y: cy });
  await waitFor(win, `document.querySelectorAll('#app-grid .app-tile')[${i}].matches(':hover')`, 3000, 'tile hover');
  await sleep(300);
  r.freeze.hover = await freeze(win);
  const hover = await capture(win, outDir && path.join(outDir, `${theme}-hover.png`));
  wc.sendInputEvent({ type: 'mouseMove', x: -50, y: -50 });
  wc.sendInputEvent({ type: 'mouseLeave', x: -50, y: -50 });

  const s = grid.size[0] / cfg.width; // measured device pixels per CSS pixel
  const dev ={ x: Math.max(0, Math.floor(rect.x * s)), y: Math.max(0, Math.floor(rect.y * s)), w: Math.floor(rect.w * s), h: Math.floor(rect.h * s) };
  dev.w = Math.min(dev.w, grid.size[0] - dev.x); dev.h = Math.min(dev.h, grid.size[1] - dev.y);
  r.hoverTile = { name: 'tile #2', rectCss: rect, rectDevice: dev, diffVsGrid: grid.sizeOk && hover.sizeOk ? rectDiff(grid.bmp, hover.bmp, grid.size[0], dev) : null };
  if (!(r.hoverTile.diffVsGrid > 0.5)) r.problems.push(`hover changed the tile by only ${r.hoverTile.diffVsGrid}`);

  for (const [k, c] of [['grid', grid], ['settings', settings], ['hover', hover]]) {
    const { bmp, ...keep } = c; void bmp;
    r.states[k] = { file: outDir ? `${theme}-${k}.png` : null, ...keep };
    if (!c.sizeOk) r.problems.push(`${k} capture is ${c.size.join('x')}, expected ${EXPECT_W}x${EXPECT_H}`);
    else if (!c.stable) r.problems.push(`${k} frame never settled (${c.grabs} grabs)`);
    if (c.stats.blank) r.problems.push(`${k} capture looks blank (${JSON.stringify(c.stats)})`);
  }
  if (settings.pixelSha256 === grid.pixelSha256) r.problems.push('settings capture identical to grid');
  r.consoleErrors = extra.consoleByTheme[theme].filter((m) => m.level === 'error');
  r.consoleWarnings = extra.consoleByTheme[theme].filter((m) => m.level === 'warning').length;
  r.ms = Date.now() - t0;
  r.ok = r.problems.length === 0;
  return r;
}

// ── contact sheets (drawn on a canvas in an offscreen data: page) ────────────
async function makeSheetPage() {
  const win = new BrowserWindow({ width: 200, height: 120, show: false, focusable: false, skipTaskbar: true, frame: false,
    webPreferences: { offscreen: true, sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false, spellcheck: false } });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<!doctype html><meta charset="utf-8"><title>sheet</title><body></body>'));
  await js(win, `window.__imgs = new Map();
    window.__add = (k, u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => { __imgs.set(k, i); res(true); }; i.onerror = () => rej(new Error('image ' + k)); i.src = u; });
    window.__draw = (L) => { const c = document.createElement('canvas'); c.width = L.w; c.height = L.h; const g = c.getContext('2d');
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.fillStyle = L.bg; g.fillRect(0, 0, L.w, L.h); g.textBaseline = 'top';
      for (const o of L.ops) {
        if (o.t === 'rect') { g.fillStyle = o.c; g.fillRect(o.x, o.y, o.w, o.h); }
        else if (o.t === 'text') { g.font = o.f; g.fillStyle = o.c; g.textAlign = o.a || 'left'; g.fillText(o.s, o.x, o.y, o.max); }
        else if (o.t === 'img') { const i = __imgs.get(o.k); if (i) g.drawImage(i, o.x, o.y, o.w, o.h); else { g.fillStyle = '#a00'; g.fillRect(o.x, o.y, o.w, o.h); } }
      }
      __imgs.clear(); return c.toDataURL('image/png'); };
    true`);
  return win;
}

async function drawSheet(win, file, layout, images) {
  for (const [k, p] of images) await js(win, `__add(${JSON.stringify(k)}, ${JSON.stringify('data:image/png;base64,' + fs.readFileSync(p).toString('base64'))})`);
  const url = await js(win, `__draw(${JSON.stringify(layout)})`);
  const png = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  fs.writeFileSync(file, png);
  extra.sheets.push({ file: path.relative(OUT, file).split(path.sep).join('/'), size: [layout.w, layout.h], themes: layout.themes, bytes: png.length });
  log(`sheet ${path.basename(file)} ${layout.w}x${layout.h}`);
}

const SHEET_BG = '#2b2d31', CELL_BG = '#3a3d42', INK = '#e8e8e8', DIM = '#a9adb3';
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const sheetFooter = () => `Captured ${localDate()} | ${cfg.sourceLabel} | window ${cfg.width}x${cfg.height} at ${cfg.scale}x | loops frozen at ${cfg.freezeMs} ms, one-shots finished | transparent areas shown on ${CELL_BG}`;

async function familySheet(win, title, list, file) {
  const cw = cfg.width, ch = cfg.height, pad = 14, lab = 22, head = 44, colHead = 20, foot = 26;
  const w = pad + STATES.length * (cw + pad);
  const h = head + colHead + list.length * (lab + ch + pad) + foot;
  const ops = [{ t: 'text', s: title, x: pad, y: 12, f: 'bold 20px Segoe UI', c: INK }];
  STATES.forEach((s, j) => ops.push({ t: 'text', s: s.toUpperCase(), x: pad + j * (cw + pad), y: head, f: 'bold 12px Segoe UI', c: DIM }));
  const images = [];
  list.forEach((r, i) => {
    const y = head + colHead + i * (lab + ch + pad);
    ops.push({ t: 'text', s: `${r.name}   (${r.theme})`, x: pad, y: y + 3, f: '14px Segoe UI', c: INK, max: w - 2 * pad });
    STATES.forEach((s, j) => {
      const x = pad + j * (cw + pad);
      ops.push({ t: 'rect', x, y: y + lab, w: cw, h: ch, c: CELL_BG });
      const k = `${r.theme}-${s}`;
      images.push([k, path.join(OUT, `${k}.png`)]);
      ops.push({ t: 'img', k, x, y: y + lab, w: cw, h: ch });
    });
  });
  ops.push({ t: 'text', s: sheetFooter(), x: pad, y: h - foot + 6, f: '11px Segoe UI', c: DIM, max: w - 2 * pad });
  await drawSheet(win, file, { w, h, bg: SHEET_BG, ops, themes: list.map((r) => r.theme) }, images);
}

async function overviewSheet(win, list, file) {
  const cols = 10, cw = Math.round(cfg.width / 2), ch = Math.round(cfg.height / 2), pad = 10, lab = 18, head = 40, foot = 24;
  const rows = Math.ceil(list.length / cols);
  const w = pad + cols * (cw + pad), h = head + rows * (lab + ch + pad) + foot;
  const ops = [{ t: 'text', s: `QuickLaunch themes: main grid, all ${list.length}`, x: pad, y: 10, f: 'bold 20px Segoe UI', c: INK }];
  const images = [];
  list.forEach((r, i) => {
    const x = pad + (i % cols) * (cw + pad), y = head + Math.floor(i / cols) * (lab + ch + pad);
    ops.push({ t: 'text', s: r.theme, x, y: y + 2, f: '12px Segoe UI', c: INK, max: cw });
    ops.push({ t: 'rect', x, y: y + lab, w: cw, h: ch, c: CELL_BG });
    images.push([r.theme, path.join(OUT, `${r.theme}-grid.png`)]);
    ops.push({ t: 'img', k: r.theme, x, y: y + lab, w: cw, h: ch });
  });
  ops.push({ t: 'text', s: sheetFooter(), x: pad, y: h - foot + 6, f: '11px Segoe UI', c: DIM, max: w - 2 * pad });
  await drawSheet(win, file, { w, h, bg: SHEET_BG, ops, themes: list.map((r) => r.theme) }, images);
}

async function buildSheets(ok) {
  const dir = path.join(OUT, 'sheets');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const win = await makeSheetPage();
  try {
    if (ok.length) await overviewSheet(win, ok, path.join(dir, '00-overview-grid.png'));
    let n = 1;
    for (const [key, title] of FAMILIES) {
      const list = ok.filter((r) => r.family === key);
      if (list.length) await familySheet(win, `${title} (${list.length})`, list, path.join(dir, `${String(n++).padStart(2, '0')}-${key}.png`));
    }
    const rest = ok.filter((r) => r.family === 'standalone');
    for (let i = 0; i < rest.length; i += 12) {
      const chunk = rest.slice(i, i + 12);
      const title = `Standalone themes ${i + 1}-${i + chunk.length} of ${rest.length} (${chunk[0].theme} to ${chunk[chunk.length - 1].theme})`;
      await familySheet(win, title, chunk, path.join(dir, `${String(n++).padStart(2, '0')}-standalone-${Math.floor(i / 12) + 1}.png`));
    }
  } finally { win.destroy(); }
}

// ── metadata table ───────────────────────────────────────────────────────────
function fontSummary(f) {
  if (!f) return '';
  const fams = new Set();
  for (const v of Object.values(f)) if (v) for (const x of v) fams.add(x.family + (x.custom ? ' (web font)' : ''));
  return [...fams].join(' + ');
}
function writeMetadata(list) {
  const rows = list.map((r) => ({
    theme: r.theme, name: r.name, family: r.family,
    fileBytes: r.meta.fileBytes, lines: r.meta.lines,
    images: r.meta.images, svgImages: r.meta.svgImages, rasterImages: r.meta.rasterImages, fileRefs: r.meta.fileRefs,
    uniqueImages: r.meta.uniqueImages, imageDataChars: r.meta.imageChars,
    beforeRules: r.meta.beforeRules, afterRules: r.meta.afterRules, pseudoRules: r.meta.pseudoRules,
    keyframes: r.meta.keyframes.length, gradients: r.meta.gradients,
    loopingAnimationsAtCapture: r.freeze.grid.loops,
    fontStackDeclared: r.meta.fontStack, fontsRendered: fontSummary(r.fonts),
  }));
  fs.writeFileSync(path.join(OUT, 'theme-metadata.json'), JSON.stringify(rows, null, 1));
  const cols = Object.keys(rows[0] || {});
  const q = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  fs.writeFileSync(path.join(OUT, 'theme-metadata.csv'), [cols.join(','), ...rows.map((row) => cols.map((c) => q(row[c])).join(','))].join('\r\n') + '\r\n');
}

// ── status for run.mjs (PIDs for its netstat / liveness checks) ──────────────
let done = 0;
const checkpointsPending = new Set();
function writeStatus(phase) {
  try {
    const pids = app.getAppMetrics().map((m) => ({ pid: m.pid, type: m.type, created: m.creationTime }));
    fs.writeFileSync(cfg.statusFile, JSON.stringify({ phase, done, total: THEMES.length, checkpoints: [...checkpointsPending], pids }));
  } catch { /* next tick */ }
}
// Pause (this worker only) until run.mjs has taken its netstat / liveness sample, so the
// sample is always taken while the whole process tree is alive, however fast the run is.
async function checkpoint(n) {
  checkpointsPending.add(n);
  writeStatus('rendering');
  const t0 = Date.now();
  try {
    while (Date.now() - t0 < 30000) {
      try { if (fs.readFileSync(cfg.ackFile, 'utf8').split('\n').includes(String(n))) return true; } catch { /* not yet */ }
      await sleep(100);
    }
    log(`checkpoint ${n}: no sample acknowledgement from run.mjs within 30 s`);
    return false;
  } finally { checkpointsPending.delete(n); writeStatus('rendering'); }
}

// ── app ──────────────────────────────────────────────────────────────────────
app.on('browser-window-focus', () => hit('focusEvents', 'browser-window-focus'));
app.on('window-all-closed', () => { /* finish() decides when to exit */ });
app.on('web-contents-created', (_, wc) => {
  wc.setAudioMuted(true);
  wc.on('media-started-playing', () => hit('mediaStarted', wc.getURL().slice(0, 120)));
  wc.setWindowOpenHandler(({ url }) => { hit('windowOpens', url); return { action: 'deny' }; });
  const nav = (e, url) => { if (!(url.startsWith('file:') && isInside(RENDERER, fileURLToPath(url)))) { e.preventDefault(); hit('navigationsBlocked', url.slice(0, 120)); } };
  wc.on('will-navigate', nav);
  wc.on('will-redirect', nav);
  wc.on('will-attach-webview', (e) => e.preventDefault());
  wc.on('console-message', (e, level, message, line, sourceId) => {
    if (level < 2) return;
    const theme = themeOfWc.get(wc.id);
    const m = { level: level === 3 ? 'error' : 'warning', message: String(message).slice(0, 300), src: `${String(sourceId).split('/').pop()}:${line}` };
    if (theme && extra.consoleByTheme[theme]) extra.consoleByTheme[theme].push(m);
    if (level === 3) log(`renderer error [${theme || '-'}] ${m.message} (${m.src})`);
  });
  wc.on('render-process-gone', (e, d) => { log('render-process-gone ' + JSON.stringify(d)); });
});
app.on('child-process-gone', (e, d) => { if (d.reason !== 'clean-exit') log('child-process-gone ' + JSON.stringify(d)); });

app.whenReady().then(async () => {
  // Display changes (monitor sleep, resolution, docking) can hand offscreen capture a stale
  // frame; record them so a run that saw one says so.
  const { screen } = electron;
  extra.displays = screen.getAllDisplays().map((d) => ({ bounds: d.bounds, workArea: d.workArea, scaleFactor: d.scaleFactor }));
  for (const ev of ['display-added', 'display-removed', 'display-metrics-changed']) {
    screen.on(ev, (_, d, changed) => { extra.displayEvents.push({ ev, at: Date.now(), bounds: d && d.bounds, changed }); log(`display event ${ev} ${JSON.stringify(changed || '')}`); });
  }
  const ses = session.defaultSession;
  ses.webRequest.onBeforeRequest((details, cb) => {
    const u = details.url;
    if (u.startsWith('data:') || u.startsWith('devtools:')) return cb({});
    if (u.startsWith('file:')) {
      let p = null; try { p = fileURLToPath(u); } catch { /* malformed */ }
      if (p && isInside(ROOT, p)) return cb({});
    }
    hit('blockedRequests', u.slice(0, 200));
    return cb({ cancel: true });
  });
  ses.setPermissionRequestHandler((wc, perm, cb) => { hit('permissionRequests', perm); cb(false); });
  ses.setPermissionCheckHandler(() => false);

  fs.mkdirSync(OUT, { recursive: true });
  if (cfg.compare) {
    // Compose before | after images only; no QuickLaunch page is loaded in this mode. Same
    // process-level guards as a render (installed above and at the top of this file).
    log(`compare ${cfg.compare.before.label} -> ${cfg.compare.after.label}; ${THEMES.length} theme(s); batch ${cfg.compare.batch}`);
    writeStatus('starting');
    const statusTimer = setInterval(() => writeStatus('rendering'), 1500);
    await require('./compare.cjs').runCompare({
      cfg, OUT, log, drawSheet, makeSheetPage, results, extra,
      afterTheme: async (r) => {
        done++;
        log(`${String(done).padStart(3)}/${THEMES.length} ${r.theme} ${r.ok ? 'ok' : 'PROBLEM: ' + r.problems.join('; ')}`);
        if ((cfg.checkpoints || []).includes(done)) await checkpoint(done);
      },
    });
    clearInterval(statusTimer);
    writeStatus('done');
    finish(0, 'done');
    return;
  }
  if (cfg.hover) {
    // Hover legibility gate (check:hover): readings only, no PNGs. Same process-level guards.
    log(`hover source ${cfg.sourceLabel}; ${THEMES.length} theme(s); window ${cfg.width}x${cfg.height} at ${cfg.scale}x; ${cfg.concurrency} window(s)`);
    writeStatus('starting');
    const statusTimer = setInterval(() => writeStatus('measuring'), 1500);
    await require('./hover.cjs').runHover({
      cfg, log, js, waitFor, sleep, FRAMES, mock, themeOfWc, extra, results, INDEX, RENDERER, THEMES, emulate, viewportProblem,
      isFinished: () => finished,
      checkpoint: async (n) => { done = n; return checkpoint(n); },
    });
    clearInterval(statusTimer);
    writeStatus('done');
    finish(0, 'done');
    return;
  }
  for (const f of fs.readdirSync(OUT)) if (/^[a-z0-9-]+-(grid|settings|hover)\.png$/.test(f)) fs.unlinkSync(path.join(OUT, f));
  log(`source ${cfg.sourceLabel}; ${THEMES.length} theme(s); window ${cfg.width}x${cfg.height} at ${cfg.scale}x; ${cfg.gpu ? 'GPU' : 'software'} raster; freeze ${cfg.freezeMs} ms; ${cfg.concurrency} window(s)`);
  writeStatus('starting');
  const statusTimer = setInterval(() => writeStatus('rendering'), 1500);

  const queue = [...THEMES];
  async function worker() {
    let win = makeRenderWindow();
    try {
      while (queue.length && !finished) {
        const theme = queue.shift();
        let r;
        for (let attempt = 1; attempt <= 2 && !r; attempt++) {
          try { r = await renderTheme(win, theme, OUT); }
          catch (e) {
            log(`render ${theme} attempt ${attempt} failed: ${e.message}`);
            if (attempt === 2) r = { theme, family: familyOf(theme), name: theme.toUpperCase(), ok: false, problems: [`render failed: ${e.message}`] };
            else { try { win.destroy(); } catch { /* gone */ } win = makeRenderWindow(); }
          }
        }
        results.push(r);
        done++;
        log(`${String(done).padStart(3)}/${THEMES.length} ${theme} ${r.ok ? 'ok' : 'PROBLEM: ' + r.problems.join('; ')}${r.ms ? ` (${r.ms} ms)` : ''}`);
        if ((cfg.checkpoints || []).includes(done)) await checkpoint(done);
      }
    } finally { try { win.destroy(); } catch { /* gone */ } }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(cfg.concurrency, THEMES.length)) }, () => worker()));
  results.sort((a, b) => a.theme.localeCompare(b.theme));

  // Self-test: prove each in-process guard can fire. Never calls a real login-item,
  // shortcut or window API; every trigger lands on a counting stub.
  if (cfg.selfTest) {
    const before = { ...counters };
    const win = makeRenderWindow();
    try {
      const same = [], differ = [];
      for (const first of results) {
        const again = await renderTheme(win, first.theme, null);
        for (const st of STATES) (first.states[st] && again.states[st] && first.states[st].pixelSha256 === again.states[st].pixelSha256 ? same : differ).push(`${first.theme}-${st}`);
      }
      extra.selfTest.push({ control: 'determinism: every self-test capture rendered again in a fresh window is pixel-identical', expected: 'all identical', observed: differ.length ? `DIFFERENT: ${differ.join(', ')}` : `${same.length}/${same.length} identical`, pass: differ.length === 0 && same.length > 0 });
      await js(win, `document.getElementById('btn-settings').click(); document.getElementById('chk-startup').click(); true`);
      await sleep(400);
      extra.selfTest.push({ control: 'login-item counter sees the renderer toggling Start with Windows', expected: 'count >= 1 (gate FAILS)', observed: `count ${counters.loginItem - before.loginItem}`, pass: counters.loginItem > before.loginItem });
      extra.selfTest.push({ control: 'IPC allowlist gate sees channels outside the expected four', expected: 'unexpected >= 1 (gate FAILS)', observed: `unexpected ${unexpectedIpc.length}`, pass: unexpectedIpc.length > 0 });
      await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<!doctype html><body style="margin:0;background:transparent"></body>'));
      const blank = await capture(win, null);
      extra.selfTest.push({ control: 'blank-capture detector on an empty transparent page', expected: 'blank (gate FAILS)', observed: blank.stats.blank ? `blank ${JSON.stringify(blank.stats)}` : `not blank ${JSON.stringify(blank.stats)}`, pass: blank.stats.blank });
      win.setContentSize(300, 200); // hidden offscreen window: resizing it shows nothing
      win.webContents.disableDeviceEmulation();
      await sleep(300);
      const small = await capture(win, null);
      extra.selfTest.push({ control: 'capture-size gate on a 300x200 window without emulation', expected: `not ${EXPECT_W}x${EXPECT_H} (gate FAILS)`, observed: `${small.size.join('x')} sizeOk=${small.sizeOk}`, pass: !small.sizeOk });
      const vp = await js(win, `({ viewport: [innerWidth, innerHeight], dpr: devicePixelRatio })`);
      extra.selfTest.push({ control: 'viewport gate on the same window', expected: 'mismatch (gate FAILS)', observed: viewportProblem(vp) || `ok ${vp.viewport.join('x')}`, pass: !!viewportProblem(vp) });
      const sheetWin = await makeSheetPage();
      await js(sheetWin, `fetch('https://example.invalid/qlg-self-test').then(() => 'fetched', (e) => 'rejected: ' + e.message)`);
      sheetWin.destroy();
      extra.selfTest.push({ control: 'network block sees a page fetch to an external host', expected: 'blocked >= 1 (gate FAILS)', observed: `blocked ${counters.blockedRequests - before.blockedRequests}`, pass: counters.blockedRequests > before.blockedRequests });
      const intact = stubsIntact();
      extra.selfTest.push({ control: 'counting stubs installed on every guarded API', expected: `${intact.total} intact`, observed: `${intact.total - intact.broken.length} intact`, pass: intact.broken.length === 0 });
    } catch (e) {
      extra.selfTest.push({ control: 'self-test ran', expected: 'no error', observed: e.message, pass: false });
    } finally { win.destroy(); }
  }

  const ok = results.filter((r) => r.ok);
  if (!cfg.selfTest) {
    writeStatus('sheets');
    await buildSheets(results.filter((r) => r.states && r.states.grid));
    writeMetadata(results.filter((r) => r.meta));
  }
  clearInterval(statusTimer);
  writeStatus('done');
  log(`rendered ${ok.length}/${results.length} theme(s) without problems`);
  finish(0, 'done');
});
