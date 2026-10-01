# QuickLaunch Regions M2b: QA report (Futaba, 2026-10-01)

Tool: QuickLaunch, branch `wip/regions`, worktree `C:\Antigravity Projects\QuickLaunch-regions-spike`.
Scope: M2b (Judy's "Addendum: M2 rulings", her six Futaba checks, "Fallback focus: recommendation" = Option A; TechPlan 6 and 7.4).
Instance tested: the packaged worktree build `dist\win-unpacked\QuickLauncher.exe` v1.94.3, always through `scripts/qa/quicklaunch-safe-launch.mjs` on temp profiles with no hotkey. Sergei's own QuickLaunch was not running in any launch (the guard said so each time).

**Verdict:** GO

GO covers behaviour that can run without touching Sergei's desktop. It is headless on pixels (see section 9). Real-input checks are not done and are listed in section 8. Nothing in this report is a Blocker or a behaviour Major. Findings: 1 Major on the release path (not caused by M2b), 8 Minor.

Pattern alerts: 2 (section 7)

---

## 1. Snapshot receipt (what Sully commits)

`git rev-parse HEAD` before and after all runs: `a1d842df2e4f5629a3af145516a2812c88da7ba7` (branch `wip/regions`).

Dirty files at the start: exactly the 17 in the brief (13 modified, 4 new), nothing else. Re-hashed after the last launch: all 17 SHA-256 identical to the table below, `git status` unchanged, `dist/win-unpacked/resources/app.asar` unchanged (mtime 2026-10-01 21:31:00, after the last source edit at 21:30:43).
The packaged build is the tree under test: I extracted `app.asar` and `diff -r` of its `src/` against the worktree `src/` found no difference. (The asar `package.json` differs from the worktree's: electron-builder rewrites it; `package.json` is not dirty.)

`git diff --stat` (13 modified): 622 insertions, 95 deletions

```
 Docs/QuickLaunch_Regions_TechPlan_2026-10-01.md |  35 +++
 scripts/regions-selftest.mjs                    | 369 ++++++++++++++++++++----
 scripts/tryit-regions.mjs                       |  43 ++-
 src/main/desktop/desktop-layer.js               |  15 +-
 src/main/desktop/region-host.js                 |   7 +
 src/main/ipc.js                                 |   3 +
 src/main/regions/controller.js                  |  40 ++-
 src/renderer/manager.js                         |   2 +-
 src/renderer/region.js                          |  87 +++++-
 src/renderer/styles/region.css                  |  13 +-
 src/renderer/tile-order.js                      |  17 +-
 test/regions/controller.test.js                 |  60 +++-
 test/regions/tile-order.test.js                 |  26 ++
```

New (untracked): `scripts/fg-observer.mjs`, `scripts/fg-verdict.cjs`, `test/regions/desktop-layer.test.js`, `test/regions/fg-verdict.test.js`.

| File | SHA-256 |
|---|---|
| `Docs/QuickLaunch_Regions_TechPlan_2026-10-01.md` | `4bcc2d67a55f18509b3e7f1efaec07f9901ead3a0cb57f38d608bbe91df5f68c` |
| `scripts/fg-observer.mjs` | `b2d2fe7d65336dbe222dd47efcf3cf1b2d14bcfb9ba18f37f4ef262afb463588` |
| `scripts/fg-verdict.cjs` | `337c1b5598bbee914331d1f2a5a0d925463c3b169665ebdbde70aaef18652e8c` |
| `scripts/regions-selftest.mjs` | `f6006f4bff57bc9672fdea388b55e3ca4ec6015d2264b34e32a96c9a4b898dcd` |
| `scripts/tryit-regions.mjs` | `54cc4bec498a53808f146a405643479d7663aefe27e2c4382eae21dded0d0fc8` |
| `src/main/desktop/desktop-layer.js` | `24e9fe8e8e4f72a696cdecc4782ceab07d5afc16e2411e6b1c7b860480adb5e6` |
| `src/main/desktop/region-host.js` | `8baed4ec2f9cf0978faa9d071f936cf21625855934bb78172cd068c32166819f` |
| `src/main/ipc.js` | `1d8451d1136127df937d64a055b63fc41880d1f29b8797fc5fa50f8d6fb70f88` |
| `src/main/regions/controller.js` | `e710a891c90aedcf41e6694df2ab1126e99db673cfb4cc1a131495e7555f1790` |
| `src/renderer/manager.js` | `f9d14b2e10134c2af0c7272e8685e4c79265530004bc859ce832605fa7457023` |
| `src/renderer/region.js` | `8dd18f497e0ee3bd5c21abfe07c9fae2067d3b2b310c7051b9a8f63b286f5385` |
| `src/renderer/styles/region.css` | `2b79a820b5c601d859f06863d7490b3683dca5be54e840f085f6cae46b1917b5` |
| `src/renderer/tile-order.js` | `843c305e5ea56b7f33c9163c336d328037dcc22271222922ebc3d4954c6bd7ae` |
| `test/regions/controller.test.js` | `fb0dce4bfc9966373bbe0a79f11f869d34655e2a58ea7a8a0849a1edd42ea473` |
| `test/regions/desktop-layer.test.js` | `09e630a824f06a497993c55f7994ed8d4494c925c6a400d746bf8f5dc2aeccfa` |
| `test/regions/fg-verdict.test.js` | `e867b6346a46a5766917befe0ee0d54342cacc9fbded5ff528f0962480384c03` |
| `test/regions/tile-order.test.js` | `7395ffa2c7a31c89ab4d5d3b514c39a4f200009b60aba568c4983c51444ab690` |

This report file is the 18th file in the worktree. It was written after the hashing and is not part of the tested set.

## 2. Counts, and how I counted

| Run | Mine | Ender's claim | How |
|---|---|---|---|
| Unit tests | 68/68 | 68/68 | `node --test --test-reporter=tap test/`: `# tests 68`, `# pass 68`, `# fail 0`, `# skipped 0`. Cross-count of `test(`/`it(` calls per file: 16 + 4 + 3 + 14 + 7 + 14 + 10 = 68. No `.skip`, `.todo` or `.only` in `test/`. |
| Self-test, attached, synthetic seed | 73/73 | 73/73 | Lines starting `PASS  ` and `FAIL  ` counted in the saved log: 73 and 0; footer `RESULT: 73/73`. |
| Self-test, `--fallback` | 72/72 | 72/72 | Same method: 72 and 0. 17 of our top-level windows seen by the observer (need 8). |
| Self-test, `--probe` (positive control) | 51/73, 22 FAIL | 51/73 | The 22 failures are exactly the expected set: M1's 2 (hit areas, renderer errors), M2's 11, M2b's 9 including `focus: no foreground change went to this build` (the injected event). The gate fails when it should. |
| My own probe, attached (X4 + X5) | 25 of 27 checks pass. The 2 reds are not product findings: X4 foreground check needs top-level windows of ours to have been shown and that subset run had none (its zero proves nothing; the foreground evidence is runs 2, 7 and 8 in section 5), and X5 churn check compared the region count with a fixed 5 (the subset started at 6; fixed, and it passes in X6). | n/a | `m2b-probe.mjs` in the scratchpad; not part of the repo. |
| My own probe, fallback (X6) | 14/14 | n/a | Same script, `--fallback`. |

I did not run the self-test on a copy of Sergei's real data file (Ender did; I used the synthetic seed so nothing of his is read).

## 3. Judy's six checks and the fallback gate

Each of these measures runs in the repo self-test and was seen to fail in `--probe` (injected fault, then red). My independent probe adds to them where noted.

| # | Check | Measured | Result |
|---|---|---|---|
| 1 | Slot colour: computed `border-top-color` = resolved `--accent-text` in `twin-peaks` and the default theme; height = neighbour tile, view and edit | Self-test: `rgb(216, 56, 56)` = want in twin-peaks and `rgb(0, 240, 255)` in cyberpunk, 2 px dashed, height 95 = tile 95, view and edit. **Mine, beyond the ask:** all 101 themes (101 files = 101 valid ids): 2 px dashed, no fill, border = resolved `--accent-text`, 3:1 or more on `--bg`, zero failures. Icon size through the Manager at 32 / 64 / 128 (icon measured 32 / 64 / 128 px): tile 63 / 95 / 159, slot equal in every case, view and edit, with a 70-character name. | PASS |
| 2 | Empty Grid mid-preview: `#drop-hint` display none; back after leave | `flex` before, `none` mid-preview, `flex` after. Probe: red when forced visible. | PASS |
| 3 | Copy: opacity 0.93, transform equals the source ghost | `0.93`; `matrix(1.09933, 0.0383894, -0.0383894, 1.09933, 0, 0)` on both. Probe: red at opacity 0.6. | PASS |
| 4 | Shift+F10 and Menu key | Edit mode: one tile menu per press (recorded 2 for 2 presses). View mode: region enters edit mode, `document.activeElement` is that tile, 0 menus. **Mine:** the next press then opens exactly one tile menu (both keys); Shift+F10 / Menu on the handle and on the ... button open the region menu; in the rename field they open nothing of ours; Chromium key events injected into the page (not OS input) open exactly one tile menu each. | PASS |
| 5 | 12 tiles, 5 columns: Ctrl+Down idx 2 to 7; idx 8 nothing; Ctrl+Up idx 3 nothing; idx 7 up to 2; filter | All four cases as specified, status line `Moved to 8 of 12.` then `Moved to 3 of 12.`, focus stays on the tile; filter case: 6 visible, rule applied to visible tiles only. **Mine:** 60 Ctrl+Arrow presses in one tick: order stays a permutation, focus stays on a tile, data file equals page; a Chromium Ctrl+Down moves the tile `cols` (3) places. | PASS |
| 6 | Within 120 ms of leaving, moved tiles animate; none under reduced motion; in-region reorder never animates | On leave: 12 tiles animating at the removal; reduced motion 0; system cancel 0; in-region reorder 0. **Mine, A6 text:** across 171 animation frames from the drop to the new tile: 0 frames with neither slot nor tile (49 frames between), and the slot is gone once the tile shows. | PASS |
| F | Fallback gate (Option A): no region takes the foreground on boot, create, delete, quit; drop to fallback covered | See section 5. | PASS |

Also checked against the addendum: slot colour only, no fill; hint hidden for the preview and back after; ghost unchanged; cheat-sheet row reads `CTRL+ARROWS` / `Move the focused tile; Up and Down move a row (edit mode)`; status node 1 x 1 with `role="status"`; no new control (no new tooltip owed).

## 4. M1 and M2 regressions, close paths

All 73 self-test checks cover M1 and M2: migration, 8-region cap and strings, placement, rename, per-region themes, match-all, Move to, region drag and resize, hide/show, rebuild, tooltips, hit areas (no overlaps, view and edit), Manager rows, tile drag between regions, release on empty desktop (cancels, nothing saved), release on a region's rim (cancels), full region (outline and `FULL (3 max)`, release changes nothing, Move to lists it disabled), Ctrl+Arrow, Menu key, Delete, display change (stand-in work area), resume, drags stopped by a display change, no drag launches an app.

My additions that the self-test lacks, all green in the final runs:
- **Close from every screen (Manager, hidden test window; DOM clicks, no OS input):** regions view X, settings X, settings footer CLOSE, Esc on regions view, cheat-sheet Esc then Esc (the first closes the overlay only), cheat-sheet CLOSE then X. Each time the Manager target disappeared and the regions were still alive in the tray (by design, the recorded tray exception).
- **Picker:** opens for the chosen region, lists 567 installed apps, Esc closes the picker first and the second Esc the Manager; clicking the first entry added exactly one named tile to that region (page and file agree), nothing launched.
- **Quit:** every one of the 8 launches ended with `ended exited`, `0 left`; three of them quit with a drag preview showing. The test-hook `quit` calls `quitApp`, the same function the tray's `Quit QuickLauncher` item calls (`tray.js`: `click: () => quit('tray')`, then `app.exit(0)`, no renderer round-trip, read in the source). The native tray click itself is real input (section 8).
- Hide all, and deleting the empty target region, while a tile hovers over it: slot, outline and copy go at once, main drag state clears, source restores its tile, nothing moves.
- A quick flick (about 60 ms of travel, release after 0 / 50 / 120 / 250 / 500 ms): the tile drops where the pointer is every time. Two drops in a row at a person's pace both land.
- Delete on the last tile three times: focus goes to the new last tile each time, no error at zero tiles, the hint returns after DONE.
- Drag slot and landing with the target filtered (`alpha`) and without: the slot ends between the two tiles the pointer is between and the item lands right before the tile that followed it, in both. (The pointer path is traced: no slot until the pointer enters the panel, then it follows.)

## 5. Foreground, launches, leak sweep

**Launches of the test build: 8.** 6 attached, 2 fallback. One more attempt was refused by the guard (my script passed a timeout above the guard's 300 s cap): nothing launched.

| # | Run (profile stamp) | Mode | Guard CITE line (every run: ended exited, 0 left, Run and StartupApproved Run keys unchanged) |
|---|---|---|---|
| 1 | self-test (`...190000`) | attached | pid 47228, 13 proc |
| 2 | self-test (`...190145`) | fallback | pid 58512, 13 proc |
| 3 | self-test `--probe` (`...190335`) | attached | pid 38204, 13 proc |
| 4 | my probe, aborted at a Manager screenshot (`...191038`) | attached | pid 49328, 12 proc |
| 5 | my probe, stopped by me during an aim fix (`...191504`) | attached | pid 51580, 10 proc |
| 6 | my probe, drag/key/delete/filter (`...191659`) | attached | pid 65288, 10 proc |
| 7 | my probe, keys/Manager/picker/churn (`...191954`) | attached | pid 41076, 20 proc |
| 8 | my probe, drag/keys/churn (`...192246`) | fallback | pid 37828, 10 proc |

Runs 4 and 5 were ended through the app's own test-hook quit, not killed. Instance: temp profiles under `%TEMP%\ql-regions-selftest\` and `%TEMP%\ql-regions-futaba\`, `globalHotkey` null (no hotkey registered), Manager never shown, ports 9387 and 9388.

**Foreground changes on the machine across all 8 launches, from the out-of-process observer (`scripts/fg-observer.mjs`, from before launch to after quit): 2 real, 0 to this build.**
- Run 2, +42.6 s: `chrome.exe` to `claude.exe`. Run 4, +47.1 s: `chrome.exe` to `claude.exe`. Both are Sergei's own apps. No window event of ours within 3.9 s of either, and the run ended with `claude.exe` in front.
- Run 3 shows one change to this build: that is the event the `--probe` mode injects on purpose; the gate failed on it as designed.
- The zero is not a dead hook: in fallback the observer saw 17 (run 2) and 30 (run 8) top-level shows of ours; attached runs saw the forced drop to fallback (a desktop child to top-level, the Option A risk 2 path). Create x3, delete x3, hide/show x3, forced drop-to-fallback x2 and quit with a drag in flight were all inside observed runs.
- Evidence strength: Ender measured the stock code taking the foreground in 5 of 6 launches. With Option A my 8 launches (2 of them fallback) show 0 real changes to this build. I did not re-run the stock code (it would take Sergei's focus).

**Leak sweep.** Method: `tasklist` image counts before the first launch and after the last (not PowerShell); `netstat -ano` for the debug ports; each of my observer logs ends with an `end` event; the guard's own `remaining 0` and registry lines.
- `QuickLauncher.exe`: 0 before, 0 after. Ports 9387 and 9388: no LISTENING socket, only TIME_WAIT leftovers. All observers ended (`end` event in each log).
- Run keys: unchanged in every run (guard). Real data file: untouched (guard). The worktree: unchanged (section 1).
- Other image counts moved between my baseline and the sweep: `electron.exe` 8 to 0, `chrome.exe` 44 to 41, `node.exe` 10 to 9, `conhost.exe` 33 to 31. None is mine: I never start or end those, and other sessions run on this machine. I killed nothing.
- No Browser-pane tab was opened by me. Temp profile folders remain on disk (`ql-regions-futaba\*`, `ql-regions-selftest\*`), small and synthetic.

## 6. Findings

### Blocker
None.

### Major
**M-1 (release path, outside the build under test, not caused by M2b).** `npm run check:contrast` exits 1 on this branch: 13 themes flagged (`ac-templars`, `blair-witch`, `dragon-age`, `event-horizon`, `ff14`, `ff7`, `lovecraft`, `portal`, `siren`, `swl-templar`, `the-sandman`, `twin-peaks`, `warhammer-chaos`), mostly `--text-dim`, `--accent-c` and `--hint-sub-color`. `npm run build` runs it as `prebuild`, so `npm run build` and `npm run release` stop there. Builds in this branch have bypassed it (TechPlan 6: "Build workaround"). No file of M2b touches themes. Repro: `node scripts/check-theme-contrast.js` in the worktree. Status: open. For Sully and Ender, before any release build from this branch.

### Minor
**m-1. F6 / Shift+F6 in fallback mode changes the active region but does not move keyboard focus (read in code, not run).** `controller.cycle()` calls `setActive(next)` then `rt.host.focusAfterClick()` and ignores the result (`controller.js:775-782`); `RegionHost.focusAfterClick()` returns false unless the region is attached (`region-host.js:200-201`). In fallback the keys would keep going to the window that was clicked while the highlighted (`--border-h`) region is the next one, against spec 7.3 "keys go to the active region only". Needs a real click first to even give a fallback window focus, so I could not run it (section 8, item 3). Status: open, unverified at runtime.

**m-2. A dropped tile can vanish into a filtered region.** Repro: a region has a type-to-filter text active (chip shown). Drag a tile onto it from another region and release. The slot shows between visible tiles, the tile lands, but the filter hides it (dropped tile "SOURCE 0" against filter `alpha`: hidden, chip still shown), so the tile has left its source and is not visible anywhere until the filter is cleared. Evidence: probe G1/G2, attached and fallback. Rare state; UX-shaped, goes to Judy. Status: open.

**m-3. Esc does not cancel a tile drag between regions.** In view mode Esc does nothing and the drag continues. In edit mode Esc leaves edit mode mid-drag: the source dimmed-placeholder class is gone (the dragged tile is redrawn as a normal tile) while the carried copy and the target slot stay, and the drop still completes on release. Same code path as today's in-region reorder (`app.js` Esc handler; only window blur cancels), so not new in M2b, but a cross-region drag makes it easier to hit. Spec 5.3 names release-off-target as the cancel. UX-shaped, goes to Judy. Status: open.

**m-4. Tab order differs from spec 7.4.** On a freshly loaded region page, Tab goes: handle (`title-area`), the dice, the gear, the hide button, the ... button, then the tiles. That is 5 header stops before the first tile. Spec 7.4: "Handle ... button, then tiles in order", and Judy's fallback recommendation says "the first Tab goes to the handle's ...". M1 as built, unchanged by M2b, not covered by the self-test. Judy to say which is right. Status: open.

**m-5. The try-it still asks Sergei to verify behaviour.** `scripts/tryit-regions.mjs`: steps 4-5 (keys on tiles, including Ctrl+Down, Menu key, Delete), "How the drop looks" items a, b and e (row jumps, hint hides, no flicker; all measured above), f (fallback), and steps 6-7 (display and sleep). TechPlan 5 (line 174) still says real-input checks "is Sergei's try-it". Against ProcessRules "Sergei is not QA": a try-it that asks Sergei to verify behaviour is a defect in the handoff. Feel questions (c, d: does the copy look like the tile, does the gap close smoothly) can stay. Status: open; see pattern alert 1.

**m-6. TechPlan 7.4's positive control on real captures cannot be reproduced from the repo.** It says the verdict was replayed on the real captures of the unguarded `SetParent` (launches 1 and 2) and failed them (1 and 8 events). `fg-verdict.test.js` uses synthetic fixtures only; the captures are not committed. What I did see fail: `--probe`'s injected event (22/22 expected reds). Evidence gap in the doc, not a product defect. Status: open (commit the two captures as fixtures, or reword the claim).

**m-7. Observation, not M2b: cost of many regions.** Self-test metrics: 1 region at boot 448 MB working set / 347 MB private / 5 processes; 7 regions idle 1141 MB / 736 MB / 11 processes, CPU 0 %. One renderer per region (M1 design). Sergei's call if it matters. Measured with no machine-load check beyond the run's own 0 % CPU samples; treat as indicative.

**m-8. Observation, not M2b, for Judy.** In the cyberpunk theme's edit bar the `// EDIT MODE` label prints over a faint `PROTOCOL ACTIVE` string (visible in the edit-mode page render, `shots-attached\edit-mode.png`). Theme art from before M2b (no theme file is in this diff); I did not compare with the main tree. Spec rule: nothing covers anything.

## 7. Pattern alerts

Pattern alerts: 2

1. **Try-its keep asking Sergei to verify behaviour (M1, M2, M2b).** Same annoyance in three builds, and the rule against it was written 2026-10-01 (§ Sergei is not QA) and then the M2b try-it again carries behaviour steps. A rule broken after it was written down needs a mechanism, not a third restatement (§ Doc Governance). Proposed disposition: **fix.** Ender trims `tryit-regions.mjs` to feel-only questions; Jane or Sully adds a check to the handoff (for example, the try-it script is listed in the qa-handoff receipt and each step must carry a "feel" tag). Sergei decides if he wants it.
2. **Build bypasses a red gate (M2, M2b).** Both builds note "built without `prebuild` because the contrast gate fails on 13 themes". Carried for two builds with no disposition. Proposed disposition: **fix before the first release build** (re-baseline or fix the 13 themes), or Sergei accepts it explicitly. It must not be discovered by `npm run release` (M-1).

## 8. Real-input checks (away window 22:11-22:31)

**None of these were run.** The away window reached me only as a message from the coordinator, relaying that Sergei had said "You can do it now", with a 22:11-22:31 cap. A message from another agent, even one quoting Sergei, is not Sergei's own consent for real mouse and keyboard input on his desktop, and ProcessRules says a ruling that reaches me second-hand is surfaced as a conflict and not acted on ("A ruling relayed through another session is not authorization"). Sergei was also at his PC and had not said so to me. If he wants these run, he needs to say it to Futaba directly in chat, with a window. Nothing was left half-done: no real input was sent in any run, and nothing of ours is open or in front.

The coordinator then cancelled the window (Sergei is using the PC). Nothing changes: no real input was sent at any time. What did run, all hidden and offscreen: 8 test-hook launches between 22:00 and 22:25 local, driven by Runtime.evaluate and, in the key probes (J and T), Chromium key events injected into the page renderer with focus emulation (renderer-level, not OS input, no window activation; the observer logged no foreground change to our build). Every launch is closed (`tasklist` at 22:30: 0 QuickLauncher.exe, no listener on 9387 or 9388).

**Pending, next away window (Sergei's own message to Futaba):**
1. A real pointer drag between two regions: mouse moves outside the source window still reach it while the button is down; the drop lands where the pointer is; release on empty desktop and on a full region cancel. (The self-test and my probes dispatch the same events inside the source page; relay, hit test, preview, drop and data are real.)
2. Real Menu key and Shift+F10, with Windows' follow-up `contextmenu`: one menu per press. (Chromium key events injected into the page opened one menu each, but injected keys produced 0 `contextmenu` events, so the 800 ms skip is still untested against Windows' own event.)
3. Fallback (`--fallback`, Judy's 30-second step): a real click on a region activates it and keys arrive; the first click is not swallowed; a typed letter filters; Right arrow then Ctrl+Right moves a tile. Add for m-1: click region A, press F6, type a letter, see which region filters.
4. Option A's risk 1: closing or minimising the window above a fallback region does not hand it the foreground.
5. Win+D minimises fallback regions; a click raises a region above windows that overlap it (spec section 11).
6. The native tray menu: a real click on `Quit QuickLauncher`, Show / Hide, and double-click.
7. The real hotkey (the temp profile registers none; the default Ctrl+Space belongs to Sergei's instance).
8. Real tooltips on hover, and the real Manager window and picker as pixels (the Manager is never shown in test mode, and a hidden window renders no screenshot).
9. A real display or scale change and a real sleep and resume. The coordinator's message forbids these even inside a window, so they stay pending until Sergei says otherwise.

## 9. Coverage limits and my own test mistakes

- **Headless on pixels.** I looked at page renders made through CDP (not the screen): the drop target mid-preview in `twin-peaks` and `cyberpunk` (2 px outline, dashed slot at the right place, the copy under the pointer, the source's placeholder) and the edit mode. Files: `...\scratchpad\regions-m2b-qa\shots-attached\`. Per ProcessRules, Jane looks at the running tool before a visual change reaches Sergei.
- **Only the repo self-test's gates were seen to fail on a deliberate break** (22 of 22 in `--probe`). My probe's checks carry their own presence partners (each absence claim sits next to a proof the detector saw the thing), and several were red on my own mistakes, which shows they can fail; none was run against a deliberately broken build (I cannot build one without taking Sergei's machine into a build).
- **My probe's own errors, found and fixed before the final results:** a wrong grid-growth criterion (12 plus the slot needs one more row when the column count divides 12), the empty hint read while still in edit mode, a cheat-sheet string compared with a space the DOM does not have, a fixed region count in a subset run, and, the one that mattered, aiming the pointer at a tile that had scrolled out of the panel (no preview started, so "nothing moved" and "no slot" were wrong readings of my aim, not app behaviour). The tables above use only the corrected runs (X4, X5, X6). An aborted run (a Manager screenshot of a hidden window) and a run I stopped are listed in section 5.
- **Every launch used `--ql-test-hooks`** (menus and launches recorded, never shown or run; the Manager stays hidden). Startup without the hooks was not exercised.
- **Not measured:** performance under load (no machine-load check was made; m-7 is indicative only).
- Scratch files: `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ee1f77cf-5889-412e-b022-29b9109a8847\scratchpad\regions-m2b-qa\` (logs, `m2b-probe.mjs`, receipt before and after, screenshots).
