# QuickLaunch theme fidelity — Batch 11 UX spec

Judy · 2026-10-08 · **Preparatory spec only; publish after fallback QA closes and implement sequentially after completed Batch10.** No source/theme/assets/fonts/git/app/input/display changes. Palette values were screened by WCAG sRGB arithmetic; actual rendered-state measurements remain pending.

## 0. Approved scope and ownership

This is an **EXTEND** of the original all101 theme-fidelity direction on integration: plan `9719edc`, audit `a659bf9` §§1/3/6/7, Foundation `75b9f7c` Parts A/B, completed Batch06 `16d89bf`, font README `4191e24` (11 approved local files), committed completion inventory and Batch07 live-state contract. Existing preceding specs remain untouched. **EVE is the approved general capsuleer interface**, no faction/empire choice. Dune follows the audit's austere Villeneuve direction. No new product/era scope.

| Exact CSS file under `src/renderer/styles/themes/` | Existing catalogue name (preserve) | Audit art action | Identity |
|---|---|---|---|
| `blade-runner.css` | BLADE RUNNER | tone down | Amber/cyan noir sign and static diagonal rain |
| `dune.css` | DUNE | tone down | Monumental sand, slab step and sparse contours |
| `firefly.css` | FIREFLY / SERENITY | redraw | Copper/wood salvage, bolts and Western poster |
| `doctor-who.css` | DOCTOR WHO | redraw | Blue sign strips, roundels and quiet vortex |
| `lcars.css` | LCARS | redraw | Flat segmented bars/elbows/pills on black |
| `eve-online.css` | EVE ONLINE | redraw | Neutral thin-panel capsuleer tabs/target brackets |
| `mass-effect.css` | MASS EFFECT | tone down | Holo blue/orange/red, hex strip and relay half-ring |
| `the-expanse.css` | THE EXPANSE | redraw | Worn orange-lit ship, three-faction stripe |

Count method: eight directly checked existing keys/files, five redraw/three tone-down, matching audit §7. Dune alone adopts Foundation bundled Jost300 across title/labels/banner; other seven stock. Do not replace faces with wishlist or other batches' fonts.

Ender owns these eight exact CSS paths plus agreed evidence docs; Judy owns this doc/visual review; Futaba independent pinned QA; Sully alone commits/pushes. Others work here: preserve frozen fallback/QA/other docs. Exclude source/base/layout rewrite, new controls/features/surfaces, downloads/dependencies/fonts, catalogue/banner behavior change, another batch/completed-theme palette sweep, hooks/guards/QA-tool repair/permissions, native input/display/taskbar/scale/sleep/running QuickLauncher/signed-in browser, version/tag/release. STOP/report missing approval/resource or fix needing shared source; routine bounded contrast/art-alpha/type fit returns to Judy with precise evidence.

## 0.1 Common chrome, material and live states

Inherit audit C1/C3–C5/H1–H8, Foundation A/B, Batch06 §0.1–0.2 and Batch07 §§0.1/0.2/0.3/8 **except per-theme palette/type/motifs**, replaced here; eight themes for counts. Familiar Windows utility behavior (Jakob/Fluent), clear/quiet status (NN/g), accessible targets/focus (WCAG/Fitts) stay unchanged.

- Zero infinite animations all eight: no rain scroll, neon flicker, sand/dust/storm, orbit/vortex drift, scan/memo/portal/pulse, whole-app shadow/blackout, moving particles/readout, title/icon flicker or hover sheen. Existing functional transitions remain. No added blur/will-change; preserve base backdrop blur.
- Remove old panno/readout/rosters, clip-corrupted flavour text and any hard geometry under icons/labels. Grid art in existing scrolling frame background,8px outer bands and four-pixel tile/focus keep-out; omit band layers in Fan/Ring without safe space. Nothing content-obscuring in app-after; pointer-events:none for decoration.
- Header84×20 inherited right172/top10 slot, hidden below424px and filter/long-title/control conflicts; legacy title≤156px, actual dynamic rects govern. Art disappears before moving controls. Header seams stay inside40px, never paint over version. Banner22px icon/seam≤7px/measured reserved right motifs; current authored arrays/one-line fit/rotation retained. No hard-coded fake telemetry, invented lore/sign text or quote lookup.
- Uncut app glyphs on separate thematic **plates**; cuts≤20px. Correct BladeRunner/MassEffect window chamfer transparency without changing functional clip/geometry; no white wedge. No label halo, no dark icon filter/glow/pulse/scanline; tail margin3px. Preserve actual controls/tooltips/F5/state routes.

## 0.2 Binding palettes and semantic mapping

Opaque surfaces stabilize actual wallpaper composition while preserving base blur; decorative inks retain audited identity, accessible foregrounds/borders are brighter. Gate declarations in first real root, no duplicate leading-comment token declarations.

| Theme | bg | panel | header/banner | hover | pressed/selected | text | dim/hints | functional accent | border | focus |
|---|---|---|---|---|---|---|---|---|---|---|
| blade-runner | #0A0A10 | #1D1B22 | #25222A | #302A31 | #393039 | #F0E0C0 | #CDBFAB | #EDAE72 | #9C8D80 | #77D2E5 |
| dune | #2A1E10 | #3A2B19 | #41301C | #31424B | #3B4C54 | #EFE1C1 | #D5C7A8 | #E4BE80 | #B19B74 | #F0C982 |
| firefly | #1A1208 | #3A2A1A | #352719 | #443121 | #4E3927 | #E8D8B0 | #CFBFA2 | #E0B374 | #AE9570 | #E0B374 |
| doctor-who | #0A1030 | #152747 | #003B6F | #1A4670 | #22547C | #F0E8D0 | #CCD6E4 | #A9D8F1 | #91B6D4 | #F3C568 |
| lcars | #080808 | #171717 | #202020 | #2B2B2B | #353535 | #F3E7D9 | #D4C3B2 | #FFCC99 | #BC9AAC | #99CCFF |
| eve-online | #0A0C10 | #1A1E24 | #222932 | #2D353E | #353F49 | #E0E4E9 | #BDC9D4 | #FFB06A | #929EA9 | #86CDEC |
| mass-effect | #06101A | #14273B | #193249 | #234158 | #2C4B61 | #F0F4F8 | #C5D4E2 | #88D7F8 | #8FAEC0 | #88D7F8 |
| the-expanse | #0A0E14 | #1A2028 | #242C35 | #2D3742 | #35414D | #E2E4DB | #C0CCCD | #F2B378 | #95A6B5 | #9AC5E5 |

Batch07 semantic mapping applies with this table: panel/overlay/forms; text for title/body/labels/banner/controls/tooltip; dim version/secondary/hints; functional accent for accent-c/accent-text/accent-m/accent-y and edit/update/hotkey/selected copy; hover/pressed across tiles/buttons/rename/picker/skin/Manager; border/focus on actual actionable outlines/drop hints. Functional foregrounds opaque. Decorative red/blue/amber in motifs below never override text title-dot/recording/error/status tokens. State names/messages and interaction remain unchanged.

Remove/error controls Batch07 dark-theme opaque #70222C fill/#FFF4F0 glyph at rest/hover/pressed; error text#F1B5B7. Override inherited OKLCH/literal state foreground if it violates these colours. LCARS functional selected labels are pale on dark state fills; decorative saturated panels are not actionable buttons.

Arithmetic screen across five opaque surfaces: text/accent/dim minimum≥5.10:1, border≥3.33:1, focus≥4.95:1. This excludes art, icons, alpha/compositing and inherited CSS, **not rendered QA**. Actual text≥4.5:1, functional non-text/focus/action/app icons≥3:1, all states including brightest pixels. No gate rebaseline/legacy exemption. Adjust local texture/fill/foreground within direction and send exact new value/pair to Judy.

## 0.3 Typography and fit

Body/Manager/forms retain Segoe UI/Yu Gothic/Arial stack at existing functional sizes/weights. Title11px line-height1.2, labels12px/line-height1.2/no halo/tail-margin3px, banner11px. User names preserve authored casing except established caps themes noted below.

| Theme | Title family / weight / starting tracking | Labels / weight / tracking | Banner / weight / tracking |
|---|---|---|---|
| blade-runner | `Bahnschrift,'Segoe UI',sans-serif` /600/2px normal caps | same /400/.3px caps | same /400/.3px |
| dune | `'Jost','Segoe UI',sans-serif` /300/3px normal caps | same /300/.8px caps | same /300/.8px |
| firefly | `Impact,'Arial Black','Segoe UI',sans-serif` /400/1px normal | `Constantia,Georgia,serif` /400/.3px as typed | same /400/.3px normal |
| doctor-who | `'Segoe UI',Arial,sans-serif` /600/2px normal caps | same /600/.3px caps | same /600/.3px |
| lcars | `Bahnschrift,'Segoe UI',sans-serif` /600/-.2px normal caps | same /600/-.2px caps | same /400/0px |
| eve-online | `Bahnschrift,'Segoe UI',sans-serif` /300/2px normal caps | same /400/.3px caps | same /400/.3px |
| mass-effect | `'Segoe UI',Arial,sans-serif` /350/2px normal caps | same /350/.5px caps | same /400/.3px |
| the-expanse | `Bahnschrift,'Segoe UI',sans-serif` /300/2px normal caps | same /400/.5px caps | same /400/.3px |

Dune Jost300 local exact family on three roles, explicit font-synthesis:none/style normal, Foundation label tracking ladder. Use body controls at readable standard weight, not Jost300 everywhere. No Rye/Sancreek/Antonio/Oswald/Exo/Orbitron/Michroma/Rajdhani/new font; Foundation stock choices remain despite11 approved files for other batches. Literal glyph signs below use stock MS Gothic/Microsoft YaHei, script verified. No fallback to installed non-stock faces.

Foundation title ladder applies to positive tracking: down1px steps to1px→10px→specified stock fallback, legacy edge≤156px and dynamic collision hides art. LCARS negative tracking is intentional approved tight title; measure fit at-.2px then10px if needed, no forced expansion to1px. Standard six labels fit, genuine long names ellipsize; Dune label ladder .5px steps to .3px. Wait local fonts ready, record family/weight/style/Cyrillic, positive misspelled-family fallback, numeral/descender/ЩЦ samples at1×/1.5×/2× simulated raster without OS-scale change. Current banner fit/arrays retained; report narrow limitations rather than shrinking below functional sizes.

## 1. Blade Runner — noir neon and rain

Keep amber/cyan noir, remove ghost slogans/rain animation and sepia serif template. Header84×20 original static neon sign strip with MS Gothic katakana `カナ` (generic syllables, no existing brand),10px minimum, amber letters and cyan rule inside header; no invented company/lore. Static diagonal fine-line rain texture4% alpha only, brightest content pixel measured; no moving full-window background. Banner22px original angular rain-streak sign bracket/one amber light, no movie logo. Keep chamfered window/plate if glyph safe; inspect corner against transparent/black/white background and remove white wedge via theme decoration only. No flicker. Squint: amber/cyan sign-in-rain, distinct from warm Firefly wood.

## 2. Dune — austere sand monument

Remove maker-hook/Litany/readout/sandstorm and diamond clipping. Plate radius2px with full icon. Header84×20 original stepped monolith slab (two broad vertical masses, no logo/text), sand text/Jost300 wide tracking. Banner top≤7px three fine dune contour curves,22px original crescent icon. Fremen blue in hover **fill** (table desaturated blue slate), not title/label colour; spice focus. No ornate borders, glowing dunes or dust. Squint: spare monumental sand/slab, not gilt fantasy heraldry.

## 3. Firefly — salvage Western

Remove cargo-manifest/readout and arbitrary octagon crop. Radius4px plates, full glyph. Warm wood/copper panels, original rivet row/bolted corner in safe outer pad. Header84×20 generic `福` sign in Microsoft YaHei,14px glyph with one rust frame edge, stock family/script confirmed; no ship logo. Banner wanted-poster border: original thin uneven ruled edge in7px seam, no fake bounty text. Banner22px salvage bolt/wing silhouette (original, generic),1× recognition checked. Impact title/Constantia names, decorative red#B83A2A one edit seam, functional text table-safe. Static. Squint: copper/wood/sign/bolts, not terminal space UI.

## 4. Doctor Who — blue strip and roundels

Delete orbit/Gallifreyan rings/readout from tile field. Header/banner blue#003B6F surfaces with pale readable copy. Header84×20 original three small white roundel discs; pad corner discs only safe outer zones, no disc under app glyph. Banner22px generic sign rectangle with two window panes (no BBC/TARDIS exact sign wording/logo). Thin white-bordered sign-frame line inside banner seam; no extra hardcoded phrase. Vortex texture soft5% blue gradient, brightest pixel measured; circle **plates**, full app icons. Amber focus, blue hover state. Zero drift. Squint: blue sign/roundel room, not a generic navy space console.

## 5. LCARS — flat elbows without covering version

Delete cropped colour fragments/ghost shields/warp text and stripes behind bottom tiles. Original flat palette decoration: #FF9900/#CC99CC/#9999CC/#FFCC99/#CC6666/#99CCFF on black. Left segmented rail in safe outer band, top-left/bottom-left elbows join fine header/banner seam, never content or title/version. **Measured title clearance≥8px**: constrain elbow painted right edge≤actual title.left-8px; at the inherited12px title start this allows x≤4px, so use a4px rail/elbow near title, widen only below title in the outer band. If even this cannot remain safe, suppress that local elbow, not move title/control hit rects. Art need not consume historical16px pad.

Header84×20 three horizontal rounded segment bars, no fake telemetry. Banner22px original elbow outline. Existing pill **plates**, full glyphs; labels flat readable table ink, no glow. Decorative bright segments are not buttons and never under text; actual buttons retain dark state fills. Bahnschrift600 tight tracking. Zero animation. Squint: recognizable flat segmented elbows/pills, with version line fully visible and no colour chip masking it.

## 6. EVE Online — general capsuleer interface

Remove Caldari-specific blue wash/orbit/node/readout and arbitrary octagon crop. Neutral charcoal plates square, full glyphs. Header84×20 thin original window-tab strip (three empty tabs, no fabricated system labels); banner22px generic capsule outline (elongated oval with one seam). Hover/focus four small orange corner brackets **within plate decorative safe edges**, no neighbour/label/focus overlap. Blue used only focus/link accent; functional live text table-neutral. Do not add charts/telemetry or shrink controls to90% microtext;12px functional labels maintain readability. Static. Squint: neutral overview tabs/orange brackets/capsule, no single empire crest.

## 7. Mass Effect — holo panel and omni-tool accent

Remove centre orbit/relay/readout and title-obscuring grey/red blocks. Preserve chamfered window/shield-tip **plates** with full icons and transparent corner free of white wedge. Header84×20 original small hex-cell strip, no title-logo. Banner22px thin half-ring with one gap; generic three-segment diagonal stripe kept inside seam/icon decoration, no N7 mark/text. Holo blue foreground, orange#E8781A small hover-only decorative edge (not unreadable functional fill), red#C8102E one edit seam/header tick. Segoe Semilight caps/wide measured tracking. Opaque surfaces, no dark filter. Zero motion. Squint: holo blue/hex/half-ring with restrained red/orange, not EVE neutral tabs.

## 8. The Expanse — worn cockpit and faction code

Delete giant gate rings/corrupted list/scan. Header bottom3px stripe blue#4A90C8/red#A83A2A/orange#E8781A inside chrome, three equal original bands, no faction logo. Header84×20 short worn-panel seams and one amber pilot light, no fake data. Banner22px original X inside circle, not show logo; short static delta-V-like bars in measured right motif slot (no numerals/readout; omit narrow). One diagonal torch-trail line in outer frame corner only. Functional orange brightened table accent, blue focus, neutral worn charcoal. Radius4px plates full icons, Bahnschrift Light title/tight body. Static. Squint: practical worn orange cockpit/faction strip, not glowing clean MassEffect panel.

## 9. Acceptance, evidence and delivery

Apply Batch07 §8 actual integrated matrix **for these eight**: Grid/Fan/Ring directions/near-fit capacities and all region states (empty/populated/filter/edit/rename/remove/hover/pressed/focus/menus/tooltip/update/scroll), actual Manager selected/unselected/options/skin/hotkey recording/active-only/error/clear/form/control/footer/scroll states. Deleted Settings overlays invalid. Measure same-plane hit rect intersections0, art/content A/B/C overlap0 and keep-out; actual contrast floor text4.5/non-text3 including brightest art/composited fills/icons; local loaded fonts/title/labels/tails/Cyrillic/banner; zero loops and texture sigma≤documented prior ceiling (Batch06 reference3.72). Positive broken colour/overlap/font controls fail. All101 F5/Q2/shared-forwarding/scroll/fallback smoke reads all101 but edits only these eight.

Batch11 evidence emphasis:

1. LCARS actual elbow/title≥8px/version/control clearance, segmented rails in all layouts/scroll states, no hidden colour fragment over content.
2. BladeRunner/MassEffect window corners over black/white/transparent references; no white wedge, full shaped app icons, native shaping explicitly pending.
3. Dune local Jost300 on three roles/no synthesis, wide tracking ladders, complete icons without diamonds.
4. MS Gothicカナ/Microsoft YaHei福 glyph/font evidence; no missing boxes or installed non-stock proxy.
5. EVE brackets and all icon/labels/focus under pressed/hover/active states remain readable; no tiny labels justified by franchise density.
6. True22px1× original icon sheet/title-banner-hidden squint sheet and differentiated materials: neon noir, sand slab, salvage Western, blue roundels, flat elbows, capsule overview, holo hex, worn cockpit.

Separate32 inherited static warnings from19 expanded inherited diagnostic failures; no completed-theme palette sweep or legacy waiver for these eight. Ender reports exact paths/per-theme lowest pairs/fonts/edges/loops, key-named before/after, state/rect/art matrices and pending native debt. Judy reviews actual visuals; Futaba independent pinned GO/NO-GO safe scope; Sully exact doc/development commit/push. Headless QA does not certify packaged/native/performance clearance. No timed away window/input/display/sleep authority. Preserve before/after for Sergei, version1.94.3 unchanged/no release/tag.

## 10. Preparation disposition

No open font/era/product choice. This is not implementation/rendered acceptance. Publish after fallback QA, implement after Batch10 sequentially; earlier specs/frozen QA work remain untouched.
