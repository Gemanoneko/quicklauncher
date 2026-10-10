# Code Review — QuickLaunch v1.103.1

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-10
Tool: QuickLaunch (Electron / Windows)
Release: v1.103.1
Commit range: 4711a00f10949468d995744f2149fa2034bf553d..5b5e22c2ed5bd1a367884dc5edb6240f4cf39042
Files changed: 5 files, +100 / -14
Stand-down dimensions: None; all nine dimensions reviewed within this release delta.
```

## Summary

Bounded source review of selected shell-command resource lifetime, optional Windows popup theme compatibility, and transparency reapplication once region classes exist. The committed two runtime paths match the reviewed source, including the final reference-before-resource-release correction and explicit rejection of non-S_OK invocation results. No menu/helper/app execution was performed, and no reproduced runtime fix is claimed.

## Rubric

### 1. Security

- Status: Pass — optional theme exports are resolved from absolute System32 uxtheme on an explicit OS-build allowlist, all required addresses checked before mutation, high contrast bypassed, and legacy boolean versus modern enum ABI separated. Effects remain within the one-shot helper; stored-path authority and final identity checks are retained.

### 2. Correctness & Logic

- Status: Pass — selected commands retain context/folder/PIDL during startup grace, visible or pending dialogs, and outstanding thread references; quiet drain follows release. Native invocation layout/numeric verbs agree with documented CMINVOKECOMMANDINFOEX, and only S_OK reports success. Region-class readiness reapplies existing saved transparency through unchanged actual-sheet guards.

### 3. Crash / Stability Safety

- Status: Pass — final reference check precedes COM/PIDL release; timer/Idle cleanup and owner cancellation remain intact. Retained live counter memory is not freed while referenced. Unknown builds or absent optional exports preserve classic popup behavior.

### 4. Performance

- Status: Pass — existing command-scoped 200ms timer is reused; no renderer polling added. Cancel and inline Rename still avoid selected-command grace; a noninteractive stuck reference remains bounded by the existing helper deadline.

### 5. State & Data Safety

- Status: Pass — transparency percentages are not rewritten; recovery reconciliation still waits for actual child close, and interruption retains recovery metadata.

### 6. Input Handling

- Status: Pass — visible native dialogs retain interactive phase; hidden dialog classification uses same-process #32770 windows. Region initializer can call the earlier app.js function before settings resolve, with later settings/theme paths reapplying them; zero-percent disables companion rules and radial/foreground exclusions remain unchanged.

### 7. Maintainability

- Status: Pass — command resources have explicit retained ownership/release and isolated theme compatibility delegates; no unrelated native rewrite.

### 8. Doc/Code Drift

- Status: Pass — changelog records native lifetime and region readiness changes while describing popup theme matching as best effort with classic fallback.

### 9. Build & Release Hygiene

- Status: Pass — pinned checkout was clean; package and both lockfile version fields agree at 1.103.1 without dependency changes. Sully reported latest compiler exit 0, an 18,432-byte temporary executable removed without execution, and inherited CS0108/CS0649 warnings; this reviewer did not compile it.

## Review Limits

Source inspection only: no QA, tests, probes, harnesses, builds or app/helper launches by this reviewer. Actual Properties/other selected verbs, repeated menu use, third-party extension startup, light/dark/high-contrast appearance and retained transparency after updates remain Sergei's manual checks. An extension that holds a reference indefinitely can reach the existing noninteractive deadline; private popup exports and finite startup grace cannot guarantee compatibility with every extension or future Windows revision.

The earlier actionable release-before-reference-check concern was resolved in the final candidate. Microsoft documents NOASYNC as advisory in [CMINVOKECOMMANDINFOEX](https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/ns-shobjidl_core-cminvokecommandinfoex); modern popup ordinal mappings/signatures were compared with [Microsoft PowerToys ZoomIt source](https://github.com/microsoft/PowerToys/blob/main/src/modules/ZoomIt/ZoomIt/Utility.cpp). These checks establish source consistency, not runtime behavior.

## Verdict

- Total Critical: 0
- Total Major: 0
- Total Minor: 0

**Verdict:** RELEASE CLEAR
