# QuickLaunch Electron 44 assessment — partial handoff, 2026-10-15

**PARTIAL, ASSESSMENT ONLY.** Sergei asked to assess Electron 44, then requested handoff to Claude Code before assessment completion. No target substitution is approved. No product code, dependencies, helpers, settings, runtime or release changed. Existing safeguards remain blocked; no probes, installation, acquisition, build or app/helper execution occurred.

## Scope and proposed candidate

Active product is `WIP/QuickLaunch-release-1.95.0`, `codex/axis-resize`, version **1.104.0**. Jane supplied verified latest HEAD **f695b58782ae29a59377b90088ec83185bb62d5d** after committing the maintenance inventory. Do not use the separate product checkout or parked drafts.

Exact **proposed assessment candidate**: Electron **44.7.2**, retaining electron-builder **26.17.0** and electron-updater **6.8.10** pending resolved compatibility evidence. The [official stable index](https://releases.electronjs.org/release?channel=stable) and [44.7.2 detail](https://releases.electronjs.org/release/v44.7.2) identify it as latest stable available before October 15, with Chromium 152.0.7977.149 and Node 24.21.0. Index/detail dates were observed inconsistently as October 13/14; both precede assessment date. Do not infer an exact publication timestamp.

[Official schedule](https://releases.electronjs.org/schedule): Electron 44 EOL **March 2, 2027**; recorded Electron 42 EOL **October 20, 2026**. This supports assessing 44 instead of a five-day interim bridge; it does not authorize changing the accepted 42.11.12 target.

## Verified source findings

| Boundary | Finding and remaining decision/evidence |
|---|---|
| File dialogs | `src/main/ipc.js:275` defines shared DIALOG_OPTS without defaultPath; region/Manager callers at 649–650 and 780 use it. Electron 43+ changes the initial directory to Downloads/home instead of OS remembered location. Exact 44.7.2 Windows source confirms empty defaultPath also selects its default directory and SetFolder, so adding an empty string is not a fix. No documented supported opt-out restoring OS-owned memory was established. App-managed remembered-folder persistence would require a concrete behavior/data decision; first-use, cancellation, deleted folders and restart semantics remain unresolved. Do not silently add saved-folder state or use undocumented relative-path tricks. |
| Icon trimming | `src/main/icon-trim.js:12` reads toBitmap for color-threshold crop detection. 43+ defaults bitmap output to sRGB, potentially changing crop decisions for profiled images. |
| Thumbnail background | `src/main/ipc.js:846` reads toBitmap for corner-color flood fill, then reconstructs raw bytes at 887. Validate thresholds, alpha and reconstructed output, not just successful decode. |
| Tray update badge | `src/main/tray.js:26` reads a resized image bitmap, paints BGRA badge pixels and reconstructs at 52. Include badge colors/alpha and base icon in migration evidence. This third bitmap consumer must not be omitted. |
| Bitmap preservation | Tagged docs describe explicit original colorSpace as preservation mechanism, but the inspected NativeImage API docs expose no getColorSpace method. A correct original-profile retrieval/representation strategy is unproved. Hardcoding sRGB cannot restore arbitrary old raw values. No speculative adapter was applied. |
| Native koffi | Both desktop-layer.js and moves/win32.js catch load failures and degrade, so startup alone cannot certify native compatibility. Lock currently resolves koffi **3.3.2**, hasInstallScript true, and win32 optional packages **3.3.2**, including x64. Declaration is still ^3.3.2. Official changelog 3.3.3 (October 10) fixes a stack-allocation mismatch introduced in 3.3.2; wording does not limit that fix to macOS. Actual Windows impact and whether to add a bounded 3.3.3 update need explicit disposition, not silent resolution drift. |
| Installer | Custom `scripts/nsis/installer.nsh` replaces stock removal and omits target builder 26.17.0 SetOutPath $TEMP before RMDir. Exact upstream comparison supports that minimal insertion and comment correction. Keep shortcut restore before removal, --updated skip, busy-file rollback and user-file preservation. Review against accepted installed bytes and verify packaged uninstall/update later. |

Primary sources: [tagged breaking changes](https://raw.githubusercontent.com/electron/electron/v44.7.2/docs/breaking-changes.md), [tagged Windows dialog implementation](https://raw.githubusercontent.com/electron/electron/v44.7.2/shell/browser/ui/file_dialog_win.cc), [tagged dialog JS adapter](https://raw.githubusercontent.com/electron/electron/v44.7.2/lib/browser/api/dialog.ts), [tagged NativeImage API](https://raw.githubusercontent.com/electron/electron/v44.7.2/docs/api/native-image.md), [Koffi supported platforms](https://koffi.dev/), [Koffi changelog](https://koffi.dev/changelog), [builder 26.17.0 uninstaller](https://raw.githubusercontent.com/electron-userland/electron-builder/electron-builder%4026.17.0/packages/app-builder-lib/templates/nsis/uninstaller.nsh).

## Other inspected migration surfaces and limits

Recursive read-only search of production src JavaScript found Electron main/renderer bridge, BrowserWindow/BaseWindow, nativeImage, screen, Menu/Tray, powerMonitor, globalShortcut and webUtils callers. No clipboard, utilityProcess, select-client-certificate handler, custom Sec-Fetch-Dest header or nodeIntegrationInWorker use was found. Electron 44 clipboard/subframe changes therefore have no identified direct caller. Product build is Windows **x64**, so 44 removal of Windows ia32 is outside current target. ANGLE is now statically linked; no managed replacement DLL was identified, but GPU/transparency regressions remain runtime risks.

The tagged 33–44 change list was inspected for relevant API/platform removals, command-line handling, dialogs, image defaults, OSR and acquisition. No completed exhaustive compatibility verdict is claimed. Earlier [compatibility preflight](../../../Team/Docs/QuickLaunch_Compatibility_Preflight_2026-10-15.md) remains useful for 33–42 and NSIS; this assessment adds 43/44 risks. Pure/API inspection cannot prove desktop parenting, DPI geometry, foreground/focus, Explorer recovery, native no-replace moves or quit/store flush.

The [44.7.2 npm package](https://raw.githubusercontent.com/electron/electron/v44.7.2/npm/package.json) requires host Node >=22.12.0. Its [index.js](https://raw.githubusercontent.com/electron/electron/v44.7.2/npm/index.js) can invoke install.js on require when executable/path metadata is absent. Ignore-scripts is not a no-download guarantee for later imports; no package was imported. Existing OSR scale/console-collection compatibility obligations remain validation limits; user excluded helper redesign and no helper work was done.

## Minimal continuation plan

1. Finish source assessment of documented dialog/bitmap preservation choices and the Koffi 3.3.2 regression impact. Present any unavoidable user-visible behavior decision concretely. Approve an exact target separately; current recorded targets remain unchanged.
2. The NSIS SetOutPath adaptation is the only presently concrete bounded source-only patch candidate; no source patch is authorized by this assessment alone or was applied. Dialog/bitmap edits need a defensible preservation design first.
3. Only if existing safeguards permit: resolve accepted exact declarations/lock with scripts disabled, inspect classifications/transitives and audits, independently authorize owned acquisition/install/lifecycle work, then validate actual runtime/package native behavior and images. No workaround to incomplete safeguards is implied.
4. Complete applicable QA/handoff, Senua source review, isolated installer/update/quit checks and Sully version/changelog/commit/tag/publish/artifact/retention steps. v1.104.1 is still pending; no release clearance exists.

[Remaining product inventory](QuickLaunch_Maintenance_Remaining_2026-10-15.md) and [final blocked checkpoint](../../../Team/Docs/QuickLaunch_PostTrust_Gate07_Result_2026-10-15.md) define preserved scope/boundaries. Existing DependencyUpdate draft is untouched. Running app, real profile, parked work and evidence are preserved. This new document is the sole assessment output; no disposable helpers were created.
