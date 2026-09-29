# Code Review — QuickLaunch v1.94.3

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-09-28 (started) / 2026-09-29 (extended to c544c26, then af3b3bc)
Tool: QuickLaunch (product QuickLauncher)
Release: v1.94.3
Commit range: 80e5466..af3b3bc
              a76728f  fix: read-only recovery (three-way merge), renderer-ready queue, picker icon helper  (code)
              5594360  docs: Decision Log, tray-Quit addendum, focused-CPU spec                             (docs, read for drift)
              7480485  docs(create-theme): CPU and transparency guidance                                    (docs, checked against code)
              2597ad2  feat: read-only notice after ~10 s at boot                                          (code)
              c544c26  fix: M1 ordering + _emitSafe; Settings random theme persists; bounds not taken
                       from the renderer; m6 banner gate                                                   (code)
              af3b3bc  fix: tray "Start with Windows" follows the Settings checkbox                         (code)
Files changed: 14 files, +765 / -126 (src/: 10 files, +603 / -109; no package.json, lockfile or build-config change)
Working tree at af3b3bc: clean apart from untracked Docs/ reports (this one and Futaba's QA report).
Method: static read of the diff and of every touched file at 2597ad2, c544c26 and af3b3bc, plus isolated Node probes in
        scratchpad/ql-review-v1943/ (mocked electron, real temp files, real exclusive Windows locks via libuv
        UV_FS_O_EXLOCK):
          store-merge-redteam.js  T1–T13 merge edge cases; run on 2597ad2 (*.out.txt) and c544c26 (*.c544c26.out.txt)
          store-race-probe.js     R-a/R-b re-lock race; run on both trees
          c544c26-probe.js        N1–N5: renderer-sync thrower, event order, m6 gate incl. edit+Quit,
                                  re-entrant listener, save-error thrower
        T5 is the positive control for M1: LOSSY on 2597ad2, ok on c544c26.
        Relied on, not re-run (they launch Electron): Ender's picker harness (scratchpad/ql-fix3/results/).
        QuickLaunch was not launched. dist/ was not touched. No PowerShell was run.
Stand-down dimensions: none
```

---

## Summary

c544c26 fixes what it says:
- **M1 is closed.** The renderer view and push are set up before any listener runs, and `'reconciled'`/`'renderer-sync'` listeners go through `_emitSafe`. T5 is now ok. A throwing `'renderer-sync'` listener also loses nothing (N1): the merged library is written, `_view` stays set, and the state is waiting for the next `renderer-ready`.
- **m6 is closed.** A boot save refused under a lock that clears within 10 s shows nothing (N3a). A queued banner is dropped on reconcile.
- **Both out-of-range bugs from the first pass are fixed.** The Settings random-theme checkbox persists, and a settings save no longer moves the window back.
- **af3b3bc** rebuilds the tray menu when a Settings save changes `startWithWindows` or `randomTheme` (ipc.js:251-256). It compares the stored settings before and after the save, which also covers the `_view` merge path. The rebuild only builds a menu: `setLoginItemSettings` is called only from the tray's own checkbox click (tray.js:152), so the Run key is untouched. That matches Ender's harness check. No new finding.

What the new commit leaves or adds:
- **n1 (Minor).** The m6 gate means an edit made while locked, followed by Quit or logoff within the first ~10 s, is lost **with no warning at all** (N3b). The loss itself was already unavoidable; the warning is what went away.
- **n2 (Minor).** `'save-error'` is still a plain `emit`. A throwing listener escapes the timer as an uncaught exception (N5), but no data is affected.
- **n3 (Minor).** A renderer save that crosses a tray toggle reverts it. `randomTheme` is newly exposed to this; `startWithWindows` already was.

Every other earlier finding is untouched by c544c26 and still open. The biggest is **M2**: quarantine and recovery states are still invisible. No safety-floor item was found anywhere in the range.

| Earlier item | Status at c544c26 |
|---|---|
| v1.94.2 Major 1 — read-only sticky, edits dropped | Closed (first pass). |
| v1.94.2 Major 2 — degraded state not shown at boot | Half closed; carried as **M2** (open). |
| v1.94.2 Major 3 — picker froze the main thread | Closed (first pass). |
| **M1** — read-only exit breaks on a throwing listener | **Fixed in c544c26** (T5 ok, N1, N2). |
| **m6** — false-alarm banner on a short lock | **Fixed in c544c26** (N3a); replaced by n1. |
| m1–m5, m7–m11 | Open; c544c26 doesn't touch them (T1, T2, T4, T12, T13 give the same results on c544c26). |
| First pass, outside range: Settings random theme didn't persist; settings save reverted window bounds | **Fixed in c544c26** (now in range). |
| Settings START WITH WINDOWS didn't update the tray checkbox | **Fixed in af3b3bc.** |

Probe results. T-series are on c544c26 and differ from 2597ad2 only in T5.

| # | Scenario | c544c26 |
|---|---|---|
| T1 / T2 | Last-session delete, or delete-all, then a lock at login | Deleted shortcuts come back (m1) |
| T3 | Control: last-session rename and hotkey survive the merge | ok |
| T4 | Reorder while read-only, with a disk that moved | Reverted (m2) |
| T5 | `'reconciled'` listener throws | **ok**: nothing escapes, merged written, push sent, the stale save keeps the disk-only app (2597ad2: LOSSY) |
| T6, T7, R-a, R-b, T8, T11 | Gate, re-lock race, `.bak`-caused read-only, Quit merge | ok |
| T9 / T10 / T12 / T13 | External restore / no-ack growth / reload window / duplicate path | Same as first pass (by design / m3 / m3 / m1) |
| N1 | `'renderer-sync'` listener throws | ok: merged written, `_view` set, pending seq 1 kept for `renderer-ready`, stale save merged |
| N2 | Order seen by listeners | `renderer-sync` then `reconciled`; listeners see `_view` set and read-only off; merged data not yet on disk (the caller writes after) |
| N3a | Boot save refused, lock clears at 0.2 s | 0 banners, saved: ok |
| N3b | Edit at 0.05 s, Quit at 0.2 s, still locked | **0 banners, edit not written** (n1) |
| N3c | Lock held | Silent before tick 2, 1 at tick 2, then 1 per refused edit: ok |
| N4 | `'reconciled'` listener calls `store.set()` | Consistent, all written: ok |
| N5 | `'save-error'` listener throws | Uncaught from the tick; `_flush` rethrows to its caller; still read-only and dirty (n2) |

---

## Rubric

### 1. Security

- Status: Pass
- Findings: none.
  - Icon helper (icon-worker.js:97-136): unsandboxed, but context isolation is on, there is no Node in the page and no `contextBridge` surface, the page is an empty local file under `default-src 'none'`, new windows and navigation are denied, it is hidden and non-focusable, and its IPC is scoped to its own webContents via `webContents.ipc`. It decodes the same bytes v1.94.2 decoded in the main process.
  - The new IPC channels validate their input: `renderer-ready` takes no arguments, and `store-reload-ack` checks `Number.isInteger`.
  - c544c26 adds only a boolean-typed `randomTheme` field, and removes renderer input rather than adding any.

### 2. Correctness & Logic

- Status: Concerns
- Findings:
  - **[Minor] m5 — open.** `src/main/index.js:42-50, 100-113` — `'reconciled'` re-applies the hotkey and the tray menu, but not the login item that boot applied from the read-only copy. The Run key can stay stale until the next boot.
  - **[Minor] m6 — FIXED in c544c26.** `store.js:419-433` only raises a refusal from tick 2 on, and `index.js:44` drops a queued banner on reconcile (N3a).
  - **[Minor] n3 — new.** `src/main/ipc.js:218-256`, `src/main/tray.js:97-101`, `src/renderer/app.js:1161-1179` — **Tray-owned settings are reverted by a renderer save that crosses a tray toggle.**
    - The renderer always sends its whole `settings` object. After a tray toggle, it only learns the new value from an async `get-settings` fired by `settings-changed-externally`. That notification is a direct `webContents.send`, which is dropped if it arrives before `init()` registers its listener.
    - So a renderer save sent in that window carries the old value. `save-settings` now accepts `randomTheme` and writes it back.
    - `startWithWindows` already had the same exposure, and there it leaves the stored setting and the Run key disagreeing.
    - To hit this, a human needs a Settings change within milliseconds of the tray click, or a tray click inside the ~tens of ms at `init()`. Every renderer settings save is user-initiated (none on timers). That makes it practically unreachable, hence Minor.
    - Fix direction: have the renderer send only the field it changed.
    - With af3b3bc, a reverted toggle at least rebuilds the tray to the reverted value, so the tray and the store agree.
  - Checked, no finding: **af3b3bc** (`src/main/ipc.js:251-256`).
    - `current` is the settings object from before the save and `saved` is the new one. `set()` replaces the object rather than mutating it, so the comparison is valid on both the plain path and the `_view` merge path.
    - An undefined-to-true change triggers an extra rebuild, which is harmless.
    - `buildMenu` has no side effects. The Run key is written only by the tray checkbox click (tray.js:152) and by `set-auto-launch`, both unchanged.

### 3. Crash / Stability Safety

- Status: Concerns
- Findings:
  - **[Minor] m7 — open.** `src/main/icon-worker.js:68-80, 123` — After the helper crashes, its in-flight chunks are re-encoded on the main thread. A poison icon that killed the helper then runs in main.
  - **[Minor] n2 — new.** `src/main/store.js:259, 430, 448` — `'save-error'` still uses a plain `emit`.
    - A throwing listener escapes the 5 s timer as an uncaught main-process exception, which puts up Electron's error dialog. It also escapes a refused or failed `_flush` to that function's caller (N5).
    - The data is unaffected: the store stays read-only and dirty.
    - This is latent, because `sendToRenderer` guards the window. It is inconsistent with the `_emitSafe` just added for the other two events.
  - `_emitSafe` (store.js:320-325), which the brief asked about. It iterates `rawListeners`, so `once` wrappers still work. Every listener runs even if an earlier one threw, `this` is the emitter as with `emit`, and the error is logged.
    - What it hides: a failed push means the renderer shows the pre-merge library until it reloads. The data is right on disk and `_view` keeps later saves correct (N1).
    - A failed `'reconciled'` means the hotkey and tray menu are not re-applied. `saveErrorPending` is cleared first, so a later throw can't skip that.
    - None of this is data, so swallowing is the right trade. The only cost is that packaged builds have no console, so these failures are invisible.

### 4. Performance

- Status: Concerns
- Findings:
  - **[Minor] m8 — open.** `src/main/ipc.js:487` — `installedAppsPromise` is cleared before the ~2.4 s async encode, so a call in that window starts a second PowerShell scan and a second helper.
  - v1.94.2 Major 3 is closed (Ender's harness: 56 ms max main-thread gap after PowerShell).

### 5. State & Data Safety

- Status: Concerns
- Findings:
  - **[Major] M1 — FIXED in c544c26.** `src/main/store.js:300-329` — The ordering is now: merged data, then `_view` and push, then `_emitSafe('reconciled')`, then the caller writes.
    - T5 (the 2597ad2 positive control, which was LOSSY) now passes: nothing escapes, the merged library is written, and the stale renderer save keeps the disk-only app.
    - N2 confirms listeners see `_view` set and read-only off. N4 confirms a listener that writes back to the store stays consistent.
    - What remains: listeners run before the merged data is on disk. None assumes otherwise.
  - **[Major] M2 — open (carried from v1.94.2 Major 2, half closed).** `src/main/store.js:204-237`, `src/main/index.js:34-36` — The quarantined-empty and recovered-from-`.bak`/`.tmp` states are still console-only.
    - `_loadSource` is tracked and never surfaced. After a quarantine, Sergei sees an empty launcher and no banner.
    - The read-only notice is pushed and lasts 8 s (app.js:1686-1689), and nothing can be pulled later.
    - Fix: keep a store status in main and have `init()` pull it.
  - **[Minor] n1 — new.** `src/main/store.js:419-433` — **The m6 gate silences the only warning for an edit that is about to be lost.**
    - While locked, refusals before the second failed re-check are now only logged. So an edit followed by tray Quit or logoff within the first ~10 s of a read-only stretch is lost with no banner at any point (N3b: 0 events, edit not on disk).
    - Before c544c26, the edit's own refused save raised the banner about 0.1 s after the edit, while the user could still wait instead of quitting.
    - The loss itself is unchanged, since nothing could be written under the lock. After 10 s, every refused save warns again (N3c).
    - Rated Minor because it needs all three of: a lock that outlasts the 1.5 s boot retry, a shortcut edit within ~10 s of launch, and Quit or logoff before the 10 s mark. For a tray launcher that auto-starts at login, that is a very narrow window.
    - Fix direction (Ender's call): keep the grace for main-initiated saves (boot random theme, window bounds), and raise immediately when a refused save carries a renderer change (`setFromRenderer`).
  - **[Minor] m1 — open.** `src/main/store.js:73-83` — The merge re-adds items that are in base but not on disk.
    - A shortcut deleted as the previous session's last save comes back after a locked login (T1), and so does a deliberate delete-all (T2).
    - Base-only items skip the path de-dup, so an app removed and re-added under a new id can become two tiles (T13).
    - Nothing is lost. The rule is right for a newer crash-leftover `.tmp` base, and it resists a foreign disk (T9).
    - Fix direction: when base came from `.bak`, treat base-only items as deleted on disk.
  - **[Minor] m2 — open.** `src/main/store.js:60, 64-84` — Once the disk has moved, a reorder made while read-only is reverted to disk order (T4).
  - **[Minor] m3 — open.** `src/main/store.js:336-357`, `src/main/index.js:52-60` — Sync-protocol edges.
    - (a) A page that fetched state after the merge, but hasn't acked yet, is merged against the stale `_view`. T12: deleting a disk-only app in that window is undone. The window is milliseconds wide.
    - (b) `_pushed` has no cap while acks are missing (T10: 51 snapshots). Not reachable with a working renderer.
  - **[Minor] m4 — open.** `src/renderer/app.js:861-879, 980-1000` — After a `store-reloaded` swap, `refreshMissingIcons` and an in-progress rename still mutate the old objects. Found icons and the new name are silently dropped. No shortcuts are lost.
  - Checked, no finding:
    - Removing `windowPosition`/`windowSize` from `save-settings`, which the brief asked about. Nothing else relies on it: the renderer never reads or writes those fields (grep: 0 in app.js), only window.js writes them (on moved and resize, including renderer-driven `resize-window`), and `sanitized` starts from `{...current}`. The only thing lost is the stale echo that caused the revert.
    - In the `_view` path, `mergeFields` now sees the current bounds on both sides, so nothing changes there.

### 6. Input Handling

- Status: Pass
- Findings: none.
  - `store-reloaded` payloads are shape-checked in the renderer, and `seq` is validated in main.
  - Helper replies are matched by chunk id and type-checked.
  - `save-settings` gains a `typeof boolean` check for `randomTheme`, and drops two renderer inputs.

### 7. Maintainability (no Critical findings on its own)

- Status: Concerns
- Findings:
  - **[Minor] m9 — open.** `src/main/store.js:45` — `same()` is `JSON.stringify` equality, so it is sensitive to key order and extra fields. The merge's edit detection depends on every writer building objects in one key order.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Concerns
- Findings:
  - **[Minor] m10 — open.** `.claude/commands/create-theme.md:219` — The guide says "QuickLaunch pauses every animation". `base.css:911-915` keeps the entrance fade and tile hover animations running, and 24 themes' hover animations are infinite. The rest of 7480485 matches the code.
  - **[Minor] m11 — open.** `Docs/QuickLaunch_Brief.md`, row "Leaving read-only mode" — The row doesn't mention the base-only re-add (m1) or the lost reorder (m2).
    - It also still doesn't describe the banner timing, which c544c26 changed.
    - store.js's header rule 5 was updated and is accurate.
  - The c544c26 commit message matches the diff.

### 9. Build & Release Hygiene

- Status: Pass
- Findings: none in range.
  - No dependency, lockfile or build-config change.
  - The new helper files are covered by `files: ["src/**/*"]`.
  - `ipc.js` now requires `./tray`. That is not circular: tray.js requires only electron, path and updater.
  - `package.json` is still 1.94.2, and the bump is Sully's.
  - A secret grep over the diff found nothing (positive control verified).
  - Electron 32 end-of-life is carried, outside range.

---

## Patterns

The store's on-disk core has held under every probe in three reviews. The findings keep landing around it:
- what the UI is told (M2, n1);
- what the renderer holds (m3, m4, n3);
- how events leave the store (M1, now fixed; n2).

n3 and the tray-sync bugs fixed in c544c26 and af3b3bc share a root cause: the renderer echoes a whole settings object that main also edits.

For Futaba's behavior pass:
1. Delete a tile, quit, lock the data file for ~20 s across the next launch. Does the tile come back (m1)?
2. Lock at launch, add a shortcut within 5 s, Quit from the tray before 10 s. Is there any warning (n1)?
3. Toggle Random theme in Settings, then open the tray menu. Does the checkbox match?

---

## Verdict

Range certified: `80e5466..af3b3bc`.

Open findings:
- Total Critical: 0
- Total Major: 1 (M2)
- Total Minor: 13 (m1–m5, m7–m11, n1–n3)

Fixed in range: M1 and m6 (c544c26); the Settings random-theme and window-bounds bugs (c544c26); the tray START WITH WINDOWS sync (af3b3bc).

**Verdict:** RELEASE CLEAR

No Critical finding is open and the safety floor is intact:
- M2 is a UI gap (quarantine and recovery aren't shown), not a data risk.
- n1 loses a warning, not data that could have been saved.
- m1 brings deleted shortcuts back but loses nothing.

The probes found no reachable path that drops an on-disk shortcut or a read-only-session edit that could have been written. M2 and the Minors go to Ender for the next cycle.
