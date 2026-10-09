# Code Review — QuickLaunch v1.98.0

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-09
Tool: QuickLaunch (product QuickLauncher)
Release: v1.98.0
Commit range: 655307081e35d54f6eaf7e1bb7e72c5ae2cd9e4d..7286ff081d52162dee4634ae1a3018fa51dbebf4
Files changed: 16 files, +255 / -22
Runtime subset: 9 files, +133 / -19
Tree: clean codex/region-drop-snap checkout WIP/QuickLaunch-release-1.95.0 at 7286ff081d52162dee4634ae1a3018fa51dbebf4
Method: bounded static source review; no tests, QA, harnesses, browser/native/application launches
Stand-down dimensions: none
```

## Summary

Reviewed free-overlap region dragging and nearest valid drop placement, temporary owned-window ordering, the sixteen-region limit, shared Ring hub geometry/hit areas, and direct radial transparency binding with companion double-fade exclusion. Reviewed the associated committed specifications and release metadata. Earlier cleared themes, transparency implementation and unrelated file movement were not re-audited. The Match All screenshot's original runtime cause remains unproven; the change is defensive source wiring, not a reproduced/verified runtime fix.

No Critical identified. One Major behavior limitation remains in fallback-window drag ordering. Severity follows Team/Docs/ProcessRules.md § Severity definitions; prior advisory findings remain in their original reports.

## Rubric

### 1. Security

- Status: Pass — native raising checks live child/parent identity, restores only a valid sibling position, uses no-activation flags, and introduces no global topmost operation; RegionHost also checks the saved BrowserWindow/handle identity before restoration.

### 2. Correctness & Logic

- Status: Concerns
- **[Major] M1:** `src/main/desktop/region-host.js:227` — `beginDragRaise()` refuses fallback windows, so they may overlap another region during dragging without appearing above it, contrary to the general drag specification. Attached desktop children receive temporary elevation; fallback ordering is deliberately unchanged to avoid promoting windows above applications. This is a nonblocking visual behavior limitation for fallback mode, requiring a future owned-window-only solution if needed.
- Source checks otherwise found consistent final-pointer delivery, cancel/no-room restoration, final-only persistence and nearest-placement boundary enumeration with topmost/leftmost equal-distance ties. The Ring radius clearance uses actual rounded tile bounds; proportional hub growth is capped by that clearance, and renderer/native/main hit consumers use the shared geometry.

### 3. Crash / Stability Safety

- Status: Pass — drag ordering clears on hide, mode change, stop and window destruction; lost-capture routes cancel rather than commit; no new identified crash path.

### 4. Performance

- Status: Pass — nearest placement uses a bounded candidate product for the sixteen-region limit; Ring geometry remains bounded by existing item caps; no new timer, polling, animation or blur is added. Runtime CPU was not measured.

### 5. State & Data Safety

- Status: Pass — only the dragged region receives the final placement; transient moves are not persisted, cancel/no-room restores its start, and the canonical cap preserves existing regions without truncation.

### 6. Input Handling

- Status: Pass — drag numeric inputs retain the existing finite IPC conversion, main accepts only end/cancel termination, and Ring drag initiation excludes controls and points outside the visible circle. Shared hub hit geometry avoids covering shortcut tiles.

### 7. Maintainability (no Critical findings on its own)

- Status: Pass — nearest drag placement is separate from existing programmatic positioning; region count has one exported constant; Ring visible/native/drop geometry shares the same hub result.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Concerns — the generic specification's above-other-regions behavior is incomplete in fallback mode (M1, counted once); otherwise final placement, sixteen-region cap and Ring clearance match the committed specifications. Match All runtime resolution remains manual acceptance.

### 9. Build & Release Hygiene

- Status: Pass — package and lockfile agree at 1.98.0 with version-only lock changes; no new dependency or packaging surface; final source checkout is clean.

## Verdict

- Total Critical: 0 new/open in this range
- Total Major: 1 (M1)
- Total Minor: 0 new

**Verdict:** RELEASE CLEAR

Range certified: `655307081e35d54f6eaf7e1bb7e72c5ae2cd9e4d..7286ff081d52162dee4634ae1a3018fa51dbebf4`. No identified safety-floor violation. Source clearance does not certify installed behavior or rendering; no automated/runtime QA was performed.

Manual checks: freely overlap regions, release onto occupied space and check only the dragged region moves; cancel/no-room and restart placement; create sixteen regions and verify the limit; change Ring item count/icon size and check center clearance, control hits and dragging; compare Fan/Ring transparency with Match All on/off. Fallback dragging has the advisory elevation limitation above.
