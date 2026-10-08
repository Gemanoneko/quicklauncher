# QuickLaunch inherited contrast — two Manager link hover states

Judy · 2026-10-09 · **Bounded extension of committed inherited-contrast spec `9fb12de`, commit before implementation.** This document corrects additional freshly reproduced states on the same existing consumer. No new control, palette, font, geometry, action or shared-default change. Judy wrote this document only; no source/test/probe/app/native input/display/git/version/release changes.

## 1. Fresh evidence, separate from authority

Futaba's `QuickLaunch_ThemeFidelity_InheritedContrast_Baseline_2026-10-09.md` was read and its SHA256 verified as `23ebf8476fa7035ade5dc77cbfe9d18c3394dfa9e3c8d618c45bc2d5537ef9c2`. It is **evidence, not an implementation instruction**, and remains uncommitted at this preparation point.

Fresh immutable committed source: `6fddbc1eeeb97c0218067748f9244fb075c642e4`, tree `bb8919ba00038259056e774a1549025bc49c2962`;331 exact blobs reconstructed/verified. Source manifest `61bed5b9b17f77e5dceaadf0c9336915435dd6c352fa2d21712557f1d6c7a63d`;167-file harness manifest `e4f0eaae18f1e3ba344fca0362bab1420981838773409557e3caec72d8d7acb0`;74 runtime files verified. Result `scratch/2026-10-09-inherited-contrast-futaba/renderer/contrast-results.json` SHA256 `bce82d0aebf5510e4332f701f69498b769b2317e1296860de1c59305ff673241`.

Futaba measured nineteen historical consumers/four states =76 readings, with329/329 fixture-validity proofs (not329 passing contrast pairs). Exact Manager consumer is `#btn-open-cheatsheet`, visible **KEYBOARD SHORTCUTS**, existing tooltip `Open the list of keyboard shortcuts`, current actual Options Manager520×760. No hotkey-field or deleted overlay substitute. Actual pseudo-state membership was proved: rest[], hover[hover], pressed[hover,active], active-only[active].

Seven completed themes' eleven assigned readings still fail; existing `9fb12de` owns their conditional treatments. The fresh four-state check additionally found **four ordinary-text failures** on Republic/Separatist hover/pressed beyond their assigned active-only pairs:

| Theme | Rest | Hover | Pressed (hover+active) | Active-only | Fresh bad hover/pressed pair |
|---|---:|---:|---:|---:|---|
| star-wars-republic |7.323|1.230|1.230|1.544|#FFFFFF text on #EFE7D6 pale ground |
| star-wars-separatist |9.536|1.000|1.000|1.303|#14171B text on #14171B dark ground |

The sampler reports actual ink-free ground and relevant candidates/opaque own fill with unchanged WCAG sRGB method; finer under20%-area texture is not a new worst-glyph proof. Numbers above are copied from verified report, not a new Judy renderer run. Preserve failed evidence. No attribution beyond recorded cascade/state observations is needed to authorize the two bounded fixes.

## 2. Original floors and minimal decision

Original all101 accessibility/live-state intent and committed `9fb12de` require ordinary KEYBOARD SHORTCUTS text≥**4.5:1**, functional glyph/focus/control non-text≥**3:1**, target≥**24×24px**, no hit/paint overlap. Historical adapter's glyph3 comparison remains separate and unchanged; no waiver/rebaseline/threshold/tool change. The new states cannot be ignored or called repaired by an active-only fix.

For **only these two themes and only this actual Manager link**, extend the existing transparent-active link treatment to **hover and pressed**, retaining the existing readable **rest ink**:

- Republic: link foreground `var(--accent-text)` = **#8E1C1A**, with **transparent** own background in hover/active/pressed; actual pale inherited panel ground remains unchanged. Its proven rest pair is7.323:1 on current measured ground. Do not use generic Manager white hover ink on this pale link.
- Separatist: link foreground `var(--accent-text)` = **#DDB77C**, with **transparent** own background in hover/active/pressed; actual dark inherited panel ground remains unchanged. Its proven rest pair is9.536:1. Do not use generic dark button-hover ink on this dark link.

Implementation UX target selectors: **`body.manager #btn-open-cheatsheet:hover` and `body.manager #btn-open-cheatsheet:active`** inside each exact theme CSS file. Ender may group states using `:is(:hover,:active)` and chooses equivalent minimal cascade technique. The same explicit foreground/background must hold when active with or without hover. An existing active-only override should be extended, not duplicated with conflicting priority.

Do not modify rest colour/background/underlining or theme root tokens. Preserve normal underline, pointer cursor, font/size/tracking/line box, no shadow, existing target border-box/hits/focus outline and keyboard order. It remains a **link-like button** in actual Manager, not a new pill/filled action. Existing no-shadow hover rule remains effective. No custom animation/feedback/control or tooltip/copy change.

This rule must win the current `body.manager button:hover` and per-theme Manager hover-ink cascade **for this ID only**. Do not remove those shared rules or alter other buttons. Transparent own background must not erase/replace inherited panel/gradient artwork. Source ownership is strictly:

- `src/renderer/styles/themes/star-wars-republic.css`
- `src/renderer/styles/themes/star-wars-separatist.css`

These are two of the seven files already named by `9fb12de`; no shared `manager.css`/`base.css`/renderer/checker change or all15 palette sweep. Other five completed-theme fixes and later batches retain their existing scope. No Batch08 in-progress source or native draft is changed by this ruling.

## 3. Required four-state acceptance and preservation

Ender/Futaba use an exact new immutable candidate after committed spec, preserving fresh baseline/source and failing evidence. No duplicate baseline probe by Judy. Pin source/harness/runtime; actual consumer/scene/text/tooltip/hit identity mandatory.

1. Independently compare before/after **both themes × rest/hover/pressed/active-only** on actual Options Manager. Assert real pseudo-state matches each requested combination; an active-only test with hover present is invalid. Rest remains unchanged and already passing; hover, pressed and active-only ordinary text each≥4.5 on actual ground, not token-only arithmetic. No floor exemptions.
2. Keyboard-focus alone and focus+activation retain existing visible outline≥3 and actual button target≥24×24 with centre/safe inset-edge hits. No larger/overlapping pseudo-hit box, no text cropping/underlining disappearance, no keyboard focus stolen. Same-plane control intersections0. Verify existing Enter/Space/shortcut-help open/close via guarded mocked routes, no native input or real app/window action.
3. Minimum Manager440×420, baseline520×760, supported larger view and last-row scrolled position; both light Republic/dark Separatist ancestor grounds/any reachable notice/footer states preserve labels and action reachability. Ordinary text assessed on actual compositing/brightest relevant paint; do not treat fresh sampler's area-candidate limit as permission to ignore a failing text pixel.
4. Other Manager tabs/forms/hotkey/menu/buttons and region appearances in these themes remain unchanged (palette/art/title/font/geometry/routes/tooltip). Other99 theme CSS hashes unchanged except separately authorized agents' exact scopes; do not revert concurrent edits or claim source identity without pin comparison.
5. Replay original eleven completed-debt readings within `9fb12de` candidate scope plus the four additional hover/pressed readings identified here. Counts stated separately;19 historical rows stay an explicit disposition roster, not renamed23 historical rows. SilentHill resolved at6fddbc1, Witcher current assigned row passes; later six themes' rest-text debt remains owned by their pending committed batch contracts.

Positive controls in isolated copies: restore Republic generic white hover ink→its actual pale-ground failure; restore Separatist generic #14171B hover ink→its dark-ground failure; restore opaque inherited active fill→the existing assigned active-only failures. Exact consumer selector/pseudo-state mismatch must fail identity proof. Report actual changed control input; no checker/baseline modification.

Record computed foreground/background, actual sampled/text-ground evidence, per-state contrast/target/focus rect/hits, visible before/after captures and unchanged rest/geometry/type/palette proofs. No new native/packaged/real-input/performance clearance from headless results. Known unopted raw-raster variance and fractional-border/native debt remain separate, not a reason to weaken this contract.

## 4. Delivery and stop condition

Root hands this committed addendum with `9fb12de` to Ender for exact bounded residual CSS stage. Futaba independently verifies pin/results; Sully commits/pushes spec/development reports by exact paths. Version1.94.3 remains; no release/tag/version bump. Judy owns only this new document, earlier reports/specs/source unchanged.

STOP/report a different consumer, need for shared/default palette rule, geometry/font/action change or failing newly introduced state outside this precise treatment. Otherwise carry the existing floors through without another product question. No open aesthetic decision remains: keep the proven rest link treatment across these two unsafe hover/pressed states.
