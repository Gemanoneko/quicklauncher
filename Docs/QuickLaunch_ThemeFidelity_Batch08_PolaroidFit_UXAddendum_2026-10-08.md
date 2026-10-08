# QuickLaunch Batch08 — Life Is Strange polaroid fit

Judy · 2026-10-08 · **Bounded adaptation of the committed photo-frame motif; commit before final implementation/acceptance.** Original Batch08 spec `9c681b7` §1 asks static white6px paper frame/1° rotation behind untouched content, with zero content/focus/neighbour overlap. This addendum resolves its fit in actual unchanged tile geometry. No product/control/font/asset/source/test/app/native-input/display/git/version/release changes made by Judy.

## 1. Verified constraint and exact authority

Ender identified live `base.css` geometry: `.app-tile` flex-column/centered, padding6px4px4px/border1px/overflow-hidden; `.tile-icon-wrap` is S×S; `.tile-label` starts5px below icon, line-height14.4px with existing clip margin3px; minimum cellS+32 and gap8. A nominal all-sides6px frame expanded outside the icon reaches at least1px into the label gap before its1° rotation adds further extent (largest at128px icon). A6px border around the whole tile reaches its label's bottom padding and paints bright paper beneath light text. **Neither is acceptable.**

The already approved no-overlap/readability contract takes precedence over literal unclipped6px paint everywhere. Judy's original theme-fidelity authority covers a smaller visible paper extent/angle where existing geometry cannot fit. Preserve a recognizable static photo-paper motif where safe, not a wholesale removal or new layout. Ender chooses the theme-local CSS drawing/masking method after this document is committed.

Source ownership: only `src/renderer/styles/themes/life-is-strange.css` within the current eight-theme Batch08 work. No shared `base.css`/`region.css`/grid/radial geometry change, icon/label movement/crop/font/size/hit-mask change, new spacer, JS fitter, or change to other seven themes. Earlier Batch08 spec remains unchanged; this document narrows its polaroid paint contract only. Full Batch08 palettes/type/motifs/zero motion/header/butterfly/acceptance remain.

## 2. Binding art-only treatment

### 2.1 Photo window and untouched content

The current **icon well remains the photo window**. Its whole S×S rectangle and actual icon paint stay unchanged, with original dark plate/backing visible under any transparent glyph pixels. White paper is a decorative **ring outside that window**, not a bright fill replacing its backing. The frame never paints through actual icon pixels or beneath functional label/rename/control ink. Mask/clip only the art layer, never the icon wrapper/image, label, tile, remove button or hit target.

Render the paper on the existing hover/focus states specified by Batch08; no ambient motion/added interaction. Original raspberry/turquoise focus/control colours and focus ring remain. No white whole-tile fill/border sheet over the label, no halo to compensate for weak contrast, no reduced label size or new margin. Paper uses the approved pale white #F0E8E0 (or original white choice from the committed batch) as decoration, not a functional selected-control background.

### 2.2 Nominal frame and bounded lower edge

Where complete6px paper plus1° can fit all actual content/control bounds, keep that original nominal treatment. In the current5px label gap, use this **approved constrained variant** rather than growing the tile:

- Upper and side paper are **nominal6px** outside the S×S photo window, before the existing tile clip. The ring's interior remains the unaltered photo window; no paper covers icon paint.
- Lower paper's unrotated visible extent is **at most2px below the icon well**, not6px. Remaining nominal lower paper is clipped/masked away. This is deliberate art cropping; it is not a cropped icon/label or failed content fit.
- Prefer the approved static **1° rotation**, applied only to the frame art. After rotation/clipping, preserve **at least1 CSS pixel clear between paper paint and actual label/rename/control paint**, zero pixel intersection, including raster antialiasing. This final requirement is binding; the pre-rotation2px number is not permission for rotated corners to intrude.
- If1° cannot satisfy that actual paint clearance in a constrained layout/size/state, use **0° frame art** there while keeping recognizable nominal6px upper/side paper and≤2px lower extent. Do not rotate the icon/content/tile to create room. No intermediate runtime motion or new per-user setting.
- Existing parent overflow can crop outer paper at top/side boundaries. It may never crop content or enter a neighbouring tile/focus region. Keep the ring distinguishable: at least **two perpendicular paper edges with≥2px visible thickness** and an unambiguous dark photo-window interior in a shown variant. Full6px need not survive every clipped corner.

Use actual final paint/rects, not a CSS declaration-only claim. Current icon32/64/128 changes rotation extent; test each. Conservative theme-local presets/clip shapes are acceptable technical choices. No per-pixel runtime script or change to shared geometry is authorized.

### 2.3 Impossible states/layouts — measured selective suppression

Grid, Column and Row should use the clipped recognizable photo ring whenever the current well has safe space. **Do not omit the motif from every layout** because its unclipped original fails. Apply the constrained variant first, then safe0° where required. If a particular existing state has no zone satisfying the actual clear-paint/minimum-recognizable-edge rule (e.g. remove-button/rename occupation), suppress **only this paper layer for that state/geometry**, retaining normal raspberry/turquoise hover/focus and full content. Record the exact tested reason/state; do not silently suppress all edit or all small-icon cases without measured need.

Fan/Ring already allow art omission when a nominal frame cannot fit. Apply the same constrained variant where safe, otherwise keep their approved plate/background/focus and omit only paper. Transparent native background/backing remains whatever original theme/radial contract requires; do not add white or dark full-window masks. Full icon/well and targets remain original.

In edit mode, remove-control and rename-input paint/hit rects have priority: clip the frame's corresponding art corner/edge if that leaves recognizable safe paper; if not, state-local omission is accepted. Art must never draw over a remove button, intercept a click, cover its focus outline or alter normal source/destination tile drag states. Filtering/scrolling/fallback Grid must keep the same treatment appropriate to actual presentation.

No product choice is needed for this art-only adaptation. STOP/report if even the constrained visible ring requires shared geometry/font/hit changes or an unacceptable new motif; do not implement a global workaround.

## 3. Required evidence and negative controls

Use existing isolated safe renderer fixtures; no new visible/native input/display/scale/taskbar/sleep/app/browser actions. Ender produces exact source/evidence pin; Futaba independently verifies current actual renderer/markup, no proxy label geometry. Do not overwrite failed original-frame evidence or accepted Batch07 source/history.

| Coverage | Binding result |
|---|---|
| Grid, Column, Row, Fan, Ring, supported radial directions and near-fit/minimum/normal/large presentation | Recognizable paper shown wherever safe; documented clipped/0°/omitted cases only, no tile/content/hit geometry change |
| Icon32,64,128 and actual128-refusal/restored smaller icon presentation | Actual paper rotation/crop boundary safe at all supported sizes; refused size is not a fake accepted128 layout |
| Rest, hover, keyboard focus, pressed+hover and active-only; populated/empty; edit/remove hover/focus; tile rename/input error/commit/cancel; filter/scroll/drag/fallback Grid | Existing states/content/control paint and targets unchanged; art shown only its specified states, zero intrusion/interception, correct restoration |
| Standard labels plus long/Cyrillic/descenders/numeral samples at1×/1.5×/2× simulated raster | Label paint/backing/line box unchanged; paper-content clearance≥1px and intersection0, no tails hidden/no halo/font changes |

Measure actual icon-well/content/label/rename/remove/control/focus/neighbour rects and **paint extents**. A/B/C art-only/content-only mask proof must show paper versus actual icon/label/control paint intersection0, and no paper in functional focus/neighbour keep-out. The proposed ring is adjacent decoration; suppress source art when comparing unchanged content so a pixel diff does not confuse intentional paper crop with cropped label. Hit-testing uses the unchanged real element rectangles/centres/safe edges and elementsFromPoint; art pointer-events:none. No invisible overlapping hit overlay.

Contrast retains existing floors: normal label/control text≥4.5, action/focus/glyph/border≥3 on actual fills/brightest relevant art pixels. In particular dark icon backing stays unchanged and label foreground is never assessed over a white paper sheet it was not designed for. Real icon recognition and clipping checks remain. Texture sigma ceiling **3.72** unchanged; report paper as bounded frame art, not a texture exception. Zero infinite loops/static1°/0° only, no added CPU/motion.

Positive controls: isolated unmasked6px lower paper/1° variant must expose label overlap; whole-tile6px white border must expose bottom-label/background violation; a frame intersecting remove/rename/focus must fail actual paint/rect oracle. A clipped2px/0° safe version must pass where geometry permits. A masked/clipped icon introduced as a false fix must fail glyph-identity oracle; paper-free-all-layout false implementation must fail recognizable-motif coverage. Record actual changed input in each negative control, no threshold/baseline relaxation.

Deliver before/after original failed/full nominal/constrained output captures at true1× plus scaled inspections, source pin/hash, exact layout/size/state selected variant table, final paper bounds/clearance/overlap numbers, unchanged icon/label/hit geometry and colour/type/texture/loop evidence. Judy reviews these actual variants for recognizable photo identity; Futaba flags failing contexts, no automatic theme redesign.

## 4. Delivery and limits

Root hands this committed addendum to Ender for the bounded `life-is-strange.css` art treatment within Batch08; other seven Batch08 CSS ownership remains existing brief. Sully owns spec/development commit/push, Futaba independent pinned QA. Version1.94.3 unchanged/no release/tag. No prior spec/other theme/shared source/tool/global hook/guard/font/new asset change authorized by this ruling.

This authorizes clipped nominal paper, limited lower paint and static0° fallback where necessary to preserve the original photo motif safely. It does not waive no-overlap/contrast/hit floors or approve silent omission everywhere. Native/packaged/real-input/performance acceptance remains separately pending.
