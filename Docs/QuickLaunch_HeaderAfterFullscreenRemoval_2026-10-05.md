# QuickLaunch: header after the Fullscreen removal — UX red-team

Judy, 2026-10-05. Sergei ruling 2026-10-05: remove the header Fullscreen button (F11 does nothing). Reviewing Ender's before/after compare sheets, HEAD `8cd823d` vs the uncommitted change on `wip/theme-fidelity`. Red-team pass — no balanced take. Nothing here was edited; this is a spec for Ender.

## 0. Verdict in one table

| Theme | In today's batch | Ender flagged it | My ruling | Fix |
|---|---|---|---|---|
| Cyberpunk (default) | yes | **no** | **FIX** | `cyberpunk.css:113` |
| Matrix | yes | no | OK | none |
| Persona 4 | yes | yes ("the pill") | **FIX** | `persona-4.css:99` |
| Persona 5 | yes | yes ("the slash") | **FIX** | `persona-5.css:92` |
| Star Wars: Galactic Republic | yes | **no** | **FIX** | `star-wars-republic.css:102` |
| Star Wars: Separatists | yes | yes ("the dots") | **FIX** | `star-wars-separatist.css:95` |

**Ender's list undercounts it by two.** Star Wars: Galactic Republic has the exact same defect and isn't mentioned in the findings — it's visible in `star-wars-republic-compare.png` at the same magnitude as the three he did flag. Cyberpunk has it too, and cyberpunk is the **default theme** — every first run shows this.

This is one architectural bug with five identical symptoms, not three unrelated cosmetic notes. See §1.

## 1. Root cause (applies to all five FIX rows identically)

Every affected theme draws its header art/emblem (`#header::after`) at a fixed offset from the header's right edge:

```css
#header::after {
  position: absolute; top: 10px; right: 172px; left: auto;
  width: 84px; height: 20px;   /* 29px in cyberpunk */
  background: url("data:image/svg+xml,...");
}
```

`right: 172px` is a constant — it does not know how many buttons are in `#header-controls`. The button row is a right-aligned flex cluster (`base.css:334`, confirmed by Ender: `display: flex; gap: 6px`, right-anchored by the header's `justify-content: space-between`). Removing Fullscreen (the rightmost button) shortens the row by one button (`min-width: 28px`, `base.css:339`) plus one gap (`6px`) = **34px**. Because the row is right-aligned, its right edge doesn't move — only its *left* edge does, sliding 34px further right.

The header art's right edge never moves. The buttons' left edge moves 34px closer to the window edge. The gap between them grows by exactly 34px, on every theme that uses this pattern — regardless of whether that theme also recolors `#header-controls button`.

Confirmed by measurement, not just arithmetic: I pixel-scanned `persona-4-compare.png` at the header's mid-height (y=160) and measured the run between the TV-static decoration's right edge and the first button's left border. Before: ~37 image px (≈25 CSS px at the 1.5x capture scale). After: ~90 image px (≈60 CSS px). Delta ≈ 35 CSS px — matches the 34px arithmetic within anti-aliasing noise.

`base.css:270-275` already documents the contract this broke:
> `#header::after`... header art / tags: the theme sets `left:auto, right:172px` and an explicit width (84px). An explicit width wins over the [clamp] rule below, so art is unaffected by it.

That comment was true and intentional when there were 4 buttons. It's now a stale assumption baked into 40 theme files as a literal pixel constant.

## 2. The fix

**One line, per affected theme file.** Change the header-art rule's `right` from `172px` to `138px` (−34px, undoing exactly the width the Fullscreen button + its gap used to hold):

```css
#header::after {
  position: absolute; top: 10px; right: 138px; left: auto;   /* was 172px */
  ...
}
```

Why 138 and not something else: it restores the original ~24-30px visual gap (theme-dependent, since decoration width varies 84px in all cases but the measured pre-removal gap in persona-4 was ~25px) relative to the button row's *new* left edge. The button sizing (`min-width`, `gap`) lives once in `base.css` and is identical across every theme, so **the same −34px correction is correct for every theme using this pattern** — no per-theme tuning needed.

### Per-theme, exact edits for the 6 themes in today's batch

| File | Line | Change |
|---|---|---|
| `src/renderer/styles/themes/cyberpunk.css` | 113 | `right: 172px;` → `right: 138px;` |
| `src/renderer/styles/themes/persona-4.css` | 99 | `right: 172px;` → `right: 138px;` |
| `src/renderer/styles/themes/persona-5.css` | 92 | `right: 172px;` → `right: 138px;` |
| `src/renderer/styles/themes/star-wars-republic.css` | 102 | `right: 172px;` → `right: 138px;` |
| `src/renderer/styles/themes/star-wars-separatist.css` | 95 | `right: 172px;` → `right: 138px;` |
| `src/renderer/styles/themes/matrix.css` | — | no change (see §3) |

## 3. Matrix — OK as is

Matrix doesn't use the art pattern. Its `#header::after` (`matrix.css:221-226`) is the "legacy flavour text" variant: `left: 200px`, no explicit width, so it inherits `base.css`'s dynamic box (`right: 160px; width: clamp(...)`, text truncates with ellipsis). The box's *right* boundary is still a stale constant (see §5), but nothing is anchored to it visually — the text just ends wherever it ends — so there's no rendered defect. Grid/settings/hover all clean in `matrix-compare.png`. No fix needed.

## 4. This isn't 3 themes or 6 — it's 40

I grepped every theme file for the literal `right: 172px` line that defines this pattern:

```
40 of 101 theme files match: 2001, ac-assassins, ac-templars, akira, cyberpunk, dead-space,
doom-classic, doom-eternal, ff10, ff14, ff15, ff6, ff7, ff8, ff9, gryffindor, nonary-games,
parasite-eve, persona-3, persona-4, persona-5, promise-mascot, shire, siren, star-wars-empire,
star-wars-mando, star-wars-rebel, star-wars-republic, star-wars-separatist, star-wars-sith,
swl-dragon, swl-illuminati, swl-templar, warhammer, warhammer-chaos, warhammer-eldar,
warhammer-necrons, warhammer-orks, warhammer-tyranids, yakuza
```

I didn't stop at the 6 in today's batch. I rendered 3 more outside it — `doom-classic`, `warhammer`, `ff7` — chosen for visual variety (a HUD-style ammo counter, a gothic candle motif, a materia-pipe motif), via a fresh compare run (`hdr-compare2/`, PASS, isolation clean). **All three reproduce the identical defect at the identical magnitude.** This isn't a coincidence of layout — it's the shared architecture, and I'd expect all 40 to show it.

I did not render the remaining 31. The fix (§2) is mechanical and identical for all 40 — recommend Ender apply it across the full list in one pass rather than theme-by-theme, since leaving 34 of the 40 unfixed means a correct-looking demo today and the same bug rediscovered the next time someone screenshots `dead-space` or `yakuza`. That prioritization call is Jane's/Sergei's, not mine — flagging the stakes: **cyberpunk is the default theme**, so this is not a long-tail theme issue.

## 5. Non-blocking: the base.css comment is now stale

`base.css:270-275` documents "the buttons start 148 px from the right edge" for the text-variant box (`right: 160px`, with "keep 12 px clear"). With 3 buttons that's now ~114px, not 148px — the comment and the `right: 160px` constant it justifies are both stale by the same 34px. Nothing currently reads as broken because of it (Matrix's flavor text doesn't currently reach that boundary), but it's now free real estate the comment doesn't know is free, and the next person tuning that box will do the math against a wrong baseline. Worth a one-line update when Ender's in the file for §2; not worth a separate pass on its own.

Also worth a future-proofing note, not a blocking one: 40 files hardcoding the same magic number is exactly how this regression happened — the next button added or removed repeats this bug in 40 places instead of one. A shared custom property (e.g. `--header-art-right` in `base.css`, themes only override the art image) would make the next button change a one-line fix. Not this change's scope to decide; flagging it so it's on record.

## 6. Hit-area / overlap check — PASS

Checked every state in all 9 rendered compare sheets (6 batch themes + doom-classic/warhammer/ff7): grid (rest), settings, hover — both BEFORE and AFTER. No control overlaps another in any state. The 3-button row sits with clean 6px gaps and full clearance from the window edge in every theme; hover focus rings don't clip neighboring tiles; settings panel is pixel-identical before/after in every theme except a <0.1% antialiasing wobble on two (expected, not a defect).

## 7. Cheat-sheet (`?` overlay) — not shown in the provided sheets

Stating this plainly rather than assuming: none of the 9 compare sheets include the cheat-sheet overlay. The gallery tool's compare mode captures exactly three states per theme — grid, settings, hover (confirmed against `npm run gallery:themes -- --help` and the manifest's `diffs` keys: `grid`, `settings`, `hover`, nothing else). There is no rendered evidence either way on whether the F11 row is gone or whether the Esc row reads correctly.

As a secondary, non-substitute check, I read the live source (`src/renderer/index.html:135-152`): the cheat-sheet's row list has no F11 entry, and the Esc row reads "Step back: panel, filter, edit mode." That's a source read, not a pixel check, and I'm not treating it as having verified the rendered result — if a rendered check is wanted, the gallery tool would need a fourth capture state added (today it only knows grid/settings/hover), or Futaba would need to check it against a running build.

## Appendix: extra render used for §4

New compare run, output `scratch/hdr-compare2/` style scratchpad dirs (not Ender's `hdr-compare/` — nothing of his was touched or overwritten):
- `hdr-before2/` — `--ref=8cd823d --only=doom-classic,warhammer,ff7` (PASS, isolation clean)
- `hdr-after2/` — live tree, same `--only` (PASS, isolation clean)
- `hdr-compare2/` — compare, `--batch=extra-sample` (PASS)

All under the session scratchpad, same machine, same window/scale/raster settings as Ender's original run (424x300 @1.5x, software raster) so the two are visually comparable apples-to-apples.

---

## Addendum (2026-10-05, after Ender applied 138): the art offset is 136.67, not 138

Judy. Material read: `art-compare/` (40 sheets + `batch-header-art-138.png`), `gap3-tol0.txt`, `gap3-tol16-summary.txt`, `gap-measure3.js`. Ender's method is sound: each capture is diffed against a bare-header reference (art hidden, three buttons `visibility:hidden`), so patterned headers measure too, and the control checks pass 40/40 (cluster edge identical with and without the art edit, art edge identical between HEAD and the removal-only render). This addendum supersedes the value in §2 and the 34px figure in §1; nothing else in the doc changes.

### A1. Rulings

| # | Question | Ruling |
|---|---|---|
| 1 | The `right:` value | **136.67px** (not 138, 137 or 136) |
| 2 | Scope | **All 40 themes**, one value, one commit |
| 3 | `base.css` 270-275 | **Comment must be rewritten** (text in A5); the `right: 160px` constant it describes **stays** |
| 4 | `base.css` 282 and `max-width: 423px` | **Breakpoint stays 423px; the comment on 282 is rewritten** (text in A6) |

### A2. What I got wrong in the first pass

§1 took the removed width as `min-width: 28px` plus the 6px gap, 34px, and measured 35 on the persona-4 sheet. My own scan read 37 and 90 image px: a difference of 53 image px, which is **35.33 CSS px**, not 35 and not 34. I wrote it off as anti-aliasing. It was not noise. A 2 image px miss on a 1.5x capture is a real offset, and I should have chased it before putting a number in front of Ender. The cause: the Fullscreen glyph made that button wider than the 28px floor (about 29.33 CSS px), so the cluster's left edge moved 29.33 + 6 = 35.33 CSS px. `gap3-tol0.txt` confirms it on every theme: `removed 53` image px on 40/40, `artMove 51` (my 34px) on 40/40, residual `+2` image px (+1.33 CSS) on 40/40, gap equal to HEAD on 0/40. Section 2 said the fix "restores the gap". It did not. This one does.

### A3. The value

The art must move exactly as far as the cluster edge moved: 53 image px at 1.5x, 35.33 CSS px. 172 - 35.33 = **136.67**. At 1.5x that is 205 image px against HEAD's 258, a move of 53, residual 0. Write `136.67px`: two decimals leave 0.003 CSS px (0.005 image px) of error, which snaps to nothing.

Why not the integers:

- **138 (+1.33 CSS, +2 image px).** Already measured as wrong on 40/40. The error is below what an eye catches on a 24 to 62 CSS px gap, but it is a known error with a free exact fix, and a zero-tolerance check ("gap equal to HEAD, 40/40") is worth more to Futaba than a tolerance she has to argue about.
- **137 (+0.33 CSS).** 205.5 image px. A half-pixel offset is neither exact nor integer at Sergei's scale; the box snaps to 205 or 206 and which one is the renderer's business. Rejected.
- **136 (-0.67 CSS, -1 image px).** Integer and closer than 138, but still not equal to HEAD, and it errs the other way (art pushed 1 image px toward the buttons).
- **136.67.** Exact at 1.5x. At other display scales it snaps to the nearest device pixel, which no integer does better than within 0.5 device px.

The value no longer depends on any glyph: the Fullscreen button is gone, so 35.33 is now a fixed historical constant, not a live measurement. The three remaining buttons are unchanged from HEAD, so the cluster edge is the same quantity in HEAD and live.

Visual check, not just numbers: I stacked HEAD against live for cyberpunk (widest gap, 62 CSS px), nonary-games, siren, ff9, persona-4 and warhammer-tyranids. With the art at 138 it stays grouped with the controls at about HEAD's gap in all six. The side effect is that the gap between the title and the art grows by the same 35.33 CSS px. That is the right trade: the header gained exactly one button's width of free space, and it can go between the title and the art (art stays attached to its controls, as in HEAD) or between the art and the controls (the defect). I rule the first. No theme's art comes near the title: the widest title I measured (Star Wars Republic) ends about 136 CSS px from the window's left edge, and the art's left edge is now at 202 CSS px (424 - 222; 203 at 136.67).

The `tol16` summary shows one theme at `artMove 48` and delta 5. At tol 0 that theme reads 51 and 2, like the rest. A faint art edge sits under the 16-level threshold; it is a measurement artefact, not a layout difference. Tol 0 is the authority. I did not chase which theme.

**Edit, exact:** in each of the 40 files, on the single `#header::after` header-art line, `right: 138px;` becomes `right: 136.67px;`. Checked on the live tree: each of the 40 files contains exactly one `right: 138px`, on the `position: absolute; top: 1x px; right: 138px; left: auto;` line (shire's `top` is 19px, the rest 10px), none outside it, and no theme file still carries 172.

### A4. Scope: all 40, not five

All 40. §2's table named the five themes in the review batch plus Matrix because those were the sheets I had; the scope sentence is §4, "recommend Ender apply it across the full list in one pass", and Ender read it correctly. The case is now measured, not inferred: the removal moved the cluster by 53 image px on 40/40 and the art edge by 51 on 40/40, so every theme's gap widened by the same 2 image px. The offset has no per-theme term, because button sizing lives once in `base.css`. A five-theme fix would leave 35 themes with a visibly wider gap, and 40 files share one line of CSS. Unchanged: the 60 legacy-text themes (Matrix included) have no art box and no defect; `stranger-things` has no `#header::after` at all.

Not in this change, still recommended: one shared custom property for the art offset in `base.css`. 40 files carrying a derived decimal is the cost of not doing it. It is a larger diff than this fix, so it waits.

### A5. `base.css` lines 270-275

Rewrite, because two numbers in it are false now (148 is 112.67; 172 is 136.67). The constant `right: 160px` on line 277 **does not change**: it is the right edge of the legacy-text box, and it now leaves 47 CSS px clear of the buttons rather than 12. Nothing collides and nothing orphans (the text is left-anchored and truncates with an ellipsis; at the default 424 window the box is 0 wide anyway, per the 480px gate on line 278). Tightening it to 124.67 with a 444.67 gate would re-flow 60 themes for a gain nobody asked for. Leave it, and say so in the comment.

Replace lines 270-275 with:

```css
/* #header::after, two kinds of user:
   - legacy flavour text: left: 200px (set by the theme), no width. It gets the box between
     left:200px and right:160px, and is 0 wide below a 480 px window, where that box would be
     under 120 px. The buttons start 112.67 px from the right edge, so right:160px keeps 47 px
     clear. It kept 12 with four buttons; the slack is left as it is.
   - header art / tags: the theme sets left:auto, right:136.67px and an explicit width (84px).
     136.67 is the old 172 less the removed Fullscreen button (29.33 px wide) and its 6 px
     gap: the art keeps the gap to the buttons it had before. An explicit width wins over
     the rule below, so art is unaffected by it. */
```

### A6. `base.css` line 282 and the 423px breakpoint

**The breakpoint does not change.** `max-width: 423px` hides the art below the default 424px window, and that behaviour is the invariant: at every window width, art is shown in exactly the cases it was shown at HEAD.

The comment's reason is what broke. "Below the default width it would meet the title" was a collision threshold at 172. At 136.67 it is no longer true: at 423px the art's left edge is about 203 CSS px from the window's left edge against about 136 for the widest title, so there is room. The breakpoint is now a policy ("art only at the default width or wider"), and the comment must say that instead of naming a collision that cannot happen.

Replace line 282 with:

```css
/* Art is anchored 136.67 px from the right and is 84 px wide. It is hidden below the default
   424 px window, the same widths as before the Fullscreen button was removed. At 423 px it
   would clear the title by about 66 px (widest title: Star Wars Republic), so this is a rule
   about window width, not a collision. */
```

Possible later gain, not scheduled: the 35.33 px the art moved also moves the point where it would meet the title, about 35 px lower (to about 389px), so art could stay visible in 389 to 423px windows. That needs the title width of every one of the 40 measured at that width; I measured one. A window narrower than the default is rare. Not worth a global rule change today.

### A7. Acceptance, for Ender

1. Apply A3, A5 and A6 together. CSS only; no JS, no layout rule.
2. Re-render HEAD / removal-only / live and rerun `gap-measure3.js` at **tol 0**. Pass: `gap equal to HEAD: 40/40`, `delta {"0":40}`, `artMove {"53":40}`, checks `ok 40/40`.
3. If any theme reads anything other than delta 0, STOP and report the theme and the delta. Do not tune it per theme and do not move to 137 to make a number come out; a non-zero result means my model of the box is wrong and I need to look at that sheet.
4. Rerun the same gates that ran for 138. If a gate is keyed to theme-file content (the contrast-baseline hashes `HoverFix57 §2.3` describes), it moves a second time for the same files; re-baseline as for 138. No new decision.
5. The cheat-sheet check from §7 is still open: the gallery has no overlay state, and nothing in this addendum changes that.
