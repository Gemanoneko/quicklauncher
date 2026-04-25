# QuickLaunch — Code Review (2026-04-25)

**Reviewer:** Senua (Code Reviewer)
**Version reviewed:** 1.94.0-pending (HEAD: `7acf161`)
**Prior review:** `QuickLaunch_CodeReview_2026-04-24.md` (1.93.0, HEAD `a6d1333`)
**Diff scope:** `8cfe321..HEAD` — 17 commits since v1.93.5
**Verdict:** **RELEASE CLEAR**

## Summary
This batch implements every Critical / Important item from Judy's UX Review (§§3–7, 10) plus an opportunistic polish pass: global `Ctrl+Space` hotkey (rebindable, with conflict reporting), grid keyboard navigation (arrow + Enter + focus-visible outline), in-grid type-to-filter, `?` cheat-sheet overlay, OS-honoring + user-settable reduced-motion, expanded tray menu, runtime-composed update-available tray icon, build-time WCAG contrast linter (gate-on-changed / warn-on-legacy), 24×24 click target floor, 12 px body-text floor, and contrast remediation across 72 themes.

Code quality on the new surface is consistent with the 1.93 baseline: Electron security defaults are intact, every new IPC channel is allowlisted in both directions, every new PowerShell call site continues to pass paths via `QL_PATH` env (no new shell-out paths in this batch — verified). The two prior `Major` items most relevant here (M1 Escape and M2 atomic writes) were resolved in 1.93.x and remain resolved. No Critical findings. Cleared to ship.

The contrast linter is conceptually solid (worst-case "composite over hard black" is the right paranoia level for a transparent-window utility) and the rebaseline workflow is documented in the brief. One minor methodological note around the linter's `--text-dim` math, two minor footguns around the runtime tray-icon composition, and a handful of small consistency items — all advisory.

## Resolved Since 2026-04-24
- **M1 Escape global-shortcut leak** — Escape moved to renderer-scoped handling in 1.93.x; no `globalShortcut.register('Escape', ...)` remains. The new `Ctrl+Space` `globalShortcut` IS unregistered both via `app.on('will-quit', () => globalShortcut.unregisterAll())` (`src/main/index.js:83–85`) and lazily before re-binding (`applyGlobalHotkey`). Resolved correctly.
- **M2 Atomic store writes** — `_save()` now writes to `dataPath + '.tmp'` then `fs.rename()` (`src/main/store.js:81–99`), and `_load()` falls back to `.bak` on `SyntaxError` (lines 24–32). Verified nothing in this 17-commit batch reverted these.
- **M3 `randomTheme` empty-pool guard** — `index.js:22` now guards `VALID_THEMES.size > 0` before random selection. Resolved.
- **M4 Auto-launch idempotency** — `index.js:54–63` and `ipc.js:608–615` now call `setLoginItemSettings` only when `current.openAtLogin !== desiredOpenAtLogin`. The tray's `Start with Windows` toggle (`tray.js:137–145`) mirrors the same pattern. Resolved.
- **M5 `second-instance` restore** — `index.js:67–73` now `restore()` + `show()` + `focus()`. Resolved.

## Critical Findings
None.

## Major Findings

### M1 (new). Type-to-filter rebuilds: full DOM walk on every keystroke + drag/rename refilter
**Files:** `src/renderer/app.js:898` (`renderGrid()` calls `applyFilter()` post-rebuild), `app.js:1467–1478` (`applyFilter()`)
**Issue:** Every printable keystroke calls `setFilter` → `applyFilter`, which re-queries `elAppGrid.querySelectorAll('.app-tile')` (full DOM walk), then for each tile does `apps.find(a => a.id === id)` — an O(n) scan inside an O(n) loop, so each keystroke is **O(n²)** in tile count. For Sergei's likely <50 shortcuts this is invisible (microseconds), but every drag-reorder, rename, and icon refresh triggers `renderGrid()` which now re-runs `applyFilter()` if a filter is active. If the grid ever grows or filter is held during edit, the cost compounds.
**Why it matters:** Maintainability + future scaling. Not a user-visible bug today.
**Suggested fix:** Cache `apps.find` lookups with a `Map` keyed by id, or store `nameLower` directly on the tile via `dataset.nameLower` so `applyFilter` reads tile attributes only — no `apps`-array scan. `renderGrid()`'s `applyFilter()` post-call is correct (necessary because `innerHTML=''` wipes the class) but cheaper if applyFilter is iteration-only.

### M2 (new). Document-level keydown handler doesn't ignore IME composition events
**File:** `src/renderer/app.js:1480–1568`
**Issue:** The type-to-filter branch (`e.key.length === 1 && !ctrl/alt/meta`) fires on every printable keystroke, including those produced during an IME composition session. On a CJK / dead-key layout the window receives both composition events AND `keydown` for each constituent keystroke, which means filter text receives unintended characters. There is no `e.isComposing` guard.
**Why it matters:** Sergei is on a Latin layout so this is unlikely to bite in daily use, but it's a clear maintainability footgun if the codebase ever picks up a non-Latin user (or Sergei pastes non-Latin text into the grid name field via clipboard).
**Suggested fix:** Add an early return at the top of the document `keydown` listener: `if (e.isComposing || e.keyCode === 229) return;`.

### M3 (new). `composeUpdateIcon` has no defense against an empty/missing base bitmap
**File:** `src/main/tray.js:74–76, 22–50`
**Issue:** `iconDefault = nativeImage.createFromPath(iconPath).resize(...)` returns an empty image if `icon.png` is missing or unreadable. `composeUpdateIcon(empty)` then calls `baseImage.toBitmap()` which returns an empty buffer; `W=0, H=0`, the loop body never runs, and `nativeImage.createFromBitmap(emptyBuffer, {width:0,height:0})` produces an invalid image. `new Tray(invalidImage)` then throws and the main process exits before the rest of bootstrap completes (no tray = no UI surface for QuickLauncher).
**Why it matters:** Preexisting (the bare `new Tray(...)` at line 78 was already vulnerable in 1.93.5). The new commit adds a second consumer (`composeUpdateIcon`), broadening the surface. Realistic only if the icon asset is missing from the packaged build — not a runtime concern, but a packaging-mistake amplifier.
**Suggested fix:** Early-return from `setupTray` with a `console.error` if `iconDefault.isEmpty()` is true. Cheap insurance.

### M4 (new). Title-animation default flip is a behaviour change worth a release-note line
**File:** `src/renderer/styles/base.css` (`--title-anim: none` was `glitch-title 8s ...`)
**Issue:** Not a bug — Judy's spec explicitly calls for default-off ambient motion. But because individual themes set their own `--title-anim` in many cases (per-theme glitch / pulse keyframes), and because the spec explicitly says "Themes can opt back in by overriding --title-anim," this commit silently changes the visual identity of any theme that **inherited** the base default rather than redeclaring `--title-anim`. I did not enumerate which themes did/didn't. Not blocking, but Sergei should expect "the title doesn't animate anymore on theme X" to be a feature, not a regression — communicate this in the release note.
**Suggested fix:** None required. If anyone files this as a "bug" post-release, point them at UX Review §5.

## Minor Findings

### m1. `--text-dim` audit at high alpha values produces inflated contrast scores
**File:** `scripts/check-theme-contrast.js:179–187`
**Issue:** `flatten(composite(c.color, bgFlat))` flattens `--text-dim` over the (already-flattened-on-black) background. For e.g. `gryffindor` where `--text-dim: rgba(180, 110, 50, 0.93)`, this composites the dim color over the bg AT bg's already-opaque value, yielding a near-`#B16E32` reading — which may or may not reflect what the user actually sees because in the running app `--text-dim` is layered on the *transparent* `#app` over the desktop wallpaper, not always on `--bg`. The linter is consistent (worst-case-on-black), but the contract is "passes-on-black-bg" rather than "passes-everywhere." Acceptable; document it in the linter header so future maintainers don't trust the score in isolation.
**Suggested fix:** One-line comment: "ratios assume `--text-dim` lands on `--bg` over hard black; semi-transparent `--bg` over a light desktop will read differently."

### m2. Hotkey rebind input — recording-mode side effect persists if user switches focus mid-recording
**File:** `src/renderer/app.js:1882–1894` (`startRecording` / `endRecording`)
**Issue:** Clicking into the readonly input → `startRecording`. Switching to another window or alt-tabbing away does NOT trigger `blur` reliably (Electron + frameless can swallow blur events on system focus changes). The input retains `recording` class and `'PRESS KEYS...'` placeholder until the user clicks back and presses something. Cosmetic.
**Suggested fix:** Add `inputEl.addEventListener('blur', endRecording)` and rely on Electron's normal blur firing when the Settings overlay is dismissed; even if it's flaky on system-focus changes, it'll fire on overlay close which is the realistic exit path.

### m3. `_filterText` is not cleared on window hide
**File:** `src/renderer/app.js:1397` (`_filterText` module-scope var)
**Issue:** When the user types `git` to filter, picks a tile, presses Enter (window hides), then re-shows the window via Ctrl+Space — the filter chip is still showing `GIT` and most tiles are still hidden. They have to press Esc first to clear. Mild UX paper-cut more than a code defect; depends on Sergei's preference whether type-to-filter should be persistent or session-bound. Worth confirming with Judy.
**Suggested fix:** Either clear filter on `hide-window` IPC, or document the "filter persists across hides" behavior. No code change unless Sergei flags it.

### m4. `apply-global-hotkey` accepts a 64-char string but persists *before* validating shape
**File:** `src/main/ipc.js:290–296`, `src/main/index.js:92–124`
**Issue:** `save-settings` validates `globalHotkey` as length-≤64, but does NOT call `applyGlobalHotkey` to verify the shape parses. The renderer always pairs the two calls (`apply-global-hotkey` → check `result.ok` → `save-settings`), but a renderer bug or a future caller that skips the apply step could persist an invalid string that then re-fails on every restart (silent — `applyGlobalHotkey` catches and warns to console, but the user just sees no hotkey). Pre-existing pattern of "renderer is trusted" — flagging because the saved-but-unbindable case has no surface.
**Suggested fix:** Optional. On startup, if `applyGlobalHotkey` returns `{ok:false}`, send `'settings-changed-externally'` after clearing `globalHotkey` to null so the user sees a `CONFLICT` chip in the next overlay open.

### m5. Cheat-sheet overlay text reads `RIGHT-CLICK ... Enter edit mode` — keyboard cheat-sheet listing a mouse action
**File:** `src/renderer/index.html:147`
**Issue:** Style nit — the panel header is `// KEYBOARD SHORTCUTS` but one row is the right-mouse-button. Minor inconsistency.
**Suggested fix:** Either drop that row or rename the panel `// SHORTCUTS`.

### m6. `--text-dim: rgba(190,100,100,0.98)` in `doom-eternal.css` is essentially opaque
**File:** `src/renderer/styles/themes/doom-eternal.css:18`
**Issue:** Bumping alpha from 0.45 to 0.98 makes `--text-dim` indistinguishable from a solid color — at that point declare it as `#BE6464` so future maintainers don't think the alpha is load-bearing. Same observation applies to `gryffindor` at 0.93. Cosmetic.
**Suggested fix:** Convert to opaque hex in those two files.

### m7. `_filterText` global state lives in module scope but `apps` is also module-scope — coupling
**File:** `src/renderer/app.js:1397, 1467`
**Issue:** As `app.js` grows, the increasing number of module-scope `_xxx` flags (`_filterText`, `_offUpdateListeners`, `installedAppsPromise` is in main, etc.) is becoming a maintainability soft-spot. Not a finding for this release; flagging as a refactor-when-convenient candidate. The code is readable today.

### m8. Linter's regex-built variable extraction does not anchor to `:root`
**File:** `scripts/check-theme-contrast.js:121` (`extractVar`)
**Issue:** `new RegExp('--' + name + '\\s*:\\s*([^;]+);')` matches the **first** declaration of `--name` anywhere in the file. If a theme ever defines `--text-dim` inside a media query before the `:root` block (none currently do), the linter would read the wrong value. Defensive note — the comment in the file already calls this out as "themes always declare their palette in a single :root block at the top."
**Suggested fix:** None unless a theme breaks the convention. Comment is sufficient.

### m9. `setStatus` clears prior state on the next read but not on overlay close
**File:** `src/renderer/app.js:1853` (`setStatus`)
**Issue:** If the user pulls up Settings, attempts a conflicting hotkey, gets `CONFLICT — IN USE BY ANOTHER APP`, dismisses the overlay, and reopens it later — the error text is still rendered. Minor.
**Suggested fix:** On overlay close, clear the status text. Trivial.

## Positive Observations

- **IPC surface still locked down.** `INVOKE_CHANNELS` and `ON_CHANNELS` allowlists in `preload.js` were correctly extended for every new round-trip (`apply-global-hotkey`, `get-global-hotkey-status`) and every new push event (`launch-error`, `tray-open-settings`, `settings-changed-externally`). No bypass attempts; no `removeAllListeners`; no exposed `ipcRenderer`. Preload is still minimal.
- **Global hotkey lifecycle is correct.** `globalShortcut.unregisterAll()` on `will-quit`, lazy-unregister-then-register pattern in `applyGlobalHotkey`, error-path returns `{ok:false, reason:'CONFLICT'|'INVALID'}` rather than throwing. The `try/catch` around `globalShortcut.register` covers both the boolean-`false` failure path AND the throw-on-bad-string path. Defensive and well-commented.
- **No new `child_process.exec` or `shell.openExternal` usage.** All shell-out continues through `execFile` with `QL_PATH` environment variables. `launch-app`'s `execFile('explorer.exe', [filePath], …)` for protocol URIs is the correct argument-array form, no shell interpolation. The pre-flight `fs.existsSync` + try/catch around `shell.openPath` is a clean defensive layer.
- **Save-launch errors are wired end-to-end.** `launch-app` → `webContents.send('launch-error')` → renderer banner. Same pattern as the existing `save-error` path. The renderer truncates the name to 60 chars before stringifying into the banner — sensible, prevents pathological long-string DoM bloat.
- **Tray icon composition is correct AND cached.** `composeUpdateIcon` runs **once** at `setupTray`; both icon variants are held in module scope and reused. The brief asked specifically about "memory leak from repeatedly composing on every check" — confirmed not a concern, the runtime path is just `tray.setImage(cachedReference)`.
- **Updater↔tray circular import is genuinely fine.** The `function setTrayUpdateAvailable(flag) { try { require('./tray').setUpdateAvailable(flag); } catch {} }` pattern in `updater.js:10–14` re-resolves the require **at call time**, after both modules have finished evaluating their top-level `module.exports = …`. The `try/catch` is defense-in-depth for tests / abnormal startup. Not a "delay the failure" — it's a clean pattern for the genuine require-cycle that exists between these two modules.
- **Contrast linter philosophy matches the spec exactly.** Hash-of-file-contents → "is this theme unchanged since baseline" → warn vs. fail. Worst-case "composite over hard black" is the right paranoia level for a transparent-window utility. `--rebaseline` is opt-in only. `prebuild` hook in `package.json` ensures every CI build runs it. The comment block at the top of the script clearly states the spec mapping. Easy for future maintainers to reason about.
- **Reduced-motion implementation is two-layer.** Body class (renderer applies on settings change OR on `prefers-reduced-motion: reduce` match) AND `@media (prefers-reduced-motion: reduce)` directly in CSS. Either layer alone would suffice; both together is belt-and-braces and matches Judy's spec.
- **Theme contrast remediation is mechanically uniform.** I spot-checked `gryffindor`, `doom-eternal`, `akira`, `cyberpunk`, `portal`. Every diff in the 72-theme batch is alpha-bump on `--text-dim`, hex change on `--hint-sub-color`, plus title color overrides on the three red-keyed themes Judy called out. No accidental logic changes slipped in. The keyframe edits in `doom-eternal` and `gryffindor` (for the title resting color) are deliberate and scoped to the title alone — accent variables stay canonical so borders/glows preserve the theme identity.
- **24×24 click target floor consistently applied.** `btn-remove`, `update-dismiss`, `header-controls button`, `btn-hotkey-clear`, `filter-chip-clear` all hit the floor. Header buttons use `min-width:28px; min-height:24px` per Judy's spec.
- **Body-text floor consistently applied.** `header-version`, `setting-row label`, `setting-label`, `checkbox-label`, `picker-item-name`, `picker-empty`, `theme-picker-item`, `theme-picker-empty`, `hint-sub`, `hotkey-status`, theme-search input, rename input — every functional-copy site listed in UX Review §3 was raised to 12 px. Letter-spacing dropped to ≤1 px on the same set.
- **Single source of truth for tray-driven settings changes.** `notifyRendererSettingsChanged` → `'settings-changed-externally'` → renderer rehydrates via `get-settings` → `applySettings()`. Means a tray checkbox toggle and an in-overlay checkbox toggle converge on the same store state with no drift. Good.

## Recommendations
Prioritized follow-ups for Ender (none block 1.94.0):

1. **M1 — Type-to-filter O(n²)**: cache `nameLower` on tile dataset; remove the `apps.find` inside `applyFilter`. Easy win.
2. **M2 — IME composition guard**: one-line `if (e.isComposing) return` in document keydown.
3. **M3 — `iconDefault.isEmpty()` guard**: early-return from `setupTray` if the asset failed to load.
4. **m2 — Hotkey input blur cleanup**: add `blur` listener to `endRecording`.
5. **m4 — Bind-validate on settings load**: if `applyGlobalHotkey(savedHotkey)` returns `ok:false` at boot, null out the saved value and surface in next overlay open.
6. **m6 — Convert near-opaque rgba to hex** in `doom-eternal` / `gryffindor` for cleanliness.
7. **m1, m5, m8, m9** — opportunistic cleanup when next in the neighbourhood.

## Verdict
**RELEASE CLEAR.** Ship `1.94.0`.

Senua stands down.
