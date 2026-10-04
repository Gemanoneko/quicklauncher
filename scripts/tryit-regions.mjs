#!/usr/bin/env node
/**
 * tryit-regions.mjs: Sergei's try-it for the regions build (M2 + M2b: between regions).
 *
 *   node "C:\Antigravity Projects\QuickLaunch-regions-spike\scripts\tryit-regions.mjs"
 *   node "...\scripts\tryit-regions.mjs" --fallback   (Judy's optional 30-second fallback check)
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
// --fallback: Judy's optional 30-second check of fallback mode (regions as
// ordinary windows just above the desktop, --ql-no-desktop-layer).
const FALLBACK = process.argv.includes('--fallback');

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
// Moved shortcuts in the copy would point into the real store folder: the copy keeps them as plain references.
seed.apps = seed.apps.map((a) => { if (!a || a.kind !== 'moved') return a; const { kind, origin, ...rest } = a; return rest; });
writeFileSync(join(profile, 'quicklauncher-data.json'), `${JSON.stringify(seed, null, 2)}\n`);
// M3: the file move works only on a fake desktop inside this temp profile, so a
// try-it run can never move a file off the real Desktop or Public Desktop.
const desk = join(profile, 'desk');
for (const d of ['Desktop', 'Public Desktop']) mkdirSync(join(desk, d), { recursive: true });
// Two sample shortcuts on the fake desktop for the M3 step (UX spec addendum B12.2).
for (const [name, url] of [['Try A', 'https://example.com/a'], ['Try B', 'https://example.com/b']]) {
  writeFileSync(join(desk, 'Desktop', `${name}.url`), `[InternetShortcut]
URL=${url}
`);
}

if (FALLBACK) {
  console.log(`
QuickLaunch regions, fallback check (30 seconds; ${seed.apps.length} of your shortcuts, copied)

The regions open as ordinary windows just above the desktop (fallback mode).
They must NOT take the focus by themselves: whatever you were in keeps it.

 1. Click a region once (not its header). Type a letter: the filter chip in
    the header shows it and the tiles filter.
 2. Right-click inside it for edit mode, press Right arrow until a tile has the
    focus ring, then Ctrl+Right: the tile moves one place.
 3. Tray > Quit QuickLauncher.

If the letter does not appear, or a region took the focus without a click,
tell Jane.
`);
} else console.log(`
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
 5. Ctrl+Right / Ctrl+Left: the tile moves one place; Ctrl+Down / Ctrl+Up:
    one row, same column (nothing at the last or first row). Menu key or
    Shift+F10: ONE tile menu opens; Move to sends it to another region.
    Delete: the tile goes and the focus ring moves to the next tile.
    Out of edit mode, Shift+F10 on a focused tile puts the region in edit
    mode with the focus still on that tile.

How the drop looks (Judy's six, M2b)
 a. The dashed slot is the theme's bright text accent and exactly a tile's
    height: no row below jumps, also in edit mode.
 b. Hover a tile over an EMPTY region: its drop hint hides; move away: back.
 c. The copy under the pointer looks like the tile you picked up.
 d. Move a tile over a region and away again: the gap closes smoothly, the
    way it opened. Reordering inside one region stays instant.
 e. Let go on a region: no flicker of the gap closing before the tile shows.
 f. Optional, 30 s: run this script again with --fallback and follow its steps.

Display and sleep (the home-layout rule)
 6. Settings > System > Display: pick a smaller resolution, Keep changes.
    The regions squeeze onto the screen without overlapping (Grids may
    shrink). Change it back: every region returns exactly where it was.
    Optional: the same with Scale (150% to 125% and back), or with the
    taskbar moved to another edge and back.
 7. Start > Power > Sleep. Wake the PC: the regions are where they were.

Desktop files move in (M3). This run uses a fake desktop: your real desktop is never touched.
 a. In Explorer open ${join(desk, 'Desktop')}. It holds Try A and Try B.
 b. Drag both onto a region. They leave the folder and appear as tiles.
 c. Right-click the region, Edit shortcuts. Click ↩ on one: it is back in the folder.
 d. Open the Manager, Moved shortcuts. OPEN FOLDER shows ${join(desk, 'QuickLauncher Shortcuts')}.
 e. Region menu, Move all shortcuts back to desktop...: the other one goes back.
 Note: a shortcut dragged from your real desktop is added as a normal tile and stays on the desktop in this run.

 8. Tray > Quit QuickLauncher.
`);

const guard = spawn(process.execPath, [GUARD, '--exe', EXE, '--profile', profile, '--timeout', String(TIMEOUT), '--', '--ql-no-update-check', `--ql-test-desktop=${desk}`, ...(FALLBACK ? ['--ql-no-desktop-layer'] : [])],
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
