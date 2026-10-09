# Code Review — QuickLaunch v1.96.0

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-09
Tool: QuickLaunch (product QuickLauncher)
Release: v1.96.0
Commit range: a6c435a46f38da641a0c4700030ea1f1799f5dcc..734202efc774615aaa87537c674382d5f95aa7d2
Files changed: 8 files, +126 / -8
Runtime subset: 3 files, +22 / -5
Tree: clean detached WIP/QuickLaunch-release-1.95.0 at 734202efc774615aaa87537c674382d5f95aa7d2
Method: static read of committed diff and relevant existing call paths; no tests, harnesses, application launches or QA
Stand-down dimensions: none
```

## Summary

Reviewed all runtime changes since the last source-review endpoint: the shipped installed-app picker search fix, Add Region in the region header context menu, and the entrance-overlay opacity fix for static themes. Also read the new menu specification and release/version metadata. Existing regions, themes and prior advisory debt were not re-audited.

The picker now applies the current search when scanning finishes. Add Region uses the existing creation flow, layout order/capacity annotations and eight-region limit without new IPC. The entrance overlay defaults to transparent when its animation is `none`; existing entrance keyframes explicitly start opaque and end transparent. No new finding identified. Severity follows Team/Docs/ProcessRules.md § Severity definitions.

## Rubric

### 1. Security

- Status: Pass — no new IPC, shell execution, paths, credentials or renderer privileges.

### 2. Correctness & Logic

- Status: Pass — search completion uses current input; menu actions re-enter creation-time validation; the static entrance overlay has a transparent underlying opacity while animated entrance keyframes retain their explicit opacity values.

### 3. Crash / Stability Safety

- Status: Pass — menu refusal feedback catches dialog rejection; CSS and bounded picker changes add no identified crash path.

### 4. Performance

- Status: Pass — no new loops/timers or native work; filtering and layout submenu construction retain existing bounded operations.

### 5. State & Data Safety

- Status: Pass — region creation delegates to existing cap/placement checks; search and overlay changes do not modify persisted data or user files.

### 6. Input Handling

- Status: Pass — search input is trimmed and normalized; missing app names are safely coerced; native menu layout identifiers come from the built-layout set.

### 7. Maintainability (no Critical findings on its own)

- Status: Pass — changes remain localized to existing picker, native menu and overlay paths.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Pass — menu placement/capacity behavior matches the committed specification; changelog describes the menu, picker fix and static-theme overlay correction.

### 9. Build & Release Hygiene

- Status: Pass — package/lockfile versions agree at 1.96.0, with no dependency or packaging configuration change; final source checkout is clean.

## Verdict

- Total Critical: 0 new/open in this range
- Total Major: 0 new
- Total Minor: 0 new

**Verdict:** RELEASE CLEAR

Range certified: `a6c435a46f38da641a0c4700030ea1f1799f5dcc..734202efc774615aaa87537c674382d5f95aa7d2`. No identified safety-floor violation. Prior advisory findings remain in their original reports. This is source clearance only; Sergei owns manual QA and the compiled installer was not exercised.

Manual checks after release: search during installed-app scanning; Add Region from header right-click and ⋯, including the eight-region limit; X-Files icons in Grid, Row and Column, plus an animated theme and Fan/Ring for comparison.
