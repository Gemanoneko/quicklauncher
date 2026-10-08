# QuickLaunch QA: away-window real-input checks, 2026-10-05 (Futaba)

## READ FIRST: three things Sergei or Jane must fix by hand

### 1. The display was NOT restored (my mistake, 04:49:32)

I changed display settings for the display-level checks. Three of the four checks were restored and read back correctly (section 7). The fourth step was a mistake: I called `ChangeDisplaySettingsEx(NULL, NULL, ...)` ("revert to the registry mode") as a supposedly harmless no-op check. It was not a no-op. The live mode of this display is not the registry mode, so it dropped the display to **1024 x 768 @ 60 Hz, 100 %**. I then tried to set 7680 x 2160 @ 120 back: Windows answers `DISP_CHANGE_BADMODE` (-2). A second route (`SetDisplayConfig` with `SDC_USE_DATABASE_CURRENT`) returned success and changed nothing. Windows now reports no monitor with an EDID (`WmiMonitorID` empty; the two `G95NC_S57CG95xN` entries have status Unknown; two "Default Monitor" entries are present). The physical monitor is off (as Sergei said), so Windows only offers generic modes now. Per the relay, I stopped all real input at 04:50.

**Exact original values (taken at 00:01 and re-read after each restore):**

| Setting | Original value |
|---|---|
| Display | `\\.\DISPLAY1`, primary, one monitor, GPU NVIDIA GeForce RTX 5080, monitor Samsung `G95NC_S57CG95xN (DP 2.1 VRR 120Hz)` |
| Mode | **7680 x 2160 @ 120 Hz, 32 bpp**, position 0,0, orientation 0 (not in the GDI mode list, which tops out at 2560 x 1600) |
| Scale | **150 %** (the recommended value; range 100 to 350 %) |
| Work area | 0,0,7680,2088 (taskbar at the bottom) |
| Taskbar | not auto-hide (`ABM_GETSTATE` = 0); `StuckRects3` Settings `30000000FEFFFFFF0200000003000000A8000000480000000000000028080000001E0000700800009000000001000000` |

**State now (04:53):** 1024 x 768 @ 60 Hz, 100 %, work area 0,0,1024,720, taskbar state 0 (unchanged).

**What to do:** switch the monitor on. Windows keeps a saved configuration for that monitor (two `SAM7476` entries exist), so it should come back at 7680 x 2160 @ 120 Hz by itself. If not: Settings, System, Display, resolution 7680 x 2160, refresh 120 Hz, scale 150 %. I did not read or change any other display setting. The 1024 x 768 state was written by the `SDC_USE_DATABASE_CURRENT` call too, so check the scale as well. Proof files: `...\scratchpad\futaba-away2\proof\display-s0.txt` (original), `display-after-T1/T2/T3.txt` (restored and identical), `disp-T4-accidental.txt` (the slip).

### 2. Sergei's browser was launched by a click of mine (04:37:47)

A blind coordinate click (4617,640), meant as an empty spot in the ALPHA test region, landed on a moved tile because tiles had been appended in a second row. The tile was the throwaway `zz-futaba-test-2.url`. **It launched.** Sergei's default browser (Chrome) opened a new active tab `https://example.invalid/futaba-throwaway` ("This site can't be reached", `ERR_NAME_NOT_RESOLVED`) in its existing window. That breaks Jane's rule "never launch a .url". The guard refused my next click because Chrome had come to the front, so nothing was clicked inside the browser. I never touched Chrome's content or its tabs. Chrome's window had been minimised by my Win+D; it restored itself for the tab, and I minimised it again by handle (bookkeeping of my own Win+D). **A stray `example.invalid` tab is in Sergei's Chrome and needs closing by him.** No data was sent beyond a failed DNS lookup of the `.invalid` name. All later clicks on tiles used DevTools geometry.

### 3. Eight of Sergei's windows are minimised (my Win+D)

I used Win+D to see the desktop (the regions sit under the windows) and restored the windows once by hand (exact rects, section 8). The last Win+D batch was never restored, because restoring onto a 1024 x 768 desktop would make Windows shove them into the small screen and rewrite their stored positions. They stay minimised, with their stored normal positions intact (read back at 04:51): claude `4901,226,7270,1947`, ChatGPT `1158,40,4058,1998`, Chrome `3808,46,7055,2024`, Blender `3797,176,6269,1521`, three File Explorer windows `5173,777,6831,1847`, `3890,985,5548,2055`, `5876,217,7534,1287`, Godot `45,19,1083,656` (rescaled to 100 %, it was `67,28,1625,984`; it is DPI-aware and rescales when the display returns). Clicking them in the taskbar restores them. Also: when Godot regained focus it showed its own dialog "Files have been modified outside Godot"; I did not touch it.

---

**Verdict:** GO

GO covers only the items marked PASS below: the real-pointer, real-key and real-tray checks on the themes build `6cbdeb5` (tray Quit, Show/Hide, double-click, Hide button, global hotkey, four Star Wars skins, picker on a Russian layout, list scrollbar, hotkey with the list open, INSTALL NOW) and on the regions M3 build `3467e5c` (real Explorer drag of desktop icons onto a region, move back, Move all back, OPEN FOLDER, native menus and boxes as pixels, tooltips, real keys on tiles, release on a full region, real hotkey, tray, Manager, Option A risk 1, scale and taskbar auto-hide with the home-layout rule). It does not clear the FAIL items. **No Blocker. Two Major** (F-1 fullscreen cannot be exited and corrupts the saved window size; F-2 fallback mode is blank and inert on real hardware), 4 Minor and 5 observations. If Sergei uses F11, treat F-1 as a Blocker. Two process slips of mine are in section 10; they are not product findings.

Pattern alerts: 3 (section 11)

---

## 1. Step 0: the display (00:01)

- Window start 00:01:07, first clock read 00:01:34. Sergei's 4 `QuickLauncher.exe` (30760, 23324, 31752, 41564) present.
- `Screen.AllScreens` = 1 (`\\.\DISPLAY1`, primary, 32 bpp), `SM_CMONITORS` = 1, virtual screen 0,0 7680 x 2160, system DPI 144 (150 %), work area 7680 x 2088. **Not 1920 x 1080 as yesterday.**
- Desktop screenshot is real content (Sergei's windows and wallpaper): 10368 sampled pixels, 1911 distinct colours, 9 black. `...\futaba-away2\step0-desktop.png`.
- Verdict of Step 0: display attached (monitor in standby but enumerated). Proceeded.

## 2. The window as used

| When | What |
|---|---|
| 00:01 to 00:08 | Step 0, builds, baselines (Desktop, Public Desktop, census, Run keys, windows, display) |
| 00:09 to 00:16 | Real input: tray, Hide, hotkey, F11, skins, picker |
| 00:16 to 04:11 | **Stopped by a usage limit.** Nothing was sent. Resumed on the coordinator's message at 04:11:35; clock re-read 04:11:50, display identical to Step 0, Desktop identical, census 4 PIDs. No display setting had been changed by then |
| 04:12 to 04:45 | Real input: Russian layout, INSTALL NOW, regions M3, real Explorer drags, fallback, Win+D |
| 04:47 to 04:50 | Display-level checks (display API calls, no pointer or keys): scale, auto-hide, then the slip (section 1) |
| after 04:50 | Real input stopped. Only reads, plus one more restore attempt (`SetDisplayConfig`, no effect) at 04:50:32 |

Last pointer or key input: 04:45:01 (Win+D in fallback). Every input command was guarded by my helper `rin2.exe`: deadline 08:01:00, the window under the pointer must belong to my process tree, keys only when my window is foreground or has focus, desktop-icon drags only from a point inside an icon rectangle I declared and only on class `SysListView32`, and a drop that would end on any window but mine is cancelled with Esc. The tray was clicked only through `Shell_NotifyIconGetRect` for my own process's notify icon (identified by PID, never by position). The one time a guard refused (04:38, Chrome in front) is in section 1.

## 3. Builds (committed code only)

| Build | Source | How |
|---|---|---|
| Regions M3 | `git archive 3467e5c` of `wip/regions` (code equals `d993236`) | `electron-builder --win dir --x64 --publish never` through the tool's CLI with `--config.electronVersion=32.3.3` and `--config.electronDist`, output in scratch. `node_modules` byte copies (the `electron-updater` tree plus `koffi` and `@koromix/koffi-win32-x64`; no junction, no symlink). **Attached mode confirmed**: log `mode attached, layout raised, host Progman` for every region. |
| Themes and picker | `git archive 6cbdeb5` of `wip/theme-fidelity` | same |

`npm run build` was never run. For INSTALL NOW only, I added a `resources/app-update.yml` to **my copy** of the themes build (generic provider, `127.0.0.1:9477`, `updaterCacheDirName: ql-away2-updater`) so Sergei's `quicklauncher-updater` cache was never used (its listing is unchanged). The feed served a stub installer I compiled myself.

Every Electron launch went through `scripts/qa/quicklaunch-safe-launch.mjs` on its own temp profile. Twelve guard runs, all `PASS`, `0 left`, `Run` and `StartupApproved\Run` unchanged. One run (`disp1`, the display checks) logged "real profile data changed ... may be that instance": Sergei's own running QuickLauncher (30760) saving its window geometry when the scale and resolution moved. I never read his data file.

## 4. Results, item 1: the NOT RUN list of 2026-10-04

### Themes build `6cbdeb5`

| Item | Result | Evidence |
|---|---|---|
| Tray: real click on Show / Hide, then again | **PASS** | window hid, then showed (`wins` vis False then True) |
| Tray: double-click | **PASS** | hid, then showed |
| Real Hide button click on a shown window | **PASS** | click on `#btn-hide` at its DOM position, window hidden |
| Tray: real Quit click | **PASS** (3 runs: th1, th3, th4) | guard `ended exited`, `0 left` |
| Real global hotkey Ctrl+Alt+Shift+F7 (held by my instance: `RegisterHotKey` fails with 1409; Sergei's Ctrl+Space not used) | **PASS** | show, hide, show; foreground = my window after show |
| Star Wars skins Empire, Rebel, Sith, Mandalorian at 150 % (real typing and Enter, real hover on CHECK FOR UPDATES and on `+ INSTALLED` in edit mode, rest view) | **PASS** (4 of 4) | `shots\sw-empire`, `sw-rebel`, `sw-sith`, `sw-mando\all.png`: every label and glyph reads |
| INSTALL NOW | **PASS** | stand-in feed: check 5 s after start shows `UPDATE AVAILABLE`, real click DOWNLOAD gives `UPDATE READY`, real click INSTALL NOW: my stub ran with `--updated /S --force-run`, the app exited (`ended exited`, 0 left). Cache and stub removed by name afterwards |
| Picker, real list scrollbar-track press | **PASS** | list scrollTop 1884, 1727, 1569; list stays open, focus stays in the field, Settings body does not scroll |
| Picker, hotkey hide and show with the list open | **PASS** | hide closes the list; on show it stays closed (also 1.5 s later), Settings still open. Parked list (after Enter pick) also fine |
| Picker on a Russian layout | **PASS** | window thread set to 0x4190419, other windows stayed 0x4090409 (`proof\layouts-before/after.txt` identical, restored and verified). Real Down x3 gave 3 ArrowDown; scan codes P F Q X B R produced `зайчик` (`з/KeyP ...`), 1 row `ЗАЙЧИК / TINY BUNNY`, Enter picked `tiny-bunny`; Esc closed the list, the next Esc closed Settings |
| Real F11 with Settings open | **FAIL** | F-1 |
| Alt+Tab, Esc ladder with edit mode, real save count | **NOT RUN** | not reached |
| Real icons on shaped plates | **NOT RUN** | no synthetic icons made |
| Press INSTALL NOW from a build without `app-update.yml` | n/a | stand-in used |

### Regions M3 build `3467e5c` (attached)

| Item | Result | Evidence |
|---|---|---|
| Release on a full region | **PASS** (fixture caveat) | `BUILT_LAYOUTS` is `grid` only, so I seeded a `fan` region with 10 tiles (cap 10). Real drag of A1 onto it: log `tile-drag cancelled reason "full region"`, data unchanged (ALPHA 5, FULLFAN 10). The FULL look mid-drag was not captured |
| Win+D with attached regions | **PASS** | regions stay visible and receive input; Sergei's windows minimised. **But** a second Win+D did not restore them, because the Manager window had opened in between (Windows forgets the toggle). I restored by `SW_RESTORE`, bottom of the z-order first: rects, minimised state and z-order identical to before except the tray flyout I had opened |
| Real hotkey | **PASS** | hides all four regions, second press shows all four |
| Tray: Show / Hide, double-click, Quit (regions) | **PASS** | hide-all and show-all both ways; Quit `ended exited`, `0 left` |
| Regions fallback (real click activates, first click not swallowed, typed letter filters, Ctrl+Right, F6) | **FAIL** | F-2 |
| Option A risk 1 | **PASS** (with one observation) | my own window over a fallback region: graceful close twice and minimise once left the foreground on the taskbar, never the region. A force-killed foreground window (TerminateProcess, 1 of 1) handed the foreground to ALPHA (observation O-3) |
| Win+D with fallback regions | **FAIL vs spec** | the fallback regions are not minimised by Win+D (tool windows). The spec says they are; moot while F-2 stands |
| Real Manager window and picker as pixels | **PASS** | Manager (840 x 840, REGIONS tab, MOVED SHORTCUTS) `shots\manager-regions.png`, `manager-moved.png`; ✕ by a real click hides it, the process stays |
| Display layout, scale and taskbar | section 7 | |

## 5. Results, item 2: M3 real Explorer drag (`QuickLaunch_QA_RegionsM3_2026-10-04.md` section 8)

Throwaway files only, on the real Desktop, created by me: `zz-futaba-test-1.lnk` and `zz-futaba-test-3.lnk` (target `notepad.exe`), `zz-futaba-test-2.url` (target `https://example.invalid/...`; never launched on purpose). Desktop and Public Desktop listings before and after: identical (section 8). Sergei's icons were never dragged, clicked or selected; my clicks and drags started only inside the rectangle of my own icon, found by eye on a screenshot and checked with `WindowFromPoint` (`SysListView32`).

| Item | Result | Evidence |
|---|---|---|
| Does the desktop-child region accept the OLE drop | **PASS** | drag from the desktop icon onto ALPHA: log `drop-files moved 1`, tile `zz-futaba-test-1` with the notepad icon |
| What the drag shows | **PASS** | the drag image reads **"+ Copy"**, the region shows its drop outline and a dashed slot (`shots\drag-hold-alpha.png`). The cursor itself stays a plain arrow (shell drag image) |
| Explorer leaves the file to the app's move; the icon disappears | **PASS** | file moved to `C:\Users\AnGeLZzZ\QuickLauncher Shortcuts\` (folder and `README.txt`, 472 bytes, created at the first move); the icon left the Desktop; no "file is in use" box |
| Bitdefender reaction | **PASS** | none: no denied-access box, no M-1 |
| Several icons in one drop | **PASS** | select, Ctrl+select, drag: `.lnk` and `.url` both moved, 2 tiles, `drop-files moved 2` |
| ↩ returns it | **PASS** | real click on `btn-move-back` (tooltip "Move back to desktop"): file back on the Desktop |
| Manager: OPEN FOLDER | **PASS** | opens `QuickLauncher Shortcuts - File Explorer` with README and the 3 shortcuts (closed by me by exact title) |
| Manager: MOVE ALL BACK... | **PASS** | native box (information icon, "Move 3 shortcuts back to the desktop?", "They leave 2 regions. Names already on the desktop get a number."), buttons Move back / Cancel with **Cancel the default**; Esc cancels; Move back returns all three; Manager reads "None moved off the desktop." and the button is disabled |
| `+ FILE` native dialog | **PASS** | "Add Application" dialog; typing the full path of a `.lnk` (target `calc.exe`) and Enter gives a tile whose **path is the `.lnk` itself**, not its target (icon shows the target's) |
| Native region menu, tile menu, message boxes as pixels | **PASS** | region menu (`shots\menu-region.png`), tile menu Rename / Move to > / Remove (`menu-tile.png`), Delete region box (warning icon, "Delete “ALPHA”?", Cancel default, Esc and Enter cancel, box centred on the work area over the desktop-child windows, `box-delete.png`), missing-file box (warning icon, "... is missing from the QuickLauncher Shortcuts folder.", Remove tile / **Keep default**, Esc keeps the tile, `box-missing2.png`) |
| Real hover tooltips | **PASS** | "Random theme for this region", "Settings", "Hide all regions to tray", "Region menu" (`shots\tips.png`), "Move back to desktop" |
| Real OS keys on tiles | **PASS** | click an empty spot, Right gives the ring on A1, Right on A2; Shift+F10 in view mode starts edit mode with the ring kept on A2 and no menu; Ctrl+Right (3 of 6), Ctrl+Down (6 of 6), Ctrl+Down again no move, Ctrl+Left (5), Ctrl+Up (2), Ctrl+Up again no move; Delete removed A2 and the ring moved to A3; data file agrees at each step. Shift+F10 on a tile in edit mode: one native tile menu. **The real Menu key (`apps`) was not run** (my attempt had no tile focused; section 1 slip) |
| A real drag of a Public Desktop icon ("Needs administrator rights.") | **NOT RUN** | would drag Sergei's own Public Desktop icons; I cannot create my own icon there without admin |
| Real uninstaller and `--ql-restore-all` with real tiles | **NOT RUN** | Sully's packaged-build test |

Cleanup: store folder emptied by name (2 files, `README.txt`) and removed with `rmdir`; my 3 throwaway files are gone from the Desktop (1 deleted from the store by me to make the missing-file case, 2 removed from the store). `C:\Users\AnGeLZzZ\QuickLauncher Shortcuts` did not exist before and does not now.

## 6. Results, item 3: the M2b list (`QuickLaunch_QA_RegionsM2b_2026-10-01.md` section 8)

1. Real drag between regions: done 2026-10-04 (PASS). Not repeated.
2. Real Menu key and Windows' follow-up `contextmenu`: **NOT RUN** (see above). Shift+F10 PASS.
3. Fallback: **FAIL** (F-2).
4. Option A risk 1: **PASS** (section 4).
5. Win+D and click-to-raise: attached PASS; fallback FAIL vs spec / not testable.
6. Native tray menu: **PASS**.
7. Real hotkey: **PASS** (a test hotkey, held by my instance only).
8. Tooltips, Manager and picker as pixels: **PASS**.
9. Display or scale change: section 7. Sleep and resume: never run.

## 7. Results, item 4: display-level checks, settings record and restore proof

Rule: record, change, read back, restore, read back. Regions build `3467e5c` attached, two Grid regions ALPHA (3000,200) and BRAVO (3500,200), 424 x 300 DIP. Original values are at the top.

| Check | Change and read-back | Home-layout rule | Restore proof |
|---|---|---|---|
| **Scale 150 % to 200 %** (04:48:15) | 150 % to 200 % (work area 3840 x 1032 DIP). Display mode unchanged | **PASS.** The regions re-clamped: ALPHA stayed, BRAVO moved from x 3500 to 3404 and down to y 512 so as not to overlap (12 DIP gap) and to stay inside the 3840 wide work area. Data file `rect` and `home` unchanged | restored to 150 %, read back: `proof\display-after-T1.txt` **identical to Step 0**; regions back at exactly 4491,291 and 5241,291 (`disp-T1-restored.txt`) |
| **Scale 150 % to 100 %** (04:48:47) | 150 % to 100 % | **PASS.** Same DIP positions, half the pixels, no clamp needed, file unchanged | restored and read back identical (`display-after-T2.txt`); regions exactly back |
| **Taskbar auto-hide** (04:49:08) | `ABM_SETSTATE` 0 to 1 (work area 7680 x 2160) | **PASS.** Regions unchanged, file unchanged | restored to state 0, read back identical (`display-after-T3.txt`), `StuckRects3` value identical to Step 0 |
| **Taskbar moved to another edge** | not possible | **NOT RUN** | Windows 11 has no taskbar-edge setting; changing `StuckRects3` needs an Explorer restart. Auto-hide stands in for the work-area change |
| **Resolution change** | **not run on purpose.** The accidental revert to 1024 x 768 (section 1) is the only data point | The regions relaid out (`relayout, workArea 1024 x 720, moved 2`); both regions fit; BRAVO ended left of ALPHA; data file `rect` and `home` unchanged (`disp-T4-accidental.txt`). Whether they return to their saved places cannot be checked until the display returns | **NOT RESTORED** (section 1) |
| Sleep and resume | never run | | |

Side effects checked: the Desktop icon-position registry value names (`ItemPos<w>x<h>x96`) are identical before and after (84 names); `HKCU ... StuckRects3` identical; `Run` and `StartupApproved\Run` identical.

## 8. The real Desktop proof

Method: `readdir` + `lstat` (name, kind, size, mtime in ms) of `C:\Users\AnGeLZzZ\Desktop` (84 entries) and `C:\Users\Public\Desktop` (4 entries), plus whether the store folder exists, saved as JSON and diffed (`tools\listreal.cjs`). The Desktop view is **auto-arrange** (`HKCU ... Shell\Bags\1\Desktop` FFlags `0x40200225`, bit 1 set).

| Listing | Time | Result |
|---|---|---|
| s0 | 00:08 | 84 + 4, store absent (baseline) |
| s1 | 04:11 | identical to s0 |
| s3 (after I created 3 files) | 04:23 | exactly 3 ADDED: `zz-futaba-test-1.lnk`, `-2.url`, `-3.lnk` |
| s5 (after cleanup) | 04:40 | **identical to s0** |
| s6 (final) | 04:53 | **identical to s0**; store folder absent |

My three files came and went; nothing of Sergei's changed. Windows I minimised and restored: exact rects restored for 8 windows once (`proof\allwins-after-restore1.txt` vs `allwins-before-wind.f.txt`); the last batch is still minimised (section 1).

## 9. Findings

**Blocker:** none.

### Major

**F-1. F11 fullscreen cannot be exited, and it corrupts the saved window size** (themes build `6cbdeb5`, main tree; probably older too).
Repro (real keys, packaged build, a window fully on screen): open Settings, press F11. The window goes to the screen (0,0,7680,2160). Esc closes Settings and the window stays fullscreen (right). Every further Esc, F11 or a click on the Fullscreen button: nothing leaves fullscreen; the button title flips between "Exit fullscreen" and "Fullscreen" without effect. Only the tray Show/Hide, the Hide button or Quit get you out. Meanwhile `windowSize` 5120 x 1440 DIP was saved to the data file, so **the next launch opens a screen-sized window** (confirmed: relaunch of the same profile gave a 5120 x 1392 window, rect 450,1725 to 8130,3813).
Cause by reading: `src/main/window.js` makes a frameless transparent window. On Windows, Electron's `setFullScreen` on such a window only resizes it to the display and `win.isFullScreen()` stays false, so `ipc.js` `toggle-fullscreen` and `exit-fullscreen` never take their exit path, and the `resize` handler's `isFullScreen()` guard never fires. Lane 2 never exercised a real `exit-fullscreen`, which is why this was invisible. Status: open, for Ender. Sergei decides if F11 is in his flow (then it is a Blocker).

**F-2. Fallback mode is blank and inert on real hardware** (regions M3 `3467e5c`, `--ql-no-desktop-layer`).
Repro: launch with the flag; the log says `fallback, reason kill switch`; both region windows exist, top-level, visible by `IsWindowVisible`, and take the foreground on a click, but: (a) the screen under them shows only the wallpaper; (b) `PrintWindow(PW_RENDERFULLCONTENT)` of ALPHA returns a fully transparent bitmap; (c) real mouse moves (no `:hover`), real clicks and a real Down key reach no DOM event on the page (capture listeners on `window` stay empty; a synthetic dispatch works, so the listeners are fine); (d) `WindowFromPoint` returns the region, so the invisible rectangle also swallows clicks meant for the desktop below. Retried with `--disable-features=CalculateNativeWinOcclusion`: still blank, so it is not Chromium's occlusion tracking. Attached mode on the same machine paints and takes input. The 2026-10-04 and 2026-10-01 fallback gates ran headless and never saw a pixel. Status: open, for Ender. Fallback is the safety net when the desktop layer cannot attach, so this matters when it matters.

### Minor

- **m-1. A drop can hang until the pointer moves.** 1 of 7 real drops: the button was released (`GetAsyncKeyState` up), but no `drop` arrived; the drag image window (`SysDragImage`, my process) stayed, the page stayed in `tile-drop-preview`, the file stayed on the Desktop for about 40 s, until the pointer moved a few pixels; then `drop-files moved 1` and the tile landed **last** instead of at the previewed slot. The other 6 completed within 1.5 s. Not reproduced on demand. For Ender (the first drop 15 s after a launch; the region page had `ql-paused` at the time, the same state as in two good drops).
- **m-2. Two quick clicks on a broken tile open two stacked boxes.** The box is not modal to the region. The first click on a moved tile with a missing file only shows the banner `COULD NOT LAUNCH "..." - TARGET MISSING` and flags the tile; the second click opens the box.
- **m-3. A returned shortcut lands in a different Desktop slot.** With auto-arrange on, moving a shortcut in and out re-flows the whole icon grid: my icon came back in the 2nd slot after the Recycle Bin instead of the last slot, and every icon after it shifted by one. Expected from the OS, but Sergei will see his icons move when he moves real shortcuts. For Judy and Sergei.
- **m-4. Theme art under the new UI, again.** In `cyberpunk` the Manager header text (`NIGHT CITY ... CORPO PLAZA // JACK...`) runs under the REGIONS / SETTINGS tab buttons (`shots\manager-regions.png`), and `// EDIT MODE` overlaps `PROTOCOL ACTIVE` in the region edit bar (`shots\after-drop1.png` area). Same family as M2b m-8 and M3 m-8.

### Observations (no action asked)

- **O-1.** After a hotkey hide and show with the picker list open, focus stays on the page body, not the search field.
- **O-2.** The tile-copy tooltip window lingering after a drop is a Chromium tooltip (`F2`), not a leaked ghost.
- **O-3.** A force-killed foreground window above a fallback region handed the foreground to the region (1 of 1). Graceful close and minimise did not.
- **O-4.** The "Add Application" dialog's start folder is the last folder remembered for the exe name `QuickLauncher.exe`, which my test build shares with Sergei's installed one. My typed-path pick did not change that MRU entry (read before and after).
- **O-5.** The updater logs `Cannot download "http://127.0.0.1/....blockmap"` (port dropped from the URL) and falls back to a full download. Harmless here; worth a look if differential updates are ever wanted.

## 10. My own slips and limits (honest list)

1. **A real click launched a `.url`** (section 1). Cause: a blind coordinate. Rule I now follow: tile positions only from DOM geometry; a throwaway `.url` should never be a tile in a profile I click in.
2. **The display revert** (section 1). Cause: I treated "revert to the registry mode" as a no-op without checking that the live mode is in the registry. The relay's own warning ("results may not behave normally with the monitor off") applied, and I should have stopped at the first scale restore.
3. **Win+D restore failed once** (the Manager window opened between the two presses). I restored by handle and compared rects. Afterwards I used my own bookkeeping, not the toggle.
4. At 04:31:48 I clicked at coordinates left over from the earlier run (a blind click at (5396,405), which landed in BRAVO's empty "drop shortcuts here" area); it did nothing visible. This was the same kind of mistake as the `.url` launch, with a harmless result.
5. The cover window for Option A came up scaled (WinForms is not DPI aware), so the first try covered BRAVO, not ALPHA. Repeated correctly.
6. `rin2.exe` printed a guard `REFUSED` that I hid with `| head -0` in three of my scripts. It never hid anything that mattered (I re-ran with output visible each time) but I should not do it.
7. Coverage limits: the monitor was off, so every pixel I saw is from the screen capture; "by eye" items were looked at in those captures. The throwaway icons were found by eye, then verified by `WindowFromPoint`. No browser was used except the accidental launch; no audio; no signed-in app was driven.

## 11. Pattern alerts

Pattern alerts: 3

1. **Display-level checks need a maintained, guarded display script.** Same shape as the earlier "every QA pass rebuilds its harness" alert: I wrote `disp.exe` and `rin2.exe` by hand again, and the first failure of the harness cost a display. Proposed disposition: **fix**, studio level (Ender; Jane confirms): one maintained `scripts/qa/` real-input helper (the guards above, the own-tray-icon click by PID, the desktop-icon rectangle guard) and one display helper that (a) first saves the full `QueryDisplayConfig` and the live `DEVMODE`, (b) never calls the registry-mode reset, (c) restores from the saved config and refuses to continue after a failed restore. Until then: do not run display-level checks with the monitor off.
2. **Win+D, the Manager window and the Chrome window are shared state.** Every away-window run that exposes the desktop changes Sergei's window state and can leave it changed; the restore must be by recorded handle and rect. Proposed: **accept** with a standing note in the away-window brief ("record the z-order and iconic state first; restore by handle; never leave a tile of a `.url` where a click can reach it").
3. **Theme art under new UI (m-4)** has now appeared in M2b, M3 and here (cyberpunk). Proposed: **fix**, as M3 pattern alert 2 already said (Judy rules which layer wins; Futaba adds the header-pseudo-element measure to the gallery). Or Sergei accepts it explicitly.

## 12. Census, cleanup, safety

| Time | `QuickLauncher.exe` | `electron.exe` |
|---|---|---|
| 00:08 (before) | Sergei's 4: 30760, 23324, 31752, 41564 | about 40 (not mine: other sessions) |
| 04:11:50 | the same 4 | 0 |
| 04:53:28 (after) | **the same 4, identical** | n/a |

- Sergei's four processes were never touched, clicked, focused or killed. His tray icon was never clicked: my tray clicks used `Shell_NotifyIconGetRect` for my own PID. The pinned taskbar button was never used.
- My processes: every launch ended by `exited` (tray Quit, 4 runs) or by the guard's timeout; `0 left` each time. My stub installer, update feed (killed by PID 69508), cover windows (by PID) are gone. `tasklist` shows 0 of mine at 04:53.
- Left in the scratchpad (recursive deletes are denied): `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ab778959-0638-4d60-8887-346c422e496e\scratchpad\futaba-away2\` (645 MB): `m3src`, `themessrc`, `out\m3`, `out\themes`, `tools\` (`rin2.cs`, `disp.cs`, `updsrv.mjs`, scripts), `shots\` (78 images), `proof\` (listings and display read-backs), `notes.md`, `guard-*.log`; and `%TEMP%\ql-away2\` (profiles `th1..th4`, `reg1`, `reg2`, `fb1`, `fb2`, `disp1`, `fakedesk`, `lnktest`).
- Real repos: no file written in `WIP/QuickLaunch` or the regions worktree except this report (uncommitted). No git write.
- Display, taskbar, registry: section 1 and 7. Nothing else outside my own scratch and temp changed.

## 13. Still pending

1. **Restore the display** (section 1), then the Chrome tab and the 8 windows (sections 1 and 8). After the display returns: re-check that the regions come back to their saved places on a real resolution change (home-layout rule), with the monitor on, and with the Samsung's saved config recorded first.
2. Regions: real Menu key and the follow-up `contextmenu` count; the FULL look mid-drag; fallback after F-2 is fixed (real click, first click not swallowed, typed letter, Ctrl+Right, F6, Win+D, click-to-raise).
3. Real fullscreen after F-1 is fixed (F11, Esc, Esc, saved bounds).
4. Public Desktop drag ("Needs administrator rights.") and the real uninstaller with `--ql-restore-all` (Sully, packaged build).
5. Themes: Alt+Tab, Esc ladder with edit mode, real save count, real icons on shaped plates.
6. Taskbar moved to another edge: not possible on Windows 11; auto-hide stands in. Sleep and resume: never.
