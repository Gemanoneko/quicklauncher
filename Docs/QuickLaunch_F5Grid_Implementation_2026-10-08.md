# F5 and Grid art scrolling implementation — 2026-10-08

Ender. Version1.94.3; branch wip/regions; source HEAD a9dca586251baf0f9381c0d97babcbc291fde5fb. Two separately reviewable changes; no merge, bump, release or implementation commit performed.

## F5 root cause and implementation

Updater messages were delivered only to the primary region page; a Row draws no update banner, and the Manager had no download/install state or route. Main now holds a copy-safe offer/check state, pushes events to the existing primary and the Manager, and answers the Manager's opening fetch. No state replay to rebuilt/new primary is added (excluded optional offer).

Files: src/main/updater.js (state, guarded commands, fetch/push); src/main/index.js (Manager target and menu state accessor); src/main/ipc.js (test hook routes through same published state); src/main/manager-preload.js (fetch, push, download/install allowlists); src/main/regions/controller.js (update menu item); src/renderer/manager.html, src/renderer/manager.js, src/renderer/styles/manager.css (committed F5 strip/status/table); src/renderer/banner-layers.js (progress disables DOWNLOAD); test/regions/updater-route.test.js (isolated production logic tests).

Cross-boundary literal consumers: manager:update-state → updater sender, Manager preload allowlist, Manager renderer listener. get-update-state → updater invoke handler, Manager preload allowlist, opening renderer fetch. publishUpdate → IPC guarded test hook and updater publish record. getUpdateState → updater export, index/controller menu callback. Existing download-update/install-update channels → updater guarded handlers, Manager preload and click routes, existing banner consumers unchanged. Existing check-update → IPC/checkForUpdates with guard.

Tray route F5.7 and all3 optional offers remain excluded. Banner dismissal changes tray dot only; strip/menu continue from main state. Existing tray-dot event rules stay unchanged.

## Grid root cause and implementation

Decorative pseudo-elements lived inside the scrolling field, expanding the scroll range despite fitting tiles. Only src/renderer/styles/region.css appended Grid rules change: field clips decoration, tile list owns scrolling, visible thumb; padding follows var(--grid-pad), align-content:start preserves intrinsic row height per committed Docs/QuickLaunch_GridScroll_UXClarification_2026-10-08.md. Column/Row declarations and theme files unchanged. Stable4px gutter can alter column count at wrap thresholds: QA must measure this; horizontal rectangles are not claimed unchanged.

## Checks and limitations

Plain Node production-logic focused tests:7/7 (node:test test count), including12 menu layout/state cases; full pre-pin regression217/217 before the seventh menu test was added; final pinned run reported separately. Positive controls: removed download guard yields2 updater calls instead of1; progress during covered banner disables DOWNLOAD. Mocked Electron/updater/IPC; no network downloads/install, product launch, native desktop host, real input, visible window, signed-in browser, display/taskbar/scale change or sleep performed. Syntax and git diff --check pass at pre-pin read-back.

Shared qa-handoff entry checker audited: package declares none of its5 candidate scripts. Actual invocation BLOCKED before execution by P9:long-command-timeout requiring timeout:600000; exec_command schema lacks timeout field. No receipt fabricated or hook bypass performed. Independent QA may test this pinned snapshot with the entry limitation explicit. Offscreen runtime/render acceptance, real input, Row-only/primary-Row actual-window route, region menu on screen, all-theme dimensions/contrast, scrolling/focus/wrap thresholds and packaged lifecycle are NOT PASSED here.

Snapshot: C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-ender/f5-grid-pin-1. Full SHA256 manifest outside snapshot at C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-ender/f5-grid-pin-1-manifest.json; every copied file re-read and hash compared to source. Node-only command: node --test test/ from snapshot; focused command node --test test/regions/updater-route.test.js. For any Electron renderer-only harness, first audit isolation/uncaughtException guard and use offscreen show:false focusable:false no real main/hosts, no network or user profile. Do not execute product selftests under current machine restrictions.
