# QuickLaunch theme spec, foundation (Judy, 2026-09-30)

Status: complete. Part A (base layout for all 101 themes), Part B (seven bundled fonts and the adoption map for all 101), Part C (promise-mascot switches to "paper"), unresolved items. Uncommitted, as instructed.

For: Ender, after batch 2 lands. Branch `wip/theme-fidelity`. Sergei's rulings are in `QuickLaunch_ThemeFidelity_Plan_2026-09-29.md`, "Morning rulings".

Inputs read: the audit (sections 1, 7, 8, 9 and every theme entry), batch 1 spec (sections 0, 1.x, 12), batch 2 spec (sections 0 and 8, and the seven type sections), Makoto's reference sheet (every "Type" line and "Bundling candidates"), `base.css`, `index.html`, `app.js` (keyboard router, banner rotation, skin picker, overlay wiring), `check-theme-contrast.js`, all 101 theme files (fonts, clip paths, panel and overlay backgrounds, header text, banner text rules), the gallery metadata, and the batch 1 and current screenshots. Nothing was launched. No font was downloaded. Only this file was written in the repo tree.

**How the numbers were made.** I rebuilt the real `base.css` and `index.html` with the gallery's 14 mock tiles and rendered them in headless Edge 154 (not QuickLaunch), each theme inside an iframe of the exact window size (424x300, 640x420, 1024x700 and the 180x150 minimum). Every Edge launch passed `--user-data-dir=<scratchpad>/judy/profile` (ProcessRules: our tooling must not intrude). I checked the mock against shipped facts: it reproduces batch 1's 84 px header art box and the 4 px scrollbar, and the width method reproduces batch 1's measured title widths (Palatino Bold 139.5 vs 140, Segoe Semilight 135.4 vs 135, Arial Black 108.3 vs 108). Chromium 154 is not Electron 32, so **Ender's measured numbers win** where they differ (one known case: the first header button starts at x 273 in the mock and x 276 in the real app). The scripts and renders are in the session scratchpad under `judy/found/` and are not part of the repo.

## At a glance

| # | Item | Decision |
|---|---|---|
| A1 | Settings overlay cut off at 424x300 (audit 9.1) | **Scrolling body with a pinned footer.** No re-layout. Below 480 px window height the rhythm compacts (about 60 px shorter). CLOSE and CHECK FOR UPDATES are always visible. The skin list flips upward when there is no room below. Esc already closes the overlay. |
| A2 | `#header::after` width conflict (audit 9.6) | Base boundary moves from `right: 135px` to `right: 160px` (it overlapped the first button by 13 px). Legacy header text is 0 px wide below a 480 px window, art hides below 424 px, both hide while the filter chip shows. No theme edit. |
| A3 | Banner truncation (audit 9.7) | **Keep one line.** No two lines, no base tracking change. Add a fit check to the rotation so a line that does not fit is skipped (today 144 of 487 quotes do not fit; no theme has all of its lines too long). |
| A4 | Right-edge geometry (coordinator's addition) | **Adopt `scrollbar-gutter: stable` on `#grid-container`.** The tile field ends at W-20 at every size. Batch 1's and batch 2's `right N px` offsets stay as they are. |
| A-9.4 | `#app` backdrop blur | **Not specced.** Sergei ruled on 2026-09-28 that the blur removal does not ship. `.overlay { backdrop-filter: blur(8px) }` stays too. |
| B | Bundled fonts | Seven family names, weights and fallbacks. **31 of 101 themes adopt at least one** (47 element roles); 70 stay on stock fonts. Batch 1: gryffindor (title) and 2001 (title, labels, banner) change; promise-mascot changes in Part C. Batch 2: akira (title). |
| C | promise-mascot "paper" | Cream newsprint ground, ink outlines, pink and marigold spot inks, halftone header, print marks in the top band, torn pink banner strip. Lowest ratios: **4.89:1 text, 3.20:1 non-text (icon on pressed fill)**. 0 infinite animations. |

---

## Part A. Base-layout fixes for all 101 themes

### A0. Facts measured before deciding

**Settings overlay today (mock, Segoe UI; the panel height depends on the font, see A1.7).**

| Window | Panel | Title | CLOSE button | Result |
|---|---|---|---|---|
| 424x300 | 449 px tall, y -74.5 to 374.5 | y -54.5 to -29.5 (fully off-window) | y 337.5 to 360.5 (fully off-window) | Title and both footer buttons unreachable. The overlay is `position: fixed; inset: 0` and centres the panel, so the overflow is cut at both ends and there is nothing to scroll. |
| 640x420 | 449 px, y -14.5 to 434.5 | y 5.5 to 30.5 | y 397.5 to 420.5 | CLOSE sits flush on the bottom edge; 14.5 px of panel padding is cut. Marginal. |
| 1024x700 | 449 px, y 125.5 to 574.5 | y 145.5 | y 537.5 to 560.5 | Fine. |
| 180x150 (window minimum) | 513 px | off-window | off-window | Broken. |

The keyboard cheat-sheet has the same shape and is marginal at 424x300 (316 px panel, 8 px cut at each end). The apps picker (`#apps-picker`) is a flex column with its own scrolling list and works today.

The gear button cannot close the overlay: the overlay (z-index 300, outside `#app`) covers the whole window, including the header. At the default size today the only way out is Esc. The batch 1 settings screenshots show exactly this (the title is cut off at the top and the footer is missing).

**Esc, read from `app.js` (lines 1523 to 1554, plus 1862 and 1964):**
- The document `keydown` router runs its Escape branch before the "typing in a field" early return, so Esc closes Settings from anywhere in the panel. Order: cheat-sheet first, then Settings, then the apps picker, then it clears the filter.
- While a hotkey is being recorded, the first Esc only cancels the recording (that handler calls `stopPropagation`). Correct.
- In the SKIN field, the first Esc closes the dropdown **and**, because that handler does not stop the event, also closes Settings. Two things close on one keypress. Not specced (see A1.8, offered).

**Header geometry (mock, legacy theme `star-wars-empire` and art theme `promise-mascot`).** Legacy header text is `left: 200px` in 86 themes today; base gives it `right: 135px`, so the box is W-335 px wide (89 px at 424) and its right end sits 13 px inside the first button. Every art theme (14 in the working tree, including akira's and siren's short tags) sets `left: auto; right: 172px; width: 84px` explicitly.

**Scrollbar and right edge (mock, measured with a 1 px marker layer at `right 6px`).** At 424x300 the container has a 4 px scrollbar (client width 420) and the last tile column ends at x 404. At 640x420 and 1024x700 the 14 mock tiles fit, so there is no scrollbar and the last column ends at x 624 and x 1008, that is W-16, not W-20. The marker lands at the same x from the window edge in every case (x 417 at 424, 633 at 640, 1017 at 1024). So background layers are positioned from the window edge (Ender's finding, confirmed), but the tile field moves 4 px toward them when the scrollbar is absent. That is the 1 px keep-out intrusion seen in batch 2.

**Banner fit (measured with each theme's own font, size and tracking against the real box; working tree).** 487 quotes; 144 (30 percent) are wider than 364 px; 69 of 101 themes have at least one such quote; **no theme has all of its quotes too long**; 20 themes show an ellipsis on quote 1 today (listed in A5).

### A1. Settings overlay (audit 9.1)

**Decision: the panel scrolls, the footer stays.** Everything above the footer scrolls inside the panel. The footer (CHECK FOR UPDATES, CLOSE) is pinned to the bottom of the window. The panel is never taller than the window. This is the Fluent content-dialog pattern, it puts CLOSE at the same place at every size (Fitts), and it is the only mechanism that also works at 180x150.

**Why not a re-layout.** Two columns would give about 188 px per column. The hotkey field needs about 195 px (its 143 px placeholder at 11 px with 1.5 px tracking, 20 px of padding, 2 px of border, and the 24 px clear button with its 6 px gap), so it would truncate. The two-column height comes to about 298 px including title and footer, which leaves no spare at 300 px: a font with a taller line box (Yu Gothic adds 40 px, A1.7) would break it again. It also needs a breakpoint, which means a second layout to check in 101 themes, and it would still need scrolling at the window minimum. The scroll fix needs no theme edit.

**A1.1 Markup (`src/renderer/index.html`), two edits.** In `#settings-overlay` and in `#cheatsheet-overlay`: add the class `scroll-panel` to the `.overlay-panel`, and wrap everything between the panel's opening tag and its `.overlay-footer` (the title and all rows or the cheat list) in one `<div class="overlay-scroll">`. The footer stays outside the wrapper. `#apps-picker` is not touched.

```html
<div class="overlay-panel scroll-panel">
  <div class="overlay-scroll">
    <div class="overlay-title">// SETTINGS</div>
    ... all .setting-row blocks, unchanged ...
  </div>
  <div class="overlay-footer"> ... unchanged ... </div>
</div>
```

**A1.2 CSS (`src/renderer/styles/base.css`).** Add this block **after** the `.overlay-footer` rule (line about 677) so it overrides `.overlay-panel`, `.overlay-title`, `.setting-row` and `.overlay-footer` by order and specificity. The `.overlay`, `.overlay-panel`, `.overlay-title` and `.overlay-footer` rules and their `backdrop-filter` stay exactly as they are.

```css
/* ── Scrolling overlays (settings, cheat-sheet) ─────────────────────────────
   The panel never exceeds the window; the body scrolls and the footer stays.
   .overlay-scroll pulls itself out of the panel's 20 px padding (the
   scrollbar sits at the window edge and no dead band shows above the title).
   scrollbar-gutter keeps the row widths the same with and without a scrollbar. */
.scroll-panel { max-height: 100%; display: flex; flex-direction: column; }
.scroll-panel > .overlay-scroll {
  flex: 1 1 auto; min-height: 0;
  overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable;
  margin: -20px -20px 0;            /* undo .overlay-panel padding-top and sides */
  padding: 20px 14px 0 20px;        /* right 14 + the 6 px scrollbar = the old 20 */
}
.scroll-panel > .overlay-scroll.picker-open { overflow-y: hidden; }   /* see A1.4 */
.scroll-panel > .overlay-scroll::-webkit-scrollbar { width: 6px; }
.scroll-panel > .overlay-scroll::-webkit-scrollbar-track { background: transparent; }
.scroll-panel > .overlay-scroll::-webkit-scrollbar-thumb { background: var(--text-dim); border-radius: 3px; }
.scroll-panel > .overlay-footer { flex: none; }
/* Short windows (the default 424x300 and 640x420): tighter vertical rhythm. */
@media (max-height: 480px) {
  .scroll-panel { padding: 14px 20px 10px; }
  .scroll-panel > .overlay-scroll { margin-top: -14px; padding-top: 14px; }
  .scroll-panel .overlay-title { margin-bottom: 12px; padding-bottom: 6px; }
  .scroll-panel .setting-row { margin-bottom: 10px; }
  .scroll-panel > .overlay-footer { padding-top: 10px; }
}
```

**A1.3 Exact values (mock, Segoe UI, promise-mascot). Only the row heights depend on the theme, through `--font` (A1.7); the thumb colour comes from `--text-dim`; nothing else in the block reads a theme value.**

| Window | Panel | Scroller | Footer (pinned) | CLOSE | Scroll range | What the user sees |
|---|---|---|---|---|---|---|
| 424x300 | 300 (the window) | y 0 to 256 | y 256 to 290 (plus 10 px panel padding) | x 347.7 to 404, y 267 to 290 | **81 px** (content 337 in a 256 box) | Title, ICON SIZE, the three checkboxes and the hotkey row at scroll 0; the SKIN label peeks at the bottom edge of the scroller (the cue that more follows), and the 6 px thumb shows. One wheel notch (about 100 px) reaches the end. |
| 640x420 | 381, centred (19.5 px above and below) | y 19.5 to 356.5 | y 356.5 to 390.5 | y 367.5 to 390.5 | **0** | Everything, no scrollbar thumb. |
| 1024x700 | 449, centred | y 125.5 to 520.5 | y 520.5 to 560.5 | y 537.5 to 560.5 | 0 | Identical to today: **0 differing pixels** against the current rendering in promise-mascot, 2001, cyberpunk and dead-space, for both the settings and the cheat-sheet overlays. |
| 180x150 (minimum) | 150 | y 0 to 106 | y 106 to 140 | y 117 to 140 | 310 | Title visible, footer pinned, the rest scrolls. |
| Cheat-sheet 424x300 | 290, centred | y 5 to 251 | y 251 to 285 | y 262 to 285 | 0 | Everything, no scrolling (today it is cut 8 px at each end). |

`#apps-picker` renders pixel-identical before and after at all three sizes (0 differing pixels, four themes).

**A1.4 The skin dropdown on a scrolling panel (`app.js`, the picker block near line 1796).** `.theme-picker-list` is `position: fixed`, positioned once when it opens. Two things must change or it breaks on the new panel:

1. **Placement.** In `openPicker()` compute `below = innerHeight - rect.bottom - 10` and `above = rect.top - 10`. If `below < 150` and `above > below`, open **upward**: `top: auto; bottom: (innerHeight - rect.top + 3) px; max-height: max(80, above - 3) px`. Otherwise open downward as today (`top: rect.bottom + 3; bottom: auto; max-height: max(80, below)`). Measured at 424x300 with the panel scrolled to the end (input y 192 to 220): today's rule gives a list at y 223 to 303, 80 px tall and overhanging the window; the flip gives y 10 to 189, 179 px, six rows. At 640x420 (input y 292.5 to 320.5) the flip gives y 10 to 289.5. The list's `left: 20px; right: 20px` already matches the input (its right edge is at W-20 with the gutter).
2. **Lock the panel while the list is open.** `openPicker()` adds `picker-open` to `.overlay-scroll` and `closePicker()` removes it (CSS above: `overflow-y: hidden`). The gutter is stable, so nothing shifts. Without the lock, wheeling the panel would move the input away from the fixed list.

**A1.5 Keyboard.** Tab order is unchanged. Chromium scrolls a focused control into view inside the scroller, and the pinned footer is always reachable as the last tab stops. Esc behaviour is unchanged (A0).

**A1.6 Where the change does not reach.** The grid, the header, the banner, the edit bar and the update bar are not touched. `.overlay` keeps `position: fixed; inset: 0`, `z-index: 300`, its clip path and its `backdrop-filter`.

**A1.7 Fonts change the panel height, and that is fine.** Same panel, `--font` swapped (scroll range at 424x300): Segoe UI 81 px, Georgia 54, Consolas 57, Yu Gothic 123. At 640x420 only Yu Gothic scrolls (3 px). Part B's fonts can only lengthen or shorten the range; nothing can push the footer off-window again.

**A1.8 Findings offered, not specced.**
- Esc in the skin field closes the dropdown and Settings together (A0). A one-line `stopPropagation` when the list is open would make it a two-step Esc. Say if you want it in.
- SKIN is the row Sergei will use most and it is the sixth of seven; at 424x300 it needs about 45 px of scrolling to show fully. Moving SKIN up (above the hotkey row) would remove that. It is a product call, so I have not done it.
- At 1024x700 the sliders and inputs span the full 1024 px. A `max-width` on the panel would tidy that. Not asked, not done.

**A1.9 Done when (Ender checks; 101 themes at the three sizes plus 180x150).**
1. At 424x300 the title and both footer buttons are fully inside the window at scroll 0, CLOSE is at x 347.7 to 404, y 267 to 290, and a wheel notch reaches VERSION.
2. At 640x420 nothing scrolls and CLOSE is at y 367.5 to 390.5; at 1024x700 the settings and cheat-sheet renderings are pixel-identical to today's.
3. `#apps-picker` renders identically at all three sizes.
4. With the panel scrolled to the end at 424x300, opening the skin list gives a list fully inside the window, above the input, with at least 150 px of height; wheeling the panel while it is open does nothing; Esc, Enter and picking a skin still work.
5. Clipped themes (8 of 101: blade-runner, cyberpunk, dead-space, deus-ex, ghost-shell, mass-effect, shire, warhammer) keep the title corner (20, 14) and the CLOSE corner (20, 10 from the bottom-right) inside their clip: the largest cut at those corners is 18 px (deus-ex), a cut of 30 px or more would clip them.
6. The scrollbar thumb (`--text-dim` on `--panel-bg`) is at least 3:1 in every theme except three whose `--text-dim` already fails its own 4.5:1 gate today: **lovecraft 2.51, dragon-age 2.75, warhammer-chaos 2.93**. Every other theme is 3.15 or better (98 of 101). Those three are fixed by their own batches, because the gate then forces `--text-dim` to 4.5:1 and the thumb follows.
7. `npm run check:contrast` is unchanged (it reads only theme `:root` values).

### A2. `#header::after` (audit 9.6)

**Decision.** Fix the boundary, hide the element when there is no room, and make the rule discriminate between legacy text and art without touching any theme. Replace the block at `base.css` lines 266 to 273 (the comment and the rule) with:

```css
/* #header::after, two kinds of user:
   - legacy flavour text: left: 200px (set by the theme), no width. It gets the box between
     left:200px and right:160px (the buttons start 148 px from the right edge; keep 12 px
     clear), and is 0 wide below a 480 px window, where that box would be under 120 px.
   - header art / tags: the theme sets left:auto, right:172px and an explicit width (84px).
     An explicit width wins over the rule below, so art is unaffected by it. */
#header::after {
  right: 160px;
  width: clamp(0px, calc((100% - 480px) * 1000), calc(100% - 360px));
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Art is anchored 172 px from the right; below the default width it would meet the title. */
@media (max-width: 423px) { #header::after { display: none; } }
/* The filter chip sits where header text or art is. */
#header:has(#filter-chip:not(.hidden))::after { display: none; }
```

**Contract for every theme.** A theme that draws `#header::after` as art or as a tag **must set `width` explicitly** (all 14 in the working tree do: 84 px). A theme with no `content` on `#header::after` (stranger-things) has no box and is unaffected. The per-theme `:has(#filter-chip...)` rules stay; the base rule now duplicates them.

**Measured (mock).** Art theme (promise-mascot) computed box, old rule versus new: at 424, 480, 640 and 1024 identical (left 168 / 224 / 384 / 768, width 84, right 172); at 400 it is hidden (new). Legacy theme (star-wars-empire): 89 px wide at 424 today, 0 px now; at 481 it is 121 px; at 640 280 px; at 1024 664 px; its right end is now at W-160, clear of the first button (12 px in the real app, 9 px in the mock). Typing a letter hides both kinds.

**What the reader will see.** The 86 legacy themes lose their clipped "IMPERIAL CO..." fragment at the default size and get a box of at least 121 px from 481 px up (most strings need about 800 px to show whole; they ellipsise before that, as they do today). That is a visible change to unredesigned themes at the default size. It is the intent of the audit's finding (the text was 8 px, clipped and over a button), but it is a decision Jane can flip: to keep the fragment at 424, delete the `width: clamp(...)` line and keep the `right: 160px`. Nothing else in A depends on it.

### A3. Banner text (audit 9.7)

**Decision: keep one line. Do not add a second line. Do not change the base tracking. Add a fit check to the rotation.**

- **Two lines is rejected.** The banner is 44 px tall and its art lives inside those 44 px: the torn edge (7 px at the top), parasite-eve's skyline along the bottom 13 px (y 31 to 44), promise-mascot's sticker, gryffindor's pennant. Two 11 px lines are 27.5 px tall and would touch the skyline, and the block would jump between one-line and two-line quotes every 14 seconds.
- **Tighter tracking is rejected.** The 81 themes that set 2 px tracking (the base value) are tracked-out on purpose; lowering it to 0.5 px moves the cut from about 40 characters to about 47 for a partial gain, changes 86 unapproved looks, and still cuts what is longer.
- **The fit check.** In the banner rotation (`startBannerCycle` and the tick in `scheduleBannerRotation`): when choosing the next quote, set its text and compare `textEl.scrollWidth <= textEl.clientWidth`; take the first quote (cyclically, starting at the natural next one) that fits; if none fits, show the natural next one (the ellipsis stays as the last resort). Do the measuring during the 380 ms fade-out, while the text is invisible. At theme start, do the first pick inside `document.fonts.ready.then(...)` so a bundled font is loaded before it is measured (Part B).
- **What it does across the 101 themes (measured on the working tree at 424 wide, with each theme's own font).** 144 of 487 quotes fail the check, spread over 69 themes; **no theme has every quote failing**, so no theme would show an ellipsis. After skipping, the rotation holds 1 quote in 8 themes (warhammer-necrons, ministry-of-magic, ravenclaw, hufflepuff, slytherin, scp, lovecraft, broken-sword: a static banner until their own batch writes fitting lines), 2 quotes in 15, 3 in 29, 4 in 28, 5 in 20, 6 in 1. This is a safety net, not the plan: per-theme fitted lines (audit H3) remain the standard, and the net also protects the 15 fitted themes from Part B's font changes.
- **Gallery.** The gallery freezes on the first quote; with the check it freezes on the first quote that fits. Twenty themes change their `current/` banner text for that reason (A5).

### A4. Scrollbar gutter (coordinator's addition)

**Decision: adopt `scrollbar-gutter: stable` on `#grid-container`.** One line in `base.css`, in the `#grid-container` rule:

```css
#grid-container { flex: 1; padding: var(--grid-pad); position: relative; overflow-y: auto; overflow-x: hidden; scrollbar-gutter: stable; }
```

**Why this and not something better.** Positioning the art relative to the tile field is impossible (the art is the container's own background). Showing the scrollbar always (`overflow-y: scroll`) draws the same thing with a less honest name. `scrollbar-gutter: stable both-edges` would move the left edge of the tiles by 4 px and break every left-band offset. Plain `stable` reserves the 4 px on the right only, which is exactly what the approved geometry already has at 424x300.

**Measured (mock).** With and without the property at 424x300 (scrollbar present): nothing changes (client width 420, last column ends at x 404, marker at x 417). At 640x420 and 1024x700: the last column now ends at x 620 and x 1004 (W-20) instead of 624 and 1008; the marker still lands at the same x from the window edge (633, 1017). Column counts are unchanged at all three sizes (3, 5, 9); tiles are 0.8 px narrower at 640 (114.4 vs 115.2) and 0.5 px narrower at 1024; the right padding is 20 px instead of 16 when the grid is short. The column count can drop by one in a 4 px-wide band of window widths (336 to 339, 440 to 443, 544 to 547, and so on, every 104 px); none of the three test sizes is in a band.

**What it means for batch 1 and batch 2.**
- **Batch 1's offsets (cyberpunk `right 6px`, gryffindor `right 8px`, and the others) stay unchanged.** They were tuned for the scrollbar-present geometry (W-20 tile edge). With the gutter reserved, that geometry is now true at every size, so the 4 px that Ender noted as "further in without a scrollbar" disappears. No batch 1 edit.
- **Batch 2's right bands (yakuza, nonary-games) stay unchanged.** They clear the keep-out at 424 (Ender's probe). Both the tile edge (W-20) and the band (`right N`) are now anchored to the right edge at every size, so the clearance is the same constant at 640x420, 1024x700 and any size in between. The 1 px intrusion at 640 and up goes away.
- **The keep-out definition simplifies.** B1 0.1.13 and B2 0.2.1 say "P is W-4 while the scrollbar shows and W when it does not". With this change P is **W-4 at every size**, and the tile field is x 16 to W-20 at every size.
- The header art, banner, left band and top band are unaffected.

### A5. How every one of the 101 themes must still look correct

Ender re-renders all 101 at 424x300 (grid, hover, settings) and compares. Baselines: the 86 legacy themes against `current/`, the 8 batch 1 themes against `after-b01r2/`, the 7 batch 2 themes against their own after-run. Expected differences, and nothing else:

| Shot | Expected difference | Everything else |
|---|---|---|
| grid, hover (424x300) | (a) 86 legacy themes: the header text box (x 200 to W-160, the text line) is empty, A2. (b) 20 themes whose quote 1 did not fit show the first quote that fits, A3: blade-runner, lcars, warhammer-chaos, warhammer-necrons, half-life, star-wars-rebel, star-wars-republic, evangelion, ravenclaw, hufflepuff, slytherin, lovecraft, fatal-frame, event-horizon, game-of-thrones, dragon-age, uncharted, broken-sword, swl-illuminati, ff15 (regenerate this list from the final `THEME_BANNERS`). | Pixel-identical. The grid shot at 424x300 has a scrollbar, so A4 changes nothing there. |
| settings (424x300) | All 101 change: new layout, A1. | Colours, fonts and contrast come from the same theme variables as before; only geometry changes. |
| grid (640x420, 1024x700), if rendered | Tiles are 0.5 to 0.8 px narrower and the right padding is 20 px, A4. | Nothing else. |
| cheat-sheet, apps picker | Cheat-sheet: compact rhythm under 480 px height. Apps picker: identical. | |

Per-theme checks in the settings shot (all 101): title and footer inside the window; the footer buttons keep the theme's own colours and borders; the thumb is visible (A1.9 item 6 lists the three exceptions); no text loses contrast (it uses the same variables); clipped themes keep both corners (A1.9 item 5).

### A6. Which of batch 1's shipped patterns are affected

| Pattern | Affected? | How |
|---|---|---|
| Header zone (`#header::after`, right 172, 84 x 20) | **No theme edit; one new behaviour** | Computed box identical at 424 and above (proved in the mock at 424, 480, 640, 1024). New: hidden below 424 px window width; also hidden while the chip shows (already per theme, now also in base). Titles must still end at x 156 or earlier (Part B enforces it for bundled fonts). |
| Keep-outs (tile field plus 4 px) | **Redefined, no theme edit** | Tile field right edge is W-20 at every size (A4). Left, top and bottom keep-outs unchanged. |
| Frame art in `#grid-container` background (bands FZ-L, FZ-R, FZ-T) | **No** | A1 to A3 do not touch the container. A4 does not move background layers (marker at the same x from the window edge with and without the gutter). No offset changes. |
| Banner (art, icon slot, text box) | No layout change | A3 only changes which quote is chosen. |
| Scrolled tiles cover frame art (never the reverse) | No | Unchanged. |

### A7. Not specced, and the guide rules

**Audit 9.4 (removing `#app` `backdrop-filter: blur(18px)`, and the `.overlay` blur) is not specced.** Sergei ruled on 2026-09-28 that the blur removal does not ship. Nothing in Part A touches `backdrop-filter`.

**Audit 9.2, 9.3, 9.5 and 9.9 are Ender's** (the `\A` warning in the guide, the rewritten guide and the studio-skin skill, the contrast gate extension, the gallery backdrop). For 9.3 the guide should adopt these rules, unchanged from the audit except where a clause is added because of what batches 1 and 2 taught:

1. **H1** Delete `#grid-container::before` and `::after` (panno and ghost readout). Container pseudo-elements scroll with the tiles, so frame art goes in `#grid-container`'s `background`.
2. **H2** `#header::after`: delete it, or draw art or a tag of at most 14 characters inside the 84 x 20 header zone (`left: auto; right: 172px`, **explicit `width`**), hidden while the chip shows.
3. **H3** Banner and edit-bar strings fit on one line at 424 px (`scrollWidth <= clientWidth`); edit-bar text is deleted. The rotation's fit check (A3) is the net, not the plan.
4. **H4** No synchronised flash or blackout.
5. **H5** No full-window `background-position` scroll on `#particles`.
6. **H6** Tile icon shapes may repeat inside a family and must never crop the glyph (state the margin).
7. **H7** `--tile-icon-fx` may tint but keeps every plate at 3:1 on rest, hover and pressed; no `brightness()` below 1.0 on a dark theme (light themes may darken).
8. **H8** Type comes from the stock list (audit C2) or the seven bundled families through the Part B map; nothing else.
9. **C4** At most 2 infinite animations (batches 1 and 2 reached 0 or 1), none on `#app` box-shadow, none on full-window `background-position`, no `will-change`, no `backdrop-filter`.
10. **C5** Nothing covers the content: tile field is x 16 to W-20 (gutter reserved) and y 56 to the banner top; 4 px keep-out; art only in the frame bands, header zone, banner and icon slot; only tone and texture behind the tiles; check every state and the three sizes.

---

## Part B. Bundled fonts (Sergei approved all seven)

The approval covers these seven files and nothing else. Any other font needs a new OK from Sergei (B7 lists the ones I still wish for). Files, sizes and licences are from Makoto's "Bundling candidates" table; I downloaded nothing.

### B1. The families and how to declare them

Ender decides where the `@font-face` declarations live (a `fonts.css` linked before the theme, or inside `base.css`) and where the files sit. Every theme refers to the **exact family strings below** and nothing else.

| CSS family (exact string) | File (google/fonts, `ofl/...`) | Bytes | Declared `font-weight` | Style | Cyrillic |
|---|---|---|---|---|---|
| `'Dela Gothic One'` | `DelaGothicOne-Regular.ttf` | 2,508,848 | `400` | normal | yes (also kana and kanji) |
| `'Jost'` | `Jost[wght].ttf` (variable) | 134,996 | `100 900` | normal (no italic file) | yes |
| `'Cinzel'` | `Cinzel[wght].ttf` (variable) | 125,468 | `400 900` | normal | no |
| `'Pirata One'` | `PirataOne-Regular.ttf` | 56,316 | `400` | normal | no |
| `'UnifrakturCook'` | `UnifrakturCook-Bold.ttf` (the only weight the family ships) | 42,688 | `700` | normal | no |
| `'IM Fell English'` | `IMFeENrm28P.ttf` (roman; the italic file is **not** bundled) | 194,992 | `400` | normal | no |
| `'Metamorphous'` | `Metamorphous-Regular.ttf` | 135,740 | `400` | normal | no |

Total 3,199,048 bytes (3.05 MiB), plus seven `OFL.txt` files (30,458 bytes) that ship next to their font. Dela Gothic One is 78 percent of the total; Chromium loads a family only when a theme first uses it, so themes that do not use it pay nothing at startup.

Declaration rules:
- One `@font-face` per file: `font-family` (string above), `src: url(...) format('truetype')`, the declared weight from the table, `font-style: normal`, **`font-display: block`**. The files are local, so the blocking period is milliseconds; `swap` would paint the fallback first and then reflow titles and the banner (and the A3 fit check).
- Files whose names contain brackets (`Jost[wght].ttf`, `Cinzel[wght].ttf`): either percent-encode them in the `url()` (`%5Bwght%5D`) or rename the file when copying (`Jost-VF.ttf`, `Cinzel-VF.ttf`). A file rename is not a change to the font, so the OFL is unaffected. Ship the fonts unmodified with their `OFL.txt`.
- **No CSP change** is needed: `font-src` falls back to `default-src 'self' data:` and the fonts are same-origin files. Confirm in the packaged build, not only in the gallery.
- Add the fonts folder to the electron-builder `files` list so the installer carries them.
- Reference **only** the seven strings. This machine also has `Cinzel Black`, `Russo One` and other Google faces installed; a screenshot taken here could show one of them by accident. A bundled `@font-face` named `'Cinzel'` shadows any installed `Cinzel`, but `'Cinzel Black'` is a different family name and must never appear in a theme.

### B2. Rules for using them

1. **Display faces are for `#title` only.** Dela Gothic One, Pirata One, UnifrakturCook and Cinzel never set tile labels, with one exception (warhammer, B3). Tile labels are the app's main functional text: they must stay legible and keep a Cyrillic fallback. **Text faces** may set more: Jost (title, labels, banner), IM Fell English (title, banner), Metamorphous (title).
2. **Only declared weights, no synthesis.** Add `font-synthesis: none` to every rule that sets a bundled family. Base gives `#title` `font-weight: 700`; on a Regular-only family that would draw a faux bold, so **every theme sets `font-weight: 400` on `#title`** for Dela Gothic One, Pirata One, IM Fell English and Metamorphous, `700` for UnifrakturCook, and a value inside the range for Cinzel (400 to 900) and Jost (100 to 900; variable fonts accept any number, 350 works).
3. **IM Fell English is roman only.** Any element set in it must also set `font-style: normal`; a theme whose banner or labels are italic cannot use it there (that is why shire keeps Georgia and hogwarts keeps Constantia italic).
4. **Blackletter is lowercase.** Uppercase Fraktur capitals are hard to read. UnifrakturCook titles get `text-transform: lowercase`, so the title reads `quick.launch`. Pirata One titles stay uppercase (its capitals are designed to be read).
5. **Title width gate.** `#title.getBoundingClientRect().right` must be at most **156 px** (the header art starts at 168, keep 12 px clear). The budget is 144 px for 12 glyphs (`QUICK.LAUNCH`) at 11 px. Start at the value the theme has today (or its spec). If the measured right edge is over 156, take the first step that fits: reduce `letter-spacing` by 1 px at a time down to 1 px; then `font-size: 10px`; then drop the bundled font for the title and keep the stock stack. Report the final edge. The safe tracking ceiling at 11 px, from `floor(12 - 11 x widest cap advance in em)`, is: **Dela Gothic One 1 px, Pirata One 4, Cinzel 3, Jost 3, IM Fell English 3, UnifrakturCook 3, Metamorphous 2.** Only Cinzel's advance is measured (0.778 em for the installed Cinzel Black, which bounds the bundled variable font at 700 and below). The others are my upper bounds (Dela Gothic One 1.00, Pirata One 0.70, Jost 0.75, IM Fell English 0.80, UnifrakturCook 0.75, Metamorphous 0.85 em) and have not been measured, because the files are not installed here; the ladder, not this table, is binding.
6. **Label gate (Jost and warhammer's Cinzel).** The six standard labels (Notepad, Calculator, Paint, Terminal, Browser, Files) must fit the 100 px label box without an ellipsis. If one does not, reduce `--tile-label-spacing` in 0.5 px steps to 0.3 px, then drop the bundled label font.
7. **Banner.** Every line of that theme must fit on one line (`scrollWidth <= clientWidth`). IM Fell English banners are set at 12 px (its x-height is small). A3's fit check is the net, not the plan.
8. **`#title { line-height: 1.2 }`** for themes with a bundled display face, so a tall normal line height cannot push the title stack (title, version line) inside the 40 px header.
9. **Wait for the fonts.** The gallery and every after-run wait for `document.fonts.ready` before capturing, and record the loaded families in `fontsRendered`. Positive control: each adopted family is listed. Negative control: one probe element with a deliberately misspelled family must fall back (proves the check can fail).
10. **Panels get taller or shorter with the font.** The overlay scroller (A1) absorbs it. Nothing else in the layout depends on line height (labels have `line-height: 1.2`).

### B3. Adoption map, all 101 themes

The map is a **decision** (which face, on which element, at which weight). Starting values are the theme's own; the B2 ladders and gates settle the final tracking and size when the theme is built or edited. **Timing:** Ender applies the four themes marked "now" once batch 2 has landed (gryffindor, 2001, akira, and promise-mascot through Part C). The other 27 adopters are applied by their own batch spec, which cites this table and re-runs the gates; no unredesigned theme is edited for type before its batch.

**Themes that adopt at least one bundled font (31).** T is `#title`, L is `.tile-label`, B is `#theme-banner-text`. A dash means the stock font stays.

| Theme | Batch | T `#title` | L `.tile-label` | B banner text |
|---|---|---|---|---|
| 2001 | 1 (now) | `Jost` 350 (start at the shipped 5px tracking and step down) | `Jost` 350 (uppercase 1.5px) | `Jost` 350 (11px) |
| gryffindor | 1 (now) | `Cinzel` 700 (tracking 3px, was Palatino 700 at 4px) | - | - |
| promise-mascot | 1 (now, Part C) | `Dela Gothic One` 400 (Part C) | - | - |
| akira | 2 (now) | `Dela Gothic One` 400 (tracking 1px, was Arial Black 900 at 2px) | - | - |
| ac-assassins | 3 | `Cinzel` 700 | - | - |
| ac-templars | 3 | `Jost` 300 | `Jost` 300 | `Jost` 300 |
| swl-templar | 3 | `UnifrakturCook` 700 (lowercase) | - | `IM Fell English` 400 (roman only, 12px) |
| warhammer | 4 | `UnifrakturCook` 700 (lowercase) | `Cinzel` 500 (uppercase) | `IM Fell English` 400 (roman only, 12px) |
| warhammer-chaos | 4 | `Pirata One` 400 | - | - |
| ff14 | 5 | `Cinzel` 600 | - | - |
| ff15 | 5 | `Jost` 300 (wide tracking) | `Jost` 300 | `Jost` 300 |
| ff8 | 5 | `Jost` 300 | `Jost` 300 | `Jost` 300 |
| star-wars-republic | 6 | `Cinzel` 600 | - | - |
| amnesia | 7 | `IM Fell English` 400 | - | - |
| event-horizon | 7 | `Cinzel` 600 | - | - |
| lovecraft | 7 | `IM Fell English` 400 | - | `IM Fell English` 400 (roman only, 12px) |
| tomb-raider | 8 | `Cinzel` 700 | - | - |
| diablo | 9 | `Pirata One` 400 | - | - |
| dragon-age | 9 | `Metamorphous` 400 | - | - |
| game-of-thrones | 9 | `Cinzel` 700 | - | - |
| the-witcher | 9 | `Metamorphous` 400 | - | - |
| wow-alliance | 9 | `Cinzel` 700 | - | - |
| wow-horde | 9 | `Metamorphous` 400 | - | - |
| wow-legion | 9 | `Pirata One` 400 | - | - |
| wow-scourge | 9 | `Pirata One` 400 | - | - |
| hogwarts | 10 | `IM Fell English` 400 | - | - |
| mordor | 10 | `Metamorphous` 400 | - | - |
| ravenclaw | 10 | `Cinzel` 600 | - | - |
| slytherin | 10 | `Cinzel` 600 | - | - |
| dune | 11 | `Jost` 300 (very wide tracking) | `Jost` 300 | `Jost` 300 |
| portal | 14 | `Jost` 400 | `Jost` 400 | `Jost` 400 |

**Themes that stay on stock fonts (70).** Two reasons: the stock face is already the franchise's type or the closest we can get (R), or the better face is not among the seven (N, and the wish is in B7).

| Theme | Batch | Why it stays stock |
|---|---|---|
| cyberpunk | 1 | N: Rajdhani or Chakra Petch |
| dead-space | 1 | N: Oxanium |
| persona-4 | 1 | R: Arial Black is within a point of the Bowlby One wish |
| shire | 1 | R: Gabriola title and Georgia italic banner; IM Fell has no italic here |
| stranger-things | 1 | N: Playfair Display or Libre Bodoni (Benguiat is proprietary) |
| nonary-games | 2 | N: DSEG |
| parasite-eve | 2 | N: Cormorant Garamond (Cinzel rests on an unverified recollection) |
| persona-3 | 2 | N: Oswald |
| persona-5 | 2 | R: Impact italic already gives the slanted caps (Anton wish) |
| siren | 2 | N: Zen Kurenaido |
| yakuza | 2 | N: Reggae One, Shippori Mincho |
| doom-classic | 3 | N: Press Start 2P |
| doom-eternal | 3 | N: Russo One, Saira Condensed |
| swl-dragon | 3 | N: Noto Sans KR, Rajdhani |
| swl-illuminati | 3 | R: Segoe UI Semibold; the faction type is unverified |
| warhammer-eldar | 4 | N: Cormorant Garamond, Marcellus |
| warhammer-necrons | 4 | N: Orbitron, Oxanium |
| warhammer-orks | 4 | N: Rubik Dirt, Permanent Marker |
| warhammer-tyranids | 4 | R: no native script; stock Constantia bold |
| ff10 | 5 | N: Marcellus, Josefin Sans |
| ff6 | 5 | N: Press Start 2P, DotGothic16 |
| ff7 | 5 | N: Rajdhani, Orbitron |
| ff9 | 5 | N: Almendra, Cinzel Decorative |
| star-wars-empire | 6 | N: Libre Franklin, Barlow Condensed |
| star-wars-mando | 6 | N: Saira Extra Condensed |
| star-wars-rebel | 6 | N: Black Ops One, Libre Franklin |
| star-wars-separatist | 6 | N: Michroma, Saira |
| star-wars-sith | 6 | R: Bahnschrift is angular; Cinzel is too round (Oxanium wish) |
| alan-wake | 7 | N: Special Elite, Playfair Display |
| blair-witch | 7 | N: VT323, Nanum Pen Script |
| silent-hill | 7 | R: light foggy theme; Georgia italic |
| tiny-bunny | 7 | N: Underdog, Marck Script (Cyrillic) |
| broken-sword | 8 | R: Gabriola title fits the painted-storybook look |
| indiana-jones | 8 | N: Rye, Special Elite |
| life-is-strange | 8 | N: Caveat, Kalam |
| the-sandman | 8 | N: Cormorant Garamond |
| twin-peaks | 8 | N: Bebas Neue, Oswald |
| uncharted | 8 | N: Caveat, Homemade Apple |
| x-files | 8 | N: Special Elite, Oswald |
| mortal-kombat | 9 | R: Bahnschrift bold caps; Metamorphous and Pirata One are too ornate for the game |
| wow-nightelf | 9 | N: Cormorant Garamond, Almendra |
| hufflepuff | 10 | N: EB Garamond, Alegreya (Cinzel is too formal for a warm house) |
| ministry-of-magic | 10 | N: Limelight, Poiret One, Special Elite |
| rivendell | 10 | N: Cormorant Garamond, Marcellus, Cinzel Decorative |
| blade-runner | 11 | N: Michroma, Chakra Petch |
| doctor-who | 11 | N: Oswald, Bebas Neue |
| eve-online | 11 | N: Exo 2, Titillium Web |
| firefly | 11 | N: Rye, Sancreek |
| lcars | 11 | N: Antonio, Oswald |
| mass-effect | 11 | N: Michroma, Orbitron |
| the-expanse | 11 | N: Barlow, Rajdhani |
| control | 12 | R: Bahnschrift small caps is the Federal-grotesque stand-in |
| fatal-frame | 12 | N: Shippori Mincho, Zen Antique |
| resident-evil | 12 | N: Special Elite, Michroma |
| scp | 12 | R: Consolas and Segoe UI (the wiki look) |
| soma | 12 | N: Saira Stencil One, Share Tech Mono |
| stalker | 12 | N: Russo One, Stalinist One (Cyrillic) |
| alien | 13 | N: Share Tech Mono, Michroma |
| half-life | 13 | R: Trebuchet MS bold is the HL1 HUD look |
| matrix | 13 | R: Consolas is right |
| metal-gear | 13 | N: Share Tech Mono, Stardos Stencil |
| pip-boy | 13 | N: VT323 |
| predator | 13 | N: Black Ops One, Saira Stencil One |
| robocop | 13 | N: Orbitron, Black Ops One |
| terminator | 13 | N: Orbitron, Share Tech Mono |
| deus-ex | 14 | R: Bahnschrift and Consolas |
| evangelion | 14 | N: Shippori Mincho B1, Zen Antique |
| ghost-shell | 14 | N: Share Tech Mono, Exo 2 |
| mirrors-edge | 14 | N: Inter, Work Sans |
| tron | 14 | N: Orbitron, Michroma, Audiowide |

### B4. Batch 1 and batch 2: exactly what changes

Sergei approved batch 1's looks, so these are type-only edits, each with the forced adjustment named.

**Batch 1 (8 themes). Three change type; five do not.**

| Theme | Change |
|---|---|
| **promise-mascot** | Replaced by Part C: `#title` becomes Dela Gothic One 400. Labels and banner text stay Yu Gothic Bold. |
| **gryffindor** | `#title` only. From Palatino Linotype 700 at 4 px tracking to **Cinzel 700 at 3 px tracking** (`font-family: 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 700; font-style: normal; letter-spacing: 3px; font-synthesis: none; line-height: 1.2`). Forced adjustment: Cinzel's capitals are wider, so tracking drops by 1 px. Measured with the installed Cinzel Black (an upper bound for the variable font at 700): 97.0 px of glyphs plus 12 x 3 = **133.0 px, right edge x 145, 23 px clear of the art at 168** (with 4 px it would be 145.0 px and x 157, over the gate). Colour, labels (Palatino italic) and banner (Palatino italic 12 px) are unchanged. |
| **2001** | Title, labels and banner move from Segoe UI Semilight to **Jost at weight 350** (a variable font, so 350 is exact). `#title { font-family: 'Jost', 'Segoe UI Semilight', 'Segoe UI', sans-serif; font-weight: 350; font-synthesis: none }`, `.tile-label { font-family: same stack }`, `#theme-banner-text { font-family: same stack; font-weight: 350 }`. Sizes, uppercase, colours and the 1.5 px / 0.5 px tracking start where they are. Forced adjustment is likely on the title: Jost's capitals are expected to be wider than Semilight's (0.603 em measured; Jost is unmeasured), so at the shipped 5 px the title may pass 156; the ladder takes it to 4 px, then 3 px (my expectation 4 px, unmeasured). Labels may need 1.0 px. Banner lines are sentence case and Jost's lowercase is narrower than Segoe's, so they should fit as they are (widest line 298 px of 364 today). |
| persona-4 | No change. Arial Black is within one point of the wished Bowlby One (not approved) and none of the seven suits the P4 title better. |
| cyberpunk | No change. The wished faces are Rajdhani or Chakra Petch (not approved); Bahnschrift stays. |
| stranger-things | No change. The wish is Playfair Display or Libre Bodoni (not approved); Benguiat is proprietary. |
| shire | No change. Gabriola and Georgia italic already read as storybook; IM Fell English has no italic here. |
| dead-space | No change. The wish is Oxanium (not approved). |

**Batch 2 (7 themes). One changes; six do not.** Batch 2 is being built with stock fonts; the change below is a follow-up edit after it lands.

| Theme | Change |
|---|---|
| **akira** | `#title` only. From Arial Black 900 at 2 px to **Dela Gothic One 400 at 1 px** (`font-family: 'Dela Gothic One', 'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif; font-weight: 400; letter-spacing: 1px; font-synthesis: none; line-height: 1.2`; colour and no text-shadow unchanged). Forced adjustment: Dela Gothic One is expected to be wider than Arial Black (0.761 em measured; Dela is unmeasured), so tracking drops to 1 px, the ceiling in B2 rule 5. The header tag (Yu Gothic Bold 11 px, kana and kanji at small size), labels (Arial Bold) and banner (Arial Bold) stay: a heavy kanji at 11 px fills in. |
| yakuza | No change. Impact is already the heavy title; the wish is Reggae One or Shippori Mincho (not approved). |
| parasite-eve | No change. Makoto's white-serif logo is an unverified recollection, and the wish is Cormorant Garamond (not approved). I did not spend a bundled face on a guess. |
| nonary-games | No change. The wish is DSEG (not approved). |
| siren | No change. The wish is Zen Kurenaido (not approved). |
| persona-3 | No change. The wish is Oswald (not approved); Bahnschrift is close. |
| persona-5 | No change. Impact italic already gives the slanted heavy capitals. |

### B5. Cyrillic

Only Dela Gothic One and Jost contain Cyrillic. Where Cyrillic text appears in this app: user tile names in `.tile-label` (any theme), tiny-bunny's own header, banner and name plate (Georgia italic, not an adopter) and stalker's tag (not an adopter). Everything an adopter sets in a bundled face is a Latin string (`QUICK.LAUNCH` and the banner lines), except **tile labels**, and labels use a bundled face in only 7 themes: the six Jost themes (Jost has Cyrillic, so Cyrillic names keep Jost) and **warhammer** (Cinzel). Chromium falls back glyph by glyph, so a Cyrillic tile name in warhammer shows in the next family of the stack while Latin names stay in Cinzel; no missing-glyph boxes appear.

Write this fallback after the bundled family in every stack (each fallback covers U+0416 and U+042F: Arial Black, Segoe UI, Palatino Linotype, Georgia and Times New Roman were checked in batches 1 and 2):

| Bundled family | Fallback stack |
|---|---|
| Dela Gothic One | `'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif` |
| Jost | the theme's own stock stack, for example `'Segoe UI', Arial, sans-serif` (2001: `'Segoe UI Semilight', 'Segoe UI', sans-serif`) |
| Cinzel | `'Palatino Linotype', Palatino, Georgia, serif` |
| Pirata One | `Georgia, 'Times New Roman', serif` |
| UnifrakturCook | `'Palatino Linotype', Palatino, Georgia, serif` |
| IM Fell English | `Georgia, 'Times New Roman', serif` |
| Metamorphous | `'Palatino Linotype', Palatino, Georgia, serif` |

### B6. Adoption counts

| Family | Count | Title | Labels | Banner | Themes |
|---|---|---|---|---|---|
| Cinzel | **11** | 10 | 1 | 0 | ac-assassins, event-horizon, ff14, game-of-thrones, gryffindor, ravenclaw, slytherin, star-wars-republic, tomb-raider, warhammer (labels), wow-alliance |
| Jost | **6** | 6 | 6 | 6 | 2001, ac-templars, dune, ff15, ff8, portal |
| IM Fell English | **5** | 3 | 0 | 3 | amnesia, hogwarts, lovecraft, swl-templar, warhammer |
| Pirata One | **4** | 4 | 0 | 0 | diablo, warhammer-chaos, wow-legion, wow-scourge |
| Metamorphous | **4** | 4 | 0 | 0 | dragon-age, mordor, the-witcher, wow-horde |
| Dela Gothic One | **2** | 2 | 0 | 0 | akira, promise-mascot |
| UnifrakturCook | **2** | 2 | 0 | 0 | swl-templar, warhammer |

31 themes adopt at least one family (some use two or three); 47 element roles in total; 70 themes stay stock. Every one of the seven families is used at least twice.

### B7. Not approved: fonts I still wish for

Nothing here is approved or used. Each needs a new OK from Sergei, with file name, source and size. Roughly ranked by how many themes it would lift and how much.

| Font | Themes it would lift | Note |
|---|---|---|
| Rajdhani (or Chakra Petch) | cyberpunk, ff7, swl-dragon, the-expanse; Chakra Petch also blade-runner | cyberpunk is the batch 1 theme that misses a font most; no Cyrillic |
| Oswald | persona-3, lcars, doctor-who, twin-peaks, x-files | tall condensed; has Cyrillic |
| Cormorant Garamond | parasite-eve, warhammer-eldar, wow-nightelf, rivendell, the-sandman | the elegant-serif themes; has Cyrillic |
| Special Elite | resident-evil, alan-wake, x-files, ministry-of-magic, indiana-jones | typewriter (Apache 2.0); no Cyrillic |
| Orbitron / Michroma | tron, terminator, robocop, mass-effect, blade-runner, warhammer-necrons | reads as generic sci-fi; the audit left them out on purpose |
| Share Tech Mono | alien, ghost-shell, metal-gear, soma, terminator | terminal themes; no Cyrillic |
| Russo One and Stalinist One | stalker, doom-eternal | **Cyrillic**: stalker's tag needs one of them; Russo One is installed on this machine but is not stock Windows |
| Underdog or Marck Script | tiny-bunny | **Cyrillic**: the only theme whose own banner is Russian |
| Shippori Mincho B1, Zen Antique, Reggae One, Rampart One | evangelion, yakuza, fatal-frame, akira | Japanese display faces; Zen Antique and Reggae One have Cyrillic |
| Libre Franklin, Black Ops One | star-wars-empire, star-wars-rebel, predator | saga sans and stencil |
| Press Start 2P | doom-classic, ff6 | pixel type; has Cyrillic |
| Rye, Sancreek | firefly, indiana-jones | wood type |
| Playfair Display or Libre Bodoni | stranger-things, alan-wake | closest free match to a heavy Bodoni |
| Oxanium | dead-space, star-wars-sith, warhammer-necrons | angular sci-fi |
| Marcellus, Cinzel Decorative, Grenze Gotisch, Almendra, Uncial Antiqua | ac-assassins, ff10, ff9, rivendell, warhammer-chaos, wow-legion, wow-scourge, mordor | second-choice faces for themes that adopt a plain Cinzel or Pirata One above |
| DSEG, Anton, Bowlby One, Zen Kurenaido | nonary-games, persona-5, persona-4, siren | one theme each; stock is within a point |

---

## Part C. promise-mascot switches to "paper" (replaces section 1 of the batch 1 spec)

**Ruling (Sergei, 2026-09-30).** The lighter printed-paper look, closer to the real game: a bright, flat Showa print, not the near-black grade. This answers flag 3 of batch 1 section 12.7 (the dark grade capped the theme's recognisability at 4).

**Direction.** A Showa print. Cream newsprint ground, ink outlines, two spot inks (spirit pink and marigold), flat colour, hard offset shadows like a misregistered print, a pink halftone in the header, printer's marks in the top band, a torn pink strip for the banner. Nothing is invented: no company copy, no smiley, no confetti, and no game mascot (the black spirit blob, the paper dolls and the mascot head are generic shapes, C1). The audit's section 4 palette (washed near-black) is superseded by this ruling.

**What is kept, adapted and new.**

| Piece | Batch 1 (dark, shipped) | Paper |
|---|---|---|
| Ground | `#1C1A1E` | cream newsprint `#EFE6CB` |
| Tiles | dark cards, pink hover with a hard shadow | paper cards `#FAF5E4`, 1 px ink border, 2 px ink hard shadow; hover is pale pink with a pink 3 px shadow. **Same motion** (lift 1 px, press 2 px, 0.08 s) |
| Header | plum `#26232A`, pink rule inside the header, beige dolls, blob | paper `#E8DDBE` with a faint pink halftone, **same 3 px pink rule inside the header**, same art box (x 168 to 252); dolls become white paper cut-outs with an ink outline; the blob is unchanged |
| Banner strip | beige paper, dark torn edge, black blob icon, pink sticker | **kept as a torn paper strip**, now pink `#EE6A9E`; torn edge in the ground colour; blob icon kept (cream eyes); the mascot sticker keeps its shape and becomes a yellow head with a paper border |
| Texture | light grain plus white halftone | ink grain (peak alpha 0.10, same 200 px tile); the halftone moves into the header only |
| Print marks | none | new: a four-swatch colour bar and a registration mark in the top band |
| Type | Arial Black title | **Dela Gothic One** title; Yu Gothic Bold labels and banner unchanged |

### C.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #EFE6CB;
  --panel-bg: #FAF5E4;
  --overlay-bg: #EFE6CB;
  --header-bg: #E8DDBE;
  --font: 'Segoe UI', 'Yu Gothic', Arial, sans-serif;
  --text: #241E1B;
  --text-dim: #5A5046;
  --accent-c: #D23A7A;
  --accent-m: #9F1A53;
  --accent-y: #F0C020;
  --accent-text: #B01D5B;
  --border: #241E1B;
  --border-h: #D23A7A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 2px #D23A7A;
  --title-anim: none;
  --tile-hover-bg: #FDE8EF;
  --tile-hover-border: #D23A7A;
  --tile-hover-shadow: 3px 3px 0 #D23A7A;
  --tile-active-bg: #FBDDE8;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.9) brightness(0.8) drop-shadow(2px 2px 0 rgba(36,30,27,0.9));
  --tile-icon-shape: none;
  --tile-label-spacing: 0.3px;
  --tile-label-transform: none;
  --tile-label-weight: 700;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #FDE8EF;
  --btn-active-bg: #FBDDE8;
  --drop-hint-border: #7F735C;
  --drop-icon-color: #7F735C;
  --hint-sub-color: #5A5046;
  --rename-dashed: #D23A7A;
  --rename-input-bg: #FDE8EF;
  --edit-bar-bg: #F9DCE7;
  --edit-bar-border: #D23A7A;
  --edit-label-color: #9F1A53;
  --edit-label-glow: none;
  --btn-done-color: #9F1A53;
  --btn-done-border: #D23A7A;
  --btn-done-hover-bg: #F6C9D9;
  --btn-done-hover-glow: none;
  --btn-add-border: #7F735C;
  --update-bg: #FBEBB0;
  --update-border: #D9A414;
  --update-color: #5A4200;
  --update-btn-border: #8A6400;
  --update-btn-hover-bg: #F4DC82;
  --update-btn-hover-glow: none;
  --btn-close-color: #9F1A53;
  --btn-close-border: #D23A7A;
  --btn-close-hover-bg: #F9DCE7;
  --btn-close-hover-glow: none;
  --picker-search-bg: #FDE8EF;
  --picker-item-hover-bg: #FDE8EF;
  --picker-item-active-bg: #FBDDE8;
  --picker-placeholder-bg: #FDE8EF;
  --skin-btn-active-bg: #FBDDE8;
  --remove-btn-bg: #9F1A53;
  --remove-btn-border: #241E1B;
}
```

How the palette is built. **Ink** `#241E1B` is the one dark: text, borders, hard shadows, the blob. **Paper** `#FAF5E4` is the lightest surface (tiles, settings panel, chip). **Ground** `#EFE6CB` is the window. **Spot pink** `#E0508C` (the game's spirit pink) only appears in art and in the title's misregistration shadow; everything that has to be read or seen as a line uses a deeper pink: `--accent-c` `#D23A7A` for lines, rings, borders and shadows (3.64:1 on the ground; the spot pink itself is 2.96:1 there, just under 3), `--accent-text` `#B01D5B` for small pink text, `--accent-m` `#9F1A53` for edit, close and error text and the title dot. **Marigold** `#F0C020` is a fill only (the sticker, a colour-bar swatch). The banner strip is `#EE6A9E`, lighter than the spot pink so ink text on it clears 5.6:1. All backgrounds are opaque hex (alpha 1.0); nothing bleeds a wallpaper through, so the over-white check has nothing to test. The five gate variables are opaque hex and are not repeated in any comment above `:root`.

**Gate pairs** (what `npm run check:contrast` checks; opaque, so no flattening effect):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#241E1B` on `#EFE6CB` | 4.5:1 | **13.20:1**  |
| --text-dim on --bg | `#5A5046` on `#EFE6CB` | 4.5:1 | **6.31:1**  |
| --accent-c on --bg | `#D23A7A` on `#EFE6CB` | 3:1 | **3.64:1**  |
| --accent-text on --bg | `#B01D5B` on `#EFE6CB` | 3:1 | **5.31:1**  |
| --hint-sub-color on --bg | `#5A5046` on `#EFE6CB` | 4.5:1 | **6.31:1**  |

**Add-on pairs** (every other text and control colour on its real surface; "worst grain speck" is a pixel with the grain at its peak alpha 0.10; "worst halftone dot" is the header's pink dot at alpha 0.14):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#241E1B` on `#FAF5E4` | 4.5:1 | **15.08:1**  |
| Tile label on tile hover | `#241E1B` on `#FDE8EF` | 4.5:1 | **14.07:1**  |
| Tile label on tile pressed | `#241E1B` on `#FBDDE8` | 4.5:1 | **13.01:1**  |
| Tile label on rest, worst grain speck (alpha 0.10) | `#241E1B` on `#E5E0D0` | 4.5:1 | **12.46:1**  |
| Tile label on hover, worst grain speck (alpha 0.10) | `#241E1B` on `#E7D4DA` | 4.5:1 | **11.62:1**  |
| Tile label on pressed, worst grain speck (alpha 0.10) | `#241E1B` on `#E6CAD4` | 4.5:1 | **10.78:1**  |
| Tile label (renameable hover) accent-text on tile hover | `#B01D5B` on `#FDE8EF` | 4.5:1 | **5.66:1**  |
| Title (--text) on header | `#241E1B` on `#E8DDBE` | 4.5:1 | **12.16:1**  |
| Title on header, worst halftone dot | `#241E1B` on `#E7C9B7` | 4.5:1 | **10.53:1**  |
| Title dot (accent-m) on header | `#9F1A53` on `#E8DDBE` | 4.5:1 | **5.65:1**  |
| Title dot on header, worst halftone dot | `#9F1A53` on `#E7C9B7` | 4.5:1 | **4.89:1**  |
| Header version (text-dim) on header | `#5A5046` on `#E8DDBE` | 4.5:1 | **5.81:1**  |
| Header version on header, worst halftone dot | `#5A5046` on `#E7C9B7` | 4.5:1 | **5.03:1**  |
| Header button glyph (text) on header | `#241E1B` on `#E8DDBE` | 4.5:1 | **12.16:1**  |
| Header button glyph on button hover fill | `#241E1B` on `#FDE8EF` | 4.5:1 | **14.07:1**  |
| Header button border on header (non-text) | `#241E1B` on `#E8DDBE` | 3:1 | **12.16:1**  |
| Filter chip text (accent-text) on chip | `#B01D5B` on `#FAF5E4` | 4.5:1 | **6.07:1**  |
| Filter chip border on header (non-text) | `#241E1B` on `#E8DDBE` | 3:1 | **12.16:1**  |
| Banner text on pink strip | `#241E1B` on `#EE6A9E` | 4.5:1 | **5.63:1**  |
| Edit label on edit bar | `#9F1A53` on `#F9DCE7` | 4.5:1 | **5.98:1**  |
| Edit label on edit bar, worst grain speck | `#9F1A53` on `#E4C9D3` | 4.5:1 | **4.95:1**  |
| Done / close text on edit bar | `#9F1A53` on `#F9DCE7` | 4.5:1 | **5.98:1**  |
| + FILE / + INSTALLED text on edit bar | `#241E1B` on `#F9DCE7` | 4.5:1 | **12.86:1**  |
| + FILE / + INSTALLED text on edit bar, worst grain speck | `#241E1B` on `#E4C9D3` | 4.5:1 | **10.65:1**  |
| Done text on its hover fill | `#9F1A53` on `#F6C9D9` | 4.5:1 | **5.20:1**  |
| Settings text on overlay | `#241E1B` on `#EFE6CB` | 4.5:1 | **13.20:1**  |
| Settings text on panel | `#241E1B` on `#FAF5E4` | 4.5:1 | **15.08:1**  |
| Settings label (text-dim) on panel | `#5A5046` on `#FAF5E4` | 4.5:1 | **7.21:1**  |
| Settings value / cheat key (accent-text) on panel | `#B01D5B` on `#FAF5E4` | 4.5:1 | **6.07:1**  |
| Settings CLOSE text on panel | `#9F1A53` on `#FAF5E4` | 4.5:1 | **7.01:1**  |
| Settings CLOSE text on its hover fill | `#9F1A53` on `#F9DCE7` | 4.5:1 | **5.98:1**  |
| Hotkey error text (accent-m) on panel | `#9F1A53` on `#FAF5E4` | 4.5:1 | **7.01:1**  |
| Hotkey input text (accent-text) on input fill | `#B01D5B` on `#FDE8EF` | 4.5:1 | **5.66:1**  |
| Hotkey recording text (accent-m) on input fill | `#9F1A53` on `#FDE8EF` | 4.5:1 | **6.54:1**  |
| Search placeholder (text-dim) on search fill | `#5A5046` on `#FDE8EF` | 4.5:1 | **6.73:1**  |
| Picker row text on hover fill | `#241E1B` on `#FDE8EF` | 4.5:1 | **14.07:1**  |
| Picker selected row (accent-text) on picker active fill | `#B01D5B` on `#FBDDE8` | 4.5:1 | **5.23:1**  |
| Picker / skin search input text (accent-text) on search fill | `#B01D5B` on `#FDE8EF` | 4.5:1 | **5.66:1**  |
| Scrollbar thumb (text-dim) on panel (non-text) | `#5A5046` on `#FAF5E4` | 3:1 | **7.21:1**  |
| Grid scrollbar thumb (border) on ground (non-text) | `#241E1B` on `#EFE6CB` | 3:1 | **13.20:1**  |
| Update banner text on update bar | `#5A4200` on `#FBEBB0` | 4.5:1 | **7.95:1**  |
| Update banner text, worst grain speck | `#5A4200` on `#E6D7A1` | 4.5:1 | **6.59:1**  |
| Update button text on hover fill | `#5A4200` on `#F4DC82` | 4.5:1 | **6.96:1**  |
| Update dismiss glyph (text-dim) on update bar | `#5A5046` on `#FBEBB0` | 4.5:1 | **6.59:1**  |
| Update button border on update bar (non-text) | `#8A6400` on `#FBEBB0` | 3:1 | **4.51:1**  |
| Drop-hint text (text-dim) on grid ground | `#5A5046` on `#EFE6CB` | 4.5:1 | **6.31:1**  |
| Drop-hint text on grid ground, worst grain speck | `#5A5046` on `#DBD2BA` | 4.5:1 | **5.22:1**  |
| Drop-hint border and icon (#7F735C) on grid ground (non-text) | `#7F735C` on `#EFE6CB` | 3:1 | **3.74:1**  |
| + FILE / + INSTALLED border (#7F735C) on edit bar (non-text) | `#7F735C` on `#F9DCE7` | 3:1 | **3.64:1**  |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#9F1A53` | 3:1 | **7.65:1**  |
| Focus ring (accent-c) on tile rest (non-text) | `#D23A7A` on `#FAF5E4` | 3:1 | **4.16:1**  |
| Focus ring on grid ground (non-text) | `#D23A7A` on `#EFE6CB` | 3:1 | **3.64:1**  |
| Hover border on grid ground (non-text) | `#D23A7A` on `#EFE6CB` | 3:1 | **3.64:1**  |
| Hover border on hover fill (non-text) | `#D23A7A` on `#FDE8EF` | 3:1 | **3.88:1**  |
| Hover shadow (accent-c) on grid ground (non-text) | `#D23A7A` on `#EFE6CB` | 3:1 | **3.64:1**  |
| Tile border on grid ground (non-text) | `#241E1B` on `#EFE6CB` | 3:1 | **13.20:1**  |

**Lowest text ratio: 4.89:1** (title dot on the header at a halftone dot). **Lowest non-text ratio: 3.20:1** (the Files icon plate on the pressed fill, below). Every pair clears its threshold; no pair sits under AA.

**Icon plates through `--tile-icon-fx` (saturate 0.9, brightness 0.8).** On a light ground the fx darkens (allowed: the rule against `brightness()` below 1.0 is for dark themes). A first try (brightness 0.86 with a deeper pressed fill `#F9D3E1`) left the Files plate at 2.61:1 on the pressed fill, so it is 0.8 and the pressed fill is the lighter `#FBDDE8`:

| Plate (mock) | After fx | On rest `#FAF5E4` | On hover `#FDE8EF` | On pressed `#FBDDE8` |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#4B6682` | 5.46:1 | 5.10:1 | 4.72:1 |
| Calculator `#6b6f76` | `#56595E` | 6.44:1 | 6.02:1 | 5.56:1 |
| Paint `#b07a4f` | `#896243` | 4.95:1 | 4.62:1 | 4.27:1 |
| Terminal `#3d4450` | `#32363F` | 11.09:1 | 10.35:1 | 9.57:1 |
| Browser `#4f8a8b` | `#436E6E` | 5.21:1 | 4.86:1 | 4.50:1 |
| Files `#c09a3e` | `#967B39` | 3.71:1 | 3.46:1 | **3.20:1** |

Every plate passes 3:1 in all three states (the dark Terminal plate is the strongest here, the reverse of the dark themes). Real icons vary; a pale real icon can still sit under 3:1 on a dark plate colour, but the fx only darkens, so it cannot make that worse.

### C.2 Type

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Segoe UI', 'Yu Gothic', Arial, sans-serif` (unchanged) | 400 | base | base | base |
| `#title` | `'Dela Gothic One', 'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif` | 400 (Regular-only family; `font-synthesis: none`) | 11 px, `line-height: 1.2` | 1px | uppercase (markup) |
| `.tile-label` | `'Yu Gothic', 'Segoe UI', sans-serif` (unchanged) | 700 (`--tile-label-weight`) | 12 px | 0.3px | as typed |
| `#theme-banner-text` | `'Yu Gothic', 'Segoe UI', sans-serif` (unchanged) | 700 | 11 px | 0.5px | as written |

The title is the poster: Dela Gothic One is the heavy Showa-signage gothic the audit wished for (Cyrillic yes). It is the only place the bundled font appears in this theme. Width gate (Part B rule 5): the tracking ceiling for Dela Gothic One is 1 px and the title must end at x 156 or earlier. If the real font is wider than my 1.00 em bound the ladder applies; the fallback Arial Black measured 108 px (right edge x 120) in batch 1, so the theme is safe even if the font fails to load. Labels and banner stay Yu Gothic Bold: they are the approved look, and a display face would hurt the tile names. **Cyrillic:** the theme has no Cyrillic text of its own; Cyrillic tile names keep Yu Gothic Bold (it contains U+0416, batch 1). Expected `fontsRendered`: `Dela Gothic One, Yu Gothic Bold, Segoe UI`.

### C.3 Art (all static, original, inline SVG data URIs; encode `<` `>` `#` as `create-theme.md` says)

Delete the shipped grain SVG, the dark halftone, the beige doll and blob colours and the pink sticker. All geometry below is unchanged from batch 1 unless the text says it moved.

**A. Paper grain, `#app::after`.** One layer, ink specks (the batch 1 layer was pale specks on a dark ground): `@GRAIN@ 0 0 / 200px 200px repeat`. The SVG is the shipped noise tile with the specks turned to ink: `feTurbulence` fractalNoise, baseFrequency 0.9, 2 octaves, stitch, then `feColorMatrix` `values='0 0 0 0 0.14  0 0 0 0 0.12  0 0 0 0 0.11  0.13 0 0 0 -0.03'`. That is alpha = 0.13 x noise - 0.03: mean about 0.03, peak at most 0.10. No vignette, no scanlines, no halftone here.

**B. Header.** `#header { background: radial-gradient(circle at 2px 2px, rgba(224,80,140,0.14) 0 1px, transparent 1.5px) 0 0 / 5px 5px, #E8DDBE; border-bottom-color: #D23A7A; box-shadow: inset 0 -2px 0 #D23A7A; }`: a Ben-Day dot screen (1 px dots, 5 px pitch, 14 percent) under everything in the header, and the 3 px pink rule inside the header (window y 37 to 40, nothing paints below y 40). `#header::before { background: #241E1B; box-shadow: none; }` (the 2 px left tick becomes ink). Header art, `#header::after` with the batch 1 box (`content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; background:@HEADERART@ no-repeat 0 0 / 84px 20px; pointer-events:none`) and the chip rule `#header:has(#filter-chip:not(.hidden))::after { display:none }`. `@HEADERART@`: the paper dolls are now white cut-outs with a 0.8 px ink outline and the 1 px ink offset copy behind them (the sticker look); doll B stays smaller and tilted; the pink stamp on doll A and the whole blob are unchanged.

**C. Title.** `#title { font-family: 'Dela Gothic One', 'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif; font-weight: 400; letter-spacing: 1px; color: #241E1B; text-shadow: 1px 1px 0 #E0508C; line-height: 1.2; font-synthesis: none; }`. The 1 px pink offset is the print misregistration; it is decoration, not counted in contrast. The dot keeps base's `.accent { color: var(--accent-m) }`.

**D. Banner: pink paper strip, blob icon, mascot sticker.**
- `#theme-banner { background: @STICKER@ right 14px bottom 6px / 28px 28px no-repeat, #EE6A9E; border-top: 0; z-index: 250; box-shadow: inset 1px 0 0 #241E1B, inset -1px 0 0 #241E1B, inset 0 -1px 0 #241E1B; }`. The `z-index: 250` keeps the grain off the strip (as in batch 1); it also hides the 1 px window outline along the strip's sides and bottom (batch 1 open item 11), and on a paper ground with ink outlines that gap would show, so **the inset ink lines put it back**.
- Torn edge, `#theme-banner::after` (`content:''; position:absolute; top:0; left:0; right:0; height:7px; background:@TEAR@ repeat-x 0 0 / 56px 7px; pointer-events:none`): the batch 1 path, filled with the **ground colour as the grain averages it**, `rgb(233,224,198)` (`#E9E0C6`: 3 percent of ink over `#EFE6CB`), so the tear does not read as a flat band against the specked ground above it.
- Icon, `#theme-banner::before` (`content:''; width:22px; height:22px; font-size:0; opacity:1; background:@BLOB@ center / 22px 22px no-repeat`): the batch 1 blob, black, with **cream eyes** (pink eyes would vanish on the pink strip) and two ink pupils.
- Sticker `@STICKER@` (28 x 28, banner x 382 to 410, y 10 to 38): the batch 1 head, yellow instead of pink, with a paper-coloured 3 px border around the black outline so it reads as a die-cut sticker on the pink. It sits at least 120 px right of the end of the longest line (213 px, ends x 259).
- **Banner lines are unchanged**, the three verified labels in `THEME_BANNERS['promise-mascot']`: `ANOTHER DAY, ANOTHER ERRAND.` / `THE TOWN CAN WAIT A MINUTE.` / `PICK A TILE. KEEP GOING.` (Yu Gothic Bold 11 px, 0.5 px tracking: 213, 196 and 158 px against a 364 px box). They are studio-authored labels, not quotes (batch 1 flag 1 stands).
- `#theme-banner-text { font-family: 'Yu Gothic','Segoe UI',sans-serif; font-weight: 700; letter-spacing: 0.5px; color: #241E1B; }`, ink on the strip, 5.63:1.

**E. Print marks in the top band (new).** Both live in `#grid-container`'s own background (FZ-T, container y 1 to 11): `#grid-container { background: @BAR@ 16px 2px / 46px 6px no-repeat, @REG@ right 17px top 1px / 7px 7px no-repeat; }`. The colour bar (ink, pink, marigold, light pink swatches, 10 x 6 px each with 2 px gaps) is at window x 16 to 62, y 42 to 48; the registration mark (a ring and a cross) at x 400 to 407, y 41 to 48 at 424 wide (anchored to the right edge at every size). The bottom of both is at container y 8, **4 px above the top of the focus ring (y 52)**; nothing is within 3 px of a ring, and nothing enters the tile field expanded by 4 px. A scrolled tile covers them, never the reverse.

**Safe zones.** The tile field holds only the ink grain (peak alpha 0.10). Art lives in the header zone (x 168 to 252, hidden while the chip shows), the top band, the banner and its icon slot. Nothing sits under text.

**SVG sources** (readable; `rgb()` colours; encode when writing the CSS):

`@GRAIN@` (fill the two coefficients from the tuning rule in C.7):
```
<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><filter id='g' x='0' y='0' width='200' height='200' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.14  0 0 0 0 0.12  0 0 0 0 0.11  0.13 0 0 0 -0.03'/></filter><rect width='200' height='200' filter='url(#g)'/></svg>
```
`@HEADERART@` (84 x 20):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'><defs><g id='d'><circle cx='10' cy='5' r='3.4'/><path d='M10 8.6 L4 11.2 L6.6 12.4 L5.4 18.4 L14.6 18.4 L13.4 12.4 L16 11.2 Z'/></g></defs><use href='#d' transform='translate(1 1)' fill='rgb(16,16,16)'/><use href='#d' fill='rgb(250,245,228)' stroke='rgb(16,16,16)' stroke-width='0.8'/><circle cx='10' cy='13.5' r='1.3' fill='rgb(224,80,140)'/><g transform='rotate(12 27 12) translate(27 7) scale(0.8) translate(-10 -5)'><use href='#d' transform='translate(1 1)' fill='rgb(16,16,16)'/><use href='#d' fill='rgb(250,245,228)' stroke='rgb(16,16,16)' stroke-width='0.8'/></g><path d='M50 17.5 C48 10 52 3.5 60 3.5 C69 3 75 7 74.5 13 C74 16 71 17.5 68 17 C66.5 19 63.5 19 62 17.5 C60 19 57 19 55.5 17.5 C53.5 18.8 51 18.8 50 17.5 Z' fill='rgb(16,16,16)' stroke='rgb(224,80,140)' stroke-width='1.2'/><circle cx='58' cy='9.5' r='2.4' fill='rgb(224,80,140)'/><circle cx='67' cy='8.5' r='1.9' fill='rgb(224,80,140)'/><circle cx='58.6' cy='9.5' r='0.8' fill='rgb(16,16,16)'/><circle cx='67.4' cy='8.5' r='0.8' fill='rgb(16,16,16)'/><path d='M60 13.5 L65 13' stroke='rgb(224,80,140)' stroke-width='1'/><circle cx='71.5' cy='17.2' r='1' fill='rgb(224,80,140)'/></svg>
```
`@STICKER@` (viewBox padded by 2 so the paper border is not clipped, drawn at 28 x 28):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='-2 -2 32 32'><g fill='rgb(250,245,228)' stroke='rgb(250,245,228)' stroke-width='3' stroke-linejoin='round'><circle cx='6' cy='6.5' r='4.2'/><circle cx='22' cy='6.5' r='4.2'/><ellipse cx='14' cy='16.5' rx='13' ry='11.3'/></g><circle cx='6' cy='6.5' r='4.2' fill='rgb(16,16,16)'/><circle cx='22' cy='6.5' r='4.2' fill='rgb(16,16,16)'/><ellipse cx='14' cy='16.5' rx='13' ry='11.3' fill='rgb(16,16,16)'/><circle cx='6' cy='6.5' r='2.7' fill='rgb(240,192,32)'/><circle cx='22' cy='6.5' r='2.7' fill='rgb(240,192,32)'/><ellipse cx='14' cy='16.5' rx='11.6' ry='9.9' fill='rgb(240,192,32)'/><circle cx='9.5' cy='14.5' r='3.1' fill='rgb(250,245,228)'/><circle cx='18.5' cy='14.5' r='3.1' fill='rgb(250,245,228)'/><circle cx='10.1' cy='14.9' r='1.2' fill='rgb(16,16,16)'/><circle cx='17.9' cy='14.9' r='1.2' fill='rgb(16,16,16)'/><path d='M7.5 21 Q14 25.2 20.5 21' fill='none' stroke='rgb(16,16,16)' stroke-width='1.3' stroke-linecap='round'/><path d='M10.2 22.2 V24.2 M14 23.3 V25.3 M17.8 22.2 V24.2' fill='none' stroke='rgb(16,16,16)' stroke-width='1'/></svg>
```
`@TEAR@` (56 x 7):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 7'><path d='M0 0 H56 V3 L51 5.5 L46 2.5 L40 6 L35 3.5 L28 6.5 L22 2 L16 5 L10 3 L4 6 L0 3 Z' fill='rgb(233,224,198)'/></svg>
```
`@BLOB@` (22 x 22):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'><path d='M3 19 C2 10 6 3 12 3 C18 3 21 8 20 15 C20 18 18.5 19 17 18.5 C16 20.5 13.5 20.5 12.5 19 C11 20.5 8.5 20.5 7.5 19 C6 20 4 20 3 19 Z' fill='rgb(16,16,16)'/><circle cx='9' cy='10' r='2.4' fill='rgb(250,245,228)'/><circle cx='15.2' cy='9' r='1.9' fill='rgb(250,245,228)'/><circle cx='9.5' cy='10.2' r='0.9' fill='rgb(16,16,16)'/><circle cx='15.6' cy='9.2' r='0.8' fill='rgb(16,16,16)'/></svg>
```
`@BAR@` (46 x 6):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 46 6'><rect x='0' y='0' width='10' height='6' fill='rgb(36,30,27)'/><rect x='12' y='0' width='10' height='6' fill='rgb(224,80,140)'/><rect x='24' y='0' width='10' height='6' fill='rgb(240,192,32)'/><rect x='36' y='0' width='10' height='6' fill='rgb(243,176,203)'/></svg>
```
`@REG@` (7 x 7):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7 7'><circle cx='3.5' cy='3.5' r='2.1' fill='none' stroke='rgb(36,30,27)' stroke-width='0.8'/><path d='M0 3.5 H7 M3.5 0 V7' stroke='rgb(36,30,27)' stroke-width='0.8'/></svg>
```
`@ARROW@` (settings skin field, below).

### C.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| all | none: batch 1 already removed all six | still none |

**Infinite animations: 0, and 0 after.** `grep -c infinite promise-mascot.css` is 0 and `loopingAnimationsAtCapture` is 0. The only motion is the 0.08 s transition on tile hover and the one-shot `entrance-fade 0.8s`. No `will-change`, no `backdrop-filter`.

### C.5 Tiles, hover, selected, filter, banner, and the base rules a light ground needs

- **Tile at rest:** `.app-tile { background: #FAF5E4; border-color: #241E1B; box-shadow: 2px 2px 0 #241E1B; transition: transform .08s, background .08s, border-color .08s, box-shadow .08s; }` and `.app-tile::before { display: none; }`. Border stays 1 px, padding unchanged, so tile height stays 94.7 to 95.4 px and the grid scrolls exactly as before. The rest shadow reaches 2 px into the 8 px gutter.
- **Hover and focus-visible** (`.app-tile:hover, .app-tile:focus-visible`): `background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); transform: translate(-1px,-1px);`. The pale pink fill, pink border and 3 px pink shadow reach 2 px past the tile at right and bottom after the 1 px lift, inside the 4 px keep-out. Focus adds the base 2 px `--accent-c` outline at offset 2 (4.16:1 on the tile, 3.64:1 on the ground).
- **Pressed:** `.app-tile:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 var(--accent-c); background: var(--tile-active-bg); }`.
- **Label:** ink `--text`, no halo (`--tile-label-shadow: none`); renameable hover uses `--accent-text` (5.66:1 on the hover fill).
- **Filter chip:** `#filter-chip { background: #FAF5E4; border-color: #241E1B; border-radius: 0; box-shadow: 2px 2px 0 #D23A7A; }`, text `--accent-text`.
- **Header buttons:** base rules with ink glyphs and ink borders; hover fill `#FDE8EF`.
- **Edit bar and update bar:** variables only (pink paper edit bar with a pink rule, yellow paper update bar with a brown rule); no quote.
- **Base rules that assume a dark ground** (the 2001 precedent; write these in this theme): `button:hover { color: var(--text); }`, `.btn-remove:hover { color: #fff; }`, `.update-btn:hover { color: var(--update-color); }`, `#filter-chip-clear:hover { color: var(--accent-text); }`.
- **Settings overlay:** opaque ground `#EFE6CB` behind an opaque paper panel `#FAF5E4`; values and version in `--accent-text` (`#app-version { color: var(--accent-text); }`, batch 1 F2); sliders and checkboxes `--accent-c`; scrollbar thumb `--text-dim` (A1). **Skin field arrow** (base's arrow is 50 percent white, invisible on paper; override only the image, as 2001's F10 does): `.theme-search { background-image: @ARROW@; }` with `@ARROW@` = `<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M0 0l5 6 5-6z' fill='rgb(36,30,27)'/></svg>`.
- **Drag-reorder placeholder:** base paints the vacated slot with `!important` (2 percent white fill, 10 percent white border), which is nearly invisible on a light ground, exactly as in 2001 (approved). Left as is; noted so it is not mistaken for a bug.

### C.6 Squint test (cover the title and the banner text)

What is left: cream newsprint with a fine grain; ink-outlined paper cards with hard bottom-right shadows; a hot-pink rule under a halftone-dotted header; two white paper dolls and a black blob with pink eyes; printer's marks in the margin; a torn hot-pink strip with a black blob at the left and a yellow die-cut mascot head at the right. A fan of the game should name it from the paper-print treatment, the black-and-pink spirit and the paper dolls, which are the three things the reviews describe. **Expected score 4.** The dark version was 4 only inside its own ceiling (flag 3); this one is the look the reviews describe (flat, bright, printed), so the recognisability is no longer capped by the palette. It is not a 5: no theme is, because the game's own mascots, lettering and key-art cannot be drawn (C1). Judy re-looks at the rendered shots before it ships (batch 1 review procedure).

### C.7 Done when (Ender, from the after screenshots and the run report)

1. **Grid shot:** cream ground with fine ink grain; six paper cards, 1 px ink border, 2 px ink shadow at the bottom right, ink labels; a 3 px pink rule at window y 37 to 40 and nothing below y 40; the header is paper with faint pink dots; the title is heavy black with a 1 px pink offset; header art at x 168 to 252 (two white dolls with ink outlines, one black blob), at least 12 px right of the title and at least 24 px left of the first button; colour bar at x 16 to 62, y 42 to 48 and registration mark at x 400 to 407, y 41 to 48; banner is a pink torn strip with a black blob at the left, one line of ink text (`scrollWidth <= clientWidth`, no ellipsis) and a yellow mascot head at x 382 to 410 (banner y 10 to 38); the strip has a 1 px ink outline at its left, right and bottom edges.
2. **Hover shot (CALCULATOR):** pale pink fill, pink border, pink 3 px shadow at the bottom right, lifted 1 px; its neighbours keep their ink shadow; no sheen.
3. **Focus:** the pink 2 px ring around the first tile; the colour bar and the registration mark are 4 px above it.
4. **Chip (type a letter):** the chip alone in the header, paper with an ink border and a pink shadow; the header art is hidden. **Edit mode and update bar:** readable, no clipped text.
5. **Settings (A1 layout):** paper panel on a cream overlay, title, rows and footer as in A1; version and values deep pink; the skin arrow is dark; CLOSE deep pink on a pink border.
6. `npm run check:contrast` passes with no rebaseline, and the five gate values match the table above.
7. **Hidden-tiles shot: sigma 2.5 to 3.9** (my mock read 3.13 with the coefficients above). If Ender's recorded value is outside that range, scale the two grain coefficients (0.13 and -0.03) by 3.2 / recorded and re-capture. **Update the recorded ceiling:** this theme's sigma replaces batch 1's 3.94 as the promise-mascot reference; it must stay at or below 3.94, so no other theme's check moves.
8. `grep -c infinite` is 0 and `loopingAnimationsAtCapture` is 0; no backslash-A escape in the file.
9. Icons: the six plates are at least 3:1 in rest, hover and pressed (lowest expected 3.20).
10. The A/B/C overlap probe at 424x300, 640x420 and 1024x700 and in the chip, edit-bar, update-bar and focus-ring states: 0 px of art over content, 0 px of art inside the keep-out; the smallest art-to-ring clearance is 4 px.
11. `fontsRendered` lists Dela Gothic One, Yu Gothic Bold and Segoe UI; `#title.getBoundingClientRect().right` is at most 156 (report it); the three banner lines fit on one line.
12. Judy re-looks at the rendered grid, hover, focus, chip, edit, update and settings shots at 424x300 and the grid at 640x420 and 1024x700, then re-rates the squint score.

---

## Unresolved items and things I could not verify

1. **Six of the seven fonts are unmeasured.** The files are not installed here and I downloaded nothing. Only Cinzel is measured, through the installed Cinzel Black (an upper bound for the bundled variable font). Every other width in Part B is a bound or an expectation, guarded by the B2 ladders, which are binding. Ender measures each title (right edge at most x 156), label and banner line with the real files and reports the numbers. **The Dela Gothic One title has not been seen**: the paper mock used Arial Black as a stand-in.
2. **Mock versus Electron.** Chromium 154 is not Electron 32. Ender's numbers win for: the grain sigma (mock 3.13), the first header button's x (273 in the mock, 276 in the real app), the look of the 6 px scrollbar thumb, and `scrollbar-gutter: stable` together with `::-webkit-scrollbar` (it works in the mock; Chromium 128 supports both, but confirm in the packaged build: at 640x420 the last tile column must end at x 620).
3. **A2 changes 86 unredesigned themes at the default size** (the clipped header fragment disappears). I chose that because the fragment was 8 px text clipped mid-word and drawn over a button. If Jane or Sergei would rather leave those themes untouched at 424 px, delete the one `width: clamp(...)` line; the `right: 160px` fix and the art rules stay. Nothing else depends on it.
4. **A3 adds a small piece of JavaScript** (the fit check), which is outside the three options in the brief (two lines, tighter tracking, keep one line). I chose "keep one line" and added the check because it needs no theme edit, fixes the ellipsis in every theme at once (0 themes are left with all lines too long) and protects the fitted lines from Part B's font changes. Eight themes are left with a single static line until their own batch writes fitting lines. If Jane wants zero JavaScript, drop the check and rely on the per-theme rule; nothing else in Part A depends on it.
5. **Part B timing (my reading of the brief).** Ender applies the four "now" themes (gryffindor, 2001, akira, promise-mascot) after batch 2 lands; the other 27 adopters wait for their own batch spec. If Jane meant "apply all 31 now, including legacy themes", say so; the map supports it but those themes would then get a type-only change before their redesign.
6. **The thumb is under 3:1 in three legacy themes** (lovecraft 2.51, dragon-age 2.75, warhammer-chaos 2.93) until their batches fix `--text-dim` (A1.9 item 6).
7. **Offered, not done:** the two-step Esc in the skin field, moving SKIN up in Settings, a maximum width for the panel at large sizes (A1.8).
8. **The gallery.** For the settings shot it must use the real `index.html` and `base.css` (if it carries its own copy of the overlay markup, update it in the same commit), wait for `document.fonts.ready`, and for 424x300 capture the panel at scroll 0 and scrolled to the end, so both halves of Settings are seen.
9. **Recorded ceiling.** promise-mascot's hidden-tiles sigma is the batch ceiling reference. Part C replaces it; Ender records the new value (it must stay at or below 3.94).
10. **Fonts and CPU.** No font touches any animation; the only cost is loading (about 3.05 MiB on disk, each family loaded on first use).

## Files

- This spec: `C:\Antigravity Projects\Studio Illuminati\WIP\QuickLaunch\Docs\QuickLaunch_ThemeSpec_Foundation_2026-09-30.md`
- Scratch (session scratchpad, not in the repo): `judy\found\` holds the mock harness `fh.py` (every launch passes `--user-data-dir=<scratchpad>\judy\profile`), the prototype paper theme `pm_paper.css`, the A1 prototype `overlay_final.py`, and the measurement scripts.
