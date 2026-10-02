# QuickLaunch QA: skin picker, one-Esc ladder, cheat-sheet row, prebuild gate, 2026-10-02

Futaba. Asked by Jane under ProcessRules § Sergei is not QA, before Sully commits. Read red-team: the job was to list every break, every bit of friction and every confusing state. Nothing in the repo was edited, staged, committed or pushed; this file is the only thing I wrote in the repo and it is left uncommitted. The regions worktree was not touched.

**Verdict:** GO

GO for Sully to commit the five pinned files below. Blockers: none. Majors: one (F1), and it behaves identically on HEAD, so it is a carry-over found now, not something this build introduced. Every spec row passes on both runtimes (Edge 154 and the shipped Electron 32 / Chromium 128), and every finding I filed against the earlier build is gone.

Pattern alerts: 1 (section 6). Alert 2 of the 2026-10-02 hover/search report (Esc and focus rules split across field handlers and one document handler) is closed by this build.

## 1. Receipt (the pin)

| Item | Value |
|---|---|
| Tool / version | QuickLauncher **1.94.3** (not bumped; unreleased work on the branch) |
| Branch / HEAD | `wip/theme-fidelity` / **`a528cf4`** |
| Dirty set | exactly 5 tracked files modified, nothing else (`git status --porcelain` = 5 lines at the start, after every lane and at the end of testing; writing this report then added it as one untracked line) |
| Entry-check script | `Entry-check receipt: quicklauncher v1.94.3 @ a528cf4 (dirty: Y) — pre-qa n/a, post-build n/a, check-electron n/a, check pass, test:smoke n/a` |
| `src/main` | `git diff --stat -- src/main` is 0 lines: the tray, window, store and IPC code is unchanged by this build |

SHA-256 (taken first; re-taken at the end, **identical both times**):

```
5dd0bd9be72b235695f7cbc014f6eaca40be31bb2627a4c458224c6891ff3c5e  src/renderer/app.js
ad4600cbb7672911c2b05e091c94771fe8d2dc8603b33431d1e969e09b3f0cd5  src/renderer/index.html
07cb025fd15bc2622b9347994d0c2c8213e6eea5747deaa98719c3528f47487e  src/renderer/styles/base.css
4ff928fb9dddbe2b8e42c901886362b0f5595b96e744eb6bd5be8dcca14de923  package.json
5f295493b18075be92866d9dbea898132b70e2b68c86a112455ca9530907c5dd  Docs/QuickLaunch_Brief.md
```

`git diff --stat`:

```
 Docs/QuickLaunch_Brief.md    |   8 +-
 package.json                 |   2 +-
 src/renderer/app.js          | 230 +++++++++++++++++++++++++++++--------------
 src/renderer/index.html      |   4 +-
 src/renderer/styles/base.css |   4 +
 5 files changed, 168 insertions(+), 80 deletions(-)
```

Git prints "LF will be replaced by CRLF" for all five (working copies are LF); not a defect of this build.

**Snapshot, not the live tree.** Every behaviour test ran from copies under `...\scratchpad\picker-qa\snap\`: `build\renderer` (the working-tree renderer, copied first, hashes equal to the pin, and `diff -rq` against the live tree at the end shows it byte-identical), `head\renderer` (`git archive a528cf4`, the positive control), and `build-root\` (pinned renderer, the unchanged `src/main`, `package.json`, `icon.png`, and `electron-updater` plus its dependencies from the repo's `node_modules`). The only live-tree run is `npm run check`, which the brief asked for.

## 2. How it was tested

Three lanes, one scenario file for the first two (`pq-scn.cjs`: 141 checks), so a difference between runtimes is a real signal. Real input only: `Input.dispatchKeyEvent`, `Input.dispatchMouseEvent`, `Input.insertText` into the page. Nothing was shown, nothing took focus, no OS input was sent.

| Lane | What | Result on the build |
|---|---|---|
| A | Headless **Edge 154.0.4258.48**, started only through `scripts/qa/headless-browser.mjs` (lease and Job Object). The snapshot is served over http on 127.0.0.1 by my own process, so the page's CSP applies unchanged. | **140 of 141 pass**; the one miss is X7 (F1) |
| B | The project's own **Electron 32.3.3 (Chromium 128.0.6613.186)**, the shipped runtime, offscreen, `show:false`, `focusable:false`, with counting stubs for show, focus, login item, global shortcut and dialogs. Same 141 checks. | **140 of 141 pass**; the same X7 |
| 2 | QuickLaunch's **real main process** (`src/main/index.js`, unchanged) under unpackaged Electron 32, window parked at -32000 and never shown, tray replaced by a fake that keeps the real menu, so the real `Quit QuickLauncher` handler is invoked. Real keystrokes and real clicks through the real IPC and the real store. | 22 of 22 launches clean (section 3, check 6) |

Lanes A and B agree on every check. Both ran every row of the spec's section 10 and Addendum A.5 (A1 to A29, B1 to B13), plus my own red-team rows (X1 to X26, D1 to D5). A30 (pixels) and A31 (matcher sweep) ran in lane A only, because they need rendered pixels and a second page.

**Positive controls (a check is trusted only after it was seen to fail):**

| Control | Result |
|---|---|
| The same 134 checks on **HEAD** (`a528cf4`) | Edge: 67 pass, 67 fail; Electron: 68 pass, 66 fail. **66 checks (65 on Electron) fail on HEAD and pass on the build.** They are exactly the earlier findings: the list not reopening after a pick (A3a, A4a to c), Enter acting on a hidden list (A5b), Esc closing Settings and leaking into edit mode and fullscreen (A10, A12, B1 to B6, D1 to D5), empty Enter picking 2001 with a save (A6, A7), right-click picking (A18), double save (A23), composing keys (A24), resize (A25), `acr` and `ac` junk (S1, S2), the old cheat-sheet string (B11, B13). |
| Matcher lost-substring check on a deliberately broken matcher (tier 1 removed) | caught (it loses rows), so the check can fail |
| Enter-bar pixel probe on HEAD | finds no bar, so the probe can tell the difference |
| `Quit` suppressed in lane 2 | exit 7 after 5,097 ms ("still running 5 s after the Quit handler"); Quit as shipped exits in 76 to 127 ms |
| npm lifecycle: a throwaway project wired like the real one (`prebuild` runs `check`) | gate failing: `npm run build` exits 1 and neither `build` nor `postbuild` runs; gate passing: both run |
| The hover gate's own controls (in the `npm run check` output) | PC1 and PC2 both fired |

**Probe faults found and removed before any number was used:** (1) X1 typed without focusing the field first (my scenario, not the app); fixed. (2) Lane B hung: a DevTools `Runtime.enable` on a not-yet-loaded offscreen window never answers; the slow-call trace named it, the debugger now attaches after load. The hung first pass was ended by stopping its task (its process tree went with it; `electron.exe` count 0 afterwards). (3) Lane 2 died at startup (23 launches, exit 3, no window created) for want of `electron-updater` in my snapshot, the same fault as my last QA pass; not an app defect. (4) My first X7 looked under the list with `visibility:hidden` (which `elementFromPoint` ignores) and tried one row only; rewritten to probe every visible row, single and double click. (5) The HEAD bar control needed the current-skin row visible, which HEAD's list does not scroll to; the control now needs only the Enter row and a plain row. (6) My first lost-substring count was 10,738 against the spec's 26,337; the spec's number is 8,779 theme-and-substring pairs times 3 variants (as typed, upper-cased, space-padded) over 5,926 unique trimmed lower-case substrings, and the probe now uses that definition. (7) A `python3` heredoc hung once and was stopped; it left no process.

## 3. Results by check

### Check 1: picker flow (spec A1 to A30, real input, 424x300)

All pass on both runtimes except X7 (F1). Highlights, with the id:

| What | Result |
|---|---|
| Pick, then list closes, field clears, **focus stays** (A2) | list hidden, field empty and focused, Settings open, body unlocked, **1 save**, the picked skin |
| Typing reopens the list (A3a); a click, ArrowDown, ArrowUp reopen it (A4a to c) | all open with 101 rows and the current skin highlighted; the two arrow presses and the click change nothing and save nothing (A4d) |
| Ten pick cycles in a row (X1: sith, mando, ff7, pipboy, halflife, laracroft, star wars rep, cyberpunk, Cyrillic, 2001) | every one opens, picks, parks; one save per change; no page error |
| Enter on the highlighted visible row only (A2, A13) | `star wars` then ArrowDown x2, Up x6, Down x12, Up, Enter picks SEPARATISTS; clamps at both ends, no wrap |
| Enter on an empty field keeps the skin (A6, A7, A7d, A9) | closes, **0 saves**, still CYBERPUNK (not 2001); same for `:` and spaces; same on the current skin |
| Enter on NO MATCHES (A8) | list stays, text stays, nothing highlighted, no save |
| Enter on a hidden list (A5) | nothing: no list, no pick, no save |
| Hover does not move the Enter row (X5) | resting the mouse on row 4 and pressing Enter picks the highlighted row 1 |
| Right-click and middle-click on a row (A18) | no pick, list stays, no save, no edit mode, Settings stays |
| No double save (A23, A23b) | Enter twice 20 ms apart with an 80 ms save: **1 save**; click then Enter: **1 save** |
| The 2 px bar (A30) | **101 of 101 skins**, rendered pixels, real hover on another row: the bar is on the Enter row only, in the text colour; none on the current-skin row, the hovered row or a plain row. Bar against the Enter-row tint **min 4.96:1**, against a plain row **min 5.46:1** (both Silent Hill), none under 3:1. These equal the spec's own independent figures. Light skins by sampled row background: 2001, mirror's edge, portal, promise-mascot, silent-hill, star-wars-republic; the other 95 are dark. I looked at offscreen crops of Cyberpunk, 2001, Promise Mascot and Stranger Things: the bar is visible beside the Enter row in each. |
| Placement and resize (A25, X-sizes, X-tab) | 424x300 to 520x420 with the list open: still open, 3 px from the field, 20 px in each side. From 180x150 (the window minimum) to 1920x1080 the list opens attached (3 px) and inside the window, and a pick works. Tab into a below-the-fold field scrolls it into view and the list attaches (424x300 and 300x200). |
| Scrollbar and NO MATCHES presses (A19), wheel (A28), re-click (A29) | list stays open, focus stays, the list scrolls and the Settings body does not move; the re-click does not rebuild the list |
| Blur and Tab (A20, A21, A22) | a click on a non-focusable spot closes the list within 30 ms; Tab goes to CHECK FOR UPDATES; `blur()` then `focus()` in one task leaves the list open 450 ms later |
| IME (A24) | synthetic composing Enter and Esc, and a **real** composition through the input pipeline: no pick, Settings stays open |
| Outside changes (A26) | `settings-changed-externally` and `store-reloaded` while typing: text and list kept |
| Settings reopens IDLE after every close route (A11, A27) | Esc, typing then CLOSE, CHECK FOR UPDATES, and the overlay hidden directly while parked or open: field not focused, list hidden, body unlocked. The hidden-directly route, which the spec could only measure on Edge 154, also passes on **Chromium 128**. |
| After a pick and Esc closes Settings, type-to-filter works at once (X22); after Esc in the list a letter reopens the list and does not reach the tile filter (X19) | pass |
| Rejected save (X8) | the list still closes, the skin still applies, no uncaught page exception (note N1) |

**The four earlier findings, each gone:** the list not reopening after a pick (A3a, A4a to c: HEAD fails, build passes); Enter switching blind on a hidden list (A5, A5b); Esc in the field also closing Settings (A10, A12, B2, D2); Enter on an empty field selecting 2001 (A6, A7, A7d).

### Check 2: search (A31, S1 to S7)

| Check | Result |
|---|---|
| Junk mid-word matches | `acr` shows **NO MATCHES**; `ac` lists 6 rows, AC: ASSASSINS and AC: TEMPLARS first, **no Tomb Raider** |
| Real matches | `mando`, `ff7`, `final fantasy 7`, `pipboy`, `pip boy`, `halflife`, `half life`, `laracroft`, `lara croft`, Cyrillic `зайчик` / `ЗАЙ` / `ЗАЙЧИК`, `bunny`, `stalker`, `xfiles`, `star wars republic`, `lotr`, `ghostshell`, `fallout`: each lists the right theme first (also typed through the real field, and `star wars` lists the six Star Wars rows) |
| All 47,952 two- and three-character `[a-z0-9]` queries, build against HEAD | **313** lists change (**95** of the 1,296 two-character ones); every change is a pure removal (0 reorders, 0 additions); **497** rows removed; **231** queries become NO MATCHES; **16** queries get a real row 1 instead of junk. All equal the spec's figures. |
| Nothing real lost | **0 lost of 26,337** queries (5,926 unique substrings, as typed, upper-cased, space-padded) |
| The spec's table | every query in the 2026-10-01 table (68, none missing) plus `the`, `the s`, `star wars s`, `star w`: 72 compared, **only `ac` differs, 7 rows to 6**. (The spec says 73; I found no 73rd.) `the` 9, `the s` 66, `the shire` 1, as the spec says. |

### Check 3: the Esc ladder (B1 to B9, D1 to D5, A12), real Esc, one press at a time

Every press removes exactly the innermost layer present and nothing else; the extra press after the stack is empty does nothing, and `hide-window` was called **0** times in every stack.

| Stack (innermost first) | Result |
|---|---|
| fullscreen, edit mode, Settings (B1) | Settings; edit mode; fullscreen (exactly 1 `exit-fullscreen`); nothing |
| B1 plus the skin list (B2, A12) | list; then as B1 |
| B1 plus the cheat-sheet over Settings (B3) | cheat-sheet; then as B1 |
| edit mode plus filter `cal` (B4); plus the rename input (B5); plus the installed-apps picker (B6) | filter, rename, picker go first, edit mode stays, then exits |
| fullscreen only (B7); nothing open (B8) | exits; Esc does nothing |
| Settings, an Esc flagged as composing (B9) | nothing closes |
| **Deep:** fullscreen, edit mode, filter, installed picker, Settings over it (D1) | Settings; picker; filter; edit mode; fullscreen |
| **Deep:** fullscreen, edit mode, filter, Settings, skin list (D2) | list; Settings; filter; edit mode; fullscreen |
| **Deep, six layers:** D1 plus the cheat-sheet (D3) | cheat-sheet; Settings; picker; filter; edit mode; fullscreen |
| Hotkey recording inside Settings, edit mode, fullscreen (D4; also X9) | recording cancels alone; Settings stays; then as B1 |
| A parked field after a pick, plus Settings, edit mode, fullscreen (D5) | one Esc closes Settings only |

Cancelling a rename keeps the name: typed `ZZ-WRONG-NAME`, Esc, label unchanged, nothing saved, edit mode still on (B5b). A rename committed with Enter still saves (B5c).

### Check 4: the cheat-sheet row (B11 to B13)

The ESC row reads exactly `Step back: panel, filter, edit mode, fullscreen`, key cell `ESC`. No row mentions hiding the window except CTRL+SPACE; all nine rows are present in order. Measured at six window sizes, no clipping, no horizontal scroll, no text past its row or panel, no key and description overlapping:

| Window | ESC row |
|---|---|
| 424x300 (default) | 2 lines |
| 640x420, 1280x800, 1920x1080 | 1 line |
| 300x200, 180x150 (window minimum) | 2 lines; the list scrolls vertically, as designed |

I also looked at the 424x300 and 180x150 screenshots: no clipped text. At 424x300 the second line is the single word "fullscreen" (accepted by the spec).

### Check 5: prebuild

- `package.json` diff is one line: `"prebuild": "npm run check"`; `check` is `npm run check:contrast && npm run check:hover`. `release.mjs` runs `npm run build` and exits with its status; `build` has `prebuild` before it and `postbuild` (which deletes old releases) after it. **I did not run `npm run build` or `npm run release`.**
- The wiring was shown to stop a build with the throwaway-project control in section 2.
- `npm run check`, run directly: **exit 0 in 43 s**. Contrast: 101 themes checked, **0 errors**, 32 legacy warnings (the same 32 as before). Hover: 101 themes x 40 readings = **4,040 pairs, 0 errors, 0 grandfathered**; both positive controls fired; guards all 0, stubs intact 92/92, registry unchanged, 36 processes started, 0 left. The Brief's "about a minute longer" is a fair figure (43 s).
- Everything the run writes lands under `scratch/` (gitignored); `git status` is unchanged.

### Check 6: Close and Quit

Lane 2, the real main process. **22 of 22 launches exit 0** through the real `Quit QuickLauncher` handler, **76 to 127 ms** after the Quit, **0 processes left**, **0 renderer errors**, the HKCU Run keys unchanged, from: rest, Settings, **the open skin list with text typed**, **the parked field after a real pick**, edit mode, the cheat-sheet, the installed picker and a tile filter, in Cyberpunk and Republic; plus five flows (real click on the field, real typing, a real Enter or a real click on the row, rename, Hide, then Quit). Each flow's pick was read back from the **real store**: `star-wars-mando`, `ff7`, `mordor` (by Enter and by click), and `star-wars-sith` for the parked screen; the rename persisted. The Hide button hid the window and left the process running (the recorded tray exception), and Quit then ended it. Counters across the 22: window focus 0, focus events 0, login item 0, global shortcut 0, dialogs 0, shell 0; `windowShow` 22 (the app's own `win.show()` at ready-to-show, blocked and counted, one per launch) and 22 fake trays (no real tray icon exists).

## 4. Findings

### F1 (Major, carry-over, identical on HEAD): double-clicking a skin row clicks through to the control under the list

Repro, default window 424x300:
1. Open Settings, scroll to SKIN, click the field. The list opens above it and covers the rows over the field (title, icon size, checkboxes, hotkey).
2. Double-click a row that is not the current skin.
3. The first press picks and closes the list (1 save). The second press lands on whatever the list was covering, and that control reacts.

Seen on the build (each row on a fresh page): on BLAIR WITCH the second press hit the **icon-size slider** (a second save: the tile size changes and is stored); on CONTROL: THE BUREAU the **RANDOM THEME ON STARTUP checkbox flipped** (the point read as empty Settings body before the pick, so either the re-skin moved the layout or the checkbox's click area is wider than it looks; I did not separate the two); on DEAD SPACE the **hotkey field started recording** ("PRESS KEYS..."), and from the code the next key pressed is taken as the new global hotkey (I did not press one: it would register a real global hotkey). A **single click on the same six rows is clean**. HEAD does the same (its double-clicks flipped RANDOM THEME and started hotkey recording); which rows are hit depends on the list's scroll position and the skin.

Not caused by this build and not in the spec (section 8 says a click on a row is a pick wherever the list covers a control). It is a natural gesture and the damage is silent, hence Major. Proposed: **defer, Judy to rule** on how the rest of the click sequence is swallowed after a pick; not for Ender to improvise. Does not change the GO.

### F2 (Minor): the Enter-row cue is subtle when the mouse rests on a list

With the pointer on one row, the current-skin row and the Enter row, three rows carry almost the same tint and only the 2 px bar says which one Enter picks. It is what spec 3.8 decided, and the bar measures 4.96:1 or better in all 101 skins, so this is a look-and-feel note, not a miss. Needs eyes on the real window at 150% (section 7).

### F3 (Minor): the open list goes stale if the skin changes from outside

With the unfiltered list open, a `settings-changed-externally` that carries a different skin applies the skin but leaves the list marking the old skin as current and highlighted, so Enter then switches back to the old skin. Edge case (only a store reload can change the skin from outside while the window is open). HEAD's list is stale the same way (there Enter picks the first row, the old F3); here Enter acts on the stale highlighted row.

### Notes (not findings)

- **N1.** A rejected `save-settings` now only logs `Failed to save skin` to the console; the skin still changes in the window and is not persisted. A real disk failure raises the store's own banner through a separate path, and on HEAD this was an unhandled rejection. Behaves as the spec describes.
- **N2.** The Brief says Sergei approved the prebuild change on 2026-10-02; QA cannot verify that.
- **N3.** `the s` lists 66 rows by decision (spec 6.1); the highlight now shows what Enter picks.

## 5. Bugs filed

| # | Severity | Status |
|---|---|---|
| F1 | Major (carry-over) | open, proposed defer to Judy |
| F2 | Minor | open, look at it in the away window |
| F3 | Minor | open |

## 6. Pattern alerts

Pattern alerts: 1

1. **A dismissible list that sits over live controls at the default window size.** Earlier: the 424x300 skin list covers the title and the rows above the field (N1 of the hover/search pass), and my own scene click on the Settings title picked a skin (probe fault 1 of that pass); now F1, the double-click that passes through to the slider, the checkbox and the hotkey field. Three cases, two builds, same shape. Proposed disposition: **fix** as one small rule (Judy specs how a pick consumes the rest of its click sequence, Ender implements), Jane confirms; **defer** is also defensible since it behaves the same on HEAD.

## 7. Pending: next away window

Real-input checks I did not and could not do headless. None blocks the commit.

1. **Hide and show the window with the global hotkey while the list is open and while parked**, and Alt+Tab away and back. Expect the list closed and no list reopening by itself. This is the one rule I could not exercise: a hidden page reports focus through emulation, so no deactivation event reaches the field (spec 3.6; the `document.hasFocus()` line in the blur handler is untested).
2. **Real keyboard Esc, Enter and arrows on the real window at 150% scale**, once on a Russian layout; a real mouse press on the list scrollbar track.
3. **Your eyes on the Enter-row bar** in a dark and a light skin at real scale (F2); a visual change that reached you on a headless GO.
4. **Real fullscreen with Settings open**: the first Esc closes Settings and the window stays fullscreen; the next exits it and the bounds come back. Lane 2 does not exercise a real `exit-fullscreen` resize (the window there is never shown).
5. **The packaged build:** click the real tray icon, Quit QuickLauncher, and Hide on a shown window, confirming the process is gone. Lane 2 proved the real handler and exit (22 of 22), not the OS click or a real window.
6. **The real `npm run build` / `npm run release`** were not run (they publish). The gate wiring is proven by the control and `npm run check` passes; the first real release is the live proof, with Sully's packaged-build launch check.

## 8. Machine safety, leaks and cleanup

- **Sergei's QuickLauncher:** never touched. `QuickLauncher.exe` count 0 at the end. Every Electron launch used its own throwaway profile; `%APPDATA%\QuickLauncher` was never opened.
- **Headless browsers:** 7 launches, all through `headless-browser.mjs` (`launchHeadless`), each closed by its own `lease.close()` with `remaining: 0`; `headless-browser.mjs list` (read-only) shows **no leases**. Browsers started outside the library: 0.
- **Electron launches (offscreen, never shown):** lane B 4 (one hung and was ended by stopping its task, one ended by its own 60 s watchdog while I diagnosed, then two clean); lane 2 46 (23 died at startup, 23 good); the hover gate ran twice (once from `npm run check`, which reported 36 processes started and 0 left, and once inside the entry-check script, which reported pass). Counters across lane B: show, focus, focus events, app focus, login item, global shortcut, dialogs, media, window opens, blocked requests, permission requests, navigations: all **0**. Lane 2: as in check 6.
- **Registry:** the HKCU Run and StartupApproved\Run keys were hashed before and after every Electron run (read-only): unchanged in every run.
- **Killed by me:** 1, the hung lane B pass, by stopping its task (its tree went with it; `electron.exe` was 0 right after). No `taskkill`, no kill by image name. My own HTTP server lives in the lane A node process and ended with it.
- **Leak count: 0.** Method: a read-only `Get-CimInstance Win32_Process` listing of all 512 processes with command lines, matching my scratch path, my script names (`pq-edge.mjs`, `pq-electron-main.cjs`, `pq-electron-run.mjs`, `pq-real-main.cjs`, `pq-real-run.mjs`) and my markers (`picker-qa`, `QL-PickerQA`, `futaba-picker-qa`), shells excluded: **0 processes**; `electron.exe` 0; `msedge.exe` 0 (0 in a guard lease, 0 naming my label); `QuickLauncher.exe` 0. Taken after the last run; it was also 0 after lane 2.
- **Repo state:** `git status --porcelain` shows only the 5 pinned files before, during and after testing, plus this report as one untracked file; HEAD still `a528cf4`; the 5 hashes re-taken at the end equal the pin. No commit, no stage, no push.
- **Scratch:** `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ee1f77cf-5889-412e-b022-29b9109a8847\scratchpad\picker-qa\`: `snap\` (the three snapshots), `pq-scn.cjs` (141 checks), `pq-driver.cjs`, `pq-edge.mjs`, `pq-edge-extra.cjs` (matcher sweep, bar pixels), `pq-png.cjs`, `pq-electron-main.cjs`, `pq-electron-run.mjs`, `pq-real-main.cjs`, `pq-real-run.mjs`, `pq-leak.ps1`, `npm-ctl\`, and `out\<run>\` for every run (`edge-final`, `electron1`, `edge-extra2`, `edge-extra` with the bar crops, `real1`, `real2`, `real-control`, `edge1` to `edge3` for earlier partial passes).
