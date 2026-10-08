# QuickLaunch M5, tray/options UX addendum — 2026-10-08

Status: ready for prerequisite spec commit, except fit-policy question below. Judy; inspected source HEAD 8a648a8d6be6400bc3394fc38708c622242914ac, clean before document. No app/browser/native menu/product host launched. Rects are specs, not new product measurements.

EXTEND committed Regions UXSpec 2026-10-01 and M2/M3/M4/F5 addenda. Sergei authorized tray/options, QA-tool fixes, M5 and explicitly chose F5.7 B. Preserve geometry/themes/file safety/lifecycle. Exclude merge/version/release/theme batches/parked guard.

## Approved tray F5.7 B

Replace existing update item at same position; no toast/new item. Native menu label is accessible name (base9.2), no tooltip/aria attribute needed.

| State | Literal label | Click |
|---|---|---|
| No offer | Check for Updates | Open Manager Settings, check once unless already checking |
| Available | Update available — v{version}… | Open Manager Settings, no check/download |
| Downloading | Update downloading… | Open Manager Settings, no check/download |
| Ready | Update ready to install… | Open Manager Settings, no check/install |

Offer precedes checking for label. Rebuild menu from main state; refresh on offer changes. Existing F5 strip/status/idempotence apply. Dot/icon-tooltip rules unchanged (available dot: QuickLauncher — Update available). Banner dismissal clears notification/dot, not offer or Manager/menu route. Mock callbacks prove Settings route/check count and absence of download/install.

## Three approved options

1. Column message-only checking/up-to-date/error: exact selectors from original spec tail Found in the pass, not F5 item1. Hide message only when non-dismiss action carries it; otherwise two lines/full slot title/dismiss at right. DOWNLOAD/DOWNLOADING.../INSTALL NOW unchanged. Prior101-theme measurements: 180-wide text x12–138, dismiss x144–168; remeasure actual rects.
2. Replay main available/downloading/ready offer to ready Grid/Column primary after rebuild/promotion unless offer dismissed. Dismissal survives promotion/rebuild for that offer; fresh update-available is new notification. No app-restart persistence implied. Replay does not resurrect dismissed dot/cancel download. Row/Fan/Ring retain no-banner Manager/menu route. Test states/dismissal independently.
3. Manager hover: body.manager button:hover { color: var(--text); }. Covers OPEN FOLDER/MOVE ALL BACK…/CHECK FOR UPDATES/CLOSE; sizing/tooltips unchanged. Prior white failures mirrors-edge1.67:1, portal1.78:1, silent-hill2.48:1; proposed token prior minimum4.88:1 across101. Recheck rendered hover text≥4.5:1.

## M5 committed design retained

Build base§§2.1,2.5–2.8,3.3,4,5.6,6,7,9–11,14 and TechPlan§4 M5. M2 A1/A2/A4/A5 override base.

- S32–128; T=S+12, minimum44×44 chip. Hub96 diameter. Radius floor48+T/2+10; 2px steps until chip squares separate≥6px on at least one axis; radius nondecreasing with count. §2.7 S64 table remains oracle: Ring8 box336×336/hub168,168/first square130,8,76,76; Fan6 Up box420×258/pivot210,202/first square8,164,76,76. Preserve rounding; report discrepancies.
- Fan four directions rotate fixed pivot, clockwise order/no auto flip; Ring item1 at12 oclock. No manual resize. Caps10/12 further bounded by box fit work area minus24px each side; effective cap in FULL ({cap} max), Fan (max {cap}), Ring (max {cap}) and refusal copy. Refusals change no items/files/order.
- Only chips/hub/badges normal hits. Transparent corners/gaps hit nothing; preserve nonoverlap boxes and U2 shaped-window fallback. Native desktop click-through cannot be proved by renderer.
- Panel alpha floor .92; no app-clip/field/header/banner art/particles/overlays. Keep theme palette/icon effects/typography. Hub --text≥4.5:1 against actual panel over white/black desktop; hover glyphs --text, not white. Group D blade-runner/cyberpunk/deus-ex/ghost-shell/mass-effect; no handmade variants.
- Empty n1 size/hub Drop shortcuts here/top dashed⊕ slot. Preview reuses empty cell, hides hint/⊕, no second slot; slot2px dashed --accent-text/no fill (M2 A1). Rejected preview includes FULL ({cap} max) or NOT A SHORTCUT.
- Filter dims nonmatches .30/disables activation/skips focus; coordinates fixed. Enter first matching item. Left/Up previous, Right/Down next; Ring focus wraps, Fan not. Ctrl+Arrow edit reorders without wrap in either (M2 A5), retains focus/status. Existing F2/Delete/Menu/Shift+F10/F6/Esc.
- Preserve M2/M3 drag cancellation/file safety/target-theme ghost. Insertion follows clockwise order. Badge24×24 within own chip/never neighbour. Edit click renames/never launches. Moved↩ returns file; reference✕ removes tile only.
- When built, Fan/Ring appear together in existing New region/Layout surfaces. Direction Up/Down/Left/Right checked current. No placeholders/new shortcuts.

## Hub bounded presentation rulings

Base coordinates relative centre: view icon20×20 y−40…−20; name width80/two lines y−16…13; menu24×24 y18…42. Edit EDIT y−36…−22; cluster y−14…10/buttons x−40…−16,−12…12,16…40. Menu unchanged. Hub drag handling excludes controls/inputs.

Centre is mutually exclusive; do not stack controls:
1. Rename replaces centre/cluster, width80/height24/x−40…40/y−14…10. Enter/blur commit, Esc cancel; restore prior mode/filter. Full value scrolls inside input; menu accessible.
2. Filter replaces centre/cluster: text x−40…16/y−16…13; Clear filter24×24 x16…40/y−14…10. Filter wins hovered/focused name. Clear restores edit cluster/view name; Esc clears before leaving edit.
3. Otherwise edit shows EDIT/cluster; view hovered/focused item name or region name/empty. Notices replace view name. During edit/filter/rename queue latest notice until centre free, then start timer; never interrupt input/hide controls.

M5 notices8s/--text/two lines/full title/existing status announcement. Supersedes base5s/accent-m, follows M4 readability without Row three-line geometry. Corrective dialogs unchanged.

| Control | Exact title and aria-label |
|---|---|
| ⋯ | Region menu |
| + | Add a file or shortcut |
| ⊞ | Add an installed app |
| ✓ | Finish editing |
| Filter✕ | Clear filter |
| Moved↩ | Move back to desktop |
| Reference✕ | Remove |
| Region rename input | Region name |
| Chip rename input | Shortcut name |

Handle body title Drag to move; editable region name title Click to rename. Chip title/aria full item name. Visible2px focus and keyboard access. Base Tab order; replaced controls omitted.

## Fit policy pending Sergei

Base§2.7 defines cap on adds/drops/switches, not existing populated Fan/Ring after ICON SIZE increase or work-area shrink. Do not drop/page items/switch layouts/shrink per-region icons/rewrite home. Recommendation asked by parent: refuse icon-size change that cannot fit existing Fan/Ring, preserve S/items, message No room at this icon size. Use a smaller size. Await direct ruling before that policy implementation. Preserve existing home-layout contract; unavoidable-fit display case escalates. Synthetic coverage can proceed; actual display/scale/taskbar/sleep prohibited.

## Acceptance

Futaba uses committed build/pinned snapshot, measured rects/pass-total with method/known-bad mutations. Cover0→cap/all Fan directions/S32,64,128/synthetic work areas/empty/full/long names/hover/focus/edit/filter/rename/notice/drag target valid-rejected/hidden-shown/rebuilt/Match all/primary promotion. Check transitions/title-aria parity/controls≥24×24/chip gap≥6px/no intersecting actionable rects (own-chip badge remains deliberate overlay). Review settled Fan6/Ring8 captures across101 themes/group D and scale extremes. Source assertions are not visual acceptance.

No real input/native menus/desktop click-through/drag capture/display/lifecycle or actual updates without later authorized safe window. No visible tests/user profile/launch links. Renderer/logic acceptance supports development only. QA-tool fixes belong to Ender, no product UX change here.

