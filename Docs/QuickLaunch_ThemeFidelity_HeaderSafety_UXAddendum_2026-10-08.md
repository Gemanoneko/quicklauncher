# QuickLaunch theme fidelity — live header-art safety addendum

Judy · 2026-10-08 · **Bounded prerequisite for Batch07, commit before implementation briefing.** This document resolves a CSS-only limitation in the already approved header-art contract. No new control, feature, font, artwork or runtime typography fitter is authorized. No code/app/native input/display/git/version/release changes were made by Judy.

## 1. Evidence and exact boundary

Committed Batch07 requires original bounded header motifs plus suppression on actual dynamic title/control collision. Subsequent Batch08–14 specs carry the same contract. CSS alone cannot measure arbitrary user region names. Ender's read-only inspection confirms no existing live collision detector in `app.js`, `region.js` or the gallery. This addendum permits the **small shared visibility behavior necessary to implement that existing requirement**, with technical design owned by Ender.

Directly inspected current selectors/modules:

- Region `index.html`: `#header` contains `#title-area` (region icon/name), `#filter-chip` and `#header-controls` (random, Settings, hide, region menu). `region.js` `renderTitle()` replaces text from the saved user name; rename replaces `#title` with `.region-rename-input`; `applyState()` updates layout/state. Refusal/notice content can also occupy the header.
- Theme motif lives in `#header::after`, ordinarily explicit84×20px, `left:auto`. Historical theme art offset136.67px reflects Fullscreen removal; current `region.css` `body.region #header::after {right:160px}` specificity wins. Older spec172px is **not a reliable live rectangle**. Measure actual computed geometry; do not use a guessed x168 or restore an old button count.
- Base/current region CSS hides art below424px and while filter visible; Row and Column always hide it. Manager CSS always hides `body.manager #header::after` because tabs occupy its slot. These suppressions remain authoritative and this helper must never revive them.
- Ender identifies natural refresh boundaries: region title/state updates, theme stylesheet loaded, window resize, local fonts ready/loading completion, and intrinsic header/title/control/filter size changes. Technical method/observer ownership is Ender's decision; it must not require polling or application launches.

## 2. What is opted in

Initial adoption is **only Batch07's seven theme keys**: `amnesia`, `lovecraft`, `event-horizon`, `blair-witch`, `silent-hill`, `tiny-bunny`, `alan-wake`, on live **region Grid/Fan/Ring headers** where the current CSS permits their bounded motif. No Batch01–06 theme CSS is swept or automatically opted in. No unredesigned legacy readout becomes a new art target.

Future Batch08–14 implementations may use this same opt-in for the bounded `#header::after` motif already required by their own committed specs. Their adoption occurs in each separate batch; this addendum does not implement/opt in their source now. Exact cohort expansion is recorded in that batch's changed-file/evidence ledger, not inferred from a global all101 switch.

Manager/Row/Column remain art-hidden, including their already fixed title/tabs/notice/rename behavior. Reference gallery/fixture must reproduce **actual region geometry and theme source** for acceptance; a historical fixed-title mock alone cannot clear live region safety. No live app or signed-in browser is launched for this work.

Ender may use a theme-local opt-in marker on the header and a helper-owned visibility state/class. Suggested marker from Ender's technical inspection: `--ql-header-art-safety:1` on `#header`; exact naming/implementation is Ender's choice. A theme without opt-in receives **no new visibility or typography behavior**. Clear helper-owned state on theme change so a suppressed motif does not stay hidden in a later theme. Do not classify arbitrary flavour-text pseudo-elements as bounded art merely because `::after` exists.

## 3. Required visible behavior

1. **Functional text and controls have priority.** Keep saved region name, current displayed name/ellipsis, icon, tooltips, edit/rename affordance, controls, focus ring, notice/error, filter and drag area exactly as current behavior. This helper does not shorten/rename text, shrink fonts, move buttons, change widths/layout/targets, clear focus or add user-facing copy.
2. **Draw the original motif whenever its approved slot is safe.** Preserve authored art and anchor/dimensions; do not silently omit a motif as a general workaround. Suppress it only while a live safety condition fails; restore automatically when condition clears (shorter name, resize, restored radial presentation, filter closed, rename ended, fonts/theme settled). No repositioning/animation/morphing or permanent preference/persisted data.
3. **Use actual live coordinates.** The candidate art rectangle comes from its explicit computed pseudo-element geometry relative to the real header, including current padding/borders/layout offsets. Measure title/name/icon group, visible controls, their focus outlines and any visible header notice/filter/rename field. Do not trust fixed172/160/136.67 offsets or a character-count heuristic. A box calculated while hidden must still represent its natural authored geometry; suppression must not erase the measurement needed to restore it.
4. **Clearance:** keep the Batch07 historical **12px horizontal separation from the displayed title/name group** where they share the art's vertical band. Controls/rename/filter/notice/focus-visible paint must never intersect art; reserve their actual visible rect plus focus/outline extent (at least existing4px outward focus budget) before deciding fit. Any extra theme-authored clearance already specified remains. Art stays entirely inside approved header bounds and may not touch the version/title text in reference fixtures. Required-art dimensions must not be clipped into a misleading remnant to force fit; hide the whole motif.
5. **Existing suppressions win:** below424px, visible filter, Row/Column, Manager or a CSS-hidden/offscreen header remain suppressed. Active region, edit mode, rename, error/refusal/notice can only make art less available, never remove a functional state. During live rename, input takes precedence; hide if its natural rect/outline consumes the slot.
6. **Unknown geometry is unsafe:** unresolved relevant local font/theme load, missing required elements, nonfinite/zero invalid measurements or failed bounded measurement suppresses opted-in art until a valid subsequent refresh. Missing opt-in is not an error and leaves current theme alone. No throw that breaks renderer/state, no command/hook/policy/data changes.
7. **Refresh without visual intrusion:** coalesce geometry work around existing updates/next rendered frame, window/intrinsic resize and local font/theme settlement. On content change, art must not flash visibly over text while awaiting the valid measure. Avoid polling, observer loops caused by helper's own visibility write and permanent additional animations. Clear obsolete state/observers appropriately on theme lifecycle. Keyboard focus/input/drag region remain untouched.

The rule follows ProcessRules no-covering and measured hit rects, WCAG visible focus, NN/g minimalist decoration and Fitts control reachability; it is safety for an existing decorative surface, not a new UI.

## 4. Typography ruling — build time, not runtime

**Foundation B2 §5 is a build-time measured CSS ladder.** Ender loads the approved local font, measures fixed/reference title where applicable, chooses tracking/size/fallback within the committed per-theme spec, and reports the final CSS values/edges. No runtime typography fitter is introduced by this addendum.

For arbitrary saved user region titles the shared behavior measures the **existing rendered title** and suppresses art if it cannot coexist. It does not apply the historical fixed `QUICK.LAUNCH`144px budget to user names or override existing Row/Column wrapping/ellipsis. Font-ready refresh here exists only to make art collision evidence valid after actual font metrics settle; it does not mutate font-size/family/tracking.

Manager title/font/tabs remain existing behavior with art permanently hidden. Batch07/future build-time font ladders and actual font/label/descender/Cyrillic tests remain required, separately from this visibility helper. This ruling narrows the implementation brief; earlier final specs remain unchanged.

## 5. Acceptance and evidence

Ender provides a scoped implementation report/pin; Futaba independently replays actual fixture/renderer from that pin. No visible/native input/display/scale/sleep/app launch without a new timed away window; use isolated safe headless fixtures only. Host evidence/receipts remain honestly scoped.

| Coverage | Required result |
|---|---|
| Seven opted-in keys, Grid/Fan/Ring, supported directions and default/minimum/near-fit/large geometry | Authored motif appears when safe; art/title gap≥12px, art/functional/focus overlap0 and header containment; unsafe motif fully hidden |
| Actual names: short/default, accepted24-character wide Latin, narrow Latin, Cyrillic, dotted name, longest supported name; shorter-name return | Name text/value/tooltip/font unchanged; real displayed rect decides visibility; art restored when gap returns |
| Resize across fit threshold and423/424px both directions, fallback Grid and radial return | Existing hides preserved; no stale hidden class/no collision flash; restoration requires actual valid geometry, not historical width alone |
| Filter hidden/visible/cleared; title focus; controls hover/pressed/focus; edit; live rename/invalid input/commit/cancel; available refusal/notice routes | All functional hit/focus rects unchanged, art unobscuring0px; state cleared/restored accurately |
| Font loading/ready or intentionally delayed fixture font, stylesheet change/random-theme/match-all updates, title update then next frame | Safe while metrics unresolved; recompute after valid metrics; no font/family/size/tracking mutation or observer loop |
| Opted theme→nonopted theme→opted theme; theme reload | Helper state scoped/cleared; nonopted pixels/behavior unchanged; no stale suppression |
| Manager/Row/Column all states/all101 themes | Header art stays hidden as current CSS; title/tabs/rename/notice/control rectangles unchanged |
| All101 baseline (theme keys measured by exact catalogue iteration) | Only seven initial adopted themes gain this visibility behavior; unopted theme source/ordinary captured safe-state pixels/controls/motion remain unchanged; no broad palette or art retrofit |

Record actual art/title/control/rename/filter/notice/focus rects and computed pseudo geometry at each tested state, threshold just-fit/just-fail results, original/restored motif screenshots, element hit coverage and number/method of all101 iteration. Header art is noninteractive; same-plane controls still require zero rect intersection with each other. Do not call an art-only rectangle proof functional hit testing.

Positive/negative controls: deliberately enlarged motif, wide fixture title occupying its slot, changed actual right offset, delayed font and missing required element must suppress; shorter title/valid geometry must restore; deliberately disabled safety control must expose a measured overlap. Nonopted fixture must remain untouched. A filter/Manager/Row/Column override control must never revive art. Detection should fail if keyed only to a fixed width/character count; record the different-width glyph sample that demonstrates real measurements.

No CPU increase from polling/loops; report coalesced refresh count and observer lifecycle in bounded resize/theme/title fixture. Actual native/packaged shaping/performance checks remain pending, not inferred from headless. Preserve Batch07 before/after/state/type acceptance and motion0 separately.

## 6. Deliverable and failure behavior

This document is the UX authority for a **narrow shared art-visibility helper plus Batch07 opt-in**, not a runtime font system. Ender chooses smallest existing module boundaries/implementation, enumerates every affected source end and shared-format consumer (gallery/helper/renderer/theme marker), and reports exact scoped paths/pins to root. Senua reviews safety where required, Futaba independent QA, Sully commits/pushes after checks. No release/version/tag authorized; version1.94.3 stays.

STOP/report if actual pseudo geometry cannot be measured without altering authored layout/functional behavior, if common source change expands beyond header decoration safety, or if impossible fit is proposed to be solved by runtime text/font changes. Routine suppression/restore within this contract is approved original-scope completion, no user choice needed. Other specs/source stay untouched by Judy.
