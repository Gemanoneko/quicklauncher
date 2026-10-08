# QuickLaunch native away-window attempt — 2026-10-08

**Verdict:** NO-GO

Native acceptance remains pending. This is a stopped preflight, not a product failure or release clearance. No product instance was launched and no real input or display/settings change was made.

## Consent, timing and scope

Jane relayed Sergei's explicit words, “I'm not near computer for the next 20 minutes.” Window start: 2026-10-08 20:40:45 UTC (23:40:45 Asia/Jerusalem). Conservative operational hard stop: 20:58:45 UTC; no new tests after 20:56:45 UTC. First clock receipt: 20:42:39 UTC. Native work stopped before launch; final read-only receipt: 20:45:07 UTC. Sleep/resume was never run.

Requested native scope: Regions M5/Q2, display-shrink fallback, M6 idle/lifecycle acceptance on the already accepted immutable fallback. Shared dirty integration, original themes/regions checkouts, installed launcher, real stores/accounts/browser and release operations were excluded and untouched.

## Proven identity and preflight findings

Immutable source: `scratch/2026-10-08-display-shrink-ender/source-pin3`, version 1.94.3, recorded freeze HEAD `46214707b66b3424ea7187ebaa9deb96eee5d29d`. Published fallback/reference commits supplied by Jane: b1ca132 and reports 9c0291e. The freeze manifest, rather than its historical dirty metadata, identifies the actual source tested previously.

Manifest SHA256: `09be76a27825c11929726c56702fe5817545fb5b9f26ed51f1acc40215340ed2`. Independent SHA256 verification at 20:45:07 UTC matched **312/312 files** and **4/4 runtime entries**, with zero mismatches. Method: hash every manifest-listed source and runtime file and compare with its recorded SHA256. Evidence: `scratch/2026-10-08-away-native-futaba/preflight.json`.

The local-only studio-status check showed no behind/unpushed commits; integration was dirty at 7aab880 and was not executed. This is a read-only status receipt, not a formal qa-handoff entry receipt; the parked checker was not retried.

Two launch prerequisites failed:

1. Existing reviewed `scripts/qa/quicklaunch-safe-launch.mjs` accepts a packaged `QuickLauncher.exe`; `checkExe` rejects the existing Electron source runtime. Its process ownership uses PID/creation-time checks and a watchdog. The brief additionally required a Job Object established before the child. Ender's read-only lookup confirmed no already reviewed current-fallback packaged target or source-mode recipe meeting that requirement. Old Oct05 packaged/input artifacts are for obsolete 3467e5c/6cbdeb5, so they were not substituted. The shrink harness is an offscreen renderer harness, not a native product launcher. No adaptation, recompile, build, install, guard bypass or ad hoc launch was attempted.
2. Calling the existing launcher's read-only `snapshotRegistry()` failed: `reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run exited 1: ERROR: Access is denied.` No registry write occurred, and no retry, escalation or permission broadening was attempted. HKCU before/after equality is **unverified**, not PASS.

Approved computer-use skill was read and initialized through `@oai/sky` in node_repl. `sky.list_apps()` worked twice without activation or input. Native CUA being disabled therefore does not itself block native input; the launch/registry prerequisites are the actual blockers. The installed user's QuickLauncher window was returned both times with handle 67630 and the same installed executable/title. It was never activated or controlled. No CITE launch line exists because no launch occurred.

## Native acceptance left pending

| Requested check | Outcome |
|---|---|
| Actual Grid/Row/Column/Fan/Ring opening, edit/filter, rename, focus/scroll, menus, keyboard/pointer/drag | Pending; no product host launched |
| Native shape, transparency click-through and z-order | Pending; renderer evidence cannot certify this |
| Fixture shortcut activation and cross-region/file move integrity | Pending; no fixture app or file move launched |
| Tray Quit, real product process exit, saved bounds and host rebuild | Pending; zero owned product processes is preflight evidence only |
| Actual work-area shrink, temporary Grid and preferred Fan/Ring restoration | Pending; no display/work-area mutation |
| Taskbar, scale/DPI/display snapshots and exact restoration | Pending; no snapshot/restore sequence executed |
| M6 five-region 60-second idle versus one-region baseline | Pending; no product instance/sample |

No mock/offscreen test was rerun or represented as native coverage. No new product Blocker/Major/Minor was observed because the product was not exercised. Blocker-to-QA prerequisite findings were relayed immediately to Jane.

## Closure and restoration

Counts use the actual action log: **0 product launches, 0 native inputs/activations, 0 fixture launches, 0 display/taskbar/scale mutations, 0 owned product processes**. Only read-only native inventory calls and filesystem/hash/status/registry reads were performed. The first attempted evidence command stopped on the registry read; the subsequent pure hash command wrote the local JSON above. No generated entry script was launched.

There is no desktop/display state from this pass to restore. Display restoration is **not claimed as a tested PASS**. HKCU equality is unavailable due to denied read access; the agent issued no registry mutation. Real store contents were never read or written. No user window was minimized, moved, activated or closed, and no owned app/window remains. No screenshot containing signed-in browser content was captured.

Pattern alert: native acceptance repeatedly waits for a reviewed current-build launch route. Disposition **defer** to Jane/Ender for a separately authorized prepared route and future away window. The parked formal entry-check obstruction remains deferred; this window did not retry or repair it.

No code/source fix, commit, version/tag, update/download/install or release was performed.

## Additive read-only precision follow-up — 20:49 UTC

The Job Object-before-child prerequisite above was **Jane's explicit constraint for this task**, not a universal ProcessRules requirement for QuickLaunch product launches. ProcessRules approves the existing QuickLaunch PID/creation-time/watchdog launch guard; its explicit Job Object rule covers headless browser trees. The absence of a current reviewed packaged target or approved source-mode route remains the valid launch blocker. No existing guard was loosened.

After the stopped preflight, Jane authorized one scoped `require_escalated` read-only retry of the **same existing** `snapshotRegistry()` export. It passed at **2026-10-08 20:49:20.757 UTC**. Only the timestamp, whole-snapshot SHA256, key count and QuickLauncher presence flag were printed; startup values were not printed. Snapshot digest: `fe383ddb7b10bdaeb1de9fa4f06ee9b5d133e3d7ac266ac451a5c4251af8e8ab`; key count **2**; QuickLauncher mention **true**. Method: SHA256 over `JSON.stringify(snapshotRegistry())`, count its two returned key entries, search the serialized snapshot for the case-insensitive literal `quicklauncher`. This presence flag does not certify an exact desired autostart value.

The earlier failure is retained as history: the default sandbox denied the registry read. The narrowly scoped read resolved that access limitation without modifying any permissions file, registry entry or launch guard. Only one successful snapshot was taken; **before/after HKCU equality and restoration are still unverified**, and no restoration was necessary because no mutation or product launch occurred. This follow-up grants no native acceptance.

Computer-use skill consulted: `C:/Users/AnGeLZzZ/.codex/plugins/cache/openai-bundled/computer-use/26.1002.52244/skills/computer-use/SKILL.md`, with its guidance and confirmations documentation. It was used only for initialization and read-only `sky.list_apps()` inventory. No user window received input or activation.

Final action counts remain **0 product launches, 0 native input/activation, 0 fixture launches, 0 display/taskbar/scale or registry mutations, 0 owned app processes, 0 restorations necessary**. All named native tests remain pending. The read-only follow-up ended at 20:49:20 UTC, before the operational hard stop.
