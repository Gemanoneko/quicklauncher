# QuickLaunch theme review, batch 4 (Judy, 2026-10-01)

Reviewer: Judy. Branch `wip/theme-fidelity`, HEAD `e8866e0` plus Ender's uncommitted working tree (`app.js` and six `warhammer*.css`). Read red-team: the job was to find what is off against the spec and the source art, not to balance it. Nothing in the repo was edited, committed or pushed; this file is the only thing written, and it is left uncommitted. The regions worktree was not touched.

**In scope:** warhammer-chaos, warhammer-orks, warhammer-tyranids, warhammer-eldar, warhammer-necrons and warhammer (Imperium), against `QuickLaunch_ThemeSpec_Batch04_2026-10-01.md`, plus the batch-4 `THEME_BANNERS` change in `app.js`, plus Ender's four deviations. **Not reopened:** Sergei's five open flags (parchment brightness, Cormorant for Eldar, Tyranid second banner line, Chaos second god colour, Ork label font). Defaults are judged as built.

## 1. What was tested, and on what

- **Tree identity.** `sha1sum -c` of Ender's `tree-src-prebuild.sha1` against the working tree: **133 of 133 OK** (it equals his `tree-src-final.sha1`). I extracted `build\win-unpacked\resources\app.asar` myself (sha1 `76cb01e8ba93e291ce56`, as Ender says) and compared the whole `src` tree with the working tree: **identical**. `git diff --stat` shows exactly the seven named files. What I rendered is what is on disk.
- **Launches.** 21 guarded launches, every one through `node scripts/qa/quicklaunch-safe-launch.mjs` from the studio root, each on a fresh temp profile (14 gallery mock tiles, `startWithWindows` false, `globalHotkey` null, `randomTheme` false), using Ender's scratch build. All ended PASS, 0 processes left, `Run` and `StartupApproved\Run` unchanged. Sergei's instance (PID 4916) was running throughout and was never touched; the installed app was never used; no `taskkill /IM`.
- **No synthetic input.** My driver (`scratchpad\judy-review\out4\j4.mjs`) uses `Runtime.evaluate`, `CSS.forcePseudoState` (hover and focus), `Emulation` (size and scale), `Page.captureScreenshot` and the app's own functions. It sends no `Input.*` events. One in-page DOM `focus` event is dispatched on the skin search to open the picker list (not OS input). A pointer-events guard stylesheet keeps the real cursor from hovering anything.
- **Incident, no harm.** Two launches (profiles j13 and j14) picked debugging ports 9493 and 9495, which other processes already held (not mine). The app's own port did not bind, my driver did only `GET /json/list`, found no page, and exited with code 2 before opening any socket. I then made `run4.sh` choose a free port and refuse to run the driver unless the profile's own `DevToolsActivePort` file names that port. I also checked the earlier twelve launches after the fact: every profile's `DevToolsActivePort` matched the port I drove.
- **Real renders looked at.** Per theme: grid at 1x, 1.5x and 3x (Ender's), hover on CALCULATOR, scrolled one row and to the end, edit mode, filter chip, update bar, settings (top and end), skin picker open, empty library, 1024 x 700, 6x crops of the header art, both banner ends and both window corners, descender crops at five scales, digit crops, real-icon crops. Files are in `scratchpad\judy-review\out4\r\<theme>\` and `...\out4\r\*.png` (sheets).
- **Numbers I measured myself:** title edge at three sizes, platform fonts, every banner line at 424 and 640, rendered text contrast from real pixels (60 to 62 roles per theme, see 2), A/B/C overlap probe with a fourth shot (see 2), window clips with a magenta backdrop, loops at capture, texture layers, a colour-discipline hue scan, descender clipping at 1, 1.5 and 2x and three scroll offsets, all six themes.

## 2. Does it match the spec? Measured

**Machine diff against the spec text.** I extracted each theme's `:root` block, rules block and all seven SVG sources from the spec, substituted the `@NAME@` placeholders with the data URIs as the spec encodes them, and compared with the built file: **all six are identical** (the only difference allowed is the file's leading comment). Positive control: changing one hex in a copy makes the script report the exact difference. So every spec table, colour and SVG is what was built, and what the spec got wrong would also be wrong in the build; that is why sections 2 and 4 re-measure instead of trusting the tables.

**`app.js`.** `THEME_BANNERS` equals the spec's block for all six keys (5, 5, 4, 5, 5 and 2 lines); the other 95 keys are unchanged against HEAD. Leftover: the comment above the object still says "(3 per theme)" (carried from batch 1 and batch 3 F6).

**Gate and statics.** `npm run check:contrast`: 101 checked, 0 errors, 40 legacy warnings (44 at batch 3; chaos left the legacy list, as the spec says); none of the six is in the warning list. Static greps on the six files: 0 `infinite`, 0 `@keyframes`, 0 `animation:`, 0 `will-change`, 0 `backdrop-filter`, 0 literal `\A`; the only `rgba(` is the no-op `--tile-icon-glow`. Runtime: loops at capture 0, `#app::after` none, `#particles` none, `scrollbar-gutter: stable`.

| Theme | Title edge, spec / measured (gate 156) | Fonts actually rendered | Widest banner line ends | Lowest real text contrast (declared / rendered) | Probe: overlap, art-over-content, keep-out, 13 unscrolled states | Positive control (planted block) |
|---|---|---|---|---|---|---|
| chaos | 108.14 / 108.14 | Pirata One (web), Cambria | 231.3 | 5.04 / 5.24 | 0 / 0 / 0 | 377 px |
| orks | 111.27 / 111.27 | Impact, Ink Free, Segoe UI Semibold | 244.2 | 5.03 / 5.37 | 0 / 0 / 0 | 425 px |
| tyranids | 141.89 / 141.89 | Sitka Text | 295.7 | 7.57 / 7.42 | 0 / 0 / 0 | 260 px |
| eldar | 145.28 / 145.28 | Palatino Linotype | 232.6 | 5.23 / 5.64 | 0 / 0 / 0 | 193 px |
| necrons | 128.77 / 128.77 | Bahnschrift | 229.8 | 5.94 / 5.40 | 0 / 0 / 0 | 275 px |
| imperium | 99.44 / 99.44 | UnifrakturCook, Cinzel, IM Fell English (all web), Palatino Linotype | 289.2 | 5.15 / 5.41 | 0 / 0 / 0 | 267 px |

The 13 unscrolled states are 424 x 300, 640 x 420, 1024 x 700, chip, edit, update, edit plus update, and a focus ring on the first column (424) and last column (424, 640, 1024). The planted-control numbers equal Ender's six figures exactly, so we are measuring the same thing independently. All 26 banner lines fit on one line at 424 and 640. Window clips: 0 clipped content corners in grid, settings, edit and update at 424 x 300, with the control corner magenta. Cyrillic names render in Cambria, Ink Free, Sitka, Palatino, Bahnschrift and Palatino plus Cinzel (no tofu); lining figures hold in Sitka (forced), Cambria, Palatino, Cinzel, Bahnschrift and Ink Free.

**Colour discipline** (spec "Done when" 6): hue scan of the art zones at 1x (both bands, top course, header line and scene, banner icon, motif and top strip). Every forbidden hue family per theme reads 0 in all zones. The scan fires in text zones (ClearType fringes), so it can fail.

**Scrolled states** are the one place the probe shows overlap (see ruling 4).

## 3. Rulings on Ender's four deviations

1. **Imperium corner icons, GlideX loses 7.8% of the plate: ACCEPT as built.** I looked at the real crops. The loss is the blue background corners only; the G mark is whole. FB2K (the cat head) keeps its ears, its dog-ear corner and all four letters; only the black band's top corners round off. The same icons on the other plates: chaos 1.95%, necrons 3.89%, orks 4.83%, tyranids 6.37%, eldar 7.51%, no mark cropped in any. The `inset(0 round 13px)` lever stays in the spec as Sergei's call if he ever sees a real icon lose a mark. One thing worth knowing: a full-bleed square icon reads as a house shape on the arch plate. That is the intent.
2. **Descender clipping (Eldar, Orks): FIX, small.** Ender found it; the cause is `base.css` `.tile-label` (`overflow: hidden; line-height: 1.2`), so the clip box ends where the line box ends and the italic tails of g, j, p, q, y poke past it. My sweep (all six themes, the six labels in view, text "gypsy Yy jq", 1x, 1.5x, 2x, scroll 0, 37, 81): **Orks clips 1 to 3 device rows in 2 to 6 of 6 labels at every scale, including Sergei's 1.5x (4 labels, 2 rows at scroll 0)**; **Eldar clips 1 row in 3 labels at 2x and nothing at 1x and 1.5x**; tyranids, chaos, necrons and imperium clip nothing at any scale (caps or a roomy face). A one-row reading on the first capture after boot in two early runs did not repeat in any later run and is discarded. Ender's "about 0.5 px for the Orks g" is right for the g alone; with y and j also shortened it reads as a flat-bottomed word. At 2x the Eldar g loses the bottom of its lower loop (`out4\r\warhammer-eldar\CMP-desc0-2x.png`). It fails the spec's own Orks "Done when" 10 (descenders uncut). **Lever, proven in the running app (probe sheet, no file edited):** `overflow: clip; overflow-clip-margin: 3px;` on the theme's `.tile-label`. Result: 0 clipped rows at every scale and offset tested apart from one single-row residual that also appears with no clip at all (a raster edge, ignore); tile height stays 95.39; label height unchanged; ellipsis intact on "Visual Studio 2022", "Notepad++ x64", "Spreadsheet Editor Pro"; the edit-mode dashed rename underline does not move. I also tried `padding-bottom: 3px; margin-bottom: -3px`: it works but drops the Orks rename underline to 1.5 px from the tile border, so I reject it.
3. **Ink Free digits sit low: ACCEPT.** At 6x ("7-Zip 23.01", "Notepad++ x64", "Visual Studio 20...") the digits are cap-height with bottoms about one device row under the letter baseline, a trait of the hand-drawn face, nothing clipped, nothing overlapping. At 1x the effect is under one pixel. This sits inside Sergei's open Ork-font flag; not a fix.
4. **Tiles pass over the top course when scrolled: ACCEPT.** This is batch 1 section 0.1.1 working as designed: frame art is the container's own background, tiles paint over it, never the reverse. I checked the "never the reverse" half: with the fourth shot (art plus content) the pixels where art and content overlap differ from content-only by 0 px for chaos, necrons and imperium, and by 8 to 100 px for orks, tyranids and eldar. Those few pixels sit in the transparent rounded or crooked corners of the tile itself, where the course shows through the corner (tyranids radius 6 and 20, eldar 18 and 4, orks crooked quad), not art painted over a tile. Looked at in the crops: at one row of scroll (104 px) a 7 px sliver of the previous row sits over the course and the teeth, ribs or arcade show in the gaps. Reads as tiles sliding under the header line.

## 4. Red-team findings, by theme (my squint: 4 each, as the spec expects)

Severity words: **Fix** (changed before this is called done), **Note** (real, cheap to leave, Sergei may want it), **Offer** (outside the batch, not asked for, not fired).

### 4.1 warhammer-chaos
Reads as a black iron window with a hot-red line, teeth hanging from the header and rising from the banner, brass studs and cracks down both sides, three curved spikes on a cracked plate. Nothing overlaps, no green, blue or purple in the art zones. The Pirata One title at 13 px, 1x is legible.
- **Note, the banner icon reads as a spiked wheel before it reads as a collar.** At 22 px it is a brass ring with a dark centre, a red dot and seven spikes: a sawblade or sun. A cog is Mechanicus (Imperium) iconography, but the spikes are pointed, so it does not read as a cog. If Sergei thinks it reads wrong, the lever is the ring `r` and a darker spike fill, not a new icon.
- **Note, the broken bottom-right window corner bites the motif's last pixels** (spec Chaos watch 1). In the 6x crop it reads as a broken plate. Lever as the spec says (`right 18px`, `margin-right: 96px`).
- Uppercase Cambria at 12 px, 0.8 px tracking truncates "Visual Studio 2022" and "Notepad++ x64" (see 5, Offer b).

### 4.2 warhammer-orks
The most readable of the six at a glance: chequer band, bolted strips, riveted plate with teeth, red speed-stripes, cleaver, battered plate with bullet holes, crooked plates. Reads as scrap and paint, not as a comic.
- **Fix (F1), descender clip** (ruling 2). Spec "Done when" 10 fails as built.
- **Note, rotated labels render with ClearType colour fringes at 1x** (the ±0.7 degree text rotation forces a softer raster than upright text, and the capture is LCD antialiased). Readable, soft. Ink Free is also the thinnest label face in the batch: at 1x and 13 px strokes are about one pixel. Both fall under Sergei's open Ork-font flag, so I do not re-decide them; if he answers "impact", the rotation question goes away with it.
- Fine: the plate shadow is gone as the spec says; the crooked plate keeps every real mark (GlideX, FB2K); the cleaver reads as a cleaver at 1x.

### 4.3 warhammer-tyranids
Purple, bone, flesh-pink: bone ribs under the header, a vertebra spine on each side, tendril corners, bone mandibles with a pink bulb, a scalloped membrane, horn talons, pod plates. It does not read as a dossier any more.
- **Note, the header mandibles read as horns or a moustache above the gem.** At 6x they are two curved bone blades meeting at a pink bulb; at 1x, a pair of wings. "Pair of mandibles" is in the spec; the lever, if it bothers Sergei, is to pull the blade tips in by 3 px so the V is tighter.
- Fine: Sitka lining figures hold; both Czevak lines fit (the long one ends at x 295.7, 24 px before the text box edge); the pod plate keeps GlideX and FB2K whole.

### 4.4 warhammer-eldar
Navy and teal, ivory vines and waves with spirit-stone dots on every edge, a winged crest with a gem, a gem pendant with two swoops, leaf-shaped tiles, Palatino italic. Reads as Aeldari.
- **Fix (F1), descender clip at 2x** (ruling 2). Zero at 1x and 1.5x, so it is invisible on Sergei's display today, but it appears on a 200% screen.
- **Note, the vines are the busiest frame art in the batch** (spec Eldar watch). At 1x they do not shimmer or alias. Leave unless Sergei finds them busy.
- **Note, "no right angles" is true of the theme and false of the header buttons.** The four header buttons are base-level squares in every theme; Eldar's reference sheet says "no right angles". Base issue, not this batch.
- Title: Palatino italic, 11 px, wide tracking, thin at 1x but legible; ratio 5.23 or better.

### 4.5 warhammer-necrons
Green seams on every edge, a pyramid skyline in the header and the banner, an obelisk, hex nodes down both conduits, chamfered plates, silver Bahnschrift. Nothing is neon; bronze stays in dots and trim.
- **Note, the banner icon hexagon with three seams reads as a Y in a hexagon** (peace sign or a car badge) at 22 px before it reads as a tomb node. The spec's own watch item says it can read as a cube; I read it as a badge. Lever as the spec says: a single pyramid, no eye.
- **Note, the remove button in edit mode is bronze, not red.** It carries the same circle and cross as every other theme, so the affordance holds, but it is the one destructive control in the batch that matches the decorative trim. Spec-correct (Necrons have no red). Sergei's call; the lever is `--remove-btn-bg` to a dark red like `#7A2020` at 3:1 or better against the tile.
- Fine: lowest real text contrast 5.94; the window chamfers clip nothing.

### 4.6 warhammer (Imperium)
A gold cathedral: arcade under the header, piers with red-glass niches, two seals and a lancet, a parchment banner with a seal and a triple-lancet window, an octagonal window, arch plates. Rendered fonts are all four expected. Banner text IM Fell English at 12 px is legible.
- **Note, the wax seal reads as a prize rosette.** At 22 px and at 6x it is a red target on a short V-notched ribbon, not a purity seal with trailing tails. It is next to a triple-lancet window that says "cathedral", so the theme still lands. Lever: longer tails (a 10 px strip with a square cut).
- **Note, the title reads "quicf.launch" at 1x.** UnifrakturCook's lowercase k looks like f at 12 px. Sergei ruled UnifrakturCook stays; this is only so he knows what 1x looks like.
- **Note, parchment is the brightest surface of the batch** (banner luminance 8.9 times the header ground; spec flag 1, open). Not re-decided.
- Uppercase Cinzel at 12 px truncates "Visual Studio 2022", "Notepad++ x64" and long Cyrillic names (see 5, Offer b).

## 5. Optional extras (listed, not fired)

- **a. Fix descender clipping once for all 101 themes:** `.tile-label { overflow: clip; overflow-clip-margin: 3px; }` in `base.css`, instead of per theme. Only the two themes above are proven; the earlier batches were not re-measured.
- **b. Tile label box is 100 px (`icon-size + 36`).** Uppercase wide themes truncate common names: chaos and imperium cut "Visual Studio 2022", "Notepad++ x64" and "Жёсткий диск" (3 of 6 test names); tyranids, necrons and orks cut "Visual Studio 2022"; eldar cuts none. A wider box is a base layout change.
- **c. Edit-mode remove button is clipped flat at the tile's top and right edge in every theme** (it sits at -2 px inside an `overflow: hidden` tile). Base behaviour, seen again here; the larger tile radii of eldar and tyranids clip it a little more.
- **d. A faint darker wedge shows where the base `drop-shadow` fills the corner a real icon's own rounded corner leaves empty** on the cut plates (Imperium at 6x under the bottom corners). Subtle at 3x, invisible at 1x. Orks already removes the shadow for this reason.
- **e. Stale comment above `THEME_BANNERS`** ("3 per theme"; now 2 to 5).
- **f. Spec text.** If Ender takes F1, I update the spec's Orks and Eldar `.tile-label` rule text to match so the spec stays the contract. Say the word, or I do it with F1.

## 6. Not verified

- Only Ender's six real icons were tried on the cut plates (viewed: GlideX and FB2K on imperium, eldar, tyranids and orks; chaos and necrons by number only).
- The hidden-tiles sigma shot was not rerun. No theme has a texture layer (`#app::after` none, `#particles` none, the container background is the seven SVG layers), so 0.00 holds by construction.
- Banner lines: three re-checked by search (`Orks is made for fightin`, `Skulls for the Skull Throne`, `Your bravado will not save you`), all confirmed as Dawn of War lines; the third is spoken by Macabee as the Necron Lord's voice, so "Necron Lord" in the spec is loose but harmless. The sources were not fetched as pages.
- The updater error bar did not appear in any run. One machine; my "1.5x" is emulated scale on a 150% panel, so real LCD fringes can differ. I did not run a fan test; the squint scores are my read of the renders.
- Sergei's eyes on the Note-level reads in section 4 (spiked wheel, horns, Y-badge, rosette).

## 7. Crops to show Sergei

All under `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\890801c3-8abf-4cee-b670-698e2f31ad7c\scratchpad\judy-review\out4\r\`:
- `<theme>\SHEET6.png` (header art, banner left, banner right at 6x) for each of the six
- `GRID-empty.png`, `GRID-update.png`, `GRID-settings.png`, `GRID-picker.png` (all six side by side)
- `SHEET-edit-1.png`, `SHEET-edit-2.png`, `SHEET-hover-1.png`, `SHEET-hover-2.png`
- `warhammer-eldar\CMP-desc0-2x.png` (descender clip, clipped over unclipped) and `CMP-ellip.png` (the proposed lever, ellipsis intact)

**Verdict:** CHANGES REQUESTED

1. **F1, warhammer-orks and warhammer-eldar (Ender, required).** Stop the label box clipping descenders. In `warhammer-orks.css` line 122, add `overflow: clip; overflow-clip-margin: 3px;` to the existing `.tile-label { ... }` rule. In `warhammer-eldar.css` line 121, change `.tile-label { font-family: 'Palatino Linotype', Palatino, Georgia, serif;  }` to include the same two declarations. No other theme changes. Do not use padding and negative margin (it moves the rename underline). Done when: at 1x, 1.5x and 2x with labels "gypsy Yy jq" and "Typing" the g, y, j, p and q tails are complete (label with `overflow: visible` and as built render identically, within one raster-edge row), `.tile-label` height and the tile height (95.39) are unchanged, and "Visual Studio 2022" still ends in an ellipsis. Judy re-checks with the same sweep and a 6x crop. No gate change expected (no colour touched).
2. **F2, `app.js` comment (Ender, could).** The comment above `THEME_BANNERS` still says "(3 per theme)"; the lists now run 2 to 5. Comment only. Carried from batch 1 and batch 3.
3. **F3, spec text (Judy, with F1).** Update the Orks and Eldar `.tile-label` rules in the batch-4 spec to the F1 text. Not done here.
4. **F4, for Sergei (no code), decide only if he sees them.** Chaos banner icon reads as a spiked wheel; Tyranid mandibles read as horns; Necrons hexagon reads as a Y badge; Imperium seal reads as a rosette; Necrons remove button is bronze (lever `#7A2020`). Plus his five open flags, unchanged. Offers a to e in section 5 are not fired.

---

## 8. Re-check of F1 (Judy, 2026-10-01)

Scope: F1 only (descender clip on `.tile-label` in `warhammer-orks.css` and `warhammer-eldar.css`). The other four themes, F2, F3 and F4 were not re-reviewed. Nothing was edited, committed or pushed; this section is the only thing written, and the file is still uncommitted. Scratch root below: `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\890801c3-8abf-4cee-b670-698e2f31ad7c\scratchpad`.

### 8.1 Tree identity and diff

- **Hashes (plain `sha1sum` of the file bytes, which is what Ender quoted; git blob ids are a different number and were not compared).** `warhammer-orks.css` = `d31c69223fb6fe68336ed242890aa5754299cf06`, `warhammer-eldar.css` = `37096a2cccf64030212fdd03a9d85fa99ff4ffff`. Both match the expected values. A copy with CRs stripped hashes the same, so the files are LF and nothing hides in line endings.
- **Diff against what I reviewed.** My reviewed hash list (`judy-review\out4\asar-now.sha1`, 131 files in `src`) against the working tree: **129 OK, 2 FAILED**, and the two are exactly orks and eldar. `diff` of those two files against the reviewed copies (`batch4\asar\src`) is **one changed line each**: orks line 122 gains `overflow: clip; overflow-clip-margin: 3px;`; eldar line 121 gains the same two declarations (and loses the stray double space before `}`). Nothing else differs anywhere in `src`, so `app.js` and the other four themes are byte-for-byte what I reviewed (the stale "(3 per theme)" comment is therefore still there; F2 untouched).
- **The build under test is the tree.** I extracted Ender's `batch4-fix\build\win-unpacked\resources\app.asar` (sha1 `132229d3949b7c4072cc992e68a1065f137c1ea4`) myself with the repo's own `@electron/asar`: its `src` (131 files) is identical to the working tree.

### 8.2 What I measured (own driver, two guarded launches)

Both launches went through `node scripts/qa/quicklaunch-safe-launch.mjs` from the studio root on fresh temp profiles (`rc-orks`, `rc-eldar`, under `judy-review\rc\profiles\`), using Ender's F1 scratch build. In each, my driver ran only after the profile's own `DevToolsActivePort` named the port I had chosen (10205 and 10423). Both ended PASS, 0 processes left, `Run` and `StartupApproved\Run` unchanged. Sergei's instance (PID 4916) was never touched. The driver sends no `Input.*` events (Runtime.evaluate, CSS stylesheet toggles, Emulation and Page.captureScreenshot only) and a pointer-events guard sheet keeps the real cursor from hovering anything. Files: `judy-review\rc\recheck.mjs`, `run.sh`, `sum.cjs`, `stack.mjs`, `rc-warhammer-*.json`, `STACK-*.png`.

| Check (per theme) | Orks | Eldar |
|---|---|---|
| Computed style on `.tile-label` | overflow clip / clip, clip margin 3px, text-overflow ellipsis, nowrap | same |
| Sweep: 18 states (texts "gypsy Yy jq" and "Typing", 1x / 1.5x / 2x, scroll 0 / 37 / 81), 6 labels each = 108 samples, one discarded warm-up capture per label. As built vs unclipped reference, rows below the box | **0 of 108** (above the box: 0) | **0 of 108** (above: 0) |
| Noise floor (reference vs reference) | 0 of 108 | 0 of 108 |
| Positive control, old `overflow: hidden` clip vs reference | cuts in **90 of 108** (1 to 3 rows) | cuts in **18 of 108**, all at 2x, none at 1x or 1.5x (same as my review) |
| Tile height / label height, as built vs old, all 6 states | 95.391 / 15.11, identical | 95.391 / 14.391, identical |
| Ellipsis at 1x, 1.5x, 2x | "Visual Studio 2022" and "Spreadsheet Editor Pro" truncated with ellipsis; inside-box difference from the old clip 0 to 1 px | "Spreadsheet Editor Pro" truncated with ellipsis; "Visual Studio 2022" fits (as in my review, so the check is vacuous for that one name); inside-box difference 0 to 3 px |
| Edit-mode rename underline (1px dashed): label bottom and gap to tile bottom, as built vs old, 3 scales | identical (gap 4.64 / 4.805 / 4.39) | identical (gap 5) |
| Animation loops after, console errors | 0, 0 | 0, 0 |

**The one-row residual in Ender's report is a first-capture artifact, not the clip.** Ender's report shows a single one-row reading for the first label at 1x, scroll 0, on the very first capture of each run (his built state), and I discarded the same reading in section 3. Here I made the very first capture of the run an **unclipped** one: it differs by one row from the later unclipped captures of the same label in both themes (label 0 only), while every later built capture matches the reference. So the reading follows "first capture after boot", not the CSS. Control inside the same test: in Orks the old clip, captured late in the sequence, shows its own 1 to 2 row cuts on all three labels (Eldar's old clip cuts nothing at 1x, as expected).

### 8.3 Crops

- **Ender's 6x crops** (`batch4-fix\warhammer-<theme>-label-gypsy-6x-{old,built}.png`, `...-typing-...`, `...-rename-row1-...`): I decoded and compared them. Orks "gypsy Yy jq": the old crop's ink stops flat at row 115, the built crop continues to row 123 and tapers (9, 10, 11, 12, 12, 11, 8, 5 px per row), so the g, y, p, y, j tails are whole. Orks "Typing": old stops at 114, built reaches 122. Eldar "gypsy Yy jq" and "Typing": old stops at row 107 (flat cut across the g loop and j foot), built reaches 109 and tapers. The tails end 8 rows (about 1.3 css px) below the box at most, well inside the 18 rows (3 css px) of clip margin, so the margin is not what ends them.
- **My own 6x stacks** (old over built over unclipped, `judy-review\rc\STACK-<theme>-L0..L2.png`, labels "gypsy Yy jq", "Typing", "jumpy quaff"): old cuts the g, y, p and j tails flat in Orks and the g loop and j foot in Eldar; **built and unclipped are visually and numerically the same** in all six stacks (lowest ink row, old / built / unclipped: orks "Typing" 114 / 122 / 122; eldar all three labels 107 / 109 / 109).
- Orks "q" renders like an "a" in Ink Free in all three states (a trait of the face, same unclipped), so it is not part of this fix.

### 8.4 Findings

- **Note (no change asked), edit mode:** the uncut tails now cross the dashed rename underline (g, y, p, j in Orks; g, y, p, q in Eldar), because the underline correctly did not move (that was the reason I rejected padding and negative margin). It reads like any underlined text. Lever if Sergei dislikes it: none needed; leave.
- **Still open, not part of this check:** F2 (`THEME_BANNERS` comment, Ender, could) and F3 (spec text for the two `.tile-label` rules, mine). Say the word and I update the spec to the shipped rule text.
- **Not verified:** only these two themes and these label states; "1.5x" is emulated scale on a 150% panel; the other four themes were not re-measured (their files are unchanged from the reviewed tree).

**Verdict:** APPROVED
