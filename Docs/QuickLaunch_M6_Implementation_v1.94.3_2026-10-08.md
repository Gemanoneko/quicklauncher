# QuickLaunch M6 cleanup implementation

Version 1.94.3; branch codex/regions-themes-integration. Base HEAD: 98dd1049bd6361472f6a10b80446464473183969. This completes the authorized M6 code cleanup, not M6's native performance, packaged-build, security-product, full release or real-input acceptance. No commits, pushes, version changes or releases were performed by Ender.

## Changes and consumer contract

The region page no longer contains the unreachable Settings, skin-list, cheat-sheet or installed-picker overlays. Their cached DOM references, input/control listeners, search-only table/functions, hotkey-recording code and overlay-only Escape branches were removed from app.js. The region still applies icon size, effective theme, reduced motion, banner quotes and radial geometry; it retains filtering, tile navigation/editing, updater offers and installed-shortcut icon refresh. Region capture already handles `?` before the app router and opens Manager, so no replacement user interaction was invented. Region Escape still clears filter before ending edit mode and does nothing when neither layer exists.

Literal live routes and consumers:

- src/renderer/app.js: btn-settings invokes region:open-manager with settings; btn-add-installed invokes the same channel with picker; random theme still saves region settings; get-installed-apps still refreshes existing installed-shortcut icons; banner consumers retain check/download/install/update events.
- src/renderer/region.js: the captured help key invokes region:open-manager with cheatsheet; native region commands and installed edit cluster preserve their existing Manager routes.
- src/main/preload.js: only add-app-from-appid, set-auto-launch, apply-global-hotkey and get-global-hotkey-status were removed from the region invoke allowlist. Manager's separate preload and all its global controls remain unchanged.
- src/main/ipc.js: the one unused generic add-app-from-appid registration was removed. entryFromAppId remains live through manager:add-installed, which passes its validated entry to ctl.addItems. All current scoped region/Manager, global settings, updater and installed-icon handlers remain.
- src/renderer/theme-names.js: the single 101-key display-name catalog is loaded by both index.html and the existing manager.html. Region random-theme ordering, Manager rows/search/tooltips and gallery metadata consume that actual loaded catalog. The only stale label changed is STAR WARS: OLD REPUBLIC to the already approved STAR WARS: GALACTIC REPUBLIC, under pushed studio ruling d195930ab0bf604e87f0ec3461b4d4466fc448a7. Storage key star-wars-republic and the other 100 labels are unchanged.
- scripts/theme-gallery/main.cjs: metadata prefers window.QL_THEME_NAMES; lexical THEME_NAMES is a fallback only for historical snapshots lacking the shared file. The startup contract requires set-auto-launch only from Manager, not the deliberately narrowed region preload. Guarded current scenes still reach the real Manager. Legacy overlay scene strings remain solely to support actual old --ref snapshots; they are not current production overlay consumers.
- src/renderer/styles/base.css: only the dead scroll-panel wrapper rules and unused theme-picker wrapper rule were removed. Manager's live overlay-panel, titles, controls, inputs, list, cheat-sheet and picker styles remain. No palette, theme CSS, art, fill, focus outline, dimension or contrast floor changed.
- scripts/check-theme-contrast.js: the actual audit adds --text on --panel-bg at the existing 4.5 normal-text floor and existing panel compositing method. Theme and hover baselines are unchanged; no rebaseline was run.

## Verification

The explicit 26-file pure/mock allowlist passed 239/239 at pin1, with zero failures, skips or cancellations, in 5.669 seconds. Final pin2 differs only in src/main/ipc.js and test/integration/m6-cleanup.test.js: it removes the final genuinely dead registration and adds the actual Manager handler test. The final affected suite passed 19/19 (12 M6 tests plus seven ported preservation tests), with zero skips/failures, in 85.334 milliseconds. The full allowlist was not redundantly rerun by the sender after that two-file delta. Pin1 and pin2 are retained with exact separate identities.

Meaningful new controls exercise the loaded shared catalog and missing script, Manager consumer and legacy-only gallery fallback, restoration of a removed region privilege with a valid fake main reply, preserved actual Manager add-installed forwarding and its missing-handler mutation. The real linter function rejects white text on a white panel; changing that pair's surface to the dark background or omitting the pair makes the intended assertion fail. One initial omission fixture left an array hole; its comma removal was corrected before the focused pass. No production threshold or method was changed to make it pass.

Static contrast checked all 101 themes: zero errors and 32 unchanged legacy warnings. Actual guarded gallery self-test passed two themes with six pixel-identical repeat captures and all 13 positive controls. All 23 denial stubs remained intact; intended login-item, outside-allowlist and network-block controls fired, with no real action. Nine owned processes started and zero remained; runtime 17.2 seconds.

The unchanged 38-pair actual region/Manager hover gate passed 3838/3838 across 101 themes, zero errors or grandfathered entries, in 49.1 seconds. All four original known-bad controls fired. All 92 isolation stubs remained intact; 126 owned processes started and zero remained. No unexpected IPC, owned sockets or registry changes occurred. Settings, skin picker, cheat-sheet and installed picker remained reachable through actual Manager routes after the region overlays were deleted.

Frozen-source gallery consumer checks passed 16/16: four narrowed region channels, unchanged Manager contract, required-channel mutants, 101 canonical labels, metadata precedence, legacy fallback and missing catalog. Pure Manager forwarding checked three renderer-ready/show-view endpoints plus six allowlist/unsubscribe assertions. Omitting forwarding rejected all three endpoints while retaining the guards. One initial scratch VM needed inert process.argv; only that fixture was corrected. No Electron was used for these pure controls.

Final pin2 has all 138 renderer files and gallery sources byte-identical to the tested pin1, so renderer evidence carries by hashes. The inherited 19 diagnostic contrast findings from integration remain deferred; this cleanup adds no waiver and claims no remaining theme pass. No unaffected Grid, radial, Q2 or display matrix was repeated.

## Immutable handoff and commands

Absolute scratch root: C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-m6-ender.

Final source: m6-source-pin2, 303 files. Manifest: m6-source-pin2-manifest.json; SHA256 c42c1c714d5b040811c1bd48fe1c9168a32ee5c11b227a2c0d0c646ee2296a87. pin1-pin2-equality.json records the exact two-file delta. No whole source files were deleted; removed overlays/routes/styles are hunks. Existing committed fallback specification is included unchanged as context; fallback implementation is excluded.

Complete renderer harness: m6-harness-pin1, 41 files. Manifest: m6-harness-pin1-manifest.json; SHA256 cfdd636c042d06b8aed8a23fcd7997e1f208504b9fac5526f240ac3dee05bb86. Its README gives the exact immutable-source-to-fresh-scratch copy, dependency junction and audited runner commands. Every emitted positive-control CSS, contract oracle and catalog/channel/forwarding mutation fixture is included. Profiles/caches are excluded. Historical pin1 and the full failure/control receipts are retained.

Source manifest records 445 actual dependency package manifests and the actual Node/Electron executable identities. Electron is 32.3.3; executable SHA256 217c7abc77aaa868b9423ff3e6e8f40f62633ccc4121786fac64e481aef3429d. Dependencies were used read-only through scratch-only junctions; none were installed or updated.

Safe pure command: node C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-m6-ender/run-safe.cjs followed by the absolute frozen source pin path. This runner has the explicit 26-file allowlist and a 600000ms bound. Final focused command from pin2: node --test test/integration/m6-cleanup.test.js test/integration/merge-preservation.test.js. The single final route can be selected with --test-name-pattern='dead main registration'. Do not invoke product main, native self-tests or gallery host directly; use the audited complete replay README and original bounded runner.

This report was written after sourcepin2 freeze and is a separate documentation artifact, not one of its 303 hashed inputs. No frozen source bytes were edited to add this report. Futaba received pin2 and the complete harness before final QA reporting.

## Limitations and remaining work

All machine constraints remained in effect: no visible UI, real input, native product hosts, display/scale/taskbar/power changes, installed launcher, signed-in browser, real stores/Desktop, updater download/install or user-file mutations. Gallery uses isolated offscreen renderer-only windows, early fatal handlers, counted denials, network/navigation blocking and owned-process watchdogs. All sender processes closed.

Formal entry receipt remains blocked by the existing P9 hook demanding an unsupported timeout field; no bypass, hook edit or identity repair occurred. That separately authorized task follows M6 independent QA and push. M6 all-layout visual review, five-region idle CPU comparison, packaged Bitdefender checks, full native QA, Senua/release and actual display transitions remain deferred under the current machine restrictions. Temporary Grid fallback implementation also remains later. This is cleanup verification, not release clearance.
