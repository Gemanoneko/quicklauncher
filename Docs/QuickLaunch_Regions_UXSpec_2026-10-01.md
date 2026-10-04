# QuickLaunch regions: UX spec v1 (Judy, 2026-10-01)

Status: complete, uncommitted. For: Ender (build), Futaba (checks), Jane (questions in section 13).
Sergei's rulings of 2026-09-30 are binding and are not reopened here. Anything they do not cover is a numbered question (section 13) with a default stated, so the build is not blocked.

Inputs read: `Team/Research/QuickLaunch_Regions_2026-09-30.md`; the spike note (read from `wip/regions-spike`, commit `bfc5887`); `QuickLaunch_Brief.md`; today's `index.html`, `base.css`, `app.js`, `window.js`, `tray.js`, `index.js`, and the parts of `ipc.js` and `store.js` that add, launch and save shortcuts; the theme foundation spec; and all 101 theme files (scanned read-only, working tree of 2026-10-01, themes are mid-batch).
Method: geometry for Fan and Ring was computed with a scratch script (not product code) and the five layouts were drawn to scale in `QuickLaunch_Regions_Layouts_2026-10-01.svg` (same folder), rendered once through `scripts/qa/headless-browser.mjs` (3 runs, 0 browsers left). No Electron app was launched. No screenshot of real regions exists yet, so every size below is a spec, not a measurement.

Terms: **region** = one desktop-layer window. **Handle** = the part you grab and read the name from (Grid and Column: header bar; Row: leading cell; Fan and Ring: hub). **Chip** = a Fan or Ring tile. **Cluster** = the compact edit buttons. **Primary region** = the first one created. **Active region** = the one that receives keys. **Manager** = one normal window for settings and region management (section 8). **S** = icon size (global setting, 32 to 128, default 64). Sizes are DIP, shown for S = 64 unless stated.

---

## 0. At a glance

| # | Topic | Decision |
|---|---|---|
| 1 | One tile everywhere | Icon over label, as today. Layouts only change where tiles sit. This is what lets the 101 themes work. Fan and Ring tiles are icon-only; the hub shows the name of the tile under the pointer. |
| 2 | Five layouts | Grid (free size, scrolls), Column and Row (size follows content, scroll past 90% of the screen), Fan (max 10), Ring (max 12). Fan and Ring size themselves from the item count. Section 2. |
| 3 | Create / delete | Create from the tray or the Manager, no dialog; named "Region N". Delete asks once, and desktop files always go back before the region goes. The last region cannot be deleted. Section 3. |
| 4 | Move / resize | Drag the handle. Regions never overlap, never leave the work area, and snap to edges and to each other with a 12 px gap. Only Grid resizes by hand. Section 4. |
| 5 | The move | Only shortcut files (`.lnk`, maybe `.url`) that sit in a Desktop folder are moved; an `.exe` is not. Everything else is added by reference, as today. Tiles appear only after the move succeeded. Nothing is ever deleted. Section 5. |
| 6 | Themes | One tile design, so every theme works in every layout. Fan and Ring lose the panel, header, banner and particle layers (palette, fonts and tile effects stay). 18 themes lose their window shape, 5 lose banner art, 3 need an opaque hub. Quotes show only in Grid regions. Section 6. |
| 7 | Match all | A switch in the Manager (and in each region menu). On: every region shows the shared theme and keeps its own stored theme. Off: each region goes back to its own. Section 6.3. |
| 8 | Tray / hotkey | Hide, show and Ctrl+Space act on all regions. Keys and type-to-filter go to the active region only. **Under windows, a region cannot pop up over them (Q1).** Section 7. |
| 9 | Where the controls live | Settings, the installed-app picker, the cheat-sheet and region management move out of the region into the Manager window, because a 4-item Fan cannot host them and text entry on the desktop layer is unproven. Section 8. |
| 10 | Not in v1 | Section 12. |

**Biggest change for Sergei:** today Ctrl+Space pops the launcher over everything. With regions under windows, that pop-up is gone unless he picks "peek" in Q1. Everything else in the spec works either way.

### Changes to today's window (the Grid region)

| Today | Region |
|---|---|
| Title `QUICK.LAUNCH` plus a version line | Title is the region name, with the region icon before it. The migrated region is named `QUICK.LAUNCH`; the first `.` in any name takes the accent colour, so the look is unchanged. The version line is gone (version stays in Settings). |
| Buttons: random theme, settings, hide, fullscreen | Random theme, settings, hide, **region menu (⋯)**. Fullscreen and F11 are removed. The header keeps 4 buttons in the same slots, so no theme header geometry changes. |
| Settings, skin, installed-app picker, cheat-sheet open as overlays in the window | They open in the Manager. |
| Right-click anywhere = edit mode | Same, except right-click on the handle = region menu. |
| Native frame resize and drag | Drag the header; resize from the edges (Grid only). |
| Taskbar button, covers other windows, Win+D hides it | No taskbar button, not in Alt+Tab, under all windows, Win+D does not hide it. |
| Ambient animations pause while the window is unfocused | They pause while the pointer is outside the region and it has no keyboard focus. Regions are always on screen, so this keeps the CPU rule from the 2026-09-28 incident. |

---

## 1. Model

**Region** = `{ id, name, icon, layout, theme, items[], bounds or anchor, fanDirection }`. An item belongs to exactly one region. Order of `items[]` is the display order in every layout.

- **Region icon:** one of 16 built-in glyphs (Apps, Games, Tools, Web, Media, Music, Photos, Files, Work, Code, Chat, Mail, Star, Home, Terminal, Folder), drawn in `--accent-text`. Default Apps. Q7.
- **Region cap:** 8 regions (each is a window and a renderer). Ender may lower it after measuring memory with 8 open.
- **Last region:** cannot be deleted.
- **Primary region** supplies the Manager's theme and shows the update banner (when its layout has a banner slot).
- **Migration:** today's `apps[]` becomes the items of one Grid region named `QUICK.LAUNCH`, at today's saved position and size, with today's theme. Existing data loses nothing.
- **State lives in the main process.** An Explorer restart destroys the windows (spike). The windows come back in about 1 s at the same place, in view mode, with edit mode and any typed filter reset. The entrance fade plays once per app start, never after a rebuild or a layout switch.
- **Windows:** regions are created inactive (they never take focus when they appear), have no taskbar button and are not in Alt+Tab.

---

## 2. The five layouts

### 2.1 Shared rules

**Tile.** Exactly today's tile (6/4 px padding, icon S, label 12 px below). Cell at S = 64 is about 96 x 96. Click launches. Hover, active, focus ring and drag ghost are today's.

**Chip (Fan and Ring).** Icon S inside a hit square **T = S + 12** (76 at S = 64), surface from the theme tokens: `--panel-bg` (alpha floor 0.92), 1 px `--border`, radius `max(--radius, 6px)`. `--app-clip` is not applied to chips. `--tile-icon-shape`, `--tile-icon-fx`, hover and glow tokens apply exactly as on a tile. No label on the chip.

**Hub (Fan and Ring).** A circle, radius 48 (diameter 96), in every theme: `--panel-bg` (alpha floor 0.92), 1 px `--border-h` when the region is active, `--border` otherwise. It is the handle. Contents, top to bottom (centre = 0,0):

| Part | Rect in the hub | Notes |
|---|---|---|
| Region icon | 20 x 20 at y -40 to -20 | `--accent-text` |
| Name | up to 2 lines, 12 px, y -16 to +13, max width 80 | Theme label typography (`--tile-label-*`). Replaced by the name of the hovered or focused chip, by the filter text, by a notice (5 s), or by the rename field. Ellipsis on line 2. |
| Region menu button ⋯ | 24 x 24 at y +18 to +42 | Always visible |

**Hit targets.** All interactive rects are at least 24 x 24. Tiles and chips are at least 44 x 44 (S = 32). Gap between any two tile or chip hit squares: at least 6 px (Grid and Column and Row: 8 px, as today). Remove badge: 24 x 24 at the tile corner (today's rule).

**Labels.** Grid, Column, Row: label under the icon, one line, ellipsis, max width S + 36 (today). Fan, Ring: name in the hub on hover and on keyboard focus; every chip also has `aria-label` = name. Names longer than 2 hub lines get an ellipsis; the full name is in the Manager.

**Handle behaviour (all layouts).** Drag (6 px threshold) moves the region. Right-click opens the region menu. The cursor over the handle is `move`. Tooltip on the handle body: "Drag to move".

**Order.** Item 1 is first in reading order (Grid: left to right, top to bottom; Column: top to bottom; Row: left to right). In Ring and Fan the order runs **clockwise**, starting at 12 o'clock (Ring) or at the end of the arc that comes first in a clockwise sweep (Fan; for a fan opening up, the left end).

**States every layout must draw:** view, hover, keyboard focus, edit mode, filter active, drop target (valid), drop target (rejected), full (Fan and Ring), empty, item broken (file missing), region active.
- **Active region:** border switches from `--border` to `--border-h`. No glow.
- **Broken item:** icon at 60% opacity, a 12 px warning pip at its top-right, click shows "“Name” is missing from the moved-shortcuts folder." with buttons "Remove tile" and "Keep".
- **Drop target (valid):** 2 px `--accent-c` outline on the region box (Fan and Ring: on the box, drawn as 4 corner brackets, since the box is transparent) and a dashed insertion slot at the nearest position.
- **Drop target (rejected):** the same outline in `--accent-m`, hub or banner text "FULL (12 max)" or "NOT A SHORTCUT". Colour is never the only cue; the text always shows.

**Reflow animation:** 120 ms ease when tiles move to make room. Off under reduced motion.

### 2.2 Grid

Today's window, unchanged inside: header 40, tile field with `auto-fill minmax(S + 32, 1fr)`, gap 8, padding 16, 4 px scrollbar with a stable gutter, banner 44, edit bar 38.

```
+--------------------------------------------------+
| [ico] QUICK.LAUNCH            [RND][SET][--][...] |  header 40
+--------------------------------------------------+
|  [icon]      [icon]      [icon]                  |
|  label       label       label                   |
|  [icon]      [icon]      [icon]            |scroll
|  label       label       label             |
+--------------------------------------------------+
| THEME QUOTE LINE                                 |  banner 44
+--------------------------------------------------+
```

- **Size:** free. Default 424 x 300. Minimum 180 x 150. Maximum the work area. Resize from the edges (section 4.3).
- **Count:** 0 to unlimited. Overflow scrolls vertically.
- **Header:** `[region icon 20][name][filter chip]` left; `[RND][SET][HIDE][⋯]` right.
- **Edit mode:** today's edit bar (`// EDIT MODE`, + FILE, + INSTALLED, DONE).
- **Extras kept:** quotes banner, update banner (primary region only), drop hint.

### 2.3 Column

```
+------------------+
| [ico] Games  [...]|  header 40
+------------------+
|     [icon]       |
|     label        |
|     [icon]       |
|     label        |   scrolls
|     [icon]       |   when taller than
|     label        |   90% of the screen
+------------------+
| [+] [app] [ok]   |  edit cluster bar (edit mode only)
+------------------+
```

- **Width:** `max(180, S + 68)` (180 at S = 64). Not resizable.
- **Height:** follows content: `40 + 32 + n x (S + 32) + (n - 1) x 8` = `64 + 104n` at S = 64 (168 for 0 or 1 item, 376 for 3, 688 for 6). Grows downward from a fixed top-left corner. Stops at 90% of the work-area height (for example a 912 high work area, from the spike's 5120 x 1440 at 150%: 7 tiles), then scrolls vertically.
- **Header:** `[icon][name][⋯]`. Name ellipsis. No version, no theme button, no settings, no hide (they are in the region menu). Header art and tag are hidden. 40 px high so every theme's header band still fits.
- **No banner.** Update and launch notices use the 38 px notice slot at the bottom, as the update banner does today (same growth rule as the edit bar below).
- **Edit mode:** a 38 px bar with the cluster (section 5.6) centred. The window grows by 38 if there is room; if not, the list scrolls instead.
- **Count:** 0 to unlimited.

### 2.4 Row

```
+------------+-------------------------------------------------+
|   [ico]    |  [icon]    [icon]    [icon]    [icon]    [icon]  |
|   Work     |  label     label     label     label     label   |  height 128
|   [...]    |                                                  |
+------------+-------------------------------------------------+
   lead 96                                              scrolls sideways
```

- **Height:** `S + 64` (128). Not resizable.
- **Width:** `124 + 104n` at S = 64 (228 for 0 or 1 item, 644 for 5). Grows rightward from a fixed left edge. Stops at 90% of the work-area width (3413 wide: 28 tiles; 1920 wide: 15), then scrolls sideways (wheel and Shift+wheel, 4 px scrollbar at the bottom edge).
- **Leading cell:** 96 wide, full height, theme `#header` look turned vertical: accent bar vertical, `border-right` instead of `border-bottom`. Region icon 20, name (12 px, one line, ellipsis), ⋯ button 24 x 24. Header art hidden.
- **No banner.** Notices replace the name in the leading cell for 5 s.
- **Edit mode:** the leading cell shows `EDIT` and the cluster in place of the name and icon; ⋯ stays.
- **Count:** 0 to unlimited.

### 2.5 Fan

```
            [3]   [4]
        [2]           [5]
     [1]      .------.      [6]
             (  hub   )
              '------'
```
Fan opening up, 6 items. Order clockwise: 1 on the left to 6 on the right.

- **Geometry (direction Up):** pivot = hub centre. Pitch `p = min(180 / (n - 1), 60)` degrees (n = 1: the chip is at the top). Chip k (k = 0 to n-1) is at angle `phi = (k - (n - 1) / 2) x p` from vertical, centre `pivot + R x (sin phi, -cos phi)`. Radius R: section 2.7.
- **Box:** width `max(2 x maxX + T, 96) + 16`; height `(rise + T/2 + 8) + (max(48, T/2 + dip) + 8)`; the pivot is 56 px or more above the bottom edge, because the hub's lower half sits below the flat edge.
- **Direction:** Up (default), Down, Left, Right, set in the region menu (Fan direction). The whole figure rotates about the pivot; order stays clockwise. There is no automatic flip near a screen edge.
- **Anchor on change:** the pivot stays where it is when items are added or removed or the direction changes (a rotation swaps the box width and height around the pivot).
- **Size:** automatic. Not resizable.
- **Count:** 0 to **10**. Beyond that the region is full (Q3).
- **Interactive area:** chips, hub, badges. Everything else in the box is click-through (section 11, U2).

### 2.6 Ring

```
            [1]
       [8]       [2]
     [7]   (hub)   [3]
       [6]       [4]
            [5]
```
Ring with 8 items. Item 1 at 12 o'clock, then clockwise.

- **Geometry:** pitch `360 / n`. Chip k at angle `-90 + k x pitch` degrees, centre `hub centre + R x (cos, sin)`. n = 1: the chip is at 12 o'clock.
- **Box:** square, side `2R + T + 16`. Anchor = hub centre.
- **Size:** automatic. Not resizable.
- **Count:** 0 to **12** (Q3).
- **Interactive area:** as Fan.

### 2.7 Fit tables and radius rule

**Radius rule (Fan and Ring).** `R_floor = 48 + T/2 + 6 + 4` (96 at S = 64). R is the smallest value, in 2 px steps from `R_floor`, such that no two chip hit squares (side T) are closer than 6 px on both axes. Then `R(n) = max(R(n), R(n - 1))`, so adding an item never shrinks the figure. Ender runs this at layout time; the tables are the expected output for S = 64 and the test oracle.

| n | Ring R | Ring box | Fan pitch | Fan R | Fan box (W x H) | Fan pivot from top |
|---|---|---|---|---|---|---|
| 1 | 96 | 284 | 0 | 96 | 112 x 198 | 142 |
| 2 | 96 | 284 | 60 | 96 | 188 x 186 | 130 |
| 3 | 96 | 284 | 60 | 96 | 259 x 198 | 142 |
| 4 | 96 | 284 | 60 | 96 | 284 x 186 | 130 |
| 5 | 96 | 284 | 45 | 116 | 324 x 218 | 162 |
| 6 | 96 | 284 | 36 | 164 | 420 x 258 | 202 |
| 7 | 122 | 336 | 30 | 226 | 544 x 328 | 272 |
| 8 | 122 | 336 | 25.7 | 236 | 564 x 333 | 277 |
| 9 | 158 | 408 | 22.5 | 254 | 600 x 356 | 300 |
| 10 | 164 | 420 | 20 | 310 | 712 x 408 | 352 |
| 11 | 194 | 480 | | | | |
| 12 | 226 | 544 | | | | |

Check values for Futaba (S = 64): Ring n = 8, box 336 x 336, hub centre (168, 168), chip 1 hit square at x 130, y 8, 76 x 76; chip 2 centre at (254, 82). Fan n = 6, box 420 x 258, pivot (210, 202), chip 1 hit square at x 8, y 164, 76 x 76.

At S = 32 the same rule gives Ring n = 12 = 336 and Fan n = 10 = 436 x 272. At S = 128, Ring n = 12 is about 956, which does not fit; the fit rule below caps it.

**Cap.** `cap(layout) = min(10 for Fan or 12 for Ring, largest n whose box fits the work area minus 24 px on each side)`. Adding, dropping or switching layout beyond the cap is refused (Q3).

**Layout summary**

| Layout | Min | Max | Overflow | Resize by hand |
|---|---|---|---|---|
| Grid | 0 | no limit | scrolls vertically | yes |
| Column | 0 | no limit | grows to 90% of height, then scrolls | no |
| Row | 0 | no limit | grows to 90% of width, then scrolls | no |
| Fan | 0 | 10 | none; adding is refused | no |
| Ring | 0 | 12 | none; adding is refused | no |

### 2.8 Empty states

| Layout | What shows |
|---|---|
| Grid | Today's drop hint box, text changed to `DROP SHORTCUTS HERE` and sub-line `Drag them off the desktop, or right-click to add.` |
| Column, Row | One dashed slot (one cell) with the ⊕ glyph and `DROP HERE`; sub-line `or right-click` |
| Fan, Ring | The hub (name "Drop shortcuts here" in place of the region name) plus one dashed slot with ⊕ at the top (12 o'clock), where the first item lands. The region keeps its n = 1 size. |

An empty region never collapses and never disappears.

---

## 3. Region lifecycle

### 3.1 Create

- **Entry points (two):** tray menu "New region" with the five layouts; Manager "+ NEW REGION" with the same five.
- **No dialog.** The region appears at once, inactive, named `Region N` (N = smallest unused number), icon Apps, theme = the primary region's effective theme, layout as chosen.
- **Position:** centre of the work area, then moved in 32 px steps right and down until it overlaps no region (20 steps), then searched outward over the whole work area. If nothing fits: `No room for a new region. Move or delete one.` Grid starts at 424 x 300.
- **Manager:** the new row appears with its name field focused and selected, so typing renames it at once; Enter keeps it.
- At 8 regions both entry points are disabled; the Manager shows `8 regions is the limit.`.

### 3.2 Name and rename

- Rules: 1 to 24 characters, trimmed, unique ignoring case. Errors show in the field with `--accent-m` border and a line below: `Enter a name.` or `That name is used.`
- **Where:** the Manager name field (always works, plain text entry); in edit mode, click the name in the handle (dashed underline, tooltip "Click to rename", same pattern as tile rename today); F2 with the handle focused. Region menu "Rename" enters edit mode and opens the in-handle rename.
- Enter or blur commits, Esc cancels. 

### 3.3 Switch layout

- **Where:** region menu, Layout; or the Manager layout select. Applies at once. Items, order, theme and name are kept; nothing is lost, and switching back restores the previous look (Grid remembers its last size).
- **Anchor:** the figure keeps its anchor (Grid and Column and Row: top-left; Fan: pivot; Ring: centre). Switching from Grid to Ring or Fan puts the new figure's centre (pivot) at the old box centre.
- **If the new box overlaps another region or leaves the work area,** it moves by the smallest step that fits (search outward in 12 px steps). If nowhere fits: `No room for this layout. Move the region first.`
- **If the items do not fit** (Fan over 10, Ring over 12): the switch is refused. In the native menu the item reads `Ring (max 12)` and is disabled. In the Manager the option is disabled with `17 shortcuts. Ring holds 12.`
- A layout with a direction (Fan) starts at Up.

### 3.4 Delete

- **Where:** region menu "Delete region…"; Manager row delete button. Disabled for the last region (tooltip `At least one region is required.`).
- **Confirm:** one native message box, default button Cancel.

```
Delete “Games”?
7 shortcuts move back to the desktop.
5 other shortcuts are removed from QuickLauncher. The apps stay installed.
                                   [Delete region]  [Cancel]
```
Lines with count 0 are left out. An empty region deletes with no box.

- **Order of work:** every moved desktop file is moved back first. If all succeed, the region goes. **If any move fails, the region is kept** with the failed tiles marked broken, and a box says `Couldn't move back 2 shortcuts (Steam, Notes). The region was kept.` plus the reason in the second line. A region that still owns unrestored desktop files cannot disappear.
- Name collisions on the desktop never fail a move: the file comes back as `Name (2).lnk`.
- Items that were added by reference are removed with the region (Q4 asks whether to keep them in another region instead).
- Deleting the primary region promotes the next one.

---

## 4. Placement

### 4.1 Rules

1. **No overlap.** Region boxes (the window box, which for Fan and Ring is the transparent bounding box) never intersect. A Ring's empty centre cannot hold another region.
2. **Inside the work area.** The whole box stays inside the primary display's work area (taskbar excluded) with a 12 px margin.
3. **Gap.** 12 px between visible edges, and between a visible edge and the work-area edge. (Grid has a 6 px invisible resize rim outside its panel, section 4.3; with a 12 px gap two rims touch and never overlap.)
4. **Snap.** While dragging, within 12 px of a work-area edge, another region's edge, or an edge alignment (top, left, right, bottom) the box snaps to the 12 px gap or to the alignment. Hold Alt to move freely (the rules 1 and 2 still hold).
5. **Bump, not push.** Dragging into another region stops at the 12 px gap. Other regions never move.
6. **Cue (no extra windows):** the dragged region's border turns `--accent-c` while snapped and `--accent-m` while blocked.
7. **Keyboard:** with the handle focused, Alt+Arrow moves 8 px, Alt+Shift+Arrow moves 32 px, under the same rules. Region menu "Place" puts the region in a corner (top left, top right, bottom left, bottom right) or the centre, at the first free spot next to it. These give a way to move without dragging.
8. **Tile drags are separate:** dragging a tile never moves the region.

### 4.2 Move

Drag the handle (6 px threshold). Fan and Ring move by the hub. The new position is saved when the drag ends (400 ms debounce, as today).

### 4.3 Resize (Grid only)

- Grid has a 6 px transparent **resize rim** around its panel, so resize zones never sit on the scrollbar, the header buttons or the tiles. Edges 6 px, corners 12 x 12, correct resize cursors. A 12 x 12 grip glyph in `--text-dim` shows in the bottom-right corner while the pointer is over the region.
- Min 180 x 150. Max: up to the work area, stopping 12 px short of a neighbour. Column, Row, Fan and Ring have no resize.
- Resize is the same in view and edit mode. The column count changes live, as today.

### 4.4 Display changes

- **Home layout.** The saved layout is stored as positions relative to the work-area size at the last stable setting. A resolution, DPI or taskbar change re-clamps the regions on screen (smallest move, then the overlap rule, Grid may shrink toward its minimum) **but does not overwrite the saved layout.** When the display comes back, regions go back to their saved places. The saved layout changes only when the user moves or resizes a region. (The spike saw the display flip from 5120 x 1440 to 800 x 600 mid-session; without this rule one such flip would wreck the arrangement.)
- **Explorer restart:** windows rebuild at the same places (about 1 s).
- **Sleep and resume:** same positions; if the work area changed, the display rule applies.
- Single monitor only. A second monitor is ignored.

---

## 5. Shortcuts

### 5.1 Adding, as today

Right-click anywhere in a region except the handle enters edit mode **for that region only** (entering it in another region ends the first). Then, as today: + FILE (file dialog), + INSTALLED (picker), drop, rename by clicking the label, ✕ remove, drag to reorder. In Fan and Ring, + FILE and + INSTALLED are the cluster buttons in the hub (section 5.6). Esc or DONE ends edit mode.

### 5.2 The move off the desktop

- **What is moved:** a shortcut file (`.lnk`; `.url` if Q5 is yes) in the user Desktop folder or the Public Desktop folder (the real folder, which may be inside OneDrive), added by **any** route: dropped from the desktop, dropped from Explorer, chosen in + FILE. **Everything else is added by reference, as today, and nothing moves.** Items remember which kind they are.
- **An `.exe` is never moved** (Q11). It may need the files beside it, and a move could break it. An `.exe` dropped from the desktop becomes a reference tile and stays on the desktop.
- **Accepted types:** `.lnk` and `.exe` as today; `.url` (Steam, web) is Q5. Anything else on a drop bounces back and the drop box shows `NOT A SHORTCUT`.
- **Primary gesture:** drag one or many selected desktop icons onto a region. The nearest slot to the pointer takes the first one; the rest follow in order.
- **Tile appears after the move succeeded.** While files are moving there is no tile. If a move fails, no tile appears and the file stays on the desktop. One failure box per drop lists all failed names (`Couldn't move 2 shortcuts off the desktop (Steam, Notes). They are still on the desktop.` plus the reason). Successes show no message.
- **No admin prompts, ever.** A Public Desktop file that cannot be moved without elevation counts as a failure with the reason `Needs administrator rights.` The file stays where it is.
- **Where files go:** a normal, visible folder (Ender picks the path), never hidden. The Manager has "Open folder".
- **Windows undo is not supported.** The way back is section 5.4.
- **Full region:** a drop on a full Fan or Ring is rejected before anything moves.

### 5.3 Between regions

- Drag a tile out of its region onto another region (view or edit mode). The target shows the valid-drop outline and a dashed slot at the nearest position; the target also shows a translucent copy of the tile under the pointer, because the source window clips its own ghost. Releasing moves the item (no file move: it is already in the store).
- Releasing on a full Fan or Ring, or on empty desktop, **cancels**: the tile stays where it was. Cancel is the default for any drop that is not on a valid target.
- Without dragging: in edit mode, the **tile menu** (right-click a tile, or the Menu key on a focused tile) has "Move to" with the other regions, so any move between regions works with one click or the keyboard. Ctrl+Arrow on a focused tile moves it one place earlier or later inside its region.

### 5.4 Back to the desktop

| Route | What happens |
|---|---|
| Edit mode, badge on a moved tile | The badge is `↩` (not ✕), tooltip "Move back to desktop". One click moves that file back and removes the tile. |
| Edit mode, badge on a reference tile | ✕, tooltip "Remove". Removes the tile; the app or file is untouched (as today). |
| Delete key on a focused tile in edit mode | Same as the badge. |
| Tile menu in edit mode (right-click a tile, or Menu key) | "Move back to desktop" (moved tiles) or "Remove" (reference tiles); also "Rename" and "Move to" (5.3). |
| Drag a tile out of every region and release on the desktop at least 32 px outside all regions | The file moves back and the tile goes. The cue outside every region comes from the drag mechanism (U5). If this gesture cannot be built, the other routes remain. |
| Region menu "Move all shortcuts back to desktop…" | Box: `Move 7 shortcuts back to the desktop?` / `They leave “Games”. Names already on the desktop get a number.` [Move back] [Cancel]. Moves every moved file; reference tiles stay. |
| Manager, Moved shortcuts: "Move all back…" | Same, for all regions. |

- **Restore target:** the folder the file came from. If that folder is gone, the current Desktop folder. Collisions get ` (2)`. Nothing is overwritten.
- **Failure:** the tile stays, marked broken, one box names the failures and the reason.

### 5.5 Safety rules the user can see

1. Nothing is ever deleted: files only move.
2. A tile exists only when its file is in the store folder (or it is a reference).
3. At startup the store and the records are compared. A moved item whose file is gone shows the broken state (2.1). A file in the store folder with no tile is listed in the Manager under Moved shortcuts as "N files without a tile" with "Add back" (it returns to a region) and "Move to desktop".
4. The store folder is never hidden and "Open folder" is always one click in the Manager.
5. If the Desktop folder is inside OneDrive, the Manager's Moved shortcuts section says `Your desktop is synced by OneDrive. Moved shortcuts stop syncing.`
6. Uninstalling must not strand files: the uninstaller moves them back, or names the folder to the user before it finishes (Ender to choose; Sully to verify in the packaged-build test).
7. If the move machinery is unavailable, regions work with references only and drops of desktop files are rejected with `Moving is unavailable. Nothing was changed.`

### 5.6 Edit controls per layout

| Layout | Where | What |
|---|---|---|
| Grid | bottom edit bar, as today | `// EDIT MODE`, + FILE, + INSTALLED, DONE (text buttons) |
| Column | 38 px bar at the bottom | cluster, centred |
| Row | leading cell | `EDIT` label and cluster |
| Fan, Ring | hub | `EDIT` label (y -36 to -22), cluster (y -14 to +10), ⋯ (y +18 to +42) |

**Cluster:** three 24 x 24 icon buttons with 4 px gaps (80 wide): `+` Add a file or shortcut; `⊞` Add an installed app; `✓` Finish editing.

In edit mode every tile shows its badge (24 x 24, top-right). Clicking a name renames it inline. In Fan and Ring, clicking a chip opens its rename field in the hub (the chip has no label of its own); Enter commits, Esc cancels. Edit mode does not launch anything.

---

## 6. Themes

### 6.1 How a theme reaches each layout

Each region is its own window, so each loads its own theme stylesheet plus a layout stylesheet (`body[data-layout]`). No change to the theme files is required.

| Theme layer | Grid | Column | Row | Fan, Ring |
|---|---|---|---|---|
| Palette tokens, fonts, glows, radius | yes | yes | yes | yes |
| Tile look (hover, glow, icon shape, label type) | yes | yes | yes | chip; label type goes to the hub name |
| Window surface (`#app` bg, border, `--app-clip`) | yes | yes | yes | no. Chips and hub use `--panel-bg`, `--border`, `--radius` |
| Header band and title | yes | yes (compact) | vertical leading cell | hub |
| Header art / tag (`#header::after`) | yes (as today, from 424 wide) | hidden | hidden | no |
| Tile-field art (`#grid-container::before/::after`) | yes | yes (margin contract below) | yes | no |
| Quotes banner and banner art | yes | no | no | no |
| Particles, scanlines, overlays (`#particles`, `#app::after`) | yes | yes | yes | no |

- **Margin contract.** The tile field keeps today's 16 px padding and 4 px scrollbar gutter in Grid, Column and Row (the foundation spec's rule: tile field x 16 to W-20 at every size), so art anchored in the margins stays clear of tiles at any width. Column's 180 px is the window minimum the foundation spec already measured layout at. Theme art has not been reviewed at 180 wide, at Row's 128 px height, or without the banner. All 101 go through the gallery in Column and Row before ship (section 14, item 9).
- **Hub label contrast.** Hub and chip use `--text` on `--panel-bg`. The contrast gate checks `--text` on `--bg` only, so the gate must add `--text on --panel-bg` for the hub (4.5:1), at least for new or changed themes.
- **Ambient animation.** Regions animate only while the pointer is over them or they have focus. Tile hover feedback always runs.
- **Quotes.** Banner quotes show only in Grid regions (Q8).

### 6.2 Themes that do not carry over

Scan of the 101 theme files (working tree 2026-10-01). Nothing is blocked from any picker: choice is not reduced. These are the ones that look different in some layouts.

| Group | Themes | What is lost | Layouts |
|---|---|---|---|
| **A. Banner art** (5) | cyberpunk, nonary-games, promise-mascot, siren, yakuza | Their banner art (strip, band or sticker) exists only in the 44 px banner | Column, Row, Fan, Ring |
| **B. Window shape** (18 shaped or rounded `--app-clip`) | blade-runner, cyberpunk, dead-space, deus-ex, ff10, ff14, ff6, ff8, ff9, ghost-shell, mass-effect, shire, warhammer, warhammer-chaos, warhammer-eldar, warhammer-necrons, warhammer-orks, warhammer-tyranids | The cut or rounded silhouette | Fan, Ring (chips are rounded squares). Grid, Column, Row keep it. |
| **C. Translucent panel** (3, alpha 0.82) | ghost-shell, rivendell, wow-scourge | Hub label contrast over a bright wallpaper | Fan, Ring: the 0.92 alpha floor on chip and hub fixes it. |
| **D. Most layers lost in Fan and Ring** (5: a shaped window plus either tile-field art and particles, or header art and banner art) | blade-runner, cyberpunk, deus-ex, ghost-shell, mass-effect | Window shape, field art and particles (cyberpunk: header art and banner art) | Fan, Ring: palette and tile effects only |
| **E. Palette-only already** (1) | stranger-things | Nothing; no layer art | all |

- 66 themes carry art on the tile field, 34 carry header art, 65 carry particles, 72 carry an overlay. In Fan and Ring those layers do not draw. Counting tile-field art, header art, banner art, particles and a shaped window: `stranger-things` has none and 17 themes have one, so they carry over almost unchanged; 78 have two and 5 have three (group D), and those keep their palette, type and tile effects but look plainer.
- **Review before ship:** group D in Fan and Ring, and group A in Column and Row, on the theme gallery. Sergei decides whether a theme that reads as a different theme in Fan or Ring needs a hand-made chip look (a later pass, not v1).
- The scan is in the session scratchpad only; if it is wanted in the repo, say so (it is 60 lines).

### 6.3 Per-region theme and Match all

**State:** each region keeps `theme`. Settings keep `matchAll` (default off) and `sharedTheme`. A region's shown theme is `matchAll ? sharedTheme : region.theme`.

**Where the controls live**

| Control | Home | Also in |
|---|---|---|
| Theme of one region | Manager > Regions, row's theme picker (the searchable SKIN picker as today) | Region menu "Theme…" (opens the Manager at that row) |
| Match all regions (switch) | Manager > Regions, top of the list | Region menu, checkbox "Match all regions" |
| Shared theme | Manager > Regions, shown next to the switch while it is on | |
| Random theme (⚄) | Header button in Grid | Region menu "Random theme" (all layouts) |
| Random theme on startup | Settings and the tray (as today) | |

**What toggling does**

| Action | Result |
|---|---|
| Turn on | `sharedTheme` = the effective theme of the region it was turned on from (Manager: the primary region). All regions show it at once. **Nothing stored is overwritten:** each region keeps its own `theme`. Per-row theme pickers go disabled (dimmed, tooltip in 9.1). |
| Turn off | Each region returns to its own stored theme (Q2). |
| Pick a theme while on | Changes the shared theme for everyone, through the shared picker. |
| Pick a theme while off | Changes that region only. |
| ⚄ while on / off | Randomises the shared theme / that region's theme (not the same as the current one). |
| New region while on / off | Gets no theme of its own at first: it copies the shared theme / the primary region's theme. |
| Random theme on startup is on | At each start a new random theme is picked for every region (one shared theme while Match all is on), each different from its previous one. Unchanged from today in spirit; turning it off keeps each region's theme (Q9). |

The Manager uses the primary region's effective theme. It does not change when the user is in a different region.

---

## 7. Tray, hide, hotkey, keyboard

### 7.1 Tray

Menu, in order: `Show / Hide`, `Regions…` (opens the Manager at Regions), `New region` ▸ (Grid, Column, Row, Fan, Ring), `Settings…` (Manager at Settings), `Start with Windows` ✓, `Random theme on startup` ✓, separator, `Check for Updates`, separator, `Quit QuickLauncher`. Double-click = Show / Hide. Quit ends the process at once, as today, and is the only quit path (no region has a close button).

### 7.2 Hide and show

- ╌ on any region, the tray Show / Hide, and the hotkey all act on **all** regions together. Hidden regions come back at the same places in view mode.
- Hidden state is not saved; regions are shown at every start (always open).
- Launching a shortcut never hides anything.
- Win+D leaves regions visible (spike result 6/6).
- A second launch of the app shows all regions. It does not open the Manager.

### 7.3 Hotkey and active region

- **Hotkey (default Ctrl+Space, rebindable in Settings):** hides all regions if they are shown, shows all if hidden. It does not move key focus: a covered region would take typed keys invisibly. Q1 asks whether the hotkey should instead raise the regions above windows and give the active region key focus (peek).
- **Active region:** the one last clicked, or last made active by the hotkey or F6. One at a time. Its border is `--border-h`. With nothing clicked yet, the primary region.
- **F6 and Shift+F6** cycle the active region (creation order).
- **Keys go to the active region only:** arrows, Enter, Space, Esc, Backspace, F2, Delete, Ctrl+Arrow, type-to-filter.
- **Search (type-to-filter) targets the active region only** (Q6 asks about all regions). The chip is: Grid and Column, in the header; Row, in the leading cell; Fan and Ring, in the hub (the name line shows the text, with a ✕ 24 x 24).
  - Grid, Column, Row: non-matching tiles hide and the rest reflow (today).
  - Fan, Ring: non-matching chips dim to 30% and stop taking clicks; positions never change. Enter launches the first match in order.

### 7.4 Keyboard map

| Key | Action |
|---|---|
| Arrow keys | Grid: 2D as today. Column: Up and Down. Row: Left and Right. Fan, Ring: Left and Up = previous, Right and Down = next, in item order. Ring wraps; Fan does not. |
| Enter, Space | Launch the focused tile |
| Type a letter or digit | Filter (active region) |
| Backspace, Esc | Edit the filter; Esc clears the filter, then ends edit mode, then does nothing |
| Tab, Shift+Tab | Handle ⋯ button, then tiles in order, then the edit cluster |
| F6, Shift+F6 | Next, previous region |
| Menu key, Shift+F10 | Region menu (when the handle or ⋯ has focus) |
| F2 | Rename: the focused tile in edit mode, or the region when its handle has focus |
| Delete | In edit mode, the focused tile's badge action |
| Ctrl+Arrow | In edit mode, move the focused tile one place |
| Alt+Arrow, Alt+Shift+Arrow | With the handle focused: nudge the region 8 or 32 px |
| Alt (held) | While dragging a region: no snapping |
| `?` | Opens the cheat-sheet in the Manager |

Every focusable control has the 2 px `--accent-c` focus ring with 2 px offset (today's tile rule). The handle's ⋯ and the hub's ⋯ are real buttons in the Tab order.

### 7.5 Notices

- **Launch errors** (`TARGET MISSING`, `TARGET UNREADABLE`, `LAUNCH FAILED`, today's words): shown in the region that launched. Grid, Column: the notice slot; Row: the leading cell name line; Fan, Ring: the hub name line. 5 s, `--accent-m`, announced to screen readers.
- **Update banner:** primary region only, if its layout has a notice slot (Grid, Column); otherwise the tray dot and the Settings page show the state.
- **Move failures and refusals** are native message boxes (section 5), never in a region.
- **Success is silent.**

---

## 8. Manager window

A normal top-level window (taskbar button, covers and is covered like any window), today's window chrome and the primary region's theme. Default 560 x 560, minimum 440 x 420, position remembered. ✕ closes only the Manager. Esc closes it unless a field or the picker is open (then it closes that first). The process ends only from the tray.

Two views, switched by tabs at the top: **REGIONS** and **SETTINGS**.

### 8.1 Regions view

```
REGIONS                                         [+ NEW REGION v]
[ ] MATCH ALL REGIONS    shared theme: [ MATRIX          v ]
------------------------------------------------------------------
[ico] [ QUICK.LAUNCH        ] [Grid  v] [ CYBERPUNK  v ]  14   [x]
[ico] [ Games               ] [Ring  v] [ TRON       v ]   7   [x]
------------------------------------------------------------------
MOVED SHORTCUTS   7 moved off the desktop.
[OPEN FOLDER]  [MOVE ALL BACK...]
```

- Row: icon (click opens a 4 x 4 glyph grid), name field, layout select, theme picker, count, delete. Below 520 px the row wraps to two lines.
- With Match all on, each row's theme picker is dimmed and the shared picker beside the switch is the live one.
- Delete uses the confirm in 3.4. Last region: delete disabled.
- Moved shortcuts section: count, OneDrive note (when true), files without a tile (5.5).

### 8.2 Settings view

Today's Settings rows in today's order, minus SKIN (it moved to Regions): ICON SIZE (global, applies to all regions), START WITH WINDOWS, RANDOM THEME ON STARTUP, REDUCE MOTION, GLOBAL SHOW/HIDE HOTKEY, VERSION; footer CHECK FOR UPDATES and CLOSE. The cheat-sheet opens from `?` and from a "KEYBOARD SHORTCUTS" link in this view. The installed-app picker opens here too, titled with its target (`// ADD INSTALLED APP · Games`), and adds to that region.

Scrolling body with a pinned footer, as the foundation spec set for the Settings overlay.

---

## 9. Controls, tooltips and strings

Every new interactive control ships with its tooltip in the same commit (ProcessRules). Native menu items need no tooltip; their labels carry the meaning.

### 9.1 Controls

| Control | Where | Hit rect | Tooltip (also `aria-label`) |
|---|---|---|---|
| Handle body | Header, leading cell, hub | the handle | Drag to move |
| Region menu ⋯ | Header (replaces ⛶), leading cell, hub | 28 x 24 in header; 24 x 24 in cell and hub | Region menu |
| Random theme ⚄ | Grid header | 28 x 24 | Random theme for this region / Random theme for all regions (Match all on) |
| Settings ⚙ | Grid header | 28 x 24 | Settings |
| Hide ╌ | Grid header | 28 x 24 | Hide all regions to tray |
| Resize grip | Grid, bottom-right | 12 x 12 | Drag to resize |
| Cluster + | Column bar, Row cell, hub | 24 x 24 | Add a file or shortcut |
| Cluster ⊞ | same | 24 x 24 | Add an installed app |
| Cluster ✓ | same | 24 x 24 | Finish editing |
| Badge ↩ | Moved tile, edit mode | 24 x 24 | Move back to desktop |
| Badge ✕ | Reference tile, edit mode | 24 x 24 | Remove |
| Region name (edit mode) | Handle | the name text | Click to rename |
| Filter ✕ (Row, Fan, Ring, Column) | Handle | 24 x 24 | Clear filter |
| Manager: + NEW REGION | Regions view | button | Create a region |
| Manager: icon button | Row | 32 x 32 | Choose an icon |
| Manager: name field | Row | field | Region name |
| Manager: layout select | Row | select | Layout |
| Manager: theme picker | Row | field | Theme of this region |
| Manager: theme picker, dimmed | Row, Match all on | field | Match all is on. Turn it off to set this region's theme. |
| Manager: MATCH ALL REGIONS | Regions view | switch | Show one theme in every region. Each region keeps its own theme for when this is off. |
| Manager: shared theme | Regions view | field | Theme shown in every region |
| Manager: delete | Row | 24 x 24 | Delete region |
| Manager: delete, last region | Row | 24 x 24 | At least one region is required. |
| Manager: OPEN FOLDER | Moved shortcuts | button | Open the folder with moved shortcuts |
| Manager: MOVE ALL BACK… | Moved shortcuts | button | Move every moved shortcut back to the desktop |
| Manager: glyph in the icon grid | Icon popover | 32 x 32 | The glyph's name (Apps, Games, ...) |
| Manager: Add back (file without a tile) | Moved shortcuts | button | Add this file to the first region |
| Manager: Move to desktop (file without a tile) | Moved shortcuts | button | Move this file to the desktop |
| Manager: tab REGIONS / SETTINGS | Top | tab | Regions / Settings |

### 9.2 Region menu (native, from the main process)

```
Edit shortcuts
Add file…
Add installed app…
-----------------
Rename
Layout            >  Grid / Column / Row / Fan / Ring (n max)
Fan direction     >  Up / Down / Left / Right        (Fan only)
Place             >  Top left / Top right / Bottom left / Bottom right / Center
Theme…
Random theme
[x] Match all regions
-----------------
Move all shortcuts back to desktop…
Delete region…
-----------------
Settings…
Hide all regions
```

In the menu, "Edit shortcuts" is today's right-click edit mode; "Theme…" and "Settings…" open the Manager.
**Tile menu** (native; edit mode only; right-click a tile, or the Menu key on a focused tile):

```
Rename
Move to           >  {other regions, by name; full Fan or Ring disabled}
Move back to desktop      (moved tiles)   /   Remove      (reference tiles)
```

Outside edit mode, right-click on a tile enters edit mode, as today.

The current layout and direction carry a check. "Ring (max 12)" is disabled when the region holds more than 12; same for Fan (max 10). "Move all shortcuts back to desktop…" is disabled when the region has no moved shortcuts. "Delete region…" is disabled for the last region.

### 9.3 Strings (copy standard applied)

| Where | String |
|---|---|
| Default region name | `Region N` |
| Migrated region name | `QUICK.LAUNCH` |
| Name error | `Enter a name.` / `That name is used.` |
| Region cap | `8 regions is the limit.` |
| Delete confirm | `Delete “{name}”?` / `{n} shortcuts move back to the desktop.` / `{n} other shortcuts are removed from QuickLauncher. The apps stay installed.` / buttons `Delete region`, `Cancel` |
| Delete failed | `Couldn't move back {n} shortcuts ({names}). The region was kept.` + reason |
| Move all back | `Move {n} shortcuts back to the desktop?` / `They leave “{name}”. Names already on the desktop get a number.` / `Move back`, `Cancel` |
| Move failed | `Couldn't move {n} shortcuts off the desktop ({names}). They are still on the desktop.` + reason |
| Reasons | `Needs administrator rights.` `The file is in use.` `The disk refused the move.` |
| Moving unavailable | `Moving is unavailable. Nothing was changed.` |
| Layout refused | `{n} shortcuts. Ring holds 12.` / `No room for this layout. Move the region first.` |
| Drop rejected | `FULL (12 max)` / `FULL (10 max)` / `NOT A SHORTCUT` |
| Broken tile | `“{name}” is missing from the moved-shortcuts folder.` / `Remove tile`, `Keep` |
| Empty (Grid) | `DROP SHORTCUTS HERE` / `Drag them off the desktop, or right-click to add.` |
| Empty (Column, Row) | `DROP HERE` / `or right-click` |
| Empty (Fan, Ring) | `Drop shortcuts here` |
| OneDrive | `Your desktop is synced by OneDrive. Moved shortcuts stop syncing.` |
| Moved shortcuts | `{n} moved off the desktop.` / `{n} files without a tile.` |
| Edit label | `// EDIT MODE` (Grid, as today) / `EDIT` (others) |

---

## 10. Hit areas

Measured, not eyeballed. Futaba measures the rects below with the layout's own DOM in every state, and the rule is: **no two interactive rects intersect, and a resize rim never covers a scrollbar, a button or a tile.**

**States to cover:** view; hover; keyboard focus; edit mode; filter active; rename field open; drag in progress (source, target valid, target rejected); full (Fan, Ring); empty; scrolled (Column, Row, Grid); Manager open over a region; hidden then shown; after a rebuild.

| Layout | Rect pairs to measure |
|---|---|
| All | tile vs tile (gap at least 6; 8 in Grid, Column, Row); badge (24 x 24) vs its neighbours (the badge sits on its own tile; it must not enter a neighbour's hit square) |
| Grid | header buttons vs title area vs filter chip; resize rim vs scrollbar vs header buttons; edit bar buttons vs tiles |
| Column | ⋯ vs name; cluster bar vs list |
| Row | leading cell vs first tile; ⋯ vs name vs icon |
| Fan, Ring | chip vs chip; chip vs hub (gap at least 10 at the floor radius); ⋯ vs name vs icon; cluster buttons vs ⋯ in the edit hub; the transparent box area must hit nothing (click goes to the desktop) |
| Regions | box vs box (gap at least 12); box vs work-area edge (at least 12) |

Expected rects for Ring n = 8 and Fan n = 6 at S = 64 are in section 2.7.

---

## 11. What the spec depends on that is not yet proven

The spike proved: window on the desktop layer, under windows, survives Win+D and an Explorer restart (about 1.1 s), clean exit, at 150%. These were not tested and the UX above assumes them; each has a fallback so the build can start.

| # | Unproven | If it fails |
|---|---|---|
| U1 | **Real keystrokes** reach a desktop-layer region (arrows, type-to-filter, rename, Esc). The spike only fed it synthetic keys. | Keyboard features work after one click on the region; text entry for names stays available in the Manager (the guaranteed path). If keys still do not arrive, type-to-filter and arrows exist only in peek (Q1). **Ender proves this first**, with real typing, before building keyboard features. |
| U2 | **Click-through** of the transparent parts of Fan and Ring, hover still reaching chips, and drag-over being accepted anywhere in the box. | Fan and Ring use a shaped window region (hit area = chips and hub) instead of click-through; the box rule (4.1) is unchanged. |
| U3 | **Moving and resizing by script** (the OS drag region may not work for a child window). | Script-driven move and resize; the pointer rules in section 4 are written for it. |
| U4 | Native context menus and message boxes opened for a desktop child. | Open them parented to nothing, centred on the work area. |
| U5 | **Dragging between regions, onto the desktop, and from desktop icons onto a region.** The source window clips its own ghost; Ender chooses the mechanism. | The tile menu "Move to" already covers region to region (5.3). If dropping on the empty desktop cannot be told from a mis-drop, drop to desktop is removed and only the menu and badge routes remain (5.4). Desktop icons onto a region use the standard file drop. |
| U6 | **Several regions open together** (the spike ran one): memory, CPU and rebuild time at 8. | Lower the region cap. Rebuild order: primary first. |
| U7 | Sleep and resume; a resolution change while running. | Section 4.4 handles the positions. |
| U8 | Moving from the Public Desktop and from a OneDrive-redirected Desktop. | Section 5.2: failure with a reason, the file stays. |

Fallback window mode (`--ql-no-desktop-layer`, from the spike): same UX, but the regions are ordinary tool windows just above the desktop, so Win+D minimises them.

---

## 12. Not in v1

- Collapsing a region to one icon (DeskRipple's model). Regions are always open.
- A second monitor, per-monitor DPI, regions following the monitor.
- Moving native desktop icons out from under a region. A region covers whatever desktop icons are beneath it (they are hidden, not moved or changed). Q10.
- Snapping to the native desktop icon grid.
- Nested or interlocking regions (a region inside a Ring's centre).
- Per-region icon size, per-region hotkey, per-region hide.
- Region profiles, saved layouts, desktop pages, export or import of regions.
- Hand-made Fan and Ring versions of themes (section 6.2).
- Folders, documents, images or other file types as tiles; folder portals or mirrors of a real folder.
- A "copy" mode that leaves the file on the desktop.
- Searching across regions, a global launcher bar (Q6).
- Paging through a full Fan or Ring (Q3).
- Windows Undo for moves (Ctrl+Z in Explorer).
- Lock positions; auto-flip of a Fan near a screen edge; labels shown on Fan and Ring chips.
- A region follows the hotkey by rising above windows (Q1).
- Fullscreen of a region (removed).
- Resizing a Grid without dragging (moving has Place and Alt+Arrow; resizing has no alternative yet).
- Syncing regions between machines.
- Moving `.exe` files off the desktop (Q11).

---

## 13. Questions for Sergei

Each answers in one word. The default is what the spec builds if there is no answer.

1. **Hotkey.** Ctrl+Space today pops the launcher over everything. With regions under windows it can only hide and show them. Should it instead raise all regions above your windows and give them keyboard focus (so you can type to filter), sending them back to the desktop when you launch something or press Esc? **peek** / **toggle** (default toggle).
2. **Match all, switching off.** After Match all, each region goes back to its own earlier theme (**revert**), or keeps the shared theme (**keep**)? Default revert.
3. **Full Fan or Ring.** At the cap (Fan 10, Ring 12) the region refuses more shortcuts. Or should extra ones page through with an arrow in the hub? **block** / **page** (default block).
4. **Deleting a region** removes the shortcuts that were not desktop files (added from the picker or a file dialog). Or move them to the first region? **remove** / **move** (default remove). Desktop files always go back to the desktop.
5. **.url files.** Steam and web shortcuts on the desktop are `.url` files; today only `.exe` and `.lnk` are accepted. Accept `.url`? **yes** / **no** (default yes).
6. **Search.** Typing filters the active region only, or every region at once? **active** / **all** (default active).
7. **Region icon.** Chosen from 16 built-in glyphs, or the icon of the region's first shortcut? **glyphs** / **first** (default glyphs).
8. **Quotes.** The theme quote banner shows only in Grid regions. OK? **ok** / **no** (default ok).
9. **Random theme on startup** re-rolls every region at each start. Or only regions you have not picked a theme for? **all** / **unpicked** (default all, as today).
10. **Desktop icons under a region** stay where they are and are hidden by the region (no nudging aside, unlike DeskRipple). OK? **ok** / **nudge** (default ok).
11. **`.exe` files on the desktop.** A portable program may need the files next to it, so dropping an `.exe` from the desktop adds a tile but leaves the file on the desktop. Move it too? **reference** / **move** (default reference). `.lnk` shortcuts always move.

---

## 14. Done when (Ender builds, Futaba checks)

1. Each of the five layouts renders from the same tile, with the tables in 2.7 matched to the pixel for Ring n = 8 and Fan n = 6 (S = 64), and R never shrinks when n grows (check n = 1 to 12).
2. At the cap, adding, dropping and switching layout are refused with the strings in 9.3 and change nothing.
3. No two interactive rects intersect in any state listed in section 10; resize zones never cover the scrollbar.
4. A drop of N desktop icons on a region moves N files into the store folder and creates N tiles; with one failure injected, N-1 tiles appear, the failed file is still on the desktop and exactly one box names it. Nothing is deleted at any point (verify by listing both folders before and after).
5. Delete region: moved files return to their folder or the Desktop; with one failure injected the region is kept. The last region has delete disabled.
6. Match all on then off restores every region's own theme exactly; a new region copies the right theme in each mode.
7. Explorer restart: regions return at the same places in view mode, items intact, entrance fade not replayed. Resolution flip to 800 x 600 and back restores the saved arrangement.
8. Hide, tray Show / Hide and the hotkey act on all regions; type-to-filter and arrows act on the active region only; F6 cycles. (If U1 fails, report which keys do not arrive; do not claim keyboard support.)
9. Gallery: all 101 themes screenshot in Column, Row, Fan (n = 6) and Ring (n = 8), reviewed by Judy; group D (6.2) reviewed by Sergei. The contrast gate includes `--text on --panel-bg`.
10. Ambient animations are frozen on a region with the pointer outside it and no focus; CPU with 5 regions idle for 60 s is no more than one region's today (measured, not assumed).
11. Every control in 9.1 has its tooltip in the commit that creates it.
12. The packaged build is launched and quit from the tray; the process ends, and regions leave nothing behind (ProcessRules).

## Appendix A. Brief decision-log entries to add when this is approved

| Decision | Chosen | Revisit when |
|---|---|---|
| Regions | Desktop-layer windows, one per region, five layouts, state in the main process | U1 to U8 fail in the build |
| The file move | Move only desktop-folder files; never delete; tile after success; visible store | Any file is reported lost |
| Settings home | One Manager window; regions carry no overlays | Keyboard input into regions is proven and Sergei wants in-region settings |
| Window lifecycle | Regions have no close button; Quit is tray-only, extending the recorded exception | A region is ever reported unhideable |

## Appendix B. Files

- Diagram sheet (true geometry, S = 64): `WIP/QuickLaunch/Docs/QuickLaunch_Regions_Layouts_2026-10-01.svg`.
- Nothing in `src/`, the theme files, the spike branch or git history was touched.

---

## Addendum — M2 rulings (Judy, 2026-10-01)

Status: final, uncommitted. Sergei handed these six points to Judy ("decide what's more beautiful/better"); none needs him. The addendum **replaces** the spec above where they differ: 2.1 (drop target, reflow), 2.8 (empty cells), 5.3 ("translucent copy", "Menu key", "one place"), 7.4 (Menu key, Ctrl+Arrow) and 9.2 (tile menu key).
Inputs: Ender's TechPlan section 6 (HEAD `3939f29`); `region.css`, `region.js`, `tile-order.js`, `base.css`, today's drag and arrow keys in `app.js`; and a scratch run of the contrast gate's own maths over all 101 themes (colours flattened on black, as the gate does; nothing in the repo written). No app was launched. Sizes are DIP.

| # | Point | Ruling | Why |
|---|---|---|---|
| 1 | Slot colour | `--accent-text`, 2 px dashed, no fill | `--accent-c` is under 3:1 in 13 themes; `--accent-text` is 3:1 or more in all 101 |
| 2 | Hint under the slot | Hint hidden for the whole preview, as built | The slot, the outline and the copy already say where; the hint sits under the first slot |
| 3 | The copy | Today's ghost, unchanged | It completes the source's clipped ghost; two looks would split one object |
| 4 | Shift+F10 | Yes, same as the Menu key | The Windows key for a context menu; most laptops have no Menu key |
| 5 | Ctrl+Up / Down | One row (as plain Up / Down), not one place | A vertical key moves vertically; one place would repeat Left and Right |
| 6 | Reflow | Target only, plus the close on leave; today's in-region reorder stays instant | Animating it makes its hit test swap back and forth |

### A1. Slot colour

- **Border `2px dashed var(--accent-text)`; fill `transparent`.** Radius (the tile's `var(--radius)`), `box-shadow: none` and the hidden inner boxes stay as built. Only the colour changes from `--accent-c`.
- **Measured.** `--accent-c` on `--bg` is under the 3:1 non-text floor in 13 themes (lowest `twin-peaks`, 2.02:1). `--accent-text` is 3:1 or more in all 101 (lowest `warhammer-tyranids`, 3.02:1) and differs from `--accent-c` in exactly those 13. The slot is the one cue that says where the tile lands, so it takes the token the gate guarantees.
- **No fill.** An 8% accent tint put the dash under 3:1 against its own inside in 3 themes (lowest 2.91:1).
- **The region outline stays `--accent-c`** (2.1, 4.1.6). In the 13 themes it is under 3:1, but it is the second cue; the slot, the copy and the opened gap are the first.
- **Same size as a tile, to the pixel.** Set the slot's `height` from a real tile's `offsetHeight` when it is made (the width comes from the grid column). Otherwise the slot's 2 px border against the tile's 1 px makes its row 2 px taller and every row below shifts (from the CSS, not measured); in edit mode the renameable label's 1 px border adds a further 1 px to the tiles.
- **M4, M5:** every dashed landing slot uses this token, including the empty-state cell of 2.8 when it takes a drop.

### A2. The empty-region hint

- **Hidden while the preview shows**, as built: `body.region.tile-drop-preview #drop-hint { display: none; }`. No fade.
- It comes back the moment the preview ends and the region is still empty (pointer left, drag cancelled). After a drop the tile is there and the hint stays gone, as today.
- **Why.** The hint is centred over the whole tile field and the first slot is its top-left cell, so they overlap. The hint's job, telling the user how to put something in, is done: they are doing it, and the outline, slot and copy show where.
- **M4, M5:** Column, Row, Fan and Ring have an empty-state cell (2.8). During a preview that cell IS the landing slot: no second slot is drawn, its ⊕ and `DROP HERE` hide, and it takes the A1 border.

### A3. The copy under the pointer

- **Today's drag ghost, unchanged:** `opacity: 0.93`, `transform: scale(1.10) rotate(2deg)`, today's shadow, 1 px `--border-h`, `--panel-bg` surface, `z-index: 9999`, `pointer-events: none`, centred on the pointer, the size of a tile in that region, built from the target's own markup so it wears the target's theme (all as built). Spec 5.3's "translucent copy" means this ghost.
- **Why.** While the pointer crosses the gap between two regions the source still shows the inner part of its own ghost and the target shows the rest. A lighter copy would show one object in two looks; lightening both changes today's in-region drag, which nobody has asked for.
- **It covers the slot when the pointer is on it.** Accepted: the ghost is larger than the slot (1.10), so no dash leaks out, and the outline, the opened gap and the reflow still say where it lands.
- **AA.** The ghost carries its own `--panel-bg` surface, so what lies beneath shows through by 1 - alpha x 0.93: 11% at the default alpha 0.96, and at most 24% in the lowest of the 101 themes (`ac-assassins`, 0.82; 5 themes are under 0.96). That is today's ghost in every theme. It exists only during a drag, is not focusable and not a hit target, and the icon identifies the tile as well as the label; no new contrast claim is made for the label under it.

### A4. Shift+F10

Yes. The Menu key (`ContextMenu`) and Shift+F10 do exactly the same thing:

| Focus | Result |
|---|---|
| A tile, edit mode | Tile menu (9.2) at the tile's bottom-left corner, as built |
| A tile, view mode | As a right-click on a tile does today: this region enters edit mode. Focus is on the same tile afterwards, so the next press opens the menu |
| The handle or ⋯ | Region menu at the ⋯ button's bottom-left, as built |
| A text field | Not ours: the field's own menu, as built |

- **Why.** Shift+F10 is the Windows keyboard route to a context menu and the only one on a keyboard with no Menu key (most laptops). Without it the tile menu, and so "Move to", has no keyboard route there (WCAG 2.1.1; Jakob's Law). 7.4 already pairs the two keys for the region menu.
- The 800 ms skip of the `contextmenu` event the key sends afterwards stays, so one press opens one menu.
- Wording: in 5.3, 5.4 and 9.2 "the Menu key" reads "the Menu key or Shift+F10"; the 7.4 row reads "Region menu (handle or ⋯ focused); tile menu (tile focused, edit mode)". The cheat-sheet row `MENU / SHIFT+F10` stays as built.

### A5. Ctrl+Up and Ctrl+Down

**One row**, as plain Up and Down move the focus:

| Key (edit mode, tile focused) | Grid |
|---|---|
| Ctrl+Left / Ctrl+Right | The tile moves 1 place earlier / later among the visible tiles |
| Ctrl+Up / Ctrl+Down | The tile moves `cols` places earlier / later: the same column, one row up / down |

- `cols` is the count plain Up and Down already use (`computeColumnCount` on the visible tiles). The target place is the current one plus or minus `cols`. **If it falls outside the visible tiles nothing happens: no clamp, no wrap**, exactly like the plain arrows. The tiles in between shift one place.
- In `tile-order.js`, `stepOrder(order, visible, id, delta)` takes the signed place count (1 or `cols`) instead of its sign. The neighbour is `visible[vi + delta]`; the tile goes before it when moving earlier, after it when later. Example: visible `a b c d e`, `a` by +3 gives `b c d a e`.
- With a filter active only the visible tiles count. Focus stays on the moved tile, scrolled into view, and the order is saved after each press (all as built).
- **Announce each move:** `Moved to 4 of 12.` (its place among the visible tiles) in a visually hidden `role="status"` node (`aria-live="polite"`, 1 x 1, clipped, `pointer-events: none`). No visible change. Focus lands on a re-created tile of the same name, which a screen reader may not announce.
- **Why.** Up and Down that only repeat Left and Right would send the tile sideways under a vertical key, and a tile 3 rows down would need about 15 presses at 5 columns. The plain arrows move a row; Ctrl+Arrow is the same step carrying the tile.
- **M4, M5:** Ctrl+Arrow follows each layout's plain-arrow map (7.4). Column: Up and Down move 1, Left and Right do nothing. Row: the reverse. Fan and Ring: Left and Up move -1, Right and Down +1, never wrapping, even in Ring.
- Cheat-sheet row text: `CTRL+ARROWS` / `Move the focused tile; Up and Down move a row (edit mode)`.

### A6. Reflow animation

- **Target only, as built:** 120 ms, `ease`, transform only, off under reduced motion (the setting or the OS).
- **Add the close.** When the pointer leaves the target, the slot goes out through the same reflow, so the gap closes in 120 ms as it opened. A slot that opens smoothly and snaps shut reads as a glitch.
- **On release** no frame between the release and the new tile may show the gap closed. If release now removes the slot before the region's items arrive, keep the slot until they do (`renderGrid` replaces it).
- **On a system cancel** (display change, sleep, Hide all, a window closing, the 2 s no-answer cancel) the slot goes at once, with no animation.
- **Source region:** closes its gap at once when the item leaves, as Delete does today.
- **Today's in-region reorder stays instant, and M2 does not animate it.** It finds the tile under the pointer with `elementFromPoint` while tiles move; tiles sliding under a still pointer would swap back and forth. (The target avoids this with final rects, `rectOf`.) Unifying the two later means moving that hit test to final rects first.
- **Why one place animates and the other does not.** In the target a tile appears from nowhere and everything shifts, so the motion explains where the gap came from. A swap inside one region needs no explanation and its feel already works.

### Checks on the six

- **AA, all 101 themes.** A1 measured above (lowest 3.02:1). A2 removes text. A3 is today's ghost (drag-time only; see its AA note). A4 and A6 add no colour. A5 adds one string for screen readers only; the cheat-sheet row uses the existing, gated `--text`.
- **Nothing covers anything.** The slot is a tile in the grid flow, not an overlay. The hint is removed, not added. The copy is today's drag-time ghost with `pointer-events: none`. The status node is 1 x 1, clipped, `pointer-events: none`. No other element is added.
- **Tooltips.** None of the six adds an interactive control, so no new tooltip. Only the cheat-sheet text of two rows changes (A4, A5).

**Futaba measures** (each seen to fail on a deliberate break first):
1. Slot: computed `border-top-color` equals the resolved `--accent-text` in `twin-peaks` and in the default theme; slot height equals its neighbour tile's, in view and in edit mode.
2. Empty Grid, mid-preview: `#drop-hint` computed `display: none`; after the pointer leaves it is back.
3. The copy's computed `opacity` is 0.93 and its `transform` matches the source ghost's.
4. Shift+F10 and the Menu key: edit mode, the tile menu is recorded once per press; view mode, the region enters edit mode and `document.activeElement` is that tile.
5. 12 tiles, 5 columns: Ctrl+Down on index 2 moves it to 7; on index 8 nothing; Ctrl+Up on index 3 nothing; index 7 up goes to 2. With a filter, only visible tiles count.
6. Within 120 ms of the pointer leaving the target, the moved tiles have a running animation; under reduced motion none; in-region reorder never creates one.

### Fallback focus — recommendation (Judy, 2026-10-01; tech options: TechPlan section 7)

**Option A:** skip `SetParent(hwnd, NULL)` on a window that is already top-level (`detachToTopLevel` and `releaseFromShell`). B stays in reserve. This is also Ender's stated preference in section 7; the build details below are Judy's.

**Why.** The fallback contract is "same UX" (section 11): a region never takes focus when it appears (section 1) and keys work after one click (U1). A meets both: Ender measured zero foreground events and zero `WM_ACTIVATE` over boot, 7 creates, a rebuild, a delete and quit, and a click activates the window as it does any window. B only adds cover against a Windows hand-over that no run showed, in a mode that runs only when the desktop layer has failed; it costs a worse failure (if Windows refuses our `SetForegroundWindow` after a click, the region gets no keys and flashes) and cannot be proven without a real click. C drops filter typing, tile keys, Menu key and header rename, which breaks "same UX".

**Ender builds:**
1. **Gate = the out-of-process foreground observer, not the 500 ms sampler.** No region window takes the foreground at create, rebuild, delete, quit, or the drop to fallback after 10 s. The check must be seen to fail on the stock code first (it did in launches 1 and 2). The desktop-child to top-level path (drop to fallback, quit from the desktop layer) is Ender's risk 2: A is not done until the observer shows it clean there too.
2. **The first click does its normal job and also activates.** A tile click launches, a header press starts a move, ⋯ opens the menu, a right-click enters edit mode. No click-to-focus step, and the first click is never swallowed (keep Chromium's `MA_ACTIVATE`).
3. **On activation** the region becomes the active region (7.3): border `--border-h`, no glow. No tile focus ring and no filter chip appear on activation (the ring is keyboard-only, `:focus-visible`). The first arrow key then focuses tile 1 and shows the ring (today's `moveTileFocus`); the first Tab goes to the handle's ⋯ (7.4); a typed letter filters this region.
4. A click raising the region above windows it overlaps, and Win+D minimising it, stay as section 11 says. The hotkey still shows with `SWP_NOACTIVATE` and moves no focus.
5. No new control, string or tooltip.

**Switch to B only if** a fallback region is ever seen taking the foreground when Sergei did not just click it. B then ships with items 2 and 3 unchanged (`win.focus()` on pointer-down must still pass the click through and draw the same active border).

**Sergei:** no click check is needed to adopt A; the observer run is the gate. One optional 30-second step goes into his M2 try-it: start with `--ql-no-desktop-layer`, click a region, type a letter (the filter chip shows it), then Ctrl+Arrow in edit mode. If the letter does not appear, tell Jane; that reopens this block.

---

## Addendum — M3 rulings (Judy, 2026-10-03)

Status: final, uncommitted. Sergei handed Judy the visual and copy calls on Ender's 11 open points (TechPlan section 8, "For Judy"). One ruling has a consequence for what Delete region does (B4, marked **Flag**); everything else is look, wording and state. The addendum **replaces** the spec above where they differ: 2.1 (item broken), 3.4 (Delete failed; "failed tiles marked broken"), 5.2 ("NOT A SHORTCUT", "bounces back"), 5.4 (Failure), 9.1 and 9.3.
Inputs: TechPlan sections 3 and 8; `region.js`, `app.js` (`createAppTile`), `manager.html` / `manager.js`, `region.css`, `manager.css`, `base.css`, `moves/rules.js`, `moves/mover.js`, the box code in `controller.js`, `scripts/nsis/installer.nsh` and the diff of `scripts/tryit-regions.mjs` (worktree `wip/regions`, uncommitted M3). No app was launched.
Method, two scratch passes (nothing in the repo written):
1. **Contrast.** The gate's own maths (`scripts/check-theme-contrast.js`: WCAG relative luminance, colours flattened on black, `--panel-bg` composited over the flattened `--bg`) over all 101 theme files in the worktree. Light theme: `mirrors-edge` (lightest of the three, `--bg` luminance 0.71; the others are `portal` and `silent-hill`). Dark theme: `cyberpunk`. The worst case of 101 is named for every pair.
2. **Geometry.** Mock tile and Manager pages built from the real `base.css`, theme and `manager.css`, rendered at 1x, 1.5x and 2x through `scripts/qa/headless-browser.mjs` (15 runs, 0 browsers left after each) and read as rects.
Sizes are DIP. Numbering: the brief's "deviation 4" is TechPlan 8's deviation 8 (broken = missing); its "deviation 6" is the Try-it row of the files table (with deviation 11). The plan's own deviations 4 and 6 are covered in B9 and B12.

| # | Point | Ruling | Why |
|---|---|---|---|
| B1 | Failure boxes | Say what failed, **where it is now**, and the reason. One failure: its name in quotes. Two or more: the count and up to 3 names | The old text never said where the shortcut was |
| B2 | Move all back, Manager | Second line gives the number of regions: `They leave 3 regions.` (one region: its name) | "all regions" overstates; the spec's single name is wrong for the Manager |
| B3 | Singular | Its own sentence for one: `It`, `shortcut`, `1 other shortcut is removed ... The app stays installed.`, `None moved ...` at 0 | Grammar, and "0 moved" reads as an error |
| B4 | Broken tile | Pip `--text` with a "!", **top-left**, always shown; box says `QuickLauncher Shortcuts folder`; Keep is the default. In edit mode a broken tile gets ✕ `Remove tile`, not ↩. **Flag:** a missing-file tile never blocks Delete region or Move all back | `--accent-m` fails 3:1 in 30 themes; the top-right corner belongs to the edit badge; ↩ on a missing file can only fail |
| B5 | Manager section | Layout as built; sentences in `--text`; every button 24 px high; a standing line and disabled buttons when moving is unavailable; tooltips that say why | `--text-dim` fails 4.5:1 in 13 themes; the buttons render 21 px |
| B6 | README, uninstaller | Texts below | The old README never said "do not delete or rename" |
| B7 | NOT A SHORTCUT | No check during the drag. After the drop, a region notice: `NOT A SHORTCUT` / `{n} FILES ARE NOT SHORTCUTS`. No box | Silence after the slot looks like a failed drop; a box is too loud for a harmless mis-drop |
| B8 | Delete row | `Remove the focused tile; a moved shortcut goes back to the desktop (edit mode)` | "Remove" elsewhere means the file is untouched |
| B9 | Placeholder reason | `The file is online only. Keep it on this device, then try again.` plus three more reasons the catch-all described wrongly | The disk refused nothing |
| B10 | Filtered region | An accepted file drop clears the filter | The tile would land hidden |
| B11 | Deviation 8 | Confirmed: broken means the file is missing, nothing else | One state, one meaning |

### B1. Failure boxes

The box type is warning, title `QuickLauncher`, one button `OK`. Rules for every failure box (this one, the drop box of 5.2, and the reasons of B9):

- **Names:** the first 3 in order, `, ` between them; more reads `Steam, Notes, Mail and 2 more`. One failure: the name in curly quotes in the sentence, no count, no brackets.
- **Reason:** the box's second line. One distinct reason: that line. Several: one line per listed name, `{name}: {reason}`.
- **Where it is now:** always the last sentence of the first line. Exception: when every reason is `The file is missing.`, leave that sentence out (it would be false).

| Case | First line | Second line |
|---|---|---|
| ↩, Delete, tile menu, Move all back: 1 | `Couldn't move “Steam” back to the desktop. It is still in QuickLauncher.` | reason |
| the same: 2 or more | `Couldn't move 2 shortcuts back to the desktop (Steam, Notes). They are still in QuickLauncher.` | reason(s) |
| Delete region, region kept: 1 | `Couldn't move “Steam” back to the desktop. The region was kept.` | reason; then, if any went back, `5 others are back on the desktop.` (`1 other is back on the desktop.`) |
| the same: 2 or more | `Couldn't move 2 shortcuts back to the desktop (Steam, Notes). The region was kept.` | the same |
| Manager, file without a tile, MOVE TO DESKTOP | `Couldn't move “Steam” to the desktop. It is still in the QuickLauncher Shortcuts folder.` | reason |
| Drop or + FILE: 1 | `Couldn't move “Steam” off the desktop. It is still on the desktop.` | reason |
| the same: 2 or more | `Couldn't move 2 shortcuts off the desktop (Steam, Notes). They are still on the desktop.` | reason(s) |

Why. Ender's `Couldn't move back 2 shortcuts (Steam, Notes).` says what failed and not where the shortcut is, and in Move all back with 30 files it would list 30 names. "Where it is now" is the one thing the user must know to trust that nothing was lost. In the delete case the region's tiles change under the user while the region stays, so the box also says how many did go back.

### B2. Move all back

Message and buttons as built except:

- **First line:** `Move {n} shortcuts back to the desktop?` (`Move 1 shortcut back to the desktop?`). `n` counts only shortcuts whose file exists (B4).
- **Second line, region menu, or Manager when every moved shortcut is in one region:** `They leave “Games”. Names already on the desktop get a number.` (one shortcut: `It leaves “Games”. ...`).
- **Second line, Manager, moved shortcuts in k regions (k = 2 or more):** `They leave {k} regions. Names already on the desktop get a number.`
- Buttons `Move back`, `Cancel`; default and Esc = Cancel (as built).

Why: the spec's line names one region, which is wrong for the Manager. "all regions" would overstate when some hold none; the number is true and short.

### B3. Singular

| Where | One | Many |
|---|---|---|
| Delete confirm, line 1 | `1 shortcut moves back to the desktop.` | `{n} shortcuts move back to the desktop.` |
| Delete confirm, line 2, with moved ones | `1 other shortcut is removed from QuickLauncher. The app stays installed.` | `{n} other shortcuts are removed from QuickLauncher. The apps stay installed.` |
| Delete confirm, line 2, none moved | `1 shortcut is removed from QuickLauncher. The app stays installed.` | `{n} shortcuts are removed from QuickLauncher. The apps stay installed.` |
| Move all back | B2 | B2 |
| Failure boxes | B1 | B1 |
| Manager count | `1 moved off the desktop.` | `{n} moved off the desktop.`; at 0: `None moved off the desktop.` |
| Manager files without a tile | `1 file without a tile.` | `{n} files without a tile.` |

In two-sentence texts the second sentence's pronoun follows the count: `It` for one, `They` for many. Ender's `model.js` already has everything in this table except "The app stays installed." The section title carries the noun in the count line, so "1 moved" needs no "shortcut".

### B4. Broken tile

A tile is broken only when its file is gone from the store folder (B11).

**Look**
- **Icon:** 60% opacity (as built).
- **Pip:** 12 x 12 px, inline SVG, `top: 2px; left: 2px` inside the tile (3 px from its outer edge), `pointer-events: none`, `aria-hidden="true"`. Circle `r = 6` filled `var(--text)`; the "!" in `var(--bg)`: a bar 2 x 4.4 at (5, 2.4) and a dot 2 x 2 at (5, 7.6), both `rx = 1`. Shown in view **and** edit mode: delete the rule that hides it in edit mode.
- **Why `--text`.** `--accent-m` on `--bg` is under 3:1 in 30 of 101 themes (lowest `twin-peaks` 1.32; 58 under 4.5). Rendered: a grey dot in `mirrors-edge`, a brown one in `lovecraft`; neither reads as a warning. `--text` is 5.76:1 or better against `--bg` and 5.48:1 against `--panel-bg` in all 101. The "!" makes it a warning without relying on colour (WCAG 1.4.1), in the same `--bg` / `--text` pair reversed.
- **Why top-left.** The edit badge sits at the top-right (24 x 24 at -2, -2) and covers a pip placed there: spec 2.1 and 5.4 collided, my miss. The top-left is free in both modes, so the state stays visible while the user is in edit mode deciding what to do with it. At the narrowest tile (96 wide at every icon size) the pip spans x 3 to 15 and the icon starts at x 16: it is 1 px clear and never over the icon.
- **Name and tooltip.** Tile `aria-label` = `{name}, missing`. View mode: the tile and its label get `title` = `{name} is missing. Click to remove the tile or keep it.` Edit mode: unchanged (`Click to rename`).

**View mode, click, Enter or Space:** native box, warning icon.
- `“Steam” is missing from the QuickLauncher Shortcuts folder.`
- Buttons `Remove tile`, `Keep`. **Default Keep, Esc and the close box = Keep** (as built: confirmed).
- The old text said "the moved-shortcuts folder", a name that appears nowhere. The folder is `QuickLauncher Shortcuts`, and OPEN FOLDER opens it.
- Why Keep: removing the tile is the only action that forgets where the file came from. A file that comes back (an antivirus restoring it, the user) makes the tile work again, so waiting costs nothing.

**Edit mode on a broken tile** (new; as built it would show ↩ and fail with a false reason):
- Badge: ✕ in today's `.btn-remove` look, tooltip and `aria-label` `Remove tile`. A click removes the tile at once, like the box's `Remove tile` (edit-mode ✕ never asks: today's rule).
- Delete key: the same. Tile menu: `Remove tile` in place of `Move back to desktop`.
- There is no file to move, so ↩ could only fail.

**Flag (B4b): a missing-file tile never blocks anything.** As built, Delete region treats a missing tile as a desktop file to restore, fails with `The disk refused the move.`, and keeps the region until the tile is removed by hand. Move all back counts it and fails on it the same way. Rulings:
- **Delete region:** a broken tile counts as a reference: it is in line 2 of the confirm (`... removed from QuickLauncher`), goes with the region, and never keeps it. Spec 3.4's "a region that still owns unrestored desktop files cannot disappear" holds, since a missing file is nothing to restore. No file is deleted; only the tile record.
- **Move all back** (region menu and Manager): skips broken tiles. `n` and the Manager's count leave them out. "Move all shortcuts back to desktop..." is enabled only when at least one moved shortcut has its file.

### B5. Manager, Moved shortcuts

Layout as built, top to bottom: `// MOVED SHORTCUTS` with the count on its baseline (they wrap under each other when narrow); the OneDrive line; a standing state line (new, below); the buttons `OPEN FOLDER`, `MOVE ALL BACK…`; the files-without-a-tile count and its rows. Rendered at 560 and 440 wide: no row overflows, long names ellipsize.

- **Sentence colour:** every sentence (count, OneDrive, unavailable, files without a tile) is `--text`, 12 px, letter-spacing 1 px. Not `--text-dim` (as built): it is under 4.5:1 in 13 of 101 themes (lowest `lovecraft` 2.52; rendered, near unreadable), and the OneDrive line and the files-without-a-tile count are the two things in this section the user must read. Not `--accent-m`: these are not errors, and it is under 4.5:1 in 58 themes.
- **Button height:** every button in the section `min-height: 24px`. They render 21 px tall (measured); the other new Manager controls already carry 24 (`.mgr-tab`, `.mgr-link`). Row gap 4, button gap 8 stay.
- **Standing line when moving is unavailable (read-only store, no Win32):** `Moving is unavailable.` in the OneDrive line's place. `MOVE ALL BACK…`, `ADD BACK`, `MOVE TO DESKTOP` are then disabled (the `.mgr-disabled` look) with tooltip `Moving is unavailable.` `OPEN FOLDER` is never disabled.
- **Disabled at 0:** `MOVE ALL BACK…` with tooltip `No shortcuts to move back.` (a disabled control says why, as 9.1 does for Delete and the theme picker). Not "the same tooltip" as when it is live.
- **Rows:** name = the shortcut's name without extension (as built); its `title` = the file name with extension (`Steam.lnk` and `Steam.url` can both be here). Labels `ADD BACK` and `MOVE TO DESKTOP` unchanged.
- **Tooltips:** `ADD BACK` → `Add this shortcut to “{name of the first region}”`; `MOVE TO DESKTOP` → `Move this shortcut to the desktop`. This replaces "the first region", a term nowhere in the UI, and "file". `OPEN FOLDER` and `MOVE ALL BACK…` as 9.1.

### B6. README and uninstaller

**`README.txt`** in `QuickLauncher Shortcuts` (CRLF, plain ASCII, written once and never overwritten, as built):

```
These shortcuts came off your desktop. QuickLauncher moved them here when
you added them to a region, and its tiles open them from here.

Do not delete, rename or move them: their tiles would stop working.

To put them back on the desktop, right-click the QuickLauncher tray icon,
choose Regions, then press MOVE ALL BACK under Moved shortcuts.
Uninstalling QuickLauncher puts them back too.

Without QuickLauncher you can drag them out of this folder yourself.
```

The old text named the Manager without saying how to open it, never warned that deleting or renaming breaks a tile (the one thing a person who finds this folder must know), and said nothing for someone who no longer has the app.

**Uninstaller box** (`MB_OK|MB_ICONINFORMATION`, `/SD IDOK` unchanged). In the script:
`"Some shortcuts could not go back to the desktop.$\r$\nThey are in:$\r$\n$R7$\r$\n$\r$\nDrag them out when you want them back. Nothing was deleted."`
Shown as:

```
Some shortcuts could not go back to the desktop.
They are in:
C:\Users\...\QuickLauncher Shortcuts

Drag them out when you want them back. Nothing was deleted.
```

The path sits on its own line (Ctrl+C copies a message box's text). It says what to do next and answers the question everyone has at that moment; "Nothing was deleted" is true by the never-delete rule.

### B7. In place of NOT A SHORTCUT

- **During the drag:** no type check (a page cannot read it). Every file drag shows the valid outline and slot; only FULL rejects (as built).
- **After the drop,** if any dropped file was ignored (not `.lnk`, `.url` or `.exe`: a folder, a document, a picture), the region shows a notice in the same slot, for the same time and with the same look as a launch error (today's `showUpdateBanner` path):
  - one ignored: `NOT A SHORTCUT`
  - two or more: `{n} FILES ARE NOT SHORTCUTS`
- A mixed drop adds the accepted ones as usual; the notice counts only the ignored. No message box. Announced like the other notices.
- Why not a box: 7.5 keeps boxes for failures that leave the user's files somewhere unexpected; here no file was touched. Why not silence: a slot that opens and then nothing happens looks like a failed drop.
- Spec 5.2's "bounces back" is moot: an OS drag that does nothing leaves the file where it was. M5: Fan and Ring show the notice in the hub's name line, as launch errors do (7.5).
- **Ender: keep `dropEffect = 'copy'`, never `'move'`.** A drop answered with Move tells the drag source, here Explorer's desktop, to delete what it handed over: including an `.exe` that is added by reference. The cursor therefore reads "Copy" while a desktop shortcut moves; the tile arriving and the icon leaving are the confirmation.

### B8. Cheat-sheet Delete row

`DELETE` / `Remove the focused tile; a moved shortcut goes back to the desktop (edit mode)`

"Remove" everywhere else in the app means the file is untouched (5.4); on a moved tile it is not. Measured on a mock at the 440 minimum: 3 lines in the 218 px description column (the longest row today is 2). Not shortened: a trimmed `(edit mode)` orphaned on its own line read worse, and the list scrolls.

### B9. Reasons

Cloud-only placeholder: `The file is online only. Keep it on this device, then try again.` (code -2). Ender's catch-all, "The disk refused the move.", is false here (the disk refused nothing) and gives no way out. The line is provider-neutral (OneDrive, Dropbox and others set the same attribute), and "keep it on this device" is OneDrive's own menu wording.

The full table; the three spec reasons stay, four are added because the catch-all described these cases wrongly:

| When | Reason line |
|---|---|
| Win32 5 on the Public Desktop | `Needs administrator rights.` (spec) |
| Win32 5 elsewhere (a read or ACL refusal; plan deviation 6) | `Windows denied access to the file.` |
| 32, 33 | `The file is in use.` (spec) |
| 17: Desktop and store folder on different drives | `The desktop is on a different drive.` |
| cloud-only placeholder | `The file is online only. Keep it on this device, then try again.` |
| 2, 3: gone before or during the move | `The file is missing.` |
| anything else (-1, -3, other codes) | `The disk refused the move.` (spec) |

### B10. A file dropped into a filtered region

- On an **accepted** file drop (not FULL, at least one path), the region clears its type-to-filter (`clearFilter()`) at the moment it sends the paths. The new tile then shows when it arrives, in the slot where it was dropped: the slot is in the DOM at its real index, so clearing reveals the hidden tiles around it.
- A rejected or cancelled drop leaves the filter alone. Hovering never clears it.
- **+ FILE** (same path through the move): the same, when the chosen file is added.
- Silent: the filter chip going away is the feedback.
- Fan and Ring (M5): chips only dim, so nothing hides; decided there.
- Scope: file drops only. M2b's m-2 (the same case for a tile dragged from another region) is not ruled here; the same rule would keep the two alike.

### B11. Deviation 8: confirmed

Broken means the file is missing from the store folder, and nothing else. A move back that fails with the file still there leaves a normal tile that launches, and one box (B1): marking a working tile broken would lie, and the box text for broken says "missing". The box is the record; the retry is one more ↩ (the badge stays). Spec 3.4 and 5.4's "marked broken" on a failed move are replaced. The consequences for a missing file are in B4.

### B12. Found in the pass, not among the 11

1. **↩ badge look.** As built it wears the ✕ look: white on `--remove-btn-bg` (under 3:1 in 6 of 101 themes: `persona-5` 1.64, `portal` 1.71, `ff8` 2.71, `metal-gear` 2.75, `ff7` 2.93, `fatal-frame` 2.97), and it turns the danger colour on hover, while ↩ is the safe action. Rule: class `.btn-move-back` carrying `.btn-remove`'s geometry (position, 24 x 24, radius, padding, z-index; top -2, right -2) and none of its colours; the cloned node drops the `btn-remove` class. `background: var(--panel-bg)`; `border: 1px solid var(--accent-text)`; `color: var(--text)`; glyph 14 px (11 px reads as ← or ↵; rendered). Hover: `background: var(--btn-hover-bg); border-color: var(--accent-c); box-shadow: var(--glow-c); color: var(--text)` (the global `button:hover` sets `#fff`, unreadable on a light theme). Focus: `outline: 2px solid var(--accent-text); outline-offset: -2px` (inside the disc, because the tile's `overflow: hidden` would clip an outer ring; `--accent-c` is under 3:1 in 13 themes). Tooltip and `aria-label` `Move back to desktop` (as built). The existing ✕ badge is clipped 2 px at the top and right by the tile; not touched.
2. **Try-it on a fake desktop (TechPlan 8, Try-it row and deviation 11).** UX effect: a shortcut dragged from Sergei's **real** desktop in the try-it is classified as a reference, so it gets a tile and **stays on the desktop**. It would look as if the move is broken. The try-it also has no M3 step. Ender adds one, and the script writes two sample files, `Try A.url` and `Try B.url` (plain text: `[InternetShortcut]` and a `URL=` line), into the fake Desktop. Printed text:
   ```
   Desktop files move in (M3). This run uses a fake desktop: your real desktop is never touched.
    a. In Explorer open <profile>\desk\Desktop. It holds Try A and Try B.
    b. Drag both onto a region. They leave the folder and appear as tiles.
    c. Right-click the region, Edit shortcuts. Click ↩ on one: it is back in the folder.
    d. Open the Manager, Moved shortcuts. OPEN FOLDER shows <profile>\desk\QuickLauncher Shortcuts.
    e. Region menu, Move all shortcuts back to desktop...: the other one goes back.
    Note: a shortcut dragged from your real desktop is added as a normal tile and stays on the desktop in this run.
   ```
   A drag of real desktop icons is first provable on the real desktop (TechPlan 8, "not provable"): the first real drop should be a throwaway shortcut.
3. **Deviation 4** (restore-all also moves files without a tile to the Desktop): no UX issue; the uninstall gives back every file, and the box in B6 covers any that stay.
4. **Duplicate drop is silent** (as today): a file that already is a tile in that region adds nothing and says nothing. Not ruled. Offer: `ALREADY IN THIS REGION` in the B7 notice.
5. **OneDrive** (5.5.5 string unchanged): if Sergei's Desktop is OneDrive-synced, OneDrive sees a moved shortcut as deleted from the Desktop, so his other PCs may lose it; the Manager line is the only warning, and only if he opens the Manager. Not verified here. Question for Jane: is his Desktop OneDrive-redirected?

### Contrast, measured

Method as above (gate maths; dark `cyberpunk`, light `mirrors-edge`; "worst" is the lowest of 101).

| Pair | Used for | Floor | `cyberpunk` | `mirrors-edge` | Worst of 101 |
|---|---|---|---|---|---|
| `--text` on `--bg` | Manager sentences; pip fill and its "!" | 4.5 | 17.00 | 6.74 | `mordor` 5.76 |
| `--text` on `--panel-bg` | ↩ glyph | 4.5 | 16.98 | 6.10 | `silent-hill` 5.48 |
| `--accent-text` on `--bg` | ↩ border | 3 | 14.60 | 3.46 | `warhammer-tyranids` 3.02 |
| `--accent-text` on `--panel-bg` | ↩ border, the other surface | 3 | n/a | n/a | `warhammer-tyranids` 2.98, `silent-hill` 2.99, `resident-evil` 3.00 (the border does not identify the control; the glyph does) |
| rejected: `--accent-m` on `--bg` | pip as built | 3 | 5.71 | 4.10 | `twin-peaks` 1.32; 30 under 3 |
| rejected: `--text-dim` on `--bg` | sentences as built | 4.5 | 6.99 | 4.76 | `lovecraft` 2.52; 13 under 4.5 |
| rejected: white on `--remove-btn-bg` | ↩ as built | 3 | 19.09 | 4.20 | `persona-5` 1.64; 6 under 3 |

Native boxes, the README and the NSIS box use the OS theme and need no token.

### Nothing covers anything (rects, S = 64)

- **Pip** (12 x 12 at x 3 to 15, y 3 to 15 of the tile) vs the icon (x 16 to 80, y 7 to 71 at W = 96): no intersection, 1 px clear at the narrowest tile and more when wider (a 100 wide tile: 3 px). Vs the edit badge (top-right, x W-23 to W+1, measured on the mock): none for every W of 96 or more. Vs the label (y 76 and below): none. The pip is `pointer-events: none`, so a click goes to the tile.
- **↩ badge:** same rect as today's ✕; it overlaps the icon's top-right corner as ✕ does, and the icon is not interactive.
- **Manager section:** normal flow, no absolute positioning; at 440 wide the orphan row is name (shrinks, ellipsis) then two buttons (76 and 126 wide), no overlap.
- **File-drop states:** the outline, slot and hint rules are M2's (`#drop-hint` hidden during the preview); the notice uses the existing banner slot.

### Tooltips (every new control)

`↩` Move back to desktop (as built). `✕` on a broken tile: Remove tile. The broken tile: B4. `OPEN FOLDER`, `MOVE ALL BACK…`: 9.1, and `No shortcuts to move back.` / `Moving is unavailable.` while disabled. `ADD BACK`, `MOVE TO DESKTOP`: B5. The pip, the notice and the section title are not controls.

### Futaba measures (each seen to fail on a deliberate break first)

1. A broken tile in `twin-peaks`, in view and in edit mode: the pip exists, its rect is x 3 to 15 / y 3 to 15 of the tile, it intersects neither the icon nor the badge, its fill resolves to `--text` and its contrast against `--bg` is 3:1 or more.
2. Click, Enter and Space on a broken tile: the box text is `“Name” is missing from the QuickLauncher Shortcuts folder.`, buttons `Remove tile`, `Keep`, default and cancel answer = Keep.
3. Edit mode, broken tile: the badge text is `✕`, its title is `Remove tile`; a click removes the tile with no box. A moved tile with its file keeps `↩`.
4. A region with 1 missing-file tile and 1 reference: Delete region shows `2 shortcuts are removed ...` and deletes with no failure box. A region with 2 moved shortcuts and 1 missing: Move all back says `Move 2 shortcuts back ...`.
5. Each failure box of B1 from an injected failure: the text equals the table (1 failure and 2 or more; with 4 names to see `and 1 more`); with two different reasons the second line has one `{name}: {reason}` line per listed name.
6. The seven reasons of B9: each code returns its line (fault injection for 5, 32, 17, 2; the real attribute for the placeholder).
7. Drop a `.txt` and a folder together with one `.lnk`: one tile, notice `2 FILES ARE NOT SHORTCUTS`; drop a `.txt` alone: `NOT A SHORTCUT`, no box, nothing moved.
8. Type a filter that hides every tile, then drop a shortcut: the filter is empty afterwards and the new tile is visible; a rejected drop leaves the filter.
9. Manager at 440 x 420: every button in the section is 24 px high or more; with moving unavailable the three buttons are disabled with their tooltip; at 0 moved `MOVE ALL BACK…` is disabled with `No shortcuts to move back.`; the sentences resolve to `--text`.
10. The README and uninstaller texts equal B6 byte for byte (the NSIS string compiled with `makensis`).

## Addendum — M3 fix pass (Judy, 2026-10-04)

Status: final, uncommitted. Sergei approved the M3 fix pass on 2026-10-04 and handed the visual and copy calls to Judy. One ruling is a behaviour a person will notice (C2: a dropped file that already has a tile moves that tile); it follows from 5.5.2, and I made it as delegated. The addendum **extends** B1 and B9 (new reasons) and **replaces** two earlier texts, because the items forced it: **B7's look** (C5: measured now, it fails) and **B12.2's try-it text** (C7).
Inputs: Futaba's report `QuickLaunch_QA_RegionsM3_2026-10-04.md` (M-1, m-1 to m-5, m-8, the pattern alerts; branch `wip/regions` at `3467e5c`); `controller.js` (`dropFiles`, `openStoreFolder`), `mover.js` (`_ensureStore`, `addPaths`, `_scan`, `adoptOrphan`), `rules.js`, `app.js` (`showUpdateBanner`), `updater.js`, `base.css`, `manager.css`, `scripts/tryit-regions.mjs`. No app was launched.
Method, two scratch passes (nothing in the repo written; files in the scratchpad `judy-m3fix\`):
1. **Contrast.** The gate's own maths (`scripts/check-theme-contrast.js`: WCAG relative luminance, colours flattened on black, `--update-bg` composited over the flattened `--bg`, the text over that) over all 101 themes. Dark theme `cyberpunk`, light theme `mirrors-edge`, and the worst of 101 for every pair.
2. **Geometry.** A static copy of the Manager header (markup of `manager.html`) and of a region header (markup of `index.html`), with the real `base.css`, theme, and `manager.css` / `region.css`, rendered for each of the 101 themes through `scripts/qa/headless-browser.mjs` (the Manager at 560 and 440 wide, the region at its default 424; each run closed its browser). A tagline's painted run is from its `left` to the smaller of `left + text width` and its box's right edge, the text width measured with the pseudo-element's own font and letter-spacing. The rule was then injected and the 101 measured again. Sizes are DIP.

| # | Point | Ruling | Why |
|---|---|---|---|
| C1 | M-1: the store folder cannot be made or written | The B1 drop box with three new reasons. Nothing is remembered: the next drop tries again. OPEN FOLDER gets the same box and reasons | The file is safe but the person is told nothing; the slot opens and closes |
| C2 | m-1, m-3: the same file again | One file, one tile: the tile that already has the file takes the drop and lands in the dropped slot. No second tile, no message | A twin is a dead tile after the first ↩; the user asked for "this shortcut, here" |
| C3 | m-2: the same name, a different file | Never merged. A name a moved tile owns is never reused; the new file takes the next number | The broken tile keeps its own file's promise and origin (B4) |
| C4 | m-4: a very long name | Reason `The name is too long for the QuickLauncher Shortcuts folder. Shorten it, then try again.` | `The file is missing.` is false |
| C5 | m-5: a notice over an update offer | Two layers in the one slot. A notice takes the slot for its time; the offer comes back after it, buttons included. The notice is `--text` | A mis-drop must not cost the offer; B7's colour fails 4.5:1 in 48 themes |
| C6 | m-8: a tagline under the tabs | Not drawn in the Manager (`display: none`). Controls win over theme art | 101 of 101 themes overlap the tabs, at 560 and at 440; there is no room beside them |
| C7 | The try-it, M3 step | Feel only: where the fake desktop is, what to drag, one question | ProcessRules § Sergei is not QA |

### C1. M-1: the store folder cannot be made or written

**Box, not notice.** 7.5: move failures and refusals are boxes; B7's notice is for a drop where nothing failed. It is the **Drop or + FILE row of B1**, unchanged in shape: warning, title `QuickLauncher`, one button `OK`. Ender turns a failure of the store step into a per-file failure with a reason (the file never moved and nothing was journalled), so B1's name rules, "and 1 more" and "where it is now" apply as they are.

| Files that failed | First line | Second line |
|---|---|---|
| 1 | `Couldn't move “Steam” off the desktop. It is still on the desktop.` | the reason |
| 2 or more | `Couldn't move 2 shortcuts off the desktop (Steam, Notes). They are still on the desktop.` | the reason |

**Reasons, added to B9** (the other seven stay):

| When | Reason line |
|---|---|
| Something that is not a folder is at `QuickLauncher Shortcuts` (`EEXIST`, `ENOTDIR`) | `A file named “QuickLauncher Shortcuts” is in your user folder. Rename or move it, then try again.` |
| The store step is denied (`EPERM`, `EACCES`) | `Access to the QuickLauncher Shortcuts folder was denied. Check its permissions and your security software.` |
| `ENOSPC`, at any step before the move | `The disk is full.` |
| Any other error before the move | `The disk refused the move.` (the B9 catch-all) |

- **The folder reasons belong to the store step only.** A failed journal write (the profile folder, not the store) never says "QuickLauncher Shortcuts folder": it gets `The disk is full.` or the catch-all by its code. A reason that names the wrong folder is the one wrong thing here.
- **Mixed drop.** An `.exe` or a non-desktop `.lnk` in the same drop still becomes a tile (it needs no store); the box names only the shortcuts that were to move.
- **No state.** No standing line in the Manager, no retry button: the person fixes the cause and drops again, and every drop tries the folder afresh.
- **Why these three.** The first is the repro, and a person can fix it at once; the second names the two things that block a write in a profile folder (permissions, security software); a full disk is the third real cause and one fact. "Rename or move it" because the file may be theirs.
- **OPEN FOLDER, same cause.** Found reading `controller.js`: `openStoreFolder` makes the folder with the same unguarded call, so the Manager button does nothing and says nothing (Futaba did not run it). It gets a box, warning, `OK`: `Couldn't open the QuickLauncher Shortcuts folder.` plus the reason line when the error is one of the first three above; any other error shows the first line alone. With a file in the way it must not open that file: nothing is passed to the shell.

### C2. m-1 and m-3: the same file again

**Rule: a shortcut file belongs to one tile.** When the file dropped (or chosen with + FILE) is the very file a tile already points at, that tile takes the drop. No second tile is made.

- **What the user sees.** The tile is where they dropped it: the dashed slot closes on it, in the region they dropped on. It has left the region it was in, the way "Move to" does (5.3). It keeps its own name and icon (a renamed tile keeps its name). No box, no notice: success is silent and the tile arriving is the confirmation (as B7).
- **m-1.** A reference tile points at a Desktop shortcut and that shortcut is dropped: the file moves and the same tile becomes a moved tile (↩ in edit mode). It is not left behind.
- **m-3.** A file is dragged from the store folder (OPEN FOLDER, then Explorer) onto a region while a moved tile owns it: that tile goes to the dropped slot. No file moves. Onto its own region this is a reorder.
- **Failure.** If the move fails (B1 box), the tile stays exactly where it was and keeps working: the file is still on the desktop.
- **Count.** A tile that is already in the dropped region adds nothing to its count, so such a drop is never FULL.
- **Several tiles on one file** (the same desktop shortcut referenced twice): the one in the dropped region takes it, otherwise the first in region order. The others stay as plain reference tiles, and a click says `TARGET MISSING`, as for any file deleted in Explorer. This needs the same shortcut in two tiles; Sergei's data has none (all 5 are `shell:AppsFolder`). Accepted, not hidden.
- **No tile yet** (the same gesture, not in Futaba's list): a shortcut already in the store folder never becomes a reference tile. With no tile it gets a moved tile, as ADD BACK makes, in the dropped region at the dropped slot, and its row leaves "files without a tile". Ender: confirm what the code does today; as `classify` reads, it makes a reference tile and the row stays.
- **Why not refuse or note.** A refusal leaves the desktop icon where it was when the user asked to take it off; a note makes them do by hand what the drop already said. Why one tile: a second tile on a store file is a dead tile after the first ↩ (m-3), and 5.5.2 already says a tile exists only when its file is where the tile says.

### C3. m-2: the same name, a different file

**Not merged.** A name that a moved tile owns, whether its file is there or missing, is never reused for another file. The new file takes the next number in the store folder (`Steam (2).lnk`), as any name collision does today.

- **What the user sees.** The broken `Steam` (B4 pip) beside a working `Steam`. No notice: the pip is the notice. The broken tile keeps its own file's promise (B4: if the file comes back, the tile works again) and its own origin; ↩ on each returns its own file to its own desktop (the Desktop one and the Public one never swap).
- **Why not give the new file to the broken tile.** It swaps a file under a tile whose origin may be the other desktop, and it ends B4's "waiting costs nothing" the first time a name repeats.
- **The tile name** stays what the file's name gives (`Steam`), as for `Dup` and `Dup (2)` today; the pip and the tooltip (B4) tell the two apart.

### C4. m-4: a very long name

- **Reason, added to B9:** `The name is too long for the QuickLauncher Shortcuts folder. Shorten it, then try again.` The box's first line keeps "It is still on the desktop." (the reason is not "missing"). Why the long form: the desktop accepted that name, so "too long" alone would read as false; the sentence says whose limit it is and what to do.
- **Condition, Ender's mechanism:** the length of the destination path (the store folder, a backslash and the name, with any ` (2)`) is 260 characters or more, checked **before** the move. `The file is missing.` stays for Win32 2 and 3 when the path is short; the reason never rests on code 3 alone.
- **One outcome is not allowed:** a move that succeeds and leaves a tile whose file Windows cannot open. If Ender makes long paths work, nothing is shown, and that is better, provided Futaba launches the moved shortcut and it opens.

### C5. m-5: a notice and an update offer

The banner slot (38 px, one row) has two layers, and one is drawn at a time.

- **Update layer:** the updater's messages (checking, available with DOWNLOAD, downloading n%, ready with INSTALL NOW, up to date, error), as today.
- **Notice layer:** every other message: the drop notices of B7, launch errors, `SAVE ERROR`. Eight seconds (as built) and a ✕ of its own.

| On screen | A notice arrives | The notice ends (8 s or its ✕) |
|---|---|---|
| nothing | the notice | the slot hides |
| an update message | the notice takes the slot; the update message is kept, not drawn | the update message comes back as it is then: its text, its buttons, its percentage |
| another notice | replaces it; 8 s restarts | as above |

- **Update events during a notice** change the update layer behind it and show when the notice ends; none replaces a notice early. An update message with a timer (`SYSTEM IS UP TO DATE`, the error) starts its timer when it is drawn.
- **The tray dot.** A notice ending, by time or by its ✕, never calls `dismiss-update`. Only the ✕ of an update message does, as today. (Today an 8 s notice that replaced an offer also cleared the dot.)
- **Look of the notice (replaces B7's "the same look as a launch error").** Text and ✕ in `--text`, on the banner's own background. Measured below: `--update-color` fails 4.5:1 in 48 of 101 themes and 3:1 in 24, so the notice B7 chose to be seen was unreadable in a quarter of the themes. Launch errors and `SAVE ERROR` share the layer, so they get a readable colour too: a fix, not a change of behaviour. The update layer keeps its look (offered below).
- **Tooltip.** The ✕ of both layers: `Dismiss` (title and `aria-label`; it had none).
- **Nothing covers anything.** The hidden layer is not drawn (no rect), and the slot's height and the page do not move. Considered and rejected: a second row (the window height would change) and "the offer wins" (a mis-drop would then say nothing, which B7 exists to prevent).

### C6. m-8: a theme's tagline under the Manager's tabs

**Rule: controls win over theme art.** In the Manager the header tagline (`#header::after`, every theme's flavour text) is not drawn:

```css
body.manager #header::after { display: none; }   /* manager.css */
```

- **Measured, as built.** All 101 themes, not only `mirrors-edge`: the tagline starts at x 200 to 205; REGIONS starts at x 134 to 196 and SETTINGS ends at x 289 to 354, so the painted text runs under REGIONS and SETTINGS in **101 of 101** themes, at 560 wide and at 440 wide. It clears the title and the ✕ in all of them.
- **Why not make room beside the tabs.** Between SETTINGS and ✕ there are 165 to 229 px at 560 and 45 to 109 px at 440; the tagline needs 121 to 451. At the 440 minimum a fitted tagline would be three to six letters and an ellipsis.
- **After the rule.** 0 of 101 themes have a painted tagline in the Manager, at 560 and at 440. No theme sets `!important` or `display` on the rule (checked), so the one selector wins in all. The region windows keep their taglines; nothing there changes in this pass.
- The tagline is decoration, so no contrast floor applies to it; it is hidden, so none is measured.

### C7. The try-it, M3 step (replaces B12.2's printed text)

ProcessRules § Sergei is not QA: Sergei answers "is it useful, does it feel right"; Futaba verifies. The old steps a to e asked Sergei to confirm that files left a folder, that ↩ put one back, that OPEN FOLDER showed a path and that MOVE ALL BACK worked: each is a check. They are Futaba's (her section 8, items 1, 4, 5 and 10). The printed block in `scripts/tryit-regions.mjs` becomes the text below (the path is `${join(desk, 'Desktop')}`; the sample files `Try A.url` and `Try B.url` stay; step 8 stays):

```
Desktop files move in (M3). This run has a fake desktop, so your real one is never touched.
 a. In Explorer open <profile>\desk\Desktop. It holds Try A and Try B.
 b. Drag them onto a region. In edit mode (right-click the region), ↩ takes one back.
 c. Tray > Regions: look at Moved shortcuts.
 Is it useful, and does it feel right? A word is enough.
 A shortcut dragged from your real desktop stays on the desktop in this run.
```

- Every line is an action to try or the one question; none says what must happen. The last line stays because without it a real-desktop drag looks like a broken move (B12.2).
- Steps 1 to 7 and a to f of the same script have the same shape (they ask him to verify). Not touched here: they are not M3.

### Contrast, measured

Method as above ("worst" is the lowest of 101).

| Pair | Used for | Floor | `cyberpunk` | `mirrors-edge` | Worst of 101 |
|---|---|---|---|---|---|
| `--text` on the banner background | the notice text and its ✕ (C5) | 4.5 text, 3 for the ✕ | 15.60 | 6.61 | `mordor` 5.62 |
| rejected: `--update-color` on the banner background | the notice as B7 ruled it | 4.5 | 16.84 | 4.03 | `nonary-games` 1.21; 48 under 4.5, 24 under 3 |
| rejected: `--text-dim` on the banner background | the notice's ✕ | 3 | 6.42 | 4.69 | `lovecraft` 2.49; 3 under 3, 37 under 4.5 |

The native boxes of C1 to C4 use the OS theme and need no token. The C6 tagline is hidden.

### Nothing covers anything

- **Banner slot (C5):** one layer drawn at a time, in the existing 38 px row; the hidden layer has no rect. The ✕ is the existing 24 x 24 button.
- **Manager header (C6):** after the rule the header holds the title, the tabs and the ✕ only; with no tagline nothing runs under them. Measured: 0 of 101 themes at 560 and at 440.
- **Tiles (C2, C3):** no new element. A tile that takes a drop lands in the slot the drop opened, and two tiles never share a file, so no ↩ can strand another tile.

### Tooltips (every new control)

None is new. The banner ✕ gets `Dismiss` (C5). OPEN FOLDER is unchanged (9.1).

### Found in the pass, not ruled (offers)

1. **Region windows have the m-8 defect in 101 of 101 themes** (since M1, my header spec). In a static copy at 424 wide the tagline's painted text runs 12 to 16 px under the first header button (⚄), because its right edge (`right: 135px` in `base.css`) predates the fourth button. With a filter chip showing it also runs under the chip (101 of 101); in `dune` it starts 6 px under the title. A fix measured on the copy, `body.region #header::after { right: 160px }` and `body.region #header:has(#filter-chip:not(.hidden))::after { display: none }`, takes the ⚄ and chip overlaps to 0 of 101 (the gap to ⚄ is 9 px at the least); `dune` still needs its tagline hidden. The M2b `PROTOCOL ACTIVE` string under `// EDIT MODE` is the same family and is not covered. Offered, not applied: it changes the look of every region window.
2. **The update offer is hard to read.** `--update-color` on the banner fails 4.5:1 in 48 of 101 themes and 3:1 in 24 (`nonary-games` 1.21, `mirrors-edge` 4.03); the message, DOWNLOAD and INSTALL NOW share it. Legacy themes, so the gate only warns. One rule would fix it (`--text` for the update layer too), at the price of the yellow update look in the 53 themes that pass. Offered, not applied.

### Futaba measures (each seen to fail on a deliberate break first)

1. **C1.** A file named `QuickLauncher Shortcuts` where the store goes, then drop one desktop `.lnk`: one box, text equal to C1 with the first reason; the `.lnk` is still on the desktop, no tile, journal empty; remove the file, drop again, no restart: it moves. The same with a denied ACL (second reason), an injected `ENOSPC` (`The disk is full.`), another injected error (the catch-all) and a journal write that fails (never the folder wording). A drop of one `.lnk` and one `.exe`: the `.exe` tile appears, the box names the `.lnk` only. OPEN FOLDER with the file in the way: the box of C1, and the recorded open list stays empty.
2. **C2.** A reference tile on `Refd.lnk` and the file dropped on the same region, then on another: one tile each time, moved (↩ in edit mode), at the dropped slot, none left in the old region; no box or notice; a move that fails (injected 32) leaves the reference tile where it was and working. A store file with a moved tile, dropped on a second region: one tile, in the second; ↩ returns the file to its own origin. A store file with no tile: one moved tile, and "files without a tile" drops by one. A tile already in the dropped region is not FULL at the cap.
3. **C3.** Moved `Steam.lnk`, its file removed (broken), a new `Steam.lnk` dropped: two tiles, the first still broken; the store holds `Steam (2).lnk`; ↩ on the second returns it to its own origin; put the first file back by hand and its pip goes. With one from the Public Desktop and one from the Desktop, each returns to its own.
4. **C4.** The longest name that moves and the shortest that is refused, one character apart: the refusal's box has the C4 reason, "It is still on the desktop." and an untouched file. If the longer name moves, its moved shortcut launches.
5. **C5.** An update offer with DOWNLOAD on screen in `cyberpunk` and `mirrors-edge`; drop a `.txt`: `NOT A SHORTCUT` replaces it and its text resolves to `--text`; after 8 s the offer is back with a DOWNLOAD that works, and the tray indicator is still on (`dismiss-update` not called). The notice's ✕: the same. The offer's own ✕: still clears the dot. A progress event during a notice shows after it. The ✕ title is `Dismiss`. The notice text contrast is 4.5:1 or more in all 101 themes.
6. **C6.** The Manager at 560 and at 440, all 101 themes: `#header::after` has no painted run (computed `display: none`), and no tab rect meets any painted text. Region windows still show their taglines.
7. **C7.** The printed M3 block equals the text in C7 (with the real path) and holds exactly one question.

## Addendum — try-it rewrite (Judy, 2026-10-04)

Status: final, uncommitted. Sergei approved (2026-10-04) rewriting the whole try-it to feel-only, with one standing rule: **whenever he is asked to check anything, it is numbered step-by-step actions: what to open, what to click or drag, what to look at.** This addendum **replaces** C7's printed block (its steps a to c) and its last bullet (steps 1 to 7 and a to f "not touched"): every step of `scripts/tryit-regions.mjs` is rewritten below, the M3 step included. Inputs: the script at `6a1394e` (read only; Ender is editing it), Futaba's real-input lists (M2b report section 8, items 1 to 9; M3 report section 8, items 1 to 10), ProcessRules § Sergei is not QA, spec 7.1 and 9.2 for the menu labels. No app was launched; nothing was measured.

### The format (every step)

- A step is **one numbered paragraph**: what to open, what to click, press or drag, what to look at, then **one question** about usefulness or feel as its last sentence. Numbers run 1 to 8 with no letters.
- No "check", "verify", "confirm", "must" or "should", and no sentence that says what has to happen. The question never asks whether something worked; it asks whether it is clear, easy, natural, handy or right.
- "Start" and "Finish" are not steps: they check nothing, so they carry no question.
- Eight steps replace the old 18 items: the checks went to Futaba (table below), so nothing is left to do twice.

### The printed text (Ender pastes this; `${...}` are the script's own values)

Replaces the whole `else console.log(` block (from `QuickLaunch regions, try-it 2` to `8. Tray > Quit QuickLauncher.`):

```
QuickLaunch regions, try-it (${seed.apps.length} of your shortcuts, copied; your real data and your real desktop are not touched)

Start: if your normal QuickLauncher is showing, press Ctrl+Space to hide it. The test copy has its own tray icon and the hotkey ${HOTKEY}. Each step ends in one question; a word is enough. The run closes by itself after 5 minutes; run this again for the steps you did not reach.

Between regions
 1. Right-click the test QuickLauncher's tray icon, choose New region, then Grid. Drag a tile from QUICK.LAUNCH onto the new region and hold it there for two seconds, then move along the new region, out of it and back in. Look at the new region and at the pointer as you move. Is it clear where the tile will land?
 2. Let go over the new region. Then drag one tile out onto the empty desktop and let go, and drag one tile to another place inside its own region. Look at where each tile ends up. Does dragging tiles around feel easy?

Keys in edit mode
 3. Right-click inside a region, not on its header, to start edit mode. Click an empty spot in it, press Right arrow until a tile has a ring around it, then press Ctrl+Right and Ctrl+Left. Look at the tile. Do the keys feel natural for rearranging?
 4. With the ring still on a tile, press Shift+F10 (or the Menu key). Look at the menu, choose Move to, then another region. Is that a handy way to send a tile to another region?

Desktop files move in (M3)
 5. Open File Explorer at ${join(desk, 'Desktop')}. It holds Try A and Try B, on a fake desktop. Drag both onto a region. Look at the region and at the Explorer window. Is dropping desktop shortcuts onto a region the way you want to add them?
 6. Right-click that region, choose Edit shortcuts, and click ↩ on one of the two new tiles. Look at the region and at the Explorer window. Is ↩ a clear way to put a shortcut back?
 7. Right-click the tray icon and choose Regions... Find Moved shortcuts and click OPEN FOLDER. Look at the folder that opens and at the section. Does the section tell you what you need to find your moved shortcuts?
 8. Right-click a region, choose Move all shortcuts back to desktop..., then click Move back. Look at the Explorer window. Is that a good way to undo it all?

A shortcut dragged from your real desktop is added as a normal tile and stays on the desktop in this run.

Finish: right-click the test QuickLauncher's tray icon and choose Quit QuickLauncher.
```

### The fallback run (`--fallback`)

Its three steps check behaviour (focus, a swallowed click, a key moving a tile), so they are Futaba's. The flag stays for her. Replaces the `if (FALLBACK) { console.log(` block:

```
QuickLaunch regions, fallback run (${seed.apps.length} of your shortcuts, copied)

The regions open as ordinary windows just above the desktop (fallback mode). This run is for Futaba's checks; there is nothing for you to try here.

Finish: right-click the test QuickLauncher's tray icon and choose Quit QuickLauncher.
```

The script's header comment ("Judy's optional 30-second fallback check") can say "Futaba's fallback run"; code comments are outside the copy standard. The summary lines the script prints after the run (regions created, drags, re-layouts) are not asks and stay.

### Where each old check went (Futaba's away-window lists)

"M2b" is `QuickLaunch_QA_RegionsM2b_2026-10-01.md`, section 8; "M3" is `QuickLaunch_QA_RegionsM3_2026-10-04.md`, section 8. Real input stays "pending, next away window"; Sergei is never the one who runs it.

| Old step | The check that moves | Futaba's list |
|---|---|---|
| 1 | New region, hold a tile over it: the 2 px border, the dashed slot, the copy under the pointer, the slot following, the tile landing on release | M2b 1 |
| 2 | Release on empty desktop or in the gap between two regions: nothing moves, nothing launches | M2b 1 |
| 3 | A drag inside one region reorders, as before | M2b 1 |
| 4 | Click an empty spot, Right arrow puts the ring on a tile | **new:** real OS keys on tiles |
| 5 | Ctrl+Right / Ctrl+Left one place; Ctrl+Down / Ctrl+Up one row, none past the last or first row; Delete removes the tile and the ring moves to the next; Shift+F10 outside edit mode starts edit mode with the focus kept | **new:** real OS keys on tiles |
| 5 | Menu key or Shift+F10: one tile menu per press; Move to sends the tile to another region | M2b 2 |
| a | The slot is the theme's bright text accent and exactly a tile's height: no row below jumps, also in edit mode | M2b 1 (the pixels of the drag states) |
| b | Over an empty region the drop hint hides; away, it returns | M2b 1 |
| c | The copy under the pointer looks like the tile picked up | M2b 1 |
| d | The gap closes smoothly after a drag away; reordering inside one region stays instant | M2b 1 |
| e | A drop shows no flicker of the gap closing | M2b 1 |
| f | Fallback: a real click activates a region and is not swallowed, a typed letter filters, Right arrow then Ctrl+Right moves a tile, no region takes the focus by itself | M2b 3, 4, 5 |
| 6 | A smaller resolution, a scale change or a taskbar moved to another edge: the regions fit without overlapping and return to where they were | M2b 9 (the taskbar-edge move is added to it) |
| 7 | Sleep and wake: the regions are where they were | M2b 9 |
| M3 a to e | A real Explorer drag of desktop icons onto a region, ↩, OPEN FOLDER, Move all back | M3 1, 4, 5, 10 |
| 8 (Quit) | The tray's real Quit click | M2b 6, M3 6 |

Two rows have no owner today. **The new item** (real OS keys on tiles) is on neither list; Futaba adds it. **M2b 9** (display, scale, sleep) is forbidden even inside an away window until Sergei says otherwise, so steps 6 and 7 are not run by anyone for now; they were the only planned checks of the home-layout rule on real hardware.

### Futaba measures (each seen to fail on a deliberate break first)

Replaces C7's measure 7.

1. The printed text of the script equals the block above, with the real values in place of `${...}`.
2. Every numbered step holds exactly one question mark, and it ends the step. Break: add a step that ends in a statement, then one with two questions.
3. No step contains "check", "verify", "confirm", "must" or "should". Break: add "Confirm that" to a step.
4. Each step names what to open or click or press or drag and what to look at (the words "Look at" appear once in each). Break: delete one "Look at".
5. The fallback run prints no step and no question.
