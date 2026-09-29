#!/usr/bin/env node
// QuickLaunch theme gallery: screenshots every theme without launching QuickLauncher.
//
//   npm run gallery:themes -- --out=<dir> [--ref=<git ref>] [--only=a,b] [--self-test]
//
// Renders the real src/renderer with each theme in offscreen Electron windows (main.cjs)
// and writes, per theme, <theme>-grid.png, <theme>-settings.png and <theme>-hover.png,
// plus theme-metadata.csv/.json, manifest.json and contact sheets in <out>/sheets/.
// File names are stable, so a later "after" run into another folder diffs 1:1.
//
// Options
//   --out=<dir>         output folder (default scratch/theme-gallery/current, gitignored)
//   --work=<dir>        throwaway Electron profile, snapshot and logs (default scratch/theme-gallery/.work)
//   --ref=<git ref>     render a pinned snapshot of that commit (read with git cat-file), not the live tree
//   --only=a,b,c        render only these themes (sheets and metadata then cover just those)
//   --concurrency=<n>   offscreen windows rendering in parallel (default 3)
//   --scale=<n>         device scale factor (default 1.5, Sergei's display)
//   --width= --height=  window size in CSS px (default 424x300, src/main/window.js default)
//   --freeze-ms=<n>     looping animations are frozen at this time (default 2500)
//   --gpu               GPU raster instead of software raster (software is pixel-stable)
//   --timeout=<s>       hard limit for the Electron run (default 540)
//   --self-test         prove every guard can fire (renders one theme; writes to <work>/self-test)
//
// Compare mode (before | after, for sign-off)
//   npm run gallery:themes -- --compare --before=<dir> --after=<dir> --out=<dir> [--only=a,b] [--batch=<name>]
//   Writes <theme>-compare.png per theme (before left, after right; grid, settings, hover rows,
//   each panel labelled with theme, BEFORE/AFTER and commit), batch-<name>.png (the whole batch's
//   main grids in one image, sized for a chat preview), index.html and compare-manifest.json.
//   Themes: --only, else every theme in the AFTER folder. Refuses, before starting anything, when
//   either folder's run did not PASS, the two were captured differently (window, scale, raster,
//   frame, Electron), or a theme or PNG is missing on either side.
//   --before-label= / --after-label=  replace the default "v<version> @<commit>" panel labels
//
// Isolation: QuickLaunch's main process is never loaded; no window is shown or focused; no
// tray, hotkey, audio or network; login-item APIs are counting no-ops. This script READS the
// HKCU Run and StartupApproved\Run keys before and after and fails on any difference (it never
// writes the registry), samples netstat for sockets owned by the processes it started, and
// confirms none of them remain. It ends only the process it spawned, through its own handle.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const require = createRequire(import.meta.url);

// ── args ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const opt = (k, d) => { const a = argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const flag = (k) => argv.includes(`--${k}`);
if (flag('help') || flag('h')) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n')); process.exit(0); }
const selfTest = flag('self-test');
const compare = flag('compare');
if (compare && selfTest) { console.error('--compare and --self-test are separate runs'); process.exit(2); }
const WORK = path.resolve(opt('work', path.join(REPO, 'scratch', 'theme-gallery', '.work')));
const OUT = path.resolve(selfTest ? path.join(WORK, 'self-test') : opt('out', path.join(REPO, 'scratch', 'theme-gallery', compare ? 'compare' : 'current')));
const ref = opt('ref', null);
const only = opt('only', '') ? opt('only').split(',').map((s) => s.trim()).filter(Boolean) : (selfTest ? ['cyberpunk', 'dune'] : null);
const num = (k, d) => { const v = Number(opt(k, d)); if (!Number.isFinite(v) || v <= 0) { console.error(`bad --${k}`); process.exit(2); } return v; };
const cfgBase = {
  scale: num('scale', 1.5), width: Math.round(num('width', 424)), height: Math.round(num('height', 300)),
  freezeMs: Math.round(num('freeze-ms', 2500)), concurrency: Math.round(num('concurrency', 3)),
  timeoutSec: Math.round(num('timeout', 540)), gpu: flag('gpu'), selfTest,
};

// ── refusals ─────────────────────────────────────────────────────────────────
const lc = (p) => path.resolve(p).toLowerCase();
const inside = (parent, child) => { const r = path.relative(lc(parent), lc(child)); return r === '' || (!r.startsWith('..') && !path.isAbsolute(r)); };
const appData = process.env.APPDATA || '';
const localAppData = process.env.LOCALAPPDATA || '';
const refuse = [];
for (const [label, p] of [['--out', OUT], ['--work', WORK]]) {
  if (appData && inside(path.join(appData, 'QuickLauncher'), p)) refuse.push(`${label} is inside the real QuickLauncher profile`);
  if (localAppData && inside(path.join(localAppData, 'Programs'), p)) refuse.push(`${label} is inside an installed-apps folder`);
  for (const sub of ['src', 'dist', 'node_modules', '.git']) if (inside(path.join(REPO, sub), p)) refuse.push(`${label} is inside the repo's ${sub}/`);
}

// Compare plan: both folders must be PASSing gallery runs captured the same way, and every
// theme compared must have all three PNGs on both sides. Checked before anything starts.
let comparePlan = null;
if (compare) {
  const localStamp = (iso) => { const d = new Date(iso); return Number.isNaN(+d) ? '?' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const side = (label, dir, override) => {
    if (!dir) { refuse.push(`--compare needs ${label}=<gallery folder>`); return null; }
    const d = path.resolve(dir);
    let m;
    try { m = JSON.parse(fs.readFileSync(path.join(d, 'manifest.json'), 'utf8')); } catch { refuse.push(`${label}: no readable manifest.json in ${d}`); return null; }
    if (m.tool !== 'scripts/theme-gallery' || !m.render || !Array.isArray(m.themes)) { refuse.push(`${label}: ${d} is not a theme-gallery folder`); return null; }
    if (m.selfTest) refuse.push(`${label}: ${d} is a self-test folder`);
    if (m.verdict !== 'PASS') refuse.push(`${label}: that gallery run did not PASS (${(m.failures || []).slice(0, 2).join('; ')})`);
    const q = m.quicklaunch || {};
    const short = String(q.commit || '').slice(0, 7) || '?';
    const where = q.kind === 'snapshot' ? `@${short}` : `live@${short}${q.dirty && q.dirty.length ? '+uncommitted' : ''}`;
    return { dir: d, m, info: { dir: d, label: override || `v${q.version} ${where}`, commit: q.commit || null, kind: q.kind, dirty: q.dirty || [], version: q.version, generated: m.generated, renderedLocal: localStamp(m.generated) } };
  };
  const B = side('--before', opt('before'), opt('before-label')), A = side('--after', opt('after'), opt('after-label'));
  for (const [l, s] of [['--before', B], ['--after', A]]) if (s && (inside(s.dir, OUT) || inside(OUT, s.dir))) refuse.push(`--out overlaps ${l} (${s.dir})`);
  if (B && A) {
    for (const k of ['window', 'scale', 'raster', 'colorProfile', 'frame', 'states', 'tiles']) {
      if (JSON.stringify(B.m.render[k]) !== JSON.stringify(A.m.render[k])) refuse.push(`not like for like: render.${k} is ${JSON.stringify(B.m.render[k])} before, ${JSON.stringify(A.m.render[k])} after; re-render one side with the same options`);
    }
    if (B.m.electron !== A.m.electron) refuse.push(`not like for like: Electron ${B.m.electron} before, ${A.m.electron} after; re-render BEFORE on this toolchain with --ref=<its commit>`);
    const okThemes = (m) => new Map(m.themes.filter((t) => t.ok).map((t) => [t.theme, t.name]));
    const bt = okThemes(B.m), at = okThemes(A.m);
    const want = only || [...at.keys()].sort();
    if (!want.length) refuse.push('no themes to compare');
    const missing = want.filter((t) => !bt.has(t) || !at.has(t)).map((t) => `${t} (${[!bt.has(t) && 'not in BEFORE', !at.has(t) && 'not in AFTER'].filter(Boolean).join(', ')})`);
    if (missing.length) refuse.push(`missing theme(s): ${missing.join(', ')}`);
    for (const t of want) for (const s of ['grid', 'settings', 'hover']) for (const [l, x] of [['BEFORE', B], ['AFTER', A]]) {
      if (!fs.existsSync(path.join(x.dir, `${t}-${s}.png`))) refuse.push(`${l}: ${t}-${s}.png missing`);
    }
    const batchName = opt('batch', '');
    const r = B.m.render;
    comparePlan = {
      before: B.info, after: A.info,
      themes: want.map((t) => ({ theme: t, name: at.get(t) || bt.get(t) || t.toUpperCase() })),
      batch: batchName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'batch',
      batchTitle: batchName || 'Theme batch',
      footer: `Both sides: window ${r.window.join('x')} at ${r.scale}x, ${r.raster} raster, same frame rule | BEFORE rendered ${B.info.renderedLocal}, AFTER rendered ${A.info.renderedLocal} | transparent areas shown on #3a3d42`,
    };
  }
}
if (refuse.length) { console.error('REFUSED:\n  ' + refuse.join('\n  ')); process.exit(2); }

// ── helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);
function run(cmd, args, o = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', windowsHide: true, timeout: 60000, maxBuffer: 512 * 1024 * 1024, ...o });
  if (r.error) throw new Error(`${cmd} ${args[0] || ''}: ${r.error.message}`);
  return r;
}
const git = (...a) => { const r = run('git', ['-C', REPO, ...a]); if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr.trim()}`); return r.stdout; };

// Registry, read-only.
const REG_KEYS = [
  ['Run', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'],
  ['StartupApproved\\Run', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StartupApproved\\Run'],
];
function parseRegQuery(text) {
  const values = {};
  for (const raw of String(text).split('\n')) {
    const m = /^ {4}(.+?) {4}(REG_[A-Z0-9_]+)(?: {4}(.*))?$/.exec(raw.replace(/\r$/, ''));
    if (m) values[m[1]] = { type: m[2], data: m[3] === undefined ? '' : m[3] };
  }
  return values;
}
function snapshotRegistry() {
  const out = {};
  for (const [label, key] of REG_KEYS) {
    const r = run('reg', ['query', key], { encoding: 'latin1' });
    if (r.status === 0) out[label] = { exists: true, values: parseRegQuery(r.stdout), raw: r.stdout };
    else if (/unable to find/i.test(r.stderr + r.stdout)) out[label] = { exists: false, values: {}, raw: '' };
    else throw new Error(`reg query ${key} exited ${r.status}`);
  }
  return out;
}
function diffRegistry(before, after) {
  const changes = [];
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const b = before[key] || { exists: false, values: {} }, a = after[key] || { exists: false, values: {} };
    if (b.exists !== a.exists) changes.push(`${key}: key ${a.exists ? 'created' : 'deleted'}`);
    for (const n of new Set([...Object.keys(b.values), ...Object.keys(a.values)])) {
      const bv = b.values[n], av = a.values[n];
      if (!bv) changes.push(`${key}\\${n}: added`);
      else if (!av) changes.push(`${key}\\${n}: removed`);
      else if (bv.type !== av.type || bv.data !== av.data) changes.push(`${key}\\${n}: changed`);
    }
  }
  return changes;
}
const regSummary = (s) => REG_KEYS.map(([l]) => `${l} ${s[l].exists ? Object.keys(s[l].values).length + ' value(s)' : 'absent'} #${hash(s[l].raw)}`).join(', ');

// Processes: image name by PID, from tasklist.
function tasklist() {
  const r = run('tasklist', ['/fo', 'csv', '/nh'], { encoding: 'latin1' });
  const m = new Map();
  for (const line of r.stdout.split(/\r?\n/)) { const x = /^"([^"]*)","(\d+)"/.exec(line); if (x) m.set(Number(x[2]), x[1]); }
  if (m.size < 5) throw new Error('tasklist returned almost nothing');
  return m;
}
// Sockets by owning PID, from netstat -ano.
function netstat() {
  const r = run('netstat', ['-ano'], { encoding: 'latin1' });
  const m = new Map();
  for (const line of r.stdout.split(/\r?\n/)) {
    const x = /^\s*(TCP|UDP)\s+(\S+)\s+(\S+)\s+(?:(\S+)\s+)?(\d+)\s*$/.exec(line);
    if (!x) continue;
    const pid = Number(x[5]);
    if (!m.has(pid)) m.set(pid, []);
    m.get(pid).push(`${x[1]} ${x[2]} -> ${x[3]}${x[4] ? ' ' + x[4] : ''}`);
  }
  return m;
}

// ── source: live tree or pinned snapshot ─────────────────────────────────────
let root = REPO, sourceLabel, source;
if (compare) {
  sourceLabel = `compare ${comparePlan.before.label} -> ${comparePlan.after.label}`;
  source = { kind: 'compare', before: comparePlan.before, after: comparePlan.after };
} else if (ref) {
  const sha = git('rev-parse', '--verify', `${ref}^{commit}`).trim();
  root = path.join(WORK, `src-${sha.slice(0, 12)}`);
  const done = path.join(root, '.complete');
  if (!fs.existsSync(done)) {
    fs.rmSync(root, { recursive: true, force: true });
    const files = git('ls-tree', '-r', '-z', '--name-only', sha, '--', 'src/renderer', 'src/main/preload.js', 'package.json').split('\0').filter(Boolean);
    const r = spawnSync('git', ['-C', REPO, 'cat-file', '--batch'], { input: files.map((f) => `${sha}:${f}`).join('\n') + '\n', windowsHide: true, maxBuffer: 512 * 1024 * 1024, timeout: 60000 });
    if (r.status !== 0) throw new Error('git cat-file failed');
    let off = 0;
    for (const f of files) {
      const nl = r.stdout.indexOf(10, off);
      const [, type, size] = r.stdout.subarray(off, nl).toString('latin1').split(' ');
      if (type !== 'blob') throw new Error(`snapshot: ${f} is ${type}`);
      const body = r.stdout.subarray(nl + 1, nl + 1 + Number(size));
      off = nl + 1 + Number(size) + 1;
      fs.mkdirSync(path.join(root, path.dirname(f)), { recursive: true });
      fs.writeFileSync(path.join(root, f), body);
    }
    fs.writeFileSync(done, `${sha}\n${files.length} files\n`);
  }
  sourceLabel = `snapshot of ${sha.slice(0, 7)}`;
  source = { kind: 'snapshot', ref, commit: sha, root };
} else {
  const head = git('rev-parse', 'HEAD').trim();
  const dirty = git('status', '--porcelain', '--', 'src', 'package.json').trim();
  sourceLabel = `live tree at ${head.slice(0, 7)}${dirty ? ' + uncommitted changes' : ''}`;
  source = { kind: 'live', commit: head, dirty: dirty ? dirty.split('\n') : [], root };
}
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;

// ── run ──────────────────────────────────────────────────────────────────────
fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });
const cfgFile = path.join(WORK, 'config.json');
const statusFile = path.join(WORK, 'status.json');
const resultFile = path.join(WORK, 'result.json');
const logFile = path.join(WORK, 'electron.log');
const ackFile = path.join(WORK, 'sample-ack.txt');
for (const f of [statusFile, resultFile, ackFile]) fs.rmSync(f, { force: true });
const themeTotal = compare ? comparePlan.themes.length : only ? only.length : fs.readdirSync(path.join(root, 'src', 'renderer', 'styles', 'themes')).filter((f) => f.endsWith('.css')).length;
// Netstat / liveness samples: after the first theme and at 80 %; main.cjs waits for each one.
const checkpoints = [...new Set([1, Math.max(1, Math.ceil(themeTotal * 0.8))])];
fs.writeFileSync(cfgFile, JSON.stringify({ ...cfgBase, root, out: OUT, work: WORK, only, compare: comparePlan, statusFile, resultFile, ackFile, checkpoints, sourceLabel: `QuickLaunch v${version}, ${sourceLabel}` }, null, 1));

const electronExe = require('electron'); // path to this repo's electron.exe
const electronVersion = JSON.parse(fs.readFileSync(path.join(REPO, 'node_modules', 'electron', 'package.json'), 'utf8')).version;
console.log(compare ? `QuickLaunch theme gallery COMPARE: ${sourceLabel}; ${themeTotal} theme(s); Electron ${electronVersion}`
  : `QuickLaunch theme gallery${selfTest ? ' SELF-TEST' : ''}: v${version}, ${sourceLabel}; Electron ${electronVersion}`);
console.log(`  out  ${OUT}\n  work ${WORK}`);

const regBefore = snapshotRegistry();
fs.writeFileSync(path.join(WORK, 'registry-before.json'), JSON.stringify(regBefore, null, 1));
const t0 = Date.now();
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const child = spawn(electronExe, [path.join(HERE, 'main.cjs'), `--qlg-config=${cfgFile}`], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, env });
const logStream = fs.createWriteStream(logFile);
let lastLine = '';
for (const s of [child.stdout, child.stderr]) s.on('data', (d) => {
  logStream.write(d);
  for (const l of String(d).split(/\r?\n/)) if (l.startsWith('[gallery] ')) { lastLine = l.slice(10); if (/^\s*\d+\/\d+ |GUARD|FATAL|sheet |source |rendered |compare |diff control/.test(lastLine)) console.log('  ' + lastLine); }
});
const exited = new Promise((res) => child.on('exit', (code, signal) => res({ code, signal })));

const seenPids = new Map(); // pid -> type
const samples = [];
let status = null;
const readStatus = () => { try { status = JSON.parse(fs.readFileSync(statusFile, 'utf8')); for (const p of status.pids) seenPids.set(p.pid, p.type); } catch { /* not yet */ } };
async function sample(label) {
  readStatus();
  const pids = [...seenPids.keys()];
  const tl = tasklist();
  const ns = netstat();
  const alive = pids.filter((p) => tl.has(p));
  const sockets = pids.flatMap((p) => (ns.get(p) || []).map((e) => `${p}: ${e}`));
  // Positive control: the same parser must see the sockets of a PID that has some (RPC on :135).
  const ctlPid = [...ns.entries()].find(([, es]) => es.some((e) => /^TCP \S+:135 -> /.test(e)))?.[0] ?? [...ns.keys()].find((p) => p > 0);
  samples.push({ label, pidsKnown: pids.length, alive: alive.length, sockets, control: { pid: ctlPid, sockets: (ns.get(ctlPid) || []).length } });
}
let timedOut = false;
const deadline = Date.now() + (cfgBase.timeoutSec + 45) * 1000;
const sampled = new Set();
let result = null;
while (!result) {
  const r = await Promise.race([exited, sleep(250).then(() => null)]);
  if (r) { result = r; break; }
  readStatus();
  const pending = status && Array.isArray(status.checkpoints) ? status.checkpoints.filter((c) => !sampled.has(c)) : [];
  if (pending.length) {
    for (const c of pending) sampled.add(c);
    await sample(`checkpoint after ${pending.join(' + ')} of ${status.total} themes`);
    for (const c of pending) fs.appendFileSync(ackFile, `${c}\n`);
  }
  if (Date.now() > deadline) { timedOut = true; console.log('  TIMEOUT: ending the Electron process this script started (own handle)'); child.kill(); result = await exited; }
}
logStream.end();
const wall = Date.now() - t0;
readStatus();

// Every process the run started must be gone. Chromium children follow the main process out.
let left = [];
const until = Date.now() + 15000;
for (;;) {
  const tl = tasklist();
  left = [...seenPids.keys()].filter((p) => (tl.get(p) || '').toLowerCase() === 'electron.exe');
  if (!left.length || Date.now() > until) break;
  await sleep(500);
}
const regAfter = snapshotRegistry();
fs.writeFileSync(path.join(WORK, 'registry-after.json'), JSON.stringify(regAfter, null, 1));
const regChanges = diffRegistry(regBefore, regAfter);

let res = null;
try { res = JSON.parse(fs.readFileSync(resultFile, 'utf8')); } catch (e) { console.log(`  no result file: ${e.message}`); }

// ── verdict ──────────────────────────────────────────────────────────────────
const fails = [];
if (!res) fails.push('Electron run wrote no result');
if (timedOut) fails.push('run timed out and was ended through its own handle');
if (result.code !== 0) fails.push(`Electron exit code ${result.code}${res ? ` (${res.why})` : ''}`);
const results = res ? res.results : [];
const bad = results.filter((r) => !r.ok);
const expected = themeTotal;
if (results.length !== expected) fails.push(`${compare ? 'compared' : 'rendered'} ${results.length} of ${expected} themes`);
const cx = compare && res ? res.extra : {};
if (compare) {
  // The change figure must be able to see a change (grid vs hover of one theme), or "IDENTICAL" means nothing.
  if (!cx.diffControl || !cx.diffControl.pass) fails.push(`diff control did not see a change (${cx.diffControl ? cx.diffControl.pair : 'not run'})`);
  if (!cx.batchSheet) fails.push('no batch sheet written');
  if (!fs.existsSync(path.join(OUT, 'index.html'))) fails.push('no index.html written');
}
if (bad.length) fails.push(`${bad.length} theme(s) with problems`);
// A stale frame from another theme would show up as two themes with the same grid picture.
function findDupes(list) {
  const byGrid = new Map();
  for (const r of list) if (r.states && r.states.grid) byGrid.set(r.states.grid.pixelSha256, [...(byGrid.get(r.states.grid.pixelSha256) || []), r.theme]);
  return [...byGrid.values()].filter((v) => v.length > 1);
}
const dupes = findDupes(results);
if (dupes.length) fails.push(`identical grid captures: ${dupes.map((d) => d.join(' = ')).join('; ')}`);
const counters = res ? res.counters : {};
const guardFails = Object.entries(counters).filter(([, v]) => v > 0);
if (res && res.stubs.broken.length) fails.push(`stubs replaced: ${res.stubs.broken.join(', ')}`);
const unexpected = res ? res.ipc.unexpected : [];
const sockets = samples.flatMap((s) => s.sockets);
if (sampled.size < checkpoints.length || !samples.length) fails.push(`${sampled.size} of ${checkpoints.length} checkpoints sampled mid-run (${samples.length} sample(s))`);
for (const s of samples) {
  if (s.alive < 1) fails.push(`liveness detector saw none of our processes during the run (${s.label})`);
  if (!(s.control.sockets > 0)) fails.push(`netstat control PID showed no sockets (${s.label})`);
}
if (left.length) fails.push(`${left.length} process(es) still running after exit: ${left.join(', ')}`);
if (regChanges.length) fails.push(`registry changed: ${regChanges.join('; ')}`);

const selfControls = [];
if (selfTest) {
  // Orchestrator-side controls: each detector is shown to fire on known-bad input.
  const mutated = JSON.parse(JSON.stringify(regBefore));
  const k = REG_KEYS[0][0];
  mutated[k].values['QLGallerySelfTest'] = { type: 'REG_SZ', data: 'x' };
  const d = diffRegistry(regBefore, mutated);
  selfControls.push({ control: 'registry comparator on a copy with one added value (in memory only)', expected: 'change (gate FAILS)', observed: d.length ? d.join('; ') : 'no change', pass: d.length === 1 });
  const fake = results.length ? [results[0], { ...results[0], theme: `${results[0].theme}-copy` }] : [];
  const fd = findDupes(fake);
  selfControls.push({ control: 'duplicate-grid detector on a list holding one capture twice', expected: 'duplicate (gate FAILS)', observed: fd.length ? fd.map((d) => d.join(' = ')).join('; ') : 'none', pass: fd.length === 1 });
  const s = samples[0];
  selfControls.push({ control: 'liveness detector finds our processes mid-run', expected: '>= 1 alive', observed: s ? `${s.alive} alive of ${s.pidsKnown}` : 'no sample', pass: !!s && s.alive > 0 });
  selfControls.push({ control: 'netstat parser finds sockets of a PID that has them', expected: '>= 1 socket', observed: s ? `PID ${s.control.pid}: ${s.control.sockets}` : 'no sample', pass: !!s && s.control.sockets > 0 });
  for (const c of [...(res ? res.extra.selfTest : []), ...selfControls]) if (!c.pass) fails.push(`self-test control did not fire: ${c.control} (observed ${c.observed})`);
} else {
  for (const [k, v] of guardFails) fails.push(`guard ${k} = ${v}`);
  if (unexpected.length) fails.push(`${unexpected.length} IPC call(s) outside get-apps/get-settings/get-valid-themes/renderer-ready: ${[...new Set(unexpected.map((u) => u.channel))].join(', ')}`);
  if (sockets.length) fails.push(`${sockets.length} socket(s) owned by our processes: ${sockets.slice(0, 5).join(' | ')}`);
}

const pngs = compare ? results.filter((r) => r.file).length : results.reduce((n, r) => n + (r.states ? Object.values(r.states).filter((s) => s.file).length : 0), 0);
const procCount = seenPids.size;
const isolation = {
  counters, stubs: res ? res.stubs : null, ipcCalls: res ? res.ipc.calls : null, unexpectedIpc: unexpected.length,
  registry: { before: regSummary(regBefore), after: regSummary(regAfter), changes: regChanges },
  samples, processes: { started: [...seenPids].map(([pid, type]) => ({ pid, type })), leftAfterExit: left, exit: result, timedOut },
};
const changeText = (d) => (!d ? 'not compared' : d.sizeMismatch ? 'SIZE MISMATCH' : d.changedPx === 0 ? 'IDENTICAL' : `changed ${d.changedPct < 0.1 ? '<0.1' : d.changedPct.toFixed(1)}%`);
if (compare) {
  fs.writeFileSync(path.join(OUT, 'compare-manifest.json'), JSON.stringify({
    tool: 'scripts/theme-gallery', mode: 'compare', generated: new Date().toISOString(), electron: electronVersion,
    before: comparePlan.before, after: comparePlan.after, batch: comparePlan.batch,
    themes: results.map((r) => ({ theme: r.theme, name: r.name, ok: r.ok, problems: r.problems, file: r.file, diffs: r.diffs })),
    batchSheet: cx.batchSheet || null, index: 'index.html', diffControl: cx.diffControl || null,
    isolation, wallMs: wall, verdict: fails.length ? 'FAIL' : 'PASS', failures: fails,
  }, null, 1));
}
const manifest = compare ? null : {
  tool: 'scripts/theme-gallery', generated: new Date().toISOString(), selfTest,
  quicklaunch: { version, ...source }, electron: electronVersion,
  render: { window: [cfgBase.width, cfgBase.height], scale: cfgBase.scale, raster: cfgBase.gpu ? 'gpu' : 'software', colorProfile: 'srgb', transparentWindow: true,
    frame: `looping animations paused at currentTime ${cfgBase.freezeMs} ms; one-shot animations (entrance, hover flourishes) and transitions finished; banner rotation stopped on quote #1`,
    states: { grid: 'main grid, nothing hovered', settings: 'Settings overlay open (btn-settings click)', hover: 'synthetic mouse move over tile #2 (Calculator), settled' },
    tiles: '14 mock tiles (scripts/theme-gallery/mock-data.cjs), store-default settings',
    displays: res ? res.extra.displays : null, displayEvents: res ? res.extra.displayEvents : null },
  isolation,
  wallMs: wall, themes: results.map((r) => ({ theme: r.theme, name: r.name, family: r.family, ok: r.ok, problems: r.problems, states: r.states, hoverTile: r.hoverTile, page: r.page, freeze: r.freeze, fonts: r.fonts, consoleErrors: r.consoleErrors, consoleWarnings: r.consoleWarnings, ms: r.ms })),
  sheets: res ? res.extra.sheets : [], selfTestControls: selfTest ? [...(res ? res.extra.selfTest : []), ...selfControls] : undefined,
  verdict: fails.length ? 'FAIL' : 'PASS', failures: fails,
};
if (manifest) fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));

console.log('');
if (compare) {
  console.log(`  compared    ${results.length - bad.length}/${expected} theme(s): ${pngs} compare PNG, batch sheet ${cx.batchSheet ? `${cx.batchSheet.file} ${cx.batchSheet.size.join('x')}` : 'MISSING'}, index.html, ${(wall / 1000).toFixed(1)} s`);
  for (const r of results) console.log(`    ${r.theme.padEnd(22)} ${['grid', 'settings', 'hover'].map((s) => `${s} ${changeText(r.diffs && r.diffs[s])}`).join(' | ')}`);
  console.log(`  diff check  ${cx.diffControl ? `${cx.diffControl.pair}: ${changeText(cx.diffControl)}` : 'not run'}`);
} else {
  console.log(`  themes      ${results.length - bad.length}/${expected} clean, ${pngs} PNG, ${res ? res.extra.sheets.length : 0} contact sheet(s), ${(wall / 1000).toFixed(1)} s`);
}
for (const r of bad) console.log(`    ${r.theme}: ${r.problems.join('; ')}`);
console.log(`  guards      login-item ${counters.loginItem ?? '?'} | global-shortcut ${counters.globalShortcut ?? '?'} | show ${counters.windowShow ?? '?'} | focus ${(counters.windowFocus ?? 0) + (counters.appFocus ?? 0) + (counters.focusEvents ?? 0)} | dialogs ${counters.dialogs ?? '?'} | blocked requests ${counters.blockedRequests ?? '?'} | media ${counters.mediaStarted ?? '?'} | stubs intact ${res ? `${res.stubs.total - res.stubs.broken.length}/${res.stubs.total}` : '?'}`);
console.log(`  ipc         ${res ? Object.entries(res.ipc.calls).map(([k, v]) => `${k} ${v}`).join(', ') || 'none (no QuickLaunch page loaded)' : '?'} | outside allowlist ${unexpected.length}`);
console.log(`  network     sockets owned by our processes: ${sockets.length} across ${samples.length} netstat sample(s) (control PID ${samples[0]?.control.pid}: ${samples[0]?.control.sockets} sockets)`);
console.log(`  registry    before: ${regSummary(regBefore)}`);
console.log(`              after:  ${regSummary(regAfter)} -> ${regChanges.length ? 'CHANGED: ' + regChanges.join('; ') : 'unchanged'}`);
console.log(`  processes   ${procCount} started (${[...new Set(seenPids.values())].join(', ')}), exit ${result.code}${timedOut ? ' after timeout' : ''}, ${left.length} left`);
if (res && res.extra.displayEvents.length) console.log(`  displays    ${res.extra.displayEvents.length} display change event(s) during the run (captures are still size-gated)`);
if (selfTest) for (const c of manifest.selfTestControls) console.log(`  control     ${c.pass ? 'fired' : 'DID NOT FIRE'}: ${c.control} -> ${c.observed}`);
for (const f of fails) console.log(`  FAIL        ${f}`);
if (compare) console.log(`CITE: ql-theme-gallery COMPARE ${fails.length ? 'FAIL' : 'PASS'} | before ${comparePlan.before.label} -> after ${comparePlan.after.label} | ${results.length - bad.length}/${expected} themes, ${pngs} compare PNG + batch sheet | login-item ${counters.loginItem ?? '?'} | ipc outside allowlist ${unexpected.length} | sockets ${sockets.length} | registry ${regChanges.length ? 'CHANGED' : 'unchanged'} | ${left.length} proc left`);
else console.log(`CITE: ql-theme-gallery ${selfTest ? 'SELF-TEST ' : ''}${fails.length ? 'FAIL' : 'PASS'} | v${version} ${source.kind === 'snapshot' ? '@' + source.commit.slice(0, 7) : 'live@' + source.commit.slice(0, 7) + (source.dirty.length ? '+dirty' : '')} | ${results.length - bad.length}/${expected} themes, ${pngs} PNG | login-item ${counters.loginItem ?? '?'} | ipc outside allowlist ${unexpected.length} | sockets ${sockets.length} | registry ${regChanges.length ? 'CHANGED' : 'unchanged'} | ${left.length} proc left`);
process.exit(fails.length ? 1 : 0);
