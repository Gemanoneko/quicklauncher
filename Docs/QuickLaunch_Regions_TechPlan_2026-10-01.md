# QuickLaunch regions: tech plan v1 (Ender, 2026-10-01)

Status: plan for the regions build. Milestone 1 is built and committed (`300b733`) on `wip/regions`, cut from `wip/regions-spike` (`bfc5887`) in the worktree `C:\Antigravity Projects\QuickLaunch-regions-spike`. Milestones 2 and 2b are committed (`3939f29`, `004d2a0`). Milestone 3, its fix pass and the F-2 fix are committed (§8 to §8.3). Milestone 4 (Column and Row) is built with Judy's M4 rulings applied, uncommitted (§9, §9.1); the M3 first-render race fix is §8.4.
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
- **Fallback and kill switch** `--ql-no-desktop-layer`: an ordinary top-level tool window placed just above the desktop, shown with one `SetWindowPos(SWP_SHOWWINDOW)` (spike note 4). Same UX; Win+D leaves it up, not minimised (Sergei's ruling, 2026-10-05; see § 8.3).
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
| M4 | Column and Row | Switch a region to Column or Row: size follows content, scrolls past 90%, compact header or leading cell, edit cluster; layout switch keeps the anchor and finds room. Gallery shots of all 101 themes in both. | | built (§9) |
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
- Mouse: unchanged. A click also raises the region above any window that overlaps it, as with any window. Win+D leaves it up, not minimised (Sergei's ruling, 2026-10-05; this line first said it minimises, which was written from reading and never measured, § 8.3).
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

### 8.2 M3 fix pass (Ender, 2026-10-04)

Builds the UX spec's "Addendum — M3 fix pass" C1 to C6 (`6a1394e`), the region-window tagline fix (that addendum's offer 1, approved by Sergei on 2026-10-04), and the "Addendum — try-it rewrite" (`d993236`), which replaces C7. Not built: the update-offer colour (offer 2; Sergei said no). Uncommitted, on top of §8.1.

**What changed, by ruling**
- **C1 (M-1).** The store step (making `QuickLauncher Shortcuts`) is now a per-file failure with a reason, before anything is journalled: `EEXIST`/`ENOTDIR` → `A file named “QuickLauncher Shortcuts” is in your user folder. Rename or move it, then try again.`; `EPERM`/`EACCES` → `Access to the QuickLauncher Shortcuts folder was denied. Check its permissions and your security software.`; `ENOSPC` → `The disk is full.`; anything else → the catch-all. A journal write that fails gets `The disk is full.` or the catch-all only, and leaves no pending intent. The B1 box carries them; an `.exe` in the same drop still becomes a tile. Nothing is remembered: the next drop tries again. OPEN FOLDER: a box `Couldn't open the QuickLauncher Shortcuts folder.` plus the reason line for the three named causes (any other error: the first line alone); nothing is passed to the shell. `dropFiles` also answers an unexpected throw with one B1 box (catch-all) for the dropped shortcuts that are still there.
- **C2 (m-1, m-3).** A file that a tile owns belongs to one tile (wording per the C2 follow-up, D2; `mover.addPaths` plans each file): a desktop shortcut that a tile already has moves, and that same tile becomes the moved tile (its name and icon kept) at the dropped slot, leaving its old region; on a failed move it stays as it was. A store-folder shortcut that a moved tile owns: that tile goes to the dropped slot, no file moves (onto its own region: a reorder). A store-folder shortcut with no tile gets a moved tile at the slot, as ADD BACK makes, and leaves "files without a tile". A tile already in the dropped region adds nothing to the count. Several tiles on one file: the one in the dropped region, else the first in region order (the data adapter now gives the mover `regionIds()`).
- **C3 (m-2).** The store folder's free-name search skips every name a moved tile owns, its file there or missing (also in the name-race retry).
- **C4 (m-4).** A store path (folder, `\`, name with any ` (2)`) of 260 characters or more is refused before the intent: `The name is too long for the QuickLauncher Shortcuts folder. Shorten it, then try again.` The box keeps "It is still on the desktop."
- **C5 (m-5).** The banner slot has two layers (`src/renderer/banner-layers.js`, pure, `window.QL_BANNER`; `app.js` draws it): the update layer (the updater's six messages) and the notice layer (a drop's notice, launch errors, `SAVE ERROR`; 8 s, its own ✕). A notice takes the slot; the update message is kept, updated behind it (text, percentage, button state) and drawn again when the notice ends; a timed update message starts its timer when drawn. A notice ending never calls `dismiss-update`. Notice text and ✕ in `--text` (`#update-banner.notice`); the ✕ of both layers has title and `aria-label` `Dismiss`. `showUpdateBanner`/`hideUpdateBanner` are gone; `region.js` calls `showNotice`.
- **C6 (m-8).** `body.manager #header::after { display: none; }` in `manager.css`.
- **Region tagline (offer 1).** Exactly Judy's two rules in `region.css`: `body.region #header::after { right: 160px; }` and `body.region #header:has(#filter-chip:not(.hidden))::after { display: none; }`.
- **Try-it (replaces C7).** `scripts/tryit-regions.mjs` prints the rewrite's text verbatim (Start, steps 1 to 8, the real-desktop line, Finish); `--fallback` prints the Futaba-only text (no step, no question). `--print` prints the text and exits (no profile, nothing launched); `test/regions/tryit-text.test.js` lints the printed text against the rewrite's five measures (each lint first seen to fail on the measure's deliberate break).

**Today's behaviour, as asked (C2, "no tile yet").** Before this pass a store-folder shortcut with no tile, dropped, became a reference tile and its row stayed under "files without a tile" (`classify` returns `ref` for a shortcut outside the two desktops; `_addRef` deduplicated only within the region). The self-test's old-build run shows it: `refs: 1`, `taken` absent, the row count unchanged.

**Files (on top of §8.1):** `moves/rules.js`, `moves/mover.js`, `moves/journal.js` (an unwritten intent is not left pending), `regions/controller.js`, `ipc.js`, `updater.js` (counts `dismiss-update` for the test hook), `renderer/banner-layers.js` (new), `app.js`, `region.js`, `index.html`, `styles/base.css`, `styles/region.css`, `styles/manager.css`, `scripts/tryit-regions.mjs`; tests `test/regions/banner-layers.test.js` (new), `tryit-text.test.js` (new), `moves-rules.test.js`, `moves-mover.test.js`, `controller-moves.test.js`, `m3-rulings.test.js`; `scripts/regions-selftest.mjs` (fix-pass section).

**Test hooks added (`--ql-test-hooks` only):** `move-hook` takes `stepFault: { at: 'store' | 'journal', code: 'ENOSPC' | … }` (a Node error thrown at that step); `update-event` (an allow-listed updater or notice channel sent to the primary region's page, as the updater sends it); `update-dismissals` (how often `dismiss-update` ran).

**Measured (2026-10-04, `electron-builder --win nsis --publish never` of this tree, without `clean-dist.js`; its `app.asar` `src/` is identical to the worktree `src/` (`asar extract` + `diff -r`); launches as in §8; Sergei's installed QuickLauncher (4 processes) ran throughout and was left alone; the display stayed one 5120 x 1440 monitor in every run)**

| Run | Result |
|---|---|
| Unit (node:test TAP counts) | 169/169 on Node 26.10 and 169/169 on Electron 32.3.3's Node 20.18.1 (`ELECTRON_RUN_AS_NODE`): §8.1's 128 + 41 new (moves-rules 2, moves-mover 18, controller-moves 6, banner-layers 7, tryit-text 4, m3-rulings 4). |
| Unit, broken-code control (the new tests on `HEAD`'s `src/` and `scripts/`) | Node: 30 fail of 163 (the banner file cannot load: 1 for its 7); Electron's Node: 31. Every finding test fails. The four that pass on the old code are guards, not findings: a failed move leaves the reference tile as it was, references outside the desktops and the store stay per region, a crash after the intent of a conversion aborts it, and the CSS reader's positive control. M-1's ACL repro fails only in Electron's Node: Node 26's recursive `mkdir` passes the denied folder, so there the move itself is refused (Win32 5, "Windows denied access to the file."); the test asserts by runtime. |
| Unit positive control (mutation runner, scratch, copies of `src/`, `test/`, the try-it script and the UX spec) | 86/87 caught; unmutated copy 169/169. §8.1's 51 (five re-anchored to the moved code) and 36 for this pass: C1 ×9 (store step unguarded, journal failure with the folder wording, ENOSPC, file in the way, denied folder unrecognised, OPEN FOLDER unguarded or giving a reason for any error, the drop backstop, an unwritten intent left pending), C2 ×10 (a store file a reference again, the owning tile ignored, a second tile on conversion, the count, the slot correction, list order, the dropped region first, the reconcile of a conversion, the orphan row, the region order), C3 ×3, C4 ×3, C5 ×6 (a notice clears the tray dot, drops the offer, runs the covered timer, progress over a notice, no `Dismiss`, the update colour), C6, the tagline ×2, the try-it ×2. The first run left "an unwritten intent left pending" alive (the mover aborts it anyway); a journal-level test was added and catches it. The survivor is §8.1's equivalent m40. |
| Self-test, attached | 114/114: §8.1's 101 + 13 fix-pass checks (C1 file in the way with OPEN FOLDER, C1 denied ACL, C1 injected faults, C2 ×5, C3, C4, C5, C6 over 101 themes, the region tagline over 101 themes with and without the filter chip). |
| Self-test, `--fallback` | 113/113. |
| Self-test, `--probe` | 53/115: the same 53 pass as in §8.1's probe; all 13 fix-pass checks fail on their wrong input. |
| Self-test against the pre-fix build (scratch copy of `dist/win-unpacked` at `6a1394e`) | 102/114: the 12 finding checks fail; the 13th (a failed move leaves the reference tile) passes, as on the new build. |
| Crash script | crash-add 5/5, crash-back 5/5, restore 4/4, refusal 3/3. |
| Region tagline, before / after (headless harness: the real header markup cut from `index.html` / `manager.html`, the real `base.css`, theme and `region.css` / `manager.css` of `HEAD` and of this tree, the studio's headless browser; painted run as Judy measured it) | Region at 424, chip hidden: tagline under a header button 101/101 → 0/101 (under ⚄ 101 → 0); the least gap to ⚄ after is 9.2 px. Chip shown: under the chip 101/101 → 0/101 (the tagline is not drawn). Manager at 560 and 440: drawn 101/101 → 0/101. The app itself: 0/101 under a button, 0 under the chip, 0 drawn in the Manager. **Nothing else in the header moves:** all 13 header elements' rects, 404 rows (101 themes × region chip/no chip, Manager 560/440), are identical before and after except `twin-peaks`' title, whose 7 s `lodge-pulse` animation moves it by up to 0.07 px; two runs of the same tree differ the same way. |
| C5 notice contrast (headless harness, the real `base.css`, theme and `region.css`; the contrast gate's maths: `--bg` flattened on black, `--update-bg` over it, the computed colour over that) | Notice text and ✕ resolve to `--text` in 101/101 themes; under 4.5:1 0/101 (worst `mordor` 5.62; `cyberpunk` 15.60, `mirrors-edge` 6.61). Before: 48/101 under 4.5:1 (worst `nonary-games` 1.21), the ✕ 3/101 under 3:1 (worst `lovecraft` 2.49). The update layer is unchanged (its ✕ still `--text-dim`). |
| Real Desktop and Public Desktop | Identical from the start of this pass to its end (listings `fix-before.json` → `resume3.json` → `after-fix-runs.json` → `fix-end.json`); every self-test and crash run also checks them before and after; `%USERPROFILE%\QuickLauncher Shortcuts` never created. |
| Foreground | The out-of-process observer in every run: no foreground change went to the build. |

**Deviations (numbered on from §8.1)**
18. **C1, the store step** is the folder's `mkdir` only: the README stays best-effort (a failed README write is logged, the move goes on).
19. **C1, after the move** a journal write that fails is logged and the add stands (the tile is the way back; the next start reconciles the pending intent). A failed intent update in the name-race retry aborts with the journal's reason.
20. **C1, OPEN FOLDER:** a `shell.openPath` error after the folder was made also gets the box, first line alone ("any other error").
21. **C2 scope:** applied to the files a tile owns: desktop shortcuts (they move) and shortcuts at the top of the store folder. Any other reference (an `.exe`, a shortcut elsewhere) keeps today's rule: one tile per region, another region gets its own. Ruled as built (C2 follow-up D2).
22. **C2, matching:** the same path (case-insensitive), or the same file through its folder's real path (the file itself is never opened).
23. **C2, a store file with no tile while moving is unavailable:** the whole drop is refused with one box, `Moving is unavailable. Nothing was changed.` (warning, `OK`), as ADD BACK is disabled then (B5); a plain reference dropped with it is not added. Ruled (D3). Since D3 the same refusal covers deviation 24's case (an older build's reference tile on a store file), which would also make a moved tile; a moved tile taking its own file still moves, as Move to does.
24. **C2, a reference tile on a store file** (an earlier build made those, m-3) with no moved tile: it becomes the file's moved tile (origin from the history); where both exist, the moved tile takes the drop.
25. **C2, a conversion is journalled** (`convert: true`, the reference tile's id); a reconcile after a crash between the move and the commit makes that tile the moved tile in the dropped region. Unit-tested (crash after the move, after the intent), not in the crash script.
26. **C2, the slot:** the page's slot index counts the tile itself when it sits in the dropped region, so the main process places it one earlier in the list without it; + FILE (no slot) puts the taken tile last and clears the filter as for a new tile.
27. **C2, the count at the hover:** built in the main process (+ FILE, and any drop that reaches it). During an OS drag Chromium gives a page the files' count, not their paths, so a region at its cap still shows `FULL` on the hover and the OS refuses that drop. Ruled as built (D1): FULL stays on the hover; a drag is never accepted and then refused.
28. **C4** is measured on the store path as passed to `MoveFileExW` (in test mode the test store, 189 characters); no long-path support was added.
29. **C5, the update layer's own timer** (`SYSTEM IS UP TO DATE` 3 s, the error 6 s) still calls `dismiss-update` when it runs out, as before; the main process already clears the dot on both events. Ruled (D4): `dismiss-update` is called by an update message's ✕ and by its own timer, never when a notice ends. A progress event with no update message (dismissed) does nothing.
30. **Region tagline, `dune`:** in the headless copy at 424 its tagline still starts under the title; in the app (real icon) 0 of 101 themes run under the title. Judy (D5): the app measure stands, nothing to hide.
31. **Self-test theme swaps** poll the link's sheet: in the app Chromium never fired the stylesheet's `load` event on an `href` swap (each theme waited out a 4 s fallback and the run hit the guard's 300 s), and the hidden Manager's timers are throttled.

**C2 follow-up applied (Ender, 2026-10-05; `5522c0c`).** One code change: a drop that would turn an older build's reference tile on a store file into its moved tile is refused while moving is unavailable, like an adoption (D3; deviation 23). The texts and every other behaviour were already as ruled. Three tests added (`moves-mover` 2, `controller-moves` 1: the whole drop refused, the box exactly `Moving is unavailable. Nothing was changed.`, a reference in the same drop not added, the row kept). Measured on this tree, rebuilt (`app.asar` `src/` = the worktree `src/`):

| Run | Result |
|---|---|
| Unit | 172/172 on Node 26.10 and on Electron's Node 20.18.1 |
| The new tests on `HEAD`'s source | all 3 fail; the whole new set: 33 of 166 fail on Node, 34 on Electron's Node |
| Mutation runner | 88/89 caught, unmutated copy 172/172: the unavailable-check mutant re-anchored, and 2 new D3 mutants (an adoption, or an older reference tile's conversion, not refused while moving is unavailable), both caught. The survivor is §8.1's equivalent m40. |
| Self-test, attached | Measured 2026-10-05: attached 114/114, fallback 113/113, probe 53/115; crash script 5/5, 5/5, 4/4, 3/3 (four parts). |

**For Judy: answered.** The three questions (C2 at the cap on the hover, C2's scope, a store file with no tile while moving is unavailable) and deviations 18 to 31 were ruled in the UX spec's "Addendum — M3 fix pass, C2 follow-up" (Judy, 2026-10-05, `5522c0c`): D1 keep FULL on the hover (deviation 27), D2 the rule covers files a tile owns (deviation 21), D3 the whole drop refused with `Moving is unavailable. Nothing was changed.` (deviation 23), D4 the update timer stays (deviation 29), D5 deviations agreed and pending item 12 corrected.

**Pending real input (Futaba's away window; replaces the M3 report's section 8 list)**
1. A real Explorer drag of desktop icons onto a region (U5), first with a throwaway shortcut: the OLE drop, the `Copy` cursor, Explorer leaving the icon while the move takes the file, Explorer not holding the `.lnk` open.
2. A real drag of a Public Desktop icon: the "Needs administrator rights." box.
3. The native `+ FILE` dialog returning a `.lnk` itself, and the B10 clear after it.
4. The native menus and message boxes as pixels (Cancel and Keep defaults, Esc, the icon, the box over the desktop child), **now including** the C1 drop box and the OPEN FOLDER box.
5. Real hover tooltips (now including the banner ✕ `Dismiss`), and the real Manager window as pixels (no tagline).
6. The tray's real Quit, Show/Hide, double-click; the real hotkey.
7. The real uninstaller (Sully's packaged-build test).
8. A real Bitdefender reaction to moving files off the Desktop into the profile root (the C1 folder-denied box is now the likely face of it).
9. A real display or scale change and sleep/resume with pending moves (forbidden unless Sergei says so).
10. **New:** a real Explorer drag out of the store folder (OPEN FOLDER) onto a region (C2: the owning tile moves, no file moves; a file with no tile gets one), and of a desktop icon a reference tile already has (C2: one tile, moved).
11. **New:** a real drag onto a region at its cap of a file its tile already has (deviation 27: `FULL` on the hover today; reachable only once a capped layout exists, M5).
12. **New (C4 measure 4, corrected by D5):** **never launch a `.url`**: it opens the default browser, which is Sergei's signed-in profile. The launch test uses a boundary-length `.lnk` whose target is Notepad or Calculator (made with WScript), moved and then launched in an away window (the launched app takes the focus). A `.url` is used only for the refusal side and is never launched.
13. **New:** the banner's two layers on screen with a real update offer from a real feed (the self-test drives them through `update-event`), and the notice's 8 s as seen.
(The old item 10, the try-it's M3 steps a to e, is gone: the try-it now asks only feel questions.)

### 8.3 F-2 fix: fallback regions blank and inert (Ender, 2026-10-05)

Futaba's away window (QA report 2026-10-05, F-2, on `3467e5c`): with `--ql-no-desktop-layer` the regions were top-level, visible to `IsWindowVisible` and took the foreground on a click, but the screen showed only the wallpaper, `PrintWindow(PW_RENDERFULLCONTENT)` returned a blank bitmap, real mouse and keys reached no DOM event, and `WindowFromPoint` returned the region, so the empty rectangle swallowed desktop clicks. Attached mode worked. Sergei approved the fix on 2026-10-05.

**Root cause (measured).** A fallback region was made visible only through Win32: `detachToTopLevel`'s `SetWindowPos(SWP_SHOWWINDOW)`, and on Show all `showTopLevelAtBottom` (fallback) or `ShowWindow(SW_SHOWNA)` (attached). Electron's `show` / `showInactive` was never called on it, so Chromium still treated the widget as hidden. Its compositor made no frames, and native mouse messages never reached the page. Windows, though, hit-tested the visible HWND. Attached mode worked only because `_attachOnce` calls `win.showInactive()`. Measured on the packaged `HEAD` build (`323f537`) by a scratch probe through the QA guard, region 1 in fallback:

| | `HEAD` | Same build, `win.showInactive()` after the Win32 show |
|---|---|---|
| `PrintWindow(PW_RENDERFULLCONTENT)` of the 654 x 468 window | 1 colour, every pixel `0xFF000000` | 2047 colours, 94% non-black |
| `requestAnimationFrame` callbacks in 500 ms | 2 | 62 |
| `document.visibilityState` | `visible` (the page does not know) | `visible` |
| A posted `WM_MOUSEMOVE` (2 moves) | no DOM event | `mouseover`, `pointermove` and `mousemove`, all `isTrusted` |
| `--disable-features=CalculateNativeWinOcclusion` (self-test runs below) | still 1 colour and no event, in all 8 regions | (as above) |

The same gap had a second, latent face in **attached** mode. `_attachOnce` skips `showInactive` for a hidden region, so a region whose window was rebuilt or created while all regions were hidden (an Explorer restart under Ctrl+Space) got 0 trusted moves after Show all (probe and self-test on `HEAD`).

**Fix (`src/main/desktop/region-host.js`, no behaviour change).** `RegionHost._showToChromium()` calls `win.showInactive()` (unless the region is hidden) right after every Win32 show: the fallback show in `_goFallback`, and Show all (`setHidden(false)`) in both modes. The window is then already visible in its slot. An instrumented scratch copy read the z-order and the foreground right before and right after each call. The count of windows above the region was 699 → 699 and 703 → 703, and the foreground never changed. No foreground change went to the build in any run below. Nothing else changed: z-slot, styles, activation, Option A and the Win+D behaviour are as before.

**Gate that sees the window (`scripts/regions-selftest.mjs`, `f2Checks`, after the rebuild check).** The old fallback checks read only the page and `describe`, so they passed on a blank window. Three checks were added:
- **F-2 pixels (fallback only):** every region window's own content, read through `PrintWindow(PW_RENDERFULLCONTENT)` from the test process (per-monitor DPI aware, physical px), has 16+ colours and 10%+ non-black pixels. A never-painted window is one flat colour. Not in attached mode: a desktop child gives `PrintWindow` what lies behind it, so `HEAD`'s inert attached region also showed thousands of colours.
- **F-2 input (both modes):** two `WM_MOUSEMOVE` are posted (`PostMessageW`) to every region window at a spot with no control or tooltip, and the page must log a trusted `pointermove`. This is not OS input: no cursor move, no activation, nothing reaches another window.
- **F-2 rebuilt while hidden (both modes):** Hide all; region 1's window is closed (the rebuild path); Show all. The region must be visible, paint (fallback) and take the posted move.

**Test-side change:** the `--fallback` run now launches with `--disable-features=CalculateNativeWinOcclusion`. The fixed fallback regions are real shown windows under Sergei's own, and Chromium's occlusion tracking pauses and throttles whichever his windows cover. The first fixed `--fallback` run, without the flag, aborted at the M2b reflow check: a CDP `Runtime.evaluate` timed out on the drag source's page, whose sim waits only on `setTimeout`. Its region 1 capture also showed a flat 6-colour frame. A separate 8-region probe with occlusion on, at another moment, saw all 8 `visible` and painting. So occlusion is the likely cause, not a proven one. The product keeps occlusion tracking. The flag does not hide F-2: `HEAD` stays blank with it.

**Measured (2026-10-05; `electron-builder --win --dir --publish never` of this tree, no npm hook; its `app.asar` `src/` is identical to the worktree `src/` (`asar extract` + `diff -r`); `HEAD`'s build is a scratch copy of the earlier `dist/win-unpacked`, whose `src/` is identical to `HEAD`'s; every launch through `scripts/qa/quicklaunch-safe-launch.mjs` on a profile in the session scratchpad with no hotkey; Sergei's installed QuickLauncher (4 processes) ran throughout and was left alone)**

| Run | Result |
|---|---|
| Unit (node:test TAP counts) | 179/179 on Node 26.10 and on Electron's Node 20.18.1: 172 + 7 new (`test/regions/region-host.test.js`: the real `RegionHost` with `desktop-layer.js` and the window as recording fakes; order of Win32 show and `showInactive` per path; a hidden region never shown). |
| The new unit tests on `HEAD`'s `src/` | 4 of 7 fail: the fallback show, Show all in fallback, Show all in attached after a hidden attach, and the drop from attached to fallback. The 3 guards pass: hidden at start, Hide all, and an attached region shown at start. |
| Unit positive control (scratch copies) | 3/3 mutants caught, one per new call site (2, 1 and 1 tests fail). |
| Self-test, attached, this tree | 116/116 (114 + F-2 input, F-2 rebuilt while hidden). The run before it was 115/116: Sergei saved a new file to his real Desktop during the run (`WhatsApp Image … .jpeg`, created 09:55:23; nothing removed or changed), and the listing check saw it. |
| Self-test, `--fallback`, this tree | 116/116 (113 + the 3 F-2 checks): 8 windows painted (264 to 3220 colours, 87% to 95% lit), 8 × 2 trusted moves, the rebuilt region 2069 colours and 2 moves. |
| Self-test, `--probe`, this tree | 55/117: 62 expected failures, as many as in §8.2's 53/115 (the count was compared, not the list); the 2 F-2 checks run attached and pass. The probe injects no F-2 fault: the runs on `HEAD`'s build below are those checks' negative control. |
| **The new self-test on `HEAD`'s build** | `--fallback` **113/116**: exactly the 3 F-2 checks fail (all 8 windows 1 colour, 0% lit; 0 trusted moves in all 8; the rebuilt region likewise); the old 113 pass. Attached **115/116**: F-2 rebuilt while hidden fails (0 trusted moves); the 8 shown regions take the move. |
| Crash script, this tree | crash-add 5/5, crash-back 5/5, restore 4/4, refusal 3/3. The first crash-back run was 4/5: in `back:committed` the guard printed `ended by exited` without `(code 70)`. Its loop saw the tree gone before Node's `exit` event, so the exit code was read as null. The state left by the crash was right and the rerun was 5/5. That race is in the guard, not the app. |
| Real Desktop and Public Desktop | Listed at the start and the end of this pass, and in every self-test and crash run. The only change is Sergei's own new file (above). `%USERPROFILE%\QuickLauncher Shortcuts` was never created. |
| Foreground | The out-of-process observer ran in every run: no foreground change went to the build (the probe's one is its injected event). |

**Question, not changed: Win+D (Futaba: FAIL vs spec).** This is not F-2's cause; it is about z-order, not painting. Fallback regions are created `minimizable: false` and `skipTaskbar: true`, and `detachToTopLevel` sets `WS_EX_TOOLWINDOW`, so Show Desktop leaves them up. §7.3's "Win+D minimises it" (Option A) was written from reading and never measured. It was wrong for these windows. Which bit decides was not measured either: Win+D is OS input and was not sent. Making them minimise would change the window's kind (a taskbar button or an Alt+Tab entry, or extra handling of the shell's show-desktop). That is a behaviour change, so the decision is for Judy and Sergei: amend the spec to "fallback regions stay up on Win+D", or ask for a change.

**Ruled (Sergei, 2026-10-05): fallback regions stay up on Win+D.** The app does not change; the spec does (UX spec, "Addendum — Win+D ruling, fallback mode", `12706f8`), and so do § 1.2 and § 7.3 option A here. Which window bit makes Show Desktop leave them up is still not measured (Win+D is OS input).

**Pending real input (Futaba's next away window):**
1. A real click on a fallback region: it activates, the first click is not swallowed (Chromium answers `MA_ACTIVATE`, §7.2), then a typed letter filters, and Ctrl+Right and F6 work. Keys were not sent: a posted key needs the window activated, which this pass never does.
2. Real hover and `:hover` under the real cursor. The posted move proves Chromium's own message path into the page, not Windows' hit test with a real cursor.
3. The regions on screen as Sergei sees them. `PrintWindow` reads DWM's copy of the window, not the composed screen. This also covers a region uncovered after other windows covered it (Chromium's occlusion repaint, off in the self-test).
4. Click-to-raise, and Win+D: fallback regions stay up (ruled 2026-10-05).
5. Attached: a region rebuilt while hidden (Explorer restart under Ctrl+Space), shown by the real hotkey, paints and takes a click.

**Files:** `src/main/desktop/region-host.js`, `test/regions/region-host.test.js` (new), `scripts/regions-selftest.mjs` (Win32 pixel and posted-move helpers, `f2Checks`, the fallback launch flag), and this document (this section, and the C2 follow-up row in §8.2).

### 8.4 M3: moved tiles drawn plain in a window built fresh (Ender, 2026-10-06; fix approved by Sergei)

app.js's first render can run before `region.js` has defined `qlDecorateTile`: `init` awaits the items while the page is still loading scripts. A region window built fresh (start-up, an Explorer restart) then drew a moved tile as a plain one. In view mode it had no `data-kind="moved"` (and a broken tile no pip). Edit mode re-renders, so ↩ came back there. The empty-cell variant of the same race was fixed in M4 (§ 9). Fix: at the end of `region.js`, once its hooks exist, one more `renderGrid()` if the grid already holds tiles. Self-test check "M3 race" (`raceChecks`): a `.url` written to the fake desktop is dropped into a region and moves in; that region's window is rebuilt as an Explorer restart rebuilds it, and its tile must read as moved, with ↩ in edit mode. Fails on `HEAD`'s build and on the M4 build without the fix (`kind` null), passes with it; `--probe` turns it red.

**Files (B):** `src/renderer/region.js` (the last hunk only: the comment and `if (document.querySelector('#app-grid .app-tile')) renderGrid();`), `scripts/regions-selftest.mjs` (the `raceChecks` function and its call after `m4Checks`), this section.

---

## 9. M4 as built: Column and Row (Ender, 2026-10-05)

**Scope:** the § 4 M4 row. A region switches to Column or Row (region menu Layout, the Manager's layout select), and new Column and Row regions come from the tray's New region and the Manager's + NEW REGION ▾. Size follows content and stops at 90% of the work area, then the list scrolls. Column has the compact header and the edit cluster bar; Row has the leading cell with EDIT and the cluster. A switch keeps the top-left anchor and finds room. Grid remembers its size (`gridSize`, § 2.1). Gallery shots of all 101 themes in both. No data-format change beyond § 2.1: `gridSize` was already in the shape and kept by `model.js` since M1; it is now written. Not in M4: Fan and Ring (M5). The fullscreen code on this branch is untouched (merge-time matter).

**How it works**
- `src/main/regions/layouts.js` (new, pure): the spec formulas. Column is `max(180, S + 68)` wide and `40 + 32 + n (S + 32) + (n - 1) 8` high (+ 38 edit bar, + 38 notice slot). Row is `S + 64` high and `96 + 16 + n (S + 32) + (n - 1) 8 + 20` wide; n counts from 1, so an empty region keeps one cell. The cap is `floor(0.9 x` the work-area length on the growth axis. `boxAt` keeps the anchor and stops the length at the cap and at the room.
- `placement.roomAlong` (new, additive): the free length below (Column) or to the right (Row) before the margin or the 12 px gap to a region in the way.
- Controller: a Column or Row box is its anchor plus the size its items want. It follows the item count (`_pushItems`, page saves, the read-only merge), the icon size (`broadcastSettingsChanged`) and the page's edit bar and notice slot (`region:extras`). It never moves for growth; past the room the list scrolls. Nothing is saved for growth (home rule, § 1.4). Start-up and display changes fit the same wanted boxes through M2's `relayout`. A Column or Row may shorten there to one cell, never narrower. A larger icon size that makes the fixed side cross a neighbour moves the box by the smallest step that fits.
- `setLayout`: keeps the top-left of the shown rect. Grid comes back at `gridSize` (default 424 x 300); Column and Row at their wanted size, up to 90%. If that box leaves the area or meets a region, it moves by `findFree` in 12 px rings. With no room anywhere: one box `No room for this layout. Move the region first.` and nothing changes. Otherwise layout, rect, work area and (leaving Grid) `gridSize` are saved at once, and the page hears its layout through `region:state`.
- The page: the layout rides in the window URL (`&layout=`), so the first frame is right. `region.js` switches `body.layout-*`. `region.css` lays out Column (header `[icon][name][⋯]`, no tag or banner, field x 16 to W - 20, rows of S + 32, the 38 px cluster bar, a one-line notice slot) and Row (the 96 px leading cell, the tile line, EDIT and the cluster laid over the cell, the notice in the name line for 5 s, wheel and Shift+wheel scroll sideways). An empty Column or Row draws one dashed cell, which is the landing slot during a drop preview (A2, M4). Column takes Up/Down only and Row Left/Right only, Ctrl+Arrow likewise (A5, M4). `app.js` got one hook (`qlAfterRender` at the end of `renderGrid`).

**Bug found and fixed in this pass:** app.js's first render can come before `region.js` has run: its `init` awaits the items while the page is still loading scripts. An empty Column or Row loaded fresh (start-up, rebuild, a new region) then had no empty cell. The gallery's empty runs found it (0/101); a self-test check then saw it in the app (0 cells after a rebuild, `dist-m4b`). `region.js` now draws the cell once at load if the grid is already empty.

**Files**

| Area | Files |
|---|---|
| Main, new | `src/main/regions/layouts.js` |
| Main, changed | `regions/controller.js` (sizing, refit, `setLayout`, Layout submenu, + NEW REGION menu, `describe` fields), `regions/model.js` (Column and Row built; the refusal string), `regions/placement.js` (`roomAlong`), `ipc.js` (`region:extras`, `manager:new-region-menu`, `layout` in `manager:update-region`), `preload.js`, `manager-preload.js` (`manager:created`), `tray.js` (New region: Grid, Column, Row) |
| Renderer | `region.js`, `app.js` (one hook), `index.html` (the cluster, the short EDIT label, the Row notice line), `styles/region.css` (Column and Row), `manager.js` (layout select, + NEW REGION menu), `manager.html` (`+ NEW REGION ▾`) |
| Tests | `test/regions/layouts.test.js`, `test/regions/controller-layouts.test.js` (new); `scripts/regions-selftest.mjs` (M4 section) |

**Test hooks:** none new. `describe` adds `layout`, `gridSize` and `extras`; the + NEW REGION menu is recorded like the region menus (kind `new-region`) under `--ql-test-hooks`.

**Measured (2026-10-05; `electron-builder --win --dir --publish never` into the session scratchpad, no npm hook; its `app.asar` `src/` equals the worktree `src/`, 137 files, compared with CRLF normalised; every launch through `scripts/qa/quicklaunch-safe-launch.mjs` on a scratch profile with no hotkey; Sergei's installed QuickLauncher (4 processes) ran throughout and was left alone)**

| Run | Result |
|---|---|
| Unit (node:test) | 208/208 on Node 26.10 and on Electron's Node 20.18.1: 179 + 29 new (`layouts` 7, `controller-layouts` 22). |
| The new tests on `HEAD`'s `src/` | `layouts.test.js` cannot load (no module): 7 fail. `controller-layouts`: 21 of 22 fail; the display-change round-trip passes (a guard: HEAD already restores saved rects). |
| Unit positive control (scratch mutation runner, copies of `src/`, `test/`, `scripts/`, `Docs/`) | 35/35 mutants caught; unmutated copy 208/208. The first round left "a display change shrinks a Column below one cell" alive; the cramped-display test was added and catches it. Mutants: the five formula constants and the minimum width, room, keep, the icon-size default, the 12 px gap and the straddle rule in `roomAlong`, the switch (anchor, no search, 24 px search, `gridSize` not saved or not used, rect not saved, no refusal box, page not told), refit (items, page save, icon size, start-up room pass, neighbours ignored, refit saving), extras, create sizes, the Layout submenu (missing, wrong check), the URL layout, + NEW REGION (Manager not told, enabled at the cap), Row not built, Fan offered. |
| Self-test, attached | 131/131: 116 from § 8.3 + 15 M4 checks. |
| Self-test, `--fallback` | 132/132 (+ M4 F-2 pixels: the Column and Row windows paint, 1673 and 3806 colours); the observer saw 0 foreground changes to the build. |
| Self-test, `--probe` | 55/132: the 62 known reds of § 8.3 and all 15 M4 checks, each on its wrong input. |
| The new self-test on `HEAD`'s build (`dist/win-unpacked`, `src/` equal to `HEAD`'s) | 116/131: exactly the 15 M4 checks fail. |
| The page-load check on the pre-fix M4 build | 130/131: only that check fails (0 empty cells after a rebuild). |
| Crash script | crash-add 5/5, crash-back 5/5, restore 4/4, refusal 3/3. |
| Gallery (scratch region gallery, below) | 101/101 themes in every run; guards clean (no IPC outside the list, no sockets, registry unchanged, 0 processes left). Across 101 themes: 0 overlapping interactive rects, 0 controls outside the window, 0 cut names, 0 empty-cell overflow, 0 header or edit-bar tags drawn, in every state. |
| Real Desktop and Public Desktop | Identical at the start of this pass, at the resume, and at the end (`SHGetKnownFolderPath`, `readdir` + `lstat`); every self-test and crash run also checks them before and after; `%USERPROFILE%\QuickLauncher Shortcuts` never created. |

**Gallery.** The repo's `scripts/theme-gallery` predates regions: its Settings state clicks a button that now opens the Manager, and it does not know the region channels. The shots came from a scratch copy of it (same isolation guards) that loads the region page with a mocked `region:info` and renders `view`, `hover` and `edit`. Runs: Column 6 tiles (180 x 688, view and hover; edit at 180 x 726), Row 5 tiles (644 x 128, view, hover, edit), empty Column (180 x 168 view; edit at 180 x 206), empty Row (228 x 128, view and edit). Each run has PNGs per theme, contact sheets and a manifest with the measures above. It is not in the repo; landing it is a question for Jane.

**Self-test seen red once each, not M4:** "boot: region 1 is a fallback window / on the desktop layer" read `pending` in 1 of 3 fallback runs and in 1 of 2 runs of `HEAD`'s own build. The check reads the mode once, right after the page appears. A read-once race in the test; the reruns passed.

**Deviations (numbered on from § 8.2; each is the most conservative reading where the spec is silent; the Judy questions name them)**
32. **Growth with no room** stays at the fixed corner up to the room and the list scrolls (2.3's edit-bar rule applied to items); the region never moves for growth.
33. **90%** is `floor(0.9 x` the work-area length); the last tile may show in part.
34. **Column's edit bar** holds the cluster only, no `EDIT` label (2.3, 5.6; 9.3 says `EDIT` for every layout but Grid).
35. **The theme's edit-bar tag** (`#edit-bar::after`, all 101 themes) is hidden in Column, as the header tag is; Row has no bar.
36. **Column header with the filter:** the name ellipsizes first, then the chip; ✕ 24 x 24 (9.1).
37. **Row filter chip:** takes the name's line (84 x 26, in flow) and the handle shrinks to the icon while it shows (spec 10: no shared rects); hidden in edit mode (the filter stays on).
38. **Row name:** the theme's title style at 12 px (weight, spacing, colour, glow kept), 18 px line.
39. **Row notices:** the name line for 5 s (2.4, 7.5) in `--text` (C5's contrast ruling), not `--accent-m` (7.5).
40. **Row rename in edit mode:** the field takes the name's line; EDIT and the cluster step aside while it is open.
41. **Column notice slot:** one line; the message ellipsizes, its buttons stay.
42. **Empty cell:** the Grid hint's tokens (1 px dashed `--drop-hint-border`, `--text-dim`, `--drop-icon-color`, `--hint-sub-color`); ⊕ 28 px, `DROP HERE` 11 px / 2 px spacing, `or right-click` 12 px / 1 px, which may wrap after "or" (seen in `star-wars-separatist`); shown in view and edit mode.
43. **A layout switch saves** rect, work area and `gridSize`. A refusal is an info box (as the tray's no-room box), over the Manager when it came from there.
44. **+ NEW REGION ▾** is a native menu of Grid, Column, Row under the button; the label gained `▾` (8.1 draws `v`).
45. **Region menu Layout:** radio items Grid, Column, Row; Fan and Ring are not listed until M5.
46. **Display change:** Column and Row may shorten to one cell (they scroll), as Grid may shrink; their fixed side is kept.
47. **Cells are exact `S + 32` boxes** in Column (rows) and Row (columns), so the window formula holds to the pixel; at S = 64 a tile is 96 high there, 95.4 in Grid.
48. **Row's Tab order** (7.4: ⋯, tiles, cluster): the edit bar stays after the tiles in the page and is laid over the cell.
49. **Row header borders:** `border-right: 1px var(--border)` replaces the theme's own header border-bottom/top (9 themes style it); their header shadow is kept.
50. **Cluster glyphs** 13 px; button border and hover as every other button.
51. **A tile or file dragged over a Column or Row** does not grow the window for the slot; the list scrolls during the preview.

**For Judy:** questions 1 to 18 in the M4 report (deviations 32 to 51, plus the theme art that makes 3 to 5 themes scroll, below).

**Found, not changed**
- **Theme art scrolls the list:** `alien`, `ghost-shell`, `lcars`, `dead-space` and `half-life` draw tile-field art (`#grid-container::before/::after`) larger than the field (160% boxes at -30%, text blocks), so the field gets a scrollbar in Column (3 themes) and Row (4 to 5) with room to spare. A theme matter; for Judy.
- **M3 race, same cause as the bug above:** `qlDecorateTile` (↩ on moved tiles, the broken state) can miss app.js's first render the same way; the tile then shows ✕ until the next render. Not seen in a run; for Jane (a one-line `renderGrid()` at the end of `region.js` would cover both).

**Pending real input**
1. Real wheel and Shift+wheel over a Row; a real touchpad sideways swipe.
2. Real Tab through a Row in edit mode (⋯, tiles, cluster).
3. A real OS drag of desktop icons onto an empty Column or Row cell (the cell as the slot).
4. The cluster's + opening the real file dialog; ⊞ opening the visible Manager picker.
5. The region menu's Layout submenu and + NEW REGION ▾ as native menus on screen; the refusal box.
6. A layout switch seen on the desktop (the resize and restyle in one step), on the desktop layer and in fallback.
7. A real resolution or scale change with Column and Row regions (forbidden unless Sergei says so).

### 9.1 M4 rulings applied (Ender, 2026-10-06)

Builds Judy's "Addendum — M4 rulings" (UX spec, `792212b`) on top of § 9, uncommitted: her CSS and JS verbatim for the eight changed rulings (2, 5, 7, 8, 10, 11, 17, 18) and her four findings (F1 the Column rename field under ⋯, F2 the Row `EDIT` label's contrast, F3 the accent bar, F4 the scroll thumb). Q14 (Fan and Ring greyed in the menu) stays as built, out until M5, pending Sergei. Not acted on: F5 (a Row primary has no route to DOWNLOAD) and offer 1 (the Grid's art scroll); both are with Sergei. Deviations 32 to 51 are settled by the addendum; § 9's list stands as history.

**What changed**
- `region.css`: the old declarations the addendum names are deleted and her block appended. The tile list (`#app-grid`) is the scroller and the field only clips (Q18). A Column hides its name while the filter chip shows (Q5). The Row name block is 54 px and the name wraps to 2 lines (Q7). A Row notice takes the icon and name block, up to 3 lines (Q8). A Column notice wraps to 2 lines, and the update layer shows only its buttons (Q10). The empty cell's text is `--text` and a Row's sub-line is always 2 lines (Q11). The hover glyph is `--text` (Q17). F1, F2 and F3 as written. The Row filter state keeps its 20 px handle, as the addendum's own filter rects show (icon 21 to 41, chip 49 to 75, ⋯ 83 to 107).
- `region.js`: the scroller is `#app-grid` (`scrollTop` and `scrollLeft` reset on a switch, the Row wheel). `ROW_NOTICE_MS = 8000`. The Row notice carries its full text as its `title`. `app.js` `drawBanner`: the slot's `title` is the update message (empty for a notice or no message).
- `layouts.boxAt`: the peek rule (Q1, Q2), verbatim, with `S` and the extras as a seventh argument from the controller. A stopped list is trimmed so the next tile shows 24 to S DIP, never below one cell. The addendum's vectors all hold (Column 820, 824, 616, 936; Row 2232, 1192, 3071, 1728; Column with the edit bar 758). A sweep of S = 32, 64, 96, 128 and every stop from 400 to 2400 (Column with and without the bars, Row): never longer, at most 87 DIP shorter, a 24-to-S peek except where one cell is the floor. Three § 9 controller tests change by design: a Column stopped at 588 by the region below is now 512, one at a room of 488 at start-up 408, and the edit bar with no room gives 342, not 376.

**Measured (2026-10-06; `electron-builder --win --dir --publish never` into the session scratchpad, no npm hook; launches through the QA launch guard on scratch profiles with no hotkey; Sergei's installed QuickLauncher (4 processes) ran throughout and was left alone)**

| Run | Result |
|---|---|
| Unit (node:test) | 211/211 on Node 26.10 and on Electron's Node 20.18.1 (§ 9's 208 + 3: the vectors, the sweep, nothing trimmed when it fits and never below one cell). |
| The new unit tests on the old code | The mutant "peek: no trim" is exactly § 9's `boxAt`: 5 tests fail on it (the vectors, the sweep, the three retargeted controller tests' values). |
| Mutation runner (scratch copies) | 43/43 caught; unmutated copy 211/211. § 9's 35, plus 8 for the peek: no trim, a 16 DIP sliver, a label-deep cut, landing 16 into the icon, below one cell, the bars ignored in the lead, the Row lead from the field, S and extras not passed by the controller. |
| Self-test, attached | 138/138: § 9's 131 (one check widened: the hit-area test now includes `.region-rename-input`, `#lead-notice` and `#update-text`, in rename and notice states too), 6 new ruling checks (Q18 scroll, Q5 filter, Q7 `Region 8`, Q10 the slot, F1 rename, Q11/F2/F3 colours and bars), and the M3 race check (§ 8.4). |
| Self-test, `--fallback` | 139/139 started from the scratchpad. Started from the worktree, 3 of 3 runs on this build gave 138/139: § 8.3's "F-2 pixels" read region 1's window, rebuilt just before the check, as 1 colour. See the finding below. |
| Self-test, `--probe` | 55/139: the 62 known reds and all 22 new checks (21 M4, 1 race), each on its wrong input. |
| The new self-test on `HEAD`'s build (`dist/win-unpacked`) | 116/138: exactly the 22 new checks fail; the 116 older ones pass. The F1 check first passed on `HEAD` (both test regions stayed Grids, whose field clears ⋯); it now asserts the layout. |
| Crash script | crash-add 5/5, crash-back 5/5, restore 4/4, refusal 3/3. |
| Region gallery (`npm run gallery:regions`, 101 themes, 5 sets, 22 set-states, 2,020 PNGs) | 101/101 in every set. Every measure is 0 in every state: overlaps (rename field, Row notice and banner text included), controls outside the window, the tile list scrolling with 6 or 5 tiles, the field scrolling, the Row name or `Region 8` cut, notices cut, the Column chip's text cut or within 6 DIP of ⋯, the rename field within 6 DIP of ⋯ (Column) or meeting it (Row), the empty cell (overflow, `--text`, 1 line in a Column, 2 in a Row), the Row `EDIT` label (`--text`, no shadow), the header tag, the hover glyph under the pointer (⋯, the cluster's ✓) against `--text`. |
| Gallery negative control (the pre-rulings `region.css`, 10 themes) | Each measure fires: the Column rename near or under ⋯ 10/10, chip text cut 10/10, Row notice cut 10/10, `Region 8` cut 8/10, Row `EDIT` not `--text` 10/10, empty cell 10/10, hover glyph 10/10, the field scrolling (`alien`, `ghost-shell`, `lcars`). |
| Real Desktop and Public Desktop | Identical from the start of this pass to its end. |

**Finding, not changed: F-2 pixels on region 1 in fallback.** The check reads every fallback window right after region 1's window is rebuilt. Region 1 always paints far fewer colours than the other seven (78 to 608 when it passes, against about 2,700). In this pass it read as 1 colour (blank) in all 4 runs on this tree started from the worktree (A only: 5 colours; A and B: 1, 1, 1). It painted in 4 of 4 runs from the scratchpad (101 to 262), and in last pass's three worktree runs (87, 608, 185). The F-2 input check passed for region 1 in every one of these runs, the A-only build failed the same way, and the race fix (§ 8.4) only re-renders tiles, so neither change is the cause. Polling up to 3 s did not show a late first frame (the 3 experimental runs never read it blank). The cause is not found. The check is not widened. For Futaba, with the logs: it looks like the capture's timing or environment against a just-rebuilt window, not F-2's never-shown window, but that is not proven.

**Files (A, on top of § 9's):** `src/main/regions/layouts.js`, `src/main/regions/controller.js`, `src/renderer/styles/region.css`, `src/renderer/region.js` (every hunk except § 8.4's), `src/renderer/app.js`, `test/regions/layouts.test.js`, `test/regions/controller-layouts.test.js`, `scripts/regions-selftest.mjs` (every hunk except § 8.4's), this document (§ 9.1).
