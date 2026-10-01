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
