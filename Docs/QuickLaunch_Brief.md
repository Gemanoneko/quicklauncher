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
- Local-publish release pipeline via `npm run release` → `scripts/release.mjs`, which sources `GH_TOKEN` from `gh auth token` and runs `electron-builder --publish always`. `scripts/cleanup-releases.js` runs as the final postbuild step, keeping the last 4 GitHub releases. There is no `.github/workflows/` — releases are built and published from Sergei's machine.

## Repo
- GitHub: `https://github.com/Gemanoneko/quicklauncher`
- Local: `WIP/QuickLaunch/`
- Git status (as of 2026-04-24): clean, on `main`, in sync with origin.

## Current Version
`1.93.0` (see `package.json`)

## Stage
**Daily Use / Maintain** — tool is past prototype, actively used, has a working CI release pipeline.

## Notes
- The legacy `setup-git.ps1` in the repo root references the old path `c:\Antigravity Projects\Personal\QuickLaunch`. The tool has since moved to `WIP/QuickLaunch/`. The script is no longer needed (git is already correctly configured) and should be deleted in a future patch — flagged to Ender.
- Single-instance lock means only one QuickLaunch process can run at a time — second launches are silently dropped.
- Auto-launch registration uses `app.getPath('exe')` and is only applied for packaged builds (dev builds would register the bare Electron binary).
- The global show/hide hotkey defaults to `Ctrl+Space` and is rebindable in Settings → GLOBAL SHOW/HIDE HOTKEY (click the field, press the desired combo, or click ✕ to disable). Bindings register via Electron's `globalShortcut` so they fire even when the window is hidden / unfocused. If a binding fails (already held by another app), the Settings panel surfaces a `CONFLICT — IN USE BY ANOTHER APP` status and reverts to the previously-bound value.
- Theme contrast is gated by `scripts/check-theme-contrast.js` (run via `npm run check:contrast`, also invoked as `prebuild`). Legacy themes that fail AA only warn; new or modified themes must clear WCAG 2.2 AA. Baseline is `scripts/themes-baseline.json` and updates only via deliberate `--rebaseline` invocation.
