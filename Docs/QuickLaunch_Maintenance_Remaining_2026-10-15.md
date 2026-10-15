# QuickLaunch maintenance remaining — 2026-10-15

## Current product and scope

Active checkout: `WIP/QuickLaunch-release-1.95.0`, branch `codex/axis-resize`, verified HEAD `f52f4ea2996309a63857e48a17695d0ce2395b56`, package version **1.104.0**. Planned maintenance release: **1.104.1**, dependency/security maintenance with existing behavior preserved. Package and lock dependency files remain unchanged. No new product feature is inferred.

## Completed

- Original desktop regions and all 101 themes were completed and released in **1.95.0**. The October 8 completion inventory is historical; later completion/release records supersede its pending-theme list.
- Follow-up product features and fixes through **1.104.0**, including temporary foreground/desktop hotkey behavior, are already released.
- October 10 performance assessment found no demonstrated behavior-preserving waste requiring an optimization.

Sources: [product changelog](../CHANGELOG.md), [October 9 recap](../../../Team/Docs/Session_2026-10-09_Recap.md), [October 10 recap](../../../Team/Docs/Session_2026-10-10_Recap.md), [performance report](QuickLaunch_Performance_2026-10-10.md).

## Remaining work

1. **Resolve dependency target decision.** Recorded exact targets remain Electron **42.11.12**, electron-builder **26.17.0**, electron-updater **6.8.10**. Electron 42 has recorded EOL **October 20, 2026**; support must be reassessed before dependency work/release. The interim target is not a sustainable runtime upgrade. A user decision is pending; no changed target or approval is assumed.
2. **Dependency resolution and audit.** Once permitted by existing safeguards, update the accepted declarations/lock with correct production/development classification; inspect the resolved tree and verify production/transitive security fixes. Preserve koffi declaration and existing behavior; do not use blanket forced remediation.
3. **Compatibility implementation and validation.** Compare accepted builder bytes/template and apply the minimal NSIS working-directory adaptation while preserving restore-before-removal, update skip, busy-file rollback and user-shortcut protections. Validate remembered folders, icons/bitmap alpha, native koffi packaging/loading, transparent desktop windows, display coordinates, hotkey/tray exit and updater intent/error/ready/install paths. Any additional source change requires review of the actual evidence; no redesign is authorized.
Source-only compatibility checklist: raw bitmap consumers include `src/main/icon-trim.js:12`, `src/main/ipc.js:846` and the update-badge compositor at `src/main/tray.js:26`. Dialog behavior spans the helper at `src/main/ipc.js:275` and callers at lines 649–650 and 780. Electron 43+ defaults require assessment across these sites if a later target is approved; they do not justify preemptive edits for recorded Electron 42.

4. **Isolated runtime and checks.** Installation/acquisition, lifecycle work, runtime compatibility checks and rendered checks require their existing authorization/safeguard conditions. Preserve current test controls and thresholds. Conditional harness compatibility findings do not authorize helper redesign or repairs.
5. **QA, package and release.** Obtain applicable Ender/Futaba handoff and behavioral evidence, Senua review, nonpublishing package verification and required native/installer acceptance. Sully owns version/lock bump, changelog, commits/push, named tag, canonical publication, artifact-version check and keep-last-four verification.

Detailed obligations: [compatibility preflight](../../../Team/Docs/QuickLaunch_Compatibility_Preflight_2026-10-15.md). Recorded dependency plan: `Docs/QuickLaunch_DependencyUpdate_2026-10-12.md` (existing draft preserved; not modified by this inventory).

## Current limits and safeguards

Dependency execution remains blocked: [final checkpoint](../../../Team/Docs/QuickLaunch_PostTrust_Gate07_Result_2026-10-15.md) records incomplete required enforcement proof. No dependency operation, installation, runtime acquisition, build or QA-caller probe followed. Preserve safeguards; this inventory neither clears the block nor authorizes tooling repair or replay.

Existing release records identify manual/native acceptance limits. The 1.104.0 source review does not establish Windows focus/z-order outcomes; migration will require evidence against its actual runtime/package. No fresh tests, app/helper launches or runtime QA occurred during this inventory. The inherited case-only physical Rename advisory remains parked and is not silently added to 1.104.1. See [1.104.0 review](QuickLaunch_CodeReview_v1.104.0_2026-10-10.md) and [1.101.0 review](QuickLaunch_CodeReview_v1.101.0_2026-10-09.md).

Running QuickLauncher, real profile, parked drafts, other agents' work and raw evidence remain preserved. No independent outstanding product implementation was identified beyond the gated maintenance work above.
