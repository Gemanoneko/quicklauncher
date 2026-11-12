# QuickLaunch backup implementation — 1.105.0 — 2026-11-12

Ender. Product source commit `6551bd05f7ac635d82514cc62732e68016cc70d4`; clean at snapshot and canonical entry validation. Nonpublishing candidate only. No installed app, installer, imported live setup, global hotkey or startup entry was changed by this implementation/build pass.

## Implemented

Manager Settings contains Export backup and Import backup. One bounded `.qlbackup` JSON bundle holds layout, settings, tile metadata/icons and managed `.lnk`/`.url` bytes. External application/document targets remain references. Import validates first, previews replacement and unavailable file references, then asks explicit confirmation before restoring and restarting.

A unique byte-identical returned desktop shortcut moves back into the managed store; repeated imports reuse its file/tile. Recreated absent files receive valid new identities. Conflicting changed names and ambiguous multiple matching files refuse safely. Intentional cross-region reference tiles are preserved. Existing moved files displaced by replacement return safely to a desktop. Native moves never overwrite; write-ahead intent and a durable store transaction marker recover an interrupted transaction before windows/mover/hotkeys start. Unresolved recovery retains its files and record and prevents normal mutable app operation.

Relevant verified lesson: NTFS filename tunnelling can change creation time when a newly staged shortcut takes a recently deleted filename. Transaction destination verification retains exact bytes plus volume/file ID, then captures the full post-move identity for normal tile validation. A real-files recreation regression detected the issue and verifies its fix. Real Fan geometry also produces half-pixel anchors; bounded fractional anchors roundtrip unchanged.

## Verification

Focused `node --test test/regions/backup.test.js`: **16/16 passed, zero skips**. Actual Windows files and native no-replace moves/identities cover export → real `Mover.restoreAll()` → fresh config → import twice, renamed matching shortcut, missing-file recreation, conflicts, multiple matches, unrelated broken files, extra moved files, preview edits, malformed/newer/tampered/path-traversal/duplicate/settings inputs, preservation of a complete backup on failed export, store failure rollback, interruption and completed-commit recovery, cleanup error after commit, cross-region references and real fractional Fan anchors. Deliberately invalid fixtures fail validation as positive controls.

Canonical entry used the committed five-file checker without modification. Declared package `check` passed once: 101 themes, zero contrast errors; 3,838 hover pairs, zero errors; all four positive controls fired. Owned private Job closed with native active/assigned/unsignaled zero, no force or timeout. Renderer guard counts for login/hotkey/show/focus/dialog/media/network were zero. This declared check measures existing theme controls; Futaba's separate actual Manager rendering covers the new section.

Exact builder receipt (also in `scratch/backup-20261112/candidate-6551bd05f7ac/ender-entry-v2.log`):

> Entry-check receipt v2: quicklauncher v1.105.0 @ 6551bd05f7ac635d82514cc62732e68016cc70d4 (dirty: N) [source:2f0e66a495f5438dc42f34b4202310b61906785b6daa93aa2c8ab5fc06810cf3; harness:6b193dc7e214f17fc2277715b2c27e9785018b961b2e1e6e24dbf211f3398bb5; runtime:022c8b875ed4880ce4d2bf39b60667d9dfdb52a11a6cface5b07320889f81425; checker:4bae2cde4e4cdd2f22fb3060571730ec32fec1dd5403ea070086973b18b695e4] — pre-qa n/a, post-build n/a, check-electron n/a, check pass, test:smoke n/a; personal-folders listed (1 removed)

Listed-only observation: `REMOVED C:\Users\AnGeLZzZ\Downloads\f53fd362-35ef-4adb-970e-1049e6e9bd5c.tmp | there at the start, gone at the end`. Nothing in personal folders was deleted, moved or changed by the checker or this agent. The listing does not fail the check and authorizes no cleanup there.

Context `scratch/backup-20261112/candidate-6551bd05f7ac/entry-context-v2.json`, SHA-256 `a7ba9b98c5a28fb5a53d5c757a05587d9dbacde279308b41ba200553f85ac8f4`. Actual run root: `C:/Antigravity Projects/Worktrees/QuickLaunch/backup-entry-6551bd05f7ac-73DDOs/entry-run-EuNH8d`. Earlier contexts/logs remain evidence of two pre-check refusals (run parent under source repo; existing user `.npmrc` ancestor under Temp). Neither produced a receipt or ran check scripts; no config/guard was changed. The supported Worktrees location passed canonical ancestry and route preflight.

## Nonpublishing package

`npm run pack` ran under the existing owned supervisor with a 600,000 ms bound against a private exact source/dependency copy. Result: exit 0, owned closed true, forced false, timedOut false. It uses the existing `--publish never` script. No packaged app was launched.

Artifacts under `C:/Users/AnGeLZzZ/AppData/Local/Temp/ql-backup-pack-6551bd05f7ac-cQby8c/dist/`:

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| QuickLauncher Setup 1.105.0.exe | 114284900 | b7b2f80528acf88954acaad479feeaa21e418627053635542aa0ee002ec511c8 |
| latest.yml | 361 | e15da1dbf7775dd8c3e7bbdb769b464e5189ca20c6679b72d21de769c7e450c6 |
| win-unpacked/QuickLauncher.exe | 245589504 | a0bc24b0cb798402623ec2e84d3ded2c9e10c089a7887fb0a3a7f220c36d43c4 |
| win-unpacked/resources/app.asar | 8588266 | d43308ceabf72dcbf29705d7059ae29f98d1842e8c4a6e940b1bc2f2305d2bff |

Artifact manifest `scratch/backup-20261112/candidate-6551bd05f7ac/package-manifest.json`, SHA-256 `4a2bc90765781bd5e0ff222cb22581417e38bb3f8c00ee40d4a655662d7a2c14`. Build logs/results: same folder `pack-output.log`, `pack-result.json`. Read-only PE verification: FileVersion 1.105.0, ProductVersion 1.105.0.0, ProductName QuickLauncher. Packaged package.json: quicklauncher 1.105.0, main src/main/index.js. All nine changed packaged source files match the pinned source bytes; archive extraction used Windows-normalized paths.

Durable ignored candidate copies: `dist/candidates/1.105.0-6551bd05f7ac/QuickLauncher Setup 1.105.0.exe` and `dist/candidates/1.105.0-6551bd05f7ac/package-manifest.json`. Their hashes equal the originals above. Existing 1.104.3 build output was preserved while 1.105.0 remains an untagged nonpublishing candidate.

The authorized bounded native smoke below passed visible Manager/version, both picker cancellations and user-assisted normal tray Quit. Manager close/tray persistence and successful live import/restart remain unverified. No installation, uninstallation or publication occurred. Futaba owns the final scoped behavior verdict.

## Native readiness and completion

Sergei approved only a bounded native Settings/version → Export picker Cancel → Import picker Cancel → Manager close/tray Quit smoke, temporary graceful installed closure and exact startup preservation/restoration. No install/uninstall or successful live import/restart was authorized. QA could not target the installed tray through either supported UI inventory, so Sergei explicitly agreed to and performed both normal tray Quit clicks; he also surfaced candidate Settings. Ender independently verified the installed tree absent before any registry mutation or candidate launch.

Sanctioned `scripts/qa/quicklaunch-safe-launch.mjs --check` accepted the pinned executable and private native profile/fixture; `CITE: ql-safe-launch PREFLIGHT OK | v1.105.0 | nothing launched`. Configuration: `scratch/backup-20261112/candidate-6551bd05f7ac/native-config.json`; profile `C:/Users/AnGeLZzZ/AppData/Local/Temp/ql-backup-native-6551bd05-NhosLp/profile`. Equivalent valid main/tmp/bak seeds have startup false, hotkey null, zero tiles and fake desktop folders; candidate flags also disable update checks and desktop attachment.

Read-only exact baseline `scratch/backup-20261112/candidate-6551bd05f7ac/native-before-exact.json`, SHA-256 `9b60c2ccc3abf3bdc74574525eafba6bf01c7122cf179d62701be33968a96f34`, is fsynced. Actual Electron value name `electron.app.QuickLauncher` exists under both HKCU Run (raw REG_SZ/type 1 bytes) and StartupApproved/Run (raw REG_BINARY/type 3 bytes). Live main SHA-256 `6c117e24256d61da0a5ea9d3d914312dd7d533a12f63d2695c936f545887b007`; bak `a456c0428d0b94b568fc544990bf62f2a10b38fcf2c505a66cecaf55de9d73f6`; tmp absent. Installed randomTheme is false. No live configuration bytes were copied back or changed.

Scoped helper `scratch/backup-20261112/native-startup.mjs`, SHA-256 `fd198d11b90b64d7c5a3f8f29706a82c34e62a5ce3c046243d7dc82712aef86e`, was reviewed by Senua. It reads/hashes live files only, captures raw registry type/bytes/absence durably, suspends only the fixed Run value after all QuickLauncher processes are absent and the post-Quit baseline is unchanged, and restores only the two fixed captured values with exact read-back verification after candidate closure. Restore also requires all QuickLauncher processes absent. Only its reviewed capture/suspend/restore/verify modes ran; live configuration was never written by the helper or agent.

Fresh fsynced post-Quit baseline: `scratch/backup-20261112/candidate-6551bd05f7ac/native-closed.json`, SHA-256 `03aa3a71c3e958bceeaffe0412619341300a1dd16980876c12b86188cb376615`. It measured zero QuickLauncher processes, exact original typed registry values and unchanged live main/bak hashes with tmp absent. `native-suspended.log` records removal of only the fixed Run value; StartupApproved stayed byte-identical.

The sanctioned safe launcher started only the unpacked 1.105.0 candidate, root PID 28084 at 20:22:45 Israel, with a fixed 180-second guard and the approved fake profile/desktop flags. Futaba observed the actual Manager version 1.105.0, native Export Save dialog and Escape cancellation (buttons reenabled), then native Import Open dialog and Escape cancellation (buttons reenabled). No file was selected or saved; no import confirmation, successful import or import restart occurred. Manager close/tray persistence was left untested to preserve time for normal Quit. Sergei performed the agreed second tray Quit and reported completion.

`scratch/backup-20261112/candidate-6551bd05f7ac/native-launch.log` records **ended exited**, six owned process identities and zero remaining; this was normal exit, not timeout or forced closure. The launcher's own log is `C:/Users/AnGeLZzZ/AppData/Local/Temp/ql-backup-native-6551bd05-NhosLp/profile/ql-safe-launch.log`.

> CITE: ql-safe-launch PASS | v1.105.0 | profile profile | pid 28084, 6 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged

Before restoring startup or relaunching the installed tool, `native-pre-restore.log` independently measured zero QuickLauncher processes and unchanged live main/bak hashes/tmp absence. `native-restored.log` verifies exact raw Run and StartupApproved values restored with `registryMatches:true` and `liveMatches:true`. Ender then started the original installed `C:/Users/AnGeLZzZ/AppData/Local/Programs/QuickLauncher/QuickLauncher.exe` with a hidden launch window as approved restoration. `native-final.log` measures the intended installed root PID 30280 and its children at that original path, `registryMatches:true`, `liveMatches:true`, original main/bak hashes and tmp absent. The candidate remains closed; the original installed app remains running. No further native action is required for this bounded smoke.
