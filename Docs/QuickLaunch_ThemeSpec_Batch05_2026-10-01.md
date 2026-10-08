# QuickLaunch theme spec, batch 5 (Judy, 2026-10-01)

Status: complete. Batch-level section (0), seven theme sections (1 to 7), fonts that would still lift the batch (8), summary (9), open items (10). Uncommitted, as instructed.

**Revised after the batch-5 review (review F3, 2026-10-01), so that this spec is what is built:** ff10 plates are rounded **20 px** (F1; the first build had 28 px), the third ff8 banner line is **"Everything will be fine now..."** (F5; flag 5 ruled "swap"), the ff14 banner motif is a **short gauge plus a second aetheryte** (F6), and the plate-margin check now includes real icons (0.2). The five flags are ruled in 9. Each edit says "review F1", "F5" or "F6" where it lands.

Themes: ff6, ff7, ff14, ff8, ff9, ff10, ff15 (audit section 7, batch 5, "Final Fantasy": 5 redraw, 2 tone down; the section order is the audit's, worst first).
For: Ender. Branch `wip/theme-fidelity`, written against HEAD `35d4e25` (batch 4 committed, review APPROVED) and the post-Foundation base (Foundation Parts A and B: `scrollbar-gutter: stable` on `#grid-container`, the `#header::after` thresholds, the scrolling overlays, the banner fit check, the seven bundled fonts). The audit's batch note asks for "one shared static blue-gradient window treatment across ff6, ff7, ff8 and ff9 with a per-game accent, so the family reads as a family"; section 0.3 is that kit, and each theme section is one game inside it. ff10, ff14 and ff15 use the same recipe at other intensities (0.3).
Franchise calls (no new era decisions needed): the seven themes are the seven numbered games the audit names. Final Fantasy XIV is the live service game (A Realm Reborn and later), not XIII; the audit's ff10 is Final Fantasy X (Spira), not X-2.

Inputs read: the audit (`QuickLaunch_ThemeAudit_2026-09-30.md`: section 1 shared constraints C1 to C5 and H1 to H8, the section 6.10 entries, the batch 5 row and note, the font table), the Foundation spec (Parts A and B, the fonts map, the fallback table), batch 4 (the format; sections 0 and 1 to 6 as the model) and its review (`QuickLaunch_ThemeReview_Batch04_2026-10-01.md`, lessons applied up front in 0.2), batch 3 and its review, Makoto's reference sheet (the Final Fantasy entries), the seven current theme files (legacy motion only), `base.css` and `index.html` (repo working tree), `scripts/check-theme-contrast.js`, `THEME_BANNERS` in `app.js` for the seven keys and the bundled font folder (`src/renderer/fonts/`). Every banner line was checked on the web (0.8). **QuickLaunch was not launched.** Only this file was written in the repo tree; scratch files, prototypes and renders live in the session scratchpad.

**Shared constraints are not restated.** Every section inherits audit section 1 (C1 to C5, H1 to H8), batch 1 sections 0 and 12, batch 2 sections 0 and 11 to 12, batch 3 section 0, batch 4 section 0 and the Foundation Parts A and B by reference (0.1 lists them). Where a rule is the same I point to it.

## At a glance

| # | Theme | Direction | Infinite animations, before to after | Lowest ratio (text / non-text / icon) | Type | Squint (expected) |
|---|---|---|---|---|---|---|
| 1 | ff6 | SNES menu window: royal-blue gradient panels with light borders, gold rails with rivets and gear teeth, three gears in the header, a pointing glove and an airship in the banner, rounded window | 6 to **0** | 4.79 / 5.22 / 3.24 | Segoe UI Semibold labels and banner, Georgia title | 4 |
| 2 | ff7 | PS1 menu window over Midgar: blue-to-black gradient panels, steel double pipes with mako dots on every edge, a mako vial in the header, a glass orb and a reactor skyline in the banner, square window, octagon plates | 6 to **0** | 4.86 / 7.09 / 3.15 | Bahnschrift 600 throughout | 4 |
| 3 | ff14 | Slick dark window with duty-gold trim (no blue window): charcoal slots with gold borders, a hairline frame with corner brackets, a hotbar in the header, a short limit gauge and an aetheryte at the right end of the banner (another aetheryte is its icon), crystal-blue keyboard ring | 6 to **0** | 4.75 / 5.40 / 3.47 | Cinzel 600 title (bundled), Segoe UI 350 | 4 |
| 4 | ff8 | Icy window in hairlines: grey-blue gradient panels, silver slashes and ticks, a crescent in the header, a moon in the banner, a blue and a red stripe on the hovered tile, one cut corner | 6 to **0** | 4.65 / 3.40 / 3.39 | Jost 300 and 350 throughout (bundled) | 3 |
| 5 | ff9 | Blue windows in a wooden stage frame: brass borders, a red curtain valance, brass scrolls, a marionette bar in the header, a castle and a crystal in the banner, arch-top tiles and plates | 6 to **0** | 4.67 / 4.07 / 3.20 | Gabriola title, Constantia italic with lining figures | 4 |
| 6 | ff10 | Deep water and a sphere grid: dark aqua gradient panels, node-and-line rails on every edge, a network in the header and banner with one gold node, a water drop with ripples, rounded plates, opaque (no translucency) | 6 to **0** | 4.80 / 4.62 / 3.23 | Segoe UI 350 throughout | 4 |
| 7 | ff15 | Road trip in thin lines: charcoal panels with 1 px pale outlines, dashed road lines on the rails, orange tabs, a campsite in the header, a road to a sunset and a campfire in the banner, warm glow behind the icon | 6 to **0** | 5.28 / 5.10 / 3.04 | Jost 300 and 350 throughout (bundled) | 3 |
| | **Batch** | | **42 to 0** | **text 4.65 (ff8, header version on header); non-text 3.40 (ff8, hover stripe, red, on hover fill (non-text)); icons 3.04 (ff15)** | | |

"Lowest ratio" is the minimum over every pair in that theme's tables (gate pairs, add-on pairs and the generic accent-on-fill roles); text pairs need 4.5, non-text pairs 3. Every pair in every theme clears its threshold. For gradient surfaces every table row uses the **lightest stop** of the surface (the worst case for light text and for icon plates). The real gate script, run on the seven prototype files in a temp skeleton with an **empty baseline** (so every theme is treated as new and none gets a legacy pass), reported **7 checked, 0 errors, 0 legacy warnings**; ff7 and ff14 leave the legacy list. A deliberately broken copy (one `--text-dim` set to `#4A3A3A`) made the same script report the error (1.78:1), so the run can fail.

Art call (audit section 7 said 5 redraw, 2 tone down): ff6, ff7, ff14, ff8 and ff10 are **redraw**; ff9 and ff15 are **tone down with new frame art** (palette, type and small motifs kept as the audit says; the painted panno and readouts go, and the frame kit of 0.3 is added). The result is seven new frames, not seven tints.

---

## 0. Batch-level section (applies to all seven)

### 0.1 What is inherited (pointers; not restated)

B1 = `WIP/QuickLaunch/Docs/QuickLaunch_ThemeSpec_Batch01_2026-09-30.md`, B2 = `..._Batch02_...`, B3 = `..._Batch03_...`, B4 = `..._Batch04_2026-10-01.md`, B3R and B4R = `QuickLaunch_ThemeReview_Batch03_2026-09-30.md` and `..._Batch04_2026-10-01.md`, F = `QuickLaunch_ThemeSpec_Foundation_2026-09-30.md`.

| Rule | Where |
|---|---|
| Header art zone HZ: box 84 x 20 at `right:172px; top:10px` (x 168 to 252, y 10 to 30) with an **explicit `width`**; the title must end at x 156 or earlier; hidden while the filter chip shows (`#header:has(#filter-chip:not(.hidden))::after { display:none; }`, kept in every theme block), hidden below 424 px window width | B1 0.2, 0.1.5; F A2 |
| Frame art lives in `#grid-container`'s own `background` (not pseudo-elements: the grid scrolls and tiles paint over it); the tile field is **x 16 to W-20 at every size**, its 4 px keep-out x 12 to W-16 and y 52 to the banner top | B1 0.1.1, 0.1.4, 0.2; F A4 |
| Banner: top strip BZ-T (up to 7 px), icon slot BZ-I (22 x 22 at x 14, text starts at x 46), art anchored to fixed offsets; a big right-end motif limits the text box by `margin-right` (B3 A.2) | B1 0.2; B2 0.3.8; B3 Addendum A.2 |
| Header lines are drawn **inside** the header (`border-bottom-color` plus, for a 3 px line, `box-shadow: inset 0 -2px 0`); nothing paints below y 40 | B1 12.1 items 2, F3, F4 |
| The settings version value takes `--accent-text`: `#app-version { color: var(--accent-text); }` | B1 12.1 item 4, F2 |
| `#app::after` (z 199) paints above tiles, icons and the header: **this batch has none** (`background: none`) | B1 0.1.2, F7 |
| Ghost-text removal (`#grid-container::before/::after`, `#particles`, `#edit-bar::after`, `#header::after` text, `#app` animation, title and banner-icon animations) and the `\A` trap | B1 0.3 (per-theme keyframe names in 0.5 below) |
| Shared tile rules: focus = hover plus ring; no label halo; no sheen sweep; tile layout unchanged (border 1 px, tile height 94.7 to 95.4); `--glow-*`, `--pulse-glow` and `--scanlines` are `none`; `--tile-icon-glow` is the no-op filter | B1 0.4 |
| Contrast method (gate pairs, add-on pairs, generic accent-on-fill roles, icons through the fx filter on rest, hover and pressed grounds; `brightness()` never below 1.0 on a dark theme; the gate reads the **first** `--name:` match, so the gate variables are opaque hex and never appear in comments above `:root`) | B1 0.5, 0.1.8, 0.1.9, 0.1.11 |
| Texture measure (hidden-tiles shot, mean per-tile luminance sigma; the recorded ceiling is promise-mascot's 3.72) | B1 0.6; B2 12.1 |
| Infinite-animation counting and the tier key | B1 0.7; `create-theme.md` (CPU-efficient animations) |
| Verification set (grid, hover on CALCULATOR, settings, hidden-tiles, 640 x 420, 1024 x 700, focus ring, filter chip, edit mode, update banner, skin picker, scrolled one row) | B1 0.8 |
| The A/B/C overlap probe: A hides art and content, B shows art only, C shows content only; art = diff(B,A), content = diff(C,A); overlap must be 0 px and art inside the keep-out 0 px, at 424 x 300, 640 x 420, 1024 x 700 and in the chip, edit-bar, update-bar and focus-ring states. **For a gradient banner the art-off override keeps the banner's surface** (0.4) | B1 12.3; B2 0.4, 12.1; B3 0.1; B4 0.4 |
| Squint test: cover the title and banner text; a fan must still name the franchise. Colour-discipline checks in each "Done when" apply to the chrome and exclude the six tile icons (the apps' own art) | B1 12.2; B2 11.2 |
| Bundled fonts: the seven family strings, `font-display: block`, only declared weights, `font-synthesis: none`, display faces on `#title` only, the title width ladder (edge at most 156), the label gate, banner fit, `line-height: 1.2` on display titles, wait for `document.fonts.ready`, the Cyrillic fallback stacks | F B1, B2, B5 |
| Base-layout fixes this batch relies on: scrolling Settings and cheat-sheet, banner fit check, `scrollbar-gutter: stable` | F A1, A3, A4 |

### 0.2 Facts from earlier batches that this spec relies on, and the batch 3 and batch 4 review lessons applied up front

1. **Post-Foundation geometry and the 8 px bands.** The tile field is x 16 to W-20 at every size and the focus ring reaches x 12 and W-16. Bands are 8 px wide (left x 1 to 9, right x W-13 to W-5, top window y 40 to 49) so the clearance to the ring is 3 px by construction (B4 0.2.1). Measured on the mock with the distance transform: the nearest frame art is 4 px (ff6, ff7, ff8, ff9, ff10) and 6 px (ff14, ff15) from the nearest ring pixel at 424 x 300 and 4 px (ff6, ff7, ff8, ff9, ff10) and 6 px (ff14, ff15) at 640 x 420 and 1024 x 700 (0.4).
2. **`:has()` works** in the shipped Electron (`^32`, Chromium 128); the chip-hides-art rule is proven.
3. **`font-stretch` reaches Bahnschrift only as the SemiCondensed face** (B2 0.2.3). ff7 uses `font-stretch: 87.5%` for the title and the banner and says so.
4. **Texture ceiling: 3.72** (promise-mascot, measured). No theme in this batch has any texture; every hidden-tiles sigma is 0.00.
5. **Icon numbers to beat.** The lowest non-Terminal plate ratio over rest, hover and pressed in this batch is 3.04 (ff15).
6. **The bundled fonts exist in the working tree** (`src/renderer/fonts/`). Jost and Cinzel are used here (the foundation map: ff8, ff15 and ff14); I loaded them read-only into the mock to measure real widths; nothing was copied into the repo, edited or shipped.
7. **The banner fit check (F A3) is the net, not the plan.** Every line below fits by design, with the longest line ending at least 63 px before the text box edge (x 320) and at least 73 px before the motif's first painted pixel (0.8).
8. **The real gate has six checks.** `scripts/check-theme-contrast.js` also checks `--btn-close-color` on `--panel-bg` (added at foundation review 1). The gate tables below list six gate pairs, not five.

**Lessons applied before they could recur:**

| Lesson | What this batch does |
|---|---|
| Icons must read correctly at a glance (B4R F4: a spiked wheel, horns, a Y badge, a rosette) | Every 22 px icon was drawn, then rendered at 1x and 6x and judged by what it reads as **first**. Seven icons, each with one dominant shape: a **pointing glove** (ff6, also the SNES and PS1 menu cursor), a **glass orb in a socket** (ff7), a **moon** with craters (ff8), a **crystal** with two shards (ff9), a **water drop** over ripples (ff10), an **aetheryte** (crystal and ring, ff14), a **campfire** (ff15). Three audit icons were changed before they could fail that test: a plain circle outline (ff8) is a ring or a zero by construction, a ringed sphere (ff10) reads as Saturn (my first ff8 banner motif crossed a moon with an ellipse and read as Saturn at once, so the construction was removed there too), a winged crest (ff15) is a mark and was never drawn. The seven final icons were captured from the real 1x raster and magnified with nearest-neighbour scaling (`judy/b5/out/icons1x_sheet.png`): each reads as named at 1x. The two residual risks (ff6 glove as mitten, ff7 orb as bulb) are in the watch items with a lever each. |
| Italic and descender clipping (B4R F1) | **Every theme in this batch sets `.tile-label { overflow: clip; overflow-clip-margin: 3px; }`** (the proven lever). Measured at 1x, 1.5x and 2x with "gypsy Yy jq", "Typing", "jumpy quaff" and "Qq Gg Jj": the 8 px band under the label box differs by **0 px** from an unclipped reference in all seven themes; the old `overflow: hidden` clip cuts up to 128 px in the same band (positive control: ff6, ff9, ff10 and ff14 clip; the three uppercase themes ff7, ff8 and ff15 show no tails in these strings, and keep the lever for Cyrillic tails such as Щ and Ц). Italic ff9 is the case the lever exists for. |
| Digit styles that read wrong (doom-classic F1; B4 0.7) | No numeral is drawn in any SVG. Figures are real text: **Constantia (ff9) draws old-style figures** and is forced with `html, body { font-variant-numeric: lining-nums; }` (verified: "v1.94.3", "7-Zip 23.01" and "Visual Studio 2022" render lining); Georgia (ff6) is used for the all-caps title only, where it has no figures; Segoe UI Semibold, Bahnschrift, Jost, Segoe UI 350 and Cinzel (title, caps) draw lining figures. MS Gothic and Constantia without the rule were rendered and rejected (0.7). |
| Port ownership before driving a debug port (B3R and B4R: another process held the port; the driver found no page) | **QuickLaunch was not launched.** My mock driver (`lib.mjs`) now proves ownership before it opens a socket: it finds the process LISTENING on the chosen port in the OS socket table (`netstat -ano`), reads that process's command line, and stops unless it contains this launch's own `--user-data-dir` and `--remote-debugging-port`. Edge headless writes no `DevToolsActivePort` file, so the command line is the equivalent proof; for a real QuickLaunch launch through `quicklaunch-safe-launch.mjs` the rule stays "read the launch's own `DevToolsActivePort` and match the port". **Positive control:** my own browser passes. **Negative control:** with a foreign Node server already holding the port, `launch()` refuses ("owned by pid ... whose command line is not ours"). |
| A cross that reads as a plus (ac-templars F2) | No cross of any kind is drawn in the batch. |
| Art within 3 px of a focus ring (B1 12.1; B3 watch 3) | Bands 8 px wide, so **3 empty pixels** between the art and the ring zone (the distance transform reads 4 px in all seven themes at the three sizes). |
| The brightest surface of a theme pulls the eye (ac-templars banner; B4 Imperium parchment) | The banners here are the same blue gradient as the header (ff6 to ff9) or a dark charcoal or water ground; no light strip. The brightest single area is the ff15 tile outline (`#BFC5CC`, a watch item with a one-hex lever). |
| The version line in another face than the title (ac-templars F4) | Each theme sets `--font` and the version inherits it, so the version matches the body face. ff6 (Georgia title, Segoe UI version) and ff9 (Gabriola title, Constantia version) are deliberate: the display face is for the title only. |
| Placeholder text is below 4.5:1 (B3R section 5; a base default of `#757575`) | Every theme adds `.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }` and the tables list the three placeholder pairs. The base-level fix stays an offer for Sergei. |
| Contrast pairs must use the real cascade | `#btn-done-edit` and `#btn-close-settings` set their own `color` by id, which beats `button:hover { color:#fff }`; their hover text therefore stays `--btn-done-color` and `--btn-close-color`, not white. The `.update-btn`, header buttons and `+ FILE` hover text is white. |
| A plate cut shows only past the mock plate's own rounding (B1 12.1 item 3: 21 percent) | Where a theme names a plate shape it is a silhouette that starts at 22 percent or more (octagon, arch, rounded 20 px, chamfered bottom); ff6, ff8 and ff14 keep the app's own rounded plate (`none`) and say so. **Real icons too (review F1, added to the plate-margin check):** a cut that clears the six mock glyphs can still crop a real mark, so every shaped plate is also tried on real icons (the foobar2000 file icon `C:\Program Files\foobar2000\icons\generic.ico`, QuickLaunch's own `icon.png`, GlideX, Virtual Pet, Vortex, two Bitdefender icons), as the share of the plate lost to the cut (drop shadow off, cut against uncut) and by eye at 6x. The bar is "no mark cropped": the corners of a full-bleed background may go; a letter, the foot of a glyph or the base of a drawing may not. Measured in the review: ff7, ff9 and ff15 lose background corners only (GlideX 6.6, 8.8 and 3.1 percent of the plate; every mark whole), accepted; ff10 at 28 px cropped the F and K of FB2K and the base of the laptop, so it is 20 px. |
| Generated text exposed to screen readers (swl-dragon F3) | No `content` string in the batch except `''`. |
| A spec text that disagrees with its table (doom-classic F7) | The `:root` blocks, the rules blocks, the SVG sources and every contrast table here were **generated from one data file**, and the seven prototype CSS files were built from the same text and gated and rendered (0.4). |

### 0.3 The shared window kit, and the frame kit that holds it

**The frame kit is unchanged from B4 0.3**: the same zones, the same layer order, the same sizes (header line, header art HZ 84 x 20, top course 9 px, 8 px side bands with 8 x 8 corner caps, banner top course up to 7 px, banner motif 84 x 34 at `right 12px bottom 0` with `margin-right: 90px` on the banner text, banner icon 22 x 22, window clip, tile plate). All numbers are at 424 x 300 and hold at any size (the zones are anchored to the window edges, never scaled). The container's background is the same stack of four corner caps over two side strips over a top course:

```css
#grid-container {
  background:
    CORNER left 1px top 0 / 8px 8px no-repeat,
    CORNER right 5px top 0 / 8px 8px no-repeat,
    CORNER left 1px bottom 0 / 8px 8px no-repeat,
    CORNER right 5px bottom 0 / 8px 8px no-repeat,
    SIDE left 1px top 0 / 8px <tile height> repeat-y,
    SIDE right 5px top 0 / 8px <tile height> repeat-y,
    TOP left 0 top 0 / 24px 9px repeat-x;
}
```

**The window kit (new in this batch).** The audit's family note asks for one shared static window treatment. The menu window of FF6 to FF9 is a vertical-gradient panel with a thin light border, white text and a hand cursor; in QuickLaunch the natural windows are the **tiles**, the **header** and the **banner**, so that is where the treatment goes. One recipe, written once; every theme fills the values:

| Piece | Recipe (all static; no animation, no filter, no blur) |
|---|---|
| Tile window | `.app-tile { background: linear-gradient(180deg, TOP 0, BOTTOM 100%); border-color: EDGE; border-radius: R; box-shadow: inset 0 1px 0 LIT; }` (the lit edge is the one-pixel highlight of the PS1 and SNES window) |
| Tile hover and focus | `.app-tile:hover, .app-tile:focus-visible { background: linear-gradient(180deg, HTOP 0, HBOT 100%); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }`; `.app-tile:active` takes the same gradient as hover (the base scale 0.96 is the press) |
| Header | `#header { background: linear-gradient(180deg, HTOP 0, HBOT 100%); }` with the 3 px (or 1 px) line inside the header |
| Banner | the gradient is the **bottom layer** of `#theme-banner`'s background, under the top course and the motif |
| Text | cream or white, a hard 1 px black drop (`1px 1px 0 #000000`, no blur) on the labels and the banner text in ff6, ff7 and ff9 only; none elsewhere |
| Plates | `--tile-icon-fx` always lifts brightness (1.05 to 1.25) with a mild saturation or contrast change, so the mock plates keep 3:1 on the darkest-to-lightest ground (the budget below) |
| Settings, edit bar, pickers | flat colours (no gradient): the contrast tables stay one number per pair |

**The three intensities of the recipe.**

| Theme | Intensity | Header and banner gradient (lightest to darkest) | Tile gradient | Tile border |
|---|---|---|---|---|
| ff6 | blue window | header `#2B4DB4` to `#12206C`; banner `#2B4DB4` to `#12206C` | `#15277A` to `#0A1250` (hover `#2A2A78` to `#17124E`) | `#8EA0DC` |
| ff7 | blue window | header `#3A5AA8` to `#0A1240`; banner `#3A5AA8` to `#0A1240` | `#101E66` to `#060C34` (hover `#17307C` to `#0A1448`) | `#9AA6C8` |
| ff8 | blue window (icy) | header `#3C5A7C` to `#141F33`; banner `#3C5A7C` to `#141F33` | `#1B2F4C` to `#0D182A` (hover `#22395C` to `#12213A`) | `#6A819C` |
| ff9 | blue window (warm frame) | header `#2E5890` to `#14244E`; banner `#2E5890` to `#14244E` | `#14286E` to `#0A1444` (hover `#1A3278` to `#0F1E58`) | `#B7842B` |
| ff10 | deep water | header `#1E5A80` to `#0A2238`; banner `#1E5A80` to `#0A2238` | `#0E2A40` to `#07182A` (hover `#103A54` to `#0A2438`) | `#3C86AE` |
| ff14 | shallow charcoal | header `#322F3D` to `#1E1C27`; banner `#322F3D` to `#1E1C27` | `#252330` to `#1B1924` (hover `#2E2B3A` to `#221F2C`) | `#B9975B` |
| ff15 | shallow charcoal | header `#262B33` to `#14171B`; banner: warm glow low on the left (`#3C2312` to `#23211F` to `#121418`) | `#1B1F25` to `#14171B` (hover `#262B33` to `#1B1F25`) | `#BFC5CC` |

**Why the tiles are deep and the header and banner are bright (the luminance budget, computed).** Light text needs a ground of relative luminance 0.183 or less for 4.5:1 (white) and the dim version text needs less; the header and banner carry only text, so they can be the bright blue. An icon plate needs 3:1 against the tile ground, and the dull Calculator plate (`#6B6F76`) is the binding one: after the fx filter it allows only the ground luminance in the table below, so the tile gradient must stay a deep navy, brightness is lifted by the fx filter, and the light blue lives in the header, the banner, the border and the lit edge.

| Theme | `--tile-icon-fx` | Ground allowed for plates (luminance) | Lightest tile stop (rest / hover) | Lightest header stop | Header text ratio (title / dim version) |
|---|---|---|---|---|---|
| ff6 | `brightness(1.18) saturate(0.95)` | 0.042 (Calculator binds) | 0.030 / 0.035 | 0.091 | 6.51 / 5.23 |
| ff7 | `brightness(1.18) saturate(0.95)` | 0.042 (Calculator binds) | 0.020 / 0.038 | 0.110 | 5.12 / 4.95 |
| ff8 | `brightness(1.25) saturate(0.85)` | 0.052 (Calculator binds) | 0.028 / 0.040 | 0.097 | 5.98 / 4.65 |
| ff9 | `brightness(1.2) saturate(0.95)` | 0.045 (Calculator binds) | 0.028 / 0.039 | 0.096 | 6.10 / 5.43 |
| ff10 | `brightness(1.2) saturate(0.95)` | 0.045 (Calculator binds) | 0.021 / 0.038 | 0.091 | 6.72 / 4.80 |
| ff14 | `brightness(1.15) contrast(1.04) saturate(0.92)` | 0.038 (Calculator binds) | 0.018 / 0.026 | 0.030 | 9.90 / 5.98 |
| ff15 | `saturate(0.8) brightness(1.05)` | 0.025 (Calculator binds) | 0.013 / 0.024 | 0.024 | 12.46 / 7.26 |

**What differs between the four blue windows and why a fan sees four games** (the squint sheet, `judy/b5/out/squint_sheet.png` in the scratchpad):

| | ff6 | ff7 | ff8 | ff9 |
|---|---|---|---|---|
| Window blue | royal `#2B4DB4` to `#12206C` | PS1 `#3A5AA8` to `#0A1240` | icy grey-blue `#3C5A7C` to `#141F33` | blue `#2E5890` to `#14244E` |
| Accent | gold | mako green | icy blue, one blue and one red | brass |
| Border | light blue | blue-steel | thin grey-blue | brass |
| Frame material | riveted rail, gear teeth | double steel pipes | silver hairlines and slashes | wood, brass diamonds, red valance |
| Header art | three gears | pipe and mako vial | slashes and crescent | marionette bar |
| Banner motif and icon | airship and glove | Midgar and orb | moon trail and moon | castle and crystal |
| Window | rounded 8 px | square | one cut corner | rounded 14 px |
| Tile | 6 px radius, plate none | square, octagon plate | square, plate none, blue-red stripes on hover | arch top, arch plate |
| Type | Georgia title, Segoe UI Semibold | Bahnschrift 600 | Jost 300 and 350 | Gabriola, Constantia italic |

**Where ff10, ff14 and ff15 stand.** ff10 is the same recipe in dark water (it still reads as a window family member, a fan will place it next to the four). ff14 and ff15 are deliberately **not** the blue window: the audit's ff14 pitfall is "using the old blue window (that is FF7)" and ff15 is a desaturated road-trip look. They use the gradient at charcoal intensity (a shallow vertical fall of one or two steps) so the recipe, not the blue, is what they share.

### 0.4 How this spec was verified (I could render, without launching QuickLaunch)

I built the **post-Foundation mock window** again: the repo's `base.css`, `index.html` and the seven bundled fonts, the gallery's mock tiles (`scripts/theme-gallery/mock-data.cjs`), one candidate theme file per run, driven in headless Edge 154 over the DevTools protocol at 424 x 300, 640 x 420 and 1024 x 700 (not QuickLaunch, not Electron; every launch on a temp profile in the scratchpad, with the port-ownership check of 0.2). The candidate files were **built from the text of this spec** (a generator writes the CSS and the tables from the same data). On that mock I measured, for all seven:

- **Gate:** the real `check-theme-contrast.js`, run on the seven files in a temp skeleton with an empty baseline: **7 checked, 0 errors, 0 legacy warnings**. **Positive control:** with `--text-dim` set to `#4A3A3A` in one copy the same run reports the error (1.78:1); restored, none.
- **Title edges, label widths, banner lines:** real fonts, real tracking. Every standard label fits the 100 px box with no ellipsis; every banner line fits on one line (`scrollWidth <= clientWidth`) at 424 and 640. A tile with a long name ("Visual Studio 2022") ellipsizes in every theme, as in B4 (offer b of B4R, a base property).
- **A/B/C overlap probe** at the three sizes, in the chip, edit-bar, update-bar and edit-plus-update states, and with a focus ring on the first and last column (the ring is forced with a class that applies the theme's own focus rule). **Art-off override** (the same for all seven): `#header::after, #header::before, #theme-banner::before { visibility:hidden }`, `#grid-container { background:none }`, `#theme-banner { background: <the theme's own banner surface> }` (so a gradient banner is **not** counted as art: the gradient is the surface the text sits on, not decoration over it), content-off hides the title, version, buttons, chip, grid, banner text, edit bar and update bar. **Result: overlap 0 px and art in the keep-out 0 px in all 77 runs (11 states and sizes x 7 themes).** **Positive control:** a magenta block planted over the title in the art layer reads 200 to 295 px of overlap (it can fail). **Corner tolerance (new):** a rounded or cut window clip antialiases a few levels differently between two captures, which the probe read as 3 px "content" at the top-left clip edge in ff6; inside the four corner squares (the clip radius plus 2 px) only differences above 60 levels count, everywhere else the threshold stays 10.
- **Window clips:** with a magenta backdrop, the four corners of the title, version, header buttons, banner text, banner icon, edit bar buttons, update bar controls and the settings title and footer buttons (at 424 x 300 and 640 x 420) are all painted: **0 clipped points in every state**, including the rounded windows (ff6, ff9, ff10, ff14) and the cut corner of ff8.
- **Hidden-tiles sigma:** 0.00 for all seven (no texture layer; the gradients are on the tiles, the header and the banner, none behind the tile field).
- **Fonts:** the platform fonts the mock actually used per element are in each type section (`CSS.getPlatformFontsForNode`); a misspelled family falls back to `serif` (319.2 px against 319.2 px, the negative control).
- **Spec text to CSS (new):** I rebuilt each of the seven theme files from the **text of this spec alone** (the `:root` block, the rules block, the SVG sources and the placeholder encoding of B1 0.2) and compared the bytes with the files the verification ran on: **all seven identical**. Positive control: changing one hex in a copy is reported. No CSS value changed after the last verification run of each theme; only two comments in the rules block ("faction" reworded to "game") changed afterwards.
- **Plate margins:** the six mock glyphs were rasterised at 4x and measured against each clip shape (`shapes.mjs`), so every margin in the tile notes is a computed distance, not an impression.
- **Descender sweep:** 4 labels x 3 scales (1x, 1.5x, 2x) x 2 label sets per theme: built render against an unclipped reference, in the 8 px band under the label box. The box itself is not compared: LCD antialiasing differs inside it between clipped and unclipped text (a first version of the sweep compared the box and reported 100 to 300 px of difference that was only that).

**Caveats.** Chromium 154 is not Electron 32; sub-pixel text and filter rounding can differ, so **Ender's numbers win** over mine where they differ. The renders are the target look, not a pixel contract. I did not see: the skin-picker list open, the empty-library drop hint, the updater error bar, real application icons on the shaped plates (only the six mock glyphs). The prototypes and renders are in the session scratchpad at `judy/b5/` (`themes/<theme>.css`, `verify/<theme>/`, `out/`); **this spec's text is the contract.**

### 0.5 Deletions per theme (pattern in B1 0.3; here are the keyframe sets)

Delete every rule listed in B1 0.3 in each file, plus these `@keyframes`, which nothing else uses: ff6 `ff6-armor`, `ff6-readout`, `ff6-title`, `ff6-border`, `ff6-debris`; ff7 `ff7-sword`, `ff7-readout`, `ff7-title`, `ff7-border`, `ff7-lifestream`; ff8 `ff8-blade`, `ff8-readout`, `ff8-title`, `ff8-border`, `ff8-wind`; ff9 `ff9-crystal`, `ff9-readout`, `ff9-title`, `ff9-border`, `ff9-stardust`; ff10 `ff10-sphere`, `ff10-readout`, `ff10-title`, `ff10-border`, `ff10-pyreflies`; ff14 `ff14-hud`, `ff14-readout`, `ff14-title`, `ff14-border`, `ff14-aether`; ff15 `ff15-regalia`, `ff15-readout`, `ff15-title`, `ff15-border`, `ff15-sparks`. Also delete each file's `.app-tile::before` shape and `.app-tile:hover::before` animation rules (`tile-scan-v` in ff6 and ff14, `tile-radial` in the other five; both one-shot, replaced by `.app-tile::before { display:none; }`), the `--banner-icon-anim` and `--title-anim` values (set to `none`), and set `--app-entrance-anim: entrance-fade 0.8s ease-out forwards` (the legacy values were `entrance-fade` at 1.5 to 1.8 s). Every legacy file also has a painted panno, a readout, header text, an edit-bar quote and a particle layer; all of them go (B1 0.3).

The new files are **short**: 9.9 to 14.5 KB each (the legacy files are 16.1 to 24.0 KB), mostly SVG data URIs.

### 0.6 Motion inventory (before to after; method B1 0.7)

Tier key (create-theme.md, cheapest first): 1 opacity or transform, 2 colour or text-shadow, 3 filter, 4 background-position or size, 5 box-shadow, 6 clip-path. Counted from the seven legacy files (`grep infinite` and the `--title-anim` and `--banner-icon-anim` values); every legacy hover animation is a one-shot `forwards` (none infinite):

| Theme | Today (infinite, running at capture) | Hover-only today | After |
|---|---|---|---|
| ff6 | 6: ff6-title (2); banner-pulse (1); ff6-armor (1); ff6-readout (2); ff6-border (5); ff6-debris `#particles` (4) | one-shot `tile-scan-v .5s` | **0** |
| ff7 | 6: ff7-title (2); banner-pulse (1); ff7-sword (1); ff7-readout (2); ff7-border (5); ff7-lifestream `#particles` (4) | one-shot `tile-radial .55s` | **0** |
| ff14 | 6: ff14-title (2); banner-pulse (1); ff14-hud (1); ff14-readout (2); ff14-border (5); ff14-aether `#particles` (4) | one-shot `tile-scan-v .5s` | **0** |
| ff8 | 6: ff8-title (2); banner-pulse (1); ff8-blade (1); ff8-readout (2); ff8-border (5); ff8-wind `#particles` (4) | one-shot `tile-radial .55s` | **0** |
| ff9 | 6: ff9-title (2); banner-pulse (1); ff9-crystal (1); ff9-readout (2); ff9-border (5); ff9-stardust `#particles` (4) | one-shot `tile-radial .55s` | **0** |
| ff10 | 6: ff10-title (2); banner-pulse (1); ff10-sphere (1); ff10-readout (2); ff10-border (5); ff10-pyreflies `#particles` (4) | one-shot `tile-radial .55s` | **0** |
| ff15 | 6: ff15-title (2); banner-pulse (1); ff15-regalia (1); ff15-readout (2); ff15-border (5); ff15-sparks `#particles` (4) | one-shot `tile-radial .55s` | **0** |
| **Batch total** | **42** | 0 infinite | **0** |

No new infinite animation is added anywhere (the "no higher than today" limit is met at 0). There is no `will-change` in any theme file, no `backdrop-filter`, no `@keyframes`, no `animation:` property. The only motion left in any state is the base one-shot `transition` on tiles (0.12 s) and the one-shot entrance fade. By the measured tiers in `create-theme.md`, a whole animated theme costs 55 to 83 percent of one core while focused; these seven cost the 0.5 percent idle floor. Acceptance: `grep -c infinite <theme>.css` is 0 for all seven and the after-run `loopingAnimationsAtCapture` is 0 for all seven (it was 6 in each).

### 0.7 Fonts used

| Family (CSS) | File(s) | Themes | Cyrillic |
|---|---|---|---|
| **`Jost`** (bundled, variable 100 to 900) | `fonts/jost/Jost-VF.ttf` | ff8 title (300), labels (350, uppercase 11 px) and banner (300); ff15 the same | yes |
| **`Cinzel`** (bundled, variable 400 to 900) | `fonts/cinzel/Cinzel-VF.ttf` | ff14 title (600, 11 px, 3 px tracking) | no; the title is Latin markup, falls to Palatino Linotype |
| Segoe UI Semibold | `seguisb.ttf` | ff6 labels and banner | yes |
| Georgia (bold) | `georgiab.ttf` | ff6 title only (all caps, no figures) | yes |
| Bahnschrift (variable; SemiCondensed through `font-stretch: 87.5%`) | `bahnschrift.ttf` | ff7 everything (600) | yes |
| Constantia (regular and italic) | `constan.ttf`, `constani.ttf` | ff9 body, labels and banner (italic, lining figures forced) | yes |
| Gabriola | `Gabriola.ttf` | ff9 title (16 px) | no; Latin title only |
| Segoe UI at **weight 350** (its Semilight face; `font-family: 'Segoe UI'; font-weight: 350`) | `segoeuisl.ttf` | ff10 title, labels and banner; ff14 labels and banner | yes |
| Segoe UI | `segoeui.ttf` | version line fallback in ff8, ff15 (Jost has Cyrillic; this is only the fallback stack) and ff6 body | yes |

Not used: Dela Gothic One, Pirata One, UnifrakturCook, IM Fell English, Metamorphous (approved, not needed here) and every non-approved face (8 lists what I still wish for). **Old-style versus lining figures** (measured again this batch, string "v1.94.3 2022 7-Zip 23.01"): **Constantia draws old-style figures** (forced to lining in ff9 with `font-variant-numeric: lining-nums`, which works: the lining row of the font lab is taller and level); Georgia does too (ff6 uses it for the all-caps title, which has no figures); Jost, Cinzel, Segoe UI (all weights), Segoe UI Semibold, Bahnschrift and Gabriola draw lining figures. **The family name `'Segoe UI Semilight'` does not resolve** in Chromium 154 on this machine: a probe string measures 266.6 px in it, exactly what a nonexistent family measures (266.6 px), while `'Segoe UI Light'` (274.8 px, equal to weight 300), `'Segoe UI Semibold'` (298.3 px, equal to weight 600) and `'Segoe UI'` at weight 350 (281.8 px, between Light and Regular) all resolve. A stack that names `'Segoe UI Semilight'` first therefore falls through to Segoe UI Regular (the platform-font report says only "Segoe UI" for both). ff10 and ff14 use weight 350 on `'Segoe UI'`, which is the real Semilight face: the platform-font report names plain "Segoe UI" for a stack that leads with the family name `'Segoe UI Semilight'` (the first build) and "Segoe UI Semilight" once the weight is used (the final build), so the report can tell them apart. Earlier batches and the shipped themes that name `'Segoe UI Semilight'` render Regular; offered, not fixed (9, facts found). **MS Gothic** (the audit's ff6 label face) was rendered and dropped: it is a clean sans at 12 px, not a pixel font, and its **Cyrillic letters are full-width** (132 px for "Калькулятор", so every Cyrillic name ellipsizes).

### 0.8 Banner lines: what was verified, how, and what was dropped

Method and its limit: for each short candidate I ran a web search for the exact phrase and read what came back; for FF6 and FF8 I also fetched the rpgclassics.com quote archive (its FF7 and FF9 pages returned 404) and for FF6 to FF9 the Wikiquote page. The fetch tool returns an extract, not a raw page, and a first-pass extract was wrong (Locke's line came back as "treasure hunter" where the printed text is "treasure hunting"), so **every wording below follows a page that printed it, not my first read**, and lines with only one printed text are marked. Case is presentation: the banner has no `text-transform` in any theme of this batch, so the strings are exactly what goes into `THEME_BANNERS`. **Standing rule applied: short quotes only, no long passages.** The longest line is 9 words; two are cut at a clause boundary of a longer sentence (ff7 Barret, ff15 Regis) and two are one sentence of a two-sentence line (ff6 Setzer, ff15 Ignis). **No line in this batch is studio-authored.**

| Theme | Line (in order) | Words | Speaker | Source |
|---|---|---|---|---|
| ff6 | `I prefer the term treasure hunting!` | 6 | Locke | quotes.net (three scene excerpts print "I *prefer* the term treasure hunting!"); the Wikiquote and IMDb pages for the game came up for the same query. The wording follows quotes.net (my first summary of the Wikiquote page said "treasure hunter", so the exact form rests on quotes.net) |
| ff6 | `My life is a chip in your pile.` | 8 | Setzer, on joining the party | quotes.net ("My life is a chip in your pile. Ante up!", first sentence kept); the Wikiquote, IMDb and Fandom quote pages came up for the same query. One page printed the text |
| ff6 | `I'm a god! I'm all-powerful!` | 5 | Kefka | the FF6 tumblr quote post and TheGamer's Kefka quote list (search excerpts); the first two sentences of a longer line |
| ff7 | `Not interested.` | 2 | Cloud (his tagline) | Wikiquote (the character's tagline), TV Tropes (LostInTranslation) and CBR (search excerpts) |
| ff7 | `Let's mosey.` | 2 | Cloud, the original English script | Rock Paper Shotgun (via the Steam announcement) on the fan translation that restores every "let's mosey", The Lifestream and Eggs Over-Seas (search excerpts) |
| ff7 | `There ain't no gettin' offa this train we're on.` | 9 | Barret | IMDb, Wikiquote, icybrian.com and the Final Fantasy VII script on the Fandom wiki (search excerpt prints the full line, which continues "till we get to the end of the line"; cut at the clause so it fits one line, ends with a period) |
| ff14 | `Hear. Feel. Think.` | 3 | Hydaelyn | TV Tropes (Hydaelyn character page) and Wikipedia (Endwalker), search excerpts |
| ff14 | `A smile better suits a hero.` | 6 | Haurchefant | the official FINAL FANTASY XIV account on X, the Fandom wiki, DualShockers and the Lodestone (search excerpts) |
| ff8 | `...Whatever.` | 1 | Squall (his catchphrase) | Legends of Localization, Wikipedia and TV Tropes (search excerpts), and the rpgclassics.com archive (fetched: "Yeah, Whatever") |
| ff8 | `Booyaka!` | 1 | Selphie | the rpgclassics.com FF8 quote archive (fetched page text) and TV Tropes (YMMV page, search excerpt) |
| ff8 | `Everything will be fine now...` | 5 | Squall (review F5, replacing `Chicken-wuss.`) | Wikiquote's Final Fantasy VIII page (fetched): it prints this sentence followed by "Because I'm not alone." and two more short sentences; the banner keeps the first sentence and its ellipsis, as `...Whatever.` keeps its dots. An IMDb quote page lists a sibling line from the same scene (search excerpt; the page returned 403 on fetch). **One fetched page.** The first build's `Chicken-wuss.` (Seifer, to Zell; rpgclassics.com prints "Chicken wuss", TV Tropes and the Fandom quote page "chicken-wuss") went because a schoolyard taunt does not belong in the coolest, thinnest window of the batch (flag 5, ruled "swap") |
| ff9 | `You don't need a reason to help people.` | 8 | Zidane | Wikiquote, GameFAQs and IMDb (search excerpts) |
| ff9 | `To be forgotten is worse than death.` | 7 | Freya | Wikiquote, a GameFAQs thread and the Fandom wiki (search excerpts) |
| ff9 | `How do you prove that you exist...?` | 7 | Vivi, the opening cinematic (first sentence) | Goodreads, an X post and the Inverse anniversary article (search excerpts; the line continues "Maybe we don't exist...") |
| ff10 | `Listen to my story.` | 4 | Tidus, the opening line | quotes.net ("Listen to my story. This... may be our last chance.", first sentence kept), TV Tropes and IMDb (search excerpts) |
| ff10 | `This is my story.` | 4 | Tidus | TV Tropes ("This Is My Story" page) and billionquotes.com (search excerpts) |
| ff15 | `I've come up with a new recipe!` | 7 | Ignis (second sentence of "That's it! I've come up with a new recipe!") | the Fandom "Recipe (Final Fantasy XV)" page, Inverse and Too Far Gone (search excerpts) |
| ff15 | `A king pushes onward always.` | 5 | Regis, Episode Ignis (first clause of "A king pushes onward always, accepting the consequences and never looking back.") | search excerpt of the line in Episode Ignis; one displayed text, flagged single-source |

**Not kept** (the 35 lines that were in `THEME_BANNERS` for these seven keys; they were not re-verified in this pass, so "not kept" does not say "false"): ff6: `NOTHING CAN KILL THE MUSIC. NOTHING.`, `LIFE... DREAMS... HOPE... WHERE DO THEY COME FROM? WHERE DO THEY GO?`, `THE ESPERS ARE NOT WEAPONS. THEY ARE LIVING BEINGS.`, `I WILL FIND MY OWN REASON TO FIGHT.`, `SON OF A SUBMARINER!`; ff7: `LET'S MOSEY.`, `THERE AIN'T NO GETTING OFF THIS TRAIN WE'RE ON.`, `I WILL NEVER BE A MEMORY.`, `THE PLANET IS DYING. SLOWLY BUT SURELY IT IS DYING.`, `SOLDIER 1ST CLASS. CLOUD STRIFE.`; ff14: `HEAR. FEEL. THINK.`, `A SMILE BETTER SUITS A HERO.`, `PRAY RETURN TO THE WAKING SANDS.`, `SUCH DEVASTATION. THIS WAS NOT MY INTENTION.`, `THE LIGHT SHALL NOT EXPIRE.`; ff8: `WHATEVER.`, `I DREAMT I WAS A MORON.`, `RIGHT AND WRONG ARE NOT WHAT SEPARATE US. JUST DIFFERENT STANDPOINTS.`, `SEED. BALAMB GARDEN. REPORTING FOR DUTY.`, `EVEN IF THE WORLD BECOMES YOUR ENEMY, I WILL PROTECT YOU.`; ff9: `YOU DON'T NEED A REASON TO HELP PEOPLE.`, `I WILL FIND MY PURPOSE IN LIFE. SOMEDAY.`, `HOW DO YOU PROVE THAT YOU EXIST? MAYBE WE DON'T EXIST.`, `THE CRYSTAL TELLS ALL.`, `TO BE FORGOTTEN IS WORSE THAN DEATH.`; ff10: `THIS IS MY STORY.`, `NOW! THIS IS IT! NOW IS THE TIME TO CHOOSE!`, `STAY AWAY FROM THE SUMMONER!`, `SIN IS OUR PUNISHMENT FOR OUR VANITY.`, `I KNOW IT SOUNDS SELFISH. BUT THIS IS MY STORY.`; ff15: `A KING PUSHES ONWARD ALWAYS, ACCEPTING THE CONSEQUENCES.`, `WALK TALL, MY SON.`, `THAT'S IT! I'VE COME UP WITH A NEW RECIPE!`, `THE LINE BETWEEN LIGHT AND DARKNESS IS PAPER THIN.`, `KINGS OF LUCIS. COME TO ME.`. Kept in a verified, shorter or sentence-case form: ff7 "Let's mosey." and the Barret train line, ff8 "...Whatever.", ff9 "You don't need a reason to help people.", "How do you prove that you exist...?" and "To be forgotten is worse than death.", ff10 "This is my story.", ff14 "Hear. Feel. Think." and "A smile better suits a hero.", ff15 the Ignis line (second sentence only) and the Regis line (first clause only).

**Line counts after:** ff6 3, ff7 3, ff14 2, ff8 3, ff9 3, ff10 2, ff15 2 (18 lines; the rotation code has no minimum; the comment above `THEME_BANNERS` was stale, B1 12.8 watch item 1, B3 F6 and B4 F2; Ender reworded it to "(2 to 6 per theme)" at the batch-5 review, F2, which is true of all 101 keys).

**Fit (measured on the mock with the real fonts and tracking; the text box at 424 px starts at x 46 and ends at x 320, because of `margin-right: 90px`, so it is 274 px wide):**

| Theme | Widest line (px) | Where it ends | To the text box edge (x 320) | To the motif's first painted pixel |
|---|---|---|---|---|
| ff6 | 197.3 | x 243.3 | 76.7 px | 88.7 px (first painted pixel x 332.0) |
| ff7 | 210.4 | x 256.4 | 63.6 px | 73.2 px (first painted pixel x 329.6) |
| ff14 | 150.4 | x 196.4 | 123.6 px | 133.7 px (first painted pixel x 330.1) |
| ff8 | 160.3 (`Everything will be fine now...`, review F5; the first build's widest, `...Whatever.`, was 77.1) | x 206.3 | 113.7 px | 123.6 px (first painted pixel x 329.9) |
| ff9 | 207.9 | x 253.9 | 66.1 px | 77.7 px (first painted pixel x 331.6) |
| ff10 | 100.9 | x 146.9 | 173.1 px | 183.8 px (first painted pixel x 330.8) |
| ff15 | 189.1 | x 235.1 | 84.9 px | 94.8 px (first painted pixel x 329.9) |

All lines fit on one line at 424 and at 640 (`scrollWidth <= clientWidth`). Ender confirms for every string; the JavaScript block in 9 has the exact entries.

### 0.9 Trademark and signature elements: what is drawn and what is not

| Franchise element | What this spec draws | What it does not draw |
|---|---|---|
| The series | A blue vertical-gradient window with a light border and a lit top edge; a pointing glove (the menu cursor, drawn as a generic white glove with a gold cuff) | The Final Fantasy logo (Amano artwork), any Amano illustration, the moogle, the chocobo and the cactuar |
| FF6 | Gears, an airship (a generic envelope with a gondola), a glove | The Magitek armour, the Warring Triad, espers, any character |
| FF7 | Pipes, a glass vial, a stepped skyline with drums, a glass orb in a socket | The Buster Sword, the Shinra logo, the Midgar plate poster, the Materia as the game draws it, any character |
| FF14 | A hotbar, a limit gauge, a crystal and a ring | The Eorzean and Scion crests, the logo, the moogle and wing marks |
| FF8 | Hairlines, a moon with craters, a blue and a red stripe | The gunblade, the lion, the wing logo mark, the GF art, the Triple Triad card faces |
| FF9 | A valance, a marionette bar, a castle, a crystal, brass scrolls | The Tantalus and Alexandria crests, the logo, any character |
| FF10 | A node-and-line network, a water drop, ripples | The Yevon insignia, the Spiran script, the logo, the actual sphere-grid node art |
| FF15 | A campsite, a road, a flame | The royal crest and wings, the crown, the Regalia, any character |

### 0.10 Where this spec departs from the audit (and from the Foundation map), and why

| Theme | Audit direction | This spec | Reason |
|---|---|---|---|
| all | gutter rules and ticks; art in the frame; header text deleted or 14 characters | frame art in the 8 px bands only; no header text; the shared kit of 0.3; the window kit on tiles, header and banner | the gutters move with the window width (B1 0.1); the audit's batch note asks for one kit and one window treatment |
| ff6 | gear-tooth banner top, a scalloped curtain fold in the header, a pointing-hand banner icon, MS Gothic labels, Georgia title, 6 px tiles, purple on hover only | gear teeth on the banner top and a **gear row in the header** (the curtain moves to ff9), the glove, **Segoe UI Semibold** labels, Georgia title, 6 px tiles, purple only in the hover fill and the edit bar; an airship motif | two themes of one family should not share a motif; MS Gothic was rendered: it is not a pixel font at 12 px and its Cyrillic letters are full-width (a name like "Калькулятор" is 132 px and ellipsizes) |
| ff7 | `#5B7FC0` to `#0A1240` header and banner, mako as accent-c and focus, steel borders, red on edit, pipework double rule, a flat Materia orb, 4 px tiles | header and banner start at **`#3A5AA8`**, tile border blue-white `#9AA6C8` (steel stays in the pipes), square tiles and an octagon plate, a Midgar skyline motif, the orb in a socket | the audit's top stop is 4.01:1 for white text and 3.14:1 for the cream text, under 4.5; PS1 windows are square |
| ff14 | Cinzel title (map), gold hairline with corner brackets, slots with a 4 px radius, crystal-blue focus, a floating-ring circle as banner icon | the same, with the focus ring made crystal blue by an explicit `outline-color`, the banner icon drawn as an **aetheryte** (crystal and ring), a hotbar in the header and a gauge in the banner | the audit names crystal-blue focus but the base ring is `--accent-c`; a bare ring around a circle reads as a wheel |
| ff8 | `Segoe UI Light` caps at 90 percent, tracking 1.5 px; a diagonal in the header; a **circle outline** as banner icon; stripe on tile hover; square tiles | **Jost** (the foundation map) 300 and 350, 11 px caps at 1 px; slashes and a crescent in the header; a **moon** as the icon and the motif; the stripes; square tiles; one cut corner on the window | an outline circle reads as a ring or a zero (B4R icon lesson); the map names Jost for ff8 |
| ff9 | scalloped valance on the header top, scroll corners on two pad corners, one crystal as banner icon, Gabriola title, Georgia italic labels, arch-top tiles | the valance as the top course of the frame, scroll curls on **all four** corners, the crystal, Gabriola, **Constantia italic with lining figures**, arch tiles and arch plates, a castle motif and a marionette bar | Georgia draws old-style figures; the audit keeps the tower-and-crystal painted drawing out of the tile field, so the castle lives in the banner |
| ff10 | bg at 0.90 alpha (or 4.5:1 over white), a sphere-grid strip in the header only, three static pyrefly dots in the pad, a **ringed sphere** as banner icon, circle tiles | **opaque**, the sphere-grid network in the header and the banner, nodes on the rails (the pyreflies), a **water drop with ripples** as the icon, rounded 20 px plates | every redesign since batch 3 is opaque (no bleed over a bright wallpaper); a ringed sphere reads as Saturn; a full circle clears the glyphs by only 4.77 px (28 px by 6.37), and the first build's 28 px cropped real icons (review F1), so 20 px |
| ff15 | a static warm gradient bottom-left, thin white outlines only, a **wing-and-crown shape** as banner icon, Segoe UI Light, wide tracking, chamfered-bottom tiles | the glow in the **banner** (behind the icon), thin pale outlines, a **campfire** as the icon, Jost 300 and 350 (the map), chamfered plates | a gradient behind the tile field is tone, but the overlap probe cannot tell tone from art and C5 keeps the field clean; a winged crest is a mark and reads as a bird at 22 px |
| all | banner quotes | quotes replaced by verified short lines (0.8) | B1 0.10; H3; the standing rule for this batch |

### 0.11 Suggested implementation order for Ender

1. **ff8** first (it uses the bundled Jost for title, labels and banner, so it proves the font load, the `Jost 350` label axis, the 11 px label with `line-height: 14.4px`, the hover-stripe shadows and the cut-corner clip), then **ff14** (Cinzel on the title, the focus-ring `outline-color` override, the hotbar HZ) and **ff15** (Jost again, the radial banner gradient).
2. **ff9** (Constantia italic, `lining-nums`, Gabriola title at 16 px, arch plates), **ff6**, **ff7** (the Bahnschrift `font-stretch: 87.5%` title and banner), **ff10**.
3. After each theme: `npm run check:contrast` (no `--rebaseline`), `grep -c infinite`, the gallery after-run, the hidden-tiles shot, the A/B/C probe at the three sizes plus the states shot (with `visibility:hidden` on the banner icon **and the theme's own banner surface kept** in the art-off override, 0.4), the descender sweep of 0.4, and the theme's "Done when". After the fonts: `fontsRendered` (positive control: each adopted family listed; negative control: a misspelled probe family falls back). In the Foundation after-run also check the focus ring on the last column at 640 x 420 and 1024 x 700: expected 3 empty pixels between the art and the ring zone. Before driving any debug port: read the launch's own `DevToolsActivePort` (B4R).

---

## 1. ff6 (FINAL FANTASY VI): DONE

**Audit:** score 2, redraw. Brown-black steampunk with amber text: it picked Vector and Magitek and skipped the SNES two-tone blue window that defines FF6. A Magitek armour walked down between CALCULATOR and BROWSER (a leg behind the BROWSER icon) with beam bars, "SLAVE CROWN ACTIVE" and a mission log around it; the corner-cut icon shape meant nothing. Six infinite animations.
**Direction:** the SNES menu window, then the game around it. Every tile, the header and the banner are the same vertical-gradient blue panel with a light border (the family kit, 0.3); gold is the accent (line, ring, hover border, values), magitek purple appears only in the tile hover fill and the edit bar, text is cream-white with a hard 1 px black drop (the one trait every FF menu shares). The frame is riveted rails with gold rivets and a gear-tooth edge; the header carries three meshing gears (Vector and Magitek), the banner carries an airship (the Blackjack's role in the story, drawn generically) over two clouds, and its icon is the pointing hand. The curtain the audit put in the header moves to ff9, so the two themes do not share a motif. No armour, no crown, no emblem. Static.

### 1.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: inset(0 round 8px);
  --overlay-clip: inset(0 round 8px);
  --bg: #070A22;
  --panel-bg: #0B1034;
  --overlay-bg: #070A22;
  --header-bg: #2B4DB4;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #F6F0D8;
  --text-dim: #CFD8F2;
  --accent-c: #D4A030;
  --accent-m: #F0A8D0;
  --accent-y: #D4A030;
  --accent-text: #F2CB66;
  --border: #8EA0DC;
  --border-h: #D4A030;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #D4A030;
  --title-anim: none;
  --tile-hover-bg: #2A2A78;
  --tile-hover-border: #D4A030;
  --tile-hover-shadow: inset 0 1px 0 #F2CB66;
  --tile-active-bg: #2A2A78;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.18) saturate(0.95);
  --tile-icon-shape: none;
  --tile-label-spacing: 0.3px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: 1px 1px 0 #000000;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #3A60C8;
  --btn-active-bg: #4A70D8;
  --drop-hint-border: #5A6CB0;
  --drop-icon-color: #8EA0DC;
  --hint-sub-color: #CFD8F2;
  --rename-dashed: #D4A030;
  --rename-input-bg: #2A2A78;
  --edit-bar-bg: #2A1238;
  --edit-bar-border: #7A3A6A;
  --edit-label-color: #F0A8D0;
  --edit-label-glow: none;
  --btn-done-color: #F0A8D0;
  --btn-done-border: #9A4A86;
  --btn-done-hover-bg: #44205A;
  --btn-done-hover-glow: none;
  --btn-add-border: #8EA0DC;
  --update-bg: #101A4A;
  --update-border: #D4A030;
  --update-color: #F2CB66;
  --update-btn-border: #D4A030;
  --update-btn-hover-bg: #1E2C78;
  --update-btn-hover-glow: none;
  --btn-close-color: #F2CB66;
  --btn-close-border: #D4A030;
  --btn-close-hover-bg: #1E2C78;
  --btn-close-hover-glow: none;
  --picker-search-bg: #2A2A78;
  --picker-item-hover-bg: #2A2A78;
  --picker-item-active-bg: #1E2C78;
  --picker-placeholder-bg: #2A2A78;
  --skin-btn-active-bg: #1E2C78;
  --remove-btn-bg: #B03A5A;
  --remove-btn-border: #F0A8D0;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#F6F0D8` on `#070A22` | 4.5:1 | **17.08:1** |
| `--text-dim` on `--bg` | `#CFD8F2` on `#070A22` | 4.5:1 | **13.72:1** |
| `--accent-c` on `--bg` | `#D4A030` on `#070A22` | 3:1 | **8.25:1** |
| `--accent-text` on `--bg` | `#F2CB66` on `#070A22` | 3:1 | **12.56:1** |
| `--hint-sub-color` on `--bg` | `#CFD8F2` on `#070A22` | 4.5:1 | **13.72:1** |
| `--btn-close-color` on `--panel-bg` | `#F2CB66` on `#0B1034` | 4.5:1 | **11.87:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the lightest stop**, except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F6F0D8` on `#15277A` | 4.5:1 | **11.46:1** |
| Tile label on tile hover | `#F6F0D8` on `#2A2A78` | 4.5:1 | **10.80:1** |
| Tile label on tile pressed (pressed state) | `#F6F0D8` on `#2A2A78` | 4.5:1 | **10.80:1** |
| Title on header | `#F6F0D8` on `#2B4DB4` | 4.5:1 | **6.51:1** |
| Title dot (`.accent`) on header | `#F2CB66` on `#2B4DB4` | 4.5:1 | **4.79:1** |
| Header version on header | `#CFD8F2` on `#2B4DB4` | 4.5:1 | **5.23:1** |
| Header button glyph on header | `#F6F0D8` on `#2B4DB4` | 4.5:1 | **6.51:1** |
| Header button glyph on button hover | `#FFFFFF` on `#3A60C8` | 4.5:1 | **5.70:1** |
| Filter chip text on chip | `#F2CB66` on `#2A2A78` | 4.5:1 | **7.94:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#2A2A78` | 4.5:1 | **12.35:1** |
| Banner text on banner | `#F6F0D8` on `#2B4DB4` | 4.5:1 | **6.51:1** |
| Header line on header (non-text) | `#D4A030` on `#12206C` | 3:1 | **6.12:1** |
| Edit label on edit bar | `#F0A8D0` on `#2A1238` | 4.5:1 | **9.03:1** |
| Done / close button text on edit bar | `#F0A8D0` on `#2A1238` | 4.5:1 | **9.03:1** |
| + FILE / + INSTALLED text on edit bar | `#F6F0D8` on `#2A1238` | 4.5:1 | **14.79:1** |
| Done button text on its hover fill | `#F0A8D0` on `#44205A` | 4.5:1 | **7.01:1** |
| Settings text on overlay | `#F6F0D8` on `#070A22` | 4.5:1 | **17.08:1** |
| Settings text on panel | `#F6F0D8` on `#0B1034` | 4.5:1 | **16.15:1** |
| Settings label (text-dim) on panel | `#CFD8F2` on `#0B1034` | 4.5:1 | **12.97:1** |
| Settings value / cheat key (accent-text) on panel | `#F2CB66` on `#0B1034` | 4.5:1 | **11.87:1** |
| Settings version value (accent-text) on panel | `#F2CB66` on `#0B1034` | 4.5:1 | **11.87:1** |
| Settings CLOSE text on panel | `#F2CB66` on `#0B1034` | 4.5:1 | **11.87:1** |
| Settings CLOSE text on its hover fill | `#F2CB66` on `#1E2C78` | 4.5:1 | **8.01:1** |
| Hotkey error text (accent-m) on panel | `#F0A8D0` on `#0B1034` | 4.5:1 | **9.86:1** |
| Hotkey input text on input fill | `#F2CB66` on `#2A2A78` | 4.5:1 | **7.94:1** |
| Picker row text on hover fill | `#F2CB66` on `#2A2A78` | 4.5:1 | **7.94:1** |
| Update banner text on update bar | `#F2CB66` on `#101A4A` | 4.5:1 | **10.65:1** |
| Update button text on hover fill | `#FFFFFF` on `#1E2C78` | 4.5:1 | **12.45:1** |
| Drop-hint text (text-dim) on grid ground | `#CFD8F2` on `#070A22` | 4.5:1 | **13.72:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#B03A5A` | 3:1 | **5.84:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#B03A5A` | 3:1 | **5.84:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#D4A030` on `#15277A` | 3:1 | **5.53:1** |
| Focus ring on grid ground (non-text) | `#D4A030` on `#070A22` | 3:1 | **8.25:1** |
| Hover border on grid ground (non-text) | `#D4A030` on `#070A22` | 3:1 | **8.25:1** |
| Hover border on hover fill (non-text) | `#D4A030` on `#2A2A78` | 3:1 | **5.22:1** |
| Theme-picker selected row text (accent-text) on active fill | `#F2CB66` on `#1E2C78` | 4.5:1 | **8.01:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#F2CB66` on `#2A2A78` | 4.5:1 | **7.94:1** |
| Skin search input text (accent-text) on panel | `#F2CB66` on `#0B1034` | 4.5:1 | **11.87:1** |
| Apps-picker search input text (accent-text) on search fill | `#F2CB66` on `#2A2A78` | 4.5:1 | **7.94:1** |
| Rename input text (accent-text) on input fill | `#F2CB66` on `#2A2A78` | 4.5:1 | **7.94:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#CFD8F2` on `#2A2A78` | 4.5:1 | **8.68:1** |
| Skin search placeholder (text-dim, themed) on panel | `#CFD8F2` on `#0B1034` | 4.5:1 | **12.97:1** |
| Apps-picker placeholder (text-dim) on search fill | `#CFD8F2` on `#2A2A78` | 4.5:1 | **8.68:1** |
| Hotkey recording text (accent-m) on input fill | `#F0A8D0` on `#2A2A78` | 4.5:1 | **6.59:1** |
| Update dismiss glyph (text-dim) on update bar | `#CFD8F2` on `#101A4A` | 4.5:1 | **11.63:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#CFD8F2` on `#0B1034` | 3:1 | **12.97:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#D4A030` on `#0B1034` | 3:1 | **7.80:1** |
| Tile border on grid ground (non-text) | `#8EA0DC` on `#070A22` | 3:1 | **7.64:1** |

**Lowest ratio in this theme: 4.79:1 (Title dot (`.accent`) on header).** Lowest text ratio: 4.79:1 (Title dot (`.accent`) on header). Lowest non-text ratio: 5.22:1 (Hover border on hover fill (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | Lightest stop | Darkest stop |
|---|---|---|
| Header | `#2B4DB4` | `#12206C` |
| Tile at rest | `#15277A` | `#0A1250` |
| Tile hover, focus and pressed | `#2A2A78` | `#17124E` |
| Banner | `#2B4DB4` | `#12206C` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.18) saturate(0.95)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#15277A` | Hover `#2A2A78` | Pressed `#2A2A78` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6D96C1` | 4.23:1 | 3.99:1 | 3.99:1 | pass |
| Calculator `#6b6f76` | `#7E838B` | 3.43:1 | 3.24:1 | 3.24:1 | pass |
| Paint `#b07a4f` | `#CD9060` | 4.84:1 | 4.56:1 | 4.56:1 | pass |
| Terminal `#3d4450` | `#48505E` | 1.61:1 | 1.52:1 | 1.52:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#60A2A3` | 4.49:1 | 4.23:1 | 4.23:1 | pass |
| Files `#c09a3e` | `#E0B64F` | 6.85:1 | 6.45:1 | 6.45:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.24:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Gold `#D4A030` is `--accent-c` (8.25:1 on the ground); `--accent-text` is the lighter gold `#F2CB66` (12.56:1). The header and banner gradients stop at `#2B4DB4` at the lightest because white text needs a ground of luminance 0.183 or less (4.5:1) and the dim version text needs `#CFD8F2` on a ground of 0.145 or less; the audit's `#2C58C8` top stop holds the cream text (5.51:1) but leaves the dim version text at 4.42:1, under 4.5, so the header top is one step darker (`#2B4DB4`: 6.51:1 and 5.23:1). Magitek purple appears only as the hover and pressed tile fill (`#2A2A78` to `#17124E`) and the edit bar (`#2A1238`).

### 1.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | 'Segoe UI', Arial, sans-serif |
| `#title` | Georgia 700, 12 px, tracking 2.5 px, uppercase from the markup, `line-height: 1.2` |
| `.tile-label` | Segoe UI Semibold (the face's own weight, `--tile-label-weight: 400`), 12 px, 0.3 px, user case, 1 px black drop; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | Segoe UI Semibold, 12 px, 0.3 px, sentence case, 1 px black drop |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 146.47** (gate 156; 9.5 px under, 21.5 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 49.7, CALCULATOR 57.8, PAINT 28.9, TERMINAL 48.8, BROWSER 45.9, FILES 25.4 px, no ellipsis. Tile height 95.39 px (94.7 to 95.4 required). Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; the old `overflow: hidden` clip cuts 128 px in the same band (positive control). **Platform fonts the mock used:** title Georgia x12; labels Segoe UI Semibold x7; banner Segoe UI Semibold x28; version and settings Segoe UI x7. Expected `fontsRendered` for the web faces: none (stock only).

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Segoe UI Semibold covers it (checked: "Калькулятор", "Жёсткий диск"). MS Gothic was tried and dropped: its Cyrillic letters are full-width, so "Калькулятор" is 132 px and ellipsizes.

### 1.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #2B4DB4 0, #12206C 100%); border-bottom-color: #D4A030; box-shadow: inset 0 -2px 0 #D4A030; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #D4A030; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): three meshing steel gears with gold hubs (10, 8 and 6 teeth) between two short steel rails with gold end caps. Painted pixels at x 168.5 to 251.5, y 11.0 to 29.8. Hidden while the chip shows. The title ends at x 146.5, the scene starts at x 168: 21.5 px clear.

**B. Frame (the kit of 0.3).** a blue rail on the ground with 1 px light edges and a gold rivet with a steel cross-pin every 20 px down both sides; the top course is a light edge, a blue body with gold dots, a gold line and a row of gold-brown gear teeth hanging below it (4 px teeth every 8 px); each corner is a gold bracket with a rivet. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner is the family gradient (`#2B4DB4` to `#12206C`) with a 1 px light top border; its top course is a row of gold gear teeth rising from a steel rail (4 px teeth every 8 px); the icon is the **pointing glove** (a white glove with a gold cuff, thumb up, index finger to the right, three curled fingers, dark navy outline; the SNES and PS1 menu cursor); the right end is an **airship**: a steel-cream envelope with riveted seams and a gold band, tail fins, a rear propeller, a nose cap, a gondola with three lit windows and two clouds. The motif's painted pixels are at x 332.0 to 412.0, y 270.1 to 300.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 88.7 px (0.8). The banner row of the probe reads 4 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: a rounded rectangle, 8 px radius (SNES windows are rounded); `--overlay-clip` is the same value. Tiles: the menu window: a vertical gradient (`#15277A` to `#0A1250`), a 1 px light-blue border, a 1 px lit top edge, radius 6 px; the plate keeps the app's own rounded square (`--tile-icon-shape: none`: a clip rounder than 21 percent would be the only visible change and the SNES window has none).

**Trademark note.** The FF6 logo (Amano brushwork), the Magitek armour, the Warring Triad statues, any esper and every character are not drawn. The gears, the airship and the glove are generic parts.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B03A5A; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the game's emblem in the art zone */
#header { background: linear-gradient(180deg, #2B4DB4 0, #12206C 100%); border-bottom-color: #D4A030; box-shadow: inset 0 -2px 0 #D4A030; }
#header::before { background: #D4A030; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Georgia, 'Times New Roman', serif; font-weight: 700; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 12px; letter-spacing: 2.5px; color: #F6F0D8; text-shadow: none; }
#title .accent { color: #F2CB66; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNER@ left 1px top 0 / 8px 8px no-repeat,
    @CORNER@ right 5px top 0 / 8px 8px no-repeat,
    @CORNER@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNER@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 20px repeat-y,
    @SIDE@ right 5px top 0 / 8px 20px repeat-y,
    @TOP@ left 0 top 0 / 24px 9px repeat-x;
}

/* tiles: the menu window (a vertical gradient, a 1 px light border, a 1 px lit top edge) */
.app-tile { background: linear-gradient(180deg, #15277A 0, #0A1250 100%); border-color: #8EA0DC; border-radius: 6px; box-shadow: inset 0 1px 0 #6C82D8; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: linear-gradient(180deg, #2A2A78 0, #17124E 100%); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: linear-gradient(180deg, #2A2A78 0, #17124E 100%); }
.tile-label { font-family: 'Segoe UI Semibold', 'Segoe UI', Arial, sans-serif; overflow: clip; overflow-clip-margin: 3px; }

/* banner: surface, a top course, the game's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, linear-gradient(180deg, #2B4DB4 0, #12206C 100%);
  border-top-color: #8EA0DC;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Segoe UI Semibold', 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 400; letter-spacing: 0.3px; text-shadow: 1px 1px 0 #000000; color: #F6F0D8; margin-right: 90px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CORNER@` | `corner` |
| `@SIDE@` | `side` |
| `@TOP@` | `top` |
| `@MOTIF@` | `motif` |
| `@BTOP@` | `btop` |
| `@ICON@` | `icon` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#...)` in the SVGs that carry a `<radialGradient>` or `<linearGradient>`, which `enc()` turns into `%23`):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<path d='M2 10 H18 M66 10 H82' stroke='rgb(58,66,104)' stroke-width='3' stroke-linecap='round'/><path d='M2 10 H18 M66 10 H82' stroke='rgb(142,152,184)' stroke-width='1.2' stroke-linecap='round'/><circle cx='3.4' cy='10' r='1.4' fill='rgb(212,160,48)'/><circle cx='80.6' cy='10' r='1.4' fill='rgb(212,160,48)'/>
<path d='M36.78 9.93 L39 10.51 L38.84 12.08 L36.55 12.21 L35.77 14 L37.22 15.78 L36.16 16.96 L34.24 15.72 L32.55 16.71 L32.68 18.99 L31.13 19.33 L30.3 17.19 L28.35 17 L27.12 18.93 L25.67 18.29 L26.25 16.07 L24.79 14.77 L22.66 15.6 L21.86 14.24 L23.63 12.79 L23.22 10.87 L21 10.29 L21.16 8.72 L23.45 8.59 L24.23 6.8 L22.78 5.02 L23.84 3.84 L25.76 5.08 L27.45 4.09 L27.32 1.81 L28.87 1.47 L29.7 3.61 L31.65 3.8 L32.88 1.87 L34.33 2.51 L33.75 4.73 L35.21 6.03 L37.34 5.2 L38.14 6.56 L36.37 8.01 Z' fill='rgb(142,152,184)' stroke='rgb(58,66,104)' stroke-width='0.8' stroke-linejoin='round'/><circle cx='30' cy='10.4' r='3' fill='rgb(212,160,48)' stroke='rgb(120,84,24)' stroke-width='0.7'/><circle cx='30' cy='10.4' r='1.14' fill='rgb(58,66,104)'/><path d='M51.8 9.34 L53.57 10.03 L53.27 11.54 L51.36 11.48 L50.32 13.03 L51.08 14.77 L49.8 15.62 L48.5 14.24 L46.66 14.6 L45.97 16.37 L44.46 16.07 L44.52 14.16 L42.97 13.12 L41.23 13.88 L40.38 12.6 L41.76 11.3 L41.4 9.46 L39.63 8.77 L39.93 7.26 L41.84 7.32 L42.88 5.77 L42.12 4.03 L43.4 3.18 L44.7 4.56 L46.54 4.2 L47.23 2.43 L48.74 2.73 L48.68 4.64 L50.23 5.68 L51.97 4.92 L52.82 6.2 L51.44 7.5 Z' fill='rgb(142,152,184)' stroke='rgb(58,66,104)' stroke-width='0.8' stroke-linejoin='round'/><circle cx='46.6' cy='9.4' r='2.4' fill='rgb(212,160,48)' stroke='rgb(120,84,24)' stroke-width='0.7'/><circle cx='46.6' cy='9.4' r='0.91' fill='rgb(58,66,104)'/><path d='M62.15 11.77 L63.55 12.07 L63.55 13.53 L62.15 13.83 L61.27 15.36 L61.71 16.72 L60.44 17.45 L59.48 16.39 L57.72 16.39 L56.76 17.45 L55.49 16.72 L55.93 15.36 L55.05 13.83 L53.65 13.53 L53.65 12.07 L55.05 11.77 L55.93 10.24 L55.49 8.88 L56.76 8.15 L57.72 9.21 L59.48 9.21 L60.44 8.15 L61.71 8.88 L61.27 10.24 Z' fill='rgb(142,152,184)' stroke='rgb(58,66,104)' stroke-width='0.8' stroke-linejoin='round'/><circle cx='58.6' cy='12.8' r='1.8' fill='rgb(212,160,48)' stroke='rgb(120,84,24)' stroke-width='0.7'/><circle cx='58.6' cy='12.8' r='0.68' fill='rgb(58,66,104)'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='0' width='24' height='1.1' fill='rgb(142,160,220)'/><rect x='0' y='1.1' width='24' height='4.7' fill='rgb(18,32,108)'/><rect x='0' y='5.8' width='24' height='1.2' fill='rgb(212,160,48)'/><rect x='2' y='7' width='4' height='2' fill='rgb(120,84,24)'/><rect x='10' y='7' width='4' height='2' fill='rgb(120,84,24)'/><rect x='18' y='7' width='4' height='2' fill='rgb(120,84,24)'/><circle cx='12' cy='3.4' r='1' fill='rgb(242,203,102)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 20'>
<rect x='0' y='0' width='8' height='20' fill='rgb(18,32,108)'/><rect x='0' y='0' width='1' height='20' fill='rgb(142,160,220)'/><rect x='7' y='0' width='1' height='20' fill='rgb(142,160,220)'/><rect x='1' y='9.4' width='6' height='1.2' fill='rgb(58,66,104)'/><circle cx='4' cy='10' r='2' fill='rgb(212,160,48)' stroke='rgb(120,84,24)' stroke-width='0.7'/><circle cx='3.4' cy='9.4' r='0.6' fill='rgb(242,203,102)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect x='0' y='0' width='8' height='8' fill='rgb(18,32,108)'/><path d='M0.6 7.4 V0.6 H7.4' fill='none' stroke='rgb(212,160,48)' stroke-width='1.2' stroke-linejoin='miter'/><circle cx='4.2' cy='4.2' r='1.6' fill='rgb(212,160,48)' stroke='rgb(120,84,24)' stroke-width='0.6'/><circle cx='3.7' cy='3.7' r='0.5' fill='rgb(242,203,102)'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='4.4' width='24' height='2.6' fill='rgb(58,66,104)'/><rect x='0' y='4.4' width='24' height='0.8' fill='rgb(142,152,184)'/><rect x='2' y='1.4' width='4' height='3.2' fill='rgb(120,84,24)'/><rect x='2' y='1.4' width='4' height='0.9' fill='rgb(212,160,48)'/><rect x='10' y='1.4' width='4' height='3.2' fill='rgb(120,84,24)'/><rect x='10' y='1.4' width='4' height='0.9' fill='rgb(212,160,48)'/><rect x='18' y='1.4' width='4' height='3.2' fill='rgb(120,84,24)'/><rect x='18' y='1.4' width='4' height='0.9' fill='rgb(212,160,48)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<g fill='rgb(48,66,148)'><circle cx='10' cy='30' r='6'/><circle cx='19' cy='28' r='7.5'/><circle cx='29' cy='31' r='6'/><rect x='4' y='30' width='32' height='4'/></g>
<g fill='rgb(48,66,148)'><circle cx='62' cy='31' r='5.5'/><circle cx='71' cy='29' r='7'/><circle cx='79' cy='31' r='5'/><rect x='57' y='31' width='26' height='3'/></g>
<path d='M25 12 L18 5.4 L26.4 8.4 Z M25 14.5 L16 19 L26 17 Z' fill='rgb(120,84,24)' stroke='rgb(12,20,70)' stroke-width='0.6' stroke-linejoin='round'/>
<ellipse cx='44' cy='13.2' rx='21.6' ry='8.6' fill='rgb(196,206,232)' stroke='rgb(12,20,70)' stroke-width='0.9'/>
<path d='M33.6 5.6 C32 9.4 32 17 33.6 20.6 M44 4.6 V21.8 M54.4 5.6 C56 9.4 56 17 54.4 20.6' fill='none' stroke='rgb(142,152,184)' stroke-width='0.7'/>
<path d='M22.6 12 C30 14.6 58 14.6 65.2 12 L65 14.6 C58 17.4 30 17.4 22.8 14.6 Z' fill='rgb(212,160,48)' stroke='rgb(120,84,24)' stroke-width='0.5' stroke-linejoin='round'/>
<path d='M37 21.2 L39 23.4 M51 21.2 L49 23.4' stroke='rgb(58,66,104)' stroke-width='0.8'/>
<rect x='37' y='23.2' width='14' height='5' rx='1.6' fill='rgb(120,84,24)' stroke='rgb(12,20,70)' stroke-width='0.7'/><rect x='39.4' y='24.6' width='2.2' height='1.8' fill='rgb(242,203,102)'/><rect x='42.8' y='24.6' width='2.2' height='1.8' fill='rgb(242,203,102)'/><rect x='46.2' y='24.6' width='2.2' height='1.8' fill='rgb(242,203,102)'/>
<path d='M64.6 9.2 C67.4 10.4 67.4 15.8 64.6 17.2 Z' fill='rgb(212,160,48)' stroke='rgb(120,84,24)' stroke-width='0.5' stroke-linejoin='round'/>
<rect x='13.4' y='7' width='1.8' height='12.4' rx='0.9' fill='rgb(196,206,232)' stroke='rgb(12,20,70)' stroke-width='0.5'/><circle cx='14.3' cy='13.2' r='1.5' fill='rgb(212,160,48)' stroke='rgb(12,20,70)' stroke-width='0.5'/><path d='M15.6 13.2 H19.6' stroke='rgb(142,152,184)' stroke-width='1.1'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<g fill='rgb(12,20,70)' stroke='rgb(12,20,70)' stroke-width='2.4' stroke-linejoin='round'><rect x='5.6' y='8.6' width='8.8' height='8.6' rx='3'/><rect x='11.6' y='8.4' width='9.4' height='3.4' rx='1.7'/><ellipse cx='9.2' cy='6.6' rx='2.5' ry='3.1' transform='rotate(-14 9.2 6.6)'/><ellipse cx='14.9' cy='13.6' rx='2.2' ry='1.9'/><ellipse cx='15.3' cy='15.9' rx='2.1' ry='1.8'/><ellipse cx='14.5' cy='18' rx='1.9' ry='1.6'/></g><g fill='rgb(250,248,236)'><rect x='5.6' y='8.6' width='8.8' height='8.6' rx='3'/><rect x='11.6' y='8.4' width='9.4' height='3.4' rx='1.7'/><ellipse cx='9.2' cy='6.6' rx='2.5' ry='3.1' transform='rotate(-14 9.2 6.6)'/><ellipse cx='14.9' cy='13.6' rx='2.2' ry='1.9'/><ellipse cx='15.3' cy='15.9' rx='2.1' ry='1.8'/><ellipse cx='14.5' cy='18' rx='1.9' ry='1.6'/></g>
<path d='M6.4 15.6 C8.6 17.4 12.4 17.6 14 16' fill='none' stroke='rgb(186,198,230)' stroke-width='1.3' stroke-linecap='round'/>
<path d='M13.4 13.4 H16.4 M13.6 15.7 H16.6' stroke='rgb(186,198,230)' stroke-width='0.7' stroke-linecap='round'/>
<rect x='0.9' y='8.9' width='4.8' height='8.6' rx='1' fill='rgb(212,160,48)' stroke='rgb(12,20,70)' stroke-width='1'/><rect x='1.3' y='9.4' width='1.2' height='7.6' fill='rgb(242,203,102)'/>
</svg>
```

### 1.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | ff6-title (2) | removed |
| 2 | banner-pulse (1) | removed |
| 3 | ff6-armor (1) | removed |
| 4 | ff6-readout (2) | removed |
| 5 | ff6-border (5) | removed |
| 6 | ff6-debris `#particles` (4) | removed |
| hover | one-shot `tile-scan-v .5s` (not infinite) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite ff6.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 1.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `linear-gradient(180deg, #15277A, #0A1250)`, border `#8EA0DC` (1 px), radius 6px, `box-shadow: inset 0 1px 0 #6C82D8` (the lit edge), `::before` off; layout unchanged. Icons: `brightness(1.18) saturate(0.95)` through the app's own plate.
- **Hover:** `linear-gradient(180deg, #2A2A78, #17124E)`, border `#D4A030` (5.22:1 on the hover fill), `box-shadow: inset 0 1px 0 #F2CB66`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (5.53:1 on the tile, 8.25:1 on the grid ground). **Pressed:** base scale 0.96 on the same gradient as hover.
- **Label:** `#F6F0D8`, Segoe UI Semibold (the face's own weight, `--tile-label-weight: 400`), 12 px, 0.3 px, user case, 1 px black drop.
- **Filter chip:** base rule (fill `#2A2A78`, `--accent-c` border, `#F2CB66` text). The header scene hides while it shows.
- **Edit bar:** `#2A1238` fill, `#7A3A6A` rule, label `#F0A8D0`; `+ FILE` and `+ INSTALLED` in `--text` with a `#8EA0DC` border, `DONE` in `#F0A8D0` with a `#9A4A86` border. The tile remove button is `#B03A5A` with a `#F0A8D0` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#070A22`, panel `#0B1034`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#F2CB66` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#F2CB66` text on `#101A4A` with a `#D4A030` rule.

### 1.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite ff6.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#D4A030`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **146.47**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#2B4DB4` to `#12206C` gradient with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 3 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a pointing glove at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#D4A030` border, the hover gradient, the app's own plate, no ellipsis on CALCULATOR (mock 57.8 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): gold for the header line, the rivets, the cogs, the hover border, the ring and the values; purple only in the hover and pressed tile fills and the edit bar; pink only in the edit mode text; no green, orange or red outside the remove button.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 8 px, banner 4 px; at 640 x 420 10 / 8 / 11 px; at 1024 x 700 10 / 8 / 11 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Segoe UI Semibold`, `Georgia` and `Segoe UI`; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 4** (title and banner text covered). What survives: a navy window with blue gradient strips, light borders on every tile, gold rails with rivets and gear teeth, three gears in the header, a glove cursor and an airship in the banner. What is missing for a 5: the Amano logo and any Magitek or opera motif (marks, not drawn) and the SNES pixel type (Press Start 2P is in the wish list).

Watch items for this theme: (1) The glove is the highest-risk icon of the batch. At 22 px it reads as a white glove pointing right; if Sergei reads it as a mitten or a cartoon hand, the lever is the cuff (make it taller) or a plain gold gear as the icon. (2) The hard 1 px black drop under labels is the theme's one text shadow in the batch; it is not a halo (no blur, 1 px offset). Lever: `--tile-label-shadow: none`.

---

## 2. ff7 (FINAL FANTASY VII): DONE

**Audit:** score 2, redraw, legacy contrast failure (text-dim, accent-c, hint-sub). Dark navy with a muddy accent (`#1848A0`), mako green reduced to a minor secondary. A Buster Sword slab stood vertically behind CALCULATOR and BROWSER (its hilt crossing the BROWSER label) with a stat sheet and bars beside it. No PS1 blue window; trapezoid icon crop. Six infinite animations.
**Direction:** the PS1 menu window over Midgar. The family kit gives the blue-to-black windows; mako green is the accent (line, ring, hover border, values, the orb) and steel carries the frame: a double pipe down both sides and along the top, a flange with a mako dot every 24 px. The header carries a pipe run with a mako vial (a reactor tank), the banner a stepped Midgar plate city (a central tower and two reactor drums with lit windows) and a glass Materia orb in a socket as its icon. Red appears only in edit mode. No sword, no Shinra mark. Static.

### 2.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #04070F;
  --panel-bg: #090E22;
  --overlay-bg: #04070F;
  --header-bg: #3A5AA8;
  --font: Bahnschrift, 'Segoe UI', sans-serif;
  --text: #E8E4D0;
  --text-dim: #D8E0F4;
  --accent-c: #2AE6A0;
  --accent-m: #F08A86;
  --accent-y: #2AE6A0;
  --accent-text: #6CF0C0;
  --border: #9AA6C8;
  --border-h: #2AE6A0;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #2AE6A0;
  --title-anim: none;
  --tile-hover-bg: #17307C;
  --tile-hover-border: #2AE6A0;
  --tile-hover-shadow: inset 0 1px 0 #7AF4C8;
  --tile-active-bg: #17307C;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.18) saturate(0.95);
  --tile-icon-shape: polygon(18% 0, 82% 0, 100% 18%, 100% 82%, 82% 100%, 18% 100%, 0 82%, 0 18%);
  --tile-label-spacing: 0.8px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: 1px 1px 0 #000000;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #2A4A98;
  --btn-active-bg: #3A5AA8;
  --drop-hint-border: #4A5A8A;
  --drop-icon-color: #7A8FC0;
  --hint-sub-color: #D8E0F4;
  --rename-dashed: #2AE6A0;
  --rename-input-bg: #17307C;
  --edit-bar-bg: #2A0F12;
  --edit-bar-border: #A03030;
  --edit-label-color: #F08A86;
  --edit-label-glow: none;
  --btn-done-color: #F08A86;
  --btn-done-border: #A03030;
  --btn-done-hover-bg: #451518;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A8FC0;
  --update-bg: #0C1840;
  --update-border: #2AE6A0;
  --update-color: #6CF0C0;
  --update-btn-border: #2AE6A0;
  --update-btn-hover-bg: #17307C;
  --update-btn-hover-glow: none;
  --btn-close-color: #6CF0C0;
  --btn-close-border: #2AE6A0;
  --btn-close-hover-bg: #17307C;
  --btn-close-hover-glow: none;
  --picker-search-bg: #17307C;
  --picker-item-hover-bg: #17307C;
  --picker-item-active-bg: #17307C;
  --picker-placeholder-bg: #17307C;
  --skin-btn-active-bg: #17307C;
  --remove-btn-bg: #A03030;
  --remove-btn-border: #F08A86;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#E8E4D0` on `#04070F` | 4.5:1 | **15.77:1** |
| `--text-dim` on `--bg` | `#D8E0F4` on `#04070F` | 4.5:1 | **15.24:1** |
| `--accent-c` on `--bg` | `#2AE6A0` on `#04070F` | 3:1 | **12.40:1** |
| `--accent-text` on `--bg` | `#6CF0C0` on `#04070F` | 3:1 | **14.26:1** |
| `--hint-sub-color` on `--bg` | `#D8E0F4` on `#04070F` | 4.5:1 | **15.24:1** |
| `--btn-close-color` on `--panel-bg` | `#6CF0C0` on `#090E22` | 4.5:1 | **13.54:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the lightest stop**, except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E8E4D0` on `#101E66` | 4.5:1 | **11.75:1** |
| Tile label on tile hover | `#E8E4D0` on `#17307C` | 4.5:1 | **9.39:1** |
| Tile label on tile pressed (pressed state) | `#E8E4D0` on `#17307C` | 4.5:1 | **9.39:1** |
| Title on header | `#E8E4D0` on `#3A5AA8` | 4.5:1 | **5.12:1** |
| Title dot (`.accent`) on header | `#7AF4C8` on `#3A5AA8` | 4.5:1 | **4.86:1** |
| Header version on header | `#D8E0F4` on `#3A5AA8` | 4.5:1 | **4.95:1** |
| Header button glyph on header | `#E8E4D0` on `#3A5AA8` | 4.5:1 | **5.12:1** |
| Header button glyph on button hover | `#FFFFFF` on `#2A4A98` | 4.5:1 | **8.30:1** |
| Filter chip text on chip | `#6CF0C0` on `#17307C` | 4.5:1 | **8.49:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#17307C` | 4.5:1 | **12.00:1** |
| Banner text on banner | `#E8E4D0` on `#3A5AA8` | 4.5:1 | **5.12:1** |
| Header line on header (non-text) | `#2AE6A0` on `#0A1240` | 3:1 | **11.01:1** |
| Edit label on edit bar | `#F08A86` on `#2A0F12` | 4.5:1 | **7.39:1** |
| Done / close button text on edit bar | `#F08A86` on `#2A0F12` | 4.5:1 | **7.39:1** |
| + FILE / + INSTALLED text on edit bar | `#E8E4D0` on `#2A0F12` | 4.5:1 | **13.98:1** |
| Done button text on its hover fill | `#F08A86` on `#451518` | 4.5:1 | **6.32:1** |
| Settings text on overlay | `#E8E4D0` on `#04070F` | 4.5:1 | **15.77:1** |
| Settings text on panel | `#E8E4D0` on `#090E22` | 4.5:1 | **14.98:1** |
| Settings label (text-dim) on panel | `#D8E0F4` on `#090E22` | 4.5:1 | **14.48:1** |
| Settings value / cheat key (accent-text) on panel | `#6CF0C0` on `#090E22` | 4.5:1 | **13.54:1** |
| Settings version value (accent-text) on panel | `#6CF0C0` on `#090E22` | 4.5:1 | **13.54:1** |
| Settings CLOSE text on panel | `#6CF0C0` on `#090E22` | 4.5:1 | **13.54:1** |
| Settings CLOSE text on its hover fill | `#6CF0C0` on `#17307C` | 4.5:1 | **8.49:1** |
| Hotkey error text (accent-m) on panel | `#F08A86` on `#090E22` | 4.5:1 | **7.91:1** |
| Hotkey input text on input fill | `#6CF0C0` on `#17307C` | 4.5:1 | **8.49:1** |
| Picker row text on hover fill | `#6CF0C0` on `#17307C` | 4.5:1 | **8.49:1** |
| Update banner text on update bar | `#6CF0C0` on `#0C1840` | 4.5:1 | **12.18:1** |
| Update button text on hover fill | `#FFFFFF` on `#17307C` | 4.5:1 | **12.00:1** |
| Drop-hint text (text-dim) on grid ground | `#D8E0F4` on `#04070F` | 4.5:1 | **15.24:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#A03030` | 3:1 | **7.09:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#A03030` | 3:1 | **7.09:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#2AE6A0` on `#101E66` | 3:1 | **9.23:1** |
| Focus ring on grid ground (non-text) | `#2AE6A0` on `#04070F` | 3:1 | **12.40:1** |
| Hover border on grid ground (non-text) | `#2AE6A0` on `#04070F` | 3:1 | **12.40:1** |
| Hover border on hover fill (non-text) | `#2AE6A0` on `#17307C` | 3:1 | **7.38:1** |
| Theme-picker selected row text (accent-text) on active fill | `#6CF0C0` on `#17307C` | 4.5:1 | **8.49:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#6CF0C0` on `#17307C` | 4.5:1 | **8.49:1** |
| Skin search input text (accent-text) on panel | `#6CF0C0` on `#090E22` | 4.5:1 | **13.54:1** |
| Apps-picker search input text (accent-text) on search fill | `#6CF0C0` on `#17307C` | 4.5:1 | **8.49:1** |
| Rename input text (accent-text) on input fill | `#6CF0C0` on `#17307C` | 4.5:1 | **8.49:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#D8E0F4` on `#17307C` | 4.5:1 | **9.08:1** |
| Skin search placeholder (text-dim, themed) on panel | `#D8E0F4` on `#090E22` | 4.5:1 | **14.48:1** |
| Apps-picker placeholder (text-dim) on search fill | `#D8E0F4` on `#17307C` | 4.5:1 | **9.08:1** |
| Hotkey recording text (accent-m) on input fill | `#F08A86` on `#17307C` | 4.5:1 | **4.96:1** |
| Update dismiss glyph (text-dim) on update bar | `#D8E0F4` on `#0C1840` | 4.5:1 | **13.02:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#D8E0F4` on `#090E22` | 3:1 | **14.48:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#2AE6A0` on `#090E22` | 3:1 | **11.78:1** |
| Tile border on grid ground (non-text) | `#9AA6C8` on `#04070F` | 3:1 | **8.31:1** |

**Lowest ratio in this theme: 4.86:1 (Title dot (`.accent`) on header).** Lowest text ratio: 4.86:1 (Title dot (`.accent`) on header). Lowest non-text ratio: 7.09:1 (Remove glyph on remove button (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | Lightest stop | Darkest stop |
|---|---|---|
| Header | `#3A5AA8` | `#0A1240` |
| Tile at rest | `#101E66` | `#060C34` |
| Tile hover, focus and pressed | `#17307C` | `#0A1448` |
| Banner | `#3A5AA8` | `#0A1240` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.18) saturate(0.95)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#101E66` | Hover `#17307C` | Pressed `#17307C` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6D96C1` | 4.85:1 | 3.88:1 | 3.88:1 | pass |
| Calculator `#6b6f76` | `#7E838B` | 3.93:1 | 3.15:1 | 3.15:1 | pass |
| Paint `#b07a4f` | `#CD9060` | 5.54:1 | 4.43:1 | 4.43:1 | pass |
| Terminal `#3d4450` | `#48505E` | 1.85:1 | 1.48:1 | 1.48:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#60A2A3` | 5.14:1 | 4.11:1 | 4.11:1 | pass |
| Files `#c09a3e` | `#E0B64F` | 7.84:1 | 6.27:1 | 6.27:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.15:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Mako `#2AE6A0` is `--accent-c` (12.40:1); `--accent-text` is `#6CF0C0` (14.26:1); the title dot is `#7AF4C8` because the title sits on the lightest header stop (a mako `#2AE6A0` dot is 4.03:1 there). The audit's `#5B7FC0` top stop is 4.01:1 for white text and 3.14:1 for the cream text, under 4.5, so the header and banner start at `#3A5AA8`. Steel stays in the art (pipes `#7A7F88`) and the tile border is the PS1 window blue-white `#9AA6C8`. Red `#A03030` is the edit bar rule and the remove button. The theme leaves the legacy contrast list.

### 2.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | Bahnschrift, 'Segoe UI', sans-serif |
| `#title` | Bahnschrift 600, `font-stretch: 87.5%`, 12 px, tracking 4 px, uppercase from the markup |
| `.tile-label` | Bahnschrift 600, 12 px, 0.8 px, uppercase, 1 px black drop; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | Bahnschrift 600 SemiCondensed (`font-stretch: 87.5%`), 11 px, 0.5 px, sentence case, 1 px black drop |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 128.77** (gate 156; 27.2 px under, 39.2 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 57.5, CALCULATOR 80.2, PAINT 36.7, TERMINAL 63.0, BROWSER 61.0, FILES 35.6 px, no ellipsis. Tile height 95.39 px (94.7 to 95.4 required). Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; the old `overflow: hidden` clip cuts 0 px in the same band (this theme's test strings have no descender tails: uppercase; the lever stays for Cyrillic tails). **Platform fonts the mock used:** title Bahnschrift x12; labels Bahnschrift x7; banner Bahnschrift x28; version and settings Bahnschrift x7. Expected `fontsRendered` for the web faces: none (stock only).

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Bahnschrift covers it (checked); long names such as "Жёсткий диск" ellipsize in the 100 px box, as in every uppercase theme.

### 2.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #3A5AA8 0, #0A1240 100%); border-bottom-color: #2AE6A0; box-shadow: inset 0 -2px 0 #2AE6A0; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #2AE6A0; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a steel pipe run with four flanges, each with a mako dot, and a glass vial full of mako between the two inner flanges. Painted pixels at x 170.0 to 250.0, y 10.5 to 29.5. Hidden while the chip shows. The title ends at x 128.8, the scene starts at x 168: 39.2 px clear.

**B. Frame (the kit of 0.3).** a double pipe (two 3 px steel tubes, a light top edge, a flange with two mako dots every 24 px) down both sides; the top course is a double horizontal pipe with a flange and two mako dots every 24 px; each corner is a bolted steel plate with a mako rivet. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 11 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner is the family gradient (`#3A5AA8` to `#0A1240`) with a 1 px blue-steel top border; its top course is a single pipe with a flange and a mako dot every 24 px; the icon is a **glass Materia orb** (a mako sphere with a specular highlight and a swirl, in a steel socket arc); the right end is a **Midgar skyline**: two stepped steel plates, a central tower with three lit window bars and an antenna, two reactor drums with mako windows and four mako rail dashes. The motif's painted pixels are at x 329.6 to 410.4, y 266.4 to 300.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 73.2 px (0.8). The banner row of the probe reads 4 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: a plain rectangle (`--app-clip: none`; PS1 windows are square). Tiles: the menu window: a vertical gradient (`#101E66` to `#060C34`), a 1 px blue-steel border, a 1 px lit top edge, square corners; plates are octagons (18 percent chamfers, a bolted-plate cue). Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 12.13, Calculator 10.13, Paint 11.13, Terminal 10.06, Browser 11.63, Files 11.12 (smallest 10.06); nothing is cropped.

**Trademark note.** The Buster Sword, the Shinra logo, the Midgar plate-ring poster, any character and the Materia sockets of the game are not drawn. The orb is a generic glass sphere in a generic socket; the skyline is stepped plates and drums.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A03030; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the game's emblem in the art zone */
#header { background: linear-gradient(180deg, #3A5AA8 0, #0A1240 100%); border-bottom-color: #2AE6A0; box-shadow: inset 0 -2px 0 #2AE6A0; }
#header::before { background: #2AE6A0; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-weight: 600; font-stretch: 87.5%; font-style: normal; line-height: 1.2; font-size: 12px; letter-spacing: 4px; color: #E8E4D0; text-shadow: none; }
#title .accent { color: #7AF4C8; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNER@ left 1px top 0 / 8px 8px no-repeat,
    @CORNER@ right 5px top 0 / 8px 8px no-repeat,
    @CORNER@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNER@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 24px repeat-y,
    @SIDE@ right 5px top 0 / 8px 24px repeat-y,
    @TOP@ left 0 top 0 / 24px 9px repeat-x;
}

/* tiles: the menu window (a vertical gradient, a 1 px light border, a 1 px lit top edge) */
.app-tile { background: linear-gradient(180deg, #101E66 0, #060C34 100%); border-color: #9AA6C8; border-radius: 0px; box-shadow: inset 0 1px 0 #4E6EC0; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: linear-gradient(180deg, #17307C 0, #0A1448 100%); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: linear-gradient(180deg, #17307C 0, #0A1448 100%); }
.tile-label { font-family: Bahnschrift, 'Segoe UI', sans-serif; overflow: clip; overflow-clip-margin: 3px; }

/* banner: surface, a top course, the game's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, linear-gradient(180deg, #3A5AA8 0, #0A1240 100%);
  border-top-color: #9AA6C8;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-size: 11px; font-weight: 600; font-stretch: 87.5%; letter-spacing: 0.5px; text-shadow: 1px 1px 0 #000000; color: #E8E4D0; margin-right: 90px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CORNER@` | `corner` |
| `@SIDE@` | `side` |
| `@TOP@` | `top` |
| `@MOTIF@` | `motif` |
| `@BTOP@` | `btop` |
| `@ICON@` | `icon` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#...)` in the SVGs that carry a `<radialGradient>` or `<linearGradient>`, which `enc()` turns into `%23`):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<rect x='2' y='7.6' width='80' height='4.8' fill='rgb(122,127,136)'/><rect x='2' y='7.6' width='80' height='0.9' fill='rgb(176,182,194)'/><rect x='2' y='11.599999999999998' width='80' height='0.8' fill='rgb(54,60,76)'/><rect x='12' y='5.8' width='3' height='8.4' fill='rgb(54,60,76)'/><rect x='12' y='5.8' width='3' height='0.8' fill='rgb(176,182,194)'/><rect x='69' y='5.8' width='3' height='8.4' fill='rgb(54,60,76)'/><rect x='69' y='5.8' width='3' height='0.8' fill='rgb(176,182,194)'/><rect x='27' y='5.8' width='3' height='8.4' fill='rgb(54,60,76)'/><rect x='54' y='5.8' width='3' height='8.4' fill='rgb(54,60,76)'/><circle cx='13.5' cy='10' r='0.9' fill='rgb(42,230,160)'/><circle cx='70.5' cy='10' r='0.9' fill='rgb(42,230,160)'/><rect x='35' y='1' width='14' height='18' rx='3' fill='rgb(28,32,46)' stroke='rgb(176,182,194)' stroke-width='0.8'/><rect x='37' y='3.2' width='10' height='13.6' rx='2' fill='rgb(16,104,80)'/><rect x='37' y='6.8' width='10' height='10' rx='2' fill='rgb(42,230,160)'/><rect x='38.4' y='4.2' width='1.6' height='11' rx='0.8' fill='rgb(150,255,214)'/><path d='M37 6.8 H47' stroke='rgb(150,255,214)' stroke-width='0.7'/><circle cx='28.5' cy='10' r='0.9' fill='rgb(42,230,160)'/><circle cx='55.5' cy='10' r='0.9' fill='rgb(42,230,160)'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='0' width='24' height='9' fill='rgb(28,32,46)'/><rect x='0' y='0.6' width='24' height='3.4' fill='rgb(122,127,136)'/><rect x='0' y='0.6' width='24' height='0.9' fill='rgb(176,182,194)'/><rect x='0' y='3.2' width='24' height='0.8' fill='rgb(54,60,76)'/><rect x='0' y='4.6' width='24' height='3.4' fill='rgb(122,127,136)'/><rect x='0' y='4.6' width='24' height='0.9' fill='rgb(176,182,194)'/><rect x='0' y='7.2' width='24' height='0.8' fill='rgb(54,60,76)'/><rect x='10.6' y='0' width='2.8' height='9' fill='rgb(54,60,76)'/><rect x='10.6' y='0' width='0.8' height='9' fill='rgb(176,182,194)'/><circle cx='12' cy='2.3' r='0.9' fill='rgb(42,230,160)'/><circle cx='12' cy='6.3' r='0.9' fill='rgb(42,230,160)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='0' y='0' width='8' height='24' fill='rgb(28,32,46)'/><rect x='0.5' y='0' width='3.2' height='24' fill='rgb(122,127,136)'/><rect x='0.5' y='0' width='0.9' height='24' fill='rgb(176,182,194)'/><rect x='2.9000000000000004' y='0' width='0.8' height='24' fill='rgb(54,60,76)'/><rect x='4.3' y='0' width='3.2' height='24' fill='rgb(122,127,136)'/><rect x='4.3' y='0' width='0.9' height='24' fill='rgb(176,182,194)'/><rect x='6.7' y='0' width='0.8' height='24' fill='rgb(54,60,76)'/><rect x='0' y='10.6' width='8' height='2.8' fill='rgb(54,60,76)'/><rect x='0' y='10.6' width='8' height='0.8' fill='rgb(176,182,194)'/><circle cx='2.1' cy='12' r='0.9' fill='rgb(42,230,160)'/><circle cx='5.9' cy='12' r='0.9' fill='rgb(42,230,160)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect x='0' y='0' width='8' height='8' fill='rgb(54,60,76)'/><rect x='0' y='0' width='8' height='1' fill='rgb(176,182,194)'/><rect x='0' y='0' width='1' height='8' fill='rgb(176,182,194)'/><rect x='7' y='0' width='1' height='8' fill='rgb(28,32,46)'/><rect x='0' y='7' width='8' height='1' fill='rgb(28,32,46)'/><circle cx='4' cy='4' r='1.7' fill='rgb(28,32,46)' stroke='rgb(176,182,194)' stroke-width='0.6'/><circle cx='4' cy='4' r='0.9' fill='rgb(42,230,160)'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='3' width='24' height='4' fill='rgb(28,32,46)'/><rect x='0' y='3' width='24' height='3.6' fill='rgb(122,127,136)'/><rect x='0' y='3' width='24' height='0.9' fill='rgb(176,182,194)'/><rect x='0' y='5.8' width='24' height='0.8' fill='rgb(54,60,76)'/><rect x='10.6' y='1.4' width='2.8' height='5.6' fill='rgb(54,60,76)'/><rect x='10.6' y='1.4' width='2.8' height='0.8' fill='rgb(176,182,194)'/><circle cx='12' cy='4.8' r='0.9' fill='rgb(42,230,160)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<polygon points='2,34 8,27 76,27 82,34' fill='rgb(54,60,76)' stroke='rgb(122,127,136)' stroke-width='0.7' stroke-linejoin='round'/><polygon points='12,27 16,21 68,21 72,27' fill='rgb(28,32,46)' stroke='rgb(122,127,136)' stroke-width='0.7' stroke-linejoin='round'/>
<rect x='36' y='3' width='12' height='18' fill='rgb(54,60,76)' stroke='rgb(176,182,194)' stroke-width='0.8'/><rect x='39' y='5.6' width='6' height='3' fill='rgb(42,230,160)'/><rect x='39' y='10.6' width='6' height='3' fill='rgb(42,230,160)'/><rect x='39' y='15.6' width='6' height='3' fill='rgb(16,104,80)'/><path d='M42 3 V0.4' stroke='rgb(176,182,194)' stroke-width='0.9'/>
<path d='M18 21 V14 C18 11.6 30 11.6 30 14 V21 Z' fill='rgb(54,60,76)' stroke='rgb(176,182,194)' stroke-width='0.8'/><path d='M54 21 V14 C54 11.6 66 11.6 66 14 V21 Z' fill='rgb(54,60,76)' stroke='rgb(176,182,194)' stroke-width='0.8'/>
<rect x='21.4' y='14.6' width='5.2' height='5' rx='1' fill='rgb(42,230,160)'/><rect x='57.4' y='14.6' width='5.2' height='5' rx='1' fill='rgb(42,230,160)'/>
<path d='M30 18 H36 M48 18 H54' stroke='rgb(176,182,194)' stroke-width='1.4'/>
<path d='M14 31 H22 M30 31 H38 M46 31 H54 M62 31 H70' stroke='rgb(42,230,160)' stroke-width='1'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<defs><radialGradient id='o' cx='0.36' cy='0.3' r='0.85'><stop offset='0' stop-color='rgb(190,255,226)'/><stop offset='0.5' stop-color='rgb(42,230,160)'/><stop offset='1' stop-color='rgb(8,92,72)'/></radialGradient></defs>
<path d='M3.6 15.6 C4.4 20.6 17.6 20.6 18.4 15.6' fill='none' stroke='rgb(122,127,136)' stroke-width='2.2' stroke-linecap='round'/><path d='M3.6 15.6 C4.4 20.6 17.6 20.6 18.4 15.6' fill='none' stroke='rgb(176,182,194)' stroke-width='0.7' stroke-linecap='round' transform='translate(0,-0.5)'/>
<circle cx='11' cy='10.2' r='8.4' fill='url(#o)' stroke='rgb(8,52,44)' stroke-width='1.1'/>
<path d='M5 11.6 C7.4 9.2 12 12.6 17 8.6' fill='none' stroke='rgb(150,255,214)' stroke-width='0.8' stroke-opacity='0.8'/>
<ellipse cx='7.8' cy='6.4' rx='2.9' ry='1.8' fill='rgb(236,255,246)' transform='rotate(-35 7.8 6.4)'/>
</svg>
```

### 2.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | ff7-title (2) | removed |
| 2 | banner-pulse (1) | removed |
| 3 | ff7-sword (1) | removed |
| 4 | ff7-readout (2) | removed |
| 5 | ff7-border (5) | removed |
| 6 | ff7-lifestream `#particles` (4) | removed |
| hover | one-shot `tile-radial .55s` (not infinite) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite ff7.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 2.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `linear-gradient(180deg, #101E66, #060C34)`, border `#9AA6C8` (1 px), radius 0px, `box-shadow: inset 0 1px 0 #4E6EC0` (the lit edge), `::before` off; layout unchanged. Icons: `brightness(1.18) saturate(0.95)` through the shaped plate (D in 3).
- **Hover:** `linear-gradient(180deg, #17307C, #0A1448)`, border `#2AE6A0` (7.38:1 on the hover fill), `box-shadow: inset 0 1px 0 #7AF4C8`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (9.23:1 on the tile, 12.40:1 on the grid ground). **Pressed:** base scale 0.96 on the same gradient as hover.
- **Label:** `#E8E4D0`, Bahnschrift 600, 12 px, 0.8 px, uppercase, 1 px black drop.
- **Filter chip:** base rule (fill `#17307C`, `--accent-c` border, `#6CF0C0` text). The header scene hides while it shows.
- **Edit bar:** `#2A0F12` fill, `#A03030` rule, label `#F08A86`; `+ FILE` and `+ INSTALLED` in `--text` with a `#7A8FC0` border, `DONE` in `#F08A86` with a `#A03030` border. The tile remove button is `#A03030` with a `#F08A86` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#04070F`, panel `#090E22`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#6CF0C0` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#6CF0C0` text on `#0C1840` with a `#2AE6A0` rule.

### 2.6 Done when

1. `npm run check:contrast` passes with no rebaseline (the theme leaves the legacy list); `grep -c infinite ff7.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#2AE6A0`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **128.77**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#3A5AA8` to `#0A1240` gradient with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 3 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a glass orb at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#2AE6A0` border, the hover gradient, the shaped plate with no cropped glyph, no ellipsis on CALCULATOR (mock 80.2 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): mako green only in the header line, the rails' dots, the vial, the orb, the ring, the hover border and the values; steel and blue for everything else; red only in the edit bar and the remove button.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 11 px, frame 8 px, banner 4 px; at 640 x 420 11 / 8 / 11 px; at 1024 x 700 11 / 8 / 11 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Bahnschrift`; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 4** (title and banner text covered). What survives: a blue-to-black window with light-bordered tiles, steel pipes with green dots on every edge, a green vial in the header, a green glass orb and a lit reactor skyline in the banner. What is missing for a 5: the Buster Sword and the Shinra mark (marks, not drawn) and the 1997 pixel type.

Watch items for this theme: (1) The orb in a socket can read as a green button or a glass bulb before it reads as Materia; it sits beside the reactor skyline that says "Midgar". Lever: drop the socket arc, or add a second small orb. (2) The octagon plates are only visible past the 21 percent rounding of the mock plates; a real icon with square corners loses 8 px triangles (watch 1 of the batch).

---

## 3. ff14 (FINAL FANTASY XIV): DONE

**Audit:** score 2, redraw, legacy contrast failure (text-dim, accent-c, hint-sub). A violet-navy wash with a dim violet accent (`#6848A0`) where XIV is charcoal with fine duty-gold trim and crystal blue. A Duty Finder queue (tank, healer and DPS status, "ITEM LEVEL", "MORE THAN 30M") was painted around CALCULATOR and PAINT, with a purple bar crossing the PAINT label. Six infinite animations.
**Direction:** a slick dark window with fine gold trim, not the blue window (that is FF7 and the family kit of 0.3 deliberately does not apply). Charcoal panels, a 1 px gold hairline frame with corner brackets, tiles as gold-bordered slots (4 px radius), crystal blue only for the keyboard focus ring and the aetheryte. The header carries a three-slot hotbar, the banner a short segmented gauge between two gold hairlines (the limit-break bar) beside a second, larger aetheryte at the right end, and an aetheryte as its icon at the left (review F6: the crystal is the one object that says XIV). Cinzel on the title only. Static; nothing glows.

### 3.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: inset(0 round 3px);
  --overlay-clip: inset(0 round 3px);
  --bg: #14121A;
  --panel-bg: #1C1A24;
  --overlay-bg: #14121A;
  --header-bg: #322F3D;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #E6E0D0;
  --text-dim: #B6AFA0;
  --accent-c: #B9975B;
  --accent-m: #F0908A;
  --accent-y: #B9975B;
  --accent-text: #D4B57A;
  --border: #4A4658;
  --border-h: #E0C48A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #B9975B;
  --title-anim: none;
  --tile-hover-bg: #2E2B3A;
  --tile-hover-border: #E0C48A;
  --tile-hover-shadow: none;
  --tile-active-bg: #2E2B3A;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.15) contrast(1.04) saturate(0.92);
  --tile-icon-shape: none;
  --tile-label-spacing: 0.5px;
  --tile-label-transform: none;
  --tile-label-weight: 350;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #413D50;
  --btn-active-bg: #524D64;
  --drop-hint-border: #4A4658;
  --drop-icon-color: #7A7468;
  --hint-sub-color: #B6AFA0;
  --rename-dashed: #B9975B;
  --rename-input-bg: #2E2B3A;
  --edit-bar-bg: #2C1618;
  --edit-bar-border: #B04A44;
  --edit-label-color: #F0908A;
  --edit-label-glow: none;
  --btn-done-color: #F0908A;
  --btn-done-border: #B04A44;
  --btn-done-hover-bg: #45201F;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A7468;
  --update-bg: #1C2230;
  --update-border: #4E9FE0;
  --update-color: #D4B57A;
  --update-btn-border: #4E9FE0;
  --update-btn-hover-bg: #2A3448;
  --update-btn-hover-glow: none;
  --btn-close-color: #D4B57A;
  --btn-close-border: #B9975B;
  --btn-close-hover-bg: #2E2B3A;
  --btn-close-hover-glow: none;
  --picker-search-bg: #2E2B3A;
  --picker-item-hover-bg: #2E2B3A;
  --picker-item-active-bg: #3A3648;
  --picker-placeholder-bg: #2E2B3A;
  --skin-btn-active-bg: #3A3648;
  --remove-btn-bg: #A8403A;
  --remove-btn-border: #F0908A;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#E6E0D0` on `#14121A` | 4.5:1 | **14.09:1** |
| `--text-dim` on `--bg` | `#B6AFA0` on `#14121A` | 4.5:1 | **8.51:1** |
| `--accent-c` on `--bg` | `#B9975B` on `#14121A` | 3:1 | **6.75:1** |
| `--accent-text` on `--bg` | `#D4B57A` on `#14121A` | 3:1 | **9.45:1** |
| `--hint-sub-color` on `--bg` | `#B6AFA0` on `#14121A` | 4.5:1 | **8.51:1** |
| `--btn-close-color` on `--panel-bg` | `#D4B57A` on `#1C1A24` | 4.5:1 | **8.74:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the lightest stop**, except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E6E0D0` on `#252330` | 4.5:1 | **11.70:1** |
| Tile label on tile hover | `#E6E0D0` on `#2E2B3A` | 4.5:1 | **10.47:1** |
| Tile label on tile pressed (pressed state) | `#E6E0D0` on `#2E2B3A` | 4.5:1 | **10.47:1** |
| Title on header | `#E6E0D0` on `#322F3D` | 4.5:1 | **9.90:1** |
| Title dot (`.accent`) on header | `#B9975B` on `#322F3D` | 4.5:1 | **4.75:1** |
| Header version on header | `#B6AFA0` on `#322F3D` | 4.5:1 | **5.98:1** |
| Header button glyph on header | `#E6E0D0` on `#322F3D` | 4.5:1 | **9.90:1** |
| Header button glyph on button hover | `#FFFFFF` on `#413D50` | 4.5:1 | **10.46:1** |
| Filter chip text on chip | `#D4B57A` on `#2E2B3A` | 4.5:1 | **7.02:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#2E2B3A` | 4.5:1 | **13.79:1** |
| Banner text on banner | `#E6E0D0` on `#322F3D` | 4.5:1 | **9.90:1** |
| Header line on header (non-text) | `#B9975B` on `#1E1C27` | 3:1 | **6.11:1** |
| Edit label on edit bar | `#F0908A` on `#2C1618` | 4.5:1 | **7.34:1** |
| Done / close button text on edit bar | `#F0908A` on `#2C1618` | 4.5:1 | **7.34:1** |
| + FILE / + INSTALLED text on edit bar | `#E6E0D0` on `#2C1618` | 4.5:1 | **12.90:1** |
| Done button text on its hover fill | `#F0908A` on `#45201F` | 4.5:1 | **6.12:1** |
| Settings text on overlay | `#E6E0D0` on `#14121A` | 4.5:1 | **14.09:1** |
| Settings text on panel | `#E6E0D0` on `#1C1A24` | 4.5:1 | **13.04:1** |
| Settings label (text-dim) on panel | `#B6AFA0` on `#1C1A24` | 4.5:1 | **7.88:1** |
| Settings value / cheat key (accent-text) on panel | `#D4B57A` on `#1C1A24` | 4.5:1 | **8.74:1** |
| Settings version value (accent-text) on panel | `#D4B57A` on `#1C1A24` | 4.5:1 | **8.74:1** |
| Settings CLOSE text on panel | `#D4B57A` on `#1C1A24` | 4.5:1 | **8.74:1** |
| Settings CLOSE text on its hover fill | `#D4B57A` on `#2E2B3A` | 4.5:1 | **7.02:1** |
| Hotkey error text (accent-m) on panel | `#F0908A` on `#1C1A24` | 4.5:1 | **7.41:1** |
| Hotkey input text on input fill | `#D4B57A` on `#2E2B3A` | 4.5:1 | **7.02:1** |
| Picker row text on hover fill | `#D4B57A` on `#2E2B3A` | 4.5:1 | **7.02:1** |
| Update banner text on update bar | `#D4B57A` on `#1C2230` | 4.5:1 | **8.09:1** |
| Update button text on hover fill | `#FFFFFF` on `#2A3448` | 4.5:1 | **12.48:1** |
| Drop-hint text (text-dim) on grid ground | `#B6AFA0` on `#14121A` | 4.5:1 | **8.51:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#A8403A` | 3:1 | **6.07:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#A8403A` | 3:1 | **6.07:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#B9975B` on `#252330` | 3:1 | **5.61:1** |
| Focus ring on grid ground (non-text) | `#B9975B` on `#14121A` | 3:1 | **6.75:1** |
| Hover border on grid ground (non-text) | `#E0C48A` on `#14121A` | 3:1 | **10.99:1** |
| Hover border on hover fill (non-text) | `#E0C48A` on `#2E2B3A` | 3:1 | **8.16:1** |
| Theme-picker selected row text (accent-text) on active fill | `#D4B57A` on `#3A3648` | 4.5:1 | **5.94:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#D4B57A` on `#2E2B3A` | 4.5:1 | **7.02:1** |
| Skin search input text (accent-text) on panel | `#D4B57A` on `#1C1A24` | 4.5:1 | **8.74:1** |
| Apps-picker search input text (accent-text) on search fill | `#D4B57A` on `#2E2B3A` | 4.5:1 | **7.02:1** |
| Rename input text (accent-text) on input fill | `#D4B57A` on `#2E2B3A` | 4.5:1 | **7.02:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#B6AFA0` on `#2E2B3A` | 4.5:1 | **6.32:1** |
| Skin search placeholder (text-dim, themed) on panel | `#B6AFA0` on `#1C1A24` | 4.5:1 | **7.88:1** |
| Apps-picker placeholder (text-dim) on search fill | `#B6AFA0` on `#2E2B3A` | 4.5:1 | **6.32:1** |
| Hotkey recording text (accent-m) on input fill | `#F0908A` on `#2E2B3A` | 4.5:1 | **5.95:1** |
| Update dismiss glyph (text-dim) on update bar | `#B6AFA0` on `#1C2230` | 4.5:1 | **7.29:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#B6AFA0` on `#1C1A24` | 3:1 | **7.88:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#B9975B` on `#1C1A24` | 3:1 | **6.25:1** |
| Tile border on grid ground (non-text) | `#B9975B` on `#14121A` | 3:1 | **6.75:1** |
| Keyboard ring (crystal blue) on tile rest (non-text) | `#4E9FE0` on `#252330` | 3:1 | **5.40:1** |
| Keyboard ring (crystal blue) on grid ground (non-text) | `#4E9FE0` on `#14121A` | 3:1 | **6.51:1** |
| Update bar border (crystal blue) on update bar (non-text) | `#4E9FE0` on `#1C2230` | 3:1 | **5.57:1** |

**Lowest ratio in this theme: 4.75:1 (Title dot (`.accent`) on header).** Lowest text ratio: 4.75:1 (Title dot (`.accent`) on header). Lowest non-text ratio: 5.40:1 (Keyboard ring (crystal blue) on tile rest (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | Lightest stop | Darkest stop |
|---|---|---|
| Header | `#322F3D` | `#1E1C27` |
| Tile at rest | `#252330` | `#1B1924` |
| Tile hover, focus and pressed | `#2E2B3A` | `#221F2C` |
| Banner | `#322F3D` | `#1E1C27` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.15) contrast(1.04) saturate(0.92)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#252330` | Hover `#2E2B3A` | Pressed `#2E2B3A` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6B92BD` | 4.75:1 | 4.25:1 | 4.25:1 | pass |
| Calculator `#6b6f76` | `#7B8087` | 3.88:1 | 3.47:1 | 3.47:1 | pass |
| Paint `#b07a4f` | `#C98E5E` | 5.52:1 | 4.93:1 | 4.93:1 | pass |
| Terminal `#3d4450` | `#444C59` | 1.78:1 | 1.59:1 | 1.59:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#5E9FA0` | 5.10:1 | 4.56:1 | 4.56:1 | pass |
| Files `#c09a3e` | `#DDB34E` | 7.81:1 | 6.98:1 | 6.98:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.47:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Duty-gold `#B9975B` is `--accent-c` (6.75:1); `--accent-text` is `#D4B57A` (9.45:1). The audit asks for a crystal-blue focus: the base ring uses `--accent-c`, so the theme adds `.app-tile:focus-visible { outline-color: #4E9FE0; }` (5.40:1 on the tile) and the update bar border carries the same blue. Charcoal gradients here are very shallow (`#322F3D` to `#1E1C27`); there is no light-to-dark blue sweep. The theme leaves the legacy contrast list.

### 3.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | 'Segoe UI', Arial, sans-serif |
| `#title` | **Cinzel 600**, 11 px, tracking 3 px, uppercase from the markup, `font-synthesis: none`, `line-height: 1.2` |
| `.tile-label` | Segoe UI 350, 12 px, 0.5 px, user case; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | Segoe UI 350, 12 px, 0.5 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 138.52** (gate 156; 17.5 px under, 29.5 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 48.6, CALCULATOR 56.5, PAINT 27.9, TERMINAL 47.3, BROWSER 44.5, FILES 24.6 px, no ellipsis. Tile height 95.39 px (94.7 to 95.4 required). Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; the old `overflow: hidden` clip cuts 34 px in the same band (positive control). **Platform fonts the mock used:** title Cinzel (web) x12; labels Segoe UI Semilight x7; banner Segoe UI Semilight x28; version and settings Segoe UI x7. Expected `fontsRendered` for the web faces: Cinzel.

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Segoe UI 350 covers it (checked); Cinzel covers none of Cyrillic but it only sets the Latin title.

### 3.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #322F3D 0, #1E1C27 100%); border-bottom-color: #B9975B; box-shadow: none; }`: a 1 px line (the header's own border, y 39 to 40; nothing below). `#header::before { background: #B9975B; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a three-slot hotbar: three 16 px rounded slots with a gold border and an inner hairline, holding a blue diamond, a gold diamond and a grey diamond. Painted pixels at x 180.5 to 239.5, y 11.5 to 28.5. Hidden while the chip shows. The title ends at x 138.5, the scene starts at x 168: 29.5 px clear.

**B. Frame (the kit of 0.3).** a 1 px gold hairline down both sides with a gold diamond every 24 px; the top course is a hairline with a gold diamond every 24 px; each corner is a gold bracket (an L of 1.6 px with an inner 0.8 px L). Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 6 from a first-column focus ring (3 empty pixels), 6 from a last-column ring (6 at 640 x 420 and 6 at 1024 x 700).

**C. Banner.** the banner is the charcoal gradient (`#322F3D` to `#1E1C27`) with a 1 px gold top border; its top course is a gold-brown hairline with a short gold tick and a diamond every 24 px; the icon is the **aetheryte** (a blue crystal threaded by a gold elliptical ring, back arc dim and front arc bright); the right end is a **short limit gauge and a second aetheryte** (review F6): the gauge is a hairline with a centre diamond, three segments in gold rounded frames (two full gold, the third half blue) and a second hairline with end diamonds, shortened to x 4 to 51 of the 84 px motif; to its right a blue crystal (about 14 x 26 px, the icon's gradient and facet) stands in a gold ring 21 px wide at x 57.5 to 78.5 (back arc dim, front arc bright). The first build's gauge ran the full 84 px, read as a progress bar and left the theme at a squint of 3 in the review (gold on charcoal is near XV); the crystal is what separates XIV from XV. The motif's painted pixels are at x 330.1 to 407.1, y 268.2 to 294.8 (424 x 300; geometry of the SVG with half stroke widths; the first build's gauge ran to x 409.9, y 271.3 to 295.9); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 133.7 px (0.8; the first painted pixel is the lower hairline's left diamond, at the same x as before). The banner row of the probe reads 3 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: a slightly rounded rectangle, 3 px radius. Tiles: the slot: a vertical gradient (`#252330` to `#1B1924`), a 1 px duty-gold border `#B9975B`, radius 4 px, no lit edge, hover border `#E0C48A`; the plate keeps the app's own rounded square (`--tile-icon-shape: none`).

**Trademark note.** The FFXIV logo, the Eorzean crests, the Scion and Grand Company marks and the moogle and wing marks are not drawn. The hotbar, the gauge and the crystal-and-ring are generic UI and crystal shapes.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A8403A; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 1 px line inside it, the game's emblem in the art zone */
#header { background: linear-gradient(180deg, #322F3D 0, #1E1C27 100%); border-bottom-color: #B9975B; box-shadow: none; }
#header::before { background: #B9975B; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Cinzel, 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 600; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 11px; letter-spacing: 3px; color: #E6E0D0; text-shadow: none; }
#title .accent { color: #B9975B; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNER@ left 1px top 0 / 8px 8px no-repeat,
    @CORNER@ right 5px top 0 / 8px 8px no-repeat,
    @CORNER@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNER@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 24px repeat-y,
    @SIDE@ right 5px top 0 / 8px 24px repeat-y,
    @TOP@ left 0 top 0 / 24px 9px repeat-x;
}

/* tiles: the menu window (a vertical gradient, a 1 px light border, a 1 px lit top edge) */
.app-tile { background: linear-gradient(180deg, #252330 0, #1B1924 100%); border-color: #B9975B; border-radius: 4px; box-shadow: none; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: linear-gradient(180deg, #2E2B3A 0, #221F2C 100%); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: linear-gradient(180deg, #2E2B3A 0, #221F2C 100%); }
.tile-label { font-family: 'Segoe UI', Arial, sans-serif; overflow: clip; overflow-clip-margin: 3px; }
/* crystal-blue keyboard ring on the gold slots */
.app-tile:focus-visible { outline-color: #4E9FE0; }

/* banner: surface, a top course, the game's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, linear-gradient(180deg, #322F3D 0, #1E1C27 100%);
  border-top-color: #B9975B;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 350; letter-spacing: 0.5px; color: #E6E0D0; margin-right: 90px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CORNER@` | `corner` |
| `@SIDE@` | `side` |
| `@TOP@` | `top` |
| `@MOTIF@` | `motif` |
| `@BTOP@` | `btop` |
| `@ICON@` | `icon` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#...)` in the SVGs that carry a `<radialGradient>` or `<linearGradient>`, which `enc()` turns into `%23`):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<rect x='13' y='2' width='16' height='16' rx='3' fill='rgb(24,22,32)' stroke='rgb(185,151,91)' stroke-width='1'/><rect x='14.2' y='3.2' width='13.6' height='13.6' rx='2' fill='none' stroke='rgb(112,88,48)' stroke-width='0.5'/><path d='M21 4.8 L24.6 10 L21 15.2 L17.4 10 Z' fill='rgb(78,159,224)' stroke='rgb(28,84,150)' stroke-width='0.6' stroke-linejoin='round'/><path d='M21 4.8 L22.8 10 H21 Z' fill='rgb(170,214,250)' fill-opacity='0.8'/><rect x='34' y='2' width='16' height='16' rx='3' fill='rgb(24,22,32)' stroke='rgb(185,151,91)' stroke-width='1'/><rect x='35.2' y='3.2' width='13.6' height='13.6' rx='2' fill='none' stroke='rgb(112,88,48)' stroke-width='0.5'/><path d='M42 4.8 L45.6 10 L42 15.2 L38.4 10 Z' fill='rgb(185,151,91)' stroke='rgb(112,88,48)' stroke-width='0.6' stroke-linejoin='round'/><path d='M42 4.8 L43.8 10 H42 Z' fill='rgb(224,196,138)' fill-opacity='0.8'/><rect x='55' y='2' width='16' height='16' rx='3' fill='rgb(24,22,32)' stroke='rgb(185,151,91)' stroke-width='1'/><rect x='56.2' y='3.2' width='13.6' height='13.6' rx='2' fill='none' stroke='rgb(112,88,48)' stroke-width='0.5'/><path d='M63 4.8 L66.6 10 L63 15.2 L59.4 10 Z' fill='rgb(122,118,132)' stroke='rgb(24,22,32)' stroke-width='0.6' stroke-linejoin='round'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='4' width='24' height='1' fill='rgb(185,151,91)'/><path d='M12 2.3 L14.2 4.5 L12 6.7 L9.8 4.5 Z' fill='rgb(224,196,138)' stroke='rgb(112,88,48)' stroke-width='0.5' stroke-linejoin='round'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='3.5' y='0' width='1' height='24' fill='rgb(185,151,91)'/><path d='M4 9 L5.8 12 L4 15 L2.2 12 Z' fill='rgb(224,196,138)' stroke='rgb(112,88,48)' stroke-width='0.5' stroke-linejoin='round'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<path d='M0.8 7.6 V0.8 H7.6' fill='none' stroke='rgb(185,151,91)' stroke-width='1.6' stroke-linejoin='miter'/><path d='M3.2 7.6 V3.2 H7.6' fill='none' stroke='rgb(112,88,48)' stroke-width='0.8'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='0.2' width='24' height='0.9' fill='rgb(112,88,48)'/><rect x='11' y='0.2' width='2' height='3.4' fill='rgb(185,151,91)'/><path d='M12 3 L13.8 4.8 L12 6.6 L10.2 4.8 Z' fill='rgb(224,196,138)' stroke='rgb(112,88,48)' stroke-width='0.4' stroke-linejoin='round'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<defs><linearGradient id='g' x1='0.2' y1='0' x2='0.8' y2='1'><stop offset='0' stop-color='rgb(160,214,252)'/><stop offset='1' stop-color='rgb(40,110,196)'/></linearGradient></defs>
<path d='M4 12 H51' stroke='rgb(112,88,48)' stroke-width='0.8'/><path d='M27.5 9.8 L29.7 12 L27.5 14.2 L25.3 12 Z' fill='rgb(224,196,138)' stroke='rgb(112,88,48)' stroke-width='0.5' stroke-linejoin='round'/>
<rect x='4' y='16' width='15' height='7' rx='1.4' fill='rgb(24,22,32)' stroke='rgb(185,151,91)' stroke-width='0.8'/><rect x='5' y='17' width='13' height='5' rx='0.8' fill='rgb(185,151,91)'/><rect x='5' y='17' width='13' height='1.4' fill='rgb(224,196,138)' fill-opacity='0.6'/><rect x='20' y='16' width='15' height='7' rx='1.4' fill='rgb(24,22,32)' stroke='rgb(185,151,91)' stroke-width='0.8'/><rect x='21' y='17' width='13' height='5' rx='0.8' fill='rgb(185,151,91)'/><rect x='21' y='17' width='13' height='1.4' fill='rgb(224,196,138)' fill-opacity='0.6'/><rect x='36' y='16' width='15' height='7' rx='1.4' fill='rgb(24,22,32)' stroke='rgb(185,151,91)' stroke-width='0.8'/><rect x='37' y='17' width='6.5' height='5' rx='0.8' fill='rgb(78,159,224)'/><rect x='37' y='17' width='6.5' height='1.4' fill='rgb(224,196,138)' fill-opacity='0.6'/>
<path d='M4 27 H51' stroke='rgb(112,88,48)' stroke-width='0.8'/><path d='M4 25.4 L5.6 27 L4 28.6 L2.4 27 Z' fill='rgb(185,151,91)' stroke='rgb(112,88,48)' stroke-width='0.4' stroke-linejoin='round'/><path d='M51 25.4 L52.6 27 L51 28.6 L49.4 27 Z' fill='rgb(185,151,91)' stroke='rgb(112,88,48)' stroke-width='0.4' stroke-linejoin='round'/>
<path d='M57.5 22 A10.5 3.4 0 0 1 78.5 22' fill='none' stroke='rgb(112,88,48)' stroke-width='1.2' stroke-linecap='round'/>
<path d='M68 2.6 L74.6 14.6 L68 27.4 L61.4 14.6 Z' fill='url(#g)' stroke='rgb(28,84,150)' stroke-width='0.9' stroke-linejoin='round'/><path d='M68 2.6 L64.7 14.6 L68 27.4 Z' fill='rgb(170,214,250)' fill-opacity='0.55'/>
<path d='M57.5 22 A10.5 3.4 0 0 0 78.5 22' fill='none' stroke='rgb(224,196,138)' stroke-width='1.2' stroke-linecap='round'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<defs><linearGradient id='a' x1='0.2' y1='0' x2='0.8' y2='1'><stop offset='0' stop-color='rgb(160,214,252)'/><stop offset='1' stop-color='rgb(40,110,196)'/></linearGradient></defs>
<path d='M2.4 13.4 A8.6 2.8 0 0 1 19.6 13.4' fill='none' stroke='rgb(185,151,91)' stroke-width='1.3' stroke-linecap='round'/>
<path d='M11 1.2 L16.4 10.2 L11 19.4 L5.6 10.2 Z' fill='url(#a)' stroke='rgb(28,84,150)' stroke-width='0.9' stroke-linejoin='round'/><path d='M11 1.2 L8.4 10.2 L11 19.4 Z' fill='rgb(170,214,250)' fill-opacity='0.55'/>
<path d='M2.4 13.4 A8.6 2.8 0 0 0 19.6 13.4' fill='none' stroke='rgb(224,196,138)' stroke-width='1.3' stroke-linecap='round'/>
</svg>
```

### 3.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | ff14-title (2) | removed |
| 2 | banner-pulse (1) | removed |
| 3 | ff14-hud (1) | removed |
| 4 | ff14-readout (2) | removed |
| 5 | ff14-border (5) | removed |
| 6 | ff14-aether `#particles` (4) | removed |
| hover | one-shot `tile-scan-v .5s` (not infinite) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite ff14.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 3.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `linear-gradient(180deg, #252330, #1B1924)`, border `#B9975B` (1 px), radius 4px, no lit edge, `::before` off; layout unchanged. Icons: `brightness(1.15) contrast(1.04) saturate(0.92)` through the app's own plate.
- **Hover:** `linear-gradient(180deg, #2E2B3A, #221F2C)`, border `#E0C48A` (8.16:1 on the hover fill), no shadow, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in crystal blue `#4E9FE0` (`outline-color` override; 5.40:1 on the tile, 6.51:1 on the grid ground). **Pressed:** base scale 0.96 on the same gradient as hover.
- **Label:** `#E6E0D0`, Segoe UI 350, 12 px, 0.5 px, user case.
- **Filter chip:** base rule (fill `#2E2B3A`, `--accent-c` border, `#D4B57A` text). The header scene hides while it shows.
- **Edit bar:** `#2C1618` fill, `#B04A44` rule, label `#F0908A`; `+ FILE` and `+ INSTALLED` in `--text` with a `#7A7468` border, `DONE` in `#F0908A` with a `#B04A44` border. The tile remove button is `#A8403A` with a `#F0908A` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#14121A`, panel `#1C1A24`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#D4B57A` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#D4B57A` text on `#1C2230` with a `#4E9FE0` rule.

### 3.6 Done when

1. `npm run check:contrast` passes with no rebaseline (the theme leaves the legacy list); `grep -c infinite ff14.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 1 px line (`#B9975B`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **138.52**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 6 and 6 px).
4. Banner: the `#322F3D` to `#1E1C27` gradient with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300: a three-segment gauge and, at its right end, a blue crystal over a gold ring), banner text on one line in every state (`scrollWidth <= clientWidth` for all 2 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a crystal with a ring at 1x, and so does the motif's right end** (judge both at 1x before 6x).
5. Hover shot (CALCULATOR): `#E0C48A` border, the hover gradient, the app's own plate, no ellipsis on CALCULATOR (mock 56.5 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): duty gold for the hairlines, the borders, the diamonds and the values; crystal blue only for the keyboard ring, the first hotbar slot, the aetheryte (the banner icon and the crystal at the right end), the half-filled gauge segment and the update bar; red only in edit mode and the remove button.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 8 px, banner 3 px; at 640 x 420 10 / 9 / 12 px; at 1024 x 700 10 / 9 / 12 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Cinzel` (web) and `Segoe UI Semilight` (the face name Chromium reports for Segoe UI at weight 350); a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 4** (title and banner text covered). What survives: a charcoal window with a gold hairline frame and corner brackets, gold-bordered slots, a three-slot hotbar in the header and a crystal over a gold ring at both ends of the banner beside a short segmented gauge. What is missing for a 5: the game's serif logo and any crest (marks, not drawn); the dark-gold look is also near FF XV's and a fan needs the hotbar and aetheryte to separate them. The review's squint of the first build was 3; the large crystal of F6 is the lever for 4, which is my read of the render, not a fan test.

Watch items for this theme: (1) The aetheryte (a crystal with a ring) can read as a gem in a ring before a crystal; the hotbar in the header says "MMO UI" first, which is the right game. (2) The gauge reads as a progress bar; it is meant to (the limit gauge). Lever: drop the second hairline.

---

## 4. ff8 (FINAL FANTASY VIII): DONE

**Audit:** score 3, redraw. The cool, sleek mood was right, but a gunblade was painted diagonally between NOTEPAD, CALCULATOR and BROWSER, with junction and GF bars and ghost words ("WHATEVER", "GRIEVANCE") down the right. The blue was a dull mid-tone: no icy pale blue or silver, no thin fashion-sci-fi lines. Six infinite animations.
**Direction:** the family window in its coolest voice. Icy grey-blue gradients, silver hairlines and nothing thick: 1 px lines, ticks and slashes only. The hover is the one loud thing: a blue stripe on the left edge and a red stripe on the right, the Triple Triad card (blue and red are the card's two owners). The header carries two slash groups and a crescent, the banner a full moon with two sweeping hairlines and stars; the icon is the moon. Jost Light on the title, labels and banner (the foundation map). No gunblade, no lion. Static.

### 4.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: polygon(14px 0, 100% 0, 100% 100%, 0 100%, 0 14px);
  --overlay-clip: polygon(14px 0, 100% 0, 100% 100%, 0 100%, 0 14px);
  --bg: #090F1C;
  --panel-bg: #101828;
  --overlay-bg: #090F1C;
  --header-bg: #3C5A7C;
  --font: Jost, 'Segoe UI', Arial, sans-serif;
  --text: #E4ECF6;
  --text-dim: #C4D2E4;
  --accent-c: #7FB4D8;
  --accent-m: #F6A0A6;
  --accent-y: #7FB4D8;
  --accent-text: #A8D0EA;
  --border: #9FB2C8;
  --border-h: #7FB4D8;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #7FB4D8;
  --title-anim: none;
  --tile-hover-bg: #22395C;
  --tile-hover-border: #7FB4D8;
  --tile-hover-shadow: inset 3px 0 0 #5290DC, inset -3px 0 0 #EC5866;
  --tile-active-bg: #22395C;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.25) saturate(0.85);
  --tile-icon-shape: none;
  --tile-label-spacing: 1px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 350;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #2E5078;
  --btn-active-bg: #3A6090;
  --drop-hint-border: #4A6080;
  --drop-icon-color: #7A93AE;
  --hint-sub-color: #C4D2E4;
  --rename-dashed: #7FB4D8;
  --rename-input-bg: #22395C;
  --edit-bar-bg: #2A1218;
  --edit-bar-border: #B42A35;
  --edit-label-color: #F08A92;
  --edit-label-glow: none;
  --btn-done-color: #F08A92;
  --btn-done-border: #B42A35;
  --btn-done-hover-bg: #441820;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A93AE;
  --update-bg: #122238;
  --update-border: #7FB4D8;
  --update-color: #A8D0EA;
  --update-btn-border: #7FB4D8;
  --update-btn-hover-bg: #22395C;
  --update-btn-hover-glow: none;
  --btn-close-color: #A8D0EA;
  --btn-close-border: #7FB4D8;
  --btn-close-hover-bg: #22395C;
  --btn-close-hover-glow: none;
  --picker-search-bg: #22395C;
  --picker-item-hover-bg: #22395C;
  --picker-item-active-bg: #22395C;
  --picker-placeholder-bg: #22395C;
  --skin-btn-active-bg: #22395C;
  --remove-btn-bg: #B42A35;
  --remove-btn-border: #F08A92;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#E4ECF6` on `#090F1C` | 4.5:1 | **16.07:1** |
| `--text-dim` on `--bg` | `#C4D2E4` on `#090F1C` | 4.5:1 | **12.48:1** |
| `--accent-c` on `--bg` | `#7FB4D8` on `#090F1C` | 3:1 | **8.59:1** |
| `--accent-text` on `--bg` | `#A8D0EA` on `#090F1C` | 3:1 | **11.74:1** |
| `--hint-sub-color` on `--bg` | `#C4D2E4` on `#090F1C` | 4.5:1 | **12.48:1** |
| `--btn-close-color` on `--panel-bg` | `#A8D0EA` on `#101828` | 4.5:1 | **10.88:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the lightest stop**, except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E4ECF6` on `#1B2F4C` | 4.5:1 | **11.32:1** |
| Tile label on tile hover | `#E4ECF6` on `#22395C` | 4.5:1 | **9.75:1** |
| Tile label on tile pressed (pressed state) | `#E4ECF6` on `#22395C` | 4.5:1 | **9.75:1** |
| Title on header | `#E4ECF6` on `#3C5A7C` | 4.5:1 | **5.98:1** |
| Title dot (`.accent`) on header | `#BFE0F4` on `#3C5A7C` | 4.5:1 | **5.15:1** |
| Header version on header | `#C4D2E4` on `#3C5A7C` | 4.5:1 | **4.65:1** |
| Header button glyph on header | `#E4ECF6` on `#3C5A7C` | 4.5:1 | **5.98:1** |
| Header button glyph on button hover | `#FFFFFF` on `#2E5078` | 4.5:1 | **8.28:1** |
| Filter chip text on chip | `#A8D0EA` on `#22395C` | 4.5:1 | **7.12:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#22395C` | 4.5:1 | **11.62:1** |
| Banner text on banner | `#E4ECF6` on `#3C5A7C` | 4.5:1 | **5.98:1** |
| Header line on header (non-text) | `#C9D6E4` on `#141F33` | 3:1 | **11.17:1** |
| Edit label on edit bar | `#F08A92` on `#2A1218` | 4.5:1 | **7.31:1** |
| Done / close button text on edit bar | `#F08A92` on `#2A1218` | 4.5:1 | **7.31:1** |
| + FILE / + INSTALLED text on edit bar | `#E4ECF6` on `#2A1218` | 4.5:1 | **14.71:1** |
| Done button text on its hover fill | `#F08A92` on `#441820` | 4.5:1 | **6.27:1** |
| Settings text on overlay | `#E4ECF6` on `#090F1C` | 4.5:1 | **16.07:1** |
| Settings text on panel | `#E4ECF6` on `#101828` | 4.5:1 | **14.90:1** |
| Settings label (text-dim) on panel | `#C4D2E4` on `#101828` | 4.5:1 | **11.57:1** |
| Settings value / cheat key (accent-text) on panel | `#A8D0EA` on `#101828` | 4.5:1 | **10.88:1** |
| Settings version value (accent-text) on panel | `#A8D0EA` on `#101828` | 4.5:1 | **10.88:1** |
| Settings CLOSE text on panel | `#A8D0EA` on `#101828` | 4.5:1 | **10.88:1** |
| Settings CLOSE text on its hover fill | `#A8D0EA` on `#22395C` | 4.5:1 | **7.12:1** |
| Hotkey error text (accent-m) on panel | `#F6A0A6` on `#101828` | 4.5:1 | **8.87:1** |
| Hotkey input text on input fill | `#A8D0EA` on `#22395C` | 4.5:1 | **7.12:1** |
| Picker row text on hover fill | `#A8D0EA` on `#22395C` | 4.5:1 | **7.12:1** |
| Update banner text on update bar | `#A8D0EA` on `#122238` | 4.5:1 | **9.82:1** |
| Update button text on hover fill | `#FFFFFF` on `#22395C` | 4.5:1 | **11.62:1** |
| Drop-hint text (text-dim) on grid ground | `#C4D2E4` on `#090F1C` | 4.5:1 | **12.48:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#B42A35` | 3:1 | **6.32:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#B42A35` | 3:1 | **6.32:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#7FB4D8` on `#1B2F4C` | 3:1 | **6.05:1** |
| Focus ring on grid ground (non-text) | `#7FB4D8` on `#090F1C` | 3:1 | **8.59:1** |
| Hover border on grid ground (non-text) | `#7FB4D8` on `#090F1C` | 3:1 | **8.59:1** |
| Hover border on hover fill (non-text) | `#7FB4D8` on `#22395C` | 3:1 | **5.21:1** |
| Theme-picker selected row text (accent-text) on active fill | `#A8D0EA` on `#22395C` | 4.5:1 | **7.12:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#A8D0EA` on `#22395C` | 4.5:1 | **7.12:1** |
| Skin search input text (accent-text) on panel | `#A8D0EA` on `#101828` | 4.5:1 | **10.88:1** |
| Apps-picker search input text (accent-text) on search fill | `#A8D0EA` on `#22395C` | 4.5:1 | **7.12:1** |
| Rename input text (accent-text) on input fill | `#A8D0EA` on `#22395C` | 4.5:1 | **7.12:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#C4D2E4` on `#22395C` | 4.5:1 | **7.57:1** |
| Skin search placeholder (text-dim, themed) on panel | `#C4D2E4` on `#101828` | 4.5:1 | **11.57:1** |
| Apps-picker placeholder (text-dim) on search fill | `#C4D2E4` on `#22395C` | 4.5:1 | **7.57:1** |
| Hotkey recording text (accent-m) on input fill | `#F6A0A6` on `#22395C` | 4.5:1 | **5.81:1** |
| Update dismiss glyph (text-dim) on update bar | `#C4D2E4` on `#122238` | 4.5:1 | **10.43:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#C4D2E4` on `#101828` | 3:1 | **11.57:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#7FB4D8` on `#101828` | 3:1 | **7.96:1** |
| Tile border on grid ground (non-text) | `#6A819C` on `#090F1C` | 3:1 | **4.77:1** |
| Hover stripe, blue, on hover fill (non-text) | `#5290DC` on `#22395C` | 3:1 | **3.53:1** |
| Hover stripe, red, on hover fill (non-text) | `#EC5866` on `#22395C` | 3:1 | **3.40:1** |

**Lowest ratio in this theme: 4.65:1 (Header version on header).** Lowest text ratio: 4.65:1 (Header version on header). Lowest non-text ratio: 3.40:1 (Hover stripe, red, on hover fill (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | Lightest stop | Darkest stop |
|---|---|---|
| Header | `#3C5A7C` | `#141F33` |
| Tile at rest | `#1B2F4C` | `#0D182A` |
| Tile hover, focus and pressed | `#22395C` | `#12213A` |
| Banner | `#3C5A7C` | `#141F33` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.25) saturate(0.85)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#1B2F4C` | Hover `#22395C` | Pressed `#22395C` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#789EC7` | 4.82:1 | 4.16:1 | 4.16:1 | pass |
| Calculator `#6b6f76` | `#868B92` | 3.93:1 | 3.39:1 | 3.39:1 | pass |
| Paint `#b07a4f` | `#D39A6C` | 5.53:1 | 4.76:1 | 4.76:1 | pass |
| Terminal `#3d4450` | `#4D5562` | 1.79:1 | 1.54:1 | 1.54:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#6BAAAB` | 5.11:1 | 4.40:1 | 4.40:1 | pass |
| Files `#c09a3e` | `#E9C15F` | 7.87:1 | 6.78:1 | 6.78:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.39:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Icy blue `#7FB4D8` is `--accent-c` (8.59:1); `--accent-text` is `#A8D0EA`; red `#B42A35` is the edit bar rule and the remove button; the hover stripes are the brighter red `#EC5866` (3.40:1 on the hover fill) and blue `#5290DC` (3.53:1), so each reads against the fill (the first build used `#E04A58`, 2.93:1, and was raised). Plate contrast is the tightest of the family: after the fx filter the dull-silver Calculator plate allows a ground of luminance 0.052 or less (0.3). The first hover fill `#26436A` (luminance 0.055) measured 2.92:1 and was lowered to `#22395C` (0.040), only one step lighter than the rest fill.

### 4.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | Jost, 'Segoe UI', Arial, sans-serif |
| `#title` | **Jost 300**, 12 px, tracking 4 px, uppercase from the markup, `font-synthesis: none` |
| `.tile-label` | **Jost 350** (variable axis), 11 px with `line-height: 14.4px` (keeps the tile at about 95.4 px; 10.4 px lines would shrink it to 94.2), 1 px, uppercase; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | **Jost 300**, 12 px, 0.6 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 143.30** (gate 156; 12.7 px under, 24.7 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 54.4, CALCULATOR 74.1, PAINT 33.3, TERMINAL 56.9, BROWSER 55.9, FILES 29.7 px, no ellipsis. Tile height 95.41 px (94.7 to 95.4 required; 0.01 px over is the sub-pixel rounding of a 14.4 px line box, accepted). Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; the old `overflow: hidden` clip cuts 0 px in the same band (this theme's test strings have no descender tails: uppercase; the lever stays for Cyrillic tails). **Platform fonts the mock used:** title Jost (web) x12; labels Jost (web) x7; banner Jost (web) x28; version and settings Jost (web) x7. Expected `fontsRendered` for the web faces: Jost.

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Jost covers it (checked: "Калькулятор" renders in Jost); the bundled face keeps Cyrillic names.

### 4.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #3C5A7C 0, #141F33 100%); border-bottom-color: #C9D6E4; box-shadow: none; }`: a 1 px line (the header's own border, y 39 to 40; nothing below). `#header::before { background: #7FB4D8; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): two groups of three 1 px slashes either side of a silver crescent moon with two small stars, over two silver hairlines. Painted pixels at x 170.0 to 250.0, y 12.0 to 29.0. Hidden while the chip shows. The title ends at x 143.3, the scene starts at x 168: 24.7 px clear.

**B. Frame (the kit of 0.3).** a 1 px silver-grey hairline down both sides with a tick (and a longer silver tick every 12 px); the top course is a hairline over three diagonal slashes over a second hairline; each corner is two nested 1 px L brackets. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner is the family gradient (`#3C5A7C` to `#141F33`) with a 1 px grey-blue top border; its top course is a hairline with a pair of tiny squares, blue then red, twice every 24 px; the icon is the **moon** (a pale disc with four grey craters and a shaded limb); the right end is a **moon** with three craters, two sweeping hairlines behind it, a bright hairline trail and four stars. The motif's painted pixels are at x 329.9 to 404.0, y 269.5 to 298.5 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 206.7 px (0.8). The banner row of the probe reads 3 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: a rectangle with the top-left corner cut at 45 degrees (14 px), the one angled cut of the family. Tiles: the window: a vertical gradient (`#1B2F4C` to `#0D182A`), a 1 px grey-blue border, a 1 px lit top edge, square corners; the plate keeps the app's own rounded square (`--tile-icon-shape: none`); on hover the border turns icy blue and a 3 px blue stripe and a 3 px red stripe (`inset` shadows) sit on the left and right edges.

**Trademark note.** The FF8 logo (the wing mark), the gunblade, the lion emblem, the GF art and the Triple Triad card faces are not drawn. The stripes are two flat colours; the moon is a disc with craters.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B42A35; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 1 px line inside it, the game's emblem in the art zone */
#header { background: linear-gradient(180deg, #3C5A7C 0, #141F33 100%); border-bottom-color: #C9D6E4; box-shadow: none; }
#header::before { background: #7FB4D8; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-weight: 300; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 12px; letter-spacing: 4px; color: #E4ECF6; text-shadow: none; }
#title .accent { color: #BFE0F4; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNER@ left 1px top 0 / 8px 8px no-repeat,
    @CORNER@ right 5px top 0 / 8px 8px no-repeat,
    @CORNER@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNER@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 24px repeat-y,
    @SIDE@ right 5px top 0 / 8px 24px repeat-y,
    @TOP@ left 0 top 0 / 24px 9px repeat-x;
}

/* tiles: the menu window (a vertical gradient, a 1 px light border, a 1 px lit top edge) */
.app-tile { background: linear-gradient(180deg, #1B2F4C 0, #0D182A 100%); border-color: #6A819C; border-radius: 0px; box-shadow: inset 0 1px 0 #6A819C; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: linear-gradient(180deg, #22395C 0, #12213A 100%); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: linear-gradient(180deg, #22395C 0, #12213A 100%); }
.tile-label { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-size: 11px; line-height: 14.4px; font-synthesis: none; overflow: clip; overflow-clip-margin: 3px; }

/* banner: surface, a top course, the game's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, linear-gradient(180deg, #3C5A7C 0, #141F33 100%);
  border-top-color: #6A819C;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 300; font-style: normal; font-synthesis: none; letter-spacing: 0.6px; color: #E4ECF6; margin-right: 90px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CORNER@` | `corner` |
| `@SIDE@` | `side` |
| `@TOP@` | `top` |
| `@MOTIF@` | `motif` |
| `@BTOP@` | `btop` |
| `@ICON@` | `icon` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#...)` in the SVGs that carry a `<radialGradient>` or `<linearGradient>`, which `enc()` turns into `%23`):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<path d='M6 17 L10 3 M12 17 L16 3 M18 17 L22 3' stroke='rgb(122,142,166)' stroke-width='1' fill='none'/><path d='M60 17 L64 3 M66 17 L70 3 M72 17 L76 3' stroke='rgb(122,142,166)' stroke-width='1' fill='none'/>
<path d='M2 18.6 H30 M54 18.6 H82' stroke='rgb(201,214,228)' stroke-width='0.8'/>
<path d='M44 2.6 A8 8 0 1 0 44 17.4 A19 19 0 0 1 44 2.6 Z' fill='rgb(201,214,228)'/><circle cx='49.4' cy='5.2' r='0.8' fill='rgb(127,180,216)'/><circle cx='52' cy='10.4' r='0.6' fill='rgb(201,214,228)'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='0.2' width='24' height='0.9' fill='rgb(122,142,166)'/><path d='M3 8.4 L7 2.6 M11 8.4 L15 2.6 M19 8.4 L23 2.6' stroke='rgb(122,142,166)' stroke-width='0.9' fill='none'/><rect x='0' y='8.3' width='24' height='0.7' fill='rgb(201,214,228)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='3.4' y='0' width='0.9' height='24' fill='rgb(122,142,166)'/><rect x='3.4' y='11.4' width='4' height='0.9' fill='rgb(201,214,228)'/><rect x='3.4' y='1' width='2' height='0.9' fill='rgb(122,142,166)'/><rect x='3.4' y='22' width='2' height='0.9' fill='rgb(122,142,166)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<path d='M0.5 7.6 V0.5 H7.6' fill='none' stroke='rgb(201,214,228)' stroke-width='0.9'/><path d='M3 7.6 V3 H7.6' fill='none' stroke='rgb(122,142,166)' stroke-width='0.7'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='0.2' width='24' height='0.9' fill='rgb(122,142,166)'/><rect x='3' y='2.6' width='2.4' height='2.4' fill='rgb(82,144,220)'/><rect x='5.6' y='2.6' width='2.4' height='2.4' fill='rgb(236,88,102)'/><rect x='15' y='2.6' width='2.4' height='2.4' fill='rgb(236,88,102)'/><rect x='17.6' y='2.6' width='2.4' height='2.4' fill='rgb(82,144,220)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<path d='M2 28 C24 24 44 14 60 4' stroke='rgb(122,142,166)' stroke-width='1' fill='none'/><path d='M8 32 C28 28 46 18 62 8' stroke='rgb(122,142,166)' stroke-width='0.8' fill='none'/>
<circle cx='64' cy='17' r='10.6' fill='rgb(222,232,244)' stroke='rgb(150,168,194)' stroke-width='0.8'/><circle cx='60' cy='13.4' r='2.2' fill='rgb(150,168,194)'/><circle cx='68.4' cy='19.6' r='1.7' fill='rgb(150,168,194)'/><circle cx='61.4' cy='21.6' r='1.2' fill='rgb(150,168,194)'/><path d='M70 8.6 A10.6 10.6 0 0 1 72 24 A8.6 8.6 0 0 0 70 8.6 Z' fill='rgb(106,126,156)' fill-opacity='0.55'/>
<path d='M20 31 C36 27 50 22 54 20' stroke='rgb(201,214,228)' stroke-width='1.1' fill='none'/>
<circle cx='8' cy='10' r='0.9' fill='rgb(201,214,228)'/><circle cx='22' cy='5' r='0.7' fill='rgb(201,214,228)'/><circle cx='34' cy='11' r='0.7' fill='rgb(127,180,216)'/><circle cx='14' cy='20' r='0.6' fill='rgb(122,142,166)'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<defs><radialGradient id='m' cx='0.38' cy='0.32' r='0.85'><stop offset='0' stop-color='rgb(244,248,252)'/><stop offset='1' stop-color='rgb(168,186,210)'/></radialGradient></defs>
<circle cx='11' cy='11' r='9.2' fill='url(#m)' stroke='rgb(150,168,194)' stroke-width='0.9'/><circle cx='7.6' cy='7.6' r='2' fill='rgb(150,168,194)'/><circle cx='14.4' cy='13.4' r='1.6' fill='rgb(150,168,194)'/><circle cx='8.4' cy='15.2' r='1.1' fill='rgb(150,168,194)'/><circle cx='15.2' cy='6.8' r='0.9' fill='rgb(150,168,194)'/><path d='M14.6 3.4 A9.2 9.2 0 0 1 16.4 18.4 A7.4 7.4 0 0 0 14.6 3.4 Z' fill='rgb(106,126,156)' fill-opacity='0.55'/>
</svg>
```

### 4.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | ff8-title (2) | removed |
| 2 | banner-pulse (1) | removed |
| 3 | ff8-blade (1) | removed |
| 4 | ff8-readout (2) | removed |
| 5 | ff8-border (5) | removed |
| 6 | ff8-wind `#particles` (4) | removed |
| hover | one-shot `tile-radial .55s` (not infinite) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite ff8.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 4.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `linear-gradient(180deg, #1B2F4C, #0D182A)`, border `#6A819C` (1 px), radius 0px, `box-shadow: inset 0 1px 0 #6A819C` (the lit edge), `::before` off; layout unchanged. Icons: `brightness(1.25) saturate(0.85)` through the app's own plate.
- **Hover:** `linear-gradient(180deg, #22395C, #12213A)`, border `#7FB4D8` (5.21:1 on the hover fill), `box-shadow: inset 3px 0 0 #5290DC, inset -3px 0 0 #EC5866`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (6.05:1 on the tile, 8.59:1 on the grid ground). **Pressed:** base scale 0.96 on the same gradient as hover.
- **Label:** `#E4ECF6`, **Jost 350** (variable axis), 11 px with `line-height: 14.4px` (keeps the tile at about 95.4 px; 10.4 px lines would shrink it to 94.2), 1 px, uppercase.
- **Filter chip:** base rule (fill `#22395C`, `--accent-c` border, `#A8D0EA` text). The header scene hides while it shows.
- **Edit bar:** `#2A1218` fill, `#B42A35` rule, label `#F08A92`; `+ FILE` and `+ INSTALLED` in `--text` with a `#7A93AE` border, `DONE` in `#F08A92` with a `#B42A35` border. The tile remove button is `#B42A35` with a `#F08A92` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#090F1C`, panel `#101828`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#A8D0EA` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#A8D0EA` text on `#122238` with a `#7FB4D8` rule.

### 4.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite ff8.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 1 px line (`#C9D6E4`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **143.30**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#3C5A7C` to `#141F33` gradient with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 3 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a moon at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#7FB4D8` border, the blue stripe on the left edge and the red stripe on the right edge, the hover gradient, the app's own plate, no ellipsis on CALCULATOR (mock 74.1 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): icy blue for the header bar, the ring, the hover border and the values; silver for lines; one red (stripe, banner ticks, edit bar, remove button) and one blue (stripe, banner ticks); no gold, green or purple.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 8 px, banner 3 px; at 640 x 420 10 / 8 / 12 px; at 1024 x 700 10 / 8 / 12 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Jost` (web) and `Segoe UI` for the version line; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 3** (title and banner text covered). What survives: icy blue gradient windows with silver hairlines, slashes and ticks, a moon in the banner, a blue and red stripe on the hovered tile. What is missing for a 5: the game read depends on the moon and the stripes; a fan reads "Final Fantasy" at once and "VIII" only after the hover. The gunblade and the lion are marks and are not drawn.

Watch items for this theme: (1) The crescent in the header and the moon in the banner are the same motif twice; the crescent could go if Sergei finds it repeats. (2) The stripe colours are decorative cues, not state: hover also changes the border and the fill, so colour-blind readers lose nothing.

---

## 5. ff9 (FINAL FANTASY IX): DONE

**Audit:** score 3, tone down. Warm gold and italic Georgia was the right storybook mood and the least broken of the set. Missing: stage curtains, marionette strings, scroll frames, the blue window with ornate corners. A tower-and-crystal drawing sat under CALCULATOR and a quote readout ("YOU DON'T NEED A REASON TO HELP PEOPLE") printed over PAINT and FILES. Six infinite animations.
**Direction:** blue windows in a wooden stage frame. The family kit gives the blue gradient windows; the frame around them is warm (wood and brass), so the windows read as paintings on a proscenium. The top course is a red curtain valance with brass beads, the sides are wood with brass diamonds, the corners are brass scrolls, the header carries a marionette bar with a star on each side string and a crystal on the middle one, the banner a castle with two red-roofed towers and a crystal as its icon. Arch-top plates and tiles, Constantia italic labels (lining figures forced), Gabriola title. Static.

### 5.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: inset(0 round 14px);
  --overlay-clip: inset(0 round 14px);
  --bg: #241A18;
  --panel-bg: #2C201C;
  --overlay-bg: #241A18;
  --header-bg: #2E5890;
  --font: Constantia, 'Palatino Linotype', Georgia, serif;
  --text: #F6ECCC;
  --text-dim: #EADFC0;
  --accent-c: #B7842B;
  --accent-m: #F09A8E;
  --accent-y: #B7842B;
  --accent-text: #E6B84E;
  --border: #B7842B;
  --border-h: #E8C060;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #B7842B;
  --title-anim: none;
  --tile-hover-bg: #1A3278;
  --tile-hover-border: #E8C060;
  --tile-hover-shadow: inset 0 1px 0 #F2D07A;
  --tile-active-bg: #1A3278;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.2) saturate(0.95);
  --tile-icon-shape: inset(0 round 30px 30px 6px 6px);
  --tile-label-spacing: 0.3px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: italic;
  --tile-label-shadow: 1px 1px 0 #000000;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #3A6AAA;
  --btn-active-bg: #4A7ABA;
  --drop-hint-border: #6E4A2A;
  --drop-icon-color: #9A7448;
  --hint-sub-color: #EADFC0;
  --rename-dashed: #B7842B;
  --rename-input-bg: #1A3278;
  --edit-bar-bg: #2E1412;
  --edit-bar-border: #C4453A;
  --edit-label-color: #F09A8E;
  --edit-label-glow: none;
  --btn-done-color: #F09A8E;
  --btn-done-border: #C4453A;
  --btn-done-hover-bg: #4A1C18;
  --btn-done-hover-glow: none;
  --btn-add-border: #9A7448;
  --update-bg: #1E2A50;
  --update-border: #B7842B;
  --update-color: #E6B84E;
  --update-btn-border: #B7842B;
  --update-btn-hover-bg: #2E4A84;
  --update-btn-hover-glow: none;
  --btn-close-color: #E6B84E;
  --btn-close-border: #B7842B;
  --btn-close-hover-bg: #2E4A84;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1A3278;
  --picker-item-hover-bg: #1A3278;
  --picker-item-active-bg: #2E4A84;
  --picker-placeholder-bg: #1A3278;
  --skin-btn-active-bg: #2E4A84;
  --remove-btn-bg: #B03A30;
  --remove-btn-border: #F09A8E;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#F6ECCC` on `#241A18` | 4.5:1 | **14.39:1** |
| `--text-dim` on `--bg` | `#EADFC0` on `#241A18` | 4.5:1 | **12.80:1** |
| `--accent-c` on `--bg` | `#B7842B` on `#241A18` | 3:1 | **5.14:1** |
| `--accent-text` on `--bg` | `#E6B84E` on `#241A18` | 3:1 | **9.17:1** |
| `--hint-sub-color` on `--bg` | `#EADFC0` on `#241A18` | 4.5:1 | **12.80:1** |
| `--btn-close-color` on `--panel-bg` | `#E6B84E` on `#2C201C` | 4.5:1 | **8.52:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the lightest stop**, except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F6ECCC` on `#14286E` | 4.5:1 | **11.41:1** |
| Tile label on tile hover | `#F6ECCC` on `#1A3278` | 4.5:1 | **10.04:1** |
| Tile label on tile pressed (pressed state) | `#F6ECCC` on `#1A3278` | 4.5:1 | **10.04:1** |
| Title on header | `#F6ECCC` on `#2E5890` | 4.5:1 | **6.10:1** |
| Title dot (`.accent`) on header | `#F2D07A` on `#2E5890` | 4.5:1 | **4.83:1** |
| Header version on header | `#EADFC0` on `#2E5890` | 4.5:1 | **5.43:1** |
| Header button glyph on header | `#F6ECCC` on `#2E5890` | 4.5:1 | **6.10:1** |
| Header button glyph on button hover | `#FFFFFF` on `#3A6AAA` | 4.5:1 | **5.49:1** |
| Filter chip text on chip | `#E6B84E` on `#1A3278` | 4.5:1 | **6.40:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#1A3278` | 4.5:1 | **11.86:1** |
| Banner text on banner | `#F6ECCC` on `#2E5890` | 4.5:1 | **6.10:1** |
| Header line on header (non-text) | `#B7842B` on `#14244E` | 3:1 | **4.56:1** |
| Edit label on edit bar | `#F09A8E` on `#2E1412` | 4.5:1 | **7.93:1** |
| Done / close button text on edit bar | `#F09A8E` on `#2E1412` | 4.5:1 | **7.93:1** |
| + FILE / + INSTALLED text on edit bar | `#F6ECCC` on `#2E1412` | 4.5:1 | **14.52:1** |
| Done button text on its hover fill | `#F09A8E` on `#4A1C18` | 4.5:1 | **6.61:1** |
| Settings text on overlay | `#F6ECCC` on `#241A18` | 4.5:1 | **14.39:1** |
| Settings text on panel | `#F6ECCC` on `#2C201C` | 4.5:1 | **13.37:1** |
| Settings label (text-dim) on panel | `#EADFC0` on `#2C201C` | 4.5:1 | **11.89:1** |
| Settings value / cheat key (accent-text) on panel | `#E6B84E` on `#2C201C` | 4.5:1 | **8.52:1** |
| Settings version value (accent-text) on panel | `#E6B84E` on `#2C201C` | 4.5:1 | **8.52:1** |
| Settings CLOSE text on panel | `#E6B84E` on `#2C201C` | 4.5:1 | **8.52:1** |
| Settings CLOSE text on its hover fill | `#E6B84E` on `#2E4A84` | 4.5:1 | **4.67:1** |
| Hotkey error text (accent-m) on panel | `#F09A8E` on `#2C201C` | 4.5:1 | **7.30:1** |
| Hotkey input text on input fill | `#E6B84E` on `#1A3278` | 4.5:1 | **6.40:1** |
| Picker row text on hover fill | `#E6B84E` on `#1A3278` | 4.5:1 | **6.40:1** |
| Update banner text on update bar | `#E6B84E` on `#1E2A50` | 4.5:1 | **7.54:1** |
| Update button text on hover fill | `#FFFFFF` on `#2E4A84` | 4.5:1 | **8.65:1** |
| Drop-hint text (text-dim) on grid ground | `#EADFC0` on `#241A18` | 4.5:1 | **12.80:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#B03A30` | 3:1 | **6.01:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#B03A30` | 3:1 | **6.01:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#B7842B` on `#14286E` | 3:1 | **4.07:1** |
| Focus ring on grid ground (non-text) | `#B7842B` on `#241A18` | 3:1 | **5.14:1** |
| Hover border on grid ground (non-text) | `#E8C060` on `#241A18` | 3:1 | **9.82:1** |
| Hover border on hover fill (non-text) | `#E8C060` on `#1A3278` | 3:1 | **6.85:1** |
| Theme-picker selected row text (accent-text) on active fill | `#E6B84E` on `#2E4A84` | 4.5:1 | **4.67:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#E6B84E` on `#1A3278` | 4.5:1 | **6.40:1** |
| Skin search input text (accent-text) on panel | `#E6B84E` on `#2C201C` | 4.5:1 | **8.52:1** |
| Apps-picker search input text (accent-text) on search fill | `#E6B84E` on `#1A3278` | 4.5:1 | **6.40:1** |
| Rename input text (accent-text) on input fill | `#E6B84E` on `#1A3278` | 4.5:1 | **6.40:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#EADFC0` on `#1A3278` | 4.5:1 | **8.93:1** |
| Skin search placeholder (text-dim, themed) on panel | `#EADFC0` on `#2C201C` | 4.5:1 | **11.89:1** |
| Apps-picker placeholder (text-dim) on search fill | `#EADFC0` on `#1A3278` | 4.5:1 | **8.93:1** |
| Hotkey recording text (accent-m) on input fill | `#F09A8E` on `#1A3278` | 4.5:1 | **5.49:1** |
| Update dismiss glyph (text-dim) on update bar | `#EADFC0` on `#1E2A50` | 4.5:1 | **10.53:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#EADFC0` on `#2C201C` | 3:1 | **11.89:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#B7842B` on `#2C201C` | 3:1 | **4.77:1** |
| Tile border on grid ground (non-text) | `#B7842B` on `#241A18` | 3:1 | **5.14:1** |

**Lowest ratio in this theme: 4.67:1 (Settings CLOSE text on its hover fill).** Lowest text ratio: 4.67:1 (Settings CLOSE text on its hover fill). Lowest non-text ratio: 4.07:1 (Focus ring (accent-c) on tile rest (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | Lightest stop | Darkest stop |
|---|---|---|
| Header | `#2E5890` | `#14244E` |
| Tile at rest | `#14286E` | `#0A1444` |
| Tile hover, focus and pressed | `#1A3278` | `#0F1E58` |
| Banner | `#2E5890` | `#14244E` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.2) saturate(0.95)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#14286E` | Hover `#1A3278` | Pressed `#1A3278` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6F98C5` | 4.47:1 | 3.94:1 | 3.94:1 | pass |
| Calculator `#6b6f76` | `#81858D` | 3.64:1 | 3.20:1 | 3.20:1 | pass |
| Paint `#b07a4f` | `#D09362` | 5.15:1 | 4.53:1 | 4.53:1 | pass |
| Terminal `#3d4450` | `#4A525F` | 1.71:1 | 1.50:1 | 1.50:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#62A5A6` | 4.78:1 | 4.21:1 | 4.21:1 | pass |
| Files `#c09a3e` | `#E4B950` | 7.29:1 | 6.41:1 | 6.41:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.20:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Brass `#B7842B` is `--accent-c` (5.14:1 on the warm ground `#241A18`); `--accent-text` is `#E6B84E` (9.17:1). The header line sits at the bottom of the header, where the gradient is darkest: brass `#B7842B` is 4.56:1 on `#14244E` (it would be only 2.18:1 on the lightest stop, which is not where the line is, so the table measures the line on the dark end). Cream `#F6ECCC` text and `#EADFC0` dim text sit on a header of `#2E5890` at the lightest. The window ground is the warm brown `#241A18` the audit asked for; it is the only warm ground in the family and makes the blue windows read as lit.

### 5.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | Constantia, 'Palatino Linotype', Georgia, serif, with `html, body { font-variant-numeric: lining-nums; }` |
| `#title` | Gabriola 400, **16 px**, tracking 2 px, uppercase from the markup, `line-height: 1.2` |
| `.tile-label` | Constantia italic 400, 12 px, 0.3 px, user case, 1 px black drop; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | Constantia italic 400, 12 px, 0.3 px, sentence case, 1 px black drop |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 123.19** (gate 156; 32.8 px under, 44.8 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 45.1, CALCULATOR 56.6, PAINT 28.6, TERMINAL 48.0, BROWSER 43.3, FILES 24.8 px, no ellipsis. Tile height 95.39 px (94.7 to 95.4 required). Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; the old `overflow: hidden` clip cuts 33 px in the same band (positive control). **Platform fonts the mock used:** title Gabriola x12; labels Constantia x7; banner Constantia x28; version and settings Constantia x7. Expected `fontsRendered` for the web faces: none (stock only).

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Constantia covers it (checked: "Калькулятор", "Жёсткий диск"); Gabriola covers only the Latin title.

### 5.3 Art (tone down with a new frame). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #2E5890 0, #14244E 100%); border-bottom-color: #B7842B; box-shadow: inset 0 -2px 0 #B7842B; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #B7842B; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a brass-and-wood marionette control bar with three cream strings, a gold star on each outer string and a blue crystal on the middle one. Painted pixels at x 185.3 to 234.8, y 10.0 to 30.0. Hidden while the chip shows. The title ends at x 123.2, the scene starts at x 168: 44.8 px clear.

**B. Frame (the kit of 0.3).** a wood strip with 1 px brass edges and a brass diamond stud every 24 px down both sides; the top course is a brass rod over a row of red curtain scallops with brass beads (8 px scallops, 5.6 px deep); each corner is a brass scroll curl with a gold stud. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 7 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner is the family gradient (`#2E5890` to `#14244E`) with a 1 px brass top border; its top course is a brass rod with three hanging brass beads every 24 px; the icon is a **crystal** (a pale blue elongated hexagon with a lit facet and two small shards); the right end is a **castle**: a stone keep with a red conical roof, a flag and a lit arch door, two flanking towers with red roofs and lit windows, a curtain wall and a stone base. The motif's painted pixels are at x 331.6 to 408.4, y 266.0 to 300.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 77.7 px (0.8). The banner row of the probe reads 3 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: a rectangle with 14 px rounded corners (a storybook window). Tiles: the window: a vertical gradient (`#14286E` to `#0A1444`), a 1 px brass border `#B7842B`, a 1 px lit top edge, an arch top (16 px top radius, 4 px bottom); plates have an arch top (30 px round on the top corners, 6 px on the bottom). Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 9.08, Calculator 7.28, Paint 11.01, Terminal 5.57, Browser 11.6, Files 8.7 (smallest 5.57); nothing is cropped.

**Trademark note.** The FF9 logo, the Tantalus crest, the Alexandrian crest and every character (Vivi, Zidane, the moogles) are not drawn. The valance, the marionette bar, the castle and the crystal are generic stage and fairy-tale parts.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B03A30; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the game's emblem in the art zone */
#header { background: linear-gradient(180deg, #2E5890 0, #14244E 100%); border-bottom-color: #B7842B; box-shadow: inset 0 -2px 0 #B7842B; }
#header::before { background: #B7842B; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Gabriola, 'Palatino Linotype', Georgia, serif; font-weight: 400; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 16px; letter-spacing: 2px; color: #F6ECCC; text-shadow: none; }
#title .accent { color: #F2D07A; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNER@ left 1px top 0 / 8px 8px no-repeat,
    @CORNER@ right 5px top 0 / 8px 8px no-repeat,
    @CORNER@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNER@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 24px repeat-y,
    @SIDE@ right 5px top 0 / 8px 24px repeat-y,
    @TOP@ left 0 top 0 / 24px 9px repeat-x;
}

/* tiles: the menu window (a vertical gradient, a 1 px light border, a 1 px lit top edge) */
.app-tile { background: linear-gradient(180deg, #14286E 0, #0A1444 100%); border-color: #B7842B; border-radius: 16px 16px 4px 4px; box-shadow: inset 0 1px 0 #5A86C8; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: linear-gradient(180deg, #1A3278 0, #0F1E58 100%); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: linear-gradient(180deg, #1A3278 0, #0F1E58 100%); }
.tile-label { font-family: Constantia, 'Palatino Linotype', Georgia, serif; overflow: clip; overflow-clip-margin: 3px; }
/* Constantia draws old-style figures by default; the version, sizes and tile names want lining ones */
html, body { font-variant-numeric: lining-nums; }

/* banner: surface, a top course, the game's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, linear-gradient(180deg, #2E5890 0, #14244E 100%);
  border-top-color: #B7842B;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Constantia, 'Palatino Linotype', Georgia, serif; font-size: 12px; font-weight: 400; font-style: italic; letter-spacing: 0.3px; text-shadow: 1px 1px 0 #000000; color: #F6ECCC; margin-right: 90px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CORNER@` | `corner` |
| `@SIDE@` | `side` |
| `@TOP@` | `top` |
| `@MOTIF@` | `motif` |
| `@BTOP@` | `btop` |
| `@ICON@` | `icon` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#...)` in the SVGs that carry a `<radialGradient>` or `<linearGradient>`, which `enc()` turns into `%23`):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<rect x='20' y='0.6' width='44' height='2.4' fill='rgb(110,74,32)'/><rect x='20' y='0.6' width='44' height='0.8' fill='rgb(232,192,96)'/><rect x='40.6' y='0' width='2.8' height='5' fill='rgb(110,74,32)'/><circle cx='20' cy='1.8' r='1.4' fill='rgb(183,132,43)'/><circle cx='64' cy='1.8' r='1.4' fill='rgb(183,132,43)'/>
<path d='M24 3 L21.4 14.6 M42 5 V15.6 M60 3 L62.6 14.6' stroke='rgb(246,236,204)' stroke-width='0.7' stroke-opacity='0.85' fill='none'/>
<path d='M21 12.8 L21.88 15.19 L24.42 15.29 L22.43 16.86 L23.12 19.31 L21 17.9 L18.88 19.31 L19.57 16.86 L17.58 15.29 L20.12 15.19 Z' fill='rgb(232,192,96)' stroke='rgb(110,74,32)' stroke-width='0.5' stroke-linejoin='round'/><path d='M63 12.8 L63.88 15.19 L66.42 15.29 L64.43 16.86 L65.12 19.31 L63 17.9 L60.88 19.31 L61.57 16.86 L59.58 15.29 L62.12 15.19 Z' fill='rgb(232,192,96)' stroke='rgb(110,74,32)' stroke-width='0.5' stroke-linejoin='round'/>
<path d='M42 13.799999999999999 L44.6 17.2 L42 20.599999999999998 L39.4 17.2 Z' fill='rgb(150,214,246)' stroke='rgb(30,70,130)' stroke-width='0.6' stroke-linejoin='round'/><path d='M42 13.8 L43.6 17.2 H42 Z' fill='rgb(232,248,255)' fill-opacity='0.8'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='0' width='24' height='1.4' fill='rgb(183,132,43)'/><rect x='0' y='0' width='24' height='0.5' fill='rgb(232,192,96)'/><path d='M0.4 1.2 H7.6000000000000005 C7.6000000000000005 6.8 0.4 6.8 0.4 1.2 Z' fill='rgb(168,48,52)'/><path d='M4 1.2 V5.232' stroke='rgb(104,26,32)' stroke-width='0.8'/><path d='M8.4 1.2 H15.600000000000001 C15.600000000000001 6.8 8.4 6.8 8.4 1.2 Z' fill='rgb(168,48,52)'/><path d='M12 1.2 V5.232' stroke='rgb(104,26,32)' stroke-width='0.8'/><path d='M16.4 1.2 H23.599999999999998 C23.599999999999998 6.8 16.4 6.8 16.4 1.2 Z' fill='rgb(168,48,52)'/><path d='M20 1.2 V5.232' stroke='rgb(104,26,32)' stroke-width='0.8'/><circle cx='4' cy='7.6' r='0.9' fill='rgb(232,192,96)'/><circle cx='12' cy='7.6' r='0.9' fill='rgb(232,192,96)'/><circle cx='20' cy='7.6' r='0.9' fill='rgb(232,192,96)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='0' y='0' width='8' height='24' fill='rgb(84,54,34)'/><rect x='0' y='0' width='1' height='24' fill='rgb(183,132,43)'/><rect x='7' y='0' width='1' height='24' fill='rgb(183,132,43)'/><rect x='2.4' y='0' width='0.5' height='24' fill='rgb(54,34,24)'/><rect x='5.1' y='0' width='0.5' height='24' fill='rgb(54,34,24)'/><path d='M4 8.8 L6.4 12 L4 15.2 L1.6 12 Z' fill='rgb(183,132,43)' stroke='rgb(110,74,32)' stroke-width='0.6' stroke-linejoin='round'/><circle cx='4' cy='12' r='0.8' fill='rgb(232,192,96)'/><circle cx='4' cy='3' r='0.8' fill='rgb(183,132,43)'/><circle cx='4' cy='21' r='0.8' fill='rgb(183,132,43)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect x='0' y='0' width='8' height='8' fill='rgb(84,54,34)'/><path d='M0.8 7.4 C0.8 3.4 3.4 0.8 7.4 0.8' fill='none' stroke='rgb(183,132,43)' stroke-width='1.2' stroke-linecap='round'/><circle cx='4.6' cy='4.6' r='1.5' fill='rgb(232,192,96)' stroke='rgb(110,74,32)' stroke-width='0.5'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='0' width='24' height='1.3' fill='rgb(183,132,43)'/><rect x='0' y='0' width='24' height='0.5' fill='rgb(232,192,96)'/><path d='M4 1.3 V3.6 M12 1.3 V3.6 M20 1.3 V3.6' stroke='rgb(110,74,32)' stroke-width='0.8'/><circle cx='4' cy='4.8' r='1.3' fill='rgb(232,192,96)' stroke='rgb(110,74,32)' stroke-width='0.4'/><circle cx='12' cy='4.8' r='1.3' fill='rgb(232,192,96)' stroke='rgb(110,74,32)' stroke-width='0.4'/><circle cx='20' cy='4.8' r='1.3' fill='rgb(232,192,96)' stroke='rgb(110,74,32)' stroke-width='0.4'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<path d='M4 34 L8 28 H78 L80 34 Z' fill='rgb(86,90,116)' stroke='rgb(150,152,170)' stroke-width='0.6' stroke-linejoin='round'/>
<rect x='12' y='14' width='9' height='15' fill='rgb(150,152,170)' stroke='rgb(86,90,116)' stroke-width='0.6'/><path d='M10.6 14 L16.5 6 L22.4 14 Z' fill='rgb(170,50,54)' stroke='rgb(104,26,32)' stroke-width='0.6' stroke-linejoin='round'/><rect x='15.5' y='17.2' width='2' height='3.6' rx='1' fill='rgb(242,206,110)'/><rect x='63' y='14' width='9' height='15' fill='rgb(150,152,170)' stroke='rgb(86,90,116)' stroke-width='0.6'/><path d='M61.6 14 L67.5 6 L73.4 14 Z' fill='rgb(170,50,54)' stroke='rgb(104,26,32)' stroke-width='0.6' stroke-linejoin='round'/><path d='M67.5 6 V2 L70.9 3.2 L67.5 4.4' fill='rgb(183,132,43)' stroke='rgb(110,74,32)' stroke-width='0.4'/><rect x='66.5' y='17.2' width='2' height='3.6' rx='1' fill='rgb(242,206,110)'/>
<rect x='33' y='11' width='18' height='18' fill='rgb(150,152,170)' stroke='rgb(86,90,116)' stroke-width='0.6'/><path d='M31.4 11 L42 1.4 L52.6 11 Z' fill='rgb(170,50,54)' stroke='rgb(104,26,32)' stroke-width='0.6' stroke-linejoin='round'/><path d='M42 1.4 V-0.4' stroke='rgb(183,132,43)' stroke-width='0.9'/>
<path d='M30 11 H54 V9.4 H51.6 V11 M30 11 V9.4 M36 11 V9.4 M33 11 V9.4' stroke='rgb(86,90,116)' stroke-width='0.5' fill='none'/>
<path d='M38 29 V23 C38 19.6 46 19.6 46 23 V29 Z' fill='rgb(54,34,24)' stroke='rgb(183,132,43)' stroke-width='0.6'/><rect x='40.6' y='14.4' width='2.8' height='4.4' rx='1.4' fill='rgb(242,206,110)'/>
<rect x='34.6' y='20' width='2' height='3.6' rx='1' fill='rgb(242,206,110)'/><rect x='47.4' y='20' width='2' height='3.6' rx='1' fill='rgb(242,206,110)'/>
<path d='M21 21 H33 M51 21 H63' stroke='rgb(86,90,116)' stroke-width='3'/>
<circle cx='6' cy='8' r='0.7' fill='rgb(232,192,96)'/><circle cx='78' cy='6' r='0.7' fill='rgb(232,192,96)'/><circle cx='24' cy='5' r='0.6' fill='rgb(246,236,204)'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<defs><linearGradient id='c' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='rgb(190,232,252)'/><stop offset='1' stop-color='rgb(66,128,190)'/></linearGradient></defs>
<path d='M11 1.2 L16.6 6.4 V15.4 L11 20.8 L5.4 15.4 V6.4 Z' fill='url(#c)' stroke='rgb(30,70,130)' stroke-width='1' stroke-linejoin='round'/>
<path d='M11 1.2 L11 20.8 M5.4 6.4 L16.6 6.4 M5.4 15.4 L16.6 15.4' stroke='rgb(30,70,130)' stroke-width='0.5' stroke-opacity='0.7' fill='none'/>
<path d='M11 1.2 L8.4 6.4 V15.4 L11 20.8 Z' fill='rgb(232,248,255)' fill-opacity='0.55'/>
<path d='M2.4 14.4 L4 11.4 L5.2 14.4 L4 17.4 Z' fill='rgb(150,214,246)' stroke='rgb(30,70,130)' stroke-width='0.6' stroke-linejoin='round'/><path d='M17.6 16.4 L19 13.8 L20 16.4 L19 19 Z' fill='rgb(150,214,246)' stroke='rgb(30,70,130)' stroke-width='0.6' stroke-linejoin='round'/>
</svg>
```

### 5.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | ff9-title (2) | removed |
| 2 | banner-pulse (1) | removed |
| 3 | ff9-crystal (1) | removed |
| 4 | ff9-readout (2) | removed |
| 5 | ff9-border (5) | removed |
| 6 | ff9-stardust `#particles` (4) | removed |
| hover | one-shot `tile-radial .55s` (not infinite) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite ff9.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 5.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `linear-gradient(180deg, #14286E, #0A1444)`, border `#B7842B` (1 px), radius 16px 16px 4px 4px, `box-shadow: inset 0 1px 0 #5A86C8` (the lit edge), `::before` off; layout unchanged. Icons: `brightness(1.2) saturate(0.95)` through the shaped plate (D in 3).
- **Hover:** `linear-gradient(180deg, #1A3278, #0F1E58)`, border `#E8C060` (6.85:1 on the hover fill), `box-shadow: inset 0 1px 0 #F2D07A`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (4.07:1 on the tile, 5.14:1 on the grid ground). **Pressed:** base scale 0.96 on the same gradient as hover.
- **Label:** `#F6ECCC`, Constantia italic 400, 12 px, 0.3 px, user case, 1 px black drop.
- **Filter chip:** base rule (fill `#1A3278`, `--accent-c` border, `#E6B84E` text). The header scene hides while it shows.
- **Edit bar:** `#2E1412` fill, `#C4453A` rule, label `#F09A8E`; `+ FILE` and `+ INSTALLED` in `--text` with a `#9A7448` border, `DONE` in `#F09A8E` with a `#C4453A` border. The tile remove button is `#B03A30` with a `#F09A8E` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#241A18`, panel `#2C201C`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#E6B84E` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#E6B84E` text on `#1E2A50` with a `#B7842B` rule.

### 5.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite ff9.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#B7842B`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **123.19**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#2E5890` to `#14244E` gradient with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 3 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a crystal at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#E8C060` border, the hover gradient, the shaped plate with no cropped glyph, no ellipsis on CALCULATOR (mock 56.6 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): brass for borders, rods, studs and values; red only in the valance, the castle roofs, edit mode and the remove button; blue for the windows; cream for text; nothing green or purple.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 7 px, banner 3 px; at 640 x 420 10 / 7 / 11 px; at 1024 x 700 10 / 7 / 11 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Constantia`, `Gabriola` and `Palatino Linotype` as fallback; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 4** (title and banner text covered). What survives: blue gradient windows with brass borders and arch tops, a red curtain valance, brass scroll corners on a wooden frame, a marionette bar in the header and a castle in the banner. What is missing for a 5: the game's ornate corners on every window and the swashed logo (a mark); Almendra or Cinzel Decorative would add the type voice (wish list).

Watch items for this theme: (1) The arch tops show clearly on the mock plates; a real square icon loses a corner triangle at the top (watch 1 of the batch). (2) The red valance is the loudest piece of the family kit; it reads as a stage curtain at 1x and as a red dotted line at a glance. Lever: swap the scallop fill for the darker `rgb(104,26,32)`.

---

## 6. ff10 (FINAL FANTASY X): DONE

**Audit:** score 3, redraw. Watery blue, circles and a translucent window matched the brief, but `--bg` was 0.55 alpha: on a grey backdrop the title and version were nearly invisible and the header text was grey on grey (the gate flattens on black and passes). A sphere grid and faint ghost text sat behind the tiles; pyreflies drifted as an animated layer. Six infinite animations.
**Direction:** deep water and a sphere grid. Opaque deep-sea gradients (the translucent window goes, as in every redesign: nothing can bleed through a bright wallpaper), aqua for the line, ring and values, teal for the hover, one gold node. The sphere grid is the frame: round nodes on thin lines run along the top and down both sides (the pyreflies, static), the header carries a seven-node network with one gold node, the banner a larger network over two ripple rings, and the icon is a water drop with ripples. Rounded plates and tiles, Segoe UI 350. Static.

### 6.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: inset(0 round 12px);
  --overlay-clip: inset(0 round 12px);
  --bg: #061420;
  --panel-bg: #0A1D2E;
  --overlay-bg: #061420;
  --header-bg: #1E5A80;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #F0F4F8;
  --text-dim: #B8D4E4;
  --accent-c: #2A9FC8;
  --accent-m: #F59A82;
  --accent-y: #2A9FC8;
  --accent-text: #6CD0EE;
  --border: #3C86AE;
  --border-h: #4CC4B8;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #2A9FC8;
  --title-anim: none;
  --tile-hover-bg: #103A54;
  --tile-hover-border: #4CC4B8;
  --tile-hover-shadow: inset 0 1px 0 #8AE4DA;
  --tile-active-bg: #103A54;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.2) saturate(0.95);
  --tile-icon-shape: inset(0 round 20px);
  --tile-label-spacing: 0.4px;
  --tile-label-transform: none;
  --tile-label-weight: 350;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #1E5A80;
  --btn-active-bg: #2A6E98;
  --drop-hint-border: #2A5A7A;
  --drop-icon-color: #4A8AAE;
  --hint-sub-color: #B8D4E4;
  --rename-dashed: #2A9FC8;
  --rename-input-bg: #103A54;
  --edit-bar-bg: #2A1A1A;
  --edit-bar-border: #C0583E;
  --edit-label-color: #F0866C;
  --edit-label-glow: none;
  --btn-done-color: #F0866C;
  --btn-done-border: #C0583E;
  --btn-done-hover-bg: #44221C;
  --btn-done-hover-glow: none;
  --btn-add-border: #4A8AAE;
  --update-bg: #0C2438;
  --update-border: #4CC4B8;
  --update-color: #6CD0EE;
  --update-btn-border: #4CC4B8;
  --update-btn-hover-bg: #14405C;
  --update-btn-hover-glow: none;
  --btn-close-color: #6CD0EE;
  --btn-close-border: #4CC4B8;
  --btn-close-hover-bg: #14405C;
  --btn-close-hover-glow: none;
  --picker-search-bg: #103A54;
  --picker-item-hover-bg: #103A54;
  --picker-item-active-bg: #14405C;
  --picker-placeholder-bg: #103A54;
  --skin-btn-active-bg: #14405C;
  --remove-btn-bg: #B04830;
  --remove-btn-border: #F0866C;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#F0F4F8` on `#061420` | 4.5:1 | **16.83:1** |
| `--text-dim` on `--bg` | `#B8D4E4` on `#061420` | 4.5:1 | **12.03:1** |
| `--accent-c` on `--bg` | `#2A9FC8` on `#061420` | 3:1 | **6.11:1** |
| `--accent-text` on `--bg` | `#6CD0EE` on `#061420` | 3:1 | **10.54:1** |
| `--hint-sub-color` on `--bg` | `#B8D4E4` on `#061420` | 4.5:1 | **12.03:1** |
| `--btn-close-color` on `--panel-bg` | `#6CD0EE` on `#0A1D2E` | 4.5:1 | **9.69:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the lightest stop**, except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F0F4F8` on `#0E2A40` | 4.5:1 | **13.34:1** |
| Tile label on tile hover | `#F0F4F8` on `#103A54` | 4.5:1 | **10.82:1** |
| Tile label on tile pressed (pressed state) | `#F0F4F8` on `#103A54` | 4.5:1 | **10.82:1** |
| Title on header | `#F0F4F8` on `#1E5A80` | 4.5:1 | **6.72:1** |
| Title dot (`.accent`) on header | `#F2D488` on `#1E5A80` | 4.5:1 | **5.14:1** |
| Header version on header | `#B8D4E4` on `#1E5A80` | 4.5:1 | **4.80:1** |
| Header button glyph on header | `#F0F4F8` on `#1E5A80` | 4.5:1 | **6.72:1** |
| Header button glyph on button hover | `#FFFFFF` on `#1E5A80` | 4.5:1 | **7.42:1** |
| Filter chip text on chip | `#6CD0EE` on `#103A54` | 4.5:1 | **6.78:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#103A54` | 4.5:1 | **11.96:1** |
| Banner text on banner | `#F0F4F8` on `#1E5A80` | 4.5:1 | **6.72:1** |
| Header line on header (non-text) | `#2A9FC8` on `#0A2238` | 3:1 | **5.31:1** |
| Edit label on edit bar | `#F0866C` on `#2A1A1A` | 4.5:1 | **6.61:1** |
| Done / close button text on edit bar | `#F0866C` on `#2A1A1A` | 4.5:1 | **6.61:1** |
| + FILE / + INSTALLED text on edit bar | `#F0F4F8` on `#2A1A1A` | 4.5:1 | **15.07:1** |
| Done button text on its hover fill | `#F0866C` on `#44221C` | 4.5:1 | **5.59:1** |
| Settings text on overlay | `#F0F4F8` on `#061420` | 4.5:1 | **16.83:1** |
| Settings text on panel | `#F0F4F8` on `#0A1D2E` | 4.5:1 | **15.47:1** |
| Settings label (text-dim) on panel | `#B8D4E4` on `#0A1D2E` | 4.5:1 | **11.05:1** |
| Settings value / cheat key (accent-text) on panel | `#6CD0EE` on `#0A1D2E` | 4.5:1 | **9.69:1** |
| Settings version value (accent-text) on panel | `#6CD0EE` on `#0A1D2E` | 4.5:1 | **9.69:1** |
| Settings CLOSE text on panel | `#6CD0EE` on `#0A1D2E` | 4.5:1 | **9.69:1** |
| Settings CLOSE text on its hover fill | `#6CD0EE` on `#14405C` | 4.5:1 | **6.20:1** |
| Hotkey error text (accent-m) on panel | `#F59A82` on `#0A1D2E` | 4.5:1 | **8.00:1** |
| Hotkey input text on input fill | `#6CD0EE` on `#103A54` | 4.5:1 | **6.78:1** |
| Picker row text on hover fill | `#6CD0EE` on `#103A54` | 4.5:1 | **6.78:1** |
| Update banner text on update bar | `#6CD0EE` on `#0C2438` | 4.5:1 | **8.98:1** |
| Update button text on hover fill | `#FFFFFF` on `#14405C` | 4.5:1 | **10.95:1** |
| Drop-hint text (text-dim) on grid ground | `#B8D4E4` on `#061420` | 4.5:1 | **12.03:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#B04830` | 3:1 | **5.50:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#B04830` | 3:1 | **5.50:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#2A9FC8` on `#0E2A40` | 3:1 | **4.84:1** |
| Focus ring on grid ground (non-text) | `#2A9FC8` on `#061420` | 3:1 | **6.11:1** |
| Hover border on grid ground (non-text) | `#4CC4B8` on `#061420` | 3:1 | **8.77:1** |
| Hover border on hover fill (non-text) | `#4CC4B8` on `#103A54` | 3:1 | **5.64:1** |
| Theme-picker selected row text (accent-text) on active fill | `#6CD0EE` on `#14405C` | 4.5:1 | **6.20:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#6CD0EE` on `#103A54` | 4.5:1 | **6.78:1** |
| Skin search input text (accent-text) on panel | `#6CD0EE` on `#0A1D2E` | 4.5:1 | **9.69:1** |
| Apps-picker search input text (accent-text) on search fill | `#6CD0EE` on `#103A54` | 4.5:1 | **6.78:1** |
| Rename input text (accent-text) on input fill | `#6CD0EE` on `#103A54` | 4.5:1 | **6.78:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#B8D4E4` on `#103A54` | 4.5:1 | **7.73:1** |
| Skin search placeholder (text-dim, themed) on panel | `#B8D4E4` on `#0A1D2E` | 4.5:1 | **11.05:1** |
| Apps-picker placeholder (text-dim) on search fill | `#B8D4E4` on `#103A54` | 4.5:1 | **7.73:1** |
| Hotkey recording text (accent-m) on input fill | `#F59A82` on `#103A54` | 4.5:1 | **5.60:1** |
| Update dismiss glyph (text-dim) on update bar | `#B8D4E4` on `#0C2438` | 4.5:1 | **10.25:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#B8D4E4` on `#0A1D2E` | 3:1 | **11.05:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#2A9FC8` on `#0A1D2E` | 3:1 | **5.61:1** |
| Tile border on grid ground (non-text) | `#3C86AE` on `#061420` | 3:1 | **4.62:1** |

**Lowest ratio in this theme: 4.80:1 (Header version on header).** Lowest text ratio: 4.80:1 (Header version on header). Lowest non-text ratio: 4.62:1 (Tile border on grid ground (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | Lightest stop | Darkest stop |
|---|---|---|
| Header | `#1E5A80` | `#0A2238` |
| Tile at rest | `#0E2A40` | `#07182A` |
| Tile hover, focus and pressed | `#103A54` | `#0A2438` |
| Banner | `#1E5A80` | `#0A2238` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.2) saturate(0.95)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#0E2A40` | Hover `#103A54` | Pressed `#103A54` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6F98C5` | 4.90:1 | 3.97:1 | 3.97:1 | pass |
| Calculator `#6b6f76` | `#81858D` | 3.98:1 | 3.23:1 | 3.23:1 | pass |
| Paint `#b07a4f` | `#D09362` | 5.64:1 | 4.58:1 | 4.58:1 | pass |
| Terminal `#3d4450` | `#4A525F` | 1.87:1 | 1.52:1 | 1.52:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#62A5A6` | 5.23:1 | 4.25:1 | 4.25:1 | pass |
| Files `#c09a3e` | `#E4B950` | 7.97:1 | 6.47:1 | 6.47:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.23:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a. (The audit asked for a 0.90 alpha window here; see 0.10 and flag 1.)

Notes: Aqua `#2A9FC8` is `--accent-c` (6.11:1); `--accent-text` is `#6CD0EE` (10.54:1); teal `#4CC4B8` is the hover and the update bar. Gold `#E8C05A` appears in the art only (the node and its ring) and in the title dot (`#F2D488`). The edit bar uses a sunset coral `#F0866C` (the theme has no red). `--bg` and every surface are opaque: the translucent window the audit mentions is the one departure (0.10, flag 1).

### 6.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | 'Segoe UI', Arial, sans-serif |
| `#title` | Segoe UI 350, 12 px, tracking 4 px, uppercase from the markup, `line-height: 1.2` |
| `.tile-label` | Segoe UI 350, 12 px, 0.4 px, user case; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | Segoe UI 350, 12 px, 0.4 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 142.72** (gate 156; 13.3 px under, 25.3 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 47.9, CALCULATOR 55.5, PAINT 27.4, TERMINAL 46.5, BROWSER 43.8, FILES 24.1 px, no ellipsis. Tile height 95.39 px (94.7 to 95.4 required). Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; the old `overflow: hidden` clip cuts 36 px in the same band (positive control). **Platform fonts the mock used:** title Segoe UI Semilight x12; labels Segoe UI Semilight x7; banner Segoe UI Semilight x28; version and settings Segoe UI x7. Expected `fontsRendered` for the web faces: none (stock only).

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Segoe UI 350 covers it (checked).

### 6.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #1E5A80 0, #0A2238 100%); border-bottom-color: #2A9FC8; box-shadow: inset 0 -2px 0 #2A9FC8; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #4CC4B8; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a six-node sphere-grid network (aqua, teal and one gold node in a gold ring, joined by thin lines) with two small satellite nodes. Painted pixels at x 173.0 to 249.0, y 10.1 to 30.0. Hidden while the chip shows. The title ends at x 142.7, the scene starts at x 168: 25.3 px clear.

**B. Frame (the kit of 0.3).** a thin aqua line with a node every 12 px (aqua and teal alternating) and a short branch every 24 px down both sides; the top course is a line with two nodes and two branches per 24 px; each corner is a rounded line corner with a teal node. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner is the deep-water gradient (`#1E5A80` to `#0A2238`) with a 1 px aqua top border; its top course is a thin wave with two teal dots every 24 px; the icon is a **water drop** (an aqua gradient drop with a highlight over two ripple ellipses); the right end is a **larger sphere-grid network** (seven nodes, one gold node in a gold ring) over two ripple ellipses. The motif's painted pixels are at x 330.8 to 411.3, y 266.9 to 299.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 183.8 px (0.8). The banner row of the probe reads 3 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: a rectangle with 12 px rounded corners. Tiles: the window: a vertical gradient (`#0E2A40` to `#07182A`), a 1 px aqua border `#3C86AE`, a 1 px lit top edge, 12 px radius; plates are rounded **20 px** (31 percent of the 64 px plate, above the app's own 21 percent, so the cut stays visible; review F1). The first build used 28 px (44 percent, a near circle: a full circle, 32 px, clears every mock glyph by only 4.77 px, the smallest margin of any shape in the batch; 28 px clears by 6.37 px) and the review found it too tight for real icons: it cropped the lower-left foot of the **F** and the lower-right leg of the **K** on the foobar2000 file icon and shaved the base ends of QuickLaunch's own laptop icon. Plate margins (computed against the mock glyph geometry at 28 px, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut, and a smaller radius can only widen it): Notepad 9.81, Calculator 7.92, Paint 11.12, Terminal 6.37, Browser 11.63, Files 7.37 (smallest 6.37); nothing is cropped. **Real icons, measured in the running app (share of the plate lost to the cut, drop shadow off), 28 px then 20 px:** GlideX 15.1 then 7.0 percent, FB2K 4.1 then 1.1, QuickLaunch's icon 4.0 then 0.9, Bitdefender app icon 13.0 then 4.9, Bitdefender trackers 16.0 then 7.9, Virtual Pet 0.9 then 0, Vortex 0.3 then 0. At 20 px the F and K are whole, the laptop is whole bar a sliver at its two base corners, and both Bitdefender marks and the G of GlideX are whole.

**Trademark note.** The FFX logo, the Yevon insignia, the Spiran script and the sphere grid's actual node art are not drawn. The network is circles and lines; the drop is a generic water drop.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B04830; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the game's emblem in the art zone */
#header { background: linear-gradient(180deg, #1E5A80 0, #0A2238 100%); border-bottom-color: #2A9FC8; box-shadow: inset 0 -2px 0 #2A9FC8; }
#header::before { background: #4CC4B8; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 350; font-style: normal; line-height: 1.2; font-size: 12px; letter-spacing: 4px; color: #F0F4F8; text-shadow: none; }
#title .accent { color: #F2D488; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNER@ left 1px top 0 / 8px 8px no-repeat,
    @CORNER@ right 5px top 0 / 8px 8px no-repeat,
    @CORNER@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNER@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 24px repeat-y,
    @SIDE@ right 5px top 0 / 8px 24px repeat-y,
    @TOP@ left 0 top 0 / 24px 9px repeat-x;
}

/* tiles: the menu window (a vertical gradient, a 1 px light border, a 1 px lit top edge) */
.app-tile { background: linear-gradient(180deg, #0E2A40 0, #07182A 100%); border-color: #3C86AE; border-radius: 12px; box-shadow: inset 0 1px 0 #3C86AE; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: linear-gradient(180deg, #103A54 0, #0A2438 100%); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: linear-gradient(180deg, #103A54 0, #0A2438 100%); }
.tile-label { font-family: 'Segoe UI', Arial, sans-serif; overflow: clip; overflow-clip-margin: 3px; }

/* banner: surface, a top course, the game's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, linear-gradient(180deg, #1E5A80 0, #0A2238 100%);
  border-top-color: #3C86AE;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 350; letter-spacing: 0.4px; color: #F0F4F8; margin-right: 90px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CORNER@` | `corner` |
| `@SIDE@` | `side` |
| `@TOP@` | `top` |
| `@MOTIF@` | `motif` |
| `@BTOP@` | `btop` |
| `@ICON@` | `icon` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#...)` in the SVGs that carry a `<radialGradient>` or `<linearGradient>`, which `enc()` turns into `%23`):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<path d='M8 10 L22 4.6 L36 13.6 L50 5.6 L64 14 L78 8.4 M22 4.6 L26 17 M64 14 L58 18.6' stroke='rgb(42,159,200)' stroke-width='1' fill='none' stroke-linejoin='round'/>
<circle cx='8' cy='10' r='2.6' fill='rgb(130,216,244)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='7.22' cy='9.22' r='0.83' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='22' cy='4.6' r='2.8' fill='rgb(76,196,184)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='21.16' cy='3.76' r='0.90' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='36' cy='13.6' r='3' fill='rgb(130,216,244)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='35.10' cy='12.70' r='0.96' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='50' cy='5.6' r='5' fill='none' stroke='rgb(232,192,90)' stroke-width='0.9'/><circle cx='50' cy='5.6' r='3.2' fill='rgb(232,192,90)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='49.04' cy='4.64' r='1.02' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='64' cy='14' r='3' fill='rgb(130,216,244)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='63.10' cy='13.10' r='0.96' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='78' cy='8.4' r='2.6' fill='rgb(76,196,184)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='77.22' cy='7.62' r='0.83' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='26' cy='17' r='1.8' fill='rgb(42,159,200)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='25.46' cy='16.46' r='0.58' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='58' cy='18.6' r='1.8' fill='rgb(42,159,200)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='57.46' cy='18.06' r='0.58' fill='rgb(240,248,252)' fill-opacity='0.85'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='4' width='24' height='1' fill='rgb(42,159,200)'/><rect x='5.2' y='1.6' width='1' height='2.8' fill='rgb(42,159,200)'/><rect x='17.2' y='5.6' width='1' height='2.8' fill='rgb(42,159,200)'/><circle cx='5.7' cy='3.4' r='1.9' fill='rgb(130,216,244)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='5.13' cy='2.83' r='0.61' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='17.7' cy='6.6' r='1.9' fill='rgb(76,196,184)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='17.13' cy='6.03' r='0.61' fill='rgb(240,248,252)' fill-opacity='0.85'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='3.5' y='0' width='1' height='24' fill='rgb(42,159,200)'/><rect x='4.5' y='11.6' width='2.6' height='0.9' fill='rgb(42,159,200)'/><circle cx='4' cy='6' r='1.9' fill='rgb(130,216,244)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='3.43' cy='5.43' r='0.61' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='4' cy='18' r='1.9' fill='rgb(76,196,184)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='3.43' cy='17.43' r='0.61' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='7' cy='12' r='0.9' fill='rgb(130,216,244)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<path d='M0.5 7.5 V4.4 A3.8 3.8 0 0 1 4.3 0.5 H7.5' fill='none' stroke='rgb(42,159,200)' stroke-width='1'/><circle cx='4.2' cy='4.2' r='1.9' fill='rgb(76,196,184)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='3.63' cy='3.63' r='0.61' fill='rgb(240,248,252)' fill-opacity='0.85'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<path d='M0 3.6 C3 1.2 9 1.2 12 3.6 S21 6 24 3.6' fill='none' stroke='rgb(130,216,244)' stroke-width='0.9'/><circle cx='6' cy='1.6' r='0.9' fill='rgb(76,196,184)'/><circle cx='18' cy='5.4' r='0.9' fill='rgb(76,196,184)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<path d='M6 24 L20 12 L36 20 L50 8 L66 16 L80 10 M20 12 L24 4 M36 20 L34 30 M66 16 L70 28' stroke='rgb(42,159,200)' stroke-width='1' fill='none' stroke-linejoin='round'/>
<circle cx='6' cy='24' r='2.8' fill='rgb(76,196,184)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='5.16' cy='23.16' r='0.90' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='20' cy='12' r='3' fill='rgb(130,216,244)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='19.10' cy='11.10' r='0.96' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='36' cy='20' r='3.4' fill='rgb(130,216,244)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='34.98' cy='18.98' r='1.09' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='50' cy='8' r='6.6' fill='none' stroke='rgb(232,192,90)' stroke-width='1'/><circle cx='50' cy='8' r='3.8' fill='rgb(232,192,90)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='48.86' cy='6.86' r='1.22' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='66' cy='16' r='3.2' fill='rgb(130,216,244)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='65.04' cy='15.04' r='1.02' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='80' cy='10' r='2.8' fill='rgb(76,196,184)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='79.16' cy='9.16' r='0.90' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='24' cy='4' r='1.8' fill='rgb(42,159,200)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='23.46' cy='3.46' r='0.58' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='34' cy='30' r='1.8' fill='rgb(42,159,200)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='33.46' cy='29.46' r='0.58' fill='rgb(240,248,252)' fill-opacity='0.85'/><circle cx='70' cy='28' r='1.8' fill='rgb(42,159,200)' stroke='rgb(8,30,50)' stroke-width='0.7'/><circle cx='69.46' cy='27.46' r='0.58' fill='rgb(240,248,252)' fill-opacity='0.85'/>
<ellipse cx='50' cy='30' rx='13' ry='2.6' fill='none' stroke='rgb(130,216,244)' stroke-width='0.8'/><ellipse cx='50' cy='30' rx='7' ry='1.4' fill='none' stroke='rgb(130,216,244)' stroke-width='0.8'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<defs><linearGradient id='d' x1='0.2' y1='0' x2='0.8' y2='1'><stop offset='0' stop-color='rgb(150,226,250)'/><stop offset='1' stop-color='rgb(30,120,172)'/></linearGradient></defs>
<ellipse cx='11' cy='18.4' rx='9' ry='2.4' fill='none' stroke='rgb(130,216,244)' stroke-width='1' stroke-opacity='0.9'/><ellipse cx='11' cy='18.4' rx='4.6' ry='1.2' fill='none' stroke='rgb(130,216,244)' stroke-width='0.9'/>
<path d='M11 1.2 C11 1.2 4.4 8.4 4.4 12.6 C4.4 16.4 7.2 18.6 11 18.6 C14.8 18.6 17.6 16.4 17.6 12.6 C17.6 8.4 11 1.2 11 1.2 Z' fill='url(#d)' stroke='rgb(8,30,50)' stroke-width='1' stroke-linejoin='round'/>
<path d='M8 11.6 C7.4 13.6 8 15.4 9.6 16' fill='none' stroke='rgb(236,252,255)' stroke-width='1.4' stroke-linecap='round'/>
</svg>
```

### 6.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | ff10-title (2) | removed |
| 2 | banner-pulse (1) | removed |
| 3 | ff10-sphere (1) | removed |
| 4 | ff10-readout (2) | removed |
| 5 | ff10-border (5) | removed |
| 6 | ff10-pyreflies `#particles` (4) | removed |
| hover | one-shot `tile-radial .55s` (not infinite) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite ff10.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 6.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `linear-gradient(180deg, #0E2A40, #07182A)`, border `#3C86AE` (1 px), radius 12px, `box-shadow: inset 0 1px 0 #3C86AE` (the lit edge), `::before` off; layout unchanged. Icons: `brightness(1.2) saturate(0.95)` through the shaped plate (D in 3).
- **Hover:** `linear-gradient(180deg, #103A54, #0A2438)`, border `#4CC4B8` (5.64:1 on the hover fill), `box-shadow: inset 0 1px 0 #8AE4DA`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (4.84:1 on the tile, 6.11:1 on the grid ground). **Pressed:** base scale 0.96 on the same gradient as hover.
- **Label:** `#F0F4F8`, Segoe UI 350, 12 px, 0.4 px, user case.
- **Filter chip:** base rule (fill `#103A54`, `--accent-c` border, `#6CD0EE` text). The header scene hides while it shows.
- **Edit bar:** `#2A1A1A` fill, `#C0583E` rule, label `#F0866C`; `+ FILE` and `+ INSTALLED` in `--text` with a `#4A8AAE` border, `DONE` in `#F0866C` with a `#C0583E` border. The tile remove button is `#B04830` with a `#F0866C` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#061420`, panel `#0A1D2E`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#6CD0EE` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#6CD0EE` text on `#0C2438` with a `#4CC4B8` rule.

### 6.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite ff10.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#2A9FC8`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **142.72**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#1E5A80` to `#0A2238` gradient with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 2 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a water drop at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#4CC4B8` border, the hover gradient, the shaped plate (rounded 20 px) with no cropped glyph on the mock icons **and on real icons**: with the FB2K file icon (`C:\Program Files\foobar2000\icons\generic.ico`) and QuickLaunch's own `icon.png` on a plate, the F and K are whole and the laptop is whole bar a sliver at its base corners (6x), GlideX keeps its G whole, and the plate is still visibly shaped (20 px is 31 percent of the plate, above the app's own 21); no ellipsis on CALCULATOR (mock 55.5 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): aqua for the header line, the lines, the ring and the values; teal for the hover, the nodes and the update bar; gold only for one node, its ring and the title dot; coral only in edit mode and the remove button.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 8 px, banner 3 px; at 640 x 420 10 / 8 / 12.37 px; at 1024 x 700 10 / 8 / 12.37 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Segoe UI Semilight` (the face name Chromium reports for Segoe UI at weight 350); a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 4** (title and banner text covered). What survives: dark-water gradient windows with aqua node-and-line rails on every edge, a network of nodes in the header and the banner, a gold node, rounded plates, a drop with ripples. What is missing for a 5: the translucent glass of the real menu (opaque by rule), the Yevon marks and the Spiran script (marks, not drawn).

Watch items for this theme: (1) The rails' nodes make this the busiest frame of the batch (a node every 12 px); at 1x they read as beads, not as noise. (2) The drop with ripples reads as water first and FFX second; the header network is what says "sphere grid".

---

## 7. ff15 (FINAL FANTASY XV): DONE

**Audit:** score 3, tone down. Desaturated blue-grey and Segoe UI was close to the road-trip minimal look, but a painted highway strip ran under BROWSER, a party and bond readout crossed the right column and a crown emblem sat behind the tiles. Campfire warmth and the gold crest (the identity) were barely present; the accent was a cool `#5068A0`. Six infinite animations.
**Direction:** a road trip in thin lines. Charcoal and road grey with 1 px pale outlines on tiles and frame, campfire orange as the only colour (the line accent, the ring, the hover border, a road-marking dash on the rails), a warm glow in the banner behind the campfire icon (the one gradient with warmth) and Jost Light with wide tracking. The header carries a campsite (pines, a tent, a flame, stars), the banner a road running to a sunset horizon, the icon is the campfire. Chamfered-bottom plates stay. No crown, no wings. Static.

### 7.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0F1114;
  --panel-bg: #171A1E;
  --overlay-bg: #0F1114;
  --header-bg: #262B33;
  --font: Jost, 'Segoe UI', Arial, sans-serif;
  --text: #DDE1E6;
  --text-dim: #B3BAC2;
  --accent-c: #E8843C;
  --accent-m: #F0A070;
  --accent-y: #E8843C;
  --accent-text: #F0A060;
  --border: #4A5058;
  --border-h: #E8843C;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #E8843C;
  --title-anim: none;
  --tile-hover-bg: #262B33;
  --tile-hover-border: #E8843C;
  --tile-hover-shadow: none;
  --tile-active-bg: #262B33;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.8) brightness(1.05);
  --tile-icon-shape: polygon(0 0, 100% 0, 100% 80%, 80% 100%, 20% 100%, 0 80%);
  --tile-label-spacing: 1px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 350;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #343A44;
  --btn-active-bg: #454C58;
  --drop-hint-border: #4A5058;
  --drop-icon-color: #7A828C;
  --hint-sub-color: #B3BAC2;
  --rename-dashed: #E8843C;
  --rename-input-bg: #262B33;
  --edit-bar-bg: #2A1A12;
  --edit-bar-border: #C06A30;
  --edit-label-color: #F0A070;
  --edit-label-glow: none;
  --btn-done-color: #F0A070;
  --btn-done-border: #C06A30;
  --btn-done-hover-bg: #44261A;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A828C;
  --update-bg: #14222A;
  --update-border: #2C6E8F;
  --update-color: #F0A060;
  --update-btn-border: #4A9EC4;
  --update-btn-hover-bg: #1F3744;
  --update-btn-hover-glow: none;
  --btn-close-color: #F0A060;
  --btn-close-border: #E8843C;
  --btn-close-hover-bg: #262B33;
  --btn-close-hover-glow: none;
  --picker-search-bg: #262B33;
  --picker-item-hover-bg: #262B33;
  --picker-item-active-bg: #303640;
  --picker-placeholder-bg: #262B33;
  --skin-btn-active-bg: #303640;
  --remove-btn-bg: #B4502A;
  --remove-btn-border: #F0A070;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#DDE1E6` on `#0F1114` | 4.5:1 | **14.40:1** |
| `--text-dim` on `--bg` | `#B3BAC2` on `#0F1114` | 4.5:1 | **9.65:1** |
| `--accent-c` on `--bg` | `#E8843C` on `#0F1114` | 3:1 | **7.02:1** |
| `--accent-text` on `--bg` | `#F0A060` on `#0F1114` | 3:1 | **8.92:1** |
| `--hint-sub-color` on `--bg` | `#B3BAC2` on `#0F1114` | 4.5:1 | **9.65:1** |
| `--btn-close-color` on `--panel-bg` | `#F0A060` on `#171A1E` | 4.5:1 | **8.23:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the lightest stop**, except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#DDE1E6` on `#1B1F25` | 4.5:1 | **12.60:1** |
| Tile label on tile hover | `#DDE1E6` on `#262B33` | 4.5:1 | **10.83:1** |
| Tile label on tile pressed (pressed state) | `#DDE1E6` on `#262B33` | 4.5:1 | **10.83:1** |
| Title on header | `#EEF0F2` on `#262B33` | 4.5:1 | **12.46:1** |
| Title dot (`.accent`) on header | `#E8843C` on `#262B33` | 4.5:1 | **5.28:1** |
| Header version on header | `#B3BAC2` on `#262B33` | 4.5:1 | **7.26:1** |
| Header button glyph on header | `#DDE1E6` on `#262B33` | 4.5:1 | **10.83:1** |
| Header button glyph on button hover | `#FFFFFF` on `#343A44` | 4.5:1 | **11.45:1** |
| Filter chip text on chip | `#F0A060` on `#262B33` | 4.5:1 | **6.71:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#262B33` | 4.5:1 | **14.23:1** |
| Banner text on banner | `#DDE1E6` on `#3C2312` | 4.5:1 | **11.09:1** |
| Header line on header (non-text) | `#BFC5CC` on `#14171B` | 3:1 | **10.34:1** |
| Edit label on edit bar | `#F0A070` on `#2A1A12` | 4.5:1 | **7.94:1** |
| Done / close button text on edit bar | `#F0A070` on `#2A1A12` | 4.5:1 | **7.94:1** |
| + FILE / + INSTALLED text on edit bar | `#DDE1E6` on `#2A1A12` | 4.5:1 | **12.74:1** |
| Done button text on its hover fill | `#F0A070` on `#44261A` | 4.5:1 | **6.48:1** |
| Settings text on overlay | `#DDE1E6` on `#0F1114` | 4.5:1 | **14.40:1** |
| Settings text on panel | `#DDE1E6` on `#171A1E` | 4.5:1 | **13.29:1** |
| Settings label (text-dim) on panel | `#B3BAC2` on `#171A1E` | 4.5:1 | **8.91:1** |
| Settings value / cheat key (accent-text) on panel | `#F0A060` on `#171A1E` | 4.5:1 | **8.23:1** |
| Settings version value (accent-text) on panel | `#F0A060` on `#171A1E` | 4.5:1 | **8.23:1** |
| Settings CLOSE text on panel | `#F0A060` on `#171A1E` | 4.5:1 | **8.23:1** |
| Settings CLOSE text on its hover fill | `#F0A060` on `#262B33` | 4.5:1 | **6.71:1** |
| Hotkey error text (accent-m) on panel | `#F0A070` on `#171A1E` | 4.5:1 | **8.29:1** |
| Hotkey input text on input fill | `#F0A060` on `#262B33` | 4.5:1 | **6.71:1** |
| Picker row text on hover fill | `#F0A060` on `#262B33` | 4.5:1 | **6.71:1** |
| Update banner text on update bar | `#F0A060` on `#14222A` | 4.5:1 | **7.66:1** |
| Update button text on hover fill | `#FFFFFF` on `#1F3744` | 4.5:1 | **12.44:1** |
| Drop-hint text (text-dim) on grid ground | `#B3BAC2` on `#0F1114` | 4.5:1 | **9.65:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#B4502A` | 3:1 | **5.10:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#B4502A` | 3:1 | **5.10:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#E8843C` on `#1B1F25` | 3:1 | **6.14:1** |
| Focus ring on grid ground (non-text) | `#E8843C` on `#0F1114` | 3:1 | **7.02:1** |
| Hover border on grid ground (non-text) | `#E8843C` on `#0F1114` | 3:1 | **7.02:1** |
| Hover border on hover fill (non-text) | `#E8843C` on `#262B33` | 3:1 | **5.28:1** |
| Theme-picker selected row text (accent-text) on active fill | `#F0A060` on `#303640` | 4.5:1 | **5.73:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#F0A060` on `#262B33` | 4.5:1 | **6.71:1** |
| Skin search input text (accent-text) on panel | `#F0A060` on `#171A1E` | 4.5:1 | **8.23:1** |
| Apps-picker search input text (accent-text) on search fill | `#F0A060` on `#262B33` | 4.5:1 | **6.71:1** |
| Rename input text (accent-text) on input fill | `#F0A060` on `#262B33` | 4.5:1 | **6.71:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#B3BAC2` on `#262B33` | 4.5:1 | **7.26:1** |
| Skin search placeholder (text-dim, themed) on panel | `#B3BAC2` on `#171A1E` | 4.5:1 | **8.91:1** |
| Apps-picker placeholder (text-dim) on search fill | `#B3BAC2` on `#262B33` | 4.5:1 | **7.26:1** |
| Hotkey recording text (accent-m) on input fill | `#F0A070` on `#262B33` | 4.5:1 | **6.75:1** |
| Update dismiss glyph (text-dim) on update bar | `#B3BAC2` on `#14222A` | 4.5:1 | **8.30:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#B3BAC2` on `#171A1E` | 3:1 | **8.91:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#E8843C` on `#171A1E` | 3:1 | **6.48:1** |
| Tile border on grid ground (non-text) | `#BFC5CC` on `#0F1114` | 3:1 | **10.87:1** |

**Lowest ratio in this theme: 5.28:1 (Title dot (`.accent`) on header).** Lowest text ratio: 5.28:1 (Title dot (`.accent`) on header). Lowest non-text ratio: 5.10:1 (Remove glyph on remove button (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | Lightest stop | Darkest stop |
|---|---|---|
| Header | `#262B33` | `#14171B` |
| Tile at rest | `#1B1F25` | `#14171B` |
| Tile hover, focus and pressed | `#262B33` | `#1B1F25` |
| Banner | `#3C2312` (warm glow, radial) | `#121418` |

**Icon plates through `--tile-icon-fx`** (`saturate(0.8) brightness(1.05)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#1B1F25` | Hover `#262B33` | Pressed `#262B33` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6684A5` | 4.26:1 | 3.67:1 | 3.67:1 | pass |
| Calculator `#6b6f76` | `#71747A` | 3.53:1 | 3.04:1 | 3.04:1 | pass |
| Paint `#b07a4f` | `#AF825E` | 4.87:1 | 4.19:1 | 4.19:1 | pass |
| Terminal `#3d4450` | `#414751` | 1.77:1 | 1.52:1 | 1.52:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#5D8E8F` | 4.52:1 | 3.88:1 | 3.88:1 | pass |
| Files `#c09a3e` | `#C2A255` | 6.77:1 | 5.82:1 | 5.82:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.04:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Campfire orange `#E8843C` is `--accent-c` (7.02:1); `--accent-text` is `#F0A060` (8.92:1). The warm gradient the audit asked for "bottom-left" lives in the banner only: a tone layer under the tile field would be flagged by the overlap probe as art in the keep-out, and the banner is where the flame icon sits. `--bg` is `#0F1114`; the tile outline `#BFC5CC` is 10.87:1 on the ground, brighter than every other theme's border (the audit asks for thin white outlines).

### 7.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | Jost, 'Segoe UI', Arial, sans-serif |
| `#title` | **Jost 300**, 12 px, tracking 4 px, uppercase from the markup, `font-synthesis: none` |
| `.tile-label` | **Jost 350**, 11 px with `line-height: 14.4px`, 1 px, uppercase; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | **Jost 300**, 12 px, 1 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 143.30** (gate 156; 12.7 px under, 24.7 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 54.4, CALCULATOR 74.1, PAINT 33.3, TERMINAL 56.9, BROWSER 55.9, FILES 29.7 px, no ellipsis. Tile height 95.41 px (94.7 to 95.4 required; 0.01 px over is the sub-pixel rounding of a 14.4 px line box, accepted). Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; the old `overflow: hidden` clip cuts 0 px in the same band (this theme's test strings have no descender tails: uppercase; the lever stays for Cyrillic tails). **Platform fonts the mock used:** title Jost (web) x12; labels Jost (web) x7; banner Jost (web) x28; version and settings Jost (web) x7. Expected `fontsRendered` for the web faces: Jost.

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Jost covers it (checked).

### 7.3 Art (tone down with a new frame). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #262B33 0, #14171B 100%); border-bottom-color: #BFC5CC; box-shadow: none; }`: a 1 px line (the header's own border, y 39 to 40; nothing below). `#header::before { background: #E8843C; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a campsite on a hairline: five pine outlines, a tent outline, a small orange flame and five stars. Painted pixels at x 170.0 to 250.0, y 12.3 to 28.0. Hidden while the chip shows. The title ends at x 143.3, the scene starts at x 168: 24.7 px clear.

**B. Frame (the kit of 0.3).** a dashed road marking down both sides (a pale 8 px dash and a short dim dash every 24 px); the top course is a hairline with an orange 4 px square every 24 px; each corner is a thin pale L with an orange dot. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 6 from a first-column focus ring (3 empty pixels), 6 from a last-column ring (6 at 640 x 420 and 6 at 1024 x 700).

**C. Banner.** the banner is a charcoal gradient with a warm glow low on the left (`radial-gradient` from `#3C2312` to `#23211F` to `#121418`) and a 1 px grey top border; its top course is a hairline with an orange 4 px tab every 24 px; the icon is a **campfire** (an orange flame with a pale inner flame over two crossed logs); the right end is a **road to the horizon**: a mountain line, a horizon hairline, an orange half sun on the horizon, two converging road edges and a dashed centre line. The motif's painted pixels are at x 329.9 to 412.0, y 268.5 to 299.6 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 94.8 px (0.8). The banner row of the probe reads 3 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: a plain rectangle (`--app-clip: none`). Tiles: a thin-outline slot: a vertical gradient (`#1B1F25` to `#14171B`), a 1 px pale outline `#BFC5CC`, square corners, no lit edge; hover turns the border campfire orange; plates have chamfered bottom corners (20 percent). Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 12.13, Calculator 10.13, Paint 11.13, Terminal 9.16, Browser 11.63, Files 10.22 (smallest 9.16); nothing is cropped.

**Trademark note.** The FFXV logo, the royal crest and wings, the crown, the Regalia and every character are not drawn. The campsite, the road and the flame are generic.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B4502A; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 1 px line inside it, the game's emblem in the art zone */
#header { background: linear-gradient(180deg, #262B33 0, #14171B 100%); border-bottom-color: #BFC5CC; box-shadow: none; }
#header::before { background: #E8843C; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-weight: 300; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 12px; letter-spacing: 4px; color: #EEF0F2; text-shadow: none; }
#title .accent { color: #E8843C; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNER@ left 1px top 0 / 8px 8px no-repeat,
    @CORNER@ right 5px top 0 / 8px 8px no-repeat,
    @CORNER@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNER@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 24px repeat-y,
    @SIDE@ right 5px top 0 / 8px 24px repeat-y,
    @TOP@ left 0 top 0 / 24px 9px repeat-x;
}

/* tiles: the menu window (a vertical gradient, a 1 px light border, a 1 px lit top edge) */
.app-tile { background: linear-gradient(180deg, #1B1F25 0, #14171B 100%); border-color: #BFC5CC; border-radius: 0px; box-shadow: none; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: linear-gradient(180deg, #262B33 0, #1B1F25 100%); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: linear-gradient(180deg, #262B33 0, #1B1F25 100%); }
.tile-label { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-size: 11px; line-height: 14.4px; font-synthesis: none; overflow: clip; overflow-clip-margin: 3px; }

/* banner: surface, a top course, the game's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, radial-gradient(ellipse 170px 100px at 22px 100%, #3C2312 0, #23211F 70%, #121418 100%);
  border-top-color: #4A5058;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 300; font-style: normal; font-synthesis: none; letter-spacing: 1px; color: #DDE1E6; margin-right: 90px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CORNER@` | `corner` |
| `@SIDE@` | `side` |
| `@TOP@` | `top` |
| `@MOTIF@` | `motif` |
| `@BTOP@` | `btop` |
| `@ICON@` | `icon` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#...)` in the SVGs that carry a `<radialGradient>` or `<linearGradient>`, which `enc()` turns into `%23`):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<path d='M2 17.4 H82' stroke='rgb(191,197,204)' stroke-width='0.8'/>
<path d='M10 6.399999999999999 L13.5 17.4 L6.5 17.4 Z' fill='none' stroke='rgb(110,118,130)' stroke-width='0.8' stroke-linejoin='round'/><path d='M17 3.3999999999999986 L21 17.4 L13 17.4 Z' fill='none' stroke='rgb(110,118,130)' stroke-width='0.8' stroke-linejoin='round'/><path d='M24 8.399999999999999 L27 17.4 L21 17.4 Z' fill='none' stroke='rgb(110,118,130)' stroke-width='0.8' stroke-linejoin='round'/><path d='M70 5.399999999999999 L73.5 17.4 L66.5 17.4 Z' fill='none' stroke='rgb(110,118,130)' stroke-width='0.8' stroke-linejoin='round'/><path d='M77 8.399999999999999 L80 17.4 L74 17.4 Z' fill='none' stroke='rgb(110,118,130)' stroke-width='0.8' stroke-linejoin='round'/>
<path d='M34 17.4 L42 5.6 L50 17.4 Z' fill='none' stroke='rgb(191,197,204)' stroke-width='1' stroke-linejoin='round'/><path d='M42 5.6 L42 17.4 M42 17.4 L38.4 17.4' stroke='rgb(110,118,130)' stroke-width='0.8'/><path d='M42 9 L46 17.4' stroke='rgb(110,118,130)' stroke-width='0.7'/>
<path d='M58 17.4 C56.6 14.8 57.8 12.6 58.8 10.4 C59.4 12 61.4 13.4 60.4 17.4 Z' fill='rgb(232,132,60)' stroke='rgb(160,76,30)' stroke-width='0.4' stroke-linejoin='round'/>
<circle cx='14' cy='4' r='0.7' fill='rgb(191,197,204)'/><circle cx='30' cy='7' r='0.6' fill='rgb(110,118,130)'/><circle cx='52' cy='3.4' r='0.7' fill='rgb(191,197,204)'/><circle cx='66' cy='6' r='0.6' fill='rgb(110,118,130)'/><circle cx='78' cy='3' r='0.7' fill='rgb(191,197,204)'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='4' width='24' height='0.9' fill='rgb(110,118,130)'/><rect x='10' y='2.4' width='4' height='4.2' fill='rgb(232,132,60)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='3.5' y='4' width='1.1' height='8' fill='rgb(191,197,204)'/><rect x='3.5' y='16' width='1.1' height='2' fill='rgb(110,118,130)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<path d='M0.5 7.6 V0.5 H7.6' fill='none' stroke='rgb(191,197,204)' stroke-width='0.9'/><circle cx='4.2' cy='4.2' r='1' fill='rgb(232,132,60)'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='0.2' width='24' height='0.8' fill='rgb(110,118,130)'/><rect x='10' y='0.2' width='4' height='2.6' fill='rgb(232,132,60)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<path d='M2 12 L18 6 L28 10 L40 3 L52 10 L58 12 M74 12 L78 9 L82 12' fill='none' stroke='rgb(110,118,130)' stroke-width='0.8' stroke-linejoin='round'/>
<path d='M2 12.4 H82' stroke='rgb(191,197,204)' stroke-width='0.8'/>
<path d='M63 12.4 A5.2 5.2 0 0 1 73.4 12.4 Z' fill='rgb(232,132,60)'/><path d='M60 12.4 H77' stroke='rgb(191,197,204)' stroke-width='0.8'/>
<path d='M8 33 L62 12.4 M84 33 L64.4 12.4' stroke='rgb(191,197,204)' stroke-width='1' stroke-linecap='round'/>
<path d='M46 33 L63.2 12.4' stroke='rgb(110,118,130)' stroke-width='0.9' stroke-dasharray='3.4 2.8'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<rect x='2.6' y='16.6' width='16.8' height='3.2' rx='1.6' fill='rgb(122,84,58)' stroke='rgb(70,44,30)' stroke-width='0.7' transform='rotate(-10 11 18.2)'/><rect x='2.6' y='16.6' width='16.8' height='3.2' rx='1.6' fill='rgb(122,84,58)' stroke='rgb(70,44,30)' stroke-width='0.7' transform='rotate(10 11 18.2)'/>
<path d='M11 1.4 C12.6 5.6 17.4 8 17.4 13 C17.4 16.4 14.6 18.2 11 18.2 C7.4 18.2 4.6 16.4 4.6 13 C4.6 10.4 6.2 9 7.4 7.4 C7.8 9.2 8.8 10 9.6 10.2 C9.2 6.6 10 3.8 11 1.4 Z' fill='rgb(232,132,60)' stroke='rgb(160,76,30)' stroke-width='0.8' stroke-linejoin='round'/>
<path d='M11 8.6 C12.2 11 14.2 12 14.2 14.6 C14.2 16.4 12.8 17.2 11 17.2 C9.2 17.2 7.8 16.4 7.8 14.6 C7.8 13 9.4 11.8 11 8.6 Z' fill='rgb(255,196,120)'/>
</svg>
```

### 7.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | ff15-title (2) | removed |
| 2 | banner-pulse (1) | removed |
| 3 | ff15-regalia (1) | removed |
| 4 | ff15-readout (2) | removed |
| 5 | ff15-border (5) | removed |
| 6 | ff15-sparks `#particles` (4) | removed |
| hover | one-shot `tile-radial .55s` (not infinite) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite ff15.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 7.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `linear-gradient(180deg, #1B1F25, #14171B)`, border `#BFC5CC` (1 px), radius 0px, no lit edge, `::before` off; layout unchanged. Icons: `saturate(0.8) brightness(1.05)` through the shaped plate (D in 3).
- **Hover:** `linear-gradient(180deg, #262B33, #1B1F25)`, border `#E8843C` (5.28:1 on the hover fill), no shadow, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (6.14:1 on the tile, 7.02:1 on the grid ground). **Pressed:** base scale 0.96 on the same gradient as hover.
- **Label:** `#DDE1E6`, **Jost 350**, 11 px with `line-height: 14.4px`, 1 px, uppercase.
- **Filter chip:** base rule (fill `#262B33`, `--accent-c` border, `#F0A060` text). The header scene hides while it shows.
- **Edit bar:** `#2A1A12` fill, `#C06A30` rule, label `#F0A070`; `+ FILE` and `+ INSTALLED` in `--text` with a `#7A828C` border, `DONE` in `#F0A070` with a `#C06A30` border. The tile remove button is `#B4502A` with a `#F0A070` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#0F1114`, panel `#171A1E`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#F0A060` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#F0A060` text on `#14222A` with a `#2C6E8F` rule.

### 7.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite ff15.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 1 px line (`#BFC5CC`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **143.30**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 6 and 6 px).
4. Banner: the warm-glow gradient with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 2 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a campfire at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#E8843C` border, the hover gradient, the shaped plate with no cropped glyph, no ellipsis on CALCULATOR (mock 74.1 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): orange only in the header bar, the ring, the hover border, the rail dashes, the sun, the flame and the values; pale grey for outlines and lines; teal only in the update bar; coral-orange for edit mode; nothing blue, green or purple.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 8 px, banner 3 px; at 640 x 420 10 / 9 / 13.15 px; at 1024 x 700 10 / 9 / 13.15 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Jost` (web) and `Segoe UI` for the version line; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 3** (title and banner text covered). What survives: a charcoal window with thin pale outlines on every tile and dashed road lines on both sides, orange dashes on the top rail, a campsite in the header and a road to a sunset in the banner. What is missing for a 5: the gold crest and the Regalia (marks, not drawn); the road-trip read carries the game, the type is quiet, so a fan needs the campsite and the road together.

Watch items for this theme: (1) The orange dashes on the top course read as road markings or as a perforated line; either is intended. (2) The outlines are the brightest tile borders of the batch and slightly harsh next to the warm banner; lever: `--tile-edge` `#8A9099`.

---

## 8. Fonts that would still lift this batch (for Sergei's decision; nothing downloaded, nothing used)

Rule: this batch uses two of the approved seven (Jost and Cinzel) and stock Windows fonts. Each font below is free-licensed; licence and Cyrillic coverage are from Makoto's font licence check (`Team/Research/QuickLaunch_ThemeReferences_2026-09-29.md`, repeated in F B7 and audit section 8). Each needs a new OK from Sergei with file name, source and size, and the OFL text must ship with it. Ranked by how much the batch gains:

| Rank | Font | Licence | Cyrillic | Theme it lifts | What it replaces | Expected gain | Source |
|---|---|---|---|---|---|---|---|
| 1 | Marcellus | SIL OFL 1.1 | no | ff10 (title) | Segoe UI 350 caps | Medium: a flared, rounded-stroke caps face is the nearest free match to the curved Spiran-style lettering the reference sheet names. Title only | https://github.com/google/fonts/tree/main/ofl/marcellus |
| 2 | Press Start 2P (or DotGothic16) | SIL OFL 1.1 | Press Start 2P yes | ff6 (title; it also lifts doom-classic) | Georgia title | Medium for the title; **not for labels**: an 8 px grid face is 10 to 12 px per letter at the 11 px floor, so "Calculator" would be 110 px or more in a 100 px box. DotGothic16 is narrower but its licence and Cyrillic coverage are not in the audit table (check first) | https://github.com/google/fonts/tree/main/ofl/pressstart2p |
| 3 | Rajdhani | SIL OFL 1.1 | no | ff7 (labels and title; also cyberpunk, swl-dragon, the-expanse) | Bahnschrift 600 | Low to medium: Bahnschrift is already close to the PS1 menu sans; Rajdhani is squarer | https://github.com/google/fonts/tree/main/ofl/rajdhani |
| 4 | Cinzel Decorative | SIL OFL 1.1 | no | ff9 (title) | Gabriola title | Low: Gabriola already has the storybook swash; Cinzel Decorative adds a formal one. Almendra (named on Makoto's sheet) is not in the audit's licence table, so check it before asking | https://github.com/google/fonts/tree/main/ofl/cinzeldecorative |

No font is needed for ff8, ff14 or ff15 to reach their squint scores (they use the approved Jost and Cinzel). If Sergei approves only one file, take **Marcellus** (it also lifts ac-assassins in batch 3's wish list).

---

## 9. Summary

- **Seven sections written**, one per theme, each with a final `:root` block, computed contrast tables (six gate pairs, 48 add-on pairs), icon checks on rest, hover and pressed fills, type with measured widths, art as exact shapes with coordinates plus the rules block and every SVG source, a motion inventory, tile, hover, selected, filter and banner rules, a "Done when" list and an expected squint score. A batch-level section (0) holds the window kit, the shared frame kit, the batch 3 and 4 review lessons, the banner-line evidence and the departures from the audit.
- **Infinite animations: 42 to 0.** No animation of any kind is left; no `will-change`; the only motion is the base 0.12 s tile transition and the one-shot entrance fade. The CSS shrinks too: 9.9 to 14.5 KB per theme against 16.1 to 24.0 KB today.
- **Contrast:** every pair clears its threshold. Lowest text pair **4.65:1** (ff8, header version on header; needs 4.5). Lowest non-text pair **3.40:1** (ff8, hover stripe, red, on hover fill (non-text); needs 3). Lowest icon ratio **3.04:1** (ff15; needs 3). The real gate script, run on the seven prototype files with an empty baseline, reported 0 errors, and a deliberately broken copy made it report 1 (positive control). ff7 and ff14 leave the legacy list.
- **Type:** two bundled faces (Jost on ff8 and ff15, Cinzel on ff14) and seven stock faces (Georgia, Segoe UI Semibold, Bahnschrift, Constantia, Gabriola, Segoe UI 350, Segoe UI); title edges 123.2 to 146.5 px against the 156 gate (no ladder step taken), every label inside the 100 px box, every banner line inside its text box. **Constantia is used with lining figures forced**; **MS Gothic was tried and rejected** (0.7).
- **Overlaps:** none by construction and none measured: the A/B/C probe read 0 px overlap and 0 px of art in the keep-out in all 77 runs (11 states and sizes x 7 themes); the art ends 3 empty pixels before the focus ring. The probe's positive control reads 200 to 295 px when art is planted over the title.
- **Review lessons (B4R) carried:** icons judged at 1x (three audit icons changed because a ring, a ringed sphere and a winged crest do not read), the descender lever on every label (0 px of difference below the box at 1x, 1.5x and 2x), lining figures (Constantia forced; MS Gothic and Georgia rejected), port ownership proven before any socket opens (positive and negative control).
- **Banner lines:** 18 lines across the seven, each checked on the web (0.8), each at most 9 words; **none is studio-authored**. Three rest on one printed text and are marked (ff6 Setzer, ff15 Regis, and ff8 "Everything will be fine now...", which replaced "Chicken-wuss." at the review and rests on one fetched Wikiquote page); ff6 Locke's exact wording rests on quotes.net.
- **Squint (expected, title and banner text covered):** ff6 4, ff7 4, ff14 4, ff8 3, ff9 4, ff10 4, ff15 3. The seven renders side by side read as one family of four blue windows plus three neighbours (0.3).
- **Facts found on the way (not fixed, not in this batch's scope):** **`'Segoe UI Semilight'` is not a resolvable family name** in Chromium 154 here (0.7: it measures the same as a nonexistent family, so stacks that name it first render Segoe UI Regular; the Semilight face is `'Segoe UI'` at weight 350; shipped and earlier-batch themes that use the name are affected; offered, not fixed); Edge headless writes no `DevToolsActivePort`, so a debug-port ownership check for a browser has to read the OS socket table; the overlap probe needs a corner tolerance when a window clip is rounded; MS Gothic Cyrillic is full-width; `overflow: clip` keeps `text-overflow: ellipsis` working in Chromium 154 (long names still show "..." in all seven); the audit counts 35 themes that lead with Georgia (G8) and each shows the header version in old-style figures until its batch.

### The `THEME_BANNERS` entries (exactly as written; replaces the seven keys and no others)

```js
  'ff10': [
    'Listen to my story.',
    'This is my story.',
  ],
  'ff14': [
    'Hear. Feel. Think.',
    'A smile better suits a hero.',
  ],
  'ff15': [
    "I've come up with a new recipe!",
    'A king pushes onward always.',
  ],
  'ff6': [
    'I prefer the term treasure hunting!',
    'My life is a chip in your pile.',
    "I'm a god! I'm all-powerful!",
  ],
  'ff7': [
    'Not interested.',
    "Let's mosey.",
    "There ain't no gettin' offa this train we're on.",
  ],
  'ff8': [
    '...Whatever.',
    'Booyaka!',
    'Everything will be fine now...',
  ],
  'ff9': [
    "You don't need a reason to help people.",
    'To be forgotten is worse than death.',
    'How do you prove that you exist...?',
  ],
```

### Flags for Jane and Sergei (each answerable in one word)

1. **ff10 translucency.** The audit asked for the watery translucent window; every redesign since batch 3 is opaque so nothing bleeds through a bright wallpaper, and ff10 follows. Keep it opaque, or return to a 0.90-alpha window (it must then pass 4.5:1 over white)? Answer: **opaque** or **translucent**.
2. **ff6 banner icon.** The pointing glove is the family's cursor and reads at 1x as a white glove; if it reads as a mitten to Sergei, the fallback is a plain gold gear. Keep the glove, or swap to the gear? Answer: **glove** or **gear**.
3. **Hard label drop in ff6, ff7 and ff9.** A 1 px black drop (no blur) under the labels and banner text, the one trait every FF menu shares; every earlier batch used no label shadow. Keep it, or none? Answer: **keep** or **none**.
4. **ff14 keyboard ring.** The audit asks for a crystal-blue focus; it is an explicit `outline-color` override (the only theme in the batch that overrides the ring). Keep blue, or the base gold? Answer: **blue** or **gold**.
5. **ff8 banner line "Chicken-wuss."** Seifer's insult to Zell is a real, recognisable line (hyphen and all). Keep, or swap for a gentler Squall line? Answer: **keep** or **swap**.

**Rulings** (Judy; Sergei left the five flags to her: "decide yourself, what will be more beautiful"; the one-line reasons are in the review, section 10): 1 **opaque**, 2 **glove**, 3 **keep**, 4 **blue**, 5 **swap**. Flags 1 to 4 are built as written. Flag 5 changed the build (F5): the third ff8 line is "Everything will be fine now..." (0.8).

### Watch items (not fixes, not blocking)

1. **Real icons vs shaped plates.** Where a theme clips the plate, the cut clears every mock glyph (smallest margins: ff6 none (no clip), ff7 10.06, ff8 none (no clip), ff9 5.57, ff10 6.37, ff14 none (no clip), ff15 9.16 px), but a real app icon whose art reaches a corner loses a small triangle there. Tried on seven real icons in the review: ff7, ff9 and ff15 lose background corners only (every mark whole; accepted), and ff10 went from 28 px to 20 px because its near circle cropped marks (F1). If Sergei notices on ff7, ff9 or ff15, note that `inset(0 round 13px)` is below the app's own 21 percent and would show nothing; the lever is a radius between that and the current cut. ff6, ff8 and ff14 keep the app's own plate and cannot lose anything.
2. **ff6 glove** (flag 2) and **ff7 orb**: the two icons most likely to read as something else at 22 px (a mitten, a bulb); each sits beside a clearer motif (the airship, the Midgar skyline).
3. **ff9 valance** is the loudest piece of the kit (red scallops along the whole top edge); lever in its watch item.
4. **ff15 tile outlines** are the brightest borders of the batch (10.87:1 on the ground); lever `--tile-edge` `#8A9099`.
5. **ff10 rails** carry a node every 12 px, the busiest frame art of the batch; at 1x they read as beads.
6. **ff8 hover stripes** are decorative cues, not state (the border and the fill change too).
7. **Constantia lining figures** need `font-variant-numeric: lining-nums` on `html, body` to hold in Electron 32 (ff9).
8. **Not seen by me:** Electron renders (mock only), the skin-picker list open, the empty-library drop hint, the updater error bar, edit-mode remove buttons on the shaped plates beyond the mock's own plates, real application icons.

---

## 10. Open items (things I could not resolve or verify here)

Nothing was launched in QuickLaunch. Each item has a verify step above; none blocks implementation.

1. **Mock window, not Electron.** All measurements come from headless Edge 154 with the Foundation's CSS applied to the real `base.css` and `index.html`. Chromium 154 is not Electron 32: sub-pixel text and filter rounding can differ. Ender's numbers win; the after-run reports them. After the fonts are packaged, the title-edge ladder (F B2 rule 5) is binding over my measured edges.
2. **Fonts measured from the working tree.** I loaded Jost and Cinzel read-only to get real widths; if Ender renames or re-exports them, re-measure.
3. **Stock fonts on Sergei's other machines.** Georgia, Constantia, Segoe UI (including its Semilight face at weight 350) and Segoe UI Semibold ship with every supported Windows; Gabriola and Bahnschrift ship with the Windows 10 and 11 install (Bahnschrift from version 1709). On an older install the stacks fall to Georgia, Palatino Linotype or Segoe UI and the figures may change (Constantia falls to Palatino Linotype, which has lining figures).
4. **Banner widths** were measured in the mock with the real fonts; the fit check (F A3) is the net if Electron differs by a few pixels (every line ends at least 63 px before the text box edge).
5. **Single-printed-text banner lines** (Summary): ff6 Setzer and Locke's exact wording, ff15 Regis; the fetch tool returns extracts, not raw pages.
6. **`THEME_BANNERS` comment in `app.js`** ("3 per theme") was stale (B1 12.8 watch item 1, B3 F6, B4 F2). Ender reworded it to "(2 to 6 per theme)" at the batch-5 review (F2); measured true across all 101 keys at that time (4 themes have 2 lines, 15 have 3, 6 have 4, 74 have 5, 2 have 6). This batch's entries are ff6 3, ff7 3, ff8 3, ff9 3, ff10 2, ff14 2 and ff15 2 lines. Only the seven keys named in 0.8 change.
7. **Tall windows:** the side strips repeat down the container and the top course repeats along it; the art is anchored to the frame, never scaled. Looks right at 1024 x 700 in the mock.
8. **The `.app-tile` radius and its `overflow: hidden`** clip the edit-mode remove button at the rounded corners: ff9 (16 px top radius) and ff10 (12 px) clip it more than the 6 px of ff6; the button sits at `top:-2px; right:-2px` and the base already clips it at the tile edge. In the mock's edit-mode shot of ff9 (`verify/ff9/edit-3x.png`) the cross is whole but the red circle is cut by the arch at the top right of every tile; legible, and the one place to look first.
9. **The real icons on the shaped plates** were tried in the batch-5 review and re-check: seven real icons viewed on ff7, ff9, ff10 and ff15 (two more, BlueStacks and Android Studio, by number only). The test set is nine distinct icons, so a square-cornered icon beyond them can still lose a corner on ff7, ff9 and ff15 (accepted; background corners only on every icon tried).
10. **Leftover browsers.** My first mock driver killed only the launcher stub, not the headless Edge that owned the port, so about 120 headless browsers from batch 4 and batch 5 runs piled up and stalled one run. I killed those trees by PID (profiles under `scratchpad\judy\b4` and `...\b5` only; never by image name) and the driver now kills the owning tree on close and removes stale profiles. **29 more headless Edge trees from `scratchpad\mock\ud_*` (an older mock driver, not this task) are still running; I did not touch them.** Jane or Sergei may want them closed.

