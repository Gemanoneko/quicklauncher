# QuickLaunch Electron 44 assessment — partial handoff, 2026-10-15

**PARTIAL, ASSESSMENT ONLY.** Sergei asked to assess Electron 44, then requested handoff to Claude Code before assessment completion. No target substitution is approved. No product code, dependencies, helpers, settings, runtime or release changed. Existing safeguards remain blocked; no probes, installation, acquisition, build or app/helper execution occurred.

## Scope and proposed candidate

Active product is `WIP/QuickLaunch-release-1.95.0`, `codex/axis-resize`, version **1.104.0**. Jane supplied verified latest HEAD **f695b58782ae29a59377b90088ec83185bb62d5d** after committing the maintenance inventory. Do not use the separate product checkout or parked drafts.

Exact **proposed assessment candidate**: Electron **44.7.2**, retaining electron-builder **26.17.0** and electron-updater **6.8.10** pending resolved compatibility evidence. The [official stable index](https://releases.electronjs.org/release?channel=stable) and [44.7.2 detail](https://releases.electronjs.org/release/v44.7.2) identify it as latest stable available before October 15, with Chromium 152.0.7977.149 and Node 24.21.0. Index/detail dates were observed inconsistently as October 13/14; both precede assessment date. Do not infer an exact publication timestamp.

[Official schedule](https://releases.electronjs.org/schedule): Electron 44 EOL **March 2, 2027**; recorded Electron 42 EOL **October 20, 2026**. This supports assessing 44 instead of a five-day interim bridge; it does not authorize changing the accepted 42.11.12 target.

## Verified source findings

The table below holds the partial findings as handed off. § Completion — 2026-10-15 (Claude Code) settles the four open items: dialogs, bitmaps, Koffi and the target set. Where the two differ, the Completion section wins.

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

## Completion — 2026-10-15 (Claude Code)

**Still ASSESSMENT ONLY.** Nothing here approves a target or a code change. The checkout was verified before any edit: `codex/axis-resize`, HEAD `b40c13505c55e441aa4614e7439c637f66b48631`, version 1.104.0. The lockfile today resolves Electron **32.3.3**, electron-builder **25.1.8**, electron-updater **6.8.3** and koffi **3.3.2**. The declarations are `^32.0.0`, `^25.1.0`, `^6.3.0` and `^3.3.2`, so every change from Electron 33 to 44 applies to the move.

Method: read-only reads of product source, the lockfile and existing `node_modules` files; read-only git commands; official web sources only. No package was installed, resolved, imported or run. No tests, builds, app or helpers were run. The running app, the real profile, parked drafts and raw evidence were not touched.

### 1. File dialogs: no supported way to keep Windows' remembered folder

- **Today (32.3.3):** an empty `defaultPath` is not absolute, so Electron never calls `SetFolder`. Windows then opens its own remembered folder for the app, and that memory survives restarts. Source: [v32.3.3 file_dialog_win.cc](https://raw.githubusercontent.com/electron/electron/v32.3.3/shell/browser/ui/file_dialog_win.cc).
- **44.7.2:** an omitted or empty `defaultPath` becomes `GetDefaultPath()`: Downloads if it exists, otherwise the home folder. Electron then calls `IFileDialog::SetFolder` ([v44.7.2 file_dialog_win.cc](https://raw.githubusercontent.com/electron/electron/v44.7.2/shell/browser/ui/file_dialog_win.cc), [electron_paths.cc](https://raw.githubusercontent.com/electron/electron/v44.7.2/shell/common/electron_paths.cc)). Microsoft documents that `SetFolder` ["overrides any 'most recently used' folder"](https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/nf-shobjidl_core-ifiledialog-setfolder).
- **The docs confirm it.** The [tagged breaking changes](https://raw.githubusercontent.com/electron/electron/v44.7.2/docs/breaking-changes.md) (43.0, "Dialog methods default to Downloads directory") say: "the OS will no longer track and restore the last-used directory". The only documented migration is for the app to remember the last folder itself and pass it as `defaultPath`. The [tagged dialog options](https://raw.githubusercontent.com/electron/electron/v44.7.2/docs/api/dialog.md) contain no opt-out.
- **Upstream ruled it intentional.** Issue [#52454](https://github.com/electron/electron/issues/52454) ("Electron 43 bypasses native file-dialog directory persistence") asked for `SetDefaultFolder` instead. A maintainer called the change intentional and pointed to the breaking-changes entry. The issue was closed on 2026-07-27. The change came from PR [#49868](https://github.com/electron/electron/pull/49868).
- **The bare file name is not an option.** The docs accept "file name" as a `defaultPath`. On Windows a non-absolute value skips `SetFolder`, so the remembered folder would survive. But that text appears in the File name box, and the folder effect is not documented. This is the relative-path trick rejected earlier.
- **Deleted-folder trap, from source.** If a missing absolute folder is passed, Electron treats it as a file name. Its name lands in the File name box and the dialog opens in the parent folder. If the parent is also gone, Windows picks the folder. So any remembered-folder choice must first check that the folder still exists.

**Verdict:** no documented, supported option keeps the Windows-remembered start folder. This is a product decision for Sergei. No code was changed.

The two callers share `DIALOG_OPTS` (`ipc.js:275`): the region "+ FILE" button (`ipc.js:649–650`) and the Manager "Add file" button (`ipc.js:780`). The choices:

| Choice | First use | After Cancel | Remembered folder deleted | After restart | New saved data |
|---|---|---|---|---|---|
| **A. Accept the new default** | Downloads (home if there is no Downloads) | Downloads again | n/a | Downloads | none |
| **B. Remember until QuickLauncher quits** | Downloads | Unchanged: the folder of the last file actually picked. A folder browsed to and then cancelled is unknown to the app (Electron returns no path). | Downloads | Downloads | none (in memory only) |
| **C. Remember across restarts** | Downloads. This includes the first use after the upgrade, because Windows' old memory can't be read through a supported API. | Same as B | Downloads | Last picked folder | one folder path in QuickLauncher's settings |
| **D. Always start in one fixed folder** (for example Desktop, where moved shortcuts come from) | That folder | That folder | Downloads | That folder | none |

Sub-choice for B or C: **one shared memory** for both buttons, or **one per button**. A shared memory is closest to today, because Windows kept one memory for the whole app.

### 2. Bitmaps: one consumer is clear, two need runtime evidence

How it works:
- **32.3.3 and 42.11.12:** `toBitmap` reads pixels into N32 premultiplied with *no* colour space. Skia treats a missing target as "same as source", so the values are raw. Sources: [v32.3.3](https://raw.githubusercontent.com/electron/electron/v32.3.3/shell/common/api/electron_api_native_image.cc) and [v42.11.12](https://raw.githubusercontent.com/electron/electron/v42.11.12/shell/common/api/electron_api_native_image.cc).
- **44.7.2:** the target is sRGB unless `colorSpace` is passed ([v44.7.2 ToBitmap](https://raw.githubusercontent.com/electron/electron/v44.7.2/shell/common/api/electron_api_native_image.cc), PR [#48178](https://github.com/electron/electron/pull/48178)). Skia treats an *untagged* source as sRGB (`if (!src) src = sRGB; if (!dst) dst = src;` in [SkColorSpaceXformSteps.cpp](https://skia.googlesource.com/skia/+/f593e0fb883333745ab2c8568c1449a60904b244/src/core/SkColorSpaceXformSteps.cpp)). That Skia revision is pinned by [Chromium 152.0.7977.149 DEPS](https://chromium.googlesource.com/chromium/src/+/refs/tags/152.0.7977.149/DEPS).
- **So untagged and sRGB sources give byte-identical output.** Only a source tagged with a non-sRGB colour space changes. Colour conversion changes RGB only, never alpha.
- **Which decodes carry a tag**, per [skia_util.cc](https://raw.githubusercontent.com/electron/electron/v44.7.2/shell/common/skia_util.cc) and Chromium 152:
  - **PNG:** keeps the file's own colour data ([png_codec.cc](https://chromium.googlesource.com/chromium/src/+/refs/tags/152.0.7977.149/ui/gfx/codec/png_codec.cc)). The order is cICP, then iCCP, then the sRGB chunk, then gAMA (with or without cHRM). A gAMA alone near 1/2.2 counts as untagged ([SkPngRustCodec.cpp](https://skia.googlesource.com/skia/+/f593e0fb883333745ab2c8568c1449a60904b244/src/codec/SkPngRustCodec.cpp)).
  - **JPEG:** untagged ([jpeg_codec.cc](https://chromium.googlesource.com/chromium/src/+/refs/tags/152.0.7977.149/ui/gfx/codec/jpeg_codec.cc)).
  - **`.ico` through `createFromPath`:** HICON, untagged.
  - **`app.getFileIcon`:** HICON, untagged.
  - **Raw `createFromBuffer(w,h)` and `createFromBitmap`:** untagged.
- **The documented option exists but can't be used generically.** `toBitmap({ colorSpace })` says "Pass the image's original color space to preserve the previous behavior" ([tagged NativeImage docs](https://raw.githubusercontent.com/electron/electron/v44.7.2/docs/api/native-image.md), [ColorSpace](https://raw.githubusercontent.com/electron/electron/v44.7.2/docs/api/structures/color-space.md)). The v44.7.2 NativeImage API has no getter for an image's colour space, so the option only works when the caller already knows it. For untagged sources the default already equals the old values. For tagged sources with an unknown profile, the option cannot be applied correctly.

| Consumer | Image sources (traced) | Non-sRGB tag realistic? | Verdict |
|---|---|---|---|
| `icon-trim.js:12` `trimIcon`, used in the main process and the icon helper renderer | Steam `.jpg` (`ipc.js:468`); AppX/MSIX logo `.png` (`ipc.js:490–511`); C# helper PNGs from GDI+ `Bitmap.Save(Png)` (`ipc.js:83`, `:134`); user-chosen `.ico`/`.png`/`.jpg` (`ipc.js:1079`); `app.getFileIcon` (`ipc.js:1106`) | JPEG, ICO and HICON: no. Logos and user PNGs: possible (embedded ICC). GDI+ PNGs: chunk set unknown. | **Needs runtime evidence, blocked (narrow).** The transparent-corner path reads alpha only, so it is unchanged. The solid-background path (RGB distance > 25) can shift the crop box only for *tagged opaque* PNGs. The output is a crop of the original, so colours never change. |
| `ipc.js:846`/`887` `removeSolidBackground` | Only C# helper `GetThumbnailBase64` PNGs (GDI+) | Depends on whether GDI+ writes cHRM, iCCP or a gAMA not near 1/2.2 | **Needs runtime evidence, blocked.** It always takes the RGB path, and the output is rebuilt from the bitmap, so a tagged source gives a tonal shift. If the chunk list shows none, sRGB or a gAMA near 1/2.2, then no change is needed. |
| `tray.js:26`/`52` `composeUpdateIcon` | Bundled, git-tracked `icon.png`. Its chunks are IHDR, pHYs, tEXt, IDAT and IEND (read from the file bytes). | No | **No change needed.** Revisit if `icon.png` is replaced by a file with an embedded profile. |

Runtime evidence, for when it is permitted. Both checks are synthetic and need neither the real profile nor Sergei's icons.
- (a) List the chunks of one IconHelper exe-icon PNG and one shell-thumbnail PNG.
- (b) Run one opaque PNG with a Display-P3 profile through `trimIcon` on 42 and on 44, and compare the crop rectangles.

### 3. Koffi: keep 3.3.2

- **What the regression is,** from the upstream diff. 3.3.2 commit [ee16d4df](https://codeberg.org/Koromix/rygel/commit/ee16d4dfd62bd440bac66874ea914dc90a68ff6b) ("Add guard page") reserves one guard page plus the stack and sets `stack.ptr = base + page`. But `~InstanceMemory` still frees `stack.ptr`.
  - On Windows, `VirtualFree(MEM_RELEASE)` on a non-base address fails, so the reservation leaks.
  - On POSIX, `munmap` leaves the guard page mapped.
  - The installed copy matches: `node_modules/koffi/src/koffi/src/ffi.cc:2543–2580`.
- **The 3.3.3 fix:** [7d1cd488](https://codeberg.org/Koromix/rygel/commit/7d1cd4888d316d21faadb73627feb3fd6eae43cb) frees the real base and adds an unused page above the stack (the Rosetta crash). The [changelog](https://koffi.dev/changelog) and [3.3.3 bump](https://codeberg.org/Koromix/rygel/commit/7f47edca6139b8f10161eede3be1167466c74196) name no platform for the regression. Per the diff it affects every platform and ABI. It is a leak at free time, not damage on the call path.
- **When it runs:** only when koffi releases a call-stack block. That means temporary async pools (`ReleaseAsyncMemory`), callbacks fired outside a running koffi call, or instance teardown.
- **QuickLaunch call shapes:**
  - The only callers are `desktop-layer.js` (22 user32/kernel32 functions) and `moves/win32.js` (9 kernel32/shell32/ole32 functions), both in the main process.
  - All are synchronous `func()` calls with at most 7 integer, pointer or `str16` arguments, plus out-buffers and one `void**` out.
  - One transient `EnumWindows` callback runs during the call. It takes koffi's on-stack fast path (`call.cc:2052`) and allocates nothing.
  - There is no `.async`, no `koffi.register` and no `koffi.config`.
- **So on Windows x64 the faulty free can only run at process exit,** where the OS reclaims the memory anyway. The Rosetta fix does not apply. The memory layout above the stack is the same as in 3.3.1 and earlier.
- **Recommendation: keep 3.3.2 exactly.** It has been in the lock since `bfc5887` and shipped in v1.95.0 through v1.104.0. QuickLaunch's synchronous-only calls never reach the faulty free during runtime, and staying put avoids acquiring another native binary.
- **The lock must stay in charge.** `^3.3.2` lets any fresh resolve drift to 3.3.3 or later. Koffi native loading under Electron 44 still needs runtime evidence; that existing checklist item is separate from this choice.

### 4. Target set: builder and updater not documented for Electron 44

- **Release facts.** [electron-builder 26.17.0](https://github.com/electron-userland/electron-builder/releases/tag/electron-builder%4026.17.0) and [electron-updater 6.8.10](https://github.com/electron-userland/electron-builder/releases/tag/electron-updater%406.8.10) are the latest stable v26-line releases (2026-09-26). Electron 44 went stable on 2026-08-25 ([schedule](https://releases.electronjs.org/schedule)).
- **Nothing documents compatibility either way.**
  - Neither set of release notes mentions Electron 43 or 44.
  - The builder repo's own tests moved only to Electron 41.10.6 (PR [#10263](https://github.com/electron-userland/electron-builder/pull/10263), master, 2026-09-30).
  - The [updater 6.8.10 package.json](https://raw.githubusercontent.com/electron-userland/electron-builder/electron-updater%406.8.10/packages/electron-updater/package.json) uses electron 39.8.5 as a devDependency and has no peer range.
- **Electron 44 changes checked against QuickLaunch:**
  - **ia32 removal:** the fail-fast gate PR [#10032](https://github.com/electron-userland/electron-builder/pull/10032) is master/v27 only. QuickLaunch builds x64 only, so it does not apply.
  - **Static ANGLE (no libEGL/libGLESv2 DLLs):** builder 26.17.0 [winPackager.ts](https://raw.githubusercontent.com/electron-userland/electron-builder/electron-builder%4026.17.0/packages/app-builder-lib/src/winPackager.ts) only walks a `swiftshader` dir that may be absent, which is harmless.
  - **`net.request` Sec-Fetch-Dest rule:** updater 6.8.10 [electronHttpExecutor.ts](https://raw.githubusercontent.com/electron-userland/electron-builder/electron-updater%406.8.10/packages/electron-updater/src/electronHttpExecutor.ts) and `builder-util-runtime` httpExecutor set no Sec-Fetch headers.
- **Verdict:** builder and updater are not documented as compatible with Electron 44, and no source-level blocker was found. Compatibility must come from the packaged build and the install/update checks (plan step 4).
- **Proposed exact set (NOT approved):** Electron **44.7.2**, electron-builder **26.17.0**, electron-updater **6.8.10**, koffi **3.3.2**.
- **For awareness only (not assessed, not proposed):** the schedule lists Electron 45.0.0 stable on 2026-10-20 with EOL 2027-04-27. Electron 43 EOL is 2027-01-05.

### Decisions only Sergei can make

1. Add-file start folder: **A**, **B**, **C** or **D**?
2. If B or C: **shared** or **per-button** memory?
3. If D: which folder (for example **Desktop**)?
4. Approve the proposed set Electron 44.7.2 / builder 26.17.0 / updater 6.8.10 / koffi 3.3.2: **yes** or **no**?

**Sergei's answers (2026-10-15):**
1. Start folder: ~~"Same as now" (read as C)~~ **superseded the same day: Sergei chose A, always Downloads.** That is Electron 44's own default, so the dialog needs no code change and no remembered-folder state. Questions 2 and 3 no longer apply.
4. Target set **APPROVED**: Electron **44.7.2**, electron-builder **26.17.0**, electron-updater **6.8.10**, koffi **3.3.2** (exact). This replaces the recorded 42.11.12 target. Approving the versions does not unblock execution; the Gate07 block still applies (see continuation plan step 3).

### Gate07 waiver — Sergei, 2026-10-15

**Sergei waived Gate07 for this migration** and chose to run it in Claude Code with normal studio checks. The guard Gate07 tested (`studio-command-safety`) is a Codex hook. Claude Code does not load it, so finishing that proof would not change the safety of a Claude Code install, and the Codex attempt looped and tripped Bitdefender.

What this authorizes:
- Ender sets the exact approved pins (Electron 44.7.2, builder 26.17.0, updater 6.8.10, koffi 3.3.2) and installs them in **this checkout only**. He also makes the NSIS `SetOutPath $TEMP` adaptation, builds the package without publishing, and runs the runtime checks listed above.
- Futaba runs QA, Senua reviews, and Sully releases 1.104.1 through the normal pipeline.

What stays in force:
- No Codex hook, safety-tooling, test-helper or shared-settings work.
- No antivirus changes. Bitdefender stays ON.
- One attempt per step. On any failure or antivirus alert, STOP and report; no retry loops.
- The running QuickLauncher, the real profile, the parked drafts and the `WIP/QuickLaunch` checkout stay untouched.

This waiver supersedes the "dependency execution BLOCKED" lines in `Team/Docs/QuickLaunch_PostTrust_Gate07_Result_2026-10-15.md` and `Team/Docs/QuickLaunch_Claude_Handoff_2026-10-15.md` for this migration only.

Local lessons: no new failure or lesson came up. The findings above are their own record.

## Minimal continuation plan

1. **Sergei decides** items 1 to 4 above. Until he approves, the recorded targets stay Electron 42.11.12, builder 26.17.0 and updater 6.8.10. Source assessment of the four items is complete.
2. **Bounded source-only patch candidates once approved:**
   - the NSIS `SetOutPath $TEMP` adaptation;
   - the dialog start folder exactly as Sergei chose it, including the existence check from § 1.
   No bitmap code change is proposed: the tray needs none, and the other two wait on the § 2 evidence. Nothing was applied.
3. **Only if existing safeguards permit:**
   - resolve the accepted exact declarations and lock with scripts disabled, keeping koffi exactly 3.3.2;
   - inspect classifications, transitive dependencies and audits;
   - separately authorize acquisition, install and lifecycle work;
   - then validate runtime and packaged behaviour: native koffi, desktop regions, DPI, hotkeys, tray Quit, the § 2 synthetic bitmap checks, and the dialog start folder.
   No workaround to incomplete safeguards is implied.
4. **Release steps:** applicable QA and handoff, Senua source review, isolated installer, update and quit checks (these are also the builder/updater compatibility evidence for Electron 44), then Sully's version, changelog, commit, tag, publish, artifact and retention steps. v1.104.1 is still pending; no release clearance exists.

[Remaining product inventory](QuickLaunch_Maintenance_Remaining_2026-10-15.md) and the [final blocked checkpoint](../../../Team/Docs/QuickLaunch_PostTrust_Gate07_Result_2026-10-15.md) define the preserved scope and boundaries. The existing DependencyUpdate draft is untouched. The running app, real profile, parked work and evidence are preserved. This document is the sole assessment output. The completion pass created one temporary file list in the session scratchpad and removed it.

## Migration pass — Ender, 2026-10-15/16 (Claude Code)

Under the Gate07 waiver. Checkout verified first: `codex/axis-resize`, HEAD `ef9f23d`, only the DependencyUpdate draft untracked. Host Node 26.11.1, npm 11.20.0. Nothing committed; Sully owns the commit and the 1.104.1 bump.

- **Pins and install.** `package.json` now pins electron 44.7.2, electron-builder 26.17.0, electron-updater 6.8.10 and koffi 3.3.2 exactly. One `npm install` (18 s). The lock resolves exactly those four, plus `@koromix/koffi-win32-x64` 3.3.2. The Electron 44 npm package has **no postinstall**, so its binary came from one run of its own `install.js` (40 s, checksum-checked against the bundled `checksums.json`). npm 11 `allowScripts` skipped two install scripts: koffi's `--prebuild` check (koffi loads the prebuilt `@koromix` `.node` directly) and `electron-winstaller` (Squirrel only, not our target).
- **Resolution changes.** Top level: 47 changed, 37 added, 113 removed, nearly all builder tooling. Shipped closure: electron-updater 6.8.3→6.8.10 with its deps hoisted (builder-util-runtime 9.7.0, fs-extra 10.1.0, jsonfile 6.2.1, universalify 2.0.1), and sax 1.6.0→1.6.1.
- **npm audit:** 9 (8 moderate, 1 high, 0 critical). The 8 moderate are build-time: the builder 26 chain `@electron/get`→`global-agent`→`roarr`→`sprintf-js`. Shipped only (`--omit=dev`): 1 high, `js-yaml` 4.1.1 via electron-updater, the **same version as at HEAD**. Not fixed (out of scope).
- **NSIS.** `scripts/nsis/installer.nsh` gains `SetOutPath $TEMP` before `RMDir /r $INSTDIR`, and both comments now say 26.17.0. Its stock block, compared with indentation and line endings normalised, equals the 26.17.0 template's lines 164–187. The restore, the `--updated` skip, the busy-file rollback and the README-preserving `RMDir` are unchanged.
- **Tests.**
  - `check:contrast`: pass (101 themes, 0 errors).
  - `test:regions`: 283 of 336 pass, 53 fail. All 53 are in 13 files that load no changed package: `updater-route` stubs electron-updater, and `controller-moves` uses koffi, which is unchanged. They fail on source shapes, such as `drawStatus is not defined`, `ctl.apps is not a function` and outdated menu lists. `src/` and `test/` are identical to HEAD, so this is **pre-existing drift independent of the migration**. It is not a documented baseline.
  - `check:hover`: **VOID (exit 2) under Electron 44.** All 3838 pairs were measured with 0 errors; PC1–PC4 fired; isolation was clean (0 sockets, registry unchanged, 135 processes started and 0 left). The harness's integrity check reports its `globalShortcut.register/registerAll/unregister/unregisterAll` stubs "replaced" in all 4 processes, while every app, BrowserWindow and dialog stub held. **`prebuild` runs this check, so `npm run build`/release would fail.** `scripts/theme-gallery` was not changed.
  - Skipped: `selftest:regions` and `tryit:regions`. Both launch a packaged QuickLauncher through the studio QA guard, which other agents are modifying at the moment; that launch is QA's to run.
- **Package (no publish).** Built with `npx --no-install electron-builder --win --x64 --publish never -c.directories.output=dist/e44-candidate`. This deliberately did not use `npm run pack`, whose `clean:dist` would delete the shipped `dist/QuickLauncher Setup 1.104.0.exe`; at an unchanged version the new build would also take the same file name.
  - Artifact: `dist/e44-candidate/QuickLauncher Setup 1.104.0.exe` (122,963,631 B).
  - Inside it: asar `package.json` 1.104.0 with the exact pins; exe FileVersion 1.104.0; Electron 44.7.2 / Chrome 152.0.7977.149 strings; koffi `.node` in `app.asar.unpacked`; no `libEGL`/`libGLESv2` (static ANGLE).
- **Bitmaps (§ 2 runtime evidence, part a).** GDI+ replicas of both IconHelper encode paths (`Icon.ToBitmap().Save(Png)`, and a `Bitmap(256,256,Format32bppArgb)` filled through `LockBits`, then `Save(Png)`) both write `IHDR sRGB(intent 0) gAMA(45455) pHYs IDAT IEND`, with no iCCP, cHRM or cICP. These PNGs are therefore sRGB-tagged, which equals the default `toBitmap` target.
  - `ipc.js:846` `removeSolidBackground`: **no change needed**, by § 2's own criterion.
  - `icon-trim.js:12`: unchanged for GDI+, JPEG, ICO and HICON inputs. ICC-tagged AppX logos and user PNGs are **still unproved**, because part b did not run.
- **Part b and the `globalShortcut` probe did not run.** Command: `./node_modules/electron/dist/electron.exe scratch/e44-bitmap/main.js --qlp-in=… --qlp-out=… --qlp-ud=…`. It failed with `TypeError: Cannot read properties of undefined (reading 'setName')` under `Node.js v24.21.0`. Cause, verified: the agent shell exports `ELECTRON_RUN_AS_NODE=1`, so electron.exe ran as plain Node and no Electron started; `run.mjs:374` deletes this variable before it spawns Electron. Per the one-attempt rule it was not retried. The harness stays at `scratch/e44-bitmap/` (gitignored) for one authorised re-run with `env -u ELECTRON_RUN_AS_NODE`.

**Local lessons (2026-10-16, owner Ender unless noted):**
1. Agent shells carry `ELECTRON_RUN_AS_NODE=1`.
   - Detector: a direct electron.exe launch prints `Node.js v…` and `app` is undefined.
   - Cause: verified (the variable reads 1).
   - Remedy (`env -u ELECTRON_RUN_AS_NODE`): not yet verified.
   - Prevention: any brief that launches electron.exe directly says to unset it.
2. `check:hover` is VOID on Electron 44 and blocks `prebuild`.
   - Cause: unresolved hypothesis (Electron 44 re-binds, or uses accessors for, `globalShortcut` methods).
   - Next check: the descriptor probe in `scratch/e44-bitmap/main.js`.
   - A harness fix needs authorisation.
3. `test:regions` has 53 pre-existing failures. Unresolved; Jane to route.
4. When the version is unchanged, `npm run pack`/`build` delete the shipped installer in `dist/`. Build into a subfolder instead.

**Follow-up, 2026-10-16 (Jane-approved single re-run).**

The harness was run once as `env -u ELECTRON_RUN_AS_NODE ./node_modules/electron/dist/electron.exe scratch/e44-bitmap/main.js …`: Electron 44.7.2 / Chrome 152.0.7977.149, exit 0 in 1 s, no window, isolated userData, nothing left running.

Before that run, two faults in the throwaway harness itself were fixed (product code untouched):
- the `removeSolidBackground` extraction regex now tolerates the CRLF working copy; the old one would have thrown at load;
- an `uncaughtException` listener now replaces Electron's modal error box.

Lesson 1 remedy: **verified.**

- **GDI+ inputs (both helper encode paths).**
  - The Electron 44 default `toBitmap` equals the colour-chunk-stripped twin byte for byte: icon 0/4096 bytes differ, thumbnail 0/262144.
  - The stripped twin decodes to the file's raw values (830/830 and 65536/65536 opaque pixels), and raw values are the 42-era result.
  - Positive controls fired: a Display-P3 iCCP changes 2038 / 49152 bytes; gAMA 1/1.8 changes 1971 / 196608.
- **`icon-trim.js:12` `trimIcon`: no change for GDI+, JPEG, ICO and HICON inputs.**
  - GDI+ crops are identical: icon `0,1 32x30` and thumbnail `54,54 148x148` on both the original and the 42-era twin.
  - The transparent-corner (alpha) path is unchanged even with the P3 control.
  - **Differs only for ICC-tagged, non-sRGB, opaque PNGs** (AppX logos and user PNGs can be). Electron 44 converts to sRGB and widens saturated colour differences, so blocks just under the RGB-distance threshold of 25 now crop.
  - Measured with a P3 tag, block shifted in red only: on a saturated-red background, raw distances 18–25 crop on 44 but stay uncropped on 42; on a grey background the band is 21–25. At 26 or more, the crop is identical.
  - The output is a crop of the original, so colours never change. Impact: a slightly tighter crop for low-contrast, profiled logos only.
- **`ipc.js:846` `removeSolidBackground`: no change.** Its output equals the 42-era expectation byte for byte (0/262144 bytes, 49152 px cleared on both). The P3 control does differ (49152 bytes, max delta 20), so the check is sensitive. Its only inputs are GDI+ PNGs, which are sRGB-tagged.
- **`globalShortcut` probe.**
  - Electron 44's `globalShortcut` reports `register`, `registerAll`, `unregister`, `unregisterAll` and `isRegistered` as own, writable, configurable data properties.
  - Assignment does not throw, but **it never takes effect**: the read returns the original immediately, at `ready` and 500 ms later, on the same object.
  - So `check:hover`'s stubs never installed, and its integrity check is correct to VOID the run. It is not a later re-bind. The cause of lesson 2 is now verified.
  - `ELECTRON_RUN_AS_NODE` cannot explain the VOID: `run.mjs:373-374` deletes it before `spawn`, and that run rendered 3838 readings in offscreen windows. `check:hover` was therefore not re-run.
  - The harness fix waits for Sergei. Next check for the fix pass: whether `Object.defineProperty` or a wrapper takes effect where assignment does not.

**check:hover fix approved by Sergei 2026-10-16 (one-time exception to the test-helper stop).**

- **Root cause of the VOID (verified).** In the tagged v44.7.2 source, `lib/browser/api/global-shortcut.ts` exports `new Proxy({}, …)`:
  - its `set` trap forwards to the real instance (`Reflect.set`), so the harness stub *is* stored and *does* intercept calls;
  - its `get` trap returns `value.bind(globalShortcut)`, a fresh bound copy that never `===` the stub and carries no `STUB` symbol.
  - `stubsIntact()` checked through a plain read, so it called working stubs "replaced". The guard itself was never off.
  - This also rules out the earlier "assignment never takes effect" reading: assignment works, the read just returns a copy.
- **Fix:** `scripts/theme-gallery/main.cjs`, `stubsIntact()` only (+18/−2). It reads the *stored* function through its property descriptor and still requires the `STUB` tag. A plain read must also return the stub itself or exactly its bound copy (`bound f`). Readings, thresholds, controls and pass criteria are untouched.
- **Pure-Node controls (no Electron):** 7/7 pass on a verbatim replica of the v44 Proxy.
  - Stub behind the Proxy: counted intact, and a call reaches the stub.
  - The check still fails on a real function re-bound through the Proxy, a re-bound plain method, and a getter returning a different bound function.
  - The old logic fails on the Proxy, as observed.
- **Runs, each once with `ELECTRON_RUN_AS_NODE` unset:**
  - Pre-fix `check:hover`: VOID, exit 2, 76/92 stubs intact.
  - Post-fix `check:hover`: **pass**, exit 0, 92/92 intact, 3838 pairs, 0 errors, PC1–PC4 fired, isolation clean, nothing left running.
- **Build path:** `npm run check && electron-builder --win --x64 --publish never -c.directories.output=dist/e44-candidate` passed (contrast 0 errors, hover 92/92).
  - Artifact: `dist/e44-candidate/QuickLauncher Setup 1.104.0.exe`, 122,963,630 B, sha256 `bf4d0a97…7e35`, asar version 1.104.0, Electron 44.7.2.
  - The shipped `dist/QuickLauncher Setup 1.104.0.exe` hash is unchanged (`063d3604…f496`).
  - `npm run build` itself was not run: it publishes, and its `clean:dist` would delete the shipped installer.
- **Lesson 2 is resolved** (cause verified, remedy verified by the pass). Prevention: a harness that guards Electron APIs must check what is stored, not what a read returns, because Electron may wrap modules in binding Proxies.
