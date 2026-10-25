# QuickLauncher v1.104.3 QA report — 2026-10-25

**Post-release user result:** Sergei reports that chat-checklist items **1–5 pass**. Item **6 (Windows-login startup)** remains pending his next sign-in. The original agent QA verdict below is preserved as historical evidence; see the post-release acceptance section at the end.

Futaba. Candidate: pinned 396-file source snapshot from `WIP/QuickLaunch` HEAD `8c4783ab5f28e3cc24fb398103e61755d86ce2f5`, dirty `Y`, source digest `f69136bc2775983afdf71317417427b9fe571e97bc5cdec84b3cbf20c400f6ae`. This report is for that snapshot and its nonpublishing package only. The unpacked candidate was run once under an owned guard with an isolated TEMP profile and desktop fixture.

**Verdict:** NO-GO

The fixed behavior is supported by focused tests. The owned packaged app visibly opened its Manager and logged five complete alternate-hotkey out/back mode roundtrips. Actual region paint, both real context menus, literal Ctrl+Space and normal tray Quit remain unverified. The owned guard reached its timeout and closed the candidate tree; that is not a normal Quit pass. Ender restored the two captured startup values byte for byte and restarted the installed copy. The remaining core behavior keeps this release at NO-GO.

## Exact handoff receipt

Ender and Futaba ran the same canonical v4 command sequentially, each from a fresh owned run copy. Both actual receipt lines matched byte for byte:

> Entry-check receipt v2: quicklauncher v1.104.3 @ 8c4783ab5f28e3cc24fb398103e61755d86ce2f5 (dirty: Y) [source:f69136bc2775983afdf71317417427b9fe571e97bc5cdec84b3cbf20c400f6ae; harness:8cc631ded1bf5d1adc4417f35568af70e91a262df4ea571cc3fdda14613b74aa; runtime:22059398ab8a76914b8409d6697be29635628633ebb76ac9390c43fd582f4f46; checker:a448c08c150e63019cfd6e49ceed5ec5b8652a97078abde197e7a50882b759cf] — pre-qa n/a, post-build n/a, check-electron n/a, check pass, test:smoke n/a

My receiver process exited 0 with its private Job closed: no force, timeout, output overflow, assigned process or unsignaled process. `check:contrast` checked 101 themes with 0 errors; `check:hover` measured 3,838 pairs with 0 errors and all four positive controls fired. Its guards recorded 0 login-item, global-shortcut, show, focus and dialog calls; 0 sockets; unchanged registry; 137 harness processes started and 0 left. This check runs an offscreen renderer, not QuickLauncher itself.

## Fixed-bug regression evidence

The pinned focused suite passed **22/22, 0 skipped**, including a Windows parse-only probe of the actual `ShellMenu.cs` parsing block. Known-bad baseline checks failed on the old hotkey rebind, stale page blockers, obsolete Blender launch path and AppsFolder parsing as intended.

- Failed or invalid hotkey rebinding retains the working registration; a later retry can register the configured binding. Page reload, renderer loss and region close clear departed-page menu, rename and gesture blockers; live gestures still block the foreground toggle.
- A stale `shell:AppsFolder\blender.5.1` tile resolves only to a unique current Blender identity. The original tile's ID, custom label, icon, arguments and order survive; two simultaneous resolves produce one rewrite without a false missing-target error. Missing or ambiguous successors do not launch an Explorer fallback.
- The native parser accepts the original `shell:AppsFolder` alias, the installed `blender.5.2` identity and a Unicode `.url` path. The fabricated missing ID fails before opening a menu. This is a parser probe, not a real right-click popup test.

The full baseline suite ran **336 tests: 283 pass, 53 fail, 0 skipped**. The candidate ran **351 tests: 298 pass, 53 fail, 0 skipped**. All 15 added tests passed and the 53 failed test names were identical. The strict comparison runner still exited FAIL because two diagnostic strings differed: one contained generated scratch paths, timestamp/PID and UUID; the other quoted the same function with LF in the Git baseline and CRLF in the candidate. Independent reading found the same assertion outcome in both versions for each. This is manual reconciliation of the old failures, not a green full suite.

The v1.104.2 Ctrl+Space return-trip requirement remains: desktop-child regions must regain `WS_VISIBLE`, paint their tiles and labels, preserve hidden-region state, and respond to hover and right-click. The focused tests cannot measure those pixels or a real global key event.

## Package and safe preflight

Ender's owned nonpublishing package completed with all 22 recorded child processes closed. Independent read-only checks matched its artifact hashes:

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| `QuickLauncher Setup 1.104.3.exe` | 114,277,097 | `427026f8a070f5092a6299cf7f766ceaa62de2c052ed99528ec64554dc7c7936` |
| `win-unpacked/QuickLauncher.exe` | 245,589,504 | `38c2f2a743112abfdb344ae7cd11b31d823aed97328ddb2253ede9975f397c5d` |
| `win-unpacked/resources/app.asar` | 8,552,013 | `053eaa535abf5d032ab3c3a8e9529aec8ea651f9d3eec70646d01388716d1bbc` |

The unpacked executable reports FileVersion `1.104.3`, ProductVersion `1.104.3.0`, ProductName `QuickLauncher`. The packaged asar declares `quicklauncher` version `1.104.3` and main `src/main/index.js`. `latest.yml` declares version `1.104.3`; its installer size and SHA-512 match the installer file.

The root safe launcher SHA-256 was `369f3313ea00559a7ce8ba3ed14a248f409c482a7f0c49777491704cd7843113`. Its `--check` preflight accepted the packaged exe and an owned TEMP profile with three equivalent seed candidates (`startWithWindows:false`, alternate `Ctrl+Alt+Space`, two reference tiles, no moved paths), and the TEMP desktop fixture argument. It printed `CITE: ql-safe-launch PREFLIGHT OK | v1.104.3 | nothing launched`. The product's read-only move-setup check returned `refused:null`, `testMode:true` for those exact paths with test hooks off. The unpacked exe was then launched once through the reviewed owned guard in a fresh, user-authorized away window; the installer and user applications were not run.

## Open checks and limits

- In the first 09:05:18–09:15:18 UTC away window, the installed tray's Quit control was not targetable through Sky/CUA. We stopped before registry mutation or packaged launch. Sergei then manually closed the installed app and explicitly granted a fresh 09:13:03–09:23:03 UTC away window. Ender verified the original process tree absent, captured both startup values, temporarily removed the Run value and launched the pinned unpacked candidate through an owned 240-second guard. This used only the owned TEMP profile and desktop fixture.
- The packaged Manager Settings window was visible and reported version `v1.104.3`, alternate `Ctrl+Alt+Space`, and Start With Windows unchecked. I sent 10 alternate-hotkey presses to that owned window. Its `ql-safe-launch.log` recorded five `attached → foreground → attached` roundtrips, with no `foreground-blocked` line. I did not capture region pixels or `WS_VISIBLE`; painted return, hidden-region behavior, literal Ctrl+Space and behavior with a region itself focused are still unverified.
- I sent one CDP right-click to the owned Blender tile. The tool response was truncated, and no screenshot or saved console trace captured the resulting menu. The owned app log contains no shell-menu outcome. Blender menu success/failure is therefore unverified; the owned local-shortcut menu was not attempted. No tile was activated, and no Blender or other user application was launched.
- The packaged Manager was opened through its existing production `region:open-manager` API. Its X and the production tray Quit were not tested; tray/taskbar remained unreachable through the available UI surface. I stopped all input at 09:18:02 UTC, before the 09:18:05 cutoff. The guard timed out at about 09:18:38 and closed its owned process tree; this does not satisfy the normal Quit requirement. Ender's final read-only audit at 09:20:06 UTC verified 12 candidate app processes and all 691 retained guard processes closed, Run and StartupApproved byte-identical to their capture, and the exact installed executable restarted as main PID 25628. The real `quicklauncher-data.json` was byte-identical to the post-user-Quit baseline (249 apps, 13 regions); app and region semantic digests also matched. Evidence: `verification/native-restoration-final-0919.json` under the session TEMP folder. Install, update and uninstall were not tested.
- The 53 failing tests are an existing suite-health pattern. **Pattern alert disposition: defer** repair to a dedicated test-maintenance cycle; the baseline/candidate comparison above keeps them visible and does not turn them green.

No Blocker was observed in the scoped tests or the five logged hotkey roundtrips. The pending core packaged behavior prevents a GO verdict. The only real system changes were the explicitly authorized temporary installed-app close/restart and startup-value transaction, which Ender restored. The test profile and fixture remain under `C:\Users\AnGeLZzZ\AppData\Local\Temp\codex-quicklaunch-2026-10-25-01a171a8\futaba\native-ui-v11043` for evidence and user cleanup.

## User-authorized release exception — 2026-10-25

After being told which checks passed and which remained unverified, Sergei explicitly instructed:

> Release and give me list of the checks - I'll do them after the release.

This authorizes publishing **1.104.3** while deferring the remaining native menu, region paint/focus, literal Ctrl+Space, Manager close and normal tray Quit checks to Sergei after release. It also defers the packaged normal-Quit smoke requirement. Sully is authorized to use the release precondition check's explicit, logged **`--skip-qa`** exception for this version. Senua's RELEASE CLEAR remains required. This is a release decision by Sergei, not a replacement QA result: Futaba's NO-GO and all unverified limits above remain unchanged. No new away window, desktop input, installation or shutdown of the installed app is authorized by this release instruction.

## Checks for Sergei after updating to 1.104.3

1. **Version and saved layout:** open Settings and confirm version 1.104.3. Check that your shortcuts and regions are still present in their expected positions.
2. **Ctrl+Space:** with a QuickLaunch region focused, press Ctrl+Space out and back five times. Repeat while another app has focus. Every return should repaint all expected tiles and labels, preserve intentionally hidden regions, and leave the visible regions clickable and responsive to hover and keyboard input.
3. **Menus:** right-click Blender, another application shortcut, and a local file/shortcut. Each native menu should open without the "Value does not fall within the expected range" error. Dismiss with Escape and confirm Ctrl+Space still responds afterward.
4. **Blender launch:** click the Blender tile. It should open Blender rather than Documents. At your next normal Blender upgrade, try the existing tile before deleting or re-adding it; when exactly one replacement is installed, the tile should recover while keeping its name, icon and position. No deliberate upgrade or uninstall is needed for today's checks.
5. **Manager and normal Quit:** close the Manager with X; the tray-resident app should remain available. Then choose **Quit QuickLauncher** from its tray menu. The tray icon and regions should disappear, and Task Manager should show no QuickLauncher processes.
6. **Reopen and startup:** reopen QuickLaunch and check Ctrl+Space and the saved layout again. If Start With Windows was enabled, confirm it remains enabled; at your next normal Windows sign-in, confirm QuickLaunch returns. No immediate reboot is required.

If a check fails, record the action, the affected shortcut/region, and a screenshot or exact error text. Do not treat an unperformed check as passed.

## Post-release acceptance reported by Sergei — 2026-10-25

Sergei replied to the delivered chat checklist:

> 1- 5 pass. I'll check 6 next time I login.

Record the current checks for version/layout, Ctrl+Space, right-click menus, Blender launch, and Manager close/tray Quit/reopen as **user-reported PASS**. Windows-login startup is **PENDING**, to be checked at his next normal sign-in. This is user acceptance of the released build, not an additional agent test run or a replacement of the historical agent verdict. A future Blender-upgrade scenario has not been separately observed; no new upgrade or restart is requested.
