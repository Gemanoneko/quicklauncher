# QuickLaunch: hover labels, hover gate and skin-picker search. UX spec

Judy. Both items approved by Sergei 2026-10-01. Every UX call below is made; **nothing here changes what the tool does**, so there are no open questions for Sergei.

- Repo: `WIP/QuickLaunch`, branch `wip/theme-fidelity`, measured on HEAD `f898199` (two commits past `af6b5f2`; they touch only `scripts/check-theme-contrast.js`, the renderer is byte-identical).
- Source: Futaba's `QuickLaunch_QA_Batch06_2026-10-01.md` (F1, F2, F4, pattern alert 1).
- Written, not committed. Per ProcessRules § Delegation-brief hardening item 5, Sully commits this file before Ender is briefed.
- Nothing in the repo was edited. Every number below was measured on scratch copies (method in section 5).

## 0. Decisions in one table

| # | Question | Decision |
|---|---|---|
| 1 | Where does the hover fix live? | **Both, split by job.** `base.css` gets one new variable `--btn-hover-text` (default `#fff`, so the other 99 themes do not change) and pins the tile remove button's own label colour. Republic loses one wrong rule. Separatist sets the variable once. |
| 2 | Does the contrast gate cover button hover states? | **Yes, but not by extending the static linter.** A new rendered check, `npm run check:hover`, measures every hover and pressed pair on real pixels, with a ratchet baseline so the 57 themes that already fail are grandfathered and nothing new can slip in. |
| 3 | How does skin search match? | Every word you type must start a word in the theme's name, its key or its aliases (so `mando`, `ff7`, `pipboy`, `star trek`, `lotr` work). Anything that matches today still matches, listed after the word-start matches. 54 of the 101 themes get aliases (table in 3.3). No new control. |

## 1. Hover labels (F1 and F2)

### 1.1 What is wrong, measured

Futaba's two Majors reproduce on flat pixels, and the **pressed** state is worse than hover, which her report did not cover. The seven controls are the same in both themes: edit bar `+ FILE` and `+ INSTALLED`, Settings hotkey clear `✕` and `CHECK FOR UPDATES`, cheat-sheet `CLOSE`, installed-apps picker `BROWSE` and `CLOSE`.

| Theme | State | Label | Fill under it | Ratio now | After the fix |
|---|---|---|---|---|---|
| Republic | hover | `#2A2118` | `#6E1412` | **1.33:1** | `#FFFFFF`, **11.85:1** |
| Republic | pressed | `#2A2118` | `#5A0F0E` | **1.14:1** | `#FFFFFF`, **13.91:1** |
| Separatist | hover | `#FFFFFF` | `#E3C68E` | **1.65:1** | `#14171B`, **10.90:1** |
| Separatist | pressed | `#FFFFFF` | `#EBD4A8` | **1.45:1** | `#14171B`, **12.43:1** |

Futaba read 1.26 to 1.33 and 1.57 to 1.65 on rendered ink; the flat-fill reading is the top of both ranges. Threshold used: 4.5:1 for a text label, 3:1 for a single-symbol control (WCAG 1.4.3 and 1.4.11, same floors as `check-theme-contrast.js`).

### 1.2 Root cause (three links, not one)

1. **`base.css` hard-codes the hover label.** `button:hover { … color: #fff; }` is a literal, while the fill next to it (`--btn-hover-bg`) is a theme variable. Nothing ties the two. A theme that moves its fill to the pale side (Separatist `#E3C68E`) is left with white on tan.
2. **The existing workaround is a copy-paste block with the wrong polarity.** The two light themes (`2001`, `promise-mascot`) carry a four-rule block (`button:hover { color: var(--text) }`, `.btn-remove:hover`, `.update-btn:hover`, `#filter-chip-clear:hover`). Republic copied the block because it is a light theme, but its hover fill is dark crimson, so `button:hover { color: var(--text) }` (line 89) paints dark brown on `#6E1412`.
3. **A cascade trap makes a theme-only fix fragile.** `button:hover` (0,1,1) outranks `.btn-remove` (0,1,0), so the tile remove button's white label follows the plain-button colour. Any theme that darkens `button:hover` text without also re-pinning `.btn-remove:hover` turns the remove ✕ dark on red. That is why the light-theme block has to be four rules. A variable in base needs the pin once, in base.

### 1.3 Decision: base for the mechanism, theme files for the values

- **Why not theme-only.** It fixes two files and leaves the trap for the next theme. The roster sweep (1.7) shows the same fault already shipped in three older themes (`mirrors-edge`, `portal`, `silent-hill`: white on a pale fill, 36 pairs each). Three links in a chain is a mechanism problem.
- **Why not base-only.** A base default cannot know a theme's fill. Each theme must still say which side of its fill the label sits on; the variable makes that one line instead of a four-rule block.
- **Blast radius is zero by construction and proven by measurement.** The default is the literal `button:hover` already uses (`#fff`); no theme but Separatist sets the variable; the `.btn-remove` pin repeats the colour that button already gets. Section 1.5 shows 4,040 hover readings before and after.

### 1.4 Exact edits (Ender; four files, six lines)

**`src/renderer/styles/base.css`**

1. In `:root`, directly after `--btn-active-bg:  rgba(0, 240, 255, 0.18);` (line 88) add:
   `--btn-hover-text: #fff;   /* label colour on a hovered or pressed button: sits on --btn-hover-bg and --btn-active-bg */`
2. In the `button:hover { … }` rule (lines 354 to 359) change `color: #fff;` to `color: var(--btn-hover-text);`
3. Change the `.btn-remove:hover` rule (line 497) to
   `.btn-remove:hover { background: var(--accent-m); box-shadow: var(--glow-m); color: #fff; }`
   (the remove button sits on `--accent-m` or the theme's `.btn-remove:hover` fill, never on `--btn-hover-bg`, so it keeps its own label colour whatever `--btn-hover-text` says).

**`src/renderer/styles/themes/star-wars-republic.css`**

4. Delete line 89: `button:hover { color: var(--text); }`. The plain buttons then take the base default `#fff` on `#6E1412` and `#5A0F0E`.
5. Replace the comment on line 88 with
   `/* hover label colours for controls on pale fills; plain buttons take --btn-hover-text (base default #fff) */`
   Leave lines 90 to 92 as they are (`.btn-remove:hover`, `.update-btn:hover`, `#filter-chip-clear:hover`); the first is now a harmless repeat and was in the measured build.

**`src/renderer/styles/themes/star-wars-separatist.css`**

6. In `:root`, directly after `--btn-hover-bg: #E3C68E;` (line 48) add `--btn-hover-text: #14171B;`. Leave the header rule on line 104 as it is (same ink).

**Rule for any theme that sets `--btn-hover-text`:** the colour must clear 4.5:1 on **both** `--btn-hover-bg` and `--btn-active-bg`, because a pressed button is hover plus active and takes the active fill. (Separatist: `#14171B` on `#E3C68E` is 10.90, on `#EBD4A8` is 12.43.)

**Not touched:** `2001` and `promise-mascot` keep their four-rule block (it still works and editing them would flip the legacy hash status), `#btn-done-edit` and `#btn-close-settings` (their own colour rules outrank `button:hover`), `.update-btn`, `#filter-chip-clear`, every other theme.

### 1.5 Regression proof (done on a scratch copy of HEAD with exactly the six edits above)

| Check | Result |
|---|---|
| Hover sweep before vs after, 101 themes x 40 readings = **4,040 readings** (hover and pressed on 17 buttons, plus tile names, skin rows, installed-picker rows; section 2.2) | **28 readings changed, all 28 in Republic (14) and Separatist (14).** The other 99 themes: 3,960 of 3,960 readings identical (label colour, sampled fill, ratio within 0.01). 0 measurement errors. |
| After the fix, Republic and Separatist | **0 pairs under threshold in both** |
| `npm run check:contrast` on the scratch copy (with `e385df7`'s CRLF-normalising hash) | **101 checked, 0 errors, 32 legacy warnings**, identical to HEAD |
| Positive control | The same sweep on unedited HEAD reproduces F1 and F2 on exactly Futaba's seven controls (1.33 and 1.65) |
| Eyes | Crops of `+ FILE` hover: Republic is now white on crimson, Separatist dark ink on tan. Before: dark on crimson (unreadable) and white on tan (washed out) |

### 1.6 Found while measuring, not part of this fix (offer, not fired)

Of the 57 themes still under threshold after the fix (full list in Appendix A):

- **Same class as F1/F2, three older themes:** `mirrors-edge`, `portal`, `silent-hill` have white labels on pale hover fills for every plain, header, chip-clear and update button (1.59 to 2.78:1). With `--btn-hover-text` each is a one-line fix plus the four-rule block they already lack. They are legacy-hash themes, so touching them is its own task.
- **Same class, tile remove button:** white label on a light `--accent-m` in 10 themes (`alien`, `dead-space`, `deus-ex`, `fatal-frame`, `ff9`, `lcars`, `persona-4`, `shire`, `stranger-things`, `tron`; 1.71 to 2.94:1). Fix per theme: set `.btn-remove:hover { background: <darker red> }`, as `akira` and `star-wars-empire` already do. `ff9` also reads 4.39:1 on the pressed plain buttons.
- **Accent colour on a dark fill, 40+ themes:** DONE (40 themes), Settings CLOSE (35), skin-picker rows (23), tile name in edit mode (20) read 2.0 to 4.4:1 (the three pale themes aside). Same family as the 32 legacy warnings the contrast gate already carries (`--btn-close-color on --panel-bg`); not hover-specific.
- **Seven themes from the redesign batches carry failures:** `dead-space`, `ff9`, `persona-4`, `shire`, `siren`, `stranger-things`, `yakuza` are no longer legacy-hash and still fail at least one pair. They need their own fix pass; the baseline in 2.5 grandfathers them so the gate can land.

## 2. The hover gate: yes, rendered and ratcheted

### 2.1 Why the static linter cannot be the answer

`check-theme-contrast.js` reads `:root` variables. F1's wrong colour came from a **theme rule** (`button:hover { color: var(--text) }`), F2's from a **hard-coded literal in base**; neither is a `:root` variable, and the cascade (class against id, base against theme, order) decides the winner. Modelling that in a regex parser is a second, worse browser. The rendered check measures the thing, not a proxy (ProcessRules § Verification Discipline) and it is the only thing that also catches a **base.css change that breaks an old theme**: the linter's file-hash baseline cannot see that, because the old theme's file did not change.

### 2.2 What it measures

One page per theme (the real renderer: `index.html`, `base.css`, the theme, the real `app.js` with the gallery's stub preload). **40 readings per theme, 4,040 over the roster.** Pair id = `<id>/<state>`; that string is the baseline key.

| id | Element | States | Floor |
|---|---|---|---|
| `hdr-random`, `hdr-settings`, `hdr-hide`, `hdr-full` | `#btn-random-theme`, `#btn-settings`, `#btn-hide`, `#btn-fullscreen` | hover, pressed | 3:1 (symbol) |
| `chip-clear` | `#filter-chip-clear` (chip showing) | hover, pressed | 3:1 |
| `edit-add-file`, `edit-add-installed`, `edit-done` | `#btn-add-edit`, `#btn-add-installed`, `#btn-done-edit` (edit mode) | hover, pressed | 4.5:1 |
| `update-action`, `update-dismiss` | `.update-btn` (not dismiss), `.update-dismiss` (banner showing) | hover, pressed | 4.5:1, 3:1 |
| `tile-remove` | `.btn-remove` (its tile hovered too) | hover, pressed | 3:1 |
| `tile-label` | `.tile-label` while its tile is hovered | hover | 4.5:1 |
| `tile-label-rename` | `.tile-label.renameable` (edit mode, tile hovered too) | hover | 4.5:1 |
| `set-hotkey-clear`, `set-check-update`, `set-close` | `#btn-hotkey-clear`, `#btn-check-update`, `#btn-close-settings` (Settings open) | hover, pressed | 3:1, 4.5:1, 4.5:1 |
| `skin-row-hover`, `skin-row-active`, `skin-row-selected` | `.theme-picker-item` plain, `.active`, `.selected` (skin list open) | hover; rest; rest | 4.5:1 |
| `cheat-close` | `#btn-close-cheatsheet` | hover, pressed | 4.5:1 |
| `picker-browse`, `picker-close`, `picker-row-hover` | `#btn-browse-picker`, `#btn-close-picker`, `.picker-item` name (installed picker open) | hover, pressed; hover | 4.5:1 |

17 buttons x 2 states + 6 single-state readings = 40. My scratch sweep built these same states with a mock driver (same DOM and classes, not `app.js`); Ender's readings from the real app must match Appendix A within 0.05, and any difference is explained before the baseline is written. "Pressed" = hover plus active, because the pointer is still over the button and `button:active` swaps in `--btn-active-bg` while `button:hover` keeps the label colour.

### 2.3 How it measures (rules, so two implementations give the same number)

1. **State by forcing, not by input.** Use the DevTools protocol `CSS.forcePseudoState` (`hover`; `hover` + `active`) through the page's debugger. No synthetic mouse or key events. **Call `DOM.getDocument` once per page:** a second call drops forced states already set (measured: the tile lost its forced hover when the label was forced).
2. **Label colour** = the computed `color` of the text element, alpha-composited over the fill.
3. **Fill = rendered pixels, never a CSS value.** Most fills are translucent over gradients and art. Buttons and skin rows: read 4 pixels inside the border box (left-middle 3 px in, right-middle 4 px in, top-middle 2 px in, bottom-middle 3 px in, never under a glyph) and **keep the worst ratio**. Tile names and picker-row names: take the label's own rectangle and use the **most frequent colour that is not within 60 (sum of channel differences) of the label colour**; if nothing is left, the most frequent colour overall (it will read about 1:1 and fail, correctly). Two traps found: sampling a tile's edge hits its hover bar or border (Cyberpunk read 1.06:1 falsely), and a bold label can out-number its own background (LCARS read 1.0:1 falsely); the rules above remove both.
4. **Backdrop** forced opaque black behind the window, matching the linter's "flatten on black".
5. **Deterministic:** inject `*, *::before, *::after { transition: none !important; animation: none !important }` and hide `#app-entrance`.
6. Ratio formula: the one in `check-theme-contrast.js` (WCAG relative luminance), one function shared, not a copy.

### 2.4 Baseline and ratchet (`scripts/themes-hover-baseline.json`)

Shape: `{ "<theme>": ["edit-done/hover", "set-close/pressed", …] }`: the pair ids that fail **now** and are accepted. Written only by `--rebaseline`.

| Situation | Result |
|---|---|
| Failing pair is in the theme's list | warning (grandfathered), printed |
| Failing pair is **not** in the list, for any theme, new, edited or untouched | **error, exit 1** |
| Theme not in the file at all | every failing pair is an error |
| A listed pair now passes | note "fixed, `--rebaseline` to tighten"; never an error |

Why a ratchet and not the contrast gate's "unchanged hash = legacy": 50 themes fail with an unchanged hash, 7 fail after a redesign (1.6), and a base change can break any of them without touching their file. The ratchet catches all three.

### 2.5 Output, exit codes, guards

- Per theme failing lines, same style as the linter: `edit-add-file/hover: #2A2118 on #6E1412 = 1.33:1 (needs 4.5:1)`. Last line: `[hover] 101 theme(s), 4040 pair(s) measured, 0 errors, N grandfathered.`
- Exit 0 pass, 1 new failure, **2 harness failure**. Exit 2 also when pairs measured is not exactly themes x 40 (a control that is missing must not pass silently), and when the built-in positive control does not fail: a fixture theme with `--btn-hover-bg:#E3C68E` and a white hover label must read under 2:1 on `edit-add-file/hover`, or the run is void.
- Flags: `--only a,b` (iterate, skips the baseline compare), `--rebaseline`.
- **Runner:** the project's own Electron, offscreen, as a **new mode of the theme-gallery harness** (`scripts/theme-gallery/main.cjs` and `run.mjs`), so the existing guards are reused rather than copied: windows `show:false`, `focusable:false`, never shown or focused; audio muted; focus, dialogs, login-item and global-shortcut calls counted no-ops; registry hashed before and after; the run fails on any non-zero guard counter; it ends only the process it started. Sergei's machine rule (ProcessRules § Our tooling must not intrude) applies in full, because this runs inside every build.
- Budget: under 60 s for the roster (the scratch Edge sweep needed 264 s with a screenshot per reading; Electron with one capture per element group and the pseudo-states of a whole scene forced at once should be far under). Hard timeout 180 s, exit 2.
- Driving the real `app.js`: the app already listens for `update-available` and friends through `window.api.on`, the gallery stub can send them; right-click the grid for edit mode, `?` for the cheat-sheet, `+ INSTALLED` for the picker. How each state is reached is Ender's call; the count in the previous bullet is the proof that all 40 were reached.

### 2.6 Wiring

- `"check:hover": "node scripts/theme-gallery/run.mjs --hover-check"` (or whichever entry Ender names; keep the `check:hover` script name).
- `"check": "npm run check:contrast && npm run check:hover"` so the `qa-handoff` entry check, which looks for a script named `check`, picks both up.
- `"prebuild"` runs `npm run check`. A build can no longer ship a theme that fails either gate.

### 2.7 What I ask Judy-side (the process half)

Every future theme spec states `--btn-hover-bg`, `--btn-hover-text` and `--btn-active-bg` with a measured ratio each, for hover and pressed, in its done-when. I own that line; I will add it to the next theme spec. Not changing the foundation doc in this task.

## 3. Skin-picker search (F4)

### 3.1 Today

`THEME_NAMES[key].toLowerCase().includes(query)`: one substring of the display name, nothing else. Of 49 plausible queries (`mando`, `star wars republic`, `pipboy`, `stalker`, `half life`, `ff7`, `final fantasy 7`, `harry potter`, `fallout`, `star trek`, `lotr`, `warcraft`, `dr who`, `mgs`, `ghost shell` …), **44 list NO MATCHES today and 0 do after this spec** (table in 3.5). Causes: the key and franchise are not searched; hyphens, dots and apostrophes in names (`PIP-BOY`, `S.T.A.L.K.E.R.`, `MIRROR'S EDGE`); roman numerals (`VII`); the word you would type is not in the label (`mando`, `fallout`).

### 3.2 The rule (decided: word-start match over name, key and aliases, with a substring fallback)

For each theme the picker knows three things: its **label** (what the row shows: `THEME_NAMES[key]`, else `key.toUpperCase()`), its **key** (`star-wars-mando`), and its **aliases** (3.3).

1. **Normalise** any text (label, key, alias, query): lowercase; delete `'`, `’` and `.`; turn every other run of non-letters-and-non-digits (any script, so Cyrillic stays) into one space; trim.
2. **Words of a field** = its normalised words, and, when it has more than one word, the same words joined with no space as one extra word (`pip boy` also gives `pipboy`; `half life` gives `halflife`). A theme's words = words of its label, its key, and each alias phrase.
3. **Query tokens** = the normalised query split on spaces. Drop the token `the` unless it is the only one (`the x files` finds X-FILES). No tokens left: every theme matches (the full list, as today).
4. **Tier 0:** every token is the **start** of at least one of the theme's words. **Tier 1:** every token appears **anywhere** inside the theme's words (this keeps today's mid-word hits, e.g. `punk` finds CYBERPUNK). Otherwise the theme is not listed.
5. **Order:** tier 0 first, then tier 1; inside each tier the picker's present order (display name, A to Z). **Enter still picks the first row**, arrows, Esc and click are unchanged.
6. Build the per-theme word lists **once** at start-up (after `ALL_THEMES`), not per keystroke. Keep the matcher a plain top-level function that returns the ordered keys, so a probe can call it without typing.

Properties the build must keep (Futaba checks them): **nothing that matches today stops matching.** Prototype run: every substring of every display name, 11,026 queries, 0 lost.

### 3.3 Aliases: data and when to add one

Home: a constant `THEME_ALIASES` in `src/renderer/app.js` directly under `THEME_NAMES` (same place and owner as the labels and the banner quotes), key to an array of phrases. At init, `console.warn('[themes] THEME_ALIASES keys with no matching theme:', …)` for an unknown key, in the style of the existing banner mismatch warning. No effect on saved settings: the key is still the stored value.

**Add an alias only when** (1) the franchise or common name is not in the label (`fallout` for PIP-BOY); (2) a short form people really type (`ff7`, `mgs`, `hp`); (3) a numeral or spelling variant (`final fantasy 7`, `night elf`); (4) a former name (`old republic`). Never character or place trivia, never padding. Three or four phrases at most. The key already supplies `mando`, `ff7`, `ghost shell`, `nightelf`, `star wars republic` for free, so none of those need an alias.

54 themes carry aliases; the other 47 are fully served by label plus key (`2001`, `cyberpunk`, `blade-runner`, `alien`, `tron`, `dune`, `x-files`, `mass-effect`, `deus-ex`, `matrix`, `predator`, `robocop`, `dead-space`, `terminator`, `portal`, `star-wars-mando`, `star-wars-sith`, `akira`, `silent-hill`, `stalker`, `the-expanse`, `event-horizon`, `scp`, `alan-wake`, `control`, `twin-peaks`, `the-sandman`, `the-witcher`, `diablo`, `soma`, `stranger-things`, `firefly`, `eve-online`, `indiana-jones`, `doom-classic`, `doom-eternal`, `tiny-bunny`, `nonary-games`, `dragon-age`, `yakuza`, `mirrors-edge`, `uncharted`, `broken-sword`, `siren`, `blair-witch`, `amnesia`, `parasite-eve`).

| Key | Label | Aliases (phrases) |
|---|---|---|
| `lcars` | LCARS | star trek |
| `pip-boy` | PIP-BOY | fallout |
| `ghost-shell` | GHOST IN THE SHELL | gits |
| `warhammer`, `warhammer-chaos`, `warhammer-eldar`, `warhammer-necrons`, `warhammer-tyranids` | WARHAMMER 40K: … | wh40k, w40k |
| `warhammer-orks` | WARHAMMER 40K: ORKS | wh40k, w40k, orcs |
| `ff6` | FINAL FANTASY VI | ffvi, final fantasy 6 |
| `ff7` | FINAL FANTASY VII | ffvii, final fantasy 7 |
| `ff8` | FINAL FANTASY VIII | ffviii, final fantasy 8 |
| `ff9` | FINAL FANTASY IX | ffix, final fantasy 9 |
| `ff10` | FINAL FANTASY X | ffx, final fantasy 10 |
| `ff14` | FINAL FANTASY XIV | ffxiv, final fantasy 14 |
| `ff15` | FINAL FANTASY XV | ffxv, final fantasy 15 |
| `wow-horde`, `wow-scourge`, `wow-legion`, `wow-alliance` | WOW: … | world of warcraft |
| `wow-nightelf` | WOW: NIGHT ELVES | world of warcraft, night elf |
| `half-life` | HALF-LIFE | hl |
| `star-wars-rebel` | STAR WARS: REBEL ALLIANCE | rebels |
| `star-wars-empire` | STAR WARS: GALACTIC EMPIRE | imperial |
| `star-wars-separatist` | STAR WARS: SEPARATISTS | cis |
| `star-wars-republic` | STAR WARS: GALACTIC REPUBLIC | old republic |
| `doctor-who` | DOCTOR WHO | dr who |
| `evangelion` | EVANGELION | neon genesis |
| `resident-evil` | RESIDENT EVIL | biohazard |
| `hogwarts`, `ministry-of-magic`, `gryffindor`, `ravenclaw`, `hufflepuff`, `slytherin` | HOGWARTS / MINISTRY OF MAGIC / the four houses | harry potter, hp, hogwarts |
| `rivendell`, `shire`, `mordor` | RIVENDELL / THE SHIRE / MORDOR | lord of the rings, lotr, tolkien, middle earth |
| `lovecraft` | LOVECRAFTIAN | cthulhu |
| `persona-3`, `persona-4`, `persona-5` | PERSONA 3 / 4 / 5 | p3, p4, p5 (one each) |
| `fatal-frame` | FATAL FRAME | project zero |
| `game-of-thrones` | GAME OF THRONES | got |
| `promise-mascot` | PROMISE MASCOT AGENCY | pma |
| `mortal-kombat` | MORTAL KOMBAT | mk |
| `life-is-strange` | LIFE IS STRANGE | lis |
| `tomb-raider` | TOMB RAIDER | lara croft |
| `swl-illuminati`, `swl-templar`, `swl-dragon` | SWL: … | secret world legends, tsw |
| `ac-assassins`, `ac-templars` | AC: ASSASSINS / TEMPLARS | assassins creed |
| `metal-gear` | METAL GEAR SOLID | mgs |

### 3.4 What does not change

- **No new control, no new string.** The field stays "SEARCH...", the empty state stays "NO MATCHES". No tooltip is owed (ProcessRules § A new control is born with its tooltip applies to controls; there is none). No layout change, so nothing can cover anything.
- Matched text is not highlighted and the row does not say why it matched: the row's name is the answer (`fallout` lists PIP-BOY, `lotr` lists three Middle-earth names).
- Saved theme key, random theme, banner quotes: untouched.

### 3.5 Acceptance (expected result lists; `~` marks a tier-1 row; today's count in the second column)

| Query | Today | Expected rows, in order |
|---|---|---|
| `mando` | 0 | STAR WARS: MANDALORIAN |
| `star wars republic` | 0 | STAR WARS: GALACTIC REPUBLIC |
| `old republic` | 0 | STAR WARS: GALACTIC REPUBLIC |
| `galactic rep` | 1 | STAR WARS: GALACTIC REPUBLIC |
| `star wars` | 6 | GALACTIC EMPIRE, GALACTIC REPUBLIC, MANDALORIAN, REBEL ALLIANCE, SEPARATISTS, SITH (unchanged) |
| `rebels` | 0 | STAR WARS: REBEL ALLIANCE |
| `imperial` | 0 | STAR WARS: GALACTIC EMPIRE |
| `pipboy`, `pip boy` | 0 | PIP-BOY |
| `fallout` | 0 | PIP-BOY |
| `the x files`, `x files`, `xfiles` | 0 | X-FILES |
| `stalker`, `s.t.a.l.k.e.r` | 0 | S.T.A.L.K.E.R. |
| `half life`, `halflife`, `hl` | 0 | HALF-LIFE |
| `mirrors edge`, `mirror's edge` | 0, 1 | MIRROR'S EDGE |
| `harry potter`, `hp` | 0 | GRYFFINDOR, HOGWARTS: MARAUDER'S MAP, HUFFLEPUFF, MINISTRY OF MAGIC, RAVENCLAW, SLYTHERIN: DARK ARTS |
| `star trek`, `startrek` | 0 | LCARS |
| `lotr`, `the lord of the rings` | 0 | MORDOR, RIVENDELL, THE SHIRE |
| `ff7`, `ff 7`, `final fantasy 7` | 0 | FINAL FANTASY VII |
| `ffvii` | 0 | FINAL FANTASY VII, FINAL FANTASY VIII (prefix match, by design) |
| `ffx` | 0 | FINAL FANTASY X, XIV, XV |
| `final fantasy 10` | 0 | FINAL FANTASY X |
| `wow`, `warcraft` | 5, 0 | WOW: ALLIANCE, BURNING LEGION, HORDE, NIGHT ELVES, SCOURGE |
| `night elf`, `night elves`, `nightelf` | 0 | WOW: NIGHT ELVES |
| `wh40k`, `40k` | 0, 6 | the six WARHAMMER 40K themes |
| `orcs` | 0 | WARHAMMER 40K: ORKS |
| `dr who` | 0 | DOCTOR WHO |
| `neon genesis` | 0 | EVANGELION |
| `biohazard` | 0 | RESIDENT EVIL |
| `cthulhu` | 0 | LOVECRAFTIAN |
| `p5` | 0 | PERSONA 5 |
| `project zero` | 0 | FATAL FRAME |
| `got`, `mk`, `pma`, `mgs`, `lara croft` | 0 | GAME OF THRONES, MORTAL KOMBAT, PROMISE MASCOT AGENCY, METAL GEAR SOLID, TOMB RAIDER |
| `secret world`, `tsw` | 0 | SWL: DRAGON, ILLUMINATI, TEMPLAR |
| `assassins creed`, `ac` | 0, 6 | AC: ASSASSINS, AC: TEMPLARS (for `ac`, then `~` rows) |
| `ghost shell`, `gits`, `ghostshell` | 0 | GHOST IN THE SHELL |
| `bladerunner`, `deusex` | 0 | BLADE RUNNER, DEUS EX |
| `punk` | 1 | ~CYBERPUNK (mid-word, unchanged) |
| `зайчик`, `bunny` | 1 | ЗАЙЧИК / TINY BUNNY |
| `doom`, `persona` | 2, 3 | DOOM (CLASSIC), DOOM ETERNAL; PERSONA 3, 4, 5 |
| `republic star wars` (order swapped) | 0 | STAR WARS: GALACTIC REPUBLIC |
| `zzz` | 0 | NO MATCHES |
| `` (empty) | 101 | all 101, as today |

Properties to run besides the table: (a) **superset:** every substring of every label still lists that theme; (b) an alias key that is not a theme is warned about in the console; (c) one pass of the picker with real clicks and Enter on `mando`, `ff7`, `lotr` switches the skin and saves the key (`star-wars-mando`, `ff7`, `mordor`).

### 3.6 Edge cases (decided)

- Leading, trailing and double spaces, capitals: normalised away.
- A query that is only punctuation (`:` or `.`) normalises to nothing and lists everything (today `:` lists the 26 names that contain a colon; nobody types that).
- Cyrillic works as is. The Cyrillic-for-Latin layout slip (typing `ьфтвщ` for `mando`) is not handled.
- The row order inside a tier stays by label, which puts FINAL FANTASY IX before VI. Existing quirk, not touched.

### 3.7 Not in this spec (offer only if Sergei asks)

Typo tolerance; layout-slip fix; match highlighting; "why this matched" hint; recent or favourite skins first.

## 4. Build order and acceptance

For Ender, in this order (one commit per concern; Sully commits):

1. **Gate first, against the broken tree.** Build `check:hover` (section 2) with no baseline. Run it on unedited HEAD: it must **fail naming Republic and Separatist, 14 pairs each**, readings within 0.05 of the table in 1.1. Paste the observed FAIL (ProcessRules § a gate never observed to FAIL is not known to be a gate). Run the built-in positive control once with the fixture removed to see it void the run.
2. **Hover fix** (1.4). Re-run: Republic and Separatist 0 failing pairs; before/after comparison over all 101 themes shows exactly 28 changed readings, all in those two. `npm run check:contrast`: 101 checked, 0 errors, 32 legacy warnings.
3. **Baseline:** `check:hover --rebaseline`. Expected: **57 themes** (50 legacy-hash, 7 redesigned), per Appendix A; any difference from the appendix is investigated, not rebaselined away. Wire `check` and `prebuild` (2.6).
4. **Search** (section 3). Table 3.5 and the superset property pass.

For Futaba (QA on the committed build, not the working tree): table 3.5 through the real picker, `npm run check:hover` run twice with identical output, and a leak and focus count for the check itself. For Sully: the fix is a patch to unreleased batch work on `wip/theme-fidelity`; version and changelog per the branch's release plan.

## 5. Evidence and machine safety

- **Method.** Headless Edge started only through `scripts/qa/headless-browser.mjs` (`launchHeadless`: a lease and a Job Object), page background forced black, states forced with `CSS.forcePseudoState` (no input events of any kind), no window shown, nothing took focus. Scratch copies of `src/renderer` (HEAD) and a patched copy with the six edits; the repo itself was never edited. Scratch: `…\scratchpad\hover-search\` (`sweep.mjs`, `lib.mjs`, `stub.js`, `analyze.mjs`, `before3.json`, `after3.json`, `search-proto.mjs`, `search-test.mjs`).
- **Positive controls.** The sweep on unedited HEAD reproduced F1 and F2 on Futaba's exact seven controls; a first tile-name reading of 1.06:1 (Cyberpunk) and 1.0:1 (LCARS) were probe faults, found by screenshot and removed before any number here was used; the final sweep had 0 measurement errors in 4,040 readings. The search prototype passed 106 of 106 expected-result cases and the 11,026-query superset check.
- **Leaks.** Browser launches: 20; 17 closed by their own `lease.close()` (each returned `remaining: 0`); 3 hung on a fault of mine (a stylesheet swap to the same URL never fires `load`, fixed), were ended by my own `timeout`, and the guard's Job Object ended their trees (0 left after the first and the third, and at the end). Final sweep: `headless-browser.mjs list` shows **no leases**; the CIM process listing shows **0** browser-named processes on the machine, **0** with my scratch path, **0** lease-marked. Killed by me: 0.
- **Repo state.** `git status --short` in `WIP/QuickLaunch` empty before and after. The regions worktree was not touched.

## Appendix A. Roster after the fix: themes under threshold (expected baseline, 57 themes)

Status is the contrast baseline's file hash (CRLF-normalised, as `e385df7`). Families name which pairs fail (section 2.2). "Worst" is the lowest reading. Republic and Separatist are absent: they pass after the fix.

| Theme | Status | Pairs | Families | Worst |
|---|---|---|---|---|
| alan-wake | legacy | 4 | DONE, settings CLOSE | edit-done/hover 3.35 |
| alien | legacy | 2 | tile remove | tile-remove/hover 2.71 |
| blade-runner | legacy | 4 | DONE, settings CLOSE | edit-done/hover 2.88 |
| blair-witch | legacy | 4 | DONE, settings CLOSE | edit-done/hover 2.32 |
| control | legacy | 8 | DONE, tile name (edit), settings CLOSE, skin rows | edit-done/hover 3.08 |
| dead-space | changed | 2 | tile remove | tile-remove/hover 2.22 |
| deus-ex | legacy | 2 | tile remove | tile-remove/hover 1.71 |
| diablo | legacy | 6 | tile name (edit), settings CLOSE, skin rows | skin-row-selected/rest 3.33 |
| doctor-who | legacy | 8 | DONE, tile name (edit), settings CLOSE, skin rows | skin-row-selected/rest 3.64 |
| dragon-age | legacy | 3 | settings CLOSE, skin row (selected) | set-close/hover 2.65 |
| dune | legacy | 4 | DONE, settings CLOSE | edit-done/hover 2.50 |
| evangelion | legacy | 4 | DONE, settings CLOSE | edit-done/hover 3.31 |
| eve-online | legacy | 2 | DONE | edit-done/hover 3.29 |
| event-horizon | legacy | 8 | DONE, tile name (edit), settings CLOSE, skin rows | edit-done/hover 2.10 |
| fatal-frame | legacy | 10 | DONE, tile remove, tile name (edit), settings CLOSE, skin rows | tile-remove/hover 2.33 |
| ff9 | changed | 8 | plain buttons (pressed 4.39), tile remove | tile-remove/hover 2.23 |
| ghost-shell | legacy | 4 | DONE, settings CLOSE | edit-done/hover 3.22 |
| half-life | legacy | 4 | DONE, settings CLOSE | edit-done/hover 3.87 |
| hogwarts | legacy | 4 | DONE, settings CLOSE | set-close/hover 2.23 |
| lcars | legacy | 4 | tile remove, settings CLOSE | tile-remove/hover 2.46 |
| life-is-strange | legacy | 2 | DONE | edit-done/hover 3.66 |
| lovecraft | legacy | 4 | DONE, settings CLOSE | edit-done/hover 3.18 |
| mass-effect | legacy | 4 | DONE, settings CLOSE | edit-done/hover 3.05 |
| matrix | legacy | 2 | DONE | edit-done/hover 4.21 |
| metal-gear | legacy | 4 | tile name (edit), skin rows | skin-row-selected/rest 3.62 |
| ministry-of-magic | legacy | 4 | tile name (edit), skin rows | skin-row-selected/rest 3.33 |
| mirrors-edge | legacy | 36 | header, chip clear, plain, update buttons, DONE, tile name (edit), settings CLOSE, skin rows | update-action/hover 1.59 |
| mordor | legacy | 8 | DONE, tile name (edit), settings CLOSE, skin rows | edit-done/hover 3.59 |
| mortal-kombat | legacy | 2 | DONE | edit-done/hover 2.73 |
| persona-4 | changed | 2 | tile remove | tile-remove/hover 2.76 |
| portal | legacy | 36 | header, chip clear, plain, update buttons, DONE, tile name (edit), settings CLOSE, skin rows | edit-done/hover 1.60 |
| predator | legacy | 6 | tile name (edit), settings CLOSE, skin rows | skin-row-selected/rest 3.77 |
| ravenclaw | legacy | 8 | DONE, tile name (edit), settings CLOSE, skin rows | skin-row-selected/rest 3.35 |
| resident-evil | legacy | 8 | DONE, tile name (edit), settings CLOSE, skin rows | edit-done/hover 2.84 |
| robocop | legacy | 2 | DONE | edit-done/hover 3.45 |
| scp | legacy | 4 | DONE, settings CLOSE | edit-done/hover 3.27 |
| shire | changed | 4 | DONE, tile remove | tile-remove/hover 2.94 |
| silent-hill | legacy | 36 | header, chip clear, plain, update buttons, DONE, tile name (edit), settings CLOSE, skin rows | chip-clear/hover 2.16 |
| siren | changed | 2 | DONE | edit-done/hover 4.26 |
| slytherin | legacy | 4 | tile name (edit), skin rows | skin-row-selected/rest 3.78 |
| soma | legacy | 3 | DONE, skin row (selected) | edit-done/hover 4.41 |
| stalker | legacy | 4 | DONE, settings CLOSE | edit-done/hover 2.54 |
| stranger-things | changed | 4 | tile remove, settings CLOSE | tile-remove/hover 2.11 |
| terminator | legacy | 4 | DONE, settings CLOSE | edit-done/hover 3.41 |
| the-expanse | legacy | 8 | DONE, tile name (edit), settings CLOSE, skin rows | set-close/hover 2.71 |
| tiny-bunny | legacy | 8 | DONE, tile name (edit), settings CLOSE, skin rows | edit-done/hover 2.42 |
| tomb-raider | legacy | 2 | DONE | edit-done/hover 4.29 |
| tron | legacy | 2 | tile remove | tile-remove/hover 2.53 |
| twin-peaks | legacy | 6 | tile name (edit), settings CLOSE, skin rows | set-close/hover 1.99 |
| uncharted | legacy | 2 | DONE | edit-done/hover 4.31 |
| wow-alliance | legacy | 4 | tile name (edit), skin rows | skin-row-selected/rest 2.97 |
| wow-horde | legacy | 8 | DONE, tile name (edit), settings CLOSE, skin rows | skin-row-selected/rest 2.78 |
| wow-legion | legacy | 2 | DONE | edit-done/hover 2.26 |
| wow-nightelf | legacy | 5 | settings CLOSE, skin rows | skin-row-selected/rest 4.10 |
| wow-scourge | legacy | 2 | DONE | edit-done/hover 2.42 |
| x-files | legacy | 4 | DONE, settings CLOSE | edit-done/hover 3.31 |
| yakuza | changed | 4 | DONE, settings CLOSE | edit-done/hover 3.92 |
