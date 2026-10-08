# QuickLaunch theme review, batch 5 (Judy, 2026-10-01)

Reviewer: Judy. Branch `wip/theme-fidelity`, HEAD `35d4e25` plus Ender's uncommitted working tree (`app.js` and `ff6/7/8/9/10/14/15.css`). Read red-team: the job was to find what is off against the spec and against real icons and real states, not to give a balanced take. Nothing in the repo was edited, committed or pushed; this file is the only thing written and it is left uncommitted. The regions worktree was not touched (the untracked `QuickLaunch_RegionsSpike_2026-09-30.md` in `Docs/` is not mine and was left alone).

**In scope:** ff6, ff7, ff14, ff8, ff9, ff10, ff15 against `QuickLaunch_ThemeSpec_Batch05_2026-10-01.md`, the batch-5 `THEME_BANNERS` change in `app.js`, and Ender's four deviations. **Sergei's five open flags** (glove or gear, ff10 opaque or translucent, hard label drop, ff14 blue or gold ring, "Chicken-wuss" keep or swap) were first judged as built; Sergei then left them to Judy ("decide yourself, what will be more beautiful"), so section 10 rules on each and F5 and F6 carry what differs from the build.

## 1. What was tested, and on what

- **Hashes (plain `sha1sum` of the file bytes, which is what Ender quoted).** All eight match his figures, checked at the start and again at the end of the review: ff6 `e914375a`, ff7 `75f0f318`, ff8 `c30c62c4`, ff9 `e85baad8`, ff10 `3b30acc7`, ff14 `3e48ca8d`, ff15 `f8e87ebc`, `app.js` `2aee50b1`. `git status` shows exactly the eight named files modified.
- **The build under test is the tree.** I extracted `batch5\build\win-unpacked\resources\app.asar` (sha1 `c7262abd...`) myself with the repo's own `@electron/asar`: its `src` (131 files) is identical to the working tree (`diff -rq`, no output). Ender's `tree-src-final.sha1` checks **133 of 133 OK** against the tree and equals his pre-build list. What I rendered is what is on disk.
- **Launches.** 31 guarded launches, every one through `node scripts/qa/quicklaunch-safe-launch.mjs` from the studio root, each on a fresh temp profile (14 gallery mock tiles, `startWithWindows` false, `globalHotkey` null, `randomTheme` false), using Ender's scratch build; plus one `--check` preflight that launched nothing. **All 31 ended `RESULT: PASS`, 0 processes left, `Run` and `StartupApproved\Run` unchanged** (13 and 25 values, every time). Sergei's instance (PID 4916 and its three children) was running throughout and was never touched; the installed app was never used; no `taskkill /IM`.
- **Port ownership proven before the driver ran.** `run5.sh` chooses a free port, refuses to start if the fresh profile already holds a `DevToolsActivePort`, and runs the driver only after **that profile's own `DevToolsActivePort` file names the chosen port**. All 31 ports matched (10606 to 10972). The driver also refuses any page that is not under `...\batch5\build\...\app.asar\`.
- **No synthetic input.** My driver (`scratchpad\judy-review\out5\j5.mjs`) uses `Runtime.evaluate`, `CSS.forcePseudoState` (hover, focus), `Emulation` (size, scale), `Page.captureScreenshot` and the app's own functions. `grep -c "Input.dispatch" j5.mjs` is 0. A pointer-events guard stylesheet keeps the real cursor from hovering anything. Every run ended by asking the launched app to close (31 of 31 driver logs).
- **Real renders looked at.** Per theme: grid at 1x, 1.5x (Sergei's scale) and 1024 x 700; hover on CALCULATOR; scrolled one row and to the end; edit mode; filter chip; update bar; settings; skin picker open; descender, digit and Cyrillic crops; 6x crops of both window corners; **true 1x rasters of the banner icon, banner motif and header art, magnified nearest-neighbour for the "reads at a glance" test**; real application icons on every plate.
- **Two of my own tool bugs, fixed before any number was used.** (1) The first overlap probe read 1188 px in ff6 because its art-off override dropped the gradient banner surface (the spec's 0.4 says to keep it); I fixed the override to keep the theme's own bottom gradient layer and re-ran all 7 themes. (2) My first rendered-contrast sampler took the border ring or a bold glyph as the "ground" on gradient surfaces and printed false lows; I replaced it (ground sampled beside the text, or the most common non-ink colour inside the inset box), re-ran, and the lows were gone. Only the final runs are reported.

## 2. Does it match the spec? Measured

**Machine diff against the spec text.** For each theme I extracted the `:root` block, the rules block and all 7 SVG sources from the spec, substituted the 7 `@NAME@` placeholders with the data URIs as the spec encodes them, and compared with the built file: **all 7 are identical** (the only allowed difference is the file's leading comment). Positive control: one hex changed in a copy is reported in all 7. So every spec table, colour and SVG is what was built; that is why the rest of this section re-measures instead of trusting the tables.

**`app.js`.** `THEME_BANNERS` equals the spec's block for all 7 keys (ff6 3, ff7 3, ff8 3, ff9 3, ff10 2, ff14 2, ff15 2 lines); the other **94 keys are unchanged** against HEAD (101 keys before and after). The comment above the object still says "(3 per theme)" (carried since batch 1, B3R F6, B4R F2).

**Gate and statics.** `node scripts/check-theme-contrast.js` (no rebaseline): **101 checked, 0 errors, 36 legacy warnings**; none of the seven is in the warning list. Static greps on the seven files: 0 `infinite`, 0 `@keyframes`, 0 `animation:`, 0 `will-change`, 0 `backdrop-filter`, 0 literal `\A` (fixed-string search), 0 `!important`, 0 CR bytes; the only `rgba(` is the no-op `--tile-icon-glow`; no `content` string except `''`. Runtime: loops at capture 0 in all 7, `#app::after` none, `#particles` has no background, `scrollbar-gutter: stable`, 0 console errors.

| Theme | Title edge, spec / measured at 424, 640, 1024 (gate 156) | Fonts actually rendered | Widest banner line ends at x (spec) | Lowest rendered text contrast, 59 to 62 roles (declared / rendered) | Overlap, art-over-content, keep-out in 13 unscrolled states | Planted-block control | Real-icon loss, GlideX on the plate |
|---|---|---|---|---|---|---|---|
| ff6 | 146.47 / 146.47 | Georgia, Segoe UI Semibold, Segoe UI | 243.3 (243.3) | 6.59 / 6.64 | 0 / 0 / 0 | 295 px | none (no clip) |
| ff7 | 128.77 / 128.77 | Bahnschrift | 256.5 (256.4) | 4.96 / 7.60 | 0 / 0 / 0 | 275 px | 6.6% |
| ff14 | 138.52 / 138.52 | Cinzel (web), Segoe UI Semilight, Segoe UI | 196.5 (196.4) | 5.95 / 6.13 | 0 / 0 / 0 | 261 px | none (no clip) |
| ff8 | 143.30 / 143.30 | Jost (web) | 123.1 (123.1) | 5.81 / 6.21 | 0 / 0 / 0 | 212 px | none (no clip) |
| ff9 | 123.19 / 123.19 | Gabriola, Constantia | 253.9 (253.9) | 5.49 / 5.52 | 0 / 0 / 0 (strict: 3 px, see ruling 2) | 266 px | 8.8% |
| ff10 | 142.72 / 142.72 | Segoe UI Semilight, Segoe UI | 146.9 (146.9) | 5.60 / 6.03 | 0 / 0 / 0 | 200 px | 15.0% |
| ff15 | 143.30 / 143.30 | Jost (web) | 235.1 (235.1) | 6.71 / 5.88 | 0 / 0 / 0 | 211 px | 3.1% |

The 13 unscrolled states are 424 x 300, 640 x 420, 1024 x 700, chip, edit, update, edit plus update, and a focus ring on the first column (424) and the last column (424, 640, 1024). The planted-block control (a magenta block over the title in the art layer) reads 200 to 295 px, so the probe can fail. All 36 banner line checks (18 lines x 2 widths) fit on one line at 424 and 640. Tile height 95.39 px and label height 14.39 px in all 7 at every scale and scroll tested (ff8 and ff15 do not show the 0.01 px the spec expected). Window clips: **0 clipped content corners** in grid, settings, edit and update at 424 x 300 in all 7 (the magenta-corner control reads true in the four themes that have a rounded window, ff6, ff14, ff9 and ff10; it cannot read true in ff7 and ff15, which are square, or ff8, which cuts only one corner).

**Rendered text contrast** is the real pixels, not the tables: lowest 5.52 (ff9, the filter chip's clear mark) up to 7.60, nothing under 4.5 in any state I could see (28 to 31 roles per theme sit under another panel or outside the 424 x 300 view and were skipped).

**Descenders.** 54 samples per theme ("gypsy Yy jq" in six labels, 1x, 1.5x and 2x, scroll 0, 37 and 81), the label as built against the same label with `overflow: visible`, rows below the box: **0 in all 7**. One exception explained: ff6's very first capture after boot read one row in label 0, and ff6 re-run as the second theme of a launch read 0 over all 54 samples; this is the first-capture artifact B4R section 8.2 already isolated, not the clip.

**Colour discipline** (spec "Done when" 6, art zones at 1x: both bands, top course, header line and scene, banner icon, motif and top strip): every forbidden hue family reads 0 in all 7. The one hit is ff9: 28 px of dark anti-aliased blends at the castle roofs' edges (e.g. `91,47,69`), every one within 2 px of a red-roof pixel, so palette, not paint. The scan can fire (positive control: the ff7 orb scanned for green reads 190 px).

**Figures and Cyrillic.** "7-Zip 23.01" renders lining in all 7, including Constantia italic in ff9. "Жёсткий диск" renders with no missing glyph in all 7.

**Banner lines.** The three single-source lines were re-checked by web search: Setzer "My life is a chip in your pile." (quotes.net prints "My life is a chip in your pile. Ante up!"), Locke "I prefer the term treasure hunting!" (quotes.net, Wikiquote) and Regis "A king pushes onward always" (Episode Ignis, the line continues "accepting the consequences and never looking back"). All three confirmed. The sources were search results, not fetched pages.

## 3. Rulings on Ender's four deviations

1. **Real-icon corner loss on the shaped plates: ACCEPT ff7, ff9 and ff15; FIX ff10 (F1).**
   - **Numbers.** My independent measure (GlideX full-bleed square, drop shadow off, cut against uncut): ff7 270 px² (6.6%), ff9 361 px² (8.8%), ff10 614 px² (15.0%), ff15 126 px² (3.1%). Three match Ender. ff7 differs (his 191): a full-bleed square on an 18% octagon loses exactly four triangles of 11.5 px legs, 4 x 66.4 = 265 px², so mine matches the geometry and his is low; harmless to the ruling. ff6, ff8 and ff14 lose 0 on every icon (no clip).
   - **What the loss is.** I looked at seven real icons on the plates, as built: GlideX, the foobar2000 FB2K file icon, QuickLaunch's own `icon.png` (a laptop), ASUS Virtual Pet, Vortex, and two Bitdefender icons (the two icons I did not view, BlueStacks and Android Studio, measure 0.6% and 0% on ff10 by number). **ff7, ff9 and ff15: every mark whole**; the loss is the blue or red background corners only (the cat ears on ff9's arch are intact, the G is whole, the laptop is whole on ff7). **ff10: the place marks are cut.** The 28 px clip takes the lower-left foot of the **F** and the lower-right leg of the **K** off the FB2K icon (about 2 CSS px at the black band's two bottom corners), and it shaves the ends of **QuickLaunch's own laptop icon** (the base's left and right ends, the right-hand foot and the top corners; `sheets\FF10-qlicon-28-24-20.png`). Both still read, but they are cropped glyphs on real icons, and the spec's own ff10 "Done when" 5 says "no cropped glyph", the standard I accepted batch 4 on.
   - **Lever, proven in the running app (a probe stylesheet only; no file edited):** `--tile-icon-shape: inset(0 round 20px)` on ff10. Art loss as a share of the plate (drop shadow off, as built / 24 px / **20 px** / 13 px): GlideX 15.1 / 10.7 / **7.0** / 2.1, FB2K 4.1 / 2.3 / **1.1** / 0.1, QuickLaunch icon 4.0 / 2.1 / **0.9** / 0.0, Bitdefender app icon 13.0 / 8.6 / **4.9** / 0.3, Bitdefender trackers 16.0 / 11.6 / **7.9** / 3.1, Virtual Pet 1.0 / 0.2 / **0** / 0, Vortex 0.3 / 0.0 / **0** / 0. Viewed at 20 px: the **F and K are whole**, the laptop is whole bar a sliver at its two base corners, both Bitdefender marks whole, G whole. 20 px is still 31% of the plate, above the app's own 21% rounding, so the plate cut stays visible (the spec's 13 px lever is below 21% and would show nothing). 24 px I measured but did not view. The same icons on ff7, ff9 and ff15 need no change. One measurement was discarded: the very first capture after boot read GlideX 16.9% on ff10, then 15.05% twice, the first-capture artifact B4R section 8.2 isolated.
2. **ff9 shows 3 px inside its rounded corner: ACCEPT.** The strict overlap reads 3 px, identically in every state: x 0, y 10 to 12, which is where the window's 14 px clip curve crosses the left edge (the curve is at x 0.6 at y 10), so the pixels are the anti-aliased clip edge. Art delta 45, 26 and 11 levels, content delta 12, 13 and 6, all under the spec 0.4 corner tolerance (60 levels, inside the clip radius + 2 px square). Tolerant overlap 0.
3. **"Жёсткий диск" ellipsizes in ff7's caps: ACCEPT.** Spec 2.2 states it, and it is the base 100 px label box (B4R offer b), not an ff7 defect. It is the only one of the seven that cuts it ("ЖЁСТКИЙ ДИ…"); ff6, ff14, ff8, ff9, ff10 and ff15 fit. It is 2 px over: natural width 102 px in a 100 px box. I measured a one-value lever (offer a below), not applied.
4. **Two flag flips are not one-liners: ACCEPT, the gap is my spec's.** Ender is right: the spec names "a plain gold gear" for flag 2 and "a gentler Squall line" for flag 5 but draws no gear and names no checked line. The other flips are mechanical: flag 3 is two values per theme (the variable in `:root` and the banner `text-shadow`: ff6 lines 50 and 133, ff7 48 and 131, ff9 48 and 133), flag 4 is deleting `.app-tile:focus-visible { outline-color: #4E9FE0; }` (ff14 line 124). One more that is not a one-liner and was not on his list: flag 1 "translucent" for ff10 needs new alpha values and a 4.5:1-over-white re-check. Sergei has since left the flags to me (section 10): the glove stays, so no gear is needed, and the swap is specified in full as F5 (checked line, one array entry).

## 4. Do the icons read at a glance? (true 1x raster, magnified nearest-neighbour, judged before 6x)

| Theme | Banner icon reads as | Header art reads as | Banner motif reads as |
|---|---|---|---|
| ff6 | **A white pointing glove** (thumb up, index out, gold cuff). No mitten read. | Three meshing gears on rails | An airship over two clouds |
| ff7 | **A green glass orb** in a steel socket. Second read: a green status lamp (spec watch 2); the skyline beside it settles it | A pipe with a green vial | A reactor plant (central tower, two drums) |
| ff14 | **A blue crystal on a gold ring.** Second read: a gem on a ring; a fan reads the aetheryte | Three hotbar slots | A segmented gauge (reads as a progress bar, as intended) |
| ff8 | **A moon** (pale disc, four craters) | Slashes and a crescent | A moon with a sweeping trail |
| ff9 | **A crystal.** The two side shards are 1 to 2 px of dim blue at 1x, so it reads as one pale gem | A marionette bar (also reads as a hanging scale or mobile) | A castle with two red-roofed towers |
| ff10 | **A water drop over ripples** | A node network with one gold node | A larger network over ripples |
| ff15 | **A flame.** The crossed logs are brown on a near-black glow and nearly vanish, so it reads as fire rather than specifically a campfire | A campsite (pines, a tent, a small flame, stars) | A road to a sunset over a mountain line |

Seven side by side at 1x (`sheets\SQUINT-1x.png`): they read as one family (four blue windows, an aqua one and two charcoal ones) and each is distinct. **My squint, title and banner text covered:** ff6 4, ff7 4, ff14 3, ff8 3, ff9 4, ff10 4, ff15 3. The spec expected 4, 4, 4, 3, 4, 4, 3, so ff14 is one lower: gold on charcoal is near XV, and the hotbar is what separates it.

## 5. Red-team findings, by theme

Severity words: **Fix** (changed before this is called done), **Note** (real, cheap to leave, Sergei may want it), **Offer** (outside the batch, not asked for, not fired).

- **ff6.** Reads as the SNES menu window: royal-blue panels, gold rails with rivets, gear teeth, glove, airship. Nothing overlaps. **Note:** the hover cue is mostly hue (light-blue border to gold is only 1.08:1 in luminance), carried by the purple fill; visible in the render, not strong.
- **ff7.** Steel pipes with mako dots on every edge, vial, orb, Midgar skyline, octagon plates, hard label drop. **Note:** the orb's second read is a status lamp (lever is in the spec watch item). Ruling 3.
- **ff14.** Reads as a charcoal MMO window with duty-gold hairlines and brackets. **Note:** hover is the quietest in the batch (the same gold, only lighter: border 1.63:1, fill 1.12:1); distinct in the render, but a 1 px cue. The crystal-blue keyboard ring is clearly visible on the gold border (checked on the last column). Squint 3 (section 4).
- **ff8.** Icy hairlines, slashes, a moon twice (header crescent and banner), blue and red stripes on hover. The cut corner clips nothing. Nothing to fix.
- **ff9.** Blue windows in a wooden stage frame, red valance, brass scrolls, castle. **Note:** the valance is still the loudest piece of the kit (spec watch 3). Edit mode: the remove button's circle is trimmed by the 16 px arch at the top right of every tile (spec open item 8); whole cross, legible.
- **ff10.** Dark water, node-and-line rails, drop, rounded plates. **Fix F1** (ruling 1: the near-circle plate shaves real icons, including QuickLaunch's own). The rails' beads read as beads at 1x, not noise.
- **ff15.** Charcoal with pale outlines, road dashes, campsite, road to a sunset. **Note:** the logs of the campfire icon are invisible at 22 px (brown `rgb` on `#23211F`); lever is a lighter log fill, not a new icon. The tile outlines are the brightest borders of the batch (spec watch 4, lever `#8A9099`).
- **All seven.** The scrolled states are the one place the probe shows overlap (tiles slide over the top course, spec 0.1.1 working as designed). Art painted over a tile reads 0 px for the three square-tile themes (ff7, ff8, ff15) and 6 to 64 px for the rounded ones (ff6 42, ff9 13 and 64, ff10 13 and 33, ff14 6), which is the course showing through each tile's own transparent rounded corners, the same pattern as batch 4. Looked at in the crops: tiles pass over the course and the art never covers a tile.

## 6. Optional extras (listed, not fired)

- **a. ff7 label tracking.** `--tile-label-spacing: 0.8px` to `0.5px` makes "Жёсткий диск" fit (102 to 98 px of 100). Measured: "Диспетчер задач" (122 to 118) and "Visual Studio 2022" (126 to 120) still cut at 0.5 px. Sergei's call.
- **b. Label box is 100 px (base).** Uppercase and wide faces cut common names; carried from B4R offer b.
- **c. One base rule for the descender fix.** `.tile-label { overflow: clip; overflow-clip-margin: 3px }` is now proven in 9 themes (orks and eldar from batch 4, all seven here); a single `base.css` rule would cover all 101. Only those 9 are measured.
- **d. Stale comment** above `THEME_BANNERS` ("3 per theme"; now 2 to 3).
- **e. Edit-mode remove button** is clipped at the tile's top and right edge in every theme (base behaviour, seen again on the four shaped plates).
- **f. A faint darker wedge** where the base `drop-shadow` fills a cut plate corner (visible under ff9's bottom corners at 6x; invisible at 1x).
- **g. ff15 campfire logs and ff14 hover.** A lighter log fill (g) and a doubled border on hover, `box-shadow: inset 0 0 0 1px #E0C48A` (h). Neither is a bug.
- **h. `'Segoe UI Semilight'`** is not a resolvable family name (spec 0.7); shipped themes that name it render Regular. Carried.

## 7. Not verified

- Only nine distinct real icons were tried (Ender's six files, five distinct, plus four of mine); seven viewed on the shaped plates, BlueStacks and Android Studio by number only. Square-cornered real icons beyond these could still lose a corner on ff7, ff9, ff15 and, until F1, ff10.
- The hidden-tiles sigma shot was not rerun. No theme has a texture layer (`#app::after` none, `#particles` no background), so 0.00 holds by construction.
- The updater error bar did not appear in any run. One machine; my "1.5x" is emulated scale on a 150% panel, so real LCD fringes can differ. The squint scores are my read, not a fan test.
- The packaged installer was not built or launched; I tested Ender's scratch build (identical `src`).
- Banner lines: three re-checked by search (section 2); the other 15 rest on the spec's own verification. The new ff8 line (F5) rests on one fetched page (Wikiquote); IMDb returned 403 on fetch and its sibling line is a search excerpt.
- **The ff14 squint lift in F6 is my read of a render, not a fan test**, and was measured after the display scale changed (section 8), so its probe numbers are a same-session comparison against the unchanged build.
- Sergei's eyes on the Note-level reads (ff7 orb, ff9 shards, ff14 squint, ff15 logs).

## 8. Process and cleanup

- **Browsers.** I started no headless or mock browser this session: the driver attaches to the app that `quicklaunch-safe-launch.mjs` launched and ends. `msedge.exe` processes whose command line contains this session's scratchpad path: **0 at the start, 0 at the end** (`edge-list.ps1`, list and kill by PID, never by image name; the final run with kill enabled read `FOUND=0 KILLED=0 REMAINING_TAGGED=0`, and no `msedge.exe` of any kind was running on the machine). **Killed: 0.** The earlier leak (batch 4 and 5 spec mocks) is gone.
- **Processes left from the 31 launches: 0** (each launcher reported `remaining 0`). Sergei's QuickLauncher (PID 4916 plus children 6868, 32776, 33280) untouched.
- **Display scale shifted mid-session (disclosed).** The runs up to 08:59 (everything in sections 2 to 7) read the unchanged builds crisp: header line pixel `185,151,91`, A/B/C overlap 0. By 09:30 the same unchanged ff14 renders 1 px lines half-blended (header line pixel `109,93,67`) and the probe reads 16 px at the header corner row (y 40, x 1 to 4). The window now opens on a monitor at 150% (`devicePixelRatio` 1.5, screen 5120 x 1440 CSS px, window at 4676,1072). Cause: environment, not the build or the patch: a plain run, a run with the built rule as the probe base and a run with the patch all read the same. The F6 test is therefore patched against unchanged in the same session. Measurements that do not depend on 1 px alignment (contrast, label widths, icon loss, banner-line fit) were unaffected; I did not re-run the 13-state probe on the other six themes after the shift.
- **Scratch.** Driver, scripts and every capture are under `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\890801c3-8abf-4cee-b670-698e2f31ad7c\scratchpad\judy-review\out5\` (`j5.mjs`, `run5.sh`, `specdiff5.cjs`, `banners5.cjs`, `digest5.cjs`, `hue5.cjs`, `r\<theme>\`, `sheets\`).

## 9. Crops to show Sergei

All under `...\scratchpad\judy-review\out5\sheets\`:
- `SQUINT-1x.png` (all seven at 1x), `ICONS-1x-NN12.png` (the seven banner icons from the true 1x raster), `HEADERART-1x-NN6.png`, `MOTIFS-1x-NN6.png`
- `HOVER-row1.png`, `edit-A.png`, `edit-B.png`, `settings-A.png`, `settings-B.png`, `update-bars.png`, `picker-A.png`, `GRID1024-A.png`, `CHIP-headers.png`
- `FF10-lever-28-vs-20.png` (six real icons, top row as built, bottom row at 20 px: the F and K feet), `FF10-qlicon-28-24-20.png` (QuickLaunch's own icon at 28, 24 and 20 px), `RI-glidex-asbuilt.png`, `RI-foobar-asbuilt.png`, `RI-ff7-ff9-ff15-six.png`, `RI-edit.png`
- `ELLIP-rows.png`, `CYR-rows.png`, `DIGITS-6x.png`, `FF14-fix-banner-1x-NN3.png` and `FF14-fix-motif-1x-NN6.png` (F6, top as built, bottom patched)

## 10. Flag rulings (Sergei: "decide yourself, what will be more beautiful")

| # | Flag | Pick | Built the same? | Why, one line |
|---|---|---|---|---|
| 1 | ff10 window | **Opaque** | yes | The aqua rails, the gold node and the ripples are this theme's beauty and need a steady ground; a 0.90 window lets any wallpaper muddy those hairlines, and every redesign since batch 3 is opaque, so the family stays one family. |
| 2 | ff6 banner icon | **Glove** | yes | At the true 1x raster it reads as a white pointing glove, the SNES and PS1 menu cursor and the one object a fan knows from a menu; a gold gear would only repeat the three header gears and the gear teeth. |
| 3 | Hard label drop (ff6, ff7, ff9) | **Keep** | yes | One hard 1 px black drop, no blur, gives the cream labels the crisp console-menu edge on the lightest gradient stop and is the one trait every FF menu shares; it is an offset, not a halo. |
| 4 | ff14 keyboard ring | **Blue** | yes | A gold ring would vanish into the gold slot borders; crystal blue is the theme's one cool note (already in the hotbar and the aetheryte), and it reads cleanly on the last-column crop. |
| 5 | ff8 third banner line | **Swap** | **no, F5** | "Chicken-wuss." is a schoolyard taunt in the coolest, thinnest window of the batch; Squall's "Everything will be fine now..." completes the cold, bright, warm arc of the three lines and sits well under the moon trail. |

**Source and fit of the new ff8 line.** Wikiquote's Final Fantasy VIII page (fetched) prints, for Squall, "Everything will be fine now... Because I'm not alone." and two more short sentences after it. The banner keeps the first sentence, 5 words, with its ellipsis (the same way "...Whatever." keeps its dots). IMDb lists a sibling line from the same scene that ends on the same clause (search excerpt; the IMDb page returned 403 on fetch). So the wording rests on one fetched page. Measured in the real app (Jost 300, 12 px, 0.6 px tracking): the ink ends at x 206.3 at both 424 and 640, 113.7 px before the text box edge (x 320), one line. The two other ff8 lines are unchanged.

**ff14 squint, 3 to 4.** My squint of the build is 3 because gold hairlines on charcoal are near FF XV, and the one object that is unmistakably XIV, the aetheryte, is only a 22 px icon. F6 makes it the banner's end motif (a 30 px crystal over its ring) next to a shortened limit gauge, so the header hotbar and a large blue crystal over a gold ring appear together. In the running app (same-session control against the unchanged build): overlap in the banner 0 px in the nine states that record it (three sizes, chip, edit, update, edit plus update, scrolled one row and to the end), keep-out 0 px in all 13, and the four focus-ring states read 16 px, identical to the unchanged control (all of it in the header row, see section 8); art painted in the banner zone 2405 px to 2307 px; the real gate on the patched file with the other six themes: 7 checked, 0 errors (negative control, one `--text-dim` broken, fails). Crops: `sheetsFF14-fix-banner-1x-NN3.png` and `sheetsFF14-fix-motif-1x-NN6.png` (top as built, bottom patched). Whether it reaches 4 is my read; it is Sergei's eye that settles it.

**Verdict:** CHANGES REQUESTED

1. **F1, ff10 (Ender, required, one value).** In `ff10.css` line 43 change `--tile-icon-shape: inset(0 round 28px);` to `--tile-icon-shape: inset(0 round 20px);`. Nothing else in the file or the batch changes. Why: at 28 px the FB2K file icon's **F** and **K** feet are cut off and QuickLaunch's own laptop icon is shaved at the base ends (spec "Done when" 5, "no cropped glyph", fails on real icons). Done when: with the FB2K icon (`C:\Program Files\foobar2000\icons\generic.ico`) and QuickLaunch's `icon.png` on a plate, the F and K are whole and the laptop is whole bar a sliver at the base corners, at 6x; GlideX keeps its G whole; the plate is still visibly shaped (above the app's own 21%); `npm run check:contrast` still 101 checked, 0 errors (no colour touched). Judy re-checks with the same icons and the 6x crops.
2. **F2, `app.js` comment (Ender, could).** "(3 per theme)" above `THEME_BANNERS`; the lists now run 2 to 3. Comment only. Carried from batch 1.
3. **F3, spec text (Judy, with F1, F5 and F6).** Update ff10's plate shape and its "Done when" 5 in the batch-5 spec to the F1 value, add real-icon plates (FB2K, QuickLaunch's own icon) to the spec's plate-margin check, replace the ff8 entry in the spec's `THEME_BANNERS` block and banner table (F5), and, if F6 lands, the ff14 `motif` SVG and its banner paragraph. Not done here.
4. **F4, for Sergei (no code), decide only if he sees them.** ff7 orb reads as a status lamp, ff9 crystal shards are faint, ff14 squints at 3 (F6 is the lever), ff15 campfire logs vanish. His five flags are decided in section 10; offers a to h in section 6 are not fired.
5. **F5, ff8 banner line (Ender, required, one array entry).** In `app.js`, `THEME_BANNERS`, replace the `'ff8'` entry with exactly this (only the third string changes; the other 100 keys stay as they are):

```js
  'ff8': [
    '...Whatever.',
    'Booyaka!',
    'Everything will be fine now...',
  ],
```

   Source and fit are in section 10. Done when: at 424 and 640 the line shows on one line in the banner (`scrollWidth <= clientWidth`; ink ends at x 206.3), and `THEME_BANNERS` still equals the spec's block for the other six keys. No CSS changes. Judy updates the spec's `THEME_BANNERS` block and its ff8 banner table with F3.
6. **F6, ff14 banner motif: gauge plus a large aetheryte (Ender, should; lifts my squint from 3 to 4).** In `ff14.css`, in the `#theme-banner { background: ... }` rule, replace only the first `url("data:image/svg+xml,...")` (the 84 x 34 layer followed by `right 12px bottom 0 / 84px 34px no-repeat`) with the encoded value below. Nothing else changes: the diff against the build is that one line, no colour token is touched. Readable source (single-quoted attributes, `rgb()` colours, no text, no animation; the only `#` is the gradient reference, encoded `%23g`):

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

   Encoded (`<` as `%3C`, `>` as `%3E`, `#` as `%23`, newlines removed; paste as the replacement for the first `url(...)`):

```css
url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 84 34'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0.2' y1='0' x2='0.8' y2='1'%3E%3Cstop offset='0' stop-color='rgb(160,214,252)'/%3E%3Cstop offset='1' stop-color='rgb(40,110,196)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M4 12 H51' stroke='rgb(112,88,48)' stroke-width='0.8'/%3E%3Cpath d='M27.5 9.8 L29.7 12 L27.5 14.2 L25.3 12 Z' fill='rgb(224,196,138)' stroke='rgb(112,88,48)' stroke-width='0.5' stroke-linejoin='round'/%3E%3Crect x='4' y='16' width='15' height='7' rx='1.4' fill='rgb(24,22,32)' stroke='rgb(185,151,91)' stroke-width='0.8'/%3E%3Crect x='5' y='17' width='13' height='5' rx='0.8' fill='rgb(185,151,91)'/%3E%3Crect x='5' y='17' width='13' height='1.4' fill='rgb(224,196,138)' fill-opacity='0.6'/%3E%3Crect x='20' y='16' width='15' height='7' rx='1.4' fill='rgb(24,22,32)' stroke='rgb(185,151,91)' stroke-width='0.8'/%3E%3Crect x='21' y='17' width='13' height='5' rx='0.8' fill='rgb(185,151,91)'/%3E%3Crect x='21' y='17' width='13' height='1.4' fill='rgb(224,196,138)' fill-opacity='0.6'/%3E%3Crect x='36' y='16' width='15' height='7' rx='1.4' fill='rgb(24,22,32)' stroke='rgb(185,151,91)' stroke-width='0.8'/%3E%3Crect x='37' y='17' width='6.5' height='5' rx='0.8' fill='rgb(78,159,224)'/%3E%3Crect x='37' y='17' width='6.5' height='1.4' fill='rgb(224,196,138)' fill-opacity='0.6'/%3E%3Cpath d='M4 27 H51' stroke='rgb(112,88,48)' stroke-width='0.8'/%3E%3Cpath d='M4 25.4 L5.6 27 L4 28.6 L2.4 27 Z' fill='rgb(185,151,91)' stroke='rgb(112,88,48)' stroke-width='0.4' stroke-linejoin='round'/%3E%3Cpath d='M51 25.4 L52.6 27 L51 28.6 L49.4 27 Z' fill='rgb(185,151,91)' stroke='rgb(112,88,48)' stroke-width='0.4' stroke-linejoin='round'/%3E%3Cpath d='M57.5 22 A10.5 3.4 0 0 1 78.5 22' fill='none' stroke='rgb(112,88,48)' stroke-width='1.2' stroke-linecap='round'/%3E%3Cpath d='M68 2.6 L74.6 14.6 L68 27.4 L61.4 14.6 Z' fill='url(%23g)' stroke='rgb(28,84,150)' stroke-width='0.9' stroke-linejoin='round'/%3E%3Cpath d='M68 2.6 L64.7 14.6 L68 27.4 Z' fill='rgb(170,214,250)' fill-opacity='0.55'/%3E%3Cpath d='M57.5 22 A10.5 3.4 0 0 0 78.5 22' fill='none' stroke='rgb(224,196,138)' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E")
```

   Painted bounds (from the SVG, text box unchanged): gauge x 330.4 to 380.6, aetheryte x 384.9 to 407.1, y 268.2 to 294.6 at 424 x 300; the first painted pixel stays at 330.4 (spec 330.1), so the 133.9 px clear of the widest ff14 line holds. Done when: at 1x the banner shows a three-segment gauge and a blue crystal over a gold ring at its right end; overlap and keep-out read 0 px in the 13 unscrolled states against an unchanged control run in the same session; `npm run check:contrast` still 101 checked, 0 errors. Judy judges the 1x crop. Both aetherytes (icon left, motif right) is repetition on purpose, as ff8's moon.

## 11. Re-check of F1, F2, F5 and F6 (Judy, 2026-10-01)

Scope: only the four fixes Ender applied and the F3 spec update (mine). Nothing in the repo was edited except the spec (F3) and this section; no commit, no push. The six `warhammer*.css` files and the new font that a separate Ender run is adding to this tree were ignored.

### 11.1 What was tested, and on what

- **Hashes (plain `sha1sum`), at the start and again at the end.** `app.js` `1ea9ffc2`, `ff10.css` `a5dc9582`, `ff14.css` `1fc0fac2` as expected; `ff6` `e914375a`, `ff7` `75f0f318`, `ff8` `c30c62c4`, `ff9` `e85baad8`, `ff15` `f8e87ebc` unchanged from the review.
- **The build under test is the tree.** I extracted `batch5-fix\build\win-unpacked\resources\app.asar` myself with the repo's `@electron/asar`; `diff -rq` of its `src` against the working tree printed nothing (checked before the Warhammer edits showed up in `git status`). Against Ender's saved pre-fix copies (the exact bytes I reviewed: `app.js` `2aee50b1`, `ff10.css` `3b30acc7`, `ff14.css` `3e48ca8d`): `app.js` differs on 2 lines (the comment and the ff8 string), `ff10.css` on line 43 only, `ff14.css` on line 128 only. `ff8.css` is untouched.
- **Launches: 10, every one through `node scripts/qa/quicklaunch-safe-launch.mjs` from the studio root, each on a fresh temp profile with the 14 mock tiles; 8 ended `RESULT: PASS`, 0 processes left in all 10.** The two `FAIL (startup keys changed)` (the first two launches) were Docker Desktop writing its own `Run\Docker Desktop` and then `StartupApproved\Run\Docker Desktop` values while the run was going; QuickLauncher has no value in either key, the launcher's own diff names only the Docker Desktop values (and notes that Sergei's instance ran meanwhile, so it cannot attribute a change), and both keys read 14 and 26 values, unchanged, in all 8 launches after. The second of them was stopped early by the launcher and its driver was cut, so no number comes from it; the first measured the same ff10 numbers as the clean launch 10, and I used launch 10. One of the 8 passes (a two-theme run) had its driver cut by the launcher's own timeout because I planned too long a probe; no number comes from it, I split it into single-theme runs. Sergei's instance (PID 4916 and its three children) ran throughout and was never touched; no `taskkill /IM`.
- **Port ownership proven before the driver ran.** For every run the driver started only after that profile's own `DevToolsActivePort` named the chosen port (ports 12039 to 12361, all matched).
- **No synthetic input, no browser started.** `grep -c "Input.dispatch"` on the driver is 0 (it uses `Runtime.evaluate`, `CSS.forcePseudoState`, `Emulation`, `Page.captureScreenshot`). I started no headless or mock browser, so `headless-browser.mjs` was not needed; there is no `msedge.exe` on the machine (the 24 `msedgewebview2.exe` processes are other apps').
- **A same-session control.** The unchanged build (`batch5\build`, whose `src` equals the pre-fix tree) was launched the same way for ff14 and ff10, so every "before" number below was measured in this session, not quoted.

### 11.2 F1, ff10 plate 28 px to 20 px: PASS

Share of the plate lost to the cut (GlideX-style full-bleed measure: drop shadow off, cut against uncut, the same driver as the review):

| Icon | 28 px (control, this session) | 20 px (fix) | Review's predicted 20 px |
|---|---|---|---|
| GlideX | 15.05 % | **6.99 %** | 7.0 |
| FB2K file icon | 4.05 % | **1.09 %** | 1.1 |
| QuickLaunch `icon.png` | 3.95 % | **0.86 %** | 0.9 |
| Virtual Pet | 0.91 % | 0 | 0 |
| Vortex | 0.31 % | 0 | 0 |
| Bitdefender app icon | 12.97 % | **4.90 %** | 4.9 |
| Bitdefender trackers | 15.99 % | **7.92 %** | 7.9 |

The fix numbers repeat to the digit in the clean launch and in the first one. Viewed (6x as built, and a 28-over-20 sheet of four icons, `FF10-recheck-28-vs-20.png`): at 20 px the **F and K of FB2K are whole**, **QuickLaunch's laptop is whole bar a sliver at its two base corners**, the **G of GlideX is whole**, the Bitdefender app icon is whole (the trackers icon by number only, 7.92 %), and the plate is still visibly shaped (the plate is 64 px, so 20 px is 31 %, above the app's own 21 %; the blue GlideX plate and the red shield plate show clear rounded corners). Ender's two 6x crops (`ff10-fb2k-plate-6x.png`, `ff10-qlicon-plate-6x.png`) show the same. No colour was touched: `npm run check:contrast` reads **101 checked, 0 errors, 36 legacy warnings** (none is an ff theme), as before.

### 11.3 F2, the `THEME_BANNERS` comment: ACCEPT Ender's wording

The line is now `// ── Banner quotes (2 to 6 per theme) ──...` (same width as before, 81 characters). I counted the lists in all 101 keys: **min 2, max 6** (4 themes have 2 lines, 15 have 3, 6 have 4, 74 have 5, 2 have 6), so "2 to 6" is true of the whole object. **My F2 text was wrong:** "the lists now run 2 to 3" described only the seven batch-5 themes, not the 101 the comment sits above; Ender read the object and I did not. A range can go stale if a theme gets 1 or 7 lines; harmless.

### 11.4 F5, ff8 third line: PASS

`THEME_BANNERS['ff8']` equals my block exactly (`'...Whatever.'`, `'Booyaka!'`, `'Everything will be fine now...'`). Measured in the running app (Jost 300, 12 px): the line is on one line at 424 and at 640 (`scrollWidth <= clientWidth`), ink ends at **x 206.3** at both, 113.7 px before the text box edge (320) and 123.6 px before the motif's first painted pixel; the other two ff8 lines unchanged (113.0 and 94.9). The other six keys equal the spec's block, and the other **94 keys equal HEAD** (101 keys before and after). No CSS changed. Viewed at 3x (`r\ff8-fix\linefit-424-3x.png`): one line, the ellipsis draws as three dots, comfortably left of the moon trail.

### 11.5 F6, ff14 motif: PASS

- **Static.** The first `url("data:image/svg+xml,...")` on line 128 is **byte-identical** to the encoded value in F6 (2227 characters, was 1531); the prefix and the rest of the line (the 24 x 7 top course and the gradient) are identical to the pre-fix file; decoded, it has no `<text>`, `<animate>`, `<image>`, `<script>`, `<style>` or `href`, and every colour in it is one the file already uses.
- **Probe against the same-session control** (the A/B/C art-on/off probe, the same 13 unscrolled and scrolled states as the review):

| Reading | Fix | Control | Verdict |
|---|---|---|---|
| Overlap, art over content, keep-out (px), 13 states | 16 / 16 / 0 in the 11 unscrolled states, 904 / 88 / 0 scrolled one row, 880 / 94 / 0 scrolled to the end | identical in every state | **same** |
| Keep-out total | **0** | 0 | same |
| Overlap inside the banner, the 9 states that record it | **0** | 0 | same |
| Art painted in the banner zone, 424 x 300 / 640 x 420 / 1024 x 700 | 2307 / 2901 / 3957 | 2405 / 2999 / 4055 | 98 px less art: the intended change (shorter gauge, small crystal) |
| Planted-block positive control | 304 px | 304 px | the probe can fail |
| Title edge (gate 156) | 138.5 at all three sizes | 138.5 | same |
| Loops at capture, console errors | 0, 0 | 0, 0 | same |

The 16 px in the unscrolled states and the matching figures in the scrolled ones are all in the header row (corner, y 40) and identical in the unchanged control; that is the display-scale reading I disclosed in section 8 (this window still opens on the 150 % monitor), not the motif.
- **Viewed at true 1x** (`FF14-recheck-banner-1x-NN3.png`, top as built, bottom fixed; `FF14-recheck-motif-1x-NN6.png`; and the 1.5x grid, `r\ff14-fix\grid-424-1.5x.png`): the gauge is three segments (two gold, one half blue) between two hairlines and, at its right, **a blue crystal over a gold ring** that reads as the aetheryte at once, the same object as the banner icon at the left. The text line ("Hear. Feel. Think." ends at 142, "A smile better suits a hero." at 196.4) sits clear, about 134 px before the motif. At 1024 x 700 the motif sits at the right edge as before.
- **Squint (my read, not a fan test).** 3 for the first build; with a header hotbar, an aetheryte at each end of the banner and a gold hairline frame I read **4**. Sergei's eye settles it.
- **Two figures in my F6 text were loose, and the spec now has the right ones:** the crystal is about 14 x 26 px over a 21 px ring (not "30 px"), and I wrote that the first painted pixel "stays at 330.4"; by the spec's own method it is **330.1** for both the old and the new motif (the leftmost shape, the lower hairline's left diamond, did not move), so the 133.7 px clearance in the spec holds unchanged.

### 11.6 F3, the spec: done (mine)

`QuickLaunch_ThemeSpec_Batch05_2026-10-01.md` now matches the build; 23 edits, each marked "review F1", "F5" or "F6": ff10 `:root` plate 20 px, its 6.3 D plate paragraph (with the real-icon table) and "Done when" 5 (the FB2K and QuickLaunch icons added), the 0.2 plate-margin row (**real icons added to the check**, with the bar "no mark cropped"), the 0.10 departure row and the watch item and open item 9 about real icons; the ff8 line in the 0.8 table, the fit table (ends at x 206.3, 113.7 and 123.6 px), the `THEME_BANNERS` block, the Summary bullet and flag 5; the ff14 `motif` SVG source, 3.3 C, the Direction, "Done when" 4 and 6, the expected squint paragraph and the at-a-glance row; open item 6 (the comment, F2); and the five flag rulings (opaque, glove, keep, blue, swap). **Machine check:** I re-ran the spec-to-build diff (the `:root` block, the rules block and all 7 SVG sources, placeholders substituted, whitespace normalised): **all seven built theme files are identical to the spec text**, with the one-hex positive control detected in all 7 (before the edit it differed in exactly two: ff10 on the plate value and ff14 on the motif). The spec's `THEME_BANNERS` block equals `app.js` for all 7 keys.

### 11.7 Not verified, notes

- **Docker Desktop** added itself to `HKCU\...\Run` and `StartupApproved\Run` on this machine while I worked (two launcher FAILs above). Not QuickLaunch's doing; Sergei may want to know Docker Desktop now starts with Windows.
- The 150 % display reading (section 8) is still in force, so the "overlap 0 px at the header corner" cannot be shown on this display for any ff14 build; the control is the comparison.
- Squint 4 for ff14 is my read of a render. The packaged installer was not built or launched; I tested Ender's scratch build, whose `src` equals the tree.
- Offers a to h in section 6 and the Note-level reads in F4 (ff7 orb, ff9 shards, ff15 logs) are unchanged and not fired; F4 stays with Sergei. Sections 1 to 10 stand as written (they describe the build before the fixes); F1, F2, F3, F5 and F6 are closed by this section.
- **Files** (all under `...\scratchpad\judy-review\out5\recheck\`): driver `j5r.mjs`, `run5r.sh`, `applyF3.cjs`, `spec-before-F3.md`, runs `r\ff10-fix`, `r\ff10-control`, `r\ff8-fix`, `r\ff14-fix`, `r\ff14-control`, sheets `sheets\FF10-recheck-28-vs-20.png`, `sheets\FF14-recheck-banner-1x-NN3.png`, `sheets\FF14-recheck-motif-1x-NN6.png`.

**Verdict:** APPROVED
