#!/usr/bin/env node
/**
 * tryit-regions.mjs: Sergei's try-it for the regions build (M2: between regions).
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
QuickLaunch regions, try-it 2: between regions (${seed.apps.length} of your shortcuts, copied;
your real data is not touched)

If your normal QuickLauncher is open, hide it first. The test one has its own
tray icon. Hotkey: ${HOTKEY}. The run closes by itself after 5 minutes; run
this again for the steps you did not reach.

Drag between regions
 1. Tray > New region > Grid. Drag a tile from QUICK.LAUNCH onto the new
    region and hold it there: the new region gets a bright 2 px border, a
    dashed slot where the tile will land, and a copy of the tile under the
    pointer. Move along its tiles: the slot follows. Let go: the tile is there.
 2. Drag a tile out and let go on empty desktop, or in the gap between two
    regions: nothing moves, nothing launches.
 3. Drag a tile within its own region: it reorders, as before.

Keys on tiles (edit mode)
 4. Right-click inside a region (not on its header) for edit mode. Click an
    empty spot in it, then press Right arrow until a tile has the focus ring.
 5. Ctrl+Right / Ctrl+Left: the tile moves one place. Menu key (or
    Shift+F10): ONE tile menu opens; Move to sends it to another region.
    Delete: the tile goes and the focus ring moves to the next tile.

Display and sleep (the home-layout rule)
 6. Settings > System > Display: pick a smaller resolution, Keep changes.
    The regions squeeze onto the screen without overlapping (Grids may
    shrink). Change it back: every region returns exactly where it was.
    Optional: the same with Scale (150% to 125% and back), or with the
    taskbar moved to another edge and back.
 7. Start > Power > Sleep. Wake the PC: the regions are where they were.

 8. Tray > Quit QuickLauncher.
`);

const guard = spawn(process.execPath, [GUARD, '--exe', EXE, '--profile', profile, '--timeout', String(TIMEOUT), '--', '--ql-no-update-check'],
  { stdio: ['ignore', 'pipe', 'inherit'] });
let out = '';
guard.stdout.on('data', (d) => { out += String(d); });
const stopGuard = () => { try { guard.kill('SIGINT'); } catch { /* gone */ } };
process.on('SIGINT', stopGuard);
const code = await new Promise((r) => guard.on('exit', (c) => r(c)));

// What the run did, from the app's own log.
let log = '';
try { log = readFileSync(join(profile, 'ql-safe-launch.log'), 'utf8'); } catch { /* none */ }
const ev = log.split(/\r?\n/).filter((l) => l.startsWith('[regions] ')).map((l) => { try { return JSON.parse(l.slice(10)); } catch { return null; } }).filter(Boolean);
const recovered = ev.filter((e) => e.event === 'mode' && e.recovered).map((e) => e.recoveredMs);
const fallback = ev.filter((e) => e.event === 'mode' && e.to === 'fallback').length;
const created = ev.filter((e) => e.event === 'region-created').length;
const drops = ev.filter((e) => e.event === 'tile-drag');
const moved = drops.filter((e) => e.result === 'moved').length;
const cancelled = drops.filter((e) => e.result === 'cancelled').length;
const relayouts = ev.filter((e) => e.event === 'relayout');
const byReason = relayouts.reduce((m, e) => { m[e.reason] = (m[e.reason] || 0) + 1; return m; }, {});
console.log(out.trim());
console.log(`\nRegions created: ${created}. Tiles dropped on another region: ${moved}; drags cancelled: ${cancelled}.`);
console.log(`Display/sleep re-layouts: ${relayouts.length ? Object.entries(byReason).map(([k, v]) => `${k} ${v}`).join(', ') : 'none seen'}.`);
console.log(`Back on the desktop after a loss: ${recovered.length ? recovered.map((m) => `${m} ms`).join(', ') : 'no loss seen'}. Fallback windows: ${fallback}.`);
console.log(`Log: ${join(profile, 'ql-safe-launch.log')}`);
process.exit(code || 0);
