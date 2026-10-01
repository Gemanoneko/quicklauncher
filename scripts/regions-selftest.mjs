#!/usr/bin/env node
/**
 * regions-selftest.mjs: M1 self-test of the packaged regions build.
 *
 *   npm run selftest:regions -- [--guard <quicklaunch-safe-launch.mjs>] [--exe <QuickLauncher.exe>]
 *                               [--seed <data file to copy>] [--port 9341] [--timeout 240]
 *
 * Launches the build ONLY through the studio's QA launch guard
 * (scripts/qa/quicklaunch-safe-launch.mjs) on a fresh profile in %TEMP%, with
 * --ql-test-hooks (the Manager opens hidden, never shown or focused) and a
 * remote-debugging port. It then drives the pages over CDP with
 * Runtime.evaluate only: no OS input, no synthetic clicks or keys, no native
 * menus or message boxes. The foreground window is sampled the whole time
 * (koffi, read-only) and must never become ours or the desktop because of us.
 *
 * --seed copies a data file into the profile (the source is only read) and
 * forces the guard's safe settings (startWithWindows false, globalHotkey null,
 * randomTheme false). Without --seed a synthetic library is used.
 * --probe injects an uncaught error and an overlapping button, to prove the
 * error and hit-area checks can fail. Exit 0 when every check passes.
 */
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
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
const TIMEOUT = Number(opt('timeout', '240'));
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
  results.push({ name, ok: !!ok, evidence });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${evidence !== undefined ? `  | ${typeof evidence === 'string' ? evidence : JSON.stringify(evidence)}` : ''}`);
}

// ── foreground sampler (read-only Win32) ────────────────────────────────────
let fg = null;
try {
  const koffi = require(join(REPO, 'node_modules', 'koffi'));
  const user32 = koffi.load('user32.dll');
  const GetForegroundWindow = user32.func('intptr __stdcall GetForegroundWindow()');
  const GetWindowThreadProcessId = user32.func('uint32 __stdcall GetWindowThreadProcessId(intptr hwnd, void *pid)');
  const GetClassNameW = user32.func('int __stdcall GetClassNameW(intptr hwnd, void *buf, int max)');
  fg = () => {
    const h = GetForegroundWindow();
    const pid = Buffer.alloc(4);
    GetWindowThreadProcessId(h, pid);
    const buf = Buffer.alloc(512);
    const n = GetClassNameW(h, buf, 256);
    return { hwnd: Number(h), pid: pid.readUInt32LE(0), cls: n > 0 ? buf.toString('utf16le', 0, n * 2) : '' };
  };
} catch (e) {
  console.log(`note: foreground sampler unavailable (${e.message})`);
}

// ── seed ────────────────────────────────────────────────────────────────────
const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
const PROFILE = join(tmpdir(), 'ql-regions-selftest', stamp);
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
delete seed.regions;
delete seed.regionsVersion;
const seedText = `${JSON.stringify(seed, null, 2)}\n`;
writeFileSync(DATA, seedText);
const N = seed.apps.length;
console.log(`profile ${PROFILE}  (${N} shortcut(s), ${SEED ? 'copied seed' : 'synthetic seed'})`);

// ── launch through the guard ────────────────────────────────────────────────
const guardOut = [];
const guard = spawn(process.execPath, [GUARD, '--exe', EXE, '--profile', PROFILE, '--timeout', String(TIMEOUT),
  '--', `--remote-debugging-port=${PORT}`, '--ql-test-hooks', '--ql-no-update-check', '--enable-logging', ...(FALLBACK ? ['--ql-no-desktop-layer'] : [])], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
guard.stdout.on('data', (d) => guardOut.push(String(d)));
guard.stderr.on('data', (d) => guardOut.push(String(d)));
const guardDone = new Promise((r) => guard.on('exit', (code) => r(code)));

let ourPid = null;
const fgSamples = [];
const fgStart = fg ? fg() : null;
const fgTimer = fg ? setInterval(() => fgSamples.push(fg()), 500) : null;

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
  const send = (method, params = {}) => new Promise((res, rej) => {
    const id = ++seq;
    const timer = setTimeout(() => { waiting.delete(id); rej(new Error(`CDP ${method} timed out on ${t.url}`)); }, 15000);
    waiting.set(id, { res: (v) => { clearTimeout(timer); res(v); }, rej: (e) => { clearTimeout(timer); rej(e); } });
    try { ws.send(JSON.stringify({ id, method, params })); } catch (e) { clearTimeout(timer); waiting.delete(id); rej(e); }
  });
  const s = {
    t,
    async eval(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
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

  // Delete an empty region (no confirm box for an empty region)
  const lastId = ids[ids.length - 1];
  const del = await mgr.eval(`window.api.invoke('manager:delete-region', ${JSON.stringify(lastId)})`);
  const tDel = Date.now();
  let gone = false;
  while (!gone && Date.now() - tDel < 5000) {
    gone = !(await regionPages()).some((t) => regionId(t) === lastId);
    if (!gone) await sleep(200);
  }
  const stAfter = await mgr.eval(`window.api.invoke('manager:state')`);
  check('delete: an empty region goes at once, its window too', del.ok && stAfter.regions.length === 7 && gone, { del, regions: stAfter.regions.length, windowGone: gone, ms: Date.now() - tDel });
  // Exactly one page per region: no window was ever built twice for a region.
  const perRegion = {};
  for (const t of await regionPages()) { const id = regionId(t); perRegion[id] = (perRegion[id] || 0) + 1; }
  const doubles = Object.values(perRegion).filter((v) => v > 1).length;
  check('pages: exactly one page per live region', doubles === 0 && Object.keys(perRegion).length === 7, perRegion);

  // Idle cost with 7 regions (pointer outside, nothing focused)
  await sleep(12000);
  const m1 = await mgr.eval(`window.api.invoke('manager:test', 'metrics')`);
  console.log(`metrics  1 region at boot: ${JSON.stringify(m0)}`);
  console.log(`metrics  ${m1.regions} regions idle: ${JSON.stringify(m1)}`);
  check('idle: 7 regions measured (memory and CPU recorded)', m1.regions === 7 && m1.workingSetMB > 0, { MB: m1.workingSetMB, cpu: m1.cpuPercent, procs: m1.processes });

  // Quit through the same path as the tray's Quit
  await mgr.eval(`window.api.invoke('manager:test', 'quit')`).catch(() => {});
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
if (fgTimer) clearInterval(fgTimer);
const out = guardOut.join('');
const pidLine = /pid (\d+)/.exec(out);
ourPid = pidLine ? Number(pidLine[1]) : null;
if (fg) {
  const ours = fgSamples.filter((s) => s.cls === 'Progman' || s.cls === 'WorkerW' || (ourPid && s.pid === ourPid)).length;
  const changed = fgSamples.filter((s) => fgStart && s.hwnd !== fgStart.hwnd).length;
  check('focus: the foreground never became ours or the desktop', ours === 0, { samples: fgSamples.length, oursOrDesktop: ours, otherChanges: changed });
}
check('guard: clean run (exited, nothing left, startup keys and real data untouched)', code === 0 && /ended by exited/.test(out) && /remaining 0/.test(out.replace(/remaining\s+/, 'remaining ')),
  (out.match(/CITE:.*$/m) || ['no CITE line'])[0]);
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
