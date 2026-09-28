# Code Review — QuickLaunch v1.94.2

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-09-28
Tool: QuickLaunch (product QuickLauncher)
Release: v1.94.2
Commit range: c72ca12bd83513cf5fa3f639520b833cbd0263ec..0b292725856b020514abca8138980dd2c9698f92
              (one commit, 0b29272 "fix: idle CPU, missing picker apps, and shortcut loss after a crash").
              3979311 after it is docs only (Brief Decision Log + full audit) and was read for drift, not certified as code.
Files changed: 6 files, +345 / -66
              (src/main/{index,ipc,store,tray}.js, src/renderer/app.js, src/renderer/styles/base.css)
Method: static read of the diff and the full post-fix files (git show 0b29272:<file>), plus isolated Node
        probes in scratchpad/ql-review-v1942/:
          store-redteam.js  store.js@0b29272 loaded with a mocked electron against real temp files, 8 scenarios;
                            real Windows file holds/locks via hold.py (Python CRT open = no share-delete;
                            msvcrt byte-range lock = readers get EBUSY)
          misc-probes.js    directory fsync on Windows; template-literal output of the PowerShell regexes;
                            add-app-from-appid / launch-app routing table; trimIcon pixel-loop cost
          ids-classify.js,  run over Ender's own harness captures in scratchpad/ql-fix/results/
          dupnames.js       (IDs and counts only)
        QuickLaunch was not launched. dist/ was not touched. No PowerShell was run.
Stand-down dimensions: none
```

---

## Summary

The fix closes the audit's two Criticals. **C1** is closed because every generation is now written to `.tmp`, fsynced, and renamed into place, and `.bak` is produced by a rename, not an in-place copy. **C2** is closed because an unreadable file is quarantined or makes the session read-only instead of being overwritten with defaults. I tried to break both and could not find a path in this diff that destroys an intact copy made by the new code. It also closes M2 (the idle pause works), M6 and M8's stderr half for the picker, M9, M10, M11 and most of M12.

What is still broken is the **degraded-store experience**:
- Read-only mode is sticky for the whole session.
- It can show an empty library.
- It drops every edit at Quit.
- None of the degraded states (read-only, recovered, quarantined) reach the UI at boot.

The picker is also slower on the main thread than before. No safety-floor item was found. The Electron config and IPC channel list are unchanged. Nothing is written outside userData, and there are no secrets.

| Audit item | Status after 0b29272 |
|---|---|
| C1 no fsync, `.bak` copied in place | **Closed.** Ender's crash probe (scenario A) plus my S6: a failed final rename leaves main missing, `.tmp` newest and `.bak` previous, and the next boot or save recovers. |
| C2 load failure becomes an empty library written over both copies | **Closed for data.** S3/S4: nothing is written in read-only mode. S7: an unrenameable corrupt main is preserved as copies. The "surface it to the user" part is **not done** (see Major 2 below). |
| M2 animations never pause | Closed, with one residual hole (Minor 9). |
| M3/M4 scan on every open; main-thread image work | **Open and worse** (Major 3 below). |
| M6 entries dropped for lacking an icon | Closed for non-URL IDs: 362 → 566 of 654 shown (Ender's harness). |
| M7 fallback `.lnk` IDs unlaunchable | Closed for `X:\…` paths (Minor 6 covers the rest). |
| M8 failures swallowed; Cyrillic output | stderr and failures are now logged. The encoding half doesn't reproduce: Ender's harness shows 0 U+FFFD among 12 non-ASCII names in both runs, and I accept that. The user-facing half is still open (Minor 11). |
| M9 / M10 / M11 / M12 | Closed / closed / closed (retry, dirty flag) / mostly closed (Minor 12). |
| m7 `\s` lost in the template literal | Still present and now reachable (Minor 10). |

---

## Rubric

### 1. Security

- Status: Pass
- Findings: none.
  - The PowerShell program is a static template. The only interpolation is the DLL path, which is `'`-escaped (ipc.js:161).
  - AppIDs, names and `.lnk` paths only ever flow into PowerShell as data. `"shell:AppsFolder\\$appId"` (ipc.js:498) expands a variable, and PowerShell does not re-parse the value, so `$(…)` inside an AppID is inert.
  - `execFile` uses an argument array. No new IPC channels. webPreferences are untouched. stderr goes to the console only.

### 2. Correctness & Logic

- Status: Concerns
- Findings:
  - **[Minor] 6.** `src/main/ipc.js:599` — `isLnkPath` only accepts `X:\…\*.lnk`. A UNC path (`\\server\…`, e.g. folder-redirected AppData) or a forward-slash path still becomes `shell:AppsFolder\…` and won't launch (probe routing table). This is niche on a personal PC.
  - **[Minor] 8.** `src/main/ipc.js:377-386` — The exact-name index is first-wins on duplicate BaseNames. In Ender's capture, 9 names are shared by 24 Start entries ("uninstall" ×5, "readme" ×5, "settings" ×2, "slack" ×2, …, `dupnames.js`). All but one of each can be handed another shortcut's icon, and the shell fallback, which is always right, is then skipped. Fix: when a name maps to more than one `.lnk`, skip the index and fall through to the shell icon.
  - **[Minor] 11.** `src/main/ipc.js:535-541, 584-587` — Scan failures are now logged, but only to the main-process console, which a packaged build doesn't keep. A timeout or maxBuffer overflow still renders as "NO MATCHES — USE BROWSE TO ADD BY FILE" (app.js `renderPickerList`), so audit M8's user-facing half is still open. Headroom:
    - stdout is now 25.4 MB against the 64 MB `maxBuffer` (was 14.3 MB, +78%).
    - PowerShell time is 13.8 s against the 45 s timeout.
    - Fix: resolve `{ error }` and show a distinct picker state.

### 3. Crash / Stability Safety

- Status: Pass
- Findings: none.
  - Every fs call in store.js is inside a try or a result object.
  - The constructor's only throw path is `sleepSync` (`Atomics.wait` on the Electron main thread, store.js:29-31). I relied on Ender's Electron probe (`scratchpad/ql-fix/atomics/main.js`) for that and did not re-run it, because it launches Electron.
  - No TDZ risk: `idlePaused` (app.js:1133) is initialized before `init()` runs at app.js:2007.
  - No JS waits on `animationend` (grep: 0), so frozen animations can't stall logic.

### 4. Performance

- Status: Concerns
- Findings:
  - **[Major] 3.** `src/main/ipc.js:543-583` — The picker's post-processing in the main process grew from **2.5 s to 3.9 s (+55%)**.
    - Source: Ender's own harness, handler time minus PowerShell time: 18 108 − 15 612 ms before, 17 670 − 13 805 ms after.
    - The cause is 566 items (was 362) each going through a synchronous `nativeImage` decode, `trimIcon`, crop and PNG encode, plus `JSON.parse` of 25.4 MB of stdout.
    - My probe shows the `trimIcon` pixel loop itself is only about 0.18 ms per icon (about 100 ms total), so the cost is the image codec work, not the loop.
    - It runs on the Electron UI thread on every picker open and at every boot where any `shell:` tile lacks an icon (`refreshMissingIcons`, app.js:858-864, audit M3, unchanged). For those seconds the tray, global hotkey, IPC and window drag are frozen.
    - This diff didn't create the problem, but it makes it much worse.
    - Fix direction is the audit's M3/M4: cache the scan, and move trimming and encoding into the C# helper or a worker.
  - **[Minor] 3.** `src/main/store.js:256-269, 65-79` — The retry backoff sleeps on the UI thread.
    - A data file held by another process freezes the whole app for **1.07 s per save attempt** (S5), and window moves and resizes each trigger a save.
    - A locked file at startup blocks for **1.65 s** (S4).
    - It is bounded, so this is noted rather than urgent.
  - **[Minor] 9.** `src/renderer/styles/base.css:911-915` — The hover exemption keeps `.app-tile:hover::before` running while the window is unfocused. In **24 of 101 themes** that animation is `infinite` (akira, blade-runner, control, deus-ex, diablo, dune, … — git grep). A cursor parked on a tile of the unfocused window keeps one tile animating at display rate, which is a residual hole in the idle-CPU fix. Fix: exempt only finite hover animations, or drop the exemption.

### 5. State & Data Safety

- Status: Concerns
- Findings:
  - **[Major] 1.** `src/main/store.js:98-108, 130-134, 201-206` — **Read-only mode is sticky for the whole session and drops every edit.**
    - Nothing re-checks the data file after boot.
    - S3: the cause is cleared mid-session and a valid main is put back. 3 new shortcuts are then added and 3 flushes run (tray Quit, will-quit, session-end). The result is 4 save-errors, `_dirty` stays true, and nothing is written. The edits die at Quit.
    - S4: main and `.bak` are both locked for 8 s at boot. The session goes read-only and the user is shown **0 apps for the entire session**, and anything re-added is discarded.
    - QuickLaunch starts at login and runs for days, so one lock at login lasting more than about 1.5 s costs every edit until the next restart. If the cause is permanent (an ACL problem), it costs every edit in every session, and the library freezes at whatever `.bak` held.
    - Nothing on disk is lost, which is why this is Major and not Critical. The user does get an 8 s "SAVE ERROR — SETTINGS MAY NOT PERSIST" banner per edit, but not at boot (Major 2).
    - Fix direction is Ender's call: re-probe the data file on each flush, or on a backoff timer. When it reads and validates, leave read-only, reload from it, and tell the renderer. Edits made on the stale copy should be surfaced rather than dropped.
  - **[Major] 2.** `src/main/index.js:21-27, 46-50`; `src/main/store.js:98-139`; `src/renderer/app.js:852, 1683-1686` — **No degraded store state reaches the UI at boot.**
    - The states are read-only, "recovered from .bak/.tmp" and "nothing intact, files quarantined, starting empty".
    - All of them are `console.*` only, and packaged builds have no console.
    - The only UI channel is `store-save-error`. The boot one comes from the random-theme save and is sent about 100 ms after `createWindow`. The renderer registers its listener in `setupUpdateListeners()`, which runs after page load plus three awaited IPC calls. By construction that message is lost. I did not measure this, because it would need the app launched.
    - After a lock at login the user therefore sees an empty launcher with no explanation (S4). After a quarantine, nobody learns that `*.corrupt-*` files hold the old library. This is item 3 of the audit's C2 fix ("surface it through the existing banner"), which is still open.
    - Fix: keep a store status in main (`ok`, `recovered`, `read-only`, `quarantined-empty`). Have the renderer pull it with an `invoke` in `init()` rather than waiting for a push, and show a banner.
  - **[Minor] 1.** `src/main/store.js:113-115` — Recovery precedence has two holes.
    - (a) `.tmp` beats `.bak` with no age check. S2: main is corrupt, a 90-day-old valid `.tmp` holds 5 apps and `.bak` holds 10. Boot loads the **5**, and after one more save `.bak` = 5, so the 10-app copy is gone.
    - The new write path can't create a `.tmp` older than `.bak`: it is always the newest generation. Only a `.tmp` left behind by v1.94.1 or earlier (whose failed renames never cleaned it up) or an external copy triggers this. There is none in Sergei's userData today (`ls`).
    - (b) A **locked** `.tmp` is neither protected nor preserved, unlike a locked `.bak` (store.js:130-134). With main missing or corrupt and no `.bak`, boot proceeds with defaults and normal saving, and the next save overwrites that `.tmp`. That is the first-run crash window, read at the moment AV is scanning.
    - Fix: pick the newer valid of `.tmp`/`.bak` by mtime, and treat a locked `.tmp` like a locked `.bak`.
  - **[Minor] 2.** `src/main/store.js:215-222` — After a failed save, `_dirty` stays true, but only the *next* `set()`/`flush()` retries. S5: the lock clears and the machine crashes before another change. The next boot loads the older main (10), and the fsynced `.tmp` holding the newer generation (11) is ignored, then overwritten. Fix: a backoff re-flush timer while `_dirty`.
  - **[Minor] 4.** `src/main/store.js:144-153` — Quarantine has no cap or cleanup. When the rename fails, the copy fallback adds one file per boot for as long as the condition lasts (S7: 3 boots → 3 copies). It is bounded by real corruption events, so this is noted only. The names (`…json.corrupt-2026-09-28T16-49-12-345Z`) are unique to the millisecond and valid on Windows.
  - **[Minor] 5.** `src/main/store.js:241-246` — The "empty library never replaces a non-empty backup" rule does **not** block a deliberate delete-all. S1: main = 0 on the next boot, and after two more saves the user still sees 0. The old 10-app `.bak` is then kept indefinitely while the library is empty, so a later corruption of main resurrects the deleted shortcuts and writes them back as main (S1 last row: 10 back). This is an acceptable trade-off. Record it in the Brief's Decision Log row.
  - **[Minor] 12.** `src/main/tray.js:182-185` — Audit M12 is only partly closed. The store's 100 ms debounce is flushed before `app.exit`, but `window.js`'s 400 ms move/resize debounces are not, so a move in the last 400 ms before Quit is lost. This is trivial.
  - Notes on the brief's questions, without findings:
    - **Save order on Windows.** libuv's `rename` is `MoveFileExW(REPLACE_EXISTING)` with no write-through. A crash can roll back the last rename, which leaves the previous good generation, so the result is consistent. Directory fsync is possible (probe: Node on this machine opens a directory `r+` and fsyncs OK; `r` gives EPERM). It isn't needed for consistency on NTFS, only for durability of the very last save.
    - **Tray Quit / will-quit / session-end.** S8: set, then 3 flushes, produced **1** `.tmp` write, so there is no double write. The worst case is a bounded ~1.1 s sync block, with no hang.

### 6. Input Handling

- Status: Pass
- Findings: none. Load now validates shape (store.js:57-61: `null`, `{}`, `[]`, `{apps:null}` rejected). Picker output is parsed defensively. `add-app-from-appid` argument typing is unchanged (audit m14 carried).

### 7. Maintainability (no Critical findings on its own)

- Status: Concerns
- Findings:
  - **[Minor] 10.** `src/main/ipc.js:506, 513` — Audit m7 is carried forward and is now reachable. PowerShell receives `'^s*$'`, which is a no-op filter on `.lnk` names, and `'^s*,'`, which misses `" ,0"` and wrongly skips `"s,0"` (probe). Both fall through to later fallbacks, so I found no visible effect. Fix: `\\s`, as at ipc.js:464.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Concerns
- Findings:
  - **[Minor] 7.** `src/main/ipc.js:596-598` and the commit message both say `.lnk`-path IDs come from "the Get-StartApps-empty fallback".
    - Get-StartApps itself returns `.lnk`-path AppIDs: 20 of the 224 newly shown entries on this machine (`ids-classify.js` over `ql-fix/results/ids-newly.json`, e.g. `…\Start Menu\Programs\Accessibility\LiveCaptions.lnk`).
    - So the new branch also moves those main-path entries from `explorer shell:AppsFolder\…` to `shell.openPath`. That should work, but the comment understates the scope.
    - The newly shown set also includes a folder (`…\Documents\PCSX2\snaps`) and a `.bat`, both routed through `explorer shell:AppsFolder\<path>`. That is a behavior check, not a code finding.

### 9. Build & Release Hygiene

- Status: Pass
- Findings: none in range. No dependency, lockfile, build-config or Electron change. `package.json` is still 1.94.1 and `CHANGELOG.md` has no v1.94.2 entry; both are Sully's release steps. Audit M16 (Electron 32 end-of-life) is carried forward, outside this range.

---

## Patterns

The previous two reviews and the full audit all point at the same weakness: failure states that are handled on disk or in the log but never shown to the one user who could act on them. Examples are the scan timeout that looks like "no apps", save errors, and now read-only, recovered and quarantined store states. The code is getting good at not destroying data. It still doesn't tell Sergei when something went wrong.

Not verifiable statically, so flagged for Futaba's behavior pass:
1. Lock `quicklauncher-data.json` before launch and check whether any banner appears at boot (Major 2).
2. Launch one newly shown `.lnk`-path entry, the `.bat` entry and the folder entry.
3. Focus the window by clicking only the drag region and confirm the animations resume.

---

## Verdict

- Total Critical: 0
- Total Major: 3
- Total Minor: 12

**Verdict:** RELEASE CLEAR

There are no open Critical findings, and the safety floor is intact. The audit's C1 and C2 are closed by this range. Majors 1–3 and the Minors go to Ender for the next cycle.
