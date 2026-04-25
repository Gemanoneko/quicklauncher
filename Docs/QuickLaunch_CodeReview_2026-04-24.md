# QuickLaunch — Code Review (2026-04-24)

**Reviewer:** Senua (Code Reviewer)
**Version reviewed:** 1.93.0 (HEAD: `a6d1333`)
**Prior review:** None (first review)
**Verdict:** RELEASE CLEAR

## Working-tree note
At the time of review, the working tree had uncommitted changes:
- `M package.json` (modified)
- `?? Docs/`
- `?? scripts/clean-dist.js`

Per the brief, the `clean-dist` work is already in flight with Ender. This review treats HEAD (`a6d1333`) as the source of truth and comments on the uncommitted `scripts/clean-dist.js` only where it overlaps with the Build Hygiene focus area.

## Summary
QuickLaunch is in notably good shape for a first review: Electron security defaults are correct (context isolation on, sandbox on, nodeIntegration off, explicit IPC allowlist, CSP in place), launching is guarded by a stored-path allowlist, and persisted settings go through strict type/range validators. The standout risk areas are the global `Escape` shortcut (leaks on quit and blocks Escape globally), the lack of atomic writes on the JSON store, and a small handful of design gaps around the `randomTheme` fallback and startup auto-launch coupling. No Critical findings — release is not blocked.

## Critical Findings
None.

## Major Findings

### M1. `globalShortcut` leaks on quit; blocks Escape app-wide while fullscreen
**File:** `src/main/ipc.js` (lines 566–588)
**Issue:** `globalShortcut.register('Escape', exitFullscreen)` is registered when entering fullscreen. A `globalShortcut` on `Escape` steals Escape from **every other application on the system** while fullscreen is active — this is a heavy, surprising side effect. Additionally, there is no `app.on('will-quit', () => globalShortcut.unregisterAll())` anywhere. If the app quits (via tray "Quit") while in fullscreen, the registration is cleaned up by Electron at process exit, but the pattern is fragile and already flagged by the Electron docs as the canonical way to leak hotkeys across restarts on some Windows edge cases.
**Why it matters:** (a) User hits Escape in Notepad while QuickLauncher happens to be fullscreen and Escape gets swallowed; (b) any future code path that skips `exitFullscreen()` (e.g. the window being destroyed, or entering fullscreen and the window then being hidden via tray) leaves the hotkey live.
**Suggested fix:** Replace `globalShortcut` with a **renderer-side** `keydown` listener for Escape inside `src/renderer/app.js`, invoked via IPC (`toggle-fullscreen`). That keeps Escape scoped to QuickLauncher's own window. If `globalShortcut` truly must stay, add `app.on('will-quit', () => globalShortcut.unregisterAll())` in `src/main/index.js` and also unregister in the `BrowserWindow`'s `'closed'` / `'hide'` handlers as belt-and-braces.

### M2. Store writes are not atomic — power loss during a write can corrupt `quicklauncher-data.json`
**File:** `src/main/store.js` (lines 44–54)
**Issue:** `_save()` calls `fs.writeFile(this.dataPath, ...)` directly. If the process is killed or the machine loses power mid-write, the file can end up truncated or half-written. On next boot, `_load()` will throw in `JSON.parse`, silently fall through to defaults, and **all user data (apps list, window position, theme preference, startup pref) is lost**. For a tray-resident tool that runs for weeks at a time, this is a realistic failure mode.
**Why it matters:** Data loss for the user's curated shortcut grid.
**Suggested fix:** Write to a sibling temp file and rename:
```js
const tmp = this.dataPath + '.tmp';
fs.writeFile(tmp, json, 'utf8', (err) => {
  if (err) { this.emit('save-error', err); return; }
  fs.rename(tmp, this.dataPath, (err2) => {
    if (err2) this.emit('save-error', err2);
  });
});
```
Also consider `fs.readFileSync` in `_load()` catching a `SyntaxError` separately and keeping a `.bak` of the last known-good file so a corrupt write can be recovered rather than silently reset.

### M3. `randomTheme` fallback can write an invalid `settings.theme` if the pool is empty under odd conditions
**File:** `src/main/index.js` (lines 21–27)
**Issue:** `const pool = others.length ? others : themes;` — if the directory `src/renderer/styles/themes` is empty (shouldn't happen in a packaged build, but possible in dev), `themes` is also empty, `Math.random() * 0 === 0`, `pool[0]` is `undefined`, and `settings.theme` gets written as `undefined`. On next boot `save-settings`'s validator (`VALID_THEMES.has(settings.theme)`) rejects it and `applySettings()` in the renderer falls back to `'cyberpunk'` — but the underlying stored value remains `undefined` until the user changes it. Minor, but it's a code-smell: the "safe" branch produces an unsafe result.
**Why it matters:** Robustness. The hand-off between "select random" and "validate settings.theme" assumes a non-empty theme set without asserting it.
**Suggested fix:** Guard at the top:
```js
if (s.randomTheme !== false && VALID_THEMES.size > 0) { ... }
```
and optionally validate the **current** `s.theme` before reusing it — right now an already-corrupt `settings.theme` is used in the `filter()` expression but that's harmless since `.filter(t => t !== undefined)` just returns the full list.

### M4. Auto-launch path can get stuck on a moved/old install location
**File:** `src/main/index.js` (lines 42–48) and `src/main/ipc.js` (lines 551–557)
**Issue:** `app.setLoginItemSettings({ openAtLogin: true, path: app.getPath('exe') })` is called on every packaged startup. `setLoginItemSettings` writes an entry to `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` pointing at the **current** exe path. This is correct for fresh installs but has a subtle interaction with the NSIS config:
- `perMachine: false` + `allowToChangeInstallationDirectory: false` means installs go to `%LOCALAPPDATA%\Programs\quicklauncher`, which is stable.
- However, if the user ever **moves** the install folder (unlikely) or the app is run from a different location once (e.g. unpacked copy for testing), the Run entry is overwritten to that location. There is no safeguard to prefer the installed path.
A more realistic case: if `startWithWindows` is `false` in settings but the user runs the app from a portable copy, the current code calls `setLoginItemSettings({ openAtLogin: false, path: <portable exe> })` which clears the Run entry entirely — probably what Sergei wants, but worth confirming.
**Why it matters:** Auto-launch is a feature users rarely re-check. A wrong path registered once silently breaks auto-launch until manually toggled.
**Suggested fix:** At minimum, only call `setLoginItemSettings` when the user's setting actually **changes** from the currently-registered state (read `getLoginItemSettings()` first and compare `openAtLogin` and `path`). Don't re-register every launch.

### M5. `second-instance` handler doesn't restore a minimized or hidden window reliably
**File:** `src/main/index.js` (lines 51–55)
**Issue:** `mainWindow.show()` alone is not enough if the existing window is minimized or on a different virtual desktop. The standard Electron pattern is:
```js
if (mainWindow.isMinimized()) mainWindow.restore();
mainWindow.show();
mainWindow.focus();
```
Currently, launching QuickLauncher again while it's minimized does not bring it to the foreground.
**Why it matters:** Core UX expectation for "single instance" apps.
**Suggested fix:** Add `isMinimized()`/`restore()` and `focus()` calls.

## Minor Findings

### m1. `'dragleave'` can drop the drag-over class prematurely
**File:** `src/renderer/app.js` (lines 1055–1059)
**Issue:** The check `!e.relatedTarget || e.relatedTarget === document.documentElement` is a common heuristic but fires a false negative when the cursor passes over a child element. In practice this flickers the `drag-over` class during drag inside the window. Low-impact.
**Suggested fix:** Use a drag-enter counter pattern (increment on `dragenter`, decrement on `dragleave`, remove class when count hits 0).

### m2. `scripts/cleanup-releases.js` sends `Content-Length: 0` on DELETE with no body, but only when `body` is truthy
**File:** `scripts/cleanup-releases.js` (line 30)
**Issue:** `if (body) opts.headers['Content-Length'] = 0;` is dead — `body` is never passed in the current call sites (`GET` and two `DELETE` calls have no body). This is harmless but confusing; strip it.

### m3. Hard-coded `OWNER`/`REPO` in `cleanup-releases.js`
**File:** `scripts/cleanup-releases.js` (lines 8–9)
**Issue:** If the repo is ever renamed or forked, Sully has to edit two places (here and `build.publish` in `package.json`). Consider reading from `package.json`'s `build.publish` block.

### m4. `iconHelperLoadSnippet()` can be called before the DLL has compiled
**File:** `src/main/ipc.js` (lines 131–163)
**Issue:** `compileIconHelperDll()` is fired on `setupIPC()` but `iconHelperLoadSnippet()` uses `_iconHelperDll` if set or the inline `Add-Type` fallback otherwise. If `get-installed-apps` is invoked within ~1s of app start (unlikely but possible), it may take the inline path the first time and the DLL path on subsequent runs. This is intentional per the comment, but it means the AV-safe path isn't guaranteed on first use. Not worth fixing — noting for completeness.

### m5. `suppressNextClick` uses a 50 ms arbitrary timer
**File:** `src/renderer/app.js` (lines 1177–1178)
**Issue:** The 50 ms window is a magic number. On slow machines the synthetic click could fire after the timer resets. Safer: set the flag, clear it on the next `click` event (whether it fires or not, via a one-shot listener with `{ once: true, capture: true }`).

### m6. `renderGrid()` uses `innerHTML = ''` then repopulates on every change
**File:** `src/renderer/app.js` (line 850)
**Issue:** Reasonable for small lists. For a personal launcher with <50 tiles this is fine; mentioning only because every drag-reorder, rename, and icon refresh does a full rebuild. If the grid ever grows or animates, switch to targeted DOM updates.

### m7. Some `const` blocks re-read `document.getElementById(...)` repeatedly
**File:** `src/renderer/app.js` (e.g. `renderGrid`, `applySettings`, button wiring at the bottom)
**Issue:** Minor readability. Cache element references at module scope, where it doesn't hurt.

### m8. `_offUpdateListeners` leak guard runs but never stores unsubs for banner-cycle timers
**File:** `src/renderer/app.js` (lines 1312–1350)
**Issue:** `_offUpdateListeners()` calls the returned `off` from each `api.on(...)` subscription — good. But `setupUpdateListeners()` can only be called once in practice (`init()` runs once). The guard is defensive but unused. Either keep as-is or drop the `_offUpdateListeners` bookkeeping entirely.

### m9. `VALID_THEMES` is derived from the CSS directory at startup via `fs.readdirSync`
**File:** `src/main/ipc.js` (lines 10–14)
**Issue:** Works, but in the packaged asar the `readdirSync` still resolves — nice. However, the **renderer** defines `VALID_THEMES` as `Object.keys(THEME_BANNERS)` (line 694 of `app.js`). These two sets need to stay in sync manually: add a theme CSS file without adding a banner entry, and the main process accepts it but the renderer silently has no quotes. Consider a single source of truth (e.g., renderer reads the list via IPC, or main generates both from the filesystem + a JSON banner map).

### m10. No `gitignore` check performed
I did not open `.gitignore` during this review; Sergei mentioned `node_modules/` was just deleted. Not a finding — just declaring scope.

## Positive Observations
- **Electron security is textbook-correct.** `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, preload uses `contextBridge`, IPC channels are on an explicit allowlist in both directions (`INVOKE_CHANNELS` / `ON_CHANNELS`), and the CSP (`default-src 'self' data:; script-src 'self'`) is restrictive and appropriate for a local-only app.
- **`launch-app` is allow-listed against the stored apps.** `filePath` must exist in `store.get('apps')` or match `shell:` / `steam://` — this is a solid defense against a compromised renderer being able to launch arbitrary executables. Exactly the right model for a tray-resident utility.
- **PowerShell path arguments go through environment variables (`QL_PATH`)**, not string interpolation — this neatly sidesteps PS injection via special characters in filenames. Deliberate and well-commented.
- **Save-error propagation is wired end-to-end.** `store.on('save-error')` → `main` → `renderer` → visible banner. Matches what the brief anticipated.
- **Settings validators are strict and per-field.** `save-settings` re-validates types, clamps numeric ranges (iconSize 32–128, window size ≥180×150), and matches `theme` against `VALID_THEMES`. Exactly the right paranoia level for a tool that persists to disk.
- **Good attention to Electron footguns.** `shell.readShortcutLink` avoidance for MSIX shortcuts is specifically called out with a reason. `autoDownload: false` / `autoInstallOnAppQuit: false` on the updater keeps the user in control.
- **The preload is minimal.** Only `invoke`, `on`, `getPathForFile`, `version`. No `send`, no `removeAllListeners`, no exposed `ipcRenderer` — correct.
- **Multi-monitor `visiblePosition` check.** Nice touch — the 100×50 overlap threshold prevents the window reappearing off-screen after monitor changes.
- **`installedAppsPromise` de-dupe.** In-flight invocation reuse is the right fix for rapid picker opens.
- **AV-aware icon helper compilation.** Compiling `IconHelper` to a cached DLL instead of inline `Add-Type` — the comment explaining Bitdefender heuristics is gold. Keep this.
- **CSP is present and correct.** Many Electron apps ship without one. Keep the `data:` allowance on `default-src` — it's needed for the icon data URLs.

## Recommendations
Prioritized follow-ups for Ender, in order:
1. **M1 — Escape handling:** move Escape-to-exit-fullscreen into the renderer (or at minimum add `app.on('will-quit', () => globalShortcut.unregisterAll())`). Biggest surprise-factor win.
2. **M2 — Atomic writes in `store.js`:** temp-file + rename. Small change, prevents the "I lost all my shortcuts" scenario.
3. **M5 — `second-instance` restore:** three-line fix, noticeable UX improvement.
4. **M4 — Auto-launch idempotency:** compare `getLoginItemSettings()` before overwriting.
5. **M3 — `randomTheme` guard:** one-line robustness fix.
6. **m9 — Single source of truth for themes:** makes adding a theme a one-step operation rather than two.
7. Minor items (m1, m2, m3, m5, m7) as cleanup when next in the neighborhood.

Senua stands down. Clear to release.
