# QuickLaunch display-shrink fallback QA — 2026-10-08

**Verdict:** NO-GO

**Safe development acceptance: GO** for the approved temporary Grid fallback and the verified corrections below. Formal entry receipts, native dogfooding and release clearance remain pending. Version remains **1.94.3**; this report authorizes no release or version bump.

## Immutable identity

Final source: `scratch/2026-10-08-display-shrink-ender/source-pin3`, 312 files, metadata HEAD `46214707b66b3424ea7187ebaa9deb96eee5d29d`, integration branch, pending implementation edits. Acceptance binds the complete immutable manifest, not that dirty HEAD alone. Manifest SHA256 `09be76a27825c11929726c56702fe5817545fb5b9f26ed51f1acc40215340ed2` independently verified before and after:312/312 source files and4/4 declared Node/Electron runtime files, zero mismatches.

Harness `harness-pin1`,7 files, manifest `18ae60f7176f6e9017a6918eb04e2a6f920ba330ad61cb106ddcd5e7b331aa8c`, independently verified before and after. Expanded immutable evidence manifest `658bd8caf9feec7871a8c39b43b3fba0d0fc9167efea94381740573bc164f539` verifies10 evidence files and all73 Electron distribution files. The expanded distribution check was performed after the renderer run; the executable/default application identity was checked beforehand. No install or dependency update occurred.

Own QA scratch: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch-integration/scratch/2026-10-08-display-shrink-futaba/`. All product execution used immutable pins or verified own copies. No shared live working tree was executed.

The renderer run used source-pin2 manifest `07337665012ce983c74e8f12a0efebbefa111af8a3c5bb319cbc2039c3d5bcd2`. Exact pin2→pin3 delta is only `src/main/regions/controller.js` and `test/regions/controller-display-shrink.test.js`, the explicit Fan-direction recovery correction. All138 renderer files in the executed copy exactly match final pin3; all163 copied source files match pin2. Thus renderer results carry to final3 by byte identity; final controller results are separately rerun against pin3. No fictitious combined final run is claimed.

## Independent results and counting method

| Check | Result | Method |
| --- | --- | --- |
| Final pure regression |87/87,0fail/skip |Nine audited named pure/mock suites under final pin3; supported Node child supervisor600000ms. Initial pin1 run86/86 retained as earlier evidence, not added to final count. |
| Independent geometry/controller |5930/5930 |741 configurations:13 selectable icon sizes32–128 step8 × (11 Fan counts ×4 directions +13 Ring counts). Eight emitted checks/configuration plus two fixed/nonmonotonic checks. UX-formula oracle independently checks rounded chips/pivots and dimensions,2223 exact-fit/one-pixel boundary cases, actual presentation entry/repeat/restoration and full serialized store preservation. Final run against pin3. |
| Persistence and actual mutants |16/16 |Final controller: two pending deliberate movement deltas, preferred dimensions/anchor, runtime resize/restore byte preservation, unchanged add rejection, actual-method home-save/add-capacity/stale-drop mutants, and suppressed direction recovery with global shown/hidden states. |
| Crowded/offset/tiny placement |16/16 |Four synthetic work areas, eight regions; deterministic primary-first plans, existing12px placement margins/gaps including resize rims, nonoverlap, suppression and preferred data preservation. Module bytes unchanged in final3. |
| Actual renderer acceptance |4047/4047 |101 themes ×2 icon-size extremes ×Fan/Ring =404 configurations, ten emitted assertions each plus four real CSS mutants and three safety/error identity checks. Independently rerun with measured minimum, active edit/filter/rename, actual notice space and repeated rebuild. |

The geometry fit oracle uses the approved24px radial reserve on each side; Grid placement uses the existing12px margins and gap. These are distinct rules. Nonmonotonic Fan example explicitly proves capacity4 does not imply count1 fits. Empty geometry equals first-item geometry without adding a stored item.

The renderer checks actual DOM rectangles and centre hit tests, every required menu/filter/edit/rename control, target sizes at least24px within0.1px measurement tolerance, preserved draft node/value/focus across radial→Grid and Grid rebuild, no automatic name save, measured minimum, at least one complete tile, last-item scrolling, temporary resize tooltip, preferred radial restoration and continued edit state. Actual full notice title and polite status are asserted while occupying notice space. Theme/control CSS bytes are unchanged except approved fallback treatment; this report makes no new independent all-theme contrast claim.

Final controller checks confirm refused Down direction leaves suppressed host and saved bytes unchanged; accepted Left direction restores the same safe host, preserves saved Fan preference and user-hidden state, and does not call host focus. Temporary Grid never permits extra radial capacity. Automatic changes preserve every serialized setting/item/region field; deliberate moves allow only exact preferred rect/anchor delta plus current home. No temporary viewport size replaces preferred radial dimensions or ordinary gridSize.

## Detection controls and resolved findings

The QA oracle detects executed actual-method mutations: adding `_saveRectSoon` to automatic relayout changes home and fails whole-store preservation; removing add capacity/prospective-fit guards permits a forbidden item and fails the same oracle; removing `_cancelTileDrag` from geometric cancellation lets the actual late-drop callback reach a counted mocked transfer. These mutate exercised source methods in QA VM only, never pinned product files. Renderer CSS mutants really hide the required menu control and replace scrolling overflow with hidden; both Fan/Ring detectors fail as intended.

Two implementation defects found during Ender's final pass were fixed and independently regressed:

- **Blocker, resolved in final pin2:** minimum measurement read zero padding from outer grid container instead of art-scrolling Grid's actual16px scroller padding, and missed live tile height. Notice plus rename clipped a tile/draft at the advertised minimum. Failed stricter175/247 evidence is retained. Final independent all101 matrix measures notice/draft/controls/scroll with the corrected renderer and passes4047/4047.
- **Major, resolved in final pin3:** successful validated Fan-direction change could leave a previously suppressed host hidden. Final source correction explicitly applies user-hidden/shape safety after successful shape. Independent shown/hidden and rejected-direction cases pass; final pure87/87 also includes its regression.

Own preliminary setup failures are not product defects: the original1920×1040 synthetic home correctly refused sideways Fan10 at icon size104; the geometry sweep now establishes a3200×3200 home before valid selection, with the failed setup retained. A placement assertion initially confused24px radial fit reserve with established12px Grid margins; corrected oracle uses the committed placement rule. CRLF normalization was needed when extracting a mock-only fixture prefix. Product pins were never changed by QA.

## Safety, closure and limitations

Audited renderer main installs fatal handlers before Electron import. All test windows are hidden, offscreen, unfocusable and taskbar-excluded, use an isolated scratch profile, muted audio, denied external windows/navigation/permissions, blocked network and a local renderer-only file allowlist. Actual audited denial-stub count is **25**, measured by the installed stub list (show/focus/window elevation, login controls, global hotkeys, dialogs and shell actions); stubs are exercised before testing, restored counters are empty throughout acceptance, and identities remain intact. This corrects the sender's earlier31-count claim.

Supported owned-process runner enforces600000ms without inventing an unsupported tool timeout. Renderer parentPID86768 exited0 normally. Independent read-only CIM check finds0 remaining owned Node/Electron processes by parent PID and exact QA scratch command-line path. Each loop destroys its own window. This proves harness closure; product tray Quit/host lifecycle remains unrun.

No visible tests, real mouse/keyboard input, display/scale/taskbar changes, sleep, running QuickLauncher interaction, signed-in browsers, real stores/files or updater actions occurred. Product main/native hosts were not loaded. Formal entry receipt checker was not retried or fabricated; global hooks/permissions/guard were untouched.

Canonical NO-GO remains because formal matching entry receipts and native work-area/DPI transitions, shaped-host click-through/rebuild, real drags/keyboard/drop/file operations, real-use checks and product Quit need a fresh authorized timed away window and separate remaining workflow. No additional user action is needed to accept this bounded development handoff.

Pattern alert: a minimum measured without the actual reserved notice and live scrolling tile can pass a broad theme matrix while clipping real controls. Disposition **fix**: final acceptance measures notice + active rename/edit/filter, full required control identities, real overflow, live tile height and first/last reachability; applied in independent all101 run. Formal receipt limitation disposition **defer** to its separate authorized tooling workflow. No additional unresolved product Blocker/Major/Minor found within this safe scope.

Evidence: own `node.log`, `independent-results.json`, `controls-results.json`, `placement-extra-results.json`, `pin3-identity-before.json`, `pin3-identity-after.json`, `runtime-evidence-identity.json`, `renderer-summary.json`, `closure.json`, and `renderer-final/shrink-results-all.json`. Actual captures: `renderer-final/fallback-fan-rename-notice.png`, `fallback-ring-rename-notice.png`, `restored-fan.png`, `restored-ring.png`; root visual audit is separate from these numerical results.
