# QuickLaunch theme review, batch 6 (Judy, 2026-10-01)

Reviewer: Judy. Branch `wip/theme-fidelity`, spec `QuickLaunch_ThemeSpec_Batch06_2026-10-01.md` (committed `abbc6b1`), Ender's uncommitted working tree: the six `star-wars-*.css` files, `app.js`, `fonts/fonts.css`, `fonts/README.md` and three new font folders. Read red-team: the job was to find what is wrong or gets in the way, not to give a balanced take. **Nothing in the repo was edited, staged, committed or pushed, and I ran no git command** (the "other keys unchanged" check in section 2 was done against an older copy of `app.js`, not against HEAD). This file is the only thing written in the repo and it is left uncommitted. The regions worktree was not touched.

**In scope:** star-wars-republic, -separatist, -empire, -rebel, -sith, -mando against the spec; Ender's four deviations; the three new fonts. **Sergei delegated the beauty calls**, so section 3 rules on each deviation and the required fixes carry what differs from the build.

**Verdict (first review, superseded by section 10, which ends APPROVED):** CHANGES REQUESTED. Two fixes, both in `star-wars-empire.css` (F1, F2); Republic, Separatist, Rebel, Sith and Mando are approved as built. Details and the fix text are at the end.

## 1. What was tested, and on what

- **Hashes.** `sha1sum` of the tree at the start and at the end of the review, identical: empire `226e86fa`, mando `d49a2e3c`, rebel `315aab9a`, republic `ca4e8e95`, separatist `aaf73851`, sith `f2480bc3`, `app.js` `a85b2c25`, `fonts.css` `f20fc24e`. The runs read the live `src/renderer` tree (the harness loads `file:` URLs from it), so what I measured is what is on disk. All six theme files were last written at 16:09, before every measurement run (Ender's 16:11 on, mine later).
- **Method: Ender's offscreen harness, reused, plus my own probes.** `harness6.cjs` and `run6.mjs` copied unmodified (sha1 `1844f5d7`, `771b757a`, equal to his). It runs Electron 32.3.3 on the real `src/renderer` in one offscreen, never-shown, non-focusable window with the gallery's stub preload and mock tiles; QuickLaunch's own main process is never loaded (no tray, no hotkey, no single-instance lock, no updater). My driver is his `drive6.mjs` (sha1 `790844a7`) with two small patches (the probe stylesheet accepts a prefix so a candidate fix can be tested; the art-only capture is saved before the probe is reset) and about 100 added lines of my own probes. Hover and focus are forced with `CSS.forcePseudoState`; no synthetic input is sent.
- **Runs: 7 harness launches** (`j-a`, `j-b`: fonts, widths, banner, contrast, clips, shots, real icons and my probes; `j-dp-a`, `j-dp-b`: descender sweep and the A/B/C probe on their own, because the sweep's positive control is only reliable run alone, see section 6 note 4; `j-x1`, `j-x2`: Empire with the F1 and F2 fix applied as a probe stylesheet; `j-x3`: art-only hue scan and squint captures for all six). All 7 exited 0.
- **Real renders looked at.** Per theme at 1.5x: grid, hover on CALCULATOR, keyboard focus, edit mode, update bar, settings, skin picker (all six); chip and scrolled (Empire only, the other five not viewed); true 1x header strips at nearest-neighbour 3x, true 1x banner icons (8x), banner motifs and header art (4x), the squint sheets, Empire label rows at 6x and ten label candidates at 3x.
- **Not tools of mine that failed.** One check of mine misfired and was replaced before any number was used: `grep -c $'\r'` in this shell matched every line (it reported 141 CRs in a file with none); the CR count in section 2 is a byte count in Node (0 in every file). The first hue scan read the saved capture after the probe had been reset (tiles visible), which showed 2,400 px of "blue" that was the Notepad icon plate; I fixed the driver, re-ran all six, and only the second scan is reported.

## 2. Does it match the spec? Measured

**Machine diff against the spec text** (my own extractor, `specdiff.mjs`: the `:root` block, the rules block and the seven SVG sources of each theme section, placeholders replaced with the data URIs encoded as B1 0.2 says, compared with the built file after its leading comment). The spec's section 7 hash is the SHA-1 of the file without the leading comment; Ender's comments are multi-line, so strip to the closing `*/` before hashing.

| Theme | Spec hash (section 7) | Built, comment stripped | Difference from the spec text |
|---|---|---|---|
| republic | `a797fe31` | `a797fe31` | none |
| separatist | `37da8415` | `37da8415` | none |
| mando | `dd303ae2` | `dd303ae2` | none |
| empire | `25f3bc21` | `d7b53429` | 3 lines: `#title`, `.tile-label`, `#theme-banner-text` take `'Libre Franklin', Bahnschrift, ...` |
| rebel | `0456209c` | `eea1cbe9` | 1 line: `#title` is `'Black Ops One', 'Trebuchet MS', ...` at weight 400 |
| sith | `9d6b9aea` | `e26b83eb` | 1 line: `#title` is `Oxanium, Bahnschrift, ...` and tracking 4 px (spec 5 px) |

**Positive control:** one hex changed in a copy of the Mando text is reported as different (the other five unchanged). So the three identical files are identical, and the three font themes differ in exactly the lines Ender named and nowhere else: no colour, SVG or rule moved.

**`app.js`.** Against the batch-5 build's copy (sha1 `1ea9ffc2`, which B5R recorded as HEAD's), the diff is the six `THEME_BANNERS` arrays and `'star-wars-republic': 'STAR WARS: GALACTIC REPUBLIC'`, nothing else; all 30 lines of the spec's block are present. The picker shows the new name (seen in the Rebel, Sith and Mando picker renders).

**Fonts.** The three TTFs equal the README's SHA-256 and their git blob ids equal GitHub's (read through `gh api` directory metadata, nothing downloaded): Libre Franklin `8cf55491`, Black Ops One `672d8e28`, Oxanium `ead485c7`; Black Ops One's and Oxanium's `OFL.txt` also match (`525b8ec8`, `38913c09`). Libre Franklin's `OFL.txt` differs from upstream (`5c7f90cd` against `04cef395`; 4,402 bytes against 4,495) only by CRLF to LF, which the README states, so the comparison can fail and does where it should. `fonts.css` declares Libre Franklin 100 to 900, Oxanium 200 to 800, Black Ops One 400, `font-display: block`; all three folders are inside the `src/**/*` build glob. **The weight axis is live:** the same string at weight 100, 500, 900 measures 180.9, 186.3, 194.1 px (Libre Franklin) and 189.8, 195.6, 203.5 px (Oxanium). The platform names "Libre Franklin Thin" and "Oxanium ExtraLight" are the variable files' default instance names, not the weight drawn. **Cyrillic:** Libre Franklin draws "Жёсткий диск Щщ Ъъ Проводник" (28 of 28 glyphs); Oxanium and Black Ops One draw 4 (the spaces) and the rest falls to Courier New, as Ender's README says. A misspelled family falls back to Times New Roman (negative control).

| Theme | Title edge, spec / Ender / mine (gate 156; mine at 424, 640, 1024 at 1x, 424 at 1.5x and 2x) | Fonts actually drawn (title / labels / banner / version) | Widest banner line ends at x, spec / mine (box edge 320) | Lowest rendered text contrast (declared) | Overlap and keep-out, 22 states | Real-icon loss, worst |
|---|---|---|---|---|---|---|
| republic | 138.52 / 138.52 / 138.52 | Cinzel / Jost / Jost / Jost | 200.4 / 200.4 | 4.53 (7.15) | 0 / 0 | 3.44% |
| separatist | 141.91 / 141.91 / 141.91 | Jost throughout | 249.8 / 249.8 | **3.16** (5.36), see note 1 | 0 / 0 | 4.98% |
| empire | 136.08 / 144.05 / 144.05 | Libre Franklin / Libre Franklin / Libre Franklin / Bahnschrift | 274.2 / 273.9 | 8.34 (8.34) | 0 / 0 | none (no cut) |
| rebel | 125.98 / 134.11 / 134.11 | Black Ops One / Trebuchet MS x3 | 214.5 / 214.5 | 5.03 (5.98) | 0 / 0 | none (no cut) |
| sith | 140.77 / 147.22 / 147.22 | Oxanium / Bahnschrift x3 | 254.5 / 254.5 | 6.16 (7.40) | 0 / 0 | 3.0% |
| mando | 134.91 / 134.91 / 134.91 | Dela Gothic One / Segoe UI Semibold x2 / Segoe UI | 143.3 / 143.3 | 5.13 (5.98) | 0 / 0 | 2.99% |

The 22 states per theme are the spec's 11 (424 x 300, 640 x 420, 1024 x 700, chip, edit, update, edit plus update, focus ring on the first column at 424 and the last column at 424, 640, 1024) at 1x and at 1.5x. Strict overlap is also 0 in every one. The planted-block control (a magenta block over the title in the art layer) reads 219 to 403 px (empire 238, rebel 285, sith 270, republic 262, separatist 219, mando 403), so the probe can fail. The smallest art-to-content distance anywhere is 0.67 px (Sith, Republic, Separatist, Mando; Empire 1.33, Rebel 1.0); the spec says the banner meets the bar below it by construction in the edit and update states, and I did not locate which pair reads 0.67.

**Reproduction of Ender's numbers.** Every title edge, label width, banner end, real-icon loss, overlap and clip figure he quotes reproduces to the digit in my runs. Tile height 94.797 px and label height 13.797 px in all six at 1x, 1.5x, 2x and scrolled one row. Banner lines: all 18 fit on one line (`scrollWidth <= clientWidth`, one line box) at 424, 640, 1024 and at 1.5x; Empire's widest ends 46.1 px before the box edge and 56.1 px before the motif's first painted pixel (spec 45.8 and 55.8). Window clips: 0 clipped points in 10 state-and-scale combinations in all six (Sith corners magenta `1111`, Republic `1111`, Separatist `1001`, Mando `0001`, Empire and Rebel `0000`).

**Gate and statics.** `node scripts/check-theme-contrast.js`: **101 checked, 0 errors, 32 legacy warnings**, none of the six in the warning list (Ender's `gate-neg1.txt` shows the same script erroring on a broken Sith). Static greps on the six files, all 0: `infinite`, `@keyframes`, `animation:`, `will-change`, `backdrop-filter`, literal `\A`, `!important`, CR bytes (counted in Node: 0 CR against 128 to 141 LF per file), `content` strings other than `''`. Runtime: loops at capture 0, hidden-tiles sigma 0.00 in all six, `scrollbar-gutter: stable`, 0 console errors.

**Descenders.** "gypsy Yy jq", "Typing", "jumpy quaff", "Qq Gg Jj" and the Cyrillic set "Щука Цирк", "Цирк Щи", "Цц Щщ Джем", "QJ jq Gg", each at 1x, 1.5x and 2x, the 8 px band under the label box, built against the same label with `overflow: visible`: **0 px in all six themes at all 6 set-and-scale combinations** (24 labels per theme), with the positive control (label box cut to 6 px) reading 131 to 680 px in every one (Empire 153 to 656, Rebel 136 to 633, Sith 139 to 574).

**Colour discipline** (the spec's "Done when" 6, art-only capture at 1x with the title, version, buttons, banner text and all tiles hidden, header, both bands, top course and banner): **0 pixels outside each theme's allowed hue families in all six** (Empire only red: 32 px in the header, 3 in the banner; Mando only the orange family; Sith only crimson plus 112 px of holocron amber; Rebel olive, orange and hologram blue; Republic crimson, brass and the blue banner; Separatist tan with a few CIS-blue cells). The scan can fire: the first, faulty capture (tiles visible) reported 2,400 px of blue and green.

**Figures and Cyrillic.** "7-Zip 23.01", "Visual Studio 2022", "Notepad++ x64" draw lining figures in all six; "Калькулятор" and "Жёсткий диск" draw with no missing glyph in all six (Empire's in Libre Franklin).

**Note 1 (separatist rendered contrast).** The die glyph in the header buttons renders 3.16:1 against the tan at 1x (declared 6.2; the full-screen glyph 4.10). It is an icon, so the 3:1 floor holds, but it is the weakest rendered pair of the batch, and Ender's `contrast.low` list is keyed on the declared ratio, so it could not have shown it. See section 6.

## 3. Rulings on Ender's four deviations

1. **Empire: title, labels and banner in Libre Franklin; version and settings stay Bahnschrift. ACCEPT the scope, CHANGE the body face (F2).** The scope is what my section 8 named ("Empire: title, labels, banner"); the gap is mine, because section 3.2 still says `--font` is Bahnschrift and gave no CSS for the swap. Seen as built, the update bar ("Update v1.95.0 available", Bahnschrift, tracked caps) sits directly under the banner line (Libre Franklin, sentence case), the edit bar and the whole Settings screen are in a second grotesque, and the version under the title is DIN-narrow beside a Franklin title. They are close faces, so it is not ugly, but it is two faces where the window needs one, and my own review lesson (0.2, "the version line in another face than the title") says the body face carries the version. I rendered `--font: 'Libre Franklin', Bahnschrift, ...` on top of the build in eight states (`EMPIRE-font-override.png`): one voice from the title to the update bar, and nothing breaks. Overflow scan of every visible element in Settings at 424, Settings at 640, Settings scrolled to the end, edit, update, edit plus update, chip and the cheat sheet: **no overflow that the build does not already have** (the two existing ones are the long mock name "Spreadsheet Editor" and the edit-mode tile's remove-button corner, identical before and after). Widths grow 5 to 9 percent (CHECK FOR UPDATES 124.2 to 132.6 px in a 384 px row, "RANDOM THEME ON STARTUP" 218.3 to 235.6, `v1.94.3` 41.3 to 47.5 px in a 132 px box, `+ INSTALLED` 75.8 to 80.0).
2. **Rebel: title in Black Ops One rather than Libre Franklin. ACCEPT.** My section 8 listed both faces for the Rebel title (rank 1 and rank 2); the stencil is the better pick. At true 1x the break lines are 1 px, so it reads as a heavy slab-and-stencil title that matches the header's stencil blocks, and it is the one title in the batch a fan would call "military crate" at a glance. A Libre Franklin title would put Rebel and Empire in the same face and leave only colour to tell them apart. Weight 400 is the only declared weight and `font-synthesis: none` is set, so there is no faux bold; the title is Latin markup, and Black Ops One has no Cyrillic, which cannot matter here (`#title` is constant text). Edge 134.11 px, 21.9 under the gate and 33.9 px before the header art box at 168. No change.
3. **Sith: title in Oxanium 700, labels, banner and version stay Bahnschrift, tracking 4 px not 5. ACCEPT all three.** Labels stay Bahnschrift because they are user text and Oxanium has no Cyrillic (measured above: a Cyrillic string falls to the fallback glyph by glyph, which would mix two faces inside one tile name); the spec itself said to check Cyrillic first. Tracking: Ender followed the Foundation ladder (tracking first, one pixel at a time); 5 px puts the edge at 159.22, over 156, and 4 px gives 147.22, 20.8 px before the header art box at 168. The 12-character title loses 12 px per tracking pixel, so there is no half-step to find. In the render Oxanium's chamfered capitals read more angular and more sci-fi than Bahnschrift SemiCondensed and set Sith apart from Empire's Franklin, so I would pick it again. `font-stretch: 87.5%` stays on the title rule: Oxanium has no width axis so it does nothing there, and it makes the Bahnschrift fallback the SemiCondensed face if Oxanium ever fails to load, which is the right fallback.
4. **Empire: "Visual Studio 2022" ellipsizes (105.7 px in a 100 px box). REJECT (F1).** This is a regression the font swap introduced: the spec measured it at 98 px in Bahnschrift and made it a "Done when" item. It is not one name. As built, Empire cuts **four common English names** that every other theme in the batch fits: Visual Studio Code 105.3, Visual Studio 2022 105.7, Windows Terminal 102.8, Command Prompt 102.4 (and the Cyrillic "Панель управления" 114.7 and "Командная строка" 107.3). Rebel, Sith and the other three cut only the two long Cyrillic names. The labels are the text Sergei reads most. Candidates measured in the running app, label ink widths in a 100 px box (over = ellipsis), tile height required 94.7 to 95.4:

| Candidate on `.tile-label` | VS 2022 | VS Code | Win. Terminal | Cmd Prompt | Командная строка | Names that cut | Tile height |
|---|---|---|---|---|---|---|---|
| A as built (11.5 px, 500, 0.2 px) | 105.7 | 105.3 | 102.8 | 102.4 | 107.3 | 4 English, 2 Cyrillic | 94.80 |
| B 0 px tracking | 102.1 | 101.7 | 99.6 | 99.6 | n/m | VS 2022, VS Code | 94.80 |
| C weight 400 | 104.3 | 104.3 | 101.8 | 101.7 | n/m | 4 | 94.80 |
| D 11 px | 101.3 | 100.8 | 98.5 | 98.1 | n/m | VS 2022, VS Code | 94.19 |
| E weight 400, 0 px | 100.7 | 100.7 | 98.6 | 98.9 | n/m | VS 2022, VS Code | 94.80 |
| F Bahnschrift (the spec) | 98.0 | 99.6 | 97.0 | 95.5 | n/m | none | 94.80 |
| **G 11 px, 0 px, line-height 13.8 px, weight 500** | **97.7** | **97.2** | **95.3** | **95.3** | **99.5** | **none (only the two Cyrillic long names)** | **94.80** |

(n/m: not measured for that candidate; the English names settle it.) F fits and G fits. I rule **G** because the Franklin read of the tile labels is the reason this font was approved, and G keeps it with the weight, the case and the colour untouched (Libre Franklin 500 at 11 px reads a little lighter than Bahnschrift 500 at 11.5, clean on the card, with the colour untouched). 11 px alone changes the label's normal line height and puts the tile at 94.19, under the 94.7 floor, which is why the line height is pinned to 13.8 px exactly as Sith's label rule does. Residual: "Панель управления" 106.5 and "Проводник Windows" 111.1 still cut, the same base 100 px box limit every theme has (B4R offer b); "Командная строка" at 99.5 has half a pixel to spare.

## 4. Do the icons read at a glance? (true 1x raster, magnified nearest-neighbour, judged before 6x)

| Theme | Banner icon reads as | Header art reads as | Banner motif reads as |
|---|---|---|---|
| republic | **A domed government building** (brass dome, drum, columns); the skyline beside it settles it as the Senate | Brass ziggurat between curved rings | A dusk skyline with a large dome at centre-right |
| separatist | **Three hexagon rings, one with a blue core**; second read: nuts and bolts (spec watch 2); the hex strip next to it settles it | A honeycomb strip | Four droid busts and a cell cluster |
| empire | **A grey sphere with a trench and a dish**: the battle station, no hesitation | Three readout bars, one red segment | A wedge capital ship, nose left |
| rebel | **An orange helmet with a black visor**; second read: a robot head | Stencil blocks and a reticle | An orange dart locked in a blue reticle |
| sith | **A red saber** | Three inverted talons under a bar | An open cube with a lifted lid |
| mando | **A thick metal disc**; second read: a speaker or a drum (spec watch 2) | A pauldron on a rail | Twin suns over dunes |

Six side by side at 1x (`SQUINT-1x.png`, `SQUINT-1x-blur.png`): they read as six windows (the only ivory one, the only tan header, the only flat grey, the only olive, the only black with red lines, the only brown with rivets). **My squint, title, version and banner text covered:** republic 3, separatist 4, empire 3, rebel 4, sith 4, mando 3. The spec expected 3, 4, 4, 4, 4, 3, so Empire is one lower: a flat grey window with a 22 px sphere says "sci-fi bridge" until you find the ship; it is the theme's brief (flat and rectangular) and not a defect.

## 5. Red-team findings, by theme

Severity words: **Fix** (changed before this is called done), **Note** (real, cheap to leave, Sergei may want it), **Offer** (outside the batch, not asked for, not fired).

- **republic.** Reads as an ivory and crimson window with brass trim, a ziggurat in the header, a domed rotunda in a blue dusk banner. Overlap and clips clean. **Note:** the filter chip's clear mark renders 4.53:1 (declared 8.04), 0.03 over the line; it is a 1 px glyph. The one bright window in the skin list (spec watch 1), unchanged.
- **separatist.** Tan plate header over dark steel, hex strip, trapezoid frame, two-cut plates and window. **Note 1** above: the die glyph at 3.16:1 rendered and the full-screen glyph at 4.10 are faint on the tan at 1x; the tile hover (CIS blue) is the one cue that is not.
- **empire.** Flat console, readout bars, panels and slots, battle station and wedge ship, one red lamp. **Fix F1, F2.** The frame still reads as a perforated rail at 1x (spec watch 4).
- **rebel.** Olive header under a hologram line, webbing and hazard stripes, helmet and reticle. The stencil title is the most characterful in the batch. Nothing to fix.
- **sith.** Obsidian with crimson edge-light, eight-point window, talons, saber and holocron. Oxanium title reads well. Nothing to fix. Real-icon loss on the one-cut plate: GlideX 3.0%, QuickLaunch's own icon 0.6%, the FB2K file icon 0, every mark whole.
- **mando.** Warm steel, rivets, a pauldron, twin suns over dunes, one dented corner. Nothing to fix. Dela Gothic One is the heaviest title and the settings and labels are Segoe UI Semibold, as specified.
- **All six.** Keyboard focus, hover, edit, update and settings states match the spec's descriptions and no state shows an element over another; the A/B/C numbers say the same.

## 6. Optional extras (listed, not fired)

1. **Separatist header glyphs.** The die and full-screen glyphs are the faintest controls in the batch. There is no cheap lever: the ink is already near-black and the glyphs are thin symbol-font strokes, which no weight value thickens. Leave unless Sergei says the buttons are hard to find.
2. **Spec text (mine, after F1 and F2).** Section 7's three hashes and edges, sections 3.2, 4.2 and 5.2 (type tables), section 8 (the three fonts are now adopted, with the scope above) and the Empire `--font` line need updating to the build. Not done here: the brief said write the review only.
3. **Empire squint.** 3 against the spec's 4; no lever needed.
4. **Ender's `report.json` descender block in `full-a` and `full-b` is not evidence.** In those runs the positive control reads 0 at several scales (all six cells for Sith), so those zeros mean nothing; his valid sweep is the separate `dp-a` and `dp-b` runs (controls 130 to 680), which is what I reproduced. Cite the dp runs, not the full ones.
5. **The scratch packaged build is stale.** `batch6-build\build` was built at 15:15; the Sith tracking change landed at 16:09, so its `star-wars-sith.css` differs from the tree (every other source file is identical). The harness measures the tree, so no number here is affected, but QA must test a fresh build of the committed tree.
6. **Long Cyrillic names (base 100 px box)** now cut in every one of the batch's themes ("Проводник Windows" 106 to 111 px, "Панель управления" 102.5 to 106.5), carried from B4R offer b. One base value would cover all 101 themes.
7. **`Libre Franklin` loads 187 KB on first use** by Empire only (`font-display: block`, local file); it is not paid by any other theme.

## 7. Not verified

- The packaged installer was not built or launched, and QuickLaunch's real main process never ran (tray, global hotkey, single instance, updater, real IPC): the harness is renderer-only. Futaba's smoke test of the packaged build covers that.
- Real Windows ClearType and a real 150% panel: my 1.5x is emulated scale on an offscreen window, so LCD fringes can differ from what Sergei sees. Chromium here is Electron 32 (the same as the app), which is the point of reusing the harness over a mock.
- Only six real icons were tried on the shaped plates (Ender's list, GlideX, the FB2K file icon, QuickLaunch's icon, BlueStacks, its logo, Android Studio); I read the numbers, which match the spec to the digit, and did not view the real-icon crops.
- The chip and scrolled states were viewed for Empire only; the other five rest on the numbers (the probe has 22 states each, all 0).
- The updater error bar, the empty-library drop hint beyond Ender's `empty-424` crop (not viewed), and the cheat sheet render (scanned for overflow in Empire only).
- The three font choices rest on my read of renders, not on a fan test.
- Banner lines: I did not re-check the 18 quotes on the web; they rest on the spec's own verification.

## 8. Process and cleanup

- **Browsers: I started none.** No headless Edge, no `headless-browser.mjs` launch (`headless-browser.mjs list` read "no leases" at the start and at the end). The 7 launches were Electron through `run6.mjs`, offscreen, never shown.
- **Leak sweep: 0.** Counted with a read-only CIM listing of all 541 processes (command lines) after the last run: **0 non-shell processes** whose command line names `batch6-review`, `harness6.cjs`, `b6-config`, `QL-B6-Measure` or a headless lease path; **0 `electron.exe`, 0 `msedge.exe`, 0 `quicklauncher.exe`**. Each of the 7 runs also printed "leftover processes naming the run folder: 0" itself. A naive count of my scratch folder name reads 3 to 13 because the `bash.exe` wrappers of this session carry the path in their command line (they are not leaks, and they are excluded by name); the 63 `chrome.exe` are Sergei's and were not touched. Killed: 0 (`run6.mjs` only ends its own child by PID after a timeout, which never fired: all 7 exited 0 on their own); no `taskkill /IM`.
- **Focus and side effects.** The harness stubs show, focus, global shortcuts, login items and dialogs with counters; all 7 runs read `windowShow 0, windowFocus 0, appFocus 0, loginItem 0, globalShortcut 0, dialogs 0, blockedRequests 0, windowOpens 0`. Sergei's QuickLauncher was not running (0 `quicklauncher.exe`), the real profile path is refused by the harness, and each run used a fresh profile under my scratch folder.
- **Network.** One read-only `gh api` call per font folder for directory metadata (names, sizes, git blob ids); no file downloaded.
- **Scratch.** Everything is under `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ee1f77cf-5889-412e-b022-29b9109a8847\scratchpad\batch6-review\`: `specdiff.mjs`, `judy-drive.mjs`, `run6.mjs`, `harness6.cjs`, `cfg*.json`, `runs\<run>\out\<theme>\` (reports and captures), `stack.mjs`, `crop.mjs`, `hue.mjs`, `hue2.mjs`, `squint.mjs`, `count-procs.mjs`, `sheets\`.

## 9. Crops to show Sergei

All under `...\scratchpad\batch6-review\sheets\`:
- `EMPIRE-label-cands.png` (rows: as built, Bahnschrift, G, G at weight 450, 0 px tracking only) and `EMPIRE-fix-vs-built.png` (left as built, right with F1 and F2; grid and hover)
- `EMPIRE-font-override.png` (left as built, right with `--font` in Libre Franklin: Settings, edit, update) and `EMPIRE-label-rows-6x.png` (figures, Cyrillic, the as-built ellipsis)
- `SQUINT-1x.png`, `SQUINT-1x-blur.png`, `ICONS-1x-NN8.png`, `MOTIFS-1x-NN4.png`, `HEADERART-1x-NN4.png`, `HDR-1x-NN3.png` and `HDR-1x-NN3-b.png` (the six title strips at true 1x)
- `S-<theme>-A.png` (hover and focus), `-B.png` (edit and update), `-C.png` (settings and picker), `-D.png` (chip and scrolled) for all six

## Verdict and required fixes

**Verdict:** CHANGES REQUESTED

1. **F1, Empire tile labels (Ender, required, two values in `star-wars-empire.css`).** Line 42 `--tile-label-spacing: 0.2px;` to `--tile-label-spacing: 0px;`, and line 121 to exactly:

   ```css
   .tile-label { font-family: 'Libre Franklin', Bahnschrift, 'Segoe UI', sans-serif; font-size: 11px; line-height: 13.8px; font-synthesis: none; overflow: clip; overflow-clip-margin: 3px; }
   ```

   Why: as built Empire cuts "Visual Studio 2022", "Visual Studio Code", "Windows Terminal" and "Command Prompt" ("Visual Studio 2…"), which the spec fits at 94 to 98 px; the label is the text Sergei reads most. Nothing else in the file changes and no colour is touched. Done when: no ellipsis on those four names or on "Диспетчер задач" and "Командная строка" (mine: 97.7, 97.2, 95.3, 95.3, 92.4, 99.5 px of 100); tile height 94.8 (94.7 to 95.4) at 1x, 1.5x, 2x and scrolled; descender sweep built 0 with a positive control above 100 at all six set-and-scale cells; the A/B/C probe 0 / 0 in the 22 states; `npm run check:contrast` unchanged (101 checked, 0 errors). Measured by me with F1 and F2 applied as a probe stylesheet on the running app: every item above holds (`j-x1`, `j-x2`).
2. **F2, Empire body face (Ender, required, one value and one comment in `star-wars-empire.css`).** Line 19 `--font: Bahnschrift, 'Segoe UI', sans-serif;` to `--font: 'Libre Franklin', Bahnschrift, 'Segoe UI', sans-serif;`, and reword the header comment (lines 6 to 8: "which stays as the fallback and as the body face") to say Libre Franklin is the body face and Bahnschrift the fallback. Why: one face for the whole Empire window (ruling 1); the version, Settings, edit bar, update bar and picker take it. Done when: platform fonts for `#header-version`, `.overlay-title`, `.setting-row label`, `#btn-check-update`, `.edit-label`, `#update-text` read "Libre Franklin (web)"; Settings (424, 640, scrolled to the end), edit, update, edit plus update, chip and the cheat sheet show no overflow that the build does not already have (mine: none); the gate is unchanged. Judy re-checks F1 and F2 together with the same harness and the same crops.
3. **F3, spec text (Judy, after F1 and F2, not done here).** Update the batch-6 spec's section 7 rows (empire, rebel, sith hashes and title edges), the type tables 3.2, 4.2, 5.2, the section 8 status (the three fonts adopted, with the scope in section 3 above) and the Empire label rule.
4. **For Sergei (no code), decide only if he sees them.** The separatist header glyphs are faint on the tan (note 1, section 6 item 1); Empire squints at 3; the long Cyrillic names still cut in every theme (section 6 item 6). None blocks.

Rulings, short: Empire scope **accept**, Empire body face **change** (F2); Rebel Black Ops One **accept**; Sith Oxanium, labels and 4 px **accept**; "Visual Studio 2022" ellipsis **reject** (F1).

## 10. Re-check of F1 and F2 (Judy, 2026-10-01)

Scope: only the two Empire fixes Ender applied. Nothing in the repo was edited by me, no git, nothing that takes focus; the spec's F3 text update (mine) is still not done. This section only adds to the review above.

### 10.1 What was tested, and on what

- **The tree.** `star-wars-empire.css` is now `d617d882` (written 16:51). The other five theme files, `app.js` and `fonts.css` are byte-identical to the first review (`d49a2e3c`, `315aab9a`, `ca4e8e95`, `aaf73851`, `f2480bc3`, `a85b2c25`, `f20fc24e`), checked at the start and again at the end.
- **Diff against the pre-fix copy.** Ender's scratch asar still holds the pre-fix Empire (sha1 `226e86fa`, the same hash I recorded before, so the baseline is the file I reviewed). The diff is exactly what F1 and F2 prescribed: `--font` (line 21), `--tile-label-spacing: 0px` (line 44), the `.tile-label` rule at 11 px with `line-height: 13.8px` (line 123), and the header comment (now says Libre Franklin is the body face, Bahnschrift the fallback). Nothing else moved: no colour, no SVG, no other rule. Against the spec text my extractor now reports exactly five differing lines, all font lines (`--font`, `--tile-label-spacing`, `#title`, `.tile-label`, `#theme-banner-text`), builtSha `9cf7a793`.
- **Runs: 2 harness launches** on Ender's harness (unmodified, same hashes as before), my driver unmodified from the first review, no fix stylesheet this time: `j-r1` (descender sweep and the A/B/C probe on their own) and `j-r2` (everything else, plus my overflow scan). Both exited 0. Statics: 0 `infinite`, `@keyframes`, `will-change`, `backdrop-filter`, `!important`, 0 CR bytes; `check:contrast` 101 checked, 0 errors, 32 legacy warnings (none of the six).

### 10.2 F1, labels: PASS

Label ink widths in the 100 px box, measured in the running app on the built file (no probe stylesheet): Visual Studio 2022 **97.7**, Visual Studio Code **97.2**, Windows Terminal **95.3**, Command Prompt **95.3**, Диспетчер задач **92.4**, Командная строка **99.5**; none ellipsizes. These are the same figures as my probe-stylesheet run and Ender's, to the digit, so the file does what the probe said. The six standard labels: Notepad 44.7, Calculator 52.9, Paint 27.0, Terminal 44.8, Browser 43.5, Files 24.3. Tile height **94.797** and label height 13.797 at 1x, 1.5x, 2x and scrolled one row (94.7 to 95.4 required). Still cut, as every theme cuts them (base 100 px box): "Панель управления" 106.5 and "Проводник Windows" 111.1. A side effect I did not ask for and like: the long mock name "Spreadsheet Editor", which ellipsized in Empire at 640 x 420 before, now fits (seen in `RC-empire-E.png`). Viewed at 3x (Ender's `f1-labels-row1-3x.png`) and at 1.5x in my own grid and hover renders: Libre Franklin 500 at 11 px is clean, one weight, evenly spaced, nothing crowded; the hover white double line is unchanged.

**Descenders:** built 0 px at all six set-and-scale cells (Latin and Cyrillic at 1x, 1.5x, 2x), with the positive control reading **153, 403, 486 (Latin) and 198, 535, 656 (Cyrillic)**, so the sweep can fail and did not.

### 10.3 F2, body face: PASS

Platform fonts now read Libre Franklin (web) for `#header-version`, `.overlay-title`, `.setting-row label`, `#icon-size-val`, `#theme-search`, `#btn-close-settings`, `#btn-check-update`, `#app-version`, `.edit-label`, `#btn-done-edit`, `#btn-add-edit`, `#update-text`, `.update-btn` and `#filter-chip-text` (header button glyphs stay Segoe UI Symbol, as everywhere). My override probe from the first review, run again against the built file, reads **zero width difference** in all eight states, so the build equals what I tested. Overflow scan of every visible element in Settings at 424, Settings at 640, Settings scrolled to the end, edit, update, edit plus update, chip and the cheat sheet: **no overflow**, except the edit-mode tile's remove-button corner (124 in 122 px), which is the base behaviour and the same before the fix. Viewed: the Settings screen, the skin picker, the edit bar, the update bar under the banner and the chip are one face now; the update line and the banner line match. One cosmetic difference, not a defect: the icon-size value "64px" is regular weight where it was bold in Bahnschrift.

### 10.4 Everything else I re-measured on the fixed Empire

| Check | Result |
|---|---|
| Title edge at 424, 640, 1024 (1x), 424 at 1.5x and 2x (gate 156) | 144.05 in all five (unchanged) |
| Banner lines, 3 strings at 424, 640, 1024, 1.5x | all on one line; widest ends 273.9, 46.1 px before the text box edge and 56.1 px before the motif |
| A/B/C overlap and keep-out, 22 states (11 at 1x, 11 at 1.5x) | **0 / 0** in all 22 (strict 0); planted-block control 238 px; smallest art-to-content distance 1.33 px (the banner meets the bar below it) |
| Window clips, 10 state-and-scale cells | 0 clipped points, corners `0000` (square window) |
| Rendered text contrast, 28 roles | lowest 8.34 (declared 8.34) |
| Colour discipline, art-only capture | red only (32 px header, 3 px banner lamp), 0 off-palette pixels |
| Hidden-tiles sigma, loops at capture, hover loops | 0.00, 0, 0 |
| Console errors | 0 |
| Real icons on the plate | 0 lost on all six icons (no plate cut) |

### 10.5 Anything still wrong

Nothing that blocks. The three Notes from the review stand unchanged and are Sergei's to see or ignore: the Separatist header glyphs are faint on the tan (3.16:1 rendered), Empire squints at 3, and two long Cyrillic names still cut in every theme. The spec text (F3, mine) still reads the old way for Empire, Rebel and Sith and is the only open item; it does not need a build change.

### 10.6 Process and cleanup

- **Browsers: I started none** (`headless-browser.mjs list`: no leases, before and after).
- **Leak sweep: 0.** Read-only CIM listing of all 514 processes after the last run, by command line: **0 non-shell processes** naming `batch6-review`, `harness6.cjs`, `b6-config`, `QL-B6-Measure` or a lease path; **0 `electron.exe`, 0 `msedge.exe`, 0 `quicklauncher.exe`**. Both runs printed "leftover processes naming the run folder: 0"; killed: 0 (no timeout, both exited 0 on their own), no `taskkill /IM`. The `bash.exe` wrappers that carry my scratch path are excluded by name, as in the first review.
- **Focus and side effects.** Both runs read `windowShow 0, windowFocus 0, appFocus 0, loginItem 0, globalShortcut 0, dialogs 0, blockedRequests 0, windowOpens 0`.
- **Scratch.** `...\scratchpad\batch6-review\`: `runs\j-r1`, `runs\j-r2`, `recheck.cjs`, `sheets\RC-empire-A.png` to `-E.png` (grid and hover, edit and update, Settings and picker, chip and scrolled, 640 grid and Settings scrolled to the end).

**Verdict:** APPROVED

F1 and F2 are done and reproduce; Empire is approved as built. With the first review's five approvals, all six batch-6 themes are approved. Open after this: F3 (Judy, spec text) and Futaba's QA on a fresh build of the committed tree (the scratch packaged build in `batch6-build\build` predates the Sith tracking change and is stale).
