# QuickLaunch v1.94.3 — QA Report (FINAL, commit af3b3bc)

Author: Futaba (QA). Target release: **v1.94.3**. `package.json` still says 1.94.2 (the bump happens at release), so the app header, the launcher and the installer name all read 1.94.2 in this build; recheck the header after the bump.
**Commit tested: `af3b3bc`** (main). Code commits since v1.94.2: `a76728f`, `2597ad2`, `c544c26`, `af3b3bc`. An interim pass on `2597ad2` is kept in the last section.

Receipt line (qa-handoff, run on receipt; the tool declares no check scripts):

`Entry-check receipt: quicklauncher v1.94.2 @ af3b3bc (dirty: Y) — pre-qa n/a, post-build n/a, check-electron n/a, check n/a, test:smoke n/a`

`dirty: Y` is the two untracked v1.94.3 report files only (`git status --short` shows nothing else), exactly as the brief described. I did not receive Ender's receipt line, so identical receipts are not established.

Build: `npm run pack`, exit 0, 17 s (limit 600 s), `dist/win-unpacked/QuickLauncher.exe` built 08:51. The asar contains the new code (`_emitSafe`, the `tray` import in `ipc.js`).

## How it was tested

- **Every packaged launch went through `scripts/qa/quicklaunch-safe-launch.mjs`.** The exe was never run directly. Six launcher runs, each on a throwaway profile seeded with `startWithWindows: false` and either no hotkey or `Ctrl+Alt+F9` (Ctrl+Space was never bound). `CITE:` lines:
  1. `CITE: ql-safe-launch PASS | v1.94.2 | profile prof-core | pid 27344, 4 proc | ended timeout | 0 left | Run unchanged, StartupApproved\Run unchanged`
  2. `CITE: ql-safe-launch PASS | v1.94.2 | profile prof-picker | pid 11896, 8 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged`
  3. `CITE: ql-safe-launch PASS | v1.94.2 | profile prof-settings | pid 21500, 4 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged`
  4. `CITE: ql-safe-launch PASS | v1.94.2 | profile prof-settings | pid 20312, 4 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged` (restart 1)
  5. `CITE: ql-safe-launch PASS | v1.94.2 | profile prof-settings | pid 6884, 4 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged` (restart 2)
  6. `CITE: ql-safe-launch PASS | v1.94.2 | profile prof-cheat | pid 9996, 4 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged`
- The app was driven over the remote-debugging port (renderer events and reads) plus a few real OS actions where the feature needs them (global hotkey via `keybd_event`, a real header drag, the real tray icon and menu).
- Corrupt, missing and locked-at-boot behaviour: **store-level probes only, never a launch** (Ender's `store-readonly-probe-r5gate.js`, `m1-listener-probe.js`, `store-crash-probe.js`, copied into `ql-qa4/probe/` so his folders were not touched, plus my own `m6_timeline.js`). Each probe that guards a fix was also run against the old `2597ad2` source as a positive control.
- **"Start with Windows" was never toggled in a packaged run.** Its tray/Settings sync is verified by proxy (Ender's dev-harness evidence, below).
- My own start-of-task and end-of-task exports of `HKCU\...\Run` and `...\StartupApproved\Run` are byte-identical (same hashes), on top of each launcher's own before/after diff.

## Results

| # | Check | Result |
|---|---|---|
| 1 | Build | PASS |
| 2 | Idle CPU pause (hidden, unfocused) | PASS |
| 3 | Hotkey, non-Ctrl+Space (`Ctrl+Alt+F9`) | PASS |
| 4 | Filter | PASS |
| 5 | Theme cycling | PASS |
| 6 | Picker: icons appear, stays responsive | PASS (see note on 35 placeholders) |
| 7 | Settings: Random theme persists across restart | PASS |
| 8 | Settings: Random theme in sync with the tray, both ways | PASS |
| 9 | Window position and size survive a setting change and a restart | PASS |
| 10 | Tray "Start with Windows" follows the Settings checkbox | PASS by proxy (Ender's harness evidence, not re-run) |
| 11 | Tray Quit ends all processes, from every screen reachable | PASS (5 screens) |
| 12 | m6 banner timing (lock clears within ~10 s: none; never clears: ~10 s) | PASS (store level, with control) |
| 13 | Merge survives a throwing listener (c544c26) | PASS (store level, with control) |
| 14 | Durability re-run | PASS (store level) |

### 2. Idle CPU pause
CPU is summed over my instance's whole process tree (matched by profile path, never by image name) with `TotalProcessorTime` deltas over 12 s. State is read from the app itself: `body.ql-paused`, `document.hidden`, `document.hasFocus()`, and the OS foreground window.
- Focused and visible (context only): 14 to 17.5% of one core. Known, and out of scope (the focused-CPU spec was not shipped).
- **Hidden** (hidden by the hotkey; `paused: true, hidden: true`): **0.26% of one core** (0.01% of the machine, 32 logical).
- **Unfocused but visible** (`paused: true, hidden: false, hasFocus: false`, foreground not mine, verified before and after the sample): **1.04% of one core** (0.03% of the machine).
- Two earlier "unfocused" attempts were invalid and are discarded: an external `ShowWindow` did not change the app's own focus state, and one de-focus helper failed on a transient `Add-Type` error. Those samples were still focused (about 14%). The valid sample is the third.

### 3. Hotkey (`Ctrl+Alt+F9`, real key events)
`get-global-hotkey-status` reported `Ctrl+Alt+F9` registered. Visible and focused: hides. Hidden: shows, focuses, and `ql-paused` clears. Visible but unfocused: shows and focuses (does not hide).

### 4. Filter
Typing `cal` leaves only Calc visible with chip "CAL". Backspace gives "CA". Esc restores all four tiles and hides the chip. `zzz` leaves none; Esc restores all four.

### 5. Theme cycling
14 clicks of the dice button: 11 distinct themes, no back-to-back repeat, all 14 in the app's list of 101 valid themes, the theme persisted to disk equals the last one shown, 0 console errors or exceptions.

### 6. Picker (packaged, real "+ INSTALLED" click)
- Rendered at 14.9 s (PowerShell scan time, spinner shown then hidden). 315 IPC round trips to the main process during the scan: **max 161 ms, p99 3 ms, mean 1.5 ms** (last round: max 156 ms).
- **567 items; 532 have a decoded icon (0 broken images); 35 show the placeholder.** All 35 placeholders are Steam game entries (icon comes from Steam's library cache). I have no v1.94.2 packaged build to A/B this, and the scan script and filter did not change since v1.94.2, so I believe it is existing behaviour, but I did not prove that. One more item ("20 Minutes Till Dawn") decodes correctly but its 256x256 icon is 96.5% transparent, so it renders as a dot; source data, not a decode fault.
- Screenshot: `C:/Users/AnGeLZzZ/AppData/Local/Temp/claude/C--Antigravity-Projects-Studio-Illuminati/591a39e2-eec4-4705-af3d-578ee5211de6/scratchpad/ql-qa4/shot-picker-open.png`

### 7 to 9. Settings and window bounds
Profile started with Random theme ON, no saved window bounds.
- Resized by IPC to 500x360, then a real mouse drag of the header: saved to disk as position (274,177), size 500x360, matching the real window rectangle exactly.
- Changed icon size to 80, toggled Reduced motion, toggled Random theme OFF: each persisted, and **the window bounds never changed on disk or on screen** (this is the `c544c26` fix; before it, any setting change reset them to the launch values).
- Restart 1 (Random theme ON, icon 80, reduced ON): all persisted, and the window opened at exactly (274,177) at 500x360.
- Random theme OFF, restart 2: checkbox and file still OFF, theme unchanged, window at (274,177) 500x360.
- Sync with the tray (real tray menu, screenshots): Settings ON shows the tray item checked; tray click turned it OFF and the Settings checkbox, the IPC value and the file all flipped; the tray menu then showed it unchecked; a second tray click turned it back ON in Settings, file and IPC. "Start with Windows" stayed off throughout and was never clicked. Screenshots: `.../ql-qa4/shot-tray-random-true.png`, `.../ql-qa4/shot-tray-random-false.png`.

### 10. Tray "Start with Windows" (proxy)
Ender's dev harness (unpackaged, so the login-item code never runs; `setCalls: []`) shows the tray following the Settings checkbox with `af3b3bc`, and it also flips the overlay when the tray is clicked: `<scratch>/ql-fix4/results/sw-fix.json`. The same scenario against `c544c26` is the positive control: the tray stays stale (after Settings ON, `tray: false`): `<scratch>/ql-fix4/results/sw-c544c26.json`. `<scratch>` is `C:/Users/AnGeLZzZ/AppData/Local/Temp/claude/C--Antigravity-Projects-Studio-Illuminati/591a39e2-eec4-4705-af3d-578ee5211de6/scratchpad`. I read these result files; I did not re-run his harness. Treated as verified by proxy, per the brief.

### 11. Tray Quit, from every screen I could reach
Real tray icon, real context menu, launcher reported `ended by exited`, 0 processes left, each time: main grid (run 5 of the list above, pid 6884); picker overlay open (pid 11896); Settings overlay open (pid 21500); edit mode (pid 20312); shortcut cheat-sheet overlay (pid 9996). Exit took 1 to 3.6 s including the automation. Not tried: fullscreen (the taskbar is hidden there, so the tray is not reachable). **Run 1's Quit is invalid** and is not counted: the launcher's 240 s cap ended that app before my click (see the ledger).

### 12. m6 banner timing (store level)
Real `store.js`, real exclusive lock, real timers, Random theme ON (a boot save is refused), plus a renderer save at 2 s. Times are from process start; the store finishes loading at about 1.5 s (boot read retries).

| Case | af3b3bc | 2597ad2 (control) |
|---|---|---|
| A: lock clears at 3 s | **no banner**; edits reached disk | banner at **1.65 s** (the m6 bug) |
| B: lock clears at 7 s | **no banner** | banners at 1.64 and 3.65 s |
| C: never clears | first banner at **11.54 s** (10 s timer + ~1.5 s), another at 14.15 s for a refusal after the mark; bytes unchanged, no `.tmp` | first banner at 1.64 s |

So it holds: a lock that clears within about 10 s shows nothing, and one that never clears shows the banner at about 10 s. Ender's dev-harness `notice` runs (`<scratch>/ql-fix4/results/n-heal*.json`, `n-never-*.json`) exist as a second source; I did not read them beyond their names. **Not re-verified on af3b3bc:** the banner's on-screen look in a packaged run, because the launcher refuses locked-at-boot profiles. The renderer and CSS did not change since `2597ad2` (the diff is `index.js`, `ipc.js`, `store.js` only), where the look was verified (interim section).

### 13. Merge fix (`c544c26`, store level)
`m1-listener-probe.js`: **28/28 on af3b3bc; 12/28 on 2597ad2** (the control loses the disk-only shortcut whenever a `reconciled` or `renderer-sync` listener throws). `store-readonly-probe-r5gate.js`: 18/18 on both trees (it is the copy that tolerates both banner behaviours): deletes made while read-only stick, on-disk shortcuts are kept, duplicates dropped, stale renderer saves merged, and a crash at every step of the merged save never loses the original 25.

### 14. Durability (store level, `store-crash-probe.js`)
Crash at every filesystem step of a boot save, data zero-filled and truncated models: 10 crash points, 0 loss. Damaged states at boot: zero-filled, `null`, `{"apps":null}`, `{}` main with a good `.bak`, and main missing with a valid `.tmp`: all recover all 25 shortcuts (corrupt file quarantined). Three rows report loss: zero-filled, empty, or truncated main **and** `.bak` together. That is by design (no intact copy exists; both files are quarantined, not deleted) and matches last round's all-corrupt case. Locked at boot (60 ms, 600 ms, 8 s, and main+`.bak` 8 s): 0 loss after unlock and the next save.

## Not verified
- Packaged banner look on `af3b3bc` (see 12); banner and edit bar on screen together.
- "Start with Windows" tray sync in a packaged build (proxy only, by instruction).
- Live v1.94.2 A/B for the picker item and icon counts.
- Tray Quit from fullscreen.
- I did not toggle the Settings theme picker (only the dice button and the random checkbox).

## Findings

**Blocker: none.**

**Major (process, not a defect in this build; status open)**
- **M-1 (carried from the interim pass, my breach): Sergei's HKCU Run autostart entry was probably deleted or overwritten by my `2597ad2` test instances.** Details in the interim section. Current state: still no QuickLauncher value in HKCU Run or StartupApproved\Run (checked at the end of this pass; unchanged from the start of it). It should reappear when Sergei relaunches his installed QuickLauncher, which Jane has planned for after all testing. I did not touch the registry. This pass did not change the Run key (6 launcher diffs plus my own export diff).

**Minor**
- **m-1 (product design, Ender/Sergei to weigh):** the login item is keyed by app name, so any second packaged instance can create, overwrite, or remove the real entry. No effect on the single-install case.
- **m-2 (UX, pass to Judy):** with the m6 gating, a save refused before the ~10 s mark is only logged. Edits made in the first 10 s of a lock that never clears, then lost at Quit, produce no notice at all; after the mark there is only an 8 s banner, and no persistent "read-only" indicator. The banner text says "SETTINGS MAY NOT PERSIST" but the shortcut library is what is lost. Behaviour matches the brief; the visibility does not help Sergei.
- **m-3 (observation):** 35 of 567 picker entries show the placeholder icon (Steam games) and one has a near-empty source icon; no v1.94.2 baseline (see 6).
- **m-4 (note):** the version reads 1.94.2 everywhere until the release bump; check that the packaged header and the artifact read 1.94.3 afterwards.

Pattern alerts: 2 — (1) QA runs of the packaged tool escaping into machine-global state that the plan had not inventoried (last round a signed-in browser, then the HKCU Run entry and Ctrl+Space); disposition: **fix**, now in place and proven this pass (the safe launcher was used for every launch, Run unchanged in all 6 runs and in my own diff; pending Jane's confirmation of the disposition). (2) My own coordinate clicks on Sergei's screen without proof the target existed (twice this pass, see the ledger); disposition: **fix** in the harness (the tray script now refuses to click unless it finds the live menu window and positions from that window's rectangle), and the pattern to watch for next pass.

## Isolation ledger (this pass)
- Every packaged launch went through the safe launcher (6 runs). Ctrl+Space was never bound; `Ctrl+Alt+F9` was registered only during run 1. No app was launched from a tile; no browsers, mail, messengers or signed-in apps. Kills were only by the launcher (its own process tree); I never used `taskkill`.
- The app windows showed and took focus during runs (normal for the app). My scripts moved the real cursor (tray clicks, one header drag, cursor restored each time) and sent real key events (`Ctrl+Alt+F9`, plus one unmapped F24 key event so Windows would let me move focus to the taskbar for the unfocused-CPU sample).
- **Slip 1 (run 1):** I took a screenshot of the open tray menu at 08:58:44, and the launcher's 240 s cap ended the app about 2 s later, before I clicked. My click at (543,333) therefore landed on the Claude desktop window (plain transcript text). Nothing visibly changed and no dialog opened. Run 1's tray Quit is not counted. From then on: runs got a 300 s cap and the tray script clicks only if a live menu window of mine exists.
- **Slip 2 (run 2):** the menu window's rectangle includes about 36 px of shadow, so my first computed click landed inside my own picker overlay instead of the menu (library unchanged; the picker stayed open). Fixed by deriving offsets from the rectangle and confirming on a screenshot.
- My tray script left the tray overflow flyout open twice; both times I closed it. It is closed now.
- The full-screen screenshots of the tray state (`shot-tray-*.png`, `shot-menu-*.png`, `shot-after-stray-click.png`, `shot-flyout-closed.png`) show unrelated desktop content (other session titles). They are in scratch only, not in the repo. Scratch: `.../scratchpad/ql-qa4/`.
- Close-out: 0 QuickLauncher.exe, 0 electron.exe, no helper processes of mine; HKCU Run and StartupApproved\Run byte-identical from start to end; repo HEAD `af3b3bc`, untracked files are the two v1.94.3 reports only; `dist/` was regenerated by my `npm run pack` (gitignored).

## Interim pass on 2597ad2 (kept for the record; superseded by the results above)

The interim pass ran the packaged exe directly, before the safe launcher existed. Its interim verdict for `2597ad2` was NO-GO because coverage was incomplete (five regression checks and the per-icon check were not run), not because of a product defect; that verdict does not carry over.

| Check on 2597ad2 | Result then |
|---|---|
| Build (`npm run pack`, exit 0) | PASS |
| Picker: 567 items rendered, max IPC stall 36 ms direct / 156 ms via UI | PASS (per-icon check not done) |
| Banner a: both files locked at boot, banner up from the boot save (that behaviour was intentionally removed in `c544c26`); screenshot `.../ql-qa3/shot-bannerA.png` | PASS then |
| Banner b: only data file locked, random theme off, banner 11.8 s after launch; screenshot `.../ql-qa3/shot-bannerB.png` | PASS |
| Banner c: lock cleared in ~3.5 s, no banner in 14 s | PASS |
| Recovery: lock, delete + add + duplicate re-add, unlock, tray Quit: kept the on-disk shortcut, delete stuck, duplicate dropped | PASS |
| Recovery: quit while locked: about 1.2 s, edits lost, disk byte-identical | PASS |
| Durability D1 to D7 (zero-filled, truncated, `{}`, leftover `.tmp` x3, all-corrupt) | PASS 7/7 |
| Idle CPU, hotkey, filter, theme, settings; Quit from main/settings/picker | not run |

Banner look (interim): a full-width strip at the bottom edge, "SAVE ERROR — SETTINGS MAY NOT PERSIST" with a dismiss x, readable on the Brotherhood and Night City themes; auto-dismisses after 8 s.

Interim breach disclosures (still true):
- **Run key (M-1):** the packaged app rewrites the HKCU Run value (keyed by app name, not profile) at every boot from the profile's `startWithWindows`. My early profiles had `true` (writes my scratch exe path over any existing entry); my later profiles had `false` (removes an entry that matches its own exe). Sergei's installed build exists on this machine, and I never recorded the key before starting, so I cannot prove what was there. Instances that ran with `true`: the picker test, banner A x2, B x2, C, a mis-seeded empty-profile recovery launch, and D6 (all-corrupt falls back to defaults, which are `true`). With `false`: recovery 1 and 2, D1 to D5, D7. Reported to Jane the moment I noticed.
- **Ctrl+Space** was bound by the same instances (default and my early seeds), for the minutes each ran. Nothing else was running at the time, so nothing collided.
- **One kill by image name** (`taskkill /IM QuickLauncher.exe /T`) after the picker test; it would have killed Sergei's instance had it been running.
- **Banner test B run 1 was left running** when my session was interrupted; on resume I saw four QuickLauncher processes that vanished within seconds. I never got their command lines and did not kill them. Unattributed.
- The packaged instances contacted the release feed for an update check only (`autoDownload = false`).

**Verdict:** GO
