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
  - `src/main/` — main process (window, tray, IPC, updater, persistent store)
  - `src/renderer/` — vanilla HTML/CSS/JS UI with per-theme stylesheets in `src/renderer/styles/themes/`
  - `preload.js` — context-bridge IPC surface
- `electron-builder` for NSIS installers, `electron-updater` for auto-update
- Local-publish release pipeline via `npm run release` → `scripts/release.mjs`, which sources `GH_TOKEN` from `gh auth token` and runs `electron-builder --publish always`. `scripts/cleanup-releases.js` runs as the `postbuild` step, keeping the last 4 GitHub releases. There is no `.github/workflows/` — releases are built and published from Sergei's machine.

## Commands
| Purpose | Command |
|---|---|
| Run in dev | `npm start` (plain `electron .` — no dev server) |
| Theme contrast gate | `npm run check:contrast` (also runs as `prebuild`) |
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
| Release path | **Local** `npm run release` via `scripts/release.mjs`, token from `gh auth token` (ProcessRules § Local Electron releases source GH_TOKEN from `gh` CLI). | GitHub Actions CI (not adopted — releases have been built and published from Sergei's machine since the tool joined the studio). | Releases need to happen from a machine without `gh` auth, or artifacts outgrow local builds. |

## Notes
- Single-instance lock means only one QuickLaunch process can run at a time — second launches are silently dropped. Agents testing it must not collide with the instance Sergei is running, or grab his global hotkey (ProcessRules § Our tooling must not intrude on Sergei's machine).
- Auto-launch registration uses `app.getPath('exe')` and is only applied for packaged builds (dev builds would register the bare Electron binary).
- The global show/hide hotkey defaults to `Ctrl+Space` and is rebindable in Settings → GLOBAL SHOW/HIDE HOTKEY (click the field, press the desired combo, or click ✕ to disable). Bindings register via Electron's `globalShortcut` so they fire even when the window is hidden / unfocused. If a binding fails (already held by another app), the Settings panel surfaces a `CONFLICT — IN USE BY ANOTHER APP` status and reverts to the previously-bound value.
- Theme contrast is gated by `scripts/check-theme-contrast.js` (run via `npm run check:contrast`, also invoked as `prebuild`). Legacy themes that fail AA only warn; new or modified themes must clear WCAG 2.2 AA. Baseline is `scripts/themes-baseline.json` and updates only via deliberate `--rebaseline` invocation.
