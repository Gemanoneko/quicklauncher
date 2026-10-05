# QuickLaunch QA: M-1 header-surface fix (Futaba, 2026-10-05)

**Verdict:** GO

Slice under test: the uncommitted fix to `base.css` (comment), `persona-3.css`, `persona-5.css`, `siren.css` on `wip/theme-fidelity` HEAD `7981d51`. Answers my own M-1 and m-5 from `QuickLaunch_QA_FullscreenRemoval_2026-10-05.md` and Judy's M-1 addendum. Condition: the verdict covers exactly the pinned hashes below; the fix is NOT committed, so it is a tested working tree, not a committed build. Sully must commit exactly these 4 files, then re-check the hashes, before this counts as a pipeline precondition.

Design/story flags: none for design or story. Judy-routed doc drift is in m-1, m-2 and m-3; the narrow-width observation is in m-4.

## Pin (sha256, first 12 hex; checked before the run, after the run, and against a copy in `futaba-m1fix/pin/`)

| File | Hash |
|---|---|
| `src/renderer/styles/base.css` (comment only) | `6d002db98c02` |
| `src/renderer/styles/themes/persona-3.css` | `c2fbc8336d9e` |
| `src/renderer/styles/themes/persona-5.css` | `901a419711b0` |
| `src/renderer/styles/themes/siren.css` | `dd3632e6a9d9` |

`git status` shows only these 4 files modified. HEAD is `7981d51` before and after.

## Census (Electron and QuickLauncher processes)

| | Before | After |
|---|---|---|
| `QuickLauncher.exe` (Sergei's, `AppData\Local\Programs\QuickLauncher`) | 4: 23324, 30760, 31752, 41564 | the same 4, untouched |
| `electron.exe` from `QuickLaunch-regions-spike` (Judy's gallery) | 6 | 6 (different PIDs; her gallery churns; not touched) |
| `electron.exe` from this repo | 0 | 0 |

My renders ended with "0 left" in every run's own report. No window was shown or focused, there was no hotkey, and each run used its own profile. The gallery guards read 0 across the board and the registry was unchanged. My own chip probe (`futaba-m1fix/chip.cjs`) is offscreen and non-focusable, with its own profile under the scratchpad. It ran no real input and no display-setting calls.

## Ender's claims, reproduced

Method: gallery renders of the live tree and of snapshots (`--ref`), 101/101 themes each, 424x300 at 1.5x, software raster. Also 520, 423 and 300 wide. The scripts are in `scratchpad/futaba-m1fix/` (`cmp.py`, `shift.py`).

| Claim | Result |
|---|---|
| Shifted-HEAD (`ca2e740` vs live), the 40-theme list, tol 0 | **Reproduced.** persona-5, siren and persona-3 read 0. |
| Shifted-HEAD, the 40 themes, tol 12 | **Reproduced.** Only parasite-eve (767), promise-mascot (108), gryffindor (70) and doom-eternal (51) are non-zero, to the pixel, and match Judy's numbers. |
| The other 37 themes are byte-identical to `b67b82f` | **Reproduced and widened.** In `7981d51` vs live, only persona-3, persona-5 and siren differ, in `grid` and `hover`. The other 98 of 101 themes are byte-identical in all 3 states, including settings. This holds at 424, 520, 423 and 300. `7981d51` differs from `b67b82f` only in docs. |
| `npm run check` exits 0 | **Reproduced.** check:contrast passed. check:hover reported 101 themes, 3838 pairs, 0 errors, 0 grandfathered. All 4 positive controls fired. Registry unchanged, 0 processes left. `git status` shows no baseline file changed. |
| `node --test` 11/11 | **Not as stated.** I get tests 12, pass 12, fail 0. Likely Ender counted 11 test cases and the 12th is the file-level entry for `stub-electron.js`. Minor (m-5). |

## M7.4 pixel checks (live, 424)

- **persona-5, shards and saw.** Art spans 203.33 to 287.33 css. Plate fill is 292 and the saw is at 291.33 to 301.33. The shards sit on black and the last red tip ends about 4 css px before the saw. The saw is 10 px clear of the first button (311.33). PASS. The same relations as `ca2e740` read 0 differing pixels at tol 0.
- **siren, seam glyphs.** 屍 is left of the seam and 人 is right of it, with about 4 px clear on each side. The seam is at 244.67 to 246.67 and the gradient stop is at 245.33. HEAD had both glyphs on the cold side. PASS, and the design intent is restored.
- **persona-3, clock and bars.** The clock is wholly on the bright block, 10 px or more from the seam. The bar tips cross the seam and the roots stay on the bright side, exactly as in `ca2e740` (0 pixels differ at tol 0). PASS.
- **14-character filter chip** (`ABCDEFGHIJKLMN`, my own probe against live and HEAD snapshot):
  - persona-5 chip spans 134.42 to 278.49. It sits wholly on black and clears the plate edge (291.33) by 12.8 px. In HEAD (`7981d51`) the same chip crossed onto the red field, so the fix works.
  - A 30-character filter (max-width clip with an ellipsis) ends 4.9 px before the plate edge. Still on black, but tight.
  - siren: the seam line is hidden by the existing `:has(#filter-chip:not(.hidden))` rule. The warm/cold channel boundary at 245.33 runs behind the chip, same as HEAD. Looks fine.
  - persona-3: the chip straddles the slanted seam, same as before. Fine.

Compare sheets in `scratchpad/m1/ender-compare/`: I read the manifest. Ender's "after" is `live@7981d51+uncommitted` with the same 4 dirty files, and only `persona-3`, `persona-5` and `siren` show a grid diff. I looked at the three themes through my own crops (`futaba-m1fix/m74-headers.png`, `chips.png`) instead of rehashing his sheets, and they agree.

## Widths

- **424**: as above.
- **423** (art hidden by `@media (max-width: 423px)`): live and HEAD are identical for 98 of 101 themes. The 3 changed themes keep their surfaces: seam, plate and saw sit where the art would have been, with no art on them. Fine, no collision. Chip positions are within 0.4 px of 424.
- **520**: persona-5 reads 7 px over 12 levels, siren 0, persona-3 0, as Judy predicted. In persona-5 the art and the 14-character chip land on the red field. In HEAD it was the same, and the fix does not make it worse or better (m-4).
- **300**: see m-4.

## Findings

### Blocker
None.

### Major
None. M-1 (persona-5 art on red) and m-5 (siren seam) are closed on pixels at 424 and 423. persona-3 is also closed, at 0 pixels differing at tol 0.

### Minor
- **m-1 (doc drift, Judy).** Her M3 says the long filter chip now "ends about 40 px before" the saw. Measured: 12.8 px for 14 characters and 4.9 px for the longest chip, which is where HEAD already was (about 5). The chip stays on black at 424, but the claim is wrong.
- **m-2 (comment drift in `base.css`).** The new comment says all three surfaces "carry the same 35.33 px as the art". persona-3 carries 34.79 (the stop is measured along the 100-degree line), and persona-5's plate fill is 292, not 291.33. The comment will mislead the next person who "moves them by the same amount". Needs a line in the comment, or a pointer to the Judy addendum.
- **m-3 (no in-file markers).** The pixel-tuned values (270.79, 292, 244.67) have no rationale next to them in the theme files. The only record is Docs (the Judy addendum M4). Siren got a comment update, but persona-3 and persona-5 got none.
- **m-4 (narrow and wide windows, accepted by Judy, not new).** The surfaces are left-anchored and were only ever composed for 424.
  - At 300 wide: persona-5 shows all 3 buttons on the black plate (the minimize button loses its red field, glyph still readable). The siren seam cuts through the settings button. The persona-3 slant cuts through the minimize button. HEAD had the same class of collision, one button over.
  - At 520 and up: persona-5's art and chip sit on red.
  - minWidth is 180, so a user can reach these. Sergei's saved size is not known to me. Worth routing to Judy.
- **m-5 (claim mismatch).** `node --test` is 12/12, not 11/11.

## Process notes

- Everything was tested on a pinned, uncommitted tree. A commit that is byte-identical to the pin carries this verdict. Any other commit needs a re-hash.
- Judy's "40-theme list" is not the full roster (101 themes). The 61 others have no header art. On a shifted-HEAD read they differ at tol 12 (up to about 2,160 px), but they are byte-identical between `7981d51` and live. The shift test is not meaningful for them, since their gradients and textures do not shift. Her static read of all 101 files covers them. I did not independently verify her claim that no other theme has left-anchored geometry. Only the 3 changed themes plus the 40-list were judged on pixels.

Pattern alerts: (1) A bulk offset edit moved one constant for the art and cluster, and left-anchored surfaces drawn against the art were missed twice, once by the gap metric and once by the review. The all-theme pixel shift test is what found them, and it should stay in acceptance for any bulk header offset edit. (2) Hand-tuned sub-pixel constants (270.79, 292, 244.67) with their rationale only in a doc will drift at the next move. (3) Harness counts and prose figures in handoffs (11/11, "about 40 px") were wrong in small ways, so measure rather than copy them.
