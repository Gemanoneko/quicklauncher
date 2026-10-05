#!/usr/bin/env node
/**
 * regions-selftest.mjs: M1 + M2 + M2b + M3 (and its fix pass) self-test of the packaged regions build.
 *
 *   npm run selftest:regions -- [--guard <quicklaunch-safe-launch.mjs>] [--exe <QuickLauncher.exe>]
 *                               [--seed <data file to copy>] [--port 9341] [--timeout 300]
 *                               [--root <folder in %TEMP%>]
 *
 * M3 (the file move) runs only against a fake desktop: --ql-test-desktop=<root>\<stamp>-desk
 * (Desktop, Public Desktop, QuickLauncher Shortcuts), next to the profile under --root
 * (default %TEMP%\ql-regions-selftest; refused outside %TEMP%). The real Desktop and
 * Public Desktop are listed (names, sizes, times; read-only) before the launch and
 * after the quit, and must be identical.
 *
 * Launches the build ONLY through the studio's QA launch guard
 * (scripts/qa/quicklaunch-safe-launch.mjs) on a fresh profile in %TEMP%, with
 * --ql-test-hooks (the Manager opens hidden, never shown or focused) and a
 * remote-debugging port. It then drives the pages over CDP with
 * Runtime.evaluate only: no OS input. M2's tile drags and keys are DOM events
 * dispatched inside a page; native menus and app launches are recorded by
 * --ql-test-hooks, never shown or run; no message box is opened. The display
 * is never changed (a stand-in work area runs the display-change handler).
 * Focus gate: scripts/fg-observer.mjs (out of process, read-only WinEvent
 * hooks) logs every foreground change from before the launch until after the
 * app has quit; no foreground change may go to a window of this build.
 *
 * --seed copies a data file into the profile (the source is only read) and
 * forces the guard's safe settings (startWithWindows false, globalHotkey null,
 * randomTheme false). Without --seed a synthetic library is used.
 * --probe injects an uncaught error and an overlapping button, to prove the
 * error and hit-area checks can fail, plus the M2 faults and wrong inputs
 * listed in m2Checks and m2bChecks, and a foreground event for this build in
 * the observer's log. Exit 0 when every check passes.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const require = createRequire(import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const PORT = Number(opt('port', '9341'));
const TIMEOUT = Number(opt('timeout', '300'));
const EXE = resolve(opt('exe', join(REPO, 'dist', 'win-unpacked', 'QuickLauncher.exe')));
const SEED = opt('seed', null);
// --probe: prove the error and hit-area checks can FAIL (an uncaught error and
// an overlapping button are injected; those two checks must then fail).
const PROBE = argv.includes('--probe');
// --shots <dir>: save PNGs of a region (view and edit mode) and the Manager views.
const SHOTS = opt('shots', null);
// --fallback: run with the kill switch (--ql-no-desktop-layer); regions are
// top-level tool windows just above the desktop instead of desktop children.
const FALLBACK = argv.includes('--fallback');
const MODE = FALLBACK ? 'fallback' : 'attached';
function findGuard() {
  const given = opt('guard', process.env.QL_GUARD || null);
  const tries = given ? [given] : [
    join(REPO, '..', '..', 'scripts', 'qa', 'quicklaunch-safe-launch.mjs'),            // WIP/QuickLaunch in the studio
    join(REPO, '..', 'Studio Illuminati', 'scripts', 'qa', 'quicklaunch-safe-launch.mjs'), // a sibling worktree
  ];
  return tries.map((p) => resolve(p)).find((p) => existsSync(p)) || null;
}
const GUARD = findGuard();
if (!GUARD) { console.error('selftest: QA launch guard not found; pass --guard <path>'); process.exit(1); }
if (!existsSync(EXE)) { console.error(`selftest: no build at ${EXE} (npm run pack, or electron-builder --dir)`); process.exit(1); }

// ── results ─────────────────────────────────────────────────────────────────
const results = [];
function check(name, ok, evidence) {
  results.push({ name, ok: !!ok, evidence, at: Date.now() });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${evidence !== undefined ? `  | ${typeof evidence === 'string' ? evidence : JSON.stringify(evidence)}` : ''}`);
}

// ── seed ────────────────────────────────────────────────────────────────────
const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
const ROOT_DIR = resolve(opt('root', join(tmpdir(), 'ql-regions-selftest')));
{
  mkdirSync(ROOT_DIR, { recursive: true });
  const real = realpathSync.native(ROOT_DIR).toLowerCase();
  const temps = [tmpdir(), process.env.TEMP, process.env.TMP].filter(Boolean).map((p) => realpathSync.native(p).toLowerCase());
  if (!temps.some((t) => real.startsWith(t + sep))) { console.error(`selftest: --root must be inside the temp folder; got ${ROOT_DIR}`); process.exit(1); }
}
const PROFILE = join(ROOT_DIR, stamp);
mkdirSync(PROFILE, { recursive: true });
const DATA = join(PROFILE, 'quicklauncher-data.json');
let seed;
if (SEED) {
  seed = JSON.parse(readFileSync(SEED, 'utf8'));
} else {
  const sys = 'C:\\Windows\\System32';
  seed = {
    apps: ['notepad', 'calc', 'cmd', 'mspaint', 'charmap', 'write'].map((n, i) => ({
      id: `seed-${i}`, name: n.toUpperCase(), path: `${sys}\\${n}.exe`, iconDataUrl: '',
    })),
    settings: { iconSize: 64, theme: 'matrix', windowPosition: { x: 300, y: 200 }, windowSize: { width: 424, height: 300 }, reducedMotion: false },
  };
}
seed.settings = { ...(seed.settings || {}), startWithWindows: false, globalHotkey: null, randomTheme: false };
// A copied data file may hold moved shortcuts whose files are in the REAL store folder: the copy keeps them as references.
seed.apps = (seed.apps || []).map((a) => { if (!a || a.kind !== 'moved') return a; const { kind, origin, ...rest } = a; return rest; });
delete seed.regions;
delete seed.regionsVersion;
const seedText = `${JSON.stringify(seed, null, 2)}\n`;
writeFileSync(DATA, seedText);
const N = seed.apps.length;
console.log(`profile ${PROFILE}  (${N} shortcut(s), ${SEED ? 'copied seed' : 'synthetic seed'})`);

// ── M3: Win32 helpers for the test side (koffi; locks, attributes, moves of test files) ──
const koffi = require(join(REPO, 'node_modules', 'koffi'));
const k32 = koffi.load('kernel32.dll');
const W = {
  CreateFileW: k32.func('intptr __stdcall CreateFileW(str16 name, uint32 access, uint32 share, intptr sa, uint32 disp, uint32 flags, intptr tmpl)'),
  CloseHandle: k32.func('int __stdcall CloseHandle(intptr h)'),
  SetFileAttributesW: k32.func('int __stdcall SetFileAttributesW(str16 name, uint32 attrs)'),
  GetFileAttributesW: k32.func('uint32 __stdcall GetFileAttributesW(str16 name)'),
  MoveFileExW: k32.func('int __stdcall MoveFileExW(str16 src, str16 dst, uint32 flags)'),
};
/** Hold a test file open: share-read lets it be read but not moved (ERROR_SHARING_VIOLATION). Returns the release. */
function holdOpen(p) {
  const h = W.CreateFileW(p, 0x80000000, 1, 0, 3, 0x80, 0);
  if (!h || h === -1) throw new Error(`could not hold ${p}`);
  return () => W.CloseHandle(h);
}
/** A Public Desktop file as Windows ships it: readable, not deletable by the user. Returns the reset. */
function readOnlyAcl(f) {
  const user = process.env.USERNAME;
  const ic = (args) => spawnSync('icacls', args, { encoding: 'utf8', windowsHide: true }).status;
  if (ic([f, '/inheritance:r', '/grant:r', `${user}:(RX)`]) !== 0 || ic([dirname(f), '/inheritance:r', '/grant:r', `${user}:(RX,W)`]) !== 0) throw new Error('icacls failed');
  return () => { ic([dirname(f), '/reset']); ic([f, '/reset']); };
}
/** Move a test file within the test tree (the test plays a person moving it), never replacing. */
const testMove = (a, b) => { mkdirSync(dirname(b), { recursive: true }); if (!W.MoveFileExW(a, b, 0x8)) throw new Error(`test move ${a} -> ${b} failed`); };
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
function listTree(dir) {
  const out = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); const st = lstatSync(p); if (st.isDirectory()) walk(p); else out.push({ rel: relative(dir, p), size: st.size, sha: sha(p) }); } };
  if (existsSync(dir)) walk(dir);
  return out;
}

// The REAL Desktop and Public Desktop, read-only: SHGetKnownFolderPath, then names,
// kinds, sizes and times (lstat; no file is opened). Compared before the launch and after the quit.
const shell32 = koffi.load('shell32.dll');
const ole32 = koffi.load('ole32.dll');
const SHGetKnownFolderPath = shell32.func('int32 __stdcall SHGetKnownFolderPath(void *rfid, uint32 flags, intptr token, _Out_ void **path)');
const CoTaskMemFree = ole32.func('void __stdcall CoTaskMemFree(void *pv)');
function knownFolder(id) {
  const h = id.replace(/[{}-]/g, '');
  const g = Buffer.alloc(16);
  g.writeUInt32LE(parseInt(h.slice(0, 8), 16), 0); g.writeUInt16LE(parseInt(h.slice(8, 12), 16), 4); g.writeUInt16LE(parseInt(h.slice(12, 16), 16), 6);
  for (let i = 0; i < 8; i++) g[8 + i] = parseInt(h.slice(16 + i * 2, 18 + i * 2), 16);
  const out = [null];
  if (SHGetKnownFolderPath(g, 0, 0, out) !== 0) return null;
  try { return koffi.decode(out[0], 'char16_t', -1); } finally { CoTaskMemFree(out[0]); }
}
const REAL_FOLDERS = { Desktop: knownFolder('{B4BFCC3A-DB2C-424C-B029-7FE99A87C641}'), PublicDesktop: knownFolder('{C4AA340D-F20F-4863-AFEF-F87EF2E6BA25}') };
function listRealFolders(folders = REAL_FOLDERS) {
  const out = {};
  for (const [k, d] of Object.entries(folders)) {
    out[k] = d && existsSync(d) ? readdirSync(d).sort().map((n) => { const st = lstatSync(join(d, n)); return `${n}|${st.isDirectory() ? 'd' : 'f'}|${st.size}|${st.mtimeMs}`; }) : null;
  }
  return out;
}
const realBefore = listRealFolders();

// ── M3: the fake desktop (Desktop, Public Desktop; the app makes QuickLauncher Shortcuts) ──
const DESK = join(ROOT_DIR, `${stamp}-desk`);
const FIX = { dirs: { desktop: join(DESK, 'Desktop'), publicDesktop: join(DESK, 'Public Desktop'), store: join(DESK, 'QuickLauncher Shortcuts'), staging: join(DESK, 'Staging'), aside: join(DESK, 'Aside'), elsewhere: join(DESK, 'Elsewhere') } };
for (const k of ['desktop', 'publicDesktop', 'staging', 'aside', 'elsewhere']) mkdirSync(FIX.dirs[k], { recursive: true });
mkdirSync(join(FIX.dirs.desktop, 'Sub'), { recursive: true });
{
  const D = FIX.dirs;
  const lnks = {
    alpha: join(D.desktop, 'Alpha.lnk'), beta: join(D.desktop, 'Beta.lnk'), delta: join(D.desktop, 'Delta.lnk'), epsilon: join(D.desktop, 'Epsilon.lnk'),
    far: join(D.desktop, 'Far.lnk'), cloud: join(D.desktop, 'Cloud.lnk'), changed: join(D.desktop, 'Changed.lnk'), racer: join(D.desktop, 'Racer.lnk'),
    inner: join(D.desktop, 'Sub', 'Inner.lnk'), pub: join(D.publicDesktop, 'Pub.lnk'), admin: join(D.publicDesktop, 'Admin.lnk'),
    other: join(D.elsewhere, 'Other.lnk'), alpha2: join(D.staging, 'Alpha.lnk'), late: join(D.staging, 'Late.lnk'), stray: join(D.staging, 'Stray.lnk'),
    spare: join(D.staging, 'Spare.lnk'), // --probe only: takes the "(2)" name first
    // Addendum M3 rulings: broken tiles (zeta, eta, theta, kappa), two regions in Move all back (lambda), the notice and the filter (mu, nu).
    zeta: join(D.desktop, 'Zeta.lnk'), eta: join(D.desktop, 'Eta.lnk'), theta: join(D.desktop, 'Theta.lnk'), kappa: join(D.desktop, 'Kappa.lnk'),
    lambda: join(D.desktop, 'Lambda.lnk'), mu: join(D.desktop, 'Mu.lnk'), nu: join(D.desktop, 'Nu.lnk'),
  };
  // Real shortcuts to Notepad (never launched: test hooks record launches), each with its own description so every file has its own bytes.
  const ps = spawnSync(join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'), ['-NoProfile', '-NonInteractive', '-Command',
    "$w = New-Object -ComObject WScript.Shell; foreach ($p in ($env:QL_LNKS -split '\\|')) { $s = $w.CreateShortcut($p); $s.TargetPath = \"$env:SystemRoot\\System32\\notepad.exe\"; $s.Description = $p; $s.Save() }"],
  { env: { ...process.env, QL_LNKS: Object.values(lnks).join('|') }, encoding: 'utf8', windowsHide: true, timeout: 60000 });
  const missing = Object.values(lnks).filter((p) => !existsSync(p));
  if (missing.length) { console.error(`selftest: could not make test shortcuts (${ps.status} ${ps.stderr}): ${missing.join(', ')}`); process.exit(1); }
  const url = (p, u) => { writeFileSync(p, `[InternetShortcut]\r\nURL=${u}\r\n`); return p; };
  Object.assign(FIX, lnks, {
    gamma: url(join(D.desktop, 'Gamma.url'), 'https://example.invalid/gamma'),
    stray2: url(join(D.staging, 'Stray2.url'), 'https://example.invalid/stray2'),
    tool: join(D.desktop, 'Tool.exe'), notes: join(D.desktop, 'notes.txt'),
  });
  writeFileSync(FIX.tool, 'not a real program: test hooks never launch anything');
  writeFileSync(FIX.notes, 'not a shortcut');
}
const deskBefore = listTree(DESK);
const fakeBefore = listRealFolders({ Desktop: FIX.dirs.desktop, PublicDesktop: FIX.dirs.publicDesktop }); // --probe's control
const REAL_STORE_EXISTED = existsSync(join(process.env.USERPROFILE || '', 'QuickLauncher Shortcuts'));
console.log(`test desktop ${DESK}  (${deskBefore.length} files)`);

// ── foreground observer (out of process, read-only), started before the launch ──
const { readEvents, foregroundVerdict } = require('./fg-verdict.cjs');
const OBS_LOG = join(PROFILE, 'fg-observer.jsonl');
const observer = spawn(process.execPath, [join(HERE, 'fg-observer.mjs'), OBS_LOG, String(TIMEOUT + 180)], { stdio: 'ignore', windowsHide: true });
const observerDone = new Promise((r) => observer.on('exit', (c) => r(c)));
for (let i = 0; i < 50; i++) {
  if (existsSync(OBS_LOG) && /"ev":"hooks"/.test(readFileSync(OBS_LOG, 'utf8'))) break;
  await sleep(100);
}

// ── launch through the guard ────────────────────────────────────────────────
const guardOut = [];
// OneDrive: the fake desktop is made to look synced (the Manager's note must show);
// --probe leaves the real variable, so the note must not show and its check fails.
const appEnv = PROBE ? { ...process.env } : { ...process.env, OneDrive: DESK };
const guard = spawn(process.execPath, [GUARD, '--exe', EXE, '--profile', PROFILE, '--timeout', String(TIMEOUT),
  '--', `--remote-debugging-port=${PORT}`, '--ql-test-hooks', '--ql-no-update-check', '--enable-logging', `--ql-test-desktop=${DESK}`,
  ...(FALLBACK ? ['--ql-no-desktop-layer'] : [])], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, env: appEnv });
guard.stdout.on('data', (d) => guardOut.push(String(d)));
guard.stderr.on('data', (d) => guardOut.push(String(d)));
const guardDone = new Promise((r) => guard.on('exit', (code) => r(code)));


// ── tiny CDP client ─────────────────────────────────────────────────────────
async function targets() {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    return await r.json();
  } catch { return []; }
}
const pages = new Map(); // targetId -> session
async function session(t) {
  if (pages.has(t.id)) return pages.get(t.id);
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0;
  const waiting = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && waiting.has(msg.id)) { waiting.get(msg.id).res(msg); waiting.delete(msg.id); }
  };
  // A page that goes away (window closed, app ended) fails its calls instead of hanging.
  const failAll = (why) => { for (const w of waiting.values()) w.rej(new Error(why)); waiting.clear(); pages.delete(t.id); };
  ws.onclose = () => failAll(`page closed: ${t.url}`);
  const send = (method, params = {}, timeoutMs = 15000) => new Promise((res, rej) => {
    const id = ++seq;
    const timer = setTimeout(() => { waiting.delete(id); rej(new Error(`CDP ${method} timed out on ${t.url}`)); }, timeoutMs);
    waiting.set(id, { res: (v) => { clearTimeout(timer); res(v); }, rej: (e) => { clearTimeout(timer); rej(e); } });
    try { ws.send(JSON.stringify({ id, method, params })); } catch (e) { clearTimeout(timer); waiting.delete(id); rej(e); }
  });
  const s = {
    t,
    // A drop builds each tile's icon in the main process: allow it a longer wait.
    async eval(expr, timeoutMs = 15000) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, timeoutMs);
      if (r.result && r.result.exceptionDetails) throw new Error(`${t.url}: ${JSON.stringify(r.result.exceptionDetails).slice(0, 300)}`);
      return r.result && r.result.result ? r.result.result.value : undefined;
    },
    async shot(file) {
      // The page's own pixels (CDP), never the screen.
      const r = await send('Page.captureScreenshot', { format: 'png' });
      if (r.result && r.result.data) writeFileSync(file, Buffer.from(r.result.data, 'base64'));
      return !!(r.result && r.result.data);
    },
    close() { try { ws.close(); } catch { /* noop */ } },
  };
  pages.set(t.id, s);
  return s;
}
const regionId = (t) => { try { return new URL(t.url).searchParams.get('region'); } catch { return null; } };
async function regionPages() {
  return (await targets()).filter((t) => t.type === 'page' && /index\.html\?/.test(t.url));
}
async function pageFor(id, { rebuilt = null, timeoutMs = 15000 } = {}) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    const t = (await regionPages()).find((x) => regionId(x) === id && (rebuilt === null || new URL(x.url).searchParams.get('rebuilt') === (rebuilt ? '1' : '0')));
    if (t) {
      const s = await session(t);
      // Wait for app.js init and region.js state.
      for (let i = 0; i < 40; i++) {
        const ok = await s.eval(`!!document.body && document.body.classList.contains('region') && typeof apps !== 'undefined' && document.title.length > 0`).catch(() => false);
        if (ok) return s;
        await sleep(150);
      }
      return s;
    }
    await sleep(250);
  }
  throw new Error(`no page for region ${id}`);
}
async function managerPage(timeoutMs = 15000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    const t = (await targets()).find((x) => x.type === 'page' && /manager\.html/.test(x.url));
    if (t) {
      const s = await session(t);
      for (let i = 0; i < 40; i++) { if (await s.eval(`typeof window.api === 'object' && document.readyState === 'complete'`).catch(() => false)) break; await sleep(150); }
      return s;
    }
    await sleep(250);
  }
  throw new Error('no manager page');
}
const readData = () => JSON.parse(readFileSync(DATA, 'utf8'));
const tooClose = (a, b, gap = 12) => a.x < b.x + b.width + gap && b.x < a.x + a.width + gap && a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;

// ── the checks ──────────────────────────────────────────────────────────────
async function run() {
  // Boot
  let first = null;
  for (let i = 0; i < 80 && !first; i++) { first = (await regionPages())[0] || null; if (!first) await sleep(250); }
  if (!first) { check('boot: a region page appears', false, 'no page within 20 s'); return; }
  const r1id = regionId(first);
  const r1 = await pageFor(r1id);
  const boot = await r1.eval(`(async () => { const info = await window.api.invoke('region:info'); return {
    title: document.title, titleText: document.getElementById('title').textContent,
    tiles: document.querySelectorAll('.app-tile').length,
    cls: [...document.body.classList], icon: !!document.querySelector('#region-icon svg'),
    theme: document.getElementById('theme-stylesheet').getAttribute('href'), info }; })()`);
  check('boot: region 1 is today\'s grid, named QUICK.LAUNCH, all shortcuts', boot.titleText === 'QUICK.LAUNCH' && boot.tiles === N && boot.cls.includes('layout-grid') && boot.icon,
    { title: boot.titleText, tiles: `${boot.tiles}/${N}`, icon: boot.icon });
  check(FALLBACK ? 'boot: region 1 is a fallback window (kill switch)' : 'boot: region 1 is on the desktop layer', boot.info && boot.info.mode === MODE, { mode: boot.info && boot.info.mode });
  check('boot: theme kept from the store', boot.theme.endsWith(`/${seed.settings.theme || 'cyberpunk'}.css`), boot.theme);

  // Manager (hidden in test mode)
  await r1.eval(`window.api.invoke('region:open-manager', { view: 'regions' })`);
  const mgr = await managerPage();
  const st0 = await mgr.eval(`window.api.invoke('manager:state')`);
  const desc0 = await mgr.eval(`window.api.invoke('manager:test', 'describe')`);
  const wa = desc0.workArea;
  const inner = { x: wa.x + 12, y: wa.y + 12, width: wa.width - 24, height: wa.height - 24 };
  check('manager: opens hidden in test mode and reads the state', st0 && st0.regions.length === 1 && st0.regions[0].count === N,
    { regions: st0 && st0.regions.length, count: st0 && st0.regions[0].count });
  check('manager: never shown (test hooks)', desc0.managerVisible === false, { managerVisible: desc0.managerVisible });
  const m0 = await mgr.eval(`window.api.invoke('manager:test', 'metrics')`);

  // Data file after migration
  await sleep(700);
  const d1 = readData();
  const pre = join(PROFILE, 'quicklauncher-data.pre-regions.json');
  check('migration: data file has one region and every item has its regionId',
    Array.isArray(d1.regions) && d1.regions.length === 1 && d1.apps.length === N && d1.apps.every((a) => a.regionId === d1.regions[0].id),
    { regions: d1.regions && d1.regions.length, apps: d1.apps.length });
  check('migration: item order and fields unchanged', JSON.stringify(d1.apps.map(({ id, name, path, iconDataUrl }) => ({ id, name, path, iconDataUrl }))) === JSON.stringify(seed.apps.map(({ id, name, path, iconDataUrl }) => ({ id, name, path, iconDataUrl }))));
  const keptSettings = Object.entries(seed.settings).every(([k, v]) => JSON.stringify(d1.settings[k]) === JSON.stringify(v));
  check('migration: every old setting kept', keptSettings);
  check('migration: pre-regions copy kept, byte-identical to the seed', existsSync(pre) && readFileSync(pre, 'utf8') === seedText);
  const s1 = seed.settings;
  if (s1.windowPosition && s1.windowSize) {
    const want = { x: s1.windowPosition.x, y: s1.windowPosition.y, width: s1.windowSize.width, height: s1.windowSize.height };
    check('migration: region 1 saved at today\'s window rect', JSON.stringify(d1.regions[0].rect) === JSON.stringify(want), { saved: d1.regions[0].rect, want });
  }

  // Create up to the cap
  const created = [];
  for (let i = 0; i < 7; i++) created.push(await mgr.eval(`window.api.invoke('manager:create-region', 'grid')`));
  const over = await mgr.eval(`window.api.invoke('manager:create-region', 'grid')`);
  check('create: 7 more Grid regions', created.every((c) => c && c.ok), created.map((c) => (c && c.ok ? 'ok' : c && c.error)));
  check('create: the 9th is refused with the spec string', over && !over.ok && over.error === '8 regions is the limit.', over);
  const ids = [r1id, ...created.filter((c) => c && c.ok).map((c) => c.id)];
  const sessions = {};
  for (const id of ids) sessions[id] = await pageFor(id);
  await sleep(1500);
  const desc = await mgr.eval(`window.api.invoke('manager:test', 'describe')`);
  const attached = desc.regions.filter((r) => r.host && r.host.mode === MODE && (FALLBACK ? !r.host.win.child && r.host.win.visible : r.host.win.child && r.host.win.z && r.host.win.z.above));
  check(FALLBACK ? 'several regions: all 8 are fallback top-level windows, shown' : 'several regions: all 8 on the desktop layer, in front of the icons', attached.length === 8,
    { attached: attached.length, parents: [...new Set(desc.regions.map((r) => r.host && r.host.win.parentClass))] });
  const shown = desc.regions.map((r) => r.shown);
  let clash = 0;
  for (let i = 0; i < shown.length; i++) for (let j = i + 1; j < shown.length; j++) if (tooClose(shown[i], shown[j])) clash++;
  const outside = shown.filter((r) => r.x < inner.x || r.y < inner.y || r.x + r.width > inner.x + inner.width || r.y + r.height > inner.y + inner.height).length;
  check('placement: no two regions closer than 12 px, all inside the margin', clash === 0 && outside === 0, { clash, outside });
  const names = await Promise.all(ids.map((id) => sessions[id].eval('document.title')));
  check('create: names are Region 1..7', JSON.stringify(names.slice(1)) === JSON.stringify(['Region 1', 'Region 2', 'Region 3', 'Region 4', 'Region 5', 'Region 6', 'Region 7']), names);
  const physOk = desc.regions.every((r) => r.host.win.rect && r.screenRect && r.host.win.rect.left === r.screenRect.left && r.host.win.rect.top === r.screenRect.top && r.host.win.rect.width === r.screenRect.right - r.screenRect.left);
  check('placement: each window sits at its computed screen rect (px)', physOk, desc.regions.slice(0, 2).map((r) => ({ want: r.screenRect, got: r.host.win.rect })));

  // Rename
  const [ , r2id, r3id ] = ids;
  const ren = await mgr.eval(`window.api.invoke('manager:update-region', ${JSON.stringify(r2id)}, { name: 'Games' })`);
  await sleep(300);
  const t2 = await sessions[r2id].eval('document.title');
  const dup = await mgr.eval(`window.api.invoke('manager:update-region', ${JSON.stringify(r3id)}, { name: 'games' })`);
  const empty = await mgr.eval(`window.api.invoke('manager:update-region', ${JSON.stringify(r3id)}, { name: '   ' })`);
  check('rename: Manager rename reaches the region header', ren.ok && t2 === 'Games', { ren, title: t2 });
  check('rename: duplicate and empty names refused with the spec strings', dup.error === 'That name is used.' && empty.error === 'Enter a name.', { dup: dup.error, empty: empty.error });
  const renPage = await sessions[r3id].eval(`window.api.invoke('region:rename', { name: 'Tools' })`);
  check('rename: from the region page (same channel the header field uses)', renPage && renPage.ok && renPage.name === 'Tools', renPage);

  // Themes per region and Match all
  const href = (id) => sessions[id].eval(`document.getElementById('theme-stylesheet').getAttribute('href')`);
  const r1Theme = (await href(r1id)).match(/themes\/(.+)\.css/)[1];
  const other = r1Theme === 'tron' ? 'alien' : 'tron';
  await mgr.eval(`window.api.invoke('manager:update-region', ${JSON.stringify(r2id)}, { theme: ${JSON.stringify(other)} })`);
  await sleep(600);
  check('theme: one region changes, the others keep theirs', (await href(r2id)).endsWith(`/${other}.css`) && (await href(r1id)).endsWith(`/${r1Theme}.css`), { r2: await href(r2id), r1: await href(r1id) });
  await mgr.eval(`window.api.invoke('manager:set-match-all', true)`);
  await sleep(800);
  const allHrefs = await Promise.all(ids.map(href));
  check('match all on: every region shows the primary region\'s theme', allHrefs.every((h) => h.endsWith(`/${r1Theme}.css`)), [...new Set(allHrefs)]);
  await mgr.eval(`window.api.invoke('manager:set-match-all', false)`);
  await sleep(800);
  check('match all off: each region returns to its own theme (Q2 revert)', (await href(r2id)).endsWith(`/${other}.css`) && (await href(r1id)).endsWith(`/${r1Theme}.css`));
  const rnd = await sessions[r3id].eval(`(async () => { const before = document.getElementById('theme-stylesheet').getAttribute('href'); document.getElementById('btn-random-theme').click(); await new Promise(r => setTimeout(r, 600)); return { before, after: document.getElementById('theme-stylesheet').getAttribute('href') }; })()`);
  await sleep(400);
  const d2 = readData();
  const r3rec = d2.regions.find((r) => r.id === r3id);
  check('random theme (⚄ in a region): that region only, saved to it', rnd.before !== rnd.after && rnd.after.endsWith(`/${r3rec.theme}.css`), rnd);

  // Move a shortcut between regions (the tile menu's Move to)
  const firstItem = d2.apps.find((a) => a.regionId === r1id);
  const mv = await mgr.eval(`window.api.invoke('manager:test', 'move-item', { itemId: ${JSON.stringify(firstItem.id)}, regionId: ${JSON.stringify(r2id)} })`);
  await sleep(500);
  const tilesR1 = await sessions[r1id].eval(`document.querySelectorAll('.app-tile').length`);
  const tilesR2 = await sessions[r2id].eval(`[...document.querySelectorAll('.app-tile')].map(t => t.dataset.id)`);
  const d3 = readData();
  check('move to: the tile leaves region 1 and lands in Games, both pages and the file agree',
    mv.ok && tilesR1 === N - 1 && tilesR2.length === 1 && tilesR2[0] === firstItem.id && d3.apps.find((a) => a.id === firstItem.id).regionId === r2id,
    { r1: tilesR1, r2: tilesR2.length });

  // Drag (script-driven move): toward region 1 stops at the gap; to the far right stops at the margin
  const desc1 = await mgr.eval(`window.api.invoke('manager:test', 'describe')`);
  const A = desc1.regions.find((r) => r.id === r1id).shown;
  const B = desc1.regions.find((r) => r.id === r2id).shown;
  const dragTo = async (dx, dy) => sessions[r2id].eval(`(async () => { await window.api.invoke('region:drag', { phase: 'start' }); const r = await window.api.invoke('region:drag', { phase: 'move', dx: ${dx}, dy: ${dy}, alt: true }); await window.api.invoke('region:drag', { phase: 'end' }); return r; })()`);
  const toA = await dragTo(A.x - B.x, A.y - B.y);
  const desc2 = await mgr.eval(`window.api.invoke('manager:test', 'describe')`);
  const B2 = desc2.regions.find((r) => r.id === r2id).shown;
  const othersB2 = desc2.regions.filter((r) => r.id !== r2id).map((r) => r.shown);
  check('drag: onto another region stops at the 12 px gap (bump, not push)', toA.blocked && !othersB2.some((o) => tooClose(B2, o)) && JSON.stringify(desc2.regions.find((r) => r.id === r1id).shown) === JSON.stringify(A),
    { blocked: toA.blocked, B2 });
  const far = await dragTo(100000, 0);
  const desc3 = await mgr.eval(`window.api.invoke('manager:test', 'describe')`);
  const B3 = desc3.regions.find((r) => r.id === r2id);
  const atEdge = B3.shown.x + B3.shown.width <= inner.x + inner.width && far.blocked;
  check('drag: never leaves the work area', atEdge, { right: B3.shown.x + B3.shown.width, limit: inner.x + inner.width });
  const pxOk = B3.host.win.rect.left === B3.screenRect.left && B3.host.win.rect.top === B3.screenRect.top;
  check('drag: the window really moved (GetWindowRect matches)', pxOk, { want: B3.screenRect, got: B3.host.win.rect });
  await sleep(700);
  const d4 = readData();
  check('drag: the new rect is saved after the drag ends', JSON.stringify(d4.regions.find((r) => r.id === r2id).rect) === JSON.stringify(B3.shown), { saved: d4.regions.find((r) => r.id === r2id).rect });

  // Resize (Grid, script-driven)
  const rs = (edges, dx, dy) => sessions[r2id].eval(`(async () => { await window.api.invoke('region:resize', { phase: 'start', edges: ${JSON.stringify(edges)} }); const r = await window.api.invoke('region:resize', { phase: 'move', dx: ${dx}, dy: ${dy}, alt: true }); await window.api.invoke('region:resize', { phase: 'end' }); return r; })()`);
  await rs({ right: true, bottom: true }, -5000, -5000);
  const desc4 = await mgr.eval(`window.api.invoke('manager:test', 'describe')`);
  const S = desc4.regions.find((r) => r.id === r2id);
  check('resize: Grid stops at its minimum 180 x 150', S.shown.width === 180 && S.shown.height === 150, S.shown);
  const vw = await sessions[r2id].eval(`[innerWidth, innerHeight]`);
  check('resize: the page sees panel + 6 px rim on each side', vw[0] === 192 && vw[1] === 162, vw);

  // Hide and show all
  await mgr.eval(`window.api.invoke('manager:test', 'toggle-all')`);
  await sleep(300);
  const hid = await mgr.eval(`window.api.invoke('manager:test', 'describe')`);
  await mgr.eval(`window.api.invoke('manager:test', 'toggle-all')`);
  await sleep(300);
  const shownAgain = await mgr.eval(`window.api.invoke('manager:test', 'describe')`);
  check('hide/show: all regions hide together and come back', hid.hidden && hid.regions.every((r) => !r.host.win.visible) && !shownAgain.hidden && shownAgain.regions.every((r) => r.host.win.visible),
    { hiddenVisible: hid.regions.filter((r) => r.host.win.visible).length, shownVisible: shownAgain.regions.filter((r) => r.host.win.visible).length });

  // Rebuild: the window dies (as with an Explorer restart) and comes back
  const t0 = Date.now();
  const r1Tiles = await sessions[r1id].eval(`document.querySelectorAll('.app-tile').length`);
  await sessions[r1id].eval(`setTimeout(() => window.close(), 10), true`).catch(() => {});
  pages.delete(sessions[r1id].t.id);
  const rb = await pageFor(r1id, { rebuilt: true, timeoutMs: 15000 });
  let rbState = null;
  for (let i = 0; i < 30; i++) {
    rbState = await rb.eval(`(async () => ({ tiles: document.querySelectorAll('.app-tile').length, noEntrance: document.body.classList.contains('no-entrance'), title: document.title, info: await window.api.invoke('region:info') }))()`);
    if (rbState.info && rbState.info.mode === MODE && rbState.tiles === r1Tiles) break;
    await sleep(200);
  }
  sessions[r1id] = rb; // the old page is gone
  check('rebuild: region 1 comes back with its tiles, name and no entrance fade', rbState.tiles === r1Tiles && rbState.noEntrance && rbState.title === 'QUICK.LAUNCH' && rbState.info.mode === MODE,
    { ms: Date.now() - t0, tiles: rbState.tiles, mode: rbState.info.mode });

  // Controls: tooltips (ProcessRules: a new control is born with its tooltip)
  const tips = await sessions[r2id].eval(`(() => {
    const t = (sel) => { const e = document.querySelector(sel); return e ? (e.getAttribute('title') || '') : null; };
    return { menu: t('#btn-region-menu'), random: t('#btn-random-theme'), settings: t('#btn-settings'), hide: t('#btn-hide'),
      handle: t('#header'), grip: t('#resize-grip'), fullscreen: !!document.getElementById('btn-fullscreen') };
  })()`);
  check('controls: region header has the spec tooltips, no fullscreen button',
    tips.menu === 'Region menu' && tips.random === 'Random theme for this region' && tips.settings === 'Settings'
    && tips.hide === 'Hide all regions to tray' && tips.handle === 'Drag to move' && tips.grip === 'Drag to resize' && !tips.fullscreen, tips);

  // Hit areas (spec 10): no two interactive rects intersect, in view and edit mode
  const hitScript = (edit) => `(async () => {
    if (${edit}) { enterEditMode(); await new Promise(r => setTimeout(r, 50)); }
    document.body.classList.add('pointer-inside');
    const els = [...document.querySelectorAll('#title-area, #header-controls button, .app-tile, #edit-bar button, #resize-grip, #filter-chip:not(.hidden)')]
      .filter(e => e.offsetParent !== null || e.id === 'resize-grip');
    const R = els.map(e => { const r = e.getBoundingClientRect(); return { n: e.id || e.className, r: [r.left, r.top, r.right, r.bottom] }; });
    const hit = [];
    for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
      const a = R[i].r, b = R[j].r;
      if (a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]) hit.push(R[i].n + ' x ' + R[j].n);
    }
    const badges = [...document.querySelectorAll('.btn-remove')].map(b => { const r = b.getBoundingClientRect(); return [r.width, r.height]; });
    document.body.classList.remove('pointer-inside');
    if (${edit}) exitEditMode();
    return { n: R.length, hit, badges };
  })()`;
  if (PROBE) {
    await sessions[r1id].eval(`document.getElementById('btn-settings').style.transform = 'translateX(-30px)'; setTimeout(() => { throw new Error('selftest probe'); }, 0); true`);
    await sleep(300);
  }
  const hv = await sessions[r1id].eval(hitScript(false)).catch((e) => ({ error: String(e) }));
  const he = await sessions[r1id].eval(hitScript(true)).catch((e) => ({ error: String(e) }));
  check('hit areas: no overlaps in the Grid region (view and edit mode, grip shown)',
    hv.hit && he.hit && hv.hit.length === 0 && he.hit.length === 0 && he.badges.every(([w, h]) => w >= 24 && h >= 24),
    { view: hv.hit || hv.error, edit: he.hit || he.error, controls: [hv.n, he.n] });

  // Manager page renders one row per region, fields filled, nothing overlapping
  const rowsInfo = await mgr.eval(`(() => {
    const rows = [...document.querySelectorAll('.mgr-region')];
    const hit = [];
    for (const row of rows) {
      const kids = [...row.children].map(c => c.getBoundingClientRect());
      for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
        const a = kids[i], b = kids[j];
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) hit.push(i + 'x' + j);
      }
    }
    return { rows: rows.length, names: rows.map(r => r.querySelector('.mgr-name').value),
      themes: rows.map(r => r.querySelector('.mgr-theme').value), hit,
      tips: rows.slice(0, 1).map(r => [...r.querySelectorAll('button, input, select')].map(e => e.getAttribute('title')))[0] };
  })()`);
  check('manager: one row per region with names and theme names, no overlaps, every control has a tooltip',
    rowsInfo.rows === 8 && rowsInfo.names[1] === 'Games' && rowsInfo.themes.every((t) => t && t.length) && rowsInfo.hit.length === 0 && rowsInfo.tips.every((t) => t && t.length),
    { rows: rowsInfo.rows, hit: rowsInfo.hit, tips: rowsInfo.tips });
  const lastRowDisabled = await mgr.eval(`document.querySelector('.mgr-region:last-child .mgr-delete').getAttribute('aria-disabled')`);
  check('manager: delete is enabled while more than one region exists', lastRowDisabled === 'false', lastRowDisabled);

  if (SHOTS) {
    mkdirSync(SHOTS, { recursive: true });
    const r1s = sessions[r1id];
    await r1s.shot(join(SHOTS, 'region1-view.png'));
    await r1s.eval(`enterEditMode(), true`);
    await sleep(150);
    await r1s.shot(join(SHOTS, 'region1-edit.png'));
    await r1s.eval(`exitEditMode(), true`);
    await sessions[r2id].shot(join(SHOTS, 'region2-small.png'));
    await mgr.shot(join(SHOTS, 'manager-regions.png'));
    await mgr.eval(`document.getElementById('tab-settings').click(), true`);
    await sleep(150);
    await mgr.shot(join(SHOTS, 'manager-settings.png'));
    await mgr.eval(`document.getElementById('tab-regions').click(), true`);
    console.log(`shots: ${SHOTS}`);
  }

  // ── M2: between regions, tile keys, display change and resume ────────────
  await m2Checks({ mgr, sessions, ids, r1id, r2id, r3id, wa, inner });
  // ── M2b: Judy's six rulings, activation, the drop to fallback ─────────────
  await m2bChecks({ mgr, sessions, ids, wa, inner });
  // ── M3: desktop files move in (fake desktop only) ───────────────────────────
  await m3Checks({ mgr, sessions, ids });
  // ── M3 fix pass (fake desktop only) and the region tagline ─────────────────
  await fixChecks({ mgr, sessions, ids });
  if (SHOTS) {
    await sessions[ids[1]].shot(join(SHOTS, 'm3-region-broken.png')).catch(() => {});
    await mgr.shot(join(SHOTS, 'm3-manager-moved.png')).catch(() => {});
  }

  // Delete an empty region (no confirm box for an empty region)
  const lastId = ids[ids.length - 1];
  const before = (await mgr.eval(`window.api.invoke('manager:state')`)).regions.length;
  const del = await mgr.eval(`window.api.invoke('manager:delete-region', ${JSON.stringify(lastId)})`);
  const tDel = Date.now();
  let gone = false;
  while (!gone && Date.now() - tDel < 5000) {
    gone = !(await regionPages()).some((t) => regionId(t) === lastId);
    if (!gone) await sleep(200);
  }
  const stAfter = await mgr.eval(`window.api.invoke('manager:state')`);
  const live = stAfter.regions.length;
  check('delete: an empty region goes at once, its window too', del.ok && live === before - 1 && gone, { del, regions: `${before} -> ${live}`, windowGone: gone, ms: Date.now() - tDel });
  // Exactly one page per region: no window was ever built twice for a region.
  const perRegion = {};
  for (const t of await regionPages()) { const id = regionId(t); perRegion[id] = (perRegion[id] || 0) + 1; }
  const doubles = Object.values(perRegion).filter((v) => v > 1).length;
  check('pages: exactly one page per live region', doubles === 0 && Object.keys(perRegion).length === live, perRegion);

  // Idle cost with the regions left (pointer outside, nothing focused)
  await sleep(12000);
  const m1 = await mgr.eval(`window.api.invoke('manager:test', 'metrics')`);
  console.log(`metrics  1 region at boot: ${JSON.stringify(m0)}`);
  console.log(`metrics  ${m1.regions} regions idle: ${JSON.stringify(m1)}`);
  check(`idle: ${live} regions measured (memory and CPU recorded)`, m1.regions === live && m1.workingSetMB > 0, { MB: m1.workingSetMB, cpu: m1.cpuPercent, procs: m1.processes });

  // Quit through the same path as the tray's Quit
  await mgr.eval(`window.api.invoke('manager:test', 'quit')`).catch(() => {});
}

// Page-side drag and key helpers (DOM events inside the page; no OS input).
const SIM_SOURCE = `window.__qlSim = window.__qlSim || (() => {
    const fire = (type, x, y, el) => (el || document).dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, button: 0, buttons: type === 'mouseup' ? 0 : 1, bubbles: true, cancelable: true, view: window }));
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const tiles = () => [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')];
    return {
      press(index) { const t = tiles()[index]; if (!t) return null; const r = t.getBoundingClientRect(); this.x = r.left + r.width / 2; this.y = r.top + r.height / 2; fire('mousedown', this.x, this.y, t); this.x += 8; this.y += 8; fire('mousemove', this.x, this.y); return t.dataset.id; },
      async moveTo(x, y, steps = 6) { const x0 = this.x, y0 = this.y; for (let i = 1; i <= steps; i++) { this.x = x0 + (x - x0) * i / steps; this.y = y0 + (y - y0) * i / steps; fire('mousemove', this.x, this.y); await wait(30); } },
      release() { fire('mouseup', this.x, this.y); return true; },
      order() { return tiles().map((t) => t.dataset.id); },
      key(key, mods = {}) { const el = document.activeElement || document.body; el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...mods })); return document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id || null : null; },
      focusTile(index) { const t = tiles()[index]; if (t) t.focus(); return !!t && document.activeElement === t; },
    };
  })(); true`;

// ── M2 checks ───────────────────────────────────────────────────────────────
// Tile drags are DOM mouse events dispatched inside the source page (the same
// listeners a real drag reaches; no OS input). The main process relays them
// to the target page for real. Menus and launches are recorded by the app's
// --ql-test-hooks instead of being shown or run. The display is never
// changed: a stand-in work area runs the app's real display-change handler.
// --probe adds 9 faults or wrong inputs here; exactly those 9 checks must fail.
async function m2Checks({ mgr, sessions, ids, r1id, r2id, r3id, wa, inner }) {
  const T = (op, arg = {}) => mgr.eval(`window.api.invoke('manager:test', ${JSON.stringify(op)}, ${JSON.stringify(arg)})`);
  const desc = () => T('describe');
  const reg = (d, id) => d.regions.find((r) => r.id === id);
  const PREVIEW = `(() => { const s = document.querySelector('#app-grid .drop-slot'); const r = s && s.getBoundingClientRect();
    const all = [...document.querySelectorAll('#app-grid .app-tile')];
    return { slot: !!s, slotW: r ? Math.round(r.width) : 0, slotH: r ? Math.round(r.height) : 0, slotIndex: s ? all.indexOf(s) : -1,
      ghost: !!document.querySelector('body > .drag-ghost'), valid: document.body.classList.contains('tile-drop-valid'),
      rejected: document.body.classList.contains('tile-drop-rejected'), banner: document.getElementById('theme-banner-text').textContent,
      border: getComputedStyle(document.getElementById('app'), '::before').borderTopWidth }; })()`;
  const page = (id) => sessions[id];
  for (const id of [r1id, r2id, r3id]) await page(id).eval(SIM_SOURCE);
  const order = (id) => page(id).eval('__qlSim.order()');
  const toPage = (d, srcId, p) => { const w = reg(d, srcId).windowDip; return { x: p.x - w.x, y: p.y - w.y }; };
  // Slots, tile copies and drop outlines left in any region page (the drag's source excepted, for mid-drag reads).
  const leftovers = async (exceptId = null) => {
    let n = 0;
    for (const id of ids) {
      const s = sessions[id];
      if (!s || id === exceptId) continue;
      n += await s.eval(`document.querySelectorAll('#app-grid .drop-slot, body > .drag-ghost').length + (document.body.classList.contains('tile-drop-valid') || document.body.classList.contains('tile-drop-rejected') ? 1 : 0)`).catch(() => 0);
    }
    return n;
  };
  const dataIds = (id) => readData().apps.filter((a) => a.regionId === id).map((a) => a.id);
  // A desktop point at least 40 px from every region panel.
  const emptyPoint = (d) => {
    const panels = d.regions.map((r) => r.shown);
    for (let y = inner.y + 40; y < inner.y + inner.height - 40; y += 24) {
      for (let x = inner.x + 40; x < inner.x + inner.width - 40; x += 24) {
        if (panels.every((r) => x < r.x - 40 || x > r.x + r.width + 40 || y < r.y - 40 || y > r.y + r.height + 40)) return { x, y };
      }
    }
    return null;
  };
  const launches0 = (await T('launches')).launches.length;

  // A. Drag a tile from region 1 onto Tools: slot, copy of the tile, outline; then drop.
  let d = await desc();
  const P3 = reg(d, r3id).shown;
  const intoR3 = { x: P3.x + 60, y: P3.y + 100 };
  const before1 = await order(r1id);
  const dragged = await page(r1id).eval('__qlSim.press(0)');
  let p = toPage(d, r1id, intoR3);
  await page(r1id).eval(`__qlSim.moveTo(${p.x}, ${p.y})`);
  await sleep(250);
  // (CSSOM, not a <style> element: the page's CSP blocks inline style sheets.)
  if (PROBE) await page(r3id).eval(`(() => { const s = document.querySelector('#app-grid .drop-slot'); if (s) s.style.setProperty('display', 'none', 'important'); return true; })()`);
  const pv = await page(r3id).eval(PREVIEW);
  if (PROBE) await page(r3id).eval(`(() => { const s = document.querySelector('#app-grid .drop-slot'); if (s) s.style.removeProperty('display'); return true; })()`);
  const src1 = await page(r1id).eval(`({ ghost: !!document.querySelector('body > .drag-ghost'), placeholder: (() => { const t = document.querySelector('.tile-drag-source'); return t ? [...document.querySelectorAll('#app-grid .app-tile')].indexOf(t) : -1; })() })`);
  check('drag between regions: the target shows the slot, a copy of the tile and the 2 px outline; the source keeps its placeholder',
    pv.slot && pv.slotW > 20 && pv.slotH > 20 && pv.slotIndex === 0 && pv.ghost && pv.valid && pv.border === '2px' && src1.placeholder === 0,
    { target: pv, source: src1 });
  await page(r1id).eval('__qlSim.release()');
  await sleep(700);
  const after1 = await order(r1id);
  const after3 = await order(r3id);
  check('drag between regions: the drop moves the item; both pages and the data file agree; nothing left on screen',
    after3.length === 1 && after3[0] === dragged && !after1.includes(dragged) && after1.length === before1.length - 1
    && JSON.stringify(dataIds(r3id)) === JSON.stringify(after3) && JSON.stringify(dataIds(r1id)) === JSON.stringify(after1) && (await leftovers()) === 0,
    { r1: after1.length, r3: after3, dragged });

  // B. The slot decides the place: the left half of Tools' first tile = first place.
  d = await desc();
  const firstRect = await page(r3id).eval(`(() => { const r = document.querySelector('#app-grid .app-tile').getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; })()`);
  const W3 = reg(d, r3id).windowDip;
  const leftHalf = { x: W3.x + firstRect.left + (PROBE ? firstRect.width - 8 : 8), y: W3.y + firstRect.top + firstRect.height / 2 };
  const dragged2 = await page(r1id).eval('__qlSim.press(0)');
  p = toPage(d, r1id, leftHalf);
  await page(r1id).eval(`__qlSim.moveTo(${p.x}, ${p.y})`);
  await sleep(250);
  const pv2 = await page(r3id).eval(PREVIEW);
  await page(r1id).eval('__qlSim.release()');
  await sleep(700);
  const after3b = await order(r3id);
  check('drag between regions: dropped on the left half of the first tile, it takes the first place',
    after3b.length === 2 && after3b[0] === dragged2 && after3b[1] === dragged && pv2.slotIndex === 0 && JSON.stringify(dataIds(r3id)) === JSON.stringify(after3b),
    { slotIndex: pv2.slotIndex, r3: after3b });

  // C. Released on empty desktop: cancelled (from Tools; the probe releases on region 1 instead).
  d = await desc();
  const empty = emptyPoint(d);
  const before3c = await order(r3id);
  const before1c = await order(r1id);
  const appsBefore = JSON.stringify(readData().apps);
  await page(r3id).eval('__qlSim.press(0)');
  const P1 = reg(d, r1id).shown;
  p = toPage(d, r3id, PROBE ? { x: P1.x + 60, y: P1.y + 100 } : (empty || { x: -99999, y: -99999 }));
  await page(r3id).eval(`__qlSim.moveTo(${p.x}, ${p.y})`);
  await sleep(200);
  const midC = await leftovers(r3id);
  await page(r3id).eval('__qlSim.release()');
  await sleep(700);
  check('drag between regions: released on empty desktop it is cancelled; the tile stays, nothing is saved',
    !!empty && midC === 0 && JSON.stringify(await order(r3id)) === JSON.stringify(before3c) && JSON.stringify(await order(r1id)) === JSON.stringify(before1c)
    && JSON.stringify(readData().apps) === appsBefore && (await leftovers()) === 0,
    { point: empty, previewWhileOverDesktop: midC });

  // D. Released 3 px outside region 1's visible box (its invisible rim): cancelled too.
  d = await desc();
  const P1d = reg(d, r1id).shown;
  const W3d = reg(d, r3id).windowDip;
  const rimPoint = { x: P1d.x - 3, y: P1d.y + 60 };
  const rimInsideSource = rimPoint.x >= W3d.x && rimPoint.x < W3d.x + W3d.width && rimPoint.y >= W3d.y && rimPoint.y < W3d.y + W3d.height;
  const before3d = await order(r3id);
  await page(r3id).eval('__qlSim.press(0)');
  p = toPage(d, r3id, rimPoint);
  await page(r3id).eval(`__qlSim.moveTo(${p.x}, ${p.y})`);
  await sleep(200);
  await page(r3id).eval('__qlSim.release()');
  await sleep(700);
  check('drag between regions: released on a region\'s invisible rim (outside its box) it is cancelled',
    !rimInsideSource && JSON.stringify(await order(r3id)) === JSON.stringify(before3d) && (await leftovers()) === 0, { rimPoint, rimInsideSource });

  // E. A full region refuses: rejected outline and FULL text, release cancels, Move to lists it disabled.
  const cnt1 = (await order(r1id)).length;
  if (!PROBE) await T('set-cap', { regionId: r1id, cap: cnt1 });
  d = await desc();
  const before3e = await order(r3id);
  await page(r3id).eval('__qlSim.press(0)');
  p = toPage(d, r3id, { x: reg(d, r1id).shown.x + 60, y: reg(d, r1id).shown.y + 100 });
  await page(r3id).eval(`__qlSim.moveTo(${p.x}, ${p.y})`);
  await sleep(250);
  const pvE = await page(r1id).eval(PREVIEW);
  await page(r3id).eval('__qlSim.release()');
  await sleep(700);
  const after3e = await order(r3id);
  check('full region: the rejected outline and "FULL (n max)" show, no slot; the release changes nothing',
    pvE.rejected && !pvE.slot && pvE.banner === `FULL (${cnt1} max)` && pvE.border === '2px' && JSON.stringify(after3e) === JSON.stringify(before3e)
    && (await order(r1id)).length === cnt1 && (await leftovers()) === 0,
    { preview: { rejected: pvE.rejected, slot: pvE.slot, banner: pvE.banner }, r3: after3e.length });
  await page(r3id).eval(`enterEditMode(), __qlSim.focusTile(0)`);
  const menusE0 = (await T('menus')).menus.length;
  await page(r3id).eval(`__qlSim.key('ContextMenu')`);
  await sleep(200);
  const menusE = (await T('menus')).menus;
  const tileMenuE = menusE.length > menusE0 ? menusE[menusE.length - 1] : null;
  const moveToE = tileMenuE && tileMenuE.items.find((i) => i.label === 'Move to');
  const r1Name = await page(r1id).eval('document.title');
  const fullEntry = moveToE && moveToE.submenu.find((s) => s.label === r1Name);
  check('full region: the tile menu\'s Move to lists it disabled', !!fullEntry && fullEntry.enabled === false && moveToE.submenu.some((s) => s.enabled), moveToE && moveToE.submenu);
  await T('set-cap', { regionId: r1id, cap: null });
  await page(r3id).eval(`exitEditMode(), true`);
  await sleep(900);

  // F. Tile keys in edit mode (region 1): Ctrl+Arrow, Delete, Menu key / Shift+F10.
  const k0 = await order(r1id);
  if (!PROBE) await page(r1id).eval(`enterEditMode(), true`);
  await page(r1id).eval(`__qlSim.focusTile(0)`);
  const focusedAfter = await page(r1id).eval(`__qlSim.key('ArrowRight', { ctrlKey: true })`);
  await sleep(400);
  const k1 = await order(r1id);
  check('Ctrl+Arrow (edit mode): the focused tile moves one place later, keeps focus, and is saved',
    k0.length >= 2 && k1[0] === k0[1] && k1[1] === k0[0] && focusedAfter === k0[0] && JSON.stringify(dataIds(r1id)) === JSON.stringify(k1), { before: k0.slice(0, 3), after: k1.slice(0, 3), focus: focusedAfter });
  if (PROBE) await page(r1id).eval(`enterEditMode(), true`);
  await page(r1id).eval(`(() => { const t = [...document.querySelectorAll('#app-grid .app-tile')].find((x) => x.dataset.id === ${JSON.stringify(k0[0])}); t.focus(); return true; })()`);
  await page(r1id).eval(`__qlSim.key('ArrowLeft', { ctrlKey: true })`);
  await sleep(300);
  await page(r1id).eval(`__qlSim.focusTile(0), __qlSim.key('ArrowLeft', { ctrlKey: true })`);
  await sleep(300);
  check('Ctrl+Arrow: back again restores the order; at the first place it does nothing', JSON.stringify(await order(r1id)) === JSON.stringify(k0), await order(r1id));

  const menus0 = (await T('menus')).menus.length;
  await page(r1id).eval(`__qlSim.focusTile(0), __qlSim.key('ContextMenu')`);
  if (PROBE) await sleep(900);
  await page(r1id).eval(`(() => { const t = document.activeElement; t.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })); return true; })()`);
  await sleep(200);
  const menus1 = (await T('menus')).menus;
  const newMenus = menus1.slice(menus0);
  check('Menu key (edit mode): one tile menu for the focused tile (the contextmenu Chromium sends after it is skipped)',
    newMenus.length === 1 && newMenus[0].kind === 'tile' && newMenus[0].itemId === k0[0], newMenus.map((m) => ({ kind: m.kind, item: m.itemId })));
  await sleep(900);
  await page(r1id).eval(`(() => { const t = document.activeElement; t.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })); return true; })()`);
  await page(r1id).eval(`__qlSim.focusTile(0), __qlSim.key('F10', { shiftKey: true })`);
  await sleep(200);
  const menus2 = (await T('menus')).menus.slice(menus1.length);
  check('right-click after that window and Shift+F10 each open the tile menu', menus2.length === 2 && menus2.every((m) => m.kind === 'tile'), menus2.map((m) => m.kind));
  // Move to, through the recorded menu's real click handler: Tools.
  const last = menus2[menus2.length - 1];
  const moveIdx = last ? last.items.findIndex((i) => i.label === 'Move to') : -1;
  const toolsName = await page(r3id).eval('document.title');
  const toolsIdx = moveIdx >= 0 ? last.items[moveIdx].submenu.findIndex((s) => s.label === toolsName) : -1;
  const clicked = await T('menu-click', { path: [moveIdx, toolsIdx] });
  await sleep(500);
  check('tile menu Move to > Tools moves the tile to the end of Tools', clicked.ok && (await order(r3id)).slice(-1)[0] === k0[0] && !(await order(r1id)).includes(k0[0]), clicked);
  const kd = await order(r1id);
  await page(r1id).eval(`__qlSim.focusTile(0)`);
  const focusAfterDelete = await page(r1id).eval(`(async () => { __qlSim.key('Delete'); await new Promise((r) => setTimeout(r, 400)); return document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id || null : null; })()`);
  const kd2 = await order(r1id);
  check('Delete (edit mode): the focused tile is removed and focus goes to the tile now in its place',
    kd.length >= 1 && kd2.length === kd.length - 1 && !kd2.includes(kd[0]) && (kd2.length === 0 || focusAfterDelete === kd2[0]) && JSON.stringify(dataIds(r1id)) === JSON.stringify(kd2), { before: kd.length, after: kd2.length, focus: focusAfterDelete });
  await page(r1id).eval(`exitEditMode(), true`);
  const v0 = await order(r3id);
  await page(r3id).eval(`__qlSim.focusTile(0), __qlSim.key('ArrowRight', { ctrlKey: true })`);
  await sleep(300);
  check('Ctrl+Arrow outside edit mode does not reorder', JSON.stringify(await order(r3id)) === JSON.stringify(v0));

  // G. Display change through a stand-in work area (the display is not touched).
  const savedRegions = () => JSON.stringify(readData().regions.map((r) => ({ id: r.id, rect: r.rect, home: r.home })));
  const atRects = (dd) => dd.regions.every((r) => r.host.win.rect && r.host.win.rect.left === r.screenRect.left && r.host.win.rect.top === r.screenRect.top
    && r.host.win.rect.width === r.screenRect.right - r.screenRect.left && r.host.win.rect.height === r.screenRect.bottom - r.screenRect.top);
  const insideOf = (dd, area) => dd.regions.filter((r) => { const s = r.shown; return s.x < area.x || s.y < area.y || s.x + s.width > area.x + area.width || s.y + s.height > area.y + area.height; }).length;
  const clashes = (dd) => { const s = dd.regions.map((r) => r.shown); let n = 0; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (tooClose(s[i], s[j])) n++; return n; };
  await sleep(600);
  const saved0 = savedRegions();
  const roomy = { x: wa.x, y: wa.y, width: Math.min(wa.width, 2400), height: Math.min(wa.height, 1000) };
  await T('set-work-area', { rect: roomy });
  await sleep(700);
  let dg = await desc();
  const roomyInner = { x: roomy.x + 12, y: roomy.y + 12, width: roomy.width - 24, height: roomy.height - 24 };
  check('display change (stand-in 2400 x 1000): every region fits inside with the 12 px gap, windows really moved',
    insideOf(dg, roomyInner) === 0 && clashes(dg) === 0 && atRects(dg), { outside: insideOf(dg, roomyInner), clashes: clashes(dg), atRects: atRects(dg) });
  const tiny = { x: wa.x, y: wa.y, width: 800, height: 600 };
  await T('set-work-area', { rect: tiny });
  await sleep(700);
  // Probe: a user action (Place, from the region menu) while on the small display does save.
  if (PROBE) { await T('place', { regionId: r2id, where: 'top-left' }); await sleep(700); }
  dg = await desc();
  const tinyInner = { x: tiny.x + 12, y: tiny.y + 12, width: tiny.width - 24, height: tiny.height - 24 };
  await sleep(500);
  check('display change (stand-in 800 x 600): all 8 regions inside and apart (Grids shrink), saved layout untouched',
    insideOf(dg, tinyInner) === 0 && clashes(dg) === 0 && atRects(dg) && savedRegions() === saved0, { outside: insideOf(dg, tinyInner), clashes: clashes(dg), savedUnchanged: savedRegions() === saved0 });
  await T('set-work-area', { rect: null });
  await sleep(700);
  dg = await desc();
  const back = dg.regions.every((r) => JSON.stringify(r.shown) === JSON.stringify(r.saved));
  check('display back: every region returns to its saved place exactly (home-layout rule)', back && atRects(dg),
    dg.regions.filter((r) => JSON.stringify(r.shown) !== JSON.stringify(r.saved)).map((r) => ({ shown: r.shown, saved: r.saved })));

  // A move that ends inside the 400 ms save debounce keeps the user's rect when the display changes.
  dg = await desc();
  const S3 = reg(dg, r3id).shown;
  const dy = S3.y + S3.height + 32 + 12 <= inner.y + inner.height ? 32 : -32;
  await sessions[r3id].eval(`window.api.invoke('region:nudge', { dx: 0, dy: ${dy} })`);
  const chosen = reg(await desc(), r3id).pendingSave;
  await T('set-work-area', { rect: tiny });
  await sleep(900);
  const rec3 = readData().regions.find((r) => r.id === r3id);
  await T('set-work-area', { rect: null });
  await sleep(700);
  const back3 = reg(await desc(), r3id);
  check('a move saved during a display change keeps the rect and work area it was made on',
    !!chosen && JSON.stringify(rec3.rect) === JSON.stringify(chosen.rect) && JSON.stringify(rec3.home) === JSON.stringify({ x: wa.x, y: wa.y, width: wa.width, height: wa.height })
    && JSON.stringify(back3.shown) === JSON.stringify(chosen.rect), { chosen: chosen && chosen.rect, saved: rec3.rect, home: rec3.home });

  // Resume re-applies every window, even one whose rect did not change.
  await T('displace', { regionId: r2id, dx: 40, dy: 0 });
  await sleep(150);
  const moved = reg(await desc(), r2id);
  const displaced = moved.host.win.rect.left !== moved.screenRect.left;
  if (!PROBE) await T('resume');
  await sleep(1600);
  dg = await desc();
  check('resume: every window is put back at its computed rect (one was displaced on purpose)', displaced && atRects(dg), { displaced, r2: { got: reg(dg, r2id).host.win.rect, want: reg(dg, r2id).screenRect } });
  if (PROBE) { await T('resume'); await sleep(1600); }

  // A drag in flight stops on a display change: tile drag (preview cleared) and region move.
  d = await desc();
  await page(r3id).eval('__qlSim.press(0)');
  p = toPage(d, r3id, { x: reg(d, r1id).shown.x + 60, y: reg(d, r1id).shown.y + 100 });
  await page(r3id).eval(`__qlSim.moveTo(${p.x}, ${p.y})`);
  await sleep(250);
  const midG = await page(r1id).eval(PREVIEW);
  await sessions[r2id].eval(`(async () => { await window.api.invoke('region:drag', { phase: 'start' }); return window.api.invoke('region:drag', { phase: 'move', dx: -10, dy: 0, alt: true }); })()`);
  if (!PROBE) await T('set-work-area', { rect: roomy });
  await sleep(700);
  const afterG = await page(r1id).eval(PREVIEW);
  const srcG = await page(r3id).eval(`({ reorder: reorderState === null, ghost: !!document.querySelector('body > .drag-ghost') })`);
  const regionMove = await sessions[r2id].eval(`window.api.invoke('region:drag', { phase: 'move', dx: -30, dy: 0, alt: true })`);
  const dragState = (await T('tile-drag')).drag;
  check('a display change stops drags in flight: the tile preview clears, the source drops its drag, a region move stops',
    midG.slot && !afterG.slot && !afterG.ghost && !afterG.valid && srcG.reorder && !srcG.ghost && dragState === null && regionMove && regionMove.ok === false,
    { previewBefore: midG.slot, previewAfter: afterG.slot, source: srcG, regionMove, dragState });
  await page(r3id).eval('__qlSim.release()');
  await sessions[r2id].eval(`window.api.invoke('region:drag', { phase: 'end' })`);
  await T('set-work-area', { rect: null });
  await sleep(700);

  // No drag launched anything; a plain click is recorded (positive control of the launch log).
  const launchesDrag = (await T('launches')).launches.length - launches0;
  for (const id of [r2id, r3id, r1id]) {
    if (await page(id).eval(`(() => { const t = document.querySelector('#app-grid .app-tile'); if (t) t.click(); return !!t; })()`)) break;
  }
  await sleep(300);
  const launchesClick = (await T('launches')).launches.length - launches0;
  check('no drag launched an app; a plain click is recorded (test hooks never run it)', launchesDrag === 0 && launchesClick === 1, { duringDrags: launchesDrag, afterClick: launchesClick });
  check('the last region is still empty (the delete check below must not need a confirm box)', dataIds(ids[ids.length - 1]).length === 0);
}

// ── M2b checks (UX spec "Addendum — M2 rulings", Futaba measures 1 to 6; the
// fallback-focus block). Same means as m2Checks: DOM events inside a page,
// recorded menus, test hooks; no OS input. Region 6 gets 12 tiles saved
// through its own page (fake paths; test hooks never launch). --probe adds 8
// faults or wrong inputs here; each named check must then fail.
async function m2bChecks({ mgr, sessions, ids, wa, inner }) {
  const T = (op, arg = {}) => mgr.eval(`window.api.invoke('manager:test', ${JSON.stringify(op)}, ${JSON.stringify(arg)})`);
  const desc = () => T('describe');
  const reg = (d, id) => d.regions.find((r) => r.id === id);
  const page = (id) => sessions[id];
  const rT = ids[6]; // 12 tiles
  const rE = ids[5]; // stays empty
  const rS = ids[3]; // the drag source, with 3 tiles of its own (the M2 probes can empty Tools)
  const toPage = (d, srcId, p) => { const w = reg(d, srcId).windowDip; return { x: p.x - w.x, y: p.y - w.y }; };
  const REC = `window.__qlRec = window.__qlRec || (() => {
    // Counts only animations the slot's removal itself created: everything present at take() is marked
    // seen (a covered fallback window does not advance its clock, so older ones can stay 'running').
    const log = [];
    const seen = new WeakSet();
    const plain = (el) => el.getAnimations().filter((a) => a.constructor.name === 'Animation' && a.playState === 'running').length;
    const fresh = (el) => el.getAnimations().filter((a) => a.constructor.name === 'Animation' && a.playState === 'running' && !seen.has(a)).length;
    new MutationObserver((ms) => { for (const m of ms) for (const n of m.removedNodes) {
      if (n.classList && n.classList.contains('drop-slot') && !n.isConnected) log.push([...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')].filter((t) => fresh(t) > 0).length);
    } }).observe(document.getElementById('app-grid'), { childList: true });
    return { take() { const out = log.splice(0); document.getAnimations().forEach((a) => seen.add(a)); return out; }, plain };
  })(); true`;
  for (const id of [rT, rE, rS]) { await page(id).eval(SIM_SOURCE); await page(id).eval(REC); }
  const resolved = (id, token) => page(id).eval(`(() => { const e = document.createElement('div'); e.style.color = 'var(${token})'; document.body.appendChild(e); const c = getComputedStyle(e).color; e.remove(); return c; })()`);
  const setTheme = async (id, theme, accentC) => {
    await mgr.eval(`window.api.invoke('manager:update-region', ${JSON.stringify(id)}, { theme: ${JSON.stringify(theme)} })`);
    for (let i = 0; i < 40; i++) {
      if (await page(id).eval(`getComputedStyle(document.documentElement).getPropertyValue('--accent-c').trim().toLowerCase() === ${JSON.stringify(accentC)}`)) return true;
      await sleep(150);
    }
    return false;
  };
  // 12 tiles in region 6, saved through its page (ALPHA / BETA names for the filter case).
  await page(rT).eval(`(async () => { apps = Array.from({ length: 12 }, (_, i) => ({ id: 'm2b-' + i, name: (i % 2 ? 'BETA ' : 'ALPHA ') + i, path: 'C:\\\\m2b\\\\t' + i + '.exe', iconDataUrl: '' })); renderGrid(); await saveApps(); return true; })()`);
  await sleep(300);
  await page(rS).eval(`(async () => { apps = Array.from({ length: 3 }, (_, i) => ({ id: 'src-' + i, name: 'SOURCE ' + i, path: 'C:\\\\m2b\\\\s' + i + '.exe', iconDataUrl: '' })); renderGrid(); await saveApps(); return true; })()`);
  await sleep(300);
  const OS_REDUCED = await page(rT).eval(`matchMedia('(prefers-reduced-motion: reduce)').matches`);

  // Hover from region 3 (rS) over a tile of the target, measure, then leave to empty desktop and let go.
  const hoverOverTile = async (targetId, tileIndex, measure, probeFn = null) => {
    const d = await desc();
    const r = await page(targetId).eval(`(() => { const t = [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')][${tileIndex}]; if (!t) return null; const b = t.getBoundingClientRect(); return { x: b.left + 10, y: b.top + b.height / 2 }; })()`);
    const W = reg(d, targetId).windowDip;
    const over = r ? { x: W.x + r.x, y: W.y + r.y } : { x: reg(d, targetId).shown.x + 60, y: reg(d, targetId).shown.y + 100 };
    await page(rS).eval('__qlSim.press(0)');
    let p = toPage(d, rS, over);
    await page(rS).eval(`__qlSim.moveTo(${p.x}, ${p.y})`);
    await sleep(300);
    // A probe waits out the tile's 120 ms border-color transition (it outranks even inline !important).
    if (probeFn) { await probeFn(); await sleep(250); }
    const m = await measure();
    const empty = emptyDesktopPoint(d, inner);
    p = toPage(d, rS, empty);
    await page(targetId).eval('__qlRec.take(), true');
    await page(rS).eval(`__qlSim.moveTo(${p.x}, ${p.y}, 3)`);
    await sleep(350);
    const afterLeave = await page(targetId).eval(`({ anim: __qlRec.take(), hint: getComputedStyle(document.getElementById('drop-hint')).display, slot: !!document.querySelector('#app-grid .drop-slot') })`);
    await page(rS).eval('__qlSim.release()');
    await sleep(400);
    return { m, afterLeave };
  };
  const SLOT = (id) => page(id).eval(`(() => { const s = document.querySelector('#app-grid .drop-slot'); const t = [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')][0];
    const g = document.querySelector('body > .drag-ghost');
    return s ? { probe: s.dataset.probe || null, slots: document.querySelectorAll('#app-grid .drop-slot').length, color: getComputedStyle(s).borderTopColor, style: getComputedStyle(s).borderTopStyle, width: getComputedStyle(s).borderTopWidth, h: s.offsetHeight, tileH: t ? t.offsetHeight : -1,
      ghostOpacity: g ? getComputedStyle(g).opacity : null, ghostTransform: g ? getComputedStyle(g).transform : null } : null; })()`);

  // 1 + 3. Slot colour and height (twin-peaks and the default theme, view and edit mode); the copy.
  const slotRuns = [];
  let ghost = null;
  let probeInfo = null;
  for (const [theme, accentC] of [['twin-peaks', '#880000'], ['cyberpunk', '#00f0ff']]) {
    const loaded = await setTheme(rT, theme, accentC);
    const want = await resolved(rT, '--accent-text');
    const accent = await resolved(rT, '--accent-c');
    for (const edit of [false, true]) {
      await page(rT).eval(edit ? 'enterEditMode(), true' : 'exitEditMode(), true');
      const probeColour = PROBE && theme === 'twin-peaks' && !edit
        // Probe: the slot drawn in M2's --accent-c (the token it uses is pointed at --accent-c on the slot itself).
        ? () => page(rT).eval(`(() => { const s = document.querySelector('#app-grid .drop-slot'); if (s) { s.style.setProperty('--accent-text', 'var(--accent-c)'); s.dataset.probe = '1'; } return { found: !!s, count: document.querySelectorAll('#app-grid .drop-slot').length, after: s ? getComputedStyle(s).borderTopColor : null }; })()`) : null;
      const probeGhost = PROBE && theme === 'twin-peaks' && !edit
        ? async () => { probeInfo = await probeColour(); await page(rT).eval(`(() => { const g = document.querySelector('body > .drag-ghost'); if (g) g.style.setProperty('opacity', '0.6', 'important'); return true; })()`); } : null;
      const { m } = await hoverOverTile(rT, 1, async () => {
        const s = await SLOT(rT);
        const src = await page(rS).eval(`(() => { const g = document.querySelector('body > .drag-ghost'); return g ? getComputedStyle(g).transform : null; })()`);
        return { ...s, srcTransform: src };
      }, probeGhost);
      slotRuns.push({ theme, edit, loaded, want, accentDiffers: accent !== want, ...m });
      if (!ghost && m) ghost = m;
    }
    await page(rT).eval('exitEditMode(), true');
  }
  check('slot (A1): 2 px dashed --accent-text in twin-peaks and cyberpunk; its height equals a tile\'s in view and edit mode',
    slotRuns.length === 4 && slotRuns.every((r) => r.loaded && r.color === r.want && r.style === 'dashed' && r.width === '2px' && r.h === r.tileH) && slotRuns.some((r) => r.theme === 'twin-peaks' && r.accentDiffers),
    { runs: slotRuns.map((r) => ({ theme: r.theme, edit: r.edit, color: r.color, want: r.want, h: r.h, tileH: r.tileH, probe: r.probe, slots: r.slots })), probeInfo });
  check('copy (A3): the target\'s copy has opacity 0.93 and the same transform as the source ghost',
    !!ghost && ghost.ghostOpacity === '0.93' && !!ghost.ghostTransform && ghost.ghostTransform === ghost.srcTransform,
    ghost && { opacity: ghost.ghostOpacity, target: ghost.ghostTransform, source: ghost.srcTransform });

  // 2. The empty-region hint: hidden mid-preview, back after the pointer leaves.
  await page(rE).eval('exitEditMode(), true');
  const hintBefore = await page(rE).eval(`getComputedStyle(document.getElementById('drop-hint')).display`);
  const { m: hintMid, afterLeave: hintAfter } = await hoverOverTile(rE, 0,
    () => page(rE).eval(`getComputedStyle(document.getElementById('drop-hint')).display`),
    PROBE ? () => page(rE).eval(`document.getElementById('drop-hint').style.setProperty('display', 'flex', 'important'), true`) : null);
  if (PROBE) await page(rE).eval(`document.getElementById('drop-hint').style.removeProperty('display'), true`);
  check('empty region (A2): the hint is display none mid-preview and back after the pointer leaves',
    hintBefore !== 'none' && hintMid === 'none' && hintAfter.hint !== 'none' && hintAfter.hint === hintBefore, { before: hintBefore, mid: hintMid, after: hintAfter.hint });

  // 6. Reflow: the close animates when the pointer leaves; none under reduced motion; none in-region; none on a system cancel.
  const closeNormal = await hoverOverTile(rT, 1, async () => true, PROBE ? () => page(rT).eval(`document.body.classList.add('reduced-motion'), true`) : null);
  if (PROBE) await page(rT).eval(`document.body.classList.remove('reduced-motion'), true`);
  await page(rT).eval(`document.body.classList.add('reduced-motion'), true`);
  const closeReduced = await hoverOverTile(rT, 1, async () => true);
  await page(rT).eval(`document.body.classList.remove('reduced-motion'), true`);
  // System cancel: a display change (stand-in work area) while hovering.
  let d = await desc();
  await page(rS).eval('__qlSim.press(0)');
  const tile1 = await page(rT).eval(`(() => { const b = [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')][1].getBoundingClientRect(); return { x: b.left + 10, y: b.top + b.height / 2 }; })()`);
  let pp = toPage(d, rS, { x: reg(d, rT).windowDip.x + tile1.x, y: reg(d, rT).windowDip.y + tile1.y });
  await page(rS).eval(`__qlSim.moveTo(${pp.x}, ${pp.y})`);
  await sleep(300);
  const hadSlot = await page(rT).eval(`!!document.querySelector('#app-grid .drop-slot')`);
  await page(rT).eval('__qlRec.take(), true');
  await T('set-work-area', { rect: { x: wa.x, y: wa.y, width: Math.min(wa.width, 2400), height: Math.min(wa.height, 1000) } });
  await sleep(500);
  const cancelAnim = await page(rT).eval('__qlRec.take()');
  await page(rS).eval('__qlSim.release()');
  await T('set-work-area', { rect: null });
  await sleep(700);
  // In-region reorder in Tools: no animation is ever created on its tiles.
  const reorderAnim = await page(rS).eval(`(async () => {
    const tiles = () => [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')];
    if (tiles().length < 2) return { tiles: tiles().length, animated: 0 };
    const b = tiles()[1].getBoundingClientRect();
    __qlSim.press(0); let animated = 0;
    for (let i = 1; i <= 6; i++) { await __qlSim.moveTo(b.left + b.width * 0.75, b.top + b.height / 2, 1); animated = Math.max(animated, tiles().filter((t) => __qlRec.plain(t) > 0).length); }
    __qlSim.release(); await new Promise((r) => setTimeout(r, 200));
    animated = Math.max(animated, tiles().filter((t) => __qlRec.plain(t) > 0).length);
    return { tiles: tiles().length, animated };
  })()`);
  const normalAnim = (closeNormal.afterLeave.anim || []).reduce((a, b) => Math.max(a, b), 0);
  const reducedAnim = (closeReduced.afterLeave.anim || []).reduce((a, b) => Math.max(a, b), 0);
  check('reflow (A6): the gap closes with a running animation when the pointer leaves; none under reduced motion, in-region reorder or a system cancel',
    (OS_REDUCED ? normalAnim === 0 : normalAnim > 0) && reducedAnim === 0 && hadSlot && cancelAnim.length >= 1 && cancelAnim.every((n) => n === 0) && reorderAnim.animated === 0 && reorderAnim.tiles >= 2,
    { osReducedMotion: OS_REDUCED, onLeave: closeNormal.afterLeave.anim, reduced: closeReduced.afterLeave.anim, systemCancel: cancelAnim, inRegion: reorderAnim });

  // 4. Shift+F10 = the Menu key: edit mode one tile menu per press; view mode enters edit mode on that tile.
  await page(rT).eval('enterEditMode(), __qlSim.focusTile(0)');
  const m0 = (await T('menus')).menus.length;
  await page(rT).eval(`__qlSim.key('F10', { shiftKey: true }), document.activeElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })), true`);
  await sleep(150);
  await page(rT).eval(`__qlSim.focusTile(0), __qlSim.key('ContextMenu'), document.activeElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })), true`);
  await sleep(200);
  const editMenus = (await T('menus')).menus.slice(m0);
  const view = [];
  for (const [key, mods] of [['F10', { shiftKey: true }], ['ContextMenu', {}]]) {
    await sleep(900);
    await page(rT).eval('exitEditMode(), true');
    const id = PROBE && key === 'F10'
      ? await page(rT).eval(`(document.activeElement && document.activeElement.blur(), document.body.focus(), null)`)
      : await page(rT).eval(`(__qlSim.focusTile(2), document.activeElement.dataset.id)`);
    await page(rT).eval(`__qlSim.key(${JSON.stringify(key)}, ${JSON.stringify(mods)}), true`);
    await sleep(150);
    view.push({ key, ...(await page(rT).eval(`({ edit: document.body.classList.contains('edit-mode'), focus: document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id || null : null })`)), want: id || 'm2b-2' });
  }
  const viewMenus = (await T('menus')).menus.length - m0 - editMenus.length;
  check('Shift+F10 = Menu key (A4): one tile menu per press in edit mode; in view mode the region enters edit mode with focus on that tile',
    editMenus.length === 2 && editMenus.every((m) => m.kind === 'tile' && m.itemId === 'm2b-0') && viewMenus === 0 && view.every((v) => v.edit && v.focus === v.want),
    { editMenus: editMenus.map((m) => m.itemId), view, viewMenus });

  // 5. Ctrl+Up / Ctrl+Down move one row (12 tiles; 5 columns if the region can be made that wide).
  const cols = () => page(rT).eval(`computeColumnCount([...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot):not(.filter-hidden)')])`);
  for (let i = 0; i < 4 && (await cols()) !== 5; i++) {
    const c = await cols();
    const dx = (5 - c) * 104 + (c < 5 ? 8 : -8);
    for (const edge of ['right', 'left']) {
      const r = await page(rT).eval(`(async () => { await window.api.invoke('region:resize', { phase: 'start', edges: { ${edge}: true } }); const r = await window.api.invoke('region:resize', { phase: 'move', dx: ${edge === 'right' ? dx : -dx}, dy: 0, alt: true }); await window.api.invoke('region:resize', { phase: 'end' }); return r; })()`);
      await sleep(250);
      if (r && !r.blocked) break;
    }
  }
  const C = await cols();
  const order = () => page(rT).eval('__qlSim.order()');
  const step = (list, visible, id, delta) => { // the rule, written out independently of tile-order.js
    const vi = visible.indexOf(id); const ni = vi + delta;
    if (vi < 0 || ni < 0 || ni >= visible.length) return list;
    const rest = list.filter((x) => x !== id); const at = rest.indexOf(visible[ni]);
    rest.splice(delta < 0 ? at : at + 1, 0, id); return rest;
  };
  await page(rT).eval('enterEditMode(), true');
  const cases = [];
  const press = async (index, key) => {
    const before = await order();
    const id = before[index];
    await page(rT).eval(`(() => { const t = [...document.querySelectorAll('#app-grid .app-tile')].find((x) => x.dataset.id === ${JSON.stringify(id)}); t.focus(); return true; })()`);
    const k = PROBE && cases.length === 0 ? 'ArrowRight' : key;
    await page(rT).eval(`__qlSim.key(${JSON.stringify(k)}, { ctrlKey: true }), true`);
    await sleep(250);
    const after = await order();
    const want = step(before, before, id, key === 'ArrowDown' ? C : -C);
    const st = await page(rT).eval(`({ status: document.querySelector('.ql-sr-status') ? document.querySelector('.ql-sr-status').textContent : null, focus: document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id : null })`);
    cases.push({ index, key, ok: JSON.stringify(after) === JSON.stringify(want), moved: JSON.stringify(after) !== JSON.stringify(before), to: after.indexOf(id), focus: st.focus === id, status: st.status });
  };
  await press(2, 'ArrowDown');                // to 2 + C
  await press(12 - C + (C === 5 ? 1 : 0), 'ArrowDown'); // 5 columns: index 8, nothing
  await press(Math.max(0, C - 2), 'ArrowUp');  // 5 columns: index 3, nothing
  await press(2 + C, 'ArrowUp');              // back to 2
  // With a filter: only the visible (ALPHA) tiles count.
  await page(rT).eval(`setFilter('alpha'), true`);
  const fBefore = await order();
  const fVisible = await page(rT).eval(`[...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot):not(.filter-hidden)')].map((t) => t.dataset.id)`);
  const fC = await cols();
  await page(rT).eval(`(() => { const t = [...document.querySelectorAll('#app-grid .app-tile:not(.filter-hidden)')][0]; t.focus(); return true; })()`);
  await page(rT).eval(`__qlSim.key('ArrowDown', { ctrlKey: true }), true`);
  await sleep(250);
  const fAfter = await order();
  const fWant = step(fBefore, fVisible, fVisible[0], fC);
  await page(rT).eval(`clearFilter(), exitEditMode(), true`);
  const [a, b, c2, e] = cases;
  check(`Ctrl+Up / Ctrl+Down (A5, ${C} columns, 12 tiles): one row; off the visible tiles nothing; the status line says the place`,
    C >= 2 && a.ok && a.moved && a.to === 2 + C && a.focus && a.status === `Moved to ${3 + C} of 12.` && b.ok && !b.moved && c2.ok && !c2.moved && e.ok && e.to === 2
    && fVisible.length > fC && JSON.stringify(fAfter) === JSON.stringify(fWant) && JSON.stringify(fAfter) !== JSON.stringify(fBefore),
    { columns: C, cases, filter: { visible: fVisible.length, columns: fC, ok: JSON.stringify(fAfter) === JSON.stringify(fWant) } });

  // Fallback focus 3: an activation makes the region active: --border-h, no focus ring, no filter chip.
  await setTheme(rE, 'cyberpunk', '#00f0ff'); // a theme without the border-pulse animation
  const wasActive = (await desc()).active === rE;
  const act = PROBE ? { ok: true, probe: 'no activation' } : await T('emit-focus', { regionId: rE });
  await sleep(300);
  const actState = await page(rE).eval(`(() => { const e = document.createElement('div'); e.style.color = 'var(--border-h)'; document.body.appendChild(e); const want = getComputedStyle(e).color; e.remove();
    return { active: document.body.classList.contains('region-active'), border: getComputedStyle(document.getElementById('app'), '::before').borderTopColor, want,
      ring: !!document.querySelector(':focus-visible'), chip: !document.getElementById('filter-chip').classList.contains('hidden') }; })()`);
  check('activation (fallback focus 3): the region becomes active with the --border-h border; no tile ring, no filter chip',
    !wasActive && act.ok && actState.active && actState.border === actState.want && !actState.ring && !actState.chip, { wasActive, ...actState });

  // Option A, risk 2: the desktop-child to top-level path (attached mode): drop to fallback, then back.
  if (!FALLBACK) {
    const rF = ids[4];
    // The state is read inside the hook, right after the drop: the next watchdog tick re-attaches.
    // (Probe: the other region's state is read instead.)
    const f = await T('force-fallback', { regionId: rF });
    const mid = PROBE ? reg(await desc(), ids[3]).host : f.after;
    let back = null;
    for (let i = 0; i < 20; i++) { back = reg(await desc(), rF); if (back.host.mode === 'attached') break; await sleep(250); }
    check('drop to fallback (Option A risk 2): a desktop child becomes a shown top-level window, then re-attaches (the observer gate covers it)',
      f.ok && !!mid && mid.mode === 'fallback' && !mid.win.child && mid.win.visible && back.host.mode === 'attached' && back.host.win.child && back.host.win.z && back.host.win.z.above,
      { forced: f.ok, mid: mid && { mode: mid.mode, child: mid.win.child, visible: mid.win.visible }, back: { mode: back.host.mode, child: back.host.win.child } });
  }
}

// ── M3 checks (tech plan § 3; UX spec 2.1, 2.8, 3.4, 5.2, 5.4, 5.5, 8.1, 9, 14.4, 14.5) ──
// Only against the fake desktop under --root. A drop is the page's own channel
// (region:drop-files) with the paths a real drop hands it (an OS drag is real
// input). Held-open files, the read-only ACL, the OFFLINE attribute and a file
// taken aside are real, on test files; cross-volume is injected at the move
// (there is no second volume inside %TEMP%). Boxes and Open folder are recorded
// by the test hooks, never shown. --probe gives every check here one wrong
// input (or a broken reading), and each of them must then fail.
async function m3Checks({ mgr, sessions, ids }) {
  const T = (op, arg = {}) => mgr.eval(`window.api.invoke('manager:test', ${JSON.stringify(op)}, ${JSON.stringify(arg)})`);
  const D = FIX.dirs;
  const rA = ids[5]; // empty after M2b: takes the first drop, then is deleted with its moved files
  const rB = ids[1]; // Games
  const page = (id) => sessions[id];
  const drop = (id, paths, index = null) => page(id).eval(`window.api.invoke('region:drop-files', ${JSON.stringify(index === null ? { paths } : { paths, index })})`, 90000);
  const boxes = async () => (await T('boxes')).boxes;
  const items = (id) => readData().apps.filter((a) => a.regionId === id);
  const ex = (p) => existsSync(p);
  const inStore = (n) => join(D.store, n);
  const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
  const realDesk = realpathSync.native(D.desktop);
  const realPub = realpathSync.native(D.publicDesktop);
  const history = () => { try { return readFileSync(join(PROFILE, 'moves-log.jsonl'), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
  const waitPaused = async () => { for (let i = 0; i < 150; i++) { const s = await T('moves-state'); if (s.paused) return s.paused; await sleep(100); } return null; };
  const tilesOf = (id) => page(id).eval(`[...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')].map((t) => ({ id: t.dataset.id, name: (t.querySelector('.tile-label') || {}).textContent || '', kind: t.dataset.kind || 'ref', broken: t.classList.contains('tile-broken') }))`);
  const findTile = (name) => `[...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')].find((x) => (x.querySelector('.tile-label') || {}).textContent === ${JSON.stringify(name)})`;
  const tileClick = (id, name, sel = null) => page(id).eval(`(() => { const t = ${findTile(name)}; if (!t) return false; const el = ${sel ? `t.querySelector(${JSON.stringify(sel)})` : 't'}; if (!el) return false; el.click(); return true; })()`);
  for (const id of [rA, rB]) await page(id).eval(SIM_SOURCE);
  const shaOf = {};
  for (const k of ['alpha', 'beta', 'gamma', 'pub', 'racer', 'alpha2', 'changed', 'stray']) shaOf[k] = sha(FIX[k]);

  // 0. Test mode is on and points at the fake folders.
  if (PROBE) await T('moves-off');
  const st = await T('moves-state');
  if (PROBE) await T('moves-on');
  check('M3 test mode: the move uses the fake Desktop, Public Desktop and store folder under the test root; moving is available; nothing pending',
    !!st.ok && st.testMode && st.canMove && st.folders.desktop === D.desktop && st.folders.publicDesktop === D.publicDesktop && st.folders.store === D.store && st.pending.length === 0,
    { testMode: st.testMode, canMove: st.canMove, store: st.folders && st.folders.store, pending: st.pending && st.pending.length });

  // 1. Empty Grid copy (spec 2.8; tech plan 5, point 1).
  const HINT = `[...document.querySelectorAll('#drop-hint .drop-hint-inner > div')]`;
  if (PROBE) await page(rA).eval(`${HINT}[1].textContent = 'DROP .EXE OR .LNK HERE', true`);
  const hint = await page(rA).eval(`({ lines: ${HINT}.map((d) => d.textContent), display: getComputedStyle(document.getElementById('drop-hint')).display })`);
  if (PROBE) await page(rA).eval(`${HINT}[1].textContent = 'DROP SHORTCUTS HERE', true`);
  check('empty Grid: DROP SHORTCUTS HERE / Drag them off the desktop, or right-click to add.',
    hint.display !== 'none' && hint.lines[1] === 'DROP SHORTCUTS HERE' && hint.lines[2] === 'Drag them off the desktop, or right-click to add.', hint);

  // 2. A drop of desktop files: shortcuts move in order at the slot; the rest are references or bounce; history and README.
  const b0 = (await boxes()).length;
  const r1 = await drop(rA, [FIX.alpha, FIX.beta, FIX.gamma, FIX.pub, FIX.tool, FIX.inner, FIX.other, FIX.notes], 0);
  await sleep(300);
  const itA = items(rA);
  if (PROBE) await page(rA).eval(`(() => { const t = document.querySelector('#app-grid .app-tile[data-kind="moved"]'); if (t) t.dataset.kind = 'ref'; return true; })()`);
  const tA = await tilesOf(rA);
  const wantOrigins = [join(realDesk, 'Alpha.lnk'), join(realDesk, 'Beta.lnk'), join(realDesk, 'Gamma.url'), join(realPub, 'Pub.lnk')];
  const hist2 = history();
  const dones = hist2.filter((l) => l.op === 'add' && l.state === 'done');
  check('drop: 4 desktop shortcuts (Desktop and Public Desktop, .lnk and .url) move into the store folder as moved tiles at the slot; the .exe, the nested and the other-folder files stay as references; the .txt bounces; no box; history and README',
    r1.moved === 4 && r1.refs === 3 && r1.ignored === 1 && r1.failed === 0
    && [FIX.alpha, FIX.beta, FIX.gamma, FIX.pub].every((p) => !ex(p)) && ['Alpha.lnk', 'Beta.lnk', 'Gamma.url', 'Pub.lnk'].every((n) => ex(inStore(n)))
    && sha(inStore('Alpha.lnk')) === shaOf.alpha && sha(inStore('Pub.lnk')) === shaOf.pub
    && [FIX.tool, FIX.inner, FIX.other, FIX.notes].every(ex)
    && JSON.stringify(itA.map((a) => [a.name, a.kind || 'ref'])) === JSON.stringify([['Alpha', 'moved'], ['Beta', 'moved'], ['Gamma', 'moved'], ['Pub', 'moved'], ['Tool', 'ref'], ['Inner', 'ref'], ['Other', 'ref']])
    && itA.slice(0, 4).every((a, i) => same(a.origin, wantOrigins[i]) && same(dirname(a.path), D.store))
    && JSON.stringify(tA.map((x) => [x.name, x.kind])) === JSON.stringify(itA.map((a) => [a.name, a.kind || 'ref']))
    && (await boxes()).length === b0
    && dones.length === 4 && dones.every((d) => hist2.some((l) => l.id === d.id && l.state === 'intent')) && (await T('moves-state')).pending.length === 0
    && ex(inStore('README.txt')),
    { r1, items: itA.map((a) => `${a.name}:${a.kind || 'ref'}`), tiles: tA.map((x) => `${x.name}:${x.kind}`), done: dones.length });

  // 3. Badges in edit mode (spec 5.4, 9.1): ↩ on moved tiles, ✕ on references; 24 x 24; none enters a neighbour's tile.
  await page(rA).eval('enterEditMode(), true');
  if (PROBE) await page(rA).eval(`(() => { const b = document.querySelector('.btn-move-back'); if (b) b.textContent = '✕'; return true; })()`);
  const badges = await page(rA).eval(`(() => {
    const ts = [...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')];
    const R = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
    const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
    const enters = [];
    const tok = (v) => { const e = document.createElement('div'); e.style.color = 'var(' + v + ')'; document.body.appendChild(e); const c = getComputedStyle(e).color; e.remove(); return c; };
    const bgTok = (v) => { const e = document.createElement('div'); e.style.backgroundColor = 'var(' + v + ')'; document.body.appendChild(e); const c = getComputedStyle(e).backgroundColor; e.remove(); return c; };
    const want = { panel: bgTok('--panel-bg'), accentText: tok('--accent-text'), text: tok('--text') };
    const list = ts.map((t, i) => { const b = t.querySelector('.btn-remove, .btn-move-back'); if (!b) return null; ts.forEach((u, j) => { if (j !== i && hit(R(b), R(u))) enters.push(i + 'x' + j); });
      const r = b.getBoundingClientRect(); const tr = t.getBoundingClientRect(); const cs = getComputedStyle(b);
      return { kind: t.dataset.kind || 'ref', cls: b.className, text: b.textContent, title: b.title, aria: b.getAttribute('aria-label'), w: Math.round(r.width), h: Math.round(r.height),
        top: Math.round(r.top - tr.top), right: Math.round(tr.right - r.right), bg: cs.backgroundColor, border: cs.borderTopColor, borderW: cs.borderTopWidth, color: cs.color, font: cs.fontSize }; });
    return { list, enters, want };
  })()`);
  const bm = badges.list.filter((b) => b && b.kind === 'moved');
  const br = badges.list.filter((b) => b && b.kind === 'ref');
  const W3 = badges.want;
  check('edit mode: moved tiles carry ↩ "Move back to desktop" in its own look (class btn-move-back only; --panel-bg disc, --accent-text border, --text glyph at 14 px; exactly the place, size and border width of the ✕ badge), references ✕ "Remove"; 24 x 24; no badge enters a neighbour',
    badges.list.length === 7 && bm.length === 4 && br.length === 3
    && bm.every((b) => b.cls === 'btn-move-back' && b.text === '↩' && b.title === 'Move back to desktop' && b.aria === 'Move back to desktop'
      && b.bg === W3.panel && b.border === W3.accentText && b.color === W3.text && b.font === '14px'
      && !!br[0] && b.top === br[0].top && b.right === br[0].right && b.w === br[0].w && b.h === br[0].h && b.borderW === br[0].borderW)
    && br.every((b) => b.cls === 'btn-remove' && b.text === '✕' && b.title === 'Remove' && b.aria === 'Remove') && badges.list.every((b) => b && b.w >= 24 && b.h >= 24) && badges.enters.length === 0,
    { moved: bm[0], ref: br[0], want: W3, enters: badges.enters });

  // 4. One file held open in a drop of two (spec 14.4): 1 tile, the held file stays, exactly one box naming it.
  const nB0 = items(rB).length;
  const b4 = (await boxes()).length;
  const releaseD = PROBE ? null : holdOpen(FIX.delta);
  let r4;
  try { r4 = await drop(rB, [FIX.delta, FIX.epsilon]); } finally { if (releaseD) releaseD(); }
  const bx4 = (await boxes()).slice(b4);
  check('a drop of 2 with one held open: 1 tile, the held file is still on the desktop, one box: "Couldn\'t move “Delta” off the desktop. It is still on the desktop." / "The file is in use."',
    r4.moved === 1 && r4.failed === 1 && ex(FIX.delta) && !ex(FIX.epsilon) && items(rB).length === nB0 + 1 && bx4.length === 1
    && bx4[0].message === "Couldn't move “Delta” off the desktop. It is still on the desktop." && bx4[0].detail === 'The file is in use.', { r4, boxes: bx4 });

  // 5. A Public Desktop shortcut the user may read but not delete (a real ACL, reset afterwards).
  const b5 = (await boxes()).length;
  const undoAcl = PROBE ? () => {} : readOnlyAcl(FIX.admin);
  let r5;
  try { r5 = await drop(rB, [FIX.admin]); } finally { undoAcl(); }
  const bx5 = (await boxes()).slice(b5);
  check('Public Desktop, access denied (real read-only ACL): the box names it with "Needs administrator rights."; the file stays',
    r5.failed === 1 && ex(FIX.admin) && bx5.length === 1 && bx5[0].message === "Couldn't move “Admin” off the desktop. It is still on the desktop." && bx5[0].detail === 'Needs administrator rights.', { r5, boxes: bx5 });

  // 6. Cross-volume: ERROR_NOT_SAME_DEVICE at the move (injected; MoveFileExW has no COPY_ALLOWED).
  if (!PROBE) await T('move-hook', { fault: { op: 'add', code: 17, count: 1 } });
  const b6 = (await boxes()).length;
  const r6 = await drop(rB, [FIX.far]);
  await T('move-hook', {});
  const bx6 = (await boxes()).slice(b6);
  const ab6 = history().filter((l) => l.op === 'add' && l.state === 'aborted' && l.code === 17 && l.injected);
  check('cross-volume (ERROR_NOT_SAME_DEVICE at the move): refused with "The desktop is on a different drive."; the file stays; the intent is aborted with code 17',
    r6.failed === 1 && ex(FIX.far) && bx6.length === 1 && bx6[0].detail === 'The desktop is on a different drive.' && bx6[0].message === "Couldn't move “Far” off the desktop. It is still on the desktop." && ab6.length === 1, { r6, boxes: bx6 });

  // 7. A cloud-only placeholder (a real FILE_ATTRIBUTE_OFFLINE): refused, not hydrated; the attribute stays.
  if (!PROBE) W.SetFileAttributesW(FIX.cloud, 0x1000 | 0x20);
  const b7 = (await boxes()).length;
  const r7 = await drop(rB, [FIX.cloud]);
  const attrs7 = W.GetFileAttributesW(FIX.cloud);
  W.SetFileAttributesW(FIX.cloud, 0x20);
  const bx7 = (await boxes()).slice(b7);
  check('cloud-only placeholder (FILE_ATTRIBUTE_OFFLINE): refused, the attribute is still set, the file stays; one box: "The file is online only. Keep it on this device, then try again."',
    r7.failed === 1 && ex(FIX.cloud) && (attrs7 & 0x1000) !== 0 && bx7.length === 1 && bx7[0].message === "Couldn't move “Cloud” off the desktop. It is still on the desktop."
    && bx7[0].detail === 'The file is online only. Keep it on this device, then try again.', { r7, attrs: `0x${(attrs7 >>> 0).toString(16)}`, boxes: bx7 });

  // 8. A name already in the store folder: the new file gets "(2)"; the old one is untouched.
  if (PROBE) testMove(FIX.spare, inStore('Alpha (2).lnk'));
  testMove(FIX.alpha2, join(D.desktop, 'Alpha.lnk'));
  const old8 = sha(inStore('Alpha.lnk'));
  const r8 = await drop(rB, [join(D.desktop, 'Alpha.lnk')]);
  check('a name already in the store folder: the new Alpha.lnk lands as "Alpha (2).lnk"; the one already there is byte-identical',
    r8.moved === 1 && ex(inStore('Alpha (2).lnk')) && sha(inStore('Alpha (2).lnk')) === shaOf.alpha2 && sha(inStore('Alpha.lnk')) === old8 && !ex(join(D.desktop, 'Alpha.lnk')), r8);

  // 9. A race on the name: a file appears at the target after the intent, before the move.
  await T('move-hook', { pauseAt: 'add:intent' });
  const p9 = drop(rB, [FIX.racer]);
  const paused9 = await waitPaused();
  if (paused9 && !PROBE) writeFileSync(paused9.dst, 'INTRUDER');
  await T('move-continue');
  const r9 = await p9;
  check('a file appears at the target between the intent and the move: the move takes "Racer (2).lnk"; the file that appeared is untouched',
    !!paused9 && same(paused9.dst, inStore('Racer.lnk')) && r9.moved === 1 && ex(inStore('Racer.lnk')) && readFileSync(inStore('Racer.lnk'), 'utf8') === 'INTRUDER'
    && ex(inStore('Racer (2).lnk')) && sha(inStore('Racer (2).lnk')) === shaOf.racer, { paused: paused9, r9 });

  // 10. Verify: the target differs from what was hashed, so it goes back to the desktop and the add is aborted.
  const len10 = readFileSync(FIX.changed).length;
  await T('move-hook', { pauseAt: 'add:moved' });
  const b10 = (await boxes()).length;
  const p10 = drop(rB, [FIX.changed]);
  const paused10 = await waitPaused();
  if (paused10 && !PROBE) appendFileSync(paused10.dst, 'X');
  await T('move-continue');
  const r10 = await p10;
  const bx10 = (await boxes()).slice(b10);
  check('verify: a target changed after the move is moved back to the desktop (its bytes kept), the add aborted, one box',
    r10.failed === 1 && ex(FIX.changed) && readFileSync(FIX.changed).length === len10 + 1 && !ex(inStore('Changed.lnk')) && bx10.length === 1 && bx10[0].message === "Couldn't move “Changed” off the desktop. It is still on the desktop." && bx10[0].detail === 'The disk refused the move.'
    && history().some((l) => l.op === 'add' && l.state === 'aborted' && l.rolledBack), { r10, boxes: bx10 });

  // 11. ↩ on a moved tile (rA, edit mode): back to the folder it came from; the tile goes.
  if (PROBE) await tileClick(rA, 'Tool', '.btn-remove'); else await tileClick(rA, 'Alpha', '.btn-move-back');
  await sleep(900);
  check('↩ (badge): Alpha goes back to the desktop folder it came from, byte-identical; its tile and item go',
    ex(FIX.alpha) && sha(FIX.alpha) === shaOf.alpha && !ex(inStore('Alpha.lnk')) && !items(rA).some((a) => a.name === 'Alpha') && !(await tilesOf(rA)).some((x) => x.name === 'Alpha'));

  // 12. Delete on a focused moved tile (rB, edit mode): the badge action; the name is taken on the desktop now, so "(2)".
  await page(rB).eval('enterEditMode(), true');
  const refB = (await tilesOf(rB)).find((x) => x.kind === 'ref');
  const focused = await page(rB).eval(`(() => { const t = ${findTile(PROBE && refB ? refB.name : 'Alpha')}; if (!t) return false; t.focus(); return document.activeElement === t; })()`);
  await page(rB).eval(`__qlSim.key('Delete'), true`);
  await sleep(900);
  check('Delete on a focused moved tile: its file goes back to the desktop as "Alpha (2).lnk" (Alpha.lnk is there); the first Alpha is untouched',
    focused && ex(join(D.desktop, 'Alpha (2).lnk')) && sha(join(D.desktop, 'Alpha (2).lnk')) === shaOf.alpha2 && sha(FIX.alpha) === shaOf.alpha && !items(rB).some((a) => a.kind === 'moved' && a.name === 'Alpha'));
  await page(rB).eval('exitEditMode(), true');

  // 13. Tile menu (edit mode, Menu key) on a moved tile: "Move back to desktop".
  await sleep(900); // past the Menu key's contextmenu skip from the M2 checks
  await page(rA).eval(`(() => { const t = ${findTile('Beta')}; if (t) t.focus(); return true; })()`);
  const m13 = (await T('menus')).menus.length;
  await page(rA).eval(`__qlSim.key('ContextMenu'), true`);
  await sleep(250);
  const menu13 = (await T('menus')).menus.slice(m13)[0];
  const labels13 = menu13 ? menu13.items.map((i) => i.label) : [];
  await T('menu-click', { path: [PROBE ? 0 : labels13.indexOf('Move back to desktop')] });
  await sleep(900);
  if (PROBE) await page(rA).eval(`(() => { const i = document.querySelector('.rename-input'); if (i) i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true; })()`);
  check('tile menu on a moved tile reads Rename / Move to / Move back to desktop; the last moves Beta back to the desktop',
    JSON.stringify(labels13) === JSON.stringify(['Rename', 'Move to', 'Move back to desktop']) && ex(FIX.beta) && sha(FIX.beta) === shaOf.beta && !items(rA).some((a) => a.name === 'Beta'), { labels: labels13 });
  await page(rA).eval('exitEditMode(), true');

  // 14. Broken tiles (spec 2.1; addendum B4, B11): the files are taken out of the store folder (moved aside, never
  // deleted). Epsilon: view mode (click, Enter, Space show the box; Keep by default; Remove tile). Zeta: edit-mode ✕.
  // Eta: the tile menu's Remove tile. Theta: Delete. None of the edit-mode routes asks.
  await drop(rB, [FIX.zeta, FIX.eta, FIX.theta]);
  for (const n of ['Epsilon', 'Zeta', 'Eta', 'Theta']) {
    const it = items(rB).find((a) => a.name === n);
    if (it && !(PROBE && n === 'Epsilon')) testMove(it.path, join(D.aside, basename(it.path)));
  }
  await T('rescan');
  await sleep(600);
  const PIP = (name) => page(rB).eval(`(() => { const t = ${findTile(name)}; if (!t) return null; const img = t.querySelector('.tile-icon'); const pip = t.querySelector('.tile-broken-pip');
    const circle = pip && pip.querySelector('circle'); const mark = pip && pip.querySelector('rect'); const label = t.querySelector('.tile-label');
    const tr = t.getBoundingClientRect(); const pr = pip && pip.getBoundingClientRect(); const ir = img.getBoundingClientRect(); const b = t.querySelector('.btn-remove, .btn-move-back'); const brr = b && b.getBoundingClientRect();
    const tok = (v) => { const e = document.createElement('div'); e.style.color = 'var(' + v + ')'; document.body.appendChild(e); const c = getComputedStyle(e).color; e.remove(); return c; };
    const hit = (a, c) => !!(a && c && a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom);
    return { broken: t.classList.contains('tile-broken'), opacity: getComputedStyle(img).opacity, aria: t.getAttribute('aria-label'), title: t.title, labelTitle: label ? label.title : null,
      pip: pr ? { x0: Math.round(pr.left - tr.left), y0: Math.round(pr.top - tr.top), x1: Math.round(pr.right - tr.left), y1: Math.round(pr.bottom - tr.top), shown: getComputedStyle(pip).display !== 'none' && pr.width > 0 } : null,
      fill: circle ? getComputedStyle(circle).fill : null, markFill: mark ? getComputedStyle(mark).fill : null, text: tok('--text'), bg: tok('--bg'),
      overIcon: hit(pr, ir), overBadge: hit(pr, brr), badge: b ? { text: b.textContent, title: b.title, aria: b.getAttribute('aria-label'), cls: b.className } : null }; })()`);
  const pipOk = (v) => !!v && v.broken && v.opacity === '0.6' && !!v.pip && v.pip.shown && v.pip.x0 === 3 && v.pip.y0 === 3 && v.pip.x1 === 15 && v.pip.y1 === 15
    && v.fill === v.text && v.markFill === v.bg && !v.overIcon && !v.overBadge && contrast(v.fill, v.bg) >= 3;
  const view14 = await PIP('Epsilon');
  const l14 = (await T('launches')).launches.length;
  const b14 = (await boxes()).length;
  await page(rB).eval(`(() => { const t = ${findTile('Epsilon')}; if (t) t.focus(); return true; })()`);
  await page(rB).eval(`__qlSim.key('Enter'), true`);
  await sleep(400);
  await page(rB).eval(`(() => { const t = ${findTile('Epsilon')}; if (t) t.focus(); return true; })()`);
  await page(rB).eval(`__qlSim.key(' '), true`);
  await sleep(400);
  await tileClick(rB, 'Epsilon');
  await sleep(500);
  const eps = items(rB).find((a) => a.name === 'Epsilon');
  const keptAfterKeep = !!eps;
  if ((await boxes()).length > b14) { await T('box-answers', { answers: [0] }); await tileClick(rB, 'Epsilon'); await sleep(800); }
  const bx14 = (await boxes()).slice(b14);
  check('broken tile, view mode: icon 0.6; the "!" pip at x 3-15 / y 3-15 of the tile, --text disc and --bg mark, 3:1 or more, clear of the icon; aria "Epsilon, missing" and the tooltip; click, Enter and Space each show "“Epsilon” is missing from the QuickLauncher Shortcuts folder." [Remove tile] [Keep] with Keep by default, launching nothing; Remove tile removes it',
    pipOk(view14) && view14.aria === 'Epsilon, missing' && view14.title === 'Epsilon is missing. Click to remove the tile or keep it.' && view14.labelTitle === view14.title
    && bx14.length === 4 && bx14.slice(0, 3).every((b) => b.message === '“Epsilon” is missing from the QuickLauncher Shortcuts folder.' && JSON.stringify(b.buttons) === JSON.stringify(['Remove tile', 'Keep']) && b.cancelId === 1 && b.defaultId === 1 && b.answer === 1)
    && keptAfterKeep && !items(rB).some((a) => a.name === 'Epsilon') && (await T('launches')).launches.length === l14 && ex(join(D.aside, 'Epsilon.lnk')),
    { tile: view14, contrast: view14 && contrast(view14.fill, view14.bg), boxes: bx14.map((b) => b.message) });

  await page(rB).eval('enterEditMode(), true');
  const edit14 = await PIP('Zeta');
  const b14e = (await boxes()).length;
  await tileClick(rB, 'Zeta', '.btn-remove');
  await sleep(700);
  await page(rB).eval(`(() => { const t = ${findTile('Eta')}; if (t) t.focus(); return true; })()`);
  const m14 = (await T('menus')).menus.length;
  await page(rB).eval(`__qlSim.key('ContextMenu'), true`);
  await sleep(250);
  const menu14 = (await T('menus')).menus.slice(m14)[0];
  const labels14 = menu14 ? menu14.items.map((i) => i.label) : [];
  await T('menu-click', { path: [labels14.indexOf('Remove tile')] });
  await sleep(700);
  await sleep(900); // past the Menu key's contextmenu skip
  await page(rB).eval(`(() => { const t = ${findTile('Theta')}; if (t) t.focus(); return true; })()`);
  await page(rB).eval(`__qlSim.key('Delete'), true`);
  await sleep(700);
  const racerBadge = await page(rB).eval(`(() => { const t = [...document.querySelectorAll('#app-grid .app-tile[data-kind="moved"]')].find((x) => !x.classList.contains('tile-broken')); const b = t && t.querySelector('.btn-move-back'); return b ? b.textContent : null; })()`);
  await page(rB).eval('exitEditMode(), true');
  check('broken tile, edit mode: the pip stays (same place); its badge is ✕ "Remove tile" (tooltip, aria-label) and removes the tile at once; the tile menu reads Rename / Move to / Remove tile; Delete removes too; no box; a moved tile with its file keeps ↩; the files are never deleted',
    pipOk(edit14) && !!edit14.badge && edit14.badge.text === '✕' && edit14.badge.title === 'Remove tile' && edit14.badge.aria === 'Remove tile' && edit14.badge.cls === 'btn-remove' && edit14.labelTitle === 'Click to rename' && edit14.title === ''
    && JSON.stringify(labels14) === JSON.stringify(['Rename', 'Move to', 'Remove tile'])
    && !['Zeta', 'Eta', 'Theta'].some((n) => items(rB).some((a) => a.name === n)) && (await boxes()).length === b14e && racerBadge === '↩'
    && ['Zeta.lnk', 'Eta.lnk', 'Theta.lnk'].every((n) => ex(join(D.aside, n))), { tile: edit14, labels: labels14, racerBadge });

  // 15. Files without a tile (spec 5.5.3; addendum B5): listed in the Manager; Add back, Move to desktop.
  if (!PROBE) { testMove(FIX.stray, inStore('Stray.lnk')); testMove(FIX.stray2, inStore('Stray2.url')); }
  await T('rescan');
  await sleep(800);
  const ORPH = `(() => ({ count: document.getElementById('orphan-count').textContent, shown: !document.getElementById('orphan-count').classList.contains('hidden'),
    rows: [...document.querySelectorAll('#orphan-list .mgr-orphan')].map((r) => ({ name: r.querySelector('.mgr-orphan-name').textContent, title: r.querySelector('.mgr-orphan-name').title,
      buttons: [...r.querySelectorAll('button')].map((b) => [b.textContent, b.title, b.getAttribute('aria-label'), b.getAttribute('aria-disabled')]) })) }))()`;
  const od = await mgr.eval(ORPH);
  const rowBtn = (name, i) => mgr.eval(`(() => { const r = [...document.querySelectorAll('#orphan-list .mgr-orphan')].find((x) => x.querySelector('.mgr-orphan-name').textContent === ${JSON.stringify(name)}); if (!r) return false; r.querySelectorAll('button')[${i}].click(); return true; })()`);
  // The rows are rebuilt after each action: Stray2 (the .url) leaves to the desktop first, then Stray is added back.
  const s2 = await rowBtn('Stray2', 1);
  await sleep(900);
  const s1 = await rowBtn('Stray', 0);
  await sleep(2000);
  const prim = items(ids[0]).find((a) => a.name === 'Stray');
  const odAfter = await mgr.eval(ORPH);
  const wantButtons = JSON.stringify([['ADD BACK', 'Add this shortcut to “QUICK.LAUNCH”', 'Add this shortcut to “QUICK.LAUNCH”', 'false'], ['MOVE TO DESKTOP', 'Move this shortcut to the desktop', 'Move this shortcut to the desktop', 'false']]);
  // The file the race test (9) wrote into the store folder has no tile either: it is listed too.
  const race = ex(inStore('Racer.lnk')) && readFileSync(inStore('Racer.lnk'), 'utf8') === 'INTRUDER' ? ['Racer'] : [];
  const want15 = [...race, 'Stray', 'Stray2'];
  const wantTitles = [...race.map(() => 'Racer.lnk'), 'Stray.lnk', 'Stray2.url'];
  check('files without a tile: "{n} files without a tile."; per file its name (tooltip: the file name with extension), ADD BACK "Add this shortcut to “QUICK.LAUNCH”", MOVE TO DESKTOP "Move this shortcut to the desktop"; Move to desktop puts Stray2.url on the desktop; Add back gives Stray a moved tile in the first region; then only the race file is left',
    od.shown && od.count === `${want15.length} files without a tile.` && JSON.stringify(od.rows.map((r) => r.name)) === JSON.stringify(want15) && JSON.stringify(od.rows.map((r) => r.title)) === JSON.stringify(wantTitles)
    && od.rows.every((r) => JSON.stringify(r.buttons) === wantButtons)
    && s1 && s2 && ex(join(D.desktop, 'Stray2.url')) && !ex(inStore('Stray2.url')) && !!prim && prim.kind === 'moved' && same(prim.path, inStore('Stray.lnk'))
    && JSON.stringify(odAfter.rows.map((r) => r.name)) === JSON.stringify(race) && odAfter.count === (race.length ? '1 file without a tile.' : ''), { before: od, after: odAfter });

  // 16. The Manager's Moved shortcuts section (spec 8.1, 9.1; addendum B5, B8).
  await sleep(300);
  const ms = await mgr.eval(`(() => { const q = (id) => document.getElementById(id);
    const R = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
    const els = [...document.querySelectorAll('#mgr-moved button, #mgr-moved .mgr-title, #moved-count')]; const hit = [];
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) { const a = R(els[i]), b = R(els[j]); if (a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]) hit.push(i + 'x' + j); }
    const e = document.createElement('div'); e.style.color = 'var(--text)'; document.body.appendChild(e); const text = getComputedStyle(e).color; e.remove();
    return { title: document.querySelector('#mgr-moved .mgr-title').textContent, count: q('moved-count').textContent, od: q('moved-onedrive').textContent, odShown: !q('moved-onedrive').classList.contains('hidden'),
      unShown: !q('moved-unavailable').classList.contains('hidden'),
      colours: [q('moved-count'), q('moved-onedrive'), q('orphan-count')].map((x) => getComputedStyle(x).color), text,
      heights: [...document.querySelectorAll('#mgr-moved button')].map((b) => Math.round(b.getBoundingClientRect().height)),
      open: [q('btn-open-store').textContent, q('btn-open-store').title], back: [q('btn-move-all-back').textContent, q('btn-move-all-back').title, q('btn-move-all-back').getAttribute('aria-disabled')], hit }; })()`);
  const st16 = await T('moves-state');
  const movedNow = readData().apps.filter((a) => a.kind === 'moved' && !st16.missing.includes(a.id)).length;
  await mgr.eval(`document.getElementById('btn-open-store').click(), true`);
  await sleep(400);
  const opened = (await T('opened')).opened;
  await mgr.eval(`document.getElementById('btn-open-cheatsheet').click(), true`);
  await sleep(200);
  const cheat = await mgr.eval(`[...document.querySelectorAll('#cheat-list .cheat-row')].map((r) => [r.querySelector('.cheat-key').textContent, r.querySelector('.cheat-desc').textContent]).find((x) => x[0] === 'DELETE') || null`);
  await mgr.eval(`document.getElementById('btn-close-cheatsheet').click(), true`);
  check('Manager: "{n} moved off the desktop." (files present), the OneDrive note, every sentence in --text, every button 24 px or more, OPEN FOLDER and MOVE ALL BACK… with their tooltips, nothing overlapping; Open folder recorded, no window; the cheat-sheet Delete row as ruled',
    ms.count === `${movedNow} moved off the desktop.` && ms.odShown && ms.od === 'Your desktop is synced by OneDrive. Moved shortcuts stop syncing.' && !ms.unShown
    && ms.colours.every((c) => c === ms.text) && ms.heights.length >= 2 && ms.heights.every((h) => h >= 24)
    && ms.open[0] === 'OPEN FOLDER' && ms.open[1] === 'Open the folder with moved shortcuts' && ms.back[0] === 'MOVE ALL BACK…' && ms.back[1] === 'Move every moved shortcut back to the desktop' && ms.back[2] === 'false'
    && ms.hit.length === 0 && opened.length === 1 && same(opened[0], D.store)
    && !!cheat && cheat[1] === 'Remove the focused tile; a moved shortcut goes back to the desktop (edit mode)', { ms, movedNow, opened, cheat });

  // 17. Delete a region with moved files (spec 3.4, 14.5; addendum B1, B4b): one held open keeps the region and the box
  // says how many went back; then Gamma's file goes missing, so it counts as a reference: the region goes with no failure box.
  const st17 = await mgr.eval(`window.api.invoke('manager:state')`);
  const nameA = (st17.regions.find((r) => r.id === rA) || {}).name;
  const itA17 = items(rA);
  const movedA = itA17.filter((a) => a.kind === 'moved');
  const refsA = itA17.length - movedA.length;
  const gammaItem = movedA.find((a) => a.name === 'Gamma');
  const confirmText = (moved, refs) => [
    moved ? `${moved} ${moved === 1 ? 'shortcut moves' : 'shortcuts move'} back to the desktop.` : null,
    refs ? `${refs} ${moved ? 'other ' : ''}${refs === 1 ? 'shortcut is' : 'shortcuts are'} removed from QuickLauncher. ${refs === 1 ? 'The app stays' : 'The apps stay'} installed.` : null,
  ].filter(Boolean).join('\n');
  const b17 = (await boxes()).length;
  await T('box-answers', { answers: [0] });
  const releaseG = PROBE || !gammaItem ? null : holdOpen(gammaItem.path);
  let d1;
  try { d1 = await mgr.eval(`window.api.invoke('manager:delete-region', ${JSON.stringify(rA)})`, 90000); } finally { if (releaseG) releaseG(); }
  const bx17 = (await boxes()).slice(b17);
  const keptA = (await mgr.eval(`window.api.invoke('manager:state')`)).regions.some((r) => r.id === rA);
  const mid17 = { pubBack: ex(FIX.pub) && sha(FIX.pub) === shaOf.pub, gammaInStore: !!gammaItem && ex(gammaItem.path), names: items(rA).map((a) => a.name) };
  let d2 = null;
  let bx17b = [];
  if (keptA && gammaItem) {
    testMove(gammaItem.path, join(D.aside, basename(gammaItem.path)));
    const b17b = (await boxes()).length;
    await T('box-answers', { answers: [0] });
    d2 = await mgr.eval(`window.api.invoke('manager:delete-region', ${JSON.stringify(rA)})`, 90000);
    bx17b = (await boxes()).slice(b17b);
  }
  let goneA = false;
  for (let i = 0; i < 25 && !goneA; i++) { goneA = !(await regionPages()).some((t) => regionId(t) === rA); if (!goneA) await sleep(200); }
  await sleep(500); // the region's removal is saved through the store's 100 ms debounce
  check('delete a region with moved files: "Delete “…”?" with both counts (Cancel by default); with Gamma held open Pub goes back, the region is kept: "Couldn\'t move “Gamma” back to the desktop. The region was kept." / "The file is in use." / "1 other is back on the desktop."; with Gamma\'s file missing it is a reference: the confirm counts it there, the region goes, no failure box, the file untouched',
    bx17.length >= 2 && bx17[0].message === `Delete “${nameA}”?` && bx17[0].detail === confirmText(movedA.length, refsA) && JSON.stringify(bx17[0].buttons) === JSON.stringify(['Delete region', 'Cancel']) && bx17[0].cancelId === 1
    && !!d1 && d1.kept === true && bx17[1].message === "Couldn't move “Gamma” back to the desktop. The region was kept." && bx17[1].detail === 'The file is in use.\n1 other is back on the desktop.'
    && keptA && mid17.pubBack && mid17.gammaInStore && !!d2 && d2.ok && bx17b.length === 1 && bx17b[0].detail === confirmText(0, refsA + 1) && goneA
    && ex(join(D.aside, basename(gammaItem.path))) && sha(join(D.aside, basename(gammaItem.path))) === shaOf.gamma
    && !readData().apps.some((a) => a.regionId === rA) && [FIX.tool, FIX.inner, FIX.other].every(ex),
    { d1, d2, boxes: [...bx17, ...bx17b].map((b) => `${b.message} | ${b.detail}`), mid: mid17, goneA });

  // 18. Region menu "Move all shortcuts back to desktop…" (Games; addendum B2, B4b): a tile whose file is missing (Kappa) is skipped.
  await drop(rB, [FIX.kappa]);
  const kap = items(rB).find((a) => a.name === 'Kappa');
  if (kap) testMove(kap.path, join(D.aside, basename(kap.path)));
  await T('rescan');
  await sleep(500);
  const miss18 = (await T('moves-state')).missing;
  const movedB = items(rB).filter((a) => a.kind === 'moved' && !miss18.includes(a.id));
  const refsB = items(rB).filter((a) => a.kind !== 'moved').length;
  const mm = (await T('menus')).menus.length;
  await page(rB).eval(`window.api.invoke('region:menu', { x: 10, y: 10 }), true`);
  await sleep(250);
  const menu18 = (await T('menus')).menus.slice(mm)[0];
  const i18 = menu18 ? menu18.items.findIndex((i) => i.label === 'Move all shortcuts back to desktop…') : -1;
  const enabled18 = i18 >= 0 && menu18.items[i18].enabled;
  const delIdx = menu18 ? menu18.items.findIndex((i) => i.label === 'Delete region…') : -1;
  const b18 = (await boxes()).length;
  await T('menu-click', { path: [i18] }); // the default answer: Cancel
  await sleep(500);
  const afterCancel = items(rB).filter((a) => a.kind === 'moved' && !miss18.includes(a.id)).length;
  if (!PROBE) { await T('box-answers', { answers: [0] }); await T('menu-click', { path: [i18] }); await sleep(2000); }
  const bx18 = (await boxes()).slice(b18);
  await page(rB).eval(`window.api.invoke('region:menu', { x: 10, y: 10 }), true`);
  await sleep(250);
  const menu18b = (await T('menus')).menus.slice(-1)[0];
  const disabledAfter = menu18b.items.find((i) => i.label === 'Move all shortcuts back to desktop…').enabled === false;
  const n18 = movedB.length;
  const leave18 = `${n18 === 1 ? 'It leaves' : 'They leave'} “Games”. Names already on the desktop get a number.`;
  check('region menu "Move all shortcuts back to desktop…" above "Delete region…": "Move {n} … back to the desktop?" counting only shortcuts whose file is there; "It leaves / They leave “Games”. …"; Cancel changes nothing; Move back moves them; the missing-file tile stays and is never a failure; then the item is disabled',
    n18 >= 1 && !!kap && miss18.includes(kap.id) && enabled18 && delIdx === i18 + 1 && bx18.length === 2 && bx18[0].message === `Move ${n18} ${n18 === 1 ? 'shortcut' : 'shortcuts'} back to the desktop?`
    && bx18[0].detail === leave18 && bx18[1].message === bx18[0].message && afterCancel === n18 && items(rB).filter((a) => a.kind === 'moved' && a.name !== 'Kappa').length === 0
    && items(rB).some((a) => a.name === 'Kappa') && items(rB).filter((a) => a.kind !== 'moved').length === refsB && movedB.every((a) => ex(a.origin)) && disabledAfter,
    { n: n18, boxes: bx18.map((b) => `${b.message} | ${b.detail}`), afterCancel });

  // 19. The Manager's MOVE ALL BACK… (every region; addendum B2, B3, B5): Stray (region 1) and Lambda (Games) are in 2 regions.
  await drop(rB, [FIX.lambda]);
  await sleep(300);
  const miss19 = (await T('moves-state')).missing;
  const movedAll = readData().apps.filter((a) => a.kind === 'moved' && !miss19.includes(a.id));
  const k19 = new Set(movedAll.map((a) => a.regionId)).size;
  const b19 = (await boxes()).length;
  await T('box-answers', { answers: [PROBE ? 1 : 0] });
  await mgr.eval(`document.getElementById('btn-move-all-back').click(), true`);
  await sleep(2500);
  const bx19 = (await boxes()).slice(b19);
  const ms19 = await mgr.eval(`({ count: document.getElementById('moved-count').textContent, disabled: document.getElementById('btn-move-all-back').getAttribute('aria-disabled'), tip: document.getElementById('btn-move-all-back').title })`);
  check('Manager MOVE ALL BACK…: "Move 2 shortcuts back to the desktop?" / "They leave 2 regions. Names already on the desktop get a number."; Move back moves both; the missing-file tile is left out; then "None moved off the desktop." and the button is disabled with "No shortcuts to move back."',
    movedAll.length === 2 && k19 === 2 && bx19.length === 1 && bx19[0].message === 'Move 2 shortcuts back to the desktop?'
    && bx19[0].detail === 'They leave 2 regions. Names already on the desktop get a number.' && readData().apps.filter((a) => a.kind === 'moved' && a.name !== 'Kappa').length === 0
    && ex(join(D.desktop, 'Stray.lnk')) && ex(FIX.lambda) && items(rB).some((a) => a.name === 'Kappa')
    && ms19.count === 'None moved off the desktop.' && ms19.disabled === 'true' && ms19.tip === 'No shortcuts to move back.', { n: movedAll.length, regions: k19, boxes: bx19.map((b) => `${b.message} | ${b.detail}`), manager: ms19 });

  // 20. Moving unavailable (spec 5.5.7; addendum B5; the test hook turns it off): the Manager's standing line and disabled
  // buttons; a drop of a desktop file shows the spec box and changes nothing.
  if (!PROBE) await T('moves-off');
  await sleep(500);
  const un20 = await mgr.eval(`(() => { const q = (id) => document.getElementById(id); const btn = (b) => [b.getAttribute('aria-disabled'), b.title];
    return { line: q('moved-unavailable').textContent, shown: !q('moved-unavailable').classList.contains('hidden'), back: btn(q('btn-move-all-back')), open: btn(q('btn-open-store')),
      rows: [...document.querySelectorAll('#orphan-list .mgr-orphan button')].map(btn) }; })()`);
  testMove(FIX.late, join(D.desktop, 'Late.lnk'));
  const b20 = (await boxes()).length;
  const r20 = await drop(rB, [join(D.desktop, 'Late.lnk')]);
  await T('moves-on');
  const bx20 = (await boxes()).slice(b20);
  check('moving unavailable: the Manager shows "Moving is unavailable."; MOVE ALL BACK…, ADD BACK and MOVE TO DESKTOP are disabled with that tooltip, OPEN FOLDER is not; a dropped desktop shortcut gives one box "Moving is unavailable. Nothing was changed." and nothing changes',
    un20.shown && un20.line === 'Moving is unavailable.' && un20.back[0] === 'true' && un20.back[1] === 'Moving is unavailable.' && un20.open[0] !== 'true'
    && un20.rows.length >= 2 && un20.rows.every(([d, tip]) => d === 'true' && tip === 'Moving is unavailable.')
    && r20.refused === 'unavailable' && bx20.length === 1 && bx20[0].message === 'Moving is unavailable. Nothing was changed.' && ex(join(D.desktop, 'Late.lnk')) && !items(rB).some((a) => a.name === 'Late'),
    { manager: un20, r20, boxes: bx20 });

  // 22. A drop through the page's own drop code (addendum B10, B7): an accepted drop clears the type-to-filter, so the new
  // tile shows; files that are not shortcuts give the region notice, never a box; a FULL drop leaves the filter.
  // (--probe sends the same paths past the page, straight to the main process: no clear, no notice.)
  const g22 = await page(rB).eval(`(() => { const r = document.getElementById('app-grid').getBoundingClientRect(); return { x: Math.round(r.left + 30), y: Math.round(r.top + 30) }; })()`);
  await page(rB).eval(`setFilter('zzzz'), true`);
  const visibleBefore = await page(rB).eval(`document.querySelectorAll('#app-grid .app-tile:not(.drop-slot):not(.filter-hidden)').length`);
  const b22 = (await boxes()).length;
  const pageDrop = (paths) => page(rB).eval(`window.__qlFileDrop(${JSON.stringify(paths)}, ${g22.x}, ${g22.y})`, 90000);
  const r22 = PROBE ? await drop(rB, [FIX.mu, FIX.notes, D.elsewhere]) : await pageDrop([FIX.mu, FIX.notes, D.elsewhere]);
  await sleep(500);
  const NOTICE = `({ filter: _filterText, chip: !document.getElementById('filter-chip').classList.contains('hidden'), shown: !document.getElementById('update-banner').classList.contains('hidden'), text: document.getElementById('update-text').textContent })`;
  const s22 = await page(rB).eval(NOTICE);
  const muVisible = await page(rB).eval(`(() => { const t = ${findTile('Mu')}; return t ? !t.classList.contains('filter-hidden') : null; })()`);
  const r22b = PROBE ? await drop(rB, [FIX.notes]) : await pageDrop([FIX.notes]);
  await sleep(400);
  const s22b = await page(rB).eval(NOTICE);
  const nB22 = items(rB).length;
  await T('set-cap', { regionId: rB, cap: nB22 });
  await page(rB).eval(`setFilter('zzzz'), true`);
  const r22c = await page(rB).eval(`window.__qlFileDrop ? window.__qlFileDrop(${JSON.stringify([FIX.nu])}, ${g22.x}, ${g22.y}) : null`, 90000);
  const filterAfterFull = await page(rB).eval('_filterText');
  await T('set-cap', { regionId: rB, cap: null });
  await page(rB).eval('clearFilter(), true');
  const bx22 = (await boxes()).slice(b22);
  check('a drop through the page with a filter that hides every tile: the filter clears and the new tile shows in its slot (B10); a FULL drop leaves the filter and moves nothing',
    visibleBefore === 0 && !!r22 && r22.moved === 1 && s22.filter === '' && !s22.chip && muVisible === true && r22c === null && filterAfterFull === 'zzzz' && ex(FIX.nu),
    { visibleBefore, r22, s22, muVisible, fullDrop: r22c, filterAfterFull });
  check('files that are not shortcuts (a .txt, a folder): the region notice "2 FILES ARE NOT SHORTCUTS", then "NOT A SHORTCUT" for one alone; no box; nothing moved for them (B7)',
    !!r22 && r22.ignored === 2 && s22.shown && s22.text === '2 FILES ARE NOT SHORTCUTS' && !!r22b && r22b.moved === 0 && r22b.ignored === 1 && s22b.shown && s22b.text === 'NOT A SHORTCUT'
    && bx22.length === 0 && ex(FIX.notes) && existsSync(D.elsewhere), { r22, notice: s22.text, r22b, notice2: s22b.text, boxes: bx22.length });

  // 23. The drop effect a file drag is answered with is 'copy', never 'move' (B7: a Move answer tells Explorer to delete
  // the originals). A file DataTransfer goes through the page's own dragover listener. (--probe adds a later listener
  // that answers 'move', as broken page code would.)
  // (Chromium ignores dropEffect writes on a DataTransfer that is not from a real drag, so the event
  // carries a plain object shaped like a file drag's DataTransfer: the listener's answer is readable.)
  const de = await page(rB).eval(`(() => {
    ${PROBE ? "window.addEventListener('dragover', (e) => { if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'; }, true);" : ''}
    const grid = document.getElementById('app-grid'); const r = grid.getBoundingClientRect();
    const fake = (type) => { const ev = new Event(type, { bubbles: true, cancelable: true });
      const dt = { types: ['Files'], items: [{ kind: 'file', type: '' }], files: [], dropEffect: 'none', effectAllowed: 'all' };
      Object.defineProperty(ev, 'dataTransfer', { value: dt }); Object.defineProperty(ev, 'clientX', { value: r.left + 20 }); Object.defineProperty(ev, 'clientY', { value: r.top + 20 });
      return { ev, dt }; };
    const a = fake('dragenter'); grid.dispatchEvent(a.ev);
    const o = fake('dragover'); grid.dispatchEvent(o.ev);
    const l = fake('dragleave'); grid.dispatchEvent(l.ev);
    return { enter: a.dt.dropEffect, effect: o.dt.dropEffect, prevented: o.ev.defaultPrevented, types: o.dt.types }; })()`);
  await sleep(800);
  check('a file drag over a region is answered with dropEffect "copy" (never "move"), on dragenter and dragover', de.effect === 'copy' && de.enter === 'copy' && de.prevented && de.types.includes('Files'), de);

  // 21. Nothing was deleted (spec 14.4): every file the test tree held before the run is still in it, by content.
  const after = listTree(DESK);
  const have = new Set(after.map((f) => f.sha));
  const before = PROBE ? [...deskBefore, { rel: 'probe-only.lnk', sha: '0'.repeat(64) }] : deskBefore;
  const changedNow = ex(FIX.changed) ? sha(FIX.changed) : null; // (--probe: it moved into the store folder unchanged)
  const lost = before.filter((f) => !have.has(f.sha) && !(f.sha === shaOf.changed && changedNow !== shaOf.changed));
  const added = after.length - deskBefore.length;
  const wantAdded = 1 + (paused9 && !PROBE ? 1 : 0); // README.txt, and the file the race test wrote
  check(`nothing deleted: all ${deskBefore.length} files the test tree held before are still there by content (Changed.lnk carries the byte the test added); only README.txt${wantAdded > 1 ? ' and the race file' : ''} are new`,
    lost.length === 0 && added === wantAdded, { before: deskBefore.length, after: after.length, lost: lost.map((f) => f.rel) });
}

// ── M3 fix pass (UX spec "Addendum — M3 fix pass", C1 to C6 and Futaba's measures 1 to 6;
// the region-window tagline, offer 1 of that addendum, approved 2026-10-04). Fake desktop
// only. Each check runs in its own try: a build without the fix fails the check (the
// broken-code control is this script run with --exe of the build before the fix) and the
// run goes on. --probe gives each check one wrong input or a broken reading.
async function fixChecks({ mgr, sessions, ids }) {
  const T = (op, arg = {}) => mgr.eval(`window.api.invoke('manager:test', ${JSON.stringify(op)}, ${JSON.stringify(arg)})`);
  const D = FIX.dirs;
  const rP = ids[0]; // the primary region: the updater's messages go to its page
  const rG = ids[1]; // Games
  const page = (id) => sessions[id];
  const drop = (id, paths, index = null) => page(id).eval(`window.api.invoke('region:drop-files', ${JSON.stringify(index === null ? { paths } : { paths, index })})`, 90000);
  const boxes = async () => (await T('boxes')).boxes;
  const items = (id) => readData().apps.filter((a) => a.regionId === id);
  const ex = (p) => existsSync(p);
  const inStore = (n) => join(D.store, n);
  const url = (p, u) => { writeFileSync(p, `[InternetShortcut]\r\nURL=${u}\r\n`); return p; };
  const ic = (args) => spawnSync('icacls', args, { encoding: 'utf8', windowsHide: true }).status;
  const user = process.env.USERNAME;
  const guarded = async (name, fn) => { try { await fn(name); } catch (e) { check(name, false, `threw: ${String(e && e.message).slice(0, 300)}`); } };
  const S = {
    blocked: 'A file named “QuickLauncher Shortcuts” is in your user folder. Rename or move it, then try again.',
    denied: 'Access to the QuickLauncher Shortcuts folder was denied. Check its permissions and your security software.',
    full: 'The disk is full.', disk: 'The disk refused the move.',
    tooLong: 'The name is too long for the QuickLauncher Shortcuts folder. Shorten it, then try again.',
    open: "Couldn't open the QuickLauncher Shortcuts folder.",
  };
  const one = (name) => `Couldn't move “${name}” off the desktop. It is still on the desktop.`;

  // Every theme, first (they only read the pages): the theme stylesheet is swapped as the app swaps it (the
  // link's href), and the test side polls for the new sheet (the app never fired the link's load event).
  const THEMES = readdirSync(join(REPO, 'src', 'renderer', 'styles', 'themes')).filter((f) => f.endsWith('.css')).map((f) => f.slice(0, -4)).sort();
  const setTheme = async (s, theme) => {
    const want = `styles/themes/${theme}.css`;
    const isIn = `(() => { const l = document.getElementById('theme-stylesheet'); return !!(l.sheet && l.sheet.href && l.sheet.href.endsWith('/' + ${JSON.stringify(want)})); })()`;
    if (await s.eval(isIn)) return true;
    await s.eval(`(() => { document.getElementById('theme-stylesheet').setAttribute('href', ${JSON.stringify(want)}); return true; })()`);
    for (let i = 0; i < 200; i++) { if (await s.eval(isIn)) return true; await sleep(10); }
    return false;
  };
  // The tagline's painted run (as Judy measured it: from its left to the smaller of left + text width and its box's right edge,
  // the text measured in the pseudo-element's own font and letter-spacing), and every other element of the header.
  const HEADER_PROBE = `(() => {
    const hdr = document.getElementById('header'); const cs = getComputedStyle(hdr, '::after'); const hb = hdr.getBoundingClientRect();
    const R = (el) => { if (!el || el.classList.contains('hidden') || getComputedStyle(el).display === 'none') return null; const b = el.getBoundingClientRect(); const f = (v) => Math.round(v * 100) / 100; return { l: f(b.left), t: f(b.top), r: f(b.right), b: f(b.bottom) }; };
    const raw = cs.content;
    const painted = cs.display !== 'none' && raw && raw !== 'none' && raw !== 'normal' && raw !== '""';
    let run = null;
    if (painted) {
      const txt = raw.replace(/^"|"$/g, '').replace(/\\\\(["'])/g, '$1').replace(/\\\\A ?/g, ' ');
      const s = document.createElement('span'); s.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + cs.font + ';letter-spacing:' + cs.letterSpacing + ';text-transform:' + cs.textTransform; s.textContent = txt; document.body.appendChild(s);
      const w = s.getBoundingClientRect().width; s.remove();
      const bl = parseFloat(getComputedStyle(hdr).borderLeftWidth) || 0; const bt = parseFloat(getComputedStyle(hdr).borderTopWidth) || 0;
      const br = parseFloat(getComputedStyle(hdr).borderRightWidth) || 0; const num = (v) => parseFloat(v);
      const L = Number.isFinite(num(cs.left)) ? hb.left + bl + num(cs.left) : hb.right - br - num(cs.right) - num(cs.width); const Rr = L + num(cs.width);
      const T = Number.isFinite(num(cs.top)) ? hb.top + bt + num(cs.top) : hb.top; const B = Number.isFinite(num(cs.height)) ? T + num(cs.height) : hb.bottom;
      const al = cs.textAlign; let l = L; let r = Math.min(L + w, Rr);
      if (al === 'right' || al === 'end') { r = Rr; l = Math.max(L, Rr - w); } else if (al === 'center') { l = Math.max(L, L + (Rr - L - w) / 2); r = Math.min(Rr, l + w); }
      run = { l, r, t: T, b: B, align: al };
    }
    const els = { title: R(document.getElementById('title-area')), name: R(document.getElementById('title')), icon: R(document.getElementById('region-icon')), chip: R(document.getElementById('filter-chip')),
      controls: R(document.getElementById('header-controls')), header: R(hdr) };
    const btns = [...document.querySelectorAll('#header-controls button')].map((b) => ({ id: b.id, ...R(b) }));
    const hx = (a, c) => !!a && !!c && a.l < c.r && c.l < a.r; const h2 = (a, c) => hx(a, c) && a.t < c.b && c.t < a.b;
    return { width: Math.round(hb.width), display: cs.display, painted: !!run, run, els, btns,
      underFirstBtn: { x: hx(run, btns[0]), xy: h2(run, btns[0]) }, underAnyBtn: { x: btns.some((b) => hx(run, b)), xy: btns.some((b) => h2(run, b)) },
      underChip: { x: hx(run, els.chip), xy: h2(run, els.chip) }, underTitle: { x: hx(run, els.title), xy: h2(run, els.title) } };
  })()`;

  // A probe rule goes in through the CSSOM (the pages' CSP refuses an inline <style>).
  const addRule = (s, rule) => s.eval(`(() => { const sh = [...document.styleSheets].pop(); return sh.insertRule(${JSON.stringify(rule)}, sh.cssRules.length); })()`);
  const dropRule = (s, at) => s.eval(`(() => { const sh = [...document.styleSheets].pop(); sh.deleteRule(${Number(at)}); return true; })()`);

  // The region page is a visible desktop child: its theme can be swapped here. The last region
  // (empty, a Grid at its default size since M1) is measured, then put back on its own theme.
  await guarded('region tagline (offer 1, approved): in a Grid region, in every theme, the tagline\'s painted text runs under no header button, and none while the filter chip shows', async (name) => {
    const P = await pageFor(ids[ids.length - 1]); // its current page (a region dropped to fallback is rebuilt)
    const own = await P.eval(`document.getElementById('theme-stylesheet').getAttribute('href')`);
    const rows = [];
    const probeAt = PROBE ? await addRule(P, 'body.region #header::after { right: 135px !important; display: block !important; }') : null;
    try {
      for (const th of THEMES) {
        const loaded = await setTheme(P, th);
        for (const chip of [false, true]) {
          await P.eval(chip ? `setFilter('ste'), true` : `clearFilter(), true`);
          rows.push({ theme: th, chip, loaded, ...(await P.eval(HEADER_PROBE)) });
        }
      }
    } finally {
      await P.eval(`clearFilter(), true`).catch(() => {});
      if (probeAt !== null) await dropRule(P, probeAt).catch(() => {});
      await P.eval(`(() => { document.getElementById('theme-stylesheet').setAttribute('href', ${JSON.stringify(own)}); return true; })()`).catch(() => {});
    }
    writeFileSync(join(PROFILE, 'header-geometry.json'), JSON.stringify(rows, null, 1));
    const nochip = rows.filter((r) => !r.chip);
    const withChip = rows.filter((r) => r.chip);
    const n = (list, k, axis = 'xy') => list.filter((r) => r[k][axis]).length;
    const ev = {
      width: rows[0] && rows[0].width, themes: nochip.length, loaded: rows.filter((r) => r.loaded).length / 2,
      underFirstButton: n(nochip, 'underFirstBtn'), underAnyButton: n(nochip, 'underAnyBtn'), underChip: n(withChip, 'underChip'), drawnWithChip: withChip.filter((r) => r.painted).length,
      underTitle: nochip.filter((r) => r.underTitle.xy).map((r) => r.theme), file: join(PROFILE, 'header-geometry.json'),
    };
    console.log(`header geometry: ${ev.file}`);
    check(name, nochip.length === THEMES.length && THEMES.length >= 101 && rows.every((r) => r.loaded) && ev.underAnyButton === 0 && ev.underChip === 0 && ev.drawnWithChip === 0 && n(withChip, 'underAnyBtn') === 0, ev);
  });

  // The Manager (hidden under --ql-test-hooks) at its own width, every theme, then back to its own theme.
  await guarded('fix C6 (m-8): the Manager draws no theme tagline, in every theme (computed display of #header::after is none)', async (name) => {
    const own = await mgr.eval(`document.getElementById('theme-stylesheet').getAttribute('href')`);
    const probeAt = PROBE ? await addRule(mgr, 'body.manager #header::after { display: block !important; }') : null;
    const rows = [];
    try {
      for (const th of THEMES) {
        const loaded = await setTheme(mgr, th);
        rows.push({ theme: th, loaded, ...(await mgr.eval(`(() => { const cs = getComputedStyle(document.getElementById('header'), '::after'); return { display: cs.display, content: cs.content, width: Math.round(document.getElementById('header').getBoundingClientRect().width) }; })()`)) });
      }
    } finally {
      if (probeAt !== null) await dropRule(mgr, probeAt).catch(() => {});
      await mgr.eval(`(() => { document.getElementById('theme-stylesheet').setAttribute('href', ${JSON.stringify(own)}); return true; })()`).catch(() => {});
    }
    writeFileSync(join(PROFILE, 'manager-tagline.json'), JSON.stringify(rows, null, 1));
    const drawn = rows.filter((r) => r.display !== 'none');
    check(name, rows.length === THEMES.length && THEMES.length >= 101 && rows.every((r) => r.loaded) && drawn.length === 0,
      { themes: rows.length, loaded: rows.filter((r) => r.loaded).length, width: rows[0] && rows[0].width, drawn: drawn.length, sample: drawn.slice(0, 3).map((r) => r.theme) });
  });
  // The data file holds a page's save once its debounce has run.
  const waitData = async (pred, ms = 5000) => { const until = Date.now() + ms; while (Date.now() < until) { try { if (pred(readData())) return true; } catch { /* mid-write */ } await sleep(100); } return false; };

  // F1. C1, Futaba's repro 1 (M-1): a FILE named "QuickLauncher Shortcuts" where the store folder goes.
  await guarded('fix C1 (M-1): a FILE where the store folder goes: the drop answers with one B1 box and the ruled reason, the .exe still becomes a tile, OPEN FOLDER says "Couldn\'t open…" with the same reason and opens nothing; with the file gone the next drop moves (no restart)', async (name) => {
    const omega = url(join(D.desktop, 'Omega.url'), 'https://example.invalid/omega');
    const tool = join(D.desktop, 'Tool2.exe');
    writeFileSync(tool, 'not a real program: test hooks never launch anything');
    const held = join(D.aside, 'fix-store-held');
    testMove(D.store, held); // the store folder is put aside, files and all, and comes back below
    let r; let o; let bx = []; let opened0; let opened1; let fileStayed;
    try {
      writeFileSync(D.store, 'a file where the store folder goes');
      const b0 = (await boxes()).length;
      opened0 = (await T('opened')).opened.length;
      r = await drop(rG, [omega, tool], 0);
      fileStayed = ex(omega);
      o = await mgr.eval(`window.api.invoke('manager:open-store')`);
      bx = PROBE ? [] : (await boxes()).slice(b0);
      opened1 = (await T('opened')).opened.length;
    } finally {
      if (ex(D.store) && lstatSync(D.store).isFile()) testMove(D.store, join(D.aside, 'fix-in-the-way'));
      if (!ex(D.store)) testMove(held, D.store);
    }
    const r2 = await drop(rG, [omega], 0);
    check(name, r && r.failed === 1 && r.refs === 1 && r.moved === 0 && fileStayed && o && o.ok === false && opened1 === opened0
      && bx.length === 2 && bx[0].message === one('Omega') && bx[0].detail === S.blocked && bx[0].buttons.join() === 'OK'
      && bx[1].message === S.open && bx[1].detail === S.blocked
      && r2.moved === 1 && !ex(omega) && ex(inStore('Omega.url')),
    { r, open: o, boxes: bx.map((b) => [b.message, b.detail]), opened: [opened0, opened1], r2 });
  });

  // F2. C1, Futaba's repro 2: a denied ACL (W,AD,WD) on the (fake) store folder, removed afterwards.
  await guarded('fix C1 (M-1): a denied ACL on the store folder: the drop and OPEN FOLDER both name the denied folder; the file stays', async (name) => {
    const psi = url(join(D.desktop, 'Psi.url'), 'https://example.invalid/psi');
    const b0 = (await boxes()).length;
    let r; let o;
    if (!PROBE && ic([D.store, '/deny', `${user}:(W,AD,WD)`]) !== 0) throw new Error('icacls deny failed');
    try {
      r = await drop(rG, [psi]);
      o = await mgr.eval(`window.api.invoke('manager:open-store')`);
    } finally { ic([D.store, '/remove:d', user]); }
    const bx = (await boxes()).slice(b0);
    check(name, r.failed === 1 && ex(psi) && o.ok === false && bx.length === 2 && bx[0].message === one('Psi') && bx[0].detail === S.denied
      && bx[1].message === S.open && bx[1].detail === S.denied, { r, open: o, boxes: bx.map((b) => [b.message, b.detail]) });
  });

  // F3. C1, injected at the steps before the move: a full disk, another error, a journal that cannot be written.
  await guarded('fix C1: injected ENOSPC at the store step reads "The disk is full."; EIO there is the catch-all; a journal write that fails (EPERM) never names the store folder; the file stays each time', async (name) => {
    const chi = url(join(D.desktop, 'Chi.url'), 'https://example.invalid/chi');
    const got = [];
    for (const [at, code] of [['store', 'ENOSPC'], ['store', 'EIO'], ['journal', 'EPERM'], ['journal', 'ENOSPC']]) {
      if (!PROBE) await T('move-hook', { stepFault: { at, code } });
      const b0 = (await boxes()).length;
      const r = await drop(rG, [chi]);
      await T('move-hook', {});
      const bx = (await boxes()).slice(b0);
      got.push({ at, code, failed: r.failed, there: ex(chi), detail: bx.length === 1 ? bx[0].detail : `${bx.length} boxes` });
    }
    const want = [S.full, S.disk, S.disk, S.full];
    check(name, got.every((g, i) => g.failed === 1 && g.there && g.detail === want[i]) && (await T('moves-state')).pending.length === 0, got);
  });

  // F4. C2: one file, one tile.
  await guarded('fix C2 (m-1): a reference tile on a desktop shortcut, the file dropped on another region: the file moves, the SAME tile becomes moved and lands at the dropped slot, none left behind; no box, no notice', async (name) => {
    const refd = url(join(D.desktop, 'Refd.url'), 'https://example.invalid/refd');
    // A reference tile on a desktop shortcut, as an older build made them: the page's own save.
    await page(rP).eval(`(async () => { apps.push({ id: 'fix-refd', name: 'My Refd', path: ${JSON.stringify(refd)}, iconDataUrl: '' }); await saveApps(); renderGrid(); return true; })()`);
    if (!(await waitData((d) => d.apps.some((a) => a.id === 'fix-refd')))) throw new Error('the page save did not reach the data file');
    const b0 = (await boxes()).length;
    const r = await drop(rG, [refd], 0);
    await sleep(300);
    const g = items(rG);
    const inP = (PROBE ? items(rG) : items(rP)).filter((a) => a.id === 'fix-refd').length;
    const domG = await page(rG).eval(`[...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')].map((t) => [t.dataset.id, t.dataset.kind || 'ref'])`);
    const domP = await page(rP).eval(`[...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')].map((t) => t.dataset.id)`);
    check(name, r.moved === 1 && r.refs === 0 && r.failed === 0 && !r.notice && (await boxes()).length === b0
      && g[0] && g[0].id === 'fix-refd' && g[0].kind === 'moved' && g[0].name === 'My Refd' && inP === 0 && !ex(refd) && ex(inStore('Refd.url'))
      && domG[0] && domG[0][0] === 'fix-refd' && domG[0][1] === 'moved' && !domP.includes('fix-refd'),
    { r, first: g[0] && [g[0].id, g[0].kind, g[0].name], inPrimary: inP, domG: domG.slice(0, 2) });
  });

  await guarded('fix C2: a move that fails (injected 32) leaves the reference tile where it was, unchanged', async (name) => {
    const fail = url(join(D.desktop, 'Held2.url'), 'https://example.invalid/held2');
    await page(rP).eval(`(async () => { apps.push({ id: 'fix-held', name: 'Held2', path: ${JSON.stringify(fail)}, iconDataUrl: '' }); await saveApps(); renderGrid(); return true; })()`);
    if (!(await waitData((d) => d.apps.some((a) => a.id === 'fix-held')))) throw new Error('the page save did not reach the data file');
    const before = JSON.stringify(items(rP));
    if (!PROBE) await T('move-hook', { fault: { op: 'add', code: 32, count: 1 } });
    const r = await drop(rG, [fail], 0);
    await T('move-hook', {});
    await sleep(200);
    check(name, r.failed === 1 && ex(fail) && JSON.stringify(items(rP)) === before && !items(rG).some((a) => a.id === 'fix-held'), { r });
  });

  await guarded('fix C2 (m-3): the store file of a moved tile dropped on another region: that tile goes there, no file moves; ↩ later returns it to its own origin', async (name) => {
    const sf = inStore('Refd.url');
    const h = sha(sf);
    const r = await drop(PROBE ? rG : rP, [sf], 0);
    await sleep(200);
    const p = items(rP);
    check(name, r.taken === 1 && r.moved === 0 && r.refs === 0 && p[0] && p[0].id === 'fix-refd' && !items(rG).some((a) => a.id === 'fix-refd')
      && ex(sf) && sha(sf) === h && !ex(join(D.desktop, 'Refd.url')),
    { r, first: p[0] && p[0].id });
  });

  await guarded('fix C2: a store file with no tile, dropped: one moved tile at the slot; "files without a tile" drops by one; no file moves', async (name) => {
    const stray = url(inStore('Stray3.url'), 'https://example.invalid/stray3');
    if (!PROBE) await T('rescan'); // (--probe: the list is read before the rescan sees the file)
    const before = (await T('moves-state')).manager.orphans.map((o) => o.name);
    const r = await drop(rG, [stray], 0);
    await sleep(200);
    const after = (await T('moves-state')).manager.orphans.map((o) => o.name);
    const g = items(rG);
    check(name, before.includes('Stray3') && !after.includes('Stray3') && after.length === before.length - 1
      && r.taken === 1 && g[0] && g[0].name === 'Stray3' && g[0].kind === 'moved' && ex(stray),
    { r, before: before.length, after: after.length });
  });

  await guarded('fix C2: a tile already in the dropped region adds nothing to its count: at the cap, its file dropped there is not FULL', async (name) => {
    const n = items(rP).length;
    await T('set-cap', { regionId: rP, cap: PROBE ? n - 1 : n });
    let r;
    try { r = await drop(rP, [inStore('Refd.url')], 2); } finally { await T('set-cap', { regionId: rP, cap: null }); } // slot 2 counts the tile itself (now first): it lands second
    check(name, r.refused === null && r.taken === 1 && items(rP).length === n && items(rP)[1] && items(rP)[1].id === 'fix-refd', { r, n });
  });

  // F5. C3: a name a moved tile owns, its file missing, is never reused.
  await guarded('fix C3 (m-2): a broken moved tile keeps its name: a new file of the same name lands as "(2)", two tiles, the first still broken; its file put back, the pip goes', async (name) => {
    const d1 = url(join(D.desktop, 'Dup3.url'), 'https://example.invalid/first');
    const r1 = await drop(rG, [d1]);
    const t1 = r1.moved === 1 ? items(rG).find((a) => a.name === 'Dup3' && a.kind === 'moved') : null;
    if (!PROBE) testMove(inStore('Dup3.url'), join(D.aside, 'Dup3.url')); // a person takes the file out of the store folder
    await T('rescan');
    const d2 = url(join(D.desktop, 'Dup3.url'), 'https://example.invalid/second');
    const r2 = await drop(rG, [d2]);
    await sleep(200);
    const st = await T('moves-state');
    const dom = await page(rG).eval(`[...document.querySelectorAll('#app-grid .app-tile:not(.drop-slot)')].filter((t) => (t.querySelector('.tile-label') || {}).textContent === 'Dup3').map((t) => t.classList.contains('tile-broken'))`);
    const broken = !!t1 && st.missing.includes(t1.id);
    if (!PROBE) testMove(join(D.aside, 'Dup3.url'), inStore('Dup3.url'));
    await T('rescan');
    const st2 = await T('moves-state');
    check(name, !!t1 && r2.moved === 1 && ex(inStore('Dup3 (2).url')) && broken && dom.length === 2 && dom.filter(Boolean).length === 1
      && !st2.missing.includes(t1.id) && readFileSync(inStore('Dup3 (2).url'), 'utf8').includes('second'),
    { r2, broken, dom, after: st2.missing.length });
  });

  // F6. C4: the store path's length, checked before the move.
  await guarded('fix C4 (m-4): a store path of 260 characters is refused before the move with the ruled reason and "It is still on the desktop."; one character less moves', async (name) => {
    const nameFor = (len, ch) => `${ch.repeat(len - D.store.length - 1 - 4)}.url`;
    const ok = url(join(D.desktop, nameFor(259, 'L')), 'https://example.invalid/long-ok');
    const no = url(join(D.desktop, nameFor(PROBE ? 259 : 260, 'M')), 'https://example.invalid/long-no');
    const h = sha(no);
    const b0 = (await boxes()).length;
    const r = await drop(rG, [ok, no]);
    const bx = (await boxes()).slice(b0);
    check(name, r.moved === 1 && r.failed === 1 && !ex(ok) && ex(inStore(basename(ok))) && ex(no) && sha(no) === h
      && bx.length === 1 && bx[0].detail === S.tooLong && bx[0].message.endsWith('It is still on the desktop.'),
    { r, storeLen: D.store.length, boxes: bx.map((b) => [b.message.slice(0, 40), b.detail]) });
  });

  // F7. C5: the banner's two layers in the primary region's page (the updater's target).
  await guarded('fix C5 (m-5): a notice over an update offer takes the slot in --text with a "Dismiss" ✕; after 8 s the offer is back with a working DOWNLOAD; a progress event shows after the notice; the tray dot is cleared only by the offer\'s own ✕', async (name) => {
    const P = page(rP);
    const view = () => P.eval(`(() => { const b = document.getElementById('update-banner'); const t = document.getElementById('update-text');
      const tok = (v) => { const e = document.createElement('div'); e.style.color = 'var(' + v + ')'; document.body.appendChild(e); const c = getComputedStyle(e).color; e.remove(); return c; };
      const btns = [...document.querySelectorAll('#update-actions button')];
      const x = btns.find((x) => x.classList.contains('update-dismiss'));
      return { shown: !b.classList.contains('hidden'), notice: b.classList.contains('notice'), text: t.textContent, color: getComputedStyle(t).color, text_: tok('--text'),
        buttons: btns.map((x) => [x.textContent, x.disabled]), xTitle: x ? x.title : null, xAria: x ? x.getAttribute('aria-label') : null, xColor: x ? getComputedStyle(x).color : null }; })()`);
    const dismissals = async () => (await T('update-dismissals')).count;
    const ev = (channel, arg) => T('update-event', arg === undefined ? { channel } : { channel, arg });
    const steps = {};
    const g = await P.eval(`(() => { const r = document.getElementById('app-grid').getBoundingClientRect(); return { x: Math.round(r.left + 30), y: Math.round(r.top + 30) }; })()`);
    const pageDrop = (paths) => P.eval(`window.__qlFileDrop(${JSON.stringify(paths)}, ${g.x}, ${g.y})`, 90000);
    await ev('update-available', { version: '9.9.9' });
    await sleep(150);
    steps.offer = await view();
    const d0 = await dismissals();
    await pageDrop([FIX.notes]);
    await sleep(150);
    steps.notice = await view();
    await sleep(8400);
    steps.back = await view();
    if (PROBE) await P.eval(`window.api.invoke('dismiss-update')`);
    steps.dAfterTime = await dismissals();
    await pageDrop([FIX.notes]);
    await sleep(150);
    await ev('update-progress', 42);
    await sleep(150);
    steps.during = await view();
    await P.eval(`(() => { const x = document.querySelector('#update-actions .update-dismiss'); if (x) x.click(); return true; })()`);
    await sleep(150);
    steps.afterX = await view();
    steps.dAfterX = await dismissals();
    await P.eval(`(() => { const x = document.querySelector('#update-actions .update-dismiss'); if (x) x.click(); return true; })()`);
    await sleep(150);
    steps.closed = await view();
    steps.dClosed = await dismissals();
    const s = steps;
    check(name, s.offer.shown && !s.offer.notice && s.offer.text === 'UPDATE AVAILABLE — v9.9.9' && JSON.stringify(s.offer.buttons) === JSON.stringify([['DOWNLOAD', false], ['✕', false]])
      && s.offer.xTitle === 'Dismiss' && s.offer.xAria === 'Dismiss'
      && s.notice.shown && s.notice.notice && s.notice.text === 'NOT A SHORTCUT' && s.notice.color === s.notice.text_ && s.notice.xColor === s.notice.text_
      && s.notice.xTitle === 'Dismiss' && s.notice.xAria === 'Dismiss' && JSON.stringify(s.notice.buttons) === JSON.stringify([['✕', false]])
      && s.back.shown && !s.back.notice && s.back.text === 'UPDATE AVAILABLE — v9.9.9' && JSON.stringify(s.back.buttons) === JSON.stringify([['DOWNLOAD', false], ['✕', false]])
      && s.dAfterTime === d0 && s.during.notice && s.during.text === 'NOT A SHORTCUT'
      && s.afterX.shown && !s.afterX.notice && s.afterX.text === 'DOWNLOADING... 42%' && s.dAfterX === d0
      && !s.closed.shown && s.dClosed === d0 + 1,
    { offer: s.offer.text, notice: [s.notice.text, s.notice.color, s.notice.text_, s.notice.xTitle], back: [s.back.text, JSON.stringify(s.back.buttons)], during: s.during.text, afterX: s.afterX.text, dismissals: [d0, s.dAfterTime, s.dAfterX, s.dClosed] });
  });

}

// WCAG contrast of two computed colours (alpha flattened on black, as the contrast gate does).
function contrast(a, b) {
  const lum = (c) => {
    const m = String(c).match(/[\d.]+/g);
    if (!m) return 0;
    const [r, g, bl, al = 1] = m.map(Number);
    const ch = [r, g, bl].map((v) => { const s = (v * Number(al)) / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// A desktop point at least 40 px from every region panel (shared by the M2 and M2b checks).
function emptyDesktopPoint(d, inner) {
  const panels = d.regions.map((r) => r.shown);
  for (let y = inner.y + 40; y < inner.y + inner.height - 40; y += 24) {
    for (let x = inner.x + 40; x < inner.x + inner.width - 40; x += 24) {
      if (panels.every((r) => x < r.x - 40 || x > r.x + r.width + 40 || y < r.y - 40 || y > r.y + r.height + 40)) return { x, y };
    }
  }
  return { x: -99999, y: -99999 };
}

let failed = false;
try {
  await run();
} catch (e) {
  failed = true;
  check('self-test ran to the end', false, String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' / ') : e));
}
for (const s of pages.values()) s.close();
const code = await Promise.race([guardDone, sleep((TIMEOUT + 60) * 1000).then(() => 'timeout')]);
const out = guardOut.join('');
// The observer runs on past the app's exit, so the quit path is covered too.
await sleep(800);
writeFileSync(`${OBS_LOG}.stop`, '');
if ((await Promise.race([observerDone, sleep(6000).then(() => 'timeout')])) === 'timeout') { try { observer.kill(); } catch { /* gone */ } }
const fgEvents = readEvents(existsSync(OBS_LOG) ? readFileSync(OBS_LOG, 'utf8') : '');
// --probe: one foreground event for this build, as the unguarded SetParent produced (TechPlan 7.1).
if (PROBE) fgEvents.push({ t: Date.now(), ev: 'FOREGROUND', now: { cls: 'Chrome_WidgetWin_1', proc: EXE, visible: false }, prev: { cls: 'probe', proc: 'probe.exe', visible: true } });
const fv = foregroundVerdict(fgEvents, { exe: EXE });
for (const c of fv.changes) console.log(`foreground change +${c.at} ms: ${c.from} -> ${c.to}${c.ours ? '   <-- THIS BUILD' : ''}`);
console.log(`foreground changes during the run: ${fv.changes.length} (to this build: ${fv.ours.length})`);
check('focus: no foreground change went to this build (out-of-process observer, launch to after quit)', fv.ok && fv.started && fv.ended,
  { hooks: fv.hooksOk, toThisBuild: fv.ours.length, allChanges: fv.changes.length });
// Liveness: the hook sees this build's top-level windows (fallback windows; in attached mode the forced drop to fallback).
const needShows = FALLBACK ? 8 : 1;
check('focus: the observer saw top-level windows of this build (it is watching our process)', fv.ourShows >= needShows, { ourShows: fv.ourShows, need: needShows });
check('guard: clean run (exited, nothing left, startup keys and real data untouched)', code === 0 && /ended by exited/.test(out) && /remaining 0/.test(out.replace(/remaining\s+/, 'remaining ')),
  (out.match(/CITE:.*$/m) || ['no CITE line'])[0]);
// The REAL Desktop and Public Desktop, before the launch and after the quit (names, kinds, sizes, times).
const realAfter = listRealFolders();
const realSame = JSON.stringify(realBefore) === JSON.stringify(realAfter);
check('real Desktop and Public Desktop: identical before the launch and after the quit (read-only listing)',
  realSame && !!realBefore.Desktop && !!realBefore.PublicDesktop,
  { folders: REAL_FOLDERS, entries: { Desktop: realAfter.Desktop && realAfter.Desktop.length, PublicDesktop: realAfter.PublicDesktop && realAfter.PublicDesktop.length } });
if (PROBE) {
  // Positive control of that comparison: the same listing of the fake desktop, which this run changed.
  const fake = { Desktop: FIX.dirs.desktop, PublicDesktop: FIX.dirs.publicDesktop };
  check('probe: the desktop listing comparison sees the fake desktop the run changed', JSON.stringify(fakeBefore) === JSON.stringify(listRealFolders(fake)), 'expected to fail');
}
check('real store folder: %USERPROFILE%\\QuickLauncher Shortcuts was not created', !existsSync(join(process.env.USERPROFILE || '', 'QuickLauncher Shortcuts')) || REAL_STORE_EXISTED,
  { existedBefore: REAL_STORE_EXISTED });
// Renderer errors: Chromium logs console messages with --enable-logging.
let appLog = '';
try { appLog = readFileSync(join(PROFILE, 'ql-safe-launch.log'), 'utf8'); } catch { /* none */ }
const consoleLines = appLog.split(/\r?\n/).filter((l) => /CONSOLE\(/.test(l));
const errors = appLog.split(/\r?\n/).filter((l) => /Uncaught|Blocked IPC|TypeError|ReferenceError/.test(l));
check('renderers: no uncaught errors in the run log', errors.length === 0 && /\[regions\]/.test(appLog),
  { errors: errors.slice(0, 3).map((l) => l.slice(0, 200)), consoleLines: consoleLines.length });
console.log('\n--- guard report ---');
console.log(out.trim());
const pass = results.filter((r) => r.ok).length;
console.log(`\nRESULT: ${pass}/${results.length} checks passed${failed ? ' (run aborted)' : ''}`);
console.log(`log: ${join(PROFILE, 'ql-safe-launch.log')}`);
process.exit(pass === results.length ? 0 : 1);
