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
