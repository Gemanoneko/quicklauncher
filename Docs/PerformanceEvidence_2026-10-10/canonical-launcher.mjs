#!/usr/bin/env node
/**
 * quicklaunch-safe-launch.mjs: the one way a QA or test run launches a packaged QuickLauncher.
 *
 * Run:    node scripts/qa/quicklaunch-safe-launch.mjs --help
 * Tests:  node scripts/qa/quicklaunch-safe-launch.test.mjs
 *
 * Plain node, no dependencies. It turns ProcessRules § Our tooling must not intrude on Sergei's
 * machine into a mechanism for QuickLaunch, after the written rule was broken three rounds running.
 *
 * WHAT MAKES A PACKAGED LAUNCH DANGEROUS (verified against the 1.94.2 app.asar, 2026-09-29):
 *   1. At boot, a packaged build writes or deletes its HKCU Run entry from settings.startWithWindows.
 *      The test is `!== false`, so a missing value means ON. The Run value is keyed by app name,
 *      not by --user-data-dir, so a throwaway profile rewrites the real entry.
 *   2. It registers settings.globalHotkey system-wide. A falsy value (null, '') registers nothing.
 *   3. The store merges defaults at the TOP level only: a settings object without startWithWindows
 *      means ON, and a file with no settings object gets the default settings (ON + Ctrl+Space).
 *   4. Main file missing or corrupt: .tmp, then .bak, then defaults. Main file LOCKED at boot (an
 *      antivirus scan of a freshly written seed): .tmp, then .bak, then defaults.
 * Hence the rules: the main file, .tmp and .bak must all parse and be safe, and a missing .bak is
 * created as a copy of the checked main file so a lock at boot still lands on safe settings.
 * Corrupt/empty/missing-file tests are refused: in a packaged build they are, by design, a
 * Run-key write. Test those with a store-level probe (no app launch).
 *
 * WHAT IT NEVER DOES: write the registry (reg.exe query only), kill by image name, kill a process
 * outside the tree it spawned, touch %APPDATA%\QuickLauncher (it only stats the data files there).
 *
 * PROCESS IDENTITY is PID + creation time (FILETIME from Win32_Process), so a reused PID is never
 * mistaken for ours. The root is ended through Node's process handle; its descendants by PID after
 * that identity check. A detached watchdog ends the tree if this launcher is itself killed.
 */
import { spawn, spawnSync } from 'node:child_process';
import {
  closeSync, copyFileSync, mkdirSync, openSync, readdirSync, readFileSync, readSync,
  realpathSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const SCRIPT = fileURLToPath(import.meta.url);
export const STUDIO_ROOT = resolve(HERE, '..', '..');
export const DEFAULT_EXE = join(STUDIO_ROOT, 'WIP', 'QuickLaunch', 'dist', 'win-unpacked', 'QuickLauncher.exe');
export const DATA_FILE = 'quicklauncher-data.json';
export const LOG_FILE = 'ql-safe-launch.log';
export const REG_KEYS = [
  { label: 'Run', path: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' },
  { label: 'StartupApproved\\Run', path: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StartupApproved\\Run' },
];
export const EXIT = { PASS: 0, ERROR: 1, REFUSED: 2, REGISTRY: 3, LEFTOVER: 4, REAL_PROFILE: 5 };
export const TIMEOUT = { def: 30, min: 5, max: 300 };
const POLL_MS = 2000;

const SYS32 = join(process.env.SystemRoot || 'C:\\Windows', 'System32');
const REG_EXE = join(SYS32, 'reg.exe');
const TASKKILL_EXE = join(SYS32, 'taskkill.exe');
const POWERSHELL_EXE = join(SYS32, 'WindowsPowerShell', 'v1.0', 'powershell.exe');

/** The seed --init writes: no autostart, no hotkey, no boot-time theme rewrite. */
export const SAFE_SEED = {
  apps: [],
  settings: {
    iconSize: 64, startWithWindows: false, randomTheme: false, theme: 'cyberpunk',
    windowPosition: null, globalHotkey: null, reducedMotion: false,
  },
};

export const USAGE = `Usage: node scripts/qa/quicklaunch-safe-launch.mjs --profile <dir> [options] [-- <app args>]

Launches a packaged QuickLauncher on a throwaway profile, then ends it.
Refuses to launch unless the profile is safe. Reports any change to the
HKCU startup keys (Run, StartupApproved\\Run). Never writes the registry.

  --profile <dir>  Profile folder inside the temp dir. Its quicklauncher-data.json
                   needs settings.startWithWindows false and settings.globalHotkey
                   null (or a combo with a modifier that is not Ctrl+Space).
                   .tmp and .bak must be safe too; a missing .bak is copied from it.
  --init           Create <dir> with a safe seed first (dir must be new or empty).
  --exe <path>     Build to run. Default: WIP/QuickLaunch/dist/win-unpacked/QuickLauncher.exe
                   The installed copy is refused.
  --timeout <s>    End the app after this many seconds (${TIMEOUT.min}-${TIMEOUT.max}, default ${TIMEOUT.def}).
  --check          Run the safety checks only; launch nothing.
  -- <args>        Extra app arguments, e.g. -- --remote-debugging-port=9333
                   (--user-data-dir is refused; it comes from --profile).
  -h, --help       This text.

Refused on purpose: corrupt, empty or missing data files. The app falls back
to Start with Windows on + Ctrl+Space. Test those with a store-level probe.

The window still shows and may take focus; keep runs short.
To drive the app while it runs, start this in the background and connect to
the remote-debugging port. It ends the app at the timeout.

Exit: 0 pass, 1 error, 2 refused (nothing launched), 3 startup keys changed,
      4 launched processes left over, 5 real profile data changed.`;

// ── small helpers ────────────────────────────────────────────────────────────

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const idKey = (p) => `${p.pid}:${p.created}`;
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/** Git Bash hands over /c/Users/... when path conversion is off; map it to C:/Users/... */
export function fromBashPath(p) {
  const m = /^\/([a-zA-Z])(\/.*)?$/.exec(String(p));
  return m ? `${m[1].toUpperCase()}:${m[2] || '/'}` : String(p);
}

const lc = (p) => resolve(p).replace(/[\\/]+$/, '').toLowerCase();
export function samePath(a, b) { return lc(a) === lc(b); }
/** True when child is strictly inside parent (case-insensitive, Windows). */
export function isInside(parent, child) {
  const p = lc(parent);
  const c = lc(child);
  return c.length > p.length && c.startsWith(p + sep);
}

/** realpath of the nearest existing ancestor, plus the rest: resolves junctions and 8.3 names. */
export function realish(p) {
  let cur = resolve(fromBashPath(p));
  const rest = [];
  for (;;) {
    try {
      const r = realpathSync.native(cur);
      return rest.length ? join(r, ...rest.reverse()) : r;
    } catch {
      const up = dirname(cur);
      if (up === cur) return resolve(fromBashPath(p));
      rest.push(basename(cur));
      cur = up;
    }
  }
}

function isDir(p) { try { return statSync(p).isDirectory(); } catch { return false; } }
function isFile(p) { try { return statSync(p).isFile(); } catch { return false; } }
function safeReaddir(p) { try { return readdirSync(p); } catch { return []; } }

export function msToFiletime(ms) { return (BigInt(Math.floor(ms)) + 11644473600000n) * 10000n; }

// ── roots ────────────────────────────────────────────────────────────────────

export function defaultRoots(env = process.env) {
  const tempRoots = [...new Set([tmpdir(), env.TEMP, env.TMP].filter(Boolean).map((p) => resolve(p)))];
  const forbidden = [];
  if (env.APPDATA) forbidden.push(join(env.APPDATA, 'QuickLauncher'));
  if (env.LOCALAPPDATA) {
    forbidden.push(join(env.LOCALAPPDATA, 'Programs', 'QuickLauncher'));
    forbidden.push(join(env.LOCALAPPDATA, 'quicklauncher-updater'));
  }
  return { tempRoots, forbidden, realData: env.APPDATA ? join(env.APPDATA, 'QuickLauncher') : null };
}

// ── argument parsing ─────────────────────────────────────────────────────────

export function parseArgs(argv) {
  const o = {
    exe: DEFAULT_EXE, profile: null, timeout: TIMEOUT.def, init: false, check: false,
    help: false, appArgs: [], argReasons: [], watchdog: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') { o.appArgs = argv.slice(i + 1); break; }
    const eq = a.startsWith('--') ? a.indexOf('=') : -1;
    const flag = eq > 0 ? a.slice(0, eq) : a;
    const inline = eq > 0 ? a.slice(eq + 1) : undefined;
    const val = () => {
      if (inline !== undefined) return inline;
      const v = argv[++i];
      if (v === undefined) throw new Error(`${flag} needs a value`);
      return v;
    };
    switch (flag) {
      case '-h': case '--help': o.help = true; break;
      case '--profile': o.profile = fromBashPath(val()); break;
      case '--exe': o.exe = fromBashPath(val()); break;
      case '--timeout': {
        const n = Number(val());
        if (!Number.isInteger(n) || n < TIMEOUT.min || n > TIMEOUT.max) {
          throw new Error(`--timeout must be a whole number of seconds from ${TIMEOUT.min} to ${TIMEOUT.max}`);
        }
        o.timeout = n;
        break;
      }
      case '--init': o.init = true; break;
      case '--check': o.check = true; break;
      case '--watchdog': // internal: rootPid rootCreated deadlineMs launcherPid launcherCreated
        o.watchdog = argv.slice(i + 1, i + 6);
        if (o.watchdog.length !== 5) throw new Error('--watchdog needs 5 values');
        i += 5;
        break;
      default: throw new Error(`unknown option ${a}`);
    }
  }
  if (!o.help && !o.watchdog && !o.profile) throw new Error('--profile <dir> is required');
  for (const a of o.appArgs) {
    if (/^--?user-data-dir(=|$)/i.test(a)) {
      o.argReasons.push('Extra app arguments may not set --user-data-dir; the launcher sets it from --profile.');
    }
  }
  return o;
}

// ── preflight: exe and profile path ──────────────────────────────────────────

export function checkExe(exe, roots) {
  const reasons = [];
  if (basename(exe).toLowerCase() !== 'quicklauncher.exe') {
    reasons.push(`--exe must point to a QuickLauncher.exe; got ${exe}.`);
  } else if (!isFile(exe)) {
    reasons.push(`No build at ${exe}.`);
  }
  const r = realish(exe);
  for (const f of roots.forbidden) {
    if (isInside(realish(f), r)) reasons.push(`${exe} is the installed copy. Test a build (dist/win-unpacked) instead.`);
  }
  return reasons;
}

export function checkProfilePath(profile, roots, { mustExist = true } = {}) {
  const reasons = [];
  const resolved = realish(profile);
  for (const f of roots.forbidden) {
    const fr = realish(f);
    if (samePath(resolved, fr) || isInside(fr, resolved) || isInside(resolved, fr)) {
      reasons.push(`Profile ${resolved} is, or holds, the real QuickLauncher folder ${f}. Use a new folder inside the temp dir.`);
    }
  }
  const temps = roots.tempRoots.map(realish);
  if (!temps.some((t) => isInside(t, resolved))) {
    reasons.push(`Profile must be a folder inside the temp dir (${temps[0]}); got ${resolved}.`);
  }
  if (mustExist && !reasons.length && !isDir(resolved)) {
    reasons.push(`Profile folder ${resolved} does not exist. Seed it, or add --init for a safe seed.`);
  }
  return { resolved, reasons };
}

// ── preflight: seed files ────────────────────────────────────────────────────

const MODIFIERS = {
  ctrl: 'ctrl', control: 'ctrl', commandorcontrol: 'ctrl', cmdorctrl: 'ctrl',
  alt: 'alt', option: 'alt', altgr: 'altgr', shift: 'shift',
  super: 'super', meta: 'super', cmd: 'super', command: 'super',
};

export function hotkeyParts(accel) {
  const mods = new Set();
  const keys = [];
  for (const t of String(accel).split('+').map((s) => s.trim().toLowerCase()).filter(Boolean)) {
    if (MODIFIERS[t]) mods.add(MODIFIERS[t]); else keys.push(t);
  }
  return { mods, keys };
}

/** Ctrl+Space in any spelling Electron accepts: Control+Space, CmdOrCtrl+Space, space+ctrl... */
export function isCtrlSpace(accel) {
  const { mods, keys } = hotkeyParts(accel);
  return mods.size === 1 && mods.has('ctrl') && keys.length === 1 && keys[0] === 'space';
}

/** The launcher's rules for one parsed data file. Stricter than the app's own shape check on purpose. */
export function checkSeedData(obj, label = DATA_FILE) {
  const reasons = [];
  const warnings = [];
  if (!isPlainObject(obj) || !Array.isArray(obj.apps) || (obj.settings !== undefined && !isPlainObject(obj.settings))) {
    reasons.push(`${label} has the wrong shape: it needs an object with an "apps" array and a "settings" object. The app would treat it as corrupt and fall back to defaults.`);
    return { reasons, warnings };
  }
  const s = obj.settings;
  if (s === undefined) {
    reasons.push(`${label} has no "settings" object, so the app would use default settings (Start with Windows on, Ctrl+Space). Add settings with startWithWindows false and globalHotkey null.`);
    return { reasons, warnings };
  }
  if (s.startWithWindows !== false) {
    if (!hasOwn(s, 'startWithWindows')) reasons.push(`${label}: settings.startWithWindows is missing, which the app reads as on. Set it to false.`);
    else if (s.startWithWindows === true) reasons.push(`${label}: settings.startWithWindows is true. Set it to false.`);
    else reasons.push(`${label}: settings.startWithWindows is ${JSON.stringify(s.startWithWindows)}, not the boolean false, which the app reads as on. Set it to false.`);
  }
  if (!hasOwn(s, 'globalHotkey')) {
    reasons.push(`${label}: settings.globalHotkey is missing. Set it to null (no hotkey).`);
  } else {
    const h = s.globalHotkey;
    if (h === null || h === '') { /* no hotkey registered: the safe choice */ }
    else if (typeof h !== 'string') reasons.push(`${label}: settings.globalHotkey must be null or a string; got ${JSON.stringify(h)}.`);
    else if (isCtrlSpace(h)) reasons.push(`${label}: settings.globalHotkey is ${h}, the everyday hotkey. Set it to null.`);
    else if (hotkeyParts(h).mods.size === 0) reasons.push(`${label}: settings.globalHotkey ${h} has no modifier and would take that key system-wide. Set it to null.`);
    else warnings.push(`${label}: globalHotkey ${h} is registered system-wide for the run.`);
  }
  return { reasons, warnings };
}

/** Read one data file exactly the way the store does: utf8, JSON.parse, no BOM stripping. */
export function readSeedFile(p) {
  let raw;
  try {
    raw = readFileSync(p, 'utf8');
  } catch (e) {
    if (e && e.code === 'ENOENT') return { state: 'missing' };
    return { state: 'unreadable', code: (e && (e.code || e.message)) || 'unknown' };
  }
  try {
    return { state: 'ok', data: JSON.parse(raw) };
  } catch {
    return { state: 'corrupt', code: raw.length ? 'PARSE' : 'EMPTY' };
  }
}

export function checkSeedDir(profile, { createBak = false } = {}) {
  const reasons = [];
  const warnings = [];
  const mainPath = join(profile, DATA_FILE);
  const info = { main: 'bad', tmp: 'none', bak: 'none', hotkey: undefined, apps: 0 };

  const m = readSeedFile(mainPath);
  if (m.state === 'missing') {
    reasons.push(`${DATA_FILE} is missing, so the app would start from defaults (Start with Windows on, Ctrl+Space). Seed it, or add --init.`);
  } else if (m.state === 'unreadable') {
    reasons.push(`${DATA_FILE} cannot be read (${m.code}); the app would fall back to .tmp, .bak, then defaults.`);
  } else if (m.state === 'corrupt') {
    reasons.push(`${DATA_FILE} is ${m.code === 'EMPTY' ? 'empty' : 'not valid JSON'}, so the app would fall back to defaults. Test corrupt files with a store-level probe, not a launch.`);
  } else {
    const r = checkSeedData(m.data, DATA_FILE);
    reasons.push(...r.reasons);
    warnings.push(...r.warnings);
    if (!r.reasons.length) {
      info.main = 'ok';
      info.hotkey = m.data.settings.globalHotkey;
      info.apps = m.data.apps.length;
    }
  }

  // .tmp and .bak are the app's fallbacks when the main file is missing, corrupt, or LOCKED at boot.
  for (const key of ['tmp', 'bak']) {
    const name = `${DATA_FILE}.${key}`;
    const f = readSeedFile(join(profile, name));
    if (f.state === 'missing') continue;
    if (f.state === 'ok') {
      const r = checkSeedData(f.data, name);
      if (r.reasons.length) reasons.push(...r.reasons.map((x) => `${x} (The app falls back to ${name}.)`));
      else info[key] = 'ok';
    } else {
      const what = f.state === 'unreadable' ? `unreadable (${f.code})` : (f.code === 'EMPTY' ? 'empty' : 'not valid JSON');
      reasons.push(`${name} is ${what}. The app falls back to it; delete it or make it a safe copy.`);
    }
  }

  if (!reasons.length && info.bak === 'none') {
    if (createBak) {
      copyFileSync(mainPath, join(profile, `${DATA_FILE}.bak`));
      info.bak = 'created';
    } else {
      info.bak = 'missing (created at launch)';
    }
  }
  return { reasons, warnings, info };
}

// ── registry (read-only) ─────────────────────────────────────────────────────

/** Parse `reg query <key>` output into { name: { type, data } }. */
export function parseRegQuery(text) {
  const values = Object.create(null);
  for (const raw of String(text).split('\n')) {
    const line = raw.replace(/\r$/, '');
    const m = /^ {4}(.+?) {4}(REG_[A-Z0-9_]+)(?: {4}(.*))?$/.exec(line);
    if (m) values[m[1]] = { type: m[2], data: m[3] === undefined ? '' : m[3] };
  }
  return values;
}

export function queryKey(path) {
  const r = spawnSync(REG_EXE, ['query', path], { encoding: 'latin1', windowsHide: true, timeout: 20000 });
  if (r.error) throw new Error(`reg query failed: ${r.error.message}`);
  if (r.status === 0) return { exists: true, values: parseRegQuery(r.stdout) };
  if (r.status === 1 && /unable to find/i.test(`${r.stderr}${r.stdout}`)) return { exists: false, values: Object.create(null) };
  throw new Error(`reg query ${path} exited ${r.status}: ${String(r.stderr || '').trim()}`);
}

export function snapshotRegistry(keys = REG_KEYS) {
  const out = {};
  for (const k of keys) out[k.label] = queryKey(k.path);
  return out;
}

export function diffRegistry(before, after) {
  const changes = [];
  const empty = { exists: false, values: {} };
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const b = before[key] || empty;
    const a = after[key] || empty;
    if (b.exists !== a.exists) changes.push({ key, kind: a.exists ? 'key-created' : 'key-deleted' });
    for (const name of new Set([...Object.keys(b.values), ...Object.keys(a.values)])) {
      const bv = b.values[name];
      const av = a.values[name];
      if (!bv) changes.push({ key, kind: 'added', name, after: av });
      else if (!av) changes.push({ key, kind: 'removed', name, before: bv });
      else if (bv.type !== av.type || bv.data !== av.data) changes.push({ key, kind: 'changed', name, before: bv, after: av });
    }
  }
  return changes;
}

export function formatChange(c) {
  const v = (x) => `${x.type} ${x.data}`;
  switch (c.kind) {
    case 'key-created': return `+ key ${c.key} (created)`;
    case 'key-deleted': return `- key ${c.key} (deleted)`;
    case 'added': return `+ ${c.key}\\${c.name}  ${v(c.after)}`;
    case 'removed': return `- ${c.key}\\${c.name}  ${v(c.before)}`;
    default: return `~ ${c.key}\\${c.name}  ${v(c.before)}  ->  ${v(c.after)}`;
  }
}

// ── processes ────────────────────────────────────────────────────────────────

// Read-only CIM query. No double quotes inside, so the argument passes through intact.
// Executable path and command line are collected for QuickLauncher.exe only.
const PS_SNAPSHOT = [
  "$ErrorActionPreference='SilentlyContinue'",
  '[Console]::OutputEncoding=[Text.Encoding]::UTF8',
  "Get-CimInstance Win32_Process | ForEach-Object { $c=0; if ($_.CreationDate) { $c=$_.CreationDate.ToFileTimeUtc() }; $x=''; $l=''; if ($_.Name -eq 'QuickLauncher.exe') { $x=[string]$_.ExecutablePath; $l=[string]$_.CommandLine }; [string]$_.ProcessId + [char]9 + [string]$_.ParentProcessId + [char]9 + [string]$c + [char]9 + [string]$_.Name + [char]9 + $x + [char]9 + $l }",
].join('; ');

export function parseProcessSnapshot(text) {
  const out = [];
  for (const raw of String(text).split('\n')) {
    const line = raw.replace(/\r$/, '');
    const m = /^(\d+)\t(\d+)\t(\d+)\t([^\t]*)\t([^\t]*)\t?(.*)$/.exec(line);
    if (m) {
      out.push({ pid: Number(m[1]), ppid: Number(m[2]), created: BigInt(m[3]), name: m[4], exe: m[5] || null, cmd: m[6] || null });
    } else if (line && out.length) {
      const last = out[out.length - 1];
      last.cmd = `${last.cmd || ''}\n${line}`; // a command line with an embedded newline
    }
  }
  return out;
}

export function snapshotProcesses() {
  const r = spawnSync(POWERSHELL_EXE, ['-NoProfile', '-NonInteractive', '-Command', PS_SNAPSHOT], {
    encoding: 'utf8', windowsHide: true, timeout: 30000, maxBuffer: 32 * 1024 * 1024,
  });
  if (r.error) throw new Error(`process snapshot failed: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`process snapshot exited ${r.status}`);
  const procs = parseProcessSnapshot(r.stdout);
  if (procs.length < 5) throw new Error('process snapshot returned almost nothing');
  return procs;
}

/**
 * The live processes that belong to the tree rooted at `root` ({pid, created}).
 * `known` holds identities seen in earlier snapshots, so an orphan whose parent (ours) already
 * exited is still recognised. A process is ours only when its parent, meaning the newest process
 * with that PID created no later than the child, is ours. So a reused PID never adopts strangers.
 */
export function ourTree(procs, root, known = []) {
  if (!root || root.created == null) return [];
  const ours = new Set([idKey(root)]);
  const byPid = new Map();
  const addIdent = (i) => {
    const list = byPid.get(i.pid) || [];
    if (!list.some((x) => x.created === i.created)) list.push({ pid: i.pid, created: i.created });
    byPid.set(i.pid, list);
  };
  addIdent(root);
  for (const k of known) { ours.add(idKey(k)); addIdent(k); }
  for (const p of procs) addIdent(p);
  const alive = [...procs].sort((a, b) => (a.created < b.created ? -1 : a.created > b.created ? 1 : 0));
  for (const p of alive) {
    if (ours.has(idKey(p))) continue;
    if (p.created < root.created) continue; // older than our root: never ours
    const cands = (byPid.get(p.ppid) || []).filter((c) => c.created <= p.created && !(c.pid === p.pid && c.created === p.created));
    if (!cands.length) continue;
    const parent = cands.reduce((a, b) => (b.created > a.created ? b : a));
    if (ours.has(idKey(parent))) ours.add(idKey(p));
  }
  return alive.filter((p) => ours.has(idKey(p)));
}

export function parseUserDataDir(cmd) {
  if (!cmd) return null;
  const m = /--user-data-dir=(?:"([^"]*)"|(\S+))/i.exec(cmd);
  return m ? (m[1] !== undefined ? m[1] : m[2]) : null;
}

/**
 * QuickLauncher main processes not in `exclude`: real (Sergei's, or anything not on a throwaway
 * temp profile, or whose command line can't be read), tests (another run's temp profile),
 * sameProfile (already running on the profile we were asked to use).
 */
export function classifyInstances(procs, { profile = null, tempRoots = [], exclude = new Set() } = {}) {
  const out = { real: [], tests: [], sameProfile: [] };
  const temps = tempRoots.map(realish);
  const prof = profile ? realish(profile) : null;
  for (const p of procs) {
    if (!p.name || p.name.toLowerCase() !== 'quicklauncher.exe') continue;
    if (exclude.has(idKey(p))) continue;
    if (p.cmd && /\s--type=/.test(p.cmd)) continue; // a Chromium child; its main process is counted
    const udd = parseUserDataDir(p.cmd);
    const r = udd ? realish(udd) : null;
    if (r && prof && samePath(r, prof)) out.sameProfile.push({ ...p, profile: r });
    else if (r && temps.some((t) => isInside(t, r))) out.tests.push({ ...p, profile: r });
    else out.real.push(p);
  }
  return out;
}

/** taskkill by explicit PID only: no /IM, no /T. Callers pass PIDs whose identity they just checked. */
export function killPids(pids) {
  if (!pids.length) return;
  const args = ['/F'];
  for (const p of pids) args.push('/PID', String(p));
  spawnSync(TASKKILL_EXE, args, { windowsHide: true, timeout: 20000, encoding: 'utf8' });
}

/**
 * End every live process in our tree and confirm none remain. The root goes through its Node
 * handle when we hold one (immune to PID reuse); the rest by PID after the identity check.
 */
export async function endTree(root, known, { rootHandle = null, attempts = 4 } = {}) {
  const killed = new Set();
  for (let i = 0; i < attempts; i++) {
    let procs;
    try {
      procs = snapshotProcesses();
    } catch {
      if (rootHandle) { try { rootHandle.kill(); } catch { /* already gone */ } }
      await sleep(1000);
      continue;
    }
    const ours = ourTree(procs, root, [...known.values()]);
    for (const p of ours) known.set(idKey(p), { pid: p.pid, created: p.created });
    if (!ours.length) return { killed: [...killed], remaining: [], verified: true };
    const isRoot = (p) => p.pid === root.pid && p.created === root.created;
    if (rootHandle && ours.some(isRoot)) {
      try { rootHandle.kill(); } catch { /* already gone */ }
      killed.add(root.pid);
    }
    const rest = ours.filter((p) => !(rootHandle && isRoot(p)));
    killPids(rest.map((p) => p.pid));
    rest.forEach((p) => killed.add(p.pid));
    await sleep(1000 + i * 500);
  }
  try {
    const remaining = ourTree(snapshotProcesses(), root, [...known.values()]);
    return { killed: [...killed], remaining, verified: true };
  } catch {
    return { killed: [...killed], remaining: [], verified: false };
  }
}

// ── build + profile facts ────────────────────────────────────────────────────

/** The version in the build's app.asar package.json, or null. */
export function readAsarVersion(exe) {
  let fd;
  try {
    fd = openSync(join(dirname(exe), 'resources', 'app.asar'), 'r');
    const head = Buffer.alloc(16);
    readSync(fd, head, 0, 16, 0);
    const headerSize = head.readUInt32LE(4);
    const jsonLen = head.readUInt32LE(12);
    if (jsonLen > 64 * 1024 * 1024) return null;
    const json = Buffer.alloc(jsonLen);
    readSync(fd, json, 0, jsonLen, 16);
    const pkg = JSON.parse(json.toString('utf8')).files['package.json'];
    const buf = Buffer.alloc(pkg.size);
    readSync(fd, buf, 0, pkg.size, 8 + headerSize + Number(pkg.offset));
    return JSON.parse(buf.toString('utf8')).version || null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) { try { closeSync(fd); } catch { /* noop */ } }
  }
}

/** size + mtime of the real profile's data files. Stat only; the files are never opened. */
export function realDataSignature(realDir) {
  if (!realDir) return 'n/a';
  return [DATA_FILE, `${DATA_FILE}.bak`, `${DATA_FILE}.tmp`].map((f) => {
    try { const s = statSync(join(realDir, f)); return `${f}=${s.size}:${s.mtimeMs}`; }
    catch (e) { return `${f}=${e && e.code === 'ENOENT' ? 'absent' : `error:${e && e.code}`}`; }
  }).join(' ');
}

function seedSummary(info) {
  const hk = info.hotkey === undefined ? '?' : JSON.stringify(info.hotkey);
  return `ok  startWithWindows=false  globalHotkey=${hk}  apps=${info.apps}  .tmp=${info.tmp}  .bak=${info.bak}`;
}

// ── watchdog: ends the tree if the launcher itself is killed ─────────────────

async function watchdog([rootPid, rootCreated, deadlineMs, launcherPid, launcherCreated]) {
  const root = { pid: Number(rootPid), created: BigInt(rootCreated) };
  const launcher = { pid: Number(launcherPid), created: BigInt(launcherCreated) };
  const hardStop = Number(deadlineMs) + 60000;
  const known = new Map();
  while (Date.now() < hardStop) {
    let procs;
    try { procs = snapshotProcesses(); } catch { await sleep(POLL_MS); continue; }
    const ours = ourTree(procs, root, [...known.values()]);
    for (const p of ours) known.set(idKey(p), { pid: p.pid, created: p.created });
    if (!ours.length) return EXIT.PASS;
    const launcherAlive = procs.some((p) => p.pid === launcher.pid && p.created === launcher.created);
    if (!launcherAlive || Date.now() >= Number(deadlineMs)) {
      killPids(ours.map((p) => p.pid));
      await sleep(1500);
      continue;
    }
    await sleep(POLL_MS);
  }
  return EXIT.ERROR;
}

// ── main ─────────────────────────────────────────────────────────────────────

function print(lines) { for (const l of lines) console.log(l); }

async function main(argv) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    console.error(`quicklaunch-safe-launch: ${e.message}. Run with --help for usage.`);
    return EXIT.ERROR;
  }
  if (opts.help) { console.log(USAGE); return EXIT.PASS; }
  if (opts.watchdog) return watchdog(opts.watchdog);

  const roots = defaultRoots();
  const out = ['QuickLaunch safe launch'];
  const say = (label, text) => out.push(`  ${label.padEnd(10)}${text}`);
  const warn = (text) => out.push(`  WARN      ${text}`);
  const reasons = [...opts.argReasons];

  const exe = resolve(opts.exe);
  reasons.push(...checkExe(exe, roots));
  const version = readAsarVersion(exe);
  say('build', `${exe}${version ? `  v${version}` : ''}`);

  const prof = checkProfilePath(opts.profile, roots, { mustExist: !opts.init });
  reasons.push(...prof.reasons);
  say('profile', prof.resolved);
  const profile = prof.resolved;

  if (opts.init && !prof.reasons.length) {
    if (isDir(profile) && safeReaddir(profile).length) {
      reasons.push(`--init needs a new or empty folder; ${profile} is not empty.`);
    } else {
      mkdirSync(profile, { recursive: true });
      const text = `${JSON.stringify(SAFE_SEED, null, 2)}\n`;
      writeFileSync(join(profile, DATA_FILE), text);
      writeFileSync(join(profile, `${DATA_FILE}.bak`), text);
      say('init', 'wrote a safe seed (startWithWindows=false, globalHotkey=null) and its .bak');
    }
  }

  let seed = null;
  if (!prof.reasons.length && isDir(profile)) {
    seed = checkSeedDir(profile, { createBak: false });
    reasons.push(...seed.reasons);
    if (!seed.reasons.length) say('seed', seedSummary(seed.info));
    seed.warnings.forEach(warn);
  }

  let procs = null;
  try { procs = snapshotProcesses(); } catch (e) {
    reasons.push(`Cannot list running processes (${e.message}); the launcher needs that to track what it starts.`);
  }
  let others = null;
  if (procs) {
    others = classifyInstances(procs, { profile, tempRoots: roots.tempRoots });
    const parts = [];
    parts.push(others.real.length ? `Sergei's instance RUNNING (PID ${others.real.map((p) => p.pid).join(', ')})` : "Sergei's instance not running");
    parts.push(others.tests.length ? `other test instances: ${others.tests.map((p) => `PID ${p.pid}`).join(', ')}` : 'other test instances: none');
    say('others', parts.join('; '));
    if (others.real.length) warn('A QuickLauncher that is not on a temp profile is running. It is left alone; its own changes can show up in the checks below.');
    if (others.tests.length) warn('Another test instance is running. A startup-key change during this run may be theirs.');
    if (others.sameProfile.length) {
      reasons.push(`A QuickLauncher is already running on this profile (PID ${others.sameProfile.map((p) => p.pid).join(', ')}). A second launch would bring that window forward. Use another profile.`);
    }
  }

  const refuse = (list) => {
    print(out);
    console.log('REFUSED: nothing was launched.');
    for (const r of list) console.log(`  - ${r}`);
    console.log(`CITE: ql-safe-launch REFUSED | ${list.length} reason(s) | nothing launched`);
    return EXIT.REFUSED;
  };
  if (reasons.length) return refuse(reasons);
  if (opts.check) {
    print(out);
    console.log('RESULT: PREFLIGHT OK (--check; nothing launched)');
    console.log(`CITE: ql-safe-launch PREFLIGHT OK | ${version ? `v${version}` : 'version ?'} | nothing launched`);
    return EXIT.PASS;
  }

  let regBefore;
  try { regBefore = snapshotRegistry(); } catch (e) {
    return refuse([`Cannot read the startup keys (${e.message}); without a baseline there is nothing to compare.`]);
  }
  // Re-check right before launch and create the .bak safety net.
  seed = checkSeedDir(profile, { createBak: true });
  if (seed.reasons.length) return refuse(seed.reasons);
  out[out.findIndex((l) => l.startsWith('  seed'))] = `  ${'seed'.padEnd(10)}${seedSummary(seed.info)}`;

  // ── launch ──
  const entriesBefore = new Set(safeReaddir(profile));
  const realBefore = realDataSignature(roots.realData);
  const logPath = join(profile, LOG_FILE);
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const fd = openSync(logPath, 'w');
  const spawnMs = Date.now();
  const deadline = spawnMs + opts.timeout * 1000;
  let child;
  let spawnError = null;
  let exitInfo = null;
  try {
    child = spawn(exe, [`--user-data-dir=${profile}`, ...opts.appArgs], { stdio: ['ignore', fd, fd], env });
  } catch (e) {
    spawnError = e;
  } finally {
    closeSync(fd);
  }
  if (!child || !child.pid) {
    print(out);
    console.log(`ERROR: could not start ${exe}: ${spawnError ? spawnError.message : 'no PID'}`);
    return EXIT.ERROR;
  }
  child.on('error', (e) => { spawnError = e; });
  child.on('exit', (code, signal) => { exitInfo = { code, signal }; });

  const root = { pid: child.pid, created: null };
  const known = new Map();
  const floor = msToFiletime(spawnMs - 5000);
  const identify = (ps) => {
    if (root.created != null) return;
    const r = ps.find((p) => p.pid === root.pid && p.created >= floor);
    if (r) root.created = r.created;
  };
  let me = null;
  try {
    const ps = snapshotProcesses();
    identify(ps);
    me = ps.find((p) => p.pid === process.pid) || null;
  } catch { /* retried in the loop */ }

  const emergency = () => {
    try { child.kill(); } catch { /* gone */ }
    try { killPids(ourTree(snapshotProcesses(), root, [...known.values()]).map((p) => p.pid)); } catch { /* watchdog covers it */ }
  };
  const onSignal = (sig) => {
    emergency();
    console.log(`Interrupted (${sig}); ended the launched instance.`);
    process.exit(EXIT.ERROR);
  };
  const SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'];
  for (const s of SIGNALS) process.on(s, onSignal);

  let wd = null;
  if (root.created != null && me) {
    wd = spawn(process.execPath, [SCRIPT, '--watchdog', String(root.pid), String(root.created), String(deadline + 30000), String(process.pid), String(me.created)], {
      detached: true, stdio: 'ignore', windowsHide: true,
    });
    wd.unref();
  }

  let endedBy = null;
  let regMid = [];
  const seenReal = new Set();
  const seenTests = new Set();
  for (;;) {
    if (spawnError) { endedBy = 'spawn-error'; break; }
    let ps = null;
    try { ps = snapshotProcesses(); } catch { /* try again next tick */ }
    if (ps) {
      identify(ps);
      const ours = ourTree(ps, root, [...known.values()]);
      for (const p of ours) known.set(idKey(p), { pid: p.pid, created: p.created });
      const c = classifyInstances(ps, { profile, tempRoots: roots.tempRoots, exclude: new Set(ours.map(idKey)) });
      c.real.forEach((p) => seenReal.add(p.pid));
      c.tests.forEach((p) => seenTests.add(p.pid));
      if (!ours.length && (root.created != null || exitInfo)) { endedBy = 'exited'; break; }
    }
    try {
      const d = diffRegistry(regBefore, snapshotRegistry());
      if (d.length) { regMid = d; endedBy = 'startup-key change (run stopped early)'; break; }
    } catch { /* checked again after the run */ }
    if (Date.now() >= deadline) { endedBy = 'timeout'; break; }
    await sleep(POLL_MS);
  }

  const cleanup = await endTree(root, known, { rootHandle: exitInfo ? null : child });
  if (wd && wd.exitCode === null) { try { wd.kill(); } catch { /* gone */ } }
  for (const s of SIGNALS) process.removeListener(s, onSignal);

  // Anything still running on our profile that the tree walk missed is reported, never killed.
  let strays = [];
  try {
    strays = classifyInstances(snapshotProcesses(), { profile, tempRoots: roots.tempRoots }).sameProfile;
  } catch { /* reported as unverified below */ }

  // ── after ──
  let regAfter = null;
  let regError = null;
  try { regAfter = snapshotRegistry(); } catch (e) { regError = e.message; }
  const changes = regAfter ? diffRegistry(regBefore, regAfter) : [];
  const realAfter = realDataSignature(roots.realData);
  const newEntries = safeReaddir(profile).filter((n) => !entriesBefore.has(n) && n !== LOG_FILE);
  const after = readSeedFile(join(profile, DATA_FILE));
  const afterCheck = after.state === 'ok' ? checkSeedData(after.data) : null;

  const pids = [...known.values()].map((k) => k.pid);
  say('run', `pid ${root.pid}${pids.length > 1 ? ` (+${pids.length - 1} child)` : ''}; timeout ${opts.timeout}s; ended by ${endedBy}${exitInfo && endedBy === 'exited' ? ` (code ${exitInfo.code})` : ''}`);
  say('pids', pids.length ? pids.join(', ') : `${root.pid} (exited before it could be listed)`);
  const remainingCount = cleanup.remaining.length + strays.length;
  say('remaining', cleanup.verified ? `${remainingCount}` : `${remainingCount} (could not verify: process listing failed)`);

  const failures = [];
  let exitCode = EXIT.PASS;
  const regLines = [];
  if (regError) {
    failures.push('startup keys unreadable after the run');
    exitCode = EXIT.REGISTRY;
  }
  for (const k of REG_KEYS) {
    if (!regAfter) break;
    const n = Object.keys(regAfter[k.label].values).length;
    const changed = changes.some((c) => c.key === k.label);
    regLines.push(`${k.label}: ${changed ? 'CHANGED' : 'unchanged'} (${n} values${regAfter[k.label].exists ? '' : ', key absent'})`);
  }
  say('registry', regLines.join('; ') || `unreadable (${regError})`);
  const reported = changes.length ? changes : regMid;
  if (reported.length) {
    exitCode = EXIT.REGISTRY;
    failures.push('startup keys changed');
    out.push('!! STARTUP KEYS CHANGED during this run:');
    for (const c of reported) out.push(`!!   ${formatChange(c)}`);
    if (!changes.length) out.push('!!   (seen mid-run; back to the baseline by the end)');
    if (seenTests.size || seenReal.size) out.push(`!!   Overlap: other QuickLauncher processes ran meanwhile (PID ${[...seenReal, ...seenTests].join(', ')}); a change may be theirs.`);
    out.push('!!   This launcher never writes the registry. Report it; do not edit the registry.');
  }

  if (realAfter !== realBefore) {
    if (seenReal.size) {
      warn(`Real profile data changed during the run, while a real instance was running (PID ${[...seenReal].join(', ')}); it may be that instance.`);
    } else {
      failures.push('real profile data changed');
      if (exitCode === EXIT.PASS) exitCode = EXIT.REAL_PROFILE;
      out.push(`!! REAL PROFILE DATA CHANGED (${roots.realData}) with no real instance running.`);
      out.push(`!!   before: ${realBefore}`);
      out.push(`!!   after:  ${realAfter}`);
    }
  } else {
    say('real data', 'untouched');
  }
  say('used', newEntries.length ? `yes (${newEntries.length} new entries in the profile)` : 'NO new entries; could not confirm the app used this profile');
  if (!newEntries.length) warn('The app left nothing in the profile folder. Check the log before trusting this run.');
  if (after.state !== 'ok' || (afterCheck && afterCheck.reasons.length)) {
    warn(`After the run the seed is no longer safe: ${after.state !== 'ok' ? after.state : afterCheck.reasons[0]}`);
  }

  let logLines = [];
  try { logLines = readFileSync(logPath, 'utf8').split(/\r?\n/).filter(Boolean); } catch { /* none */ }
  const notable = logLines.filter((l) => /\[store\]|\[hotkey\]|error/i.test(l)).slice(0, 5);
  say('log', `${logPath} (${logLines.length} lines)`);
  for (const l of notable) out.push(`            | ${l.slice(0, 160)}`);

  if (remainingCount) {
    failures.push(`${remainingCount} launched process(es) left`);
    exitCode = EXIT.LEFTOVER;
    out.push(`!! LEFT RUNNING: ${[...cleanup.remaining, ...strays].map((p) => `PID ${p.pid}`).join(', ')}`);
  } else if (!cleanup.verified) {
    failures.push('could not verify the launched processes ended');
    exitCode = EXIT.LEFTOVER;
  }

  print(out);
  const verdict = failures.length ? `FAIL (${failures.join('; ')})` : 'PASS';
  console.log(`RESULT: ${verdict}`);
  const regCite = regAfter ? REG_KEYS.map((k) => `${k.label} ${changes.some((c) => c.key === k.label) ? 'CHANGED' : 'unchanged'}`).join(', ') : 'startup keys unreadable';
  console.log(`CITE: ql-safe-launch ${failures.length ? 'FAIL' : 'PASS'} | ${version ? `v${version}` : 'version ?'} | profile ${basename(profile)} | pid ${root.pid}, ${pids.length} proc | ended ${endedBy} | ${remainingCount} left | ${regCite}`);
  return exitCode;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => {
    console.error(`quicklaunch-safe-launch: internal error: ${e && e.stack ? e.stack : e}`);
    process.exitCode = EXIT.ERROR;
  });
}
