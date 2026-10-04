# QuickLaunch QA: PC4 positive control (T-F1) and harness fixes (H-F1 to H-F3), 2026-10-04

Futaba. Regression pass asked by Jane under ProcessRules § Sergei is not QA, before Sully commits. Read red-team: the job was to break the new control, the one-list enforcement, the PID-and-creation-time census, the per-launch temp folder, and to judge Ender's one open note. Nothing in the tool repo or the studio repo was edited, staged, committed or pushed; this file is the only thing I wrote there, uncommitted. The regions worktree (`C:/Antigravity Projects/QuickLaunch-regions-spike`) was not touched. Runs span 13:05 to 13:40 JST.

## Verdict

**Verdict:** GO

GO for Sully to commit the five files: in the tool repo `scripts/theme-gallery/hover.cjs`, `scripts/theme-gallery/run.mjs`, `Docs/QuickLaunch_Brief.md`; in the studio repo `scripts/qa/quicklaunch-real-main-smoke.cjs` and `.claude/agents/futaba-qa.md`. Blockers: none. Majors: none. Minors: two new (F-1, H-F4; neither blocks). **T-F1, H-F1, H-F2 and H-F3 are closed**; every claim in Ender's list reproduced. His shared-temp note is judged below (section 5): it was a parallel lane, and I saw that lane do it three times in seven minutes while the pinned harness did it zero times.

Pattern alerts: 1 open (section 8), 1 earlier alert closed.

## 1. Receipt (the pin)

| Item | Value |
|---|---|
| Tool / version | QuickLauncher **1.94.3** (package name `quicklauncher`; folder `WIP/QuickLaunch`) |
| Branch / HEAD | `wip/theme-fidelity` / **`d0a3037`** (`d0a303797d1fa7c01f570314b79b1cffb2873e42`); unchanged at the end |
| Dirty set, tool repo | exactly 3 tracked files (the three below) plus an untracked `Docs/QuickLaunch_QA_AwayWindow_2026-10-04.md` that is not mine and not part of this pass. `src/` untouched |
| Dirty set, studio root | `scripts/qa/quicklaunch-real-main-smoke.cjs`, `.claude/agents/futaba-qa.md`, plus a modified recap and an untracked, unwired `.claude/hooks/recursive-delete-guard.mjs` (neither part of this QA) |
| Entry-check receipt (run from the pinned clone `build`) | `Entry-check receipt: quicklauncher v1.94.3 @ d0a3037 (dirty: Y) — pre-qa n/a, post-build n/a, check-electron n/a, check pass, test:smoke n/a` |

SHA-256 of the pin, taken first from the live files into `scratchpad/futaba-pc4/pin/` (kept as `pin-sha256.txt`):

```
d4b90de9f9d9730ff37cfc82c1280df1dcc6d10b5f3126d0c7f1b9ae19fb5fc3  studio/scripts/qa/quicklaunch-real-main-smoke.cjs
71fff622558b40a1d645f556f118048e271c86e9b7ad6c4c7b53a3d0171f3556  studio/.claude/agents/futaba-qa.md
30b93d1baa6a9ae929c17af9ca6cb6f35eda8ecd3c2edd876721641e0055689d  tool/Docs/QuickLaunch_Brief.md
9892c3e271e467843b4cc3cae0b403d14a0892b233cf0d93c97b6f8faab0518f  tool/scripts/theme-gallery/hover.cjs
d924764594b6e91e51924cd3aebe5d85606b75368279d5300d9beaae16528d59  tool/scripts/theme-gallery/run.mjs
```

**End check: all 5 live files hash-identical to the pin** (compared file by file at 13:40; `sha256sum -c` against the pin file also 5 of 5 OK). Tool repo HEAD still `d0a3037`, same dirty set as at the start.

**What I tested.** Pinned copies only: three scratch clones of the tool repo (`git clone --no-hardlinks`, detached at `d0a3037`): `head` (unmodified: the old tooling, as the comparison), `build` (HEAD plus the three pinned tool files, hashes byte-verified), `mut` (same as `build`, used only for mutations, restored from the pin and re-hashed after every one; end state hash-equal to the pin). The harness ran from its pinned copy against `snap`, a `git archive d0a3037` extraction (213 entries, no `node_modules`, `icon.png` present). The one live-tree read of the tool was its `node_modules` (`--tool`), for `electron-updater`, which a bare archive does not have. I did not run `npm run build` or `npm run release`.

**`node_modules`.** `run.mjs` reads `node_modules/electron` from its own repo root, so I put a real byte copy (not a junction, not a symlink) of just `node_modules/electron` into `head`, `build` and `mut`; `electron.exe` is byte-identical to the real one (`217c7abc77aa...`). My link walker (junctions counted as links) found **0 links** in `head` (1,935 entries), `build` (2,006), `mut` (1,941), `snap` (213), every harness output folder (1,518) and my other output folders (38 and 155).

## 2. Ender's claims, one by one

| Claim | Result | How |
|---|---|---|
| PC4 fires on the pinned build | **yes**, 1:1 from the `grad` candidate ("without it 21:1"), exit 0, 0 errors | full gate, 3 runs |
| Mutations A and C make PC4 DID NOT FIRE and void the run (exit 2) | **yes, both** | section 3 |
| `--neuter-control=pc4` gives exit 2; `pc5` is refused | **yes**: pc4 on the full roster exit 2 naming PC4; `pc5` exit 2 with `unknown control pc5 (pc1, pc2, pc3, pc4)` (that list is built from `HOVER_CONTROLS`) | section 3 |
| 4,040 readings identical apart from `grabs` | **yes**: 4,040 of 4,040, in all three comparisons; the 4 control readings are the only addition | section 2.1 |
| `npm run check` passes | **yes**: exit 0 in the pinned clone, and the entry-check script reports `check pass` | 44.8 s wall, the gate's own timer 42.6 s |
| The harness spares sibling dummies and catches an orphan child | **yes, with one gap (H-F4)** | section 4 |
| `QLIconHelper.cs` lands in the per-launch tmp folder; 9 of 9 screens; no-quit exits 7 | **yes, all three** | sections 4 and 5 |
| One shared-temp sighting was a parallel lane | **plausible, and now observed** | section 5 |

### 2.1 The 4,040 readings

Method: `deepcmp.cjs` joins two `hover-readings.json` files on theme and pair (101 x 40) and compares every key, flattened and at full precision, not only the verdict fields.

| Comparison | Pairs | Identical on every key | Identical apart from `grabs` | Other differences |
|---|---|---|---|---|
| `head` run against `build` run 1 | 4,040 | 3,990 | **4,040** | none; `grabs` differs in 50 |
| `head` run against `build` run 2 | 4,040 | 3,994 | **4,040** | none; `grabs` differs in 46 |
| `build` run 1 against `build` run 2 | 4,040 | 3,988 | **4,040** | none; `grabs` differs in 52 |

`grabs` is the settle-capture count and is timing-dependent (it differs between two runs of the same build too), so it carries no verdict. PC1 1.65, PC2 2.32, PC3 1.08 are unchanged; PC4 reads 1.00. Normal run against `--ink-free-all` on the build: **0 verdict differences**, 679 of 4,040 readings lower under `--ink-free-all`, none higher, largest drop 3.02 % (indiana-jones `edit-add-file/hover`, 17.49 to 16.96): the same figures as the Brief states.

The Brief's new figures match the gate's own summary line: `582 of 4044 readings ... (image layer 119, clipped ring 0, near the floor 60, ring over 2 % worse 403)`; 119 + 0 + 60 + 403 = 582, 582 / 4,044 = 14.4 %; `201 read from a gradient's worst point ... 169 more within 2 % ... are flat fills` unchanged. The old line read 581 of 4043 with 402. Row 27 says "four built-in positive controls" and lists them in the order the gate prints them. Both edited rows sit in intact tables (column counts checked over all 23 table rows: 0 mismatches). No stale "three controls" or `pc1, pc2, pc3` text is left in the tool, `Team/`, `.claude/` or studio `scripts/` (searched); one drift is noted below (N5).

## 3. T-F1: the control and where it is enforced

I rebuilt my three mutations of `hover.cjs` on the pinned file (each anchor must match exactly once; an unknown mutation fails loudly), ran the **whole roster** each time as `npm run check:hover` does, and restored from the pin with a hash check after each.

| Mutation | Exit | PC4 | Rest of the gate |
|---|---|---|---|
| none (the pinned build) | 0 | fired, 1:1, `grad` candidate | PC1 to PC3 fire, 0 errors |
| **A**: the judge ignores the coverage capture | **2** | **DID NOT FIRE**, 21:1 from the `box` candidate; `RUN VOID` names PC4 | PC1 to PC3 fire (PC3 back to 1.14) |
| **C**: the coverage colour is the label's own corner | **2** | **DID NOT FIRE**, same 21:1 | PC1 to PC3 fire |
| **B**: the coverage style never paints | 2 | all four controls DID NOT FIRE | 101 themes VOID from the runtime guard ("coverage colour did not paint"), 3,462 of 4,040 pairs measured |
| **E2**: PC4 defined under another id (as if deleted) | 2 | `positive control PC4 did not run` | |
| **F**: PC4 dropped from `HOVER_CONTROLS` with A applied (the original T-F1 shape) | **0** | prints DID NOT FIRE, still exits 0 | shows the list edit in `run.mjs` is exactly what makes the control a gate |
| **E**: a new PC5 defined in `hover.cjs` only, built so it cannot fire | **0** | PC5 prints `DID NOT FIRE`, exit 0 | **finding F-1** |

So A and C, which reopened A-F1 with a fully green gate last time, now stop the run. B, E2 and F behave as expected. The numbers behind "without it PC4 reads 21:1" in Brief row 63 are measured (A and C).

Other gate-level checks, all as claimed:

- `--neuter-control=PC4` (upper case) is accepted (`--only cyberpunk`, exit 2); `pc4,pc1` voids the run naming both; the neutered fixture really is `#333333`.
- `--ink-free-all`: exit 0, PC3 and PC4 still fire (1.08 and 1.00; the control text says "ink-free capture forced"); `--ink-free-all --neuter-control=pc4` exit 2. Wall time 98.5 s here (Brief: 122 s, load-stamped; see N-list).
- `--only tron` and `--only cyberpunk --processes=1`: all four controls still run and fire (exit 0). `--only nosuchtheme`: exit 2.
- Timing: normal gate 42.6 / 42.9 / 43.1 s (build, head, build), so the fourth control costs nothing measurable.

**F-1 [Minor]: enforcement is still two hand-kept lists.** `HOVER_CONTROLS` in `run.mjs` is now the single list for the void check and `--neuter-control`, but `hover.cjs` still defines the controls on its own. A control added to `hover.cjs` without touching the list prints `control PC5 DID NOT FIRE` and the run exits **0** (mutation E; the summary even counts it: "582 of 4045"). That is the T-F1 trap, one edit away. The code only carries a comment saying so (`run.mjs` line 98). Direction: have `run.mjs` fail a run whose `hx.pcs` contains an id not in `HOVER_CONTROLS` (three lines), or have `hover.cjs` export the list that `run.mjs` imports. Today all four controls are enforced, so nothing is wrong now.

## 4. The harness: H-F1 (identification) and the rest

Pinned copy run from `scratchpad/futaba-pc4/pin/studio/scripts/qa/`, with `--root` the snapshot and `--tool` the real tool.

### 4.1 H-F1: sibling Electrons are spared

Three harmless idle `electron.exe` dummies of mine (each with its own GPU and utility children), started before the run and ended by PID afterwards: **D1** in a sibling folder with the same prefix as `--out` (my original repro); **D2** inside the run folder; **D3** elsewhere but with the exact `--qlrm-config=<run>\01-rest\cfg.json` of launch 1 on its command line (the strongest spoof). Positive control: the **old harness** (`git show HEAD:...`, hash `e370d458...`) against an identical set.

| Harness | Exit | Dummies | Harness's own words |
|---|---|---|---|
| Pinned (new) | **0** | all 3 alive, all 6 children alive afterwards | `0 left`, census control: 4 processes seen (main by spawn: yes; the app reported 4) |
| Old (HEAD) | 4 | **all 3 ended** | `3 left, ended by PID: ...` |

So H-F1 reproduces on the old copy and is gone on the new one. The 9 `electron.exe` still running after the old run were exactly the new set's 3 dummies and their 6 children (checked by parent PID) and I ended them by PID; nothing else on the machine was touched.

Orphan child (a scenario spawns a detached `electron.exe` as a Node sleeper that has its own live grandchild, then Quit): **exit 4 `LEFTOVER`, `ended by PID: 48528 (child of 13152), 44596 (child of 48528)`**, and no `electron.exe` afterwards. Control for the control: with the child rule disabled in a scratch copy (HM2) the same scenario gives **PASS** with both processes alive, so the scenario is a real test.

`ownOf()` extracted verbatim from the pinned file and exercised with synthetic process tables: **13 of 13 cases** behave (same PID created 10 minutes before or after the spawn window: not claimed; child created after the main exited or before it started: not claimed; reported PID with creation time 5 s off: not claimed; a sibling with this run's folder in its command line: not claimed; child and grandchild chain: claimed; spawn-window edges at t0 minus 1000 ms inclusive and 1001 ms exclusive). Nothing decides on a command line any more (`grep` of the pinned file: the only `.cmd` use is carried as data).

Two concurrent harness runs (6 launches each, different `--out`): both exit 0, both PASS, `0 left`, each census control saw exactly its own 4 processes.

**H-F4 [Minor]: an orphan whose parent died before the census is not claimed.** Repro: the scenario spawns a child that spawns a grandchild and exits at once. The harness reports `PASS`, `0 left`, exit 0 while the grandchild `electron.exe` (PID 31688) is still running (I ended it by PID after confirming its command line was my sleeper and that its parent had exited by design). Cause: the child rule needs the parent to be in the process table at census time; a dead parent is not, and nothing records descendants during the launch. The synthetic case "grandchild with a dead parent" gives the same answer. Not a regression (the old command-line match would not have seen it either: its command line carries no run folder) and not reachable by anything the real app does today (it starts `csc.exe` and PowerShell, never `electron.exe`), so Minor. Direction: also take a census at the pre-quit point and keep every descendant PID seen, or walk the parent chain through already-dead ancestors by creation time.

### 4.2 Everything else the harness does (re-checked, since the launch loop changed)

| Check | Result |
|---|---|
| 9 screens (rest, settings, edit, cheat, picker, filter, skin, parked, flow) | **9 of 9 exit 0 via the tray's Quit**, quit-to-exit 65 to 95 ms, `show(blocked) 1`, focus 0, left 0, `from tool: electron-updater` each; `PASS`, registry unchanged |
| `--control-no-quit` (2 screens) | exit **7** per launch, 5.1 s after Quit, run reported PASS (control) |
| `--pick=click --query=mord --theme=2001`, screens skin, parked, flow | 3 of 3 exit 0; the flow's store and saved file both say `mordor` |
| Scenario that hangs, `--timeout=10` | the app's watchdog fires: exit 4, run FAIL (exit 1), `0 left` |
| Scenario that blocks the main thread forever (so the app's own watchdog cannot fire) | the driver's hard kill at 40 s: `ended through its own handle`, FAIL (exit 1), `0 left`, no `electron.exe` afterwards (this path now sets `exitAt`) |
| Scenario that throws | FAIL (exit 1) with the message |
| Refusals: `--screens=nope`, `--timeout=5`, `--out` inside the real QuickLauncher profile, `--out` inside the tool's `src/` | all exit 2 with a specific message; nothing created (I never listed `%APPDATA%\QuickLauncher`) |
| `--out` with spaces, brackets, parentheses and Cyrillic | 2 of 2 PASS; temp folder correct; `ql-icon-helper.dll` compiled into the profile |
| Does the temp check ever fire? HM1 (the `TEMP`/`TMP` override removed in a scratch copy) | **FAIL, exit 1**: `temp folder not isolated: the app's temp is C:\Users\AnGeLZzZ\AppData\Local\Temp, expected ...\01-rest\tmp` |
| Does the census control ever fire? HM3 (reported creation time shifted 5 s) | **FAIL, exit 1**: `the census control did not identify the first launch's processes`, "leftover check is unproven" |
| `--help` | prints, exit 0; the temp and census text is current; from the studio root `node scripts/qa/quicklaunch-real-main-smoke.cjs --help` works |
| Sergei's QuickLauncher | never touched: his 4 PIDs (23324, 30760, 31752, 41564) present at the start, throughout and at the end; every launch took its own single-instance lock (`lockAcquired` true) |

## 5. H-F2 and Ender's shared-temp note

**Method.** A watcher polled the shared `%TEMP%` for `QLIconHelper.cs` every 2 ms and its whole listing every 25 ms, and a second sampler polled `csc.exe` every ~20 ms and recorded, for each compiler it saw, its own command line (it carries the source path) and its ancestor chain back to the app that started it. Two windows: 13:27:15 to 13:30:05 (14 compiles) and 13:31:25 to 13:38:25 (27 compiles). Because the file lives about 150 ms and `csc.exe` about 250 ms, a 20 ms poll can miss a compile; the table counts what was seen.

| Compiles seen (41) | Source path | Count |
|---|---|---|
| **Pinned harness, 34 compiles** (9 + 2 + 1 in window 1; 22 in window 2) | the launch's own `<out>\<launch>\tmp\QLIconHelper.cs` | **34 per-launch tmp, 0 shared** |
| Pinned harness, 1 more | csc's command line was empty at the moment of sampling | no shared sighting within 0.8 s of it |
| **Old harness** (my positive control, 2 launches) | the shared `%TEMP%\QLIconHelper.cs` | 2 shared; 2 sightings of the file |
| **HM1** (pinned harness with the override removed, my control) | shared | 1 shared; 1 sighting |
| **A parallel lane** (a packaged `QuickLauncher.exe` under `scratchpad\futaba-m3\build`, started at 13:26:32, not mine) | shared | **3 shared; 3 sightings** (13:31:41, 13:32:12, 13:37:54) |

Total sightings of the file in the shared folder: 6 (2 + 4); every one is matched to a compile within 0.8 s: 2 old harness, 1 HM1, 3 the other lane. **Zero** belong to the pinned harness, and the watcher is proven able to see a leak (it caught the old harness and HM1). Judgement on Ender's note: **he was right**. The other lane's app writes that same fixed name into the shared folder whenever its fresh profile has no cached DLL, and it did it three times in this seven-minute window. H-F2 is **closed**: the app's `app.getPath('temp')` equals the launch's tmp folder in every launch (the harness now fails a launch that does not, HM1), the compile reads its source from there, and the folder is empty afterwards (the file is deleted after the compile; the DLL is in the profile).

Not an app write, noted for completeness: each PowerShell call the harness's driver makes (the census and registry reads run in the driver's own environment, outside the isolation by design) leaves one transient, random-named `__PSScriptPolicyTest_*` file in the shared `%TEMP%`. That is PowerShell's own policy probe, never collides with Sergei's names, and the driver cannot be moved without moving the whole harness.

## 6. H-F3

The pointer line is in `.claude/agents/futaba-qa.md` (one added line, front matter untouched) and, as evidence that a cold start sees it, it is already in this agent's own instructions at launch. The path it names exists and `--help` works from the studio root. Closed.

## 7. Findings

| # | Build | Severity | Finding | Status |
|---|---|---|---|---|
| T-F1 | tooling | (was Major) | the ink mask had no positive control | **closed**: PC4 fires; mutations A and C void the run (exit 2) |
| H-F1 | harness | (was Minor) | census ended processes it did not spawn | **closed**: the old copy ends all 3 dummies, the new one spares all 3 |
| H-F2 | harness | (was Minor) | shared `%TEMP%\QLIconHelper.cs` | **closed**: 34 of 34 identified compiles used the per-launch tmp; Ender's sighting was the other lane |
| H-F3 | harness | (was Minor) | harness not discoverable | **closed** |
| F-1 | tooling | **Minor** | a control defined only in `hover.cjs` is printed but not enforced (mutation E, exit 0) | open; direction in section 3 |
| H-F4 | harness | **Minor** | an orphan whose parent died before the census is not claimed: PASS with a live `electron.exe` (repro in 4.1) | open |

Notes, not findings:

- **N1** `--help` of the harness still ends with a stray blank line.
- **N2** The per-launch "still running 1 s after exit" check still identifies by PID alone (`tasklist` image name); a sibling `electron.exe` that happens to reuse the PID in that second would be a false FAIL, never a kill. Read from the code; not reproduced.
- **N3** The end-of-run kill is by PID after the census, without re-checking the creation time at kill time (a window of milliseconds).
- **N4** The CITE line prints "QuickLauncher.exe untouched (4/12)" whenever the process count moved: the count includes other lanes' packaged apps and is noise on a shared machine (it read 8, 4 and 12 at different points of this pass). "Untouched" is true; the pair of numbers is not evidence.
- **N5** `Docs/QuickLaunch_HoverFix57_Spec_2026-10-02.md` section 5.4, which Brief row 27 names as the gate's "definition", still says "now two" controls. The drift began when PC3 landed; PC4 widens it.
- **N6** `run.mjs --help` prints every `//` line in the file, so the new `HOVER_CONTROLS` code comment now appears in the usage text (the mechanism is old; other code comments already leak the same way).
- **N7** `--only nosuchtheme` exits 2 with four VOID lines and none that says the theme does not exist.
- **N8** A neutered PC3 or PC4 still reads "a hard patch exactly the label colour" in its description while its fixture is `#333333`; the line does say DID NOT FIRE.

## 8. Pattern alerts

Pattern alerts: 1 open, 1 closed

1. **A positive control that is printed but not enforced (T-F1, then F-1).** Two builds in a row the hover gate has had the same structural gap: last build the new mask had no control; this build the control is enforced but only because a second list was updated by hand, and the same silent exit-0 is one edit away (mutation E). ProcessRules § Doc Governance says a rule violated after being written down gets a mechanism, not another restatement; the fix here is a comment. **Recommended disposition: fix** (the three-line check in section 3). Disposition is Jane's to confirm; not blocking.
2. Closed: **the lane-2 harness is rebuilt by hand every pass.** Last pass's residual was discoverability (H-F3). Disposition **fix, verified** (section 6).

## 9. Counts, with method

- **Gate runs:** 13 full-roster (101 themes x 40 readings): the clean `npm run check` in `build`, `head`, a second `build`, the entry-check script's own run, `--ink-free-all`, `--neuter-control=pc4`, and 7 mutation runs (A, C, B, E2, F, E, and one E that my own bad fixture string voided before it measured anything). 6 `--only` runs (upper-case neuter, `pc4,pc1`, `--ink-free-all` with neuter, `tron`, `--processes=1`, `nosuchtheme`) and 1 refusal (`pc5`). Counted from the 18 gate logs in `scratchpad/futaba-pc4/logs/`, plus the entry-check run (no log) and the first, voided E run (its log was overwritten by the re-run).
- **Harness runs:** 16 runs that wrote a `summary.json`, 40 launches, counted by a script that walks the scratch folders and sums `rows`: 36 exit 0, 2 exit 7 (the no-quit control), 1 exit 4 (the hang scenario's watchdog), 1 killed by the driver (the busy scenario). Plus 4 refusals. Of these, 4 harness runs used mutated or old copies (HM1, HM2, HM3, old).
- **Processes I started:** gate Electron processes (each run ends them: `36 started, 0 left` in every run), harness launches (each ends them), 6 dummy `electron.exe` apps (2 sets of 3, each with 2 children), 3 orphan scenarios (6 Node-sleeper `electron.exe`: the harness ended 2, I ended 3 by PID after confirming each was mine, 1 exited by design), the two watchers (ended by themselves), and one stray `python3.exe` from a malformed command of mine (below). End census: `electron.exe` 0, `python3.exe` 0, nothing naming my scratch folder except the census command itself.
- **Headless browsers:** none.

## 10. Not tested, and my own probe faults

Not tested: real OS input (no away window stated); the packaged build; Sergei's real hotkey; the harness on the live tree as `--root`; `npm run build` and `npm run release`; a PID-reuse event in the wild (covered by the synthetic table instead).

My own faults, found and removed before any number here depended on them: (1) a heredoc I wrote for a scratch edit left `python3 -` waiting on stdin, which hung a shell for four minutes; I identified it by command line and parent, ended it by PID and redid the edit another way. (2) My first mutation E had a fixture string with a real newline in it, so Electron failed to load `hover.cjs`: all four controls "did not run", exit 2; I fixed the string and re-ran, and the figures above are from the re-run. (3) My first watcher analysis mis-classified every compile as shared because backslashes were lost in the script; I rewrote it with a code-point backslash and re-ran, and the table is from the second analysis. (4) Several grep patterns printed far too much; none changed a number. (5) A `--out` with Cyrillic characters, passed from Git Bash, was rewritten by path conversion to `C:\c\Users\AnGeLZzZ\AppData\Local\Temp\claude\...\futaba-pc4\hf1\<Cyrillic> out [1] (a)`, so my probe created a stray `C:\c\` tree (155 entries, about 5 MB, 2 harness profiles). The harness itself behaved correctly with that path (4.2). I did not delete it (recursive deletes are denied); Jane or Sergei can remove `C:\c` whenever convenient. (6) My first synthetic `ownOf` table used timestamps in the future, so every "alive" case failed; I moved them into the past.

## 11. Scratch (copy what you need; it has been wiped before)

`C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ab778959-0638-4d60-8887-346c422e496e\scratchpad\futaba-pc4\`: `pin\` (the five pinned files) and `pin-sha256.txt`; clones `head\`, `build\`, `mut\` and `snap\`; `deepcmp.cjs` (every-key comparison of two readings files); `mutate.cjs` and `mutrun.sh` (modes A, B, C, E, E2, F); `gaterun.sh`; `hmutate.cjs` and `hmut\` (harness mutations HM1 to HM3); `ownof-test.cjs` (extracts `ownOf` from the pinned harness); `sc\` (scenarios: orphan1, orphan2, hang, throw, busy); `dummyspawn.cjs` and `hf1\` (dummy apps and every harness run's output); `old-harness\`; `tempwatch2.cjs`, `cscwatch.ps1`, `analyze-watch.cjs` and `watch\` (the shared-temp and compiler evidence); `counts.cjs`; `out\` and `logs\` (every run's readings and console output). Stray, mine, not deleted: `C:\c\` (section 10).

---

# F-1 follow-up (regression QA of Ender's fix), 2026-10-04

Futaba. Asked by Jane: regression-QA of Ender's fix for F-1 (a control defined only in `hover.cjs` was printed but not enforced). Red-team again: break the new "ran must equal `HOVER_CONTROLS`, each once" check with every shape of mismatch I could build, and check the neuter paths, the readings and the spec text. Nothing in the tool repo or the studio repo was edited, staged, committed or pushed; the only thing I wrote there is this appended section (uncommitted). The regions worktree (`C:/Antigravity Projects/QuickLaunch-regions-spike`) was not touched. Runs span 19:18 to 19:52 JST, with a re-check at 23:13 after a pause.

## F1.1 Verdict

**Verdict:** GO

GO for Sully to commit the three files (`scripts/theme-gallery/run.mjs`, `scripts/theme-gallery/hover.cjs`, `Docs/QuickLaunch_HoverFix57_Spec_2026-10-02.md`). Blockers: none. Majors: none. **F-1 is closed** for every shape of mismatch where a control has a string id, and N5 (the spec's "now two") is closed. One new Minor, **F-2**, in a shape the fix does not reach (a control with no usable id); it predates the fix, fails loudly, and does not block. All six of Ender's claims reproduced.

Pattern alerts: 1 open (F1.7), 1 closed.

## F1.2 Receipt (the pin)

| Item | Value |
|---|---|
| Tool / version | QuickLauncher **1.94.3** (folder `WIP/QuickLaunch`) |
| Branch / HEAD | `wip/theme-fidelity` / **`454f66f`** (`454f66f38aeeb827c41bd62add19ad617d7f1785`); unchanged at the end |
| Dirty set, tool repo | exactly the 3 files below, at the start and at the end; nothing untracked, no stash |
| Entry-check receipt (identical script, run from the pinned clone `build`) | `Entry-check receipt: quicklauncher v1.94.3 @ 454f66f (dirty: Y) — pre-qa n/a, post-build n/a, check-electron n/a, check pass, test:smoke n/a` |

SHA-256 of the pin, taken first from the live files into `scratchpad/futaba-f1/pin/` (kept as `pin-sha256.txt`):

```
696bda314550840bacdd272dd18b2d43ccf879d4cb626af4a11d0c3b38d1a6b9  tool/scripts/theme-gallery/run.mjs
231861083efe6588631e7e4ba3a702ca9f2819eccae16be8f0389f8a27279793  tool/scripts/theme-gallery/hover.cjs
b99b7804f7794afe86e35b069239d29266ff793aceac53105b070c518b06987b  tool/Docs/QuickLaunch_HoverFix57_Spec_2026-10-02.md
```

**End check (19:52): all 3 live files hash-identical to the pin** (`sha256sum -c` against the pin file, 3 of 3 OK, and `cmp` of each live file against its pinned copy). Tool repo HEAD still `454f66f`, same 3 modified files. My mutation clone `mut` ended hash-equal to the pin (restored after every run, `cmp` each time). The session paused after that check; on resuming I repeated it at 23:13 before appending this section: pin file 3 of 3 OK, live files identical to the pin, HEAD and dirty set unchanged, `mut` still pinned, `electron.exe` 0, Sergei's 4 QuickLauncher PIDs still there.

**What I tested.** Three scratch clones of the tool repo (`git clone --no-hardlinks`, detached at `454f66f`): `head` (unmodified old tooling, the comparison), `build` (HEAD plus the three pinned files, byte-verified) and `mut` (same as `build`, mutations only, restored from the pin and compared after every run). `node_modules/electron` is a real byte copy (not a junction or symlink) in all three; `electron.exe` hashes equal to the live one (`217c7abc77aa...`). My link walker (junctions count as links) found **0 links** in `head` (2,067 entries), `build` (2,073), `mut` (2,073), the output folder (170) and the logs (136). I did not run `npm run build` or `npm run release`.

Setup note: `head` is a plain checkout, so its two tool files have CRLF endings; the pinned files are LF. With the CRs stripped, `head` equals the `HEAD` blobs byte for byte, and the `--help` text of `head` and `build` differs in exactly the two lines Ender changed (the `HOVER_CONTROLS` comment), nothing else.

## F1.3 Ender's claims, one by one

| Claim | Result | How |
|---|---|---|
| Unlisted PC5, firing or not, gives exit 2 | **yes, both** | full roster. Firing: exit 2, PC5 prints `fired`, one line `PC5 ran but is not in HOVER_CONTROLS (run.mjs), so nothing would enforce it`. Not firing: exit 2, that line plus `PC5 ... did not fail`. The report JSON says `verdict VOID` with that failure |
| Duplicate PC1 gives exit 2 | **yes** | full roster: `positive control PC1 ran 2 times`, exit 2 |
| Renamed PC4 gives exit 2 | **yes** | full roster, PC4 to PC4b: `PC4 did not run` and `PC4b ran but is not in HOVER_CONTROLS`, exit 2 |
| The neuter paths are unchanged | **yes** | 19 invocations, each run on `head` and on `build`: exit codes equal in 19 of 19, normalised output identical in 19 of 19 (table F1.5) |
| 4,040 readings identical apart from `grabs` | **yes** | F1.4: 4,040 of 4,040 in all three comparisons |
| `npm run check` passes | **yes** | the entry-check script reports `check pass` (contrast, then hover, exit 0 at 454f66f plus the pin); 3 more clean full runs exit 0 |

Also unchanged: wall time (the gate's own timer 44.8 s on `build`, 46.0 s on `head`, 46.0 s on a second `build`), 36 processes started and 0 left, sockets 0, registry unchanged.

## F1.4 The 4,040 readings

Method: `deepcmp.cjs` joins two `hover-readings.json` files on theme and pair (101 x 40) and compares every key of every reading, flattened, at full precision.

| Comparison | Pairs | Identical on every key | Identical apart from `grabs` | Other differences |
|---|---|---|---|---|
| `head` run against `build` run 1 | 4,040 | 3,997 | **4,040** | none; `grabs` differs in 43 |
| `head` run against `build` run 2 | 4,040 | 4,001 | **4,040** | none; `grabs` differs in 39 |
| `build` run 1 against `build` run 2 | 4,040 | 4,008 | **4,040** | none; `grabs` differs in 32 |

Also identical in all three: the four control records at every key (PC1 1.65, PC2 2.32, PC3 1.08, PC4 1.00), `verdict` PASS, `failures` empty, 0 errors, 0 grandfathered, and the ink-free counters (582 read again; image layer 119, clipped ring 0, near the floor 60, ring over 2 % worse 403). The console output of `head` and `build` is identical after timings and paths are normalised. `--ink-free-all` on `build`: exit 0, PC3 and PC4 still fire, **0 verdict differences** against the normal run, 679 of 4,040 readings lower by the unrounded `ratio` (669 by the rounded `ratio2`), none higher, largest drop 3.015 % (indiana-jones `edit-add-file/hover`, 17.49 to 16.96): the figures the usage text and the Brief state. 112 s wall.

## F1.5 The neuter paths, head against build

Each row ran the same arguments on `head` and `build` (`--only cyberpunk` unless noted) and compared the exit code and the normalised output.

| Arguments | Exit (head / build) | Output |
|---|---|---|
| `--neuter-control=pc1`, `pc2`, `pc3`, `pc4` (four runs) | 2 / 2 each | identical; each names only its own control |
| `pc4,pc1` | 2 / 2 | identical; PC1 then PC4 |
| `pc1,pc2,pc3,pc4` | 2 / 2 | identical; all four |
| `PC4` (upper case) | 2 / 2 | identical |
| `pc5`, `PC5`, `pc4,pc9` | 2 / 2 | identical; `REFUSED: unknown control ... (pc1, pc2, pc3, pc4)`, nothing started |
| empty value (`--neuter-control=`) | 0 / 0 | identical; nothing neutered |
| `pc4,pc4`; `pc4,`; `pc4, pc1` (one argument); `--neuter-control pc4` (space form) | 2 / 2 each | identical |
| `--ink-free-all` with `pc4`; with `pc3` | 2 / 2 each | identical |
| `--processes=1` with `pc4`; `--only cyberpunk,tron --processes=2` with `pc3` | 2 / 2 each | identical |
| Full roster on `build` only: `pc4`; and `pc1,pc2,pc3,pc4` | 2; 2 | PC4 only; all four, over 4 processes |

Two of the 19 invocations (`PC4` and `PC5`) shared log names with their lower-case twins on this case-insensitive disk, so those two pairs of logs were overwritten; their result lines (identical, exit 2 / 2) were printed at run time and are what I rely on for them.

## F1.6 Shapes of mismatch I built myself

Every mutation was applied to the pinned `hover.cjs` or `run.mjs` in `mut` (each anchor had to match exactly once), run, and restored from the pin with a `cmp`.

| Shape | Scale | Exit | What the run said |
|---|---|---|---|
| Controls run on **every** process instead of process 1 | full | **2** | `PC1`, `PC2`, `PC3` and `PC4` each `ran 4 times` |
| Controls run on **no** process | full | **2** | all four `did not run` |
| Controls run on the last process, not the first | full | 0 | passes: the check does not depend on which process runs them |
| PC4 removed from both `run.mjs` and `hover.cjs` (a consistent edit) | full | 0 | passes with three controls: a deliberate removal is allowed |
| Unlisted PC5 firing, with `--rebaseline` | full | **2** | `--rebaseline skipped: the run is void`; the baseline file hash is unchanged |
| Unlisted PC5 firing under `npm run check` | full | **2** | contrast passes (101 checked, 0 errors), hover is void, npm passes the 2 through |
| A **second** PC1 that cannot fire | `--only` | **2** | `ran 2 times` **and** `did not fail` (the old `find()` would have judged only the first copy) |
| A second PC4 that fires | `--only` | **2** | `PC4 ran 2 times` |
| PC4 id `pc4`; `PC4 ` (trailing space); empty id | `--only` | **2** each | `PC4 did not run` plus the odd id reported as not in the list |
| `HOVER_CONTROLS` gets PC5 but `hover.cjs` defines none | `--only` | **2** | `PC5 did not run` |
| `HOVER_CONTROLS` loses PC4 | `--only` | **2** | `PC4 ran but is not in HOVER_CONTROLS` |
| `HOVER_CONTROLS` all lower case; empty; `'PC4 '` with a space | `--only` | **2** each | four `did not run` and four unlisted; four unlisted; PC4 `did not run` and unlisted |
| PC4's page cannot be measured (theme `nosuchtheme`) | `--only` | **2** | both attempts logged, `PC4 DID NOT FIRE ... ?:1`, `did not fail` |
| Mutation A (the judge ignores the coverage capture), the original T-F1 | `--only` | **2** | PC4 `DID NOT FIRE`, 21:1 from the box candidate |
| `HOVER_CONTROLS` lists PC4 twice | `--only` | **0** | accepted silently (note N-a) |
| `pc.failed` forced to true for every control | `--only` | **0** | all four print `fired` (note N-b) |
| **A control with no `id` field** (an `ID:` typo) | `--only` x6, full x3 | **1** in 5 of 6 and in 2 of 3, otherwise 2 | `TypeError: Cannot read properties of undefined (reading 'localeCompare')` (**F-2**) |
| **A control with a numeric id** (`id: 4`) | `--only` x1, full x3 | **1** in 4 of 4 | `TypeError: a.id.localeCompare is not a function` (**F-2**) |

## F1.7 Findings, notes, spec check, pattern alerts

| # | Severity | Finding | Status |
|---|---|---|---|
| F-1 | (was Minor) | a control defined only in `hover.cjs` was printed but not enforced | **closed**: unlisted (firing or not), missing, duplicated, renamed, list-only, process-duplicated and not-firing shapes all exit 2 |
| N5 (last pass) | (note) | the spec said "now two" controls | **closed**, see below |
| **F-2** | **Minor** | a control whose `id` is missing or not a string crashes the verdict with a stack trace and **exit 1**, not a VOID with exit 2. It is order-dependent: `pcs` is sorted with `a.id.localeCompare(b.id)`, and whether the comparator receives the bad element as `a` depends on which control finished first, so 5 of 6 `--only` runs and 2 of 3 full runs crashed for a missing id (4 of 4 for a numeric id) and the rest voided correctly. Exit 1 means "a new failing pair" to anyone reading the gate's contract, and no `hover-readings.json` is written. The unmodified `head` tooling does the same (3 of 4), so this is not a regression. Reachable only by a typo in a control definition, and it fails loudly | open. Direction: before the sort, void a run holding a non-string id (one line in `fails`), and sort on `String(p.id)` |

Notes, not findings:

- **N-a** A repeated entry in `HOVER_CONTROLS` (for example `'PC4'` twice) is accepted silently, exit 0. "Each exactly once" is enforced on the run side only. Nothing is left unenforced by it.
- **N-b** `run.mjs` trusts the `failed` flag that `hover.cjs` computes for each control. A control forced to `failed = true` fires every time (exit 0). Not part of F-1 and not new; a cross-check `failed === (ratio < under, no problems)` in `run.mjs` would close it.
- **N-c** Hand-kept mirrors of the control list remain outside the code check: the `run.mjs` header lines 42 and 43 still say "a positive control that does not fail" (missing, duplicate and unlisted are not named), lines 49 to 51 hard-code `pc1,pc2,pc3,pc4` and describe each control, spec section 5.6 lists "a positive control does not fail" as the cause (it is marked "unchanged from 2026-10-01", so it is history, not wrong), and Brief row 27 states "four". None is wrong today.
- **N-d** `run.mjs --help` prints the two new comment lines, which say "this list" about a constant the usage text never shows (the N6 mechanism: every column-0 `//` line prints).
- **N-e** The studio root's dirty set moved during my pass: `Team/Docs/ProcessRules.md` is now modified (it was not at 19:18). Not mine; I did not open it.

**Spec section 5.4 checked against the code.** Accurate. The heading's claims (any one passing, missing, run twice, or not in `HOVER_CONTROLS` voids the run, exit 2) each reproduced (F1.3, F1.6). "Two at first, four since 2026-10-04": PC4 first appears in commit `201fa7e` dated 2026-10-04 (`git log -S"id: 'PC4'"`). PC3 bullet: commit `bc23337`, dated 2026-10-03, is the first commit defining it (`git log -S"id: 'PC3'"`); the ramp, the pair `edit-add-file/hover`, "under 2:1", "from the gradient candidate" and "measured 1.08" match the code and my runs (1.08). PC4 bullet: "same pair and rules as PC3" matches (same pair, `under: 2`, `needSrc: 'grad'`, `noPaintTrigger`); "measured 1.00" matches (1:1); "without it 21:1" reproduced under mutation A (21:1, box candidate). The Brief heading "Gradient fills in the hover gate" exists in the Decision Log (row 63). The PC1 and PC2 bullets are unchanged by the diff and still match (1.65, 2.32). The hunk touches only the heading and two added bullets. `hover.cjs`: with its full-line `//` comments stripped, the file is identical to `HEAD`, so the change is comments only, and the new header sentence is true (tested).

Pattern alerts: 1 open, 1 closed

1. Closed: **a positive control printed but not enforced** (T-F1, then F-1, two builds in a row). The structural gap is gone and the mutations that reproduced it last pass now exit 2. Disposition **fix, verified**.
2. Open: **prose and usage mirrors of the control list drift each time a control is added** (the spec stopped matching at PC3 and was fixed only now; N-c lists what is still hand-kept). Recommended disposition: **accept**, since it is docs only and a new control is rare, with one added sentence in the `hover.cjs` header naming those places next to "a new control's id goes there too". Jane to confirm; not blocking.

## F1.8 Counts, with method

- **Gate runs: 87** hover-gate executions, counted from the 83 logs in `scratchpad/futaba-f1/logs/` (82 gate logs plus the entry-check's own `npm run check`) plus 4 logs overwritten by the case collision. **23 full-roster** (22 logs plus the entry-check's): exit 0 in 7, exit 2 in 11, exit 1 (the F-2 crash) in 5. **64 `--only` runs**: 38 head/build comparison runs (19 invocations x 2) and 26 mutation or crash probes (exit 2 in 15, exit 0 in 2, exit 1 in 9, of which 3 were on `head`).
- **Crashes with a stack trace: 14**, counted by `grep -l TypeError` over the logs (5 full, 6 `--only` on the pin, 3 on `head`); all are the `localeCompare` shape (F-2).
- **Isolation: 64 runs printed an isolation line and all 64 said 0 left, sockets 0, registry unchanged** (17 x 36 processes started, 44 x 4, 1 x 6, 2 x 8). The 19 logs without that line are 14 crashes (the processes had already been ended before the verdict code ran), 4 refusal logs (nothing is started), and the entry-check log. End census: `electron.exe` 0.
- **Processes I started:** only the gate's own Electron processes (each run ends its own). No dummies, no harness runs. Sergei's QuickLauncher: 4 PIDs (30760, 23324, 31752, 41564) present at the start and at the end, never touched.
- **Headless browsers:** none.

## F1.9 Not tested, and my own probe faults

Not tested: real OS input (no away window stated); the packaged build; the lane-2 smoke harness (not part of this change); a run interrupted by the 180 s limit with only some controls run (by reading, the `did not run` lines cover it; not tested); `npm run build` and `npm run release`.

My own faults, found before any number here depended on them: (1) my first static check used a `$'\r'` inside a `for` loop and broke the shell parse; I redid it with `tr -cd '\r'`. (2) A `node -e` read passed an MSYS-style `/c/Users/...` path to Node, which resolved it as `C:\c\Users\...` and failed with ENOENT; it only read, and the stray `C:\c\` tree from the previous pass is unchanged (156 entries before and after). I re-ran it with a Windows path. (3) Two log pairs collided on a case-insensitive disk (`PC4`/`pc4`, `PC5`/`pc5`), see F1.5. (4) One read-only process query (a `Get-CimInstance` filter for command lines naming my scratch folder) went through `powershell.exe -NoProfile -Command` from Bash, not through the PowerShell tool; it listed only my own shells and the query itself. (5) `head` is a CRLF checkout and `build` an LF pin, which I only noticed from the `--help` diff; it changes no reading. (6) A first attempt to append this section failed on a shell parse error and wrote nothing; I wrote it through a file instead.

## F1.10 Scratch (copy what you need; it has been wiped before)

`C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ab778959-0638-4d60-8887-346c422e496e\scratchpad\futaba-f1\`: `pin\` and `pin-sha256.txt`; clones `head\`, `build\`, `mut\`; `mutate.cjs` (every mutation above, by name), `g.sh` (run the gate in a clone, restore and `cmp` the pin), `nt.sh` (head against build for one argument set), `deepcmp.cjs`, `links.cjs`; `section.md` (this section); `out\` and `logs\` (every run's readings and console output).
