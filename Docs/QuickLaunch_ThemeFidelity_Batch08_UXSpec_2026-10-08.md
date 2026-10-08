# QuickLaunch theme fidelity — Batch 08 UX spec

Judy · 2026-10-08 · **Ready for scoped implementation once committed and Batch07 is complete.** Preparatory spec only: no source/theme changes, generated assets, downloaded fonts, app launches, tests, native input or display changes. Proposed opaque palettes were screened by WCAG sRGB arithmetic; rendered measurements and visual acceptance remain pending.

## 0. Authority and exact scope

This is an **EXTEND** of the approved audit/Foundation into the live integration checkout, following Batch07. Authoritative inputs: Theme Fidelity plan `9719edc` (all101, sequential batches), audit `a659bf9` §§1/6/7, Foundation `75b9f7c` Parts A/B, approved Batch06 format `16d89bf`, bundled-font README `4191e24`, and completion inventory `8cc8517`. Batch07's common live-architecture/acceptance clauses apply as referenced below; its document must be committed before an implementation brief cites it.

| Exact file under `src/renderer/styles/themes/` | Existing catalogue name (preserve) | Audit art action | Identity |
|---|---|---|---|
| `life-is-strange.css` | LIFE IS STRANGE | redraw | Raspberry/turquoise sketchbook, polaroid and butterfly |
| `the-sandman.css` | THE SANDMAN | redraw | Indigo Dream, pale strip, sand and original crescent helm |
| `indiana-jones.css` | INDIANA JONES | tone down | Mid-tone leather, parchment, pulp route and fedora |
| `tomb-raider.css` | TOMB RAIDER | redraw | Cool ruin/jungle stone with limited torch warmth |
| `uncharted.css` | UNCHARTED | tone down | Sunlit travel journal, tan tape and coffee ring |
| `broken-sword.css` | BROKEN SWORD | tone down | Warm illustrated Paris manuscript, gold/vine/red initial |
| `twin-peaks.css` | TWIN PEAKS | redraw | Red curtain, timber, zigzag floor and fir/owl |
| `x-files.css` | X-FILES | redraw | Cold case file, manila folder, flashlight and UFO |

Count method: eight listed keys/files, five redraw and three tone down, matching audit §7; no keep entry. Exact filenames and catalogue strings were directly read. Tomb Raider alone adopts a bundled font from Foundation's Batch08 map; the other seven keep approved stock typography. Original all101 scope includes later Batch14; this spec covers only these eight.

Ender owns the eight exact CSS files plus separately agreed bounded evidence docs. Judy owns this document/visual review; Futaba independently verifies pinned source; Sully alone commits/pushes. Other agents work here: preserve their files. Implementation remains sequential, after fallback and Batch07 acceptance; preparation is not authority to implement in parallel.

Exclusions: no new control/surface/feature, shared layout/renderer/catalogue change, font download/dependency change, another batch, inherited completed-batch palette sweep, QA-tool or global-hook/guard repair, policy exception, native input, display/taskbar/scale change, sleep, running QuickLauncher, signed-in browser, version/tag/release. If an approved font/motif direction is missing or a required fix needs shared geometry, STOP and report exact evidence. Routine bounded readability changes stay within the table/approved direction and return to Judy with their measured pair.

## 0.1 Shared chrome, state and motion requirements

Inherit audit C1/C3–C5/H1–H8, Foundation A/B, Batch06 §0.1–0.2 and Batch07 §§0.1/0.2/0.3/8 **except the palette and per-theme type table**, which this document replaces. Batch07's seven-theme count is replaced by eight. Its horror-only palettes/motifs do not carry over. The eleven-file font README supersedes the Foundation's historical seven-file inventory; approval of Cormorant Garamond for a prior batch does not change the Sandman Foundation adoption decision.

Functional interaction and layout remain Windows utility patterns (Jakob/Fluent), reachable focus/targets follow WCAG/Fitts, and quiet frame identity follows NN/g minimalist design/recognition. No theme-specific hit targets, navigation or tooltip wording changes.

- **Zero infinite animations per theme:** delete legacy ghost readouts/pannos, whole-window shadow/blackout, title flicker, icon pulse, moving textures, rewind ripple, dust, torch/fog loops and animated sheen. Retain only established functional transitions. Preserve base backdrop blur; add no blur, will-change or ambient motion.
- Grid art lives in the existing scrolling frame background. No fixed content-covering layer, glyph/text/schematic/ring/figure inside tile/focus keep-out. Use inherited8px outer bands and four-pixel content keep-out. In Fan/Ring omit a band layer wherever the live shape leaves no safe art space. No `#app::after` content-obscuring art.
- Header art explicitly84×20px, inherited right172/top10 placement where applicable, hidden below424px and during filter/long-title/control conflicts; legacy title edge≤156px. Dynamic regions require actual title/control rect clearance; suppress decoration before any collision, never shrink/reposition functional controls.
- Banner uses current22×22px left icon slot and ≤7px top seam, existing one-line fit/rotation and current authored banner arrays. Decorative right motifs require measured reserved space and are suppressed when unavailable. No new attributed quotes/lore lookup or copy rewrite to defeat font fitting.
- Icons remain uncut. Plate shapes may evoke themes but must preserve complete app glyphs; cut ceiling20px, safe pixel evidence mandatory. Labels have no shadows/glow; tail clipping margin3px; body/Manager type is Segoe UI at existing functional sizes.
- Noninteractive art uses pointer-events:none. Tooltip, F5, filter, menu, rename, hotkey, disabled/error, rest/hover/pressed/active and scroll behavior stays visible. Theme selectors can override wrong inherited colours but cannot replace control behavior.

## 0.2 Binding starting palettes and semantic mapping

The audit's muted/decorative inks are identity colours, not permission for dim live text. All listed surfaces/foregrounds are opaque hex. Use first real `:root` declarations for gate tokens; do not duplicate them in preceding comments.

| Theme | bg | panel | header | hover | pressed/selected | text | dim/hints | functional accent | border | focus |
|---|---|---|---|---|---|---|---|---|---|---|
| life-is-strange | #14121A | #211D2A | #292231 | #33293D | #3B3045 | #F0E8E0 | #C4B8C7 | #F08CAF | #9D859E | #70C7D7 |
| the-sandman | #0A0812 | #21182F | #292039 | #352844 | #3E304D | #E1D5F0 | #C5B3DC | #E6BD73 | #9B88B6 | #D2B4E8 |
| indiana-jones | #2A1C10 | #362719 | #352314 | #423022 | #4B3628 | #F3E3BD | #D8C49E | #F1CC85 | #B3956D | #F1CC85 |
| tomb-raider | #14120E | #2A2418 | #24221B | #353222 | #403B2A | #EADDBB | #CBC4A8 | #D4B46A | #95A17D | #BBCDA0 |
| uncharted | #2A1E14 | #37291D | #392B1F | #463425 | #4F3C2A | #F0E3C0 | #D8C5A6 | #E8B56F | #B4936D | #84C5C0 |
| broken-sword | #1A1410 | #282018 | #2D2319 | #382B20 | #423224 | #E8D8B0 | #CABCA0 | #DDB766 | #A58E68 | #91B7D6 |
| twin-peaks | #0C0A08 | #2A2018 | #631719 | #35271F | #403025 | #E8DCC0 | #CBBCA2 | #D9B363 | #A48B6B | #94BAA4 |
| x-files | #06090C | #172128 | #1B2930 | #25363D | #2D4047 | #D8E0E4 | #B6C7CD | #79C4CF | #7D9DA8 | #E8D8A8 |

Apply Batch07 semantic mapping with this table: panel is also overlay/form rest; text for functional body/title/labels/control/tooltip, dim for secondary/version/hint, accent for `--accent-c`, `--accent-text`, `--accent-m`, `--accent-y` and readable active/edit/update text; border/focus for actual outlines; hover and pressed map across all tile/button/picker/skin/rename/Manager/hotkey states. No foreground opacity. All functional state names are unchanged. Literal inherited bright/dim colours need scoped correction in actual selectors, not a proxy palette-only pass.

Banner exceptions (binding; text/icon switched together):

| Theme | Banner surface | Banner text/icon/seam functional ink |
|---|---|---|
| the-sandman | #E8E4F0 | #282032 |
| indiana-jones | #EAD8A8 | #392A1C |
| twin-peaks | #631719, static flute stops no brighter than #7A2224 | #E8DCC0 |
| other five | header surface | text / functional accent |

For Sandman/Indiana pale strips, never inherit the light text/accent from dark chrome. Decorative ink fills such as crimson/ultramarine/torch stay in the scoped art below, not `--accent-m` that also drives title dots/hotkey/status. Remove/error control colours follow Batch07's dark-theme opaque `#70222C` fill, `#FFF4F0` glyph across rest/hover/pressed; error text `#F1B5B7`. Do not let inherited OKLCH hover bypass that fill. Real errors retain their messages, icon/text as well as colour.

Proposed text/accent/dim minimums across five opaque table surfaces screened ≥5.36:1; proposed border minimum≥3.65:1 and focus≥5.33:1. These arithmetic minima **exclude artwork, banner exceptions, app icons, actual alpha/CSS and rendered states** and are not QA results. Actual text≥4.5:1 and actionable non-text/focus/icon≥3:1 remain binding. If glare/texture changes the worst pixel, remove art under content or adjust its alpha/foreground within direction and return the exact value to Judy. No legacy exemption or gate rebaseline for these eight.

## 0.3 Type contract

Every body/Manager form uses `'Segoe UI', 'Yu Gothic', Arial, sans-serif` at established sizes/weights. Theme display faces never style control/status body text. All titles start11px, line-height1.2; label12px, line-height1.2, normal numeral styles, no halo; banner11px except stated. User labels remain as typed unless an explicit current approved style below says otherwise.

| Theme | Title family / weight / style / tracking | Label family / style / tracking | Banner family / style / tracking |
|---|---|---|---|
| life-is-strange | `'Ink Free','Segoe UI',sans-serif` /400/normal/1px, sentence case | same /normal/.3px | same /normal/.3px |
| the-sandman | `'Palatino Linotype',Georgia,serif` /400/italic/2px | same /italic/.3px | same /italic/.3px |
| indiana-jones | `'Palatino Linotype',Georgia,serif` /700/normal/2px | `'Courier New',Consolas,monospace` /normal/.3px | same /normal/.3px |
| tomb-raider | `'Cinzel','Palatino Linotype',Georgia,serif` /700/normal/3px | `'Palatino Linotype',Georgia,serif` /normal/.3px | same /normal/.3px |
| uncharted | `'Palatino Linotype',Georgia,serif` /700/normal/2px | `'Ink Free','Segoe UI',sans-serif` /normal/.3px | same /normal/.3px |
| broken-sword | `Gabriola,'Palatino Linotype',Georgia,serif` /400/normal/1px | `Georgia,'Times New Roman',serif` /italic/.3px | same /italic/.3px |
| twin-peaks | `Bahnschrift,'Segoe UI',sans-serif` /600/normal/2px | `'Segoe UI',Arial,sans-serif` /400 normal/.3px | same /400 normal/.3px |
| x-files | `'Segoe UI',Arial,sans-serif` /300/normal/2px, uppercase | `'Courier New',Consolas,monospace` /normal/.3px | same /normal/.3px |

Tomb Raider uses existing bundled Cinzel700 only on title: explicit weight/style, font-synthesis:none, local face. No additional fonts: Sandman keeps Palatino, not wishlist Cormorant; Life Is Strange/Uncharted keep Ink Free, not Caveat/Kalam; Twin Peaks keeps Bahnschrift, not Bebas/Oswald; no Special Elite/Rye. Tiny lettering/small caps must not reduce actual title box height. Life Is Strange sentence-case display is CSS text-transform:capitalize on existing title, not a catalogue rename; user labels are as typed.

Apply Foundation title ladder (tracking down1px steps to1px, then10px, then specified stock fallback); record actual right edges and dynamic-region collision hiding. Standard six labels fit; long user names alone may ellipsize. Palatino/Georgia/Courier cover Cyrillic; Ink Free/Gabriola samples require loaded-family evidence and fallback to stock Segoe UI/Palatino when the script is absent. Wait document.fonts.ready, record weights/families, deliberate misspelled-family fallback, test descenders/Cyrillic/numerals at1×/1.5×/2× simulated raster without OS-scale change. Existing banner arrays/one-line fit remain; no shrinking below functional size to defeat a fit failure.

## 1. Life Is Strange — sketchbook and polaroid

Delete sepia panno, central butterfly diagram and corrupted Max ghost text. Raspberry/turquoise dominate chromatic accents; one decorative sunny mark `#F0C848` in banner only. Original hand-drawn butterfly22px icon, two uneven wings/body at true1×, no game-logo tracing. Header84×20: two loose pen loops and tiny polaroid corner; title underline is a bounded low-amplitude scribble **inside title's own bottom decoration area**, not a stroke through version/filter/buttons.

Tile hover/focus polaroid treatment is a static white6px plate-frame rotated1° **behind** the untouched icon/label. Confine to plate box without shifting layout or covering a neighbour/focus ring; art/content pixel overlap must be zero. If6px cannot fit an actual radial plate without cropping/overlap, suppress polaroid art there and retain the existing focus ring/raspberry border; do not redesign radial geometry. Plate radius4px. No rewind effect. Squint: handwritten raspberry/turquoise photo journal, not another parchment adventure.

## 2. The Sandman — Dream collage in bounded chrome

Remove Endless-name ghost list/missing glyphs and faded star template. Indigo material becomes dark purple panels; audited `#4A3A8A` indigo is a small decorative header insert, not a bright active fill. Original thin tall-spiked crescent-helm outline84×20 in header, evoking shape language without copying a show prop. Two static dotted sand columns in outer corners only, max5% alpha inside safe bands. Pale `#E8E4F0` banner uses dark ink with original crescent22px icon and one small sand-gold edge tick. Delirium pink `#8A2A4A` is a single decorative edit seam; actual editing/status copy stays accessible table colour. Keep circle **plate**, never circular crop of the app glyph. Static. Squint: indigo dream/white crescent/sand collage, not a navy space console.

## 3. Indiana Jones — leather pulp serial

Keep warm leather direction but brighten material to table mid-tone, not nearly black museum gold. Remove central compass/X/dotted route and torch/dust loops. Header bottom carries a dashed1px route line inside chrome; one decorative red `#C84A1A` X at its end in the84×20 art box. No invented map labels. Banner pale parchment `#EAD8A8` with dark ink, original simple fedora22px silhouette, stitched leather dashed outline contained in seam/edge. Header art can add two small stitched stitches, not a second large compass. Plate radius2px, complete glyph. Courier tile names, bold Palatino title. Squint: warm leather/pulp/fedora with bright parchment, distinct from Uncharted's sunlit scrapbook.

## 4. Tomb Raider — cool ruin with warm torch

Delete carved doorway/sign, expedition log, centre glyphs and ghost line. Preserve shield **plate** and full icon. Header84×20: original carved-glyph relief (no real script/logotype) at max5% alpha, six simple notches on a cool grey-green stone strip. Dashed map path lives in outer gutter, no line crossing labels/focus. Banner22px icon: two original crossed ice-axe silhouettes, short shafts/hooks, inspect first1× reading (axes, not swords). Torch `#C8602A` appears only as small decorative hover edge/tick; functional hover fill and text use table so dim red/orange does not become the label/icon foreground. Gold relic accent, green-grey accessible border and pale green focus; no yellow wash. Static. Squint: cool jungle/stone relief with a tiny warm tool accent, not Indiana's leather route.

## 5. Uncharted — sunlit journal

Retain warm mid-tone journal, remove dim central compass/X/map fragment and ghost slogans. Four static tan tape corners at the **window frame** within safe strips; original diagonal edges not laid over header controls or tiles. Banner top torn-paper seam≤7px; coffee-ring arc only in a measured right-art slot and omitted at narrow sizes, never beneath quote text. Banner22px small compass: dominant four points plus needle, no replicated game mark. Ochre/sunlit cream with jungle-teal focus; no occult/gothic serif on user labels. Ink Free labels/banner with recorded script fallback. Radius2px plates, complete icons. Static. Squint: taped sunlit travel notebook, not a dark antiquities display.

## 6. Broken Sword — illustrated manuscript Paris

Retain sepia/gilt direction, remove codex behind tiles and character bios. Header84×20 original vine scroll: two curled leaves and one small red `#A02A2A` leaf, not heraldic logo. Gold-leaf line in outer pad only. Banner22px original illuminated `B` (Gabriola/stock glyph plus custom generic flourish), decorative red with parchment high-contrast trim so the glyph is clear; no copied title initial. Header title Gabriola, tile names Georgia italic. Ultramarine identity becomes accessible pale-blue focus `#91B7D6`; audited dark `#2A4A6A` survives only in nonfunctional decorative inset. Plate radius4px rather than arbitrary clipped octagon; uncut icons. Static. Squint: warm illustrated vine/initial with blue accent, not occult book or expedition compass.

## 7. Twin Peaks — curtain and timber, fix title

Delete barely visible red frame, ghost text and theme-specific tiny/raised title behavior. **Title is explicit11px Bahnschrift600 normal at the standard header baseline**, line-height1.2, zero transform/top/vertical-align displacement; version remains separate. Record title/version bounds and compare to adjacent themes, with no overlap at1×/1.5×/2× simulated raster.

Header/banner use static red curtain flute gradient with stops between `#631719` and `#7A2224`; keep text≥4.5 on brightest stop. Timber panels, cream copy, diner-gold accents; focus fir green lightened to table accessibility. Header84×20 original fir tree-line; banner22px original owl face/body outline, recognizable at1×. Audit's10px zigzag floor strip is bounded **bottom-banner decoration**, not the7px top seam: use a reserved bottom10px band only if existing banner height leaves zero text/icon overlap; otherwise render the same zigzag at6px in top seam. This adapts the approved motif to live chrome without adding height or covering content. Plate radius2px. Static. Squint: curtain/floor/owls and warm timber, not generic black-red horror.

## 8. X-Files — cold case folder

Delete typed case-file corruption, diagonal CLASSIFIED stamp behind tiles and moving scanlines. Use opaque bg to eliminate wallpaper-dependent contrast. Header84×20: original manila folder tab and fine case-divider edge, **inside the art box** rather than behind dynamic title/buttons. Banner22px UFO disc: flat elliptical saucer with simple dome/two tiny windows, no franchise logo. One decorative red `#A82A1A` rectangular stamp outline in banner's measured right slot only; no words, omit if slot lacks room. Static6% soft flashlight cone from safe pad corner with no hard edge over app labels; check brightest pixel and reduce/remove on failure. Courier names/banner, Segoe UI Light caps title. Square plates, no icon filter/scan band. Squint: cold folder/flashlight/saucer, not terminal-green Alien.

## 9. Implementation, independent QA and visual review

Use Batch07 §8's live integration acceptance matrix **for these eight**: actual Grid/Fan/Ring directions/capacities, all region states/controls, Manager selected/unselected/options/skin/hotkey active-only/error/clear/rest/hover/pressed/focus, filter, rename, menus/tooltips/update, empty/populated/scroll-to-end, title/font/tail/icon/art/hit-rect/contrast probes, deliberate broken controls and all101 F5/Q2/forwarding invariants. Obsolete deleted Settings overlays are invalid targets. No shared all101 theme edit; inherited19 diagnostics and32 static legacy warnings are separate debt, not exemptions.

Additional Batch08 focus:

1. Pale Sandman/Indiana banner text/icon ratios on actual surfaces and every quote; no bright-on-bright inherited accent.
2. Twin Peaks true title/font/baseline and brightest curtain-stop contrast; zigzag art/content overlap0.
3. Life Is Strange's rotated polaroid plate frame: neighbour/control/focus/content overlap0; no hit rect change in radial layouts.
4. Serif/script title/label fit and actual Cyrillic fallback; Gabriola line box/descenders; Cinzel700 declared/loaded title only; no unapproved installed face.
5. Tomb Raider ice axes, butterfly, crescent, fedora, compass, illuminated initial, owl and UFO at true22px1×, plus title/banner-hidden squint sheet. Each theme distinct without text reliance.
6. Texture luminance/brightest pixel over actual fills; zero motion; no growing art or focus intrusion when Grid scrolls and display fallback renders Grid.

Ender delivers exact scoped files, before/after key-named captures, per-theme lowest ratios, loaded faces/edges, state and rect matrices, motion counts, art A/B/C results and pending native checks. Futaba independently certifies the pinned safe scope with GO/NO-GO; Judy reviews actual visuals/measurements. No native/packaged/performance acceptance claim from a headless mock. Preserve final before/after for Sergei. Sully commits/pushes scoped development only, version1.94.3 unchanged; no release/tag/version authority.

## 10. Preparation disposition

No open font/era/product decision for these eight. All design calls fall within Sergei's original delegated theme-fidelity approval. This document is not an implementation or visual acceptance report. Complete bounded Batch07 first; later work stays sequential.
