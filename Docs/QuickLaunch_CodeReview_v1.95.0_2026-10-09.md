# Code Review — QuickLaunch v1.95.0

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-09
Tool: QuickLaunch (product QuickLauncher)
Release: v1.95.0
Commit range: af3b3bc9ca5a4bfd41f8a6abc884d7d732091203..a6c435a46f38da641a0c4700030ea1f1799f5dcc
Files changed: 320 files, +67049 / -24287
Runtime/release subset: 164 files, +22740 / -24273 (src/, scripts/nsis/, package.json, package-lock.json)
Tree: clean detached WIP/QuickLaunch-release-1.95.0 at a6c435a46f38da641a0c4700030ea1f1799f5dcc
Method: bounded static source review; no application launches, tests, harnesses or automated QA
Stand-down dimensions: none
```

## Summary

Reviewed the accumulated committed product changes after the v1.94.3 review endpoint: region windows and layouts, desktop shortcut movement and recovery, Manager/settings and scoped IPC, renderer state delivery, theme resources and decoration constraints, and installer/package source. Historical QA tooling, spike code and reports were excluded from runtime review. Theme inspection covered shared contracts/resource and animation declarations with representative detailed source reads; this is not a visual acceptance of every theme. Dirty native-isolation changes were not part of the reviewed candidate. Sergei owns manual QA.

The first candidate, d36edb33095fe56887d2d91f9f71ab82e9d3c8a9, contained one Critical uninstall data-loss defect. Ender's a6c435a removes the unsafe README deletion; the final committed installer diff was read and the defect is closed. One new Major remains advisory.

Severity follows Team/Docs/ProcessRules.md § Severity definitions. Earlier v1.94.3 advisory findings remain recorded in their original report; this report neither silently closes them nor adds them again to the current findings count. The inherited Electron 32 support/dependency debt also remains outside this release's new runtime dependency change.

## Rubric

### 1. Security

- Status: Pass — region and Manager pages retain sandboxing, context isolation and disabled Node integration; preload channel allowlists and region/Manager ownership checks protect the new mutation routes; shortcut icon paths pass through environment variables rather than shell interpolation.

### 2. Correctness & Logic

- Status: Concerns
- Findings: **[Major] M1** — `src/main/moves/mover.js:583` and `:691`: after a successful restore/orphan move, an uncaught `journal.finish()` rejection skips the normal change notification and success result, leaving the renderer or orphan list stale until a later refresh/restart. Example: the rename and store commit succeed, then the history append fails because the log becomes locked or the disk fills. The file survives and the pending intent supports startup reconciliation; this is an error-reporting/state-notification gap, not observed data loss. Use the existing guarded post-move journal pattern and still notify callers of the completed operation in a later maintenance cycle.

### 3. Crash / Stability Safety

- Status: Pass — native modules fail into unavailable/fallback modes; host rebuild and shape failures have guarded paths. No new concrete process-crash defect identified by source review.

### 4. Performance

- Status: Pass — new theme motifs predominantly use static bounded decorations, header safety refreshes are event-driven, and region hosts share a watchdog. No runtime performance measurements were made.

### 5. State & Data Safety

- Status: Pass
- Closed finding: **[Critical] C1** — initial `scripts/nsis/installer.nsh:51` unconditionally deleted `README.txt` from the shortcut store on uninstall, although `src/main/moves/mover.js:171` deliberately preserves an already-existing README using `flag: 'wx'`. A user-created README could therefore be destroyed. **Fixed in a6c435a:** the Delete statement is absent; only nonrecursive `RMDir` remains, preserving nonempty folders and their files.
- File movement uses same-volume, no-replace Win32 renames with durable intent before moving; region deletion restores existing moved shortcuts before removing the region. No open safety-floor violation identified.

### 6. Input Handling

- Status: Pass — new region mutations constrain identifiers/layouts/themes, finite geometry values and dropped path lists; moved-item path/origin metadata stays main-owned when renderer lists are saved.

### 7. Maintainability (no Critical findings on its own)

- Status: Pass — placement, layout geometry, desktop hosting and file movement have separate modules; no additional concrete maintainability defect logged in this bounded pass.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Pass — release version/changelog identify the completed theme and regions work and manual QA ownership; the uninstall preservation comment matches the final implementation.

### 9. Build & Release Hygiene

- Status: Pass — candidate package and lockfile name 1.95.0, new runtime resources fall within the src packaging rule, and the installer include is configured. Dirty native-isolation files are absent from the candidate. Source clearance does not certify the compiled installer, installed behavior, dependency exploitability, or GitHub artifact contents; these remain release/manual-verification responsibilities.

## Verdict

- Total Critical: 0 open (C1 fixed in a6c435a)
- Total Major: 1 (M1)
- Total Minor: 0 new

**Verdict:** RELEASE CLEAR

Range certified for source review: `af3b3bc9ca5a4bfd41f8a6abc884d7d732091203..a6c435a46f38da641a0c4700030ea1f1799f5dcc`. No open Critical finding or identified safety-floor violation remains. No QA or automated acceptance was performed. For Sergei's manual pass, prioritize shortcut movement/restoration, region/layout persistence through restart, and theme readability at narrow widths and different icon sizes.
