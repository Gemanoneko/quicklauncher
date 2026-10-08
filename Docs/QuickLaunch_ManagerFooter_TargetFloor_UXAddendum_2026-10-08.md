# QuickLaunch Manager footer — existing target-floor addendum

Judy · 2026-10-08 · **Bounded shared correction for the existing24×24 CSS-pixel target floor. Commit before code briefing.** This adds no control, feature, copy, font, palette, route or interaction. Judy changed this document only; no source/app/test/native input/display/git/version/release changes.

## 1. Authority and actual evidence

The original WCAG/ProcessRules hit-area contract and committed Batch07 §8 require measured targets≥24×24 and diagnosis of smaller controls before a shared resize. Futaba found the concrete issue and diagnosed it; this addendum authorizes the minimal exact shared Manager-footer treatment rather than silently changing themes.

Futaba's final immutable Batch07 source-pin2 manifest: `78ccc60d2d250e4ae903690cfc26eb0762c67b242c0596ebecaf7e032220f463`. Existing evidence under `WIP/QuickLaunch-integration/scratch/2026-10-08-theme07-futaba/candidate-final/` was read, not rerun:

- `states-results.json` SHA256 `af3c6f002aa50ce4f1e4ff0bcca735d7b901d36520ea211f805f2aed58b4f6ed`:203 scenes/655 assertions,606 pass/49 required-control-target flags.
- `footer-baseline-results.json` SHA256 `38831d4d345e4f5ab86afbad011c2781a2a06b1cdc2d21a865d2018a30df0d31`: same committed baseline measured before candidate.

Exact candidate footer controls:

| ID / visible copy | Candidate border-box | Center hit | Current typography |
|---|---|---|---|
| `#btn-check-update` / CHECK FOR UPDATES |141.296875×23px |valid | Segoe UI11px normal; padding3px9px |
| `#btn-close-settings` / CLOSE |56.328125×23px |valid | Segoe UI11px normal; padding3px9px |

Both controls are1px below the existing floor; a valid center hit does not waive height. Baseline six themes had20px height and Event Horizon23px; the approved functional Segoe UI body treatment improves six to23, **not a target regression**, but does not complete accessibility. Counts are7 themes (`amnesia`, `lovecraft`, `event-horizon`, `blair-witch`, `silent-hill`, `tiny-bunny`, `alan-wake`)×7 exact Options states=`49` flagged assertions. Each assertion contains both undersized footer buttons, so do not call49 the number of distinct buttons.

Exact state names: `options`, `hotkey-recording`, `hotkey-error`, `hotkey-cleared`, `icon-size-refusal`, `update-offer`, `update-error`. Other measured control/color/radial/empty/direction/size/hit checks passed within their documented scope. No fresh acceptance is claimed by this spec.

## 2. Exact UX decision and implementation boundary

Apply the existing **minimum24×24 CSS-pixel border-box/hit target** to **only these two buttons in the actual Manager footer**:

- `body.manager #mgr-footer #btn-check-update`
- `body.manager #mgr-footer #btn-close-settings`

Ender owns the smallest shared Manager CSS implementation (normally `src/renderer/styles/manager.css`) and technical choice, not Judy. Use a **minimum**, not a fixed width/height: controls currently24px or larger must keep their natural dimension; no shrinking/widening of normal content. A23px button grows by the missing1px;20px legacy controls by4px where still applicable. Width already exceeds24 in current evidence; minimum-width24 is a safety floor, not a new common button width.

The **button itself** must own the enlarged hit/border box. A wrapper, invisible overlapping pseudo-element or an enlarged reported rectangle without real hit coverage is not sufficient. Do not expand into another control/content region. Preserve centered glyph/text alignment within each button using existing behavior; no body-font/type/padding rewrite to force the measured value.

Preserve exact existing labels/tooltips, font family/size/weight/tracking, colours/theme tokens, borders/radius, focus appearance/outline route, hover/pressed/disabled/busy/error states, keyboard order and updater/close semantics. No test may invoke a real updater/download or close Sergei's running launcher. No new tooltip is required because no control is created; the existing tooltip remains attached.

Scope is **all101 themes using these two shared Manager-footer targets**, because target geometry is shared. It is not permission for a global `button` rule, all Manager controls, region/other dialog footers, checker floors, theme palettes or font/style sweeps. Theme CSS/source-pin history stays unchanged; create a separate immutable post-fix candidate, do not overwrite the final failing pin/evidence. Do not use this change to repair unrelated historical contrast or fractional focus-border findings.

## 3. Footer and responsive behavior

Keep existing pinned-footer layout: `#mgr-body` flexes/scrolls; `#mgr-footer` remains `flex-shrink:0`, right-aligned, with current wrapping/gaps/padding and theme panel ground. The extra necessary target height is absorbed by the body's available scroll height, **not by hiding footer, allowing viewport overflow or covering the last form row**. Footer action order remains CHECK FOR UPDATES then CLOSE, including existing wrapped order/right alignment.

At production Manager minimum **440×420**, normal fixture size **520×760**, and supported larger/responsive sizes, both buttons entirely inside window and footer, never overlap each other/body/scrollbar, full label visible, no new horizontal overflow or body row obstruction. Larger existing theme font/control dimensions remain natural. Do not introduce a breakpoint, footer relocation or new wrapping behavior; only existing minimum-target geometry changes.

Keep focus outline fully visible within permitted paint bounds; it may deliberately surround its own button but cannot cover another target. The no-covering rule is measured, not eyeballed. Native display/scale testing requires a fresh away window; headless simulated raster scales are not permission to change OS settings.

This is a routine completion of an already approved floor (WCAG/Fitts), preserving familiar Windows footer actions (Jakob/Fluent), not a new product/design decision.

## 4. Required acceptance

Ender runs bounded existing safe fixtures from a new source pin; Futaba independently verifies its exact source/harness/runtime identity and actual consumer selectors. Record before/after rectangles and actual element hits, not only CSS declarations. Preserve failed evidence.

1. Reproduce exact two controls/23px gap on the unchanged final candidate first. Apply only approved selector minimums; new seven-theme Options-state matrix passes with actual border-box width/height≥24, center and safe inset-edge hits returning the real button/descendant, visible text/tooltips and unchanged action endpoints.
2. Revisit all7×7 flagged states listed above, including update-offer/error, hotkey capture/error/clear, refusal and ordinary Options. Validate rest/hover/pressed/active-only/keyboard-focus/disabled-or-busy where reachable. No real updater side effects. No source/controller/host behavior modification.
3. Iterate exact catalogue keys all101 at production440×420,520×760 and a supported larger/responsive Manager size. Count method/theme membership recorded. Existing≥24 dimensions unchanged; smaller ones reach24; long label/theme-font widths/row-wrap behavior remain existing and fully reachable. Light/dark themes preserved.
4. Actual target/paint/hit rects: both controls and footer fully within window, same-plane overlaps0, no label clipping, existing focus outlines visible, scrollbar/body/footer clear. Compare body scroll range/last row reachability; necessary added footer height is accounted for, not mislabeled a renderer regression.
5. Contrast unchanged original floors: normal text≥4.5, focus/control glyph/border/action non-text≥3 on actual fills for the changed targets and states. The size fix does not lower/rebaseline/exempt any pair or claim inherited unmodified themes newly clear all contrast.
6. Regression existing tab order/Enter/Space/Escape/cancel/close routes via guarded mocks; no input theft/focus loss, header art/shape/title/Manager-tabs/state mapping unchanged. Region footers/help/picker/other Manager controls are untouched; no broad regression rerun without a new finding.

Negative controls: remove the minimum rule in an isolated candidate copy to restore the undersized target and fail the real dimension oracle; wrapper-only/pseudo-hit expansion must fail button-border-box/edge-hit checks; target selector typo must fail actual required-target identity. Do not modify checker thresholds to accommodate1px. Record returned actual rect measurements before claiming a pass.

## 5. Delivery and exclusions

Own source scope is one bounded Manager CSS change for two selectors plus unique implementation/QA reports. Root routes Ender after Sully commits this exact spec; Futaba independently certifies safe scope, Sully publishes exact development result. No theme source/other finalized spec/source-pin rewrite, font/asset/new feature, native app/browser/input/display/scale/taskbar/sleep, global hook/guard/tool repair, git by Judy, version/tag/release. Version1.94.3 remains.

STOP/report if a minimum-only two-target correction needs a footer rearrangement, shared typography change, overlapping hit expansion, actual product-route change or floor waiver. Otherwise carry through the approved original floor autonomously. No open UX choice remains; native/packaged/real-input acceptance and unrelated fractional-border debt stay pending separately.
