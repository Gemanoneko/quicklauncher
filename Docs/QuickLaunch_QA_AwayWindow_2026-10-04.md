# QuickLaunch QA: away-window real-input checks, 2026-10-04 (Futaba)

Away window granted by Sergei (relayed by the coordinator): 08:32:42 to 09:32:00 machine time. **Used: 08:33 to about 08:53.** First real input 08:43:28 (a drag), last about 08:52:26. A usage-limit stop ended the session at about 08:53; nothing was sent after that. About 20 of the 59 minutes were used. Everything not listed as PASS below is NOT RUN and goes back to "pending, next away window" (section 7).

**Verdict:** GO

GO covers only the items marked PASS in section 3: the M2b real-pointer drags and keys on the regions build, the real double-click and the Enter-row glyph in the skin picker, and the real hover and press checks on five skins plus Republic and Separatist. It is not a clearance of any NOT RUN item (tray Quit, fallback mode, fullscreen, hotkey and the rest, see section 7). No Blocker and no Major was found among the checked items. 2 Minor findings and 3 observations.

Pattern alerts: 2 (section 6)

---

## 1. What was built and run (committed code only)

| Build | Source | How | Where |
|---|---|---|---|
| Regions M2b | `git archive d878e86` of the `wip/regions` repo (M2b code plus docs). The worktree itself has uncommitted M3 code: not run, not modified (only `git archive` and read-only `git status` touched it). | `electron-builder --win dir --x64 --publish never`, called through `WIP/QuickLaunch/node_modules/electron-builder/cli.js` with `--projectDir` on my copy and `--config.directories.output` in scratch. Electron 32.3.3 dist read from the tool's `node_modules`. | `scratchpad\futaba-away\out\regions3\win-unpacked\QuickLauncher.exe` |
| Themes and picker | `git archive d0a3037` (`wip/theme-fidelity` HEAD) of `WIP/QuickLaunch` | same | `scratchpad\futaba-away\out\themes\win-unpacked\QuickLauncher.exe` |

- `node_modules` were real byte copies of only what the app needs (the `electron-updater` tree; for regions also `koffi` and `@koromix/koffi-win32-x64` from the worktree's own `node_modules`). No junctions, no symlinks. `npm run build` was never run. `--publish never`, so nothing was published or pruned; the real trees' `dist/` was not touched. No NSIS installer was built or run.
- Scratch prefix: `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ab778959-0638-4d60-8887-346c422e496e\scratchpad\futaba-away\` (1.1 GB; recursive deletes are denied, so it stays in place).
- The first two regions builds (`out\regions`, `out\regions2`) lacked the `koffi` platform package, so the app silently fell back to fallback mode ("desktop layer unavailable" in the log). That was my packaging gap, not the product. `out\regions3` has `app.asar.unpacked\node_modules\@koromix` and attaches ("raised" layout, host Progman). Every real-input check below ran on `regions3`.
- The main tree `WIP/QuickLaunch` was clean at `d0a3037` when I archived it. At 13:01 it shows Ender's uncommitted edits (`Docs/QuickLaunch_Brief.md`, `scripts/theme-gallery/hover.cjs`, `scripts/theme-gallery/run.mjs`). They are not in my build.
- Data: every profile is synthetic (`%TEMP%\ql-away\reg1..reg4, th1`). Sergei's data file was never read. Tiles point at `C:\qa-nonexistent-away\*.exe`, so nothing could launch. Seed: `startWithWindows` false, `globalHotkey` null. The regions profile has 3 Grid regions, ALPHA (6 tiles), BRAVO (3), CHARLIE (empty). The theme profile has 8 tiles.
- Launches: 5, all through `scripts/qa/quicklaunch-safe-launch.mjs` with `--remote-debugging-port` (localhost) and `--ql-no-update-check` on the regions builds.

| # | Profile | Build | Pid | Ended | Guard CITE |
|---|---|---|---|---|---|
| 1 | reg1 | regions (no koffi) | 44984 | I ended its tree by PID | PASS, 0 left, Run keys unchanged |
| 2 | reg2 | regions2 (no koffi) | 27268 | same | PASS, 0 left, Run keys unchanged |
| 3 | reg3 | regions3 | 49760 | same | PASS, 0 left, Run keys unchanged |
| 4 | reg4 | regions3 | 19780 | same (all regions real-input checks ran here) | PASS, 0 left, Run keys unchanged |
| 5 | th1 | themes | 40768 | guard timeout at 300 s | PASS, 0 left, Run keys unchanged |

No real input was sent to runs 1 and 2 (read-only window listings only).

## 2. How real input was sent, and how it was kept off everything else

- Display: one monitor, 7680 x 2160 physical, 144 dpi (150 %). Sergei's ChatGPT window covers x 2654 to 6215 of it. In attached mode regions sit under other top-level windows, so I placed mine in the free right-hand strip (x 6231 to 7605) and drove them there.
- A small helper I compiled for this window (`tools\rin.exe`, source `tools\rin.cs` in the scratch folder) sent all OS input with `SendInput`. Each command refused to act (a) after 09:32:00 by the machine clock, (b) for the mouse, unless the window under the pointer belonged to the process tree I passed with `--tree`, (c) for keys, unless the foreground or the keyboard-focus window belonged to that tree. In attached mode the foreground is Explorer (Progman) and the focus window is the region, so (c) used the focus window. Every click line printed the window it hit, and every one was `pid=<mine>`.
- Reads (window lists, `at` probes, tray listings) sent no input.
- Page state came from Chrome DevTools on my own instances' debugging ports (9391, 9392): geometry, DOM state, the data file. DevTools did not send any input events; all mouse and keyboard events were OS-level.

## 3. Results

### Regions M2b (`QuickLaunch_QA_RegionsM2b_2026-10-01.md` section 8)

| # | Item | Result | Evidence |
|---|---|---|---|
| R1 | Real drag between two regions: moves outside the source window still reach it, the drop lands where the pointer is | **PASS** | Drag from ALPHA tile RA1 to BRAVO, path across the desktop gap, 40 steps, 3.2 s hold. Mid-drag, BRAVO body class `tile-drop-preview tile-drop-valid`, a slot between RB1 and RB2, the drop hint `display:none`. After release data file: ALPHA `RA2..RA6`, BRAVO `RB1,RA1,RB2,RB3`. App log: `tile-drag moved item qa-rA-1 to rB index 1`. Screenshot `shots\drag1-mid.png`: bright outline on the target, dashed slot, copy under the pointer, dimmed placeholder in the source. |
| R2 | Release on empty desktop cancels | **PASS** | Release at (6500,1010), window under it was the desktop icon view (Explorer). Log `cancelled, reason "not on a region"`; data unchanged; no slot and no ghost left in either page. |
| R3 | Release on a region's rim cancels | **PASS** | Release at ALPHA's left rim, (6234,605), over my own window. Log `cancelled, "not on a region"`; data unchanged. |
| R4 | Release on a full region cancels | **NOT RUN** | A Grid region has no cap in this build; the full state needs a capped layout (Fan, Ring), which M2b does not draw. |
| R5 | Judy check 2: hint hides while a tile hovers an empty region, returns after | **PASS** | CHARLIE hint `flex` before, `none` mid-preview, `none` after the drop (it now holds RA2). `shots\drag3-mid.png`. |
| R6 | Real Menu key: one tile menu per press | **PASS** | Edit mode, focus on RA3 (real Right arrow). One keydown `ContextMenu` reached the page, one menu on screen (`shots\menukey.png`: Rename, Move to, Remove). Real Esc closed it (`shots\after-esc1.png`). Caveat: no `contextmenu` DOM event followed, so the 800 ms skip of Windows' follow-up event is still untested; there was also no second menu. I could not count native menus in code (the Windows 11 popup is not window class `#32768`; my counter read 0 with a menu showing), so "one" rests on the screenshots and on Esc leaving none. |
| R7 | Real Shift+F10: one tile menu per press | **PASS** | Same method. `shots\shiftf10.png` shows one menu; Esc closed it (`shots\after-esc2.png`). |
| R8 | Real Ctrl+Right, Ctrl+Left, Ctrl+Down, Delete in edit mode | **PASS** | RA3 moved from place 1 to place 2 (status line `Moved to 2 of 4.`, data file agrees); Ctrl+Down with 4 tiles in 3 columns did nothing (no row below); Ctrl+Left moved it back; Delete removed it and focus went to the next tile `qa-rA-4`, data file agrees. |
| R9 | Real right-click enters edit mode; real left click focuses a region | **PASS** | Body gains `edit-mode`; the foreground stays Explorer and the keyboard focus is the region (focus window pid = mine). |
| R10 | Real tooltips on hover | **PASS (partial)** | Gear: "Settings" shown (`shots\tip-gear.png`). The "..." button: a tooltip starting "Reg" shown, cut off by my capture width (`shots\tip-more.png`). The hide button's shot was saved, not looked at. |
| R11 | Fallback checks (real click activates, first click not swallowed, typed letter filters, Ctrl+Right, F6 for m-1) | **NOT RUN** | The run with `--ql-no-desktop-layer` never happened. |
| R12 | Option A risk 1 (closing or minimising the window above a fallback region) | **NOT RUN** | Needs a fallback run and another window. |
| R13 | Win+D and click-to-raise | **NOT RUN** | Win+D minimises every window of Sergei's; I did not do it. Suggest dropping the step or getting Sergei's explicit yes. |
| R14 | Native tray menu: Quit, Show / Hide, double-click | **NOT RUN** | See section 4 for what I learned about telling the two tray icons apart. |
| R15 | Real hotkey | **NOT RUN** | |
| R16 | The real Manager window and picker as pixels | **NOT RUN** | |
| R17 | Real display or scale change, sleep and resume | **NOT RUN** | Forbidden in the brief. |

### Theme batch 6 (`QuickLaunch_QA_Batch06_2026-10-01.md` section 7), build `d0a3037`

| # | Item | Result | Evidence |
|---|---|---|---|
| B1 | Packaged launch through the safe launcher | **PASS** | `QuickLauncher.exe` from `electron-builder --dir`, window shown at its seeded position, guard PASS (run 5 in section 1). Not the NSIS installer. |
| B2 | Real tray icon click on Quit; real Hide button on a shown window | **NOT RUN** | The Hide click was never sent: my session's instance had already ended at the 300 s guard timeout (08:52:25) and the command failed on malformed arguments before any input. |
| B3 | Eyes on the six Star Wars skins at 150 % | **PARTIAL: Republic and Separatist PASS, Empire, Rebel, Sith, Mandalorian NOT RUN** | Real hover on CHECK FOR UPDATES and on `+ INSTALLED` in edit mode, and the rest view (`shots\sw-star-wars-republic\all.png`, `shots\sw-star-wars-separatist\all.png`). **Batch 6 F1 and F2 (hover labels illegible) read fixed in this build:** Republic hover is white on crimson, Separatist hover is dark text on tan, both clearly legible. |
| B4 | Fullscreen on the real panel; real icons on shaped plates | **NOT RUN** | Tiles were synthetic and have no icons. |

### Hover56 (`QuickLaunch_QA_Hover56_2026-10-02.md` section 9), same build

| Skin | Result | What was done with the real mouse and keys |
|---|---|---|
| control, dune, mirrors-edge, silent-hill, alien | **PASS** (5 of 5) | Per skin: pick by typing, then 3 real Down arrows through the skin list, hover DONE in edit mode, hover a tile remove button (tooltip "Remove" showed), mouse down on the plain `+ FILE` button, hold 1.4 s, drag off and release (cancelled, so no file dialog). I looked at all five montages (`shots\h56-<skin>\all.png`: list, DONE hover, remove hover, pressed). Labels and glyphs read in every one, light skins (mirrors-edge, silent-hill) included. |
| Press INSTALL NOW | **NOT RUN** | It needs an update-available bar, and my themes build has no `app-update.yml` (see O2). |
| Close and tray Quit from each top-level screen | **NOT RUN** | |

### Skin picker (`QuickLaunch_QA_SkinPicker_2026-10-02.md` section 7, `QuickLaunch_QA_GradientGallery_PickerC_2026-10-02.md` section 7)

| # | Item | Result | Evidence |
|---|---|---|---|
| P1 | Real double-click on a skin row, 3 skins | **PASS** (3 of 3) | BLAIR WITCH, CONTROL: THE BUREAU, DEAD SPACE, 70 ms between presses, Settings open at 424 x 300 (150 %). After each: the skin switched, the list closed, the field empty and still focused, slider 64, the three checkboxes and the hotkey field unchanged (`CLICK AND PRESS KEYS`), and the data file differs from the seed only in `theme`. **The question PickerC section 7 asked is answered: a real OS double-click reaches the page with click count 2.** A page-level recorder (armed for CONTROL and DEAD SPACE) logged `mousedown:2`, `mouseup:2`, `click:2`, `dblclick:2` on the second press, and the second press landed on the control the list had covered (a checkbox label; the overlay) without acting. Not measured: the number of saves under real input (I only have the final file). |
| P2 | The enter glyph at 150 %, pointer resting on another row | **PASS by eye** | Dark skin (CYBERPUNK) and light skin (2001), `shots\picker-dark-150.png`, `shots\picker-light-150.png`. The glyph and the left bar are plainly visible on the Enter row; the hovered row also carries a tint, and the glyph is what tells them apart. Sergei's call whether he wants hover to move the Enter row (spec C.2.5). |
| P3 | Real keys on the real window | **PASS (partial)** | Real typing `2001`, `cyberpunk`, `dune` and others plus Enter picked each; real Esc closed the list with Settings still open (list hidden, Settings `flex`), the next Esc closed Settings. The Esc ladder with fullscreen and edit mode, Russian layout, the list scrollbar track: NOT RUN. |
| P4 | Hotkey hide and show with the list open or parked; Alt+Tab away and back | **NOT RUN** | |
| P5 | Real fullscreen with Settings open | **NOT RUN** | |
| P6 | Tray Quit by a real click | **NOT RUN** | |

## 4. Tray notes for the next window (what I learned, no tray click was made)

- Sergei's QuickLauncher also sits pinned on the taskbar ("QuickLauncher - 1 running window pinned"); do not click that button.
- Tray icons are in the hidden-icons overflow. A newly started instance's icon appears **first** in the overflow list; every other icon shifts by one. With mine running the list had QuickLauncher at the first slot and at the seventh; with mine ended only the one at the sixth slot remained. So: list the overflow before launching (my list: `scratchpad\futaba-away\tray-S0.txt`), launch, list again, and the extra entry that is new at the front is yours. Then, before any Quit click, a right-click menu's owner process must be mine.
- I opened and closed the overflow flyout programmatically (UI Automation Invoke on "Show Hidden Icons", not the mouse) twice at about 08:46 to read the icon names, which showed the flyout on Sergei's screen briefly each time. The last toggle should have left it closed; I did not re-verify it.

## 5. Findings (Blocker / Major / Minor)

**Blocker:** none. **Major:** none.

**Minor**
- **m-1. Alien: the hovered tile remove button is the weakest of the five skins.** In `shots\h56-alien\all.png` the hovered X is a pale glyph on a bright yellow-green disc. It reads, and the hover gate passes it, so this is a look, not a gate miss; I did not measure the ratio. Status: open, for Judy to eyeball.
- **m-2. Unverified by me, carried: the "one save per double-click" count under real input.** The final file is right in all three, but the save count needs the app's log or a spy. Status: open, small.

**Observations (not defects)**
- **O1. A packaging miss would silently fall back.** With `koffi` absent from my copy the app started in fallback mode and only wrote "desktop layer unavailable" to its log; nothing told the user. The real worktree build is fine (its `app.asar.unpacked` holds `@koromix`). Worth a line in the release checklist for the regions branch: "the packaged build attaches (log says `attached`)".
- **O2. My themes build has no `app-update.yml`** (built with `--publish never` through the tool's CLI), so its update check logs `ENOENT ... app-update.yml`. A scratch-build artifact, not a product fault.
- **O3. In attached mode, the default area of this display is covered by Sergei's own windows**, so a region placed there would be under them. That is the desktop-layer design, not a defect; it only decided where I could test.

## 6. Pattern alerts

Pattern alerts: 2

1. **Every QA pass rebuilds its harness by hand.** This pass I again assembled `node_modules` for a build copy by hand (and lost three launches to a missing native package, which the log only hinted at), and wrote a guarded real-input helper and a seeding script from scratch. Same shape as the lane-2 smoke-harness alert (which got a maintained copy in `9142189`). Proposed disposition: **fix**, studio-level and small: one maintained "archive a commit, copy node_modules, `--dir` build, check the log says `attached`" script and one maintained guarded real-input helper under `scripts/qa/`, with the 09:32-style deadline and tree guards built in (Ender; Jane confirms). The helper source is in the scratch folder.
2. **`python -` heredocs hang on this machine** (second pass in a row: the Hover56 pass and this one each lost a command to one; mine cost two minutes and was ended through its task). Proposed disposition: **accept** with a note in every brief: use `node` for text edits, never `python`.

## 7. Pending, next away window (Sergei's own word, with times)

1. Tray: real click on `Quit QuickLauncher` for the regions build and the themes build, plus Show / Hide and double-click; the real Hide button on a shown window (themes). Use the list-before and list-after method in section 4.
2. Regions fallback run (`--ql-no-desktop-layer`): real click activates, first click not swallowed, a typed letter filters, Ctrl+Right moves a tile, F6 (m-1), and Option A risk 1.
3. Star Wars skins Empire, Rebel, Sith, Mandalorian at 150 %; real fullscreen (F11) with Settings open; real icons on the shaped plates (needs synthetic icons, since Sergei's library is not read).
4. INSTALL NOW press (needs a build with `app-update.yml` and a feed that offers an update, or a stand-in).
5. Picker: Russian layout, list scrollbar-track press, global hotkey hide and show with the list open (needs a hotkey distinct from Sergei's), Alt+Tab, Esc ladder with fullscreen and edit mode, the real save count.
6. Regions: real hotkey, the real Manager and picker as pixels, release on a full region (needs a capped layout), the Win+D step (Sergei's explicit yes needed or drop it).
7. Display or scale change, sleep and resume: not for any window the brief forbids.

## 8. Census, cleanup, safety

| Time | `QuickLauncher.exe` | `electron.exe` |
|---|---|---|
| 08:33:14 (before) | 16: Sergei's 4 (PIDs 30760 main, 23324, 31752, 41564, all under `AppData\Local\Programs\QuickLauncher`) plus 12 from another Futaba's M3 test (root 41676, under `...\futaba-m3\...`) | 0 |
| 08:39:25 | 4 (the M3 instance had ended) | 0 |
| 13:01:57 (after) | **4, PIDs 30760, 23324, 31752, 41564, identical to before** | **0** |

- During the run another QuickLauncher test instance (root 18820) appeared and went; not mine (path not under `futaba-away`).
- Sergei's four were never touched, clicked, focused or killed. My instances used their own profiles (`ql-away\...`) and therefore their own single-instance lock; hotkey null, so no global hotkey was held. The guard reported **Run and StartupApproved\Run unchanged** in all five runs, and "real data untouched".
- Ended: reg1, reg2, reg3, reg4 by `taskkill /PID <mine> /T /F` (four times, my own trees only); th1 by the guard's timeout. No kill by image name. Guard: `0 left` each time. At 13:01:57 no process of mine was found (command-line search for `futaba-away` found only the shell running the search itself; the four Python processes on the machine date from before 08:32 and are not mine). Nothing of mine is open on the screen. The cursor was last parked on the desktop at (6930,1010) at 08:46:58 and then left where my last real action put it, inside my own (now closed) window's area, about (6450,450) to (6937,480); I did not re-park it.
- Repos: no file written in `WIP/QuickLaunch` or the regions worktree except this report (uncommitted). No git write anywhere.
- Slips to be honest about:
  1. At about 08:49 a click landed at (6450,450), the top-left pixel of my own window, because a coordinate lookup returned null for a hidden control. The guard allowed it (the window was mine); it had no visible effect.
  2. At about 08:52:38, 13 seconds after the themes instance ended, my script issued one `key esc` command. The helper refuses when the foreground or focus window is not in the tree, so nothing should have been sent, but I had discarded that command's output and cannot show the refusal. The same call's mouse click failed on malformed arguments before any input.
  3. The two UI Automation toggles of the tray overflow in section 4.
  4. The 120 s python hang (pattern alert 2) and the three builds before the right one.
- No audio, no browser, no other app of Sergei's was used, no display setting changed, no sleep.
- Scratch left in place: `scratchpad\futaba-away\` (`regions`, `themes`, `out\regions`, `out\regions2`, `out\regions3`, `out\themes`, `tools\` with `rin.cs`, `rin.exe`, `cdp.mjs`, `geo.mjs`, `seed.mjs`, `pick.sh`, `hover56.sh`, `sw.sh`, `tray.ps1`, `overflow.ps1`, `ovtoggle.ps1`; `shots\` with the evidence images and `drag1-mid-dom.txt`, `drag3-mid.txt`; `guard-*.log`, `build-*.log`, `tray-S0.txt`) and `%TEMP%\ql-away\reg1`, `reg2`, `reg3`, `reg4`, `th1`.
