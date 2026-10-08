# QuickLaunch theme spec, batch 3 (Judy, 2026-09-30)

Status: complete. Batch-level section (0), seven theme sections (1 to 7), fonts that would still lift the batch (8), summary (9), open items (10). Uncommitted, as instructed.

Themes: ac-assassins, ac-templars, swl-templar, swl-dragon, swl-illuminati, doom-classic, doom-eternal (audit section 7, batch 3, "Assassin's Creed, Secret World, Doom").
For: Ender. Branch `wip/theme-fidelity`. **Written against the post-Foundation base** (Foundation spec Parts A and B: `scrollbar-gutter: stable` on `#grid-container`, the `#header::after` thresholds, the scrolling overlays, the banner fit check, the seven bundled fonts). Batches 1 and 2 are committed and review-passed; Sergei approved batch 1.
Franchise calls (no new era decisions needed): ac-assassins is the Animus layer (present-day interface, all games); ac-templars is the two-layer Order (Knights Templar heraldry over Abstergo's corporate lab); the three swl themes are the Secret World Legends factions (Templars, Dragon, Illuminati); doom-classic is DOOM (1993); doom-eternal is DOOM Eternal (2020).

Inputs read: the audit (`QuickLaunch_ThemeAudit_2026-09-30.md`: section 1 shared constraints, the seven entries, the batch 3 row, the font wishlist), Sergei's rulings (`QuickLaunch_ThemeFidelity_Plan_2026-09-29.md`), Makoto's reference sheet (Assassin's Creed, Secret World Legends and Doom entries, the SWL entries as rewritten from web sources), the Foundation spec (Parts A and B, the fonts map and fallback table), batch 1 (sections 0 and 12), batch 2 (sections 0, 11 and 12), the seven current theme files, `base.css` and `index.html` (repo and Ender's working tree), `scripts/check-theme-contrast.js`, the CPU tiers in `create-theme.md`, `THEME_BANNERS` in `app.js` for the seven keys, and the seven current gallery shots (grid, hover, settings; the grid and hover shots viewed). Every banner line was checked on the web (0.8). **QuickLaunch was not launched.** Only this file was written in the repo tree; scratch files live in the session scratchpad.

**Shared constraints are not restated.** Every section inherits audit section 1 (C1 to C5, H1 to H8), batch 1 sections 0 and 12, batch 2 sections 0, 11 and 12, and Foundation Parts A and B by reference (0.1 lists them). Where a rule is the same I point to it.

## At a glance

| # | Theme | Direction | Infinite animations, before to after | Lowest ratio (text / non-text) | Type | Squint (expected) |
|---|---|---|---|---|---|---|
| 1 | ac-assassins | The Animus: cool near-black, hood-white type, cyan hairlines and focus, a sash-red header tick, a hex-cell strip, a memory-sync bar, a hooded-figure icon and an eagle in the banner, hexagon plates | 6 to **0** | 4.68 / 3.61 | Cinzel 700 title (bundled), Segoe UI Semibold labels | 4 |
| 2 | ac-templars | The Order behind Abstergo: graphite and silver, a DNA-helix strip, a silver-glass banner strip carrying a red lab-door disc and a Templar shield with a red flared cross, silver hover, red only on focus, edit and the small marks | 5 to **0** | 5.42 / 3.32 | Jost 400 title, labels and banner (bundled) | 4 |
| 3 | swl-templar | Temple Hall, London: warm black stone, a colonnade frame (dentil cornice, fluted pilasters), red banners with white crosses in the header, a Greek-key course, one big red banner and a temple icon in the banner strip, banner-tail plates | 5 to **0** | 5.86 / 3.17 | UnifrakturCook 700 title (lowercase), Palatino labels, IM Fell English banner (bundled) | 4 |
| 4 | swl-dragon | Seoul, green lamps on concrete: jade and gold on green-black, a gold Hangul tag and a string of lanterns, scattered dots and one ripple ring on the pad, a gold coin and ripples from a pebble in a concrete-grey banner, pointed-hex plates | 6 (+1 hover) to **0** | 6.86 / 6.19 | Malgun Gothic (Bold title and tag) | 3 |
| 5 | swl-illuminati | New York, blue and black: navy-black with silver type and thin steel-blue rules, a stepped ziggurat in the header, an eye in a triangle and a setback skyline in the banner, dossier-corner plates, one warm colour for edit and errors only | 6 (+1 hover) to **0** | 5.46 / 3.40 | Segoe UI Semibold | 4 |
| 6 | doom-classic | DOOM (1993): brown-black with a bevelled brown-grey status bar for the banner (red pixel "100%" and "200%" windows around the text), three keycards in the header, riveted metal strips down both sides, 1993 bevels on the tiles | 5 to **0** | 4.96 / 3.43 | Courier New Bold | 5 |
| 7 | doom-eternal | DOOM Eternal: black and hellfire, an orange slab behind the title, five chevrons in the header, a hazard-slash band and left-pointing chevrons in the banner, three claw slashes for the icon, hard-cut corners, a bottom-right plate cut, cyan only for edit | 6 to **0** | 4.97 / 4.58 | Bahnschrift SemiBold SemiCondensed italic | 4 |
| | **Batch** | | **39 (+2 hover-only) to 0** | **text 4.68 (ac-assassins, recording text on its input fill); non-text 3.17 (swl-templar, crimson hover border on its hover fill); icons 3.18 (swl-illuminati, Calculator plate on the hover fill)** | | |

"Lowest ratio" is the minimum over every pair in that theme's tables (gate pairs, add-on pairs and the generic accent-on-fill roles); text pairs need 4.5, non-text pairs 3. Every pair in every theme clears its threshold. Lowest gate margin: swl-templar `--accent-c` at 3.45:1 (needs 3), then ac-templars at 3.64:1 and doom-classic at 3.76:1. The real gate script, run on the seven prototype files, reported **7 checked, 0 errors, 0 legacy warnings**; ac-templars and swl-templar leave the legacy list.

Art call (audit section 7 said 5 redraw, 2 tone down): ac-assassins, ac-templars, swl-templar, doom-classic and doom-eternal are **redraw**; swl-dragon and swl-illuminati are **tone down with small new motifs** (a restrained ground plus three or four small originals each; no big painted panno, no lore text).

---

## 0. Batch-level section (applies to all seven)

### 0.1 What is inherited (pointers; not restated)

B1 = `WIP/QuickLaunch/Docs/QuickLaunch_ThemeSpec_Batch01_2026-09-30.md`, B2 = `..._Batch02_...`, F = `QuickLaunch_ThemeSpec_Foundation_2026-09-30.md`.

| Rule | Where |
|---|---|
| Header art zone HZ: box 84 x 20 at `right:172px; top:10px` (x 168 to 252, y 10 to 30) with an **explicit `width`**; the title must end at x 156 or earlier; hidden while the filter chip shows (`#header:has(#filter-chip:not(.hidden))::after { display:none; }`, kept in every theme block; base now has it too), hidden below 424 px window width | B1 0.2, 0.1.5; F A2 |
| Frame art lives in `#grid-container`'s own `background` (not pseudo-elements); bands FZ-L (x 1 to 11), FZ-R (**window x W-15 to W-5, that is `right 5px`, 10 px wide**), FZ-T (container y 1 to 11, window y 41 to 51); the tile field is **x 16 to W-20 at every size** and its 4 px keep-out is x 12 to W-16, y 52 to the banner top | B1 0.1.1, 0.1.4, 0.2; B2 0.2.1; F A4 |
| Banner: top strip BZ-T (up to 7 px), icon slot BZ-I (22 x 22 at x 14, text starts at x 46; a theme may widen the slot and states the new text start), art anchored to fixed offsets | B1 0.2 |
| Header lines are drawn **inside** the header (`border-bottom-color` plus `box-shadow: inset 0 -2px 0`); nothing paints below y 40 | B1 12.1 items 2, F3, F4 |
| The settings version value takes `--accent-text`: `#app-version { color: var(--accent-text); }` | B1 12.1 item 4, F2 |
| `#app::after` (z 199) paints above tiles, icons and the header: texture only, low alpha; **this batch has none** (`background: none`) | B1 0.1.2, F7 |
| Ghost-text removal (`#grid-container::before/::after`, `#particles`, `#edit-bar::after`, `#header::after` text, `#app` animation, title and banner-icon animations) and the `\A` trap | B1 0.3 (per-theme keyframe names in 0.5 below) |
| Shared tile rules: focus = hover plus ring; no label halo; no sheen sweep; tile layout unchanged (border 1 px, tile height 94.7 to 95.4); opaque backgrounds; `--glow-*`, `--pulse-glow` and `--scanlines` are `none`; `--tile-icon-glow` is the no-op filter | B1 0.4 |
| Contrast method (gate pairs, add-on pairs, generic accent-on-fill roles, icons through the fx filter on rest, hover and pressed grounds; `brightness()` never below 1.0 on a dark theme; the gate reads the **first** `--name:` match, so the five gate variables are opaque hex and never appear in comments above `:root`) | B1 0.5, 0.1.8, 0.1.9, 0.1.11 |
| Texture measure: hidden-tiles shot, mean per-tile luminance sigma; the recorded ceiling is promise-mascot's 3.72 | B1 0.6; B2 12.1 |
| Infinite-animation counting and the tier key | B1 0.7; `create-theme.md` (CPU-efficient animations) |
| Verification set (grid, hover on CALCULATOR, settings, hidden-tiles, 640 x 420, 1024 x 700, focus ring, filter chip, edit mode, update banner, skin picker, scrolled one row) | B1 0.8 |
| The A/B/C overlap probe: A hides art and content, B shows art only, C shows content only; art = diff(B,A), content = diff(C,A); overlap must be 0 px and art inside the keep-out 0 px, at 424 x 300, 640 x 420, 1024 x 700 and in the chip, edit-bar, update-bar and focus-ring states | B1 12.3; B2 0.4, 12.1 |
| Squint test: cover the title and banner text; a fan must still name the franchise. Colour-discipline checks in each "Done when" apply to the chrome and exclude the six tile icons (the apps' own art) | B1 12.2; B2 11.2 |
| Review lessons: never put art within 3 px of a focus ring; no art under text; banner text on one line; check every state | B1 12.1, 12.8; B2 11, 12 |
| Bundled fonts: the seven family strings, `font-display: block`, only declared weights, `font-synthesis: none`, display faces on `#title` only, blackletter lowercase, the title width ladder (edge at most 156), the label gate, banner fit, `line-height: 1.2` on display titles, wait for `document.fonts.ready`; the Cyrillic fallback stacks | F B1, B2, B5 |
| Base-layout fixes this batch relies on: scrolling Settings and cheat-sheet, banner fit check, `scrollbar-gutter: stable` | F A1, A3, A4 |

### 0.2 Facts from earlier batches and the Foundation that this spec relies on

1. **Post-Foundation geometry.** With `scrollbar-gutter: stable` the tile field ends at W-20 at every size, the focus ring at W-16, so the right band (window x W-15 to W-5, `right 5px`) clears it by 1 px and the 4 px scroll thumb (W-4 to W) by 1 px, at 424 x 300 and at any larger window. Batch 1 and batch 2 offsets are unchanged; this batch needs no no-scrollbar case.
2. **`:has()` works** in the shipped Electron (`^32`, Chromium 128); the chip-hides-art rule is proven.
3. **`font-stretch` reaches Bahnschrift only as the SemiCondensed face** (B2 0.2.3). Doom Eternal uses `font-stretch: 87.5%` and says so.
4. **Texture ceiling: 3.72** (promise-mascot, measured). No theme in this batch has any texture; every hidden-tiles sigma is 0.00.
5. **Icon numbers to beat.** The lowest non-Terminal plate ratio over rest, hover and pressed in this batch is 3.18 (swl-illuminati, Calculator on the hover fill); none of the seven has grain, so no texture penalty applies.
6. **The bundled fonts exist in the working tree** (`src/renderer/fonts/`). I read four of them read-only (Cinzel-VF, Jost-VF, IMFeENrm28P, UnifrakturCook-Bold) into my mock to measure real widths; I did not copy, edit or ship anything. Dela Gothic One, Pirata One and Metamorphous are not used in this batch.
7. **The banner fit check (F A3) is the net, not the plan.** Every line below fits by design, with at least 30 px between the end of the longest line and any banner motif (0.8).

### 0.3 New in batch 3 (rules that batches 1 and 2 did not need)

1. **Four themes adopt bundled fonts**, exactly as the Foundation B3 map says: ac-assassins `Cinzel` (title), ac-templars `Jost` (title, labels, banner), swl-templar `UnifrakturCook` (title, lowercase) and `IM Fell English` (banner, roman, 12 px). Each names its `font-weight`, `font-style: normal` and `font-synthesis: none`, its Cyrillic fallback (F B5) and its measured title edge. **One departure from the map, stated in 0.10:** ac-templars uses Jost at **400**, not 300.
2. **Where the looks come from.** Besides Makoto's sheet I used the TV Tropes "Characters in The Secret World: The Big Three" page (fetched, raw text read), which reproduces the in-game faction pitches and describes each faction's setting: Templars, "territory is plastered with red banners and white crosses, and even the architecture of their base is heavily Classical, with lots of straight lines, right angles and elegantly squared proportions", uniforms "deep crimson"; Illuminati, "sleek blue and black corporate detailing, and even the architecture of their base is sharp and triangular, with a multi-tiered structure, a shadowy atmosphere and blue lighting" (the Labyrinth's concourse is a pyramid); Dragon, "territory is full of green lanterns and grey concrete", architecture "very circular and spiralling and mazelike", "the Dragon have a specific attachment to the colour green". The Templar and Dragon art below follows that evidence, not the audit's guesses (0.10).
3. **Korean text through CSS `content`** (swl-dragon header tag 서울). Malgun Gothic Bold has U+C11C and U+C6B8 (checked against two controls: Segoe UI has no Hangul, Ebrima has no Cyrillic; both correctly returned no glyph), and also covers U+0416, U+042F and U+0431. Write the characters literally (UTF-8, no BOM); the escape form is `'\C11C\C6B8'` (each escape is followed by a backslash or a quote, never a hex digit; neither form contains `\A`).
4. **One light banner on a dark theme** (ac-templars, a silver strip with ink text). The banner holds only its own text and marks, so the base rules that assume a dark ground (B1 0.1.12) do not reach it; the edit bar and update bar below it stay dark and carry their own colours.
5. **Pixel digits as SVG rectangles** (doom-classic). The two status-bar windows draw "100%" and "200%" out of `<rect>` elements (5 x 7 pixel glyphs, 2 px per pixel): no `<text>`, no font dependency. They are decoration, not data.
6. **A four-colour bevel** (doom-classic): `border-color: light dark dark light` on the rest tile, one colour on hover and focus.
7. **`calc()` in banner background sizes** (doom-classic): the text window is a gradient rectangle sized `calc(100% - 156px)`, so it follows the window width.
8. **Hover recolours the label** in swl-dragon, doom-classic and doom-eternal (`color` only, on the label; contrast on the hover fill is in each table).
9. **A header slab** (doom-eternal) is the header's own background layer, like persona-5's black slabs (B2 0.3.2): it is surface, not art, for the probe (each "Done when" lists the exact art-off override).
10. **A pseudo-element with text and art** (swl-dragon `#header::after`): the tag sits at the left of the 84 px box, the lanterns are right-aligned in it (54 px), so the two never overlap.
11. **One-shot entrance kept**: `--app-entrance-anim: entrance-fade 0.8s ease-out forwards` (doom-classic `entrance-fade 0.8s steps(4) forwards`); one-shot, not counted. The old `entrance-flash` and `entrance-zoom` (doom-eternal, swl-illuminati) are retired.

### 0.4 How this spec was verified (I could render, without launching QuickLaunch)

I built the **post-Foundation mock window**: the repo's `base.css` and `index.html` with the Foundation's rules applied verbatim (A1 scrolling overlays, A2 the `#header::after` block, A4 the gutter), the gallery's 14 mock tiles, one candidate theme file, headless Edge 154 (not QuickLaunch, not Electron) at 424 x 300 and 1.5x inside an iframe of the exact window size; every Edge launch passed `--user-data-dir=<scratchpad>/judy/profile`. I diffed my mock base against Ender's working-tree `base.css`: the rules are the same, only comments differ. On that mock I measured, for all seven candidate files: title right edges, label widths, every banner string, the hidden-tiles sigma, the A/B/C overlap probe at 424 x 300, 640 x 420 and 1024 x 700 plus the states shot (chip, edit bar, update bar, focus ring), and the squint sheets (title and banner text painted over, 1.6 px blur).

- **Gate:** the real `check-theme-contrast.js`, run on copies of the seven files in a temp skeleton (no rebaseline): **7 checked, 0 errors**. **Positive control:** with one `--text-dim` set to `#4A3A3A` the same run reports 1 error (`1.87:1`); restored, 0 errors.
- **Probe:** 28 runs (7 themes x grid at three sizes, plus the states shot at 424 x 300): **overlap 0 px and art in the keep-out 0 px in every run.** Smallest art-to-content clearance in the default grid shot: 4.0 px (swl-templar and doom-eternal); larger windows 5.3 to 10.7 px. In the states shot the smallest is 1.3 px (ac-assassins, swl-templar, doom-classic, doom-eternal): the last partly visible tile row meeting the banner's top edge at the container boundary, which touches by construction (batch 1 and batch 2 had the same). **Positive control:** with a magenta rect planted over the title in `#header::after`, the probe reports overlap 683 px (ac-assassins), 593 px (swl-templar) and 632 px (doom-eternal).
- **Fonts:** the four bundled faces load in the mock (a test page set each in its own family; each renders in its own design), and a misspelled family falls back to the next face (F B2 rule 9 controls).
- **Motion:** `grep -c infinite` is 0, no `@keyframes`, no `animation:`, no `will-change`, no `backdrop-filter`, no `\A`, no translucent colour in any of the seven.

**Caveats.** Chromium 154 is not Electron 32; sub-pixel text and filter rounding can differ by a little, so **Ender's numbers win** over mine where they differ. The mock's renders are the target look, not a pixel contract. I did not see: the skin-picker list open, the empty-library drop hint, edit-mode tile ✕ buttons over the plates. The prototype files (`t_*.py`, `art_*.py`) and renders are in the session scratchpad at `judy/b3/`; **this spec's text is the contract.**

### 0.5 Deletions per theme (pattern in B1 0.3; here are the keyframe sets)

Delete every rule listed in B1 0.3 in each file, plus these `@keyframes`, which nothing else uses: ac-assassins `assassin-title`, `assassin-blade`, `assassin-readout`, `assassin-border`, `assassin-dust`; ac-templars `templar-title`, `templar-cross`, `templar-readout`, `templar-border`; swl-templar `swlt-title`, `swlt-hud`, `swlt-readout`, `swlt-border`; swl-dragon `dragon-title`, `dragon-chaos`, `dragon-readout`, `dragon-border`, `dragon-drift`; swl-illuminati `illum-title`, `illum-eye`, `illum-readout`, `illum-border`, `illum-data`; doom-classic `doom-title`, `doom-hud`, `doom-readout`, `doom-border`; doom-eternal `doom-title`, `doom-device`, `doom-readout`, `doom-border`, `doom-slash` (the `doom-*` names repeat in the two Doom files; each file is deleted on its own). Also delete each file's `.app-tile::before` shape and `.app-tile:hover::before` animation rules (replaced by `.app-tile::before { display:none; }`), the two hover-only infinite `tile-flicker` rules in swl-dragon and swl-illuminati, the `--banner-icon-anim` and `--title-anim` values (set to `none`), and set `--app-entrance-anim: entrance-fade 0.8s ease-out forwards` (doom-classic `entrance-fade 0.8s steps(4) forwards`).

### 0.6 Motion inventory (before to after; method B1 0.7; "hover-only" is counted separately)

Tier key (create-theme.md, cheapest first): 1 opacity or transform, 2 colour or text-shadow, 3 filter, 4 background-position or size, 5 box-shadow, 6 clip-path.

| Theme | Today (infinite, running at capture) | Hover-only today | After |
|---|---|---|---|
| ac-assassins | 6: `assassin-title` colour, opacity, text-shadow (2); `banner-pulse` banner icon opacity (1); `assassin-blade` grid-container::before opacity (1); `assassin-readout` ::after colour (2); `assassin-border` `#app` box-shadow (5); `assassin-dust` `#particles` background-position (4) | none infinite (`tile-radial`, one-shot) | **0** |
| ac-templars | 5: `templar-title` (2); `banner-pulse` (1); `templar-cross` (1); `templar-readout` (2); `templar-border` (5) | none infinite (`tile-scan-v`, one-shot) | **0** |
| swl-templar | 5: `swlt-title` (2); `banner-pulse` (1); `swlt-hud` (1); `swlt-readout` (2); `swlt-border` (5) | none infinite (`tile-scan-v`, one-shot) | **0** |
| swl-dragon | 6: `dragon-title` (2); `banner-pulse` (1); `dragon-chaos` (1); `dragon-readout` (2); `dragon-border` (5); `dragon-drift` `#particles` (4) | `tile-flicker .4s steps(1) infinite` (opacity, 1) | **0** |
| swl-illuminati | 6: `illum-title` (2); `banner-throb` transform, opacity (1); `illum-eye` (1); `illum-readout` (2); `illum-border` (5); `illum-data` `#particles` (4) | `tile-flicker .4s steps(1) infinite` (1) | **0** |
| doom-classic | 5: `doom-title` (2); `banner-pulse` (1); `doom-hud` (1); `doom-readout` (2); `doom-border` (5) | none infinite (`tile-scan-v`, one-shot) | **0** |
| doom-eternal | 6: `doom-title` (2); `banner-pulse` (1); `doom-device` (1); `doom-readout` (2); `doom-border` (5); `doom-slash` `#particles` (4) | none infinite (`tile-flicker .3s steps(1) 2`, two iterations) | **0** |
| **Batch total** | **39** (gallery `loopingAnimationsAtCapture`: 6, 5, 5, 6, 6, 5, 6) | 2 | **0** |

No new infinite animation is added anywhere (the "no higher than today" limit is met at 0). There is no `will-change` in any theme file. The only motion left in any state is the base one-shot `transition` on tiles (0.12 s) and the one-shot entrance fade. By the measured tiers in `create-theme.md`, a whole animated theme costs 55 to 83 percent of one core while focused; these seven cost the 0.5 percent idle floor. Acceptance: `grep -c infinite <theme>.css` is 0 for all seven and the after-run `loopingAnimationsAtCapture` is 0 for all seven (it was 6, 5, 5, 6, 6, 5, 6).

### 0.7 Fonts used

| Family (CSS) | File(s) | Themes | Cyrillic |
|---|---|---|---|
| **`'Cinzel'`** (bundled, variable 400 to 900) | `fonts/cinzel/Cinzel-VF.ttf` | ac-assassins title (700) | no; falls to Palatino Linotype (title is Latin only) |
| **`'Jost'`** (bundled, variable 100 to 900) | `fonts/jost/Jost-VF.ttf` | ac-templars title, labels, banner (400) | yes |
| **`'UnifrakturCook'`** (bundled, Bold only) | `fonts/unifrakturcook/UnifrakturCook-Bold.ttf` | swl-templar title (700, lowercase) | no; title is Latin only, falls to Palatino Linotype |
| **`'IM Fell English'`** (bundled, roman only) | `fonts/imfellenglish/IMFeENrm28P.ttf` | swl-templar banner (400, 12 px, `font-style: normal`) | no; banner strings are Latin, falls to Georgia |
| Segoe UI, Segoe UI Semibold | `segoeui.ttf`, `seguisb.ttf` | ac-assassins body, labels, banner; swl-illuminati body, title, labels, banner (Semibold) | yes |
| Palatino Linotype (regular, bold) | `pala.ttf`, `palab.ttf` | swl-templar body and labels; fallback for Cinzel and UnifrakturCook | yes |
| Malgun Gothic (regular, bold) | `malgun.ttf`, `malgunbd.ttf` | swl-dragon everything (title and tag Bold), Hangul for 서울 | yes (U+0416, U+042F, U+0431 checked) |
| Courier New, Courier New Bold | `cour.ttf`, `courbd.ttf` | doom-classic everything (Bold) | yes |
| Bahnschrift (variable; SemiCondensed through `font-stretch: 87.5%`) | `bahnschrift.ttf` | doom-eternal everything | yes |
| Georgia | `georgia.ttf` | fallback for IM Fell English only | yes |

Not used: Dela Gothic One, Pirata One, Metamorphous (approved, not needed here), and every non-approved face (F B7 lists what I still wish for). Cyrillic tile names fall to the first Cyrillic-covering face of each stack: Jost (ac-templars), Segoe UI Semibold, Palatino Linotype, Malgun Gothic, Courier New, Bahnschrift.

### 0.8 Banner lines: what was verified, how, and what was dropped

Method: for each franchise I fetched or searched near-primary pages and matched every string letter for letter, punctuation included. Sources fetched (raw text read): Wikiquote "Assassin's Creed (video game series)" and "Last words in Assassin's Creed series games"; TV Tropes "Best Quotes for Assassin's Creed", "Characters in The Secret World: The Big Three" (which reproduces the in-game faction pitches), "Best Quotes for Doom", "Best Quotes for Doom Eternal"; Wikipedia "Doom (1993 video game)" (episode titles). Case is presentation (the banner has no `text-transform`; the strings below are exactly as they will be written in `THEME_BANNERS`). Type column: **quote** (spoken or written in the work), **tagline** (the factions' in-game recruitment pitch or a trailer line), **title** (episode title), **text** (in-game text screen or manual). **No line in this batch is studio-authored.**

| Theme | Line (in order) | Type | Source |
|---|---|---|---|
| ac-assassins | `Nothing is true, everything is permitted.` | quote (the Creed) | Wikiquote AC series ("the Creed of the Assassins"); Wikipedia AC 2007 ("nothing is true; everything is permitted") |
| ac-assassins | `We work in the dark, to serve the light.` | quote (Machiavelli, AC II; the full line continues "We are Assassins.") | TV Tropes, Best Quotes for Assassin's Creed |
| ac-assassins | `Requiescat in pace.` | quote (Ezio's signature line, AC II) | Wikiquote, Last words in AC series games ("Ezio's signature quote") |
| ac-assassins | `Hide in plain sight.` | quote (the second tenet, recited by Shay Cormac in Rogue) | Wikiquote AC series |
| ac-templars | `May the Father of Understanding guide us all.` | quote (Shay Cormac, Rogue) | Wikiquote AC series; TV Tropes |
| ac-templars | `Order. Purpose. Direction. No more than that.` | quote (Haytham Kenway to Connor, AC III) | TV Tropes, Best Quotes for Assassin's Creed |
| ac-templars | `It's an invitation to chaos.` | quote (Haytham Kenway, AC III, about freedom) | TV Tropes, same exchange |
| swl-templar | `The world will founder without structure and discipline.` | tagline (Templar faction pitch) | TV Tropes, The Secret World: The Big Three |
| swl-templar | `Our conflict must be a righteous one.` | tagline (same pitch) | same |
| swl-templar | `Laws. Tradition. Blood.` | tagline (Funcom developer journal "Unveiling the Templars", "core values, our pillars") | **web-search snippet only, two independent searches returned the same wording; the MMORPG.com page itself returns 403 to a fetch. Jane: flag to Sergei; drop it if a snippet is not enough (the other two lines stand on a fetched page)** |
| swl-dragon | `It's a thousand coins flung into the air.` | tagline (Dragon faction pitch) | TV Tropes, The Secret World: The Big Three |
| swl-dragon | `We are the hand that makes the toss.` | tagline (same pitch) | same |
| swl-dragon | `We are the trajectory.` | tagline (same pitch) | same |
| swl-dragon | `We are the violence in the wind.` | tagline (same pitch) | same |
| swl-dragon | `What is chaos in theory?` | tagline (opening of the same pitch) | same |
| swl-illuminati | `We're the Illuminati... and we're not done.` | tagline (Illuminati faction pitch) | TV Tropes, The Secret World: The Big Three |
| swl-illuminati | `Power is our currency, our DNA, our God.` | tagline (same pitch) | same |
| swl-illuminati | `We control the world.` | tagline (same pitch) | same |
| doom-classic | `KNEE-DEEP IN THE DEAD.` | title (episode 1) | Wikipedia, Doom (1993 video game), Plot |
| doom-classic | `THE ONLY WAY OUT IS THROUGH.` | text (end-of-episode screen after Knee-Deep in the Dead) | TV Tropes, Best Quotes for Doom |
| doom-classic | `THE SHORES OF HELL.` | title (episode 2) | Wikipedia, same section |
| doom-classic | `THERE'S NO TURNING BACK NOW.` | text (instruction booklet, "The Story So Far") | TV Tropes, Best Quotes for Doom |
| doom-classic | `HOME AT LAST.` | text (end-of-episode screen after Inferno) | TV Tropes, Best Quotes for Doom |
| doom-classic | `THY FLESH CONSUMED.` | title (episode 4, The Ultimate Doom) | Wikipedia, same section |
| doom-eternal | `THE ONLY THING THEY FEAR... IS YOU.` | quote (Dr. Elena Richardson, trailer 2, also a soundtrack title) | TV Tropes, Best Quotes for Doom Eternal |
| doom-eternal | `RIP AND TEAR, UNTIL IT IS DONE.` | quote (King Novik, opening: "... only you. Rip and tear, until it is done.") | TV Tropes, same page |
| doom-eternal | `WARNING: THE SLAYER HAS ENTERED THE FACILITY.` | quote (Phobos intercom) | TV Tropes, same page |
| doom-eternal | `WELCOME HOME, GREAT SLAYER.` | quote (Maykr Angel) | TV Tropes, same page |

**Dropped for cause.** Verified but too long for the layout (each would end within 30 px of a banner motif): ac-assassins `Here we seek to promote peace, but murder is our means.` (304 px, meets the eagle); ac-templars `Uphold the principles of our order and all that for which we stand.` and `Never share our secrets nor divulge the true nature of our work.` (Shay's Templar creed, Wikiquote; about 68 characters each); swl-dragon `For we are the Dragon, and we take chaos far beyond theory.` (328 px, meets the ripples); swl-illuminati `We have stocks in Hell, and compromising photos of Angels.` (313 px) and `It's all about power: grabbing it, keeping it, using it...` (275 px, 7 px from the skyline); doom-eternal `You can't just shoot a hole into the surface of Mars.` (288 px, meets the chevrons). **Not found in any source fetched, so not kept** (the seven current `THEME_BANNERS` entries): ac-assassins `THE LEAP OF FAITH. THE EAGLE WATCHES.` and `WE WORK IN THE DARK TO SERVE THE LIGHT. WE ARE ASSASSINS.` (real, but the exact line is short-form above; the long form is 58 characters) and `WHERE OTHER MEN BLINDLY FOLLOW THE TRUTH, REMEMBER: NOTHING IS TRUE.` (real, 12 words and 68 characters, reserve line); ac-templars `THE WORLD IS AN ILLUSION. WE PROVIDE THE TRUTH.`, `HUMANITY LEFT TO ITS OWN DEVICES WILL ONLY DESTROY ITSELF.`, `THE ORDER ENDURES. THE ORDER PREVAILS.`, `ORDER. PURPOSE. DIRECTION. THE TEMPLAR WAY.` (the first three words are real, the rest is invented); swl-templar `TRADITION. DISCIPLINE. SACRIFICE.`, `MAY THE LIGHT OF THE TEMPLARS GUIDE YOUR PATH.`, `WE ARE THE SWORD AND THE SHIELD...`, `TEMPLE HALL STANDS. THE ORDER ENDURES.`, `RICHARD SONNAC EXPECTS YOUR FULL COMMITMENT.`; swl-dragon `A SINGLE PEBBLE CAN START AN AVALANCHE.`, `THE BUTTERFLY EFFECT. CHAOS IS A TOOL.`, `WE DO NOT FIGHT. WE ARRANGE THE BATTLEFIELD.`, `BONG CHA WATCHES. THE DRAGON COILS.`, `EVERY ACTION HAS A CONSEQUENCE. WE CHOOSE THE CONSEQUENCES.`; swl-illuminati `SEX, DRUGS, AND ROCKEFELLER. WELCOME TO THE ILLUMINATI.`, `THE EYE SEES ALL. THE LABYRINTH KNOWS ALL.`, `KIRSTEN GEARY SENDS HER REGARDS.`, `CONSPIRACY IS JUST ANOTHER WORD FOR BUSINESS PLAN.`; doom-classic `RIP AND TEAR, UNTIL IT IS DONE.` (Doom 2016 and Eternal; the 1996 comic has "Rip and tear!" only), `E1M1. THE HANGAR. HURT ME PLENTY.` (a composite; I could not confirm "Hurt Me Plenty" on a fetched page), `THEY ARE RAGE. BRUTAL. WITHOUT MERCY.` (Doom 2016), `IDDQD. IDKFA. YOU KNOW THE CODES.` (studio-written); doom-eternal `IN THE FIRST AGE, IN THE FIRST BATTLE.`, `AGAINST ALL THE EVIL THAT HELL CAN CONJURE.` (a truncated clause of Novik's opening), `THE DOOM SLAYER DOES NOT SPEAK. HE ACTS.`. "Not found" means I did not find it in the pages I could fetch, not that it is false.

**Line counts after:** ac-assassins 4, ac-templars 3, swl-templar 3, swl-dragon 5, swl-illuminati 3, doom-classic 6, doom-eternal 4 (28 lines; the rotation code has no minimum; the comment above `THEME_BANNERS` is stale, watch item 1 of B1 12.8).

**Fit (measured on the mock, real fonts, real tracking; the text box at 424 px is 364 px wide and starts at x 46; doom-classic's starts at x 84 and is 256 px wide):** the widest string per theme and where it ends: ac-assassins 209.5 (x 255.5; the eagle starts at x 330), ac-templars 232.1 (x 278; the shield starts at x 378), swl-templar 274.8 (x 320.8; the flag starts at x 378), swl-dragon 205.7 (x 251.7; the ripples' first ring starts near x 354), swl-illuminati 215.5 (x 261.5; the skyline starts at x 328), doom-classic 198.8 (x 282.8; the text window ends at x 346), doom-eternal 244.5 (x 290.5; the chevrons start at x 328). All fit on one line with at least 37 px between the text and the nearest banner motif. Ender confirms `scrollWidth <= clientWidth` for every string, and the JavaScript block in 9 has the exact entries.

### 0.9 Trademark and signature elements: what is drawn and what is not

| Franchise element | What this spec draws | What it does not draw |
|---|---|---|
| Assassin insignia and hood | A generic hooded bust with a cowl opening and a red chest band; an original geometric eagle; a hex-cell strip and a sync bar (generic HUD parts) | The A-shaped buckle with a hook, the Animus or Ubisoft logos, any character |
| Templar cross, Abstergo | A heraldic flared cross on a kite shield (public heraldry), a red disc with a hexagonal aperture (a generic lab-door iris), a DNA helix | The Templar Order's game emblem, the Abstergo logo (a stylised Penrose triangle over a microscope), any Ubisoft artwork |
| SWL factions (Funcom marks) | Templar: red banners with white flared crosses, a colonnade, a temple front, a Greek-key course. Dragon: lanterns, a coin with a square hole, ripples from a pebble, a Hangul word. Illuminati: a stepped ziggurat, an eye in a triangle (a public symbol), a setback skyline | The faction logos and emblems, any character (Sonnac, Bong Cha, Geary), the Labyrinth's or Temple Hall's real floor plans |
| DOOM (1993) | A generic status-bar layout with two red pixel-digit windows and a text window, three keycards (blue, yellow, red), riveted strips, bevelled panels | The DOOM logo, the pentagram, the Doomguy face panel, skulls, any sprite or texture from the game |
| DOOM Eternal | An orange slab, five chevrons, hazard slashes, three claw slashes, hard-cut corners | The logo and its lettering, the Slayer's helmet, any rune or sigil from the game, the pentagram |

### 0.10 Where this spec departs from the audit (and from the Foundation map), and why

| Theme | Audit direction | This spec | Reason |
|---|---|---|---|
| ac-assassins | Animus HUD, bg `#0C0C0E` at 0.92 alpha or more, hex-cell strip in the header, hood-triangle banner icon, thin sync-bar line, Palatino caps, keep the pentagon tiles | Fully opaque; the sync bar is the top-band frame; an **eagle** is added at the banner's right end; hexagon plates (16 percent) replace the pentagon; Segoe UI Semibold caps for labels, Cinzel on the title only | Opaque is within the audit's "0.92 or more" and matches every earlier batch; the eagle is the theme's bold element (squint 3 to 4); the current pentagon plate **crops** the Terminal and Calculator glyph corners (computed margins -1.1 and -0.4 px against the mock glyph geometry) and is generic, the hexagon is the Animus cell and clears every glyph by at least 4.0 px; display faces stay on `#title` (F B2 rule 1) |
| ac-templars | Abstergo corporate layer, glass panels, silver, red only on edit, focus and a small circle logo, hex-grid strip in the header, lab-door circle icon, Segoe UI Semilight caps at 90 percent, 6 px tiles | A **DNA helix** in the header (hex cells belong to ac-assassins); the banner icon is the lab-door disc **and** a **Templar shield with a red flared cross** sits at the right end; the banner is a light silver strip; Jost **400** (the map said 300) | Both layers of the conceit must show or the theme reads as "grey with red bits" (squint 3 to 4); Light (300) is hairline at 11 to 12 px on a dark ground (batch 1 lesson); Semilight was the stock stand-in for the Jost the map now supplies |
| swl-templar | Carved-stone double rule with chamfered corners, static conic rose-window circle in the header, flared cross as banner icon, Palatino small caps, square tiles | A **Classical colonnade** (fluted pilasters, dentil cornice, Greek-key course), **hanging red banners with white crosses** in the header and one big one in the banner strip, a temple front as the banner icon, banner-tail plates, Palatino uppercase (not small caps) | The fetched sources describe Templar territory as "plastered with red banners and white crosses" and the base as "heavily Classical, with lots of straight lines, right angles and elegantly squared proportions"; a Gothic rose window is the wrong architecture. Small caps would render at about 9.6 px (nothing functional under 10 px, H8) |
| swl-templar type | (F B3 map) UnifrakturCook title, IM Fell English banner | Applied as mapped; the title is set at **12 px** | The Foundation map chose blackletter from the old CSS brief, before the Classical evidence; I kept it (it says "medieval order", which the lore also has: the Knights Templar, "Church Militant") and raised the size because blackletter's x-height is small. **Sergei's call** (flag 1 in 9) |
| swl-dragon | One coiled dragon as a single line, three or four dots and one ripple ring on the pad, ripple ring as banner icon, Georgia italic labels, a small 서울 tag, keep hex tiles | A **string of green lanterns** instead of the dragon line; the ripple ring becomes **ripples from a gold pebble** in the banner, a **coin** is the icon; labels in Malgun Gothic (not Georgia italic); a concrete-grey banner strip; the hex plates are kept | The single line read as a sine wave in batch 2 (yakuza) and yakuza already has a gold dragon; lanterns, coins and ripples are all in the fetched faction text ("green lanterns and grey concrete", "a thousand coins flung into the air", "tiny ripples that grow into sweeping tsunamis"); Seoul is a modern city, so a Korean UI sans reads truer than italic Georgia |
| swl-illuminati | Thin blue rules on the pad, a stepped ziggurat in the header, a small eye-in-triangle as banner icon, Segoe UI Semibold caps, rounded-square tiles, no gold | No pad rules; a **setback skyline** is added at the banner's right end; **dossier-corner plates** replace the rounded squares; the edit and error colour is a muted red | A thin line beside the scroll thumb reads as a second scrollbar (ac-templars' first draft showed it); the skyline says New York, the dossier corner says "contracts and dossiers" (sheet); a monochrome blue theme needs one warm colour for edit mode to be unmistakable |
| doom-classic | Banner strip as the status bar: `#5A4A3A` with four red pixel-digit groups and a face-free centre panel in static box-shadow blocks, bubble-notch tiles if the glyph is not cropped, Courier New bold caps | Two digit windows ("100%" left as the icon slot, "200%" right) around a **text window**; digits are SVG rectangles; **bevelled** tiles instead of notched plates; three keycards in the header; riveted strips down both sides | The banner text needs the centre of the bar, so the face panel is dropped; SVG rects are crisper than box-shadow blocks at 1.5x and cost nothing; a bevel is the 1993 panel language and crops nothing |
| doom-eternal | An angular chevron slab behind the title, hard-cut pad corners, no ring gauges, Bahnschrift SemiBold italic caps, cyan on one line, keep or chamfer the tiles | The slab is a hellfire block behind the title with black type; five chevrons in the art zone; a hazard-slash band, claw slashes and chevrons in the banner; corner cuts in the frame bands; a bottom-right plate cut; Bahnschrift at `font-stretch: 87.5%`; cyan only for edit mode | The saturated orange is the franchise's whole look (Makoto's "dull wash" pitfall); SemiCondensed is the narrow bold UI sans; cyan as the edit colour keeps edit mode distinct from hellfire without adding a fourth colour to the chrome |
| all | Frame art in the frame; banner quotes | Frame art only in the bands, header zone and banner; quotes replaced by verified lines (0.8) | B1 0.10; H3 |

### 0.11 Suggested implementation order for Ender

1. **doom-classic** first (the `calc()` banner windows and the bevel are new patterns), then **doom-eternal**.
2. **ac-assassins**, then **ac-templars** (the light banner; both need the Foundation fonts landed and loaded before their title edges are measured).
3. **swl-templar** (fonts and the frame with the most background layers), **swl-dragon** (the Hangul tag), **swl-illuminati** last.
4. After each theme: `npm run check:contrast` (no `--rebaseline`), `grep -c infinite`, the gallery after-run, the hidden-tiles shot, the A/B/C probe at the three sizes plus the states shot, and the theme's "Done when". After the fonts: `fontsRendered` (positive control: each adopted family listed; negative control: a misspelled probe family falls back). In the Foundation after-run also check the focus ring on the last column at 640 x 420 and 1024 x 700 for the four themes with right-band art (swl-templar, swl-dragon, doom-classic, doom-eternal): expected 1 px between the art and the ring zone.

---

## 1. ac-assassins (ASSASSIN'S CREED: ASSASSINS): DONE

**Audit:** score 2, redraw. A gold-brown "Eagle Vision" wash at 0.52 alpha where the franchise's main colour is hood white with Animus cyan and sash red. Over the grey gallery backdrop the header buttons and version fade and the window goes muddy. The Creed text prints in the right column, a leap-of-faith diagonal with an arrowhead crosses the centre tiles, and a mentors list sits beside the icons. Six infinite animations, one of them a full-window dust scroll.
**Direction:** the Animus, not Eagle Vision. A cool near-black ground, hood-white type, Animus cyan for every line and for the focus ring, a sash-red tick in the header and red nowhere else except edit mode. Hex-cell plates and a hex-cell strip in the header say "Animus"; a memory-sync bar under the header says "memory"; the banner carries a hooded figure (icon) and an eagle (right end) on a flat dark strip. Fully opaque (the translucent wash is gone). No glow, no texture, no animation.

### 1.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 2px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0B0D10;
  --panel-bg: #12151A;
  --overlay-bg: #0B0D10;
  --header-bg: #10141A;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #EDEDED;
  --text-dim: #9FA6B2;
  --accent-c: #33C8FF;
  --accent-m: #EE4B58;
  --accent-y: #EDEDED;
  --accent-text: #33C8FF;
  --border: #2A313B;
  --border-h: #33C8FF;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #33C8FF;
  --title-anim: none;
  --tile-hover-bg: #0F1E27;
  --tile-hover-border: #33C8FF;
  --tile-hover-shadow: none;
  --tile-active-bg: #0F1E27;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: contrast(1.05) saturate(0.9);
  --tile-icon-shape: polygon(16% 0, 84% 0, 100% 50%, 84% 100%, 16% 100%, 0 50%);
  --tile-label-spacing: 0.8px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #12242F;
  --btn-active-bg: #183245;
  --drop-hint-border: #3A4350;
  --drop-icon-color: #6D7784;
  --hint-sub-color: #9FA6B2;
  --rename-dashed: #33C8FF;
  --rename-input-bg: #0F1E27;
  --edit-bar-bg: #1B0E11;
  --edit-bar-border: #D6202C;
  --edit-label-color: #FF6B75;
  --edit-label-glow: none;
  --btn-done-color: #FF6B75;
  --btn-done-border: #D6202C;
  --btn-done-hover-bg: #3A1218;
  --btn-done-hover-glow: none;
  --btn-add-border: #6D7784;
  --update-bg: #101C24;
  --update-border: #33C8FF;
  --update-color: #EDEDED;
  --update-btn-border: #33C8FF;
  --update-btn-hover-bg: #17303E;
  --update-btn-hover-glow: none;
  --btn-close-color: #33C8FF;
  --btn-close-border: #33C8FF;
  --btn-close-hover-bg: #12303F;
  --btn-close-hover-glow: none;
  --picker-search-bg: #0F1E27;
  --picker-item-hover-bg: #0F1E27;
  --picker-item-active-bg: #15303F;
  --picker-placeholder-bg: #0F1E27;
  --skin-btn-active-bg: #15303F;
  --remove-btn-bg: #A8101C;
  --remove-btn-border: #EE4B58;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#EDEDED` on `#0B0D10` | 4.5:1 | **16.62:1** |
| --text-dim on --bg | `#9FA6B2` on `#0B0D10` | 4.5:1 | **7.94:1** |
| --accent-c on --bg | `#33C8FF` on `#0B0D10` | 3:1 | **10.05:1** |
| --accent-text on --bg | `#33C8FF` on `#0B0D10` | 3:1 | **10.05:1** |
| --hint-sub-color on --bg | `#9FA6B2` on `#0B0D10` | 4.5:1 | **7.94:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#EDEDED` on `#12151A` | 4.5:1 | **15.63:1** |
| Tile label on tile hover | `#EDEDED` on `#0F1E27` | 4.5:1 | **14.52:1** |
| Tile label on tile pressed (pressed state) | `#EDEDED` on `#0F1E27` | 4.5:1 | **14.52:1** |
| Title on header | `#EDEDED` on `#10141A` | 4.5:1 | **15.78:1** |
| Title dot (`.accent`) on header | `#EE4B58` on `#10141A` | 4.5:1 | **5.09:1** |
| Header version on header | `#9FA6B2` on `#10141A` | 4.5:1 | **7.54:1** |
| Header button glyph on header | `#EDEDED` on `#10141A` | 4.5:1 | **15.78:1** |
| Header button glyph on button hover | `#FFFFFF` on `#12242F` | 4.5:1 | **15.92:1** |
| Filter chip text on chip | `#33C8FF` on `#0F1E27` | 4.5:1 | **8.78:1** |
| Banner text on banner | `#EDEDED` on `#0E1116` | 4.5:1 | **16.15:1** |
| Header tick (sash red) on header (non-text) | `#D6202C` on `#10141A` | 3.0:1 | **3.61:1** |
| Header hairline (cyan) on header (non-text) | `#33C8FF` on `#10141A` | 3.0:1 | **9.54:1** |
| Edit label on edit bar | `#FF6B75` on `#1B0E11` | 4.5:1 | **6.81:1** |
| Done / close button text on edit bar | `#FF6B75` on `#1B0E11` | 4.5:1 | **6.81:1** |
| + FILE / + INSTALLED text on edit bar | `#EDEDED` on `#1B0E11` | 4.5:1 | **16.05:1** |
| Done button text on its hover fill | `#FFFFFF` on `#3A1218` | 4.5:1 | **16.41:1** |
| Settings text on overlay | `#EDEDED` on `#0B0D10` | 4.5:1 | **16.62:1** |
| Settings text on panel | `#EDEDED` on `#12151A` | 4.5:1 | **15.63:1** |
| Settings label (text-dim) on panel | `#9FA6B2` on `#12151A` | 4.5:1 | **7.47:1** |
| Settings value / cheat key (accent-text) on panel | `#33C8FF` on `#12151A` | 4.5:1 | **9.45:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#33C8FF` on `#0B0D10` | 4.5:1 | **10.05:1** |
| Settings CLOSE text on panel | `#33C8FF` on `#12151A` | 4.5:1 | **9.45:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#12303F` | 4.5:1 | **13.81:1** |
| Hotkey error text (accent-m) on panel | `#EE4B58` on `#12151A` | 4.5:1 | **5.04:1** |
| Hotkey input text on input fill | `#33C8FF` on `#0F1E27` | 4.5:1 | **8.78:1** |
| Picker row text on hover fill | `#EDEDED` on `#0F1E27` | 4.5:1 | **14.52:1** |
| Update banner text on update bar | `#EDEDED` on `#101C24` | 4.5:1 | **14.78:1** |
| Update button text on hover fill | `#FFFFFF` on `#17303E` | 4.5:1 | **13.74:1** |
| Drop-hint text (text-dim) on grid ground | `#9FA6B2` on `#0B0D10` | 4.5:1 | **7.94:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A8101C` | 3.0:1 | **7.62:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#A8101C` | 3.0:1 | **7.62:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#33C8FF` on `#12151A` | 3.0:1 | **9.45:1** |
| Focus ring on grid ground (non-text) | `#33C8FF` on `#0B0D10` | 3.0:1 | **10.05:1** |
| Hover border on grid ground (non-text) | `#33C8FF` on `#0B0D10` | 3.0:1 | **10.05:1** |
| Hover border on hover fill (non-text) | `#33C8FF` on `#0F1E27` | 3.0:1 | **8.78:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#33C8FF` on `#0F1E27` | 4.5:1 | **8.78:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#33C8FF` on `#15303F` | 4.5:1 | **7.11:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#33C8FF` on `#0F1E27` | 4.5:1 | **8.78:1** |
| Picker / skin search input text (accent-text) on search fill | `#33C8FF` on `#0F1E27` | 4.5:1 | **8.78:1** |
| Rename / hotkey input text (accent-text) on input fill | `#33C8FF` on `#0F1E27` | 4.5:1 | **8.78:1** |
| Search placeholder (text-dim) on search fill | `#9FA6B2` on `#0F1E27` | 4.5:1 | **6.94:1** |
| Hotkey recording text (accent-m) on input fill | `#EE4B58` on `#0F1E27` | 4.5:1 | **4.68:1** |
| Update dismiss glyph (text-dim) on update bar | `#9FA6B2` on `#101C24` | 4.5:1 | **7.06:1** |

**Lowest ratio in this theme: 3.61:1 (Header tick (sash red) on header (non-text)).** Lowest text ratio: 4.68:1 (Hotkey recording text (accent-m) on input fill). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#12151A`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5C7EA3` | `#12151A` | 4.33:1 | pass |
| Calculator `#6b6f76` | `#6A6E75` | `#12151A` | 3.57:1 | pass |
| Paint `#b07a4f` | `#AD7B52` | `#12151A` | 4.99:1 | pass |
| Terminal `#3d4450` | `#3B414D` | `#12151A` | 1.79:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#528A8B` | `#12151A` | 4.68:1 | pass |
| Files `#c09a3e` | `#BF9B45` | `#12151A` | 6.96:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.57:1** (pass). Terminal (the mock plate is dark art) is 1.79:1 at rest and is excluded, as in every earlier batch. On the hover fill `#0F1E27`: **3.32:1**; on the pressed fill `#0F1E27`: **3.32:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is Animus cyan and is used for fills, borders, the focus ring, the slider and the hex-strip and sync-bar lines; `--accent-text` is the same cyan (values, chip, hotkey field and picker rows read as Animus read-outs, 7.1:1 and better on every fill). `--accent-m` is a sash-red tint (`#EE4B58`) used for text only: the title dot, the hotkey error and recording text; the sash red proper (`#D6202C`) is a fill (the header tick, the edit-bar rule and the done button border) and never carries small text. `--tile-hover-bg` and `--tile-active-bg` are the same dark cyan-black `#0F1E27` (L 0.011), dark enough for the mid-grey Calculator plate to keep 3:1. Everything is opaque hex; the old `rgba(8,6,2,0.52)` background is replaced, not raised (the audit allowed 0.92; at 0.92 the wallpaper would still tint the window by 8 percent for no gain, and every other batch theme is opaque).

### 1.2 Type

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Segoe UI', Arial, sans-serif` | 400 (base) | base | base | base |
| `#title` | **`'Cinzel'`**, `'Palatino Linotype', Palatino, Georgia, serif` (bundled, Foundation B1/B5) | 700 | 11 px (base) | 3px | uppercase (markup) |
| `.tile-label` | `'Segoe UI', Arial, sans-serif` (`seguisb.ttf`) | 600 (`--tile-label-weight`) | 12 px (base) | 0.8px | uppercase (`--tile-label-transform`) |
| `#theme-banner-text` | `'Segoe UI', Arial, sans-serif` | 400 | 11 px (base) | 0.4px | sentence case, as written in 0.8 |

Title rule (Foundation B2): `font-weight: 700; font-style: normal; font-synthesis: none; line-height: 1.2`. Measured in the mock with the real `Cinzel-VF.ttf` from the working tree: the title text is 128.3 px wide and its box ends at x 140.3, so it is 15.7 px inside the 156 gate and 27.7 px clear of the art at x 168 (no ladder step needed; the installed Cinzel Black I used for the earlier estimate was wider, 143.7). Labels in Segoe UI Semibold 12 px with 0.8 px tracking: NOTEPAD 59, CALCULATOR 81, TERMINAL 64.4, BROWSER 61.1, PAINT 37.6, FILES 32.1 px, all inside the 100 px label box. Expected `fontsRendered`: `Cinzel, Segoe UI, Segoe UI Semibold` (title, body, labels). **Cyrillic:** no Cyrillic text in this theme's own strings; Segoe UI Semibold covers U+0416 and U+042F (negative control Ebrima failed), so Cyrillic tile names render in Segoe UI Semibold.

### 1.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the eagle-vision grain, vignette and gold glow in `#app::after`, the painted diagonal-blade panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, particles and the `#app` animation (B1 0.3; keyframes in 0.5). The theme has **no texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00 in the mock).

**A. Header, a cyan hairline, a red tick and a hex-cell strip (HZ).**
- `#header { border-bottom-color:#33C8FF; }`: a 1 px cyan line at y 39 to 40 (thin lines are the Animus language; nothing paints below y 40). `#header::before { left:0; top:12px; bottom:12px; width:3px; background:#D6202C; box-shadow:none; }`: a 3 px sash-red tick at the left edge (x 0 to 3, y 12 to 27).
- **Strip, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hexh` (84 x 20): seven flat-top hexagons (radius 6.6, 1 px cyan outline, zig-zag honeycomb, centres every 10.5 px), one filled cyan, one filled dark cyan, one filled hood white. It spans window x 168.4 to 244.6, y 11.8 to 29.2. Hidden while the chip shows (rule in the block below).
- `#title`: hood white Cinzel with a sash-red dot (`#EE4B58`, 5.1:1 on the header).

**B. Frame, a memory-sync bar (top band only).** In `#grid-container`'s own background, four layers, all inside the top band (container y 1 to 11, window y 41 to 51): a cyan fill `linear-gradient` 148 x 2 px at `left 16px top 5px` (x 16 to 164, y 45 to 47), a dark-cyan track `calc(100% - 36px)` x 2 px under it (x 16 to 404 at 424; it follows the tile field's left and right edges at every size), a tick row (`repeating-linear-gradient`, 1 px every 8 px, 3 px tall at `top 8px`, y 48 to 51) and SVG `mark` (a 7 x 5 hood-white down-pointing triangle at `left 159px top 1px`, x 159 to 166, y 41 to 46) at the end of the filled segment. Nothing else is painted in the side or bottom bands. The fill is a fixed 148 px, so the bar does not "advance" with the window.

**C. Banner, a dark strip with a hooded figure and an eagle.** `#theme-banner { background: url(eagle) right 12px bottom 0 / 84px 34px no-repeat, #0E1116; border-top-color:#2A313B; }`; text hood white.
- **Eagle, SVG `eagle`, 84 x 34** at banner x 328 to 412 (window y 266 to 300 at 424 x 300): a spread-wing raptor with a hooked beak, five feather notches per wing and a fanned tail, fill `rgb(30,120,160)`, 0.8 px cyan outline. The longest ac-assassins string ends at x 255.5, the wing tip starts at x 330: 74 px clear.
- **Icon, SVG `hood`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): a hooded bust in hood white with a dark cowl opening and a sash-red chest band.
- Decoration only; no text in any SVG.

**D. Tiles.** Hexagon plates: `--tile-icon-shape: polygon(16% 0, 84% 0, 100% 50%, 84% 100%, 16% 100%, 0 50%)`. Glyph margins to the cut edges (mock glyph geometry, computed, not eyeballed): Notepad 11.0, Calculator 9.5, Paint 10.2, Terminal 4.0, Browser 11.0, Files 5.6 px; nothing is cropped (a regular hexagon, 25 percent, would leave Terminal 0.9 px and is not used). Tile fill `#12151A`, border `#242A33`, radius 2 px.

**Trademark note.** The Assassin insignia (an A-shaped buckle with a hook) and the game logos are not drawn. The hood is a generic hooded silhouette with a cowl opening (no buckle, no hook, no A), the eagle is an original geometric raptor, the hex strip and sync bar are generic HUD parts.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A8101C; }

/* window: no texture layer */
#app::after { background: none; }

/* header: 1 px cyan hairline, a 3 px sash-red tick, a hex-cell strip */
#header { border-bottom-color: #33C8FF; }
#header::before { left: 0; top: 12px; bottom: 12px; width: 3px; background: #D6202C; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HEXH@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 700; font-style: normal; font-synthesis: none; line-height: 1.2; letter-spacing: 3px; color: #EDEDED; text-shadow: none; }
#title .accent { color: #EE4B58; }

/* frame: a memory-sync bar under the header (top band only) */
#grid-container {
  background:
    @MARK@ left 159px top 1px / 7px 5px no-repeat,
    linear-gradient(#33C8FF, #33C8FF) left 16px top 5px / 148px 2px no-repeat,
    linear-gradient(#1C4A5E, #1C4A5E) left 16px top 5px / calc(100% - 36px) 2px no-repeat,
    repeating-linear-gradient(90deg, #2E6F8A 0 1px, transparent 1px 8px) left 16px top 8px / calc(100% - 36px) 3px no-repeat;
}

/* tiles */
.app-tile { background: #12151A; border-color: #242A33; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Segoe UI', Arial, sans-serif; }
.app-tile:hover .tile-label, .app-tile:focus-visible .tile-label { box-shadow: 0 2px 0 #33C8FF; }

/* banner: dark strip, hood icon, eagle at the right end */
#theme-banner { background: @EAGLE@ right 12px bottom 0 / 84px 34px no-repeat, #0E1116; border-top-color: #2A313B; }
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @HOOD@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 400; letter-spacing: 0.4px; color: #EDEDED; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HEXH@` | `hexh` |
| `@MARK@` | `mark` |
| `@EAGLE@` | `eagle` |
| `@HOOD@` | `hood` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`; encode `<`, `>`, `#` as B1 0.2 says):

**`hexh`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<polygon points='13.60,7.50 10.30,13.22 3.70,13.22 0.40,7.50 3.70,1.78 10.30,1.78' fill='none' stroke='rgb(51,200,255)' stroke-width='1' stroke-linejoin='round'/>
<polygon points='24.10,13.50 20.80,19.22 14.20,19.22 10.90,13.50 14.20,7.78 20.80,7.78' fill='none' stroke='rgb(51,200,255)' stroke-width='1' stroke-linejoin='round'/>
<polygon points='34.60,7.50 31.30,13.22 24.70,13.22 21.40,7.50 24.70,1.78 31.30,1.78' fill='rgb(51,200,255)' fill-opacity='0.9' stroke='rgb(51,200,255)' stroke-width='1' stroke-linejoin='round'/>
<polygon points='45.10,13.50 41.80,19.22 35.20,19.22 31.90,13.50 35.20,7.78 41.80,7.78' fill='none' stroke='rgb(51,200,255)' stroke-width='1' stroke-linejoin='round'/>
<polygon points='55.60,7.50 52.30,13.22 45.70,13.22 42.40,7.50 45.70,1.78 52.30,1.78' fill='none' stroke='rgb(51,200,255)' stroke-width='1' stroke-linejoin='round'/>
<polygon points='66.10,13.50 62.80,19.22 56.20,19.22 52.90,13.50 56.20,7.78 62.80,7.78' fill='rgb(28,74,94)' stroke='rgb(51,200,255)' stroke-width='1' stroke-linejoin='round'/>
<polygon points='76.60,7.50 73.30,13.22 66.70,13.22 63.40,7.50 66.70,1.78 73.30,1.78' fill='rgb(237,237,237)' fill-opacity='0.92' stroke='rgb(51,200,255)' stroke-width='1' stroke-linejoin='round'/>
</svg>
```

**`mark`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7 5'><path d='M0 0 H7 L3.5 5 Z' fill='rgb(237,237,237)'/></svg>
```

**`eagle`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<g fill='rgb(30,120,160)' stroke='rgb(51,200,255)' stroke-width='0.8' stroke-linejoin='round'>
<path d='M38.5 12.5 C30 9.5 16 6 2 2 L6 9 L8 7 L11 14 L13 11.5 L17 18 L19 15.5 L24 21 L26 18.5 L32 23 L38.5 22.5 Z'/>
<path d='M45.5 12.5 C54 9.5 68 6 82 2 L78 9 L76 7 L73 14 L71 11.5 L67 18 L65 15.5 L60 21 L58 18.5 L52 23 L45.5 22.5 Z'/>
<path d='M38.6 12 Q42 9.6 45.4 12 L46.4 24.5 L37.6 24.5 Z'/>
<path d='M37.6 24.5 L46.4 24.5 L49.5 32.5 L45.5 31 L42 33.5 L38.5 31 L34.5 32.5 Z'/>
<path d='M40.3 7.4 C40.3 5.4 41.6 4.2 43.2 4.2 C44.6 4.2 45.4 5.4 45.3 7.2 L45 10.2 L40.6 10.2 Z'/>
<path d='M40.4 6.6 L35.4 8.8 Q35.2 10.8 37.4 11 L40.6 9.4 Z'/>
</g>
<circle cx='43.2' cy='6.6' r='0.75' fill='rgb(14,17,22)'/>
</svg>
```

**`hood`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M11 1 C8 4 6.6 8 6.4 11 C5 13 2.5 15.5 1.5 21 H20.5 C19.5 15.5 17 13 15.6 11 C15.4 8 14 4 11 1 Z' fill='rgb(237,237,237)'/>
<path d='M11 6.2 C9 7.6 8.2 9.6 8.4 11.6 C9 13.2 13 13.2 13.6 11.6 C13.8 9.6 13 7.6 11 6.2 Z' fill='rgb(14,17,22)'/>
<path d='M3.6 17.4 L18.4 14.8 L18.9 17.0 L3.2 19.8 Z' fill='rgb(214,32,44)'/>
</svg>
```


### 1.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `assassin-title 12s ease-in-out` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-pulse 7s ease-in-out` | `#theme-banner::before` opacity (tier 1) | removed |
| 3 | `assassin-blade 12s ease-in-out` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `assassin-readout 12s ease-in-out` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `assassin-border 12s ease-in-out` | `#app` box-shadow (tier 5) | removed |
| 6 | `assassin-dust 18s linear` | `#particles` background-position (tier 4) | removed |
| hover | `tile-radial .55s forwards` (one-shot) | `.app-tile:hover::before` | removed (`::before` is `display:none`) |

**Before 6, after 0.** Nothing is animated; `grep -c infinite ac-assassins.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance (was 2 s).

### 1.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#12151A`, border `#242A33` (1 px), radius 2 px, `::before` off; layout unchanged. Icons: `contrast(1.05) saturate(0.9)` through the hexagon plate.
- **Hover:** fill `#0F1E27`, border cyan (`#33C8FF`, 8.78:1 on the hover fill), a 2 px cyan underline under the label (`box-shadow: 0 2px 0 #33C8FF` on `.tile-label`, no layout change), no glow, no transform.
- **Selected (focus-visible):** hover plus the base 2 px cyan ring at offset 2 (10.05:1 on the grid ground, 9.45:1 on the tile).
- **Pressed:** base scale 0.96 on `#0F1E27`.
- **Label:** hood white `#EDEDED`, Segoe UI Semibold, uppercase, no halo.
- **Filter chip:** base rule (fill `#0F1E27`, cyan border, cyan text 8.78:1). The hex strip hides while it shows.
- **Edit bar:** `#1B0E11` fill, sash-red rule (`#D6202C`), label `#FF6B75`; `+ FILE` and `+ INSTALLED` hood white with a grey border, `DONE` red-tinted. The tile ✕ is `#A8101C` with a light-red ring; on hover it stays deep red (`.btn-remove:hover { background:#A8101C; }`).
- **Settings overlay:** opaque `#0B0D10`, panel `#12151A`, cyan values and version (`#app-version`), cyan sliders and checkboxes, cyan CLOSE.
- **Update banner:** hood-white text on `#101C24` with a cyan rule.

### 1.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite ac-assassins.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`; no `will-change`; no `backdrop-filter`.
2. Header: a 1 px cyan line at y 39 to 40 with nothing below it; a 3 px red tick at x 0 to 3, y 12 to 27; a seven-cell hex strip at x 168 to 245; `#title` right edge at most 156 (mock 140.3); typing a letter hides the strip and shows the chip.
3. Sync bar: cyan 148 px fill and white marker at x 159 to 166, dark track to x 404, ticks below it, all inside y 41 to 51; no pixel of it in the tile field.
4. Banner: flat `#0E1116`, hood icon at x 14 to 36, eagle at x 328 to 412 flush with the bottom, hood-white text on one line (`scrollWidth <= clientWidth` for all four strings).
5. Hover shot (CALCULATOR): cyan border, dark cyan fill, a cyan underline under the label, hexagon plate with no cropped glyph.
6. No gold, brown or amber pixel in the chrome of the grid or settings shot (tile icons excluded, they are the apps' own art); red appears only in the header tick, the title dot, the hood sash and edit mode.
7. Hidden-tiles sigma 0.00 (no texture).
8. A/B/C probe at 424 x 300, 640 x 420, 1024 x 700 and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after`, `#header::before` and `#theme-banner::before`, set `#grid-container { background:none !important; }` and `#theme-banner { background:#0E1116 !important; }` (my run: clearance 5.3 px at every size, 1.3 px in the states shot, where the last partly visible tile row meets the banner's top edge, as in batches 1 and 2).
9. `fontsRendered` lists `Cinzel`, `Segoe UI` and `Segoe UI Semibold`; a misspelled-family probe element falls back (Foundation B2 rule 9).

**Expected squint score: 4** (title and banner text covered). What survives: a cool near-black ground with cyan hairlines, a sync bar under the header, a hex-cell strip, a hooded figure icon and an eagle, hexagon plates. What is missing for a 5: the Animus's white-room brightness and the real Creed lettering (Cinzel is on the title only, which the squint test covers).

---

## 2. ac-templars (ASSASSIN'S CREED: TEMPLARS): DONE

**Audit:** score 2, redraw, legacy contrast failure (text-dim, accent-c, hint-sub). A dark red-grey tint with a solid red plus-shape behind the CALCULATOR label (it read as a false selection highlight), a painted directive list, and neither a Templar nor an Abstergo look; it also duplicated swl-templar (red on dark). The audit's red `#B0121E` computes to 2.71:1 on the ground, which is why the gate failed.
**Direction:** the Order behind the corporation. Graphite and silver, cool and orderly (Abstergo's labs), with the old Order showing through in two small marks: a **Templar shield bearing a red flared cross** and a red lab-door disc on a **silver-glass banner strip**. A DNA helix (Abstergo's Helix) runs in the header. Hover is silver; red is reserved for the focus ring, edit mode and those marks. No glow, no texture, no animation.

### 2.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 6px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0D0E10;
  --panel-bg: #17191D;
  --overlay-bg: #0D0E10;
  --header-bg: #14161A;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #DDE1E6;
  --text-dim: #979EA8;
  --accent-c: #D0232E;
  --accent-m: #FF5A64;
  --accent-y: #DDE1E6;
  --accent-text: #E9ECEF;
  --border: #2E3238;
  --border-h: #AEB4BC;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #D0232E;
  --title-anim: none;
  --tile-hover-bg: #1C1F25;
  --tile-hover-border: #AEB4BC;
  --tile-hover-shadow: none;
  --tile-active-bg: #1C1F25;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.85) contrast(1.05);
  --tile-icon-shape: inset(0 round 9px);
  --tile-label-spacing: 1.2px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #23272E;
  --btn-active-bg: #2C3139;
  --drop-hint-border: #3C4148;
  --drop-icon-color: #6E7680;
  --hint-sub-color: #979EA8;
  --rename-dashed: #AEB4BC;
  --rename-input-bg: #1C1F25;
  --edit-bar-bg: #200E11;
  --edit-bar-border: #D0232E;
  --edit-label-color: #FF6A73;
  --edit-label-glow: none;
  --btn-done-color: #FF6A73;
  --btn-done-border: #D0232E;
  --btn-done-hover-bg: #3C1319;
  --btn-done-hover-glow: none;
  --btn-add-border: #6E7680;
  --update-bg: #1A1D22;
  --update-border: #AEB4BC;
  --update-color: #E9ECEF;
  --update-btn-border: #AEB4BC;
  --update-btn-hover-bg: #2A2E35;
  --update-btn-hover-glow: none;
  --btn-close-color: #E9ECEF;
  --btn-close-border: #AEB4BC;
  --btn-close-hover-bg: #2A2E35;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1C1F25;
  --picker-item-hover-bg: #1C1F25;
  --picker-item-active-bg: #262A31;
  --picker-placeholder-bg: #1C1F25;
  --skin-btn-active-bg: #262A31;
  --remove-btn-bg: #A8101C;
  --remove-btn-border: #FF5A64;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#DDE1E6` on `#0D0E10` | 4.5:1 | **14.70:1** |
| --text-dim on --bg | `#979EA8` on `#0D0E10` | 4.5:1 | **7.15:1** |
| --accent-c on --bg | `#D0232E` on `#0D0E10` | 3:1 | **3.64:1** |
| --accent-text on --bg | `#E9ECEF` on `#0D0E10` | 3:1 | **16.29:1** |
| --hint-sub-color on --bg | `#979EA8` on `#0D0E10` | 4.5:1 | **7.15:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#DDE1E6` on `#17191D` | 4.5:1 | **13.40:1** |
| Tile label on tile hover | `#DDE1E6` on `#1C1F25` | 4.5:1 | **12.57:1** |
| Tile label on tile pressed (pressed state) | `#DDE1E6` on `#1C1F25` | 4.5:1 | **12.57:1** |
| Title on header | `#E9ECEF` on `#14161A` | 4.5:1 | **15.27:1** |
| Title dot (`.accent`) on header | `#FF5A64` on `#14161A` | 4.5:1 | **5.95:1** |
| Header version on header | `#979EA8` on `#14161A` | 4.5:1 | **6.70:1** |
| Header button glyph on header | `#DDE1E6` on `#14161A` | 4.5:1 | **13.79:1** |
| Header button glyph on button hover | `#FFFFFF` on `#23272E` | 4.5:1 | **14.99:1** |
| Filter chip text on chip | `#E9ECEF` on `#1C1F25` | 4.5:1 | **13.92:1** |
| Banner text on banner | `#0D0E10` on `#D5D9DE` | 4.5:1 | **13.62:1** |
| Banner lab-door disc (Templar red) on silver strip (non-text) | `#D0232E` on `#D5D9DE` | 3.0:1 | **3.74:1** |
| Banner shield outline on silver strip (non-text) | `#68707A` on `#D5D9DE` | 3.0:1 | **3.54:1** |
| Shield cross (red) on shield field (non-text) | `#D0232E` on `#F6F8FA` | 3.0:1 | **4.98:1** |
| Edit label on edit bar | `#FF6A73` on `#200E11` | 4.5:1 | **6.68:1** |
| Done / close button text on edit bar | `#FF6A73` on `#200E11` | 4.5:1 | **6.68:1** |
| + FILE / + INSTALLED text on edit bar | `#DDE1E6` on `#200E11` | 4.5:1 | **14.12:1** |
| Done button text on its hover fill | `#FFFFFF` on `#3C1319` | 4.5:1 | **16.16:1** |
| Settings text on overlay | `#DDE1E6` on `#0D0E10` | 4.5:1 | **14.70:1** |
| Settings text on panel | `#DDE1E6` on `#17191D` | 4.5:1 | **13.40:1** |
| Settings label (text-dim) on panel | `#979EA8` on `#17191D` | 4.5:1 | **6.51:1** |
| Settings value / cheat key (accent-text) on panel | `#E9ECEF` on `#17191D` | 4.5:1 | **14.84:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#E9ECEF` on `#0D0E10` | 4.5:1 | **16.29:1** |
| Settings CLOSE text on panel | `#E9ECEF` on `#17191D` | 4.5:1 | **14.84:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#2A2E35` | 4.5:1 | **13.63:1** |
| Hotkey error text (accent-m) on panel | `#FF5A64` on `#17191D` | 4.5:1 | **5.78:1** |
| Hotkey input text on input fill | `#E9ECEF` on `#1C1F25` | 4.5:1 | **13.92:1** |
| Picker row text on hover fill | `#DDE1E6` on `#1C1F25` | 4.5:1 | **12.57:1** |
| Update banner text on update bar | `#E9ECEF` on `#1A1D22` | 4.5:1 | **14.25:1** |
| Update button text on hover fill | `#FFFFFF` on `#2A2E35` | 4.5:1 | **13.63:1** |
| Drop-hint text (text-dim) on grid ground | `#979EA8` on `#0D0E10` | 4.5:1 | **7.15:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A8101C` | 3.0:1 | **7.62:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#A8101C` | 3.0:1 | **7.62:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#D0232E` on `#17191D` | 3.0:1 | **3.32:1** |
| Focus ring on grid ground (non-text) | `#D0232E` on `#0D0E10` | 3.0:1 | **3.64:1** |
| Hover border on grid ground (non-text) | `#AEB4BC` on `#0D0E10` | 3.0:1 | **9.25:1** |
| Hover border on hover fill (non-text) | `#AEB4BC` on `#1C1F25` | 3.0:1 | **7.90:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#E9ECEF` on `#1C1F25` | 4.5:1 | **13.92:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#E9ECEF` on `#262A31` | 4.5:1 | **12.15:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#E9ECEF` on `#1C1F25` | 4.5:1 | **13.92:1** |
| Picker / skin search input text (accent-text) on search fill | `#E9ECEF` on `#1C1F25` | 4.5:1 | **13.92:1** |
| Rename / hotkey input text (accent-text) on input fill | `#E9ECEF` on `#1C1F25` | 4.5:1 | **13.92:1** |
| Search placeholder (text-dim) on search fill | `#979EA8` on `#1C1F25` | 4.5:1 | **6.11:1** |
| Hotkey recording text (accent-m) on input fill | `#FF5A64` on `#1C1F25` | 4.5:1 | **5.42:1** |
| Update dismiss glyph (text-dim) on update bar | `#979EA8` on `#1A1D22` | 4.5:1 | **6.25:1** |

**Lowest ratio in this theme: 3.32:1 (Focus ring (accent-c) on tile rest (non-text)).** Lowest text ratio: 5.42:1 (Hotkey recording text (accent-m) on input fill). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#17191D`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5E7EA1` | `#17191D` | 4.17:1 | pass |
| Calculator `#6b6f76` | `#6B6E74` | `#17191D` | 3.44:1 | pass |
| Paint `#b07a4f` | `#AB7B55` | `#17191D` | 4.77:1 | pass |
| Terminal `#3d4450` | `#3B414C` | `#17191D` | 1.72:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#548889` | `#17191D` | 4.41:1 | pass |
| Files `#c09a3e` | `#BE9B49` | `#17191D` | 6.68:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.44:1** (pass). Terminal (the mock plate is dark art) is 1.72:1 at rest and is excluded, as in every earlier batch. On the hover fill `#1C1F25`: **3.23:1**; on the pressed fill `#1C1F25`: **3.23:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is Templar red `#D0232E` (3.64:1 on the ground; the audit's `#B0121E` failed at 2.71) and is used for the focus ring, the slider and checkboxes, the filter-chip border, the edit-bar rule and the small marks; it is **not** the hover colour. `--accent-text` is silver-white `#E9ECEF` (values, chip, hotkey field and picker rows read as a clean console). `--accent-m` is a red tint `#FF5A64` for text only (the title dot, the hotkey error and recording text). Hover is silver: `--tile-hover-border #AEB4BC` (7.9:1 on the hover fill `#1C1F25`), so a mouse user sees silver and a keyboard user sees silver plus the red ring. The banner is the one light surface (`#D5D9DE`, ink text 13.6:1); the edit bar and update bar below it stay dark.

### 2.2 Type

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Segoe UI', Arial, sans-serif` | 400 (base) | base | base | base |
| `#title` | **`'Jost'`**, `'Segoe UI', Arial, sans-serif` (bundled, F B1/B5) | **400** | 11 px (base) | 4px | uppercase (markup) |
| `.tile-label` | **`'Jost'`**, `'Segoe UI', Arial, sans-serif` | 400 (`--tile-label-weight`) | 12 px (base) | 1.2px | uppercase (`--tile-label-transform`) |
| `#theme-banner-text` | **`'Jost'`**, `'Segoe UI', Arial, sans-serif` | 400 | 11 px (base) | 0.4px | sentence case, as written in 0.8 |

Rules (F B2): `font-synthesis: none` on each rule that sets Jost; `#title { font-weight: 400; font-style: normal; line-height: 1.2 }`. **Weight 400, not the map's 300:** Light is a hairline at 11 to 12 px on a dark ground (batch 1 review, the 2001 banner), and 400 keeps the geometric Futura look. Measured in the mock with the real `Jost-VF.ttf`: the title text is 126.7 px wide and its box ends at x 138.7 (17.3 px under the 156 gate, 29.3 px clear of the art at 168; no ladder step). Labels (F B2 rule 6 gate): NOTEPAD 60.8, CALCULATOR 82.8, TERMINAL 63.8, BROWSER 62.7, PAINT 37.5, FILES 33.5 px, all inside the 100 px box without an ellipsis. Expected `fontsRendered`: `Jost, Segoe UI`. **Cyrillic:** Jost covers U+0416, U+042F and U+0431, so Cyrillic tile names keep Jost; the fallback is Segoe UI (F B5).

### 2.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the cold-stone grain, rigid grid lines, vignette and red glow in `#app::after`, the painted cross-and-grid panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, particles, the `#app` animation, and the tile scan bar (B1 0.3; keyframes in 0.5). The theme has **no texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header, glass, a silver rule and a helix (HZ).**
- `#header { border-bottom-color:#8A9098; box-shadow: inset 0 1px 0 #262A30; }`: a 1 px silver line at y 39 to 40 and a 1 px glass highlight along the top (y 0 to 1); nothing paints below y 40. `#header::before { background:#AEB4BC; box-shadow:none; }` (the 2 px bar at the left edge, silver).
- **Helix, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `helix` (84 x 20): two parabolic strands (half period 14 px, crossing at x 0, 14, 28 ...) in two silvers, 18 grey rungs every 3.5 px and two red rungs. Window x 168 to 252, y 10 to 30. Hidden while the chip shows.
- `#title`: silver-white Jost with a red dot (`#FF5A64`, 5.95:1 on the header).

**B. Banner, a silver strip with a disc and a shield.** `#theme-banner { background: url(shield) right 16px top 2px / 30px 38px no-repeat, #D5D9DE; border-top-color:#8A9098; }`; text is ink `#0D0E10`.
- **Shield, SVG `shield`, 30 x 38** at banner x 378 to 408 (window y 259 to 297 at 424 x 300): a kite shield in near-white with a 1.3 px grey-blue outline, bearing a **red flared cross** (heraldic, pattée-style arms, dark-red 0.7 px edge). The longest ac-templars string ends at x 278, so 100 px clear.
- **Icon, SVG `iris`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): a red disc with a white hexagonal aperture and six blades, a generic lab-door iris.
- Decoration only; no text in any SVG.

**C. Tiles.** Rounded glass cards (`--radius: 6px`), fill `#17191D`, border `#262A30`. Icon plates: `--tile-icon-shape: inset(0 round 9px)` (glyph margins to the rounded corner: Notepad 12, Calculator 10, Paint 11, Terminal 10, Browser 11.5, Files 11 px; nothing is cropped). Hover and focus: fill `#1C1F25`, border `#AEB4BC`, no glow, no transform.

**D. Frame.** Nothing. An earlier draft with hairlines on the pad put a line 5 px from the scroll thumb that read as a second scrollbar, so the bands stay empty; the helix and the banner carry the theme.

**Trademark note.** The Abstergo logo (a stylised Penrose triangle over a microscope) and the Templar Order's game emblem are not drawn. The shield and cross are public heraldry, the disc is a generic iris, the helix is a generic double helix.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A8101C; }

/* window: no texture layer */
#app::after { background: none; }

/* header: glass panel, silver rule, a helix strip */
#header { border-bottom-color: #8A9098; box-shadow: inset 0 1px 0 #262A30; }
#header::before { background: #AEB4BC; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HELIX@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Jost', 'Segoe UI', Arial, sans-serif; font-weight: 400; font-style: normal; font-synthesis: none; line-height: 1.2; letter-spacing: 4px; color: #E9ECEF; text-shadow: none; }
#title .accent { color: #FF5A64; }

/* tiles: glass cards, silver hover, red only on the focus ring */
.app-tile { background: #17191D; border-color: #262A30; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Jost', 'Segoe UI', Arial, sans-serif; }

/* banner: a silver glass strip, dark text, a red lab-door disc, a Templar shield at the right end */
#theme-banner { background: @SHIELD@ right 16px top 2px / 30px 38px no-repeat, #D5D9DE; border-top-color: #8A9098; }
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @IRIS@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Jost', 'Segoe UI', Arial, sans-serif; font-weight: 400; letter-spacing: 0.4px; color: #0D0E10; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HELIX@` | `helix` |
| `@SHIELD@` | `shield` |
| `@IRIS@` | `iris` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`; encode `<`, `>`, `#` as B1 0.2 says):

**`helix`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<path d='M3.50 4.75 V15.25 M7.00 3.00 V17.00 M10.50 4.75 V15.25 M17.50 15.25 V4.75 M24.50 15.25 V4.75 M31.50 4.75 V15.25 M35.00 3.00 V17.00 M38.50 4.75 V15.25 M45.50 15.25 V4.75 M49.00 17.00 V3.00 M52.50 15.25 V4.75 M59.50 4.75 V15.25 M66.50 4.75 V15.25 M73.50 15.25 V4.75 M77.00 17.00 V3.00 M80.50 15.25 V4.75' stroke='rgb(118,126,136)' stroke-width='0.9' fill='none'/>
<path d='M21.00 17.00 V3.00 M63.00 3.00 V17.00' stroke='rgb(208,35,46)' stroke-width='1.1' fill='none'/>
<path d='M0 10 Q7 -4 14 10 T28 10 T42 10 T56 10 T70 10 T84 10' stroke='rgb(201,205,210)' stroke-width='1.3' fill='none' stroke-linecap='round'/>
<path d='M0 10 Q7 24 14 10 T28 10 T42 10 T56 10 T70 10 T84 10' stroke='rgb(150,158,168)' stroke-width='1.3' fill='none' stroke-linecap='round'/>
</svg>
```

**`shield`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 38'>
<path d='M1.5 1.5 H28.5 V18 C28.5 28.5 21.5 34.5 15 37 C8.5 34.5 1.5 28.5 1.5 18 Z' fill='rgb(246,248,250)' stroke='rgb(104,112,122)' stroke-width='1.3' stroke-linejoin='round'/>
<path d='M12.3 10.3 L11 3.6 H19 L17.7 10.3 L24.4 11 V19 L17.7 17.7 L19 24.4 H11 L12.3 17.7 L5.6 19 V11 Z' fill='rgb(208,35,46)' stroke='rgb(120,14,22)' stroke-width='0.7' stroke-linejoin='round'/>
</svg>
```

**`iris`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<circle cx='11' cy='11' r='10' fill='rgb(208,35,46)'/>
<path d='M11 5.2 L16 8.1 V13.9 L11 16.8 L6 13.9 V8.1 Z' fill='none' stroke='rgb(255,255,255)' stroke-width='1.2' stroke-linejoin='round'/>
<path d='M11 5.2 V1.5 M16 8.1 L19.2 6.3 M16 13.9 L19.2 15.7 M11 16.8 V20.5 M6 13.9 L2.8 15.7 M6 8.1 L2.8 6.3' stroke='rgb(255,255,255)' stroke-width='0.9' fill='none'/>
<circle cx='11' cy='11' r='2.2' fill='rgb(255,255,255)'/>
</svg>
```


### 2.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `templar-title 10s ease-in-out` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-pulse 6s ease-in-out` | `#theme-banner::before` opacity (tier 1) | removed |
| 3 | `templar-cross 10s ease-in-out` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `templar-readout 10s ease-in-out` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `templar-border 10s ease-in-out` | `#app` box-shadow (tier 5) | removed |
| hover | `tile-scan-v .5s forwards` (one-shot) | `.app-tile:hover::before` | removed (`::before` is `display:none`) |

**Before 5, after 0.** `grep -c infinite ac-templars.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance (was 1.5 s).

### 2.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#17191D`, border `#262A30` (1 px), radius 6 px, `::before` off; layout unchanged. Icons: `saturate(0.85) contrast(1.05)` through the rounded plate.
- **Hover:** fill `#1C1F25`, border silver `#AEB4BC`, no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px red ring at offset 2 (3.64:1 on the grid ground, 3.32:1 on the tile). **Pressed:** base scale 0.96 on `#1C1F25`.
- **Label:** `#DDE1E6`, Jost, uppercase, 1.2 px, no halo.
- **Filter chip:** base rule (fill `#1C1F25`, red border, silver-white text 13.9:1). The helix hides while it shows.
- **Edit bar:** `#200E11` fill, red rule (`#D0232E`), label `#FF6A73`; `+ FILE` and `+ INSTALLED` silver-white with a grey border, `DONE` red-tinted. The tile ✕ is `#A8101C` with a light-red ring; on hover it stays deep red (`.btn-remove:hover { background:#A8101C; }`).
- **Settings overlay:** opaque `#0D0E10`, panel `#17191D`, silver-white values and version (`#app-version`), red sliders and checkboxes, silver CLOSE.
- **Update banner:** silver-white text on `#1A1D22` with a silver rule.

### 2.6 Done when

1. `npm run check:contrast` passes with no rebaseline (the theme leaves the legacy list); `grep -c infinite ac-templars.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 5); no `\A`.
2. Header: a 1 px silver line at y 39 to 40 with nothing below it; the helix at x 168 to 252, y 10 to 30 with two red rungs; `#title` right edge at most 156 (mock 138.7); typing a letter hides the helix and shows the chip.
3. Banner: flat `#D5D9DE` with a 1 px grey top border; a red disc at x 14 to 36; a white shield with a red flared cross at x 378 to 408, y 259 to 297; ink text on one line (`scrollWidth <= clientWidth` for all three strings). The edit bar and update bar below it stay dark.
4. Hover shot (CALCULATOR): silver border, slightly lighter fill, no red anywhere on the tile; focus-visible adds a red ring.
5. Red appears only in the title dot, the focus ring, the slider and checkboxes, the chip border, edit mode, the helix's two rungs, the disc and the shield cross; no teal, blue or amber pixel in the chrome.
6. Hidden-tiles sigma 0.00 (no texture).
7. A/B/C probe at 424 x 300, 640 x 420, 1024 x 700 and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after`, `#header::before` and `#theme-banner::before`, and set `#theme-banner { background:#D5D9DE !important; }` (my run: clearance 6.7 px at 424 x 300, 4.0 px in the states shot, 10.7 px at 640 x 420 and 1024 x 700).
8. `fontsRendered` lists `Jost` and `Segoe UI`; a misspelled-family probe element falls back.

**Expected squint score: 4** (title and banner text covered). What survives: a graphite ground with silver hover, a DNA helix in the header, and a silver banner strip carrying a red lab-door disc and a Templar shield with a red flared cross. What is missing for a 5: the Animus and Helix screens' glass and glow, and the real Abstergo wordmark (neither may be drawn). The least certain 4 of the batch: out of context the cross-on-shield can read as a first-aid mark; the helix and the disc are what make it Abstergo.

---

## 3. swl-templar (SECRET WORLD LEGENDS: TEMPLAR): DONE

**Audit:** score 2, redraw, legacy contrast failure (text-dim, accent-c, hint-sub). Header, version and ghost text were dim red-brown on brown-black; CALCULATOR truncated to "CALCULAT..." from wide tracking; a red ghost column sat on the right; red was spread over everything instead of one accent on stone. The audit's red `#A81E1E` computes to 2.66:1 on the ground, which is why the gate failed.
**Direction:** Temple Hall, London. Warm black stone and bone type, crimson only where the faction uses it (the banners, one line under the header, focus, edit mode). The frame is a **Classical portico** (a dentil cornice under the header, fluted pilasters down both sides), because the fetched sources describe Templar territory as "plastered with red banners and white crosses" and the base as "heavily Classical, with lots of straight lines, right angles and elegantly squared proportions" (0.3.2). The header hangs two red banners with white crosses between pilasters; the banner strip runs a Greek-key course, carries a temple front as its icon and one big red banner at the right end. Plates end in a banner-tail. The title is blackletter (the map's call, flag 1 in 9). No glow, no texture, no animation.

### 3.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #100C0B;
  --panel-bg: #1A1412;
  --overlay-bg: #100C0B;
  --header-bg: #1B1411;
  --font: 'Palatino Linotype', Palatino, Georgia, serif;
  --text: #DDD6C6;
  --text-dim: #A89F8C;
  --accent-c: #C42B2B;
  --accent-m: #EE6A64;
  --accent-y: #DDD6C6;
  --accent-text: #E8E2D2;
  --border: #3A3029;
  --border-h: #C42B2B;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #C42B2B;
  --title-anim: none;
  --tile-hover-bg: #1F1512;
  --tile-hover-border: #C42B2B;
  --tile-hover-shadow: none;
  --tile-active-bg: #1F1512;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.85) contrast(1.05);
  --tile-icon-shape: polygon(0 0, 100% 0, 100% 100%, 50% 90%, 0 100%);
  --tile-label-spacing: 0.6px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #2A1C18;
  --btn-active-bg: #38241F;
  --drop-hint-border: #4A3E34;
  --drop-icon-color: #7A6C5C;
  --hint-sub-color: #A89F8C;
  --rename-dashed: #C42B2B;
  --rename-input-bg: #1F1512;
  --edit-bar-bg: #2A0F0F;
  --edit-bar-border: #C42B2B;
  --edit-label-color: #F08A84;
  --edit-label-glow: none;
  --btn-done-color: #F08A84;
  --btn-done-border: #C42B2B;
  --btn-done-hover-bg: #45181A;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A6C5C;
  --update-bg: #211915;
  --update-border: #7A6C5C;
  --update-color: #E8E2D2;
  --update-btn-border: #7A6C5C;
  --update-btn-hover-bg: #33261F;
  --update-btn-hover-glow: none;
  --btn-close-color: #E8E2D2;
  --btn-close-border: #7A6C5C;
  --btn-close-hover-bg: #33261F;
  --btn-close-hover-glow: none;
  --picker-search-bg: #1F1512;
  --picker-item-hover-bg: #1F1512;
  --picker-item-active-bg: #2B1C18;
  --picker-placeholder-bg: #1F1512;
  --skin-btn-active-bg: #2B1C18;
  --remove-btn-bg: #A01E1E;
  --remove-btn-border: #EE6A64;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#DDD6C6` on `#100C0B` | 4.5:1 | **13.44:1** |
| --text-dim on --bg | `#A89F8C` on `#100C0B` | 4.5:1 | **7.41:1** |
| --accent-c on --bg | `#C42B2B` on `#100C0B` | 3:1 | **3.45:1** |
| --accent-text on --bg | `#E8E2D2` on `#100C0B` | 3:1 | **15.04:1** |
| --hint-sub-color on --bg | `#A89F8C` on `#100C0B` | 4.5:1 | **7.41:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#DDD6C6` on `#1A1412` | 4.5:1 | **12.59:1** |
| Tile label on tile hover | `#DDD6C6` on `#1F1512` | 4.5:1 | **12.36:1** |
| Tile label on tile pressed (pressed state) | `#DDD6C6` on `#1F1512` | 4.5:1 | **12.36:1** |
| Title on header | `#E8E2D2` on `#1B1411` | 4.5:1 | **14.06:1** |
| Title dot (`.accent`) on header | `#EE6A64` on `#1B1411` | 4.5:1 | **5.96:1** |
| Header version on header | `#A89F8C` on `#1B1411` | 4.5:1 | **6.93:1** |
| Header button glyph on header | `#DDD6C6` on `#1B1411` | 4.5:1 | **12.56:1** |
| Header button glyph on button hover | `#FFFFFF` on `#2A1C18` | 4.5:1 | **16.44:1** |
| Filter chip text on chip | `#E8E2D2` on `#1F1512` | 4.5:1 | **13.83:1** |
| Banner text on banner | `#E8E2D2` on `#140F0D` | 4.5:1 | **14.71:1** |
| Header crimson line on header (non-text) | `#C42B2B` on `#1B1411` | 3.0:1 | **3.23:1** |
| Edit label on edit bar | `#F08A84` on `#2A0F0F` | 4.5:1 | **7.39:1** |
| Done / close button text on edit bar | `#F08A84` on `#2A0F0F` | 4.5:1 | **7.39:1** |
| + FILE / + INSTALLED text on edit bar | `#DDD6C6` on `#2A0F0F` | 4.5:1 | **12.36:1** |
| Done button text on its hover fill | `#FFFFFF` on `#45181A` | 4.5:1 | **15.01:1** |
| Settings text on overlay | `#DDD6C6` on `#100C0B` | 4.5:1 | **13.44:1** |
| Settings text on panel | `#DDD6C6` on `#1A1412` | 4.5:1 | **12.59:1** |
| Settings label (text-dim) on panel | `#A89F8C` on `#1A1412` | 4.5:1 | **6.94:1** |
| Settings value / cheat key (accent-text) on panel | `#E8E2D2` on `#1A1412` | 4.5:1 | **14.09:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#E8E2D2` on `#100C0B` | 4.5:1 | **15.04:1** |
| Settings CLOSE text on panel | `#E8E2D2` on `#1A1412` | 4.5:1 | **14.09:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#33261F` | 4.5:1 | **14.61:1** |
| Hotkey error text (accent-m) on panel | `#EE6A64` on `#1A1412` | 4.5:1 | **5.97:1** |
| Hotkey input text on input fill | `#E8E2D2` on `#1F1512` | 4.5:1 | **13.83:1** |
| Picker row text on hover fill | `#DDD6C6` on `#1F1512` | 4.5:1 | **12.36:1** |
| Update banner text on update bar | `#E8E2D2` on `#211915` | 4.5:1 | **13.37:1** |
| Update button text on hover fill | `#FFFFFF` on `#33261F` | 4.5:1 | **14.61:1** |
| Drop-hint text (text-dim) on grid ground | `#A89F8C` on `#100C0B` | 4.5:1 | **7.41:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A01E1E` | 3.0:1 | **7.78:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#A01E1E` | 3.0:1 | **7.78:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#C42B2B` on `#1A1412` | 3.0:1 | **3.23:1** |
| Focus ring on grid ground (non-text) | `#C42B2B` on `#100C0B` | 3.0:1 | **3.45:1** |
| Hover border on grid ground (non-text) | `#C42B2B` on `#100C0B` | 3.0:1 | **3.45:1** |
| Hover border on hover fill (non-text) | `#C42B2B` on `#1F1512` | 3.0:1 | **3.17:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#E8E2D2` on `#1F1512` | 4.5:1 | **13.83:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#E8E2D2` on `#2B1C18` | 4.5:1 | **12.67:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#E8E2D2` on `#1F1512` | 4.5:1 | **13.83:1** |
| Picker / skin search input text (accent-text) on search fill | `#E8E2D2` on `#1F1512` | 4.5:1 | **13.83:1** |
| Rename / hotkey input text (accent-text) on input fill | `#E8E2D2` on `#1F1512` | 4.5:1 | **13.83:1** |
| Search placeholder (text-dim) on search fill | `#A89F8C` on `#1F1512` | 4.5:1 | **6.82:1** |
| Hotkey recording text (accent-m) on input fill | `#EE6A64` on `#1F1512` | 4.5:1 | **5.86:1** |
| Update dismiss glyph (text-dim) on update bar | `#A89F8C` on `#211915` | 4.5:1 | **6.59:1** |

**Lowest ratio in this theme: 3.17:1 (Hover border on hover fill (non-text)).** Lowest text ratio: 5.86:1 (Hotkey recording text (accent-m) on input fill). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#1A1412`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5E7EA1` | `#1A1412` | 4.32:1 | pass |
| Calculator `#6b6f76` | `#6B6E74` | `#1A1412` | 3.56:1 | pass |
| Paint `#b07a4f` | `#AB7B55` | `#1A1412` | 4.94:1 | pass |
| Terminal `#3d4450` | `#3B414C` | `#1A1412` | 1.78:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#548889` | `#1A1412` | 4.56:1 | pass |
| Files `#c09a3e` | `#BE9B49` | `#1A1412` | 6.92:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.56:1** (pass). Terminal (the mock plate is dark art) is 1.78:1 at rest and is excluded, as in every earlier batch. On the hover fill `#1F1512`: **3.50:1**; on the pressed fill `#1F1512`: **3.50:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is crimson `#C42B2B` (3.45:1 on the ground, the lowest gate margin of the batch; the audit's `#A81E1E` failed at 2.66) and is used for the header line, the focus ring, the hover border, the slider and checkboxes, the edit bar and the banners' red (`rgb(176,30,30)` inside the art, a fill). `--accent-text` is bone `#E8E2D2` (values, chip, hotkey field and picker rows: white on stone, like the crosses). `--accent-m` is a red tint `#EE6A64`, text only (the title dot, the hotkey error and recording text). Hover fill `#1F1512` keeps the mid-grey Calculator plate above 3:1. The stone tones in the art (`rgb(122,108,92)` and its light and dark edges) are decoration, not text.

### 3.2 Type

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Palatino Linotype', Palatino, Georgia, serif` | 400 (base) | base | base | base |
| `#title` | **`'UnifrakturCook'`**, `'Palatino Linotype', Palatino, Georgia, serif` (bundled, F B1/B5) | **700** (the only weight) | **12 px** | 3px | **lowercase** (`text-transform: lowercase`; reads `quick.launch`) |
| `.tile-label` | `'Palatino Linotype', Palatino, Georgia, serif` (`pala.ttf`) | 400 (`--tile-label-weight`) | 12 px (base) | 0.6px | uppercase (`--tile-label-transform`) |
| `#theme-banner-text` | **`'IM Fell English'`**, Georgia, `'Times New Roman'`, serif (bundled) | 400 | **12 px** | 0 | sentence case, `font-style: normal` (roman only) |

Rules (F B2): `font-synthesis: none` on the title and banner rules; `#title { font-weight: 700; font-style: normal; line-height: 1.2 }`; blackletter is lowercase (rule 4). **The title is set at 12 px**, not 11: blackletter's x-height is small and lowercase at 11 px read tiny in the mock. Measured with the real `UnifrakturCook-Bold.ttf`: the title text is 87.4 px wide and its box ends at x 99.4 (56.6 px under the gate, 68.6 px clear of the art). Labels in Palatino uppercase with 0.6 px tracking: NOTEPAD 63.4, CALCULATOR 89.6, TERMINAL 69.5, BROWSER 62.6, PAINT 40.2, FILES 34.7 px, all inside the 100 px box (the old 1.5 px tracking is why CALCULATOR truncated). The banner in IM Fell English at 12 px with no tracking (F B2 rule 7): 274.8, 181.9 and 116.3 px. Expected `fontsRendered`: `UnifrakturCook, Palatino Linotype, IM Fell English`. **Cyrillic:** Palatino Linotype covers U+0416 and U+042F, so Cyrillic tile names render in Palatino; the title and banner strings are Latin.

### 3.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the warm stone grain, vignette and stained-glass glow in `#app::after`, the painted cross-and-text panno (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub and the `#app` animation, and the tile scan bar (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header, a crimson line and two banners between pilasters (HZ).**
- `#header { border-bottom-color:#C42B2B; box-shadow: inset 0 -2px 0 #C42B2B; }`: a 3 px crimson line inside the header (y 37 to 40; nothing below); `#header::before { background:#C42B2B; box-shadow:none; }` (the 2 px bar at the left edge).
- **Scene, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `hz` (84 x 20): three stone pilasters with capitals and bases (window x 168 to 172, 208 to 212, 248 to 252), a stone rod at y 2, and two hanging banners (26 x 15.5, swallow-tail, crimson with a dark-red edge) each bearing a white flared cross, at window x 177 to 203 and 217 to 243. Hidden while the chip shows.
- `#title`: bone blackletter with a red dot (`#EE6A64`).

**B. Frame, a portico.** `#grid-container`'s own background, seven layers, all inside the bands: SVG `dentil` (8 x 10, `repeat-x` at `left 0 top 1px`, window y 41 to 51, full width: the cornice); SVG `cap` (10 x 8) at `left 1px top 11px` and `right 5px top 11px` (window y 51 to 59); SVG `shaft` (10 px wide, a fluted pilaster with `preserveAspectRatio='none'`, one layer of `10px calc(100% - 25px)` at `top 19px`: window y 59 to 250 at 424 x 300) on both sides; SVG `base` (10 x 6) at `left 1px bottom 0` and `right 5px bottom 0` (window y 250 to 256). Left pilaster x 1 to 11, right pilaster x 409 to 419 (W-15 to W-5); the tile field and its 4 px keep-out are untouched. The pilasters are fixed to the frame (the grid scrolls under them).

**C. Banner, a Greek-key course, a temple and one red banner.** `#theme-banner { background: url(flag) right 16px top 0 / 30px 38px no-repeat, url(key) left 0 top 0 / 14px 7px repeat-x, #140F0D; border-top-color:#3A3029; }`; text bone.
- **Key course, SVG `key`, 14 x 7** repeating along the top (banner y 0 to 7, window y 257 to 264): a stone meander.
- **Banner, SVG `flag`, 30 x 38** hanging from a stone rod at banner x 378 to 408 (window y 257 to 295): crimson, swallow-tail, white flared cross. The longest string ends at x 320.8: 57 px clear.
- **Icon, SVG `temple`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): a bone temple front (pediment, four columns, two steps) with a red tympanum.
- Decoration only; no text in any SVG.

**D. Tiles.** Square (`--radius: 0px`), fill `#1A1412`, border `#2E251F`. Plates end in a banner-tail: `--tile-icon-shape: polygon(0 0, 100% 0, 100% 100%, 50% 90%, 0 100%)`. Glyph margins (computed against the mock glyph geometry): Notepad 8.2, Calculator 6.5, Paint 4.6, Terminal 10.0, Browser 5.1, Files 11.0 px; nothing is cropped (a deeper tail at 86 percent left Paint 2.0 px and is not used). Hover and focus: fill `#1F1512`, border crimson, no glow.

**Trademark note.** The Templars' game emblem (Funcom) is not drawn. A red banner with a white flared cross, a colonnade and a temple front are heraldry and generic architecture; no character, no crest, no text in any SVG.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A01E1E; }

/* window: no texture layer */
#app::after { background: none; }

/* header: stone, a 3 px crimson line inside it, pilasters and banners in the art zone */
#header { border-bottom-color: #C42B2B; box-shadow: inset 0 -2px 0 #C42B2B; }
#header::before { background: #C42B2B; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @HZ@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'UnifrakturCook', 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 700; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 12px; letter-spacing: 3px; text-transform: lowercase; color: #E8E2D2; text-shadow: none; }
#title .accent { color: #EE6A64; }

/* frame: a portico. Cornice with dentils under the header, fluted pilasters on both sides */
#grid-container {
  background:
    @CAP@ left 1px top 11px / 10px 8px no-repeat,
    @CAP@ right 5px top 11px / 10px 8px no-repeat,
    @BASE@ left 1px bottom 0 / 10px 6px no-repeat,
    @BASE@ right 5px bottom 0 / 10px 6px no-repeat,
    @SHAFT@ left 1px top 19px / 10px calc(100% - 25px) no-repeat,
    @SHAFT@ right 5px top 19px / 10px calc(100% - 25px) no-repeat,
    @DENTIL@ left 0 top 1px / 8px 10px repeat-x;
}

/* tiles: square, stone-edged, crimson on hover */
.app-tile { background: #1A1412; border-color: #2E251F; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Palatino Linotype', Palatino, Georgia, serif; }

/* banner: Greek key course along the top, a temple front, one big red banner at the right end */
#theme-banner {
  background: @FLAG@ right 16px top 0 / 30px 38px no-repeat, @KEY@ left 0 top 0 / 14px 7px repeat-x, #140F0D;
  border-top-color: #3A3029;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @TEMPLE@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'IM Fell English', Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 400; font-style: normal; font-synthesis: none; letter-spacing: 0; color: #E8E2D2; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@HZ@` | `hz` |
| `@CAP@` | `cap` |
| `@BASE@` | `base` |
| `@SHAFT@` | `shaft` |
| `@DENTIL@` | `dentil` |
| `@FLAG@` | `flag` |
| `@KEY@` | `key` |
| `@TEMPLE@` | `temple` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`; encode `<`, `>`, `#` as B1 0.2 says; `shaft` carries `preserveAspectRatio='none'` on purpose):

**`hz`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<rect x='0' y='0' width='4' height='20' fill='rgb(122,108,92)'/><rect x='0' y='0' width='1' height='20' fill='rgb(156,142,124)'/><rect x='3' y='0' width='1' height='20' fill='rgb(70,60,50)'/>
<rect x='-1.0' y='0' width='6' height='2' fill='rgb(156,142,124)'/><rect x='-1.0' y='18' width='6' height='2' fill='rgb(122,108,92)'/>
<rect x='40' y='0' width='4' height='20' fill='rgb(122,108,92)'/><rect x='40' y='0' width='1' height='20' fill='rgb(156,142,124)'/><rect x='43' y='0' width='1' height='20' fill='rgb(70,60,50)'/>
<rect x='39.0' y='0' width='6' height='2' fill='rgb(156,142,124)'/><rect x='39.0' y='18' width='6' height='2' fill='rgb(122,108,92)'/>
<rect x='80' y='0' width='4' height='20' fill='rgb(122,108,92)'/><rect x='80' y='0' width='1' height='20' fill='rgb(156,142,124)'/><rect x='83' y='0' width='1' height='20' fill='rgb(70,60,50)'/>
<rect x='79.0' y='0' width='6' height='2' fill='rgb(156,142,124)'/><rect x='79.0' y='18' width='6' height='2' fill='rgb(122,108,92)'/>
<rect x='4' y='2' width='36' height='1.2' fill='rgb(122,108,92)'/><rect x='44' y='2' width='36' height='1.2' fill='rgb(122,108,92)'/>
<path d='M9.0 3.2 H35.0 V18.7 L22.0 15.2 L9.0 18.7 Z' fill='rgb(176,30,30)' stroke='rgb(110,16,16)' stroke-width='0.7' stroke-linejoin='round'/>
<polygon points='20.99,8.39 19.98,4.80 24.02,4.80 23.01,8.39 26.60,7.38 26.60,11.42 23.01,10.41 24.02,14.00 19.98,14.00 20.99,10.41 17.40,11.42 17.40,7.38' fill='rgb(236,230,216)'/>
<path d='M49.0 3.2 H75.0 V18.7 L62.0 15.2 L49.0 18.7 Z' fill='rgb(176,30,30)' stroke='rgb(110,16,16)' stroke-width='0.7' stroke-linejoin='round'/>
<polygon points='60.99,8.39 59.98,4.80 64.02,4.80 63.01,8.39 66.60,7.38 66.60,11.42 63.01,10.41 64.02,14.00 59.98,14.00 60.99,10.41 57.40,11.42 57.40,7.38' fill='rgb(236,230,216)'/>
</svg>
```

**`cap`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 8'>
<rect x='0' y='0' width='10' height='2' fill='rgb(156,142,124)'/>
<path d='M1 2 H9 L8 5 H2 Z' fill='rgb(122,108,92)'/>
<rect x='1.5' y='5' width='7' height='3' fill='rgb(122,108,92)'/>
<rect x='0' y='0' width='10' height='0.8' fill='rgb(190,176,156)'/>
</svg>
```

**`base`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'>
<rect x='1.5' y='0' width='7' height='2' fill='rgb(122,108,92)'/>
<rect x='0.5' y='2' width='9' height='2' fill='rgb(156,142,124)'/>
<rect x='0' y='4' width='10' height='2' fill='rgb(122,108,92)'/>
</svg>
```

**`shaft`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 8' preserveAspectRatio='none'>
<rect width='10' height='8' fill='rgb(122,108,92)'/>
<rect x='0' width='1' height='8' fill='rgb(156,142,124)'/><rect x='9' width='1' height='8' fill='rgb(58,48,40)'/>
<rect x='2.5' width='1' height='8' fill='rgb(70,60,50)'/><rect x='4.5' width='1' height='8' fill='rgb(70,60,50)'/><rect x='6.5' width='1' height='8' fill='rgb(70,60,50)'/>
</svg>
```

**`dentil`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 10'>
<rect x='0' y='0' width='8' height='1.4' fill='rgb(156,142,124)'/>
<rect x='0' y='1.4' width='8' height='1.6' fill='rgb(122,108,92)'/>
<rect x='1' y='4.2' width='4' height='3.4' fill='rgb(122,108,92)'/>
<rect x='0' y='8.4' width='8' height='1.6' fill='rgb(70,60,50)'/>
</svg>
```

**`flag`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 38'>
<rect x='0' y='0' width='30' height='2.4' fill='rgb(122,108,92)'/><rect x='0' y='0' width='30' height='0.8' fill='rgb(156,142,124)'/>
<path d='M2.0 2.4 H28.0 V37.0 L15.0 31.0 L2.0 37.0 Z' fill='rgb(176,30,30)' stroke='rgb(110,16,16)' stroke-width='0.8' stroke-linejoin='round'/>
<polygon points='13.11,12.51 11.22,5.80 18.78,5.80 16.89,12.51 23.60,10.62 23.60,18.18 16.89,16.29 18.78,23.00 11.22,23.00 13.11,16.29 6.40,18.18 6.40,10.62' fill='rgb(236,230,216)'/>
<path d='M5 29 H25' stroke='rgb(110,16,16)' stroke-width='0.9'/>
</svg>
```

**`key`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 7'>
<path d='M0 6.5 V0.5 H6 V4.5 H2.5 V2.5 H4 M7 6.5 V0.5 H13 V4.5 H9.5 V2.5 H11' fill='none' stroke='rgb(122,108,92)' stroke-width='1' stroke-linejoin='miter'/>
<path d='M0 6.5 H14' stroke='rgb(122,108,92)' stroke-width='1'/>
</svg>
```

**`temple`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<g fill='rgb(222,214,198)'>
<path d='M11 2 L21 8 H1 Z'/>
<rect x='1.5' y='8.6' width='19' height='2'/>
<rect x='3' y='11.4' width='2.6' height='6.6'/><rect x='7.7' y='11.4' width='2.6' height='6.6'/><rect x='11.7' y='11.4' width='2.6' height='6.6'/><rect x='16.4' y='11.4' width='2.6' height='6.6'/>
<rect x='1.5' y='18.4' width='19' height='1.6'/><rect x='0.5' y='20.4' width='21' height='1.4'/>
</g>
<path d='M11 4.6 L16.6 7.6 H5.4 Z' fill='rgb(176,30,30)'/>
</svg>
```


### 3.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `swlt-title 10s steps(1)` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-pulse 6s ease-in-out` | `#theme-banner::before` opacity (tier 1) | removed |
| 3 | `swlt-hud 10s ease-in-out` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `swlt-readout 10s ease-in-out` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `swlt-border 10s ease-in-out` | `#app` box-shadow (tier 5) | removed |
| hover | `tile-scan-v .5s forwards` (one-shot) | `.app-tile:hover::before` | removed (`::before` is `display:none`) |

**Before 5, after 0.** `grep -c infinite swl-templar.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance (was 1.5 s).

### 3.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#1A1412`, border `#2E251F` (1 px), radius 0, `::before` off; layout unchanged. Icons: `saturate(0.85) contrast(1.05)` through the banner-tail plate.
- **Hover:** fill `#1F1512`, border crimson (3.17:1 on the hover fill, the lowest non-text pair of the batch), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px crimson ring at offset 2 (3.45:1 on the grid ground, 3.2:1 on the tile). **Pressed:** base scale 0.96 on `#1F1512`.
- **Label:** bone `#DDD6C6`, Palatino, uppercase, no halo.
- **Filter chip:** base rule (fill `#1F1512`, crimson border, bone text). The banner scene hides while it shows.
- **Edit bar:** `#2A0F0F` fill, crimson rule, label `#F08A84`; `+ FILE` and `+ INSTALLED` in stone with a stone border, `DONE` red-tinted. The tile ✕ is `#A01E1E` with a light-red ring; on hover it stays deep red (`.btn-remove:hover { background:#A01E1E; }`).
- **Settings overlay:** opaque `#100C0B`, panel `#1A1412`, bone values and version (`#app-version`), crimson sliders and checkboxes, bone CLOSE.
- **Update banner:** bone text on `#211915` with a stone rule.

### 3.6 Done when

1. `npm run check:contrast` passes with no rebaseline (the theme leaves the legacy list); `grep -c infinite swl-templar.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 5); no `\A`.
2. Header: a 3 px crimson line at y 37 to 40 with nothing below; the pilaster-and-banner scene at x 168 to 252, y 10 to 30 with two white crosses; `#title` right edge at most 156 (mock 99.4); the title reads lowercase `quick.launch` in blackletter at 12 px; typing a letter hides the scene and shows the chip.
3. Frame: a dentil cornice at y 41 to 51; a pilaster capital, a fluted shaft and a base on each side (x 1 to 11 and x 409 to 419), shaft y 59 to 250 at 424 x 300 and scaling with the window height; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 is 1 px clear of the right pilaster (Foundation acceptance check).
4. Banner: `#140F0D` with a 7 px Greek-key course along the top, a temple at x 14 to 36, a red banner at x 378 to 408 hanging from the top, bone IM Fell English text on one line (`scrollWidth <= clientWidth` for all three strings).
5. Hover shot (CALCULATOR): crimson border, dark-red fill, banner-tail plate with no cropped glyph, no ellipsis on CALCULATOR.
6. No teal, blue or green pixel in the chrome of the grid or settings shot (tile icons excluded); red appears only where 3.1 lists it; white crosses only on banners.
7. Hidden-tiles sigma 0.00.
8. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after`, `#header::before` and `#theme-banner::before`, set `#grid-container { background:none !important; }` and `#theme-banner { background:#140F0D !important; }` (my run: clearance 4.0 px at 424 x 300, 1.3 px in the states shot, 5.3 px at 640 x 420 and 1024 x 700).
9. `fontsRendered` lists `UnifrakturCook`, `Palatino Linotype` and `IM Fell English`; a misspelled-family probe element falls back.

**Expected squint score: 4** (title and banner text covered). What survives: a stone hall with pilasters and a cornice, a crimson line, red banners with white crosses in the header and at the banner's right end, a temple front, a Greek-key course. What is missing for a 5: the game's own faction emblem and real Temple Hall photography (neither may be drawn), and, for the blackletter, agreement with the Classical look (flag 1).

---

## 4. swl-dragon (SECRET WORLD LEGENDS: DRAGON): DONE

**Audit:** score 3, tone down. Dark green and italic Georgia were on colour, but the gold half of "green and gold" was nearly invisible and the yin-yang banner icon was the kung-fu cliche (the Dragon is Seoul-based chaos theory). A lore panel ("BONG CHA", "THE HONEYCOMB") sat right of the tiles and a big ghost word block covered the lower right. Neat and symmetric where the faction is scattered and organic. Six infinite animations and a hover flicker.
**Direction:** Seoul lit by green lamps. A green-black ground, pale jade type, gold for everything the app says, a **concrete-grey banner strip** (the fetched sources: "green lanterns and grey concrete"). A gold Hangul tag and a **string of green lanterns** in the header; a few dots, unevenly placed, and one ripple ring on the pad (chaos is uneven); a **gold coin** as the banner icon and **ripples spreading from a gold pebble** at the right end (the faction pitch: "a thousand coins flung into the air", "tiny ripples that grow into sweeping tsunamis"). Pointed-hex plates are kept. No glow, no texture, no animation.

### 4.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 4px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #07100B;
  --panel-bg: #0F1A14;
  --overlay-bg: #07100B;
  --header-bg: #0B1610;
  --font: 'Malgun Gothic', 'Segoe UI', sans-serif;
  --text: #CFE3D4;
  --text-dim: #8FB09A;
  --accent-c: #2FB56A;
  --accent-m: #E6B84F;
  --accent-y: #CFE3D4;
  --accent-text: #E6B84F;
  --border: #22382B;
  --border-h: #2FB56A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #2FB56A;
  --title-anim: none;
  --tile-hover-bg: #0D2418;
  --tile-hover-border: #2FB56A;
  --tile-hover-shadow: none;
  --tile-active-bg: #0D2418;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: contrast(1.05) saturate(0.95);
  --tile-icon-shape: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
  --tile-label-spacing: 0.3px;
  --tile-label-transform: none;
  --tile-label-weight: 400;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #14301F;
  --btn-active-bg: #1A3D28;
  --drop-hint-border: #2C4A38;
  --drop-icon-color: #4E7A61;
  --hint-sub-color: #8FB09A;
  --rename-dashed: #2FB56A;
  --rename-input-bg: #0D2418;
  --edit-bar-bg: #1A1606;
  --edit-bar-border: #C8962E;
  --edit-label-color: #E6B84F;
  --edit-label-glow: none;
  --btn-done-color: #E6B84F;
  --btn-done-border: #C8962E;
  --btn-done-hover-bg: #362B0A;
  --btn-done-hover-glow: none;
  --btn-add-border: #4E7A61;
  --update-bg: #0F2218;
  --update-border: #2FB56A;
  --update-color: #CFE3D4;
  --update-btn-border: #2FB56A;
  --update-btn-hover-bg: #16392A;
  --update-btn-hover-glow: none;
  --btn-close-color: #E6B84F;
  --btn-close-border: #C8962E;
  --btn-close-hover-bg: #362B0A;
  --btn-close-hover-glow: none;
  --picker-search-bg: #0D2418;
  --picker-item-hover-bg: #0D2418;
  --picker-item-active-bg: #16392A;
  --picker-placeholder-bg: #0D2418;
  --skin-btn-active-bg: #16392A;
  --remove-btn-bg: #A8321F;
  --remove-btn-border: #E6B84F;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#CFE3D4` on `#07100B` | 4.5:1 | **14.33:1** |
| --text-dim on --bg | `#8FB09A` on `#07100B` | 4.5:1 | **8.13:1** |
| --accent-c on --bg | `#2FB56A` on `#07100B` | 3:1 | **7.30:1** |
| --accent-text on --bg | `#E6B84F` on `#07100B` | 3:1 | **10.42:1** |
| --hint-sub-color on --bg | `#8FB09A` on `#07100B` | 4.5:1 | **8.13:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#CFE3D4` on `#0F1A14` | 4.5:1 | **13.23:1** |
| Tile label on hover pill | `#E6B84F` on `#0D2418` | 4.5:1 | **8.84:1** |
| Tile label on hover pill (pressed state) | `#E6B84F` on `#0D2418` | 4.5:1 | **8.84:1** |
| Title on header | `#E6B84F` on `#0B1610` | 4.5:1 | **9.97:1** |
| Title dot (`.accent`) on header | `#2FB56A` on `#0B1610` | 4.5:1 | **6.99:1** |
| Header version on header | `#8FB09A` on `#0B1610` | 4.5:1 | **7.78:1** |
| Header button glyph on header | `#CFE3D4` on `#0B1610` | 4.5:1 | **13.72:1** |
| Header button glyph on button hover | `#FFFFFF` on `#14301F` | 4.5:1 | **14.26:1** |
| Filter chip text on chip | `#E6B84F` on `#0D2418` | 4.5:1 | **8.84:1** |
| Banner text on banner | `#DCEBDD` on `#252B28` | 4.5:1 | **11.66:1** |
| Header tag (gold Hangul) on header | `#E6B84F` on `#0B1610` | 4.5:1 | **9.97:1** |
| Banner coin (gold) on banner (non-text) | `#D9B04A` on `#252B28` | 3.0:1 | **7.05:1** |
| Edit label on edit bar | `#E6B84F` on `#1A1606` | 4.5:1 | **9.76:1** |
| Done / close button text on edit bar | `#E6B84F` on `#1A1606` | 4.5:1 | **9.76:1** |
| + FILE / + INSTALLED text on edit bar | `#CFE3D4` on `#1A1606` | 4.5:1 | **13.43:1** |
| Done button text on its hover fill | `#FFFFFF` on `#362B0A` | 4.5:1 | **13.94:1** |
| Settings text on overlay | `#CFE3D4` on `#07100B` | 4.5:1 | **14.33:1** |
| Settings text on panel | `#CFE3D4` on `#0F1A14` | 4.5:1 | **13.23:1** |
| Settings label (text-dim) on panel | `#8FB09A` on `#0F1A14` | 4.5:1 | **7.51:1** |
| Settings value / cheat key (accent-text) on panel | `#E6B84F` on `#0F1A14` | 4.5:1 | **9.62:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#E6B84F` on `#07100B` | 4.5:1 | **10.42:1** |
| Settings CLOSE text on panel | `#E6B84F` on `#0F1A14` | 4.5:1 | **9.62:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#362B0A` | 4.5:1 | **13.94:1** |
| Hotkey error text (accent-m) on panel | `#E6B84F` on `#0F1A14` | 4.5:1 | **9.62:1** |
| Hotkey input text on input fill | `#E6B84F` on `#0D2418` | 4.5:1 | **8.84:1** |
| Picker row text on hover fill | `#CFE3D4` on `#0D2418` | 4.5:1 | **12.16:1** |
| Update banner text on update bar | `#CFE3D4` on `#0F2218` | 4.5:1 | **12.35:1** |
| Update button text on hover fill | `#FFFFFF` on `#16392A` | 4.5:1 | **12.71:1** |
| Drop-hint text (text-dim) on grid ground | `#8FB09A` on `#07100B` | 4.5:1 | **8.13:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A8321F` | 3.0:1 | **6.69:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#A8321F` | 3.0:1 | **6.69:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#2FB56A` on `#0F1A14` | 3.0:1 | **6.74:1** |
| Focus ring on grid ground (non-text) | `#2FB56A` on `#07100B` | 3.0:1 | **7.30:1** |
| Hover border on grid ground (non-text) | `#2FB56A` on `#07100B` | 3.0:1 | **7.30:1** |
| Hover border on hover fill (non-text) | `#2FB56A` on `#0D2418` | 3.0:1 | **6.19:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#E6B84F` on `#0D2418` | 4.5:1 | **8.84:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#E6B84F` on `#16392A` | 4.5:1 | **6.86:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#E6B84F` on `#0D2418` | 4.5:1 | **8.84:1** |
| Picker / skin search input text (accent-text) on search fill | `#E6B84F` on `#0D2418` | 4.5:1 | **8.84:1** |
| Rename / hotkey input text (accent-text) on input fill | `#E6B84F` on `#0D2418` | 4.5:1 | **8.84:1** |
| Search placeholder (text-dim) on search fill | `#8FB09A` on `#0D2418` | 4.5:1 | **6.90:1** |
| Hotkey recording text (accent-m) on input fill | `#E6B84F` on `#0D2418` | 4.5:1 | **8.84:1** |
| Update dismiss glyph (text-dim) on update bar | `#8FB09A` on `#0F2218` | 4.5:1 | **7.01:1** |

**Lowest ratio in this theme: 6.19:1 (Hover border on hover fill (non-text)).** Lowest text ratio: 6.86:1 (Theme-picker selected row text (accent-text) on picker active fill). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#0F1A14`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5B7FA6` | `#0F1A14` | 4.27:1 | pass |
| Calculator `#6b6f76` | `#6A6E76` | `#0F1A14` | 3.48:1 | pass |
| Paint `#b07a4f` | `#B07A50` | `#0F1A14` | 4.88:1 | pass |
| Terminal `#3d4450` | `#3A414D` | `#0F1A14` | 1.73:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#4F8A8B` | `#0F1A14` | 4.53:1 | pass |
| Files `#c09a3e` | `#C19B40` | `#0F1A14` | 6.82:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.48:1** (pass). Terminal (the mock plate is dark art) is 1.73:1 at rest and is excluded, as in every earlier batch. On the hover fill `#0D2418`: **3.20:1**; on the pressed fill `#0D2418`: **3.20:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is jade `#2FB56A` (7.3:1 on the ground) for the header line, focus ring, hover border, slider and lanterns; `--accent-text` and `--accent-m` are gold `#E6B84F` (9.6:1 on the panel) for values, chip, hotkey field, picker rows, the title, the tag, the edit bar and the hover label. The title dot takes jade (`#2FB56A`, 7.0:1 on the header). The banner strip's concrete grey `#252B28` is the only neutral grey in the theme. The hover and pressed fill is `#0D2418`: my first draft (`#0F2A1B`) put the Calculator plate at 3.002:1, a hair over 3, so it is darkened to 3.20:1 (same jade hue, L 0.011).

### 4.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Malgun Gothic', 'Segoe UI', sans-serif` | 400 (base) | base | base | base |
| `#title` | `'Malgun Gothic', 'Segoe UI', sans-serif` (`malgunbd.ttf`) | 700 | 11 px (base) | 3px | uppercase (markup) |
| `.tile-label` | `'Malgun Gothic', 'Segoe UI', sans-serif` (`malgun.ttf`) | 400 (`--tile-label-weight`) | 12 px (base) | 0.3px | none (`--tile-label-transform`), names as written |
| `#theme-banner-text` | `'Malgun Gothic', 'Segoe UI', sans-serif` | 400 | 11 px (base) | 0.3px | sentence case, as written in 0.8 |
| header tag (`#header::after`) | `'Malgun Gothic', 'Segoe UI', sans-serif` (`malgunbd.ttf`) | 700 | 11 px | 1px | 서울 |

Malgun Gothic is the Windows UI face for Hangul, a modern sans that suits a city of neon signs better than the audit's italic Georgia. Measured: the title text is 118.8 px wide and its box ends at x 130.8 (25.2 px under the gate, 37.2 px clear of the art at 168). Labels in Malgun Gothic 12 px with 0.3 px tracking: Notepad 49.4, Calculator 57.1, Terminal 47.8, Browser 45.1, Paint 28.2, Files 25.0 px (all far inside the 100 px box). The tag 서울 is about 24 px wide (x 168 to 192); the lanterns are right-aligned in the same 84 px box (x 198 to 252), so the two never overlap. Expected `fontsRendered`: `Malgun Gothic` (the tag is a pseudo-element; the gallery cannot see it, B2 11.5 C1, so check it in a 3x crop). **Cyrillic:** Malgun Gothic covers U+0416, U+042F and U+0431 (negative control Ebrima failed); Cyrillic tile names render in Malgun Gothic.

### 4.3 Art (tone down with small new motifs). Static, original, inline SVG data URIs

Delete: the jade fractal noise, vignette and colour pools in `#app::after`, the painted scatter panno and its lore text (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the three-layer `#particles` drift, the `#app` animation, the yin-yang banner glyph and the hover `tile-flicker` (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header, a jade line, a Hangul tag and a string of lanterns (HZ).**
- `#header { border-bottom-color:#2FB56A; box-shadow: inset 0 -1px 0 #2FB56A; }`: a 2 px jade line inside the header (y 38 to 40; nothing below); `#header::before { background:#2FB56A; box-shadow:none; }` (the 2 px bar at the left edge).
- **Tag and lanterns, `#header::after`**: `content:'서울'; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px; white-space:nowrap; font:700 11px/20px 'Malgun Gothic','Segoe UI',sans-serif; letter-spacing:1px; color:#E6B84F; background:url(lanterns) no-repeat right 0 top 0 / 54px 20px; pointer-events:none;`. Write the characters literally (UTF-8, no BOM); the escape form is `content:'\C11C\C6B8'`. SVG `lanterns` (54 x 20): a sagging cord and four lanterns of uneven drop (5.5, 10.5, 6.5, 10.4 px), jade body, pale-jade core, gold caps; window x 198 to 252, y 10 to 30. Hidden while the chip shows.
- `#title`: gold Malgun Gothic Bold with a jade dot.

**B. Frame, scattered dots (all three bands).** `#grid-container` background, three layers: SVG `dotst` (424 x 10 at `left 0 top 1px`, seven dots in the top band, window y 41 to 51), SVG `dotsl` (10 x 212 at `left 1px top 0`, five dots in the left band, x 1 to 11) and SVG `dotsr` (10 x 212 at `right 5px top 0`, five dots and **one ripple ring** with a gold centre, radius 4, at window x 414, y 158, in the right band x 409 to 419). Jade and gold, uneven on purpose. The dots stop at 212 px, so a taller window shows them in the top part of the bands only.

**C. Banner, concrete, a coin and ripples.** `#theme-banner { background: url(ripples) right 12px bottom 0 / 84px 34px no-repeat, #252B28; border-top: 2px solid #2FB56A; }`; text pale jade-white `#DCEBDD`.
- **Ripples, SVG `ripples`, 84 x 34** at banner x 328 to 412 (window y 266 to 300 at 424 x 300): five jade ellipses widening from a gold pebble (radius 2.6), stroke opacity falling from 1.0 to 0.26; the outer rings are cropped by the box. The longest string ends at x 251.7; the first ring starts near x 354.
- **Icon, SVG `coin`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): a gold disc with a square hole and an inner rim, the East Asian coin.
- Decoration only; no text in any SVG.

**D. Tiles.** Pointed-hex plates (kept from today, the audit said keep): `--tile-icon-shape: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)`. Glyph margins to the cut edges: Notepad 4.5, Calculator 2.2, Paint 8.5, Terminal 2.7, Browser 9.2, Files 4.9 px; nothing is cropped, but Calculator's 2.2 px is the tightest margin in this batch (watch item 4 in 9). Tile fill `#0F1A14`, border `#1B2E23`, radius 4 px. Hover and focus: fill `#0D2418`, border jade, label turns gold.

**Trademark note.** The Dragon faction's logo (Funcom, a green emblem whose shape no source describes) is not drawn, and I did not draw an Eastern dragon: the sources describe lanterns, coins and ripples, and yakuza (batch 2) already has a gold dragon. Lanterns, a coin, ripples and a Hangul word are generic.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A8321F; }

/* window: no texture layer */
#app::after { background: none; }

/* header: a 2 px jade line inside it, the Hangul tag and a string of lanterns in the art zone */
#header { border-bottom-color: #2FB56A; box-shadow: inset 0 -1px 0 #2FB56A; }
#header::before { background: #2FB56A; box-shadow: none; }
#header::after {
  content: '서울'; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px; white-space: nowrap;
  font: 700 11px/20px 'Malgun Gothic', 'Segoe UI', sans-serif; letter-spacing: 1px; color: #E6B84F;
  background: @LANTERNS@ no-repeat right 0 top 0 / 54px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Malgun Gothic', 'Segoe UI', sans-serif; font-weight: 700; letter-spacing: 3px; color: #E6B84F; text-shadow: none; }
#title .accent { color: #2FB56A; }

/* frame: scattered dots on the pad, one ripple ring */
#grid-container {
  background:
    @DOTST@ left 0 top 1px / 424px 10px no-repeat,
    @DOTSL@ left 1px top 0 / 10px 212px no-repeat,
    @DOTSR@ right 5px top 0 / 10px 212px no-repeat;
}

/* tiles: pointed-hex plates, jade edge, gold label on hover */
.app-tile { background: #0F1A14; border-color: #1B2E23; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Malgun Gothic', 'Segoe UI', sans-serif; }
.app-tile:hover .tile-label, .app-tile:focus-visible .tile-label { color: #E6B84F; }

/* banner: a concrete strip, a gold coin, ripples from a pebble at the right end */
#theme-banner { background: @RIPPLES@ right 12px bottom 0 / 84px 34px no-repeat, #252B28; border-top: 2px solid #2FB56A; }
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @COIN@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Malgun Gothic', 'Segoe UI', sans-serif; font-weight: 400; letter-spacing: 0.3px; color: #DCEBDD; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@LANTERNS@` | `lanterns` |
| `@DOTST@` | `dotst` |
| `@DOTSL@` | `dotsl` |
| `@DOTSR@` | `dotsr` |
| `@RIPPLES@` | `ripples` |
| `@COIN@` | `coin` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`; encode `<`, `>`, `#` as B1 0.2 says):

**`lanterns`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 54 20'>
<path d='M0 2.5 Q14 6 27 3 T54 4.5' fill='none' stroke='rgb(112,132,120)' stroke-width='0.9'/>
<path d='M7 3.6 V6.3' stroke='rgb(112,132,120)' stroke-width='0.8'/>
<rect x='5.3' y='5.9' width='3.3' height='1.6' fill='rgb(217,176,74)'/>
<ellipse cx='7' cy='9.5' rx='3.0' ry='3.4' fill='rgb(47,181,106)'/>
<ellipse cx='7' cy='9.5' rx='1.3' ry='1.5' fill='rgb(160,240,196)'/>
<rect x='5.8' y='12.7' width='2.4' height='1.2' fill='rgb(217,176,74)'/>
<path d='M19 3.6 V10.9' stroke='rgb(112,132,120)' stroke-width='0.8'/>
<rect x='17.1' y='10.5' width='3.7' height='1.6' fill='rgb(217,176,74)'/>
<ellipse cx='19' cy='14.5' rx='3.4' ry='3.8' fill='rgb(47,181,106)'/>
<ellipse cx='19' cy='14.5' rx='1.4' ry='1.7' fill='rgb(160,240,196)'/>
<rect x='17.6' y='18.1' width='2.7' height='1.2' fill='rgb(217,176,74)'/>
<path d='M31 3.6 V7.3' stroke='rgb(112,132,120)' stroke-width='0.8'/>
<rect x='29.4' y='6.9' width='3.3' height='1.6' fill='rgb(217,176,74)'/>
<ellipse cx='31' cy='10.5' rx='3.0' ry='3.4' fill='rgb(47,181,106)'/>
<ellipse cx='31' cy='10.5' rx='1.3' ry='1.5' fill='rgb(160,240,196)'/>
<rect x='29.8' y='13.7' width='2.4' height='1.2' fill='rgb(217,176,74)'/>
<path d='M43 3.6 V10.8' stroke='rgb(112,132,120)' stroke-width='0.8'/>
<rect x='41.1' y='10.4' width='3.7' height='1.6' fill='rgb(217,176,74)'/>
<ellipse cx='43' cy='14.4' rx='3.4' ry='3.8' fill='rgb(47,181,106)'/>
<ellipse cx='43' cy='14.4' rx='1.4' ry='1.7' fill='rgb(160,240,196)'/>
<rect x='41.6' y='18.0' width='2.7' height='1.2' fill='rgb(217,176,74)'/>
</svg>
```

**`dotst`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 424 10'>
<circle cx='38' cy='5' r='1.6' fill='rgb(47,181,106)'/>
<circle cx='71' cy='3.5' r='1' fill='rgb(217,176,74)'/>
<circle cx='139' cy='6' r='1.9' fill='rgb(47,181,106)' fill-opacity='0.8'/>
<circle cx='207' cy='4' r='1.1' fill='rgb(217,176,74)'/>
<circle cx='262' cy='6.5' r='1.5' fill='rgb(47,181,106)'/>
<circle cx='331' cy='3.5' r='1.2' fill='rgb(47,181,106)' fill-opacity='0.8'/>
<circle cx='377' cy='5.5' r='1' fill='rgb(217,176,74)'/>
</svg>
```

**`dotsl`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 212'>
<circle cx='5' cy='24' r='2.4' fill='rgb(47,181,106)'/>
<circle cx='7' cy='47' r='1.2' fill='rgb(217,176,74)'/>
<circle cx='3.5' cy='103' r='1.8' fill='rgb(47,181,106)'/>
<circle cx='6.5' cy='131' r='1.1' fill='rgb(217,176,74)'/>
<circle cx='4' cy='176' r='2.1' fill='rgb(47,181,106)' fill-opacity='0.8'/>
</svg>
```

**`dotsr`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 212'>
<circle cx='4.5' cy='12' r='1.3' fill='rgb(217,176,74)'/>
<circle cx='6' cy='66' r='1.9' fill='rgb(47,181,106)'/>
<circle cx='5' cy='118' r='4' fill='none' stroke='rgb(47,181,106)' stroke-width='0.9' stroke-opacity='0.8'/>
<circle cx='5' cy='118' r='1.2' fill='rgb(217,176,74)'/>
<circle cx='3.5' cy='168' r='1.5' fill='rgb(47,181,106)' fill-opacity='0.8'/>
<circle cx='6.5' cy='196' r='1.1' fill='rgb(217,176,74)'/>
</svg>
```

**`ripples`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<g fill='none' stroke='rgb(47,181,106)'>
<ellipse cx='58' cy='20' rx='6.5' ry='4.0' stroke-opacity='1.00' stroke-width='1.2'/>
<ellipse cx='58' cy='20' rx='13.0' ry='8.1' stroke-opacity='0.80' stroke-width='1.2'/>
<ellipse cx='58' cy='20' rx='19.5' ry='12.1' stroke-opacity='0.60' stroke-width='1.2'/>
<ellipse cx='58' cy='20' rx='26.0' ry='16.1' stroke-opacity='0.42' stroke-width='1.2'/>
<ellipse cx='58' cy='20' rx='32.5' ry='20.1' stroke-opacity='0.26' stroke-width='1.2'/>
</g>
<circle cx='58' cy='20' r='2.6' fill='rgb(217,176,74)'/>
</svg>
```

**`coin`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path fill-rule='evenodd' d='M11 1 A10 10 0 1 1 10.99 1 Z M7.8 7.8 H14.2 V14.2 H7.8 Z' fill='rgb(217,176,74)'/>
<circle cx='11' cy='11' r='8.2' fill='none' stroke='rgb(140,104,30)' stroke-width='0.9'/>
<path d='M7 7 H15 V15 H7 Z M7.8 7.8 V14.2 H14.2 V7.8 Z' fill-rule='evenodd' fill='rgb(140,104,30)'/>
</svg>
```


### 4.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `dragon-title 12s steps(1)` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-pulse 5s ease-in-out` | `#theme-banner::before` opacity (tier 1) | removed |
| 3 | `dragon-chaos 12s ease-in-out` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `dragon-readout 12s ease-in-out` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `dragon-border 12s ease-in-out` | `#app` box-shadow (tier 5) | removed |
| 6 | `dragon-drift 12s linear` | `#particles` background-position (tier 4) | removed |
| hover | `tile-flicker .4s steps(1) infinite` | `.app-tile:hover::before` opacity (tier 1) | removed (`::before` is `display:none`) |

**Before 6 (+1 hover-only), after 0.** `grep -c infinite swl-dragon.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance (was 1.8 s).

### 4.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#0F1A14`, border `#1B2E23` (1 px), radius 4 px, `::before` off; layout unchanged. Icons: `contrast(1.05) saturate(0.95)` through the hex plate.
- **Hover:** fill `#0D2418`, border jade (6.2:1 on the hover fill), the label turns gold (`#E6B84F`, 8.84:1 on the hover fill), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px jade ring at offset 2 (7.3:1 on the ground, 6.7:1 on the tile). **Pressed:** base scale 0.96 on `#0D2418`.
- **Label:** pale jade `#CFE3D4`, Malgun Gothic, names as written, no halo.
- **Filter chip:** base rule (fill `#0D2418`, jade border, gold text). The tag and lanterns hide while it shows.
- **Edit bar:** `#1A1606` fill, dark-gold rule (`#C8962E`), gold label; `+ FILE` and `+ INSTALLED` pale jade with a green-grey border, `DONE` gold. The tile ✕ is `#A8321F` with a gold ring; on hover it stays deep red (`.btn-remove:hover { background:#A8321F; }`).
- **Settings overlay:** opaque `#07100B`, panel `#0F1A14`, gold values and version (`#app-version`), jade sliders and checkboxes, gold CLOSE.
- **Update banner:** pale jade text on `#0F2218` with a jade rule.

### 4.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite swl-dragon.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`.
2. Header: a 2 px jade line at y 38 to 40 with nothing below it; a gold 서울 at x 168 to about 192 and four lanterns at x 198 to 252 (3x crop; the glyphs are in a Hangul face, not boxes); `#title` right edge at most 156 (mock 130.8); typing a letter hides both and shows the chip.
3. Frame: jade and gold dots in the three bands only (none at x 12 or more inside the tile field, none in y 52 or more), one ring with a gold centre in the right band at y 158; the last-column focus ring at 640 x 420 and 1024 x 700 is 1 px clear of the right band (Foundation acceptance check).
4. Banner: flat `#252B28` with a 2 px jade top border, a gold coin at x 14 to 36, ripples at x 328 to 412 flush with the bottom, pale text on one line (`scrollWidth <= clientWidth` for all five strings).
5. Hover shot (CALCULATOR): jade border, dark-jade fill, gold label, pointed-hex plate with no cropped glyph.
6. No red, orange or blue pixel in the chrome of the grid or settings shot (tile icons excluded; the tile ✕ in edit mode is the one red); gold appears only in values, the version, the tag, the title, the coin, dots, edit mode and the hover label.
7. Hidden-tiles sigma 0.00.
8. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after`, `#header::before` and `#theme-banner::before`, set `#grid-container { background:none !important; }` and `#theme-banner { background:#252B28 !important; }` (my run: clearance 6.7 px at every size in the grid shot, 2.7 px in the states shot).
9. `fontsRendered` lists `Malgun Gothic`; the tag's Hangul is checked visually at 3x.

**Expected squint score: 3** (title and banner text covered). What survives: jade and gold on green-black, a concrete-grey strip, a string of lanterns, a coin, ripples and scattered dots. What keeps it at 3: the faction's own emblem (nothing I could reach describes its shape, and it is a Funcom mark) and a dragon silhouette (left out on purpose, above); a fan who knows the faction pitch (coins, ripples) gets there, one who does not reads "green Asian lantern theme".

---

## 5. swl-illuminati (SECRET WORLD LEGENDS: ILLUMINATI): DONE

**Audit:** score 3, tone down. Blue-and-black is sourced and right, but the primary was electric `#0072E8` where the faction is cold and corporate, and a gold secondary brought the gold-and-black luxury look Makoto marks as wrong. An eye-in-triangle with a handler list sat behind CALCULATOR and BROWSER, ghost text filled the right, the banner line was truncated. Six infinite animations and a hover flicker.
**Direction:** New York, cold and corporate. A navy-black ground with silver type and thin steel-blue rules, no gold. The fetched sources say the base is "sharp and triangular, with a multi-tiered structure, a shadowy atmosphere and blue lighting" and the colour is "sleek blue and black corporate detailing", so the header carries a **stepped ziggurat**, the banner a small **eye in a triangle** (a public symbol, drawn thin and corporate, not the meme) and a **setback skyline** at its right end (New York). Plates get a folded **dossier corner**. The one warm colour, a muted red, marks edit mode and errors only. No glow, no texture, no animation.

### 5.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 6px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #070A12;
  --panel-bg: #0F1522;
  --overlay-bg: #070A12;
  --header-bg: #0C1220;
  --font: 'Segoe UI', Arial, sans-serif;
  --text: #D4DCE8;
  --text-dim: #93A3BC;
  --accent-c: #3A72C4;
  --accent-m: #E8707C;
  --accent-y: #D4DCE8;
  --accent-text: #8DB8F0;
  --border: #1E2A40;
  --border-h: #3A72C4;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #3A72C4;
  --title-anim: none;
  --tile-hover-bg: #10203A;
  --tile-hover-border: #3A72C4;
  --tile-hover-shadow: none;
  --tile-active-bg: #10203A;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: saturate(0.85) contrast(1.05);
  --tile-icon-shape: polygon(0 0, 78% 0, 100% 22%, 100% 100%, 0 100%);
  --tile-label-spacing: 1px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #152846;
  --btn-active-bg: #1B3358;
  --drop-hint-border: #2A3A58;
  --drop-icon-color: #4A618A;
  --hint-sub-color: #93A3BC;
  --rename-dashed: #3A72C4;
  --rename-input-bg: #10203A;
  --edit-bar-bg: #1E0F14;
  --edit-bar-border: #C4505E;
  --edit-label-color: #F08A94;
  --edit-label-glow: none;
  --btn-done-color: #F08A94;
  --btn-done-border: #C4505E;
  --btn-done-hover-bg: #3A1620;
  --btn-done-hover-glow: none;
  --btn-add-border: #4A618A;
  --update-bg: #0E1A2E;
  --update-border: #3A72C4;
  --update-color: #D4DCE8;
  --update-btn-border: #3A72C4;
  --update-btn-hover-bg: #16294A;
  --update-btn-hover-glow: none;
  --btn-close-color: #8DB8F0;
  --btn-close-border: #3A72C4;
  --btn-close-hover-bg: #16294A;
  --btn-close-hover-glow: none;
  --picker-search-bg: #10203A;
  --picker-item-hover-bg: #10203A;
  --picker-item-active-bg: #16294A;
  --picker-placeholder-bg: #10203A;
  --skin-btn-active-bg: #16294A;
  --remove-btn-bg: #A8283A;
  --remove-btn-border: #E8707C;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#D4DCE8` on `#070A12` | 4.5:1 | **14.33:1** |
| --text-dim on --bg | `#93A3BC` on `#070A12` | 4.5:1 | **7.73:1** |
| --accent-c on --bg | `#3A72C4` on `#070A12` | 3:1 | **4.13:1** |
| --accent-text on --bg | `#8DB8F0` on `#070A12` | 3:1 | **9.66:1** |
| --hint-sub-color on --bg | `#93A3BC` on `#070A12` | 4.5:1 | **7.73:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#D4DCE8` on `#0F1522` | 4.5:1 | **13.21:1** |
| Tile label on tile hover | `#D4DCE8` on `#10203A` | 4.5:1 | **11.79:1** |
| Tile label on tile pressed (pressed state) | `#D4DCE8` on `#10203A` | 4.5:1 | **11.79:1** |
| Title on header | `#D4DCE8` on `#0C1220` | 4.5:1 | **13.54:1** |
| Title dot (`.accent`) on header | `#6FA6F0` on `#0C1220` | 4.5:1 | **7.47:1** |
| Header version on header | `#93A3BC` on `#0C1220` | 4.5:1 | **7.31:1** |
| Header button glyph on header | `#D4DCE8` on `#0C1220` | 4.5:1 | **13.54:1** |
| Header button glyph on button hover | `#FFFFFF` on `#152846` | 4.5:1 | **14.75:1** |
| Filter chip text on chip | `#8DB8F0` on `#10203A` | 4.5:1 | **7.95:1** |
| Banner text on banner | `#D4DCE8` on `#0A0F1A` | 4.5:1 | **13.87:1** |
| Banner eye-in-triangle (light blue) on banner (non-text) | `#8DB8F0` on `#0A0F1A` | 3.0:1 | **9.35:1** |
| Edit label on edit bar | `#F08A94` on `#1E0F14` | 4.5:1 | **7.73:1** |
| Done / close button text on edit bar | `#F08A94` on `#1E0F14` | 4.5:1 | **7.73:1** |
| + FILE / + INSTALLED text on edit bar | `#D4DCE8` on `#1E0F14` | 4.5:1 | **13.41:1** |
| Done button text on its hover fill | `#FFFFFF` on `#3A1620` | 4.5:1 | **15.96:1** |
| Settings text on overlay | `#D4DCE8` on `#070A12` | 4.5:1 | **14.33:1** |
| Settings text on panel | `#D4DCE8` on `#0F1522` | 4.5:1 | **13.21:1** |
| Settings label (text-dim) on panel | `#93A3BC` on `#0F1522` | 4.5:1 | **7.13:1** |
| Settings value / cheat key (accent-text) on panel | `#8DB8F0` on `#0F1522` | 4.5:1 | **8.91:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#8DB8F0` on `#070A12` | 4.5:1 | **9.66:1** |
| Settings CLOSE text on panel | `#8DB8F0` on `#0F1522` | 4.5:1 | **8.91:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#16294A` | 4.5:1 | **14.48:1** |
| Hotkey error text (accent-m) on panel | `#E8707C` on `#0F1522` | 4.5:1 | **6.12:1** |
| Hotkey input text on input fill | `#8DB8F0` on `#10203A` | 4.5:1 | **7.95:1** |
| Picker row text on hover fill | `#D4DCE8` on `#10203A` | 4.5:1 | **11.79:1** |
| Update banner text on update bar | `#D4DCE8` on `#0E1A2E` | 4.5:1 | **12.61:1** |
| Update button text on hover fill | `#FFFFFF` on `#16294A` | 4.5:1 | **14.48:1** |
| Drop-hint text (text-dim) on grid ground | `#93A3BC` on `#070A12` | 4.5:1 | **7.73:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A8283A` | 3.0:1 | **6.93:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#A8283A` | 3.0:1 | **6.93:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#3A72C4` on `#0F1522` | 3.0:1 | **3.81:1** |
| Focus ring on grid ground (non-text) | `#3A72C4` on `#070A12` | 3.0:1 | **4.13:1** |
| Hover border on grid ground (non-text) | `#3A72C4` on `#070A12` | 3.0:1 | **4.13:1** |
| Hover border on hover fill (non-text) | `#3A72C4` on `#10203A` | 3.0:1 | **3.40:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#8DB8F0` on `#10203A` | 4.5:1 | **7.95:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#8DB8F0` on `#16294A` | 4.5:1 | **7.07:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#8DB8F0` on `#10203A` | 4.5:1 | **7.95:1** |
| Picker / skin search input text (accent-text) on search fill | `#8DB8F0` on `#10203A` | 4.5:1 | **7.95:1** |
| Rename / hotkey input text (accent-text) on input fill | `#8DB8F0` on `#10203A` | 4.5:1 | **7.95:1** |
| Search placeholder (text-dim) on search fill | `#93A3BC` on `#10203A` | 4.5:1 | **6.36:1** |
| Hotkey recording text (accent-m) on input fill | `#E8707C` on `#10203A` | 4.5:1 | **5.46:1** |
| Update dismiss glyph (text-dim) on update bar | `#93A3BC` on `#0E1A2E` | 4.5:1 | **6.80:1** |

**Lowest ratio in this theme: 3.40:1 (Hover border on hover fill (non-text)).** Lowest text ratio: 5.46:1 (Hotkey recording text (accent-m) on input fill). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#0F1522`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5E7EA1` | `#0F1522` | 4.32:1 | pass |
| Calculator `#6b6f76` | `#6B6E74` | `#0F1522` | 3.57:1 | pass |
| Paint `#b07a4f` | `#AB7B55` | `#0F1522` | 4.95:1 | pass |
| Terminal `#3d4450` | `#3B414C` | `#0F1522` | 1.78:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#548889` | `#0F1522` | 4.57:1 | pass |
| Files `#c09a3e` | `#BE9B49` | `#0F1522` | 6.93:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.57:1** (pass). Terminal (the mock plate is dark art) is 1.78:1 at rest and is excluded, as in every earlier batch. On the hover fill `#10203A`: **3.18:1**; on the pressed fill `#10203A`: **3.18:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is steel blue `#3A72C4` (4.13:1 on the ground, 3.81:1 on the tile; the audit's `#2F5FA8` is 3.13 on the ground but only 2.89 on the tile, so it could not carry a focus ring there); it is used for the header rule, the focus ring, the hover border, the slider and the art lines. `--accent-text` is a light steel `#8DB8F0` (values, chip, hotkey field, picker rows). `--accent-m` is a muted red `#E8707C`, text only (the hotkey error and recording text); the edit bar's red rule `#C4505E` and the ✕ button are fills. The title dot takes a blue (`#6FA6F0`), not the red. A monochrome theme needs one other colour, or edit mode looks like normal mode with a different label; red is also the only colour absent from the faction's blue-and-black, so it cannot be mistaken for a faction mark.

### 5.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Segoe UI', Arial, sans-serif` | 400 (base) | base | base | base |
| `#title` | `'Segoe UI', Arial, sans-serif` (`seguisb.ttf`) | 600 | 11 px (base) | 4px | uppercase (markup) |
| `.tile-label` | `'Segoe UI', Arial, sans-serif` (`seguisb.ttf`) | 600 (`--tile-label-weight`) | 12 px (base) | 1px | uppercase (`--tile-label-transform`) |
| `#theme-banner-text` | `'Segoe UI', Arial, sans-serif` (`seguisb.ttf`) | 600 | 11 px (base) | 0.2px | sentence case, as written in 0.8 |

The faction's own type is unverified (the Foundation map kept the stock face), so Segoe UI Semibold stands. Measured: the title text is 127.5 px wide and its box ends at x 139.5 (16.5 px under the gate, 28.5 px clear of the art at 168). Labels in Segoe UI Semibold 12 px with 1 px tracking: NOTEPAD 60.5, CALCULATOR 83.0, TERMINAL 66.0, BROWSER 62.5, PAINT 38.6, FILES 33.1 px, all inside the 100 px box. Expected `fontsRendered`: `Segoe UI, Segoe UI Semibold`. **Cyrillic:** Segoe UI Semibold covers U+0416 and U+042F (negative control Ebrima failed).

### 5.3 Art (tone down with small new motifs). Static, original, inline SVG data URIs

Delete: the blue fractal noise, vignette and colour pools in `#app::after`, the painted eye-and-pyramid panno and handler list (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` data rain, the `#app` animation, the banner's triangle glyph and the hover `tile-flicker` (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header, a steel rule and a ziggurat (HZ).**
- `#header { border-bottom-color:#3A72C4; }`: a 1 px steel-blue line at y 39 to 40; `#header::before { background:#3A72C4; box-shadow:none; }` (the 2 px bar at the left edge).
- **Ziggurat, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `zig` (84 x 20): six centred tiers (widths 8, 16, 26, 38, 52, 68 px, 3 px tall, 1 px steel outline on navy) with the apex tier lit light steel, and base rules at y 29.5 (window) running to the box edges. Window x 168 to 252, y 10 to 30. Hidden while the chip shows.
- `#title`: silver Semibold with a blue dot.

**B. Frame.** Nothing. (The audit's thin rules on the pad put a line 5 px from the scroll thumb that reads as a second scrollbar; the bands stay empty.)

**C. Banner, an eye and a skyline.** `#theme-banner { background: url(sky) right 12px bottom 0 / 84px 34px no-repeat, #0A0F1A; border-top-color:#3A72C4; }`; text silver.
- **Skyline, SVG `sky`, 84 x 34** at banner x 328 to 412 (window y 266 to 300 at 424 x 300): seven setback towers in a mid navy (`rgb(31,54,96)`), three with a spire and a light-steel beacon dot, seventeen steel-blue 1.4 x 1.8 px lit windows. The longest string ends at x 261.5, so 66.5 px clear.
- **Icon, SVG `eye`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): a thin light-steel triangle on navy with an almond eye, a steel iris and a dark pupil. No rays, no glow.
- Decoration only; no text in any SVG.

**D. Tiles.** Dossier-corner plates: `--tile-icon-shape: polygon(0 0, 78% 0, 100% 22%, 100% 100%, 0 100%)` (a folded top-right corner). Glyph margins: Notepad 11.3, Calculator 9.1, Paint 11.0, Terminal 7.0, Browser 11.5, Files 11.0 px; nothing is cropped. Tile fill `#0F1522`, border `#1A2438`, radius 6 px. Hover and focus: fill `#10203A`, border steel.

**Trademark note.** The Illuminati faction logo (Funcom) is not drawn. The eye in a triangle is the public symbol, drawn small and thin; the ziggurat and the skyline are generic.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A8283A; }

/* window: no texture layer */
#app::after { background: none; }

/* header: a steel-blue rule, a stepped ziggurat in the art zone */
#header { border-bottom-color: #3A72C4; }
#header::before { background: #3A72C4; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @ZIG@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 600; letter-spacing: 4px; color: #D4DCE8; text-shadow: none; }
#title .accent { color: #6FA6F0; }

/* tiles: dossier-corner plates */
.app-tile { background: #0F1522; border-color: #1A2438; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Segoe UI', Arial, sans-serif; }

/* banner: an eye in a triangle, a setback skyline at the right end */
#theme-banner { background: @SKY@ right 12px bottom 0 / 84px 34px no-repeat, #0A0F1A; border-top-color: #3A72C4; }
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @EYE@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 600; letter-spacing: 0.2px; color: #D4DCE8; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@ZIG@` | `zig` |
| `@SKY@` | `sky` |
| `@EYE@` | `eye` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`; encode `<`, `>`, `#` as B1 0.2 says):

**`zig`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<rect x='38.0' y='1.5' width='8' height='3' fill='rgb(141,184,240)' stroke='rgb(58,114,196)' stroke-width='1'/>
<rect x='34.0' y='4.5' width='16' height='3' fill='rgb(16,30,58)' stroke='rgb(58,114,196)' stroke-width='1'/>
<rect x='29.0' y='7.5' width='26' height='3' fill='rgb(16,30,58)' stroke='rgb(58,114,196)' stroke-width='1'/>
<rect x='23.0' y='10.5' width='38' height='3' fill='rgb(16,30,58)' stroke='rgb(58,114,196)' stroke-width='1'/>
<rect x='16.0' y='13.5' width='52' height='3' fill='rgb(16,30,58)' stroke='rgb(58,114,196)' stroke-width='1'/>
<rect x='8.0' y='16.5' width='68' height='3' fill='rgb(16,30,58)' stroke='rgb(58,114,196)' stroke-width='1'/>
<path d='M0 19.5 H10 M74 19.5 H84' stroke='rgb(58,114,196)' stroke-width='1'/>
</svg>
```

**`sky`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<path d='M0.0 34.0 L0.0 21.0 L3.0 21.0 L3.0 17.0 L7.0 17.0 L7.0 21.0 L10.0 21.0 L10.0 34.0 Z' fill='rgb(31,54,96)'/>
<path d='M11.0 34.0 L11.0 14.0 L13.0 14.0 L13.0 9.0 L15.0 9.0 L15.0 5.0 L19.0 5.0 L19.0 9.0 L21.0 9.0 L21.0 14.0 L23.0 14.0 L23.0 34.0 Z' fill='rgb(31,54,96)'/>
<path d='M17.0 5.0 V0.5' stroke='rgb(31,54,96)' stroke-width='0.9'/>
<circle cx='17.0' cy='0.7' r='0.7' fill='rgb(141,184,240)'/>
<path d='M24.0 34.0 L24.0 19.0 L27.0 19.0 L27.0 13.0 L31.0 13.0 L31.0 19.0 L34.0 19.0 L34.0 34.0 Z' fill='rgb(31,54,96)'/>
<path d='M35.0 34.0 L35.0 16.0 L37.0 16.0 L37.0 11.0 L39.5 11.0 L39.5 7.0 L41.5 7.0 L41.5 3.5 L44.5 3.5 L44.5 7.0 L46.5 7.0 L46.5 11.0 L49.0 11.0 L49.0 16.0 L51.0 16.0 L51.0 34.0 Z' fill='rgb(31,54,96)'/>
<path d='M43.0 3.5 V0.0' stroke='rgb(31,54,96)' stroke-width='0.9'/>
<circle cx='43.0' cy='0.7' r='0.7' fill='rgb(141,184,240)'/>
<path d='M52.0 34.0 L52.0 20.0 L55.0 20.0 L55.0 15.0 L59.0 15.0 L59.0 20.0 L62.0 20.0 L62.0 34.0 Z' fill='rgb(31,54,96)'/>
<path d='M63.0 34.0 L63.0 13.0 L65.5 13.0 L65.5 9.0 L69.5 9.0 L69.5 13.0 L72.0 13.0 L72.0 34.0 Z' fill='rgb(31,54,96)'/>
<path d='M67.5 9.0 V5.5' stroke='rgb(31,54,96)' stroke-width='0.9'/>
<circle cx='67.5' cy='5.5' r='0.7' fill='rgb(141,184,240)'/>
<path d='M73.0 34.0 L73.0 22.0 L76.0 22.0 L76.0 17.0 L81.0 17.0 L81.0 22.0 L84.0 22.0 L84.0 34.0 Z' fill='rgb(31,54,96)'/>
<rect x='3' y='24' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='6' y='28' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='15' y='17' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='18' y='22' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='14' y='27' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='27' y='22' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='30' y='27' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='38' y='20' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='43' y='15' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='46' y='24' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='40' y='28' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='55' y='24' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='59' y='29' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='66' y='17' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='69' y='24' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='76' y='26' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
<rect x='80' y='30' width='1.4' height='1.8' fill='rgb(58,114,196)'/>
</svg>
```

**`eye`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M11 1.8 L21 19.4 H1 Z' fill='rgb(16,30,58)' stroke='rgb(141,184,240)' stroke-width='1.3' stroke-linejoin='round'/>
<path d='M5.2 13.6 Q11 8.2 16.8 13.6 Q11 18.6 5.2 13.6 Z' fill='none' stroke='rgb(141,184,240)' stroke-width='1'/>
<circle cx='11' cy='13.6' r='2.3' fill='rgb(58,114,196)'/>
<circle cx='11' cy='13.6' r='0.9' fill='rgb(7,10,18)'/>
</svg>
```


### 5.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `illum-title 8s steps(1)` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-throb 3s ease-in-out` | `#theme-banner::before` transform, opacity (tier 1) | removed |
| 3 | `illum-eye 8s ease-in-out` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `illum-readout 8s ease-in-out` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `illum-border 8s steps(1)` | `#app` box-shadow (tier 5) | removed |
| 6 | `illum-data 8s linear` | `#particles` background-position (tier 4) | removed |
| hover | `tile-flicker .4s steps(1) infinite` | `.app-tile:hover::before` opacity (tier 1) | removed (`::before` is `display:none`) |

**Before 6 (+1 hover-only), after 0.** `grep -c infinite swl-illuminati.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance (`entrance-flash` is retired).

### 5.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#0F1522`, border `#1A2438` (1 px), radius 6 px, `::before` off; layout unchanged. Icons: `saturate(0.85) contrast(1.05)` through the dossier-corner plate.
- **Hover:** fill `#10203A`, border steel (3.40:1 on the hover fill), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px steel ring at offset 2 (4.13:1 on the ground, 3.81:1 on the tile). **Pressed:** base scale 0.96 on `#10203A`.
- **Label:** silver `#D4DCE8`, Segoe UI Semibold, uppercase, no halo.
- **Filter chip:** base rule (fill `#10203A`, steel border, light-steel text). The ziggurat hides while it shows.
- **Edit bar:** `#1E0F14` fill, muted-red rule (`#C4505E`), label `#F08A94`; `+ FILE` and `+ INSTALLED` silver with a blue-grey border, `DONE` red-tinted. The tile ✕ is `#A8283A` with a light-red ring; on hover it stays deep red (`.btn-remove:hover { background:#A8283A; }`).
- **Settings overlay:** opaque `#070A12`, panel `#0F1522`, light-steel values and version (`#app-version`), steel sliders and checkboxes, light-steel CLOSE.
- **Update banner:** silver text on `#0E1A2E` with a steel rule.

### 5.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite swl-illuminati.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`.
2. Header: a 1 px steel line at y 39 to 40 with nothing below it; the ziggurat at x 168 to 252, y 10 to 30 with a lit apex; `#title` right edge at most 156 (mock 139.5); typing a letter hides the ziggurat and shows the chip.
3. Banner: flat `#0A0F1A` with a 1 px steel top border, an eye in a triangle at x 14 to 36, the skyline at x 328 to 412 flush with the bottom, silver text on one line (`scrollWidth <= clientWidth` for all three strings).
4. Hover shot (CALCULATOR): steel border, dark-blue fill, dossier-corner plate with no cropped glyph.
5. **No gold, amber or yellow pixel in the chrome** of the grid or settings shot (tile icons excluded); red appears only in edit mode, the hotkey error and recording text and the tile ✕.
6. Hidden-tiles sigma 0.00.
7. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after`, `#header::before` and `#theme-banner::before`, and set `#theme-banner { background:#0A0F1A !important; }` (my run: clearance 10.7 px at every size in the grid shot, 9.3 px in the states shot).
8. `fontsRendered` lists `Segoe UI` and `Segoe UI Semibold`.

**Expected squint score: 4** (title and banner text covered). What survives: a navy-black ground with thin steel-blue rules, a stepped ziggurat, an eye in a triangle, a setback skyline, folded-corner plates. What is missing for a 5: the faction's real logo and type (a Funcom mark and unverified), and any sense of the Labyrinth's blue light, which would need a glow or a gradient the batch leaves out.

---

## 6. doom-classic (DOOM, 1993): DONE

**Audit:** score 3, redraw. Brown-orange and Courier New were right, and the painted status bar was the right idea in the wrong place: its "100 / 200" digits sat behind the bottom tile row, half hidden by the TERMINAL, BROWSER and FILES icons. No pixel type, automap or pentagram; the header text was cut ("E1M1 // HANG..."). The audit's red `#B02A1A` computes to 2.86:1 on the ground. Five infinite animations.
**Direction:** DOOM as the 1993 HUD. A brown-black ground, tan type, brick red for lines and focus, ammo yellow for everything the app says. The **banner is the status bar**: a bevelled brown-grey strip with a red pixel "100%" window on the left (the icon slot), a dark text window in the middle and a red pixel "200%" window on the right. Three keycards (blue, yellow, red) sit in the header; riveted metal strips run down both sides; tiles get the 1993 bevel. No face panel, no pentagram, no logo. No glow, no texture, no animation.

### 6.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #1A0F0A;
  --panel-bg: #221510;
  --overlay-bg: #1A0F0A;
  --header-bg: #2A1C14;
  --font: 'Courier New', Consolas, monospace;
  --text: #E6D2AA;
  --text-dim: #B39870;
  --accent-c: #CC3A24;
  --accent-m: #E8C030;
  --accent-y: #E6D2AA;
  --accent-text: #E8C030;
  --border: #4A3A2C;
  --border-h: #CC3A24;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #CC3A24;
  --title-anim: none;
  --tile-hover-bg: #30130E;
  --tile-hover-border: #CC3A24;
  --tile-hover-shadow: none;
  --tile-active-bg: #30130E;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: contrast(1.05) saturate(0.95);
  --tile-icon-shape: none;
  --tile-label-spacing: 0.5px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 700;
  --tile-label-style: normal;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s steps(4) forwards;
  --btn-hover-bg: #3A1D14;
  --btn-active-bg: #4A2418;
  --drop-hint-border: #5A4A3A;
  --drop-icon-color: #8A7458;
  --hint-sub-color: #B39870;
  --rename-dashed: #CC3A24;
  --rename-input-bg: #30130E;
  --edit-bar-bg: #2A2208;
  --edit-bar-border: #E8C030;
  --edit-label-color: #E8C030;
  --edit-label-glow: none;
  --btn-done-color: #E8C030;
  --btn-done-border: #E8C030;
  --btn-done-hover-bg: #4A3A0A;
  --btn-done-hover-glow: none;
  --btn-add-border: #8A7458;
  --update-bg: #2A1C14;
  --update-border: #E6D2AA;
  --update-color: #E6D2AA;
  --update-btn-border: #E6D2AA;
  --update-btn-hover-bg: #3E281C;
  --update-btn-hover-glow: none;
  --btn-close-color: #E8C030;
  --btn-close-border: #E8C030;
  --btn-close-hover-bg: #4A3A0A;
  --btn-close-hover-glow: none;
  --picker-search-bg: #30130E;
  --picker-item-hover-bg: #30130E;
  --picker-item-active-bg: #42190F;
  --picker-placeholder-bg: #30130E;
  --skin-btn-active-bg: #42190F;
  --remove-btn-bg: #A82818;
  --remove-btn-border: #E8C030;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#E6D2AA` on `#1A0F0A` | 4.5:1 | **12.68:1** |
| --text-dim on --bg | `#B39870` on `#1A0F0A` | 4.5:1 | **6.84:1** |
| --accent-c on --bg | `#CC3A24` on `#1A0F0A` | 3:1 | **3.76:1** |
| --accent-text on --bg | `#E8C030` on `#1A0F0A` | 3:1 | **10.76:1** |
| --hint-sub-color on --bg | `#B39870` on `#1A0F0A` | 4.5:1 | **6.84:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#E6D2AA` on `#221510` | 4.5:1 | **11.98:1** |
| Tile label on hover pill | `#E8C030` on `#30130E` | 4.5:1 | **9.81:1** |
| Tile label on hover pill (pressed state) | `#E8C030` on `#30130E` | 4.5:1 | **9.81:1** |
| Title on header | `#E8C030` on `#2A1C14` | 4.5:1 | **9.43:1** |
| Title dot (`.accent`) on header | `#F25A42` on `#2A1C14` | 4.5:1 | **4.96:1** |
| Header version on header | `#B39870` on `#2A1C14` | 4.5:1 | **6.00:1** |
| Header button glyph on header | `#E6D2AA` on `#2A1C14` | 4.5:1 | **11.11:1** |
| Header button glyph on button hover | `#FFFFFF` on `#3A1D14` | 4.5:1 | **15.38:1** |
| Filter chip text on chip | `#E8C030` on `#30130E` | 4.5:1 | **9.81:1** |
| Banner text on banner | `#E6D2AA` on `#140A06` | 4.5:1 | **13.17:1** |
| Status-bar digits (red) on inset window (non-text) | `#DC3420` on `#140A06` | 3.0:1 | **4.23:1** |
| Edit label on edit bar | `#E8C030` on `#2A2208` | 4.5:1 | **9.03:1** |
| Done / close button text on edit bar | `#E8C030` on `#2A2208` | 4.5:1 | **9.03:1** |
| + FILE / + INSTALLED text on edit bar | `#E6D2AA` on `#2A2208` | 4.5:1 | **10.64:1** |
| Done button text on its hover fill | `#FFFFFF` on `#4A3A0A` | 4.5:1 | **11.05:1** |
| Settings text on overlay | `#E6D2AA` on `#1A0F0A` | 4.5:1 | **12.68:1** |
| Settings text on panel | `#E6D2AA` on `#221510` | 4.5:1 | **11.98:1** |
| Settings label (text-dim) on panel | `#B39870` on `#221510` | 4.5:1 | **6.46:1** |
| Settings value / cheat key (accent-text) on panel | `#E8C030` on `#221510` | 4.5:1 | **10.16:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#E8C030` on `#1A0F0A` | 4.5:1 | **10.76:1** |
| Settings CLOSE text on panel | `#E8C030` on `#221510` | 4.5:1 | **10.16:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#4A3A0A` | 4.5:1 | **11.05:1** |
| Hotkey error text (accent-m) on panel | `#E8C030` on `#221510` | 4.5:1 | **10.16:1** |
| Hotkey input text on input fill | `#E8C030` on `#30130E` | 4.5:1 | **9.81:1** |
| Picker row text on hover fill | `#E6D2AA` on `#30130E` | 4.5:1 | **11.56:1** |
| Update banner text on update bar | `#E6D2AA` on `#2A1C14` | 4.5:1 | **11.11:1** |
| Update button text on hover fill | `#FFFFFF` on `#3E281C` | 4.5:1 | **13.77:1** |
| Drop-hint text (text-dim) on grid ground | `#B39870` on `#1A0F0A` | 4.5:1 | **6.84:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#A82818` | 3.0:1 | **7.04:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#A82818` | 3.0:1 | **7.04:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#CC3A24` on `#221510` | 3.0:1 | **3.55:1** |
| Focus ring on grid ground (non-text) | `#CC3A24` on `#1A0F0A` | 3.0:1 | **3.76:1** |
| Hover border on grid ground (non-text) | `#CC3A24` on `#1A0F0A` | 3.0:1 | **3.76:1** |
| Hover border on hover fill (non-text) | `#CC3A24` on `#30130E` | 3.0:1 | **3.43:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#E8C030` on `#30130E` | 4.5:1 | **9.81:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#E8C030` on `#42190F` | 4.5:1 | **8.72:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#E8C030` on `#30130E` | 4.5:1 | **9.81:1** |
| Picker / skin search input text (accent-text) on search fill | `#E8C030` on `#30130E` | 4.5:1 | **9.81:1** |
| Rename / hotkey input text (accent-text) on input fill | `#E8C030` on `#30130E` | 4.5:1 | **9.81:1** |
| Search placeholder (text-dim) on search fill | `#B39870` on `#30130E` | 4.5:1 | **6.24:1** |
| Hotkey recording text (accent-m) on input fill | `#E8C030` on `#30130E` | 4.5:1 | **9.81:1** |
| Update dismiss glyph (text-dim) on update bar | `#B39870` on `#2A1C14` | 4.5:1 | **6.00:1** |

**Lowest ratio in this theme: 3.43:1 (Hover border on hover fill (non-text)).** Lowest text ratio: 4.96:1 (Title dot (`.accent`) on header). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#221510`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#5B7FA6` | `#221510` | 4.25:1 | pass |
| Calculator `#6b6f76` | `#6A6E76` | `#221510` | 3.47:1 | pass |
| Paint `#b07a4f` | `#B07A50` | `#221510` | 4.86:1 | pass |
| Terminal `#3d4450` | `#3A414D` | `#221510` | 1.73:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#4F8A8B` | `#221510` | 4.52:1 | pass |
| Files `#c09a3e` | `#C19B40` | `#221510` | 6.79:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.47:1** (pass). Terminal (the mock plate is dark art) is 1.73:1 at rest and is excluded, as in every earlier batch. On the hover fill `#30130E`: **3.35:1**; on the pressed fill `#30130E`: **3.35:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is brick red `#CC3A24` (3.76:1 on the ground; the audit's `#B02A1A` failed at 2.86) for the header line, focus ring, hover border, slider and the bar's digits; `--accent-text` and `--accent-m` are ammo yellow `#E8C030` (values, chip, hotkey field, picker rows, edit mode, the title and the hover label). The title dot is a light red (`#F25A42`, 4.96:1 on the header, the lowest text pair of this theme). The hover and pressed fill `#30130E` is a dark red-brown (L 0.012) that keeps the Calculator plate above 3:1. The status-bar colours (`#4A3C30` strip, `#140A06` windows, `#7A6856` and `#241810` bevel edges, `rgb(220,52,32)` digits) are decoration; the only text on the bar is the banner string, tan `#E6D2AA` on the window.

### 6.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `'Courier New', Consolas, monospace` | 400 (base) | base | base | base |
| `#title` | `'Courier New', Consolas, monospace` (`courbd.ttf`) | 700 | 11 px (base) | 3px | uppercase (markup) |
| `.tile-label` | `'Courier New', Consolas, monospace` (`courbd.ttf`) | 700 (`--tile-label-weight`) | 12 px (base) | 0.5px | uppercase (`--tile-label-transform`) |
| `#theme-banner-text` | `'Courier New', Consolas, monospace` (`courbd.ttf`) | 700 | 11 px (base) | 0.5px | uppercase strings, as written in 0.8 |

Pixel type (Press Start 2P) is on the wish list (F B7); Courier New Bold is the stock stand-in. Measured: the title text is 115.2 px wide and its box ends at x 127.2 (28.8 px under the gate, 40.8 px clear of the art at 168). Labels in Courier New Bold 12 px with 0.5 px tracking: NOTEPAD 53.9, CALCULATOR 77.0, TERMINAL 61.6, BROWSER 53.9, PAINT 38.5, FILES 38.5 px, all inside the 100 px box. The banner text box here is x 84 to 340 (256 px, see C) and the widest string is 198.8 px. Expected `fontsRendered`: `Courier New`. **Cyrillic:** Courier New and its Bold cover U+0416, U+042F and U+0431 (checked), so Cyrillic tile names render in Courier New Bold.

### 6.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the brown-wall grain, vignette and hell-red glow in `#app::after`, the painted status-bar panno with its digits (`#grid-container::before`), the ghost readout (`#grid-container::after`), header text, edit-bar text, the `#particles` stub and the `#app` animation, the tile scan bar (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header, brown metal, a red line and three keycards (HZ).**
- `#header { border-bottom-color:#CC3A24; box-shadow: inset 0 -2px 0 #CC3A24, inset 0 2px 0 #4A3A2C; }`: a 3 px red line inside the header (y 37 to 40; nothing below) and a 2 px dark-tan edge along the top; `#header::before { background:#CC3A24; box-shadow:none; }` (the 2 px bar at the left edge).
- **Keycards, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `keys` (84 x 20): a blue, a yellow and a red card (22 x 14 each: body, light top edge, dark bottom edge, ink stripe, a white tab, a dark chip) at window x 170 to 192, 199 to 221 and 228 to 250, y 13 to 27. Hidden while the chip shows.
- `#title`: ammo-yellow Courier New Bold with a light-red dot.

**B. Frame, riveted strips.** `#grid-container` background, two layers: SVG `strip` (10 x 24, brown metal with a light top-left edge, a dark bottom-right edge and a rivet) `repeat-y` at `left 1px top 0` (x 1 to 11) and at `right 5px top 0` (x 409 to 419), the full container height. Nothing in the top band. The tile field and its keep-out are untouched.

**C. Banner, the status bar.** `#theme-banner { background: url(ar) right 14px center / 60px 30px no-repeat, linear-gradient(#140A06, #140A06) left 78px center / calc(100% - 156px) 32px no-repeat, #4A3C30; border-top-color:#241810; box-shadow: inset 0 2px 0 #7A6856, inset 0 -2px 0 #241810; }`. Three windows on a brown-grey strip with a 2 px bevel top and bottom:
- **Left window, SVG `hp`, 60 x 30** in `#theme-banner::before` (content '', **60 x 30**, `font-size:0`, `opacity:1`): dark inset with a bevel and **"100%" in red pixel digits** (5 x 7 glyphs at 2 px per pixel, drawn as `<rect>`s, 46 x 14 px); window x 14 to 74, y 263.5 to 293.5 at 424 x 300.
- **Text window:** the gradient rectangle, x 78 to W-78 (346 at 424), y 262.5 to 294.5. `#theme-banner-text` gets `margin-right: 70px`, so its box is x 84 to W-84 (340 at 424; 256 px wide) and starts 6 px inside the window.
- **Right window, SVG `ar`, 60 x 30** at `right 14px center`: the same window with **"200%"**; x 350 to 410 at 424.
- The text starts at x 84 instead of 46 (the widened icon slot: `gap` stays 10 px). The longest string ends at x 282.8; the text window ends at x 346.
- Decoration only; no `<text>` in any SVG (the digits are rectangles).

**D. Tiles.** Square (`--radius: 0px`), fill `#221510`, a **1993 bevel**: `border-color: #6A5A48 #2A2016 #2A2016 #6A5A48` (light top and left, dark bottom and right). Plates keep the app's own rounded icons: `--tile-icon-shape: none` (the old notched plate was a speech-bubble cut; nothing is cropped). Hover and focus: fill `#30130E`, one red border colour (`#CC3A24`) on all four sides, the label turns yellow.

**Trademark note.** The DOOM logo, the pentagram, Doomguy's face panel, skull keys and every sprite or texture are not drawn. The status bar is a generic bevelled HUD strip with two digit windows; the keycards are plain rectangles with a stripe.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #A82818; }

/* window: no texture layer */
#app::after { background: none; }

/* header: brown metal, a 3 px red line inside it, three keycards in the art zone */
#header { border-bottom-color: #CC3A24; box-shadow: inset 0 -2px 0 #CC3A24, inset 0 2px 0 #4A3A2C; }
#header::before { background: #CC3A24; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @KEYS@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: 'Courier New', Consolas, monospace; font-weight: 700; letter-spacing: 3px; color: #E8C030; text-shadow: none; }
#title .accent { color: #DC3420; }

/* frame: riveted metal strips down both sides */
#grid-container {
  background:
    @STRIP@ left 1px top 0 / 10px 24px repeat-y,
    @STRIP@ right 5px top 0 / 10px 24px repeat-y;
}

/* tiles: 1993 bevel (light top-left, dark bottom-right); red edge and yellow label on hover */
.app-tile { background: #221510; border-color: #6A5A48 #2A2016 #2A2016 #6A5A48; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: var(--tile-hover-shadow); }
.tile-label { font-family: 'Courier New', Consolas, monospace; }
.app-tile:hover .tile-label, .app-tile:focus-visible .tile-label { color: #E8C030; }

/* banner: the status bar. Health window (icon slot), text window, armour window (background) */
#theme-banner {
  background:
    @AR@ right 14px center / 60px 30px no-repeat,
    linear-gradient(#140A06, #140A06) left 78px center / calc(100% - 156px) 32px no-repeat,
    #4A3C30;
  border-top-color: #241810; box-shadow: inset 0 2px 0 #7A6856, inset 0 -2px 0 #241810;
}
#theme-banner::before { content: ''; width: 60px; height: 30px; font-size: 0; opacity: 1; background: @HP@ center / 60px 30px no-repeat; }
#theme-banner-text { font-family: 'Courier New', Consolas, monospace; font-weight: 700; letter-spacing: 0.5px; color: #E6D2AA; margin-right: 70px; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@KEYS@` | `keys` |
| `@STRIP@` | `strip` |
| `@AR@` | `ar` |
| `@HP@` | `hp` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`; encode `<`, `>`, `#` as B1 0.2 says):

**`keys`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<rect x='2' y='3' width='22' height='14' fill='rgb(42,80,208)'/><rect x='2' y='3' width='22' height='2' fill='rgb(110,140,240)'/><rect x='2' y='15' width='22' height='2' fill='rgb(20,40,120)'/><rect x='2' y='8' width='22' height='2' fill='rgb(14,8,4)'/><rect x='5' y='6' width='4' height='2' fill='rgb(245,240,225)'/><rect x='5' y='11' width='6' height='2' fill='rgb(20,40,120)'/>
<rect x='31' y='3' width='22' height='14' fill='rgb(232,192,48)'/><rect x='31' y='3' width='22' height='2' fill='rgb(250,230,130)'/><rect x='31' y='15' width='22' height='2' fill='rgb(140,110,20)'/><rect x='31' y='8' width='22' height='2' fill='rgb(14,8,4)'/><rect x='34' y='6' width='4' height='2' fill='rgb(245,240,225)'/><rect x='34' y='11' width='6' height='2' fill='rgb(140,110,20)'/>
<rect x='60' y='3' width='22' height='14' fill='rgb(204,52,36)'/><rect x='60' y='3' width='22' height='2' fill='rgb(240,120,100)'/><rect x='60' y='15' width='22' height='2' fill='rgb(110,20,12)'/><rect x='60' y='8' width='22' height='2' fill='rgb(14,8,4)'/><rect x='63' y='6' width='4' height='2' fill='rgb(245,240,225)'/><rect x='63' y='11' width='6' height='2' fill='rgb(110,20,12)'/>
</svg>
```

**`strip`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 24'>
<rect width='10' height='24' fill='rgb(58,44,34)'/>
<rect width='10' height='2' fill='rgb(106,90,72)'/><rect y='22' width='10' height='2' fill='rgb(30,22,16)'/>
<rect width='2' height='24' fill='rgb(90,74,58)'/><rect x='8' width='2' height='24' fill='rgb(30,22,16)'/>
<rect x='4' y='10' width='2' height='2' fill='rgb(150,128,100)'/>
</svg>
```

**`ar`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'>
<rect width='60' height='30' fill='rgb(20,10,6)'/>
<path d='M0 0 H60 M0 0 V30' stroke='rgb(10,4,2)' stroke-width='2'/>
<path d='M0 29 H60 M59 0 V30' stroke='rgb(122,104,86)' stroke-width='2'/>
<g fill='rgb(220,52,32)'><rect x='9' y='8' width='6' height='2'/><rect x='7' y='10' width='2' height='2'/><rect x='15' y='10' width='2' height='2'/><rect x='15' y='12' width='2' height='2'/><rect x='13' y='14' width='2' height='2'/><rect x='11' y='16' width='2' height='2'/><rect x='9' y='18' width='2' height='2'/><rect x='7' y='20' width='10' height='2'/><rect x='21' y='8' width='6' height='2'/><rect x='19' y='10' width='2' height='2'/><rect x='27' y='10' width='2' height='2'/><rect x='19' y='12' width='2' height='2'/><rect x='25' y='12' width='4' height='2'/><rect x='19' y='14' width='2' height='2'/><rect x='23' y='14' width='2' height='2'/><rect x='27' y='14' width='2' height='2'/><rect x='19' y='16' width='4' height='2'/><rect x='27' y='16' width='2' height='2'/><rect x='19' y='18' width='2' height='2'/><rect x='27' y='18' width='2' height='2'/><rect x='21' y='20' width='6' height='2'/><rect x='33' y='8' width='6' height='2'/><rect x='31' y='10' width='2' height='2'/><rect x='39' y='10' width='2' height='2'/><rect x='31' y='12' width='2' height='2'/><rect x='37' y='12' width='4' height='2'/><rect x='31' y='14' width='2' height='2'/><rect x='35' y='14' width='2' height='2'/><rect x='39' y='14' width='2' height='2'/><rect x='31' y='16' width='4' height='2'/><rect x='39' y='16' width='2' height='2'/><rect x='31' y='18' width='2' height='2'/><rect x='39' y='18' width='2' height='2'/><rect x='33' y='20' width='6' height='2'/><rect x='43' y='8' width='4' height='2'/><rect x='51' y='8' width='2' height='2'/><rect x='43' y='10' width='4' height='2'/><rect x='49' y='10' width='2' height='2'/><rect x='49' y='12' width='2' height='2'/><rect x='47' y='14' width='2' height='2'/><rect x='45' y='16' width='2' height='2'/><rect x='45' y='18' width='2' height='2'/><rect x='49' y='18' width='4' height='2'/><rect x='43' y='20' width='2' height='2'/><rect x='49' y='20' width='4' height='2'/></g>
</svg>
```

**`hp`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'>
<rect width='60' height='30' fill='rgb(20,10,6)'/>
<path d='M0 0 H60 M0 0 V30' stroke='rgb(10,4,2)' stroke-width='2'/>
<path d='M0 29 H60 M59 0 V30' stroke='rgb(122,104,86)' stroke-width='2'/>
<g fill='rgb(220,52,32)'><rect x='11' y='8' width='2' height='2'/><rect x='9' y='10' width='4' height='2'/><rect x='11' y='12' width='2' height='2'/><rect x='11' y='14' width='2' height='2'/><rect x='11' y='16' width='2' height='2'/><rect x='11' y='18' width='2' height='2'/><rect x='9' y='20' width='6' height='2'/><rect x='21' y='8' width='6' height='2'/><rect x='19' y='10' width='2' height='2'/><rect x='27' y='10' width='2' height='2'/><rect x='19' y='12' width='2' height='2'/><rect x='25' y='12' width='4' height='2'/><rect x='19' y='14' width='2' height='2'/><rect x='23' y='14' width='2' height='2'/><rect x='27' y='14' width='2' height='2'/><rect x='19' y='16' width='4' height='2'/><rect x='27' y='16' width='2' height='2'/><rect x='19' y='18' width='2' height='2'/><rect x='27' y='18' width='2' height='2'/><rect x='21' y='20' width='6' height='2'/><rect x='33' y='8' width='6' height='2'/><rect x='31' y='10' width='2' height='2'/><rect x='39' y='10' width='2' height='2'/><rect x='31' y='12' width='2' height='2'/><rect x='37' y='12' width='4' height='2'/><rect x='31' y='14' width='2' height='2'/><rect x='35' y='14' width='2' height='2'/><rect x='39' y='14' width='2' height='2'/><rect x='31' y='16' width='4' height='2'/><rect x='39' y='16' width='2' height='2'/><rect x='31' y='18' width='2' height='2'/><rect x='39' y='18' width='2' height='2'/><rect x='33' y='20' width='6' height='2'/><rect x='43' y='8' width='4' height='2'/><rect x='51' y='8' width='2' height='2'/><rect x='43' y='10' width='4' height='2'/><rect x='49' y='10' width='2' height='2'/><rect x='49' y='12' width='2' height='2'/><rect x='47' y='14' width='2' height='2'/><rect x='45' y='16' width='2' height='2'/><rect x='45' y='18' width='2' height='2'/><rect x='49' y='18' width='4' height='2'/><rect x='43' y='20' width='2' height='2'/><rect x='49' y='20' width='4' height='2'/></g>
</svg>
```


### 6.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `doom-title 8s steps(1)` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-pulse 4s steps(1)` | `#theme-banner::before` opacity (tier 1) | removed |
| 3 | `doom-hud 8s steps(1)` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `doom-readout 8s steps(1)` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `doom-border 8s steps(1)` | `#app` box-shadow (tier 5) | removed |
| hover | `tile-scan-v .5s forwards` (one-shot) | `.app-tile:hover::before` | removed (`::before` is `display:none`) |

**Before 5, after 0.** `grep -c infinite doom-classic.css` is 0. The one-shot `entrance-fade 0.8s steps(4)` is the entrance (was 1 s, kept stepped).

### 6.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#221510`, bevel border (light `#6A5A48` top and left, dark `#2A2016` bottom and right, 1 px), radius 0, `::before` off; layout unchanged. Icons: `contrast(1.05) saturate(0.95)`, no plate cut.
- **Hover:** fill `#30130E`, border brick red (3.43:1 on the hover fill), the label turns ammo yellow (`#E8C030`, 9.81:1 on the hover fill), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px red ring at offset 2 (3.76:1 on the ground, 3.55:1 on the tile). **Pressed:** base scale 0.96 on `#30130E`.
- **Label:** tan `#E6D2AA`, Courier New Bold, uppercase, no halo.
- **Filter chip:** base rule (fill `#30130E`, red border, yellow text). The keycards hide while it shows.
- **Edit bar:** `#2A2208` fill, yellow rule (`#E8C030`), yellow label; `+ FILE` and `+ INSTALLED` tan with a brown border, `DONE` yellow. The tile ✕ is `#A82818` with a yellow ring; on hover it stays deep red (`.btn-remove:hover { background:#A82818; }`).
- **Settings overlay:** opaque `#1A0F0A`, panel `#221510`, yellow values and version (`#app-version`), red sliders and checkboxes, yellow CLOSE.
- **Update banner:** tan text on `#2A1C14` with a tan rule.

### 6.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite doom-classic.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 5); no `\A`.
2. Header: a 3 px red line at y 37 to 40 with nothing below it; three keycards (blue, yellow, red) at x 170 to 250, y 13 to 27; `#title` right edge at most 156 (mock 127.2); typing a letter hides the cards and shows the chip.
3. Frame: a riveted strip on each side (x 1 to 11 and x 409 to 419), full container height; nothing in the tile field; the last-column focus ring at 640 x 420 and 1024 x 700 is 1 px clear of the right strip (Foundation acceptance check).
4. Banner: a `#4A3C30` strip with a 2 px light top bevel and a 2 px dark bottom bevel; a red "100%" window at x 14 to 74, a dark text window from x 78 to W-78, a red "200%" window at x 350 to 410; tan text on one line inside the text window (`scrollWidth <= clientWidth` for all six strings; the box is 256 px wide at 424).
5. Hover shot (CALCULATOR): red border, dark red-brown fill, yellow label; the tile borders at rest show the bevel (light top-left, dark bottom-right) at 3x.
6. No blue pixel in the chrome outside the header's blue keycard; no green or purple in the chrome (tile icons excluded).
7. Hidden-tiles sigma 0.00.
8. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after`, `#header::before` and `#theme-banner::before`, set `#grid-container { background:none !important; }` and `#theme-banner { background: linear-gradient(#140A06, #140A06) left 78px center / calc(100% - 156px) 32px no-repeat, #4A3C30 !important; }` (the text window is the text's surface, not art; my run: clearance 5.3 px at every size in the grid shot, 1.3 px in the states shot).
9. `fontsRendered` lists `Courier New`.

**Expected squint score: 5** (title and banner text covered). What survives: the brown-black ground, a bevelled brown-grey status bar with two red pixel-digit windows, three keycards, riveted metal strips, bevelled tiles. The status bar is the most recognisable HUD in games. What keeps it from a cleaner 5: no DOOM lettering (covered by the test anyway) and no face in the bar's centre (not drawn on purpose).

---

## 7. doom-eternal (DOOM ETERNAL): DONE

**Audit:** score 2, redraw. A dull pink-red wash (text `#D07878`) where Eternal is saturated hellfire orange and yellow with hard angles (Makoto's "dull wash" pitfall). A kill-count and demon-log schematic (bars beside NOTEPAD, a red sigil behind CALCULATOR, "KILL COUNT 66,610") was painted through the tiles. Six infinite animations, one of them a full-window slash scroll.
**Direction:** black and hellfire, all hard angles. A near-black ground with light warm type; hellfire orange `#E8481A` for the header slab, rules, focus and hover; ammo yellow for everything the app says; **cyan only for edit mode** (the Slayer's highlight colour). An orange slab with black type sits behind the title, five chevrons run in the header, a hazard-slash band crosses the top of the banner, three claw slashes are the icon and left-pointing chevrons close the right end. Hard-cut corners in the frame bands, a bottom-right cut on every plate. No rings, no gauges, no glow, no texture, no animation.

### 7.1 Palette

`:root` block (final values; paste as is):

```css
:root {
  --radius: 0px;
  --app-clip: none;
  --overlay-clip: none;
  --bg: #0A0708;
  --panel-bg: #140C0E;
  --overlay-bg: #0A0708;
  --header-bg: #120A0C;
  --font: Bahnschrift, 'Segoe UI', sans-serif;
  --text: #F0E8E0;
  --text-dim: #B8A29A;
  --accent-c: #E8481A;
  --accent-m: #50F0FF;
  --accent-y: #F0E8E0;
  --accent-text: #F0C020;
  --border: #3A2226;
  --border-h: #E8481A;
  --glow-c: none;
  --glow-m: none;
  --glow-y: none;
  --pulse-glow: none;
  --scanlines: none;
  --drag-over-glow: inset 0 0 0 3px #E8481A;
  --title-anim: none;
  --tile-hover-bg: #2A0F0C;
  --tile-hover-border: #E8481A;
  --tile-hover-shadow: none;
  --tile-active-bg: #2A0F0C;
  --tile-icon-glow: drop-shadow(0 0 0 rgba(0,0,0,0));
  --tile-icon-fx: contrast(1.1) saturate(1.05);
  --tile-icon-shape: polygon(0 0, 100% 0, 100% 78%, 78% 100%, 0 100%);
  --tile-label-spacing: 0.8px;
  --tile-label-transform: uppercase;
  --tile-label-weight: 600;
  --tile-label-style: italic;
  --tile-label-shadow: none;
  --banner-icon-anim: none;
  --app-entrance-anim: entrance-fade 0.8s ease-out forwards;
  --btn-hover-bg: #3A140E;
  --btn-active-bg: #4C1A10;
  --drop-hint-border: #4A2C30;
  --drop-icon-color: #7A5A5E;
  --hint-sub-color: #B8A29A;
  --rename-dashed: #E8481A;
  --rename-input-bg: #2A0F0C;
  --edit-bar-bg: #061A1D;
  --edit-bar-border: #50F0FF;
  --edit-label-color: #50F0FF;
  --edit-label-glow: none;
  --btn-done-color: #50F0FF;
  --btn-done-border: #50F0FF;
  --btn-done-hover-bg: #0C3A40;
  --btn-done-hover-glow: none;
  --btn-add-border: #7A5A5E;
  --update-bg: #1A0E10;
  --update-border: #F0C020;
  --update-color: #F0E8E0;
  --update-btn-border: #F0C020;
  --update-btn-hover-bg: #3A2A0A;
  --update-btn-hover-glow: none;
  --btn-close-color: #F0C020;
  --btn-close-border: #F0C020;
  --btn-close-hover-bg: #3A2A0A;
  --btn-close-hover-glow: none;
  --picker-search-bg: #2A0F0C;
  --picker-item-hover-bg: #2A0F0C;
  --picker-item-active-bg: #3C150F;
  --picker-placeholder-bg: #2A0F0C;
  --skin-btn-active-bg: #3C150F;
  --remove-btn-bg: #B02810;
  --remove-btn-border: #F0C020;
}
```

**Gate pairs** (what `npm run check:contrast` checks; every value is opaque hex, so the gate's flattening on black changes nothing; I also ran the real script on the prototype file: 0 errors):

| Gate pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| --text on --bg | `#F0E8E0` on `#0A0708` | 4.5:1 | **16.55:1** |
| --text-dim on --bg | `#B8A29A` on `#0A0708` | 4.5:1 | **8.29:1** |
| --accent-c on --bg | `#E8481A` on `#0A0708` | 3:1 | **5.13:1** |
| --accent-text on --bg | `#F0C020` on `#0A0708` | 3:1 | **11.72:1** |
| --hint-sub-color on --bg | `#B8A29A` on `#0A0708` | 4.5:1 | **8.29:1** |

**Add-on pairs** (each text or control colour on its real surface; 4.5:1 for text, 3:1 for non-text):

| Pair | Colours (fg on bg) | Needs | Ratio |
|---|---|---|---|
| Tile label on tile rest | `#F0E8E0` on `#140C0E` | 4.5:1 | **15.91:1** |
| Tile label on hover pill | `#F0C020` on `#2A0F0C` | 4.5:1 | **10.46:1** |
| Tile label on hover pill (pressed state) | `#F0C020` on `#2A0F0C` | 4.5:1 | **10.46:1** |
| Title on header | `#0A0708` on `#E8481A` | 4.5:1 | **5.13:1** |
| Title dot (`.accent`) on header | `#0A0708` on `#E8481A` | 4.5:1 | **5.13:1** |
| Header version on header | `#1A0806` on `#E8481A` | 4.5:1 | **4.97:1** |
| Header button glyph on header | `#F0E8E0` on `#120A0C` | 4.5:1 | **16.12:1** |
| Header button glyph on button hover | `#FFFFFF` on `#3A140E` | 4.5:1 | **16.33:1** |
| Filter chip text on chip | `#F0C020` on `#2A0F0C` | 4.5:1 | **10.46:1** |
| Banner text on banner | `#F0E8E0` on `#0A0708` | 4.5:1 | **16.55:1** |
| Hellfire hover bar / header line on tile rest (non-text) | `#E8481A` on `#140C0E` | 3.0:1 | **4.94:1** |
| Edit label on edit bar | `#50F0FF` on `#061A1D` | 4.5:1 | **13.00:1** |
| Done / close button text on edit bar | `#50F0FF` on `#061A1D` | 4.5:1 | **13.00:1** |
| + FILE / + INSTALLED text on edit bar | `#F0E8E0` on `#061A1D` | 4.5:1 | **14.77:1** |
| Done button text on its hover fill | `#FFFFFF` on `#0C3A40` | 4.5:1 | **12.39:1** |
| Settings text on overlay | `#F0E8E0` on `#0A0708` | 4.5:1 | **16.55:1** |
| Settings text on panel | `#F0E8E0` on `#140C0E` | 4.5:1 | **15.91:1** |
| Settings label (text-dim) on panel | `#B8A29A` on `#140C0E` | 4.5:1 | **7.97:1** |
| Settings value / cheat key (accent-text) on panel | `#F0C020` on `#140C0E` | 4.5:1 | **11.27:1** |
| Settings version value (accent-text, F2 rule) on overlay | `#F0C020` on `#0A0708` | 4.5:1 | **11.72:1** |
| Settings CLOSE text on panel | `#F0C020` on `#140C0E` | 4.5:1 | **11.27:1** |
| Settings CLOSE text on its hover fill | `#FFFFFF` on `#3A2A0A` | 4.5:1 | **13.86:1** |
| Hotkey error text (accent-m) on panel | `#50F0FF` on `#140C0E` | 4.5:1 | **14.01:1** |
| Hotkey input text on input fill | `#F0C020` on `#2A0F0C` | 4.5:1 | **10.46:1** |
| Picker row text on hover fill | `#F0E8E0` on `#2A0F0C` | 4.5:1 | **14.78:1** |
| Update banner text on update bar | `#F0E8E0` on `#1A0E10` | 4.5:1 | **15.55:1** |
| Update button text on hover fill | `#FFFFFF` on `#3A2A0A` | 4.5:1 | **13.86:1** |
| Drop-hint text (text-dim) on grid ground | `#B8A29A` on `#0A0708` | 4.5:1 | **8.29:1** |
| Remove glyph (#FFFFFF) on remove button | `#FFFFFF` on `#B02810` | 3.0:1 | **6.65:1** |
| Remove glyph on remove button hover fill | `#FFFFFF` on `#B02810` | 3.0:1 | **6.65:1** |
| Focus ring (accent-c) on tile rest (non-text) | `#E8481A` on `#140C0E` | 3.0:1 | **4.94:1** |
| Focus ring on grid ground (non-text) | `#E8481A` on `#0A0708` | 3.0:1 | **5.13:1** |
| Hover border on grid ground (non-text) | `#E8481A` on `#0A0708` | 3.0:1 | **5.13:1** |
| Hover border on hover fill (non-text) | `#E8481A` on `#2A0F0C` | 3.0:1 | **4.58:1** |
| Theme-picker row hover/active text (accent-text) on picker hover fill | `#F0C020` on `#2A0F0C` | 4.5:1 | **10.46:1** |
| Theme-picker selected row text (accent-text) on picker active fill | `#F0C020` on `#3C150F` | 4.5:1 | **9.39:1** |
| Edit-mode label hover text (accent-text) on tile hover fill | `#F0C020` on `#2A0F0C` | 4.5:1 | **10.46:1** |
| Picker / skin search input text (accent-text) on search fill | `#F0C020` on `#2A0F0C` | 4.5:1 | **10.46:1** |
| Rename / hotkey input text (accent-text) on input fill | `#F0C020` on `#2A0F0C` | 4.5:1 | **10.46:1** |
| Search placeholder (text-dim) on search fill | `#B8A29A` on `#2A0F0C` | 4.5:1 | **7.40:1** |
| Hotkey recording text (accent-m) on input fill | `#50F0FF` on `#2A0F0C` | 4.5:1 | **13.01:1** |
| Update dismiss glyph (text-dim) on update bar | `#B8A29A` on `#1A0E10` | 4.5:1 | **7.78:1** |

**Lowest ratio in this theme: 4.58:1 (Hover border on hover fill (non-text)).** Lowest text ratio: 4.97:1 (Header version on header). Every pair clears AA; nothing is estimated.

**Icon plates through `--tile-icon-fx`** (mock plates from the gallery, rest ground `#140C0E`):

| Icon plate (mock) | After fx | Tile ground | Ratio | Needs 3:1 |
|---|---|---|---|---|
| Notepad `#5b7fa6` | `#557FAC` | `#140C0E` | 4.61:1 | pass |
| Calculator `#6b6f76` | `#696D75` | `#140C0E` | 3.72:1 | pass |
| Paint `#b07a4f` | `#B87947` | `#140C0E` | 5.39:1 | pass |
| Terminal `#3d4450` | `#363E4C` | `#140C0E` | 1.79:1 | excluded (app art baseline, see 0.1.8) |
| Browser `#4f8a8b` | `#478C8D` | `#140C0E` | 4.96:1 | pass |
| Files `#c09a3e` | `#C89D32` | `#140C0E` | 7.65:1 | pass |

Lowest non-Terminal icon ratio at rest: **3.72:1** (pass). Terminal (the mock plate is dark art) is 1.79:1 at rest and is excluded, as in every earlier batch. On the hover fill `#2A0F0C`: **3.45:1**; on the pressed fill `#2A0F0C`: **3.45:1** (both pass).

**Translucency:** none. `--bg`, `--panel-bg`, `--overlay-bg` and `--header-bg` are opaque hex, so the effective minimum backdrop alpha is 1.0 and nothing bleeds through; the over-white check is n/a.


Notes: `--accent-c` is hellfire orange `#E8481A` (5.13:1 on the ground) for the header line, focus ring, hover border, slider and the art; `--accent-text` is ammo yellow `#F0C020` (11.3:1 on the panel) for values, chip, hotkey field, picker rows, the hover label and the update bar; `--accent-m` is cyan `#50F0FF` for edit mode and the hotkey error and recording text (13.0:1 on the edit bar). The title and its dot are ink `#0A0708` on the slab `#E8481A` (5.13:1) and the version line is `#1A0806` on the slab (4.97:1, the lowest text pair of this theme): the slab is the header's own background layer, so those two pairs use the slab colour. The hover and pressed fill `#2A0F0C` (L 0.010) keeps the Calculator plate above 3:1.

### 7.2 Type (all stock Windows, verified in `C:/Windows/Fonts`)

| Role | Stack | Weight | Size | Tracking | Case |
|---|---|---|---|---|---|
| Body, settings, pickers (`--font`) | `Bahnschrift, 'Segoe UI', sans-serif` | 400 (base) | base | base | base |
| `#title` | `Bahnschrift, 'Segoe UI', sans-serif` (`bahnschrift.ttf`) | 600, `font-style: italic`, `font-stretch: 87.5%` | 11 px (base) | 2px | uppercase (markup) |
| `.tile-label` | `Bahnschrift, 'Segoe UI', sans-serif` | 600 (`--tile-label-weight`), italic (`--tile-label-style`), `font-stretch: 87.5%` | 12 px (base) | 0.8px | uppercase (`--tile-label-transform`) |
| `#theme-banner-text` | `Bahnschrift, 'Segoe UI', sans-serif` | 600, `font-stretch: 87.5%` | 11 px (base) | 0.6px | uppercase strings, as written in 0.8 |

Bahnschrift has no italic face, so `font-style: italic` is a synthetic slant (B2 0.3.7, the same trick persona-5 uses on Impact); `font-stretch: 87.5%` reaches the SemiCondensed face only (B2 0.2.3), which is the narrow bold UI sans the franchise uses. Measured: the title text is 87.0 px wide and its box ends at x 99.0 (57 px under the gate, 69 px clear of the art at 168; the slab's slanted edge is at x 142 to 158). Labels in Bahnschrift SemiBold SemiCondensed 12 px with 0.8 px tracking: NOTEPAD 49.0, CALCULATOR 68.2, TERMINAL 53.8, BROWSER 51.9, PAINT 31.5, FILES 30.3 px. Expected `fontsRendered`: `Bahnschrift`. **Cyrillic:** Bahnschrift covers U+0416, U+042F and U+0431; Cyrillic tile names render in Bahnschrift.

### 7.3 Art (redraw). Static, original, inline SVG data URIs

Delete: the blood-tinted grain, diagonal energy lines, red pools and vignette in `#app::after`, the painted rings-and-readout panno (`#grid-container::before`), the ghost readout with its kill count (`#grid-container::after`), header text, edit-bar text, the red-slash `#particles` scroll, the `#app` animation, the tile flicker (B1 0.3; keyframes in 0.5). **No texture**: `#app::after { background: none; }` (expected sigma 0.00; measured 0.00).

**A. Header, a slab, a line and five chevrons (HZ).**
- `#header { background: url(slab) 0 0 / 158px 40px no-repeat, #120A0C; border-bottom-color:#E8481A; box-shadow: inset 0 -2px 0 #E8481A; }`: SVG `slab` (158 x 40) is a hellfire parallelogram (right edge slanted from x 158 at the top to x 142 at the bottom, a yellow 2 px edge), drawn behind the title and the version line; a 3 px hellfire line inside the header (y 37 to 40; nothing below). `#header::before { left:0; top:0; bottom:0; width:4px; background:#0A0708; box-shadow:none; }` (a black slit at the left edge, in front of the slab).
- **Chevrons, `#header::after`**: `content:''; position:absolute; top:10px; right:172px; left:auto; width:84px; height:20px;` with SVG `chev` (84 x 20): five angular chevrons (14 px wide, full height, 16 px apart), three hellfire then two yellow, at window x 170 to 250. Hidden while the chip shows.
- `#title`: ink on the slab, italic SemiCondensed; `#title .accent { color:#0A0708; }`; `#header-version { color:#1A0806; }` (the version line also sits on the slab).

**B. Frame, hard-cut corners.** `#grid-container` background, two layers: SVG `cutl` (10 x 10, a hellfire right triangle) at `left 1px top 1px` (x 1 to 11, y 41 to 51: top-left) and SVG `cutr` at `right 5px bottom 1px` (x 409 to 419, y 245 to 255 at 424 x 300: bottom-right). Nothing else in the bands.

**C. Banner, hazard slashes, claws and chevrons.** `#theme-banner { background: url(chevl) right 12px bottom 0 / 84px 34px no-repeat, repeating-linear-gradient(-58deg, #E8481A 0 5px, #0A0708 5px 10px) left 0 top 0 / 100% 5px no-repeat, #0A0708; border-top-color:#0A0708; }`; text `#F0E8E0`.
- **Hazard band:** a 5 px hellfire-and-black diagonal stripe along the top of the banner (window y 257 to 262), full width, a gradient (no image).
- **Chevrons, SVG `chevl`, 84 x 34** at banner x 328 to 412 (window y 266 to 300): three left-pointing chevrons, yellow then two hellfire. The longest string ends at x 290.5, so 37.5 px clear.
- **Icon, SVG `claw`, 22 x 22** in `#theme-banner::before` (content '', 22 x 22, `font-size:0`, `opacity:1`): three slanted claw slashes, hellfire, yellow, hellfire.
- Decoration only; no text in any SVG.

**D. Tiles.** Square (`--radius: 0px`), fill `#140C0E`, border `#2A1A1E`. Plates carry a bottom-right cut: `--tile-icon-shape: polygon(0 0, 100% 0, 100% 78%, 78% 100%, 0 100%)`. Glyph margins: Notepad 11.3, Calculator 9.1, Paint 11.0, Terminal 7.0, Browser 11.5, Files 9.1 px; nothing is cropped (a real icon whose art reaches its bottom-right corner loses a small triangle, watch item 4 in 9). Hover and focus: fill `#2A0F0C`, border hellfire, a 3 px hellfire bar on the tile's left edge (`box-shadow: inset 3px 0 0 #E8481A`), the label turns yellow.

**Trademark note.** The DOOM Eternal logo and its lettering, the Slayer's helmet, the pentagram and every rune or sigil are not drawn. Chevrons, hazard stripes, claw slashes and corner cuts are generic; no text in any SVG.

**The rules** (everything after `:root`; paste as is; each `@NAME@` is replaced by `url("data:image/svg+xml,...")` of the named SVG, encoded per B1 0.2):

```css
#app-version { color: var(--accent-text); }
.btn-remove:hover { background: #B02810; }

/* window: no texture layer */
#app::after { background: none; }

/* header: a hellfire slab behind the title, a 3 px hellfire line inside the header, five chevrons in the art zone */
#header { background: @SLAB@ 0 0 / 158px 40px no-repeat, #120A0C; border-bottom-color: #E8481A; box-shadow: inset 0 -2px 0 #E8481A; }
#header::before { left: 0; top: 0; bottom: 0; width: 4px; background: #0A0708; box-shadow: none; }
#header::after {
  content: ''; position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;
  background: @CHEV@ no-repeat 0 0 / 84px 20px;
  pointer-events: none;
}
#header:has(#filter-chip:not(.hidden))::after { display: none; }
#title { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-weight: 600; font-style: italic; font-stretch: 87.5%; letter-spacing: 2px; color: #0A0708; text-shadow: none; }
#title .accent { color: #0A0708; }
#header-version { color: #1A0806; }

/* frame: hard-cut corners in the bands (top-left, bottom-right) */
#grid-container {
  background:
    @CUTL@ left 1px top 1px / 10px 10px no-repeat,
    @CUTR@ right 5px bottom 1px / 10px 10px no-repeat;
}

/* tiles: a bottom-right cut on the plate; a hellfire bar on the left edge and a yellow label on hover */
.app-tile { background: #140C0E; border-color: #2A1A1E; }
.app-tile::before { display: none; }
.app-tile:hover, .app-tile:focus-visible { background: var(--tile-hover-bg); border-color: var(--tile-hover-border); box-shadow: inset 3px 0 0 #E8481A; }
.tile-label { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-stretch: 87.5%; }
.app-tile:hover .tile-label, .app-tile:focus-visible .tile-label { color: #F0C020; }

/* banner: hazard slashes along the top, claw marks for the icon, chevrons at the right end */
#theme-banner {
  background:
    @CHEVL@ right 12px bottom 0 / 84px 34px no-repeat,
    repeating-linear-gradient(-58deg, #E8481A 0 5px, #0A0708 5px 10px) left 0 top 0 / 100% 5px no-repeat,
    #0A0708;
  border-top-color: #0A0708;
}
#theme-banner::before { content: ''; width: 22px; height: 22px; font-size: 0; opacity: 1; background: @CLAW@ center / 22px 22px no-repeat; }
#theme-banner-text { font-family: Bahnschrift, 'Segoe UI', sans-serif; font-weight: 600; font-stretch: 87.5%; letter-spacing: 0.6px; color: #F0E8E0; }
```

| Placeholder | Is `url("data:image/svg+xml,...")` of SVG |
|---|---|
| `@SLAB@` | `slab` |
| `@CHEV@` | `chev` |
| `@CUTL@` | `cutl` |
| `@CUTR@` | `cutr` |
| `@CHEVL@` | `chevl` |
| `@CLAW@` | `claw` |

**SVG sources** (readable; single-quoted attributes, `rgb()` colours, no `<text>`; encode `<`, `>`, `#` as B1 0.2 says):

**`slab`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 158 40'>
<path d='M0 0 H158 L142 40 H0 Z' fill='rgb(232,72,26)'/>
<path d='M158 0 L142 40' stroke='rgb(240,192,32)' stroke-width='2'/>
</svg>
```

**`chev`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 20'>
<path d='M2 0 H9 L16 10 L9 20 H2 L9 10 Z' fill='rgb(232,72,26)'/>
<path d='M18 0 H25 L32 10 L25 20 H18 L25 10 Z' fill='rgb(232,72,26)'/>
<path d='M34 0 H41 L48 10 L41 20 H34 L41 10 Z' fill='rgb(232,72,26)'/>
<path d='M50 0 H57 L64 10 L57 20 H50 L57 10 Z' fill='rgb(240,192,32)'/>
<path d='M66 0 H73 L80 10 L73 20 H66 L73 10 Z' fill='rgb(240,192,32)'/>
</svg>
```

**`cutl`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><path d='M0 0 H10 L0 10 Z' fill='rgb(232,72,26)'/></svg>
```

**`cutr`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><path d='M10 10 H0 L10 0 Z' fill='rgb(232,72,26)'/></svg>
```

**`chevl`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<path d='M8 17 L20 4 H30 L18 17 L30 30 H20 Z' fill='rgb(240,192,32)'/>
<path d='M30 17 L42 4 H52 L40 17 L52 30 H42 Z' fill='rgb(232,72,26)'/>
<path d='M52 17 L64 4 H74 L62 17 L74 30 H64 Z' fill='rgb(232,72,26)'/>
</svg>
```

**`claw`**
```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'>
<path d='M5 1 L9.5 1 L4 21 L2 21 Z' fill='rgb(232,72,26)'/>
<path d='M11.5 1 L16 1 L10.5 21 L8.5 21 Z' fill='rgb(240,192,32)'/>
<path d='M18 1 L22 1 L17 21 L15 21 Z' fill='rgb(232,72,26)'/>
</svg>
```


### 7.4 Motion

| # | Today (infinite) | Element and property | Fate |
|---|---|---|---|
| 1 | `doom-title 8s steps(1)` | `#title` colour, opacity, text-shadow (tier 2) | removed |
| 2 | `banner-pulse 6s ease-in-out` | `#theme-banner::before` opacity (tier 1) | removed |
| 3 | `doom-device 8s steps(1)` | `#grid-container::before` opacity (tier 1) | removed |
| 4 | `doom-readout 8s steps(1)` | `#grid-container::after` colour (tier 2) | removed |
| 5 | `doom-border 8s steps(1)` | `#app` box-shadow (tier 5) | removed |
| 6 | `doom-slash 10s linear` | `#particles` background-position (tier 4) | removed |
| hover | `tile-flicker .3s steps(1) 2` (two iterations, not infinite) | `.app-tile:hover::before` | removed (`::before` is `display:none`) |

**Before 6, after 0.** `grep -c infinite doom-eternal.css` is 0. The one-shot `entrance-fade 0.8s` is the entrance (`entrance-zoom`, a blur, is retired).

### 7.5 Tiles, hover, selected, filter, banner

- **Tile at rest:** fill `#140C0E`, border `#2A1A1E` (1 px), radius 0, `::before` off; layout unchanged. Icons: `contrast(1.1) saturate(1.05)` through the cut plate.
- **Hover:** fill `#2A0F0C`, border hellfire (4.58:1 on the hover fill), a 3 px hellfire left bar, the label turns yellow (`#F0C020`, 10.46:1 on the hover fill), no glow, no transform. **Selected (focus-visible):** hover plus the base 2 px hellfire ring at offset 2 (5.13:1 on the ground, 4.94:1 on the tile). **Pressed:** base scale 0.96 on `#2A0F0C`.
- **Label:** `#F0E8E0`, Bahnschrift SemiBold SemiCondensed italic, uppercase, no halo.
- **Filter chip:** base rule (fill `#2A0F0C`, hellfire border, yellow text). The chevrons hide while it shows; the chip starts right of the slab.
- **Edit bar:** `#061A1D` fill, cyan rule and label (`#50F0FF`); `+ FILE` and `+ INSTALLED` light warm with a brown-grey border, `DONE` cyan. The tile ✕ is `#B02810` with a yellow ring; on hover it stays deep red (`.btn-remove:hover { background:#B02810; }`).
- **Settings overlay:** opaque `#0A0708`, panel `#140C0E`, yellow values and version (`#app-version`), hellfire sliders and checkboxes, yellow CLOSE.
- **Update banner:** light warm text on `#1A0E10` with a yellow rule.

### 7.6 Done when

1. `npm run check:contrast` passes with no rebaseline; `grep -c infinite doom-eternal.css` is **0**; `loopingAnimationsAtCapture` is 0 (was 6); no `\A`.
2. Header: a hellfire slab at x 4 to 158 (slanted right edge, yellow edge line) with ink title and version on it; a 3 px hellfire line at y 37 to 40 with nothing below; five chevrons at x 170 to 250; `#title` right edge at most 156 (mock 99.0); typing a letter hides the chevrons and shows the chip without touching the slab.
3. Frame: a hellfire corner triangle at x 1 to 11, y 41 to 51 and another at x 409 to 419, y 245 to 255 (424 x 300), nothing else in the bands; the last-column focus ring at 640 x 420 and 1024 x 700 is 1 px clear of the right-band triangle (Foundation acceptance check).
4. Banner: black with a 5 px hazard band across the top, claw slashes at x 14 to 36, three chevrons at x 328 to 412 flush with the bottom, light text on one line (`scrollWidth <= clientWidth` for all four strings).
5. Hover shot (CALCULATOR): hellfire border, dark-red fill, a left bar, a yellow italic label, cut plate with no cropped glyph, no ellipsis on CALCULATOR.
6. Cyan appears only in edit mode, the hotkey error and recording text; yellow only in values, the version, the chip, the hover label, chevrons, the update bar and the claw; no pink or dusty-red pixel in the chrome.
7. Hidden-tiles sigma 0.00.
8. A/B/C probe at the three sizes and the states shot: overlap 0 px, art in keep-out 0 px. Art-off for the probe: hide `#header::after`, `#header::before` and `#theme-banner::before`, set `#grid-container { background:none !important; }` and `#theme-banner { background:#0A0708 !important; }`; **the header's slab stays** (it is the title's surface, as persona-5's slabs were; my run: clearance 4.0 px at 424 x 300, 1.3 px in the states shot, 8.7 px at 640 x 420 and 1024 x 700).
9. `fontsRendered` lists `Bahnschrift`.

**Expected squint score: 4** (title and banner text covered). What survives: black with saturated hellfire orange, an orange slab in the header, five chevrons, a hazard band, claw slashes, cut corners. What is missing for a 5: the Slayer's helmet and the logo's lettering (neither may be drawn) and the game's bottom-left HUD cluster, which would need ring gauges the audit ruled out.

---

## 8. Fonts that would still lift this batch (for Sergei's decision; nothing downloaded, nothing used)

Rule: this batch uses the approved seven (four of them) and stock Windows fonts. Each font below is free-licensed; licence and Cyrillic coverage are from Makoto's font licence check (`Team/Research/QuickLaunch_ThemeReferences_2026-09-29.md`, repeated in F B7). Each needs a new OK from Sergei with file name, source and size, and the OFL text must ship with it. Ranked by how much the batch gains:

| Rank | Font | Licence | Cyrillic | Theme it lifts | What it replaces | Expected gain | Source |
|---|---|---|---|---|---|---|---|
| 1 | Press Start 2P | SIL OFL 1.1 | yes | doom-classic | Courier New Bold for the title, labels and banner (the digit windows stay drawn) | Low to medium: the theme already scores 5 without it; the lettering would be 1993 pixel type instead of a stock monospace | https://github.com/google/fonts/tree/main/ofl/pressstart2p |
| 2 | Russo One (or Saira Condensed) | SIL OFL 1.1 | Russo One yes | doom-eternal | Bahnschrift SemiBold SemiCondensed (synthetic italic) | Medium: Russo One is the heavy angular sans the sheet names; it is installed on this machine but is not stock Windows | https://github.com/google/fonts/tree/main/ofl/russoone |
| 3 | Noto Sans KR (or Rajdhani) | SIL OFL 1.1 | Noto Sans KR yes | swl-dragon | Malgun Gothic | Low: Malgun Gothic already reads as Seoul UI; a bundled face would make the Hangul identical on every machine | https://github.com/google/fonts/tree/main/ofl/notosanskr |
| 4 | Marcellus | SIL OFL 1.1 | no | ac-assassins | nothing needed: Cinzel (approved) sets the title | Low: a second-choice Roman capital, only if Sergei finds Cinzel too ornate for this theme | https://github.com/google/fonts/tree/main/ofl/marcellus |

No font is needed for ac-templars, swl-templar or swl-illuminati to reach their squint scores. If Sergei approves only one file, take **Russo One** (it changes the most visible pixels: a whole theme's type).

---

## 9. Summary

- **Seven sections written**, one per theme, each with a final `:root` block, computed contrast tables (gate, add-on and generic roles), icon checks on rest, hover and pressed fills, type with measured widths (real bundled font files for the four adopters), art as exact shapes with coordinates plus the rules block and every SVG source, a motion inventory, tile, hover, selected, filter and banner rules, a "Done when" list and an expected squint score. A batch-level section (0) points to batches 1 and 2 and the Foundation for every shared rule and records the new ones.
- **Infinite animations: 39 (+2 hover-only) to 0** (ac-assassins 6, ac-templars 5, swl-templar 5, swl-dragon 6, swl-illuminati 6, doom-classic 5, doom-eternal 6; two hover-only `tile-flicker` loops go too). No animation of any kind is left; no `will-change`; the only motion is the base 0.12 s tile transition and the one-shot entrance fade. The CSS shrinks too: 5.6 to 11.1 KB per theme against 14 to 21 KB today.
- **Contrast:** every pair clears its threshold. Lowest text pair **4.68:1** (ac-assassins, the recording-state hotkey text on its input fill; needs 4.5). Lowest non-text pair **3.17:1** (swl-templar, the crimson hover border on its hover fill; needs 3). Lowest icon ratio **3.18:1** (swl-illuminati, Calculator plate on the hover fill; needs 3). Lowest gate margin: swl-templar `--accent-c` 3.45:1, then ac-templars 3.64:1. The real gate script, run on the seven prototype files, reported 0 errors, and a deliberately broken copy made it report 1 (positive control). ac-templars and swl-templar leave the legacy list; ac-assassins loses its translucency.
- **Type:** four themes adopt bundled faces (Cinzel, Jost, UnifrakturCook, IM Fell English), all measured from the real files: title edges 140.3, 138.7 and 99.4 px against the 156 gate (no ladder step taken), every label inside the 100 px box, every banner line inside its text box. Three stock faces for the rest (Malgun Gothic with Hangul, Courier New, Bahnschrift SemiCondensed) and Segoe UI Semibold. Every Cyrillic tile name falls to a Cyrillic-covering face.
- **Overlaps:** none by construction and none measured: the A/B/C probe read 0 px overlap and 0 px of art in the keep-out in all 28 runs (424 x 300 grid and states, 640 x 420, 1024 x 700, seven themes); smallest clearance 4.0 px in the default grid shot (swl-templar, doom-eternal), 1.3 px in the states shot (the last partly visible tile row against the banner's top edge, by construction, as in batches 1 and 2). The probe's positive control reads 593 to 683 px when art is planted over the title.
- **Banner lines:** 28 lines across the seven, each checked on the web (0.8); **none is studio-authored**; one (`Laws. Tradition. Blood.`) rests on search snippets only (the page returned 403), marked. The dropped lines and the reasons are in 0.8.
- **Squint (expected, title and banner text covered):** ac-assassins 4, ac-templars 4 (least sure of the 4s), swl-templar 4, swl-dragon 3, swl-illuminati 4, doom-classic 5, doom-eternal 4.
- **Facts found on the way (not fixed, not in this batch's scope):** the two legacy contrast failures came from red accents that compute to 2.66 and 2.71:1 on their grounds (`#A81E1E`, `#B0121E`); the audit's suggested Illuminati blue `#2F5FA8` passes on the ground (3.13) but fails on the tile (2.89), so it could not carry a focus ring; the current ac-assassins pentagon plate crops the Terminal and Calculator glyph corners (-1.1 and -0.4 px); the Doom themes' old `rip and tear` line belongs to DOOM 2016 and Eternal, not to 1993.

### The `THEME_BANNERS` entries (exactly as written; replaces the seven keys and no others)

```js
  'ac-assassins': [
    'Nothing is true, everything is permitted.',
    'We work in the dark, to serve the light.',
    'Requiescat in pace.',
    'Hide in plain sight.',
  ],
  'ac-templars': [
    'May the Father of Understanding guide us all.',
    'Order. Purpose. Direction. No more than that.',
    "It's an invitation to chaos.",
  ],
  'swl-templar': [
    'The world will founder without structure and discipline.',
    'Our conflict must be a righteous one.',
    'Laws. Tradition. Blood.',
  ],
  'swl-dragon': [
    "It's a thousand coins flung into the air.",
    'We are the hand that makes the toss.',
    'We are the trajectory.',
    'We are the violence in the wind.',
    'What is chaos in theory?',
  ],
  'swl-illuminati': [
    "We're the Illuminati... and we're not done.",
    'Power is our currency, our DNA, our God.',
    'We control the world.',
  ],
  'doom-classic': [
    'KNEE-DEEP IN THE DEAD.',
    'THE ONLY WAY OUT IS THROUGH.',
    'THE SHORES OF HELL.',
    "THERE'S NO TURNING BACK NOW.",
    'HOME AT LAST.',
    'THY FLESH CONSUMED.',
  ],
  'doom-eternal': [
    'THE ONLY THING THEY FEAR... IS YOU.',
    'RIP AND TEAR, UNTIL IT IS DONE.',
    'WARNING: THE SLAYER HAS ENTERED THE FACILITY.',
    'WELCOME HOME, GREAT SLAYER.',
  ],
```

### Flags for Jane and Sergei

1. **RESOLVED by Sergei, 2026-09-30: Classical lettering. Cinzel 600, 12 px, 3 px tracking, uppercase (see Addendum A.1).** *Original flag:* **swl-templar title is blackletter by the Foundation map; the sources say Classical.** The fetched Secret World page describes Templar territory as red banners, white crosses and heavily Classical architecture with straight lines and right angles; blackletter says "medieval order", which the lore also has (the faction descends from the Knights Templar). I built the frame and art on the Classical evidence and kept the map's UnifrakturCook title (12 px, lowercase). Options: keep (my lean: it is the only medieval note in a Classical theme and it carries the "order" identity), switch the title to Cinzel 700 (approved; Roman capitals suit the portico better, but ac-assassins and gryffindor already use it), or keep stock Palatino Bold. One line to change.
2. **`Laws. Tradition. Blood.` (swl-templar line 3) is snippet-verified only.** Two independent searches returned the same wording from the Funcom developer journal "Unveiling the Templars" on MMORPG.com; the page itself refused a fetch. Drop it if a snippet is not enough; the other two lines stand on a fetched page.
3. **ac-templars uses Jost at weight 400, not the map's 300** (Light is a hairline at 11 to 12 px on a dark ground; 0.10).
4. **RESOLVED by Sergei, 2026-09-30: yes, add the jade serpent in the banner's right end in place of the ripples (see Addendum A.2; expected squint now 4).** *Original flag:* **swl-dragon scores 3.** The faction's emblem is a Funcom mark whose shape no source describes, and I left out a dragon silhouette on purpose (yakuza has one; the sources describe lanterns, coins and ripples). If Sergei wants a dragon, a jade serpent in the banner's right end in place of the ripples is a small follow-up; I have not drawn it.
5. **TV Tropes is a fan-edited wiki** that reproduces the in-game faction pitches verbatim; it is near-primary for the SWL, AC and DOOM lines, not primary. The Funcom developer journals (the primary source) and the Fandom wikis refused a fetch.
6. **All 28 banner lines are real; none is studio-authored** (batches 1 and 2 had six).

### Watch items (not fixes, not blocking)

1. **Real icons vs cut plates.** The hexagon (ac-assassins), banner-tail (swl-templar), pointed-hex (swl-dragon), dossier-corner (swl-illuminati) and bottom-right cut (doom-eternal) plates clear every mock glyph (smallest margins 4.0, 4.6, 2.2, 7.0 and 7.0 px), but a real app icon whose art reaches a corner loses a small triangle there. If Sergei notices, drop the cut to `none`; the themes still read through their surfaces.
2. **swl-dragon's Calculator margin is 2.2 px** (the pointed hex was kept from today, where it already shipped without a visible crop).
3. **Right-band art at windows without a scrollbar.** swl-templar's pilaster, swl-dragon's dots and ring, doom-classic's strip and doom-eternal's corner triangle sit 1 px outside the focus ring's zone at every size once the gutter lands; the Foundation after-run should check the last-column ring at 640 x 420 and 1024 x 700 for these four.
4. **Doom-eternal's hover bar plus the focus ring** read as nested frames at the tile's left edge (heavy but on-style), as persona-5's hover did.
5. **Blackletter at 12 px** is still small; a bundled x-height is what it is. If it reads too small, 13 px keeps the title inside the 156 gate (about 104 px edge) and is one number.
6. **ac-templars' light banner** is the brightest surface in the batch; it sits above a dark edit bar in edit mode. If Sergei finds it glaring, the lever is `#D5D9DE` to a mid silver (`#B8BDC4` keeps the ink text at 10.2:1).
7. **Not seen by me:** Electron renders (mock only), the skin-picker list open, the empty-library drop hint, edit-mode ✕ buttons on cut plates. None of the seven touches those states.

---

## 10. Open items (things I could not resolve or verify here)

Nothing was launched in QuickLaunch. Each item has a verify step above; none blocks implementation.

1. **Mock window, not Electron.** All measurements come from headless Edge 154 with the Foundation's CSS applied to the real `base.css` and `index.html`. Chromium 154 is not Electron 32: sub-pixel text and filter rounding can differ. Ender's numbers win; the after-run reports them. After the Foundation fonts are packaged, the title-edge ladder (F B2 rule 5) is binding over my measured edges.
2. **Fonts measured from Ender's working tree.** I read four of the seven bundled files read-only to get real widths; if Ender renames or re-exports them, re-measure.
3. **The Hangul tag** (swl-dragon) is a pseudo-element, so `fontsRendered` cannot see it; check a 3x crop. Malgun Gothic ships with Windows 10 and 11; on a machine without it the stack falls to `'Segoe UI'` (no Hangul) and then to the system's Korean face, and the tag may render in a different face.
4. **Banner widths** were measured in the mock with the real fonts; the fit check (F A3) is the net if Electron differs by a few pixels (every line has at least 37 px to spare against the nearest motif, and none is within 30 px).
5. **`Laws. Tradition. Blood.`** (flag 2).
6. **Sources blocked to a fetch:** the Funcom developer journals and the Fandom wikis (403 or 402); the lines that depend on them are dropped or marked.
7. **`THEME_BANNERS` comment in `app.js`** ("3 per theme") is stale (B1 12.8 watch item 1); this batch's entries are 4, 3, 3, 5, 3, 6 and 4 lines. Only the seven keys named in 0.8 change.
8. **Tall windows:** swl-dragon's dots end at 212 px (the bands show dots in their top part only) and swl-templar's pilasters stretch with the container height (the shaft SVG is stretched vertically by design). Both look right at 1024 x 700 in the mock.

---

## Addendum — Sergei's rulings 2026-09-30

Judy, 2026-09-30. Sergei answered the two open flags: **flag 1, swl-templar lettering: Classical** (not the blackletter built today); **flag 4, swl-dragon: yes, add the jade serpent** in the banner's right end in place of the ripples. This addendum is written for Ender to implement directly. Everything not named here is unchanged; the original lines it replaces are listed in A.4. Flags 1 and 4 above are marked resolved. No CSS or JavaScript was edited to write this; the numbers come from a mock (A.6).

| | swl-templar title | swl-dragon banner |
|---|---|---|
| Was | UnifrakturCook 700, 12 px, 3 px tracking, lowercase, edge 99.4 | Five jade ripples from a gold pebble, 84 x 34 |
| Now | **Cinzel 600, 12 px, 3 px tracking, uppercase, edge 146.7** | **A static jade serpent, reared head facing the text, 84 x 34** |
| Gate / fit | 9.3 px under the 156 gate, 21.3 px clear of the art at 168 | 9.1 px clear of the text box, 77.5 px clear of the longest line |
| Squint (expected) | 4, unchanged (the test covers the title) | **4** (was 3) |

### A.1 swl-templar: Classical lettering

**Face: `Cinzel` (bundled `fonts/cinzel/Cinzel-VF.ttf`, variable 400 to 900), weight 600.** Cinzel is drawn from Roman inscriptional capitals, which is what a Classical portico carries over its door; it is the only one of the seven approved files that is Classical in character. The other six do not fit: IM Fell English is a Baroque text roman (and it already sets the banner, so the title would read as the same voice), Jost is a 20th-century geometric sans, and Metamorphous, Pirata One, Dela Gothic One and UnifrakturCook are display, gothic or fantasy faces. No new file is needed and nothing is downloaded.

**The rule (replaces the `#title` line in the rules block of 3.3; the `.accent` line is unchanged):**

```css
#title { font-family: 'Cinzel', 'Palatino Linotype', Palatino, Georgia, serif; font-weight: 600; font-style: normal; font-synthesis: none; line-height: 1.2; font-size: 12px; letter-spacing: 3px; color: #E8E2D2; text-shadow: none; }
#title .accent { color: #EE6A64; }
```

| Property | Value | Why |
|---|---|---|
| Face and weight | Cinzel 600 (inside the file's 400 to 900 range, so exact, no synthesis) | 600 is one step lighter than ac-assassins and gryffindor (both 700), which also use Cinzel |
| Size | 12 px, `line-height: 1.2` | Same box as the blackletter title (14.4 px), so the title and the version line stack exactly as before inside the 40 px header |
| Tracking | 3 px | Inscriptional caps want air; 3 px is what ac-assassins and gryffindor use with the same face |
| Case | **Uppercase, from the markup** (`QUICK.LAUNCH`). **Delete `text-transform: lowercase`; add no transform.** | Cinzel draws lowercase as small capitals (right edge 137.3, visibly shorter letters), which reads as a mistake |
| Colour | `#E8E2D2` bone, dot `#EE6A64` | Unchanged; 14.06:1 and 5.96:1 on the header, so the gate is untouched |
| Cyrillic | Falls to Palatino Linotype | The title is fixed Latin markup |

**Measured title edge (right edge of `#title`, header padding 12 px, real `Cinzel-VF.ttf`):**

| Setting | Right edge | Against the 156 gate |
|---|---|---|
| **Cinzel 600, 12 px, 3 px (chosen)** | **146.73** (box x 12 to 146.73, 134.73 wide) | **9.27 px under**; 21.3 px clear of the header scene at x 168 |
| Cinzel 700, 12 px, 3 px | 148.67 | 7.3 under |
| Cinzel 500, 12 px, 3 px | 144.88 | 11.1 under |
| Cinzel 700, 11 px, 3 px (ac-assassins, gryffindor) | 140.30 | 15.7 under |
| Cinzel 600, 12 px, 2 px | 134.73 | 21.3 under |
| IM Fell English 400, 12 px, 3 px (rejected) | 148.31 | 7.7 under |
| Cinzel 600, 12 px, 3 px, lowercase (small caps, rejected) | 137.28 | 18.7 under |

Title box y 5.8 to 20.2; version line y 21.2 to 33.2; header 40 px. Nothing else in the header moves. The edge does not depend on the window size (measured at 424 x 300, 640 x 420 and 1024 x 700: 146.73 at all three).

**Ladder if Electron measures over 156** (Foundation B2 rule 5 stays binding over my number): first step tracking to 2 px (edge 134.7), then 11 px. Do not go back to lowercase, and do not drop to stock Palatino without telling Jane. The rule-5 formula (widest capital, 0.778 em) would cap 12 px Cinzel at 2 px, but it is a conservative bound; the gate is the measured edge, and the measured edge at 3 px passes.

**Fonts:** `fontsRendered` for swl-templar lists `Cinzel`, `Palatino Linotype` and `IM Fell English`. **`UnifrakturCook` must not appear** (negative control: the file stays bundled but nothing requests it, so Chromium never loads it). The misspelled-family control is unchanged. The banner stays IM Fell English 12 px (roman, a text face, not gothic) and the tile labels stay Palatino uppercase; Sergei's ruling is about the lettering of the title.

**Housekeeping for Ender:** rewrite the comment at the top of `swl-templar.css` ("Title face: Sergei's call is pending ... built as specified (bundled UnifrakturCook, 12 px, lowercase)") to say the title is Cinzel 600 by Sergei's ruling of 2026-09-30.

### A.2 swl-dragon: the jade serpent

**What it is.** One serpent, side view, in the banner's right end where the ripples were: a tail that starts as a point at the lower left, two rising and falling humps, a neck that climbs at the right and a reared head that faces left, toward the text. Jade body (`rgb(47,181,106)`, the theme's `--accent-c`) with a darker jade edge outside it, one pale-jade dorsal line, a gold eye and a two-pronged gold tongue. It is a **plain serpent**: no legs, claws, mane, whiskers or scales, so it is not an Eastern dragon (yakuza in batch 2 already has a gold one) and not the faction's emblem (no source describes it). **Static**: a single SVG background, no SMIL `<animate>`, no CSS animation; `grep -c infinite swl-dragon.css` stays **0** and `loopingAnimationsAtCapture` stays 0.

**Position and size.** The box is the ripples' own: **84 x 34 px, `right 12px bottom 0`** of `#theme-banner`, so x W-96 to W-12 and, at 424 x 300, **x 328 to 412, y 266 to 300** (banner y 256 to 300, 2 px jade border on top). Painted pixels (alpha scan at 8x): **x 329.1 to 410.8, y 268.8 to 297.3** at 424 x 300, i.e. 1.1 px inside the box on the left, 1.3 px on the right, 2.75 px at top and bottom. So it is wholly inside the banner's padding box (10.8 px below the jade border, 2.75 px above the bottom edge) and does not touch the coin (x 14 to 36), the border or the tile field (banner top is y 256, the serpent starts at y 268.8).

| Part | Colour | Size |
|---|---|---|
| Body | `rgb(47,181,106)` jade | centreline 110 px long; width 0.4 px at the tail tip, 4.2 px by a quarter of the length, about 3.3 px at the neck |
| Edge | `rgb(18,100,58)` dark jade | 0.7 px outside the body (stroke 1.4, painted first) |
| Dorsal line | `rgb(160,240,196)` pale jade, opacity 0.85 | 0.9 px, from the first hump to the neck |
| Head | jade, same outline | 8 px long, 5.8 px wide, in the same outline as the body |
| Eye | `rgb(217,176,74)` gold | 1.9 px across |
| Tongue | `rgb(217,176,74)` gold | 0.6 px stroke, forked, 3.6 px long |

**Contrast** (the serpent is decoration, but the body is the shape that has to be seen): jade body on the banner `#252B28` **5.46:1** (needs 3 for a graphic); gold tongue on the banner 7.05:1. The edge (2.00:1 on the banner), the dorsal line on jade (1.98:1) and the gold eye on jade (1.29:1) are details and are not needed to read the shape. The gate variables are not touched, so `npm run check:contrast` is unaffected.

**Keep it clear of the text.** The banner text box runs to W-14, which reaches under the serpent's box (this was true of the ripples too, and only the lines' own widths kept them apart). Make that structural: add **`margin-right: 90px`** to `#theme-banner-text`. The text box then ends at W-104 (x 320 at 424; 536 at 640; 920 at 1024), 8 px short of the serpent's box and 9.1 px short of its painted pixels, and the banner fit check (`scrollWidth <= clientWidth`) now protects the art.

| Check | Result |
|---|---|
| Text box at 424 x 300 | x 46 to 320 (274 px wide; was 364) |
| The five lines, glyph right edge | 251.66, 245.73, 160.63, 218.28, 177.27; widest fits with 68 px to spare; all five pass the fit check |
| Widest line to the serpent's first painted pixel | **77.5 px** (329.1 minus 251.66) |
| Text box to the serpent's first painted pixel | 9.1 px |
| Positive control | The dropped line "For we are the Dragon, and we take chaos far beyond theory." is 328 px wide: it **fails** the fit check with the margin (274) and is skipped; without the margin (364) it would pass and end at x 373.6, 44 px **inside** the serpent |

**Rules (replace the two banner lines in the 4.3 rules block; everything else in the block stays):**

```css
/* banner: a concrete strip, a gold coin, a jade serpent at the right end */
#theme-banner { background: @SERPENT@ right 12px bottom 0 / 84px 34px no-repeat, #252B28; border-top: 2px solid #2FB56A; }
#theme-banner-text { font-family: 'Malgun Gothic', 'Segoe UI', sans-serif; font-weight: 400; letter-spacing: 0.3px; color: #DCEBDD; margin-right: 90px; }
```

Delete the `ripples` SVG and its `@RIPPLES@` row; add `@SERPENT@` = `url("data:image/svg+xml,...")` of the SVG below, encoded per B1 0.2 (`<` as `%3C`, `>` as `%3E`, single quotes inside the double-quoted `url()`; this SVG has no `#`, no `<text>` and no `\A`). Size: 2,323 bytes raw, about 2.5 KB encoded (the ripples were 0.7 KB), so `swl-dragon.css` grows by about 1.8 KB to about 10.9 KB.

**`serpent`** (84 x 34; paste as is, do not re-trace):

```
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'>
<polygon points='2.1,28.2 3.3,27.5 4.6,26.8 5.8,26.1 7,25.4 8.2,24.6 9.3,23.7 10.5,22.8 11.5,21.8 12.5,20.7 13.4,19.5 14.2,18.4 15,17.3 15.8,16.3 16.7,15.3 17.5,14.6 18.5,14 19.6,13.6 20.7,13.3 21.8,13.2 22.8,13.4 23.7,13.7 24.5,14.1 25.2,14.8 26,15.7 26.8,16.7 27.6,17.8 28.4,19 29.3,20.2 30.3,21.3 31.2,22.3 32.1,23.3 33,24.4 34,25.5 35,26.6 36.2,27.6 37.5,28.6 39,29.5 40.7,30 42.3,30.4 43.9,30.5 45.5,30.5 47,30.4 48.6,30.1 50.1,29.8 51.7,29.2 53.2,28.4 54.5,27.6 55.6,26.7 56.7,25.9 57.8,25.1 58.7,24.5 59.7,24.1 60.6,23.9 61.7,23.9 62.9,24 64.3,24.1 65.8,24.3 67.5,24.3 69.1,24 70.6,23.7 72,23.3 73.5,22.8 75,22.2 76.4,21.4 77.8,20.3 78.9,19 79.9,17.7 80.6,16.3 81.2,14.9 81.8,13.3 82,11.5 81.8,9.6 81.1,7.9 80,6.3 78.3,5.1 76.4,4.7 74.8,4.7 73.4,4.8 72,4.9 72.1,4.3 69.5,3.5 65.9,4.5 64,6.1 65.7,7.9 69.3,9.3 71.9,8.7 72,8.1 73.4,8.2 74.8,8.2 76,8.2 76.8,8.4 77.3,8.9 77.8,9.6 78.1,10.4 78.1,11.3 77.9,12.3 77.5,13.3 76.9,14.4 76.3,15.4 75.6,16.3 74.9,17.1 74,17.8 73.1,18.3 72,18.8 70.8,19.2 69.6,19.5 68.3,19.7 67.1,19.9 66,19.9 64.8,19.8 63.4,19.6 61.8,19.5 60.1,19.5 58.4,19.9 56.7,20.6 55.3,21.4 54.1,22.3 53,23.2 51.9,24 50.9,24.7 50,25.2 48.9,25.5 47.7,25.8 46.5,26 45.3,26.1 44.1,26.1 42.9,26 41.8,25.8 40.8,25.5 39.9,25 39,24.3 38.1,23.5 37.2,22.5 36.3,21.5 35.4,20.5 34.4,19.4 33.5,18.4 32.6,17.5 31.8,16.4 31,15.3 30.2,14.2 29.3,13 28.2,11.8 26.8,10.6 25.1,9.9 23.3,9.5 21.6,9.5 19.9,9.8 18.3,10.4 16.9,11.1 15.6,12.1 14.4,13.3 13.6,14.6 12.8,15.8 12.1,17.1 11.4,18.3 10.7,19.4 10,20.5 9.2,21.5 8.2,22.5 7.2,23.4 6.2,24.3 5.1,25.2 4,26.1 3,26.9 1.9,27.8' fill='rgb(47,181,106)' stroke='rgb(18,100,58)' stroke-width='1.4' stroke-linejoin='round' paint-order='stroke'/>
<polyline points='17.7,12.6 20.3,11.6 23.1,11.4 25.7,12.4 27.6,14.3 29.3,16.6 31,18.8 32.8,20.9 34.7,23 36.6,25 38.7,26.8 41.2,27.9 44,28.3 46.8,28.2 49.5,27.6 52,26.6 54.3,24.9 56.5,23.3 59,22 61.8,21.7 64.5,22 67.3,22.1 70.1,21.6 72.7,20.8' fill='none' stroke='rgb(160,240,196)' stroke-width='0.9' stroke-linecap='round' stroke-linejoin='round' stroke-opacity='0.85'/>
<circle cx='68.5' cy='7.5' r='0.95' fill='rgb(217,176,74)'/>
<path d='M64,6.1L62.4,6M62.4,6L60.4,7.2M62.4,6L60.5,4.6' fill='none' stroke='rgb(217,176,74)' stroke-width='0.6' stroke-linecap='round'/>
</svg>
```

**Kept:** the gold coin icon, the lanterns, the Hangul tag, the dots and the **one ripple ring on the pad** (the frame's right band): Sergei said "in place of the ripples" for the banner's right end, so only the banner changes. The serpent's trademark note: no emblem, no dragon silhouette with limbs; a generic serpent.

**Housekeeping for Ender:** update the comments in `swl-dragon.css` that say "ripples from a pebble" (the header block and the banner comment).

### A.3 Checks that change

**swl-templar, 3.6 "Done when":**
- **Item 2, title clause** becomes: `#title` right edge at most 156 (mock **146.7**); the title reads uppercase `QUICK.LAUNCH` in **Cinzel 600 at 12 px** with a red dot (it is not lowercase and not blackletter); the rest of item 2 (crimson line, scene at x 168 to 252, chip behaviour) is unchanged.
- **Item 9** becomes: `fontsRendered` lists `Cinzel`, `Palatino Linotype` and `IM Fell English`, and **does not list `UnifrakturCook`**; a misspelled-family probe element falls back.
- **Squint note:** expected score **stays 4**. The squint test covers the title, so the lettering cannot move it; what it buys is agreement between the title and the Classical frame. The phrase "and, for the blackletter, agreement with the Classical look (flag 1)" no longer applies; what is missing for a 5 is the faction emblem and real Temple Hall photography, neither of which may be drawn.

**swl-dragon, 4.6 "Done when":**
- **Item 4** becomes: Banner: flat `#252B28` with a 2 px jade top border, a gold coin at x 14 to 36, **a jade serpent with painted pixels at x 329.1 to 410.8 and y 268.8 to 297.3 (424 x 300), head reared at the right facing left, gold eye**, pale text on one line; the text box ends at x 320 (W-104 at any size) and `scrollWidth <= clientWidth` for all five strings; the serpent does not touch the text (widest line ends 77.5 px before it); no ripples in the banner.
- **Item 8** (probe): overlap 0 px, art in keep-out 0 px, at the three sizes and the states shot. The art-off override is unchanged (the text box and its new margin count as content and stay on). The serpent gives 9.1 px to the text box and 77.5 px to the text, both larger than the 6.7 px and 2.7 px minimums already reported, so the reported minimums cannot get smaller.
- **Item 6** (colour audit): unchanged; the serpent adds no red, orange or blue, and the allowed-gold list gains "the serpent's eye and tongue".
- **Motion:** `grep -c infinite swl-dragon.css` is 0; the serpent is a static image.
- **Squint:** expected **4** (was 3). What survives with the title and banner text covered: jade and gold on green-black, a Hangul tag, a string of green lanterns, a coin, scattered dots and a jade serpent on a concrete strip. The serpent is the first mark that says "Dragon" rather than "green Asian lanterns". What keeps it at 4: the faction's own emblem (not described by any source, and a Funcom mark) and the fact that at 34 px it reads "snake" first; a fan who knows the Dragon still names it. This is my judgment, not a fan test, and with ac-templars it is the score I am least sure of.

### A.4 What the addendum replaces (the original text is left as written)

| Where | Original | Now |
|---|---|---|
| Flags 1 and 4 (end of section 9) | Open questions | Marked resolved by Sergei |
| At a glance, rows 3 and 4 | "UnifrakturCook 700 title (lowercase)"; "ripples from a pebble"; squint 3 for swl-dragon | Cinzel 600 title (uppercase); a jade serpent; squint 4 for swl-dragon |
| 0.3 item 1, 0.7 fonts table | swl-templar uses UnifrakturCook (title) and IM Fell English | swl-templar uses **Cinzel** (title, 600) and IM Fell English; the UnifrakturCook row has no theme |
| Audit comparison table, "swl-templar type" and swl-dragon rows | Blackletter kept; ripples in the banner | Classical (Cinzel); serpent in the banner |
| 3 Direction (last sentences), 3.2 type table and paragraph, 3.3 A (`#title` bullet), 3.3 rules block `#title` line, 3.6 items 2 and 9, squint note | Blackletter, lowercase, 12 px, edge 99.4 | A.1 |
| 4 Direction (banner ripples), 4.3 C (Ripples bullet, `ripples` SVG, `@RIPPLES@` row, banner rules), trademark note, 4.6 items 4 and 8, squint note | Ripples from a pebble; squint 3 | A.2 and A.3 |
| Section 9 Summary: Type bullet, Squint bullet | "title edges 140.3, 138.7 and 99.4"; "swl-dragon 3" | swl-templar title edge **146.7**; swl-dragon **4** |
| Watch item 5 (blackletter at 12 px) | Open | Moot |

### A.5 For Jane and Sergei

1. **`UnifrakturCook-Bold.ttf` now has no theme.** swl-templar was the only user. The file is one of the seven Sergei approved (42,688 bytes plus its `OFL.txt`, `@font-face` block and README row); it costs nothing at run time because Chromium loads a face only when it is used. Keep it or drop it is Sergei's call; I changed nothing.
2. **The Templar title now looks like ac-assassins' title** (Cinzel capitals, a red dot). They differ in size (12 px against 11), weight (600 against 700), colour (bone `#E8E2D2` against white `#EDEDED`) and above all the frame; if Sergei wants them further apart, weight 500 (edge 144.9) is the one-number lever.
3. **The serpent is drawn from a computed centreline, not hand-traced.** It read as a snake at 1.5x, 3x and 6x in the mock. If Sergei wants a different pose (head facing right, a coil), that is a follow-up redraw; the box, the colours and the text margin would not change.

### A.6 How this was checked

The mock window from 0.4 (real `index.html` and `base.css`, the gallery's mock tiles, headless Edge 154, not Electron), driven over the DevTools protocol at 424 x 300 and at 640 x 420 and 1024 x 700, using the working-tree `swl-templar.css` and `swl-dragon.css` **copied to the scratchpad** with only the override rules above appended; no file in the repo tree was edited. The mock reproduces the spec's own numbers with today's files (blackletter edge 99.44; dragon title edge 130.78; widest dragon line 251.66; Cinzel 700 at 11 px and 3 px gives 140.30, the same as ac-assassins and gryffindor), so the new numbers are comparable. The title edges are read from `getBoundingClientRect` with the fonts loaded (the variable weight axis responds: 500, 600 and 700 give 144.88, 146.73 and 148.67). The serpent's painted bounds are an alpha scan of the SVG drawn at 8x. **Not done:** Electron itself (the after-run and the gallery are Ender's), a fan read of the squint score, and the A/B/C probe script (its clearances above are computed from the measured boxes).
