# Code Review — QuickLaunch v1.99.1

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-09
Tool: QuickLaunch (product QuickLauncher)
Release: v1.99.1
Commit range: ed52ddab9728304a8934e6fb7b5a8ea5c89df28f..1fde030d2a27cf5e7ae689708255f1da6deee177
Files changed: 6 files, +135 / -39
Runtime subset: 3 files, +123 / -36
Tree: clean product checkout WIP/QuickLaunch-release-1.95.0 at 1fde030d2a27cf5e7ae689708255f1da6deee177
Method: bounded static source review; no tests, probes, QA, harnesses, builds or application launches
Stand-down dimensions: none
```

## Summary

Reviewed shell-based shortcut icon selection, source-hashed helper invalidation and one-time existing-icon refresh, plus the installed-app picker's repeated-add/status/duplicate/lifetime behavior and related CSS. The previous reviewed runtime endpoint 6a0bc0a has no src delta through the chosen baseline ed52dda; intervening documentation was not a new runtime review scope.

The icon refresh rereads the live list and updates only matching ID/path/old-icon entries, preserving current names, ordering, removals and other metadata. Empty/unresolved migration icons leave existing icons intact. Picker additions retain the list, query and scroll, with synchronous backend duplicate protection and guarded late UI/focus responses.

An initial Major finding—completed Added status surviving removal and picker reopening—was corrected before the final pin: nonpending statuses clear on reopening, and confirmed additions clear after actual removal. No new open finding remains. Severity follows Team/Docs/ProcessRules.md § Severity definitions; inherited unrelated advisories remain in their original reports.

## Rubric

### 1. Security

- Status: Pass — shortcut paths remain environment arguments to fixed PowerShell snippets; literal-path lookup improves special-character handling; helper content selects its cache filename through a fixed hash; no new renderer privilege or unscoped mutation channel.

### 2. Correctness & Logic

- Status: Pass — original links are passed to the shell to preserve icon resource selection; failed extraction preserves old stored icons. Main rejects duplicate installed paths case-insensitively; picker pending/session/interaction guards prevent repeated additions and late focus changes. Initial stale Added-state finding is closed in the committed candidate.

### 3. Crash / Stability Safety

- Status: Pass — new helper calls and image decode failures return empty results; startup refresh rejection is caught; picker invocation failures become retryable row status instead of closing the picker.

### 4. Performance

- Status: Pass — refresh is revision-gated and sequential, reuses the existing bounded extraction timeouts, and adds no polling or animation. Native icon cost was not measured.

### 5. State & Data Safety

- Status: Pass — refresh performs a live conditional merge by ID/path/old-icon and changes only iconDataUrl; removed entries stay removed and concurrent icon replacements are not overwritten. IDs, paths, names, region assignment and current order remain untouched.

### 6. Input Handling

- Status: Pass — icon-location parsing preserves commas except the trailing numeric resource selector; shell extraction receives the original link. Picker identity matches the existing AppID-to-path conversion, while already-added and pending rows suppress activation.

### 7. Maintainability (no Critical findings on its own)

- Status: Pass — helper revision, extraction and migration are localized; picker state uses explicit per-region/path keys and lifecycle checks without changing unrelated region/layout behavior.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Pass — changelog accurately describes shortcut shell icons, repeated picker additions, duplicate prevention and resetting completion state. FortiClient icon rendering remains manual acceptance, not a reproduced runtime result of this review.

### 9. Build & Release Hygiene

- Status: Pass — package and lockfile agree at 1.99.1; only version metadata changes in the lock; no dependency or packaging change; final candidate is clean.

## Verdict

- Total Critical: 0 new/open in this range
- Total Major: 0 open (initial stale picker completion status corrected)
- Total Minor: 0 new

**Verdict:** RELEASE CLEAR

Range certified: `ed52ddab9728304a8934e6fb7b5a8ea5c89df28f..1fde030d2a27cf5e7ae689708255f1da6deee177`. No identified safety-floor violation. Source clearance only; no automated/runtime QA or builds were performed.

Manual checks: compare FortiClient and custom-resource shortcut icons; verify existing IDs/names/order survive the refresh; add several installed apps while keeping search/scroll, attempt an existing app, remove and re-add it, and close/reopen the picker while scanning or adding. Verify late completions do not reopen the picker or steal focus.
