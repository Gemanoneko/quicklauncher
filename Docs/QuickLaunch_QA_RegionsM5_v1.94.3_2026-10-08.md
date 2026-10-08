# QuickLaunch Regions M5 QA — 2026-10-08

**Verdict:** NO-GO for formal handoff, full dogfooding or release. **Safe development acceptance: PASS** for the implemented Fan/Ring scope below. Version remains 1.94.3; no release clearance or merge clearance is implied.

## Identity and scope

- Source: `scratch/2026-10-08-qa-tools-ender/m5-pin-1`, source HEAD `72dd04d99c1912729cd11f85d1a2930a20fb5620`, dirty=true, 186 manifest files.
- Harness: sibling `m5-harness-pin-1`, 122 manifest files. Independent initial and final SHA256 verification: 308/308, zero mismatches. All 114 renderer files in harness match the full source pin.
- Specs: committed M5/tray/options spec at 3e38436, empty-Fan correction 327ebed, busy-refusal correction 72dd04d, plus existing Regions UX/technical plan. Q2 impossible-fit policy is excluded and still awaiting Sergei.
- QA executed only own copied harness under `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-m5-futaba/m5-renderer-qa`; immutable sources and shared working tree were untouched.

## Independent acceptance

| Check | Pass / total | Method |
|---|---:|---|
| Explicit safe Node allowlist | 174 / 174 | Twenty audited pure/mock files; excludes native mover suites and tryit CLI. |
| Independent geometry oracle | 553 / 553 | Exact 22 committed S64 table rows; counts 0–10/12, three sizes, all Fan directions; empty→first equality, mask containment, rounded pair gaps, 24px margins and non-monotonic cap scan. |
| Rendered geometry and states | 1223 / 1223 | Actual DOM chip/hub rectangles equal verified geometry for all counts/directions/sizes; filter dim/focus, navigation, queued notices, chip rename, reset and 202 theme-control cases. |
| Focused renderer checks | 71 / 71 | Valid/refused preview, cancellation, rename return modes and known-bad shifted-hub control. |
| Busy refusal matrix | 16785 / 16785 | 101 themes × Fan/Ring × view/edit/filter/region rename/chip rename × three refusals, plus completion, announcement and expiry controls. |
| Narrow follow-up | 55 / 55 | Fifteen empty previews retain exact slot rectangle and hide hints; cancellation restores; max Fan10/Ring12 direct DOM all-pair gaps; precisely measured normal/busy captures. |

Rounded axis-aligned chip rectangles have at least 6px separation on one axis for every pair in every verified geometry. This is a rectangle test, not a Euclidean centre-distance test. Rendered rectangles exactly match those geometries; maximum-count DOM spot checks independently confirm it.

Controller/mover mocks cover pivot-preserving conversion/direction changes, prospective growth before mutation, deduplicated adds, orphan-adoption guard before metadata/journal/store access, cap/no-room refusal, renderer-save refusal, move out/back, preview rollback and successful preview commit, completed refusal before leave, menus and shape failure closing the mocked host. Real native operations are not certified.

The refusal matrix measures visible two-line heading, glyph clipping, 56×22 band/circle containment, 2px clearance, unchanged controls/focus/values/hit targets, title/status, leave restoration and eight-second completion expiry across mode transitions. There are 2,424 contrast pairs (4,848 white/black measurements); minimum **5.098951:1**, above 4.5:1.

## Controls, guards and evidence validity

Known-bad controls detected hidden refusal headings, shifted hub geometry, rectangular corner coverage, duplicate announcements, missing completed phase and actual orphan-adoption guard removal reaching forbidden mocked metadata. Fixed-table disagreement is also rejected by the independent oracle.

Ender's original 16782/16783 result is preserved: its only failure assigned identical status text and therefore did not create a Chromium mutation. Our QA copy changes then restores text; the complete independent run passes, including this positive control. No pinned product logic changed.

Our first empty-preview assertion incorrectly required `.drop-slot`; empty preview reuses `.empty-cell.as-slot`. The failed 38/53 evidence is preserved as `extra-failed-selector-results.json`; corrected assertions verify actual rects, hint visibility and restoration, passing 55/55. Initial geometry captures show queued notice, and initial `busy-*` captures were taken after exitEditMode; they are not normal/busy visual evidence. Corrected captures below replace those labels without deleting prior evidence.

Fatal handlers precede Electron import. All windows were hidden, offscreen, unfocusable and taskbar-excluded; scratch profile, muted audio, denied external windows/network/permissions, renderer-only file allowlist. All 24 forbidden show/focus/dialog/shell/login/hotkey stubs were exercised before testing and remained intact. Each renderer run reports zero unsafe guard calls and console errors, all harness windows destroyed, and normal exit. This proves harness closure, not the unrun product Quit flow.

## Findings and pending work

No new product Blocker/Major/Minor was found within tested scope. QA setup/capture errors above are resolved and retained transparently.

- Formal entry receipt remains missing: qa-handoff actual entry script is blocked by legacy P9 timeout hook demanding an unsupported exec timeout field; nested snapshot Git ancestry also cannot name the regions source HEAD. No bypass, fabricated receipt or checker repair was performed.
- Q2 remains pending: a populated radial region becoming impossible to fit after global icon-size/work-area changes. No fallback policy is approved or cleared here.
- Native shaping/click-through/z-order, real menus/input/drop/file operations, primary-host lifecycle/rebuild, product close/quit, display/scale/taskbar and real-use dogfooding remain unrun under the current no-away-window restrictions.
- Pattern alert: stale/wrong-state QA captures and selectors can mislabel evidence. Disposition **fix**: capture after explicit measured state plus settled frames, keep failed evidence, and separate harness findings from product findings; applied here. Formal receipt limitation remains **defer**, owned by Jane/Ender for an authorised tool-compatible route.

Detailed counts/raw measurements and final immutable readbacks: `scratch/2026-10-08-m5-futaba/m5-final-summary.json`, `m5-node.log`, `m5-oracle-results.json`, `m5-geometry-results.json`, and `m5-renderer-qa/{results.json,busy-results-all.json,extra-results.json}`.

Corrected screenshots (absolute base `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-m5-futaba/m5-renderer-qa/`): `normal-fan.png`, `normal-ring.png`, `actual-busy-fan.png`, `actual-busy-ring.png`. Busy captures record edit=true, heading=true, NOT A/SHORTCUT, and three 24px edit controls before two frames plus 250ms settling.

Jane independently visually audited the four corrected captures: normal Fan/Ring centres and chip arrangements match the claimed state; busy refusal replaces the upper heading/icon while edit cluster and menu remain visible. This is bounded screenshot acceptance, not real-input/native clearance.
