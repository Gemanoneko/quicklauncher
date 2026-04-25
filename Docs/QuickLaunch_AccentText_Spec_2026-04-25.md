# QuickLaunch — `--accent-text` Spec (1.94.1)

**Author:** Judy (UX Designer)
**Date:** 2026-04-25
**Target release:** 1.94.1 (follow-up to 1.94.0's contrast remediation pass)
**Status:** Spec only. Sergei reviews. Ender implements. Sully releases.

---

## Summary

- **Problem.** 13 themes use a saturated red / red-violet / orange / dark blue / purple as `--accent-c`. The accent must remain canonical for borders, glows, focus rings, and theme identity, but at small functional sizes (`#title` 11 px, filter chip 11 px, picker rows 12 px, settings labels 12 px, `#icon-size-val` 11 px) the same color fails WCAG 2.2 AA's 3:1 UI-component floor when used as `color:` against `--bg`.
- **Approach (A).** Introduce a sibling variable `--accent-text` that defaults to `var(--accent-c)`. Switch the small-text `color:` consumers in `base.css` to `--accent-text`. The 13 affected themes redeclare `--accent-text` to a brightened/desaturated cousin that meets contrast. Borders, glows, focus rings, and the native `accent-color` keep `--accent-c` unchanged.
- **Expected impact.** Identity preserved (the canonical accent still drives every border, glow, and focus ring on every theme). The 13 listed themes drop from contrast warnings to clean. Per-theme effort: one line. `base.css` effort: ~10 mechanical replacements. Risk to other ~97 themes: none — they keep inheriting `--accent-text: var(--accent-c)` and behave identically.

---

## Problem statement

`--accent-c` carries two roles in the current CSS:

1. **Structural / decorative** — borders, glows, focus outlines, native `accent-color` on range/checkbox, tile-renameable underline. These don't need to clear the small-text contrast bar; the 3:1 UI-component floor is already met or doesn't apply (focus outlines have their own SC, glows are decorative).
2. **Functional small text** — `#title` (11 px), `#filter-chip` (11 px), `#icon-size-val` (11 px), `#filter-chip-clear` (11 px), `.theme-picker-item.active/.selected` text (12 px), `.tile-label.renameable:hover` color, picker accent-colored copy. These ARE small text painted on `--bg` and must clear 3:1 (UI-component minimum) — and ideally 4.5:1, since most of them are below the WCAG "large text" threshold (18 pt / 14 pt bold).

The 13 themes called out in the brief fail check #2 because their identity color is intentionally dark and saturated. Tweaking `--accent-c` lightness either:

- Kills theme identity (Twin Peaks' `#880000` curtain red lifted toward `#FF5050` reads as Power Rangers, not Black Lodge), or
- Bounces the value across the 3:1 threshold without solving the structural pattern: any future theme keyed on a deep red / dark blue / saturated purple will trip the same wire.

The right fix is **architectural**: split the two roles so themes can keep the canonical accent for chrome and provide a contrast-safe variant for body. This is also the lowest-risk fix — every other theme keeps current behavior.

---

## Approach — Solution A: introduce `--accent-text`

### Default contract

```
--accent-text: var(--accent-c);
```

declared in `base.css` `:root` adjacent to `--accent-c`. By default every theme inherits the accent unchanged. A theme that declares its own `--accent-text` overrides only the text role — not the chrome.

### Scope

- All `color: var(--accent-c)` declarations on **functional small text** in `base.css` switch to `color: var(--accent-text)`.
- All `border-color`, `box-shadow`, `outline`, `text-shadow`, native `accent-color`, `background`, and decorative `color:` (e.g., the `glitch-title` keyframe text-shadow flecks at 95–96%) **stay on `--accent-c`**. The accent's chrome role is untouched.
- `#title` is the contentious case. It's small (11 px), it's painted in `var(--accent-c)` today, AND it has a per-theme `--title-anim` keyframe that often hardcodes its own color (e.g., Twin Peaks' `lodge-pulse` keyframe paints `#C09070` directly). Switch the static `#title` rule to `--accent-text` so themes without a colored title animation get the accessible variant; themes with a colored animation override at the keyframe level and remain in control of identity. (See per-theme notes below.)

### Why not B (drop `--accent-c` from all `color:` properties globally)

B is more invasive than A and forces every theme that *was* legitimately using its accent for body text (Cyberpunk's `#00f0ff` cyan reads fine at 11 px against `#040210`) to opt in. That's busywork imposed on ~97 themes to fix 13. A keeps the default behavior identical and concentrates the change where the failure lives.

### Why not C (per-theme selector overrides)

C is fragile. Every time `base.css` adds a new `color: var(--accent-c)` site, all 13 themes need a follow-up override or the contrast regression silently re-emerges. A makes the contract enforceable from a single variable — and the linter (see below) can audit it.

### Why not D (anything cleverer)

Two options were considered and rejected:

- **Auto-derive a brightened variant in CSS** (`color-mix(in oklch, var(--accent-c) 70%, white)` or similar). Tempting but unreliable: `color-mix` lightening of `#880000` produces a pinkish desaturated muddy color, not the red Sergei expects. Manual per-theme tuning produces theme-respecting results.
- **Move the 13 themes to a "text-tinted" tier** (separate file). Adds organizational overhead; the codebase has no precedent for tiered themes. A leaves the file structure flat.

---

## Implementation outline for Ender

### Files

- `src/renderer/styles/base.css` — declare `--accent-text` default; replace ~10 `color: var(--accent-c)` sites with `color: var(--accent-text)`.
- 13 theme files in `src/renderer/styles/themes/` — add a single `--accent-text: <hex>;` line per file (table below).
- `scripts/check-theme-contrast.js` — add an `--accent-text on --bg` audit (see Linter Implications).

### `base.css` declaration

In the `:root` block adjacent to where `--accent-c` is declared (around line 38), add:

```
--accent-text: var(--accent-c);
```

### `base.css` selectors that switch from `--accent-c` to `--accent-text`

These are the **functional small-text consumers** identified in the audit. Ender, please verify this list against current `base.css` line numbers — selectors below are stable but line numbers may have moved since the survey.

| Selector (approx. line) | Property | Reason for switch |
|---|---|---|
| `#title` (~272) | `color` | 11 px decorative-but-functional text |
| `#filter-chip` (~303) | `color` | 11 px filter chip text |
| `#filter-chip-clear` (~308) | `color` | 11 px close glyph |
| `.tile-label.renameable:hover` (~449) | `color` | Hover-state label text (12 px) |
| `.rename-input` accent (~456) | `color` | 12 px rename input text |
| `#icon-size-val` (~621) | `color` | 11 px slider readout |
| `.hotkey-input`-related accent text (~639) | `color` | 12 px settings copy |
| `.picker-search` accent text (~687, ~701) | `color` | 12 px picker copy |
| `.theme-search` accent text (~748) | `color` | 12 px theme-search input |
| `.theme-picker-item.active` (~783), `.theme-picker-item.selected` (~784) | `color` | 12 px active/selected row text |

**Stay on `--accent-c` (do NOT change):**

- `border-color: var(--accent-c)` — every site (~233, ~300, ~341, ~454, ~647, ~707, ~762, ~766)
- `box-shadow` / `text-shadow` involving `var(--accent-c)` — every site, including the glitch-title keyframe flecks
- `outline: 2px solid var(--accent-c)` (~402) — focus indicator, has its own contrast SC and is decorative-on-top-of
- `background: var(--accent-c)` (~255) — different role
- `accent-color: var(--accent-c)` on range and checkbox (~620, ~631) — native widget accent; theme identity belongs there

### `#title` — special note for Ender

Many themes hardcode title color inside their `--title-anim` keyframes (e.g., Twin Peaks' `lodge-pulse` paints `#C09070` directly; FF7's `ff7-title` paints `#8898C0`). These themes are *not* affected by the `--accent-text` switch on `#title` because the keyframe `color:` wins as long as the animation runs.

**Action:** for any of the 13 themes whose title keyframe paints the failing accent literally (audit during implementation), update the keyframe to use the new `--accent-text` variant or a hex that matches it. The per-theme table below gives the target hex. In themes without a title keyframe (or where the keyframe doesn't paint `color:`), the static `#title` rule's `--accent-text` value takes effect automatically.

### Reduced-motion path

When `body.reduce-motion` is active (or `prefers-reduced-motion: reduce`), `#title` falls back to its static rule because `--title-anim: none`. With this spec, that static rule paints `--accent-text` — so reduced-motion users on the 13 themes get the accessible color automatically. This is a free win; call it out in the release note.

---

## Per-theme contributions

The targets below are tuned to:

1. Clear ≥3:1 against `--bg` for UI components, ideally ≥4.5:1 for normal text against the worst-case "composite over hard black" the linter audits.
2. Stay close to the theme's identity hue — same family, brighter/more saturated as needed.
3. Be hand-pickable values, not algorithmic outputs. The contrast linter will verify; if Ender's measurements show a target is off by a tenth, nudge.

| Theme | `--accent-c` (unchanged) | Proposed `--accent-text` | Rationale |
|---|---|---|---|
| `ac-templars` | `#B01818` | `#E04848` | Brighter Templar crimson — lifts L*, keeps red-orange hue |
| `blair-witch` | `#605848` | `#A89878` | Muted woodsy brown lifted to a moss/birch-bark — identity preserved |
| `dragon-age` | `#A82020` | `#E04040` | Blood Mage red brightened; same hue family |
| `event-horizon` | `#991111` | `#D83838` | "Liberate tutemet" red, lifted but still bloody. Avoids pinkening |
| `ff14` | `#6848A0` | `#A088D8` | Eorzea purple — lighter lavender variant; reads as crystal/aether |
| `ff7` | `#1848A0` | `#5888E0` | Shinra navy → Mako-tinged blue. Stays in the blue family |
| `lovecraft` | `#4050A0` | `#7888D0` | Cosmic-horror indigo lifted to a paler, more "non-Euclidean" violet-blue |
| `portal` | `#FF6600` | `#C04400` | **LIGHT-bg theme.** Aperture orange darkened (not lightened). Approx 4.6:1 against `#D8D8DE` |
| `siren` | `#A01828` | `#E04050` | Forbidden Siren blood-red → brighter, still saturated |
| `swl-templar` | `#A82020` | `#E04040` | Same crimson family as `ac-templars`; same lift |
| `the-sandman` | `#6040C0` | `#9080E0` | Dream-king purple lifted; preserves the "sigil" feel |
| `twin-peaks` | `#880000` | **see note** | Identity-load-bearing. Sergei call. |
| `warhammer-chaos` | `#A01020` | `#E03040` | Khorne red brightened |

### Twin Peaks — Sergei decision required

Twin Peaks is the one I cannot call. The identity is the *exact* `#880000` Black Lodge red, and the title's `lodge-pulse` keyframe already paints `#C09070` (a warm sepia) for visual identity at rest. Two viable paths:

- **(twin-peaks-1) Inherit the keyframe color.** Set `--accent-text: #C09070` to match the resting title color. The filter chip, picker, and other text consumers pick up the sepia. Reads more "log lady's diary" than "Red Room curtain." Loses "this is a red theme" at small sizes.
- **(twin-peaks-2) Lift the red.** Set `--accent-text: #D83838` — a brighter Lodge-curtain red. Filter chip and picker stay red, identity preserved. Title's keyframe still paints sepia-at-rest unchanged. **My recommendation if Sergei doesn't have a strong opinion.**

Surface this one to Sergei. The rest are mine to call.

### Verification

Ender: after editing each theme, run `npm run check:contrast`. The 13 themes should drop out of warnings. If any remain, nudge the value 5–10% lighter (or, for `portal`, darker) and re-run.

---

## Linter implications

The current linter (`scripts/check-theme-contrast.js:174`) audits:

- `--text on --bg` at AA_NORMAL_TEXT
- `--text-dim on --bg` at AA_NORMAL_TEXT
- `--accent-c on --bg` at AA_UI_ELEMENT (3:1)
- `--hint-sub-color on --bg` at AA_NORMAL_TEXT

**Recommended additions for 1.94.1:**

1. **Add `--accent-text on --bg` at AA_UI_ELEMENT (3:1)** as a check. This audits the new variable directly; legacy themes inheriting `--accent-text: var(--accent-c)` produce the same result they already produce on the `--accent-c` row, so existing baselines continue to work.
2. **Keep the existing `--accent-c on --bg` check.** `--accent-c` is still used for borders and focus outlines, both of which need ≥3:1 to be perceivable. The 13 themes will *still* trigger this row as legacy warnings post-fix — that's correct: the canonical accent is still dark/saturated for chrome reasons. The 13 will be in the warnings bucket forever unless Sergei rebaselines, which is fine ("warn legacy, don't gate").
3. **Optional, low priority:** when `--accent-text` is declared explicitly in a theme but matches `--accent-c` exactly, the linter can emit an info-level note ("this theme could redeclare `--accent-text` to a contrast-safe variant"). Not a fail. Useful for future audit work but not required for shipping 1.94.1.

The `extractVar` regex pattern handles new variables for free — no logic change there.

---

## Out of scope

- **Not redesigning the 13 themes' `--accent-c`.** The canonical accent stays exactly as Ender set it. Borders, glows, and focus indicators on these themes do not change.
- **Not changing the other ~97 themes.** They inherit `--accent-text: var(--accent-c)` by default. Zero diff.
- **Not introducing a `--text-strong` or restructuring the text variable family** beyond the single `--accent-text` addition. That refactor — if it ever happens — is a bigger conversation.
- **Not touching glows, scanlines, particles, or any per-theme animation logic.** This is a color-variable spec, nothing else.
- **Not gating 1.94.1 on the linter promotion.** If the additional `--accent-text` linter check uncovers a theme that ships with an explicitly-failing override, fix the override or rebaseline — but do not block the release on the linter wiring itself.
- **No new dependencies.** This is plain CSS variable plumbing.
- **No release-note copy.** Sully drafts that during the release cycle; this spec is implementation-only.

---

## Summary for Ender

1. Add one default declaration to `base.css`: `--accent-text: var(--accent-c);`
2. Replace ~10 `color: var(--accent-c)` sites in `base.css` with `var(--accent-text)`. Leave every `border-color`, `box-shadow`, `outline`, `accent-color`, `background`, and `text-shadow` alone.
3. Add `--accent-text: <hex>;` to each of the 13 theme files per the table.
4. For Twin Peaks specifically, wait for Sergei's call between the sepia-inherit and red-lift options.
5. Add the `--accent-text on --bg` (AA_UI_ELEMENT, 3:1) check to the contrast linter.
6. Run `npm run check:contrast` and confirm the 13 themes' `--accent-text` rows pass. Their `--accent-c` rows will remain in the legacy warnings bucket — that is intentional and correct.

Effort: small. Risk: low. Identity preserved. Contrast met.

---

*End of spec. Judy stands by for follow-up questions during 1.94.1 implementation.*
