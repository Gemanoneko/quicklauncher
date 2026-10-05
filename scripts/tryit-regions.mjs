#!/usr/bin/env node
/**
 * tryit-regions.mjs: Sergei's try-it for the regions build (M2, M2b, M3). Feel only:
 * every step is actions to take and one question (UX spec, addendum "try-it rewrite").
 *
 *   node "C:\Antigravity Projects\QuickLaunch-regions-spike\scripts\tryit-regions.mjs"
 *   node "...\scripts\tryit-regions.mjs" --fallback   (Futaba's fallback run)
 *   node "...\scripts\tryit-regions.mjs" --print [--fallback]   (print the text only; nothing is
 *     created or launched; test/regions/tryit-text.test.js lints it)
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
// --fallback: Futaba's fallback run (regions as ordinary windows just above the
// desktop, --ql-no-desktop-layer). Nothing in it is for Sergei to try.
const FALLBACK = process.argv.includes('--fallback');
// --print: print the text and exit; no profile is made and nothing is launched.
const PRINT = process.argv.includes('--print');

const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
const profile = join(tmpdir(), 'ql-regions-tryit', stamp);
const desk = join(profile, 'desk');
const real = process.env.APPDATA ? join(process.env.APPDATA, 'QuickLauncher', 'quicklauncher-data.json') : null;
let seed = null;
try { seed = JSON.parse(readFileSync(real, 'utf8')); } catch { seed = null; }
if (!seed || !Array.isArray(seed.apps)) seed = { apps: [], settings: {} };

// The printed text: UX spec, addendum "try-it rewrite" (Judy, 2026-10-04), verbatim.
const TEXT = FALLBACK ? `
QuickLaunch regions, fallback run (${seed.apps.length} of your shortcuts, copied)

The regions open as ordinary windows just above the desktop (fallback mode). This run is for Futaba's checks; there is nothing for you to try here.

Finish: right-click the test QuickLauncher's tray icon and choose Quit QuickLauncher.
` : `
QuickLaunch regions, try-it (${seed.apps.length} of your shortcuts, copied; your real data and your real desktop are not touched)

Start: if your normal QuickLauncher is showing, press Ctrl+Space to hide it. The test copy has its own tray icon and the hotkey ${HOTKEY}. Each step ends in one question; a word is enough. The run closes by itself after 5 minutes; run this again for the steps you did not reach.

Between regions
 1. Right-click the test QuickLauncher's tray icon, choose New region, then Grid. Drag a tile from QUICK.LAUNCH onto the new region and hold it there for two seconds, then move along the new region, out of it and back in. Look at the new region and at the pointer as you move. Is it clear where the tile will land?
 2. Let go over the new region. Then drag one tile out onto the empty desktop and let go, and drag one tile to another place inside its own region. Look at where each tile ends up. Does dragging tiles around feel easy?

Keys in edit mode
 3. Right-click inside a region, not on its header, to start edit mode. Click an empty spot in it, press Right arrow until a tile has a ring around it, then press Ctrl+Right and Ctrl+Left. Look at the tile. Do the keys feel natural for rearranging?
 4. With the ring still on a tile, press Shift+F10 (or the Menu key). Look at the menu, choose Move to, then another region. Is that a handy way to send a tile to another region?

Desktop files move in (M3)
 5. Open File Explorer at ${join(desk, 'Desktop')}. It holds Try A and Try B, on a fake desktop. Drag both onto a region. Look at the region and at the Explorer window. Is dropping desktop shortcuts onto a region the way you want to add them?
 6. Right-click that region, choose Edit shortcuts, and click ↩ on one of the two new tiles. Look at the region and at the Explorer window. Is ↩ a clear way to put a shortcut back?
 7. Right-click the tray icon and choose Regions... Find Moved shortcuts and click OPEN FOLDER. Look at the folder that opens and at the section. Does the section tell you what you need to find your moved shortcuts?
 8. Right-click a region, choose Move all shortcuts back to desktop..., then click Move back. Look at the Explorer window. Is that a good way to undo it all?

A shortcut dragged from your real desktop is added as a normal tile and stays on the desktop in this run.

Finish: right-click the test QuickLauncher's tray icon and choose Quit QuickLauncher.
`;
if (PRINT) { console.log(TEXT); process.exit(0); }

if (!existsSync(EXE)) { console.error(`No build at ${EXE}. Ask Ender for a build.`); process.exit(1); }
if (!GUARD) { console.error('The QA launch guard (scripts/qa/quicklaunch-safe-launch.mjs) was not found.'); process.exit(1); }

mkdirSync(profile, { recursive: true });
seed.settings = { ...(seed.settings || {}), startWithWindows: false, globalHotkey: HOTKEY };
// Moved shortcuts in the copy would point into the real store folder: the copy keeps them as plain references.
seed.apps = seed.apps.map((a) => { if (!a || a.kind !== 'moved') return a; const { kind, origin, ...rest } = a; return rest; });
writeFileSync(join(profile, 'quicklauncher-data.json'), `${JSON.stringify(seed, null, 2)}\n`);
// M3: the file move works only on a fake desktop inside this temp profile, so a
// try-it run can never move a file off the real Desktop or Public Desktop.
for (const d of ['Desktop', 'Public Desktop']) mkdirSync(join(desk, d), { recursive: true });
// Two sample shortcuts on the fake desktop for the M3 steps (Try A, Try B).
for (const [name, url] of [['Try A', 'https://example.com/a'], ['Try B', 'https://example.com/b']]) {
  writeFileSync(join(desk, 'Desktop', `${name}.url`), `[InternetShortcut]
URL=${url}
`);
}

console.log(TEXT);

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
