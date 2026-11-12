# QuickLauncher v1.105.0 QA — 2026-11-12

Futaba. Candidate source `6551bd05f7ac635d82514cc62732e68016cc70d4`, clean at handoff. This report covers the nonpublishing package, pinned actual Manager renderer and bounded user-authorized native smoke. User assistance supplied the inaccessible tray clicks; Futaba inspected the product and both native dialogs, and independently checked Ender's closure/restoration evidence.

**Verdict:** GO

The new backup feature passes the validated source/filesystem, actual renderer and bounded packaged native smoke scope below. No core blocker was observed. A real successful native import/restart, Windows install/uninstall and Manager-close/tray-persistence behavior were not performed in this pass; the successful restore/duplicate-prevention evidence is the isolated real-filesystem test flow, not a claim of a live reinstall test.

## Independent handoff identity

All four artifact bytes/lengths independently matched Ender's `scratch/backup-20261112/candidate-6551bd05f7ac/package-manifest.json`. Its version and source commit match the receipt and the source HEAD. Manifest SHA-256: `4a2bc90765781bd5e0ff222cb22581417e38bb3f8c00ee40d4a655662d7a2c14`.

Artifacts are under `C:/Users/AnGeLZzZ/AppData/Local/Temp/ql-backup-pack-6551bd05f7ac-cQby8c/dist/`:

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| QuickLauncher Setup 1.105.0.exe | 114284900 | `b7b2f80528acf88954acaad479feeaa21e418627053635542aa0ee002ec511c8` |
| latest.yml | 361 | `e15da1dbf7775dd8c3e7bbdb769b464e5189ca20c6679b72d21de769c7e450c6` |
| win-unpacked/QuickLauncher.exe | 245589504 | `a0bc24b0cb798402623ec2e84d3ded2c9e10c089a7887fb0a3a7f220c36d43c4` |
| win-unpacked/resources/app.asar | 8588266 | `d43308ceabf72dcbf29705d7059ae29f98d1842e8c4a6e940b1bc2f2305d2bff` |

Read the builder's final receipt directly from `scratch/backup-20261112/candidate-6551bd05f7ac/ender-entry-v2.log`; it matches the supplied line byte for byte. `entry-context-v2.json` SHA-256 independently matches `a7ba9b98c5a28fb5a53d5c757a05587d9dbacde279308b41ba200553f85ac8f4`. The receiver did not rerun the full gate.

> Entry-check receipt v2: quicklauncher v1.105.0 @ 6551bd05f7ac635d82514cc62732e68016cc70d4 (dirty: N) [source:2f0e66a495f5438dc42f34b4202310b61906785b6daa93aa2c8ab5fc06810cf3; harness:6b193dc7e214f17fc2277715b2c27e9785018b961b2e1e6e24dbf211f3398bb5; runtime:022c8b875ed4880ce4d2bf39b60667d9dfdb52a11a6cface5b07320889f81425; checker:4bae2cde4e4cdd2f22fb3060571730ec32fec1dd5403ea070086973b18b695e4] — pre-qa n/a, post-build n/a, check-electron n/a, check pass, test:smoke n/a; personal-folders listed (1 removed)

Builder log reports 101 themes, 3838 hover pairs, zero errors and four fired positive controls. Its private ownership result is closed/complete with zero active processes, no timeout or forced closure. The package was built without publication.

Personal-folder listing, copied without attributing or altering the change:

```text
REMOVED C:/Users/AnGeLZzZ/Downloads/f53fd362-35ef-4adb-970e-1049e6e9bd5c.tmp | there at the start, gone at the end
Listed only, never a failure. The QA tooling/agent did not delete or modify this entry.
```

## Backup behavior evidence

Ender reports **16/16 focused native filesystem tests passing**, using real Windows file identity and no-replace moves on test-created files. This is builder evidence, not an independent second full-suite run. Source inspection confirms the roundtrip test invokes the actual Mover `restoreAll()` before fresh-state import and repeated import; checks bytes, file identity, regions/settings/order and absence of a desktop copy. Coverage includes renamed match reuse, missing file recreation, changed/duplicate conflicts, invalid bundles, unrelated invalid files, displacement, preview edits, export preservation, store failure rollback and interrupted/committed recovery. It does not perform a Windows uninstall/install or execute shortcuts.

## Independent actual Manager rendering

QA fixture: `scratch/backup-qa-20261112/prepare-render.cjs`, with a copied gallery harness based on the pinned commit. Product markup/scripts/styles are extracted by the gallery's `--ref=6551bd05f7ac635d82514cc62732e68016cc70d4`; the product main process is never loaded. Retained gallery guards, registry audit, network positive control, watchdog and owned process closure remain enabled. QA-only instrumentation supplies backup IPC responses and captures actual rendered states, without changing product source.

At DPR 1, **4 themes × 5 states = 20 backup cases** pass: cyberpunk, mirrors-edge, portal, silent-hill; minimum 440×420 idle, standard 560×560 long success, minimum long success, minimum multiline error and minimum busy. Each screenshot is nonblank and stable. DOM measurements find no backup-button intersection, backup-button/footer intersection or horizontal body overflow. Titles match the committed spec; both buttons are enabled while idle and disabled while their actual click handler awaits the fixture result. A failed Import result produces `role=alert`.

Representative minimum cyberpunk rectangles, CSS pixels, measured by `getBoundingClientRect()`:

The exact intersection predicate was also exercised with the measured Export rectangle and a deliberately overlapping copy shifted by one CSS pixel: positive control true; the actual separate Export/Import pair false. Evidence: `scratch/backup-qa-20261112/render-dpr1/geometry-detector-control.json`.

| Element | x | y | Width | Height |
|---|---:|---:|---:|---:|
| Export backup | 20 | 236.797 | 120.969 | 32 |
| Import backup | 148.969 | 236.797 | 119.656 | 32 |
| Footer | 0 | 371 | 440 | 49 |

Actual PNGs were inspected for cyberpunk long success, mirrors-edge error, portal busy and silent-hill error: labels/results are legible, long paths wrap and the footer remains clear. Evidence: `scratch/backup-qa-20261112/render-dpr1/*-backup-*.png` and `*-backup-measurements.json`; complete gallery manifest at `render-dpr1/manifest.json`. These are rendered source observations with fixture IPC, not actual native picker/file-dialog results.

```text
CITE: ql-theme-gallery PASS | v1.105.0 @6551bd0 | 4/4 themes, 12 PNG | login-item 0 | ipc outside allowlist 0 | sockets 0 | registry unchanged | 0 proc left
```

The CITE's 12 PNGs count the gallery's base grid/settings/hover captures; the 20 additional backup captures are counted from the four five-entry measurement files. All 23 guard stubs remain intact; show/focus/dialog/login-item/hotkey/audio effects are zero. Nine owned processes started and all closed normally; registry values unchanged. The network detector had a positive-control process with sockets.

An earlier targeted DPR 1.5 run **failed the existing gallery screenshot-size expectation**: Chromium reported the requested CSS viewport and DPR 1.5, but `capturePage` returned CSS-sized PNGs instead of the expected 1.5× images. No product defect or stable DPR 1.5 screenshot pass is claimed. Its DOM measurements showed no overlaps/overflow; output and failure manifest remain at `scratch/backup-qa-20261112/render-output/`. The successful DPR 1 rerender is separate evidence, not a relabeling of that failure.

## Native smoke and preservation

Sergei explicitly allowed the brief native smoke, including focus, temporary normal closure of the installed launcher and preservation/restoration of its startup state. He then accepted the necessary tray assistance, normally quit the installed instance, opened the test Settings window and normally quit the candidate after Futaba's checks. Supported UI inventories could not target the shell tray. No forced kill was substituted for either normal Quit.

After reviewed startup/profile capture and verified installed-process closure, Ender launched only the independently hashed unpacked candidate through `scripts/qa/quicklaunch-safe-launch.mjs`, with a safe equivalent main/tmp/bak seed, no startup registration, no global hotkey, no random theme, fake desktop/store paths, updates disabled and foreground fallback regions. Candidate root PID 28084 used `C:/Users/AnGeLZzZ/AppData/Local/Temp/ql-backup-native-6551bd05-NhosLp/profile`; it was not the installed profile. The shared Run value was temporarily suspended within the specifically authorized capture/restore transaction. The absent current product isolation mode was not used or claimed.

Futaba selected the actually returned candidate Manager window (ID 2431692, explicit TEMP executable path). Its actual `manager.html` in packaged `app.asar` displayed `v1.105.0`, the expected safe settings and the two backup controls with their descriptions. The native Export dialog displayed the `.qlbackup` filter and suggested `QuickLauncher-backup-2026-11-12.qlbackup`. Escape canceled it; a fresh accessibility observation showed no dialog and both backup buttons enabled. The native Import dialog displayed `Import QuickLauncher backup` with Open and Cancel. Escape canceled it; another fresh observation again showed no dialog and both buttons enabled. No filename was edited, no file selected, and Save/Open/Import confirmation was never activated. Manager was left open for the user's final normal tray Quit; a separate Manager-close/tray-persistence check was skipped to keep the agreed ownership deadline.

Ender's `native-launch.log` independently read by Futaba records:

```text
CITE: ql-safe-launch PASS | v1.105.0 | profile profile | pid 28084, 6 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged
```

The six candidate PIDs are 28084, 27372, 78296, 114060, 24808 and 70448. The guard ended because the process exited, not because of timeout. Futaba independently read `native-pre-restore.log`, `native-restored.log`, `native-final.log` and `native-before-exact.json` under `scratch/backup-20261112/candidate-6551bd05f7ac/`, then compared the parsed evidence: before startup restoration there were zero QuickLauncher processes; after restoration but before installed relaunch there were still zero. Both restored and final registry raw values/types/absence equal the captured baseline exactly, including Run and StartupApproved. No unrelated startup entry was replaced.

The live main/bak bytes and `.tmp` absence match the original capture both before and after the installed restart. Main SHA-256 `6c117e24256d61da0a5ea9d3d914312dd7d533a12f63d2695c936f545887b007`; bak `a456c0428d0b94b568fc544990bf62f2a10b38fcf2c505a66cecaf55de9d73f6`. Original installed root PID 30280 restarted from `C:/Users/AnGeLZzZ/AppData/Local/Programs/QuickLauncher/QuickLauncher.exe`; final registry/live comparison flags are true and also match Futaba's independent raw-object comparison. These preserved profile files were read/hashed, not restored over user state.

The installer was not run. No live successful import, import-triggered application restart, actual uninstall/reinstall, startup-login test, shortcut execution or user shortcut movement was performed. Native Cancel behavior and normal packaged Quit are independently observed/verified within their stated scope; backend roundtrip/identity/rollback evidence remains separately attributed above.

Pattern alerts: existing suite-health issue remains deferred per the prior 1.104.3 report; no broad suite rerun or repair in this pass. The DPR 1.5 capture-size mismatch is a retained harness limitation, with no product fix claimed.

All native input has stopped; the candidate and dialogs are closed. Active screenshots, fixture, package, receipt and startup-preservation evidence are required and preserved. Illuminati / codex / completion-handoff sweep: 0 items, 0 B removed; 42 held as cited evidence, current build, dirty worktrees or a protected-looking worktree folder requiring owner review. No Codex history was touched.
