# QuickLaunch Regions: QA of M4 (Column and Row), 2026-10-06

QA: Futaba. Worktree `C:\Antigravity Projects\QuickLaunch-regions-spike`, branch `wip/regions`, HEAD `792212b`. All three parts are uncommitted; this report is too.

**Verdict:** GO

Verdict A (Judy's M4 rulings applied): **GO**
Verdict B (M3 `qlDecorateTile` first-render race fix): **GO**
Verdict C (region-aware gallery tool): **GO**, with one Major: the tool's `--self-test` does not pass on this branch, which contradicts the brief's claim (see M-2).

No Blocker. Two Majors. Findings are graded Blocker / Major / Minor below. Fixes and design calls are not mine: bugs to Ender, visual calls to Judy, design to Adam.

`Design/story flags:` (1) Judy: the Column filter chip text in `akira` reads as red on near-black by eye, not measured, and the chip is Grid-era styling that Judy's addendum does not cover. (2) Judy/Adam: the peek rule leaves a 9 to 23 DIP sliver when trimming would go below one cell (m-2). (3) Open with Sergei, not acted on: Q14 (kept out of the menu, verified), F5 (a Row primary has no route to DOWNLOAD), offer 1 (the Grid's art scroll). No story or canon flags.

`Pattern alerts:`
1. **Read-once checks against a just-rebuilt window.** The F-2 pixel check is the second such check after §8's "boot: region 1 is a fallback window" read-once race. Both read state once, right after a rebuild, and flake. A poll-until check with a timeout would remove the class.
2. **Correlation claimed from 3 to 4 runs at a roughly 50% base rate.** "Fails from the worktree, passes from the scratchpad" is noise (I measured the cwd out: 2 of 5 fail from the worktree, 3 of 4 from the scratchpad).
3. **A tool claim not run against the live tree.** The gallery `--self-test` was reported as passing but fails on the live tree and on HEAD. It passes only on the `e385df7` snapshot.
4. **The "real Desktop identical" gate trips whenever Sergei saves a file mid-run.** This is the second time (the WhatsApp image on 2026-10-05, `VioletPlush.png` today). The gate cannot tell his files from ours, and it reads as a product failure in the log.

---

## 1. Pinned snapshot

HEAD `792212b` plus the 23 uncommitted files. Every sha256 (first 12 hex) matched at the start, again after the census restart, and again after all testing (0 mismatches each time). The snapshot copies and the full uncommitted diff are in `scratchpad\futaba-m4\snap\`.

| sha256 (12) | File |
|---|---|
| 018ab76ebfe9 | Docs/QuickLaunch_Regions_TechPlan_2026-10-01.md |
| 7e4b949de1f4 | scripts/regions-selftest.mjs |
| 984a8f3977ac | src/main/regions/controller.js |
| 64ba48ea7e2b | src/main/regions/layouts.js (new) |
| f095823f6e76 | src/renderer/app.js |
| 9e3dfbaad23b | src/renderer/region.js |
| 83932d192483 | src/renderer/styles/region.css |
| f089412fa68e | test/regions/controller-layouts.test.js (new) |
| 1db35054ef45 | test/regions/layouts.test.js (new) |
| 33c15452203d | src/main/ipc.js |
| b7245fc80b73 | src/main/manager-preload.js |
| f140b3cc0959 | src/main/preload.js |
| 14a159f4d55b | src/main/regions/model.js |
| fd3559fb301e | src/main/regions/placement.js |
| c04f6f0f1b69 | src/main/tray.js |
| 15fe0a720719 | src/renderer/index.html |
| 34c3a9552574 | src/renderer/manager.html |
| 8c71bf3e4e27 | src/renderer/manager.js |
| 67296fcd88ec | Docs/QuickLaunch_Brief.md |
| b62a9b1da998 | package.json |
| 44c025a8c6dc | scripts/theme-gallery/main.cjs |
| 32141af3f94d | scripts/theme-gallery/regions.mjs (new) |
| 03c5133225e5 | scripts/theme-gallery/run.mjs |

**Builds used (mine, not Ender's).** `electron-builder --win --dir --publish never --config.directories.output=<my scratch>` (no `npm run build`, no `npm run release`). Its `app.asar` `src/` is identical to the worktree `src/` (`asar extract` + `diff -r`, CRLF normalised, 137 files). HEAD's build is the existing `dist/win-unpacked`, whose `src/` I diffed equal to `git archive HEAD src`. The no-fix build for B is Ender's `m4\dist-a`: I diffed its `src/` against the worktree and the only difference is exactly the §8.4 hunk in `region.js`.

## 2. Census and Desktops

**Census before and after (same).** Sergei's QuickLauncher, off-limits and untouched: PIDs 21232 (parent 17448), 30036, 18216, 3444. 0 `electron.exe` at the start and at the end. My processes left at the end: 0 (self-tests, sampler, mutation, gallery). Node processes: 3 before, 15 after, all belonging to other agents' tooling (Codex runtimes, Playwright), none mine.

**Real Desktop** (`C:\Users\AnGeLZzZ\Desktop`): 85 entries before, 86 after. The only difference is **an added `VioletPlush.png` (1,794,837 bytes, created 20:15 local)**. Nothing removed or changed. I did no Desktop writes; every file operation ran on fake Desktops inside my scratch folder. The "real Desktop and Public Desktop identical" gate passed in 25 runs and failed in 1 (`head-1`, whose window overlapped the 19:55 save; the same new file). I take that to be Sergei's save, not ours, because the gate reads only and the file is not in any QuickLaunch store or log.
**Public Desktop** (`C:\Users\Public\Desktop`): 4 entries before and after, identical.
**Fake Desktops:** one per run under `scratchpad\futaba-m4\st\`, `crash\` and `c*\`; the app's `QuickLauncher Shortcuts` folder was never created in the user profile (checked).

**Ender's missing file.** `WhatsApp Image 2026-10-05 at 00.16.32.jpeg` is absent from the real Desktop now (only `...2026-09-05 at 10.21.54.jpeg` is there). I searched the QuickLauncher profile folders (`Roaming\QuickLauncher`, `Roaming\quicklauncher`, the installed app folder) and the user-profile store path for that name: no mention. The name appears only in Ender's own Desktop listings (`m4\desktop-start/resume/end.json`), not in his `job2` listings. Not investigated further, as briefed. Note for Sergei: it is his own photo.

## 3. Ender's claims, reproduced

| Claim | My method | Result |
|---|---|---|
| Unit 211/211 on Node | `node --test test/` (Node 26.10) | **211/211** |
| Unit 211/211 on Electron's Node | `ELECTRON_RUN_AS_NODE=1 electron.exe --test test/` (Node 20.18.1) | **211/211** |
| Mutation 43/43, unmutated 211/211 | Reran Ender's runner (copy of it in my folder, own scratch copy of the tree), plus 8 mutants of my own (pitch S+40 to S+32, the peek upper bound, cap floor to ceil, Row end padding, Column padding, empty region counting 0 cells, icon-size clamp, the refusal string) | **51/51 caught** (his 43 and my 8); unmutated **211/211** |
| Self-test attached 138/138 | My build, own scratch root | **138/138** (guard: clean, 0 left, Run keys unchanged; focus: 0 foreground changes to the build) |
| Self-test fallback 139/139 | 15 runs on my build (see §5) | **Reproduced intermittently**: 7 of 15 runs 139/139; the other 8 fail only "F-2 pixels" (138/139) |
| Self-test probe 55/139 | `--probe` | **55/139** (84 red; all 22 new checks red, none passing) |
| HEAD build 116/138, exactly the 22 new checks | New self-test on the HEAD build, attached | **116/138**; the 22 failing are the 21 M4 checks and "M3 race" |
| Crash 5/5, 5/5, 4/4, 3/3 | `regions-m3-crash.mjs` crash-add, crash-back, restore, refusal on my build | **5/5, 5/5, 4/4, 3/3** |
| Gallery: 101 themes x 5 sets x 22 states = 2,020 PNGs, every measure 0 | `npm run gallery:regions` (my out folder) | **PASS**: 101/101 in all 5 sets; 707 + 606 + 303 + 202 + 202 = **2,020 PNGs**; all 260 measure cells (13 measures x states x sets) are **0**; guards: login-item 0, IPC outside the list 0, sockets 0, registry unchanged, 0 processes left |
| Gallery spot check by eye, 10+ themes | Opened PNGs from Ender's `gallery-final` and from my run (the bytes match, see below) | 13 themes looked at: `lcars` (Row notice), `mirrors-edge` (Column hover), `mordor` (Row edit), `blair-witch` (empty Row), `alien` (Column update), `silent-hill` (Column rename), `mass-effect` (Row filter), `warhammer` (Row notice), `event-horizon` (empty Column edit), `akira` (Column filter), `portal` (Row hover), `ghost-shell` ("Region 8"), `ac-templars` (Column). Nothing cut, covered or clipped. Notices wrap in 2 lines, `Region 8` wraps to 2 lines, the accent bar is capped, the EDIT label is legible, the hover glyph is readable on the light themes. One concern (akira chip, flags above) |
| Gallery determinism | Compared my 2,020 PNGs to Ender's `gallery-final` | **2,013 byte-identical**; 7 differ: all 7 states of `column/ac-templars` (visually the same). See m-3 |
| B: the "M3 race" check | See §4 | Confirmed |
| C: no `--layout` is byte-identical to snapshot `e385df7` (15/15), and `--self-test` passes | See §6 | Identity **confirmed**; `--self-test` **does not pass on this branch** (M-2) |

## 4. Part B: the M3 first-render race fix

`region.js` ends with one more `renderGrid()` when the grid already holds tiles, once `qlDecorateTile` and `qlAfterRender` exist. I read it: it covers both orders (items arriving before or after the script's end), only re-renders tiles, and does not touch the filter, edit or drag state at load.

| Build | M3 race check | Whole run |
|---|---|---|
| M4 with the fix (mine) | PASS (`kind` "moved", ↩ in edit mode) in all 16 runs that include it (1 attached, 15 fallback) | 138/138 attached; fallback 139/139 or 138/139 (F-2 pixels only) |
| M4 without the fix (Ender's `dist-a`, `src` diffed) | **FAIL x3** (`view.kind` null, edit ↩ present) | 137/138, only this check |
| HEAD's build | **FAIL** (`kind` null) | 116/138 (the 22 new checks) |
| `--probe` | red, as designed | |

**`.url` safety.** The self-test writes `Rebuilt.url` only onto the fake Desktop, drops it into a region and moves it in, then moves it back. The moves journal shows only `add` and `back` operations. The test hooks record launches and never run them; the log has no launch, no open-external and no browser in the guard's process list, and "no drag launched an app" passed. **Nothing opened the `.url`.**

## 5. The open finding: F-2 pixels on region 1 in fallback

**Answer: a timing flake in the check. It is not a product defect and not F-2 coming back. The environment adds to the rate but is not the cause.**

How I measured it.

1. **Repetition, both launch places.** 8 runs of the fallback self-test on my build, alternating the launch cwd (worktree, scratchpad), plus 1 single run: 5 of 9 failed "F-2 pixels", all on region 1 only. From the worktree: 2 failed of 5. From the scratchpad: 3 failed of 4. **The launch place makes no difference**, so Ender's "3 of 3 from the worktree, 4 of 4 passing from the scratchpad" was chance at a roughly 50% rate. A read-only z-order sampler ran beside each run.
2. **Instrumented copy** of the self-test (in my scratch, not in the repo): after the original check reads the 8 windows, it polls region 1 every 100 ms (pixel count, `visibilityState`, page age). 6 runs, 3 failed the check (6, 1 and 6 colours). Every one of the 6 then read region 1 as painted: at about 9 ms after the failed read it already showed 399 to 528 colours (a 1,450-colour frame in the passing ones), and **2,069 colours, 94% lit, by 117 to 127 ms**, and it stayed there. `visibilityState` was `visible` throughout; page age at the failed read was 235 to 340 ms. So the window is shown, paints, and finishes within about 130 ms. A never-painted F-2 window stays one flat colour for ever.
3. **The failed reads are in-progress frames.** Values seen at the check: 1 colour (0% lit), 6 colours (90% lit, the background but no content), then 174 to 629 colours (passing), then 2,069. It is a progressive first paint read too early.
4. **The check that waits agrees.** "F-2 rebuilt while hidden" (rebuilds region 1, shows all, waits 1.2 s, then reads) read **2,069 colours in all 20 fallback runs** (15 on M4, 5 on HEAD).
5. **Not M4's doing; it pre-exists.** HEAD's own committed self-test on HEAD's build in fallback, 5 runs: 1 failed the same check (region 1, 6 colours); another passed with only 44 colours at 24% lit, near the thresholds. The A-only and A+B builds failed it the same way per Ender, and B only re-renders tiles.
6. **Why region 1 is the odd one.** It is the only window read right after being rebuilt. It is also a smaller window (about 192 x 162 px in the test) with sparse content, so its colour count is low even when passing (174 to 629, against about 2,266 for the other windows). That explains Ender's "78 to 608 even when passing".
7. **Environment.** In every run all 8 region windows sit under Sergei's windows (a Chrome window, WhatsApp and a Godot editor overlap them), and region 1 is no more covered than the others. Chromium occlusion tracking is already disabled by the test's flag. I cannot separate machine load or Sergei's compositing from the check's timing: both would only stretch the first-paint latency, which the check does not wait for.

**Consequence.** It gets in the way: the fallback self-test is red about every second run on a healthy build (M-1), and Sully will see a red the product did not earn. It is not a product failure. For Ender, not fixed by me: poll for the first full frame with a timeout (the data shows under 130 ms; 3 s would be ample), as the other check already effectively does.

## 6. Part C: the region gallery tool

- **Identity.** `run.mjs --ref=e385df7 --only=cyberpunk,dune,lcars,matrix,portal` (no `--layout`) with the new tool: 15 PNGs. The same with HEAD's old tool (a copy of `scripts/theme-gallery` at HEAD): 15 PNGs. **0 byte differences** between old and new, between two new runs, and against Ender's `gctl\final-ref` (15/15). Both runs PASS with the guards clean.
- **`--self-test`.** On the `e385df7` snapshot: **PASS** (2/2 themes, 6 PNG, the controls fire). On the live tree: **FAIL** (0/2 themes: "timed out after 3000 ms waiting for settings overlay open"; controls "self-test ran" and "duplicate-grid detector" DID NOT FIRE; "IPC outside allowlist 10": `region:info`, `region:open-manager`). On HEAD (`--ref=HEAD`): **FAIL** the same. **HEAD's old tool on the live tree: FAIL** the same. So this is not caused by C: since M2 the main grid's Settings button opens the Manager, and the tool's Settings state clicks it. Ender said so for the Settings state (§ 9, "Gallery"), but the brief says the self-test passes; it does not, on this branch.
- **Region mode** works end to end (my 2,020-PNG run); `--self-test` refuses `--layout`, so region mode has no self-test of its own; its controls are Ender's negative-control gallery runs, which I did not repeat.
- **Merge conflict with `wip/theme-fidelity` (its `check:hover`), noted, not resolved.** I dry-ran a three-way merge of the working copies in scratch: `run.mjs` 4 conflict hunks, `main.cjs` 3, `package.json` 1 (`scripts`). `git diff HEAD main` for these paths is empty, so main (`e385df7`) itself does not conflict.

## 7. Part A: Judy's M4 rulings, checked against the spec

- **CSS, byte-for-byte.** I extracted the addendum's `css` block and compared it rule by rule (whitespace and comments normalised) to `region.css`: **29 of 29 rules present verbatim, 0 missing or different.** The five old declarations the addendum deletes are gone (Column `scrollbar-gutter: stable` on `#grid-container`, Row `max-content`, Row `#title-area` `height: 44px`, Row `#title` `line-height: 18px`, the old `lead-notice-on #lead-notice` rule; the one rule with that selector left is Judy's new one).
- **JS.** `ROW_NOTICE_MS = 8000`; the scroller is `#app-grid` (`scrollTop`, `scrollLeft`, the wheel handler); `showLeadNotice` sets the tooltip to the full text; `drawBanner` sets the slot's tooltip to the update message (and clears it otherwise).
- **Peek rule.** `boxAt` matches the addendum's code line for line. I tested it independently: the vectors **Column 820, 824, 616, 936; Row 2232, 1192, 3071, 1728; Column with the edit bar 758** all hold. My own sweep (S = 32 to 128, Column in 4 bar states and Row, rooms 300 to 2600, 69,030 cases): never longer, never below one cell where one cell fits, **maximum cut 87 DIP**, 0 violations.
- **Strings and copy.** Row `EDIT`, Grid `// EDIT MODE`, no Column label, `No room for this layout. Move the region first.`, `+ NEW REGION ▾` with `aria-haspopup="menu"` and the tooltip `Create a region`: all as ruled.
- **Her four defects**, each by the attached self-test check (all PASS) and by the gallery measure (0 of 101): Column rename field ends 6 DIP before ⋯ (field right 132.33, ⋯ left 138.33); Row notices not clipped, 8 s, 2 lines for `TARGET UNREADABLE`; `Region 8` shown in full on 2 lines, the block 54 px in view and edit; Row `EDIT` resolves to `--text`. I also confirmed the Row EDIT contrast and `Region 8` by eye (`mordor`, `ghost-shell`).
- **Q14.** Fan and Ring are not in the region menu's Layout submenu (`BUILT_LAYOUTS`: Grid, Column, Row), nor in the tray's New region or the Manager's + NEW REGION. As built, as Judy recommended.

## 8. Findings

### Blocker
None.

### Major
- **M-1. The fallback self-test's "F-2 pixels" check is a flake: it fails about every second run.** 8 of 15 runs on the M4 build and 1 of 5 on HEAD's own test and build. It reads region 1 once, right after a rebuild, before the first full frame (1 or 6 colours at the read, 2,069 within 130 ms). Product is fine (§5). It makes "fallback 139/139" non-reproducible and a gate will go red at random. Repro: `node scripts/regions-selftest.mjs --fallback --exe <build> --guard <guard> --root <temp>` a few times. Expected: green every time on a good build. Actual: "F-2 pixels ... region 1 1c 0 FAIL" or "6c 0.9 FAIL" in about half. Owner: Ender (poll with a timeout). Not fixed by QA.
- **M-2. The gallery tool's `--self-test` fails on this branch** (live tree and HEAD, old tool and new tool alike); it passes only on the `e385df7` snapshot. The brief's "the tool's `--self-test` passes" is wrong as stated. Cause: the Settings state in the main-grid renderer clicks a button that now opens the Manager (M2). It will also fail on main once the regions code merges. Repro: `node scripts/theme-gallery/run.mjs --self-test --work <scratch>`. Expected: SELF-TEST PASS. Actual: 0/2 themes, "timed out after 3000 ms waiting for settings overlay open", two controls did not fire. Owner: Ender or Jane (decide whether the main-grid states follow the new Settings route, or the self-test pins the old snapshot).

### Minor
- **m-1. Two comments still say 5 s** for the Row notice: `region.css:236` and `index.html:22`. The code is 8 s (`ROW_NOTICE_MS = 8000`).
- **m-2. The peek rule can leave a 9 to 23 DIP sliver** when trimming would drop below one cell (for example S = 128 with both Column bars at a room of 309 to 323, or a Row at S = 128 near 300 to 303). This follows Judy's own rule ("never below one cell"), so it is a design note, not a defect. To Judy and Adam.
- **m-3. The gallery is not byte-deterministic for `ac-templars` in Column**: all 7 states differ between my run and Ender's (visually identical). The earlier "pixel-identical captures" claim therefore holds for the main-grid path (15/15 in 3 runs) but not for that theme in region mode. Not graded as a visual defect.
- **m-4. One intermittent failure on HEAD's own M3 test** (`head-4`: "files without a tile" and "moved off the desktop" counts, one file late) in 5 runs; 0 of 16 attached or fallback runs on M4 hit it. Pre-existing, not M4.
- **m-5. Tech plan §9.1's finding text** ("painted in 4 of 4 runs from the scratchpad", "3 of 3 from the worktree") attributes the failure to the launch place; my data says it does not. The "not proven" wording was right. For Ender to correct in § 9.1.
- **m-6. Not graded, routed.** For Judy: `akira` Column filter chip text by eye (see flags). Open with Sergei, not acted on: F5, offer 1.

## 9. Not run (for the next away window)

All need real OS input or a real display change, which was not allowed with Sergei at the PC.
1. Real wheel and Shift+wheel over a Row, and a real touchpad sideways swipe (the self-test checks the unshifted wheel by a page event only).
2. Real Tab through a Row in edit mode (⋯, tiles, cluster); the self-test reads the DOM order only.
3. A real OS drag of desktop icons onto an empty Column or Row cell (the cell as the landing slot), and onto a Column or Row that is stopped and scrolling.
4. The cluster's + opening the real file dialog, and ⊞ opening the visible Manager picker.
5. The region menu's Layout submenu, the + NEW REGION ▾ menu and the refusal box as real on-screen menus and dialogs (the tests record them).
6. A layout switch seen on the desktop (resize and restyle in one step) on the desktop layer and in fallback.
7. A real resolution or scale change with Column and Row regions (forbidden unless Sergei says so); the peek rule after a shrink.
8. The 8 s Row notice on screen, and a notice tooltip on hover.
9. The Row EDIT label, hover glyphs and the Column's update slot looked at on the real display (the 2,020 offscreen PNGs stand in for it).
10. Win+D with fallback regions (open question from § 8.3, still a decision for Judy and Sergei).

## 10. Run log (all in `scratchpad\futaba-m4\`)

`selftest-attached.log` (138/138); `f2loop\` (8 fallback runs, z-order samples `z-*.jsonl`); `exp\`, `expruns\` (6 instrumented runs); `headruns\` (5 HEAD-test runs); `ctl\` (probe, HEAD build, no-fix x3); `crash\` (4 parts); `gallery\` (2,020 PNGs, `summary.json`); `c\`, `c2\` (part C); `mutrun\mut.log` (51/51); `merge\` (dry-run merges); `pinned-hashes.txt`, `desktop-before.txt`, `pubdesktop-before.txt`, `snap\`.
