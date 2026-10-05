# QuickLaunch Regions — QA, M3 Fix Pass (2026-10-05)

**Worktree:** `C:/Antigravity Projects/QuickLaunch-regions-spike`, branch `wip/regions`, HEAD `5522c0c229c18e1091418db08f5c0e40a706b75b`. Fix pass uncommitted on top of HEAD. Red-team pass — findings only, no balance pass.

**Verdict:** GO

**Design/story flags:** none

---

## 1. Pin

Pinned HEAD + the 22 uncommitted/new files into the scratchpad (`fixpass/pinned`, byte copy via `tar`, `node_modules` copied separately, no junctions/symlinks). Every file's sha256 (first 12 hex) was computed **before** any copy, directly off the live worktree, then re-verified against the pinned copy after. All 22 matched Ender's manifest exactly — no mismatch, no stop needed.

```
815b3af0a0f8  Docs/QuickLaunch_Brief.md
9dd172178459  Docs/QuickLaunch_Regions_TechPlan_2026-10-01.md
f061dbe5eeee  scripts/regions-selftest.mjs
8917c58350bb  scripts/tryit-regions.mjs
975ced319850  src/main/ipc.js
e11234f6a952  src/main/moves/journal.js
cf7af5490faa  src/main/moves/mover.js
6914df075e08  src/main/moves/rules.js
e2a5a287024e  src/main/regions/controller.js
5894739deb23  src/main/updater.js
8c226998fd4b  src/renderer/app.js
81eb00939a0b  src/renderer/index.html
903fa02ace24  src/renderer/region.js
3377a923f1ac  src/renderer/styles/base.css
4303fe17dcd7  src/renderer/styles/manager.css
a2eb632755d2  src/renderer/styles/region.css
7beb8bf33517  test/regions/controller-moves.test.js
6df157668c77  test/regions/m3-rulings.test.js
147cee1cb517  test/regions/moves-mover.test.js
e8951548da88  test/regions/moves-rules.test.js
74ba072dd865  src/renderer/banner-layers.js (new)
f4e600e5597a  test/regions/banner-layers.test.js (new)
2cf0d9e9c7a5  test/regions/tryit-text.test.js (new)
```

A pre-existing packaged build already sat in the worktree's `dist/win-unpacked/` (built 2026-10-05 00:14, before I arrived). Rather than trust that label, I extracted its `app.asar` and hashed the bundled `index.html`, `rules.js`, `banner-layers.js`, `mover.js` — all four came back identical to the manifest hashes above. That build is genuinely of this fix-pass source, so I used it (read-only) for every self-test/crash-test run below instead of rebuilding (per the hard limit: no `npm run build`/`release`).

## 2. Census and real-folder listings

**electron.exe (generic, dev-mode image name) — before:** 4 processes (PIDs 79156, 65644, 87228, 79072). **After:** 0. These were not Sergei's installed app and not mine: Sergei's packaged app runs under image name `QuickLauncher.exe`, not `electron.exe`. I never launched anything under the bare `electron.exe` image name (all launches went through the guard script against the packaged `QuickLauncher.exe`). These 4 were pre-existing stray dev processes, unrelated to this pass, and had exited on their own by the time I checked again — not my doing, flagged here only for the record.

**QuickLauncher.exe (Sergei's installed app) — checked explicitly before AND after,** since it shares an image name with the packaged test build: PID 30760 (+3 children: 23324, 31752, 41564) running throughout, confirmed alive and unchanged after every one of my test launches. The shared guard script (`quicklaunch-safe-launch.mjs`) independently confirms "Sergei's instance RUNNING (PID 30760)" and "remaining 0" (my own spawned test instances, 0 left) on every single run below.

**Real Desktop** (`C:\Users\AnGeLZzZ\Desktop`): 87 entries before, 87 after (87 includes `.` and `..`; 85 real entries either way). **Public Desktop** (`C:\Users\Public\Desktop`): 4 entries before, 4 after, byte-identical listing. Untouched.

## 3. Claims reproduced, each independently

| Claim | Ender's figure | My rerun | Method |
|---|---|---|---|
| Unit tests, plain Node | 172/172 | **172/172** | `node --test test/` on the pinned copy |
| Unit tests, Electron's Node | 172/172 | **172/172** | `ELECTRON_RUN_AS_NODE=1 electron --test test/` on the pinned copy |
| Self-test, attached | 114/114 | **114/114** | `node scripts/regions-selftest.mjs --exe <verified dist exe> --guard <shared guard> --root <my own scratch root>` — independent root, not reusing Ender's logs |
| Self-test, fallback | 113/113 | **113/113** | same, `--fallback` |
| Self-test, probe (negative control) | 53/115 | **53/115** | same, `--probe`; exact match including the probe's own expected-to-fail check |
| Real Desktop/Public Desktop unchanged | unchanged | **confirmed**, twice over: the guard's own read-only comparison inside every run above, plus my own before/after listing in §2 | — |
| Notice contrast, 48→0 themes below 4.5:1 | 0 | **consistent**: `npm run check:contrast` → 101 themes checked, 0 errors; the only properties still flagged (13 "legacy warnings") are `--text-dim`, `--accent-c`, `--hint-sub-color` — never `--text`, which is what the notice now uses | `node scripts/check-theme-contrast.js` |
| Region tagline overlap, 101→0 | 0 | **0/101** | Parsed `header-geometry.json` from my own independent attached self-test run: computed `run.r > controls.l` per theme across all 101 painted (non-chip) entries — zero overlaps |
| Drop effect is `copy` | copy | **confirmed** | `grep dropEffect` in `app.js:1207` (`'copy'`) and `region.js:618` (`rejected ? 'none' : 'copy'`) — no `'move'` anywhere |
| Judy's strings, byte for byte | exact | **spot-checked exact**, including apostrophe/quote-character bytes (`xxd`): `reasonTooLong`, `openFolderFailed`, `unavailable`, `unavailableLine`, `noneToMoveBack`, `addBackTip`'s curly-quote wrapper (`“…”`), `Dismiss` title/aria-label. All of these plus the full printed try-it block are also covered byte-for-byte by the unit suite itself (`try-it measure 1/1 fallback/2-5`, `tryit-text.test.js`) — all passing | grep + xxd on the pinned source; cross-checked against `Docs/QuickLaunch_Regions_UXSpec_2026-10-01.md` |

### Crash tests — **finding, Minor**

Ender's brief claims "Crash tests 5/5/4/4/3" — five numbers. The actual driver, `scripts/regions-m3-crash.mjs`, defines exactly **four** parts: `crash-add`, `crash-back`, `restore`, `refusal`. I ran all four independently against the verified build:

- `crash-add`: **5/5**
- `crash-back`: **5/5**
- `restore`: **4/4**
- `refusal`: **3/3** (see note below)

That's "5/5/4/3" — matches the real evidence exactly, but Ender's own tally has an extra, unexplained "4" with no fifth part to attach it to. Every underlying check passes; this is a claim-accuracy slip in Ender's count, not a functional defect. Routed back to Ender to correct the tally in the next report.

**Methodology note on `refusal`:** my first independent run of this part returned 2/3 (the "outside %TEMP%" refusal check failed with `exit: null, ended by timeout` instead of `exit 64`). This was my own test-setup artifact, not a product bug: the script computes its "outside %TEMP%" probe path relative to its own script directory, and I had run it from the pinned copy, which — because the scratchpad itself lives under `%TEMP%` — put the "outside temp" path inside temp, defeating the refusal check's own premise. Re-running that one part directly from the live worktree (content already hash-verified identical to the pinned copy, nothing edited) gave the correct **3/3**, matching Ender's figure. Flagging this so the next QA pass on a pinned copy knows the `refusal` part cannot be trusted from a scratchpad nested under `%TEMP%`.

### Mutation testing — **UNVERIFIED this round**

Tech plan §8.2 claims "Mutation runner | 88/89 caught, unmutated copy 172/172." No mutation-testing tool or script exists anywhere in this worktree (checked `package.json`, `scripts/`, `node_modules/.bin`, no `stryker`, no `mutants.mjs`, nothing under a `tools/` dir). The runner referenced is evidently a one-off, uncommitted harness built by a prior QA pass in a different session's scratchpad, not available here. Building a fresh 89-mutant harness from scratch was not feasible inside this session's timeout without risking a rushed, shallow substitute. Per the brief's own fallback instruction, marking this **unverified** rather than fabricating a number or risking a duplicate/incomplete run.

## 4. Real-input items — NOT RUN (for the next away window)

Per the hard limit (Sergei at the PC, no real OS input this session), the following from the fix pass's scope were not exercised and need a real away-window pass:

- Real Explorer drag-and-drop of desktop icons onto a region (tech plan M3 a–e / Futaba items 1, 4, 5, 10) — self-test's synthetic drop path covers the code path, but never a real `IDropTarget` drag
- Visual, human-eye read of the two-layer banner (`--text` notice over the update offer) in actual rendered light — contrast was checked numerically, not by eye, and no screenshot was taken (no display-setting or capture calls permitted)
- Any interaction requiring a real mouse/keyboard: Win+D, real window focus changes, manual OPEN FOLDER / MOVE ALL BACK clicks from a human
- `tryit-regions.mjs`'s `--print` output was validated for exact text via the unit suite, but not read aloud/walked by a human against real hardware

## 5. F-2

F-2 (fallback blank on real hardware) is out of scope and unchanged by anything observed this pass — no new evidence surfaced here, nothing to add.

## 6. Findings summary

| # | Severity | Finding |
|---|---|---|
| 1 | Minor | Crash-test tally in the brief ("5/5/4/4/3") has one extra, unexplained number; the driver script has 4 parts, not 5. Actual results (5/5, 5/5, 4/4, 3/3) all pass. Route to Ender: correct the count in the next report. |
| 2 | Minor (process note, not a product defect) | Mutation 88/89 could not be independently reproduced this round — no mutation harness exists in the committed tree. Marked unverified per the brief's explicit fallback. |

No Blockers, no Majors. Everything else in Ender's claim list reproduced exactly, independently, with a fresh root and (where relevant) a freshly re-derived build-source match via `asar` extraction rather than trusting a label.

**Pattern alerts:** none
