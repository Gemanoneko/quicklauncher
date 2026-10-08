# Native QA isolation — Stage A implementation candidate

Ender, inherited Codex tier. **Candidate ready for independent safety review and scoped fake-only QA; no native GO or formal entry receipt.** Version remains 1.94.3. No commit, release, build, installer, dependency install, native app launch, system change or Stage B implementation was performed.

Authority: original safety design `68b13eab4a4d6bc377cb7dfca9a7e33e504258f7` and Store addendum `cf55bf2191380605f9729b2f1c060afa7ba2ba8d`. Stage B brief `6fddbc1eeeb97c0218067748f9244fb075c642e4` is explicitly deferred until Stage A independent acceptance.

## Exact input pin

Product committed baseline: `e5bd5b9caf9f6bd72c6541e0494be9510d4f8681`. Studio baseline: `e0bf1d332224daac14b111208250944f68310d57`. Snapshot:

`scratch/2026-10-09-native-isolation-ender/pin`

Complete 339-file source/runner manifest: `scratch/2026-10-09-native-isolation-ender/source-manifest.json`, SHA256 `f895aafe7326dd22e260409ba3794da502383f83926aca7629c7bae899c40007`.

Every unowned file was read from its committed baseline blob. Only these ten owned files overlay the baseline; concurrent Batch08 renderer CSS drafts are excluded:

- `src/main/index.js`, NEW `src/main/qa-isolation.js`, `src/main/store.js`, `src/main/ipc.js`, `src/main/tray.js`, `src/main/updater.js`.
- NEW `test/window/qa-isolation.test.js`, `test/window/qa-isolation-startup.test.js`, `test/window/qa-isolation-store.test.js`, `test/integration/qa-isolation-side-effects.test.js`.

Studio candidate files have a separate `scratch/2026-10-09-native-isolation-ender/studio-pin`:

| File | SHA256 |
| --- | --- |
| `scripts/qa/quicklaunch-safe-launch.mjs` | `369f3313ea00559a7ce8ba3ed14a248f409c482a7f0c49777491704cd7843113` |
| `scripts/qa/quicklaunch-safe-launch.test.mjs` | `5fda8bcbc50b7d945db7f37e7696e29038cfc5ef8131a7ca682a3ddfb9140be2` |

## Actual consumers and order

`index.js` detects any requested `--ql-qa-*` mode, validates all arguments, canonical roots, three seed generations and complete safe schema, installs and confirms both effective Electron `userData` and `sessionData`, then requests the single-instance lock. Store, controller and native/module imports occur afterward. Invalid requests exit 64 with generic refusal; a failed isolated lock exits without Store or fallback. Normal invocation retains the existing lock, defaults and boot routes.

`qa-isolation.js` creates a main-process WeakMap-branded, deeply frozen capability. CLI strings, renderer objects and serialized copies cannot confer authority. Main is the sole selected snapshot; main/tmp/bak must all be safe and equivalent and have recorded regular-file identity/hash. Unsupported flags, test-hooks/restore/renderer/user-data overrides, missing/corrupt/nonequivalent candidates, links/hard links, ambiguous I/O, unsafe startup/hotkey/random settings, unsupported region state and outside-fixture app/origin data refuse. Supported temp is conservatively the canonical home `AppData/Local/Temp`, confirmed against Electron temp; alternative machine temp layouts refuse rather than infer trust from environment variables. Profile and fixture must be disjoint strict descendants, with canonical Desktop, Public Desktop and QuickLauncher Shortcuts children and no overlap with real protected roots.

`Store` consumes only the validated immutable main snapshot through an explicit constructor branch, initializes a separate mutable clone and deliberate clean flags, and never calls normal `_load`, defaults, quarantine, recovery timers or writers during QA construction. QA recovery entry points retain safe owned memory. Whole-state validation applies to setters and flush, including mutation through `get()`. Observed directory/seed drift or write failure latches refusal and cancels pending timers. Durable own writes update expected main/tmp/bak generations, so a second legitimate save is allowed; no ordinary backup fallback or recovery retries run after failure. The no-option branch preserves ordinary behavior.

`index.js` lifetime hotkey reconciliation always calls a guarded function. Boot login reconciliation is excluded in QA. `ipc.js` refuses launch-app before any association/protocol/shell route, unsafe settings and startup changes; its QA setup does not compile the shared-temp icon helper. `tray.js` disables startup/random controls and guards the actual callbacks. `updater.js` guards direct, timer, event, download and install routes and produces inert update state. These guards depend on the immutable capability, not the current mutable settings.

Stage A supplies the existing controller an unavailable moveSetup with empty folders. The actual controller method, actual Mover subclass and recording Journal/native fakes prove no journal load/reconcile/native move on this route. Journal and Mover objects may be constructed; this is not a claim of zero constructor entries. Fresh journal/history files must initially be absent. No controller, mover or journal source was changed. File-move acceptance stays pending Stage B.

## Guarded packaged route

The studio guard adds an opt-in `--native-isolation` route requiring explicit `--exe`, `--fixture`, `--artifact-manifest` and independently reviewed `--artifact-sha`; `--init` is refused. It retains the original packaged `QuickLauncher.exe` gate and PID/creation/ownership/watchdog cleanup, never renames Electron or permits source-mode launch. Only `--ql-no-desktop-layer` and `--enable-logging` can be extra arguments on this route.

The reviewed JSON artifact manifest lives outside the artifact root. It names mode `native-ui-no-move-v1`, artifactRoot, sourceCommit, sourceManifestSha256, entrySha256, profileRoot, fixtureRoot, seedSha256 and a bounded complete files list of relative forward-slash paths and SHA256s. Both executable and resources/app.asar are mandatory. Every regular artifact is hashed and the actual artifact tree must exactly match the list; aliases, linked files, missing/extra/changed files refuse. Prepared main/tmp/bak seed bytes must match the attested safe seed. This is reviewed build correspondence metadata, not an automatic proof that an arbitrary supplied source hash is trustworthy. No current artifact was built or attested in this task.

`--check` states that static artifact/seed and registry readability checks have not executed product isolation. Run preflight is repeated before launch; missing root creation identity, launcher identity, watchdog PID/error, unreadable registry or unproved closure stops/fails the opt-in route. Existing watcher is retained; this candidate does not claim an OS Job Object or stronger containment. Registry changes report names/types plus value digests, not raw values, and the guard never edits registry.

Actual product stdout receipt is exactly one `[qa-isolation]` JSON line containing mode, profile, sessionData, fixture, seedSha256 and actual main entrySha256. The guard matches all these fields against the reviewed manifest and effective prepared roots. Missing/mismatched receipt fails rather than calling a static preflight native PASS. Guard EXIT/PID/registry results and behavior acceptance remain separate.

## Recorded fake evidence

Runtime: `C:\Program Files\nodejs\node.exe`, v26.10.0, SHA256 `cea6ac365f9bb9586dafd2084d996e092e7d3e7d07ab52d1f76bf53d1fca9bc4`. Runner SHA256 `7b8dfecdf57ec2f7dad9963456fcc6fa55703ca7798b74e99e9cc1ecfa1f0f45`. Studio files and all test harness hashes are recorded in the complete source manifest above; there is no implied npm/lifecycle graph in this fake-only run. Thirteen owned source/test/runner/guard files passed `node --check`. Frozen product command from `pin`: `node run-owned.cjs`. Frozen studio command from `studio-pin`: `node scripts/qa/quicklaunch-safe-launch.test.mjs --isolation-only`.

- Product: **20 focused test callbacks pass**; Node reports **21/21** because the imported helper test file contributes one loader-file item. Actual module/factory/startup/Store/updater/tray/controller wiring is exercised with recording/throwing fakes; IPC registrations and lifetime hotkey are actual source routes. Normal Store, tray and hotkey controls are included. No Electron/native child or profile/system operation is permitted by this allowlist.
- Guard: **6/6 isolation-only checks pass**, including exact actual artifact preflight logic with fake filesystem/roots. This test mode returns before the existing live registry/process/sleeper fixtures. The legacy full guard suite and general test/ directory were deliberately not launched.
- Three deliberately broken controls were applied in memory to the immutable pin: removing snapshot freeze causes one failure; removing Store snapshot-constructor branch causes five failures; removing lifetime hotkey guard causes two failures. Each exits 1 through the same owned runner. No reviewed source bytes were modified.
- Owned runner launches one Node child with `--test --test-isolation=none` and four exact fake-test files, a single 600000ms deadline and retained child handle. Successful closure: `{"ownedNodeOnly":true,"deadlineMs":600000,"code":0,"signal":null,"closed":true}`. Negative controls each recorded code 1/closed true. This runner is limited to the audited fake allowlist and does not claim a supervisor for arbitrary native descendants.

Evidence files in the scratch parent:

| Evidence | SHA256 |
| --- | --- |
| `focused-test-output.txt` | `570d47feaa4248992ac8acb7da2f888ef84c274b7a8b1bfcae5d7800480ed2e8` |
| `guard-test-output.txt` | `a0af7cae7b1955158b0e4db497b634e49a77e17d8113b34ac42f0079b3b76eaf` |
| `negative-control.cjs` | `b5f77a0781f9cf746149c446ad201983d6483ecfd4616ca3a5caa4a6307acaec` |

Negative output files are `negative-snapshot.txt`, `negative-store.txt`, `negative-hotkey.txt`. Reproduction sets `NODE_OPTIONS` to require the named negative-control preload and `QL_QA_NEGATIVE_CONTROL` to the respective name, then uses the same runner; each run is expected to fail.

Exact negative invocation from the pinned product directory, with `$taskControl` set to `snapshot`, `store`, then `hotkey`:

```powershell
$env:NODE_OPTIONS='--require="C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch-integration/scratch/2026-10-09-native-isolation-ender/negative-control.cjs"'
$env:QL_QA_NEGATIVE_CONTROL=$taskControl
node run-owned.cjs
```

Each closure is `{"ownedNodeOnly":true,"deadlineMs":600000,"code":1,"signal":null,"closed":true}`. Remove both task environment variables before the positive reproduction. These variables were scoped to the test shell; no user environment setting was persisted.

## Limits and next handoff

Observed invalid/drifting input refuses before unsafe owned writes; runtime boot state comes only from the snapshot. Read-only canonical/identity checks before pathname writes are **not atomic, race-free or OS-enforced containment** against an external actor replacing a root/link between check and open/rename. Native readiness must establish quiescent owned directories and STOP on observed drift or uncertainty; stronger handle containment requires separate review.

This report is not the canonical protocol-2 qa-handoff receipt. That skill requires its reviewed complete declared check graph, checker/helper/runtime identity and ownership contract; unit/mock outputs cannot replace it. No full declared renderer/native graph was authorized under this fake-only implementation brief. Independent Senua safety review, Futaba reproduction and Sully commit/push remain required. Full packaged source/artifact correspondence, actual host registry baseline/after evidence, native behavior/real input and fresh timed-away authorization are still pending. Stage B must be separately implemented only after Stage A acceptance. No release/version clearance is implied.
