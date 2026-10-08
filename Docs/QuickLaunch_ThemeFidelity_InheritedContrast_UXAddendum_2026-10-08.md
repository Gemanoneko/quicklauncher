# QuickLaunch theme fidelity — inherited contrast disposition

Judy · 2026-10-08 · **Bounded original-spec acceptance-debt spec, not a fresh failure report. Commit before implementation.** No source/theme/fonts/assets/git/apps/native input/display/tests changed or run. Current Batch07 work is excluded; its new rendering may already clear its assigned row. Reproduce from the eventual exact pin before fixing anything.

## 1. Authority and evidence correction

Original all101 theme approval and unchanged accessibility floors authorize fixing live control contrast while preserving approved art/palettes/layout. Inputs: committed feature-completion inventory; integration QA `QuickLaunch_QA_Integration_v1.94.3_2026-10-08.md` §Findings; M6 QA carry-forward; Foundation and committed Batch07–14 live-state specs; current `manager.html`, `manager.css`, `base.css`, `region.css`, FF8/Persona4 and five completed-theme token tables.

**Correct the historical role description:** the thirteen Manager readings are **KEYBOARD SHORTCUTS link/button `#btn-open-cheatsheet:active`**, diagnostic ID `extra-open-cheatsheet/active`. They are **not `.hotkey-input` recording/active states**. The inventory/QA shorthand “Manager hotkey active-only” is inaccurate. The actual frozen adapter `construct-extra-probe.cjs` explicitly binds that pair to `#btn-open-cheatsheet`, and current Manager markup declares its visible text `KEYBOARD SHORTCUTS` and tooltip `Open the list of keyboard shortcuts`.

Historical frozen source300 manifest `b8ef625b454e1fb55224cefdc1dac5cfe687fac94db835d44d254ca7ff62d26c`; harness47 manifest `507140b90788e1e9835ab68546b7ba669c37b34813bc0ae11c2bd42077408c9f`, as recorded by integration QA. The existing local read-only evidence inspected here is under `WIP/QuickLaunch/scratch/2026-10-08-integration-futaba/replay/`:

- `diagnostic-19-classification.json` SHA256 `a1f9fcd1dcbcaaf2113d9e049db569b4174918398ce3ad7e5dcaf3026ffa70f0`.
- `diagnostic-19-input.json` SHA256 `2aa811b011dd4fefa1ef9bb3138aaac91f74bf116299d5b2a645ab534cab7d8e`.
- `construct-extra-probe.cjs` maps Manager target; read only, not executed. Historical scratch evidence is data/provenance, not new authority to execute a tool or patch a harness.

Classification reported19 inherited/0 introduced. That is a historical prepatch/candidate comparison, **not a claim that current Batch07/future themes still fail**. The32 static legacy warnings are a separate checker ledger. The old29×101=2929 expanded diagnostics were not a pass. No new baseline, waiver or lowered threshold is introduced here.

## 2. Exact historical failure roster and planned coverage

Ratios below are copied from frozen classification, rounded to three decimals; no fresh renderer was run. All Manager rows have exact pair `extra-open-cheatsheet/active` and target `#btn-open-cheatsheet`.

| Theme / CSS file | Exact historical pair(s) | Historical foreground / fill | Ratio | Original batch / disposition |
|---|---|---|---|---|
| `ff8.css` | `hdr-random/rest`, `hdr-settings/rest`, `hdr-hide/rest` (3) | #E4ECF6 / #9FB2C8 | 1.822 | Completed5; bounded header fix below if reproduced |
| `persona-4.css` | `hdr-random/active`, `hdr-settings/active`, `hdr-hide/active` (3) | #1A1A1A / #27220F | 1.096 | Completed1; bounded active-only foreground below if reproduced |
| `ff6.css` | Manager link active (1) | #F2CB66 / #4A70D8 | 2.937 | Completed5; transparent active link below if reproduced |
| `ff9.css` | Manager link active (1) | #E6B84E / #4575B2 | 2.552 | Completed5; same bounded link treatment |
| `star-wars-rebel.css` | Manager link active (1) | #F29A52 / #5A6840 | 2.729 | Completed6; same bounded link treatment |
| `star-wars-republic.css` | Manager link active (1) | #8E1C1A / #5A0F0E | 1.544 | Completed6 light-theme link; preserve dark red on pale panel |
| `star-wars-separatist.css` | Manager link active (1) | #DDB77C / #EBD4A8 | 1.303 | Completed6; preserve tan on dark panel |
| `silent-hill.css` | Manager link active (1) | #6A5A4A / #B1A9A2 | 2.856 | Pending7 already specified; remeasure after7, no concurrent edit |
| `the-witcher.css` | Manager link active (1) | #C0A020 / #685111 | 2.989 | Pending9 functional table/state contract covers it |
| `wow-alliance.css` | Manager link active (1) | #2060C0 / #0E1D3E | 2.766 | Pending9 same |
| `wow-horde.css` | Manager link active (1) | #B81818 / #360E09 | 2.600 | Pending9 same |
| `ministry-of-magic.css` | Manager link active (1) | #007858 / #09241A | 2.993 | Pending10 same |
| `control.css` | Manager link active (1) | #CC1100 / #30120E | 2.993 | Pending12 same |
| `resident-evil.css` | Manager link active (1) | #BB0000 / #26080C | 2.773 | Pending12 same |
| `mirrors-edge.css` | Manager link active (1) | #E02020 / #D5BFC2 | 2.743 | Pending14 light-theme foreground/state contract covers it |

Count method:3 FF8+3 Persona4+13 Manager singles=19, fifteen distinct theme keys. Seven completed themes contribute **11 readings** (six header+five Manager); eight later themes contribute eight singles. The prior wording “six in completed batches” describes only six header readings and does **not** exhaust completed-batch acceptance debt. No target called `hotkey-input` appears in this nineteen-row list; its existing verification stays separate.

Later-batch implementation/QA records disposition for their eight assigned singles. If their new scoped palette/state implementation already passes, mark resolved by that exact pin/result and do not add a redundant override. If the **same** Manager link mechanism remains failing, the minimal link treatment below is available within that theme's existing batch scope. No editing later themes now or reopening unrelated approved art.

## 3. Minimal completed-theme fixes, conditional on fresh reproduction

Own source scope for a later separately briefed residual fix is **only** seven exact theme CSS files under `src/renderer/styles/themes/`: `ff8.css`, `persona-4.css`, `ff6.css`, `ff9.css`, `star-wars-rebel.css`, `star-wars-republic.css`, `star-wars-separatist.css`. No `base.css`, `manager.css`, `region.css`, renderer JS or checker/harness source mutation is required by this UX decision. No root token/palette sweep; theme art/background/title/fonts/labels/banner shapes/default colours/control geometry/tooltips/behavior remain approved.

### 3.1 FF8 — opaque local header-button rest plate

The historical pale functional foreground was sampled over very light underlying header paint (#9FB2C8). Current FF8 has approved icy gradient/sliver/border material; do not darken its whole header or move title/art. Give **the three exact region header controls** `#btn-random-theme`, `#btn-settings`, `#btn-hide` an opaque **rest-only #22395C plate** with existing approved foreground#E4ECF6. Scope selector to `body.region #header-controls` and `:not(:hover):not(:active)`; keep existing hover/pressed/focus colors/behavior and bounds. No new shadow/radius/padding/font.

This local dark blue is already FF8's tile/picker material, not a new aesthetic. Arithmetic foreground/plate9.751:1, **not a rendered pass**. Plate must cover only existing button box, not gradient header/control cluster gaps. Header menu fourth control and Manager controls are regression targets, not automatically added to the fix; if fresh evidence finds a different failure, report exact consumer/role rather than broadening the selector. Focus outline still≥3 and no art/hit rect change.

### 3.2 Persona4 — active-only yellow glyph on existing dark plate

Preserve yellow TV header/near-black rest text and current dark hover treatment. In the three exact region header controls above, **active-only** currently combines near-black glyph#1A1A1A with dark plate#27220F. Explicitly use **#F5D60A glyph on existing #27220F active plate** and yellow border where that existing state needs an outline. Apply when `:active` whether pointer hover is present or absent; selectors must survive current theme/region specificity. Rest stays black-on-yellow, normal hover remains approved. No whole accent/token change.

Arithmetic yellow/plate10.973:1, **not rendered QA**. Verify pressed=hover+active and active-only separately; keyboard activation is not identical to hover. Full shapes/text unchanged, no animation. Menu fourth control/regional title/focus and Manager states regression-only unless independently failing with scoped authorization.

### 3.3 Five completed Manager links — preserve link treatment while active

Current `.mgr-link` is transparent/underlined at rest and hover, but generic `button:active` adds `--btn-active-bg` while leaving the link's accent foreground unchanged. This causes the thirteen recorded Manager pairs. Minimal treatment for the five completed-theme rows is a **theme-local `body.manager #btn-open-cheatsheet:active` transparent background**, maintaining its existing accent foreground/underline and current focus indicator. Explicitly retain `color:var(--accent-text)` only if cascade requires it; do not change tokens shared with other controls. It remains the same keyboard-shortcuts link/tooltip/target/message/action. No global `.mgr-link` default sweep.

Proposed transparent-active colours versus their existing opaque panel (arithmetic only):

| Theme | Existing link ink | Existing panel | Calculated ratio |
|---|---|---|---|
| ff6 | #F2CB66 | #0B1034 | 11.872 |
| ff9 | #E6B84E | #2C201C | 8.516 |
| star-wars-rebel | #F29A52 | #231F17 | 7.438 |
| star-wars-republic | #8E1C1A | #F8F2E5 | 8.075 |
| star-wars-separatist | #DDB77C | #1B2026 | 8.694 |

Actual button inherited surface is measured, not assumed panel; if an ancestor/compositing differs, retain transparent link and measure its actual ground. Any necessary fallback is a scoped existing-theme text/ground pair, returned to Judy with exact evidence before acceptance. Do not change unrelated buttons' active fills. No conditional color based on diagnosis counts.

## 4. Floors, fresh baseline and exact state acceptance

Use existing unchanged production/original diagnostic floors and no baselines/allowances weakened. Frozen adapter classified `extra-open-cheatsheet` as `kind:'glyph'` at the established UI3:1 floor, but its actual visible KEYBOARD SHORTCUTS label is **ordinary text**. The committed live-state contract already requires ordinary text4.5:1, so record both: historical diagnostic comparison unchanged, and actual text ratio≥4.5. This is not a new threshold or permission to repair/reclassify checker source during this fix. Header icon glyphs≥3; all associated text/tooltip/status remains4.5. Existing focus≥3 and hit-area contracts unchanged.

Before changes, Ender/Futaba establish a fresh immutable pin with all current batch changes known, verify source/harness/runtime identity, and reproduce **exact nineteen keys/pairs with real reachable consumer selectors** plus rest/hover/pressed/active-only controls. Source selector/text/scene identity is captured; no deleted Settings overlay or proxy hotkey can stand in. Classify each historical row as still reproduced/resolved-by-current-pin/invalid-superseded-target, with evidence. Do not assume all19 remain or call7's active work faulty from stale data.

For a still reproduced completed row, apply only its approved minimal local treatment, then independently replay before/after:

- FF8 three controls rest/hover/pressed/active-only/keyboard-focus, actual grid/radial/Row/Column and default/near-fit/large geometry; opaque rest plate solves brightest underlying paint, no new art/hit/title defect. Associated labels/menu/control surfaces regression.
- Persona4 three controls full state matrix including active-only independent of hover, keyboard pressed state, yellow rest/dark active, all layouts/directions/sizes; pressed/readable focus target unchanged. No palette/title/art mutation.
- Five Manager links Regions/Settings routing/current Settings view, rest/hover/pressed/active-only/keyboard-focus, help open/closed, scrolled position, light Republic/dark others, actual ancestor surfaces/tooltip/target. Click handler/Enter/Space behavior unchanged in safe mocked fixture, no actual external/updater action.
- Eight later rows evaluated after their own batch pin; append exact resolution/refusal, no parallel edits. Live hotkey input rest/recording/error/clear remains ordinary regression because it was misnamed, not part of these13 targeted repairs.
- All101 standard unaffected original gate/state regression at unchanged floors; iteration method/key count recorded. Compare untouched theme hashes/palette/art/type and control rectangles. Do not rerun costly native/performance matrix or claim such clearance from headless proof.

Positive controls: restore FF8 transparent rest plate, restore Persona4 dark active glyph, restore generic Manager active fill in isolated copies; each must expose its exact targeted contrast failure. Misspelled selector/control omitted from measured consumer must fail target-identity oracle. Active-only probe must prove actual pseudo-state has active without hover; pressed proves both. No passing screenshots taken from helper overlays or theme proxies.

No new target below24px, no hit overlap/focus visibility regression; record actual rects/element-hit results. Keep existing fractional0.5625/1.171875px focus-border Minor/native away-window debt entirely separate; no scope to modify it here. No running QuickLauncher/signed-in browser/native input/display/scale/taskbar/sleep/app launch. Use existing isolated bounded safe fixtures and preserve all controls/denial stubs.

## 5. Delivery and disposition

Judy owns this doc only. Root routes residual implementation as a separate bounded stage after current Batch07 work as appropriate. Ender proposes exact seven-theme file changes only where freshly failing; Futaba independent pinned report lists before/after rows/count method, true target/state, actual pairs/floors, negative controls, unchanged baselines/hashes/art/layout and remaining native scope. Sully commits/pushes scoped doc/development changes; version1.94.3/no release/tag.

Acceptance is **nineteen historical rows explicitly disposed**, with no stale assumption/current false pass. Completing later batches alone leaves the eleven completed-theme readings needing verification/disposition. No new art redesign, palette sweep, extra features or source checker repair is authorized. STOP/report a different failure/source surface rather than widen this bounded task. No open aesthetic decision remains for the proposed minimal fixes.
