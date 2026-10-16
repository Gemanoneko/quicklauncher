# Code Review — QuickLaunch v1.104.1

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-16
Tool: QuickLaunch (Electron / Windows, NSIS installer)
Release: v1.104.1
Commit range: 8c5b61d6e91163686af1420257807d95b42b5744..69249478431e0954c55aa83eb6bb071b7bc21d1d
  (tag v1.104.0 points at 6ade021, the clearance-doc commit after 8c5b61d; the delta is one review doc, so the code range is identical)
Files changed: 26 files, +46105 / -2753. Code and config: package.json (+5/-5), package-lock.json (+949/-2744),
  scripts/nsis/installer.nsh (+4/-2), scripts/theme-gallery/main.cjs (+18/-2), CHANGELOG.md (+9). The rest is docs and
  committed performance evidence. src/ and test/ are unchanged.
Stand-down dimensions: None.
```

## Summary

This is a runtime and toolchain migration with almost no product-code change. The brief calls it "Electron 42 to 44". The lockfile actually moves **Electron 32.3.3 to 44.7.2** (twelve majors, Chromium 128 to 152). It also moves electron-builder 25.1.8 to 26.17.0 and electron-updater 6.8.3 to 6.8.10, and keeps koffi at exactly 3.3.2. The 42.11.12 target was never applied, so every breaking change from Electron 33 to 44 applies, not only those in 43 and 44.

I reviewed the following:
- the lockfile, key by key;
- the full builder 25.1.8 to 26.17.0 NSIS template diff, not only the removal block;
- the `stubsIntact` fix, against the tagged v44.7.2 `global-shortcut.ts`;
- every 33 to 44 breaking change, against the product source;
- the koffi 3.3.1, 3.3.2 and installed sources;
- release hygiene.

Method: source and docs only. I read `node_modules` and the existing `dist/` output without changing them, ran read-only `npm view`, `npm ls` and `npm audit`, and used tagged upstream sources. I ran no app, build, test or installer.

Result: no Critical finding, and the safety floor is intact. The main risks are not in code Ender wrote:
- an **unassessed rewrite of the stock NSIS app-running check** that came in with builder 26.17.0;
- a **red regression suite** that gives this migration no automated signal.

The decisive behaviour (koffi under Electron 44, transparent desktop-parented windows, installer, update and uninstall) can only be proven at runtime. See § Unproven.

## Focus-area answers

### 1. Lockfile

Method: a script compared `git show 8c5b61d:package-lock.json` with the 6924947 version. It checked every entry's resolved URL, integrity and dev flag. I also ran `npm view <pkg>@<ver> dist.integrity` for each changed shipped package plus electron, electron-builder and app-builder-lib, and `npm ls --omit=dev --all`.

- **Shipped closure: 37 entries before, 37 after.** Changes:
  - electron-updater 6.8.3 to 6.8.10;
  - builder-util-runtime 9.5.1 (nested) to 9.7.0 (hoisted);
  - jsonfile 6.2.0 to 6.2.1;
  - fs-extra 10.1.0 and universalify 2.0.1, hoisted only;
  - sax 1.6.0 to 1.6.1.

  Nothing else changed. The assessment calls these "hoisted", but builder-util-runtime and jsonfile also changed version. koffi and `@koromix/koffi-win32-x64` stay at 3.3.2.
- **Integrity checks.**
  - Every resolved URL is on `registry.npmjs.org`, and every integrity hash is sha512.
  - No name@version changed integrity between the two locks.
  - All 12 hashes I checked match the registry.
  - electron-builder 26.17.0 and electron-updater 6.8.10 carry SLSA v1 provenance.
  - The lock has none of the September-2025 compromised versions (debug 4.4.2, chalk 5.6.1 and others).
  - The installed tree matches the lock.
- **Install scripts.**
  - koffi (shipped): skipped. The loader uses the prebuilt `@koromix` package, and the packaged build unpacks it to `app.asar.unpacked`.
  - electron-winstaller (dev only, via the peer `electron-builder-squirrel-windows`): skipped.
  - Electron 44.7.2 has no install script.
- **dist-tags.** npm `latest` for electron-builder and electron-updater is 26.15.3 and 6.8.9. The pinned 26.17.0 and 6.8.10 are on the `v26` maintenance tag. This is not suspicious, but "latest stable" in the assessment means latest v26.
- **npm audit, shipped dependencies only:** one package, js-yaml 4.1.1, unchanged from v1.104.0. It carries four advisories: high GHSA-52cp-r559-cp3m, GHSA-5p4m-2wfm-xmqj and GHSA-2883-xcg3-v3hh, and moderate GHSA-h67p-54hq-rp68. All are CPU-exhaustion attacks.
  - **Reachable in practice: no.** The only parse sites are `electron-updater/out/providers/Provider.js:97`, which reads `latest.yml` from the Gemanoneko/quicklauncher GitHub release over HTTPS, and `AppUpdater.js:486`, which reads the bundled `app-update.yml`.
  - Anyone who can serve `latest.yml` can already serve an unsigned installer, and the updater will run it. The DoS gives an attacker nothing new.
  - The fix only touches the lock: js-yaml 4.3.2 satisfies electron-updater's `^4.1.0`. See F3.

### 2. NSIS (`scripts/nsis/installer.nsh` against builder 26.17.0)

- **Our copy matches the template.** Lines 55–78 equal `app-builder-lib/templates/nsis/uninstaller.nsh` lines 164–187 after whitespace normalisation, and the old block equals the 25.1.8 stock block. `SetOutPath $TEMP` is placed correctly: after the restore `ExecWait` (which keeps `$INSTDIR` as its working directory) and before `RMDir /r`.
- **Restore before removal holds.** `customRemoveFiles` still runs inside the section, after `setLinkVars` and before any removal.
- **The `--updated` skip holds.** It is `${ifNot} ${isUpdated}`, and `isUpdated` (common.nsh) is unchanged.
- **Busy-file rollback holds.** `un.atomicRMDir` and `un.restoreFiles` are byte-identical in 25.1.8 and 26.17.0.
- **User data is preserved.**
  - `deleteAppDataOnUninstall` is unset, and installUtil.nsh always passes `--updated`.
  - The store folder is removed with a non-recursive `RMDir`, so a folder that still has files is kept.
- **Not covered by Ender's comparison: the app-running check.** builder 26.17.0 rewrote `CHECK_APP_RUNNING`, which runs before `customRemoveFiles`. See F1.
- **Two smaller template changes.**
  - In 26.x, `customUnInstall` now runs before removal, which makes our header comment wrong. See F7.
  - The update from 1.104.0 to 1.104.1 runs the **old** 25.1.8 uninstaller. The new uninstaller's `--updated` path first runs at the next update, or when 1.104.1 is reinstalled over itself.

### 3. `scripts/theme-gallery/main.cjs` stubsIntact fix

**Verdict: the check did not get weaker. Ender's claim holds by source analysis.**

- The tagged v44.7.2 `lib/browser/api/global-shortcut.ts` exports a `Proxy({})`:
  - `set` calls `Reflect.set` on the real instance;
  - `getOwnPropertyDescriptor` reads the real instance;
  - `get` returns `instance[prop].bind(instance)`.

  `get` and the descriptor read the same storage, so a call always reaches whatever is stored. The new check requires the stored value to carry the `STUB` tag.
- **Put-back paths.**
  - Assigning a real function: the stored value is real, with no tag, so the check fails.
  - Reading back a real method: it is named `bound register`, not `bound f`, so the check fails.
  - `Object.defineProperty` or `delete`: these land on the Proxy's empty target, because there is no trap for them. They change neither the calls nor the check.
  - If a future Electron makes these methods non-configurable, the descriptor trap throws and the harness exits 2, so it fails closed.
- For plain objects (app, dialog, `BrowserWindow.prototype`), the new check is strictly the old one plus a descriptor read.
- **Residual gaps** (F6):
  - the read side relies on the name only (every stub is named `f`, `main.cjs:74`);
  - the 7 negative controls ran on a scratch replica and were not committed;
  - the self-test (`main.cjs:1094–1095`) never puts a real API back to see the check fail.
- **Scope check.** Only `stubsIntact` changed. Readings, thresholds and positive controls are untouched, and `setSuspended` and `isRegistered` stay unstubbed, which is harmless with no registrations.

### 4. Electron 33–44 breaking changes against our API use

| Change | Our use | Verdict (verified against tagged v44.7.2 source/docs) |
|---|---|---|
| 43 Dialogs default to Downloads | `ipc.js:275` has no `defaultPath`; callers at `ipc.js:649–650` and `:780` | Confirmed: in `file_dialog_win.cc:105–107` and `:152–153`, an empty path becomes `GetDefaultPath()`, then `SetFolder`, which overrides the MRU folder. Matches Sergei's choice A, so no code change is needed. Missing from the CHANGELOG (F8). |
| 43 `toBitmap` normalises to sRGB | `icon-trim.js:12` (main process, and the helper renderer via `icon-worker-preload.js:6`); `ipc.js:846`; `tray.js:26` | **tray:** `icon.png` chunks are IHDR, pHYs, tEXt, IDAT and IEND (read from the bytes), so it is unchanged. **`ipc.js:846`:** inputs are only GDI+ helper PNGs (`ipc.js:1068`, `:1096`), which Ender measured as sRGB-tagged; I did not re-run that. **icon-trim:** non-sRGB ICC-tagged opaque PNGs crop differently (F4). nativeImage is still exposed to non-sandboxed renderers (`lib/common/api/module-list.ts`), so the helper path survives. |
| 44 `globalShortcut` is now a binding Proxy (**not listed** in breaking-changes.md) | `index.js:190`, `:209`, `:213` | Calls go through `get`, then a bound copy of the native method, so behaviour is unchanged. Needs a runtime hotkey check. |
| 44 `net.request` Sec-Fetch-Dest rule | No product `net` use | `electron-updater/out` and `builder-util-runtime/out` contain no Sec-Fetch headers. Clear. |
| 44 Static ANGLE (no libEGL/libGLESv2) | No references in src, scripts or build config | The packaged 1.104.1 `win-unpacked` lacks both DLLs and adds `dxcompiler.dll` and `dxil.dll`. Clear by source; transparent windows need runtime proof. |
| 44 clipboard removed from renderer | None | Clear. |
| 44 ia32 removed | Builds x64 only | Clear. |
| 44 `select-client-certificate` now fires for `net` | No handler | When unhandled, Electron picks a platform client certificate if a server asks. The updater talks only to GitHub. Clear. |
| 42 No postinstall; lazy binary download | `run.mjs:361` calls `require('electron')` inside `prebuild` | F9. |
| 42 Offscreen rendering defaults to scale factor 1.0 | No product offscreen rendering. The harness sets `enableDeviceEmulation` (`main.cjs:497–499`). | Harness passed with PC1–PC4. Clear. |
| 36 `app.commandLine` lowercasing | Not used by the product | Clear. `electron_api_command_line.cc` lowercases only the switch name, not the value, so the harness's `disable-features` value is intact. |
| 35 `console-message` arguments; `WebRequestFilter` `urls` | None in the product. The harness `onBeforeRequest` has no filter (`main.cjs:972`). | Clear. |
| 33 `senderFrame` may be detached or null | No `senderFrame` use. IPC routes on `e.sender` (`ipc.js:292–293`). | Clear. |
| 33 Custom-protocol Windows paths | No `protocol.*` and no `baseURLForDataURL`; `loadFile` only | Clear. |
| 33 Native modules need C++20 | koffi is a prebuilt N-API binary | Clear. |
| 32 `File.path` removed | `webUtils.getPathForFile` (`preload.js:99–100`) | Clear (already migrated). |

### 5. koffi 3.3.2: is "keep 3.3.2" sound?

**Sound for today's call shapes.** I verified the following against the installed source and a fetched 3.3.1 tarball:

- **Where the faulty free is.** 3.3.2 reserves `stack_size + page` and sets `stack.ptr = base + page` (`ffi.cc:2573–2577`). `~InstanceMemory` then runs `VirtualFree(stack.ptr, 0, MEM_RELEASE)` (`ffi.cc:2547`). That fails on a non-base address, so the reservation leaks.
- **When it can run.** Only at instance teardown, or through `ReleaseAsyncMemory` on a temporary pool (`ffi.cc:1596–1604`). Even the non-fast-path callback pools are resident up to `resident_async_pools`.
- **Why our EnumWindows callback is safe.** It is a transient arrow function (`desktop-layer.js:113`) that fires during the synchronous call. It takes the fast path at `call.cc:2052–2066`, which allocates nothing.
- **What we call.** There are no `.async` calls, no `koffi.register` and no `koffi.config` anywhere in `src`.
- **Memory layout.** 3.3.1's stack end was also the end of its allocation (`ffi.cc:2480–2481`), so the layout above the stack is unchanged.
- **Pin.** `package.json` now pins `3.3.2` exactly, which closes the drift that `^3.3.2` allowed.

The safety rests on an invariant that is written nowhere near the code (F5). It is also not runtime evidence that koffi *loads* under Electron 44: both native modules swallow load failures (`moves/win32.js:12–20`, `desktop-layer.js:35–60`).

### 6. Build and release hygiene

- **Version and lockfile:** the bump to 1.104.1 is in 6924947, together with the lockfile, whose `version` and `packages[""].version` are both 1.104.1.
- **CHANGELOG:** the entry is present but has gaps (F8).
- **Claude attribution:** none in any of the 8 commits. I searched for Co-Authored-By, "Claude", "Anthropic" and "Generated with".
- **Secrets:** a scan of the committed evidence found none.
- **Packaging scope:** `build.files` (`src/**/*`, `icon.png` and `package.json`) keeps Docs and evidence out of the package.

## Rubric

### 1. Security

- Status: Concerns
- Findings:
  - F1 [Major] `node_modules/app-builder-lib/templates/nsis/include/allowOnlyOneInstallerInstance.nsh:32–103` (shipped in our installer and our uninstaller's `un.checkAppRunning`, which runs before `customRemoveFiles`). builder 26.17.0 rewrote the app-running check, and Ender's NSIS comparison covered only the removal block, so the change shipped unassessed. It now:
    - **Runs PowerShell 2–4 times per install, update or uninstall:** `IS_POWERSHELL_AVAILABLE` twice, then `Get-CimInstance Win32_Process`.
    - **Hard-kills on the first pass:** `KILL_PROCESS … 0` becomes `Stop-Process -Id`, which is TerminateProcess. The old `taskkill` without `/f` sent WM_CLOSE.
    - **Matches by path prefix:** it targets every process whose path starts with the `$INSTDIR` string, with no trailing separator.
    - **Builds the command by interpolation:** `$INSTDIR` goes into a single-quoted PowerShell literal (`:66`, `:94`). An apostrophe in the path breaks the command; the exit code is non-zero, so the check reads "not running" and removal proceeds against a running app.

    Why it is not Critical:
    - per-user install with no elevation, so no privilege boundary is crossed;
    - store writes are `.tmp`, fsync, then rename (`store.js:12–28`);
    - `--ql-restore-all` exits 3 when another instance holds the lock (`index.js:12–15`), which leaves shortcuts in the store folder with the message box, and nothing is deleted;
    - Sergei's profile path has no apostrophe.

    Why it is Major: this studio has a documented history of Bitdefender interfering with PowerShell from our tooling. A block mid-update could leave the app half-installed. Needs runtime evidence with Bitdefender ON (§ Unproven, item 3).
  - F3 [Minor] `package-lock.json` (`node_modules/js-yaml` 4.1.1, shipped): four CPU-DoS advisories (three high). They are not reachable in practice (§ Focus 1). The release is billed as dependency and security maintenance, and a lock-only update to 4.3.2 is within electron-updater's `^4.1.0`. Take it next cycle.

### 2. Correctness & Logic

- Status: Concerns
- Findings:
  - F4 [Minor] `src/main/icon-trim.js:12`, `:31`: Electron 44's `toBitmap()` converts ICC-tagged, non-sRGB, opaque PNGs (AppX/Store logos, user-chosen PNGs) to sRGB. Ender measured a tighter crop where the background distance is 18–25. This is a product behaviour change. It was not put to Sergei, it is missing from the CHANGELOG, and it is only proven on synthetic P3 inputs. A generic fix is not possible because there is no colour-space getter; record it as accepted or ask Sergei.
  - The `stubsIntact` logic is correct (§ Focus 3). The dialog default matches Sergei's choice A.

### 3. Crash / Stability Safety

- Status: Concerns. No source defect, but the riskiest surfaces are unproven: koffi loading, ANGLE in every process together with transparent windows reparented into Progman, and globalShortcut through the Proxy. Load failures degrade silently by design, so "it launched" proves nothing. See § Unproven, items 1–2.
- Findings: none beyond F1.

### 4. Performance

- Status: Concerns
- Findings:
  - F10 [Minor] Packaged footprint (measured from the existing `dist/` output):
    - installer 82,977,008 B to 122,963,552 B (+48%);
    - `win-unpacked` 275 MB to 377 MB;
    - `QuickLauncher.exe` 182 MB to 240 MB, because ANGLE is now static;
    - new `dxcompiler.dll` (25 MB) and `dxil.dll`.

    ANGLE now loads into all 16 processes, including 13 region renderers. Startup CPU and memory against the 2026-10-10 baseline (1289 MB private, 13 regions) are not measured. The first differential update from 1.104.0 will be close to a full download.

### 5. State & Data Safety

- Status: Pass. The store is atomic. No `localStorage`, `sessionStorage` or IndexedDB is used, so the Chromium 128 to 152 profile migration carries no product state. Uninstall keeps `%APPDATA%\QuickLauncher` and a non-empty store folder. The `--updated` skip and busy-file rollback are byte-identical to stock. F1's hard kill loses at most an unflushed debounce window.

### 6. Input Handling

- Status: Pass. No new inputs. `latest.yml` parsing is covered under F3. Dialog `filePaths` handling is unchanged.

### 7. Maintainability (no Critical findings on its own)

- Status: Concerns
- Findings:
  - F5 [Minor] `src/main/desktop/desktop-layer.js:37–43` and `src/main/moves/win32.js:45–58`: the "keep koffi 3.3.2" decision is only safe while every call is synchronous, callbacks are transient, and there is no `.async` or `koffi.register`. Nothing at the call sites says so. One async call or persistent callback would turn the 3.3.2 VirtualFree leak into a runtime leak. Add a one-line comment, or move to 3.3.3 next cycle.
  - F6 [Minor] `scripts/theme-gallery/main.cjs:74`, `:105–112`, `:1094–1095`: the fix is sound, but it has no committed negative control.
    - The self-test asserts "intact" but never puts a real API back to watch the check fail.
    - The read side passes any function named `bound f`, and every stub is named `f`.
    - The 7 controls lived in scratch.

    A check never seen to fail is not a gate.
  - F11 [Minor] `Docs/PerformanceEvidence_2026-10-10/canonical-launcher.mjs:1–30`: an 896-line snapshot of the studio QA launcher. Its header says it is "the one way a QA or test run launches a packaged QuickLauncher". A stale copy of safety tooling invites someone to run the wrong one. Mark it as a snapshot, or drop it.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Concerns
- Findings:
  - F7 [Minor] `scripts/nsis/installer.nsh:10–12`: the comment says electron-builder runs `customUnInstall` "at the END … after RMDir /r $INSTDIR". In 26.17.0 it runs **before** removal (`uninstaller.nsh:156–158`). The stated reason for using `customRemoveFiles` is now false.
  - F8 [Minor] `CHANGELOG.md:7–14`:
    - "Packaged-build QA and code review pending" will be permanently stale once released.
    - It omits the user-visible change that Add-file dialogs now always open in Downloads.
    - It omits the possible tighter crops (F4).
    - It does not say the runtime moved from Electron **32.3.3**. The brief and the maintenance doc say 42, a target that was never applied.

### 9. Build & Release Hygiene

- Status: Concerns
- Findings:
  - F2 [Major] `test/` (`npm run test:regions`): Ender reports 283 of 336 passing, with 53 failures in 13 files, including `updater-route` and `controller-moves`. Those are exactly the areas whose dependencies changed.
    - The "pre-existing" label is reasoned (src/ and test/ are unchanged, and the failures are source-shape errors such as `drawStatus is not defined`). It was never measured at 8c5b61d, and there is no recorded baseline.
    - A red, ignored suite gives no regression signal, so this release rests on runtime QA alone.
    - Next step: baseline the suite at v1.104.0, then fix or explicitly quarantine the stale tests. The handoff notes the suite is not read-only (Win32, koffi, icacls), so running it is Futaba's or Ender's call.
  - F9 [Minor] `package.json` (no `engines`); `scripts/theme-gallery/run.mjs:361`:
    - Electron 44's npm package needs Node 22.12.0 or later.
    - It no longer fetches its binary at install, so on another machine `npm ci` gives no `electron.exe`.
    - The first `require('electron')` in `prebuild` then downloads it, checksum-verified, in the middle of `npm run release`.

    Fix: add `engines.node >= 22.12.0` and a line in the brief or machine runbook. The `ELECTRON_RUN_AS_NODE` lesson is already recorded.

## Unproven — needs runtime evidence (for Futaba)

1. **koffi loads under Electron 44 in the packaged 1.104.1 build.**
   - Regions log `mode … attached` with host Progman or WorkerW.
   - The Manager does **not** say "Moving is unavailable".
   - One real move and restore works.

   Startup alone proves nothing, because both modules degrade silently.
2. **Display and input behaviour.**
   - Transparent, desktop-parented regions render correctly with static ANGLE: no black or opaque fill, no flicker.
   - DPI and multi-monitor geometry are correct.
   - The regions recover after an Explorer restart.
   - Ctrl+Space toggles (globalShortcut through the Proxy).
   - Tray Quit ends the process.
3. **Installer, update and uninstall with Bitdefender ON (F1).**
   - (a) The in-app update from 1.104.0 to 1.104.1 (old 6.8.3 updater, new 26.17.0 installer, PowerShell process check) raises no AV alert, the app relaunches at 1.104.1, and settings and regions are intact.
   - (b) Reinstalling 1.104.1 over 1.104.1 works. This is the only pre-release way to run the **new** uninstaller's `--updated` path.
   - (c) Full uninstall of 1.104.1 while it is running, with at least one moved shortcut:
     - shortcuts are restored before removal;
     - `$INSTDIR` is gone;
     - `%APPDATA%\QuickLauncher` is kept;
     - the store-folder README is kept.
4. **icon-trim on a real ICC-profiled Store/AppX logo:** compare the crop with 1.104.0 (F4).
5. **Startup CPU and memory** against the 2026-10-10 baseline (F10).
6. **Build provenance.** QA must use a 1.104.1 build of 6924947. The earlier `dist/e44-candidate/QuickLauncher Setup 1.104.0.exe` was built from the uncommitted tree.
7. **F2 baseline.** Whether the 53 `test:regions` failures also occur at 8c5b61d.
8. **Optional rollback check.** 1.104.0 reinstalled over 1.104.1 starts cleanly (Chromium 152 profile opened by 128).

## Verdict

- Total Critical: 0
- Total Major: 2
- Total Minor: 9

**Verdict:** RELEASE CLEAR

This verdict covers construction only. It does not cover § Unproven items 1–3, which are behaviour that Futaba's GO must establish.
