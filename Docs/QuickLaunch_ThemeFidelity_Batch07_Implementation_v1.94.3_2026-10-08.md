# QuickLaunch Theme Fidelity Batch07 implementation

Ender · 2026-10-08 · version 1.94.3 · candidate based on `bb651d1e688e1036826bfe8c522dec4bcd2595cc`.

Seven theme CSS files implement committed Batch07 `0bd3631`, with the shared opt-in art-clearance behavior required by HeaderSafety addendum `848426e`. This is an implementation handoff for independent QA, not release clearance. No version, package, font, dependency, catalogue, IPC or launcher changes were made. Formal legacy entry receipts and native input/display checks remain pending; no receipt or native acceptance was fabricated or retried.

## Exact source scope

- Theme CSS: `src/renderer/styles/themes/amnesia.css`, `lovecraft.css`, `event-horizon.css`, `blair-witch.css`, `silent-hill.css`, `tiny-bunny.css`, `alan-wake.css`.
- Shared helper: new `src/renderer/header-art-safety.js`; its script load in `src/renderer/index.html`; one helper-owned visibility selector in `src/renderer/styles/region.css`.
- Focused pure tests: new `test/regions/header-art-safety.test.js`.

The helper/shared CSS and seven theme CSS changes can be published as separate explicit-path commits against the same complete QA pin. Other 94 theme files, fonts, app.js, region.js and Manager source are unchanged. Working-tree edits from other agents were preserved.

## Implemented behavior

All seven use the approved opaque palettes, original bounded static frame motifs, banner icon slots and title/label/banner faces. Ambient animations, icon filters, tile-field panno and text halos are removed. Existing functional transitions, accessibility targets, scrolling, banners and radial layout rules remain authoritative. Thematic silhouette cuts affect a separate plate pseudo-element, while the app glyph remains uncut and unfiltered. Silent Hill retains its approved light thematic plates.

The motifs use seven theme-local opt-in markers. The helper measures the actual header, visible title group, control/focus/input/filter/notice rectangles and computed 84×20px pseudo constraints. It enforces the 12px title clearance and at least 4px functional keep-out, fails closed on unresolved fonts/styles/missing geometry, preserves existing Manager/Row/Column/radial/filter/rename/narrow hides, and restores decoration after safe measured space returns. It never changes text, fonts, layouts or input values. Mutation, resize, stylesheet load/error, focus and font events coalesce into bounded validation. Pagehide disconnects observers/listeners and cancels the pending frame; its own visibility-class writes do not create an observer loop. No recurring polling timer is installed.

## Measured defect and correction

The first actual pseudo-offset control changed the authored right offset from 172px to 5px. Immediate and first-frame measurements still reported the earlier safe x378px art position; a subsequent direct measurement reported x545px overlapping the controls. A single-frame helper had already restored art from the stale safe sample. Reading the right constraint first and flushing header layout alone did not resolve that observed sequence. The final helper retains suppression through a bounded first validation pass and restores only after the second measured frame. An invalidation generation prevents intervening theme/title/geometry changes from publishing a prior result. This evidence localizes a stale first-frame measurement; it does not establish Chromium's internal cause.

The capture fixture originally assumed a fixed 50ms settle. The generation guard correctly restarted pending validation when a ResizeObserver reported the shortened title. The final fixture explicitly awaits two idle frames with no pending validation, rejecting after 18 frames rather than increasing the sleep or weakening collision assertions. The same actual offset control then passes all seven themes. Historical unsuccessful diagnostic runs remain in owned scratch; they are not acceptance evidence.

## Sender checks

- Static contrast gate on frozen source: 101 themes, **0 errors**, 26 unchanged inherited warning themes. This was 32 before Batch07; six modified members no longer need their legacy warnings. Neither baseline nor thresholds were changed.
- Existing audited offscreen hover gate: seven themes × 38 readings = **266 measured pairs, 0 errors, 0 grandfathered**. All four deliberately broken flat/light/gradient/hidden-glyph controls fired. Guard stubs intact 23/23, no forbidden IPC/native actions, registry unchanged, sockets zero, 11 owned processes started and zero left, exit 0.
- Focused pure geometry/control tests: **4/4**.
- Frozen custom offscreen renderer matrix: **87/87**. Actual Grid, Column, Row, Fan, Ring and Manager settings routes; long-title suppression, short-title restoration, filter hide, actual pseudo-offset collision, settled no-loop behavior, pagehide disposal, required art hides, Manager shortcut-button presence. Console errors zero, safety calls zero, 25 guard-control identities intact, owned parent 52664 closed exit 0. Post-run scoped CIM found zero owned Electron processes.
- Renderer and live source bytes compared to the immutable source manifest: zero drift.

The custom matrix records computed font strings and real rendered bounds, not platform-font glyph acceptance. Independent QA must finish CDP actual-face/glyph checks, complete banner rotations/build-time fixed-title ladder, expanded control states including `#btn-open-cheatsheet:active`, icon/plate controls, same-scene before/after comparisons, all-theme opt-out invariance and visual spec approval. This sender report does not claim those pending independent checks pass.

## Immutable handoff

Owned base: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch-integration/scratch/2026-10-08-theme07-ender/`.

| Identity | SHA256 |
|---|---|
| `source-pin2-manifest.json` — complete 322-file source, HEAD/version/dirty/runtime metadata | `78ccc60d2d250e4ae903690cfc26eb0762c67b242c0596ebecaf7e032220f463` |
| `renderer-run7-manifest.json` — guard, supervisor, mock/preload and exact renderer bytes, 143 files | `c0de8e9b3a3aadb179733583e537360d7610e8b13c641dd15cebb46c92268ede` |
| `evidence-pin1-manifest.json` — 39 evidence files, 77 runtime/package identities and junction provenance | `008a70de58b4ab2da429aef71e17dbcbc5e7cab758eb63c4570ca6c532ebaa45` |

The complete source manifest retains the historical freeze-script label `display-shrink immutable source`; its exact root, HEAD and bytes are this Batch07 candidate. This label is metadata only. The frozen source's `node_modules` junction points to the previously installed spike dependencies and is explicitly recorded in the evidence manifest; no install or dependency mutation occurred.

Node is `C:/Program Files/nodejs/node.exe`, SHA256 `cea6ac365f9bb9586dafd2084d996e092e7d3e7d07ab52d1f76bf53d1fca9bc4`. Electron is the installed 32.3.3 distribution under `C:/Antigravity Projects/QuickLaunch-regions-spike/node_modules/electron/dist/`; executable SHA256 `217c7abc77aaa868b9423ff3e6e8f40f62633ccc4121786fac64e481aef3429d`. All distribution/package files used by the harness are pinned in the evidence manifest.

## Capture origin

Final specimens are `renderer-run7/<theme>-grid.png`, `-edit.png`, `-fan.png`, `-ring.png`, `-manager.png` for each exact theme key above. Grid is 640×400 CSS px, Manager 520×760, Fan/Ring use actual geometry with ten mock tiles at icon size 64, all at 1× software raster. Actual current renderer pages load in hidden offscreen Electron windows. The gallery's original generic SVG app pictograms and fake paths are reused; these are not installed/native icon evidence. No real profile, updater, signed-in browser, display setting, native input or running QuickLauncher was accessed. Only owned processes were closed. The strict hover route separately uses its unchanged fixed 520×760 1× geometry.

No source edits are planned after this pin unless independent QA reports a concrete failure. The new report itself is publication documentation outside the frozen product identity.

## Additive correction: existing Manager footer target floor

Independent QA's expanded Options matrix identified two existing footer buttons at 23px height. The committed original-floor addendum `7aab880da17751f595f8ed8a0678c8272231e411` authorizes one shared correction: `body.manager #mgr-footer #btn-check-update` and `body.manager #mgr-footer #btn-close-settings` now own `min-width:24px; min-height:24px`. No fixed dimension, wrapper, hit pseudo-element, typography, palette, route or footer arrangement was changed. Root cause was the footer actions inheriting natural padding/font height without the already approved target minimum. The change uses the actual button border/hit box and lets the pinned footer absorb the required extra height through its existing body flex/scroll layout.

The final post-fix source is **source-pin3**, based on `7aab880`, version unchanged. Its 324-file manifest SHA256 is `469879d2df03cda42f970d3121256f1c00b62a4bb518aa800235bfafd1d3c65b`. Comparison to pin2 found exactly one product delta: `src/renderer/styles/manager.css`, SHA256 `44be8aa2952820ae4d6772cb12c0000c2b704922e929b5e776a1db59313f5ded`. The only other manifest differences are the committed footer spec and the preceding implementation report. All seven themes, header helper, index, region CSS, scripts and tests remain byte-identical to pin2. Pin2 and its failing QA evidence remain intact.

Sender's new guarded actual footer run **passes 665/665 checks**: all 101 catalogue themes at 440×420, 520×760 and 800×900; seven themes × seven formerly failing Options states; frozen 23px-gap reproduction; real button center and four safe inset edge-midpoint hits; measured containment, no button/body overlap, full label bounds; before/after natural widths, fonts, copy, tooltips, foreground/background/border unchanged; existing ≥24px natural heights retained and smaller heights raised only to24. It records 352 scene measurements and 704 target rectangles, with minimum width55.25px and minimum height24px. Removing the rule restores23px and fails the oracle; wrapper-only enlargement and a wrong-target selector also fail. The restored rule passes again. Options states are options, hotkey-recording, hotkey-error, hotkey-cleared, icon-size-refusal, update-offer and update-error, implemented through guarded mocks rather than a real updater.

The frozen corrected harness is `footer-floorfix/run3-manifest.json`, SHA256 `fe16b67246130cac9ff92c37af8dc5e64f8db3af5c3a4d919d94c61aae47ffaf`, covering282 source/harness/baseline files. Completed evidence/runtime manifest `footer-floorfix/evidence-pin1-manifest.json` SHA256 is `95068c5e7bff4c7d0b4e35f33ac5f0ea2d7027f9687c526ce9d2bfff84a798c6`; all77 prior runtime/package identities reverified unchanged and live source driftzero. Final run errorszero, safety counterszero, guard identities intact, owned parent15208 closed exit0. Scoped CIM confirms zero Ender-owned Electron processes; concurrent independent Futaba footer processes were identified and left untouched.

Historical footer setup failures are retained and not accepted: run1's generated quote syntax error prevented the main module and its guards from loading. Its exact owned Electron PID91796 and children were identified and closed; the supervisor reported exit1. No guard or window/modal-absence claim is made for that unloaded attempt. Corrected run2 was syntax-checked before launch and finished616/665 because the fixture probed corners of existing rounded buttons rather than the required safe edge points. Actual border-box dimensions and natural-width/type checks passed; corner failures were preserved. Final run3 was independently syntax-checked before launch, used center plus four edge midpoints at1px inset, and retained the unchanged24px floor and negative controls. No radius/shape change or threshold waiver was made.

Earlier unaffected theme/region/header evidence carries forward by exact source/style association. Manager footer height and body scroll-height differences are intentional and must be measured as such, not claimed pixel-identical. Unmodified baseline/candidate Manager raw-byte comparisons also require LF/CRLF qualification; prior residual raster differences are recorded separately by QA. Final independent footer state/focus/route/last-row/contrast acceptance remains Futaba's responsibility. The minimum-only change does not claim inherited contrast debts newly pass or waive any original contrast floor. Native input/display/packaged checks and formal legacy receipts remain separately pending.

Final publication file list has **12 source/test paths**: `src/renderer/header-art-safety.js`, `src/renderer/index.html`, `src/renderer/styles/region.css`, `test/regions/header-art-safety.test.js`, `src/renderer/styles/manager.css`, and the exact seven theme CSS paths listed above. Sully may publish the one-file footer correction, the four-path helper/test change, and seven theme CSS files as separate explicit-path commits against this same complete QA pin. This additive report update is outside the frozen product identity; no commit, version bump, tag or release was performed by Ender.
