# QuickLaunch native QA — Stage B implementation brief

Jane · 2026-10-09. This is an EXTEND of the reviewed local QA isolation mode to make required fixture file-move acceptance possible. It is a separately scoped implementation authorization under Sergei's original feature-completion instruction, not authorization for native launch, release, version bump or global-policy changes.

Authority: safety design68b13eab4a4d6bc377cb7dfca9a7e33e504258f7; StoreSafety addendumcf55bf2191380605f9729b2f1c060afa7ba2ba8d, SHA2560b4ae6ac090970f55fcc3aebb16d528a917cb739c87ef73303ccf7cf6aca1ff9, specifically Proposed separate stage B. Commit this brief before Ender starts Stage B. Begin only after Stage A's source is pinned and its independent safety/behavior review has accepted the applicable isolation boundary. Native acceptance remains pending.

## Exact ownership

Ender owns only src/main/regions/controller.js, src/main/moves/mover.js, src/main/moves/journal.js, NEW test/regions/qa-isolation-journal.test.js, NEW test/regions/qa-isolation-mover.test.js, and bounded extensions of the already-authorized src/main/qa-isolation.js, src/main/index.js and isolation tests needed for the complete consumer handoff. Own NEW Docs/QuickLaunch_NativeQA_Journal_Implementation_2026-10-09.md. Other agents own themeCSS; preserve their edits. Sully alone commits and immediately pushes explicit file pathspecs after reviewed handoffs.

## Required behavior and evidence

Implement the committed addendum's entire Stage B contract without inventing a weaker substitute: immutable validated fresh empty journal/history snapshot; context handoff index→Controller→Mover→Journal; no QA disk reimport/quarantine or startup reconciliation writes; own durable history tracked in memory; canonical confinement and expected generations before each intent/update/finish/note write; latched guard failure prevents every native operation and rollback; async init failure makes mover unavailable; explicit refused IPC behavior. Preserve normal branches and normal recovery semantics. Prior interrupted-run recovery is outside this fresh-session acceptance scope and must not be claimed tested.

Use actual modules with recording filesystem/native fakes. Include the exact positive/negative controls in the committed Stage B design: replaced/corrupt journal after validation, malformed/link/external/pending/history inputs, empty startup zero writes, confined add/back/adopt/orphan records, failed append/init, and direct callbacks/rollback after fault zero native calls. Normal journal recovery regression remains required. Report every isolation-context consumer and literal receipt consumer.

Do not claim pathname checks provide atomic or OS-enforced protection against concurrent root replacement. State the reviewed limitation and STOP on drift or inability to establish quiescent owned fixtures. No real filesystem move or application launch is authorized by this implementation brief.

## Exclusions, failure behavior, delivery

No native binding or move-algorithm rewrite, schema/format change, generic Store/mover rewrite, renderer/Manager/CSS changes, dependencies/install/build, release/version/tag/git actions, hooks/compatibility/permissions, real user stores/startup/registry/browser, native input/display/taskbar/scale/sleep. No current away window.

STOP and report any required additional file, unresolved proof gap, guard rejection, test failure or unsupported ownership evidence. Never bypass guards, run a duplicate long command or turn failed setup into PASS. Preserve failed evidence. Tests use an owned supported-schema wrapper with enforced600000ms deadline; Node syntax-check generated entry files before any permitted harness run. Do not run suites containing actual native/sleeper behavior blindly.

Deliver a frozen source/harness/runtime manifest, focused actual-module test results with counting method, normal-mode regression, deviations and pending native evidence. Senua reviews exact candidate safety; Futaba independently verifies exact pin and behavior; Sully publishes source and reports separately. Use inherited Codex model tier (legacy opus unavailable). Scratch: C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch-integration/scratch/2026-10-09-native-journal-ender.
