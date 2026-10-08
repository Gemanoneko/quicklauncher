# QuickLaunch QA-tool repairs: independent development verification

Futaba, 2026-10-08. Version 1.94.3, regions source HEAD `3e384365345cde4e6f48f0a0a8c076cb5d57f5ae` plus pinned QA-tool changes.

**Verdict:** NO-GO

Independent safe development acceptance **PASS** for the first-painted-frame polling helper and repaired gallery self-test. This is not overall handoff/release clearance: shared entry receipts remain blocked, and native fallback painting/rebuild validation is deferred. No new product code or native host was run.

## Exact identity and setup

Ender pin: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-qa-tools-ender/qa-tools-pin-1`; sibling manifest lists 177 source files. Independent SHA256 verification: **177/177 sender files, 177/177 copied QA files**, before checks and again after all checks (354/354 final comparisons, zero mismatches). The sender pin stayed immutable while Ender continued separate product work.

QA scratch: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-m5-futaba/`. `qa-tools-frozen` contains byte-identical source plus a junction to the existing external checkout's `node_modules`; no dependencies were installed. NODE_PATH alone was insufficient because the runner directly reads its own `node_modules/electron/package.json`. Ender confirmed his originally reported gallery successes came from the source checkout, not the delivered pin. The dependency bridge is recorded in `identity.json` and changes no tool logic.

The runner's `live@8de41d5` CITE label derives the containing theme checkout, not actual pinned regions identity. Direct `--ref=e385df7` from the nested frozen copy also failed before Electron: relative Git pathspecs extracted zero files, then `.complete` raised ENOENT. These pre-existing snapshot-ancestry limitations were not repaired. Actual identity is certified by hashes. For legacy acceptance, QA exported **106/106 Git blobs**, checked Git object SHA1 and read-back SHA256, from `e385df7e6cd7c11d1d3fda606e6bc6789d6ace61`; `legacy-identity.json` records them. Corrected gallery code remained unchanged in that fixture.

## Measured results and known-bad controls

| Check | Independent result / method |
|---|---|
| Pure polling suite | **8/8**, zero skipped; plain Node `--test test/regions/pixel-readiness.test.js` from frozen copy |
| Original predicate | Seven capture/threshold rows: successful PrintWindow, full read height, ≥16 colors, ≥10% lit; source read-back confirms exactly three native probe consumers use this predicate through polling |
| Delayed healthy frame | Old first read fails; unchanged predicate passes at **150ms / 4 attempts** with 2,069 colors |
| Never-painted / low colors / low coverage | Remain red; never-painted deadline **3,000ms / 61 attempts**, last evidence retained |
| Errors / late capture / stopped clock | Transient errors recover on attempt3; persistent errors and read finishing at3,001ms remain red; stopped clock still stops at61 captures |
| Predicate mutation control | Lower color threshold to1 in scratch only: suite **6/8**, 2 failures, exit1 observed |
| Read-once mutation control | Remove waiting in scratch only: suite **1/8**, 7 failures, exit1 observed |
| Corrected current gallery | **2/2 themes, 6 PNGs, 6/6 deterministic repeats, 12/12 detector controls**, runner exit0 |
| Preserved legacy overlay | **2/2 themes, 6 PNGs, 6/6 deterministic repeats, 12/12 detector controls**, runner exit0 on independently exported legacy renderer |
| Obsolete route control | Replace only gallery `main.cjs` with committed `8a648a8` version: **0/2 themes**, both fail waiting3,000ms for obsolete Settings overlay; runner exit1 observed |

Gallery commands use `node scripts/theme-gallery/run.mjs --self-test --work=<fresh absolute scratch> --timeout=540`. Current route verifies `region:open-manager` Settings request and draws the real Manager renderer with mock IPC. Legacy route still draws the real overlay. QA visually inspected the current cyberpunk Settings PNG: Manager Settings selected, actual settings content and Check/Close visible. This fixed 424×300 emulated gallery fixture is not native Manager window sizing acceptance.

All 12 gallery controls fired: repeat determinism, mocked login-item IPC, unexpected IPC, blank capture, wrong capture size, wrong viewport, blocked external fetch, intact stubs, in-memory registry mutation, duplicate PNG, process liveness and socket-parser presence control. The positive login/network counters represent blocked/counting stubs, not actual external actions.

## Guard audit and closure

Audited pinned gallery main/runner/preload before launch: early uncaughtException/unhandledRejection log and exit without dialogs; isolated scratch profiles; offscreen `show:false`, `focusable:false`; muted audio; login/shortcut/show/focus/dialog counting stubs; requests limited to local rendered files/data, unresolved remote hosts, blocked navigation/popups/webviews/permissions. No product main/region host, browser, actual updates, visible windows, real input, display/scale/taskbar change, system sleep, user Desktop/store or running QuickLauncher was used.

Every gallery run: **23/23 stubs intact; show/focus/dialog/media calls0; owned sockets0; registry unchanged**. Corrected current: **12 processes, exit0, 0 left**; legacy: **8, exit0, 0 left**; known-bad: **8, Electron exit0, runner exit1, 0 left**. All ended normally; no forced kill was used as Quit evidence. Watchdog540s with runner deadline585s stays under600s. Native helpers were read as text only; complete regions-selftest was not executed.

## Disposition and limitations

- Recorded fallback pixel-check Major: polling logic repair verified safely; **actual native PrintWindow painting/rebuild and repeated fallback runs pending next fresh timed away window**. A blocked/hung native capture is not proven bounded by this pure retry test.
- Recorded gallery self-test Major: corrected current route and preserved legacy route verified, with observed obsolete-route failure. No additional gallery changes requested.
- Pattern alert — pinned commands need actual dependency and Git identity context. **DEFER** operational repair to Jane; frozen copies/explicit hashes document this pass without modifying the receipt hook or runner ancestry behavior.
- Shared qa-handoff sender/receiver receipts remain absent because legacy P9 requires unsupported `timeout:600000`; no bypass or fabricated receipt. Prior snapshot-ancestry mismatch remains. Overall NO-GO preserved.

Detailed evidence in QA scratch: `identity.json`, `legacy-identity.json`, polling mutant `results.log` files, `gallery-corrected/result.json`, `gallery-legacy-fixture/result.json`, `gallery-obsolete/result.json`, their manifests/configs/electron logs/PNGs. The failed direct-ref preparation launched no Electron and is excluded from gallery acceptance.

No production/tool code fixes, commits, pushes, bumps, tags, merge or release were performed by Futaba.
