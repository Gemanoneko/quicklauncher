# QuickLaunch QA: startup-bounds follow-up (option b), 2026-10-05

**Verdict:** GO
**Slice under test:** window size/position at startup and the resize/move saves (`src/main/window.js`), uncommitted on `wip/theme-fidelity`. Futaba, QA.
**Ratings:** Blocker 0 | Major 0 | Minor 3 | Observations 3
Design/story flags: none

## Pinned build
HEAD `2f0ff73`, branch `wip/theme-fidelity`, working tree uncommitted. Hashes verified before and after the run (sha256, first 12 hex), no mismatch:

| File | sha256[:12] |
|---|---|
| `src/main/window.js` | `22675ff13a3c` |
| `test/window/stub-electron.js` | `7b784f87901c` |
| `test/window/window-save.test.js` | `566d85fdf007` |
| `test/window/startup-bounds.test.js` (new) | `de0f2c678077` |
| `Docs/QuickLaunch_Brief.md` | `c20f2e7d2009` |

`test/window/clamp.test.js` is deleted (confirmed, `D` in status). I edited no code and committed nothing.

## Census (Sergei's QuickLauncher untouched)
Before and after, the packaged `QuickLauncher.exe` set is identical: PIDs 30760 (main), 23324 (gpu), 31752 (network), 41564 (renderer), all from `AppData\Local\Programs\QuickLauncher`. Nothing of mine ran from there. My Electron processes used scratch profiles under `scratchpad\futaba-sb\`, exited 0, none left. The `QuickLaunch-regions-spike` electron processes are not mine and were not touched (their PIDs changed between my two readings, so that process is active). No process under `judy-m4` was touched. Sergei's real data file in `AppData\Roaming\QuickLauncher` was never opened.

## Ender's claims, reproduced

| Claim | Method | Result |
|---|---|---|
| `node --test test/` 35/35 | ran it | 35 pass, 0 fail. Reproduced. |
| 23 fail on HEAD's `window.js` | current tests copied to a scratch tree with `git show HEAD:src/main/window.js` | 35 tests, 12 pass, 23 fail. Reproduced. |
| `npm run check` exits 0 | ran it (contrast + hover gate) | exit 0; 101 themes, 3838 pairs, 0 errors, 36 processes started, 0 left. Writes only under the gitignored `scratch/`. Reproduced. |
| Malformed-shape table in real Electron | 31 rows, Electron 32.3.3, real `window.js`, hidden windows (`show:false`, `show`/`showInactive`/`focus` no-ops, `loadFile` no-op), in-memory store, no tray/hotkey/`index.js`. Same rows also run against HEAD's `window.js`. Primary display 5120x1440, work area 5120x1392, scale 1.5, one display. | Table below. Every row matches Ender's expectation. |
| Fitting size keeps size and position | rows "fits 600x400 @200,200", "pos partly off 5000,1300" | 600x400@200,200 kept; 424x300@5000,1300 kept (100x50 rule: partly off-screen stays as saved). Reproduced. |
| Store not rewritten at startup | every row waited 1.15 s after construction; also real `store.js` with a seeded file | 0 writes in all rows; seeded file sha unchanged. Reproduced for the window code (see m-2 for the app-level caveat). |
| Resize save writes position too | `setSize` after open, wait 700 ms | after the oversized open it wrote `{500x350, pos 4676,1072}`. Reproduced (m-2 of the earlier report fixed). |

Measured rows (opened bounds, real Electron), current `window.js` vs HEAD:

| Saved settings | Current | HEAD |
|---|---|---|
| `windowSize {null,null}` | 424x300@4676,1072 | **0x0@5100,1372** (earlier m-3) |
| `windowSize {null,null}` + pos 100,100 | 424x300@100,100 | 0x0@5100,1372 |
| `windowPosition {null,null}` + 500x320 | 500x320@4600,1052, no throw | **threw** "conversion failure" at startup |
| `{"500","300"}` | 424x300@4676,1072 | 500x300 (string accepted by Electron) |
| `{Infinity,300}` (`1e400`) | 424x300@4676,1072 | 5120x300@0,1072 |
| `{-Infinity,-Infinity}` | 424x300@4676,1072 | 800x600 (Electron default) |
| `{0,0}`, `{-5,300}`, `{500.5,300.7}`, array, null/null | 424x300@4676,1072 | 0x0 / 0x300 / 800x600 / 800x600 / 424x300 |
| 5120x1440 @0,0 (F11 file) | **424x300@4676,1072** | 5120x1392@0,0 (clamp) |
| 5120x1440, no position | **424x300@4676,1072** | 5120x1392@0,0 |
| 5120x1440 @-8,-8 | 424x300@4676,1072 | 5120x1392@0,0 |
| 5121x300 @100,100 (1 px over) / 424x1393 | 424x300@4676,1072 | clamped |
| 1e10 x 1e10 | 424x300@4676,1072 | 5120x1392@0,0 |
| 600x400 @200,200 (fits) | 600x400@200,200 | same |
| 5120x1392 @0,0 (exact work area, remembered maximise) | 5120x1392@0,0 kept | same |
| pos 1e21 / 2^31 / -20000 with a valid size | saved size at the default position, no throw | same |
| extra keys, `__proto__` key in the objects | 500x300@10,10 | same |

## Sergei's real case, seeded (real `store.js` + real `window.js`, scratch profile)
Data file: `windowSize 5120x1440`, `windowPosition {0,0}` (second run: `windowPosition: null`), `randomTheme:false` so no theme write confuses the hash.
- Window opened **424x300 at 4676,1072** (the default spot), both runs.
- Data file sha identical after 1.8 s idle; no `.bak`, no `.tmp`.
- After a resize to 500x350: file rewritten once with `windowSize 500x350` and `windowPosition {4676,1072}`; `.bak` appeared (normal store rotation).
- My first attempt had a fixture error (unescaped backslashes); the store correctly quarantined that file as corrupt. Fixed and re-run; results above are from the fixed fixtures.

## Findings

**No Blocker. No Major.**

**m-1 (Minor): a tiny saved size, or one within 20 px of the work area, opens partly off-screen.** The default position is computed from the saved size before Electron applies the minimum, so the shown window overhangs the work area.
- Measured with a standalone off-screen frameless window (x=-30000, `showInactive`, `focusable:false`): asked 10x10 became 150x120 on show, 1x1 became 142x112, 100x1000 became 181x1002. `window.js` places a 10x10 at 5090,1362, so the shown window spans 5090..5240 against a 5120 edge, and 1362..1482 against 1392.
- Exact work-area size with no saved position opens at **-20,-20**; 5110x1000 with no position opens 5112 wide at -10,372. HEAD does the same (not a regression).
- Reach: the tiny case needs a hand-edited file. The no-position-with-large-size case was reachable on HEAD (a resize saved size without position); the earlier m-2 fix now writes both, so it fades out.
- Repro: seed `{"windowSize":{"width":5120,"height":1392}}` with no position, launch, read bounds.
- Route: Ender, at his option.

**m-2 (Minor, doc drift): "The data file is not rewritten at startup" is true of `window.js`, not of the app.** `src/main/index.js` lines 76-82: with `randomTheme !== false` (default true) it calls `store.set('settings', {...theme})` on every start, so the file is rewritten each launch. `windowSize` and `windowPosition` survive (spread), and `ipc.js:236` stops the renderer overwriting them. I did not launch `index.js` (it registers the hotkey); this is a code read. If Sergei diffs his file around a launch he will see a change. Suggested wording: "the bounds are not rewritten at startup".

**m-3 (Minor, wrong comment): `startup-bounds.test.js` says Electron raises a tiny size "to the 180x150 minimum".** Measured on show at scale 1.5: 150x120 and 142x112; after a later `setSize` 181x151; a hidden window is not raised at all (10x10 became 13x13). The test asserts only what `window.js` passes in, so it passes; only the comment is wrong. Same family as m-1.

**Observations (not bugs):**
- O-1: the default position is `workAreaSize` minus size and ignores `workArea.x/y`. With the taskbar on the left or top the default window sits a taskbar-width off the bottom-right corner. Code read only (no display-setting calls allowed). Pre-existing; taskbar is at the bottom here.
- O-2: by ruling, an oversized file keeps opening at the default until the first move or resize. Not a defect.
- O-3: `settings` null/undefined throws (`settings.windowSize`). Measured with a stub store. Unreachable: `store.js` `_isValid` rejects a non-object `settings` and merges defaults.

## Standing dimensions
- Save/persistence (window state): seeded F11 file, open, idle, resize all behave as above; size and position are now always saved together. PASS.
- Quest-flag reachability: n/a (no quest flags in this tool).

## Not run (list for the next away window)
1. **Real maximise of this frameless window**: does it save a size above the work area (Windows frameless maximise can overshoot by about 8 px; every 5120x1440 row I ran, including @-8,-8, reset to the default)? If so, option (b) turns the remembered maximise into the default window on the next launch. Procedure: maximise, wait 1 s, quit, read the data file, relaunch. Not done: no visible window while Sergei is at the PC.
2. **First real show of the window**: whether showing fires a `resize` that writes the store at startup (all my windows were hidden; zero writes). Benign if so, but it would contradict "not rewritten".
3. **Real `moved` save**: `setPosition` does not emit `moved` on Windows, so the move save is covered by the stub tests only, not in real Electron. Needs a real drag.
4. **Multi-display**: oversized for the second display opens on the primary. Stub test only; one display here, no display-setting calls.
5. **Packaged-app launch and the `index.js` theme-rotation write** (m-2): not launched.

## Pattern alerts:
- The Bash environment here has `ELECTRON_RUN_AS_NODE=1` set. Launching `electron.exe` from it silently runs plain Node ("Cannot find module 'electron'"). Harnesses must unset it.
- A harness that destroys its last window exits the app (no `window-all-closed` handler) before it writes results; my first run exited 0 with no output. "exit 0, no output" means the app quit early.
- Stub-based tests carry claims about Electron behaviour (minimum size, `getDisplayMatching` throwing). The throwing claim was measured and is right; the minimum-size claim was not and is wrong (m-3). Claims in stub comments want a real-Electron measurement.
- Hand-written fixture JSON with Windows paths fails as corrupt; the store quarantines it instead of crashing, which is the right behaviour.

Harness and raw outputs: `scratchpad\futaba-sb\` (`matrix-main.js`, `seed-main.js`, `min-main.js`, `work.out`, `head.out`, `seed-*.out`, `min.out`, `check.log`).
