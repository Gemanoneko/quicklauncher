# QuickLaunch: skin picker behaviour. UX spec

Judy. Written 2026-10-02. Every UX call below is made. One item changes what the tool does and is flagged for Sergei (section 0, row 9).

- Repo: `WIP/QuickLaunch`, branch `wip/theme-fidelity`. Measured on the source of `39e7951`; HEAD has since moved to `c5caaf0` (a docs-only commit: `src/renderer` is byte-identical between the two).
- Source: Futaba's `QuickLaunch_QA_HoverSearch_2026-10-02.md` (F1 Major, F2, F3, F4, F5, pattern alert 2: the Esc and focus family).
- Written, not committed. Per ProcessRules § Delegation-brief hardening item 5, Sully commits this file before Ender is briefed.
- Nothing in the repo was edited by this work. Ender's uncommitted hover work in `scripts/` was not touched.
- Every behaviour below was built in a scratch prototype and run with real key and mouse input against the real `index.html`, `base.css`, theme CSS and `app.js` (method and counts in section 12). The prototype is a measuring tool, not code to ship; Ender owns the code.

## 0. Decisions in one table

| # | Question | Decision |
|---|---|---|
| 1 | After a pick, what state are the field and list in? (F1) | The list closes, the field empties, **focus stays in the field**. Typing, clicking the field, ArrowUp and ArrowDown all reopen the list. This state is called PARKED. |
| 2 | What does Enter do? (F1, F3) | It picks **the highlighted row, and only while the list is showing**. A row is always highlighted when there are rows: row 1 of a search result, or the current skin when nothing is typed. Enter never acts on a hidden list and never on an unhighlighted row. |
| 3 | Enter on an empty field? (F3) | Closes the list and keeps the current skin. It no longer switches to 2001. The same holds for spaces and punctuation-only text. |
| 4 | Esc? (F2) | **One press, one layer, innermost first.** List open: Esc closes the list, empties the field, keeps focus, and **stops there** (Settings stays). List closed: Esc goes on and closes Settings, as today. |
| 5 | "the s" returns 66 rows (F4) | **Leave it.** Section 6.1. |
| 6 | Joined words add tier-1 noise (F5) | **Change it.** Joined words (`pipboy`, `halflife`) may still *start* a match; they stop matching *inside*. 497 junk rows go; nothing real is lost. Section 6.2. |
| 7 | How does the user tell the Enter row from the current skin? | The Enter row gets a 2 px bar on its left edge in `var(--text)`. Without it the two rows differ by a median 1.08:1 over 101 skins (identical in Cyberpunk); with it the bar clears 3:1 in all 101 (min 4.96). Section 3.8. |
| 8 | How is a pick confirmed? | The skin changes at once (the whole window re-skins) and the list closes. No toast, no new string. Picking the skin that is already current closes the list and saves nothing. Section 4. |
| 9 | **Flag for Sergei** | Row 6 changes which rows appear for short queries: 313 of 47,952 two- and three-character queries list fewer rows, 231 of them become NO MATCHES (they listed only junk), and in 16 the row Enter picks is now a real match instead of junk. Nothing else here changes what the tool does. **Decided: yes (Addendum, ruling 1).** |
| 10 | New controls, strings, tooltips | **None.** No new control, so no tooltip is owed (ProcessRules § A new control is born with its tooltip). No new or changed user-facing string. |

## 1. What is wrong, measured on HEAD

The same 35 probes ran on HEAD and on the prototype (section 12). HEAD fails 46 of 113 checks; the prototype fails none. The defects:

| # | Finding | Measured on HEAD | Cause |
|---|---|---|---|
| F1 | After a pick the list never returns, and Enter then switches blind | Pick `sith` with Enter, type `rebel`: list hidden (1 row built behind it). Click the field: nothing. Enter: skin becomes Rebel. | The list opens only from the `focus` event; a pick leaves focus in the field, so no event fires again. `input` rebuilds a hidden list. |
| F2 | Esc in the field also closes Settings | With edit mode on, fullscreen on and Settings open, **one** Esc in the field: Settings closes, edit mode exits, and `exit-fullscreen` is called. | The field closes its list, then the event bubbles to three independent document listeners. |
| F3 | Enter on an empty field switches to `2001: A SPACE ODYSSEY` | skin becomes 2001, one save. Same for `:` (lists all 101, first row wins). | No row is highlighted, so the first row wins. |
| a | A stale blur timer wipes a reopened list | `blur()` then `focus()` within 150 ms: list closed and text wiped 150 ms later, field still focused (the F1 state). | `blur` runs `setTimeout(closePicker, 150)`; nothing cancels it. |
| b | Enter twice quickly saves twice | Two Enters 20 ms apart, save taking 80 ms: **2 saves**. | The list closes only after the save returns. |
| c | Right and middle click on a row pick the skin | Both pick. | `mousedown` handler never checks the button. |
| d | Enter during IME composition picks a skin | A composition-flagged Enter (`isComposing`, `keyCode` 229) picks and closes. | The field handler has no composition guard, on any key (the document handler has one). |
| e | Outside changes wipe what you typed | `settings-changed-externally` (tray toggles, store reload) while the list shows `sith`: field emptied, list still showing its 1 row. | `applySettings()` writes `elThemeSearch.value = ''`. |
| f | Resize leaves the list detached | Window 424 x 300 to 520 x 420 with the list open: list overlaps the field by 28.5 px (gap -28.5, should be 3). | Placement is computed once, at open. |
| g | The first arrow key throws the list to the top | Current skin FINAL FANTASY VII sits at scroll 519 (at the very bottom edge of the list). First ArrowDown: row 1, scroll 0. | Arrows start from "nothing active" and pick row 1. |
| h | A press on the NO MATCHES message closes the list | List closed, focus on the page body. | The message is not a row, so its press moves focus off the field. |
| i | The Enter row cannot be told from the current skin | Rendered row tints, 101 skins, active row against current-skin row: median **1.08:1**, 67 under 1.10, 96 under 1.20; pixel-identical in Cyberpunk, Dead Space, FF7, FF8, Persona 4 and The Shire. Active row against a plain row: under 1.10 in 79 skins. | Both rows use faint accent tints (7% and 13% alpha). |

Measured and **not** defects, so no rule is added for them: pressing the list's own scrollbar keeps the list open and scrolls it; the wheel over the open list scrolls the list and leaves the Settings body still; clicking the field while the list is open changes nothing (it is not rebuilt); Tab out of the field closes the list with no pick.

## 2. The model: three states

| State | Field | List | Reached by |
|---|---|---|---|
| **IDLE** | empty, not focused | hidden | Settings opens; blur; Tab or click away; Settings hides; window deactivates |
| **OPEN** | focused, text = the query | showing, exactly one row highlighted when there are rows | any "open" input in section 3 |
| **PARKED** | focused, empty | hidden | a pick; Esc in OPEN |

Five invariants. Each is tested in section 10 and each has a defect behind it:

- **I1** The field is empty whenever the list is hidden.
- **I2** The list is showing only while the field is focused and the window is active.
- **I3** The highlighted row is the row Enter picks. Enter never acts on a hidden list.
- **I4** The list always shows the matches for the field text. Only the picker writes the field.
- **I5** The list closes before a pick is applied or saved.

## 3. Behaviour by input

Rows are inputs, columns are states. "Stays" means no rebuild, no flicker.

| Input | IDLE | PARKED | OPEN |
|---|---|---|---|
| Click the field, Tab into it, click the label SKIN | Opens: all 101 rows, current skin highlighted | Opens (same) | Stays open; text and highlight kept |
| Type, paste or delete (any `input` event) | not possible (no focus) | Opens with that text | Rebuilds (3.2) |
| ArrowDown, ArrowUp | not possible | Opens (all 101, current skin highlighted); **the key does nothing else** | Moves the highlight one row, clamped at both ends, no wrap (3.3) |
| Enter | not possible | Nothing (no pick, no save, no list) | Picks the highlighted row (3.4); on NO MATCHES nothing happens and the text stays |
| Esc | Goes on to the app (Settings, edit mode and the rest) | Goes on: **closes Settings** | Closes the list, empties the field, keeps focus. **Consumed: nothing else sees this Esc.** |
| Tab, Shift+Tab | Normal focus move | To IDLE; focus moves on (CHECK FOR UPDATES, or the control before) | Closes the list at once, empties the field, **no pick**; focus moves on |
| Click anywhere outside the field and list | no effect on the picker | to IDLE | Closes the list at once, empties the field, no pick |
| Click a row, primary button | not possible | not possible | Picks that row (3.4) |
| Click a row, right or middle button | not possible | not possible | Nothing: no pick, list stays |
| Window loses focus | n/a | to IDLE | to IDLE: list closed, field emptied, field gives up focus (3.6) |
| Window resized | n/a | n/a | List re-placed from the field's new position (3.7); stays open |
| Settings hidden, by any route | n/a | to IDLE | to IDLE |

### 3.1 The highlighted row

- **Filtered** means the query has at least one search token after normalising (the existing `searchTokens` rule). Empty, spaces-only and punctuation-only queries are **not filtered**: they list all 101 rows.
- **Filtered list:** row 1 is highlighted.
- **Unfiltered list:** the **current skin's row** is highlighted and sits mid-list (the list scrolls so the row is centred where the list's ends allow). If the current skin has no row, nothing is highlighted: Enter does nothing and the first arrow press highlights row 1.
- **NO MATCHES:** nothing is highlighted.
- After **every** rebuild (every keystroke, paste, delete) the highlight is reset by the rules above and the list scrolls to its top (filtered) or to the current skin (unfiltered). A highlight made with the arrows does not survive typing: type `star wars`, arrow to row 3, type ` s`: row 1 is highlighted again.
- The highlighted row is always fully inside the list's visible area, after every open, rebuild and arrow press.
- The mouse pointer keeps its own hover tint and **does not** move the highlight. Two tints can be on screen; the bar (3.8) marks the row Enter picks.

### 3.2 Typing

Typing, pasting and deleting rebuild the list from the field text with `matchThemes` (unchanged apart from section 6.2) and re-apply 3.1. From PARKED the first character also opens the list. Spaces count as typing: a lone space from PARKED opens the full list. There is no debounce: the rebuild measured at 0.09 ms.

### 3.3 Arrows

- ArrowDown moves the highlight to the next row, ArrowUp to the previous, scrolling the list by the least amount that shows the row fully. Both clamp: no wrap.
- From the opening highlight (the current skin when unfiltered, row 1 when filtered) the first ArrowDown goes to the **next** row. It never jumps to row 1 of the whole list.
- Arrows with the list hidden (PARKED) only open the list (table above). They never change the skin.
- Home, End, PageUp and PageDown stay with the text field (caret movement). Not changed.

### 3.4 Enter and the pick

Enter acts only in OPEN, on the highlighted row, in this order:

1. **Close the list** (hide it, unlock the settings body, empty the field). Focus is not touched: the field keeps it (PARKED).
2. **If the picked key equals the current skin** (`settings.theme || 'cyberpunk'`): stop. No change, no save. This is what Enter on an unfiltered list does.
3. Otherwise set the skin, apply it (`applySettings()`), and save with the existing `save-settings` call. **The close does not wait for the save.** A failed save keeps today's behaviour (the existing save-error banner).

A click on a row follows exactly the same three steps, on mouse **press** with the primary button only, as today. Both paths call one function; the synthetic `MouseEvent` dispatch that Enter uses today goes away.

Because step 1 comes first, a second Enter or click lands on a closed list and does nothing: one pick, one save (measured: 2 saves on HEAD, 1 on the prototype with an 80 ms save).

### 3.5 Esc

- **OPEN:** the field's keydown handler closes the list, empties the field, keeps focus, and calls `preventDefault()` and `stopPropagation()`. The `stopPropagation()` is what keeps the Esc away from the three document listeners (Settings, edit mode, fullscreen). It is the same pattern the hotkey recorder already uses for its own Esc.
- **IDLE and PARKED:** the field does nothing with Esc. It bubbles to the document handler, which closes Settings through the one Settings close function (3.9).
- **During IME composition** (`e.isComposing` or `keyCode === 229`) the field handler ignores **every** key, as the document handler already does. Esc cancels the composition and nothing else; Enter confirms the composition and picks nothing.
- The field no longer calls `searchEl.blur()` on Esc. Focus stays so that typing reopens the list.

Result: Esc from an open list takes two presses to leave Settings (close the list, close Settings). Esc from PARKED takes one.

### 3.6 Focus, blur, Tab, window

- The list opens on `focus` (pointer, Tab or label click) **and** on click, typing, and arrows when PARKED. `focus` alone is not enough: that was F1.
- **`blur` closes the list at once.** No timer. A 150 ms delay is not needed (a row click never blurs the field because rows call `preventDefault()` on press) and it caused defect a. If any timer remains it must be cancelled by `focus`.
- The list is never a Tab stop and never takes focus. In current Chromium (Edge 154, measured) a scrolling list is keyboard-focusable: Tab from the field landed on the list, and once the list hid, focus fell to the page body. The shipped Electron 32 (Chromium 128) does not do this, so this is **defensive**: give the list `tabindex="-1"` in `index.html`, **and** call `preventDefault()` on `mousedown` anywhere in the list (a tabindex list otherwise takes focus when its scrollbar is pressed, which closes it: measured). Together, measured on Edge 154: Tab goes to CHECK FOR UPDATES, a scrollbar press scrolls the list and leaves it open.
- **Window deactivation** (hotkey hide, Alt+Tab): the list closes, the field empties, and **the field also gives up focus**, so coming back to the window never opens the list by itself. Chromium is expected to send `focus` to the focused control when its window is re-activated (not measured here); if the field still held focus, the "`focus` opens the list" rule would pop the list open over Settings. Mechanism: in the `blur` handler, after closing, `if (!document.hasFocus()) searchEl.blur();`. **Not verified headless, and the one rule here I could not test:** a headless page always reports focus (measured: switching focus emulation off changed nothing, 0 blur events). It is in Futaba's real-window list (section 10); if the mechanism does not hold there, Ender reports back rather than improvising.

### 3.7 Placement and resize

Placement is today's rule, kept: below the field by default, above it when there is under 150 px below and more room above; 3 px gap; `max-height` fills the available space (minimum 80 px); the settings body is scroll-locked while open. It moves into one function called on open **and** on window `resize` while open. Measured: at 424 x 300 the list is `x 20, y 10, 384 x 185` above the field (field `y 198`); after resizing to 520 x 420 the gap is 3 px and both edges are 20 px in.

### 3.8 The Enter-row marker

Tint alone cannot carry "the highlighted row is what Enter picks" (finding i). The rule:

- The **Enter row** (the highlighted row, class `active`) gets a **2 px bar on its left edge**, drawn as an inset box-shadow so nothing moves, in **`var(--text)`**.
- The **current-skin row** keeps only its tint and its text colour. **Mouse hover** keeps only its tint: no bar, so the bar always means "Enter picks this".
- On first open the Enter row and the current skin are the same row and show both.

Why `var(--text)` and not the accent colour: measured on rendered pixels, 101 skins, bar against the Enter row's own tint and against a plain row:

| Bar colour | Against the Enter row's tint | Against a plain row | Skins under 3:1 against the tint (WCAG 1.4.11) |
|---|---|---|---|
| `var(--text)` | min **4.96** | min **5.46** | **0** |
| the row's text colour (`--accent-text`) | min 2.71 | min 2.98 | 4 (mirrors-edge, resident-evil, silent-hill, wow-horde) |
| `--accent-c` | min 1.68 | min 1.73 | 11 |

Eyes: a 2 px near-white bar beside the yellow Deus Ex row in Cyberpunk; a dark bar beside the pale-blue Republic row in the light 2001 skin (offscreen crops; a real-window look is in section 10).

### 3.9 Settings has one way to close

Esc (document handler), CLOSE, CHECK FOR UPDATES and the gear toggle each hide Settings today with their own line. Make them call one `closeSettings()`: hide the overlay, and if the SKIN field holds focus, blur it. The blur is what resets the picker (I2). Chromium 154 already blurs a focused control inside a hidden panel (measured: one blur event, focus to the page body), so this is a one-line guarantee that does not depend on that. Opening Settings (the gear or the tray) always finds the picker IDLE. (At 424 x 300 the gear cannot be clicked while Settings is open: the panel covers it. Esc, CLOSE and CHECK FOR UPDATES are the routes in practice; the gear toggle still calls the same function.)

### 3.10 The picker owns its field

`applySettings()` stops writing `elThemeSearch.value`. A pick empties the field itself (3.4 step 1). Other callers of `applySettings()` (`store-reloaded`, `settings-changed-externally`) then leave typed text and the list alone (defect e).

## 4. How a pick is confirmed

Three cues, all existing:

1. **The skin changes at once.** The whole window re-skins, which is the loudest confirmation possible; a toast would be noise and would have to be written in every one of 101 skins' voices.
2. **The list closes and the field empties** (the "done" cue, and it uncovers the re-skinned Settings panel). Focus stays in the field, so the next skin is one keystroke away.
3. **The picked skin is the highlighted row the next time the list opens** (current skin, marked and centred).

Picking the skin that is already current gives cue 2 only, and saves nothing. Enter on an empty list is the same action, so it can never change the skin by accident.

## 5. The Esc ladder, and where this build stops

One press undoes one layer, innermost first. A layer that handles Esc stops it; a layer with nothing to undo lets it through.

| Layer, innermost first | Esc does | Status |
|---|---|---|
| IME composition | cancels the composition, app ignores the key | document handler has the guard; **the field gets it in this build** |
| Hotkey recording | cancels recording, stops the event | already correct |
| **Skin list open** | closes list, empties field, keeps focus, stops the event | **this build** |
| Rename input (edit mode) | cancels the rename | was a known leak (also exited edit mode, Futaba batch 6); **built per Addendum A.3 step 3** |
| Cheat-sheet | closes | document handler |
| Settings | closes (through `closeSettings()` after this build) | document handler |
| Installed-apps picker | closes | document handler |
| Filter text | clears | document handler |
| Fullscreen, edit mode | exit | were **two separate document listeners that ran on every Esc that reached the document**. **Built per Addendum A.2 and A.3: one handler, edit mode first, then fullscreen.** |

## 6. Search decisions (F4, F5)

### 6.1 "the s": leave it

Measured: `the` lists 9 rows, `the s` lists 66 (the dropped `the` leaves `s`, which starts 66 themes' words; 2001 is first), `the sh` lists 2, `the shire` 1. `star wars s` stays at 6 rows because `s` starts STAR.

Reasons to leave it: (1) the state lasts one keystroke while typing THE SHIRE and the next letter narrows it; (2) with the highlight now visible (3.1) nobody picks 2001 without seeing it highlighted; (3) the rule "every word you type must start a word in the name" is one sentence Sergei can predict, and every alternative (rank rows that contain a literal `the` first, ignore one-letter tokens) is a second rule that surprises him somewhere else. No change.

### 6.2 Joined-word noise: change it

**The rule.** Today a field with more than one word also gets its words glued together as one extra word (`pip boy` gives `pipboy`, `lara croft` gives `laracroft`) and that glued word can match **anywhere inside** (tier 1). The glued word is what makes `pipboy` and `halflife` work, and that only needs prefix matching. The change: **glued words take part in tier 0 (the typed word starts a word) only. Tier 1 (the typed text is inside a word) tests the real words only.** Tier order, label order inside a tier, the `the` rule and Enter's target are unchanged.

**Measured** (the matcher source taken verbatim from each `app.js`, run over every case):

| Check | Result |
|---|---|
| Futaba's 497 | Reproduced: **497** rows exist only because a glued word spans a word boundary, across 84 themes, over all 47,952 two- and three-character `[a-z0-9]` queries. |
| Lists that change | 313 of 47,952 (0.7%); 95 of the 1,296 two-character queries. Every change is a **pure removal**: 0 reorders, 0 additions, and every tier-0 list is identical. |
| Examples | `ac` loses TOMB RAIDER (from `laracroft`); `dl` loses the three SWL rows; `do` loses RIVENDELL, THE SHIRE and five WOW rows; `dr` loses STAR WARS: GALACTIC REPUBLIC. |
| The Enter row | Futaba's note that Enter never lands on noise holds only when a tier-0 row exists. When a query has no tier-0 rows, noise rows sort among the real tier-1 rows by label, so row 1 can be junk. **16 queries** have junk as row 1 today, all fixed: `alf` FATAL FRAME to HALF-LIFE, `alk` MORTAL KOMBAT to S.T.A.L.K.E.R., `ca` AC: ASSASSINS to LCARS, `ds` DEAD SPACE to SWL: DRAGON, `sts` GHOST IN THE SHELL to STAR WARS: SEPARATISTS, and 11 more. |
| NO MATCHES | **231** queries list only junk today (`acr` and `bra` list TOMB RAIDER; `arw` lists all six Star Wars rows) and will show NO MATCHES. |
| Nothing real lost | **0 of 26,337** (theme, query) pairs lost: every substring of every label (5,926 unique), as typed, upper-cased and space-padded, still lists its theme. 73 queries compared head against change (every query in the 2026-10-01 spec's section 3.5 table, plus `the`, `the s`, `star wars s`, `star w`): only `ac` differs (7 rows to 6). |

**Build.** Per theme keep two lists: `words` (label, key and alias words, as now) and `starts` (those words plus each field's glued word). Tier 0: every token starts a word in `starts`. Tier 1: every token is inside a word in `words`. Three small hunks: `searchWords`, the `THEME_SEARCH_WORDS` build, `themeSearchTier`. The existing orphan-alias warning and the `matchThemes` signature stay.

## 7. Copy and tooltips

No string is added or changed. The field keeps `SEARCH...`, the empty list keeps `NO MATCHES`, nothing is announced after a pick. No new control exists, so no tooltip is owed. The behaviour change shows only through what is highlighted and what stays open.

## 8. Layout and hit areas

- **No new element.** The list is the existing dismissible dropdown, the one exception class in ProcessRules § No UI element may cover another. At 424 x 300 it covers the settings rows above the field and the title, as today (Futaba's N1); that is by design. Only OPEN shows the list; PARKED and IDLE hide it, so after a pick nothing stays covered.
- **Hit rects, measured:** field `x 20, y 198, 384 x 26`; list above it `x 20, y 10, 384 x 185` (bottom 195, 3 px gap); at 520 x 420 the list is `x 20, y 10, 480 x 273.5`, bottom 283.5, field top 286.5 (gap 3). Rows are 26 px high, full list width.
- A click on the open list's rows is a pick wherever the list covers a control; that is what the list is for. Closing the list first (Esc, click outside the list, Tab) is how to reach a covered control.

## 9. Edits for Ender

Three files. Function names, not line numbers, because Ender is editing the same tree (orientation only: the picker block starts at `// ── Skin selection (searchable picker)`, about line 1960 of `app.js`).

**`src/renderer/app.js`**

1. **The picker block** (`(function () { const searchEl = elThemeSearch; ...`): implement sections 2 to 3.7.
   - One `open` boolean. `openPicker()`: scroll the field into view, lock the body, show the list, place it, set `open`, refresh. `closePicker()`: clear `open`, hide the list, unlock the body, empty the field; **never touches focus**. `pick(key)`: sections 3.4. `refresh()`: rebuild for the field text, scroll to top, apply 3.1. `place()`: today's placement code, called on open and on `resize` while open.
   - Listeners: `focus` and `click` open when closed; `input` opens when closed, else refreshes; `blur` closes at once; `mousedown` on the list element calls `preventDefault()`; `keydown` per 3.3 to 3.5 with the composition guard first; row `mousedown` calls `preventDefault()`, ignores `e.button !== 0`, calls `pick(key)`.
   - Delete: `setTimeout(closePicker, 150)`; the synthetic `MouseEvent` dispatch in the Enter branch; `searchEl.blur()` in the Esc branch.
2. **`applySettings()`**: delete the line `elThemeSearch.value = '';` (3.10).
3. **`closeSettings()`**: new, next to `openCheatsheet`; used by the Esc branch of the document keydown handler, the gear toggle, `btn-close-settings` and `btn-check-update`.
4. **Matcher**: the three hunks in 6.2.

**`src/renderer/index.html`**: add `tabindex="-1"` to `<div id="theme-picker-list" ...>` (3.6).

**`src/renderer/styles/base.css`**: one rule, directly after `.theme-picker-item.selected { ... }`:
`.theme-picker-item.active { box-shadow: inset 2px 0 0 var(--text); }`
No theme overrides these rows (only `stranger-things.css` touches them, and only their text colour), and the 101-skin measurement in 3.8 was taken with exactly this rule.

Not touched: themes, `THEME_ALIASES`, `THEME_NAMES`, the fullscreen and edit-mode Esc listeners, the cheat-sheet, the main process, the preload, `package.json`.

## 10. Acceptance (Futaba)

Real key and mouse input at 424 x 300, Settings open, current skin CYBERPUNK unless stated. "Closed" means list hidden and field empty. Section 12 says which probe covers each row; the same probes run on the committed build in the project's own Electron are the QA pass.

| # | Do | Expect |
|---|---|---|
| A1 | Click the field | Open, 101 rows, CYBERPUNK highlighted and fully visible, no save, body locked. Same from Tab (from the hotkey clear button) and from a click on the label SKIN. |
| A2 | Type `sith`, then Enter | While typing: 1 row, STAR WARS: SITH highlighted. After Enter: skin is Sith, **1 save**, list closed, field empty, **field still focused**, Settings open, body unlocked. |
| A3 | Then type `rebel` (list was closed) | List opens at once: REBEL ALLIANCE highlighted. Enter picks it (2 saves). Then `mando` and Enter (3 saves). |
| A4 | From PARKED: click the field; ArrowDown; Esc then ArrowUp | Each opens all 101 rows with the current skin highlighted. The two arrow presses change nothing (no save, skin unchanged). |
| A5 | From PARKED: Enter | Nothing: no save, no list, skin unchanged. |
| A6 | Click the field, Enter at once | List closes, skin **still CYBERPUNK**, 0 saves (not 2001). |
| A7 | Type `:` (lists 101), Enter | Same as A6. |
| A8 | Type `zzz`, Enter | List stays showing NO MATCHES, text stays `zzz`, nothing highlighted, no change, no save. |
| A9 | Type `cyberpunk`, Enter | List closes, 0 saves. |
| A10 | Type `si`, Esc | List closed, field empty and **focused**, **Settings still open**, no save. |
| A11 | Then Esc again. Also: right after a keyboard pick (PARKED), one Esc | Settings closes and the field is not the active element. Reopen Settings with the gear: IDLE (list hidden, field empty, not focused, body unlocked). |
| A12 | Edit mode on and fullscreen on, Settings open, click the field, Esc | Settings still open, edit mode still on, **no `exit-fullscreen` call**. The second Esc closes Settings **only**; edit mode and fullscreen stay until further presses (Addendum B1). |
| A13 | Type `star wars`: 6 rows. ArrowDown twice, then ArrowUp six times, ArrowDown twelve times, ArrowUp, Enter | Row 1 highlighted on typing; row 2, then row 3; clamps at row 1; clamps at the last row; one up from the last; Enter picks the arrowed row (SEPARATISTS). |
| A14 | `star wars`, ArrowDown twice, then type ` s` | Row 1 highlighted again. |
| A15 | Current skin FINAL FANTASY VII, click the field | FINAL FANTASY VII highlighted, centred (mid-point within one row of the list's middle), fully visible. ArrowDown: FINAL FANTASY VIII, list moved by at most one row, **not** scrolled to the top. |
| A16 | Same, type `si`, Backspace twice | 101 rows, FINAL FANTASY VII highlighted and visible again. |
| A17 | Type `sith`, click the row | Picks, 1 save, closed, empty, field focused. |
| A18 | Type `sith`, right-click the row; separately middle-click it | No pick, list stays open, no save. |
| A19 | Open the list, press the mouse on its scrollbar track well below the thumb. Separately, type `zzz` and press the NO MATCHES message | List stays open, focus stays in the field, the list scrolls. The NO MATCHES press changes nothing. |
| A20 | Type `si`, click a non-focusable spot (the version text) | List closed **within the click** (no 150 ms wait), field empty, no pick. |
| A21 | Type `si`, Tab | Closed, empty, no pick, focus on CHECK FOR UPDATES (not the list, not the page body), Settings open. |
| A22 | With the list open call `blur()` then `focus()` in the same task; wait 450 ms | List open with 101 rows, focus in the field. |
| A23 | Type `sith`, Enter twice 20 ms apart, with a save that takes 80 ms | Exactly **1** save. |
| A24 | Type `sith`, then send Enter and Esc as composition keys (`isComposing` true, `keyCode` 229) | No pick; list open; text `sith`; Settings open. |
| A25 | Open the list, resize the window to 520 x 420 | List still open, 3 px from the field, 20 px in from both sides. |
| A26 | Type `sith`, then have `settings-changed-externally` arrive | Text `sith` kept, list still showing the one matching row, highlighted. |
| A27 | Close Settings by Esc (twice), by typing `si` then clicking CLOSE, and by CHECK FOR UPDATES; reopen each time | IDLE every time: list hidden, field empty, field not focused, body unlocked. Also: hide the Settings overlay directly while the field is parked; the field is no longer the active element. |
| A28 | Wheel over the open list | The list scrolls, the Settings body does not move, the list stays open. |
| A29 | Click the field again while the list is open and a row is highlighted by arrows | Nothing changes: same text, same highlight, list not rebuilt. |
| A30 | Open the list with the arrows (from PARKED), then check the Enter row in 101 skins | The bar is on the Enter row only (not the current-skin row, not the hovered row); bar against the row tint and against a plain row is at least 3:1 in every skin (measured min 4.96 and 5.46). |
| A31 | Matcher, in node over the shipped functions | Section 6.2 table: 497 rows, 313 lists, 16 and 231 as listed, **0 lost of 26,337**; the 73-query table matches except `ac` (6 rows, no TOMB RAIDER). |

**Real window, away window only** (ProcessRules § Sergei is not QA; not doable headless):

1. Hide the window with the global hotkey while the list is open and while parked; show it again. Expect the list closed, and no list reopening by itself.
2. Real keyboard Esc, Enter and arrows on the real window at 150% scale, once on a Russian layout; real mouse presses on the list scrollbar.
3. Eyes on the Enter-row marker in a dark skin and a light skin (a visual change reaching Sergei).
4. Run every row above on the packaged build's Electron 32 (Chromium 128): this spec was measured on Edge 154.

## 11. Found while measuring, not part of this build (offer, not fired)

**Items 1 and 2 were approved by Sergei on 2026-10-02 and are built per Addendum Parts A and B; item 3 stays an offer.**

1. **Esc on Settings also exits edit mode and fullscreen in the same press.** Three document listeners (overlays, edit mode, fullscreen) each run on every Esc. Measured after this build with the list closed: Esc closes Settings, exits edit mode and calls `exit-fullscreen` together; the rename input's Esc leaks the same way (Futaba, batch 6). Fix: one document handler that walks the ladder in section 5 and stops at the first layer that acts. It changes what the tool does (Esc in Settings would no longer also leave fullscreen), so it is Sergei's call.
2. **The cheat-sheet says Esc will "hide window".** It never does: no code path hides the window on Esc (`hide-window` is wired only to the header button). Proposed row text (today: `Clear filter / close overlay / hide window`): `Clear filter / close panel / exit edit mode or fullscreen`.
3. Home, End, PageUp and PageDown in the 101-row list; ARIA combobox roles; showing the current skin's name in the idle field. None needed for a single sighted user's daily use; offer only if asked.

## 12. Evidence and machine safety

**Method.** Headless Edge 154.0.4258.48, started only through `scripts/qa/headless-browser.mjs` (`launchHeadless`: a lease and a Job Object). Input went to the headless page over the DevTools protocol (`Input.dispatchKeyEvent`, `Input.dispatchMouseEvent`, `Input.insertText`): never an OS input event, no window shown, nothing took focus. The page believes it has focus through `Emulation.setFocusEmulationEnabled` (in-process only). The real `index.html`, `base.css`, theme CSS and `app.js` ran against a stub `window.api` that records every call. Scratch copies: `head\` is `git archive 39e7951 src/renderer` (the CSP meta tag removed in the scratch copy only so file URLs run), `proto\` is that plus this spec built by `make-proto.mjs`. The shipped runtime is **Electron 32.3.3 (Chromium 128)**, older than the measuring browser; section 10 puts the same rows to the packaged build.

**What ran.**

| Check | Result |
|---|---|
| 35 probes, 113 checks, real input, 424 x 300 | **HEAD: 46 of 113 fail** (every defect in section 1 shows). **Prototype: 0 of 113.** |
| Probes against section 10 | A1 = P01 P02 P03; A2 = P04; A3 = P05; A4 = P06 P07; A5 = P08; A6 = P09; A7 = P10; A8 = P11; A9 = P25; A10 = P12; A11 = P13 P31; A12 = P14; A13 = P15; A14 = P16; A15 = P29; A16 = P30; A17 = P17; A18 = P18; A19 = P19 P34; A20 = P20; A21 = P21; A22 = P22; A23 = P23; A24 = P24; A25 = P26; A26 = P27; A27 = P28 P33; A28 = P32; A29 = P35 |
| Enter-row marker, 101 skins, rendered pixels | `distinct.mjs`: active vs current-skin median 1.08 (section 1, i); with the `var(--text)` bar: bar vs tint min 4.96, vs plain row min 5.46, **0 of 101 under 3:1**. `markers.mjs` compared three bar colours (table in 3.8). |
| Matcher, node, verbatim source | 73 table queries, 5,926 label substrings (26,337 theme and query pairs), all 47,952 two- and three-character queries: section 6.2. Futaba's 497 reproduced exactly. |
| Tab, scrollbar, `tabindex` variants | Three variants run on the same four probes (no `tabindex`; `tabindex` alone; `tabindex` plus the list `mousedown` guard): only the last is clean (3.6). |

**Positive controls.** HEAD through the same probes reproduces F1, F2 and F3 exactly as Futaba wrote them, and defects a to h. A probe is trusted only after it failed on HEAD or the check was shown to bite another way.

**Probe faults found and removed before any number was used.** (1) The gear route in the Settings-close probe clicked a list row: at 424 x 300 the open list, and then the Settings panel, cover the header gear; the route was changed to Esc, CLOSE and CHECK FOR UPDATES. (2) P16 typed `e` after `star wars` and got NO MATCHES; it now types ` s`. (3) The first scrollbar press landed on the thumb and scrolled nothing; it now presses well below it. (4) In `markers.mjs` a duplicate object key made the "row text" column read `--text`; found by reading the values, and the bar was then re-measured on rendered pixels with the exact rule. (5) HEAD's Tab-to-list result came from the newer browser, not Electron 32; that is why section 3.6 calls the `tabindex` rule defensive.

**Could not be measured:** window deactivation (3.6), the real Electron 32 run, and real OS input. All three are in section 10's real-window list.

**Machine safety.** 18 headless browser launches, every one through `launchHeadless`, each closed by its own `lease.close()` with `remaining: 0`. `headless-browser.mjs list` now shows **no leases**. **Leak count: 0.** Method: three read-only listings at the end. (1) The guard's own process snapshot: 35 browser-named processes on the machine, **0** naming my scratch folder or lease label `judy-picker-*`, **0** inside any guard lease, 0 Electron or QuickLauncher. (2) A CIM listing of every process whose command line names my folder, lease label or script names, shells excluded: **0 matches** of 462 processes. (3) `Get-Process` for msedge, chrome, electron and QuickLauncher: 35, none of them mine (37 at the start with 0 mine; the machine's own browsers come and go). Killed by me: 0 (no `taskkill`, no kill by name or PID). Browsers started by me outside the library: 0. QuickLauncher and Electron launched: 0. One background shell of mine (a `python3` heredoc left waiting on input) was stopped with `TaskStop` and left no process. Repo: the only file I added is this spec; `git status` also shows Ender's uncommitted hover files in `scripts/`, untouched by me; `src/` is identical to `39e7951`; the regions worktree was not touched; the parallel 57-theme hover spec file was not touched.

**Scratch** (`C:\Users\AnGeLZzZ\AppData\Local\Temp\claude\C--Antigravity-Projects-Studio-Illuminati\ee1f77cf-5889-412e-b022-29b9109a8847\scratchpad\picker-behaviour\`): `head\`, `proto\`, `protob\` (renderer copies), `make-proto.mjs`, `pb-lib.mjs`, `probes.mjs` (the 35 probes), `matcher.mjs`, `matcher2.mjs`, `distinct.mjs`, `markers.mjs`, `winfocus.mjs`, `shots.mjs` and `shots\`, `leakcount.mjs`, `runs\head.json`, `runs\proto.json`, `runs\distinct-bar0.json`, `runs\distinct-bar1.json`, `runs\markers.json`, and the `*.txt` outputs. The prototype is the behaviour reference if Ender wants to read one; it is not code to ship.

## Addendum — Sergei's rulings 2026-10-02

Relayed by Jane. Both rulings are yes. Where this addendum and sections 0 to 12 disagree, **this addendum wins**; the pointers added to section 0 row 9, section 5, section 10 A12 and section 11 say so in place.

| # | Ruling | Effect on the build |
|---|---|---|
| 1 | **Yes** to removing the glued-word mid-word matches (section 6.2). | Section 0 row 9's flag is closed: build section 6.2 exactly as written. Nothing else changes. |
| 2 | **Yes** to fixing the two older issues from section 11: Esc on Settings must not also exit edit mode and fullscreen; and the cheat-sheet's false "hide window" line gets fixed. | Part A (one Esc ladder) and Part B (the cheat-sheet string) below. Two more files' worth of edits, listed in A.3 and B. |

### Part A. One Esc, one layer: Settings, edit mode and fullscreen

**A.1 The rule is the picker's rule, applied to the whole window.** One Esc press undoes **exactly one** layer, the innermost one present. A layer that handles Esc takes it and nothing else sees it. With nothing to undo, Esc does nothing: it never hides the window and never quits (it never has; only the header button, the tray and the hotkey hide it).

**A.2 The ladder, innermost first. This order is final:**

| # | Layer present | One Esc does | Built |
|---|---|---|---|
| 1 | IME composition | Nothing in the app; the key belongs to the composition | document handler and skin field (section 3.5); the rename input has no guard and is not changed here |
| 2 | Hotkey recording | Cancels recording | already correct |
| 3 | Skin list open | Closes the list (section 3.5) | picker build |
| 4 | Rename input | Cancels the rename; **edit mode stays** | **new** (A.3 step 3) |
| 5 | Cheat-sheet | Closes it | existing |
| 6 | Settings | Closes it, through `closeSettings()` | existing, now consuming |
| 7 | Installed-apps picker | Closes it | existing |
| 8 | Filter text | Clears it; **edit mode stays** | existing, now consuming |
| 9 | **Edit mode** | Exits edit mode; **fullscreen stays** | **new** (A.3 steps 1 and 2) |
| 10 | **Fullscreen** | Exits fullscreen | **new** (A.3 steps 1 and 2) |
| 11 | Nothing | Nothing | stated, measured |

Why edit mode comes before fullscreen: fullscreen is a property of the window, edit mode a mode of what the window shows. Every mode inside the window unwinds before the window itself changes state, the way a dialog inside a fullscreen video closes before the video leaves fullscreen. Why Settings comes before edit mode: Settings opens over edit mode (the edit bar stays), so it is the inner layer.

What the user notices, all intended: Esc on Settings no longer also leaves edit mode and fullscreen; clearing a filter no longer exits edit mode; cancelling a rename no longer exits edit mode; leaving edit mode inside fullscreen and leaving fullscreen are two presses, in that order.

**A.3 Edits for Ender (`src/renderer/app.js`, function names, not line numbers).**

1. **The document keydown handler's Escape branch** (the one that today closes the cheat-sheet, then Settings, then the installed-apps picker, then clears the filter, then "falls through"). Replace the fall-through with two more steps and a final stop, so the branch reads, in this order and each step ending the handler: cheat-sheet, Settings via `closeSettings()`, installed-apps picker, filter, **edit mode (`exitEditMode()`)**, **fullscreen**, then **return** (nothing to undo). Each acting step still calls `preventDefault()`. The fullscreen step calls the existing `exit-fullscreen` IPC and passes its result to `updateFullscreenButton(...)` when it resolves (the handler stays synchronous; the result is handled in a `.then`, which is what the separate listener's `await` did).
2. **`setupContextMenu()`**: delete the two Esc-only document listeners (the one that calls `exitEditMode()` when `editMode`, and the async one that exits fullscreen). Keep the `contextmenu` listener. After this there is exactly **one** document-level Esc handler.
3. **`startRename()`**: in the rename input's keydown, the Escape branch keeps cancelling the rename and now also calls `preventDefault()` and `stopPropagation()` (the same consume the hotkey recorder and the skin field use). The Enter branch is unchanged.

Not touched: `hide-window`, the main process and the `exit-fullscreen` IPC handler, F11 and the fullscreen button, `exitEditMode()` and `DONE`, the hotkey recorder, and every other key.

**A.4 Measured.** Real Esc through headless Edge 154 against stacks of layers (the same harness as section 12). Each scenario presses Esc until the stack is empty plus one; a press passes only if exactly the first layer present disappeared and nothing else changed.

| Stack (innermost first) | HEAD | With A.3 |
|---|---|---|
| Settings, edit mode, fullscreen | **one press removes all three** | Settings; then edit mode; then fullscreen; then nothing |
| the same with the skin list open | one press removes all four | list; Settings; edit mode; fullscreen |
| the same with the cheat-sheet over Settings | one press closes the cheat-sheet **and** exits edit mode and fullscreen (Settings stays) | cheat-sheet; Settings; edit mode; fullscreen |
| edit mode, filter | one press clears the filter **and** exits edit mode | filter; then edit mode |
| edit mode, rename input | one press cancels the rename **and** exits edit mode | rename; then edit mode |
| edit mode, installed-apps picker | one press closes the picker **and** exits edit mode | picker; then edit mode |
| fullscreen, edit mode, filter, then Settings | one press closes Settings **and** exits edit mode and fullscreen (filter stays) | Settings; filter; edit mode; fullscreen |
| fullscreen only | exits (correct) | exits (correct) |
| nothing open | nothing, no `hide-window` call (correct) | nothing, no `hide-window` call |
| composing Esc with Settings open | ignored (correct) | ignored |

**HEAD: 3 of 10 scenarios pass** (the three with no second layer to leak into). **With A.3: 10 of 10.** The 35 picker probes of section 12 also pass on the build with A.3: 113 of 113 checks, and probe P14 now ends with **edit mode still on and `exit-fullscreen` not called** after the Esc that closes Settings (HEAD and the picker-only build both exit edit mode and call it).

**A.5 Acceptance (Futaba), real Esc, 424 x 300.** "Press" is one Esc. After every press exactly the next layer is gone.

| # | Stack | Presses and expected |
|---|---|---|
| B1 | Fullscreen on, edit mode on, Settings open | 1: Settings closes, edit mode and fullscreen stay. 2: edit mode exits, fullscreen stays. 3: fullscreen exits. 4: nothing. |
| B2 | B1 plus the skin list open | 1: only the list closes. Then as B1. |
| B3 | B1 plus the cheat-sheet opened over Settings | 1: only the cheat-sheet closes. Then as B1. |
| B4 | Edit mode on, filter `cal` typed | 1: filter clears, edit mode stays. 2: edit mode exits. |
| B5 | Edit mode on, rename input open on a tile | 1: rename cancels (the name is unchanged), edit mode stays. 2: edit mode exits. |
| B6 | Edit mode on, installed-apps picker open | 1: picker closes, edit mode stays. 2: edit mode exits. |
| B7 | Fullscreen only | 1: exits. 2: nothing. |
| B8 | Nothing open | Esc does nothing: no window hide, no state change. |
| B9 | Settings open, an Esc flagged as composing (`isComposing` true, `keyCode` 229) | Nothing closes. |
| B10 | Every row A1 to A31 of section 10 | Still pass. |

Real window, away window only: real fullscreen with Settings open: the first Esc closes Settings and the window **stays** fullscreen; the next exits fullscreen and the window bounds come back. This is the one part of Part A that headless cannot show (the stub answers `exit-fullscreen`; the real main process resizes the window).

### Part B. The cheat-sheet Esc row

**Today** the ESC row says `Clear filter / close overlay / hide window`. Its last item is false: no code path hides the window on Esc (`hide-window` is wired only to the header button), and after Part A the row also leaves out edit mode and fullscreen.

**The string, exact:** `Step back: panel, filter, edit mode, fullscreen`

**Where:** `src/renderer/index.html`, the `cheat-row` whose `cheat-key` is `ESC`: replace the text inside its `cheat-desc` span with that string. The key cell stays `ESC`. Nothing else in the cheat-sheet changes.

**Why this wording, against the copy rules.**

- **True:** it names exactly the layers Esc unwinds, in the order it unwinds them (A.2 rows 5 to 10). "Panel" covers Settings, the cheat-sheet and the add-app list; the skin list sits inside Settings and closes by the same rule, so it is not named. "Step back" says one step per press.
- **Specific:** it uses the app's own term, "edit mode" (the RIGHT-CLICK row says `Enter edit mode`). "Hide window" is gone because it is false.
- **Short:** one fact, no names, no history, no legality talk.
- **Fit, measured:** at the default 424 x 300 window the row wraps to two lines (47 characters; the available line is about 45), with no clipped text, no horizontal overflow and no scrolling needed; from about 640 px wide it is one line. The old string was one line at 424 and wraps at 380, so wrapping in narrow windows is not new.

**Other Esc strings checked** (every string in `index.html` and `app.js` that mentions Esc): the filter chip tooltip `Type to filter — Esc to clear` and the hotkey status `Press your binding (Esc to cancel)` are both true after Part A. Unchanged.

**Acceptance (Futaba).** B11: the ESC row reads exactly the string above. B12: at 424 x 300 the open cheat-sheet has no clipped text and no horizontal scroll, and the ESC row is at most two lines; at 640 x 420 it is one line. B13: no cheat-sheet row mentions hiding the window except the CTRL+SPACE row, which is true.

### Addendum: where the rest of the spec changes

- **Section 0 row 9:** closed (ruling 1). **Section 5:** the Rename-input row and the Fullscreen, edit mode row are now built, per A.3. **Section 10 A12:** the second Esc closes Settings **only**; edit mode and fullscreen stay until further presses (B1). **Section 11 items 1 and 2:** done by Parts A and B; item 3 stays an offer.
- **Section 9** gains no new files: `app.js` (the picker block, `applySettings`, `closeSettings`, the matcher, and A.3), `index.html` (`tabindex` and the ESC row), `base.css` (the bar rule).
- **Evidence for this addendum.** Prototype `proto2` = the picker build plus A.3 and the Part B string, built and run offscreen the same way as section 12. 5 more headless launches (ladder on HEAD, ladder on `proto2`, two cheat-sheet fit measurements, the 35 probes on `proto2`), all through `launchHeadless` and all closed with `remaining: 0`; `headless-browser.mjs list` shows no leases. No code, no git, nothing in the repo edited except this file.
