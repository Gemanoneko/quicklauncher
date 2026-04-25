# QuickLaunch — Brief

## What It Does
Cyberpunk-themed desktop quick launcher for Windows. Tray-resident Electron app that pops up a themeable grid of shortcuts (apps, files, URLs) for fast launching. Supports multiple themes (picked randomly on startup by default), global show/hide, single-instance lock, auto-launch on Windows login, and auto-updates.

## What Sergei Does With It
Keeps it in the tray. Pops it open when he wants to launch something without hunting through the Start menu or Desktop. Cycles themes for fun.

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
- GitHub Actions CI builds + releases, `scripts/cleanup-releases.js` keeps last 4

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
