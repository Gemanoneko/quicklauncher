# QuickLaunch performance measurement — 2026-10-10

## Outcome

No production performance change is justified by these measurements. One installed app has thirteen region renderers plus main/GPU/network processes (sixteen total), with one Windows startup registration. The measured startup burst is short; steady CPU is low. Private memory is substantial, with GPU/compositor allocation the largest observed portion of isolated startup memory. No unnecessary full-store broadcast, oversized full-screen window, or unpaused idle animation was demonstrated. Reducing window count, transparency or GPU behavior would change the requested behavior and was excluded.

## Identity and safety

Active version 1.104.0, HEAD `6ade021914797f6c4a14d4cd3ca6efd0bfe37dd5`. Every active `src` file was byte-identical to the installed artifact's extracted `src`. Production source was not edited. The snapshot adds a guarded entry and changes only its copied package's main entry.

Human away window: 2026-10-10 17:44:05–17:54:05 Asia/Jerusalem (14:44:05–14:54:05 UTC). All test windows/processes were closed by 14:52:52 UTC, before the 14:53:35 cleanup deadline. Installed main PID 22172 was left running.

Senua cleared the snapshot entry and exact passive native route before launch. A follow-up identified the compiler's shared temporary directory; exploratory trial 1 had already completed safely. Trials 2–4 use the revised guard setting Electron's temp path to the isolated profile. Trial 1 is preserved as exploratory evidence and excluded from the comparable baseline.

Reviewed entry SHA256 `8377b1052f5eeecadd58a008e134bea584f5d87b508f1194e98344491a6f758d`; instrumented app.asar SHA256 `43c2c6513253f0107abc144f351dbf3929d8bccf1cde2c2848174c6c0fee2c02`. Canonical launcher copied byte-for-byte from committed root HEAD, SHA256 `a885e727680ba61aae76fd96cfa0e93dd906a3c9a0620d2018edd7b44223505f`. Dirty root launcher drafts were untouched.

The canonical launcher supervised each copied artifact for at most 60 seconds; the app quit naturally after 30 seconds through its original detach/flush handlers. Copied profiles contained all 13 regions/159 shortcuts, with startWithWindows false, globalHotkey null and randomTheme false. Entry guards prevent real login-item writes, hotkey registration, shell launches and dialogs independently of seed fallback. Test hooks disable real file moving; updates/network were suppressed. No input or shortcut targets were exercised. Every trial returned unchanged Run/StartupApproved values, untouched real profile, empty guard/error counters, intact guard identities and zero owned processes remaining.

## Installed runtime sample

Read-only Win32_Process snapshots matched PID + CreationDate across 30.139819 seconds: sixteen stable processes, 0.390625 CPU seconds, **1.296% of one logical CPU / 0.04050% of the 32-logical-CPU machine**. End-of-sample private bytes: **954.50 MiB**. Summed working sets: **1509.50 MiB**; shared pages can be counted repeatedly. This was a live interval, not a controlled guarantee of no user interaction.

A later read-only snapshot still found only the original sixteen processes, with 983.00 MiB private bytes and 1518.35 MiB summed working sets. Windows reports 130,756 MiB visible physical memory (~127.7 GiB), with 103,474 MiB free at that snapshot. Private bytes measure process commitment rather than resident physical RAM; the ~0.75% ratio to machine capacity is context, not measured physical consumption.

## Comparable native baseline

Readiness is **from instrumentation entry execution**, excluding Electron executable initialization. Region-ready means the existing renderer-ready IPC has completed after initial render/listener setup; it does not prove pixels were presented. Process-creation-to-ready / command-launch-to-ready was not measured because an absolute entry timestamp was not recorded. These results are not Windows logon or boot timings.

AppMetrics samples aggregate main, GPU, network and thirteen renderer processes. Memory fields are KiB, converted to MiB. CPU is summed process-lifetime cumulative CPU seconds. Short-lived external C# compiler processes are excluded, so CPU is an app-engine measure rather than complete descendant CPU accounting. Approximately 5-second and 30-second samples are labeled with their actual times in preserved raw data.

| Trial | Main ready ms | All 13 ready ms | CPU through ~5 s | CPU ~5–30 s | Private MiB at ~1 s | Private MiB at ~5 s | Private MiB at ~30 s |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2 | 175.98 | 747.85 | 5.822 s | 0.141 s | 968.67 | 1548.79 | 1353.65 |
| 3 | 176.11 | 702.03 | 5.509 s | 0.148 s | 966.61 | 1493.92 | 1276.24 |
| 4 | 171.75 | 701.23 | 5.630 s | 0.155 s | 967.58 | 1529.84 | 1269.15 |
| Median | 175.98 | 702.03 | 5.630 s | 0.148 s | 967.58 | 1529.84 | 1276.24 |

Median post-start CPU is approximately 0.59% of one logical CPU / 0.0185% of this machine. At 30 seconds, per-type median private memory: GPU **642.52 MiB**, thirteen renderers **469.45 MiB**, main **146.63 MiB**, network **17.73 MiB**. Medians by type need not sum to the median aggregate. GPU private allocation rises during initial presentation and partly falls; this is observed allocation behavior, not proof of a leak or an avoidable allocation.

Isolated profiles do not include the installed Chromium/helper caches; compiler preparation is consequently included. The installed app remains running alongside the isolated copy. Warm OS file cache, temporary profile state, test hooks, suppressed updates/moving, and duplicated visible regions limit comparison with normal Windows login. Isolated 30-second private memory (1269–1354 MiB) must not be substituted for the installed live 955 MiB measurement.

## Profile/component measurements

Five sequential read-only Node trials: 8,541,564-byte profile; read 6.34–7.20 ms, parse 5.06–8.91 ms, pure migration 0.14–0.71 ms, region filtering 0.028–0.087 ms, Node V8 serialize/deserialize proxy 4.02–6.45 ms. Migration used a synthetic 2560×1440 work area and is not a native startup phase measurement. CPU resolution was too coarse for individual millisecond operations; no component CPU attribution is claimed.

Aggregate region-filtered JSON is 8,526,257 bytes across all regions, **not 8 MB per region**. Icon data URLs account for 8,487,242 bytes; 159 PNGs represent approximately 36.28 MiB of RGBA pixels at native dimensions, maximum 600×600. This pixel estimate excludes decoder/compositor/cache overhead and is not measured GPU usage. These findings do not support a large full-profile duplication optimization.

## Bounded source checks

- `controller.js:119` creates each region at startup; `:841` creates each BrowserWindow.
- `controller.js:796–799` sizes native windows to their shown rectangles, plus only the existing Grid rim. No full-screen backing window was identified.
- `ipc.js:299–301` and `controller.js:1019–1023` return only the sender region's items.
- `app.js:1250–1274` already pauses idle animations when unfocused and the pointer is outside.
- Icon helper DLLs are cached by source revision; Manager is created on demand. No eager installed-app icon cache was found in the bounded read.

Changing Chromium/compositor architecture, upgrading Electron, reducing regions, removing effects or changing transparency would require a separate behavior-preserving experiment. No speculative tuning or delayed-work substitution was applied. There is no before/after performance claim, production diff, QA build or release in this task.

## Receipts and retained evidence

Raw metrics, startup logs, reviewed entry and committed launcher snapshot are retained in `PerformanceEvidence_2026-10-10/`. Sergei manually deleted the verified disposable TEMP benchmark root and `scratch/startup-perf-2026-10-10` on 2026-10-10; subsequent read-only checks confirmed both exact paths absent. Their last verified aggregate logical file size was **445,106,515 bytes (424.49 MiB)**; this is removed file content, not a measured physical-disk-space reclamation. All eighteen committed report/evidence files remain intact, reviewed source/manifest hashes match, and the installed executable, real user profile and original sixteen installed processes remain present. Agent cleanup with native PowerShell Remove-Item had been rejected by policy before execution; no alternate deletion route was attempted.

Rejected action: `Remove-Item -LiteralPath <verified target> -Recurse -Force`. The tool's literal reason was `rejected: blocked by policy`; it supplied no further rationale. Before corrected profiles were prepared, the TEMP root held 374,706,563 bytes in 815 files (~357 MiB), and harness scratch held 15,132 bytes in four files. Fresh copied timing profiles subsequently add nine seed files; no runtime was launched after the original away window expired.

## Completed process-start timing correction

Historical entry-relative results cannot be converted rigorously into process-launch-to-ready timing: neither the startup log nor snapshots recorded an absolute entry/ready clock. No filesystem-time or timer-duration approximation is used.

Retained `native-entry-timing-v2.cjs` adds actual wall/monotonic entry and event clocks, first acknowledgement per renderer only, renderer PID/webContents identity, root PID, process creation time, and sampling start/end clocks. It computes process-creation-to-main/all-regions-ready using Electron's epoch-millisecond ProcessMetric creationTime and retains raw observations for CIM cross-check and wall-clock stability validation. Renderer-ready remains an IPC acknowledgement, not a first-paint measurement. Transient compiler CPU remains excluded.

Senua independently cleared the corrected source and repacked artifact. Entry SHA256 `41f072ca67ef862cd75d32a3dcd1c4b881e6d4f1abaa0bd13f295199d7e3f8d6`, app.asar `a5371887c321ad07b1e1cab2265c4dae77e57ac3605d2a85a0295b09d765f1bc`, executable `dab34c0f81dfec850f7da4b6f67044c40965653f70c9635ec780060d1385977c`. Complete 146-file attestation: `artifact-timing-v2-manifest.json`, SHA256 `f3949256130db2cd85697ffd94cec100e934ab3576b4ac1b95d6722b6384b6c3`. Canonical launcher remains byte-identical to the committed snapshot.

Fresh human away authorization: 18:00:35–18:02:35 Asia/Jerusalem (15:00:35–15:02:35 UTC). One corrected passive trial ran with canonical timeout 40 seconds and natural quit at 30 seconds. It closed by 15:01:50 UTC; canonical and independent scoped CIM checks found zero owned processes. A second trial was skipped because less than the required 55 seconds remained. Three prepared profiles were safe; only timing profile 5 was launched.

Corrected trial 5, root PID 24956: **process creation to main ready 348.95 ms; process creation to all thirteen first renderer-ready acknowledgements 872.32 ms**. This includes executable initialization before entry, but excludes canonical safety preflight, Windows logon scheduling and first-pixel presentation. It is one corrected observation, not a three-trial median.

Live CIM preserved creation UTC `2026-10-10T15:01:15.8582570Z`, which converts exactly to `1791644475858.257` epoch milliseconds, matching AppMetrics creation time and PID. The original sampler's numeric field was wrong by two hours because its `[datetime]` UTC Unix-epoch cast converted to local 1970 Israel time before subtracting `.Ticks`. The original field remains in raw evidence; `timing-5-correlation.json` documents the correction from the preserved UTC ISO value, with zero creation-clock difference. Wall Date.now minus performance epoch offsets stayed between -1.842 and -0.358 ms. No filesystem-time approximation was used. Guard counters and errors were empty; guard identities held, registry values remained unchanged and the real profile was untouched.

```text
CITE: ql-safe-launch PASS | v1.104.0 | profile profile-timing-5 | pid 24956, 16 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged
```

Reproduction requires a fresh human away window and safety review. Copy the installed packaged folder into a new owned directory under the exact temporary root; extract its asar, insert the retained `native-entry.cjs` at the extracted package root and set that copied package's main to `native-entry.cjs`, then pack with the original native koffi unpack directory preserved. Compare all `src` bytes to active HEAD and hash the complete instrumented artifact before review. Seed a unique profile with the user's JSON and main/tmp/bak all carrying false/null/randomfalse settings. Invoke the retained canonical launcher with `--exe <copied artifact>/QuickLauncher.exe --profile <unique TEMP profile> --timeout 60 -- --ql-test-hooks --ql-no-update-check`. No additional IPC, keyboard/mouse, test-desktop or app arguments are permitted by the reviewed route. Review new artifact identities rather than assuming these historical hashes certify a new copy. The entry quits after 30 seconds; canonical ownership/watchdog/registry/profile checks must PASS before another run.

```text
CITE: ql-safe-launch PASS | v1.104.0 | profile profile-baseline-1 | pid 45096, 16 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged
CITE: ql-safe-launch PASS | v1.104.0 | profile profile-baseline-2 | pid 44432, 16 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged
CITE: ql-safe-launch PASS | v1.104.0 | profile profile-baseline-3 | pid 43776, 16 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged
CITE: ql-safe-launch PASS | v1.104.0 | profile profile-baseline-4 | pid 42352, 16 proc | ended exited | 0 left | Run unchanged, StartupApproved\Run unchanged
```
