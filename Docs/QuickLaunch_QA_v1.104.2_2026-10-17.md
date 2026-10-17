# QuickLauncher v1.104.2 QA report (lean release pass), 2026-10-17

Author: Futaba (QA). Build under test: `WIP/QuickLaunch`, branch `codex/axis-resize`, HEAD `a7d1cec`, version 1.104.2, built by me non-publishing into `dist/` (the package.json `build` field via `npx electron-builder --win --publish never`; `npm run build` and `npm run release` were never run). Tested from the committed tree: `git status --short` showed only untracked Docs files (`QuickLaunch_DependencyUpdate_2026-10-12.md`, and later a `QuickLaunch_CodeReview_v1.104.2_2026-10-17.md` that is not mine), no modified tracked file.

**Verdict:** GO

What GO covers: Phase A (build and package checks) and every Phase B check in the brief, run in Sergei's away window on an isolated instance. What it does not cover: install, update and uninstall (see Limits). One Minor finding is open (F-1, a one-frame flash); it does not break the core flow.

Pattern alerts: none. Product Blockers: none. Majors: none. Minors: 1 (F-1).

## Changes under test (since v1.104.1)

`88ac906` Ctrl+Space return trip (`desktop-layer.js` restores the style without `WS_VISIBLE`), `2c12688` English locales only, `ee4b037` unused js-yaml files excluded, `d6c5add` js-yaml 4.3.2 and the release-script draft flow (not testable without publishing; skipped as briefed).

## Phase A: build and package (PASS)

- `npm run check:contrast`: 101 themes, 0 errors. `npm run check:hover`: v1.104.2 at `a7d1cec`, Electron 44.7.2, 3,838 pairs measured, 0 errors; positive controls PC1 to PC4 all fired; stubs intact 92/92; show/focus/hotkey/dialog counters 0; sockets 0; registry unchanged; 133 processes started, 0 left.
- `electron-builder --win --publish never`: exit 0. Output: `dist/QuickLauncher Setup 1.104.2.exe` (114,275,942 bytes), `dist/win-unpacked/`.
- Versions: installer and `win-unpacked/QuickLauncher.exe` both report 1.104.2 (FileVersion/ProductName QuickLauncher); asar `package.json` says 1.104.2; builder log and `node_modules/electron` say Electron 44.7.2. The installer's inner `QuickLauncher.exe` has the same SHA-256 as the `win-unpacked` one (`600ca093...4c38`).
- `locales/`: exactly `en-GB.pak` and `en-US.pak`, in `win-unpacked` and in the installer payload.
- js-yaml: 4.3.2 in the asar, 33 entries, 0 `.map`, 0 `bin` entries, no `index_vite_proxy.tmp.mjs`. (The 47 `.map` files in the asar all belong to `electron-updater` and `builder-util-runtime`.)

## Phase B: real-input checks (PASS, one Minor)

Setup: my own isolated instance of `dist/win-unpacked/QuickLauncher.exe` (main pid 47636) with `--user-data-dir=<scratchpad>\qa-1.104.2 --ql-no-update-check`, seeded with `startWithWindows:false`, `globalHotkey:"Ctrl+Alt+Space"`, `reducedMotion:true` (to keep pixel comparisons steady), and three regions on the free right strip of the single 7680x2160 (1.5 scale) desktop: QA Grid (6 tiles), QA Column (3), QA Row (3). The log showed no hotkey registration failure before the first key. Ctrl+Space was never pressed. Real keys and clicks went in through SendInput, and every click was refused in code unless the window under the cursor belonged to a `QuickLauncher.exe` under `dist/win-unpacked`, except my own tray chevron and tray icon.

1. **Return leaves the regions visible, not blank: PASS.** 4 full cycles (press out, press back) plus 2 more with the hidden test, 3 regions each. After every return: all 3 region hosts (and their render and D3D child windows) are children of `Progman`, visible, `WS_VISIBLE` set. A screen capture of the region strip after each return matches the baseline taken before the first press: mean absolute difference 0.085 to 0.161 on a 0 to 255 scale (the residue is a live CPU readout drawn over the desktop by something else), contrast 62.5 against 62.57 at baseline. I also looked at the baseline and mid-return captures: panels, tiles and labels all present. On each outbound press the three hosts become visible top-level windows at the same position (foreground mode), as designed.
2. **A region hidden before the press stays hidden: PASS.** "Hide all regions" from the region menu hid all 3. Press out: all 3 shown on top. Press back: all 3 hidden again. Repeated once more with the same result. A second launch of the exe (second-instance, which shows every region) then brought them all back visible.
3. **After the return, interaction works: PASS.** Hit tests over a 28-point grid of the strip returned the same windows after every return as at baseline (the panels are my windows; points outside the panels reach `SysListView32`, the desktop icon list, so the desktop icons are still reachable). Hovering the GRID1 tile changed the tile pixels (difference 12.7 against 0 while idle). A right-click on the Grid entered edit mode (EDIT MODE bar, + FILE, + INSTALLED, DONE). I did not click any real desktop icon.
4. **Add file opens in Downloads, Cancel works: PASS.** + FILE opened the "Add Application" dialog (class `#32770`, my pid) showing the breadcrumb `Downloads` and the filter "Applications & Shortcuts"; Cancel closed it (no visible top-level window of mine left).
5. **Manager (X) as before: PASS.** Region "..." menu then Settings... opened the Manager (840 x 840, shows `VERSION v1.104.2`, hotkey field `Ctrl+Alt+Space`, Start with Windows unchecked). Its (X) closed the window; the process stayed alive in the tray and all 3 regions stayed visible.
6. **Tray Quit exits every process: PASS.** I right-clicked my own tray icon in the overflow flyout (the foreground window became my pid, tray menu: Show / Hide, Regions..., New region, Settings..., Start with Windows, Random theme on startup, Check for Updates, Quit QuickLauncher) and clicked Quit. Log: `{"event":"quit","reason":"tray","released":3}`; 0 `QuickLauncher.exe` processes and 0 windows of mine 3.5 s later.

### F-1 (Minor, open): the Grid region blinks for one frame on every Ctrl+Alt+Space press

- Repro: have 3 regions, capture the region strip every ~8 ms, press the hotkey (either direction).
- Observed: in every press I sampled, exactly one captured frame (the first one, 7 to 29 ms after the key) shows the QA Grid area replaced by the plain desktop (difference 22.1 against baseline, contrast 49.9 against 62.5); the Column and Row are unaffected; the next frame, about 8 ms later, is normal again. Seen on all 4 returns of the main run, and on 1 outbound and 1 return press of a dedicated capture run. I saved the odd frames and looked at one: Grid gone, Column intact.
- Impact: roughly one display refresh of flicker on the first region on each press; nothing stays blank. No effect on the core flow.
- Not established: whether this predates `88ac906`. I had no 1.104.1 build to compare against and did not check older builds. It looks code-shaped (the hide/re-parent/show sequence), so it goes to Ender if Sergei notices it. Disposition for Jane: defer unless Sergei sees it.

## Sergei's profile and Run keys, before and after

Snapshot (stat only, size and mtime) of `%APPDATA%\QuickLauncher` and `C:\Users\AnGeLZzZ\QuickLauncher Shortcuts`, 99 files, taken before launching and again after Quit: **0 changed, 0 added, 0 removed**. `HKCU\...\Run` and `...\Explorer\StartupApproved\Run` QuickLauncher values identical before and after (Run points to `C:\Users\AnGeLZzZ\AppData\Local\Programs\QuickLauncher\QuickLauncher.exe`). Sergei's installed instance was not running at any point (0 processes outside `dist/` before and after), so there was no tray icon of his to avoid and no PID list to compare. My instance wrote only under its own `--user-data-dir`.

## Limits

- Install, update and uninstall were not tested (lean pass). The packaged installer was not run; the packaged `win-unpacked` build was.
- The regions were placed in a free part of the desktop. A region sitting under an app window (the "visible behind windows" case) was not tested directly; I verified that the regions are desktop children, visible, and render identically to baseline on the bare desktop.
- One monitor, one DPI (150 percent). No second monitor, no scale change, no Explorer restart.
- I did not click real desktop icons or launch any tile (tile paths were Notepad and never clicked).
- The flash was measured with a screen capture at about 8 ms intervals, not with a frame-accurate capture, so its exact duration is not established.
- My shell had `ELECTRON_RUN_AS_NODE` set, which makes the packaged exe fail with "bad option"; I removed it from the spawn environment. That is my environment, not a product bug.
- The temporary screenshots include parts of Sergei's desktop and a Chrome window; they were deleted after this report.
