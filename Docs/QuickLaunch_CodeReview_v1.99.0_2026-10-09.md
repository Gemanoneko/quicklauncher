# Code Review — QuickLaunch v1.99.0

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-09
Tool: QuickLaunch (product QuickLauncher)
Release: v1.99.0
Commit range: 7286ff081d52162dee4634ae1a3018fa51dbebf4..6a0bc0ab3508b7d8d9fdcf309d3804f535f156c5
Files changed: 10 files, +198 / -26
Runtime subset: 5 files, +98 / -23
Tree: clean codex/axis-resize checkout WIP/QuickLaunch-release-1.95.0 at 6a0bc0ab3508b7d8d9fdcf309d3804f535f156c5
Method: bounded static source review; no tests, QA, harnesses or application/native/browser launches
Stand-down dimensions: none
```

## Summary

Reviewed manual Column height/Row width resizing, optional persisted per-layout preferences, final/cancel lifecycle, shared outer geometry and axis hit surfaces, plus anchored post-drop content refitting. Scope was the five changed runtime files and release/spec metadata. Existing Grid/Fan/Ring implementations and earlier advisory debt were not re-audited. Source at 00a0971 is unchanged by final doc-only commit 6a0bc0a; its corrected changelog now matches automatic refitting and manual precedence.

No concrete new runtime finding identified. The initial Minor changelog drift is resolved in the final candidate. Severity follows Team/Docs/ProcessRules.md § Severity definitions.

## Rubric

### 1. Security

- Status: Pass — existing scoped resize IPC and finite numeric conversion are retained; no new shell, file, privilege or native backend surface.

### 2. Correctness & Logic

- Status: Pass — only Column bottom/Row right resizing is accepted for those layouts; the fixed axis stays derived from content layout. Preferences override auto sizing, while post-drop refitting retains the chosen anchor and uses collision validation. The six-pixel axis rim is included once in shared outer lengths and reserved by renderer padding, without adding the Grid window rim to Column/Row.

### 3. Crash / Stability Safety

- Status: Pass — axis termination validates end/cancel, sends final release coordinates and handles lost capture; active resize is excluded from content refits and layout switching cancels the local gesture.

### 4. Performance

- Status: Pass — the change uses existing gesture delivery/geometry paths and adds no timers, polling, animation or blur; no runtime performance measurements were made.

### 5. State & Data Safety

- Status: Pass — accepted changed axis resize commits rectangle and preference together; cancellation, failed fit and unchanged blocked gestures preserve prior auto/manual state. Temporary constraints use preferences without overwriting them, and layout switching/migration retain both optional dimensions.

### 6. Input Handling

- Status: Pass — optional dimensions must be positive safe integers; missing/invalid legacy fields retain auto mode; Column/Row force their permitted edge and validate final minimum/area/collision fit.

### 7. Maintainability (no Critical findings on its own)

- Status: Pass — axis sizing stays in existing layout/controller/renderer contracts, with one shared rim constant and no unrelated geometry rewrite.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Pass — corrected changelog in 6a0bc0a describes anchored automatic Row/Column refitting and manual-dimension precedence; initial inaccurate no-auto-fit wording is closed.

### 9. Build & Release Hygiene

- Status: Pass — package and lockfile agree at 1.99.0; no dependency or packaging changes; final candidate is clean and the last commit has no runtime delta.

## Verdict

- Total Critical: 0 new/open in this range
- Total Major: 0 new
- Total Minor: 0 open/new (initial changelog wording corrected before clearance)

**Verdict:** RELEASE CLEAR

Range certified: `7286ff081d52162dee4634ae1a3018fa51dbebf4..6a0bc0ab3508b7d8d9fdcf309d3804f535f156c5`. No identified safety-floor violation. Prior advisory findings remain in their original reports. This is source clearance only; no automated/runtime QA was performed.

Manual checks: resize Column bottom and Row right; confirm fixed opposite edge/cross-axis, collision spacing and unchanged neighbors; cancel and fully blocked resize; add/remove items before/after manual resizing; drag automatic/manual regions; switch layouts, temporarily reduce display space and restart; compare Grid/Fan/Ring. Verify the resize strip still accepts input at full transparency.
