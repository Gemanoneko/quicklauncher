# Code Review — QuickLaunch full audit at c72ca12 (v1.94.1)

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-09-28
Tool: QuickLaunch (product QuickLauncher, repo github.com/Gemanoneko/quicklauncher)
Release: none. This is a full audit Sergei asked for. It certifies no release.
Commit range: 60e87ff (initial commit, v1.0.0)..c72ca12bd83513cf5fa3f639520b833cbd0263ec (209 commits)
Tree reviewed: `git archive c72ca12` extracted to the session scratchpad (128 tracked files).
               Not the working tree, which Ender is editing in parallel.
Scope read: all of src/main/*, src/renderer/app.js, index.html, styles/base.css,
            all 101 theme CSS files (by static probe plus spot reads), scripts/*,
            package.json, package-lock.json (versions only), .claude/settings.json,
            .claude/commands/create-theme.md, .gitignore, Brief, CHANGELOG, prior reviews
Method: static read plus isolated Node probes in scratchpad/probes/ (store.js loaded against a
        temp dir with a mocked electron; picker regex replay; template-literal evaluation;
        CSS keyframe classifier; contrast gate run on CRLF vs LF copies). One permitted
        `Get-StartApps | Measure-Object`. QuickLaunch was never launched.
Stand-down dimensions: none
```

---

## Summary

I read the whole codebase with red-team framing and focused on Sergei's three complaints. Each one has a root cause backed by file:line evidence. Two of them are confirmed by probes.

- **Shortcuts vanishing after a BSOD** is Critical data loss. A probe reproduced it end to end.
- **High CPU** is structural. It is not caused by timers: every theme animates paint-bound properties across the whole window, and nothing pauses them.
- **Missing apps and Store apps** come from an all-or-nothing PowerShell scan and a filter that silently drops entries.

I also found several independent Majors: a setting that never persists, settings clobbering each other, a release gate that fails on this machine's checkout, an end-of-life Electron, and theme-authoring docs that bake the CPU problem into new themes.

Totals: **2 Critical, 18 Major, 21 Minor.**

---

## Complaint 1: "It takes a lot of CPU"

**Root cause.** Every theme runs infinite CSS animations on paint-bound properties over full-window layers:
- `box-shadow` on `#app`
- `background-position` on `#particles`
- `text-shadow` and `filter` on header and title

Each animated frame forces Chromium to repaint and re-raster the window. The cost is amplified in three ways:
- `#app` carries a full-window `backdrop-filter: blur(18px) saturate(1.4)`.
- `#app` and its children carry a polygon `clip-path`.
- The window is `transparent: true`.

Nothing pauses the animations when the window is unfocused or covered, and the window never hides on its own. So the process repaints at display rate for as long as it isn't explicitly hidden to tray.

The 14 s banner `setInterval` is **not** a meaningful contributor. Background throttling is **not** disabled (Electron's default `backgroundThrottling: true` is left alone). When the window is truly hidden via tray, the hide button or the hotkey, Chromium stops producing frames.

Evidence, from a static probe (`probes/anim-probe.js`: parses every `@keyframes`, resolves every `animation`/`--*-anim` declaration containing `infinite`, classifies animated properties; opacity/transform count as composited):

| Measure (method) | Count |
|---|---|
| Theme files | 101 |
| Themes with ≥1 infinite animation of a non-composited property | 101 / 101 |
| Infinite animations total / paint-triggering | 628 / 448 |
| Themes animating `#app` itself infinitely (grep `^#app {...infinite`) | 98, of which 83 interpolate continuously (not `steps()`) |
| Themes animating `#particles` infinitely | 92, of which 77 `linear` (continuous) |
| Non-composited props animated (occurrences) | text-shadow 120, box-shadow 100, background-position 88, filter 16, others |

### M1 [Major] Paint-bound infinite animations on full-window layers, with blur, clip and a transparent window

- `src/renderer/styles/base.css:156-165`: `#app` has `backdrop-filter: blur(18px) saturate(1.4)`, `clip-path: var(--app-clip)` (a polygon by default, base.css:17) and `will-change: box-shadow`. `will-change` gives no compositing for `box-shadow`.
- `src/renderer/styles/base.css:168-175`: `#particles` covers the full window, uses `clip-path: inherit` and `will-change: background-position` (same problem).
- Typical theme examples:
  - `themes/tron.css:227-235`: `#app { animation: tron-border 10s ease-in-out infinite }` interpolates a multi-layer inset `box-shadow` on every frame.
  - `themes/tron.css:248-261`: `#particles` scrolls two tiled SVG data-URI backgrounds via `background-position`, `linear infinite`.
  - `themes/cyberpunk.css:267, 284, 300`: same pattern.
- **The `backdrop-filter` is visually inert.** Chromium can only blur page content painted beneath the element. In a transparent window that content is the transparent `body`, and the desktop is composited by the OS outside Chromium (Electron's documented transparent-window limitation). So the full-window blur costs GPU and CPU on every repaint and produces nothing. `.overlay` (base.css:606) repeats it with `blur(8px)`.
- `src/main/window.js:36-38`: `frame: false, transparent: true`. Transparent windows on Windows are widely reported to be costlier per frame than opaque ones.
- `src/main/store.js:62`: `reducedMotion: false` by default. The only built-in off switch (`body.reduced-motion`, base.css:877-892) is opt-in.
- **Fix (Ender):**
  1. Drop `backdrop-filter` from `#app` and `.overlay`. No visual change is expected, but verify.
  2. Re-express ambient effects with composited properties only, i.e. opacity/transform on pre-rendered pseudo-element layers. No animated `box-shadow`, `background-position`, `text-shadow` or `filter`.
  3. Remove the useless `will-change` declarations.
- Whether to default Reduce Motion on is Sergei's call via Judy.

### M2 [Major] Animations never pause when the window is unfocused or covered, and the window never hides itself

- There is no `blur`/`focus`/`visibilitychange` handling anywhere in `src/renderer/app.js`. grep for `visibilitychange|document.hidden` returns nothing.
- There is no blur handler in `src/main/window.js`.
- `launch-app` (`src/main/ipc.js:303-359`) does not hide the window after launching.
- The hotkey toggle (`src/main/index.js:106-112`) hides only when the window is *visible and focused*. After launching an app, the next Ctrl+Space shows QuickLaunch rather than hiding it.
- Net effect: in normal use (pop up, launch, go to the launched app) QuickLaunch sits visible behind other windows and keeps animating.
- Electron has historically not throttled a visible-but-covered window on Windows: Chromium's native occlusion tracking has been disabled by default in Electron on Windows for most releases. I have **not verified** this for the locked Electron 32.3.3. The positive control below settles it.
- **Fix, construction-only:** toggle a `body.paused` class on window blur and on `visibilitychange`, with `*, *::before, *::after { animation-play-state: paused !important }`. Hide-on-blur or hide-after-launch would change behaviour, which is Sergei's call via Judy. Pausing on blur is a visual change too, so it needs Judy's sign-off.
- **Measure, not proxy:** compare CPU via Task Manager or `app.getAppMetrics()` in five states:
  1. focused
  2. covered by another window
  3. hidden to tray
  4. Reduce Motion on
  5. with the `backdrop-filter` removed

  State 3 should be about 0%. If state 2 is about equal to state 1, M2 is confirmed.

### M3 [Major] A full PowerShell app scan runs on every picker open and at every boot when any tile lacks an icon; nothing is cached

- `src/renderer/app.js:855, 858-864`:
  - `init()` always calls `refreshMissingIcons()`.
  - If *any* `shell:`/URL tile has an empty `iconDataUrl`, it runs the full `get-installed-apps` scan.
  - If the icon still can't be resolved, the tile stays empty, so the scan repeats **at every launch**.
  - With `startWithWindows: true` that launch is Windows login, when the machine is busiest.
- `src/renderer/app.js:1301-1320`: every picker open starts a new scan. There is no cache in `src/main/ipc.js:361-562`, only an in-flight de-dupe (ipc.js:232, 362).
- Each scan is one `powershell.exe` doing up to 45 s of work (see M5).
- **Fix:**
  - Cache results in main (in memory, optionally persisted), with an explicit "Rescan".
  - Record "icon lookup attempted" per tile so boot never rescans for the same tile.

### M4 [Major] Synchronous per-pixel image work on the main thread for every picker result

- `src/main/ipc.js:528-554`: `Promise.all` over hundreds of items. The work inside is synchronous, so the async wrapper buys nothing:
  - `fs.readFileSync(item.IconPath)` (ipc.js:532)
  - `trimIcon(...)` (ipc.js:167-215)
- `trimIcon` walks every pixel and allocates a new 4-element array per pixel (`px()`, ipc.js:172-175). That is about 65k allocations for a 256×256 icon, and more for scale-400 AppX logos.
- It blocks the main process (IPC, tray, window drag, hotkey) for the whole batch.
- **Fix:** do trimming in the C# helper or in a `worker_thread`, index the bitmap directly without per-pixel allocation, and use async reads.

Minor CPU items: m1 (banner interval, explicitly not the cause), m2, m3. See § Other findings.

---

## Complaint 2: "I can't see all my installed programs / Store apps"

**Root cause.** The picker is one monolithic PowerShell run with a hard 45 s timeout. On overrun, or on any stdout noise, the whole list is replaced with `[]`. Per-app work makes the timeout likely on a large Start menu:
- a full recursive Start Menu `.lnk` rescan for every Win32 entry
- a `Get-AppxPackageManifest` call for every Store entry

When the scan does finish, a JS filter silently drops every non-Store, non-Steam entry for which PowerShell found no icon. That happens systematically for:
- localized display names
- System32/Windows known-folder AppIDs

Store apps only vanish through the all-or-nothing failure or the fallback path. Either way the renderer shows **"NO MATCHES — USE BROWSE TO ADD BY FILE"**. Browse can't add Store apps, because the dialog is filtered to `.exe`/`.lnk` and WindowsApps is protected. That fits "can't see Store apps" specifically.

Measurements on this machine (counts only, no names read):

| Measure | Method | Value |
|---|---|---|
| Start apps | `powershell.exe -NoProfile -Command "Get-StartApps \| Measure-Object"` via Bash | **654** (the call itself took 1.24 s) |
| 45 s budget per entry | 45,000 ms / 654 | **68.8 ms** |
| `.lnk` files, user and common Start Menu | `find -iname '*.lnk'` | 129 + 295 = 424 |
| `.url` files | `find -iname '*.url'` plus `URL=` scheme tally | 208 (174 steam, 32 http/https, 1 file) |
| Folders with localized names | `find -iname desktop.ini` in both Start Menu trees | 18 |
| System ANSI / OEM code page | `reg.exe query ...\Nls\CodePage` | 1251 / 866 (Cyrillic) |

### M5 [Major] All-or-nothing 45 s scan with O(N×M) per-app work

- `src/main/ipc.js:509-514`: `timeout: 45000`. On timeout, maxBuffer overflow or any error, `err` is set and `resolve([])`. Partial output is discarded.
- `src/main/ipc.js:556`: any `JSON.parse` failure also resolves `[]`, for example a stray WARNING line on stdout.
- `src/main/ipc.js:440-443`: for **every** Get-StartApps entry that isn't Steam or AppX, which is every Win32 app, the script re-runs `Get-ChildItem -Path $startDirs -Filter '*.lnk' -Recurse` over about 424 shortcuts, then 3 wildcard comparisons per shortcut. That is a full tree walk per app.
- `src/main/ipc.js:399`: one `Get-AppxPackageManifest` per Store entry.
- `src/main/ipc.js:472, 477`: one IconHelper extraction per entry.
- With 654 entries the budget is 68.8 ms per entry. I estimate that is routinely exceeded, but I did **not measure** it because running the script is a PowerShell probe, which was excluded. Ender should instrument it by timing the script standalone.
- **Fix:**
  - Walk the Start Menu once, before the loop, into a hashtable by basename, including `desktop.ini` `LocalizedFileNames`.
  - Read `AppxManifest.xml` directly from `InstallLocation`, or skip manifests and use shell thumbnails.
  - Stream one JSON object per line and keep partial results.
  - Resolve icons lazily after the list renders.

### M6 [Major] Entries silently dropped for lacking an icon, when the icon lookups can't succeed for whole classes of apps

- `src/main/ipc.js:523-525`: an entry is kept only with an icon field, a `steam://` ID or a `PFN!App` ID. The renderer already has a placeholder for icon-less items (`src/renderer/app.js:1343-1346`), so this filter isn't needed.
- `src/main/ipc.js:443`: the `.lnk` lookup matches on `BaseName` vs display `Name`. Localized names don't match their `.lnk` basenames (for example a Cyrillic display name vs `Command Prompt.lnk`). This machine has 18 localized Start Menu folders.
- `src/main/ipc.js:460-468`: the known-folder GUID fallback only searches `ProgramFiles`, `ProgramFiles(x86)` and `LOCALAPPDATA\Programs`. System32 `{1AC14E77-…}` and Windows `{F38BF404-…}` AppIDs never resolve.
- `src/main/ipc.js:476`: the only method that works for *any* Start entry, `GetThumbnailBase64("shell:AppsFolder\<AppID>")`, is restricted to `PFN!App` IDs.
- Probe (`probes/filter-probe.js` replays ipc.js:519-525):
  - `Chrome` with no icon is **DROPPED**
  - `{6D809377…}\Notepad++\notepad++.exe` with no icon is **DROPPED**
  - `Microsoft.AutoGenerated.{…}` with no icon is **DROPPED**
- **Fix:**
  - Never drop an entry for lacking an icon.
  - Use the `shell:AppsFolder` thumbnail as the last resort for every entry.
  - Map known-folder GUIDs with `[Environment]::GetFolderPath` / `SHGetKnownFolderPath`.

### M7 [Major] The fallback path (Get-StartApps returns nothing) omits all Store apps and produces entries that can't launch

- `src/main/ipc.js:483-505`: the fallback scans `.lnk` files only. No AppX packages, so every Store app disappears.
- `src/main/ipc.js:504`: it sets `AppID` to the `.lnk` full path.
- `src/main/ipc.js:566`: `add-app-from-appid` maps that to `shell:AppsFolder\C:\ProgramData\…\Tool.lnk`, which is a nonsense shell path (probe-confirmed).
- **Fix:** add `Get-AppxPackage`-derived entries to the fallback, and return `.lnk` fallbacks as file paths (a `path` field) that launch through `shell.openPath`.

### M8 [Major] Failures are swallowed at every layer, so a broken scan looks like "no apps"; output encoding is suspect

- `src/main/ipc.js:512`: the callback is `(err, stdout)`. **stderr is discarded**. ipc.js:514 and ipc.js:556 turn every failure into `[]`. PowerShell uses `-EA SilentlyContinue` and `catch {}` throughout.
- `src/renderer/app.js:1326-1330`: an empty list renders as "NO MATCHES". The user can't tell a timeout from an empty Start menu.
- **Probable contributing cause, unverified (it needs a PowerShell probe):**
  1. `src/main/ipc.js:366` sets `[Console]::OutputEncoding = UTF8`.
  2. With `windowsHide: true` and all stdio piped, libuv spawns with `CREATE_NO_WINDOW`, so `powershell.exe` has no console.
  3. .NET's `Console.OutputEncoding` setter calls `SetConsoleOutputCP`, which throws "The handle is invalid" without a console.
  4. stdout would then stay in the ANSI code page, 1251 here.
  5. Node decodes it as UTF-8, so every Cyrillic or other non-ASCII app name becomes U+FFFD, and typed searches can't find them. 11 shortcut names on this machine contain non-ASCII characters.
  6. Nobody would ever see the error, because stderr is dropped.
- **Fix:**
  - Log stderr.
  - Surface a real error state in the picker.
  - Emit ASCII-safe JSON: escape non-ASCII as `\uXXXX`, or write UTF-8 bytes through `[Console]::OpenStandardOutput()`.

Minor picker items: m5, m6, m7, m8, m10. See § Other findings.

---

## Complaint 3: "Once all the shortcuts disappeared after a BSOD"

**Root cause.** Neither the data file nor its `.bak` is ever flushed to disk. `.bak` is re-copied from the file just written, so both copies share the same unflushed generation. After a crash, NTFS can replay the journaled rename while losing the unjournaled data, leaving both files zero-filled or truncated. On the next boot:

1. `_load()` fails to parse the main file, then fails to parse `.bak`, then **silently returns defaults (`apps: []`)**.
2. `index.js` immediately calls `store.set('settings', …)` for the random theme (on by default).
3. 100 ms later the empty library is written over **both** the main file and `.bak`.

The loss becomes permanent and silent. The same destroy-on-boot path also fires when the main file is merely locked at login, for example by an AV scan. The code comment says this must not happen, but it does.

Probe (`probes/store-probe.js`) loads the committed `src/main/store.js` against a temp userData with a mocked `electron`, writes the post-crash file states, replays `index.js:21-27`, and reads the disk after 400 ms:

| Scenario | Apps loaded | Main file after boot save | .bak after boot save |
|---|---|---|---|
| CONTROL: valid main, no .bak | 2 | 2 | 2 |
| CONTROL: zero-filled main, valid .bak | 2 | 2 | 2 |
| **Zero-filled main + zero-filled .bak** | **0** | **0** | **0** |
| **Empty main + empty .bak** | **0** | **0** | **0** |
| **Truncated main + truncated .bak** | **0** | **0** | **0** |
| Main is valid JSON `null`, .bak valid | **0** | 0 | **0** (good .bak overwritten) |
| Main `{apps:null}`, .bak valid | null | null | **null** (good .bak overwritten; renderer then crashes) |

For context, the data file is 60,614 bytes on this machine, which includes inline base64 icons. I got that from `ls -l` on `%APPDATA%\QuickLauncher\` and did not read the contents. `.bak` is the same size.

### C1 [Critical] Store writes are not durable: no fsync, and the backup shares the same unflushed generation

- `src/main/store.js:83`: `fs.writeFile(tmp, …)` with no `fsync`.
- `src/main/store.js:89`: `fs.rename(tmp, dataPath)`. The rename is journaled metadata, but the file data isn't.
- `src/main/store.js:96`: `fs.copyFile(dataPath, dataPath + '.bak')` copies straight from the just-written, still-unflushed file. It also overwrites `.bak` in place, so it isn't atomic.
- The comment at store.js:79-80 claims "Atomic write". It is atomic against a process crash, **not** against a power loss or BSOD.
- The exposure reopens on every save, and saves are frequent:
  - window move (window.js:61-69, 400 ms debounce)
  - resize (window.js:73-81)
  - every icon-size slider tick (app.js:1112-1118)
  - every boot (index.js:26)
  - every tile change
- **Must fix:**
  1. Open the tmp file, write, `fs.fsyncSync(fd)`, close, rename.
  2. Build backups the same way: copy to `.bak.tmp`, fsync, rename. Never copy onto the live `.bak`.
  3. Start in `src/main/store.js:76-102`.

### C2 [Critical] Any load failure silently becomes an empty library, which boot then persists over both copies

- `src/main/store.js:28-31`: SyntaxError on the main file, then SyntaxError on `.bak`, then `return this._defaults()`.
- `src/main/store.js:33-43`: EBUSY/EACCES/EPERM. The comment says *"Do NOT silently reset to defaults — that would destroy the user's data if the main file was merely temporarily locked"*, but line 43 returns defaults anyway.
- `src/main/index.js:21-27`: with `randomTheme !== false` (the default), boot calls `store.set('settings', …)` unconditionally. That triggers `_save()` 100 ms later, which overwrites the main file and then refreshes `.bak` from it (store.js:96).
- A transient lock at login (QuickLaunch auto-starts with Windows, `store.js:52`, at exactly the moment AV scans) is therefore enough to wipe a perfectly good library.
- No banner and no log is shown to the user in the SyntaxError branch.
- **Must fix:**
  1. On any load failure, quarantine the unreadable file (rename to `quicklauncher-data.corrupt-<ts>.json`).
  2. Try the rotating backups (M9) newest to oldest.
  3. If nothing loads, enter a **no-save** state: suppress every `_save()`, including the boot theme save, until the user confirms starting fresh. Surface it through the existing `store-save-error`-style banner.
  4. Start in `src/main/store.js:13-45` and `src/main/index.js:21-27`.

### M9 [Major] The single-generation `.bak` mirrors whatever was just written, including an empty or bad library

- `src/main/store.js:95-98`: `.bak` is refreshed after *every* successful save. Any bad-but-parseable write (empty `apps`, a renderer bug, C2's defaults) replaces the only backup within milliseconds.
- **Fix:**
  - Keep N rotating generations, for example daily plus on boot, capped at 5.
  - Refuse to rotate a backup whose `apps.length === 0` over one that has apps.
  - Consider splitting `apps` and `settings` into separate files so a window move never rewrites the shortcut library.

### M10 [Major] No shape validation on load

- `src/main/store.js:16`: `{ ...defaults, ...JSON.parse(raw) }`. The problem cases:
  - valid-but-wrong JSON (`null`, `{}`, `[]`, `{ "apps": null }`) never reaches the `.bak` path
  - `apps: null` flows to the renderer, where `apps.length` / `apps.filter` throw (`src/renderer/app.js:860, 891`) and boot aborts
  - the next save then persists the bad shape over `.bak` (probe rows 6-7)
- **Fix:** validate `typeof obj === 'object'`, `Array.isArray(obj.apps)` and a settings object, and treat a failure as corrupt, the same as C2.

### M11 [Major] Transient write/rename failures are not retried

- `src/main/store.js:83-94`: a single attempt. On Windows, AV (Bitdefender is present on this machine) and the indexer routinely cause transient `EPERM`/`EBUSY` on rename. The change stays in memory only, and one 8 s banner (`app.js:1636-1639`) is the only signal.
- **Fix:** retry with backoff, for example 5 attempts at 50-500 ms, and keep a dirty flag so the next flush retries.

### M12 [Major] Pending writes are dropped on Quit and on update install

- `src/main/tray.js:182`: `electronApp.exit(0)` exits immediately. It skips the 100 ms `_save` debounce (store.js:77-78), any in-flight async write/rename/copy chain, and the 400 ms move/resize debounces (window.js:64, 76). Quitting during `copyFile` leaves a truncated `.bak`.
- `src/main/updater.js:83`: `quitAndInstall(true, true)` has the same gap.
- The Decision Log records `app.exit(0)` deliberately. That choice is fine, but it needs a flush first.
- **Fix:** add a `store.flushSync()` (write, fsync, rename, all synchronous) and call it before `app.exit`, before `quitAndInstall`, and on `powerMonitor` `shutdown`.

Minor data items: m4, m9. See § Other findings.

---

## Other findings (not tied to a complaint)

### M13 [Major] Correctness: the Settings-overlay "RANDOM THEME ON STARTUP" checkbox never persists
- `src/renderer/app.js:1126-1129` sends `save-settings` with `randomTheme`.
- The sanitizer at `src/main/ipc.js:262-301` has no `randomTheme` branch, so it keeps `current.randomTheme`.
- Only the tray toggle works, because it writes the store directly (`src/main/tray.js:165-169`).
- The checkbox visibly unticks, but the next boot randomizes again and the box shows ticked.

### M14 [Major] Correctness: stale renderer settings clobber window position and size
- The renderer's `settings` object is fetched only at `init()` (`app.js:824`) and on `settings-changed-externally` (`app.js:1658-1661`).
- Main updates `windowPosition`/`windowSize` directly on move/resize (`window.js:61-81`) without notifying the renderer.
- Any later `save-settings` sends the boot-time position and size, and the sanitizer accepts them (`ipc.js:277-289`). This covers slider, theme, hotkey and reduced-motion saves. The stored position reverts silently.
- **Fix:** make `save-settings` a patch of only the fields the renderer owns, and stop accepting `windowPosition`/`windowSize` from the renderer at all (it never needs to send them).

### M15 [Major] Build & release: the contrast gate fails its own `prebuild` on a CRLF checkout
- `scripts/check-theme-contrast.js:237-240` hashes raw file bytes. `scripts/themes-baseline.json` holds LF hashes: the baseline for `cyberpunk` matches the LF blob `22eb0ce0…`, but the CRLF checkout hashes to `99b60076…`.
- This repo has `core.autocrlf=true` and no `.gitattributes`.
- Run on the archived tree it gives exit 1 with **13 errors**:
  - ac-templars, blair-witch, dragon-age, event-horizon
  - ff14, ff7, lovecraft, portal, siren
  - swl-templar, the-sandman, twin-peaks, warhammer-chaos
- The same tree converted to LF gives exit 0 with 13 legacy warnings (positive control).
- So `npm run release` on this machine's checkout fails at `prebuild`.
- **Fix:** normalize `\r\n` to `\n` before hashing, and/or add `.gitattributes` (`*.css text eol=lf`).

### M16 [Major] Build & release / security: Electron 32.3.3 is long end-of-life
- `package.json:61` is `^32.0.0`, and the lockfile pins 32.3.3.
- The main process decodes images from arbitrary install directories with Chromium's decoders (`nativeImage.createFromBuffer`/`createFromPath`, `ipc.js:533, 821`). That is unsandboxed and gets no security patches.
- The risk is mitigated by local-only content, CSP and a sandboxed renderer, so this is Major, not Critical.
- **Fix:** upgrade to a supported major and re-run QA.

### M17 [Major] Doc/code drift: `.claude/commands/create-theme.md:466-480` teaches a non-canonical release path
The command's release steps contradict the Brief, which says not to run `npm run build` directly and names `npm run release` as canonical. They:
- stage `package.json` without `package-lock.json`, breaking the lockfile-in-the-same-commit rule
- tag with a bare `git tag`
- source `GH_TOKEN` from a persistent User environment variable instead of `gh auth token`, which is the secret-handling path the studio moved away from
- run `npm run build`, which publishes, directly

Releases are Sully's. This block should be replaced with a pointer to the release pipeline.

### M18 [Major] Doc/code drift: `create-theme.md` makes the CPU cost part of every theme and misdescribes the glass effect
- `create-theme.md:82, 94, 177, 214, 370, 399` require infinite `#app`, particle, readout, title and banner animations, synced "across all 4 animations". That is the M1 pattern.
- `create-theme.md:20-23` claims "the desktop wallpaper bleeds through with a frosted glass effect automatically". That is false: `backdrop-filter` can't sample the OS desktop behind a transparent Electron window, so the wallpaper shows through unblurred.
- Any M1 fix must update this command and the studio `studio-skin` skill spec. Otherwise the next theme brings the problem back.

### Minor findings

| # | Dim | file:line | Finding |
|---|---|---|---|
| m1 | 4 Perf | `src/renderer/app.js:1102-1109` | Banner `setInterval(14000)` plus a 380 ms opacity fade keeps running while hidden. That is about 1 wake per 14 s and **not** a CPU root cause; clear it on hide or `visibilitychange` for tidiness. |
| m2 | 4 Perf | `base.css:164, 174, 178-185` | `will-change` on non-compositable properties (`box-shadow`, `background-position`) creates layers with no benefit. `#app-entrance` stays a full-window, polygon-clipped layer at opacity 0 after its one-shot fade; set `display:none` on `animationend`. |
| m3 | 4 Perf | `src/renderer/app.js:1322-1379` | Picker search rebuilds the whole DOM list, including hundreds of data-URL `<img>` elements, on every keystroke. Filter by toggling a class instead. |
| m4 | 5 Data | `store.js:82, 96`; `window.js:61-81`; `app.js:1112-1118` | Every move, resize and slider tick re-serializes the whole store (pretty-printed, inline base64 icons, 60,614 B here) and re-copies `.bak`. That is write amplification, and it widens C1's exposure. Split files or skip `.bak` for settings-only saves. |
| m5 | 2 Correct | `ipc.js:309, 566` | Non-Steam protocol IDs (for example `com.epicgames.launcher://…`) are stored as-is but `launch-app` treats only `shell:`/`steam://` as protocols. They fall through to `fs.existsSync` and fail with TARGET MISSING (probe-confirmed). |
| m6 | 2 Correct | `ipc.js:521` | The document-extension regex runs against the whole AppID, not the file extension, so any AppID with a `.pdf.`/`.doc.`/`.md.`/`.url.` segment is dropped (probe: `Vendor.Pdf.Reader_abc123!App` is DROPPED even with an icon). |
| m7 | 7 Maint | `ipc.js:485, 492` | Single-backslash escapes inside the JS template literal are lost. PowerShell receives `'^s*$'` and `'^s*,'`, not `'^\s*…'` (probe `tpl-probe.js`). The rest of the script correctly uses `\\s`. |
| m8 | 2 Correct | `ipc.js:443` | The `.lnk` match uses `-ilike` with unescaped `BaseName`, so `[`/`]` in a shortcut name become wildcard classes or throw (0 such names on this machine). The loose `*name*` both-ways match picks the first partial hit, which gives wrong icons for short basenames. |
| m9 | 5 Data | `store.js:16`; `index.js:40` | The shallow merge replaces `defaults.settings` wholesale. A data file from before v1.94.0 has no `globalHotkey`, so `applyGlobalHotkey(undefined)` registers nothing and the Ctrl+Space default silently never applies. Deep-merge the settings defaults. |
| m10 | 2 Correct | `ipc.js:134-163, 235-237` | The icon-helper DLL is cached by `existsSync` only: no version or hash, so a partial DLL from a `csc` kill never self-heals. The first scan can race the async compile and fall back to inline `Add-Type`, the AV-flagged path the comment says it avoids. The `.cs` is written to a shared `%TEMP%` path with a fixed name. The comment "Must finish before any icon extraction" is not enforced. |
| m11 | 1 Sec | `ipc.js:245-258, 306-311` | The `launch-app` allowlist is not a boundary. Any `shell:`/`steam://` string launches without being stored (`steam://run/<id>//<args>` passes arguments to games), and `save-apps` lets the renderer register any path first. Acceptable for a trusted renderer, but the comment overstates it. |
| m12 | 1 Sec | `ipc.js:333, 509, 715, 743, 763` | Bare `explorer.exe`/`powershell.exe` names are resolved via the process search path, which includes the app directory and cwd. The per-user install directory is user-writable. Use `%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe` and `%SystemRoot%\explorer.exe`. Same-user only. |
| m13 | 1 Sec | `window.js:29-53` | No `setWindowOpenHandler`/`will-navigate` guard, and the default application menu is never replaced, so `Ctrl+R`/`Ctrl+Shift+I` accelerators stay live in packaged builds. Hardening only. |
| m14 | 6 Input | `ipc.js:564-573, 597-603`; `preload.js:18-21, 29` | `add-app-from-appid` doesn't type-check or length-limit `name`/`appId` and throws on an undefined argument. `resize-window` passes NaN through to `setContentSize`. `resize-window`, `show-window` and `get-global-hotkey-status` are exposed but unused by the renderer (grep: 0 calls); remove them. |
| m15 | 3 Crash | `src/renderer/app.js:822-856` | `init()` has no try/catch. Any rejected invoke or bad data leaves a half-initialized UI with no listeners and no banner. |
| m16 | 7 Maint | `src/main/ipc.js` (855 lines) | One file mixes a C# type, a roughly 140-line PowerShell program inside a JS template literal (double-escaping hazards, see m7), image processing and all IPC. Move the scripts to real `.ps1`/`.cs` resources shipped with the app. |
| m17 | 9 Build | `package.json:11, 15` | `pack` (used for packaged QA) skips the contrast gate; only `build` has `prebuild`. |
| m18 | 9 Build | `.gitignore:5` | `*.ps1` is ignored repo-wide, so the obvious fix for m16 would silently never be committed. |
| m19 | 9 Build | `.claude/settings.json` (permissions.allow) | `Bash(*)` plus `Edit`/`Write` make every specific allow entry dead. The 139-entry glob deny list is the only guard and is bypassable by construction (e.g. `git -c k=v push --force`, `bash -c '…'`). Tooling only; not shipped. |
| m20 | 9 Build | `updater.js:81-84`; `package.json` build.win | The installer is unsigned, so electron-updater does no publisher verification. Integrity rests on HTTPS plus `latest.yml` sha512 from the same release. Silent install. Accepted risk for a personal tool; noted for the record. |
| m21 | 8 Drift | `index.html:143`; `Docs/QuickLaunch_Brief.md` § What It Does | The cheat-sheet says ESC will "hide window", but no code path hides on Escape. The Brief lists "files, URLs" as shortcut types, but add paths accept only `.exe`/`.lnk`, and launch accepts only stored paths plus `shell:`/`steam://`. |

---

## Rubric

| # | Dimension | Status | Findings |
|---|---|---|---|
| 1 | Security | Concerns | m11, m12, m13 (plus M16 under dim 9). `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, CSP present, and the preload channel allowlist are all correct. PowerShell paths go through env vars; the one interpolation (`ipc.js:161`) escapes `'` correctly. No secrets in the repo; `release.mjs` never logs the token. |
| 2 | Correctness & Logic | Fail | M5, M6, M7, M8, M13, M14; m5, m6, m8, m10 |
| 3 | Crash / Stability | Concerns | M10 (the renderer crashes on `apps:null`), m15 |
| 4 | Performance | Fail | M1, M2, M3, M4; m1, m2, m3 |
| 5 | State & Data Safety | Fail | **C1, C2**, M9, M10, M11, M12; m4, m9. File deletes: `clean-dist.js` removes only `<repo>/dist`, and `cleanup-releases.js` deletes only GitHub releases/tags beyond keep-4 (sanctioned). No other delete paths. |
| 6 | Input Handling | Concerns | m14 |
| 7 | Maintainability | Concerns | m7, m16 |
| 8 | Doc/Code Drift | Concerns | M17, M18, m21 |
| 9 | Build & Release Hygiene | Concerns | M15, M16; m17, m18, m19, m20. Lockfile version matches `package.json` (1.94.1). |

---

## Patterns

The 2026-04-25 review marked "M2 Atomic store writes" as resolved after checking only that tmp-plus-rename existed. Nobody checked durability, and nobody checked what the loader does when both copies are bad, so the BSOD failure mode was certified away. The same "looks handled" pattern recurs across the codebase:
- `catch {}` / `catch { /* skip */ }` appears more than 20 times in `ipc.js`
- `-EA SilentlyContinue` throughout the PowerShell
- stderr is discarded
- every failure becomes `[]`

The result is that the picker and the store both fail silently into the most destructive state: an empty list, or an empty library. Future reviews of any error path should demand a demonstrated failure (a positive control), not the presence of a handler.

---

## Verdict

- Total Critical: 2 (C1, C2)
- Total Major: 18 (M1–M18)
- Total Minor: 21 (m1–m21)

**Verdict:** NO RELEASE CERTIFIED (full audit at c72ca12; this report is not a release gate)

This is a full audit, so no release verdict applies. If it were gating a release, C1 and C2 are open Criticals and would block it. Sully's precondition script can't match this versionless report to a release either way.

| # | Sev | Dim | file:line | Finding | Must fix before the next release |
|---|-----|-----|-----------|---------|--------------------------|
| C1 | Critical | 5 Data | `src/main/store.js:76-102` | No fsync before rename; `.bak` is copied in place from the unflushed file, so a crash can zero or truncate both. | Write tmp, fsync, rename for both the data file and backups; never copy onto the live `.bak`. |
| C2 | Critical | 5 Data | `src/main/store.js:13-45`, `src/main/index.js:21-27` | Any load failure (corrupt or locked) returns an empty library, and the boot theme save persists it over both copies. | Quarantine unreadable files, try rotating backups, and suppress all saves until the user confirms a fresh start. |
