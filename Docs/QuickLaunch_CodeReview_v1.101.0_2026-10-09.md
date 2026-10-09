# Code Review — QuickLaunch v1.101.0

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-09
Tool: QuickLaunch (Electron / Windows)
Release: v1.101.0
Commit range: 800b0c9588e76573e6bbb18e9027670c6c455d73..dbedfdf102d1318a16faff470990e89bcbb82b00
Files changed: 14 files, +623 / -39
Stand-down dimensions: None; all nine dimensions reviewed within this range.
```

## Summary

Bounded source review of the Windows shell-menu helper and IPC integration, identity-backed rename/recovery journal, same-region tile swaps, Ring capacity sixteen, and Steam icon cache correction. The final Steam delta shares the picker lookup with revision-two stored-icon refresh, passes numeric IDs through environment data, retains previous icons on failure, and merges against live IDs, paths and previous icon values without replacing order. Previously reviewed themes and other inherited runtime code were excluded.

## Rubric

### 1. Security

- Status: Pass — scoped sender/owner authority, stored paths and identities, selected native verbs, JSON stdin and bounded numeric Steam IDs; no new safety-floor violation found.

### 2. Correctness & Logic

- Status: Concerns.
- Findings: [Minor] `src/main/moves/mover.js:197`, `src/main/regions/controller.js:1851` — case-only file Rename can resolve the old spelling to the same Windows file identity, finish reconciliation without updating stored casing/label, and then report a recovery error because the returned path comparison is case-sensitive. The file remains accessible; this is advisory.

### 3. Crash / Stability Safety

- Status: Pass — owner reload/close/crash invalidates tickets; cancellation ignores subsequent stdout and waits for actual child close before reconciliation; native COM/PIDL/menu resources have cleanup paths.

### 4. Performance

- Status: Pass — source-hashed helper compilation cache, serialized menu invocation, phase deadlines outside interactive menus/dialogs, bounded canonical Ring/Fan geometry, and one-revision icon refresh introduce no continuous polling loop.

### 5. State & Data Safety

- Status: Pass — durable pre-menu intent, active-ticket exclusion, stable identity/content matching, final restore identity recheck, recoverable unknown moves/deletions, exact drag-start order validation, and swap save rollback protect stored ownership and ordering.

### 6. Input Handling

- Status: Pass — rename basename/extension and collision checks, region/item/ticket validation, scoped coordinates, control exclusions and cancellation handling were inspected; Steam lookup accepts numeric app IDs and uses literal filesystem paths.

### 7. Maintainability

- Status: Pass — native wrapper, shared identity comparison, canonical capacities and common Steam cache lookup keep the new contracts localized.

### 8. Doc/Code Drift

- Status: Pass — changelog describes the committed features and records compiler-only verification plus manual QA responsibility.

### 9. Build & Release Hygiene

- Status: Pass — pinned checkout was clean at inspection; package and both lockfile version fields agree at 1.101.0, with no dependency delta. Sully reported successful Framework C# compilation without helper execution; compilation was not performed by this reviewer.

## Review Limits

Source inspection only: no tests, probes, harnesses, builds, helper/app launches, native operations or runtime QA were performed by this reviewer. Third-party shell extension menus/dialogs, actual Rename and recovery, swap interaction, sixteen-icon Ring fit and Steam artwork appearance remain manual checks for Sergei. Compiler success does not establish those behaviors.

Earlier source concerns around active-menu reconciliation, final restore identity checks, owner/page lifetime and premature cancellation completion were corrected in this candidate; they are not open findings.

## Verdict

- Total Critical: 0
- Total Major: 0
- Total Minor: 1

**Verdict:** RELEASE CLEAR
