# QuickLaunch native QA isolation — safety design review

**Design verdict:** CONDITIONAL DESIGN ACCEPTANCE — implement the contract below; current baseline is NOT safe for native acceptance launch.

This is a prerequisite design review, not RELEASE CLEAR, Futaba GO, artifact attestation or launch authorization. The away window has expired. No application/process test, native input, display/settings change, sleep, registry write, build, install, dependency operation or git mutation was performed. Only read-only inspection and this new report were performed. Senua used the inherited Codex model tier; legacy opus is unavailable.

## Evidence identity

- Product source: `WIP/QuickLaunch-integration` HEAD `91396260b4a127bcbb2546974f331c6f77841949`. Product inspection used `git show 9139626:<path>`; sibling Batch08 working edits were neither included nor modified.
- Studio launcher source/tests: studio HEAD `bc2a1568826e0b5a8847ace2835c0b23410f9441`, clean for the two inspected script pathspecs. `scripts/qa/quicklaunch-safe-launch.mjs` SHA256 `A885E727680BA61AAE76FD96CFA0E93DD906A3C9A0620D2018EDD7B44223505F`; its `.test.mjs` SHA256 `4B8FF002C2E23805C8B47D08C3459E8A4F131189241E3E45B1B07291B5D9CDF6`.
- Plan: `Docs/QuickLaunch_NativeQA_ReadinessPlan_2026-10-08.md`, disk SHA256 `E9E56BE3E7C078E2AC980935703A9907E87BEEABC0422439566BFB01C30B4B08`. It is absent from product commit 9139626. Commit the plan and this design before an implementation brief cites them (ProcessRules § Delegation-brief hardening).
- Policy read: `Team/Docs/DelegationPrimer.md`; ProcessRules § Our tooling must not intrude on Sergei's machine, § Severity definitions — one canon, § Delegation-brief hardening and the real-input/away-window rule. Severity meanings remain in their canonical section.

Line references below describe the inspected baseline. Findings concern the proposed acceptance route; they are not a comprehensive release review.

## What is broken

1. **Critical safety prerequisite: false autostart seed does not prevent writes.** `src/main/index.js:161–174` calls the packaged login-item setter when actual startup state differs. The user's enabled entry can therefore be deleted by a seed requesting false. Registry diffing observes the damage after it occurs. There are additional setters in `src/main/tray.js:133` and `src/main/ipc.js:646` (`set-auto-launch`), reachable during visible Manager/tray acceptance. Guard all three; skipping boot reconciliation alone is insufficient.

2. **Critical safety prerequisite: isolation is checked after the single-instance lock.** `src/main/index.js:12–16` requests the lock before `resolveMoveSetup` and before Store. `index.js:179–181` responds to a second instance by showing the running instance's regions. Neither launcher process classification nor a temp flag proves the effective Electron profile before this lock. A rejected launch must never notify the user's existing instance.

3. **Critical safety prerequisite: safe seed is not a session-wide hotkey guarantee.** `index.js:147` applies the loaded hotkey; the reconciled listener reapplies it; `index.js:230` exposes `apply-global-hotkey`. Store `_load()` uses defaults on missing/corrupt/locked candidates, and `_defaults()` enables Ctrl+Space and startup. Launcher `checkSeedData` accepts other modifier hotkeys with a warning (`scripts/qa/quicklaunch-safe-launch.mjs:286–291`). Those still interfere with the machine. In the isolated route, all registration calls must be prevented even after IPC or disk reconciliation.

4. **Major design gap: no-update-check is only a timer switch.** `src/main/updater.js:118–121` suppresses automatic checks but `checkForUpdates` still invokes the network (`:124–134`); tray `:162`, IPC `check-update` (`ipc.js:652`), and download/install handlers (`updater.js:89,110`) remain active. An isolation context must suppress all network/download/install effects, including stale update state and direct exported calls.

5. **Critical safety prerequisite for visible acceptance: ordinary launch IPC is live.** `src/main/ipc.js:310–371` permits stored paths and also unstored `shell:`/`steam://` protocols, invoking Explorer or `shell.openPath`. `--ql-test-hooks` records launches but also hides Manager (`manager.js:97–100`) and enables test-only IPC. Safe fixture paths alone do not prove a shortcut target is harmless, and shell-launched applications need not be descendants of the launcher. For this bounded acceptance mode, reject external launch requests rather than invoking associations. Testing actual harmless application launch is a separately scoped acceptance action with explicit ownership/closure proof; this mode must not silently grant it.

6. **Major design gap: launcher preflight is weaker than the proposal.** `parseArgs` only forbids extra user-data-dir switches (`safe-launch.mjs:196–202`). It does not require the isolation mode, fixture root, no-update switch or absence of restore/test-hook conflicts. `checkSeedDir` permits missing .tmp, creates missing .bak at launch, and does not establish equivalence between candidates. `--check` exits before reading registry (`:710–724`); PREFLIGHT OK does not attest registry readability or app isolation. Update the mode-specific contract and receipts without claiming legacy checks prove the new route.

7. **Major design gap: directory confinement does not confine individual seed links.** Launcher resolves profile directory but reads seed children normally. A linked seed can be outside that directory; Store writes/rotates/quarantines those paths. Require regular seed files whose final canonical paths remain inside the owned profile, refuse linked/reparse seed candidates and handle hard-link ambiguity conservatively. Product `moves/setup.js` preserves useful fixture checks; `moves/rules.js` `testModeCheck` canonicalizes test paths but compares real roots using `path.resolve`, and `realish` can silently walk past errors. New isolation validation must not interpret permission/IO errors as proof. Check canonical real roots too. This is a bounded validator requirement, not a rewrite of move behavior.

Existing launcher watchdog/ownership code is reused, not certified anew here. It starts the child before identifying it and only starts the watchdog if root and launcher identities are obtained (`safe-launch.mjs:724–782`). A plan must not claim unconditional watchdog establishment or Job Object-before-child. Missing identity/watchdog proof is a stopped readiness prerequisite, not license to kill by name or bypass the guard.

## Minimum implementation contract for Ender

This is an EXTEND of committed QuickLaunch plus its maintained studio launcher. Preserve normal-user semantics and Batch08 changes. No hooks, policy/schema/permissions, release/version/dependency, installer, native launch or global tooling work.

1. Add one explicit runtime QA isolation entry point, separate from test hooks. Strictly parse one absolute profile and one absolute fixture root. Reject empty/duplicate/conflicting profile or fixture switches, restore-all, hidden test hooks, unsafe Electron switches or a child/renderer invocation posing as the main QA entry point. A malformed requested mode refuses with a documented nonzero exit; it never falls through to normal boot. Mode absence preserves normal boot.

2. Before Store construction, lock acquisition, native module side effects, controller/windows/tray/updater initialization: validate already-existing owned directories and all three seed candidates using read-only operations. Roots must be canonical strict descendants of the actual validated system temp root; profile and fixture tree are disjoint, unique for this run and overlap no real profile, installed app, updater cache, Desktop/Public Desktop or real shortcut store. Fixture children are canonical and confined. Refuse root ambiguity, unresolvable paths, missing root/seed, alias escape, seed link/reparse ambiguity or unsafe data. Treat TEMP/TMP as environment inputs to verify, not alternative arbitrary trusted locations.

3. Require main/.tmp/.bak to contain equivalent valid safe data at initial acceptance: `settings.startWithWindows === false`, `globalHotkey === null`, `randomTheme === false`, valid current model/schema and owned fixture app paths/region records. No copied real moved paths or recovery journal pointing outside fixture. Validation must include relevant journal/state inputs before mover recovery, not only apps/settings. Existing normal Store fallback remains unchanged. QA boot must detect its actual Store data/settings mismatch and refuse before windows/registration; a read race must never recover into machine-wide effects.

4. Explicitly `app.setPath('userData', validatedCanonicalProfile)` before lock, then verify the canonical effective `app.getPath('userData')` equals the approved profile. Validate any Electron session/cache location that can write separately and place it inside the approved profile. Failure exits before lock. Only then request the isolated single-instance lock. No real-instance notification as a fallback. Emit a nonprivate readiness receipt with exact effective paths and source identity for future guarded native proof.

5. Create a main-process immutable validated isolation context. Pass it explicitly across startup, IPC, tray and updater boundaries; downstream code must not infer authority from a raw CLI flag or a renderer request. Cover EVERY login-item setter and hotkey registration path throughout the process lifetime. QA preferences may be stored only in its profile, but attempts to enable autostart/hotkeys are refused and cannot leave unsafe fallback data. No get/set login-item reconciliation is needed in QA. All check/download/install updater paths return deterministic inert status without network, installer or restart effects. Direct exports, timers and IPC cannot evade this.

6. Keep ordinary Manager creation/open/close semantics; do not set `testHooks` merely to obtain safety. Existing sender validation and sandbox/context isolation stay intact; test-only `manager:test` privileges remain off. Refuse app/protocol launching in this bounded mode. Keep native file moves constrained through existing resolveMoveSetup/Mover confinement, with the new prelock validator strengthening its input proof. Do not relax fixture refusal or interpret unavailable native move support as acceptance PASS.

7. Launcher supplies and validates this exact route with explicit artifact/profile/fixture; no default exe for the new native acceptance path. Require null hotkey, all equivalent seeds, no incompatible arguments, packaged source/manifest correspondence and no installed executable. Keep check/launch statuses distinct: static preflight, registry read readiness, product isolation receipt and behavior evidence are different facts. Do not print private registry data on failure; report key/value-name/type and redacted hashes if needed. Preserve PID+creation ownership, watchdog and timeout <=300s. Missing ownership, registry, artifact or watchdog proof means STOP; no guessed registry restore, broad process kill or repeated launch.

## Exact proposed ownership

Ender owns only these bounded product changes:

- `src/main/index.js`: early validated entry point/order, immutable context and lifetime hotkey guard.
- NEW `src/main/qa-isolation.js`: read-only strict mode/path/seed/state validation; no initialization side effects on import.
- `src/main/ipc.js`: isolation context option, all autostart/update/app-launch IPC effects and unsafe settings rejection.
- `src/main/tray.js`: context option and autostart callback guard; updater calls covered at shared updater boundary.
- `src/main/updater.js`: context option plus centralized check/download/install guards covering exports and handlers.
- NEW `test/window/qa-isolation.test.js`: validator negative cases and linked/fake-filesystem cases.
- NEW `test/window/qa-isolation-startup.test.js`: actual entry point with recording Electron/native mocks and ordered event ledger.
- NEW `test/integration/qa-isolation-side-effects.test.js`: actual IPC/tray/updater route tests with throwing side-effect fakes.
- NEW `Docs/QuickLaunch_NativeQA_Isolation_Implementation_2026-10-09.md`: exact source identity, commands/check results, deviations and pending native proof.

Studio Ender scope, separately committed by Sully: `scripts/qa/quicklaunch-safe-launch.mjs` and `scripts/qa/quicklaunch-safe-launch.test.mjs` for the mode-specific validation/receipt/privacy changes. Do not edit Manager/renderer/CSS, Store or mover implementation as a shortcut. If Store data/journal or ownership proof cannot be achieved within this scope, STOP and report the exact obstacle; expand only through a reviewed brief. Normal tests may be extended only if a documented shared contract requires it.

## Required negative controls and evidence

Use recording fakes, not real Electron/application/native input. Each refused boot asserts ZERO lock requests, Store constructors/writes/quarantines, windows, trays, globalShortcut.register, login-item writes, updater network/install and native move calls. Check complete call order; isolated success must show validation -> setPath/effective path confirmation -> isolated lock -> Store with matching data -> initialization. A lock failure exits with no normal-instance fallback.

- Missing/duplicate/conflicting mode/profile/fixture args, restore/test-hook conflicts, relative paths, system temp itself, same/overlapping profile and fixture, real paths and case/slash/space/bracket/unicode variants.
- Directory and seed link/reparse escapes, existing ancestor alias, canonical real-root alias, unreadable path/seed, malicious TEMP/TMP, missing main/tmp/bak, corrupt/default/unsafe/mismatched seeds, string false, non-null hotkeys (including alternate modifier), unsafe fixture apps and journals, simulated seed change between validation and Store load.
- Fake Electron ignoring setPath or reporting a different profile: refuse before lock; stub second-instance delivery to prove no real ctl.showAll route is taken on rejected boot. Unit proof of order is required; independent native proof remains pending.
- With fake login state true and false, isolated boot/reconciled/Manager set-auto-launch/tray callback must never call the setter. Even direct callbacks called despite UI disablement must be inert. QA settings cannot persist autostart true or hotkey string; subsequent reconciliation stays safe.
- Apply-hotkey IPC/reconciliation must never register any accelerator. Normal-mode controls demonstrate normal registration/autostart still work; testHooks behavior remains unchanged separately.
- Invoke tray check, check-update, exported checkForUpdates, download/install with available/ready state and timer callback: zero updater side effects. Try stored .exe/.lnk/.url paths plus unstored steam/shell URIs: zero shell/Explorer launches in bounded QA.
- Visible Manager path receives testHooks false, uses ordinary open behavior, and manager:test remains refused. Existing move fixture escape checks remain passing; do not count a mocked move as native acceptance.
- Launcher new route refuses legacy/missing isolation, unsafe args, non-null hotkey, missing/mismatched/linked seeds and unreadable registry before app spawn. Test CLI with a spawn recorder; do not run the existing full script test suite blindly, because it contains live sleeper/watchdog process tests. Prove no real spawn on refusal; preserve legacy behavior only where explicitly scoped.

Ender reports exact ref, source/test diff, every consumer of the isolation context and literal receipt format, each negative control's result, command/deadline/closure details, normal-mode regression results and pending native evidence. Apply ProcessRules' supported-schema 600000ms bounded-command requirement if a run is authorized. No tests were executed in this review.

Only after implementation is committed and independently reviewed, artifact/dependencies attested and guarded preflight passes may Jane request a fresh timed away window. Native verification then must independently prove effective profile/lock isolation, real instance PID/creation/foreground preserved, complete startup snapshots unchanged, real-store signatures unchanged and owned Quit/children closure. Window changes and sleep permissions are not granted by this document. No release or QA clearance is implied.
