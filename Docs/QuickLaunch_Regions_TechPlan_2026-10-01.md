# QuickLaunch regions: tech plan v1 (Ender, 2026-10-01)

Status: plan for the regions build. Milestone 1 is built and committed (`300b733`) on `wip/regions`, cut from `wip/regions-spike` (`bfc5887`) in the worktree `C:\Antigravity Projects\QuickLaunch-regions-spike`. Milestones 2 and 2b are committed (`3939f29`, `004d2a0`). Milestone 3 is built with the M3 rulings applied, uncommitted (§8, §8.1).
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
| M2 | Between regions | Drag a tile from one region to another (target slot plus a copy of the tile under the pointer, main process relays the drag); a drop on empty desktop or a full region cancels; Ctrl+Arrow, Delete, Menu key on tiles. Display changes and sleep/resume follow the home-layout rule. | **U5** (region to region), **U7** | built (§6) |
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

---

## 6. M2 as built

**Scope:** spec 5.3 (a tile dragged to another region: slot, copy of the tile, cancel rules; tile menu Move to with a full region disabled), 2.1 drop-target states (valid, rejected) and the reflow animation, 7.4 tile keys (Ctrl+Arrow, Delete, Menu key and Shift+F10), 4.4 display changes and sleep/resume. Proves **U5** (region to region) and **U7** as far as a self-test can (see the end of this section). Not in M2: a tile dragged onto the desktop and desktop icons dropped on a region (M3), Column, Row, Fan and Ring (M4, M5).

**How the drag works**
- The source keeps today's drag-to-reorder (mouse capture, today's ghost). `app.js` got four one-line hooks; the rest lives in `region.js`.
- While the pointer is outside the source window, the source sends its page coordinates to the main process (one call in flight, the newest position wins). The main process adds the source window's DIP origin and hit-tests the other regions' panel rects (`placement.regionAt`; a Grid's rim and the 12 px gaps count as desktop). It sends the region under the pointer `region:tile-drop-preview` (`over`, `leave`, `drop`); the tile's name and icon go once, on entering.
- The target draws the 2 px `--accent-c` outline, a dashed slot at the nearest position and a copy of the tile under the pointer (today's drag ghost, built from its own tile markup). The slot index (`tile-order.js`) takes the row nearest the pointer, then the nearest tile in it, before or after it by its centre; while the pointer is on the slot it stays, so the reflow cannot make it jump. Tiles reflow with a 120 ms ease, off under reduced motion.
- On release the main process cancels unless the point is on another region with room. Otherwise it asks the target page for the slot (`region:tile-drop`), moves the item there (`model.moveItemTo`), sends both pages their items and then answers the source. A target that does not answer within 2 s cancels.
- A full region (Fan 10, Ring 12; a Grid is never full) shows the outline in `--accent-m` and `FULL (n max)` in its banner, and the release cancels; the tile menu's Move to lists it disabled. In M2 this is only reachable through the `set-cap` test hook.
- Hide all, a display change, sleep, a source or target window closing, or a deleted region cancel the drag; the source is told (`cancel-tile-drag`) and restores its order.

**Tile keys:** Ctrl+Arrow in edit mode moves the focused tile one place among the visible tiles (Left or Up earlier, Right or Down later), keeps the focus on it and saves. Delete (from M1) now leaves the focus on the tile that takes its place. The Menu key and Shift+F10 (from M1) open the tile menu once: the `contextmenu` event Chromium sends after the key is skipped for 800 ms (M1 would have opened a second menu). The Manager's cheat-sheet lists Ctrl+Arrows, Menu / Shift+F10 and dragging a tile.

**Display changes and sleep/resume (home-layout rule)**
- Every relayout re-applies every window, not only the regions whose DIP rect changed: a scale change moves the physical rect, and the shell may move our parent.
- A move or resize takes its rect and its work area when it ends. The 400 ms save writes those, and a relayout inside that debounce uses them. M1 read `rt.shown` when the timer fired, so a display change inside the debounce could save a fitted rect or move the region back to its old place.
- A drag in flight (region move, resize, tile) is cancelled on a display change, on sleep and on resume.
- When regions still overlap after the fit, every region shrinks a step (never below its minimum) and the fit runs again (`placement.relayout`). The first pass is unchanged, so on the display the layout was saved on, the saved rects come back exactly. 8 Grids on an 800 x 600 stand-in: 6 overlapping pairs in M1, none now. Worst case 45 ms of main-thread time, once per display change.
- Resume: relayout 1 s after `resume`, as in M1; display events that follow run it again.

**Files**

| Area | Files |
|---|---|
| Main | `regions/controller.js` (drag relay, full check, display and resume rules, test hooks), `regions/model.js` (`moveItemTo`, `capacityOf`, `dropDecision`), `regions/placement.js` (`regionAt`, the shrink-all retry), `ipc.js` (`region:tile-drag`, `region:tile-drop`, test hooks), `preload.js` (3 channels) |
| Renderer | `tile-order.js` (new, pure: slot index, Ctrl+Arrow order), `region.js` (source hooks, drop target, keys), `app.js` (4 hooks in drag-to-reorder, `handleReorderUp(e)`), `index.html` (one script tag), `styles/region.css` (outline, slot), `manager.js` (cheat-sheet rows) |
| Tests | `test/regions/controller.test.js` and `tile-order.test.js` (new), `model.test.js`, `placement.test.js`; `scripts/regions-selftest.mjs` (M2 section) |
| Try-it | `scripts/tryit-regions.mjs` (M2 steps, including display and sleep) |

**Test hooks added (`--ql-test-hooks` only, inert otherwise):** native menus are recorded, never shown (`menus`; `menu-click` runs an item's real click handler); `launch-app` records instead of launching (`launches`); a stand-in work area runs the real display-change handler without touching the display (`set-work-area`); `resume` runs the real resume handler; `displace` moves one window without changing its rect; `set-cap` sets a region's item cap; `tile-drag` reads the drag state.

**Measured (2026-10-01, `electron-builder --win --dir` build of this tree, through `scripts/qa/quicklaunch-safe-launch.mjs`, 5120 x 1392 DIP work area at 150%)**

| Run | Result |
|---|---|
| Unit tests (`npm run test:regions`, node:test pass count) | 55/55: 31 from M1, 24 for M2. `controller.test.js` runs the real controller with `electron` and the desktop host stubbed. |
| Unit positive control (scratch mutation runner on copies of `src/` and `test/`) | 12/12 mutants caught: each M2 rule broken on its own fails at least one test. Before that, the slot test found a real bug: a drop in the empty cells after the last tile landed before the last tile. |
| Self-test, synthetic seed | 64/64 (42 from M1, 22 for M2). |
| Self-test, copy of the real data file | 64/64; the real file's size and mtime unchanged. |
| Self-test, `--probe` | 51/64. M1's 2 probes, plus 9 M2 probes: hidden slot, wrong half of the tile, release on a region, no cap, Ctrl+Arrow outside edit mode, late `contextmenu`, Place on the small display, no resume, no display change. They fail 11 M2 checks: the missing cap fails 2, and Place on the small display also fails "display back", since that rect now meets region 1's home. Nothing else fails. |
| Self-test, `--fallback` | 64/64 once, 63/64 twice: the foreground check saw our process's window in front (11 and 45 samples; in the run with diagnostics, from boot, before any M2 step). See the finding below. |
| Foreground (attached runs) | Sampled every 500 ms in every run: never ours, never the desktop. |

**Not provable without real input (Sergei's try-it, `node scripts/tryit-regions.mjs`):** a real pointer drag between two desktop-child windows (the self-test dispatches DOM mouse events inside the source page; the relay, hit test, preview, drop and data are real), that mouse moves outside the source window still reach it while the button is down, the real Menu key's follow-up `contextmenu`, a real resolution or scale change, and real sleep and resume.

**Build workaround:** the contrast gate fails on 13 old themes on this branch, and `npm run build` runs it as `prebuild`. M2 was built with `node scripts/clean-dist.js && npx electron-builder --win --dir --publish never`, which runs no npm lifecycle hook. The themes were not touched.

**Deviations and choices for Judy**
1. The slot is a 2 px dashed `--accent-c` box the size of a tile; the spec gives no colour.
2. In an empty Grid the drop hint hides while a slot shows (they would overlap).
3. The copy under the pointer is today's drag ghost (0.93 opacity, 1.1 scale, 2 degree tilt), since spec 2.1 keeps today's ghost; "translucent" in 5.3 may mean lighter.
4. Shift+F10 also opens the tile menu (5.3 names only the Menu key; 7.4 pairs the two for the region menu).
5. Ctrl+Up and Ctrl+Down move one place, like Left and Right ("one place earlier or later"), not one row.
6. The reflow animation runs in the drop target only; today's in-region reorder still moves tiles without one.

**Finding outside M2 (M1 fallback path):** fallback region windows (`--ql-no-desktop-layer`, or no desktop for 10 s) are ordinary activatable top-level windows just above the desktop. In 2 of 3 fallback self-test runs our window was in front for 5 to 22 s; in the run with diagnostics this started at boot, before any M2 step. The likely cause is Windows activating the next window in z-order when the window above it closes or minimises (Sergei was using the PC during the runs). Candidate fix: `WS_EX_NOACTIVATE` on fallback windows, plus explicit activation on a click so keys still arrive. That changes fallback keyboard behaviour, so it waits for a decision. Fallback self-test runs are paused until then, because each one can take focus. *Superseded by §7: the cause is now measured, and it is not the next-window handover.*

---

## 7. Fallback focus — options (Ender, 2026-10-01)

Tech facts for Judy's pick. Nothing in `src/` changed. Every prototype ran as a scratch copy of the M2 packaged build (`3939f29`, `app.asar` repacked in the session scratchpad), launched through the QA launch guard on a temp profile with no hotkey and driven by the M2 self-test `--fallback` over CDP. No synthetic input was sent. A read-only out-of-process WinEvent observer logged every foreground change, by class and process name only.

### 7.1 Root cause (measured)

`desktop-layer.js` calls `SetParent(hwnd, NULL)` on a window that is already top-level, and Windows' `SetParent` **activates** the window it moves. Inside the call, Windows moves the window to the top of the normal band (`WM_WINDOWPOSCHANGING` with `SWP_NOSIZE | SWP_NOMOVE`, no `SWP_NOACTIVATE`) and then sends `WM_ACTIVATEAPP` (active) and `WM_ACTIVATE` (`WA_ACTIVE`) synchronously. The JS stack at that `WM_ACTIVATE` is `detachToTopLevel` line 211 (`SetParent`), called from `RegionHost._goFallback`. There are two call sites:

| Call | When, in fallback | Evidence |
|---|---|---|
| `detachToTopLevel` | every fallback window: boot, region create, rebuild | Launch 1 (today's code): 0.6 s after start, Sergei's Explorer window lost the foreground to our region window while it was **still hidden**, raised above every window except the 2 topmost ones. It stayed ours for 3.5 s, until he clicked Chrome. |
| `releaseFromShell` | region delete; every region at quit | Launch 2 (first call guarded, second not): boot and 7 creates were clean. At the region delete, his foreground (claude.exe) went to our hidden window, which was destroyed 59 ms later. At quit it went to our hidden windows 8 times in 0.35 s. |

Likely reason it happened in only 2 of 3 runs: the activation reaches the foreground only when Windows' foreground rules let our process take it at that instant. Otherwise it stays inside our process and nothing visible happens. It won in launch 1, at both calls in launch 2, and in 2 of the 3 M2 runs. The M2 guess (Windows handing focus to the next window when one closes) was wrong: no foreground event in any run came from that.

Ruled out: `show` / `showInactive`, because the fallback show is already one `SetWindowPos(SWP_SHOWWINDOW | SWP_NOACTIVATE)` and the activation happens before it. Also ruled out: our own JS, which made no `focus`, `show`, `blur`, `moveTop` or `setFocusable` call on a region window in launches 2 and 3.

**The self-test's focus check cannot see this.** It samples the foreground every 500 ms. In launch 2 the observer saw our window take the foreground 9 times, but the sampler counted 0 and the check passed. The check that can fail is an out-of-process `EVENT_SYSTEM_FOREGROUND` hook, which failed as it should in launches 1 and 2.

### 7.2 Keyboard facts, measured without input

These were measured on hidden windows built like a region window. The test sent `WM_MOUSEACTIVATE` ("left button pressed over the client area") to our own hidden window. That is a question to the window procedure, not input, and nothing was activated. The table shows Chromium's answer:

| Window | `isFocusable()` | Chromium's answer | What it means |
|---|---|---|---|
| Fallback window as built today | true | `MA_ACTIVATE` | A click activates the window, so keys reach the page after a click. |
| Same, plus `WS_EX_NOACTIVATE` set through koffi | false | `MA_ACTIVATE` | Chromium still asks to be activated. Microsoft's docs say Windows does not activate a `WS_EX_NOACTIVATE` window on a click; one real click is needed to confirm. `win.focus()` still works, because Chromium's own `CanActivate` stays true (Chromium 128 source). |
| Electron `setFocusable(false)` | false | `MA_NOACTIVATEANDEAT` | Windows discards every press on the region: no pointer-down, no click, no drag. |
| Created with `focusable: false` | false | `MA_NOACTIVATEANDEAT` | Same. |

From the Electron 32.3.3 and Chromium 128 source (read, not run):
- `setFocusable(true)` adds a taskbar button (`ITaskbarList::AddTab`), then calls `Focus(false)`, which hands the foreground to the next visible window below ours. For a fallback region, that window is the desktop.
- `win.focus()` does nothing while `focusable` is false. Otherwise it calls `SetWindowPos(HWND_TOP)` and then `SetForegroundWindow`.

**The hotkey works the same in every option.** Ctrl+Space shows or hides all regions and never moves focus: `showAll` uses `SetWindowPos(SWP_SHOWWINDOW | SWP_NOACTIVATE)` and never calls `SetParent`.

### 7.3 Options

**A. Don't re-parent a window that is already top-level.** In `detachToTopLevel` and `releaseFromShell`, skip `SetParent(hwnd, NULL)` when the window's parent is already the desktop window.
- Keyboard: the same as today's fallback design. Before a click, keys go to whatever app has focus. After a click on a region, Windows activates it, so the filter, the tile keys (Ctrl+Arrow, Delete), Menu key / Shift+F10 and rename in the header all get keys.
- Mouse: unchanged. A click also raises the region above any window that overlaps it, as with any window. Win+D minimises it.
- Proven in launch 3 (both calls guarded): boot, 7 creates, a rebuild, a delete and quit all ran. Result 64/64, **zero** foreground events and zero `WM_ACTIVATE` on any region window. claude.exe had the foreground at the start and at the end.
- Risk 1: Windows can still hand focus to a fallback window when the window above it closes or minimises. Microsoft documents this for activatable windows. It was not seen in any run and was not provoked, because provoking it needs input.
- Risk 2: a region that was a desktop child still needs `SetParent(NULL)` when it drops to fallback after 10 s or quits from the desktop layer. Whether that call activates is not measured: the window still has `WS_CHILD` at that moment, and the 500 ms sampler in M1/M2 could not have caught it.
- Size: S (two guarded lines), plus S for moving the self-test's focus check to the foreground observer.

**B. A, plus `WS_EX_NOACTIVATE` on fallback windows, activated by our code on a click.** The region's pointer-down already reaches the main process (`onPointerDown`). In fallback it would call `win.focus()`.
- Keyboard: as A, both before and after a click.
- Mouse: as A, including the raise on a click (`win.focus()` puts the region on top).
- Removes A's risk 1: Microsoft's docs say Windows never hands focus to a `WS_EX_NOACTIVATE` window when another window closes or minimises.
- Risk: two behaviours need a real click to confirm. First, that Windows does not activate the region on the click by itself. Second, that Windows accepts our `SetForegroundWindow` right after the click (the rules allow it when our process received the last input). If the second ever fails, the region gets no keys and Windows flashes it instead.
- Size: S to M (the style bit at detach, a fallback branch in `focusAfterClick`, and one try-it step for Sergei).

**C. A, plus `WS_EX_NOACTIVATE`, never activated (mouse-only fallback).**
- Keyboard: no keys ever reach a fallback region, so no filter typing, tile keys, Menu key / Shift+F10 or rename in the header. The hotkey still works. Rename, settings and the picker stay available in the Manager.
- Mouse: clicks, drags and right-click menus work, because the press goes through without activating the window. The menus are then probably mouse-only (not measured). The region never rises above other windows.
- Risk: the lowest focus risk, but it drops the spec's "same UX" promise for fallback.
- Size: S.

**D. Electron `focusable: false`, turned on when needed: not workable.** Measured: Windows discards every press on the region while it is unfocusable, so the page never sees the pointer-down that would turn focus on. From the source: turning focus on adds a taskbar button and hands the foreground to the window below.

`showInactive` is not an option: fallback already shows windows that way, and the activation happens before the show.

**Ender's technical preference: A.** It removes the measured cause, keeps the specified keyboard behaviour, is the smallest change, and is proven with zero foreground events. Add B only if a fallback region is ever seen taking focus when another window closes. Either way, the self-test's focus check should move to the foreground observer, since the 500 ms sampler missed every event in launch 2.

**Side finding (diagnostics, not product code):** the first diagnostic build called koffi from inside an Electron `hookWindowMessage` callback that fired during another koffi call (`SetParent`). The main process hung and later died with `0xC0000005`. A fix must never call koffi from a window-message hook.

**Launches:** 3, all through the guard on temp profiles with no hotkey, and all closed (guard: exited, 0 left, startup keys unchanged, real data untouched). Sergei's foreground changed in launch 1 (3.5 s) and in launch 2: a 59 ms blip at the region delete, and 0.35 s at quit. Our in-process reading 0.1 s after the delete showed his app back in front. It did not change in launch 3.

### 7.4 M2b as built (Ender, 2026-10-01)

Builds Judy's "Addendum — M2 rulings" and the "Fallback focus — recommendation" (Option A, approved by Sergei) from the UX spec, on top of section 6. Uncommitted in the worktree.

**Rulings**
- A1: the slot is `2px dashed var(--accent-text)`, no fill; its height is set from a visible tile's `offsetHeight` when it is made, so no row grows (95 px slot = 95 px tile, measured in view and edit mode).
- A2, A3: the hint stays hidden for the preview, and the copy stays today's ghost (both as built in M2, now measured).
- A4: Shift+F10 = the Menu key. On a tile in view mode either key puts the region in edit mode with focus back on that tile; the 800 ms `contextmenu` skip stays.
- A5: Ctrl+Up / Ctrl+Down move `cols` places (`computeColumnCount` on the visible tiles, as the plain arrows use); outside the visible tiles nothing happens. `tile-order.stepOrder` takes the signed count. Each move sets a visually hidden `role="status"` line (`Moved to 8 of 12.`, class `ql-sr-status`). Cheat-sheet text as ruled.
- A6: the slot closes through the 120 ms reflow when the pointer leaves. After a drop it stays until the region's new items replace it, or until a refusal (the main process now sends an instant `leave`) or a 2.5 s timeout. A system cancel (display change, sleep, hide all, a window or region gone, no answer, quit) sends `leave` with `instant: true`, and the slot goes at once. In-region reorder is unchanged.

**Option A**
- `desktop-layer.js` `toTopLevelParent`: `SetParent(hwnd, NULL)` is skipped when the window's parent already is the desktop; `detachToTopLevel` and `releaseFromShell` use it. A desktop child is still re-parented while it carries `WS_CHILD`; its style changes only after the call. Unit-tested on the module with koffi replaced by a recording fake (guard and call order).
- A region window's `focus` event makes it the active region (`--border-h`, no glow); nothing else happens on activation. The first click is untouched (Chromium's `MA_ACTIVATE`).
- Test hooks: `force-fallback` (an attached region drops to fallback, desktop child to top-level, and the watchdog re-attaches it within a second) and `emit-focus` (runs the window's own focus listeners, activating nothing).

**Focus gate:** the 500 ms sampler is gone. `scripts/fg-observer.mjs` (read-only, out-of-process WinEvent hooks; class and process name only) runs from before the launch until after the app has quit. `scripts/fg-verdict.cjs` fails the run on any foreground change to a window of the build under test. A second check requires the observer to have seen our top-level windows: 8 in fallback mode, and the forced drop in attached mode. Positive control: the verdict replayed on today's real captures of the unguarded `SetParent` (section 7.1 launches 1 and 2) fails them (1 and 8 events) and passes launch 3. `--probe` also injects one such event.

**Tests**

| Run | Result |
|---|---|
| Unit (`npm run test:regions`, node:test pass count) | 68/68 (55 from M2, 13 new). |
| Unit positive control (scratch mutation runner) | 19/19 mutants caught (12 from M2 + 7 new: the Option A guard, `WS_CHILD` order, rows as single steps, activation, instant cancel, kept slot on refusal, case in the gate). |
| Self-test, attached, synthetic seed | 73/73 (launch 2). |
| Self-test, attached, copy of the real data file | 73/73, final script (launch 10); the real file's size and mtime unchanged. |
| Self-test, fallback (Option A, observer gate) | 72/72 (launch 9); 17 of our top-level windows seen, 0 foreground changes. |
| Self-test, `--probe` | 51/73 (launch 11): M1's 2, M2's 9 probes (11 checks) and 9 new probes (slot colour, copy opacity, hint, reduced motion on leave, Shift+F10 with no tile focused, Ctrl+Right for Ctrl+Down, no activation, the wrong region's state after the drop, a foreground event for this build) fail exactly those 22 checks. |

Three test-side lessons, none a product change: the hook's state read 400 ms after the drop already saw the region re-attached (now read inside the hook); a probe that changes the slot's colour must wait out the tile's 120 ms `border-color` transition, which outranks even inline `!important`; in fallback the regions sit under other windows and Chromium stops their animation clock, so the reflow recorder counts only animations the slot's removal created.

**Launches:** 11, all through the guard on temp profiles with no hotkey, all closed (guard: exited, 0 left, startup keys unchanged, real data untouched): 4 attached, 2 fallback (after Option A, with the gate), 5 probe (attached). The observer logged 3 foreground changes in all 11 runs, all between Sergei's own apps (Slack and claude.exe: 1 in launch 1, 2 in launch 6). None went to the test build. The 6 events "to this build" in the probe runs are the injected probe events.

**Not provable without real input:** that a real click on a fallback region activates it and keys arrive (Judy's optional 30-second step: `scripts/tryit-regions.mjs --fallback`), and Option A's risk 1 (Windows handing focus to a fallback window when the one above it closes), which needs input to provoke.

---

## 8. M3 as built (Ender, 2026-10-03)

**Scope:** the §4 M3 row, built to §3. A top-level `.lnk` or `.url` in the Desktop or Public Desktop, dropped on a region (or chosen with + FILE), moves into the store folder and its tile appears; it comes back with ↩, Delete, the tile menu, region delete, Move all back (region menu and Manager) or `--ql-restore-all` (uninstall). The Manager's Moved shortcuts section (spec 8.1, 5.5), `.url` accepted (Q5), the write-ahead journal, the startup reconcile, the error mapping, the OneDrive note, the placeholder refusal, the NSIS hook, the never-delete source scan, and `--ql-test-desktop`. The empty-Grid copy changed (§5, deviation 1). Not in M3: Column, Row, Fan, Ring, and the open M2b Minors (Esc during a tile drag, a drop into a filtered region, Tab order).

**How it works**
- `src/main/moves/` holds every file operation; nothing else in the app touches a user's shortcut file. `win32.js`: koffi `MoveFileExW(src, dst, MOVEFILE_WRITE_THROUGH)` and nothing else (no `REPLACE_EXISTING`, no `COPY_ALLOWED`), `GetFileAttributesW`, `SHGetKnownFolderPath`. `rules.js` (pure): which files move, the error mapping, `Name (2).lnk` names, OneDrive, the test-mode guard, every box text. `journal.js`: `moves-journal.json` (.tmp, fsync, rename) and `moves-log.jsonl` (append, fsync). `mover.js`: one queue for every operation, behind the startup reconcile. `setup.js`: which folders are used.
- Add, per file: attributes only (a placeholder is refused before anything reads it) → the tile icon and the sha256 (the file is read) → a free name in the store folder → **intent** on disk → `MoveFileExW` (on `ERROR_ALREADY_EXISTS`/`ERROR_FILE_EXISTS` the intent takes the next number and the move is retried) → verify (target size and hash equal, source gone; on a mismatch the file is moved back and the add aborted) → item `{ kind: 'moved', path: dst, origin: src }` committed with `store.flush()` → **done** → only then the controller sends the region its items. Back: target = the origin's folder if it still exists, else the current Desktop, collision-safe; intent → move → verify → item removed and committed → done.
- Startup reconcile (§3 table, unchanged) runs in the queue before any drop is taken; then a scan marks moved items whose file is gone (`broken`, sent to the page, never stored) and lists store-folder shortcuts with no item (files without a tile).
- The region page handles OS file drags itself (capture listeners in `region.js`): the M2 drop-target states (outline, dashed slot at the nearest place; `FULL (n max)` for a capped region), then `region:drop-files` with the paths and the slot index. `app.js` got one hook (`qlDecorateTile` at the end of `createAppTile`): ↩ on moved tiles, the broken state on broken ones.
- A page save can rename and reorder a moved item, never change its path, take it from another region, leave it out or make one (the controller keeps the stored item and tells the page).
- Message boxes go through one `_box()`; with `--ql-test-hooks` they are recorded and answered from a queue (default: the cancel button), never shown.

**Uninstall.** `scripts/nsis/installer.nsh` (`package.json` `build.nsis.include`) defines `customRemoveFiles`: unless the uninstaller runs with `--updated` (an auto-update), it runs `QuickLauncher.exe --ql-restore-all` and waits, then looks for `*.lnk` / `*.url` in `%USERPROFILE%\QuickLauncher Shortcuts`; if any is left, a message box names the folder (`/SD IDOK` when silent). Then electron-builder's stock removal block, copied verbatim from app-builder-lib 25.1.8 (re-check it on any electron-builder upgrade). `--ql-restore-all` builds no window, tray, hotkey or startup entry: it loads the store, reconciles, moves every moved file and every file without a tile back, and exits 0 (nothing left), 2 (something left), 3 (QuickLauncher already running), 4 (moving unavailable).

**Test mode.** `--ql-test-desktop=<dir>` replaces the folders with `<dir>\Desktop`, `<dir>\Public Desktop` and `<dir>\QuickLauncher Shortcuts`. Before anything else runs, the app refuses it (exit 64) unless those folders and the profile lie inside `%TEMP%` and none overlaps the real Desktop, Public Desktop, store folder or profile (the real ones are compared as plain paths, never opened). In test mode no file outside `<dir>` is ever moved, even if a copied data file names one. `--ql-test-hooks` without `--ql-test-desktop` makes moving unavailable.

**Files**

| Area | Files |
|---|---|
| Main, new | `src/main/moves/{win32,rules,journal,mover,setup}.js` |
| Main, changed | `index.js` (`--ql-restore-all`, the test-mode refusal, the move setup), `regions/controller.js` (the mover's data adapter, drops, ↩, delete and Move all back with their boxes, broken tiles, the Manager section, the save guard, the menus, test hooks), `ipc.js` (`region:drop-files`, `region:move-back`, `region:broken-click`, `manager:open-store`, `manager:move-all-back`, `manager:orphan`; + FILE through the move; `.url` icons; test ops), `preload.js`, `manager-preload.js` (the channels), `store.js` (`flush()` says whether the data is on disk; `isReadOnly()`), `regions/model.js` (singular delete line) |
| Renderer | `region.js` (file drag and drop, ↩, broken tiles, Delete on a moved tile), `app.js` (one hook), `index.html` (empty-Grid copy), `styles/region.css` (broken state), `manager.html`, `manager.js`, `styles/manager.css` (Moved shortcuts) |
| Installer | `scripts/nsis/installer.nsh`, `package.json` (`nsis.include`; no version change) |
| Tests | `test/regions/moves-{rules,never-delete,mover}.test.js`, `test/regions/controller-moves.test.js` (new), `model.test.js`; `scripts/regions-selftest.mjs` (M3 section, `--root`, the real-desktop gate), `scripts/regions-m3-crash.mjs` (new: crash and reconcile, restore-all, refusal, across launches) |
| Try-it | `scripts/tryit-regions.mjs`: runs with a fake desktop in its temp profile, and moved items in the copied data become references, so a try-it can never move a real file (no step or text changed) |

**Test hooks added (`--ql-test-hooks` only):** `moves-state` (folders, pending journal, broken, files without a tile, paused step, reconcile done), `move-hook` (`pauseAt` a step, `crashAt` a step: the windows leave Explorer's tree, then `app.exit(70)`; `fault`: a Win32 code returned instead of calling `MoveFileExW`), `move-continue`, `moves-off`/`moves-on`, `rescan`, `boxes`, `box-answers`, `opened` (Open folder is recorded, never run).

**Measured (2026-10-03, `electron-builder --win nsis --publish never` build of this tree; its `app.asar` `src/` is identical to the worktree `src/`; every launch through `scripts/qa/quicklaunch-safe-launch.mjs` on a temp profile with no hotkey, every file operation on a fake desktop in the session scratchpad)**

| Run | Result |
|---|---|
| Unit (`npm run test:regions`, node:test TAP counts) | 115/115: 68 from M2b + 47 new (moves-rules 9, moves-never-delete 2, moves-mover 25, controller-moves 11); one assertion added to a model test. Real files, real `MoveFileExW`, real share-mode locks, a real read-only ACL (reset afterwards), a real `FILE_ATTRIBUTE_OFFLINE`. |
| Unit positive control (scratch mutation runner on copies of `src/` and `test/`) | 30/30 mutants caught; unmutated copy 115/115. Each one breaks a rule on its own: REPLACE_EXISTING or COPY_ALLOWED in the flags, no intent, done before the commit, the tile before done, no placeholder check, a read before it, no retry on a name race, no verify, the origin folder ignored, no unavailable or full refusal, no reconcile of an add or a removal, an unlink, a rename for a move, three error mappings, the Public Desktop or OneDrive unrecognised, the test-mode guard (outside %TEMP%, real folders), the confinement (mover, setup), the save guard (drop, re-path), delete despite a failure, ↩ from another region, the tile menu label, the delete text. |
| Never-delete scan | Fails on 15 fixture lines (unlink, rm, rmdir, copy, cp, truncate, DeleteFile, RemoveDirectory, SHFileOperation, CopyFileEx, both forbidden flags, trashItem, a rename outside the journal) and on an extra flag value; passes on the five move files (an allow-list: a new file in `moves/` fails until it is scanned). |
| Self-test, attached (`npm run selftest:regions -- --guard … --root <scratchpad>`) | 97/97 (73 from M2b + 22 M3 checks + the real-desktop gate + the real-store gate). |
| Self-test, `--fallback` | 96/96; the observer saw 17 of our top-level windows, 0 foreground changes. |
| Self-test, `--probe` | 53/98: exactly the 22 known reds of M1, M2 and M2b, all 22 M3 checks (one wrong input each) and the probe-only check of the desktop-listing comparison. The real-desktop and real-store gates pass in the probe run too. |
| Crash script (`node scripts/regions-m3-crash.mjs --guard … --part …`) | crash-add 5/5, crash-back 5/5 (each step: the journal holds the intent after the crash, the next start finishes or aborts it, the file is byte-identical where it must be, nothing pending), restore 4/4 (one file held open: exit 2, it stays with its tile; again: exit 0, only README.txt left, no window built), refusal 3/3 (exit 64, the folder not created). `--probe`: crash-add 3 reds (no second start), restore 1 red (nothing held), refusal 1 red (a folder inside %TEMP%). |
| NSIS | A probe line in `customRemoveFiles` fails `makensis` ("Error in macro customRemoveFiles … uninstaller.nsh line 146"), so the macro is compiled into the uninstaller section; the real file builds. The installer was built, never run or installed. |
| Real Desktop and Public Desktop | Identical before the launch and after the quit in every self-test and crash run (names, kinds, sizes, times; `SHGetKnownFolderPath`, then `readdir`/`lstat`); `%USERPROFILE%\QuickLauncher Shortcuts` never created. |
| Foreground | The out-of-process observer in every run: no foreground change ever went to the build. |

**Not provable without real input:** an OS drag of real desktop icons (and from Explorer) onto a desktop-child region and its drop (U5, desktop to region: the self-test calls the same channel with the paths a drop hands the page); the + FILE dialog returning a `.lnk` itself (Windows' file dialog may resolve a shortcut to its target; Electron offers no switch for that on Windows); a real Public Desktop shortcut and a real OneDrive-redirected Desktop (U8; both measured on test folders with the real ACL and environment shapes); a real cross-volume move (no second volume inside `%TEMP%`: the refusal is measured by injection, the flags by the scan and the mutants); the uninstaller itself (Sully's packaged-build test).

**Deviations from §3 and the spec**
1. **Moving is unavailable while the store is read-only** (both directions): a journal entry is marked done only once its commit is on disk, which a read-only store cannot do. Same refusal and box as "moving unavailable" (spec 5.5.7); a drop with a desktop file is refused whole ("Nothing was changed").
2. **The journal holds only pending entries;** done and aborted records leave it and live in `moves-log.jsonl`. The intent carries one field more than §3 lists, `index` (the drop slot), so a reconcile puts the tile where it was dropped. "Add back" finds the origin in the history.
3. **The uninstall hook is `customRemoveFiles`, not `customUnInstall`:** electron-builder runs `customUnInstall` after `RMDir /r $INSTDIR` (the exe is gone), and `customUnInit` before the Welcome page, where the user can still cancel. When everything came back, the hook also deletes the folder's own `README.txt` and removes the folder only if it is then empty (`RMDir` without `/r`).
4. **Restore-all also moves files without a tile to the Desktop,** so an uninstall strands nothing; exit 3 when another QuickLauncher holds the single-instance lock.
5. **Verify:** a mismatch moves the file back and aborts the add; if that move back fails, the add finishes (the file is in the store folder and its tile is the way back).
6. **Read failures before a move:** `EBUSY` reads as "The file is in use.", `EPERM`/`EACCES` as access denied (on the Public Desktop "Needs administrator rights."). A cloud-only placeholder (`OFFLINE`, `RECALL_ON_OPEN`, `RECALL_ON_DATA_ACCESS`) fails with the catch-all reason.
7. **"Compared after realpath"** resolves the file's folder, never the file: opening a placeholder could recall it.
8. **Broken means the file is missing.** Spec 3.4 and 5.4 mark a tile broken whenever its move back fails; a file that is only held open stays a normal tile (its "missing" box would be false). For Judy 11.
9. **A full region refuses the whole drop** when it cannot take all the files (none moves); only reachable with the `set-cap` test hook until M5.
10. **The file-drop slot stays until the main process answers** (moves build icons and can take seconds), not A6's 2.5 s; the OS draws the dragged icons, so no copy of a tile is drawn.
11. **Test mode is confined** to its own folder; `--ql-test-hooks` without `--ql-test-desktop` makes moving unavailable; the profile must also be inside `%TEMP%`.

**For Judy (gaps where the spec gives no copy, state or style)**
1. A failed ↩ / Delete / tile-menu / Move all back / Move to desktop: `Couldn't move back {n} shortcut(s) ({names}).` + the reason line (spec 9.3 "Delete failed" without "The region was kept."); spec 5.4 says only "one box names the failures and the reason".
2. Manager Move all back (every region): second line `Names already on the desktop get a number.` (spec 5.4's "They leave “{name}”." names one region).
3. Singular forms: `1 shortcut … It is still on the desktop.`, `1 shortcut moves back to the desktop.`, `1 file without a tile.`.
4. Broken tile: pip colour `--accent-m` (the error token), 4 px in from the corner; hidden in edit mode, where the 24 px badge takes that corner; the box's default button is Keep.
5. Manager section: title `// MOVED SHORTCUTS`; count and OneDrive lines 12 px `--text-dim`; per file a row (name, `ADD BACK`, `MOVE TO DESKTOP`); MOVE ALL BACK… dimmed and inactive at 0, same tooltip.
6. Texts with no spec string: `README.txt` in the store folder; the uninstaller's box (`Some moved shortcuts could not go back to the desktop. They are in <folder>`); both provisional.
7. `NOT A SHORTCUT` is **not built** (stopped): during an OS drag a page cannot read the files' names or types, only their count; a dropped non-shortcut is ignored silently. Show it after the drop, and for how long?
8. The cheat-sheet row `DELETE — Remove the focused tile (edit mode)`: on a moved tile Delete moves it back. Not changed.
9. A placeholder's reason is the catch-all `The disk refused the move.`
10. Files dropped into a region with a type-to-filter active land hidden by the filter (as M2b's m-2 for tiles); not changed.
11. Deviation 8: a move back that fails while the file is still in the store folder leaves a normal tile. Confirm, or name the state it should show.

**For Judy: answered.** The eleven points above were ruled in the UX spec's "Addendum — M3 rulings" (Judy, 2026-10-03, `d878e86`); §8.1 records how they were built.

### 8.1 M3 rulings applied (Ender, 2026-10-04)

Builds the addendum B1 to B12 and Sergei's two rulings of 2026-10-03: (1) a tile whose moved file is missing never blocks Delete region or Move all back; Delete region treats it as a reference and removes only its record, Move all back skips it, no file is deleted; (2) his Desktop is not OneDrive-redirected, so the OneDrive note stays as built. Uncommitted, on top of §8.

**What changed, by ruling**
- **B1 failure boxes** (`rules.js`): what failed (one name in quotes; two or more: the count and up to 3 names, then `and {n} more`), where it is now, then the reason line(s) (one shared reason, or one `{name}: {reason}` line per listed name). Drop / + FILE: `… off the desktop. It is still on the desktop.`; ↩, Delete, tile menu, Move all back: `… back to the desktop. It is still in QuickLauncher.`; Delete region kept: `… The region was kept.` plus `{n} others are back on the desktop.` / `1 other is back …`; MOVE TO DESKTOP (file without a tile): `… to the desktop. It is still in the QuickLauncher Shortcuts folder.` When every reason is `The file is missing.` the where-it-is sentence is left out.
- **B2 Move all back:** `n` counts only shortcuts whose file is there; the region menu (or the Manager when they all sit in one region) names it (`It leaves` / `They leave “Games”.`); the Manager with shortcuts in k ≥ 2 regions says `They leave {k} regions.`
- **B3:** `1 other shortcut is removed from QuickLauncher. The app stays installed.` (and without moved ones `1 shortcut is removed …`); `None moved off the desktop.` at 0.
- **B4 broken tile:** the pip is a 12 x 12 inline SVG "!" disc (`--text` disc, `--bg` mark) at `top: 2px; left: 2px` in view **and** edit mode; tile `aria-label` `{name}, missing`; in view mode the tile and its label carry `{name} is missing. Click to remove the tile or keep it.`; the box reads `“Name” is missing from the QuickLauncher Shortcuts folder.` (Keep default, Esc = Keep). In edit mode its badge is ✕ `Remove tile`, which removes the tile record at once (no box), as do Delete and the tile menu's `Remove tile` (new channel `region:remove-broken`; a file that came back is not removed and the tile shows unbroken).
- **B4b** (Sergei, ruling 1): Delete region rescans, counts a missing-file tile as a reference in the confirm, moves back only the files that are there, and never keeps the region for a missing file (also one that goes missing during the move back). Move all back rescans and skips missing-file tiles; the region menu item is enabled only when at least one moved shortcut has its file; the Manager count leaves them out.
- **B5 Manager section:** every sentence `--text`, every button `min-height: 24px`; a standing line `Moving is unavailable.` (new element `#moved-unavailable`, below the OneDrive line) when moving is unavailable, with MOVE ALL BACK…, ADD BACK and MOVE TO DESKTOP disabled and titled `Moving is unavailable.` (OPEN FOLDER never; the main process also refuses both orphan actions then); MOVE ALL BACK… disabled at 0 with `No shortcuts to move back.`; row name tooltip = the file name with extension; ADD BACK `Add this shortcut to “{first region}”`; MOVE TO DESKTOP `Move this shortcut to the desktop`.
- **B6:** the README and the uninstaller box carry the ruled texts (the NSIS string compiled with `makensis` in the build below).
- **B7:** no type check during the drag; after a drop, files that are not `.lnk`/`.url`/`.exe` give the region notice `NOT A SHORTCUT` / `{n} FILES ARE NOT SHORTCUTS` through `showUpdateBanner` (the launch-error slot, 8 s), never a box. **`dropEffect` stays `'copy'`**, commented in `region.js` and guarded by `test/regions/m3-rulings.test.js` (a scan of every `dropEffect`/`effectAllowed` assignment in `src/renderer`, seen to fail on 6 fixtures and on the mutant `'copy'` → `'move'`) and by a self-test check of the page's own listener.
- **B8:** the cheat-sheet Delete row as ruled. **B9:** the seven reasons (`Windows denied access to the file.`, `The desktop is on a different drive.`, `The file is online only. Keep it on this device, then try again.`, `The file is missing.` added). **B10:** an accepted file drop (not FULL, at least one path) clears the type-to-filter as the paths go to the main process; + FILE in a region clears it once the file is added (main process command `clear-filter`). **B11:** as built. **B12.1:** ↩ is `.btn-move-back` only (the ✕ badge's geometry, none of its colours; `--panel-bg`, `--accent-text` border, `--text` 14 px glyph; hover and `:focus-visible` as ruled). **B12.2:** the try-it writes `Try A.url` and `Try B.url` into its fake Desktop and prints the M3 step.

**Files (on top of §8):** `moves/rules.js`, `moves/mover.js` (README), `regions/controller.js`, `regions/model.js`, `ipc.js`, `preload.js`, `region.js`, `app.js` (the reorder guard also skips `.btn-move-back`), `manager.html`, `manager.js`, `styles/region.css`, `styles/manager.css`, `scripts/nsis/installer.nsh`, `scripts/tryit-regions.mjs`; tests `test/regions/m3-rulings.test.js` (new), `moves-rules.test.js`, `controller-moves.test.js`, `moves-mover.test.js`, `model.test.js`; `scripts/regions-selftest.mjs`.

**Measured (2026-10-04, `electron-builder --win nsis --publish never` of this tree, without `clean-dist.js`; its `app.asar` `src/` is identical to the worktree `src/`; launches as in §8; Sergei's installed QuickLauncher was running throughout and was left alone: the guard isolates by profile, the test profiles register no hotkey)**

| Run | Result |
|---|---|
| Unit (`npm run test:regions`, TAP counts) | 128/128: 68 from M2b + 60 for M3 (§8's 47, the split box tests, 6 new controller tests, 6 in `m3-rulings.test.js`). Texts that changed by ruling were retargeted, not removed. |
| Unit positive control (mutation runner) | 50/51 caught, unmutated copy 128/128: §8's 30 (two re-anchored) and 21 for the rulings, among them `'copy'` → `'move'` in `region.js` (caught by the drop-effect scan). The one survivor, "Delete region also tries to move a missing file back", is equivalent: the second safeguard (a missing file never keeps the region) gives the same result. |
| Self-test, attached | 101/101: 73 from M2b, 26 M3 checks (22 retargeted or split, plus B10, B7 notice, drop effect, broken tile in edit mode), the real-desktop and real-store gates. |
| Self-test, `--fallback` | 100/100; the observer saw 17 of our top-level windows, 0 foreground changes. |
| Self-test, `--probe` | 53/102: the 22 known reds of M1 to M2b, all 26 M3 checks, and the listing-comparison control; the real-desktop and real-store gates pass in the probe run too. |
| Crash script | crash-add 5/5, crash-back 5/5, restore 4/4, refusal 3/3 (product code under them changed: README text, reasons). |
| Real Desktop and Public Desktop | Identical from the start of this round to its end (`readdir` + `lstat` of the `SHGetKnownFolderPath` folders); every self-test and crash run also checks it before and after. |

**Deviations (numbered on from §8)**
12. **B5 "in the OneDrive line's place"** read as: its own line in the OneDrive line's style, placed right below it (the layout list puts the state line below); if both apply, both show.
13. **B7 and B10, "accepted":** a drop that is not FULL and has at least one path clears the filter even if every file is ignored (as the ruling defines it); the notice also shows when the drop was refused as unavailable (with its box), never on FULL.
14. **B10, + FILE:** the region's + FILE and its menu "Add file…" clear the filter once a tile is added; the Manager picker's BROWSE (a file added to a region from the Manager) does not, since the ruling names + FILE only.
15. **The page test seam** `window.__qlFileDrop(paths, x, y)` exists only with `--ql-test-hooks` (region info carries `testHooks`): a page cannot build the `File` objects an OS drop carries, so the self-test enters the page's drop code just after `getPathForFile`. The `set-cap` hook now tells the page its cap (so a page-side drop can show FULL).
16. **README:** the ruled block plus a final CRLF after its last line.
17. **↩ focus ring** on `:focus-visible` (keyboard focus), like the tile's ring.

**For Judy (left open)**
1. B5 placement reading (deviation 12).
2. The notice slot (`#update-banner`) has no live region, so neither launch errors nor the B7 notice are announced to a screen reader today (spec 7.5 says they are); B7 follows "announced like the other notices". Not changed.
3. B12.4 (a duplicate drop is silent) and m-2 (a tile dragged into a filtered region) stay unruled; not changed.

**Not provable without real input** (as §8, plus): Explorer's handling of the `'copy'` answer (it must leave the dragged desktop icons for the move to take them; the cursor reads "Copy"), the B10 clear after a real + FILE dialog, and the notice's 8 s on screen.
