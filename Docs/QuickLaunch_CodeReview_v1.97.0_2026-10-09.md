# Code Review — QuickLaunch v1.97.0

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-09
Tool: QuickLaunch (product QuickLauncher)
Release: v1.97.0
Commit range: 734202efc774615aaa87537c674382d5f95aa7d2..655307081e35d54f6eaf7e1bb7e72c5ae2cd9e4d
Files changed: 11 files, +298 / -12
Runtime subset: 6 files, +202 / -9
Tree: clean codex/region-transparency checkout WIP/QuickLaunch-release-1.95.0 at 655307081e35d54f6eaf7e1bb7e72c5ae2cd9e4d
Method: bounded static source review; no tests, harnesses, browser/native/application launches or QA
Stand-down dimensions: none
```

## Summary

Reviewed the new global transparency setting across persistence, main-process validation, controller propagation, Manager UI and region paint. The slider accepts finite numeric values clamped to 0–100 in steps of 5; legacy absence renders as 0. Existing global save/broadcast delivers the change to current regions, while new/restarted regions load it from settings. Region-only companion CSS changes background declarations and preserves media/supports conditions and declaration priorities. Slider movement changes a CSS variable; transparency-only saves skip content refitting and theme/banner restart.

No concrete new finding identified. This review certifies the committed source range, not rendered behavior across every theme/layout. Prior advisory findings remain in their original reports. Severity follows Team/Docs/ProcessRules.md § Severity definitions.

## Rubric

### 1. Security

- Status: Pass — no new IPC, privilege, shell or filesystem surface; CSS companions derive from local stylesheets and the renderer receives a validated numeric setting.

### 2. Correctness & Logic

- Status: Pass — global saves broadcast to all region renderers; paint generation changes background properties only, preserves URL tokens and excludes ordinary decorative pseudo-elements, icon images and the entrance overlay; 0 disables the companion sheet to restore the original cascade. Theme load rebuilds the companion, while transparency-only updates preserve current theme/banner/layout work.

### 3. Crash / Stability Safety

- Status: Pass — variable resolution and paint recursion have depth bounds; no identified new process-crash path in the local stylesheet and numeric input contract.

### 4. Performance

- Status: Pass — no new timer, polling, animation or blur; companion generation is tied to theme preparation/load, with slider updates using one CSS variable and existing settings delivery. Runtime CPU and repaint behavior were not measured.

### 5. State & Data Safety

- Status: Pass — one global settings field uses existing save persistence; no per-region state or user-file operation is added; Manager request/settlement revisions protect slider display against stale refresh responses.

### 6. Input Handling

- Status: Pass — main boundary rejects nonnumeric/nonfinite input, clamps and quantizes accepted values; Manager/region reads safely default missing values to 0; native range label, percentage and accessibility description are wired.

### 7. Maintainability (no Critical findings on its own)

- Status: Pass — background conversion is localized to a bounded renderer helper, with settings propagation retaining its existing contract and no individual theme rewrites.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Pass — committed spec and changelog match the slider placement/range, global persistence and background-only intent; Manager has no companion paint installation.

### 9. Build & Release Hygiene

- Status: Pass — package/lockfile versions agree at 1.97.0; no dependency or packaging change; final source checkout is clean and the six runtime paths are within existing packaging.

## Verdict

- Total Critical: 0 new/open in this range
- Total Major: 0 new
- Total Minor: 0 new

**Verdict:** RELEASE CLEAR

Range certified: `734202efc774615aaa87537c674382d5f95aa7d2..655307081e35d54f6eaf7e1bb7e72c5ae2cd9e4d`. No identified safety-floor violation. No automated or runtime QA was performed.

Sergei's manual checks: move the slider with multiple region layouts open; verify solid icons/text/focus indicators, original appearance at 0%, clear backgrounds at 100%, theme/layout switching, new regions and restart persistence, and unchanged Manager surfaces. Rendered contrast, paint fidelity and CPU remain manual acceptance items.
