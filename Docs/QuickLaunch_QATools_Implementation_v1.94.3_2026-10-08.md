# QA-tool repairs — v1.94.3 — 2026-10-08

Ender. Source HEAD at pin creation: 3e384365345cde4e6f48f0a0a8c076cb5d57f5ae on wip/regions. Scope is the two recorded Regions M4 QA-tool Majors. The delivered snapshot remains immutable; this source report corrects the dependency instructions and improves readability after handoff.

## Fallback first-paint timing

The pixel check sampled the rebuilt primary once while its first paint was incomplete. Prior QA observed one or six colours before a healthy 2,069-colour frame arrived within 130 ms. The new scripts/pixel-readiness.cjs keeps the exact existing predicate: PrintWindow must succeed, the whole height must be read, at least 16 colours must appear, and at least 10% of pixels must be lit. It waits at most 3,000 ms with 50 ms polling and a 61-attempt ceiling. Late successful reads are refused; blank frames and persistent capture errors remain failures with their last diagnostic.

scripts/regions-selftest.mjs uses the helper at three pixel call sites: the initial eight fallback windows, the rebuilt-while-hidden check, and the M4 Column/Row pair. Native input checks are unchanged. The pure test file is test/regions/pixel-readiness.test.js.

Focused tests passed 8/8 on source and immutable pin, counted by node:test. One test contains seven threshold and capture-condition rows. The known healthy delayed input fails the former one-read check, then passes after 150 ms and four attempts. Permanently blank, low-colour, low-coverage, late and persistent-error inputs still fail within the bound. Clock, capture and wait dependencies are injected, so no native host or real input is involved.

The complete fallback suite, PrintWindow/PostMessage execution and repeated native fallback acceptance were not run. They remain pending a fresh authorised away window; these mock results do not clear that branch.

## Gallery self-test Settings route

The gallery still clicked Settings and waited for an overlay after the product replaced that route with the Manager. scripts/theme-gallery/main.cjs now verifies the actual region:open-manager Settings request and renders real Manager markup/scripts in a guarded offscreen window with mock IPC. It parses the actual Manager preload allowlist and closes its own window. Older renderer snapshots retain their real overlay route. scripts/theme-gallery/mock-data.cjs supplies a complete harmless Manager state. scripts/theme-gallery/run.mjs includes manager-preload.js in snapshot extraction and names the resulting Settings state accurately.

The audited gallery self-test passed three source forms: current live renderer, HEAD renderer snapshot, and legacy e385df7 renderer snapshot. Each passed 2/2 themes, produced six PNGs, repeated all six captures deterministically, and fired all 12 detector/guard controls. All 23 stubs stayed intact. Show, focus, dialog and media counters stayed zero; no owned sockets appeared; the registry stayed unchanged. The live and HEAD runs each closed all 12 processes, and the legacy run closed all eight, with zero left after normal exit.

The deliberate login-item IPC and blocked-network counts are positive control hits only. No actual login setting or external request occurred. Blank-capture, size, viewport, duplicate-grid, in-memory registry, liveness and netstat controls fired. The known-bad original 8a648a8 gallery, copied to isolated scratch and run against the current renderer, reproduced the Settings-overlay timeout and 0/2 successful themes. Its guards remained clean and all 23 stubs intact.

All evidence is under C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-qa-tools-ender. The gallery-live, gallery-head, gallery-legacy and gallery-known-bad folders contain result.json and their logs/configs. Existing fatal exception/rejection handlers, offscreen show:false/focusable:false windows, isolated profiles, muted audio, counting stubs, request allowlist, blocked remote resolver/popups/navigation and refused permissions were audited and retained. No product main/native host, browser, real update download/install, display/taskbar/scale change or system sleep was used.

## Immutable pin and safe commands

Pin: C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-qa-tools-ender/qa-tools-pin-1. Its sibling qa-tools-pin-1-manifest.json records the actual source HEAD and SHA256 for all 177 copied files. Independent source/pin read-back compared 354 hashes with zero mismatches at creation. Subsequent production work and this report correction do not change the pin.

From the immutable pin, node --test test/regions/pixel-readiness.test.js is safe and passed 8/8.

For a pinned gallery run, make a separate QA copy, verify the manifest hashes, and create a node_modules junction in that copy to C:/Antigravity Projects/QuickLaunch-regions-spike/node_modules. The existing runner reads its Electron package version directly beneath REPO/node_modules, so NODE_PATH alone is insufficient. Document this dependency bridge; do not alter the immutable pin. Then run node scripts/theme-gallery/run.mjs --self-test --work="<fresh absolute workspace scratch folder>" --timeout=540 from the QA copy. The source-form gallery passes above ran from the real source tool directory; no pinned gallery execution is claimed by Ender.

Do not run the complete regions-selftest under current machine constraints. Existing gallery ancestry labels can refer to the containing theme checkout when run in a scratch copy; the manifest anchors actual pinned identity. That operational identity issue and the blocked entry receipt are outside this authorised repair. No hook repair or substitute receipt was added.

Separate review scopes: fallback uses scripts/regions-selftest.mjs, scripts/pixel-readiness.cjs and test/regions/pixel-readiness.test.js; gallery uses scripts/theme-gallery/main.cjs, scripts/theme-gallery/run.mjs and scripts/theme-gallery/mock-data.cjs. No production, M5, tray/options, merge, version or release work was mixed into these tool changes. Safe development evidence is ready for independent Futaba verification; native/real-input/lifecycle checks remain pending.
