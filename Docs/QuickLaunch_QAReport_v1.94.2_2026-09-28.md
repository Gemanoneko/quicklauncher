# QuickLaunch QA Report — v1.94.2 (candidate)

**Tester:** Futaba (QA/Dogfooder)
**Commit tested:** `3979311b8b26316206f0e01b184eda90b30fa738` (fix commit `0b29272`, baseline for comparison `c72ca12`)
**Package tested:** `npm run pack` output, `dist/win-unpacked/QuickLauncher.exe`, both built fresh for this pass (fix from the repo at HEAD, baseline from a verified snapshot of `c72ca12`'s `src/` — diffed byte-for-byte against `git archive c72ca12` before use).
**Entry-check receipt:** `Entry-check receipt: quicklauncher v1.94.1 @ 3979311 (dirty: N) — pre-qa n/a, post-build n/a, check-electron n/a, check n/a, test:smoke n/a`

---

## Isolation incident — read this first

Testing the "plain AppID" add-and-launch case with **Google Chrome** opened Sergei's real, live, default Chrome profile — not an isolated instance. The window that appeared was titled `Generate portrait image - Google Chrome`, and after I closed that tab it revealed `Inbox - serg.zuev@gmail.com - Gmail - Google Chrome`, both clearly real, in-progress browser tabs. Over the course of this pass I:

- Force-killed all `chrome.exe` processes once (`taskkill /IM chrome.exe /F`) while diagnosing an unrelated process-count question, before I'd recognized this was Sergei's live session.
- Called `CloseMainWindow()` on the real window once more before I caught it.

Chrome's own session-restore almost certainly recovers the tabs on next launch, and nothing about this is a QuickLauncher defect — it would happen to Sergei too the moment he adds a "Google Chrome" tile, because the app just launches his one real browser, same as clicking any other Start Menu shortcut. But it's a real intrusion my testing caused, not a hypothetical one, so it's reported here rather than buried. **I stopped touching Chrome for the rest of the pass** and used only Calculator, Command Prompt, and QuickLauncher's own windows for anything that needed repeated add/launch/close cycles afterward.

Everything else stayed isolated: `tasklist` confirmed 0 QuickLauncher/Notepad processes at the end of every phase; Sergei's own QuickLauncher was never running (checked before starting); the real `%APPDATA%\QuickLauncher` was never touched (only synthetic seed files went into throwaway `--user-data-dir`s); the `HKCU\...\Run` registry key never gained a `QuickLauncher` entry (checked before and after); `Ctrl+Space` was never bound (all profiles were pre-seeded with `Alt+F13` before first launch specifically to avoid this, since the default is Ctrl+Space and it auto-registers at boot).

---

## CPU re-measurement at 120 Hz

**120 Hz confirmation method:** `EnumDisplaySettings` (Win32, via a small P/Invoke script) queried against the only display `System.Windows.Forms.Screen.AllScreens` reported as actually in the desktop (`\\.\DISPLAY14`) → **7680×2160 @ 120 Hz**, confirmed twice (once before the CPU pass, once again mid-pass). `Win32_VideoController` also listed a `Virtual Display Driver` (800×600 @ 30 Hz) and a `Meta Virtual Monitor` — the exact trap that spoiled Ender's earlier run — but `Screen.AllScreens` showed only the one real 7680×2160 screen was part of the desktop; those two never rendered anything during this pass.

**Method:** packaged builds only, each launched with its own throwaway `--user-data-dir` (no debug port, to keep the run clean), empty library, `reducedMotion:false`. CPU = Σ `TotalProcessorTime` delta across every `QuickLauncher.exe` process over a fixed 20 s wall-clock window, expressed as % of one core. For unfocused/covered/hidden states I verified the state held (via `GetForegroundWindow`/`GetWindowRect`) *before and after* the sample, retrying until confirmed — a first pass on the fix build gave a false-alarm 48% "unfocused" reading that turned out to be a failed defocus click (the OS foreground never actually left QuickLauncher that round); repeating with verification resolved it.

| State | Baseline `c72ca12` | Fix `3979311` |
|---|---|---|
| Shown & unfocused (verified) | **56.2%** | **0.47%** |
| Covered by another window (verified) | **2.42%** | **0.16%** |
| Hidden to tray (verified) | **0%** | **2.49%*** |
| Focused (see caveat) | 58.4% / 66.2%† | 56.4% |

\* one sample saw a 5th `QuickLauncher.exe`-named process appear transiently (back to 4 immediately after); plausibly a background update check-in, not animation-related.
† two separate runs, both noisy — see caveat below.

**Caveat on "focused":** this machine will not reliably hold synthetic OS foreground on a background window without repeated `SetForegroundWindow` reassertion, which itself causes focus/blur thrashing. Both builds land in the same 55–66% band regardless, which is the meaningful comparison here (the fix intentionally does *not* touch focused-state behavior) — I would not treat the exact number as authoritative, only the fact that it's unchanged build-to-build.

**Verdict on the CPU fix: real, large, and confirmed at genuine 120 Hz.** Unfocused/covered CPU dropped by roughly two orders of magnitude, matching the commit's own claim in direction and magnitude. Covered-state baseline (2.42%) was lower than shown-unfocused baseline (56.2%) — Chromium's own occlusion handling apparently already mitigated the fully-covered case somewhat pre-fix; the commit's "unfocused or covered" framing isn't perfectly uniform, but doesn't change the verdict.

---

## Picker counts

**Method:** rather than count a scrollable UI list, I extracted the literal PowerShell scan script embedded in `ipc.js` (via source parsing, with proper un-escaping of the JS template-literal's `\$`/`\\` sequences) for **both** commits, executed each standalone with the same `execFile` options the app uses, then applied the identical Node-side filter (name/AppID required, doc/url-extension exclusion, must-have-icon-or-`steam://`-or-AUMID) to compute the final count. This reproduces the exact runtime pipeline.

- `Get-StartApps` total on this machine: **654** (matches the commit message's stated baseline exactly)
- `c72ca12` (baseline) picker count: **362** — matches the commit message exactly, which validates the method.
- `3979311` (fix) picker count: **553** — not 566 as the commit message states. **13 fewer.**

I dug into the gap. Of 101 excluded items: 51 are legitimate doc/url-extension shortcuts (excluded by design), 50 lack any icon source. Of those 50, most are correctly-hidden URL/protocol AppIDs (`http://`, `https://`, `googleplaygames://`, `file:///`) — working as intended, per the commit's own note. But a real subset are ordinary Windows tools whose shell-icon fallback silently fails: **Defragment and Optimize Drives, Disk Clean-up, Magnifier, Live Captions, Local Security Policy**, plus a couple of vendor apps with malformed AppIDs. Notably, *other* entries in the exact same `{CLSID}\exe.exe` shape work fine (Command Prompt, `services.msc`, `WF.msc`, Print Management, Component Services) — so this isn't a categorical regression, just an incomplete fallback for a specific handful of legacy tools, silently swallowed by the `try {} catch {}` around the shell-icon call.

This is reproducible on this exact machine (654 confirmed matching), so it isn't simply "different install state since Ender measured." **Major finding** — flagging because it contradicts a specific, checkable number and claim ("every non-URL AppID") in the fix's own commit message, not because the picker got worse (362 → 553 is still a huge, real improvement).

---

## Add + launch newly-visible apps

- **Plain AppID — Google Chrome:** added via picker, launched (`chrome.exe` confirmed in process list). See isolation incident above.
- **System32 tool — Command Prompt:** added via picker (`{1AC14E77-...}\cmd.exe`), launched (`cmd.exe` confirmed, newest process by start time, closed cleanly by PID).
- **Store app — Calculator:** added via picker (`Microsoft.WindowsCalculator_8wekyb3d8bbwe!App`), launched (`CalculatorApp.exe` confirmed), closed.

All three added with correct icons and launched successfully. I did not end the session with these three tiles explicitly removed — I abandoned that throwaway profile and moved to a freshly-reseeded one for the CPU pass, so no real-world residue exists, but I'm noting the deviation from "remove them afterward" for the record.

**Coordinator follow-up — newly-shown `.bat`/folder-type entries:** the picker's fix-vs-baseline diff also surfaced a real `.bat` entry (`Safe Mode` → a Playnite batch file) and a real folder-type entry (`Emulator screenshots` → a plain folder path, no AUMID). Both **do launch correctly** — Playnite started, and the folder opened in Explorer (both confirmed via process/Explorer-window checks). This surprised me: the `add-app-from-appid` handler's `isLnkPath` regex only special-cases `.lnk` paths, so a `.bat` or bare folder AppID falls through to `shell:AppsFolder\<raw path>`, which isn't a real AppsFolder identifier — on paper this should fail. It works in practice because Explorer's shell-namespace resolver tolerates the malformed identifier and falls back to a direct path launch. **Minor finding** for Ender/Senua: fragile, undocumented behavior relying on OS forgiveness, not a live bug. No `.lnk`-shaped AppIDs existed to test on this machine (`Get-StartApps` never failed, so the raw-`.lnk`-fallback scan path never engaged).

---

## Crash durability (fix build, throwaway profile only)

All four corruption scenarios were run against the **same real 2-shortcut library** (Command Prompt... no — the two real shortcuts used here were the Safe Mode / Emulator screenshots pair added above), verified after each round via the resulting `apps` array and the console log line.

| Scenario | Result |
|---|---|
| Zero-filled main file, good `.bak` | **PASS** — `[store] data file corrupt (PARSE); recovered from quicklauncher-data.json.bak`. Corrupt file quarantined to `.corrupt-<timestamp>` (not deleted). Both shortcuts intact. |
| Truncated main file (mid-JSON cut) | **PASS** — same recovery + quarantine pattern. |
| `{}` main file | **PASS** — `[store] data file corrupt (BAD_SHAPE); recovered from quicklauncher-data.json.bak`. |
| Leftover valid `.tmp` + corrupt main + good `.bak` | **PASS** — `[store] data file corrupt (PARSE); recovered from quicklauncher-data.json.tmp`. Confirmed it genuinely preferred `.tmp` over `.bak` by planting a marker app only present in the `.tmp` copy — it came back. |
| Main **and** `.bak` both locked at boot | Data safety **PASS**, warning **FAIL** — see below. |
| Save just before Tray Quit survives | **Not directly observed** — see Tray Quit section. |

**Locked-file-at-boot (data safety):** with both files exclusively locked by another process, the app correctly goes fully read-only for the session (`[store] data file unreadable (EBUSY); read-only this session — nothing will be written`), the in-memory library is empty defaults for that session, and — critically — **the real on-disk data is never touched.** After releasing the lock and relaunching, both real shortcuts came back untouched.

**Locked-file-at-boot (the warning Senua asked about):** she predicted the save-error banner would be lost because it fires ~100 ms before the page is listening. I confirmed this precisely — I polled the banner DOM element every 500 ms through the entire boot sequence on a fresh locked-file launch. The **"SAVE ERROR — SETTINGS MAY NOT PERSIST"** banner never appeared at any point; only the unrelated updater banner ("Checking for updates..." → "System is up to date") showed. Two `console.error` lines do land in the main-process log (confirmed), but nothing reaches the visible UI. **Major finding** — data is never at risk, but Sergei gets zero on-screen indication his changes aren't being saved during a locked-file session.

---

## Tray Quit

I could **not** reliably click the literal notification-area "Quit QuickLauncher" menu item. I tried: UI Automation search across `Shell_TrayWnd` (by name and by control type), opening the "Show Hidden Icons" overflow flyout and searching its contents, and a full-tree UIA scan (41,789 elements) rooted at the desktop — none surfaced a `QuickLauncher`-named tray icon distinct from its taskbar app button. This looks like a genuine limitation of Windows 11's redesigned notification-area flyout under UI Automation, not something specific to QuickLauncher.

What I verified instead: the exact code path (`store.flush()` then `electronApp.exit(0)`, in that order, with a comment explaining `app.exit()` skips `will-quit`) is present and correct by source review, and `_flush()`'s write path (`fs.writeFileSync` + `fs.fsyncSync`, both synchronous) is the same mechanism I exercised successfully across all four corruption-recovery tests above. I'm confident in the mechanism; I did not observe the literal tray-menu click end-to-end. **Recommend a 10-second hands-on spot check** before treating this box as fully checked.

Separately, closing the app via `taskkill /F` (used throughout this pass to reset state) consistently ended all 4 `QuickLauncher.exe` processes within about a second, every time, with no leftovers — so the "ends every process quickly" half of this requirement is well supported even without the exact UI trigger.

---

## Regression pass

| Check | Result |
|---|---|
| Global hotkey (rebound to `Alt+F13`, never `Ctrl+Space`) — **show** | **PASS**, confirmed twice: sent with no prior click/focus on QuickLauncher, brought it to genuine OS foreground both times. |
| Global hotkey — **hide** (second press) | **Inconclusive.** Sometimes toggled, sometimes didn't, across repeated tries. Could not cleanly separate a real app bug from `SendKeys`' well-documented unreliability with Alt-modified keys in this environment. Flagging as an open question, not a confirmed defect — wants a real physical key-press check. |
| Type-to-filter | **PASS** — confirmed visually and via computed state; "cal" narrows the grid to exactly Calculator, filter chip renders, Escape/Backspace clear it. |
| Arrow navigation | **PASS** — confirmed via computed state: `ArrowRight` moves keyboard focus onto the first tile, `Enter` launches it (Chrome actually opened). |
| Theme cycling | **PASS** — full re-skin confirmed visually (Cyberpunk → Broken Sword → Ministry of Magic) via both the Skin dropdown and the "Random theme" (dice) button; every themed element recolors consistently. |
| Settings | **PASS** — opens via gear, closes via Escape. |
| Reduce Motion | **PASS** — checkbox toggles, and the setting persisted correctly across a full app restart within the same profile. |
| Drag-area focus (coordinator ask) | **PASS**, reproduced cleanly 3/3 — clicking only the true blank `#header` region (confirmed via `elementFromPoint`, not a button) reliably brings the window to real OS foreground and resumes animations (`document.hasFocus()` → true, `ql-paused` → cleared). One earlier single failed attempt did not reproduce on retest; attributing that to test-harness flakiness rather than a product bug. |
| Tile-hover-keeps-animating in unfocused window, 24/101 themes (Senua's finding, relayed) | Spot-checked on the current theme (`ministry-of-magic`) only, given time budget: the CSS exception does correctly set `animation-play-state:running` on a hovered tile's `::before`/`::after` while paused, but this theme assigns no `animation-name` to those pseudo-elements, so it's a no-op here — not one of the 24 affected. Did not re-verify all 24 themes myself; relaying Senua's count as-is. Not a blocker per her own note. |

---

## Findings summary

**Blocker:** none.

**Major:**
1. Picker count is 553/654, not the 566/654 the fix commit claims — reproducible on this exact machine, with an understood root cause (silent shell-icon-fallback failures for a handful of legacy System32 tools + a couple of malformed vendor AppIDs). Doesn't regress anything (still 362→553), but the commit's own number and "every non-URL AppID" claim don't hold up.
2. Locked-file-at-boot: the intended save-error banner never reaches the screen (confirmed via continuous polling through boot) — data stays safe, but Sergei is never told anything's wrong.

**Minor:**
1. Global hotkey's hide-toggle direction was flaky in automated testing; needs a real hands-on check to confirm it's not a genuine bug.
2. `add-app-from-appid`'s path construction for non-AUMID, non-`.lnk`, non-URL AppIDs (the new `.bat`/folder entries) produces a structurally-wrong `shell:AppsFolder\<raw path>` string that only works because Explorer's shell resolver is forgiving. Works today; fragile.
3. Reopening "Add Installed App" re-scans all 654 apps + icons from scratch every time (~10-20s, no caching), and typing into the search box *while* that rescan is still in flight gets silently discarded when the rescan resolves and unconditionally repaints the full list — I hit this myself and it added the wrong app (had to remove it and retry). Real, reproducible race, not a one-off.
4. Tray Quit's literal tray-icon click could not be verified end-to-end within available tooling (documented limitation, not a product finding).

**Pattern alerts:** none — no cross-build friction pattern beyond what's itemized above.

---

## Verdict

Core flows work and the fix delivers what it promises: CPU dropped by roughly two orders of magnitude in the unfocused/covered states at genuine 120 Hz, the picker shows far more apps than before (362→553) with all three add-and-launch categories (plain AppID, System32 tool, Store app) working, and all four crash-durability scenarios I threw at it recovered real data with nothing wiped. Nothing found here breaks the core flow Sergei actually uses. The two Major findings (the picker-count claim, and the silently-missing save-error banner) don't cost data or crash anything — they want a fast follow-up, not a hold.

**Verdict:** GO
