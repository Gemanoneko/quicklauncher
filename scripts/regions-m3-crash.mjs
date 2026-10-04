#!/usr/bin/env node
/**
 * regions-m3-crash.mjs: the M3 file move on the packaged build, across launches.
 *
 *   node scripts/regions-m3-crash.mjs --guard <quicklaunch-safe-launch.mjs> --part <crash-add|crash-back|restore|refusal>
 *        [--exe <QuickLauncher.exe>] [--root <folder in %TEMP%>] [--port 9351] [--probe]
 *
 * Every launch goes through the studio's QA launch guard on a temp profile, with
 * --ql-test-hooks and --ql-test-desktop=<case>\desk (a fake Desktop, Public
 * Desktop and store folder). Nothing outside --root is written; nothing is deleted.
 *
 *   crash-add / crash-back: for each step of an add (intent, moved, committed) or of
 *     a move back, the app exits right after that step (test hook: the windows leave
 *     Explorer's tree, then app.exit(70); no journal update, no pending save). A
 *     second launch on the same profile must reconcile the journal (tech plan § 3).
 *   restore: --ql-restore-all on a profile with moved files and a file without a
 *     tile (exit 0, all back); then with one file held open (exit 2, it stays), then
 *     again (exit 0).
 *   refusal: --ql-test-desktop outside %TEMP% must exit 64 and create nothing.
 *
 * The real Desktop and Public Desktop are listed (read-only) before and after, and a
 * read-only foreground observer runs from before the first launch to after the last.
 * --probe: each check is given a wrong expectation-side input and must fail
 * (crash: the second launch is skipped; restore: the held file is not held; refusal:
 * a folder inside %TEMP% is passed). Exit 0 when every check passes.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const require = createRequire(import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(`--${name}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : def; };
const PART = opt('part', null);
const PORT = Number(opt('port', '9351'));
const EXE = resolve(opt('exe', join(REPO, 'dist', 'win-unpacked', 'QuickLauncher.exe')));
const GUARD = opt('guard', null);
const PROBE = argv.includes('--probe');
const ROOT = resolve(opt('root', join(tmpdir(), 'ql-regions-m3')));
if (!['crash-add', 'crash-back', 'restore', 'refusal'].includes(PART)) { console.error('m3-crash: --part crash-add|crash-back|restore|refusal'); process.exit(1); }
if (!GUARD || !existsSync(GUARD)) { console.error('m3-crash: --guard <quicklaunch-safe-launch.mjs> is required'); process.exit(1); }
if (!existsSync(EXE)) { console.error(`m3-crash: no build at ${EXE}`); process.exit(1); }
mkdirSync(ROOT, { recursive: true });
{
  const real = realpathSync.native(ROOT).toLowerCase();
  const temps = [tmpdir(), process.env.TEMP, process.env.TMP].filter(Boolean).map((p) => realpathSync.native(p).toLowerCase());
  if (!temps.some((t) => real.startsWith(t + sep))) { console.error(`m3-crash: --root must be inside the temp folder; got ${ROOT}`); process.exit(1); }
}
const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
const RUN = join(ROOT, `${stamp}-${PART}`);
mkdirSync(RUN, { recursive: true });

const results = [];
function check(name, ok, evidence) {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${evidence !== undefined ? `  | ${typeof evidence === 'string' ? evidence : JSON.stringify(evidence)}` : ''}`);
}

// ── Win32 (koffi): the real folders, read-only; test-side holds ─────────────
const koffi = require(join(REPO, 'node_modules', 'koffi'));
const k32 = koffi.load('kernel32.dll');
const CreateFileW = k32.func('intptr __stdcall CreateFileW(str16 name, uint32 access, uint32 share, intptr sa, uint32 disp, uint32 flags, intptr tmpl)');
const CloseHandle = k32.func('int __stdcall CloseHandle(intptr h)');
const holdOpen = (p) => { const h = CreateFileW(p, 0x80000000, 1, 0, 3, 0x80, 0); if (!h || h === -1) throw new Error(`hold ${p}`); return () => CloseHandle(h); };
const shell32 = koffi.load('shell32.dll');
const ole32 = koffi.load('ole32.dll');
const SHGetKnownFolderPath = shell32.func('int32 __stdcall SHGetKnownFolderPath(void *rfid, uint32 flags, intptr token, _Out_ void **path)');
const CoTaskMemFree = ole32.func('void __stdcall CoTaskMemFree(void *pv)');
function knownFolder(id) {
  const h = id.replace(/[{}-]/g, ''); const g = Buffer.alloc(16);
  g.writeUInt32LE(parseInt(h.slice(0, 8), 16), 0); g.writeUInt16LE(parseInt(h.slice(8, 12), 16), 4); g.writeUInt16LE(parseInt(h.slice(12, 16), 16), 6);
  for (let i = 0; i < 8; i++) g[8 + i] = parseInt(h.slice(16 + i * 2, 18 + i * 2), 16);
  const out = [null];
  if (SHGetKnownFolderPath(g, 0, 0, out) !== 0) return null;
  try { return koffi.decode(out[0], 'char16_t', -1); } finally { CoTaskMemFree(out[0]); }
}
const REAL = { Desktop: knownFolder('{B4BFCC3A-DB2C-424C-B029-7FE99A87C641}'), PublicDesktop: knownFolder('{C4AA340D-F20F-4863-AFEF-F87EF2E6BA25}') };
const listReal = () => Object.fromEntries(Object.entries(REAL).map(([k, d]) => [k, readdirSync(d).sort().map((n) => { const s = lstatSync(join(d, n)); return `${n}|${s.isDirectory() ? 'd' : 'f'}|${s.size}|${s.mtimeMs}`; })]));
const realBefore = listReal();
const realStore = join(process.env.USERPROFILE || '', 'QuickLauncher Shortcuts');
const realStoreBefore = existsSync(realStore);
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

// ── observer ────────────────────────────────────────────────────────────────
const { readEvents, foregroundVerdict } = require('./fg-verdict.cjs');
const OBS_LOG = join(RUN, 'fg-observer.jsonl');
const observer = spawn(process.execPath, [join(HERE, 'fg-observer.mjs'), OBS_LOG, '900'], { stdio: 'ignore', windowsHide: true });
const observerDone = new Promise((r) => observer.on('exit', (c) => r(c)));
for (let i = 0; i < 50; i++) { if (existsSync(OBS_LOG) && /"ev":"hooks"/.test(readFileSync(OBS_LOG, 'utf8'))) break; await sleep(100); }

// ── a case: profile + fake desktop ──────────────────────────────────────────
const SAFE = { apps: [], settings: { iconSize: 64, startWithWindows: false, randomTheme: false, theme: 'matrix', windowPosition: null, globalHotkey: null, reducedMotion: false } };
function makeCase(name) {
  const dir = join(RUN, name);
  const c = { dir, profile: join(dir, 'profile'), desk: join(dir, 'desk') };
  c.desktop = join(c.desk, 'Desktop');
  c.store = join(c.desk, 'QuickLauncher Shortcuts');
  for (const d of [c.profile, c.desktop, join(c.desk, 'Public Desktop')]) mkdirSync(d, { recursive: true });
  writeFileSync(join(c.profile, 'quicklauncher-data.json'), `${JSON.stringify(SAFE, null, 2)}\n`);
  c.data = () => JSON.parse(readFileSync(join(c.profile, 'quicklauncher-data.json'), 'utf8'));
  c.journal = () => { try { return JSON.parse(readFileSync(join(c.profile, 'moves-journal.json'), 'utf8')).entries; } catch { return null; } };
  c.log = () => { try { return readFileSync(join(c.profile, 'ql-safe-launch.log'), 'utf8'); } catch { return ''; } };
  return c;
}

// ── launch through the guard ────────────────────────────────────────────────
let launches = 0;
function launch(c, appArgs, { timeout = 90 } = {}) {
  launches++;
  const out = [];
  const g = spawn(process.execPath, [GUARD, '--exe', EXE, '--profile', c.profile, '--timeout', String(timeout), '--', ...appArgs],
    { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  g.stdout.on('data', (d) => out.push(String(d)));
  g.stderr.on('data', (d) => out.push(String(d)));
  const done = new Promise((r) => g.on('exit', (code) => r({ code, out: out.join('') })));
  return { done };
}
const cite = (o) => (o.match(/CITE:.*$/m) || ['no CITE'])[0];
const appExit = (o) => { const m = /ended by exited \(code (-?\d+)\)/.exec(o); return m ? Number(m[1]) : null; };
const guardClean = (o) => /RESULT: PASS/.test(o) && /remaining\s+0/.test(o);

// ── tiny CDP client ─────────────────────────────────────────────────────────
async function targets() { try { return await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); } catch { return []; } }
async function session(t) {
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0;
  const waiting = new Map();
  ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && waiting.has(msg.id)) { waiting.get(msg.id).res(msg); waiting.delete(msg.id); } };
  ws.onclose = () => { for (const w of waiting.values()) w.rej(new Error('page closed')); waiting.clear(); };
  return {
    eval(expr, timeoutMs = 60000) {
      return new Promise((res, rej) => {
        const id = ++seq;
        const timer = setTimeout(() => { waiting.delete(id); rej(new Error('CDP timeout')); }, timeoutMs);
        waiting.set(id, { res: (r) => { clearTimeout(timer); if (r.result && r.result.exceptionDetails) rej(new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 200))); else res(r.result && r.result.result ? r.result.result.value : undefined); }, rej: (e) => { clearTimeout(timer); rej(e); } });
        ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, awaitPromise: true, returnByValue: true } }));
      });
    },
    close() { try { ws.close(); } catch { /* gone */ } },
  };
}
async function attach() {
  let region = null;
  for (let i = 0; i < 120 && !region; i++) { region = (await targets()).find((t) => t.type === 'page' && /index\.html\?/.test(t.url)) || null; if (!region) await sleep(250); }
  if (!region) throw new Error('no region page');
  const r = await session(region);
  for (let i = 0; i < 60; i++) { if (await r.eval(`typeof apps !== 'undefined' && document.body.classList.contains('region')`).catch(() => false)) break; await sleep(150); }
  await r.eval(`window.api.invoke('region:open-manager', { view: 'regions' })`);
  let m = null;
  for (let i = 0; i < 60 && !m; i++) { m = (await targets()).find((t) => t.type === 'page' && /manager\.html/.test(t.url)) || null; if (!m) await sleep(250); }
  const mgr = await session(m);
  for (let i = 0; i < 60; i++) { if (await mgr.eval(`typeof window.api === 'object' && document.readyState === 'complete'`).catch(() => false)) break; await sleep(150); }
  const T = (op, arg = {}) => mgr.eval(`window.api.invoke('manager:test', ${JSON.stringify(op)}, ${JSON.stringify(arg)})`);
  // The move is set up and its startup reconcile is done (moves-ready) once moves-state answers with folders.
  for (let i = 0; i < 100; i++) { const s = await T('moves-state').catch(() => null); if (s && s.ok && s.ready) break; await sleep(150); }
  await sleep(500);
  return { r, mgr, T, close: () => { r.close(); mgr.close(); } };
}
const appArgs = (c, extra = []) => [`--remote-debugging-port=${PORT}`, '--ql-test-hooks', '--ql-no-update-check', '--enable-logging', `--ql-test-desktop=${c.desk}`, ...extra];

async function quit(a) { await a.T('quit').catch(() => {}); a.close(); }

// ── crash after each step, then reconcile ───────────────────────────────────
async function crashCase(step) {
  const c = makeCase(step.replace(':', '-'));
  const file = join(c.desktop, 'Crash.lnk');
  writeFileSync(file, `crash test ${step}`); // not a real shortcut: never launched (test hooks)
  const fileSha = sha(file);
  const storeFile = join(c.store, 'Crash.lnk');
  // Launch 1: (for a back step, the add first), then the crash at the step.
  const L1 = launch(c, appArgs(c));
  let a = await attach();
  let itemId = null;
  if (launches === 1) { const f = await a.T('force-fallback', { regionId: await a.r.eval(`new URL(location.href).searchParams.get('region')`) }); void f; } // the observer sees one of our windows
  if (step.startsWith('back:')) {
    await a.r.eval(`window.api.invoke('region:drop-files', ${JSON.stringify({ paths: [file] })})`, 60000);
    itemId = (await a.r.eval('apps.map((x) => ({ id: x.id, kind: x.kind }))')).find((x) => x.kind === 'moved').id;
  }
  await a.T('move-hook', { crashAt: step });
  const trigger = step.startsWith('add:')
    ? a.r.eval(`window.api.invoke('region:drop-files', ${JSON.stringify({ paths: [file] })})`, 60000)
    : a.r.eval(`window.api.invoke('region:move-back', ${JSON.stringify({ itemIds: [itemId] })})`, 60000);
  await trigger.catch(() => {}); // the page dies with the app
  a.close();
  const r1 = await L1.done;
  const log1 = c.log();
  const j1 = c.journal() || [];
  const disk1 = { src: existsSync(file), dst: existsSync(storeFile), back: step.startsWith('back:') ? existsSync(file) : null };
  const crashed = appExit(r1.out) === 70 && log1.includes(`"step":"${step}"`) && /test-crash/.test(log1);
  // Launch 2 on the same profile: the startup reconcile (skipped by --probe: the state then stays mid-move).
  let r2 = null;
  let st = null;
  if (!PROBE) {
    const L2 = launch(c, appArgs(c));
    a = await attach();
    st = await a.T('moves-state');
    await quit(a);
    r2 = await L2.done;
  }
  const d = c.data();
  const moved = (d.apps || []).filter((x) => x.kind === 'moved');
  const j2 = c.journal() || [];
  const hist = (() => { try { return readFileSync(join(c.profile, 'moves-log.jsonl'), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } })();
  const rec = hist.filter((h) => h.reconciled);
  const want = {
    'add:intent': { outcome: 'aborted', items: 0, onDesktop: true },
    'add:moved': { outcome: 'done', items: 1, onDesktop: false },
    'add:committed': { outcome: 'done', items: 1, onDesktop: false },
    'back:intent': { outcome: 'aborted', items: 1, onDesktop: false },
    'back:moved': { outcome: 'done', items: 0, onDesktop: true },
    'back:committed': { outcome: 'done', items: 0, onDesktop: true },
  }[step];
  const fileNow = want.onDesktop ? file : storeFile;
  check(`crash after ${step}, then a new start: the journal had the intent pending; the reconcile ${want.outcome === 'done' ? 'finishes it' : 'aborts it'}; ${want.items} moved tile(s); the file is ${want.onDesktop ? 'on the desktop' : 'in the store folder'}, byte-identical; nothing pending`,
    crashed && j1.length === 1 && j1[0].state === 'intent' && j1[0].op === step.split(':')[0]
    && !!r2 && guardClean(r1.out) && guardClean(r2.out) && st && st.pending.length === 0 && j2.length === 0
    && rec.length === 1 && rec[0].state === want.outcome && moved.length === want.items
    && existsSync(fileNow) && sha(fileNow) === fileSha && (want.onDesktop ? !existsSync(storeFile) : !existsSync(file))
    && (want.items === 0 || (moved[0].path.toLowerCase() === storeFile.toLowerCase() && moved[0].origin.toLowerCase().endsWith('\\desktop\\crash.lnk'))),
    { appExit1: appExit(r1.out), journalAfterCrash: j1.map((x) => `${x.op}:${x.state}`), diskAfterCrash: disk1, reconciled: rec.map((x) => `${x.state}: ${x.note}`), items: moved.length, cite1: cite(r1.out), cite2: r2 && cite(r2.out) });
}

// ── restore-all ─────────────────────────────────────────────────────────────
async function restoreCases() {
  const c = makeCase('restore');
  const files = ['One.lnk', 'Two.url', 'Three.lnk'].map((n) => { const p = join(c.desktop, n); writeFileSync(p, `restore ${n}`); return p; });
  const shas = files.map(sha);
  const L1 = launch(c, appArgs(c));
  const a = await attach();
  await a.r.eval(`window.api.invoke('region:drop-files', ${JSON.stringify({ paths: files })})`, 60000);
  await quit(a);
  const r1 = await L1.done;
  writeFileSync(join(c.store, 'Orphan.lnk'), 'a file with no tile');
  const movedBefore = c.data().apps.filter((x) => x.kind === 'moved').length;
  // Restore with Three held open: it stays, exit 2.
  const three = join(c.store, 'Three.lnk');
  const release = PROBE ? () => {} : holdOpen(three);
  let r2;
  try { r2 = await launch(c, ['--ql-restore-all', `--ql-test-desktop=${c.desk}`], { timeout: 60 }).done; } finally { release(); }
  const mid = { exit: appExit(r2.out), left: readdirSync(c.store).filter((n) => /\.(lnk|url)$/i.test(n)), moved: c.data().apps.filter((x) => x.kind === 'moved').map((x) => x.name) };
  check('restore-all with one file held open: exit 2; every other moved file and the file without a tile are back on the desktop; the held one stays in the store folder with its tile',
    movedBefore === 3 && guardClean(r1.out) && mid.exit === 2 && JSON.stringify(mid.left) === JSON.stringify(['Three.lnk']) && JSON.stringify(mid.moved) === JSON.stringify(['Three'])
    && existsSync(files[0]) && sha(files[0]) === shas[0] && existsSync(files[1]) && sha(files[1]) === shas[1] && existsSync(join(c.desktop, 'Orphan.lnk')) && guardClean(r2.out),
    { movedBefore, mid, cite: cite(r2.out) });
  const r3 = await launch(c, ['--ql-restore-all', `--ql-test-desktop=${c.desk}`], { timeout: 60 }).done;
  const end = { exit: appExit(r3.out), store: readdirSync(c.store), moved: c.data().apps.filter((x) => x.kind === 'moved').length, journal: (c.journal() || []).length };
  // Restore mode builds no region host (they log "mode") and no Manager.
  const noWindow = /"event":"restore-all"/.test(c.log()) && !/"event":"mode"/.test(c.log()) && !/manager-open/.test(c.log());
  check('restore-all again: exit 0; nothing moved is left (only README.txt in the store folder); no moved item in the data file; nothing pending; no window was made',
    end.exit === 0 && JSON.stringify(end.store) === JSON.stringify(['README.txt']) && end.moved === 0 && end.journal === 0 && existsSync(files[2]) && sha(files[2]) === shas[2] && noWindow && guardClean(r3.out),
    { end, cite: cite(r3.out) });
}

// ── test mode refused outside %TEMP% ────────────────────────────────────────
async function refusalCase() {
  const c = makeCase('refusal');
  const outside = PROBE ? join(c.dir, 'inside-temp') : join(REPO, 'scratch', `ql-m3-refusal-${stamp}`);
  const r = await launch(c, ['--ql-test-hooks', '--ql-no-update-check', '--enable-logging', `--ql-test-desktop=${outside}`], { timeout: 30 }).done;
  const log = c.log();
  check('--ql-test-desktop outside %TEMP% is refused: the app exits 64 before any window, and the folder is not created',
    appExit(r.out) === 64 && /--ql-test-desktop refused/.test(log) && !existsSync(outside) && guardClean(r.out),
    { exit: appExit(r.out), folder: outside, created: existsSync(outside), log: (log.match(/\[moves\][^\n]*/) || [''])[0].slice(0, 300), cite: cite(r.out) });
}

let failed = false;
try {
  if (PART === 'crash-add') for (const s of ['add:intent', 'add:moved', 'add:committed']) await crashCase(s);
  if (PART === 'crash-back') for (const s of ['back:intent', 'back:moved', 'back:committed']) await crashCase(s);
  if (PART === 'restore') await restoreCases();
  if (PART === 'refusal') await refusalCase();
} catch (e) {
  failed = true;
  check('ran to the end', false, String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' / ') : e));
}
await sleep(800);
writeFileSync(`${OBS_LOG}.stop`, '');
if ((await Promise.race([observerDone, sleep(6000).then(() => 'timeout')])) === 'timeout') { try { observer.kill(); } catch { /* gone */ } }
const fv = foregroundVerdict(readEvents(existsSync(OBS_LOG) ? readFileSync(OBS_LOG, 'utf8') : ''), { exe: EXE });
for (const ch of fv.changes) console.log(`foreground change +${ch.at} ms: ${ch.from} -> ${ch.to}${ch.ours ? '   <-- THIS BUILD' : ''}`);
check('focus: no foreground change went to this build (out-of-process observer, all launches)', fv.ok && fv.started && fv.ended, { launches, changes: fv.changes.length, toThisBuild: fv.ours.length, ourShows: fv.ourShows });
check('real Desktop and Public Desktop identical before and after; the real store folder not created',
  JSON.stringify(listReal()) === JSON.stringify(realBefore) && (realStoreBefore || !existsSync(realStore)), { entries: Object.fromEntries(Object.entries(realBefore).map(([k, v]) => [k, v.length])) });
const pass = results.filter((r) => r.ok).length;
console.log(`\nRESULT: ${pass}/${results.length} checks passed${failed ? ' (run aborted)' : ''}  (${launches} launches, part ${PART}, folder ${RUN})`);
process.exit(pass === results.length ? 0 : 1);
