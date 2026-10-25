# Code Review — QuickLaunch v1.104.3

Construction clearance for the exact pinned candidate below. Futaba owns the independent behavior verdict; her report is currently NO-GO pending native desktop checks.

## Header

```
Reviewer: Senua (Code Reviewer)
Date: 2026-10-25
Tool: QuickLaunch (Electron / Windows, NSIS installer)
Release: v1.104.3
Previous reviewed end: a7d1cece2e66dd27a6d05ada73ccfee51037d6dd
Reviewed committed bridge: a7d1cece2e66dd27a6d05ada73ccfee51037d6dd..8c4783ab5f28e3cc24fb398103e61755d86ce2f5 (documentation only)
Commit range: a7d1cece2e66dd27a6d05ada73ccfee51037d6dd..8c4783ab5f28e3cc24fb398103e61755d86ce2f5, plus the exact pinned working-tree delta against 8c4783ab below
Candidate source digest: f69136bc2775983afdf71317417427b9fe571e97bc5cdec84b3cbf20c400f6ae
Source manifest SHA-256: bde35bc1fbf9cfcbafcf9762c2f5638cd183f94338019ad68ffe227639ff93e7
Candidate files changed: 15 original files, +385 / -18, plus the two release-hygiene files in the addendum (before review/QA report files)
Stand-down dimensions: None.
```

The file count combines `git diff --numstat 8c4783ab` for eight tracked files (+97/-18) with line counts of the seven new files (+288). The earlier committed bridge is five documentation files (+323/-3). The source manifest pins 396 files. Reports added after the checks do not alter the reviewed executable source.

## Summary

Reviewed all changed/new production code and tests, plus the existing launch, store, renderer, region-host and native-shell callers. The candidate preserves a working hotkey until its replacement registers, retries the configured binding, clears interactions belonging to invalidated documents, removes the invalid native AppsFolder rewrite, and repairs only a missing versioned Blender ID with one unambiguous current family member. Recovery changes only the current stored item's path. A concurrent-repair race found during review was fixed before the final source pin and has a regression test. No open new construction finding or safety-floor violation was found in the product delta. The actual trigger of Sergei's intermittent hotkey incident remains unconfirmed.

## Evidence

- Focused candidate suite: 22/22 pass, zero skips, including the native parse-only test with explicit current `blender.5.2`, Unicode filesystem shortcut, AppsFolder root and missing-ID controls. Pure tests cover failed rebind preservation, configured-key recovery, stale-page reset, protection of live work, exact/unique/ambiguous/missing identities, metadata preservation, concurrent repair and the native-plus-Chromium foreground-return call sequence.
- Old-code controls: the named hotkey/page/launch assertions fail against the baseline; the old native rewrite fails specifically at the installed-ID assertion. These are observed assertion failures, not inferred from a nonzero exit alone.
- Full original baseline: 336 tests, 283 pass, 53 fail. Full candidate: 351 tests, 298 pass, the same 53 fail. All failing names match; 51 diagnostic signatures match byte for byte. I independently inspected the other two: one is the same existing item-order assertion (`ref1` versus a generated item ID), with different private paths/timestamps/PIDs/UUIDs; the other is the same unchanged `applySettings` mutation assertion with LF versus CRLF in its quoted source. No new failure is demonstrated. The full suite is not green.
- The strict regression wrapper exited with a comparator failure on those two incidental differences. It is not relabeled an automated pass. A separate post-run audit passed for the exact tested copies, baseline/source/harness/runtime/helper inputs, excluding only `node_modules` and `scratch` in the tested copies. Both complete native job samples were zero: baseline 72 retained processes, candidate 82, all signaled; no forced termination, timeout or output overflow.
- Nonpublishing package build passed in 36.6 seconds; 22 owned processes closed. Installer: 114,277,097 bytes, SHA-256 `427026f8a070f5092a6299cf7f766ceaa62de2c052ed99528ec64554dc7c7936`. Unpacked EXE: SHA-256 `38c2f2a743112abfdb344ae7cd11b31d823aed97328ddb2253ede9975f397c5d`. `app.asar`: SHA-256 `053eaa535abf5d032ab3c3a8e9529aec8ea651f9d3eec70646d01388716d1bbc`. Source/runtime after-audit passed. No installer or QuickLauncher process was launched by this build.
- Canonical v4 sender and independently repeated receiver both passed with byte-identical protocol-2 receipts. Contrast: 101 themes, zero errors. Hover: 3,838 pairs, zero errors, all four positive controls fired, 92/92 stubs intact, show/focus/hotkey/login-item/dialog counters zero, sockets zero and registry unchanged. Each check tree closed: 204 retained native processes, zero assigned/unsignaled; the hover harness reports 137 started, zero left. See QuickLaunch_QAReport_v1.104.3_2026-10-25.md for the actual receiver receipt. The sender raw log is in the session verification/sender-entry-v4.log. Actual earlier refused/failed attempts remain failures.

## Rubric

### 1. Security

- Status: Pass — the catalog command is fixed text with argv and hidden execution; identifiers never become shell text, recovery is limited to the Blender family, and no Electron/preload privilege boundary changes.

### 2. Correctness & Logic

- Status: Pass — exact identities win; missing/ambiguous/unreadable targets do not reach Explorer; the current ID/region/path is rechecked after async lookup, including identical concurrent repair.

### 3. Crash / Stability Safety

- Status: Pass — catalog errors resolve to existing failure feedback; page reset uses guarded host/window operations and preserves outstanding shell work.

### 4. Performance

- Status: Pass — the asynchronous catalog read coalesces concurrent requests, has an 8-second/4-MiB limit, and the retry timer checks only the configured hotkey every five seconds.

### 5. State & Data Safety

- Status: Pass — repair spreads the latest stored object and changes only path; custom name/icon/arguments, identity, region/order and unrelated concurrent edits survive; deleted/moved/retargeted items cannot be revived. No filesystem move/delete policy changed.

### 6. Input Handling

- Status: Pass — Blender matching is anchored and numeric-version-only; arbitrary vendors/display labels are never guessed, and whitespace/Unicode filesystem paths retain their existing route.

### 7. Maintainability (no Critical findings on its own)

- Status: Concerns — the focused regressions are useful and the review-found race is covered, but 53 inherited full-suite failures remain regression debt outside this change.

### 8. Doc/Code Drift (no Critical findings on its own)

- Status: Pass — diagnosis distinguishes proven mechanisms from the unconfirmed original hotkey trigger and does not claim real desktop coverage from mocks/parser probes.

### 9. Build & Release Hygiene

- Status: Concerns — package and lockfile agree at 1.104.3; the nonpublishing build and matching canonical sender/receiver checks passed. Earlier v1.104.2 release-script M1/M2 findings remain outside this product delta and are not cleared. Packaged desktop smoke/install/update/uninstall remain unperformed.

## Limits

The native test parses paths; it does not show or invoke the Windows menu. The RegionHost regression records native/Chromium calls; it does not prove compositor output. Real Windows hotkey delivery, repeated foreground reparenting, actual popup interaction, install/update/uninstall and the original intermittent trigger are not certified here. Packaged launch on a separate profile still shares the app-name startup registry entry, so any live QA route needs its separately reviewed, explicitly authorized preservation/restore transaction and away window. No such mutation is authorized by this construction review.

## Verdict

- Total Critical: 0
- Total Major: 0
- Total Minor: 0

**Verdict:** RELEASE CLEAR

New open findings: Critical 0 / Major 0 / Minor 0. Previous release findings remain in their original report; this review does not silently clear unrelated debt.

## Canonical identity and release correspondence

```text
Entry-check receipt v2: quicklauncher v1.104.3 @ 8c4783ab5f28e3cc24fb398103e61755d86ce2f5 (dirty: Y) [source:f69136bc2775983afdf71317417427b9fe571e97bc5cdec84b3cbf20c400f6ae; harness:8cc631ded1bf5d1adc4417f35568af70e91a262df4ea571cc3fdda14613b74aa; runtime:22059398ab8a76914b8409d6697be29635628633ebb76ac9390c43fd582f4f46; checker:a448c08c150e63019cfd6e49ceed5ec5b8652a97078abde197e7a50882b759cf] — pre-qa n/a, post-build n/a, check-electron n/a, check pass, test:smoke n/a
```

The release candidate is uncommitted at review time. This report certifies its recorded source snapshot and the stated committed bridge; it does not certify arbitrary future HEAD. Sully must map the release commit to the same reviewed product/test/package bytes. This review and the QA report were added only after both canonical checks finished and therefore are intentionally outside the 396-file input snapshot. No runtime code changed when these reports were written.

Related project-local verification support was reviewed separately in `Team/Docs/QuickLaunch_QAHandoff_GitRuntime_Review_2026-10-25.md`. It adds optional byte-pinned Git for the existing gallery check while preserving process ownership and fail-closed behavior. No global hooks, user npm configuration or product source workaround was used.

## Release-hygiene addendum — 2026-10-25

Sergei explicitly requested: "Release and give me list of the checks - I'll do them after the release." Native behavior checks are deferred by that request. Futaba's recorded NO-GO remains unchanged; Sully must log `--skip-qa` and the exact user waiver. This addendum clears construction changes only and does not claim that any deferred check passed.

Two additional files were reviewed against the previously reviewed candidate:

| File | Reviewed SHA-256 |
|---|---|
| `scripts/release.mjs` | `1d23f7cf37b5cec343cb0f128582b7b3d825d5cb696ace05515c6b69fa2f1037` |
| `test/release/windows-hide.test.mjs` | `1579d6e669ed2f0b30250823f6a771e3d4328c6e5df5f0893ae20cb0ec11f9dc` |

The production diff adds `windowsHide: true` to exactly three script-owned `spawnSync` routes: token lookup, the GitHub CLI helper and the npm build child. Commands, argv, token flow, publishing and cleanup logic are unchanged. Every call remains bounded by the separately reviewed owned release wrapper when Sully runs it. The token is read only inside the canonical release script, is passed to the build environment, and is not logged or placed in argv.

The new tests execute the actual release control flow with inert filesystem/process boundaries. Fresh draft, reused draft, auth failure and a removed-protection positive control verify the hidden-child options and token privacy. Observed result: 3 tests passed, 0 failed/skipped; all 5 owned processes closed at complete native zero, with no timeout, forced termination or output overflow. No real GitHub call, build or application launch occurred in these tests. The assertions cover direct script-owned child options; vendor build machinery is unchanged. The app.asar hash before/after remained `053eaa535abf5d032ab3c3a8e9529aec8ea651f9d3eec70646d01388716d1bbc`.

No new Critical/Major/Minor finding was opened. The existing RELEASE CLEAR verdict includes these exact two file versions. The original canonical receipt above remains evidence for its original pinned inputs; it is not relabeled as a later run. Sully's post-commit release context must separately pin this addendum's reviewed bytes and preserve the waived QA result truthfully.
