# QuickLaunch theme fidelity — Batch 09 UX spec

Judy · 2026-10-08 · **Preparatory spec, ready once committed; implementation follows completed Batch08.** No code/theme/assets/font/git/app/native-input changes were made. Proposed opaque palettes were screened using WCAG sRGB arithmetic only; actual rendered contrast, fit, hit areas and visual approval remain pending.

## 0. Approved inputs, scope and ownership

This is an **EXTEND** of the approved Theme Fidelity work on the live integration checkout: plan `9719edc` (all101, one batch at a time), audit `a659bf9` §§1/3/6/7, Foundation `75b9f7c` Parts A/B, completed Batch06 `16d89bf`, eleven-font README `4191e24` and completion inventory `8cc8517`. Inherit committed Batch07's integration-state acceptance contract; Batch08 is preparatory predecessor, not permission to implement concurrently. Preserve original approved era rulings: **Diablo II** and **Dragon Age: Origins**.

| Exact CSS file under `src/renderer/styles/themes/` | Existing catalogue name (preserve) | Audit action | Identity |
|---|---|---|---|
| `wow-scourge.css` | WOW: SCOURGE | redraw | Cracked ice, icicle spires, chains and plague purple |
| `wow-alliance.css` | WOW: ALLIANCE | tone down | Royal blue, gilded stone, battlements and silver |
| `wow-horde.css` | WOW: HORDE | redraw | Bronze/hide/iron, thorns and bone tusks |
| `wow-legion.css` | WOW: BURNING LEGION | redraw | Obsidian, fel ring, demonic purple and tooth seam |
| `wow-nightelf.css` | WOW: NIGHT ELVES | tone down | Violet moon, teal focus, forest antlers/branches |
| `diablo.css` | DIABLO | redraw | Diablo II iron/stone, red health and blue mana orbs |
| `dragon-age.css` | DRAGON AGE | redraw | Origins parchment, leather, slate and blood |
| `the-witcher.css` | THE WITCHER | redraw | Swamp/leather notebook, amber eye and notched medallion |
| `game-of-thrones.css` | GAME OF THRONES | redraw | Steel/gold, astrolabe and sword teeth |
| `mortal-kombat.css` | MORTAL KOMBAT | redraw | Gold combat bars, ring and claw slashes |

Count method: ten directly verified existing files/catalogue keys, eight redraw and two tone-down; audit §7 agrees. This document covers only Batch09. Exact font adoptions below are Foundation decisions, not suggestions or new downloads.

Ender owns the ten exact CSS files and agreed bounded evidence docs. Judy owns this spec/visual review; Futaba independently verifies pinned source; Sully alone commits/pushes. Preserve concurrent fallback and other-agent files. No broad palette sweep of completed themes, shared geometry rewrite, new control, new surface, catalogue/banner behaviour change, font download/dependency change, other batch, global-hook/guard/QA-tool repair, policy exception, real input/display/taskbar/scale/sleep, running QuickLauncher/signed-in browser, version/tag/release. STOP/report a missing approved resource or an issue needing shared code; do not silently invent scope.

## 0.1 Common chrome and functional state contract

Inherit audit C1/C3–C5/H1–H8, Foundation A/B, Batch06 §0.1–0.2 and Batch07 §§0.1/0.2/0.3/8 with **this batch's palette/type/motifs replacing the horror values** and ten replacing seven in counts. Functional Windows interaction follows Jakob/Fluent, visibility and quiet material follow NN/g, and reachable controls/focus follow WCAG/Fitts. Do not alter navigation, target geometry or tooltip text to accommodate decoration.

- **Zero infinite animations for all ten.** Delete whole-window flash/shadow, panno/roster/ghost text, moving particles, embers, portal/fog/rune motion, title/icon pulses and hover sheen. Only existing functional transitions remain. No added blur/will-change; preserve established base backdrop blur.
- Grid art stays in the existing scrolling frame background, no fixed layer above tiles. Frame in8px outer bands with four-pixel tile/focus keep-out; glyphs, hard rings, silhouettes, maps, microtext/words and schematics never paint behind labels/icons. In Fan/Ring omit a layer without safe space. `#app::after` paints no content-obscuring art; noninteractive art uses pointer-events:none.
- Header art explicit84×20px in inherited right172/top10 slot, hidden below424px and during filter/long-title/control conflict; legacy title edge≤156px. Dynamic region title/control actual rects govern; hide art first, never change controls to save decoration. Header seams remain inside40px.
- Banner art uses22×22px left icon, ≤7px top seam and measured optional right motif; reserve actual free space and omit decorative right art before truncating text. Existing authored arrays and one-line fit/rotation are retained. No extra hard-coded lore/quote text. No generated text via SVG except simple specified decorative glyphs.
- Plate silhouette is separate from icon clipping: full app glyph mandatory, cuts≤20px. None of the five WoW factions may crop an app into a faction logo. Tail margin3px, no label halo, no icon dimming/glow, no field-shadow/pulse/scanlines. Named palette borders/focus remain readable over every reachable fill.

## 0.2 Binding functional palettes

The audit's lower-luminance inks remain decorative material, while live foregrounds/borders are adjusted for accessibility. Opaque surfaces avoid wallpaper-dependent failures, especially Scourge's legacy50% alpha. Making Scourge opaque is within approved readability treatment; it does not remove base blur. Declare gate variables in the first real `:root`, never leading comments.

| Theme | bg | panel | header/banner | hover | pressed/selected | text | dim/hints | functional accent | border | focus |
|---|---|---|---|---|---|---|---|---|---|---|
| wow-scourge | #05080D | #141D29 | #1B2634 | #30213D | #382948 | #DCE8F0 | #B7C9D6 | #85C9EB | #839CB0 | #79E3BD |
| wow-alliance | #0F1A2E | #182A46 | #1D3151 | #233D65 | #294971 | #DCE4F2 | #B9CAE0 | #E4C36C | #839EC0 | #9FC2FB |
| wow-horde | #150A0A | #221A16 | #302019 | #402721 | #4A2C26 | #E6D2B0 | #CFBC9C | #E0A66B | #AA8D68 | #E0A66B |
| wow-legion | #06100A | #111913 | #19241B | #2B1B3A | #352345 | #D6E8C4 | #B6C6AD | #8AE35A | #7E9C72 | #A8F27E |
| wow-nightelf | #0E0A1E | #1B182C | #242037 | #2D2944 | #352F4D | #D6E2F1 | #BAC5DC | #BAA1EB | #8B9DAC | #73DED3 |
| diablo | #0A0605 | #2A1A12 | #281E17 | #39281C | #443024 | #E9DCC1 | #CCBFA5 | #D7B267 | #A08C70 | #D7B267 |
| dragon-age | #14100C | #2A1A14 | #30221A | #392A20 | #433126 | #EAD8A8 | #CDBF9E | #DCC07A | #A3957A | #A2BBCF |
| the-witcher | #0E0C0A | #263024 | #302920 | #313B2C | #394333 | #E4D9BE | #C6C0AA | #E0BE70 | #9DA893 | #E0BE70 |
| game-of-thrones | #0C0C10 | #1A2029 | #232B35 | #2C3541 | #343F4C | #E8E8EC | #BEC8D8 | #DFC16D | #8C9BAD | #DFC16D |
| mortal-kombat | #0A0A0A | #1C1914 | #242018 | #30281C | #392F20 | #F0F0F0 | #CFC8B6 | #E0B849 | #A99570 | #E0B849 |

Apply Batch07 semantic token mapping exactly with this table: opaque panel/overlay/form-rest; title/body/label/banner/control/tooltip text; dim version/hint/secondary; accent in `--accent-c`, `--accent-text`, `--accent-m`, `--accent-y` and accessible edit/update/hotkey state text; hover/pressed across tiles/buttons/rename/picker/skin/Manager/hotkey; border/focus across actionable outlines/drop hints. No opacity on functional foregrounds. Scoped decorative blood/blue/green inks below never replace functional accent tokens used by title dots/recording/status. Leave actual messages and state names unchanged.

Remove/error controls inherit Batch07 dark-theme `#70222C` opaque fill and `#FFF4F0` glyph at rest/hover/pressed; error text `#F1B5B7`. Explicit theme override if inherited OKLCH/literal foreground would bypass contrast. Theme active-only/selected/hotkey/header states are measured, not assumed from the table.

Opaque table arithmetic across five surfaces gives text/accent/dim minimum≥5.39:1, border≥3.33:1 and focus≥5.07:1. These are palette calculations, **not rendered measurements** and exclude art, alpha, actual icons and inherited CSS. Actual text≥4.5:1, controls/focus/icon≥3:1 remain required on every reachable surface, including brightest art pixels. No rebaseline/legacy exemption for these ten. Fix a failing pair by reducing local art/fill strength or moving its foreground toward text within direction; return exact values to Judy before accepting.

## 0.3 Exact font and fit map

Body/Manager/forms retain `'Segoe UI','Yu Gothic',Arial,sans-serif`, existing functional sizes/weights. Display faces are title-only. Titles start11px, line-height1.2; labels12px/line-height1.2, banner11px; tail clip margin3px and no shadow. Header title is app/region title, never faction roster. All bundled rules specify weight/style and font-synthesis:none.

| Theme | Title family / weight / starting tracking | Tile labels / weight / style / tracking | Banner / weight / style / tracking |
|---|---|---|---|
| wow-scourge | `'Pirata One',Georgia,serif` /400/3px normal | `Georgia,'Times New Roman',serif` /700/normal/.3px caps | same /400/normal/.3px |
| wow-alliance | `'Cinzel','Palatino Linotype',Georgia,serif` /700/3px normal | `'Palatino Linotype',Georgia,serif` /400/normal/.3px caps | same /400/normal/.3px |
| wow-horde | `'Metamorphous',Georgia,serif` /400/2px normal | `Georgia,'Times New Roman',serif` /700/normal/.3px caps | same /400/normal/.3px |
| wow-legion | `'Pirata One',Bahnschrift,'Segoe UI',sans-serif` /400/3px normal | `Bahnschrift,'Segoe UI',sans-serif` /600/normal/.3px caps | same /400/normal/.3px |
| wow-nightelf | `Constantia,Georgia,serif` /400/2px italic | same /400/italic/.3px as typed | same /400/italic/.3px |
| diablo | `'Pirata One','Palatino Linotype',Georgia,serif` /400/3px normal | `'Palatino Linotype',Georgia,serif` /700/normal/.3px as typed | same /400/normal/.3px |
| dragon-age | `'Metamorphous','Palatino Linotype',Georgia,serif` /400/2px normal | `'Palatino Linotype',Georgia,serif` /700/normal/.3px caps | same /400/normal/.3px |
| the-witcher | `'Metamorphous','Palatino Linotype',Georgia,serif` /400/2px normal | `'Palatino Linotype',Georgia,serif` /700/normal/.3px as typed | same /400/normal/.3px |
| game-of-thrones | `'Cinzel','Palatino Linotype',Georgia,serif` /700/3px normal | `'Palatino Linotype',Georgia,serif` /700/normal/.3px as typed | same /400/normal/.3px |
| mortal-kombat | `Bahnschrift,'Segoe UI',sans-serif` /700/2px normal | same /700/normal/.3px caps | same /600/normal/.3px |

Eight title adoptions by counting Foundation map rows: Pirata3, Cinzel2, Metamorphous3; Night Elf and Mortal Kombat stock. No Grenze Gotisch/Cinzel Decorative/Almendra, no substitute Cormorant for Night Elf; wishlist is not adoption. Avoid named installed non-stock faces. All title bundled styles roman; only Night Elf stock italic. Cyrillic falls through to declared stock stack, measured with `Щука Цирк`; don't claim Latin display face covers it.

Use Foundation B2 tracking→10px→stock fallback ladder; title≤156px in inherited art geometry, actual dynamic-title/control rects elsewhere with art hidden on conflict. Labels standard six names fit12px; retain genuine long-name ellipsis. Banner current authored arrays/one-line fit remain, with narrow-layout fallback reported rather than fictional all-line fit. Wait local fonts ready, report rendered family/weight/style and fallback, deliberately misspelled-family control, descenders/numerals/Cyrillic at1×/1.5×/2× simulated raster without changing OS scale.

## 1. Scourge — chains and cracked ice

Delete diagonal runeblade/skull/roster/ghost strings and50% transparent wash. Header84×20: original row of five uneven icicle spires, steel-blue outlined, no sword/helm logo. Upper seam remains inside header. Chain-link ticks in safe outer pad only, each link≤5×7px, no crossing grid. One cracked-corner notch in frame, fine branching lines outside content. Banner22px icon: original short broken chain link over a frost shard, reads ice/chain at1×. Purple hover contrasts against icy text; focus necrotic teal. Plate bevel≤10px, full app glyph. Static; test wallpaper white/midgrey composition if any alpha is retained elsewhere. Squint: menacing frozen metal, not clean cyan UI.

## 2. Alliance — gilded royal stone

Keep navy/gold but remove painted lion/shield and faction roster behind tiles. Header84×20: original stepped battlement parapet, gold outline, two fluted stone notches; no faction lion/logo. Header top has1px gilded rule with battlement notches entirely inside strip. Banner22px icon: generic heater shield with one vertical silver division, no faction emblem, set on a small fluted decorative backing wholly within the icon slot. Tooltip borders use1px functional gold accent, text remains readable. Blue edit/focus identity uses table light-blue focus and blue state fills; no dark blue functional text. Radius2px plates, thin gold hover border, complete app glyph. Squint: royal blue/gilded fortification, distinct from Scourge ice.

## 3. Horde — hide, bone, bronze

Replace red sun/race roster/ghost text. Iron panel with small hide-grain texture≤4% alpha in safe frame only, bronze edge; no red-black full wash. Header84×20 three original tribal chevrons, asymmetrical/heavy, no faction mark. Header bottom and banner top thorn seam≤7px, bone-tusk corner ticks in safe outer bands. Banner22px icon: two curved tusks around a plain bronze rivet, not the Horde emblem. Decorative blood `#A31414` one edit/hover seam, functional fills/table foreground remain safe. Keep wavy-edge **plate**, not cropped icon. No debris. Squint: bronze/leather/bone camp material, not generic crimson evil.

## 4. Burning Legion — fel with obsidian and purple

Remove central portal/readout/roster and all embers. Original jagged tooth row inside header-bottom seam. Header84×20: three angular obsidian shards with one narrow fel `#3AD41E` slit; banner22px single incomplete segmented ring, original angular notches, no portal prop copy. Ring texture only within outer strip at6% alpha, never a ring across tile/label field. Text remains pale neutral `#D6E8C4`, not saturated green; purple hover fill, pale fel focus. Keep hex **plate** and uncut icon. Static. Squint: fel fracture/obsidian portal, clearly unlike teal-frost Scourge and terminal Matrix.

## 5. Night Elves — forest and moon

Keep violet italic direction, remove moonwell/roster/ghost text and lumpy12-point glyph crop. Replace plate with rounded arch-top material without touching app glyph. Upper outer-pad corners have original curved branch/antler strokes in forest decoration `#2F5A3E`, with accessible silver border where it functions as plate outline. Header84×20: paired branch arcs and one tiny moon; banner22px crescent in moon silver. Static violet top gradient≤6% over header/background, no glowing centre ring. Teal focus, silver copy, stock Constantia italic. Squint: moonlit forest/branches, not Legion green or celestial terminal.

## 6. Diablo II — stone and two globes

Delete pentagram/readout/embers and arbitrary pentagon crop. Plate radius2px, iron/stone trim with original three stud marks only in safe outer bands. Header84×20 runic divider of invented short notches, no actual game alphabet/text/logo. Banner22px left **red health orb** (`#8A2028` dark fill, pale warm rim), right22px **blue mana orb** (`#244E91` fill, pale cool rim) in a measured reserved right slot; keep quote between. At narrow widths suppress right orb before text intrusion; never add banner height or hard-coded stat labels. Orbs are decorative, not meters/buttons. Gold legible copy/accent, bone-brown material lightened where actionable. Hellfire `#E8501A` appears as a small decorative hover line only. Item-quality identity: optional static per-tile hover edge choices ivory/blue/gold/green, but all must be3:1 and must not encode functionality or dim label text; default use gold and report any chosen edge variation. Zero fire motion. Squint: gritty D2 stone/iron and red-blue globes, not generic red occult.

## 7. Dragon Age: Origins — bloodied leather and parchment

Remove companion names/wing panno/Archdemon/readout; no cross-game characters. Dark leather panels, parchment text, accessible slate focus. Header84×20 generic straight sword with two abstract wing strokes (original, not Grey Warden/game mark). Banner22px same motif simplified to strong blade/two short wings at true1×; torn-parchment top seam≤7px. One small blood-spatter cluster `#8A2A1A` in an outer corner, ≤8×8px outside hit/label zones; no red full-screen wash. Keep hex **plate**, full glyph. Metamorphous title only; Palatino labels. Fix text-dim/hints/scroll thumb by table mapping, not legacy waiver. Static. Squint: leather/parchment/blood with slate, distinct from Diablo's orbs and Witcher swamp.

## 8. Witcher — swamp notebook and amber eye

Delete alchemy/pentagram/readout/diamonds. Swamp panels and dark leather header with silver-steel edge; dashed stitched-leather pad seam outside field. Header84×20 original amber eye shape with vertical slit, no wolf/game symbol. Banner22px generic notched-ring medallion (six uneven notches), no school medallion logo or animal portrait. Blood `#6A1A1A` one decorative edit seam; accessible edit foreground stays table. Circle **plate**, never circular clip of full app icon. Metamorphous title, Palatino labels. Static. Squint: swamp/leather/amber medallion, not royal heraldry.

## 9. Game of Thrones — steel astrolabe

Delete every coastline/place/map/wall/mountain/compass readout behind tiles. Header84×20 original partial astrolabe: two incomplete arcs and three slender intersecting struts, no house sigil or copied opening prop. Sword-blade teeth≤7px banner top seam; banner22px generic wax seal, plain radial dents without house stamp. Steel panels, gold trim, snow copy, Cinzel700 title. Decorative crimson `#A81C1C` only one edit seam. Preserve shield **plate** silhouette with cuts≤20px and full icon. No fire, rotation or map. Squint: steel/gold mechanism and seal, not WoW Alliance battlements.

## 10. Mortal Kombat — combat frame without dragon logo

Delete coiled dragon roundel and all painted fighter commands behind tiles. Header84×20 original three claw slashes, gold fine strokes, no blood animation. Banner22px plain gold ring, **no dragon silhouette**. Two thin static gold-framed health-bar shapes in reserved banner outer art slots; no numeric status or live meter behavior. Centre quote uses the existing authored banner (including `FINISH HIM!` only when that current array line is selected), no hard-coded text replacing rotation. If bars lack room, reduce decorative bar width then omit bars before stealing quote/icon pixels. Decorative blood `#B01A1A` one edit seam; all status/edit text table-safe. Keep crest-bottom **plate**, no glyph clipping. Stock Bahnschrift Bold caps with tight tracking, not blackletter. Static. Squint: martial gold combat bars/claws, distinct from fantasy heraldry.

## 11. Acceptance, review and delivery

Apply Batch07 §8's actual integration matrix to **ten** themes: all Grid/Fan/Ring directions and near-fit sizes; region empty/populated/filter/edit/rename/hover/pressed/focus/add/remove/update/tooltip/menu/scroll states; Manager selected/unselected/options/skin dropdown/search/hotkey rest/recording/active-only/error/clear/footer/reachable scroll/control states. Removed Settings overlays are invalid. Measure hit rects every reachable state, same-plane intersection0; art/content A/B/C overlap0 and four-pixel keep-out; actual min contrast including brightest art/composited fill and app icons; fonts/tails/title/case/fallback and banner fit. Positive broken colour/overlap/font controls detect failure. All101 F5/Q2/forwarding/shared-layout smoke reads all101 but does not authorize edits outside these ten.

Batch09-specific evidence:

1. Scourge opaque/background-composited text over white/midgrey; no retained50% alpha and no bleed through plate/icon.
2. Ten title-family/weight/style records; Pirata3/Cinzel2/Metamorphous3 loaded with no synthesis; NightElf Constantia and MortalKombat Bahnschrift stock; actual Cyrillic fallback.
3. Full real app glyphs in each faction/radial plate; NightElf lumpy crop removed; all shaped cuts≤20px.
4. Diablo left/right globe and MortalKombat bars reserved slots at narrow/large sizes; quote/icon/controls unobscured; no fake state/meter semantics.
5. DragonAge dim/hint/scrollbar and every functional state clears floor; no legacy gate exemption.
6. True22px1× icon sheet plus title/banner-hidden squint sheet: ice chain, generic shield, tusks, fel ring, crescent, globes, sword/wing, medallion, seal and plain ring distinguish materials; no copied franchise logo.
7. Zero motion/ambient loops; static texture sigma≤current documented completed-batch ceiling (Batch06 reference3.72), measured art bounds, radial omission where required, scrolling-art and fallback regression retained.

Keep unchanged32 static legacy warnings separate from19 inherited expanded diagnostic failures across15 themes. These ten redesigned themes must pass unchanged gate and rendered floors without rebaseline. Completed-batch failures await their own committed Judy spec; do not sweep them here. Headless safe QA does not certify native/packaged/performance behavior. No fresh away window exists: no native input/display/scale/taskbar/sleep/app launch.

Ender reports exact changed paths, per-theme ratios/font edges/motion counts, before/after key-named renders, state/rect/art matrices and pending native coverage. Judy reviews actual visuals, Futaba independently certifies pinned safe scope GO/NO-GO, Sully commits/pushes scoped development only after matching ownership/pins. Version remains1.94.3, no tag/release. Preserve full before/after for Sergei's final original-plan visual review.

## 12. Preparation disposition

No open font/era/product decision: all calls are within original delegated theme-fidelity scope. This document is not implementation or visual acceptance. Batch09 implementation waits for completed Batch08; do not batch or parallelize theme builds.
