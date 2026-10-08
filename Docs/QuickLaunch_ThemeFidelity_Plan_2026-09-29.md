# QuickLaunch — Theme fidelity pass (plan, 2026-09-29)

## Ask
Sergei says most of the themes look weird, especially the decorative art painted into them. An older model built them. He asked for every theme to be reviewed and brought closer to its source franchise.

## Sergei's rulings (2026-09-29)
1. **Scope:** all 101 themes.
2. **Decorative art:** Judy decides per theme whether to redraw it or tone it down to palette, type and small motifs.
3. **Pace:** one batch at a time, not a parallel multi-agent workflow. This keeps spend under control, and Sergei can stop after any batch.

4. **Delegation (2026-09-29, before Sergei went to sleep):** Judy picks which game or era each ambiguous theme follows (`diablo`, `dragon-age`, `persona-3`, `nonary-games`, `eve-online`). Sergei's words: "Decide everything yourself… Let's see what you can show me in the morning." Jane reads this as a mandate to audit, spec and implement batches overnight, committed to a work branch. **It does not cover shipping.** Nothing is merged or released until Sergei has seen the before/after, as promised to him when the plan started.

5. **Morning rulings (2026-09-30):**
   - **Batch 1 approved** as reviewed (`eb926a6`).
   - **promise-mascot switches to the light "paper" look.** That's the bright, flat Showa print the game reviews describe, replacing the near-black grade.
   - **Fonts: "all".** Sergei approved downloading and bundling the 7 fonts listed in `Team/Research/QuickLaunch_ThemeReferences_2026-09-29.md` § Bundling candidates (Dela Gothic One, Jost, Cinzel, Pirata One, UnifrakturCook, IM Fell English, Metamorphous; about 3.05 MiB). Each ships with its OFL.txt. The approval covers those files only. Any other font needs a new OK.
   - **Release once, at the end.** The batches accumulate on `wip/theme-fidelity`. One final dual clearance (Futaba + Senua) and one release follow the last batch, after Sergei has seen the full before/after.
   - **Fix the base-layout problems** from the audit's out-of-scope list, which affect every theme (e.g. Settings cut off at the default size). This is a separate work item on the same branch, done before the remaining batches, so they build on the fixed base.

## Ground rules (from the studio, stated to Sergei)
- **Art:** original art in each franchise's style. No copied logos, game artwork or ripped assets, because the code is on GitHub. A trademark motif is evoked, never reproduced.
- **Fonts:** free-licensed only (OFL, Apache or similar) and bundled locally, with no network fetch at runtime. Today the themes bundle no fonts: the CSP is `default-src 'self' data:`, and every theme uses font stacks that Windows already has. Bundling a new font means downloading its file, and that needs Sergei's explicit per-file OK. So **the overnight batches use installed Windows fonts only** (for example Bahnschrift, Cascadia, Yu Mincho, Constantia, Franklin Gothic, Gabriola, Sylfaen). Judy notes any theme that would clearly gain from a bundled font, and those go to Sergei as a morning question, each with file name, source and size.
- **Contrast:** every changed theme must pass `npm run check:contrast` as a new or modified theme (WCAG 2.2 AA). Being on the legacy warning list doesn't carry over to a redesigned theme.
- **CPU:** no theme gets more expensive to run than it is today. The idle pause keeps covering the unfocused state. `.claude/commands/create-theme.md` has the measured cost tiers.
- **Visual sign-off:** Sergei approves each batch from before/after screenshots before it ships (ProcessRules § Verification Discipline: no visual change ships on a headless GO).

## Steps
1. **Screenshot gallery (Ender).** Render every theme without launching the packaged app, so the HKCU Run entry is safe. Output goes to `ql-gallery/current/` in the session scratchpad, with the same names reused for the "after" runs.
2. **Reference sheet (Makoto).** `Team/Research/QuickLaunch_ThemeReferences_2026-09-29.md` records each franchise's palette, type, UI language, motifs and pitfalls, with confidence levels.
3. **Audit (Judy).** Grade all 101 against the sheet and the gallery, set the batches (by franchise family, worst first), and make the per-theme art call.
4. **Batches, one at a time.** For each batch:
   - Judy writes the spec.
   - Ender implements it.
   - The contrast gate and the gallery "after" run follow.
   - Sergei reviews before/after and approves.
   - Futaba and Senua clear it.
   - Sully releases it.
