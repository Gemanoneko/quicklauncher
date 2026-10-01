#!/usr/bin/env node
/**
 * tryit-regions.mjs: Sergei's try-it for the regions build (M1).
 *
 *   node "C:\Antigravity Projects\QuickLaunch-regions-spike\scripts\tryit-regions.mjs"
 *
 * Runs the worktree build through the studio's QA launch guard on a fresh
 * profile in %TEMP%, with a COPY of the real shortcuts (the real data file is
 * only read). The copy gets Start with Windows off (the guard's rule) and the
 * hotkey Ctrl+Shift+Space, because the installed QuickLauncher holds Ctrl+Space.
 * The run ends when QuickLauncher quits from its tray, or after 5 minutes.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const EXE = join(REPO, 'dist', 'win-unpacked', 'QuickLauncher.exe');
const GUARD = [
  join(REPO, '..', 'Studio Illuminati', 'scripts', 'qa', 'quicklaunch-safe-launch.mjs'),
  join(REPO, '..', '..', 'scripts', 'qa', 'quicklaunch-safe-launch.mjs'),
].map((p) => resolve(p)).find((p) => existsSync(p));
const HOTKEY = 'Ctrl+Shift+Space'; // free on Sergei's machine (2026-10-01); Ctrl+Alt+Space is held there
// --timeout <s> (5-300): shorter runs for checking this script itself.
const ti = process.argv.indexOf('--timeout');
const TIMEOUT = ti > 0 ? Math.max(5, Math.min(300, Number(process.argv[ti + 1]) || 300)) : 300;

if (!existsSync(EXE)) { console.error(`No build at ${EXE}. Ask Ender for a build.`); process.exit(1); }
if (!GUARD) { console.error('The QA launch guard (scripts/qa/quicklaunch-safe-launch.mjs) was not found.'); process.exit(1); }

const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
const profile = join(tmpdir(), 'ql-regions-tryit', stamp);
mkdirSync(profile, { recursive: true });
const real = process.env.APPDATA ? join(process.env.APPDATA, 'QuickLauncher', 'quicklauncher-data.json') : null;
let seed = null;
try { seed = JSON.parse(readFileSync(real, 'utf8')); } catch { seed = null; }
if (!seed || !Array.isArray(seed.apps)) seed = { apps: [], settings: {} };
seed.settings = { ...(seed.settings || {}), startWithWindows: false, globalHotkey: HOTKEY };
writeFileSync(join(profile, 'quicklauncher-data.json'), `${JSON.stringify(seed, null, 2)}\n`);

console.log(`
QuickLaunch regions, try-it 1 (${seed.apps.length} of your shortcuts, copied; your real data is not touched)

Your grid is now region "QUICK.LAUNCH", on the desktop behind your windows.
If your normal QuickLauncher is open, hide it first. The test one has its own
tray icon (its menu has "Regions..." and "New region"). Hotkey: ${HOTKEY}.

 1. Win+D: the region stays. Click it, type a few letters: tiles filter.
 2. Drag its header to move it. Drag an edge or corner to resize it.
 3. Tray > New region > Grid (twice). Drag them around: they never overlap.
 4. Click the region's ... button: the region menu opens. Try Rename and Place.
 5. Right-click a tile (edit mode), right-click it again: Move to > a region.
 6. ${HOTKEY}: all regions hide; again: they come back.
 7. Task Manager > Windows Explorer > Restart: regions come back in ~1 s.
 8. Tray > Regions...: the Manager. Rename, icon, theme, Match all, delete.
 9. Tray > Quit QuickLauncher. (It closes by itself after 5 minutes.)
`);

const guard = spawn(process.execPath, [GUARD, '--exe', EXE, '--profile', profile, '--timeout', String(TIMEOUT), '--', '--ql-no-update-check'],
  { stdio: ['ignore', 'pipe', 'inherit'] });
let out = '';
guard.stdout.on('data', (d) => { out += String(d); });
const stopGuard = () => { try { guard.kill('SIGINT'); } catch { /* gone */ } };
process.on('SIGINT', stopGuard);
const code = await new Promise((r) => guard.on('exit', (c) => r(c)));

// What the run did, from the app's own log: desktop layer, rebuilds, regions.
let log = '';
try { log = readFileSync(join(profile, 'ql-safe-launch.log'), 'utf8'); } catch { /* none */ }
const ev = log.split(/\r?\n/).filter((l) => l.startsWith('[regions] ')).map((l) => { try { return JSON.parse(l.slice(10)); } catch { return null; } }).filter(Boolean);
const recovered = ev.filter((e) => e.event === 'mode' && e.recovered).map((e) => e.recoveredMs);
const fallback = ev.filter((e) => e.event === 'mode' && e.to === 'fallback').length;
const created = ev.filter((e) => e.event === 'region-created').length;
console.log(out.trim());
console.log(`\nRegions created: ${created}. Back on the desktop after a loss: ${recovered.length ? recovered.map((m) => `${m} ms`).join(', ') : 'no loss seen'}. Fallback windows: ${fallback}.`);
console.log(`Log: ${join(profile, 'ql-safe-launch.log')}`);
process.exit(code || 0);
