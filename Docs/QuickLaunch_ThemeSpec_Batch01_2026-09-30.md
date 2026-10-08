# QuickLaunch theme spec, batch 1 (Judy, 2026-09-30)

Status: complete. Batch-level section (0), eight theme sections (1 to 8), fonts that would lift the batch (9), summary (10), open items (11). Uncommitted, as instructed.

Themes: promise-mascot, persona-4, gryffindor, 2001, cyberpunk, stranger-things, shire, dead-space (audit section 7, batch 1).
For: Ender (implements tonight). Sergei reviews before/after in the morning, so this batch is the showcase.
Branch: `wip/theme-fidelity`, base `a659bf9`.

Inputs read: the audit (`QuickLaunch_ThemeAudit_2026-09-30.md`), Sergei's rulings (`QuickLaunch_ThemeFidelity_Plan_2026-09-29.md`), Makoto's sheet, the 8 theme CSS files, `base.css`, `index.html`, `scripts/check-theme-contrast.js`, `create-theme.md`, the 24 gallery screenshots (grid, hover and settings for each theme), `theme-metadata.csv`, `THEME_BANNERS` in `app.js`, the gallery's mock icon set. Nothing was launched. Only this file was written; scratch scripts live in the session scratchpad.

**Shared constraints are not restated.** Every section below inherits audit section 1 (C1 to C5, H1 to H8) by reference: `WIP/QuickLaunch/Docs/QuickLaunch_ThemeAudit_2026-09-30.md` section 1. Where this batch refines or corrects the audit, section 0.1 and 0.10 say so.

## At a glance

| # | Theme | Direction | Infinite animations, before to after | Lowest ratio (text / non-text) | Type |
|---|---|---|---|---|---|
| 1 | promise-mascot | Showa film poster: washed near-black, faded beige text, spot pink and yellow, grain plus halftone, hard-shadow panels, torn-paper banner, paper dolls and a spirit blob in the header | 6 to **0** | 4.83 / 4.05 | Arial Black title, Yu Gothic Bold labels |
| 2 | persona-4 | Bold yellow-and-black: solid TV-yellow header and banner with black type, rounded TV tiles, a yellow label pill on hover, four hand-drawn stars | 6 (+1 hover) to **0** | 4.87 / 5.49 | Arial Black title, Segoe UI Semibold labels |
| 3 | gryffindor | Common room: maroon ground, firelight and tartan, gilt double-rule frame, parchment italic, scarlet swallow-tail pennant with a sword | 6 to **0** | 5.19 / 7.09 | Palatino Linotype |
| 4 | 2001 | Light: off-white console, near-black Semilight caps, console blue and an amber lamp strip, perspective lines and monolith, HAL eye in the banner | 6 to **0** | 4.94 / 6.03 | Segoe UI Semilight |
| 5 | cyberpunk | Flat HUD: near-black, CDPR yellow and cyan, top-left and bottom-right chamfer, hazard-stripe banner, glitch slice and notch | 7 to **1** (title transform, stepped) | 5.16 / 6.01 | Bahnschrift Condensed |
| 6 | stranger-things | Red, cream and Upside-Down blue: glowing Georgia Bold title, six-bulb string in the top band, flower banner icon | 6 to **1** (banner icon opacity, stepped) | 4.60 / **3.35** | Georgia |
| 7 | shire | Rounded hobbit-hole window: timber frame with vine ticks, round green door in a hill, wooden-sign banner | 6 to **0** | 4.74 / 3.77 | Gabriola title, Georgia labels |
| 8 | dead-space | RIG: segmented blue spine down the left, amber stencil warnings, bulkhead-door icon, 14 px shear | 7 to **0** | 5.74 / 6.87 | Bahnschrift SemiBold |
| | **Batch** | | **50 to 2** | **lowest text pair 4.60:1 (stranger-things, needs 4.5); lowest overall 3.35:1 (stranger-things, a non-text border, needs 3)** | |

"Lowest ratio" is the minimum over every pair listed in that theme's tables (gate pairs, add-on pairs, and the generic accent-on-fill roles); text pairs need 4.5, non-text pairs 3. Every pair in every theme clears its threshold.

Art call: all eight are **redraw** (audit section 7). Nothing is "tone down" in this batch.

---

## 0. Batch-level section (applies to all eight)

### 0.1 Corrections and new facts found while writing this spec

Read these first. Several change how the audit's rules are applied.

1. **The grid scrolls at the default window, so `#grid-container::before/::after` are wrong homes for frame art.** The gallery loads 14 mock tiles (5 rows at 3 columns). The scrollbar thumb is visible at the right edge in the grid shots (measured: thumb spans y 40.7 to 125.3 on stranger-things). Absolutely positioned pseudo-elements inside a scrolling container scroll with the content. **Frame art goes in `#grid-container`'s own `background`** (default `background-attachment: scroll` keeps it fixed to the element box while the tiles scroll, and it paints under the tiles, so a scrolled tile covers art and never the reverse) and, for the header and banner, in their own backgrounds and pseudo-elements. No theme in this batch uses `#grid-container::before` or `::after` (both deleted; `base.css` already sets them to `content: none`).
2. **`#app::after` (z-index 199) paints above the tiles and their icons.** It is the only full-window layer. In this batch it carries texture only (grain, halftone, weave, vignette, soft gradients) at low alpha, never scanlines, never bands, never ornaments. Today's `repeating-linear-gradient` scanline layers in `#app::after` are what stripe the tile icons in cyberpunk, dead-space and persona-4.
3. **Measured geometry at 424x300** (from the 1.5x screenshots, pixel-measured, css px):

   | Element | Measured rect |
   |---|---|
   | Header | y 0 to 40 (bottom border at y 39 to 40) |
   | Header buttons (4) | x 276.0 to 411.3, y 8.0 to 32.0; individual button x runs: 276.0-303.3, 310.0-338.7, 345.3-376.0, 382.7-411.3 |
   | Tile columns | x 16-140, 148-272, 280-404 (each 124 wide, gutter 8) |
   | Tile rows (scroll 0) | y 56.0-150.7 and about 158.7-253.4 (tile height 94.7 to 95.4) |
   | Scrollbar | x 420 to 424 (4 px), present whenever the tiles overflow, which is the normal case |
   | Banner | y 256 to 300, rule at y 256 |
   | `#header::after` today | box x 200 to 289 (`right:135px`): ends 13 px under the first button, which is why every header text is clipped |

   The audit said the tile field spans x 16 to 408; the true right edge is **404** because the scrollbar takes 4 px.
4. **Keep-out zone.** Focus outline (2 px, offset 2) and any hover shadow extend 4 px outside a tile. So art may not enter the tile field expanded by 4 px: x 12 to P-12 (P is defined in 0.2), y 52 down to the banner top, at any window size. Where a theme's hover shadow or transform reaches further (promise-mascot: 3 px hard shadow plus a 1 px lift) it stays inside those 4 px.
5. **Header: the filter chip.** `#filter-chip` sits in the header flex row between the title area and the buttons (centred by `space-between`), exactly where header art would be. Every theme that puts art in `#header::after` hides it while the chip is visible: `#header:has(#filter-chip:not(.hidden))::after { display: none; }`. Electron is `^32` (Chromium 128), so `:has()` is supported. This is the fix for "nothing may cover the filter". Stranger-things has no header art at all.
6. **The edit bar has about 70 px free, not enough for any quote.** Measured from `base.css`: window 424, side padding 24, label "// EDIT MODE" about 96, three buttons plus gaps about 232. Every `#edit-bar::after` in this batch is **deleted** (satisfies H3 by having no string).
7. **`dead-space`'s 36 px clip crops the fullscreen button.** The button's top-right corner is (412, 8). A top-right chamfer of size c removes points with x - y > W - c, so the corner is cut for any c above 20. Today c = 36 (visible in the gallery: the button is sliced). The new clip uses c = 14.
8. **The gallery icons are a mock set** (`scripts/theme-gallery/mock-data.cjs`: plates Notepad `#5b7fa6`, Calculator `#6b6f76`, Paint `#b07a4f`, Terminal `#3d4450`, Browser `#4f8a8b`, Files `#c09a3e`). Real tiles show each app's own icon. Every icon-contrast figure below is computed on these six plates through the theme's `--tile-icon-fx` filter. The Terminal plate is about 1.7:1 to 2.0:1 against a near-black ground before any theme touches it (it is the mock's own art). It is reported per theme and excluded from the 3:1 pass; **no dark theme may use `brightness()` below 1.0 in `--tile-icon-fx`**, so the theme never makes it worse.
9. **Hover and pressed fills must keep the icons at 3:1.** The mid-grey Calculator plate is the limit: on a dark ground its plate (about L 0.17 after fx) needs a fill with relative luminance at most about 0.022. I checked every theme's rest, hover and pressed fill and lowered five hover fills, seven pressed fills and one rest ground (shire) that were too light (the first draft of several had the Calculator plate at 2.3 to 2.9:1 on hover or pressed). Result: the lowest non-Terminal icon ratio over rest, hover and pressed is **3.09:1** in every theme (stated per theme).
10. **Persona-4 has two costs the audit did not list:** a `0.08s steps(1) infinite` particle animation (about 12 background-position updates per second on a full-window layer) and a hover-state `tile-flicker .5s steps(1,end) infinite`. Both go.
11. **The `:root` regex in the gate.** `check-theme-contrast.js` reads each variable with `--name\s*:\s*([^;]+);` and takes the first match anywhere in the file, comments included. So: (a) declare the five gate variables as **opaque hex** in `:root`; (b) never write `--text:`, `--bg:` and so on inside a comment above `:root`; (c) no `;` inside those five values. Every value below already complies.
12. **Base rules that assume a dark ground or paint accent text on a fill.** `button:hover`, `.update-btn:hover` and `#filter-chip-clear:hover` set `color:#fff`; `.tile-label.renameable:hover`, `.theme-picker-item:hover/.active/.selected`, `.picker-search`, `.hotkey-input` and `#filter-chip` paint `--accent-text` on a fill. On a light ground (2001), a yellow header (persona-4) or red text on a blue fill (stranger-things) these fail unless overridden. Each affected theme lists its overrides in its "Tiles, hover, selected, filter, banner" subsection (2001: 4.5; persona-4: 2.5; stranger-things: 6.5). The generic accent-on-fill roles are computed for **every** theme and appear at the bottom of each add-on table.
13. **Right edge P.** The container's padding box excludes its scrollbar, so background `right Npx` offsets are measured from P = window width minus 4 px (420 at 424 wide) while the scrollbar shows (the normal case) and from the window edge when it does not. I could not launch to confirm which reference Chromium uses; every right-hand layer below states the window x it should land on at 424 wide, and Ender checks the pixel position in the after shot. If a right-hand layer is 4 px further right than stated, subtract 4 from its `right` offset. No design effect either way.
14. **`.tile-label`, header buttons and the filter chip have no variable for font-family or hover colour**, so themes set them with ordinary rules. This is allowed; each section names the rules.

### 0.2 Frame zones (where art may live; all measured at 424x300, valid at any size)

W is window width, H window height, P the container's padding-box right edge (0.1.13). Container-relative y means y measured from the top of `#grid-container` (window y 40); Hc is the container height.

| Zone | Where | Size at 424x300 | Host |
|---|---|---|---|
| FZ-L left band | x 1 to 11, full container height | 10 px wide | `#grid-container` background layer, `left Npx top Npx / W px H px no-repeat` |
| FZ-R right band | x P-11 to P-1 (window x 409 to 419 at 424 with the scrollbar) | 10 px wide | `#grid-container` background layer, `right Npx top Npx / ...` |
| FZ-T top band | container y 1 to 11 (window y 41 to 51), full width | 11 px tall | `#grid-container` background layer |
| HZ header zone | box 84 x 20 (or 84 x 36 in cyberpunk) at `right: 172px; top: 10px` (x 168 to 252, y 10 to 30) | 84 x 20 | `#header::after`, hidden while the filter chip shows |
| BZ-T banner top strip | banner y 0 to 6 | 424 x up to 7 | `#theme-banner::after`, `position:absolute; top:0; left:0; right:0` |
| BZ-I banner icon slot | `#theme-banner::before`, 22 x 22, at x 14 (flex item, then a 10 px gap to the text) | 22 x 22 | `#theme-banner::before` with `content:''`, `background: url(svg) center / 22px 22px no-repeat`, `opacity:1` |
| Tile field | x 16 to P-16, y 56 to the banner top | **empty of art** | only `#app::after` texture at low alpha |

Rules that follow from the zones:
- The header art box ends at x 252; the first button starts at 276 (24 px clear). The title must end at x 156 or earlier so the gap is at least 12 px. Each theme states its measured title width (Pillow, real font files); Ender re-measures `#title.getBoundingClientRect().right` and reports it.
- Gutter art from the audit (rules, ticks) is **dropped in this batch**: column widths depend on window width, so a painted gutter misaligns at 640x420 and 1024x700. Nothing in this batch paints in the 8 px gutters.
- Art is anchored to fixed pixel offsets from an edge, never scaled with the window (audit C5).
- SVG art contains **no `<text>`** anywhere in this batch (shapes only), so no font dependency and no glyph can be corrupted. Encode data URIs as `create-theme.md` says (`<` as `%3C`, `>` as `%3E`, `#` as `%23`, single quotes inside the double-quoted `url()`); the specs write hex colours as `#RRGGBB` for readability.

**Shared recipes** (each theme section applies them with its own numbers):
```css
/* header art (HZ) */
#header::after { content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;
  background:url("data:image/svg+xml,...") no-repeat 0 0 / 84px 20px; pointer-events:none; }
#header:has(#filter-chip:not(.hidden))::after { display:none; }
/* banner icon */
#theme-banner::before { content:''; width:22px; height:22px; font-size:0; opacity:1;
  background:url("data:image/svg+xml,...") center / 22px 22px no-repeat; }
/* tile states */
.app-tile::before { display:none; }                                    /* no sheen sweep */
.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }
```

### 0.3 Ghost-text removal pattern (identical in all eight)

Delete these rules entirely, plus every `@keyframes` they alone use:

| Delete | Why |
|---|---|
| `#grid-container::before` (painted panno) and its keyframes | H1 family; wrong home (0.1.1) |
| `#grid-container::after` (ghost readout, `\A` strings) and its keyframes | H1 |
| `#particles { ... }` and its keyframes | H5 (replaces full-window background-position scrolls) |
| `#edit-bar::after` | 0.1.6 |
| `#header::after` **text** | H2 (replaced by art where the theme spec says so, otherwise removed) |
| `#app { animation: ... }` and its keyframes | H4, C4 (box-shadow on `#app`) |
| the theme's title keyframes and `--title-anim` value | H4 (the 88 percent flash); cyberpunk replaces it with one new keyframe set |
| `--banner-icon-anim` value | set to `none` (base.css reads `var(--banner-icon-anim, none)`); stranger-things replaces it with one new keyframe set |

Then in `:root` set `--title-anim: none; --banner-icon-anim: none;` explicitly (except the two themes above), and `--app-entrance-anim: entrance-fade <n>s ease-out forwards` (one-shot, not counted as infinite; `entrance-flash`, `entrance-zoom` and `entrance-glitch` are retired in this batch).

**The `\A` trap.** After the deletions no theme in this batch has a `content:` string that contains a backslash escape. The only remaining `content` values are `''`, `none`, and nothing else. If any future string needs a line break it must be written `\A ` with a space after it, because CSS swallows up to six hex digits after `\A`.

Acceptance: searching each of the eight CSS files for a backslash followed by `A` finds nothing; `grep -c infinite <theme>.css` equals the "after" count in section 0.7; the gallery's `loopingAnimationsAtCapture` is lower than before for every theme.

### 0.4 Rules every theme in this batch applies (per-theme sections do not repeat them)

- **Focus = hover plus ring.** `.app-tile:focus-visible` gets the same background, border colour and shadow as `.app-tile:hover` (recipe in 0.2) and keeps the base 2 px outline at offset 2 (colour `--accent-c`, except shire, which overrides it to gold). A keyboard user sees hover plus a ring; a mouse user sees hover only. The ring clears 3:1 on the tile ground in every theme (stated per theme).
- **No label halo.** `--tile-label-shadow: none` in all eight. The halo existed to keep labels legible over painted art; the art is gone, and on a light ground it reads as a stain.
- **No sheen sweep.** The base one-shot `tile-sheen` on hover is replaced per theme; only dead-space keeps a one-shot hover sweep (its own scan bar, as today). Nothing infinite runs on hover.
- **Tile layout is unchanged.** Border stays 1 px, padding unchanged, so tile height stays 94.7 to 95.4 px and the grid scrolls exactly as today. No theme adds vertical padding to `.tile-label` (persona-4's pill uses a `box-shadow` spread instead).
- **Icon plates.** `--tile-icon-shape` is `inset(0 round Npx)` or `none` unless the theme spec names a silhouette and proves it clears the glyphs (every polygon lists its px margin against the mock glyph geometry, computed, not eyeballed; the old gryffindor shield cut into two of the six glyphs).
- **All backgrounds opaque.** None of the eight is translucent today and none becomes translucent. `--bg`, `--panel-bg` and `--overlay-bg` are opaque hex (alpha 1.0). Effective minimum backdrop alpha for any text surface: **1.0**. Nothing can bleed a desktop wallpaper through, so the audit's over-white check has nothing to test; it is recorded as "n/a, opaque" per theme. (The only place the desktop shows is the clipped corner wedge, where there is no text.)
- **Set every variable the theme touches** as a final value in one `:root` block (each section lists the whole block). Variables a theme never lists inherit `base.css`.
- **`--glow-*`, `--pulse-glow` and `--scanlines` are `none` in all eight** (every base rule that reads them accepts `none`; `--tile-icon-glow` uses a no-op `drop-shadow(0 0 0 rgba(0,0,0,0))` because `none` is invalid inside a filter list).
- **Banner text fits on one line.** Every banner string was measured with the real fonts; Ender confirms `scrollWidth <= clientWidth` on `#theme-banner-text` for every string of every theme (audit H3). Widths were computed without kerning (about 3 percent tolerance); the margins stated are at least 22 px.

### 0.5 Contrast method (how every ratio in this file was produced)

Formulas identical to `check-theme-contrast.js`: WCAG relative luminance, ratio = (L1+0.05)/(L2+0.05), translucent colours composited over the opaque surface below them, results rounded to 2 decimals. Computed with a script (not estimated). Each theme lists:

- **Gate pairs (5):** exactly what `npm run check:contrast` checks, on `--bg`.
- **Add-on pairs:** every other text and control colour on its real surface: tile label on rest, hover and pressed ground and on the worst-case textured pixel, title on header, version on header, header buttons, filter chip, banner text on banner, edit label and buttons on the edit bar, settings text on panel, update banner, focus ring, hover border, hint text, error text, plus up to eight generic accent-on-fill roles (picker rows, search field, rename and hotkey input, edit-mode hover label, recording, dismiss). Small text needs 4.5:1, non-text 3:1.
- **Icons:** the six mock plates through `--tile-icon-fx` on the rest, hover and pressed grounds (0.1.8, 0.1.9).

Ender's after-run repeats the gate (`npm run check:contrast`, no `--rebaseline`) and samples the label-versus-brightest-texture-pixel pair from the screenshots.

### 0.6 Texture measure (audit C5, hidden-tiles shot)

For each theme capture twice, tiles visible and `#app-grid{visibility:hidden}`. In the hidden shot compute the standard deviation of Rec. 709 luminance (8-bit) inside each tile rect from `getBoundingClientRect` at scroll 0, inset 2 px, and report the mean over the six visible tiles as **sigma**.
- Reference floor: `2001`. Expected sigma at most 1.5 (no texture at all).
- Reference ceiling: `promise-mascot`. Target sigma **2.5 to 5.0**, hard cap **6.0**. If the recorded value is outside 2.5 to 5.0, scale the grain layer's alpha coefficient by (target 4.0 / recorded) and re-capture. The recorded promise-mascot value becomes the batch ceiling.
- Every other theme in the batch must record sigma at most the promise-mascot value, and at most 6.0. Expected: persona-4 at most 1.5, gryffindor 2 to 3, 2001 and cyberpunk about 0, stranger-things at most 1.5, shire at most 2, dead-space at most 1.
- If a theme records more than the promise-mascot value, lower that theme's texture alpha until it does not (gryffindor's tartan layers first).
- I could not render the grain here (nothing may be launched), so the grain layer is specified with a tuning knob and a measured target instead of a guessed final alpha.

### 0.7 How infinite animations were counted

For each theme I listed every animation declaration in the CSS, including those reached through `--title-anim` and `--banner-icon-anim`, on every element and pseudo-element (`#app`, `#particles`, `#title`, `#header::before`, `#theme-banner::before`, `#grid-container::before/::after`), counting each one that has `infinite`. Hover-only animations are listed separately. I then compared the tally with `loopingAnimationsAtCapture` in `theme-metadata.csv` (the gallery counts animations running at capture): **all eight agree** (6, 6, 6, 6, 7, 6, 6, 7). After-counts are `grep -c infinite` on the new CSS plus any `--*-anim` custom property that resolves to an infinite animation.

| Theme | Before | After | Property and element of what remains |
|---|---|---|---|
| promise-mascot | 6 | 0 | none |
| persona-4 | 6 (+1 hover-only) | 0 | none |
| gryffindor | 6 | 0 | none |
| 2001 | 6 | 0 | none |
| cyberpunk | 7 | 1 | `transform` on `#title` (about 90 x 20 px), `steps(1)`, 8 s |
| stranger-things | 6 | 1 | `opacity` on `#theme-banner::before` (22 x 22 px), `steps(1)`, 5 s |
| shire | 6 | 0 | none |
| dead-space | 7 | 0 | none (the one-shot hover scan sweep is kept as today and is not infinite) |
| **Batch total** | **50** | **2** | |

Tier key (create-theme.md, cheapest first): 1 opacity or transform, 2 colour or text-shadow, 3 filter, 4 background-position, 5 box-shadow, 6 clip-path; each motion table below gives the highest tier among the properties an animation touches. Every remaining animation is on `transform` or `opacity` (tier 1), on a small element, stepped, and costs no more than what it replaces. No `#app` box-shadow, no full-window `background-position`, no `clip-path` animation remains in any of the eight.

### 0.8 Verification set (audit C5 plus this batch)

Ender's after-run captures, for each theme: grid, hover, settings (same names as `current/`), the hidden-tiles shot, and grid shots at 640x420 and 1024x700. The `hover` shot must hover the CALCULATOR tile (same as before). Extra states to check by hand or with a scripted state: focus-visible ring on the first tile, filter chip visible (type one letter), edit mode visible, update banner visible, settings overlay, skin picker list open, grid scrolled by one row. In every state: no art rect intersects the tile field (expanded 4 px), a label, the chip, or a button. Note the settings shot at 424x300 shows only the middle of the panel (audit section 9, item 1: the overlay is taller than the window); the settings "done when" items are limited to what that crop shows, and the base bug is not part of this batch.

### 0.9 Fonts used (all confirmed present in `C:/Windows/Fonts` on this machine; all stock Windows 11)

| Family (CSS) | File(s) | Themes | Cyrillic (checked with negative controls) |
|---|---|---|---|
| Segoe UI, Segoe UI Semibold, Segoe UI Black | `segoeui.ttf`, `seguisb.ttf`, `seguibl.ttf` | body font in promise-mascot, persona-4 and 2001; persona-4 labels; fallback in the others | yes |
| Segoe UI Semilight | `segoeuisl.ttf` | 2001 | yes |
| Arial Black | `ariblk.ttf` | promise-mascot, persona-4 titles | yes |
| Yu Gothic (Bold) | `yugothb.ttc` | promise-mascot labels and banner | yes |
| Bahnschrift (variable, weight and width axes) | `bahnschrift.ttf` | cyberpunk, dead-space | yes |
| Georgia (regular, italic, bold) | `georgia.ttf`, `georgiai.ttf`, `georgiab.ttf` | stranger-things, shire | yes |
| Palatino Linotype (regular, italic, bold) | `pala.ttf`, `palai.ttf`, `palab.ttf` | gryffindor | yes |
| Gabriola | `gabriola.ttf` | shire title | yes |

Not used, and confirmed absent or non-stock: **Yu Mincho** and **Cascadia** (not in `C:/Windows/Fonts`), and every Office-only or Google face named in audit C2. Cyrillic method: render U+0416, U+042F and U+0431 and compare against the missing-glyph box; two negative controls (Ebrima has no Cyrillic; Segoe UI has no CJK) both failed as they should, one positive control (Yu Gothic Bold has CJK) passed. None of the eight themes shows any Cyrillic text of its own; every font stack ends in a Cyrillic-covering face (Segoe UI, Georgia, Arial, Bahnschrift or Palatino) so a user's Cyrillic tile names never fall to an arbitrary font.

**Bahnschrift `font-stretch`.** Cyberpunk asks for Condensed (`font-stretch: 75%`) and SemiCondensed (`87.5%`). I could not test in this Chromium whether the property reaches the width axis of a system variable font. The file's axes were read directly (weight 300 to 700, width 75 to 100) and every cyberpunk string fits at normal width too, so the fallback needs no design change. The after-run measures a label width to tell which happened (cyberpunk 5.6). Dead-space uses normal width and does not depend on it.

### 0.10 Where this spec departs from the audit, and why

| Theme | Audit direction | This spec | Reason |
|---|---|---|---|
| all | gutter rules and ticks; art in the frame | gutter art dropped; frame art in `#grid-container` background | gutters move with window width; the container's pseudo-elements scroll (0.1.1, 0.2) |
| all | banner quotes | quotes replaced by real, short lines; edit-bar text deleted | H3; only lines I could vouch for are kept (dead-space keeps two) |
| promise-mascot | as audit | same palette and motifs; adds a text-role pink `#F27AA6` | `#E0508C` is 4.68:1, too low for small text on some fills |
| persona-4 | rain blue `#3A6AA0` for focus | focus is yellow; rain blue (lightened to `#7FB0E8`) only on the update bar | `#3A6AA0` is 3.3:1 on the ground and lower on fills |
| gryffindor | shield icons kept | new, shallower shield | the old one cropped the Calculator, Terminal and Files glyphs (negative margins, measured) |
| 2001 | Segoe UI Light; orange and blue on focus and hover | Semilight; blue is the accent, orange only a lamp strip | Light is hairline at 11 to 12 px; orange is 2.0:1 on the light ground |
| cyberpunk | symmetric chamfer window; "one stepped glitch at most" | asymmetric top-left/bottom-right chamfer; the glitch is a `transform`-only title jitter | the game's look; `transform` is the cheapest property |
| stranger-things | bulbs "on the header bottom edge" with an optional twinkle; hover blue `#1A3A6A` | bulbs in the top band as a background under the tiles; the flicker moves to the banner icon; hover fill `#10203C` | an overlay above the tiles would paint over scrolled tiles; `#1A3A6A` drops the icons to 2.3:1 |
| shire | leaf ticks in gutters; round-door arch behind the title | ticks on the top plank; a door-in-a-hill in the header zone; rounded window; focus ring overridden to gold | gutters dropped; art behind text would need a contrast check against the art |
| dead-space | octagon tiles kept | kept at 12 percent | measured glyph-safe |

### 0.11 Suggested implementation order for Ender

1. **2001** first (the floor reference and the light-ground test), then **promise-mascot** (the ceiling reference), record both sigma values, then the other six in any order.
2. Build the three shared recipes (0.2) once as helpers you copy per theme; every theme section gives its own numbers.
3. After each theme: `npm run check:contrast`, gallery after-run (grid, hover, settings, hidden-tiles), `grep -c infinite`, and the per-theme "Done when" list. Do not use `--rebaseline`.


---

## 1. promise-mascot (PROMISE MASCOT AGENCY): DONE

**Audit:** score 1, redraw. Premise per audit section 4: the old "corporate pastel turning sinister" brief is wrong; nothing in it survives. The game is Showa-era rural Japan: lo-fi, grainy, VHS colour shift, pop-art UI, spirit creatures, paper dolls.
**Direction:** a washed, grainy Showa film poster. Near-black ground, faded beige-grey text, spot pink and pop yellow used sparingly, static film grain and a faint halftone, bold square panels with a hard offset shadow, a torn beige paper strip for the banner, and two small original cut-out motifs (paper dolls and a black-and-pink spirit blob) in the header strip only. No smiley, no confetti, no invented company copy.

### 1.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #1C1A1E;
  --panel-bg: #232026;
  --overlay-bg: #1C1A1E;
  --header-bg: #26232A;
  --font: 'Segoe UI', 'Yu Gothic', Arial, sans-serif;
  --text: #B8B0A0;
  --text-dim: #9C9588;
  --accent-c: #E0508C;
  --accent-m: #F27AA6;
  --accent-y: #F0D040;
  --accent-text: #F0D040;
  --border: #4A444C;
  --border-h: #E0508C;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 2px #E0508C;
  --title-anim: none;
  --tile-hover-bg: #29262C;
  --tile-hover-border: #E0508C;
  --tile-hover-shadow: 3px 3px 0 #E0508C;
  --tile-active-bg: #29262C;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.72) sepia(0.15) drop-shadow(2px 2px 0 rgba(10,9,11,0.85));
  --tile-icon-shape: none;
  --tile-label-spacing: 0.3px;
  --tile-label-transform: none;
  --tile-label-weight: 700;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #332F36;
  --btn-active-bg: #3E3941;
  --drop-hint-border: #5A535C;
  --drop-icon-color: #8A8478;
  --hint-sub-color: #A39C8E;
  --rename-dashed: #E0508C;
  --rename-input-bg: #29262C;
  --edit-bar-bg: #2E1A25;
  --edit-bar-border: #E0508C;
  --edit-label-color: #F27AA6;
  --edit-label-glow: none;
  --btn-done-color: #F27AA6;
  --btn-done-border: #E0508C;
  --btn-done-hover-bg: #4A2438;
  --btn-done-hover-glow: none;
  --btn-add-border: #8A8478;
  --update-bg: #2E2A1A;
  --update-border: #F0D040;
  --update-color: #F0D040;
  --update-btn-border: #F0D040;
  --update-btn-hover-bg: #453E1C;
  --update-btn-hover-glow: none;
  --btn-close-color: #F27AA6;
  --btn-close-border: #E0508C;
  --btn-close-hover-bg: #4A2438;
  --btn-close-hover-glow: none;
  --picker-search-bg: #29262C;
  --picker-item-hover-bg: #29262C;
  --picker-item-active-bg: #29262C;
  --picker-placeholder-bg: #29262C;
  --skin-btn-active-bg: #29262C;
  --remove-btn-bg: #B03A6C;
  --remove-btn-border: #E0508C;
}
```

Notes: `--glow-*` are `none` on purpose (flat print look; every base rule that reads them accepts `none`). `--tile-icon-glow` is a no-op filter because `none` is invalid inside a filter list. The icon `drop-shadow(2px 2px 0 ...)` is a hard, unblurred cut-out shadow.

**Gate pairs** (what `npm run check:contrast` checks; all values are opaque, so no flattening effect):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#B8B0A0` on `#1C1A1E` | 4.5:1 | **8.02:1** |
| --text-dim on --bg | `#9C9588` on `#1C1A1E` | 4.5:1 | **5.81:1** |
| --accent-c on --bg | `#E0508C` on `#1C1A1E` | 3:1 | **4.68:1** |
| --accent-text on --bg | `#F0D040` on `#1C1A1E` | 3:1 | **11.35:1** |
| --hint-sub-color on --bg | `#A39C8E` on `#1C1A1E` | 4.5:1 | **6.34:1** |

**Add-on pairs** (each text or control colour on its real surface):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#B8B0A0` on `#232026` | 4.5:1 | **7.47:1** |
| Tile label on tile hover | `#B8B0A0` on `#29262C` | 4.5:1 | **6.93:1** |
| Tile label on tile pressed | `#B8B0A0` on `#29262C` | 4.5:1 | **6.93:1** |
| Title (accent-text) on header | `#F0D040` on `#26232A` | 4.5:1 | **10.18:1** |
| Title dot (accent-m) on header | `#F27AA6` on `#26232A` | 4.5:1 | **5.98:1** |
| Header version (text-dim) on header | `#9C9588` on `#26232A` | 4.5:1 | **5.21:1** |
| Header button glyph (text) on header | `#B8B0A0` on `#26232A` | 4.5:1 | **7.19:1** |
| Header button glyph on button hover | `#B8B0A0` on `#332F36` | 4.5:1 | **6.09:1** |
| Filter chip text on chip (#1C1A1E) | `#F0D040` on `#1C1A1E` | 4.5:1 | **11.35:1** |
| Banner text on paper strip | `#1C1A1E` on `#B8B0A0` | 4.5:1 | **8.02:1** |
| Edit label on edit bar | `#F27AA6` on `#2E1A25` | 4.5:1 | **6.28:1** |
| Done / close button text on edit bar | `#F27AA6` on `#2E1A25` | 4.5:1 | **6.28:1** |
| + FILE / + INSTALLED text on edit bar | `#B8B0A0` on `#2E1A25` | 4.5:1 | **7.56:1** |
| Done button text on its hover fill | `#F27AA6` on `#4A2438` | 4.5:1 | **5.07:1** |
| Settings text on overlay | `#B8B0A0` on `#1C1A1E` | 4.5:1 | **8.02:1** |
| Settings text on panel | `#B8B0A0` on `#232026` | 4.5:1 | **7.47:1** |
| Settings label (text-dim) on panel | `#9C9588` on `#232026` | 4.5:1 | **5.41:1** |
| Settings value / cheat key (accent-text) on panel | `#F0D040` on `#232026` | 4.5:1 | **10.57:1** |
| Settings CLOSE text on panel | `#F27AA6` on `#232026` | 4.5:1 | **6.21:1** |
| Hotkey error text (accent-m) on panel | `#F27AA6` on `#232026` | 4.5:1 | **6.21:1** |
| Hotkey input text on input fill | `#F0D040` on `#29262C` | 4.5:1 | **9.80:1** |
| Picker row text on hover fill | `#B8B0A0` on `#29262C` | 4.5:1 | **6.93:1** |
| Update banner text on update bar | `#F0D040` on `#2E2A1A` | 4.5:1 | **9.44:1** |
| Update button text on hover fill | `#F0D040` on `#453E1C` | 4.5:1 | **7.05:1** |
| Drop-hint text (text-dim) on grid ground | `#9C9588` on `#1C1A1E` | 4.5:1 | **5.81:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#B03A6C` | 3.0:1 | **5.73:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#E0508C` on `#232026` | 3.0:1 | **4.36:1** |
| Focus ring on grid ground (non-text) | `#E0508C` on `#1C1A1E` | 3.0:1 | **4.68:1** |
| Hover border on grid ground (non-text) | `#E0508C` on `#1C1A1E` | 3.0:1 | **4.68:1** |
| Hover border on hover fill (non-text) | `#E0508C` on `#29262C` | 3.0:1 | **4.05:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#F0D040` on `#29262C` | 4.5:1 | **9.80:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#F0D040` on `#29262C` | 4.5:1 | **9.80:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#F0D040` on `#29262C` | 4.5:1 | **9.80:1** |
| Picker / skin search input text (accent-text) on search fill | `#F0D040` on `#29262C` | 4.5:1 | **9.80:1** |
| Rename / hotkey input text (accent-text) on input fill | `#F0D040` on `#29262C` | 4.5:1 | **9.80:1** |
| Search placeholder (text-dim) on search fill | `#9C9588` on `#29262C` | 4.5:1 | **5.02:1** |
| Hotkey recording text (accent-m) on input fill | `#F27AA6` on `#29262C` | 4.5:1 | **5.76:1** |
| Update dismiss glyph (text-dim) on update bar | `#9C9588` on `#2E2A1A` | 4.5:1 | **4.83:1** |

**Lowest ratio in this theme: 4.05:1 (Hover border on hover fill (non-text)).** Lowest text ratio: 4.83:1. Every pair clears AA.

**Texture worst case for labels.** Grain plus halftone over a tile ground is capped at a combined overlay alpha of **0.15** (grain peak at most 0.10, halftone 0.05). Worst case is a pale speck `#E8E0CC` at 0.15 over the tile ground `#232026`: the label `#B8B0A0` still reaches **4.97:1**, above 4.5:1. This is the "brightest art pixel behind a label" pair.

**Icon plates through `--tile-icon-fx` (saturate 0.72, sepia 0.15; no brightness change):**

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6E8194` | `#232026` | 4.00:1 | pass |
| Calculator `#6b6f76` | `#727272` | `#232026` | 3.34:1 | pass |
| Paint `#b07a4f` | `#A58161` | `#232026` | 4.53:1 | pass |
| Terminal `#3d4450` | `#43464A` | `#232026` | 1.69:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#678984` | `#232026` | 4.20:1 | pass |
| Files `#c09a3e` | `#BA9E60` | `#232026` | 6.24:1 | pass |

Lowest non-Terminal icon ratio: **3.34:1** (pass). Terminal is 1.69:1 on this panel (it was about 1.9:1 to 2.0:1 on the old near-black ground); the fx does not darken it, the panel ground is the difference.

Icons on the hover fill `#29262C` and the pressed fill `#29262C` (same colour): lowest non-Terminal plate **3.10:1** (pass; the hover fill is dark enough for the mid-grey Calculator plate to stay above 3:1).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum alpha is 1.0 and nothing bleeds through; over-white check n/a.

### 1.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Segoe UI', 'Yu Gothic', Arial, sans-serif` | 400 (base) | base | base | base |
| `#title` | `'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif` (`ariblk.ttf`, `seguibl.ttf`) | 900 | 11 px (base) | 1px | uppercase (markup) |
| `.tile-label` | `'Yu Gothic', 'Segoe UI', sans-serif` (`yugothb.ttc` at weight 700) | 700 (`--tile-label-weight`) | 12 px (base) | 0.3px | as typed (`none`) |
| `#theme-banner-text` | `'Yu Gothic', 'Segoe UI', sans-serif` | 700 | 11 px (base) | 0.5px | as written below |

Measured with the real font files (Pillow, 1:1 px): the title is 108 px wide, so it ends at x 120 (the header art starts at x 168: 48 px clear). Labels: Notepad 51, Terminal 53, Calculator 63, Browser 51 px, all inside the 100 px label box; "Spreadsheet Editor" (116 px) ellipsizes as it does today. Expected `fontsRendered`: `Arial Black, Yu Gothic Bold, Segoe UI`. **Cyrillic:** this theme has no Cyrillic text. A user's Cyrillic tile names are covered: Segoe UI, Arial Black and Yu Gothic Bold all contain U+0416 (checked with two negative controls, a font known to lack Cyrillic and a missing-glyph probe, both of which correctly failed).

### 1.3 Art (redraw). Everything static, original, inline SVG data URIs

Delete: the four current SVGs (panno, two confetti tiles, grain), the ghost readout, header text, edit-bar text and particles (0.3). New art, four pieces:

**A. Film grain plus halftone, on `#app::after` (full window, above tiles, `pointer-events:none`).** Two background layers, no vignette, no scanlines:
1. Grain: SVG tile 200x200, `feTurbulence type=fractalNoise baseFrequency=0.9 numOctaves=2 stitchTiles=stitch`, then `feColorMatrix type=matrix values="0 0 0 0 0.91  0 0 0 0 0.88  0 0 0 0 0.80  0.13 0 0 0 -0.035"` (constant warm-white colour, alpha driven by the noise; starting mean alpha about 0.03, peak at most 0.10). `background-size: 200px 200px`.
2. Halftone: `radial-gradient(circle at 3px 3px, rgba(232,224,204,0.05) 0 1px, transparent 1.6px)`, `background-size: 6px 6px`.
Tune per 0.6 (sigma target 2.5 to 5.0, cap 6.0); never raise the combined alpha above 0.15 (label contrast, above).

**B. Header art (HZ), `#header::after`.** `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; background:url(svg) no-repeat 0 0 / 84px 20px; pointer-events:none;`. Hidden with `#header:has(#filter-chip:not(.hidden))::after { display:none }`. SVG `viewBox="0 0 84 20"`, no background, drawn back to front:
- **Paper doll A (left, x 3 to 17).** First a 1 px offset shadow copy (fill `#101010`, translated (1,1)). Then head: circle cx 10, cy 5, r 3.4, fill `#B8B0A0`. Body (flat cut-out with flared sleeves): path `M10 8.6 L4 11.2 L6.6 12.4 L5.4 18.4 L14.6 18.4 L13.4 12.4 L16 11.2 Z`, fill `#B8B0A0`. A pink stamp: circle cx 10, cy 13.5, r 1.3, fill `#E0508C`.
- **Paper doll B (x 20 to 34), smaller and tilted.** Same construction scaled 0.8 about its centre, head at cx 27, cy 7, rotated 12 degrees about (27,12); fill `#8A8478`, no pink stamp.
- **Spirit blob (right, x 48 to 76).** Body path `M50 17.5 C48 10 52 3.5 60 3.5 C69 3 75 7 74.5 13 C74 16 71 17.5 68 17 C66.5 19 63.5 19 62 17.5 C60 19 57 19 55.5 17.5 C53.5 18.8 51 18.8 50 17.5 Z`, fill `#101010`, stroke `#E0508C` 1.2 px (three soft bumps along the bottom). Two unequal eyes: circle cx 58, cy 9.5, r 2.4 and circle cx 67, cy 8.5, r 1.9, fill `#E0508C`; pupils r 0.8, fill `#101010`, at cx 58.6 and cx 67.4 (same cy as their eye). Mouth: a 1 px `#E0508C` line from (60,13.5) to (65,13). One drip: circle cx 71.5, cy 17.2, r 1, fill `#E0508C`.
- Opacity 1 everywhere (no alpha in this piece). Dolls and blob are generic shapes, not the game's mascots (C1).

**C. Header rule.** `#header { box-shadow: 0 3px 0 #E0508C; }`: a 3 px hard pink underline that spills into the top band (y 40 to 43); the band is empty in this theme and the tile ring starts at y 52. The 2 px left bar `#header::before` stays base (pink `--accent-c`, no glow).

**D. Banner: paper strip with a torn top edge and a blob icon.**
- `#theme-banner { background:#B8B0A0; border-top:0; z-index:250; }` (already `position:relative`; the z-index lifts it above the grain so the paper stays clean).
- **Torn edge, `#theme-banner::after`:** `content:''; position:absolute; top:0; left:0; right:0; height:7px; background:url(svg) repeat-x 0 0 / 56px 7px; pointer-events:none;`. SVG `viewBox="0 0 56 7"`, one path filled `#1C1A1E`: `M0 0 H56 V3 L51 5.5 L46 2.5 L40 6 L35 3.5 L28 6.5 L22 2 L16 5 L10 3 L4 6 L0 3 Z` (starts and ends at y 3, so it tiles seamlessly). It leaves a jagged paper edge; the text sits at y 15 to 29, clear of it.
- **Icon, `#theme-banner::before`:** `content:''; width:22px; height:22px; font-size:0; opacity:1; background:url(svg) center / 22px 22px no-repeat;`. SVG `viewBox="0 0 22 22"`: a small spirit blob, path `M3 19 C2 10 6 3 12 3 C18 3 21 8 20 15 C20 18 18.5 19 17 18.5 C16 20.5 13.5 20.5 12.5 19 C11 20.5 8.5 20.5 7.5 19 C6 20 4 20 3 19 Z` fill `#101010`; eyes circle cx 9, cy 10, r 2.4 and circle cx 15.2, cy 9, r 1.9, fill `#E0508C`.
- **Banner strings** (`THEME_BANNERS['promise-mascot']`, replaces all five; audit section 4 allows neutral in-tone labels because no in-game line is reliably short; none states any lore):
  1. `ANOTHER DAY, ANOTHER ERRAND.`
  2. `OPEN SOMETHING. ANYTHING.`
  3. `THE TOWN CAN WAIT A MINUTE.`
  4. `PICK A TILE. KEEP GOING.`
  5. `NOT BAD FOR A MONDAY.`
  Measured widths in Yu Gothic Bold 11 px with 0.5 px tracking: 213, 188, 196, 158, 156 px against a 364 px text box: all fit on one line with 150 px to spare.

**Safe zones:** the tile field is empty of art (only the grain layer at alpha at most 0.10 plus halftone 0.05). The header art box is x 168 to 252 (title ends x 120, first button starts x 276). FZ-L, FZ-R and FZ-T carry nothing in this theme. The torn edge and icon live inside the banner. No motif touches a tile, a label, the chip or a button.

### 1.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `mascot-title 10s` | `#title` colour, text-shadow, opacity (incl. the 88 percent white flash) **(tier 2)** | removed |
| 2 | `banner-pulse 6s` | `#theme-banner::before` opacity **(tier 1)** | removed |
| 3 | `mascot-face 10s` | `#grid-container::before` opacity **(tier 1)** | removed with the panno |
| 4 | `mascot-readout 10s` | `#grid-container::after` colour **(tier 2)** | removed with the readout |
| 5 | `mascot-border 10s` | `#app` box-shadow **(tier 5)** | removed |
| 6 | `mascot-confetti 28s linear` | `#particles` background-position **(tier 4)** | removed |
| hover | `tile-radial .5s` one-shot | `.app-tile:hover::before` **(tier 1)** | removed (replaced by the hard-shadow pop below, a transition) |

**Before 6, after 0.** Nothing costs more than today. The only motion left is the 0.08 s transition on tile hover (not infinite) and the one-shot `entrance-fade 0.8s`.

### 1.5 Tiles, hover, selected, filter, banner

Rules to write (declarations final):
- **Tile at rest:** `.app-tile { background:#232026; border-color:#4A444C; transition: transform .08s, background .08s, border-color .08s, box-shadow .08s; }` and `.app-tile::before { display:none; }`. Square panels (`--radius: 0`), 1 px border (layout unchanged).
- **Hover:** border `#E0508C`, fill `#29262C`, hard pink shadow `3px 3px 0 #E0508C`, lifted by `transform: translate(-1px,-1px)`. The shadow reaches 3 px into the 8 px gutter, inside the 4 px keep-out.
- **Selected (focus-visible):** the same as hover plus the base 2 px pink outline at offset 2: `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); transform:translate(-1px,-1px); }`.
- **Pressed:** `.app-tile:active { transform:translate(2px,2px); box-shadow:1px 1px 0 var(--accent-c); background:var(--tile-active-bg); }` (it presses into the shadow; replaces the base scale 0.96).
- **Label:** `.tile-label { font-family:'Yu Gothic','Segoe UI',sans-serif; }` colour `--text`. No halo.
- **Title and banner text:** `#title { font-family:'Arial Black','Segoe UI Black','Segoe UI',sans-serif; font-weight:900; letter-spacing:1px; color:var(--accent-text); text-shadow:none; }` (yellow on `#26232A`, 10.18:1; the dot stays `--accent-m` pink) and `#theme-banner-text { font-family:'Yu Gothic','Segoe UI',sans-serif; font-weight:700; letter-spacing:0.5px; color:#1C1A1E; }` (dark on the beige strip, 8.02:1).
- **Filter chip (`#filter-chip`):** `background:#1C1A1E; border-color:#F0D040; border-radius:0; box-shadow:2px 2px 0 #E0508C;`. Text stays `--accent-text` (yellow, 11.35:1). The header art hides while the chip shows, so nothing sits behind or beside it.
- **Header buttons:** base rules, no override (glyph `#B8B0A0` on `#26232A`, 7.19:1; hover fill `#332F36`, white glyph).
- **Edit bar:** variables only (dark plum fill, pink rule). No quote.
- **Settings overlay:** opaque `#1C1A1E`; panel `#232026`; values yellow; sliders and checkboxes take `--accent-c` pink; no glows.

### 1.6 Done when (checked from the after screenshots and the run report)

1. The grid shot shows only: title, version, six labels, banner text. No text fragments in the header or over the tiles, no smiley, no confetti dots.
2. Header art is at x 168 to 252 (measure it), at least 12 px right of the title's right edge and at least 24 px left of the first button; typing a letter hides it and shows the chip.
3. Banner is a beige strip with a jagged dark top edge, a black blob with two pink eyes at the left, and a one-line dark quote (`scrollWidth <= clientWidth`, no ellipsis).
4. Hover shot: the CALCULATOR tile has a pink border and a hard pink shadow at bottom right, lifted 1 px; its neighbours are visually unchanged; no sheen.
5. Hidden-tiles shot: sigma 2.5 to 5.0 (cap 6.0), reported; this value becomes the batch ceiling.
6. Sampled colours: gutter pixel near `#1C1A1E` (plus grain), title yellow, banner strip `#B8B0A0`; pink appears only in hover/focus, the header underline, the header art and the blob; yellow only in the title, the chip and settings values.
7. `npm run check:contrast` passes with no rebaseline; `loopingAnimationsAtCapture` is 0 (was 6); `grep -c infinite` is 0; `grep -c "\A"` finds no backslash-A escape.
8. `fontsRendered` lists Arial Black, Yu Gothic (Bold) and Segoe UI.
9. 640x420 and 1024x700 shots: the header art stays 24 px left of the buttons and does not scale; the banner strip and torn edge span the full width.


---

## 2. persona-4 (PERSONA 4): DONE

**Audit:** score 2, redraw. It is gloomy where Inaba is sunny: mustard text on a near-black sepia wash, a painted CRT television through the tiles, scanlines over every icon, a `0.08s` snow layer.
**Direction:** Persona 4's bold yellow-and-black panels. A solid TV-yellow header and banner strip with near-black type, a dark warm body, rounded TV-screen tiles, four hand-drawn stars in the header strip, and a yellow "menu highlight" pill behind the label of the hovered or focused tile. Fog is a faint static haze, not a texture. No snow, no scanlines, no television drawing.

### 2.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 6px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #14110A;
  --panel-bg: #1C1810;
  --overlay-bg: #14110A;
  --header-bg: #F5D60A;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #E8E4D0;
  --text-dim: #B5AF98;
  --accent-c: #F5D60A;
  --accent-m: #F07A3A;
  --accent-y: #7FB0E8;
  --accent-text: #F5D60A;
  --border: #4A4220;
  --border-h: #F5D60A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #F5D60A;
  --title-anim: none;
  --tile-hover-bg: #27220F;
  --tile-hover-border: #F5D60A;
  --tile-hover-shadow: none;
  --tile-active-bg: #27220F;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(1.1) contrast(1.05);
  --tile-icon-shape: none;
  --tile-label-spacing: 0.3px;
  --tile-label-transform: none;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #27220F;
  --btn-active-bg: #27220F;
  --drop-hint-border: #6A5E22;
  --drop-icon-color: #A8A288;
  --hint-sub-color: #A8A288;
  --rename-dashed: #B89A10;
  --rename-input-bg: #27220F;
  --edit-bar-bg: #2A1608;
  --edit-bar-border: #E0561A;
  --edit-label-color: #F07A3A;
  --edit-label-glow: none;
  --btn-done-color: #F07A3A;
  --btn-done-border: #E0561A;
  --btn-done-hover-bg: #4A2410;
  --btn-done-hover-glow: none;
  --btn-add-border: #A8A288;
  --update-bg: #101C2C;
  --update-border: #7FB0E8;
  --update-color: #7FB0E8;
  --update-btn-border: #7FB0E8;
  --update-btn-hover-bg: #1C3050;
  --update-btn-hover-glow: none;
  --btn-close-color: #F07A3A;
  --btn-close-border: #E0561A;
  --btn-close-hover-bg: #4A2410;
  --btn-close-hover-glow: none;
  --picker-search-bg: #27220F;
  --picker-item-hover-bg: #27220F;
  --picker-item-active-bg: #27220F;
  --picker-placeholder-bg: #27220F;
  --skin-btn-active-bg: #27220F;
  --remove-btn-bg: #B8420F;
  --remove-btn-border: #F07A3A;
}
```
Notes: `--glow-*` are `none` (flat print look). `--tile-icon-glow` is a no-op filter (`none` is invalid inside a filter list). `--header-bg` is the solid TV yellow; because the header is yellow, the theme overrides the title, version, header buttons and filter chip colours with rules (2.5), and `--text` / `--text-dim` are only ever used on dark surfaces.

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#E8E4D0` on `#14110A` | 4.5:1 | **14.75:1** |
| --text-dim on --bg | `#B5AF98` on `#14110A` | 4.5:1 | **8.57:1** |
| --accent-c on --bg | `#F5D60A` on `#14110A` | 3:1 | **13.02:1** |
| --accent-text on --bg | `#F5D60A` on `#14110A` | 3:1 | **13.02:1** |
| --hint-sub-color on --bg | `#A8A288` on `#14110A` | 4.5:1 | **7.35:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E8E4D0` on `#1C1810` | 4.5:1 | **13.84:1** |
| Tile label on tile hover fill | `#E8E4D0` on `#27220F` | 4.5:1 | **12.44:1** |
| Tile label on tile pressed | `#E8E4D0` on `#27220F` | 4.5:1 | **12.44:1** |
| Hover/focus label pill: text on pill | `#1A1A1A` on `#F5D60A` | 4.5:1 | **12.02:1** |
| Title on yellow header | `#1A1A1A` on `#F5D60A` | 4.5:1 | **12.02:1** |
| Title dot on yellow header | `#9A2F08` on `#F5D60A` | 4.5:1 | **5.21:1** |
| Header version on yellow header | `#3A3208` on `#F5D60A` | 4.5:1 | **8.85:1** |
| Header button glyph on yellow header | `#1A1A1A` on `#F5D60A` | 4.5:1 | **12.02:1** |
| Header button hover: glyph on black fill | `#F5D60A` on `#1A1A1A` | 4.5:1 | **12.02:1** |
| Filter chip text on black chip | `#F5D60A` on `#1A1A1A` | 4.5:1 | **12.02:1** |
| Banner text on yellow strip | `#1A1A1A` on `#F5D60A` | 4.5:1 | **12.02:1** |
| Edit label on edit bar | `#F07A3A` on `#2A1608` | 4.5:1 | **6.21:1** |
| Done / close text on edit bar | `#F07A3A` on `#2A1608` | 4.5:1 | **6.21:1** |
| + FILE / + INSTALLED text on edit bar | `#E8E4D0` on `#2A1608` | 4.5:1 | **13.51:1** |
| Done text on its hover fill | `#F07A3A` on `#4A2410` | 4.5:1 | **4.87:1** |
| Settings text on overlay | `#E8E4D0` on `#14110A` | 4.5:1 | **14.75:1** |
| Settings text on panel | `#E8E4D0` on `#1C1810` | 4.5:1 | **13.84:1** |
| Settings label (text-dim) on panel | `#B5AF98` on `#1C1810` | 4.5:1 | **8.04:1** |
| Settings value / cheat key (accent-text) on panel | `#F5D60A` on `#1C1810` | 4.5:1 | **12.22:1** |
| Settings CLOSE text on panel | `#F07A3A` on `#1C1810` | 4.5:1 | **6.36:1** |
| Hotkey error text (accent-m) on panel | `#F07A3A` on `#1C1810` | 4.5:1 | **6.36:1** |
| Hotkey input text on input fill | `#F5D60A` on `#27220F` | 4.5:1 | **10.97:1** |
| Picker row text on hover fill | `#E8E4D0` on `#27220F` | 4.5:1 | **12.44:1** |
| Update banner text on update bar | `#7FB0E8` on `#101C2C` | 4.5:1 | **7.58:1** |
| Update button text on hover fill | `#7FB0E8` on `#1C3050` | 4.5:1 | **5.84:1** |
| Drop-hint text (text-dim) on grid ground | `#B5AF98` on `#14110A` | 4.5:1 | **8.57:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#B8420F` | 3.0:1 | **5.49:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#F5D60A` on `#1C1810` | 3.0:1 | **12.22:1** |
| Focus ring on grid ground (non-text) | `#F5D60A` on `#14110A` | 3.0:1 | **13.02:1** |
| Hover border on grid ground (non-text) | `#F5D60A` on `#14110A` | 3.0:1 | **13.02:1** |
| Hover border on hover fill (non-text) | `#F5D60A` on `#27220F` | 3.0:1 | **10.97:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#F5D60A` on `#27220F` | 4.5:1 | **10.97:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#F5D60A` on `#27220F` | 4.5:1 | **10.97:1** |
| Picker / skin search input text (accent-text) on search fill | `#F5D60A` on `#27220F` | 4.5:1 | **10.97:1** |
| Rename / hotkey input text (accent-text) on input fill | `#F5D60A` on `#27220F` | 4.5:1 | **10.97:1** |
| Search placeholder (text-dim) on search fill | `#B5AF98` on `#27220F` | 4.5:1 | **7.22:1** |
| Hotkey recording text (accent-m) on input fill | `#F07A3A` on `#27220F` | 4.5:1 | **5.71:1** |
| Update dismiss glyph (text-dim) on update bar | `#B5AF98` on `#101C2C` | 4.5:1 | **7.80:1** |

**Lowest ratio in this theme: 4.87:1 (Done text on its hover fill).** Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, tile ground `#1C1810`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#567FAC` | `#1C1810` | 4.23:1 | pass |
| Calculator `#6b6f76` | `#6A6E77` | `#1C1810` | 3.46:1 | pass |
| Paint `#b07a4f` | `#B87947` | `#1C1810` | 4.94:1 | pass |
| Terminal `#3d4450` | `#39414F` | `#1C1810` | 1.72:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#478C8D` | `#1C1810` | 4.55:1 | pass |
| Files `#c09a3e` | `#C79B31` | `#1C1810` | 6.87:1 | pass |

Lowest non-Terminal icon ratio: **3.46:1** (pass). Terminal is 1.72:1 on this ground (mock art; the old near-black ground gave about 1.9:1); the fx (saturate 1.1, contrast 1.05, no brightness change) does not darken it.

Icons on the hover fill `#27220F`: lowest non-Terminal plate **3.11:1**; on the pressed fill `#27220F`: **3.11:1** (both pass; the hover and pressed fills were chosen dark enough for the mid-grey Calculator plate to stay at 3:1 or better).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` are opaque, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; over-white check n/a.


### 2.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Segoe UI', Arial, sans-serif` | 400 (base) | base | base | base |
| `#title` | `'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif` (`ariblk.ttf`, `seguibl.ttf`) | 900 | 11 px (base) | 1px | uppercase (markup) |
| `.tile-label` | `'Segoe UI', Arial, sans-serif` (`seguisb.ttf` at weight 600) | 600 (`--tile-label-weight`) | 12 px (base) | 0.3px | as typed (`none`) |
| `#theme-banner-text` | `'Segoe UI', Arial, sans-serif` | 600 | 11 px (base) | 0.5px | as written below (uppercase strings) |

Measured with the real font files (Pillow, 1:1 px): the title is 108 px wide, ending at x 120 (art starts x 168). Labels in Segoe UI Semibold 12 px with 0.3 px tracking: Notepad 48, Terminal 49, Calculator 56, Browser 44 px. The label box is 100 px and the hover pill adds 12 px of padding, so text up to 88 px shows in full; "Spreadsheet Editor" (104 px) ellipsizes at 88 px instead of 100 (a 12 px loss, accepted because the pill is the highlight). Expected `fontsRendered`: `Arial Black, Segoe UI Semibold, Segoe UI`. **Cyrillic:** no Cyrillic text in this theme; Segoe UI, Segoe UI Semibold and Arial Black all contain U+0416 (checked with negative controls), so Cyrillic tile names render in the intended faces.

### 2.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the four current SVGs (CRT television, grain, three snow tiles), the ghost readout, header text, edit-bar text, particles and the `#app` animation (0.3).

**A. Fog haze on `#app::after` (full window, above tiles).** Two soft gradients only, no grain, no scanlines, no vignette:
`background: radial-gradient(ellipse 90% 45% at 50% 105%, rgba(245,214,10,0.07), transparent 70%), radial-gradient(ellipse 70% 40% at 50% -5%, rgba(232,228,208,0.05), transparent 70%);`
Worst case behind a label: `#14110A` under the yellow haze at 0.07 is about `#241F0A`; the label `#E8E4D0` is still above 13:1 (add-on table shows 13.84 on the tile ground).

**B. Header: solid TV yellow with a hard black underline.** `--header-bg: #F5D60A`; `#header { box-shadow: 0 3px 0 #1A1A1A; }` (spills 3 px into the empty top band, y 40 to 43). `#header::before` (2 px left bar): `background:#1A1A1A; box-shadow:none;`.

**C. Header art (HZ), four hand-drawn stars, `#header::after`.** `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; background:url(svg) no-repeat 0 0 / 84px 20px; pointer-events:none;` Hidden with `#header:has(#filter-chip:not(.hidden))::after { display:none }`. SVG `viewBox="0 0 84 20"`, four `<polygon>` elements, each a 10-vertex five-point star with the vertices nudged by a fraction of a pixel so it looks hand-cut (do not re-derive them; use these points):
- Star 1, filled `#1A1A1A`: `9.3,4.2 10.9,8.8 16.2,8.6 12.4,11.1 14.9,15.5 10.1,14.0 7.1,17.1 7.1,12.0 3.9,10.1 7.9,8.6`
- Star 2, no fill, stroke `#1A1A1A` 1.2 px, `stroke-linejoin:round`: `31.1,2.4 31.1,5.9 34.7,6.8 31.5,7.7 32.1,11.0 29.4,9.1 26.8,10.3 27.8,7.0 26.3,4.9 29.1,5.0`
- Star 3 (largest), fill `#E0561A`, stroke `#1A1A1A` 1 px, `stroke-linejoin:round`: `52.9,3.6 53.7,9.7 60.2,10.6 54.8,12.8 56.7,18.6 51.4,15.8 47.1,18.6 48.2,12.5 45.0,9.3 50.0,8.7`
- Star 4, filled `#1A1A1A`: `72.0,2.9 73.5,6.2 77.5,5.7 74.9,7.8 77.1,11.1 73.3,10.3 71.3,12.9 70.9,8.9 68.3,7.8 71.3,6.3`
Bounding boxes: star 1 x 3.9 to 16.2, star 2 x 26.3 to 34.7, star 3 x 45.0 to 60.2 (y 3.6 to 18.6), star 4 x 68.3 to 77.5; none overlap and all sit inside the 84 x 20 box. Opacity 1. Decorative; the black-on-yellow and orange-on-yellow figures need no contrast target.

**D. Banner: solid yellow strip with a TV icon.**
- `#theme-banner { background:#F5D60A; border-top:3px solid #1A1A1A; }` (height stays 44; the border is inside it).
- **Icon, `#theme-banner::before`:** `content:''; width:22px; height:22px; font-size:0; opacity:1; background:url(svg) center / 22px 22px no-repeat;` SVG `viewBox="0 0 22 22"`, all strokes and fills `#1A1A1A`: antenna as two lines (8,3)-(11,6) and (14,3)-(11,6), stroke 1.6, round caps; body: rounded rectangle x 3, y 6, width 16, height 13, rx 3, no fill, stroke 1.8; screen: rounded rectangle x 6, y 9, width 8.5, height 7, rx 1.5, filled; two knobs: circles at (17,11) and (17,14.5), r 1, filled. (A generic TV, no game art.)
- **Banner strings** (`THEME_BANNERS['persona-4']`, replaces all five; the removed ones, "Midnight channel signal stable", "Fog advisory in effect", "The TV world awaits", are not quotes):
  1. `REACH OUT TO THE TRUTH.` (the game's tagline)
  2. `EVERY DAY'S GREAT AT YOUR JUNES!` (the store jingle)
  3. `I AM THOU, THOU ART I.` (the series' awakening line)
  Widths in Segoe UI Semibold 11 px, 0.5 px tracking: 152, 204, 135 px against 364 px: one line each.

**Safe zones:** the tile field is empty of art (fog haze only). Header art x 168 to 252 (title ends x 120; first button starts x 276). FZ-L, FZ-R and FZ-T carry nothing. The banner icon sits in the icon slot. No motif touches a tile, a label, the chip or a button.

### 2.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `p4-midnight 10s steps(1)` | `#title` colour, text-shadow, opacity (white flash at 88 percent) **(tier 2)** | removed |
| 2 | `banner-throb 3s` | `#theme-banner::before` transform, opacity **(tier 1)** | removed |
| 3 | `p4-tv 10s` | `#grid-container::before` opacity **(tier 1)** | removed with the panno |
| 4 | `p4-readout 10s` | `#grid-container::after` colour **(tier 2)** | removed |
| 5 | `p4-border 10s steps(1)` | `#app` box-shadow **(tier 5)** | removed |
| 6 | `p4-snow .08s steps(1)` | `#particles` background-position (3 layers, about 12 updates per second, full window) **(tier 4)** | removed |
| hover | `tile-flicker .5s steps(1,end) infinite` | `.app-tile:hover::before` opacity (infinite while hovered) **(tier 1)** | removed |

**Before 6 (plus 1 hover-only), after 0.** The costliest layer in the batch (full-window stepped scroll) is gone. Only the one-shot `entrance-fade 0.8s` remains.

### 2.5 Tiles, hover, selected, filter, banner

Rules to write (declarations final):
- **Tile at rest:** `.app-tile { background:#1C1810; border-color:#3E3716; border-radius:12px; }` and `.app-tile::before { display:none; }` (no sheen). 12 px radius is the TV-screen corner; `--radius` (buttons, inputs, chip) is 6 px. Border stays 1 px; layout unchanged.
- **Hover:** tile fill `#27220F`, border `#F5D60A`, no shadow, plus the label pill (below).
- **Label pill (the menu highlight):** `.tile-label { font-family:'Segoe UI',Arial,sans-serif; padding:0 6px; border-radius:3px; }` and `.app-tile:hover .tile-label, .app-tile:focus-visible .tile-label, .app-tile:hover .tile-label.renameable { background:#F5D60A; color:#1A1A1A; box-shadow:0 0 0 2px #F5D60A; }`. The third selector matters: the base rule `.tile-label.renameable:hover` turns the text `--accent-text` (yellow) in edit mode, which would be yellow on yellow. The 2 px spread stays inside the tile (label bottom about y 148 of a tile ending y 151). Text on pill: 12.02:1.
- **Selected (focus-visible):** the same fill, border and pill as hover, plus the base 2 px yellow outline at offset 2 (12.22:1 on the tile ground): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); }`.
- **Pressed:** base (`scale(0.96)` with `--tile-active-bg`).
- **Header controls on yellow:** `#header-controls button { color:#1A1A1A; border-color:#1A1A1A; }` and `#header-controls button:hover { background:#1A1A1A; color:#F5D60A; border-color:#1A1A1A; }`.
- **Header text on yellow:** `#title { font-family:'Arial Black','Segoe UI Black','Segoe UI',sans-serif; font-weight:900; letter-spacing:1px; color:#1A1A1A; text-shadow:none; }`, `#title .accent { color:#9A2F08; }` (the dot; 5.21:1), `#header-version { color:#3A3208; }` (8.85:1).
- **Filter chip:** `#filter-chip { background:#1A1A1A; border-color:#1A1A1A; }`; text and clear button keep `--accent-text` yellow (12.02:1 on black). Header art hides while it shows.
- **Banner text:** `#theme-banner-text { font-family:'Segoe UI',Arial,sans-serif; font-weight:600; letter-spacing:0.5px; color:#1A1A1A; }`.
- **Edit bar:** variables only (dark orange-brown fill, orange rule, orange label). No quote.
- **Settings overlay:** opaque `#14110A`, panel `#1C1810`, yellow values, yellow sliders and checkboxes (`--accent-c`), no glows.

### 2.6 Done when

1. The header is a solid yellow strip (sample `#F5D60A`), the title is near-black and reads clearly, the four stars sit at x 168 to 252, and no text runs under the buttons.
2. The banner is a solid yellow strip with a 3 px black top rule, a black TV icon at the left, and a one-line black quote (`scrollWidth <= clientWidth`).
3. No horizontal banding on any icon: in the Notepad plate, adjacent pixel rows differ by no more than 6 luminance levels (no scanline period).
4. Hover shot: the CALCULATOR tile has a yellow border, a `#27220F` fill and a yellow pill behind the dark word "Calculator"; no other element changes; no sheen, no flicker.
5. Typing a letter hides the stars and shows a black chip with yellow text; no overlap with the title or buttons.
6. `npm run check:contrast` passes, no rebaseline; `loopingAnimationsAtCapture` is 0 (was 6); `grep -c infinite` is 0 (also 0 in hover rules); no `\A` escapes remain.
7. Hidden-tiles shot: sigma at most the promise-mascot value (expected under 1.5: fog haze only).
8. `fontsRendered` lists Arial Black, Segoe UI Semibold and Segoe UI.
9. 640x420 and 1024x700 shots: header and banner stay yellow across the full width; stars do not scale.


---

## 3. gryffindor (GRYFFINDOR): DONE

**Audit:** score 2, redraw. The worst overlap in the Harry Potter set: a painted "heraldic codex" (virtue bars, a house-points roster, a lion burst) behind every tile, ghost text down the right, near-black with amber text and no scarlet or firelight.
**Direction:** a common room at night. Dark maroon ground with a static firelight glow low in the frame, faint tartan weave, a gilt double rule around the tile field, parchment italic labels, gold for accents, true house scarlet only as a fill (edit bar, banner). The banner becomes a swallow-tail pennant with a small sword icon. No lion, no crest, no roster, no text in the art.

### 3.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #1A0C0C;
  --panel-bg: #241010;
  --overlay-bg: #1A0C0C;
  --header-bg: #2A1210;
  --font: 'Palatino Linotype', Palatino, Georgia, serif;
  --text: #EEE1C6;
  --text-dim: #C9B48E;
  --accent-c: #D3A625;
  --accent-m: #F0656A;
  --accent-y: #E6C36A;
  --accent-text: #D3A625;
  --border: #4A2C1C;
  --border-h: #D3A625;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 2px #D3A625;
  --title-anim: none;
  --tile-hover-bg: #3A1614;
  --tile-hover-border: #D3A625;
  --tile-hover-shadow: inset 0 0 0 1px #8A6A1E;
  --tile-active-bg: #461815;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: sepia(0.12) saturate(1.1);
  --tile-icon-shape: polygon(0 0, 100% 0, 100% 70%, 84% 88%, 50% 100%, 16% 88%, 0 70%);
  --tile-label-spacing: 0.3px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: italic;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #3A1614;
  --btn-active-bg: #461815;
  --drop-hint-border: #6A4A26;
  --drop-icon-color: #A8905C;
  --hint-sub-color: #C2AC86;
  --rename-dashed: #D3A625;
  --rename-input-bg: #3A1614;
  --edit-bar-bg: #740001;
  --edit-bar-border: #D3A625;
  --edit-label-color: #E6C36A;
  --edit-label-glow: none;
  --btn-done-color: #E6C36A;
  --btn-done-border: #D3A625;
  --btn-done-hover-bg: #8C0A0C;
  --btn-done-hover-glow: none;
  --btn-add-border: #B8901F;
  --update-bg: #2A2010;
  --update-border: #E6C36A;
  --update-color: #E6C36A;
  --update-btn-border: #E6C36A;
  --update-btn-hover-bg: #43331A;
  --update-btn-hover-glow: none;
  --btn-close-color: #E6C36A;
  --btn-close-border: #B8901F;
  --btn-close-hover-bg: #3A1614;
  --btn-close-hover-glow: none;
  --picker-search-bg: #3A1614;
  --picker-item-hover-bg: #3A1614;
  --picker-item-active-bg: #461815;
  --picker-placeholder-bg: #3A1614;
  --skin-btn-active-bg: #461815;
  --remove-btn-bg: #8C0A0C;
  --remove-btn-border: #D3A625;
}
```
Notes: `--glow-*` are `none` (no neon halos on a heraldic theme). `--edit-bar-bg` is the true house scarlet `#740001` because it is a fill, not text; text on it is gold or parchment (7.10:1 and 9.31:1). Scarlet is never used as text or as a thin line on the dark ground (it would be 1.5:1).

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#EEE1C6` on `#1A0C0C` | 4.5:1 | **14.72:1** |
| --text-dim on --bg | `#C9B48E` on `#1A0C0C` | 4.5:1 | **9.44:1** |
| --accent-c on --bg | `#D3A625` on `#1A0C0C` | 3:1 | **8.40:1** |
| --accent-text on --bg | `#D3A625` on `#1A0C0C` | 3:1 | **8.40:1** |
| --hint-sub-color on --bg | `#C2AC86` on `#1A0C0C` | 4.5:1 | **8.66:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#EEE1C6` on `#221010` | 4.5:1 | **14.11:1** |
| Tile label on worst-case rest ground (firelight 0.20 + tartan red 0.08 + gold 0.08) | `#EEE1C6` on `#572A14` | 4.5:1 | **9.29:1** |
| Tile label on tile hover fill | `#EEE1C6` on `#3A1614` | 4.5:1 | **12.43:1** |
| Tile label on tile pressed | `#EEE1C6` on `#461815` | 4.5:1 | **11.57:1** |
| Title (accent-text) on header | `#D3A625` on `#2A1210` | 4.5:1 | **7.76:1** |
| Title dot (accent-m) on header | `#F0656A` on `#2A1210` | 4.5:1 | **5.68:1** |
| Header version (text-dim) on header | `#C9B48E` on `#2A1210` | 4.5:1 | **8.72:1** |
| Header button glyph (text) on header | `#EEE1C6` on `#2A1210` | 4.5:1 | **13.60:1** |
| Header button glyph on button hover | `#EEE1C6` on `#3A1614` | 4.5:1 | **12.43:1** |
| Filter chip text on chip fill (#3A1614 over header) | `#D3A625` on `#3A1614` | 4.5:1 | **7.09:1** |
| Banner text on scarlet pennant | `#EEE1C6` on `#740001` | 4.5:1 | **9.31:1** |
| Edit label on edit bar | `#E6C36A` on `#740001` | 4.5:1 | **7.10:1** |
| Done / close text on edit bar | `#E6C36A` on `#740001` | 4.5:1 | **7.10:1** |
| + FILE / + INSTALLED text on edit bar | `#EEE1C6` on `#740001` | 4.5:1 | **9.31:1** |
| Done text on its hover fill | `#E6C36A` on `#8C0A0C` | 4.5:1 | **5.72:1** |
| Settings text on overlay | `#EEE1C6` on `#1A0C0C` | 4.5:1 | **14.72:1** |
| Settings text on panel | `#EEE1C6` on `#241010` | 4.5:1 | **14.02:1** |
| Settings label (text-dim) on panel | `#C9B48E` on `#241010` | 4.5:1 | **8.99:1** |
| Settings value / cheat key (accent-text) on panel | `#D3A625` on `#241010` | 4.5:1 | **8.00:1** |
| Settings CLOSE text on panel | `#E6C36A` on `#241010` | 4.5:1 | **10.70:1** |
| Hotkey error text (accent-m) on panel | `#F0656A` on `#241010` | 4.5:1 | **5.86:1** |
| Hotkey input text on input fill | `#D3A625` on `#3A1614` | 4.5:1 | **7.09:1** |
| Picker row text on hover fill | `#EEE1C6` on `#3A1614` | 4.5:1 | **12.43:1** |
| Update banner text on update bar | `#E6C36A` on `#2A2010` | 4.5:1 | **9.43:1** |
| Update button text on hover fill | `#E6C36A` on `#43331A` | 4.5:1 | **7.17:1** |
| Drop-hint text (text-dim) on grid ground | `#C9B48E` on `#1A0C0C` | 4.5:1 | **9.44:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#8C0A0C` | 3.0:1 | **9.71:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#D3A625` on `#221010` | 3.0:1 | **8.05:1** |
| Focus ring on grid ground (non-text) | `#D3A625` on `#1A0C0C` | 3.0:1 | **8.40:1** |
| Hover border on grid ground (non-text) | `#D3A625` on `#1A0C0C` | 3.0:1 | **8.40:1** |
| Hover border on hover fill (non-text) | `#D3A625` on `#3A1614` | 3.0:1 | **7.09:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#D3A625` on `#3A1614` | 4.5:1 | **7.09:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#D3A625` on `#461815` | 4.5:1 | **6.60:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#D3A625` on `#3A1614` | 4.5:1 | **7.09:1** |
| Picker / skin search input text (accent-text) on search fill | `#D3A625` on `#3A1614` | 4.5:1 | **7.09:1** |
| Rename / hotkey input text (accent-text) on input fill | `#D3A625` on `#3A1614` | 4.5:1 | **7.09:1** |
| Search placeholder (text-dim) on search fill | `#C9B48E` on `#3A1614` | 4.5:1 | **7.97:1** |
| Hotkey recording text (accent-m) on input fill | `#F0656A` on `#3A1614` | 4.5:1 | **5.19:1** |
| Update dismiss glyph (text-dim) on update bar | `#C9B48E` on `#2A2010` | 4.5:1 | **7.93:1** |

**Lowest ratio in this theme: 5.19:1 (Hotkey recording text (accent-m) on input fill).** Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, tile ground `#221010`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6181A3` | `#221010` | 4.50:1 | pass |
| Calculator `#6b6f76` | `#707274` | `#221010` | 3.78:1 | pass |
| Paint `#b07a4f` | `#B47D4F` | `#221010` | 5.21:1 | pass |
| Terminal `#3d4450` | `#41464F` | `#221010` | 1.93:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#558C89` | `#221010` | 4.78:1 | pass |
| Files `#c09a3e` | `#C69D3F` | `#221010` | 7.22:1 | pass |

Lowest non-Terminal icon ratio: **3.78:1** (pass). Terminal is 1.93:1 on this ground (mock art); the fx (sepia 0.12, saturate 1.1, no brightness change) does not darken it.

Icons on the hover fill `#3A1614`: lowest non-Terminal plate **3.33:1**; on the pressed fill `#461815`: **3.10:1** (both pass; the hover and pressed fills were chosen dark enough for the mid-grey Calculator plate to stay at 3:1 or better).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` are opaque, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; over-white check n/a.


### 3.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Palatino Linotype', Palatino, Georgia, serif` (`pala.ttf`, `palai.ttf`, `palab.ttf`) | 400 (base) | base | base | base |
| `#title` | same stack | 700, roman (not italic) | 11 px (base) | 4px | uppercase (markup), gilt capitals |
| `.tile-label` | same stack | 400, italic (`--tile-label-style`) | 12 px (base) | 0.3px | as typed (`none`) |
| `#theme-banner-text` | same stack | 400, italic | **12 px** (set `font-size:12px` on `#theme-banner-text`) | 0.3px | sentence case, as written below |

Measured with the real font files: the title is 140 px wide, ending at x 152 (art starts x 168: 16 px clear, above the 12 px minimum). Labels in Palatino Italic 12 px: Notepad 42, Terminal 46, Calculator 53, Browser 43 px. Banner strings at 12 px italic, 0.3 px tracking: 161, 283, 316 px against the text box of **338 px** (424 - 14 left padding - 22 icon - 10 gap - 40 right padding). Expected `fontsRendered`: `Palatino Linotype` (regular, italic and bold faces). **Cyrillic:** no Cyrillic text in this theme; Palatino Linotype contains U+0416 (checked with negative controls), so Cyrillic tile names keep the serif.

### 3.3 Art (redraw). Static, original, no text, no crest, no lion

Delete: the four current SVGs (codex panno, grain, embers x2), the ghost readout, header text, edit-bar text, particles and the `#app` animation (0.3).

**A. Firelight and tartan on `#app::after` (full window, above tiles).** Two parts, no grain, no scanlines, no vignette. Top layer first:
1. Firelight (static): `radial-gradient(ellipse 85% 55% at 50% 108%, rgba(196,84,20,0.20), rgba(196,84,20,0.06) 55%, transparent 75%)`.
2. Tartan weave (static; four layers, each alpha at most 0.04): `repeating-linear-gradient(0deg, rgba(196,40,42,0.04) 0 8px, transparent 8px 28px)`, `repeating-linear-gradient(90deg, rgba(196,40,42,0.04) 0 8px, transparent 8px 28px)`, `repeating-linear-gradient(0deg, rgba(211,166,37,0.04) 0 1px, transparent 1px 14px)`, `repeating-linear-gradient(90deg, rgba(211,166,37,0.04) 0 1px, transparent 1px 14px)`.
**Label check on the worst pixel.** Tile rest ground `#221010`, firelight 0.20, tartan red 0.08 (crossing), gold 0.08 (crossing) composes to `#572A14`; the label `#EEE1C6` reaches **9.29:1** on it (add-on table).

**B. Gilt double rule around the tile field, `#grid-container` background (six 1 px rectangles; does not scroll).** P is the container's padding-box right edge (window width minus the 4 px scrollbar, which is the normal case: 420 at 424 wide). Container-relative coordinates; Hc is the container height. Outer rule `#B8901F`, inner rule `#8A6A1E` (dimmer, so the pair reads as gilt):
```
linear-gradient(#B8901F,#B8901F) left 4px  top 4px / calc(100% - 8px)  1px no-repeat,   /* outer top:   x 4 to P-4,  y 4 */
linear-gradient(#B8901F,#B8901F) left 4px  top 4px / 1px calc(100% - 4px) no-repeat,    /* outer left:  x 4,  y 4 to Hc */
linear-gradient(#B8901F,#B8901F) right 4px top 4px / 1px calc(100% - 4px) no-repeat,    /* outer right: x P-5 to P-4 */
linear-gradient(#8A6A1E,#8A6A1E) left 7px  top 7px / calc(100% - 14px) 1px no-repeat,   /* inner top:   x 7 to P-7,  y 7 */
linear-gradient(#8A6A1E,#8A6A1E) left 7px  top 7px / 1px calc(100% - 7px) no-repeat,    /* inner left:  x 7,  y 7 to Hc */
linear-gradient(#8A6A1E,#8A6A1E) right 7px top 7px / 1px calc(100% - 7px) no-repeat     /* inner right: x P-8 to P-7 */
```
Window coordinates at 424x300 (scrollbar present, P = 420): outer top rule at y 44, inner top rule at y 47; left rules at x 4 and 7; right rules at x 412 to 413 (inner) and 415 to 416 (outer). The rules stop at the container bottom; the pennant banner closes the frame. Clearances: inner left rule x 7 to 8 versus keep-out edge x 12 (4 px); inner right rule x 412 versus keep-out edge x 408 (4 px); top rules y 44 and 47 versus keep-out y 52 (5 px), and 3 px to 6 px below the header line. Verify the rules' pixel positions in the after shot; if the right rules sit 4 px further right than listed, the scrollbar is not excluded from the padding box, so subtract 4 from the two `right` offsets' base (no design effect).

**C. Header art (HZ), a gilt ornament, `#header::after`.** `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; background:url(svg) no-repeat 0 0 / 84px 20px; pointer-events:none;` Hidden with `#header:has(#filter-chip:not(.hidden))::after { display:none }`. SVG `viewBox="0 0 84 20"`: two 1 px lines, (4,10)-(34,10) and (50,10)-(80,10), stroke `#B8901F`; end dots: circles (2.5,10) and (81.5,10), r 1.2, fill `#B8901F`; centre diamond polygon (42,3.5) (48,10) (42,16.5) (36,10), fill `#D3A625`; inner diamond polygon (42,7) (45,10) (42,13) (39,10), fill `#740001`. Opacity 1. Also: `#header { box-shadow: 0 1px 0 #B8901F; }` (a gilt hairline just under the header, y 40 to 41) and `#header::before { background:#C8202C; box-shadow:none; }` (the scarlet tick; it is a 2 px bar so a brighter scarlet than the fill colour is used, 2.6:1 on the header, decorative).

**D. Banner: scarlet swallow-tail pennant with a sword icon.**
- `#theme-banner { background: linear-gradient(#B8901F,#B8901F) top / 100% 1px no-repeat, linear-gradient(#B8901F,#B8901F) bottom / 100% 1px no-repeat, #740001; border-top:0; padding-right:40px; z-index:250; clip-path: polygon(0 0, 100% 0, calc(100% - 22px) 50%, 100% 100%, 0 100%); }`. The clip is static (not animated), so it costs nothing after the first paint. The z-index keeps the firelight and tartan off the pennant. The notch tip is at (W-22, 22); the text box ends at W-40, so at least 18 px clear at mid-height and 24 px at the text's top line.
- **Icon, `#theme-banner::before`:** `content:''; width:22px; height:22px; font-size:0; opacity:1; background:url(svg) center / 22px 22px no-repeat;` SVG `viewBox="0 0 22 22"`, an upright sword (original, generic): blade polygon (11,1) (13,3) (13,14) (9,14) (9,3), fill `#E2DCCB`; crossguard rectangle x 4 to 18, y 14 to 16.5, fill `#D3A625`; two rubies, circles (4.8,15.2) and (17.2,15.2), r 1.3, fill `#E0343C`; grip rectangle x 10 to 12, y 16.5 to 19.5, fill `#D3A625`; pommel circle (11,20.6), r 1.4, fill `#E0343C`.
- **Banner strings** (`THEME_BANNERS['gryffindor']`, replaces all five; the two Dumbledore lines and the Mandela-style line are removed because they were paraphrases or not from the books; sentence case in Palatino italic):
  1. `Where dwell the brave at heart.` (Sorting Hat song)
  2. `Their daring, nerve and chivalry set Gryffindors apart.` (Sorting Hat song)
  3. `Help will always be given at Hogwarts to those who ask for it.` (Dumbledore, Chamber of Secrets)
  Widths (12 px italic): 161, 283, 316 px in a 338 px box: one line each; longest keeps 22 px spare.

**Safe zones:** tile field empty of art (firelight and tartan only). Frame rules occupy FZ-L, FZ-R and FZ-T at least 4 px outside the keep-out. Header art x 168 to 252. No motif touches a tile, label, chip or button.

### 3.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `gryff-title 12s` | `#title` colour, text-shadow, opacity (white-gold flash at 88 percent) **(tier 2)** | removed |
| 2 | `banner-glow 4s` | `#theme-banner::before` text-shadow, opacity **(tier 2)** | removed |
| 3 | `gryff-schematic 12s` | `#grid-container::before` opacity **(tier 1)** | removed with the codex |
| 4 | `gryff-readout 12s` | `#grid-container::after` colour **(tier 2)** | removed |
| 5 | `gryff-pulse 12s` | `#app` box-shadow **(tier 5)** | removed |
| 6 | `gryff-embers .25s steps(1,end)` | `#particles` background-position (2 layers, full window) **(tier 4)** | removed |
| hover | `tile-flicker .4s` one-shot | `.app-tile:hover::before` **(tier 1)** | removed (no sheen) |

**Before 6, after 0.** Calm franchise, zero motion. One-shot `entrance-fade 0.8s` only.

### 3.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `.app-tile { background:#221010; border-color:#3A2418; }` and `.app-tile::before { display:none; }`. 2 px radius (`--radius`), 1 px border, layout unchanged.
- **Icon plate (heater shield, keeps the glyph):** `--tile-icon-shape: polygon(0 0, 100% 0, 100% 70%, 84% 88%, 50% 100%, 16% 88%, 0 70%)`. The old shape cut into the glyphs. Measured on the mock glyph geometry (px margin between each glyph's extreme point and the clip edge, inside a 64 px plate): new shape Notepad 6.7, Calculator 4.4, Paint 10.4, Terminal 4.0, Browser 10.8, Files 6.1 (all positive, smallest 4.0 px); the old shape gave Notepad 1.6, Calculator -0.6, Terminal -1.8, Files 0.4 (negative means the glyph was cropped).
- **Hover:** fill `#3A1614`, gold border `#D3A625`, inner gilt hairline `inset 0 0 0 1px #8A6A1E` (a double gilt edge). No transform.
- **Selected (focus-visible):** the same as hover plus the base 2 px gold outline at offset 2 (8.05:1 on the tile ground): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `--tile-active-bg` `#461815`.
- **Label:** `.tile-label { font-family:'Palatino Linotype',Palatino,Georgia,serif; }` parchment `#EEE1C6`, italic; no halo.
- **Title and banner text:** `#title { font-family:'Palatino Linotype',Palatino,Georgia,serif; font-weight:700; font-style:normal; letter-spacing:4px; text-shadow:none; }` (gold `--accent-text` on `#2A1210`, 7.76:1; the dot is `--accent-m` light red) and `#theme-banner-text { font-family:'Palatino Linotype',Palatino,Georgia,serif; font-style:italic; font-size:12px; letter-spacing:0.3px; color:#EEE1C6; }` (parchment on the scarlet pennant, 9.31:1).
- **Filter chip:** no override; the base rule fills it with `--tile-hover-bg` `#3A1614`, gold border, gold text (7.09:1). Header art hides while it shows.
- **Edit bar:** solid scarlet `#740001`, gold rule, gold label, parchment button text. No quote.
- **Settings overlay:** opaque `#1A0C0C`; panel `#241010`; gold values; gold sliders and checkboxes.

### 3.6 Done when

1. Grid shot: no painted text anywhere; a thin gold double rule frames the tiles on the left, top and right; the tiles sit clear of it; a warm glow is visible low in the frame; the tartan is barely visible.
2. Every icon plate shows its full glyph (no cropped Notepad or Calculator corners) inside a shield silhouette.
3. Banner: scarlet strip with gold hems, a sword icon at the left, a swallow-tail notch at the right end, and a one-line parchment italic quote (`scrollWidth <= clientWidth`); the notch never touches the text.
4. Header: gold title, the gilt ornament at x 168 to 252, a 1 px gilt line under the header; typing a letter hides the ornament and shows the chip.
5. Hover shot: CALCULATOR tile shows a gold border with a dimmer inner line and a warm-maroon fill; nothing else moves.
6. `npm run check:contrast` passes, no rebaseline; `loopingAnimationsAtCapture` 0 (was 6); `grep -c infinite` 0; no `\A` escapes.
7. Hidden-tiles shot: sigma at most the promise-mascot value (expected 2 to 3; the tartan is the only texture).
8. `fontsRendered` lists Palatino Linotype (regular, italic, bold).
9. 640x420 and 1024x700: the rules follow the container edges (not scaled), the pennant notch stays 22 px deep.


---

## 4. 2001 (2001: A SPACE ODYSSEY): DONE

**Audit:** score 2, redraw. The film is bright sterile white with coloured console buttons; the old theme is near-black navy with glowing red HAL rings, streaks and a stargate strobe.
**Direction:** go light. A near-white console: off-white ground, pale-grey panels, near-black type in a light, widely spaced sans, cool console blue for focus and hover with a small amber lamp strip, HAL red only for the edit bar and one small eye in the banner. One thin perspective line pair leading to a tiny black monolith in the header. Nothing else. Zero clutter, zero motion.

### 4.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 6px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #F4F4F2;
  --panel-bg: #FBFBFA;
  --overlay-bg: #F4F4F2;
  --header-bg: #E8E8E4;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #2A2A2E;
  --text-dim: #5A5A62;
  --accent-c: #2A5AA0;
  --accent-m: #C41414;
  --accent-y: #E8A020;
  --accent-text: #2A5AA0;
  --border: #B8B8B4;
  --border-h: #2A5AA0;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 2px #2A5AA0;
  --title-anim: none;
  --tile-hover-bg: #EBF1FB;
  --tile-hover-border: #2A5AA0;
  --tile-hover-shadow: inset 0 3px 0 #E8A020;
  --tile-active-bg: #E6ECF6;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.7) brightness(0.85);
  --tile-icon-shape: none;
  --tile-label-spacing: 1.5px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 350;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 1.2s ease-out forwards;
  --btn-hover-bg: #EBF1FB;
  --btn-active-bg: #E6ECF6;
  --drop-hint-border: #B8B8B4;
  --drop-icon-color: #8A8A90;
  --hint-sub-color: #5A5A62;
  --rename-dashed: #2A5AA0;
  --rename-input-bg: #EBF1FB;
  --edit-bar-bg: #F6E0E0;
  --edit-bar-border: #C41414;
  --edit-label-color: #A81010;
  --edit-label-glow: none;
  --btn-done-color: #A81010;
  --btn-done-border: #C41414;
  --btn-done-hover-bg: #EFC8C8;
  --btn-done-hover-glow: none;
  --btn-add-border: #8A8A90;
  --update-bg: #FBEFD3;
  --update-border: #E8A020;
  --update-color: #7A4A00;
  --update-btn-border: #B87400;
  --update-btn-hover-bg: #F4DFAA;
  --update-btn-hover-glow: none;
  --btn-close-color: #A81010;
  --btn-close-border: #C41414;
  --btn-close-hover-bg: #F6E0E0;
  --btn-close-hover-glow: none;
  --picker-search-bg: #EBF1FB;
  --picker-item-hover-bg: #EBF1FB;
  --picker-item-active-bg: #E6ECF6;
  --picker-placeholder-bg: #EBF1FB;
  --skin-btn-active-bg: #E6ECF6;
  --remove-btn-bg: #C41414;
  --remove-btn-border: #A81010;
}
```
Notes: this is the batch's light theme and the white-ground test from audit C3. `--glow-*` are `none`. Base `button:hover`, `.update-btn:hover` and `#filter-chip-clear:hover` set `color:#fff`, which is white on a light fill here; the theme overrides all three (4.5). `--accent-c` and `--accent-text` are the console blue, not orange, because console orange `#E8A020` is only 2.0:1 on this ground; orange is used only as a non-text lamp strip. HAL red is used dark (`#C41414`, `#A81010`) for text and true `#E01818` only in the banner icon.

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#2A2A2E` on `#F4F4F2` | 4.5:1 | **12.98:1** |
| --text-dim on --bg | `#5A5A62` on `#F4F4F2` | 4.5:1 | **6.20:1** |
| --accent-c on --bg | `#2A5AA0` on `#F4F4F2` | 3:1 | **6.21:1** |
| --accent-text on --bg | `#2A5AA0` on `#F4F4F2` | 3:1 | **6.21:1** |
| --hint-sub-color on --bg | `#5A5A62` on `#F4F4F2` | 4.5:1 | **6.20:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#2A2A2E` on `#FBFBFA` | 4.5:1 | **13.81:1** |
| Tile label on tile hover fill | `#2A2A2E` on `#EBF1FB` | 4.5:1 | **12.60:1** |
| Tile label on tile pressed | `#2A2A2E` on `#E6ECF6` | 4.5:1 | **12.04:1** |
| Title (accent-text) on header | `#2A5AA0` on `#E8E8E4` | 4.5:1 | **5.57:1** |
| Title dot (accent-m) on header | `#C41414` on `#E8E8E4` | 4.5:1 | **4.94:1** |
| Header version (text-dim) on header | `#5A5A62` on `#E8E8E4` | 4.5:1 | **5.56:1** |
| Header button glyph (text) on header | `#2A2A2E` on `#E8E8E4` | 4.5:1 | **11.64:1** |
| Header button glyph on button hover fill | `#2A2A2E` on `#EBF1FB` | 4.5:1 | **12.60:1** |
| Filter chip text on chip fill (#EBF1FB) | `#2A5AA0` on `#EBF1FB` | 4.5:1 | **6.03:1** |
| Banner text on banner (panel-bg) | `#2A2A2E` on `#FBFBFA` | 4.5:1 | **13.81:1** |
| Edit label on edit bar | `#A81010` on `#F6E0E0` | 4.5:1 | **6.06:1** |
| Done / close text on edit bar | `#A81010` on `#F6E0E0` | 4.5:1 | **6.06:1** |
| + FILE / + INSTALLED text on edit bar | `#2A2A2E` on `#F6E0E0` | 4.5:1 | **11.34:1** |
| Done text on its hover fill | `#A81010` on `#EFC8C8` | 4.5:1 | **5.01:1** |
| Settings text on overlay | `#2A2A2E` on `#F4F4F2` | 4.5:1 | **12.98:1** |
| Settings text on panel | `#2A2A2E` on `#FBFBFA` | 4.5:1 | **13.81:1** |
| Settings label (text-dim) on panel | `#5A5A62` on `#FBFBFA` | 4.5:1 | **6.60:1** |
| Settings value / cheat key (accent-text) on panel | `#2A5AA0` on `#FBFBFA` | 4.5:1 | **6.61:1** |
| Settings CLOSE text on panel | `#A81010` on `#FBFBFA` | 4.5:1 | **7.38:1** |
| Hotkey error text (accent-m) on panel | `#C41414` on `#FBFBFA` | 4.5:1 | **5.87:1** |
| Hotkey input text on input fill | `#2A5AA0` on `#EBF1FB` | 4.5:1 | **6.03:1** |
| Picker row text on hover fill | `#2A2A2E` on `#EBF1FB` | 4.5:1 | **12.60:1** |
| Update banner text on update bar | `#7A4A00` on `#FBEFD3` | 4.5:1 | **6.55:1** |
| Update button text on hover fill | `#7A4A00` on `#F4DFAA` | 4.5:1 | **5.69:1** |
| Drop-hint text (text-dim) on grid ground | `#5A5A62` on `#F4F4F2` | 4.5:1 | **6.20:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#C41414` | 3.0:1 | **6.07:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#2A5AA0` on `#FBFBFA` | 3.0:1 | **6.61:1** |
| Focus ring on grid ground (non-text) | `#2A5AA0` on `#F4F4F2` | 3.0:1 | **6.21:1** |
| Hover border on grid ground (non-text) | `#2A5AA0` on `#F4F4F2` | 3.0:1 | **6.21:1** |
| Hover border on hover fill (non-text) | `#2A5AA0` on `#EBF1FB` | 3.0:1 | **6.03:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#2A5AA0` on `#EBF1FB` | 4.5:1 | **6.03:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#2A5AA0` on `#E6ECF6` | 4.5:1 | **5.77:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#2A5AA0` on `#EBF1FB` | 4.5:1 | **6.03:1** |
| Picker / skin search input text (accent-text) on search fill | `#2A5AA0` on `#EBF1FB` | 4.5:1 | **6.03:1** |
| Rename / hotkey input text (accent-text) on input fill | `#2A5AA0` on `#EBF1FB` | 4.5:1 | **6.03:1** |
| Search placeholder (text-dim) on search fill | `#5A5A62` on `#EBF1FB` | 4.5:1 | **6.02:1** |
| Hotkey recording text (accent-m) on input fill | `#C41414` on `#EBF1FB` | 4.5:1 | **5.35:1** |
| Update dismiss glyph (text-dim) on update bar | `#5A5A62` on `#FBEFD3` | 4.5:1 | **5.98:1** |

**Lowest ratio in this theme: 4.94:1 (Title dot (accent-m) on header).** Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, tile ground `#FBFBFA`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#556B82` | `#FBFBFA` | 5.32:1 | pass |
| Calculator `#6b6f76` | `#5C5E63` | `#FBFBFA` | 6.27:1 | pass |
| Paint `#b07a4f` | `#8A6A50` | `#FBFBFA` | 4.76:1 | pass |
| Terminal `#3d4450` | `#363A41` | `#FBFBFA` | 11.03:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#4F7273` | `#FBFBFA` | 5.09:1 | pass |
| Files `#c09a3e` | `#9A834C` | `#FBFBFA` | 3.54:1 | pass |

Lowest non-Terminal icon ratio: **3.54:1** (pass). All six plates, Terminal included, clear 3:1 on the light ground because the fx (saturate 0.7, brightness 0.85) darkens the pale plates: Files is the limit at 3.54:1 (it is 2.56:1 without the brightness step).

Icons on the hover fill `#EBF1FB`: lowest non-Terminal plate **3.23:1**; on the pressed fill `#E6ECF6`: **3.09:1** (both pass; the hover and pressed fills were chosen dark enough for the mid-grey Calculator plate to stay at 3:1 or better).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` are opaque, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; over-white check n/a.


### 4.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Segoe UI', Arial, sans-serif` | 400 (base) | base | base | base |
| `#title` | `'Segoe UI Semilight', 'Segoe UI', sans-serif` (`segoeuisl.ttf`) | 350 | 11 px (base) | 5px | uppercase (markup) |
| `.tile-label` | `'Segoe UI Semilight', 'Segoe UI', sans-serif` | 350 (`--tile-label-weight`) | 12 px (base) | 1.5px (`--tile-label-spacing`) | uppercase (`--tile-label-transform`) |
| `#theme-banner-text` | `'Segoe UI Semilight', 'Segoe UI', sans-serif` | 350 | 11 px (base) | 0.5px | sentence case, as written below |

Refinement of the audit: it said Segoe UI Light. Light (300) at 11 to 12 px on a light ground is hairline-thin; **Semilight (350) keeps the airy look and stays readable.** Weight 350 is set together with the Semilight family, so if the family name does not match, `'Segoe UI'` at 350 still resolves to the Semilight face. Measured with the real font files: the title is 135 px wide (ends x 147, art starts x 168: 21 px clear). Labels (uppercase, 1.5 px tracking): CALCULATOR 87, TERMINAL 67, NOTEPAD 63.5, BROWSER 63.5 px, all within the 100 px label box. Expected `fontsRendered`: `Segoe UI Semilight, Segoe UI`. **Cyrillic:** no Cyrillic text in this theme; Segoe UI and Semilight contain U+0416 (checked with negative controls).

### 4.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the HAL iris rings, streaks, floor-line gradient, the stargate stripes (`#particles`), the ghost readout, header text, edit-bar text, the `#app` box-shadow animation (0.3). No `#app::after` background is needed: `#app::after { background: none; }`. The theme has **no texture at all** (expected sigma about 0), so it is the batch's floor reference.

**A. Header art (HZ), perspective and monolith, `#header::after`.** `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; background:url(svg) no-repeat 0 0 / 84px 20px; pointer-events:none;` Hidden with `#header:has(#filter-chip:not(.hidden))::after { display:none }`. SVG `viewBox="0 0 84 20"`, no background:
- Perspective pair: two 1 px lines, (2,2) to (66,10) and (2,18) to (66,10), stroke `#8A8A90`, round caps, no fill. They converge on the middle of the slab's left edge.
- Monolith, proportions 1:4:9 (thickness : width : height): front face rectangle x 66 to 74, y 1 to 19 (8 x 18, which is 4:9), fill `#111114`; side face polygon (74,1) (76,2.5) (76,17.5) (74,19), fill `#3A3A40` (thickness 2, which is 1:4 against the 8 px width).
- Opacity 1. Generic shapes; the monolith is a plain black slab.

**B. Header treatment.** `--header-bg: #E8E8E4` (flat); `#header::before` (2 px left bar) `background:#2A5AA0; box-shadow:none`; the base 1 px bottom border uses `--border` `#B8B8B4`.

**C. Banner: HAL eye icon.** `#theme-banner` keeps the base `--panel-bg` (`#FBFBFA`) fill and `border-top:1px solid var(--border)`. **Icon, `#theme-banner::before`:** `content:''; width:22px; height:22px; font-size:0; opacity:1; background:url(svg) center / 22px 22px no-repeat;` SVG `viewBox="0 0 22 22"`: circle (11,11) r 10.5 fill `#1C1C20`; circle (11,11) r 8.5 fill `#E01818`; circle (11,11) r 5 fill `#C81010`; circle (11,11) r 2.2 fill `#F2C230` (the yellow dot). A red circle with a yellow dot is HAL's eye described in the film reference; nothing else of the set is drawn.
- **Banner strings** (`THEME_BANNERS['2001']`, sentence case in Segoe UI Semilight 11 px, 0.5 px tracking; all five are real HAL lines and all fit, so all five stay; the audit's uppercase is dropped so they fit on one line):
  1. `I'm sorry, Dave. I'm afraid I can't do that.` (213 px)
  2. `Open the pod bay doors, HAL.` (156 px)
  3. `Daisy, Daisy, give me your answer do.` (194 px)
  4. `The 9000 series is the most reliable computer ever made.` (298 px)
  5. `This mission is too important for me to allow you to jeopardize it.` (336 px)
  Text box is 364 px (424 - 28 padding - 22 icon - 10 gap): the longest keeps 28 px spare (Pillow widths, about 3 percent kerning tolerance).

**Safe zones:** tile field empty. Header art x 168 to 252 (title ends x 147; first button x 276). FZ-L, FZ-R, FZ-T carry nothing. The eye sits in the icon slot.

### 4.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `hal-watch 10s` | `#title` text-shadow, colour (red flash) **(tier 2)** | removed |
| 2 | `banner-pulse 6s` | `#theme-banner::before` opacity **(tier 1)** | removed |
| 3 | `hal-eye-pulse 8s` | `#grid-container::before` opacity (incl. strobe) **(tier 1)** | removed with the rings |
| 4 | `hal-readout 10s` | `#grid-container::after` colour **(tier 2)** | removed |
| 5 | `hal-watch-border 12s` | `#app` box-shadow **(tier 5)** | removed |
| 6 | `hal-stargate 6s linear` | `#particles` background-position (2 layers, full window) **(tier 4)** | removed |
| hover | `tile-radial .6s` one-shot | `.app-tile:hover::before` **(tier 1)** | removed (no sheen) |

**Before 6, after 0.** A film about stillness. `entrance-fade 1.2s` one-shot only (`entrance-zoom` and its blur are retired).

### 4.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `.app-tile { background:#FBFBFA; border-color:#D4D4D0; }` and `.app-tile::before { display:none; }`. 6 px radius (`--radius`), 1 px border, layout unchanged. `--tile-icon-shape: none` (the plate is already a rounded square).
- **Hover:** fill `#EBF1FB`, border `#2A5AA0`, and an amber lamp strip along the tile's top inside edge (`--tile-hover-shadow: inset 0 3px 0 #E8A020`, decorative; the blue border already carries the state at 6.03:1).
- **Selected (focus-visible):** the same as hover plus the base 2 px blue outline at offset 2 (6.61:1): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#E6ECF6`.
- **Label:** `.tile-label { font-family:'Segoe UI Semilight','Segoe UI',sans-serif; }` near-black `#2A2A2E`. **No halo** (`--tile-label-shadow: none`); the old black halo would smear on a light ground.
- **Title and banner text:** `#title { font-family:'Segoe UI Semilight','Segoe UI',sans-serif; font-weight:350; letter-spacing:5px; text-shadow:none; }` (blue `--accent-text` on `#E8E8E4`, 5.57:1; the dot is `--accent-m` HAL red, 4.94:1) and `#theme-banner-text { font-family:'Segoe UI Semilight','Segoe UI',sans-serif; font-weight:350; letter-spacing:0.5px; color:var(--text); }` (near-black on the white banner, 13.81:1).
- **Base rules that assume a dark ground, overridden here:** `button:hover { color: var(--text); }`, `.update-btn:hover { color: var(--update-color); }`, `#filter-chip-clear:hover { color: var(--accent-text); }`. Without them, hover text is white on a pale fill (unreadable). `.btn-remove` keeps its base white glyph on HAL red (6.07:1).
- **Filter chip:** base rule (fill `--tile-hover-bg` `#EBF1FB`, blue border, blue text 6.03:1). Art hides while it shows.
- **Edit bar:** pale red fill `#F6E0E0`, HAL-red rule, dark-red label and buttons (6.06:1); "+ FILE" and "+ INSTALLED" stay near-black (11.34:1). No quote.
- **Settings overlay:** opaque `#F4F4F2`, panel `#FBFBFA`, blue values and controls, dark text. The overlay stays legible on any desktop because it is opaque (over-white check n/a).
- **Update banner:** pale amber fill, amber rule, dark-amber text (6.55:1).

### 4.6 Done when

1. The window is light: sample the grid ground (near `#F4F4F2`), header (`#E8E8E4`); no red glow, rings, streaks, or dark panels anywhere in the grid shot.
2. All six icon plates are clearly visible on the light ground (measure plate versus ground; each at least 3:1; Files is the lowest at about 3.5:1).
3. Header: a thin converging line pair leading to a black slab at x 168 to 252 (front face 8 x 18 px); no text under the buttons.
4. Banner: white strip, a red-and-yellow eye at the left, a one-line near-black quote (`scrollWidth <= clientWidth`).
5. Hover shot: CALCULATOR tile turns pale blue with a blue border and a thin amber strip at its top; label stays near-black. Hover a header button: glyph stays dark on a pale fill (not white).
6. Labels are uppercase Semilight with visible letter-spacing; no label halo.
7. Hidden-tiles shot: sigma at most 1.5 (record it; this is the batch floor).
8. `npm run check:contrast` passes, no rebaseline; `loopingAnimationsAtCapture` 0 (was 6); `grep -c infinite` 0; no `\A` escapes.
9. `fontsRendered` lists Segoe UI Semilight (or Segoe UI at 350) and Segoe UI.
10. Settings shot: light overlay, dark labels, blue slider and checkboxes.


---

## 5. cyberpunk (CYBERPUNK 2077): DONE

**Audit:** score 2, redraw. The old header says "neon cyan and magenta on near-black", which Makoto flags as the generic synthwave mistake; the game's base colour is CDPR yellow. Scanlines band the icons, a "data rain" readout runs down the right column, seven animations.
**Direction:** flat Night City HUD. Near-black panels, hard CDPR yellow as the accent, cyan as the secondary highlight, red only for edit mode, no magenta, no glow, no scanlines. Chamfered corners at the window's top-left and bottom-right, a small notch under the header, a yellow hazard stripe on the banner, a static glitch slice beside the title, and one stepped title glitch every 8 seconds.

### 5.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
  --overlay-clip: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
  --bg: #0B0B10;
  --panel-bg: #12121A;
  --overlay-bg: #0B0B10;
  --header-bg: #12121A;
  --font: Bahnschrift, 'Segoe UI', sans-serif;
  --text: #F0F0F0;
  --text-dim: #A2A2B4;
  --accent-c: #FCEE0A;
  --accent-m: #FF4D6A;
  --accent-y: #02D7F2;
  --accent-text: #FCEE0A;
  --border: #34344A;
  --border-h: #FCEE0A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 2px #FCEE0A;
  --title-anim: cp-title-glitch 8s steps(1) infinite;
  --tile-hover-bg: #242315;
  --tile-hover-border: #FCEE0A;
  --tile-hover-shadow: inset 3px 0 0 #FCEE0A;
  --tile-active-bg: #242315;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(1.15) contrast(1.05);
  --tile-icon-shape: polygon(14% 0, 100% 0, 100% 86%, 86% 100%, 0 100%, 0 14%);
  --tile-label-spacing: 1.2px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.6s ease-out forwards;
  --btn-hover-bg: #242315;
  --btn-active-bg: #242315;
  --drop-hint-border: #4A4A60;
  --drop-icon-color: #8A8AA0;
  --hint-sub-color: #A2A2B4;
  --rename-dashed: #FCEE0A;
  --rename-input-bg: #1C1C28;
  --edit-bar-bg: #1F0A12;
  --edit-bar-border: #FF003C;
  --edit-label-color: #FF4D6A;
  --edit-label-glow: none;
  --btn-done-color: #FF4D6A;
  --btn-done-border: #FF003C;
  --btn-done-hover-bg: #3A0F1C;
  --btn-done-hover-glow: none;
  --btn-add-border: #8A8AA0;
  --update-bg: #06222A;
  --update-border: #02D7F2;
  --update-color: #02D7F2;
  --update-btn-border: #02D7F2;
  --update-btn-hover-bg: #0A3742;
  --update-btn-hover-glow: none;
  --btn-close-color: #FF4D6A;
  --btn-close-border: #FF003C;
  --btn-close-hover-bg: #3A0F1C;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1C1C28;
  --picker-item-hover-bg: #242315;
  --picker-item-active-bg: #242315;
  --picker-placeholder-bg: #1C1C28;
  --skin-btn-active-bg: #242315;
  --remove-btn-bg: #C8002E;
  --remove-btn-border: #FF003C;
}
```
Notes: `--glow-*` are `none` (single-pixel flat lines, not neon halos). No magenta anywhere: the old `#FF00AA` accent is gone. Red is edit-mode only (`--accent-m` is the lighter red `#FF4D6A` for small text; the true 2077 red `#FF003C` is used for borders). Makoto marks `#FF003C` as unverified, so it appears only as a rule and never as a fill behind text. `--title-anim` is the theme's single remaining animation (5.4).

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#F0F0F0` on `#0B0B10` | 4.5:1 | **17.23:1** |
| --text-dim on --bg | `#A2A2B4` on `#0B0B10` | 4.5:1 | **7.82:1** |
| --accent-c on --bg | `#FCEE0A` on `#0B0B10` | 3:1 | **16.24:1** |
| --accent-text on --bg | `#FCEE0A` on `#0B0B10` | 3:1 | **16.24:1** |
| --hint-sub-color on --bg | `#A2A2B4` on `#0B0B10` | 4.5:1 | **7.82:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F0F0F0` on `#12121A` | 4.5:1 | **16.35:1** |
| Tile label on tile hover fill | `#F0F0F0` on `#242315` | 4.5:1 | **13.89:1** |
| Tile label on tile pressed | `#F0F0F0` on `#242315` | 4.5:1 | **13.89:1** |
| Title (accent-text) on header | `#FCEE0A` on `#12121A` | 4.5:1 | **15.41:1** |
| Title dot (cyan override) on header | `#02D7F2` on `#12121A` | 4.5:1 | **10.65:1** |
| Header version (text-dim) on header | `#A2A2B4` on `#12121A` | 4.5:1 | **7.42:1** |
| Header button glyph (text) on header | `#F0F0F0` on `#12121A` | 4.5:1 | **16.35:1** |
| Header button glyph on button hover fill | `#F0F0F0` on `#242315` | 4.5:1 | **13.89:1** |
| Filter chip text on chip fill (#242315) | `#FCEE0A` on `#242315` | 4.5:1 | **13.10:1** |
| Banner text on banner (panel-bg) | `#F0F0F0` on `#12121A` | 4.5:1 | **16.35:1** |
| Edit label on edit bar | `#FF4D6A` on `#1F0A12` | 4.5:1 | **5.87:1** |
| Done / close text on edit bar | `#FF4D6A` on `#1F0A12` | 4.5:1 | **5.87:1** |
| + FILE / + INSTALLED text on edit bar | `#F0F0F0` on `#1F0A12` | 4.5:1 | **16.60:1** |
| Done text on its hover fill | `#FF4D6A` on `#3A0F1C` | 4.5:1 | **5.16:1** |
| Settings text on overlay | `#F0F0F0` on `#0B0B10` | 4.5:1 | **17.23:1** |
| Settings text on panel | `#F0F0F0` on `#12121A` | 4.5:1 | **16.35:1** |
| Settings label (text-dim) on panel | `#A2A2B4` on `#12121A` | 4.5:1 | **7.42:1** |
| Settings value / cheat key (accent-text) on panel | `#FCEE0A` on `#12121A` | 4.5:1 | **15.41:1** |
| Settings CLOSE text on panel | `#FF4D6A` on `#12121A` | 4.5:1 | **5.79:1** |
| Hotkey error text (accent-m) on panel | `#FF4D6A` on `#12121A` | 4.5:1 | **5.79:1** |
| Hotkey input text on input fill | `#FCEE0A` on `#1C1C28` | 4.5:1 | **13.94:1** |
| Picker row text on hover fill | `#F0F0F0` on `#242315` | 4.5:1 | **13.89:1** |
| Update banner text on update bar | `#02D7F2` on `#06222A` | 4.5:1 | **9.45:1** |
| Update button text on hover fill | `#02D7F2` on `#0A3742` | 4.5:1 | **7.33:1** |
| Drop-hint text (text-dim) on grid ground | `#A2A2B4` on `#0B0B10` | 4.5:1 | **7.82:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#C8002E` | 3.0:1 | **6.01:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#FCEE0A` on `#12121A` | 3.0:1 | **15.41:1** |
| Focus ring on grid ground (non-text) | `#FCEE0A` on `#0B0B10` | 3.0:1 | **16.24:1** |
| Hover border on grid ground (non-text) | `#FCEE0A` on `#0B0B10` | 3.0:1 | **16.24:1** |
| Hover border on hover fill (non-text) | `#FCEE0A` on `#242315` | 3.0:1 | **13.10:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#FCEE0A` on `#242315` | 4.5:1 | **13.10:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#FCEE0A` on `#242315` | 4.5:1 | **13.10:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#FCEE0A` on `#242315` | 4.5:1 | **13.10:1** |
| Picker / skin search input text (accent-text) on search fill | `#FCEE0A` on `#1C1C28` | 4.5:1 | **13.94:1** |
| Rename / hotkey input text (accent-text) on input fill | `#FCEE0A` on `#1C1C28` | 4.5:1 | **13.94:1** |
| Search placeholder (text-dim) on search fill | `#A2A2B4` on `#1C1C28` | 4.5:1 | **6.71:1** |
| Hotkey recording text (accent-m) on input fill | `#FF4D6A` on `#1C1C28` | 4.5:1 | **5.23:1** |
| Update dismiss glyph (text-dim) on update bar | `#A2A2B4` on `#06222A` | 4.5:1 | **6.59:1** |

**Lowest ratio in this theme: 5.16:1 (Done text on its hover fill).** Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, tile ground `#12121A`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5480AF` | `#12121A` | 4.51:1 | pass |
| Calculator `#6b6f76` | `#696E77` | `#12121A` | 3.64:1 | pass |
| Paint `#b07a4f` | `#BA7944` | `#12121A` | 5.24:1 | pass |
| Terminal `#3d4450` | `#394150` | `#12121A` | 1.82:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#458D8E` | `#12121A` | 4.84:1 | pass |
| Files `#c09a3e` | `#C89B2C` | `#12121A` | 7.26:1 | pass |

Lowest non-Terminal icon ratio: **3.64:1** (pass). Terminal is 1.82:1 on this ground (mock art; the fx does not darken it).

Icons on the hover fill `#242315`: lowest non-Terminal plate **3.09:1**; on the pressed fill `#242315`: **3.09:1** (both pass; the hover and pressed fills were chosen dark enough for the mid-grey Calculator plate to stay at 3:1 or better).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` are opaque, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; over-white check n/a.


### 5.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `Bahnschrift, 'Segoe UI', sans-serif` | 400 (base) | base | base | base |
| `#title` | same | 600 (SemiBold) with `font-stretch: 75%` (Condensed) | 11 px (base) | 3px | uppercase (markup) |
| `.tile-label` | same | 600 (`--tile-label-weight`) with `font-stretch: 87.5%` (SemiCondensed) | 12 px (base) | 1.2px | uppercase (`--tile-label-transform`) |
| `#theme-banner-text` | same | 600 with `font-stretch: 75%` | 11 px (base) | 1.5px | uppercase strings, as written below |

**Width axis check.** `bahnschrift.ttf` is a variable font (weight 300 to 700, width 75 to 100; verified with the axes read from the file). I could not test in this Chromium whether `font-stretch` reaches the width axis for a system variable font. Everything fits at **normal width too**, so the fallback is safe: measured with the real font (Pillow, axes set to weight 600): Condensed / SemiCondensed / Normal: title 89 / 100 / 112 px (ends at most x 124; art starts x 168); CALCULATOR at 12 px, 1.2 px tracking 59 / 75 / 86 px (box 100 px); the longest banner line 224 / 264 / 298 px against 364 px. **After-run check:** measure the CALCULATOR label text width; about 75 px means the stretch applied, about 86 px means it did not. If it did not, keep normal width and tell Judy (no layout change needed). Expected `fontsRendered`: `Bahnschrift`. **Cyrillic:** no Cyrillic text in this theme; Bahnschrift and Segoe UI both contain U+0416 (checked with negative controls).

### 5.3 Art (redraw). Static, original, inline SVG data URIs and gradients

Delete: the four current SVGs (grain, three rain tiles), the eight-bracket grid gradient, the horizontal grid lines, scanlines in `#app::after` (set `#app::after { background: none; }`), the ghost readout, header text, edit-bar text, the `#app` neon surge, `#header::before` animation and particles (0.3). The theme has **no texture** (expected sigma about 0).

**A. Window shape.** `--app-clip` and `--overlay-clip`: `polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)`: top-left and bottom-right corners cut by 14 px (an asymmetric chamfer is the game's look; the old symmetric octagon was the generic version). Nothing important sits in either cut: the title starts at (12,10), the banner text ends far from the bottom-right corner, and the fullscreen button's corner (412,8) is far outside the top-right, which is uncut.

**B. Header art (HZ), a glitch slice and a notch, `#header::after`.** `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:36px; background:url(svg) no-repeat 0 0 / 84px 36px; pointer-events:none;` (36 px tall so the notch can reach 6 px below the header line; it ends at window y 46, above the y 52 keep-out). Hidden with `#header:has(#filter-chip:not(.hidden))::after { display:none }`. SVG `viewBox="0 0 84 36"`, no background, flat rectangles only:
- Glitch slice, three offset bars: yellow `#FCEE0A` x 2, y 5, width 32, height 3; cyan `#02D7F2` x 10, y 11, width 36, height 2 (shifted 8 px right of the first); yellow `#FCEE0A` x 4, y 16, width 16, height 2.
- Notch tab: yellow `#FCEE0A` rectangle x 0, y 29, width 12, height 4. Box y 29 to 30 is the header's 1 px bottom border (window y 39 to 40), so the tab covers the border and hangs 3 px below it into the empty top band (window y 40 to 43).
- Opacity 1. Static.

**C. Corner brackets in the frame bands, `#grid-container` background (do not scroll).** Four 1 px rectangles, 8 px arms, in the top-left (yellow) and top-right (cyan) corners of the container. P is the container's padding-box right edge (window width minus the 4 px scrollbar):
`linear-gradient(#FCEE0A,#FCEE0A) left 2px top 2px / 8px 1px no-repeat, linear-gradient(#FCEE0A,#FCEE0A) left 2px top 2px / 1px 8px no-repeat, linear-gradient(#02D7F2,#02D7F2) right 2px top 2px / 8px 1px no-repeat, linear-gradient(#02D7F2,#02D7F2) right 2px top 2px / 1px 8px no-repeat`.
Window coordinates at 424: top-left bracket x 2 to 10 and y 42 to 50; top-right bracket x 410 to 418. Both are outside the keep-out (x 12 to P-12, y 52 down).

**D. Banner: hazard stripe and a chip icon.**
- `#theme-banner { border-top:0; }` (fill stays the base `--panel-bg` `#12121A`).
- **Hazard stripe, `#theme-banner::after`:** `content:''; position:absolute; top:0; left:0; right:0; height:4px; background:repeating-linear-gradient(135deg, #FCEE0A 0 6px, #0B0B10 6px 12px); pointer-events:none;`. Static. The text starts at banner y 16, so the stripe is 12 px clear.
- **Icon, `#theme-banner::before`:** `content:''; width:22px; height:22px; font-size:0; opacity:1; background:url(svg) center / 22px 22px no-repeat;` SVG `viewBox="0 0 22 22"`: a data shard with the same TL/BR chamfer as the window: polygon (5,2) (20,2) (20,15) (15,20) (2,20) (2,5), no fill, stroke `#FCEE0A` 1.8 px, `stroke-linejoin:miter`; inner square x 8 to 14, y 8 to 14, fill `#FCEE0A`.
- **Banner strings** (`THEME_BANNERS['cyberpunk']`, replaces all five; the four removed lines were not verifiable game quotes; these three are real or the game's own phrases):
  1. `WAKE UP, SAMURAI. WE HAVE A CITY TO BURN.` (Johnny Silverhand)
  2. `NEVER FADE AWAY.` (the Samurai song)
  3. `WELCOME TO NIGHT CITY.`
  Widths (Bahnschrift 600, 11 px, 1.5 px tracking) at Condensed / Normal: 224 / 298, 90 / 124, 120 / 160 px against 364 px: one line each in either case.

**Safe zones:** tile field empty of art. Header art x 168 to 252 (down to y 46). Brackets in FZ-L/FZ-R/FZ-T corners. The stripe and icon live inside the banner. No motif touches a tile, label, chip or button.

### 5.4 Motion (the one remaining animation is named here)

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `cp-glitch 10s` | `#title` text-shadow, transform, clip-path, opacity **(tier 6)** | **replaced** by `cp-title-glitch` below |
| 2 | `banner-glow 3s` | `#theme-banner::before` text-shadow, opacity **(tier 2)** | removed |
| 3 | `cp-bracket-sync 10s` | `#grid-container::before` opacity, filter (brightness) **(tier 3)** | removed |
| 4 | `cp-readout 6s` | `#grid-container::after` colour **(tier 2)** | removed |
| 5 | `cp-neon-surge 10s` | `#app` box-shadow **(tier 5)** | removed |
| 6 | `hdr-bar-glitch 10s steps(1)` | `#header::before` filter, transform **(tier 3)** | removed |
| 7 | `cp-data-rain 4s linear` | `#particles` background-position (3 layers, full window) **(tier 4)** | removed |
| hover | `tile-glitch .6s steps(1)` one-shot | `.app-tile:hover::before` **(tier 4)** | removed (no sheen) |

**Kept: 1** (`--title-anim: cp-title-glitch 8s steps(1) infinite`, **tier 1**), a stepped jitter on `transform` only, on the title element only (about 90 by 20 px):
`@keyframes cp-title-glitch { 0%, 90%, 100% { transform: translateX(0); } 91% { transform: translateX(-2px); } 92% { transform: translateX(2px); } 93% { transform: translateX(-1px); } 94% { transform: translateX(0); } }`
With `steps(1)` it holds each value; it is active for 4 percent of the 8 s cycle (0.32 s). No `text-shadow`, `clip-path` or `opacity` is animated (cheaper than the old `cp-glitch`, which animated all four). The idle pause (`body.ql-paused`) and Reduce Motion both stop it. **Before 7, after 1** (the only infinite animation in the theme; it is on the cheapest property tier). The one-shot `entrance-fade 0.6s` is the entrance.

### 5.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `.app-tile { background:#12121A; border-color:#2A2A3A; }` and `.app-tile::before { display:none; }`. Square (`--radius: 0`), 1 px border, layout unchanged.
- **Icon plate (chamfer, keeps the glyph):** `--tile-icon-shape: polygon(14% 0, 100% 0, 100% 86%, 86% 100%, 0 100%, 0 14%)`, the same TL/BR cut as the window. Margins to the mock glyphs (px in a 64 px plate): Notepad 12.0, Calculator 10.0, Paint 11.0, Terminal 10.0, Browser 11.5, Files 11.0 (smallest 10.0 px, all positive).
- **Hover:** fill `#242315`, border `#FCEE0A`, and a 3 px yellow bar on the tile's left inside edge (`--tile-hover-shadow: inset 3px 0 0 #FCEE0A`), the 2077 menu-row cue. No transform, no glow.
- **Selected (focus-visible):** hover plus the base 2 px yellow outline at offset 2 (15.41:1): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#242315`.
- **Label:** `.tile-label { font-family:Bahnschrift,'Segoe UI',sans-serif; font-stretch:87.5%; }` white `#F0F0F0`, uppercase, no halo.
- **Title:** `#title { font-family:Bahnschrift,'Segoe UI',sans-serif; font-stretch:75%; font-weight:600; letter-spacing:3px; text-shadow:1px 0 0 #02D7F2; }` (a static 1 px cyan offset for the chromatic-aberration cue) and `#title .accent { color:#02D7F2; }` so red stays edit-only (10.65:1).
- **Filter chip:** base rule (fill `#242315`, yellow border, yellow text 13.10:1). Header art hides while it shows.
- **Banner text:** `#theme-banner-text { font-family:Bahnschrift,'Segoe UI',sans-serif; font-stretch:75%; font-weight:600; letter-spacing:1.5px; color:#F0F0F0; }`.
- **Edit bar:** dark red-black fill, red rule, red label (5.87:1). No quote.
- **Settings overlay:** opaque `#0B0B10`, panel `#12121A`, yellow values, yellow sliders and checkboxes. Same TL/BR chamfer as the window.
- **Update banner:** cyan on `#06222A` (9.45:1).

### 5.6 Done when

1. Yellow is the dominant accent: the title, hover bar, focus ring and checkboxes are yellow; there is **no magenta or pink pixel** in the grid or settings shot (search for hue 300 to 340 at saturation above 0.5); red appears only in edit mode.
2. The top-left and bottom-right window corners are cut; the fullscreen button is fully visible (its corner at (412,8) is uncut).
3. No horizontal banding on any icon (adjacent pixel rows in a plate differ by at most 6 levels); each plate shows a chamfered top-left and bottom-right.
4. Banner: a yellow-and-black diagonal stripe along its top 4 px, a yellow chamfered chip at the left, a one-line white quote (`scrollWidth <= clientWidth`).
5. Header: the yellow/cyan slice and the notch tab at x 168 to 180; typing a letter hides them and shows the chip.
6. Hover shot: CALCULATOR tile has a yellow border, a dark-olive fill and a 3 px yellow bar at its left edge; no glow.
7. `npm run check:contrast` passes, no rebaseline; `grep -c infinite` is **1**; `loopingAnimationsAtCapture` is 1 (was 7); no `\A` escapes.
8. Measured `CALCULATOR` label width is about 75 px (stretch applied) or 86 px (not); report which.
9. Hidden-tiles shot: sigma about 0 (no texture).
10. 640x420 and 1024x700: the chamfers stay 14 px; the stripe spans the full banner width.


---

## 6. stranger-things (STRANGER THINGS): DONE

**Audit:** score 2, redraw. Magenta and hot pink where the show is neon red on black with cream and Upside-Down blue; a string of Christmas lights runs through three label rows; the title is a spaced sans.
**Direction:** Hawkins, 1983, in print: a paperback-cover title in a heavy serif with a thin red glow, cream italic labels, neon red for fills and focus, dark Upside-Down blue for hover. The Christmas lights move out of the tile field into the top band, six bulbs on a slack wire. One tiny stepped flicker on the banner icon is the only motion.

### 6.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0A0408;
  --panel-bg: #140810;
  --overlay-bg: #0A0408;
  --header-bg: #10060A;
  --font: Georgia, 'Times New Roman', serif;
  --text: #F0E8D0;
  --text-dim: #B5A793;
  --accent-c: #E0182A;
  --accent-m: #8FB4F0;
  --accent-y: #F0E8D0;
  --accent-text: #F0283A;
  --border: #3A1018;
  --border-h: #E0182A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 2px #E0182A;
  --title-anim: none;
  --tile-hover-bg: #10203C;
  --tile-hover-border: #E0182A;
  --tile-hover-shadow: none;
  --tile-active-bg: #112646;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.85) sepia(0.1);
  --tile-icon-shape: none;
  --tile-label-spacing: 0.2px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: italic;
  --tile-label-shadow: none;
  --banner-icon-anim: st-flicker 5s steps(1) infinite;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #10203C;
  --btn-active-bg: #112646;
  --drop-hint-border: #5A1A24;
  --drop-icon-color: #9A8C78;
  --hint-sub-color: #B0A38F;
  --rename-dashed: #E0182A;
  --rename-input-bg: #1C0A12;
  --edit-bar-bg: #0E1830;
  --edit-bar-border: #5B8FE0;
  --edit-label-color: #8FB4F0;
  --edit-label-glow: none;
  --btn-done-color: #8FB4F0;
  --btn-done-border: #5B8FE0;
  --btn-done-hover-bg: #112646;
  --btn-done-hover-glow: none;
  --btn-add-border: #9A8C78;
  --update-bg: #1A0A0E;
  --update-border: #E0182A;
  --update-color: #F0E8D0;
  --update-btn-border: #F0E8D0;
  --update-btn-hover-bg: #3A1018;
  --update-btn-hover-glow: none;
  --btn-close-color: #F0283A;
  --btn-close-border: #E0182A;
  --btn-close-hover-bg: #3A1018;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1C0A12;
  --picker-item-hover-bg: #10203C;
  --picker-item-active-bg: #112646;
  --picker-placeholder-bg: #10203C;
  --skin-btn-active-bg: #112646;
  --remove-btn-bg: #A01020;
  --remove-btn-border: #E0182A;
}
```
Notes: `--glow-*` are `none`; the only glow is the title's static red text-shadow (6.3, item C). **No magenta and no pink:** `#FF0066`, `#C070A0` and `#9900CC` are gone. Neon red is `#E0182A` (fills, borders, focus ring; 4.19:1 on the ground); the text-role red is the brighter `#F0283A` (`--accent-text`, 4.90:1). Red text does not clear 4.5:1 on the blue hover fill, so the theme overrides four roles (6.5): the filter chip fill, the rename/hotkey/search input fills, the theme-picker row text and the edit-mode hover label; those pairs are in the table below with their override values. Amber `#FFB030` is used in the bulb art only.

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#F0E8D0` on `#0A0408` | 4.5:1 | **16.60:1** |
| --text-dim on --bg | `#B5A793` on `#0A0408` | 4.5:1 | **8.62:1** |
| --accent-c on --bg | `#E0182A` on `#0A0408` | 3:1 | **4.19:1** |
| --accent-text on --bg | `#F0283A` on `#0A0408` | 3:1 | **4.90:1** |
| --hint-sub-color on --bg | `#B0A38F` on `#0A0408` | 4.5:1 | **8.20:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F0E8D0` on `#140810` | 4.5:1 | **16.01:1** |
| Tile label on tile hover fill | `#F0E8D0` on `#10203C` | 4.5:1 | **13.26:1** |
| Tile label on tile pressed | `#F0E8D0` on `#112646` | 4.5:1 | **12.35:1** |
| Title (accent-text) on header | `#F0283A` on `#10060A` | 4.5:1 | **4.82:1** |
| Title dot (accent-m) on header | `#8FB4F0` on `#10060A` | 4.5:1 | **9.46:1** |
| Header version (text-dim) on header | `#B5A793` on `#10060A` | 4.5:1 | **8.47:1** |
| Header button glyph (text) on header | `#F0E8D0` on `#10060A` | 4.5:1 | **16.30:1** |
| Header button glyph on button hover fill | `#F0E8D0` on `#10203C` | 4.5:1 | **13.26:1** |
| Filter chip text on chip fill (override #0A0408) | `#F0283A` on `#0A0408` | 4.5:1 | **4.90:1** |
| Banner text on banner (panel-bg) | `#F0E8D0` on `#140810` | 4.5:1 | **16.01:1** |
| Edit label on edit bar | `#8FB4F0` on `#0E1830` | 4.5:1 | **8.35:1** |
| Done / close text on edit bar | `#8FB4F0` on `#0E1830` | 4.5:1 | **8.35:1** |
| + FILE / + INSTALLED text on edit bar | `#F0E8D0` on `#0E1830` | 4.5:1 | **14.39:1** |
| Done text on its hover fill | `#8FB4F0` on `#112646` | 4.5:1 | **7.16:1** |
| Settings text on overlay | `#F0E8D0` on `#0A0408` | 4.5:1 | **16.60:1** |
| Settings text on panel | `#F0E8D0` on `#140810` | 4.5:1 | **16.01:1** |
| Settings label (text-dim) on panel | `#B5A793` on `#140810` | 4.5:1 | **8.32:1** |
| Settings value / cheat key (accent-text) on panel | `#F0283A` on `#140810` | 4.5:1 | **4.73:1** |
| Settings CLOSE text on panel | `#F0283A` on `#140810` | 4.5:1 | **4.73:1** |
| Hotkey error text (accent-m) on panel | `#8FB4F0` on `#140810` | 4.5:1 | **9.29:1** |
| Hotkey / picker-search input text on input fill | `#F0283A` on `#1C0A12` | 4.5:1 | **4.60:1** |
| Picker row text (cream override) on hover fill | `#F0E8D0` on `#10203C` | 4.5:1 | **13.26:1** |
| Picker row text (cream override) on active fill | `#F0E8D0` on `#112646` | 4.5:1 | **12.35:1** |
| Edit-mode label hover text (cream override) on hover fill | `#F0E8D0` on `#10203C` | 4.5:1 | **13.26:1** |
| Update banner text on update bar | `#F0E8D0` on `#1A0A0E` | 4.5:1 | **15.69:1** |
| Update button text on hover fill | `#F0E8D0` on `#3A1018` | 4.5:1 | **13.54:1** |
| Drop-hint text (text-dim) on grid ground | `#B5A793` on `#0A0408` | 4.5:1 | **8.62:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A01020` | 3.0:1 | **8.11:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#E0182A` on `#140810` | 3.0:1 | **4.04:1** |
| Focus ring on grid ground (non-text) | `#E0182A` on `#0A0408` | 3.0:1 | **4.19:1** |
| Hover border on grid ground (non-text) | `#E0182A` on `#0A0408` | 3.0:1 | **4.19:1** |
| Hover border on hover fill (non-text) | `#E0182A` on `#10203C` | 3.0:1 | **3.35:1** |
| Search placeholder (text-dim) on search fill | `#B5A793` on `#1C0A12` | 4.5:1 | **8.09:1** |
| Hotkey recording text (accent-m) on input fill | `#8FB4F0` on `#1C0A12` | 4.5:1 | **9.04:1** |
| Update dismiss glyph (text-dim) on update bar | `#B5A793` on `#1A0A0E` | 4.5:1 | **8.15:1** |

**Lowest ratio in this theme: 3.35:1 (Hover border on hover fill (non-text)).** Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, tile ground `#140810`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#67809B` | `#140810` | 4.79:1 | pass |
| Calculator `#6b6f76` | `#707174` | `#140810` | 4.01:1 | pass |
| Paint `#b07a4f` | `#AA7E5B` | `#140810` | 5.45:1 | pass |
| Terminal `#3d4450` | `#41454D` | `#140810` | 2.04:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#5E8987` | `#140810` | 5.04:1 | pass |
| Files `#c09a3e` | `#BD9D53` | `#140810` | 7.57:1 | pass |

Lowest non-Terminal icon ratio: **4.01:1** (pass). Terminal is 2.04:1 on the rest ground and 1.69:1 on the hover fill (mock art; the fx does not darken it). The second table repeats the icon check on the blue hover fill.

Icons on the hover fill `#10203C`: lowest non-Terminal plate **3.33:1**; on the pressed fill `#112646`: **3.10:1** (both pass; the hover and pressed fills were chosen dark enough for the mid-grey Calculator plate to stay at 3:1 or better).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` are opaque, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; over-white check n/a.


**Icon plates on the blue hover fill (`#10203C`):**

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#67809B` | `#10203C` | 3.97:1 | pass |
| Calculator `#6b6f76` | `#707174` | `#10203C` | 3.33:1 | pass |
| Paint `#b07a4f` | `#AA7E5B` | `#10203C` | 4.52:1 | pass |
| Terminal `#3d4450` | `#41454D` | `#10203C` | 1.69:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#5E8987` | `#10203C` | 4.18:1 | pass |
| Files `#c09a3e` | `#BD9D53` | `#10203C` | 6.27:1 | pass |

Lowest non-Terminal icon ratio on the hover fill: **3.33:1** (pass).

### 6.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `Georgia, 'Times New Roman', serif` (`georgia.ttf`, `georgiab.ttf`, `georgiai.ttf`) | 400 (base) | base | base | base |
| `#title` | same stack | 700, roman | 11 px (base) | 2px (tight, replaces 5px) | uppercase (markup) |
| `.tile-label` | same stack | 400, italic (`--tile-label-style`) | 12 px (base) | 0.2px | as typed (`none`) |
| `#theme-banner-text` | same stack | 400, italic | **12 px** (set on `#theme-banner-text`) | 0.3px | sentence case, as written below |

Georgia Bold is the stock stand-in for the show's swash serif (Benguiat is proprietary and must not be shipped, per the audit). Measured with the real font files: the title is 120 px wide, ending at x 132; labels in Georgia Italic 12 px: Notepad 47, Terminal 53, Calculator 58, Browser 48 px; banner lines at 12 px italic: 96, 95 and 248 px against a 364 px box. Expected `fontsRendered`: `Georgia` (regular, italic, bold). **Cyrillic:** no Cyrillic text in this theme; Georgia contains U+0416 (checked with negative controls).

### 6.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the four current SVGs (VHS turbulence, bulb string, two spore tiles), the diagonal-tendril gradient, the pink and purple vignette layers, the ghost readout, header text and its `#header::after` (nothing replaces it: **this theme has no header art**), edit-bar text, particles, the `#app` gate-bleed animation (0.3).

**A. Vignette on `#app::after`** (full window, above tiles; darkens only): `background: radial-gradient(ellipse 100% 90% at 50% 50%, transparent 55%, rgba(3,0,4,0.60) 100%);`. No grain, no static noise, no scanlines. Expected sigma in the tile rects: under 1.5.

**B. The string of lights, in the top band, `#grid-container` background (static, does not scroll, painted under the tiles).** One background layer: `url(svg) 0 0 / 212px 11px repeat-x`. Container-relative: it occupies container y 0 to 11, which is window y 40 to 51, the empty top band (the keep-out starts at y 52). One unit is 212 px wide and holds three bulbs, so at 424 wide it repeats exactly twice: **six bulbs**, at window x 35.3, 106, 176.7, 247.3, 318 and 388.7. SVG `viewBox="0 0 212 11"`, no background:
- Wire: one path, stroke `#3A2A1A` (dark cord) 1 px, no fill: `M0 1.2 Q35.3 3.6 70.7 1.2 Q106 3.6 141.3 1.2 Q176.7 3.6 212 1.2` (three shallow sags; the sag low points are at the bulb x positions, y 2.4).
- Three bulbs, each = a socket + a bulb, centred on x = 35.3, 106, 176.7: socket rectangle 2.4 wide, 2 tall at y 2.4 to 4.4, fill `#3A2A1A`; bulb ellipse cx = the bulb x, cy 7.2, rx 2.6, ry 3.2 (spans y 4.0 to 10.4), fill: first bulb amber `#FFB030`, second neon red `#E0182A`, third Upside-Down blue `#5B8FE0`; a small highlight ellipse at (bulb x - 0.8, 5.8), rx 0.7, ry 1.1, fill `#FFFFFF`, opacity 0.55.
- Nothing extends past y 10.4, so the art ends at window y 50.4, 1.6 px above the keep-out and 5.6 px above the first tile row. Because it is a background under the tiles, a scrolled tile row covers it rather than being covered by it (checked: this is why it is not a `#header::after` overlay, which would paint over scrolled tiles).
- Bulbs are generic Christmas bulbs. No letters are spelt.

**C. Title glow.** `#title { font-family:Georgia,'Times New Roman',serif; font-weight:700; letter-spacing:2px; text-shadow:0 0 1px #F0283A, 0 0 6px rgba(224,24,42,0.80); }` (static, a thin red outline glow), colour `--accent-text` `#F0283A`. Title dot: base `.accent` (`--accent-m`, light blue `#8FB4F0`).

**D. Banner and icon.** `#theme-banner { border-top-color:#5A1018; }` (fill stays `--panel-bg` `#140810`). **Icon, `#theme-banner::before`:** `content:''; width:22px; height:22px; font-size:0; opacity:1; background:url(svg) center / 22px 22px no-repeat;` SVG `viewBox="0 0 22 22"`: a five-petal flower with the petals open, all strokes `#E0182A` 1.4 px, no fill: one petal is an ellipse cx 11, cy 5.5, rx 2.2, ry 4.6, repeated four more times by rotating 72, 144, 216 and 288 degrees about (11,11); plus a centre circle r 1.6, fill `#0A0408`, stroke `#E0182A` 1 px. (Evokes the show's flower motif with a plain flower shape; no creature drawn.) The icon is animated (6.4).
- **Banner strings** (`THEME_BANNERS['stranger-things']`, replaces all five; the two removed lines were paraphrases; sentence case, Georgia italic 12 px, 0.3 px tracking):
  1. `Friends don't lie.` (96 px)
  2. `Mouth breather.` (95 px)
  3. `Mornings are for coffee and contemplation.` (248 px)
  All real lines; each fits one line with at least 116 px spare.

**Safe zones:** tile field empty of art (vignette only). The bulb strip is FZ-T (container y 0 to 11) and is 5.6 px clear of the first tile row. No motif touches a tile, label, chip or button. The header holds only the title, version and buttons, so the filter chip has nothing beside it.

### 6.4 Motion (the one remaining animation is named here)

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `upside-down 5s steps(1)` | `#title` text-shadow, opacity **(tier 2)** | removed |
| 2 | `banner-flicker 5s steps(1)` | `#theme-banner::before` opacity **(tier 1)** | **replaced** by `st-flicker` below (same element, same period, same property) |
| 3 | `st-lights .3s steps(1,end)` | `#grid-container::before` opacity (about 3 updates per second on a full container) **(tier 1)** | removed |
| 4 | `st-lore 10s` | `#grid-container::after` colour **(tier 2)** | removed |
| 5 | `st-gate-bleed 9s` | `#app` box-shadow **(tier 5)** | removed |
| 6 | `st-spores 12s linear` | `#particles` background-position (2 layers, full window) **(tier 4)** | removed |

**Kept: 1** (`--banner-icon-anim: st-flicker 5s steps(1) infinite`, **tier 1**), opacity only, on the 22 x 22 px icon:
`@keyframes st-flicker { 0%, 86%, 100% { opacity: 1; } 88% { opacity: 0.25; } 90% { opacity: 1; } 93% { opacity: 0.5; } 95% { opacity: 1; } }`
It costs no more than today's banner icon animation (same element, period, timing and property; the old one used base `banner-flicker` with a resting opacity of 0.55, this one rests at 1). Reduce Motion and the idle pause stop it. **Before 6, after 1.** One-shot `entrance-fade 0.8s` for entrance (`entrance-flash` retired).

### 6.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `.app-tile { background:#140810; border-color:#2A0E16; }` and `.app-tile::before { display:none; }`. 2 px radius, 1 px border, layout unchanged. `--tile-icon-shape: none`.
- **Hover:** fill dark Upside-Down blue `#10203C`, border neon red `#E0182A` (3.35:1 on the fill), no glow, no transform.
- **Selected (focus-visible):** hover plus the base 2 px red outline at offset 2 (4.04:1 on the tile ground): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#112646`.
- **Label:** `.tile-label { font-family:Georgia,'Times New Roman',serif; }` cream `#F0E8D0`, italic, no halo.
- **Overrides required because red text fails on the blue fill (3.92:1):**
  - `#filter-chip { background:#0A0408; }` (chip text red 4.90:1; border stays red).
  - `--rename-input-bg` and `--picker-search-bg` are `#1C0A12` (rename, hotkey and search text red 4.60:1).
  - `.theme-picker-item:hover, .theme-picker-item.active, .theme-picker-item.selected { color:#F0E8D0; }` (cream on `#10203C` 13.26:1, on `#112646` 12.35:1).
  - `.tile-label.renameable:hover { color:#F0E8D0; }` (13.26:1).
- **Banner text:** `#theme-banner-text { font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:12px; letter-spacing:0.3px; color:#F0E8D0; }`.
- **Edit bar:** dark blue fill `#0E1830`, blue rule, light-blue label (8.35:1). No quote.
- **Settings overlay:** opaque `#0A0408`, panel `#140810`, red values (4.73:1), red sliders and checkboxes.
- **Update banner:** cream text on dark red-black with a red rule (15.69:1).

### 6.6 Done when

1. The grid shot has **no magenta or pink pixel** (search for hue 290 to 340 at saturation above 0.5): red, cream, blue and amber only; the title is red with a thin glow.
2. Six bulbs sit in the band between the header and the first tile row (amber, red, blue, amber, red, blue), the wire is visible, and the lowest bulb pixel is at window y 50 or above; no bulb touches a tile, a label or the focus ring. Scroll the grid one row: tiles cover the bulbs, never the reverse.
3. No text runs through any label row; the header shows only the title, the version and the buttons.
4. Banner: a five-petal red flower at the left, a one-line cream italic quote (`scrollWidth <= clientWidth`); the icon flickers (opacity steps) about every 5 s.
5. Hover shot: CALCULATOR tile has a red border on a dark-blue fill, label stays cream.
6. Type a letter: the chip is near-black with red text and red border, no overlap.
7. `npm run check:contrast` passes, no rebaseline; `grep -c infinite` is 1; `loopingAnimationsAtCapture` is 1 and that animation is on `#theme-banner::before` (was 6); no `\A` escapes.
8. Hidden-tiles shot: sigma about 1 or less (vignette only).
9. `fontsRendered` lists Georgia (regular, italic, bold).
10. 640x420 and 1024x700: the bulb strip repeats every 212 px across the full width (no stretching); band clearance unchanged.


---

## 7. shire (THE SHIRE): DONE

**Audit:** score 2, redraw. A straight-edged almanac (meal wheel, botanical, calendar) boxes in the whole tile field, with ghost lines behind every icon; near-black olive, green text, a lumpy 12-point icon crop; the Shire has no straight lines.
**Direction:** a warm hobbit-hole window. Olive-dark ground with a soft brown wash in the lower half, a rounded window shape, a timber-plank frame around the tiles with small vine ticks along its top, parchment text, Gabriola for the title, Georgia for labels, a round green door in a hill in the header, a wooden sign for the banner with a smoke-ring icon. Rounded everything; no almanac, no roster, no motion.

### 7.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 8px;
  --app-clip: inset(0 round 14px);
  --overlay-clip: inset(0 round 14px);
  --bg: #1F2614;
  --panel-bg: #262E18;
  --overlay-bg: #1F2614;
  --header-bg: #232B15;
  --font: Georgia, 'Times New Roman', serif;
  --text: #F1E6C8;
  --text-dim: #C4B998;
  --accent-c: #5B8C3A;
  --accent-m: #E27A54;
  --accent-y: #D4A24C;
  --accent-text: #8DBE5A;
  --border: #4F3A22;
  --border-h: #8DBE5A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 2px #D4A24C;
  --title-anim: none;
  --tile-hover-bg: #2F2513;
  --tile-hover-border: #5B8C3A;
  --tile-hover-shadow: none;
  --tile-active-bg: #2F2513;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: sepia(0.12) saturate(1.05);
  --tile-icon-shape: inset(0 round 18px);
  --tile-label-spacing: 0.2px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #2F2513;
  --btn-active-bg: #2F2513;
  --drop-hint-border: #6B4A2B;
  --drop-icon-color: #A89A78;
  --hint-sub-color: #BDB292;
  --rename-dashed: #D4A24C;
  --rename-input-bg: #2F2513;
  --edit-bar-bg: #3A1A10;
  --edit-bar-border: #B7522E;
  --edit-label-color: #E27A54;
  --edit-label-glow: none;
  --btn-done-color: #E27A54;
  --btn-done-border: #B7522E;
  --btn-done-hover-bg: #4A2012;
  --btn-done-hover-glow: none;
  --btn-add-border: #A89A78;
  --update-bg: #33280F;
  --update-border: #D4A24C;
  --update-color: #E8C070;
  --update-btn-border: #D4A24C;
  --update-btn-hover-bg: #4A3A16;
  --update-btn-hover-glow: none;
  --btn-close-color: #E27A54;
  --btn-close-border: #B7522E;
  --btn-close-hover-bg: #3A1A10;
  --btn-close-hover-glow: none;
  --picker-search-bg: #2F2513;
  --picker-item-hover-bg: #2F2513;
  --picker-item-active-bg: #2F2513;
  --picker-placeholder-bg: #2F2513;
  --skin-btn-active-bg: #2F2513;
  --remove-btn-bg: #8C3A1E;
  --remove-btn-border: #D4A24C;
}
```
Notes: `--glow-*` are `none`. Leaf green `#5B8C3A` is `--accent-c` (borders, hover, sliders, checkboxes; 3.91:1 on the ground) and is never used for small text; the text-role green is the lighter `#8DBE5A` (`--accent-text`). Gold `#D4A24C` is the focus ring, set by a rule because the base focus outline reads `--accent-c` (7.5). Brick is edit-mode only; its text-role tint is `#E27A54`. The lower-half brown wash lifts the tile ground, so the label is also checked on the washed ground (`#38311B`, the "brightest pixel behind a label").

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#F1E6C8` on `#1F2614` | 4.5:1 | **12.55:1** |
| --text-dim on --bg | `#C4B998` on `#1F2614` | 4.5:1 | **7.98:1** |
| --accent-c on --bg | `#5B8C3A` on `#1F2614` | 3:1 | **3.91:1** |
| --accent-text on --bg | `#8DBE5A` on `#1F2614` | 3:1 | **7.17:1** |
| --hint-sub-color on --bg | `#BDB292` on `#1F2614` | 4.5:1 | **7.39:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F1E6C8` on `#1C2312` | 4.5:1 | **13.01:1** |
| Tile label on worst-case rest ground (lower-half brown wash 0.35) | `#F1E6C8` on `#38311B` | 4.5:1 | **10.41:1** |
| Tile label on tile hover fill | `#F1E6C8` on `#2F2513` | 4.5:1 | **12.11:1** |
| Tile label on tile pressed | `#F1E6C8` on `#2F2513` | 4.5:1 | **12.11:1** |
| Title (gold override) on header | `#D4A24C` on `#232B15` | 4.5:1 | **6.35:1** |
| Title dot (accent-m) on header | `#E27A54` on `#232B15` | 4.5:1 | **5.00:1** |
| Header version (text-dim) on header | `#C4B998` on `#232B15` | 4.5:1 | **7.52:1** |
| Header button glyph (text) on header | `#F1E6C8` on `#232B15` | 4.5:1 | **11.83:1** |
| Header button glyph on button hover fill | `#F1E6C8` on `#2F2513` | 4.5:1 | **12.11:1** |
| Filter chip text on chip fill (#2F2513) | `#8DBE5A` on `#2F2513` | 4.5:1 | **6.91:1** |
| Banner text on wooden sign | `#F1E6C8` on `#4A3219` | 4.5:1 | **9.59:1** |
| Edit label on edit bar | `#E27A54` on `#3A1A10` | 4.5:1 | **5.35:1** |
| Done / close text on edit bar | `#E27A54` on `#3A1A10` | 4.5:1 | **5.35:1** |
| + FILE / + INSTALLED text on edit bar | `#F1E6C8` on `#3A1A10` | 4.5:1 | **12.65:1** |
| Done text on its hover fill | `#E27A54` on `#4A2012` | 4.5:1 | **4.74:1** |
| Settings text on overlay | `#F1E6C8` on `#1F2614` | 4.5:1 | **12.55:1** |
| Settings text on panel | `#F1E6C8` on `#262E18` | 4.5:1 | **11.36:1** |
| Settings label (text-dim) on panel | `#C4B998` on `#262E18` | 4.5:1 | **7.23:1** |
| Settings value / cheat key (accent-text) on panel | `#8DBE5A` on `#262E18` | 4.5:1 | **6.49:1** |
| Settings CLOSE text on panel | `#E27A54` on `#262E18` | 4.5:1 | **4.81:1** |
| Hotkey error text (accent-m) on panel | `#E27A54` on `#262E18` | 4.5:1 | **4.81:1** |
| Hotkey input text on input fill | `#8DBE5A` on `#2F2513` | 4.5:1 | **6.91:1** |
| Picker row text on hover fill | `#F1E6C8` on `#2F2513` | 4.5:1 | **12.11:1** |
| Update banner text on update bar | `#E8C070` on `#33280F` | 4.5:1 | **8.41:1** |
| Update button text on hover fill | `#E8C070` on `#4A3A16` | 4.5:1 | **6.40:1** |
| Drop-hint text (text-dim) on grid ground | `#C4B998` on `#1F2614` | 4.5:1 | **7.98:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#8C3A1E` | 3.0:1 | **7.67:1** |
| Focus ring (gold override) on tile rest (non-text) | `#D4A24C` on `#1C2312` | 3.0:1 | **6.99:1** |
| Focus ring (gold) on grid ground (non-text) | `#D4A24C` on `#1F2614` | 3.0:1 | **6.74:1** |
| Hover border (accent-c leaf green) on grid ground (non-text) | `#5B8C3A` on `#1F2614` | 3.0:1 | **3.91:1** |
| Hover border on hover fill (non-text) | `#5B8C3A` on `#2F2513` | 3.0:1 | **3.77:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#8DBE5A` on `#2F2513` | 4.5:1 | **6.91:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#8DBE5A` on `#2F2513` | 4.5:1 | **6.91:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#8DBE5A` on `#2F2513` | 4.5:1 | **6.91:1** |
| Picker / skin search input text (accent-text) on search fill | `#8DBE5A` on `#2F2513` | 4.5:1 | **6.91:1** |
| Rename / hotkey input text (accent-text) on input fill | `#8DBE5A` on `#2F2513` | 4.5:1 | **6.91:1** |
| Search placeholder (text-dim) on search fill | `#C4B998` on `#2F2513` | 4.5:1 | **7.70:1** |
| Hotkey recording text (accent-m) on input fill | `#E27A54` on `#2F2513` | 4.5:1 | **5.12:1** |
| Update dismiss glyph (text-dim) on update bar | `#C4B998` on `#33280F` | 4.5:1 | **7.40:1** |

**Lowest ratio in this theme: 3.77:1 (Hover border on hover fill (non-text)).** Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, tile ground `#1C2312`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6381A2` | `#1C2312` | 4.00:1 | pass |
| Calculator `#6b6f76` | `#707274` | `#1C2312` | 3.35:1 | pass |
| Paint `#b07a4f` | `#B27E52` | `#1C2312` | 4.62:1 | pass |
| Terminal `#3d4450` | `#41464E` | `#1C2312` | 1.70:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#578C88` | `#1C2312` | 4.24:1 | pass |
| Files `#c09a3e` | `#C49D44` | `#1C2312` | 6.36:1 | pass |

Lowest non-Terminal icon ratio: **3.35:1** (pass). Terminal is 1.70:1 on this ground (mock art; the fx does not darken it). The ground `#1C2312` is deliberately a shade darker than the window (`#1F2614`) so the tiles read as recessed hobbit holes and the mid-grey Calculator plate stays above 3:1.

Icons on the hover fill `#2F2513`: lowest non-Terminal plate **3.12:1**; on the pressed fill `#2F2513`: **3.12:1** (both pass; the hover and pressed fills were chosen dark enough for the mid-grey Calculator plate to stay at 3:1 or better).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` are opaque, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; over-white check n/a.


### 7.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `Georgia, 'Times New Roman', serif` | 400 (base) | base | base | base |
| `#title` | `Gabriola, Georgia, serif` (`gabriola.ttf`) | 400 | **17 px** (`font-size:17px; line-height:1`) | 1px | uppercase (markup); Gabriola's swash capitals |
| `.tile-label` | `Georgia, 'Times New Roman', serif` | 400, roman | 12 px (base) | 0.2px | as typed (`none`) |
| `#theme-banner-text` | same as labels | 400, italic | **12 px** (set on `#theme-banner-text`) | 0.3px | sentence case, as written below |

Gabriola has a small x-height, so the title is set at 17 px instead of 11 px; with `line-height:1` the title area is 17 + 1 + 12 = 30 px tall inside the 39 px header content (no wrap, no crowding). I rendered the title in Gabriola at 15, 17 and 19 px on the theme ground and read it: the swash capitals stay legible at 17 px. Measured widths (real fonts): title 105 px, ending at x 117; labels in Georgia 12 px: Notepad 46, Terminal 51, Calculator 55, Browser 45 px; banner lines in Georgia Italic 12 px: 250, 172, 194, 171, 194 px against a 364 px box. Expected `fontsRendered`: `Gabriola, Georgia` (regular and italic). **Cyrillic:** no Cyrillic text in this theme; Georgia and Gabriola both contain U+0416 (checked with negative controls), so Cyrillic tile names render in a serif.

### 7.3 Art (redraw). Static, original, inline SVG data URIs and gradients

Delete: the two current SVGs (the almanac panno and the grain), the parchment lines and gradients in `#app::after`, the ghost readout, header text, edit-bar text, pollen `#particles`, the `#app` hearth animation (0.3).

**A. Window shape and warm wash.** `--app-clip` and `--overlay-clip`: `inset(0 round 14px)` (a rounded window; the title starts at (12,10) and the fullscreen button's corner at (412,8) are both inside the arc, and the top-right corner arc centre (410,14) is 6.3 px from that button corner). `#app::after { background: linear-gradient(to bottom, transparent 45%, rgba(107,74,43,0.35) 100%); }`: a static brown wash in the lower half; nothing else on that layer (no grain).

**B. Timber-plank frame in the three bands, `#grid-container` background (does not scroll, under the tiles).** P is the container's padding-box right edge (window width minus the 4 px scrollbar), Hc the container height; container-relative. Layers, top to bottom in the `background` list:
1. Vine ticks on the top strip: `url(svg) left 1px top 1px / 53px 10px repeat-x`. SVG `viewBox="0 0 53 10"`: vine path `M0 5 C7 1 13 9 20 5 S33 1 40 5 S49 9 53 5` stroke `#9DC96A` 1 px, no fill; three leaves, ellipses rx 2.6, ry 1.3: at (10,3) rotated -30 degrees, fill `#9DC96A`; at (30,7) rotated 30 degrees, fill `#7FAF52`; at (46,3.2) rotated -25 degrees with rx 2.2, ry 1.1, fill `#9DC96A`. (Tiles every 53 px: about 8 across at 424 wide. The tile starts at x 1 so the path joins at y 5 at both ends.)
2. Nails, `#3A2812`, radius 1.2 px, on each strip's centre line every 40 px: left strip `radial-gradient(circle at 50% 50%, #3A2812 0 1.2px, transparent 1.6px) left 1px top 14px / 10px 40px repeat-y` limited to the strip by layer 3; right strip the same with `right 1px top 14px`; top strip `... left 14px top 1px / 40px 10px repeat-x`. If limiting the repeat to a strip is awkward, draw the nails inside the strip SVGs of layer 3 instead (same positions).
3. Plank seams `#4A3219`, 1 px: left `left 6px top 1px / 1px calc(100% - 1px)`; right `right 6px top 1px / 1px calc(100% - 1px)`; top `left 1px top 6px / calc(100% - 2px) 1px`. Each is a `linear-gradient(#4A3219,#4A3219)` no-repeat.
4. Wood fill `#6B4A2B`: left strip `left 1px top 1px / 10px calc(100% - 1px)`; right strip `right 1px top 1px / 10px calc(100% - 1px)`; top strip `left 1px top 1px / calc(100% - 2px) 10px`. Each a `linear-gradient(#6B4A2B,#6B4A2B)` no-repeat.
Resulting rectangles at 424x300 (P = 420): left plank x 1 to 11, right plank x 409 to 419, top plank y 41 to 51 (window), seams at x 6, x 414 and y 46. **Clearance:** left plank ends 1 px before the keep-out edge (x 12); right plank starts at x 409, 1 px past the keep-out edge (x 408); top plank ends at y 51, 1 px above the keep-out (y 52), 5 px above the first tile row. If the right plank sits 4 px further right than listed after the first run, the scrollbar is not excluded from the padding box: shift the right layers' `right` offsets by 4 (no design effect). The inner corners stay square: rounding them would put art inside the keep-out.

**C. Header art (HZ), a round door in a hill, `#header::after`.** `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; background:url(svg) no-repeat 0 0 / 84px 20px; pointer-events:none;` Hidden with `#header:has(#filter-chip:not(.hidden))::after { display:none }`. SVG `viewBox="0 0 84 20"`, no background:
- Hill: path `M2 20 Q42 -6 82 20 Z`, fill `#35501F` (a soft mound; its top is at y 7).
- Door: circle cx 42, cy 14, r 6, fill `#3E6B2B`, stroke `#6B4A2B` 1.8 (the round frame); two plank seams, vertical lines x 39.5 and x 44.5 from y 8 to y 20, stroke `#2E5220` 0.8, clipped to the door circle with a `clipPath`; brass knob: circle cx 42, cy 14, r 1.5, fill `#D4A24C`.
- Everything is curved; opacity 1. A generic round door, no film art.

**D. Header treatment.** `#header::before` (2 px left bar): green `--accent-c` with no glow (base rule). `#header { border-bottom-color: #6B4A2B; }` (a wooden rule).

**E. Banner: a wooden sign with a smoke-ring icon.**
- `#theme-banner { background: linear-gradient(#3A2812,#3A2812) 0 8px / 100% 1px no-repeat, linear-gradient(#3A2812,#3A2812) 0 36px / 100% 1px no-repeat, #4A3219; border-top:2px solid #6B4A2B; z-index:250; }` (two plank seams at banner y 8 and 36; the text sits at y 17 to 29, so both seams are at least 8 px clear; the z-index keeps the brown wash off the sign).
- **Icon, `#theme-banner::before`:** `content:''; width:22px; height:22px; font-size:0; opacity:1; background:url(svg) center / 22px 22px no-repeat;` SVG `viewBox="0 0 22 22"`, three smoke rings rising, all no fill, stroke `#D8D0B8` 1.3 px: ellipse (11,17) rx 8, ry 3, opacity 0.95; ellipse (11,10.5) rx 6, ry 2.4, opacity 0.65; ellipse (11,5) rx 4, ry 1.8, opacity 0.4.
- **Banner strings** (`THEME_BANNERS['shire']`, replaces all five; all five are Tolkien lines; sentence case, Georgia italic 12 px, 0.3 px tracking):
  1. `In a hole in the ground there lived a hobbit.` (250 px)
  2. `What about second breakfast?` (172 px)
  3. `Home is behind, the world ahead.` (194 px)
  4. `The road goes ever on and on.` (171 px)
  5. `Not all those who wander are lost.` (194 px)
  Each fits one line with at least 114 px spare.

**Safe zones:** tile field empty of art (a brown wash only). The three plank bands sit outside the keep-out. Header art x 168 to 252 (title ends x 117). The sign and icon live in the banner. Nothing touches a tile, label, chip or button.

### 7.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `shire-dawn 10s` | `#title` colour, text-shadow, opacity (cream flash at 88 percent) **(tier 2)** | removed |
| 2 | `banner-pulse 6s` | `#theme-banner::before` opacity **(tier 1)** | removed |
| 3 | `shire-almanac 10s` | `#grid-container::before` opacity **(tier 1)** | removed with the almanac |
| 4 | `shire-readout 10s` | `#grid-container::after` colour **(tier 2)** | removed |
| 5 | `shire-hearth 10s` | `#app` box-shadow (incl. white flash) **(tier 5)** | removed |
| 6 | `shire-motes 5s ease-in-out` | `#particles` opacity (full window) **(tier 1)** | removed |
| hover | `tile-radial .55s` one-shot | `.app-tile:hover::before` **(tier 1)** | removed (no ring) |

**Before 6, after 0.** Calm and warm; nothing moves. `entrance-fade 0.8s` one-shot only.

### 7.5 Tiles, hover, selected, filter, banner

- **Tile at rest (a recessed round-cornered pocket):** `.app-tile { background:#1C2312; border-color:#3F4A24; border-radius:14px; }` and `.app-tile::before { display:none; }`. `--radius` (buttons, inputs, chip) is 8 px. Border stays 1 px; layout unchanged.
- **Icon plate (soft pebble, keeps the glyph):** `--tile-icon-shape: inset(0 round 18px)`. Margins to the mock glyphs (px in a 64 px plate): Notepad 12, Calculator 9.9, Paint 11, Terminal 9.1, Browser 11.5, Files 10.7 (smallest 9.1 px, all positive). The old 12-point leaf cropped glyph edges.
- **Hover:** fill `#2F2513` (warm brown), border leaf green `#5B8C3A` (3.77:1 on the fill); no shadow, no transform.
- **Selected (focus-visible):** hover plus a **gold** outline: `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }` and `.app-tile:focus-visible { outline-color:#D4A24C; }` (gold ring 2 px at offset 2, 5.94:1 on the tile ground).
- **Pressed:** base scale 0.96 on `#2F2513`.
- **Label:** `.tile-label { font-family:Georgia,'Times New Roman',serif; }` parchment `#F1E6C8`, roman, no halo.
- **Title:** `#title { font-family:Gabriola,Georgia,serif; font-size:17px; line-height:1; font-weight:400; letter-spacing:1px; color:#D4A24C; text-shadow:none; }` (gold, 6.35:1 on the header); the dot stays `--accent-m` brick text `#E27A54` (5.00:1).
- **Filter chip:** base rule (fill `--tile-hover-bg`, green border, light-green text; ratio in the table). Header art hides while it shows.
- **Banner text:** `#theme-banner-text { font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:12px; letter-spacing:0.3px; color:#F1E6C8; }`.
- **Edit bar:** dark brick fill `#3A1A10`, brick rule, brick-text label (5.35:1). No quote.
- **Settings overlay:** opaque `#1F2614`, panel `#262E18`, light-green values, green sliders and checkboxes. Rounded window shape applies to the overlay too.
- **Update banner:** gold on dark brown.

### 7.6 Done when

1. The window has 14 px rounded corners; a brown wooden frame (about 10 px) borders the tile field on the left, right and top, with small green vine ticks along the top plank; tiles sit clear of it in the default and scrolled states.
2. Header: a green door in a mound at x 168 to 252, a gold Gabriola title (larger than the other themes' titles, still on one line), a wooden rule under the header; typing a letter hides the door and shows the chip.
3. Tiles are rounded pockets with pebble-shaped icon plates; all six glyphs whole (no cropped corners).
4. Banner: a brown wooden sign with two faint seams, a smoke-ring icon at the left, a one-line parchment italic Tolkien quote (`scrollWidth <= clientWidth`).
5. Hover shot: CALCULATOR tile shows a green border and a warm-brown fill; **focus** (Tab) shows a gold ring around it.
6. Lower half of the window is warmer/browner than the top; no visible texture on the tiles.
7. `npm run check:contrast` passes, no rebaseline; `loopingAnimationsAtCapture` 0 (was 6); `grep -c infinite` 0; no `\A` escapes.
8. Hidden-tiles shot: sigma about 2 or less (a gradient wash only).
9. `fontsRendered` lists Gabriola and Georgia.
10. 640x420 and 1024x700: frame planks stay 10 px wide and follow the container edges; the round door does not scale.


---

## 8. dead-space (DEAD SPACE): DONE

**Audit:** score 2, redraw. An all-orange scan-lined screen; the RIG is blue hologram over grey industrial with amber only for warnings. A ship schematic runs a hull rectangle through the label row, scanlines band the icons, a skull banner icon, and the top-right 36 px cut slices the fullscreen button.
**Direction:** the RIG suit interface. Near-black grey-blue hull, RIG holographic blue as the accent, amber only for warnings and edit mode, a static segmented blue spine down the left of the tile field (the suit's health gauge), a stencilled amber warning strip in the header, and a bulkhead door in the banner. Octagon plates, no scanlines, no schematic, no skull, no motion beyond the hover scan sweep it already has.

### 8.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  --overlay-clip: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  --bg: #0A0C10;
  --panel-bg: #10141A;
  --overlay-bg: #0A0C10;
  --header-bg: #0E1218;
  --font: Bahnschrift, 'Segoe UI', sans-serif;
  --text: #D0D8E0;
  --text-dim: #8E9BAA;
  --accent-c: #3AB4E8;
  --accent-m: #E8A020;
  --accent-y: #E8A020;
  --accent-text: #3AB4E8;
  --border: #2A3038;
  --border-h: #3AB4E8;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 2px #3AB4E8;
  --title-anim: none;
  --tile-hover-bg: #0F2230;
  --tile-hover-border: #3AB4E8;
  --tile-hover-shadow: inset 0 0 0 1px #1F5A78;
  --tile-active-bg: #0F2230;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: contrast(1.05) saturate(0.9);
  --tile-icon-shape: polygon(12% 0, 88% 0, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0 88%, 0 12%);
  --tile-label-spacing: 1.5px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #0F2230;
  --btn-active-bg: #0F2230;
  --drop-hint-border: #3A4450;
  --drop-icon-color: #7A8794;
  --hint-sub-color: #8E9BAA;
  --rename-dashed: #3AB4E8;
  --rename-input-bg: #0F2230;
  --edit-bar-bg: #2A1A08;
  --edit-bar-border: #E8A020;
  --edit-label-color: #E8A020;
  --edit-label-glow: none;
  --btn-done-color: #E8A020;
  --btn-done-border: #E8A020;
  --btn-done-hover-bg: #3F2A0C;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A8794;
  --update-bg: #2A1A08;
  --update-border: #E8A020;
  --update-color: #E8A020;
  --update-btn-border: #E8A020;
  --update-btn-hover-bg: #3F2A0C;
  --update-btn-hover-glow: none;
  --btn-close-color: #E8A020;
  --btn-close-border: #E8A020;
  --btn-close-hover-bg: #3F2A0C;
  --btn-close-hover-glow: none;
  --picker-search-bg: #0F2230;
  --picker-item-hover-bg: #0F2230;
  --picker-item-active-bg: #0F2230;
  --picker-placeholder-bg: #0F2230;
  --skin-btn-active-bg: #0F2230;
  --remove-btn-bg: #A01818;
  --remove-btn-border: #E8A020;
}
```
Notes: `--glow-*` are `none` (the RIG is a flat projected hologram, not a neon glow). RIG blue `#3AB4E8` is the accent and the ring; amber `#E8A020` is used only for warnings and edit mode (the header stencil, the edit bar, the update bar, CLOSE, error text); the necromorph red `#A01818` is only the remove-button fill. The old top-right 36 px cut is replaced by a 14 px cut (0.1.7).

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#D0D8E0` on `#0A0C10` | 4.5:1 | **13.59:1** |
| --text-dim on --bg | `#8E9BAA` on `#0A0C10` | 4.5:1 | **6.91:1** |
| --accent-c on --bg | `#3AB4E8` on `#0A0C10` | 3:1 | **8.27:1** |
| --accent-text on --bg | `#3AB4E8` on `#0A0C10` | 3:1 | **8.27:1** |
| --hint-sub-color on --bg | `#8E9BAA` on `#0A0C10` | 4.5:1 | **6.91:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#D0D8E0` on `#10141A` | 4.5:1 | **12.82:1** |
| Tile label on tile hover fill | `#D0D8E0` on `#0F2230` | 4.5:1 | **11.29:1** |
| Title (accent-text) on header | `#3AB4E8` on `#0E1218` | 4.5:1 | **7.93:1** |
| Title dot (text override) on header | `#D0D8E0` on `#0E1218` | 4.5:1 | **13.04:1** |
| Header version (text-dim) on header | `#8E9BAA` on `#0E1218` | 4.5:1 | **6.63:1** |
| Header button glyph (text) on header | `#D0D8E0` on `#0E1218` | 4.5:1 | **13.04:1** |
| Header button glyph on button hover fill | `#D0D8E0` on `#0F2230` | 4.5:1 | **11.29:1** |
| Filter chip text on chip fill (#0F2230) | `#3AB4E8` on `#0F2230` | 4.5:1 | **6.87:1** |
| Banner text on banner (panel-bg) | `#D0D8E0` on `#10141A` | 4.5:1 | **12.82:1** |
| Edit label on edit bar | `#E8A020` on `#2A1A08` | 4.5:1 | **7.59:1** |
| Done / close text on edit bar | `#E8A020` on `#2A1A08` | 4.5:1 | **7.59:1** |
| + FILE / + INSTALLED text on edit bar | `#D0D8E0` on `#2A1A08` | 4.5:1 | **11.67:1** |
| Done text on its hover fill | `#E8A020` on `#3F2A0C` | 4.5:1 | **6.12:1** |
| Settings text on overlay | `#D0D8E0` on `#0A0C10` | 4.5:1 | **13.59:1** |
| Settings text on panel | `#D0D8E0` on `#10141A` | 4.5:1 | **12.82:1** |
| Settings label (text-dim) on panel | `#8E9BAA` on `#10141A` | 4.5:1 | **6.53:1** |
| Settings value / cheat key (accent-text) on panel | `#3AB4E8` on `#10141A` | 4.5:1 | **7.80:1** |
| Settings CLOSE text on panel | `#E8A020` on `#10141A` | 4.5:1 | **8.34:1** |
| Hotkey error text (accent-m) on panel | `#E8A020` on `#10141A` | 4.5:1 | **8.34:1** |
| Hotkey input text on input fill | `#3AB4E8` on `#0F2230` | 4.5:1 | **6.87:1** |
| Picker row text on hover fill | `#D0D8E0` on `#0F2230` | 4.5:1 | **11.29:1** |
| Update banner text on update bar | `#E8A020` on `#2A1A08` | 4.5:1 | **7.59:1** |
| Update button text on hover fill | `#E8A020` on `#3F2A0C` | 4.5:1 | **6.12:1** |
| Drop-hint text (text-dim) on grid ground | `#8E9BAA` on `#0A0C10` | 4.5:1 | **6.91:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A01818` | 3.0:1 | **7.96:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#3AB4E8` on `#10141A` | 3.0:1 | **7.80:1** |
| Focus ring on grid ground (non-text) | `#3AB4E8` on `#0A0C10` | 3.0:1 | **8.27:1** |
| Hover border on grid ground (non-text) | `#3AB4E8` on `#0A0C10` | 3.0:1 | **8.27:1** |
| Hover border on hover fill (non-text) | `#3AB4E8` on `#0F2230` | 3.0:1 | **6.87:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#3AB4E8` on `#0F2230` | 4.5:1 | **6.87:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#3AB4E8` on `#0F2230` | 4.5:1 | **6.87:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#3AB4E8` on `#0F2230` | 4.5:1 | **6.87:1** |
| Picker / skin search input text (accent-text) on search fill | `#3AB4E8` on `#0F2230` | 4.5:1 | **6.87:1** |
| Rename / hotkey input text (accent-text) on input fill | `#3AB4E8` on `#0F2230` | 4.5:1 | **6.87:1** |
| Search placeholder (text-dim) on search fill | `#8E9BAA` on `#0F2230` | 4.5:1 | **5.74:1** |
| Hotkey recording text (accent-m) on input fill | `#E8A020` on `#0F2230` | 4.5:1 | **7.34:1** |
| Update dismiss glyph (text-dim) on update bar | `#8E9BAA` on `#2A1A08` | 4.5:1 | **5.94:1** |

**Lowest ratio in this theme: 5.74:1 (Search placeholder (text-dim) on search fill).** Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, tile ground `#10141A`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5C7EA3` | `#10141A` | 4.37:1 | pass |
| Calculator `#6b6f76` | `#6A6E75` | `#10141A` | 3.61:1 | pass |
| Paint `#b07a4f` | `#AD7B52` | `#10141A` | 5.04:1 | pass |
| Terminal `#3d4450` | `#3B414D` | `#10141A` | 1.80:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#528A8B` | `#10141A` | 4.72:1 | pass |
| Files `#c09a3e` | `#BF9B45` | `#10141A` | 7.03:1 | pass |

Lowest non-Terminal icon ratio: **3.61:1** (pass). Terminal is 1.80:1 on the rest ground and 1.59:1 on the hover fill (mock art; the fx does not darken it). The second table repeats the icon check on the hover fill.

Icons on the hover fill `#0F2230`: lowest non-Terminal plate **3.17:1**; on the pressed fill `#0F2230`: **3.17:1** (both pass; the hover and pressed fills were chosen dark enough for the mid-grey Calculator plate to stay at 3:1 or better).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` are opaque, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; over-white check n/a.


**Icon plates on the hover fill (`#0F2230`):**

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5C7EA3` | `#0F2230` | 3.85:1 | pass |
| Calculator `#6b6f76` | `#6A6E75` | `#0F2230` | 3.17:1 | pass |
| Paint `#b07a4f` | `#AD7B52` | `#0F2230` | 4.44:1 | pass |
| Terminal `#3d4450` | `#3B414D` | `#0F2230` | 1.59:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#528A8B` | `#0F2230` | 4.15:1 | pass |
| Files `#c09a3e` | `#BF9B45` | `#0F2230` | 6.18:1 | pass |

Lowest non-Terminal icon ratio on the hover fill: **3.17:1** (pass).

### 8.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `Bahnschrift, 'Segoe UI', sans-serif` | 400 (base) | base | base | base |
| `#title` | same | 600 (SemiBold), normal width | 11 px (base) | 1.5px | uppercase (markup) |
| `.tile-label` | same | 600 (`--tile-label-weight`), normal width | 12 px (base) | 1.5px | uppercase (`--tile-label-transform`) |
| `#theme-banner-text` | same | 600, normal width | 11 px (base) | 1.5px | uppercase strings, as written below |

This theme uses Bahnschrift at **normal width**, so it does not depend on the `font-stretch` question raised in the cyberpunk section. Measured with the real font (weight 600, width 100): the title is 94 px wide, ending at x 106; labels at 12 px, 1.5 px tracking: NOTEPAD 62, TERMINAL 68, BROWSER 66, CALCULATOR 89 px, all within the 100 px box ("SPREADSHEET EDITOR", 150 px, ellipsizes as today); banner lines 110 and 141 px against 364 px. Expected `fontsRendered`: `Bahnschrift`. **Cyrillic:** no Cyrillic text in this theme; Bahnschrift and Segoe UI contain U+0416 (checked with negative controls).

### 8.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the four current SVGs (Ishimura blueprint, grain, two debris tiles), the hull-grid and scanline layers in `#app::after`, the `#app` orange left border and its animated shadow, the `.overlay-panel` orange border, the `#theme-banner` left border, the ghost readout, header text, edit-bar text, debris `#particles`, the `#header::before` strobe (0.3).

**A. Window shape.** `--app-clip` and `--overlay-clip`: `polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)` (a top-right shear, 14 px instead of 36; the cut line is x - y = 410 and the fullscreen button's corner (412,8) is at x - y = 404, so it sits inside the line by 6 px along x, about 4 px perpendicular, and the button is whole; the old 36 px cut sliced it). `.overlay-panel { border-left:3px solid #3AB4E8; box-shadow:none; }` (RIG blue instead of orange; the 3 px is what the old panel already took).

**B. Left-edge light on `#app::after`** (full window, above tiles): `background: linear-gradient(to right, rgba(58,180,232,0.05), transparent 12%);` (a faint blue spill from the spine; nothing else on that layer). It only tints the outer edge of the first column.

**C. The RIG spine, `#grid-container` background (does not scroll, under the tiles, in FZ-L).** One layer: `url(svg) 3px 0 / 5px 15px no-repeat space`. SVG `viewBox="0 0 5 15"`: one rectangle x 0, y 0, width 5, height 12, fill `#3AB4E8` (a 12 px segment plus a 3 px gap). `no-repeat space` repeats the tile vertically only, in whole tiles with the spare space shared between them, so the bar never ends in a cropped segment and needs no known height. At 424x300 the container is 216 px tall: 14 segments (14 x 15 = 210), gap about 3.5 px, spanning window y 40 to 253, at x 3 to 8. The bar is inside FZ-L (x 1 to 11): 4 px clear of the keep-out edge (x 12). It is static, flat, and does not glow. At other window heights it adds or drops whole segments.

**D. Header art (HZ), stencilled warnings, `#header::after`.** `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; background:url(svg) no-repeat 0 0 / 84px 20px; pointer-events:none;` Hidden with `#header:has(#filter-chip:not(.hidden))::after { display:none }`. SVG `viewBox="0 0 84 20"`, everything `#E8A020` (amber, because it is a warning), shapes only, no text:
- Warning triangle: polygon (12,2.5) (21.5,18) (2.5,18), no fill, stroke 1.6, round joins. Exclamation: rectangle x 11.1, y 7.5, width 1.8, height 5.5, filled; dot: circle cx 12, cy 15.4, r 1, filled.
- Two hazard slashes, filled parallelograms: polygon (30,3) (36,3) (30,17) (24,17), and polygon (44,3) (50,3) (44,17) (38,17).
- A broken stencil bar, three filled rectangles at y 8, height 4: x 56 (width 10), x 68 (width 10), x 80 (width 3.5).
- Opacity 1. `#header::before` (2 px left bar): `background:#3AB4E8; box-shadow:none`.

**E. Banner: bulkhead door icon.** `#theme-banner { border-left:0; }` (fill stays base `--panel-bg` `#10141A`, top rule base `--border`). **Icon, `#theme-banner::before`:** `content:''; width:22px; height:22px; font-size:0; opacity:1; background:url(svg) center / 22px 22px no-repeat;` SVG `viewBox="0 0 22 22"`, all `#3AB4E8`: door frame rectangle x 4, y 2, width 14, height 18, rx 2, no fill, stroke 1.5; centre seam line (11,2)-(11,20), stroke 1.2; status light rectangle x 7, y 4.5, width 8, height 1.6, filled; two handle bars, rectangles x 8.2 and x 12.2, y 11, width 1.6, height 4, filled. (A generic sliding door; the skull is gone.)
- **Banner strings** (`THEME_BANNERS['dead-space']`, replaces all five; the removed lines were not verifiable quotes; two are kept):
  1. `MAKE US WHOLE.` (the Unitologist chant, in the game)
  2. `CUT OFF THEIR LIMBS.` (the game's dismemberment instruction)
  Widths in Bahnschrift 600, 11 px, 1.5 px tracking: 110 and 141 px against 364 px. **Flag for Sergei:** I could offer only two lines I am sure of; a third is welcome if he knows one, and line 2 can be dropped if he wants only the chant. I did not invent a third.

**Safe zones:** tile field empty of art (a 5 percent blue spill at the outer edge of column 1 only). Spine in FZ-L. Header art x 168 to 252. Icon in the banner slot. No motif touches a tile, label, chip or button.

### 8.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `ds-pulse 3.5s` | `#title` text-shadow, opacity **(tier 2)** | removed |
| 2 | `banner-throb 3.5s` | `#theme-banner::before` transform, opacity **(tier 1)** | removed |
| 3 | `ds-schematic 12s` | `#grid-container::before` opacity (incl. blackout) **(tier 1)** | removed with the blueprint |
| 4 | `ds-readout 11s` | `#grid-container::after` opacity **(tier 1)** | removed |
| 5 | `ds-rig-monitor 9s` | `#app` box-shadow (incl. blue flash) **(tier 5)** | removed |
| 6 | `hdr-bar-strobe 8s steps(1)` | `#header::before` filter **(tier 3)** | removed |
| 7 | `ds-zerog-drift 20s linear` | `#particles` background-position (2 layers, full window) **(tier 4)** | removed |
| hover | `tile-scan-v .5s ease-in forwards` (one-shot) | `.app-tile:hover::before` top, opacity **(tier 1)** | **kept as today** (not infinite): the RIG scan bar sweeps once down a hovered tile in `--tile-hover-border` blue |

**Before 7, after 0.** The one-shot hover sweep is unchanged in cost and is on-brand; it is not counted (it does not run at capture). `entrance-fade 0.8s` one-shot for entrance (`entrance-flash` retired).

### 8.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `.app-tile { background:#10141A; border-color:#2A3038; }`. Then the hover sweep: `.app-tile::before { width:100%; height:3px; left:0; top:-3px; transform:none; background:var(--tile-hover-border); }` and `.app-tile:hover::before { animation:tile-scan-v .5s ease-in forwards; }` (as today). 2 px radius; border 1 px; layout unchanged.
- **Icon plate (octagon, keeps the glyph):** `--tile-icon-shape: polygon(12% 0, 88% 0, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0 88%, 0 12%)` (a 12 percent cut; the old 15 percent one was close to the glyph corners). Margins to the mock glyphs (px in a 64 px plate): Notepad 12.0, Calculator 10.0, Paint 11.0, Terminal 10.0, Browser 11.5, Files 11.0 (smallest 10.0 px, all positive).
- **Hover:** fill `#0F2230` (a blue-tinted dark), border RIG blue `#3AB4E8`, an inner hairline `inset 0 0 0 1px #1F5A78`, plus the one-shot scan bar. No glow, no transform.
- **Selected (focus-visible):** hover plus the base 2 px blue outline at offset 2 (7.80:1 on the tile ground): `.app-tile:hover, .app-tile:focus-visible { background:var(--tile-hover-bg); border-color:var(--tile-hover-border); box-shadow:var(--tile-hover-shadow); }`.
- **Pressed:** base scale 0.96 on `#0F2230` (same fill as hover, so icons stay at 3:1 or better while pressed).
- **Label:** `.tile-label { font-family:Bahnschrift,'Segoe UI',sans-serif; }` `#D0D8E0`, uppercase, 1.5 px tracking, no halo.
- **Title:** `#title { font-family:Bahnschrift,'Segoe UI',sans-serif; font-weight:600; letter-spacing:1.5px; text-shadow:none; }` blue `--accent-text`; `#title .accent { color:#D0D8E0; }` (the dot stays neutral so amber remains warnings-only; 13.04:1).
- **Filter chip:** base rule (fill `#0F2230`, blue border, blue text 6.87:1). Header art hides while it shows.
- **Banner text:** `#theme-banner-text { font-family:Bahnschrift,'Segoe UI',sans-serif; font-weight:600; letter-spacing:1.5px; color:#D0D8E0; }`.
- **Edit bar:** dark amber fill `#2A1A08`, amber rule, amber label (7.59:1). No quote.
- **Settings overlay:** opaque `#0A0C10`, panel `#10141A`, blue values, blue sliders and checkboxes, a 3 px blue left rule on the panel, top-right shear 14 px.
- **Update banner:** amber on dark amber (7.59:1).

### 8.6 Done when

1. The top-right corner is cut by 14 px and the fullscreen button is fully visible (it is sliced in today's shot).
2. A segmented vertical blue bar (about 14 segments with equal small gaps, none cropped) runs down the left band at x 3 to 8 from the header to the banner; the tiles start clear of it.
3. No horizontal banding on any icon (adjacent pixel rows in a plate differ by at most 6 levels); each plate is an octagon with all six glyphs whole.
4. Header: an amber warning triangle, two slashes and a broken bar at x 168 to 252, nothing under the buttons; typing a letter hides them and shows the chip.
5. Banner: a blue door outline at the left (no skull), a one-line pale quote (`scrollWidth <= clientWidth`); no orange anywhere in the grid shot except the header stencil.
6. Hover shot: CALCULATOR tile has a blue border, a dark-blue fill and a thin inner line; the scan bar is transient (captured mid-sweep or absent).
7. `npm run check:contrast` passes, no rebaseline; `loopingAnimationsAtCapture` 0 (was 7); `grep -c infinite` 0 (the hover sweep is not infinite); no `\A` escapes.
8. Hidden-tiles shot: sigma about 1 or less (a 5 percent blue spill at the left edge only).
9. `fontsRendered` lists Bahnschrift.
10. 640x420 and 1024x700: the spine gains or loses whole segments and never crops one; the shear stays 14 px.


---

## 9. Fonts that would lift this batch (for Sergei's morning decision; nothing downloaded, nothing used)

Rule: this batch uses stock Windows fonts only (audit C2). Every font below is free-licensed; licence and Cyrillic coverage are from Makoto's font licence check (`Team/Research/QuickLaunch_ThemeReferences_2026-09-29.md`, checked against the google/fonts repository on 2026-09-29). File name and file size are not in that table and I downloaded nothing, so Ender reads them from the repository page after Sergei says yes. Each bundling needs Sergei's per-file OK, and the OFL text must ship with any redistributed file. Ranked by how much the batch gains:

| Rank | Font | Licence | Cyrillic | Theme it lifts | What it replaces | Expected gain | Source |
|---|---|---|---|---|---|---|---|
| 1 | Dela Gothic One | SIL OFL 1.1 | yes | promise-mascot | Arial Black title (and optionally the labels) | High: the title is the poster; Showa signage weight | https://github.com/google/fonts/tree/main/ofl/delagothicone |
| 2 | Jost | SIL OFL 1.1 | yes | 2001 | Segoe UI Semilight title, labels and banner | Medium to high: a Futura-like geometric sans is what Kubrick's title cards use; Segoe is generic | https://github.com/google/fonts/tree/main/ofl/jost |
| 3 | Rajdhani (or Chakra Petch) | SIL OFL 1.1 | no | cyberpunk (and dead-space) | Bahnschrift Condensed / SemiBold | Medium: closer to the game's cut-corner caps; Bahnschrift is already near. Neither has Cyrillic, so Cyrillic tile names fall back to Bahnschrift | https://github.com/google/fonts/tree/main/ofl/rajdhani and https://github.com/google/fonts/tree/main/ofl/chakrapetch |
| 4 | Cinzel | SIL OFL 1.1 | no | gryffindor | Palatino Linotype bold title | Medium: gilt capitals; it also serves the audit's Warhammer, AC, Diablo and later Harry Potter themes, so bundling it pays across batches | https://github.com/google/fonts/tree/main/ofl/cinzel |
| 5 | Playfair Display (heavy weights) or Libre Bodoni | SIL OFL 1.1 | Playfair yes, Libre Bodoni no | stranger-things | Georgia Bold title | Low to medium: neither is Benguiat (proprietary, never suggested); a heavy Bodoni-style face is Makoto's closest free match | https://github.com/google/fonts/tree/main/ofl/playfairdisplay and https://github.com/google/fonts/tree/main/ofl/librebodoni |
| 6 | Oxanium | SIL OFL 1.1 | no | dead-space | Bahnschrift SemiBold | Low to medium: sleeker sci-fi caps; Bahnschrift already reads well | https://github.com/google/fonts/tree/main/ofl/oxanium |
| 7 | Bowlby One | SIL OFL 1.1 | no | persona-4 | Arial Black title | Low: Arial Black is within one point of it | https://github.com/google/fonts/tree/main/ofl/bowlbyone |

No font is needed for **shire** (Gabriola is a good storybook stand-in). If Sergei approves only one file, take **Dela Gothic One** (it changes the most visible pixels and has Cyrillic); if two, add **Jost**. With those two the batch's title-level type is within one step of the source look everywhere except cyberpunk and gryffindor, which still read well on Bahnschrift and Palatino.

---

## 10. Summary

- **Eight sections written**, one per theme, each with a final `:root` block, computed contrast tables (gate, add-on and generic), icon checks on rest, hover and pressed fills, type with measured widths, art as shapes with coordinates, a motion table with before and after counts, tile, hover, selected, filter and banner rules, and a "Done when" list.
- **Infinite animations: 50 to 2** across the batch (promise-mascot 6 to 0, persona-4 6 to 0, gryffindor 6 to 0, 2001 6 to 0, cyberpunk 7 to 1, stranger-things 6 to 1, shire 6 to 0, dead-space 7 to 0). No `#app` box-shadow, no full-window `background-position`, no `clip-path` animation remains.
- **Contrast:** every pair clears its threshold. Lowest text pair **4.60:1** (stranger-things, red input text on its fill, needs 4.5); lowest overall **3.35:1** (stranger-things, the red hover border against the blue hover fill, a non-text pair that needs 3). Lowest gate margin: promise-mascot's `--text-dim` at 5.81:1 (needs 4.5), then shire's `--accent-c` at 3.91:1 (needs 3).
- **Overlaps:** none by construction. Art lives only in the header zone, the three frame bands, the banner and the icon slot, all measured; the header art hides while the filter chip shows; frame art is under the tiles and does not scroll.
- **Bugs found on the way (not fixed, not in this batch's scope):** dead-space's 36 px cut slices the fullscreen button (fixed by this spec in dead-space only); the audit's settings-overlay cut-off still applies to every theme; the `#header::after` `right:135px` base rule still overlaps the first button for any theme not replaced here.

---

## 11. Open items (things I could not resolve or verify here)

Nothing was launched, so each of these has a verify step in the sections above; none blocks implementation.

1. **Grain sigma** (promise-mascot) is specified with a starting matrix and a tuning rule, not a proven final alpha (0.6).
2. **Bahnschrift `font-stretch`** (cyberpunk) may not reach the width axis in this Chromium; everything fits either way and the after-run measures which happened (0.9, cyberpunk 5.6).
3. **Background reference edge P** (0.1.13): the right-hand frame layers assume the scrollbar is outside the padding box. Ender checks the pixel x of one right-hand rule and shifts by 4 px if needed.
4. **`background-repeat: no-repeat space`** (dead-space spine) is standard but I have not seen it render in this Electron; the fallback is `repeat-y` with a 15 px tile, accepting a cropped last segment.
5. **Text widths** were computed with the real font files but without kerning (about 3 percent tolerance). Ender confirms `scrollWidth <= clientWidth` for every banner string and reports the title's right edge.
6. **Icon contrast** is measured on the gallery's mock plates. Real app icons vary, so a pale or dark real icon can still sit under 3:1; the theme never darkens icons in a dark theme and lightens none, so it cannot make that worse. The Terminal mock plate is 1.7:1 to 2.0:1 in every dark theme before and after (its own art).
7. **Banner lines are from my own recall and were not source-checked** (no lookup was made). Least certain: cyberpunk "Welcome to Night City." (a recognisable phrase, not a verified quote), dead-space "Cut off their limbs." (the game's well-known instruction), gryffindor "Help will always be given at Hogwarts to those who ask for it." Strike any Sergei or Makoto cannot confirm; every theme still has at least two lines. The promise-mascot lines are neutral in-tone labels by the audit's own ruling (section 4), which conflicts with H3's "real quotes only"; I followed the ruling.
8. **Dead-space has only two banner lines**, because I would not invent a third.
9. **Palette hexes** in the audit are Makoto's approximations. Where a text role failed AA I added a lighter text tint and kept the source colour for fills and borders (promise-mascot pink, persona-4 rain blue and orange, gryffindor red, cyberpunk red, stranger-things red, shire green and brick). The departures are listed in 0.10.
10. **`:has()`** hides the header art while the chip shows. Chromium 128 supports it; Ender checks by typing a letter.
11. **The banner's `z-index: 250`** (promise-mascot, gryffindor, shire; it keeps the texture layer off the strip) also hides the 1 px window border (`#app::before`, z-index 200) along the banner's left, right and bottom edges. Cosmetic; if Sergei notices, drop the z-index and accept texture over the strip, or give the strip its own 1 px border colour.


---

## 12. Review 1 (2026-09-30)

Judy, red-team of Ender's batch-1 implementation (8 theme CSS files, uncommitted, branch `wip/theme-fidelity`). Read: the 9 comparison images (batch sheet plus 8 per-theme sheets), the raw `after-b01` grid shots (header and banner bands cropped and enlarged 2x), all 8 CSS files, `base.css` (`#header`, `#app::before/::after`, `#theme-banner`, `.theme-search`, `.accent`), `THEME_BANNERS` in `app.js`, and the web for banner sources. Nothing launched. Only this file written. `app.js` is still unedited (the banner text in the images is the old text, which is why gryffindor still shows "STAND UP T...").

Ender's implementation follows the spec closely and the frame art, palettes, tile states and contrast all hold up. What is left is a short list of real defects, one stacking problem, and a squint-test result the coordinator asked me to add: several themes are clean but read as "dark grid, small motif".

### 12.0 Verdict per theme

Squint test = cover the title and the banner text; would a fan name the franchise from what is left? Score 1 to 5. "Now" is what is in the images. "After" is my expectation once the fixes below are in (needs the re-look in 12.6).

| Theme | Verdict | Squint now | After | Fix IDs |
|---|---|---|---|---|
| promise-mascot | fix then ship | 3 | 4 | F1 F2 F3 S1 |
| persona-4 | fix then ship | 4 | 5 | F1 F2 F4 S2 |
| gryffindor | fix then ship | 4 | 4 | F1 F2 F5 |
| 2001 | fix then ship | 4 | 4 | F1 F2 F10 |
| cyberpunk | fix then ship | 4 | 4 | F1 F2 F6 F8 |
| stranger-things | fix then ship (largest fix, re-look essential) | 3 | 4 | F1 F7 S3 |
| shire | ship-ready after the shared fixes | 4 | 4 | F1 F2 S5 (polish) |
| dead-space | fix then ship | 3 | 4 | F1 F2 F9 S4 |

**Fix count: 15** (F1 to F10 are defects and shared items; S1 to S5 are the signature lifts from the squint test; S5 is optional polish). No theme needs a redesign; none is "needs rework".

**Re-look needed: yes.** F-items with a visual result and all S-items change pixels I have not seen. Done-when checks alone are not enough. Exact list in 12.6.

### 12.1 Rulings on the seven items

**1. stranger-things title (3.42 to 4.46:1).** Cause confirmed: `#app::after` (z 199) sits above the header (z 100), and the vignette alpha reaches 0.16 at the title's left end and 0.26 in the corner. Ruling: **keep the vignette off the header band** (F7). Not "raise the header": z-index 250 would hide the 1 px window border along the header, and the header would then sit above every future art layer. Not "lighter red" alone: the unvignetted title is only 4.82:1 (`#F0283A` on `#10060A`), and its 6 px red glow eats edge contrast, so I also lighten the title text to `#FF3B4A` (5.68:1) and tighten its tracking to 0.5 px (the show's title is set tight). The header buttons and version text were being darkened by the same vignette (0.16 at the right-hand buttons); this fixes them too.

**2. Header spill.** Ender's suggestion is right: draw the line inside the header. An inset shadow plus a recoloured bottom border gives the identical 3 px line at y 37 to 40 and paints nothing below the header (F3, F4). Gryffindor is different: its 1 px gilt hairline duplicates the frame's outer gilt rule 4 px below it (three parallel gold lines within 9 px, visible in the crop). Ruling: **delete it** (F5); the double rule under the header becomes the frame. Cyberpunk's notch moves up so it sits on the header's bottom rule (F6). Result: nothing paints over the tile band or the scrollbar thumb.

**3. Plate cuts.** Geometry: the mock plate is a 60 px rect with `rx=13` inside a 64 px box, so its rounded corner already removes everything with x+y below 11.6 px on the diagonal. Both cuts sit inside that. A cut only shows at 21 percent or more. Ruling: **cyberpunk raise to 24 percent** (F8; the chamfer is the game's one shape signature). Margins at 24 percent (15.4 px): tightest mock glyph corner sums are 23 px (Paint bounding box; its real curve is further) and 24 px (Terminal, both cut corners), so at least 7.6 px of clearance, and the cut shows as a 2.7 px flat facet beyond the arc. **Dead-space drop** (F9, `none`): a visible octagon needs a 24 percent cut on four corners, which would clip real app icons that reach their corners, and the octagon does nothing for recognition (the spine and the amber stencils carry that theme).

**4. Settings version colour.** Cause: `#app-version` carries `.accent`, and `.accent { color: var(--accent-m) }` in `base.css`. In seven of these themes `--accent-m` is the warning or edit colour (cyberpunk red, dead-space amber, persona-4 orange, 2001 red, gryffindor red, shire terracotta, promise-mascot pink), so the version reads as an alert. Ruling: **the version takes `--accent-text`, the same colour as the "64px" value and the hotkey text** (F2), in those seven. Stranger-things keeps its blue `--accent-m` (9.63:1, not a warning colour). Contrast of `--accent-text` on the overlay ground: promise-mascot 11.35, persona-4 13.02, gryffindor 8.40, 2001 6.21, cyberpunk 16.24, shire 7.17, dead-space 8.27. All clear 4.5.

**5. 2001 skin-select arrow.** In `base.css` the arrow is a `background-image` on `.theme-search`, an inline SVG with `fill='rgba(255,255,255,0.5)'`, so it vanishes on any light panel. **A theme-level override fixes it**: `background-image` is a longhand, so overriding only that property keeps base's `no-repeat` and `calc(100% - 10px) 50%` (F10; arrow colour `rgb(74,74,82)`, 8.48:1 on the panel). 2001 is the only light theme in the whole set (I scanned every `--panel-bg`), so no other theme has the bug today. **Shared-file item logged in 12.5; not specced.**

**6. Banner strings.** Final lines in 12.4. Sources were checked for every line. Removed for cause: cyberpunk "Welcome to Night City" (only a quest title and a mod name turned up, never a spoken line), gryffindor "Help will always be given at Hogwarts to those who ask for it" (real and exact but 13 words, over the length limit), 2001 "This mission is too important for me to allow you to jeopardize it" (real, 13 words), dead-space had two lines and now has four. Gryffindor #1 no longer clips: the old line was the paraphrase "...stand up to your enemies" (the book says "our"), which cannot be shortened without altering it, so it is replaced with a short exact line.

**7. Anything else.** Three more findings, all in the fix list: gryffindor's triple gold rule (F5); shire's hill floats 10 px above its rule instead of sitting on it (S5); and the squint result, which produced S1 to S4. Things I checked and found fine: no art in the tile field; header art hides on the filter chip (rule present in all 8; verify in the re-look); text fits on one line in every after image; hover, focus and pill states; the dead-space shear no longer touches the fullscreen button; 2001 as a light theme (contrast, hover, HAL eye); cyberpunk's wedge and stripe; shire's plank frame and vine.

### 12.2 Squint test (coordinator's addition): what a fan still sees with the title and banner text covered

The tool fixes the layout (header, tile grid, banner strip), so themes can only differ by colour, shape language, texture and one motif. That is the ceiling. The batch is cleaner and easier to read than before; the gap is identity. Ratings and reasoning:

| Theme | Now | What survives the squint | What is missing |
|---|---|---|---|
| promise-mascot | 3 | grain, a pink rule, a beige torn-paper strip, a black blob | Reads as "retro Japanese print". Only the blob (22 px) says this game. Reviews describe the game as flat and graphic Showa print (old manga, children's adverts, grotesque mascots); the art we can draw without copying the game's own is a mascot head. **S1**: a cut-out mascot head sticker in the banner |
| persona-4 | 4 | yellow header and yellow banner around a dark body, a small TV icon | Yellow is P4's colour, but four stars are generic. The TV world is the franchise's other big cue and it is only a 22 px icon. **S2**: swap the stars for a TV-static screen in the header |
| gryffindor | 4 | maroon and gold, gilt double rule, swallow-tail pennant with a sword | Enough for a fan. No change beyond F5 (removing the triple rule makes the frame cleaner) |
| 2001 | 4 | pale console, thin spaced caps, red eye | HAL's eye is small but the red dot on white is unmistakable. No change |
| cyberpunk | 4 | CDPR yellow and cyan on near-black, hazard stripe, corner brackets | The chamfer never showed (item 3). F8 makes the game's signature cut corner visible on every icon. I am **not** adding neon signage: hot pink and magenta neon breaks the flat yellow-and-cyan HUD look that the game's UI (as opposed to the city) has, and that rule was deliberate |
| stranger-things | 3 | dark red-black, tiny amber, red and blue dots | The bulbs are 5 px, the wire is `rgb(58,42,26)` on near-black (invisible), and nothing else on screen is the show once the title is covered. **S3**: lit bulbs with halos, visible wire, denser string |
| shire | 4 | dark green rounded window, timber frame, vine, a green hill with a round door | Warm and round already (14 px window corner, 14 px pockets, pebble plates, oak planks, vine). The one flaw is a hill floating above its rule. **S5** (polish) |
| dead-space | 3 | dark blue-black, a thin blue strip at the left, amber stencils | The RIG spine (the game's health bar on Isaac's back) is the franchise's best-known UI shape and here it is 5 px wide. **S4**: widen to 8 px, add a lit core and a rail |

### 12.3 Exact fix list for Ender

Rule for every item: change only what is listed; SVG below is written readable (`rgb()` colours, straight quotes); encode it as `create-theme.md` says. No new animation anywhere; `grep -c infinite` must still total 2 (cyberpunk 1, stranger-things 1). None of these touches the five gate variables, so `npm run check:contrast` is unaffected, but re-run it anyway. No `--rebaseline`.

**F1. Banner strings (`src/renderer/app.js`, `THEME_BANNERS`).** Replace the eight entries with the text in 12.4, exactly, including case. Scope: only these eight keys. Then check `scrollWidth <= clientWidth` for every string. Search `app.js` and `tests/` for any assertion or comment that assumes "5 quotes per theme" (the comment above the object says 3; after this stranger-things, persona-4, promise-mascot and cyberpunk have 3, dead-space and gryffindor 4, shire and 2001 5). The rotation code has no minimum, so this only matters for a test.

**F2. Version colour (7 themes: promise-mascot, persona-4, gryffindor, 2001, cyberpunk, shire, dead-space; NOT stranger-things).** Add to each file, after the `:root` block:
```css
#app-version { color: var(--accent-text); }
```
The id beats `.accent` by specificity. Result: the version matches "64px" and the hotkey text.

**F3. promise-mascot header line inside the header.** Replace `#header { box-shadow: 0 3px 0 #E0508C; }` with:
```css
#header { border-bottom-color: #E0508C; box-shadow: inset 0 -2px 0 #E0508C; }
```
Still a 3 px pink line at window y 37 to 40 (2 px inset plus the 1 px border). Nothing paints below y 40.

**F4. persona-4 header line inside the header.** Replace `#header { box-shadow: 0 3px 0 #1A1A1A; }` with:
```css
#header { border-bottom-color: #1A1A1A; box-shadow: inset 0 -2px 0 #1A1A1A; }
```

**F5. gryffindor: delete the header hairline.** Remove the rule `#header { box-shadow: 0 1px 0 #B8901F; }` and fix its comment. The header keeps its normal border; the frame's outer and inner gilt rules (container y 4 and 7) are now the only gold lines under the header.

**F6. cyberpunk notch inside the header.** Replace the `#header::after` height and image so the piece ends at y 39 (the padding-box bottom, flush above the 1 px border):
```css
#header::after { height: 29px; background: url("<svg below>") no-repeat 0 0 / 84px 29px; /* rest unchanged */ }
```
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 29'>
<rect x='2' y='5' width='32' height='3' fill='rgb(252,238,10)'/>
<rect x='10' y='11' width='36' height='2' fill='rgb(2,215,242)'/>
<rect x='4' y='16' width='16' height='2' fill='rgb(252,238,10)'/>
<rect x='0' y='26' width='12' height='3' fill='rgb(252,238,10)'/>
</svg>
```
The notch is now a 12 x 3 yellow tab sitting on the header's bottom rule at window x 168 to 180, y 36 to 39. The three bars are unchanged.

**F7. stranger-things: vignette off the header, title lighter and tighter.**
```css
#app::after {
  top: var(--header-h);
  background: radial-gradient(ellipse 100% 104% at 50% 42%, transparent 55%, rgba(3,0,4,0.60) 100%);
}
#title {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 700; letter-spacing: 0.5px;
  color: #FF3B4A;
  text-shadow: 0 0 1px #F0283A, 0 0 6px rgba(224,24,42,0.80);
}
```
The new gradient box is 40 px shorter, so the radii and centre are restated in percentages to keep today's look (0.42 x 260 = 109 px is today's centre; 1.04 x 260 = 270 px is today's vertical radius). Title `#FF3B4A` on `#10060A` is 5.68:1 (was 4.82 flat). Report `#title.getBoundingClientRect().right` (it gets narrower). Done when: a sample of the header background at x 5, y 20 equals `#10060A` (no vignette) and the lowest title pixel ratio is at least 4.5:1 at the left end.

**F8. cyberpunk plate chamfer visible.** In `:root`:
```css
--tile-icon-shape: polygon(24% 0, 100% 0, 100% 76%, 76% 100%, 0 100%, 0 24%);
```
Margins: all six mock glyphs keep at least 7.6 px from the cut (Terminal 24 px, Paint's bounding box 23 px against a 15.4 px cut). Done when: the Notepad, Calculator and Paint plates show a flat diagonal facet at top-left and bottom-right in the hover and grid shots, and no glyph pixel is cut.

**F9. dead-space plate shape dropped.** In `:root`: `--tile-icon-shape: none;` (was the 12 percent octagon that cannot show). Update the comment.

**F10. 2001 skin-select arrow.** Add:
```css
.theme-search {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgb(74,74,82)'/%3E%3C/svg%3E");
}
```
Only `background-image` is overridden, so base's position (`calc(100% - 10px) 50%`) and `no-repeat` stay. Done when: the settings shot shows a dark arrow at the right end of the SKIN field.

**S1. promise-mascot: mascot-head sticker at the right end of the banner strip.** Replace `background: #B8B0A0;` in the `#theme-banner` rule with a two-layer background (keep `border-top: 0; z-index: 250;`):
```css
background: url("<svg below>") right 14px bottom 6px / 28px 28px no-repeat, #B8B0A0;
```
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 28'>
<circle cx='6' cy='6.5' r='4.2' fill='rgb(16,16,16)'/>
<circle cx='22' cy='6.5' r='4.2' fill='rgb(16,16,16)'/>
<ellipse cx='14' cy='16.5' rx='13' ry='11.3' fill='rgb(16,16,16)'/>
<circle cx='6' cy='6.5' r='2.7' fill='rgb(224,80,140)'/>
<circle cx='22' cy='6.5' r='2.7' fill='rgb(224,80,140)'/>
<ellipse cx='14' cy='16.5' rx='11.6' ry='9.9' fill='rgb(224,80,140)'/>
<circle cx='9.5' cy='14.5' r='3.1' fill='rgb(245,240,225)'/>
<circle cx='18.5' cy='14.5' r='3.1' fill='rgb(245,240,225)'/>
<circle cx='10.1' cy='14.9' r='1.2' fill='rgb(16,16,16)'/>
<circle cx='17.9' cy='14.9' r='1.2' fill='rgb(16,16,16)'/>
<path d='M7.5 21 Q14 25.2 20.5 21' fill='none' stroke='rgb(16,16,16)' stroke-width='1.3' stroke-linecap='round'/>
<path d='M10.2 22.2 V24.2 M14 23.3 V25.3 M17.8 22.2 V24.2' fill='none' stroke='rgb(16,16,16)' stroke-width='1'/>
</svg>
```
A pink cut-out mascot head with a black outline, two off-centre vacant eyes and a stitched grin. Original shape, not a character from the game. It sits at banner x 382 to 410, y 10 to 38: 3.5 px below the torn edge's lowest point (y 6.5) and at least 120 px right of the end of the longest promise-mascot string (213 px, which ends at x 259). Decoration only (pink on paper is 1.7:1, but the black outline at 8.8:1 defines the shape). Done when: no overlap with the text or the torn edge.

**S2. persona-4: TV-static screen replaces the four stars.** Replace the `#header::after` background image (same box: 84 x 20 at `right: 172px; top: 10px`; the `:has()` hide rule stays):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<defs>
<filter id='n' filterUnits='userSpaceOnUse' x='0' y='0' width='84' height='20' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='1.3' numOctaves='1' seed='7'/>
<feColorMatrix type='matrix' values='1.8 0 0 0 -0.45  1.8 0 0 0 -0.45  1.8 0 0 0 -0.45  0 0 0 0 1'/>
</filter>
<clipPath id='s'><rect x='3' y='3' width='64' height='14' rx='2.5'/></clipPath>
</defs>
<rect width='84' height='20' rx='4' fill='rgb(26,26,26)'/>
<g clip-path='url(%23s)'>
<rect x='3' y='3' width='64' height='14' filter='url(%23n)'/>
<rect x='3' y='10.2' width='64' height='1.6' fill='rgb(232,228,208)' opacity='0.5'/>
</g>
<circle cx='76' cy='6.8' r='2.4' fill='rgb(245,214,10)'/>
<circle cx='76' cy='13.2' r='2.4' fill='rgb(245,214,10)'/>
</svg>
```
A small black TV: a grey static screen with one pale tracking bar and two yellow dials. Static grey, drawn once, no animation. If the noise reads too bright or too coarse, change only the two `-0.45` offsets (brighter to darker) or `baseFrequency`, not the geometry. Done when: art spans window x 168 to 252, is at least 12 px right of the title, hides when a letter is typed, and the static is mid-grey (mean about 0.45), not white.

**S3. stranger-things: a lit string of bulbs.** Replace the `#grid-container` background image (keep `0 0 / 212px 11px repeat-x`; band is still container y 0 to 11, art stays at least 5 px above the first tile row):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 212 11'>
<path d='M0 1.2 Q26.5 3.8 53 1.2 Q79.5 3.8 106 1.2 Q132.5 3.8 159 1.2 Q185.5 3.8 212 1.2' fill='none' stroke='rgb(110,86,58)' stroke-width='1'/>
<ellipse cx='26.5' cy='7.6' rx='5' ry='3.4' fill='rgb(255,176,48)' opacity='0.26'/>
<rect x='25.3' y='2.5' width='2.4' height='2.2' fill='rgb(110,86,58)'/>
<ellipse cx='26.5' cy='7.6' rx='2.3' ry='3' fill='rgb(255,176,48)'/>
<ellipse cx='25.8' cy='6.4' rx='0.7' ry='1' fill='rgb(255,255,255)' opacity='0.6'/>
<ellipse cx='79.5' cy='7.6' rx='5' ry='3.4' fill='rgb(224,24,42)' opacity='0.26'/>
<rect x='78.3' y='2.5' width='2.4' height='2.2' fill='rgb(110,86,58)'/>
<ellipse cx='79.5' cy='7.6' rx='2.3' ry='3' fill='rgb(224,24,42)'/>
<ellipse cx='78.8' cy='6.4' rx='0.7' ry='1' fill='rgb(255,255,255)' opacity='0.6'/>
<ellipse cx='132.5' cy='7.6' rx='5' ry='3.4' fill='rgb(91,143,224)' opacity='0.26'/>
<rect x='131.3' y='2.5' width='2.4' height='2.2' fill='rgb(110,86,58)'/>
<ellipse cx='132.5' cy='7.6' rx='2.3' ry='3' fill='rgb(91,143,224)'/>
<ellipse cx='131.8' cy='6.4' rx='0.7' ry='1' fill='rgb(255,255,255)' opacity='0.6'/>
<ellipse cx='185.5' cy='7.6' rx='5' ry='3.4' fill='rgb(224,24,42)' opacity='0.26'/>
<rect x='184.3' y='2.5' width='2.4' height='2.2' fill='rgb(110,86,58)'/>
<ellipse cx='185.5' cy='7.6' rx='2.3' ry='3' fill='rgb(224,24,42)'/>
<ellipse cx='184.8' cy='6.4' rx='0.7' ry='1' fill='rgb(255,255,255)' opacity='0.6'/>
</svg>
```
Four bulbs per 212 px (amber, red, blue, red), spacing 53 px, so about 8 across the window; wire `rgb(110,86,58)` (was `rgb(58,42,26)`); each bulb has a soft static halo (26 percent alpha, 5 x 3.4 px) that stays inside the 11 px band (halo y 4.2 to 11.0). The socket top (y 2.5) sits on the wire's lowest point (y 2.5). Done when: the bulbs read as lit at 1x, the halos do not touch a tile or its 4 px keep-out, and nothing else in the theme changed.

**S4. dead-space: a wider, lit RIG spine.** Replace the `#grid-container` background with two layers:
```css
#grid-container {
  background:
    url("<svg below>") 2px 0 / 8px 15px no-repeat space,
    linear-gradient(rgba(58,180,232,0.16), rgba(58,180,232,0.16)) 2px 0 / 8px 100% no-repeat;
}
```
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 15'>
<rect x='0' y='0' width='8' height='12' fill='rgb(58,180,232)'/>
<rect x='1.5' y='1.5' width='2' height='9' fill='rgb(196,238,255)' opacity='0.55'/>
</svg>
```
Segments are 8 x 12 with a 3 px gap (was 5 px wide), spaced evenly and never cropped (`space`), with a lit core stripe, over a faint continuous rail that shows in the gaps. The spine spans x 2 to 10; the left band is x 1 to 11 and the tile keep-out starts at x 12, so 2 px clear. If `no-repeat space` does not distribute in this Chromium (open item 4 in section 11), fall back to `repeat-y` with a 15 px tile and accept a cropped last segment. Done when: the spine is visibly the strongest shape on the left edge, all segments whole, none within 12 px of a tile.

**S5 (optional polish). shire hill on its rule.** Add `#header::after { top: 19px; }` (the box becomes y 19 to 39, so the hill sits on the header's bottom rule instead of floating 10 px above it). Composition unchanged. The rest of the `#header::after` rule stays.

### 12.4 Final banner strings (all verified; widths measured with the real font files, no kerning, about 3 percent tolerance)

Case is the string's case; the base has no `text-transform` on the banner. Order matters: the gallery freezes on quote 1.

| Theme | Case and font | Lines (in order) | Widest | Spare |
|---|---|---|---|---|
| promise-mascot | UPPER, Yu Gothic Bold | `ANOTHER DAY, ANOTHER ERRAND.` / `THE TOWN CAN WAIT A MINUTE.` / `PICK A TILE. KEEP GOING.` | 213 px | 151 |
| persona-4 | UPPER, Segoe UI Semibold | `REACH OUT TO THE TRUTH.` / `EVERY DAY'S GREAT AT YOUR JUNES!` / `I AM THOU, THOU ART I.` | 204 px | 160 |
| gryffindor | Sentence, Palatino italic | `Where dwell the brave at heart.` / `Their daring, nerve, and chivalry set Gryffindors apart.` / `Mischief managed.` / `I solemnly swear that I am up to no good.` | 286 px (box 338) | 52 |
| 2001 | Sentence, Segoe UI Semilight | `I'm sorry, Dave. I'm afraid I can't do that.` / `Open the pod bay doors, HAL.` / `Daisy, Daisy, give me your answer do.` / `The 9000 series is the most reliable computer ever made.` / `Just what do you think you're doing, Dave?` | 298 px | 66 |
| cyberpunk | UPPER, Bahnschrift | `WAKE UP, SAMURAI. WE HAVE A CITY TO BURN.` / `NEVER FADE AWAY.` / `FOR FOLKS LIKE US? WRONG CITY, WRONG PEOPLE.` | 326 px normal width, 244 px condensed | 38 (normal) |
| stranger-things | Sentence, Georgia italic | `Mornings are for coffee and contemplation.` / `Friends don't lie.` / `Mouth breather.` | 248 px | 116 |
| shire | Sentence, Georgia italic | `In a hole in the ground there lived a hobbit.` / `What about second breakfast?` / `Home is behind, the world ahead.` / `The road goes ever on and on.` / `Not all those who wander are lost.` | 250 px | 114 |
| dead-space | UPPER, Bahnschrift SemiBold | `MAKE US WHOLE.` / `CUT OFF THEIR LIMBS!` / `ALTMAN BE PRAISED.` / `YOUR LACK OF CONFIDENCE IN ME IS DULY NOTED.` | 324 px | 40 |

Text box is 364 px (338 in gryffindor: the pennant's 40 px right padding). The 38 px and 40 px margins (cyberpunk line 3, dead-space line 4) are the thinnest; if Ender's `scrollWidth <= clientWidth` check fails on either at normal width, drop that one line, do not change the layout.

Why each line stands (source evidence from this review):
- **cyberpunk:** line 1, Johnny Silverhand's E3 2019 trailer line, printed in full as "Wake the f*** up, Samurai. We have a city to burn." (IMDb, Know Your Meme). Kept in the clean form Sergei already has in the app; see flag 2 in 12.7. Line 2, "Never Fade Away" is the SAMURAI song and a main job in the game (Cyberpunk Wiki). Line 3, Johnny, "For folks like us? Wrong city, wrong people." (TheGamer, best lines). Dropped: "Welcome to Night City" (a quest title and mod name, no spoken line found).
- **dead-space:** "Cut off their limbs!" is the CEC audio log by Sorensen (Dead Space Wiki, "Log: Cut off their limbs"); "Make us whole" is the Unitologist mantra; "Altman be praised" is Captain Mathius; "Your lack of confidence in me is duly noted" is Hammond (TheGamer, best lines).
- **2001:** all five are printed in Wikiquote. #2 is Dave's line to HAL, not HAL's own. #5 replaces the 13-word jeopardize line.
- **gryffindor:** lines 1 and 2, the 1991 Sorting Hat song (HP Lexicon and Harry Potter Wiki; the punctuation "nerve, and chivalry" is as printed in the source found). Lines 3 and 4, the Marauder's Map words (Prisoner of Azkaban). Dropped: the Dumbledore "Help will always be given..." line (real, 13 words, over the length limit) and the paraphrase "...stand up to your enemies" (the book says "our").
- **shire:** Tolkien Gateway and Goodreads for the verse lines; "What about second breakfast?" is Pippin in the film.
- **stranger-things:** "Mornings are for coffee and contemplation" is Hopper in S1E1; "Mouth breather" is Mike, then Eleven, S1; "Friends don't lie" is Eleven, S1E7.
- **persona-4:** "Every day's great at your Junes!" is the store jingle; "Reach Out to the Truth" is the battle theme's title; "I am thou, thou art I" is the persona-awakening line. Dropped: the three invented status lines.
- **promise-mascot:** none of these is a game quote. No short in-game line could be found, and the audit (section 4) allows neutral in-tone labels for this theme. See flag 1.

### 12.5 Shared-file item (logged, not specced, not for this batch)

`src/renderer/styles/base.css`, `.theme-search`: the skin-select dropdown arrow is a hard-coded inline SVG with a 50 percent white fill. It is invisible on any light panel. 2001 is the only light theme in the set today (checked by scanning every theme's `--panel-bg`), and F10 fixes it at theme level. A permanent fix would be a `--picker-arrow-color` variable read by the arrow (masked SVG or two SVG variants), which is a `base.css` change and needs Sergei's go-ahead as a shared-file item. Any future light skin will hit the same bug until then.

### 12.6 Re-look and done-when

**I need to see the images again.** Ender's done-when checks are enough only for F1 (string fit), F2 (colour), F9 (`none`) and the numeric parts (`check:contrast`, `grep -c infinite` = 2, title right edge, F7 header-pixel sample). Every other fix changes pixels I have not seen. Please regenerate the same comparison sheet and send:
1. The batch sheet and the 8 per-theme sheets (grid, settings, hover), as before.
2. Two extra states: (a) filter chip visible (type one letter) on persona-4 and cyberpunk, to prove the art hides; (b) grid scrolled by one row on promise-mascot, persona-4 and cyberpunk with the header band in view, to prove nothing spills onto tiles or the scrollbar.
3. A 2x crop of the header band for persona-4 (the static screen) and stranger-things (title, header pixel sample).

What I will check on that pass: header line inside the header with no spill (F3, F4, F5, F6); title legible at the left end (F7); P4 static is mid-grey, not white, not coarse (S2); sticker clear of text and torn edge (S1); bulbs read as lit and clear of tiles (S3); spine is the strongest left-edge shape with whole segments (S4); chamfer visible on cyberpunk icons (F8); dark arrow on 2001 (F10); version colour in the seven settings shots (F2); banner text on one line in every theme (F1). Then a re-rate on the squint scale.

### 12.7 Flags for Jane and Sergei

1. **promise-mascot banner lines are studio-authored labels, not quotes.** No short real in-game line was found; the audit allows this for the theme. I cut the set from five to three to keep invented copy to a minimum. Sergei can drop them or supply a real line.
2. **cyberpunk line 1 is the clean form** ("Wake up, Samurai..." without the expletive). It is the only banner line that is not letter-exact. It is the line the app has always shown, and I kept it for that reason. If Sergei wants strict exactness he must choose to show the expletive; I have not.
3. **promise-mascot recognisability is capped by the near-black grade.** From reviews the game's own look is a flat, bright Showa print. If Sergei wants this skin to be unmistakable rather than atmospheric, the lever is a paper-coloured ground, a product decision, not a fix in this batch. S1 gets it from 3 to about 4 inside the current grade.
4. **persona-4's four stars are removed by S2.** They were my own interpretive flourish, not a P4 element. Tell me if Sergei liked them.
5. **Edit mode, the update banner and the 640x420 / 1024x700 shots were not in the sheets I was given.** I rely on Ender's report for those; none of the fixes above touches them, except that S2 and F6 change header art that already hides on the filter chip.


### 12.8 Review 2 (2026-09-30)

Round 2 re-look. **Verdict: all eight themes are ship-ready. No fix is required.** Every item in 12.3 is implemented as specced, and I found no new real defect. Details below; the notes at the end are watch items, not fixes.

**What I looked at.** The 9 `compare-b01r2` images (batch sheet plus 8 per-theme sheets), all 12 `review-b01r2` images (chip-visible for persona-4 and cyberpunk with 2x crops, scrolled-one-row for promise-mascot, persona-4 and cyberpunk with 2x crops, header bands for persona-4 and stranger-things), and the raw `after-b01r2` grid shots with header and banner bands cropped at 2x for all eight themes, plus a 3x crop of the settings version row. I did not launch anything.

**What I checked in the code and by running scripts (read-only).**
- `THEME_BANNERS`: I extracted the object from `app.js` and compared the eight entries to 12.4 line by line. **8 of 8 match exactly**, all 101 themes are still present, and only these eight keys changed.
- `npm run check:contrast` (no `--rebaseline`): **101 checked, 0 errors**, 13 warnings, all on legacy themes (none of the eight).
- `grep -c infinite`: promise-mascot 0, persona-4 0, gryffindor 0, 2001 0, cyberpunk 1, stranger-things 1, shire 0, dead-space 0. **Total 2.** A fixed-string search for `\A` finds nothing in any of the eight.
- The `:has(#filter-chip:not(.hidden))::after` hide rule is present in all seven themes that have header art; stranger-things has none and needs none.
- No comment in the eight CSS files is stale after the fixes (I searched for octagon, stars, spill, hairline, "y 46", "five px").

**Item by item.**

| Item | Result | Evidence |
|---|---|---|
| F1 banner strings | pass | exact match; every line on one line in the images; gryffindor no longer clips |
| F2 version colour | pass | 3x crop of the settings row: promise-mascot and persona-4 yellow, 2001 blue, cyberpunk yellow, dead-space blue, gryffindor gold; shire green; stranger-things keeps blue by design |
| F3 promise-mascot line | pass | 3 px pink line inside the header; the scrolled shot shows tiles clipped cleanly under it and the scrollbar thumb untouched |
| F4 persona-4 line | pass | same, black; scrolled shot clean |
| F5 gryffindor | pass | header hairline gone; one clean double gilt rule under the header |
| F6 cyberpunk notch | pass | tab sits on the header's bottom rule; nothing below the header in the scrolled shot |
| F7 stranger-things | pass | header background is flat `#10060A`; title `#FF3B4A`, bright and crisp; Ender's 5.29 to 5.70:1 is consistent with my 5.68 |
| F8 cyberpunk chamfer | pass | visible flat facet at top-left and bottom-right on every plate in the grid, hover and scrolled shots (Notepad, Calculator, Paint, Terminal, Browser, Files, Settings, Music, Photos); no glyph pixel cut |
| F9 dead-space plate | pass | `none`, rounded plates like the rest |
| F10 2001 arrow | pass | dark arrow visible at the right end of the SKIN field |
| S1 mascot sticker | pass | pink cut-out head with black outline at the banner's right end; clear of the text (ends x 259) and the torn edge; reads as a mascot |
| S2 TV-static screen | pass | fine-grained mid-grey static, one pale tracking bar, two yellow dials; hides on the filter chip (chip shot shows the chip alone); the static is not white and not coarse |
| S3 bulb string | pass | bulbs read as lit with halos, wire visible, eight across; clear of the first tile row |
| S4 RIG spine | pass | 8 px lit segments over a faint rail; whole segments top to bottom |
| S5 shire hill | pass | the hill sits on the header rule now |

**My own wording error.** S4's done-when said "none within 12 px of a tile". The geometry I specced (x 2 to 10) puts the spine 6 px from the tiles and 2 px clear of the 4 px keep-out, which is what Ender built and what is correct. The "12 px" was a slip in my sentence, not a defect in the build.

**Ender's deviations, accepted.** S5 through the shared header-art rule: fine. Simulated chip and scroll probes: acceptable; I read the real `:has()` rule in every file, and the images show the intended result. Spine 6 px from tiles: correct (see above).

**Verdict and final squint score per theme** (title and banner text covered, 1 to 5):

| Theme | Verdict | Squint | Note |
|---|---|---|---|
| promise-mascot | ship-ready | 4 | Torn beige strip, black blob and pink mascot head flank the text; pink rule; grain. Ceiling is 4 under the near-black grade (flag 3 in 12.7) |
| persona-4 | ship-ready | 5 | Yellow header and banner, a TV-static screen with dials, yellow label pill: unmistakably P4 and the Midnight Channel |
| gryffindor | ship-ready | 4 | Maroon and gold, one clean double gilt rule, swallow-tail pennant with sword |
| 2001 | ship-ready | 4 | Pale console, thin spaced caps, monolith and perspective lines, red eye |
| cyberpunk | ship-ready | 4 | CDPR yellow and cyan, hazard stripe, corner brackets, and the chamfered plates that now show |
| stranger-things | ship-ready | 4 | A lit string of bulbs and a glowing red title; up from 3 |
| shire | ship-ready | 4 | Round green door in a hill on its rule, oak planks and vine, round pockets |
| dead-space | ship-ready | 4 | A strong RIG spine with a lit core, amber stencils; up from 3 |

**Watch items (not fixes, not blocking).**
1. **`app.js` comment "Banner quotes (3 per theme)" is stale.** It was already wrong before this batch (most themes have 5). Changing it is outside the eight-entry authorisation, so I left it; Jane's call, no design impact.
2. **Real icons vs the cyberpunk chamfer.** The 24 percent cut clears every mock glyph by at least 7.6 px, but a real app icon whose artwork reaches its corners will lose a small triangle at top-left and bottom-right. If Sergei notices, drop F8 to 20 percent or set the shape to `none`; the theme still reads.
3. **2001 banner text is Segoe UI Semilight at 11 px.** In the 1.5x shot the darkest text pixel reaches the full text colour (13.8:1), so it is legible, but at 100 percent display scale the strokes are thinner. If Sergei finds it faint, raise the banner text to weight 400; do it only if he says so.
4. **Not seen by me:** edit mode, the update banner, and the 640x420 and 1024x700 shots. I rely on Ender's overlap probes (0 art on content in every size). None of the fixes touches those states.
5. **The four open flags in 12.7 stand unchanged** for Jane and Sergei: promise-mascot's three banner lines are studio-authored labels, not quotes; cyberpunk line 1 is the clean form of the game's line; promise-mascot is capped at about 4 by the dark grade; persona-4's four stars are gone (replaced by the TV screen).
6. **Shared-file item (12.5) is still open:** the `base.css` skin-arrow colour. It is not needed for this batch because F10 fixes 2001 at theme level.
