# QuickLaunch QA — F-1 fix review, 2026-10-05

**Verdict:** GO

QA of Ender's fix for F-1 (`Docs/QuickLaunch_QA_AwayWindow_2026-10-05.md` § F-1: F11 fullscreen could not be exited, and the display size got saved as `windowSize`). All of Ender's claims hold under red-team conditions, including two scenarios he didn't list (tray hide/show while fullscreen, and Quit mid-fullscreen without ever calling `exitFullscreen`). One Minor finding on claim precision. No Blocker, no Major.

Design/story flags: none (tooling project, no design/story surface).

---

## 0. Scope and pin

Repo `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch`, branch `wip/theme-fidelity`, HEAD `b4d878c`, fix uncommitted in the working tree. Tested a pinned snapshot, not the live tree.

**Pin method:** `git archive b4d878c` extracted to scratch, then the 6 changed files overlaid from the working tree on top. To run `npm run check` (its `check:hover` script shells to `git rev-parse HEAD` / `git status --porcelain` against its own directory), the snapshot was additionally turned into its own throwaway git repo: the 6 files were reverted to their HEAD blobs, the archive was committed as a baseline (commit `896d40a`, this snapshot's own hash — not `b4d878c`, that identity isn't preserved by `git archive`), then the fix was re-applied as uncommitted changes, reproducing the real repo's dirty state. `node_modules` was a byte copy (555 MB), no junction/symlink.

**Pinned file hashes (sha256, verified identical between the live working tree and the snapshot after every reset/reapply cycle):**

| File | sha256 |
|---|---|
| `src/main/fullscreen.js` (new) | `73156fb1c32149bf31a4ef19030e7b375567551d90852388cd1c2160f8aaab2d` |
| `src/main/ipc.js` | `7a375da4f8c0f2ad03dead97e6d9e15639802a768b519b34781bbb6c2378fcc6` |
| `src/main/window.js` | `5008cf1d4e80cadca46259749fca14512e6b4b73fa4ec9d7d469b4f170181bbc` |
| `test/fullscreen/fullscreen.test.js` (new) | `221347418923eee2ef37870ebed6a192a66cb69c592f020fb12de69755393620` |
| `test/fullscreen/window-save.test.js` (new) | `64469a34401f5e017ce4b7ee7522cf52893a0ee930422178b93de643b29050cf` |
| `test/fullscreen/fake-window.js` (new) | `59aa468856c658ef9968cb1ae95f16919821b50017a314a4669c6d10eb4149dc` |

**Diff shape** (measured by reading the full `git diff` for `ipc.js`/`window.js` and the full new `fullscreen.js`): the fix removes the two inlined, buggy `toggleFullscreen`/`exitFullscreen` closures from `ipc.js` and the `win.isFullScreen()` guards in `window.js`'s `moved`/`resize` handlers, and replaces both with calls into a new `fullscreen.js` module that tracks fullscreen state in a `WeakMap` keyed by window (since `win.isFullScreen()` is permanently `false` for this frameless transparent window on Windows — the root cause). No other function in either file is touched. Confirms claim 5 (no other behaviour changed) by inspection; the real-window tests below confirm it isn't changed in practice either.

**Census before:** 4× `QuickLauncher.exe` (`C:\Users\AnGeLZzZ\AppData\Local\Programs\QuickLauncher\`, Sergei's installed copy, PIDs 23324/30760/31752/41564) and a growing set of `QuickLauncher.exe` under `C:\Antigravity Projects\QuickLaunch-regions-spike\dist\win-unpacked\` (Ender's own self-test, out of scope, not touched). No `electron.exe` processes running. ~26 unrelated `node`/`node_repl` processes from other sessions.

**Census after:** identical QuickLauncher.exe set (4 installed + Ender's regions-spike processes, now 11 of them — his test, not mine, grew on its own during my pass), 0 `electron.exe` processes (all of mine exited via `app.exit(0)` at the end of each harness run). Real repo `git status --short` unchanged: still exactly the same 2 modified + 2 untracked paths as at the start. No real-input device was used at any point (no SendInput, no UI Automation, no Win+D); every key reached the window only via Electron's own `webContents.sendInputEvent`, and every resize/move used in the race test was a direct, in-process `win.setBounds()` call, not an OS-level drag.

---

## 1. `node --test test/` — claim: 13/13

**Measured:** ran `node --test test/` inside the pinned snapshot (fix applied, snapshot's own git repo in place). Output: `tests 13`, `pass 13`, `fail 0`. Confirmed as stated.

## 2. The 5 save-guard tests fail on HEAD's `window.js` — claim as stated does not hold cleanly

**Measured two ways:**

- **Literal reading of the claim** (HEAD's `window.js`, nothing else from the fix present): `window-save.test.js` does `require('../../src/main/fullscreen')`, which does not exist at HEAD. The file does not get as far as running any of its 6 `test()` calls — it throws `MODULE_NOT_FOUND` at require time. `node --test` reports this as **1 failing node** (the whole file), not 5 failing tests out of 6. Result: `tests 1`, `pass 0`, `fail 1`.
- **Charitable reading** (new `fullscreen.js` module present, but `window.js` reverted to HEAD's pre-fix version — i.e. only the `moved`/`resize` guard logic held back): `window-save.test.js` now runs all 6 of its tests; 5 fail and 1 passes (`outside fullscreen, a resize and a move are still saved` — the one case that doesn't touch fullscreen at all). This matches the claim exactly: `tests 6`, `pass 1`, `fail 5`.

**Minor finding (QA-F1-01, claim precision):** "the 5 save-guard tests fail on HEAD's window.js" is only true under a hybrid state (new `fullscreen.js` + old `window.js`) that isn't "HEAD" by any single commit — true HEAD has neither file in a state where the test suite can even load. Not a functional defect in the fix; the fix itself is fine either way. But a reviewer repeating the claim literally against `b4d878c` alone will see a crash, not "5 fail, 1 pass," and may wrongly read that as the test suite being broken rather than confirming the bug. Recommend Ender's test-file header comment state the precondition explicitly (needs `fullscreen.js` present) rather than say "HEAD's window.js" bare. Route: Ender (test-doc wording only, not a code fix).

## 3. `npm run check` — claim: exits 0

**Measured:** ran `npm run check` (`check:contrast` then `check:hover`) inside the pinned snapshot with the fix applied and the throwaway git repo in place (`check:hover` needs a real `.git` to compute its `live tree at <sha> + uncommitted changes` label — see § 0). Exit code `0`. `check:contrast`: "101 theme(s) checked, 0 errors, 32 legacy warning(s)" (all pre-existing warnings, unrelated to this diff — the fix touches no theme/CSS file). `check:hover`: "101 theme(s), 4040 pair(s) measured, 0 errors, 0 grandfathered"; its own isolation line reports "processes 36 started, 0 left, exit 0" and "sockets 0," i.e. the check script's own harness is clean. Confirmed as stated.

## 4. Real (non-headless) window, keys via `sendInputEvent`: Settings, F11, Esc, Esc, F11×2, button×2

Ran Ender's harness (`.../scratchpad/f1/harness.js`, reused as-is after reading it) against the pinned snapshot, Electron 32.3.3, with `--user-data-dir` pointed at an isolated scratch profile and `ELECTRON_RUN_AS_NODE` unset for the run (it was set in my shell environment and silently makes `electron.exe` behave as plain Node — `require('electron')` returns no `BrowserWindow`; worth flagging generally, not specific to this fix, since anyone QA-ing from a shell with that var inherited will get a confusing crash, not a useful test result).

The harness already matches the hard limits: `showInactive()` override, `setFocusable(false)`, `setSkipTaskbar(true)`, `setIgnoreMouseEvents(true)`, `setOpacity(0)`, no tray/updater/global-hotkey handlers wired. All keys went in via `webContents.sendInputEvent`, never real OS input.

**Measured sequence** (window start bounds `{x:4676,y:1072,w:424,h:300}`):

| Step | Bounds | `isFullScreen()` native | Button title | Settings open |
|---|---|---|---|---|
| start | 424×300 | false | Fullscreen | false |
| Settings opened | 424×300 | false | Fullscreen | true |
| F11 | 5120×1440 (display) | false | Exit fullscreen | true |
| Esc #1 | 5120×1440 | false | Exit fullscreen | **false** (closed Settings, stayed fullscreen) |
| Esc #2 | 424×300 | false | Fullscreen | false |
| F11 (enter) | 5120×1440 | false | Exit fullscreen | false |
| F11 (exit) | 424×300 | false | Fullscreen | false |
| button (enter) | 5120×1440 | false | Exit fullscreen | false |
| button (exit) | 424×300 | false | Fullscreen | false |

`saved` (the data file's `windowSize`/`windowPosition`) stayed `"none"` the entire run — nothing had triggered a legitimate save in this exact sequence, so this run alone doesn't prove the file never gets the fullscreen size; it only proves there's no file to corrupt yet. See § 5 for the test that forces a save race and inspects the written file.

Every exit returns to the exact prior bounds (`424×300` at the original position), every entry takes the full display, and the Esc ladder (first Esc closes Settings while staying fullscreen, second Esc leaves fullscreen) behaves identically to how it behaved before the fix per the original F-1 repro — confirms claim 5 (no other behaviour changed) for this interaction path specifically.

**Observation (not a fix defect):** `win.on('focus', ...)` fired once near the start of the run despite `setFocusable(false)` and the `showInactive` override. `focused?` and `focused at end?` both read `false`. Not reproduced as a problem (nothing downstream reacted to it, no activation occurred), and the diff under test doesn't touch window activation. Noting it because it's new information from running Ender's own harness, not something carried over from his report.

## 5. Real-window save race — extends claim 4/claim-that-the-file-never-gets-the-fullscreen-size

Built an additional harness (adapted from Ender's, same isolation posture) that forces the exact race the unit test "a resize just before F11 does not save the fullscreen size when its timer fires" covers, but against the **real** window/timers, not the mocked `FakeWindow`:

1. Real window, start bounds `424×300` (position `4676,1072`).
2. `win.setBounds()` (in-process, not OS drag) to `464×320` — starts the real 400 ms debounce.
3. Wait 100 ms (inside the debounce window), then F11 via `sendInputEvent`.
4. Wait 900 ms (past the debounce) — **data file: `null`** (never created). Window bounds: `5120×1440`.
5. Wait another 200 ms, still fullscreen — **data file: still `null`**.
6. F11 again (exit) — bounds back to `464×320`. **data file: still `null`.**
7. Explicit `store.flush()` — **data file: still `null`.**

The debounced save that the pre-fullscreen resize armed never landed while fullscreen was active, and never landed the fullscreen size at any point — matching the unit test's guarantee on a real `BrowserWindow`, not just the fake one.

## 6. Tray hide/show while fullscreen, and Quit mid-fullscreen (not in Ender's claim list — added per brief item "hide/show from the tray path")

`tray.js`'s hide/show item and double-click both call `win.hide()` / `win.show()` directly (no separate code path from the `hide-window`/`show-window` IPC handlers), so the test called them the same way:

1. Legit resize outside fullscreen (`500×340`), waited past debounce — **saved correctly** (`windowSize: {500,340}`).
2. F11 (enter) — bounds `5120×1440`.
3. `win.hide()` — window hidden, bounds unchanged (still `5120×1440`, no spurious resize/move event from hiding).
4. `win.show()` (via the overridden `showInactive`) — window visible again, bounds still `5120×1440`. Data file unchanged (`500×340`).
5. **Quit without ever leaving fullscreen** — `store.flush()` then `app.exit(0)`, mirroring `tray.js`'s "Quit QuickLauncher" item exactly (it also skips any fullscreen-exit call). Final data file: still `windowSize: {500,340}` — **not** the display size. Final bounds at the moment of exit: `5120×1440` (fullscreen, never cleaned up — expected, the process is gone).
6. **Relaunch** with the same profile: new window creation reads `windowSize: {500,340}` from disk, opens at that size, `win.isFullScreen()` is `false`, the tracked `isFullscreen(win)` is `false`. No crash, no residual fullscreen state, no lingering handler from the previous process (new `WeakMap`, new window object).

This is the worst case the original bug report didn't reach (F-1's repro always exited through Esc/F11/button first) and it holds: a user who alt-F4's or tray-Quits a QuickLaunch window that's stuck in fullscreen does not get a screen-sized window on next launch.

## 7. Fullscreen across monitor bounds — NOT RUN, environment limitation

`[System.Windows.Forms.Screen]::AllScreens` on this machine reports exactly one display (`\\.\DISPLAY1`, 5120×1440). There is no second monitor to move the window onto, and the hard limits forbid touching display settings or calling any `ChangeDisplaySettings*` to simulate one. Not attempted. Needs a machine with a second physical monitor, or an away-window session where that's acceptable to arrange; flag for the next away window alongside the already-deferred item 13.3 (real-key F11 on the packaged build).

## 8. Regression smoke — open, filter, launch-free navigation, close via tray Quit

Isolated instance, own profile, non-activating:

- Load: `document.title` = `QuickLauncher`, no crash.
- Type-to-filter: typed `N`,`O`,`T`,`E` via `sendInputEvent` → filter chip became visible with text `NOTE`.
- Esc (not in fullscreen): filter chip cleared (`hidden` class restored) — confirms the Esc ladder still prioritizes clearing an active filter over anything else when fullscreen isn't active, same as pre-fix.
- Arrow-key navigation (Right/Left/Down/Up): no crash, no launch attempted (no real app list loaded in this harness, but no error either), bounds unchanged.
- Fullscreen button title after all of the above: `Fullscreen` (not stuck on "Exit fullscreen" from a prior state — nothing leaked across to the regression pass).
- `webContents.isCrashed()`: `false`.
- Closed via the tray-Quit path (`store.flush()` then `app.exit(0)`): clean exit, no hang.

No regression found in this slice.

---

## Findings summary

| ID | Severity | Summary | Route |
|---|---|---|---|
| QA-F1-01 | Minor | "5 save-guard tests fail on HEAD's window.js" is only true in a hybrid state (new `fullscreen.js` + old `window.js`); true `b4d878c` alone crashes the whole test file at require-time instead. Test-doc wording only. | Ender |

Severity per `Team/Docs/ProcessRules.md § Severity Definitions` (Studio Illuminati root) — cited, not restated.

No Blocker. No Major.

## Claims checked against measurement

| Claim | Status |
|---|---|
| `node --test test/` 13/13 | **Confirmed** — measured 13/13 |
| 5 save-guard tests fail on HEAD's `window.js` | **Partially confirmed** — true under the hybrid precondition in § 2; literal HEAD alone crashes the file instead (QA-F1-01, Minor) |
| `npm run check` exits 0 | **Confirmed** — exit 0, 0 contrast errors, 0 hover errors |
| Real-window F11/Esc/button sequence enters/exits correctly, data file never gets the fullscreen size | **Confirmed**, and extended: the specific save-race from the unit tests was additionally reproduced on a real (non-mocked) window/timer (§ 5) with the same result |
| No other behaviour or visual changed | **Confirmed by diff inspection** (§ 0) and by the Esc-ladder/filter/navigation behaviour observed unchanged in §§ 4, 8 |

## Additional coverage beyond Ender's claim list (per brief)

- Tray hide/show while fullscreen: clean, no spurious saves (§ 6).
- Quit mid-fullscreen (never calls `exitFullscreen`) + relaunch with the same profile: data file holds the last legitimate size, not the display size; relaunch is clean (§ 6).
- Fullscreen across monitor bounds: **NOT RUN**, single-display machine, cannot do without touching display settings (§ 7) — defer to next away window alongside item 13.3 (real-key F11 on the packaged build, also NOT RUN per the brief).
- Regression smoke (open/filter/launch-free nav/tray-Quit): clean (§ 8).

Pattern alerts: none
