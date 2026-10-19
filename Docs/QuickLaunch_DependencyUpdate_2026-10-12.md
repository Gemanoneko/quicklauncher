# QuickLaunch dependency update — reviewed-route candidate pending

## Revised technical selection and current route state

The first proposed Electron44 target below is historical. The current exact runtime target is **42.11.12**, independently confirmed as a supported stable October7 release. This is an **interim** security bridge: official42 EOL is **October20,2026**, eight days after this assessment; it must not be presented as a sustainable runtime upgrade. [Official support schedule](https://releases.electronjs.org/schedule).

Why42: Electron43+ changes OS file-dialog remembered-directory defaults and NativeImage raw bitmap defaults. No documented44 opt-out restores OS remembered-folder behavior; adding app-managed saved-folder state would change behavior outside this request.42 avoids those43 defaults while updating the unsupported32 runtime. Builder26.17.0 and updater6.8.10 remain selected exact targets. Any44 migration needs separately proven minimal behavior preservation, without inventing UX.

User explicitly authorized a QuickLaunch-only execution route with independent review and intact safeguards. A self-contained **undeployed candidate** now exists in studio `scripts/qa/quicklaunch-dependency-route/`; its README identifies exact proposed one-field machine registration and rollback, actual parser/inert Windows containment/previous-evaluator evidence, and unproved areas. Its first frozen entry is lock-only npm resolution with lifecycle scripts disabled, isolated cache/config, exact42/builder/updater argv and fixed checkout. Future scoped entries need frozen identities and independent review; no broad command exemption exists.

Product package, lock, version and implementation remain unchanged. Initial direct command was rejected before execution as recorded below; no dependency remediation, build, installed-app update or QA handoff receipt is claimed. Independent candidate review/deployment and live activation must precede actual dependency resolution.

Date: 2026-10-12. Product checkout: `WIP/QuickLaunch-release-1.95.0`, branch `codex/axis-resize`, intended input HEAD `f52f4ea`, product version `1.104.0`. This is a maintenance implementation request; no new feature or behavior change is authorized. Sully owns the eventual version bump to `1.104.1`, commits, changelog and publication.

## Proposed exact dependency edits

| Package | Current declaration | Current lock | Selected exact declaration |
|---|---|---|---|
| electron | ^32.0.0 | 32.3.3 | 44.7.0 |
| electron-builder | ^25.1.0 | 25.1.8 | 26.17.0 |
| electron-updater | ^6.3.0 | 6.8.3 | 6.8.10 |

Electron and builder must be exact pins on this dependency touch (ProcessRules, Dependencies install from lockfile). Keep updater in production dependencies, Electron and builder in devDependencies, and koffi's existing declaration unchanged. The existing Electron runtime is shipped in the installer despite its devDependency classification. Do not change package version, scripts, build policy, source behavior, user settings or other checkouts.

These are selected targets, **not resolved or installed versions**. Electron 44.7.0 is the current stable release from October 7 and uses Chromium 152.0.7977.130 / Node 24.21.0. Official stable history: https://releases.electronjs.org/release?channel=stable . Electron supports the latest three major versions: https://www.electronjs.org/docs/latest/tutorial/electron-timelines . Builder 26.17.0 and updater 6.8.10 are listed as stable releases; do not select builder 27/updater 7 alpha: https://github.com/electron-userland/electron-builder/releases . Exact upstream compatibility is still subject to package resolution and regression evidence.

## Existing audit evidence

Read-only `npm audit --json --ignore-scripts` on this checkout reported 27 package findings: 1 critical, 21 high, 4 moderate, 1 low. The critical tar finding lies in the build dependency graph; this does not establish that the running launcher handles untrusted tar archives.

Read-only `npm audit --json --omit=dev --ignore-scripts` reported three high package findings: electron-updater, its builder-util-runtime dependency and js-yaml. These are package counts, not three independent demonstrated exploits.

- Credential forwarding on cross-origin updater redirects is patched in builder-util-runtime >=9.7.0. Advisory: https://github.com/advisories/GHSA-p2f4-r6v6-j797 . The scoped updater code does not set custom credential headers and the product uses public GitHub releases, so actual credential theft is conditional, not demonstrated.
- Current js-yaml lock is 4.1.1; the current audit reports CPU denial-of-service advisories affecting versions below 4.3.2. Example: https://github.com/advisories/GHSA-2883-xcg3-v3hh . Verify the final resolved production YAML parser is patched; malicious update metadata is a relevant input boundary.

No audit was run against a changed dependency tree; no remediation success is claimed.

## Execution blocker and preserved state

The exact attempted command was:

```text
npm install --package-lock-only --ignore-scripts --save-exact electron@44.7.0 electron-builder@26.17.0 electron-updater@6.8.10
```

It was rejected before execution by `[P9:long-command-timeout]`: `electron-builder` matches the measured long-command list and the calling API has no `timeout` field. `yield_time_ms` is not a deadline. No install, lifecycle script, Electron download, app/native/helper launch or build occurred. The command is **not an execution plan to replay unchanged**: a reviewed bounded ownership route must exist first and npm's dependency classification must be verified before accepting its result.

The configured user hook's Windows route points to `C:/Users/AnGeLZzZ/.codex/hooks/command-safety-route/timeout-v1/timeout-compatibility-hook.mjs`. Inspection of its fixed policy shows that only the frozen `guard-safety-selftests` bootstrap is enrolled. Arbitrary npm installs, checks and builds are not enrolled; its activation receipt also labels new-hook execution unverified. The studio's canonical bounded-check helper provides a private kill-on-close Windows Job and a 600000 ms deadline, but its presence does not enroll a new command in the deployed hook. No hook, global configuration, bootstrap, safety route or other studio file was edited or bypassed.

Both product dependency files remain unchanged and consistent. This document is the only implementation-task output. No task scratch was created; no uncertain existing output was removed.

## Resume and compatibility checks

1. Establish an independently reviewed, deployed route for exact dependency resolution/install commands, with the same 600000 ms total deadline, private descendant ownership and verified closure. Do not disguise the command or disable guard checks.
2. Apply the three exact declarations in the proper dependency sections, regenerate the lock with lifecycle scripts disabled, inspect root dependency classification and the resolved tree, and run production/full audits. Avoid blanket `audit fix --force`; any required override needs a specific compatibility rationale.
3. Install exactly from the accepted lock in an isolated owned workspace. Inspect and explicitly authorize Electron/koffi lifecycle work before executing it; neither an npm declaration nor installer need authorizes desktop interaction.
4. Inspect Electron breaking changes across 33–44 and the actual main/preload/renderer/native APIs. Current product uses BaseWindow/BrowserWindow, globalShortcut, context bridges, nativeImage icon helpers and koffi Win32 bindings. A static API inventory is not a behavior-preservation verdict. Check icon codecs, native ABI loading, transparent desktop region windows, display coordinate conversion, tray exit, hotkey registration and updater check/download/install paths. Stop if migration requires a feature or UI redesign.
5. Use the reviewed offscreen harness only after verifying that its dependency/API assumptions hold under the new Electron; run its guard self-tests before accepting rendered checks. Run pure tests via a reviewed bounded route. Do not launch the product against the real user profile or collide with the user's running instance.
6. Build only through a reviewed nonpublishing route; preserve existing release commands and Sully's ownership. Confirm packaged dependency/runtime identity and NSIS/native integration. Desktop/native checks still require the applicable fresh away window and safe isolation.
7. Apply `.claude/skills/qa-handoff/SKILL.md` protocol 2: reviewed immutable complete source/harness/runtime/checker identities and declared lifecycle/check graph; sender and Futaba run identical canonical invocation sequentially and report actual matching receipts. No receipt exists for this task. Formal handoff, build, behavior QA and release clearance remain unavailable.

## Sully file boundary after completion

Eventually: `package.json`, `package-lock.json`, this evidence document, and only explicitly reviewed minimal compatibility files if necessary. Current state is **blocked, not ready to bump or release**; the documentation alone is not a dependency milestone.

## Concrete narrow enrollment proposal — not deployed

The requested approval boundary is **QuickLaunch dependency resolution and isolated validation only**, with the existing guard still evaluating visible logical commands. No arbitrary command ID, shell alias, wildcard cwd, global timeout exemption or change to original safety policy is proposed. The existing fixed guard-selftest enrollment must remain unchanged.

Use the already reviewed `runOwned` implementation only after independent confirmation that its current hashes and deployment satisfy the route contract. Each operation has one monotonic 600000 ms budget covering setup, work and descendants; `runOwned` receives only the remaining budget. Ownership is its private non-inheritable kill-on-close Windows Job, assigned before releasing child work, without breakaway. Fail closed on ownership, assignment, identity, duplicate, timeout or closure uncertainty; report the actual child exit/closure result. Enrollment must validate the exact executable/argv/cwd against pinned inputs rather than accept caller-supplied arbitrary command text. The existing `koffiRoot` used for ownership must be a separately byte-pinned installed ownership addon, independent of the product dependency tree being changed; that pin remains to be established.

Current inspected file hashes (SHA256; freeze and independently reverify before execution):

| File | Hash |
|---|---|
| C:/Program Files/nodejs/node.exe | cea6ac365f9bb9586dafd2084d996e092e7d3e7d07ab52d1f76bf53d1fca9bc4 |
| C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js | 3ce7cba6f5128dd5f54c98b6a5036b0f850496878cc2e21044b675fe3c594e3e |
| studio .claude/skills/qa-handoff/scripts/bounded-check.mjs | d06e3ff5b3ab4ab32df8752a4d45525f0eeae04e39720a80ea295374120e8b1f |
| studio .claude/skills/qa-handoff/scripts/bounded-child.mjs | c8278cb57c7882dba98dd3d004ced6d35a26e994b719b737dab4133ed39ffe94 |

Source HEAD verified: `f52f4ea2996309a63857e48a17695d0ce2395b56`. Repo was clean before this new evidence document. Package/lock/source snapshot hashes and future installed dependency/build/check manifests must be recorded before each relevant operation; no such manifests currently exist.

Concrete first enrollment entry:

- Executable: `C:/Program Files/nodejs/node.exe`.
- Argv: `["C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js", "install", "--package-lock-only", "--ignore-scripts", "--no-fund", "--no-audit"]`.
- Cwd: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch-release-1.95.0`.
- Precondition: only the three reviewed declarations have been changed in their existing dependency sections; product version remains 1.104.0; a byte-pinned preimage and explicit manifest rollback are available. This entry may resolve the lock only and runs no lifecycle scripts. On resolution failure, restore only this task's own manifest change after verifying no concurrent edit; preserve evidence and report.

Subsequent exact entries require separate frozen input identities, not a broad install/build allowance:

- Isolated dependency install: same executable, argv `["C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js", "ci", "--ignore-scripts", "--no-fund", "--no-audit"]`; cwd fixed to the complete immutable copied project at `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch-release-1.95.0/scratch/2026-10-12-dependency-update/validation`. Freeze the accepted lock and full source before use. This does not authorize dependency lifecycle execution; inspect and enroll necessary download/setup code separately.
- Pure checks: same executable, argv `["--test", "test/"]` and `["scripts/check-theme-contrast.js"]`, cwd that same validation copy, each with its frozen complete transitive test/module manifest. Review module imports to confirm pure-node classification before enrollment.
- Offscreen harness self-test: same executable, argv `["scripts/theme-gallery/run.mjs", "--self-test"]`; hover check argv `["scripts/theme-gallery/run.mjs", "--hover-check"]`, cwd the validation copy. Freeze the actual Electron runtime and harness/import/input manifests, validate its no-intrusion guard first, and require ownership of every Electron descendant. The current harness spawns Electron and uses registry-before/after comparisons; these entries therefore remain **conditional**, not authorized merely by this proposal.
- Nonpublishing packaging: same executable, argv `["node_modules/electron-builder/cli.js", "--win", "--publish", "never", "--config.directories.output=scratch/dependency-package"]`, cwd the validation copy. Freeze the resolved CLI/build/lifecycle graph first; explicitly enroll only necessary native rebuild/installer descendants after review. No publishing token, real profile or installed product is allowed. The direct reviewed packaging entry avoids `npm run build`, whose existing scripts publish and clean output; it does not modify the canonical release path. Final installer/tray/native behavior checks remain pending the reviewed isolation and applicable away window.

Formal protocol-2 entry checks need their own immutable context and exact canonical command enrollment. They cannot inherit enrollment from these separate checks or claim a receipt from mock/static output.

## Compatibility preflight follow-up

Senua's final upstream review flagged three concrete compatibility boundaries plus one harness setup boundary. These findings must be resolved before claiming behavior preservation.

- Electron 43 changes the default Windows file-dialog location when `defaultPath` is unspecified. Inspect every `dialog.showOpenDialog` call in `src/main/ipc.js` and preserve its current intended starting-folder behavior with the smallest explicit option if required. [Official dialog change](https://www.electronjs.org/docs/latest/breaking-changes#behavior-changed-dialog-methods-default-to-downloads-directory).
- NativeImage bitmap conversion now normalizes sRGB by default. `src/main/icon-trim.js:12` calls `toBitmap()` and compares raw BGRA pixels; `src/main/ipc.js` has another bitmap comparison. Compare old/new conversion semantics and exact icon fixtures before altering options. No color/threshold redesign is authorized. [Official bitmap change](https://www.electronjs.org/docs/latest/breaking-changes#behavior-changed-nativeimagetobitmap-now-normalizes-color-space).
- `scripts/nsis/installer.nsh` explicitly copies the stock app-builder-lib 25.1.8 removal block and requires review on builder upgrades. Senua confirmed the 26.17 stock removal block adds `SetOutPath $TEMP`, missing in the product macro. Compare the entire actual resolved 26.17 template; preserve update skip of `--ql-restore-all`, restore-before-removal on real uninstall, busy-file handling and preservation of user shortcut data. Do not assume adding one line alone establishes compatibility. [Target upstream template](https://github.com/electron-userland/electron-builder/blob/electron-builder%4026.17.0/packages/app-builder-lib/templates/nsis/uninstaller.nsh).
- Electron 42+ can make `require('electron')` perform lazy runtime installation. `scripts/theme-gallery/run.mjs:361` resolves Electron this way. Enroll reviewed runtime acquisition/setup before any harness import; an apparently static import may download or spawn a setup process. A missing runtime must fail closed rather than install implicitly during QA. [Official install change](https://www.electronjs.org/docs/latest/breaking-changes#behavior-changed-electron-no-longer-downloads-itself-via-postinstall-script).

None of these source files has been changed, and none of the identified behavior has been run against a new runtime. Stop and report if preserving existing behavior would demand a redesign beyond minimal migration changes.

## Fresh-session continuation gate — 2026-10-12 09:01 UTC

The accepted deployed hook configuration and twelve final reviewed route hashes still match, and product HEAD remains `f52f4ea2996309a63857e48a17695d0ce2395b56`. Actual host `exec_command` calls are mapped to the expected Bash envelope and now produce fresh attributable hook evidence. Positive `node --version` call `66c701` corresponds to `outer-hook-1791795679469117800`. However, reserved-prefix inert negative call `8f44b6` executed its print and exited0 even though its exact `outer-hook-1791795687930320800/stdout.log` contains the required explicit denial `[quicklaunch-fixed-route] Altered candidate invocation`.

**STOP: invocation active, denial not enforced by this host path.** No installation, production loader, lifecycle, download, build, application launch or dependency-file edit was attempted. The prior missing-invocation blocker has progressed to a concrete host-enforcement failure; successful hook subprocess execution is insufficient. Preserve evidence and verify a supported execution path that actually honors the denial before resuming the exact reviewed lock-only entry. No further entry is enrolled, and no QA/release clearance is claimed.

The emitted denial JSON parses and has the expected event/decision schema. It was written within about0.493 seconds against a10-second configured timeout; the host call returned in2.5 seconds with empty hook stderr. Final hook exit/closure and host acceptance are not present in the outer evidence. The reason execution proceeded remains unknown; no host-bug diagnosis or claim that CLI enforcement will work is made.
