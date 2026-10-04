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
// Hover legibility gate (npm run check:hover; definition: Docs/QuickLaunch_HoverFix57_Spec_2026-10-02.md section 5)
//   npm run check:hover [-- --only a,b] [--rebaseline] [--ref=<git ref>]
//   40 readings per theme (hover and pressed on 17 controls, tile names, skin rows, installed-picker rows),
//   measured in offscreen 520x760 windows at 1x (hover.cjs). Where a gradient can matter (image layer, a ring
//   around the text that reads over 2 % worse, a reading within 10 % of its floor) the text box is captured again
//   with the label's ink off and with its glyphs in a coverage colour, and the fill is also judged at its worst
//   point under the glyphs (14.4 % of readings on 2026-10-03; the run took 52 s, against 45 s without the
//   coverage capture, on the same machine). Exit 0 pass, 1 a failing pair not in
//   scripts/themes-hover-baseline.json, 2 harness failure (pairs measured not themes x 40, a positive control
//   that does not fail, a guard counter, a process left, a registry change, the 180 s hard limit).
//   --only a,b            measure only these themes (baseline still applies to them)
//   --rebaseline          delete baseline entries that pass now (it never adds one; whole roster only)
//   --processes=<n>       Electron processes the roster is split over (default 4)
//   --concurrency=<n>     offscreen windows per process (default 6)
//   --out=<dir>           where hover-readings.json goes (default <work>/hover; work default scratch/theme-gallery/.work-hover)
//   --neuter-control=pc1,pc2,pc3  make a positive control pass on purpose, to see it void the run (exit 2)
//                         (PC1 flat hover fill, PC2 light theme without its opt-out, PC3 smooth gradient fill)
//   --ink-free-all        take the two extra captures for every reading, not only where they can matter (122 s
//                         against 52 s on 2026-10-03); audits the trigger: verdicts must equal a normal run's.
//                         A reading the trigger skipped can read lower here: at most 3.0 % on 2026-10-03
//                         (679 of 3,462 skipped readings lower, 0 verdicts changed)
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
// --key=value, or --key value (the hover gate's documented form is `--only a,b`).
const opt = (k, d) => {
  const a = argv.find((x) => x.startsWith(`--${k}=`));
  if (a) return a.slice(k.length + 3);
  const i = argv.indexOf(`--${k}`);
  return i > -1 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : d;
};
const flag = (k) => argv.includes(`--${k}`);
if (flag('help') || flag('h')) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n')); process.exit(0); }
const selfTest = flag('self-test');
const compare = flag('compare');
const hoverCheck = flag('hover-check');
if (compare && selfTest) { console.error('--compare and --self-test are separate runs'); process.exit(2); }
if (hoverCheck && (compare || selfTest)) { console.error('--hover-check is a separate run (no --compare or --self-test)'); process.exit(2); }
const WORK = path.resolve(opt('work', path.join(REPO, 'scratch', 'theme-gallery', hoverCheck ? '.work-hover' : '.work')));
const OUT = path.resolve(selfTest ? path.join(WORK, 'self-test') : opt('out', hoverCheck ? path.join(WORK, 'hover') : path.join(REPO, 'scratch', 'theme-gallery', compare ? 'compare' : 'current')));
const ref = opt('ref', null);
const only = opt('only', '') ? opt('only').split(',').map((s) => s.trim()).filter(Boolean) : (selfTest ? ['cyberpunk', 'dune'] : null);
const num = (k, d) => { const v = Number(opt(k, d)); if (!Number.isFinite(v) || v <= 0) { console.error(`bad --${k}`); process.exit(2); } return v; };
// The hover gate's numbers are defined at one geometry (520x760 CSS px at 1x, software raster),
// so those options are fixed in that mode; its hard limit is 180 s for the whole run.
const HOVER_LIMIT_SEC = 180;
const cfgBase = hoverCheck ? {
  scale: 1, width: 520, height: 760, freezeMs: 0, concurrency: Math.round(num('concurrency', 6)),
  timeoutSec: HOVER_LIMIT_SEC - 5, gpu: false, selfTest: false,
  hover: { fps: Math.round(num('fps', 120)), neuter: (opt('neuter-control', '') || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean), inkFreeAll: flag('ink-free-all') },
} : {
  scale: num('scale', 1.5), width: Math.round(num('width', 424)), height: Math.round(num('height', 300)),
  freezeMs: Math.round(num('freeze-ms', 2500)), concurrency: Math.round(num('concurrency', 3)),
  timeoutSec: Math.round(num('timeout', 540)), gpu: flag('gpu'), selfTest,
};
const rebaseline = flag('rebaseline');
const HOVER_BASELINE = path.join(REPO, 'scripts', 'themes-hover-baseline.json');

// ── refusals ─────────────────────────────────────────────────────────────────
const lc = (p) => path.resolve(p).toLowerCase();
const inside = (parent, child) => { const r = path.relative(lc(parent), lc(child)); return r === '' || (!r.startsWith('..') && !path.isAbsolute(r)); };
const appData = process.env.APPDATA || '';
const localAppData = process.env.LOCALAPPDATA || '';
const refuse = [];
if (hoverCheck) {
  for (const k of ['scale', 'width', 'height', 'freeze-ms', 'timeout']) if (opt(k, null) !== null) refuse.push(`--${k} is fixed in --hover-check mode`);
  if (flag('gpu')) refuse.push('--gpu is not available in --hover-check mode (software raster only)');
  if (rebaseline && only) refuse.push('--rebaseline needs the whole roster; drop --only');
  if (rebaseline && ref) refuse.push('--rebaseline reads the live tree; drop --ref');
  for (const c of cfgBase.hover.neuter) if (!['pc1', 'pc2', 'pc3'].includes(c)) refuse.push(`--neuter-control: unknown control ${c} (pc1, pc2, pc3)`);
} else {
  if (rebaseline) refuse.push('--rebaseline belongs to --hover-check');
  if (flag('ink-free-all')) refuse.push('--ink-free-all belongs to --hover-check');
}
// The hover baseline is read before anything starts: a missing or malformed file voids the run.
let hoverBaseline = null;
if (hoverCheck) {
  try {
    const b = JSON.parse(fs.readFileSync(HOVER_BASELINE, 'utf8'));
    if (!b || typeof b !== 'object' || Array.isArray(b)) throw new Error('not a JSON object');
    for (const [t, v] of Object.entries(b)) if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new Error(`"${t}" is not a list of pair ids`);
    hoverBaseline = b;
  } catch (e) { refuse.push(`hover baseline ${path.relative(REPO, HOVER_BASELINE)}: ${e.message}`); }
}
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
const themeList = compare ? comparePlan.themes.map((t) => t.theme) : only ? only : fs.readdirSync(path.join(root, 'src', 'renderer', 'styles', 'themes')).filter((f) => f.endsWith('.css')).map((f) => f.slice(0, -4)).sort();
const themeTotal = themeList.length;
// The hover gate splits the roster over several Electron processes: one process composites every
// offscreen frame on a single thread (about 55 captures/s whatever its window count), so separate
// processes are what scales. Every other mode runs exactly one process.
const shardCount = hoverCheck ? Math.max(1, Math.min(Math.round(num('processes', 4)), themeTotal)) : 1;
const shards = Array.from({ length: shardCount }, (_, k) => {
  const dir = shardCount === 1 ? WORK : path.join(WORK, `p${k + 1}`);
  fs.mkdirSync(dir, { recursive: true });
  const s = { k, dir, cfgFile: path.join(dir, 'config.json'), statusFile: path.join(dir, 'status.json'), resultFile: path.join(dir, 'result.json'), logFile: path.join(dir, 'electron.log'), ackFile: path.join(dir, 'sample-ack.txt') };
  for (const f of [s.statusFile, s.resultFile, s.ackFile]) fs.rmSync(f, { force: true });
  // Round-robin, so every process gets a like mix of themes.
  s.themes = shardCount === 1 ? null : themeList.filter((_, i) => i % shardCount === k);
  const n = s.themes ? s.themes.length : themeTotal;
  // Netstat / liveness samples: after the first theme and at 80 %; main.cjs waits for each one.
  s.checkpoints = [...new Set([1, Math.max(1, Math.ceil(n * 0.8))])];
  const shardOnly = shardCount === 1 ? only : s.themes;
  const shardHover = hoverCheck ? { hover: { ...cfgBase.hover, controls: k === 0 } } : {};
  fs.writeFileSync(s.cfgFile, JSON.stringify({ ...cfgBase, ...shardHover, root, out: OUT, work: dir, only: shardOnly, compare: comparePlan, statusFile: s.statusFile, resultFile: s.resultFile, ackFile: s.ackFile, checkpoints: s.checkpoints, sourceLabel: `QuickLaunch v${version}, ${sourceLabel}` }, null, 1));
  return s;
});
const checkpointTotal = shards.reduce((n, s) => n + s.checkpoints.length, 0);

const electronExe = require('electron'); // path to this repo's electron.exe
const electronVersion = JSON.parse(fs.readFileSync(path.join(REPO, 'node_modules', 'electron', 'package.json'), 'utf8')).version;
if (hoverCheck) console.log(`[hover] QuickLaunch hover legibility gate: v${version}, ${sourceLabel}; ${themeTotal} theme(s) x 40 readings; Electron ${electronVersion}; ${shardCount} process(es) x ${cfgBase.concurrency} window(s)`);
else {
  console.log(compare ? `QuickLaunch theme gallery COMPARE: ${sourceLabel}; ${themeTotal} theme(s); Electron ${electronVersion}`
    : `QuickLaunch theme gallery${selfTest ? ' SELF-TEST' : ''}: v${version}, ${sourceLabel}; Electron ${electronVersion}`);
  console.log(`  out  ${OUT}\n  work ${WORK}`);
}

const regBefore = snapshotRegistry();
fs.writeFileSync(path.join(WORK, 'registry-before.json'), JSON.stringify(regBefore, null, 1));
const t0 = Date.now();
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
let lastLine = '';
const showLine = hoverCheck ? /GUARD|FATAL|failed/ : /^\s*\d+\/\d+ |GUARD|FATAL|sheet |source |rendered |compare |diff control/;
for (const s of shards) {
  s.child = spawn(electronExe, [path.join(HERE, 'main.cjs'), `--qlg-config=${s.cfgFile}`], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, env });
  s.logStream = fs.createWriteStream(s.logFile);
  for (const st of [s.child.stdout, s.child.stderr]) st.on('data', (d) => {
    s.logStream.write(d);
    for (const l of String(d).split(/\r?\n/)) if (l.startsWith('[gallery] ')) { lastLine = l.slice(10); if (showLine.test(lastLine)) console.log('  ' + (shardCount > 1 ? `[p${s.k + 1}] ` : '') + lastLine); }
  });
  s.exited = new Promise((resolve) => s.child.on('exit', (code, signal) => { s.exit = { code, signal }; resolve(s.exit); }));
}

const seenPids = new Map(); // pid -> type
const samples = [];
const readStatus = (s) => { try { s.status = JSON.parse(fs.readFileSync(s.statusFile, 'utf8')); for (const p of s.status.pids) seenPids.set(p.pid, p.type); } catch { /* not yet */ } };
async function sample(label) {
  for (const s of shards) readStatus(s);
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
const deadline = hoverCheck ? t0 + HOVER_LIMIT_SEC * 1000 : Date.now() + (cfgBase.timeoutSec + 45) * 1000;
const sampled = new Set(); // `${process}:${checkpoint}`
const allExited = Promise.all(shards.map((s) => s.exited));
for (;;) {
  const r = await Promise.race([allExited, sleep(250).then(() => null)]);
  if (r) break;
  for (const s of shards) {
    readStatus(s);
    const pending = s.status && Array.isArray(s.status.checkpoints) ? s.status.checkpoints.filter((c) => !sampled.has(`${s.k}:${c}`)) : [];
    if (pending.length) {
      for (const c of pending) sampled.add(`${s.k}:${c}`);
      await sample(`${shardCount > 1 ? `process ${s.k + 1}: ` : ''}checkpoint after ${pending.join(' + ')} of ${s.status.total} themes`);
      for (const c of pending) fs.appendFileSync(s.ackFile, `${c}\n`);
    }
  }
  if (Date.now() > deadline) {
    timedOut = true;
    console.log(`  TIMEOUT: ending the Electron process(es) this script started (own handles)`);
    for (const s of shards) if (!s.exit) s.child.kill();
    await allExited;
    break;
  }
}
for (const s of shards) s.logStream.end();
const wall = Date.now() - t0;
for (const s of shards) readStatus(s);
// The exit reported: the first non-zero one, else process 1's.
const result = (shards.find((s) => s.exit && s.exit.code !== 0) || shards[0]).exit;

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

// The results of every process, merged into one (a single process's result is used as it is).
let res = null;
{
  const parts = [];
  for (const s of shards) { try { parts.push(JSON.parse(fs.readFileSync(s.resultFile, 'utf8'))); } catch (e) { console.log(`  no result file${shardCount > 1 ? ` from process ${s.k + 1}` : ''}: ${e.message}`); } }
  if (parts.length === 1 && shards.length === 1) res = parts[0];
  else if (parts.length === shards.length) {
    const hx = parts.map((p) => p.extra && p.extra.hover).filter(Boolean);
    const calls = {};
    for (const p of parts) for (const [k, v] of Object.entries(p.ipc.calls)) calls[k] = (calls[k] || 0) + v;
    const counters = {};
    for (const p of parts) for (const [k, v] of Object.entries(p.counters)) counters[k] = (counters[k] || 0) + v;
    const profile = {};
    for (const h of hx) for (const [k, v] of Object.entries(h.profile || {})) profile[k] = (profile[k] || 0) + v;
    res = {
      code: (parts.find((p) => p.code !== 0) || parts[0]).code, why: [...new Set(parts.map((p) => p.why))].join(' | '),
      counters, guardHits: parts.flatMap((p) => p.guardHits || []),
      stubs: { total: parts.reduce((n, p) => n + p.stubs.total, 0), broken: parts.flatMap((p) => p.stubs.broken) },
      ipc: { calls, unexpected: parts.flatMap((p) => p.ipc.unexpected) },
      results: parts.flatMap((p) => p.results).sort((a, b) => a.theme.localeCompare(b.theme)),
      extra: {
        displays: parts[0].extra ? parts[0].extra.displays : null, displayEvents: parts.flatMap((p) => (p.extra && p.extra.displayEvents) || []),
        hover: hx.length === parts.length ? { ...hx[0], preflight: hx.map((h) => h.preflight).find(Boolean) || null, pcs: hx.flatMap((h) => h.pcs), measureMs: Math.max(...hx.map((h) => h.measureMs || 0)), profile } : null,
      },
    };
  }
}

// ── verdict ──────────────────────────────────────────────────────────────────
const fails = [];
if (!res) fails.push('Electron run wrote no result');
if (timedOut) fails.push('run timed out and was ended through its own handle');
if (result.code !== 0) fails.push(`Electron exit code ${result.code}${res ? ` (${res.why})` : ''}`);
const results = res ? res.results : [];
const bad = results.filter((r) => !r.ok);
const expected = themeTotal;
if (results.length !== expected) fails.push(`${compare ? 'compared' : hoverCheck ? 'measured' : 'rendered'} ${results.length} of ${expected} themes`);
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
if (sampled.size < checkpointTotal || !samples.length) fails.push(`${sampled.size} of ${checkpointTotal} checkpoints sampled mid-run (${samples.length} sample(s))`);
for (const s of samples) {
  if (s.alive < 1) fails.push(`liveness detector saw none of our processes during the run (${s.label})`);
  if (!(s.control.sockets > 0)) fails.push(`netstat control PID showed no sockets (${s.label})`);
}
if (left.length) fails.push(`${left.length} process(es) still running after exit: ${left.join(', ')}`);
if (regChanges.length) fails.push(`registry changed: ${regChanges.join('; ')}`);

// ── hover gate verdict (check:hover): exit 0 pass, 1 new failing pair, 2 harness failure ──
if (hoverCheck) {
  const hx = (res && res.extra && res.extra.hover) || null;
  for (const [k, v] of guardFails) fails.push(`guard ${k} = ${v}`);
  if (res && res.stubs.broken.length === 0 && res.stubs.total === 0) fails.push('no guard stubs installed');
  if (unexpected.length) fails.push(`${unexpected.length} IPC call(s) outside get-apps/get-settings/get-valid-themes/renderer-ready/get-installed-apps: ${[...new Set(unexpected.map((u) => u.channel))].join(', ')}`);
  if (sockets.length) fails.push(`${sockets.length} socket(s) owned by our processes: ${sockets.slice(0, 5).join(' | ')}`);
  if (hx && hx.preflight) fails.unshift(hx.preflight); // the cause, ahead of the counts it voids
  if (!hx) fails.push('no hover readings in the result');
  else if (hx.perTheme !== 40) fails.push(`the gate defines ${hx.perTheme} readings per theme, not 40`);
  for (const r of bad) fails.push(`${r.theme}: ${r.problems.slice(0, 2).join('; ')}${r.problems.length > 2 ? ` (+${r.problems.length - 2} more)` : ''}`);
  const measured = results.reduce((n, r) => n + (r.rows || []).filter((x) => !x.error && typeof x.ratio === 'number').length, 0);
  if (measured !== expected * 40) fails.push(`${measured} pair(s) measured, expected ${expected} theme(s) x 40 = ${expected * 40}`);
  const pcs = hx ? [...hx.pcs].sort((a, b) => a.id.localeCompare(b.id)) : [];
  for (const id of ['PC1', 'PC2', 'PC3']) {
    const pc = pcs.find((p) => p.id === id);
    if (!pc) fails.push(`positive control ${id} did not run`);
    else if (!pc.failed) fails.push(`positive control ${id} (${pc.what}) did not fail: ${pc.pair} read ${pc.ratio2 ?? '?'}:1${pc.needSrc ? ` from the ${pc.src || '?'} candidate` : ''}, must be under ${pc.under}:1${pc.needSrc ? ` from the ${pc.needSrc} candidate` : ''}${pc.problems.length ? ` [${pc.problems.join('; ')}]` : ''}`);
  }

  // Baseline: a failing pair not listed for its theme is an error; listed = grandfathered;
  // a listed pair that passes is a note. --rebaseline only ever deletes entries.
  const pairIds = new Set((hx ? hx.pairs : []).map((p) => p.pair));
  const allThemes = fs.readdirSync(path.join(root, 'src', 'renderer', 'styles', 'themes')).filter((f) => f.endsWith('.css')).map((f) => f.slice(0, -4));
  const byTheme = new Map(results.map((r) => [r.theme, r]));
  const errors = [], grand = [], fixedEntries = [], invalidEntries = [];
  for (const r of results) for (const x of r.rows || []) if (x.fail) ((hoverBaseline[r.theme] || []).includes(x.pair) ? grand : errors).push({ theme: r.theme, ...x });
  for (const [t, list] of Object.entries(hoverBaseline)) for (const p of list) {
    if (!allThemes.includes(t)) { if (!only) invalidEntries.push({ theme: t, pair: p, why: 'no such theme' }); continue; }
    if (!pairIds.has(p)) { invalidEntries.push({ theme: t, pair: p, why: 'not a pair id' }); continue; }
    const x = byTheme.has(t) ? (byTheme.get(t).rows || []).find((y) => y.pair === p) : null;
    if (x && !x.error && !x.fail) fixedEntries.push({ theme: t, pair: p, ratio2: x.ratio2 });
  }
  const label = (x) => `${x.label}${x.alpha < 1 ? `@${x.alpha}` : ''}`;
  const line = (x) => `      ${x.pair}: ${label(x)} on ${x.fill}${x.src === 'grad' ? ` (gradient, worst point; its flat fill reads ${x.flat2}:1)` : ''} = ${x.ratio2.toFixed(2)}:1 (needs ${x.floor}:1)`;
  const group = (list) => { const m = new Map(); for (const x of list) m.set(x.theme, [...(m.get(x.theme) || []), x]); return m; };
  const relBase = path.relative(REPO, HOVER_BASELINE).split(path.sep).join('/');
  if (grand.length) {
    const g = group(grand);
    console.log(`\n[hover] WARNINGS (grandfathered in ${relBase}): ${grand.length} pair(s) in ${g.size} theme(s)`);
    for (const [t, list] of g) { console.log(`  - ${t}`); for (const x of list) console.log(line(x)); }
  }
  if (errors.length) {
    const g = group(errors);
    console.log(`\n[hover] ERRORS (under threshold and not in ${relBase}): ${errors.length} pair(s) in ${g.size} theme(s)`);
    for (const [t, list] of g) { console.log(`  - ${t}`); for (const x of list) console.log(line(x)); }
  }
  for (const f of fixedEntries) console.log(`[hover] note: ${f.theme} ${f.pair} passes now (${f.ratio2}:1): fixed, remove it from the baseline`);
  for (const f of invalidEntries) console.log(`[hover] note: baseline entry ${f.theme} ${f.pair}: ${f.why}`);
  let rebaselined = null;
  if (rebaseline) {
    if (fails.length) console.log('[hover] --rebaseline skipped: the run is void');
    else {
      const drop = new Set([...fixedEntries, ...invalidEntries].map((f) => `${f.theme}\n${f.pair}`));
      const next = {};
      for (const t of Object.keys(hoverBaseline).sort()) {
        const keep = hoverBaseline[t].filter((p) => !drop.has(`${t}\n${p}`));
        if (keep.length) next[t] = keep;
      }
      rebaselined = drop.size;
      if (drop.size) fs.writeFileSync(HOVER_BASELINE, JSON.stringify(next, null, 2) + '\n');
      console.log(`[hover] --rebaseline: removed ${drop.size} entr${drop.size === 1 ? 'y' : 'ies'} (it never adds one; accepting a failure is a hand edit of ${relBase})`);
    }
  }

  for (const pc of pcs) console.log(`  control     ${pc.id} ${pc.failed ? 'fired' : 'DID NOT FIRE'}: ${pc.what}: ${pc.pair} ${pc.label || '?'} on ${pc.fill || '?'} = ${pc.ratio2 ?? '?'}:1${pc.needSrc ? ` (${pc.src || '?'} candidate; without it ${pc.flat2 ?? '?'}:1)` : ''} (must be under ${pc.under}:1)`);
  console.log(`  guards      login-item ${counters.loginItem ?? '?'} | global-shortcut ${counters.globalShortcut ?? '?'} | show ${counters.windowShow ?? '?'} | focus ${(counters.windowFocus ?? 0) + (counters.appFocus ?? 0) + (counters.focusEvents ?? 0)} | dialogs ${counters.dialogs ?? '?'} | blocked requests ${counters.blockedRequests ?? '?'} | media ${counters.mediaStarted ?? '?'} | stubs intact ${res ? `${res.stubs.total - res.stubs.broken.length}/${res.stubs.total}` : '?'} | ipc outside allowlist ${unexpected.length}`);
  const dEv = (res && res.extra && res.extra.displayEvents) || [];
  if (dEv.length) console.log(`  displays    ${dEv.length} display change event(s) during the run (every page re-checks its window size, every capture must settle)`);
  const prof = (hx && hx.profile) || {};
  // Readings decided by the worst point: a gradient when it reads more than 2 % below the flat fill
  // (hover.cjs sets grad.gradient), otherwise a flat fill the worst point lowered by grain or a border.
  const fromGrad = results.flatMap((r) => (r.rows || []).filter((x) => x.src === 'grad'));
  const gradCount = fromGrad.filter((x) => x.grad && x.grad.gradient).length;
  console.log(`  ink-free    ${prof.inkFree || 0} of ${measured + pcs.length} readings captured again with the label's ink off, and again with its glyphs in a contrast colour${hx && hx.inkFreeAll ? ' (--ink-free-all)' : ` (image layer ${prof.ink_paint || 0}, clipped ring ${prof.ink_edge || 0}, near the floor ${prof.ink_near || 0}, ring over 2 % worse ${prof.ink_ring || 0})`}; ${gradCount} read from a gradient's worst point (more than 2 % below the flat fill; ${fromGrad.length - gradCount} more within 2 % of it are flat fills)`);
  console.log(`  isolation   sockets ${sockets.length} (${samples.length} netstat sample(s)) | registry ${regChanges.length ? 'CHANGED' : 'unchanged'} | processes ${seenPids.size} started, ${left.length} left, exit ${result.code}${timedOut ? ' after timeout' : ''} | ${(wall / 1000).toFixed(1)} s`);
  const report = {
    tool: 'scripts/theme-gallery --hover-check', generated: new Date().toISOString(), quicklaunch: { version, ...source }, electron: electronVersion,
    definition: 'Docs/QuickLaunch_HoverFix57_Spec_2026-10-02.md section 5', window: [cfgBase.width, cfgBase.height], scale: cfgBase.scale,
    baseline: relBase, pcs, errors: errors.length, grandfathered: grand.length, fixedEntries, invalidEntries, rebaselined,
    themes: results.map((r) => ({ theme: r.theme, ok: r.ok, problems: r.problems, ms: r.ms, rows: r.rows })),
    measureMs: hx ? hx.measureMs : null, profile: hx ? hx.profile : null, inkFreeAll: hx ? !!hx.inkFreeAll : null, wallMs: wall,
    isolation: { counters, stubs: res ? res.stubs : null, ipcCalls: res ? res.ipc.calls : null, unexpectedIpc: unexpected.length, registry: { before: regSummary(regBefore), after: regSummary(regAfter), changes: regChanges }, samples, processes: { started: [...seenPids].map(([pid, type]) => ({ pid, type })), leftAfterExit: left, exit: result, timedOut } },
    verdict: fails.length ? 'VOID' : errors.length ? 'FAIL' : 'PASS', failures: fails,
  };
  fs.writeFileSync(path.join(OUT, 'hover-readings.json'), JSON.stringify(report, null, 1));
  console.log(`  readings    ${path.join(OUT, 'hover-readings.json')}`);
  for (const f of fails) console.log(`[hover] VOID: ${f}`);
  console.log(`[hover] ${results.length} theme(s), ${measured} pair(s) measured, ${errors.length} error${errors.length === 1 ? '' : 's'}, ${grand.length} grandfathered.${fails.length ? ' RUN VOID (harness failure, exit 2).' : ''}`);
  process.exit(fails.length ? 2 : errors.length ? 1 : 0);
}

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
    frame: `looping animations paused at currentTime ${cfgBase.freezeMs} ms; one-shot animations (entrance, hover flourishes) and transitions finished; banner rotation stopped on the app's first pick (quote #1, or the first quote after it that fits the banner)`,
    states: { grid: 'main grid, nothing hovered', settings: 'Settings overlay open (btn-settings click)', hover: 'synthetic mouse move over tile #2 (Calculator), settled' },
    tiles: '14 mock tiles (scripts/theme-gallery/mock-data.cjs), store-default settings',
    displays: res ? res.extra.displays : null, displayEvents: res ? res.extra.displayEvents : null },
  isolation,
  wallMs: wall, themes: results.map((r) => ({ theme: r.theme, name: r.name, family: r.family, ok: r.ok, problems: r.problems, states: r.states, hoverTile: r.hoverTile, page: r.page, banner: r.banner, freeze: r.freeze, fonts: r.fonts, consoleErrors: r.consoleErrors, consoleWarnings: r.consoleWarnings, ms: r.ms })),
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
