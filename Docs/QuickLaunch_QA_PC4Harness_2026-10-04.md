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
