# QuickLaunch Theme Fidelity Batch07 — independent QA

Futaba · 2026-10-08 · version **1.94.3** · inherited Codex model tier. Recovery of the existing independent pass; no model switch. Authority: committed Batch07 UX spec `0bd3631`, HeaderSafety addendum `848426e`, Manager footer target-floor addendum `7aab880`.

**Verdict:** GO

This is a **scoped safe-development GO** for the frozen Batch07 implementation and its bounded footer correction. Formal entry receipts, native/real-input acceptance, actual product Quit and packaged/release clearance remain **NO-GO / pending**. No version bump, tag or release is authorized by this report. No claim is made that all unmodified pixels are identical.

## Candidate and evidence identity

Final candidate: `scratch/2026-10-08-theme07-ender/source-pin3`, HEAD `7aab880da17751f595f8ed8a0678c8272231e411`, version1.94.3, **324 manifest files**. Source manifest SHA256 `469879d2df03cda42f970d3121256f1c00b62a4bb518aa800235bfafd1d3c65b`. QA verified every listed file plus4 declared runtime files and77 expanded runtime/package identities before/after; final checks are `footer-pin-before.json`, `footer-pin-after.json`, `footer-pin-final-after.json`. Counts enumerate manifest entries, not Git files or tests.

Pin2 manifest `78ccc60d2d250e4ae903690cfc26eb0762c67b242c0596ebecaf7e032220f463` remains intact. Pin2→pin3 has exactly one product delta: `src/renderer/styles/manager.css`, SHA256 `44be8aa2952820ae4d6772cb12c0000c2b704922e929b5e776a1db59313f5ded`; remaining differences are footer authority/implementation documents. The seven themes, helper, index, region CSS, tests and check scripts are byte-identical. Earlier checks carry only through this verified unchanged-file/selector association. Final Options footer/body dimensions are intentionally different and do not carry a pixel-identity claim.

Own final footer harness: `scratch/2026-10-08-theme07-futaba/footer-final`, manifest `footer-harness-manifest.json`, SHA256 `3c8d8cd36300c6578df84c9a34e47287b96149f024b54ab97d8540082d4ae2d3`, **332 files**:164 final source files,164 prior source files,4 audit/entry files. Every entry was verified after recovery; the164 before files were additionally matched to source-pin2. Final footer results SHA256 `53f9468eebfb28800ab20c2c38ead1b12fbfc8fb267ef2e3eb394cfc9b70a20e`. The prior source-pin2 and sender renderer-run7 manifest `c0de8e9b3a3aadb179733583e537360d7610e8b13c641dd15cebb46c92268ede` were independently reverified, including143 renderer/harness members and74 original runtime members. All39 sender evidence members and77 expanded runtime members were rechecked. Recovery audit with individual result hashes: `recovery-audit.json`; prior association proof: `recovery-prior-identity.json`.

Committed baseline `bb651d1e688e1036826bfe8c522dec4bcd2595cc`:320 exact Git blobs,74 runtime files,56 actual captures (7×8). Baseline source/harness before-after verification is retained in `baseline-findings.md` and manifests. Text comparisons explicitly normalize Git LF/CRLF where appropriate; raw bytes are not falsely declared equal.

Live integration at recovery had the12 intended source/test paths dirty plus the implementation report untracked. QA executed immutable copies, never that shared tree. No source/global hook/guard/baseline/permission edits were made by QA. Runtime: Node SHA256 `cea6ac365f9bb9586dafd2084d996e092e7d3e7d07ab52d1f76bf53d1fca9bc4`, Electron32.3.3 executable SHA256 `217c7abc77aaa868b9423ff3e6e8f40f62633ccc4121786fac64e481aef3429d`.

## Actual checks and results

Results below are separate runs; they are not one fabricated aggregate final run. Paths without another prefix are under `scratch/2026-10-08-theme07-futaba/`.

| Run | Method and actual result |
|---|---|
| Pure | Final pin3 rerun of header-art-safety, controller-display-shrink and banner-layers suites: **21/21**, final-pure.log. |
| Static contrast | Final pin3 catalogue check: **101 themes,0 errors,26 legacy warnings**, final-contrast.log. These warnings are existing catalogue debt, not newly passing contrast. |
| Strict hover/pressed | Exact324-file final-gallery-verified scratch copy, explicit unchanged installed-dependency junction. **266 readings =7×38;0 errors;0 grandfathered;PASS**. All PC1–4 negative controls fail as intended. Final-hover4-out/hover-readings.json; final-hover4.log; recovery-hover4-result.json. |
| Header/helper | Prior unchanged-source theme-results.json: **87/87**. Deep-results.json: **452/452**,63 records. Focus-results.json: **88/88**. Zero errors/unsafe calls. Real renderer pages, actual rectangles/pseudos and settled refreshes; dynamic suppression, restore, layouts, controls and focus covered. |
| Typography and banner | Type-results.json:242 valid checks and7 retained invalid primary-title checks;231 label probes (7×3 simulated device scales×11 standard/Cyrillic-tail strings). Corrected primary title is measured separately in title-measurements.json: all7 actual QUICK.LAUNCH widths≤144px under Judy's ruling. First three actual bounds x44/right171.953125 are accepted by width, not an invented legacy right156 bound. Banner rotation/measured labels, unfiltered/uncut icon checks and hidden-tile texture near zero (existing sigma ceiling3.72) are retained in the unchanged-source deep/type records. CDP platform-font checks identify IM Fell English Roman400, Lovecraft roman12px banner, Event Cinzel600 and specified stock label families. |
| Expanded state matrix | States-results.json:203 scenes,655 checks,606 pass and49 real footer-height failures on pin2; other recorded colour, size, empty/radial direction, glyph and hit checks pass. The49 are7 themes×7 Options states, each checking both controls; they are not49 distinct buttons. All49 rechecked and pass on pin3. |
| Final actual footer | Footer-final/footer-final-results.json: **1574/1574 checks,352 records** =303 catalogue-theme/geometry scenes (101×440×420,520×760,800×900) +49 state scenes. Actual buttons≥24×24, full target/label/footer containment, no body/control overlap, centre/four1px-inset edge-midpoint hits, both focus paints within viewport/no neighbour overlap, last body row reachable. Natural widths/copy/tooltips/fonts/colours/borders retained and heights become max(24,prior natural height). |
| Footer negative controls | Removed actual minimum, wrapper-only minimum and wrong selector fail; restored minimum passes;999px clipped focus mutant fails. Five recorded control/restoration assertions remain in final results. No rounded-corner geometry change or target-floor waiver. |

## All101 opt-out qualification

397 actual geometry/control scenes were compared;376 unmodified scenes retain DOM/computed styles/control geometry. After settled replay, **369/376 raw pixel pairs are exact**. Seven small Manager pairs differ by4–6 pixels, maximum channel delta4–8: blade-runner, deus-ex, dragon-age, evangelion, firefly, indiana-jones, resident-evil. `all101-pixel-diagnostics.json`, original all101-results.json and all101-reprobe-results.json preserve the initial33 differences and their narrowed result. Do not replace those files or report the original run as all passing.

Baseline→baseline controls reproduce variance for3 of7;4 remain unexplained raster differences. The additional four-theme matched/reversed creation controls retain8 matching metadata/font cases and2 raster mismatches. No new helper/index/region CSS path is loaded by Manager; Manager/unmodified94 themes match after explicit newline normalization. Judy's15 candidate visual captures and14 paired Manager frames report no UX finding. This supports the scoped result with an explicit qualification, **not** proof of universal pixel identity, a new tolerance or waived floor. The approved footer correction is separate and intentionally changes Options height/scroll layout.

## Safety, closure and retained failures

No duplicate footer launch occurred during recovery. Existing complete output was inspected first. Final footer records zero renderer errors/safety calls, intact guard identities and zero windows remaining. The fixture exercises its25 counting denial stubs before resetting counters. Original footer supervisor stdout/exit code was unavailable to the recovery agent and is **not inferred** from results; recovery's exact-scratch Node/Electron CIM query finds zero owned processes. This confirms completed measurements and current owned closure without inventing a historical parent exit.

Final hover supervisor is established before children, uses pinned Node, windowsHide and600000ms child deadline. Tool session78100 finished exit0; hover report records30 owned process observations, exit0, no timeout and zero left. Final scoped CIM also finds zero QA-owned processes. Isolation counters are allzero, registry unchanged, unexpected IPC0. Before/after source-copy/runtime identities match. Closure record: recovery-final-closure.json. No global/user process was killed.

All harnesses use hidden offscreen unfocusable/taskbar-excluded windows, isolated scratch profiles, muted audio, denied external network/permissions/navigation and mocks. Product main, single-instance launcher, real updater, signed browser and user data are never loaded. No real mouse/keyboard/drop, visible UI, display/scale/taskbar setting, sleep or product Quit was tested.

Historical fixture failures remain evidence: deep initial failure, initial focus char-count assumption and type primary-title assumptions are preserved; subsequent corrected oracle records are distinguished. Original type7 flags measured Games instead of QUICK.LAUNCH and used a superseded bound; actual primary-title evidence resolves them. Ender's quote-syntax startup and rounded-corner probes remain sender setup history, not accepted passes. Pin2's49 footer failures are resolved by the measured exact two-button correction, with no QA product edit.

Recovery hover setup attempts stopped before Electron launch: missing electron resolution; NODE_PATH resolution followed by missing repo-local electron package path; sandbox EPERM creating the scratch dependency junction, then another pre-child missing-module result. Logs final-hover.log/final-hover2.log/final-hover3.log are retained. Scoped junction creation succeeded after324 copied file identities were checked; syntax checks preceded the successful main/hover entry launch. A recovery evidence-assembly relative-path error was corrected by joining entries to the recorded evidence root; no test outcome changed.

Legacy qa-handoff remains blocked by global P9 schema/provenance mismatch. No retry, fabricated receipt, hook toggle, compatibility activation or global diagnosis was performed. Native/formal/release NO-GO remains separately tracked.

## Findings and pattern dispositions

- **Major — resolved:** two real Manager footer targets below existing24px floor. Original baseline six themes20px/Event23px; pin2 allseven23px. Fix snapshot HEAD7aab880/pin3 raises only the two actual target minimums;1574-check final regression passes, including all49 formerly failing states.
- **Minor qualification — defer:** seven tiny Manager raster differences above; preserve exact evidence and avoid all-pixel identity claims. No UX defect observed; no speculative product fix or relaxed oracle.
- **Pattern alert — defer:** inherited catalogue contrast warnings remain separate from Batch07;26 static legacy warnings are retained, while these seven themes' final strict hover readings pass with0 grandfathered pairs. Route catalogue work through its existing batch plan.
- **Pattern alert — defer:** formal/native evidence gaps await their original authorized route/fresh away window. This report does not reopen the closed hook detour or clear a release.

No other new Blocker/Major/Minor product finding. Pattern dispositions are explicit; QA changed only owned scratch and this report.
