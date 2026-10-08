# QuickLaunch theme audit — all 101 themes (Judy, 2026-09-30)

Status: complete. 101 entries, 14 batches, font wishlist, out-of-scope findings and summary. Uncommitted, as instructed.

Inputs: gallery `ql-gallery/current/` (QuickLaunch v1.94.3, snapshot bbf7263, window 424x300 at 1.5x, loops frozen at 2500 ms), `theme-metadata.csv`, Makoto's reference sheet (`Team/Research/QuickLaunch_ThemeReferences_2026-09-29.md`), the theme CSS, `create-theme.md`, `scripts/check-theme-contrast.js`. I ran the contrast gate read-only (no rebaseline) to get today's legacy failures. I did not launch QuickLaunch.

Stance: this is a red-team audit. It lists what is wrong. It does not balance that with praise.

---

## 1. Shared constraints (every batch spec inherits this section; batch specs point here instead of restating)

**C1. Original art only.** No copied logos, trademarks or game artwork. Evoke motifs; do not reproduce them. The code is on public GitHub. Where Makoto marks a motif "TM", draw the shape language (a segmented ring, a swept wing, a generic shield) and never the mark itself. Public-domain or public symbols (radiation trefoil, Elder Sign-style star, lambda letter, hexagon, ankh) are fine.

**C2. Fonts: stock Windows 11 only in overnight batches.**
- No web fonts, no `@font-face`, nothing downloaded (CSP is `default-src 'self' data:`).
- Allowed families, all confirmed present in `C:/Windows/Fonts` on this machine and part of the default Windows install: Segoe UI (Light, Semilight, Semibold, Black), Segoe UI Variable, Bahnschrift (variable, DIN-like, has condensed and semi-condensed widths), Franklin Gothic Medium, Impact, Arial, Arial Black, Tahoma, Verdana, Trebuchet MS, Calibri, Candara, Corbel, Georgia, Times New Roman, Cambria, Constantia, Palatino Linotype, Sitka (Text, Small, Banner, Display), Sylfaen, Gabriola, Ink Free, Segoe Print, Segoe Script, Comic Sans MS, Consolas, Courier New, Lucida Console, Lucida Sans Unicode, Microsoft Sans Serif, Yu Gothic (Light, Regular, Medium, Bold), MS Gothic, Malgun Gothic, Microsoft YaHei, Gadugi, Nirmala UI, Segoe UI Symbol, Segoe UI Emoji.
- **Do not reference these even as a first-choice with a safe fallback.** They exist on this machine but are not stock Windows: the Office-only faces (Agency FB, Algerian, Bell MT, Bodoni MT, Bookman Old Style, Book Antiqua, Broadway, Century Gothic, Copperplate Gothic, Franklin Gothic Book/Demi/Heavy/Medium Cond, Garamond, Gill Sans MT, Goudy Old Style, Harrington, Old English Text MT, Papyrus, Rockwell, Stencil, Arial Narrow and the like) and a set of Google faces (Cinzel Black, Orbitron Bold, Russo One, Teko SemiBold, Permanent Marker, Kalam, Limelight, Marcellus SC, Inter, Lato, Quicksand, Sigmar One, Fugaz One, Cabin Condensed and Sketch, Bowlby One SC, Bungee Inline, Courgette, Cookie, Yellowtail, Playball, Shrikhand, Lemon, Megrim, Great Vibes, Doppio One, Ubuntu Mono, Noto Sans, and others). Reason: before/after screenshots taken here would show a font that Sergei's other computers do not have, which is exactly the "measure a proxy" trap. If Sergei approves bundling one, it becomes guaranteed and moves to the allowed list.
- **Not in `C:/Windows/Fonts` on this machine, though the plan names them: Yu Mincho and Cascadia.** Do not use them. (Yu Gothic is there; Yu Mincho is not. Cascadia ships with Windows Terminal, not with the system font folder, so it cannot be relied on for QuickLaunch.)
- **Cyrillic:** Segoe UI, Arial, Bahnschrift, Georgia, Times New Roman, Cambria, Constantia, Palatino Linotype, Consolas, Courier New, Impact, Verdana and Tahoma cover it. Gabriola, Ink Free, Segoe Print and Segoe Script: verify before use on tiny-bunny or stalker.
- **Verify, do not assume.** `theme-metadata.csv` has a `fontsRendered` column. The after-run must list the intended stock families there. If Bahnschrift's width axis does not render through `font-stretch` in this Chromium, fall back to Bahnschrift at normal width with tighter letter-spacing, and tell Judy.
- Wishlist of fonts worth bundling (Sergei's morning decision): section 8.

**C3. Contrast.**
- Every redesigned theme is "modified": `npm run check:contrast` must pass at WCAG 2.2 AA with no legacy pass, and `--rebaseline` is never used to get a theme through.
- The gate checks only five variables, each flattened on black: `--text` and `--text-dim` (4.5:1), `--accent-c` and `--accent-text` (3:1), `--hint-sub-color` (4.5:1). Declare all five in every redesigned theme so nothing falls through to base.css by accident.
- The gate does NOT check tile labels over art, banner text, header text, or a translucent `--bg` over a light desktop. Judy's manual add-ons, measured and reported as numbers:
  - Tile label colour against the brightest art pixel directly behind a label: at least 4.5:1.
  - Banner text and title against their strips: at least 4.5:1 (decorative header text is deleted, see H2).
  - Translucent themes (today: ac-assassins, ff10, ghost-shell, rivendell, wow-scourge): measure `--text` over white and over mid-grey, not only over black. Either raise `--bg` alpha to at least 0.85 or pass 4.5:1 over white.
- Today 13 themes fail the gate and are on the legacy list: ac-templars, blair-witch, dragon-age, event-horizon, ff14, ff7, lovecraft, portal, siren, swl-templar, the-sandman, twin-peaks, warhammer-chaos. Each of those is marked "CONTRAST" in its entry.

**C4. CPU. No theme gets more expensive than today; the target is much cheaper.**
- Today: mean 6.0 infinite animations per theme frozen at capture (range 4 to 8), mean 3.3 embedded SVG images, mean 17 KB of CSS. The guide's measured cost is 55 to 83 percent of one core while focused for a whole theme.
- Motion budget for every redesigned theme: at most **2** infinite animations, both on `opacity`, `transform` or `color` of a small element, stepped where possible. None on `#app` box-shadow. None on `background-position` of a full-window layer. No `clip-path` animation except `steps(1)`. A theme whose motion IS its identity (matrix rain, pip-boy flicker) may keep exactly one stepped full-layer animation and must say so in its spec.
- Default for calm franchises (Harry Potter, horror, parchment, prestige TV): zero infinite animations except an optional slow title fade.
- Do not add `will-change` in theme CSS. Do not add a `backdrop-filter`. Static tiled textures (grain, halftone, weave) cost nothing and are allowed; animating them is not.
- Removing motion is allowed and expected. Acceptance: count `infinite` in the after-CSS; the after-run's `loopingAnimationsAtCapture` must be lower than the before-run for every theme.

**C5. Nothing may cover or crowd the content.** (ProcessRules: no UI element may cover another.)
- Geometry at the default 424x300 window (from the 1.5x screenshots): header 0 to 40 px (title left, four buttons right); tile field is a 3 column by 2 row grid filling the whole grid area with a 16 px pad and 8 px gutters (about x 16 to 408, y 56 to 250); banner strip about y 257 to 300. In practice the tiles use essentially all of the grid rectangle. There is no free "empty area" behind the tiles at the default size.
- Therefore, in the grid rectangle behind the tiles only **tone and texture** are allowed: gradients, vignette, static grain, weave, halftone, soft light pools. No glyphs, no numerals, no words, no schematics, no reticles, no rings, no silhouettes with a hard edge that crosses a tile or a label.
- Distinct art lives in: (a) the frame, meaning the 16 px pad band and window edges (corner ornaments, rails, rivets, border bands, bunting); (b) the header strip between title and buttons; (c) the banner strip; (d) the 8 px gutters (rules, dividers). At larger windows the same rule applies, and the art must not be scaled up into the tile field.
- Decorative header text: delete it, or cap it at 14 characters and measure that its box ends at least 8 px before the first button (H2).
- Check every state, not only the default: hover, focus-visible ring, drag-over, edit mode bar, filter input open, update banner, settings overlay, skin picker, cheat-sheet overlay, and windows sized 424x300, 640x420 and 1024x700.
- Verification method (measured rects, not eyeballed): capture each theme twice, tiles visible and `#app-grid{visibility:hidden}`. In the hidden-tiles shot, the luminance standard deviation inside each tile rect (from `getBoundingClientRect`) must stay at or below the reference values Ender records in batch 1: `2001` (flat light texture) as the floor and `promise-mascot` (grain plus halftone, the busiest texture allowed) as the ceiling. Every later theme stays at or below the `promise-mascot` value. Judy reviews the hidden-tiles shot.

### Hygiene pass (H1 to H8): every redesigned theme applies all of these; per-theme entries do not repeat them

- **H1. Delete `#grid-container::after` (the ghost readout) in every theme.** All 101 have one. It paints 12 px text at 8 to 14 percent alpha (median 10) behind the right tile column and labels, and in 91 of 101 at least one string is corrupted (see G3).
- **H2. `#header::after`:** delete, or at most 14 characters, and keep it left of the buttons with at least 8 px clearance. Minimum 10 px if kept.
- **H3. `#edit-bar::after` and banner quotes:** every string must fit on one line at 424 px with no ellipsis (measure `scrollWidth <= clientWidth`); the banner holds roughly 40 characters at the current size, so measure, do not count. Banner quotes live in `app.js` `THEME_BANNERS`; Ender changes the strings named in the spec. Real, short, recognisable quotes only; no invented lore.
- **H4. Retire the 88 percent synchronised flash/blackout** (art blackout to 0.04, title flash to white then transparent, window border flashed white). Keep no synchronised event unless the spec names one that the franchise really has (a screen glitch in Cyberpunk, a lightning flash in Diablo).
- **H5. `#particles`:** remove full-window `background-position` scrolls (30 to 39 percent CPU alone). If a franchise needs particles, use a static tile or at most 3 to 5 small `transform` elements.
- **H6. Tile icon shape:** the "shape must be unique" rule in `create-theme.md` produced 101 arbitrary polygons. Judy retires it: shapes may repeat inside a franchise family, and a shape must never crop the glyph. Each spec names the shape and why (a franchise-meaningful silhouette, or `inset(..round ..)` for most).
- **H7. Tile icon treatment:** all six icons are the app's own coloured art (Paint's rainbow palette shows through in every theme). `--tile-icon-fx` may tint (sepia, grayscale, hue-rotate, saturate) so the icons sit inside the palette; it may not push them below 3:1 against the tile background.
- **H8. Type:** set `--font` from the stock list in C2 and vary `--tile-label-*`, `#title` weight, case and tracking deliberately. Body text stays at least 11 px; nothing functional below 10 px.

---

## 2. What is wrong in all 101 themes (global findings)

- **G1. One template, 101 tints.** Every theme is the same kit: a painted SVG "panno" behind the grid, a ghost readout bottom-right, header flavour text, an edit-bar quote, a scrolling particle layer, a synchronised 88 percent flash. The franchise is carried by a colour tint and a paragraph of painted microtext. Layout, motion and rhythm are identical from Star Wars to Hogwarts to Doom. That sameness is most of what makes them "look weird".
- **G2. Painted microtext is illegible.** The panno SVGs are 500x380 units scaled with `contain` into the grid area (about 392x184 px at the default window), a scale of about 0.5, so 7-unit text renders near 3.5 px. It cannot be read and it sits behind the tiles. It is noise, and in many themes it is invented lore (Empire lists "CREW 1,186,295", Promise Mascot invents "EST. 1987").
- **G3. The ghost readouts are corrupted.** In 91 of 101 themes at least one `content:` string uses `\A` as a newline immediately before a hex digit (0 to 9 or A to F). CSS swallows up to six following hex digits into the escape. Empire's `GALACTIC\AEMPIRE` renders `GALACTIC(R)MPIRE`; `\ACORUSCANT` renders `ORUSCANT` with a stray symbol. The screenshot shows both. Fix by deleting the readouts (H1). Only blair-witch, broken-sword, doom-classic, dragon-age, ff15, hogwarts, mirrors-edge, persona-4, terminator and tiny-bunny are unaffected.
- **G4. Header flavour text collides with the buttons.** Set at `left: 200px`, 7.5 to 8.5 px, 45 to 60 characters. It runs under the button cluster and is clipped in every theme ("IMPERIAL CO..."). It is also below any readable size.
- **G5. Banner quotes are cut off.** The banner holds about 40 characters at 11 px with 2 px tracking. Of the 471 quotes in `THEME_BANNERS`, 194 (41 percent) are longer and end in an ellipsis; the gallery shows it in blade-runner, swl-illuminati and uncharted, among others.
- **G6. The 88 percent flash is the same heartbeat in every franchise.** Art blacks out, the title flashes white then vanishes, the window border flashes white, roughly every 10 to 14 seconds. It is wrong for parchment, cozy and light themes (Hufflepuff, Shire, Mirror's Edge, Portal, Silent Hill) and it is why the themes read as glitching rather than as places.
- **G7. CPU.** The costly pieces are in all of them: `#app` box-shadow animation (about 55 percent of a core on its own), `#particles` scroll (30 to 39), title and readout animation on top. A hidden second cost of the old template: painted art plus animation for detail nobody can read.
- **G8. Type is three families.** 47 themes lead with Segoe UI, 35 with Georgia, 18 with a monospace (Consolas or Courier New), 1 with Arial. No theme uses Bahnschrift, Franklin Gothic, Palatino, Constantia, Cambria, Sitka, Sylfaen, Gabriola, Ink Free, Segoe Print or Script, Trebuchet, Lucida Console or Yu Gothic, though all are stock (only pip-boy's title uses Arial Black and deus-ex's title uses Impact). Type identity today is tracking and uppercase, nothing else.
- **G9. Icons are identical everywhere.** Six coloured app icons, only clipped and filtered per theme. The "unique shape" rule forced arbitrary polygons (Empire's octagon has no meaning; Persona 3's "coffin lid" crops the top corners of the glyph). Retire the rule (H6).
- **G10. The contrast gate is a low bar.** Five variables on black. It passes themes whose labels sit on busy art and translucent themes over a bright wallpaper (C3).
- **G11. The palette is a hue, not a look.** Most themes are near-black with one tinted accent. Franchises whose real look is light or mid-tone (2001, Mirror's Edge, Portal, Silent Hill, Twin Peaks' wood and cream, Hufflepuff's honey, Shire's earth, Dune's sand, Indiana Jones's leather) are mostly dark with a coloured glow.

---

## 3. Era and game calls (delegated to Judy by Sergei)

- **`diablo`: Diablo II.** The CSS already says Prime Evil, Horadric seal, Lord of Terror, Sanctuary (D2 lore), and the D2 look (gritty stone-and-iron, gold text, red and blue globes, item-quality colours) is the one that renders in flat CSS without painterly polish; D3 is saturated cartoon-painterly and D4 is modern-muted.
- **`dragon-age`: Origins.** The theme is built on the Grey Warden oath, the Blight and Urthemiel, which is Origins; Origins' worn parchment, blood-spattered leather and dark stone is also the least confusable with The Witcher, and Inquisition and Veilguard are different, brighter looks.
- **`persona-3`: original Persona 3 (2006), not Reload.** The original's flat cyan-on-near-black tilted blocks are cheap to build in CSS; Reload's glossy translucent blue depends on blur, gradient and animation, which C4 forbids and which would push the theme toward the shiny Persona 5 look.
- **`nonary-games`: Nine Hours, Nine Persons, Nine Doors (999).** The header names "9 hours, 9 persons, 9 doors" and the numbered bracelet, and 999 is the rust-and-steel ship with numbered doors and the LCD bracelet; the blue sci-fi look in the CSS belongs to none of the three games (Makoto's "blue sci-fi" pitfall), and VLR (white and red) and ZTD (clinical blue-green) are separate identities.
- **`eve-online`: the general capsuleer interface, with no single empire.** The CSS header says "cold steel blue" (Caldari), but Sergei named the game, not a faction, so the neutral dark-panel, small-grey-text, orange-bracket overview interface is what any EVE player recognises; the four empire colours appear only as tiny tags if at all.

---

## 4. Ruling: `promise-mascot`

**Ruling: the premise is wrong; replace it. Redraw.**
- The CSS header ("corporate pastel turning sinister") is not the game, and the theme is not even pastel: it is dark purple (`#0E0A12`) with pink and teal, plus invented dystopia copy ("EST. 1987", "DIVISION OF WELLNESS", "COMPLIANCE IS JOY"). None of it appears in Makoto's sourced descriptions of the game.
- The real look (Makoto, sourced): Showa-era Japanese cinema, lo-fi desaturated scenes with heavy grain and colour shift like a rewound VHS, a dying rural town, pop-art UI in the spirit of Persona 4 (bold panels, clear icons), black-and-pink spirit creatures, paper dolls (hitogata), shadow-cutout people, comic absurdist tone.
- New direction: washed near-black (`#1C1A1E`), faded film beige-grey text (`#B8B0A0`), spot pink (`#E0508C`) and pop yellow (`#F0D040`) used sparingly, everything else desaturated. Static tiled film grain and a faint halftone (no animation), bold rectangular panel borders with a hard offset shadow for tiles, a torn-edge banner strip. Motifs: a paper-doll silhouette and a black-and-pink spirit blob in the header strip only, drawn originally, no game mascots. Type: Arial Black or Segoe UI Black for the title, Yu Gothic Bold for labels (Showa signage feel), tight tracking. No confetti, no smiley, no invented copy. Banner quotes: none from the game are reliably short, so write neutral in-tone labels, or keep the app's plain quotes.
- Wishlist font: Dela Gothic One (OFL, Cyrillic yes).

---

## 5. How to read the entries

- **Score (fidelity, 1 to 5):** 5 a fan says "that is it" with no reservations; 4 palette, type and motif are right and only details are off; 3 palette right but type, layout or art is generic or partly wrong; 2 wrong era or mood, or art that misleads; 1 wrong premise or actively off-brand. I scored hard. Nothing scores 5: no theme has franchise-correct type, and type is half of a look.
- **Art call:** **redraw** = replace the painted art with new original art in the franchise's style, inside the C5 zones; **tone down** = keep palette, type and small motifs, delete the painted panno and readouts, and add a light frame or texture; **keep** = the art is acceptable, only H1 to H8 apply.
- **Font gain:** "Bundle: yes" means the theme would clearly gain from a bundled font (name in section 8). "Bundle: no" means stock fonts get it to the same level.
- Each entry ends with a redesign direction of 2 to 4 lines. Hex values are Makoto's approximations unless the source is marked sourced.

---

## 6. Theme entries

### 6.1 Star Wars (6)

Family read: all six share one template and one blue-black wash. The saga's actual differences (Empire cold and rectangular, Rebel warm and stencilled, Republic gleaming ivory and crimson, Separatist droid-tan, Sith angular, Mando dusty frontier) barely show. Franchise-wide type gap: the films use a Franklin-Gothic-style sans; only Franklin Gothic Medium is stock.

#### star-wars-empire — STAR WARS: GALACTIC EMPIRE
Score 3 | Art: tone down | Bundle: no
Wrong: right near-black, gunmetal and sparing red, but a full Death Star sphere with a spec table sits behind CALCULATOR and BROWSER, its trench line running along the CALCULATOR label. The readout is corrupted ("GALACTIC(R)MPIRE") and crosses PAINT and FILES. Segoe UI Light is generic; the octagon icons mean nothing; the title flashes white, which is Sith, not bureaucratic.
Direction: delete panno and readout. bg `#0B0C0E`, gunmetal `#8A8F94`, red `#D0161D` on the edit bar only. Frame art: corner ticks, three stacked bars in the header strip, a six-segment split ring (cog evoked, not copied) as banner icon. Franklin Gothic Medium, wide tracking. Square tiles. No animation.
#### star-wars-rebel — STAR WARS: REBEL ALLIANCE
Score 3 | Art: redraw | Bundle: yes (Black Ops One, Libre Franklin)
Wrong: orange text on black with no khaki, olive, stencil or hologram blue, so it reads as generic amber. A faint diamond frame and starfield speckle sit behind the middle tiles; the readout ("MANY BOTHANS DIED", corrupted) runs down the right column and the banner repeats it, truncated. Pennant-crop icons have no Rebel meaning. Consolas and Segoe mixed.
Direction: bg `#1A1712`, text `#F2E6C8`, orange `#E8721C` on the edit bar, focus ring and title only, olive `#6B7B4E` header strip, hologram blue `#3A78B5` accent line. Frame art: rivet line on the pad, stencilled "01 02 03" in the header, a swept-wing angle at the banner. Bahnschrift SemiBold caps. 2 px tiles. No animation.
#### star-wars-republic — STAR WARS: OLD REPUBLIC
Score 2 | Art: redraw | Bundle: no
Wrong: wrong faction look. The Republic is ivory, crimson and brass Coruscant deco; this is a navy-violet Jedi-meditation screen with a magenta accent (`#C040A0`) and italic serif. Faint Force rings sit behind the middle tiles, and the readout ("THERE IS NO EMOTION...", "CORUSCANT") crosses the right column. Banner truncated.
Direction: bg `#14161C`, text `#F5F5F0`, brass `#D9B44A` accent-c, crimson `#A4211F` for edit, Coruscant blue `#2C4A7A`. No magenta or violet. Frame art: stepped ziggurat in the header strip, a curved Senate-pod arc in one corner, a notched six-spoke ring as banner icon. Palatino Linotype caps. Rename to "STAR WARS: GALACTIC REPUBLIC". No animation.
#### star-wars-separatist — STAR WARS: SEPARATISTS
Score 2 | Art: redraw | Bundle: no
Wrong: no droid tan anywhere; it is a blue-black terminal with grey caps. Faint schematic lines and dots sit behind the tiles, "ROGER ROGER / ARMY ONLINE" prints down the right column, a control-sectors line runs under the BROWSER row, and "ROGER ROGER" repeats in the header and banner. Icons are plain rounded squares.
Direction: bg `#14171B`, steel `#5C6B78`, droid tan `#C69A5B` as accent-c (this alone fixes the theme), CIS blue `#2A7FA8` for hover, dull red `#7C2B2B` for edit. Frame art: static honeycomb strip in the header, angular plate seams on the pad, an elongated droid-head oval as banner icon. Bahnschrift caps. Trapezoid tiles. No animation.
#### star-wars-sith — STAR WARS: SITH
Score 3 | Art: tone down | Bundle: no
Wrong: everything is red: rose text (`#D88080`), red buttons and borders, a red triangle behind CALCULATOR and BROWSER with slash marks, and the Sith code in the readout, header and banner. That is the red-black demon skin Makoto warns against, not angular and ancient. Batwing icon crop is a fair idea. No cold metal or amber.
Direction: bg `#0A0708`, neutral text `#D8D2CE`, crimson `#B3121A` accent-c and edit bar, oxblood `#4A0A0E` hover fills, cold metal `#9EA2A8` borders, one dim amber `#E0A030` banner icon. Frame art: jagged corner cuts, a thin red edge-light on the header bottom, a small holocron cube at the banner. Bahnschrift SemiBold caps. Static.
#### star-wars-mando — STAR WARS: MANDALORIAN
Score 3 | Art: redraw | Bundle: no
Wrong: dusty grey and amber is the right neighbourhood, but a helmet-shield outline is drawn behind the whole centre column (too close to reproducing the character design), with a lozenge running through the CALCULATOR label, and creed text down the right side. Beskar reads flat, not brushed steel. The T-notch icon crop and "T" banner icon are good.
Direction: bg `#17130F`, beskar `#8C959C`, rust `#B4632D` accent-c, sand `#C9A97A` text, forge `#D48A24` on hover and focus only. Frame art: pauldron scoring lines in the header, rivets on the pad, a dented-plate corner; no helmet outline. Bahnschrift SemiBold, wide tracking. Keep the T-notch tiles. No animation, no dust.
### 6.2 Warhammer 40,000 (6)

Family read: all six are the same "tactical dossier" panno (rosters of chapters, craftworlds, hive fleets, klans) with the faction name swapped, plus a serif or Segoe UI label. Warhammer's six factions are defined by material (gothic gold and parchment, spiked corrupted plate, wraithbone curves, green-seam tomb metal, scrap and paint, wet chitin), and the theme set expresses none of the materials; it expresses six hues. Faction names and chapter names as painted text are unnecessary and the symbols are Games Workshop marks: draw shapes, not marks.

#### warhammer — WARHAMMER 40K: IMPERIUM
Score 3 | Art: tone down | Bundle: yes (Cinzel, UnifrakturCook, IM Fell English)
Wrong: gold on black with cut window corners is the right instinct, but there is no parchment or weathering. A Blood Angels dossier (SEGMENTUM SOLAR, SANGUINIUS) prints in microtext beside every tile, an eagle ring sits behind CALCULATOR, and the corrupted readout ("OMNIS(R)RCANUM") crosses PAINT. Georgia caps read as generic old book, not gothic; shield-crop icons.
Direction: bg `#0E0C0A`, gold `#C79A2C`, crimson `#B0181B` on edit only. Parchment `#D9C9A1` banner strip with dark text and a wax-seal dot as banner icon. Frame art: rivet row and gothic-arch corner notches on the pad; no eagle or skull marks. Palatino Linotype caps, wide tracking. Static.
#### warhammer-chaos — WARHAMMER 40K: CHAOS
Score 2 | Art: redraw | Bundle: yes (Pirata One, Grenze Gotisch) | CONTRAST (legacy fail)
Wrong: red and black with four god colours at once means no god is chosen, so it is none of them. A radial star of lines with a red hub sits behind CALCULATOR, four coloured god bars run beside CALCULATOR and PAINT, god names print on the left, and the banner truncates. Smooth and tidy, not spiked or cracked. Fails on text-dim, accent-c, hint-sub.
Direction: choose Khorne-leaning Undivided: bg `#0A0708`, corrupted red `#8E1B15`, tarnished brass `#B8863A` accent-c (reach 3:1), warp purple `#4A1F58` on hover fills only. Frame art: static spike teeth on the header bottom and banner top, a cracked-corner notch, a spiked ring (not the eight-arrow star) as banner icon. Georgia bold caps. Static.
#### warhammer-eldar — WARHAMMER 40K: ELDAR
Score 3 | Art: redraw | Bundle: no
Wrong: italic serif labels suit it, but the blue-on-black palette with an orange secondary is Imperial-looking, not spirit-stone teal and bone, and a rectangular corner-bracketed dossier frame (craftworld and aspect-warrior lists) is the boxy geometry Makoto warns against. The faceted icons read as crude rocks, not wraithbone.
Direction: bg `#0F1620`, spirit-stone teal `#2DB6A3` accent-c, bone-gold `#E8D48A`, text `#F0EBDD`, craftworld red `#E0483C` on edit only. Frame art: long S-curve swoops in two opposite pad corners, a slender pointed arch behind the title, a teal gem dot as banner icon; no right-angle ornaments. Constantia italic, generous tracking. Teardrop tiles. Static.
#### warhammer-necrons — WARHAMMER 40K: NECRONS
Score 3 | Art: tone down | Bundle: no
Wrong: green on black in a sans is the same look as matrix and pip-boy, not a Necron. Silver, bronze and tomb geometry are missing; text is green, so the gauss glow never reads against anything. A Monolith slab with a green eye sits under CALCULATOR, a roster prints left of NOTEPAD and PAINT, and the readout crosses PAINT and FILES. Banner truncated.
Direction: bg `#08100C`, brushed-silver `#B7B9B0` text, gauss green `#2BD660` only for accent-c, focus and one seam line, bronze `#6E5A2E` borders. Frame art: thin green energy seams on the header bottom and pad edge, triangular pyramid notches in the corners, a plain hexagon as banner icon. Bahnschrift SemiBold caps. Static.
#### warhammer-orks — WARHAMMER 40K: ORKS
Score 2 | Art: redraw | Bundle: no
Wrong: clean, symmetric layout in green caps; Orks are crooked, battered and painted, and the brown-black rust is replaced by green-black. A painted shoota lies across the middle, touching the NOTEPAD, CALCULATOR and PAINT labels, with a DAKKA LEVEL gauge beside NOTEPAD. Gag copy in the readout, header and banner.
Direction: bg `#1B1710`, skin green `#4C8A2B` as accent-c only, text `#E8DCA0`, yellow `#D4A012`, red `#B01E1E` on edit, scrap `#7A7E82`, rust `#6B4A24`. Frame art: a static chequer band on the header bottom and banner top, red speed-stripe ticks in the gutters, a bolted plate corner. Impact title, Ink Free bold labels. Static.
#### warhammer-tyranids — WARHAMMER 40K: TYRANIDS
Score 2 | Art: redraw | Bundle: no
Wrong: purple, but staged as an Adeptus Mechanicus analysis dossier ("HIVE FLEET ANALYSIS", bioform and fleet lists) inside a square corner-bracket frame, with a face behind CALCULATOR. Tyranids are wet, ribbed and organic, with no straight lines or metal. Gold secondary does not belong. V-bottom shield icons are fine.
Direction: bg `#150C14`, hive purple `#7B2A6E`, flesh pink-red `#C4436B` accent-c, chitin `#E6D9B8` text, carapace `#3A2A3E` fills. Frame art: a ribbed carapace band (repeating radial gradient) on the header bottom, curved tendril arcs in two corners, a translucent-membrane gradient in the banner. Constantia bold. Keep V-bottom tiles. Static.
### 6.3 World of Warcraft (5)

Family read: WoW's shared identity is chunky, painterly heroic fantasy: gold-trimmed stone, dark wood and leather frames, tooltips with a thin gold border. None of that exists here. All five are flat tinted panels with a painted faction "roster" (races, leaders, capitals) that is unreadable microtext. Faction crests are Blizzard marks: draw a generic shield or spiked star, never the crest.

#### wow-alliance — WOW: ALLIANCE
Score 3 | Art: tone down | Bundle: no
Wrong: navy and gold is right, but it is a flat blue panel with a heater-shield and lion painted behind CALCULATOR and BROWSER (the outline runs through both labels), a faction roster left of CALCULATOR and ghost words down the right. No gilding, stone or leather. Georgia caps are neither Friz Quadrata nor Cinzel.
Direction: bg `#0F1A2E`, blue `#1E4FA8` for edit bar and focus, gold `#E4B93C` accent-c, silver `#C9D4E8` text. Frame art: a 1 px gold tooltip border with stepped battlement notches on the header top, a fluted banner shape behind the banner icon. Palatino Linotype, caps at 90 percent size. 2 px tiles with a thin gold hover border. Static.
#### wow-horde — WOW: HORDE
Score 3 | Art: redraw | Bundle: yes (Metamorphous, Pirata One)
Wrong: red-black with tan text is Makoto's "generic evil red-black"; bronze, hide and iron are missing. A red spiked sun is painted behind NOTEPAD, a race roster prints right of CALCULATOR, and ghost lines cross the bottom row. The "LOK'TAR OGAR" banner is the one on-brand piece.
Direction: bg `#150A0A`, blood red `#A31414` for edit and hover, bronze `#C4772B` accent-c, hide `#6E5B3C`, text `#E6D2B0`, iron `#1A1A1A` fills. Frame art: a static thorn border on the header bottom and banner top, bone-tusk corner ticks, tribal chevrons in the header strip. Georgia bold caps, tight tracking. Keep the wavy-edge tiles. Static, no debris.
#### wow-legion — WOW: BURNING LEGION
Score 3 | Art: redraw | Bundle: yes (Grenze Gotisch, Cinzel Decorative)
Wrong: concentric portal rings are the right motif but sit behind CALCULATOR and BROWSER at full strength, with a roster beside NOTEPAD and TERMINAL and a corrupted readout ("THE LEGION(<)URNS") crossing PAINT and FILES. Everything is green, including text: the Matrix-toxic pitfall; obsidian and demonic purple are absent.
Direction: bg `#06100A`, obsidian `#0D0D0D` panels, text `#D6E8C4`, fel `#3AD41E` accent-c only, pale fel `#8AE35A` for focus, purple `#2B1B3A` hover fills. Rings become a static texture at 6 to 8 percent alpha; one small ring as banner icon. Jagged tooth frame on the header bottom. Bahnschrift SemiBold caps. Keep hex tiles. No embers.
#### wow-nightelf — WOW: NIGHT ELVES
Score 3 | Art: tone down | Bundle: no
Wrong: violet and italic serif are the right mood and the banner works. Faint moonwell rings sit behind CALCULATOR, and a roster ("TYRANDE WHISPERWIND", "TELDRASSIL") prints between the gutters and down the right column, touching PAINT and FILES. Forest green and moon silver are missing; the lumpy 12-point icon crop distorts glyphs.
Direction: bg `#0E0A1E`, moonlit purple `#7B5CC4` accent-c, teal `#52D2C8` for focus, moon silver `#C8D6E8` text, forest `#2F5A3E` borders. Frame art: curved branch-and-antler corners in the upper pad corners, a crescent as banner icon, a soft violet top gradient. Constantia italic, sentence case. Arch-top tiles. Static.
#### wow-scourge — WOW: SCOURGE
Score 2 | Art: redraw | Bundle: yes (Pirata One, Grenze Gotisch)
Wrong: "clean icy look lacks menace." A runeblade line runs diagonally from TERMINAL through the BROWSER label to the top right, a skull face sits behind the BROWSER tile, a lich roster prints left of NOTEPAD, ghost text down the right. No spikes, chains or cracked ice. `--bg` is declared at 0.50 alpha, so on a bright wallpaper it bleeds through.
Direction: bg `#05080D` at 0.94 alpha, frost blue `#4E9EC8` accent-c, necrotic teal `#5AE0B0` for focus, frozen steel `#8A93A0` borders, plague purple `#4A2B5E` hover, text `#DCE8F0`. Frame art: a static icicle-spire row on the header top, chain-link ticks on the pad edge, a cracked-corner notch. Georgia bold caps, wide tracking. Static; pass 4.5:1 over white if any transparency stays.
### 6.4 Harry Potter (6)

Family read: the houses should share a shield-and-banner heraldic frame and differ by colour pair and beast, with warm candlelit British-gothic serif type. Here they share almost nothing: Gryffindor is a cluttered codex, Ravenclaw is a sparse star field, and the rest sit between. Two of them (gryffindor, hufflepuff) print named characters and house-point tables as painted microtext. House crests are Warner Bros marks; draw banners, shields and beasts as generic shapes only.

#### gryffindor — GRYFFINDOR
Score 2 | Art: redraw | Bundle: no
Wrong: the worst overlap in the set. A gold-framed "HERALDIC CODEX" is painted behind every tile: virtue bars behind NOTEPAD, a house-points roster (POTTER, H. / WEASLEY, R.) behind PAINT, a red lion-burst under the CALCULATOR label, and ghost text down the right. Near-black bg with amber text has no firelight or scarlet warmth. Banner truncated.
Direction: bg `#1A0C0C`, scarlet `#740001` for edit and header tick, gold `#D3A625` accent-c, parchment `#EEE1C6` text, oak `#3A2418` borders. Static warm gradient low in the frame. Frame art: gilt double rule on the pad, a swallow-tail pennant as banner background, static tartan weave at 4 percent. Palatino Linotype italic. Keep shield icons without clipping the glyph. Static.
#### hogwarts — HOGWARTS: MARAUDER'S MAP
Score 3 | Art: tone down | Bundle: no
Wrong: the premise is the Marauder's Map (aged parchment, ink footprints, folded flaps), but the window is black-brown with a gold tint; there is no parchment anywhere. Faint frames, a few footprints and ghost text ("I SOLEMNLY SWEAR...", "MISCHIEF MANAGED") sit behind the tiles, and a sparkle animation runs (Makoto's pitfall). Shield crop has no map link.
Direction: mid-tone map look: bg `#241C12`, parchment `#EFE4C8` text, ink `#3A2418`, gold `#C9A227` accent-c, night blue `#2A3A5A` for focus. Frame art: a folded-flap corner (static triangle gradient) at the banner, three ink footprints in the header strip, thin ink border. Constantia italic. 2 px tiles. Static, no sparkles.
#### hufflepuff — HUFFLEPUFF
Score 2 | Art: redraw | Bundle: no
Wrong: the friendly, earthy house is a black gothic panel. A cup-and-badger outline sits behind CALCULATOR, virtue bars behind NOTEPAD, a "notable badgers" roster (CEDRIC DIGGORY, NEWT SCAMANDER) right of CALCULATOR, and "THE BADGER BURROWS DEEP" runs across the bottom row through the icons. No honey, cream or copper. Banner truncated. Barrel icons are fine.
Direction: bg `#1A160C` with a static warm gradient, canary `#FFC500` only for accent-c and focus, honey `#8C6A2A` borders, cream `#EEDDAA` text, black only for badge stripes. Frame art: two muted badger-stripe bands on the header bottom and banner top, a round-door arc as banner icon. Constantia, sentence case. Static.
#### ministry-of-magic — MINISTRY OF MAGIC
Score 3 | Art: redraw | Bundle: yes (Limelight, Poiret One, Special Elite)
Wrong: dark teal-green is right and the double deco frame is a good start, but green memo-triangles float over the tiles, brass "H.M. MINISTRY OF MAGIC" lettering runs across the CALCULATOR icon row, and a level-directory box sits under PAINT. Two animations for memos. The "MAGIC IS MIGHT." banner is on brand.
Direction: bg `#0E1512`, teal-green `#1F5B4B` panels, brass `#C7A45A` accent-c, cream `#E8DDC0` text, memo red `#8A1F1F` on edit, purple `#604080` hover. Frame art: static deco sunburst in the header strip only, brass lift-grille lines in the gutters, a small folded memo-plane as banner icon. Constantia small caps, wide tracking. Keep pentagon tiles. Static.
#### ravenclaw — RAVENCLAW
Score 4 | Art: keep | Bundle: no
Wrong: the best of the house set: midnight blue, circle icons that carry the glyphs, italic serif, sparse stars. Small faults: header text collides with the buttons, faint ghost text sits down the right column, constellation lines run between tiles, banner truncates, there is a border pulse and star drift. Bronze appears nowhere; the accent is plain mid-blue.
Direction: keep bg `#0B1020`, midnight `#0E1A40` panels, circle tiles. Move bronze `#946B2D` to accent-c so the pair reads blue-and-bronze, text `#C7D4EE`. Remove readout, border pulse and drift (H1, H4, H5). Add a crescent-window banner icon. Constantia italic. Static.
#### slytherin — SLYTHERIN: DARK ARTS
Score 3 | Art: tone down | Bundle: no
Wrong: emerald, silver and black are right, but the diamond crop reads as a warning sign and pinches the glyphs, and a caustic shimmer animates across the window. Ghost text down the right column is corrupted ("CUNNING(8)MBITION"). Makoto's brief is polished, cold and understated; this is a dark green wash with dark leaf shapes. Banner truncated.
Direction: bg `#061410`, green `#1A472A` panels, silver `#AAAAAA` accent-c, stone `#5D5D5D` borders, text `#D8E6DC`. Frame art: one S-curve serpent line along the header bottom, faint lake-ripple arcs (static repeating radial gradient at 5 percent) in the top corners only. Palatino Linotype caps, wide tracking. 4 px radius tiles instead of diamonds. Static.
### 6.5 Middle-earth (3)

Family read: three different moods (jagged iron, silver Art Nouveau, round earthy comfort) should be three different geometries. Here Mordor and Shire both use rectangles-plus-glow and Rivendell is a soft blue wash. None uses Tolkien-style lettering; only Gabriola is a stock face with the right storybook character, and only for titles. The Eye of Sauron poster art is a mark: evoke it (a vertical slit pupil in flame), never redraw the film's eye.

#### mordor — MORDOR
Score 2 | Art: redraw | Bundle: yes (Metamorphous, Uncial Antiqua)
Wrong: a dirty orange-brown wash (`#1A0C04`) where Mordor is black iron and ash. Concentric glowing rings with a flame core are painted behind CALCULATOR and BROWSER, embers drift, ghost text down the right column. Diamond crops clip the glyphs. Soot-grey and the dead-land feel are absent; eight animations.
Direction: bg `#0A0706`, iron `#1B1918` panels, ash `#3A3532` borders, text `#D8C8B0`, ember `#B23A0E` accent-c, lava `#F26A1B` on hover only. Frame art: rivet and spike-tooth plate frame on the header top, static lava-crack zigzag on the pad edge, a slit pupil inside a small flame as banner icon. Georgia bold caps. Gate-shaped tiles. One slow ember fade at most.
#### rivendell — RIVENDELL
Score 3 | Art: tone down | Bundle: no
Wrong: silver-blue and italic serif are the right mood, but `--bg` is 0.55 alpha. In the grey-backdrop shot the whole window washes grey, the title and version nearly vanish and the CALCULATOR tile disappears (the gate passes only because it flattens on black). Gold leaves and Art Nouveau curves are missing, so it is "pale blue".
Direction: bg `#0E1620` at 0.92 alpha or higher, silver-blue `#8FB4C8` accent-c, autumn gold `#D6B45C` for focus and one banner leaf, text `#E8EEF0`, soft green `#4C6B5A` borders. Frame art: swan-neck tendril curves in two top pad corners, a slender open arch behind the title, one leaf as banner icon. Gabriola title, Constantia italic labels. Keep circle tiles. Static.
#### shire — THE SHIRE
Score 2 | Art: redraw | Bundle: no
Wrong: an almanac (meal wheel, pipe-weed notes, calendar) is drawn as a straight-edged box around the whole tile field, with ghost lines (FIRST BREAKFAST, ELEVENSES) across the full width behind every icon and label. The Shire has no straight lines. Near-black olive bg, green text, lumpy 12-point icon crop. Warm wood, parchment and brick are missing; the banner truncates.
Direction: bg `#1F2614` with a static brown gradient in the lower half, leaf green `#5B8C3A` accent-c only, brick `#B7522E` on edit, gold `#D4A24C` for focus, parchment `#F1E6C8` text. Frame art: a round-door arch behind the title, timber-plank pad border `#6B4A2B`, leaf-and-vine ticks in the gutters, a smoke-ring circle as banner icon. Gabriola title, Georgia sentence-case labels. 14 px radius tiles. Static.
### 6.6 Persona (3)

Family read: Atlus themes are the menus themselves: huge bold type, tilted hard-edged blocks, high contrast, silhouettes. These three are dark boxes with a thin-line painted dossier, in Segoe UI. P3 is cold and calm, P4 cheerful and sunny over a murder, P5 red-black rebellion; today P4 is as gloomy as P3.

#### persona-3 — PERSONA 3 (original, see section 3)
Score 3 | Art: redraw | Bundle: no
Wrong: cold navy is right, but the accent is a dull dark blue where P3 is bright cyan on near-black. A "TARTARUS TACTICAL RECON" dossier (clock dial behind NOTEPAD, full-moon circle behind PAINT, status lists over PAINT and FILES, about 59 painted strings) fills the tile field. The coffin-lid crop clips the glyph tops. No tilted blocks or big hollow numerals.
Direction: bg `#050B2A`, cyan `#1BB4F2` accent-c, pale cyan `#8CE3FF` focus, moon white `#D9E3EE` text, shadow purple `#6A5AA0` hover only. Frame art: two static skewed parallelogram bars in the header strip, one small hollow "25" in the banner, a crescent banner icon. Bahnschrift SemiBold condensed caps. Rounded-rectangle tiles, no crop. Static.
#### persona-4 — PERSONA 4
Score 2 | Art: redraw | Bundle: no
Wrong: gloomy. Mustard text on a near-black sepia wash reads as a dungeon, not sunny Inaba. A CRT television (bezel, antenna, dials) is painted behind the middle tiles, its screen edges crossing the icons, and scanlines band every tile icon. The retail joke, pop stars and bold yellow panels are absent.
Direction: bg `#14110A` body, but header and banner strips solid TV-yellow `#F5D60A` with `#1A1A1A` text; orange `#E0561A` on edit, rain blue `#3A6AA0` focus, fog `#E8E4D0` text. Frame art: three or four static hand-drawn stars in the header strip, TV-corner radius on tiles. Arial Black title, Segoe UI Semibold labels. Static, no snow, no scanlines over icons.
#### persona-5 — PERSONA 5
Score 3 | Art: redraw | Bundle: no
Wrong: red on black is right, but it is a red wash with thin-line dossier art ("PHANTOM THIEVES DOSSIER", codename roster, a red star with "TAKE YOUR HEART" under CALCULATOR) painted through the tiles. P5's look is jagged black polygons carrying white slanted type over red, torn collage, no rounded corners. Tidy box layout.
Direction: bg `#0A0A0A`, red `#D92323` for header and banner slabs and accent-c, white text, dark red `#732424` hover. Frame art: header and banner as skewed black polygons with a red under-slash (static `clip-path`), one red splat top-left, no roster. Impact italic caps for title and labels. Keep the diagonal-cut icon polygon. Static.
### 6.7 Secret World Legends (3)

Family read: Funcom's three factions are distinguished by city and architecture (London stone, New York glass, Seoul chaos) and colour (Templar red, Illuminati blue and black, Dragon green and gold, all sourced by Makoto). The themes get the colours roughly and then bury them in copied lore panels (asset lists, handler names, "Est. 1312 AD"). Makoto's UI-look entries are unsourced, so the directions below are conservative: colour, one architectural cue, restraint.

#### swl-dragon — SWL: DRAGON
Score 3 | Art: tone down | Bundle: no
Wrong: dark green and italic Georgia are on colour, but the gold half of "green and gold" is nearly invisible, and the yin-yang banner icon is the kung-fu cliche (the Dragon is Seoul-based chaos theory). A lore panel ("BONG CHA", "THE HONEYCOMB") sits right of the tiles and a big ghost word block covers the lower right. Neat and symmetric where the faction is scattered and organic.
Direction: bg `#08100C`, jade `#2E8A5A` panels, gold `#D4A83A` accent-c, text `#C8D4C0`. Frame art: one coiled dragon as a single line in the header, three or four unevenly placed dots and one ripple ring on the pad, a ripple ring as banner icon. Georgia italic labels; a small "서울" tag in Malgun Gothic. Keep hex tiles. Static.
#### swl-illuminati — SWL: ILLUMINATI
Score 3 | Art: tone down | Bundle: no
Wrong: blue-and-black is sourced and right, but the primary is electric `#0072E8` where the faction is cold and corporate, and a gold secondary brings the gold-and-black luxury look Makoto marks as wrong. An eye-in-triangle with a Handler list sits behind CALCULATOR and BROWSER, and ghost text ("ROCKEFELLER", "WE OWN EVERYTHING") fills the right. Banner truncated.
Direction: bg `#080B12`, steel blue `#2F5FA8` accent-c, silver `#B8C4D8` text, `#141A26` panels, no gold. Frame art: thin blue rules on the pad, a stepped ziggurat in the header, a small original eye-in-triangle as banner icon. Segoe UI Semibold caps, medium tracking. Keep rounded-square tiles. Static.
#### swl-templar — SWL: TEMPLAR
Score 2 | Art: redraw | Bundle: yes (UnifrakturCook, IM Fell English) | CONTRAST (legacy fail)
Wrong: fails on text-dim, accent-c and hint-sub, and it shows: header, version and ghost text are dim red-brown on brown-black and hard to read. "CALCULATOR" truncates to "CALCULAT..." from wide tracking. A faint red ghost column sits on the right. Red is spread over everything instead of one accent on stone.
Direction: bg `#100C0C`, stone `#8A7A5A` borders, bone `#D4D0C4` text (fixes contrast), Templar red `#A81E1E` on edit, focus and the banner cross only. Frame art: carved-stone double rule with chamfered corners, static conic rose-window circle in the header, a flared cross as banner icon. Palatino Linotype small caps, tracking 0.5 px so no label truncates. Square tiles. Static.
### 6.8 Assassin's Creed (2)

Family read: the two-layer conceit (white hooded Assassins, red-and-white Templars, blue Animus over Renaissance stone) is missing. Both themes are dark tints. Assassin and Templar marks are Ubisoft trademarks; use a hooded triangle and a generic flared cross.

#### ac-assassins — AC: ASSASSINS
Score 2 | Art: redraw | Bundle: yes (Cinzel, Marcellus) | translucent bg
Wrong: a gold-brown "Eagle Vision" wash at 0.52 alpha; Makoto's main colour is white (hood) with sash red and Animus cyan. Over the grey backdrop the header buttons and version fade and the window goes muddy. The Creed text prints in the right column, a leap-of-faith diagonal with an arrowhead crosses the centre tiles, and a mentors list sits beside the icons.
Direction: Animus HUD. bg `#0C0C0E` at 0.92 alpha or more, hood white `#EDEDED` text, sash red `#B2121C` on edit and one header tick, cyan `#33C8FF` accent-c (thin lines), stone `#6E7078` borders. Frame art: static hex-cell strip in the header, hood-triangle banner icon, thin sync-bar line. Palatino Linotype caps, wide tracking. Keep pentagon tiles. Static.
#### ac-templars — AC: TEMPLARS
Score 2 | Art: redraw | Bundle: no | CONTRAST (legacy fail)
Wrong: fails on text-dim, accent-c and hint-sub. A dark red-grey tint with a solid red plus-shape behind the CALCULATOR label (it reads as a false selection highlight), a painted directive list, and neither a Templar nor an Abstergo look. It also duplicates swl-templar (red on dark).
Direction: make this the Abstergo corporate layer. bg `#0E0E10`, glass panels `#1A1A1E`, silver `#C9CDD2` text and 1 px rules, red `#B0121E` only on edit, focus and a small circle logo in the banner. Frame art: static hex-grid (Helix) strip in the header, a lab-door circle as banner icon. Segoe UI Semilight caps at 90 percent size, wide tracking. 6 px tiles. Static.
### 6.9 Doom (2)

Family read: Classic and Eternal are different looks (1993 brown-grey pixels with a status bar, vs 2020 saturated orange with angular chevrons). Today both are red-brown washes with a painted schematic.

#### doom-classic — DOOM (CLASSIC)
Score 3 | Art: redraw | Bundle: yes (Press Start 2P)
Wrong: brown-orange and Courier New are right, and the painted status bar is the right idea in the wrong place: its "100 / 200" digits sit behind the bottom tile row, half hidden by the TERMINAL, BROWSER and FILES icons. No pixel type, automap or pentagram. Header cut ("E1M1 // HANG...").
Direction: make the banner strip the status bar: `#5A4A3A` with four red pixel-digit groups and a face-free centre panel (static box-shadow pixel blocks; no Doomguy face). Body bg `#1A0A08`, brick `#B02A1A` accent-c, yellow `#E8C030` focus, grey `#3A3A34`, text `#E0C8A0`. Remove the digits from the grid. Courier New bold caps. Keep the bubble-notch tiles if the glyph is not cropped. Static.
#### doom-eternal — DOOM ETERNAL
Score 2 | Art: redraw | Bundle: no
Wrong: a dull pink-red wash (text `#D07878`) where Eternal is saturated hellfire orange and yellow with hard angles: Makoto's "dull wash" pitfall. A kill-count and demon-log schematic (bars beside NOTEPAD, a red sigil behind CALCULATOR, "KILL COUNT 66,610") is painted through the tiles.
Direction: bg `#0A0708`, hellfire `#E8481A` accent-c, yellow `#F0C020` for numerals and focus, dark red `#8A1A1A` hover, cyan `#50F0FF` on one line, text `#F0E8E0`. Frame art: a static angular chevron slab behind the title, hard-cut pad corners; no ring gauges. Bahnschrift SemiBold italic caps. Keep rounded-square tiles or chamfer them. Static.
### 6.10 Final Fantasy (7)

Family read: the one thing every fan recognises across FF6, 7, 8 and 9 is the menu window: a blue vertical-gradient panel with a thin white border, white text and a pointing-hand cursor. None of the seven themes has it. Each is a dark tint with the game's colour as an accent and a painted "status screen" (party rosters, gil, item level, junction lists). The logo is Amano artwork and a mark; do not reproduce it. Direction for the family: one shared static window treatment (a `linear-gradient` panel and a 1 px light border, no animation) with a per-game accent, so a single spec can drive all seven.

#### ff6 — FINAL FANTASY VI
Score 2 | Art: redraw | Bundle: yes (Press Start 2P)
Wrong: brown-black steampunk with amber text. It picked Vector and Magitek and skipped the SNES two-tone blue window that defines FF6. A Magitek armour walks down between CALCULATOR and BROWSER (leg behind the BROWSER icon), with beam bars, "SLAVE CROWN ACTIVE" and a mission log around it. Corner-cut icon shape means nothing.
Direction: bg `#0B1030`, menu blue `#2C58C8` to `#12206A` gradient on header, banner and tile hover, white `#F0E8C8` text, gold `#D4A030` accent-c, purple `#7A3A6A` hover only. Frame art: static gear-tooth edge on the banner top, scalloped curtain fold in the header, a pointing-hand glyph as banner icon. MS Gothic labels, Georgia title. 6 px tiles. Static.
#### ff7 — FINAL FANTASY VII
Score 2 | Art: redraw | Bundle: no | CONTRAST (legacy fail)
Wrong: dark navy with a muddy accent (`#1848A0`), mako green reduced to a minor secondary. A Buster Sword slab stands vertically behind CALCULATOR and BROWSER (its hilt crossing the BROWSER label) with a stat sheet and bars beside it. No PS1 blue window. Trapezoid icon crop. Fails on text-dim, accent-c, hint-sub.
Direction: bg `#05090F`, PS1 window `#5B7FC0` to `#0A1240` gradient on header and banner strips, white `#E8E4D0` text, mako `#2AE6A0` accent-c and focus (3:1), steel `#7A7F88` borders, red `#A03030` on edit. Frame art: pipework double rule on the pad edge, a flat Materia orb as banner icon. Bahnschrift SemiBold caps. 4 px tiles. Static.
#### ff8 — FINAL FANTASY VIII
Score 3 | Art: redraw | Bundle: no
Wrong: the cool, sleek mood is right, but a gunblade is painted diagonally between NOTEPAD, CALCULATOR and BROWSER, with junction and GF bars and ghost words ("WHATEVER", "GRIEVANCE") down the right. Blue is a dull mid-tone, no icy pale blue or silver, no thin fashion-sci-fi lines.
Direction: bg `#0C1220`, icy blue `#7FB4D8` accent-c, silver `#C9D6E4` text, navy `#2A3F5E` panels, red `#B42A35` on edit. Frame art: thin 1 px silver lines only (a diagonal in the header, a circle outline as banner icon), Triple-Triad-style blue-and-red side stripe on tile hover. Segoe UI Light, caps at 90 percent, tracking 1.5 px. Square tiles. Static.
#### ff9 — FINAL FANTASY IX
Score 3 | Art: tone down | Bundle: no
Wrong: warm gold and italic Georgia is the right storybook mood and the least broken of the FF set. Missing: stage curtains, marionette strings, scroll frames, the blue window with ornate corners. A tower-and-crystal drawing sits under CALCULATOR and a quote readout ("YOU DON'T NEED A REASON TO HELP PEOPLE") prints over PAINT and FILES. Plain hex crop.
Direction: bg `#241A18`, brass `#B7842B` accent-c, cream `#F0E4C0` text, wood `#6E4A2A` borders, blue `#4A7AB0` focus and header gradient, red `#C4453A` edit. Frame art: static scalloped curtain valance on the header top, scroll corners on two pad corners, one crystal as banner icon. Gabriola title, Georgia italic labels. Arch-top tiles. Static.
#### ff10 — FINAL FANTASY X
Score 3 | Art: redraw | Bundle: no
Wrong: watery blue, circles and a translucent window match Makoto's brief, but `--bg` is 0.55 alpha. In the grey-backdrop shot the title and version are nearly invisible and the header text is grey on grey (the gate flattens on black and passes). A sphere grid and faint ghost text sit behind the tiles; pyreflies drift as an animated layer.
Direction: bg `#061420` at 0.90 alpha (or 4.5:1 over white), aqua `#2A9FC8` accent-c, teal `#4CC4B8` focus, gold `#E8C05A` for one banner mark, text `#F0F4F8`. Frame art: a sphere-grid strip (round nodes joined by lines) in the header only, three static pyrefly dots in the pad, a ringed sphere as banner icon. Segoe UI Semilight. Keep circle tiles. Static.
#### ff14 — FINAL FANTASY XIV
Score 2 | Art: redraw | Bundle: no | CONTRAST (legacy fail)
Wrong: a violet-navy wash with dim violet accent (`#6848A0`) where XIV is charcoal with fine duty-gold trim and crystal blue. A Duty Finder queue (tank, healer, DPS status, "ITEM LEVEL", "MORE THAN 30M") is painted around CALCULATOR and PAINT, with a purple bar crossing the PAINT label. Fails on text-dim, accent-c, hint-sub.
Direction: bg `#14121A`, charcoal `#2A2733` panels, duty-gold `#B9975B` accent-c (hairline trim), crystal blue `#4E9FE0` focus, text `#E6E0D0`. Frame art: 1 px gold hairline with corner brackets around the window, tiles as gold-bordered slots (4 px radius, gold on hover), a floating-ring circle as banner icon. Segoe UI Semilight, tracking 0.5 px. Static.
#### ff15 — FINAL FANTASY XV
Score 3 | Art: tone down | Bundle: no
Wrong: desaturated blue-grey and Segoe UI is close to the road-trip minimal look, but a painted highway strip runs under BROWSER, a party and bond readout crosses the right column, and a crown emblem sits behind the tiles. Campfire warmth and the gold crest (the identity) are barely present; the accent is a cool `#5068A0`.
Direction: bg `#0F1114`, road grey `#BFC5CC` text, asphalt `#3B4148` panels, campfire orange `#E8843C` accent-c with one static warm gradient bottom-left, teal `#2C6E8F` focus. Thin white outlines only; a generic wing-and-crown shape as banner icon. Segoe UI Light, wide tracking. Chamfered-bottom tiles stay. Static.
### 6.11 Standalone themes, alphabetical sheet 1 (2001 to deus-ex)

Standalone themes have no shared family; entries are in gallery order. Batches (section 7) regroup them by look.

#### 2001 — 2001: A SPACE ODYSSEY
Score 2 | Art: redraw | Bundle: no
Wrong: the film is bright sterile white with coloured console buttons; this is near-black navy with glowing red HAL rings behind CALCULATOR and horizontal streaks, and a readout ("DISCOVERY ONE / HAL 9000 OPERATIONAL") down the right. Six animations, HAL pulse and stargate strobe, for a film about stillness.
Direction: go light. bg `#F4F4F2`, panels `#E8E8E4`, text `#2A2A2E`, HAL red `#E01818` on edit and one small red circle with a yellow dot as banner icon, console orange `#E8A020` and blue `#2A5AA0` on focus and hover. Frame art: one thin perspective line pair in the header, a tiny black monolith slab (1:4:9). Segoe UI Light caps, generous tracking. Plain rounded tiles. Static; check icon contrast on white.
#### akira — AKIRA
Score 2 | Art: redraw | Bundle: yes (Dela Gothic One, Rampart One)
Wrong: "aggressive red neon on black" is the generic version. The film is saturated capsule red, grimy concrete grey and hazard yellow, flat cel colour and huge red katakana. Here: a dark red screen with a faint grid, circular icons, tan caps, a plain red disc banner icon, and a burst and shockwave animation. Blue `#00A8FF` in the palette is Cyberpunk.
Direction: bg `#0D0D12`, capsule red `#E60012` accent-c, concrete `#8A8C9A` borders, hazard yellow `#F5C400` on edit, text `#F5F5F5`. Frame art: a flat red-and-white capsule as banner icon and tile hover shape, a red "ネオ東京" tag in MS Gothic bold in the header, flat rectangles. No glow. Arial Black title. Static.
#### alan-wake — ALAN WAKE
Score 3 | Art: redraw | Bundle: no
Wrong: right idea (yellow light in blue dark) but the flashlight is a literal drawing labelled "ENERGIZER HEAVY DUTY" (a real brand), lying across the NOTEPAD and CALCULATOR labels with a beam wedge over PAINT and FILES; manuscript ghost text prints down the right. An amber-brown wash where the signature is yellow on blue-black; pine green is missing.
Direction: bg `#0A0F14`, night blue `#1A2A3A` panels, flashlight `#E8C24A` accent-c, pine `#3A7A5A` borders, text `#F0EAD8`. Light as texture: one soft cone gradient from the top-right at low alpha, no hard edges over labels. Frame art: typewriter-margin rule in the header, pine tick row on the banner, page-corner fold. Courier New labels, Georgia title. Static.
#### alien — ALIEN
Score 3 | Art: tone down | Bundle: no
Wrong: phosphor green on black in Consolas is right, but scanlines band every tile icon, and a readout ("MU-TH-UR 6000 / CREW: 7 / PRIORITY OVERRIDE") crosses the NOTEPAD, TERMINAL and CALCULATOR labels: the worst readout overlap in the set. One of four green terminals (matrix, pip-boy, necrons); amber, hazard stripes, rocker switches and Giger ribs are absent. Biohazard banner icon is Resident Evil's.
Direction: bg `#0A0C0A`, CRT green `#4FCB6A`, amber `#E8A020` on edit and warnings, grey `#B8B8A8` labels. Scanlines on header and banner only. Frame art: static hazard-stripe band on the banner top, a row of rocker-switch rectangles in the header, a motion-tracker ring as banner icon. Consolas caps, tracking 2 px. Square tiles.
#### amnesia — AMNESIA: THE DARK DESCENT
Score 2 | Art: redraw | Bundle: no
Wrong: a castle "schematic" with room names and stats ("TINDERBOXES: 3 // OIL: SCARCE", "GRUNT DETECTED") is drawn across the whole tile field; the game has almost no HUD, only candle brown, damp stone and handwritten notes. The plan crosses every label. The gothic-arch tile is good.
Direction: bg `#0A0806`, candle brown `#6A4A2A` panels, lantern `#C89A4A` accent-c, mould green `#5A6A50` in focus only, parchment `#C9B896` text. Frame art: static stone-arch edge on the pad, a warm lantern-pool gradient low in the frame, a one-line handwritten quote in the banner. Segoe Script banner, Palatino Linotype labels. Keep arch tiles. No drift.
#### blade-runner — BLADE RUNNER
Score 3 | Art: tone down | Bundle: no
Wrong: amber sepia noir with Georgia italic is the right mood, but rain streaks animate as a scroll (eight animations, the costliest set outside matrix) and ghost lines ("MORE HUMAN THAN HUMAN", "OFF-WORLD COLONIES") print through PAINT and FILES. Neon is missing: no cyan-teal, kanji signage or steam. The chamfered corner shows a white wedge in the gallery (see section 9).
Direction: bg `#0A0A10`, amber `#E8842A` accent-c, cyan-teal `#2AB8D8` for focus and one header neon rule, red `#D8283A` on edit, steam `#F0E0C0` text. Frame art: a static neon sign strip in the header (invented katakana, MS Gothic), rain as a 4 percent diagonal fine-line texture. Keep the chamfered corner. No animation or one slow neon flicker. Bahnschrift caps.
#### blair-witch — BLAIR WITCH
Score 3 | Art: keep | Bundle: no | CONTRAST (legacy fail)
Wrong: the most restrained theme in the set: washed out, grainy, near frozen, Courier New, one stick figure in the gutter. But it fails badly on hint-sub (1.7:1), text-dim and accent-c, so settings hints and header text are unreadable. The camcorder overlay (REC dot, timestamp, tape counter, battery), the game's UI, is absent.
Direction: keep palette and grain; lift `--text-dim`, `--hint-sub-color` and `--accent-c` to pass. Add the camcorder frame only in the header and banner strips: a static red REC dot, a Courier New timestamp ("OCT 22 1994 03:14"), a battery glyph. Keep the stick figure in the gutter (measured, touching no label). Static.
#### broken-sword — BROKEN SWORD
Score 3 | Art: tone down | Bundle: no
Wrong: sepia manuscript with gold is the right idea, but it is a dark brown screen with a painted codex frame and character bios (GEORGE, NICO, locations) printing through the right tiles, and the banner truncates. The game is a warm hand-painted cartoon Paris; this reads as a museum label.
Direction: bg `#1A1410`, gilt `#B8862C` accent-c, vellum `#E8D8B0` text, ultramarine `#2A4A6A` focus, red `#A02A2A` for one drop-cap. Frame art: a red illuminated "B" (generic flourish, not the game logo) as banner icon, a gold-leaf border line on the pad, a vine scroll in the header. Gabriola title, Georgia italic labels. Rounded tiles. Static.
#### control — CONTROL: THE BUREAU
Score 3 | Art: redraw | Bundle: no
Wrong: black with Bureau red is right, but diamond icon crops clip the glyphs, and a case file ("FEDERAL BUREAU OF CONTROL", altered-items list, hiss bar, red seal) is painted directly behind the tiles. The 1960s Federal-office feel, concrete white and redaction bars are missing. Seven animations, including a hiss distortion on the title.
Direction: bg `#0C0C0E`, concrete `#E8E4DC` text on `#1A1A1E` slabs, Bureau red `#D8202A` accent-c and one Hiss glyph beside the banner, steel `#8A8A90` borders. Frame art: static black redaction bars of varied lengths in the header, a brutalist slab step on the pad, an official-seal circle as banner icon. Bahnschrift SemiBold small caps, tracking 3 px. Square tiles. Static.
#### cyberpunk — CYBERPUNK 2077
Score 2 | Art: redraw | Bundle: yes (Rajdhani, Chakra Petch)
Wrong: the header says "neon cyan + magenta on near-black", Makoto's generic synthwave pitfall. The game's base colour is CDPR yellow (`#FCEE0A`); yellow is minor here. Scanlines band the tile icons and a "data rain" readout prints down the right column. The chamfered window corners are right.
Direction: bg `#0B0B10`, yellow `#FCEE0A` accent-c, cyan `#02D7F2` focus, red `#FF003C` (unverified) on edit only, text `#F0F0F0`. No magenta. Frame art: chamfered panel corners with a small header notch, a static hazard-stripe band on the banner top, a static offset-rectangle glitch slice at the title. Bahnschrift SemiBold condensed caps. Keep chamfered tiles. One stepped glitch at most.
#### dead-space — DEAD SPACE
Score 2 | Art: redraw | Bundle: no
Wrong: an all-orange scan-lined screen; the RIG is blue hologram on grey industrial with amber for warnings (Makoto: "losing the blue"). A ship schematic runs a long hull rectangle through the NOTEPAD, CALCULATOR and PAINT label row, with an X-marked box behind BROWSER. Scanlines band the icons. Skull banner icon.
Direction: bg `#0A0C10`, RIG blue `#3AB4E8` accent-c, amber `#E8A020` on warnings and edit only, grey `#2A3038`, text `#D0D8E0`. Frame art: the RIG spine as a static vertical segmented blue bar on the left pad, stencil warnings in the header, a bulkhead-door outline as banner icon. Bahnschrift SemiBold caps, tracking 1.5 px. Keep octagon tiles. Static.
#### deus-ex — DEUS EX
Score 4 | Art: keep | Bundle: no
Wrong: the closest to franchise in the set: black and gold, honeycomb hexagon icons, Consolas caps. Faults are small: ghost text ("AUGMENT OR OBSOLETE", "PROTOCOL ACTIVE") prints through PAINT and FILES, eight animations for a theme that should be cold and precise, Impact for the title, and no Renaissance-angular lettering or thin gold arcs. Its chamfered corner shows a white wedge in the gallery.
Direction: keep bg `#0A0806`, gold `#E8A020` and `#C88A18`, hex tiles. Delete readout and strobing; keep a static honeycomb at 5 percent behind the header. Frame art: one thin gold arc in the header, a small circle-in-square as banner icon. Bahnschrift SemiBold caps title, Consolas labels. Static or one slow glow on the header rule.
### 6.12 Standalone themes, alphabetical sheet 2 (diablo to half-life)

#### diablo — DIABLO (Diablo II, see section 3)
Score 3 | Art: redraw | Bundle: yes (Pirata One, UnifrakturCook, Cinzel)
Wrong: dried-blood red on black with italic Georgia is near D2's grime, but the red health globe and blue mana globe in the bottom corners and the stone-and-iron gold-trimmed frames are absent. A faint pentagram, embers and a readout ("SANCTUARY FALLS") sit behind the tiles. Pentagon tiles mean nothing; one hue, so generic red-black.
Direction: bg `#0A0605`, stone `#2A1A12` panels, gold `#C8942A` accent-c, bone `#5A4A3A` borders, text `#E0D2B8`, hellfire `#E8501A` on hover. Frame art: in the banner a static red orb at the left and blue orb at the right with the quote between, iron studs on the pad, a runic divider in the header. Palatino Linotype bold; item-quality colours as hover colours. Static.
#### doctor-who — DOCTOR WHO
Score 3 | Art: redraw | Bundle: no
Wrong: TARDIS blue is only the accent (`#0070C0`) on a near-black navy screen; blue should be the surface. Gallifreyan-style rings and orbit ellipses sit behind CALCULATOR and BROWSER and cross their labels, with "RELATIVE DIMENSION IN SPACE" ghost text at the right. Roundel-like circle tiles are good.
Direction: bg `#0A1030`, header and banner strips `#003B6F` with white `#F0E8D0` lettering, amber `#E8A020` focus, vortex `#4AB0E0` hover. Frame art: a white-bordered sign rectangle in the banner (generic wording, not the BBC sign), static roundel discs in the pad corners, a faint vortex gradient at 5 percent. Segoe UI Semibold caps. Keep circle tiles. No drift.
#### dragon-age — DRAGON AGE (Origins, see section 3)
Score 2 | Art: redraw | Bundle: yes (Cinzel, Metamorphous) | CONTRAST (legacy fail)
Wrong: fails on text-dim (2.8:1), accent-c (2.8:1) and hint-sub (2.7:1). A uniform crimson murk with a painted wing shape behind the top tiles, a companion list (Alistair, Morrigan, Varric, Solas: three games), an Archdemon bar, and the Warden oath truncating in the banner ("IN DEAT..."). Origins is worn parchment, bloodied leather and stone, not a red wash.
Direction: bg `#14100C`, parchment `#EAD8A8` text (fixes contrast), crimson `#8A2A1A` on edit and one header tick, antique gold `#C8A048` accent-c, slate `#4A5A6A` focus, leather `#2A1A14` panels. Frame art: static torn-parchment edge on the banner top, a generic sword-and-wing banner icon, a blood-spatter dot cluster in one corner. Palatino Linotype bold caps. Keep hex tiles. Static.
#### dune — DUNE
Score 3 | Art: tone down | Bundle: no
Wrong: warm sand-brown is right and rare (a mid-tone). But a maker-hook curve drops beside CALCULATOR and BROWSER, a Litany block sits left, and a readout ("SHAI-HULUD AWAKENS / THE SPICE MUST FLOW") prints through PAINT and FILES (Ender flagged it). Eight animations (sand, sandstorm, dust). Diamond crops cut the glyphs. Villeneuve's Dune is austere and monumental, not ornate.
Direction: bg `#2A1E10`, ochre `#C4823A` accent-c, spice `#E8B060` focus, sand `#EAD8B0` text, Fremen blue `#3A8AA8` hover only. Frame art: a static monolith slab step in the header, three wavy dune-contour lines on the banner top, a crescent banner icon. Segoe UI Light caps, very wide tracking. 2 px tiles. No sand animation.
#### evangelion — EVANGELION
Score 3 | Art: tone down | Bundle: yes (Shippori Mincho B1, Zen Antique)
Wrong: black, NERV orange and hex tiles are right. But labels are dull gold where Evangelion is stark white, a thin-line diamond is painted through the centre tiles, a readout ("HUMAN INSTRUMENTALITY PROJECT") crosses PAINT and FILES, and the type is Segoe where the show is huge heavy Mincho. Green `#00C000` reads as MAGI terminal, not wash.
Direction: bg `#000000`, white labels, NERV orange `#F66E25` accent-c, alert red `#D3290F` on edit, MAGI green `#0A3A2A` for one header rule. Frame art: a static three-cell hex strip in the header, a thin boxed status line in the banner, no leaf logo. Cambria Bold or Georgia Bold caps, tight tracking, large title. Keep hex tiles. Static.
#### eve-online — EVE ONLINE (general interface, see section 3)
Score 3 | Art: redraw | Bundle: no
Wrong: cold steel-blue (Caldari) on near-black with faint orbit rings and node dots around the centre and a "NEW EDEN / CAPSULEER INTERFACE / CONCORD" readout down the right. Sergei named the game, not an empire. Octagon tiles are arbitrary. The real UI is dense small type, thin borders and orange target brackets; this is a calm dashboard.
Direction: bg `#0A0C10`, charcoal `#1A1E24` panels, grey `#6A7078` borders, text `#C9CED4`, overview orange `#F58A20` accent-c, blue `#00A8E8` focus and links only. Frame art: four static orange corner brackets on tile hover and focus only, a thin window-tab strip in the header, a capsule outline as banner icon. Bahnschrift Light caps at 90 percent size. Square tiles. Static.
#### event-horizon — EVENT HORIZON
Score 2 | Art: redraw | Bundle: no | CONTRAST (legacy fail)
Wrong: fails on text-dim, accent-c and hint-sub (1.3:1): black with very dim red, so secondary text is unreadable. Gravity-drive rings sit behind CALCULATOR and cross its label; the ship log ("CREW: MISSING") prints in red microtext. Steel-grey cathedral hull, drive cyan and engraved Latin are absent.
Direction: bg `#08090C`, steel `#6A7480` borders and panels, text `#C8C8C0`, blood `#C41A1A` on edit and one streak line in the header, drive cyan `#9EE0F0` accent-c (a single ring as banner icon). Frame art: a static jagged cross-section edge on the banner top, a short Latin band in the header (14 characters max). Palatino Linotype small caps. Keep arch-bottom tiles. Static.
#### fatal-frame — FATAL FRAME
Score 3 | Art: redraw | Bundle: no
Wrong: cold navy and italic serif fit "haunted photograph", and the viewfinder idea is right, but a dark viewfinder rectangle and a big ring sit behind the centre column (ring behind the CALCULATOR and BROWSER icons, rectangle edges in the gutters), with ghost words ("PROJECT ZERO", "THE RIFT") on the right. Blood red and washi cream are missing; banner truncated.
Direction: bg `#08080C`, ghost white `#C4C8D8` text, blue `#3A5A7A` accent-c, blood `#8A1A2A` on edit and one shutter dot, washi `#E8DCC8` banner strip. Make the viewfinder the window frame: static corner brackets at the four window corners and a film-frame line on the pad, nothing inside the grid; a thin ring-meter arc beside the banner icon. Palatino Linotype italic. 4 px tiles. Static.
#### firefly — FIREFLY / SERENITY
Score 3 | Art: redraw | Bundle: yes (Rye, Sancreek)
Wrong: worn copper and amber suit the ship, but the space-Western half is missing: no wood-type lettering, salvage or Chinese-character signs. Cargo-manifest ghost text ("CARGO: SECURED", "ENGINE ROOM") prints through the right tiles; octagon tiles are arbitrary; Consolas reads starship terminal, not scrapper.
Direction: bg `#1A1208`, brass `#B8843A` accent-c, red `#B83A2A` on edit, sand `#E8D8B0` text, wood `#3A2A1A` panels. Frame art: a rivet row and bolted plate corner on the pad, a "福" sign strip in the header (Microsoft YaHei), a wanted-poster border line on the banner. Impact title, Constantia labels. 4 px tiles. Static.
#### game-of-thrones — GAME OF THRONES
Score 3 | Art: redraw | Bundle: yes (Cinzel)
Wrong: dark steel, gold and heater-shield tiles are a good base. But a full Westeros map (coastline, castle names, compass rose, Wall, mountains) is painted behind every tile, with the Wall and Winterfell behind NOTEPAD and mountains behind CALCULATOR; banner truncated. Carved Roman capitals and the opening's astrolabe are missing.
Direction: bg `#0C0C10`, steel `#7A8496` borders, gold `#B8963A` accent-c, Lannister crimson `#A81C1C` on edit only, snow `#E8E8EC` text. Frame art: a partial static astrolabe ring in the header, jagged sword-blade teeth on the banner top, a generic wax seal as banner icon. Palatino Linotype bold caps, wide tracking. Keep shield tiles. Static, no fire.
#### ghost-shell — GHOST IN THE SHELL
Score 3 | Art: tone down | Bundle: no | translucent bg
Wrong: teal, glass and clipped corners suit the film, but `--bg` is 0.55 alpha: over the grey backdrop the header label is unreadable and buttons wash out, which the gate cannot see. A hex lattice sits along the banner and faint lines behind the tiles; a readout ("TACHIKOMA UNIT 03", kanji) runs through the right tiles. Purple is decoration only.
Direction: bg `#06121A` at 0.88 alpha (or measured over white), teal `#12C4B4` accent-c, muted teal `#9EE8DC` text, glass `#1A2A3A` panels, purple `#7A4FD0` hover only. Frame art: a static hex-lattice strip in the header, thin wireframe brackets in two pad corners, a dashed thin circle as banner icon. Consolas caps, tracking 1 px. Keep rounded glass tiles. Static.
#### half-life — HALF-LIFE
Score 3 | Art: redraw | Bundle: no
Wrong: dark grey-green with a small orange title is a fair Black Mesa, but scanlines band the icons, a giant lambda sits behind CALCULATOR and BROWSER, and a left readout ("HEV SUIT", "BLACK MESA") prints through NOTEPAD and TERMINAL, corrupted by the escape bug (shows "§NORMAL", "«LACK MESA"). The orange lambda banner is the one strong piece; HEV orange is not the accent.
Direction: bg `#0A0A08`, HEV orange `#FFA000` accent-c, concrete `#7A7A70` borders, text `#D8D2BC`, hazard `#F0C020` on edit. Frame art: the banner becomes a HEV HUD (cross glyph with a static "100" left, shield glyph with "100" right, in orange), a static hazard band on the banner top, a warning pictogram in the header. No lambda in the grid. Trebuchet MS bold, tracking 1 px. Square tiles. Static.
### 6.13 Standalone themes, alphabetical sheet 3 (indiana-jones to pip-boy)

#### indiana-jones — INDIANA JONES
Score 3 | Art: tone down | Bundle: no
Wrong: gold on near-black with italic Georgia says "old museum"; pulp serials are warm leather and parchment. A map with compass ticks and a dotted red route runs behind the tiles, with a gold X over the CALCULATOR label. Torch glow and dust-mote animation. The display-case tile crop is a fair joke.
Direction: bg `#2A1C10` (mid-tone leather), parchment banner strip `#EAD8A8` with dark text, gold `#E8C070` accent-c, red `#C84A1A` on edit and one X mark. Frame art: the dotted red route moves to a dashed 1 px line along the header bottom (static), a stitched-leather dashed border on the banner, a generic fedora silhouette as banner icon. Palatino Linotype bold title, Courier New labels. Static, no torch flicker.
#### lcars — LCARS
Score 3 | Art: redraw | Bundle: yes (Antonio, Oswald)
Wrong: black with orange bold Arial and a pill window is a start, but the elbows are cropped fragments: colour blocks at the top-left cover the start of the version line, pill bits sit on the left edge, and colour stripes run behind the bottom tile row. A readout ("SHIELDS: NOMINAL", "WARP CORE", corrupted "MINAL(a)LL SYS") crosses PAINT and FILES. No pill buttons; the elbow is the identity.
Direction: a real LCARS frame in the frame zones only: a left bar of stacked segments inside the 16 px pad, top-left and bottom-left elbows joining a thin header rule and the banner, all flat: `#FF9900`, `#CC99CC`, `#9999CC`, `#FFCC99`, `#CC6666`, `#99CCFF` on black. Flat-colour labels, no glow. Title clears the elbow by 8 px (measured). Bahnschrift SemiBold caps, negative tracking. Keep pill tiles. No animation.
#### life-is-strange — LIFE IS STRANGE
Score 2 | Art: redraw | Bundle: no
Wrong: a dark brown-black sepia screen; the game is a warm sketchbook with raspberry pink and turquoise, polaroids and pen doodles. A polaroid frame and butterfly diagram sit behind the tiles; the ghost text is corrupted ("MA(box)VLFIELD"). Copper accent, no pink. Seven animations (rewind, ghost, dust).
Direction: bg `#14121A`, raspberry `#E85A8A` accent-c, turquoise `#2AA8C8` focus, sunny `#F0C848` for one banner mark, paper `#F0E8E0` text. Frame art: a static white 6 px polaroid border on tile hover and focus (rotated 1 degree), a hand-drawn butterfly banner icon, a pen-scribble underline under the title. Ink Free labels and title, sentence case. 4 px tiles. Static, no rewind ripple.
#### lovecraft — LOVECRAFTIAN
Score 2 | Art: redraw | Bundle: yes (IM Fell English, UnifrakturCook) | CONTRAST (legacy fail)
Wrong: fails on text-dim (2.5:1), accent-c and hint-sub (2.4:1). Black with dim blue text, not aged parchment. A big brown Necronomicon with clasps and a pentagram sits behind the whole centre column, its clasps poking out beside the labels; the banner chant truncates. Neon-blue, all-black and no ink is Makoto's pitfall.
Direction: bg `#0E0F0C`, parchment `#C8B888` text (fixes contrast), sickly green-grey `#7A8C62` accent-c, cold sea `#2A4A4A` borders, dark red `#3A2A2A` on edit. Frame art: a small Elder-Sign-style star in the header, three ink blots on the pad, one border line tilted 2 degrees in a corner (non-Euclidean wrongness, static); no book. Palatino Linotype italic. Keep elongated-hexagon tiles. Static.
#### mass-effect — MASS EFFECT
Score 3 | Art: tone down | Bundle: no | translucent bg (0.93, acceptable)
Wrong: holo blue and N7 red are the sourced palette and the chamfered window is right. But orbital arcs and a relay ring cross the centre tiles, a readout ("NORMANDY SYSTEMS", "SPECTRE CLEARANCE") prints through the right tiles, grey and red blocks clip the left edge of the title, and eight animations run. Omni-tool orange is missing.
Direction: bg `#06101A`, holo blue `#0EB9FE` accent-c, orange `#E8781A` (unverified hex) hover, N7 red `#C8102E` on edit and one thin header tick, text `#F0F4F8`. Frame art: a static hex-cell strip in the header, a generic three-segment diagonal stripe at the banner left (not the N7 mark), a thin half-ring as banner icon. Segoe UI Semilight caps, wide tracking. Keep shield-tip tiles. Static.
#### matrix — MATRIX
Score 4 | Art: keep | Bundle: no
Wrong: the strongest identity per pixel: green katakana rain, Consolas, 0.96 alpha, no icon crop. Faults: rain digits fall through tile labels, a readout ("WAKE UP NEO", "FOLLOW THE WHITE RABBIT") prints over PAINT and FILES, and eight animations run where only the rain matters. Green on green is the whole palette; the real-world blue-grey is missing.
Direction: the one measured C5 exception: rain may stay in the grid at up to 35 percent alpha, with a 1 px dark backing on every tile label (`text-shadow: 0 0 3px #000`) and 4.5:1 against the brightest glyph. Rain is the single allowed full-layer animation, stepped to 30 updates per second or fewer. Delete readout, border pulse, title intrusion, sweep and flicker. `#7FB88A` for `--text-dim`. Consolas throughout; a block cursor in the banner.
#### metal-gear — METAL GEAR SOLID
Score 3 | Art: redraw | Bundle: no
Wrong: dark green and the Codec are the right subject, but the whole codec (portraits, waveform bars, CALL and END buttons) is painted behind CALCULATOR, BROWSER and their labels, and a readout ("SHADOW MOSES", "CODEC 140.85") crosses PAINT and FILES. Diamond tiles cut glyph corners. The banner "!" is green where the game's alert is yellow or red; olive drab is missing.
Direction: bg `#0A1208`, codec green `#7ADA5A` accent-c, olive `#2A3A22` panels, paper `#C8D0B8` text, alert red `#E83A1A` on edit. Frame art: the banner becomes the codec display (static "140.85" left, ten static waveform bars right, quote between), thin radar-cone lines in the header only. No portraits or box. Bahnschrift SemiBold caps; banner "!" turns yellow. 4 px tiles, no diamond. Static.
#### mirrors-edge — MIRROR'S EDGE
Score 3 | Art: tone down | Bundle: no
Wrong: right idea (a light theme with one red), wrong execution. The base is a cold blue-grey `#D8DCE0`, not clean white; every label and icon carries a grey blur shadow that reads as a smudge; a thin red runner line crosses the row gap from below TERMINAL to a dot by PAINT with a "FAITH" tag; a grey ghost readout ("FAITH / RUNNER") prints right.
Direction: bg `#F4F4F0`, panels `#FFFFFF`, text `#1A1A1A`, red `#E82A1A` accent-c (a plane, not glow), blue `#1A8AE8` focus and hover, no shadows or glows (`--tile-icon-glow: none`). Frame art: one flat red plane in the top-left pad, the runner line cut to a 2 px rule along the header bottom ending in a small circle. Segoe UI Semibold caps, tracking 2 px. 2 px tiles. Static; check icons and labels on white.
#### mortal-kombat — MORTAL KOMBAT
Score 3 | Art: redraw | Bundle: no
Wrong: black and gold is the right pair and the crest-bottom tiles work. But a large coiled-dragon roundel (close to the franchise logo) sits behind CALCULATOR and BROWSER and crosses their labels, and "CHOOSE YOUR FIGHTER / FINISH HIM" prints through the lower tiles. The lightning banner icon is off (that is Persona or Doom).
Direction: bg `#0A0A0A`, dragon gold `#D4A018` accent-c, blood `#B01A1A` on edit, text `#F0F0F0`. Frame art: the banner becomes two thin gold-framed fighting-game health bars (static) with "FINISH HIM!" between, a plain gold ring (no dragon) as banner icon, a static three-line claw slash in the header. Bahnschrift Bold caps, tight tracking. Keep crest-bottom tiles. Static.
#### nonary-games — NONARY GAMES (999, see section 3)
Score 2 | Art: redraw | Bundle: yes (DSEG)
Wrong: wrong game colours: a dark blue sci-fi terminal with cyan digit boxes, where 999 is a rusted ship, steel bulkheads, numbered round doors and the black-on-grey LCD bracelet. A 3x3 door grid with big digits, a bracelet gauge and rules ("PENALTY: DEATH") is painted between and behind the tiles; digit boxes crowd the icons and the CALCULATOR icon sits on the "5". Wobbly blob tiles.
Direction: bg `#14100D`, rust `#3A2A20` panels, steel `#6A7078` borders, brass `#D9A03A` accent-c, bracelet red `#B3202A` on edit, text `#E8E0D0`, teal `#1F5A6A` focus. Frame art: banner bracelet display (grey LCD box `#C8D0B8` with one static black "9"), a round door with ring-lock and 9 ticks in the header, rust streaks on the pad. Consolas Bold digits, Bahnschrift labels. 4 px tiles. Static.
#### parasite-eve — PARASITE EVE
Score 2 | Art: redraw | Bundle: no
Wrong: brown-orange ochre where the game is night-time Manhattan in dark blue with flesh red (Makoto's hexes are estimates; the night mood is confirmed). A painted NYPD case file with a glowing mitochondrion, ability bars ("HEAL", "HASTE") and stats fills the tile field; ghost text is corrupted ("PARASITE(R)VE"). Circle tiles say nothing about the game.
Direction: bg `#0A0A14`, dark blue `#2C4A7A` panels (PS1 blue gradient on header and banner), flesh red `#C42A3A` accent-c, white `#E8E4E0` text. Frame art: a static scalloped opera-curtain fold on the header top, a static Manhattan skyline band on the banner top, a thin range-dome circle as banner icon. Palatino Linotype labels. 4 px tiles. Static.
#### pip-boy — PIP-BOY
Score 3 | Art: tone down | Bundle: no
Wrong: monochrome green CRT is right, but the green is yellow-green (`#92C800`), matching neither Fallout 4 (`#1AFF80`) nor New Vegas amber. Scanlines are so heavy the icons look striped and the circle crop clips glyphs; the S.P.E.C.I.A.L. readout prints right, corrupted ("8@ND 9¬HA"). The tab strip (STAT, INV, DATA, MAP, RADIO) is absent.
Direction: bg `#061006`, phosphor `#1AFF80` accent-c, dim `#0AAA40` borders, text `#7AFFA0`. Scanlines as a static 6 to 8 percent texture. Frame art: a static "STAT INV DATA" tab strip in the header clear of the buttons, a stepped cursor block in the banner (the one allowed animation), a trefoil banner icon. Consolas caps. 6 px tiles, no circle crop. One stepped title flicker at most.
### 6.14 Standalone themes, alphabetical sheet 4 (portal to terminator)

#### portal — PORTAL
Score 4 | Art: keep | Bundle: no | CONTRAST (legacy fail)
Wrong: the best concept after Matrix: a light panel theme with orange and blue portal ovals at the left and right edges. Faults: the ovals run into the outer tile columns (orange reaches the NOTEPAD icon, blue touches PAINT and FILES); fails on accent-c (2.07:1, `#FF6600` on `#D8D8DE`) and text-dim (4.29:1); grey blur shadows under every label and icon read as smudges; fine scanlines cross the window; it is greyer than the white-tile identity.
Direction: bg `#F0F0EE`, panels `#FFFFFF`, text `#2A2E38`; orange `#F08A1A` for fills and rings, `--accent-c` `#C25A00` (3:1), blue `#1A9AE8` focus. Remove shadows, scanlines and wisps. Shrink the ovals to sit inside the 16 px pad and gutters (no tile overlap, measured), add thin black panel-grid lines in the gutters, a stick-figure pictogram as banner icon. Segoe UI Semilight caps. Keep circle tiles. Static.
#### predator — PREDATOR
Score 3 | Art: redraw | Bundle: no
Wrong: indigo with orange text is a plausible thermal read, and the V-notch tile (mask silhouette) is a clever crop. But a full thermal HUD (status bars, a reticle with a dot triangle, a glyph counter) is painted behind CALCULATOR, BROWSER and their labels, with ghost text on the right. The jungle is missing; no green.
Direction: bg `#0C1208`, jungle green `#5A7A3A` panels, heat orange `#E8501A` accent-c, thermal yellow `#FFD060` focus, thermal red `#B02A1A` on edit, text `#E8D8B0`. Frame art: three small static red laser dots in a triangle as banner icon, a static blue-red-yellow thermal gradient bar on the banner top, an angular clan-glyph row in the header. Bahnschrift SemiBold caps. Keep V-notch tiles. Static.
#### promise-mascot — PROMISE MASCOT AGENCY (see section 4)
Score 1 | Art: redraw | Bundle: yes (Dela Gothic One)
Wrong: wrong premise, invented copy, wrong palette (section 4). Dark purple with pink, a heart-shaped smiley painted behind CALCULATOR, "APPROVAL RATING" and "HAPPINESS INDEX" bars behind TERMINAL and BROWSER, a confetti animation, a smiley banner icon, and ghost text ("YOUR FRIEND FOREVER") on the right.
Direction: section 4 in full: washed near-black `#1C1A1E`, faded beige-grey `#B8B0A0` text, spot pink `#E0508C` and yellow `#F0D040`, static grain and halftone, bold hard-shadow tile panels, a paper-doll silhouette and spirit blob in the header strip only. Arial Black title, Yu Gothic Bold labels. No smiley, confetti or invented copy. Static.
#### resident-evil — RESIDENT EVIL
Score 3 | Art: redraw | Bundle: no
Wrong: red on near-black with grey text is the horror side; the clinical Umbrella layer (white tile, red-and-white segments) is missing. A dim typewriter-and-item-box drawing ("INK RIBBONS REMAINING: 3") sits behind CALCULATOR and BROWSER, its roller bar running across the CALCULATOR label. The banner icon is a dark red hexagon with no franchise link. Segoe caps, generic.
Direction: bg `#0A0A0A`, Umbrella red `#B5121B` accent-c, white `#E8E8E8` text on grey panels `#2A2A2A`, herb green `#3F5A3A` for one tick. Frame art: a static green-yellow-red ECG line (FINE, CAUTION, DANGER) in the header, a red-and-white four-segment circle (no umbrella) as banner icon, a 5 percent white tile grid in the banner. Courier New labels. 2 px tiles. Static.
#### robocop — ROBOCOP
Score 3 | Art: redraw | Bundle: no
Wrong: navy and visor blue are near, but a whole targeting HUD (reticle, bars, a red box with directives) is painted behind NOTEPAD, CALCULATOR and BROWSER and crosses labels; ghost lines ("DEAD OR ALIVE", "SERVE THE TRUST") print right. Chrome blue-steel, OCP red and bevelled metal are absent.
Direction: bg `#0A0C10`, chrome `#7A8CA0` borders with a static two-stop bevel on header and banner, visor blue `#4AA8E0` accent-c, OCP red-orange `#E83A2A` on edit, text `#C8D0D8`. Frame art: static corner ticks (targeting brackets) on tile hover and focus only, banner text "1 SERVE 2 PROTECT 3 UPHOLD" if it fits, a generic hexagon corporate mark as banner icon (not the OCP logo). Bahnschrift Bold caps. Keep visor-plate tiles. Static.
#### scp — SCP FOUNDATION
Score 3 | Art: tone down | Bundle: no
Wrong: restraint is right (clinical grey, red warning, Consolas). Faults: redaction bars sit under the tile labels (grey under NOTEPAD and TERMINAL, behind CALCULATOR, red under the lower row), a ghost class list ("EUCLID", "SAFE") prints through PAINT and FILES, a scan animation runs, the banner icon is a dull red square. Wiki look and the three-arrow containment mark are missing.
Direction: bg `#0E0E0E`, grey `#C8C8C8` text, panels `#1A1A1A`, warning red `#B01818` on edit and one class stripe, caution yellow `#E8B020` for one Euclid tag. Frame art: static black redaction bars of varied lengths in the header and banner only, three arrows around a small ring as banner icon, a hazard-triangle tick. Consolas labels, Segoe UI title (wiki sans). Square tiles. Static.
#### silent-hill — SILENT HILL
Score 4 | Art: tone down | Bundle: no
Wrong: the light foggy off-white base is exactly right and one of only three light themes. Faults: every label has a grey blurred halo that reads as a stain on a light ground, the ghost lines ("THERE WAS A HOLE HERE", repeated in the banner, corrupted "WAS(a)HOLE") print through PAINT and FILES, rust-red is missing, and a fog animation runs.
Direction: keep bg `#C8C0B8`, text `#3A3530`; add rust `#A02A1A` on edit and one flaked corner (static gradient), dingy off-white `#D0C8A8` banner. Remove label shadows, readout, fog. Frame art: a static torn-notepad edge on the banner top, a 5 percent scratched-grid texture, a thin dark chain-link diamond edge on the bottom pad. Georgia italic labels, no shadow. Static; verify 4.5:1 on `#C8C0B8`.
#### siren — FORBIDDEN SIREN
Score 2 | Art: redraw | Bundle: no | CONTRAST (legacy fail)
Wrong: fails on text-dim (3.3:1), accent-c and hint-sub (2.2:1). Nearly nothing identifies it: near-black with faint dim red lines and a static-glitch layer, where the game is two channels of sightjack vision (sepia and cold blue-grey) and red water. Painted "SIGHTJACK / SHIBITO" text is invisible at this alpha; the banner is the only strong element.
Direction: bg `#0C0808`, pale sepia `#C8B090` text (fixes contrast), blood `#A31A1A` accent-c and edit, cold blue-grey `#3A4A5A` second channel, panels `#1A1A1A`. Frame art: the header splits into warm sepia and cold blue-grey halves with a hard seam, three thin static-band lines on the pad, a low red-water gradient rising to 12 percent height, a "屍人" tag in Yu Gothic Bold. Segoe UI Semilight. Square tiles. Static.
#### soma — SOMA
Score 3 | Art: tone down | Bundle: no
Wrong: abyssal teal with porthole-like circle tiles and a superb banner question ("CAN CONSCIOUSNESS SURVIVE WITHOUT A BODY?"). Faults: faint orbit rings and dots sit behind the middle column, ghost lines ("WAU WANTS TO HELP") print right, bubbles animate. Rust and the grey-pink WAU growth, the game's real texture, are absent: a clean teal dashboard.
Direction: bg `#06090C`, teal `#3A8CA8` accent-c, cold-lamp `#E8D070` focus, rust `#9A3A2A` streaks (static) in two corners, text `#C8D8DC`, hull `#1A2A32`. Frame art: pressure-hull ring segments on the pad, a thin branching vein line in one corner, a porthole ring as banner icon. Consolas UI, Segoe UI title. Keep circle tiles. Static, no bubbles.
#### stalker — S.T.A.L.K.E.R.
Score 3 | Art: redraw | Bundle: yes (Russo One, Stalinist One)
Wrong: khaki olive, sodium amber and the trefoil banner icon are right. But a big translucent PDA (map, compass, level bars) is painted behind CALCULATOR and BROWSER and their labels, ghost lines print right, and red and green anomaly dots sit by PAINT and FILES. No Cyrillic anywhere in a Soviet-industrial theme.
Direction: make the window the PDA: a static 12 px bezel rim with two screw dots and three button squares in the header, an 8 percent LCD tone `#8A9A8A` on the tile field. bg `#0E100B`, olive `#8A8A50` accent-c, amber `#E8A020` focus, rust `#C84A1A` edit, concrete `#4A4A3A` panels, text `#D8D8B8`. Header tag "ЗОНА" in Bahnschrift SemiBold (Cyrillic covered). Bahnschrift caps labels. Square tiles. Static.
#### stranger-things — STRANGER THINGS
Score 2 | Art: redraw | Bundle: no
Wrong: Makoto's pitfall: magenta and hot pink (`#FF0066`, `#C070A0`) where the show is neon red on black with cream and Upside-Down blue. A string of Christmas-light bulbs is a good idea but it runs directly through the NOTEPAD, CALCULATOR and PAINT labels. The title is a spaced sans (no Benguiat swash serif), and the banner is mono.
Direction: bg `#0A0408`, neon red `#E0182A` accent-c and title, cream `#F0E8D0` text, Upside-Down blue `#1A3A6A` hover, amber `#FFB030` in bulbs only. Frame art: the string of lights moves to the header bottom edge (six static bulbs on a slack wire, or one stepped twinkle), a thin red outline glow on the title (static). Georgia Bold title, tight tracking, thin red outline; Georgia Italic labels. 2 px tiles. Static.
#### terminator — TERMINATOR
Score 3 | Art: tone down | Bundle: no
Wrong: red vision on black and monospace HUD type are right. But scanlines stripe every icon, a red reticle circle sits behind CALCULATOR and BROWSER, a red haze column runs right of centre, and a ghost list ("PRIORITY: T1") crosses PAINT and FILES. The cold 2029 blue and chrome are absent (pure red-black pitfall). Octagon tiles are arbitrary.
Direction: bg `#06080C` with a static red tint at the top, red `#D8281A` accent-c and edit, cold blue `#3A6A9A` focus, chrome `#B8B8B0` borders, text `#E0C0BC`. Scanlines on header and banner only. Frame art: three short static analysis lines in the header, crosshair brackets on hover and focus, a flat red ring-with-dot eye as banner icon. Consolas caps. Square tiles. Static.
### 6.15 Standalone themes, alphabetical sheet 5 (the-expanse to yakuza)

#### the-expanse — THE EXPANSE
Score 3 | Art: redraw | Bundle: no
Wrong: cold teal-blue and a plain functional sans fit "practical ship UI", but big concentric gate rings sit behind CALCULATOR and BROWSER and their labels, a ghost list prints right (corrupted "RING GATE(a)PPROACH"), and a scan animation runs. The show's core is worn orange-lit cockpits and the three-faction code (Earth blue, Mars red, Belt orange); orange is absent.
Direction: bg `#0A0E14`, Belter orange `#E8781A` accent-c, UN blue `#4A90C8` focus, Mars red `#A83A2A` on edit, text `#D8D8D0`, panels `#1A2028`. Frame art: a static 3 px blue-red-orange faction stripe on the header bottom, short static delta-V bars in the banner, one diagonal torch-trail line in a corner, an X-in-circle mark as banner icon. Bahnschrift Light caps, tracking 2 px. Keep rounded-square tiles. Static.
#### the-sandman — THE SANDMAN
Score 2 | Art: redraw | Bundle: no | CONTRAST (legacy fail)
Wrong: fails on text-dim (3.3:1), accent-c and hint-sub (2.4:1). Header text is cut by the buttons. The bottom ghost line (Endless names) shows missing-glyph boxes between the words, a defect rather than atmosphere. Indigo and lavender is Dream, but the McKean collage, falling sand, the crescent helm and Delirium's clash are absent: a dark blue tint with a few faint star dots.
Direction: bg `#0A0812`, dream indigo `#4A3A8A` panels, pale lavender `#C8B8E8` text (fixes contrast), sand-gold `#D8A040` accent-c, Death's white `#E8E4F0` banner strip, Delirium pink `#8A2A4A` on edit only. Frame art: static dotted-column sand texture in two corners, a thin tall-spiked helm outline (not the show's prop) in the header, a crescent as banner icon. Palatino Linotype italic. Keep circle tiles. Static.
#### the-witcher — THE WITCHER
Score 3 | Art: redraw | Bundle: no
Wrong: parchment gold, medallion circle tiles and the "TOSS A COIN" banner read right. But an alchemy circle with a Quen-like pentagram is painted behind CALCULATOR and BROWSER and crosses labels, ghost words ("KAER MORHEN", "MONSTER CONTRACT") print right, and gold diamonds dot the frame. The leather notebook look, wolf medallion and swamp green are missing.
Direction: bg `#0E0C0A`, silver-steel `#8A8A88` borders, cat-eye amber `#C8A048` accent-c, blood `#6A1A1A` on edit, swamp `#2A3A2A` panels, leather `#3A3028`, text `#DCD0B0`. Frame art: a dashed stitched-leather edge on the pad, a generic notched-ring medallion as banner icon (not the school medallion), a slit-pupil mark in the header. Palatino Linotype bold, tracking 1 px. Keep circle tiles. Static.
#### tiny-bunny — TINY BUNNY (ЗАЙЧИК)
Score 3 | Art: tone down | Bundle: yes (Underdog, Marck Script)
Wrong: cold navy-grey with a real Cyrillic header and banner ("НЕ ХОДИ ТУДА. ЛЕС НЕ ОТПУСТИТ.") is on brief and a good touch. Faults: faint birch lines and a tiny rabbit figure sit between columns, Russian ghost text prints by PAINT and FILES, tiles are plain rounded squares. The visual-novel name-plate text box and folk embroidery are missing; the red is invisible.
Direction: bg `#0A0E14`, snow-blue `#A8B8C8` text, panels `#1A2430`, blood `#C8202A` on edit and one 2 px header tick. Frame art: a static cross-stitch band on the header bottom, a name plate reading "ЗАЙЧИК" at the banner left, three thin birch stems in the outer pad only, a rabbit-mask banner icon. Georgia italic (Cyrillic supported). 2 px tiles. Static, no snow.
#### tomb-raider — TOMB RAIDER
Score 3 | Art: redraw | Bundle: no
Wrong: dark bronze and italic Georgia say "tomb", but the warm torch against cold stone that the brief promises is not there. A carved doorway with a "WARNING / DEATH AWAITS" sign and an expedition log is painted behind the left column and the gap to CALCULATOR; ghost text ("SURVIVOR IS BORN") prints right. It overlaps Indiana Jones and Uncharted (three brown-gold journals).
Direction: go cool stone with a warm torch: bg `#14120E`, ruin stone `#2A2418` panels, jungle green `#4A6A3A` borders, relic gold `#B8944A` accent-c, torch `#C8602A` on hover only, text `#E0D0A8`. Frame art: a static 5 percent carved-glyph relief band in the header, a dashed map path in the gutter, two crossed ice-axe lines as banner icon. Palatino Linotype bold caps. Keep shield tiles. Static.
#### tron — TRON
Score 3 | Art: tone down | Bundle: no
Wrong: cyan grid on deep blue and hex tiles are the right family, but the palette is bright cyan on blue (`#6DE8FF`) while Legacy is desaturated aquamarine plus orange. A faint scan grid runs behind the tiles, short vertical orange and teal ticks sit in the gutters and across the banner, orange is otherwise missing, and the ghost readout is corrupted ("IDENTITYISC: ON CYCLES:").
Direction: bg `#000A14`, crisp cyan `#2AC8FF` (1 px lines, no glow) accent-c, orange `#F4AF2D` on edit and one banner disc, text `#E8FAFF`, panels `#0A2A44`. Frame art: a static thin-line perspective grid floor in the banner strip only, an identity-disc ring-with-notch as banner icon, circuit traces in two upper pad corners. Consolas caps, wide tracking. Keep hex tiles. No glow animation.
#### twin-peaks — TWIN PEAKS
Score 3 | Art: redraw | Bundle: no | CONTRAST (legacy fail)
Wrong: fails on accent-c (2.0:1) and text-dim. The title "QUICK LAUNCH" renders tiny and raised above the version line, off the baseline every other theme uses. The window is near-pure black with a faint red edge: no curtain, zigzag floor or timber is readable, so only the owls banner says Twin Peaks. Warm timber, diner gold and fir green are missing.
Direction: bg `#0C0A08`, curtain red `#8A1A1A` as header and banner fill (static fluted gradient), timber `#2A2018` panels, diner gold `#C89A3A` accent-c, cream `#E8DCC0` text, fir green `#1A4A3A` focus. Frame art: a static 10 px black-and-white zigzag strip on the banner top, an owl banner icon, a fir tree-line in the header. Fix the title size and baseline. Bahnschrift SemiBold title. 2 px tiles. Static.
#### uncharted — UNCHARTED
Score 3 | Art: tone down | Bundle: no
Wrong: the warm brown journal is right and a rare warm mid-tone. But it is a dim brown block, not sunlit; a compass rose, an X mark and a torn-map fragment sit around the centre tiles, a ghost list ("OH CRAP", "SIC PARVIS MAGNA") prints right, and the banner truncates. Uncharted is warm, colourful and sunlit, with no gothic weight.
Direction: bg `#2A1E14` (lighter, warm), ochre `#C8823A` accent-c, jungle teal `#3A8A8A` focus, cream `#E8D8B0` text, `#8A5A2A` borders. Frame art: four static tan tape corners at the window corners, a coffee-ring circle on the banner, a torn-paper edge on the banner top, a small compass as banner icon. Ink Free labels and banner, Palatino Linotype bold title. 2 px tiles. Static.
#### x-files — THE X-FILES
Score 3 | Art: redraw | Bundle: no | translucent bg (0.93, acceptable)
Wrong: dark teal and a case-file feel are right, and a typed case line runs across the top of the tile field (corrupted: "X-73841(*)GENT: MULDER, F.(-)LASSIFICATION"). A large red "CLASSIFIED" stamp is painted diagonally behind the bottom tiles, scanlines band the icons, the banner strip is pure black with a red X icon. The flashlight beam in blue dark, folder and badge are missing.
Direction: bg `#06090C`, teal `#2A8A9A` accent-c, flashlight `#E8D8A8` focus, red `#A82A1A` on edit and one stamp box in the banner only, text `#D8E0E4`. Frame art: a static manila-folder tab top-left of the header, a 6 percent flashlight cone from a pad corner, a UFO disc as banner icon; no "I WANT TO BELIEVE". Courier New labels, Segoe UI Light caps title. Square tiles. Static.
#### yakuza — YAKUZA / LIKE A DRAGON
Score 2 | Art: redraw | Bundle: yes (Shippori Mincho, Reggae One)
Wrong: pink and cyan neon on purple-black (pink labels, a pink KAMUROCHO plate above the grid) is the Blade Runner or synthwave look Makoto warns against; Yakuza is crimson, gold and black with neon as background in a scuffed, humid city. Pink sign cards (KIRYU, MAJIMA) sit behind NOTEPAD, PAINT, TERMINAL and BROWSER and the plate crowds the CALCULATOR icon. The lone 龍 banner glyph is good. Seven animations, including rain.
Direction: bg `#0B0A0C`, crimson `#C4161C` accent-c and edit, gold `#D4A83B` focus and one banner mark, text `#F5F0E8`, panels `#262626`. Neon only as two 6 px vertical sign bars (pink `#E83A8C`, blue `#3A9BD8`, static) on the outer pad edges. Frame art: a single-line coiled dragon (drawn originally) in the header, a red-gold trim line, 龍 banner icon (Yu Gothic Bold). Bahnschrift SemiBold caps, Impact title. Rounded-square tiles. Static, no rain.
---

## 7. Batches (worst first; one batch at a time)

Order rule: batches run in ascending average fidelity score, so the biggest visible gains come first. Batch 1 is chosen as the morning showcase rather than as a family, and the remaining 13 are franchise families or look families so each batch shares one visual kit and one spec. Sizes are 6 to 10 themes. Every batch applies section 1 (C1 to C5, H1 to H8) without restating it.

Per-batch procedure (Judy spec, then Ender): the spec names, for each theme, the exact hex palette, the font stack from C2, the frame-art elements with pixel positions inside the C5 zones, the tile shape, the `THEME_BANNERS` strings (fitting one line) and the motion budget. After implementation: contrast gate, gallery "after" run (same names), hidden-tiles shot, `infinite` count, then Sergei's before/after.

| # | Batch | Themes | Avg score | Redraw / tone down / keep |
|---|---|---|---|---|
| 1 | Showcase (mixed families, clearly bad, high gain) | promise-mascot, persona-4, gryffindor, 2001, cyberpunk, stranger-things, shire, dead-space | 1.88 | 8 / 0 / 0 |
| 2 | Japanese games and anime | akira, yakuza, parasite-eve, nonary-games, siren, persona-3, persona-5 | 2.29 | 7 / 0 / 0 |
| 3 | Assassin's Creed, Secret World, Doom | ac-assassins, ac-templars, swl-templar, swl-dragon, swl-illuminati, doom-classic, doom-eternal | 2.43 | 5 / 2 / 0 |
| 4 | Warhammer 40,000 | warhammer-chaos, warhammer-orks, warhammer-tyranids, warhammer-eldar, warhammer-necrons, warhammer | 2.50 | 4 / 2 / 0 |
| 5 | Final Fantasy | ff6, ff7, ff14, ff8, ff9, ff10, ff15 | 2.57 | 5 / 2 / 0 |
| 6 | Star Wars | star-wars-republic, star-wars-separatist, star-wars-empire, star-wars-rebel, star-wars-sith, star-wars-mando | 2.67 | 4 / 2 / 0 |
| 7 | Horror I: old-book and analogue dread | amnesia, lovecraft, event-horizon, blair-witch, silent-hill, tiny-bunny, alan-wake | 2.71 | 4 / 2 / 1 |
| 8 | Adventure journals and TV | life-is-strange, the-sandman, indiana-jones, tomb-raider, uncharted, broken-sword, twin-peaks, x-files | 2.75 | 5 / 3 / 0 |
| 9 | Fantasy RPG and heraldry | wow-scourge, wow-alliance, wow-horde, wow-legion, wow-nightelf, diablo, dragon-age, the-witcher, game-of-thrones, mortal-kombat | 2.80 | 8 / 2 / 0 |
| 10 | Harry Potter and Middle-earth | hufflepuff, mordor, hogwarts, slytherin, ministry-of-magic, rivendell, ravenclaw | 2.86 | 3 / 3 / 1 |
| 11 | Film and TV sci-fi, game HUDs | blade-runner, dune, firefly, doctor-who, lcars, eve-online, mass-effect, the-expanse | 3.00 | 5 / 3 / 0 |
| 12 | Horror II: institutions and stations | resident-evil, scp, soma, stalker, control, fatal-frame | 3.00 | 4 / 2 / 0 |
| 13 | Terminals and tactical HUDs | alien, pip-boy, terminator, half-life, metal-gear, robocop, predator, matrix | 3.13 | 4 / 3 / 1 |
| 14 | Clean lines and wireframes | tron, ghost-shell, evangelion, deus-ex, mirrors-edge, portal | 3.33 | 0 / 4 / 2 |

Why batch 1 is the showcase:
- **Clearly bad today:** promise-mascot is the only score 1 (wrong premise and confetti); gryffindor has the worst tile overlap among the Harry Potter themes; 2001 is dark where the film is white; cyberpunk and stranger-things are the wrong hue (magenta for yellow, pink for red); shire is a box around the tile field; dead-space has lost its blue; persona-4 is gloomy where the game is yellow.
- **High gain from small changes:** four of eight are palette corrections that Sergei will see at a glance (yellow in Cyberpunk, red in Stranger Things, white in 2001, blue in Dead Space).
- **Good spread:** one light theme (2001, the C3 white-ground test), one mid-tone earth theme (shire), one heraldic (gryffindor), one pop-art (persona-4), one neon-HUD (cyberpunk), one sci-fi hologram (dead-space), one TV (stranger-things), one new-premise (promise-mascot). It also exercises every C5 zone (header strip, banner strip, frame band, gutter rules) and the C3 add-on measures, so it validates the whole method on the widest range before more work is spent.
- **Only 2 of 8 need a bundled font** (promise-mascot: Dela Gothic One; cyberpunk: Rajdhani or Chakra Petch), so it works with stock fonts on Sergei's other machines.
- Batch 1 also sets the shared references: the hidden-tiles luminance floor (`2001`) and ceiling (`promise-mascot`) named in C5, and the first gallery "after" set, so later batches are compared like for like.

Notes for later batches:
- **Batch 4 (Warhammer)** is specified as six materials, not six hues (gothic gold and parchment; spiked corrupted plate; wraithbone curves; seam-lit tomb metal; scrap and paint; wet chitin), one shared frame kit with per-faction motifs.
- **Batch 5 (Final Fantasy)** shares one static blue-gradient window treatment across ff6, ff7, ff8 and ff9 with a per-game accent, so the family reads as a family.
- **Batch 6 (Star Wars)** shares a frame kit (header strip, banner strip, corner ticks) and differs in material: Empire flat and rectangular, Rebel stencil and khaki, Republic ivory and brass, Separatist droid tan, Sith angular edge-light, Mando riveted steel and rust.
- **Batch 14 is last on purpose:** these six are closest to right and gain least; run it only if Sergei wants full coverage.

---

## 8. Font wishlist (for Sergei's morning decision; nothing downloaded)

Rules: overnight batches use stock Windows fonts only (C2). Each font below is free-licensed (SIL OFL 1.1 unless marked). Licence, Cyrillic and source URL are from Makoto's font licence check (`Team/Research/QuickLaunch_ThemeReferences_2026-09-29.md`, checked against the google/fonts repository on 2026-09-29). File name and file size are not in that table and I did not download anything to measure; Ender reads them from the repository page after Sergei says yes. Each bundling needs Sergei's per-file OK, and the OFL text must be included with any redistributed file.

Counts below count only the themes where I marked "Bundle: yes" (26 themes gain clearly; the other 75 are fine with stock fonts). I ranked by how many themes a font lifts and how much.

**Tier 1: most themes, biggest visible gain (recommend these five first)**

| Font | Licence | Cyrillic | Themes it lifts | Source |
|---|---|---|---|---|
| Cinzel | OFL 1.1 | no | warhammer, ac-assassins, diablo, dragon-age, game-of-thrones (also a good fit for star-wars-republic, ff14, ravenclaw if Sergei wants a second pass) | https://github.com/google/fonts/tree/main/ofl/cinzel |
| Pirata One | OFL 1.1 | no | warhammer-chaos, wow-horde, wow-scourge, diablo | https://github.com/google/fonts/tree/main/ofl/pirataone |
| UnifrakturCook | OFL 1.1 | no | warhammer, diablo, swl-templar, lovecraft | https://github.com/google/fonts/tree/main/ofl/unifrakturcook |
| IM Fell English | OFL 1.1 | no | warhammer, swl-templar, lovecraft | https://github.com/google/fonts/tree/main/ofl/imfellenglish |
| Metamorphous | OFL 1.1 | no | wow-horde, mordor, dragon-age | https://github.com/google/fonts/tree/main/ofl/metamorphous |

**Tier 2: single-franchise identity fonts (each lifts one or two themes a lot)**

| Font | Licence | Cyrillic | Themes | Source |
|---|---|---|---|---|
| Dela Gothic One | OFL 1.1 | yes | promise-mascot (batch 1), akira | https://github.com/google/fonts/tree/main/ofl/delagothicone |
| Rajdhani | OFL 1.1 | no | cyberpunk (batch 1) | https://github.com/google/fonts/tree/main/ofl/rajdhani |
| Chakra Petch | OFL 1.1 | no | cyberpunk (alternative to Rajdhani) | https://github.com/google/fonts/tree/main/ofl/chakrapetch |
| Shippori Mincho B1 | OFL 1.1 | no | evangelion | https://github.com/google/fonts/tree/main/ofl/shipporiminchob1 |
| Zen Antique | OFL 1.1 | yes | evangelion (alternative) | https://github.com/google/fonts/tree/main/ofl/zenantique |
| DSEG (7- and 14-segment) | OFL 1.1 from the current releases; older releases used an original licence, so download a current one | not checked (digit face) | nonary-games (bracelet display digits) | https://github.com/keshikan/DSEG and https://www.keshikan.net/fonts-e.html (not on Google Fonts) |
| Black Ops One | OFL 1.1 | no | star-wars-rebel (stencil) | https://github.com/google/fonts/tree/main/ofl/blackopsone |
| Libre Franklin | OFL 1.1 | yes | star-wars-rebel (saga sans) | https://github.com/google/fonts/tree/main/ofl/librefranklin |
| Russo One | OFL 1.1 | yes | stalker | https://github.com/google/fonts/tree/main/ofl/russoone |
| Stalinist One | OFL 1.1 | yes | stalker (Cyrillic display) | https://github.com/google/fonts/tree/main/ofl/stalinistone |
| Antonio | OFL 1.1 | no | lcars | https://github.com/google/fonts/tree/main/ofl/antonio |
| Oswald | OFL 1.1 | yes | lcars (alternative) | https://github.com/google/fonts/tree/main/ofl/oswald |
| Press Start 2P | OFL 1.1 | yes | doom-classic | https://github.com/google/fonts/tree/main/ofl/pressstart2p |
| Rye | OFL 1.1 | no | firefly | https://github.com/google/fonts/tree/main/ofl/rye |
| Underdog | OFL 1.1 | yes | tiny-bunny (Cyrillic) | https://github.com/google/fonts/tree/main/ofl/underdog |
| Marck Script | OFL 1.1 | yes | tiny-bunny (alternative) | https://github.com/google/fonts/tree/main/ofl/marckscript |

**Tier 3: nice to have (one theme each, stock fonts get within one score point)**

| Font | Licence | Cyrillic | Theme | Source |
|---|---|---|---|---|
| Grenze Gotisch | OFL 1.1 | no | warhammer-chaos, wow-legion, wow-scourge | https://github.com/google/fonts/tree/main/ofl/grenzegotisch |
| Cinzel Decorative | OFL 1.1 | no | wow-legion | https://github.com/google/fonts/tree/main/ofl/cinzeldecorative |
| Marcellus | OFL 1.1 | no | ac-assassins | https://github.com/google/fonts/tree/main/ofl/marcellus |
| Uncial Antiqua | OFL 1.1 | no | mordor | https://github.com/google/fonts/tree/main/ofl/uncialantiqua |
| Limelight | OFL 1.1 | no | ministry-of-magic | https://github.com/google/fonts/tree/main/ofl/limelight |
| Poiret One | OFL 1.1 | yes | ministry-of-magic | https://github.com/google/fonts/tree/main/ofl/poiretone |
| Special Elite | Apache 2.0 | no | ministry-of-magic | https://github.com/google/fonts/tree/main/apache/specialelite |
| Rampart One | OFL 1.1 | yes | akira | https://github.com/google/fonts/tree/main/ofl/rampartone |
| Shippori Mincho | OFL 1.1 | no | yakuza | https://github.com/google/fonts/tree/main/ofl/shipporimincho |
| Reggae One | OFL 1.1 | yes | yakuza | https://github.com/google/fonts/tree/main/ofl/reggaeone |
| Sancreek | OFL 1.1 | no | firefly | https://github.com/google/fonts/tree/main/ofl/sancreek |

Notes for Sergei:
- If he approves only one pack, Tier 1 (five families, all serif and blackletter for the fantasy and heraldry themes) plus Dela Gothic One and Rajdhani lifts 14 of the 26 themes, across batches 1, 2, 3, 4, 7, 9 and 10.
- Some wishlist fonts are already installed on this machine (Cinzel Black, Russo One, Teko SemiBold, Permanent Marker, Orbitron Bold) but are not stock Windows, so screenshots taken here would show them and Sergei's other computers would not. Bundling makes the look identical everywhere, which is a second reason to prefer Tier 1 (Cinzel) and Russo One.
- Fonts I considered and left out: Bebas Neue and Oswald for Persona (Bahnschrift SemiBold condensed is close enough), Orbitron (three themes look better with Bahnschrift, and Orbitron reads as generic sci-fi), and Cormorant Garamond (Constantia italic is a near stand-in for the elegant-serif themes).
- Proprietary faces the franchises really use (Swiss 911 for LCARS, Friz Quadrata for WoW, ITC Benguiat for Stranger Things, Matisse EB for Evangelion) are never suggested and must not be shipped.

---

## 9. Out-of-scope findings for Sergei (do not fix in the theme batches)

1. **Settings overlay is cut off in every theme at the default 424x300 window.** The `.overlay` is `position: fixed; inset: 0; display: flex; align-items: center`, and the panel inside is taller than the window with no `overflow`, so the title at the top and the CLOSE and CHECK FOR UPDATES buttons at the bottom sit outside the visible area and cannot be scrolled to. Root cause is in `src/renderer/styles/base.css` (about line 603), not in any theme. A fix belongs to Ender with a Judy spec (scrollable panel or a two-column layout); it is a functional bug because the CLOSE button cannot be reached with the mouse at the default size (whether Esc closes it was not checked).
2. **The theme-authoring guide never warns about the `\A` trap.** `WIP/QuickLaunch/.claude/commands/create-theme.md` shows `content: 'LINE 1\ALINE 2 ...'`, which is safe only by luck (LINE and KEY start with non-hex letters). A line that starts with A to F or a digit (EMPIRE, DEATH STAR, COMMAND, 1,024) is swallowed into the escape, which is what corrupts 91 of 101 themes. Add a warning and use `\A ` with a space, or delete the readout section. The guide sits under `WIP/QuickLaunch/.claude/`, a code-side path, so Ender edits it.
3. **The guide's "shape must be unique" and "every theme needs a panno, a readout, header text and an 88 percent flash" rules produced the current look.** After batch 1 is approved, the guide (and `studio-skin`) should be rewritten to match section 1 of this audit (H1 to H8, C4, C5). The guide also lists a "Style C lore panno" as an acceptable choice; that style is what puts unreadable dossier text behind the tiles.
4. **`#app` carries a `backdrop-filter: blur(18px)` that blurs nothing** (the window is transparent and the desktop is outside the page). The guide already records that it costs about 3 to 5 percent of a core while focused. Removing it from `base.css` (line 160) would cut CPU in all 101 themes at once. No visual change is expected; Ender should confirm with a before and after screenshot. Same for `.overlay` (`blur(8px)`, line 606).
5. **The contrast gate cannot see the real readability problems.** `scripts/check-theme-contrast.js` checks five variables against black only. It does not check tile labels over art, banner text, header text, or translucent themes over a light wallpaper (see the grey-backdrop shots of ac-assassins, ff10, ghost-shell, rivendell). Recommend extending it with a label-over-brightest-art check and a translucent-over-white check, or at least documenting the limit. Ender and Senua's call.
6. **`#header::after` boundaries conflict.** `base.css` sets `right: 135px` but every theme sets `left: 200px`, so at 424 px the flavour text has about 90 px and is always clipped; in a narrower window it collides with the title. H2 deletes the text in redesigned themes, but the base rule should hide the element below a width threshold.
7. **Banner text truncation is a base-layout property.** `#theme-banner-text` is `nowrap` with `letter-spacing: 2px` at 11 px, which allows roughly 40 characters (the gallery shows cuts at 43 to 45). Measured from `THEME_BANNERS` in `app.js`: 194 of the 471 quotes (41 percent) are longer than 40 characters, and 40 of the 101 themes have a majority of long quotes, so they end in an ellipsis (visible in blade-runner, swl-illuminati and uncharted). H3 shortens the strings per theme; a base change (allow two lines, or tighter tracking) would stop the problem recurring.
8. **Twin Peaks title layout defect.** In `twin-peaks-grid.png` the "QUICK LAUNCH" title is tiny and raised above the version line, unlike every other theme. It is theme-specific and will be fixed in batch 8, but the cause (a font-size or transform override in the theme, or a hover state captured mid-animation) was not confirmed.
9. **Clipped-window themes show a white wedge in the gallery.** In `blade-runner-grid.png` a white triangle sits at the bottom-left corner. That is the theme's `--app-clip` polygon showing the capture's white backdrop; in the real transparent window it should show the desktop. Same clip exists in cyberpunk, dead-space, deus-ex, ghost-shell, mass-effect and warhammer. Check once in the real app; the gallery method could set a dark backdrop.
10. **What I did not review.** I reviewed the grid screenshot of every theme against its CSS and the franchise sheet. I did not review the hover and settings screenshots for the 101 themes (attempts to open a few did not render), so entries describe the grid state only; the settings finding above comes from the brief and from the CSS. I did not measure contrast numbers beyond the gate's own output (13 legacy failures listed in C3). Font and CPU statements come from the CSS and `theme-metadata.csv`, not from a profiler. I did not launch QuickLaunch. Window sizes larger than 424x300 were not screenshotted, so C5's larger-window checks are still to be proven in batch 1.

---

## 10. Summary

- **Fidelity score histogram (101 themes):** 1 = 1, 2 = 33, 3 = 62, 4 = 5, 5 = 0. The five 4s are ravenclaw, deus-ex, matrix, portal and silent-hill. No theme scores 5 because none has franchise-correct type.
- **Art call:** redraw 66, tone down 30, keep 5 (keep: blair-witch, deus-ex, matrix, portal, ravenclaw).
- **Bundled-font gain:** 26 themes would clearly gain; 75 are fine on stock fonts.
- **Contrast:** 13 themes fail today (legacy list); every redesign must pass with no legacy pass.
- **Batches:** 14, sizes 6 to 10, ordered by ascending average score; batch 1 is the showcase.
