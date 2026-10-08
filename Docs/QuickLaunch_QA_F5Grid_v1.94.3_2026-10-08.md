# QuickLaunch F5 update route and Grid art scrolling QA

Futaba, 2026-10-08. Development version 1.94.3, regions branch. This report certifies the pinned files below, not the running installed QuickLauncher, merged theme branch or packaged release.

**Verdict:** NO-GO

This is **no overall handoff/release clearance**: the required shared entry receipts are unavailable and real-input/lifecycle acceptance remains pending. Independent safe development checks **PASS** for F5 and the corrected Grid implementation on pin3. No remaining new product Blocker or Major was found in this bounded pass. The Grid Blocker found on pin2 and F5 tooltip Minor found on pin1 were corrected and independently verified on subsequent immutable pins.

## Pins and receipt limitation

Snapshots under `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-ender/`:

| Snapshot | Recorded source HEAD | Independent SHA256 checks |
|---|---|---|
| f5-grid-pin-1 | a9dca586251baf0f9381c0d97babcbc291fde5fb | 177/177 files match |
| f5-grid-pin-2 | a9dca586251baf0f9381c0d97babcbc291fde5fb | 178/178 files match |
| f5-grid-pin-3, final | f8ea307e3157c93d9e073c911bd3d3071686aafa | 179/179 files match, checked before each final render |

Every pin has its sibling `-manifest.json`, containing full per-file SHA256 values. These are source HEAD plus pinned uncommitted implementation snapshots; neither correction has an implementation commit yet. Regression verification is anchored to these exact hashes, not an assumed fix commit.

Manifest comparison pin2→pin3: only `src/renderer/styles/region.css`, the committed Grid clarification and the new overflow implementation report differ. All F5 source/test hashes are identical, so valid pin2 F5 renderer evidence carries forward to pin3. Pin1→pin2 corrected the F5 disabled-control helper to set `aria-label` alongside `title`, with supporting tests/report.

Skill read: `.agents/skills/qa-handoff/SKILL.md`. Actual checker: `.agents/skills/qa-handoff/scripts/run_entry_checks.mjs`; the skill's `.Codex/skills` path is stale. Package declares none of its candidate `pre-qa`, `post-build`, `check-electron`, `check`, `test:smoke` routes. This was audited; no substitute receipt was constructed.

**Sender receipt: unavailable. Receiver receipt: unavailable.** Both actual invocations were blocked before execution by `P9:long-command-timeout`, which requires `timeout: 600000`. The available `exec_command` schema has no `timeout` field. No hook bypass occurred. The receiver attempted the checker on pin2 and independently observed the same rejection.

There is a second identity caveat: `git rev-parse --show-toplevel HEAD` inside pin3 resolves the ancestor theme checkout `WIP/QuickLaunch` at `8de41d52e3ed1ad08b2e83ce727462ac3842cc08`, not source regions HEAD `f8ea307`. The checker currently derives HEAD from cwd Git ancestry, so repairing the timeout hook alone would still produce the wrong snapshot identity. The manifests provide the verified identity used in this report.

## Machine boundaries and harness

No product main process, native region host, tray, installed QuickLauncher, real user store/Desktop, real updater download/install, signed-in browser, visible window, real mouse/key input, display/scale/taskbar change or system sleep was used. Existing product selftest/crash routes were excluded because they launch product main/hosts.

Own scratch: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-futaba/`. Harness files `run.cjs`, `main.cjs`, `preload.cjs` were parse-checked with plain Node before first launch. The Electron harness imports Electron and scratch helpers only; product renderer files are loaded with mock IPC. Product main/updater code is not executed by this renderer harness.

Guard audit: fatal exception/rejection handlers log and exit without dialogs; scratch-only profile and app name; windows use `offscreen:true`, `show:false`, `focusable:false`, `skipTaskbar:true`; window show/focus, app focus/login items, global shortcuts, dialogs and shell launch APIs are counting stubs. All 24 stubs were positively invoked before measurements, then counts reset; final stub identity checks held. Audio is muted, remote hosts unresolved, requests allow only pinned renderer files/data, popups/navigation/webviews and permissions are refused. No browser is spawned. Internal watchdog 590s, launcher watchdog 600s; all runs ended normally and destroyed their own windows. No forced termination was used as shutdown evidence.

Every completed valid renderer run reports **0 guarded unsafe calls, 0 renderer errors, stubs intact**. Offscreen programmatic DOM focus and hidden-window content sizing are renderer tests, not real-input/display tests. Waits synchronize render frames/CSS transitions; no system sleep/resume occurred.

## Reproduced checks and method

| Check | Result | Method / positive control |
|---|---|---|
| Pin1 Node regressions | 218/218, 0 skipped | Plain Node from immutable pin, existing dependency path only |
| Final pin3 Node regressions | 220/220, 0 skipped | `NODE_PATH="C:/Antigravity Projects/QuickLaunch-regions-spike/node_modules" node --test test/`; no install |
| F5 main offer, guarded download/check/install, dismiss behavior | Included in focused 9/9 tests in final suite | Production updater evaluated with mocked Electron/updater; removing download guard produces 2 calls instead of 1 |
| F5 region menu route | 12/12 layout/offer cases in one test | Grid/Column/Row × none/available/downloading/ready; label immediately above Settings, click opens Manager Settings; no native popup |
| F5 title/accessible-name correction | Exact 3 strip + 4 Check state pairs pass | Omitted-assignment positive control is detected by the test |
| Real Manager layout/state attributes | 2,828/2,828 states pass | 101 themes × 560×560/440×420 × Regions/Settings × 7 states; 0 overlaps, outside controls, failed centre hit-tests, clipped strip text or title/aria mismatches; button 24px high |
| Manager normal text contrast | All measured visible text ≥5.452211:1 | Resolved engine colors flattened through ancestor surfaces; minimum silent-hill status; deliberate lcars broken strip produces an observed text/button intersection |
| New strip hover surface contrast | 101/101 ≥5.2004998:1 | Actual `--btn-hover-bg` applied in renderer without pointer input; minimum mordor, matches Judy's measured floor |
| Grid paired geometry | 689 paired states, including 36 empty states; all nonempty heights match baseline within 1px | Representative cyberpunk/lcars/alien/ghost-shell/akira/dune × icon32/64/128 × height300/520 × count3/12/50 × view/edit/filter/notice; longer final label; every measured consecutive row gap 8px |
| All-theme overflowing Grid | 101/101 baseline height comparisons pass | 50 tiles, icon64, 424×300 in all themes; corrected rows remain intrinsic |
| Overflowing 50-tile list | 329/329 cases have positive tile-list scroll range | Matrix view/edit/notice, width thresholds and all-theme cases; decorative/empty-hint field ranges were not substituted for content overflow |
| Wrap thresholds | 120/120 width cases retain access and baseline row heights | Six themes, widths319–424 including340–356 sweep around 2↔3 columns; stable gutter may change column count, accepted by spec |
| Final-tile programmatic focus | 216/228 whole-border reads pass; remaining 12 exactly reproduce baseline fractional edge | All fieldScroll values 0; settled focus-only rerun compared old field viewport against new tile-list viewport; see Minor note below |
| Variable padding | 12/12 settled mutations read 20px | Set tile-list `--grid-pad:20px`, observe after250ms; immediate reads during `transition:0.01s` were discarded |
| Known-bad Grid detector | FAIL observed | Inline `grid-auto-rows:auto` reproduces 12px clipped rows; pin2 failure recorded independently before correction |

The initial all-theme Manager attempt is **invalid and excluded**: the QA mock omitted `strings.lastRegion` and theme/count data, causing 202 renderer errors and undefined text. Its immediate PNG captures also showed stale states. This was a harness failure, fixed with the complete schema and two animation frames plus200ms before capture. Valid rerun has 0 renderer errors. Failed evidence remains in `results.json`; it is not counted as product acceptance.

State transitions/duplicate commands are tested with mocks; this pass does not claim actual native-window Row-only/fallback routing or real download/install. The Manager status line is measured in current/check/error states, including164-character error wrapping; no actual updater service was contacted.

## Findings and regressions

1. **Blocker B-1 — overflowing Grid rows shrink and hide shortcut labels. FIXED in pin3.** Repro pin2 at424×300,12 tiles: tile height37px versus old95.390625px;50 tiles:12px versus95.390625px. At424×520,50 tiles:15.515625px versus95.390625px, no scrolling. The initial isolated pass covered cyberpunk and alien across3/12/50×300/520:12 comparisons. Screenshots show icons as slivers. `align-content:start` only prevented spare-space stretching. Judy's committed correction atf8ea307 adds intrinsic `grid-auto-rows:max-content`; Ender implemented it in pin3. Independent paired geometry, overflowing-list measurements and rendered screenshot verify correction. No fixed pixel row height was introduced.
2. **Minor m-1 — new F5 tooltips lack matching aria-label. FIXED in pin2; carried to pin3.** The disabled helper set title only. Committed F5 measure10 requires title=aria-label in each new/dynamic state. Initial attributes were null; final220-test suite and2,828 rendered states verify exact parity.
3. **Minor m-2 — pre-existing fractional focused-tile border clips at the bottom edge. DEFERRED, outside this correction.** Twelve near-fit notice cases have bottom edge0.5625px or1.171875px beyond the scroll viewport after production `.focus()`; the exact same excess is measured on baseline in12/12 comparisons. Label/icon contents remain reachable; only the strict whole-border detector fails. No new clipping regression or art scrolling occurs. This note is not converted to a full focus GO without real-input acceptance.

Known preceding Majors remain **unfixed/not rerun here**: fallback F-2 pixel detector timing and gallery self-test. TrayF5.7 and three optional F5 offers remain excluded/unanswered. No merge-conflict resolution, M5 work, theme batch work, bump or release was performed.

## Visual evidence

Final synchronized Manager captures, pin2 (F5 bytes unchanged in pin3):
- `manager-manager-settings-available.png`, `manager-manager-settings-ready.png`, `manager-manager-settings-error.png`.
- `manager-manager-regions-available.png`, `manager-manager-regions-ready.png`, `manager-manager-regions-error.png`.

Root independently inspected AVAILABLE/DOWNLOAD, READY/INSTALL NOW and long error with visible Check/Close. Corrected Grid `gridmatrix-corrected-overflow-cyberpunk.png` shows normal icons/labels, last tiles reachable, notice/footer retained; root independently inspected it against the failed sliver capture. Failing pin2 evidence: `gridbug-fixed-overflow-cyberpunk.png`; pre-fix baseline: `gridbug-baseline-overflow-cyberpunk.png`.

All paths are under the Futaba scratch directory named above. Machine-readable results: `results-manager.json`, `results-hover.json`, `results-gridbug.json`, `results-gridmatrix.json`, `results-focus.json`, `results-focusactual.json`, `results-baselinefocus.json`. Suite logs are adjacent under `WIP/QuickLaunch/scratch/2026-10-08-futaba-suite[-pin3].log`. No claim rests on the initial unsynchronized PNGs.

## Pending checks

Pending next fresh timed away window: real pointer/keyboard/menu flow, actual Row-primary and Row-only Manager route, actual fallback route, focus/navigation/scroll gestures, installed/packaged lifecycle and tray Quit; remaining startup-bounds real-input checks carried from the recap. Display/scale/taskbar checks only inside that fresh window with restoration. Sleep/resume remains prohibited. No checks are assigned to Sergei as QA steps.

Native updater integration/download/install and source-accurate matching shared receipts remain unverified. This report supports a development milestone review only; it must not be parsed as GO or release clearance.

## Pattern alerts and disposition

- **Immediate offscreen captures/style reads can certify the wrong frame. FIX applied to this pass's QA harness:** complete mock, animation-frame/paint settling, observed state screenshots, and rejected invalid prior evidence. No product patch requested for the harness mistakes.
- **Automatic Grid sizing needs both sparse and overflowing positive controls. FIX applied:** pin2 regression was caught; committed acceptance now includes3/12/50, multiple heights/sizes, preserved intrinsic rows and known-bad auto tracks.
- **Entry gate incompatible with execution schema and snapshot ancestry. DEFER:** explicitly escalated to Jane; no operational-hook/checker work is authorized in this brief. Shared receipt remains missing, and overall clearance remains withheld.
- **Previously reported QA-tool Majors recur as incomplete gate evidence. DEFER:** fallback pixel check and gallery self-test remain separately logged; approval to fix is not assumed.

No source changes, commits, pushes, tags, merge or release were performed by QA.
