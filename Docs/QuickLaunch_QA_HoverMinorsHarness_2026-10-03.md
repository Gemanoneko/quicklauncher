# QuickLaunch QA: check:hover Minors (A-F1 to A-F3) and the lane-2 smoke harness, 2026-10-03

Futaba. Asked by Jane under ProcessRules § Sergei is not QA, before Sully commits. Read red-team: the job was to break the new ink mask, the new numbers and the new harness. Nothing in the tool repo or the studio repo was edited, staged, committed or pushed; this file is the only thing I wrote there, and it is left uncommitted. The regions worktree was not touched. Runs span 2026-10-03 evening to 2026-10-04 morning (JST) because a usage-limit stop fell in the middle; the file name keeps the date Jane gave.

## Verdict

**Verdict:** GO

GO for Sully to commit both: the tooling edit (`hover.cjs`, `run.mjs`, Brief rows 27/62/63) and the new harness `scripts/qa/quicklaunch-real-main-smoke.cjs`. Blockers: none. Majors: one (T-F1, the new mask has no positive control; answer to Ender's PC4 offer is **yes, the gate needs it**; it does not block this commit, but I would have Ender add it in the same commit if it is cheap). Minors: three (H-F1, H-F2, H-F3, all in the harness). A-F1, A-F2 and A-F3 are closed. Every number Ender reported reproduced except the two wall-clock figures, which are load-dependent and which I could not reproduce in absolute terms (section 3).

Pattern alerts: 1 (the 2026-10-02 lane-2 harness alert: fixed, verified, with a residual filed as H-F3; section 7).

## 1. Receipt (the pin)

| Item | Value |
|---|---|
| Tool / version | QuickLauncher **1.94.3** (package name `quicklauncher`; tool folder `WIP/QuickLaunch`) |
| Branch / HEAD | `wip/theme-fidelity` / **`b9e6776`** (`b9e6776cd266dd2fb862d468e331a748367b328f`) |
| Dirty set (tool repo) | exactly 3 tracked files: `Docs/QuickLaunch_Brief.md`, `scripts/theme-gallery/hover.cjs`, `scripts/theme-gallery/run.mjs`. Same at start, mid-pass and end. `src/` untouched |
| Studio root | the new untracked harness (plus a modified recap and an untracked, unwired `.claude/hooks/recursive-delete-guard.mjs`, neither part of this QA) |
| Entry-check script (run from the tool root) | `Entry-check receipt: quicklauncher v1.94.3 @ b9e6776 (dirty: Y) — pre-qa n/a, post-build n/a, check-electron n/a, check pass, test:smoke n/a` |

SHA-256 of the pin, taken first from the live files into `scratchpad\futaba-hover2\pin\`; **re-taken after the usage-limit stop and again at the end: identical all three times**, and the end check compared live against pin file by file:

```
74c802e8cb8d082f9174bba9671337852d5e5e923394f7f17365b86431ef06f1  scripts/theme-gallery/hover.cjs
1d2e1a4210de1f757bd7ff7eeffde090ace9b9ab1af9ac26be25fc0136bd01f2  scripts/theme-gallery/run.mjs
3d1054d625831515bc6399f2c21f337b2010fbf2d411f2f636bb1c5f626a8f38  Docs/QuickLaunch_Brief.md
e370d45800f21b3e33618c7899c14da5503338440edeee9f688056c0b0c131b0  scripts/qa/quicklaunch-real-main-smoke.cjs   (studio root)
```

**What I tested.** Pinned copies only, in three scratch clones of the tool repo (`git clone --no-hardlinks`, detached at `b9e6776`): `head` (unmodified: the old tooling), `build` (HEAD plus the three pinned files, hashes byte-verified), `mut` (same as `build`, used only for mutation experiments and restored and re-hashed after each). The harness ran from its pinned copy against `snap-head`, a `git archive b9e6776` extraction (212 files, no `node_modules`, `icon.png` present). The only live-tree runs were the entry-check script (it runs `npm run check` in the live tree, which equals the pin by hash) and reads. I did not run `npm run build` or `npm run release`.

**`node_modules`: a call for Jane.** `run.mjs` reads `node_modules/electron/package.json` from its own repo root, so a bare clone cannot run the gate. The brief offered two options (the new harness's resolution approach, which applies only to the harness, or stop and ask Jane). I took a third that keeps the purpose of the rule: a **real byte copy** (not a junction, not a symlink) of just `node_modules/electron` (266 MB) into each of the three clones. `electron.exe` is byte-identical to the real one (`217c7abc77aa…`). My link walker, which treats junctions as links, reported **0 links** over 3,314 entries at the start and over 9,447 at the end. If Jane would have preferred a stop, say so; nothing depends on it.

Machine load was not as quiet as last pass: 9 to 22 % machine-wide (32 logical cores) sampled before each timed run, because other work was going on. That is why timings are given with ranges (section 3). Sergei's QuickLauncher was **not** running at the start of the pass and **was** running (4 processes) from the next morning; that gave a live collision test (section 5.4).

## 2. A-F1: the ink mask (does the fix work, does it break anything)

### 2.1 All 4,040 readings, old against new

Method: `cmpruns.cjs` joins two `hover-readings.json` files on theme and pair (101 themes x 40 = 4,040), and compares `ratio` (full precision, not the rounded value), `fill`, `src`, `ink` reason, `fail`, `label`, `flat2`, `error`, `grad.fill` and `grad.ratio`.

| Comparison | Result |
|---|---|
| HEAD tooling against pinned build, three interleaved pairs | **4,040 of 4,040 identical on every field, in all three pairs**. Differences: 0 in each field |
| Pinned build run 1 / 2 / 3 against each other; HEAD run 1 against 3 | 0 differences (both versions are deterministic across repeats) |
| `--ink-free-all`, HEAD against build | 4,040 of 4,040 identical, 0 differences |
| Normal run against `--ink-free-all`, build | **0 verdict differences**; 679 of the 3,462 readings the trigger skipped read lower under `--ink-free-all`; none higher; largest drop **3.02 %** (indiana-jones `edit-add-file/hover`, 17.49 to 16.96). HEAD gives the same 679 and the same 3.02 % |
| Pinned build under 8 busy loops (below-normal priority, 34.6 % machine-wide) | exit 0, 0 errors, **4,040 of 4,040 identical to the quiet run**; the new "coverage colour did not paint" guard did not misfire under load |
| Positive controls | PC1 1.65:1, PC2 2.32:1 unchanged; **PC3 1.14 to 1.08:1** (fill `#F0F0F0` to `#F6F6F6`; the hard white end of the ramp is now judged), still fires from the `grad` candidate in all runs |
| Where the mask touches the real roster | 33 readings in 18 themes get extra ink pixels from the coverage capture in a normal run (1 to 25 px, most under 10, of 300 to 1,100 judged), 135 readings under `--ink-free-all`; none moves a ratio |
| Counts | `581 of 4043` readings take the extra captures in **6 of 6** runs (image layer 119, clipped ring 0, near the floor 60, ring over 2 % worse 402: sums to 581; 581 / 4,043 = 14.4 %). Capture requests per run rose from about 9,265 to about 10,430 (+12.5 %) |

### 2.2 The A-F1 repro, and what else the mask changes

My original `variants.cjs` was lost in the scratchpad wipe, so I **rebuilt 46 cases** from the table in my 2026-10-02 report (same target: the white `+ FILE` label on `#btn-add-edit:hover`, text box x 299 to 341, y 694 to 713, `--only cyberpunk`), and calibrated them until the old tooling reproduced my old numbers exactly (ramp to `#808080` 3.95:1; to `#777777` 4.48:1, just under; to `#767676` 4.54:1, just over; split to `#ccc` 1.61; hard patch `#f0f0f0` 1.14; 6 px ramp to white 1.23). Each case ran through the real gate on HEAD tooling and on the pinned build.

**34 of 46 are identical, old against new, to the last digit** (verdict and ratio). **12 differ, and all 12 are cases where the label colour equals a fill under some of the glyphs**:

| Case | Old tooling | Pinned build |
|---|---|---|
| M01 the A-F1 repro: hard patch exactly `#fff`, right 44 % of the text box | PASS 21 | **FAIL 1.00** |
| M02 same, 1 px ramp | PASS 21 | **FAIL 1.00** |
| M03 hard patch exactly `#fff`, left 44 % | PASS 21 | FAIL 1.00 |
| M05 `#f00` label on exactly `#f00` | PASS 5.25 | FAIL 1.00 |
| M06 `#808080` label on exactly `#808080` | PASS 5.32 | FAIL 1.00 |
| M07 black label on exactly `#000` | PASS 21 | FAIL 1.00 |
| X02 8 px strip exactly `#fff` in the middle | PASS 21 | FAIL 1.00 |
| C04 **ancestor** white stripe, 15 px, exactly `#fff` | PASS 21 | FAIL 1.00 |
| C05 **ancestor** white stripe, 4 px | PASS 21 | FAIL 1.00 |
| C07 **ancestor** white horizontal band, 6 px, across the label | PASS 21 | FAIL 1.00 |
| F15, X01 (already failing) | FAIL 1.23 / 1.15 | FAIL 1.00 |

Under `--ink-free-all` the same repros fail (M01, M02, M03, M05, M07: 1:1), so Ender's "including under `--ink-free-all`" holds. The audit mode on HEAD was also blind to an exact-white ancestor blob inside the range rect (C06: PASS 19.44); it now fails it at 1.00.

**My judgement on the flips: they are the fix working, not a regression.** Ender counts two ancestor white-stripe cases; I get three (a 15 px stripe, a 4 px stripe, and a horizontal band). In each, a white label sits on a patch of exactly white and part of every glyph is physically invisible; the old gate passed them at 21:1 only because the glyph vanishes from the pixel difference it used as its mask. They were "characterization" cases in my last report for that reason. No flip is a false positive.

Cases that must still pass, and do (same in both): benign grain (P04), 1-in-3 scanlines (P05), underline (P06), dashed low-contrast underline (P07), 2 px `#ccc` border (P08), flat fill (P09), **exact-`#fff` 2 px border-bottom (P10), exact-`#fff` dashed 1 px underline just under the glyphs (P11), exact-`#fff` 3 px dot at the far edge (P12)**, and a 4 px exact-`#fff` strip beyond the ink (M04, no glyph pixel on it). Documented gap, unchanged: an ancestor-painted blob wholly inside the range rect (C01 `#f0f0f0`, C06 `#fff`) passes a normal run (21:1) and fails `--ink-free-all`. A `background-clip:text` label (X04) is VOID (exit 2) on **both** old and new: the gate fails closed.

### 2.3 A-F2 and A-F3

| Figure in the Brief, comments, usage text | Measured |
|---|---|
| 581 of 4,043 readings, 14.4 % | exact, 6 of 6 runs |
| 201 read from a gradient, 169 more are flat fills (370 total) | exact: the summary line reads `201 read from a gradient's worst point (more than 2 % below the flat fill; 169 more within 2 % of it are flat fills)` |
| 0 of 4,040 verdicts differ under `--ink-free-all`; skipped readings at most 3.0 % lower; 679 of 3,462 | exact (section 2.1) |
| Row 63: a 3x3 median lowers 574 readings against the shipped 7x7, by up to 5.2, one false failure in `uncharted` | **exact**: 574 lowered (2 higher), largest drop 5.23 ratio points (twin-peaks `edit-add-file/hover` 17.44 to 12.21), one failure: `uncharted` `tile-label-rename/hover` 4.59 to 4.38 |
| Row 63: a 3x3 sRGB mean gives 36 false failures in 35 themes | **exact**: 36 in 35 themes (705 lowered, largest 7.34 points: tron `tile-label-rename/hover` 11.88 to 4.54). I patched the window to 3x3 and the mean into `hover.cjs` in the scratch clone and ran the whole roster; the shipped 7x7 gives 0 |
| PC3 reads 1.08 | exact |
| Row 27 "see the Decision Log" | the section exists (`## Decision Log`); the three edited rows sit in intact tables (column counts checked) |
| Stale figures elsewhere ("about 12 %", "44 s instead", "about 80 s", "up to 2 % lower", "370 read from") | none left in the tool or in studio `Team/`, `.claude/`, `scripts/` (the HoverFix57 spec does not carry them) |

## 3. Timings (the two figures I could not reproduce)

Gate's own timer, same machine, interleaved, load sampled before each run:

| | Run 1 | Run 2 | Run 3 | Median |
|---|---|---|---|---|
| HEAD tooling | 64.5 s (10.5 %) | 55.3 s (9.7 %) | 50.7 s (19.1 %) | 55.3 s |
| Pinned build | 69.2 s (9.4 %) | 51.1 s (22.1 %) | 51.2 s (9.1 %) | 51.2 s |
| `--ink-free-all` | HEAD 79.3 s (17.0 %) | build **108.3 s** (16.5 %) | | |
| Build with 8 busy loops | 48.7 s (34.6 %) | | | |

The Brief says 52 s against 45 s (normal) and 122 s against 81 s (`--ink-free-all`). On my machine the normal gate is not measurably slower (medians 51.2 against 55.3 s; run-to-run spread of 14 to 18 s is larger than any difference), while the work it does is +12.5 % capture requests, and `--ink-free-all` went from 79.3 to 108.3 s (+37 %, Ender: +51 %). The Brief states its conditions (date, "the gate's own timer", "an emulator holding about 1.3 cores"), so I do not file it as wrong; I note that the absolute figures are machine-state figures. Headroom against the 180 s hard limit: 3x for a normal run, 1.7x for `--ink-free-all` on a mildly loaded machine.

## 4. Ender's PC4 offer: the gate needs it (T-F1)

Question: if the new mask silently stopped working, would anything go red? I broke it three ways in the scratch clone and ran the **whole roster** each time (as `npm run check:hover` does):

| Mutation of `hover.cjs` | A-F1 repro M01 | Full gate | Existing controls |
|---|---|---|---|
| none | FAIL 1.00 | exit 0, 0 errors | PC1, PC2, PC3 fire |
| **A**: the judge ignores the coverage capture (`else if (differs(free, cov, i))` made `false`) | **PASS 21 (hole reopened)** | **exit 0, 0 errors, nothing red** | all fire (PC3 back to 1.14) |
| **C**: the coverage colour is the label's own corner (`.sort(...)[0]` replaced by `nearest`) | **PASS 21 (hole reopened)** | **exit 0, 0 errors, nothing red** | all fire |
| **B**: the coverage style never paints | n/a | exit 2, VOID on all 101 themes: "the coverage colour did not paint" | caught by the runtime guard, not by a control |

So two of three plausible breakages reopen A-F1 with a fully green gate, which is exactly "a check never seen to fail isn't a gate" (§ Verification Discipline). A prototype PC4 (a hard patch of exactly the label colour under a white label, found by the ring trigger; `linear-gradient(90deg,#000 0,#000 55%,#fff 55%,#fff 100%)` on `#btn-add-edit:hover`, `needSrc: 'grad'`, `noPaintTrigger: true`, `under: 2`, copied from PC3's job) **fires on the pinned build (1.00:1) and does not fire under A or C (21:1)**. Two details Ender needs:

1. **It must be enforced in `run.mjs`, not only defined in `hover.cjs`.** `run.mjs` voids a run only for the hard-coded list `['PC1','PC2','PC3']` (line 483). With PC4 added in `hover.cjs` alone, mutations A and C print `control PC4 DID NOT FIRE` and **still exit 0**. With line 483 extended, A and C give `RUN VOID (harness failure, exit 2)` naming PC4.
2. The `--neuter-control` allow-list (line 119, `pc1, pc2, pc3`) must gain `pc4` (the prototype's neutered fixture, a `#333333` patch, voids the run as it should), and the Brief row 27 text ("three built-in positive controls") and the `run.mjs` usage line change with it.

Prototype in full, so it survives a scratchpad wipe (hover.cjs, inserted before `function makeWindow()`):

```js
if (hc.controls !== false) {
  const hardEnd = neuter.has('pc4') ? '#333333' : '#FFFFFF';
  const hard = `linear-gradient(90deg, #000000 0%, #000000 55%, ${hardEnd} 55%, ${hardEnd} 100%)`;
  pcJobs.push({ kind: 'pc', id: 'PC4', theme: 'cyberpunk', pair: 'edit-add-file/hover', under: 2, needSrc: 'grad', noPaintTrigger: true, neutered: neuter.has('pc4'),
    what: `fixture hover fill ${hard} (a hard patch exactly the label colour) under a white label`,
    fixture: `/* check:hover PC4 fixture */\n#btn-add-edit:hover { background: ${hard} !important; color: #FFFFFF !important; }\n` });
}
```

Severity: **Major** under the studio's own verification rule, **not** a blocker for this commit: today the mask works (section 2), the cases fail and pass as they should, and I saw it fail on the reproduction. I did not write PC4 into the repo.

## 5. The harness `scripts/qa/quicklaunch-real-main-smoke.cjs`

Pinned copy run from the scratchpad with `--tool` pointing at the real tool (its default `--tool` is computed from the harness's own location, so a copy outside `scripts/qa/` must be told).

### 5.1 It works where the old copy died

| Check | Result |
|---|---|
| The old failure, reproduced by mutation (my old copy is gone): the pinned harness with its resolver redirect disabled, on the bare `git archive` snapshot | **exit 3, no window created**: `the app's main threw while loading: Cannot find module 'electron-updater'` |
| The pinned harness, unchanged, same snapshot, all 9 screens (rest, settings, edit, cheat, picker, filter, skin, parked, flow) | **9 of 9 launches exit 0 via the tray's real Quit**, 96 to 173 ms from Quit to exit, `show(blocked) 1` per launch (the app's own `win.show()`), focus 0, left 0, `from tool: electron-updater` |
| Each screen really reached its state (read from `summary.json`) | rest; settings open; edit bar shown; cheat-sheet; installed-apps picker; filter chip; skin list open with `star wars` typed; parked after a real Enter pick (store and file say `star-wars-sith`); flow: skin changed to `star-wars-mando`, **store and saved file agree**, tile rename saved. `--pick=click --query=mord --theme=2001`: seeded 2001, store and file both say `mordor`, 2 of 2 |
| Census positive control | the first launch's processes seen while it is up: **4**; after the run: 0 left; run ends `CITE: … PASS` |
| Registry | HKCU Run and StartupApproved\Run unchanged in every run |

### 5.2 The controls

| Control | Result |
|---|---|
| `--control-no-quit` (2 screens) | exit **7** per launch, 5.1 s after Quit, run reported as the control PASS |
| Guards (scenario files calling the forbidden thing): `win.focus()`, `app.focus()`, `setLoginItemSettings`, `globalShortcut.register`, `dialog.showMessageBoxSync`, `shell.openExternal`, `window.open`, main-process `net.fetch` to the internet | each is **counted and the run fails (exit 1)** naming the guard; the stubs return harmlessly (`isFocused` false, `register` false and `isRegistered` false, dialog returned 0, fetch `ERR_BLOCKED_BY_CLIENT`). `win.show()` is counted only, by design |
| A page `fetch` to the internet | stopped by the page's own CSP first, so the harness's request hook was not the layer that fired; the main-process fetch above exercises the hook (`guard blockedRequests = 1`) |
| A scenario that throws; a renderer console error | both fail the run with the message |
| A scenario that hangs, `--timeout=10` | watchdog fires: exit 4 after 15 s, `watchdog: 10 s`, 0 left |
| Refusals (all exit 2, nothing created): unknown screen; timeout 5 and 301; bad `--pick`; root without `src/main/index.js`; no screens; missing scenario; root without `icon.png`; `--out` inside the real `%APPDATA%\QuickLauncher`, inside root or tool `src/`, `node_modules/`, `.git/`; tool without Electron | all refused with a specific message |

### 5.3 Against Sergei's running QuickLauncher

With Sergei's four `QuickLauncher.exe` processes up (PIDs 23324 30760 31752 41564), the harness ran 3 launches: each took its **own** single-instance lock in its throwaway profile (`lockAcquired` true x3), 0 global-shortcut calls (stubbed), 0 focus, and the PID set was **identical before and after**. No collision with his instance or his hotkey. I never opened `%APPDATA%\QuickLauncher`.

### 5.4 Findings in the harness

**H-F1 [Minor]: the leftover census can end processes the harness did not spawn.** It treats any `electron.exe` whose lower-cased command line merely *contains* the lower-cased `--out` path as its own, and ends it by PID. Repro with a harmless idle Electron of mine (PID 54440) in a sibling folder `...\ql-runB\app` and the harness run with `--out=...\ql-run`: the harness listed my process as left over, **ended it**, and returned exit 4, while its own launch was clean (0 own leftovers). The same happens for a parent folder as `--out`. The default `--out` (`%TEMP%\ql-real-main-smoke\<timestamp>`) is unique, so only an explicit, prefix-colliding `--out` (for example two QA lanes with `run1` and `run10`) is exposed, and only `electron.exe` is matched (never `QuickLauncher.exe`). It contradicts the header's own claim ("only the Electron it spawned is ended"). Direction: match on this launch's own `--qlrm-config=<path>` with a path boundary, or on the PIDs the app reports plus their children.

**H-F2 [Minor]: the harness does not isolate `%TEMP%`.** The real main process compiles its icon helper at every start (the fresh profile has no cached DLL): it writes `%TEMP%\QLIconHelper.cs` (5,389 bytes), runs `csc.exe`, then deletes the file. A watcher polling the shared temp folder from before the launch saw the file for about 240 ms (76 polls), the same fixed name Sergei's installed app uses. Rarely harmful (his profile has the DLL cached), but it is a write outside the throwaway folder. **Direction, proven:** a one-line change in a scratch copy of the harness (`env.TEMP = env.TMP = <run dir>\tmp` for the spawned Electron) gave 0 sightings in the shared folder, and the DLL still compiled in the throwaway profile. The pre-existing lane-2 approach has always done this; it is not new in this copy.

**H-F3 [Minor]: nothing tells the next cold-start Futaba the harness exists.** `quicklaunch-real-main-smoke.cjs` is named only in `Team/Docs/Session_2026-10-03_Recap.md`. It is not in `.claude/agents/futaba-qa.md`, `Team/Docs/DelegationPrimer.md`, ProcessRules, or the Brief's Commands table, and the session-start rule loads only the latest recap. The pattern it was built to end ("rebuilt by hand every pass") can come back by not knowing the file is there. Direction: one pointer line in Futaba's definition or the Commands table.

Notes, not findings: **N1** `--help` ends with a stray blank line. **N2** when the watchdog fires, the run also reports "Quit QuickLauncher not found in the tray menu", which is a consequence, not a second cause. **N3** every run leaves its profile under the `--out` folder (about 2.6 MB per launch; the default is under `%TEMP%`) and nothing cleans old ones. **N4** a copy of the harness outside `scripts/qa/` refuses with four messages about a missing root when `--tool` is simply not passed; the first message is misleading, the refusal is correct. **N5** `run.mjs` line 503 labels any `src: 'grad'` failure "(gradient, worst point; …)" even when it is within the 2 % band the summary line now calls a flat fill; I could not build a failing reading in that band in two tries (the flat candidates catch each one first), so it is theoretical. **N6** a hard white feature narrower than half the 7x7 window (for example a 3 px stripe) is ignored by design; the Brief states the rule.

## 6. Findings

| # | Build | Severity | Finding | Status |
|---|---|---|---|---|
| A-F1 | tooling | (was Minor) | exact-label-colour fill never judged | **closed**: fixed (section 2); 0 roster readings change; 12 of 46 synthetic cases change, all true positives |
| A-F2 | tooling | (was Minor) | figures did not match | **closed**: every count reproduces (section 2.3); the two wall-clock figures are load-stamped (section 3) |
| A-F3 | tooling | (was Minor) | "370 read from a gradient" | **closed**: 201 plus 169 |
| T-F1 | tooling | **Major** | the new mask has no positive control: mutations A and C reopen A-F1 with a fully green gate. A PC4 works, but must also be enforced in `run.mjs` line 483 (and the allow-list at 119) or it is only printed | open; Ender's PC4 offer should be taken; not a blocker for this commit |
| H-F1 | harness | Minor | census substring match ends processes it did not spawn (repro, PID 54440) | open |
| H-F2 | harness | Minor | shared `%TEMP%\QLIconHelper.cs` written and deleted at every launch; `TEMP`/`TMP` redirect proven | open |
| H-F3 | harness | Minor | harness not referenced anywhere a cold start reads | open |

## 7. Pattern alerts

Pattern alerts: 1

1. **The lane-2 smoke harness dies at startup when its snapshot has no `electron-updater` (my 2026-10-02 alert).** Disposition: **fix, verified**. One maintained copy now lives under `scripts/qa/`; on a bare `git archive` snapshot it opens a window and passes 9 of 9 screens; the old failure (exit 3, no window, `Cannot find module 'electron-updater'`) reproduces exactly when I disable its resolver redirect, so the redirect is what cures it. **Residual:** H-F3, discoverability. I add no new pattern alert: the "control that prints but is not enforced" trap in T-F1 is a first occurrence, in a prototype, not in the repo.

## 8. Not tested, and my own probe faults

Not tested: real OS input (not an away window); the packaged build; Sergei's real hotkey; the harness on the live tree as `--root`; my original 35 `variants.cjs` cases (the file was wiped, so section 2.2 is a rebuilt set and the "35 keep their verdicts except two" claim is checked against that set, where the count is 34 of 46 and three ancestor flips); the old harness copy itself (reproduced by mutation instead).

Probe faults found and removed before any number here was used: (1) my first reconstructed ramps spanned the whole button and read 5.57 and 6.29:1; recalibrated against the label's own pixels until they matched my old report. (2) A regex patch corrupted my first v2 variant file (F01 held F08's rule); I regenerated it line by line and verified every changed line. (3) My first shared-temp probe ran after the app's startup compile had finished; redone with a watcher started before the launch. (4) My `RUN4` mutation silently did nothing the first time (an unknown mode printed "applied"); I caught it from the logs, made the script fail loudly on an unknown mode, and re-ran the four affected configurations. (5) The first mutation sequence did complete (all 7 configurations, restore hash equal to the pin); I re-ran it as asked and the two runs agree on every configuration.

## 9. Machine safety, leaks and cleanup

- **Sergei's QuickLauncher:** never touched; his PIDs identical at the start of the live test and at the end of the pass. `%APPDATA%\QuickLauncher` never opened or listed. Every Electron launch used its own throwaway profile; no packaged exe of the app was launched.
- **Counts, by method:** about **317** `hover-readings.json` files written under my scratch folder (full-roster runs: 6 timing, 2 `--ink-free-all`, 1 stressed, and 24 mutation runs, namely 7 in the first sequence, 11 in its replicate, 4 in the RUN4 re-run and 2 for the 3x3 window; the rest are single-theme `--only cyberpunk` runs: four variant passes, `--ink-free-all` subsets, pilots and mutation probes). **22** harness runs, **34** launches, plus 15 refusal cases. Each gate run reports `36 started, 0 left`. Guard counters in every gate run: login item 0, global shortcut 0, show 0, focus 0, dialogs 0, blocked requests 0.
- **Headless browsers:** none used (`headless-browser.mjs list`: no leases at the start, middle and end).
- **Processes I started:** gate Electron processes (each run ends them), harness launches (each ends them), my one dummy Electron (ended by the harness itself, section 5.4), 8 busy loops (ended through their own handles). End census: `electron.exe` and `msedge.exe` 0; processes whose command line names my scratch folder 0 (the other `node.exe` processes I listed at the start were an OpenAI Codex runtime and a Playwright driver, not mine). I killed nothing by image name and nothing of anyone else's.
- **Repo state:** `git status --porcelain` in the tool repo shows the same 3 files as the pin, HEAD still `b9e6776`; this report is the one new untracked file. No commit, no stage, no push. The regions worktree was not touched.
- **Blocked once:** one shell command containing `rm -rf` of my own scratch folder was refused by the permission layer; I did not retry it or work around it, and deleted nothing.

## 10. Scratch (copy what you need; it has been wiped before)

`C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ab778959-0638-4d60-8887-346c422e496e\scratchpad\futaba-hover2\`: `pin\` (the four pinned files) and `pin-sha256.txt`; clones `head\`, `build\`, `mut\`, and `snap-head\`; `variants2.cjs` / `variants3.cjs` (46 rebuilt cases, with `tabvar.cjs` to tabulate); `cmpruns.cjs` (reading-by-reading comparison); `mutate.cjs`, `mutate2.cjs`, `mutate4.cjs` and `mutruns*.sh` (the mutations, the 3x3 median and mean, RUN4); `an3.cjs`; `stress.cjs`; `sc\*.cjs` (the guard scenarios); `tempwatcher.cjs`, `harness-temp.cjs` (H-F2 proof), `harness-noresolve.cjs` (the old failure); `spawn-dummy.cjs` and `dummy\` (H-F1 repro); `out\`, `var*`, `mutout-*`, `m3out-*`, `m4out-*`, `mut2out-*`, `hout\` (every run's output); `logs\` and `logs-run1\` (the console output of every run, including the first mutation sequence).

Key repro CSS, appended to `cyberpunk.css` in the scratch clone, then `node scripts/theme-gallery/run.mjs --hover-check --only cyberpunk`: M01 (A-F1) `html body #edit-bar #btn-add-edit:hover { color: #fff !important; background: linear-gradient(90deg,#000 0,#000 322px,#fff 322px) !important; background-attachment: fixed !important; }`; C04 (ancestor stripe) `html body #edit-bar #btn-add-edit:hover { color: #fff !important; background: transparent !important; }` and `html body #edit-bar { background: linear-gradient(90deg,#000 0,#000 310px,#fff 310px,#fff 325px,#000 325px) !important; background-attachment: fixed !important; }`.
