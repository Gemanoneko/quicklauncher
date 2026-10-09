# Changelog

All notable changes to this tool are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/); this project uses date-stamped
version tags rather than semantic versioning strictness.

## [v1.99.0] - 2026-10-09

### Added
- Resize Column height from its bottom edge and Row width from its right edge, with manual dimensions saved per layout and the other axis kept fixed.

### Fixed
- Automatic Row and Column regions refit at their dropped position; manually saved dimensions take precedence and remain preserved after dragging.

### Notes
- Resizing keeps other regions in place. Manual QA by Sergei; no automated or runtime QA was performed for these changes.
## [v1.98.0] - 2026-10-09

### Added
- Up to sixteen regions, with the same limit used by creation controls and validation.

### Changed
- Regions can overlap temporarily while dragging; an occupied drop snaps to the nearest free desktop space.
- Ring center grows with icon size, with minimum clearance and safe geometry when desktop space is limited.

### Fixed
- Defensive MatchAll binding preserves radial-layout transparency handling.

### Notes
- Manual QA by Sergei; no automated or runtime QA was performed for these changes.
## [v1.97.0] - 2026-10-09

### Added
- Global Region transparency slider in Settings (0–100% in steps of 5), applied live to all regions and saved across restarts.
- Transparency affects background fills and gradients while retaining foreground icons, labels, controls, artwork and blur; 0% restores the original theme rendering.

### Notes
- Manual QA by Sergei; no automated or runtime QA was performed for this addition.
## [v1.96.0] - 2026-10-09

### Added
- Region right-click menus now offer Add Region with the existing layout choices, radial capacity labels and eight-region limit, without opening Manager.

### Fixed
- Static themes such as X-Files no longer leave an opaque entrance overlay covering icons in Grid, Row and Column layouts.

### Notes
- Manual QA by Sergei; no automated or runtime QA was performed for this addition.
## [v1.95.1] - 2026-10-09

### Fixed
- Installed-app picker keeps the current search when scanning finishes, trims surrounding search spaces and returns filtered matches to the top of the list.

### Notes
- Manual QA by Sergei; no automated or runtime QA was performed for this patch.
## [v1.95.0] - 2026-10-09

### Added
- Desktop regions with Grid, Fan and Ring layouts, region settings and tray controls.
- Complete theme fidelity collection across all 101 themes, including the remaining batches 08–14.

### Fixed
- Readability of region header controls in FF8 and Persona4 and shortcut links in FF6, FF9 and the Rebel, Republic and Separatist themes.

### Notes
- Sergei will perform manual QA. Agent QA, native-test tooling and automated QA lifecycle scripts are excluded from this release.
## [v1.94.3] - 2026-09-29

### Fixed
- A locked shortcut file at login no longer leaves saving off for the whole session; the store re-checks and merges edits once the file is readable.
- The save-error banner now reaches the screen, and only appears if saving is still off after about 10 s.
- The app picker no longer freezes the app while it loads icons.
- The Settings "Random theme on startup" checkbox persists.
- Changing a setting no longer resets the window position or size.
- The tray's Random theme and Start with Windows items follow the Settings checkboxes.
- Leaving read-only is safe even if an internal listener fails.

## [v1.94.2] - 2026-09-28

### Fixed
- Idle CPU: animations now pause when the window is unfocused, covered, or hidden.
- Picker now shows many more installed apps.
- Shortcuts survive a crash mid-save — corrupt files are recovered or set aside instead of being wiped.

## [v1.94.1] - 2026-04-25

### Changed
- Per-theme `--accent-text` overrides rolled out for 13 dark/saturated themes.
- Introduced the `--accent-text` CSS variable plus a linter row for it.
- Failing-color title keyframes aligned with the new `--accent-text` variable.
- Corrected the release-pipeline description in the brief to match local-publish reality.

## [v1.94.0] - 2026-04-25

### Added
- Global `Ctrl+Space` show/hide hotkey, user-rebindable in settings.
- Build-time theme contrast linter that gates new/changed themes and warns on legacy ones.
- Grid arrow-key navigation, type-to-filter, and a `?` keyboard cheat-sheet overlay.
- Default-off ambient animations honoring `reducedMotion` / OS preference.
- Tray right-click menu expanded per UX review §7 / I5.
- Tray update-available indicator dot per UX review §7.

### Changed
- Tile gap increased 4 → 8 px per UX review §1 / P1.
- Click targets raised to the WCAG 2.2 AA 24×24 minimum.
- `nameLower` cached on the tile dataset for filter performance (Senua M1).
- Brief updated to describe the `Ctrl+Space` hotkey, keyboard surface, and contrast linter.

### Fixed
- Launch errors now surface instead of failing silently.
- Contrast brightened on red-keyed themes (Gryffindor / Doom Eternal / Akira) and across
  `--text-dim` / `--hint-sub-color` for all themes, plus targeted fixes for the Potterverse,
  LotR, horror, sci-fi, cyber, period, adventure, drama, and franchise-cluster (SW/FF/WH/WoW)
  theme sets.
- IME composition keydown events no longer misfire input handling (Senua M2).
- Tray `setupTray` now early-returns on an empty icon bitmap instead of erroring (Senua M3).
- 12px body-text floor enforced on functional copy (§3 / I6).

## [v1.93.5] - 2026-04-24

### Changed
- Full cleanup sweep: Majors M1, M3–M5, Minors, and re-review micro-fixes.

## [v1.93.4] - 2026-04-24

### Fixed
- Atomic store writes with `.bak` recovery (Senua M2).

## [v1.93.3] - 2026-04-24

### Fixed
- `release.mjs` `gh` path resolution on Windows.

### Changed
- `release.mjs` now sources `GH_TOKEN` from the `gh` CLI.

## Earlier releases

Releases before v1.93.3 (back through v1.0.0) are recorded only in git tag history —
see `git log --oneline --decorate --tags` in this repo.
