# QuickLaunch QA: hover gradient gate, gallery banner fix, picker Part C, 2026-10-02

Futaba. Asked by Jane under ProcessRules § Sergei is not QA, before Sully commits. Read red-team: the job was to try to break the tooling and to use the picker the way Sergei would. Nothing in the repo was edited, staged, committed or pushed; this file is the only thing I wrote in the repo and it is left uncommitted. The regions worktree was not touched. A first attempt stopped on the spend limit right after the tree check; this is the full pass. The tree was re-confirmed after the resume (section 1).

## Verdicts

Two builds, two independent verdicts.

### Build A: tooling (`check:hover` gradient detection, `gallery:themes` banner fix, Brief row)

**Verdict:** GO

GO for Sully to commit the four tooling files below. Blockers: none. Majors: none. Minors: three (A-F1, A-F2, A-F3). Every number Ender reported reproduced or was bettered, and the one gap I found (a hard-edged fill exactly equal to the label colour is never judged) hides nothing on today's 101 themes: 0 of 3,776 readings that have strong ink pixels have any of them invisible.

### Build B: picker Part C (`app.js`, `base.css`)

**Verdict:** GO

GO for Sully to commit the two picker files below. Blockers: none. Majors: none. Minors: one (B-F1, a cost the spec already accepts). F1, F2 and F3 behave as the spec says on two runtimes, the earlier picker and Esc behaviour is unchanged, and every probe fails on HEAD where it should. One thing I cannot measure headless and have listed for the next away window: the click count a real OS double-click delivers (section 7).

Pattern alerts: 1 (section 6).

## 1. Receipt (the pin)

| Item | Value |
|---|---|
| Tool / version | QuickLauncher **1.94.3** (not bumped; unreleased work on the branch) |
| Branch / HEAD | `wip/theme-fidelity` / **`7160cfe`** (`7160cfe97f3f6e176e128cc443ba26cbcdcb9886`) |
| Dirty set | exactly the 6 named tracked files, nothing else: `git status --porcelain` = 6 lines at the start, after the resume, and at the end (writing this report then adds it as one untracked line) |
| Entry-check script | `Entry-check receipt: quicklauncher v1.94.3 @ 7160cfe (dirty: Y) — pre-qa n/a, post-build n/a, check-electron n/a, check pass, test:smoke n/a` |
| `src/main` | not in the diff: the tray, window, store and IPC code is unchanged |

SHA-256 (taken first; re-taken after the resume and at the end, **identical all three times**):

```
00807411625b10c41101d60175d58e4671293000359a5b02832a1cfd6027949d  scripts/theme-gallery/hover.cjs
7123c8751237376619f3ebd4bb8c68af8caaa8c578640548964f9f4064b7bbe6  scripts/theme-gallery/main.cjs
4a433be58e8cdf7a582e6d22bf5c4ae6e711ef9b2f73be8928974ca036db8a81  scripts/theme-gallery/run.mjs
93951dea839177effb6d9a03d27a2c15408c2a8ebcf4befcb1ed2139f3b3fac2  Docs/QuickLaunch_Brief.md
293446f3409711e9e110c20769f3640815e3a51a5c0fe9cd3791974911b1da55  src/renderer/app.js
6a229de05db76efa0fa64a3d0557122e0dfd3733839a6d1d0a4be71f4c5b6f54  src/renderer/styles/base.css
```

`git diff --stat`:

```
 Docs/QuickLaunch_Brief.md       |   3 +-
 scripts/theme-gallery/hover.cjs | 259 +++++++++++++++++++++++++++++++++++-----
 scripts/theme-gallery/main.cjs  |  53 +++++++-
 scripts/theme-gallery/run.mjs   |  35 ++++--
 src/renderer/app.js             |  51 +++++++-
 src/renderer/styles/base.css    |  13 +-
 6 files changed, 363 insertions(+), 51 deletions(-)
```

Git prints "LF will be replaced by CRLF" for all six (working copies are LF); not a defect of this build.

**Snapshots, not the live tree.** Experiments that edit anything ran in two local clones of the repo under my scratch folder (`repo-build` = HEAD plus the 6 files, byte-verified against the pin; `repo-head` = HEAD), never in the repo under test; every scratch edit was restored and re-hashed. Behaviour tests of the picker ran from a copy of the working-tree `src` (`snap\build`, hashes equal to the pin, `diff -rq` against the live renderer at the end: identical) and a `git archive` of `7160cfe` (`snap\head`, the positive control). The only live-tree runs are `npm run check` (twice: inside the entry-check script and on its own) and the live-tree read of the files. **I did not run `npm run build` or `npm run release`.**

Machine load, sampled as per-process CPU rates over 3 to 4 s across all processes: 1.4 to 5.6 % machine-wide (32 logical cores) before every timed run. Sergei's QuickLauncher was not running (`QuickLauncher.exe` count 0 in every census).

## 2. Build A: the hover gradient gate

### 2.1 The gate on the live tree, my own counts

`npm run check`, run directly: **exit 0 in 41.2 s**.

- Contrast: 101 themes checked, **0 errors**, 32 legacy warnings (the same 32 as before).
- Hover: 101 themes x 40 readings = **4,040 pairs measured, 0 errors, 0 grandfathered**. PC1 fired (1.65:1), PC2 fired (2.32:1), **PC3 fired at 1.14:1** (`grad` candidate; without it 21:1). Guards: login-item 0, global-shortcut 0, show 0, focus 0, dialogs 0, blocked requests 0, media 0, stubs intact 92/92, ipc outside allowlist 0. Isolation: sockets 0, registry unchanged, 36 processes started, 0 left, 38.9 s.
- Ink-free capture taken for **581 of 4,043 readings (14.4 %)**: image layer 119, clipped ring 0, near the floor 60, ring over 2 % worse 402. 370 readings read from a gradient's worst point.

### 2.2 Ender's reported numbers against mine

| Claim | Measured |
|---|---|
| PC3 fires at 1.14:1 | **1.14:1**, identical in all 6 runs (live, three clone runs, `--ink-free-all`, stressed) |
| No newly failing themes; closest uncharted 4.59 | **0 new failures** on 4,040 readings. Closest of all readings: ff6, 4.565:1 (box candidate, identical on HEAD tooling). Closest read from the worst point: uncharted `tile-label-rename/hover` **4.587** (HEAD tooling read 4.837) and persona-4 `edit-done/hover` 4.682 |
| Runtime 39 to 44 s | **38.7 to 39.0 s** in the gate's own timer (wall 39.7 to 40.1 s) over 4 runs at 1.8 to 5.6 % load; HEAD tooling on the same roster 34.1 s (+4.6 s, +14 %); `--ink-free-all` 67.9 s |

### 2.3 A gradient hover that should fail, in a scratch copy

35 synthetic hover rules appended to `cyberpunk.css` in the scratch clone (white label on `#btn-add-edit:hover` unless noted), each run through the real gate with `--only cyberpunk`.

| Result | Variants |
|---|---|
| **Fails as it should (16)** | ramp black to `#808080` (3.95:1); ramp to `#777777` (4.48:1, just under); 135-degree ramp (2.71); vertical ramp with the label on the light part (1.27); radial centred (1.07); conic (1.54); hard split to `#ccc` (1.61, found by the flat candidate); `::after` underlay (3.69); dark label on a light-to-dark ramp (2.82); 30 px hotspot (1.19); 1-px checkerboard (1.92); invisible label (1.0); a ramp on an **ancestor** (`#edit-bar`, 1.56, found by the ring trigger); hard patch of `#f0f0f0` (1.14); 6-px ramp to white (1.23) |
| **Passes as it should (9)** | nothing added; ramp to `#767676` (4.54, just over); 3-px hotspot (ignored by design); 6 % speckle grain (13.6); 1-in-3 scanlines (17.9); underline; dashed low-contrast underline; 2 px `border-bottom`; flat fill |
| **Missed (2): see A-F1** | white label on a hard-edged patch of exactly `#ffffff` covering 44 % of the text box: **passes at 21:1**. The same with a 1-px ramp: passes |
| **Characterization (7)** | the documented gap (an ancestor-painted blob wholly inside the label's range rect): passes in a normal run, **fails at 1.14:1 under `--ink-free-all`**, so the audit mode does what the Brief says. Larger ancestor blobs and stripes were caught by the ring trigger, or by the button's own border in the ring |

One miss of mine, for the record: my first vertical-ramp variant read 7.94:1 and passed. That is correct, not a miss: an all-caps label's ink sits above the descender space, on the darker part of the ramp; the hard variant (label on the light part) fails at 1.27.

The gate's failure line names the cause: `#FFFFFF on #808080 (gradient, worst point; its flat fill reads 21:1) = 3.95:1 (needs 4.5:1)`.

### 2.4 Determinism and load

- Three clone runs plus the live `npm run check` run: **4,040 of 4,040 readings identical** (ratio, fill, source, ink reason, verdict, grad fill) in every pair of runs.
- The same gate with 8 below-normal-priority busy loops running (machine-wide CPU 28 %, sampled): exit 0, 49.3 s, **0 readings differ** from the quiet run, no capture failed to settle.
- **`--ink-free-all` against a normal run: 0 verdict differences.** 679 readings the trigger skipped read lower under it, by at most **3.02 %** (indiana-jones `edit-add-file/hover`, 17.49 to 16.96): never enough to cross a floor, since the trigger only skips readings at least 10 % above it.
- The three positive controls, each neutered on purpose (`--neuter-control=pc1`, `pc2`, `pc3`, all three): **exit 2, "VOID"**, naming the control. `--ink-free-all` outside `--hover-check` and an unknown control name are refused (exit 2).
- Baseline ratchet with gradient rows (scratch clone): empty baseline gives exit 1 and names both pairs as gradient failures; both grandfathered gives exit 0 with warnings; one grandfathered gives exit 1 on the other; stale entries are reported as "fixed"; `--rebaseline` removed exactly the 3 stale entries and left `{}`; on an empty baseline it adds nothing.

### 2.5 False failures from grain, underlines and the median window

- On the real roster, 0 false failures (0 failures at all). Against HEAD tooling 370 readings were lowered, none raised: median -2.1 %, p90 -6.1 %, max -39.4 %; 169 by 2 % or less, 52 by more than 5 %, 17 by more than 10 %, 4 by more than 25 %. The big drops are tile-label readings whose fill candidate is the same for the plain and renameable label (mass-effect 14.00 to 8.48 and 8.49 to 5.15 together), i.e. a real fill behind the label, not an artefact of the dashed underline.
- Control for the Brief's rejected alternative: I patched the median window to 3x3 in the scratch clone. It **fails `uncharted`** (1 error, exit 1); the shipped 7x7 gives 0 errors. The Brief's claim reproduces. (Its 3x3 *mean* claim I did not re-run.)
- Benign grain and underline variants above (speckle, scanlines, three underline and border forms) all pass: no false failure found.

### 2.6 A-F1: a fill exactly equal to the label colour is never judged

The worst-point judge only looks at pixels where the two captures differ (where the ink visibly changes the pixel). Where the label is byte-identical to the fill, the glyph pixel vanishes and the pixel is not judged. A smooth ramp to the label colour is still caught, because the ramp passes through near-white values where the ink differs (PC3 relies on that, 1.14:1). A **hard-edged** patch, or a ramp under about 1 px, is not.

Measured on this build, scratch clone, `#btn-add-edit:hover { background: linear-gradient(90deg,#000 0,#000 322px,#fff 322px) fixed; color:#fff }`: the label is invisible on the right 44 % of its text box and the gate reads **21:1, pass**. `--ink-free-all` reads the same, so the audit mode does not help (the hole is in the judge, not in the trigger). With `#f0f0f0` instead of `#fff` the gate fails it at 1.14:1.

Does it hide a defect today? I sized it on the real roster with a third and fourth capture (label painted magenta and green) to get an ink mask by colour, and counted ink pixels that are identical with the label on and off. A positive control (the hard white patch) shows **39.0 % of strong ink pixels hidden** while the gate passes it; a flat fill shows 0.0 %. On the roster, **3,776 readings have strong ink pixels and 0 have any hidden** (264 readings are too thin to have strong pixels). So: no theme is affected now. (A cruder variant of this check, judging every pixel of the range rect, flips 4 readings; those are pixels no ink touches, such as the corner of persona-5's skewed tile-label plate, so it is not a valid oracle and I do not rely on it.)

### 2.7 A-F2 and A-F3: numbers and wording that do not match what the gate does

- The Brief row and the code comments quote figures I could not reproduce: "about 12 % of readings; 44 s instead of 39 s" (measured **14.4 %**, **39 s instead of 34 s**), "`--ink-free-all` about 80 s" (measured **67.9 s**). The `run.mjs` usage text says a skipped reading "may read up to 2 % lower"; measured **3.02 %**, and `hover.cjs` contradicts itself (the comment says "off by under 2 %", its own parenthesis says "worst skip 3.0 %").
- The gate's summary line says "370 read from a gradient's worst point". That counts any reading where the worst point was strictly lower than the flat fill, so 169 of the 370 are lowered by 2 % or less, which is effectively the flat fill. Read at a glance it suggests 370 gradients.

## 3. Build A: `gallery:themes` banner fix

| Check | Result |
|---|---|
| `--self-test` | all controls fire, including the new one: `banner shows quote #1 of 3, expected #2, the first quote that fits the banner (quote widths 480/400, 300/400, 200/400 px)`; PASS in 14 s |
| Full run on the build (live clone = pin) | **101/101 clean**, 303 PNG, 84.1 s, guards 0, registry unchanged, 0 processes left |
| Banner picks | 14 themes expect a quote other than #1 (blade-runner 2, broken-sword 5, dragon-age 4, evangelion 3, event-horizon 2, fatal-frame 2, game-of-thrones 2, half-life 2, hufflepuff 4, lcars 2, lovecraft 3, ravenclaw 4 and two more); **shown equals expected in all 101**; waits at most 1 ms |
| BEFORE rendered with `--ref=7160cfe` | 101/101 clean (83.6 s), the 14 picks identical |
| `--compare` BEFORE against AFTER | **101/101 compared, every theme grid, settings and hover IDENTICAL** (303 of 303); so Build B changes no theme pixel in the gallery states |
| Snapshot from before the fit rule (`--ref=0c6658a^`), the four themes whose pick differs | PASS, `fitRule=false`, expected #1, shown #1: no false failure on a source without the rule |
| A genuinely wrong banner (scratch `app.js`) | fit rule removed: exit 1, four themes named; off by one: exit 1, all six named; text not one of the quotes: exit 1; picks the first quote that does **not** fit: exit 1; pristine control: exit 0 |
| No quote fits (scratch quotes 300+ characters) | app keeps #1, check passes (exit 0); the same with the app showing #2: exit 1 |

## 4. Build B: picker Part C

### 4.1 How it was tested

Real input only: `Input.dispatchMouseEvent` (with an explicit click count 1, 2, 3, as the spec's reference runs did), `dispatchKeyEvent`, `insertText`, over the page's own DevTools session. Nothing was shown, nothing took focus, no OS input was sent.

| Lane | What | Result on the build | The same on HEAD (control) |
|---|---|---|---|
| A | Headless **Edge 154**, started only through `scripts/qa/headless-browser.mjs`, the snapshot served over http on 127.0.0.1 so the shipped CSP applies | Part C **56 of 56**; earlier-behaviour regression **134 of 134**; Enter-bar pixels (A30) 4 of 4 | Part C 32 of 49 (the 17 that fail are exactly the F1, F2 and F3 rows); regression 133 of 134 (only X7, the old F1); A30e (HEAD has no bar) confirmed |
| B | The project's own **Electron 32.3.3 / Chromium 128.0.6613.186**, the shipped runtime, offscreen, `show:false`, `focusable:false`, counting stubs | **195 of 195**, 0 faults | 172 of 190: the same 18 differences (X7 plus the Part C rows) |
| 2 | QuickLaunch's real main process under unpackaged Electron 32, window parked off screen and never shown, fake tray that keeps the real menu | 14 of 14 launches clean (4.4) | n/a |

Counters across lane B: show, focus, focus events, app focus, login item, global shortcut, dialogs, media, window opens, blocked requests, permission requests, navigations: all **0**; stubs intact 23/23; HKCU Run keys unchanged.

### 4.2 F1: the double-click no longer reaches what the list covered

| Check | Result |
|---|---|
| C1, 63 double-clicks: BLAIR WITCH, CONTROL: THE BUREAU, DEAD SPACE x 7 list positions x press gaps 0, 100, 200 ms | **63 of 63 clean** (Edge and Electron): one save, list closed, field focused and empty, slider, checkboxes and hotkey field unchanged, nothing selected, nothing stuck `:active`, **no event with click count 2 reached the page** |
| C1, each of the other 100 skins as the picked skin | **100 of 100 clean** (Edge and Electron) |
| Positive control, HEAD, same harness | **21 of 21 leak** (slider, a checkbox, hotkey recording, the list reopening, focus lost) and 15 of 15 skin trials leak; the spec's reference run on HEAD was 163 of 163 |
| C2 triple-click, 5 skins | clean |
| C3 fresh click 150 ms later on REDUCE MOTION | the checkbox reacts; **control**: a deliberately wrong guard (swallows every press for a second) makes it do nothing |
| C4 slider 1.3 s later; C5 no pick, double-click on a label; C6 Enter pick then double-click the slider | slider moves; two toggles, state back; slider moves |
| C7 right-click on a row | no pick, list stays, no save; a later double-click elsewhere is normal |
| C8 pick, ArrowDown, click another row 0.2 s later | second pick lands (2 saves). New: a new gesture ends the guard (pick, single click on one label 50 ms later, then a double-click on another: toggles once, then twice) |
| Hygiene | window capture listeners: **+1 per type while armed, baseline again after 1.1 s**; 14 rapid picks: never more than +1, none left; drag from a row onto the slider and release: nothing moves; keyboard and wheel unguarded; a press on NO MATCHES arms nothing; no console error or exception |
| The documented cost (spec C.1.5) | a second pick at the **same pixel** with click count 2, 0.2 s after the first, is ignored and the list stays open; the same click with count 1 picks. Behaves as written |

### 4.3 F2 and F3

| Check | Result |
|---|---|
| C9, glyph on **101 skins**, pointer resting on another row, rendered pixels | on exactly one row, the Enter row; never on the hovered row or the current-skin row; box 12 x 12 px in every skin. Most contrasting glyph pixel against the row tint: **100 %: min 4.92:1 (silent-hill), median 8.95, 0 under 3:1; 150 %: min 4.88:1 (silent-hill), 0 under 3:1**; ink pixels min 32 (100 %) and 77 (150 %), diablo. These equal the spec's own figures. Edge, 100 % and 150 %; Electron, 100 % |
| C9 control | HEAD: no glyph on any row, no ink in the glyph box |
| C10 | `zzz` (NO MATCHES): no glyph, no Enter row; back to one glyph when the text is deleted; `star wars`: row 1 only; arrows move it; Esc: the list has no box; reopened: one glyph. A press on the glyph itself picks the row. No horizontal overflow |
| C11, 101 skins | **424 x 300 and 640 x 420: 0 rows wrap, 0 clipped, text ends at least 8 px before the glyph** (narrowest 116 px at 424; HEAD the same 0). Narrow windows: B-F1 |
| C12, S1 to S7 | **all pass** (marker moves; the Enter row follows only from an untouched unfiltered list, centred and fully visible; Enter then keeps the new skin with **0 saves**; arrowed highlight, filtered list, non-skin change, parked list and own pick behave as written). HEAD fails S1, S2, S4: its Enter **reverts the skin** (1 save) |
| F3 extras | the `store-reloaded` route also follows; three outside changes in a row end on the right skin; outside change under NO MATCHES, to an unknown skin key, or to the same skin: no change, no exception |
| Eyes (offscreen crops at 150 %, six skins) | the ↵ is plainly visible on the Enter row in a dark (Cyberpunk) and a light (2001) skin; a headless look, not a replacement for the away-window look |
| Search | all 47,952 two- and three-character queries list identical rows on HEAD and the build (the matcher is untouched) |

### 4.4 Earlier behaviour, and close from every screen

- The earlier suite (A-open to A-reclick, X-cycles to X-rec, B-ladder, C-cheat: the one-Esc ladder, Enter rules, IME, blur and Tab, resize, wheel, cheat-sheet row) **134 of 134 on Edge**, and all of it inside the 195 of 195 on Electron. The old F1 check (X7) passes on the build and fails on HEAD, so the one thing that changed in that suite is the one thing meant to.
- Real main process (lane 2), with the tray's real `Quit QuickLauncher` handler invoked: **14 of 14 launches exit 0, 80 to 106 ms after Quit, 0 processes left, 0 renderer errors**, HKCU Run keys unchanged, from: rest, Settings, the open skin list with text typed, the parked field after a pick, edit mode, the cheat-sheet, the installed-apps picker and a tile filter (8), plus four full flows (real click on the field, real typing, then a real **click** pick for MANDALORIAN and MORDOR, a real **Enter** pick for FF7 and REPUBLIC) read back from the real store, plus two rest launches. Counters: window focus 0; `windowShow` 1 per launch (the app's own `win.show()` at ready-to-show, blocked and counted). Control: Quit suppressed gives exit 7 after 5,089 ms.

## 5. Findings

| # | Build | Severity | Finding | Status |
|---|---|---|---|---|
| A-F1 | A | Minor | The worst-point judge never sees a fill byte-identical to the label colour. A hard-edged patch of exactly the label colour (or a ramp under 1 px) over under half the text box passes at 21:1, in a normal run and under `--ink-free-all`. Repro and numbers in 2.6. No theme is affected today (0 hidden of 3,776 readings). | open. Sergei's call whether it matters; if it does, the ink mask would come from glyph coverage (a capture with the label forced to a contrasting colour) instead of from pixel difference. Until then it belongs next to the documented ancestor gap in the Brief |
| A-F2 | A | Minor | Figures in the Brief row and code comments do not match: 12 % / 44 s / 80 s against 14.4 % / 39 s (HEAD 34 s) / 67.9 s; the `run.mjs` help text says a skipped reading may read up to 2 % lower (measured 3.02 %); `hover.cjs` contradicts itself on the same bound | open |
| A-F3 | A | Minor | The summary line "370 read from a gradient's worst point" counts 169 flat fills lowered by 2 % or less | open |
| B-F1 | B | Minor | The extra right padding for the glyph wraps more names in narrow windows. At 300 px wide, 51 of 101 skins have a wrapped row, at most 3 in one skin (HEAD 0; the spec's sample of 9 skins found 2). At 240 px: all 101 skins, at most 20 rows (HEAD 14). 424 and 640 are untouched (0 and 0). The window minimum is 180. Spec C.2.4 already accepts this cost | accept (as the spec) |

### Notes (not findings)

- **N1.** A hard-edged ancestor feature wholly inside the label's range rect (the Brief's documented limit) behaves as documented, and `--ink-free-all` fails it at 1.14:1. The Brief's own revisit trigger ("`--ink-free-all` disagrees with a normal run on a verdict") is therefore met on a synthetic input only; on the real roster it never has.
- **N2.** Spec C.3.2, by design: with a **filtered** list on the old skin (typed `cyber`), an outside change to MORDOR leaves the list showing CYBERPUNK as the highlighted row, and Enter then picks it (1 save, back to CYBERPUNK). It is what the list shows; I note it because it is the one path where Enter changes the skin back.
- **N3.** The wheel can still scroll the Enter row out of view (spec C.6.1, an offer not built); the glyph now scrolls away with it.
- **N4.** A rejected save still only logs `Failed to save skin` (unchanged from the last pass).

## 6. Pattern alerts

Pattern alerts: 1

1. **The lane-2 smoke harness dies at startup when its snapshot has no `electron-updater` (exit 3, no window created).** Third pass in a row: last pass's probe fault 3, the pass before, and now this one (all 15 first launches). The harness copy is rebuilt by hand for every QA pass. Proposed disposition: **fix** as a small, studio-level change (Ender: keep one maintained copy of the real-main smoke harness under `scripts/qa/` that links `node_modules` for the snapshot), Jane confirms; **defer** is defensible because I recover in minutes, but the cost recurs.

## 7. Pending: next away window

Real-input checks I did not and could not do headless. None blocks the commit.

1. **A real mouse double-click on a skin row, three skins** (BLAIR WITCH, CONTROL: THE BUREAU, DEAD SPACE): slider, checkboxes and hotkey field unchanged, field still focused, list closed. Every figure above used the click count the test sent; the browser computes it from OS input, and the guard's whole rule rests on the second press arriving with a count above the first. If it arrives with a count of 1 on the real build, Ender reports back; nobody improvises a time-and-distance guess (spec C.5).
2. **Your eyes on the ↵ at 150 %**, in a dark and a light skin, with the pointer resting on a different row. If it does not settle "which row does Enter pick", spec C.2.5 holds the offer (hover moves the Enter row), which is Sergei's call.
3. **The packaged build's Electron:** done offscreen on the same Electron 32.3.3 / Chromium 128 the app ships; the double-click on the packaged exe itself waits for the build (I did not run `npm run build`).
4. **The tray's Quit by a real click** on a shown window: lane 2 invoked the real handler and proved the exit (14 of 14), not the OS click or a visible window.

## 8. Machine safety, leaks and cleanup

- **Sergei's QuickLauncher:** never touched; `QuickLauncher.exe` count 0 at the start, in every census and at the end. Every Electron launch used its own throwaway profile; `%APPDATA%\QuickLauncher` was never opened; I never launched an exe of the app (lane 2 runs the unpackaged real main under the project's Electron, as in the last pass, so `quicklaunch-safe-launch.mjs` for the packaged exe did not apply).
- **Headless browsers:** 9 launches, all through `headless-browser.mjs` (`launchHeadless`), each ended by its own `lease.close()` (8 close lines seen with `remaining: 0`; the ninth, a debug run, was filtered out of my terminal view); `headless-browser.mjs list` shows **no leases** after every run. A mid-run `list` showed my lease (`futaba-gp-qa`, 9 processes) as the positive control that the listing and my census can see my own. Browsers started outside the library: 0.
- **Electron harness runs (offscreen, never shown):** about 115 (my count; each run starts its own Electron processes and its isolation line or result file reports 0 left): the gate, about 12 full-roster runs (entry check, `npm run check`, HEAD baseline, three determinism, `--ink-free-all`, stressed, 3x3 and 7x7 control, range judge, hidden-ink, `--rebaseline`) and about 60 `--only` runs (35 variants, 4 of them again under `--ink-free-all`, 4 neutered controls, 5 ratchet, a few trials); the gallery, 12 runs (self-test, two full renders, pre-fit, compare, 7 wrong-banner); lane B, 1 process hosting its windows; lane 2, 30 launches (15 died at startup on the missing dependency, 15 good). Guard counters in every one: login item 0, global shortcut 0, focus 0, dialogs 0, media 0. HKCU Run and StartupApproved\Run keys: unchanged in every run that reads them.
- **Machine load:** quiet (1.4 to 5.6 %) before every timed run; the one deliberate load test used 8 below-normal-priority busy loops (28 % machine-wide for under a minute), ended through their own handles, 0 left.
- **Killed by me: 1.** An orphaned `tail -f` of my own log, left behind by a monitor I had stopped (command line named my log file), ended by PID with `taskkill /F /PID`. No kill by image name, no `/IM`, no `/T`, nothing of anyone else's.
- **Junctions:** the scratch clones linked `node_modules` to the repo's with directory junctions, removed link-only (`rmdir` semantics) before the end; the repo's `node_modules` (294 entries, `electron.exe` present) is intact.
- **Leak count: 0.** Method: a read-only `Get-CimInstance Win32_Process` listing of all 489 processes with command lines, taken after the last run, matching my scratch path, my script names (`gp-edge.mjs`, `gp-electron-run.mjs`, `gp-electron-main.cjs`) and my labels (`futaba-gp-qa`, `qa-gradient-pickerC`), shells excluded: **0 processes**; `electron.exe` 0; `msedge.exe` 0 (0 in a guard lease); `QuickLauncher.exe` 0; `headless-browser.mjs list`: no leases. The 34 `chrome.exe` on the machine are not mine (my census shows them unrelated to my folder).
- **Repo state:** `git status --porcelain` shows only the 6 pinned files before, after the resume and at the end, plus this report as one untracked file; HEAD still `7160cfe`; the 6 hashes re-taken at the end equal the pin. No commit, no stage, no push.

Probe faults found and removed before any number was used: (1) my first scratch copy had no git context, so the gate refused to start; the scratch clones fixed it. (2) My first junction target was mangled by the shell's path conversion (the gate could not find Electron); fixed by creating the link from node. (3) Lane 2 died at startup, as in section 6. (4) My first "wrong guard" control only blocked `mousedown`, which cannot stop a label's `click`; it now swallows all four events. (5) My first vertical-ramp expectation was wrong (section 2.3). (6) My first hidden-ink count treated trace-coverage pixels (text gamma differs by colour) as hidden ink; it now counts only strong-coverage pixels, and the positive and negative controls above were run on that version.

## 9. Scratch

`C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ee1f77cf-5889-412e-b022-29b9109a8847\scratchpad\qa-gradient-pickerC\`: `pin-*.txt` (the pin, start, resume, end), `entry-check.txt`, `npm-check-1.txt`, `snap\` (build and HEAD snapshots), `repo-build\` and `repo-head\` (scratch clones), `variants.cjs`, `ratchet.cjs`, `wrongbanner.cjs`, `exp3x3.cjs`, `exp-blind.cjs`, `exp-hidden.cjs`, `stress.cjs`, `an-hover.cjs`, `gp-c.cjs` (Part C scenarios), `gp-reg.cjs` (earlier-behaviour suite), `gp-edge.mjs`, `gp-electron-run.mjs`, `gp-electron-main.cjs`, `gp-real-run.mjs`, `gp-real-main.cjs`, `census.ps1`, `load.ps1`, and `out\<run>\` for every run (`hover-*`, `var-*`, `rat*`, `gal-*` next to `gal-after`, `edge-*`, `electron1`, `real*`, `edge-eyes\*.png`).
