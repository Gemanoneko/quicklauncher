# QuickLaunch theme review, batch 3 (Judy, 2026-09-30)

Reviewer: Judy. Branch `wip/theme-fidelity`, HEAD `75b9f7c` plus the uncommitted working tree. Read red-team: the job was to find what is off, not to balance it. Nothing in the repo was edited, committed or pushed; this file is the only thing written, and it is left uncommitted.

**In scope:** the seven batch-3 themes (ac-assassins, ac-templars, swl-illuminati, swl-templar, swl-dragon, doom-classic, doom-eternal) against `QuickLaunch_ThemeSpec_Batch03_2026-09-30.md` including my Addendum, and the batch-3 `src/renderer/app.js` change. Two Sergei rulings came after the Addendum and are treated as settled: the Templar title is Cinzel 500 (not 600), and UnifrakturCook stays in the repo. The serpent and the Classical Templar lettering are not reopened.

## 1. What was tested, and on what

- **Build:** Ender's packaged build of the working tree, `scratchpad\ql-build2\win-unpacked` (v1.94.3). I extracted its `app.asar` and compared SHA-1 with the working tree for the seven theme files, `app.js`, `base.css` and `index.html`: **all identical**. So what I rendered is what is on disk.
- **Launch:** every launch went through `node scripts/qa/quicklaunch-safe-launch.mjs` from the studio root, on a fresh temp profile per run (14 gallery mock tiles, `startWithWindows` false, `globalHotkey` null, `randomTheme` false). About 44 guarded launches in total. Every one ended PASS with 0 processes left and the `Run` and `StartupApproved\Run` keys unchanged. Sergei's own instance (PID 4916) was running throughout and was never touched. The installed app was never used.
- **Incident, no harm:** four ring-probe launches could not attach because debugging port 9348 was held by a leftover process from an earlier session (PID 5016, not started by me). I left it alone and reran on free ports.
- **What I looked at:** real renders from the packaged app, per theme: grid, hover on CALCULATOR, keyboard focus ring on the first and last column, filter chip, edit mode, update bar, settings (top and end), skin picker, empty library, scrolled one row and to the end, at 424 x 300, 640 x 420 and 1024 x 700; 3x crops of header and banner, 6x crops of every banner end and the header art zone; every banner line rendered at 424 and 640; Cyrillic tile names; the hotkey error and recording states. Reports and PNGs are in `scratchpad\judy-review\out3\<theme>\`.
- **Overlap probe:** the spec's A/B/C method done on real pixels (A hides art and content, B shows art, C shows content; overlap is art AND content). **The first version of my probe was wrong:** it took the text mask from "text visible vs text hidden with the art still on", so art painted over text removed the text it was supposed to hit. The positive control exposed it (a magenta block planted over the title read 0 px). I fixed the mask (text visible vs text hidden, art off in both) and reran. **Final controls:** real theme 0 px, planted magenta over the title **1,146 px**. All numbers below come from the corrected probe. Distances are Euclidean gaps in CSS px from a distance transform (tolerance about 0.5 px).
- **Colour caveat:** screenshot colours drifted between my first and last pass (the same doom-eternal slab read `rgb(212,89,33)` early and `rgb(232,72,26)`, its declared value, in the final pass). All colour and contrast claims use the declared CSS values and the final pass, where rendered text contrast matches the spec's computed figures.
- **Gate:** `npm run check:contrast` from the repo: 101 themes, 0 errors, 44 legacy warnings, **no batch-3 theme in the warning list**. Static greps on the seven files: 0 `infinite`, 0 `@keyframes`, 0 `animation:`, 0 `will-change`, 0 `backdrop-filter`, 0 `\A`, the only `rgba(` is the no-op `--tile-icon-glow`; no BOM; Hangul written literally.

## 2. Does it match the spec? Measured, all seven

The implementation is faithful. I diffed every `:root` block, every rules block and every SVG source against the spec text by machine: they match, with three known exceptions that are all correct (swl-templar `#title` per the rulings, swl-dragon banner per Addendum A.2 with `margin-right: 90px`, and doom-classic `#title .accent` where the spec contradicts itself, see F7). The serpent SVG is byte-identical to the Addendum (2,318 characters). Electron's numbers reproduce the mock's to 0.1 px.

| Theme | Title edge, spec / measured (gate 156) | Fonts actually rendered | Widest banner line ends, spec / measured | Loops at capture | Overlap px (header, banner, frame, focus ring; 3 sizes + states) |
|---|---|---|---|---|---|
| ac-assassins | 140.3 / 140.27 | Cinzel (web), Segoe UI, Segoe UI Semibold | 255.5 / 255.53 | 0 | 0 |
| ac-templars | 138.7 / 138.69 | Jost (web), Segoe UI (version line only) | 278.0 / 278.06 | 0 | 0 |
| swl-templar | 144.85 (Cinzel 500, ruling) / 144.85 | Cinzel (web), Palatino Linotype, IM Fell English (web); **UnifrakturCook never loaded** | 320.8 / 320.77 | 0 | 0 |
| swl-dragon | 130.8 / 130.76 | Malgun Gothic (Hangul tag shows real glyphs, not boxes) | 251.7 / 251.65; text box ends 320 | 0 | 0 |
| swl-illuminati | 139.5 / 139.45 | Segoe UI, Segoe UI Semibold | 261.5 / 261.49 | 0 | 0 |
| doom-classic | 127.2 / 127.23 | Courier New | 282.8 / 282.84; window ends 346 | 0 | 0 (see note) |
| doom-eternal | 99.0 / 99.05 | Bahnschrift (SemiCondensed) | 290.5 / 290.53 | 0 | 0 |

Note, doom-classic: the generic banner probe reports 1,824 px because it strips every banner background, and the text window (a gradient, the text's own surface) goes with it. A dedicated probe that keeps the text window and strips only the two digit windows reads **0 px overlap and 10 px between the text and the nearest window, at all three widths**.

All 28 banner lines fit on one line at 424 and at 640 (`scrollWidth <= clientWidth`). The title edge is identical at all three window sizes. Hiding the header art on the filter chip works in all seven; the chip clears the title in all seven (doom-eternal chip starts at x 166, right of the slab). Every `#header::after` is at x 168, width 84. Every art data URI decodes (0 failed images, 0 network failures, 0 script exceptions; the console shows only the updater's missing `app-update.yml` message that this build type always logs). `#app::after` and `#particles` are `none` in all seven, so the no-texture acceptance holds by construction (I did not run the hidden-tiles shot).

**Nearest art, in CSS px (corrected probe; "none" = nothing within 12 px):**

| Theme | Header art to text | Banner art to text | Frame art to tiles | Frame art to focus ring (first / last column) |
|---|---|---|---|---|
| ac-assassins | 8.5 | 13 | 5 (sync-bar ticks) | 1.0 / 1.0 |
| ac-templars | 10.5 | 12 | no frame art | n/a |
| swl-templar | 10 | 8.5 | 4.5 | 0.5 / 0.5 (row 2 last column 1.5) |
| swl-dragon | 10 | 11 | 6 | 2.0 / 4.0 to 4.8 (row 2 last column, ripple ring, 2.0) |
| swl-illuminati | 10 | 11.7 | no frame art | n/a |
| doom-classic | 10 | 10 | 5 | 3.0 / 1.0 to 1.5 |
| doom-eternal | 8.5 | 11 | 5 | 8 / none |

The focus-ring column is the Foundation acceptance check. The Foundation rule is "art 1 px outside the ring zone" and all four band-art themes meet it (0.5 to 2.0 px, no overlap). It is tight by design: on swl-templar the ring and the pilaster read as touching at Sergei's 150% scale. That is a known, accepted trade-off (spec watch item 3), listed here so nobody is surprised.

**Rendered text contrast** (mode-colour ground from the real pixels, 24 roles per theme across rest, hover, edit, update bar, settings, chip): lowest per theme ac-assassins 5.62, ac-templars 6.24, swl-templar 6.61, swl-dragon 7.01, swl-illuminati 6.78, doom-classic 6.00, doom-eternal 4.97 (version on the orange slab, `#1A0806` on `#E8481A`; title on slab 5.13). Nothing is under 4.5 among the roles measured.

**Cyrillic tile names** (Калькулятор, Жёсткий диск, Блокнот и Я, Проводник Windows Ж): every theme renders them in a Cyrillic-covering face (Segoe UI Semibold, Jost web, Palatino Linotype, Malgun Gothic, Courier New, Bahnschrift), no tofu, long names ellipsize as designed.

## 3. The two settled rulings and `app.js`

- **Templar title Cinzel 500:** in the CSS (`font-weight: 500`, 12 px, 3 px tracking, uppercase, comment cites the ruling); measured edge 144.85, which matches Ender's figure; 11.15 px under the gate. Confirmed settled, not reopened.
- **UnifrakturCook stays:** the file, its `@font-face` and its README row are intact, and the face is never loaded by any theme (runtime face list shows only Cinzel and IM Fell English for swl-templar). Nothing else references it.
- **Serpent:** identical to the Addendum SVG; head faces the text; static; `margin-right: 90px` on the banner text as specified; the widest line ends at x 251.65 and the serpent's first painted pixel is at x 329 (the Addendum's alpha scan; the SVG is unchanged), so 77 px apart. Not reopened.
- **`app.js`:** the diff is confined to `THEME_BANNERS`, exactly seven keys, eight hunks. I evaluated the spec's "The `THEME_BANNERS` entries" block and the file's object: **identical for all seven keys** (4, 3, 3, 5, 3, 6, 4 lines). No other key changed. Leftover: the comment above the object still says "3 per theme" (spec watch item, F6).
- **Banner lines:** two spot checks. "Laws. Tradition. Blood." now has a second search excerpt (the Funcom developer journal "Unveiling the Templars" on MMORPG.com, still the journal's text as returned by search, the page itself was not fetched), so it is better supported but still not page-verified. "Warning: the Slayer has entered the facility." is a real announcement line; sources also tie it to DOOM (2016), so its Eternal attribution in the spec rests on TV Tropes only. Low risk; Sergei's call.

## 4. Red-team findings, by theme

Severity words: **Fix** (I want it changed before this is called done), **Note** (real, cheap to leave, Sergei may want it), **Offer** (outside this batch, not asked for).

### 4.1 ac-assassins (my squint: 4)
Reads as the Animus: hexagon strip, sync bar, red tick, eagle, hooded figure. No gold, no brown, red only where the spec allows. No probe failure.
- **Note, hood icon reads as a cone or rocket at 22 px.** At 6x it is a hood with a cowl opening and a red band; at 1x the white silhouette has no forward hook or overhang, so it says "white rocket with a red stripe" before it says "hood". A fan will still get there from the eagle next to it. If Sergei thinks it reads wrong, the lever is the `hood` SVG apex (lean it forward by about 2 px and hook the tip), not the colour.
- **Note, sync-bar ticks sit 1.0 px above the first-row focus ring.** By the spec (art ends y 51, ring starts y 52). Legible, crowded.

### 4.2 ac-templars (my squint: 3 as built, 4 after F2)
The helix, the silver strip and the red lab-door disc all land. The banner and the shield are where it slips.
- **Fix (F2), the Templar cross is nearly a plus sign.** The mark that is supposed to say "Templar" is a red cross whose arms widen only from 5.4 to 8 units (1.5 to 1), with flat ends and straight sides. At 30 x 38 px it reads as a first-aid or pharmacy cross on a white shield, which the spec itself named as the least certain part of this theme. A cross pattée has arms that flare to about twice the waist. I rendered a proposed path next to the current one inside the running app (`out3\ac-templars\fixproof.png`): waist 4, end width 9.8, slightly concave sides. At 1x the proposal reads as a crusader cross; the current one does not.
- **Note, the banner is the brightest surface by far.** A 44 px strip at `#D5D9DE` under a near-black window. Text contrast is fine (ink on silver 13.6:1). It is on-theme (Abstergo is white and silver) and it is the spec's own watch item 6, but in edit mode it sits between a dark grid and a dark edit bar and pulls the eye from the tiles. Sergei should see the crop. The lever is the strip colour (`#B8BDC4` keeps ink text at 10.2:1).
- **Note (F4), the version line is Segoe UI in a Jost theme.** `#header-version` is not covered by the `#title` rule. Title Jost, version Segoe UI, side by side at 12 px. Cosmetic.
- Fine: the helix reads as DNA at 1x; the silver hover with no red on the tile; the red ring only on keyboard focus.

### 4.3 swl-templar (my squint: 4)
The strongest of the seven against its source. Red banners with white flared crosses between pilasters, dentil cornice, fluted pilasters, Greek-key course, a red banner hanging over the course, a temple front as the icon. All of it is the fetched description of Templar territory.
- **Note, ring and pilaster touch** (0.5 px measured, 1.5 at the row-2 last column). Accepted Foundation trade-off; visible at 1.5x.
- **Note, the title is now a near-twin of ac-assassins'.** Both Cinzel capitals with a red dot. They differ by size (12 against 11), weight (500 against 700) and colour (bone against white), and by everything around them. Acceptable; it was flagged in the Addendum and Sergei ruled.
- Fine: "Laws. Tradition. Blood." and the two other lines fit with 89 px to spare; IM Fell English at 12 px is legible (14.7:1); the flag does not touch the right pilaster base.

### 4.4 swl-dragon (my squint: 4)
Jade and gold on green-black, the gold 서울 tag with real Hangul glyphs, a string of lanterns, a coin, and the serpent facing the text. It reads as Seoul first and Dragon second, which is what the sources give.
- **Note, tightest art-to-ring distance after swl-templar:** 2.0 px between the left-band dots and a first-column ring, and between the right-band ripple ring and the row-2 last-column ring. Inside the Foundation rule, under my own earlier "keep art 3 px from a ring" lesson. If Sergei ever sees a dot look like part of the ring, move the `dotsl` dot at `cx=7, cy=47` to `cx=6`.
- **Could (F3), the tag is exposed to screen readers.** `#header::after { content: '서울' }` is decorative text in generated content. `content: '서울' / ''` (Chromium 128 supports the alt form) marks it decorative. Not visible, cheap.
- Fine: the serpent is wholly inside the banner, clear of the text, reads as a snake at 1x, 1.5x and 6x; dots in the top band look like scatter, not dead pixels, on the real render.

### 4.5 swl-illuminati (my squint: 4)
Clean. The ziggurat, the eye in a triangle and the setback skyline all read; muted red only in edit mode, errors and the tile remove button. No gold anywhere.
- **Note, the "dossier corner" is a cut corner, not a fold.** The plate is clipped at the top right; nothing draws the folded flap, so it reads as a clipped or ticket corner. The spec's wording ("folded corner") promises more than the clip-path can draw. Leave it unless Sergei wants the fold.
- The skyline is low contrast to its ground by design (decoration).

### 4.6 doom-classic (my squint: 5 after F1)
The status bar is the best thing in the batch: bevelled strip, two red pixel windows, dark text window, three keycards, riveted strips, bevelled tiles, stepped entrance kept.
- **Fix (F1), the zeros in "100%" and "200%" are slashed.** All four zeros carry a diagonal slash (the glyph I drew in the spec has three extra pixels on the diagonal). DOOM's HUD numerals have plain oval zeros; a slashed zero is a code-editor convention and makes the window read "1ØØ%". It is the theme's signature element, so it is worth the four small edits. I rendered the corrected digits next to the current ones in the running app (`out3\ac-templars\fixproof.png`, lower half): the plain zeros read as 100% and 200%, no change to colour or contrast.
- **Note, the tile bevel is half invisible.** The dark edge (`#2A2016`) on the tile fill (`#221510`) is 1.1:1, so only the light top and left edges carry the 1993 bevel. It reads as a hairline frame. Not wrong, weaker than the spec's wording.
- **Note, the text window has no bevel** while both digit windows do. Cosmetic.
- Fine: 10 px between the text and the nearest window; keycards read as keycards at 6x; right-strip gap to the ring 1.0 to 1.5 px.

### 4.7 doom-eternal (my squint: 4)
Saturated hellfire orange, hazard band, chevrons both ways, claw slashes, cut corners, slab with black italic type. Reads as DOOM Eternal and not as Doom 1993, and nothing is a dull wash.
- **Offer, the hotkey error is cyan.** "That shortcut is taken" renders in the same cyan as edit mode (`hotkey-error-recording.png`). The message text says what is wrong, so it does not rely on colour, but an error in a blue-green reads as information. The palette has no red to use without colliding with hellfire orange; the fix, if wanted, is a wording prefix or the yellow. Not a batch-3 fix.
- Fine: title on slab 5.13:1, version on slab 4.97:1; the first-column ring is 8 px from the corner triangle; the chip starts clear of the slab.

## 5. Two things I got wrong in the spec (mine to fix, not Ender's)

- **doom-classic `#title .accent`:** the rules block says `#DC3420`, the contrast table says `#F25A42` (4.96:1). `#DC3420` on that header would be about 3.3:1. Ender built the table value, which is right. The spec text should be corrected.
- **Placeholder contrast:** my contrast method assumed every field placeholder is `--text-dim`. Only `.picker-search::placeholder` is themed. The other two, the hotkey field and the skin search, render in the browser default `#757575`, which measures **3.5 to 3.9:1 on the theme fills in all seven themes** (3.52 illuminati, 3.55 dragon, 3.57 ac-templars, 3.67 ac-assassins, 3.72 doom-classic, 3.88 swl-templar, 3.90 doom-eternal). It is instructional text ("CLICK AND PRESS KEYS"), so it should clear 4.5:1. This is `base.css`, every theme, not batch 3, and the gate cannot see it. **Offer:** `.hotkey-input::placeholder, .theme-search::placeholder { color: var(--text-dim); }` in `base.css`. Not requested here.

## 6. Not verified

- Real application icons on the cut plates (hexagon, banner-tail, pointed hex, dossier corner, bottom-right cut). The mock glyphs clear with 2.2 px or more; a real icon that reaches a corner loses a triangle (spec watch item 1).
- The hidden-tiles sigma shot. No theme has a texture layer, so it is 0 by construction.
- The updater error bar: it did not appear in any of my runs, or it was closed before the first frame I judged. Every shot has it closed; the synthetic update bar was checked in edit mode on all seven.
- One machine, 150% display scale. The 1.5x captures from my first pass were not used for numbers.
- Sergei's eyes on the two judgement calls (ac-templars banner brightness and the squint scores above). The squint scores are my read of the renders, not a fan test.

## 7. Crops to show Sergei

All under `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\890801c3-8abf-4cee-b670-698e2f31ad7c\scratchpad\judy-review\out3\`. `<theme>\full-3x.png` is the whole window at 3x; `<theme>\hover-424.png`, `<theme>\states-edit-update-424.png`, `<theme>\banner-3x.png`, `<theme>\header-3x.png` sit beside it.
- `ac-templars\banner-right-6x.png` (the shield cross) and `ac-templars\fixproof.png` (current against proposed cross, and current against plain-zero digits)
- `doom-classic\banner-left-6x.png` and `doom-classic\banner-right-6x.png` (the slashed zeros)
- `swl-dragon\banner-right-6x.png` (the serpent) and `swl-dragon\header-art-6x.png` (Hangul and lanterns)
- `swl-templar\full-3x.png`, `swl-templar\header-art-6x.png`, `swl-templar\focus-last-640.png` (ring beside the pilaster)
- `ac-templars\full-3x.png` (the bright banner), `doom-eternal\full-3x.png`, `doom-eternal\hotkey-error-recording.png`

**Verdict:** CHANGES REQUESTED

1. **F1, doom-classic (Ender, required).** In the `hp` and `ar` SVGs of `doom-classic.css`, make the two zeros plain in each. In each SVG, for the first zero: replace `<rect x='25' y='12' width='4' height='2'/>` with `<rect x='27' y='12' width='2' height='2'/>`, delete `<rect x='23' y='14' width='2' height='2'/>`, replace `<rect x='19' y='16' width='4' height='2'/>` with `<rect x='19' y='16' width='2' height='2'/>`. For the second zero: replace `<rect x='37' y='12' width='4' height='2'/>` with `<rect x='39' y='12' width='2' height='2'/>`, delete `<rect x='35' y='14' width='2' height='2'/>`, replace `<rect x='31' y='16' width='4' height='2'/>` with `<rect x='31' y='16' width='2' height='2'/>`. In the CSS file the same text appears with `<` and `>` written as `%3C` and `%3E` (the quotes and numbers are as shown). No colour change, so the gate is untouched. Done when the status bar reads 100% and 200% at 1x and 3x with no slash (proof render: `out3\ac-templars\fixproof.png`).
2. **F2, ac-templars (Ender, required).** In the `shield` SVG, replace the red cross path (the `<path d='M12.3 10.3 L11 3.6 ...'` element) with this path, keeping the fill `rgb(208,35,46)`, the stroke `rgb(120,14,22)` and stroke width 0.7: `M10.1 3.6 H19.9 Q17.6 8.4 17 12 Q21.6 10.6 25.4 9.1 V18.9 Q21.6 17.4 17 16 Q17.6 19.6 19.9 24.4 H10.1 Q12.4 19.6 13 16 Q8.4 17.4 4.6 18.9 V9.1 Q8.4 10.6 13 12 Q12.4 8.4 10.1 3.6 Z`. As in F1, `<` and `>` are percent-encoded in the CSS. The shield position, size and the banner text clearance do not change. Done when the cross reads as a flared cross pattée at 1x. Judy re-checks the 6x crop and the squint score after the change.
3. **F3, swl-dragon (Ender, could).** Change the header tag to `content: '서울' / '';` so the decorative text is skipped by screen readers. Nothing visible changes.
4. **F4, ac-templars (Ender, could).** Add `#header-version { font-family: 'Jost', 'Segoe UI', Arial, sans-serif; font-synthesis: none; }` so the version line matches the title face. Check the version width stays inside the title area.
5. **F5, swl-dragon (Ender, could, only if Sergei sees it).** In the `dotsl` SVG move the dot `cx='7' cy='47'` to `cx='6'` to take the left band from 2.0 to about 3 px from a first-column focus ring.
6. **F6, `app.js` comment (Ender, could).** The comment above `THEME_BANNERS` still says "(3 per theme)"; the list now runs 3 to 6 lines. Comment only.
7. **F7, spec corrections (Judy, not done here).** The doom-classic `#title .accent` value, and the placeholder claim in the contrast method. Say the word and I will edit the spec.
8. **F8, for Sergei (no code).** Look at the ac-templars banner brightness and decide whether `#D5D9DE` stays (lever `#B8BDC4`); decide whether the hood icon in ac-assassins is good enough. Offers outside this batch, not fired: the placeholder contrast in `base.css` (section 5) and the cyan hotkey error in doom-eternal (4.7).


## 8. Re-check of F1 and F2 (Judy, 2026-10-01)

Only F1 and F2 were re-verified. The other five themes and the optional items (F3 to F8) were not touched.

**Build identity.** `sha1sum` of the working-tree files matches Ender's values: `doom-classic.css` `8cfd337afa4990c37e5bc40b3c78af56cdfa5b5e`, `ac-templars.css` `7676fcf5b7712a84f8c96e81fefd21bb365fdbfc`. The copies inside the extracted packaged `app.asar` hash identically, and `build\win-unpacked\resources\app.asar` is `2a8d98350a68b18dc84620b519741858855b08d4`. That build sits in Ender's scratchpad folder (`batch3-fixes\build\`), not under `WIP\QuickLaunch\build\`. (`git hash-object` gives a different number by design; it hashes the blob with a header, so I used `sha1sum`.) I did not launch the app; the crops and Ender's driver reports were enough.

**F1, doom-classic: fixed.** In the CSS the six slash rects are gone (0 matches) and the four plain-zero rects appear twice each, once in `hp` and once in `ar`. The 6x crops `doom-classic-100-6x.png` and `doom-classic-200-6x.png` show plain oval zeros with no diagonal; the status bar reads 100% and 200%. Ender's report checked 70 zero cells per crop with 0 mismatches. Colour is unchanged, so the contrast gate is unaffected.

**F2, ac-templars: fixed.** The old path (`M12.3 10.3 L11 3.6`) is gone and my path appears exactly once, with fill `rgb(208,35,46)`, stroke `rgb(120,14,22)` and width 0.7 kept. The 6x crop `ac-templars-shield-6x.png` shows a red cross pattée: arms narrow at the centre and flare to flat, wider ends, with slightly concave sides. Measured in the running build, the vertical arm is 9.7 units wide at the end and 6.7 at mid-arm. It no longer reads as a first-aid plus sign. The shield position, size and banner clearance are unchanged (banner 424 x 44).

**Squint scores after the fixes:** ac-templars 4, doom-classic 5. Both match the scores I predicted in section 4.

**Verdict:** APPROVED
