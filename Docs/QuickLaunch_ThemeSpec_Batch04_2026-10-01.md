# QuickLaunch theme spec, batch 4 (Judy, 2026-10-01)

Status: complete. Batch-level section (0), six theme sections (1 to 6), fonts that would still lift the batch (7), summary (8), open items (9). Uncommitted, as instructed.

Themes: warhammer-chaos, warhammer-orks, warhammer-tyranids, warhammer-eldar, warhammer-necrons, warhammer (audit section 7, batch 4, "Warhammer 40,000": 4 redraw, 2 tone down; the section order is the audit's, worst first).
For: Ender. Branch `wip/theme-fidelity`, written against HEAD `e8866e0` (batch 3 committed, review APPROVED) and the post-Foundation base (Foundation Parts A and B: `scrollbar-gutter: stable` on `#grid-container`, the `#header::after` thresholds, the scrolling overlays, the banner fit check, the seven bundled fonts). The audit calls this batch "six materials, not six hues, one shared frame kit with per-faction motifs"; section 0.3 is that kit and each theme section is one material.
Franchise calls (no new era decisions needed): the six themes are the six armies of Warhammer 40,000 as the reference sheet lists them: Imperium (gothic gold and parchment), Chaos (spiked corrupted plate, Undivided and Khorne-leaning as the audit chose), Orks (scrap and paint), Tyranids (wet chitin), Eldar (wraithbone), Necrons (seam-lit tomb metal).

Inputs read: the audit (`QuickLaunch_ThemeAudit_2026-09-30.md`: section 1 shared constraints, the six entries, the batch 4 row and note, the font table), the Foundation spec (Parts A and B, the fonts map and fallback table), batch 3 (sections 0, 1 to 3, 7 to 10 and the Addendum, as the format), the batch 3 review (its lessons are applied up front, 0.2), batches 1 and 2 section 0 and the review rulings, Makoto's reference sheet (the Warhammer 40,000 entries), the six current theme files (legacy motion only), `base.css` and `index.html` (repo working tree), `scripts/check-theme-contrast.js`, `THEME_BANNERS` in `app.js` for the six keys, and the bundled font folder (`src/renderer/fonts/`). Every banner line was checked on the web (0.8). **QuickLaunch was not launched.** Only this file was written in the repo tree; scratch files, prototypes and renders live in the session scratchpad.

**Shared constraints are not restated.** Every section inherits audit section 1 (C1 to C5, H1 to H8), batch 1 sections 0 and 12, batch 2 sections 0 and 11 to 12, batch 3 section 0 and the Foundation Parts A and B by reference (0.1 lists them). Where a rule is the same I point to it.

## At a glance

| # | Theme | Material and direction | Infinite animations, before to after | Lowest ratio (text / non-text / icon) | Type | Squint (expected) |
|---|---|---|---|---|---|---|
| 1 | chaos | Spiked, corrupted plate: blackened iron, brass studs, hot-red cracks, a corrupted-red header line with iron teeth hanging from it and rising from the blood-dark banner, a spiked collar icon, curved iron spikes on a cracked plate, two broken window corners | 6 (+1 hover) to **0** | 5.04 / 3.47 / 3.58 | Pirata One 400 title (bundled), Cambria Bold labels and banner | 4 |
| 2 | orks | Scrap and paint: bolted grey plates and rust, a yellow-and-black chequer band, red speed-stripes on the banner, crooked plates, a toothy riveted plate, a cleaver icon, a battered plate with bullet holes, uneven window corners | 6 (+1 hover) to **0** | 5.03 / 3.92 / 3.27 | Impact title and banner, Ink Free labels, Segoe UI Semibold body | 4 |
| 3 | tyranids | Wet chitin: hive purple, a row of bone ribs, a spine down each side, tendril corners, bone mandibles, a scalloped membrane banner with talons and tendrils, pod-shaped tiles, an asymmetric rounded window | 6 to **0** | 6.95 / 3.61 / 3.44 | Sitka Text Bold and Bold Italic, lining figures forced | 4 |
| 4 | eldar | Wraithbone: ivory S-curve vines and waves with teal spirit stones, a winged gem crest, a gem pendant with two swoops in the banner, a rounded window, leaf-shaped tiles | 6 to **0** | 5.23 / 6.07 / 3.22 | Palatino Linotype italic throughout | 4 |
| 5 | necrons | Seam-lit tomb metal: green-black metal, silver type, bronze trim, gauss-green seams on every edge, pyramids and an obelisk, hex nodes on the side conduits, a slab-cut window and plates | 6 to **0** | 5.40 / 5.91 / 3.22 | Bahnschrift SemiBold SemiCondensed throughout | 4 |
| 6 | imperium | Gothic gold and parchment: a blind arcade under the header, piers with red-glass lancet niches, two purity seals, an aged-parchment banner with a wax seal and a triple-lancet window, an octagonal window, arch-crowned plates | 6 to **0** | 5.15 / 6.61 / 3.68 | UnifrakturCook 700 title (lowercase), Cinzel 500 labels, IM Fell English banner (all bundled), Palatino body | 4 |
| | **Batch** | | **36 (+2 hover-only) to 0** | **text 5.03 (orks, hotkey recording text (accent-m) on input fill); non-text 3.47 (chaos, header line on header (non-text)); icons 3.22 (necrons)** | | |

"Lowest ratio" is the minimum over every pair in that theme's tables (gate pairs, add-on pairs and the generic accent-on-fill roles); text pairs need 4.5, non-text pairs 3. Every pair in every theme clears its threshold. The real gate script, run on the six prototype files in a temp skeleton with an **empty baseline** (so every theme is treated as new and none gets a legacy pass), reported **6 checked, 0 errors, 0 legacy warnings**; warhammer-chaos leaves the legacy list. A deliberately broken copy (one `--text-dim` set to `#4A3A3A`) made the same script report the error (1.82:1), so the run can fail.

Art call (audit section 7 said 4 redraw, 2 tone down): warhammer-chaos, warhammer-orks, warhammer-tyranids and warhammer-eldar are **redraw**; warhammer-necrons and warhammer are **tone down with new frame art** (palette, type and small motifs kept as the audit says; the painted panno and readouts go, and the frame kit of 0.3 is added). The result is six new frames, not six tints.

---

## 0. Batch-level section (applies to all six)

### 0.1 What is inherited (pointers; not restated)

B1 = `WIP/QuickLaunch/Docs/QuickLaunch_ThemeSpec_Batch01_2026-09-30.md`, B2 = `..._Batch02_...`, B3 = `..._Batch03_...`, B3R = `QuickLaunch_ThemeReview_Batch03_2026-09-30.md`, F = `QuickLaunch_ThemeSpec_Foundation_2026-09-30.md`.

| Rule | Where |
|---|---|
| Header art zone HZ: box 84 x 20 at `right:172px; top:10px` (x 168 to 252, y 10 to 30) with an **explicit `width`**; the title must end at x 156 or earlier; hidden while the filter chip shows (`#header:has(#filter-chip:not(.hidden))::after { display:none; }`, kept in every theme block), hidden below 424 px window width | B1 0.2, 0.1.5; F A2 |
| Frame art lives in `#grid-container`'s own `background` (not pseudo-elements: the grid scrolls and tiles paint over it); the tile field is **x 16 to W-20 at every size**, its 4 px keep-out x 12 to W-16 and y 52 to the banner top | B1 0.1.1, 0.1.4, 0.2; F A4 |
| Banner: top strip BZ-T (up to 7 px), icon slot BZ-I (22 x 22 at x 14, text starts at x 46), art anchored to fixed offsets; a big right-end motif limits the text box by `margin-right` (B3 A.2) | B1 0.2; B2 0.3.8; B3 Addendum A.2 |
| Header lines are drawn **inside** the header (`border-bottom-color` plus `box-shadow: inset 0 -2px 0`); nothing paints below y 40 | B1 12.1 items 2, F3, F4 |
| The settings version value takes `--accent-text`: `#app-version { color: var(--accent-text); }` | B1 12.1 item 4, F2 |
| `#app::after` (z 199) paints above tiles, icons and the header: **this batch has none** (`background: none`) | B1 0.1.2, F7 |
| Ghost-text removal (`#grid-container::before/::after`, `#particles`, `#edit-bar::after`, `#header::after` text, `#app` animation, title and banner-icon animations) and the `\A` trap | B1 0.3 (per-theme keyframe names in 0.5 below) |
| Shared tile rules: focus = hover plus ring; no label halo; no sheen sweep; tile layout unchanged (border 1 px, tile height 94.7 to 95.4); opaque backgrounds; `--glow-*`, `--pulse-glow` and `--scanlines` are `none`; `--tile-icon-glow` is the no-op filter | B1 0.4 |
| Contrast method (gate pairs, add-on pairs, generic accent-on-fill roles, icons through the fx filter on rest, hover and pressed grounds; `brightness()` never below 1.0 on a dark theme; the gate reads the **first** `--name:` match, so the gate variables are opaque hex and never appear in comments above `:root`) | B1 0.5, 0.1.8, 0.1.9, 0.1.11 |
| Texture measure (hidden-tiles shot, mean per-tile luminance sigma; the recorded ceiling is promise-mascot's 3.72) | B1 0.6; B2 12.1 |
| Infinite-animation counting and the tier key | B1 0.7; `create-theme.md` (CPU-efficient animations) |
| Verification set (grid, hover on CALCULATOR, settings, hidden-tiles, 640 x 420, 1024 x 700, focus ring, filter chip, edit mode, update banner, skin picker, scrolled one row) | B1 0.8 |
| The A/B/C overlap probe: A hides art and content, B shows art only, C shows content only; art = diff(B,A), content = diff(C,A); overlap must be 0 px and art inside the keep-out 0 px, at 424 x 300, 640 x 420, 1024 x 700 and in the chip, edit-bar, update-bar and focus-ring states | B1 12.3; B2 0.4, 12.1; B3 0.1 |
| Squint test: cover the title and banner text; a fan must still name the franchise. Colour-discipline checks in each "Done when" apply to the chrome and exclude the six tile icons (the apps' own art) | B1 12.2; B2 11.2 |
| Bundled fonts: the seven family strings, `font-display: block`, only declared weights, `font-synthesis: none`, display faces on `#title` only (warhammer's Cinzel labels are the one mapped exception), blackletter lowercase, the title width ladder (edge at most 156), the label gate, banner fit, `line-height: 1.2` on display titles, wait for `document.fonts.ready`, the Cyrillic fallback stacks | F B1, B2, B5 |
| Base-layout fixes this batch relies on: scrolling Settings and cheat-sheet, banner fit check, `scrollbar-gutter: stable` | F A1, A3, A4 |

### 0.2 Facts from earlier batches and the Foundation that this spec relies on, and the batch 3 review lessons applied up front

1. **Post-Foundation geometry.** The tile field is x 16 to W-20 at every size and the focus ring reaches x 12 and W-16. Batch 3's bands were 10 px wide and ended 0.5 to 2 px from the ring (B3R section 2). **This batch's bands are 8 px wide** (left x 1 to 9, right x W-13 to W-5, top window y 40 to 49) so the clearance to the ring is 3 px by construction. Measured on the mock with the distance transform: the nearest art pixel is 4 px from the nearest ring pixel (3 empty pixel columns between them) at 424 x 300, 640 x 420 and 1024 x 700 in all six themes (0.4).
2. **`:has()` works** in the shipped Electron (`^32`, Chromium 128); the chip-hides-art rule is proven.
3. **`font-stretch` reaches Bahnschrift only as the SemiCondensed face** (B2 0.2.3). warhammer-necrons uses `font-stretch: 87.5%` and says so.
4. **Texture ceiling: 3.72** (promise-mascot, measured). No theme in this batch has any texture; every hidden-tiles sigma is 0.00.
5. **Icon numbers to beat.** The lowest non-Terminal plate ratio over rest, hover and pressed in this batch is 3.22 (necrons); none of the six has grain, so no texture penalty applies.
6. **The bundled fonts exist in the working tree** (`src/renderer/fonts/`). I loaded four of them read-only into the mock to measure real widths (Cinzel-VF, UnifrakturCook-Bold, IM Fell English and Pirata One); nothing was copied into the repo, edited or shipped. Dela Gothic One, Jost and Metamorphous are not used in this batch.
7. **The banner fit check (F A3) is the net, not the plan.** Every line below fits by design, with the longest line ending at least 24 px before the text box edge (x 320) and at least 39 px before the motif's first painted pixel (0.8).
8. **The real gate now has six checks.** `scripts/check-theme-contrast.js` also checks `--btn-close-color` on `--panel-bg` (added at foundation review 1). The gate tables below list six gate pairs, not five.

**Lessons from the batch 3 review (B3R), applied before they could recur:**

| Lesson (B3R) | What this batch does |
|---|---|
| A cross that reads as a plus (ac-templars F2) | No cross of any kind is drawn in the batch. Every 22 px icon was rendered at 1x and 6x and judged by what it reads as first: seal (a wax disc on a strip; it could read as a rosette, flagged as a watch item only if Sergei sees it), spiked collar, gem, hexagonal node (could read as an isometric cube, watch item in 5), cleaver, talon. |
| Digit styles that read wrong (doom-classic F1, slashed zeros) | No numeral is drawn in any SVG. Figures are real text, so the font decides: **Georgia, Constantia and Sitka Text (regular) draw old-style figures** that read as "2o22" in software names and version numbers; Georgia and Constantia were replaced (Cambria, Palatino Linotype; both have lining figures) and Sitka is forced with `font-variant-numeric: lining-nums` (0.7). Measured in the mock with a name set "Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64". |
| A hood that reads as a rocket (ac-assassins) | Same rule as the cross: icons judged at 1x first. Each icon has one dominant, unambiguous shape. |
| Art within 3 px of a focus ring (B1 12.1; B3 watch 3) | Bands 8 px wide, so **3 empty pixels** between the art and the ring zone (the distance transform reads 4 px in all six themes at the three sizes; batch 3 read 0.5 to 2). |
| The brightest surface of a theme pulls the eye (ac-templars banner) | Only warhammer (Imperium) has a light surface (the parchment banner). It is a watch item with a one-hex lever (Imperium watch 1) and a flag for Sergei. |
| The version line in another face than the title (ac-templars F4) | Each theme sets `--font` and the version inherits it, so the version always matches the body face. Imperium's blackletter title beside a Palatino version is deliberate (blackletter is for the title only). |
| Placeholder text is below 4.5:1 (B3R section 5; a base default of `#757575`) | Every theme adds `.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }` and the tables list the three placeholder pairs. The base-level fix stays an offer for Sergei. |
| Contrast pairs must use the real cascade | `#btn-done-edit` and `#btn-close-settings` set their own `color` by id, which beats `button:hover { color:#fff }`; their hover text therefore stays `--btn-done-color` and `--btn-close-color`, not white (batch 3's tables assumed white). The tables here use the real colour. The `.update-btn`, header buttons and `+ FILE` hover text is white (the type selector `button:hover` wins there). |
| A plate cut shows only past the mock plate's own rounding (B1 12.1 item 3: 21 percent) | Every cut plate here is a shape that starts at 22 percent or more, or a whole silhouette (0.3, tile table). |
| Generated text exposed to screen readers (swl-dragon F3) | No `content` string in the batch except `''`. |
| A spec text that disagrees with its table (doom-classic F7) | The `:root` blocks, the rules blocks, the SVG sources and every contrast table here were **generated from one data file**, and the six prototype CSS files were built from the same text and gated and rendered (0.4). |

### 0.3 The shared frame kit, and the six materials that fill it

One kit means one set of helpers for Ender: the same zones, the same layer order, the same sizes. Only the pixels inside each zone differ, and that is what makes six materials rather than six tints. All numbers are at 424 x 300 and hold at any size (the zones are anchored to the window edges, never scaled).

| Zone | Where (424 x 300) | Size | Host and recipe |
|---|---|---|---|
| Header line | window y 37 to 40, inside the header | 3 px | `#header { border-bottom-color: LINE; box-shadow: inset 0 -2px 0 LINE2; }`; `#header::before` is the 2 or 3 px accent bar at the left edge |
| Header art HZ | x 168 to 252, y 10 to 30 | 84 x 20 | `#header::after`, explicit `width: 84px`, hidden while the chip shows |
| Top course | window y 40 to 49 (container y 0 to 9), full width | 9 px tall, `repeat-x` from x 0 | last layer of `#grid-container`'s background; its lowest pixel is 3 px above the keep-out (y 52) |
| Side bands | left x 1 to 9, right x W-13 to W-5, full container height | 8 px wide, `repeat-y` | two layers of `#grid-container`'s background (`left 1px top 0`, `right 5px top 0`); opaque strips (Eldar's vine is the one transparent line, so its corner arcs overlap the first swing), since `repeat-y` also fills upward under the top corners |
| Corner caps | the four 8 x 8 corners of the frame | 8 x 8 | four layers on top of the strips (`left 1px top 0`, `right 5px top 0`, `left 1px bottom 0`, `right 5px bottom 0`); one cap or four mirrored variants |
| Banner top course | banner y 0 to 7 (window y 257 to 264) | up to 7 px, `repeat-x` | second layer of `#theme-banner`'s background |
| Banner motif | x W-96 to W-12, window y 266 to 300 | 84 x 34 | first layer of `#theme-banner`'s background: `right 12px bottom 0 / 84px 34px no-repeat`; `#theme-banner-text` gets `margin-right: 90px` so its box ends at W-104 and the fit check protects the art |
| Banner icon | x 14 to 36 | 22 x 22 | `#theme-banner::before` with `content:''`, `font-size:0`, `opacity:1` |
| Window | `--app-clip` and `--overlay-clip` (the same value) | | a polygon or `inset(0 round ...)`; every content corner is tested against it (0.4) |
| Tile plate | `--tile-icon-shape` | 64 x 64 | a silhouette per material (margins in each theme section) |

The container's background, top layer first (every theme follows this order; the values differ):

```css
#grid-container {
  background:
    CORNER_TL left 1px top 0 / 8px 8px no-repeat,
    CORNER_TR right 5px top 0 / 8px 8px no-repeat,
    CORNER_BL left 1px bottom 0 / 8px 8px no-repeat,
    CORNER_BR right 5px bottom 0 / 8px 8px no-repeat,
    SIDE left 1px top 0 / 8px <tile height> repeat-y,
    SIDE right 5px top 0 / 8px <tile height> repeat-y,
    TOP left 0 top 0 / <tile width> 9px repeat-x;
}
```

**The six materials in the kit:**

| | Imperium | Chaos | Orks | Tyranids | Eldar | Necrons |
|---|---|---|---|---|---|---|
| Material | gothic gold and parchment | spiked, corrupted iron plate | bolted scrap, rust and paint | wet chitin and membrane | wraithbone and spirit stones | seam-lit tomb metal |
| Header line | gold | corrupted red | scrap grey | flesh pink | teal | gauss green over dim green |
| Top course | blind arcade of pointed arches | iron teeth hanging down | yellow-black chequer band | row of curved bone ribs | thin wave with gems | seam over pyramid notches |
| Side bands | piers with red-glass lancet niches | iron strip with brass studs and cracks | bolted scrap plates, a weld seam | spine of vertebrae on sinew | S-curve vine with gems | conduit with hex nodes and a seam |
| Corners | stone cap, gold diamond | cracked iron cap | bolted plate | tendril curl | quarter arc with a gem | triangular wedge |
| Header art | two purity seals and a lancet on a rail | cracked bar with three spiked studs | riveted plate with a jagged grin | pair of mandibles and a bulb | winged crest with a gem | three pyramids with seams |
| Banner surface | aged parchment (light) | blood-dark | brown-black | deep purple | deep teal-navy | green-black |
| Banner course | gold rule, red diamonds | teeth rising over red | red speed-stripes | scalloped membrane | thin bone wave | seam over pyramid notches |
| Banner icon | wax seal on a strip | spiked collar | cleaver | talon | faceted gem | hex node with a seam |
| Banner motif | triple-lancet window | spikes on a cracked plate | battered plate, bullet holes | talons and tendrils | pendant and two swoops | pyramids and an obelisk |
| Window | octagon, 14 px | two broken corners | uneven cuts | asymmetric rounded | rounded 18 px | slab, two chamfers |
| Plate | arch-crowned | two broken corners | crooked quad, rotated | pod | leaf | notched slab |

The six squint images side by side (title, labels and banner text painted out, blurred 1.4 px) read as six different windows: a gold-and-parchment cathedral, an iron jaw, a purple-and-bone ribcage, a navy-and-teal filigree, a green-seamed tomb and a yellow-black scrapyard. Sheet in the scratchpad: `judy/b4/out/squint_sheet.png`.

### 0.4 How this spec was verified (I could render, without launching QuickLaunch)

I built the **post-Foundation mock window**: the repo's `base.css`, `index.html` and the seven bundled fonts, the gallery's mock tiles (`scripts/theme-gallery/mock-data.cjs`), one candidate theme file per run, driven in headless Edge 154 over the DevTools protocol at 424 x 300, 640 x 420 and 1024 x 700 (not QuickLaunch, not Electron; every launch on a temp profile in the scratchpad). The candidate files were **built from the text of this spec** (a generator writes the CSS and the tables from the same data). On that mock I measured, for all six:

- **Gate:** the real `check-theme-contrast.js`, run on the six files in a temp skeleton with an empty baseline: **6 checked, 0 errors, 0 legacy warnings**. **Positive control:** with `--text-dim` set to `#4A3A3A` in one copy the same run reports the error (1.82:1); restored, none.
- **Title edges, label widths, banner lines:** real fonts, real tracking (0.7, and each theme's type table). Every standard label fits the 100 px box with no ellipsis; every banner line fits on one line (`scrollWidth <= clientWidth`) at 424 and 640.
- **A/B/C overlap probe** at 424 x 300, 640 x 420 and 1024 x 700, in the chip, edit-bar, update-bar and edit-plus-update states, and with a focus ring on the first and last column at 424 x 300 and on the last column at 640 x 420 and 1024 x 700 (the ring is forced with a class that applies the theme's own focus rule, so a browser-level scroller ring cannot leak in). **Art-off override** (the same for all six): `#header::after, #header::before { display:none }`, `#theme-banner::before { visibility:hidden }`, `#grid-container { background:none !important }`, `#theme-banner { background:<its surface colour> !important }`; content-off hides the title, version, buttons, chip, grid, banner text, edit bar and update bar. **Result: overlap 0 px and art in the keep-out 0 px in all 66 runs.** **Positive control:** with a magenta block planted over the title in the art layer, the probe reads 193 to 425 px of overlap (it can fail). A first run of the probe showed 76 px of "overlap" in the banner icon box; the cause was the art-off override using `display:none` on `#theme-banner::before`, which moves the flex text under the icon box. `visibility:hidden` fixed it, and Ender should use that form too.
- **Window clips:** with a magenta backdrop, the four corners of the title, version, header buttons, banner text, banner icon, edit bar buttons, update bar controls and the settings title and footer buttons (at 424 x 300 and 640 x 420) are all painted: **0 clipped points in every state**.
- **Hidden-tiles sigma:** 0.00 for all six (no texture layer).
- **Fonts:** the platform fonts the mock actually used per element are in each type section (`CSS.getPlatformFontsForNode`); a misspelled family falls back to `serif` (319.2 px against 319.2 px, the negative control).
- **Plate margins:** the six mock glyphs were rasterised at 4x and measured against each clip shape, so every margin in the tile tables is a computed distance, not an impression.

**Caveats.** Chromium 154 is not Electron 32; sub-pixel text and filter rounding can differ, so **Ender's numbers win** over mine where they differ. The renders are the target look, not a pixel contract. I did not see: the skin-picker list open, the empty-library drop hint, the updater error bar. The prototypes and renders are in the session scratchpad at `judy/b4/` (`themes/<theme>.css`, `verify/<theme>/`, `out/`); **this spec's text is the contract.**

### 0.5 Deletions per theme (pattern in B1 0.3; here are the keyframe sets)

Delete every rule listed in B1 0.3 in each file, plus these `@keyframes`, which nothing else uses: warhammer `wh-ember`, `wh-aquila`, `wh-readout`, `wh-flicker`, `wh-battle-ash`; warhammer-chaos `chaos-star`, `chaos-readout`, `chaos-title`, `chaos-border`, `chaos-debris`; warhammer-eldar `eldar-runes`, `eldar-readout`, `eldar-title`, `eldar-border`, `eldar-motes`; warhammer-necrons `necron-monolith`, `necron-readout`, `necron-title`, `necron-border`, `necron-motes`; warhammer-orks `ork-shoota`, `ork-readout`, `ork-title`, `ork-border`, `ork-debris`; warhammer-tyranids `tyranid-hive`, `tyranid-readout`, `tyranid-title`, `tyranid-border`, `tyranid-spores`. Also delete each file's `.app-tile::before` shape and `.app-tile:hover::before` animation rules (replaced by `.app-tile::before { display:none; }`), the `--banner-icon-anim` and `--title-anim` values (set to `none`), and set `--app-entrance-anim: entrance-fade 0.8s ease-out forwards` (the old `entrance-flash` in warhammer is retired). Every legacy file also has a painted panno, a readout, header text, an edit-bar quote and a particle layer; all of them go (B1 0.3).

The new files are **short**: 9.9 to 15.6 KB each (the legacy files are 18.6 to 22.9 KB), mostly SVG data URIs.

### 0.6 Motion inventory (before to after; method B1 0.7; "hover-only" is counted separately)

Tier key (create-theme.md, cheapest first): 1 opacity or transform, 2 colour or text-shadow, 3 filter, 4 background-position or size, 5 box-shadow, 6 clip-path. Counted from the six legacy files (`grep infinite` and the `--title-anim` and `--banner-icon-anim` values):

| Theme | Today (infinite, running at capture) | Hover-only today | After |
|---|---|---|---|
| warhammer-chaos | 6: `chaos-title` (2); `banner-throb` (1); `chaos-star` (1); `chaos-readout` (2); `chaos-border` (5); `chaos-debris` `#particles` (4) | `tile-flicker .6s steps(1) infinite` (opacity, 1) | **0** |
| warhammer-orks | 6: `ork-title` (2); `banner-throb` (1); `ork-shoota` (1); `ork-readout` (2); `ork-border` (5); `ork-debris` `#particles` (4) | `tile-flicker .4s steps(1) infinite` (opacity, 1) | **0** |
| warhammer-tyranids | 6: `tyranid-title` (2); `banner-throb` (1); `tyranid-hive` (1); `tyranid-readout` (2); `tyranid-border` (5); `tyranid-spores` `#particles` (4) | none infinite (`tile-radial`, one-shot) | **0** |
| warhammer-eldar | 6: `eldar-title` (2); `banner-pulse` (1); `eldar-runes` (1); `eldar-readout` (2); `eldar-border` (5); `eldar-motes` `#particles` (4) | none infinite (`tile-radial`, one-shot) | **0** |
| warhammer-necrons | 6: `necron-title` (2); `banner-pulse` (1); `necron-monolith` (1); `necron-readout` (2); `necron-border` (5); `necron-motes` `#particles` (4) | none infinite (`tile-scan-v`, one-shot) | **0** |
| warhammer | 6: `wh-flicker` title (2); `banner-throb` banner icon (1); `wh-aquila` grid-container::before (1); `wh-readout` ::after (2); `wh-ember` `#app` box-shadow (5); `wh-battle-ash` `#particles` background-position (4) | none infinite (`tile-radial`, one-shot) | **0** |
| **Batch total** | **36** | 2 | **0** |

No new infinite animation is added anywhere (the "no higher than today" limit is met at 0). There is no `will-change` in any theme file, no `backdrop-filter`, no `@keyframes`, no `animation:` property. The only motion left in any state is the base one-shot `transition` on tiles (0.12 s) and the one-shot entrance fade. By the measured tiers in `create-theme.md`, a whole animated theme costs 55 to 83 percent of one core while focused; these six cost the 0.5 percent idle floor. Acceptance: `grep -c infinite <theme>.css` is 0 for all six and the after-run `loopingAnimationsAtCapture` is 0 for all six (it was 6 in each).

### 0.7 Fonts used

| Family (CSS) | File(s) | Themes | Cyrillic |
|---|---|---|---|
| **`'UnifrakturCook'`** (bundled, Bold only) | `fonts/unifrakturcook/UnifrakturCook-Bold.ttf` | warhammer title (700, lowercase, 12 px) | no; title is Latin markup, falls to Palatino Linotype |
| **`'Cinzel'`** (bundled, variable 400 to 900) | `fonts/cinzel/Cinzel-VF.ttf` | warhammer tile labels (500, uppercase) | no; Cyrillic names fall glyph by glyph to Palatino Linotype (checked: "Калькулятор", "Жёсткий диск") |
| **`'IM Fell English'`** (bundled, roman only) | `fonts/imfellenglish/IMFeENrm28P.ttf` | warhammer banner (400, 12 px, `font-style: normal`) | no; banner strings are Latin, falls to Georgia |
| **`'Pirata One'`** (bundled, Regular only) | `fonts/pirataone/PirataOne-Regular.ttf` | warhammer-chaos title (400, 13 px) | no; title is Latin markup, falls to Georgia |
| Palatino Linotype (regular, italic) | `pala.ttf`, `palai.ttf` | warhammer body, version and settings; warhammer-eldar everything (italic); fallback for Cinzel and UnifrakturCook | yes |
| Cambria (regular, bold) | `cambria.ttc`, `cambriab.ttf` | warhammer-chaos body, labels (700) and banner (700) | yes |
| Sitka Text (variable, regular, bold, italic) | `SitkaVF.ttf`, `SitkaVF-Italic.ttf` | warhammer-tyranids body, title, labels and banner (700, banner italic) | yes |
| Bahnschrift (variable; SemiCondensed through `font-stretch: 87.5%`) | `bahnschrift.ttf` | warhammer-necrons everything (600) | yes |
| Impact | `impact.ttf` | warhammer-orks title and banner | yes |
| Ink Free | `Inkfree.ttf` | warhammer-orks tile labels (400; the face has one weight) | yes (`CSS.getPlatformFontsForNode` reports Ink Free for "Калькулятор" and "Жёсткий диск"; checked) |
| Segoe UI Semibold | `seguisb.ttf` | warhammer-orks body, version and settings | yes |
| Georgia | `georgia.ttf` | fallback for IM Fell English and Pirata One only | yes |

Not used: Dela Gothic One, Jost, Metamorphous (approved, not needed here) and every non-approved face (7 lists what I still wish for). **Old-style versus lining figures.** I rendered "v1.94.3 2022 0123456789" in every candidate face: **Constantia, Georgia, IM Fell English and Sitka Text (regular weight) draw old-style figures**; Cambria, Palatino Linotype, Cinzel, Pirata One, Bahnschrift, Impact, Ink Free and Segoe UI draw lining figures. IM Fell English only sets banner lines (no figures in them), so it stays; Constantia and Georgia are not used anywhere in the batch (the audit named Georgia for chaos and Constantia for eldar and tyranids; see 0.10); Sitka keeps `html, body { font-variant-numeric: lining-nums; }`.

### 0.8 Banner lines: what was verified, how, and what was dropped

Method: I fetched near-primary pages and matched every string letter for letter against them. Fetched (raw text read): Wikiquote "Warhammer 40,000" and "Warhammer 40,000: Dawn of War" (the Imperium start-menu quotes, Space Marines, Chaos); warhammer-guide.ru "Dawn of War: Quotes" (unit lines for Orks, Eldar and Chaos) and "Dawn of War Single Player Quotes: Dark Crusade" (the Necron Lord's campaign lines); the Goodreads page for Codex: Tyranids (the Czevak passage). Search results confirmed individual lines (a Dawn of War 10th-anniversary post, a Dark Crusade clip title, the Warhammer 40,000 wiki and Know Your Meme for the Ork phrase). Lexicanum, the Warhammer and Dawn of War Fandom wikis and TV Tropes refused a fetch (402 and 403), so none of them is a source here. Case is presentation: the banner has no `text-transform` except where a theme sets one (Chaos, Orks and Necrons set uppercase), and the strings below are exactly what goes into `THEME_BANNERS`. **No line in this batch is studio-authored.**

| Theme | Line (in order) | Type | Source |
|---|---|---|---|
| chaos | `Blood for the Blood God!` | quote (Khorne Berzerker Squad) | Wikiquote, Dawn of War, Chaos; warhammer-guide.ru |
| chaos | `Skulls for the Skull Throne.` | quote (Chaos Space Marine Squad) | warhammer-guide.ru Dawn of War quotes (not on the Wikiquote page; the phrase is the paired Khorne cry in every source searched). Single page-verified source |
| chaos | `Sanity is for the weak!` | quote (Aspiring Champion) | Wikiquote, Dawn of War, Chaos (warhammer-guide.ru prints "Sanity... is for the weak!"; the shorter form is Wikiquote's) |
| chaos | `For the Dark Gods!` | quote (Cultist Squad, generic battle cry) | Wikiquote; warhammer-guide.ru |
| chaos | `Do you hear the voices, too?` | quote (Chaos Space Marines) | Wikiquote, Dawn of War, Chaos |
| orks | `WAAAGH!` | quote (the war cry; a Slugga Boy line) | warhammer-guide.ru Dawn of War quotes |
| orks | `Orks is made for fightin!` | quote (Slugga Boy Squad) | warhammer-guide.ru. Single page-verified source |
| orks | `I'm da biggest, so I'm da boss!` | quote (Warboss) | warhammer-guide.ru. Single page-verified source |
| orks | `Dakka dakka dakka!` | quote (Flash Gitz) | warhammer-guide.ru |
| orks | `Ev'ryone knowz red wunz go fasta!` | quote (Tankbusta) | warhammer-guide.ru; the "red ones go faster" idea is documented on the Warhammer 40,000 wiki, Know Your Meme and DakkaDakka (search excerpts) |
| tyranids | `There is a cancer eating at the Imperium.` | quote (Inquisitor Czevak at the Conclave of Har, Codex: Tyranids 5th edition; the first sentence, verbatim) | Goodreads page for Codex: Tyranids (page text, with its own typos in later sentences); search results quoting the same passage |
| tyranids | `...it must know us only as Prey.` | quote (same passage; the last clause of its final sentence, so it opens with an ellipsis) | same |
| eldar | `The future is clouded and uncertain.` | quote (Farseer) | warhammer-guide.ru Dawn of War quotes; the Dawn of War wiki Farseer page (search excerpt) |
| eldar | `All who love life, fear the reaper.` | quote (Dark Reaper Squad) | warhammer-guide.ru; the Dawn of War 10th-anniversary post on the official account (search excerpt; printed there with a capital R) |
| eldar | `I am Khaine incarnate.` | quote (Avatar of Khaine) | warhammer-guide.ru Dawn of War quotes. Single page-verified source |
| eldar | `We cannot fail.` | quote (Guardian Squad) | warhammer-guide.ru Dawn of War quotes. Single page-verified source |
| necrons | `We are your end, alien.` | quote (Necron Lord, Dark Crusade campaign, against Orks) | warhammer-guide.ru, Dark Crusade single-player quotes (the page labels the speaker "Macabee") |
| necrons | `So much fear. So much noise.` | quote (Necron Lord, against the Imperial Guard) | same page; a Dark Crusade clip titled "So Much Fear" (search result) confirms the line |
| necrons | `Death has come for you at last.` | quote (Necron Lord, against Eldar) | same page |
| necrons | `Your bravado will not save you.` | quote (Necron Lord, against Orks) | same page |
| necrons | `Your end is inevitable.` | quote (Necron Lord, against Space Marines; the first sentence of a longer line) | same page |
| imperium | `Only in death does duty end.` | quote (Imperium "thought for the day", Dawn of War start menu) | Wikiquote, Warhammer 40,000: Dawn of War, start-menu and commander quotes; warhammer-guide.ru Dawn of War quotes |
| imperium | `Blessed is the mind too small for doubt.` | quote (same list) | Wikiquote, same section |
| imperium | `The Emperor protects.` | tagline (the Imperium's motto) | Wikiquote, Warhammer 40,000, "General Taglines & Mottos" (printed there as "The Emperor Protects", no period; the banner has no title case) |
| imperium | `Victory needs no explanation, defeat allows none.` | quote (same list) | Wikiquote and warhammer-guide.ru, start-menu quotes |
| imperium | `No man died in His service that died in vain.` | quote (same list) | Wikiquote, same section |

**Dropped for cause** (verified but too long or too heavy for the layout): Imperium "In the grim darkness of the far future, there is nothing but war." (65 characters, about 345 px); Necrons "Your end is inevitable. Submit and spare yourselves the pain of living." and "We exterminated all life on this planet once before and we will do so again."; Eldar "The mists of space and time retreat from my mind." (257.6 px: it fits the text box but would end about 26 px before the motif, under the 30 px comfort rule of B2 0.3.8; "We cannot fail." is the better short line); Tyranids the Czevak clause "...leaving drained, dead worlds in its wake." (260.6 px; it ends 28 px before the motif, under the 30 px rule) and the sentences "With each decade it advances deeper, leaving drained, dead worlds in its wake." (78 characters) and "There is a terrible darkness descending upon the galaxy, and we shall not see it ended in our lifetimes."; Chaos "MAIM KILL BURN! MAIM KILL BURN!" (a double shout; the single "Blood for the Blood God!" does the work). **Not found in any source fetched, so not kept** (the six current `THEME_BANNERS` entries): Imperium `SUFFER NOT THE UNCLEAN TO LIVE.` and `FOR THE EMPEROR AND TERRA! PURGE THE XENOS!` (the other three Imperium lines were real and are kept, in sentence case); Chaos `LET THE GALAXY BURN.`, `THE WARP IS NOT A PLACE. IT IS A HUNGER.`, `CHAOS IS THE ONLY TRUE CONSTANT IN THIS UNIVERSE.`, `DEATH TO THE FALSE EMPEROR.` (the first line, `BLOOD FOR THE BLOOD GOD. SKULLS FOR THE SKULL THRONE.`, is two real lines and is split); Orks `WAAAGH! DA BOYZ IZ COMIN!`, `MORE DAKKA! NEVER ENUFF DAKKA!`, `GREEN IZ BEST. EVERYONE KNOWS DAT.`, `OI! WHO LET DA GROT TOUCH ME SHOOTA?`, `DA BIGGER DA BOSS, DA HARDER DA KRUMPIN.`; Eldar all five (`THE PATH IS LONG, AND WE WALK IT ALONE.`, `WE ARE THE AELDARI. WE WERE OLD WHEN YOUR SPECIES WAS BORN.` and the others); Necrons all five (`WE WERE HERE BEFORE YOUR KIND DREW BREATH...`, `SIXTY MILLION YEARS OF SILENCE...` and the others); Tyranids all five (`THE SWARM HUNGERS. NOTHING WILL REMAIN.` and the others). "Not found" means I did not find it in the pages I could fetch, not that it is false.

**Line counts after:** warhammer 5, warhammer-chaos 5, warhammer-eldar 4, warhammer-necrons 5, warhammer-orks 5, warhammer-tyranids 2 (26 lines; the rotation code has no minimum; the comment above `THEME_BANNERS` is stale, B1 12.8 watch item 1 and B3 F6).

**Fit (measured on the mock with the real fonts and tracking; the text box at 424 px starts at x 46 and ends at x 320, because of `margin-right: 90px`, so it is 274 px wide):**

| Theme | Widest line (px) | Where it ends | To the text box edge (x 320) | To the motif's first painted pixel |
|---|---|---|---|---|
| chaos | 185.3 | x 231.3 | 88.7 px | 98.4 px (first painted pixel x 329.6) |
| orks | 198.2 | x 244.2 | 75.8 px | 86.3 px (first painted pixel x 330.5) |
| tyranids | 249.7 | x 295.7 | 24.3 px | 38.8 px (first painted pixel x 334.5) |
| eldar | 186.6 | x 232.6 | 87.4 px | 96.9 px (first painted pixel x 329.5) |
| necrons | 183.8 | x 229.8 | 90.2 px | 98.2 px (first painted pixel x 328.0) |
| imperium | 243.2 | x 289.2 | 30.8 px | 40.8 px (first painted pixel x 330.0) |

All lines fit on one line at 424 and at 640 (`scrollWidth <= clientWidth`). Ender confirms for every string; the JavaScript block in 8 has the exact entries.

### 0.9 Trademark and signature elements: what is drawn and what is not

| Franchise element | What this spec draws | What it does not draw |
|---|---|---|
| Imperium | Pointed arches, lancets, a wax seal on a parchment strip, a triple-lancet window, gold diamonds | The Aquila (double-headed eagle), the skull, the cog-skull, chapter badges, any chapter heraldry |
| Chaos | Iron teeth, spiked brass studs, a spiked ring, curved spikes, hot-red cracks, broken corners | The Star of Chaos (eight arrows), the four god sigils, runes, horned silhouettes of any figure |
| Orks | A riveted plate with a jagged grin, chequer paint, red stripes, a cleaver, bullet holes, bolts | The Ork glyph (horned skull), klan glyphs, the shoota, any weapon from the codex, gag lettering |
| Tyranids | Ribs, vertebrae, scythe talons, mandibles, tendrils, a membrane | The hive-fleet marks, the Genestealer silhouette, the Hive Mind sigil, any creature |
| Eldar | A gem in a ring, ivory swoops, vines, a leaf shape | Craftworld runes, the Eldar crest, any Aeldari script |
| Necrons | Pyramids, an obelisk, a hexagon with seams, seam lines, pyramid notches | Necron glyphs, the Monolith, the scarab swarm, the staff, any Necron figure |

### 0.10 Where this spec departs from the audit (and from the Foundation map), and why

| Theme | Audit direction | This spec | Reason |
|---|---|---|---|
| all | gutter rules and ticks; art in the frame; header text deleted or 14 characters | frame art in the 8 px bands only; no header text; **a shared kit** (0.3) | the gutters move with the window width (B1 0.1); the audit's batch note asks for one kit with per-faction motifs |
| warhammer-chaos | Georgia bold caps; spike teeth on the header bottom and banner top; a cracked-corner notch; a spiked ring icon; warp purple on hover fills only; Pirata One title (map) | **Cambria Bold** caps; teeth hang from the header line and rise from the banner; two broken window corners; a spiked collar; header line `#C0352A` | Georgia and Constantia draw old-style figures that read as "2o22" in app names and the version (0.7); the audit's `#8E1B15` line is 2.13:1 on the header, under the 3:1 a meaningful line needs |
| warhammer-orks | a static chequer band on the header bottom and banner top; red speed-stripe ticks in the gutters; a bolted plate corner; Impact title; Ink Free bold labels | the chequer band under the header, **speed-stripes on the banner top** (not the gutters), bolted strips down both sides, a toothy plate in the header, a **cleaver** icon, a plate with bullet holes; Ink Free **regular** | gutter art is dropped (B1 0.1); the stripes need a long strip and the banner top gives one; Ink Free has no bold and a faked one smears (`font-synthesis: none`) |
| warhammer-tyranids | a ribbed carapace band (repeating radial gradient); curved tendril arcs in two corners; a translucent-membrane gradient in the banner; Constantia bold; V-bottom tiles kept | an SVG **rib row**; tendril curls in **all four** corners; a scalloped membrane course on a flat purple banner; **Sitka Text Bold**; **pod-shaped** plates | a radial gradient cannot draw a rib; Constantia draws old-style figures; a V has two straight edges and the reference sheet says no straight lines; the pod keeps the glyph margin at 7.2 px |
| warhammer-eldar | S-curve swoops in two opposite pad corners; a slender pointed arch behind the title; a teal gem dot as the banner icon; Constantia italic; teardrop tiles | S-curve **vines and waves along all frame bands**; a winged crest in the header zone (not behind the title); a faceted gem icon and a pendant; **Palatino Linotype italic**; leaf-shaped tiles | an 8 px band cannot carry a corner swoop, so the curve is the band; no art may sit under text (C5); Constantia draws old-style figures; CSS cannot clip a true teardrop without a pixel `path()` that would not scale with the icon size |
| warhammer-necrons | thin green seams on the header bottom and the pad edge; triangular pyramid notches in the corners; a plain hexagon as the banner icon; Bahnschrift SemiBold caps | seams on every edge, **pyramid notches along the courses**, hex nodes on the side conduits, a pyramid-and-obelisk skyline, a hexagon with a three-way seam as the icon | the notches repeat along the course (a corner-only notch is invisible at 8 px); the skyline is the theme's bold element |
| warhammer | parchment `#D9C9A1` banner with dark text and a wax-seal dot; a rivet row and gothic-arch corner notches on the pad; Palatino caps, wide tracking | parchment **`#C8B78A`**; an arcade and piers with lancet niches, seals in the header, a triple-lancet window; **UnifrakturCook title, Cinzel labels, IM Fell English banner** (the Foundation map) | the audit's parchment is the brightest surface in the set (11.2:1 for ink on it); one step down keeps the look and 9.2:1; the type follows the map and Sergei's ruling that UnifrakturCook stays |
| all | banner quotes | quotes replaced by verified lines (0.8) | B1 0.10; H3 |

### 0.11 Suggested implementation order for Ender

1. **warhammer** first (it uses three bundled fonts, so it proves the font load and the title ladder, and its parchment banner is the only light surface), then **warhammer-chaos** (the broken-corner clip polygons need the corner test), then **warhammer-orks** (the one `.tile-icon` filter override and the rotations).
2. **warhammer-tyranids** (the lining-figures rule), **warhammer-eldar**, **warhammer-necrons**.
3. After each theme: `npm run check:contrast` (no `--rebaseline`), `grep -c infinite`, the gallery after-run, the hidden-tiles shot, the A/B/C probe at the three sizes plus the states shot (with `visibility:hidden` on the banner icon in the art-off override), and the theme's "Done when". After the fonts: `fontsRendered` (positive control: each adopted family listed; negative control: a misspelled probe family falls back). In the Foundation after-run also check the focus ring on the last column at 640 x 420 and 1024 x 700: expected 3 empty pixels between the art and the ring zone.

---

## 1. warhammer-chaos (WARHAMMER 40K: CHAOS): DONE

**Audit:** score 2, redraw, legacy contrast failure (text-dim, accent-c, hint-sub). Red and black with four god colours at once means no god is chosen, so it was none of them. A radial star of lines with a red hub sat behind CALCULATOR, four coloured god bars ran beside CALCULATOR and PAINT, god names printed on the left and the banner truncated. Smooth and tidy, not spiked or cracked. Six infinite animations and a hover flicker.
**Direction:** one god and one material, **spiked, corrupted plate**: blackened iron, brass studs, hot-red cracks, teeth. The frame is a pair of jaws: a corrupted-red line under the header with iron teeth hanging from it, iron teeth rising from the banner top, spiked studs and cracks down both sides. Two of the window corners are broken (jagged cuts). The header carries a cracked iron bar with three spiked brass studs; the banner is blood-dark with a brass spiked collar for its icon and three curved iron spikes on a cracked plate at its right end. Brass carries the chrome (focus, hover, values), red is the line, the cracks and edit mode, warp purple appears only in the tile hover and pressed fills. No green, blue or pink anywhere. Plates have two broken corners. No Star of Chaos, no sigil, no rune, no text in any SVG. Static.

### 1.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: polygon(16px 0, calc(100% - 5px) 0, calc(100% - 5px) 3px, 100% 6px, 100% calc(100% - 17px), calc(100% - 7px) calc(100% - 12px), calc(100% - 11px) calc(100% - 14px), calc(100% - 14px) 100%, 5px 100%, 0 calc(100% - 7px), 0 15px, 7px 10px, 4px 5px);
  --overlay-clip: polygon(16px 0, calc(100% - 5px) 0, calc(100% - 5px) 3px, 100% 6px, 100% calc(100% - 17px), calc(100% - 7px) calc(100% - 12px), calc(100% - 11px) calc(100% - 14px), calc(100% - 14px) 100%, 5px 100%, 0 calc(100% - 7px), 0 15px, 7px 10px, 4px 5px);
  --bg: #0A0708;
  --panel-bg: #140E0F;
  --overlay-bg: #0A0708;
  --header-bg: #150C0D;
  --font: Cambria, 'Palatino Linotype', Georgia, serif;
  --text: #DCD2C8;
  --text-dim: #A99D95;
  --accent-c: #B8863A;
  --accent-m: #E2594B;
  --accent-y: #B8863A;
  --accent-text: #DDB05A;
  --border: #33292A;
  --border-h: #B8863A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #B8863A;
  --title-anim: none;
  --tile-hover-bg: #1B1022;
  --tile-hover-border: #B8863A;
  --tile-hover-shadow: none;
  --tile-active-bg: #1B1022;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: contrast(1.05) saturate(0.9);
  --tile-icon-shape: polygon(0 22%, 9% 13%, 7% 7%, 16% 0, 100% 0, 100% 80%, 93% 89%, 96% 95%, 84% 100%, 0 100%);
  --tile-label-spacing: 0.8px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 700;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #25161F;
  --btn-active-bg: #321D2A;
  --drop-hint-border: #4A3A3A;
  --drop-icon-color: #7A6258;
  --hint-sub-color: #A99D95;
  --rename-dashed: #B8863A;
  --rename-input-bg: #1B1022;
  --edit-bar-bg: #2A0C0A;
  --edit-bar-border: #8E1B15;
  --edit-label-color: #F07C6C;
  --edit-label-glow: none;
  --btn-done-color: #F07C6C;
  --btn-done-border: #8E1B15;
  --btn-done-hover-bg: #451210;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A6258;
  --update-bg: #1C1210;
  --update-border: #8A6A34;
  --update-color: #DDB05A;
  --update-btn-border: #8A6A34;
  --update-btn-hover-bg: #2C1E18;
  --update-btn-hover-glow: none;
  --btn-close-color: #DDB05A;
  --btn-close-border: #8A6A34;
  --btn-close-hover-bg: #2C1E18;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1B1022;
  --picker-item-hover-bg: #1B1022;
  --picker-item-active-bg: #27162F;
  --picker-placeholder-bg: #1B1022;
  --skin-btn-active-bg: #27162F;
  --remove-btn-bg: #9A1C14;
  --remove-btn-border: #E2594B;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#DCD2C8` on `#0A0708` | 4.5:1 | **13.47:1** |
| `--text-dim` on `--bg` | `#A99D95` on `#0A0708` | 4.5:1 | **7.59:1** |
| `--accent-c` on `--bg` | `#B8863A` on `#0A0708` | 3:1 | **6.22:1** |
| `--accent-text` on `--bg` | `#DDB05A` on `#0A0708` | 3:1 | **9.97:1** |
| `--hint-sub-color` on `--bg` | `#A99D95` on `#0A0708` | 4.5:1 | **7.59:1** |
| `--btn-close-color` on `--panel-bg` | `#DDB05A` on `#140E0F` | 4.5:1 | **9.49:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#DCD2C8` on `#161011` | 4.5:1 | **12.63:1** |
| Tile label on tile hover | `#DCD2C8` on `#1B1022` | 4.5:1 | **12.32:1** |
| Tile label on tile pressed (pressed state) | `#DCD2C8` on `#1B1022` | 4.5:1 | **12.32:1** |
| Title on header | `#E3D8CE` on `#150C0D` | 4.5:1 | **13.74:1** |
| Title dot (`.accent`) on header | `#E2594B` on `#150C0D` | 4.5:1 | **5.29:1** |
| Header version on header | `#A99D95` on `#150C0D` | 4.5:1 | **7.29:1** |
| Header button glyph on header | `#DCD2C8` on `#150C0D` | 4.5:1 | **12.93:1** |
| Header button glyph on button hover | `#FFFFFF` on `#25161F` | 4.5:1 | **17.31:1** |
| Filter chip text on chip | `#DDB05A` on `#1B1022` | 4.5:1 | **9.12:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#1B1022` | 4.5:1 | **18.36:1** |
| Banner text on banner | `#E3D8CE` on `#240A0A` | 4.5:1 | **13.34:1** |
| Header line on header (non-text) | `#C0352A` on `#150C0D` | 3:1 | **3.47:1** |
| Edit label on edit bar | `#F07C6C` on `#2A0C0A` | 4.5:1 | **6.75:1** |
| Done / close button text on edit bar | `#F07C6C` on `#2A0C0A` | 4.5:1 | **6.75:1** |
| + FILE / + INSTALLED text on edit bar | `#DCD2C8` on `#2A0C0A` | 4.5:1 | **12.20:1** |
| Done button text on its hover fill | `#F07C6C` on `#451210` | 4.5:1 | **5.79:1** |
| Settings text on overlay | `#DCD2C8` on `#0A0708` | 4.5:1 | **13.47:1** |
| Settings text on panel | `#DCD2C8` on `#140E0F` | 4.5:1 | **12.82:1** |
| Settings label (text-dim) on panel | `#A99D95` on `#140E0F` | 4.5:1 | **7.23:1** |
| Settings value / cheat key (accent-text) on panel | `#DDB05A` on `#140E0F` | 4.5:1 | **9.49:1** |
| Settings version value (accent-text) on panel | `#DDB05A` on `#140E0F` | 4.5:1 | **9.49:1** |
| Settings CLOSE text on panel | `#DDB05A` on `#140E0F` | 4.5:1 | **9.49:1** |
| Settings CLOSE text on its hover fill | `#DDB05A` on `#2C1E18` | 4.5:1 | **7.99:1** |
| Hotkey error text (accent-m) on panel | `#E2594B` on `#140E0F` | 4.5:1 | **5.24:1** |
| Hotkey input text on input fill | `#DDB05A` on `#1B1022` | 4.5:1 | **9.12:1** |
| Picker row text on hover fill | `#DDB05A` on `#1B1022` | 4.5:1 | **9.12:1** |
| Update banner text on update bar | `#DDB05A` on `#1C1210` | 4.5:1 | **9.12:1** |
| Update button text on hover fill | `#FFFFFF` on `#2C1E18` | 4.5:1 | **16.08:1** |
| Drop-hint text (text-dim) on grid ground | `#A99D95` on `#0A0708` | 4.5:1 | **7.59:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#9A1C14` | 3:1 | **8.23:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#9A1C14` | 3:1 | **8.23:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#B8863A` on `#161011` | 3:1 | **5.83:1** |
| Focus ring on grid ground (non-text) | `#B8863A` on `#0A0708` | 3:1 | **6.22:1** |
| Hover border on grid ground (non-text) | `#B8863A` on `#0A0708` | 3:1 | **6.22:1** |
| Hover border on hover fill (non-text) | `#B8863A` on `#1B1022` | 3:1 | **5.69:1** |
| Theme-picker selected row text (accent-text) on active fill | `#DDB05A` on `#27162F` | 4.5:1 | **8.40:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#DDB05A` on `#1B1022` | 4.5:1 | **9.12:1** |
| Skin search input text (accent-text) on panel | `#DDB05A` on `#140E0F` | 4.5:1 | **9.49:1** |
| Apps-picker search input text (accent-text) on search fill | `#DDB05A` on `#1B1022` | 4.5:1 | **9.12:1** |
| Rename input text (accent-text) on input fill | `#DDB05A` on `#1B1022` | 4.5:1 | **9.12:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#A99D95` on `#1B1022` | 4.5:1 | **6.94:1** |
| Skin search placeholder (text-dim, themed) on panel | `#A99D95` on `#140E0F` | 4.5:1 | **7.23:1** |
| Apps-picker placeholder (text-dim) on search fill | `#A99D95` on `#1B1022` | 4.5:1 | **6.94:1** |
| Hotkey recording text (accent-m) on input fill | `#E2594B` on `#1B1022` | 4.5:1 | **5.04:1** |
| Update dismiss glyph (text-dim) on update bar | `#A99D95` on `#1C1210` | 4.5:1 | **6.95:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#A99D95` on `#140E0F` | 3:1 | **7.23:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#B8863A` on `#140E0F` | 3:1 | **5.92:1** |

**Lowest ratio in this theme: 5.04:1 (Hotkey recording text (accent-m) on input fill).** Lowest text ratio: 5.04:1 (Hotkey recording text (accent-m) on input fill). Lowest non-text ratio: 3.47:1 (Header line on header (non-text)). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (`contrast(1.05) saturate(0.9)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#161011` | Hover `#1B1022` | Pressed `#1B1022` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5C7EA3` | 4.45:1 | 4.34:1 | 4.34:1 | pass |
| Calculator `#6b6f76` | `#6A6E75` | 3.67:1 | 3.58:1 | 3.58:1 | pass |
| Paint `#b07a4f` | `#AE7B52` | 5.16:1 | 5.03:1 | 5.03:1 | pass |
| Terminal `#3d4450` | `#3A414C` | 1.83:1 | 1.78:1 | 1.78:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#51898A` | 4.74:1 | 4.63:1 | 4.63:1 | pass |
| Files `#c09a3e` | `#BF9B45` | 7.16:1 | 6.99:1 | 6.99:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.58:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Brass `#B8863A` is `--accent-c` (6.22:1 on the ground; the audit asked for "reach 3:1"). The header line is a brighter red `#C0352A` (3.47:1 on the header) because the audit's `#8E1B15` is 2.13:1 and a line that carries meaning needs 3:1; `#8E1B15` stays in the art (the glow strips under the teeth, the banner border, the edit-bar rule). Warp purple is the hover fill `#1B1022`, kept dark enough for the Calculator plate to stay at 3:1. The text is warm ash `#DCD2C8`, not red.

### 1.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | Cambria, 'Palatino Linotype', Georgia, serif |
| `#title` | Pirata One 400, 13 px, tracking 3 px, uppercase from the markup |
| `.tile-label` | Cambria 700, 12 px, 0.8 px, uppercase |
| `#theme-banner-text` | Cambria 700, 11 px, 0.6 px, uppercase |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 108.14** (gate 156; 47.9 px under, 59.9 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 58.2, CALCULATOR 82.5, PAINT 37.9, TERMINAL 66.2, BROWSER 62.0, FILES 35.0 px, no ellipsis. Tile height 95.39 px (94.7 to 95.4 required). Banner lines: see 0.8. **Platform fonts the mock used:** title Pirata One (web) x12; labels Cambria x7; banner Cambria x28; version and settings Cambria x7. Expected `fontsRendered` for the web faces: Pirata One.

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Cambria covers it (checked).

### 1.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { border-bottom-color: #C0352A; box-shadow: inset 0 -2px 0 #C0352A; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #8E1B15; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a cracked iron bar (x 168 to 252, y 10 to 30) with three spiked brass studs on it and two hot-red cracks between them. Painted pixels at x 168.0 to 252.0, y 15.3 to 28.9. Hidden while the chip shows. The title ends at x 108.1, the scene starts at x 168: 59.9 px clear.

**B. Frame (the kit of 0.3).** a corrupted-red line (3 px) under the header, then **iron teeth hanging down** in the top course (three teeth per 24 px, 3.5 to 6.5 px long, under a 2.3 px iron bar and a red glow strip); down both sides a strip of iron with a brass stud and a crack every 20 px and small barbs; each corner is an iron cap with a crack and a brass dot. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner is blood-dark `#240A0A` with a 1 px red top border; its top course is **iron teeth rising** (three per 24 px) over a red strip; the icon is a spiked collar (a brass ring, seven uneven steel spikes, a red eye); the right end is a cracked iron plate carrying three curved spikes with brass bands. The motif's painted pixels are at x 329.6 to 412.0, y 266.4 to 300.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 98.4 px (0.8). The banner row of the probe reads 3 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: two broken corners: top-left cut from (16, 0) to (0, 15) with a notch, bottom-right broken in three steps (largest cut 17 px). `--overlay-clip` is the same polygon. Tiles: plates keep a straight body and have **two broken corners** (top-left and bottom-right, cuts of 22 and 20 percent with a notch each), which shows past the plate's own rounding. Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 12.13, Calculator 10.13, Paint 11.13, Terminal 8.25, Browser 11.63, Files 10.82 (smallest 8.25); nothing is cropped.

**Trademark note.** The Star of Chaos (eight arrows from a hub), the god sigils and every rune are not drawn. The collar has seven uneven spikes round a ring (not eight arrows), the studs and teeth are generic spiked-armour parts, the horns are plain curved spikes.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #9A1C14; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { border-bottom-color: #C0352A; box-shadow: inset 0 -2px 0 #C0352A; }
#header::before { background: #8E1B15; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Pirata One', Georgia, 'Times New Roman', serif; font-weight: 400; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 13px; letter-spacing: 3px; color: #E3D8CE; text-shadow: none; }
#title .accent { color: #E2594B; }

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

/* tiles */
.app-tile { background: #161011; border-color: #2E2425; border-radius: 0px; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: Cambria, 'Palatino Linotype', Georgia, serif;  }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 24px 7px repeat-x, #240A0A;
  border-top-color: #8E1B15;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Cambria, 'Palatino Linotype', Georgia, serif; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #E3D8CE; margin-right: 90px; }
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

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#g)` in the Tyranid SVGs):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<path d='M0 8.6 L11 7.6 L27 8.4 L45 7.4 L63 8.3 L84 7.8 V15.4 L66 16.2 L48 15.2 L30 16 L12 15.3 L0 16 Z' fill='rgb(98,82,82)' stroke='rgb(158,136,128)' stroke-width='0.6' stroke-linejoin='round'/>
<path d='M24.6 7.8 L27.4 11 L25.4 12.4 L29.4 15.8 M56.4 7.7 L58.6 10.8 L56.8 12.2 L60.6 15.6' fill='none' stroke='rgb(222,76,48)' stroke-width='0.9' stroke-linejoin='round'/>
<polygon points='16.9,13.5 21.2,12 16.9,10.5' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='15,15.1 17.7,15.6 17.1,12.9' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='12.6,15 14.2,18.6 15.6,14.8' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='10.9,13.1 10.6,15.7 13.1,15.1' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='11.1,10.5 7,12 11.1,13.5' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='13,8.9 10.1,8.2 10.9,11.1' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='15.4,9 13.8,5.6 12.4,9.2' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='17.1,10.9 17.5,8.2 14.9,8.9' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><circle cx='14' cy='12' r='3.2' fill='rgb(184,134,58)' stroke='rgb(110,78,34)' stroke-width='0.8'/><circle cx='13.1' cy='11.1' r='1' fill='rgb(226,178,96)'/><polygon points='44.9,13.5 49.2,12 44.9,10.5' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='43,15.1 45.7,15.6 45.1,12.9' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='40.6,15 42.2,18.6 43.6,14.8' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='38.9,13.1 38.6,15.7 41.1,15.1' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='39.1,10.5 35,12 39.1,13.5' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='41,8.9 38.1,8.2 38.9,11.1' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='43.4,9 41.8,5.6 40.4,9.2' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='45.1,10.9 45.5,8.2 42.9,8.9' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><circle cx='42' cy='12' r='3.2' fill='rgb(184,134,58)' stroke='rgb(110,78,34)' stroke-width='0.8'/><circle cx='41.1' cy='11.1' r='1' fill='rgb(226,178,96)'/><polygon points='72.9,13.5 77.2,12 72.9,10.5' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='71,15.1 73.7,15.6 73.1,12.9' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='68.6,15 70.2,18.6 71.6,14.8' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='66.9,13.1 66.6,15.7 69.1,15.1' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='67.1,10.5 63,12 67.1,13.5' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='69,8.9 66.1,8.2 66.9,11.1' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='71.4,9 69.8,5.6 68.4,9.2' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='73.1,10.9 73.5,8.2 70.9,8.9' fill='rgb(158,136,128)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><circle cx='70' cy='12' r='3.2' fill='rgb(184,134,58)' stroke='rgb(110,78,34)' stroke-width='0.8'/><circle cx='69.1' cy='11.1' r='1' fill='rgb(226,178,96)'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 9'>
<rect width='24' height='1.4' fill='rgb(98,82,82)'/><rect y='1.4' width='24' height='0.9' fill='rgb(142,27,21)'/>
<polygon points='0,2.3 8,2.3 4.6,7.2' fill='rgb(98,82,82)'/><polygon points='8,2.3 16,2.3 11.4,8.8' fill='rgb(98,82,82)'/><polygon points='16,2.3 24,2.3 20.2,5.8' fill='rgb(98,82,82)'/>
<path d='M8 2.3 L4.6 7.2 M16 2.3 L11.4 8.8 M24 2.3 L20.2 5.8' stroke='rgb(110,78,34)' stroke-width='0.7' fill='none'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 20'>
<rect width='8' height='20' fill='rgb(46,36,36)'/><rect x='0' width='1' height='20' fill='rgb(158,136,128)'/><rect x='7' width='1' height='20' fill='rgb(158,136,128)'/>
<polygon points='1,3.4 3,4.4 1,5.6' fill='rgb(158,136,128)'/><polygon points='7,14.4 5,15.4 7,16.6' fill='rgb(158,136,128)'/>
<path d='M4 12.6 L3 14.6 L5 16 L3.6 19.4' fill='none' stroke='rgb(222,76,48)' stroke-width='0.8' stroke-linejoin='round'/>
<circle cx='4' cy='8' r='2.2' fill='rgb(184,134,58)' stroke='rgb(110,78,34)' stroke-width='0.7'/><circle cx='3.4' cy='7.4' r='0.7' fill='rgb(226,178,96)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect width='8' height='8' fill='rgb(98,82,82)'/><rect x='0.5' y='0.5' width='7' height='7' fill='none' stroke='rgb(158,136,128)' stroke-width='0.8'/>
<path d='M0.6 0.6 L4.6 2.8 L3.2 4.2 L7.4 7.4' fill='none' stroke='rgb(222,76,48)' stroke-width='0.9' stroke-linejoin='round'/><circle cx='5.6' cy='2' r='1' fill='rgb(184,134,58)'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 7'>
<rect y='5.6' width='24' height='1.4' fill='rgb(142,27,21)'/>
<polygon points='0,5.6 8,5.6 4.4,1.2' fill='rgb(98,82,82)'/><polygon points='8,5.6 16,5.6 12.2,0.2' fill='rgb(98,82,82)'/><polygon points='16,5.6 24,5.6 19.6,3.2' fill='rgb(98,82,82)'/>
<path d='M0 5.6 L4.4 1.2 M8 5.6 L12.2 0.2 M16 5.6 L19.6 3.2' stroke='rgb(110,78,34)' stroke-width='0.7' fill='none'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<path d='M2 34 L6 28.4 L20 29.8 L34 27.8 L50 29.2 L66 27.6 L82 29.2 L84 34 Z' fill='rgb(98,82,82)' stroke='rgb(158,136,128)' stroke-width='0.6' stroke-linejoin='round'/>
<path d='M19 29.4 C19.4 20.4 24 12.6 32 6.2 C29.4 14.6 30 22.6 31.6 29.4 Z' fill='rgb(98,82,82)' stroke='rgb(158,136,128)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M39 28.4 C39.2 16.6 46 6 58 0.8 C53 9.4 53 20 54.4 28.4 Z' fill='rgb(98,82,82)' stroke='rgb(158,136,128)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M65 27.8 C66 20.6 71.6 14.4 80 11 C77 17.4 77 23.4 78.4 27.8 Z' fill='rgb(98,82,82)' stroke='rgb(158,136,128)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M19.4 25 L31.2 25 L31.4 26.8 L19.2 26.8 Z M39.2 24 L54 24 L54.2 26 L39.1 26 Z M65.6 24 L78 24 L78.1 25.8 L65.5 25.8 Z' fill='rgb(184,134,58)'/>
<path d='M44 28 L46.2 31 L44.4 32.2 L46.6 34' fill='none' stroke='rgb(222,76,48)' stroke-width='1' stroke-linejoin='round'/><path d='M12 29.8 L13.6 32 L12.4 33 L13.8 34' fill='none' stroke='rgb(222,76,48)' stroke-width='0.9'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<polygon points='16.6,13.7 21.4,12.8 17.2,10.4' fill='rgb(176,160,150)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='12.3,17.1 15.2,18.9 15.3,15.5' fill='rgb(176,160,150)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='6.7,15.5 5.9,20.5 9.7,17.1' fill='rgb(176,160,150)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='4.8,10.4 1.7,12.6 5.4,13.7' fill='rgb(176,160,150)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='7.1,6.2 2.5,5 5.1,9' fill='rgb(176,160,150)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='11.8,4.8 9.8,2.3 8.5,5.3' fill='rgb(176,160,150)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><polygon points='16.3,7.7 18.1,3.1 13.8,5.4' fill='rgb(176,160,150)' stroke='rgb(46,36,36)' stroke-width='0.5' stroke-linejoin='round'/><circle cx='11' cy='11' r='5.2' fill='rgb(46,36,36)' stroke='rgb(184,134,58)' stroke-width='2.4'/><circle cx='11' cy='11' r='1.4' fill='rgb(222,76,48)'/>
</svg>
```

### 1.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | `chaos-title` (2) | removed |
| 2 | `banner-throb` (1) | removed |
| 3 | `chaos-star` (1) | removed |
| 4 | `chaos-readout` (2) | removed |
| 5 | `chaos-border` (5) | removed |
| 6 | `chaos-debris` `#particles` (4) | removed |
| hover | `tile-flicker .6s steps(1) infinite` (opacity, 1) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite warhammer-chaos.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 1.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#161011`, border `#2E2425` (1 px), radius 0px, `::before` off; layout unchanged. Icons: `contrast(1.05) saturate(0.9)` through the cut plate (D in 3).
- **Hover:** fill `#1B1022`, border `#B8863A` (5.69:1 on the hover fill), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (5.83:1 on the tile, 6.22:1 on the grid ground). **Pressed:** base scale 0.96 on `#1B1022`.
- **Label:** `#DCD2C8`, Cambria 700, 12 px, 0.8 px, uppercase, no halo.
- **Filter chip:** base rule (fill `#1B1022`, `--accent-c` border, `#DDB05A` text). The header scene hides while it shows.
- **Edit bar:** `#2A0C0A` fill, `#8E1B15` rule, label `#F07C6C`; `+ FILE` and `+ INSTALLED` in `--text` with a `#7A6258` border, `DONE` in `#F07C6C` with a `#8E1B15` border. The tile remove button is `#9A1C14` with a `#E2594B` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#0A0708`, panel `#140E0F`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#DDB05A` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#DDB05A` text on `#1C1210` with a `#8A6A34` rule.

### 1.6 Done when

1. `npm run check:contrast` passes with no rebaseline (the theme leaves the legacy list); `grep -c infinite warhammer-chaos.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#C0352A`) at y 37 to 40 with nothing below; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **108.14**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: #240A0A with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 5 strings; mock all fit at 424 and 640), the text box ending at x 320.
5. Hover shot (CALCULATOR): `#B8863A` border, `#1B1022` fill, the cut plate with no cropped glyph, no ellipsis on CALCULATOR (mock 82.5 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): no green, blue, pink or purple pixel in the chrome of the grid or settings shot; warp purple only in the hover and pressed tile fills and the picker rows; red only in the header line, the cracks, the glow strips, the banner border, edit mode and the tile remove button; brass for studs, hover, focus and values.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 8 px, banner 3 px; at 640 x 420 10 / 8 / 11 px; at 1024 x 700 10 / 8 / 11 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Pirata One` and `Cambria`; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures.

**Expected squint score: 4** (title and banner text covered). What survives: a black window with a red line, iron teeth hanging from the header and rising from the banner, brass studs down both sides, hot cracks, broken corners, three curved spikes on a cracked plate, a blood-dark banner. What is missing for a 5: the Star of Chaos and the god sigils (marks, not drawn) and any rune lettering; Pirata One is the only blackletter-like voice.

Watch items for this theme: (1) The banner motif is the one piece the broken bottom-right window corner can touch: at 424 x 300 the clip crops the last few pixels of the plate's lower right end. It reads as broken plate; if Sergei dislikes it, move the motif to `right 18px` (and the text margin to `margin-right: 96px`).

---

## 2. warhammer-orks (WARHAMMER 40K: ORKS): DONE

**Audit:** score 2, redraw. Clean, symmetric layout in green caps where Orks are crooked, battered and painted, and the brown-black rust was replaced by green-black. A painted shoota lay across the middle touching the NOTEPAD, CALCULATOR and PAINT labels, a DAKKA LEVEL gauge sat beside NOTEPAD, and gag copy filled the readout, header and banner. Six infinite animations and a hover flicker.
**Direction:** **scrap and paint**. A brown-black ground, bolted scrap-grey plates with rust, a yellow-and-black chequer band under the header (two cells chipped to rust, two scratches), red speed-stripes along the banner top, bolted strips down both sides, plates and labels that sit a degree or two off true. Orc green is the focus ring, slider and checkbox only; yellow is the paint (title, hover border, values); red is edit mode, the stripes and one plate stripe. The header carries a riveted scrap plate with a jagged grin; the banner icon is a crude cleaver (a choppa); the banner's right end is a battered plate with a chequer patch, a red stripe, rust and three bullet holes. The window is cut at uneven corners. Not clean, not symmetric, not comic: no skull glyph, no gag copy, no gauge. Static.

### 2.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: polygon(0 9px, 9px 0, calc(100% - 16px) 0, 100% 12px, 100% calc(100% - 18px), calc(100% - 11px) 100%, 6px 100%, 0 calc(100% - 7px));
  --overlay-clip: polygon(0 9px, 9px 0, calc(100% - 16px) 0, 100% 12px, 100% calc(100% - 18px), calc(100% - 11px) 100%, 6px 100%, 0 calc(100% - 7px));
  --bg: #1B1710;
  --panel-bg: #241E14;
  --overlay-bg: #1B1710;
  --header-bg: #211B11;
  --font: 'Segoe UI Semibold', 'Segoe UI', Arial, sans-serif;
  --text: #E8DCA0;
  --text-dim: #B8AC7C;
  --accent-c: #4C8A2B;
  --accent-m: #EE6A52;
  --accent-y: #D4A012;
  --accent-text: #E8BA2A;
  --border: #4A3F2A;
  --border-h: #D4A012;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #4C8A2B;
  --title-anim: none;
  --tile-hover-bg: #2B2316;
  --tile-hover-border: #D4A012;
  --tile-hover-shadow: none;
  --tile-active-bg: #2B2316;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: sepia(0.2) saturate(1.1) contrast(1.05);
  --tile-icon-shape: polygon(0 4%, 100% 0, 99% 100%, 2% 97%);
  --tile-label-spacing: 0px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #3A2F1B;
  --btn-active-bg: #4A3C22;
  --drop-hint-border: #5A4C30;
  --drop-icon-color: #8A7848;
  --hint-sub-color: #B8AC7C;
  --rename-dashed: #D4A012;
  --rename-input-bg: #2B2316;
  --edit-bar-bg: #3A1410;
  --edit-bar-border: #B01E1E;
  --edit-label-color: #F28E78;
  --edit-label-glow: none;
  --btn-done-color: #F28E78;
  --btn-done-border: #B01E1E;
  --btn-done-hover-bg: #52191A;
  --btn-done-hover-glow: none;
  --btn-add-border: #8A7848;
  --update-bg: #2A2212;
  --update-border: #D4A012;
  --update-color: #E8BA2A;
  --update-btn-border: #D4A012;
  --update-btn-hover-bg: #3E3018;
  --update-btn-hover-glow: none;
  --btn-close-color: #E8BA2A;
  --btn-close-border: #8A7848;
  --btn-close-hover-bg: #3E3018;
  --btn-close-hover-glow: none;
  --picker-search-bg: #2B2316;
  --picker-item-hover-bg: #2B2316;
  --picker-item-active-bg: #3A2F1B;
  --picker-placeholder-bg: #2B2316;
  --skin-btn-active-bg: #3A2F1B;
  --remove-btn-bg: #A01E1E;
  --remove-btn-border: #F28E78;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#E8DCA0` on `#1B1710` | 4.5:1 | **12.90:1** |
| `--text-dim` on `--bg` | `#B8AC7C` on `#1B1710` | 4.5:1 | **7.84:1** |
| `--accent-c` on `--bg` | `#4C8A2B` on `#1B1710` | 3:1 | **4.23:1** |
| `--accent-text` on `--bg` | `#E8BA2A` on `#1B1710` | 3:1 | **9.76:1** |
| `--hint-sub-color` on `--bg` | `#B8AC7C` on `#1B1710` | 4.5:1 | **7.84:1** |
| `--btn-close-color` on `--panel-bg` | `#E8BA2A` on `#241E14` | 4.5:1 | **9.04:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E8DCA0` on `#241E14` | 4.5:1 | **11.94:1** |
| Tile label on tile hover | `#E8DCA0` on `#2B2316` | 4.5:1 | **11.20:1** |
| Tile label on tile pressed (pressed state) | `#E8DCA0` on `#2B2316` | 4.5:1 | **11.20:1** |
| Title on header | `#E8BA2A` on `#211B11` | 4.5:1 | **9.34:1** |
| Title dot (`.accent`) on header | `#EE6A52` on `#211B11` | 4.5:1 | **5.55:1** |
| Header version on header | `#B8AC7C` on `#211B11` | 4.5:1 | **7.51:1** |
| Header button glyph on header | `#E8DCA0` on `#211B11` | 4.5:1 | **12.34:1** |
| Header button glyph on button hover | `#FFFFFF` on `#3A2F1B` | 4.5:1 | **13.11:1** |
| Filter chip text on chip | `#E8BA2A` on `#2B2316` | 4.5:1 | **8.48:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#2B2316` | 4.5:1 | **15.50:1** |
| Banner text on banner | `#E8DCA0` on `#211B11` | 4.5:1 | **12.34:1** |
| Header line on header (non-text) | `#8A8E92` on `#211B11` | 3:1 | **5.18:1** |
| Edit label on edit bar | `#F28E78` on `#3A1410` | 4.5:1 | **6.93:1** |
| Done / close button text on edit bar | `#F28E78` on `#3A1410` | 4.5:1 | **6.93:1** |
| + FILE / + INSTALLED text on edit bar | `#E8DCA0` on `#3A1410` | 4.5:1 | **11.79:1** |
| Done button text on its hover fill | `#F28E78` on `#52191A` | 4.5:1 | **5.89:1** |
| Settings text on overlay | `#E8DCA0` on `#1B1710` | 4.5:1 | **12.90:1** |
| Settings text on panel | `#E8DCA0` on `#241E14` | 4.5:1 | **11.94:1** |
| Settings label (text-dim) on panel | `#B8AC7C` on `#241E14` | 4.5:1 | **7.26:1** |
| Settings value / cheat key (accent-text) on panel | `#E8BA2A` on `#241E14` | 4.5:1 | **9.04:1** |
| Settings version value (accent-text) on panel | `#E8BA2A` on `#241E14` | 4.5:1 | **9.04:1** |
| Settings CLOSE text on panel | `#E8BA2A` on `#241E14` | 4.5:1 | **9.04:1** |
| Settings CLOSE text on its hover fill | `#E8BA2A` on `#3E3018` | 4.5:1 | **7.00:1** |
| Hotkey error text (accent-m) on panel | `#EE6A52` on `#241E14` | 4.5:1 | **5.37:1** |
| Hotkey input text on input fill | `#E8BA2A` on `#2B2316` | 4.5:1 | **8.48:1** |
| Picker row text on hover fill | `#E8BA2A` on `#2B2316` | 4.5:1 | **8.48:1** |
| Update banner text on update bar | `#E8BA2A` on `#2A2212` | 4.5:1 | **8.60:1** |
| Update button text on hover fill | `#FFFFFF` on `#3E3018` | 4.5:1 | **12.80:1** |
| Drop-hint text (text-dim) on grid ground | `#B8AC7C` on `#1B1710` | 4.5:1 | **7.84:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#A01E1E` | 3:1 | **7.78:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#A01E1E` | 3:1 | **7.78:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#4C8A2B` on `#241E14` | 3:1 | **3.92:1** |
| Focus ring on grid ground (non-text) | `#4C8A2B` on `#1B1710` | 3:1 | **4.23:1** |
| Hover border on grid ground (non-text) | `#D4A012` on `#1B1710` | 3:1 | **7.51:1** |
| Hover border on hover fill (non-text) | `#D4A012` on `#2B2316` | 3:1 | **6.52:1** |
| Theme-picker selected row text (accent-text) on active fill | `#E8BA2A` on `#3A2F1B` | 4.5:1 | **7.17:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#E8BA2A` on `#2B2316` | 4.5:1 | **8.48:1** |
| Skin search input text (accent-text) on panel | `#E8BA2A` on `#241E14` | 4.5:1 | **9.04:1** |
| Apps-picker search input text (accent-text) on search fill | `#E8BA2A` on `#2B2316` | 4.5:1 | **8.48:1** |
| Rename input text (accent-text) on input fill | `#E8BA2A` on `#2B2316` | 4.5:1 | **8.48:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#B8AC7C` on `#2B2316` | 4.5:1 | **6.81:1** |
| Skin search placeholder (text-dim, themed) on panel | `#B8AC7C` on `#241E14` | 4.5:1 | **7.26:1** |
| Apps-picker placeholder (text-dim) on search fill | `#B8AC7C` on `#2B2316` | 4.5:1 | **6.81:1** |
| Hotkey recording text (accent-m) on input fill | `#EE6A52` on `#2B2316` | 4.5:1 | **5.03:1** |
| Update dismiss glyph (text-dim) on update bar | `#B8AC7C` on `#2A2212` | 4.5:1 | **6.91:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#B8AC7C` on `#241E14` | 3:1 | **7.26:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#4C8A2B` on `#241E14` | 3:1 | **3.92:1** |

**Lowest ratio in this theme: 5.03:1 (Hotkey recording text (accent-m) on input fill).** Lowest text ratio: 5.03:1 (Hotkey recording text (accent-m) on input fill). Lowest non-text ratio: 3.92:1 (Focus ring (accent-c) on tile rest (non-text)). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (`sepia(0.2) saturate(1.1) contrast(1.05)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#241E14` | Hover `#2B2316` | Pressed `#2B2316` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6684A0` | 4.23:1 | 3.97:1 | 3.97:1 | pass |
| Calculator `#6b6f76` | `#737373` | 3.48:1 | 3.27:1 | 3.27:1 | pass |
| Paint `#b07a4f` | `#B78151` | 4.94:1 | 4.63:1 | 4.63:1 | pass |
| Terminal `#3d4450` | `#40444B` | 1.69:1 | 1.58:1 | 1.58:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#5B8D87` | 4.41:1 | 4.14:1 | 4.14:1 | pass |
| Files `#c09a3e` | `#CAA143` | 6.84:1 | 6.41:1 | 6.41:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.27:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Green `#4C8A2B` is `--accent-c` (4.23:1 on the ground, 3.92:1 on a tile; the audit's value). Yellow `#D4A012` is the hover border and the update bar rule, `#E8BA2A` the text-role yellow (title, values). The header line is scrap grey `#8A8E92` (5.18:1 on the header) because a rust line `#6B4A24` is 2.14:1. The edit-bar red `#B01E1E` is a fill, the text variants are `#F28E78` and `#EE6A52`.

### 2.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | 'Segoe UI Semibold', 'Segoe UI', Arial, sans-serif |
| `#title` | Impact 400, 13 px, tracking 2 px |
| `.tile-label` | Ink Free 400, 13 px (fixed 14.4 px line height), 0 tracking, user case |
| `#theme-banner-text` | Impact 400, 12 px, 0.6 px, uppercase |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 111.27** (gate 156; 44.7 px under, 56.7 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 47.0, CALCULATOR 54.9, PAINT 29.5, TERMINAL 48.8, BROWSER 46.6, FILES 25.1 px, no ellipsis. Tile height 95.41 px (94.7 to 95.4 required; 0.01 px over is the sub-pixel rounding of a 14.4 px line box, accepted). Banner lines: see 0.8. **Platform fonts the mock used:** title Impact x12; labels Ink Free x7; banner Impact x28; version and settings Segoe UI Semibold x7. Expected `fontsRendered` for the web faces: none (stock only).

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Ink Free covers it (checked: the platform font for "Калькулятор" and "Жёсткий диск" is Ink Free); Impact and Segoe UI cover it for the title, banner and body.

### 2.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { border-bottom-color: #8A8E92; box-shadow: inset 0 -2px 0 #8A8E92; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #D4A012; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a crooked riveted scrap plate (x 168 to 252, y 10 to 30) with four bolts, rust patches and a jagged grin of bone teeth in a dark slit. Painted pixels at x 169.5 to 251.5, y 11.0 to 29.5. Hidden while the chip shows. The title ends at x 111.3, the scene starts at x 168: 56.7 px clear.

**B. Frame (the kit of 0.3).** a scrap-grey line (3 px) under the header, then a **chequer band** (4 px cells, yellow and black, two cells chipped to rust, two scratches) in the top course; down both sides **bolted scrap plates** (two greys, a yellow weld seam between them, a rust patch, a bolt each) in a 28 px repeat; each corner is a bolted plate. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 11 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner keeps the header's ground `#211B11` with a 1 px scrap-grey top border; its top course is **red speed-stripes** (slanted, two per 16 px); the icon is a rusty-handled cleaver; the right end is a crooked plate with a chequer patch, a red stripe, two rust patches, three bullet holes and four bolts. The motif's painted pixels are at x 330.5 to 410.5, y 270.1 to 299.9 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 86.3 px (0.8). The banner row of the probe reads 3 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: uneven cuts: 9 px top-left, 16 x 12 top-right, 11 x 18 bottom-right, 6 x 7 bottom-left. `--overlay-clip` is the same polygon. Tiles: plates are a **crooked quad** (`polygon(0 4%, 100% 0, 99% 100%, 2% 97%)`), and every third plate is rotated by -2, 1.5 and -0.8 degrees in turn; labels rotate by -0.7 and 0.6 degrees on odd and even tiles. All static, `transform` only, no layout change. Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 10.32, Calculator 8.32, Paint 10.09, Terminal 9.15, Browser 10.22, Files 10.15 (smallest 8.32); nothing is cropped.

**Trademark note.** The Ork glyph (a horned, jawed skull) and the klan glyphs are not drawn. A jagged grin on a plate, a cleaver, chequer paint and red stripes are generic; no character, no weapon from the codex (no shoota, no gauge).

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A01E1E; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { border-bottom-color: #8A8E92; box-shadow: inset 0 -2px 0 #8A8E92; }
#header::before { background: #D4A012; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Impact, 'Arial Black', 'Segoe UI', sans-serif; font-weight: 400; font-style: normal; line-height: 1.2; font-size: 13px; letter-spacing: 2px; color: #E8BA2A; text-shadow: none; }
#title .accent { color: #EE6A52; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNER@ left 1px top 0 / 8px 8px no-repeat,
    @CORNER@ right 5px top 0 / 8px 8px no-repeat,
    @CORNER@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNER@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 28px repeat-y,
    @SIDE@ right 5px top 0 / 8px 28px repeat-y,
    @TOP@ left 0 top 0 / 40px 9px repeat-x;
}

/* tiles */
.app-tile { background: #241E14; border-color: #4A3F2A; border-radius: 2px; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Ink Free', 'Segoe Print', 'Segoe UI', sans-serif; font-synthesis: none; font-size: 13px; line-height: 14.4px; }
/* no drop shadow under the plates: the crooked clip would show its box on the lighter tile ground */
.tile-icon, .app-tile:hover .tile-icon { filter: sepia(0.2) saturate(1.1) contrast(1.05); }
/* crooked: every third plate and label sits a degree or two off true */
.app-tile:nth-child(3n+1) .tile-icon-wrap { transform: rotate(-2deg); }
.app-tile:nth-child(3n+2) .tile-icon-wrap { transform: rotate(1.5deg); }
.app-tile:nth-child(3n) .tile-icon-wrap { transform: rotate(-0.8deg); }
.app-tile:nth-child(odd) .tile-label { transform: rotate(-0.7deg); }
.app-tile:nth-child(even) .tile-label { transform: rotate(0.6deg); }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 16px 7px repeat-x, #211B11;
  border-top-color: #7A7E82;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Impact, 'Arial Black', 'Segoe UI', sans-serif; font-size: 12px; font-weight: 400; letter-spacing: 0.6px; text-transform: uppercase; color: #E8DCA0; margin-right: 90px; }
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

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#g)` in the Tyranid SVGs):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<path d='M2 3.2 L80.5 1.4 L83 17.6 L4.5 19 Z' fill='rgb(122,126,130)' stroke='rgb(70,72,74)' stroke-width='0.8' stroke-linejoin='round'/>
<path d='M30 2.2 L38 2 L35 6.4 L32.6 4.4 Z M62 2.4 L70 2.2 L68.4 5 L65 4.4 Z M5 15 L11 14.6 L10 18.6 L5.6 18.2 Z' fill='rgb(107,74,36)'/>
<path d='M9 8.4 L76 7.6 L77.4 13.6 L10.6 14.4 Z' fill='rgb(20,16,10)'/>
<path d='M14 8.3 L18.5 8.1 L16 12.2 Z M24 8.1 L28 8 L26.4 11.4 Z M36 8 L41.6 7.9 L38.6 12.6 Z M50 7.9 L54 7.8 L52.4 11.2 Z M63 7.8 L68 7.7 L65.4 12.4 Z' fill='rgb(232,220,160)'/>
<path d='M20 14.2 L24.4 14.1 L22.4 10 Z M44 14 L49 13.9 L46.4 10.4 Z M58 13.9 L62 13.8 L60 10 Z' fill='rgb(232,220,160)'/>
<circle cx='6' cy='5.4' r='1.6' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M5.04 5.4 H6.96' stroke='rgb(20,16,10)' stroke-width='0.5'/><circle cx='78' cy='3.8' r='1.6' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M77.04 3.8 H78.96' stroke='rgb(20,16,10)' stroke-width='0.5'/><circle cx='79.6' cy='15.6' r='1.6' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M78.64 15.6 H80.55999999999999' stroke='rgb(20,16,10)' stroke-width='0.5'/><circle cx='8' cy='16.8' r='1.6' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M7.04 16.8 H8.96' stroke='rgb(20,16,10)' stroke-width='0.5'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 9'>
<rect width='40' height='9' fill='rgb(20,16,10)'/><rect x='0' y='0' width='4' height='4' fill='rgb(212,160,18)'/><rect x='4' y='4' width='4' height='4' fill='rgb(212,160,18)'/><rect x='8' y='0' width='4' height='4' fill='rgb(212,160,18)'/><rect x='12' y='0' width='4' height='4' fill='rgb(156,100,44)'/><rect x='12' y='4' width='4' height='4' fill='rgb(212,160,18)'/><rect x='16' y='0' width='4' height='4' fill='rgb(212,160,18)'/><rect x='20' y='4' width='4' height='4' fill='rgb(212,160,18)'/><rect x='24' y='0' width='4' height='4' fill='rgb(212,160,18)'/><rect x='28' y='4' width='4' height='4' fill='rgb(212,160,18)'/><rect x='32' y='0' width='4' height='4' fill='rgb(156,100,44)'/><rect x='36' y='4' width='4' height='4' fill='rgb(212,160,18)'/><rect y='8' width='40' height='1' fill='rgb(70,72,74)'/><path d='M24 0.6 L27.4 3.4 M12 5 L15 7.6' stroke='rgb(20,16,10)' stroke-width='0.7'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 28'>
<rect width='8' height='28' fill='rgb(20,16,10)'/><rect x='0.5' y='0' width='7' height='13' fill='rgb(70,72,74)'/><rect x='0.5' y='14.4' width='7' height='13.6' fill='rgb(122,126,130)'/>
<path d='M0.5 13.6 L2.4 14.4 L4 13.4 L5.8 14.4 L7.5 13.6' fill='none' stroke='rgb(212,160,18)' stroke-width='0.8' stroke-linejoin='round'/>
<path d='M5.4 16 L7.4 17 L7 20.6 L4.8 19 Z' fill='rgb(107,74,36)'/><circle cx='3.4' cy='6.6' r='1.5' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M2.5 6.6 H4.3' stroke='rgb(20,16,10)' stroke-width='0.5'/><circle cx='4.6' cy='22.4' r='1.5' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M3.6999999999999997 22.4 H5.5' stroke='rgb(20,16,10)' stroke-width='0.5'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect width='8' height='8' fill='rgb(70,72,74)'/><rect x='0.5' y='0.5' width='7' height='7' fill='none' stroke='rgb(122,126,130)' stroke-width='0.8'/><circle cx='4' cy='4' r='2' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M2.8 4 H5.2' stroke='rgb(20,16,10)' stroke-width='0.5'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 7'>
<rect width='16' height='0.9' fill='rgb(70,72,74)'/><path d='M0 7 L3.6 1 H7.6 L4 7 Z M8 7 L11.6 1 H15.6 L12 7 Z' fill='rgb(176,30,30)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<path d='M3 32 L5 8.4 L79 4.6 L82 33.4 Z' fill='rgb(70,72,74)' stroke='rgb(122,126,130)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M44 5.6 L56 5 L42.6 33.4 L30.6 33.8 Z' fill='rgb(176,30,30)'/><path d='M12 24 L22 23 L21 31 L11 31.6 Z M64 8 L76 7.4 L75.6 13 L65 13.6 Z' fill='rgb(107,74,36)'/>
<path d='M9 11 H21 M9 15 H21' stroke='rgb(20,16,10)' stroke-width='0.4'/><g><rect x='9' y='10.4' width='4' height='4' fill='rgb(212,160,18)'/><rect x='9' y='14.4' width='4' height='4' fill='rgb(20,16,10)'/><rect x='13' y='10.4' width='4' height='4' fill='rgb(20,16,10)'/><rect x='13' y='14.4' width='4' height='4' fill='rgb(212,160,18)'/><rect x='17' y='10.4' width='4' height='4' fill='rgb(212,160,18)'/><rect x='17' y='14.4' width='4' height='4' fill='rgb(20,16,10)'/></g>
<circle cx='62' cy='22' r='2.4' fill='rgb(20,16,10)' stroke='rgb(172,174,172)' stroke-width='0.7'/><circle cx='69' cy='26' r='2' fill='rgb(20,16,10)' stroke='rgb(172,174,172)' stroke-width='0.7'/><circle cx='72' cy='19' r='1.7' fill='rgb(20,16,10)' stroke='rgb(172,174,172)' stroke-width='0.7'/>
<circle cx='7' cy='11' r='1.6' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M6.04 11 H7.96' stroke='rgb(20,16,10)' stroke-width='0.5'/><circle cx='77' cy='8' r='1.6' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M76.04 8 H77.96' stroke='rgb(20,16,10)' stroke-width='0.5'/><circle cx='79' cy='30' r='1.6' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M78.04 30 H79.96' stroke='rgb(20,16,10)' stroke-width='0.5'/><circle cx='6' cy='29' r='1.6' fill='rgb(172,174,172)' stroke='rgb(20,16,10)' stroke-width='0.5'/><path d='M5.04 29 H6.96' stroke='rgb(20,16,10)' stroke-width='0.5'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M2.2 20.2 L10.8 11.6' stroke='rgb(156,100,44)' stroke-width='3.4' stroke-linecap='butt'/><path d='M4.6 17.8 L6.8 20 M7.4 15 L9.6 17.2' stroke='rgb(20,16,10)' stroke-width='0.9'/>
<path d='M7.6 8.8 L15.4 1 L17.4 2.6 L16.6 4.2 L20 4.8 L19 7 L21 8 L20.4 9.4 L19.4 10.6 L21 12.2 L17.6 12.6 L18 14.6 L13.4 14.4 Z' fill='rgb(172,174,172)' stroke='rgb(70,72,74)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M9.6 9.6 L16.4 3.6 M11.4 11.6 L18 6.4' stroke='rgb(70,72,74)' stroke-width='0.6'/><circle cx='11.6' cy='11.4' r='1' fill='rgb(20,16,10)'/>
</svg>
```

### 2.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | `ork-title` (2) | removed |
| 2 | `banner-throb` (1) | removed |
| 3 | `ork-shoota` (1) | removed |
| 4 | `ork-readout` (2) | removed |
| 5 | `ork-border` (5) | removed |
| 6 | `ork-debris` `#particles` (4) | removed |
| hover | `tile-flicker .4s steps(1) infinite` (opacity, 1) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite warhammer-orks.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 2.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#241E14`, border `#4A3F2A` (1 px), radius 2px, `::before` off; layout unchanged. Icons: `sepia(0.2) saturate(1.1) contrast(1.05)` through the cut plate (D in 3).
- **Hover:** fill `#2B2316`, border `#D4A012` (6.52:1 on the hover fill), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (3.92:1 on the tile, 4.23:1 on the grid ground). **Pressed:** base scale 0.96 on `#2B2316`.
- **Label:** `#E8DCA0`, Ink Free 400, 13 px (fixed 14.4 px line height), 0 tracking, user case, no halo.
- **Filter chip:** base rule (fill `#2B2316`, `--accent-c` border, `#E8BA2A` text). The header scene hides while it shows.
- **Edit bar:** `#3A1410` fill, `#B01E1E` rule, label `#F28E78`; `+ FILE` and `+ INSTALLED` in `--text` with a `#8A7848` border, `DONE` in `#F28E78` with a `#B01E1E` border. The tile remove button is `#A01E1E` with a `#F28E78` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#1B1710`, panel `#241E14`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#E8BA2A` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#E8BA2A` text on `#2A2212` with a `#D4A012` rule.

### 2.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite warhammer-orks.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#8A8E92`) at y 37 to 40 with nothing below; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **111.27**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: #211B11 with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 5 strings; mock all fit at 424 and 640), the text box ending at x 320.
5. Hover shot (CALCULATOR): `#D4A012` border, `#2B2316` fill, the cut plate with no cropped glyph, no ellipsis on CALCULATOR (mock 54.9 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): green only in the focus ring, the slider and the checkboxes (and the art's none); yellow for the chequer, the hover border, the title and the values; red for the stripes, one plate stripe, edit mode and the remove button; scrap grey, rust and bone for plates and teeth; nothing blue, purple or pink.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 11 px, frame 8 px, banner 3 px; at 640 x 420 11 / 8 / 11 px; at 1024 x 700 11 / 8 / 11 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Impact`, `Ink Free` and `Segoe UI Semibold`; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures; the long name "Spreadsheet Editor" shows its descenders (g, p, y) uncut in the 14.4 px label.

**Expected squint score: 4** (title and banner text covered). What survives: a brown-black window, a yellow-and-black chequer band, grey bolted scrap strips, red slanted stripes on the banner, crooked plates, a toothy plate in the header, a battered plate with bullet holes. What is missing for a 5: the Ork glyph and the klan colours (marks, not drawn); true hand-daubed lettering, which needs a face that is not among the approved seven (Rubik Dirt, a wish).

Watch items for this theme: (1) Ink Free has one weight (regular). The theme never asks for bold, and `font-synthesis: none` stops a smeared fake. At 13 px with a fixed 14.4 px line height the descenders of g, j, p, q and y are uncut in the mock (checked at 4x on "gypsy Yy jq" and "Spreadsheet Editor"); the label boxes read 14.7 to 15.6 px in `getBoundingClientRect` only because of the rotation (the layout height stays 14.4 and the tile stays 95.41). (2) The icon filter override removes the base drop shadow under the plates (it shows its clipped box on this lighter ground). It is the only theme in the batch that overrides `.tile-icon`.

---

## 3. warhammer-tyranids (WARHAMMER 40K: TYRANIDS): DONE

**Audit:** score 2, redraw. Purple, but staged as an Adeptus Mechanicus analysis dossier (HIVE FLEET ANALYSIS, bioform and fleet lists) inside a square corner-bracket frame, with a face behind CALCULATOR. Tyranids are wet, ribbed and organic, with no straight lines and no metal; the gold secondary did not belong. Six infinite animations.
**Direction:** **wet chitin**. A hive-purple ground, bone-coloured ribs, spine and talons with a wet highlight, flesh-pink sinew, a scalloped membrane. The top course is a row of **curved ribs** hanging under a flesh line; each side is a **spine** (bone vertebrae with side processes on a sinew strand); the corners curl into tendrils. The header carries a pair of scythe mandibles meeting at a flesh-pink bulb; the banner is a deep purple membrane with a scalloped flesh edge, a talon for its icon and two talons and two curled tendrils at its right end. Everything has a radius: an asymmetric rounded window (20, 10, 20, 10 px) and pod-shaped tiles (flat top, round bottom). No straight-line ornament, no metal, no gold. Static.

### 3.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: inset(0 round 20px 10px 20px 10px);
  --overlay-clip: inset(0 round 20px 10px 20px 10px);
  --bg: #140B13;
  --panel-bg: #1D111E;
  --overlay-bg: #140B13;
  --header-bg: #190D19;
  --font: 'Sitka Text', Cambria, Georgia, serif;
  --text: #E6D9B8;
  --text-dim: #B9A6B0;
  --accent-c: #C4436B;
  --accent-m: #E88CD6;
  --accent-y: #C4436B;
  --accent-text: #F2A0BC;
  --border: #3A2440;
  --border-h: #C4436B;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #C4436B;
  --title-anim: none;
  --tile-hover-bg: #251428;
  --tile-hover-border: #C4436B;
  --tile-hover-shadow: none;
  --tile-active-bg: #251428;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.9);
  --tile-icon-shape: inset(0 round 8px 8px 26px 26px);
  --tile-label-spacing: 0.2px;
  --tile-label-transform: none;
  --tile-label-weight: 700;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #33193A;
  --btn-active-bg: #44224D;
  --drop-hint-border: #4E3058;
  --drop-icon-color: #7A5A86;
  --hint-sub-color: #B9A6B0;
  --rename-dashed: #C4436B;
  --rename-input-bg: #251428;
  --edit-bar-bg: #2B1030;
  --edit-bar-border: #7B2A6E;
  --edit-label-color: #E8A4DC;
  --edit-label-glow: none;
  --btn-done-color: #E8A4DC;
  --btn-done-border: #7B2A6E;
  --btn-done-hover-bg: #44164C;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A5A86;
  --update-bg: #26122A;
  --update-border: #C4436B;
  --update-color: #F2A0BC;
  --update-btn-border: #C4436B;
  --update-btn-hover-bg: #3A1C42;
  --update-btn-hover-glow: none;
  --btn-close-color: #F2A0BC;
  --btn-close-border: #8A4A6A;
  --btn-close-hover-bg: #3A1C42;
  --btn-close-hover-glow: none;
  --picker-search-bg: #251428;
  --picker-item-hover-bg: #251428;
  --picker-item-active-bg: #33193A;
  --picker-placeholder-bg: #251428;
  --skin-btn-active-bg: #33193A;
  --remove-btn-bg: #A02A52;
  --remove-btn-border: #F2A0BC;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#E6D9B8` on `#140B13` | 4.5:1 | **13.78:1** |
| `--text-dim` on `--bg` | `#B9A6B0` on `#140B13` | 4.5:1 | **8.41:1** |
| `--accent-c` on `--bg` | `#C4436B` on `#140B13` | 3:1 | **4.01:1** |
| `--accent-text` on `--bg` | `#F2A0BC` on `#140B13` | 3:1 | **9.69:1** |
| `--hint-sub-color` on `--bg` | `#B9A6B0` on `#140B13` | 4.5:1 | **8.41:1** |
| `--btn-close-color` on `--panel-bg` | `#F2A0BC` on `#1D111E` | 4.5:1 | **9.15:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E6D9B8` on `#1C101C` | 4.5:1 | **13.14:1** |
| Tile label on tile hover | `#E6D9B8` on `#251428` | 4.5:1 | **12.39:1** |
| Tile label on tile pressed (pressed state) | `#E6D9B8` on `#251428` | 4.5:1 | **12.39:1** |
| Title on header | `#E6D9B8` on `#190D19` | 4.5:1 | **13.46:1** |
| Title dot (`.accent`) on header | `#F2749A` on `#190D19` | 4.5:1 | **6.95:1** |
| Header version on header | `#B9A6B0` on `#190D19` | 4.5:1 | **8.22:1** |
| Header button glyph on header | `#E6D9B8` on `#190D19` | 4.5:1 | **13.46:1** |
| Header button glyph on button hover | `#FFFFFF` on `#33193A` | 4.5:1 | **15.66:1** |
| Filter chip text on chip | `#F2A0BC` on `#251428` | 4.5:1 | **8.71:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#251428` | 4.5:1 | **17.36:1** |
| Banner text on banner | `#E6D9B8` on `#22112A` | 4.5:1 | **12.68:1** |
| Header line on header (non-text) | `#C4436B` on `#190D19` | 3:1 | **3.92:1** |
| Edit label on edit bar | `#E8A4DC` on `#2B1030` | 4.5:1 | **8.84:1** |
| Done / close button text on edit bar | `#E8A4DC` on `#2B1030` | 4.5:1 | **8.84:1** |
| + FILE / + INSTALLED text on edit bar | `#E6D9B8` on `#2B1030` | 4.5:1 | **12.29:1** |
| Done button text on its hover fill | `#E8A4DC` on `#44164C` | 4.5:1 | **7.36:1** |
| Settings text on overlay | `#E6D9B8` on `#140B13` | 4.5:1 | **13.78:1** |
| Settings text on panel | `#E6D9B8` on `#1D111E` | 4.5:1 | **13.01:1** |
| Settings label (text-dim) on panel | `#B9A6B0` on `#1D111E` | 4.5:1 | **7.94:1** |
| Settings value / cheat key (accent-text) on panel | `#F2A0BC` on `#1D111E` | 4.5:1 | **9.15:1** |
| Settings version value (accent-text) on panel | `#F2A0BC` on `#1D111E` | 4.5:1 | **9.15:1** |
| Settings CLOSE text on panel | `#F2A0BC` on `#1D111E` | 4.5:1 | **9.15:1** |
| Settings CLOSE text on its hover fill | `#F2A0BC` on `#3A1C42` | 4.5:1 | **7.39:1** |
| Hotkey error text (accent-m) on panel | `#E88CD6` on `#1D111E` | 4.5:1 | **7.95:1** |
| Hotkey input text on input fill | `#F2A0BC` on `#251428` | 4.5:1 | **8.71:1** |
| Picker row text on hover fill | `#F2A0BC` on `#251428` | 4.5:1 | **8.71:1** |
| Update banner text on update bar | `#F2A0BC` on `#26122A` | 4.5:1 | **8.76:1** |
| Update button text on hover fill | `#FFFFFF` on `#3A1C42` | 4.5:1 | **14.74:1** |
| Drop-hint text (text-dim) on grid ground | `#B9A6B0` on `#140B13` | 4.5:1 | **8.41:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#A02A52` | 3:1 | **7.12:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#A02A52` | 3:1 | **7.12:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#C4436B` on `#1C101C` | 3:1 | **3.83:1** |
| Focus ring on grid ground (non-text) | `#C4436B` on `#140B13` | 3:1 | **4.01:1** |
| Hover border on grid ground (non-text) | `#C4436B` on `#140B13` | 3:1 | **4.01:1** |
| Hover border on hover fill (non-text) | `#C4436B` on `#251428` | 3:1 | **3.61:1** |
| Theme-picker selected row text (accent-text) on active fill | `#F2A0BC` on `#33193A` | 4.5:1 | **7.85:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#F2A0BC` on `#251428` | 4.5:1 | **8.71:1** |
| Skin search input text (accent-text) on panel | `#F2A0BC` on `#1D111E` | 4.5:1 | **9.15:1** |
| Apps-picker search input text (accent-text) on search fill | `#F2A0BC` on `#251428` | 4.5:1 | **8.71:1** |
| Rename input text (accent-text) on input fill | `#F2A0BC` on `#251428` | 4.5:1 | **8.71:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#B9A6B0` on `#251428` | 4.5:1 | **7.56:1** |
| Skin search placeholder (text-dim, themed) on panel | `#B9A6B0` on `#1D111E` | 4.5:1 | **7.94:1** |
| Apps-picker placeholder (text-dim) on search fill | `#B9A6B0` on `#251428` | 4.5:1 | **7.56:1** |
| Hotkey recording text (accent-m) on input fill | `#E88CD6` on `#251428` | 4.5:1 | **7.57:1** |
| Update dismiss glyph (text-dim) on update bar | `#B9A6B0` on `#26122A` | 4.5:1 | **7.61:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#B9A6B0` on `#1D111E` | 3:1 | **7.94:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#C4436B` on `#1D111E` | 3:1 | **3.79:1** |

**Lowest ratio in this theme: 3.61:1 (Hover border on hover fill (non-text), non-text).** Lowest text ratio: 6.95:1 (Title dot (`.accent`) on header). Lowest non-text ratio: 3.61:1 (Hover border on hover fill (non-text)). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (`saturate(0.9)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#1C101C` | Hover `#251428` | Pressed `#251428` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5E7FA2` | 4.41:1 | 4.16:1 | 4.16:1 | pass |
| Calculator `#6b6f76` | `#6B6F75` | 3.64:1 | 3.44:1 | 3.44:1 | pass |
| Paint `#b07a4f` | `#AB7B54` | 4.99:1 | 4.71:1 | 4.71:1 | pass |
| Terminal `#3d4450` | `#3E444F` | 1.88:1 | 1.77:1 | 1.77:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#54898A` | 4.67:1 | 4.40:1 | 4.40:1 | pass |
| Files `#c09a3e` | `#BC9A47` | 6.89:1 | 6.49:1 | 6.49:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.44:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Flesh `#C4436B` is `--accent-c` (the audit's value; 4.01:1 on the ground). Hive purple `#7B2A6E` is the edit-bar rule and a fill in the art; the text variants are `#F2A0BC` (values) and `#E88CD6` (hotkey error and recording). Chitin `#E6D9B8` is the text, carapace `#3A2A3E` the nearest tile edge.

### 3.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | 'Sitka Text', Cambria, Georgia, serif |
| `#title` | Sitka Text 700, 12 px, tracking 3 px, uppercase from the markup |
| `.tile-label` | Sitka Text 700, 12 px, 0.2 px, user case |
| `#theme-banner-text` | Sitka Text 700 italic, 12 px, 0.2 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 141.89** (gate 156; 14.1 px under, 26.1 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 50.8, CALCULATOR 63.1, PAINT 32.2, TERMINAL 55.5, BROWSER 51.0, FILES 29.4 px, no ellipsis. Tile height 95.39 px (94.7 to 95.4 required). Banner lines: see 0.8. **Platform fonts the mock used:** title Sitka Text x12; labels Sitka Text x7; banner Sitka Text x28; version and settings Sitka Text x7. Expected `fontsRendered` for the web faces: none (stock only).

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Sitka Text covers it (checked).

### 3.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { border-bottom-color: #C4436B; box-shadow: inset 0 -2px 0 #C4436B; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { left: 3px; top: 12px; bottom: 12px; background: #C4436B; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a pair of curved bone mandibles (x 168 to 252, y 10 to 30) meeting at a flesh-pink bulb with two thin tendrils. Painted pixels at x 169.6 to 250.4, y 11.9 to 29.3. Hidden while the chip shows. The title ends at x 141.9, the scene starts at x 168: 26.1 px clear.

**B. Frame (the kit of 0.3).** a flesh line (3 px) under the header, then a **rib row** (curved bone ribs on a dark purple strip under a 1.3 px flesh line, 14 px pitch) in the top course; down both sides a **spine** (bone vertebrae with pointed side processes, flesh sinew between them, 18 px repeat); each corner is a flesh tendril curl. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 7 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner is deep purple `#22112A` with a 1 px flesh top border; its top course is a **scalloped membrane** (rounded flesh bumps with a wet highlight, 18 px pitch); the icon is a single bone talon on a flesh band; the right end is two talons and two curled flesh tendrils with bulb tips. The motif's painted pixels are at x 334.5 to 410.5, y 266.8 to 300.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 38.8 px (0.8). The banner row of the probe reads 4 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: asymmetric rounded rectangle `inset(0 round 20px 10px 20px 10px)`. `--overlay-clip` is the same. Tiles: plates are **pods** (`inset(0 round 8px 8px 26px 26px)`: flat top, round bottom), the tile cell is `border-radius: 6px 6px 20px 20px`. Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 10.52, Calculator 8.6, Paint 11.13, Terminal 7.17, Browser 11.63, Files 8.15 (smallest 7.17); nothing is cropped.

**Trademark note.** The Tyranid hive-fleet marks, the Genestealer four-arm silhouette and the Hive Mind sigils are not drawn. Ribs, vertebrae, talons and tendrils are generic anatomy; no creature is shown.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A02A52; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { border-bottom-color: #C4436B; box-shadow: inset 0 -2px 0 #C4436B; }
#header::before { left: 3px; top: 12px; bottom: 12px; background: #C4436B; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Sitka Text', Cambria, Georgia, serif; font-weight: 700; font-style: normal; line-height: 1.2; font-size: 12px; letter-spacing: 3px; color: #E6D9B8; text-shadow: none; }
#title .accent { color: #F2749A; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNERTL@ left 1px top 0 / 8px 8px no-repeat,
    @CORNERTR@ right 5px top 0 / 8px 8px no-repeat,
    @CORNERBL@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNERBR@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 18px repeat-y,
    @SIDE@ right 5px top 0 / 8px 18px repeat-y,
    @TOP@ left 0 top 0 / 14px 9px repeat-x;
}

/* tiles */
.app-tile { background: #1C101C; border-color: #33203A; border-radius: 6px 6px 20px 20px; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Sitka Text', Cambria, Georgia, serif;  }
/* Sitka's regular weight draws old-style figures; the version, sizes and tile names want lining ones */
html, body { font-variant-numeric: lining-nums; }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 18px 7px repeat-x, #22112A;
  border-top-color: #C4436B;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Sitka Text', Cambria, Georgia, serif; font-size: 12px; font-weight: 700; font-style: italic; letter-spacing: 0.2px; color: #E6D9B8; margin-right: 90px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CORNERTL@` | `cornerTL` |
| `@CORNERTR@` | `cornerTR` |
| `@CORNERBL@` | `cornerBL` |
| `@CORNERBR@` | `cornerBR` |
| `@SIDE@` | `side` |
| `@TOP@` | `top` |
| `@MOTIF@` | `motif` |
| `@BTOP@` | `btop` |
| `@ICON@` | `icon` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#g)` in the Tyranid SVGs):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='rgb(230,217,184)'/><stop offset='1' stop-color='rgb(160,140,116)'/></linearGradient></defs><path d='M2 2.6 C16 1 32 4 39 17.6 C34 11.8 20 8.2 2 7.8 Z' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.6' stroke-linejoin='round'/><path d='M5 3.8 C16 3 28 5.6 34 11' fill='none' stroke='rgb(255,248,240)' stroke-opacity='0.55' stroke-width='0.8' stroke-linecap='round'/><g transform='translate(84,0) scale(-1,1)'><path d='M2 2.6 C16 1 32 4 39 17.6 C34 11.8 20 8.2 2 7.8 Z' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.6' stroke-linejoin='round'/><path d='M5 3.8 C16 3 28 5.6 34 11' fill='none' stroke='rgb(255,248,240)' stroke-opacity='0.55' stroke-width='0.8' stroke-linecap='round'/></g>
<path d='M42 15.4 C40.6 18.4 37.4 19.2 35.4 18.4 M42 15.4 C43.4 18.4 46.6 19.2 48.6 18.4' fill='none' stroke='rgb(196,67,107)' stroke-width='1.1' stroke-linecap='round'/>
<ellipse cx='42' cy='10.4' rx='4.6' ry='5.4' fill='rgb(196,67,107)' stroke='rgb(123,42,110)' stroke-width='0.8'/><ellipse cx='40.6' cy='8.4' rx='1.5' ry='2' fill='rgb(240,138,168)' fill-opacity='0.75'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 9'>
<rect width='14' height='9' fill='rgb(46,20,50)'/><rect width='14' height='1.3' fill='rgb(196,67,107)'/>
<path d='M2 1.3 H8.6 C9 4.6 11 7 13.6 9 C8 9 3.6 6.4 2 1.3 Z' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.5' stroke-linejoin='round'/>
<path d='M4.4 2.2 C5 4.4 7 6.4 10 8' fill='none' stroke='rgb(255,248,240)' stroke-opacity='0.55' stroke-width='0.8' stroke-linecap='round'/><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='rgb(230,217,184)'/><stop offset='1' stop-color='rgb(160,140,116)'/></linearGradient></defs>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 18'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='rgb(230,217,184)'/><stop offset='1' stop-color='rgb(160,140,116)'/></linearGradient></defs><rect width='8' height='18' fill='rgb(46,20,50)'/><rect x='2.9' y='11.6' width='2.2' height='7.8' fill='rgb(196,67,107)'/><rect x='2.9' y='-1' width='2.2' height='3' fill='rgb(196,67,107)'/>
<path d='M0.3 6.6 L2 4.6 V8.6 Z M7.7 6.6 L6 4.6 V8.6 Z' fill='rgb(160,140,116)'/>
<rect x='1.8' y='1.4' width='4.4' height='10.2' rx='2.2' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.5'/><ellipse cx='3.4' cy='4' rx='0.7' ry='1.6' fill='rgb(255,248,240)' fill-opacity='0.6'/>
</svg>
```

**`cornerTL`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect width='8' height='8' fill='rgb(46,20,50)'/><path d='M0.9 7.4 C0.9 3.2 3.8 1 7.4 1.2 C5.8 2 4.8 3.2 5 4.6 C5.2 5.8 6.4 5.8 6.6 5' fill='none' stroke='rgb(196,67,107)' stroke-width='1.3' stroke-linecap='round'/><circle cx='6.6' cy='5' r='0.9' fill='rgb(240,138,168)'/>
</svg>
```

**`cornerTR`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect width='8' height='8' fill='rgb(46,20,50)'/><g transform='translate(8,0) scale(-1,1)'><path d='M0.9 7.4 C0.9 3.2 3.8 1 7.4 1.2 C5.8 2 4.8 3.2 5 4.6 C5.2 5.8 6.4 5.8 6.6 5' fill='none' stroke='rgb(196,67,107)' stroke-width='1.3' stroke-linecap='round'/><circle cx='6.6' cy='5' r='0.9' fill='rgb(240,138,168)'/></g>
</svg>
```

**`cornerBL`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect width='8' height='8' fill='rgb(46,20,50)'/><g transform='translate(0,8) scale(1,-1)'><path d='M0.9 7.4 C0.9 3.2 3.8 1 7.4 1.2 C5.8 2 4.8 3.2 5 4.6 C5.2 5.8 6.4 5.8 6.6 5' fill='none' stroke='rgb(196,67,107)' stroke-width='1.3' stroke-linecap='round'/><circle cx='6.6' cy='5' r='0.9' fill='rgb(240,138,168)'/></g>
</svg>
```

**`cornerBR`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect width='8' height='8' fill='rgb(46,20,50)'/><g transform='translate(8,8) scale(-1,-1)'><path d='M0.9 7.4 C0.9 3.2 3.8 1 7.4 1.2 C5.8 2 4.8 3.2 5 4.6 C5.2 5.8 6.4 5.8 6.6 5' fill='none' stroke='rgb(196,67,107)' stroke-width='1.3' stroke-linecap='round'/><circle cx='6.6' cy='5' r='0.9' fill='rgb(240,138,168)'/></g>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 7'>
<path d='M0 7 C0 3 3 1.2 9 1.2 C15 1.2 18 3 18 7 Z' fill='rgb(150,48,92)'/><path d='M1.6 4.2 C3 2.6 5.4 2 9 2 C12.6 2 15 2.6 16.4 4.2' fill='none' stroke='rgb(240,138,168)' stroke-opacity='0.8' stroke-width='0.8' stroke-linecap='round'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='rgb(230,217,184)'/><stop offset='1' stop-color='rgb(160,140,116)'/></linearGradient></defs><path d='M8 34 C5 25 13 18 20 22 C24.4 24.8 20.4 29.4 17 27.2' fill='none' stroke='rgb(196,67,107)' stroke-width='1.6' stroke-linecap='round'/><circle cx='17' cy='27.2' r='2.1' fill='rgb(240,138,168)'/>
<path d='M26 34 C23 28 28 23 34 25' fill='none' stroke='rgb(196,67,107)' stroke-width='1.3' stroke-linecap='round'/><circle cx='34' cy='25' r='1.6' fill='rgb(240,138,168)'/>
<path d='M38 34 C37 25 42 17 52 13 C47 19.6 46.6 27 47.6 34 Z' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M54 34 C52 18 62 6 82 1.2 C72 8.4 68 20 70 34 Z' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.8' stroke-linejoin='round'/><path d='M58 31 C57.4 20 64 11 76 5.4' fill='none' stroke='rgb(255,248,240)' stroke-opacity='0.55' stroke-width='1' stroke-linecap='round'/>
<path d='M54 29 H70.4 L70.2 34 H54 Z' fill='rgb(196,67,107)'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='rgb(230,217,184)'/><stop offset='1' stop-color='rgb(160,140,116)'/></linearGradient></defs><path d='M6.6 21.6 C4.6 12.4 9 5 18.6 1.4 C14.4 7.2 13.4 13.8 15 21.6 Z' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.7' stroke-linejoin='round'/><path d='M6.4 17.8 H15.2 L15 21.6 H6.6 Z' fill='rgb(196,67,107)'/><path d='M9.4 14 C9.6 9.4 12 6 15.4 3.8' fill='none' stroke='rgb(255,248,240)' stroke-opacity='0.55' stroke-width='0.9' stroke-linecap='round'/>
</svg>
```

### 3.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | `tyranid-title` (2) | removed |
| 2 | `banner-throb` (1) | removed |
| 3 | `tyranid-hive` (1) | removed |
| 4 | `tyranid-readout` (2) | removed |
| 5 | `tyranid-border` (5) | removed |
| 6 | `tyranid-spores` `#particles` (4) | removed |
| hover | none infinite (`tile-radial`, one-shot) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite warhammer-tyranids.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 3.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#1C101C`, border `#33203A` (1 px), radius 6px 6px 20px 20px, `::before` off; layout unchanged. Icons: `saturate(0.9)` through the cut plate (D in 3).
- **Hover:** fill `#251428`, border `#C4436B` (3.61:1 on the hover fill), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (3.83:1 on the tile, 4.01:1 on the grid ground). **Pressed:** base scale 0.96 on `#251428`.
- **Label:** `#E6D9B8`, Sitka Text 700, 12 px, 0.2 px, user case, no halo.
- **Filter chip:** base rule (fill `#251428`, `--accent-c` border, `#F2A0BC` text). The header scene hides while it shows.
- **Edit bar:** `#2B1030` fill, `#7B2A6E` rule, label `#E8A4DC`; `+ FILE` and `+ INSTALLED` in `--text` with a `#7A5A86` border, `DONE` in `#E8A4DC` with a `#7B2A6E` border. The tile remove button is `#A02A52` with a `#F2A0BC` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#140B13`, panel `#1D111E`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#F2A0BC` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#F2A0BC` text on `#26122A` with a `#C4436B` rule.

### 3.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite warhammer-tyranids.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#C4436B`) at y 37 to 40 with nothing below; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **141.89**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: #22112A with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 2 strings; mock all fit at 424 and 640), the text box ending at x 320.
5. Hover shot (CALCULATOR): `#C4436B` border, `#251428` fill, the cut plate with no cropped glyph, no ellipsis on CALCULATOR (mock 63.1 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): no gold, orange, green or blue pixel in the chrome; flesh pink for the line, ring, hover and bulbs; hive purple for the edit rule and membrane; bone for ribs, spine and talons.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 7 px, frame 8 px, banner 4 px; at 640 x 420 7 / 8 / 9 px; at 1024 x 700 7 / 8 / 9 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Sitka Text`; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures.

**Expected squint score: 4** (title and banner text covered). What survives: a purple-black window, a flesh-pink line, a row of bone ribs under the header, a bone spine down each side, curled tendrils in the corners, bone mandibles in the header, talons on a scalloped membrane banner, pod-shaped tiles. What is missing for a 5: the hive-fleet marks (marks, not drawn) and any real creature silhouette; a bundled organic display face would add little.

Watch items for this theme: (1) Sitka Text draws old-style figures at regular weight; `html, body { font-variant-numeric: lining-nums; }` fixes that and is the only rule of its kind in the batch. Ender checks the header version and "64px" render with lining figures.

---

## 4. warhammer-eldar (WARHAMMER 40K: ELDAR): DONE

**Audit:** score 3, redraw. Italic serif labels suited it, but the blue-on-black palette with an orange secondary was Imperial-looking, not spirit-stone teal and bone, and a rectangular corner-bracketed dossier frame (craftworld and aspect-warrior lists) was the boxy geometry the reference sheet warns against. The faceted icons read as crude rocks, not wraithbone. Six infinite animations.
**Direction:** **wraithbone**: slender ivory curves and teal spirit stones on a deep blue-black ground. A long S-curve vine with a gem at each swing runs down both sides, a wave with a gem at each crest runs along the top, the corners are quarter arcs with a gem. The header carries a winged crest (a tall gem in a bone ring with a swoop and a thin curve either side); the banner icon is a faceted gem and its right end a spirit-stone pendant with two long swoops. No rivet, no right-angle ornament: the window is rounded (18 px) and the tiles are leaf-shaped (two opposite corners rounded). Bone-gold for values and the update bar, teal for the line, focus and hover, craftworld red only in edit mode and errors. Static.

### 4.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: inset(0 round 18px);
  --overlay-clip: inset(0 round 18px);
  --bg: #0E1520;
  --panel-bg: #15202C;
  --overlay-bg: #0E1520;
  --header-bg: #111B27;
  --font: 'Palatino Linotype', Palatino, Georgia, serif;
  --text: #F0EBDD;
  --text-dim: #A4B2BC;
  --accent-c: #2DB6A3;
  --accent-m: #F0705F;
  --accent-y: #E8D48A;
  --accent-text: #E8D48A;
  --border: #2A3C4E;
  --border-h: #2DB6A3;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #2DB6A3;
  --title-anim: none;
  --tile-hover-bg: #182638;
  --tile-hover-border: #2DB6A3;
  --tile-hover-shadow: none;
  --tile-active-bg: #182638;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.9) brightness(1.04);
  --tile-icon-shape: inset(0 round 28px 0 28px 0);
  --tile-label-spacing: 0.4px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: italic;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #1E3045;
  --btn-active-bg: #27405A;
  --drop-hint-border: #34506A;
  --drop-icon-color: #5A7A8E;
  --hint-sub-color: #A4B2BC;
  --rename-dashed: #2DB6A3;
  --rename-input-bg: #182638;
  --edit-bar-bg: #2A1216;
  --edit-bar-border: #E0483C;
  --edit-label-color: #F58C7E;
  --edit-label-glow: none;
  --btn-done-color: #F58C7E;
  --btn-done-border: #E0483C;
  --btn-done-hover-bg: #44181E;
  --btn-done-hover-glow: none;
  --btn-add-border: #5A7A8E;
  --update-bg: #142533;
  --update-border: #2DB6A3;
  --update-color: #E8D48A;
  --update-btn-border: #2DB6A3;
  --update-btn-hover-bg: #1E3548;
  --update-btn-hover-glow: none;
  --btn-close-color: #E8D48A;
  --btn-close-border: #B8A860;
  --btn-close-hover-bg: #1E3548;
  --btn-close-hover-glow: none;
  --picker-search-bg: #182638;
  --picker-item-hover-bg: #182638;
  --picker-item-active-bg: #22364C;
  --picker-placeholder-bg: #182638;
  --skin-btn-active-bg: #22364C;
  --remove-btn-bg: #B02A24;
  --remove-btn-border: #F0705F;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#F0EBDD` on `#0E1520` | 4.5:1 | **15.38:1** |
| `--text-dim` on `--bg` | `#A4B2BC` on `#0E1520` | 4.5:1 | **8.43:1** |
| `--accent-c` on `--bg` | `#2DB6A3` on `#0E1520` | 3:1 | **7.27:1** |
| `--accent-text` on `--bg` | `#E8D48A` on `#0E1520` | 3:1 | **12.40:1** |
| `--hint-sub-color` on `--bg` | `#A4B2BC` on `#0E1520` | 4.5:1 | **8.43:1** |
| `--btn-close-color` on `--panel-bg` | `#E8D48A` on `#15202C` | 4.5:1 | **11.15:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F0EBDD` on `#142030` | 4.5:1 | **13.79:1** |
| Tile label on tile hover | `#F0EBDD` on `#182638` | 4.5:1 | **12.84:1** |
| Tile label on tile pressed (pressed state) | `#F0EBDD` on `#182638` | 4.5:1 | **12.84:1** |
| Title on header | `#F0EBDD` on `#111B27` | 4.5:1 | **14.57:1** |
| Title dot (`.accent`) on header | `#2DB6A3` on `#111B27` | 4.5:1 | **6.89:1** |
| Header version on header | `#A4B2BC` on `#111B27` | 4.5:1 | **7.99:1** |
| Header button glyph on header | `#F0EBDD` on `#111B27` | 4.5:1 | **14.57:1** |
| Header button glyph on button hover | `#FFFFFF` on `#1E3045` | 4.5:1 | **13.43:1** |
| Filter chip text on chip | `#E8D48A` on `#182638` | 4.5:1 | **10.35:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#182638` | 4.5:1 | **15.29:1** |
| Banner text on banner | `#F0EBDD` on `#101A26` | 4.5:1 | **14.72:1** |
| Header line on header (non-text) | `#2DB6A3` on `#111B27` | 3:1 | **6.89:1** |
| Edit label on edit bar | `#F58C7E` on `#2A1216` | 4.5:1 | **7.47:1** |
| Done / close button text on edit bar | `#F58C7E` on `#2A1216` | 4.5:1 | **7.47:1** |
| + FILE / + INSTALLED text on edit bar | `#F0EBDD` on `#2A1216` | 4.5:1 | **14.74:1** |
| Done button text on its hover fill | `#F58C7E` on `#44181E` | 4.5:1 | **6.40:1** |
| Settings text on overlay | `#F0EBDD` on `#0E1520` | 4.5:1 | **15.38:1** |
| Settings text on panel | `#F0EBDD` on `#15202C` | 4.5:1 | **13.83:1** |
| Settings label (text-dim) on panel | `#A4B2BC` on `#15202C` | 4.5:1 | **7.59:1** |
| Settings value / cheat key (accent-text) on panel | `#E8D48A` on `#15202C` | 4.5:1 | **11.15:1** |
| Settings version value (accent-text) on panel | `#E8D48A` on `#15202C` | 4.5:1 | **11.15:1** |
| Settings CLOSE text on panel | `#E8D48A` on `#15202C` | 4.5:1 | **11.15:1** |
| Settings CLOSE text on its hover fill | `#E8D48A` on `#1E3548` | 4.5:1 | **8.57:1** |
| Hotkey error text (accent-m) on panel | `#F0705F` on `#15202C` | 4.5:1 | **5.64:1** |
| Hotkey input text on input fill | `#E8D48A` on `#182638` | 4.5:1 | **10.35:1** |
| Picker row text on hover fill | `#E8D48A` on `#182638` | 4.5:1 | **10.35:1** |
| Update banner text on update bar | `#E8D48A` on `#142533` | 4.5:1 | **10.59:1** |
| Update button text on hover fill | `#FFFFFF` on `#1E3548` | 4.5:1 | **12.67:1** |
| Drop-hint text (text-dim) on grid ground | `#A4B2BC` on `#0E1520` | 4.5:1 | **8.43:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#B02A24` | 3:1 | **6.56:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#B02A24` | 3:1 | **6.56:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#2DB6A3` on `#142030` | 3:1 | **6.51:1** |
| Focus ring on grid ground (non-text) | `#2DB6A3` on `#0E1520` | 3:1 | **7.27:1** |
| Hover border on grid ground (non-text) | `#2DB6A3` on `#0E1520` | 3:1 | **7.27:1** |
| Hover border on hover fill (non-text) | `#2DB6A3` on `#182638` | 3:1 | **6.07:1** |
| Theme-picker selected row text (accent-text) on active fill | `#E8D48A` on `#22364C` | 4.5:1 | **8.36:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#E8D48A` on `#182638` | 4.5:1 | **10.35:1** |
| Skin search input text (accent-text) on panel | `#E8D48A` on `#15202C` | 4.5:1 | **11.15:1** |
| Apps-picker search input text (accent-text) on search fill | `#E8D48A` on `#182638` | 4.5:1 | **10.35:1** |
| Rename input text (accent-text) on input fill | `#E8D48A` on `#182638` | 4.5:1 | **10.35:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#A4B2BC` on `#182638` | 4.5:1 | **7.04:1** |
| Skin search placeholder (text-dim, themed) on panel | `#A4B2BC` on `#15202C` | 4.5:1 | **7.59:1** |
| Apps-picker placeholder (text-dim) on search fill | `#A4B2BC` on `#182638` | 4.5:1 | **7.04:1** |
| Hotkey recording text (accent-m) on input fill | `#F0705F` on `#182638` | 4.5:1 | **5.23:1** |
| Update dismiss glyph (text-dim) on update bar | `#A4B2BC` on `#142533` | 4.5:1 | **7.21:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#A4B2BC` on `#15202C` | 3:1 | **7.59:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#2DB6A3` on `#15202C` | 3:1 | **6.54:1** |

**Lowest ratio in this theme: 5.23:1 (Hotkey recording text (accent-m) on input fill).** Lowest text ratio: 5.23:1 (Hotkey recording text (accent-m) on input fill). Lowest non-text ratio: 6.07:1 (Hover border on hover fill (non-text)). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (`saturate(0.9) brightness(1.04)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#142030` | Hover `#182638` | Pressed `#182638` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#6284A8` | 4.21:1 | 3.92:1 | 3.92:1 | pass |
| Calculator `#6b6f76` | `#70737A` | 3.46:1 | 3.22:1 | 3.22:1 | pass |
| Paint `#b07a4f` | `#B28058` | 4.79:1 | 4.46:1 | 4.46:1 | pass |
| Terminal `#3d4450` | `#404752` | 1.75:1 | 1.63:1 | 1.63:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#578E8F` | 4.43:1 | 4.13:1 | 4.13:1 | pass |
| Files `#c09a3e` | `#C4A04A` | 6.63:1 | 6.17:1 | 6.17:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.22:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Teal `#2DB6A3` is `--accent-c` (7.27:1 on the ground), bone-gold `#E8D48A` is `--accent-text`. The ground is `#0E1520` (the audit's `#0F1620`, one step darker so the hover fill keeps the Calculator plate at 3:1). Craftworld red `#E0483C` is the edit-bar rule, its text variants `#F58C7E` and `#F0705F`.

### 4.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | 'Palatino Linotype', Palatino, Georgia, serif |
| `#title` | Palatino Linotype italic 400, 11 px, tracking 4 px, uppercase from the markup |
| `.tile-label` | Palatino Linotype italic 400, 12 px, 0.4 px, user case |
| `#theme-banner-text` | Palatino Linotype italic 400, 12 px, 0.3 px, sentence case |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 145.28** (gate 156; 10.7 px under, 22.7 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 43.5, CALCULATOR 54.9, PAINT 28.3, TERMINAL 47.0, BROWSER 42.8, FILES 24.7 px, no ellipsis. Tile height 95.39 px (94.7 to 95.4 required). Banner lines: see 0.8. **Platform fonts the mock used:** title Palatino Linotype x12; labels Palatino Linotype x7; banner Palatino Linotype x28; version and settings Palatino Linotype x7. Expected `fontsRendered` for the web faces: none (stock only).

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Palatino Linotype covers it (checked).

### 4.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { border-bottom-color: #2DB6A3; box-shadow: inset 0 -2px 0 #2DB6A3; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { left: 3px; top: 12px; bottom: 12px; background: #2DB6A3; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a winged crest (x 168 to 252, y 10 to 30): a tall teal gem in a bone ring at the centre, a bone swoop tapering to a teal dot each side, and a thin ivory curve beneath each. Painted pixels at x 169.6 to 250.4, y 10.6 to 29.4. Hidden while the chip shows. The title ends at x 145.3, the scene starts at x 168: 22.7 px clear.

**B. Frame (the kit of 0.3).** a teal line (3 px) under the header, then a **thin ivory wave** with a teal gem at its crest (40 px period) in the top course; down both sides an **S-curve vine** (1.2 px ivory, two gems per 40 px period); each corner is a quarter arc with a gem, mirrored to its corner. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 7 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner is deep teal-navy `#101A26` with a 1 px dark-teal top border; its top course is a thin bone wave with a teal dot at each crest; the icon is a faceted teal gem in a bone outline; the right end is a **spirit-stone pendant** (a gem in an oval bone ring) with a broad bone swoop and a thin ivory curve flowing left. The motif's painted pixels are at x 329.5 to 404.4, y 267.8 to 298.3 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 96.9 px (0.8). The banner row of the probe reads 3 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: rounded rectangle `inset(0 round 18px)`. `--overlay-clip` is the same. Tiles: plates are **leaf-shaped** (`inset(0 round 28px 0 28px 0)`, two opposite corners rounded), the tile cell is `border-radius: 18px 4px 18px 4px`. Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 9.81, Calculator 7.92, Paint 11.12, Terminal 6.37, Browser 11.63, Files 7.37 (smallest 6.37); nothing is cropped.

**Trademark note.** No craftworld rune, no Eldar crest, no Aeldari script. A gem in a ring, swooping curves and a vine are generic.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B02A24; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { border-bottom-color: #2DB6A3; box-shadow: inset 0 -2px 0 #2DB6A3; }
#header::before { left: 3px; top: 12px; bottom: 12px; background: #2DB6A3; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 400; font-style: italic; line-height: 1.2; font-size: 11px; letter-spacing: 4px; color: #F0EBDD; text-shadow: none; }
#title .accent { color: #2DB6A3; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNERTL@ left 1px top 0 / 8px 8px no-repeat,
    @CORNERTR@ right 5px top 0 / 8px 8px no-repeat,
    @CORNERBL@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNERBR@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 40px repeat-y,
    @SIDE@ right 5px top 0 / 8px 40px repeat-y,
    @TOP@ left 0 top 0 / 40px 9px repeat-x;
}

/* tiles */
.app-tile { background: #142030; border-color: #233446; border-radius: 18px 4px 18px 4px; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Palatino Linotype', Palatino, Georgia, serif;  }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 40px 7px repeat-x, #101A26;
  border-top-color: #2A3C4E;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Palatino Linotype', Palatino, Georgia, serif; font-size: 12px; font-weight: 400; font-style: italic; letter-spacing: 0.3px; color: #F0EBDD; margin-right: 90px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CORNERTL@` | `cornerTL` |
| `@CORNERTR@` | `cornerTR` |
| `@CORNERBL@` | `cornerBL` |
| `@CORNERBR@` | `cornerBR` |
| `@SIDE@` | `side` |
| `@TOP@` | `top` |
| `@MOTIF@` | `motif` |
| `@BTOP@` | `btop` |
| `@ICON@` | `icon` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#g)` in the Tyranid SVGs):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<path d='M36.4 10 C30 3.6 16 2 3 7.6 C14 6.6 24 9 30.4 13.4 C33 15 35 13.6 36.4 10 Z' fill='rgb(232,212,138)'/>
<path d='M35.4 12.8 C28 17.8 16 18.6 6 14.8' fill='none' stroke='rgb(240,235,221)' stroke-width='1.1' stroke-linecap='round'/>
<circle cx='3' cy='7.6' r='1.3' fill='rgb(45,182,163)'/><circle cx='6' cy='14.8' r='1.1' fill='rgb(45,182,163)'/><g transform='translate(84,0) scale(-1,1)'><path d='M36.4 10 C30 3.6 16 2 3 7.6 C14 6.6 24 9 30.4 13.4 C33 15 35 13.6 36.4 10 Z' fill='rgb(232,212,138)'/>
<path d='M35.4 12.8 C28 17.8 16 18.6 6 14.8' fill='none' stroke='rgb(240,235,221)' stroke-width='1.1' stroke-linecap='round'/>
<circle cx='3' cy='7.6' r='1.3' fill='rgb(45,182,163)'/><circle cx='6' cy='14.8' r='1.1' fill='rgb(45,182,163)'/></g><ellipse cx='42' cy='10' rx='6.2' ry='8.8' fill='none' stroke='rgb(232,212,138)' stroke-width='1.1'/><path d='M42 3 L45.8 10 L42 17 L38.2 10 Z' fill='rgb(45,182,163)' stroke='rgb(232,212,138)' stroke-width='0.7' stroke-linejoin='round'/><path d='M42 3 L43.9 10 H42 Z' fill='rgb(130,232,216)' fill-opacity='0.7'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 9'>
<path d='M0 4.5 C5 0.5 15 0.5 20 4.5 S35 8.5 40 4.5' fill='none' stroke='rgb(240,235,221)' stroke-width='1' stroke-opacity='0.9'/><circle cx='10' cy='1.9' r='1.4' fill='rgb(45,182,163)' stroke='rgb(232,212,138)' stroke-width='0.5'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 40'>
<path d='M4 0 C8.5 5 8.5 10 4 13.5 C-0.5 17 -0.5 23 4 26.5 C8.5 30 8.5 35 4 40' fill='none' stroke='rgb(240,235,221)' stroke-width='1.2' stroke-opacity='0.9'/><circle cx='4' cy='13.5' r='1.7' fill='rgb(45,182,163)' stroke='rgb(232,212,138)' stroke-width='0.5'/><circle cx='4' cy='26.5' r='1.7' fill='rgb(45,182,163)' stroke='rgb(232,212,138)' stroke-width='0.5'/>
</svg>
```

**`cornerTL`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<path d='M0.8 7.4 C0.8 3.4 3.4 0.8 7.4 0.8' fill='none' stroke='rgb(240,235,221)' stroke-width='1.3' stroke-linecap='round'/><circle cx='5' cy='5' r='1.5' fill='rgb(45,182,163)' stroke='rgb(232,212,138)' stroke-width='0.5'/>
</svg>
```

**`cornerTR`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<g transform='translate(8,0) scale(-1,1)'><path d='M0.8 7.4 C0.8 3.4 3.4 0.8 7.4 0.8' fill='none' stroke='rgb(240,235,221)' stroke-width='1.3' stroke-linecap='round'/><circle cx='5' cy='5' r='1.5' fill='rgb(45,182,163)' stroke='rgb(232,212,138)' stroke-width='0.5'/></g>
</svg>
```

**`cornerBL`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<g transform='translate(0,8) scale(1,-1)'><path d='M0.8 7.4 C0.8 3.4 3.4 0.8 7.4 0.8' fill='none' stroke='rgb(240,235,221)' stroke-width='1.3' stroke-linecap='round'/><circle cx='5' cy='5' r='1.5' fill='rgb(45,182,163)' stroke='rgb(232,212,138)' stroke-width='0.5'/></g>
</svg>
```

**`cornerBR`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<g transform='translate(8,8) scale(-1,-1)'><path d='M0.8 7.4 C0.8 3.4 3.4 0.8 7.4 0.8' fill='none' stroke='rgb(240,235,221)' stroke-width='1.3' stroke-linecap='round'/><circle cx='5' cy='5' r='1.5' fill='rgb(45,182,163)' stroke='rgb(232,212,138)' stroke-width='0.5'/></g>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 7'>
<path d='M0 3.6 C5 0.6 15 0.6 20 3.6 S35 6.6 40 3.6' fill='none' stroke='rgb(168,150,92)' stroke-width='1'/><circle cx='10' cy='1.6' r='1.1' fill='rgb(45,182,163)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<path d='M56.4 14 C46 4 24 2 3 10 C20 8 36 12 54 19 Z' fill='rgb(232,212,138)'/>
<path d='M56 22 C46 28.6 28 31.4 10 28.6' fill='none' stroke='rgb(240,235,221)' stroke-width='1.4' stroke-linecap='round'/>
<circle cx='3' cy='10' r='1.4' fill='rgb(45,182,163)'/><circle cx='10' cy='28.6' r='1.3' fill='rgb(45,182,163)'/><ellipse cx='66' cy='17' rx='9.6' ry='14.4' fill='none' stroke='rgb(232,212,138)' stroke-width='1.5'/>
<path d='M66 4.6 L73.4 17 L66 29.4 L58.6 17 Z' fill='rgb(45,182,163)' stroke='rgb(232,212,138)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M66 4.6 L69.6 17 H66 Z M66 29.4 L62.4 17 H66 Z' fill='rgb(130,232,216)' fill-opacity='0.55'/><path d='M58.6 17 H73.4 M66 4.6 V29.4' stroke='rgb(18,86,84)' stroke-width='0.7'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M11 1.4 L17.8 11 L11 20.6 L4.2 11 Z' fill='rgb(45,182,163)' stroke='rgb(232,212,138)' stroke-width='1.3' stroke-linejoin='round'/>
<path d='M11 1.4 L14.4 11 H11 Z M11 20.6 L7.6 11 H11 Z' fill='rgb(130,232,216)' fill-opacity='0.6'/><path d='M4.2 11 H17.8 M11 1.4 V20.6' stroke='rgb(18,86,84)' stroke-width='0.7'/>
</svg>
```

### 4.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | `eldar-title` (2) | removed |
| 2 | `banner-pulse` (1) | removed |
| 3 | `eldar-runes` (1) | removed |
| 4 | `eldar-readout` (2) | removed |
| 5 | `eldar-border` (5) | removed |
| 6 | `eldar-motes` `#particles` (4) | removed |
| hover | none infinite (`tile-radial`, one-shot) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite warhammer-eldar.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 4.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#142030`, border `#233446` (1 px), radius 18px 4px 18px 4px, `::before` off; layout unchanged. Icons: `saturate(0.9) brightness(1.04)` through the cut plate (D in 3).
- **Hover:** fill `#182638`, border `#2DB6A3` (6.07:1 on the hover fill), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (6.51:1 on the tile, 7.27:1 on the grid ground). **Pressed:** base scale 0.96 on `#182638`.
- **Label:** `#F0EBDD`, Palatino Linotype italic 400, 12 px, 0.4 px, user case, no halo.
- **Filter chip:** base rule (fill `#182638`, `--accent-c` border, `#E8D48A` text). The header scene hides while it shows.
- **Edit bar:** `#2A1216` fill, `#E0483C` rule, label `#F58C7E`; `+ FILE` and `+ INSTALLED` in `--text` with a `#5A7A8E` border, `DONE` in `#F58C7E` with a `#E0483C` border. The tile remove button is `#B02A24` with a `#F0705F` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#0E1520`, panel `#15202C`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#E8D48A` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#E8D48A` text on `#142533` with a `#2DB6A3` rule.

### 4.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite warhammer-eldar.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#2DB6A3`) at y 37 to 40 with nothing below; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **145.28**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: #101A26 with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 4 strings; mock all fit at 424 and 640), the text box ending at x 320.
5. Hover shot (CALCULATOR): `#2DB6A3` border, `#182638` fill, the cut plate with no cropped glyph, no ellipsis on CALCULATOR (mock 54.9 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): no orange, no purple, no gold except the bone-gold of the crest, the swoops and the update bar; teal for the line, ring, hover and gems; ivory for curves; red only in edit mode and the remove button.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 7 px, frame 8 px, banner 3 px; at 640 x 420 7 / 8 / 11 px; at 1024 x 700 7 / 8 / 11 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Palatino Linotype`; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures.

**Expected squint score: 4** (title and banner text covered). What survives: a navy-black window with a rounded outline, a teal line, ivory waves and vines with teal gems along every edge, a winged crest with a gem in the header, a gem pendant with two swoops in the banner, leaf-shaped tiles. What is missing for a 5: the craftworld runes (marks, not drawn); a bundled thin display serif (Cormorant Garamond, a wish) would lift the type from stock Palatino italic.

Watch items for this theme: (1) The vine and the wave are the busiest art in the batch (two gems per 40 px on each side). They are 1.2 and 1 px lines at 90 percent opacity and measure 3 to 4 px from the focus ring; if Sergei finds them busy, drop the gems from the side tile (one number each).

---

## 5. warhammer-necrons (WARHAMMER 40K: NECRONS): DONE

**Audit:** score 3, tone down. Green on black in a sans was the same look as matrix and pip-boy, not a Necron: silver, bronze and tomb geometry were missing and the text was green, so the gauss glow never read against anything. A Monolith slab with a green eye sat under CALCULATOR, a roster printed left of NOTEPAD and PAINT, the readout crossed PAINT and FILES and the banner truncated. Six infinite animations.
**Direction:** **seam-lit tomb metal**: dark green-black metal, brushed-silver type, bronze trim and one colour of light. Gauss green appears only as seams (a bright line under the header, a line along the top course and the banner course, a line down each side conduit, the banner horizon), the focus ring and the hover border. The shapes are pyramids and a monolith: three pyramids with a seam in the header, pyramid notches in the top and banner courses, hexagonal nodes on the side conduits, a pyramid-and-obelisk skyline at the banner's right end, and a hexagonal node with a three-way seam for the banner icon. The window and the plates are cut at two opposite corners like a slab. Text is silver; green never carries a word. Static.

### 5.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
  --overlay-clip: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
  --bg: #070D0A;
  --panel-bg: #0F1813;
  --overlay-bg: #070D0A;
  --header-bg: #0B140F;
  --font: Bahnschrift, 'Segoe UI', sans-serif;
  --text: #BFC2B8;
  --text-dim: #8F968A;
  --accent-c: #2BD660;
  --accent-m: #D9A64E;
  --accent-y: #2BD660;
  --accent-text: #E1E5DA;
  --border: #26322A;
  --border-h: #2BD660;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #2BD660;
  --title-anim: none;
  --tile-hover-bg: #15221B;
  --tile-hover-border: #2BD660;
  --tile-hover-shadow: none;
  --tile-active-bg: #15221B;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.85) contrast(1.05);
  --tile-icon-shape: polygon(22% 0, 100% 0, 100% 78%, 78% 100%, 0 100%, 0 22%);
  --tile-label-spacing: 0.8px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #1B2C23;
  --btn-active-bg: #24392E;
  --drop-hint-border: #34463A;
  --drop-icon-color: #5A7266;
  --hint-sub-color: #8F968A;
  --rename-dashed: #2BD660;
  --rename-input-bg: #15221B;
  --edit-bar-bg: #241B0C;
  --edit-bar-border: #6E5A2E;
  --edit-label-color: #E6B85C;
  --edit-label-glow: none;
  --btn-done-color: #E6B85C;
  --btn-done-border: #8A7036;
  --btn-done-hover-bg: #3A2C12;
  --btn-done-hover-glow: none;
  --btn-add-border: #5A7266;
  --update-bg: #101C16;
  --update-border: #2BD660;
  --update-color: #E1E5DA;
  --update-btn-border: #2BD660;
  --update-btn-hover-bg: #1B2C23;
  --update-btn-hover-glow: none;
  --btn-close-color: #E1E5DA;
  --btn-close-border: #5A7266;
  --btn-close-hover-bg: #1B2C23;
  --btn-close-hover-glow: none;
  --picker-search-bg: #15221B;
  --picker-item-hover-bg: #15221B;
  --picker-item-active-bg: #1F3329;
  --picker-placeholder-bg: #15221B;
  --skin-btn-active-bg: #1F3329;
  --remove-btn-bg: #8A5A14;
  --remove-btn-border: #E6B85C;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#BFC2B8` on `#070D0A` | 4.5:1 | **10.85:1** |
| `--text-dim` on `--bg` | `#8F968A` on `#070D0A` | 4.5:1 | **6.44:1** |
| `--accent-c` on `--bg` | `#2BD660` on `#070D0A` | 3:1 | **10.17:1** |
| `--accent-text` on `--bg` | `#E1E5DA` on `#070D0A` | 3:1 | **15.33:1** |
| `--hint-sub-color` on `--bg` | `#8F968A` on `#070D0A` | 4.5:1 | **6.44:1** |
| `--btn-close-color` on `--panel-bg` | `#E1E5DA` on `#0F1813` | 4.5:1 | **14.15:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#BFC2B8` on `#111A15` | 4.5:1 | **9.83:1** |
| Tile label on tile hover | `#BFC2B8` on `#15221B` | 4.5:1 | **9.11:1** |
| Tile label on tile pressed (pressed state) | `#BFC2B8` on `#15221B` | 4.5:1 | **9.11:1** |
| Title on header | `#E1E5DA` on `#0B140F` | 4.5:1 | **14.65:1** |
| Title dot (`.accent`) on header | `#2BD660` on `#0B140F` | 4.5:1 | **9.71:1** |
| Header version on header | `#8F968A` on `#0B140F` | 4.5:1 | **6.15:1** |
| Header button glyph on header | `#BFC2B8` on `#0B140F` | 4.5:1 | **10.37:1** |
| Header button glyph on button hover | `#FFFFFF` on `#1B2C23` | 4.5:1 | **14.67:1** |
| Filter chip text on chip | `#E1E5DA` on `#15221B` | 4.5:1 | **12.86:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#15221B` | 4.5:1 | **16.45:1** |
| Banner text on banner | `#D5D8CE` on `#0B120F` | 4.5:1 | **13.13:1** |
| Header line on header (non-text) | `#2BD660` on `#0B140F` | 3:1 | **9.71:1** |
| Edit label on edit bar | `#E6B85C` on `#241B0C` | 4.5:1 | **9.20:1** |
| Done / close button text on edit bar | `#E6B85C` on `#241B0C` | 4.5:1 | **9.20:1** |
| + FILE / + INSTALLED text on edit bar | `#BFC2B8` on `#241B0C` | 4.5:1 | **9.40:1** |
| Done button text on its hover fill | `#E6B85C` on `#3A2C12` | 4.5:1 | **7.34:1** |
| Settings text on overlay | `#BFC2B8` on `#070D0A` | 4.5:1 | **10.85:1** |
| Settings text on panel | `#BFC2B8` on `#0F1813` | 4.5:1 | **10.02:1** |
| Settings label (text-dim) on panel | `#8F968A` on `#0F1813` | 4.5:1 | **5.94:1** |
| Settings value / cheat key (accent-text) on panel | `#E1E5DA` on `#0F1813` | 4.5:1 | **14.15:1** |
| Settings version value (accent-text) on panel | `#E1E5DA` on `#0F1813` | 4.5:1 | **14.15:1** |
| Settings CLOSE text on panel | `#E1E5DA` on `#0F1813` | 4.5:1 | **14.15:1** |
| Settings CLOSE text on its hover fill | `#E1E5DA` on `#1B2C23` | 4.5:1 | **11.47:1** |
| Hotkey error text (accent-m) on panel | `#D9A64E` on `#0F1813` | 4.5:1 | **8.20:1** |
| Hotkey input text on input fill | `#E1E5DA` on `#15221B` | 4.5:1 | **12.86:1** |
| Picker row text on hover fill | `#E1E5DA` on `#15221B` | 4.5:1 | **12.86:1** |
| Update banner text on update bar | `#E1E5DA` on `#101C16` | 4.5:1 | **13.69:1** |
| Update button text on hover fill | `#FFFFFF` on `#1B2C23` | 4.5:1 | **14.67:1** |
| Drop-hint text (text-dim) on grid ground | `#8F968A` on `#070D0A` | 4.5:1 | **6.44:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#8A5A14` | 3:1 | **5.91:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#8A5A14` | 3:1 | **5.91:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#2BD660` on `#111A15` | 3:1 | **9.21:1** |
| Focus ring on grid ground (non-text) | `#2BD660` on `#070D0A` | 3:1 | **10.17:1** |
| Hover border on grid ground (non-text) | `#2BD660` on `#070D0A` | 3:1 | **10.17:1** |
| Hover border on hover fill (non-text) | `#2BD660` on `#15221B` | 3:1 | **8.53:1** |
| Theme-picker selected row text (accent-text) on active fill | `#E1E5DA` on `#1F3329` | 4.5:1 | **10.50:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#E1E5DA` on `#15221B` | 4.5:1 | **12.86:1** |
| Skin search input text (accent-text) on panel | `#E1E5DA` on `#0F1813` | 4.5:1 | **14.15:1** |
| Apps-picker search input text (accent-text) on search fill | `#E1E5DA` on `#15221B` | 4.5:1 | **12.86:1** |
| Rename input text (accent-text) on input fill | `#E1E5DA` on `#15221B` | 4.5:1 | **12.86:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#8F968A` on `#15221B` | 4.5:1 | **5.40:1** |
| Skin search placeholder (text-dim, themed) on panel | `#8F968A` on `#0F1813` | 4.5:1 | **5.94:1** |
| Apps-picker placeholder (text-dim) on search fill | `#8F968A` on `#15221B` | 4.5:1 | **5.40:1** |
| Hotkey recording text (accent-m) on input fill | `#D9A64E` on `#15221B` | 4.5:1 | **7.45:1** |
| Update dismiss glyph (text-dim) on update bar | `#8F968A` on `#101C16` | 4.5:1 | **5.75:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#8F968A` on `#0F1813` | 3:1 | **5.94:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#2BD660` on `#0F1813` | 3:1 | **9.39:1** |

**Lowest ratio in this theme: 5.40:1 (Hotkey placeholder (text-dim, themed) on input fill).** Lowest text ratio: 5.40:1 (Hotkey placeholder (text-dim, themed) on input fill). Lowest non-text ratio: 5.91:1 (Remove glyph on remove button (non-text)). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (`saturate(0.85) contrast(1.05)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#111A15` | Hover `#15221B` | Pressed `#15221B` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5E7EA1` | 4.21:1 | 3.90:1 | 3.90:1 | pass |
| Calculator `#6b6f76` | `#6B6E74` | 3.47:1 | 3.22:1 | 3.22:1 | pass |
| Paint `#b07a4f` | `#AB7B55` | 4.82:1 | 4.46:1 | 4.46:1 | pass |
| Terminal `#3d4450` | `#3B414C` | 1.73:1 | 1.60:1 | 1.60:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#548989` | 4.50:1 | 4.16:1 | 4.16:1 | pass |
| Files `#c09a3e` | `#BD9C49` | 6.78:1 | 6.28:1 | 6.28:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.22:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Gauss green `#2BD660` is `--accent-c` (10.17:1) but it is used only for lines, the ring and the hover border; `--accent-text` is silver-white `#E1E5DA`. The edit colour is bronze `#E6B85C` text on `#241B0C`, because gold on tomb metal is the "too much Egyptian gold" pitfall only when it is large; here it is one label and three button borders. The header line is two-tone: a 1 px bright seam at the bottom and a 2 px dim green `#145A2E` above it (still one 3 px line inside the header).

### 5.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | Bahnschrift, 'Segoe UI', sans-serif |
| `#title` | Bahnschrift 600, `font-stretch: 87.5%`, 12 px, tracking 4 px, uppercase from the markup |
| `.tile-label` | Bahnschrift 600 SemiCondensed, 12 px, 0.8 px, uppercase |
| `#theme-banner-text` | Bahnschrift 600 SemiCondensed, 11 px, 1 px, uppercase |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 128.77** (gate 156; 27.2 px under, 39.2 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 49.0, CALCULATOR 68.2, PAINT 31.5, TERMINAL 53.8, BROWSER 51.9, FILES 30.3 px, no ellipsis. Tile height 95.39 px (94.7 to 95.4 required). Banner lines: see 0.8. **Platform fonts the mock used:** title Bahnschrift x12; labels Bahnschrift x7; banner Bahnschrift x28; version and settings Bahnschrift x7. Expected `fontsRendered` for the web faces: none (stock only).

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Bahnschrift covers it (checked).

### 5.3 Art (tone down with a new frame). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { border-bottom-color: #2BD660; box-shadow: inset 0 -2px 0 #145A2E; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #2BD660; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a tomb panel (x 168 to 252, y 10 to 30): three dark pyramids with silver edges, a bronze cap on the tall one, green seams from the apexes and down the faces, a green horizon line. Painted pixels at x 168.0 to 252.0, y 11.5 to 30.0. Hidden while the chip shows. The title ends at x 128.8, the scene starts at x 168: 39.2 px clear.

**B. Frame (the kit of 0.3).** a seam line (3 px, bright at the bottom) under the header, then a **seam and a row of inverted pyramid notches** with bronze rivets in the top course (32 px period); down both sides a **conduit strip** (dark metal, bronze edge lines, a green seam down the middle, a hexagonal node every 24 px); each corner is a triangular wedge with a green dot, mirrored to its corner. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 11 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner is `#0B120F` with a 1 px green seam as its top border; its top course is a seam over **up-pointing pyramid notches** (32 px period); the icon is a hexagonal node (silver outline, a green three-way seam); the right end is a **tomb skyline** (two pyramids and a tapering obelisk with a bronze cap, green seams, a green horizon). The motif's painted pixels are at x 328.0 to 412.0, y 268.9 to 300.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 98.2 px (0.8). The banner row of the probe reads 3 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: two opposite chamfers: top-left and bottom-right 14 px. `--overlay-clip` is the same. Tiles: plates are **notched slabs** (`polygon(22% 0, 100% 0, 100% 78%, 78% 100%, 0 100%, 0 22%)`, two opposite 22 percent chamfers). Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 11.96, Calculator 10.13, Paint 11.13, Terminal 8.25, Browser 11.63, Files 9.31 (smallest 8.25); nothing is cropped.

**Trademark note.** No Necron glyph, no Monolith, no scarab swarm, no staff. Pyramids, an obelisk and a hexagon with seams are generic tomb and sci-fi forms.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #8A5A14; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { border-bottom-color: #2BD660; box-shadow: inset 0 -2px 0 #145A2E; }
#header::before { background: #2BD660; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-weight: 600; font-stretch: 87.5%; font-style: normal; line-height: 1.2; font-size: 12px; letter-spacing: 4px; color: #E1E5DA; text-shadow: none; }
#title .accent { color: #2BD660; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNERTL@ left 1px top 0 / 8px 8px no-repeat,
    @CORNERTR@ right 5px top 0 / 8px 8px no-repeat,
    @CORNERBL@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNERBR@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 24px repeat-y,
    @SIDE@ right 5px top 0 / 8px 24px repeat-y,
    @TOP@ left 0 top 0 / 32px 9px repeat-x;
}

/* tiles */
.app-tile { background: #111A15; border-color: #223028; border-radius: 0px; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-stretch: 87.5%; }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 32px 7px repeat-x, #0B120F;
  border-top-color: #2BD660;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-size: 11px; font-weight: 600; font-stretch: 87.5%; letter-spacing: 1px; text-transform: uppercase; color: #D5D8CE; margin-right: 90px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CORNERTL@` | `cornerTL` |
| `@CORNERTR@` | `cornerTR` |
| `@CORNERBL@` | `cornerBL` |
| `@CORNERBR@` | `cornerBR` |
| `@SIDE@` | `side` |
| `@TOP@` | `top` |
| `@MOTIF@` | `motif` |
| `@BTOP@` | `btop` |
| `@ICON@` | `icon` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#g)` in the Tyranid SVGs):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<path d='M3 18 L16 9.6 L29 18 Z' fill='rgb(30,44,38)' stroke='rgb(112,118,108)' stroke-width='0.8' stroke-linejoin='round'/><path d='M55 18 L68 9.6 L81 18 Z' fill='rgb(30,44,38)' stroke='rgb(112,118,108)' stroke-width='0.8' stroke-linejoin='round'/>
<path d='M24 18 L42 2 L60 18 Z' fill='rgb(30,44,38)' stroke='rgb(183,185,176)' stroke-width='0.9' stroke-linejoin='round'/><path d='M42 2 L45.2 4.9 H38.8 Z' fill='rgb(176,144,72)'/>
<path d='M42 5 V18 M42 8 L34.4 18 M42 8 L49.6 18 M16 11.4 V18 M68 11.4 V18' stroke='rgb(43,214,96)' stroke-width='0.9' fill='none'/><circle cx='42' cy='11.6' r='1.1' fill='rgb(43,214,96)'/>
<rect x='0' y='18' width='84' height='1.1' fill='rgb(43,214,96)'/><rect x='0' y='19.1' width='84' height='0.9' fill='rgb(18,110,52)'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 9'>
<rect width='32' height='1.2' fill='rgb(43,214,96)'/><rect y='1.2' width='32' height='0.8' fill='rgb(18,110,52)'/>
<path d='M2 2 H10 L6 7.6 Z M18 2 H26 L22 7.6 Z' fill='rgb(30,44,38)' stroke='rgb(112,118,108)' stroke-width='0.7' stroke-linejoin='round'/>
<circle cx='14.2' cy='4.2' r='1' fill='rgb(176,144,72)'/><circle cx='30.2' cy='4.2' r='1' fill='rgb(176,144,72)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect width='8' height='24' fill='rgb(30,44,38)'/><rect x='0' width='1' height='24' fill='rgb(110,90,46)'/><rect x='7' width='1' height='24' fill='rgb(110,90,46)'/>
<rect x='3.5' width='1' height='24' fill='rgb(43,214,96)'/><rect x='3' width='2' height='24' fill='rgb(43,214,96)' fill-opacity='0.25'/>
<polygon points='4,8.6 6.8,10.3 6.8,13.7 4,15.4 1.2,13.7 1.2,10.3' fill='rgb(30,44,38)' stroke='rgb(43,214,96)' stroke-width='0.8'/><circle cx='4' cy='12' r='1' fill='rgb(43,214,96)'/>
</svg>
```

**`cornerTL`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<path d='M0.6 7.4 V0.6 H7.4 Z' fill='rgb(30,44,38)' stroke='rgb(112,118,108)' stroke-width='0.8' stroke-linejoin='round'/><circle cx='2.3' cy='2.3' r='0.9' fill='rgb(43,214,96)'/>
</svg>
```

**`cornerTR`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<g transform='translate(8,0) scale(-1,1)'><path d='M0.6 7.4 V0.6 H7.4 Z' fill='rgb(30,44,38)' stroke='rgb(112,118,108)' stroke-width='0.8' stroke-linejoin='round'/><circle cx='2.3' cy='2.3' r='0.9' fill='rgb(43,214,96)'/></g>
</svg>
```

**`cornerBL`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<g transform='translate(0,8) scale(1,-1)'><path d='M0.6 7.4 V0.6 H7.4 Z' fill='rgb(30,44,38)' stroke='rgb(112,118,108)' stroke-width='0.8' stroke-linejoin='round'/><circle cx='2.3' cy='2.3' r='0.9' fill='rgb(43,214,96)'/></g>
</svg>
```

**`cornerBR`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<g transform='translate(8,8) scale(-1,-1)'><path d='M0.6 7.4 V0.6 H7.4 Z' fill='rgb(30,44,38)' stroke='rgb(112,118,108)' stroke-width='0.8' stroke-linejoin='round'/><circle cx='2.3' cy='2.3' r='0.9' fill='rgb(43,214,96)'/></g>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 7'>
<rect width='32' height='1' fill='rgb(43,214,96)'/><rect y='1' width='32' height='0.8' fill='rgb(18,110,52)'/>
<path d='M3 7 L8 2.6 L13 7 Z M19 7 L24 2.6 L29 7 Z' fill='rgb(30,44,38)' stroke='rgb(112,118,108)' stroke-width='0.7' stroke-linejoin='round'/><circle cx='8' cy='3.6' r='0.8' fill='rgb(43,214,96)'/><circle cx='24' cy='3.6' r='0.8' fill='rgb(43,214,96)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<path d='M4 32 L20 16.4 L36 32 Z' fill='rgb(30,44,38)' stroke='rgb(112,118,108)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M26 32 L50 9.6 L74 32 Z' fill='rgb(30,44,38)' stroke='rgb(183,185,176)' stroke-width='1' stroke-linejoin='round'/>
<path d='M70.4 32 L71.6 9 L74 3.4 L76.4 9 L77.6 32 Z' fill='rgb(70,90,80)' stroke='rgb(183,185,176)' stroke-width='0.9' stroke-linejoin='round'/><path d='M74 3.4 L76 6.4 H72 Z' fill='rgb(176,144,72)'/>
<path d='M50 12 V32 M50 15 L40 32 M50 15 L60 32 M20 19 V32 M74 9 V32' stroke='rgb(43,214,96)' stroke-width='1' fill='none'/><circle cx='50' cy='20.4' r='1.3' fill='rgb(43,214,96)'/>
<rect x='0' y='32' width='84' height='1.1' fill='rgb(43,214,96)'/><rect x='0' y='33.1' width='84' height='0.9' fill='rgb(18,110,52)'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<polygon points='11,1.4 19.4,6.2 19.4,15.8 11,20.6 2.6,15.8 2.6,6.2' fill='rgb(30,44,38)' stroke='rgb(183,185,176)' stroke-width='1.3' stroke-linejoin='round'/>
<path d='M11 11 V4.6 M11 11 L16.6 14.2 M11 11 L5.4 14.2' stroke='rgb(43,214,96)' stroke-width='1.4' stroke-linecap='round' fill='none'/><circle cx='11' cy='11' r='1.9' fill='rgb(43,214,96)'/>
</svg>
```

### 5.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | `necron-title` (2) | removed |
| 2 | `banner-pulse` (1) | removed |
| 3 | `necron-monolith` (1) | removed |
| 4 | `necron-readout` (2) | removed |
| 5 | `necron-border` (5) | removed |
| 6 | `necron-motes` `#particles` (4) | removed |
| hover | none infinite (`tile-scan-v`, one-shot) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite warhammer-necrons.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 5.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#111A15`, border `#223028` (1 px), radius 0px, `::before` off; layout unchanged. Icons: `saturate(0.85) contrast(1.05)` through the cut plate (D in 3).
- **Hover:** fill `#15221B`, border `#2BD660` (8.53:1 on the hover fill), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (9.21:1 on the tile, 10.17:1 on the grid ground). **Pressed:** base scale 0.96 on `#15221B`.
- **Label:** `#BFC2B8`, Bahnschrift 600 SemiCondensed, 12 px, 0.8 px, uppercase, no halo.
- **Filter chip:** base rule (fill `#15221B`, `--accent-c` border, `#E1E5DA` text). The header scene hides while it shows.
- **Edit bar:** `#241B0C` fill, `#6E5A2E` rule, label `#E6B85C`; `+ FILE` and `+ INSTALLED` in `--text` with a `#5A7266` border, `DONE` in `#E6B85C` with a `#8A7036` border. The tile remove button is `#8A5A14` with a `#E6B85C` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#070D0A`, panel `#0F1813`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#E1E5DA` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#E1E5DA` text on `#101C16` with a `#2BD660` rule.

### 5.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite warhammer-necrons.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#2BD660`) at y 37 to 40 with nothing below; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **128.77**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: #0B120F with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 5 strings; mock all fit at 424 and 640), the text box ending at x 320.
5. Hover shot (CALCULATOR): `#2BD660` border, `#15221B` fill, the cut plate with no cropped glyph, no ellipsis on CALCULATOR (mock 68.2 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): green only as seams, the ring, the hover border and the slider; silver for type; bronze only for the rivets, the cap, the edge lines and the edit mode; no purple, blue or red.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 11 px, frame 8 px, banner 3 px; at 640 x 420 11 / 8 / 11 px; at 1024 x 700 11 / 8 / 11 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `Bahnschrift`; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures.

**Expected squint score: 4** (title and banner text covered). What survives: a green-black window outlined by green seam lines on every edge, pyramid shapes in the header and the banner, hex nodes down both sides, chamfered tiles, silver type, a bronze trim. What is missing for a 5: the Necron glyphs (marks, not drawn); a bundled angular sci-fi face (Oxanium or Orbitron, wishes) would replace Bahnschrift.

Watch items for this theme: (1) The hexagon with a three-way seam can read as an isometric cube at 22 px. It still says "tomb node" next to the pyramid skyline; if Sergei sees a cube, swap the icon for the single pyramid with the eye removed (a pyramid alone, no eye, so it does not read as swl-illuminati's eye in a triangle).

---

## 6. warhammer (WARHAMMER 40K: IMPERIUM): DONE

**Audit:** score 3, tone down. Gold on black with cut window corners was the right instinct, but there was no parchment or weathering. A Blood Angels dossier (SEGMENTUM SOLAR, SANGUINIUS) printed in microtext beside every tile, an eagle ring sat behind CALCULATOR, the corrupted readout ("OMNIS(R)RCANUM") crossed PAINT, Georgia caps read as generic old book, and the shield-crop icons had no link to the game. Six infinite animations.
**Direction:** **gothic gold and parchment**. A cathedral in flat parts: black ground, gold line-work, a **blind arcade of pointed arches** under the header, **stone piers with lancet niches of red glass** down both sides, gilded corner caps. The header carries two purity seals (wax discs on swallow-tailed parchment strips) hung from a gold rail with a lancet between them. The banner is an **aged-parchment strip** with ink type, a wax seal on a hanging strip for its icon and a **triple-lancet window** at its right end. Gold carries the chrome, parchment carries the text, red appears only in the seals, the glass and edit mode. The window is an octagon (14 px chamfers); plates are lancet-arch crowned. No eagle, no skull, no chapter heraldry, no text in any SVG. Static.

### 6.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: polygon(0 14px, 14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px));
  --overlay-clip: polygon(0 14px, 14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px));
  --bg: #0E0C0A;
  --panel-bg: #16120D;
  --overlay-bg: #0E0C0A;
  --header-bg: #17120C;
  --font: 'Palatino Linotype', Palatino, Georgia, serif;
  --text: #D9C9A1;
  --text-dim: #A8996F;
  --accent-c: #C79A2C;
  --accent-m: #E2615A;
  --accent-y: #C79A2C;
  --accent-text: #E6C566;
  --border: #3A2E18;
  --border-h: #C79A2C;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #C79A2C;
  --title-anim: none;
  --tile-hover-bg: #1D1710;
  --tile-hover-border: #C79A2C;
  --tile-hover-shadow: none;
  --tile-active-bg: #1D1710;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: sepia(0.15) saturate(0.9) contrast(1.05);
  --tile-icon-shape: polygon(0 26%, 6% 14%, 50% 0, 94% 14%, 100% 26%, 100% 100%, 0 100%);
  --tile-label-spacing: 0.6px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 500;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #2A2012;
  --btn-active-bg: #382B17;
  --drop-hint-border: #4A3C1E;
  --drop-icon-color: #7C6A3A;
  --hint-sub-color: #A8996F;
  --rename-dashed: #C79A2C;
  --rename-input-bg: #1D1710;
  --edit-bar-bg: #2B0E0D;
  --edit-bar-border: #B0181B;
  --edit-label-color: #EE857C;
  --edit-label-glow: none;
  --btn-done-color: #EE857C;
  --btn-done-border: #B0181B;
  --btn-done-hover-bg: #451514;
  --btn-done-hover-glow: none;
  --btn-add-border: #7C6A3A;
  --update-bg: #1E1810;
  --update-border: #8A6E2C;
  --update-color: #E6C566;
  --update-btn-border: #8A6E2C;
  --update-btn-hover-bg: #33281A;
  --update-btn-hover-glow: none;
  --btn-close-color: #E6C566;
  --btn-close-border: #8A6E2C;
  --btn-close-hover-bg: #33281A;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1D1710;
  --picker-item-hover-bg: #1D1710;
  --picker-item-active-bg: #2A2012;
  --picker-placeholder-bg: #1D1710;
  --skin-btn-active-bg: #2A2012;
  --remove-btn-bg: #A01418;
  --remove-btn-border: #E2615A;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; the real script ran on the prototype: 0 errors):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| `--text` on `--bg` | `#D9C9A1` on `#0E0C0A` | 4.5:1 | **11.92:1** |
| `--text-dim` on `--bg` | `#A8996F` on `#0E0C0A` | 4.5:1 | **6.93:1** |
| `--accent-c` on `--bg` | `#C79A2C` on `#0E0C0A` | 3:1 | **7.52:1** |
| `--accent-text` on `--bg` | `#E6C566` on `#0E0C0A` | 3:1 | **11.66:1** |
| `--hint-sub-color` on `--bg` | `#A8996F` on `#0E0C0A` | 4.5:1 | **6.93:1** |
| `--btn-close-color` on `--panel-bg` | `#E6C566` on `#16120D` | 4.5:1 | **11.13:1** |

**Add-on pairs** (each text or control colour on its real surface, true cascade; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#D9C9A1` on `#17130E` | 4.5:1 | **11.29:1** |
| Tile label on tile hover | `#D9C9A1` on `#1D1710` | 4.5:1 | **10.84:1** |
| Tile label on tile pressed (pressed state) | `#D9C9A1` on `#1D1710` | 4.5:1 | **10.84:1** |
| Title on header | `#E6C566` on `#17120C` | 4.5:1 | **11.12:1** |
| Title dot (`.accent`) on header | `#E2615A` on `#17120C` | 4.5:1 | **5.40:1** |
| Header version on header | `#A8996F` on `#17120C` | 4.5:1 | **6.60:1** |
| Header button glyph on header | `#D9C9A1` on `#17120C` | 4.5:1 | **11.36:1** |
| Header button glyph on button hover | `#FFFFFF` on `#2A2012` | 4.5:1 | **15.98:1** |
| Filter chip text on chip | `#E6C566` on `#1D1710` | 4.5:1 | **10.61:1** |
| Filter chip clear glyph on hover (white) on chip | `#FFFFFF` on `#1D1710` | 4.5:1 | **17.76:1** |
| Banner text on banner | `#1C1309` on `#C8B78A` | 4.5:1 | **9.24:1** |
| Header line on header (non-text) | `#C79A2C` on `#17120C` | 3:1 | **7.17:1** |
| Edit label on edit bar | `#EE857C` on `#2B0E0D` | 4.5:1 | **7.07:1** |
| Done / close button text on edit bar | `#EE857C` on `#2B0E0D` | 4.5:1 | **7.07:1** |
| + FILE / + INSTALLED text on edit bar | `#D9C9A1` on `#2B0E0D` | 4.5:1 | **10.94:1** |
| Done button text on its hover fill | `#EE857C` on `#451514` | 4.5:1 | **6.04:1** |
| Settings text on overlay | `#D9C9A1` on `#0E0C0A` | 4.5:1 | **11.92:1** |
| Settings text on panel | `#D9C9A1` on `#16120D` | 4.5:1 | **11.38:1** |
| Settings label (text-dim) on panel | `#A8996F` on `#16120D` | 4.5:1 | **6.61:1** |
| Settings value / cheat key (accent-text) on panel | `#E6C566` on `#16120D` | 4.5:1 | **11.13:1** |
| Settings version value (accent-text) on panel | `#E6C566` on `#16120D` | 4.5:1 | **11.13:1** |
| Settings CLOSE text on panel | `#E6C566` on `#16120D` | 4.5:1 | **11.13:1** |
| Settings CLOSE text on its hover fill | `#E6C566` on `#33281A` | 4.5:1 | **8.60:1** |
| Hotkey error text (accent-m) on panel | `#E2615A` on `#16120D` | 4.5:1 | **5.41:1** |
| Hotkey input text on input fill | `#E6C566` on `#1D1710` | 4.5:1 | **10.61:1** |
| Picker row text on hover fill | `#E6C566` on `#1D1710` | 4.5:1 | **10.61:1** |
| Update banner text on update bar | `#E6C566` on `#1E1810` | 4.5:1 | **10.51:1** |
| Update button text on hover fill | `#FFFFFF` on `#33281A` | 4.5:1 | **14.39:1** |
| Drop-hint text (text-dim) on grid ground | `#A8996F` on `#0E0C0A` | 4.5:1 | **6.93:1** |
| Remove glyph on remove button (non-text) | `#FFFFFF` on `#A01418` | 3:1 | **8.05:1** |
| Remove glyph on remove button hover fill (non-text) | `#FFFFFF` on `#A01418` | 3:1 | **8.05:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#C79A2C` on `#17130E` | 3:1 | **7.12:1** |
| Focus ring on grid ground (non-text) | `#C79A2C` on `#0E0C0A` | 3:1 | **7.52:1** |
| Hover border on grid ground (non-text) | `#C79A2C` on `#0E0C0A` | 3:1 | **7.52:1** |
| Hover border on hover fill (non-text) | `#C79A2C` on `#1D1710` | 3:1 | **6.84:1** |
| Theme-picker selected row text (accent-text) on active fill | `#E6C566` on `#2A2012` | 4.5:1 | **9.55:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#E6C566` on `#1D1710` | 4.5:1 | **10.61:1** |
| Skin search input text (accent-text) on panel | `#E6C566` on `#16120D` | 4.5:1 | **11.13:1** |
| Apps-picker search input text (accent-text) on search fill | `#E6C566` on `#1D1710` | 4.5:1 | **10.61:1** |
| Rename input text (accent-text) on input fill | `#E6C566` on `#1D1710` | 4.5:1 | **10.61:1** |
| Hotkey placeholder (text-dim, themed) on input fill | `#A8996F` on `#1D1710` | 4.5:1 | **6.30:1** |
| Skin search placeholder (text-dim, themed) on panel | `#A8996F` on `#16120D` | 4.5:1 | **6.61:1** |
| Apps-picker placeholder (text-dim) on search fill | `#A8996F` on `#1D1710` | 4.5:1 | **6.30:1** |
| Hotkey recording text (accent-m) on input fill | `#E2615A` on `#1D1710` | 4.5:1 | **5.15:1** |
| Update dismiss glyph (text-dim) on update bar | `#A8996F` on `#1E1810` | 4.5:1 | **6.24:1** |
| Settings scrollbar thumb (text-dim) on panel (non-text) | `#A8996F` on `#16120D` | 3:1 | **6.61:1** |
| Slider and checkbox accent (accent-c) on panel (non-text) | `#C79A2C` on `#16120D` | 3:1 | **7.18:1** |

**Lowest ratio in this theme: 5.15:1 (Hotkey recording text (accent-m) on input fill).** Lowest text ratio: 5.15:1 (Hotkey recording text (accent-m) on input fill). Lowest non-text ratio: 6.61:1 (Settings scrollbar thumb (text-dim) on panel (non-text)). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (`sepia(0.15) saturate(0.9) contrast(1.05)`; mock plates from the gallery):

| Icon plate (mock) | After fx | Rest `#17130E` | Hover `#1D1710` | Pressed `#1D1710` | Needs 3:1 |
|---|---|---|---|---|---|
| Notepad `#5b7fa6` | `#67829C` | 4.62:1 | 4.44:1 | 4.44:1 | pass |
| Calculator `#6b6f76` | `#717273` | 3.84:1 | 3.68:1 | 3.68:1 | pass |
| Paint `#b07a4f` | `#AE8059` | 5.31:1 | 5.10:1 | 5.10:1 | pass |
| Terminal `#3d4450` | `#3F434A` | 1.86:1 | 1.79:1 | 1.79:1 | excluded (app art baseline, B1 0.1.8) |
| Browser `#4f8a8b` | `#5E8B87` | 4.86:1 | 4.67:1 | 4.67:1 | pass |
| Files `#c09a3e` | `#C2A050` | 7.43:1 | 7.14:1 | 7.14:1 | pass |

Lowest non-Terminal icon ratio over rest, hover and pressed: **3.68:1** (pass). Terminal (the mock plate is dark art) is excluded, as in every earlier batch.

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.

Notes: Gold `#C79A2C` is `--accent-c` (7.52:1), bright gold `#E6C566` is `--accent-text` and the title. Parchment text is `#D9C9A1`. The banner parchment is `#C8B78A` (the audit's `#D9C9A1`, one step down) with ink `#1C1309`; it is the brightest surface of the batch (see watch item 1). Crimson `#B0181B` is the edit-bar rule and a fill; the text variants are `#EE857C` and `#E2615A`.

### 6.2 Type

| Role | Stack and settings |
|---|---|
| Body, settings, pickers, version (`--font`) | 'Palatino Linotype', Palatino, Georgia, serif |
| `#title` | **UnifrakturCook 700**, 12 px, tracking 3 px, **lowercase** (reads `quick.launch`) |
| `.tile-label` | **Cinzel 500**, 12 px, 0.6 px, uppercase |
| `#theme-banner-text` | **IM Fell English 400**, 12 px, no tracking, sentence case, `font-style: normal` |

Measured on the mock with the real fonts (Foundation B2 rules 5 to 7): the title text box ends at **x 99.44** (gate 156; 56.6 px under, 68.6 px clear of the header art at 168), identical at 424 x 300, 640 x 420 and 1024 x 700. The six standard labels in the 100 px box (ink widths): NOTEPAD 63.5, CALCULATOR 89.5, PAINT 40.0, TERMINAL 68.7, BROWSER 62.6, FILES 34.0 px, no ellipsis. Tile height 95.39 px (94.7 to 95.4 required). Banner lines: see 0.8. **Platform fonts the mock used:** title UnifrakturCook (web) x12; labels Cinzel (web) x7; banner IM FELL English (web) x28; version and settings Palatino Linotype x7. Expected `fontsRendered` for the web faces: UnifrakturCook, Cinzel, IM Fell English.

**Ladder if Electron measures over 156:** tracking down 1 px at a time to 1 px, then 11 px (Foundation B2 rule 5). **Cyrillic:** Cinzel has none; Cyrillic tile names fall to Palatino Linotype glyph by glyph (checked, no missing-glyph boxes).

### 6.3 Art (tone down with a new frame). Static, original, inline SVG data URIs

Delete: the painted panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub, the `#app` animation, the legacy `#app::after` layers and the tile hover animation (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header.** `#header { border-bottom-color: #C79A2C; box-shadow: inset 0 -2px 0 #C79A2C; }`: a 3 px line inside the header (y 37 to 40; nothing below). `#header::before { background: #C79A2C; box-shadow: none; }` **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): a gold rail (x 168 to 252, y 10 to 30) with a gold finial at each end, two purity seals (red wax disc, parchment strip with a swallow tail) at x 187 and 233, and a gold lancet with red glass between them. Painted pixels at x 168.6 to 251.4, y 10.0 to 29.8. Hidden while the chip shows. The title ends at x 99.4, the scene starts at x 168: 68.6 px clear.

**B. Frame (the kit of 0.3).** a gold line (3 px) under the header, then a **blind arcade** (12 px pointed arches with a gold dot, a gold hairline above) in the top course; down both sides a **pier** (dark stone, gold edge lines, a pointed niche of red glass with a gold outline and two gold studs every 24 px); each corner is a stone cap with a gold diamond. Measured art-to-content distances (distance transform, px) on the mock at 424 x 300: the header art is 10 from the nearest content (title, version or button; the accent bar counts as art), the frame art 8 from the tiles and 4 from a first-column focus ring (3 empty pixels), 4 from a last-column ring (4 at 640 x 420 and 4 at 1024 x 700).

**C. Banner.** the banner is parchment `#C8B78A` with a 1 px dark-gold top border; its top course is a double gold rule with a red diamond every 14 px; the icon is a red wax seal on a hanging parchment strip; the right end is a **triple-lancet window** (ink stone, gold outline, red glass either side, gold glass in the tall centre) on a plinth. Banner text is ink on parchment. The motif's painted pixels are at x 330.0 to 410.0, y 267.1 to 300.0 (424 x 300); the text box ends at x 320. Widest banner line to the motif's first painted pixel: 40.8 px (0.8). The banner row of the probe reads 3 px at 424 x 300: that is the top course against the last partly visible tile row, which meets by construction, not the text.

**D. Window and tiles.** Window: an octagon with 14 px chamfers on all four corners. `--overlay-clip` is the same. Tiles: plates are **lancet-arch crowned** (`polygon(0 26%, 6% 14%, 50% 0, 94% 14%, 100% 26%, 100% 100%, 0 100%)`: shoulders at 26 percent, apex at the centre). Plate margins (computed against the mock glyph geometry, px, at the 64 px icon size; the margin is the distance from the nearest glyph pixel to the cut): Notepad 7.65, Calculator 5.74, Paint 10.18, Terminal 7.43, Browser 9.94, Files 11.13 (smallest 5.74); nothing is cropped.

**Trademark note.** The Aquila (double-headed eagle), the skull, the cog-skull, the chapter badges and the Imperial Fists/Blood Angels heraldry are not drawn. Pointed arches, lancets, a wax seal and a parchment strip are generic gothic and scribal parts; the seal carries no emblem.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2: `<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A01418; }
.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 3 px line inside it, the faction's emblem in the art zone */
#header { border-bottom-color: #C79A2C; box-shadow: inset 0 -2px 0 #C79A2C; }
#header::before { background: #C79A2C; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'UnifrakturCook', 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 700; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 12px; letter-spacing: 3px; text-transform: lowercase; color: #E6C566; text-shadow: none; }
#title .accent { color: #E2615A; }

/* frame: four corner caps over two side strips over a top course (all inside the 8 px bands) */
#grid-container {
  background:
    @CORNER@ left 1px top 0 / 8px 8px no-repeat,
    @CORNER@ right 5px top 0 / 8px 8px no-repeat,
    @CORNER@ left 1px bottom 0 / 8px 8px no-repeat,
    @CORNER@ right 5px bottom 0 / 8px 8px no-repeat,
    @SIDE@ left 1px top 0 / 8px 24px repeat-y,
    @SIDE@ right 5px top 0 / 8px 24px repeat-y,
    @TOP@ left 0 top 0 / 12px 9px repeat-x;
}

/* tiles */
.app-tile { background: #17130E; border-color: #33291A; border-radius: 0px; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif; font-synthesis: none; }

/* banner: surface, a top course, the faction's big motif at the right end, an icon at the left */
#theme-banner {
  background: @MOTIF@ right 12px bottom 0 / 84px 34px no-repeat, @BTOP@ left 0 top 0 / 14px 6px repeat-x, #C8B78A;
  border-top-color: #8A6E2C;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @ICON@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'IM Fell English', Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 400; font-style: normal; font-synthesis: none; letter-spacing: 0; color: #1C1309; margin-right: 90px; }
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

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`, no `<animate>`; the only `#` is the gradient reference `url(#g)` in the Tyranid SVGs):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<rect x='3' y='1' width='78' height='1.4' fill='rgb(122,92,24)'/><circle cx='2.4' cy='1.7' r='1.7' fill='rgb(199,154,44)'/><circle cx='81.6' cy='1.7' r='1.7' fill='rgb(199,154,44)'/>
<line x1='19' y1='2.4' x2='19' y2='3.2' stroke='rgb(122,92,24)' stroke-width='0.9'/>
<path d='M16.4 8.6 H21.6 V19.4 L19 16.9 L16.4 19.4 Z' fill='rgb(217,201,161)' stroke='rgb(122,92,24)' stroke-width='0.5' stroke-linejoin='round'/>
<circle cx='19' cy='7' r='4.3' fill='rgb(160,20,24)' stroke='rgb(100,12,14)' stroke-width='0.9'/>
<circle cx='19' cy='7' r='2.3' fill='none' stroke='rgb(204,70,66)' stroke-width='0.7'/>
<path d='M37.5 19.2 V10 Q37.5 5.4 42 3.2 Q46.5 5.4 46.5 10 V19.2 Z' fill='rgb(44,34,18)' stroke='rgb(199,154,44)' stroke-width='1' stroke-linejoin='round'/>
<path d='M39.7 19.2 V10.4 Q39.7 7.4 42 6.2 Q44.3 7.4 44.3 10.4 V19.2 Z' fill='rgb(100,12,14)'/><path d='M42 6.2 V19.2' stroke='rgb(122,92,24)' stroke-width='0.6'/>
<line x1='65' y1='2.4' x2='65' y2='3.2' stroke='rgb(122,92,24)' stroke-width='0.9'/>
<path d='M62.4 8.6 H67.6 V19.4 L65 16.9 L62.4 19.4 Z' fill='rgb(217,201,161)' stroke='rgb(122,92,24)' stroke-width='0.5' stroke-linejoin='round'/>
<circle cx='65' cy='7' r='4.3' fill='rgb(160,20,24)' stroke='rgb(100,12,14)' stroke-width='0.9'/>
<circle cx='65' cy='7' r='2.3' fill='none' stroke='rgb(204,70,66)' stroke-width='0.7'/>
</svg>
```

**`top`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 9'>
<rect width='12' height='9' fill='rgb(26,20,11)'/><rect y='0' width='12' height='0.8' fill='rgb(122,92,24)'/>
<path d='M0.6 9 V5.4 Q0.8 2.4 6 1.2 Q11.2 2.4 11.4 5.4 V9' fill='rgb(44,34,18)' stroke='rgb(122,92,24)' stroke-width='0.9' stroke-linejoin='round'/>
<circle cx='6' cy='5.8' r='1' fill='rgb(199,154,44)'/>
</svg>
```

**`side`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 24'>
<rect width='8' height='24' fill='rgb(26,20,11)'/><rect x='0' width='1' height='24' fill='rgb(122,92,24)'/><rect x='7' width='1' height='24' fill='rgb(122,92,24)'/>
<path d='M2 19 V9.4 Q2 6.4 4 4.6 Q6 6.4 6 9.4 V19 Z' fill='rgb(100,12,14)' stroke='rgb(199,154,44)' stroke-width='0.8' stroke-linejoin='round'/>
<circle cx='4' cy='1.6' r='0.9' fill='rgb(199,154,44)'/><circle cx='4' cy='22.4' r='0.9' fill='rgb(199,154,44)'/>
</svg>
```

**`corner`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'>
<rect width='8' height='8' fill='rgb(26,20,11)'/><rect x='0.5' y='0.5' width='7' height='7' fill='none' stroke='rgb(122,92,24)' stroke-width='0.9'/><path d='M4 1.6 L6.4 4 L4 6.4 L1.6 4 Z' fill='rgb(199,154,44)'/>
</svg>
```

**`btop`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 6'>
<rect y='0' width='14' height='0.9' fill='rgb(122,92,24)'/><rect y='5.1' width='14' height='0.9' fill='rgb(122,92,24)'/><path d='M7 1.7 L9.2 3 L7 4.3 L4.8 3 Z' fill='rgb(160,20,24)'/>
</svg>
```

**`motif`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<rect x='2' y='31' width='80' height='3' fill='rgb(40,28,14)'/>
<path d='M6 31 V17 Q6 11.4 14 8 Q22 11.4 22 17 V31 Z' fill='rgb(40,28,14)' stroke='rgb(122,92,24)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M30 31 V13 Q30 6.4 42 1.6 Q54 6.4 54 13 V31 Z' fill='rgb(40,28,14)' stroke='rgb(122,92,24)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M62 31 V17 Q62 11.4 70 8 Q78 11.4 78 17 V31 Z' fill='rgb(40,28,14)' stroke='rgb(122,92,24)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M9 31 V18 Q9 14.4 14 12 Q19 14.4 19 18 V31 Z' fill='rgb(100,12,14)'/><path d='M65 31 V18 Q65 14.4 70 12 Q75 14.4 75 18 V31 Z' fill='rgb(100,12,14)'/>
<path d='M34 31 V14 Q34 9.4 42 5.6 Q50 9.4 50 14 V31 Z' fill='rgb(232,198,102)'/>
<path d='M14 12 V31 M70 12 V31 M42 5.6 V31 M9 23 H19 M65 23 H75 M34 21 H50' stroke='rgb(40,28,14)' stroke-width='0.9' fill='none'/>
</svg>
```

**`icon`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M8.2 11 H13.8 V21.4 L11 19.2 L8.2 21.4 Z' fill='rgb(236,226,196)' stroke='rgb(122,92,24)' stroke-width='0.7' stroke-linejoin='round'/>
<circle cx='11' cy='8' r='7.2' fill='rgb(160,20,24)' stroke='rgb(100,12,14)' stroke-width='1.3'/><circle cx='11' cy='8' r='4.4' fill='none' stroke='rgb(204,70,66)' stroke-width='1'/><circle cx='11' cy='8' r='1.6' fill='rgb(100,12,14)'/>
</svg>
```

### 6.4 Motion

| # | Today (infinite) | Fate |
|---|---|---|
| 1 | `wh-flicker` title (2) | removed |
| 2 | `banner-throb` banner icon (1) | removed |
| 3 | `wh-aquila` grid-container::before (1) | removed |
| 4 | `wh-readout` ::after (2) | removed |
| 5 | `wh-ember` `#app` box-shadow (5) | removed |
| 6 | `wh-battle-ash` `#particles` background-position (4) | removed |
| hover | none infinite (`tile-radial`, one-shot) | removed (`.app-tile::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite warhammer.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance.

### 6.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#17130E`, border `#33291A` (1 px), radius 0px, `::before` off; layout unchanged. Icons: `sepia(0.15) saturate(0.9) contrast(1.05)` through the cut plate (D in 3).
- **Hover:** fill `#1D1710`, border `#C79A2C` (6.84:1 on the hover fill), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px ring in `--accent-c` at offset 2 (7.12:1 on the tile, 7.52:1 on the grid ground). **Pressed:** base scale 0.96 on `#1D1710`.
- **Label:** `#D9C9A1`, **Cinzel 500**, 12 px, 0.6 px, uppercase, no halo.
- **Filter chip:** base rule (fill `#1D1710`, `--accent-c` border, `#E6C566` text). The header scene hides while it shows.
- **Edit bar:** `#2B0E0D` fill, `#B0181B` rule, label `#EE857C`; `+ FILE` and `+ INSTALLED` in `--text` with a `#7C6A3A` border, `DONE` in `#EE857C` with a `#B0181B` border. The tile remove button is `#A01418` with a `#E2615A` ring and stays that colour on hover (`.btn-remove:hover`).
- **Settings overlay:** opaque `#0E0C0A`, panel `#16120D`, `--accent-text` values and version, `--accent-c` sliders and checkboxes, `#E6C566` CLOSE; placeholders at `--text-dim`.
- **Update banner:** `#E6C566` text on `#1E1810` with a `#8A6E2C` rule.

### 6.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite warhammer.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `@keyframes`; no `will-change`; no `backdrop-filter`.
2. Header: a 3 px line (`#C79A2C`) at y 37 to 40 with nothing below; the scene at x 168 to 252, y 10 to 30; `#title` right edge at most 156 (mock **99.44**); typing a letter hides the scene and shows the chip.
3. Frame: the top course at window y 40 to 49 and the side bands at x 1 to 9 and x W-13 to W-5 (full height, scaling with the window height), four corner caps; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 has 3 empty pixels between it and the art (mock distance 4 and 4 px).
4. Banner: #C8B78A with the top course, the icon at x 14 to 36, the motif at x 328 to 412 (424 x 300), banner text on one line in every state (`scrollWidth <= clientWidth` for all 5 strings; mock all fit at 424 and 640), the text box ending at x 320.
5. Hover shot (CALCULATOR): `#C79A2C` border, `#1D1710` fill, the cut plate with no cropped glyph, no ellipsis on CALCULATOR (mock 89.5 px for the widest standard label).
6. Colour discipline (chrome only, tile icons excluded): red only in the seals, the glass niches, the banner icon, the banner diamonds, edit mode and the remove button; gold for the lines, studs, hover, focus and values; parchment for text and the banner; nothing blue, green or purple.
7. Hidden-tiles sigma 0.00 (measured 0.00).
8. A/B/C probe at the three sizes and the states shot (art-off override in 0.4): overlap 0 px, art in keep-out 0 px (my run: all 11 runs 0 px and 0 px; smallest art-to-content distances at 424 x 300 header 10 px, frame 8 px, banner 3 px; at 640 x 420 10 / 8 / 11 px; at 1024 x 700 10 / 8 / 11 px; in the edit and update states the banner motif meets the bar below it, which touches by construction, 1 px). Window clips: 0 clipped content corners at 424 x 300 and 640 x 420.
9. `fontsRendered` lists `UnifrakturCook`, `Cinzel`, `IM Fell English` and `Palatino Linotype`; a misspelled-family probe element falls back.
10. Cyrillic tile names and a name set with figures ("Visual Studio 2022", "7-Zip 23.01", "Notepad++ x64") render with no missing-glyph box and lining figures.

**Expected squint score: 4** (title and banner text covered). What survives: a black octagonal window with gold arcade and piers, red glass niches, two seals and a lancet in the header, a parchment banner with a red wax seal and a three-lancet window. What is missing for a 5: the Aquila and skull (marks, not drawn) and weathering or candle-light texture, which the batch rules keep to zero.

Watch items for this theme: (1) **Parchment is the brightest surface of the batch.** A 44 px strip at `#C8B78A` under a near-black window pulls the eye, most in edit mode where it sits between a dark grid and a dark edit bar (the ac-templars lesson). It is the theme's signature element and the audit asked for it. The lever is one hex: `#A89868` keeps the ink text at 6.42:1 and the seal readable.

---

## 7. Fonts that would still lift this batch (for Sergei's decision; nothing downloaded, nothing used)

Rule: this batch uses the approved seven (four of them) and stock Windows fonts. Each font below is free-licensed; licence and Cyrillic coverage are from Makoto's font licence check (`Team/Research/QuickLaunch_ThemeReferences_2026-09-29.md`, repeated in F B7 and audit section 8). Each needs a new OK from Sergei with file name, source and size, and the OFL text must ship with it. Ranked by how much the batch gains:

| Rank | Font | Licence | Cyrillic | Theme it lifts | What it replaces | Expected gain | Source |
|---|---|---|---|---|---|---|---|
| 1 | Cormorant Garamond | SIL OFL 1.1 | yes | warhammer-eldar | Palatino Linotype italic | Medium: a thin, tall, elegant serif is what the reference sheet asks for ("long serif caps"); Palatino italic is sturdy by comparison. Its figures must be checked for lining style when the file is in hand (0.7) | https://github.com/google/fonts/tree/main/ofl/cormorantgaramond |
| 2 | Oxanium (or Orbitron) | SIL OFL 1.1 | no | warhammer-necrons | Bahnschrift SemiBold SemiCondensed | Medium: an angular sci-fi face with the "tomb-glyph" stroke the sheet names; Orbitron reads as generic sci-fi (the audit left it out on purpose) | https://github.com/google/fonts/tree/main/ofl/oxanium |
| 3 | Rubik Dirt (or Permanent Marker) | SIL OFL 1.1 (Permanent Marker is Apache 2.0) | Rubik Dirt yes | warhammer-orks | Impact title and banner, Ink Free labels | Medium: crude, scuffed lettering is the Ork voice; Permanent Marker is installed on this machine but is not stock Windows | https://github.com/google/fonts/tree/main/ofl/rubikdirt |
| 4 | Grenze Gotisch | SIL OFL 1.1 | no | warhammer-chaos | Pirata One title | Low: a second jagged blackletter, only if Sergei finds Pirata One too clean | https://github.com/google/fonts/tree/main/ofl/grenzegotisch |

No font is needed for warhammer (Imperium) or warhammer-tyranids to reach their squint scores. If Sergei approves only one file, take **Cormorant Garamond** (it also lifts parasite-eve, wow-nightelf, rivendell and the-sandman in later batches, F B7).

---

## 8. Summary

- **Six sections written**, one per theme, each with a final `:root` block, computed contrast tables (six gate pairs, 47 add-on pairs), icon checks on rest, hover and pressed fills, type with measured widths, art as exact shapes with coordinates plus the rules block and every SVG source, a motion inventory, tile, hover, selected, filter and banner rules, a "Done when" list and an expected squint score. A batch-level section (0) holds the shared kit, the batch 3 review lessons and the new rules.
- **Infinite animations: 36 (+2 hover-only) to 0.** No animation of any kind is left; no `will-change`; the only motion is the base 0.12 s tile transition and the one-shot entrance fade. The CSS shrinks too: 9.9 to 15.6 KB per theme against 18.6 to 22.9 KB today.
- **Contrast:** every pair clears its threshold. Lowest text pair **5.03:1** (orks, hotkey recording text (accent-m) on input fill; needs 4.5). Lowest non-text pair **3.47:1** (chaos, header line on header (non-text); needs 3). Lowest icon ratio **3.22:1** (necrons; needs 3). The real gate script, run on the six prototype files with an empty baseline, reported 0 errors, and a deliberately broken copy made it report 1 (positive control). warhammer-chaos leaves the legacy list.
- **Type:** four bundled faces (UnifrakturCook, Cinzel, IM Fell English, Pirata One) and seven stock faces (Palatino Linotype, Cambria, Sitka Text, Bahnschrift, Impact, Ink Free, Segoe UI Semibold); title edges 99.4 to 145.3 px against the 156 gate (no ladder step taken), every label inside the 100 px box, every banner line inside its text box. **Georgia and Constantia are not used**: both draw old-style figures (0.7).
- **Overlaps:** none by construction and none measured: the A/B/C probe read 0 px overlap and 0 px of art in the keep-out in all 66 runs (11 states and sizes x 6 themes); the art ends 3 empty pixels before the focus ring (batch 3 had 0.5 to 2 px). The probe's positive control reads 193 to 425 px when art is planted over the title.
- **Banner lines:** 26 lines across the six, each checked on the web (0.8); **none is studio-authored**. Sixteen are on Wikiquote or have a second witness (a search excerpt, an official post, a clip title, or the line is the franchise's own war cry); ten rest on one fan-wiki page and are marked "same page" or "single page-verified source" (Chaos "Skulls for the Skull Throne."; Eldar "I am Khaine incarnate." and "We cannot fail."; Necrons four campaign lines; Orks "Orks is made for fightin!", "I'm da biggest, so I'm da boss!" and "Dakka dakka dakka!"); the two Tyranid lines are excerpts of one Codex passage.
- **Squint (expected, title and banner text covered):** warhammer-chaos 4, warhammer-orks 4, warhammer-tyranids 4, warhammer-eldar 4, warhammer-necrons 4, warhammer 4. The six renders side by side read as six different places (0.3).
- **Facts found on the way (not fixed, not in this batch's scope):** Georgia and Constantia draw **old-style figures** (so does Sitka Text at regular weight); the audit counts 35 themes that lead with Georgia (G8), and each shows the header version as "v1.94.3" in old-style figures until its batch (0.7 lists which stock faces are safe); the audit's Chaos header-line red is 2.13:1 on its header; Ink Free has one weight and Sitka Text old-style figures at regular weight, which any later theme using them should know; the real gate script now also checks `--btn-close-color` on `--panel-bg` (six checks, not five).

### The `THEME_BANNERS` entries (exactly as written; replaces the six keys and no others)

```js
  'warhammer': [
    'Only in death does duty end.',
    'Blessed is the mind too small for doubt.',
    'The Emperor protects.',
    'Victory needs no explanation, defeat allows none.',
    'No man died in His service that died in vain.',
  ],
  'warhammer-chaos': [
    'Blood for the Blood God!',
    'Skulls for the Skull Throne.',
    'Sanity is for the weak!',
    'For the Dark Gods!',
    'Do you hear the voices, too?',
  ],
  'warhammer-eldar': [
    'The future is clouded and uncertain.',
    'All who love life, fear the reaper.',
    'I am Khaine incarnate.',
    'We cannot fail.',
  ],
  'warhammer-necrons': [
    'We are your end, alien.',
    'So much fear. So much noise.',
    'Death has come for you at last.',
    'Your bravado will not save you.',
    'Your end is inevitable.',
  ],
  'warhammer-orks': [
    'WAAAGH!',
    'Orks is made for fightin!',
    "I'm da biggest, so I'm da boss!",
    'Dakka dakka dakka!',
    "Ev'ryone knowz red wunz go fasta!",
  ],
  'warhammer-tyranids': [
    'There is a cancer eating at the Imperium.',
    '...it must know us only as Prey.',
  ],
```

### Flags for Jane and Sergei (each answerable in one word)

1. **Imperium parchment banner.** The parchment strip is the brightest surface of the batch and the only light one. Keep it bright (`#C8B78A`, ink 9.24:1), or dim it to a mid parchment (`#A89868`, ink 6.42:1)? Answer: **bright** or **mid**.
2. **Font wish: Cormorant Garamond for the Eldar.** Approve downloading it (OFL; the file name, source and size go to Sergei with the request, as F B7 requires; it also lifts four later themes)? Answer: **yes** or **no**.
3. **Tyranid banner.** There are two lines, both excerpts of one Codex passage (Inquisitor Czevak), the second opening with an ellipsis. Keep both, or hold the theme at the first line only ("There is a cancer eating at the Imperium.")? Answer: **keep** or **one**.
4. **Chaos reads as "Undivided, Khorne-leaning".** The audit chose it; the result has red and brass only. Keep that one god, or add a second god colour as a thin accent (Nurgle green or Tzeentch blue)? Answer: **keep** or **add**.
5. **Ork type.** Ink Free (regular) for tile labels is legible but thin beside Impact. Keep, or set labels in Impact too? Answer: **keep** or **impact**.

### Watch items (not fixes, not blocking)

1. **Real icons vs cut plates.** Every plate cut clears every mock glyph (smallest margins chaos 8.25, orks 8.32, tyranids 7.17, eldar 6.37, necrons 8.25, imperium 5.74 px), but a real app icon whose art reaches a corner loses a small triangle there. If Sergei notices, drop the cut to `inset(0 round 13px)`; the themes still read through their surfaces.
2. **Imperium parchment** (flag 1).
3. **Seal and hexagon icons** may read as a rosette and as an isometric cube at 22 px; each sits beside a clearer motif (the triple-lancet window, the pyramid skyline).
4. **Chaos banner corner.** The broken bottom-right window corner touches the motif's last pixels (Chaos watch).
5. **Orks `.tile-icon` filter override** removes the base drop shadow in one theme (Orks watch 2).
6. **Sitka Text lining figures** need `font-variant-numeric: lining-nums` to hold in Electron 32 (Tyranids watch).
7. **Not seen by me:** Electron renders (mock only), the skin-picker list open, the empty-library drop hint, the updater error bar, edit-mode remove buttons on the cut plates beyond the mock's own plates.

---

## 9. Open items (things I could not resolve or verify here)

Nothing was launched in QuickLaunch. Each item has a verify step above; none blocks implementation.

1. **Mock window, not Electron.** All measurements come from headless Edge 154 with the Foundation's CSS applied to the real `base.css` and `index.html`. Chromium 154 is not Electron 32: sub-pixel text and filter rounding can differ. Ender's numbers win; the after-run reports them. After the fonts are packaged, the title-edge ladder (F B2 rule 5) is binding over my measured edges.
2. **Fonts measured from the working tree.** I loaded four of the seven bundled files read-only to get real widths; if Ender renames or re-exports them, re-measure.
3. **Stock fonts on Sergei's other machines.** Cambria, Palatino Linotype, Sitka Text, Bahnschrift, Impact, Ink Free and Segoe UI Semibold ship with Windows 10 and 11 (Sitka Text, Bahnschrift and Ink Free with Windows 10 and later). On an older install the stacks fall to Georgia or Segoe UI and the figures may change.
4. **Banner widths** were measured in the mock with the real fonts; the fit check (F A3) is the net if Electron differs by a few pixels (every line ends at least 24 px before the text box edge).
5. **Single-source banner lines** (Summary): ten lines rest on one fan-wiki page; flag 3 covers the Tyranid excerpts.
6. **Sources blocked to a fetch:** Lexicanum (402), the Fandom wikis (402) and TV Tropes (403); lines that depend on them are dropped or marked.
7. **`THEME_BANNERS` comment in `app.js`** ("3 per theme") is stale (B1 12.8 watch item 1, B3 F6); this batch's entries are 5, 5, 4, 5, 5 and 2 lines. Only the six keys named in 0.8 change.
8. **Tall windows:** the side strips repeat down the container and the top course repeats along it; the art is anchored to the frame, never scaled. Looks right at 1024 x 700 in the mock.
9. **The `.app-tile` radius and its `overflow: hidden`** clip the edit-mode remove button at the rounded corners in warhammer-eldar (top-right 4 px) and warhammer-tyranids (top-right 6 px); the base already clips it at the tile edge (the button sits at `top:-2px; right:-2px`), and the larger radii do not change that visibly in the mock.


---

## Addendum — flag rulings (Sergei delegated to Judy, 2026-10-01)

Status: complete. Sergei left the batch-4 open choices to Judy ("decide yourself — what will be more beautiful"). Batch 4 is committed at `35d4e25` on `wip/theme-fidelity`. This addendum answers the five flags of section 8 and the four icon misreads of the batch-4 review (section 4, plus the Necrons remove button), and it **supersedes** the passages listed in A.7 (the earlier sections are not edited; where they disagree, this addendum is the contract). Doc only: no CSS or JS was edited, nothing was committed or pushed, the other batches, the batch-5 files and the regions worktree were not touched. This file is still uncommitted. **Amended after the Electron re-check (review file, "Re-check — flag rulings"):** the Eldar label size is **13.5 px, not 14 px** (A.2 item 3, "Label size" paragraph, E3, E8), and A.6.1 now names the Chaos header comment. The text below is what is built.

Method in one paragraph: I rebuilt the batch-4 mock (the repo's current `src/renderer` copied read-only into the scratchpad, headless Edge 154, temp profile, no Electron, no QuickLaunch launch) and rendered the candidates on the real built theme files with the candidate rules appended. The mock reproduces the shipped numbers exactly (Orks as built: tile 95.41, title edge 111.27, NOTEPAD 47.02, CALCULATOR 54.93), so the new numbers are comparable. Nothing here sends `Input.*` events. Evidence files are listed in A.8.

### A.0 Rulings at a glance

| # | Question | Ruling | Why, in one line |
|---|---|---|---|
| 1 | Imperium parchment banner | **bright** (`#C8B78A` stays, no change) | the mid `#A89868` renders as dirty khaki: the gold rule, red diamonds and seal lose their pop; bright is the one place the cathedral reads as a manuscript |
| 2 | Cormorant Garamond for Eldar | **yes**, one new bundled OFL file (the italic) | the elegant, swooping italic is what Aeldari type should look like; Palatino italic is sturdy where the theme is graceful; display roles only (title, labels, banner), the body stays Palatino |
| 3 | Tyranid banner | **keep both lines** (no change) | the banner always shows line 1 then line 2, 14 s apart, so the opening ellipsis finishes the thought (cancer, then prey); one line would sit frozen |
| 4 | Chaos colour | **red and brass only** (no change) | the audit's own complaint was "four gods at once is no god"; a second god colour would split a picture that already reads Khorne |
| 5 | Ork labels | **Impact** | solid strokes match the Impact title and banner and the bolted plates, read at 1x where Ink Free is one pixel thin, and "Visual Studio 2022" fits where Ink Free cut it |
| 6 | Redraw the four misread icons | **yes, all four**, and the Necrons remove button goes red | each new drawing is one dominant shape that reads at 22 px and 1x before it reads as anything else; full specs in A.6 |

### A.1 Ruling 1: Imperium parchment, bright

No change. I rendered the strip both ways on the built theme, in the grid and in edit mode, where it sits between a dark grid and a dark edit bar (the ac-templars worry). At `#A89868` the strip turns olive, the red diamonds and the wax lose contrast against it and the whole bottom edge looks dirty instead of aged; at `#C8B78A` it reads as parchment and the red seal and gold rule hold. The brightness the batch-4 review measured (banner 8.9 times the header ground) is the theme's signature, and the edit-mode view reads fine because the red edit bar underneath is dark and warm. The one-hex lever stays on record in section 6 if Sergei ever finds it loud. Ink on parchment stays 9.24:1. Flag 1 closed.

### A.2 Ruling 2: Cormorant Garamond for Eldar, yes

**This is the font request in the Foundation B7 form.** Sergei delegated the choice, so the ruling is Judy's, but the file is not downloaded until Jane confirms the delegation covers the download (the README says any other font needs a new approval). The file name, source and size are below so that confirmation can be one word. I downloaded nothing: sizes and licence come from the `google/fonts` directory listing and `METADATA.pb`, read as web pages.

| Item | Value |
|---|---|
| Family (CSS) | `'Cormorant Garamond'`, italic, variable weight 300 to 700 |
| File | `CormorantGaramond-Italic[wght].ttf` (italic only; the roman file, 1,195,560 bytes, is not needed by Eldar and is not requested) |
| Source URL | `https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf` |
| Size | 715,644 bytes (0.68 MiB; the bundle grows from 3.05 MiB to 3.73 MiB) |
| Licence | SIL Open Font License 1.1 (`METADATA.pb`: `OFL`); copyright "Copyright 2015 The Cormorant Project Authors (github.com/CatharsisFonts/Cormorant)" |
| Licence file | `https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/OFL.txt`, 4,387 bytes, ships next to the font |
| Coverage | Latin, Latin Extended, Cyrillic, Cyrillic Extended, Vietnamese (`METADATA.pb` subsets) |
| Stored as | `src/renderer/fonts/cormorantgaramond/CormorantGaramond-Italic-VF.ttf` (renamed for the brackets, as Jost and Cinzel were; the font bytes are unchanged) and `src/renderer/fonts/cormorantgaramond/OFL.txt` |
| SHA-256 | Ender records both at download, into the README tables (I have not seen the file) |

**Ender's steps** (after Jane's go): download the two files from the URLs above into `src/renderer/fonts/cormorantgaramond/`; add the block below to `src/renderer/fonts/fonts.css` (and change its comment "Seven" to "Eight" and the weight list); add one row to each README table (family, file, URL, bytes, SHA-256), change "Seven font files ... exactly these seven" to eight and name this addendum as the approval; change README "Use only the seven family strings" to eight.

```css
@font-face {
  font-family: 'Cormorant Garamond';
  src: url('cormorantgaramond/CormorantGaramond-Italic-VF.ttf') format('truetype');
  font-weight: 300 700; font-style: italic; font-display: block;
}
```

**Eldar rules.** I class Cormorant Garamond as a text face, like Jost and IM Fell English (the Foundation lets text faces set more than the title), so it sets exactly three roles: `#title`, `.tile-label` and `#theme-banner-text`. The body, settings, pickers and version stay Palatino Linotype italic (their sizes are fixed in `base.css`, and Cormorant's small x-height would make 11 px settings text too small). Four edits in `warhammer-eldar.css`:

1. In `:root`: `--tile-label-weight: 400;` becomes `--tile-label-weight: 600;`.
2. `#title` replaces the current rule (the `.accent` rule below it stays):
```css
#title { font-family: 'Cormorant Garamond', 'Palatino Linotype', Palatino, Georgia, serif; font-synthesis: none; font-weight: 600; font-style: italic; line-height: 1.2; font-size: 13px; letter-spacing: 3px; font-variant-numeric: lining-nums; color: #F0EBDD; text-shadow: none; }
```
3. `.tile-label` replaces the current rule (this also carries the F1 clip of the batch-4 review, so review item F3 for Eldar is satisfied by this text). **The size is 13.5 px, not the 14 px of the first draft** (measured in Electron: 14 px truncates "Visual Studio 2022"; see "Label size" below):
```css
.tile-label { font-family: 'Cormorant Garamond', 'Palatino Linotype', Palatino, Georgia, serif; font-synthesis: none; font-size: 13.5px; line-height: 14.4px; font-variant-numeric: lining-nums; overflow: clip; overflow-clip-margin: 3px; }
```
4. `#theme-banner-text` replaces the current rule:
```css
#theme-banner-text { font-family: 'Cormorant Garamond', 'Palatino Linotype', Palatino, Georgia, serif; font-synthesis: none; font-size: 14px; font-weight: 500; font-style: italic; letter-spacing: 0.3px; font-variant-numeric: lining-nums; color: #F0EBDD; margin-right: 90px; }
```
Also change the header comment lines that say "Spec flag 2 (Cormorant Garamond), built at the spec default: no new font" to say the flag was ruled yes in this addendum.

**Why these numbers (estimates from the typeface's known proportions, not measurements: the font is not on this machine and I may not download it).** Cormorant has a small x-height (roughly 0.38 em against Palatino's roughly 0.47) and narrow letters, so it must be set larger to match: 14 px Cormorant italic was expected to be close to 12 px Palatino italic in width per letter (so labels and banner keep their fit) and within a few percent in x-height. **That estimate was right for the banner and the title and wrong by 2 px for the widest label; see "Label size" below, where the measured numbers replace it.** Weight 600 is the semibold, which keeps the hairlines alive at 1x (the font's heaviest is 700). The label `line-height` stays at the fixed 14.4 px (12 px times 1.2 today), so the tile height does not move off 95.39; Cormorant's tall descenders should then reach about 1 px past the line box and are protected by the existing `overflow-clip-margin: 3px`. The title goes to 13 px with 3 px tracking: against Palatino at 11 px with 4 px tracking (edge 145.28) my estimate for the edge is 138 to 150 against the 156 gate; **Ender's number wins and the ladder applies**. **The stack falls back to Palatino Linotype italic if the file fails to load**: the title still ends before 156 (about 148), the labels run larger (an ellipsis on "Visual Studio 2022" is the worst case), the banner lines still end well before x 320. Nothing breaks.

**Label size: 13.5 px (ruled after measurement, Electron, 2026-10-01).** The label box is capped at `icon size + 36px`, which is 100 px at the default icon size. "Visual Studio 2022" in Cormorant Garamond italic 600 measures 95.50 px at 13 px, **98.90 px at 13.5 px (built)**, 99.57 px at 13.6 px, 100.57 px at 13.75 px (ellipsis) and 102.29 px at 14 px (ellipsis, the first draft). 13.5 px keeps 1.1 px under the cap and reads at 1x (6x pixel crops of the label strip and the forced hover state were read). Nothing else in the rule moves: `line-height` stays 14.4 px, the label box stays 14.396 px and the tile 94.729 px. Banner (14 px, 500) and title (13 px, 600, 3 px tracking) are as specified; the title ink edge is x 132 at 424 x 300, 640 x 420 and 1024 x 700 (gate 156). If the file ever failed to load, the stack falls back to Palatino Linotype italic at 13.5 px, which is wider than the 12 px the theme used before; its widths were not measured, and "Visual Studio 2022" may truncate in that case only.

**Lining figures.** Cormorant's default figures are old-style (a web search says so; unverified until the digit crop below), so `font-variant-numeric: lining-nums` is on all three roles; Ender proves it with a digit crop and a positive control.

**Done when (additions for Eldar, measured by Ender, re-checked by Judy):**

- E1. `fontsRendered` lists `Cormorant Garamond` (positive control); a misspelled probe family falls back (negative control).
- E2. `#title` right edge at most 156 at 424 x 300, 640 x 420 and 1024 x 700 (ladder: tracking down 1 px at a time to 1 px, then 12 px). The title stack (title plus version line, now 15.6 px for the title line) stays inside the 40 px header with at least 2 px above the header line at y 37; if not, `line-height: 1.1`.
- E3. The six standard labels, "Visual Studio 2022", "Notepad++ x64" and "7-Zip 23.01" show no ellipsis at 1x (measured: 98.90, 77.35 and 57.96 px against the 100 px cap; "Spreadsheet Editor Pro" at 119.68 px is the one name that truncates, as it should); tile height stays 94.7 to 95.4 and the label box height stays 14.39. At the first-draft 14 px this check fails ("Visual Studio 2022" is 102.29 px).
- E4. Lining figures: a 6x crop of "7-Zip 23.01" and "Visual Studio 2022" shows lining digits; with `font-variant-numeric: normal` on the same text the digits go old-style (the control proves the font and the feature are what is rendered). The header version stays Palatino and is not touched.
- E5. Cyrillic: `CSS.getPlatformFontsForNode` on "Калькулятор" and "Жёсткий диск" is reported in the receipt (Cormorant Garamond expected; a glyph fallback to Palatino Linotype is accepted but must be named).
- E6. Descenders: the batch-4 F1 sweep (labels "gypsy Yy jq" and "Typing", 1x, 1.5x, 2x, three scroll offsets) reads 0 clipped rows against an `overflow: visible` reference; the edit-mode rename underline does not move.
- E7. The packaged build contains the font and `OFL.txt` (asar listing) and is launched before the release is announced.
- E8. Judy's 1x crop of title, labels and banner on the navy ground and on the teal hover reads clearly. **Levers if the type looks thin, in order:** label weight 700 (measured: "Visual Studio 2022" is 99.27 px at 13.5 px / 700, still inside the 100 px cap), then title weight 700 (re-measure the title edge against 156). Label size is **not** a lever: above 13.6 px "Visual Studio 2022" truncates. If neither satisfies, Eldar goes back to Palatino by deleting the three rules (the stack already degrades); the font stays bundled for the four later themes the Foundation lists.

**Not verified (updated after the re-check):** the Cormorant estimates above were replaced by Electron measurements (label size 13.5 px; all three roles render in Cormorant Garamond with lining figures and Cyrillic, per the review file); still not measured: the Palatino fallback widths at 13.5 px, and that the italic file alone is enough (no Eldar element uses a roman style, checked by reading the file, and `font-synthesis: none` would show a fallback glyph if one did). Flag 2 closed.

### A.3 Ruling 3: Tyranid banner, keep both lines

No change. `app.js` starts on line 1 and every 14 s fades to the next line in order, so the viewer always meets "There is a cancer eating at the Imperium." first and "...it must know us only as Prey." after it; the opening ellipsis is the continuation of the line just seen. With one line the banner would never move. Both lines fit with 24.3 px to spare (0.8). Flag 3 closed. (If a third Czevak line is ever wanted it needs a shorter clause than the two dropped for length; that is an offer, not a change.)

### A.4 Ruling 4: Chaos, red and brass only

No change. Red, brass and iron is one god and one material, which is what the redraw was for; the audit's finding on the old file was that four god colours at once meant no god was chosen. A thin Nurgle green or Tzeentch blue would bring back exactly that split, and it would have to be added to the colour-discipline check (Done when 6) as a deliberate exception. The warp purple that already appears in the hover and pressed tile fills is the only concession to a second hue and stays. Flag 4 closed.

### A.5 Ruling 5: Ork labels in Impact

Decision: labels use Impact, the same face as the title and the banner. Measured on the mock (1x, Orks, as built against Impact 12 px):

| | As built (Ink Free 13 px) | **Impact 12 px, 0.4 px tracking (ruled)** | Impact 13 px, 0.3 px (rejected) |
|---|---|---|---|
| NOTEPAD / CALCULATOR / PAINT / TERMINAL / BROWSER / FILES (ink px) | 47.02 / 54.93 / 29.54 / 48.77 / 46.58 / 25.10 | 43.91 / 55.76 / 27.48 / 46.97 / 44.15 / 25.30 | 46.65 / 59.07 / 29.10 / 49.81 / 46.90 / 26.73 |
| Truncated with an ellipsis (14 test names) | "Visual Studio 2022", "Spreadsheet Editor Pro" | **"Spreadsheet Editor Pro"** only | "Visual Studio 2022", "Spreadsheet Editor Pro", "Windows Terminal" |
| Tile height / label box | 95.41 / 14.98 | **95.41 / 14.94** (unchanged) | 95.41 / 14.97 |

13 px is rejected because three common names truncate. The platform font reported for "gypsy Yy jq", "Typing", "jumpy quaff", "Notepad", "Paint" and the Cyrillic "Жёсткий диск" is **Impact** in every case (`CSS.getPlatformFontsForNode`); Impact covers Cyrillic. Digits are lining ("7-Zip 23.01", "Visual Studio 2022", "Notepad++ x64" read cleanly in the 1x crop). Descenders: the clip against an `overflow: visible` reference differs by **0 pixels** at 1x and 2x on six test labels with the rule below; the positive control (the same rule with plain `overflow: hidden`) differs by 2.4 and 4.7 weighted pixels, so the check can fail, and the clip margin from the review's F1 stays in the rule.

Replace the `.tile-label` rule in `warhammer-orks.css` (it keeps the F1 clip, so review item F3 for Orks is satisfied by this text):
```css
.tile-label { font-family: Impact, 'Arial Black', 'Segoe UI', sans-serif; font-synthesis: none; font-size: 12px; letter-spacing: 0.4px; line-height: 14.4px; overflow: clip; overflow-clip-margin: 3px; }
```
Also: change the file header comment that says flag 5 is built at the default "keep" (Ink Free) to say it was ruled Impact; keep the ±0.7 degree rotation (heavier strokes carry the softer raster better than Ink Free's one-pixel strokes did); nothing else changes. No colour is touched, so `npm run check:contrast` is unchanged. Edit mode: the rename underline stays where it is; Impact's descenders are short and stop just above the dashes, so they no longer cross them (Ink Free's `p` did; side by side in `underline-compare.png`), which also closes the re-check's note on that point. Wherever the Orks sections name Ink Free (2.2 type table, 2.3 rule, 2.5 label line, the 0.7 fonts-table row, Orks watch item 1) read Impact 400, 12 px, 0.4 px tracking, line height 14.4 px; "Done when" 9 now expects `fontsRendered` to list `Impact` and `Segoe UI Semibold` (Ink Free leaves the list); "Done when" 10 still holds (the descenders of "Spreadsheet Editor" are uncut; the measured check above covers it). The Ork-label flag (flag 5) and the review's Ink Free notes (digits low, `q` like `a`, rotated fringe) are closed with it.

### A.6 Ruling 6: redraw the four misread icons, yes

All four are redrawn, plus the Necrons remove button. Every new drawing was rendered in the real theme at 1x, 3x and 6x and read at the pixel level (8x crops of the 1x render); each has one dominant shape. Boxes, positions and colours are the ones the spec already uses; no gate pair, motion, font or geometry changes, so the A/B/C probe sees the same boxes. Colours are all from each theme's existing art. Encoding is B1 0.2 (`<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed, single quotes inside the double-quoted `url()`); the encoded strings below are exactly what I rendered.

#### A.6.1 warhammer-chaos: banner icon, a spiked ring becomes one brass-banded horn

Why: at 22 px the old ring with seven radial spikes reads as a sawblade or a sun before it reads as a collar. The new icon is a single curved iron horn on a tilted brass band with one hot crack: the same curve family as the three spikes at the other end of the banner, so the two ends rhyme. It is a plain curved spike (the trademark note still holds: no Star of Chaos, no sigil, no rune, no horned figure). Painted pixels x 2.0 to 21.0, y 0.3 to 22.0 (the flush base ends on the slot's bottom edge). Colours: iron (98,82,82), steel outline (176,160,150), brass (184,134,58) with (110,78,34) and (226,178,96), hot red (222,76,48). Replaces the `icon` SVG of 1.3 and the `#theme-banner::before` rule:

SVG source (`icon`):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M3.2 22 C2.6 12.6 8.4 4.4 20.6 0.8 C16.2 6.6 14.8 14 15.2 22 Z' fill='rgb(98,82,82)' stroke='rgb(176,160,150)' stroke-width='0.8' stroke-linejoin='round'/>
<path d='M6 14.4 C7 10 10.6 6 16.6 3.2' fill='none' stroke='rgb(200,186,176)' stroke-opacity='0.6' stroke-width='0.9' stroke-linecap='round'/>
<path d='M9.4 16.4 L11.2 13.4 L9.8 12 L12 8.6' fill='none' stroke='rgb(222,76,48)' stroke-width='1' stroke-linejoin='round' stroke-linecap='round'/>
<path d='M2.6 16.6 L15.6 15.6 L15.7 19 L2.9 20 Z' fill='rgb(184,134,58)' stroke='rgb(110,78,34)' stroke-width='0.8' stroke-linejoin='round'/><path d='M3.4 17.6 L15 16.7' stroke='rgb(226,178,96)' stroke-width='0.7'/>
</svg>
```
Rule (replace the whole `#theme-banner::before` rule):
```css
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath d='M3.2 22 C2.6 12.6 8.4 4.4 20.6 0.8 C16.2 6.6 14.8 14 15.2 22 Z' fill='rgb(98,82,82)' stroke='rgb(176,160,150)' stroke-width='0.8' stroke-linejoin='round'/%3E%3Cpath d='M6 14.4 C7 10 10.6 6 16.6 3.2' fill='none' stroke='rgb(200,186,176)' stroke-opacity='0.6' stroke-width='0.9' stroke-linecap='round'/%3E%3Cpath d='M9.4 16.4 L11.2 13.4 L9.8 12 L12 8.6' fill='none' stroke='rgb(222,76,48)' stroke-width='1' stroke-linejoin='round' stroke-linecap='round'/%3E%3Cpath d='M2.6 16.6 L15.6 15.6 L15.7 19 L2.9 20 Z' fill='rgb(184,134,58)' stroke='rgb(110,78,34)' stroke-width='0.8' stroke-linejoin='round'/%3E%3Cpath d='M3.4 17.6 L15 16.7' stroke='rgb(226,178,96)' stroke-width='0.7'/%3E%3C/svg%3E") center / 22px 22px no-repeat; }
```
Also change the header comment of `warhammer-chaos.css` (line 4): "a spiked collar icon" reads "a brass-banded horn icon". The first build left the old wording because this section did not name the comment; it is a comment only and changes no rendering. (The same file's "Spec flag 4 ... built at the spec default \"keep\"" line stays: flag 4 was ruled keep, A.4. The Imperium, Necrons and Tyranids header comments were read and name nothing that changed.)

Watch item: the horn is grey on blood-dark and less bright than the old brass ring; if Sergei finds it dim, lift the fill from (98,82,82) to (118,100,100) in the SVG (the motif at the right end keeps (98,82,82)).

#### A.6.2 warhammer-tyranids: header art, "horns" become toothed mandibles around the bulb

Why: the two long blades that swept from the outer edges to a point at the centre read as horns, wings or a moustache above the gem. The new `hz` is two toothed bone crescents that close on the pink bulb like jaws (three teeth on each inner edge, hooked tips top and bottom), with a spiral tendril ending in a pink dot on each side (the curl-and-dot of the frame's corner tendrils). It is still "a pair of mandibles and a bulb" (the kit table in 0.3 does not change) and it is drawn inside the same 84 x 20 box. Painted pixels x 6.5 to 77.5, y 0.5 to 19.5 (was x 1.5 to 82.5, y 1.8 to 19.3): at 424 x 300 the art starts at window x 174.5, 32 px clear of the title edge (141.89) and ends at x 245.5, about 27 px before the first header button. Colours: the existing bone gradient and pinks. Replaces the `hz` SVG of 3.3; the rule below keeps the spec's `#header::after` rule and changes only the `url(...)`:

SVG source (`hz`):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='rgb(230,217,184)'/><stop offset='1' stop-color='rgb(160,140,116)'/></linearGradient></defs><path d='M23.4 10.8 C17 11.4 12.6 12.6 9.6 11.2 C6.6 9.8 6.4 6.2 8.8 5.2 C10.8 4.4 12.4 6.2 11.2 7.8' fill='none' stroke='rgb(196,67,107)' stroke-width='1.1' stroke-linecap='round'/><circle cx='11.2' cy='7.8' r='1.1' fill='rgb(240,138,168)'/><g transform='translate(84,0) scale(-1,1)'><path d='M23.4 10.8 C17 11.4 12.6 12.6 9.6 11.2 C6.6 9.8 6.4 6.2 8.8 5.2 C10.8 4.4 12.4 6.2 11.2 7.8' fill='none' stroke='rgb(196,67,107)' stroke-width='1.1' stroke-linecap='round'/><circle cx='11.2' cy='7.8' r='1.1' fill='rgb(240,138,168)'/></g><path d='M38 0.8 C29.6 1.2 23 5.4 23.2 10 C23.4 14.6 29.8 18.8 38 19.2 C33.4 17 31 13.8 31 10 C31 6.2 33.4 3 38 0.8 Z' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.6' stroke-linejoin='round'/>
<path d='M31 10.4 L35 8.8 L32.2 6.4 Z M31.6 14.2 L35.4 12.8 L32.6 10.4 Z M31.4 6.6 L35 5.2 L32.4 2.8 Z' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.4' stroke-linejoin='round'/>
<path d='M26.6 4.2 C25 5.6 24.4 7.4 24.4 9.4' fill='none' stroke='rgb(255,248,240)' stroke-opacity='0.55' stroke-width='0.8' stroke-linecap='round'/><g transform='translate(84,0) scale(-1,1)'><path d='M38 0.8 C29.6 1.2 23 5.4 23.2 10 C23.4 14.6 29.8 18.8 38 19.2 C33.4 17 31 13.8 31 10 C31 6.2 33.4 3 38 0.8 Z' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.6' stroke-linejoin='round'/>
<path d='M31 10.4 L35 8.8 L32.2 6.4 Z M31.6 14.2 L35.4 12.8 L32.6 10.4 Z M31.4 6.6 L35 5.2 L32.4 2.8 Z' fill='url(#g)' stroke='rgb(160,140,116)' stroke-width='0.4' stroke-linejoin='round'/>
<path d='M26.6 4.2 C25 5.6 24.4 7.4 24.4 9.4' fill='none' stroke='rgb(255,248,240)' stroke-opacity='0.55' stroke-width='0.8' stroke-linecap='round'/></g>
<ellipse cx='42' cy='10' rx='4.4' ry='5.6' fill='rgb(196,67,107)' stroke='rgb(123,42,110)' stroke-width='0.8'/><ellipse cx='40.8' cy='7.8' rx='1.4' ry='2' fill='rgb(240,138,168)' fill-opacity='0.75'/>
</svg>
```
Rule (replace the whole `#header::after` rule):
```css
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='rgb(230,217,184)'/%3E%3Cstop offset='1' stop-color='rgb(160,140,116)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M23.4 10.8 C17 11.4 12.6 12.6 9.6 11.2 C6.6 9.8 6.4 6.2 8.8 5.2 C10.8 4.4 12.4 6.2 11.2 7.8' fill='none' stroke='rgb(196,67,107)' stroke-width='1.1' stroke-linecap='round'/%3E%3Ccircle cx='11.2' cy='7.8' r='1.1' fill='rgb(240,138,168)'/%3E%3Cg transform='translate(84,0) scale(-1,1)'%3E%3Cpath d='M23.4 10.8 C17 11.4 12.6 12.6 9.6 11.2 C6.6 9.8 6.4 6.2 8.8 5.2 C10.8 4.4 12.4 6.2 11.2 7.8' fill='none' stroke='rgb(196,67,107)' stroke-width='1.1' stroke-linecap='round'/%3E%3Ccircle cx='11.2' cy='7.8' r='1.1' fill='rgb(240,138,168)'/%3E%3C/g%3E%3Cpath d='M38 0.8 C29.6 1.2 23 5.4 23.2 10 C23.4 14.6 29.8 18.8 38 19.2 C33.4 17 31 13.8 31 10 C31 6.2 33.4 3 38 0.8 Z' fill='url(%23g)' stroke='rgb(160,140,116)' stroke-width='0.6' stroke-linejoin='round'/%3E%3Cpath d='M31 10.4 L35 8.8 L32.2 6.4 Z M31.6 14.2 L35.4 12.8 L32.6 10.4 Z M31.4 6.6 L35 5.2 L32.4 2.8 Z' fill='url(%23g)' stroke='rgb(160,140,116)' stroke-width='0.4' stroke-linejoin='round'/%3E%3Cpath d='M26.6 4.2 C25 5.6 24.4 7.4 24.4 9.4' fill='none' stroke='rgb(255,248,240)' stroke-opacity='0.55' stroke-width='0.8' stroke-linecap='round'/%3E%3Cg transform='translate(84,0) scale(-1,1)'%3E%3Cpath d='M38 0.8 C29.6 1.2 23 5.4 23.2 10 C23.4 14.6 29.8 18.8 38 19.2 C33.4 17 31 13.8 31 10 C31 6.2 33.4 3 38 0.8 Z' fill='url(%23g)' stroke='rgb(160,140,116)' stroke-width='0.6' stroke-linejoin='round'/%3E%3Cpath d='M31 10.4 L35 8.8 L32.2 6.4 Z M31.6 14.2 L35.4 12.8 L32.6 10.4 Z M31.4 6.6 L35 5.2 L32.4 2.8 Z' fill='url(%23g)' stroke='rgb(160,140,116)' stroke-width='0.4' stroke-linejoin='round'/%3E%3Cpath d='M26.6 4.2 C25 5.6 24.4 7.4 24.4 9.4' fill='none' stroke='rgb(255,248,240)' stroke-opacity='0.55' stroke-width='0.8' stroke-linecap='round'/%3E%3C/g%3E%3Cellipse cx='42' cy='10' rx='4.4' ry='5.6' fill='rgb(196,67,107)' stroke='rgb(123,42,110)' stroke-width='0.8'/%3E%3Cellipse cx='40.8' cy='7.8' rx='1.4' ry='2' fill='rgb(240,138,168)' fill-opacity='0.75'/%3E%3C/svg%3E") no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
```
Watch item: at 1x the pair can read as an eye with heavy lids. The teeth and the hooked tips are what say "jaws"; if Sergei still sees an eye, remove the bulb's highlight ellipse and widen the gap by 1 px each side.

#### A.6.3 warhammer-necrons: banner icon, the hexagon with three seams becomes one pyramid; remove button goes red

**Icon.** Why: the hexagon with three seams radiating from the centre read as a Y in a hexagon (a peace sign or a car badge). The new icon is one pyramid with a bronze capstone, one vertical seam and a green horizon, the header's pyramid drawn as an icon. No eye, no node, no three-way seam (so no Y and no eye-in-a-triangle). Painted pixels x 0.8 to 21.3, y 2.0 to 21.0. Colours: the header pyramid's own (30,44,38) fill, (183,185,176) silver, (176,144,72) bronze, (43,214,96) and (18,110,52) green. Replaces the `icon` SVG of 5.3 and the rule:

SVG source (`icon`):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M11 2.6 L20.2 18.2 H1.8 Z' fill='rgb(30,44,38)' stroke='rgb(183,185,176)' stroke-width='1.2' stroke-linejoin='round'/>
<path d='M11 2.6 L13.4 6.7 H8.6 Z' fill='rgb(176,144,72)'/>
<path d='M11 7.2 V18' stroke='rgb(43,214,96)' stroke-width='1.3' fill='none'/>
<rect x='0.8' y='18.6' width='20.4' height='1.4' fill='rgb(43,214,96)'/><rect x='0.8' y='20' width='20.4' height='0.9' fill='rgb(18,110,52)'/>
</svg>
```
Rule (replace the whole `#theme-banner::before` rule):
```css
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath d='M11 2.6 L20.2 18.2 H1.8 Z' fill='rgb(30,44,38)' stroke='rgb(183,185,176)' stroke-width='1.2' stroke-linejoin='round'/%3E%3Cpath d='M11 2.6 L13.4 6.7 H8.6 Z' fill='rgb(176,144,72)'/%3E%3Cpath d='M11 7.2 V18' stroke='rgb(43,214,96)' stroke-width='1.3' fill='none'/%3E%3Crect x='0.8' y='18.6' width='20.4' height='1.4' fill='rgb(43,214,96)'/%3E%3Crect x='0.8' y='20' width='20.4' height='0.9' fill='rgb(18,110,52)'/%3E%3C/svg%3E") center / 22px 22px no-repeat; }
```

**Remove button.** Why: bronze was the only destructive control in the batch that matched the decorative trim, so it did not read as "remove". The other five themes use a red fill; Necrons now does too, with its bronze ring kept (the ring stays the bronze trim, the red is the fill only). Fill `#B5301F`. Two edits in `warhammer-necrons.css`: in `:root` set `--remove-btn-bg: #B5301F;` (the border variable stays `#E6B85C`), and the rule becomes `.btn-remove:hover { background: #B5301F; }`. Contrast, computed with the gate's formula (the review's "`#7A2020` at 3:1" was not reachable: that colour is 1.74:1 against the tile; the ring is what carries the boundary):

| Theme | fill / tile | ring / tile | ring / fill | white cross / fill |
|---|---|---|---|---|
| imperium | 2.30 | 5.36 | 2.34 | 8.05 |
| chaos | 2.28 | 5.16 | 2.26 | 8.23 |
| orks | 2.12 | 7.02 | 3.30 | 7.78 |
| tyranids | 2.59 | 9.23 | 3.57 | 7.12 |
| eldar | 2.50 | 5.62 | 2.24 | 6.56 |
| necrons as built (bronze) | 3.01 | 9.62 | 3.20 | 5.91 |
| **necrons ruled `#B5301F`** | **2.88** | **9.62** | **3.34** | **6.16** |

The new fill is closer to the tile than the bronze was, but it is better than every other theme's fill, the ring is the highest ring in the batch, and the cross clears 4.5. The gate does not read the remove-button variables (grep of `check-theme-contrast.js`), so `npm run check:contrast` is unchanged. Section 5.6 "Done when" 6 changes to "no purple, blue or red, **except the fill of the tile remove button**". Section 5.5's edit-bar line ("The tile remove button is `#8A5A14` ...") reads `#B5301F` with the `#E6B85C` ring. The edit bar itself stays bronze.

#### A.6.4 warhammer (Imperium): banner icon and header seals, the rosette becomes a purity seal

Why: the red target (a big disc with concentric rings) on a short V-notched ribbon is a prize rosette. The new drawing is a lumpy wax blob with no rings (a small dark lancet stamped into it, no cross), hanging from two narrow paper tails of different lengths with square cuts and a few lines of script on the longer one, so it reads as wax on a scroll. Colours: wax (160,20,24), (100,12,14), (204,70,66); paper (240,232,204) and (226,214,178); ink (100,72,22) (a darker brown than the old (122,92,24) gold outline, so the paper holds against the parchment banner). Painted pixels of the icon x 5.0 to 17.3, y 0.5 to 21.8.

**The seal is drawn in two places, so both change or neither does** (otherwise the window shows two different seals): the banner icon, and the two seals in the header art, which are the same drawing at 0.78 scale (wax centred on the old seal positions x 19 and x 65, tails ending at y 19.6). The header art keeps its rail, its hangers, its lancet and its 84 x 20 box; painted pixels x 0.5 to 83.5, y 0.0 to 20.0 (was y 0.0 to 19.8). Replaces the `icon` and `hz` SVGs of 6.3.

SVG source (`icon`):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M11.6 8 H15.8 L16.4 19.4 L12.4 19.8 Z' fill='rgb(226,214,178)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M6 8 H10.2 V21.4 H6 Z' fill='rgb(240,232,204)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M7.2 13 H9 M7.2 15.2 H9 M7.2 17.4 H9' stroke='rgb(100,72,22)' stroke-width='0.6' fill='none'/>
<path d='M11 1.1 C13 0.6 14.8 1.4 15.6 3 C17 3.8 17.2 5.8 16.2 7.2 C16.4 8.8 15.2 10.2 13.6 10.4 C12.4 11.4 10.2 11.4 9 10.4 C7.2 10.4 6 8.8 6.2 7.2 C5 5.8 5.4 3.8 6.8 3 C7.6 1.6 9.2 0.8 11 1.1 Z' fill='rgb(160,20,24)' stroke='rgb(100,12,14)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M7.6 4 C8.4 2.8 9.8 2.4 11.2 2.7' fill='none' stroke='rgb(204,70,66)' stroke-width='0.9' stroke-linecap='round'/>
<path d='M11 4.2 Q12.6 5.4 12.6 7.6 V8.6 H9.4 V7.6 Q9.4 5.4 11 4.2 Z' fill='rgb(100,12,14)'/>
</svg>
```
Rule (replace the whole `#theme-banner::before` rule):
```css
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath d='M11.6 8 H15.8 L16.4 19.4 L12.4 19.8 Z' fill='rgb(226,214,178)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/%3E%3Cpath d='M6 8 H10.2 V21.4 H6 Z' fill='rgb(240,232,204)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/%3E%3Cpath d='M7.2 13 H9 M7.2 15.2 H9 M7.2 17.4 H9' stroke='rgb(100,72,22)' stroke-width='0.6' fill='none'/%3E%3Cpath d='M11 1.1 C13 0.6 14.8 1.4 15.6 3 C17 3.8 17.2 5.8 16.2 7.2 C16.4 8.8 15.2 10.2 13.6 10.4 C12.4 11.4 10.2 11.4 9 10.4 C7.2 10.4 6 8.8 6.2 7.2 C5 5.8 5.4 3.8 6.8 3 C7.6 1.6 9.2 0.8 11 1.1 Z' fill='rgb(160,20,24)' stroke='rgb(100,12,14)' stroke-width='0.9' stroke-linejoin='round'/%3E%3Cpath d='M7.6 4 C8.4 2.8 9.8 2.4 11.2 2.7' fill='none' stroke='rgb(204,70,66)' stroke-width='0.9' stroke-linecap='round'/%3E%3Cpath d='M11 4.2 Q12.6 5.4 12.6 7.6 V8.6 H9.4 V7.6 Q9.4 5.4 11 4.2 Z' fill='rgb(100,12,14)'/%3E%3C/svg%3E") center / 22px 22px no-repeat; }
```
SVG source (`hz`):
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<rect x='3' y='1' width='78' height='1.4' fill='rgb(122,92,24)'/><circle cx='2.4' cy='1.7' r='1.7' fill='rgb(199,154,44)'/><circle cx='81.6' cy='1.7' r='1.7' fill='rgb(199,154,44)'/>
<line x1='19' y1='2.4' x2='19' y2='3.4' stroke='rgb(122,92,24)' stroke-width='0.9'/><g transform='translate(10.42,2.9) scale(0.78)'><path d='M11.6 8 H15.8 L16.4 19.4 L12.4 19.8 Z' fill='rgb(226,214,178)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M6 8 H10.2 V21.4 H6 Z' fill='rgb(240,232,204)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M7.2 13 H9 M7.2 15.2 H9 M7.2 17.4 H9' stroke='rgb(100,72,22)' stroke-width='0.6' fill='none'/>
<path d='M11 1.1 C13 0.6 14.8 1.4 15.6 3 C17 3.8 17.2 5.8 16.2 7.2 C16.4 8.8 15.2 10.2 13.6 10.4 C12.4 11.4 10.2 11.4 9 10.4 C7.2 10.4 6 8.8 6.2 7.2 C5 5.8 5.4 3.8 6.8 3 C7.6 1.6 9.2 0.8 11 1.1 Z' fill='rgb(160,20,24)' stroke='rgb(100,12,14)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M7.6 4 C8.4 2.8 9.8 2.4 11.2 2.7' fill='none' stroke='rgb(204,70,66)' stroke-width='0.9' stroke-linecap='round'/>
<path d='M11 4.2 Q12.6 5.4 12.6 7.6 V8.6 H9.4 V7.6 Q9.4 5.4 11 4.2 Z' fill='rgb(100,12,14)'/></g>
<path d='M37.5 19.2 V10 Q37.5 5.4 42 3.2 Q46.5 5.4 46.5 10 V19.2 Z' fill='rgb(44,34,18)' stroke='rgb(199,154,44)' stroke-width='1' stroke-linejoin='round'/>
<path d='M39.7 19.2 V10.4 Q39.7 7.4 42 6.2 Q44.3 7.4 44.3 10.4 V19.2 Z' fill='rgb(100,12,14)'/><path d='M42 6.2 V19.2' stroke='rgb(122,92,24)' stroke-width='0.6'/>
<line x1='65' y1='2.4' x2='65' y2='3.4' stroke='rgb(122,92,24)' stroke-width='0.9'/><g transform='translate(56.42,2.9) scale(0.78)'><path d='M11.6 8 H15.8 L16.4 19.4 L12.4 19.8 Z' fill='rgb(226,214,178)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M6 8 H10.2 V21.4 H6 Z' fill='rgb(240,232,204)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/>
<path d='M7.2 13 H9 M7.2 15.2 H9 M7.2 17.4 H9' stroke='rgb(100,72,22)' stroke-width='0.6' fill='none'/>
<path d='M11 1.1 C13 0.6 14.8 1.4 15.6 3 C17 3.8 17.2 5.8 16.2 7.2 C16.4 8.8 15.2 10.2 13.6 10.4 C12.4 11.4 10.2 11.4 9 10.4 C7.2 10.4 6 8.8 6.2 7.2 C5 5.8 5.4 3.8 6.8 3 C7.6 1.6 9.2 0.8 11 1.1 Z' fill='rgb(160,20,24)' stroke='rgb(100,12,14)' stroke-width='0.9' stroke-linejoin='round'/>
<path d='M7.6 4 C8.4 2.8 9.8 2.4 11.2 2.7' fill='none' stroke='rgb(204,70,66)' stroke-width='0.9' stroke-linecap='round'/>
<path d='M11 4.2 Q12.6 5.4 12.6 7.6 V8.6 H9.4 V7.6 Q9.4 5.4 11 4.2 Z' fill='rgb(100,12,14)'/></g>
</svg>
```
Rule (replace the whole `#header::after` rule):
```css
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'%3E%3Crect x='3' y='1' width='78' height='1.4' fill='rgb(122,92,24)'/%3E%3Ccircle cx='2.4' cy='1.7' r='1.7' fill='rgb(199,154,44)'/%3E%3Ccircle cx='81.6' cy='1.7' r='1.7' fill='rgb(199,154,44)'/%3E%3Cline x1='19' y1='2.4' x2='19' y2='3.4' stroke='rgb(122,92,24)' stroke-width='0.9'/%3E%3Cg transform='translate(10.42,2.9) scale(0.78)'%3E%3Cpath d='M11.6 8 H15.8 L16.4 19.4 L12.4 19.8 Z' fill='rgb(226,214,178)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/%3E%3Cpath d='M6 8 H10.2 V21.4 H6 Z' fill='rgb(240,232,204)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/%3E%3Cpath d='M7.2 13 H9 M7.2 15.2 H9 M7.2 17.4 H9' stroke='rgb(100,72,22)' stroke-width='0.6' fill='none'/%3E%3Cpath d='M11 1.1 C13 0.6 14.8 1.4 15.6 3 C17 3.8 17.2 5.8 16.2 7.2 C16.4 8.8 15.2 10.2 13.6 10.4 C12.4 11.4 10.2 11.4 9 10.4 C7.2 10.4 6 8.8 6.2 7.2 C5 5.8 5.4 3.8 6.8 3 C7.6 1.6 9.2 0.8 11 1.1 Z' fill='rgb(160,20,24)' stroke='rgb(100,12,14)' stroke-width='0.9' stroke-linejoin='round'/%3E%3Cpath d='M7.6 4 C8.4 2.8 9.8 2.4 11.2 2.7' fill='none' stroke='rgb(204,70,66)' stroke-width='0.9' stroke-linecap='round'/%3E%3Cpath d='M11 4.2 Q12.6 5.4 12.6 7.6 V8.6 H9.4 V7.6 Q9.4 5.4 11 4.2 Z' fill='rgb(100,12,14)'/%3E%3C/g%3E%3Cpath d='M37.5 19.2 V10 Q37.5 5.4 42 3.2 Q46.5 5.4 46.5 10 V19.2 Z' fill='rgb(44,34,18)' stroke='rgb(199,154,44)' stroke-width='1' stroke-linejoin='round'/%3E%3Cpath d='M39.7 19.2 V10.4 Q39.7 7.4 42 6.2 Q44.3 7.4 44.3 10.4 V19.2 Z' fill='rgb(100,12,14)'/%3E%3Cpath d='M42 6.2 V19.2' stroke='rgb(122,92,24)' stroke-width='0.6'/%3E%3Cline x1='65' y1='2.4' x2='65' y2='3.4' stroke='rgb(122,92,24)' stroke-width='0.9'/%3E%3Cg transform='translate(56.42,2.9) scale(0.78)'%3E%3Cpath d='M11.6 8 H15.8 L16.4 19.4 L12.4 19.8 Z' fill='rgb(226,214,178)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/%3E%3Cpath d='M6 8 H10.2 V21.4 H6 Z' fill='rgb(240,232,204)' stroke='rgb(100,72,22)' stroke-width='0.7' stroke-linejoin='round'/%3E%3Cpath d='M7.2 13 H9 M7.2 15.2 H9 M7.2 17.4 H9' stroke='rgb(100,72,22)' stroke-width='0.6' fill='none'/%3E%3Cpath d='M11 1.1 C13 0.6 14.8 1.4 15.6 3 C17 3.8 17.2 5.8 16.2 7.2 C16.4 8.8 15.2 10.2 13.6 10.4 C12.4 11.4 10.2 11.4 9 10.4 C7.2 10.4 6 8.8 6.2 7.2 C5 5.8 5.4 3.8 6.8 3 C7.6 1.6 9.2 0.8 11 1.1 Z' fill='rgb(160,20,24)' stroke='rgb(100,12,14)' stroke-width='0.9' stroke-linejoin='round'/%3E%3Cpath d='M7.6 4 C8.4 2.8 9.8 2.4 11.2 2.7' fill='none' stroke='rgb(204,70,66)' stroke-width='0.9' stroke-linecap='round'/%3E%3Cpath d='M11 4.2 Q12.6 5.4 12.6 7.6 V8.6 H9.4 V7.6 Q9.4 5.4 11 4.2 Z' fill='rgb(100,12,14)'/%3E%3C/g%3E%3C/svg%3E") no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
```
Colour discipline (6.6 item 6) still holds: red only in the seals, niches, banner icon, diamonds, edit mode and remove button; nothing blue, green or purple. Section 6's watch item 3 ("rosette") and Watch item 3 of section 8 (seal and hexagon icons) are closed by A.6.3 and A.6.4.

#### A.6.5 Done when for the four redraws (Ender measures, Judy re-checks)

1. The three banner icons and the two `hz` pieces are exactly the strings above (a byte diff of the `url(...)` values against this text is the check); nothing else in the six files changes except A.2 (Eldar), A.5 (Orks) and the Necrons remove-button lines.
2. A/B/C overlap probe at 424 x 300, 640 x 420 and 1024 x 700 and in the chip, edit, update and focus-ring states for chaos, tyranids, necrons and imperium: overlap 0 px, art in the keep-out 0 px (the boxes are unchanged; the new art sits inside the old painted extents except the Tyranid art, which is smaller). Use `visibility: hidden` on the banner icon in the art-off override, as 0.4 says.
3. At 1x the banner icons read as a horn, a pyramid and a wax seal (8x pixel crops of the 1x render, as I took them), and the Tyranid header reads as jaws around a gem; a fan, asked to name what each is, should not say "wheel", "Y", "rosette" or "horns".
4. Necrons edit mode: the tile remove buttons are red with the bronze ring and a white cross; the hover state stays the same red.
5. `npm run check:contrast`, `grep -c infinite` on all four files and `loopingAnimationsAtCapture` are unchanged (0 infinite, 0 loops, no new gate failures).
6. Chaos "Done when" 6, Necrons 6 (with the remove-button exception), Imperium 6 and Tyranids 6 hold on a hue scan of the art zones (the hue scan of the batch-4 review, the same method).

### A.7 What this addendum supersedes in the sections above

| Where | What changes |
|---|---|
| 1.3 (chaos) `icon` SVG and `#theme-banner::before` rule; 1.1 icon notes; Chaos watch items | A.6.1 |
| 2.2 type table, 2.3 `.tile-label` rule, 2.5 label line, 2.6 "Done when" 9 (`fontsRendered` loses Ink Free), Orks watch item 1, the 0.7 fonts-table row for Ink Free, the file header comment (orks); section 7 rank 3 (an Ork wish font) is no longer needed | A.5 |
| 3.3 (tyranids) `hz` SVG and `#header::after` rule; the "mandibles" wording of 0.3 stays (the art is still a pair of mandibles and a bulb) | A.6.2 |
| 4.2 type table, 4.3 `:root` weight, `#title`, `.tile-label`, `#theme-banner-text`; 4.6 "Done when" 9 (`fontsRendered` now lists `Palatino Linotype` and `Cormorant Garamond`); 0.7 fonts table (add the row: `'Cormorant Garamond'`, italic 600/500, warhammer-eldar title, labels and banner, Cyrillic yes); section 7 rank 1 (taken) | A.2 |
| 5.3 (necrons) `icon` SVG and rule; 5.5 edit-bar and remove-button line; 5.6 "Done when" 6; Necrons watch item 1 (hexagon) | A.6.3 |
| 6.3 (imperium) `icon` SVG, `hz` SVG and both rules; Imperium watch items 1 and the seal part of 3 | A.6.4, A.1 |
| Section 8 flags 1 to 5; "Seal and hexagon icons" watch item; section 8 summary "Type" line (add Cormorant Garamond) | answered in A.0 to A.5 |
| The batch-4 review (F4, for Sergei): spiked wheel, mandibles, Y badge, rosette, bronze remove button, and his five flags | answered here; F2 (`THEME_BANNERS` comment) is untouched; F3 (spec text for the Orks and Eldar `.tile-label` rules) is satisfied by A.2 and A.5 |

### A.8 Verification, process and what I did not verify

- **The text of this addendum is the contract and was tested as text:** I pasted the five CSS rules that carry the new art (three `#theme-banner::before`, two `#header::after`) straight out of this file into the four built themes (Necrons with its two remove-button lines) and rendered 424 x 300 at 1x: **0 differing pixels** against the candidates I judged, in all four; the control (the old Chaos icon against the new) differs by 67.7 weighted pixels, so the comparison can fail. The Orks rule is byte-identical to the one measured in A.5.
- **Rendered:** every candidate on the built theme files (chaos, necrons, imperium, tyranids at 424 x 300, 1x and 3x; Necrons and Imperium also in edit mode; Imperium bright and mid side by side; Orks as built, Impact 12 px and Impact 13 px at 1x and 3x, grid and edit; the awkward-names shot). The numbers in A.5 come from the same measure function the batch-4 work used and reproduce the shipped Orks numbers exactly.
- **Evidence** (all under the session scratchpad, `...\scratchpad\judy\b4flags\out\`): `c3-icons-1x-8x.png` (chaos, necrons, imperium banner icons, 1x pixels at 8x), `k4.png` (Tyranid header at 1x, 8x), `r4-sheet.png` and `r1-sheet.png` (old against new, 1x at 8x beside vector at 6x), `r5-sheet.png` (Imperium header seals old against new), `c1-warhammer-*-new-grid.png` and `c1-warhammer-necrons-new-edit.png` (full window at 3x), `c2-bright-vs-mid-edit.png` and `c2-warhammer-new-mid-grid.png` (parchment), `oi12-warhammer-orks-grid-3x.png`, `oi12-warhammer-orks-edit-3x.png`, `oi12-names-crop3x.png` and `underline-compare.png` (Impact labels; the last stacks Ink Free over Impact in edit mode), `*-measure.json`.
- **Not verified:** Cormorant Garamond itself (not rendered: A.2 numbers are estimates); Electron renders (this is the Edge mock; Ender's numbers win, as in 0.4); Impact and the new art on a Windows install without ClearType; the full 11-state A/B/C probe and the hue scan on the new art (Ender runs both, A.6.5); the other 95 themes (nothing here touches them).
- **Process:** no QuickLaunch launch was made. The mock used headless Edge on temp profiles inside the scratchpad, driven with `Runtime.evaluate`, `Emulation`, `Page.captureScreenshot` and read-only DOM and CSS calls (no `Input.*`). This build of headless Edge writes no `DevToolsActivePort` file, so port ownership was proved a different way: the browser root PID found by its command line (our profile path, no `--type=`) had to be the PID that netstat shows listening on the chosen port before any driver call. Every Edge tree was ended by that root PID and a command-line sweep after each run; the final sweep is recorded in the report to Jane.
