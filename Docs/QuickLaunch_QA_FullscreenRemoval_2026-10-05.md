# QuickLaunch QA: fullscreen removal, startup clamp, check:hover follow-through, header-art fix (2026-10-05)

**Verdict:** GO

No Critical, no safety-floor failure. One **Major** (persona-5 header art now straddles the theme's fixed plate edge at the default 424 px window) and several Minors are open. Per the severity scale (`Team/Docs/ProcessRules.md` § Severity definitions, not restated here) Majors do not block, but M-1 should be fixed or ruled by Judy before this is committed as "header art fix done".

Design/story flags: Adam / Sergei: when a saved `windowSize` is oversize, the clamp produces an almost-fullscreen window (m-1 below); a reset to the 424x300 default may be what Sergei wants. Judy: M-1 (persona-5) and m-5 (siren). Story/canon: none.

Slice under test: the uncommitted change on `wip/theme-fidelity`, HEAD `ca2e740`, as a pinned snapshot (below). Real-key F11 on the packaged build is **NOT RUN** (listed in section 8).

---

## 1. Pin

Method: `git archive ca2e740` into scratch, the 14 uncommitted files and the 40 theme files overlaid as byte copies, `src/main/fullscreen.js` and `test/fullscreen/*` removed, `node_modules` byte-copied in (no links). Because `check:hover` shells to git, the snapshot got a throwaway `git init` with one commit (explicit pathspecs); that repo is scratch-only. Hashes (first 12 hex of sha256) were verified in the snapshot before any run, and **re-verified in both the live tree and the snapshot at the end**: all 14 files and all 40 themes match, zero mismatches. `git status` of the live repo was 56 entries before and after (I changed nothing there except this report).

```
b14244f83123 Docs/QuickLaunch_Brief.md
f2447116fd66 Docs/QuickLaunch_HoverFix57_Spec_2026-10-02.md
115f235f21cb scripts/theme-gallery/hover.cjs
c8b5e235e532 scripts/theme-gallery/main.cjs
d368b57d9830 scripts/theme-gallery/run.mjs
960970154c5e src/main/ipc.js
04ed96129b27 src/main/preload.js
e33fb11a0304 src/main/window.js
b7c560878f5a src/renderer/app.js
c5f684dcf33b src/renderer/index.html
8b39e0e41676 src/renderer/styles/base.css
1f23309b48a2 test/window/clamp.test.js
907a41579f50 test/window/stub-electron.js
9e8f9bf0d94c test/window/window-save.test.js
```

Themes (`src/renderer/styles/themes/`), all 40 matched:

```
142aebb3e121 2001  07f02542f96a ac-assassins  2c108be42507 ac-templars  7b2b54da4002 akira
105b5ddb9c13 cyberpunk  c89dc389adb7 dead-space  301158722a36 doom-classic  f023693e449f doom-eternal
1f6d90d8cd64 ff10  fda80b8e22e0 ff14  284ece76b222 ff15  8c8e30c76059 ff6  9214cd4994f7 ff7
50b0a75da371 ff8  072d0cab9a66 ff9  72801eb79a90 gryffindor  b68653308648 nonary-games
35ac44e0fa33 parasite-eve  3a90b48e95f1 persona-3  1b813a982d7d persona-4  1a64b5e04a6b persona-5
a9b313bce1ab promise-mascot  fea66a85bd32 shire  94289a6dcbe6 siren  ac9fc0c0517b star-wars-empire
f0abd3f3cd08 star-wars-mando  6f1750e03e0c star-wars-rebel  031152bd580d star-wars-republic
637644707c63 star-wars-separatist  90dd7deac8d0 star-wars-sith  0e58f2db153c swl-dragon
eaff2fa01960 swl-illuminati  7826b368c180 swl-templar  a6e37a0482b5 warhammer
39739ed22c2e warhammer-chaos  3778f88749b2 warhammer-eldar  08931972aae6 warhammer-necrons
74725f7f8d2c warhammer-orks  3e315b22d387 warhammer-tyranids  47de38c49253 yakuza
```

Not in the pin list but part of the diff and checked: the other 61 theme files are identical to HEAD; `scripts/themes-baseline.json` (`ece320b36044`) and `scripts/themes-hover-baseline.json` (`e3566b3a0643`, content `{}`) are untouched by the change and by my runs.

## 2. Ender's claims, reproduced

| Claim | My method | Result |
|---|---|---|
| `node --test test/` is 11/11 | `node --test test/` in the snapshot | **Reproduced: 11 pass, 0 fail** (node v26.10.0) |
| On HEAD the clamp and F11-guard tests fail | HEAD archive + the 3 new test files, `node --test test/window/` | **Reproduced, and more: 8 of 11 fail on HEAD** (5 clamp, the F11 guard, and also 2 of the 3 window-save tests: `resize and move saved after the debounce`, `pending save on a destroyed window`). The 3 passing on HEAD are the "fits / partly off-screen / no saved size" no-op cases. |
| Tests are not decorative | 9 mutations of `window.js` in a scratch copy | F11 swallow removed (1 fail), wrong key (1), clamp height ignored (4), primary-display-only (1), y not moved (3), over-broad F1x swallow (1), destroyed guard removed (1), store rewritten at startup (2). All caught. (My first "rewrites store" mutation was a bogus one-liner and passed; the real one was caught.) |
| `npm run check` exits 0 | `npm run check` in the snapshot, `timeout 600000` | **Reproduced: exit 0.** Contrast: 101 themes, 0 errors, 32 legacy warnings (same 32 as HEAD). Hover: 101 themes, **3,838 pairs**, 0 errors, 0 grandfathered. |
| 3,838 pairs | 38 readings x 101 themes = 3,838; HEAD gives 4,040 (40 x 101). The 202 difference is exactly `hdr-full` hover+pressed on 101 themes. | Reproduced |
| PC1-PC4 fire | Gate output: PC1 1.65:1, PC2 2.32:1, PC3 1.08:1, PC4 1:1, each under its limit | Reproduced |
| `--neuter-control=pc1,pc2,pc3,pc4` VOIDs the run | Ran it | **Reproduced: exit 2, four "VOID: positive control PCn ... did not fail" lines, "RUN VOID (harness failure, exit 2)"** |
| Baselines unchanged | sha256 of both baseline files before and after every gate run; `git diff HEAD --stat` on both | Reproduced: identical, and neither is in the diff |
| tol-0 art-to-button gap equals HEAD on all 40 themes | **Independent method** (see section 5): all 101 themes at 424 and 520 px, art painted extent from a with/without-art pixel diff at 1.5x, controls left from the DOM, HEAD vs snapshot | **39 of 40 reproduced within +0.20 CSS px. NOT reproduced for persona-5 at 424 px (+2.2 CSS px); see M-1.** Cyberpunk: HEAD 61.69 -> 61.89. 2001, akira, ff9, nonary-games, siren, star-wars-republic all +0.20. |
| Hover gate 125.5 s vs 68-72 s is load, not the change | Machine CPU load 83% (32 logical cores) when I started. Snapshot gate: **106.2 s**, then 106.2 s (neuter run), then **80.5 s**. HEAD gate in the same session: **94.5 s**. | **Load, not the change.** The change is not slower (fewer pairs, 3,838 vs 4,040). Note: two runs printed an identical 106.2 s; the gate's own `wall` timer, coincidence assumed, not investigated. The 180 s hard limit is only 1.4x above the 125.5 s Ender saw under load: m-7. |

## 3. Findings

### M-1 (Major): persona-5 header art now straddles the theme's fixed plate edge at the default 424 px window
Repro: any persona-5 launch at the default width 424. Expected: the slashes sit on the black plate as in HEAD. Actual: `persona-5.css` paints the black header block with a jagged right edge at a **fixed 256 px from the left** (`#header { background: ... 256px 0 / 10px 40px ..., linear-gradient(#0A0A0A) 0 0 / 256px 100% ... #D92323 }`). HEAD art box was x 168-252 (4 px clear of the edge). The new `right: 136.67px` puts it at x 203-287, so the art crosses the edge: the red slashes on the red plate part vanish (red on red) and the white slash overlaps the jagged edge. Header-plate-vs-art relation is visibly changed; see `fq/m/sheet-3.png` (row persona-5, left HEAD, right new) in the scratchpad. At 520 px the art was already on the red plate in HEAD, so this is a 424-default-width regression only.
Why nobody caught it: the "gap to buttons" metric is blind to a background plate, and Judy's §7 reviewed 9 of 40 compare sheets. My all-40 sheets (5 contact sheets, HEAD vs new) show persona-5 as the only hard collision. Route: Judy.

### Minor
- **m-1 Clamp of the poisoned size gives a near-fullscreen window.** Seeds `windowSize` 5120x1440 (this display's DIP size, i.e. exactly what F-1 fullscreen saved) with null position, `{0,0}`, `{3000,900}`, `{-3000,-200}` all open at 0,0 sized **5120x1392 (the whole work area)**. It meets the ruling, but with F11 gone the user's way out is a manual edge-drag. Design concern to Adam/Sergei: reset to default 424x300 instead? (A clamp is idempotent; the stored value stays poisoned until the first resize.)
- **m-2 Stale position after a clamp.** After the clamped open, a user resize saves `windowSize` only (position is saved only by `moved`). Seed 5120x1440 @ (3000,900): clamped window sits at 0,0; after a resize the file holds 700x500 @ **(3000,900)**; next launch the window opens at 3000,900 and its bottom (1400) is 8 px past the work area (1392). Pre-existing save design, newly reachable through the clamp.
- **m-3 Non-numeric `windowSize` is unvalidated and the clamp changes one case.** `store.js` and `save-settings` never validate it. Seeds `{width:"abc"}`, `{width:500}`, `{width:0,height:0}`, `{-5,300}`, `{width:"a" position}`: new and HEAD behave the same (no crash). **`{width:null,height:null}`: HEAD opens 800x600, new opens 0x0** (`Math.min(null, wa)` = 0; Electron then raises it to the 180x150 minimum on show). Unlikely file, but a one-line `Number.isFinite` guard would remove it.
- **m-4 The F11 guard relies on the default application menu staying consistent.** The app sets no menu, so Electron's default menu is live and still contains `Toggle Full Screen` (role `togglefullscreen`). `before-input-event` prevents it in all 14 injected cases (section 4), but the menu item and `fullscreenable` are untouched. Question for Ender (not an action): `fullscreenable: false` or `Menu.setApplicationMenu(null)` would make "F11 does nothing" structural rather than input-filter-dependent. The real accelerator path is not reachable by `sendInputEvent`/CDP: NOT RUN.
- **m-5 siren art off-centre in its zone.** Siren's blue panel divider is fixed in the background; the art moved 35 px right and now floats further from the divider (gap to buttons unchanged). Cosmetic, Judy.
- **m-6 Sub-pixel: +0.20 CSS px on 39 themes.** The removed button's measured width differs slightly from the 29.33 constant in this environment (controls shift 35.53 vs art shift 35.33). Invisible. The constant was font-dependent in HEAD (the glyph was a fallback font); now it is a fixed historical number, as Judy's addendum says.
- **m-7 Hover gate wall time margin.** 125.5 s under another Ender's load is ~70% of the 180 s hard limit; this machine was at 83% CPU when I measured 106 s. A heavy build alongside `npm run build`/`release` (prebuild runs it) can reach exit 2 for time, not for a defect.
- **m-8 No CHANGELOG entry** for a user-visible removal (button, F11 row, window-size behaviour). For Sully at release time.
- **m-9 (note, by design)** A saved position that overlaps a display by at least 100x50 is kept even if most of the window is outside (seed 424x300 @ (4900,1300): window ends at x 5324 / y 1600 on a 5120x1392 work area). Covered by an existing test; not oversize, not changed by this work.

### Info
- Esc ladder is identical to HEAD with Settings open (section 4). Settings with the skin field focused takes two Esc presses (list/field, then Settings): same as HEAD, per the skin-picker spec.
- Only one display on this machine: second-display clamp was exercised by the stub unit test only. NOT RUN live.

## 4. Running isolated instance (real `src/main`, real preload, tray-Quit)

Harness: a byte copy of `scripts/qa/quicklaunch-real-main-smoke.cjs` (two env hooks added in scratch: seed settings, and keep real window x/y for a never-shown, non-activating, hidden window). Own profile per launch, no hotkey, no login item, no network, input only via `webContents.sendInputEvent` and CDP `Input.dispatchKeyEvent` / `executeJavaScript`. Guards read 0 on every launch (focus, hotkey, dialogs, shell, login item).

**F11, both injection paths, six states** (rest, Settings open, Settings + skin field focused, edit mode + rename input focused, filter chip showing, cheat sheet over Settings): `before-input-event` saw F11 and prevented it **12 of 12**; the renderer saw F11 **0 times**; `setFullScreen` calls **0**; `isFullScreen()` false; bounds unchanged. **Positive control (same scenario on HEAD):** the renderer sees F11 in every state, `setFullScreen` is called in 4 of 6 states, bounds change on CDP injections, the Fullscreen button, F11 cheat row, `toggle-fullscreen`/`exit-fullscreen` handlers and the "fullscreen" cheat text are all present. So the probe can detect what it claims to.

**Esc ladder** (filter + edit mode + Settings + cheat sheet, one Esc each): cheat sheet, then Settings, then filter, then edit mode, then nothing (Esc 5 and 6 inert). Matches HEAD's order minus the removed fullscreen layer.

**Leftovers:** no `#btn-fullscreen`, no U+26F6 glyph, no `title`/`aria-label` containing "full", no "F11"/"fullscreen" in page text or HTML. `window.api.invoke('toggle-fullscreen')`, `invoke('exit-fullscreen')`, `on('fullscreen-changed')` all throw `Blocked IPC channel`. Main-process handlers matching `/full/i`: none. Default menu: present, one fullscreen item (m-4).

**Cheat sheet rendered** (screenshot `fq/live/out-f11-new/01-rest/cheatsheet.png`): rows are CTRL+SPACE, ARROWS, ENTER, A-Z/0-9, BACKSPACE, **ESC "Step back: panel, filter, edit mode"**, ?, RIGHT-CLICK. The F11 row is gone; the Esc row reads correctly. Closes the gap Judy's §7 left open.

**Clamp** (display 5120x1440 DIP, work area 5120x1392, one display, scale 1.5):

| Seed (windowSize @ windowPosition) | Opened at | In work area | File at open / +2.2 s |
|---|---|---|---|
| 5120x1440 @ null | 0,0 5120x1392 | yes | unchanged / unchanged |
| 5120x1440 @ 0,0 | 0,0 5120x1392 | yes | unchanged / unchanged |
| 5120x1440 @ 3000,900 | 0,0 5120x1392 | yes | unchanged / unchanged |
| 5120x1440 @ -3000,-200 | 0,0 5120x1392 | yes | unchanged / unchanged |
| 8000x3000 @ 100,100 | 0,0 5120x1392 | yes | unchanged / unchanged |
| 3000x1440 @ 4000,50 | 2120,0 3000x1392 | yes (x moved just enough) | unchanged / unchanged |
| 424x300 @ -20000,-20000 (off display) | 4676,1072 (default bottom-right) | yes | unchanged / unchanged |
| 424x300 @ 4900,1300 (partly off) | 4900,1300 (kept, m-9) | no, by design | unchanged / unchanged |
| 600x500 @ 100,100 (fits) | 100,100 | yes | unchanged / unchanged |

No `resize`/`moved` event fired after open, so nothing was written; the stored oversize value survives startup in every case, as required. A later user resize writes the real size (m-2).

**Regression smoke** (rest, settings, edit, cheat, picker, filter, skin, parked, flow): 9/9 launches exit 0 via the real tray "Quit QuickLauncher", renderer errors none, 0 leftovers, registry Run/StartupApproved unchanged. Also run before that: single-launch F11 and Esc scenarios, both exit 0 via tray Quit.

## 5. Header-art independent measurement

`fq/m/measure.cjs` (scratch): per theme, offscreen never-shown window at 1.5x, `Page.captureScreenshot` with and without `#header::after` (hidden via `insertCSS`, because the page CSP blocks injected `<style>`), painted art columns = columns that differ; controls left from `getBoundingClientRect`. 101 themes x widths 424 and 520, HEAD vs snapshot.
- 40 modified themes: art present in HEAD and new for all 40; gap delta +0.20 CSS px on 39, **+1.53 to +2.2 on persona-5 at 424 only** (art extent changes from 125 to 122-123 columns because the art now crosses the plate edge; at 520 it is +0.20 with identical 97 columns).
- 61 unmodified themes: no `::after` art in HEAD or new (they use the legacy flavour-text rule; its slack grew from 12 px to 47 px, as base.css says).
- Pixel diff of the header at x < 240 px (modified) and x < 413 px (all themes), all 101: **0 differing pixels**, so nothing left of the cluster changed.

## 6. Census

Before (14:3x): 16 `QuickLauncher.exe`: Sergei's installed 4 (PIDs 30760 23324 31752 41564, `...\Programs\QuickLauncher\`) plus 12 from an Ender's `QuickLaunch-regions-spike\dist\win-unpacked` M4 instance (PID 91208 tree). `electron.exe`: none.
After: the same 4 Sergei PIDs alive and untouched; 16 `QuickLauncher.exe` in total (the M4 instance relaunched during my session, not mine); **`electron.exe` owned by me: 0** (every command line containing my scratchpad path: 0). HKCU Run and StartupApproved\Run: unchanged (checked by the gate, by every harness launch, and the Run value count by `reg query`). No `.url` or browser launched, no `npm run build`/`release`, no registry or display-setting write, no real OS input.

## 7. Process slip (mine)

While building the independent measurement I started a scratch Electron main whose RegExp lost its backslashes (heredoc/escape error in a template literal). Run as an Electron main process it had no `uncaughtException` handler, so Electron showed its default **"A JavaScript error occurred in the main process"** dialog on Sergei's screen, twice (two parallel launches). **That dialog was mine** (`scratchpad/fq/m/measure.cjs:15`, matches the stack the coordinator quoted). Cause chain: no handler before the throwing line, no `dialog.showErrorBox` stub, a syntax check never run on the file, and I launched two copies in parallel before one ran. Orphans: the two Electron mains (PIDs 104080 and 80160) and their four helper children sat behind the dialogs; I closed them by PID and verified 0 remain (the coordinator's census of 13 `electron.exe` was these 6 plus the 7 of the M4 instance, which is not mine). Fixes now in the script: `uncaughtException`/`unhandledRejection` log to a file and exit, `dialog.showErrorBox` stubbed, `node --check` before every launch, one smoke theme before the full run. The maintained harness already had these; my own script did not.

## 8. NOT RUN, for the next away window

1. **Real-key F11 on the packaged build** (needs a real OS key; the accelerator path of the default menu is not reachable by injection): confirm F11 does nothing in a text field, in Settings, and at rest, and that no menu bar / fullscreen appears.
2. Real window opening from a poisoned data file on the packaged build (visible check of m-1, the almost-fullscreen window) and a real edge-drag resize/relaunch (m-2).
3. Second display clamp live (this machine has one display); unit-tested with stubs only.
4. Win+Up / snap / maximize on the frameless transparent window and what size it saves (not an F11 path, but another route to a large saved size).
5. M-1 on the packaged build at 424 px after Judy's ruling.

## Pattern alerts:

1. **A uniform constant over 40 themes meets themes with fixed-geometry plates.** The `172 -> 136.67` edit assumed the art only relates to the buttons. Persona-5 ties its art to a hard-coded 256 px plate edge; siren to a fixed divider. A review that only measures "gap to buttons" and looks at 9 of 40 sheets will miss this class. Ask for an all-themes before/after contact sheet on any bulk theme edit.
2. **Metric blind spot, same as the hover gate's earlier history:** "equal to HEAD" computed against a bare-header reference counts only pixels that differ from the background, so red art on a red plate counts as absent.
3. **Agent shell environment has `ELECTRON_RUN_AS_NODE=1`.** Any Electron script launched from it silently runs as plain node ("Cannot find module 'electron'") unless the variable is unset (`env -u`). The maintained harness and the gallery runner delete it; hand-written launchers will not. This is how the first of my two launches failed quietly and the second reached the dialog.
4. **Electron main-process scripts without an `uncaughtException` handler put a modal on Sergei's screen.** Already a rule in the harness; hand-rolled helpers keep forgetting it.
5. **A hook blocks `rm -rf` and `git add -A` even on throwaway scratch**; scratch scripts need explicit pathspecs and no recursive deletes (cost me three re-issued commands).
