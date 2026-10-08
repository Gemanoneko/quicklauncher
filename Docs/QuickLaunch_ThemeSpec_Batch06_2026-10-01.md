# QuickLaunch theme spec, batch 6 (Judy, 2026-10-01)

Status: complete. Batch-level section (0), six theme sections (1 to 6), fonts that would still lift the batch (8), summary and flag rulings (9), open items (10). **Updated after the build and review (F3, 2026-10-01) to match the approved build**: the three adopted fonts (Libre Franklin, Black Ops One, Oxanium), the Empire label and body-face fixes, Sith's 4 px tracking; see the update note below. Uncommitted, as instructed.

Themes: star-wars-republic, star-wars-separatist, star-wars-empire, star-wars-rebel, star-wars-sith, star-wars-mando (audit section 7, batch 6, "Star Wars": 4 redraw, 2 tone down; the section order is the audit's, worst first).
For: Ender. Branch `wip/theme-fidelity`, written against HEAD `7574901` (batch 5 and the batch-4 flag addendum committed) and the post-Foundation base (Foundation Parts A and B: `scrollbar-gutter: stable` on `#grid-container`, the `#header::after` thresholds, the scrolling overlays, the banner fit check, the bundled fonts). The audit's batch note asks for "a frame kit (header strip, banner strip, corner ticks) that differs in material: Empire flat and rectangular, Rebel stencil and khaki, Republic ivory and brass, Separatist droid tan, Sith angular edge-light, Mando riveted steel and rust"; section 0.3 is that kit and each theme section is one faction inside it.
Franchise calls (no new era decisions needed): the six themes are the six factions the audit names, drawn from the films and shows as the reference sheet describes them. `star-wars-republic` is the prequel-era **Galactic Republic**, not the Old Republic of the KOTOR games (the theme is renamed, 0.10 and flag 5).

**Sergei delegated the beauty calls** ("decide what's more beautiful"). Every open choice in this batch is therefore **ruled** in section 9 with a one-line reason; none is left as a question. The only things still pending Sergei are font downloads, and nothing in this spec needs one: section 8 lists three optional faces with file name, source, size and licence, and nothing was downloaded.

Provenance: a first run of this spec died before it wrote a file. Its prototype work (palettes, art generators, the mock driver, the generated theme files) was found in the previous session's scratchpad and **extended**, not trusted: this session copied it into its own scratchpad, rebuilt the mock from the unchanged base (`base.css` and `index.html` are byte-identical to that run's copy), changed three things in it (one banner line, 0.8; the Republic pressed state and the worst-stop tables, 9 facts found 1; one generator slip that wrote an `undefined` fill value into four lit windows of the Republic skyline SVG, harmless in Chromium, which falls back to the parent fill, but wrong in a spec), and **re-ran every measurement below** (the Republic file twice, after each change). Nothing here is carried over unmeasured.

**Update after the build (F3, 2026-10-01).** Sergei approved the three fonts of section 8 (Libre Franklin, Black Ops One, Oxanium) on 2026-10-01; Ender built the batch; my review (`QuickLaunch_ThemeReview_Batch06_2026-10-01.md`) accepted the font deviations and asked for two Empire fixes (F1, the label rule; F2, the body face), which Ender applied and I re-checked. This text now describes the **approved build**: the Empire `:root` and rules (`--font`, `--tile-label-spacing`, `.tile-label` and three font stacks), the Rebel title (Black Ops One, weight 400), the Sith title (Oxanium 700, tracking 4 px), their type tables and measured figures (Ender's Electron 32 numbers, reproduced in the review, replace my mock figures for these three themes) and section 7's hashes. Republic, Separatist and Mando did not change. **Check:** the six theme files rebuilt from this text (the `:root` block, the rules block, the seven SVG sources and the placeholder encoding of B1 0.2) are byte-identical to the working tree minus each file's leading comment; section 10 items 1 and 12 give the result. Where the mock figures of 0.4 and the Electron figures differ, the Electron figures win.

Inputs read: the audit (`QuickLaunch_ThemeAudit_2026-09-30.md`: section 1 shared constraints C1 to C5 and H1 to H8, the section 6.1 entries, the batch 6 row and note, the font table), the Foundation spec (Parts A and B, the fonts map), batch 5 (the format; sections 0 and 1 to 7 as the model), its review (`QuickLaunch_ThemeReview_Batch05_2026-10-01.md`, lessons applied up front in 0.2) and batches 3 and 4 and their reviews by reference, Makoto's reference sheet (the Star Wars entries), the six current theme files (legacy motion only), `base.css` and `index.html` (repo working tree), `scripts/check-theme-contrast.js`, `THEME_BANNERS` and the theme-name table in `app.js` for the six keys, and the bundled font folder (`src/renderer/fonts/`). Every banner line was checked on the web (0.8). **QuickLaunch was not launched.** Only this file was written in the repo tree; scratch files, prototypes and renders live in the session scratchpad.

**Shared constraints are not restated.** Every section inherits audit section 1 (C1 to C5, H1 to H8), batch 1 sections 0 and 12, batch 2 sections 0 and 11 to 12, batch 3 section 0, batch 4 section 0, batch 5 section 0 and the Foundation Parts A and B by reference (0.1 lists them). Where a rule is the same I point to it.

## At a glance

| # | Theme | Direction | Infinite animations, before to after | Lowest ratio (text / non-text / icon) | Type | Squint (expected) |
|---|---|---|---|---|---|---|
| 1 | republic | **The one light window.** Ivory ground, crimson header under a brass line, brass and bronze trim, Coruscant-blue banner: deco pilasters with crimson diamonds, a stepped ziggurat between curved rings in the header, the Senate rotunda in a dusk skyline in the banner, arch-top plates, rounded 10 px window | 6 to **0** | 5.30 / 3.49 / 3.24 | `Cinzel` 600 title and `Jost` labels and banner (both bundled) | 3 |
| 2 | separatist | Droid-tan plate header over a dark steel field: honeycomb strip in the header, trapezoid plate course and perforated seams, tan-topped steel tiles with two cut corners, a squad of droid busts and a cell cluster in the banner, CIS blue on hover | 6 to **0** | 4.79 / 3.28 / 3.23 | `Jost` 500 title, 400 labels (bundled) | 4 |
| 3 | empire | Flat bridge console: near-black ground, gunmetal panelling and slots, three readout bars with one red segment in the header, a wedge capital ship and a battle station in the banner, square window, red only as an alert light | 7 to **0** | 5.56 / 3.13 / 3.04 | `Libre Franklin` 500 title, labels and body, 400 banner (bundled) | 3 |
| 4 | rebel | Khaki and olive field kit: olive header under a hologram-blue line, webbing rails with rivets and hazard stripes, stencil blocks and a targeting reticle, an orange fighter locked in a reticle and a pilot helmet in the banner, orange as ring, hover and paint | 6 to **0** | 4.61 / 3.89 / 3.43 | `Black Ops One` title (bundled), Trebuchet MS 400 labels and 700 banner | 4 |
| 5 | sith | Obsidian with a crimson edge-light: jagged cut corners, black-glass slots with red blade lines, three inverted talons in the header, an open holocron and a saber in the banner; crimson is a line and a light, never a fill | 7 to **0** | 5.56 / 3.69 / 3.85 | `Oxanium` 700 title (bundled), Bahnschrift 600 SemiCondensed caps labels | 4 |
| 6 | mando | Riveted steel and rust: warm dark steel plates with bolted corners, a rust-painted pauldron in the header, twin suns over dunes and a bounty puck in the banner, forge orange on hover only, one dented corner | 6 to **0** | 5.28 / 3.69 / 3.60 | `Dela Gothic One` title (bundled), Segoe UI Semibold labels and banner | 3 |
| | **Batch** | | **38 to 0** | **text 4.61 (rebel, title dot (`.accent`) on header); non-text 3.13 (empire, tile border on grid ground (non-text)); icons 3.04 (empire)** | | |

"Lowest ratio" is the minimum over every pair in that theme's tables (gate pairs, add-on pairs and the generic accent-on-fill roles); text pairs need 4.5, non-text pairs 3. Every pair in every theme clears its threshold. For gradient surfaces every table row uses the **worst stop** of the surface (the lightest for light text, the darkest for the dark text on Separatist's tan header). The real gate script, run on the six prototype files in a temp skeleton with an **empty baseline** (so every theme is treated as new and none gets a legacy pass), reported **6 checked, 0 errors, 0 legacy warnings**. A deliberately broken copy (one `--text-dim` set to `#4A3A3A`) made the same script report the error (1.68:1 on the Separatist file), so the run can fail. None of the six was on the legacy list. The legacy count is the `infinite` occurrences in the six current files (Sith's seventh is its hover flicker).

Art call (audit section 7 said 4 redraw, 2 tone down): republic, separatist, rebel and mando are **redraw**; empire and sith are the audit's **tone down** (palette and type direction kept, the painted panno and readouts go) **with a new frame kit**, as batch 5 did for ff9 and ff15. The result is six new frames, not six tints.

---

## 0. Batch-level section (applies to all six)

### 0.1 What is inherited (pointers; not restated)

B1 = `WIP/QuickLaunch/Docs/QuickLaunch_ThemeSpec_Batch01_2026-09-30.md`, B2 = `..._Batch02_...`, B3 = `..._Batch03_...`, B4 = `..._Batch04_2026-10-01.md`, B5 = `..._Batch05_2026-10-01.md`, B3R, B4R and B5R = `QuickLaunch_ThemeReview_Batch03_2026-09-30.md`, `..._Batch04_2026-10-01.md` and `..._Batch05_2026-10-01.md`, F = `QuickLaunch_ThemeSpec_Foundation_2026-09-30.md`.

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
| Contrast method (gate pairs, add-on pairs, generic accent-on-fill roles, icons through the fx filter on rest, hover and pressed grounds; `brightness()` never below 1.0 on a **dark** theme (Republic, the light one, darkens on purpose, 0.3); the gate reads the **first** `--name:` match, so the gate variables are opaque hex and never appear in comments above `:root`) | B1 0.5, 0.1.8, 0.1.9, 0.1.11 |
| Texture measure (hidden-tiles shot, mean per-tile luminance sigma; the recorded ceiling is promise-mascot's 3.72) | B1 0.6; B2 12.1 |
| Infinite-animation counting and the tier key | B1 0.7; `create-theme.md` (CPU-efficient animations) |
| Verification set (grid, hover on CALCULATOR, settings, hidden-tiles, 640 x 420, 1024 x 700, focus ring, filter chip, edit mode, update banner, skin picker, scrolled one row) | B1 0.8 |
| The A/B/C overlap probe: A hides art and content, B shows art only, C shows content only; art = diff(B,A), content = diff(C,A); overlap must be 0 px and art inside the keep-out 0 px, at 424 x 300, 640 x 420, 1024 x 700 and in the chip, edit-bar, update-bar and focus-ring states. **For a gradient banner the art-off override keeps the banner's surface** (0.4) | B1 12.3; B2 0.4, 12.1; B3 0.1; B4 0.4; B5 0.4 |
| Squint test: cover the title and banner text; a fan must still name the franchise. Colour-discipline checks in each "Done when" apply to the chrome and exclude the six tile icons (the apps' own art) | B1 12.2; B2 11.2 |
| Bundled fonts: the family strings, `font-display: block`, only declared weights, `font-synthesis: none`, display faces on `#title` only, the title width ladder (edge at most 156), the label gate, banner fit, `line-height: 1.2` on display titles, wait for `document.fonts.ready`, the Cyrillic fallback stacks | F B1, B2, B5 |
| Base-layout fixes this batch relies on: scrolling Settings and cheat-sheet, banner fit check, `scrollbar-gutter: stable` | F A1, A3, A4 |
| Real-icon check on every shaped plate, and the 20 px ceiling on a plate cut | B5R F1; B5 0.2 |

### 0.2 Facts from earlier batches that this spec relies on, and the batch 3, 4 and 5 review lessons applied up front

1. **Post-Foundation geometry and the 8 px bands.** The tile field is x 16 to W-20 at every size and the focus ring reaches x 12 and W-16. Bands are 8 px wide (left x 1 to 9, right x W-13 to W-5, top window y 40 to 49) so the clearance to the ring is 3 px by construction (B4 0.2.1). Measured on the mock with the distance transform: the nearest frame art is 4 px (all six themes) from the nearest ring pixel at 424 x 300 and 4 px (all six themes) at 640 x 420 and 1024 x 700 (0.4).
2. **`:has()` works** in the shipped Electron (`^32`, Chromium 128); the chip-hides-art rule is proven.
3. **`font-stretch` reaches Bahnschrift only as the SemiCondensed face** (B2 0.2.3). Sith uses `font-stretch: 87.5%` for the labels and the banner and says so (it is kept on the Oxanium title, where it does nothing, so that the Bahnschrift fallback is the SemiCondensed face); Empire's Bahnschrift is only the fallback behind Libre Franklin.
4. **Texture ceiling: 3.72** (promise-mascot, measured). No theme in this batch has any texture; every hidden-tiles sigma is 0.00.
5. **Icon numbers to beat.** The lowest non-Terminal plate ratio over rest, hover and pressed in this batch is 3.04 (empire).
6. **The bundled fonts exist in the working tree** (`src/renderer/fonts/`): Jost (Republic, Separatist), Cinzel (Republic title) and Dela Gothic One (Mando title), and, added at the build with Sergei's approval of 2026-10-01 (section 8), Libre Franklin (Empire), Black Ops One (Rebel title) and Oxanium (Sith title). I loaded the first three read-only into the mock to measure real widths; the last three were measured in Ender's Electron run and reproduced in the review.
7. **The banner fit check (F A3) is the net, not the plan.** Every line below fits by design, with the longest line ending at least 45 px before the text box edge (x 320) and at least 55 px before the motif's first painted pixel (0.8).
8. **The real gate has six checks.** `scripts/check-theme-contrast.js` also checks `--btn-close-color` on `--panel-bg`. The gate tables below list six gate pairs, not five.

**Lessons applied before they could recur:**

| Lesson | What this batch does |
|---|---|
| Icons must read correctly at a glance (B4R F4; B5R section 4) | Every 22 px icon was drawn, then rendered at the **true 1x raster** and magnified with nearest-neighbour scaling, and judged by what it reads as **first**. Six icons, one dominant shape each: a **battle station** (grey sphere, equatorial trench, dish; Empire), a **pilot helmet** (orange shell, black visor; Rebel), the **Senate rotunda** (brass dome, drum, columns; Republic), a **honeycomb cluster** of three cells (Separatist), a **saber** (red blade, metal hilt; Sith) and a **bounty puck** (a thick beskar disc seen at an angle; Mando). Three first drafts failed that test and were redrawn before this spec: the Republic banner icon (five stepped towers on a base) read as a crown, the Separatist droid head (a bare oval with two dots) read as a tribal mask, and the Mando puck (a round dial with three ticks) read as a knob and then, with an etched glyph, as a terminal prompt. The six final icons are in `batch6/out/icons1x_sheet.png` (scratchpad): each reads as named at 1x; the residual risks (Separatist cells as nuts and bolts, Mando puck as a speaker, Republic rotunda as a government building in general) are in the watch items with a lever each. |
| Italic and descender clipping (B4R F1) | **Every theme in this batch sets `.tile-label { overflow: clip; overflow-clip-margin: 3px; }`** (the proven lever). Measured at 1x, 1.5x and 2x with "gypsy Yy jq", "Typing", "jumpy quaff" and "Qq Gg Jj": the 8 px band under the label box differs by **0 px** from an unclipped reference in all six themes. **Positive control:** a one-line label height of 6 px cuts 150 to 243 px in the same band (so the sweep can fail). Sith's labels are uppercase and the English strings show almost no tails (its control read only 2 px), so Sith was re-swept with Cyrillic tails ("Щука Цирк", "Цирк Щи", "Цц Щщ Джем", "QJ jq Gg"): **built 0 px, positive control 72 px**; Empire and Mando were swept with the same strings (built 0 px, control 72 and 189 px). The lever stays on every theme for Cyrillic tails such as Щ and Ц. |
| Digit styles that read wrong (doom-classic F1; B4 0.7) | No numeral is drawn in any SVG. Figures are real text and every face used here draws lining figures: Bahnschrift, Jost, Libre Franklin, Cinzel (title, caps), Trebuchet MS, Segoe UI and Segoe UI Semibold, and Dela Gothic One, Black Ops One and Oxanium (titles only: Latin text with no figures). Libre Franklin's figures are lining (seen at 6x in the review). Checked on "v1.94.3", "7-Zip 23.01" and "Visual Studio 2022" at 6x. Trebuchet MS was rendered with its default figures and they are lining (Georgia and Constantia are the old-style faces, and neither is used). |
| Port ownership before driving a debug port (B3R, B4R) | **QuickLaunch was not launched**, and no port is opened by hand. Every mock browser is started through `scripts/qa/headless-browser.mjs` (`launchHeadless`): a lease, a kill-on-close job object, and the lease's **own `DevToolsActivePort`**, which my driver reads and matches against the port the launcher returned before it opens a socket (it stops on a mismatch). Every launch ends in `close()`; 0 leases and 0 marked browsers remain (section 10 item 9). |
| A cross that reads as a plus (ac-templars F2) | No cross of any kind is drawn in the batch. The Rebel reticle has four ticks and a ring (a targeting reticle, not a cross) and the Sith holocron has cut lines, not a cross. |
| Art within 3 px of a focus ring (B1 12.1; B3 watch 3) | Bands 8 px wide, so **3 empty pixels** between the art and the ring zone (the distance transform reads 4 px in all six themes at the three sizes, and 3.33 css px at Sergei's 1.5x). |
| The brightest surface of a theme pulls the eye (ac-templars banner; B4 Imperium parchment) | Two themes have a bright surface and both are **ruled**, not drifted into: Republic is light on purpose (its whole window, flag 1) and Separatist has a tan plate header (flag 2). Every other banner and field is dark. |
| The version line in another face than the title (ac-templars F4) | Each theme sets `--font` and the version inherits it, so the version matches the body face. Republic (Cinzel title, Jost version) and Mando (Dela Gothic One title, Segoe UI version) are deliberate: the display face is for the title only. |
| Placeholder text is below 4.5:1 (B3R section 5; a base default of `#757575`) | Every theme adds `.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }` and the tables list the three placeholder pairs. |
| Contrast pairs must use the real cascade | `#btn-done-edit` and `#btn-close-settings` set their own `color` by id, which beats `button:hover { color:#fff }`; their hover text therefore stays `--btn-done-color` and `--btn-close-color`, not white. The `.update-btn`, header buttons and `+ FILE` hover text is white **on the five dark themes**; on Republic and on Separatist's tan header those rules are rewritten and the tables use the rewritten colours. |
| A plate cut shows only past the mock plate's own rounding (B1 12.1 item 3: 21 percent) and may not crop a real mark (B5R F1: 20 px ceiling) | Where a theme names a plate shape it is a silhouette that starts at 22 percent or more (arch 20 percent top, two 24 percent cuts, one 26 percent cut) and **every shape was tried on the six real icons** (GlideX, the foobar2000 file icon, QuickLaunch's own `icon.png`, BlueStacks and its logo, Android Studio): the share of the plate lost to the cut is 0 to 5.0 percent (Republic 3.4, Separatist 5.0, Sith 3.0, Mando 3.0, worst case GlideX) and **every mark is whole** (corners of a full-bleed background only; section 10 item 6). Empire and Rebel keep the app's own rounded plate and cannot lose anything. |
| Generated text exposed to screen readers (swl-dragon F3) | No `content` string in the batch except `''`. |
| A spec text that disagrees with its table (doom-classic F7) | The `:root` blocks, the rules blocks, the SVG sources and every contrast table here were **generated from one data file**, and the six prototype CSS files were built from the same text and gated and rendered (0.4). |
| A first-capture artifact reads as a defect (B4R 8.2) | Every measurement in 0.4 ran after `document.fonts.ready` and a one-shot entrance fade; the first capture of a launch is never the one reported. |

### 0.3 The family kit, the frame kit that holds it, and the two themes that break the dark-ground rule

**The frame kit is unchanged from B5 0.3** (itself B4 0.3): the same zones, the same layer order, the same sizes (header line, header art HZ 84 x 20, top course 9 px, 8 px side bands with 8 x 8 corner caps, banner top course up to 7 px, banner motif 84 x 34 at `right 12px bottom 0` with `margin-right: 90px` on the banner text, banner icon 22 x 22, window clip, tile plate). All numbers are at 424 x 300 and hold at any size (the zones are anchored to the window edges, never scaled). The container's background is the same stack of four corner caps over two side strips over a top course:

```css
#grid-container {
  background:
    CORNER left 1px top 0 / 8px 8px no-repeat,
    CORNER right 5px top 0 / 8px 8px no-repeat,
    CORNER left 1px bottom 0 / 8px 8px no-repeat,
    CORNER right 5px bottom 0 / 8px 8px no-repeat,
    SIDE left 1px top 0 / 8px 24px repeat-y,
    SIDE right 5px top 0 / 8px 24px repeat-y,
    TOP left 0 top 0 / 24px 9px repeat-x;
}
```

**The family kit (new in this batch).** The audit's batch note asks for one shared kit with a different **material** per faction. What the six share: the zones above; a header strip with a 3 px line inside the header and a scene in HZ; a banner with a motif at the right end and a 22 px icon at the left; a top course and two 8 px side strips whose repeat unit is 24 px; four 8 x 8 corner caps; a window clip shape that is the faction's own (a plain rectangle, two cuts, eight points, one dent, a rounded curve); a tile plate that echoes the window clip; and a text colour that is warm or neutral, never pure white. What each one is made of:

| | Republic | Separatist | Empire | Rebel | Sith | Mando |
|---|---|---|---|---|---|---|
| Ground | ivory `#EFE7D6` | dark steel `#14171B` | near-black `#0B0C0E` | khaki-black `#1A1712` | obsidian `#0A0708` | brown-black `#17130F` |
| Header | crimson `#9A2220` to `#7C1816` | tan plate `#C69A5B` to `#B58A4D` | flat `#171A1E` | olive `#3A4529` to `#2E3721` | `#150E10` to `#0F090B` | `#34312C` to `#25221E` |
| Header line | brass 3 px | dark ink 3 px | gunmetal 3 px | hologram blue 3 px | crimson 3 px | beskar 3 px |
| Frame material | deco pilasters, brass crown of ziggurats | plate seams, hexagon perforations, trapezoid plates | recessed panels, slots, indicators | webbing, stitches, hazard band | black glass, red blade lines, slashes | riveted plate, weld bead, rust patches |
| Header art | stepped ziggurat between curved rings | honeycomb strip | three readout bars, one red segment | stencil blocks and a reticle | three inverted talons | a pauldron on a rail |
| Banner icon and motif | rotunda; Coruscant dusk | three cells; droid squad and cells | battle station; wedge capital ship | pilot helmet; fighter in a reticle | saber; open holocron | bounty puck; twin suns over dunes |
| Window | rounded 10 px | two cuts (TL, BR) 12 px | square | square | eight points 14 and 8 px | one dent (BR) 14 px |
| Tile and plate | ivory card, arch plate | steel card, tan top edge, two-cut plate | flat card, app plate | canvas card, app plate | glass card, one-cut plate | steel card, one-dent plate |
| Accent | blue ring, crimson hover | tan; CIS blue hover | white-grey; red alert only | orange | crimson line and light | rust; forge hover |
| Type | Cinzel title, Jost | Jost | Libre Franklin | Black Ops One title, Trebuchet MS | Oxanium title, Bahnschrift SemiCondensed | Dela Gothic One title, Segoe UI Semibold |

**Two themes break the dark-ground assumption, and the base rules that assume one are overridden on purpose.** `base.css` writes white text on a pale fill for `button:hover`, `.btn-remove:hover`, `.update-btn:hover` and `#filter-chip-clear:hover`, and a white-on-dark arrow for the skin search. **Republic** (a light window) rewrites all of them in its rules block (`button:hover { color: var(--text); }` and the rest, 1.4 and 1.5) and gives the skin search a dark arrow; its icon filter darkens (`brightness(0.8)`) so the mock plates keep 3:1 against the pale tile, and it adds `.tile-icon, .app-tile:hover .tile-icon { filter: var(--tile-icon-fx); }` so the base drop shadow does not paint grey into the empty corners of an arch plate on a light tile. **Separatist** has only a light **header** (a tan plate): its title, version, header buttons and chip are redrawn for a tan ground in a rule block (2.3), with the dark ink contrasted against the **darkest** tan stop. The persona-4 yellow header, 2001 and promise-mascot (all in B1, where the base rules that assume a dark ground were first rewritten) are the precedents.

**The luminance budget, computed.** A dark theme's tile ground must be dark enough that the dullest mock plate (Calculator, `#6B6F76`) keeps 3:1 after the fx filter; the allowance below is the highest ground luminance that still passes, and the lightest tile stop must sit under it. The light Republic inverts the problem: the plate must be **darker** than the pale tile, which is why its filter darkens.

| Theme | `--tile-icon-fx` | Ground allowed for plates (luminance) | Lightest tile stop (rest / hover) | Lightest header stop | Header text ratio (title / dim version) |
|---|---|---|---|---|---|
| republic | `brightness(0.8) saturate(1.05)` | inverted: the plate must be darker than the tile (the icon table in 1.1 gives the ratios) | 0.974 / 0.887 | 0.081 (crimson; ivory text on its lightest stop) | 9.57 / 8.08 |
| separatist | `brightness(1.2) saturate(0.9)` | 0.045 (Calculator binds) | 0.016 / 0.027 | 0.359 | 5.40 / 5.04 |
| empire | `brightness(1.08) saturate(0.9)` | 0.029 (Calculator binds) | 0.008 / 0.016 | 0.010 | 13.81 / 8.34 |
| rebel | `brightness(1.2) saturate(0.88)` | 0.045 (Calculator binds) | 0.017 / 0.030 | 0.053 | 10.05 / 7.33 |
| sith | `brightness(1.1) saturate(0.88)` | 0.031 (Calculator binds) | 0.005 / 0.008 | 0.005 | 15.56 / 7.96 |
| mando | `brightness(1.2) saturate(0.85)` | 0.044 (Calculator binds) | 0.013 / 0.022 | 0.031 | 11.86 / 7.48 |

(For Separatist the header-text pair is dark ink on the **darkest** tan stop, the worst case for dark text; its row in 2.1 uses that stop.)

**What differs between the six and why a fan sees six factions** (the squint sheet, `batch6/out/squint_sheet.png` in the scratchpad, title, labels and banner text hidden and the window blurred 1.4 px): Republic is the only bright one and the only blue banner; Separatist is the only tan header; Empire is the only flat grey; Rebel is the only olive; Sith is the only one with red lines on black; Mando is the only warm brown with rivets. Each has its own window outline (rectangle, rectangle, two cuts, eight points, one dent, a curve), so even the outlines differ.

### 0.4 How this spec was verified (I could render, without launching QuickLaunch)

I built the **post-Foundation mock window**: the repo's `base.css`, `index.html` and the bundled fonts, the gallery's mock tiles (`scripts/theme-gallery/mock-data.cjs`), one candidate theme file per run, driven in headless Edge over the DevTools protocol at 424 x 300, 640 x 420 and 1024 x 700 (and at 1.5x for the overlap probe and the type checks; not QuickLaunch, not Electron). **Every browser was started through `scripts/qa/headless-browser.mjs` and nothing else**, on a lease profile under the headless root, with the port-ownership check of 0.2; no synthetic input event was sent (hover and focus use `CSS.forcePseudoState`). The candidate files were **built from the text of this spec** (a generator writes the CSS and the tables from the same data). On that mock I measured, for all six:

- **Gate:** the real `check-theme-contrast.js`, run on the six files in a temp skeleton with an empty baseline: **6 checked, 0 errors, 0 legacy warnings**. **Positive control:** with `--text-dim` set to `#4A3A3A` in the Separatist file the same run reports the error (1.68:1); restored, none.
- **Title edges, label widths, banner lines:** real fonts, real tracking. Every standard label fits the 100 px box with no ellipsis; every banner line fits on one line (`scrollWidth <= clientWidth`) at 424 and 640, and at 1x, 1.5x and 2x. A tile with a very long name ("Проводник Windows", 106 to 112 px) ellipsizes in every theme, as in B4 and B5 (offer b of B4R, a base property); "Visual Studio 2022" (94 to 98 px), "Notepad++ x64", "7-Zip 23.01", "Калькулятор" and "Жёсткий диск" all fit.
- **A/B/C overlap probe** at the three sizes, in the chip, edit-bar, update-bar and edit-plus-update states, and with a focus ring on the first and last column (the ring is forced with a class that applies the theme's own focus rule). **Art-off override** (the same for all six): `#header::after, #header::before, #theme-banner::before { visibility:hidden }`, `#grid-container { background:none }`, `#theme-banner { background: <the theme's own banner surface> }` (so a gradient banner is **not** counted as art), content-off hides the title, version, buttons, chip, grid, banner text, edit bar and update bar. **Result: overlap 0 px and art in the keep-out 0 px in all 66 runs (11 states and sizes x 6 themes).** **Positive control:** a magenta block planted over the title in the art layer reads 221 to 403 px of overlap (it can fail). **Corner tolerance (B5 0.4):** inside the four corner squares (the clip radius plus 2 px) only differences above 60 levels count, everywhere else the threshold stays 10. **At Sergei's 1.5x** (emulated scale, same method, device pixels, keep-out scaled; 6 states x 6 themes): overlap 0 and keep-out 0 in all 36, smallest art-to-ring gap 3.33 css px.
- **Window clips:** with a magenta backdrop, the four corners of the title, version, header buttons, banner text, banner icon, edit bar buttons, update bar controls and the settings title and footer buttons (at 424 x 300 and 640 x 420) are all painted: **0 clipped points in every state**, including the rounded window (Republic) and the cut windows (Separatist two corners, Sith eight points, Mando one dent). **Positive control:** on the magenta backdrop the window corners read magenta exactly where each theme clips (Republic and Sith all four, Separatist top left and bottom right, Mando bottom right) and not at all in Empire and Rebel, which are square.
- **Hidden-tiles sigma:** 0.00 for all six (no texture layer; the gradients are on the tiles, the header and the banner, none behind the tile field).
- **Fonts:** the platform fonts the mock actually used per element are in each type section (`CSS.getPlatformFontsForNode`); a misspelled family falls back to `serif` (319.2 px against 319.2 px, the negative control).
- **Spec text to CSS:** I rebuilt each of the six theme files from the **text of this spec alone** (the `:root` block, the rules block, the SVG sources and the placeholder encoding of B1 0.2) and compared the bytes with the files the verification ran on: section 10 item 1 gives the result and the positive control.
- **Plate margins:** the six mock glyphs were rasterised at 4x and measured against each clip shape (`shapes.mjs`), so every margin in the tile notes is a computed distance, not an impression; the six **real** icons were then placed on every shaped plate and the lost share measured with the cut on against off (drop shadow off, 4x).
- **Descender sweep:** 4 labels x 3 scales (1x, 1.5x, 2x) x 2 label sets per theme: built render against an unclipped reference, in the 8 px band under the label box, plus a one-line-height positive control and the Cyrillic re-sweep of 0.2.
- **Display scale:** label widths, title edge, tile height (94.80 px at every scale) and banner fit at 1x, 1.5x and 2x; the 3 px header line reads 3 solid device rows at 1x and 1.5x and 6 (Separatist 7) at 2x.

**Caveats.** Chromium 154 is not Electron 32; sub-pixel text and filter rounding can differ, so **Ender's numbers win** over mine where they differ. The renders are the target look, not a pixel contract. I did not see: the skin-picker list open, the empty-library drop hint, the updater error bar, and the real Electron window on a desktop wallpaper (so the clipped corners show the mock's backdrop). The prototypes and renders are in the session scratchpad at `batch6/` (`themes/<theme>.css`, `verify/<theme>/`, `out/`); **this spec's text is the contract.**

### 0.5 Deletions per theme (pattern in B1 0.3; here are the keyframe sets)

Delete every rule listed in B1 0.3 in each file, plus these `@keyframes`, which nothing else uses: republic `force-nexus`, `republic-breathe`, `republic-glow`, `republic-force`, `republic-starfield`; separatist `sep-grid`, `sep-readout`, `sep-title`, `sep-border`, `sep-dust`; empire `empire-deathstar`, `empire-readout`, `empire-flicker`, `empire-border`, `empire-starfield`; rebel `rebel-target`, `rebel-lore`, `rebel-pulse`, `rebel-hope`, `rebel-starfield`; sith `sith-holocron`, `sith-readout`, `sith-title`, `sith-border`, `sith-energy`; mando `mando-helm`, `mando-readout`, `mando-title`, `mando-border`, `mando-dust`. Empire also has `hdr-bar-strobe` (the `#header::before` strobe, 8 s, stepped), which is a **shared** keyframe: delete the `#header::before` animation rule in the Empire file; leave the keyframe where other files use it. Also delete each file's `.app-tile::before` shape and `.app-tile:hover::before` animation rules (`tile-scan-v` in Separatist, Empire and Mando; `tile-radial` in Republic and Rebel; **Sith's is `tile-flicker .5s steps(1, end) infinite`**, the only infinite hover animation in the batch; all replaced by `.app-tile::before { display:none; }`), the `--banner-icon-anim` and `--title-anim` values (set to `none`), and set `--app-entrance-anim: entrance-fade 0.8s ease-out forwards`. Every legacy file also has a painted panno, a readout, header text, an edit-bar quote and a particle layer; all of them go (B1 0.3). The legacy tile shapes also go: republic (a circle at 46 percent), separatist (a rounded-corner hexagon), empire (an octagon), rebel (a pennant), sith (a batwing), mando (a T-notch).

The new files are **short**: 10.9 to 17.3 KB each (the legacy files are 12.2 to 17.6 KB), mostly SVG data URIs.

### 0.6 Motion inventory (before to after; method B1 0.7)

Tier key (create-theme.md, cheapest first): 1 opacity or transform, 2 colour or text-shadow, 3 filter, 4 background-position or size, 5 box-shadow, 6 clip-path. Counted from the six legacy files (`grep -o infinite` and the `--title-anim` and `--banner-icon-anim` values); every legacy hover animation is a one-shot `forwards` except Sith's:

| Theme | Today (`infinite` occurrences) | Hover-only today | After |
|---|---|---|---|
| republic | 6: republic-glow (title); banner-glow (banner icon); force-nexus (panno); republic-breathe (readout); republic-force (`#app`); republic-starfield (`#particles`) | one-shot `tile-radial .55s` | **0** |
| separatist | 6: sep-title (title); banner-pulse (banner icon); sep-grid (panno); sep-readout (readout); sep-border (`#app`); sep-dust (`#particles`) | one-shot `tile-scan-v .5s` | **0** |
| empire | 7: empire-flicker (title); banner-glow (banner icon); empire-deathstar (panno); empire-readout (readout); empire-border (`#app`); hdr-bar-strobe (`#header::before`); empire-starfield (`#particles`) | one-shot `tile-scan-v .5s` | **0** |
| rebel | 6: rebel-pulse (title); banner-glow (banner icon); rebel-target (panno); rebel-lore (readout); rebel-hope (`#app`); rebel-starfield (`#particles`) | one-shot `tile-radial .55s` | **0** |
| sith | 7: sith-title (title); banner-throb (banner icon); sith-holocron (panno); sith-readout (readout); sith-border (`#app`); sith-energy (`#particles`); tile-flicker (hover) | **`tile-flicker .5s steps(1, end) infinite`** (counted in the 7) | **0** |
| mando | 6: mando-title (title); banner-pulse (banner icon); mando-helm (panno); mando-readout (readout); mando-border (`#app`); mando-dust (`#particles`) | one-shot `tile-scan-v .5s` | **0** |
| **Batch total** | **38** | 1 infinite (Sith) | **0** |

No new infinite animation is added anywhere (the "no higher than today" limit is met at 0). There is no `will-change` in any theme file, no `backdrop-filter`, no `@keyframes`, no `animation:` property. The only motion left in any state is the base one-shot `transition` on tiles (0.12 s) and the one-shot entrance fade. By the measured tiers in `create-theme.md`, a whole animated theme costs 55 to 83 percent of one core while focused; these six cost the 0.5 percent idle floor. Acceptance: `grep -c infinite <theme>.css` is 0 for all six and the after-run `loopingAnimationsAtCapture` is 0 for all six (it was 6 or 7 in each).

### 0.7 Fonts used

| Family (CSS) | File(s) | Themes | Cyrillic |
|---|---|---|---|
| **`Jost`** (bundled, variable 100 to 900) | `fonts/jost/Jost-VF.ttf` | Republic labels and banner (400); Separatist title (500), labels and banner (400) | yes |
| **`Cinzel`** (bundled, variable 400 to 900) | `fonts/cinzel/Cinzel-VF.ttf` | Republic title (600, 11 px, 3 px tracking) | no; the title is Latin markup, falls to Palatino Linotype |
| **`Dela Gothic One`** (bundled, 400 only) | `fonts/delagothicone/` | Mando title (11 px, 1 px tracking) | yes (and kana); the title is Latin markup |
| Bahnschrift (variable; SemiCondensed through `font-stretch: 87.5%`) | `bahnschrift.ttf` | Sith labels (600) and banner (500), both SemiCondensed, and Sith's version and Settings (normal width); the fallback behind Libre Franklin (Empire) and Oxanium (Sith title) | yes |
| Trebuchet MS | `trebuc.ttf`, `trebucbd.ttf` | Rebel labels (400), banner (700), version and Settings (the title is Black Ops One) | yes |
| **`Libre Franklin`** (bundled, variable 100 to 900) | `fonts/librefranklin/LibreFranklin-VF.ttf` | Empire title (500, 11 px, 4 px tracking), labels (500, 11 px, 0 px tracking, line height 13.8 px), banner (400) and the body face (`--font`: version, Settings, edit and update bars) | yes (a Cyrillic probe, "Жёсткий диск Щщ Ъъ Проводник", draws 28 of 28 glyphs) |
| **`Black Ops One`** (bundled, 400 only) | `fonts/blackopsone/BlackOpsOne-Regular.ttf` | Rebel title (11 px, 3 px tracking, weight 400, no synthesis) | no; the title is Latin markup |
| **`Oxanium`** (bundled, variable 200 to 800) | `fonts/oxanium/Oxanium-VF.ttf` | Sith title (700, 12 px, 4 px tracking) | no (a Cyrillic probe falls to the fallback glyph by glyph), so the Sith labels, banner and body stay Bahnschrift |
| Segoe UI Semibold and Segoe UI | `seguisb.ttf`, `segoeui.ttf` | Mando labels and banner (Semibold), version and settings (Regular) | yes |

**On the approved-font list.** The brief for this spec names the approved families as "UnifrakturCook, Cinzel, IM Fell, Pirata One, Cormorant Garamond, plus stock fonts". The plan's ruling 5 (`QuickLaunch_ThemeFidelity_Plan_2026-09-29.md`, Sergei 2026-09-30) approves **seven** files for download and bundling (Dela Gothic One, Jost, Cinzel, Pirata One, UnifrakturCook, IM Fell English, Metamorphous) and the batch-4 addendum added Cormorant Garamond. Jost and Dela Gothic One are therefore approved, **already bundled in the working tree**, and Jost is already shipped in committed batch 5 (ff8, ff15). I used Jost, Cinzel and Dela Gothic One on that record. If the shorter list was meant to exclude Jost and Dela Gothic One, the swap is one rule each and is given, measured, in section 10 item 7 (Jost to Segoe UI moves every label and title by 3 px or less; Dela Gothic One to Arial Black makes the Mando title 15 px narrower, still inside the gate); no theme here depends on a face outside the plan's list **except the three added at the build**: Libre Franklin, Black Ops One and Oxanium, which section 8 proposed and Sergei approved on 2026-10-01 (the README in `src/renderer/fonts/` lists their sources, sizes and SHA-256; the review checked each file against the upstream git blob id).

Not used: Pirata One, UnifrakturCook, IM Fell English, Metamorphous and Cormorant Garamond (approved, not needed here) and every non-approved face (8 lists what would still lift the batch). **Figures** (measured on "v1.94.3 2022 7-Zip 23.01"): every face above draws lining figures. **`'Segoe UI Semilight'`** is not used anywhere in this batch (B5 0.7: the family name does not resolve; weight 350 on `'Segoe UI'` is the Semilight face), and the Foundation map's stack for these themes is not touched. **Bahnschrift and Trebuchet MS** ship with the Windows 10 and 11 install (Bahnschrift from version 1709); on an older install the stacks fall to Segoe UI.

### 0.8 Banner lines: what was verified, how, and what was dropped

Method and its limit: for each candidate I ran a web search for the exact phrase and read what came back, then **fetched** the starwars.com quote pages ("20 classic quotes from Revenge of the Sith", "20 favorite quotes from The Mandalorian season one", "memorable quotes from Droids"), the Wikiquote pages for the films, Rogue One and The Mandalorian, and quotes.net. The fetch tool returns an extract, not a raw page, and it is lossy in both directions: it did not show two lines that other pages print (Vader's "Apology accepted" on the Wikiquote extract, "Roger, roger" on the Phantom Menace extract), so **every wording below follows a page that printed it**, and lines with only one kind of source are marked. **The method caught four errors in my first picks**: "Unlimited power!" is from Revenge of the Sith, not Return of the Jedi; Dooku's "I've been looking forward to this" is Revenge of the Sith, not Attack of the Clones; "Rebellions are built on hope" is Cassian's line before it is Jyn's; and "Bounty hunting is a complicated profession" (already in `THEME_BANNERS`) could not be found in any source and is dropped. Case is presentation: the banner has no `text-transform` in any theme of this batch, so the strings are exactly what goes into `THEME_BANNERS`. **Standing rule applied: short quotes only, no long passages.** The longest line is 8 words; six are one or two sentences of a longer line (Tarkin, Leia, Obi-Wan on the high ground, Palpatine on hate, Sidious, Kuiil). **No line in this batch is studio-authored.**

| Theme | Line (in order) | Words | Speaker | Source |
|---|---|---|---|---|
| republic | `Hello there.` | 2 | Obi-Wan Kenobi, Revenge of the Sith | starwars.com "20 classic quotes" (fetched, quote 13) and quotes.net (fetched) |
| republic | `This is where the fun begins.` | 6 | Anakin Skywalker, Revenge of the Sith | starwars.com (fetched, quote 1) and IMDb (search) |
| republic | `I have the high ground.` | 5 | Obi-Wan Kenobi, Revenge of the Sith (second sentence of "It's over, Anakin. I have the high ground.") | starwars.com (fetched, quote 18) and Wikiquote (fetched) |
| separatist | `Roger, roger.` | 2 | B1 battle droids ("more or less every battle droid") | starwars.com "memorable quotes from Droids" (fetched, quote 1, printed with the period inside the quotation marks) and quotes.net (search) |
| separatist | `General Kenobi! You are a bold one.` | 7 | General Grievous, Revenge of the Sith | starwars.com (fetched, quote 13) and quotes.net (fetched) |
| separatist | `I've been looking forward to this.` | 6 | Count Dooku, Revenge of the Sith (not Attack of the Clones, which a first guess assumed) | starwars.com (fetched, quote 3) and Wikiquote (fetched) |
| empire | `I find your lack of faith disturbing.` | 7 | Darth Vader to Admiral Motti, A New Hope | Wikiquote (fetched, printed in the dialogue), Goodreads and quotes.net (search) |
| empire | `Apology accepted, Captain Needa.` | 4 | Darth Vader, The Empire Strikes Back | quotes.net, clip.cafe, movie-sounds.org and TV Tropes (search excerpts). The Wikiquote extract for the film did not show the line (the fetch tool returns an extract, not the page), so the wording rests on those four |
| empire | `Fear will keep the local systems in line.` | 8 | Grand Moff Tarkin, A New Hope (first sentence of "Fear will keep the local systems in line. Fear of this battle station.") | Wikiquote (fetched) and quotes.net (search; prints both sentences) |
| rebel | `Rebellions are built on hope.` | 5 | Jyn Erso, Rogue One (Cassian says it first, on Jedha; Jyn repeats it to the council) | Wikiquote (fetched: the tagline, and Jyn's "We have hope. Rebellions are built on hope!"), IMDb and TVLine (search) |
| rebel | `Never tell me the odds!` | 5 | Han Solo, The Empire Strikes Back | Wikiquote (fetched, printed in the dialogue), TV Tropes and starwars.com (search) |
| rebel | `You're my only hope.` | 4 | Princess Leia's hologram, A New Hope (second sentence of "Help me, Obi-Wan Kenobi. You're my only hope.") | Wikiquote (fetched) and starwars.com (search) |
| sith | `Good! Your hate has made you powerful.` | 7 | Emperor Palpatine, Return of the Jedi (the first two sentences of a longer line) | Wikiquote (fetched), TV Tropes and quotes.net (search) |
| sith | `Unlimited power!` | 2 | Palpatine to Mace Windu, Revenge of the Sith (a first guess said Return of the Jedi; the Wikiquote extract for that film did not print it, which is how the wrong film was caught) | The Escapist, ScreenRant and the Star Wars Memes wiki (search excerpts); one displayed text, no Wikiquote page printed it in the extract |
| sith | `Execute Order 66.` | 3 | Darth Sidious, Revenge of the Sith (second sentence of "The time has come. Execute Order 66.") | starwars.com (fetched, quote 16) and scatteredquotes.com (search) |
| mando | `This is the Way.` | 4 | The Armorer (the series' creed; Din Djarin repeats it) | starwars.com "20 favorite quotes" (fetched, quote 8) and Wikiquote (fetched: first said in Chapter 3) |
| mando | `I have spoken.` | 3 | Kuiil, season 1 (second sentence of "I will help you. I have spoken.") | starwars.com (fetched, quote 4); Wikiquote and search excerpts attribute it to Kuiil |
| mando | `I like those odds.` | 4 | The Mandalorian, Chapter 1 (his answer to "We have you four to one!") | starwars.com (fetched, quote 3) and Wikiquote (fetched, Chapter 1) |

**Not kept** (the lines that were in `THEME_BANNERS` for these six keys, all uppercase; they were not re-verified except where marked, so "not kept" does not say "false"): republic: all five dropped: `THERE IS NO EMOTION, THERE IS PEACE. THERE IS NO IGNORANCE, THERE IS KNOWLEDGE.` (79 characters), `ONCE YOU START DOWN THE DARK PATH, FOREVER WILL IT DOMINATE YOUR DESTINY.` (73), `DO OR DO NOT. THERE IS NO TRY.`, `THE FORCE IS STRONG IN THIS ONE.`, `PASS ON WHAT YOU HAVE LEARNED. STRENGTH, MASTERY. BUT WEAKNESS, FOLLY, FAILURE ALSO.` (84); the old five are Jedi-code, Yoda and Vader lines, three of them over 70 characters, and none was re-verified; the new three are prequel-era lines. separatist: `ROGER ROGER.` (kept as "Roger, roger."); not kept: `THE TRADE FEDERATION WILL NOT SIT STILL.`, `YOUR JEDI MIND TRICKS DO NOT WORK ON ME.`, `I HAVE BEEN TRAINED IN YOUR JEDI ARTS BY COUNT DOOKU.` (53 characters), `ARMIES ARE MARCHING. THE REPUBLIC WILL FALL.`. empire: `FEAR WILL KEEP THE LOCAL SYSTEMS IN LINE.`, `I FIND YOUR LACK OF FAITH DISTURBING.` and `APOLOGY ACCEPTED, CAPTAIN NEEDA.` (kept, in sentence case, now verified); not kept: `THE ABILITY TO DESTROY A PLANET IS INSIGNIFICANT NEXT TO THE POWER OF THE FORCE.` (80 characters), `THE EMPEROR IS NOT AS FORGIVING AS I AM.`. rebel: `REBELLIONS ARE BUILT ON HOPE.` and `NEVER TELL ME THE ODDS.` (kept, now verified); not kept: `MANY BOTHANS DIED TO BRING US THIS INFORMATION.` (the line the corrupted readout also printed, 47 characters), `MAY THE FORCE BE WITH YOU.`, `STRIKE ME DOWN AND I WILL BECOME MORE POWERFUL THAN YOU CAN POSSIBLY IMAGINE.`. sith: `EXECUTE ORDER 66.` and `UNLIMITED POWER.` (kept, with the printed exclamation); not kept: `PEACE IS A LIE. THERE IS ONLY PASSION.` (the Sith code, which the audit lists among what made the old theme a red demon skin), `THE DARK SIDE OF THE FORCE IS A PATHWAY TO MANY ABILITIES SOME CONSIDER UNNATURAL.` (82 characters), `GOOD. I CAN FEEL YOUR ANGER.`. mando: `THIS IS THE WAY.` (kept); not kept: `WEAPONS ARE MY RELIGION.` (a paraphrase of "I'm a Mandalorian. Weapons are part of my religion."), `I AM A MANDALORIAN. WEAPONS ARE PART OF MY RELIGION.` (52 characters), `WHEREVER I GO, HE GOES.` (not verified), **`BOUNTY HUNTING IS A COMPLICATED PROFESSION.` (dropped: not printed on the starwars.com list of 20 favorite quotes or on the Wikiquote Chapter 1 extract, and a search attributed a similar line, "bounty hunting can be a difficult profession", to the Client, not to Din Djarin; unverified, so it goes)**.

**Line counts after:** republic 3, separatist 3, empire 3, rebel 3, sith 3, mando 3 (18 lines; the rotation code has no minimum; "(2 to 6 per theme)" is already the comment above `THEME_BANNERS`).

**Fit (measured on the mock with the real fonts and tracking; the text box at 424 px starts at x 46 and ends at x 320, because of `margin-right: 90px`, so it is 274 px wide):**

| Theme | Widest line (px) | Where it ends | To the text box edge (x 320) | To the motif's first painted pixel |
|---|---|---|---|---|
| republic | 154.4 (`This is where the fun begins.`) | x 200.4 | 119.6 px | 129.1 px (first painted pixel x 329.5) |
| separatist | 203.8 (`General Kenobi! You are a bold one.`) | x 249.8 | 70.2 px | 81.2 px (first painted pixel x 331.0) |
| empire | 227.9 (`Fear will keep the local systems in line.`; Libre Franklin 400, Ender's Electron figure) | x 273.9 | 46.1 px | 56.1 px (first painted pixel x 330.0) |
| rebel | 168.5 (`Rebellions are built on hope.`) | x 214.5 | 105.5 px | 116.5 px (first painted pixel x 331.0) |
| sith | 208.5 (`Good! Your hate has made you powerful.`) | x 254.5 | 65.5 px | 80.8 px (first painted pixel x 335.4) |
| mando | 97.3 (`I like those odds.`) | x 143.3 | 176.7 px | 185.2 px (first painted pixel x 328.5) |

All lines fit on one line at 424 and at 640 (`scrollWidth <= clientWidth`), and at 1x, 1.5x and 2x. Ender confirms for every string; the JavaScript block in 9 has the exact entries.

### 0.9 Trademark and signature elements: what is drawn and what is not

| Franchise element | What this spec draws | What it does not draw |
|---|---|---|
| The saga | Warm or neutral type, a hard geometric frame per faction, no Aurebesh | The logo, Aurebesh lettering, any character, any film still, the Force-user silhouettes |
| republic | Ziggurat, curved rings, pilasters, a rotunda in a skyline of stepped towers | The Republic cog emblem (a six-spoke wheel, a mark), the Jedi Order emblem, clone armour and helmets, the Senate pod's actual model and any logo are not drawn. The ziggurat, the rings, the rotunda and the towers are generic architecture. |
| separatist | Hexagon cells, trapezoid plates, perforated seams, four droid busts built from a visor band, a ribbed neck and a segmented chest | The CIS emblem, the Trade Federation and Techno Union marks, Aurebesh, and any specific droid model sheet (the B1 head is drawn as a generic long visor face) are not drawn. The cells, plates and busts are generic. |
| empire | A grey sphere with a trench and a dish, a wedge capital ship in top view, readout bars, recessed panels and slots | The Imperial cog emblem, the Star Destroyer's model detail, the TIE fighter, stormtrooper and officer designs and the Death Star's surface detail are not drawn. The wedge, the sphere with a trench and a dish, the panels and the bars are generic forms. |
| rebel | Stencil blocks, a hologram reticle, a swept-wing dart, a pilot helmet, webbing and hazard stripes | The starbird emblem, squadron markings, the X-wing's exact model (the fighter is a generic swept-wing dart), the Rebel pilot's helmet markings and any hologram character are not drawn. |
| sith | Inverted talons, a saber, an open cube with a lifted lid, crimson edge-lights, jagged cuts | The Sith Empire and Sith Order emblems, Vader's helmet, Sidious' robes, the Sith code as text and any specific holocron model are not drawn. The talons, the saber, the cube and the shards are generic. |
| mando | A pauldron plate, a thick metal disc, twin suns over dunes, riveted plates, a dented corner | The helmet and its T-visor, the mudhorn signet, clan sigils, the Razor Crest's model, Din Djarin's armour design and the bounty puck's hologram are not drawn. The pauldron is a generic shoulder plate, the puck a generic disc, the suns a landscape. |

### 0.10 Where this spec departs from the audit (and from the Foundation map), and why

| Theme | Audit direction | This spec | Reason |
|---|---|---|---|
| all | gutter rules and ticks; art in the frame; header text deleted or 14 characters | frame art in the 8 px bands only; no header text; the family kit of 0.3 | the gutters move with the window width (B1 0.1); the audit's batch note asks for one kit and a different material per faction |
| republic | dark ground `#14161C`, text `#F5F5F0`, brass accent, crimson edit bar, Coruscant blue; a stepped ziggurat in the header, a Senate-pod arc in a corner, a notched six-spoke ring as the banner icon; Palatino Linotype caps; rename to GALACTIC REPUBLIC | **light** ivory ground `#EFE7D6`, crimson header, brass and bronze trim, blue banner and ring; the ziggurat between curved rings in the header, deco pilasters, a **Senate rotunda** as the banner icon and in the skyline; **Cinzel** title and **Jost** body; renamed | Makoto's sheet gives cream as the primary ground and the dark ground as the variant, and warns "too dark and militaristic (the Republic looks gleaming, red-and-white)"; a dark navy-and-crimson Republic collapses into Separatist and Sith. The six-spoke notched ring is the Republic cog, a mark. Cinzel is approved, bundled and named by the sheet for the Senate and Temple feel (flag 1, flag 5) |
| separatist | steel `#5C6B78`, droid tan `#C69A5B` as accent-c, CIS blue `#2A7FA8` hover, dull red `#7C2B2B` edit; a honeycomb strip in the header, plate seams on the pad, an elongated droid-head oval as the banner icon; Bahnschrift caps; trapezoid tiles | tan is the **header plate** and accent-c; CIS blue `#4BB0DC` hover; `#9A3A3A` edit rule and remove button; honeycomb, seams and plates as asked; the banner icon is **three honeycomb cells** and the motif a droid squad; **Jost**; two-cut plates | `#2A7FA8` is 3.07:1 against the hover fill (borderline) and `#7C2B2B` is 1.87:1 against the edit bar (almost invisible as a rule; `#9A3A3A` is 2.54:1); a lone droid head read as a tribal mask in the first draft; Bahnschrift is Empire's and Sith's, so Jost keeps the three separate (flag 2) |
| empire | gunmetal `#8A8F94`, red `#D0161D` on the edit bar only; corner ticks, three stacked bars in the header, a six-segment split ring as the banner icon; **Franklin Gothic Medium**, wide tracking; square tiles | gunmetal borders (`#4A4F55`, `#5B6168`) and `#A9AFB5` as the ring; red also as the title dot, one header segment, one ship lamp and the remove button (an alert light, a few pixels); a **battle station** as the icon and a wedge ship in the banner; **Libre Franklin** (title 500, labels 500 at 11 px, banner 400, body face; Bahnschrift as the fallback); square cards on the app's own plate | a segmented ring reads as a gear or a settings icon and is the cog mark; **`'Franklin Gothic Medium'` by name resolves in Chromium here to the Office-only "Franklin Gothic Demi" face** (516.3 px for a probe string, against 505.8 px for the stock `framd.ttf` file the audit means), so a screenshot would show a face other machines lack; Libre Franklin (bundled, section 8, approved by Sergei 2026-10-01) gives the Franklin Gothic read the audit asks for and renders the same everywhere; the first text built it in Bahnschrift, which stays the fallback (flag 3) |
| rebel | olive `#6B7B4E` header strip, hologram blue `#3A78B5` accent line, orange on edit bar, ring and title; a rivet line on the pad, stencilled "01 02 03" in the header, a swept-wing angle at the banner; Bahnschrift SemiBold caps; 2 px tiles | olive `#3A4529` header (olive `#6B7B4E` is the tile border), hologram blue **`#5AA3E0`**; stencil **blocks** (no numerals), a reticle and a swept-wing fighter; orange also as hover and paint; **Black Ops One** title, **Trebuchet MS** body; 2 px tiles | `#3A78B5` is 2.69:1 against the darkest olive (under 3; `#5AA3E0` is 4.60:1); no numeral is drawn in art (B5 0.2); Bahnschrift is already two themes' face; Trebuchet stays the field-gear body face that carries cream text on olive, and the title takes the bundled stencil Black Ops One (flag 6, section 8) |
| sith | text `#D8D2CE`, crimson `#B3121A` as accent-c and the edit bar, oxblood hover fills, cold metal borders `#9EA2A8`, one dim amber banner icon; jagged corner cuts, a thin red edge-light, a small holocron cube at the banner; Bahnschrift SemiBold caps | crimson **`#E5333B`** as accent-c and the edge-light (`#B3121A` stays as the edit rule and remove fill); borders `#666A70`; amber only inside the holocron and on the update rule; a **saber** as the icon, the **open holocron** as the motif; one cut corner on the plate; **Oxanium** 700 title (4 px tracking), Bahnschrift 600 and 500 SemiCondensed for labels and banner | `#B3121A` is 2.88:1 on the ground (under the 3:1 the gate asks of `--accent-c`; `#E5333B` is 4.65:1); `#9EA2A8` borders (7.82:1) on every tile read as a grey grid, the brightest border in the batch, and `#666A70` (3.69:1) keeps the black glass; the audit's oxblood `#4A0A0E` as a whole hover fill makes the hovered tile the reddest area of the window, and `#2A0C10` keeps crimson a line; a batwing plate is a 12 percent V in the top edge, a nick too small to carry a silhouette; a V-bottom talon plate crops real marks (flag 7); Oxanium (section 8) is the angular title face, and the labels stay Bahnschrift because Oxanium has no Cyrillic |
| mando | beskar `#8C959C`, rust accent-c, sand `#C9A97A` text, forge on hover and focus only; pauldron scoring lines in the header, rivets, a dented-plate corner; Bahnschrift SemiBold; **keep the T-notch tiles**; no dust | bone text `#E8DEC9` (sand lives in the small sun); forge on hover, in the sun and the update rule (the focus ring is rust, the base behaviour); a pauldron in the header, riveted plates, a dented corner **on the window and the plates**; **Dela Gothic One** title, Segoe UI Semibold body; the T-notch plate is replaced by the dent | bone `#E8DEC9` (13.83:1 on the ground) keeps the labels the lightest, crispest element of the window, while sand `#C9A97A` (8.31:1) is a warm accent that stays warm in the small sun; the T-notch is the helmet visor, the character design the audit itself warns against, and its 10 percent V in the top edge is a nick too small to carry a silhouette (re-measured here: it loses 0 to 1.1 percent of the plate on the real icons, so it is safe, just not worth having); Dela Gothic One is the wide heavy face of the show's title card (flags 4 and 8) |
| all | banner quotes | quotes replaced by verified short lines (0.8) | B1 0.10; H3; the standing rule for this batch |

### 0.11 Suggested implementation order for Ender

1. **empire** and **rebel** first (stock and bundled fonts, no window clip, no plate cut: they prove the family kit, the 3 px header line and the banner motif with the least risk), then **mando** (Dela Gothic One title, one clip dent, one plate dent) and **sith** (the Oxanium title and Bahnschrift `font-stretch: 87.5%` on the labels and banner, the eight-point window, the one-cut plate).
2. **republic** (the light window: the rewritten base rules, the ivory icon filter, Cinzel and Jost, the arch plate and the rename in `app.js`) and **separatist** (the tan header rule block, the two-cut window and plate, Jost) last, because they touch the most rules.
3. After each theme: `npm run check:contrast` (no `--rebaseline`), `grep -c infinite <theme>.css`, the gallery after-run, the hidden-tiles shot, the A/B/C probe at the three sizes plus the states shot (with `visibility:hidden` on the banner icon **and the theme's own banner surface kept** in the art-off override, 0.4), the descender sweep of 0.4 (with the Cyrillic strings for the uppercase themes), the real-icon check on the four shaped plates, and the theme's "Done when". After the fonts: `fontsRendered` (positive control: each adopted family listed; negative control: a misspelled probe family falls back). In the Foundation after-run also check the focus ring on the last column at 640 x 420 and 1024 x 700: expected 3 empty pixels between the art and the ring zone. Before driving any debug port: read the launch's own `DevToolsActivePort` (B4R). **Two `app.js` edits** (Ender, outside the six CSS files): the six `THEME_BANNERS` keys (block in 9) and the display name `'star-wars-republic': 'STAR WARS: OLD REPUBLIC'` to `'STAR WARS: GALACTIC REPUBLIC'` (line 712 at HEAD); the key does not change, so no saved setting breaks.

---

## 1. star-wars-republic (STAR WARS: GALACTIC REPUBLIC, renamed from OLD REPUBLIC): DONE

**Audit:** score 2, redraw. Wrong faction look: the Republic is ivory, crimson and brass Coruscant deco; this was a navy-violet Jedi-meditation screen with a magenta accent (`#C040A0`) and an italic serif. Faint Force rings sat behind the middle tiles, a readout ("THERE IS NO EMOTION...", "CORUSCANT") crossed the right column, the banner was truncated. Six infinite animations.
**Direction:** the one **light** theme of the batch, and the only one where the window itself is bright. An ivory ground (`#EFE7D6`) with ivory tiles, bronze borders and arch-top plates; a crimson header (`#9A2220` to `#7C1816`) under a brass line; a Coruscant-blue banner (`#2C4A7A` to `#1B3157`). Coruscant blue is the keyboard ring and the slider colour, crimson is the hover border, the values and edit mode, brass is trim only. The frame is deco: a crown of outlined ziggurats along the top, fluted pilasters with a crimson diamond every 24 px down both sides, crimson corner caps with a brass fan. The header carries a stepped brass ziggurat between two sweeps of curved Senate rings; the banner carries the Senate rotunda in a dusk skyline of stepped towers with a dotted traffic lane, and its icon is the rotunda. Type is Cinzel for the title and Jost for everything else (Jost is Futura-derived, the deco-era sans). No Force rings, no six-spoke cog (the Republic emblem), no magenta, no violet, no italic serif. The theme is renamed GALACTIC REPUBLIC (the audit's rename; the key stays `star-wars-republic`). Static.

### 1.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: inset(0 round 10px);
  --overlay-clip: inset(0 round 10px);
  --bg: #EFE7D6;
  --panel-bg: #F8F2E5;
  --overlay-bg: #EFE7D6;
  --header-bg: #9A2220;
  --font: Jost, 'Segoe UI', Arial, sans-serif;
  --text: #2A2118;
  --text-dim: #5B4F3E;
  --accent-c: #2C4A7A;
  --accent-m: #8E1C1A;
  --accent-y: #2C4A7A;
  --accent-text: #8E1C1A;
  --border: #9A7420;
  --border-h: #8E1C1A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #2C4A7A;
  --title-anim: none;
  --tile-hover-bg: #FFF1CF;
  --tile-hover-border: #8E1C1A;
  --tile-hover-shadow: inset 0 -3px 0 #D9B44A;
  --tile-active-bg: #FFF1CF;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(0.8) saturate(1.05);
  --tile-icon-shape: inset(0 round 20px 20px 8px 8px);
  --tile-label-spacing: 0.1px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #6E1412;
  --btn-active-bg: #5A0F0E;
  --drop-hint-border: #9A7420;
  --drop-icon-color: #9A7420;
  --hint-sub-color: #5B4F3E;
  --rename-dashed: #2C4A7A;
  --rename-input-bg: #FFF1CF;
  --edit-bar-bg: #F6DEDA;
  --edit-bar-border: #8E1C1A;
  --edit-label-color: #8E1C1A;
  --edit-label-glow: none;
  --btn-done-color: #8E1C1A;
  --btn-done-border: #8E1C1A;
  --btn-done-hover-bg: #EBC3BD;
  --btn-done-hover-glow: none;
  --btn-add-border: #9A7420;
  --update-bg: #E6EDF7;
  --update-border: #2C4A7A;
  --update-color: #1B3157;
  --update-btn-border: #2C4A7A;
  --update-btn-hover-bg: #C9D8EE;
  --update-btn-hover-glow: none;
  --btn-close-color: #8E1C1A;
  --btn-close-border: #8E1C1A;
  --btn-close-hover-bg: #F6DEDA;
  --btn-close-hover-glow: none;
  --picker-search-bg: #FFF1CF;
  --picker-item-hover-bg: #FFF1CF;
  --picker-item-active-bg: #FBE6B5;
  --picker-placeholder-bg: #FFF1CF;
  --skin-btn-active-bg: #FBE6B5;
  --remove-btn-bg: #8E1C1A;
  --remove-btn-border: #2A2118;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#2A2118` on `#EFE7D6` | 4.5:1 | **12.84:1** |
| `--text-dim` on `--bg` | `#5B4F3E` on `#EFE7D6` | 4.5:1 | **6.48:1** |
| `--accent-c` on `--bg` | `#2C4A7A` on `#EFE7D6` | 3:1 | **7.21:1** |
| `--accent-text` on `--bg` | `#8E1C1A` on `#EFE7D6` | 3:1 | **7.32:1** |
| `--hint-sub-color` on `--bg` | `#5B4F3E` on `#EFE7D6` | 4.5:1 | **6.48:1** |
| `--btn-close-color` on `--panel-bg` | `#8E1C1A` on `#F8F2E5` | 4.5:1 | **8.07:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the worst stop** (the darkest tile stop on this light window, the lightest crimson and blue stops under the light header and banner text), except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#2A2118` on `#F3ECDB` | 4.5:1 | **13.42:1** |
| Tile label on tile hover | `#2A2118` on `#FBE6B5` | 4.5:1 | **12.86:1** |
| Tile label on tile pressed (pressed state) | `#2A2118` on `#FBE6B5` | 4.5:1 | **12.86:1** |
| Title on header | `#FBF4E2` on `#9A2220` | 4.5:1 | **7.30:1** |
| Title dot (`.accent`) on header | `#F0CF7A` on `#9A2220` | 4.5:1 | **5.30:1** |
| Header version on header | `#F3DFC2` on `#9A2220` | 4.5:1 | **6.15:1** |
| Header button glyph on header | `#FBF4E2` on `#9A2220` | 4.5:1 | **7.30:1** |
| Header button glyph on button hover | `#FFFFFF` on `#6E1412` | 4.5:1 | **11.85:1** |
| Filter chip text on chip | `#8E1C1A` on `#FFF1CF` | 4.5:1 | **8.04:1** |
| Filter chip clear glyph on hover on chip | `#8E1C1A` on `#FFF1CF` | 4.5:1 | **8.04:1** |
| Banner text on banner | `#FBF4E2` on `#2C4A7A` | 4.5:1 | **8.08:1** |
| Header line on header (non-text) | `#D9B44A` on `#7C1816` | 3:1 | **5.29:1** |
| Edit label on edit bar | `#8E1C1A` on `#F6DEDA` | 4.5:1 | **7.03:1** |
| Done / close button text on edit bar | `#8E1C1A` on `#F6DEDA` | 4.5:1 | **7.03:1** |
| + FILE / + INSTALLED text on edit bar | `#2A2118` on `#F6DEDA` | 4.5:1 | **12.32:1** |
| Done button text on its hover fill | `#8E1C1A` on `#EBC3BD` | 4.5:1 | **5.61:1** |
| Settings text on overlay | `#2A2118` on `#EFE7D6` | 4.5:1 | **12.84:1** |
| Settings text on panel | `#2A2118` on `#F8F2E5` | 4.5:1 | **14.16:1** |
| Settings label (text-dim) on panel | `#5B4F3E` on `#F8F2E5` | 4.5:1 | **7.15:1** |
| Settings value / cheat key (accent-text) on panel | `#8E1C1A` on `#F8F2E5` | 4.5:1 | **8.07:1** |
| Settings version value (accent-text) on panel | `#8E1C1A` on `#F8F2E5` | 4.5:1 | **8.07:1** |
| Settings CLOSE text on panel | `#8E1C1A` on `#F8F2E5` | 4.5:1 | **8.07:1** |
| Settings CLOSE text on its hover fill | `#8E1C1A` on `#F6DEDA` | 4.5:1 | **7.03:1** |
| Hotkey error text (accent-m) on panel | `#8E1C1A` on `#F8F2E5` | 4.5:1 | **8.07:1** |
| Hotkey input text on input fill | `#8E1C1A` on `#FFF1CF` | 4.5:1 | **8.04:1** |
| Picker row text on hover fill | `#8E1C1A` on `#FFF1CF` | 4.5:1 | **8.04:1** |
| Update banner text on update bar | `#1B3157` on `#E6EDF7` | 4.5:1 | **10.98:1** |
| Update button text on hover fill | `#1B3157` on `#C9D8EE` | 4.5:1 | **8.96:1** |
| Drop-hint text (text-dim) on grid ground | `#5B4F3E` on `#EFE7D6` | 4.5:1 | **6.48:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#8E1C1A` | 3:1 | **9.01:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#8E1C1A` | 3:1 | **9.01:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#2C4A7A` on `#F3ECDB` | 3:1 | **7.53:1** |
| Focus ring on grid ground (non-text) | `#2C4A7A` on `#EFE7D6` | 3:1 | **7.21:1** |
| Hover border on grid ground (non-text) | `#8E1C1A` on `#EFE7D6` | 3:1 | **7.32:1** |
| Hover border on hover fill (non-text) | `#8E1C1A` on `#FBE6B5` | 3:1 | **7.33:1** |
| Theme-picker selected row text (accent-text) on active fill | `#8E1C1A` on `#FBE6B5` | 4.5:1 | **7.33:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#8E1C1A` on `#FBE6B5` | 4.5:1 | **7.33:1** |
| Skin search input text (accent-text) on panel | `#8E1C1A` on `#F8F2E5` | 4.5:1 | **8.07:1** |
| Apps-picker search input text (accent-text) on search fill | `#8E1C1A` on `#FFF1CF` | 4.5:1 | **8.04:1** |
| Rename input text (accent-text) on input fill | `#8E1C1A` on `#FFF1CF` | 4.5:1 | **8.04:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#5B4F3E` on `#FFF1CF` | 4.5:1 | **7.12:1** |
| Skin search placeholder (text-dim, themed) on panel | `#5B4F3E` on `#F8F2E5` | 4.5:1 | **7.15:1** |
| Apps-picker placeholder (text-dim) on search fill | `#5B4F3E` on `#FFF1CF` | 4.5:1 | **7.12:1** |
| Hotkey recording text (accent-m) on input fill | `#8E1C1A` on `#FFF1CF` | 4.5:1 | **8.04:1** |
| Update dismiss glyph (text-dim) on update bar | `#5B4F3E` on `#E6EDF7` | 4.5:1 | **6.77:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#5B4F3E` on `#F8F2E5` | 3:1 | **7.15:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#2C4A7A` on `#F8F2E5` | 3:1 | **7.95:1** |
| Tile border on grid ground (non-text) | `#9A7420` on `#EFE7D6` | 3:1 | **3.49:1** |

**Lowest ratio in this theme: 3.49:1 (Tile border on grid ground (non-text), non-text).** Lowest text ratio: 5.30:1 (Title dot (`.accent`) on header). Lowest non-text ratio: 3.49:1 (Tile border on grid ground (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | First stop (top) | Last stop (bottom) |
|---|---|---|
| Header | `#9A2220` | `#7C1816` |
| Tile at rest | `#FFFCF3` | `#F3ECDB` |
| Tile hover and focus | `#FFF1CF` | `#FBE6B5` |
| Tile pressed | `#FFF1CF` | `#FBE6B5` |
| Banner | `#2C4A7A` | `#1B3157` |

**Icon plates through `--tile-icon-fx`** (`brightness(0.8) saturate(1.05)`; mock plates from the gallery; the columns name the **worst stop** of each tile surface):

| Icon plate (mock) | After fx | Rest `#F3ECDB` | Hover `#FBE6B5` | Pressed `#FBE6B5` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#486687` | 5.06:1 | 4.85:1 | 4.85:1 | pass |
| Calculator `#6b6f76` | `#55595F` | 5.98:1 | 5.73:1 | 5.73:1 | pass |
| Paint `#b07a4f` | `#8F613D` | 4.52:1 | 4.33:1 | 4.33:1 | pass |
| Terminal `#3d4450` | `#313641` | 10.28:1 | 9.85:1 | 9.85:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#3D6F70` | 4.81:1 | 4.61:1 | 4.61:1 | pass |
| Files `#c09a3e` | `#9B7B2E` | 3.39:1 | 3.24:1 | 3.24:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.24:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Ground `#EFE7D6`; text is dark brown `#2A2118` (12.84:1). The window is the only light one in the batch, so the base rules that assume a dark ground are overridden (0.3). Bronze `#9A7420` carries every border and line that has to be seen on ivory (3.49:1; the brass `#D9B44A` is 1.61:1 on ivory, under 3, so it is used only on the crimson header (5.29:1) and the blue banner (4.47:1)). Crimson `#8E1C1A` is `--accent-text`, `--accent-m` and the hover border; Coruscant blue `#2C4A7A` is `--accent-c` (the ring, sliders, checkboxes, the chip border). The header text is ivory on crimson, and the header buttons are redrawn for it (a rule block in 3). Icons are darkened (`brightness(0.8)`) so the mock Files plate keeps 3:1 against the pale pressed fill; near-white app icons turn light grey on the ivory tile (watch item 3).

### 1.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | Jost, 'Segoe UI', Arial, sans-serif |
| `#title` | **Cinzel 600** (bundled), 11 px, tracking 3 px, uppercase from the markup, `font-synthesis: none`, `line-height: 1.2`; stack `Cinzel, 'Palatino Linotype', Palatino, Georgia, serif` |
| `.tile-label` | **Jost 400**, 11.5 px, 0.1 px, user case; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | **Jost 400**, 12 px, 0.3 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 138.52** (gate 156; 17.5 px under, 29.5 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700 and at 1x, 1.5x and 2x. The six standard labels in the 100 px box (ink widths): NOTEPAD 43.2, CALCULATOR 49.8, PAINT 23.8, TERMINAL 41.0, BROWSER 39.3, FILES 22.4 px, no ellipsis; the long names "Visual Studio 2022" 96, "Notepad++ x64" 80, "7-Zip 23.01" 57, "Калькулятор" 63 and "Жёсткий диск" 71 px fit, and "Проводник Windows" (108 px) ellipsizes (the base 100 px box, offer b of B4R). Tile height 94.80 px (94.7 to 95.4 required) at every scale. Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; positive control (a 6 px line height cuts the tails): **214 px**. **Platform fonts the mock used:** title Cinzel (web) x12; labels Jost (web) x7; banner Jost (web) x28; version and settings Jost (web) x7. Expected `fontsRendered` for the web faces: `Cinzel` and `Jost`.

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Jost has Cyrillic (checked: "Калькулятор", "Жёсткий диск"); Cinzel has none, but the title is the Latin string `QUICK.LAUNCH` and falls to Palatino Linotype, which does.

### 1.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #9A2220 0, #7C1816 100%); border-bottom-color: #D9B44A; box-shadow: inset 0 -2px 0 #D9B44A; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #D9B44A; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a stepped brass ziggurat (four steps, a spire and a brass base line) centred between two sweeps of three curved brass rings, on the crimson header. Painted pixels at x 170.5 to 249.5, y 11.8 to 29.5. Hidden while the chip shows. The title ends at x 138.5, the scene starts at x 168: 29.5 px clear. The header text, version and buttons are redrawn for this ground in the rules block (the three lines after `#title .accent`).

**B. Frame (the kit of 0.3).** ivory-dark pilasters 8 px wide with brass edges, two hairline flutes and a crimson diamond with a brass bead every 24 px; the top course is a brass rule over a row of outlined ziggurats (two per 24 px) with a crimson base line; each corner is a crimson cap with a brass bracket, a brass fan and a bead. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700); at Sergei's 1.5x the smallest art-to-ring gap is 3.33 css px.

**C. Banner.** the banner is the Coruscant-blue gradient (`#2C4A7A` to `#1B3157`) with a brass top border; its top course is a brass rule over a dashed line with brass diamonds; the icon is the **Senate rotunda** (a brass dome on a drum with a spire, four columns, two steps); the right end is a **Coruscant dusk**: a brass rotunda, four stepped towers with lit windows, a dotted traffic lane in an arc and a few stars. The motif's painted pixels are at x 329.5 to 412.0, y 269.4 to 300.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 129.1 px (0.8). The banner row of the probe reads 4 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: rounded, 10 px radius, a curved deco window (`--overlay-clip` is the same value); the banner and the header meet it at the bottom and top corners and the probe reads 0 clipped content points. Tiles: ivory cards (`#FFFCF3` to `#F3ECDB`), a 1 px bronze border, a 1 px white lit top edge, radius 6 px; the plate is an **arch**: `inset(0 round 20px 20px 8px 8px)` (the 20 px ceiling for shaped plates holds). Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 12.08, Calculator 10.09, Paint 11.13, Terminal 9.39, Browser 11.63, Files 11.13 (smallest 9.39); nothing is cropped. **Real icons** (B5R F1): the share of the plate lost to the cut, drop shadow off, cut against uncut: GlideX 3.44%, foobar2000 file icon 0.38%, QuickLaunch icon 0.2%, BlueStacks 0.02%, BlueStacks logo 0.02%, Android Studio 0%; every mark whole at 6x (corners of a full-bleed background only).

**Trademark note.** The Republic cog emblem (a six-spoke wheel, a mark), the Jedi Order emblem, clone armour and helmets, the Senate pod's actual model and any logo are not drawn. The ziggurat, the rings, the rotunda and the towers are generic architecture.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #8E1C1A; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }
/* base hover rules that assume a dark ground (white text on a pale fill) */
button:hover { color: var(--text); }
.btn-remove:hover { color: #fff; }
.update-btn:hover { color: var(--update-color); }
#filter-chip-clear:hover { color: var(--accent-text); }
.theme-search { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgb(42,33,24)'/%3E%3C/svg%3E"); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { background: linear-gradient(180deg, #9A2220 0, #7C1816 100%); border-bottom-color: #D9B44A; box-shadow: inset 0 -2px 0 #D9B44A; }
#header::before { background: #D9B44A; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Cinzel, 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 600; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 11px; letter-spacing: 3px; color: #FBF4E2; text-shadow: none; }
#title .accent { color: #F0CF7A; }
#header-version { color: #F3DFC2; }
#header-controls button { color: #FBF4E2; border-color: rgba(251,244,226,0.55); }
#header-controls button:hover { background: #6E1412; border-color: #F0CF7A; color: #FFFFFF; }

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

/* tiles */
.app-tile { background: linear-gradient(180deg, #FFFCF3 0, #F3ECDB 100%); border-color: #9A7420; border-radius: 6px; box-shadow: inset 0 1px 0 #FFFFFF; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: linear-gradient(180deg, #FFF1CF 0, #FBE6B5 100%); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: linear-gradient(180deg, #FFF1CF 0, #FBE6B5 100%); }
.tile-label { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-size: 11.5px; font-synthesis: none; overflow: clip; overflow-clip-margin: 3px; }
/* the base drop shadow paints grey into the empty corners of an arch plate on a light tile */
.tile-icon, .app-tile:hover .tile-icon { filter: var(--tile-icon-fx); }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, linear-gradient(180deg, #2C4A7A 0, #1B3157 100%);
  border-top-color: #D9B44A;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 400; font-style: normal; font-synthesis: none; letter-spacing: 0.3px; color: #FBF4E2; margin-right: 90px; }
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

<path d='M3 17.4 Q13 14 19 3.4 M3 14.2 Q10.4 11.4 15 3.4 M3 11 Q8 9 11 3.4' fill='none' stroke='rgb(217,180,74)' stroke-width='0.9' stroke-linecap='round'/>
<path d='M81 17.4 Q71 14 65 3.4 M81 14.2 Q73.6 11.4 69 3.4 M81 11 Q76 9 73 3.4' fill='none' stroke='rgb(217,180,74)' stroke-width='0.9' stroke-linecap='round'/>
<rect x='27' y='15.2' width='30' height='3.4' fill='rgb(217,180,74)' stroke='rgb(104,18,17)' stroke-width='0.5'/><rect x='30.4' y='11.8' width='23.2' height='3.4' fill='rgb(217,180,74)' stroke='rgb(104,18,17)' stroke-width='0.5'/><rect x='33.8' y='8.4' width='16.4' height='3.4' fill='rgb(217,180,74)' stroke='rgb(104,18,17)' stroke-width='0.5'/><rect x='37.2' y='5' width='9.600000000000001' height='3.4' fill='rgb(217,180,74)' stroke='rgb(104,18,17)' stroke-width='0.5'/><rect x='41.3' y='2' width='1.4' height='3' fill='rgb(217,180,74)' stroke='rgb(104,18,17)' stroke-width='0.4'/>
<rect x='40.2' y='5.4' width='3.6' height='2.4' fill='rgb(240,207,122)'/><rect x='38' y='8.8' width='8' height='0.8' fill='rgb(104,18,17)'/><rect x='34' y='12.2' width='16' height='0.8' fill='rgb(104,18,17)'/>
<rect x='24' y='18.6' width='36' height='0.9' fill='rgb(240,207,122)'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='0' width='24' height='1' fill='rgb(154,116,32)'/>
<path d='M1 8 V6 H3 V4 H5 V2.4 H7 V4 H9 V6 H11 V8 Z' fill='rgb(251,244,226)' stroke='rgb(154,116,32)' stroke-width='0.8' stroke-linejoin='round'/>
<path d='M13 8 V6 H15 V4 H17 V2.4 H19 V4 H21 V6 H23 V8 Z' fill='rgb(251,244,226)' stroke='rgb(154,116,32)' stroke-width='0.8' stroke-linejoin='round'/>
<rect x='0' y='8' width='24' height='1' fill='rgb(142,28,26)'/><rect x='5.2' y='3' width='1.6' height='1.4' fill='rgb(142,28,26)'/><rect x='17.2' y='3' width='1.6' height='1.4' fill='rgb(142,28,26)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='0' y='0' width='8' height='24' fill='rgb(226,214,184)'/><rect x='0' y='0' width='1' height='24' fill='rgb(154,116,32)'/><rect x='7' y='0' width='1' height='24' fill='rgb(154,116,32)'/>
<rect x='2.2' y='0' width='0.6' height='24' fill='rgb(154,116,32)'/><rect x='5.2' y='0' width='0.6' height='24' fill='rgb(154,116,32)'/>
<path d='M4 8.6 L6.6 12 L4 15.4 L1.4 12 Z' fill='rgb(142,28,26)' stroke='rgb(154,116,32)' stroke-width='0.7' stroke-linejoin='round'/><circle cx='4' cy='12' r='0.8' fill='rgb(240,207,122)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect x='0' y='0' width='8' height='8' fill='rgb(142,28,26)'/><rect x='0' y='0' width='8' height='8' fill='none' stroke='rgb(154,116,32)' stroke-width='1'/>
<path d='M0.6 7.4 V0.6 H7.4' fill='none' stroke='rgb(217,180,74)' stroke-width='1.2'/>
<path d='M1 7 A6 6 0 0 1 7 1' fill='none' stroke='rgb(240,207,122)' stroke-width='0.6'/><circle cx='4.2' cy='4.2' r='1.5' fill='rgb(217,180,74)' stroke='rgb(104,18,17)' stroke-width='0.5'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='0' width='24' height='1.2' fill='rgb(217,180,74)'/><rect x='0' y='1.2' width='24' height='0.5' fill='rgb(154,116,32)'/>
<path d='M6 4.6 L8 2.8 L10 4.6 L8 6.4 Z M18 4.6 L20 2.8 L22 4.6 L20 6.4 Z' fill='rgb(217,180,74)'/><rect x='11' y='4.2' width='6' height='0.8' fill='rgb(154,116,32)'/><rect x='0' y='4.2' width='5' height='0.8' fill='rgb(154,116,32)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>

<path d='M2 24 Q40 -2 82 14' fill='none' stroke='rgb(86,126,184)' stroke-width='0.9' stroke-dasharray='1.4 2.6' stroke-linecap='round'/>
<rect x='3' y='29' width='14' height='5' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='5' y='24' width='10' height='5' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='7' y='19' width='6' height='5' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='9.3' y='15' width='1.4' height='4' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.4'/><rect x='18' y='29.8' width='12' height='4.2' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='19.6' y='25.6' width='8.8' height='4.2' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='21.2' y='21.4' width='5.6' height='4.2' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='22.8' y='17.2' width='2.3999999999999986' height='4.2' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='23.3' y='14.2' width='1.4' height='3' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.4'/>
<rect x='63' y='29.6' width='14' height='4.4' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='65' y='25.2' width='10' height='4.4' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='67' y='20.8' width='6' height='4.4' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='69' y='16.4' width='2' height='4.4' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='69.3' y='11.4' width='1.4' height='5' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.4'/><rect x='76' y='29.4' width='8' height='4.6' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='77.2' y='24.8' width='5.6' height='4.6' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='78.4' y='20.2' width='3.2' height='4.6' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.5'/><rect x='79.3' y='18.2' width='1.4' height='2' fill='rgb(27,49,87)' stroke='rgb(16,30,58)' stroke-width='0.4'/>
<path d='M32 34 V26 Q32 16.4 46 16.4 Q60 16.4 60 26 V34 Z' fill='rgb(217,180,74)' stroke='rgb(154,116,32)' stroke-width='0.8'/>
<path d='M36 34 V26.4 Q36 20 46 20 Q56 20 56 26.4 V34' fill='none' stroke='rgb(154,116,32)' stroke-width='0.7'/>
<rect x='45.2' y='10.6' width='1.6' height='5.8' fill='rgb(217,180,74)'/><circle cx='46' cy='10' r='1.4' fill='rgb(240,207,122)'/>
<rect x='30' y='33' width='32' height='1' fill='rgb(240,207,122)'/>
<circle cx='52' cy='6' r='0.7' fill='rgb(251,244,226)'/><circle cx='18' cy='7' r='0.6' fill='rgb(251,244,226)'/><circle cx='63' cy='5' r='0.6' fill='rgb(86,126,184)'/><circle cx='38' cy='4' r='0.6' fill='rgb(86,126,184)'/><circle cx='6' cy='14' r='0.6' fill='rgb(86,126,184)'/>
<g fill='rgb(240,207,122)'><rect x='10.2' y='24' width='1' height='1' fill='rgb(240,207,122)'/><rect x='24' y='22' width='1' height='1' fill='rgb(240,207,122)'/><rect x='70' y='21' width='1' height='1' fill='rgb(240,207,122)'/><rect x='80' y='24' width='1' height='1' fill='rgb(240,207,122)'/></g>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>

<rect x='2' y='19.4' width='18' height='1.8' fill='rgb(217,180,74)' stroke='rgb(154,116,32)' stroke-width='0.5'/><rect x='3.4' y='17.8' width='15.2' height='1.6' fill='rgb(240,207,122)' stroke='rgb(154,116,32)' stroke-width='0.5'/>
<rect x='4.6' y='11.6' width='1.8' height='6.2' fill='rgb(217,180,74)'/><rect x='8.2' y='11.6' width='1.8' height='6.2' fill='rgb(217,180,74)'/><rect x='12' y='11.6' width='1.8' height='6.2' fill='rgb(217,180,74)'/><rect x='15.6' y='11.6' width='1.8' height='6.2' fill='rgb(217,180,74)'/>
<rect x='3.4' y='9.8' width='15.2' height='1.8' fill='rgb(240,207,122)' stroke='rgb(154,116,32)' stroke-width='0.5'/>
<path d='M5.2 9.8 Q5.2 3.4 11 3.4 Q16.8 3.4 16.8 9.8 Z' fill='rgb(217,180,74)' stroke='rgb(154,116,32)' stroke-width='0.7'/><path d='M7.4 8.6 Q7.4 5.4 10 4.8' fill='none' stroke='rgb(240,207,122)' stroke-width='0.8' stroke-linecap='round'/>
<rect x='10.4' y='0.8' width='1.2' height='2.8' fill='rgb(240,207,122)'/><circle cx='11' cy='0.9' r='0.9' fill='rgb(240,207,122)'/>
</svg>
```

### 1.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | republic-glow (title) | removed |
| 2 | banner-glow (banner icon) | removed |
| 3 | force-nexus (panno) | removed |
| 4 | republic-breathe (readout) | removed |
| 5 | republic-force (`#app`) | removed |
| 6 | republic-starfield (`#particles`) | removed |
| hover | tile-radial .55s | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite star-wars-republic.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 1.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** `linear-gradient(180deg, #FFFCF3, #F3ECDB)`, border `#9A7420` (1 px; 3.49:1 on the grid ground), radius 6px, `box-shadow: inset 0 1px 0 #FFFFFF`, `::before` off; layout unchanged. Icons: `brightness(0.8) saturate(1.05)` through the shaped plate (D in 3).
- **Hover:** `linear-gradient(180deg, #FFF1CF, #FBE6B5)`, border `#8E1C1A` (7.33:1 on the hover fill), `box-shadow: inset 0 -3px 0 #D9B44A`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (7.53:1 on the tile, 7.21:1 on the grid ground). **Pressed:** base scale 0.96 on `linear-gradient(180deg, #FFF1CF, #FBE6B5)`.
- **Label:** `#2A2118`, **Jost 400**, 11.5 px, 0.1 px, user case.
- **Filter chip:** base rule (fill `#FFF1CF`, `--accent-c` border, `#8E1C1A` text). The header scene hides while it shows.
- **Edit bar:** `#F6DEDA` fill, `#8E1C1A` rule, label `#8E1C1A`; `+ FILE` and `+ INSTALLED` in `--text` with a `#9A7420` border, `DONE` in `#8E1C1A` with a `#8E1C1A` border. The tile remove button is `#8E1C1A` with a `#2A2118` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#EFE7D6`, panel `#F8F2E5`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#8E1C1A` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#1B3157` text on `#E6EDF7` with a `#2C4A7A` rule.

### 1.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite star-wars-republic.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#D9B44A`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **138.52**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#2C4A7A` to `#1B3157` gradient with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 3 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as the Senate rotunda (a brass dome) at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#8E1C1A` border and `inset 0 -3px 0 #D9B44A`, the hover fill, the shaped plate with no cropped glyph, no ellipsis on CALCULATOR (mock 49.8 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): brass on the crimson header and the blue banner only (header line, art, banner trim) and bronze on ivory; crimson for the header, hover border, values, edit mode and the remove button; blue for the ring, sliders and the banner; no violet, no magenta, no green, no orange.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 8 px, banner 4 px; at 640 x 420 10 / 8 / 10.05 px; at 1024 x 700 10 / 8 / 10.05 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Cinzel` (title) and `Jost` (everything else); a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 3** (title and banner text covered; my read of a render, not a fan test). What survives: an ivory window with crimson and brass trim, deco pilasters, a stepped ziggurat between curved rings in the header, a Senate rotunda in a skyline of stepped towers in the banner. What is missing for a 5: the Republic cog and the clone-armour palette (marks and character design, not drawn) and the saga type; the light window is a deliberate break from the other five, and a fan names it by the Coruscant skyline rather than by a single object.

Watch items for this theme: (1) **The one light window.** It is bright next to the five dark ones and next to every other dark theme in the skin list. Lever if Sergei finds it too bright: ground `#EFE7D6` to `#E3D9C2` and tile top `#FFFCF3` to `#FAF4E4` (the ratios stay above 4.5:1 for the text pairs). (2) The header buttons, hover rules and the settings arrow are rewritten for a crimson header and a light ground (the 2001 and promise-mascot precedent); a later base change to `button:hover` or the filter chip should be checked here first. (3) Near-white app icons (the foobar2000 file icon) turn light grey on the ivory tile because the fx filter darkens by 20 percent; their dark marks still read. Lever: `brightness(0.86)` and a darker pressed fill. (4) The first banner icon was five stepped towers on a base; at 1x it read as a **crown**. It is the rotunda now (0.2).

---

## 2. star-wars-separatist (STAR WARS: SEPARATISTS): DONE

**Audit:** score 2, redraw. No droid tan anywhere: a blue-black terminal with grey caps. Faint schematic lines and dots sat behind the tiles, "ROGER ROGER / ARMY ONLINE" printed down the right column, a control-sectors line ran under the BROWSER row, "ROGER ROGER" repeated in the header and banner. Icons were plain rounded squares. Six infinite animations.
**Direction:** droid tan as the plating. The header is a tan plate (`#C69A5B` to `#B58A4D`) with dark type, the field is dark steel (`#14171B`), tiles are steel with a tan top edge, CIS blue is the hover and the update bar, dull red is the edit bar. The material is plating: a trapezoid plate course along the top with a rivet in each, plate seams down both sides with a hexagonal perforation every 24 px, angular brackets in the corners. The header carries a honeycomb strip (Geonosian hive cells; a few lit blue); the banner carries a squad of four droid busts marching away (a visor band with a blue slit, a ribbed neck, a segmented chest) beside a cluster of three cells, and its icon is that cluster. One window, two cut corners (top left and bottom right), heavy and trapezoidal. No schematic, no "Roger roger" except as a verified banner line, no Aurebesh. Static.

### 2.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
  --overlay-clip: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
  --bg: #14171B;
  --panel-bg: #1B2026;
  --overlay-bg: #14171B;
  --header-bg: #C69A5B;
  --font: Jost, 'Segoe UI', Arial, sans-serif;
  --text: #E8E2D6;
  --text-dim: #B4B9BF;
  --accent-c: #C69A5B;
  --accent-m: #F08A8A;
  --accent-y: #C69A5B;
  --accent-text: #DDB77C;
  --border: #5C6B78;
  --border-h: #C69A5B;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #C69A5B;
  --title-anim: none;
  --tile-hover-bg: #17303F;
  --tile-hover-border: #4BB0DC;
  --tile-hover-shadow: inset 0 2px 0 #4BB0DC;
  --tile-active-bg: #1B3A4C;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.2) saturate(0.9);
  --tile-icon-shape: polygon(24% 0, 100% 0, 100% 76%, 76% 100%, 0 100%, 0 24%);
  --tile-label-spacing: 0.1px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #E3C68E;
  --btn-active-bg: #EBD4A8;
  --drop-hint-border: #4A5560;
  --drop-icon-color: #8A7550;
  --hint-sub-color: #B4B9BF;
  --rename-dashed: #C69A5B;
  --rename-input-bg: #17303F;
  --edit-bar-bg: #2A1214;
  --edit-bar-border: #9A3A3A;
  --edit-label-color: #F08A8A;
  --edit-label-glow: none;
  --btn-done-color: #F08A8A;
  --btn-done-border: #9A3A3A;
  --btn-done-hover-bg: #431A1C;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A8794;
  --update-bg: #17303F;
  --update-border: #4BB0DC;
  --update-color: #DDB77C;
  --update-btn-border: #4BB0DC;
  --update-btn-hover-bg: #1B3A4C;
  --update-btn-hover-glow: none;
  --btn-close-color: #DDB77C;
  --btn-close-border: #C69A5B;
  --btn-close-hover-bg: #2A323B;
  --btn-close-hover-glow: none;
  --picker-search-bg: #17303F;
  --picker-item-hover-bg: #17303F;
  --picker-item-active-bg: #1B3A4C;
  --picker-placeholder-bg: #17303F;
  --skin-btn-active-bg: #1B3A4C;
  --remove-btn-bg: #8E3030;
  --remove-btn-border: #F08A8A;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#E8E2D6` on `#14171B` | 4.5:1 | **13.94:1** |
| `--text-dim` on `--bg` | `#B4B9BF` on `#14171B` | 4.5:1 | **9.10:1** |
| `--accent-c` on `--bg` | `#C69A5B` on `#14171B` | 3:1 | **7.00:1** |
| `--accent-text` on `--bg` | `#DDB77C` on `#14171B` | 3:1 | **9.54:1** |
| `--hint-sub-color` on `--bg` | `#B4B9BF` on `#14171B` | 4.5:1 | **9.10:1** |
| `--btn-close-color` on `--panel-bg` | `#DDB77C` on `#1B2026` | 4.5:1 | **8.69:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the worst stop** (the lightest stop for light text, and for the dark ink on the tan header the **darkest** tan stop), except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E8E2D6` on `#1D232A` | 4.5:1 | **12.28:1** |
| Tile label on tile hover | `#E8E2D6` on `#17303F` | 4.5:1 | **10.63:1** |
| Tile label on tile pressed (pressed state) | `#E8E2D6` on `#1B3A4C` | 4.5:1 | **9.27:1** |
| Title on header | `#1A1D21` on `#B58A4D` | 4.5:1 | **5.40:1** |
| Title dot (`.accent`) on header | `#4A1414` on `#B58A4D` | 4.5:1 | **4.79:1** |
| Header version on header | `#2E2010` on `#B58A4D` | 4.5:1 | **5.04:1** |
| Header button glyph on header | `#1A1D21` on `#B58A4D` | 4.5:1 | **5.40:1** |
| Header button glyph on button hover | `#14171B` on `#E3C68E` | 4.5:1 | **10.90:1** |
| Filter chip text on chip | `#DDB77C` on `#17303F` | 4.5:1 | **7.28:1** |
| Filter chip clear glyph on hover on chip | `#FFFFFF` on `#17303F` | 4.5:1 | **13.72:1** |
| Banner text on banner | `#E8E2D6` on `#1B2026` | 4.5:1 | **12.71:1** |
| Header line on header (non-text) | `#23282E` on `#B58A4D` | 3:1 | **4.74:1** |
| Edit label on edit bar | `#F08A8A` on `#2A1214` | 4.5:1 | **7.29:1** |
| Done / close button text on edit bar | `#F08A8A` on `#2A1214` | 4.5:1 | **7.29:1** |
| + FILE / + INSTALLED text on edit bar | `#E8E2D6` on `#2A1214` | 4.5:1 | **13.62:1** |
| Done button text on its hover fill | `#F08A8A` on `#431A1C` | 4.5:1 | **6.21:1** |
| Settings text on overlay | `#E8E2D6` on `#14171B` | 4.5:1 | **13.94:1** |
| Settings text on panel | `#E8E2D6` on `#1B2026` | 4.5:1 | **12.71:1** |
| Settings label (text-dim) on panel | `#B4B9BF` on `#1B2026` | 4.5:1 | **8.30:1** |
| Settings value / cheat key (accent-text) on panel | `#DDB77C` on `#1B2026` | 4.5:1 | **8.69:1** |
| Settings version value (accent-text) on panel | `#DDB77C` on `#1B2026` | 4.5:1 | **8.69:1** |
| Settings CLOSE text on panel | `#DDB77C` on `#1B2026` | 4.5:1 | **8.69:1** |
| Settings CLOSE text on its hover fill | `#DDB77C` on `#2A323B` | 4.5:1 | **6.89:1** |
| Hotkey error text (accent-m) on panel | `#F08A8A` on `#1B2026` | 4.5:1 | **6.80:1** |
| Hotkey input text on input fill | `#DDB77C` on `#17303F` | 4.5:1 | **7.28:1** |
| Picker row text on hover fill | `#DDB77C` on `#17303F` | 4.5:1 | **7.28:1** |
| Update banner text on update bar | `#DDB77C` on `#17303F` | 4.5:1 | **7.28:1** |
| Update button text on hover fill | `#FFFFFF` on `#1B3A4C` | 4.5:1 | **11.96:1** |
| Drop-hint text (text-dim) on grid ground | `#B4B9BF` on `#14171B` | 4.5:1 | **9.10:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#8E3030` | 3:1 | **8.03:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#8E3030` | 3:1 | **8.03:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#C69A5B` on `#1D232A` | 3:1 | **6.16:1** |
| Focus ring on grid ground (non-text) | `#C69A5B` on `#14171B` | 3:1 | **7.00:1** |
| Hover border on grid ground (non-text) | `#4BB0DC` on `#14171B` | 3:1 | **7.31:1** |
| Hover border on hover fill (non-text) | `#4BB0DC` on `#17303F` | 3:1 | **5.58:1** |
| Theme-picker selected row text (accent-text) on active fill | `#DDB77C` on `#1B3A4C` | 4.5:1 | **6.34:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#DDB77C` on `#17303F` | 4.5:1 | **7.28:1** |
| Skin search input text (accent-text) on panel | `#DDB77C` on `#1B2026` | 4.5:1 | **8.69:1** |
| Apps-picker search input text (accent-text) on search fill | `#DDB77C` on `#17303F` | 4.5:1 | **7.28:1** |
| Rename input text (accent-text) on input fill | `#DDB77C` on `#17303F` | 4.5:1 | **7.28:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#B4B9BF` on `#17303F` | 4.5:1 | **6.94:1** |
| Skin search placeholder (text-dim, themed) on panel | `#B4B9BF` on `#1B2026` | 4.5:1 | **8.30:1** |
| Apps-picker placeholder (text-dim) on search fill | `#B4B9BF` on `#17303F` | 4.5:1 | **6.94:1** |
| Hotkey recording text (accent-m) on input fill | `#F08A8A` on `#17303F` | 4.5:1 | **5.69:1** |
| Update dismiss glyph (text-dim) on update bar | `#B4B9BF` on `#17303F` | 4.5:1 | **6.94:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#B4B9BF` on `#1B2026` | 3:1 | **8.30:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#C69A5B` on `#1B2026` | 3:1 | **6.38:1** |
| Tile border on grid ground (non-text) | `#5C6B78` on `#14171B` | 3:1 | **3.28:1** |
| Hover border (CIS blue) on tile hover fill (non-text) | `#4BB0DC` on `#17303F` | 3:1 | **5.58:1** |

**Lowest ratio in this theme: 4.79:1 (Title dot (`.accent`) on header).** Lowest text ratio: 4.79:1 (Title dot (`.accent`) on header). Lowest non-text ratio: 3.28:1 (Tile border on grid ground (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | First stop (top) | Last stop (bottom) |
|---|---|---|
| Header | `#C69A5B` | `#B58A4D` |
| Tile at rest | `#1D232A` | `#1D232A` |
| Tile hover and focus | `#17303F` | `#17303F` |
| Tile pressed | `#1B3A4C` | `#1B3A4C` |
| Banner | `#1B2026` | `#1B2026` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.2) saturate(0.9)`; mock plates from the gallery; the columns name the **worst stop** of each tile surface):

| Icon plate (mock) | After fx | Rest `#1D232A` | Hover `#17303F` | Pressed `#1B3A4C` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#7198C2` | 5.26:1 | 4.55:1 | 3.97:1 | pass |
| Calculator `#6b6f76` | `#81858D` | 4.28:1 | 3.71:1 | 3.23:1 | pass |
| Paint `#b07a4f` | `#CE9365` | 6.02:1 | 5.22:1 | 4.55:1 | pass |
| Terminal `#3d4450` | `#4A525E` | 2.01:1 | 1.74:1 | 1.51:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#64A4A5` | 5.58:1 | 4.83:1 | 4.21:1 | pass |
| Files `#c09a3e` | `#E2B956` | 8.53:1 | 7.39:1 | 6.44:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.23:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: The header is the only light surface in a dark theme, like persona-4's yellow header: its text, version, buttons and chip are redrawn for a tan ground (a rule block in 3). Dark ink `#1A1D21` on the **darkest** tan stop (the worst case for dark text) is 5.40:1; the title dot is dark red `#4A1414` (4.79:1) and the version line dark brown `#2E2010` (5.04:1), both on that stop. Tan `#C69A5B` is `--accent-c`; `--accent-text` is the lighter tan `#DDB77C` for small text on the dark field. CIS blue `#4BB0DC` is the hover border (a lighter step of the audit's `#2A7FA8`, which is 3.07:1 on the hover fill, borderline), dull red `#9A3A3A` only on the edit bar and the remove button.

### 2.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | Jost, 'Segoe UI', Arial, sans-serif |
| `#title` | **Jost 500** (bundled), 11 px, tracking 4 px, uppercase from the markup, `font-synthesis: none`, `line-height: 1.2`, dark ink on the tan plate |
| `.tile-label` | **Jost 400**, 11.5 px, 0.1 px, user case; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | **Jost 400**, 12 px, 0.5 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 141.91** (gate 156; 14.1 px under, 26.1 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700 and at 1x, 1.5x and 2x. The six standard labels in the 100 px box (ink widths): NOTEPAD 43.2, CALCULATOR 49.8, PAINT 23.8, TERMINAL 41.0, BROWSER 39.3, FILES 22.4 px, no ellipsis; the long names "Visual Studio 2022" 96, "Notepad++ x64" 80, "7-Zip 23.01" 57, "Калькулятор" 63 and "Жёсткий диск" 71 px fit, and "Проводник Windows" (108 px) ellipsizes (the base 100 px box, offer b of B4R). Tile height 94.80 px (94.7 to 95.4 required) at every scale. Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; positive control (a 6 px line height cuts the tails): **239 px**. **Platform fonts the mock used:** title Jost (web) x12; labels Jost (web) x7; banner Jost (web) x28; version and settings Jost (web) x7. Expected `fontsRendered` for the web faces: `Jost`.

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Jost has Cyrillic (checked: "Калькулятор", "Жёсткий диск").

### 2.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #C69A5B 0, #B58A4D 100%); border-bottom-color: #23282E; box-shadow: inset 0 -2px 0 #23282E; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #23282E; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a honeycomb strip: twelve flat-top hexagon cells in two interleaved rows, filled steel, ink, dark tan and two CIS blue, on the tan plate. Painted pixels at x 168.6 to 252.0, y 12.0 to 28.0. Hidden while the chip shows. The title ends at x 141.9, the scene starts at x 168: 26.1 px clear. The header text, version and buttons are redrawn for this ground in the rules block (the three lines after `#title .accent`).

**B. Frame (the kit of 0.3).** plate seams 8 px wide in dark tan with steel edges and a hexagonal perforation (ink with a pale tan rim and a blue core) every 24 px; the top course is a tan rule over a row of trapezoid plates, each with a rivet, on a steel base line; each corner is an angular tan bracket with a blue pin. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 11 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700); at Sergei's 1.5x the smallest art-to-ring gap is 3.33 css px.

**C. Banner.** the banner is the flat steel `#1B2026` with a tan top border; its top course is a tan rule over a row of hexagon outlines joined by short steel bars; the icon is **three cells** of a honeycomb (tan, dark tan with a blue core, steel with a tan core); the right end is **a squad of four droid busts** (tan, shrinking with distance) on a steel floor line beside a cluster of three cells with a blue core. The motif's painted pixels are at x 331.0 to 412.0, y 266.4 to 299.9 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 81.2 px (0.8). The banner row of the probe reads 4 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: a polygon with two cut corners: top left and bottom right, 12 px (`--overlay-clip` is the same value); every content corner is tested against it. Tiles: steel cards (`#1D232A`) with a 1 px steel border and a 2 px tan top edge (`inset 0 2px 0`), square corners; hover turns the border and the top edge CIS blue and the fill deep blue; the plate has the same two cuts as the window, 24 percent at top left and bottom right: `polygon(24% 0, 100% 0, 100% 76%, 76% 100%, 0 100%, 0 24%)`. Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 11.06, Calculator 9.47, Paint 11.13, Terminal 7.35, Browser 11.63, Files 8.41 (smallest 7.35); nothing is cropped. **Real icons** (B5R F1): the share of the plate lost to the cut, drop shadow off, cut against uncut: GlideX 4.98%, foobar2000 file icon 1.2%, QuickLaunch icon 1.08%, BlueStacks 0%, BlueStacks logo 0%, Android Studio 0%; every mark whole at 6x (corners of a full-bleed background only).

**Trademark note.** The CIS emblem, the Trade Federation and Techno Union marks, Aurebesh, and any specific droid model sheet (the B1 head is drawn as a generic long visor face) are not drawn. The cells, plates and busts are generic.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #8E3030; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { background: linear-gradient(180deg, #C69A5B 0, #B58A4D 100%); border-bottom-color: #23282E; box-shadow: inset 0 -2px 0 #23282E; }
#header::before { background: #23282E; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-weight: 500; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 11px; letter-spacing: 4px; color: #1A1D21; text-shadow: none; }
#title .accent { color: #4A1414; }
#header-version { color: #2E2010; }
#header-controls button { color: #1A1D21; border-color: #7A5A2E; }
#header-controls button:hover { background: #E3C68E; border-color: #1A1D21; color: #14171B; }

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

/* tiles */
.app-tile { background: #1D232A; border-color: #5C6B78; border-radius: 0px; box-shadow: inset 0 2px 0 #C69A5B; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: #17303F; border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: #1B3A4C; }
.tile-label { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-size: 11.5px; font-synthesis: none; overflow: clip; overflow-clip-margin: 3px; }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, #1B2026;
  border-top-color: #C69A5B;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Jost, 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 400; font-style: normal; font-synthesis: none; letter-spacing: 0.5px; color: #E8E2D6; margin-right: 90px; }
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
<path d='M9.4 5.93 L7.3 9.57 L3.1 9.57 L1 5.93 L3.1 2.29 L7.3 2.29 Z' fill='rgb(42,50,58)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M16.45 14.07 L14.35 17.71 L10.15 17.71 L8.05 14.07 L10.15 10.43 L14.35 10.43 Z' fill='rgb(26,29,33)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M23.5 5.93 L21.4 9.57 L17.2 9.57 L15.1 5.93 L17.2 2.29 L21.4 2.29 Z' fill='rgb(96,70,36)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M30.55 14.07 L28.45 17.71 L24.25 17.71 L22.15 14.07 L24.25 10.43 L28.45 10.43 Z' fill='rgb(42,50,58)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M37.6 5.93 L35.5 9.57 L31.3 9.57 L29.2 5.93 L31.3 2.29 L35.5 2.29 Z' fill='rgb(42,127,168)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M44.65 14.07 L42.55 17.71 L38.35 17.71 L36.25 14.07 L38.35 10.43 L42.55 10.43 Z' fill='rgb(26,29,33)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M51.7 5.93 L49.6 9.57 L45.4 9.57 L43.3 5.93 L45.4 2.29 L49.6 2.29 Z' fill='rgb(150,112,60)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M58.75 14.07 L56.65 17.71 L52.45 17.71 L50.35 14.07 L52.45 10.43 L56.65 10.43 Z' fill='rgb(42,50,58)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M65.8 5.93 L63.7 9.57 L59.5 9.57 L57.4 5.93 L59.5 2.29 L63.7 2.29 Z' fill='rgb(26,29,33)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M72.85 14.07 L70.75 17.71 L66.55 17.71 L64.45 14.07 L66.55 10.43 L70.75 10.43 Z' fill='rgb(96,70,36)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M79.9 5.93 L77.8 9.57 L73.6 9.57 L71.5 5.93 L73.6 2.29 L77.8 2.29 Z' fill='rgb(42,50,58)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/><path d='M86.95 14.07 L84.85 17.71 L80.65 17.71 L78.55 14.07 L80.65 10.43 L84.85 10.43 Z' fill='rgb(42,127,168)' stroke='rgb(26,29,33)' stroke-width='0.6' stroke-linejoin='round'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='0' width='24' height='1' fill='rgb(232,205,150)'/><rect x='0' y='1' width='24' height='0.6' fill='rgb(150,112,60)'/>
<path d='M1 2.2 H11 L9.4 7.4 H2.6 Z' fill='rgb(150,112,60)' stroke='rgb(96,70,36)' stroke-width='0.6' stroke-linejoin='round'/><path d='M13 2.2 H23 L21.4 7.4 H14.6 Z' fill='rgb(150,112,60)' stroke='rgb(96,70,36)' stroke-width='0.6' stroke-linejoin='round'/>
<circle cx='6' cy='4.4' r='0.9' fill='rgb(232,205,150)' stroke='rgb(96,70,36)' stroke-width='0.4'/><circle cx='18' cy='4.4' r='0.9' fill='rgb(232,205,150)' stroke='rgb(96,70,36)' stroke-width='0.4'/><rect x='0' y='8' width='24' height='1' fill='rgb(92,107,120)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='0' y='0' width='8' height='24' fill='rgb(27,32,38)'/><rect x='0' y='0' width='1' height='24' fill='rgb(92,107,120)'/><rect x='7' y='0' width='1' height='24' fill='rgb(92,107,120)'/><rect x='1' y='0' width='6' height='24' fill='rgb(96,70,36)'/><rect x='1' y='0' width='6' height='1.2' fill='rgb(150,112,60)'/><rect x='1' y='22.8' width='6' height='1.2' fill='rgb(150,112,60)'/>
<path d='M6.6 12 L5.3 14.25 L2.7 14.25 L1.4 12 L2.7 9.75 L5.3 9.75 Z' fill='rgb(26,29,33)' stroke='rgb(232,205,150)' stroke-width='0.7' stroke-linejoin='round'/><path d='M5.2 12 L4.6 13.04 L3.4 13.04 L2.8 12 L3.4 10.96 L4.6 10.96 Z' fill='rgb(42,127,168)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect x='0' y='0' width='8' height='8' fill='rgb(27,32,38)'/><path d='M0.6 7.4 V0.6 H7.4 V2.6 H2.6 V7.4 Z' fill='rgb(198,154,91)' stroke='rgb(96,70,36)' stroke-width='0.5' stroke-linejoin='round'/><rect x='4.3' y='4.3' width='2' height='2' fill='rgb(42,127,168)'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='0' width='24' height='1.2' fill='rgb(198,154,91)'/><rect x='0' y='1.2' width='24' height='0.5' fill='rgb(96,70,36)'/>
<path d='M8.4 4.4 L7.2 6.48 L4.8 6.48 L3.6 4.4 L4.8 2.32 L7.2 2.32 Z' fill='none' stroke='rgb(150,112,60)' stroke-width='0.7' stroke-linejoin='round'/><path d='M20.4 4.4 L19.2 6.48 L16.8 6.48 L15.6 4.4 L16.8 2.32 L19.2 2.32 Z' fill='none' stroke='rgb(150,112,60)' stroke-width='0.7' stroke-linejoin='round'/><rect x='10' y='4' width='4' height='0.8' fill='rgb(92,107,120)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>

<g transform='translate(15 14.5) scale(1.45)'>
<path d='M0 -9.4 Q-3.4 -7.8 -3.4 -3 Q-3.4 2.6 -1.3 7.2 H1.3 Q3.4 2.6 3.4 -3 Q3.4 -7.8 0 -9.4 Z' fill='rgb(198,154,91)' stroke='rgb(96,70,36)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M-3.1 -3.8 Q0 -5.4 3.1 -3.8 V-0.4 Q0 -1.6 -3.1 -0.4 Z' fill='rgb(26,29,33)'/><path d='M-2.4 -2.5 H-0.6 M0.6 -2.5 H2.4' stroke='rgb(75,176,220)' stroke-width='0.8' stroke-linecap='round'/>
<path d='M-1.6 3.2 H1.6 M-1.2 5 H1.2' stroke='rgb(96,70,36)' stroke-width='0.5'/><path d='M0 -9.2 V-5.6' stroke='rgb(96,70,36)' stroke-width='0.5'/>
<rect x='-1.2' y='7.2' width='2.4' height='2' fill='rgb(26,29,33)'/><path d='M-1 7.4 V9 M0 7.4 V9 M1 7.4 V9' stroke='rgb(92,107,120)' stroke-width='0.35'/>
<path d='M-5.4 13 Q-5.4 9.2 -2.2 9.2 H2.2 Q5.4 9.2 5.4 13 Z' fill='rgb(198,154,91)' stroke='rgb(96,70,36)' stroke-width='0.6' stroke-linejoin='round'/><path d='M-3.6 10.8 H3.6 M-3 12.2 H3' stroke='rgb(96,70,36)' stroke-width='0.4'/></g><g transform='translate(33 18.2) scale(1.15)'>
<path d='M0 -9.4 Q-3.4 -7.8 -3.4 -3 Q-3.4 2.6 -1.3 7.2 H1.3 Q3.4 2.6 3.4 -3 Q3.4 -7.8 0 -9.4 Z' fill='rgb(198,154,91)' stroke='rgb(96,70,36)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M-3.1 -3.8 Q0 -5.4 3.1 -3.8 V-0.4 Q0 -1.6 -3.1 -0.4 Z' fill='rgb(26,29,33)'/><path d='M-2.4 -2.5 H-0.6 M0.6 -2.5 H2.4' stroke='rgb(75,176,220)' stroke-width='0.8' stroke-linecap='round'/>
<path d='M-1.6 3.2 H1.6 M-1.2 5 H1.2' stroke='rgb(96,70,36)' stroke-width='0.5'/><path d='M0 -9.2 V-5.6' stroke='rgb(96,70,36)' stroke-width='0.5'/>
<rect x='-1.2' y='7.2' width='2.4' height='2' fill='rgb(26,29,33)'/><path d='M-1 7.4 V9 M0 7.4 V9 M1 7.4 V9' stroke='rgb(92,107,120)' stroke-width='0.35'/>
<path d='M-5.4 13 Q-5.4 9.2 -2.2 9.2 H2.2 Q5.4 9.2 5.4 13 Z' fill='rgb(198,154,91)' stroke='rgb(96,70,36)' stroke-width='0.6' stroke-linejoin='round'/><path d='M-3.6 10.8 H3.6 M-3 12.2 H3' stroke='rgb(96,70,36)' stroke-width='0.4'/></g><g transform='translate(47 21.3) scale(0.9)'>
<path d='M0 -9.4 Q-3.4 -7.8 -3.4 -3 Q-3.4 2.6 -1.3 7.2 H1.3 Q3.4 2.6 3.4 -3 Q3.4 -7.8 0 -9.4 Z' fill='rgb(150,112,60)' stroke='rgb(96,70,36)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M-3.1 -3.8 Q0 -5.4 3.1 -3.8 V-0.4 Q0 -1.6 -3.1 -0.4 Z' fill='rgb(26,29,33)'/><path d='M-2.4 -2.5 H-0.6 M0.6 -2.5 H2.4' stroke='rgb(75,176,220)' stroke-width='0.8' stroke-linecap='round'/>
<path d='M-1.6 3.2 H1.6 M-1.2 5 H1.2' stroke='rgb(96,70,36)' stroke-width='0.5'/><path d='M0 -9.2 V-5.6' stroke='rgb(96,70,36)' stroke-width='0.5'/>
<rect x='-1.2' y='7.2' width='2.4' height='2' fill='rgb(26,29,33)'/><path d='M-1 7.4 V9 M0 7.4 V9 M1 7.4 V9' stroke='rgb(92,107,120)' stroke-width='0.35'/>
<path d='M-5.4 13 Q-5.4 9.2 -2.2 9.2 H2.2 Q5.4 9.2 5.4 13 Z' fill='rgb(150,112,60)' stroke='rgb(96,70,36)' stroke-width='0.6' stroke-linejoin='round'/><path d='M-3.6 10.8 H3.6 M-3 12.2 H3' stroke='rgb(96,70,36)' stroke-width='0.4'/></g><g transform='translate(57 23.8) scale(0.7)'>
<path d='M0 -9.4 Q-3.4 -7.8 -3.4 -3 Q-3.4 2.6 -1.3 7.2 H1.3 Q3.4 2.6 3.4 -3 Q3.4 -7.8 0 -9.4 Z' fill='rgb(150,112,60)' stroke='rgb(96,70,36)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M-3.1 -3.8 Q0 -5.4 3.1 -3.8 V-0.4 Q0 -1.6 -3.1 -0.4 Z' fill='rgb(26,29,33)'/><path d='M-2.4 -2.5 H-0.6 M0.6 -2.5 H2.4' stroke='rgb(75,176,220)' stroke-width='0.8' stroke-linecap='round'/>
<path d='M-1.6 3.2 H1.6 M-1.2 5 H1.2' stroke='rgb(96,70,36)' stroke-width='0.5'/><path d='M0 -9.2 V-5.6' stroke='rgb(96,70,36)' stroke-width='0.5'/>
<rect x='-1.2' y='7.2' width='2.4' height='2' fill='rgb(26,29,33)'/><path d='M-1 7.4 V9 M0 7.4 V9 M1 7.4 V9' stroke='rgb(92,107,120)' stroke-width='0.35'/>
<path d='M-5.4 13 Q-5.4 9.2 -2.2 9.2 H2.2 Q5.4 9.2 5.4 13 Z' fill='rgb(150,112,60)' stroke='rgb(96,70,36)' stroke-width='0.6' stroke-linejoin='round'/><path d='M-3.6 10.8 H3.6 M-3 12.2 H3' stroke='rgb(96,70,36)' stroke-width='0.4'/></g>
<path d='M78.4 12 L75.7 16.68 L70.3 16.68 L67.6 12 L70.3 7.32 L75.7 7.32 Z' fill='rgb(42,50,58)' stroke='rgb(92,107,120)' stroke-width='0.8' stroke-linejoin='round'/><path d='M75.4 12 L74.2 14.08 L71.8 14.08 L70.6 12 L71.8 9.92 L74.2 9.92 Z' fill='rgb(42,127,168)'/><path d='M69.9 17 L67.2 21.68 L61.8 21.68 L59.1 17 L61.8 12.32 L67.2 12.32 Z' fill='rgb(42,50,58)' stroke='rgb(92,107,120)' stroke-width='0.8' stroke-linejoin='round'/><path d='M86.9 17 L84.2 21.68 L78.8 21.68 L76.1 17 L78.8 12.32 L84.2 12.32 Z' fill='rgb(42,50,58)' stroke='rgb(92,107,120)' stroke-width='0.8' stroke-linejoin='round'/><path d='M78.4 22 L75.7 26.68 L70.3 26.68 L67.6 22 L70.3 17.32 L75.7 17.32 Z' fill='rgb(42,50,58)' stroke='rgb(150,112,60)' stroke-width='0.8' stroke-linejoin='round'/><path d='M75 22 L74 23.73 L72 23.73 L71 22 L72 20.27 L74 20.27 Z' fill='rgb(150,112,60)'/>
<rect x='3' y='32' width='58' height='1' fill='rgb(92,107,120)'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M14 7.8 L11.2 12.65 L5.6 12.65 L2.8 7.8 L5.6 2.95 L11.2 2.95 Z' fill='rgb(198,154,91)' stroke='rgb(96,70,36)' stroke-width='0.8' stroke-linejoin='round'/><path d='M21.4 12 L18.6 16.85 L13 16.85 L10.2 12 L13 7.15 L18.6 7.15 Z' fill='rgb(150,112,60)' stroke='rgb(96,70,36)' stroke-width='0.8' stroke-linejoin='round'/><path d='M14 16.2 L11.2 21.05 L5.6 21.05 L2.8 16.2 L5.6 11.35 L11.2 11.35 Z' fill='rgb(42,50,58)' stroke='rgb(198,154,91)' stroke-width='0.8' stroke-linejoin='round'/><path d='M10.6 7.8 L9.5 9.71 L7.3 9.71 L6.2 7.8 L7.3 5.89 L9.5 5.89 Z' fill='rgb(26,29,33)'/><path d='M18 12 L16.9 13.91 L14.7 13.91 L13.6 12 L14.7 10.09 L16.9 10.09 Z' fill='rgb(75,176,220)'/><path d='M10.6 16.2 L9.5 18.11 L7.3 18.11 L6.2 16.2 L7.3 14.29 L9.5 14.29 Z' fill='rgb(150,112,60)'/>
</svg>
```

### 2.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | sep-title (title) | removed |
| 2 | banner-pulse (banner icon) | removed |
| 3 | sep-grid (panno) | removed |
| 4 | sep-readout (readout) | removed |
| 5 | sep-border (`#app`) | removed |
| 6 | sep-dust (`#particles`) | removed |
| hover | tile-scan-v .5s | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite star-wars-separatist.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 2.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** flat `#1D232A`, border `#5C6B78` (1 px; 3.28:1 on the grid ground), radius 0px, `box-shadow: inset 0 2px 0 #C69A5B`, `::before` off; layout unchanged. Icons: `brightness(1.2) saturate(0.9)` through the shaped plate (D in 3).
- **Hover:** flat `#17303F`, border `#4BB0DC` (5.58:1 on the hover fill), `box-shadow: inset 0 2px 0 #4BB0DC`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (6.16:1 on the tile, 7.00:1 on the grid ground). **Pressed:** base scale 0.96 on flat `#1B3A4C`.
- **Label:** `#E8E2D6`, **Jost 400**, 11.5 px, 0.1 px, user case.
- **Filter chip:** base rule (fill `#17303F`, `--accent-c` border, `#DDB77C` text). The header scene hides while it shows.
- **Edit bar:** `#2A1214` fill, `#9A3A3A` rule, label `#F08A8A`; `+ FILE` and `+ INSTALLED` in `--text` with a `#7A8794` border, `DONE` in `#F08A8A` with a `#9A3A3A` border. The tile remove button is `#8E3030` with a `#F08A8A` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#14171B`, panel `#1B2026`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#DDB77C` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#DDB77C` text on `#17303F` with a `#4BB0DC` rule.

### 2.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite star-wars-separatist.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#23282E`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **141.91**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#1B2026` surface with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 3 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a honeycomb cluster of three cells at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#4BB0DC` border and `inset 0 2px 0 #4BB0DC`, the hover fill, the shaped plate with no cropped glyph, no ellipsis on CALCULATOR (mock 49.8 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): tan for the header, the tile top edge, the trim and the ring; CIS blue for hover, cells and the update bar; dull red only in the edit bar, the remove button and errors; no orange, no green, no violet.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 11 px, frame 8 px, banner 4 px; at 640 x 420 11 / 8 / 11 px; at 1024 x 700 11 / 8 / 11 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Jost`; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 4** (title and banner text covered; my read of a render, not a fan test). What survives: a tan plate header with a honeycomb strip, a dark steel field, tan-topped steel tiles with two cut corners, trapezoid plates and perforated seams along the frame, a squad of droid busts and a cell cluster in the banner. What is missing for a 5: the CIS emblem and any Aurebesh (marks and script, not drawn) and the Neimoidian ornament; the busts carry the faction.

Watch items for this theme: (1) **The droid busts** are the highest-risk art of the batch. The first draft (a bare oval with two dots) read as a tribal mask; the final has a visor band, a ribbed neck and a segmented chest and reads as a robot at 1x. If Sergei sees dolls, the lever is the visor: make the band taller (`y` 3.8 to 4.6) or drop the number of busts to three. (2) The tan header is the brightest surface of the theme (luminance 0.36 against a field of 0.01); the banner and the grid are dark, so the weight sits at the top. Lever: header top `#C69A5B` to `#B88C50`. (3) The cell-cluster icon can read as nuts and bolts or a molecule; the header strip and the banner row make it a honeycomb. A single droid head was tried and read as a mask.

---

## 3. star-wars-empire (STAR WARS: GALACTIC EMPIRE): DONE

**Audit:** score 3, tone down. Right near-black, gunmetal and sparing red, but a full Death Star sphere with a spec table sat behind CALCULATOR and BROWSER (its trench running along the CALCULATOR label); the readout was corrupted ("GALACTIC(R)MPIRE") and crossed PAINT and FILES; Segoe UI Light was generic; the octagon icons meant nothing; the title flashed white (a Sith trait). Seven infinite animations.
**Direction:** the bridge console. Flat, rectangular, symmetric, no gradient anywhere: `#0B0C0E` ground, `#171A1E` header and banner, gunmetal borders, white-grey type. The frame is Death Star wall panelling: a row of recessed rectangular panels along the top with a light strip, vertical slots with an indicator down both sides, square L brackets in the corners. The header carries three stacked readout bars of segments (one short red segment, an alert light); the banner carries a wedge capital ship in two-tone grey with a bridge tower and an engine row over a few stars, and its icon is a grey battle station (a sphere with an equatorial trench and a dish). Red is an alert light and nothing more: the title dot, one segment, one lamp on the ship, the edit bar, the remove button and errors. Libre Franklin throughout (the bundled Franklin Gothic read: title 500, labels 500 at 11 px with no tracking, banner 400, and the body face for the version, Settings and the bars; Bahnschrift is the fallback). Static.

### 3.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0B0C0E;
  --panel-bg: #111317;
  --overlay-bg: #0B0C0E;
  --header-bg: #171A1E;
  --font: 'Libre Franklin', Bahnschrift, 'Segoe UI', sans-serif;
  --text: #E2E5E8;
  --text-dim: #AEB4BA;
  --accent-c: #A9AFB5;
  --accent-m: #FF6B70;
  --accent-y: #A9AFB5;
  --accent-text: #CDD2D7;
  --border: #4A4F55;
  --border-h: #C9CED3;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #A9AFB5;
  --title-anim: none;
  --tile-hover-bg: #1F2328;
  --tile-hover-border: #E2E5E8;
  --tile-hover-shadow: inset 0 0 0 1px #E2E5E8;
  --tile-active-bg: #2A2F35;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.08) saturate(0.9);
  --tile-icon-shape: none;
  --tile-label-spacing: 0px;
  --tile-label-transform: none;
  --tile-label-weight: 500;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #2B3036;
  --btn-active-bg: #383E45;
  --drop-hint-border: #4A4F55;
  --drop-icon-color: #7A8086;
  --hint-sub-color: #AEB4BA;
  --rename-dashed: #A9AFB5;
  --rename-input-bg: #1F2328;
  --edit-bar-bg: #2C0C0E;
  --edit-bar-border: #D0161D;
  --edit-label-color: #FF6B70;
  --edit-label-glow: none;
  --btn-done-color: #FF6B70;
  --btn-done-border: #D0161D;
  --btn-done-hover-bg: #471215;
  --btn-done-hover-glow: none;
  --btn-add-border: #8A8F94;
  --update-bg: #171A1E;
  --update-border: #8A8F94;
  --update-color: #CDD2D7;
  --update-btn-border: #8A8F94;
  --update-btn-hover-bg: #262B31;
  --update-btn-hover-glow: none;
  --btn-close-color: #CDD2D7;
  --btn-close-border: #8A8F94;
  --btn-close-hover-bg: #262B31;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1F2328;
  --picker-item-hover-bg: #1F2328;
  --picker-item-active-bg: #262B31;
  --picker-placeholder-bg: #1F2328;
  --skin-btn-active-bg: #262B31;
  --remove-btn-bg: #B0141B;
  --remove-btn-border: #FF8A8E;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#E2E5E8` on `#0B0C0E` | 4.5:1 | **15.47:1** |
| `--text-dim` on `--bg` | `#AEB4BA` on `#0B0C0E` | 4.5:1 | **9.35:1** |
| `--accent-c` on `--bg` | `#A9AFB5` on `#0B0C0E` | 3:1 | **8.84:1** |
| `--accent-text` on `--bg` | `#CDD2D7` on `#0B0C0E` | 3:1 | **12.86:1** |
| `--hint-sub-color` on `--bg` | `#AEB4BA` on `#0B0C0E` | 4.5:1 | **9.35:1** |
| `--btn-close-color` on `--panel-bg` | `#CDD2D7` on `#111317` | 4.5:1 | **12.22:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the worst stop** (the lightest stop), except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E2E5E8` on `#14171B` | 4.5:1 | **14.22:1** |
| Tile label on tile hover | `#E2E5E8` on `#1F2328` | 4.5:1 | **12.49:1** |
| Tile label on tile pressed (pressed state) | `#E2E5E8` on `#2A2F35` | 4.5:1 | **10.67:1** |
| Title on header | `#E2E5E8` on `#171A1E` | 4.5:1 | **13.81:1** |
| Title dot (`.accent`) on header | `#FF6B70` on `#171A1E` | 4.5:1 | **6.31:1** |
| Header version on header | `#AEB4BA` on `#171A1E` | 4.5:1 | **8.34:1** |
| Header button glyph on header | `#E2E5E8` on `#171A1E` | 4.5:1 | **13.81:1** |
| Header button glyph on button hover | `#FFFFFF` on `#2B3036` | 4.5:1 | **13.30:1** |
| Filter chip text on chip | `#CDD2D7` on `#1F2328` | 4.5:1 | **10.38:1** |
| Filter chip clear glyph on hover on chip | `#FFFFFF` on `#1F2328` | 4.5:1 | **15.80:1** |
| Banner text on banner | `#E2E5E8` on `#171A1E` | 4.5:1 | **13.81:1** |
| Header line on header (non-text) | `#7C8289` on `#171A1E` | 3:1 | **4.50:1** |
| Edit label on edit bar | `#FF6B70` on `#2C0C0E` | 4.5:1 | **6.51:1** |
| Done / close button text on edit bar | `#FF6B70` on `#2C0C0E` | 4.5:1 | **6.51:1** |
| + FILE / + INSTALLED text on edit bar | `#E2E5E8` on `#2C0C0E` | 4.5:1 | **14.24:1** |
| Done button text on its hover fill | `#FF6B70` on `#471215` | 4.5:1 | **5.56:1** |
| Settings text on overlay | `#E2E5E8` on `#0B0C0E` | 4.5:1 | **15.47:1** |
| Settings text on panel | `#E2E5E8` on `#111317` | 4.5:1 | **14.70:1** |
| Settings label (text-dim) on panel | `#AEB4BA` on `#111317` | 4.5:1 | **8.89:1** |
| Settings value / cheat key (accent-text) on panel | `#CDD2D7` on `#111317` | 4.5:1 | **12.22:1** |
| Settings version value (accent-text) on panel | `#CDD2D7` on `#111317` | 4.5:1 | **12.22:1** |
| Settings CLOSE text on panel | `#CDD2D7` on `#111317` | 4.5:1 | **12.22:1** |
| Settings CLOSE text on its hover fill | `#CDD2D7` on `#262B31` | 4.5:1 | **9.37:1** |
| Hotkey error text (accent-m) on panel | `#FF6B70` on `#111317` | 4.5:1 | **6.72:1** |
| Hotkey input text on input fill | `#CDD2D7` on `#1F2328` | 4.5:1 | **10.38:1** |
| Picker row text on hover fill | `#CDD2D7` on `#1F2328` | 4.5:1 | **10.38:1** |
| Update banner text on update bar | `#CDD2D7` on `#171A1E` | 4.5:1 | **11.47:1** |
| Update button text on hover fill | `#FFFFFF` on `#262B31` | 4.5:1 | **14.26:1** |
| Drop-hint text (text-dim) on grid ground | `#AEB4BA` on `#0B0C0E` | 4.5:1 | **9.35:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#B0141B` | 3:1 | **7.09:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#B0141B` | 3:1 | **7.09:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#A9AFB5` on `#14171B` | 3:1 | **8.12:1** |
| Focus ring on grid ground (non-text) | `#A9AFB5` on `#0B0C0E` | 3:1 | **8.84:1** |
| Hover border on grid ground (non-text) | `#E2E5E8` on `#0B0C0E` | 3:1 | **15.47:1** |
| Hover border on hover fill (non-text) | `#E2E5E8` on `#1F2328` | 3:1 | **12.49:1** |
| Theme-picker selected row text (accent-text) on active fill | `#CDD2D7` on `#262B31` | 4.5:1 | **9.37:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#CDD2D7` on `#1F2328` | 4.5:1 | **10.38:1** |
| Skin search input text (accent-text) on panel | `#CDD2D7` on `#111317` | 4.5:1 | **12.22:1** |
| Apps-picker search input text (accent-text) on search fill | `#CDD2D7` on `#1F2328` | 4.5:1 | **10.38:1** |
| Rename input text (accent-text) on input fill | `#CDD2D7` on `#1F2328` | 4.5:1 | **10.38:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#AEB4BA` on `#1F2328` | 4.5:1 | **7.55:1** |
| Skin search placeholder (text-dim, themed) on panel | `#AEB4BA` on `#111317` | 4.5:1 | **8.89:1** |
| Apps-picker placeholder (text-dim) on search fill | `#AEB4BA` on `#1F2328` | 4.5:1 | **7.55:1** |
| Hotkey recording text (accent-m) on input fill | `#FF6B70` on `#1F2328` | 4.5:1 | **5.71:1** |
| Update dismiss glyph (text-dim) on update bar | `#AEB4BA` on `#171A1E` | 4.5:1 | **8.34:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#AEB4BA` on `#111317` | 3:1 | **8.89:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#A9AFB5` on `#111317` | 3:1 | **8.40:1** |
| Tile border on grid ground (non-text) | `#5B6168` on `#0B0C0E` | 3:1 | **3.13:1** |

**Lowest ratio in this theme: 3.13:1 (Tile border on grid ground (non-text), non-text).** Lowest text ratio: 5.56:1 (Done button text on its hover fill). Lowest non-text ratio: 3.13:1 (Tile border on grid ground (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | First stop (top) | Last stop (bottom) |
|---|---|---|
| Header | `#171A1E` | `#171A1E` |
| Tile at rest | `#14171B` | `#14171B` |
| Tile hover and focus | `#1F2328` | `#1F2328` |
| Tile pressed | `#2A2F35` | `#2A2F35` |
| Banner | `#171A1E` | `#171A1E` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.08) saturate(0.9)`; mock plates from the gallery; the columns name the **worst stop** of each tile surface):

| Icon plate (mock) | After fx | Rest `#14171B` | Hover `#1F2328` | Pressed `#2A2F35` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6689AF` | 4.93:1 | 4.33:1 | 3.70:1 | pass |
| Calculator `#6b6f76` | `#74787F` | 4.05:1 | 3.56:1 | 3.04:1 | pass |
| Paint `#b07a4f` | `#B9855B` | 5.62:1 | 4.94:1 | 4.22:1 | pass |
| Terminal `#3d4450` | `#434955` | 1.99:1 | 1.75:1 | 1.49:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#5A9495` | 5.23:1 | 4.59:1 | 3.92:1 | pass |
| Files `#c09a3e` | `#CBA64D` | 7.79:1 | 6.85:1 | 5.85:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.04:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Red `#D0161D` is a fill (edit bar rule, remove button) but never text: text uses the lighter `#FF6B70` (6.51:1 on the edit bar). `--accent-c` is light gunmetal `#A9AFB5` (the ring), `--accent-text` `#CDD2D7`. Flat grounds mean the tables carry one number per surface.

### 3.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | 'Libre Franklin', Bahnschrift, 'Segoe UI', sans-serif (one face for the whole window; Bahnschrift is the fallback) |
| `#title` | Libre Franklin 500, 11 px, tracking 4 px, uppercase from the markup, `font-synthesis: none`, `line-height: 1.2` |
| `.tile-label` | Libre Franklin 500, **11 px with `line-height: 13.8px`** (keeps the tile at 94.8 px), 0 px tracking, user case; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | Libre Franklin 400, 12 px, 0.4 px, sentence case |

Measured in Ender's Electron 32 run (reproduced in the review; the mock figures of the first text, a Bahnschrift build, are superseded): the title text box ends at **x 144.05** (gate 156; 11.95 px under, 23.95 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700 and at 1x, 1.5x and 2x. The six standard labels in the 100 px box (ink widths, user case): Notepad 44.7, Calculator 52.9, Paint 27.0, Terminal 44.8, Browser 43.5, Files 24.3 px, no ellipsis; the long names "Visual Studio 2022" 97.7, "Visual Studio Code" 97.2, "Windows Terminal" 95.3, "Command Prompt" 95.3, "Notepad++ x64" 80.3, "7-Zip 23.01" 58.3, "Калькулятор" 69.9, "Жёсткий диск" 76.5, "Диспетчер задач" 92.4 and "Командная строка" 99.5 px fit, and "Панель управления" (106.5 px) and "Проводник Windows" (111.1 px) ellipsize (the base 100 px box, offer b of B4R). **The label rule is what makes the English names fit:** at 11.5 px with 0.2 px tracking Libre Franklin cut "Visual Studio 2022" (105.7 px), "Visual Studio Code", "Windows Terminal" and "Command Prompt", so the build takes 11 px, 0 px tracking and `line-height: 13.8px` (the review's F1; the line height keeps the tile at 94.8 px, as Sith's label rule does). Tile height 94.80 px (94.7 to 95.4 required) at every scale. Banner lines: see 0.8 (the widest ends at x 273.9). **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; positive control (a 6 px label box cuts the tails): **153, 403 and 486 px** (Latin) and **198, 535 and 656 px** (Cyrillic tails "Щука Цирк", "Цирк Щи", "Цц Щщ Джем", "QJ jq Gg"). **Platform fonts drawn:** title, labels and banner Libre Franklin (web) x12, x7 and x37; the version, Settings and the bars Libre Franklin (web) as well (`--font`, the review's F2). Expected `fontsRendered`: `Libre Franklin` (100 to 900); a misspelled family falls back to Times New Roman.

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5); not needed (144.05). **Cyrillic:** Libre Franklin covers it (28 of 28 glyphs of "Жёсткий диск Щщ Ъъ Проводник"; "Калькулятор" and "Жёсткий диск" checked in the render).

### 3.3 Art (tone down with a new frame). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: #171A1E; border-bottom-color: #7C8289; box-shadow: inset 0 -2px 0 #7C8289; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #C9CED3; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): three stacked readout bars of rectangular segments (2 px gaps) in gunmetal and light grey, with one short red segment in the middle bar. Painted pixels at x 170.0 to 250.0, y 12.5 to 27.5. Hidden while the chip shows. The title ends at x 144.05, the scene starts at x 168: 23.95 px clear.

**B. Frame (the kit of 0.3).** the side bands are black slots 6 px wide with 1 px gunmetal edges, a recessed panel and a light indicator every 24 px; the top course is a gunmetal rule over two recessed panels per 24 px (one with a light strip) on a light base line; each corner is a square bracket with a white pin. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 11 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700); at Sergei's 1.5x the smallest art-to-ring gap is 3.33 css px.

**C. Banner.** the banner is the flat `#171A1E` with a gunmetal top border; its top course is a rule over two recessed panels per 24 px; the icon is a **battle station** (a grey sphere with a shaded lower half, an equatorial trench, a dish with a pale centre); the right end is a **wedge capital ship** in top view, nose to the left, lit upper half and shadowed lower half, a bridge tower with two domes on the ridge, an engine row of four white blocks, one red lamp, and six stars. The motif's painted pixels are at x 330.0 to 408.6, y 269.4 to 295.6 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 55.8 px (0.8). The banner row of the probe reads 4 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: square (`--app-clip: none`; flat and rectangular is the point). Tiles: flat cards (`#14171B`), a 1 px gunmetal border, square corners, no lit edge; hover is a lighter fill (`#1F2328`), a white border and a 1 px inner white line (`inset 0 0 0 1px`); the plate keeps the app's own rounded square (`--tile-icon-shape: none`). The plate is the app's own rounded square (`--tile-icon-shape: none`), so it cannot crop anything.

**Trademark note.** The Imperial cog emblem, the Star Destroyer's model detail, the TIE fighter, stormtrooper and officer designs and the Death Star's surface detail are not drawn. The wedge, the sphere with a trench and a dish, the panels and the bars are generic forms.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B0141B; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { background: #171A1E; border-bottom-color: #7C8289; box-shadow: inset 0 -2px 0 #7C8289; }
#header::before { background: #C9CED3; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Libre Franklin', Bahnschrift, 'Segoe UI', sans-serif; font-weight: 500; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 11px; letter-spacing: 4px; color: #E2E5E8; text-shadow: none; }
#title .accent { color: #FF6B70; }

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

/* tiles */
.app-tile { background: #14171B; border-color: #5B6168; border-radius: 0px; box-shadow: none; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: #1F2328; border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: #2A2F35; }
.tile-label { font-family: 'Libre Franklin', Bahnschrift, 'Segoe UI', sans-serif; font-size: 11px; line-height: 13.8px; font-synthesis: none; overflow: clip; overflow-clip-margin: 3px; }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, #171A1E;
  border-top-color: #5B6168;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Libre Franklin', Bahnschrift, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 400; font-style: normal; font-synthesis: none; letter-spacing: 0.4px; color: #E2E5E8; margin-right: 90px; }
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
<rect x='2' y='2.5' width='26' height='3' fill='rgb(124,130,137)'/><rect x='30' y='2.5' width='14' height='3' fill='rgb(124,130,137)'/><rect x='46' y='2.5' width='30' height='3' fill='rgb(124,130,137)'/><rect x='78' y='2.5' width='4' height='3' fill='rgb(124,130,137)'/><rect x='2' y='8.5' width='12' height='3' fill='rgb(169,175,181)'/><rect x='16' y='8.5' width='34' height='3' fill='rgb(169,175,181)'/><rect x='52' y='8.5' width='20' height='3' fill='rgb(169,175,181)'/><rect x='74' y='8.5' width='8' height='3' fill='rgb(208,22,29)'/><rect x='2' y='14.5' width='40' height='3' fill='rgb(91,97,104)'/><rect x='44' y='14.5' width='10' height='3' fill='rgb(91,97,104)'/><rect x='56' y='14.5' width='26' height='3' fill='rgb(91,97,104)'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='0' width='24' height='1' fill='rgb(58,63,69)'/><rect x='1' y='2' width='10' height='5' fill='rgb(31,35,40)'/><rect x='1' y='2' width='10' height='1' fill='rgb(91,97,104)'/><rect x='13' y='2' width='10' height='5' fill='rgb(31,35,40)'/><rect x='13' y='2' width='10' height='1' fill='rgb(91,97,104)'/><rect x='15' y='4' width='6' height='1' fill='rgb(169,175,181)'/><rect x='0' y='8' width='24' height='1' fill='rgb(91,97,104)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='1' y='0' width='6' height='24' fill='rgb(20,23,27)'/><rect x='1' y='0' width='1' height='24' fill='rgb(58,63,69)'/><rect x='6' y='0' width='1' height='24' fill='rgb(58,63,69)'/><rect x='2.5' y='3' width='3' height='8' fill='rgb(31,35,40)'/><rect x='2.5' y='3' width='3' height='1' fill='rgb(91,97,104)'/><rect x='3' y='14' width='2' height='7' fill='rgb(169,175,181)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect x='0' y='0' width='8' height='8' fill='rgb(20,23,27)'/><path d='M0.7 7.3 V0.7 H7.3' fill='none' stroke='rgb(169,175,181)' stroke-width='1.4'/><rect x='3' y='3' width='2.5' height='2.5' fill='rgb(226,229,232)'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='0' width='24' height='1' fill='rgb(91,97,104)'/><rect x='2' y='2.5' width='8' height='3' fill='rgb(31,35,40)'/><rect x='2' y='2.5' width='8' height='1' fill='rgb(58,63,69)'/><rect x='14' y='2.5' width='8' height='3' fill='rgb(31,35,40)'/><rect x='14' y='2.5' width='8' height='1' fill='rgb(58,63,69)'/><rect x='0' y='6' width='24' height='1' fill='rgb(58,63,69)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>

<path d='M2 17 L60 8.4 L68 8.4 L68 25.6 L60 25.6 Z' fill='rgb(91,97,104)'/>
<path d='M2 17 L60 8.4 L68 8.4 L68 17 Z' fill='rgb(124,130,137)'/>
<path d='M2 17 L68 17' stroke='rgb(226,229,232)' stroke-width='0.7'/>
<path d='M20 14.6 L30 13.3 M38 12.3 L46 11.2 M20 19.4 L30 20.7 M38 21.7 L46 22.8' stroke='rgb(58,63,69)' stroke-width='0.7'/>
<rect x='54' y='13.4' width='10' height='7.2' fill='rgb(169,175,181)'/><rect x='54' y='13.4' width='10' height='1' fill='rgb(226,229,232)'/><rect x='56' y='11.2' width='6' height='2.2' fill='rgb(124,130,137)'/>
<circle cx='57' cy='15.5' r='1.6' fill='rgb(91,97,104)' stroke='rgb(20,23,27)' stroke-width='0.4'/><circle cx='61' cy='15.5' r='1.6' fill='rgb(91,97,104)' stroke='rgb(20,23,27)' stroke-width='0.4'/>
<rect x='68' y='9.6' width='3' height='2.4' fill='rgb(226,229,232)'/><rect x='68' y='13' width='3' height='2.4' fill='rgb(226,229,232)'/><rect x='68' y='18.6' width='3' height='2.4' fill='rgb(226,229,232)'/><rect x='68' y='22' width='3' height='2.4' fill='rgb(226,229,232)'/>
<rect x='62.4' y='17.8' width='1.6' height='1.6' fill='rgb(208,22,29)'/>
<circle cx='78' cy='5' r='0.7' fill='rgb(169,175,181)'/><circle cx='74' cy='29' r='0.6' fill='rgb(124,130,137)'/><circle cx='80' cy='21' r='0.6' fill='rgb(124,130,137)'/><circle cx='8' cy='6' r='0.6' fill='rgb(124,130,137)'/><circle cx='14' cy='28' r='0.7' fill='rgb(169,175,181)'/><circle cx='40' cy='4' r='0.6' fill='rgb(124,130,137)'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<defs><radialGradient id='s' cx='0.36' cy='0.3' r='0.9'><stop offset='0' stop-color='rgb(212,216,220)'/><stop offset='1' stop-color='rgb(86,92,99)'/></radialGradient></defs>
<circle cx='11' cy='11' r='9.4' fill='url(#s)' stroke='rgb(20,23,27)' stroke-width='1'/>
<path d='M1.8 10 H20.2' stroke='rgb(31,35,40)' stroke-width='1.5'/><path d='M1.8 12.2 H20.2' stroke='rgb(124,130,137)' stroke-width='0.5'/>
<circle cx='15.4' cy='6.6' r='2.7' fill='rgb(31,35,40)' stroke='rgb(91,97,104)' stroke-width='0.6'/><circle cx='15.4' cy='6.6' r='0.9' fill='rgb(169,175,181)'/>
</svg>
```

### 3.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | empire-flicker (title) | removed |
| 2 | banner-glow (banner icon) | removed |
| 3 | empire-deathstar (panno) | removed |
| 4 | empire-readout (readout) | removed |
| 5 | empire-border (`#app`) | removed |
| 6 | hdr-bar-strobe (`#header::before`) | removed |
| 7 | empire-starfield (`#particles`) | removed |
| hover | tile-scan-v .5s | removed (`.app-tile::before` is `display:none`) |

**Before 7, after 0.** `grep -c infinite star-wars-empire.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 3.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** flat `#14171B`, border `#5B6168` (1 px; 3.13:1 on the grid ground), radius 0px, no lit edge, `::before` off; layout unchanged. Icons: `brightness(1.08) saturate(0.9)` through the app's own plate.
- **Hover:** flat `#1F2328`, border `#E2E5E8` (12.49:1 on the hover fill), `box-shadow: inset 0 0 0 1px #E2E5E8`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (8.12:1 on the tile, 8.84:1 on the grid ground). **Pressed:** base scale 0.96 on flat `#2A2F35`.
- **Label:** `#E2E5E8`, Libre Franklin 500, 11 px with `line-height: 13.8px`, 0 px, user case.
- **Filter chip:** base rule (fill `#1F2328`, `--accent-c` border, `#CDD2D7` text). The header scene hides while it shows.
- **Edit bar:** `#2C0C0E` fill, `#D0161D` rule, label `#FF6B70`; `+ FILE` and `+ INSTALLED` in `--text` with a `#8A8F94` border, `DONE` in `#FF6B70` with a `#D0161D` border. The tile remove button is `#B0141B` with a `#FF8A8E` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#0B0C0E`, panel `#111317`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#CDD2D7` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#CDD2D7` text on `#171A1E` with a `#8A8F94` rule.

### 3.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite star-wars-empire.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 7); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#7C8289`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (build **144.05**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#171A1E` surface with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 3 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a battle station (a sphere with a trench and a dish) at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#E2E5E8` border and `inset 0 0 0 1px #E2E5E8`, the hover fill, the app's own plate, no ellipsis on CALCULATOR (52.9 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): gunmetal and white-grey only in the window and art; red for the title dot, one header segment, one lamp on the ship, the edit bar and the remove button; no blue, no amber, no green.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 11 px, frame 8 px, banner 4 px; at 640 x 420 11 / 8 / 11 px; at 1024 x 700 11 / 8 / 11 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 2 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Libre Franklin`; a misspelled-family probe element falls back; the platform font of `#header-version`, `.overlay-title`, `.setting-row label`, `#btn-check-update`, `.edit-label` and `#update-text` is Libre Franklin (one face for the window).
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "Visual Studio Code", "Windows Terminal", "Command Prompt", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures, and none of the English names ellipsizes (95.3 to 97.7 px of 100); "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 3** (the review's read of the build; the first expectation was 4) (title and banner text covered; my read of a render, not a fan test). What survives: a flat near-black console with gunmetal panels, recessed rectangular panelling and slots, stacked readout bars with one red segment, a wedge capital ship with an engine row and a grey battle station. What is missing for a 5: the cog emblem and the red-on-black bridge text (a mark, and text the banner rules out), and the saga type.

Watch items for this theme: (1) The battle station icon is the most literal object in the batch (a sphere, a trench, a dish). At 22 px it can read as a moon with a belt; the dish settles it for a fan. Lever: enlarge the dish (`r` 2.7 to 3.2). (2) The frame is three rows of tiny rectangles; at 1x it reads as a perforated rail (a dashed line), at 1.5x slightly softer. Lever: remove the second panel from the top course. (3) Hover is a white 1 px double line: the brightest hover cue of the batch (`#E2E5E8`).

---

## 4. star-wars-rebel (STAR WARS: REBEL ALLIANCE): DONE

**Audit:** score 3, redraw. Orange text on black with no khaki, olive, stencil or hologram blue: generic amber. A faint diamond frame and a starfield sat behind the middle tiles, the readout ("MANY BOTHANS DIED", corrupted) ran down the right column and the banner repeated it truncated; the pennant-crop icons had no Rebel meaning; Consolas and Segoe were mixed. Six infinite animations.
**Direction:** khaki canvas, olive webbing and stencil, the field kit of a hurried alliance. A khaki-black ground (`#1A1712`), an olive header (`#3A4529` to `#2E3721`) under a 3 px **hologram-blue** line, khaki tiles with olive borders and a 2 px canvas shadow; orange is the keyboard ring, the hover border and underline, the title dot, the header tick and the edit bar, and the paint on the helmet and the fighter. The frame is webbing: hazard stripes along the top, olive webbing with a stitch pair and a khaki rivet every 24 px down both sides, bolted corner plates. The header carries stencil blocks (cream, with 1.5 px bridges) and a hologram reticle; the banner carries a stencil-dash column and a hologram reticle locked on an orange swept-wing fighter, and its icon is an orange pilot helmet. The title is the bundled stencil face Black Ops One (weight 400, title only) over a Trebuchet MS body, a friendly field-gear sans. The audit's stencilled "01 02 03" is dropped (no numerals in art). Static.

### 4.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #1A1712;
  --panel-bg: #231F17;
  --overlay-bg: #1A1712;
  --header-bg: #3A4529;
  --font: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif;
  --text: #F2E6C8;
  --text-dim: #D2C6A4;
  --accent-c: #E8721C;
  --accent-m: #F29A52;
  --accent-y: #E8721C;
  --accent-text: #F29A52;
  --border: #6B7B4E;
  --border-h: #E8721C;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #E8721C;
  --title-anim: none;
  --tile-hover-bg: #35301D;
  --tile-hover-border: #E8721C;
  --tile-hover-shadow: inset 0 -2px 0 #E8721C;
  --tile-active-bg: #3A321C;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.2) saturate(0.88);
  --tile-icon-shape: none;
  --tile-label-spacing: 0px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #4A5634;
  --btn-active-bg: #5A6840;
  --drop-hint-border: #5A5A3A;
  --drop-icon-color: #8A8A5E;
  --hint-sub-color: #D2C6A4;
  --rename-dashed: #E8721C;
  --rename-input-bg: #35301D;
  --edit-bar-bg: #2E1A0C;
  --edit-bar-border: #E8721C;
  --edit-label-color: #F29A52;
  --edit-label-glow: none;
  --btn-done-color: #F29A52;
  --btn-done-border: #E8721C;
  --btn-done-hover-bg: #4A2A12;
  --btn-done-hover-glow: none;
  --btn-add-border: #8A8A5E;
  --update-bg: #1F2A2E;
  --update-border: #5AA3E0;
  --update-color: #F29A52;
  --update-btn-border: #5AA3E0;
  --update-btn-hover-bg: #2A3C44;
  --update-btn-hover-glow: none;
  --btn-close-color: #F29A52;
  --btn-close-border: #E8721C;
  --btn-close-hover-bg: #35301D;
  --btn-close-hover-glow: none;
  --picker-search-bg: #35301D;
  --picker-item-hover-bg: #35301D;
  --picker-item-active-bg: #3A321C;
  --picker-placeholder-bg: #35301D;
  --skin-btn-active-bg: #3A321C;
  --remove-btn-bg: #A8401A;
  --remove-btn-border: #F29A52;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#F2E6C8` on `#1A1712` | 4.5:1 | **14.40:1** |
| `--text-dim` on `--bg` | `#D2C6A4` on `#1A1712` | 4.5:1 | **10.51:1** |
| `--accent-c` on `--bg` | `#E8721C` on `#1A1712` | 3:1 | **5.83:1** |
| `--accent-text` on `--bg` | `#F29A52` on `#1A1712` | 3:1 | **8.10:1** |
| `--hint-sub-color` on `--bg` | `#D2C6A4` on `#1A1712` | 4.5:1 | **10.51:1** |
| `--btn-close-color` on `--panel-bg` | `#F29A52` on `#231F17` | 4.5:1 | **7.44:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the worst stop** (the lightest stop), except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F2E6C8` on `#272318` | 4.5:1 | **12.63:1** |
| Tile label on tile hover | `#F2E6C8` on `#35301D` | 4.5:1 | **10.63:1** |
| Tile label on tile pressed (pressed state) | `#F2E6C8` on `#3A321C` | 4.5:1 | **10.24:1** |
| Title on header | `#F2E6C8` on `#3A4529` | 4.5:1 | **8.20:1** |
| Title dot (`.accent`) on header | `#F29A52` on `#3A4529` | 4.5:1 | **4.61:1** |
| Header version on header | `#D2C6A4` on `#3A4529` | 4.5:1 | **5.99:1** |
| Header button glyph on header | `#F2E6C8` on `#3A4529` | 4.5:1 | **8.20:1** |
| Header button glyph on button hover | `#FFFFFF` on `#4A5634` | 4.5:1 | **7.86:1** |
| Filter chip text on chip | `#F29A52` on `#35301D` | 4.5:1 | **5.98:1** |
| Filter chip clear glyph on hover on chip | `#FFFFFF` on `#35301D` | 4.5:1 | **13.19:1** |
| Banner text on banner | `#F2E6C8` on `#2A261B` | 4.5:1 | **12.17:1** |
| Header line on header (non-text) | `#5AA3E0` on `#2E3721` | 3:1 | **4.60:1** |
| Edit label on edit bar | `#F29A52` on `#2E1A0C` | 4.5:1 | **7.50:1** |
| Done / close button text on edit bar | `#F29A52` on `#2E1A0C` | 4.5:1 | **7.50:1** |
| + FILE / + INSTALLED text on edit bar | `#F2E6C8` on `#2E1A0C` | 4.5:1 | **13.34:1** |
| Done button text on its hover fill | `#F29A52` on `#4A2A12` | 4.5:1 | **5.84:1** |
| Settings text on overlay | `#F2E6C8` on `#1A1712` | 4.5:1 | **14.40:1** |
| Settings text on panel | `#F2E6C8` on `#231F17` | 4.5:1 | **13.23:1** |
| Settings label (text-dim) on panel | `#D2C6A4` on `#231F17` | 4.5:1 | **9.65:1** |
| Settings value / cheat key (accent-text) on panel | `#F29A52` on `#231F17` | 4.5:1 | **7.44:1** |
| Settings version value (accent-text) on panel | `#F29A52` on `#231F17` | 4.5:1 | **7.44:1** |
| Settings CLOSE text on panel | `#F29A52` on `#231F17` | 4.5:1 | **7.44:1** |
| Settings CLOSE text on its hover fill | `#F29A52` on `#35301D` | 4.5:1 | **5.98:1** |
| Hotkey error text (accent-m) on panel | `#F29A52` on `#231F17` | 4.5:1 | **7.44:1** |
| Hotkey input text on input fill | `#F29A52` on `#35301D` | 4.5:1 | **5.98:1** |
| Picker row text on hover fill | `#F29A52` on `#35301D` | 4.5:1 | **5.98:1** |
| Update banner text on update bar | `#F29A52` on `#1F2A2E` | 4.5:1 | **6.66:1** |
| Update button text on hover fill | `#FFFFFF` on `#2A3C44` | 4.5:1 | **11.49:1** |
| Drop-hint text (text-dim) on grid ground | `#D2C6A4` on `#1A1712` | 4.5:1 | **10.51:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#A8401A` | 3:1 | **6.15:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#A8401A` | 3:1 | **6.15:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#E8721C` on `#272318` | 3:1 | **5.12:1** |
| Focus ring on grid ground (non-text) | `#E8721C` on `#1A1712` | 3:1 | **5.83:1** |
| Hover border on grid ground (non-text) | `#E8721C` on `#1A1712` | 3:1 | **5.83:1** |
| Hover border on hover fill (non-text) | `#E8721C` on `#35301D` | 3:1 | **4.31:1** |
| Theme-picker selected row text (accent-text) on active fill | `#F29A52` on `#3A321C` | 4.5:1 | **5.76:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#F29A52` on `#35301D` | 4.5:1 | **5.98:1** |
| Skin search input text (accent-text) on panel | `#F29A52` on `#231F17` | 4.5:1 | **7.44:1** |
| Apps-picker search input text (accent-text) on search fill | `#F29A52` on `#35301D` | 4.5:1 | **5.98:1** |
| Rename input text (accent-text) on input fill | `#F29A52` on `#35301D` | 4.5:1 | **5.98:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#D2C6A4` on `#35301D` | 4.5:1 | **7.76:1** |
| Skin search placeholder (text-dim, themed) on panel | `#D2C6A4` on `#231F17` | 4.5:1 | **9.65:1** |
| Apps-picker placeholder (text-dim) on search fill | `#D2C6A4` on `#35301D` | 4.5:1 | **7.76:1** |
| Hotkey recording text (accent-m) on input fill | `#F29A52` on `#35301D` | 4.5:1 | **5.98:1** |
| Update dismiss glyph (text-dim) on update bar | `#D2C6A4` on `#1F2A2E` | 4.5:1 | **8.65:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#D2C6A4` on `#231F17` | 3:1 | **9.65:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#E8721C` on `#231F17` | 3:1 | **5.36:1** |
| Tile border on grid ground (non-text) | `#6B7B4E` on `#1A1712` | 3:1 | **3.89:1** |
| Update bar rule (holo blue) on update bar (non-text) | `#5AA3E0` on `#1F2A2E` | 3:1 | **5.42:1** |

**Lowest ratio in this theme: 4.61:1 (Title dot (`.accent`) on header).** Lowest text ratio: 4.61:1 (Title dot (`.accent`) on header). Lowest non-text ratio: 3.89:1 (Tile border on grid ground (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | First stop (top) | Last stop (bottom) |
|---|---|---|
| Header | `#3A4529` | `#2E3721` |
| Tile at rest | `#272318` | `#272318` |
| Tile hover and focus | `#35301D` | `#35301D` |
| Tile pressed | `#3A321C` | `#3A321C` |
| Banner | `#2A261B` | `#2A261B` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.2) saturate(0.88)`; mock plates from the gallery; the columns name the **worst stop** of each tile surface):

| Icon plate (mock) | After fx | Rest `#272318` | Hover `#35301D` | Pressed `#3A321C` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#7298C1` | 5.21:1 | 4.38:1 | 4.22:1 | pass |
| Calculator `#6b6f76` | `#81858D` | 4.23:1 | 3.56:1 | 3.43:1 | pass |
| Paint `#b07a4f` | `#CD9466` | 5.99:1 | 5.04:1 | 4.85:1 | pass |
| Terminal `#3d4450` | `#4A525E` | 1.99:1 | 1.67:1 | 1.61:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#65A4A5` | 5.53:1 | 4.65:1 | 4.48:1 | pass |
| Files `#c09a3e` | `#E1B958` | 8.42:1 | 7.09:1 | 6.83:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.43:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Orange `#E8721C` is `--accent-c` (5.83:1 on the ground) and a fill; for small text it is the lighter `#F29A52` (`--accent-text`, 8.10:1 on the ground and 4.61:1 on the lightest olive header stop). Hologram blue `#5AA3E0` is the header line and the update bar rule only (the audit's `#3A78B5` is 2.69:1 on the darkest olive, under 3; `#5AA3E0` is 4.60:1). The olive header is dark (`#3A4529`) so cream text clears 8:1; olive `#6B7B4E` is the tile border and the reticle-free trim.

### 4.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | 'Trebuchet MS', 'Segoe UI', Arial, sans-serif |
| `#title` | Black Ops One 400 (bundled; its only weight, no synthesis), 11 px, tracking 3 px, uppercase from the markup, `font-synthesis: none`, `line-height: 1.2` |
| `.tile-label` | Trebuchet MS 400, 11.5 px, 0 px, user case; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | Trebuchet MS 700, 12 px, 0.2 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 134.11** (Black Ops One at 11 px with 3 px tracking, Ender's Electron figure, reproduced in the review; gate 156; 21.89 px under, 33.89 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700 and at 1x, 1.5x and 2x. The six standard labels in the 100 px box (ink widths): NOTEPAD 43.2, CALCULATOR 52.9, PAINT 26.1, TERMINAL 44.5, BROWSER 41.1, FILES 23.6 px, no ellipsis; the long names "Visual Studio 2022" 93, "Notepad++ x64" 77, "7-Zip 23.01" 58, "Калькулятор" 67 and "Жёсткий диск" 75 px fit, and "Проводник Windows" (106 px) ellipsizes (the base 100 px box, offer b of B4R). Tile height 94.80 px (94.7 to 95.4 required) at every scale. Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; positive control (a 6 px line height cuts the tails): **222 px**. **Platform fonts drawn:** title Black Ops One (web) x12; labels Trebuchet MS x7; banner Trebuchet MS x29; version and settings Trebuchet MS x7. Expected `fontsRendered` for the web faces: `Black Ops One` (400 only).

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5); not needed (134.11). **Cyrillic:** Trebuchet MS covers it (checked: "Калькулятор", "Жёсткий диск"); Black Ops One has no Cyrillic, which cannot matter because `#title` is constant Latin text and every label stays Trebuchet MS.

### 4.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #3A4529 0, #2E3721 100%); border-bottom-color: #5AA3E0; box-shadow: inset 0 -2px 0 #5AA3E0; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #E8721C; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): two rows of cream and khaki stencil blocks (4 and 3, split by 1.5 px bridges) with two khaki rivets, and a hologram-blue reticle (a ring, a centre dot and four ticks) on the olive header. Painted pixels at x 170.0 to 244.6, y 11.4 to 28.6. Hidden while the chip shows. The title ends at x 134.11, the scene starts at x 168: 33.89 px clear.

**B. Frame (the kit of 0.3).** the side bands are webbing: a khaki-black strip with olive edges, box stitches in pairs and a khaki rivet with a pale highlight every 24 px; the top course is a hazard band (45 degree stripes in two dark tones) between an olive rail and a khaki base line; each corner is a bolted plate with an olive bracket and a rivet. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700); at Sergei's 1.5x the smallest art-to-ring gap is 3.33 css px.

**C. Banner.** the banner is the flat khaki-black `#2A261B` with an olive top border; its top course is an olive rule over a row of khaki stitch dashes; the icon is a **pilot helmet** (an orange shell with a cream centre stripe, a black visor with a blue glint, two cream cheek vents); the right end is a **hologram reticle** (a blue ring, a dashed inner ring and four ticks) locked on an **orange swept-wing fighter** with a cream cockpit, beside a column of khaki stencil dashes, with four stars. The motif's painted pixels are at x 331.0 to 408.6, y 266.5 to 299.5 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 116.5 px (0.8). The banner row of the probe reads 4 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: square (`--app-clip: none`). Tiles: canvas cards (`#272318`), a 1 px olive border, radius 2 px, a 2 px dark bottom edge (`inset 0 -2px 0`); hover is a warmer fill (`#35301D`), an orange border and a 2 px orange underline; the plate keeps the app's own rounded square (`--tile-icon-shape: none`). The plate is the app's own rounded square (`--tile-icon-shape: none`), so it cannot crop anything.

**Trademark note.** The starbird emblem, squadron markings, the X-wing's exact model (the fighter is a generic swept-wing dart), the Rebel pilot's helmet markings and any hologram character are not drawn.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A8401A; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { background: linear-gradient(180deg, #3A4529 0, #2E3721 100%); border-bottom-color: #5AA3E0; box-shadow: inset 0 -2px 0 #5AA3E0; }
#header::before { background: #E8721C; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Black Ops One', 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; font-weight: 400; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 11px; letter-spacing: 3px; color: #F2E6C8; text-shadow: none; }
#title .accent { color: #F29A52; }

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

/* tiles */
.app-tile { background: #272318; border-color: #6B7B4E; border-radius: 2px; box-shadow: inset 0 -2px 0 #1A1712; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: #35301D; border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: #3A321C; }
.tile-label { font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; font-size: 11.5px; font-synthesis: none; overflow: clip; overflow-clip-margin: 3px; }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, #2A261B;
  border-top-color: #6B7B4E;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 700; font-style: normal; font-synthesis: none; letter-spacing: 0.2px; color: #F2E6C8; margin-right: 90px; }
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
<rect x='2' y='3.5' width='7.38' height='5' fill='rgb(242,230,200)'/><rect x='10.88' y='3.5' width='7.38' height='5' fill='rgb(242,230,200)'/><rect x='19.75' y='3.5' width='7.38' height='5' fill='rgb(242,230,200)'/><rect x='28.63' y='3.5' width='7.38' height='5' fill='rgb(242,230,200)'/><rect x='2' y='11.5' width='6.33' height='5' fill='rgb(201,185,138)'/><rect x='9.83' y='11.5' width='6.33' height='5' fill='rgb(201,185,138)'/><rect x='17.67' y='11.5' width='6.33' height='5' fill='rgb(201,185,138)'/>
<circle cx='30' cy='14' r='1.2' fill='rgb(139,125,88)'/><circle cx='34' cy='14' r='1.2' fill='rgb(139,125,88)'/>
<circle cx='68' cy='10' r='6.2' fill='none' stroke='rgb(90,163,224)' stroke-width='1'/><circle cx='68' cy='10' r='1.1' fill='rgb(90,163,224)'/>
<path d='M68 1.4 V4.6 M68 15.4 V18.6 M59.4 10 H62.6 M73.4 10 H76.6' stroke='rgb(90,163,224)' stroke-width='1'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='0' width='24' height='1.2' fill='rgb(107,123,78)'/><rect x='0' y='1.2' width='24' height='6' fill='rgb(38,33,24)'/><path d='M-12 7 H-6 L-1 2 H-7 Z' fill='rgb(72,63,43)'/><path d='M0 7 H6 L11 2 H5 Z' fill='rgb(72,63,43)'/><path d='M12 7 H18 L23 2 H17 Z' fill='rgb(72,63,43)'/><path d='M24 7 H30 L35 2 H29 Z' fill='rgb(72,63,43)'/><rect x='0' y='7.4' width='24' height='1.6' fill='rgb(58,69,41)'/><rect x='0' y='7.4' width='24' height='0.6' fill='rgb(139,125,88)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='0' y='0' width='8' height='24' fill='rgb(38,33,24)'/><rect x='0' y='0' width='1' height='24' fill='rgb(107,123,78)'/><rect x='7' y='0' width='1' height='24' fill='rgb(107,123,78)'/><rect x='1' y='0' width='6' height='24' fill='rgb(52,46,31)'/>
<rect x='2.2' y='3' width='3.6' height='0.8' fill='rgb(139,125,88)'/><rect x='2.2' y='6.4' width='3.6' height='0.8' fill='rgb(139,125,88)'/><rect x='2.2' y='16.8' width='3.6' height='0.8' fill='rgb(139,125,88)'/><rect x='2.2' y='20.2' width='3.6' height='0.8' fill='rgb(139,125,88)'/>
<circle cx='4' cy='12' r='2' fill='rgb(201,185,138)' stroke='rgb(26,23,18)' stroke-width='0.7'/><circle cx='3.4' cy='11.4' r='0.6' fill='rgb(242,230,200)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect x='0' y='0' width='8' height='8' fill='rgb(38,33,24)'/><rect x='0.6' y='0.6' width='6.8' height='6.8' fill='rgb(72,66,44)'/><path d='M0.6 7.4 V0.6 H7.4' fill='none' stroke='rgb(107,123,78)' stroke-width='1.2'/><circle cx='4.2' cy='4.2' r='1.6' fill='rgb(201,185,138)' stroke='rgb(26,23,18)' stroke-width='0.5'/><circle cx='3.8' cy='3.8' r='0.5' fill='rgb(242,230,200)'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='0' width='24' height='1.2' fill='rgb(107,123,78)'/><rect x='0' y='1.2' width='24' height='0.6' fill='rgb(139,125,88)'/><rect x='1' y='3.8' width='4' height='1.2' fill='rgb(139,125,88)'/><rect x='7' y='3.8' width='4' height='1.2' fill='rgb(139,125,88)'/><rect x='13' y='3.8' width='4' height='1.2' fill='rgb(139,125,88)'/><rect x='19' y='3.8' width='4' height='1.2' fill='rgb(139,125,88)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<rect x='3' y='8' width='4.88' height='3.4' fill='rgb(139,125,88)'/><rect x='9.38' y='8' width='4.88' height='3.4' fill='rgb(139,125,88)'/><rect x='15.75' y='8' width='4.88' height='3.4' fill='rgb(139,125,88)'/><rect x='22.13' y='8' width='4.88' height='3.4' fill='rgb(139,125,88)'/><rect x='9' y='15.5' width='5' height='3.4' fill='rgb(139,125,88)'/><rect x='15.5' y='15.5' width='5' height='3.4' fill='rgb(139,125,88)'/><rect x='22' y='15.5' width='5' height='3.4' fill='rgb(139,125,88)'/><rect x='15' y='23' width='5.25' height='3.4' fill='rgb(139,125,88)'/><rect x='21.75' y='23' width='5.25' height='3.4' fill='rgb(139,125,88)'/>
<circle cx='55' cy='17' r='14' fill='none' stroke='rgb(58,120,181)' stroke-width='1'/><circle cx='55' cy='17' r='9.5' fill='none' stroke='rgb(90,163,224)' stroke-width='0.7' stroke-dasharray='2 2'/>
<path d='M55 0.6 V5 M55 29 V33.4 M38.6 17 H43 M67 17 H71.4' stroke='rgb(90,163,224)' stroke-width='1.2'/>
<path d='M64 17 L53 14.4 L46.8 6 L43.6 7.6 L47.6 15.2 L42 16 V18 L47.6 18.8 L43.6 26.4 L46.8 28 L53 19.6 Z' fill='rgb(232,114,28)' stroke='rgb(138,62,10)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M53 15.6 L58 16.4 V17.6 L53 18.4 Z' fill='rgb(242,230,200)'/>
<circle cx='78' cy='7' r='0.7' fill='rgb(201,185,138)'/><circle cx='80' cy='27' r='0.6' fill='rgb(139,125,88)'/><circle cx='72' cy='30' r='0.6' fill='rgb(201,185,138)'/><circle cx='76' cy='14' r='0.5' fill='rgb(139,125,88)'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M3.6 19.6 V11.4 C3.6 5.2 7.2 1.8 11 1.8 C14.8 1.8 18.4 5.2 18.4 11.4 V19.6 Z' fill='rgb(232,114,28)' stroke='rgb(138,62,10)' stroke-width='1' stroke-linejoin='round'/>
<rect x='10' y='2' width='2' height='7' fill='rgb(242,230,200)'/>
<path d='M4.8 9.2 H17.2 V13.4 C17.2 15.2 14.8 16.2 11 16.2 C7.2 16.2 4.8 15.2 4.8 13.4 Z' fill='rgb(26,23,18)' stroke='rgb(138,62,10)' stroke-width='0.8' stroke-linejoin='round'/>
<path d='M6.4 10.8 H10' stroke='rgb(90,163,224)' stroke-width='0.9' stroke-linecap='round'/>
<rect x='4.4' y='17.4' width='4' height='2.2' rx='0.6' fill='rgb(242,230,200)' stroke='rgb(138,62,10)' stroke-width='0.5'/><rect x='13.6' y='17.4' width='4' height='2.2' rx='0.6' fill='rgb(242,230,200)' stroke='rgb(138,62,10)' stroke-width='0.5'/>
</svg>
```

### 4.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | rebel-pulse (title) | removed |
| 2 | banner-glow (banner icon) | removed |
| 3 | rebel-target (panno) | removed |
| 4 | rebel-lore (readout) | removed |
| 5 | rebel-hope (`#app`) | removed |
| 6 | rebel-starfield (`#particles`) | removed |
| hover | tile-radial .55s | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite star-wars-rebel.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 4.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** flat `#272318`, border `#6B7B4E` (1 px; 3.89:1 on the grid ground), radius 2px, `box-shadow: inset 0 -2px 0 #1A1712`, `::before` off; layout unchanged. Icons: `brightness(1.2) saturate(0.88)` through the app's own plate.
- **Hover:** flat `#35301D`, border `#E8721C` (4.31:1 on the hover fill), `box-shadow: inset 0 -2px 0 #E8721C`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (5.12:1 on the tile, 5.83:1 on the grid ground). **Pressed:** base scale 0.96 on flat `#3A321C`.
- **Label:** `#F2E6C8`, Trebuchet MS 400, 11.5 px, 0 px, user case.
- **Filter chip:** base rule (fill `#35301D`, `--accent-c` border, `#F29A52` text). The header scene hides while it shows.
- **Edit bar:** `#2E1A0C` fill, `#E8721C` rule, label `#F29A52`; `+ FILE` and `+ INSTALLED` in `--text` with a `#8A8A5E` border, `DONE` in `#F29A52` with a `#E8721C` border. The tile remove button is `#A8401A` with a `#F29A52` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#1A1712`, panel `#231F17`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#F29A52` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#F29A52` text on `#1F2A2E` with a `#5AA3E0` rule.

### 4.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite star-wars-rebel.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#5AA3E0`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (build **134.11**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#2A261B` surface with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 3 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a pilot helmet at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#E8721C` border and `inset 0 -2px 0 #E8721C`, the hover fill, the app's own plate, no ellipsis on CALCULATOR (mock 52.9 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): olive and khaki for the window, orange for the ring, hover, title dot, header tick, edit bar, helmet and fighter, hologram blue for the header line, reticle and update bar; no red except the remove button, no green, no violet.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 8 px, banner 4 px; at 640 x 420 10 / 8 / 13 px; at 1024 x 700 10 / 8 / 13 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Black Ops One` (the title; Trebuchet MS is a stock face and is not listed); a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 4** (title and banner text covered; my read of a render, not a fan test). What survives: an olive header with a blue hologram line, a khaki-black field with olive-edged tiles, webbing rails with rivets and hazard stripes, stencil blocks and a targeting reticle, an orange fighter locked in a hologram ring and an orange pilot helmet. What is missing for a 5: the starbird and squadron decals (marks, not drawn) and the saga type.

Watch items for this theme: (1) The orange fighter and the blue reticle are the loudest pair of colours in the batch (`#E8721C` against `#5AA3E0`). Lever: reticle ring `stroke-width` 1 to 0.7. (2) The helmet reads as a pilot helmet at 1x; a second read is a bell or a cartoon bee. Lever: a darker visor rim. (3) The hazard stripes are a low-contrast band (`#483F2B` on `#262118`, 1.54:1) and read as texture, not as warning stripes, at 1x; the 1.5x render is where to judge them (lever: stripe colour `#483F2B` to `#5A4F36`).

---

## 5. star-wars-sith (STAR WARS: SITH): DONE

**Audit:** score 3, tone down. Everything red: rose text (`#D88080`), red buttons and borders, a red triangle behind CALCULATOR and BROWSER with slash marks, the Sith code in the readout, header and banner. The red-black demon skin, not angular and ancient; no cold metal or amber. Seven infinite animations (one on hover).
**Direction:** obsidian with a crimson edge-light. A near-black ground (`#0A0708`) with **neutral** type (`#DCD6D2`), cold-metal borders (`#666A70`), oxblood hover fills and crimson used as a line and a light, never a wash: a 3 px edge-light under the header, a thin blade of light in each side slot, a rule over the banner, the hover underline, the ring. The window has jagged cut corners (14 px and 8 px), the frame is black glass: slashes along the top under the edge-light, black slots with a red blade line and metal notches down both sides, chamfered brackets. The header carries three inverted talons hanging from a metal rail with a red edge each; the banner carries an open holocron (a cube with its lid lifted on amber light, a few shards) and its icon is a red-bladed saber. Amber appears only in the holocron and the update bar. Oxanium 700 title (bundled, angular), uppercase Bahnschrift SemiCondensed labels. Static.

### 5.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: polygon(14px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 8px 100%, 0 calc(100% - 8px), 0 14px);
  --overlay-clip: polygon(14px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 8px 100%, 0 calc(100% - 8px), 0 14px);
  --bg: #0A0708;
  --panel-bg: #110C0E;
  --overlay-bg: #0A0708;
  --header-bg: #150E10;
  --font: Bahnschrift, 'Segoe UI', sans-serif;
  --text: #DCD6D2;
  --text-dim: #ABA39F;
  --accent-c: #E5333B;
  --accent-m: #FF6B72;
  --accent-y: #E5333B;
  --accent-text: #FF7E84;
  --border: #666A70;
  --border-h: #E5333B;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #E5333B;
  --title-anim: none;
  --tile-hover-bg: #2A0C10;
  --tile-hover-border: #E5333B;
  --tile-hover-shadow: inset 0 -2px 0 #E5333B;
  --tile-active-bg: #3A1016;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.1) saturate(0.88);
  --tile-icon-shape: polygon(0 0, 74% 0, 100% 26%, 100% 100%, 0 100%);
  --tile-label-spacing: 0.5px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #3A1016;
  --btn-active-bg: #4F161E;
  --drop-hint-border: #4A4E54;
  --drop-icon-color: #7A5058;
  --hint-sub-color: #ABA39F;
  --rename-dashed: #E5333B;
  --rename-input-bg: #2A0C10;
  --edit-bar-bg: #2A0A0E;
  --edit-bar-border: #B3121A;
  --edit-label-color: #FF6B72;
  --edit-label-glow: none;
  --btn-done-color: #FF6B72;
  --btn-done-border: #B3121A;
  --btn-done-hover-bg: #471218;
  --btn-done-hover-glow: none;
  --btn-add-border: #9EA2A8;
  --update-bg: #171114;
  --update-border: #E0A030;
  --update-color: #FF7E84;
  --update-btn-border: #E0A030;
  --update-btn-hover-bg: #2A1C0C;
  --update-btn-hover-glow: none;
  --btn-close-color: #FF7E84;
  --btn-close-border: #B3121A;
  --btn-close-hover-bg: #2A0C10;
  --btn-close-hover-glow: none;
  --picker-search-bg: #2A0C10;
  --picker-item-hover-bg: #2A0C10;
  --picker-item-active-bg: #3A1016;
  --picker-placeholder-bg: #2A0C10;
  --skin-btn-active-bg: #3A1016;
  --remove-btn-bg: #B3121A;
  --remove-btn-border: #FF8A90;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#DCD6D2` on `#0A0708` | 4.5:1 | **13.94:1** |
| `--text-dim` on `--bg` | `#ABA39F` on `#0A0708` | 4.5:1 | **8.09:1** |
| `--accent-c` on `--bg` | `#E5333B` on `#0A0708` | 3:1 | **4.65:1** |
| `--accent-text` on `--bg` | `#FF7E84` on `#0A0708` | 3:1 | **8.19:1** |
| `--hint-sub-color` on `--bg` | `#ABA39F` on `#0A0708` | 4.5:1 | **8.09:1** |
| `--btn-close-color` on `--panel-bg` | `#FF7E84` on `#110C0E` | 4.5:1 | **7.91:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the worst stop** (the lightest stop), except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#DCD6D2` on `#150F11` | 4.5:1 | **13.17:1** |
| Tile label on tile hover | `#DCD6D2` on `#2A0C10` | 4.5:1 | **12.60:1** |
| Tile label on tile pressed (pressed state) | `#DCD6D2` on `#3A1016` | 4.5:1 | **11.53:1** |
| Title on header | `#EAE3E0` on `#150E10` | 4.5:1 | **15.03:1** |
| Title dot (`.accent`) on header | `#FF5A62` on `#150E10` | 4.5:1 | **6.25:1** |
| Header version on header | `#ABA39F` on `#150E10` | 4.5:1 | **7.69:1** |
| Header button glyph on header | `#DCD6D2` on `#150E10` | 4.5:1 | **13.24:1** |
| Header button glyph on button hover | `#FFFFFF` on `#3A1016` | 4.5:1 | **16.59:1** |
| Filter chip text on chip | `#FF7E84` on `#2A0C10` | 4.5:1 | **7.40:1** |
| Filter chip clear glyph on hover on chip | `#FFFFFF` on `#2A0C10` | 4.5:1 | **18.13:1** |
| Banner text on banner | `#DCD6D2` on `#0F090B` | 4.5:1 | **13.71:1** |
| Header line on header (non-text) | `#E5333B` on `#0F090B` | 3:1 | **4.57:1** |
| Edit label on edit bar | `#FF6B72` on `#2A0A0E` | 4.5:1 | **6.62:1** |
| Done / close button text on edit bar | `#FF6B72` on `#2A0A0E` | 4.5:1 | **6.62:1** |
| + FILE / + INSTALLED text on edit bar | `#DCD6D2` on `#2A0A0E` | 4.5:1 | **12.71:1** |
| Done button text on its hover fill | `#FF6B72` on `#471218` | 4.5:1 | **5.56:1** |
| Settings text on overlay | `#DCD6D2` on `#0A0708` | 4.5:1 | **13.94:1** |
| Settings text on panel | `#DCD6D2` on `#110C0E` | 4.5:1 | **13.48:1** |
| Settings label (text-dim) on panel | `#ABA39F` on `#110C0E` | 4.5:1 | **7.82:1** |
| Settings value / cheat key (accent-text) on panel | `#FF7E84` on `#110C0E` | 4.5:1 | **7.91:1** |
| Settings version value (accent-text) on panel | `#FF7E84` on `#110C0E` | 4.5:1 | **7.91:1** |
| Settings CLOSE text on panel | `#FF7E84` on `#110C0E` | 4.5:1 | **7.91:1** |
| Settings CLOSE text on its hover fill | `#FF7E84` on `#2A0C10` | 4.5:1 | **7.40:1** |
| Hotkey error text (accent-m) on panel | `#FF6B72` on `#110C0E` | 4.5:1 | **7.02:1** |
| Hotkey input text on input fill | `#FF7E84` on `#2A0C10` | 4.5:1 | **7.40:1** |
| Picker row text on hover fill | `#FF7E84` on `#2A0C10` | 4.5:1 | **7.40:1** |
| Update banner text on update bar | `#FF7E84` on `#171114` | 4.5:1 | **7.61:1** |
| Update button text on hover fill | `#FFFFFF` on `#2A1C0C` | 4.5:1 | **16.54:1** |
| Drop-hint text (text-dim) on grid ground | `#ABA39F` on `#0A0708` | 4.5:1 | **8.09:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#B3121A` | 3:1 | **6.96:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#B3121A` | 3:1 | **6.96:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#E5333B` on `#150F11` | 3:1 | **4.39:1** |
| Focus ring on grid ground (non-text) | `#E5333B` on `#0A0708` | 3:1 | **4.65:1** |
| Hover border on grid ground (non-text) | `#E5333B` on `#0A0708` | 3:1 | **4.65:1** |
| Hover border on hover fill (non-text) | `#E5333B` on `#2A0C10` | 3:1 | **4.20:1** |
| Theme-picker selected row text (accent-text) on active fill | `#FF7E84` on `#3A1016` | 4.5:1 | **6.77:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#FF7E84` on `#2A0C10` | 4.5:1 | **7.40:1** |
| Skin search input text (accent-text) on panel | `#FF7E84` on `#110C0E` | 4.5:1 | **7.91:1** |
| Apps-picker search input text (accent-text) on search fill | `#FF7E84` on `#2A0C10` | 4.5:1 | **7.40:1** |
| Rename input text (accent-text) on input fill | `#FF7E84` on `#2A0C10` | 4.5:1 | **7.40:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#ABA39F` on `#2A0C10` | 4.5:1 | **7.31:1** |
| Skin search placeholder (text-dim, themed) on panel | `#ABA39F` on `#110C0E` | 4.5:1 | **7.82:1** |
| Apps-picker placeholder (text-dim) on search fill | `#ABA39F` on `#2A0C10` | 4.5:1 | **7.31:1** |
| Hotkey recording text (accent-m) on input fill | `#FF6B72` on `#2A0C10` | 4.5:1 | **6.56:1** |
| Update dismiss glyph (text-dim) on update bar | `#ABA39F` on `#171114` | 4.5:1 | **7.52:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#ABA39F` on `#110C0E` | 3:1 | **7.82:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#E5333B` on `#110C0E` | 3:1 | **4.50:1** |
| Tile border on grid ground (non-text) | `#666A70` on `#0A0708` | 3:1 | **3.69:1** |
| Update bar rule (amber) on update bar (non-text) | `#E0A030` on `#171114` | 3:1 | **8.20:1** |

**Lowest ratio in this theme: 3.69:1 (Tile border on grid ground (non-text), non-text).** Lowest text ratio: 5.56:1 (Done button text on its hover fill). Lowest non-text ratio: 3.69:1 (Tile border on grid ground (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | First stop (top) | Last stop (bottom) |
|---|---|---|
| Header | `#150E10` | `#0F090B` |
| Tile at rest | `#150F11` | `#150F11` |
| Tile hover and focus | `#2A0C10` | `#2A0C10` |
| Tile pressed | `#3A1016` | `#3A1016` |
| Banner | `#0F090B` | `#0F090B` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.1) saturate(0.88)`; mock plates from the gallery; the columns name the **worst stop** of each tile surface):

| Icon plate (mock) | After fx | Rest `#150F11` | Hover `#2A0C10` | Pressed `#3A1016` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#688BB1` | 5.34:1 | 5.11:1 | 4.67:1 | pass |
| Calculator `#6b6f76` | `#767A81` | 4.40:1 | 4.20:1 | 3.85:1 | pass |
| Paint `#b07a4f` | `#BC875E` | 6.10:1 | 5.84:1 | 5.35:1 | pass |
| Terminal `#3d4450` | `#444B56` | 2.15:1 | 2.06:1 | 1.89:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#5D9697` | 5.66:1 | 5.42:1 | 4.96:1 | pass |
| Files `#c09a3e` | `#CEAA51` | 8.57:1 | 8.19:1 | 7.50:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.85:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Crimson `#E5333B` is `--accent-c` (4.65:1 on the ground; the audit's `#B3121A` is 2.88:1, under the 3:1 the gate asks of `--accent-c`) and the edge-light colour; `#B3121A` is the edit bar rule and the remove button fill. Small crimson text is `#FF7E84` (`--accent-text`) and `#FF6B72` (edit and errors). Cold metal `#666A70` is the border (3.69:1). Amber `#E0A030` is the update bar rule only.

### 5.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | Bahnschrift, 'Segoe UI', sans-serif |
| `#title` | Oxanium 700 (bundled), 12 px, tracking 4 px, uppercase from the markup, `font-stretch: 87.5%` kept (Oxanium has no width axis, so it only shapes the Bahnschrift fallback), `font-synthesis: none`, `line-height: 1.2` |
| `.tile-label` | Bahnschrift 600 SemiCondensed, 11 px with `line-height: 13.8px` (keeps the tile at 94.8 px), 0.5 px, **uppercase** (`--tile-label-transform`); `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | Bahnschrift 500 SemiCondensed, 12 px, 0.6 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 147.22** (Oxanium 700 at 12 px with 4 px tracking, Ender's Electron figure, reproduced in the review; gate 156; 8.78 px under, 20.78 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700 and at 1x, 1.5x and 2x. The six standard labels in the 100 px box (ink widths): NOTEPAD 43.3, CALCULATOR 60.2, PAINT 27.7, TERMINAL 47.5, BROWSER 46.0, FILES 26.6 px, no ellipsis; the long names "Visual Studio 2022" 95, "Notepad++ x64" 74, "7-Zip 23.01" 52, "Калькулятор" 69 and "Жёсткий диск" 77 px fit, and "Проводник Windows" (107 px) ellipsizes (the base 100 px box, offer b of B4R). Tile height 94.80 px (94.7 to 95.4 required) at every scale. Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; positive control (a 6 px line height cuts the tails): **2 px**; with Cyrillic tails ("Щука Цирк", "Цирк Щи", "Цц Щщ Джем", "QJ jq Gg") built 0 px, control 72 px. **Platform fonts drawn:** title Oxanium (web) x12; labels Bahnschrift x7; banner Bahnschrift x38; version and settings Bahnschrift x7. Expected `fontsRendered` for the web faces: `Oxanium` (200 to 800).

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **One step was taken:** Oxanium 700 at 12 px measures **159.22 px at 5 px tracking** (over the gate), so the title takes **4 px** (147.22); the first text, built in Bahnschrift SemiCondensed, had 5 px at 140.77. **Cyrillic:** Oxanium has none (a Cyrillic string falls to the fallback glyph by glyph), which is why only the title uses it; the labels, banner and body stay Bahnschrift (checked: "Калькулятор", "Жёсткий диск"), and the labels are uppercase.

### 5.3 Art (tone down with a new frame). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #150E10 0, #0F090B 100%); border-bottom-color: #E5333B; box-shadow: inset 0 -2px 0 #E5333B; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #E5333B; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): three inverted talons (outlined triangles with a crimson edge) hanging from a cold-metal rail. Painted pixels at x 170.0 to 250.0, y 11.5 to 29.5. Hidden while the chip shows. The title ends at x 147.22, the scene starts at x 168: 20.78 px clear.

**B. Frame (the kit of 0.3).** the side bands are black slots with metal edges, a crimson blade line (a thin glow beside it) and a pair of angular metal notches every 24 px; the top course is a 1.6 px crimson edge-light over four slashes per 24 px in oxblood, on a metal base line; each corner is a chamfered metal bracket with a red inner line. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 11 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700); at Sergei's 1.5x the smallest art-to-ring gap is 3.33 css px.

**C. Banner.** the banner is the flat `#0F090B` with a crimson top border; its top course is a crimson edge-light over a zigzag in cold metal; the icon is a **saber** (a red blade with a white core and a glow, a metal hilt with grooves, on the diagonal); the right end is an **open holocron**: a cube with a lifted lid, an amber opening with a pale centre, red cut lines on both faces, light rays rising to the lid and three shards, with four stars. The motif's painted pixels are at x 335.4 to 407.6, y 266.0 to 300.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 80.8 px (0.8). The banner row of the probe reads 4 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: a polygon with eight points: cuts of 14 px at top left and bottom right and 8 px at top right and bottom left (`--overlay-clip` is the same value). Tiles: black-glass cards (`#150F11`), a 1 px cold-metal border, square corners; hover is an oxblood fill (`#2A0C10`), a crimson border and a 2 px crimson underline; the plate has one sharp cut at the top right, 26 percent: `polygon(0 0, 74% 0, 100% 26%, 100% 100%, 0 100%)`. A V-bottom plate (the "talon") was tried and rejected: it crops the foobar2000 icon's F, B, 2 and K at the bottom and the laptop base (GlideX loses 11.3 percent of the plate, the file icon 6.6). Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 10.15, Calculator 8.56, Paint 11.13, Terminal 6.44, Browser 11.63, Files 11.13 (smallest 6.44); nothing is cropped. **Real icons** (B5R F1): the share of the plate lost to the cut, drop shadow off, cut against uncut: GlideX 3%, foobar2000 file icon 0%, QuickLaunch icon 0.6%, BlueStacks 0.23%, BlueStacks logo 0.23%, Android Studio 0%; every mark whole at 6x (corners of a full-bleed background only).

**Trademark note.** The Sith Empire and Sith Order emblems, Vader's helmet, Sidious' robes, the Sith code as text and any specific holocron model are not drawn. The talons, the saber, the cube and the shards are generic.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B3121A; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { background: linear-gradient(180deg, #150E10 0, #0F090B 100%); border-bottom-color: #E5333B; box-shadow: inset 0 -2px 0 #E5333B; }
#header::before { background: #E5333B; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Oxanium, Bahnschrift, 'Segoe UI', sans-serif; font-weight: 700; font-stretch: 87.5%; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 12px; letter-spacing: 4px; color: #EAE3E0; text-shadow: none; }
#title .accent { color: #FF5A62; }

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

/* tiles */
.app-tile { background: #150F11; border-color: #666A70; border-radius: 0px; box-shadow: none; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: #2A0C10; border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: #3A1016; }
.tile-label { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-size: 11px; line-height: 13.8px; font-stretch: 87.5%; font-synthesis: none; overflow: clip; overflow-clip-margin: 3px; }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, #0F090B;
  border-top-color: #B3121A;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 500; font-stretch: 87.5%; font-style: normal; font-synthesis: none; letter-spacing: 0.6px; color: #DCD6D2; margin-right: 90px; }
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
<rect x='2' y='1.5' width='80' height='1' fill='rgb(102,106,112)'/>
<path d='M13 2.5 H31 L22 16.5 Z' fill='rgb(24,16,18)' stroke='rgb(158,162,168)' stroke-width='0.8' stroke-linejoin='round'/><path d='M22 16.5 L31 2.5' stroke='rgb(229,51,59)' stroke-width='1.1'/>
<path d='M32 2.5 H52 L42 19 Z' fill='rgb(24,16,18)' stroke='rgb(158,162,168)' stroke-width='0.8' stroke-linejoin='round'/><path d='M42 19 L52 2.5' stroke='rgb(229,51,59)' stroke-width='1.3'/><path d='M42 19 L37 11' stroke='rgb(74,10,14)' stroke-width='1'/>
<path d='M53 2.5 H71 L62 16.5 Z' fill='rgb(24,16,18)' stroke='rgb(158,162,168)' stroke-width='0.8' stroke-linejoin='round'/><path d='M62 16.5 L71 2.5' stroke='rgb(229,51,59)' stroke-width='1.1'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='0' width='24' height='1.6' fill='rgb(179,18,26)'/><rect x='0' y='1.6' width='24' height='0.5' fill='rgb(74,10,14)'/>
<path d='M2 7.6 L5.4 3 H8 L4.6 7.6 Z M10 7.6 L13.4 3 H16 L12.6 7.6 Z M18 7.6 L21.4 3 H24 L20.6 7.6 Z' fill='rgb(44,30,34)' stroke='rgb(62,64,70)' stroke-width='0.5' stroke-linejoin='round'/><rect x='0' y='8' width='24' height='1' fill='rgb(62,64,70)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='0' y='0' width='8' height='24' fill='rgb(10,7,8)'/><rect x='0' y='0' width='1' height='24' fill='rgb(62,64,70)'/><rect x='7' y='0' width='1' height='24' fill='rgb(62,64,70)'/><rect x='3.1' y='0' width='1.8' height='24' fill='rgb(74,10,14)'/><rect x='3.5' y='0' width='1' height='24' fill='rgb(179,18,26)'/>
<path d='M1 10 L3.2 12 L1 14 Z M7 10 L4.8 12 L7 14 Z' fill='rgb(102,106,112)'/><rect x='3.7' y='9' width='0.6' height='6' fill='rgb(229,51,59)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect x='0' y='0' width='8' height='8' fill='rgb(10,7,8)'/><path d='M0.6 7.4 V2.4 L2.4 0.6 H7.4' fill='none' stroke='rgb(158,162,168)' stroke-width='1.1' stroke-linejoin='miter'/><path d='M2.4 7.4 V3.4 L3.4 2.4 H7.4' fill='none' stroke='rgb(229,51,59)' stroke-width='0.8'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='0' width='24' height='1.4' fill='rgb(179,18,26)'/><rect x='0' y='1.4' width='24' height='0.5' fill='rgb(74,10,14)'/><path d='M0 5.6 L4 3.2 L8 5.6 L12 3.2 L16 5.6 L20 3.2 L24 5.6' fill='none' stroke='rgb(102,106,112)' stroke-width='0.8' stroke-linejoin='miter'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>

<path d='M26 21 L29.4 11 L32 18 Z' fill='rgb(44,30,34)' stroke='rgb(102,106,112)' stroke-width='0.6' stroke-linejoin='round'/><path d='M66 23 L70 13 L71 22 Z' fill='rgb(44,30,34)' stroke='rgb(102,106,112)' stroke-width='0.6' stroke-linejoin='round'/><path d='M62 30 L65 25 L66 30 Z' fill='rgb(44,30,34)' stroke='rgb(102,106,112)' stroke-width='0.5' stroke-linejoin='round'/>
<path d='M35 15.5 L47 9.5 L59 15.5 L47 21.5 Z' fill='rgb(224,160,48)' stroke='rgb(158,162,168)' stroke-width='0.8' stroke-linejoin='round'/>
<path d='M40 15.5 L47 12 L54 15.5 L47 19 Z' fill='rgb(255,208,120)'/>
<path d='M38 14 L40 7.4 M47 11 V5 M56 14 L54 7.4' stroke='rgb(224,160,48)' stroke-width='1.1' stroke-opacity='0.55' stroke-linecap='round'/>
<path d='M35 15.5 L47 21.5 V33.5 L35 27.5 Z' fill='rgb(24,16,18)' stroke='rgb(158,162,168)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M59 15.5 L47 21.5 V33.5 L59 27.5 Z' fill='rgb(10,7,8)' stroke='rgb(158,162,168)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M38 20.4 L44 23.4 M38 24 L44 27' stroke='rgb(229,51,59)' stroke-width='1'/><path d='M50 24 L56 21 M50 28 L56 25' stroke='rgb(179,18,26)' stroke-width='1'/>
<path d='M35 6 L47 0.4 L59 6 L47 12 Z' fill='rgb(44,30,34)' stroke='rgb(158,162,168)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M35 6 L47 12 V14.2 L35 8.2 Z' fill='rgb(24,16,18)' stroke='rgb(158,162,168)' stroke-width='0.7' stroke-linejoin='round'/><path d='M59 6 L47 12 V14.2 L59 8.2 Z' fill='rgb(10,7,8)' stroke='rgb(158,162,168)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M41 6 L47 3 L53 6' fill='none' stroke='rgb(229,51,59)' stroke-width='0.9'/>
<circle cx='8' cy='8' r='0.6' fill='rgb(102,106,112)'/><circle cx='14' cy='27' r='0.6' fill='rgb(102,106,112)'/><circle cx='78' cy='6' r='0.6' fill='rgb(102,106,112)'/><circle cx='79' cy='26' r='0.6' fill='rgb(102,106,112)'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<g transform='rotate(45 11 11)'>
<rect x='9.2' y='-1' width='3.6' height='15.6' rx='1.8' fill='rgb(179,18,26)' fill-opacity='0.55'/>
<rect x='9.9' y='-0.4' width='2.2' height='15' rx='1.1' fill='rgb(229,51,59)'/><rect x='10.6' y='0.6' width='0.8' height='13.6' rx='0.4' fill='rgb(255,238,232)'/>
<rect x='9.4' y='14.6' width='3.2' height='1.6' fill='rgb(158,162,168)' stroke='rgb(10,7,8)' stroke-width='0.4'/>
<rect x='9.6' y='16.2' width='2.8' height='5.4' fill='rgb(102,106,112)' stroke='rgb(10,7,8)' stroke-width='0.5'/><rect x='9.6' y='17.4' width='2.8' height='0.7' fill='rgb(10,7,8)'/><rect x='9.6' y='19.2' width='2.8' height='0.7' fill='rgb(10,7,8)'/></g>
</svg>
```

### 5.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | sith-title (title) | removed |
| 2 | banner-throb (banner icon) | removed |
| 3 | sith-holocron (panno) | removed |
| 4 | sith-readout (readout) | removed |
| 5 | sith-border (`#app`) | removed |
| 6 | sith-energy (`#particles`) | removed |
| hover | tile-flicker .5s steps(1, end) **infinite** | removed (`.app-tile::before` is `display:none`) |

**Before 7, after 0.** `grep -c infinite star-wars-sith.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 5.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** flat `#150F11`, border `#666A70` (1 px; 3.69:1 on the grid ground), radius 0px, no lit edge, `::before` off; layout unchanged. Icons: `brightness(1.1) saturate(0.88)` through the shaped plate (D in 3).
- **Hover:** flat `#2A0C10`, border `#E5333B` (4.20:1 on the hover fill), `box-shadow: inset 0 -2px 0 #E5333B`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (4.39:1 on the tile, 4.65:1 on the grid ground). **Pressed:** base scale 0.96 on flat `#3A1016`.
- **Label:** `#DCD6D2`, Bahnschrift 600 SemiCondensed, 11 px with `line-height: 13.8px` (keeps the tile at 94.8 px), 0.5 px, **uppercase** (`--tile-label-transform`).
- **Filter chip:** base rule (fill `#2A0C10`, `--accent-c` border, `#FF7E84` text). The header scene hides while it shows.
- **Edit bar:** `#2A0A0E` fill, `#B3121A` rule, label `#FF6B72`; `+ FILE` and `+ INSTALLED` in `--text` with a `#9EA2A8` border, `DONE` in `#FF6B72` with a `#B3121A` border. The tile remove button is `#B3121A` with a `#FF8A90` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#0A0708`, panel `#110C0E`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#FF7E84` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#FF7E84` text on `#171114` with a `#E0A030` rule.

### 5.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite star-wars-sith.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#E5333B`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (build **147.22**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#0F090B` surface with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 3 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a saber at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#E5333B` border and `inset 0 -2px 0 #E5333B`, the hover fill, the shaped plate with no cropped glyph, no ellipsis on CALCULATOR (mock 60.2 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): neutral grey-white type and cold-metal borders; crimson only as lines and lights (header edge-light, slot blades, banner rule, hover underline, ring, edit bar, remove button); oxblood for hover fills; amber only in the holocron and the update bar rule; no violet, no green.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 11 px, frame 8 px, banner 4 px; at 640 x 420 11 / 8 / 12 px; at 1024 x 700 11 / 8 / 12 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Oxanium` (the title; Bahnschrift is a stock face and is not listed); a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 4** (title and banner text covered; my read of a render, not a fan test). What survives: a black window with a crimson edge-light under the header and over the banner, red blade lines in the side slots, three inverted talons, a lifted holocron lid on amber light, a red saber. What is missing for a 5: the Sith emblem and the robed figure (marks and character design, not drawn); the saber is the single most Star Wars object in the batch and carries the read.

Watch items for this theme: (1) Four crimson lines frame the window (header, both slots, banner): the most red in the batch. Colour is a line, not a fill; lever: side blade `CR` to `OX`. (2) The holocron reads as an open box or a treasure chest to some eyes; the lifted lid and the amber light make it a holocron for a fan. Lever: add a fifth shard above the lid. (3) The cut top-right plate is one sharp corner; on a real icon with its own dog-ear (the foobar2000 file icon) the cut and the dog-ear line up and nothing is lost.

---

## 6. star-wars-mando (STAR WARS: MANDALORIAN): DONE

**Audit:** score 3, redraw. Dusty grey and amber is the right neighbourhood, but a helmet-shield outline was drawn behind the whole centre column (too close to reproducing the character design), a lozenge ran through the CALCULATOR label, creed text ran down the right side; beskar read flat, not brushed steel; the T-notch icon crop and "T" banner icon were good. Six infinite animations.
**Direction:** riveted steel and rust, a dusty frontier. A brown-black ground (`#17130F`), a warm dark steel header (`#34312C` to `#25221E`) under a 3 px beskar line, tiles in dark steel with a beskar-grey border and a lit top edge, rust on the header tick, the ring and the edit bar, **forge** orange only on hover. The frame is a riveted plate: a weld bead and rivets along the top, riveted plates with a rust patch and a drip down both sides, bolted triangular corners. The header carries a pauldron plate (arched beskar with two score lines and a rust-painted half) on a riveted rail; the banner carries twin suns over two dune lines (the left edge of the dunes fades in) and its icon is a bounty puck (a thick beskar disc at an angle with a ring and a forge light). One dented corner (bottom right, 14 px) on the window and the plates. Dela Gothic One for the title (wide and heavy, like the show's title card), Segoe UI Semibold for the rest. Static, no dust.

### 6.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%);
  --overlay-clip: polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%);
  --bg: #17130F;
  --panel-bg: #1E1913;
  --overlay-bg: #17130F;
  --header-bg: #34312C;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #E8DEC9;
  --text-dim: #BDB19A;
  --accent-c: #B4632D;
  --accent-m: #F0956A;
  --accent-y: #B4632D;
  --accent-text: #E8905A;
  --border: #6A7076;
  --border-h: #D48A24;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #B4632D;
  --title-anim: none;
  --tile-hover-bg: #33261A;
  --tile-hover-border: #D48A24;
  --tile-hover-shadow: inset 0 -2px 0 #D48A24;
  --tile-active-bg: #3D2C1A;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: brightness(1.2) saturate(0.85);
  --tile-icon-shape: polygon(0 0, 100% 0, 100% 74%, 74% 100%, 0 100%);
  --tile-label-spacing: 0.1px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #4A433A;
  --btn-active-bg: #5C5348;
  --drop-hint-border: #5A5348;
  --drop-icon-color: #8C959C;
  --hint-sub-color: #BDB19A;
  --rename-dashed: #B4632D;
  --rename-input-bg: #33261A;
  --edit-bar-bg: #2E170C;
  --edit-bar-border: #B4632D;
  --edit-label-color: #F0956A;
  --edit-label-glow: none;
  --btn-done-color: #F0956A;
  --btn-done-border: #B4632D;
  --btn-done-hover-bg: #4A2610;
  --btn-done-hover-glow: none;
  --btn-add-border: #8C959C;
  --update-bg: #1E1913;
  --update-border: #D48A24;
  --update-color: #E8905A;
  --update-btn-border: #D48A24;
  --update-btn-hover-bg: #33261A;
  --update-btn-hover-glow: none;
  --btn-close-color: #E8905A;
  --btn-close-border: #B4632D;
  --btn-close-hover-bg: #33261A;
  --btn-close-hover-glow: none;
  --picker-search-bg: #33261A;
  --picker-item-hover-bg: #33261A;
  --picker-item-active-bg: #3D2C1A;
  --picker-placeholder-bg: #33261A;
  --skin-btn-active-bg: #3D2C1A;
  --remove-btn-bg: #A8401A;
  --remove-btn-border: #F0956A;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#E8DEC9` on `#17130F` | 4.5:1 | **13.83:1** |
| `--text-dim` on `--bg` | `#BDB19A` on `#17130F` | 4.5:1 | **8.73:1** |
| `--accent-c` on `--bg` | `#B4632D` on `#17130F` | 3:1 | **4.19:1** |
| `--accent-text` on `--bg` | `#E8905A` on `#17130F` | 3:1 | **7.54:1** |
| `--hint-sub-color` on `--bg` | `#BDB19A` on `#17130F` | 4.5:1 | **8.73:1** |
| `--btn-close-color` on `--panel-bg` | `#E8905A` on `#1E1913` | 4.5:1 | **7.12:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text; **for a gradient surface the row uses the worst stop** (the lightest stop), except the header line, which sits on the darkest end of the header):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E8DEC9` on `#231D16` | 4.5:1 | **12.49:1** |
| Tile label on tile hover | `#E8DEC9` on `#33261A` | 4.5:1 | **10.97:1** |
| Tile label on tile pressed (pressed state) | `#E8DEC9` on `#3D2C1A` | 4.5:1 | **9.99:1** |
| Title on header | `#E8DEC9` on `#34312C` | 4.5:1 | **9.70:1** |
| Title dot (`.accent`) on header | `#E8905A` on `#34312C` | 4.5:1 | **5.28:1** |
| Header version on header | `#BDB19A` on `#34312C` | 4.5:1 | **6.12:1** |
| Header button glyph on header | `#E8DEC9` on `#34312C` | 4.5:1 | **9.70:1** |
| Header button glyph on button hover | `#FFFFFF` on `#4A433A` | 4.5:1 | **9.74:1** |
| Filter chip text on chip | `#E8905A` on `#33261A` | 4.5:1 | **5.98:1** |
| Filter chip clear glyph on hover on chip | `#FFFFFF` on `#33261A` | 4.5:1 | **14.66:1** |
| Banner text on banner | `#E8DEC9` on `#3E2814` | 4.5:1 | **10.35:1** |
| Header line on header (non-text) | `#8C959C` on `#25221E` | 3:1 | **5.20:1** |
| Edit label on edit bar | `#F0956A` on `#2E170C` | 4.5:1 | **7.41:1** |
| Done / close button text on edit bar | `#F0956A` on `#2E170C` | 4.5:1 | **7.41:1** |
| + FILE / + INSTALLED text on edit bar | `#E8DEC9` on `#2E170C` | 4.5:1 | **12.64:1** |
| Done button text on its hover fill | `#F0956A` on `#4A2610` | 4.5:1 | **5.85:1** |
| Settings text on overlay | `#E8DEC9` on `#17130F` | 4.5:1 | **13.83:1** |
| Settings text on panel | `#E8DEC9` on `#1E1913` | 4.5:1 | **13.06:1** |
| Settings label (text-dim) on panel | `#BDB19A` on `#1E1913` | 4.5:1 | **8.24:1** |
| Settings value / cheat key (accent-text) on panel | `#E8905A` on `#1E1913` | 4.5:1 | **7.12:1** |
| Settings version value (accent-text) on panel | `#E8905A` on `#1E1913` | 4.5:1 | **7.12:1** |
| Settings CLOSE text on panel | `#E8905A` on `#1E1913` | 4.5:1 | **7.12:1** |
| Settings CLOSE text on its hover fill | `#E8905A` on `#33261A` | 4.5:1 | **5.98:1** |
| Hotkey error text (accent-m) on panel | `#F0956A` on `#1E1913` | 4.5:1 | **7.65:1** |
| Hotkey input text on input fill | `#E8905A` on `#33261A` | 4.5:1 | **5.98:1** |
| Picker row text on hover fill | `#E8905A` on `#33261A` | 4.5:1 | **5.98:1** |
| Update banner text on update bar | `#E8905A` on `#1E1913` | 4.5:1 | **7.12:1** |
| Update button text on hover fill | `#FFFFFF` on `#33261A` | 4.5:1 | **14.66:1** |
| Drop-hint text (text-dim) on grid ground | `#BDB19A` on `#17130F` | 4.5:1 | **8.73:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#A8401A` | 3:1 | **6.15:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#A8401A` | 3:1 | **6.15:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#B4632D` on `#231D16` | 3:1 | **3.78:1** |
| Focus ring on grid ground (non-text) | `#B4632D` on `#17130F` | 3:1 | **4.19:1** |
| Hover border on grid ground (non-text) | `#D48A24` on `#17130F` | 3:1 | **6.56:1** |
| Hover border on hover fill (non-text) | `#D48A24` on `#33261A` | 3:1 | **5.21:1** |
| Theme-picker selected row text (accent-text) on active fill | `#E8905A` on `#3D2C1A` | 4.5:1 | **5.44:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#E8905A` on `#33261A` | 4.5:1 | **5.98:1** |
| Skin search input text (accent-text) on panel | `#E8905A` on `#1E1913` | 4.5:1 | **7.12:1** |
| Apps-picker search input text (accent-text) on search fill | `#E8905A` on `#33261A` | 4.5:1 | **5.98:1** |
| Rename input text (accent-text) on input fill | `#E8905A` on `#33261A` | 4.5:1 | **5.98:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#BDB19A` on `#33261A` | 4.5:1 | **6.92:1** |
| Skin search placeholder (text-dim, themed) on panel | `#BDB19A` on `#1E1913` | 4.5:1 | **8.24:1** |
| Apps-picker placeholder (text-dim) on search fill | `#BDB19A` on `#33261A` | 4.5:1 | **6.92:1** |
| Hotkey recording text (accent-m) on input fill | `#F0956A` on `#33261A` | 4.5:1 | **6.43:1** |
| Update dismiss glyph (text-dim) on update bar | `#BDB19A` on `#1E1913` | 4.5:1 | **8.24:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#BDB19A` on `#1E1913` | 3:1 | **8.24:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#B4632D` on `#1E1913` | 3:1 | **3.96:1** |
| Tile border on grid ground (non-text) | `#6A7076` on `#17130F` | 3:1 | **3.69:1** |
| Update bar rule (forge) on update bar (non-text) | `#D48A24` on `#1E1913` | 3:1 | **6.20:1** |

**Lowest ratio in this theme: 5.28:1 (Title dot (`.accent`) on header).** Lowest text ratio: 5.28:1 (Title dot (`.accent`) on header). Lowest non-text ratio: 3.69:1 (Tile border on grid ground (non-text)). Every pair clears AA; nothing is estimated.

**Surfaces** (static; the rules in 3 write them):

| Surface | First stop (top) | Last stop (bottom) |
|---|---|---|
| Header | `#34312C` | `#25221E` |
| Tile at rest | `#231D16` | `#231D16` |
| Tile hover and focus | `#33261A` | `#33261A` |
| Tile pressed | `#3D2C1A` | `#3D2C1A` |
| Banner | `#3E2814` | `#241A11` |

**Icon plates through `--tile-icon-fx`** (`brightness(1.2) saturate(0.85)`; mock plates from the gallery; the columns name the **worst stop** of each tile surface):

| Icon plate (mock) | After fx | Rest `#231D16` | Hover `#33261A` | Pressed `#3D2C1A` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#7398BF` | 5.54:1 | 4.87:1 | 4.43:1 | pass |
| Calculator `#6b6f76` | `#81858C` | 4.50:1 | 3.95:1 | 3.60:1 | pass |
| Paint `#b07a4f` | `#CB9468` | 6.34:1 | 5.57:1 | 5.07:1 | pass |
| Terminal `#3d4450` | `#4A515E` | 2.09:1 | 1.84:1 | 1.67:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#67A3A4` | 5.84:1 | 5.13:1 | 4.67:1 | pass |
| Files `#c09a3e` | `#E0B95B` | 8.95:1 | 7.86:1 | 7.16:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.60:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Rust `#B4632D` is `--accent-c` (4.19:1 on the ground); small text is the lighter `#E8905A`. Forge `#D48A24` is the hover border and the update rule only (the audit says forge on hover and focus only: the focus ring is rust, hover plus focus shows both). Beskar `#8C959C` is the header line; the tile border is the darker `#6A7076` (3.69:1 on the ground).

### 6.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | 'Segoe UI', Arial, sans-serif |
| `#title` | **Dela Gothic One 400** (bundled), 11 px, tracking 1 px, uppercase from the markup, `font-synthesis: none`, `line-height: 1.2`; stack `'Dela Gothic One', 'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif` |
| `.tile-label` | Segoe UI Semibold (the face's own weight, `--tile-label-weight: 400`), 11 px with `line-height: 13.8px`, 0.1 px, user case; `overflow: clip; overflow-clip-margin: 3px` (B4R F1) |
| `#theme-banner-text` | Segoe UI Semibold, 12 px, 0.3 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 134.91** (gate 156; 21.1 px under, 33.1 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700 and at 1x, 1.5x and 2x. The six standard labels in the 100 px box (ink widths): NOTEPAD 44.3, CALCULATOR 51.2, PAINT 25.6, TERMINAL 43.4, BROWSER 40.9, FILES 22.4 px, no ellipsis; the long names "Visual Studio 2022" 94, "Notepad++ x64" 81, "7-Zip 23.01" 56, "Калькулятор" 66 and "Жёсткий диск" 73 px fit, and "Проводник Windows" (110 px) ellipsizes (the base 100 px box, offer b of B4R). Tile height 94.80 px (94.7 to 95.4 required) at every scale. Banner lines: see 0.8. **Descender sweep** (0.4): the 8 px band under the label box differs by **0 px** from an unclipped reference at 1x, 1.5x and 2x; positive control (a 6 px line height cuts the tails): **243 px**; with Cyrillic tails ("Щука Цирк", "Цирк Щи", "Цц Щщ Джем", "QJ jq Gg") built 0 px, control 189 px. **Platform fonts the mock used:** title Dela Gothic One (web) x12; labels Segoe UI Semibold x7; banner Segoe UI Semibold x28; version and settings Segoe UI x7. Expected `fontsRendered` for the web faces: `Dela Gothic One`.

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Segoe UI Semibold covers it (checked: "Калькулятор", "Жёсткий диск"); Dela Gothic One has Cyrillic and kana but the title is Latin.

### 6.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { background: linear-gradient(180deg, #34312C 0, #25221E 100%); border-bottom-color: #8C959C; box-shadow: inset 0 -2px 0 #8C959C; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #B4632D; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a pauldron: an arched beskar plate with a highlight, two score lines and a rust-painted right half with a rivet, sitting on a rail with two rivets at each end. Painted pixels at x 170.0 to 250.0, y 12.5 to 29.1. Hidden while the chip shows. The title ends at x 134.9, the scene starts at x 168: 33.1 px clear.

**B. Frame (the kit of 0.3).** the side bands are riveted plates: warm dark steel with beskar edges, two rivets and a rust patch with a drip every 24 px; the top course is a beskar rule over a plate with two rivets and a seam per 24 px; each corner is a bolted triangular plate with a diagonal fold and a rivet. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700); at Sergei's 1.5x the smallest art-to-ring gap is 3.33 css px.

**C. Banner.** the banner is a dusk gradient (`#3E2814` to `#241A11`) with a steel top border; its top course is a beskar rule over a weld bead with two rivets and a dash; the icon is a **bounty puck** (a thick beskar disc seen at an angle, a dark face with a ring, a forge light in the centre); the right end is **twin suns** (a large forge sun with a halo and a small sand sun) over **two dune lines** (the front one darker) with two rock spires and five stars. The motif's painted pixels are at x 328.5 to 412.0, y 269.5 to 300.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 185.2 px (0.8). The banner row of the probe reads 4 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: a polygon with one dented corner: bottom right, 14 px (`--overlay-clip` is the same value). Tiles: dark steel cards (`#231D16`), a 1 px beskar-grey border, radius 1 px, a 1 px beskar lit top edge; hover is a warm fill (`#33261A`), a forge border and a 2 px forge underline; the plate has the dented corner of the window, bottom right, 26 percent: `polygon(0 0, 100% 0, 100% 74%, 74% 100%, 0 100%)`. Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 10.33, Calculator 8.56, Paint 11.13, Terminal 6.44, Browser 11.63, Files 7.5 (smallest 6.44); nothing is cropped. **Real icons** (B5R F1): the share of the plate lost to the cut, drop shadow off, cut against uncut: GlideX 2.99%, foobar2000 file icon 0.82%, QuickLaunch icon 0.93%, BlueStacks 0%, BlueStacks logo 0%, Android Studio 0%; every mark whole at 6x (corners of a full-bleed background only).

**Trademark note.** The helmet and its T-visor, the mudhorn signet, clan sigils, the Razor Crest's model, Din Djarin's armour design and the bounty puck's hologram are not drawn. The pauldron is a generic shoulder plate, the puck a generic disc, the suns a landscape.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A8401A; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { background: linear-gradient(180deg, #34312C 0, #25221E 100%); border-bottom-color: #8C959C; box-shadow: inset 0 -2px 0 #8C959C; }
#header::before { background: #B4632D; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Dela Gothic One', 'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif; font-weight: 400; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 11px; letter-spacing: 1px; color: #E8DEC9; text-shadow: none; }
#title .accent { color: #E8905A; }

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

/* tiles */
.app-tile { background: #231D16; border-color: #6A7076; border-radius: 1px; box-shadow: inset 0 1px 0 #8C959C; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: #33261A; border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.app-tile:active { background: #3D2C1A; }
.tile-label { font-family: 'Segoe UI Semibold', 'Segoe UI', Arial, sans-serif; font-size: 11px; line-height: 13.8px; font-synthesis: none; overflow: clip; overflow-clip-margin: 3px; }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, linear-gradient(180deg, #3E2814 0, #241A11 100%);
  border-top-color: #6A7076;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Segoe UI Semibold', 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 400; font-style: normal; font-synthesis: none; letter-spacing: 0.3px; color: #E8DEC9; margin-right: 90px; }
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
<defs><clipPath id='p'><path d='M18 17.6 C18 8 28 3 42 3 C56 3 66 8 66 17.6 Z'/></clipPath></defs>
<path d='M2 17.6 H82' stroke='rgb(90,96,102)' stroke-width='1.2'/>
<path d='M18 17.6 C18 8 28 3 42 3 C56 3 66 8 66 17.6 Z' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.9' stroke-linejoin='round'/>
<g clip-path='url(#p)'><path d='M44 2 L70 2 L70 18 L36 18 Z' fill='rgb(180,99,45)'/><path d='M44 2 L36 18' stroke='rgb(112,58,24)' stroke-width='0.8'/></g>
<path d='M23 15 C24 9.6 31 6.4 42 6.4 M27 15.6 C28.6 11.6 34 9.2 42 9.2' fill='none' stroke='rgb(23,19,15)' stroke-width='0.7' stroke-linecap='round' opacity='0.8'/>
<path d='M24 8 C28 5.4 34 4.2 40 4.2' fill='none' stroke='rgb(200,206,210)' stroke-width='0.9' stroke-linecap='round'/>
<circle cx='7' cy='17.6' r='1.3' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='6.61' cy='17.21' r='0.45499999999999996' fill='rgb(200,206,210)'/><circle cx='13' cy='17.6' r='1.3' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='12.61' cy='17.21' r='0.45499999999999996' fill='rgb(200,206,210)'/><circle cx='71' cy='17.6' r='1.3' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='70.61' cy='17.21' r='0.45499999999999996' fill='rgb(200,206,210)'/><circle cx='77' cy='17.6' r='1.3' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='76.61' cy='17.21' r='0.45499999999999996' fill='rgb(200,206,210)'/><circle cx='42' cy='12.4' r='1.1' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='41.67' cy='12.07' r='0.385' fill='rgb(200,206,210)'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect x='0' y='0' width='24' height='1' fill='rgb(90,96,102)'/><rect x='0' y='1' width='24' height='7' fill='rgb(58,54,48)'/><rect x='0' y='1' width='24' height='1' fill='rgb(76,71,64)'/><rect x='11.6' y='1' width='0.8' height='7' fill='rgb(38,35,31)'/><rect x='0' y='8' width='24' height='1' fill='rgb(38,35,31)'/>
<circle cx='5' cy='4.6' r='1.2' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='4.64' cy='4.239999999999999' r='0.42' fill='rgb(200,206,210)'/><circle cx='18' cy='4.6' r='1.2' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='17.64' cy='4.239999999999999' r='0.42' fill='rgb(200,206,210)'/><path d='M12 1.4 V7.6' stroke='rgb(23,19,15)' stroke-width='0.4'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect x='0' y='0' width='8' height='24' fill='rgb(23,19,15)'/><rect x='0' y='0' width='1' height='24' fill='rgb(90,96,102)'/><rect x='7' y='0' width='1' height='24' fill='rgb(90,96,102)'/><rect x='1' y='0' width='6' height='24' fill='rgb(58,54,48)'/><rect x='1' y='0' width='6' height='1' fill='rgb(38,35,31)'/><rect x='1' y='23' width='6' height='1' fill='rgb(38,35,31)'/>
<circle cx='4' cy='4.6' r='1.3' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='3.61' cy='4.21' r='0.45499999999999996' fill='rgb(200,206,210)'/><circle cx='4' cy='19.4' r='1.3' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='3.61' cy='19.009999999999998' r='0.45499999999999996' fill='rgb(200,206,210)'/><path d='M1.8 9 L4.6 8.2 L6.2 9.4 L5.6 11.6 L3.4 12.2 L2 11 Z' fill='rgb(180,99,45)' fill-opacity='0.9'/><rect x='3.6' y='12' width='0.5' height='2.6' fill='rgb(112,58,24)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect x='0' y='0' width='8' height='8' fill='rgb(23,19,15)'/><path d='M0.6 7.4 V0.6 H7.4 L0.6 7.4 Z' fill='rgb(58,54,48)' stroke='rgb(90,96,102)' stroke-width='0.9' stroke-linejoin='round'/><circle cx='2.6' cy='2.6' r='1.1' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='2.27' cy='2.27' r='0.385' fill='rgb(200,206,210)'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect x='0' y='0' width='24' height='1.4' fill='rgb(90,96,102)'/><rect x='0' y='1.4' width='24' height='0.6' fill='rgb(38,35,31)'/><circle cx='6' cy='4.6' r='1.1' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='5.67' cy='4.27' r='0.385' fill='rgb(200,206,210)'/><circle cx='18' cy='4.6' r='1.1' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.45'/><circle cx='17.67' cy='4.27' r='0.385' fill='rgb(200,206,210)'/><path d='M10 4.6 H14' stroke='rgb(90,96,102)' stroke-width='0.9'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<defs><linearGradient id='d1' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='rgb(122,92,58)' stop-opacity='0'/><stop offset='0.2' stop-color='rgb(122,92,58)'/></linearGradient><linearGradient id='d2' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='rgb(78,56,34)' stop-opacity='0'/><stop offset='0.2' stop-color='rgb(78,56,34)'/></linearGradient></defs>

<circle cx='30' cy='18' r='8.6' fill='rgb(212,138,36)' fill-opacity='0.28'/><circle cx='30' cy='18' r='5.8' fill='rgb(212,138,36)'/><circle cx='28.6' cy='16.6' r='2' fill='rgb(246,190,98)'/>
<circle cx='47' cy='21.6' r='3.8' fill='rgb(201,169,122)'/><circle cx='46' cy='20.6' r='1.3' fill='rgb(250,228,186)'/>
<path d='M0 34 V25 Q16 21 34 25 T84 22 V34 Z' fill='url(#d1)'/>
<path d='M0 34 V29.4 Q20 26 42 30 T84 28.4 V34 Z' fill='url(#d2)'/>
<path d='M60 24 L63 17 L66 24 Z' fill='rgb(78,56,34)'/><path d='M70 26 L72 21 L74 26 Z' fill='rgb(78,56,34)'/>
<circle cx='8' cy='8' r='0.6' fill='rgb(201,169,122)'/><circle cx='20' cy='4' r='0.5' fill='rgb(140,149,156)'/><circle cx='62' cy='6' r='0.6' fill='rgb(201,169,122)'/><circle cx='76' cy='10' r='0.5' fill='rgb(140,149,156)'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<ellipse cx='11' cy='14.4' rx='9.4' ry='5.8' fill='rgb(38,35,31)' stroke='rgb(23,19,15)' stroke-width='0.8'/>
<path d='M1.6 11.2 V14.4 A9.4 5.8 0 0 0 20.4 14.4 V11.2 Z' fill='rgb(90,96,102)' stroke='rgb(23,19,15)' stroke-width='0.8' stroke-linejoin='round'/>
<ellipse cx='11' cy='11' rx='9.4' ry='5.8' fill='rgb(140,149,156)' stroke='rgb(23,19,15)' stroke-width='0.9'/>
<ellipse cx='11' cy='11' rx='6.4' ry='3.7' fill='rgb(56,60,64)' stroke='rgb(90,96,102)' stroke-width='0.7'/>
<ellipse cx='11' cy='11' rx='3.6' ry='2' fill='none' stroke='rgb(200,206,210)' stroke-width='0.8'/><circle cx='11' cy='11' r='1.4' fill='rgb(212,138,36)' stroke='rgb(23,19,15)' stroke-width='0.3'/><circle cx='10.6' cy='10.6' r='0.45' fill='rgb(246,190,98)'/>
<path d='M3.4 9.6 A8.6 4.6 0 0 1 8 6.6' fill='none' stroke='rgb(200,206,210)' stroke-width='0.8' stroke-linecap='round'/>
</svg>
```

### 6.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | mando-title (title) | removed |
| 2 | banner-pulse (banner icon) | removed |
| 3 | mando-helm (panno) | removed |
| 4 | mando-readout (readout) | removed |
| 5 | mando-border (`#app`) | removed |
| 6 | mando-dust (`#particles`) | removed |
| hover | tile-scan-v .5s | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite star-wars-mando.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 6.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** flat `#231D16`, border `#6A7076` (1 px; 3.69:1 on the grid ground), radius 1px, `box-shadow: inset 0 1px 0 #8C959C`, `::before` off; layout unchanged. Icons: `brightness(1.2) saturate(0.85)` through the shaped plate (D in 3).
- **Hover:** flat `#33261A`, border `#D48A24` (5.21:1 on the hover fill), `box-shadow: inset 0 -2px 0 #D48A24`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (3.78:1 on the tile, 4.19:1 on the grid ground). **Pressed:** base scale 0.96 on flat `#3D2C1A`.
- **Label:** `#E8DEC9`, Segoe UI Semibold (the face's own weight, `--tile-label-weight: 400`), 11 px with `line-height: 13.8px`, 0.1 px, user case.
- **Filter chip:** base rule (fill `#33261A`, `--accent-c` border, `#E8905A` text). The header scene hides while it shows.
- **Edit bar:** `#2E170C` fill, `#B4632D` rule, label `#F0956A`; `+ FILE` and `+ INSTALLED` in `--text` with a `#8C959C` border, `DONE` in `#F0956A` with a `#B4632D` border. The tile remove button is `#A8401A` with a `#F0956A` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#17130F`, panel `#1E1913`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#E8905A` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#E8905A` text on `#1E1913` with a `#D48A24` rule.

### 6.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite star-wars-mando.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#8C959C`) at the bottom with nothing below y 40; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **134.91**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: the `#3E2814` to `#241A11` gradient with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 3 strings; mock all fit at 424 and 640), the text box ending at x 320. **The icon reads as a bounty puck (a thick metal disc) at 1x** (judge it at 1x before 6x).
5. Hover shot (CALCULATOR): `#D48A24` border and `inset 0 -2px 0 #D48A24`, the hover fill, the shaped plate with no cropped glyph, no ellipsis on CALCULATOR (mock 51.2 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): warm dark steel and beskar for the window, rust for the header tick, ring, edit bar and the patches, forge only on hover and in the suns, sand in the small sun; no green, no blue, no violet, no pink.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4, with the theme's banner surface kept): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 8 px, banner 4 px; at 640 x 420 10 / 8 / 12.04 px; at 1024 x 700 10 / 8 / 12.04 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Dela Gothic One` (title), `Segoe UI Semibold` (labels, banner) and `Segoe UI`; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; "gypsy Yy jq" shows its g, y, p and j tails whole at 1x, 1.5x and 2x.

**Expected squint score: 3** (title and banner text covered; my read of a render, not a fan test). What survives: a brown-black window with riveted steel rails and bolted corners, a rust-painted pauldron plate in the header, a dusk banner with twin suns over dunes and a bounty puck. What is missing for a 5: the helmet and the Razor Crest (character and vehicle design, not drawn); the twin suns say Star Wars but also Tatooine, so a fan names the saga first and the Mandalorian second.

Watch items for this theme: (1) The **bounty puck** reads as a metal disc, a button or a knob; the first draft (a round dial with three ticks) read as a knob and the etched glyph that followed read as a terminal prompt, so it is now a plain ring and a light. Lever if it still reads as a speaker: add a notch on the rim. (2) The twin suns are Tatooine's sky; the show does visit Tatooine, but a fan may read the banner as Luke's home. Lever: swap the suns for a single large forge sun and a ship silhouette (not drawn here: the Razor Crest is a vehicle design). (3) The dented corner cuts the bottom right of the dune layer by up to 14 px; the dunes fade in from the left so no vertical edge shows.

---

## 7. The numbers Ender's after-run should reproduce (mock values; Ender's Electron numbers win where they differ)

One row per theme, all measured on the mock window of 0.4 against the candidate files built from the text of sections 1 to 6. A difference of a pixel in a text edge is Chromium against Electron; a difference in an overlap, a clip or a contrast ratio is a bug in the build. The hash is the SHA-1 of the theme text this spec builds (the `:root` block, a blank line, the rules block and a final newline), which is a theme file **without its leading comment block** (the candidates carried a one-line comment, Ender's build a multi-line one: strip up to the closing `*/` and the blank lines after it), so Ender can hash a built file and compare: the batch-5 review did exactly this machine diff. **The empire, rebel and sith rows are the approved build** (Ender's Electron figures, reproduced in the review); the other three rows are still my mock figures, which the build reproduced to the digit.

| Theme | CSS (KB) | SHA-1 (8) | Title edge (gate 156) | Widest standard label (ink, of 100 px) | Tile height | Widest banner line ends at x (box edge 320) | Overlap and keep-out (11 states, 3 sizes) | Art gap at 424: header / frame / banner | Real-icon loss, worst | Descender built / control | Clipped points | Lowest ratio: text / non-text / icon |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| republic | 15.9 | `a797fe31` | 138.52 | 49.8 | 94.80 | 200.4 | 0 / 0 | 10 / 8 / 4 | 3.44% | 0 / 214 px | 0 | 5.30 / 3.49 / 3.24 |
| separatist | 17.3 | `37da8415` | 141.91 | 49.8 | 94.80 | 249.8 | 0 / 0 | 11 / 8 / 4 | 4.98% | 0 / 239 px | 0 | 4.79 / 3.28 / 3.23 |
| empire | 11.0 | `9cf7a793` | 144.05 | 52.9 | 94.80 | 273.9 | 0 / 0 | 11 / 8 / 4 | n/a (no plate cut) | 0 / 153 px | 0 | 5.56 / 3.13 / 3.04 |
| rebel | 12.7 | `eea1cbe9` | 134.11 | 52.9 | 94.80 | 214.5 | 0 / 0 | 10 / 8 / 4 | n/a (no plate cut) | 0 / 222 px | 0 | 4.61 / 3.89 / 3.43 |
| sith | 12.0 | `e26b83eb` | 147.22 | 60.2 | 94.80 | 254.5 | 0 / 0 | 11 / 8 / 4 | 3% | 0 / 2 px | 0 | 5.56 / 3.69 / 3.85 |
| mando | 14.3 | `dd303ae2` | 134.91 | 51.2 | 94.80 | 143.3 | 0 / 0 | 10 / 8 / 4 | 2.99% | 0 / 243 px | 0 | 5.28 / 3.69 / 3.60 |

Every state in the overlap column is the A/B/C probe of 0.4: 424 x 300, 640 x 420, 1024 x 700, chip, edit, update, edit plus update, and a focus ring on the first column (424) and the last column (424, 640, 1024); at 1.5x the same method read 0 / 0 in 36 of 36 runs and a smallest gap of 3.33 css px. "Clipped points" is the sum over grid, settings, edit, update and settings at 640 x 420. "Descender built / control" is the worst band difference of the built label against an unclipped one, and the one-line-height positive control (it must be large for the sweep to mean anything; Sith's English strings give a small control, which is why 0.2 re-sweeps it with Cyrillic tails).

---

## 8. Fonts adopted from this list (approved by Sergei 2026-10-01), as built

Status: **adopted.** This section began as a proposal ("nothing in this spec needs a new font"; each file pending Sergei's per-file OK; nothing downloaded). Sergei approved all three on 2026-10-01 and Ender bundled them (`src/renderer/fonts/`, each with its `OFL.txt`; sources, sizes and SHA-256 are in the README there; no CSP change was needed, the CSP is `default-src 'self' data:` and bundled files load from `self`). The review checked the three TTFs against the upstream git blob ids on GitHub (all equal), the `OFL.txt` of Black Ops One and Oxanium (equal) and Libre Franklin's (upstream has CRLF line endings, 4,495 bytes; stored with LF, 4,402 bytes, as the README says). The table is the original proposal; the **as built** paragraph under it is what the files do now. The licence is the SIL Open Font License.

| Rank | Font | Licence | Cyrillic | File to fetch | Size | Source folder | Theme it lifts | What it replaces | Expected gain |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Libre Franklin** | SIL OFL 1.1 (`OFL.txt`, 4,495 bytes upstream, 4,402 stored with LF) | yes (28 of 28 glyphs of a Cyrillic probe drawn) | `LibreFranklin[wght].ttf` (variable weight; the italic file is not needed; bundled as `LibreFranklin-VF.ttf`) | 187,436 bytes | https://github.com/google/fonts/tree/main/ofl/librefranklin | **Empire** (title, labels, banner, and the body face after the review's F2); not used for Rebel | Bahnschrift 500 | **Adopted.** The saga's Franklin Gothic read; the label rule needed 11 px, 0 px tracking and a 13.8 px line height to fit "Visual Studio 2022" and its neighbours (the review's F1) |
| 2 | **Black Ops One** | SIL OFL 1.1 (`OFL.txt`, 4,411 bytes) | no | `BlackOpsOne-Regular.ttf` | 166,532 bytes | https://github.com/google/fonts/tree/main/ofl/blackopsone | **Rebel** (title only) | Trebuchet MS 700 title | **Adopted.** The stencil crate-label read of the Alliance, title only; title edge 134.11 px against the gate 156 |
| 3 | **Oxanium** | SIL OFL (`OFL.txt`, 4,384 bytes) | no (a Cyrillic probe falls to the fallback glyph by glyph) | `Oxanium[wght].ttf` (variable weight; bundled as `Oxanium-VF.ttf`) | 43,536 bytes | https://github.com/google/fonts/tree/main/ofl/oxanium | **Sith** (title only) | Bahnschrift 700 SemiCondensed title | **Adopted for the title only.** The labels are user text and Oxanium has no Cyrillic, so they stay Bahnschrift; at 12 px the title needed 4 px tracking (147.22 px, against 159.22 px at 5 px) |

**As built:** Libre Franklin sets the Empire title, labels (11 px, 0 px tracking, line height 13.8 px), banner and body face; Black Ops One sets the Rebel title; Oxanium sets the Sith title. Proprietary faces the saga really uses (the Franklin Gothic of the logo lettering, any Aurebesh font) are never suggested and must not be shipped. Fonts considered and left out: Michroma and Saira (named on the sheet for Separatist and Mando; Jost and Dela Gothic One already carry both), Barlow Condensed (Empire; Libre Franklin carries it), Cinzel for the Sith (approved and bundled, but its serifs read ceremonial where the sheet asks for sharp angular capitals).

---

## 9. Summary

- **Six sections written**, one per theme, each with a final `:root` block, computed contrast tables (six gate pairs, 48 to 49 add-on pairs), icon checks on rest, hover and pressed fills at the **worst stop** of each surface, type with measured widths, art as exact shapes with coordinates plus the rules block and every SVG source, a motion inventory, tile, hover, selected, filter and banner rules, a "Done when" list and an expected squint score. A batch-level section (0) holds the family kit, the review lessons, the banner-line evidence and the departures from the audit.
- **Infinite animations: 38 to 0** (Sith's seventh is its hover flicker, the only infinite hover animation in the batch). No animation of any kind is left; no `will-change`; the only motion is the base 0.12 s tile transition and the one-shot entrance fade. The CSS is no bigger: the new files are 10.9 to 17.3 KB against 12.2 to 17.6 KB today (they carry the art the old files painted as text).
- **Contrast:** every pair clears its threshold. Lowest text pair **4.61:1** (rebel, title dot (`.accent`) on header; needs 4.5). Lowest non-text pair **3.13:1** (empire, tile border on grid ground (non-text); needs 3). Lowest icon ratio **3.04:1** (empire; needs 3). The real gate script, run on the six prototype files with an empty baseline, reported 6 checked, 0 errors, and a deliberately broken copy made it report the error (positive control). None of the six was on the legacy list.
- **Type:** six bundled faces (Jost, Cinzel, Dela Gothic One, and the three adopted at the build: Libre Franklin, Black Ops One, Oxanium) and four stock faces (Bahnschrift, Trebuchet MS, Segoe UI, Segoe UI Semibold); title edges 134.1 to 147.2 px against the 156 gate (one ladder step taken: Sith's tracking, 5 px to 4 px), every standard label inside the 100 px box, every banner line inside its text box (the narrowest margin 46.1 px, Empire). **Franklin Gothic Medium** was tried and dropped in the first text: by name it resolves here to an Office-only face (0.10); the bundled Libre Franklin replaces it.
- **Overlaps:** none by construction and none measured: the A/B/C probe read 0 px overlap and 0 px of art in the keep-out in all 66 runs (11 states and sizes x 6 themes) and in all 36 runs at 1.5x; the art ends 3 empty pixels before the focus ring. The probe's positive control reads 221 to 403 px when art is planted over the title.
- **Review lessons (B3R to B5R) carried:** icons judged at the true 1x raster (three first drafts redrawn), the descender lever on every label (0 px of difference below the box at 1x, 1.5x and 2x, with a Cyrillic re-sweep and a positive control), lining figures checked on every face, real icons on every shaped plate (republic 3.44, separatist 4.98, sith 3, mando 2.99 percent of the plate lost, worst case; every mark whole), the 20 px ceiling on plate cuts, port ownership through the lease's own `DevToolsActivePort`, worst-stop contrast on gradient surfaces.
- **Banner lines:** 18 lines across the six, each checked on the web (0.8), each at most 8 words; **none is studio-authored**. The check caught four errors in my first picks and one line that was already in `THEME_BANNERS` and could not be verified (`Bounty hunting is a complicated profession.`), now dropped. Two lines rest on one kind of source (`Apology accepted, Captain Needa.` on quote sites, `Unlimited power!` on three articles).
- **Squint (expected, title and banner text covered; my read of a render, not a fan test):** republic 3, separatist 4, empire 3 (the review's read of the build; the first expectation was 4), rebel 4, sith 4, mando 3. The six renders side by side read as six factions (0.3).
- **Facts found on the way (not in this batch's scope, or fixed in this spec):** (1) **My first draft of the Republic tables used the lighter stop of each tile gradient**, which is the wrong worst case for dark text and dark plates on a light window; at the darker stop the Files plate read **2.99:1 on the pressed fill**, under 3. Fixed before this spec: the pressed state takes the hover gradient (as in batch 5), and every table now uses the worst stop (lightest on dark surfaces, darkest on the light window); the rebuilt Republic file was re-verified. (2) `'Franklin Gothic Medium'` by name is not the stock `framd.ttf` on a machine that has Office (0.10). (3) The theme-name table in `app.js` (line 712) says `STAR WARS: OLD REPUBLIC`; the rename needs that one string. (4) The `THEME_BANNERS` comment is already "(2 to 6 per theme)". (5) "Unlimited power!" and Dooku's "I've been looking forward to this" are Revenge of the Sith lines (0.8).

### The `THEME_BANNERS` entries (exactly as written; replaces the six keys and no others)

```js
  'star-wars-republic': [
    'Hello there.',
    'This is where the fun begins.',
    'I have the high ground.',
  ],
  'star-wars-separatist': [
    'Roger, roger.',
    'General Kenobi! You are a bold one.',
    "I've been looking forward to this.",
  ],
  'star-wars-empire': [
    'I find your lack of faith disturbing.',
    'Apology accepted, Captain Needa.',
    'Fear will keep the local systems in line.',
  ],
  'star-wars-rebel': [
    'Rebellions are built on hope.',
    'Never tell me the odds!',
    "You're my only hope.",
  ],
  'star-wars-sith': [
    'Good! Your hate has made you powerful.',
    'Unlimited power!',
    'Execute Order 66.',
  ],
  'star-wars-mando': [
    'This is the Way.',
    'I have spoken.',
    'I like those odds.',
  ],
```

And one display-name string in `app.js` (the theme-name table, line 712 at HEAD `7574901`):

```js
  'star-wars-republic':  'STAR WARS: GALACTIC REPUBLIC',
```

### Flags, ruled (Sergei: "decide what's more beautiful"; every flag is a ruling with its reason, none is left open)

| # | Flag | Ruling | Why, one line |
|---|---|---|---|
| 1 | Republic window: **light ivory** as built, or the audit's dark variant? | **Light ivory** | It is the only prequel look that cannot be mistaken for the Empire or the Sith (cream, crimson and brass is the sheet's primary palette and "the Republic looks gleaming"); a dark navy-and-crimson version collapses into the other five, and every pair clears AA with the lightest crimson and the darkest ivory stops. 2001 and promise-mascot already set the light-window precedent |
| 2 | Separatist header: **tan plate** with dark ink, or a dark header with tan trim? | **Tan plate** | Droid tan is the one fix the audit says the theme needs, and as trim on a dark header it vanishes at 1x; the 40 px strip is small enough to hold a bright surface, and persona-4's yellow header is the precedent |
| 3 | Empire banner icon: **battle station** or the audit's six-segment split ring? | **Battle station** | A segmented ring reads as a gear or a settings icon and is the cog mark the audit says to evoke only; a grey sphere with a trench and a dish reads at 1x and is a generic form, not the emblem |
| 4 | Mando title: **Dela Gothic One** (bundled) or a stock Arial Black? | **Dela Gothic One**, with the stack falling to Arial Black | It is wide, heavy and angular like the show's title card, it is already bundled and approved by the plan, and the swap costs one rule if the shorter font list in the brief was meant to exclude it (10, item 7) |
| 5 | Republic name: **rename** to GALACTIC REPUBLIC, or keep OLD REPUBLIC? | **Rename** (the key `star-wars-republic` does not change) | The look is the prequel Republic; "Old Republic" is the KOTOR era with a different palette, and the audit already called for the rename |
| 6 | Rebel type: **Trebuchet MS** now, or wait for Black Ops One and Libre Franklin? | **Black Ops One title over a Trebuchet MS body** (the first text ruled "Trebuchet MS now"; Sergei approved the files on 2026-10-01 and the review ruled the stencil title) | The stencil matches the header's stencil blocks and is the one title a fan reads as a crate at a glance; Libre Franklin would have put Rebel and Empire in one face; Trebuchet MS carries the cream body text on olive at 8.20:1 |
| 7 | Sith plate: **one cut corner** or a batwing or V-bottom talon? | **One cut corner** (top right, 26 percent) | The batwing is a 12 percent V in the top edge, a nick too small to carry a silhouette, and the V-bottom talon cropped real marks (GlideX loses 11.3 percent, the foobar2000 file icon loses its F, B, 2 and K feet) |
| 8 | Mando plate: **dented corner** or the audit's T-notch? | **Dented corner** (bottom right, 26 percent) | The T-notch is the helmet visor, the character design the audit itself warns against, and its 10 percent V in the top edge is a nick too small to carry a silhouette; the dent echoes the window and costs 3.0 percent of GlideX at most |
| 9 | Mando banner: **twin suns** (Tatooine) or a single sun? | **Twin suns** | The banner has to say Star Wars when everything else says rust and rivets, and the desert frontier is the show's tone; a single sun over dunes could be any western |
| 10 | Sith: four crimson lines frame the window. **Keep**, or thin them? | **Keep** | Crimson as a line and a light is the whole Sith identity once the red wash is gone; there is no red fill anywhere, and the hover underline and the ring carry the same colour |
| 11 | Sith update bar: **crimson text** (accent-text) or amber? | **Crimson text**, amber stays the rule | Every theme's update text takes `--accent-text`, and amber exists only in the holocron and on this rule, which keeps the one warm accent rare |
| 12 | Fonts: Jost and Dela Gothic One are **in use**; the brief's shorter list omits them | **Used**, on the plan's record | Ruling 5 (2026-09-30) approves seven files including both, they are bundled, and Jost ships in committed batch 5; the measured swap is in 10 item 7 |

Flags 1, 2, 3, 4, 7, 8, 9, 10, 11 and 12 are **built as written**; flag 5 is built as written plus the one `app.js` string above; flag 6 is built as ruled in its row above.

### Watch items (not fixes, not blocking)

1. **Republic is bright.** The one light window in a skin list of dark ones, and bright on a dark desktop; lever in its section (ground `#EFE7D6` to `#E3D9C2`, the text pairs stay at 11.3:1 and 5.7:1). Near-white app icons turn light grey on the ivory tile (`brightness(0.8)`); their dark marks still read.
2. **Three icons with a second read.** Separatist cells can read as nuts and bolts or a molecule (the header strip and banner row make the honeycomb), the Mando puck as a speaker or a knob, the Republic rotunda as any domed government building (the skyline beside it settles it). Each has a lever in its section.
3. **Real icons vs shaped plates.** Republic, Separatist, Sith and Mando clip the plate: the share of the plate lost to the cut is at most 3.4, 5.0, 3.0 and 3.0 percent on the six real icons tried (GlideX, a full-bleed square, is the worst case in each), every mark whole. A square-cornered icon beyond the six can lose a corner (accepted, as in B5).
4. **The Empire frame is three rows of tiny rectangles** and reads as a perforated rail at 1x; the Empire hover is a white 1 px double line, the brightest hover cue of the batch.
5. **Sith and Rebel carry the loudest colour pairs** (four crimson lines; orange fighter against a blue reticle); levers in their sections.
6. **Mando's dented corner cuts the dune layer** by up to 14 px at the bottom right; the dunes fade in from the left so no vertical edge shows.
7. **Not seen by me:** Electron renders (mock only), the skin-picker list open, the empty-library drop hint, the updater error bar, the clipped corners over a real wallpaper, edit-mode remove buttons on the shaped plates beyond the mock's own plates.

---

## 10. Open items (things I could not resolve or verify here)

Nothing was launched in QuickLaunch. Each item has a verify step above; none blocks implementation.

1. **Spec text to CSS.** Rebuilt after the build (F3): each of the six theme files is rebuilt from the **text of this spec alone** (the `:root` block, the rules block, the SVG sources and the placeholder encoding of B1 0.2) and compared byte for byte with the working tree's file **minus its leading comment block**: **all six identical** (characters of the candidate file with its one-line comment, as in the first text: empire 11,278, rebel 13,007, republic 16,251, separatist 17,742, sith 12,296, mando 14,664). **Positive control:** a copy with one hex changed (`#E8DEC9` to `#E8DECA` in the Mando block) is reported as different. Republic, Separatist and Mando did not change since the first text. Ender's build can be compared the same way (B5R section 2 did): extract the `:root` block, the rules block and the seven SVG sources from a section, substitute the placeholders, and diff against the built file; the only allowed difference is the file's leading comment.
2. **Mock window, not Electron.** All measurements come from headless Edge with the Foundation's CSS applied to the real `base.css` and `index.html`. Chromium 154 is not Electron 32: sub-pixel text and filter rounding can differ. Ender's numbers win; the after-run reports them. After the fonts are packaged, the title-edge ladder (F B2 rule 5) is binding over my measured edges.
3. **Fonts measured from the working tree.** I loaded Jost, Cinzel and Dela Gothic One read-only to get real widths in the first text; Libre Franklin, Black Ops One and Oxanium were measured in Ender's Electron run and reproduced in the review. If Ender renames or re-exports any of the six, re-measure.
4. **Stock fonts on Sergei's other machines.** Segoe UI and Segoe UI Semibold ship with every supported Windows; Trebuchet MS ships with Windows; Bahnschrift ships with the Windows 10 and 11 install (from version 1709). On an older install the stacks fall to Segoe UI and the widths shift by a few pixels (the fit check is the net).
5. **Banner widths** were measured in the mock with the real fonts; the fit check (F A3) is the net if Electron differs by a few pixels (every line ends at least 45 px before the text box edge). **Single-kind banner lines:** Vader's "Apology accepted, Captain Needa." (quote sites only; the Wikiquote extract did not show it) and "Unlimited power!" (three articles; no quotes page printed it in the extract). The fetch tool returns extracts, not raw pages.
6. **Real icons:** six distinct real icons were tried on the four shaped plates (GlideX, the foobar2000 file icon `C:\Program Files\foobar2000\icons\generic.ico`, QuickLaunch's own `icon.png`, BlueStacks and its logo, Android Studio); the 6x crops are in `batch6/out/mont_ri.png` (scratchpad). A seventh icon with art in all four corners could still lose a corner on Separatist (two cuts), which is the plate with the largest loss (5.0 percent for GlideX).
7. **The font swap, measured (flag 12).** If Jost, Cinzel and Dela Gothic One are not to be used, the stock fallbacks are: **Republic** title `font-family: 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 700` (the title edge moves from 138.5 to 139.2 px) and `--font` and the labels and banner to `'Segoe UI', Arial, sans-serif` at weight 400 (every standard label within 3 px: NOTEPAD 45, CALCULATOR 52, "Visual Studio 2022" 95.3 px, no ellipsis); **Separatist** title `'Segoe UI', Arial, sans-serif` at 600 (141.9 to 139.4 px) and the rest as Republic; **Mando** title `'Arial Black', 'Segoe UI Black', 'Segoe UI', sans-serif` at 400 (134.9 to 119.6 px, 15 px narrower, inside the gate). All banner lines still fit (no line moves by more than 6.0 px, and the longest swapped line ends at x 253.1, 66.9 px before the text box edge). Nothing else in any file changes. Measured on the mock with the overrides applied (`batch6/swap.mjs`).
8. **Tall windows:** the side strips repeat down the container and the top course repeats along it; the art is anchored to the frame, never scaled. Looks right at 1024 x 700 in the mock.
9. **Leftover browsers and process hygiene.** Every mock browser was started through `scripts/qa/headless-browser.mjs` (`launchHeadless`) and ended with `close()`; every launch log ends `stop-requested` with `remaining 0`. **Final read-only sweep** (the guard's own process snapshot, a CIM listing of every browser-named process with its command line; nothing was killed), counted by command line: **0** browser processes name my scratch folder `batch6`, and **0** sit inside a guard lease (`--user-data-dir` under `%TEMP%\illuminati-headless\hb-<id>`); `headless-browser.mjs list` shows no leases and `sweep` finds 0 processes in dead or hung leases. 60 other browser processes were running (Sergei's own Edge and the like): they carry neither marker and were not touched. **How a count can mislead:** a first count by the **session** scratchpad path alone read 4, and a second one about 50, browser processes aged 0 to 30 seconds, all under `scratchpad\guard\hb-test-...` with fixtures named `hb-deadbeef0001`, `hb-deadbeef0002` and `unmarked-a\ud_1`: another agent in this session running the guard's own test suite. They were not mine, I did not touch them, and by the final count they were gone. A path match on the session folder is therefore not an ownership test while a sibling shares the scratchpad (Senua's Major F1), so the number I report is the `batch6` and lease-marker count, which is 0.
10. **The `.app-tile` radius and its `overflow: hidden`** clip the edit-mode remove button at the rounded corners (Republic, 6 px radius): the button sits at `top:-2px; right:-2px` and the base already clips it at the tile edge. Legible in the mock's edit shot (`batch6/verify/republic/edit-3x.png`); carried from B5 open item 8.
11. **Read-only git commands.** The brief said no git operations of any kind. I ran a handful of read-only queries (`status`, `log`, `branch --show-current`, `diff --stat`) in `WIP/QuickLaunch` early on to confirm the branch, HEAD `7574901` and that `src/renderer` is unchanged against HEAD (it is: `base.css` and `index.html` are byte-identical to the previous run's copy), and one stray `git status` inside my own scratchpad (not a repository). Nothing was staged, committed, pushed, checked out or reset, and no file in the repo was edited.

12. **F3, this update (2026-10-01).** Changed to match the approved build: the Empire `:root` (`--font` is Libre Franklin, `--tile-label-spacing` is 0 px), its `#title`, `.tile-label` (11 px, `line-height: 13.8px`) and `#theme-banner-text` rules, the Rebel `#title` (Black Ops One, weight 400), the Sith `#title` (Oxanium, tracking 4 px), the three type sections and their measured figures, the Empire, Rebel and Sith "Done when" items (title edges, CALCULATOR width, `fontsRendered`, the Empire name set), section 7 (hashes, edges, widest label, widest banner line, Empire descender control), section 0.7 (fonts), 0.8 (Empire fit row), 0.10 (the three rows), section 8 (adopted), section 9 (type, squint, flag 6) and item 3 above. Republic, Separatist and Mando text is unchanged. The rebuild check in item 1 covers every code block and SVG.
