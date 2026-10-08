# QuickLaunch native QA isolation — independent fake-only QA

Futaba · 2026-10-09 local date · inherited Codex tier · version1.94.3. Read contracts committed68b13ea andcf55bf2, implementation candidate report and exact selected tests/runner. User checkpoint STOP: finish existing evidence/report and closure only; no further tests.

**Verdict:** NO-GO

StageA candidate is blocked by the launcher log-write confinement gap. The selected Node fakes pass, but neither that result nor static artifact preflight clears native execution, formal entry receipts, StageB or release. No app/Electron/native/input/profile/system/startup/registry operation was performed by this QA run.

## Verified immutable candidate

Ender source manifest `scratch/2026-10-09-native-isolation-ender/source-manifest.json`, SHA256 `f895aafe7326dd22e260409ba3794da502383f83926aca7629c7bae899c40007`. Every339 product/runner entry and2 separate studio entries independently matched before/after/final checkpoint. Product baseline `e5bd5b9caf9f6bd72c6541e0494be9510d4f8681`; studio baseline `e0bf1d332224daac14b111208250944f68310d57`. The ten owned product overlays and two studio files are exactly those enumerated in the implementation report; concurrent Batch08 renderer CSS is excluded.

Implementation report SHA256 `122919c17bd7b144965d9a7207a0fcf0e223a3fc9d46d17f385495de72d30c72` independently verified. Nodev26.10.0 SHA256 `cea6ac365f9bb9586dafd2084d996e092e7d3e7d07ab52d1f76bf53d1fca9bc4`; reviewed runner SHA256 `7b8dfecdf57ec2f7dad9963456fcc6fa55703ca7798b74e99e9cc1ecfa1f0f45`. Negative-control preload SHA256 `b5f77a0781f9cf746149c446ad201983d6483ecfd4616ca3a5caa4a6307acaec`. Studio guard SHA256 `369f3313ea00559a7ce8ba3ed14a248f409c482a7f0c49777491704cd7843113`; isolation-only guard test SHA256 `5fda8bcbc50b7d945db7f37e7696e29038cfc5ef8131a7ca682a3ddfb9140be2`.

QA scratch is `scratch/2026-10-09-native-isolation-futaba/`. Identity-before.json, identity-after.json and identity-final-after.json record unchanged hashes/counts. No pin, product, checker, guard, global hook, policy or permission bytes changed. No git/version/release/dependency/build action occurred.

## Actual fake-only results

Exact product command from frozenpin: pinnedNode `run-owned.cjs`. This runner allowlists four files with `--test --test-isolation=none`: qa-isolation.test.js, qa-isolation-store.test.js, qa-isolation-startup.test.js, qa-isolation-side-effects.test.js. No general suite or npm lifecycle graph was invoked.

- **20 focused callbacks pass.** Node reports21/21 because importing the helper test file contributes a loader-file item. Product.log SHA256 `aa81c80be1f91d72979b93d13477e1829936910afdfb4a44180da7792b413631`; actual runner closure code0/signalnull/closedtrue.
- **6/6 guard isolation-only checks pass**, exact argument `--isolation-only`. Its branch skips the legacy registry/process/sleeper suite. Guard.log SHA256 `466932eef2a86799354c2a49620099d782ddf420fb83a27b451e1aaf41da6076`. Fake artifact/seed trees and registry objects only; no actual system readiness/launcher route.
- Three valid in-memory broken controls fail through the unchanged runner: snapshot freeze removed→**1 failed callback**; Store snapshot-constructor branch removed→**5**; lifetime hotkey guard removed→**2**. Each actual code1,signalnull,closedtrue is recorded in mutants-owner.json and mutant-snapshot.log/mutant-store.log/mutant-hotkey.log. Reviewed source bytes remain unchanged.

Tests exercise immutable branded context, malformed/conflicting requested mode, roots/seed/schema/equivalence/link/drift refusal, both effective Electron paths before lock, rejected lock with no fallback, actual Store constructor/recovery/repeated-owned-write/error latch, direct IPC/tray/updater/lifetime-hotkey guards with throwing/recording fakes. Actual controller `_initMoves` plus actual Mover subclass records zero Journal.load and native/filesystem move effects for unavailable StageA setup. Constructor entries are not falsely called zero side effects/zero objects.

Normal-mode regression evidence is specifically ordinary Store/default/settings behavior, tray login callback and hotkey registration controls. There is no separate complete normal-entry boot run. Manager constructor receives `testHooks:false`; this proves absence of the hidden-test flag in that fake wiring, **not an actual visible Manager window**. No real Manager/window was launched. These distinctions remain explicit in the checkpoint.

## Blocking findings and missing negative coverage

**Blocker — native isolation safety boundary fails (Senua Critical construction finding independently confirmed by source inspection).** Studio guard line761 executes `openSync(logPath,'w')`, with logPath `profile/ql-safe-launch.log`, before child launch. The preceding native preflight validates artifact/seed correspondence but does not establish this log child as an absent or canonical regular, single-link confined target. A preexisting symlink/hardlink can therefore redirect/truncate an external file before product validation. Path joining a confined profile does not prove the child target is confined. No unsafe real link/log write was attempted; the finding is based on the exact pinned consumer, not a hypothetical new file scope.

The six guard fakes do not cover log-link/hardlink targets, log identity drift/open-write failure or the actual launch-log writer. They also do not exercise the actual asynchronous product receipt/exit/watchdog lifetime route. Static fake artifact acceptance cannot stand in for those coverage vectors. Corrected owned code and focused fake regression are required before any scoped StageA GO; follow Senua/root disposition for the other lifetime findings under review. No waiver or silent expansion to native/full-guard tests is allowed.

No new extra negative tests were launched after the stop instruction. The requested missing-coverage audit remains an explicit gap and reason to await the corrected pin, not an invented passing vector. StageB journal/move snapshot and packaged correspondence remain separately pending.

## Retained failed setup and ownership

Initial three negative attempts exited1 **before tests** because Windows backslashes in NODE_OPTIONS were consumed while parsing the preload path. Their identical negative-snapshot.log/negative-store.log/negative-hotkey.log are retained and are **not** accepted mutant evidence. A separate syntax-checked mutant-only supervisor used forward-slash preload paths; its three valid runs record the expected failed-callback counts and inner runner closures. Positive product/guard runs were not repeated. An evidence-index one-line shell quoting error also occurred; a saved index-evidence.cjs corrected assembly without rerunning tests or changing outcomes.

Both QA supervisors write their owner record before child creation and enforce one600000ms aggregate fake-only deadline. First ownerPID49200 supervised productPID54384, guard57912 and three rejected-preload attempts73408/31980/39328; all close records are actual status/signal/error entries in owner.json. Mutants-owner.json contains the three subsequent actual mutant runner PIDs and closure lines. The reviewed product runner adds one Node test child for each valid product/mutant invocation; its closure is recorded, but its unlogged child PID is not fabricated. Counts distinguish five first-supervisor launches, three corrected mutant launches and four actual inner-runner closure records; no claim of an observed native process tree is made.

All supervisors finished normally; final exact native-isolation scratch Node-only CIM query returns zero matching processes. Every source/studio/runtime/preload identity reverified at the final checkpoint. No global/user process was killed; no duplicate live run remains. Setup failures are retained rather than counted as mutant detection.

Pattern alert — passing unit/static preflight checks omit a first-write/lifetime safety boundary. **Disposition: fix via Ender under Senua/root's exact scoped findings, then independently rerun corrected fake vectors; current candidate stays NO-GO.** Formal/native/product-Quit/release gaps **defer unchanged**. QA changed only its scratch and this new report.

Next handoff: preserve this failing candidate/evidence; await corrected immutable StageA pin with reviewed log-target and lifetime guards/tests. Theme08 acceptance awaits its separately complete paint/runtime/harness handoff. No work continues past this user stop checkpoint.
