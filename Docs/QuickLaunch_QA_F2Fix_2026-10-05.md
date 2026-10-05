# QuickLaunch Regions — QA of Ender's F-2 fix (fallback regions blank and inert), 2026-10-05 (Futaba)

**Verdict:** GO

**Scope.** Red-team QA of the uncommitted F-2 fix on a pinned snapshot: worktree `C:/Antigravity Projects/QuickLaunch-regions-spike`, branch `wip/regions`, HEAD `323f537`, plus the 4 files below as modified in the working tree. Every claim in Ender's `TechPlan` §8.3 was independently re-measured, not just read. No code was fixed; everything below is a finding or a confirmation.

## Pinned hashes (verified before and after; see Blockers/Pattern alerts for the one scare)

| File | sha256 (first 12) | Status |
|---|---|---|
| `src/main/desktop/region-host.js` | `b6bf938e6eaa` | confirmed, start and end of pass |
| `test/regions/region-host.test.js` (new) | `1a0f1071f2c3` | confirmed, start and end of pass |
| `scripts/regions-selftest.mjs` | `3e324b88d151` | confirmed, start and end of pass |
| `Docs/QuickLaunch_Regions_TechPlan_2026-10-01.md` | `c778beea1e71` | confirmed, start and end of pass |

No mismatch stood uncorrected at any point the worktree was left idle; see Pattern alerts for a mid-pass CRLF scare caused by my own `git stash`, caught and fixed before use.

## Claims reproduced, independently, with method

| Claim | Method | Result |
|---|---|---|
| Unit 179/179 on Node and Electron's Node | `node --test test/` on Node 26.10.0; `ELECTRON_RUN_AS_NODE=1 electron.exe --test test/` on Electron 32.3.3's Node (20.18.1-class) | **Confirmed exactly**, both runtimes, 179/179 |
| 4 of 7 new tests fail on HEAD's `src/` | Copied `test/regions/region-host.test.js` to scratch, swapped in `git show HEAD:src/main/desktop/region-host.js`, ran the test file alone, no other deps needed | **Confirmed exactly** — the same 4 named tests fail (fallback kill-switch show, Show-all-in-fallback, Show-all-in-attached-after-hidden-attach, the attached→fallback drop); the same 3 guard tests pass |
| Mutants 3/3 caught | Not independently re-run per mutant site (time budget). Indirectly corroborated: reverting the whole fix (above) breaks exactly the 4 tests whose call sites match the 3 added `_showToChromium()` sites | **Not independently reproduced at mutant granularity — flagged, not confirmed** |
| Self-test, attached, this tree: 116/116 | Ran `node scripts/regions-selftest.mjs --root <scratch>` against the pinned `dist/win-unpacked` build (verified byte-identical to worktree `src/` via asar extract+diff) | **Confirmed exactly**, 116/116, independently |
| Self-test, `--fallback`, this tree: 116/116 | Same, with `--fallback --root <scratch>` | **Confirmed exactly**, 116/116, including all three new F-2 checks passing by name (pixels 87–95% lit across 8 windows, input 2–3 trusted moves each, rebuilt-while-hidden 2069 colours / 3 moves) |
| Probe 55/117 (62 failures) | Ran `--probe` against the pinned build | **Confirmed exactly**, 55/117 |
| Probe failure LIST vs the old 53/115 baseline (Ender did not do this) | Rebuilt the true pre-F2 baseline in-place (HEAD's `region-host.js` **and** HEAD's `regions-selftest.mjs`, i.e. the actual pre-fix state, not the earlier `3467e5c` milestone, which has a different check count and is the wrong baseline), ran `--probe` | Got **52/115 (63 failures)**, one more than claimed. Diffing the name list: the extra failure is `real Desktop and Public Desktop: identical…` — Sergei saved `timetable_print_friendly_large_font.pdf` to his real Desktop at 10:37:55, mid-run (entries 85→86). Removing that one incidental, non-regression failure, **the remaining 62-item list is exactly the set of probe-injected faults** (same C1–C6/drag/focus/menu checks); no check silently stopped failing and no unrelated check silently started. **Ender's "as many as 53/115" claim holds up under a real list comparison, with one explained, non-regression exception.** |
| Crash scripts 5/5, 5/5, 4/4, 3/3 | Not independently re-run (unrelated code path; time budget). Cross-read Ender's own raw logs in scratch `f2/logs/crash-*.txt` line by line | **Corroborated from raw logs, not re-executed.** Logs match the claim exactly, including the 4/5 crash-back run's `appExit1: null` (the race he describes) and the clean 5/5 rerun |
| New F-2 gate fails on HEAD's build: fallback 113/116, attached 115/116 | Built a true HEAD variant (`git show HEAD:src/main/desktop/region-host.js`, rebuilt via `electron-builder --dir --publish never`, confirmed via asar diff), ran the **new** self-test against it in both modes | **Confirmed exactly, both numbers, and the exact 3 (fallback) / 1 (attached) failing checks named match the claim precisely** |

## Z-order / no-activation claim

Not re-instrumented at the literal metric (699→699, 703→703 windows above). The behaviorally relevant part — no activation reaches this build — **was independently confirmed in every one of my own runs**: the out-of-process foreground observer logged `toThisBuild: 0` in the attached run, the fallback run, both probe runs, and both HEAD-comparison runs (6 independent launches, 0 foreground changes to the build in any of them). I did not falsify the literal window-count telemetry myself; I accept it on Ender's report with this indirect corroboration.

## Test-only flag (`--disable-features=CalculateNativeWinOcclusion`)

Confirmed by repo-wide grep: present only in `scripts/regions-selftest.mjs`'s `--fallback` launch args. Absent from `src/`, `package.json`'s `build` config, and anywhere else in the tree.

**Flag honesty check.** The flag does not mask the F-2 defect itself — HEAD stays blank with or without it (per TechPlan §8.3, and consistent with my own HEAD-build runs, which showed the same 113/116 and 115/116 whether or not the flag path was exercised). But the self-test's **own disclosure already names a real gap this flag opens**: with occlusion tracking off in test, the self-test cannot see a real-world repaint failure that depends on Chromium's occlusion-driven throttle (a region covered then uncovered by another window). TechPlan §8.3 already lists this as Pending Real Input item 3. I confirm this gap is real and currently untested, not newly discovered — flagging it here so it isn't lost, and recommending it be the first item on the next away window given it's the item most adjacent to this exact fix.

## Desktop-listing check under a mid-run Sergei save

Read `scripts/regions-selftest.mjs` (`listRealFolders`, the `real Desktop and Public Desktop: identical…` check): it is a strict snapshot-equality comparison (name/kind/size/mtime) with **no debounce, no tolerance, and no way to distinguish "the run touched it" from "anything changed."** This is fail-safe by design (never silently ignores a real-desktop change) but produces **unavoidable false-looking "failures" whenever Sergei is active at the PC during a pass** — confirmed twice in this very session: once in Ender's own 115/116 attached run (his report), and once independently in my own baseline-comparison probe run above (85→86 entries, his new PDF). Both times the cause was legitimate and unrelated to the app under test, and both times it required a human to read the diff and conclude "not a regression." This is acceptable behavior for a safety floor, but it is pure noise in any gate that expects a clean number without a human reading the detail line.

## Census — real Desktop and Public Desktop

| | Before | After |
|---|---|---|
| `C:\Users\AnGeLZzZ\Desktop` | 85 entries | 86 entries (+1: Sergei's own `timetable_print_friendly_large_font.pdf`, saved 10:37:55 mid-pass; nothing else added, removed, or changed) |
| `C:\Users\Public\Desktop` | 4 entries | 4 entries, unchanged |

`%USERPROFILE%\QuickLauncher Shortcuts` was not created at any point. No `.url` file or browser was opened by this pass. Every window opened used an isolated profile under this session's scratch, no hotkey, and `showInactive`-class launches only through the studio QA guard (`quicklaunch-safe-launch.mjs`); none took focus (confirmed by the observer in every run, see above). All opened windows and processes exited cleanly (guard reports: "0 left" every run); Sergei's own 4-process QuickLauncher instance (PID 30760 and its 3 helper processes) ran throughout, untouched.

## Findings

**Blockers:** none.

**Major:** none.

**Minor:**
1. The real-Desktop-listing check (`scripts/regions-selftest.mjs`) has no tolerance for legitimate concurrent user activity; a file Sergei saves mid-run always reads as a check failure requiring manual triage, with no annotation distinguishing "noise" from "regression." Route: Ender (test-infra quality, not a correctness bug).
2. The self-test runs with native occlusion detection disabled in `--fallback` mode, which is an honest, disclosed gap (TechPlan §8.3, Pending Real Input item 3) rather than a new finding — a real repaint-under-occlusion failure on the fixed code would not be caught by this gate today. Recommend first real-input priority next away window.
3. Mutant-granularity (3/3) and the literal z-order window-count (699→699, 703→703) were not independently re-measured in this pass (time budget); accepted on Ender's report with only indirect corroboration (see table and z-order section above).

## Pattern alerts

- **CRLF scare, self-inflicted and self-corrected.** Mid-pass, I ran `git stash`/`git stash pop` on the 4 pinned files to build a true HEAD-only comparison variant without disturbing the fix. This repo's `core.autocrlf` rewrote 3 of the 4 files from LF to CRLF on the pop, which changed their sha256 even though `git diff` showed zero content change. I caught this via a hash re-check (per the brief's instruction to verify before and after any risky step), normalized back to LF (`sed 's/\r$//'`), and re-verified all 4 hashes matched before continuing. Anyone re-verifying these hashes after a `git stash`/`pop` on this repo should expect this and normalize line endings before treating a hash mismatch as a real content change — it can look exactly like tampering and isn't.
- **Probe-mode baseline comparison needs the right commit.** My first attempt at the "old 53/115" comparison used `3467e5c` ("M3 as built"), which is the wrong baseline — it predates the M3 fix pass (`3eb08d9`) and has only 102 checks total, not 115. The correct baseline is HEAD's own pre-F2 state (same commit as the pinned snapshot, with only `region-host.js` and `regions-selftest.mjs` reverted to their committed HEAD versions). Worth noting in the TechPlan if this comparison is ever redone, so the next person doesn't repeat the wrong-commit mistake.
- **`dist/win-unpacked` is a shared, mutable scratch surface.** I rebuilt it three times during this pass (HEAD-only, back to fixed, HEAD-again-for-baseline, back to fixed) to get true byte-identical comparison builds. Each rebuild was verified via asar-extract-and-diff against the worktree `src/` before and after. It was left, at the end of this pass, holding the pinned fix (confirmed). Anyone else building into this same worktree concurrently would race this.

## Pending real input (next away window — not run here, per the hard limits on real OS input)

Carried forward from TechPlan §8.3, unchanged by this pass:
1. A real click on a fallback region (activation, first-click-not-swallowed, typed-letter filter, Ctrl+Right, F6).
2. Real hover and `:hover` under the real cursor.
3. The regions on screen as Sergei actually sees them, including a region uncovered after being covered (the occlusion-repaint gap named above — now the top-priority item given this fix's shape).
4. Click-to-raise, and Win+D (pending Sergei's ruling on fallback-regions-stay-up-on-Win+D; out of this pass's scope by instruction — the fix did not change this behavior, confirmed by diff).
5. Attached mode: a region rebuilt while hidden, shown by the real hotkey, paints and takes a real click.

Design/story flags: none.
