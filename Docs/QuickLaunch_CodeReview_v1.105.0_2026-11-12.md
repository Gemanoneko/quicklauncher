# Code Review — QuickLaunch v1.105.0

Construction clearance for the committed source range below. Futaba owns behavior and visual acceptance; this report does not authorize publishing or live installation.

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-11-12
Tool: QuickLaunch (Electron / Windows, NSIS installer)
Release: v1.105.0
Commit range: ab115eab0088cb7def95189dcd021122a11d70d5..6551bd05f7ac635d82514cc62732e68016cc70d4
Files changed: 15 files, +859 / -5
Stand-down dimensions: None
```

The baseline is the published 1.104.3 source and post-release documentation, whose prior review certifies the pinned product delta and release-hygiene addendum. Counts are from `git diff --numstat` over the exact range, summed across its 15 entries; `git status --short` was empty at review. Intermediate candidate `6184dfa16656e3f868214340824881c0142a2759` is not cleared: E8 below required the final compatibility fix.

## Summary

Reviewed every changed/new production file, tests, package/lockfile, changelog, Brief additions and UX specification. The feature uses a bounded JSON backup containing managed shortcut bytes and configuration, exact-content reconciliation within known shortcut folders, no-replace native moves, durable intent/commit markers, startup recovery before live controllers, and a confirmed controlled restart. No open Critical or Major construction issue remains in the final range. One Minor copy/spec mismatch is recorded below.

## Rubric

### 1. Security

- Status: Pass — backup files are size/depth/schema bounded; managed payloads are restricted to safe .lnk/.url basenames; unsafe object keys, traversal names and duplicate managed payloads refuse. Renderer IPC supplies no destination paths; Manager sender checks and preload allowlists remain in place. No new command execution, remote content or credential flow.

### 2. Correctness & Logic

- Status: Pass — exact-byte desktop/store matching reclaims or reuses one file; repeated import preserves IDs/order and does not append copies. Ambiguity/changed names refuse; existing cross-region references and fractional Fan anchors survive.

### 3. Crash / Stability Safety

- Status: Pass — recovery precedes migration/windows/mover; incomplete recovery exits before normal interaction. A committed generation still requests restart after cleanup failure; the import quit path skips old pending bounds. The journal distinguishes committed completion from rollback.

### 4. Performance

- Status: Pass — limits cover archive bytes, individual payload size, item count, nesting, directory entry count and total scanned shortcut bytes; bounded reads detect changes. File mutation is synchronous inside the existing mover queue, preventing event-loop edits during its commit interval. No large-library performance benchmark was performed.

### 5. State & Data Safety

- Status: Pass — file moves never replace existing destinations; hashes and native identities guard reads/moves/recovery; external programs/documents remain references. Staging intent precedes staged writes, store replacement uses existing durable persistence, and unverified recovery retains files and prevents continued mutable operation.

NTFS filename tunnelling is narrowly accounted for only at an operation's exact destination: equal bytes plus unchanged volume/file ID allow creation-time changes during rename, while the resulting tile captures the complete actual identity. The full identity remains required at ordinary sources. This does not weaken matching to a path/name alone.

### 6. Input Handling

- Status: Pass — recognized settings and native rectangle fields have type/range validation, Fan anchors accept bounded finite fractions, payload hashes/base64/filenames and region references/caps are validated before mutation. Unsupported/invalid archives fail before confirmation/restore.

### 7. Maintainability

- Status: Pass — backup transaction logic is isolated in one module with explicit export/read/preview/import/recovery boundaries; the existing mover owns serialization and native no-replace operations. Tests exercise real isolated Windows files without launching QuickLauncher.

### 8. Doc/Code Drift

- Status: Concerns.
- M1 [Minor], `src/main/backup.js:54`, `src/main/ipc.js:343`: newer-format backups use the same generic supported-backup error as invalid files; conflicts are returned as inline errors rather than the spec's dedicated native detail. The committed UX spec asks for distinct newer-version update guidance and native conflict detail. The refusal is safe and actionable enough to preserve files; align the error presentation/copy in a subsequent UX pass.

### 9. Build & Release Hygiene

- Status: Pass — package and lockfile agree at 1.105.0, dependency versions are unchanged, changelog/Brief record the feature, and production packaging includes the new module through the existing source glob. Canonical final entry, nonpublishing package and native/visual acceptance were still pending when this source review was completed; this report does not claim those passed.

## Review findings resolved before clearance

| ID | Failure observed during development | Verified final disposition |
|---|---|---|
| E1 | Cleanup failure after durable import could throw ordinary failure and leave old controllers alive against the new store. | `backup.js:340` returns committed restart/recovery-pending state; Manager IPC restarts. Focused test injects cleanup denial and then completes committed recovery. |
| E2 | Arbitrary imported settings/bounds could reach native window construction or string methods. | `backup.js:59` onward validates recognized types/ranges/bounds; hostile-settings tests include non-string hotkey and extreme Manager bounds. |
| E3 | An unrelated zero-byte/unreadable shortcut could block scanning. | `_scan()` skips unusable unrelated candidates while same-name conflicts still refuse. Focused test preserves an unrelated zero-byte file. |
| E4 | Old pending region bounds could overwrite imported layout on quit. | IPC flushes before preview/after confirmation; preview token detects changed state; `index.js:104` skips old runtime bounds on import quit and release clears timers. Confirmed by source review; full real restart proof remains QA's scope. |
| E5 | Stage creation before intent could leave untracked staged output after failure. | Intent is durable before payload writes; null create identities are validated/recovered from expected bytes. Incomplete/changed staging is retained with a recovery-required exit rather than deleted blindly. |
| E6 | Global path uniqueness rejected valid cross-region reference tiles. | Validation/duplicate tile checks are region scoped; focused test exports/imports cross-region references twice without copying a file. |
| E7 | Unresolved in-process rollback returned to mutable old UI beside a pending transaction. | Recovery-required error closes/releases old region hosts, shows retained recovery location and exits; startup retries before normal interaction. Confirmed by source review; no live failure was induced. |
| E8 | Initial candidate rejected real Fan half-pixel anchors. | Pure geometry probe demonstrated `geometry('fan',2,64).pivot.x === 98.5`; final commit accepts bounded finite anchor coordinates and adds a real-geometry exact round-trip regression. |

No resolved observation is being presented as an open final-candidate finding. Severity definitions and the safety floor remain canonical in Team/Docs/ProcessRules.md.

## Evidence and limits

Ender reported 16/16 focused tests passing, zero failures/skips, for the final candidate. Reviewed all 16 test definitions: actual native Windows no-replace moves/identities, actual Mover.restoreAll followed by fresh setup/import twice, renamed matching desktop file, recreated payload, duplicate/changed-name refusal, unrelated bad file, displaced current shortcut, preview drift, invalid/tampered/newer/traversal/settings input, incomplete export preservation, failed commit rollback, interruption at moved/committed boundaries, post-commit cleanup, cross-region refs, fractional Fan geometry and recreated-file rollback. The test Store is a filesystem-backed stand-in; its crash hooks throw at transaction boundaries, not actual OS process termination. The existing real Store durable write path was inspected separately. This reviewer did not rerun the suite.

Reviewer execution was limited to read-only source/Git inspection and a pure geometry probe. No live app, user desktop/profile, startup entry, shortcut target, shell menu or external service was opened or changed. Actual renderer visuals, native picker delivery, true app restart/hotkey/startup application, packaged close/quit behavior, install/uninstall and crash/power-loss behavior are not certified by this construction review.

## Verification support route

Reviewed the task-local context assembler and initial context SHA-256 `eca247a7fb381e58f3bd3b1843d6cdb94b92e70ae41acd39d7af0ee40cf2b2cc`: complete source snapshot, harness and installed Node/dependencies/Git manifests; explicit installed Node/npm/CMD/Git identities, five core checker hashes and the two existing package check routes (`check-theme-contrast.js`, pure Node; `theme-gallery/run.mjs --hover-check`, offscreen renderer). No shared checker changes were requested or made by this review. Actual context/runtime verification, process ownership and check execution remain the canonical checker's responsibility.

The first invocation was refused before checks because its run parent was inside the immutable source repository. Jane subsequently reported a second setup-only refusal caused by ancestor npm configuration at the chosen execution location. Neither attempt produced a passing receipt, and neither is a product test failure. Ender is correcting the owned execution location/context without changing user npm configuration or checker guards. The existing hover route measures legacy controls; it does not establish visual acceptance for the new Manager controls. This source review must not be cited as a final entry receipt. No packaged native proof or executed real-Store durability gate is claimed here; real-Store construction was inspected, while the focused test Store is a stand-in.

## Verdict

- Total Critical: 0
- Total Major: 0
- Total Minor: 1

**Verdict:** RELEASE CLEAR

Construction clearance covers only the exact committed range above. Futaba's independent verdict and remaining build/release checks retain their own requirements.
