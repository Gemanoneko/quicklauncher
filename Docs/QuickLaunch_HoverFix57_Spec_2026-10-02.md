# QuickLaunch: hover and pressed fix for the failing themes. UX spec

Judy, 2026-10-02. Sergei approved fixing the themes that fail hover and pressed legibility (relayed by Jane) and delegated the visual calls to me. Every call below is made; **nothing here changes what the tool does**, so there are no open questions for Sergei. Two judgement calls are flagged in 2.5 and 7 so Jane can overrule them cheaply.

- Repo `WIP/QuickLaunch`, branch `wip/theme-fidelity`. Measured on a scratch copy of `src/renderer` taken from Ender's tree with his hover fix applied (`--btn-hover-text`, the remove-button pin, Republic, Separatist). That fix is now committed (`817cb29`); `base.css`, Republic and Separatist in HEAD `39e7951` are byte-identical to what I measured (checked with `diff`).
- Written, not committed. Per ProcessRules § Delegation-brief hardening item 5, Sully commits this file before Ender is briefed.
- Nothing in the repo was edited. Every number comes from scratch copies (section 8).
- The file name says 57, the number in the brief. The corrected count is **56** (section 1).

## 0. Decisions in one table

| # | Question | Decision |
|---|---|---|
| 1 | How many themes fail? | **56 themes, 350 pairs**, not 57. The 2026-10-01 sampler had faults; section 1 lists them and Appendix A replaces the old roster. |
| 2 | How is it fixed? | **Two base rules plus a few theme lines.** (a) A lightness band for labels that sit on a hover, pressed or highlighted fill (DONE, CLOSE, tile name in edit mode, skin rows). (b) A cap on the lightness of the tile remove button's hover fill. **47 of the 56 themes need no theme-file edit.** |
| 3 | Theme-file edits | **12 files**: 9 themes that fail and need their own value (`dune`, `stranger-things`, `yakuza`, `shire`, `siren`, `ff9`, `mirrors-edge`, `portal`, `silent-hill`) and 3 light themes that must opt out of the new rule (`2001`, `promise-mascot`, `star-wars-republic`). Four of the 12 are legacy-hash themes, so four contrast-baseline hashes move (2.3). |
| 4 | Fix now or fold into batches 7 to 14? | **All 56 now, none folded.** Reasons in section 4. Every redesigned theme inherits the base rules, so the fix is not thrown away. |
| 5 | `check:hover` | **Confirmed as specified on 2026-10-01 with four amendments** (section 5): a corrected fill rule, colours read through a canvas, a second built-in positive control, and a baseline that ships empty and can only shrink. |
| 6 | Result on the scratch tree | **350 failing pairs to 0**, 0 regressions in 4,040 readings. 5 themes that did not fail have 15 readings that move (all improve or stay), listed in Appendix B. |

## 1. What changed since the last roster (57 to 56)

The 2026-10-01 sampler read the fill from four fixed points inside the border box. Re-measuring the 56 themes found it wrong in both directions. Four faults, each seen on pixels:

| Fault | Seen on | Effect |
|---|---|---|
| **Ring read as fill.** The tile remove button is a 24 px circle with a border and, in many themes, a shadow; fixed points land on the ring. | `ff9`: points read the gold ring `#D3A758` (2.23:1); the fill is `#B03A30` (6.01:1). `rivendell`, `dragon-age`, `metal-gear`, `predator`, `wow-alliance`, `wow-nightelf`: ring read as a darker colour, so a **real** 2.0 to 2.9:1 fail read as 3.0 to 6.3:1. | `ff9` remove: false fail. `rivendell`: false pass, joins the roster. The other five were already in it for other pairs and gain a remove pair. |
| **Scanline overlay.** Themes with a stripe overlay (`alien`) paint dark stripes over the fill. | A "most frequent colour" reading picked the dark stripe (8.72:1); the lime fill is 2.68:1. | Needs worst-of-dominant, not mode. |
| **Painted fill lighter than the CSS fill.** | `shire`, `siren` DONE hover: the CSS fill is `#4A2012` and `#4A1618`; the pixels behind the label are `#542C19` and `#4D1B1C` (inset glow). Readings 4.08 and 4.39, not 4.74 and 4.61. | Needs the painted pixels as well as the CSS fill. |
| **Edge noise on borderline pairs.** | `tomb-raider`, `uncharted` DONE hover read 4.29 and 4.31 on the old rule, 4.51 and 4.88 on the text box. | Both drop off the roster. `tomb-raider` is a razor pass; the fix lifts it to 5.46. |

Net: **57 minus `tomb-raider` and `uncharted`, plus `rivendell` = 56.** Ratios in the 2026-10-01 Appendix A differ by up to 0.2 for the same reasons; Appendix A below supersedes it. The corrected measurement rule is in 5.3.

Failing pairs by control, over the 56 themes (a theme can fail several): DONE 74 pairs (37 themes), settings CLOSE 70 (35), tile remove 30 (15), tile name in edit mode 21 (21), skin rows 65 (hover 21, keyboard cursor 21, current skin 23), plain buttons 4 themes (`ff9` pressed only, 6 pairs; `mirrors-edge`, `portal`, `silent-hill` 36 pairs each in total, which includes their own DONE, CLOSE, name and row pairs).

## 2. The fix

### 2.1 In words

- **The shared fault.** Four families (DONE, CLOSE, tile name in edit mode, skin rows) paint a label in a theme accent on a hover fill that is almost the same colour as the ground: the accent was picked for a larger or brighter use, and the hover tint makes it worse, so the label reads 2.0 to 4.4:1. The other two families are a white label on a light fill (the tile remove button in 15 themes) and a white label on a pale hover fill (plain buttons in the three pale legacy themes, and `ff9` pressed). Fixing each theme by hand means 49 legacy files that eight upcoming batches rewrite anyway.
- **Rule (a), the band.** On hover, pressed or highlight, the label's lightness (oklch L, 0 to 1) is held inside `[floor, ceiling]`. Hue is kept; chroma is scaled by the same proportion as a mix with white (or black) so the colour stays in gamut. **A colour already inside the band does not move.** Default band for dark grounds: floor 0.64, ceiling 1. Rest-state labels are untouched.
- **Rule (b), the remove cap.** The tile remove button's hover fill is held at or below L 0.62, so its white X keeps at least 3.4:1. Themes that set their own `.btn-remove:hover { background }` (33 files: every theme redesigned in batches 2 to 6) never reach it. The eight batch-1 themes have no such line, which is why `dead-space`, `persona-4`, `shire` and `stranger-things` fail and `cyberpunk` and `gryffindor` pass at only 3.2 and 3.1.
- **Light themes opt out.** A light-ground theme sets `--hover-label-floor: 0` (nothing lifts) and, where its labels are too light for the ground, `--hover-label-ceiling` (the same rule pulls them down). Measured necessary: without the opt-out `2001`, `promise-mascot` and `star-wars-republic` regress **8 pairs each** (for example `2001` DONE 5.01 to 2.32). `star-wars-separatist` and `persona-3`, `persona-4`, `persona-5` are unaffected without any edit (Separatist's hover fills are not on a light ground; the Persona tile names set their own colour on a pill).
- **Why oklch and not white.** A white label on hover would pass everywhere, but it drops the theme's hue: Control's red DONE becomes a white word. The band keeps the red (it becomes a lighter red). Plain buttons already go to white on hover in every theme, so white would also be defensible; I chose to keep the accent because DONE and CLOSE are the two buttons whose colour carries meaning (confirm and leave).

### 2.2 Exact edits, `src/renderer/styles/base.css` (three places)

**Edit 1.** In `:root`, directly after the `--btn-hover-text: #fff; ...` line, add:

```css
  --hover-label-floor: 0.64;     /* hover/selected label lightness floor (oklch L); light-ground themes set 0 */
  --hover-label-ceiling: 1;      /* ceiling; a light-ground theme whose labels are too light for its ground sets ~0.3 to 0.45 */
  --remove-hover-ceiling: 0.62;  /* the tile remove hover fill is held at or below this lightness so the white X reads */
```

**Edit 2.** Replace the whole `.btn-remove:hover` rule (currently `.btn-remove:hover { background: var(--accent-m); box-shadow: var(--glow-m); color: #fff; }`) with:

```css
.btn-remove:hover { background: oklch(from var(--accent-m) min(l, var(--remove-hover-ceiling)) calc(c * min(1, var(--remove-hover-ceiling) / max(l, 0.0001))) h); box-shadow: var(--glow-m); color: #fff; }
```

**Edit 3.** Insert this block immediately before the `/* ── Tile hover keyframes` comment (after `.theme-picker-empty { ... }`):

```css
/* ── Hover legibility ────────────────────────────────────────────────────────── */
/* A label painted in a theme colour on a hover, pressed or selected highlight is
   held inside a lightness band (oklch L, 0 to 1). Hue is kept; chroma is scaled so
   the result stays in gamut. A colour already inside the band does not move.
   Dark-ground themes use the defaults (floor 0.64, no ceiling). A pale-ground theme
   sets --hover-label-floor: 0 and, if its labels are too light for the ground,
   --hover-label-ceiling: ~0.42, and the same rule pulls them down instead. */
#btn-done-edit      { --hover-src: var(--btn-done-color); }
#btn-close-settings { --hover-src: var(--btn-close-color); }
.tile-label.renameable,
.theme-picker-item  { --hover-src: var(--accent-text); }
#btn-done-edit:hover,
#btn-close-settings:hover,
.tile-label.renameable:hover,
.theme-picker-item:hover,
.theme-picker-item.active,
.theme-picker-item.selected {
  color: oklch(from var(--hover-src)
    clamp(var(--hover-label-floor), l, var(--hover-label-ceiling))
    calc(c * min(1,
      (1 - clamp(var(--hover-label-floor), l, var(--hover-label-ceiling))) / max(1 - l, 0.0001),
      clamp(var(--hover-label-floor), l, var(--hover-label-ceiling)) / max(l, 0.0001)))
    h);
}
```

How it works, for the reviewer. `l`, `c`, `h` are the colour's own oklch channels. `clamp(floor, l, ceiling)` is the new lightness. The `calc(c * min(1, A, B))` term scales chroma: `A = (1 - L') / (1 - l)` is the factor for a lift (a mix with white), `B = L' / l` is the factor for a pull-down (a mix with black), and the `min` picks whichever applies; if `L' = l` both are 1 and the colour is unchanged. The `max(..., 0.0001)` terms stop a division by zero on pure white or black. Specificity: the new colour rule uses the same selectors as the existing hover rules and sits after them, so it wins in base; **a theme's own rule on these selectors still wins** (verified: `stranger-things` sets `color: #F0E8D0` on rows and tile names and keeps it; `persona-4` pill labels keep theirs).

Support: relative colour syntax and `color-mix` shipped in Chromium 119 and 111. The project's Electron is **32.3.3 (Chromium 128)**, so it is supported. I measured in headless Edge 154 (the only guarded browser), which is 26 versions newer. That gap is the one unverified assumption in this spec; step 1 of the build order checks it.

### 2.3 Theme-file edits (12 files)

Insert each line directly after that file's `--btn-active-bg:` line (all 12 files have one in `:root`). The two rules for the three light legacy themes go at the end of the file.

| File | Status | Lines to add | Why |
|---|---|---|---|
| `2001.css` | changed | `--hover-label-floor: 0;` | Light ground. Opt-out (8 pairs would regress). No reading changes. |
| `promise-mascot.css` | changed | `--hover-label-floor: 0;` | Same. |
| `star-wars-republic.css` | changed | `--hover-label-floor: 0;` | Same. |
| `dune.css` | legacy | `--hover-label-floor: 0.70;` | Mid-tone ground `#452813`. Forecast 3.77 at the default floor; measured 4.86 at 0.70. |
| `stranger-things.css` | changed | `--hover-label-floor: 0.66;` | CLOSE on `#3A1018`: forecast 4.43 at the default floor; measured 4.84 at 0.66. |
| `yakuza.css` | changed | `--hover-label-floor: 0.70;` | DONE and CLOSE on the opaque crimson fill `#4A1A1E`: the label `#F0474D` is already above the default floor and reads 3.92; 0.70 gives 4.98. |
| `shire.css` | changed | `--hover-label-floor: 0.73;` | DONE on the painted fill `#542C19`: `#E27A54` reads 4.08; 0.73 gives 4.79. |
| `siren.css` | changed | `--hover-label-floor: 0.70;` | DONE on `#4D1B1C`: 4.39; 0.70 gives 4.95. |
| `ff9.css` | changed | replace `--btn-active-bg: #4A7ABA;` with `--btn-active-bg: #4575B2;` | White on the pressed fill read 4.39 (six controls, one value). 4.73 now. Still lighter than the hover fill `#3A6AAA`, so pressed still reads as the brighter state. |
| `mirrors-edge.css` | legacy | `--btn-hover-text: #404850;` `--hover-label-floor: 0;` `--hover-label-ceiling: 0.44;` plus two end-of-file rules (below) | Pale ground. Plain hover labels were white on pale pink (1.6:1). Ink `#404850` is the theme's own `--text`. |
| `portal.css` | legacy | `--btn-hover-text: #3A4050;` `--hover-label-floor: 0;` `--hover-label-ceiling: 0.41;` plus the two rules | Same; ink is the theme's `--text`. |
| `silent-hill.css` | legacy | `--btn-hover-text: #332E2A;` `--hover-label-floor: 0;` `--hover-label-ceiling: 0.32;` plus the two rules | Same. The theme's `--text` `#3A3530` reads only 4.36 on the pressed fill `#A19A92`, so the ink is one step darker (4.83). |

The two end-of-file rules for `mirrors-edge`, `portal`, `silent-hill`:

```css
/* hover labels on a pale ground: these two base rules hard-code white (their fills are not --btn-hover-bg) */
.update-btn:hover { color: var(--btn-hover-text); }
#filter-chip-clear:hover { color: var(--btn-hover-text); }
```

Why rules and not a base change: `#filter-chip-clear:hover` and `.update-btn:hover` hard-code `#fff` in `base.css`, and their fills are `--update-btn-hover-bg` and the chip, not `--btn-hover-bg`. I tried swapping both to `var(--btn-hover-text)` in base: it fixed the three pale themes and **broke `star-wars-separatist`** (6 pairs: dark ink on its dark chip and dark update banner). Reverted. This is the same four-rule pattern `2001`, `promise-mascot` and Republic already carry.

**Contrast gate and the four legacy hashes.** `dune`, `mirrors-edge`, `portal`, `silent-hill` are unchanged legacy themes today (warn only). Editing them makes `npm run check:contrast` treat them as changed. Measured on a scratch repo: **exactly four errors, and each finding is identical to that theme's current warning** (`--btn-close-color on --panel-bg` 3.30, 2.95, 3.35 and 2.79; `portal` also `--text-dim` 4.29 and `--accent-c` 2.07). Nothing new. Do **not** run `--rebaseline`: it rewrites 45 hashes (41 earlier redesigned themes plus mine). Update only the four entries, from the tool's root, with the tool's own hash function:

```
node -e "const fs=require('fs'),c=require('crypto'),p='scripts/themes-baseline.json',b=JSON.parse(fs.readFileSync(p,'utf8'));for(const t of ['dune','mirrors-edge','portal','silent-hill'])b[t]=c.createHash('sha256').update(fs.readFileSync('src/renderer/styles/themes/'+t+'.css','utf8').replace(/\r\n/g,'\n')).digest('hex');fs.writeFileSync(p,JSON.stringify(b,null,2)+'\n')"
```

Rehearsed: the diff touches exactly those four entries, and the gate then reports `101 theme(s) checked, 0 errors, 32 legacy warning(s)`, identical to today. The four themes stay on the legacy warning list for their static pairs until their batch redesigns them; this fix does not touch their rest-state colours.

### 2.4 Not touched

Rest-state colours of every control. `.update-btn` and `#filter-chip-clear` in base. `star-wars-separatist` (already carries `--btn-hover-text` from `817cb29`; reads clean). `persona-3/4/5`. The 33 themes with their own `.btn-remove:hover` fill. The two `.btn-remove` pins Ender already added. `app.js`. `package.json`. Any theme beyond the 12 files above: 89 theme files are byte-identical.

### 2.5 Where the fix reaches beyond hover and pressed (flag for Jane)

Two selectors in the band rule are not pointer states: `.theme-picker-item.active` (the arrow-key cursor row) and `.theme-picker-item.selected` (the current skin, shown while the list is open). They paint with the same hover fill pair as `:hover`, `check:hover` already measures them (`skin-row-active`, `skin-row-selected`), and splitting them from the hover row would make one list show two label colours. Effect: in 23 themes the label of the current-skin row and the cursor row lifts while the skin list is open; nothing else outside a pointer state changes. **If Jane wants hover and pressed only:** remove those two selectors from the block and the two readings from the gate; 23 themes' current-skin row then stays at 3.3 to 4.4:1. My pick: keep them.

### 2.6 Look check

Before and after crops (3x, black backdrop) of 19 states: Control DONE and current-skin row, Dune DONE, Yakuza CLOSE, Alien and Deus Ex remove, Mirrors Edge + FILE (hover and pressed), Silent Hill update button, Portal CLOSE, `ff9` CHECK pressed, then Hogwarts and Event Horizon DONE, Blair Witch CLOSE, Twin Peaks current-skin row, `wow-horde` tile name, LCARS remove, Shire and Tomb Raider DONE. Montages: scratch `eyes1.png`, `eyes2.png`. What I saw: hue family kept in every case; the red, orange and green labels become lighter, slightly less saturated versions of themselves; the pale themes' plain buttons go from invisible white to readable ink; remove buttons keep their colour family and get one step darker. The deep reds (`#8B2810`, `#991111`, `#880000`) lift furthest, to a salmon near `#BB7968` to `#C57167`: still red, clearly lighter. It happens on hover only; the rest label is the original.

## 3. Proof (all on scratch copies)

| Check | Result |
|---|---|
| Sweep before: 101 themes x 40 readings, Ender's fix applied, corrected fill rule | **4,040 readings; 56 themes and 350 pairs under their threshold**; 0 measurement errors |
| Sweep after: same 4,040 readings, edits of 2.2 and 2.3 applied | **0 themes, 0 pairs under threshold**; 0 measurement errors |
| Regressions (pass before, fail after) | **0** |
| Readings that changed | 419, in 61 themes: the 56 plus 5 that did not fail (Appendix B, 15 readings, none worse). The other 40 themes, including `2001`, `promise-mascot`, `star-wars-republic`, `star-wars-separatist`, `persona-3`, `persona-4`, `persona-5`: 0 changed readings |
| Lowest passing reading among the changed ones | labels **4.73** (`ff9` pressed), glyphs **3.47** (`metal-gear` remove). Margin at least 0.23 on labels and 0.47 on glyphs. Pre-existing thin passes that I did not move: `ff6` pressed 4.56 (6 pairs), `ff9` CLOSE hover 4.67, `life-is-strange` current-skin row 4.58 |
| Positive control, the band | `2001`, `promise-mascot`, `star-wars-republic` with the new base but **without** their `--hover-label-floor: 0` line: 24 pairs fail (for example `2001` DONE 5.01 to 2.32, tile name 6.03 to 2.95). The opt-out is load-bearing and the gate sees its absence |
| Positive control, the readings | Fault 1 (ring) reproduced and removed by pixel dumps of `ff9`; fault 2 by crop of `alien`; Ender's `817cb29` Republic and Separatist now read clean on the same sweep |
| `npm run check:contrast` on a scratch repo with the candidate | 4 errors (the four legacy themes, findings identical to today's warnings); after the 4-hash update: `101 checked, 0 errors, 32 legacy warnings` (2.3) |
| Eyes | 2.6 |

## 4. Fix now or fold into a batch

**Decision: fix all 56 now; fold none.** Reasons: (1) 47 of 56 get the fix from base with no theme-file edit, so there is nothing to fold; (2) the baseline for `check:hover` can ship as `{}` (section 5), so the gate is a plain gate from its first commit and no exemption has to be carried through eight batches; (3) a redesigned theme inherits the base rules, so the fix survives; only the 9 theme-specific lines of 2.3 are replaced when a batch rewrites that file; (4) the cost of fixing a batch-bound legacy theme now is five lines and one baseline hash.

| Batch | Themes in the 56 | Count | Disposition |
|---|---|---|---|
| 1, 2, 5 (built, unreleased) | `dead-space`, `persona-4`, `shire`, `stranger-things`; `siren`, `yakuza`; `ff9` | 7 | Fix now. No batch left to fold into. |
| 7 (next) | `alan-wake`, `blair-witch`, `event-horizon`, `lovecraft`, `silent-hill`, `tiny-bunny` | 6 | Fix now. Only `silent-hill` needs file edits (three lines and two rules). |
| 8 | `life-is-strange`, `twin-peaks`, `x-files` | 3 | Fix now, base only. |
| 9 | `diablo`, `dragon-age`, `mortal-kombat`, `wow-alliance`, `wow-horde`, `wow-legion`, `wow-nightelf`, `wow-scourge` | 8 | Fix now, base only. |
| 10 | `hogwarts`, `ministry-of-magic`, `mordor`, `ravenclaw`, `rivendell`, `slytherin` | 6 | Fix now, base only. |
| 11 | `blade-runner`, `doctor-who`, `dune`, `eve-online`, `lcars`, `mass-effect`, `the-expanse` | 7 | Fix now. `dune` needs one line. |
| 12 | `control`, `fatal-frame`, `resident-evil`, `scp`, `soma`, `stalker` | 6 | Fix now, base only. |
| 13 | `alien`, `half-life`, `matrix`, `metal-gear`, `predator`, `robocop`, `terminator` | 7 | Fix now, base only. |
| 14 (last, optional) | `deus-ex`, `evangelion`, `ghost-shell`, `mirrors-edge`, `portal`, `tron` | 6 | Fix now. `mirrors-edge` and `portal` are the worst themes on the list (36 pairs each, plain hover labels unreadable) and batch 14 may never run. |

Batches 7 to 13 hold 43 of the 56; batch 14 holds 6; 7 are already redesigned.

**Option, only if Jane prefers (not recommended):** `silent-hill` is the one theme in the batch that is clearly next. It could skip its three lines and two rules and sit in the hover baseline until batch 7. That costs a non-empty baseline with 36 pairs and leaves a 36-pair broken theme on the branch meanwhile; fixing it is cheaper.

**What every batch spec 7 to 14 inherits** (this goes into each batch spec's done-when; I own the line):

1. The redesigned theme must pass `npm run check:hover` with **no baseline entry**. A batch commit deletes any entry the theme had.
2. The spec states `--btn-hover-bg`, `--btn-hover-text`, `--btn-active-bg` with a measured ratio each for hover and pressed (carried from 2026-10-01 § 2.7).
3. A light-ground theme sets `--hover-label-floor: 0`, `--btn-hover-text`, a ceiling if its labels are too light, and the two end-of-file rules of 2.3. The gate fails a light theme that forgets.
4. A theme with its own opaque hover fill on DONE or CLOSE (like `dune`, `shire`, `yakuza`) measures the label on the painted fill and sets `--hover-label-floor` if the default 0.64 is not enough.
5. A theme that sets its own `.btn-remove:hover { background }` keeps white at 3:1 or better on it. A theme that does not is covered by the cap.
6. A theme that gives labels a pill or plate (the Persona themes) sets the label colour on that plate itself.

## 5. `check:hover`: the exact definition

Everything in 2026-10-01 § 2 stands except the four amendments marked **(A1)** to **(A4)**. Stated in full so Ender builds from one place.

### 5.1 Pairs measured

One page per theme (the real `index.html`, `base.css`, the theme, the real `app.js` with the gallery's stub preload). **40 readings per theme, 4,040 over the roster.** Pair id = `<id>/<state>`; that string is the baseline key. "Pressed" = hover plus active, because the pointer is still over the control.

| id | Element | States | Floor |
|---|---|---|---|
| `hdr-random`, `hdr-settings`, `hdr-hide`, `hdr-full` | `#btn-random-theme`, `#btn-settings`, `#btn-hide`, `#btn-fullscreen` | hover, pressed | 3:1 (symbol) |
| `chip-clear` | `#filter-chip-clear` (chip showing) | hover, pressed | 3:1 |
| `edit-add-file`, `edit-add-installed`, `edit-done` | `#btn-add-edit`, `#btn-add-installed`, `#btn-done-edit` (edit mode) | hover, pressed | 4.5:1 |
| `update-action`, `update-dismiss` | `.update-btn:not(.update-dismiss)`, `.update-dismiss` (banner showing) | hover, pressed | 4.5:1, 3:1 |
| `tile-remove` | `.btn-remove` (its tile hovered too) | hover, pressed | 3:1 |
| `tile-label` | `.tile-label` while its tile is hovered | hover | 4.5:1 |
| `tile-label-rename` | `.tile-label.renameable` (edit mode, tile hovered too) | hover | 4.5:1 |
| `set-hotkey-clear`, `set-check-update`, `set-close` | `#btn-hotkey-clear`, `#btn-check-update`, `#btn-close-settings` (Settings open) | hover, pressed | 3:1, 4.5:1, 4.5:1 |
| `skin-row-hover`, `skin-row-active`, `skin-row-selected` | `.theme-picker-item` plain, `.active`, `.selected` (skin list open) | hover; rest; rest | 4.5:1 |
| `cheat-close` | `#btn-close-cheatsheet` | hover, pressed | 4.5:1 |
| `picker-browse`, `picker-close`, `picker-row-hover` | `#btn-browse-picker`, `#btn-close-picker`, `.picker-item` name (installed picker open) | hover, pressed; hover | 4.5:1 |

17 buttons x 2 states + 6 single-state readings = 40.

### 5.2 Threshold

4.5:1 for a text label, 3:1 for a single symbol (WCAG 1.4.3 and 1.4.11), the ratio function of `check-theme-contrast.js` shared, not copied. A reading fails when it is strictly under its floor.

### 5.3 How it measures (what Ender implements; supersedes 2026-10-01 § 2.3 items 2 and 3)

1. **State by forcing, not by input.** `CSS.forcePseudoState` (`hover`; `hover` + `active`); no synthetic mouse or key events; `DOM.getDocument` called **once** per page (a second call drops forced states). Unchanged.
2. **(A2) Label colour = the computed `color`, read through a canvas**: set it as `fillStyle` on a 1 x 1 canvas and read the pixel back, then composite over the fill if alpha is under 1. String parsing is not enough any more: `oklch(...)` results from the band rule come back as `oklch(...)` text.
3. **(A1) Fill = the worst of these candidates.**
   - (a) The element's own computed `background-color`, **when its alpha is 1 and it has no `background-image`** (buttons only; not tile names or picker rows, whose box is the tile or row).
   - (b) Every colour that covers at least 20% of the non-label pixels in the label's **text box**. Text box = the text node's range rectangle, padded 3 px sideways and 2 px up and down, clipped to the element's border box. Non-label pixel = sum of channel differences from the label colour of 60 or more; if no pixel qualifies, use all pixels. The most frequent colour always counts, even under 20%.
   - Reading = the lowest ratio over (a) and (b). Why: fixed sample points read the ring on circular buttons; a single most-frequent colour picked a dark scanline stripe; the CSS fill alone missed an inset glow. See section 1.
4. Backdrop forced opaque black; transitions and animations off; `#app-entrance` hidden; ratio from the shared function. Unchanged.

### 5.4 Built-in positive controls (**A3**: now two; either one passing voids the run, exit 2)

- **PC1:** a fixture theme with `--btn-hover-bg:#E3C68E` and a white hover label must read under 2:1 on `edit-add-file/hover`.
- **PC2 (new):** the real `2001` theme with its `--hover-label-floor: 0` line stripped must read **under 4.5:1 on `edit-done/hover`** (measured 2.32). It proves the gate sees a light theme that forgets to opt out of the band.

### 5.5 Baseline and ratchet (**A4**)

File `scripts/themes-hover-baseline.json`, shape `{ "<theme>": ["edit-done/hover", ...] }`. **It ships as `{}`.** With 0 pairs failing after the fix, the gate is zero-tolerance from its first commit.

| Situation | Result |
|---|---|
| A failing pair, any theme, not in that theme's list | **error, exit 1** |
| A failing pair that is in the list | warning, printed |
| A listed pair that now passes | note "fixed, remove from the baseline"; never an error |

`--rebaseline` may only **delete** entries that now pass. It never adds one. Accepting a new failure is a hand edit of the JSON, visible in the diff, with the theme and the reason in the commit message (Senua reads that file's diff). A theme entering a fidelity batch has its entry deleted in the same commit. This keeps "ratchet" true: the file can shrink, never grow, without a human writing the line.

### 5.6 Output, exit codes, guards, wiring (unchanged from 2026-10-01 § 2.5 and 2.6)

Per-theme failing lines in the linter's style, last line `[hover] 101 theme(s), 4040 pair(s) measured, 0 errors, N grandfathered.`. Exit 0 pass, 1 new failure, **2 harness failure** (also: pairs measured is not exactly themes x 40, or a positive control does not fail, or any guard counter is non-zero, or a 180 s timeout). Flags `--only a,b` and `--rebaseline`. Runs as a new mode of the theme-gallery Electron harness with every existing guard (windows `show:false` and `focusable:false`, audio muted, focus, dialog, login-item and global-shortcut calls counted as no-ops, registry hashed before and after, ends only the process it started). `check:hover` script, `check` = `check:contrast` and `check:hover`, `prebuild` runs `check`. Budget under 60 s.

## 6. Build order and acceptance

For Ender, in this order (one commit per concern; Sully commits):

1. **Gate first, on the current HEAD.** Build `check:hover` (section 5) with an empty baseline. On HEAD it must **fail naming 56 themes and 350 pairs**, readings within 0.05 of Appendix A "worst now". Paste the observed FAIL (a gate never seen to fail is not a gate). Run PC1 and PC2 once with the fixture removed to see each void the run. **This run is also the Electron check:** the 350 and the per-pair readings are my Edge 154 numbers; any pair that differs by more than 0.05 is explained before step 2. Plan B if Electron 32 paints the band differently: replace the band rule with explicit per-theme hex values, which I will produce from the same sweep.
2. **The fix** (2.2 and 2.3). Re-run: 0 themes, 0 pairs; before and after over all 101 themes shows **419 changed readings in 61 themes** and 0 pass-to-fail. `2001`, `promise-mascot`, `star-wars-republic`, `star-wars-separatist`: 0 changed readings.
3. **Contrast baseline:** `npm run check:contrast` shows exactly the four errors of 2.3 and nothing else; update the four hashes with the snippet; re-run: `101 checked, 0 errors, 32 legacy warnings`.
4. **Baseline file** `{}` and the wiring (5.6).

For Futaba (on the committed build, not the working tree): `npm run check:hover` twice with identical output; a leak and focus count for the check itself; the real app, by eye, on `control`, `dune`, `mirrors-edge`, `silent-hill`, `alien` (hover DONE, the skin list, a remove button, a plain button pressed); a light theme with its opt-out line removed must fail the gate. For Sully: a patch to unreleased batch work on `wip/theme-fidelity`; version and changelog per the branch's release plan.

## 7. Hardest cases (my decisions; options noted)

| Theme | Why it is hard | Decision and measured result | Option not taken |
|---|---|---|---|
| `silent-hill` | Pale fog ground; plain hover labels white on pale; pressed fill `#A19A92` is dark enough that the theme's own `--text` fails (4.36) | Ink `#332E2A` (4.83 on pressed), ceiling 0.32 so DONE, CLOSE, name and rows go to dark brown (lowest 4.69) | Keep `--text` and lighten the pressed fill: changes a non-hover-label value |
| `portal` | Orange `#FF6600` DONE on a pale orange tint read 1.6:1; blue CLOSE 3.13 | Ceiling 0.41: DONE and CLOSE labels become deep orange-brown and deep blue (lowest 4.77, CLOSE) | Ceiling 0.44: CLOSE falls to about 4.5 |
| `mirrors-edge` | Red `#E02020` on pale: 2.7:1 | Ceiling 0.44 (lowest 4.82); red darkens to `#9A1313` | A grey label: loses the red |
| `dune` | Mid-tone ground `#452813`: the default floor reaches only 3.77 | Floor 0.70 (4.86); label `#C04000` becomes `#DB8467` | Darker hover fill: touches the fill, not the label, and still needs a lift |
| `shire`, `siren`, `yakuza`, `stranger-things` | Opaque hover fills that are lighter than the ground; label already above the default floor | Per-theme floors 0.73, 0.70, 0.70, 0.66 (lowest 4.79, 4.95, 4.98, 4.84) | One higher global floor: forecast to move 34 passing themes by up to 0.14 L, against 5 themes by under 0.1 now |
| Deep reds (`hogwarts`, `event-horizon`, `twin-peaks`, `mortal-kombat`) | `#8B2810` on near-black is 2.2:1; legible needs L 0.64 | Lift to a salmon red on hover only; the rest label is unchanged (lowest 5.3 to 5.6) | Hover label white: loses the hue. I judged a lighter red better; one-line change if Jane disagrees |
| `ff9` | White on the pressed fill 4.39; plus a false remove fail | One value, `--btn-active-bg #4575B2` (4.73); the remove fail was the sampler | Darker label: white is already the max |

None of the 56 needs an identity change, so there is no theme for Sergei to decide on.

Found while measuring, **not part of this fix, offered only**: the same fault exists at rest (DONE, CLOSE and the remove button's rest fill read 2 to 4.4:1 in the same themes; the contrast gate already carries the CLOSE half as its 32 legacy warnings). The batches fix it as each theme is redesigned. If Sergei wants it earlier it is a second spec of the same shape; I am not starting it.

Also offered, not fired: the `studio-skin` skill and `.claude/commands/create-theme.md` should list the new variables (`--hover-label-floor`, `--hover-label-ceiling`, `--btn-hover-text`) and the two pale-ground rules, so a new light theme is born with them. The gate would catch the omission, but the guide is where the author reads first. I will write that edit if Jane asks.

## 8. Evidence and machine safety

- **Method.** Headless Edge 154 started only through `scripts/qa/headless-browser.mjs` (a lease and a Job Object per launch), page background forced black, states forced with `CSS.forcePseudoState` (no input events of any kind), nothing shown, nothing took focus. Scratch copies of `src/renderer` (HEAD) and patched copies per candidate; the repo was never edited. Driver: the same mock window as 2026-10-01 (same DOM and classes, not `app.js`); Ender's readings from the real app must match Appendix A within 0.05.
- **Scratch.** `C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ee1f77cf-5889-412e-b022-29b9109a8847\scratchpad\hover57\`: `sweep2.mjs` (the sweep), `base5.json` (before), `cand4.json` (after), `r0` (HEAD copy), `r4` (candidate), `c4.json` and `mk.mjs` (how r4 is built from r0), `analyze2.mjs`, `appendix.mjs`, `eyes.mjs` with `eyes1.png`, `eyes2.png`, `repo4b` (contrast rehearsal), `leak2.mjs`.
- **Method per number.** Each failing pair and each fix value in this document is a reading from `base5.json` or `cand4.json`; per-theme floors and ceilings were searched offline from the baseline readings (smallest change reaching 4.65:1) and then confirmed by the sweep.
- **Leaks.** 15 browser launches (9 sweeps, 3 pixel dumps and crops, 2 montage runs, 1 version probe); each ended through its own `lease.close()` (those that print it returned `remaining: 0`). Final method: `headless-browser.mjs list` reports **no leases**; the guard's process snapshot (a CIM query) shows **0** browser processes whose command line names any lease directory (`hb-<id>`) I opened (12 ids recorded from my logs; the montage runs do not log theirs, which the empty lease list covers). Killed by me: 0. **Leak count: 0.**
- **Repo.** `git status --short` in `WIP/QuickLaunch` is empty at the end (Ender's work is committed). The only file I wrote there is this spec. The regions worktree was not touched. No git write command was run.

## Appendix A. The 56 themes under threshold, before and after

Status is the contrast baseline hash (CRLF-normalised): legacy = unchanged since the baseline, changed = redesigned. "Pairs" = failing pairs now. "Controls" = which families fail. "Worst now" = the lowest reading as pair, label colour, ratio; "After" = the same pair after the fix (painted label colour) and the lowest of that theme's previously failing pairs. All "after" readings pass.
| Theme | Status | Batch | Pairs | Controls | Fix | Worst now | After |
|---|---|---|---|---|---|---|---|
| alan-wake | legacy | 7 | 4 | DONE, CLOSE | base only | edit-done/hover #CC2010 3.45 | 5.28 (#DD5E4D); lowest of its 4 pairs 5.28 |
| alien | legacy | 13 | 2 | remove | base only | tile-remove/hover #FFFFFF 2.68 | 3.52 (#FFFFFF); lowest of its 2 pairs 3.52 |
| blade-runner | legacy | 11 | 4 | DONE, CLOSE | base only | edit-done/hover #B83000 3.05 | 5.2 (#D06B51); lowest of its 4 pairs 5.2 |
| blair-witch | legacy | 7 | 4 | DONE, CLOSE | base only | edit-done/hover #605848 2.47 | 5.14 (#918B80); lowest of its 4 pairs 5.14 |
| control | legacy | 12 | 8 | DONE, name, CLOSE, row | base only | edit-done/hover #CC1100 3.25 | 5.15 (#DE5D4B); lowest of its 8 pairs 5.15 |
| dead-space | changed | 1 | 2 | remove | base only | tile-remove/hover #FFFFFF 2.22 | 3.74 (#FFFFFF); lowest of its 2 pairs 3.74 |
| deus-ex | legacy | 14 | 2 | remove | base only | tile-remove/hover #FFFFFF 1.71 | 3.65 (#FFFFFF); lowest of its 2 pairs 3.65 |
| diablo | legacy | 9 | 6 | name, CLOSE, row | base only | tile-label-rename/hover #CC0000 3.31 | 5.36 (#DF5C4D); lowest of its 6 pairs 5.36 |
| doctor-who | legacy | 11 | 8 | DONE, name, CLOSE, row | base only | skin-row-selected/rest #0070C0 3.64 | 5.62 (#5091D0); lowest of its 8 pairs 5.23 |
| dragon-age | legacy | 9 | 5 | remove, CLOSE, row | base only | set-close/hover #A82020 2.65 | 5.43 (#CA6E65); lowest of its 5 pairs 5.09 |
| dune | legacy | 11 | 4 | DONE, CLOSE | base + floor 0.70 | edit-done/hover #C04000 2.57 | 4.86 (#DB8467); lowest of its 4 pairs 4.86 |
| evangelion | legacy | 14 | 4 | DONE, CLOSE | base only | set-close/hover #CC0000 3.36 | 5.43 (#DF5C4D); lowest of its 4 pairs 5.43 |
| eve-online | legacy | 11 | 2 | DONE | base only | edit-done/hover #5060A0 3.3 | 5.82 (#7C8ABB); lowest of its 2 pairs 5.82 |
| event-horizon | legacy | 7 | 8 | DONE, name, CLOSE, row | base only | edit-done/hover #991111 2.2 | 5.33 (#C57167); lowest of its 8 pairs 5.29 |
| fatal-frame | legacy | 12 | 10 | DONE, remove, name, CLOSE, row | base only | edit-done/hover #5060A0 3.08 | 5.43 (#7C8ABB); lowest of its 10 pairs 5.43 |
| ff9 | changed | 5 | 6 | plain | base + `--btn-active-bg` #4575B2 | edit-add-file/active #FFFFFF 4.39 | 4.73 (#FFFFFF); lowest of its 6 pairs 4.73 |
| ghost-shell | legacy | 14 | 4 | DONE, CLOSE | base only | edit-done/hover #8040D0 3.25 | 5.35 (#9B72DE); lowest of its 4 pairs 5.35 |
| half-life | legacy | 13 | 4 | DONE, CLOSE | base only | edit-done/hover #5A8050 3.87 | 5.37 (#77976F); lowest of its 4 pairs 5.37 |
| hogwarts | legacy | 10 | 4 | DONE, CLOSE | base only | set-close/hover #8B2810 2.23 | 5.61 (#BB7968); lowest of its 4 pairs 5.61 |
| lcars | legacy | 11 | 4 | remove, CLOSE | base only | tile-remove/hover #FFFFFF 2.46 | 3.89 (#FFFFFF); lowest of its 4 pairs 5.49 |
| life-is-strange | legacy | 8 | 2 | DONE | base only | edit-done/hover #4878A0 3.71 | 5.24 (#6A91B2); lowest of its 2 pairs 5.24 |
| lovecraft | legacy | 7 | 4 | DONE, CLOSE | base only | edit-done/hover #806020 3.21 | 5.51 (#A1885E); lowest of its 4 pairs 5.51 |
| mass-effect | legacy | 11 | 4 | DONE, CLOSE | base only | edit-done/hover #C0001C 3.05 | 5.47 (#D9625B); lowest of its 4 pairs 5.47 |
| matrix | legacy | 13 | 2 | DONE | base only | edit-done/hover #008F11 4.21 | 5.65 (#4AA348); lowest of its 2 pairs 5.65 |
| metal-gear | legacy | 13 | 6 | remove, name, row | base only | tile-remove/hover #FFFFFF 2.01 | 3.47 (#FFFFFF); lowest of its 6 pairs 3.47 |
| ministry-of-magic | legacy | 10 | 4 | name, row | base only | skin-row-selected/rest #007858 3.33 | 5.63 (#5C9B82); lowest of its 4 pairs 5.63 |
| mirrors-edge | legacy | 14 | 36 | plain, DONE, name, CLOSE, row | base + pale set (ink #404850, ceiling 0.44, 2 rules) | update-action/hover #FFFFFF 1.61 | 5.75 (#404850); lowest of its 36 pairs 4.82 |
| mordor | legacy | 10 | 8 | DONE, name, CLOSE, row | base only | edit-done/hover #CC4800 3.67 | 4.78 (#D7663C); lowest of its 8 pairs 4.78 |
| mortal-kombat | legacy | 9 | 2 | DONE | base only | edit-done/hover #B01010 2.75 | 5.54 (#D06A5D); lowest of its 2 pairs 5.54 |
| persona-4 | changed | 1 | 2 | remove | base only | tile-remove/hover #FFFFFF 2.76 | 3.82 (#FFFFFF); lowest of its 2 pairs 3.82 |
| portal | legacy | 14 | 36 | plain, DONE, name, CLOSE, row | base + pale set (ink #3A4050, ceiling 0.41, 2 rules) | edit-add-file/hover #FFFFFF 1.65 | 6.26 (#3A4050); lowest of its 36 pairs 4.77 |
| predator | legacy | 13 | 8 | remove, name, CLOSE, row | base only | tile-remove/hover #FFFFFF 2.28 | 3.72 (#FFFFFF); lowest of its 8 pairs 4.97 |
| ravenclaw | legacy | 10 | 8 | DONE, name, CLOSE, row | base only | skin-row-selected/rest #4068B0 3.35 | 5.43 (#6C8CC5); lowest of its 8 pairs 5.43 |
| resident-evil | legacy | 12 | 8 | DONE, name, CLOSE, row | base only | edit-done/hover #BB0000 2.88 | 5.43 (#D66556); lowest of its 8 pairs 5.43 |
| rivendell | legacy | 10 | 2 | remove | base only | tile-remove/hover #FFFFFF 2.36 | 3.62 (#FFFFFF); lowest of its 2 pairs 3.62 |
| robocop | legacy | 13 | 2 | DONE | base only | edit-done/hover #CC2020 3.46 | 5.29 (#DD5E53); lowest of its 2 pairs 5.29 |
| scp | legacy | 12 | 4 | DONE, CLOSE | base only | edit-done/hover #CC0000 3.3 | 5.35 (#DF5C4D); lowest of its 4 pairs 5.35 |
| shire | changed | 1 | 4 | DONE, remove | base + floor 0.73 | edit-done/hover #E27A54 4.08 | 4.79 (#E88C6B); lowest of its 4 pairs 4.79 |
| silent-hill | legacy | 7 | 36 | plain, DONE, name, CLOSE, row | base + pale set (ink #332E2A, ceiling 0.32, 2 rules) | edit-add-file/hover #FFFFFF 2.29 | 5.85 (#332E2A); lowest of its 36 pairs 4.83 |
| siren | changed | 2 | 2 | DONE | base + floor 0.70 | edit-done/hover #E8666A 4.39 | 4.95 (#EC7576); lowest of its 2 pairs 4.95 |
| slytherin | legacy | 10 | 4 | name, row | base only | skin-row-selected/rest #188040 3.78 | 5.89 (#5B9E6C); lowest of its 4 pairs 5.89 |
| soma | legacy | 12 | 1 | row | base only | skin-row-selected/rest #008A9A 4.43 | 5.63 (#429BA8); lowest of its 1 pairs 5.63 |
| stalker | legacy | 12 | 4 | DONE, CLOSE | base only | edit-done/hover #904020 2.59 | 5.33 (#B67C66); lowest of its 4 pairs 5.33 |
| stranger-things | changed | 1 | 4 | remove, CLOSE | base + floor 0.66 | tile-remove/hover #FFFFFF 2.11 | 3.65 (#FFFFFF); lowest of its 4 pairs 4.84 |
| terminator | legacy | 13 | 4 | DONE, CLOSE | base only | edit-done/hover #CC1000 3.41 | 5.41 (#DE5D4B); lowest of its 4 pairs 5.41 |
| the-expanse | legacy | 11 | 8 | DONE, name, CLOSE, row | base only | set-close/hover #AA2010 2.71 | 5.49 (#CB6E5E); lowest of its 8 pairs 5.49 |
| tiny-bunny | legacy | 7 | 8 | DONE, name, CLOSE, row | base only | edit-done/hover #A02030 2.42 | 5.26 (#C67070); lowest of its 8 pairs 5.15 |
| tron | legacy | 14 | 2 | remove | base only | tile-remove/hover #FFFFFF 2.53 | 3.85 (#FFFFFF); lowest of its 2 pairs 3.85 |
| twin-peaks | legacy | 8 | 6 | name, CLOSE, row | base only | set-close/hover #880000 1.99 | 5.79 (#BF756A); lowest of its 6 pairs 5.36 |
| wow-alliance | legacy | 9 | 6 | remove, name, row | base only | skin-row-selected/rest #2060C0 2.97 | 5.26 (#5F8CD4); lowest of its 6 pairs 5.26 |
| wow-horde | legacy | 9 | 8 | DONE, name, CLOSE, row | base only | skin-row-selected/rest #B81818 2.78 | 5.12 (#D3675B); lowest of its 8 pairs 5.12 |
| wow-legion | legacy | 9 | 2 | DONE | base only | edit-done/hover #802090 2.32 | 5.39 (#AD72B8); lowest of its 2 pairs 5.39 |
| wow-nightelf | legacy | 9 | 8 | remove, name, CLOSE, row | base only | skin-row-selected/rest #8070C0 4.1 | 4.96 (#8D80C8); lowest of its 8 pairs 4.96 |
| wow-scourge | legacy | 9 | 2 | DONE | base only | edit-done/hover #2050A0 2.45 | 5.63 (#6C8DC4); lowest of its 2 pairs 5.63 |
| x-files | legacy | 8 | 4 | DONE, CLOSE | base only | edit-done/hover #C02828 3.31 | 5.42 (#D5655C); lowest of its 4 pairs 5.42 |
| yakuza | changed | 2 | 4 | DONE, CLOSE | base + floor 0.70 | edit-done/hover #F0474D 3.92 | 4.98 (#F76B6A); lowest of its 4 pairs 4.98 |

## Appendix B. Themes that did not fail but have readings that move

All 15 readings stay passing; none gets worse. The cause is rule (b) or, for `tomb-raider`, rule (a).

| Theme | Reading | Before | After |
|---|---|---|---|
| `cyberpunk` | `tile-remove` hover and pressed (fill `#FF4D6A` to `#E3435D`) | 3.22 | 4.02 |
| `gryffindor` | `tile-remove` hover and pressed (fill `#F0656A` to `#D4585D`) | 3.10 | 3.92 |
| `pip-boy` | `tile-remove` hover and pressed (fill `#64A000` to `#609900`) | 3.20 | 3.47 |
| `pip-boy` | `edit-done`, `set-close` hover and pressed (label `#64A000` to `#64A001`: a rounding step of the colour round trip, not a visible change) | 6.19, 6.02 | 6.19, 6.02 |
| `the-sandman` | `tile-remove` hover and pressed (fill `#C08020` to `#B4781D`) | 3.31 | 3.72 |
| `tomb-raider` | `edit-done` hover and pressed (label `#788080` to `#878E8E`) | 4.51 | 5.46 |

## Build check (Judy, 2026-10-02, tree `c5caaf0` plus Ender's uncommitted gate and fix): **APPROVED**

I ran `npm run check:hover` myself in that tree (offscreen, output sent to my scratch folder) and compared its 4,040 readings with my after-fix sweep and my before-fix sweep.

| Check | Result |
|---|---|
| Gate run | `101 theme(s), 4040 pair(s) measured, 0 errors, 0 grandfathered`, exit 0, 36.6 s; guards all 0; `processes 36 started, 0 left`; registry unchanged; baseline `{}` |
| Positive controls | PC1 `1.65:1` (my number: 1.65), PC2 `2.32:1` (my number: 2.32, to the digit) |
| Pass or fail, gate against my sweep, 4,040 readings | **0 flips** |
| Label colours | 4,024 of 4,040 identical; 16 off by one colour step (Edge 154 against Electron 32.3.3 rounding in the band). Nothing near a threshold depends on it |
| Lowest margin over the 350 pairs the fix repaired, in the gate's own numbers | **0.21** (`silent-hill` current-skin row, 4.71). Whole roster: lowest is the untouched `ff6` pressed 4.56 (my sweep: 4.56) |
| Readings that differ from my sweep by more than 0.05 | 964 in the after-fix state (Ender counts 878 against the before state). Within 1.0 of their floor the largest difference is 0.28 (`life-is-strange` tile name, mine 5.38, gate 5.10); the largest anywhere is 0.74 on readings at 14 to 17:1 that nothing depends on |

**Why the differences are acceptable.** They sit on see-through fills and tile names. My sweep drove a mock page, so the ground behind a translucent fill (tile art, header, panel) was not the one the real app paints; the gate drives the real `app.js` and is the truth. No difference changes a pass or a fail, and none touches a fixed pair's margin by more than 0.29.

**One correction to this spec's wording.** Section 6 step 1 said Ender's readings must match Appendix A within 0.05 on every pair. That was too strict for a mock-page sweep. The standard that holds, and that Ender met, is: the failing set matches exactly (350 pairs, 56 themes), the "worst now" reading of each of the 56 themes matches within 0.05 (56 of 56), and every label colour matches except the 16 one-step Electron roundings. **From here the gate's numbers are authoritative and Appendix A is an estimate.** No change to the fix, the values in 2.3 or the gate definition is needed.

Leak count for this check: 0. Method: the gate reports `36 started, 0 left`; `headless-browser.mjs list` shows no leases; a process listing (CIM query) before my run showed 0 `electron.exe` and 0 `QuickLauncher.exe`, and 0 processes whose command line names my scratch folder afterwards. One thing to know: right after my run a different run of the gate (started at 13:14:34, default work folder, not mine) showed 36 Electron processes; they ended by themselves within about 80 s and the count returned to 0. I started and ended nothing of anyone else's.
