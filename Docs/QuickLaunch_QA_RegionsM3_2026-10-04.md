# QuickLaunch Regions M3 ("desktop files move in"): QA report (Futaba, 2026-10-04)

Tool: QuickLaunch v1.94.3, branch `wip/regions`, worktree `C:\Antigravity Projects\QuickLaunch-regions-spike`, HEAD `d878e86` plus the uncommitted M3 work (TechPlan 8 and 8.1, UX spec "Addendum: M3 rulings", Sergei's two rulings of 2026-10-03).
Instance tested: the packaged build `dist\win-unpacked\QuickLauncher.exe`, copied into the scratchpad and run only through `scripts/qa/quicklaunch-safe-launch.mjs`, on temp profiles, with a fake desktop (`--ql-test-desktop=<dir inside the scratchpad>`). Sergei's own QuickLauncher (4 processes, installed copy) was running the whole time and was never touched.

**Verdict:** GO

GO covers what can be proven without real mouse or keyboard input and without touching Sergei's desktop: the move rules, every move-in and move-back path, collisions, refusals, crashes and hard kills, reconcile, the missing-file rulings, every ruled string, contrast, tooltips, geometry, close and Quit. It does not cover a real Explorer drag of real desktop icons onto a desktop-child window, the native `+ FILE` dialog, the real uninstaller or the native menus and boxes as pixels: those are in section 8 and wait for Sergei's own away window. No file was lost, duplicated or deleted in any run, including 5 randomised sequences (400 operations, 24 crash or hard-kill attempts, 95 injected faults). No Blocker. One Major (a silent failed drop when the store folder cannot be used) and eight Minor.

Pattern alerts: 2 (section 9)

---

## 1. Receipt (what Sully would commit)

Entry-check receipt (qa-handoff script, run in the worktree; the tool declares none of the five scripted checks):

`Entry-check receipt: quicklauncher v1.94.3 @ d878e86 (dirty: Y) — pre-qa n/a, post-build n/a, check-electron n/a, check n/a, test:smoke n/a`

No receipt line from Ender came with the brief, so there is nothing to compare against; this is mine.

- `git rev-parse HEAD` at the start, mid-way (twice, after each pause) and at the end: `d878e860f74b289d6f5440c80d69e21a595eff8d`, branch `wip/regions`.
- Dirty set: 28 `git status --porcelain` entries = 20 modified files + 8 untracked entries (12 new files: two untracked folders expand to 1 and 5 files). `git diff --stat`: 20 files changed, 1632 insertions, 57 deletions (tracked files only).
- **Pin.** `git ls-files -c -o --exclude-standard` of the worktree (tracked plus untracked, ignored files and `node_modules` excluded) = 200 files, copied to `scratchpad\futaba-m3\snapshot\` at 08:27 (+03:00). Manifest `scratchpad\futaba-m3\manifest.json` holds each file's SHA-256 (source and copy). Method: `tools\pin.cjs pin | snap | live`.
- **End check.** `pin.cjs live` at the end: HEAD same, `git status --porcelain` text identical to the pinned one, 200 of 200 files hash-identical. `pin.cjs snap`: the pinned copy still equals the manifest (200 of 200). Both were also re-checked after each of the two pauses of this session. This report file is the 201st file in the worktree; it was written after that check and is not part of the tested set.
- **Node modules.** The snapshot has none of its own. For the unit tests and the repo scripts I copied `koffi` and `@koromix/koffi-win32-x64` from the worktree's `node_modules` into `snapshot\node_modules` (92 files, a copy, no link; the set hashes equal to the worktree's). No junction or symlink was created anywhere.
- **The packaged build is the tree under test.** I copied `dist\win-unpacked` (271 MB, `app.asar` sha256 `e0719541f68c8cf29b53dff958142db0a1319ae442538370c0581e12b13308af`, exe `a84f8553f236e9deb62ed61f2c0c46d9e14d39ea950e20ffc82237c45bd334d6`) to `scratchpad\futaba-m3\build\`, extracted its `app.asar` and ran `diff -r` of its `src/` against the pinned `src/`: no difference. (The asar's `package.json` is electron-builder's rewritten one, as in M2b.) Every launch used this copy.
- Dirty files and hashes (SHA-256 of the pinned copy):

| | File | SHA-256 |
|---|---|---|
| M | `Docs/QuickLaunch_Brief.md` | `0ac727ade1fe436d345517558ab3afdf7e7a3c6e1d9def379c9de641b4a48c19` |
| M | `Docs/QuickLaunch_Regions_TechPlan_2026-10-01.md` | `1d098411dc270f0aea04c1ddf7571f751391d51fba5b8b67b2285a4d2a054cea` |
| M | `package.json` | `e901d024486e23e09f502b329041b9f46895e95a71560b18cd1a4c91270f9074` |
| M | `scripts/regions-selftest.mjs` | `399e17b2c42e0b2a2a7c5dede06a96c39cae772beb5c81d0f97f1178844e60c5` |
| M | `scripts/tryit-regions.mjs` | `d25e6c5d84068d325c773ee7fdcafe4aeabf2a14ac724600a1c8f879aa850d7a` |
| M | `src/main/index.js` | `59cc41df383ae8889c1dc0c81a7c93ce63da4e67feb08672e98a20f40e80fb2e` |
| M | `src/main/ipc.js` | `d1f14f65cb52459e693ec832fc138144052fb98628c6beb64a4e35b7b22d4ddf` |
| M | `src/main/manager-preload.js` | `c8d6034ea56dfcc90be25220beeca5d0b5327162637d68b5f33aa812377a638e` |
| M | `src/main/preload.js` | `75a8f9cdaefcce400a2e7cff23c2f3c1e44ee9328049958cf97ee90ea342b3c0` |
| M | `src/main/regions/controller.js` | `c352bf5177a3befc3ffb54d30960bcc5d312ee180afde8ba8d760c6cc0e453f4` |
| M | `src/main/regions/model.js` | `768055ed9a860ed860fd13c67ac05f971a16611bec6d1fc5c224b6c39306c2ae` |
| M | `src/main/store.js` | `a83664e98d9a4dec9f1f87518947d2a4e339a7ba557ec612d5d3874760fd438e` |
| M | `src/renderer/app.js` | `b9f3782cec6a48e225dcf6bda4fad45ed42ab22e7c6b0c22fd7f4af8ae8482f0` |
| M | `src/renderer/index.html` | `aab8743a06e6c04f58775a0ad7c1c2f4124d3b6a5575cf812a1ae81baf949252` |
| M | `src/renderer/manager.html` | `276dc02f08a7dfc84047e00c976ce65536d17e8311ac5cf7e5e3863c152c2abf` |
| M | `src/renderer/manager.js` | `d45a3112bbbb5bc397050a34eb3eb2757a9d6e41a6969b480ccf22ba66910a61` |
| M | `src/renderer/region.js` | `27999cca8187c892bd988eac0fbdd91deb9b20c711e63177d76c4f5fbab29923` |
| M | `src/renderer/styles/manager.css` | `82b1df40b7dcf5086dc0dcde52aab169a8b0438fb2cfe9d3c3cc8bfffea4eb6e` |
| M | `src/renderer/styles/region.css` | `8b796280aa2c3eadb527f1c5e4766e7a4c2e569726f509d4228777fbea92ee73` |
| M | `test/regions/model.test.js` | `e25cb917981059d299c7ab78a11829f66386146545bb410b7935f534862233cf` |
| new | `scripts/nsis/installer.nsh` | `d4ba0e0133156cc5839e03cc4dcce4a989ef6a0794c443e3944c683ac5bdb98e` |
| new | `scripts/regions-m3-crash.mjs` | `27c3787cd9e7db8fd1104a19d5797717cf6b0f066980b788c311c3422fe26d98` |
| new | `src/main/moves/journal.js` | `1e874dd75104831dfb1327a3681b4f3a8835c364830f1c59b82161a5aaa10c0d` |
| new | `src/main/moves/mover.js` | `99c28d4633a11b69ee929cd9c3ccac647c63be50f96d08a00a6663bc255af406` |
| new | `src/main/moves/rules.js` | `6969a413e4104ec9fc2c65396e0c5c72a981a2f1651c881c6dec3e6baf5c941b` |
| new | `src/main/moves/setup.js` | `330de1a5402d4985a6452f93cd31b5d5952cd7b75aee260a6263eb76a54a9e17` |
| new | `src/main/moves/win32.js` | `86aff8157952dfe125bdf55182a53393ecef9f6fb7d4b6530428760deb7d89c9` |
| new | `test/regions/controller-moves.test.js` | `050e6a1b4e9ab90f99e74c8b35eacdf9acb055daf49d49595e2cfdb492aae8c6` |
| new | `test/regions/m3-rulings.test.js` | `8e96adcb87ba3a2214d0eeb998029121e07e245748d3c28c69ee1ae9e265071d` |
| new | `test/regions/moves-mover.test.js` | `e6cea57c802614ee90a86fff573856184efaa345fe8c1de3b6fef6a73193b7cc` |
| new | `test/regions/moves-never-delete.test.js` | `0ece8b59cda3167cdcc01035ee2d11e8c98077f2d8258abf16355735d2bdd699` |
| new | `test/regions/moves-rules.test.js` | `8e0aecfe80cfc1cf22ff1da44cf5d7c22b21aa73964f067ffa730c620f579446` |

Machine at test time: Windows 11 (10.0.26300), Node 26.10.0, one display only (a virtual "WinDisc", 1920 x 1080, work area 1920 x 1032), LongPathsEnabled = 1, the Desktop is `C:\Users\AnGeLZzZ\Desktop` (not OneDrive-redirected; `%OneDrive%` is set but the Desktop is outside it, as Sergei ruled). The earlier M3 numbers in TechPlan were measured at 5120 x 1392 DIP; this machine is not in that state today (section 10).

## 2. Real Desktop and Public Desktop (proof)

Method: `readdir` + `lstat` (name, kind, size, mtime in ms) of `C:\Users\AnGeLZzZ\Desktop` (84 entries) and `C:\Users\Public\Desktop` (4 entries), plus "does `C:\Users\AnGeLZzZ\QuickLauncher Shortcuts` exist" (never did), saved as JSON under `scratchpad\futaba-m3\proof\real-<session>.json` and diffed with `tools\diffreal.cjs`. Folder paths read from `HKCU ... User Shell Folders` and `HKLM ... Shell Folders` (read-only `reg query`) and by the repo's own `SHGetKnownFolderPath` lookup in the self-test. The full baseline listing is in Appendix A. In addition every repo run (self-test, crash script) and every probe of mine lists both folders before the launch and after the quit, in-process, and compares them.

| Session | Runs between the pair | Result |
|---|---|---|
| s0 baseline (08:27) | none | the Appendix A listing |
| s1 | self-test attached, run 1 | **one change**: Desktop folder `GUI-win-x64` mtime moved from 2026-07-03 to 2026-10-04 05:30:18.857 UTC. Attributed below. Nothing else |
| s2, s3, s4 | self-test attached run 2, fallback, `--probe` | identical |
| s5, s6 | crash script: crash-add, crash-back, restore, refusal, then its `--probe` runs | identical |
| s7 (resume after pause 1) | none | identical to s6; against s0 only the `GUI-win-x64` change |
| s8, s9 | self-test on a copy of Sergei's data file (two runs) | identical |
| s10 (resume after pause 2) | none | identical to s9 |
| s11 | self-test attached run 3 | identical |
| s12 final | none | identical to s11; against s0 only the `GUI-win-x64` change |
| in-process, every probe P1 to P13 and the fuzz | every launch of those scripts | "real Desktop and Public Desktop unchanged" PASS in every script, before and after |

**The one change, attributed.** `GUI-win-x64` is a folder of an Avalonia GUI tool (it holds `ScannedFiles.db`, `Settings.json`, `log.txt`). Its own `log.txt` reads `08:30:18 => Found previously scanned files, importing...` and `Settings.json` was rewritten at 08:30:21; the folder's mtime equals 08:30:18.857 (+03:00), the moment the tool rewrote its log. At that time the foreground observer of the same run logged Sergei working in `mmc.exe` and `TeamViewer.exe` (11 foreground changes, none to our build). Our run touched only the scratchpad fake desktop (`moves-log.jsonl` of that profile names no other path), and the folder has not changed since. Not ours. A re-run of the same self-test two minutes later (s2) was identical.

`C:\Users\AnGeLZzZ\QuickLauncher Shortcuts\` was never created (checked in every list). The original `%APPDATA%\QuickLauncher\quicklauncher-data.json` was only read to make a copy; its SHA-256 before and after my runs is the same (`f0142cc0acaf540f2498be8636d43f7d7421d22e6706234d0becb2e3bbed62a`), and the launch guard said "real data untouched" in every run. The real uninstaller and `--ql-restore-all` were never run against real folders; `--ql-restore-all` ran only against fake desktops.

## 3. Counts, and how I counted

| Run | Mine | Ender's claim | Method |
|---|---|---|---|
| Unit tests | **128/128** | 128/128 | In the pinned copy: `node --test --test-reporter=tap test/`: `# tests 128`, `# pass 128`, `# fail 0`, `# skipped 0`, `# todo 0`; 128 `ok ` lines, 0 `not ok`. Cross-count of `test(`/`it(` calls per file: controller-moves 17, controller 16, desktop-layer 4, fg-verdict 3, m3-rulings 6, model 14, moves-mover 25, moves-never-delete 2, moves-rules 10, pick-host 7, placement 14, tile-order 10 = 128; no `.skip`, `.todo` or `.only`. M3's part: 17 + 6 + 25 + 2 + 10 = 60, so 68 before M3, as claimed. Real files, real `MoveFileExW`, run inside `QL_TEST_TMP` in the scratchpad. A second full run (inside my mutation script) gave 128/128 again |
| Unit positive control (mine) | 10/10 mutants caught | 50/51 caught (their runner) | `tools\mutants.mjs`: for each, a fresh copy of `src`, `test` and the koffi modules, one deliberate break, `node --test`. Caught (tests red): REPLACE_EXISTING added to `MoveFileExW` (5 red), COPY_ALLOWED added (4), no journal intent before the move (9), no collision numbering (7), Public Desktop access-denied wording lost (4), a missing-file tile blocks Delete region again (2), Move all back counts missing-file tiles (3), a page save may re-path a moved tile (3), `dropEffect` answered "move" (3), an `unlink` of the moved file (10). The unmutated snapshot stays 128/128. I did not re-run Ender's 51 |
| Self-test, attached | **101/101** (runs 2 and 3, and on a copy of Sergei's data with its window rect fitted to this display); run 1: 99/101 | 101/101 | `node scripts/regions-selftest.mjs --guard … --exe <my build copy> --root <scratchpad> --port 9441`; counted `PASS  ` and `FAIL  ` lines in the saved log and read the footer `RESULT: n/n`. Run 1's two reds: one external (the `GUI-win-x64` folder, section 2), one a flake (m-6). Details in sections 6 and 10 |
| Self-test, `--fallback` | **100/100** | 100/100 | Same method. The observer saw 17 of our top-level windows (need 8), 0 foreground changes |
| Self-test, `--probe` (positive control) | **53/102**, 49 reds | 53/102 | Same method. Composition of the 49 reds, by reading the names: 22 = M1's 2 and M2/M2b's 20 (items 1 to 20 plus the injected foreground event and the injected renderer error), 26 = every M3 check, 1 = the listing-comparison control. The real-desktop, real-store and guard checks pass in the probe run |
| Crash script, normal | crash-add **5/5**, crash-back **5/5**, restore **4/4**, refusal **3/3** | 5/5, 5/5, 4/4, 3/3 | `node scripts/regions-m3-crash.mjs --guard … --exe … --part <p>`. Refusal ran 2/3 from the pinned snapshot (m-7) and 3/3 when started from the worktree path (its `outside %TEMP%` folder is derived from the script's repo path); the three crash parts and restore ran from the pinned copy |
| Crash script, `--probe` | crash-add 3 reds, crash-back 3 reds, restore 1 red, refusal 1 red | add 3, restore 1, refusal 1 | Same, `--probe`. All fail as they must; crash-back (not in their list) behaves like crash-add |
| Foreground gate | **0 foreground changes to this build** | 0 | The repo's out-of-process observer (`scripts/fg-observer.mjs`, `fg-verdict.cjs`) ran in every self-test and crash run, and I wrapped it around P4 (six hard kills), P5, P8, P11 and P12 as well (`tools\fgrun.mjs`): hooks ok, 0 changes to our build. The wrapped batch ran attached, so the observer saw no top-level window of ours; the proof that it sees our process is the fallback run (17 shows) |

My own probes (all `tools\p*.mjs` in the scratchpad, driven over CDP `Runtime.evaluate`, plus `Input.dispatchDragEvent`, `Input.dispatchMouseEvent` and `Input.dispatchKeyEvent` into the page renderer: renderer-level, never OS input):

| Probe | What | Result |
|---|---|---|
| P1 | The page's real drop code via drag events carrying file paths; a dropped link | 8/9 (the 9th is an observation, section 7) |
| P2 | Name collisions, `.lnk` and `.url`, awkward names, move back with collisions | 16/16 |
| P3 | Refusals, attributes, streams, long path, odd files | 18/22: the 4 reds are findings m-1, m-3, m-4 and my own guard-exit-code check |
| P4 | Six hard kills and a Quit mid-move, multi-file and region-delete crashes, garbage journal, stale intent | 11/11, twice (second time under the observer) |
| P5 | Missing-file rulings, Delete region and Move all back in awkward states, page save guard | 22/22, twice |
| P6 | Strings, tooltips, geometry, real mouse and key events, contrast in all 101 themes | 19/19 |
| P7 | Every ruled string against the addendum, README bytes, notices | 29/29 |
| P8 | Close and Quit from every screen | 5/5, twice |
| P9 | Randomised sequences with a conservation invariant | 5 seeds clean (section 5) |
| P10 | Deterministic repro of m-2 | repro confirmed |
| P11 | Addendum measures 4 and 8, restore-all in awkward states | 12/13 (the red is a guard exit-code capture, section 7) |
| P12 | Environment faults | 8/10: finding M-1 |
| P13 | Notice versus an update offer | finding m-5 |

## 4. Findings

### Blocker
None.

### Major

**M-1. A drop does nothing, and says nothing, when the store folder cannot be made or entered.** The file is safe, but the person gets no box, no notice and no tile, which is exactly the "slot opens and then nothing happens looks like a failed drop" state the addendum (B7) rules out.
Repro (packaged build, fake desktop, `tools\p12-env-faults.mjs`, cases A and B; or by hand): (1) make a FILE called `QuickLauncher Shortcuts` where the store folder would go (or `icacls <store> /deny <user>:(W,AD,WD)` on the existing folder); (2) launch with `--ql-test-desktop`, drop a desktop `.lnk` on a region (real drop code via `Input.dispatchDragEvent`, or `region:drop-files`). Observed: the main process prints `Error occurred in handler for 'region:drop-files': EEXIST (or EPERM): mkdir '…\QuickLauncher Shortcuts'`; the page's promise rejects, its `.then(…, () => null)` swallows it, the slot vanishes; boxes 0, banner empty, tiles 0; the `.lnk` stays on the desktop, journal empty (no loss). Expected: the B1 box (`Couldn't move “X” off the desktop. It is still on the desktop.` plus a reason).
Cause by reading: `Mover._ensureStore()` (`src/main/moves/mover.js`, called inside `_addOne` before the intent) has no try/catch around `mkdir`; `addPaths` rejects; `controller.dropFiles` (`controller.js`, around line 232) has no catch. A throw from `journal.intent()` (disk full, the profile folder locked) would take the same path; I did not run that one. Likely real-world triggers: Controlled-folder or antivirus protection on the profile root, a policy-restricted home folder. Status: open. For Ender.

### Minor

**m-1. An existing tile that points at the same Desktop shortcut is left behind as a dead twin.** Repro (`p3-refusals.mjs`, case A): the data file (v1.94.3 format) holds a reference tile `Refd` with `path` = `<Desktop>\Refd.lnk`; drop that file on the region. Observed: the file moves, a new moved tile `Refd` appears, and the old reference tile stays, pointing at the now-empty desktop path (a click would say TARGET MISSING; it carries no broken pip because it is a reference). Expected: one tile (convert the old one, or say so). The spec does not rule this case. Sergei's own data has no tile that points into the Desktop (all 5 are `shell:AppsFolder`), so he will not meet it today.

**m-2. A moved tile whose file vanished can be silently "healed" by a different file, leaving two moved tiles on one path.** Repro (`p10-ownership.mjs`): drop `Steam.lnk` (moved tile T1); a person or antivirus removes `QuickLauncher Shortcuts\Steam.lnk` (T1 turns broken); Steam is reinstalled and a new `Steam.lnk` is dropped. The mover finds the name free, stores the new file as `Steam.lnk` again, T2 is added, and now T1 and T2 both point at one file. ↩ on T1 returns it to T1's origin and leaves T2 broken; with different origins (Desktop and Public Desktop) the file goes to the wrong one. No file is lost. Found by the randomised run: it appeared in 5 of 5 seeds. Fix idea for Ender to judge: do not reuse a store name that a moved tile still owns.

**m-3. A file dragged out of the store folder onto another region becomes a second (reference) tile for a file a moved tile already owns.** Repro (`p3-refusals.mjs`, case H): `region:drop-files` with `…\QuickLauncher Shortcuts\Twice.lnk` on region 2 while region 1 owns it. After ↩ on the first tile the second one points at an empty path and is not marked broken. Same family as m-1.

**m-4. A desktop shortcut with a very long name fails with a false reason.** Repro (`p3-refusals.mjs`, case F): a `.url` whose desktop path is 250 characters (store-folder path 266). Observed: `MoveFileExW` returns Win32 3 (`ERROR_PATH_NOT_FOUND`), the box reads `Couldn't move “WWW…” off the desktop.` with `The file is missing.` and the "It is still on the desktop." sentence is dropped (because every reason is "missing"). The file is untouched and right there. The machine has LongPathsEnabled = 1, so the packaged app's call does not get long-path treatment. On Sergei's real folders the limit is a name of 218 characters or more (`C:\Users\AnGeLZzZ\QuickLauncher Shortcuts\` is 42 characters, the Desktop 26). Rare; wrong text.

**m-5. The "NOT A SHORTCUT" notice replaces an update offer.** Repro (`p13-banner.mjs`): `showUpdateBanner('UPDATE AVAILABLE: v9.9.9', [DOWNLOAD])` is on screen in a region; drop a `.txt` with the real drop code. The banner becomes `NOT A SHORTCUT ✕`, the DOWNLOAD button is gone, and 8 s later the banner hides altogether, so the offer is lost until the next check (and the dismiss path also calls `dismiss-update`, which clears the tray's update indicator). Launch errors do the same today; the addendum puts the notice in that slot on purpose, so this is for Judy to see, not a deviation. A mis-drop is now a much easier way to hit it than a launch error.

**m-6. One check of the self-test is flaky.** In 1 of 4 valid attached runs (run 1, with Sergei active on the machine) `drag between regions: dropped on the left half of the first tile, it takes the first place` failed with `slotIndex: -1` while the tile did land in first place (`r3: ["seed-2","seed-1"]`). The check reads the preview 250 ms after the pointer move; either the slot took longer under load or the wait is too short. The product result was right. Runs 2 and 3 and the real-data copy passed.

**m-7. Two harness limits, not product defects.** (a) `regions-m3-crash.mjs --part refusal` takes its "outside %TEMP%" folder from `<repo>\scratch`; from a pinned snapshot that lives inside `%TEMP%` it is not outside, so the refusal does not happen (2/3). It passes 3/3 from the worktree path. (b) The self-test on a copy of Sergei's real data aborts on this machine today (55/65, "run aborted"): his saved window rect is `x 3374, 1032 x 840`, which does not fit the current single 1920 x 1080 display, so the M1 checks that create 8 regions find only 4 places. With the copy's `windowPosition`/`windowSize` set to `{300,200}` and `424 x 300` the run is 101/101 and the migration of his 5 shortcuts is intact. The seed rect is Sergei's; a copy is how I tested.

**m-8. Not M3 (M1 Manager header): the theme's tagline text sits under the tab buttons.** In `mirrors-edge` the header pseudo-element text `… CITY OF GLASS …` runs under the REGIONS and SETTINGS tab buttons (page render of the hidden Manager: `scratchpad\futaba-m3\cases\20261004101443-dbg3\shots\mgr-mirrors-edge.png`). Spec rule: nothing covers anything. Same family as M2b's m-8 (see pattern alert 1). Judy's call.

### Observations (no action asked)
- **Hover border of ↩.** At rest the ↩ border (`--accent-text` on the badge) measures 2.97 to 3.00 in the three themes Judy named and 3:1 or better in the other 98. On hover the border is `--accent-c`, which is under 3:1 in 19 of 101 themes (lowest `portal` 1.80); the hover glyph stays at 5.03 or better. Judy ruled the hover colours; I only report that her "13 themes" for `--accent-c` reads 19 in my measure of the hover state.
- A drop that holds only a `.txt` (nothing added) still clears an active type-to-filter; that is the ruled definition of an accepted drop (deviation 13), not a bug.
- First click on a missing-file tile whose file has come back un-breaks the tile (pip goes) and shows no box; a second click launches it. Reasonable; noted because "it did nothing" is a possible reaction.
- The save-error banner that appears when the data file is held during a commit says `SAVE ERROR — SETTINGS MAY NOT PERSIST` although what is at risk is the moved tile (the journal still resolves it on the next start; section 5).
- TechPlan 8 and 8.1 measured at a 5120 x 1392 DIP work area; this machine is at 1920 x 1080 today, so layout-dependent numbers are not comparable one to one.

## 5. What was exercised (the brief's checklist), with evidence

| Item | Evidence |
|---|---|
| **Move in** (drop; real DOM drop code) | P1: 7 paths in one real drag-and-drop event: Desktop `.lnk`, `.url`, Public `.lnk` moved byte-identically; `.exe` and a shortcut from another folder became references; a folder and a `.txt` ignored with the notice `2 FILES ARE NOT SHORTCUTS`. Journal: one intent and one done per file |
| **Move back, every route** | ↩ with a real mouse event (P6.12); Delete key on a focused tile (P6.13); tile menu "Move back to desktop" (P7.4c); Delete region (P5.1 to P5.3, P7.3, P11.A); Move all back from the region menu (P5.4c) and from the Manager (P5.4a/d, P7.4d); `--ql-restore-all` (crash script 4/4, P11.C); also ADD BACK and MOVE TO DESKTOP in the Manager (P7.7) and "Move to" another region then ↩ from the new owner (P5.5g/h) |
| **Name collisions** | P2: Desktop and Public `Dup.lnk` land as `Dup.lnk` and `Dup (2).lnk`; `case.lnk` and `CASE.LNK`; a stray `Pre.lnk` already in the store untouched; `Same.lnk` + `Same.url`; `Steam.lnk` + `Steam (2).lnk`; back onto a desktop that already has `Dup.lnk` and `Dup (2).lnk` returns as `Dup (3).lnk` with both untouched; the Public one returns to the Public desktop under its original name; restore-all with a newer desktop `Same.lnk` leaves it alone and returns `Same (2).lnk` |
| **`.lnk` and `.url`; awkward names** | Real `.lnk` files made with WScript, `.url` text files; Unicode, Hebrew, emoji, `[ ] & ( ) # % ' ;`, a leading space, a long name, a zero-byte `.lnk`; read-only + hidden attributes and mtime kept in and back; the `Zone.Identifier` stream of a `.url` survives in and back |
| **Refusals** | `.exe` stays a reference (P1, P7); locked file, share-read and exclusive (P3.B); existing target and a name appearing between the intent and the move (P2, self-test); cloud-only placeholder (`FILE_ATTRIBUTE_OFFLINE`, P3.D); cross-volume (injected Win32 17, P3.C3: a second volume cannot sit inside `%TEMP%`); admin-only (injected 5 on the Public Desktop, P3.C2, and the self-test's real read-only ACL); a FOLDER named `x.lnk` is never moved. Reasons checked: all seven of B9. Every refused move leaves an `aborted` journal record and no pending intent |
| **Crash after each step, then reconcile** | Crash script: add (intent, moved, committed) and back (the same three), each followed by a start that reconciles. Mine, with real hard kills of my test app's own browser PID (`TerminateProcess`): kill between move and commit (file in store, no tile on disk, intent pending) then reconcile finishes the add; kill after the intent; kill during a move back; a real Quit while an add is paused between move and commit; a 3-file drop killed after file 2; Delete region killed after 2 of 3 files; a truncated journal (set aside, not deleted, store files listed); a stale intent for a deleted region; two more clean cycles change nothing |
| **Randomised sequences** (P9) | 5 seeds x 80 operations, one fake desktop of 14 files with colliding names: 137 drops (25% through the real DOM drop), 73 move-backs, 18 Manager Move-all-back, 7 region deletes, 10 region creates, 4 "Move to", 47 person-made moves (file out of, into, renamed inside, vanished from the store folder, put back on a desktop), 95 injected Win32 faults, 67 held-open files, 12 clean restarts, 24 crash or hard-kill attempts (11 through the crash hook, 13 as a real kill of the test app; 2 of the 24 did not reach their step and ended as clean quits). Invariants after every step: every user file exists exactly once (SHA-256 multiset equals the start), journal empty at rest, every moved tile's file there or flagged missing, every store shortcut owned by one tile or listed as a file without a tile, no duplicate ids, the data file agrees with the pages. **0 violations** except the ownership case m-2 (counted once per run, in all 5). Positive controls: a planted duplicate and a planted loss each trip the invariant (`FUZZ_CONTROL=dup|lose`). Three first attempts of seeds 13, 14, 15 aborted on a bug in my harness (a crash step that was not reached left the app running and a second instance was started); fixed and re-run (section 10) |
| **Missing-file tile rulings** | P5.1 and P11.A: a region with 2 moved, 1 missing and 1 reference: ONE confirm box (`2 shortcuts move back…` / `2 other shortcuts are removed… The apps stay installed.`), region deleted, no failure box, no file deleted (the vanished file is where my test left it); P11.A1: 1 missing + 1 reference reads `2 shortcuts are removed from QuickLauncher. The apps stay installed.`; P5.2: a file vanishing during the move back never keeps the region; P5.4: Move all back counts and skips correctly in the region menu (item enabled only with a file present) and the Manager, singular and `They leave 2 regions.`, and at 0 `None moved off the desktop.` with the button disabled; P6.8 to P6.14: real click, Enter and Space show the box with Keep as default, ✕ and Delete remove the record with no box; the file coming back un-breaks the tile |
| **Drop effect `copy`** | The page's own capture listeners with real drag events (`dragenter`, `dragover`): `copy` on both, default prevented (P1.1); also the self-test and unit scan. See observation in section 7 about the `drop` event |
| **Manager, Moved shortcuts; file with no tile** | P6, P7: count lines, OneDrive note (the fake desktop declared under a OneDrive root through the app's environment), standing "Moving is unavailable." with three buttons disabled and tooltips, click on disabled does nothing, ADD BACK goes to the first region, MOVE TO DESKTOP with a collision gives `Strayone (2).lnk`, a failing MOVE TO DESKTOP gives the ruled box |
| **Every ruled string** | P7 and P5: B1 (every row, 4 names = `and 1 more`, 7 names = `and 4 more`, "all missing" drops the where sentence, two reasons give one line per name), B2, B3 singular forms, B4 box and tooltip, B5 tooltips and standing line, B6 README byte for byte (472 bytes, CRLF, ASCII, written once, never overwritten) and the uninstaller string equal to `installer.nsh` including `/SD IDOK`, B7 notices (one and `3 FILES ARE NOT SHORTCUTS`; shown 7.8 s on screen, no box), B8 cheat-sheet row, B9 all seven reasons, B10 filter cleared by an accepted drop and left by a FULL drop, B11, empty-Grid copy. 0 differences |
| **Contrast, dark and light, then all 101** | `cyberpunk` (dark) and `mirrors-edge` (light), then every theme (`tools\p6-ui.mjs`; gate convention: colours flattened over black, panel over the flattened background; transitions switched off for the reading). Manager sentences and button labels: lowest 5.76 (`mordor`), none under 4.5. ↩ glyph at rest: lowest 5.45 (`silent-hill`); on hover 5.03 (`uncharted`). Pip disc against the tile: lowest 5.76; the "!" mark against the disc: lowest 3.11 (`wow-scourge`), none under 3. ↩ border at rest: lowest 2.97 (`silent-hill`), 3 themes under 3:1 by 0.03, matching Judy's table. Raw data: `…\cases\20261004101741-p6-ui\contrast-all-themes.json` |
| **Tooltips on new controls** | ↩ and ✕ on a broken tile, the broken tile and its label, OPEN FOLDER, MOVE ALL BACK… (live, at 0, unavailable), ADD BACK, MOVE TO DESKTOP, orphan name = file name; every `aria-label` equals its title (P6.2, P6.4, P6.7, P6.11, P7.8) |
| **No element covering another** | Manager section at 560 x 560 and at the 440 x 420 minimum (viewport override): every button 24 px, no two elements overlap, each button's centre hits itself, nothing wider than the section, no horizontal scroll. Tile: pip at x 3 to 15, y 3 to 15, clear of the icon, kept in edit mode beside the ✕. A page render of the Manager in a light theme (`…\cases\20261004101443-dbg3\shots\mgr-mirrors-edge.png`) shows the section laid out cleanly; it also shows the older header overlap, m-8 |
| **Close and Quit** | P8: the Manager closes from regions, settings, cheat-sheet and picker by ✕, by CLOSE and by Esc (overlays close first; on the regions view the first Esc only leaves a focused field); closing it never ends the app (the recorded tray exception); the Quit handler (the function the tray item calls) with the Manager open and a move paused mid-way ends the process (`ended exited`, `0 left`) and leaves the intent for the next start, which finishes it |
| **Environment faults** | P12: data file held open by "another program" during a commit: the move completes, the tile shows, the intent stays pending (never marked done before the commit is on disk), the existing save-error banner appears after about 10 s, the next save after release writes the tile, the next start resolves the intent with exactly one tile. Store folder unusable: M-1 |

## 6. Judy's "Futaba measures" (addendum, 1 to 10)

1. Broken tile pip geometry, fill and contrast: P6.7, P6.11, P6.15 (and the self-test, in the default theme and across all 101 themes for colours): pass.
2. Click, Enter, Space box text, buttons, defaults: P6.8, P6.9: pass.
3. Edit mode ✕ `Remove tile` removes at once with no box; a moved tile with its file keeps ↩: P6.11, P6.12, P6.14: pass.
4. 1 missing + 1 reference: `2 shortcuts are removed…`, no failure box; 2 moved + 1 missing: `Move 2 shortcuts back…`: P11.A1, P11.A2: pass.
5. Each B1 failure box from injected failures, 4 names `and 1 more`, two reasons one line per name: P7.4a to P7.4g, P5.3a: pass.
6. The seven B9 reasons: P3 (5 admin, 5 denied, 32 in use, 17 other drive, OFFLINE attribute, 2 missing, 1117 other): pass.
7. `.txt` and a folder with one `.lnk`: one tile, `2 FILES ARE NOT SHORTCUTS`; `.txt` alone `NOT A SHORTCUT`, no box, nothing moved: P1.5, P7.5: pass.
8. Filter hiding every tile, then a drop: cleared and the tile visible; a rejected drop leaves it: P11.B0 to B2 (real drop code): pass.
9. Manager at 440 x 420 etc.: P6.3 to P6.6, P7.8: pass.
10. README and uninstaller texts byte for byte: P7.1, P7.2: pass for the files in the tree. I did not compile the NSIS script myself (Ender's `makensis` evidence is accepted); the uninstaller itself is Sully's packaged-build test.

## 7. Notes on method that matter to the verdict

- **Real drops are DOM-level, not OS-level.** `Input.dispatchDragEvent` with file paths reaches the page's real `dragenter`/`dragover`/`drop` listeners and `webUtils.getPathForFile`, so the page's own drop code ran (the self-test calls a test seam instead). What it cannot show is Explorer's side of the drag and the OLE hand-off to a window that is a child of the desktop. One reading to know: on the `drop` event the page sees `dropEffect = "none"` under this synthetic path (it is `copy` on `dragenter` and `dragover`, which is what the OS is answered with while the pointer is over the region). I believe the final effect handed back to the OS is the one from the last `dragover`, but I could not prove it; it is item 1 of section 8.
- A dropped link (`text/uri-list`, as dragged from a browser) does not navigate the region page away (P1.6).
- P11.C1 (`--ql-restore-all` with collisions, a Public-origin file, a file without a tile and a missing-file tile) is red only on the exit code: the guard prints `ended by exited` with no code for that fast exit. Every outcome I could verify is right (nothing left in the store folder; newer `Same.lnk` untouched; `Same (2).lnk`; `PubOne.lnk` on the Public desktop; the file without a tile on the desktop; nothing lost; nothing pending) and the identical second run reported exit 0. After restore-all the missing-file tile's record stays in the data file (harmless at uninstall).

## 8. Pending: next away window (real input, Sergei's own message to Futaba)

None of these were run. No real mouse or keyboard input was sent at any time; no window was opened or activated on Sergei's screen apart from the region windows the test build itself shows, and the observer logged 0 foreground changes to the build.

1. **A real Explorer drag of desktop icons onto a region** (U5, desktop to region). Does the desktop-child window accept the OLE drop at all; what the cursor reads; that Explorer leaves the dragged icon alone (`copy`) while the move takes the file, and the icon disappears afterwards; that Explorer is not holding the `.lnk` open while we move it (the box would read "The file is in use."); that the `drop` effect issue in section 7 does not make Explorer treat the drop as cancelled. First drop: a throwaway shortcut (Judy's advice), not a real one.
2. A real drag of a Public Desktop icon: the "Needs administrator rights." box, nothing moved.
3. The native `+ FILE` dialog returning a `.lnk` itself (Windows may resolve a shortcut to its target; Electron has no switch for that on Windows), and the B10 clear after it.
4. The native region menu, tile menu, and the message boxes as pixels: Cancel as the default button of Delete region and Move all back, Keep on the missing-tile box, Esc, the warning icon, the box over the desktop-child window.
5. Real hover tooltips (I measured `title` and `aria-label` attributes only), and the real Manager window as pixels (the hidden Manager gave me three page renders, one reliably).
6. The tray's real Quit click, Show/Hide and double-click; the real hotkey.
7. The real uninstaller (Sully's packaged-build test): the stock "is QuickLauncher running" step, then `--ql-restore-all` with Sergei's real tiles, the leftover box, README and folder removal, and exit code 3 when his running copy holds the single-instance lock.
8. A real Bitdefender reaction to the packaged build moving files out of the Desktop and into the profile root (controlled-folder style protection would show up as the "Windows denied access to the file." box, or as M-1 if the folder cannot be made).
9. A real display or scale change and sleep/resume with pending moves (carried from M2b; forbidden even inside a window unless Sergei says so).
10. The M3 step of `tryit-regions.mjs` (a to e): it asks Sergei to do these real drags and verify the result. Per "Sergei is not QA" they are items 1, 4 and 5 above for Futaba's away window; Sergei's question stays "is it useful?" (pattern alert 1).

## 9. Pattern alerts

Pattern alerts: 2

1. **Try-it hands Sergei the real-input checks again (M1, M2, M2b, M3).** The M3 step (`scripts/tryit-regions.mjs`, Judy's B12.2 text) has Sergei drag two files, click ↩, open the Manager, press Move all back and judge each result: behaviour verification, the thing "Sergei is not QA" (2026-10-01) rules out. M2b raised it with a proposed fix (trim to feel-only questions, add a mechanism); nothing in this tree changes it. Proposed disposition: **fix.** The real-drag steps go onto Futaba's away-window list (section 8, items 1, 4, 5), and the try-it keeps one feel question ("did dropping feel right, is this useful?"). A mechanism rather than another restatement: the qa-handoff receipt lists the try-it and Sergei's copy of it carries only steps tagged "feel". Sergei decides.
2. **Theme art under the new UI (M2b m-8, M3 m-8).** Cyberpunk's `PROTOCOL ACTIVE` string under the `// EDIT MODE` label (M2b) and now a theme tagline under the Manager's tab buttons (`mirrors-edge`): the same annoyance, "something is drawn over something else", in two screens across two builds, each time pre-existing theme art against newer UI, each time found by eye. Proposed disposition: **fix.** Judy rules which layer wins; Futaba adds one measure to the theme gallery (rect of each theme's header pseudo-element against the controls, all 101 themes, both screens) so it is not found by eye a third time. Or Sergei accepts it explicitly.

## 10. Launches, leak sweep, limits and my own mistakes

- **Launches.** Every launch went through the QA guard, on a temp profile inside the scratchpad, with `--ql-test-hooks` (menus, launches and message boxes recorded, never shown; the Manager never shown or focused) and `--ql-test-desktop=<scratchpad dir>` (the app itself refuses it unless inside `%TEMP%`). Repo runs: 3 attached self-tests, 1 fallback, 1 probe, 2 on copies of Sergei's data; crash script parts and their `--probe` runs. Mine: 78 case folders, each with one to six launches (the fuzz relaunches after every crash, kill and restart). Each ended `ended exited` with `0 left` or, in the hard-kill cases, by `TerminateProcess` of my own test app's browser process, whose PID I took from the debug port of that launch (`SystemInfo.getProcessInfo`); the guard then reported nothing left. `Run` and `StartupApproved\Run` registry keys unchanged in every guard report that carried one.
- **Sergei's QuickLauncher**: PIDs 30760, 23324, 31752, 41564 were present at the start and at the end and were never signalled; the guard noted it ("left alone") in the reports I read.
- **Leak sweep (end).** `tasklist`: only those 4 `QuickLauncher.exe`. No listener on any debug port I used (9441 to 9581); `netstat` showed 9510 and 9512, owned by `RemoteServerWin.exe` (Unified Remote), not mine and left alone. No node process of mine left. After each of the two pauses of this session I re-listed my processes and the ports before continuing.
- **What I left on disk (deleted nothing, recursive deletes being denied).** All under `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ab778959-0638-4d60-8887-346c422e496e\scratchpad\futaba-m3\`: `snapshot\` (6.7 MB, 292 files), `build\` (278 MB, the build copy and the extracted asar), `cases\` (243 MB, 78 case folders: profiles, fake desktops, ops logs, contrast data, the `shots\` page renders), `st-root\` (self-test profiles and fake desktops), `crash-root\`, `unit-tmp\` (unit-test folders), `mut\` (the 10 mutation copies), `proof\` (the real-Desktop listings and observer logs), `logs\` (every run's output), `tools\` (my harness and probes), `manifest.json`, and `real-data-copy.json` and `real-data-copy-fit.json` (copies of Sergei's data file; the second has only its window rect changed). The one test that denied writes on a fake store folder reset its ACL afterwards (`icacls /reset`). In the worktree itself nothing was created except this report; its `scratch\` folder still holds only `manager-mock\`.
- **Coverage limits.** Headless on pixels (three renders of the hidden Manager and none of the region windows). Everything used `--ql-test-hooks`, so a start without the hooks, and the native boxes and menus, were not exercised. A read-only store was exercised through the test hook and the unit tests, not by making the real data file unreadable at start (the guard refuses an unreadable data file). The display was one 1920 x 1080 virtual display, so multi-monitor and ultrawide behaviour was not tested here.
- **My own mistakes, found and fixed before the numbers above.** (1) PowerShell receives its file list through an ANSI environment variable and mangled non-ASCII names, so those shortcuts are copies of a real `.lnk` plus a unique tail. (2) My first contrast pass read colours mid-transition (three light themes read 1.3 to 2.0 on buttons) and, separately, read the ↩ badge while the pointer was on it (hover colours as "rest"); both fixed (transitions off for the reading; rest and hover measured apart) before the table above. (3) Several of my checks assumed things the build does not promise (a CLOSE button on an overlay closes the Manager; a click on a healed tile launches it) and were corrected to the actual, ruled behaviour. (4) My first notice test called the IPC channel directly, which never shows the notice (the page shows it); it now uses the page's own drop code. (5) The fuzz harness bug described in section 5. Every red in the tables above is either a finding, an environment fact or one of these.

## Appendix A. Real Desktop and Public Desktop before the first run (s0, 08:27 +03:00; identical at the end except `GUI-win-x64`)

Public Desktop (`C:\Users\Public\Desktop`, 4 entries; identical at every listing):

| Name | Kind | Size (bytes) | mtime (UTC) |
|---|---|---|---|
| DarkThumbs.lnk | file | 2587 | 2026-05-30 13:39:19.723 |
| desktop.ini | file | 174 | 2024-04-01 07:24:04.090 |
| Redshift 8 Premium.lnk | file | 1246 | 2023-09-29 06:03:23.144 |
| Redshift 9 Premium.lnk | file | 1023 | 2023-09-29 05:59:53.241 |

Desktop (`C:\Users\AnGeLZzZ\Desktop`, 84 entries). The end listing (s12) has the same 84 names, kinds, sizes and mtimes; the only difference is marked.

| Name | Kind | Size (bytes) | mtime (UTC) |
|---|---|---|---|
| 1761391658910NIML-1.csv | file | 162 | 2025-10-25 12:06:57.094 |
| 2026-02-09 11.16 - Color Blocks (2).xlsx | file | 289923 | 2026-02-16 15:34:29.729 |
| AI | dir | 0 | 2024-01-06 15:59:48.684 |
| AI Datasets - Shortcut.lnk | file | 733 | 2023-06-08 14:46:13.970 |
| Audiobooks - Shortcut.lnk | file | 690 | 2024-02-18 17:15:06.897 |
| BCD-backup | file | 32768 | 2026-08-08 17:07:13.552 |
| BCD-backup.LOG | file | 32768 | 2026-08-08 17:07:13.505 |
| BCD-backup.LOG1 | file | 0 | 2026-08-08 17:07:13.511 |
| BCD-backup.LOG2 | file | 0 | 2026-08-08 17:07:13.512 |
| Books I own now | dir | 0 | 2026-02-27 19:22:09.524 |
| books_from_screenshots.csv | file | 52005 | 2026-02-27 19:36:18.699 |
| BOSD Debug | dir | 0 | 2026-08-08 15:30:50.851 |
| BS | dir | 0 | 2026-06-05 13:21:53.327 |
| BSG_Digital_Map.png | file | 188906 | 2024-09-19 14:21:30.669 |
| Canada - Shortcut.lnk | file | 836 | 2025-10-22 17:33:00.862 |
| cdumm_worker.log | file | 12890 | 2026-09-05 12:37:42.174 |
| CDUMM3.exe | file | 84340352 | 2026-09-04 06:19:51.864 |
| Colorized | dir | 0 | 2020-03-07 20:16:07.947 |
| Comix - Shortcut.lnk | file | 660 | 2024-02-06 18:31:33.976 |
| Companies.txt | file | 53 | 2023-01-14 20:58:59.867 |
| CONTROL Resonant.url | file | 223 | 2026-09-24 17:35:05.945 |
| Crimson Desert Mods | dir | 0 | 2026-09-05 12:37:30.612 |
| CrystalDiskInfo Kurei Kei Edition.lnk | file | 1884 | 2025-07-09 18:01:08.397 |
| Death Stranding Director's Cut - Display Mods v1.0.exe | file | 6422528 | 2025-07-06 17:26:36.012 |
| desktop.ini | file | 446 | 2025-02-15 22:00:38.177 |
| Detroit Become Human ultrawide 0.9.9.exe | file | 5898240 | 2019-12-15 03:47:36.341 |
| dlss5oneclick.exe | file | 16676864 | 2026-10-03 12:57:59.051 |
| dlss5oneclick.exe.old | file | 16620544 | 2026-10-01 07:17:07.914 |
| DnD | dir | 0 | 2023-10-19 13:20:52.018 |
| EmuDeck EA Windows.bat | file | 175 | 2026-06-20 15:44:58.670 |
| Eve | dir | 0 | 2024-03-17 18:02:57.417 |
| EVE Online.url | file | 220 | 2025-02-09 20:16:14.905 |
| EVE.txt | file | 279 | 2022-09-17 13:26:55.853 |
| f0c8c36b-02f9-4440-a7ac-a1bddfcc2f48.webp | file | 136508 | 2025-11-27 11:55:54.507 |
| filthy Figments | dir | 0 | 2022-11-19 08:23:07.232 |
| foldertomultiple7z.bat | file | 71 | 2022-07-24 08:20:42.627 |
| Forti Pass.docx | file | 12717 | 2024-01-04 14:56:18.853 |
| gameDB.csv | file | 4872299 | 2026-01-01 19:18:02.966 |
| GMAIL+GCKEY.docx | file | 91474 | 2026-09-11 07:11:50.631 |
| gog-plugins-downloader-v0.2.3 | dir | 0 | 2024-01-06 18:29:05.461 |
| GraphicsDrivers-backup.reg | file | 391360 | 2026-09-04 08:37:11.888 |
| GUI-win-x64 | dir | 0 | 2026-07-03 06:56:56.146 (end: 2026-10-04 05:30:18.857) |
| Hatima_me.png | file | 21291 | 2025-09-30 16:40:19.481 |
| Hentai Heroes | dir | 0 | 2026-03-16 10:54:17.176 |
| image.png | file | 1781579 | 2026-05-14 10:26:00.695 |
| JPEGtoPDF | dir | 0 | 2021-12-23 16:07:34.420 |
| K4sh's Fixes.CT | file | 13343 | 2022-08-17 20:35:10.033 |
| license.okl | file | 749 | 2024-08-01 21:08:48.437 |
| Mara - Shortcut.lnk | file | 820 | 2026-07-24 15:29:26.420 |
| Memes | dir | 0 | 2024-12-01 10:48:28.091 |
| mgsvtpp.exe | file | 228753920 | 2022-08-17 06:22:19.918 |
| mizzurna-falls-english-31-03-2021 | dir | 0 | 2022-03-26 13:33:36.207 |
| MMOGA.txt | file | 1037 | 2026-06-06 20:10:37.269 |
| MTGA Assistant.lnk | file | 2329 | 2024-11-02 16:28:22.605 |
| New | dir | 0 | 2026-08-25 09:55:51.821 |
| NFTs | dir | 0 | 2022-01-21 18:25:08.274 |
| Noosphere - Shortcut.lnk | file | 713 | 2026-07-24 15:29:20.867 |
| OCCT.config.json | file | 27940 | 2025-07-09 18:39:00.208 |
| OCCT.exe | file | 228551280 | 2024-07-30 16:42:56.906 |
| Persona 5 The Phantom X.lnk | file | 595 | 2025-06-27 09:35:42.117 |
| Platforms.txt | file | 232 | 2018-10-27 17:21:05.287 |
| ProcessExplorer | dir | 0 | 2023-04-11 06:16:16.700 |
| Programs and Features - Shortcut.lnk | file | 505 | 2020-12-17 19:47:14.710 |
| Project Manager Assessment.docx | file | 120254 | 2024-07-14 10:17:54.102 |
| prompts.txt | file | 1385 | 2023-07-02 14:43:38.217 |
| RESIDENT_EVIL_RELICT-2.5-pc.zip | file | 1169220328 | 2026-03-22 19:45:17.567 |
| ROSEBLANK-1.1-pc.zip | file | 1146421831 | 2026-03-22 19:49:13.503 |
| Rubina_D._Bolshayaproza._Dizayiner_Jorka_Kniga_Vto.fb2 | file | 6934545 | 2025-11-14 08:49:11 |
| SILENT HILL Townfall.url | file | 223 | 2026-09-23 18:51:54.345 |
| SVD Workflow.json | file | 10205 | 2024-09-06 07:10:52.677 |
| temp output | dir | 0 | 2022-11-26 17:47:02.837 |
| The Clinical Sexologist - Therapy Policies and Agreement - Signed.pdf | file | 228617 | 2026-08-27 19:01:50.690 |
| The Clinical Sexologist - Therapy Policies and Agreement Blank.docx.pdf | file | 179416 | 2026-08-27 18:41:24.286 |
| The Incident at Galley House.url | file | 223 | 2026-10-03 17:55:44.120 |
| TheTrove | dir | 0 | 2024-10-06 09:25:26.503 |
| Thumbs.db | file | 21718016 | 2017-07-01 16:11:03.248 |
| TIME GAL & NINJA HAYATE (iso) | dir | 0 | 2024-08-24 13:24:38.620 |
| Tor Browser | dir | 0 | 2026-06-09 17:43:48.312 |
| TR004-System-Events.csv | file | 5931 | 2026-08-06 08:38:15.349 |
| Unsorted Audiobooks.lnk | file | 829 | 2021-06-04 13:22:43.309 |
| Unsorted Comics - Shortcut.lnk | file | 771 | 2025-07-09 19:31:08.385 |
| vdd_settings.xml | file | 2779 | 2024-12-24 18:31:44 |
| WhatsApp Image 2026-09-05 at 10.21.54.jpeg | file | 135058 | 2026-09-05 07:22:55.335 |
| דואר ישראל | dir | 0 | 2025-08-15 12:52:25.529 |

Store folder `C:\Users\AnGeLZzZ\QuickLauncher Shortcuts`: did not exist at the start (false) and does not exist at the end (false).
