# QuickLaunch Regions - desktop-layer spike (2026-09-30)

**Question:** can an Electron window in QuickLaunch's stack live on the desktop layer on Windows 11 build 26300?
**Answer so far:** yes, for everything I could measure without touching Sergei's session. Win+D, a real Explorer restart, real typing and the look on the real wallpaper are still his to confirm (try-it below).

**Where:** worktree `C:\Antigravity Projects\QuickLaunch-regions-spike`, branch `wip/regions-spike` (cut from `main` 3312d4b). Uncommitted. Code in `spike/desktop-layer/`. `package.json` and the lockfile add `koffi ^3.3.2`. No version bump.

## Approach
- **koffi 3.3.2** (prebuilt FFI, no compile step), called from the Electron 32.3.3 main process.
- **No 0x052C message.** Regions sit in front of the icons, so there is no need to split the desktop. The finder looks for whichever window holds `SHELLDLL_DefView` (the icon view). The panel becomes a `WS_CHILD` of that window, on top of its siblings. That puts it in front of the icons and under every normal window.
- **This build's layout is "raised" (24H2+):** Progman holds `SHELLDLL_DefView` and `WorkerW`. Two empty, hidden top-level WorkerWs also exist. The finder also handles "unsplit" and "classic-split" (Win10 / pre-24H2); synthetic-tree unit tests cover those, 7/7 pass. Any other layout counts as unknown: the spike falls back and never guesses.
- **Watchdog, polled every second.** It checks four things: the host is alive, the host is still our parent, DefView is still in the host (if Explorer moves it, we follow), and the panel is still above DefView (if not, we re-raise it). On a loss it hides the panel, finds the host again and re-attaches. If the window died along with its parent, it rebuilds the window. After 10 s with no desktop it falls back.
- **Fallback and kill switch (`--ql-no-desktop-layer`):** an ordinary top-level tool window, placed just above the desktop and never activated.

## Measured (self-test run 3, 16/16 PASS; `node spike/desktop-layer/test/run-selftest.mjs <outDir>`)
| Check | Result |
|---|---|
| SetParent to Progman; panel above DefView (index 0 vs 1); WS_CHILD; on screen at the requested rect | pass |
| Under a normal window: our test window at z 80, the panel's root (Progman) at z 504; a point on the overlap hits the test window | pass |
| OS hit test in the client area; a click reaches the DOM (posted to our own window, cursor never moved) | pass |
| Rounded corners see-through while parented across processes (proxy below): 4/4 corner pixels showed the parent's magenta; body pixel = panel colour | pass |
| Parent process killed (a stand-in for Explorer dying): our window died with it, was rebuilt and re-attached to the real desktop | ~1.9 s |
| Parent changed under us -> re-attached; in-process parent destroyed -> rebuilt | 0.12 s / 0.55 s |
| Unknown layout -> fallback just above the desktop (0 visible windows between) -> back on the desktop layer | 3.4 s / 0.5 s |
| Foreground never moved to us or to the desktop (runs 2-3); every process we started had exited | pass |

The look was measured on a proxy. Sergei's windows covered the whole screen, so the real wallpaper could not be sampled without reading his windows. Instead the panel was a child of our own magenta window from a separate process, shown on top without activation. That is the same code path the real desktop uses.

## What this means for the real build
1. **An Explorer restart kills our windows. It does not orphan them.** A child window dies when its cross-process parent dies. So the app has to rebuild the BrowserWindows, not just re-parent them. Region state must live in the main process.
2. **A click on a region activates the desktop**, exactly as a click on the desktop does. For a focusable window, Chromium also activates on mouse-down by itself.
3. **Keyboard: Windows does not give a desktop child keyboard focus.** The spike sets it on pointer-down, and only when the desktop is already the foreground window, so it cannot steal focus. In run 1, focus reached the panel and key messages typed into the box. Real keystrokes are unproven.
4. **Fallback show needs one `SetWindowPos(SWP_SHOWWINDOW)`.** A separate `ShowWindow` on a hidden top-level window lifts it to the top of the normal band (measured: z 502 -> 79, over Sergei's windows).
5. **While parented, Windows attaches our UI thread's input queue to Explorer's desktop thread.** If QuickLaunch's main thread hangs, desktop input can stall with it. Keep main-thread work short.
6. **Install notes.** npm 11 `allowScripts` blocked electron's postinstall in the worktree. I extracted the binary by hand from the cached zip (its sha256 matches `checksums.json`). koffi's install script was blocked too, but koffi does not need it: the binary comes from `@koromix/koffi-win32-x64`. A packaged build will need that package unpacked from asar.
7. **The display changed mid-session**, from 5120x1440 at 150% to 800x600 at 100% (maybe the monitor went to sleep). Every Electron run happened at 800x600 at 100%, so 150% was unverified with the panel attached. (The 2026-10-01 runs were at 150%: see Try-it.)

## Incident
Self-test run 1 posted a synthetic click to a focusable panel. Chromium activated it, and the foreground moved from Sergei's active window to the desktop. It stayed there until something re-activated his window. Since then the self-test uses a non-focusable panel and fails if the foreground moves to us or to the desktop. Runs 2 and 3 kept the same foreground window throughout.

## Unproven or not tested
- **Unproven, needs Sergei's try-it:** Win+D; a real Explorer restart; real typing; the look on the real wallpaper. (150% DPI with the panel attached was measured on 2026-10-01; see Try-it.)
- **Not in the spike:** sleep/resume, a resolution change while running, click-through corners for Fan/Ring, right-click menus, several regions, tray hide/show, and a packaged build under Bitdefender (koffi loaded fine in dev and I saw no block).

## Try-it (Sergei) - the run reports on itself (updated 2026-10-01)
Run this one line in any terminal (PowerShell, cmd or Git Bash), from any folder:
```
node "C:\Antigravity Projects\QuickLaunch-regions-spike\spike\desktop-layer\tryit.mjs"
```
A dark "Regions spike" panel appears at the right edge of the desktop, behind your windows. It shows four big numbered steps. Follow them; you don't need to watch anything:
1. Press Win+D. Wait 5 s.
2. Press Win+D. Wait 5 s.
3. Task Manager → Windows Explorer → Restart.
4. Wait 10 s, then click the × on the panel.

The terminal then prints PASS or FAIL for six checks. Nothing to report by hand. The 5 s waits give the once-a-second sampler time to see each Win+D. Optional, before step 4: click "Click me" and type in the box. Only counts are logged.

**Read the result afterwards (Jane / Futaba):**
```
node "C:\Antigravity Projects\QuickLaunch-regions-spike\spike\desktop-layer\read-run.mjs"
```
It recomputes the verdict from the raw samples of the latest run. Add `<log path> --timeline` for a specific run. It prints a raw state timeline whenever a check from 2 to 5 fails.

**What gets recorded**
- **Log:** `%TEMP%\ql-regions-spike\runs\run-<yyyymmdd-hhmmss>.jsonl`, one JSON line per event. Panel captures go in the folder of the same name. They are the panel's own pixels (`capturePage`), never the screen.
- **Lines:** launch (displays and scale); every attach attempt with parent HWND, class, Explorer PID and result; Explorer PID changes; losses, window rebuilds, time to recover, fallback in and out; click and keystroke counts (never keys or text); quit, shutdown, and the launcher's check that no process is left.
- **Once a second:** visible; parented; z-order against the icon view; a 3×3 hit test of what covers the panel; DPI and pixel size; app windows showing or minimised; the foreground window's class; the page's own visibility and paint ticks.
- **Last line:** `summary`, with PASS or FAIL for 1 launch, 2 under windows, 3 survives Win+D, 4 back after Win+D again, 5 recovers after Explorer restart, 6 clean exit.

**How Win+D is detected, without key hooks.** It is inferred from window state over 2 samples in a row. Any one of these counts: every app window minimised; the desktop in the foreground with no app window showing; a desktop window raised above the app windows (the Win7-10 way). This build's Win+D behaviour is unproven until Sergei's run. If the rule misses, every raw signal is in the log. A corrected rule in `run-summary.js` can then be applied to the same log with the reader, without repeating the run.

**Reading notes**
- A capture proves the page painted, not that it was on screen. `capturePage` draws even while the panel's parent is hidden (seen in a test run). "On screen" comes from the hit-test samples.
- Ctrl+C in the terminal also ends the run cleanly: the launcher asks the spike to quit, and force-kills only after 8 s. A forgotten run closes itself after 30 min; check 6 then fails with "time-limit".
- `npx electron spike/desktop-layer/main.js` still works and writes the same log. It skips the launcher's exit check; the reader runs that check instead.

**Tested by Ender, with simulated events only (no Win+D, no Explorer restart, no input)**
- Unit tests: 23 of 23 pass over simulated runs (`node --test spike/desktop-layer/test/`).
- Three live runs on the real desktop, with a non-focusable panel:
  - A simulated Show Desktop period gave PASS for checks 1-4 and 6. Check 5 failed, as expected with no real restart.
  - Killing a stand-in parent process (ours) rebuilt the window and re-attached it in 0.6 s; the recovery capture showed the panel.
- At 150% the panel is 600×660 px for 400×440 DIP (DPI 144, page DPR 1.5), and the text is sharp.
- A sample takes 4-6 ms on the main thread.
- The foreground never became ours or the desktop. Once, mid-run, it moved between two of Sergei's own windows (Claude to Chrome).
- Not tested live: click and key counting, which needs real input. The older self-test was not re-run, because it posts a synthetic click to our own window. My test logs are kept out of the runs folder, so "latest run" will be Sergei's.
