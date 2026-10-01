#!/usr/bin/env node
/**
 * regions-selftest.mjs: M1 + M2 + M2b self-test of the packaged regions build.
 *
 *   npm run selftest:regions -- [--guard <quicklaunch-safe-launch.mjs>] [--exe <QuickLauncher.exe>]
 *                               [--seed <data file to copy>] [--port 9341] [--timeout 240]
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
  results.push({ name, ok: !!ok, evidence, at: Date.now() });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${evidence !== undefined ? `  | ${typeof evidence === 'string' ? evidence : JSON.stringify(evidence)}` : ''}`);
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
const guard = spawn(process.execPath, [GUARD, '--exe', EXE, '--profile', PROFILE, '--timeout', String(TIMEOUT),
  '--', `--remote-debugging-port=${PORT}`, '--ql-test-hooks', '--ql-no-update-check', '--enable-logging', ...(FALLBACK ? ['--ql-no-desktop-layer'] : [])], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
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

  // ── M2: between regions, tile keys, display change and resume ────────────
  await m2Checks({ mgr, sessions, ids, r1id, r2id, r3id, wa, inner });
  // ── M2b: Judy's six rulings, activation, the drop to fallback ─────────────
  await m2bChecks({ mgr, sessions, ids, wa, inner });

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
