# QuickLaunch theme fidelity — Batch 13 UX spec

Judy · 2026-10-08 · **Preparatory spec only; publish after fallback QA, implement sequentially after completed Batch12.** No source/theme/assets/fonts/git/app/native-input/display changes. Opaque-palette arithmetic is preparation, actual rendered/motion/CPU/state evidence pending. This batch explicitly preserves the audit's bounded Matrix rain exception.

## 0. Authority and exact scope

This is an **EXTEND** of approved all101 theme fidelity: plan `9719edc`, audit `a659bf9` §§1/6/7, Foundation `75b9f7c` Parts A/B, Batch06 `16d89bf`,11-font README `4191e24`, committed completion inventory and Batch07 integration-state contract. Earlier docs remain untouched. Pip-Boy follows audit Fallout4 phosphor direction, not New Vegas amber. No new product/era scope.

| Exact CSS file under `src/renderer/styles/themes/` | Existing name (preserve) | Audit action | Direction / infinite motion budget |
|---|---|---|---|
| `alien.css` | ALIEN | tone down | Grey-label green terminal, amber switches /0 |
| `pip-boy.css` | PIP-BOY | tone down | Fallout4 phosphor tabs/trefoil /1 small cursor |
| `terminator.css` | TERMINATOR | tone down | Red analysis with cold blue chrome /0 |
| `half-life.css` | HALF-LIFE | redraw | HEV orange/hazard/concrete /0 |
| `metal-gear.css` | METAL GEAR SOLID | redraw | Olive Codec, yellow alert /0 |
| `robocop.css` | ROBOCOP | redraw | Blue-chrome visor/brackets /0 |
| `predator.css` | PREDATOR | redraw | Jungle/thermal stripe/three laser dots /0 |
| `matrix.css` | MATRIX | keep | Green code rain with blue-grey frame /1 bounded rain |

Count method: eight directly verified keys/files, four redraw/three tone-down/one keep, matching audit §7. Six static, two with one permitted loop each (batch total2); **no title flicker**. All eight stock under Foundation, no bundled-font adoption/download. Original all101 also includes following Batch14six; don't end coverage at13.

Ender owns these eight CSS paths and agreed evidence docs; Judy this document/visual review; Futaba independent pinned QA; Sully exact commits/pushes. Preserve concurrent fallback/QA/earlier docs. Exclude shared source/layout rewrite, new controls/features/status/permissions, fonts/dependencies/downloads, catalogue/banner behavior change, other batch/completed-theme palette sweep, hooks/guards/QA-tool repair, native input/display/scale/taskbar/sleep/running QuickLauncher/signed-in browser, version/tag/release. STOP/report required shared-code changes/missing approved resource; bounded readability/fit/art-alpha changes return precise values to Judy.

## 0.1 Chrome, states and approved exceptions

Inherit audit C1/C3–C5/H1–H8, Foundation A/B, Batch06 §0.1–0.2, Batch07 §§0.1/0.2/0.3/8 **except palettes/type/motifs and its all-static/no-label-shadow rule**, replaced below for Matrix/Pip-Boy only. Functional Windows patterns/targets remain (Jakob/Fluent/WCAG/Fitts); clear, quiet status remains (NN/g).

- Remove whole-app shadow/blackout, readout/panno/rosters, icon/title pulse/flicker, particle sweep, animated sheen and moving scanlines. Existing functional transitions stay. No added blur/will-change; base backdrop blur preserved.
- Matrix alone may keep one stepped full-grid code-rain layer, **≤35% alpha and ≤30 updates/sec**, no whole-window background-position animation. It stays behind plates/content, with actual tile-label dark backing and measured brightest-glyph contrast. Move all other Matrix decoration to safe frame slots. Pip-Boy alone has a small≤6×11px block cursor in banner icon/decor slot, opacity steps(1)1s, never text blinking. No other infinite loop.
- Every other frame uses existing scrolling Grid background,8px outer bands/four-pixel tile/focus keep-out; no glyph/text/rings/maps/schematics/hard silhouettes under app content. Omit radial band without safe space. Matrix rain mask follows live Grid/Fan/Ring shape/plate backing; if safe contrast or shaped transparency cannot be achieved theme-locally, freeze/suppress rain in that layout and report, not rewrite renderer. No content-obscuring app-after; art pointer-events:none.
- Header84×20 inherited right172/top10 slot, hide below424px/filter/long-title/control conflict; legacy title≤156px, dynamic actual rects govern. Art hides before moving/shrinking targets. Header lines inside40px. Banner22px icon/≤7px seam/measured reserved motifs, existing authored arrays/fit/rotation unchanged. Any specified decorative number/tag below is original audited **static art**, never telemetry/control/status and never under quote/functional content.
- Full app glyphs, themed **plate** independent, cuts≤20px. Remove PipBoy circle/MetalGear diamond cropping, no scanline/filter over icons. Matrix label-only audit exception `text-shadow:0 0 3px #000` is allowed dark backing; other seven no halo/shadow. No general glow/pulse/icon dimming, labels tail margin3px. Actual F5/tooltip/menu/rename/hotkey/state behavior unchanged.

## 0.2 Binding palettes and semantic state mapping

Opaque table surfaces; no desktop-dependent foreground fade. Scans decorative only on header/banner, never icons. First real root gate declarations, no duplicated comment tokens.

| Theme | bg | panel | header/banner | hover | pressed/selected | text | dim/hints | functional accent | border | focus |
|---|---|---|---|---|---|---|---|---|---|---|
| alien | #0A0C0A | #182019 | #202A21 | #29352B | #324135 | #D5DBCA | #B4C2AE | #84DEA0 | #91AA91 | #E8C36E |
| pip-boy | #061006 | #102512 | #16301A | #1D3B23 | #25492D | #9AFAB5 | #B2D8BA | #75F6A0 | #7DBE8D | #8FFFB4 |
| terminator | #06080C | #1A1E27 | #282029 | #32262D | #3C2E35 | #EDD4CE | #CDBDC2 | #F39D93 | #A7A7B2 | #9FBFE1 |
| half-life | #0A0A08 | #24251E | #2D2D22 | #38382B | #424234 | #E8E2CD | #CFCBB5 | #FFD078 | #A8A38C | #F0D374 |
| metal-gear | #0A1208 | #202E1B | #293724 | #32442C | #3B5034 | #D6E0C8 | #BDCCAD | #AAE38C | #91AE7D | #E8D174 |
| robocop | #0A0C10 | #1B2530 | #25313D | #2E3C49 | #374956 | #DCE4EA | #BFCFDA | #91CFEF | #8FA9BD | #91CFEF |
| predator | #0C1208 | #24351A | #304423 | #3A4B2A | #435631 | #EEDFC0 | #D0CEAF | #F4BD89 | #A2B187 | #FFD060 |
| matrix | #061009 | #10251A | #163021 | #1E3B29 | #264734 | #B0E8BD | #A0CFAC | #87ECA0 | #83B994 | #87ECA0 |

Batch07 semantic mapping replaced by this table: panel/overlay/rest fields; text title/body/labels/banner/control/tooltip; dim version/secondary/hints, accent-c/accent-text/accent-m/accent-y for readable live accent/hotkey/edit/update/selected copy; hover/pressed across tile/button/rename/picker/skin/Manager; border/focus actual actionable outlines/drop hints. Functional foregrounds opaque. Original low-luminance audited phosphor/red/olive remain local decoration, never actual unreadable state text.

Remove/error controls Batch07 dark-theme opaque#70222C/#FFF4F0 glyph rest/hover/pressed; error text#F1B5B7; prevent inherited OKLCH/literal colour bypass. Matrix blue-grey#243A46 allowed only frame material with table-readable foregrounds; label backing black, not a new opaque sheet covering app glyphs. PipBoy decorative phosphor#1AFF80 retained small tab/cursor ink, functional table accent/tints distinguish its material from Matrix and Alien.

Opaque five-surface screen minimum text/accent/dim≥4.78:1, border≥3.51:1, focus≥5.18:1. These arithmetic values exclude Matrix glyph rain/scans/art/icons/compositing/inherited CSS and are **not rendered QA**. Actual text≥4.5/non-text-action-focus-icons≥3 all reachable states/brightest pixels. Matrix render every rain phase sampled through one full cycle; control alpha100%/removed backing must expose failure where applicable, proving real analysis. No rebaseline/legacy exemption. Reduce unsafe art/fill or move foreground toward text, send exact pair/value to Judy.

## 0.3 Stock typography

Body/Manager/forms Segoe UI/Yu Gothic/Arial at current functional sizes/weights (Matrix may style its own body in Consolas only if all actual form/control fit passes; no markup change). Title11px line-height1.2, labels12px/line-height1.2/tail-margin3px, banner11px. All stock, no VT323/ShareTech/Orbitron/Michroma/Saira/Stardos downloads or BlackOpsOne adoption from another batch.

| Theme | Title / weight / starting tracking | Labels / weight / tracking | Banner / weight / tracking |
|---|---|---|---|
| alien | `Consolas,'Courier New',monospace` /400/2px caps | same /400/.5px caps | same /400/.3px |
| pip-boy | `Consolas,'Courier New',monospace` /700/2px caps | same /400/.5px caps | same /400/.3px |
| terminator | `Consolas,'Courier New',monospace` /400/2px caps | same /400/.5px caps | same /400/.3px |
| half-life | `'Trebuchet MS','Segoe UI',sans-serif` /700/1px caps | same /700/.3px caps | same /700/.3px |
| metal-gear | `Bahnschrift,'Segoe UI',sans-serif` /600/2px caps | same /600/.3px caps | same /400/.3px |
| robocop | `Bahnschrift,'Segoe UI',sans-serif` /700/2px caps | same /600/.3px caps | same /400/.3px |
| predator | `Bahnschrift,'Segoe UI',sans-serif` /600/2px caps | same /600/.3px caps | same /400/.3px |
| matrix | `Consolas,'Courier New',monospace` /400/2px | same /400/.3px as typed | same /400/.3px |

All styles normal, caps only explicit themes. Matrix rain kana uses stockMS Gothic glyphs, actual family/script measured. Foundation positive-tracking ladder down1px→10px→stock fallback, title legacy≤156px/dynamic art suppression; standard six labels fit, genuine long names ellipsize. Wait fonts/report weight/face/Cyrillic/numerals/descenders/misspelled-family control and simulated1×/1.5×/2× without OS scale. Existing one-line banner arrays/fit preserved; report narrow limitations. Decorative HUD numbers use same readable stock face inside reserved artwork slots, no tiny text.

## 1. Alien — switches, hazard and grey names

Delete MU-TH-UR/crew/readout over labels, icon scanlines/biohazard icon. Header84×20 original row of three rocker-switch rectangles, one amber tick (not interactive). Header/banner scan texture static≤6% only, worst text pixel measured. Banner top hazard stripe≤7px;22px original motion-tracker ring with one small offset sweep line/dot, static. Grey functional tile labels with green accent, amber focus/warning seam, square full-glyph plates. No fake crew stats. Squint: retro industrial green switches/amber hazard, not Matrix rain or PipBoy tabs.

## 2. Pip-Boy — Fallout4 phosphor tabs

Delete corrupted SPECIAL/readout and heavy icon scan/circle crop. Radius6px plates/full icon. Header84×20 decorative static `STAT INV DATA` in Consolas10px minimum, measured full slot/no controls; no new tabs or interactivity. Header/banner static6% scan texture only, not striped app glyphs. Banner22px generic trefoil public symbol; small≤6×11px stepped cursor in icon/decor gap where measured free, opacity steps(1)1s (single permitted loop), no title flicker/text blink. Exact phosphor#1AFF80 small ink, table-readable names. Squint: phosphor tabs/trefoil/cursor, not generic lime terminal.

## 3. Terminator — red analysis and cold chrome

Remove reticle/haze/readout and icon scans/octagon crop. Square plates/full glyph. Header84×20 three original short analysis lines (solid dashes, no fake identifiers), static red decorative ink#D8281A. Banner22px original red ring with central dot (mechanical eye, not copied skull/film logo). Static scan texture header/banner only≤6%, no background stripes across apps. Small hover/focus crosshair-corner brackets inside safe plate decoration, no label/neighbour/ring overlap; cold-blue functional focus, chrome borders. Zero motion. Squint: red mechanical eye/cold chrome, not MortalKombat or ResidentEvil red logo.

## 4. Half-Life — HEV orange

Remove giant lambda/readout/scanlines over icons. Square full-glyph plates, concrete border, orange functional accent and hazard yellow small edit seam. Header84×20 original warning triangle/pictogram, no BlackMesa logo/text. Banner22px lambda **public Greek letter**, original stock glyph in HEV orange; left/right optional original cross/shield with static `100` decorative figures (audit HUD motif), only inside measured reserved end slots and never quote/icon overlap. Suppress figures at narrow sizes before compromising banner fit; no live health/status/telemetry semantics. Hazard seam≤7px. Trebuchet Bold, static. Squint: HEV orange/lambda/concrete, not red machine vision.

## 5. Metal Gear — Codec strip

Delete portrait/CALL/END/codec box/readout and diamond icon crop. Radius4px plates/full icons. Header84×20 original two thin static radar-cone lines, no portrait/logo. Banner22px yellow exclamation mark; reserved left motif static `140.85` in Bahnschrift11px, right motif ten static waveform bars, quote between. Decorative frequency/bars never controls or actual audio status; omit right bars then frequency when space insufficient, preserve authored quote/fit. Olive panels/green accent, alert red#E83A1A decorative edit seam. No new banner arrays. Static. Squint: olive Codec frequency/waveform/yellow alert, distinct from terminal rain.

## 6. RoboCop — bevelled chrome visor

Remove whole targeting HUD/directives/readout. Keep visor-tip **plates**, full glyphs/cuts≤20px. Header/banner static two-stop chrome bevel within frame, brightest stop measured for title/banner contrast. Header84×20 three short chrome vent cuts; banner22px original generic hexagonal corporate stamp with one vertical division, not OCP logo. Hover/focus corner targeting ticks confined to safe plate edges, no label/icon/ring/neighbour overlap. Existing authored banner retained; audit's optional `1 SERVE 2 PROTECT 3 UPHOLD` used **only if already present and fits**, no new array/copy mutation. Blue visor functional accent/cold steel, red-orange#E83A2A one edit seam. Static. Squint: chrome visor/hex/corner ticks, not Terminator's red eye.

## 7. Predator — jungle thermal frame

Delete central thermal HUD/reticle/counter/readout. Jungle olive panels, warm functional orange, yellow focus, decorative thermal red#B02A1A one edit seam. Header84×20 original angular glyph row of four **nonletter geometric strokes**, no copied alien language/logotype. Banner top≤7px static blue-red-yellow thermal stripe, text on separate table-safe surface. Banner22px three red laser dots in triangle with thin warm outline so1× reads three dots, no animated targeting. Keep V-notch **plate** if app icon complete/cut≤20px; full glyph wrapper. Static. Squint: jungle/thermal/dot triangle, not pure indigo machine vision.

## 8. Matrix — retain bounded rain identity

Audit keep exception: preserve original stock-katakana/code rain identity, remove WAKEUP/rabbit readout, border/title/sweep/flicker loops. One rain animation only, stepped≤30updates/sec, max35% painted alpha; no expensive full-window background-position sweep or app-shadow. Theme-owned layer confined to grid shape and behind all icons/labels/plates, scroll behavior tested. Label-only dark backing `text-shadow:0 0 3px #000` (audit exception) plus opaque/dark plate so actual brightest-glyph label contrast≥4.5 and icon≥3 at every sampled phase. Rain may enter grid background by audit C5 exception, but may never steal hit rects or obscure functional UI. If full dynamic/radial masking requires shared source, STOP/report; freeze/suppress rain in unsafe layout pending bounded solution rather than violate contrast.

Header84×20 two sparse static code columns (no prose), banner22px block cursor **static** so total Matrix loop stays1. Blue-grey frame trim#243A46 is secondary real-world identity; table green functional ink, no rainbow or invisible darkdim. Original auditdim#7FB88A can survive decoration only, functional dim table. No icon crop, Consolas throughout only where real Manager/form fit succeeds. Squint: green code rain with controlled dark-backed text; **no claim of CPU budget until measured**.

## 9. Acceptance, motion/performance and delivery

Apply Batch07 §8 live integration matrix to **eight themes**, modifying only its all-static/art-overlap expectation for Matrix's approved background rain: actual Grid/Fan/Ring directions/near-fit capacities, all region states (empty/populated/filter/edit/rename/remove/hover/pressed/focus/menu/tooltip/update/scroll), actual Manager selected/unselected/options/skin/hotkey rest/recording/active-only/error/clear/forms/footer/scroll controls. Actual same-plane hit intersections0, art/content overlap0 for non-rain art; Matrix label/icon backing and brightest moving-glyph contrast, no functional obscuration/hit interception. Actual text4.5/non-text3 all fills/states; stock font/edge/tail/Cyrillic/banner evidence. Positive broken colour/font/overlap controls fail. All101 F5/Q2/forwarding/scroll/fallback smoke reads all101 but edits only eight.

Batch13 emphasis:

1. Matrix full-cycle sampled strongest glyph positions/alpha≤.35/rate≤30Hz; deliberately remove backing/increase alpha control detects unsafe text; real icons/rename/remove/control overlays safe all phases and radial shapes. Native transparent shaping explicitly pending.
2. Motion ledger six0/PipBoy1/Matrix1; actual loopingAnimationsAtCapture and CSS infinite counts, no hidden title pulse/duplicate matrix loop. No introduced CPU increase, compare bounded isolated renderer/static/animation idle with prior under same fixture; five-region60s/native idle comparison remains original machine-window acceptance debt, no fabricated pass.
3. PipBoy actual small-cursor dimensions/steps/rate, no app glyph scans/circle crop; MetalGear diamond cropping gone; Predator/RoboCop V/visor plate full glyph.
4. Header tabs/frequency/100 figures/waveforms fit measured artwork slots and are omitted safely narrow, no fake functional telemetry/control or new quote strings.
5. True22px1× icons/title-banner-hidden squint distinguish three green terminals by grey industrial switch/hazard vs bright phosphor tabs vs green rain; all eight material identities readable.
6. Static textures non-Matrix sigma≤documented prior ceiling (Batch06 reference3.72). Matrix uses **separate moving-glyph contrast/motion** metric, not a false zero-art sigma pass; record approved exception precisely.

No gate rebaseline/legacy waiver. Keep32 inherited static warnings separate from19 expanded inherited diagnostics; no completed-theme palette sweep. Ender exact paths/per-theme ratios/fonts/edges/loops/rain rate/alpha evidence/key-named before-after/state/rect/art/phase matrices/native debt. Judy actual visual review; Futaba independent pinned GO/NO-GO safe scope; Sully exact doc/development publication only. Headless evidence not native/packaged/release/performance final clearance. No away window/input/display/sleep authority. Preserve before/after for Sergei/version1.94.3/no release/tag.

## 10. Preparation disposition

No open font/era/product decision; Matrix rain is explicit existing audit approval, not new permission. Spec not implementation/rendered acceptance. Publish after fallback QA, implement after Batch12 sequentially; remaining original Batch14six follows.
