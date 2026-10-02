# QuickLaunch QA: 56-theme hover and pressed fix + `check:hover` gate (Futaba, 2026-10-02)

**Verdict:** GO

Pattern alerts: none

Scope: Ender's uncommitted hover/pressed fix and the new `check:hover` gate, tested before Sully commits (ProcessRules § Sergei is not QA). Spec: `Docs/QuickLaunch_HoverFix57_Spec_2026-10-02.md`. Futaba flags only; nothing was fixed and no git write was made in the repo.

Short version: the gate passes the fixed tree, fails the unfixed HEAD with exactly 56 themes / 350 pairs, fails on every mutation I built (bad hover colour, removed opt-out, new failing theme, removed base rules), reads identically on every run, and only ever deletes baseline entries. No Blocker, no Major. Eight Minor findings and one separate out-of-scope observation (F8, pre-existing). Real-mouse checks and the real-app Close/Quit are listed under "pending — next away window".

## 1. Receipt (pinned before the first run; re-verified after the last)

- Repo `WIP/QuickLaunch`, branch `wip/theme-fidelity`, HEAD `c5caaf0e3cec1400c14baffd58c879db9199f60b`.
- `git diff --stat` at start: **19 files changed, 326 insertions(+), 58 deletions(-)**; untracked: `scripts/theme-gallery/hover.cjs`, `scripts/themes-hover-baseline.json`, and Judy's `Docs/QuickLaunch_SkinPicker_Behaviour_Spec_2026-10-02.md` (ignored as instructed).
- Dirty tracked set at start = exactly the 7 non-theme files + 12 theme files named in the brief. No other tracked file was dirty (so no STOP).
- At the end, `git diff --name-only` shows one more file, `Docs/QuickLaunch_HoverFix57_Spec_2026-10-02.md`: Judy's note, ignored as instructed. All 21 SHA-256s below re-verified **21/21 OK** at the end.

```
7fab482eea23038c8cc86292f0fc1e8bb6f01f632fece43d3cb38fa0435b603a  scripts/theme-gallery/hover.cjs
ca3d163bab055381827226140568f3bef7eaac187cebd76878e0b63e9e442356  scripts/themes-hover-baseline.json
1ae89d01a5ef489480678a5b42ea5cde8b47cbfc39987480a549a82067256b32  scripts/theme-gallery/run.mjs
e7c1f5648c003456914d1bebdec8227a0ce429f09aaf5fba40040f30eb55a2cf  scripts/theme-gallery/main.cjs
c0af53c32d43ecae99d533dda56df42cd5153ec85018a3e5300ccafe259ac719  scripts/check-theme-contrast.js
cd11d9c33f8eb4ecccfe9cb04c852ba713cf3b523ae89a3266c48b848eac6c07  scripts/themes-baseline.json
20a2c2a643ad16ca3db5f78491ea3380716ec6cdb14260fa3e40856bc452cd07  package.json
cb8d9e8c6c35c599ff2c36b6b3f2964e42ac6a4042f7454a1b40392dd0913e24  Docs/QuickLaunch_Brief.md
19aaaf08aab54b983188964462af9b5a623b8d859f3267e0904eb3ee86a0da8d  src/renderer/styles/base.css
7b44836358470b00394a67f67345e1dbd218f7b50400c2fd382a6580b8a45e16  src/renderer/styles/themes/2001.css
c39d4756dc5b1350181639b438e6975f4b25791ff3815250da254816c28adac7  src/renderer/styles/themes/promise-mascot.css
701dc8b3387f7e20597124b6a008526ceff8907958ad5179e8fcbfad4e727b0c  src/renderer/styles/themes/star-wars-republic.css
934e88659dffd4bce0a320c73a5917e3b70c0faf44cad87d548b1eccf8eb506e  src/renderer/styles/themes/dune.css
98ea45caa4904aee220e759a01b2018a7728791d553e0d78b4fd993afbfc1baf  src/renderer/styles/themes/stranger-things.css
9d31d89c308e8c99f27c9e320f0ed690f7d7c9049cdc3391a05995b9a271f01d  src/renderer/styles/themes/yakuza.css
d737adfade071f129ab13a0012910e3b8c459bf6c17f15dcb6080bcb29db5e97  src/renderer/styles/themes/shire.css
79ca7d067e6df7ecd6c7a586cbedc570fe7b3ffb97694f2ffe2de2d1a0e3cdf3  src/renderer/styles/themes/siren.css
1c52cc46416cb7e11cf53077ad475a8dfc19f511faeed08b637626acc5231068  src/renderer/styles/themes/ff9.css
fc1ef9bdbfc8325c1b3db9abd25bdeb817c86a8a5c7c436f52df00281c370955  src/renderer/styles/themes/mirrors-edge.css
7a897cbd18cef88915ce161eee3e4c8f53ffce5daa3499855dba2e3ddebd3e84  src/renderer/styles/themes/portal.css
e0eadd6e80bc5b4434c290fe22199b02bfa8db4cd22abec08adc987c86129a65  src/renderer/styles/themes/silent-hill.css
```

Caveat on "committed build": this build is uncommitted by design (Sully commits on my GO). It is pinned by the hashes above instead of a commit. Mutation tests ran only in scratch copies; the first scratch copy read identically to the real repo (control S0), so they are faithful.

## 2. My own counts and how I counted

| Check | Result | Method |
|---|---|---|
| `npm run check:hover`, runs 1 and 2 | **101 themes, 4,040 pairs measured, 0 errors, 0 grandfathered**, exit 0, PC1 fired at 1.65:1 (<2), PC2 fired at 2.32:1 (<4.5) | Printed summary, **and** recomputed from `hover-readings.json`: 4,040 rows, 101 themes x 40 rows, 40 distinct pair ids, 0 rows with an error, 0 rows with ratio < floor (verdict recomputed from `ratio` and `floor`, not from the gate's `fail` flag; flag and my recomputation never disagreed) |
| Lowest passing readings | label **4.565** (`ff6 edit-add-file/pressed`, pre-existing, flagged in spec), glyph **3.466** (`metal-gear tile-remove/hover`) | same JSON |
| `npm run check:contrast` | **101 checked, 0 errors, 32 legacy warnings**, exit 0 | counted 32 theme bullets, no `ERRORS` section; recomputed the 4 changed baseline hashes (`dune`, `mirrors-edge`, `portal`, `silent-hill`) with the tool's own CRLF-normalised hash: all match; only those 4 entries differ from HEAD's baseline |
| Before (unfixed HEAD, `--ref c5caaf0`) | **350 failing pairs in 56 themes** | JSON recount. The gate exits 2 there (VOID) because PC2 cannot fire at HEAD (no band, no opt-out line): expected |
| Against spec Appendix A | per-theme failing-pair counts match for **56/56**; "worst now" pair is within 0.05 and the same label colour for 56/56 (ff9 is named `/active` in the spec, `/pressed` in the gate; 4.39 to 4.73 confirmed by eye on its sheet). "After" values differ from the spec's Edge numbers by up to 0.08 (Electron round trip, all pass; informational) | script over the spec table |
| Before vs after, all 4,040 readings | **419 readings changed in 61 themes** (hover 204, pressed 157, rest 58); **350 pairs fixed; 0 pass-to-fail; 0 readings got a lower ratio; 40 themes unchanged** including `2001`, `promise-mascot`, `star-wars-republic`, `star-wars-separatist`, `persona-3`, `persona-5` | JSON diff of label, fill and ratio per theme/pair |
| Timing | 35.5 s and 34.9 s quiet; 62.7 s while my window sampler ran; 105.7 s with `--processes 2 --concurrency 3`. All under the 180 s limit | wall times printed |

The 58 "rest" readings are all `skin-row-active/rest` and `skin-row-selected/rest` (29 each), see F6.

## 3. Can the gate fail? (red-team, scratch copy, one change per run)

| # | Mutation | Result |
|---|---|---|
| M1a | `cyberpunk` `--btn-hover-bg:#8A8A8A` | exit 1, 6 label pairs at 3.45:1; the glyph pairs (floor 3) correctly pass |
| M1b | same break on `--btn-active-bg` | exit 1, 6 `*/pressed` pairs |
| M1c | theme's own `#btn-done-edit:hover { color:#4a4a4a }` | exit 1, `edit-done` hover and pressed 1.87:1 |
| M2a / M2b | `promise-mascot` / `star-wars-republic` lose `--hover-label-floor: 0` | exit 1, **8 pairs each** (spec said 8) |
| M2c / M2d / M2e | `mirrors-edge` loses its ceiling / `portal` loses the two end-of-file rules / `silent-hill` loses its ink | exit 1 each (DONE, CLOSE, name, rows / update and chip pairs / header glyphs 2.28 to 2.57) |
| M2f | `dune` floor 0.70 changed to 0 (opt-out misused on a dark theme) | exit 1, 4 pairs (2.58 and 3.03) |
| M2h | band default removed from `base.css` (floor 0) | 192 errors in 41 themes, exit **2** (PC2 voids as the band is gone). Still blocks, see F4 |
| M2i | remove-button cap removed from `base.css` | exit 1, **30 errors in 15 themes** (spec: 30 pairs, 15 themes) |
| M3 | two brand-new themes (dark with bad hover; light copy of 2001 without opt-out), registered as a real theme is | 103 themes x 40 = 4,120 measured, 14 errors (6 + 8), exit 1 |
| M3c | two new themes done right | 4,120 measured, 0 errors, exit 0 |
| M3 (unregistered) | new CSS file with no `THEME_BANNERS` entry | exit 2 VOID, cryptic message, see F3 |
| Controls | `--neuter-control=pc1`, `pc2`, `pc1,pc2` | exit 2 each, naming the control that did not fail |
| P1 | `2001.css` itself loses its line | exit 1, 8 errors, PC2 fires |
| P2 | `2001.css` line respelled `0.0` | exit 2 (PC2 voids), see F4 |
| R1 | smooth horizontal gradient hover fill, white label | **exit 0, passes** (blind spot, F2) |

`--rebaseline` can only delete:

- Baseline `{}` plus a failing theme plus `--rebaseline`: exit 1, "removed 0", the file's SHA-256 is unchanged. It did not add the 6 failing pairs.
- Mixed baseline (1 failing, 2 passing, 1 non-pair id, 1 unknown theme): removed exactly the 4 non-failing entries, kept the failing one, and added none of the 5 other failing pairs.
- Rebaseline on a VOID run (PC1 neutered): "skipped: the run is void", file bytes unchanged.
- Refused before anything starts, exit 2: `--rebaseline --only`, `--rebaseline --ref`, an unknown `--neuter-control`, `--scale`, `--gpu`.
- Baseline malformed (5 shapes) or missing: exit 2 REFUSED, naming the reason.
- Hand-edited baseline listing the 6 failing pairs: exit 0 with 6 grandfathered (the sanctioned route; the JSON diff is the control). Same pairs listed under the wrong theme: exit 1.

Other checks:

- `npm run check` on a clean tree: exit 0, both gates ran. With a hover-only break: contrast passes, hover fails, exit 1.
- `--only dune,yakuza`: 80 readings identical to the full run (0 differ). `--only nope`: exit 2.
- **Deterministic.** Four full runs (4 processes x 6 windows twice, 2 x 3, and one with my sampler running) are identical across all 4,040 readings: label, fill, ratio, text box, controls (SHA-256 of the stripped JSON `941889a79d39...` all four). A CRLF checkout of the renderer (what an autocrlf checkout gives) reads identically too.
- Button coverage: all 14 static buttons in `index.html` plus the remove, update and dismiss buttons created in `app.js` are in the 17-button target list. Nothing missing.

## 4. Eyes (real renderer, Electron 32.3.3, offscreen, forced states)

I patched a scratch copy of `hover.cjs` to save the crops (additions only; readings in that copy were identical for all 19 themes except `cyberpunk`, which still carried my R1 mutation, and re-run clean). 19 themes x 11 states, three images each (rest, before, after), 3x nearest-neighbour: the 12 edited themes plus `twin-peaks`, `hogwarts`, `control`, `alien`, `tomb-raider`, `cyberpunk`, and `star-wars-separatist`. 418 crops. I viewed 16 contact sheets in full; `promise-mascot`, `star-wars-republic` and `star-wars-separatist` are byte-identical before and after, so I did not view them.

What reads well:

- **Pale themes** (`mirrors-edge`, `portal`, `silent-hill`): plain buttons go from white on pale (1.6 to 2.3:1, unreadable) to dark ink; DONE and CLOSE darken to deep red, orange-brown and deep blue; update button and chip read clearly. They look like their themes.
- **Light opt-out themes** (`2001`, `promise-mascot`, `star-wars-republic`) and `star-wars-separatist`: every crop is identical to before, as specified.
- **Translucent and textured** (`alien`, `control`, `tomb-raider`, `cyberpunk`, `shire`, `siren`, `yakuza`, `ff9`, `stranger-things`): legible, hue family kept. The remove button's hover fill steps one shade darker and the white X stays clear. `ff9` pressed (4.39 to 4.73) is imperceptible and fine.

What looks off-theme: see F5. Not a gate matter; Judy's and Jane's call.

## 5. Nothing outside hover and pressed changed

- Static: `base.css` diff is exactly the three edits of spec 2.2; each theme diff is only the lines of spec 2.3 (12 theme files, +22 lines); `package.json` adds two scripts; `check-theme-contrast.js` gains an export and a `require.main` guard (only `hover.cjs` requires it); `main.cjs` changes only under `cfg.hover` and the IPC allowlist for hover mode. No `src/main` file touched.
- Readings: every changed pair id is a hover/pressed pair or the arrow-cursor and current-skin rows (F6). `tile-label/hover` (non-edit) did not move.
- Gallery pixels: full `gallery:themes` run before (`--ref c5caaf0`) and after (live tree): **303 of 303 states (grid, settings, tile hover x 101 themes) pixel-identical**. Positive controls: 101 distinct grid hashes, hover differs from grid in all 101, and the after-run saw the 14 dirty `src`/`package.json` entries.
- Crops: **203 of 209 rest-state crops are byte-identical**. The 6 that differ are the skin-list crops of `control`, `dune`, `mirrors-edge`, `portal`, `silent-hill` and `twin-peaks`, where the cursor and current-skin rows lift (F6).

## 6. Machine safety and leak count

- Offscreen only: windows `show:false` and `focusable:false`. Guards on every run: login-item 0, global-shortcut 0, show 0, focus 0, dialogs 0, blocked requests 0, media 0, stubs intact 92/92, IPC outside allowlist 0, sockets 0, registry unchanged.
- Independent of the gate's own counters: during one full run I enumerated every top-level window owned by the gate's `electron.exe` processes with user32 (`EnumWindows`, `IsWindowVisible`): 47 samples, 36 distinct processes, up to 56 top-level windows at once, **0 visible**, and the foreground window was never ours.
- Temp profile: the gate and gallery use their own `--work` folders (mine under the scratchpad); nothing touched `%APPDATA%\QuickLauncher`. Sergei's QuickLaunch was not running (0 `electron.exe`, 0 `QuickLauncher.exe` before and after), so there was no lock or hotkey collision to watch.
- Headless browser: used only through `scripts/qa/headless-browser.mjs` (`launchHeadless`, two launches for contact-sheet screenshots, each printed "lease closed"; `list` before and after: no leases).
- **Leak count: 0.** Method: (a) PID snapshot of `electron`, `msedge`, `chrome`, `chromium`, `QuickLauncher` before and after (before: 57 `chrome.exe`, 0 `electron.exe`; after: 55 `chrome.exe`, 0 `electron.exe`, 0 `msedge.exe`, no new non-chrome PID); (b) a CIM command-line marker search for `illuminati-headless`, `hover56-qa`, `qlg-config`: 0 matches (the `chrome.exe` processes are Sergei's own browser); (c) every gate run's own "0 left" line; (d) `headless-browser.mjs list` empty. One stray of mine: a `python.exe -` from a botched heredoc in one of my own commands, ended by stopping its background task, verified gone. Nothing else was killed.
- My own housekeeping slips: a few throwaway text files went to the MSYS `/tmp` instead of the scratchpad, and one scratch `rm -rf` was denied by the permission system, so scratch folders were left in place.

## 7. Close and Quit

- **Real app: not launched.** There is no packaged build of this uncommitted tree, and a packaged launch puts a window and tray icon on Sergei's screen while he is at the PC. Listed under pending. Risk is low: the diff touches no `src/main`, window or close code, only renderer CSS and test scripts.
- The test harness itself: every run ended its Electron processes (**0 left** each time, 36 started per full run) and the registry was unchanged.

## 8. Findings (Blocker / Major / Minor)

No Blocker. No Major in this build.

- **F1 Minor. The gate is not on the release path.** Spec § 5.6 (and 2026-10-01 § 2.6) say `prebuild` runs `check`. `package.json` `prebuild` still runs `check:contrast` only; the Brief says "Not in prebuild yet (Sergei's call)"; `pack` and `scripts/release.mjs` do not run it either. Effect: `npm run build` can ship a theme that fails hover legibility. Dual clearance covers it only by hand. Disposition: decision for Jane to put to Sergei (wire it, or record the deferral).
- **F2 Minor. Smooth-gradient blind spot (R1).** A horizontal gradient hover fill (`#000` to `#fff`) with a white label reads 17.04:1 and passes, because only the modal colour (and any colour over 20% of the box) is judged. No theme triggers it today (the only hover gradients are vertical tile gradients in 8 themes). Disposition: accept and record in the Brief's "Revisit when", or defer.
- **F3 Minor. Cryptic VOID for an unregistered theme.** A theme CSS with no `THEME_BANNERS` entry in `app.js` gives exit 2 "skin list has no current-skin row or fewer than 3 rows". It fails closed; the message does not say what to add. Disposition: defer.
- **F4 Minor. PC2 is coupled to one spelling.** It strips only a line matching `--hover-label-floor: 0;` from `2001.css`. A harmless respelling (`0.0`) voids the run (exit 2), and removing the band from `base.css` also reports exit 2 rather than 1. Both fail closed and both block. Disposition: accept.
- **F5 Minor (visual, Judy's call). Salmon lift on the deep reds, plus a few others.** Legible and in the same hue family, but the hover label turns dusty pink-beige beside a red or orange border and glow, and reads less vivid than the rest label:
  - `twin-peaks` CLOSE `#880000` to `#BF756A`;
  - `hogwarts` DONE/CLOSE `#8B2810` to `#BB7969`;
  - `dune` DONE/CLOSE `#C04000` to `#DB8467`;
  - `portal` DONE vivid orange to brown `#7D2E00` on its pale tint.
  Spec § 7 names `event-horizon` and `mortal-kombat` as the same case; I did not view those two. Separately, `stranger-things` remove hover is a steel blue-grey `#6B87B5` (3.65:1): the blue is the theme's own pre-existing choice, the fix only darkened it. Disposition: Jane and Judy decide; the spec already offers a one-line alternative.
- **F6 Minor (scope, needs Jane's yes). Two non-pointer states changed.** The current-skin row (`.selected`) and the arrow-key cursor row (`.active`) now lift in 29 themes while the skin list is open (58 readings). Spec 2.5 flagged this and chose to keep it; Ender built it as specified. It is the only visible change outside hover and pressed.
- **F7 Minor (spec text).** § 3 says `persona-4` has 0 changed readings; it has 2 (`tile-remove` hover and pressed, it is one of the 56). Appendix B says 15 readings; I count 14. The spec's headline figures (350 pairs in 56 themes, 419 readings in 61 themes, 8 pairs per missing opt-out, 30 pairs in 15 themes for the remove cap, 101 checked / 0 errors / 32 warnings) all check out.
- **F8 Major, separate item, pre-existing at HEAD, not a condition of this GO.** The full `gallery:themes` run **fails 14 of 101 themes** with "banner is not quote #1": `blade-runner`, `broken-sword`, `dragon-age`, `evangelion`, `event-horizon`, `fatal-frame`, `game-of-thrones`, `half-life`, `hufflepuff`, `lcars`, `lovecraft`, `ravenclaw`, `slytherin`, `uncharted`. It reproduces with pure HEAD `c5caaf0` code (scripts and renderer) and is identical before and after this change. `--compare` refuses unless both runs PASS, so batch sign-off images for these themes will be blocked. Not caused by this build. Disposition: Jane to schedule a separate fix. In the same run I noticed that HEAD's `run.mjs` silently ignores `--only a b` (space form) and renders everything; the new build supports it.

## 9. Pending — next away window (needs Sergei's stated away window)

1. Real mouse and key input in the real app on `control`, `dune`, `mirrors-edge`, `silent-hill`, `alien` (spec § 6): hover DONE, open the skin list and arrow through it, hover a tile remove button, press a plain button, press INSTALL NOW.
2. Close button and tray Quit from each top-level screen, confirming the `QuickLauncher.exe` process exits, using `scripts/qa/quicklaunch-safe-launch.mjs` on a packaged build of the committed change.
3. Jane's own screenshot of the running tool (ProcessRules: no visual change reaches Sergei on a headless GO). My crops are the real renderer in the app's own Chromium 128, which also confirms spec § 2.2's one unverified assumption (relative colour syntax works in Electron 32; e.g. `dune` DONE reads `#DB8467` there), but they are not the packaged running tool.

## 10. Where things are

Scratch (nothing in the repo): `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ee1f77cf-5889-412e-b022-29b9109a8847\scratchpad\hover56-qa\`

- `run1` to `run4`, `ref-head`, `m\` (every mutation's stdout and readings).
- `sheets\*.png` (contact sheets), `eyes\before` and `eyes\after` (crops).
- `gal-before`, `gal-after` (gallery runs).
- `pin-sha256.txt`, `ql\` (scratch copy used for mutations).
