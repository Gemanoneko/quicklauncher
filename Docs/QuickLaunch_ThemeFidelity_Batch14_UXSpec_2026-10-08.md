# QuickLaunch theme fidelity — Batch 14 UX spec

Judy · 2026-10-08 · **Final original-scope preparatory batch, not implementation or acceptance. Publish after fallback QA; implement sequentially after completed Batch13.** No source/theme/assets/fonts/git/app/native-input/display changes. Proposed palettes arithmetically screened; actual renderer/state/visual evidence pending.

## 0. All101 authority, exact scope and ownership

This is an **EXTEND** of original approved all101 theme fidelity, not an added feature. Plan `9719edc` explicitly all101 plus current feature-complete-original-spec instruction/committed completion inventory govern over older handoff omission of Batch14. Audit `a659bf9` §7 lists these six; Foundation `75b9f7c` Parts A/B, completed Batch06 `16d89bf`,11-font README `4191e24`, committed Batch07 live-state contract govern. No new era/product choice. Previous specs/source/frozen QA untouched.

| Exact CSS path under `src/renderer/styles/themes/` | Existing catalogue name (preserve) | Audit action | Identity |
|---|---|---|---|
| `tron.css` | TRON | tone down | Crisp aquamarine/orange circuits and disc |
| `ghost-shell.css` | GHOST IN THE SHELL | tone down | Teal glass/wireframe and purple hover |
| `evangelion.css` | EVANGELION | tone down | Stark black/white, heavy serif and alert orange |
| `deus-ex.css` | DEUS EX | keep | Precise black/gold honeycomb/arc |
| `mirrors-edge.css` | MIRROR'S EDGE | tone down | Clean white/red plane/blue focus |
| `portal.css` | PORTAL | keep | White testing panels/orange-blue ovals/pictogram |

Count method: six directly verified existing files/catalogue keys, **zero redraw/four tone-down/two keep**, matching audit. Portal Jost400 title/labels/banner is sole bundled adoption; five other stock. All101 total original membership41 completed-batch keys+60 remaining keys across7–14; counts from inventory/audit exact lists, not inferred screenshots.

Ender owns only these six CSS files/agreed evidence docs, Judy this spec/visual review, Futaba independent pinned QA, Sully exact commit/push. Preserve concurrent fallback/QA/earlier docs. Exclude shared source/layout rewrite, new controls/features/surfaces, dependencies/fonts/downloads, catalogue/banner behavior changes, other batch/completed-theme palette sweep, hooks/guards/QA-tool repair/permissions, native input/display/taskbar/scale/sleep/running QuickLauncher/signed-in browser, version/tag/release. STOP/report resource/approval gap or required shared-source fix; bounded readability/art-alpha/type fit adjustments return precise pair/value to Judy.

## 0.1 Quiet chrome and live-state contract

Inherit audit C1/C3–C5/H1–H8, Foundation A/B, Batch06 §0.1–0.2, Batch07 §§0.1/0.2/0.3/8 **except per-theme palettes/type/motifs**, replaced here; six themes/counts. No Matrix rain exception in this batch. Windows utility navigation/targets stay familiar (Jakob/Fluent), status clear/quiet (NN/g), accessible hit/focus behavior (WCAG/Fitts).

- Zero infinite animations all six. No slow rule glow, shadow/blackout, readout/ghost/particle/scanline/sweep/pulse, title flicker, shimmer/wisps or background motion. Existing functional transitions only. No added blur/will-change; original base backdrop blur remains.
- Remove panno/readout/rosters/centre grids/diamonds/runner names behind tiles; frame in existing scrolling Grid background8px outer bands/four-pixel tile/focus keep-out. No hard lines/glyphs/rings/words behind icons/labels. Omit layers in radial layouts lacking safe band. App-after no content-obscuring art; pointer-events:none for all decoration.
- Header84×20 inherited right172/top10 slot, hide below424px/filter/long-title/control conflict; legacy title≤156px, dynamic actual rects govern. Art hides before controls move/shrink. Seams inside40px header, no overlay on version. Banner22px icon/≤7px seam/measured reserved motifs/current authored arrays/one-line fit preserved. No fake telemetry/logo or quote lookup.
- Full app glyphs on separate thematic **plates**, cuts≤20px; remove label/icon halo/smudges/glow, dark filters only if actual light-theme icon analysis requires bounded conservative treatment and Judy verifies. No per-icon palette restyling or texture over apps. Tail margin3px; actual F5/menu/tooltip/hotkey/rename/control/state behavior/messages unchanged.
- DeusEx/GhostShell chamfered corners must remain transparent/nonwhite in theme decoration; no white wedge. No changes to native shaping/renderer geometry authorized by this spec.

## 0.2 Binding palettes and light-theme exceptions

Opaque surfaces stabilize wallpaper composition, especially legacy55% GhostShell wash; no base blur removal. Original saturated inks decorative, functional floors govern. First real root gate declarations/no duplicated comment tokens.

| Theme | bg | panel | header/banner | hover | pressed/selected | text | dim/hints | functional accent | border | focus |
|---|---|---|---|---|---|---|---|---|---|---|
| tron | #000A14 | #0A243B | #112C43 | #183A50 | #22475C | #E8FAFF | #C0D9E3 | #91DDF2 | #8EAEBE | #F4CE7D |
| ghost-shell | #06121A | #1A2A3A | #203440 | #2B2944 | #36304F | #C5ECE4 | #AED4CD | #8EE0D4 | #87B0B1 | #C9ABE7 |
| evangelion | #000000 | #161616 | #211C18 | #2D261E | #382C22 | #FFFFFF | #D6D3CC | #FFC39D | #AB9C8C | #FFD28A |
| deus-ex | #0A0806 | #1C1710 | #262016 | #33291A | #3E3120 | #EBDCBF | #CABD9F | #E8BD70 | #A8946A | #E8BD70 |
| mirrors-edge | #F4F4F0 | #FFFFFF | #F4F4F0 | #E0EBF3 | #D0E0EC | #1A1A1A | #41474C | #942013 | #65717B | #15517E |
| portal | #F0F0EE | #FFFFFF | #F0F0EE | #E2E9ED | #D4E0E7 | #2A2E38 | #424B55 | #803A00 | #64727D | #164F78 |

Apply Batch07 mapping with table: panel/overlay/forms, text title/body/labels/banner/control/tooltip, dim version/hints/secondary, functional accent for accent-c/accent-text/accent-m/accent-y and readable hotkey/edit/update/selected copy, hover/pressed across tile/button/rename/picker/skin/Manager, border/focus actionable outlines/drop hints. Foregrounds opaque. Saturated decorative cyan/orange/red below **never** becomes inaccessible title-dot/hotkey/status foreground.

Light Mirror/Portal explicitly override inherited literal-white filter-clear hover/selected/menu/tooltip/hotkey/error states with dark text/accent and table pale fills, including active-only controls. Remove/error dark-theme fill#70222C/glyph#FFF4F0; light-theme fill#79261C/glyph#FFF4F0 across rest/hover/pressed, dark error text#79261C on white. Prevent inherited OKLCH/literal bypass. Portal original#F08A1A/#1A9AE8 and Mirror#E82A1A/#1A8AE8 are decorative planes/rings only; functional accent/focus darkened for all text/state floors.

Five-surface opaque screen min text/accent/dim≥6.19:1, border≥3.68:1, focus≥6.18:1. Excludes art/compositing/actual icons/inherited CSS; **not rendered QA**. Actual text≥4.5/non-text-action-focus-icon≥3 all states/brightest pixels. Light real app icons measured individually against rest/hover/pressed; no automatic claim that unchanged coloured icons pass on white. Apply proven prior light-theme plate/filter approach only within these themes, preserving glyph colour recognition; report exact adjustment to Judy. No rebaseline/legacy waiver.

## 0.3 Type and fit

Body/Manager/forms Segoe UI/Yu Gothic/Arial at current functional sizes/weights. Title11px/line-height1.2 except Evangelion measured larger start14px; labels12px/line-height1.2/tail-margin3px/no halo, banner11px. Portal existing local Jost400 three roles/explicit weight/style/font-synthesis:none, five others stock.

| Theme | Title / weight / style / starting tracking | Labels / weight / tracking | Banner / weight / tracking |
|---|---|---|---|
| tron | `Consolas,'Courier New',monospace` /400/normal/2px caps | same /400/.5px caps | same /400/.3px |
| ghost-shell | `Consolas,'Courier New',monospace` /400/normal/1px caps | same /400/.3px caps | same /400/.3px |
| evangelion | `Cambria,Georgia,serif` /700/normal/1px caps, start14px | same /700/.3px caps | same /700/.3px |
| deus-ex | `Bahnschrift,'Segoe UI',sans-serif` /600/normal/2px caps | `Consolas,'Courier New',monospace` /400/.5px caps | same /400/.3px |
| mirrors-edge | `'Segoe UI',Arial,sans-serif` /600/normal/2px caps | same /600/.5px caps | same /600/.3px |
| portal | `'Jost','Segoe UI',sans-serif` /400/normal/3px caps | same /400/.8px caps | same /400/.8px |

No Orbitron/Michroma/ShareTech/Shippori/ZenAntique/Inter/WorkSans/Audiowide download/adoption from wishlist, no installed non-stock proxy. Evangelion white functional names stay stark sans/body controls even when tile labels use bold Cambria; no faux tiny Mincho/control font. Its larger title is approved audit direction: measure entire title/version stack inside40px with no clipping/overlap; if14px fails, step13→12→11 then10, tracking stays1px. Other titles Foundation tracking down1px→10px→stock fallback; legacy edge≤156px/dynamic art hiding. Portal label ladder .5px steps to .3px as necessary. Standard six labels fit, long genuine names ellipsize. Wait loaded fonts/report family/weight/style/ЩЦ/descenders/numerals/misspelled-family control/simulated1×/1.5×/2×, no OS scale. Current banner arrays/fit retained, narrow limitations explicit.

## 1. TRON — crisp circuits and disc

Keep hex **plates**/full glyphs, remove centre scan grid/ticks/readout and glow loops. Header84×20 original three thin circuit traces, no logo. Upper-pad corner traces in safe bands only, cyan#2AC8FF1px decorative strokes/no glow. Banner strip perspective grid confined to decorative top7px seam (thin converging lines, not below quote);22px identity-disc ring with one notch, original and simple. One orange#F4AF2D small disc/edge mark, accessible pale functional ink separate. Aquamarine/dark-blue material not full neon cyan wash. Static. Squint: precise circuits/grid-disc/orange, distinct from GhostShell wireframe.

## 2. Ghost in the Shell — opaque teal glass

Remove55% wash/readout/Tachikoma text/central lattice. Opaque glass-slate panels retain teal identity/purple hover fills. Header84×20 original static hex-lattice strip; two thin wireframe pad-corner brackets outside content. Banner22px original dashed circle, no puppet/movie mark. Rounded glass **plates** radius4px full glyphs, retain safe chamfered window corner transparent/nonwhite; no actual glass blur added. Teal copy, purple focus, static. Composition over white/midgrey confirms title/controls readable, not just black gate. Squint: muted teal wireframe/glass/slate, not Tron luminous circuits.

## 3. Evangelion — stark heavy serif

Delete centre diamond/readout/green wash and all pulses. Black ground/stark white names, Cambria700 measured larger title (no logo reproduction), hex **plates** full icons. Header84×20 three-cell hex strip, original shape kit; MAGI#0A3A2A one thin decorative header rule only. Banner22px original angular status-box corner with orange bar, no leaf/NERV mark; thin boxed line within seam/decor slot **no invented status words**. Orange#F66E25 decorative edge, red#D3290F edit seam, live accent table light orange. No tiny decorative console type replacing utility labels. Static. Squint: heavy black/white/orange typographic warning architecture, not purple mecha neon.

## 4. Deus Ex — retain black-gold precision

Audit keep: preserve honeycomb/gold material and hex **plates**, full app glyph. Delete augmentation/readout/strobes/Impact title. Header static honeycomb5% alpha behind safe header decoration only,84×20 one thin gold arc plus two small honeycomb cells, no logo. Banner22px original circle-in-square. Gold#E8A020/#C88A18 remain decorative lines, brighter functional table ink. Bahnschrift600 title, Consolas names. Chamfer white wedge removed within theme decoration and transparency references; native shaping pending. No slow glow. Squint: precise gold honeycomb/arc, not fantasy gilt.

## 5. Mirror's Edge — clean white and red plane

Keep approved light identity, replace cold grey ground with#F4F4F0/white panels; remove every label/icon shadow/smudge/readout/runner line crossing grid. One flat red#E82A1A plane in safe top-left outer pad, never under dynamic title/tile/focus; clipped/suppressed near-fit if no room. Header bottom2px red rule inside strip ending in a small circle in84×20 art slot. Banner22px original red angular runner-arrow line (not silhouette/faith logo), no text. Functional dark red/blue focus table-safe; no white hover text. Radius2px plates/full glyph, genuine app-icon contrast on white measured. Static. Squint: clean white/red architecture, not grey-glowing portal chamber.

## 6. Portal — retain ovals safely

Audit keep: white testing-panel ground, circle **plates** full app icons, remove all shadows/scans/wisps/readout and actual oval intrusions. Existing orange/blue oval motifs retained but resized/clipped **entirely into measured safe outer bands**; historical16px pad is not free content space. Use8px band and four-pixel focus keep-out; at radial/minimum where no safe band, suppress oval locally rather than cover tile or grow window. Thin black panel-grid lines in outer gutters only; no line beneath labels/focus. Header84×20 original short panel divisions, banner22px original generic stick-person stepping across a gap (no Aperture logo/copied pictogram). Decorative orange#F08A1A/blue#1A9AE8 ring hues, live orange/blue darkened table. Local Jost400 title/labels/banner, no low-contrast legacy pass. Static. Squint: white test chamber/orange-blue safe ovals/pictogram, distinct from Mirror red plane.

## 7. Acceptance and original completion ledger

Apply Batch07 §8 actual live integration matrix to **six themes**: Grid/Fan/Ring directions/near-fit capacity; region empty/populated/filter/edit/rename/remove/hover/pressed/focus/menu/tooltip/update/scroll states; actual Manager selected/unselected/options/skin/hotkey rest/recording/active-only/error/clear/form/footer/scroll/control. Deleted Settings overlays invalid. Actual hit rect intersections0, art-content A/B/C overlap0/four-pixel keep-out, worst rendered text4.5/non-text3 including bright art/compositing/icons, loaded-font/edge/tail/Cyrillic/banner evidence, loops0/texture sigma≤documented completed-batch ceiling (Batch06 reference3.72). Positive broken colour/font/overlap controls fail. All101 F5/Q2/shared forwarding/scroll/fallback smoke reads all101, edits only six.

Batch14 emphasis:

1. Portal ovals no tile/icon/label/focus intrusions at every actual layout/direction/minimum/scroll state; label/icon circle glyph complete, Jost400 local three roles.
2. Mirror/Portal real icons on white rest/hover/pressed, dark functional filter-clear/active/hotkey/menu/status/error foregrounds, no shadow smudges. Control ratio thresholds never relaxed for aesthetic orange/blue.
3. GhostShell opaque composition over white/midgrey; DeusEx/GhostShell chamfered transparent corners without white wedges, native shape debt separate.
4. Evangelion14px larger title stack/edge/version measured at1×/1.5×/2× simulated raster with explicit ladder; no changed header/control geometry.
5. True22px1× icon and title/banner-hidden squint sheets: circuit disc, dashed wire ring, angular warning box, circle-square, red runner plane, test pictogram/orange-blue chamber; no copied logos.

Original-scope closure after actual builds: record all101 exact keys against completed batches1–14, catalogue/F5/Q2 parity and before/after evidence. **Writing final batch spec does not certify feature completion.** Keep19 inherited expanded diagnostics across15 themes separate from32 static legacy warnings; completed-batch contrast disposition needs its own committed Judy brief, no sweep here. No rebaseline/legacy waiver for six redesigned themes.

Ender exact paths/per-theme ratios/fonts/edges/loops/key-named before-after/state/rect/art/native-debt table; Judy actual visual review; Futaba independent pinned GO/NO-GO safe scope; Sully exact scoped doc/development publication only. Headless mocks not native/packaged/performance/final release clearance. No fresh away window/input/display/sleep authority. Preserve full before/after for Sergei's promised final review. Version1.94.3 unchanged/no tag/release.

## 8. Preparation disposition

No open font/era/product approval. These six are original all101 scope, not a request to broaden. Publish after fallback QA; implement after Batch13 sequentially. Stop preparatory work here; do not automatically start inherited completed-batch contrast-debt specs.
