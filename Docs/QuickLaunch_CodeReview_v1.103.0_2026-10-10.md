# Code Review — QuickLaunch v1.103.0

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-10
Tool: QuickLaunch (Electron / Windows)
Release: v1.103.0
Commit range: d69848e646aaac48380eb9656f9f520bb242004a..6589585c6bc8dc61978cfd1036c5b304643d4e74
Files changed: 11 files, +69 / -25
Stand-down dimensions: None; all nine dimensions reviewed within this release delta.
```

## Summary

Bounded source review of native-menu completion and compile-cache warming, two-line rectangular shortcut labels and corresponding geometry, and row-major alphabetical Grid placement. The committed eight runtime paths match the reviewed implementation, including the final label padding/comment correction. Existing native authority, persistence and radial geometry were inspected only where these changes depend on their contracts.

## Rubric

### 1. Security

- Status: Pass — startup preparation invokes the cached compiler workflow only; helper execution still requires a user menu request. No private dark-menu hooks or new privileged renderer surface.

### 2. Correctness & Logic

- Status: Pass — cancelled menus and inline Rename close immediately; selected verbs check completion immediately and while outstanding shell references/dialogs remain. Grid row-major coordinates agree with keyboard navigation and revised Settings help. Column S+54 cells/S+62 pitch, Row S+86 outer height and Grid minimum S+54 agree with the renderer label band.

### 3. Crash / Stability Safety

- Status: Pass — completion timer and Idle handler stop/remove on completion and Dispose; live shell reference-counter storage is retained until the one-shot process exits rather than freed while referenced. Existing owner invalidation and child-close reconciliation remain intact.

### 4. Performance

- Status: Pass — source-hashed compile preparation shares the cached promise; the 200ms WinForms timer exists only for an outstanding selected command, with the existing noninteractive deadline retained. No permanent renderer polling added.

### 5. State & Data Safety

- Status: Pass — menu completion still precedes journal reconciliation, and label/sort changes do not rewrite saved manual order or paths.

### 6. Input Handling

- Status: Pass — visible dialog phase remains free of an interaction deadline; rectangular label overrides outrank theme overflow rules and exclude radial layouts. Fit/resize calculations consume shared updated dimensions.

### 7. Maintainability

- Status: Pass — timer ownership is explicit in the native host, compile preparation reuses its existing cache, and rectangular size constants remain localized.

### 8. Doc/Code Drift

- Status: Pass — changelog records row-major sorting, label/menu changes and the unresolved light appearance of classic Windows popup menus without claiming dark styling was fixed.

### 9. Build & Release Hygiene

- Status: Pass — pinned checkout was clean; package and both lockfile version fields agree at 1.103.0 without dependency changes. Sully reported compiler-only success (exit 0, 15,360-byte temporary executable removed, no execution), with inherited CS0108/CS0649 warnings; this reviewer did not compile or execute it.

## Review Limits

Source inspection only: no QA, tests, probes, harnesses, builds or app/helper execution by this reviewer. Repeated menu dismissal/selection, third-party extension dialogs, perceived opening delay, long-label appearance and rectangular fit/scroll/resize remain Sergei's manual checks. Classic popup light styling remains a documented limitation. Compiler success does not establish runtime menu behavior.

## Verdict

- Total Critical: 0
- Total Major: 0
- Total Minor: 0

**Verdict:** RELEASE CLEAR
