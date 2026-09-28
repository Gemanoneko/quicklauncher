# QuickLaunch — Focused-CPU Design Proposal

**Status: proposal only — nothing decided.** Sergei picks; this is Judy's assessment of the options he's already heard, plus one addition, with a mechanical spec for whichever CSS path he approves.

**Repo state read:** `main` @ `3979311` (post `0b29272`, which already pauses all animation when the window is unfocused/covered/hidden). This spec is read-only — no code touched.

**Scope:** cut CPU **while the window is focused**, keep each theme's character. This is an EXTEND, not a redesign — nothing here touches layout, contrast, or tap targets.

---

## 1. What's actually running, per the CSS

Read statically across all 101 theme files in `src/renderer/styles/themes/` and `base.css`:

- **98/101 themes** animate `#app`'s `box-shadow` (the panel glow) — this is the single line Ender isolated at **97% of a core** on its own.
- **91/101 themes** animate `#particles`' `background-position` (the scrolling rain/dust/snow layer) — likely Ender's **40–50%** "one smoothly changing animation" figure.
- Of the 98 glow animations: **83 use smooth easing** (`ease-in-out`), **15 already ship `steps(1)`** instead (Deus Ex, Doctor Who, Doom Classic, Doom Eternal, Half-Life, Matrix, Mortal Kombat, Persona 4, Persona 5, SCP, Siren, SWL Illuminati, Terminator, X-Files, Yakuza). Those 15 have equal or greater keyframe complexity (7–13 stops) to the smooth ones and are already shipped and in use — **this is an in-repo precedent, not a theory.**
- **0/101 themes** override `backdrop-filter` — the 18px blur in `base.css` (lines 160–161) is uniform across every theme, confirming Ender's read that it's a single shared knob, not per-theme work.

**Why box-shadow and background-position are expensive regardless of `will-change`:** both are paint-phase properties — the browser has to re-rasterize actual pixels every time the value changes, whether or not the element sits on its own compositor layer. `will-change` isolates *what* gets repainted, not *whether* it does. Only `opacity` and `transform` are truly compositor-only (zero main-thread repaint). This matches Ender's "fixed cost per frame, not per pixel" finding: at 120Hz, a smoothly-eased `box-shadow` keyframe repaints ~120 times a second for the entire duration; a `steps(1)` one repaints only when it crosses a keyframe boundary — for a 10s/8-stop animation, roughly once per second.

**Correction to flag regardless of which option Sergei picks:** `WIP/QuickLaunch/.claude/commands/create-theme.md`'s own cost-tier table (§ "CPU-efficient animations", lines 217–236) lists `background-position` as "cheap (promoted via `will-change`)". Ender's isolated measurement (40–50% for one such animation alone) says otherwise. New themes are still being authored against this stale claim — see §5.

---

## 2. Options assessed

### (a) Rework the glow + loops into cheap forms
Splitting this into two real sub-options, since they trade off very differently:

**(a1) Stepped interpolation — same keyframes, same colors, same duration, only the easing changes.**
Change `ease-in-out` → `steps(N, jump-none)` on the `#app` glow's `animation` line. Nothing else moves. Visually: the glow stops *gliding* between brightness levels and *ticks* through them — exactly what the 15 themes above already do today.
- **CPU:** should collapse most of the 97% glow figure — repaint count drops from ~120/sec to roughly 1/sec (duration-dependent). Ender to confirm the real number, but directionally this should land close to the fully-paused 1.2–4.1% floor for the glow's own contribution.
- **Effort:** one mechanical find/replace across ~98 files (`ease-in-out` → `steps(N, jump-none)` inside the `#app { animation: ... }` line only). No new base.css mechanism, no DOM changes. The 3 themes with a multi-line `#app{}` block (`blade-runner.css`, `dead-space.css`, `lcars.css`) match the same pattern on their own line.
- **Risk:** stepping reads as more "alive/glitchy" on tech/aggressive themes (matches their existing character) and may read as less atmospheric on slow, warm, ease-in-out themes (Dune, Shire-style). Since this is precisely the tradeoff the 15 existing themes already made and shipped, the risk is bounded, but Sergei should eyeball a couple of the warm/ambient ones before it goes wide.

**(a2) True compositor-only rebuild** (opacity cross-fade between static shadow layers for the glow; transform-based tiled scroll instead of `background-position` for particles).
Zero visual regression — perfectly smooth, indistinguishable from today, genuinely near-free.
- **CPU:** best possible outcome, at or near the paused floor.
- **Effort:** substantially bigger. The glow needs new stacked layers (real DOM nodes, not just CSS — Ender's call on structure), each theme re-authored to that structure. Particle scroll needs a transform-based tiling technique verified per theme (background-size/geometry has to divide evenly for a seamless wrap). This is a base.css mechanism change plus a rebuild of ~98–101 theme files, not a mechanical regex.
- **Risk:** low visual risk, high engineering risk/time.

**Recommendation within (a):** pilot (a1) first — it's the whole saving for the smallest, most reversible change, and it already has 15 live examples proving it doesn't read as broken. Treat (a2) as a later option only for specific themes where (a1) looks bad, if any.

**Particles specifically:** I'm not folding these into the same steps() recommendation sight-unseen. `linear` background-position scroll *is* the visual identity for rain/dust/snow themes — stepping it risks turning smooth fall into visible strobing, which is a bigger character hit than stepping a glow. Recommend Ender prototype `steps(N)` vs. a transform-based rebuild on 2–3 themes (one dense like Matrix/Cyberpunk, one sparse like AC-Assassins dust) before committing either approach across all 91.

### (b) Drop the blur
`#app`'s `backdrop-filter: blur(18px) saturate(1.4)` (base.css:160–161) blurs nothing, because the window is transparent and there's nothing behind it to blur — Ender's own finding. Since 0/101 themes override it, this is a single line in one file.
- **CPU:** Ender's own test was inconclusive (0–20 pts) — worth re-testing in isolation once (a1) is live, so the two savings aren't conflated.
- **Effort:** trivial — remove two lines in base.css.
- **Risk:** none *today*, but see the create-theme.md conflict in §5 — the skin-authoring doc documents this exact blur as the mechanism for a "translucent/glassmorphic" theme paradigm that no theme currently uses. Removing it forecloses that paradigm for future themes unless it's restored as a per-theme opt-in.

### (c) Reduce Motion on by default
Guaranteed to hit the 1.2–4.1% paused floor — it already exists and already does exactly this.
- **CPU:** best guaranteed number of all four options, no prototyping needed.
- **Effort:** trivial — flip one default in `src/main/store.js:170` (`reducedMotion: false` → `true`). Sergei's own existing profile has `reducedMotion: false` already persisted to disk, so this default flip does nothing for him unless he also toggles the setting or a migration bumps existing configs — flag to Ender if this path is chosen.
- **Risk:** this is the one option that isn't really a "cheap form" of the animation — it removes it. 101 themes were built specifically so "the user FEEL[s] like they're in that franchise's world" (create-theme.md's own design philosophy) — flat, static panels give that up entirely, not just the glow. I'd treat this as a fallback if (a1)/(a2) can't get the number down enough, not a first move — it spends the thing the theme system exists for to solve a rendering-cost problem.

### (d) Hide window after launching an app
This changes *how much time* the window is focused and visible, not *the per-frame cost while it is* — it's a mitigation, not a fix, and orthogonal to (a)/(b)/(c). It's already correctly flagged in the brief as Sergei's behavior call, not a design question — I'm not weighing in on it beyond noting it doesn't reduce the cost of any given focused second.

---

## 3. Recommendation

**Pilot (a1) + (b) together:** stepped `#app` glow timing (mechanical, ~98-file regex, no visual-character loss beyond what 15 shipped themes already do) plus dropping the no-op blur (trivial, currently invisible). This targets the two heaviest named-and-measured line items without touching Reduce Motion's default or committing to a bigger DOM rebuild before it's known to be necessary.

Leave particle `background-position` scrolling for a small prototype-and-compare pass (2–3 themes) before deciding between stepping it too or rebuilding it on transforms — that's a real visual-character call that deserves a side-by-side, not a blanket edit.

Hold (c) in reserve: only reach for it if (a1)+(a2) together still don't clear whatever CPU number Sergei's comfortable with.

---

## 4. Exact CSS change spec (for Ender, if (a1) is approved)

**Target:** the `#app { animation: ... }` declaration only, in every theme file under `src/renderer/styles/themes/`.

**Find pattern** (98 files, both the single-line and 3 multi-line variants match on the declaration itself):
```
animation: <name> <duration>s ease-in-out infinite;
```
**Replace with:**
```
animation: <name> <duration>s steps(N, jump-none) infinite;
```
- `<name>` and `<duration>` are untouched — copy through exactly as found.
- `N`: pick one value for a first pass (10 is a reasonable middle ground against the observed 6–13 keyframe-stop range) rather than computing per-file; tune per-theme afterward only where Sergei flags a specific theme as reading badly.
- **Do not touch** the 15 files that already use `steps(1)` on `#app` (listed in §1) — they're already cheap.
- **Do not touch** any `box-shadow`, `border`, or other static (non-animated) property on `#app` in `dead-space.css` / `lcars.css` — only the `animation:` line changes.
- Leave every `@keyframes` block's content (colors, `%` stops, values) completely alone — this is a timing-function swap only, not a rewrite.

**For (b), in `base.css` only** (lines 160–161, inside the `#app` rule):
```css
backdrop-filter: blur(18px) saturate(1.4);
-webkit-backdrop-filter: blur(18px) saturate(1.4);
```
Remove both lines. No theme file needs a matching change (confirmed 0/101 overrides).

**Particles:** no change spec yet — pending the 2–3-theme prototype comparison in §2.

---

## 5. `studio-skin` / `create-theme.md` check

Checked `.claude/skills/studio-skin/SKILL.md` and `WIP/QuickLaunch/.claude/commands/create-theme.md` against the expensive pattern, since every future theme is authored from these.

- **`SKILL.md`** doesn't duplicate any CPU/cost guidance itself — it correctly defers to `create-theme.md` for QuickLaunch specifics. No change needed there.
- **`create-theme.md` needs two fixes if (a1) is approved**, or new themes will keep inheriting the expensive pattern the day after this ships:
  1. **The worked template teaches the expensive pattern it warns against.** § "CPU-efficient animations" (lines 217–236) correctly flags `box-shadow` as "expensive — full-element repaint, even on its own layer." But the very next required section, § "App border animation — synchronized" (lines 397–406), hands new theme authors a ready-to-paste example using `ease-in-out` on exactly this property. That template is almost certainly why 83/98 themes have the expensive version — copy-paste from the doc's own example. **Fix:** update that template's timing function to match whatever Ender lands on for (a1) (`steps(N, jump-none)`), so the next theme built from this doc starts cheap instead of needing a follow-up pass.
  2. **The cost-tier table is wrong about `background-position`.** It's listed as "cheap (promoted via `will-change`)" (line 223); Ender's isolated measurement (40–50% CPU alone) contradicts that. **Fix:** correct that tier entry — at minimum flag it "verify before shipping" rather than "cheap" — once §2's particle prototype settles on an approach, update the guidance to match.
- **One more dependency, not a bug but worth flagging:** create-theme.md's "Transparency / Glassmorphism" section (lines 18–25) documents `backdrop-filter: blur(18px)` as the mechanism a future theme would use for a translucent/frosted-glass look ("works best for: holographic/HUD themes... Ghost in the Shell"). No theme uses it today, but if (b) removes the blur globally, that documented paradigm stops working the day someone tries it. If (b) ships, this section needs either a per-theme opt-in note (a theme can re-add a *static*, non-animated `backdrop-filter` cheaply if it wants the frosted look) or removal of the paradigm from the guide.

---

## 6. Questions for Sergei

1. Pilot the stepped `#app` glow (a1) across all themes — same colors/keyframes, no smooth easing? (yes/no)
2. Drop the backdrop blur too, since it currently does nothing? (yes/no)
3. Before committing sitewide, want Ender to prototype 2–3 themes both ways (stepped vs. transform-rebuild) for the particle scroll so you can eyeball it first? (yes/no)

---

## Outcome (Sergei, 2026-09-28): not shipped
Ender implemented items 1, 2 and 4 on an uncommitted `wip/focused-cpu` worktree and measured them at a confirmed 120 Hz, with focus simulated in the page. The premise didn't hold: while any animation runs, Chromium redraws 120 times a second, so stepping barely helps. Focused CPU went from 66 / 67 / 83% of one core (cyberpunk / ac-assassins / blade-runner) to 57 / 51 / 67% with the stepped glow and no blur. The particle variants took off only a few points more. Only a paused animation gets near 0%. Editing 12 legacy-AA-failing themes also tripped the contrast gate, because it treats edited themes as new.

Sergei's rulings:
1. Don't ship the stepped glow or the blur removal.
2. If these themes are edited in future, accept the 12 legacy themes as they are, with a rebaseline and no colour changes.
3. No "animate briefly on open, then hold" design.
4. Drop the particle comparison.

Focused CPU stays as in v1.94.2. The unfocused, covered and hidden states are already near 0% because of the idle pause.
