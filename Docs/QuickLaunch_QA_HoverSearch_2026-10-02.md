# QuickLaunch QA: hover-label fix and skin-picker search, 2026-10-02

Futaba. Asked by Jane under ProcessRules § Sergei is not QA, before Sully commits. Read red-team: the job was to list every break, every bit of friction and every confusing state. Nothing in the repo was edited, staged, committed or pushed; this file is the only thing written in the repo and it is left uncommitted. The regions worktree was not touched.

**Verdict:** GO

GO for Sully to commit the four pinned files below. Blockers: none. Majors: one, and it is a carry-over that behaves identically on HEAD (F1, skin picker after a pick), so it neither comes from this build nor changes the GO. Everything else is Minor or a note. The fix does what Ender said, with my own numbers beside his in section 3.

Pattern alerts: 2 (section 6).

## 1. Receipt (the pin)

Sully commits only if these hashes match what is in the tree at commit time.

| Item | Value |
|---|---|
| Tool / version | QuickLauncher **1.94.3** (not bumped; unreleased work on the branch) |
| Branch / HEAD | `wip/theme-fidelity` / **`e8d9ceb3382991c2d0c10b8bee02dd00a9cb452a`** |
| Dirty set | exactly 4 tracked files modified, nothing else (`git status --porcelain` = 4 lines, before, during and after) |
| Entry-check script | `Entry-check receipt: quicklauncher v1.94.3 @ e8d9ceb (dirty: Y) — pre-qa n/a, post-build n/a, check-electron n/a, check n/a, test:smoke n/a` |
| `src/main` since v1.94.3 | `git diff v1.94.3 HEAD -- src/main` is 0 lines (the tray, window, store and IPC code Futaba verified at 1.94.3 is the code under test) |

SHA-256 of the four files (taken first, re-taken at the end of the pass; **identical both times**, and the scratch snapshot I tested from carries the same four hashes):

```
50ce8d10f5c1141696dd1bb984db1ccde2fbb10ed81b754104d756a5789c741c  src/renderer/styles/base.css
bcace16eac1fd5110249d08b89cfc601175854cd342ac2b3f6f53e00aa4721f3  src/renderer/styles/themes/star-wars-republic.css
12bd2b37706bc6a063ffb2190e16fa77cea1d5e154ef9dc0cc4200c606a162b7  src/renderer/styles/themes/star-wars-separatist.css
8d5abbeb7cae0d96fd940ca18a055d67dd5cfd622b8c4261e4e61a990d3ecec7  src/renderer/app.js
```

`git diff --stat`:

```
 src/renderer/app.js                                | 130 ++++++++++++++++++++-
 src/renderer/styles/base.css                       |   5 +-
 src/renderer/styles/themes/star-wars-republic.css  |   3 +-
 .../styles/themes/star-wars-separatist.css         |   1 +
 4 files changed, 131 insertions(+), 8 deletions(-)
```

Note for Sully: git prints "LF will be replaced by CRLF the next time Git touches it" for all four (the working copies are LF; the rest of the checkout is CRLF). The contrast gate hashes CRLF-normalised (`e385df7`), so it is not affected, and `check:contrast` passed on the files as they are.

**Snapshot, not the live tree.** Two scratch copies, both under `...\scratchpad\hover-search-qa\`: `head\` (`git archive HEAD`) and `patched\` (the working-tree `src` plus `package.json`). Compared byte for byte (CR stripped): exactly the same 4 files differ, no file missing either way. Every test below ran from those copies, never from the live folder.

## 2. What was tested, and how

Two lanes. Neither shows a window, takes focus or sends input to the desktop.

- **Lane 1, renderer.** The project's own Electron 32.3.3 runs the real `index.html`, `base.css`, theme and `app.js` offscreen (`show:false`, `focusable:false`, stub preload with the real channel allowlist, mock IPC that records every call). States are forced with the DevTools protocol (`CSS.forcePseudoState`, one `DOM.getDocument` per page) and also reached with real mouse input into the offscreen page (`sendInputEvent`, hover and held-down press), typed text is `insertText` and keys are `keyDown/keyUp` through the page's input pipeline (checked: the page's own listeners saw `beforeinput`, `input` and `keydown` with `isTrusted` true). 22 launches, 0 timed out, all exit 0.
- **Lane 2, real main process.** `src/main/index.js` unchanged under an unpackaged Electron on a throwaway profile, with counting stubs for window show/focus, tray (a fake that keeps the real menu), global shortcut, login item, dialogs and shell. The real `Quit QuickLauncher` handler is invoked. 26 launches in the final pass.
- **Not launched:** the packaged `QuickLauncher.exe` and the tray icon (they take focus and need an OS click). See section 7.
- Headless Edge/Chrome: not used at all; `headless-browser.mjs` was only used read-only (`list`).

**Positive controls (a probe is trusted only after it was seen to fail):**

| Control | Result |
|---|---|
| Unfixed `head\` through the same probe | Republic: 14 readings under the floor, **1.33 hover, 1.14 pressed**; Separatist: 14 under, **1.65 hover, 1.45 pressed**. Exactly Judy's table. |
| Noise: `head\` against `head\` on 3 themes | 120 of 120 readings identical in computed style and in pixel hash. |
| Sensitivity: `head\` against `patched\` | the changes are seen: 14 in Republic in the 3-theme run, 28 in the full run. |
| Search probe on `head\` through the real picker | `mando`, `ff7`, `lotr`, `star wars s` list NO MATCHES (reproduces F4 of the batch-6 report). |
| Orphan-alias warning | a scratch copy with one bogus alias key logs `[themes] THEME_ALIASES keys with no matching theme: no-such-theme`; the pinned build is silent. |
| Contrast gate | fails (exit 1, 1.72:1, names the theme) on a scratch copy with Separatist `--text-dim` darkened; passes unmodified. |
| Quit | Quit suppressed: exit 7 after 5,102 ms ("still running 5 s after the Quit handler"); Quit as shipped: exit 0 in 66 to 172 ms. |

**Probe faults found and removed before any number was used:** (1) my first cheat-sheet reading came out in SOMA's colours: my scene "leave" step clicked the Settings title, and at 424 x 300 the skin list opens **upward over the title**, so the click picked a skin. Fixed (the step now blurs the field); every scene now asserts the theme did not change (`THEME CHANGED` guard), 0 triggered in the final runs. (2) Separatist `tile-remove` reads 2.46:1 on my 4-point flat-fill sample but 8.03:1 on the ink and white-on-red by eye: the sample points hit the edge of the 24 px round button. Probe artifact, identical on `head\`, ink figure used. (3) My first two lane-2 passes (52 launches) died before the app's code ran because my snapshot lacked `electron-updater` (2 MB, copied from the batch-6 extract) and `icon.png`; not app defects.

## 3. Check 1 and 2: hover and pressed, Republic and Separatist, and the other 99 themes

**Ender's numbers against mine** (rendered pixels, 1.5x, labels read on the real fill; real mouse and forced state gave the same figures):

| Claim | Measured |
|---|---|
| Republic hover 11.85, pressed 13.91 | **11.85 and 13.91** on all seven controls; ink readings 11.54 to 13.76 on the text labels, 9.60 and 11.14 on the thin hotkey-clear ✕ |
| Separatist hover 10.90, pressed 12.43 | **10.90 and 12.43** on all seven; ink readings 7.41 to 12.43 (thin ✕ glyph 4.32 hover, 4.57 pressed, floor 3) |
| The other 99 themes unchanged | **3,960 of 3,960 readings identical** in computed style and in pixel hash of the control region (see below) |
| Search 68 of 68 | 68 of 68 (section 4) |
| 0 of 11,026 queries lost | **0 lost** of 5,926 unique substrings and of 19,506 case and padding variants (section 4) |

**The seven controls from the batch-6 report, both themes, all four states (hover and pressed, forced and by real mouse):**

| Control | Republic hover / pressed | Separatist hover / pressed | Read |
|---|---|---|---|
| Edit bar `+ FILE` | 11.85 / 13.91 (white on `#6E1412` / `#5A0F0E`) | 10.90 / 12.43 (`#14171B` on `#E3C68E` / `#EBD4A8`) | clear |
| Edit bar `+ INSTALLED` | 11.85 / 13.91 | 10.90 / 12.43 | clear |
| Settings hotkey clear `✕` | 11.85 / 13.91 | 10.90 / 12.43 | clear |
| Settings `CHECK FOR UPDATES` | 11.85 / 13.91 | 10.90 / 12.43 | clear |
| Cheat-sheet `CLOSE` | 11.85 / 13.91 | 10.90 / 12.43 | clear |
| Installed picker `BROWSE...` | 11.85 / 13.91 | 10.90 / 12.43 | clear |
| Installed picker `CLOSE` | 11.85 / 13.91 | 10.90 / 12.43 | clear |

All 40 readings per theme (17 buttons x 2 states plus 6 single-state: header x4, chip clear, update action and dismiss, DONE, tile remove, tile names, picker row, Settings CLOSE, skin rows) were taken in both themes: **0 under their floor** (4.5:1 text, 3:1 single symbol) in either theme except the one probe artifact above. The plain header buttons, DONE, Settings CLOSE, update bar and tile remove were already fine and are unchanged. I also looked at crops of ten of these (Republic `+ FILE` pressed, `CHECK FOR UPDATES` pressed, hotkey clear hover, cheat CLOSE; Separatist `+ FILE` pressed, hotkey clear pressed, picker CLOSE, cheat CLOSE pressed, tile remove): white on crimson in Republic, dark ink on tan in Separatist, all legible. Eyes were on offscreen crops only (section 7).

**Roster differential (check 2).** 101 themes x 40 readings = **4,040 readings** on `head\` and on `patched\`, each reading = computed style (color, fill, border, shadows, opacity) plus a pixel hash of the control's region (10 px margin for the glow). **4,012 identical; 28 differ, all 28 in Republic (14) and Separatist (14): label colour only.** The other 99 themes: 3,960 of 3,960 identical in style and pixels, including the two light themes (`2001`, `promise-mascot`, which carry their own four-rule block), the tile remove button in every theme (the new `color: #fff` pin on `.btn-remove:hover` changes nothing anywhere) and the update bar. 101 of 101 themes reached all 40 readings, 0 scene errors, 0 console warnings or errors in either build, all guard counters 0.

**Contrast gate (check 5).** `npm run check:contrast`: **101 theme(s) checked, 0 errors, 32 legacy warning(s)**, exit 0 (same 32 as HEAD; neither Star Wars theme among them). Verified to fail on a broken copy (section 2).

## 4. Check 3: the skin picker, used like Sergei

Through the real field and DOM, in Settings, with real clicks, typed characters and key events.

**Spec table 3.5:** 68 queries typed into the real SKIN field and the rows read off the screen: **0 mismatches**. 64 match the spec's order exactly; 2 (`wh40k`, `40k`) differ only from my own transcription, because the six WARHAMMER 40K rows come out in label order CHAOS, ELDAR, IMPERIUM, NECRONS, ORKS, TYRANIDS as the spec's ordering rule says. `ac` lists AC: ASSASSINS, AC: TEMPLARS first then five tier-1 rows (F5); empty lists all 101; `zzz` shows `NO MATCHES`. Alias audit: 54 themes carry aliases (spec: 54), all keys real, none empty, none over 4 phrases, css files and `ALL_THEMES` are the same 101.

**Superset property:** every substring of every label (5,926 unique, trimmed, lower-case) plus 19,506 upper-case and padded forms: **0 lost**. Order property (tier 0 before tier 1, each in label order, no duplicates, only real keys) held on 21 probe queries.

**Property (c), real clicks and Enter on the real field:** `mando` + Enter saves `star-wars-mando`, `ff7` + click saves `ff7`, `lotr` + Enter saves `mordor` (first row; clicking THE SHIRE saves `shire`); the save call and the mock store agree. In lane 2 (the real main process and its real store) the same picks, plus `star wars republic` and `cis`, were made with Enter, then a tile rename (Cyrillic included), Hide and Quit, and the data file read after exit holds `star-wars-mando`, `ff7`, `mordor`, `star-wars-republic` and `star-wars-separatist` with the renamed tile.

| Probe | Result |
|---|---|
| `mando`, `star wars`, `ff7`, `warhammer`, `doom` | 1 row MANDALORIAN; the 6 Star Wars rows (Empire, Republic, Mandalorian, Rebel, Separatists, Sith); FINAL FANTASY VII; the 6 Warhammer rows; DOOM (CLASSIC), DOOM ETERNAL. Spec-conformant. |
| Partial words | `m` 32 rows, `ma` 8, `man` 2, `mand`/`mando` 1; `star` 7 (LCARS first via its `star trek` alias, then the six); `star w` 6. |
| Cyrillic | `зайчик`, `ЗАЙ`, `ЗАЙЧИК` all list `ЗАЙЧИК / TINY BUNNY`; Enter picks it. Typed in the real field. |
| Case and padding | `  MaNdO  `, `Star Wars`, `star   wars` fine. |
| Empty, spaces, symbols | `""`, spaces, tab, `:` `.` `'` `-` `!!!` `()` `[` `\` `*` `%` `$` `^` `+` `😀` list all 101 (spec § 3.6); `<b>` becomes `b` (16 rows); `<script>alert(1)</script>` lists nothing. No exception for any of 59 odd inputs; the matcher takes 0.011 ms per typical keystroke, 11 ms for a 10,000-word paste, the real list rebuild 0.09 ms. |
| Enter | picks the active row, else the first; on `NO MATCHES` it does nothing and the field keeps its text; Backspace back to empty restores all 101 with the current skin marked. |
| Esc and Tab | the list closes and the field clears (Tab: 150 ms later, focus moves on to CHECK FOR UPDATES). Esc: **see F2**. |
| Arrows | Down starts at row 1, Up from nothing selects row 1, Down past the end stays on the last, Up goes back; Enter picks the arrowed row. Typing another character after arrowing drops the highlight, so Enter then picks row 1 (F4). |
| Not supported, as the spec says | `ьфтвщ` (Cyrillic-layout slip), `mandol` (typo), `ŠTAR`, `ｍａｎｄｏ`: NO MATCHES, same as HEAD. No regression. |
| Layout | 101 rows at 424 wide: 0 clipped labels; the open list sits inside the window (10 to 196 px of 300). |

## 5. Findings

Severity (Futaba's scale): **Blocker** breaks a flow Sergei uses, **Major** is plainly wrong in an everyday state but the flow still works, **Minor** is cosmetic, rare or a carry-over. Findings F1 to F3 were reproduced on the unfixed `head\` and are **not caused by this build**; F4 and F5 are the spec working as written.

| # | Sev | Finding | Status |
|---|---|---|---|
| F1 | **Major** (carry-over) | **After a pick, the skin list will not come back, and Enter then switches skins blind.** Repro: Settings, click SKIN, type `sith`, Enter (skin changes). The field keeps focus with the list closed. Type `rebel`: nothing shows. Click the field again: nothing shows (it already has focus, so no focus event). Press Enter: the skin changes to Rebel, the list was never visible. The list only returns after you click elsewhere and click the field again. Same after a mouse pick. Identical on HEAD (flows F8, F8b, F8c, F8h, both builds). It is the first thing you hit when you try three skins in a row, which better search now invites. Cause (read, not changed): `closePicker()` (app.js:2022) hides the list but leaves focus in the field, and the list opens only from the `focus` event (app.js:2039), so typing builds an invisible list. | open, for Judy |
| F2 | Minor (carry-over) | **Esc in the skin field closes the whole Settings panel.** The field's own handler closes the list, and the document-level Escape handler (app.js:1711 to 1714) also fires and closes Settings. Same with the field empty. Identical on HEAD. Same family as batch-6 P3 (Esc in the rename input also leaves edit mode). | open |
| F3 | Minor (carry-over) | **Enter with nothing typed switches the skin to `2001: A SPACE ODYSSEY`** (a light skin), because no row is active and the first row wins (app.js:2048). Spaces-only does the same; now `:`, `.`, `!!!` and emoji also list all 101, so Enter on those switches to 2001 too (on HEAD `:` listed the 26 colon names and Enter picked the first of those). The current skin is not the default pick. | open |
| F4 | Minor (spec) | **"The" is dropped and extra letters can widen the list.** `the` lists 9 rows; `the s` lists **66** (the `the` is thrown away, `s` matches every word starting with s, first row 2001), then narrows again: `the sa` 3, `the sh` 2, `the sand` 1. `star wars s` does not narrow at all (the `s` is satisfied by STAR; `star wars se` gives 2). Enter in those states picks the first row, not what was meant. Spec § 3.2 steps 3 and 4 as written. Judy's call whether single letters after a dropped `the` should count. | for Judy |
| F5 | Minor (spec) | **Tier-1 noise from joined words.** `ac` lists TOMB RAIDER as its 7th row because the alias `lara croft` is joined into `laracroft`, which contains `ac`. Across all 47,952 two- and three-character queries, **497 of 2,233 tier-1 hits (22%, 84 themes) exist only because a joined string spans a word boundary**: `do` adds THE SHIRE, RIVENDELL and five WOW rows; `dl` adds the three SWL rows; `dr` adds GALACTIC REPUBLIC. They sort after the word-start rows, so Enter never lands on one; cosmetic. The superset property would still hold if joined words took part only in tier-0 prefix matching. Offer, not a requirement. | for Judy |
| N1 | Note | The skin list opens **upward over the Settings title** at 424 x 300 (it has under 150 px below). By design (app.js:2002 onwards) and not new; it is what made my own first scene click pick a skin, so a real click on the title while the list is open can do the same. | note |
| N2 | Note | **`check:hover` is not part of this build.** `package.json` has no `check:hover` script and there is no `scripts/themes-hover-baseline.json`, so spec § 4 steps 1 and 3 and § 2.6 wiring are not in these four files, and the spec's "run `check:hover` twice, count leaks and focus" cannot be done. My roster differential stands in for it for this change only; nothing yet stops a later theme from putting a dark label on a pale hover fill. 57 themes still read under their hover floor (Judy's Appendix A), not touched by this build. | for Jane |

No console warning or error in any run; no uncaught exception; no crash.

## 6. Pattern alerts

Pattern alerts: 2

1. **Hover label colour left on the base default when a theme moves its hover fill across the label colour** (carried from batch-6 alert 1; the fix for the two themes and the `--btn-hover-text` mechanism are in this build and verified; the 57-theme tail and the missing gate are N2). Proposed disposition: **fix** for Republic and Separatist (done, GO), **defer** the other 57 themes and the `check:hover` gate to Sergei (Judy § 1.6 and § 2 are the offer); Jane confirms.
2. **Keyboard and focus rules live in per-field handlers plus one document-level handler, and both fire** (batch-6 P3: Esc in the rename input also leaves edit mode; F2: Esc in the skin field also closes Settings; F1: the skin list depends on a `focus` event that does not fire again). Three cases across two builds, same shape. Proposed disposition: **defer** as one task to Sergei (Judy specs the rule "the innermost field consumes Esc and the list reopens on click or typing", Ender implements); not a regression of this build.

## 7. Pending: next away window

Real-input checks I did not and could not do headless. Not blocking the commit.

1. **Real mouse and real keyboard on the real window, at your 150% display:** hover and press the seven controls in Republic and Separatist, and type in the SKIN field (including a Russian layout and the Esc and re-click cases of F1 and F2). Here the input went into the offscreen page by `sendInputEvent` and `insertText`; no OS input.
2. **The packaged `QuickLauncher.exe`:** launch, click the real tray icon, Quit QuickLauncher, and click Hide on a shown window, confirming the process is gone. Lane 2 proved the real Quit handler (26 of 26 exit 0, 66 to 172 ms, 0 child processes left) from rest, Settings, the open skin list, edit mode, the cheat-sheet, the installed picker and a filter, in Cyberpunk, Republic and Separatist, plus five flows (pick by search, rename, Hide, Quit); the OS click and the real window were not exercised.
3. **Your eyes on the two skins' hover and pressed states.** This is a visual change that reached you on a headless GO; I looked at offscreen crops, which is not the same as the real panel.

## 8. Machine safety, leaks and cleanup

- **Instance tested:** neither lane touched Sergei's installed QuickLauncher or `%APPDATA%\QuickLauncher`. At the end 0 `QuickLauncher.exe` processes. Every launch used its own throwaway profile; lane 2 seeded `startWithWindows:false`, `globalHotkey:null`, `randomTheme:false`.
- **Focus, audio, input:** across all lane-1 launches the guard counters sum to **0** for window focus, focus events, app focus, login item, global shortcut, dialogs, media, window opens, blocked requests, permission requests and navigations. Lane 2: all 0 except `windowShow` = 1 per launch (the app's own `win.show()` at ready-to-show, blocked and counted, 26 of 26). All input went into offscreen pages; audio muted at switch level. The two 25-minute sweeps ran at below-normal priority.
- **Registry:** the HKCU Run and StartupApproved\Run keys were hashed before and after every driver run (read-only): unchanged in every run.
- **Judy's lease:** `judy-hover57-sweep` is live and untouched (`headless-browser.mjs list` used read-only, 3 times).
- **Browsers started by me:** 0.
- **Killed by me:** 0 (no `taskkill`, no kill by image or PID; the drivers only end their own child handle on timeout and none timed out; every launch exited by itself).
- **Electron launches:** 101 (lane 1: 22; lane 2: 26 + 26 + 26 + 1 control, the first two lane-2 passes being the failed ones in section 2).
- **Leak count: 0.** Method: read-only `Get-CimInstance Win32_Process` listing of all 447 processes with command lines, matching my scratch path, my script names and my app-name marker (`hover-search-qa`, `hq-main.cjs`, `hq-real-main.cjs`, `hq-run.mjs`, `hq-real-run.mjs`, `QL-HoverSearch`), shells excluded: **0 processes**; `electron.exe` 0; `QuickLauncher.exe` 0. The 8 `msedge.exe` on the machine all carry `--user-data-dir` inside lease `hb-f038d97d1940` (Judy's live lease), none mine.
- **Repo state:** `git status --porcelain` shows only the 4 pinned files, before, during and after; HEAD still `e8d9ceb`; the four hashes re-taken at the end are identical to the pin. This report is the only file I wrote in the repo.
- **Scratch:** `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ee1f77cf-5889-412e-b022-29b9109a8847\scratchpad\hover-search-qa\`: `head\`, `patched\`, `variant-orphan\` (snapshots), `hq-main.cjs`, `hq-search.cjs`, `hq-core.cjs`, `hq-run.mjs`, `hq-real-main.cjs`, `hq-real-run.mjs`, `cmp-sweep.mjs`, `show-detail.mjs`, `show-flow.mjs`, `leak.ps1`, `runs\<tag>\result.json` for every run (`full-head`, `full-patched` are the 4,040-reading differential; `d-patched`, `d-head-1`, `d-head-sep` the per-control readings and crops under `out\`; `pickerflow`, `pickertable`, `searchtable` the search runs; `real-patched` lane 2).
