# QuickLaunch — Brief

## What It Does
Cyberpunk-themed desktop quick launcher for Windows. Tray-resident Electron app that pops up a themeable grid of shortcuts (apps, files, URLs) for fast launching. Supports multiple themes (picked randomly on startup by default), a user-rebindable global show/hide hotkey (default `Ctrl+Space`), grid keyboard navigation and type-to-filter, single-instance lock, auto-launch on Windows login, and auto-updates.

## What Sergei Does With It
Keeps it in the tray. Pops it open with `Ctrl+Space` (or via the tray) when he wants to launch something without hunting through the Start menu or Desktop. Arrow keys to walk the grid, Enter to launch; type to filter live. Cycles themes for fun. `?` opens a cheat-sheet of all keyboard shortcuts.

## What It Explicitly Does Not Do
- No system-wide search (Alfred/Raycast-style fuzzy search) — it's a curated grid, not a launcher bar
- No plugin ecosystem — just shortcuts
- No cross-platform — Windows only

## Tech Stack
- Electron with a 3-layer architecture:
  - `src/main/` — main process (window, tray, IPC, updater, persistent store) and the hidden picker-icon helper renderer (`icon-worker*.js`, `icon-worker.html`)
  - `src/renderer/` — vanilla HTML/CSS/JS UI with per-theme stylesheets in `src/renderer/styles/themes/`
  - `preload.js` — context-bridge IPC surface
- `electron-builder` for NSIS installers, `electron-updater` for auto-update
- Local-publish release pipeline via `npm run release` → `scripts/release.mjs`, which sources `GH_TOKEN` from `gh auth token` and runs `electron-builder --publish always`. `scripts/cleanup-releases.js` runs as the `postbuild` step, keeping the last 4 GitHub releases. There is no `.github/workflows/` — releases are built and published from Sergei's machine.

## Commands
| Purpose | Command |
|---|---|
| Run in dev | `npm start` (plain `electron .` — no dev server) |
| Theme contrast gate | `npm run check:contrast` (also runs as `prebuild`) |
| Theme screenshot gallery (dev tooling; never launches the app) | `npm run gallery:themes -- --out=<dir> [--ref=<commit>] [--only=a,b]` · guard proof: `npm run gallery:themes -- --self-test` · options: `-- --help` |
| Local installer, never publishes (packaged QA) | `npm run pack` |
| Release (canonical) | `npm run release` — see ProcessRules § Release paths are per tool |
| Fresh install on a new machine | `npm ci` |

`npm run build` also publishes (it's what `release.mjs` calls with the token set) — don't run it directly for a release.

## Names
Folder `WIP/QuickLaunch/` · product name **QuickLauncher** (window title, tray menu, installer) · npm package and GitHub repo `quicklauncher`. In studio docs, "QuickLaunch" means this tool.

## Repo
- GitHub: `https://github.com/Gemanoneko/quicklauncher`
- Local: `WIP/QuickLaunch/`

## Current Version
See `package.json` (`version` field is the source of truth).

## Stage
**Daily Use / Maintain** — past prototype, actively used, with a working local release pipeline (no CI) and `keep-last-4` cleanup.

## Decision Log
*Consequential choices only (ProcessRules § Decision Log in every tool Brief). The first two entries were reconstructed on 2026-09-28 from this Brief and the code; the alternatives weighed at the time weren't recorded.*

| Decision | Chosen | Alternatives (why not) | Revisit when |
|---|---|---|---|
| Window lifecycle | **Tray-resident.** Closing the window hides it; `window-all-closed` deliberately does not quit. The process ends from the tray's **Quit QuickLauncher**, which calls `app.exit(0)` with no renderer round-trip. This is the recorded exception to ProcessRules § The close button must always quit the process — the invariant moves to the tray's Quit. | Quit on window close (a launcher that exits when closed can't answer the global hotkey). | The Quit path ever needs a renderer round-trip, or a close/quit hang is reported. |
| Idle animation | **Animations pause while the window is unfocused or hidden** (`body.ql-paused`, set by `app.js` on blur/hide, frozen in `base.css`; the entrance fade and tile hover keep running). Added 2026-09-28 after Sergei reported high CPU: Chromium keeps drawing CSS animations at display rate while the window is on screen, even covered, and cost 74–106% of one core at 120 Hz. | Edit all 101 themes to cheaper animations (a visual change, proposed to Judy/Sergei rather than done); rely on Chromium occlusion (tested, it never marks this window occluded). | CPU while focused becomes a complaint (still high at 120 Hz). |
| Store durability | **Crash-safe saves:** write `.tmp` → fsync → rename previous file to `.bak` → rename `.tmp` into place. Load validates shape and falls back `.tmp` → `.bak`, quarantining unreadable files as `*.corrupt-<timestamp>`; a present-but-unreadable file makes the store read-only until it reads again (next row); an empty library never replaces a backup that has shortcuts. On-disk format unchanged. Added 2026-09-28 after Sergei lost all shortcuts on a BSOD. | Keep the in-place `.bak` copy (it could blank both copies on a crash, and the boot save then wrote the empty library over both). | Data format changes, or a sync/cloud store is ever added. |
| Leaving read-only mode | **Re-check, then three-way merge.** A read-only store re-checks the file that caused it before every save it would refuse, on window focus, and every 5 s. Once it reads, it is loaded exactly as at startup (same validation, quarantine and `.tmp`/`.bak` recovery), and the session's changes are merged into it before anything is written: base = the copy the session was shown, mine = that copy plus the session's edits, disk = the file now. Nothing on disk is dropped unless the user removed it this session; the user's edits and additions win; a shortcut re-added with a path already on disk isn't duplicated; if nothing on disk is intact, the session's copy is kept whole. The renderer is pushed the merged state and acks it; until then its saves are merged against the copy it holds, so a stale save can't overwrite the library. Added 2026-09-28 (v1.94.3): read-only used to last the whole session — every edit was lost at Quit, and with both files locked at login the user saw 0 apps all day. | Reload from disk and discard the session's edits (loses what the user did); write memory over disk (loses anything only on disk); ask the user to restart (a UX call, and the edits are still lost). | A second writer of the data file ever exists (sync, another instance), or a merge result is ever reported wrong. |
| Picker icon processing | **Off the main thread, in a hidden helper renderer** (`src/main/icon-worker.js`): decode, trim and PNG re-encode of the ~570 picker icons run there with the same `nativeImage` codecs and the same `encodeIcon()` (`icon-trim.js`), so the output is byte-identical; the helper lives for one batch; if it can't start, dies or stalls, the rest is done in-process in ~12 ms slices. The helper is **not sandboxed** — `nativeImage.toBitmap()`, which trimming needs, crashes a sandboxed renderer — but its page is an empty local file with a deny-all CSP, context isolation is on, it has no Node in the page, and it can't navigate or open windows. Added 2026-09-28 (v1.94.3): the work froze the tray, hotkey and window drag for 2.3–5.9 s per scan. | Node worker thread (can't load Electron modules); utility process (no `nativeImage`); encode in the C# helper (not byte-identical); time-slice on the main thread only (still ~2.3 s of main-thread CPU per scan). | Electron makes `nativeImage` available to workers or the utility process, or a sandboxed renderer can read bitmaps. |
| Picker Start Menu lookup | **One pass over the Start Menu into an exact-name index**, with the shell's own Start icon as the last resort for every non-URL entry. Added 2026-09-28: a PowerShell precedence bug meant the lookup matched 0 of 424 shortcuts, and desktop apps with no icon were dropped (362 → 566 of 654 Start apps now shown). | Loose per-app name match (slow, gave wrong icons). | Picker scan time nears the 45 s timeout. |
| Theme screenshots | **Renderer-only offscreen harness** (`scripts/theme-gallery/`): the real `src/renderer` in offscreen, never-shown Electron windows with a stub preload and mock tiles; `src/main` is never loaded, so there is no tray, hotkey, store or login-item code in the process. Login-item, shortcut, window-show/focus and dialog APIs are counting no-ops, the network is blocked, and the HKCU Run keys are read before and after; `--self-test` proves each guard fires. Captures are pixel-identical run to run (software raster, device emulation, animations paused at one time), so "before" and "after" folders diff 1:1. Added 2026-09-30 for the theme fidelity pass. | Launch the packaged app and screenshot it (rewrites the HKCU Run entry at boot, takes focus, holds the hotkey); load `src/main/index.js` with patches, as the 2026-09-28 CPU harness did (the main process is still in the loop); a headless browser on the renderer (no Electron `nativeImage`/IPC shape, extra dependency). | A theme needs main-process behaviour to look right, or Electron's offscreen capture changes behaviour on upgrade (re-run `--self-test` and a repeat run after any Electron bump). |
| Release path | **Local** `npm run release` via `scripts/release.mjs`, token from `gh auth token` (ProcessRules § Local Electron releases source GH_TOKEN from `gh` CLI). | GitHub Actions CI (not adopted — releases have been built and published from Sergei's machine since the tool joined the studio). | Releases need to happen from a machine without `gh` auth, or artifacts outgrow local builds. |

## Notes
- Single-instance lock means only one QuickLaunch process can run at a time — second launches are silently dropped. Agents testing it must not collide with the instance Sergei is running, or grab his global hotkey (ProcessRules § Our tooling must not intrude on Sergei's machine).
- Auto-launch registration uses `app.getPath('exe')` and is only applied for packaged builds (dev builds would register the bare Electron binary).
- The global show/hide hotkey defaults to `Ctrl+Space` and is rebindable in Settings → GLOBAL SHOW/HIDE HOTKEY (click the field, press the desired combo, or click ✕ to disable). Bindings register via Electron's `globalShortcut` so they fire even when the window is hidden / unfocused. If a binding fails (already held by another app), the Settings panel surfaces a `CONFLICT — IN USE BY ANOTHER APP` status and reverts to the previously-bound value.
- Theme contrast is gated by `scripts/check-theme-contrast.js` (run via `npm run check:contrast`, also invoked as `prebuild`). Legacy themes that fail AA only warn; new or modified themes must clear WCAG 2.2 AA. Baseline is `scripts/themes-baseline.json` and updates only via deliberate `--rebaseline` invocation.
