# Code Review — QuickLaunch v1.104.0

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-10
Tool: QuickLaunch (Electron / Windows)
Release: v1.104.0
Commit range: 91ad19f4af760c25226702bc5300cef107206880..8c5b61d6e91163686af1420257807d95b42b5744
Files changed: 8 files, +234 / -17
Stand-down dimensions: None; all nine dimensions reviewed within the foreground-toggle delta.
```

## Summary

Source review of the existing global hotkey's temporary region foreground mode, native promotion/restoration, watchdog integration, lifecycle cleanup and Settings copy. Tray visibility routing remains separate. Final committed changes include promotion-failure visibility rollback, explicit Show unwinding the session, suppression-aware restoration for windows without snapshots and menu-open cleanup on popup errors. Previously reviewed geometry, shell command implementation and persistence were excluded except at their interaction points.

## Rubric

### 1. Security

- Status: Pass — native operations validate process-owned HWNDs and saved thread/process identity; sibling restoration checks current parent membership. Focus return validates the external target and only attempts restoration while a region still owns foreground.

### 2. Correctness & Logic

- Status: Pass — all participating siblings are captured before detachment, topmost is cleared before desktop reattachment, current physical geometry is retained, and a final order pass follows reattachment. Hotkey and tray callers route to distinct foreground/visibility behaviors.

### 3. Crash / Stability Safety

- Status: Pass — failed promotion rolls back host mode and Chromium visibility; failed native return stays hidden/pending until topmost cleanup succeeds. Reload, crash/close, display change, suspend/resume and quit unwind transient state; watchdog does not reattach intentional foreground windows.

### 4. Performance

- Status: Pass — toggle reuses existing hosts and watchdog without creating new polling/timers or helper processes.

### 5. State & Data Safety

- Status: Pass — foreground snapshots are runtime-only; toggle does not save positions/settings. User drag/layout changes retain current geometry; explicit Show/Hide takes visibility ownership after unwinding, and nonparticipating/suppressed windows obey current visibility constraints.

### 6. Input Handling

- Status: Pass — active gestures, shell menu work, native region menus and rename drafts/submissions cause an ignored invocation without queuing. Promotion uses no-activate flags; return avoids taking focus from an application launched during the session.

### 7. Maintainability

- Status: Pass — ownership is divided between controller session, host visibility/mode and native HWND token; failure and cleanup paths use the same restoration routine.

### 8. Doc/Code Drift

- Status: Pass — Settings label and changelog describe bring-forward/return behavior and unchanged tray visibility control.

### 9. Build & Release Hygiene

- Status: Pass — pinned checkout was clean; package and both lockfile version fields agree at 1.104.0, without dependency, schema, IPC or C# changes.

## Review Limits

Source inspection only: no QA, tests, probes, native input, builds or app/helper execution. Actual focus/z-order behavior, hidden/shown restoration, repeated toggles, user drag/layout while foreground, menu/rename guards, Explorer restart and display changes remain Sergei's manual acceptance checks. Source review cannot establish Windows focus-policy outcomes.

The reported promotion-failure visibility rollback and second-launch explicit-Show findings were corrected before this candidate; neither remains open.

## Verdict

- Total Critical: 0
- Total Major: 0
- Total Minor: 0

**Verdict:** RELEASE CLEAR
