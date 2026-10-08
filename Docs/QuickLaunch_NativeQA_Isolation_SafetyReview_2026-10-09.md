# QuickLaunch native QA isolation — Stage A candidate safety review

**Scoped implementation verdict:** NO-GO — one open Critical safety-floor finding; launcher evidence/lifecycle gaps also remain.

Senua, inherited Codex model tier; legacy opus unavailable. This reviews an uncommitted QA-isolation candidate, not a release commit range, RELEASE CLEAR/BLOCKED, Futaba GO, formal qa-handoff receipt, packaged artifact or native acceptance. Current away window expired. User requested a logical checkpoint and handoff; review stopped after documenting current findings. No implementation, build, dependency install, native/Electron application, registry/process-management test, real input, display/settings change, sleep or git mutation was performed. Only read-only inspection, the two audited fake-only test routes and this new report were performed.

## Exact candidate and independent evidence

Authority: safety design `68b13eab4a4d6bc377cb7dfca9a7e33e504258f7`; Store addendum `cf55bf2191380605f9729b2f1c060afa7ba2ba8d`. Stage B is deferred and is not reviewed/cleared here.

Product pin: `scratch/2026-10-09-native-isolation-ender/pin`, baseline `e5bd5b9caf9f6bd72c6541e0494be9510d4f8681`. Studio pin: sibling `studio-pin`, baseline `e0bf1d332224daac14b111208250944f68310d57`. Manifest `source-manifest.json` SHA256 `f895aafe7326dd22e260409ba3794da502383f83926aca7629c7bae899c40007`; implementation report SHA256 `122919c17bd7b144965d9a7207a0fcf0e223a3fc9d46d17f385495de72d30c72`.

Independent verification used SHA256 over every listed pinned file: 339 product/runner entries plus 2 studio entries, zero mismatches. All 328 entries labelled committed-baseline were additionally compared by Git blob hash against the exact product baseline, zero mismatches (`ls-tree` plus `hash-object --no-filters --stdin-paths`). The remaining product entries are ten owned drafts and the runner. Concurrent eight Batch08 CSS drafts are absent from the reviewed candidate; none were edited.

Studio candidate hashes: guard `369f3313ea00559a7ce8ba3ed14a248f409c482a7f0c49777491704cd7843113`; guard test `5fda8bcbc50b7d945db7f37e7696e29038cfc5ef8131a7ca682a3ddfb9140be2`. Runtime `C:/Program Files/nodejs/node.exe` SHA256 `cea6ac365f9bb9586dafd2084d996e092e7d3e7d07ab52d1f76bf53d1fca9bc4`; owned runner SHA256 `7b8dfecdf57ec2f7dad9963456fcc6fa55703ca7798b74e99e9cc1ecfa1f0f45`.

After auditing exact test imports and runner, independently reran from their pinned directories with no NODE_OPTIONS or negative-control environment:

- `C:/Program Files/nodejs/node.exe run-owned.cjs`: exit 0, 21/21 Node items, 20 actual test callbacks. Count method: enumerate `test(...)` registrations across four exact files; six validator + six Store + four startup + four side-effect callbacks. The imported helper file contributes the additional loader item. Closure receipt: `{"ownedNodeOnly":true,"deadlineMs":600000,"code":0,"signal":null,"closed":true}`.
- `C:/Program Files/nodejs/node.exe scripts/qa/quicklaunch-safe-launch.test.mjs --isolation-only`: exit 0, 6/6 fake checks. This mode skips the legacy real registry/process/sleeper suite. No native process or fixture files were created by these tests; product writes and registry effects were recording fakes.

Recorded Ender outputs were independently hash-verified: focused output `570d47feaa4248992ac8acb7da2f888ef84c274b7a8b1bfcae5d7800480ed2e8`, guard output `a0af7cae7b1955158b0e4db497b634e49a77e17d8113b34ac42f0079b3b76eaf`, in-memory negative-control preload `b5f77a0781f9cf746149c446ad201983d6483ecfd4616ca3a5caa4a6307acaec`. Reviewed those mutation definitions and recorded failure/closure evidence; did not rerun mutants or syntax checks at the checkpoint. Thirteen syntax passes and three mutant failures remain Ender's recorded evidence, not an independent reproduction claim.

## Findings

### S1 — Critical: launcher truncates an unvalidated linked log target

`scripts/qa/quicklaunch-safe-launch.mjs:759–761` constructs `join(profile, LOG_FILE)` then `openSync(logPath, 'w')` before spawning the product. `nativeIsolationPreflight:224–246` validates the manifest/artifact and three seed files, but never validates or reserves `ql-safe-launch.log`. Product validator similarly validates seed/journal inputs, not this launcher log, and runs only after this write.

A valid otherwise-confined temp profile can contain a pre-existing log symlink or hard link to an unrelated file. Directory realpath and all seed checks pass; opening the log with `w` follows that target and truncates it. No concurrent race or application execution is needed for the gap. This violates ProcessRules § Severity definitions — one canon, always-blocking safety floor (out-of-scope writes). A later product refusal cannot undo the write.

**Minimum correction scope:** studio guard and guard tests. For the native route exclusively create a new owned regular log with an exclusive no-overwrite operation that refuses any pre-existing directory/file/link entry; confirm canonical parent/owned identity, retain the owned handle for stdout and never reopen by an unproved path for mutation. Do not replace this with a permissive pathname stat followed by `w`. Profile/root validation must occur before any launcher mutation. Fake tests must supply existing regular, symlink/reparse, hard-link and directory log entries and prove zero truncate/write/spawn. Legacy behavior changes require explicit scope. No native launch until independently reviewed correction.

### S2 — Major: an early entry receipt and failed application can still produce launcher PASS

Product `src/main/index.js:11` prints `[qa-isolation]` before the lock (`:26`), Store (`:66`), controller initialization and updater/IPC/tray setup. Isolated lock failure still exits 0; the startup test expressly asserts this. Guard `:875–882` treats that early receipt as validated product isolation, while `exitInfo.code/signal` is only displayed (`:867`) and never made a failure. After an early receipt, a Store drift refusal/unhandled error or other abnormal exit can therefore still meet the guard's PASS conditions if snapshots/cleanup match. The receipt proves path setup, not successful guarded startup or Quit.

**Minimum correction scope:** product index/startup tests, studio guard/tests. Give requested isolated lock failure a distinct failure status; emit a readiness receipt only after the defined successful startup boundary, or retain an explicitly named entry receipt and require a second ready receipt. Preserve prelock validation order. Native route must fail abnormal exit/signal/spawn error and must distinguish normal owned Quit from watchdog/timeout cleanup. Fake integrated guard tests must prove early receipt + lock denial, early receipt + nonzero/signal/crash and missing ready receipt cannot PASS. Do not certify forced cleanup as Quit acceptance.

### S3 — Major: missing ownership can leave the owned child alive; watchdog PID is not lifetime proof

Guard `:811–825` requires root identity, launcher identity, watchdog object/PID and absence of a watchdog spawn error. It does not observe unexpected watchdog exit or require a ready acknowledgement. A watchdog that obtains a PID then exits/crashes can leave the main loop running without independent closure protection.

On missing root identity, the new route breaks immediately, but `endTree` (`:564–590`) returns verified-empty when `ourTree` is empty. `ourTree` deliberately yields nothing for `root.created == null`; this path does not end the root through the retained child handle. Stray classification may report the child left running, but there is no established watchdog and no unconditional owned-handle closure here. This is a failed cleanup condition, not proof of a safe stopped run.

**Minimum correction scope:** studio guard/tests. Always end the owned root through its retained handle when readiness/identity fails, without killing unrelated processes; treat descendant proof as unverified if unavailable. Establish watchdog readiness/identity and fail/close on unexpected exit during an active root lifetime. Observe exit/error and final closure of the watchdog itself. Test these branches with fake spawn/process/clock/registry adapters against actual main/cleanup control flow, not live sleepers. No image-name kills or invented stronger Job Object claims.

### S4 — Major: native route accepts unresolved real-profile change and unsafe postrun seed as warnings

Guard `:907–925` warns rather than fails when the real-profile signature changes while a real instance was seen. `:929–931` only warns if the postrun seed is corrupt/unsafe. Native acceptance requires preserved real-profile evidence and a safe isolated session; overlap means attribution is uncertain, not that preservation was proved. These legacy warnings cannot serve as the new route's safety PASS.

**Minimum correction scope:** studio guard/tests. Native route fails/refuses unresolved real-profile changes and unsafe/unreadable postrun state; report uncertainty without attempting restoration or blaming another instance. Legacy warning behavior may remain separately scoped. Fake main-result tests must cover both outcomes and prevent PASS.

### S5 — Major: safety evidence misses the launcher paths with the open defects

Six guard checks cover parsing, hash refusal, registry diff and a re-evaluated `nativeIsolationPreflight` function. In the complete fake attestation check, `checkProfilePath` is replaced with an unconditional success stub. No check exercises actual main log creation/spawn/watchdog lifecycle/receipt verdict/postrun safety branches. Thus six passes cannot substantiate those contract claims. Product startup uses stub Store/Controller/Manager; actual Store is tested separately, and IPC uses a source slice ending before later Manager/test-hook handlers. No test directly exercises visible Manager.open or manager:test refusal with the full setup.

Missing required negative evidence also includes canonical protected-root aliases, candidate read/identity drift at constructor handoff, late generation/link drift during each durable write phase, interrupted owned rename states, lifetime reconciled handler, fake login-state true/false boot matrix, updater event tray effects and actual no-move startup with nonempty fixture refs. Existing tests are useful but the implementation report's broader claims exceed their coverage.

**Minimum correction scope:** the four owned product tests plus guard tests; implementation report. Add only bounded recording-fake coverage of actual consumer/control-flow branches, or explicitly leave each unproved contract item pending. Do not run a broad Electron/native/full guard suite to fill this gap. Keep callback/item counts and claims accurate.

### S6 — Minor: updater events are not completely inert as described

`src/main/updater.js:66–71` suppresses `publish('update-available')` in isolation but still calls `setTrayUpdateAvailable(true)`. Event handlers similarly retain tray mutations. The updater test stubs this function without recording it, so state remains none while the tray can acquire an update indicator. No check/download/install effect was found through the guarded routes, but "event routes stay inert" is overstated.

**Minimum correction scope:** updater and side-effect tests, or narrow the documented contract explicitly. Guard whole event callbacks when isolation requires no update offers/indicators; test tray callback counts as well as network/install counts.

## Proven construction properties and limits

The inspected candidate places validation/effective userData + sessionData confirmation before lock, loads Store from a branded deeply frozen process-local snapshot and keeps normal Store recovery out of QA construction/recheck. Setter/flush whole-state checks and generation tracking prevent observed unsafe state/drift from reaching ordinary fallback writers. Actual setters for autostart are guarded across boot/tray/IPC; global-hotkey registration has a lifetime context gate; update check/download/install and launch-app effects have context gates. Raw flags/renderer copies cannot create the WeakMap capability. Normal mode controls in the focused tests retain ordinary Store defaults, tray login callback and hotkey registration. Broader normal behavior regression remains unproved.

Consumers inspected: index, QA validator/capability, Store constructor/set/load/recheck/flush, setupIPC/launch-app/save-settings/set-auto-launch, tray callbacks, updater direct exports/handlers/events and existing Controller->Mover unavailable path. Manager/preload test privileges remain separate; the parser rejects test-hook/restore/renderer switches. There is no reviewed Stage B context handoff.

Stage A uses unavailable moveSetup with empty folders. Actual controller `_initMoves` plus actual Mover under recording Journal/native fakes demonstrated zero journal load/reconcile/native move for the tested empty-app route. Validator only permits fixture-confined ref apps and requires journal/history absence; this is not native file-move acceptance, and the nonempty-ref integrated route remains missing evidence. No-move does not clear original drag/drop/move requirements.

Canonical checks before pathname operations are explicitly not atomic/OS-enforced defense against hostile concurrent path replacement. The report preserves that documented limitation; it does not excuse S1's already-existing link or any missing negative control. No artifact was built; source/package/native runtime correspondence, complete formal check graph, registry before/after, real instance identity/foreground preservation, native behavior and fresh timed-away authorization remain pending.

## Checkpoint handoff

Do not launch this candidate or advance Stage B. Preserve these exact pins and candidate hashes for correction/review. Route S1–S5's studio changes to Ender and the explicitly named product/index/updater/test/report corrections through a bounded brief; Sully owns commits/pushes. All known findings above remain open. This report makes no full release review claim and introduces no hook/policy/permissions/version/release work.
