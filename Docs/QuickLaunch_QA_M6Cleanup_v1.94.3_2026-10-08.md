# QuickLaunch M6 code-cleanup QA — 2026-10-08

**Verdict:** NO-GO

**Bounded safe code-cleanup acceptance: PASS.** Obsolete region overlays, shared theme catalog and new panel contrast check are independently verified. This does not complete M6's native/performance/packaged/release work or repair the formal entry receipt. Version remains1.94.3.

## Exact frozen identity

Final source: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-m6-ender/m6-source-pin2`,303 files, HEAD `98dd1049bd6361472f6a10b80446464473183969`, branch `codex/regions-themes-integration`, pending cleanup edits. Manifest SHA256 `c42c1c714d5b040811c1bd48fe1c9168a32ee5c11b227a2c0d0c646ee2296a87`. No whole-file deletion; overlay removals are hunks. Future fallback prerequisite doc is retained but its policy/implementation is outside this QA.

Initial sourcepin1 manifest `85a961b9b4388f407c1e5236e4540978af944ca1f86525821050cbb53e2dd967` also matches303/303. Independent exact pin1→pin2 delta is only `src/main/ipc.js` and `test/integration/m6-cleanup.test.js`: final dead-main registration deletion and corresponding test. All renderer/tooling/dependencies are identical, so initial unaffected results carry by hashes.

Harness: sibling `m6-harness-pin1`,41 files, manifest SHA256 `cfdd636c042d06b8aed8a23fcd7997e1f208504b9fac5526f240ac3dee05bb86`. Final before/after303 source,41 harness,445 dependency package manifests and two Node/Electron executable identities match; own copied final source matches303/303. Existing dependency junction is scratch-only; no install. Runtime Nodev26.10.0,Electron32.3.3.

Own scratch: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-m6-futaba/`. No live checkout execution. Read-only gallery provenance labels `live@98dd104+dirty` are metadata; full immutable manifest anchors tested content, not a formal entry receipt.

## Independent counts and mechanisms

| Check | Result | Method |
|---|---:|---|
| Initial safe regression |239 /239 tests,0 skip/fail |Explicit26-file pure/mock allowlist on pin1, including11 M6 and7 current preservation tests. |
| Final changed test |1 /1,0 skip/fail |Pin2 actual dead-registration absence and live Manager installation handler, with renamed-handler control. This is separate from239, not a claimed240-test single run. |
| Restored-registration control |Clean passes/restored fails |Execute exact final test callback in VM; mocked read restores actual pin1 IPC registration and triggers its absence assertion. No product main is loaded. |
| Pure consumer audit |16 /16 |Actual production narrowed preload/main-contract parser, loaded shared map/gallery expression, historical contract fixtures and missing-channel/catalog controls. |
| Forwarding audit |3 endpoints +6 allowlist/unsubscribe assertions |Actual source extracts/production allowlists; omitted forwarding fails all3 readiness/view endpoints. |
| Static contrast |101 themes,0 errors |New --text on --panel-bg mechanism invoked;32 existing legacy warnings remain, both baselines unchanged. |
| Panel negatives |Actual1:1 detected |White text/white panel fails unchanged4.5 floor; dark panel passes. Actual pair omission and wrong bg-surface mutants lose detection and are rejected. |
| Actual Manager self-test |2 /2 themes,6 PNG,13 /13 controls |6/6 fresh-window repeat captures; current Manager routes, parsed permissions and guards. |
| Original reachable hover gate |3838 /3838 pairs |101×38 unchanged readings;0errors/allowances,PC1–PC4 all fire. |

Region markup no longer contains Settings/installed-picker/cheat overlays or their slider/hotkey/theme-picker controls. Dead app bindings/helpers and obsolete scroll-panel wrapper styles are removed; shared live Manager panel/list styles remain. Current Escape/filter/edit and radial-theme callback preservation tests execute actual extracted handlers. Settings/picker/help route to scoped Manager; gallery scenes load actual manager.html, not deleted overlays.

Region preload denies exactly four removed privileges: add-app-from-appid,set-auto-launch,apply-global-hotkey,get-global-hotkey-status. Actual Manager preload remains byte-identical and retains required global controls. Region's live installed-app metadata, Manager-open, scoped save-settings and update routes remain permitted. Final obsolete main add-app-from-appid registration is absent; shared entryFromAppId helper and actual manager:add-installed handler still adopt a mocked entry. Restoring privilege, omitting required channels, renaming Manager installation endpoint and dropping forwarding are all detected.

One shared catalog loads before app boot; all101 keys match actual CSS keys. Region, Manager and gallery consume its loaded values. Committed naming ruling d195930 selects STAR WARS: GALACTIC REPUBLIC; both consumers and gallery metadata return that literal. Missing catalog fails the real metadata/name oracle; duplicate region label table is absent. Legacy gallery snapshot fallback remains isolated and tested.

Manager JS/HTML/CSS/preload, Q2 controller, all101 theme CSS files and both contrast baselines exactly match prior integrated QA inputs. That carries valid F5/Q2/theme behavior evidence; current actual Manager/gallery gates independently prove reachable skin/picker/cheat/fonts/readability still work. No unaffected M5/Grid or16k refusal matrix was repeated.

## Guards, findings and remaining work

Early exception/rejection handlers log/exit before Electron import; hidden offscreen unfocusable/taskbar-excluded windows, isolated profile, muted audio, denied external navigation/windows/network/permissions, local verified file allowlist. Self-test positively exercises13 controls. Hover records92/92 denial stubs intact,0unexpectedIPC/unsafe effects,0sockets,unchanged Run registry and127 owned processes started/0left. Launcher PIDs74720/65184 exited0 normally and were independently absent. No forced kill is shutdown evidence.

No new product Blocker/Major/Minor found within cleanup scope. One initial own restored-registration mutant failed to substitute because Windows separators were not normalised; it was an invalid positive control, not product evidence. Original script is preserved; corrected script verifies exactly one substituted read and observes actual assertion failure. Immutable sources stayed unchanged.

Pattern alert: a mutation must prove it actually changed the exercised input. Disposition **fix**: normalise fixture paths and count substituted reads; applied. Previously documented19 inherited extra-theme states and fractional focus-border Minor remain **defer** to existing theme/native work, not passed or repaired here.

Overall NO-GO remains: P9 timeout/schema entry-receipt obstruction, native desktop shaping/click-through/z-order, actual menus/keyboard/pointer/drop/files, host lifecycle/Quit, display/scale/taskbar and real-use coverage. M6 five-region idle CPU comparison, packaged/Bitdefender smoke, independent release review and release remain unrun. No product main/hosts, running launcher, real stores/Desktop/browser, visible UI/input/display/sleep or actual updater action was touched. Entry-tool repair is the authorised next work order, not this cleanup.

Exact source/test commit scope: `scripts/check-theme-contrast.js`, `scripts/theme-gallery/main.cjs`, `src/main/ipc.js`, `src/main/preload.js`, `src/renderer/app.js`, `src/renderer/index.html`, `src/renderer/styles/base.css`, `src/renderer/theme-names.js`, `test/integration/merge-preservation.test.js`, `test/integration/m6-cleanup.test.js`; plus separate implementation report and this QA report. Source303 pin excludes the final implementation report; its publication does not change tested product identity.

Evidence under own scratch: `identity.json`, `final-source-identity.json`, `harness-identity.json`, `final-summary.json`, `node.log`, `final-focused.log`, `registration-control.json`, `contrast.log`, `replay/{consumer-results.json,routing-forward-results.json}`, `selftest-work/self-test/manifest.json`, `hover-out/hover-readings.json`, closure logs. Root visually accepted final cyberpunk Manager Settings/theme-font/footer capture; small gallery viewport is qualified, not production geometry. Capture: own scratch `selftest-work/self-test/cyberpunk-settings.png` (also dune-settings.png). Canonical verdict is standalone above; no release clearance implied.
