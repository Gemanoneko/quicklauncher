# QuickLaunch — UX Review & Redesign Spec (2026-04-25)

**Reviewer:** Judy (UX Designer)
**Version reviewed:** 1.93.5 (HEAD on `main`)
**Stage:** Daily Use / Maintain
**Calibration:** Desktop utility / Microsoft Fluent baseline. Anti-pattern reference: casual-game UX.
**Status:** Spec only. Ender implements. Sergei approves before any change ships.

---

## Summary — Top Findings

1. **No keyboard accelerators.** The grid is a mouse-only surface today. There is no global show/hide hotkey, no in-grid arrow-key navigation, no type-to-filter, and no `?` cheat-sheet. For a tray-resident utility opened many times per day this is the single biggest friction point.
2. **`--text-dim` (alpha 0.45) systemically fails WCAG 2.2 AA at body sizes.** The version label (10 px), settings labels (10 px), drop-hint sub-text (9 px), and picker placeholder all use `--text-dim` or `--hint-sub-color` (alpha 0.20). Effective contrast lands in the 2.5–3.5:1 range across nearly every theme — under 4.5:1 normal-text minimum.
3. **Several themes ship accent-as-text colors that fail AA**, notably the red/scarlet accents used for titles in `doom-eternal`, `gryffindor`, `akira` (~3.5–4.2:1 against near-black backgrounds where the title `QUICK.LAUNCH` is rendered). Title text is 11 px — below the "large text" exemption.
4. **Persistent ambient animation on the chrome.** A 4-second `border-pulse` runs forever on `#app::before`, plus a 3-second `hdr-bar-pulse` on the header sidebar, plus periodic title `glitch-title`, plus per-theme background animations on `#particles`. Per WCAG 2.2 (motion >3s requires pause/stop/hide) and per the studio's own anti-patterns ("persistent ambient animation"), this is over-budget for a utility.
5. **Silent failure when a launched target is missing.** `launch-app` returns without a word to the renderer if `shell.openPath` fails or the file no longer exists. The user clicks, nothing happens, no recovery affordance. NN/g "help users recover from errors" failure.

---

## Decisions Locked In (2026-04-25)

Sergei reviewed and ruled on every open question from the first draft. These are canonical for Ender's implementation:

1. **Default global hotkey is `Ctrl+Space`.** User-rebindable in settings; do not hardcode forever, but `Ctrl+Space` is the shipped default.
2. **Random-theme on startup keeps current behavior** — pick any theme on launch, no favorites filter. Favorites can still exist as a manual-pick convenience (see §8) but they do not gate random selection.
3. **Number-key launch is dropped entirely.** No `1`–`9` shortcut, no tile digit badges, no `showNumberBadges` setting. Out of scope — not deferred.
4. **`btn-remove` is 24×24** (strict WCAG 2.2 AA). The 22 px corner-badge alternative is rejected.
5. **Light mode / OS theme respect is not needed.** QuickLaunch's theme system is the only theme path. §9 stays deferred indefinitely unless Sergei reopens it.
6. **Contrast linter gates on new/changed themes only**, warns on legacy. Pre-existing failures across the ~110 shipped themes do not block builds; any newly added theme or any existing theme modified in the current commit must pass AA.

---

## Current State

QuickLaunch is a frameless, semi-transparent Electron window pinned to the bottom-right by default (424×300), with a 40 px header, a tile grid using `auto-fill, minmax(--icon-size + 32px, 1fr)`, a 44 px theme banner, and a 38 px edit bar that appears in edit mode. Default `--icon-size: 64`, slider 32–128. Tray double-click toggles visibility; the tray right-click menu is `Quit / Show-Hide / Check for Updates`. Themes (~110) live in `src/renderer/styles/themes/`; one is randomly selected on startup unless disabled. The app uses `'Segoe UI', 'Consolas', monospace` as the base font, with several themes overriding to `Consolas`, `Georgia`, `Arial`, or other monospace stacks. Most themes use `text-transform: uppercase` and tight letter-spacing on labels.

Single-instance lock works; auto-launch is registered for packaged builds when `startWithWindows` differs from the registered state. There is no global show/hide hotkey in source — the brief overstates this and the spec corrects below.

---

## Findings & Recommendations

### 1. Layout & Information Hierarchy

**Current.** Header (40 px) → grid (flex 1, 16 px padding) → theme banner (44 px) → edit bar (38 px when active) → update banner (38 px when active). Grid columns: `minmax(96px, 1fr)` at default icon size. Gap between tiles: 4 px.

**Findings.**
- Tile gap of **4 px is too tight** for visual grouping at default density. Per Material 3 8 dp grid and Law of Proximity, related-but-discrete items want 8–12 px between them. 4 px reads as a single grid block, harming scan speed.
- The 44 px theme-banner footer is **always visible** and consumes 14% of vertical space at the default 300 px window height. The flavor quotes are decorative, not functional. They cycle on a `bannerInterval` and add motion below the user's gaze.
- The eye lands first on `#title` (top-left, animated, accent-colored, glow). Per Fitts's Law and Jakob's Law, that's correct for a desktop window. The grid is the actual workhorse but is visually quieter than the header — fine for a tool used for muscle memory.

**Recommendations.**
- **Gap:** 8 px between tiles (was 4 px). Keep `--grid-pad: 16px`.
- **Theme banner:** make optional. Add `showThemeBanner: boolean` setting (default `true` so existing behavior is unchanged). When off, that 44 px reverts to grid space — meaningful gain for Sergei's small default window.
- **Banner cycle interval:** confirm the current cadence with Ender; if it cycles faster than every ~8 seconds it is borderline distracting per WCAG motion. (Recommendation: ≥8 s between changes; fade ≤300 ms.)
- **First-run hierarchy:** unchanged — the existing top-left accent title is correct for the form factor.

### 2. Click Targets & Sizing

**Current.** Header buttons (`#header-controls button`): `padding: 2px 7px; font-size: 13px;` rendering at roughly **20×24 px**. The hide/settings/fullscreen/random-theme buttons are decorative-glyph (`⚙`, `⛶`, `⚄`, `╌`).

Tiles: at default `--icon-size: 64`, the column min-width is 96 px and tile padding adds ~10 px vertical → tile is well over the 24×24 minimum. Tile is fine.

`btn-remove` (×) on tiles in edit mode: **17×17 px**. Below WCAG 2.2 AA 24×24 minimum.

`.update-dismiss` (✕): inherits 11 px font + `padding: 2px 5px` → roughly **18×20 px**. Below minimum.

Slider thumb (`#slider-icon-size`): native `<input type="range">`, height 4 px track, default browser thumb. Should be acceptable but worth verifying against Fluent native control sizing.

**Recommendations** (CSS targets — Ender to translate):
- **Header buttons:** raise to minimum **28×24 px** rendered. `padding: 4px 8px; min-width: 28px; min-height: 24px;`. Maintains compact appearance, satisfies WCAG 2.2 AA.
- **`btn-remove`:** raise to **24×24 px** with the visible glyph centered (strict WCAG 2.2 AA). Sergei's call — accept the slightly larger corner badge over the tighter 22 px aesthetic.
- **`.update-dismiss`:** raise to **24×24 px**.
- **Tile geometry at min icon size (32 px):** computed tile floor stays ≥40 px tall — fine. No change needed.

### 3. Typography & Legibility

**Current.** Base font `'Segoe UI', 'Consolas', monospace` is sensible (Segoe UI is the Windows system font; the monospace fallback is unusual but harmless when Segoe UI is available, which it always will be). Per-theme overrides include serif (`Georgia` in `gryffindor`, `hufflepuff`), all-monospace (`Consolas` in `cyberpunk`, `matrix`, `tron`, `alien`, `pip-boy`), and sans (`Arial` in `lcars`, `Segoe UI` in many others).

Body sizes: tile labels **12 px**, title **11 px**, picker rows **10 px**, settings labels **10 px**, drop-hint sub **9 px**, version **10 px**.

`text-transform: uppercase` plus `letter-spacing: 1.5–2px` is set per-theme on tile labels (and the rename input drops to **10 px**).

**Findings.**
- **9 px and 10 px body text is too small** for sustained desktop reading. Microsoft Fluent's minimum body size is 12 px for English UI. Tile labels at 12 px are OK; *everything else* is below.
- **All-caps + 1.5–2 px letter-spacing on 10 px labels** measurably hurts scan speed (Larson & Carter, Microsoft Type research; NN/g UI Copy guidance — sentence case scans faster than ALL CAPS for any text longer than a single word). Acceptable as a *theme aesthetic* on accent labels, but applying it to functional copy (settings labels, picker rows) compounds the small-size problem.
- **Italic serifs in `gryffindor` / `hufflepuff` at 12 px** drop legibility further. Daily-use cost.

**Recommendations.**
- **Body floor:** `font-size: 11px;` only on accent/decoration. **Functional text** (settings labels, picker rows, version, drop hint sub, picker empty state) → minimum **12 px**.
- **Rename input:** raise from 10 px to **12 px**. The user is editing words; small text + uppercase + letter-spacing is genuinely hard to read.
- **Letter-spacing:** keep on the title (`#title`) and theme-banner text as decoration; **drop letter-spacing > 1 px** from `setting-row label`, `.checkbox-label`, `.picker-item-name`, `.picker-empty`, `.theme-picker-item`. Keep `text-transform` per-theme but only on tile labels and titles, not on settings copy.
- **Italic serif themes:** add `font-style: normal` for `setting-row label`, `.picker-item-name`, `.theme-picker-item` so Settings panel copy stays legible when the theme is `gryffindor`/`hufflepuff`/etc. (Body of the Settings panel is functional; flavor belongs in the title and the tile labels.)
- **Font fallback:** standardize the base font stack on `'Segoe UI', system-ui, sans-serif`. The `monospace` fallback in the default `--font` is incongruous on Windows when Segoe UI fails (it won't, but it's a code smell).

### 4. Color & Contrast — Per-Theme Audit

**Method.** Computed APCA / WCAG 2.x ratios for `--text` on `--bg`, and accent-as-text where the accent is used at body or title size. Spot-checked the 12 representative themes below; the patterns generalize across the 100+ in the repo.

| Theme | `--text` on `--bg` | Verdict | Notes |
|---|---|---|---|
| `cyberpunk` | `#c8f0ff` on `#040210` | ~17:1 — pass | Strong. |
| `pip-boy` | `#78A800` on `#020500` | ~7:1 — pass | Strong. |
| `lcars` | `#FFCC44` on `#000000` | ~13:1 — pass | Strong. |
| `matrix` | `#00CC33` on near-black | ~6.5:1 — pass | OK at body; accent green identical. |
| `tron` | `#A8E0F0` on `#000814` | ~14:1 — pass | Strong. |
| `warhammer-orks` | `#88AA44` on `#040800` | ~6:1 — pass | OK. |
| `star-wars-empire` | `#909AA8` on `#050507` | ~6.5:1 — pass | OK. |
| `portal` | `#3A4050` on `#D8D8DE` | ~9:1 — pass | The only legible **light-theme** today. |
| `alien` | `#30BC30` on `#000200` | ~7:1 — pass | OK. |
| `hufflepuff` | `#C09040` on `#030200` | ~6:1 — pass | Border-passing; serif italic at 12 px is the bigger issue (see §3). |
| `gryffindor` | `#C08040` on `#040100` | ~5.5:1 — pass | Body OK. **Accent `#C41E2A` (scarlet) on near-black ≈ 3.5:1 — fails at 11 px title.** |
| `doom-eternal` | `#D07878` on `#080204` | ~5:1 — pass | Borderline. **Accent `#E02020` ≈ 4.0:1 — fails at title.** |
| `akira` | `#C8B8A0` on `#080004` | ~9:1 — pass | Strong body. **Accent `#E01020` ≈ 4.2:1 — fails at title.** |

**Systemic failures (all themes).**
- **`--text-dim`** is defined in `base.css` as `rgba(196, 212, 232, 0.45)`. On the cyberpunk near-black background this composites to approximately `#828F9C` → **~5:1**, marginal. Theme-specific overrides drop it lower. Used at 9–10 px (`#header-version`, `.setting-label`, `.setting-row label`, `.picker-empty`, `.update-dismiss`, picker placeholder, drop-hint outer). At 10 px this is **normal text** under WCAG and must hit 4.5:1.
- **`--hint-sub-color`** is `rgba(0, 240, 255, 0.20)` in cyberpunk → composites to roughly `#0A3540` on the body bg → **~2.5:1**. Renders the drop hint's "or RIGHT-CLICK to enter edit mode" text near-invisible. Fails AA decisively.

**Recommendations.**

*Global (in `base.css`):*
- Define a contrast floor as a non-overridable rule. Document in a comment: "Theme stylesheets MUST keep `--text` ≥ 4.5:1 against `--bg`, and any color used for body-size text ≥ 4.5:1 against the background it lands on."
- **Replace `--text-dim` with `--text-secondary`** at full opacity, computed per theme to land at 60% perceived lightness against `--bg` while maintaining ≥4.5:1 contrast. Stop using rgba alpha for "dim" — alpha + transparent backgrounds compound unpredictably.
- **Replace `--hint-sub-color` rgba(…, 0.20) with a flat color** computed against `--bg` to land at ≥3:1 (it's decorative hint-text — large text exemption applies if the hint is set to ≥18 px or 14 px bold; otherwise full 4.5:1).

*Per-theme:*
- `gryffindor`, `doom-eternal`, `akira`, and any theme using a saturated red as `--accent-c` for the title: bump the title color or add a darker text-shadow halo for the title specifically. Acceptable solutions: (a) brighten the accent to ≥ #FF3344 / #FF3030 / #FF3030 respectively; (b) keep the accent for borders/glows but render `#title` in `--text` for that theme.
- `doom-classic` and any similarly-keyed theme: audit before next release. (Ender to grep for `--text` and `--bg` per-theme; Judy to validate contrast pairs in batch.)

*Build-time linter (`scripts/check-theme-contrast.js`) — gate on new/changed, warn on legacy.* Per Sergei's decision: pre-existing failures across the ~110 shipped themes do not block the build; any newly added theme or any existing theme modified in the current commit must pass AA.

Implementation hint for Ender:
- Compare current theme files against the previous git revision (`git show HEAD:src/renderer/styles/themes/<file>`) **or** against a checked-in `themes-baseline.json` snapshot of `{themeName: contentHash}` updated by maintainers when legacy debt is paid down. The git-diff approach is simpler and self-maintaining; the snapshot approach is more deterministic in CI without full history. Pick one.
- Output two lists each run:
  - **`warnings (legacy)`** — themes unchanged since baseline that fail AA. Printed to stdout, never fail the build.
  - **`errors (new/changed)`** — themes added or modified in this commit that fail AA. Build fails iff `errors.length > 0`.
- Exit code: `0` when `errors.length === 0` (warnings allowed); `1` otherwise.
- Run as a `prebuild` npm script and as a step in any CI release workflow.

### 5. Motion & Feedback

**Current.** Multiple persistent animations:
- `#app::before` `border-pulse 4s ease-in-out infinite` — always running.
- `#header::before` `hdr-bar-pulse 3s ease-in-out infinite` — always running.
- `#title` `glitch-title 8s steps(1) infinite` — always running.
- `.picker-loading` `blink-dim 1.2s step-start infinite` — only while loading. OK.
- `#theme-banner::before` `var(--banner-icon-anim, none)` — per-theme; many themes set animations.
- `.app-tile::before` sheen `tile-sheen .45s ease-out forwards` on hover — single-shot. **OK.**
- `.app-tile:active { transform: scale(0.96); }` — instant. **OK.**
- Per-theme `#particles` background animations.

**Findings.**
- Three persistent decorative animations at all times exceeds the WCAG 2.2 motion threshold (anything >3s should provide pause/stop/hide). Per the studio anti-patterns: "persistent ambient animation … distracting in a focus tool."
- Hover sheen and active-state press are correct — single, brief state changes.
- Title `glitch-title` is a once-per-8-seconds full-second jitter. On a tool the user opens and closes dozens of times per day, this becomes a tic in peripheral vision.

**Recommendations.**
- **Add a single setting:** `reducedMotion: boolean`, surfaced as `REDUCE MOTION` in the Settings overlay. When on (and also when `prefers-reduced-motion: reduce` is detected): set `--title-anim: none`, `border-pulse`, `hdr-bar-pulse`, banner-icon animations, and theme-specific `#particles` animations to `animation: none`.
- **Default `prefers-reduced-motion` respect** even without the explicit setting — this is the OS-correct behavior on Windows 11 when "Show animations in Windows" is off.
- **Keep:** hover sheen, tile-press scale, entrance fade. These are functional feedback.
- **Banner cycle interval:** confirm ≥ 8 s and fade ≤ 300 ms; if the current implementation cycles faster, raise it.

### 6. Keyboard Accelerators — The Big One

**Current state of keyboard support.** Minimal:
- `Escape` exits fullscreen (renderer-scoped — good, fixed in 1.93.x).
- `Escape` exits edit mode.
- Theme picker has `ArrowUp` / `ArrowDown` / `Enter` / `Escape` inside the search input. **Good.**
- Rename input: `Enter` commits, `Escape` cancels. **Good.**
- **No global show/hide hotkey** anywhere in source. The brief overstates — there is none.
- **No grid keyboard navigation.** Tiles are not focusable, no `tabindex`, no arrow-key handling, no Enter-to-launch.
- **No `?` overlay.**
- **No type-to-filter.**

**Why this matters.** Per NN/g Accelerators: keyboard shortcuts are the single biggest divider between "tolerable" and "fast" for daily-use tools. QuickLaunch is opened, used for ~2 seconds, dismissed — a keyboard-first user spends 800 ms of those 2 seconds reaching for the mouse.

**Recommendations** — in priority order:

**A. Global show/hide hotkey** (Important).
- **Default: `Ctrl+Space`** (Sergei's decision, 2026-04-25). Free system-wide on stock Windows 11 (`Win+S` is Search, `Win+Space` is the input-language switcher). Conflicts inside some editors are acceptable for a global launcher — focus is on the OS layer, not editor focus.
- **User-rebindable.** Add a setting `globalHotkey: string | null` so Sergei (or any user) can change or disable the binding. `Ctrl+Space` is the shipped default, not a hardcoded forever-binding.
- Implementation note for Ender: this **does** require `globalShortcut` (the only Electron mechanism that works while QuickLaunch is hidden / not focused). Per Senua's review, register it on `app.whenReady`, unregister it on `app.on('will-quit')`, and re-register on settings change.
- Show window: also restore from minimized + focus + position over the cursor's display (multi-monitor).

**B. Grid keyboard navigation** (Important).
- Tiles: add `tabindex="0"` and `role="button"`.
- On window show: focus the first tile (or last-launched tile — see below).
- Arrow keys: move focus across the 2D grid (compute columns from `clientWidth` / tile width).
- `Enter` or `Space`: launch the focused tile.
- `Delete` (in edit mode): remove the focused tile (with the confirmation that already exists).
- Visible focus indicator: add `.app-tile:focus-visible { outline: 2px solid var(--accent-c); outline-offset: 2px; }` — per WCAG 2.2 "Focus Visible" SC and "Focus Not Obscured" SC.

**C. Type-to-filter** (Important).
- When the window has focus and no input is active, **typing letters** filters the visible tiles by name (case-insensitive substring; expand to fuzzy later if needed).
- Visible state: a slim filter chip near the title shows the typed string with an `×` to clear; `Escape` clears it.
- `Enter` launches the first visible tile.
- This is *not* a system-wide search (the brief excludes that) — it's an in-grid filter only. Different scope, much higher value than full search.

**D. Cheat-sheet overlay** (Polish).
- `?` opens a translucent overlay listing the current shortcuts. Closes on `Escape`, `?`, or click-out.
- This is the discovery surface for everything in B–C.

**E. Echo OS conventions** (Polish).
- `Ctrl+,` opens Settings (already wired to the cog button — just bind the shortcut).
- `Ctrl+W` and `Esc` (when no overlay/edit-mode active) hide the window.
- `F11` toggles fullscreen (already there as a button — bind the shortcut).

### 7. Tray Behavior & System Integration

**Current.** Tray double-click toggles visibility. Right-click menu: `Quit / Show-Hide / Check for Updates`. Single-instance lock works.

**Findings.**
- Three menu items is leaner than the desktop convention of 3–5 actions plus Settings/Quit. The menu is currently missing **Settings** and a **launch-on-startup toggle**, both of which a user reaches for at exactly the moment they're right-clicking the tray.
- The menu order is slightly off-convention: destructive actions (Quit) should sit at the bottom, not the top.
- No tray-icon state communication. Per tray-app conventions (see research), the icon can convey live state — here that's "update available." Currently there's no visual cue in the tray when an update has been downloaded.

**Recommendations.**
- **Reorder and expand the tray menu:**
  1. `Show / Hide`
  2. `Settings…` (opens the existing overlay)
  3. `Start with Windows` (checkbox toggle reflecting the setting)
  4. `Random theme on startup` (checkbox toggle)
  5. *separator*
  6. `Check for Updates`
  7. *separator*
  8. `Quit QuickLauncher`
- **Update-available indicator:** when an update has been detected and is awaiting user action, swap the tray icon to a variant with a small accent dot, and update the tooltip to `QuickLauncher — update available`. Revert on update install or dismiss.
- **Single-instance behavior already restores + focuses** post-1.93 fix — good; keep.

### 8. Theme System Polish

**Current.** ~110 themes. `randomTheme: true` by default — startup picks any theme other than the previous. Theme picker is a search input → dropdown.

**Findings.**
- Random-on-startup is fun but **surfaces unreadable themes** (per §4 — themes with sub-AA accents become the daily theme and Sergei has to manually swap).
- The theme list is currently flat alphabetical (sorted by display name). With 100+ entries, this is a Hick's Law problem when picking deliberately.
- No "favorites" or "recently used" — you cannot pin the 5–8 themes you actually like.

**Recommendations.**
- **`favoriteThemes: string[]` setting.** When set, random-on-startup picks only from the favorites list. When empty, falls back to current behavior (random across all).
- **Theme picker layout:** when favorites exist, show a `★ FAVORITES` header section above the full list. One click distance to a curated subset.
- **Star icon on each picker item** to toggle favorite status. Clicking the star does *not* dismiss the picker (so multiple can be set in one session).
- **Contrast-failure exclusion** (lower priority but high value): once the linter from §4 exists, exclude any theme that fails AA from random selection by default. Add `allowLowContrastThemes: false` (default) so Sergei can opt in.

### 9. Dark Mode / OS Theme Respect

**Current.** Theme cycling is the only mode. The app does not consult `nativeTheme` / `prefers-color-scheme`.

**Findings.**
- For a tool whose entire identity is themes-as-skins, full OS-theme inheritance is wrong. But there's a middle ground that is currently absent: when the OS is in **light mode**, Sergei may want the app to default-to-light or at least pick a light-friendly theme.
- Of ~110 themes, `portal` is the only deliberately light one I sampled. Most are intentionally dark. So OS-light users ship with a theme palette tuned for dark mode by default.

**Recommendations.**
- **Defer this** unless Sergei specifically uses Windows in light mode. The current behavior (always-dark tinted themes regardless of OS) is internally consistent and not a defect for a dark-mode user.
- **If light-mode adoption matters:** add `respectOSTheme: boolean` (default off), which on light mode picks from a curated set of light-friendly themes. This is a feature, not a fix — add to backlog only if Sergei flags it.

### 10. Error & Empty States

**Current.**
- Empty grid (no apps): renders `#drop-hint` with `DROP .EXE OR .LNK HERE` / `or RIGHT-CLICK to enter edit mode`. **Reasonable copy.** But the sub-text uses `--hint-sub-color` at alpha 0.20 — illegible (see §4).
- Missing target on launch: `launch-app` returns silently. The user clicks, nothing happens, no message. **Major NN/g failure** ("help users recover from errors").
- Save error: `store.on('save-error')` → renderer banner `SAVE ERROR — SETTINGS MAY NOT PERSIST`. **Good — already in place.**
- Update errors: shown via update banner. **Good.**

**Recommendations.**
- **Verify file existence on launch.** In `launch-app`, before `shell.openPath`, check `fs.existsSync(filePath)`. If missing, send an IPC event back to the renderer: `launch-error` with `{ id, name, path }`.
- **Renderer response:** show a transient banner `COULD NOT LAUNCH "<name>" — TARGET MISSING`, with two actions: `LOCATE…` (opens file picker, replaces the path on selection) and `REMOVE` (drops the entry). Auto-dismiss after 8 s.
- **Visual indicator on stale tiles.** If a tile's target is known-missing (after a failed launch), apply `.app-tile.stale` with a 50% icon opacity and a subtle `--accent-m` dashed border. Cleared when the path is re-located or the tile is removed.
- **Drop-hint sub-text contrast fix** — see §4.
- **Empty edit-mode state** (apps deleted): currently shows the empty edit bar with no copy in the grid. Add `NO SHORTCUTS — DRAG IN AN .EXE OR USE + INSTALLED` as a placeholder.

---

## Severity-Ranked Backlog

### Critical — fix before next minor release

| # | Item | Section |
|---|---|---|
| C1 | `--text-dim` and `--hint-sub-color` fail WCAG 2.2 AA at 9–10 px | §4 |
| C2 | Accent-as-text colors fail AA in `gryffindor`, `doom-eternal`, `akira` (and any other red-keyed themes — audit needed) | §4 |
| C3 | Silent failure on missing launch target — no user feedback | §10 |
| C4 | No focus indicator on any focusable surface | §6, §3 |

### Important — schedule into the next 2–3 minor releases

| # | Item | Section |
|---|---|---|
| I1 | Global show/hide hotkey (`Ctrl+Space` default, settings-rebindable) | §6A |
| I2 | Grid keyboard navigation (tabindex, arrow keys, Enter, focus indicator) | §6B |
| I3 | Type-to-filter the visible grid | §6C |
| I4 | Reduce-motion setting + `prefers-reduced-motion` honoring | §5 |
| I5 | Tray menu expansion + update-available icon state | §7 |
| I6 | Body-text floor of 12 px for functional copy; drop letter-spacing on functional copy | §3 |
| I7 | Click-target sizing: header buttons → 28×24, `btn-remove` → 24×24, `update-dismiss` → 24×24 | §2 |

### Polish — fold in opportunistically

| # | Item | Section |
|---|---|---|
| P1 | Tile gap 4 px → 8 px | §1 |
| P2 | Theme banner toggle setting | §1 |
| P3 | `?` cheat-sheet overlay | §6D |
| P4 | `Ctrl+,`, `Ctrl+W`, `F11`, `Esc`-to-hide | §6E |
| P5 | Favorite themes + star-to-favorite UI | §8 |
| P6 | Build-time theme contrast linter (gate on new/changed, warn on legacy) | §4 |
| P7 | Italic-serif theme override on Settings panel copy | §3 |

---

## Out of Scope / Not Changing

- **No system-wide search** (Alfred/Raycast-style fuzzy launcher across the OS). Per the brief, QuickLaunch is a curated grid. Type-to-filter (§6C) is *in-grid only* — a different and smaller feature.
- **No plugin ecosystem.** Per the brief.
- **No cross-platform.** Windows-only.
- **No re-architecture.** This is a polish + accelerators pass on a tool already in daily use.
- **No new tech-stack dependencies.** Recommendations above use only `globalShortcut`, `nativeTheme`, native `<input>`s, vanilla CSS, and existing IPC channels. If Ender finds a recommendation requires a new dependency, that's a Makoto/Ender conversation — flag it.
- **Theme aesthetic preservation.** I am not asking Sergei to abandon cyberpunk visuals, glow, or scanlines. I am asking that **functional copy** stay legible inside that aesthetic.
- **Light-mode OS-theme inheritance.** Deferred unless Sergei flags a specific need (§9).

---

## Resolved Questions

All open questions from the first draft have been resolved. See the **Decisions Locked In (2026-04-25)** section near the top of this document for the canonical rulings on:

- Default global hotkey (`Ctrl+Space`)
- Random-theme on startup (keep current behavior)
- Number-key launch (dropped — out of scope)
- `btn-remove` size (24×24)
- Light mode / OS theme respect (not needed)
- Contrast linter behavior (gate on new/changed, warn on legacy)

The one remaining design choice not raised as a formal question — **theme-banner default visibility** — is deferred to Ender's implementation discretion: ship it default-on (current behavior) and add a settings toggle. Revisit if Sergei flags it during dogfooding.

---

*End of spec. Implementation, prioritization, and version-bump scoping belong to Ender (and Sully for the release plan). Judy stands by for follow-up questions during implementation.*

---

**Footnote — brief vs. reality.** `QuickLaunch_Brief.md` currently claims a global show/hide hotkey exists. It does not. After Ender ships the `Ctrl+Space` hotkey (§6A / I1), the brief should be updated to match reality. Flagged for Ender's implementation PR.
