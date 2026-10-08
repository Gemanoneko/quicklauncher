# QuickLaunch native QA readiness — 2026-10-08

Ender technical preparation only. No build, application launch, input, display change, registry write, dependency install, guard/source edit or git operation was performed. This plan does not clear native QA or a release.

## Finding and exact inspected baseline

Integration HEAD is `91396260b4a127bcbb2546974f331c6f77841949`; current Batch08 work belongs to another Ender. Only committed product sources may enter the future artifact. October05 native artifacts predate the current regions/fallback/theme work and cannot substitute. The current safe offscreen pin is not a packaged native application.

`scripts/qa/quicklaunch-safe-launch.mjs` is the maintained product launcher. It accepts an actual packaged `QuickLauncher.exe`, refuses the installed copy, requires a fresh temp profile with safe main/tmp/bak data, snapshots the real startup keys, tracks owned PID+creation identity, and has a watchdog. It detects registry changes after launch; it does not prevent or restore them. Job Object-before-child is not a universal product-launch requirement: the away report records that earlier extra constraint as the task brief's stricter condition.

**Concrete prerequisite:** committed `src/main/index.js` requests its single-instance lock at lines12–16 before loading Store. Its packaged boot later reconciles `settings.startWithWindows` against `app.getLoginItemSettings().openAtLogin`, calling `setLoginItemSettings` when different. Neither `--ql-test-hooks` nor `--ql-test-desktop` skips that reconciliation. A safe seed with false disables requested autostart but can still delete an existing startup registration if Electron reports it as enabled. Therefore false seed plus postlaunch detection is insufficient proof of zero registry mutation. We must not discover the answer by launching against the user's live startup state.

`--user-data-dir` is supplied by the guard and Store uses `app.getPath('userData')`; this source has no explicit early assertion that the supplied path became Electron's userData before requesting the lock. Wrong lock isolation could notify the user's running instance through its second-instance handler (`ctl.showAll()`). Isolation must be established before the lock; a successful independent temp-profile spawn is not currently verified.

`--ql-test-hooks` also intentionally keeps Manager hidden (`src/main/manager.js` open path), so it cannot alone clear real Manager mouse/keyboard/menu acceptance. Existing `--ql-test-desktop=<temp root>` can confine native file moves without that hidden-Manager flag. Updater automatic startup check has the existing `--ql-no-update-check` switch; manual updater actions remain excluded.

## Minimal reviewed local prerequisite proposal

Before implementation, ask Senua to review a bounded **QA isolation mode** proposal in `src/main/index.js` and focused startup-isolation tests, plus necessary safe-launch argument/seed checks in `scripts/qa/quicklaunch-safe-launch.mjs` and its tests if its current argument validation is insufficient. No global-hook, policy/schema or permission work belongs here.

Proposed mode must validate canonical unique temp userData and test-desktop roots, safe seed/main/tmp/bak and disabled hotkey before Store/lock/windows; apply/confirm the isolated userData path before `requestSingleInstanceLock`; refuse unsafe paths/arguments rather than fall back; skip every autostart registry write in validated QA mode; keep Manager visible for native acceptance without granting the hidden test-hook IPC privileges; and suppress actual updater network/actions. Normal user boot semantics stay untouched. Do not enable it merely because an unvalidated flag exists. Negative controls must prove wrong profile/real path/default unsafe seed/invalid roots refuse before side effects, and guarded startup preserves the user's running instance/startup settings.

Whether the guard itself needs a change depends on that review. Reuse its existing ownership/watchdog rather than rename an Electron binary or introduce a source-mode shortcut. No source-mode launch is proposed. Existing fixture-desktop refusal must survive, including junction/realpath confinement. This is tooling to execute already-required native acceptance, not a new product feature.

## Frozen artifact recipe after prerequisite clearance

1. Finish and commit the approved product scope to integration; ultimately use the final all101-theme commit for full acceptance. Record exact source commit/ref. Freeze every tracked product/build/test file from committed blobs into `scratch/2026-10-08-native-readiness-ender/<exact-ref>-source`; verify source manifest SHA256, package/lock version1.94.3, source identity and no dirty/live Batch08 inclusion. Dependencies/runtime require their own complete manifests; no dependency installation is authorized by this plan.
2. Packaging input must contain an audited matching dependency closure with the existing native koffi addon and local Electron32.3.3. Integration currently has no directly readable electron-builder/electron dependency installation. Original QuickLaunch has electron-builder25.1.8 (`node_modules/electron-builder/package.json`, bin `./cli.js`) and Electron dependencies; they may be copied/linked only after exact lock/runtime/addon attestation. Do not assume original dependency identity clears the new artifact.
3. Proposed explicit unpacked-only packaging command, run **from the frozen source** with a verified Node executable and verified dependency tree:

   ```text
   <verified-node.exe> <frozen-source>/node_modules/electron-builder/cli.js --win --dir --publish never --config.directories.output=<unique-owned-artifact-dir> --config.electronDist=<verified-local-electron-dist>
   ```

   This is a recipe, not an executed command. Audit builder hooks/custom config and available cached resources first; prevent network/download/publish and stop on a missing resource. Do not run npm build/pack/release: build uses publish always; npm lifecycle can run unrelated clean/check/release cleanup. No NSIS installer, installation, version bump, tag or GitHub release. The owned long-command wrapper must enforce600000ms and descendant closure; no unsupported tool timeout field, guard bypass or duplicate run.
4. Manifest the generated `win-unpacked` tree, exact QuickLauncher.exe, resources/app.asar, extracted packaged source correspondence, native koffi addon, bundled11font files/OFL and actual version/runtime. Verify the isolated startup-mode code is in packaged asar. Run static/independent safety review before considering native launch. Do not execute the packaged exe merely to collect its version.

## Prepared profile and guard route

Use a fresh unique directory under the real system temp root, disjoint from APPDATA/installed launcher/Desktop/Public Desktop/store. Fixture root contains `Desktop`, `Public Desktop`, `QuickLauncher Shortcuts`; profile is a separate child. Seed **main, .tmp and .bak** with valid equivalent safe data. Each has `apps:[]`, settings with boolean `startWithWindows:false`, `globalHotkey:null`, `randomTheme:false`, valid theme/icon size; use committed regionsVersion1/model-valid region records and app ownership when preparing Grid/Row/Column/Fan/Ring acceptance scenes. Never copy the user's real moved paths. Seed via the current model/schema; record seed hashes before launch. Fixture shortcuts target only owned harmless Notepad/Calculator test actions; no browser URL launch.

After reviewed isolation mode and artifact exist, preflight recipe is the existing launcher with explicit exe/profile and `--check`. Native launch uses that same exact exe/profile plus bounded timeout≤300s, `--ql-test-desktop=<validated-fixture-root>`, `--ql-no-update-check`, and the future reviewed isolation mode. Exact final flag is not invented here; it must come from the reviewed implementation. No `--ql-test-hooks` on the visible Manager acceptance route. Do not use the launcher's default exe path.

Before/after obtain actual read-only `snapshotRegistry()` results for both Run and StartupApproved Run and compare complete snapshots without printing private values. Preserve real-profile signatures and user's instance PID/creation/foreground state. The one successful registry read in `QuickLaunch_QA_AwayWindow_2026-10-08.md` is not a before/after launch pair. If registry read fails, STOP before launch. The guard never restores registry; any unexpected change is a stopped safety incident requiring an exact reviewed restoration action, never an automatic guessed fix.

During a fresh timed away window, use the actual owned native app; test tray Quit before watchdog expiry and prove owned root/children exited normally. Forced timeout cleanup is ownership safety, not Quit PASS. Capture display/taskbar/scale state before any explicitly permitted change, reserve restoration time and verify exact restoration. No sleep, user's QuickLauncher input, signed-in browser, real store/file moves or updater actions. Never stretch the current expiring window to assemble an unreviewed artifact.

## Ready/not ready

Ready: current committed product baseline, native computer-use availability, existing guarded packaged-launch mechanism, existing temp-file-move isolation and no-auto-check switch, read-only registry access demonstrated once.

Not ready: reviewed packaged current artifact, dependency/build/offline attestations, guaranteed pre-lock profile isolation, guaranteed zero startup writes, visible Manager native QA route with isolation but no hidden test privileges, exact seeded scenes and independently verified manifests. These are local prerequisites; no further global observer investigation is needed. Prepare them before requesting the next timed away window.
