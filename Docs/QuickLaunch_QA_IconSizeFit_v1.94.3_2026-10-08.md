# QuickLaunch icon-size fit QA — 2026-10-08

**Verdict:** NO-GO for formal handoff, full dogfooding or release. **Safe development acceptance: PASS** for approved Q2 icon-size refusal and Manager feedback. Automatic work-area/display-shrink policy remains unanswered and excluded.

## Exact identity

Source pin: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-icon-fit-ender/icon-fit-pin-1`; source HEAD `ee132f2c335b4a824f00d65e468fe203d6bc221f`, version 1.94.3, dirty=true, 188 manifest files. Committed UX acceptance is the approved Q2 and active-preview addendum at that HEAD.

Harness pin: sibling `icon-fit-harness-pin-1`, 127 files. Independent before/after SHA256 checks pass 315/315 files, zero mismatches; all 114 harness renderer inputs match full source. Node v26.10.0 binary, Electron 32.3.3 binary/package, package.json and lockfile identities independently match before/after (5/5). External node_modules is the recorded dependency bridge; no install occurred.

QA ran own copied fixtures under `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-icon-fit-futaba/`. Production source, immutable pins, git and version were untouched.

## Independent results

| Check | Pass / total | Method |
|---|---:|---|
| Safe Node allowlist | 186 / 186 tests | Prior explicit 20 pure/mock files plus icon-size-fit and icon-size-ipc; no native glob. |
| Focused fit file | 9 / 9 tests, included above | Contains 3,744 exact-box assertions, every 8px step/count/direction, equality and one-pixel-over edges. Test totals and assertions are distinct. |
| Actual IPC/preload contract | 3 / 3 tests, included above | Execute actual handler/sanitiser and Manager preload under mocked IPC; sender restriction and authoritative accepted/refused result forwarding. |
| Independent fit oracle | 3,447 / 3,447 checks | Execute frozen actual preflight method with synthetic displays; Ring and all Fan directions/counts/slider steps, exact limits, both stored/preview boxes and known-bad controls. |
| Offscreen Manager | 223 / 223 checks | Focused state/timer/ordering regressions plus 101 themes × two window sizes; two additional guard-identity/window-closure assertions. |
| 447×420 follow-up | 9 / 9 checks | Nondivisible legal width; attempted128→authoritative64 focused rollback, uncut footer/no overlap, coherent latest updater status restoration and guard/closure checks. |

Main/controller checks prove atomic refusal for hidden/nonprimary radial regions on their own display, including combined settings patches; data/items/order/settings and runtime bounds/anchor/preview state remain byte-for-byte unchanged. A stored n box that fits while valid n+1 preview fails is refused without cancelling it. Accepted preview cancel and commit use new-size geometry/shape; accepted nonradial/unrelated settings retain behavior. Non-monotonic Fan makes numeric-cap-only validation fail the oracle.

Manager checks measure focused and unfocused range rollback, same DOM range identity, native value/readout/name/range/step, exact footer and slider titles, one polite announcement, no focus movement, stale accepted/rejected responses and late settings reads, accepted-clear, updater coexistence and eight-second expiry. Mock download/install calls remain IPC observations only. Across 202 themed footer states, measured rectangles stay unchanged, controls do not overlap and minimum text contrast is **5.452211:1**.

## Positive controls and QA setup corrections

Detected actual preflight removal reaching forbidden mocked writes/broadcasts, cap-only validation, omitted actual IPC return, skipped focused thumb rollback, removed stale-result revision guard, 100ms refusal expiry and updater-status precedence over refusal. Four renderer mutants were reconstructed from verified renderer inputs; only manager.js differs in each. Exact substitutions and SHA256 hashes are in `mutant-manifest.json`.

The delivered frozen harness omitted its required mutants folder. First independent host logged `ERR_FILE_NOT_FOUND` at that fixture and exited2 through its early fatal handler. Failed log/closure are preserved as `missing-mutants-failed.log` and `missing-mutants-closure.json`. Own fixture reconstruction repaired QA setup only; bounded rerun passed. No product finding is inferred from that missing QA fixture.

Original expiry mock combined `channel=update-not-available` with `offer=ready`. Its `status-restored-inconsistent-fixture.png` demonstrates footer/slider restoration only and is not coherent whole-window updater evidence. The follow-up sends `offer=none` with the current-status channel, verifies refusal remains until expiry, then verifies SYSTEM IS UP TO DATE, hidden strip and restored normal slider title. Its settled capture is the final restoration evidence.

## Guards, closure and remaining gate

Audited early fatal handlers precede Electron import; isolated scratch profile, hidden offscreen unfocusable/taskbar-excluded windows, muted audio, denied remote navigation/network/permissions/windows, file requests confined to verified renderer and own mutant fixtures. All 24 forbidden show/focus/login/hotkey/dialog/shell stubs were positively exercised and retained identity. Both passing runs report zero unsafe calls/errors and all windows destroyed. PIDs6992/80644 exited0 normally and were independently absent; no forced kill was used. This does not certify product Quit or native lifecycle.

No new product Blocker/Major/Minor was found in approved scope. Pattern alert: incomplete frozen QA fixtures and contradictory mock events can invalidate otherwise convincing evidence. Disposition **fix**: reconstruct only documented controls from verified inputs, preserve failed evidence, and verify event/state consistency; applied here. Entry-receipt limitation remains **defer** to Jane/Ender.

Formal qa-handoff receipt remains unavailable: legacy P9 hook demands timeout:600000 absent from exec schema; nested snapshot ancestry also does not identify the regions source HEAD. No hook/checker bypass or fabricated receipt. Native input/multi-display/scale/taskbar, real product/region hosts, shaping/click-through, real stores/files/updates and real-use dogfooding remain unrun under current restrictions. The separate automatic work-area-shrink policy remains unresolved; Q2 user icon-size refusal is approved and passes this bounded development QA.

Evidence: `final-summary.json`, `identity.json`, `oracle-results.json`, `node.log`, `mutant-manifest.json` and `renderer-qa/{results-all.json,width-results.json}` under the absolute QA scratch above. Settled screenshots in its `renderer-qa/`: `focused-refusal.png` (attempt128→64), `manager-447-rejected.png` (attempt128→64), `manager-447-coherent-restored.png` (latest current status/hidden strip/64px). No broad unaffected M5 matrix was repeated.

Jane visually accepted the independent coherent447 restored capture:64px, current footer and hidden offer strip; the focused refusal/readout64 capture was also visually clear. This is bounded screenshot acceptance, not native input or updater clearance.
