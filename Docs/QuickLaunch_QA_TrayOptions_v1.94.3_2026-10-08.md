# QuickLaunch tray B and three options: QA

Futaba, 2026-10-08. Development version1.94.3; no release or native-product clearance.

**Verdict:** NO-GO

Independent safe development acceptance **PASS** on corrected tray/options pin2. Overall clearance remains withheld for unavailable shared entry receipts and pending native/real-input/lifecycle checks. The new Manager CLOSE hover Major found on pin1 was corrected and verified; no remaining new Blocker/Major in this bounded pass.

## Pins

- Pin1: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-qa-tools-ender/tray-options-pin-1`; source HEAD `b6cc4b3624768bfd7d865027287a8dba54ca2552`; **180/180 SHA256 files match** independently.
- Final pin2: sibling `tray-options-pin-2`, immutable correction copied from pin1; **182/182 hashes match**. **179/180 original files unchanged**; only `src/renderer/styles/manager.css` changed, plus new regression test/correction report. No changing live M5 source entered QA.
- Pin manifests retain exact hashes. All prior F5 renderer files except the two intentionally changed stylesheets match F5 pin3; normal F5 strip/state geometry evidence carries forward. Pin2 leaves Column/tray/updater/controller unchanged, so their valid pin1 evidence carries forward.
- Committed prerequisite: `3e384365345cde4e6f48f0a0a8c076cb5d57f5ae` M5/tray/options spec. Empty-Fan correction `327ebed` concerns later M5, not these option checks.

## Bounded evidence

| Check | Result / method |
|---|---|
| Pin1 focused mocks | **13/13**, zero skipped; tray labels/callbacks, replay states/dismissal and prior updater regressions |
| Pin2 focused mocks | **15/15**, zero skipped; above plus CLOSE cascade regression and class-only known-bad control |
| Independent readiness integration | **10/10** actual pinned callback vectors: primary/non-primary × ready/not-ready × Grid/Column, plus rendererReady ordering/save-error checks; no product index execution |
| Replay behavior | Available/downloading/ready replay; dismissal survives progression/rebuild/promotion; fresh available resets notification; Row/Fan/Ring/dead page/no offer do not replay. Layout/promotion call sites verified by source read; actual native transitions deferred |
| Tray B | Five offer/checking label/click cases: always Manager Settings; no offer checks once unless already checking; waiting offer starts no check/download/install. Native menu not shown |
| Column | **606/606** rendered cases:101 themes × checking/current/error/available/downloading/ready; message text visible **303/303**, action-carried text remains hidden **303/303**; no text/button overlap or controls outside180×726 window |
| Manager unchanged three hover controls | **303/303** actual forced:hover cases resolve to `--text`; ≥**4.883953:1**, minimum silent-hill CHECK. OPEN FOLDER/MOVE ALL BACK/CHECK source unchanged by pin2 |
| Corrected CLOSE hover | **101/101** actual forced:hover cases ≥4.5:1; minimum **4.958094:1**, silent-hill. Background/border/glow and sizing retained |

Hover contrast uses Chromium resolved colors composited through ancestor surfaces, with real CSS pseudo-state forced via debugger; no real pointer/input. Settled CLOSE measurements wait250ms through its color transition. Two animation frames plus200ms precede saved captures. Column acceptance here certifies visibility/geometry/action separation, not a new all-theme text-color contrast gate.

Known-bad controls: removing readiness callback produces0 replay calls; duplicate-download guard and absent aria-label are detected by pinned regressions. Obsolete Column clipping yields `clip:rect(0,0,0,0)`, caught by visibility probe. Settled white-text mutation produces hover contrast failures in portal1.86715, mirrors-edge1.67187 and silent-hill2.44568. Class-only CLOSE selector remains on the wrong base token and is detected by the new regression.

## Finding and correction

**Major M-1 — approved hover rule misses CLOSE. FIXED in pin2.** On pin1, `body.manager button:hover` loses to base.css683 `#btn-close-settings` color. **55/101 CLOSE cases below4.5:1**; settled twin-peaks1.97761, portal3.17259, mirrors-edge2.85672, silent-hill2.70513. Ender added the already-approved `--text` rule with ID-capable specificity. QA reran only affected CLOSE across101 themes; all pass. Failed readings remain in `results-trayoptions.json` and `results-traycontrol.json`.

The first combined renderer attempt stopped at a scratch color-parser escaping error after its Column loop; no aggregate was saved or cited. It was a QA harness error, corrected before the valid second run. That failed output remains in the tool transcript; its scratch log was overwritten by the successful rerun. No product fault was inferred.

## Guards, closure and evidence

Own scratch: `C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-m5-futaba/`. Audited inherited renderer-only guards: early fatal log/exit without dialog; scratch profile; offscreen/show:false/focusable:false/skipTaskbar; counting show/focus/login/shortcut/dialog/shell stubs positively exercised; muted audio; local-file/data request allowlist; blocked remote resolver/network/navigation/popups/webviews/permissions. No product main/region hosts, actual updater, native popup, visible window, real input, browser, real Desktop/store, display/scale/taskbar change, sleep or running QuickLauncher interaction.

Valid runs: **0 unsafe guard calls, 0 renderer errors, stubs intact**, normal window destruction/app.exit. Recorded QA PIDs from the completed combined/control runs were absent; after corrected CLOSE one main PID briefly remained in immediate tasklist and was absent on follow-up. No process was force-killed. Watchdogs590/600s; no duplicate active runs.

Detailed results: `results-trayoptions.json`, `results-traycontrol.json`, `results-trayclose.json`, `tray-identity.json`, `tray-pin2-identity.json`, `tray-integration.cjs`. Settled screenshots: `trayoptions-column-checking.png`, `trayoptions-column-error.png`, `trayoptions-column-available.png`, `trayoptions-column-downloading.png`; corrected CLOSE `trayclose-corrected-close-portal.png` and `trayclose-corrected-close-twin-peaks.png`. Root independently inspected the settled Column checking/error/available and corrected Portal CLOSE captures: messages/actions visible and hovered CLOSE readable. This is a bounded visual audit of those captures, not native or full-theme clearance.

Pending: actual native tray menu, primary rebuild/promotion/layout switch, real updater integration and input/lifecycle in a fresh timed away window. Existing receipt timeout/schema and snapshot-ancestry limitations remain; no bypass/fabricated receipt. No M5 QA or unrelated optional fixes performed.

Pattern alert disposition: CSS token presence is not cascade acceptance — **FIX applied** with actual pseudo-state/specificity regression and rendered contrast. Immediate transition reads — **FIX applied** with settled targeted controls. Native/receipt gates — **DEFER**, overall NO-GO preserved. No production/tool-code edits, commits, pushes, bumps, tags, merge or release by QA.
