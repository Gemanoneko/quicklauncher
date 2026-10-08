# QuickLaunch theme fidelity — Batch 10 UX spec

Judy · 2026-10-08 · **Preparatory spec only. Commit before briefing implementation; Batch10 follows completed Batch09.** No source/theme/asset/font/git/app/native-input changes. Proposed opaque palette arithmetic is reported separately from pending rendered measurements. Publication waits for current fallback QA closure as instructed.

## 0. Approved scope and ownership

This is an **EXTEND** of approved all101 theme fidelity on the integration checkout. Inputs: plan `9719edc`, audit `a659bf9` §§1/6/7, Foundation `75b9f7c` Parts A/B, completed Batch06 `16d89bf`, eleven-font README `4191e24`, committed completion inventory and committed Batch07 integration-state contract. Batch09 is pinned `4621470` and must remain untouched. Preserve original house/source directions; no new era/product decision.

| Exact file under `src/renderer/styles/themes/` | Existing catalogue name (preserve) | Audit art action | Distinctive direction |
|---|---|---|---|
| `hufflepuff.css` | HUFFLEPUFF | redraw | Warm honey/cream, copper and round burrow door |
| `mordor.css` | MORDOR | redraw | Black iron/ash, cracks and gate teeth |
| `hogwarts.css` | HOGWARTS: MARAUDER'S MAP | tone down | Mid-tone map parchment, ink footprints and flap |
| `slytherin.css` | SLYTHERIN: DARK ARTS | tone down | Cold emerald/silver stone, understated serpent |
| `ministry-of-magic.css` | MINISTRY OF MAGIC | redraw | Teal/brass deco, lift grille and folded memo |
| `rivendell.css` | RIVENDELL | tone down | Silver-blue arches, gold leaf and tendrils |
| `ravenclaw.css` | RAVENCLAW | keep | Midnight blue/bronze, sparse stars and crescent window |

Count method: seven directly verified existing CSS files/catalogue keys, three redraw/three tone-down/one keep, matching audit §7. Four Foundation title adoptions: IM Fell English Hogwarts, Metamorphous Mordor, Cinzel600 Slytherin/Ravenclaw. Three other titles stock. Do not edit another batch or common theme catalogue.

Ender owns only these seven CSS files and agreed bounded evidence docs, Judy this spec/visual review, Futaba independent pinned QA, Sully exact commits/pushes. Preserve others' concurrent frozen fallback/QA work. Exclude new controls/surfaces/features, shared renderer/layout rewrite, new font/dependency, other batch or completed-theme palette sweep, hooks/guards/QA-tool repair/permission exception, real input/display/scale/taskbar/sleep/running QuickLauncher/signed-in browser, version/tag/release. STOP/report a missing approval/resource or failure needing shared source changes; ordinary contrast/art-alpha/type fit adjustments stay bounded and return to Judy with exact evidence.

## 0.1 Common chrome and live states

Inherit audit C1/C3–C5/H1–H8, Foundation A/B, Batch06 §0.1–0.2 and **Batch07 §§0.1/0.2/0.3/8 except horror palettes/type/motifs**, replaced here; count seven for this batch. Functional interactions/targets stay Fluent/Windows-native (Jakob), clear/quiet (NN/g), reachable and focus-visible (WCAG/Fitts).

- Zero infinite animations all seven: no ember fade, drift, pulse, sparkle, caustic shimmer, flying memo, title flicker, whole-window shadow/blackout, moving particle/grain/texture or hover sheen. Only existing functional transitions remain. No added blur/will-change; base backdrop blur preserved.
- Delete legacy panno/rosters/ghost text and flavour microtext behind tiles. Grid art belongs to its current scrolling frame background with8px outer bands/four-pixel tile/focus keep-out. No hard figures/rings/glyphs/maps/words/constellation lines under content. Omit layers in Fan/Ring when safe band unavailable. No `#app::after` content-obscuring art, all decoration pointer-events:none.
- Header motif explicit84×20px in inherited right172/top10 slot; hidden below424px/filter/long-title/control collision. Legacy title≤156px; dynamic actual rects govern. Hide art before moving/shrinking controls. Header lines inside40px strip.
- Banner original22px icon and≤7px seam, optional right motif only with measured reserved slot; suppress art before stealing quote width. Preserve current authored arrays/one-line rotation/fit, no invented lore or quote lookup. No product label/name changes.
- All app glyphs complete. Shape plates separately, cuts≤20px; remove diamond clipping for Mordor/Slytherin. Label tail margin3px/no halo/glow; icons not dimmed. Preserve tooltips/F5/menus/form behavior and all reachable rest/hover/pressed/focus/active/filter/rename/error states.

## 0.2 Binding palettes and state mapping

Audited decorative dark inks are retained locally, never assigned to functional text. Surfaces are opaque: Rivendell's legacy55% alpha must not wash its title/tiles into wallpaper. Opacity treatment stays within approved readability; base blur remains unchanged. Declare first real root gate tokens, no duplicate token declarations in leading comments.

| Theme | bg | panel | header/banner | hover | pressed/selected | text | dim/hints | functional accent | border | focus |
|---|---|---|---|---|---|---|---|---|---|---|
| hufflepuff | #1A160C | #2D2413 | #352A16 | #41331A | #4A3B20 | #F0E2B8 | #D4C59E | #FFC500 | #B6985D | #FFC500 |
| mordor | #0A0706 | #1B1918 | #24201D | #312722 | #3B2D25 | #E5D4BD | #C7B8A5 | #EDAB77 | #A69786 | #EDAB77 |
| hogwarts | #241C12 | #33281B | #3B2D1E | #463424 | #503D2A | #EFE4C8 | #D3C5A4 | #E3C675 | #AE9670 | #A9BEDD |
| slytherin | #061410 | #132A20 | #1A3025 | #203D2D | #294935 | #D8E6DC | #BACDBF | #C3D0C6 | #8BA894 | #A4D8BC |
| ministry-of-magic | #0E1512 | #173A30 | #214439 | #3B294B | #443153 | #E8DDC0 | #CAC5AB | #DEC488 | #92AD9C | #D0B3E7 |
| rivendell | #0E1620 | #1B2934 | #25323F | #2C3D4A | #344652 | #E8EEF0 | #C4D4DC | #ABD2E2 | #89A8A6 | #E4C979 |
| ravenclaw | #0B1020 | #0E1A40 | #192644 | #203355 | #293E61 | #D5E0F6 | #B9CAE3 | #D6AD6B | #8F9FBA | #D6AD6B |

Use Batch07 semantic mapping with this table: panel/overlay/rest fields; text body/title/labels/banner/controls/tooltip; dim secondary/version/hints; functional accent for accent-c/accent-text/accent-m/accent-y and visible hotkey/edit/update/selected text; corresponding hover/pressed across tiles/buttons/rename/picker/skin/Manager; border/focus across actionable outlines/drop hints. No functional foreground opacity. Decorative blood/ash/ink/bronze below does not override title-dot/recording/error/status text. Scoped overrides fix literal inherited state colours while leaving behavior/messages unchanged.

Remove/error controls use dark-theme Batch07 opaque `#70222C` fill/`#FFF4F0` glyph across rest/hover/pressed, error text `#F1B5B7`. Prevent inherited OKLCH hover from bypassing that intended fill. Hufflepuff canary is an accent, not a whole background. Ravenclaw bronze is lightened for functional contrast, audited `#946B2D` remains decorative material. Mordor dark ember `#B23A0E` never becomes live text/accent; warm table foreground preserves readability.

Opaque five-surface arithmetic screen: text/accent/dim minimum≥5.14:1, border≥3.62:1, focus≥5.14:1. These calculations exclude rendered art/compositing/icons/inherited CSS and are **not QA results**. Actual text≥4.5:1, functional non-text/focus/action/app icons≥3:1 on every reachable surface. No legacy exemption or rebaseline. Adjust offending art alpha/fill or foreground toward text within original direction; send precise value/pair to Judy for review.

## 0.3 Exact typography

Manager/body/forms stay `'Segoe UI','Yu Gothic',Arial,sans-serif` with established sizes/weights. Title11px line-height1.2, label12px line-height1.2/tail-margin3px, banner11px. All bundled rules explicitly weight/style/font-synthesis:none; display faces title-only.

| Theme | Title / weight / style / starting tracking | Labels / weight / style / tracking | Banner / weight / style / tracking |
|---|---|---|---|
| hufflepuff | `Constantia,Georgia,serif` /400/normal/2px | same /400/normal/.3px as typed | same /400/normal/.3px |
| mordor | `'Metamorphous',Georgia,serif` /400/normal/2px | `Georgia,'Times New Roman',serif` /700/normal/.3px caps | same /400/normal/.3px |
| hogwarts | `'IM Fell English',Constantia,Georgia,serif` /400/**roman**/3px | `Constantia,Georgia,serif` /400/italic/.3px as typed | same /400/italic/.3px |
| slytherin | `'Cinzel','Palatino Linotype',Georgia,serif` /600/normal/3px | `'Palatino Linotype',Georgia,serif` /400/normal/.3px caps | same /400/normal/.3px |
| ministry-of-magic | `Constantia,Georgia,serif` /400/normal/2px | same /400/normal/.3px as typed | same /400/normal/.3px |
| rivendell | `Gabriola,'Palatino Linotype',Georgia,serif` /400/normal/1px | `Constantia,Georgia,serif` /400/italic/.3px as typed | same /400/italic/.3px |
| ravenclaw | `'Cinzel',Constantia,Georgia,serif` /600/normal/3px | `Constantia,Georgia,serif` /400/italic/.3px as typed | same /400/italic/.3px |

No IM Fell italic/synthesized weight; Hogwarts italic banner uses Constantia. Ministry can use real small caps only where font supports it without shrinking text; otherwise current title uppercase at full size, not fake tiny caps. No EB Garamond/Alegreya/Limelight/Poiret/SpecialElite/Uncial font download; no Cormorant opportunistic replacement of Rivendell's Foundation stock decision. Loaded font inventory has11 approved files; four adoptions here use existing exact local families.

Foundation ladder tracking down1px steps to1px→title10px→specified stock fallback, with measured title edges/dynamic-title art suppression. Six standard labels no unintended ellipsis, long user names retain established truncation. Wait fonts ready/report families/weight/style/Cyrillic fallback (particularly Gabriola/display faces), misspelled-family control, descenders/numerals/ЩЦ at1×/1.5×/2× simulated raster without OS change. Existing one-line banner strings/fit preserved; narrow-layout limitations explicitly recorded, not hidden by shrunken text.

## 1. Hufflepuff — warm honey burrow

Remove gothic cup/badger/virtue roster/readouts behind tiles. Keep warm near-earth ground with static honey gradient≤5% inside frame, cream copy and copper/honey trim. Header84×20: original two barrel hoops and small round-door arch; no house crest/badger logo. Two muted black-and-honey stripe bands (original, ≤7px) in header-bottom/banner-top; no black wash through tile content. Banner22px original round-door arc with small off-centre knob, readable as door at1× rather than ring. Barrel plate silhouette allowed if full glyph safe, cut≤20px; normal Constantia labels. Canary accent/focus only, no sparkle. Squint: friendly honey/earth/round door, not grim gold medieval heraldry.

## 2. Mordor — black iron and ash

Remove flame-core rings/panno/ghost/embers and diamond glyph crop. Gate-shaped **plate** (flat top, two shallow side shoulders, bottom straight), full icon. Header84×20 original riveted iron gate with three spike teeth, not eye/tower/movie logo. Header-top seam rivet/spike outline remains inside strip. Outer pad lava-crack zigzag `#B23A0E` at low alpha, no hard crack beneath labels/focus; hover-only tiny lava tick `#F26A1B`, functional state fill remains table. Banner22px original flame outline containing vertical slit, not a recreated film Eye. Static; zero ember fade. Ash surfaces and accessible warm ink replace dirty orange wash. Squint: iron/ash gate with one ember wound, not Diablo red-blue globes.

## 3. Hogwarts — ink map and folded flap

Delete ink footprints/ghost words below tiles, sparkle and irrelevant shield crop. Mid-tone map direction remains approved dark parchment ground with pale parchment lettering; header84×20 holds exactly three original ink footsteps, drawn as heel/oval toe groups, not copied map art. Banner right corner original folded parchment flap inside measured art slot, suppress when narrow; banner22px ink footprint pair. Thin ink `#3A2418` decorative divider stays on pale flap, **not** unreadable border on dark background; functional outlines table-light. Tile radius2px, no shield glyph crop. IM Fell roman title, Constantia italic names/banner. No hardcoded oath or new lore. Squint: aged ink map/fold/footsteps, distinct from honey house and Ministry memo.

## 4. Slytherin — polished cold emerald

Remove corrupted ambition readout/leaf field and animated caustic shimmer. Tile radius4px instead of diamonds; full icon. Header-bottom thin original S-curve serpent line **inside chrome**, no house crest/head logo; header84×20 has one silver serpentine arc with two small stone divisions. Static lake-ripple arcs at5% alpha in **upper outer corners only**, not under title/filter/tile content. Banner22px simplified S-shaped silver stroke with small tapered head, generic serpent not crest. Emerald/silver stone, accessible pale green focus, dark material not bright neon. Cinzel600 title, Palatino caps labels. Squint: cold understated emerald/silver with serpent/water, not Legion green.

## 5. Ministry — teal brass deco

Delete floating memo-triangles, ministry lettering across tile row and level directory. Header84×20 original deco sunburst of seven slender brass rays; decorative only, no official ministry mark. Brass lift-grille vertical lines in safe outer gutters, spaced6px, no crossing grid/focus. Banner22px original folded memo plane with one clear crease, true1× shape reads plane rather than bird. Teal material, brass lines and small memo-red `#8A1F1F` decorative edit tick; functional error/edit text table-safe. Purple hover fill, full-sized Constantia, no faux tiny caps. Keep pentagon **plate** only if complete real icon passes, cuts≤20px; otherwise shallow plate corners. No flying memos. Squint: green/brass civic deco/plane, not Hogwarts parchment or a generic space terminal.

## 6. Rivendell — silver-blue tendrils and gold leaf

Eliminate55% alpha wash; all table surfaces opaque, actual composed text/icon contrast checked against white/midgrey wallpaper reference. Remove readout/central decoration; keep circles as **plates**, full icon. Header84×20 original slender open arch with two swan-neck tendril curves; no arch behind dynamic title/version: artwork remains in dedicated slot and hides when it conflicts. Two upper-pad corner tendrils in safe bands only. Banner22px one original gold leaf with clear central stem, pale-gold focus and silver-blue functional accent. Soft green `#4C6B5A` decorative tendril ink, lightened table border where actionable. Gabriola title/Constantia italic names, no new font. Static, no halo. Squint: graceful silver-blue arch/gold leaf, distinct from dark NightElf antlers.

## 7. Ravenclaw — retain sparse midnight sky

Audit keep: preserve sparse stars/blue circle-plate material, remove readout, drift/border pulse and all constellation segments intruding into tile field. Existing star dots retained only where measured art/content keep-out permits; no constellation under app glyphs. Add bronze through table functional accent plus audited dark bronze decorative edge; no all-blue palette. Header84×20 may use three sparse star dots and thin window mullion (original, minimal), banner22px original crescent-window arch with one small moon. Cinzel600 title is Foundation adoption; Constantia italic labels/banner. Full app icons on circle plates, no clip. Zero motion. Squint: midnight bronze celestial window, preserve restraint rather than new detailed mural.

## 8. Acceptance and delivery

Apply Batch07 §8's live integration state matrix **to these seven**: actual Grid/Fan/Ring directions/near-fit capacities, region empty/populated/filter/edit/rename/hover/pressed/focus/remove/update/menu/tooltip/scroll-to-end, actual Manager rows/options/skin/hotkey rest/recording/active-only/error/clear/footer and selected/unselected/control states. Deleted Settings overlays are invalid. Record actual rect intersections0, art/content A/B/C overlap0 and keep-out, lowest foreground/fill pairs (including brightest texture/compositing/icon), fonts/edges/tails/Cyrillic, one-line banner limits and zero motion. Positive broken contrast/overlap/font controls detect faults. All101 F5/Q2/shared-gallery/scroll/fallback smoke reads all101 without authorizing edits outside these seven.

Batch10 emphasis:

1. Rivendell compositing over white/midgrey, loaded Gabriola/Cyrillic fallback, full circle-plate icons; no55% wash.
2. Mordor/Slytherin diamond cropping removed without moving hit rects; complete glyphs every radial/grid shape.
3. IM Fell roman400 Hogwarts, Metamorphous400 Mordor, Cinzel600 Slytherin/Ravenclaw; no installed substitute/synthesis.
4. Warm Hufflepuff material vs dark map parchment vs cold emerald; motif sheet true22px1× and title/banner-hidden squint ensure distinct identities.
5. Ravenclaw keep treatment preserves sparse material; constellation/star intrusions0, bronze readable, no drift.
6. Ministry grille/sunburst and map flap fit actual title/control/banner rects; art suppression narrow/radial, no control resize/covered label.
7. Static texture sigma≤documented completed-batch ceiling (Batch06 reference3.72), zero loops, correct scrolling-art anchoring and fallback regression retained.

These redesigned themes need unchanged gate and actual floors, no rebaseline/legacy waiver. Keep32 static legacy warnings separate from19 inherited expanded diagnostics; no completed-theme sweep. Ender reports exact paths, per-theme ratios/loaded-family/edges/loops, key-named before/after renders, state/hit/art matrices and native debt. Judy reviews actual visuals, Futaba independent pinned GO/NO-GO for safe scope, Sully exact doc/development commits/pushes. No native/packaged/performance claim from headless mocks; no away window/input/display/sleep authority. Preserve before/after for Sergei; version1.94.3 unchanged and no release/tag.

## 9. Preparation disposition

No open original-scope/font/era decision. This document is not implementation or rendered acceptance. Publish after current fallback QA closes as directed; build Batch10 only after Batch09 completes, sequentially.
