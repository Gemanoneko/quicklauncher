# QuickLaunch regions/themes integration QA — 2026-10-08

**Verdict:** NO-GO

**Bounded safe integration acceptance: PASS.** This is neither release nor full real-use clearance. Formal entry receipts/native coverage remain missing; inherited theme findings below are deferred, not passed. Version remains1.94.3. M6 cleanup and entry-tool repair were not tested or undertaken here.

## Frozen identity and scope

Source: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-integration-ender/integration-source-pin1`,300 files. Manifest SHA256 `b8ef625b454e1fb55224cefdc1dac5cfe687fac94db835d44d254ca7ff62d26c`. Merge parents: regions `864c31756fcaa2357b0110bbfadea1247da4e399` and themes `8de41d52e3ed1ad08b2e83ce727462ac3842cc08`; branch `codex/regions-themes-integration`. This certifies the immutable pending-merge contents, not an assumed merge commit.

Harness: sibling `integration-harness-pin1`,47 files, manifest SHA256 `507140b90788e1e9835ab68546b7ba669c37b34813bc0ae11c2bd42077408c9f`. Before/after300 source and47 harness hashes match; own copied source also matches300/300. All445 recorded dependency package manifests and Nodev26.10.0/Electron32.3.3 binary hashes match before/after. Existing regions node_modules is a documented scratch-only junction; no install.

Own scratch: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-integration-futaba/`. Read-only Git provenance points at integration metadata; gallery labels `live@864c317+dirty` are metadata, not formal source receipts. Immutable file manifest anchors actual execution. No live checkout code executed.

Exact merge file roster: `scratch/2026-10-08-integration-ender/merge-commit-paths.txt`,122 tracked paths, SHA256 `3d2e36cff302e3316633747b88989946bc03180b4c6b88158fb1960cc7a6b6bf`, plus `test/integration/merge-preservation.test.js`, `Docs/QuickLaunch_Integration_Implementation_v1.94.3_2026-10-08.md` and this QA report. Legacy `src/main/window.js` deletion is explicitly recorded; its behavior tests are ported to actual regions model/controller. No display-shrink spec/implementation or parked recursive-delete guard is certified.

Exact eight conflict-resolution endpoints: `Docs/QuickLaunch_Brief.md`, `package.json`, `scripts/theme-gallery/main.cjs`, `scripts/theme-gallery/run.mjs`, `src/main/ipc.js`, `src/main/window.js` (deletion), `src/renderer/app.js`, `src/renderer/index.html`. Sender-scoped region/Manager IPC survives; obsolete single-window handlers are removed. Index conflict labels do not override the frozen tested content; Sully must stage window.js as deletion, never resurrect it.

## Independent results

| Check | Pass / total | Measured method |
|---|---:|---|
| Safe Node regression | 228 / 228 tests,0 skipped | Explicit25-file allowlist; actual bounds/model/F11 ports, merged callbacks/Escape ladder, region/controller/mover/IPC/preload contracts. Fit tests retain3744 nested geometry assertions, not3744 separate tests. |
| Static theme contrast | 101 themes,0 errors |32 recorded legacy warnings remain warnings; no rebaseline. |
| Original reachable hover gate |3838 /3838 pairs |101×38 original readings; PC1–PC4 fire;0 errors/grandfathered. |
| Approved affected labels |1616 /1616 pairs |Four Manager labels×rest/hover/pressed/active×101; original contrast method/floors/PCs retained. |
| Gallery self-test |2 /2 themes,6 PNG |6/6 fresh-window repeat captures; all self-test controls pass; source endpoint forwarding uses actual Manager. |
| Gallery forwarding contract |3 endpoints +6 allowlist/unsubscribe assertions |Actual frozen preload/main extracts, parsed production allowlists; omitted forwarding mutant fails all3 endpoints. |
| F5 Manager preservation |84 /84 measured states |Three themes×two sizes×two tabs×seven updater states; no overlap/outside/failed hit targets. |
| Grid preservation |395 /395 paired heights/gaps |452 records: three themes/three sizes/two heights/3–12–50 counts/states, empty/focus/wrap/padding; one50-tile overflow row per101 theme.215/215 genuine overflowing-content cases have positive tile-list scroll range. |
| Radial preservation |71 /71 +55 /55 |Focused geometry/edit/filter/rename/navigation/preview and empty direction/size/max-pair-gap/normal-busy captures. |
| Q2 preservation |29 /29 +9 /9 |Focused rollback/ordering/announcement/timer/updates; coherent447px attempted128→64 refusal/restoration. |
| Column/options preservation |18 /18 states +12 hover readings |Three themes×six message/action states; no overlap/outside; obsolete clipping positive control detected. |

Reachable consumer audit: region Settings/picker actions invoke scoped Manager; gallery main forwards ready/show-view events once through parsed production manager-preload allowlists. Hover Settings/skin/cheat/picker scenes load linked `manager.html` and assert its URL/body, not retired region overlays. Local-font/stylesheet consumers and the real theme picker focus/keyboard handlers run in those guarded scenes. Actual applySettings retains both radial refresh and skin-selection callback; duplicate Escape handler mutation is caught. Original scripts/dependencies and contrast→hover prebuild gate survive. Fullscreen/F11 removal and oversized/malformed default reset use actual migrated model/controller guards, with mutations that fail their assertions.

## Findings, controls and evidence corrections

No new product Blocker/Major was found within approved integration scope. Original four Silent Hill pressed failures and subsequent32 reachable failures across four themes are preserved in frozen sender evidence; approved exact two-CSS candidate now passes independent primary and affected-label gates without lowering floors or changing baselines.

Exactly19 expanded diagnostic failures across15 themes remain inherited/0 introduced per frozen exact prepatch comparison (same foreground/fill/ratio/geometry/styles). They are FF8 header/rest3, Persona4 header/active-only3, and Manager hotkey active-only13. They stay deferred to pending theme batches;2929 diagnostic readings are not called a pass and were not broadly rerun. Root expressly limited integration repair to the original32 reachable failures.

**Minor, carried/deferred:** six strict final-focused-tile border reads in this bounded matrix reproduce the prior12-count near-fit cases;108/114 whole-border reads pass, all fieldScroll values0. Prior baseline evidence records0.5625/1.171875px edge excess with label/icon content reachable. No new complete focus GO is inferred; native/real-input coverage remains pending.

Generic old-field-overflow classification flagged48 sparse/art/empty-hint records; these are not tile-content overflow, as prior committed Grid QA expressly states. They were not used to assert scrolling failure or PASS. Exact intended50-tile view/edit/notice/threshold/alltheme content cases pass215/215; known-bad auto-track mutation shrinks rows to12px and is detected. Tile-height and8px-gap criteria independently pass every395 paired record.

One own Column fixture copied its preload as `preload.cjs` although its audited host expects `tray-preload.cjs`; first host exited2 before measurements. Failed log is preserved as `column-missing-preload.log`. Required filename restored only in own scratch; bounded rerun passes. This was QA setup, not product failure. Q2's four mutants were constructed from final verified renderer inputs, avoiding prior missing-fixture handoff. No pinned code was repaired.

Positive evidence includes PC1–PC4, actual preflight/IPC-return/forwarding removal, focused rollback/stale/timer/status mutants, shifted hub, hidden heading, auto rows, obsolete Column clipping, duplicate Escape and migration/F11 guard mutations. Guards cannot silently disable checks. All successful replay runs report0 renderer errors/unsafe calls; ten recorded launcher PIDs exited0 normally and were independently absent. Gallery also reports primary127 and affected128 owned processes started/0 left,0 sockets, unchanged Run registry,92/92 denial stubs intact. No forced kill is shutdown evidence.

## Remaining limits and audit

Formal entry check remains P9 timeout/schema-blocked; no hook bypass, fabricated receipt or repair. Native desktop hosts/shaping/click-through/z-order, pointer/keyboard/menu/drop/file operations, display/scale/taskbar/lifecycle/real Quit and actual update actions remain unrun. No installed QuickLauncher, real profile/store/Desktop, browser links, visible windows, real input or sleep was touched. Automatic work-area-shrink policy stays outside this integration scope.

Pattern alert: incomplete copied fixtures, contradictory mock states and decorative overflow misclassification can mislabel QA. Disposition **fix**: verify complete fixture dependencies, coherent events, actual content extents and frozen hashes; applied. Inherited theme19 and prior focus-border Minor: **defer**, existing theme/native work. Formal receipt obstruction: **defer**, authorised third work order.

Evidence under own scratch: `source-identity.json`, `runtime-identity.json`, `harness-identity.json`, `final-summary.json`, `preservation-summary.json`, `node.log`, `contrast.log`, `{hover,states}-out/hover-readings.json`, `selftest-work/self-test/manifest.json`, replay routing receipt, and each preservation folder's results/closure logs. Commands are the recorded audited25-file Node runner, static linter, original guarded gallery runner, exact selected1616 adapter and redirected previously audited offscreen harnesses; no native glob/product main.

Root visually accepted final radial busy controls, actual Dune Manager/local-font Settings (small gallery viewport qualified, not production geometry) and merged Q2 coherent447 restore64/current footer/hidden strip. Representative captures: own scratch `radial/{normal-fan.png,normal-ring.png,actual-busy-fan.png,actual-busy-ring.png}`, `q2/manager-447-coherent-restored.png`, `selftest-work/self-test/dune-settings.png`, `f5-grid/gridmatrix-corrected-overflow-cyberpunk.png`. This is bounded visual evidence, not release or real-input clearance.
