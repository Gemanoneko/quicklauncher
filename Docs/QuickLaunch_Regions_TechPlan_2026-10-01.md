# QuickLaunch regions: tech plan v1 (Ender, 2026-10-01)

Status: plan for the regions build. Milestone 1 is built (uncommitted) on `wip/regions`, cut from `wip/regions-spike` (`bfc5887`) in the worktree `C:\Antigravity Projects\QuickLaunch-regions-spike`.
Inputs: Judy's `QuickLaunch_Regions_UXSpec_2026-10-01.md` (all defaults accepted by Sergei, Q1 to Q11), `QuickLaunch_Regions_Layouts_2026-10-01.svg`, Makoto's `Team/Research/QuickLaunch_Regions_2026-09-30.md`, the spike note `QuickLaunch_RegionsSpike_2026-09-30.md` and Sergei's spike run log of 2026-10-01 (6/6 PASS).

Sergei's defaults, as built: Ctrl+Space toggles (Q1); Match all off reverts to each region's own theme (Q2); a full Fan or Ring blocks (Q3); deleting a region removes its reference shortcuts and moves its desktop files back (Q4); `.url` accepted (Q5); filter on the active region (Q6); built-in glyphs (Q7); quotes in Grid only (Q8); random theme re-rolls all regions (Q9); icons under a region stay hidden (Q10); an `.exe` is added by reference, never moved (Q11).

---

## 1. Architecture

### 1.1 Processes and windows

| Piece | Kind | Notes |
|---|---|---|
| Main process | Node + Electron 32 | **Owns all region state** (the store, region records, which window is which region, active region, hidden flag). Renderers hold a view; they never own data. |
| Region window, one per region | `BrowserWindow`, frameless, transparent, `skipTaskbar`, `thickFrame:false`, created hidden, never activated | Reparented as a `WS_CHILD` of the window that holds `SHELLDLL_DefView` (Progman on this build) with koffi. In front of the icons, under every normal window, untouched by Win+D (spike). Loads `src/renderer/index.html`, today's grid page. |
| Manager | Normal top-level `BrowserWindow`, frameless, taskbar button | Created on demand, closes to nothing (the process lives on in the tray). Regions view, Settings view, installed-app picker, cheat-sheet. Primary region's theme. |
| Session sentinel | Hidden `BaseWindow` (no renderer) | Desktop children never get `WM_QUERYENDSESSION`; this top-level window does, so the store still flushes on logoff and shutdown. |
| Tray, global hotkey, updater, icon worker | unchanged | Tray menu and hotkey act on all regions; update banner goes to the primary region. |

**Per-sender scoping.** The renderer's IPC contract is unchanged (`get-apps`, `save-apps`, `get-settings`, `save-settings`, `launch-app`, `store-reloaded`, ...). The main process looks up which region sent each call (`webContents` to region map) and scopes the answer: `get-apps` returns that region's items, `save-apps` replaces only that region's items, `get-settings` returns the global settings with `theme` set to that region's effective theme, and a theme change from a region goes to that region (or to the shared theme while Match all is on). This keeps `app.js` almost unchanged, which matters because `wip/theme-fidelity` edits the same file.

### 1.2 Desktop layer (from the spike, productised)

- `src/main/desktop/pick-host.js`: pure finder (raised, unsplit, classic-split; anything else is unknown and falls back). Unit-tested on synthetic trees.
- `src/main/desktop/desktop-layer.js`: the koffi Win32 calls, one module, nothing else in the app calls Win32 directly.
- `src/main/desktop/region-host.js`: one host per region window. States `pending`, `attached`, `fallback`. Ported from the spike with three changes: (1) it keeps a `hidden` flag, so a rebuild never shows a region the user hid; (2) `setScreenRect()` moves or resizes the window in its parent's client coordinates (attached) or in screen coordinates (fallback); (3) it does not own a timer: one shared 1 s watchdog in the controller ticks every host, primary first.
- **Watchdog per tick:** host alive, still our parent, DefView still in the host, our window above DefView (re-raise if not). On a loss: hide, re-find, re-attach. If the window died with its parent (Explorer restart), the host rebuilds it and the renderer reloads its state from the main process. After 10 s with no desktop: fallback.
- **Fallback and kill switch** `--ql-no-desktop-layer`: an ordinary top-level tool window placed just above the desktop, shown with one `SetWindowPos(SWP_SHOWWINDOW)` (spike note 4). Same UX; Win+D minimises it.
- **Keyboard focus:** a click on a region activates the desktop (spike note 2). On pointer-down the renderer tells the main process, which calls `SetFocus` on the region window **only if the desktop is already the foreground window**, so it can never steal focus. Sergei's spike run proved this path with real typing (7 keys reached the page after a click).
- **Main thread stays short** (spike note 5: our UI thread's input queue is attached to Explorer's desktop thread). Region drag moves are one `SetWindowPos` per animation frame; no sync file work runs on the main thread during a drag.
- **Quit:** the tray Quit, `will-quit` and session end take every region out of Explorer's tree (`SetParent(0)`, hidden) before the process exits.

### 1.3 Rebuild on Explorer restart

All region windows die with Progman. Each host goes `pending`, then rebuilds its window as soon as a desktop host exists (primary first), and the page is told it is a rebuild (`?rebuilt=1`): no entrance fade, view mode, filter cleared. Items, names, themes and positions come from the main process, so nothing is lost. The Manager and tray are top-level and are not affected (Chromium re-adds the tray icon on `TaskbarCreated`).

### 1.4 Placement (main process, pure module `src/main/regions/placement.js`)

- Every region has a **panel rect** (the visible box, DIP) and a **window rect** (panel plus a 6 px resize rim for Grid; equal for the other layouts).
- Rules from spec 4.1: no overlap between panel rects with a 12 px gap; inside the primary work area with a 12 px margin; snap within 12 px to the margin, to neighbours' edges at the gap, and to edge alignments; Alt disables snapping only.
- **Drag** is script-driven (spec U3 fallback chosen up front, because the OS drag region does not apply to a child window and cannot enforce the rules): pointer capture in the renderer, cumulative delta to the main process, which moves per axis from the last valid rect and stops at the gap ("bump, not push"), then snaps, then sets the rect. Resize (Grid) works the same per edge, min 180 x 150.
- **Home layout (spec 4.4):** a region stores its rect and the work area it was saved against. On a different work area the rect is clamped on screen (smallest move, overlap search, Grid may shrink) **without saving**; only a user move or resize saves. Same work area again: the saved rects come back.
- **Create:** centre of the work area, then 32 px steps right and down (20 steps), then an outward search; if nothing fits, the refusal string.

### 1.5 The Manager window

`src/main/manager.js` + `src/renderer/manager.html|js`, `styles/manager.css`, own preload (`manager-preload.js`, its own channel allowlist). The main process checks the sender's role on every manager channel, so a region page cannot call them. Default 560 x 560, min 440 x 420, position remembered in `settings.managerBounds`. Esc closes a field or the picker first, then the Manager. Its ✕ closes only the Manager.

The in-region Settings, picker and cheat-sheet overlays stay in `index.html` / `app.js` but are no longer reachable from a region (their buttons open the Manager). They are removed in M6, after `wip/theme-fidelity` has merged, to avoid a three-way conflict in those files now.

### 1.6 Store writes and the read-only merge with many renderers

The store module is unchanged except one accessor. Each region renderer saves its own items; the controller rebuilds the flat `apps[]` by replacing that region's items in place. After a read-only stretch ends mid-session, the store pushes one merged state; the controller fans it out (each region gets its items) and calls `rendererSynced(seq)` only once **every** live region has acked. Until then, a save from a region that has not acked is replaced into the store's pre-merge view and merged exactly as today (`setFromRenderer`), and a save from a region that has acked goes straight in. Settings from regions are applied as a diff against what the main process last sent that region, so a stale renderer cannot write back old settings. The Manager sends single-field patches.

---

## 2. Data model and migration

### 2.1 Shape (same file, `quicklauncher-data.json`)

```jsonc
{
  "apps": [                       // flat, as today; display order = order within each region
    { "id", "name", "path", "iconDataUrl",
      "regionId",                 // new: owning region
      "kind": "ref" | "moved",    // new in M3 (absent = "ref")
      "origin": "C:\\...\\Desktop\\Steam.lnk"   // M3, moved items only
    }
  ],
  "settings": { ...today's fields..., "matchAll": false, "sharedTheme": null, "managerBounds": null },
  "regions": [                    // new; creation order; regions[0] is the primary
    { "id", "name", "icon": "apps", "layout": "grid",
      "theme",                    // the region's own theme (kept while Match all is on)
      "rect": { "x", "y", "width", "height" },        // panel rect, DIP
      "home": { "x", "y", "width", "height" },        // work area the rect was saved against
      "gridSize": { "width", "height" },              // M4: Grid remembers its size across layout switches
      "fanDirection": "up" }                          // M5
  ],
  "regionsVersion": 1
}
```

Why a flat `apps[]` with `regionId` instead of items nested under regions:
- the store's crash-safe load, the shape check (`apps` must be an array) and the three-way read-only merge all keep working untouched;
- the QA launch guard (`scripts/qa/quicklaunch-safe-launch.mjs`) checks the same shape;
- **downgrade is safe:** v1.94.3 reads the file, shows every shortcut in one grid, and keeps the `regions` key (it saves unknown top-level keys); on the next regions start, items that lost `regionId` go back to the primary region.

`settings.theme` mirrors the primary region's theme, so a downgrade shows the same look. `windowPosition` and `windowSize` are left as they were at migration.

### 2.2 Migration (pure, `src/main/regions/model.js`, idempotent)

At start, after the store loads and before any window exists:
1. No valid `regions` array: create one Grid region `QUICK.LAUNCH`, icon Apps, theme `settings.theme`, rect = today's `windowSize` at today's `windowPosition` (defaults 424 x 300, bottom-right with 20 px margin as today, then clamped into the work area). Every item gets its `regionId`. Order is kept.
2. Valid `regions`: repair only. Unknown fields dropped, names made unique, bad rects replaced, items with a missing or unknown `regionId` go to the primary region, an empty list gets a primary region.
3. **Before the first migrated save**, the current data file is copied once to `quicklauncher-data.pre-regions.json` beside it (`COPYFILE_EXCL`, never overwritten). The normal `.bak` rotation also keeps the pre-migration generation as `.bak` after the first save.
4. Random theme on startup (Q9 all) runs after migration: every region gets a new theme different from its own, or one new shared theme while Match all is on.

Tested on a copy of Sergei's real data file (read-only copy into the scratchpad, never the original), see the M1 report.

---

## 3. The safe file move (M3)

Goal: a `.lnk` or `.url` that sits directly in a Desktop folder moves into a QuickLauncher folder when added to a region, and can always come back. Nothing is ever deleted.

| Part | Design |
|---|---|
| Which files | Top-level `.lnk` and `.url` files in the user Desktop and the Public Desktop, as resolved by `SHGetKnownFolderPath(FOLDERID_Desktop / FOLDERID_PublicDesktop)` through koffi (the real folders, OneDrive-redirected or not), compared after `realpath`. An `.exe` and anything else is a reference (Q11). |
| Store folder | `%USERPROFILE%\QuickLauncher Shortcuts\` (visible, not hidden, outside OneDrive), with a `README.txt` saying what it is and that the Manager can move everything back. "Open folder" in the Manager. |
| The move | `MoveFileExW(src, dst, MOVEFILE_WRITE_THROUGH)` through koffi: an atomic same-volume rename that **fails if `dst` exists** and **fails across volumes** (no `MOVEFILE_COPY_ALLOWED`). Node's `fs.rename` is never used for moves: on Windows it replaces an existing target. A cross-volume source is refused (`The disk refused the move.`); there is no copy-then-delete path. |
| Write-ahead manifest | `moves-journal.json` in the profile folder, written with the store's `.tmp`, fsync, rename pattern. **Before** each move: an `intent` record `{ op, itemId, regionId, name, src, dst, size, mtimeMs, sha256 }`. After the move and the store commit: `done`. A failed move: `aborted` with the Win32 error. An append-only `moves-log.jsonl` keeps the history. |
| Order of work (add) | validate (desktop file, region not full, moving available) → pick a free `dst` name → write intent → `MoveFileExW` → verify `dst` size and hash, `src` gone → add the item (`kind: "moved"`, `path = dst`, `origin = src`) and save the store → mark `done` → only now send the tile to the renderer. |
| Order of work (back) | target = the origin's folder if it still exists, else the current Desktop → collision-safe name `Name (2).lnk`, `(3)`... (a race on the name retries the next number; nothing is overwritten) → intent → move → verify → remove the item → `done`. Delete region: every moved file goes back first; if any fails, the region is kept with those tiles broken (spec 3.4). |
| Startup reconcile | For each pending intent: file still at `src` → aborted (nothing happened); file at `dst`, no item → finish the add if the region exists, else it is a "file without a tile"; file at the restore target, item still there → finish the removal. Then: a moved item whose file is missing shows broken; a file in the store folder with no item is listed in the Manager (Add back, Move to desktop). Runs off the main thread's hot path (async fs), before regions accept drops. |
| Errors mapped | `ERROR_ACCESS_DENIED` on the Public Desktop → `Needs administrator rights.` (no elevation, ever); sharing violation → `The file is in use.`; anything else → `The disk refused the move.` One box per drop. |
| OneDrive | Desktop under `%OneDrive%`, `%OneDriveConsumer%` or `%OneDriveCommercial%`: the Manager note. A cloud-only placeholder (`FILE_ATTRIBUTE_RECALL_ON_DATA_ACCESS` or `OFFLINE`) is refused, not hydrated behind the user's back. |
| Never delete | The move module contains no `unlink`, `rm`, `rmdir` or `copyFile` + delete. A unit test scans the module source and fails if one appears (proven to fail on a fixture). |
| Uninstall | NSIS `customUnInstall` runs `QuickLauncher.exe --ql-restore-all` and waits; the app moves every moved file back and exits. If anything remains, the uninstaller names the folder in a message box. Sully verifies in the packaged-build test. |
| Tests | Only against a temp fake Desktop: `--ql-test-desktop=<dir>` (refused unless inside `%TEMP%`) replaces the known-folder lookup. Failure injection (locked file, existing `dst`, cross-volume, crash after each step via a test hook) and a before/after listing of both folders on every test. Never Sergei's Desktop. |

---

## 4. Milestones (each usable by Sergei on its own)

| # | Name | Sergei can | Proves (spec 11) | Size |
|---|---|---|---|---|
| **M1** | **Regions foundation (Grid)** | Use today's grid as region 1 on the desktop layer, under his windows, through Win+D and an Explorer restart. Create more Grid regions (tray or Manager), move them by the header, resize from the rim, rename, set a theme per region or Match all, move tiles between regions with the tile menu, delete a region. Manager for regions and settings. Ctrl+Space hides or shows all. | **U1** real keys (type-to-filter, rename in the handle, F6), **U3** script move and resize, **U4** native menus and boxes for a desktop child, **U6** several regions (memory and CPU measured at 8). | built |
| M2 | Between regions | Drag a tile from one region to another (target slot plus a copy of the tile under the pointer, main process relays the drag); a drop on empty desktop or a full region cancels; Ctrl+Arrow, Delete, Menu key on tiles. Display changes and sleep/resume follow the home-layout rule. | **U5** (region to region), **U7** | M |
| M3 | Desktop files move in | Drop desktop shortcuts on a region: they leave the desktop and come back with ↩, region delete or Move all back. Moved shortcuts section in the Manager. `.url` accepted. | **U5** (desktop icons onto a region), **U8** | L |
| M4 | Column and Row | Switch a region to Column or Row: size follows content, scrolls past 90%, compact header or leading cell, edit cluster; layout switch keeps the anchor and finds room. Gallery shots of all 101 themes in both. | | M |
| M5 | Fan and Ring | Fan (max 10, four directions) and Ring (max 12) from the geometry in spec 2.7 (unit-tested against Judy's table); hub with name, ⋯ and edit cluster; chips dim for the filter; refusals at the cap. Transparent parts click through. | **U2** | L |
| M6 | Release prep | In-region overlays removed (after theme-fidelity merges); contrast gate adds `--text` on `--panel-bg`; gallery in all layouts reviewed; CPU with 5 regions idle 60 s measured against one region today; packaged build under Bitdefender; Brief Decision Log; Senua review, Futaba full pass, Sully releases. | | M |

Order rationale: the risks the spec cannot fall back from cheaply come first (keys, several regions, cross-region drag). The file move is the real data risk (Makoto section 5.4), so it comes before the new layouts, to soak longest under daily use. Fan and Ring have a known fallback for U2 (a shaped window region), so they can wait.

If a section-11 risk fails in practice, the build stops and the options go to Judy and Sergei (brief rule); the fallbacks are listed in spec section 11.

---

## 5. M1 as built

**Scope:** spec sections 1, 2.1, 2.2 (Grid), 3.1, 3.2, 3.4 (no file moves), 4 (Grid), 6.3, 7, 8 (Regions and Settings views, picker, cheat-sheet), 9 (M1 controls and strings), tile menu "Move to". Not in M1: layouts other than Grid, file moves, drag between regions, Moved shortcuts section, `.url`, the Layout and Fan direction menus, Move all back.

**Files**

| Area | Files |
|---|---|
| Main, new | `src/main/desktop/{desktop-layer,pick-host,region-host}.js`, `src/main/regions/{model,placement,controller}.js`, `src/main/manager.js`, `src/main/manager-preload.js` |
| Main, changed | `index.js` (controller instead of one window, sentinel, quit release), `ipc.js` (per-sender scoping, fullscreen removed, dialogs unparented for regions), `tray.js` (spec 7.1 menu), `updater.js` (sends to the current primary region), `preload.js` (region channels), `store.js` (one read accessor). `window.js` removed (the controller creates the windows). |
| Renderer, new | `region.js` (handle drag, rim resize, menus, rename in the handle, F6, Alt+Arrow, active state), `region-icons.js` (16 glyphs), `styles/region.css`, `manager.html`, `manager.js`, `styles/manager.css`, `theme-names.js` (a copy of `THEME_NAMES` for the Manager; one shared file in M6) |
| Renderer, changed | `index.html` (⋯ replaces ⛶, region icon slot, `region.css`, `region-icons.js`, `region.js`), `app.js` (surgical: fullscreen, F11 and the tray-settings listener removed; ⚙ and + INSTALLED open the Manager; idle pause also counts the pointer). `region.js` takes `?` to the Manager and skips the entrance fade on a rebuild. |
| Tests | `test/regions/*.test.js` (`npm run test:regions`), `scripts/regions-selftest.mjs` (`npm run selftest:regions`: packaged build through the QA launch guard, driven over CDP with no OS input) |
| Try-it | `scripts/tryit-regions.mjs` (copy of Sergei's data on a temp profile, through the QA launch guard) |

**Test switches (runtime flags, never build modes):** `--ql-no-desktop-layer` (fallback window mode), `--ql-test-hooks` (the Manager opens hidden and is never shown or focused; bounds and metrics are logged; the `manager:test` channel answers), `--ql-no-update-check` (no update check 5 s after start, for local builds without an update feed). All are inert unless passed.

**Measured (2026-10-01, packaged `--dir` build, through `scripts/qa/quicklaunch-safe-launch.mjs`, 5120 x 1392 DIP work area at 150%)**

| Run | Result |
|---|---|
| Unit tests (`npm run test:regions`) | 31/31. The display-change test failed before Grid shrinking was added (gate seen to fail). |
| Self-test, synthetic seed | 42/42. Guard: exited, 0 left, startup keys unchanged, real data untouched. |
| Self-test, copy of Sergei's real data file | 42/42; the migrated store keeps all 5 shortcuts in order, byte-identical fields, every setting, the window rect; the real file's size and mtime unchanged. |
| Self-test, `--fallback` | 42/42 (top-level tool windows, same behaviour). |
| Self-test, `--probe` | 40/42: the hit-area and renderer-error checks fail as they must on an injected overlap and an uncaught error. |
| Foreground window | Sampled every 500 ms in every run: never ours, never the desktop. |
| Several regions (U6) | 8 regions all attached in front of the icons. Private memory: about 350 MB with 1 region (browser and GPU processes about 290 MB), about 33 MB more per region, about 700 MB at 8 (working set about 1.18 GB). Idle CPU 0.0% with 7 and 8 regions (Electron per-process rates over 10 s windows, pointer outside, nothing focused). |
| Rebuild (stand-in: the region window closed) | Back on the desktop layer with its tiles and no entrance fade in 0.53 to 0.70 s. |

Bug found by the self-test and fixed: `start()` and the first watchdog tick could both build a window for one region, leaving a second hidden page for it. Window creation now has a single in-flight promise; the self-test checks exactly one page per region.

**Not provable without real input, so it is Sergei's try-it (`node scripts/tryit-regions.mjs`):** real typing into a region (U1; the spike already saw real keys arrive after a click), a real pointer drag and resize (U3), the native region and tile menus and the delete box on a desktop child (U4), and a real Explorer restart and Win+D with the product build.

**Deviations from the spec in M1, for Judy:**
1. Empty Grid copy stays today's (`DROP .EXE OR .LNK HERE`) until M3, because "Drag them off the desktop" is only true once files move.
2. Delete confirm without moved files reads `{n} shortcuts are removed from QuickLauncher. The apps stay installed.` ("other" dropped when the first line is absent).
3. A rejected rename in the header shows the `--accent-m` border and the error as the field's tooltip; there is no room for a line below the field in a 40 px header. The Manager field shows the line below as specified.
4. The Manager's layout select and + NEW REGION offer Grid only until M4/M5.
5. The 16 region glyphs are simple line drawings made for M1; they need Judy's review.
