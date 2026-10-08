# QuickLaunch theme fidelity — Batch 12 UX spec

Judy · 2026-10-08 · **Preparatory spec only; publish after fallback QA and implement sequentially after completed Batch11.** No source/theme/asset/font/git/app/native-input/display changes. WCAG opaque-palette arithmetic below is preparation, not rendered QA or visual approval.

## 0. Authority, exact scope and ownership

This is an **EXTEND** of approved all101 theme fidelity on integration: original plan `9719edc`, audit `a659bf9` §§1/6/7, Foundation `75b9f7c` Parts A/B, completed Batch06 `16d89bf`, eleven-font README `4191e24`, committed completion inventory and Batch07 live-state acceptance. Earlier preparatory specs stay untouched; no additional era/product decisions.

| Exact CSS file under `src/renderer/styles/themes/` | Existing catalogue name (preserve) | Audit art action | Direction |
|---|---|---|---|
| `resident-evil.css` | RESIDENT EVIL | redraw | Clinical tile/red-white segmentation, static ECG |
| `scp.css` | SCP FOUNDATION | tone down | Clinical wiki/file, bounded redactions and caution |
| `soma.css` | SOMA | tone down | Abyssal hull/rust/organic growth, porthole |
| `stalker.css` | S.T.A.L.K.E.R. | redraw | Olive Soviet-industrial PDA bezel, Cyrillic |
| `control.css` | CONTROL: THE BUREAU | redraw | Concrete/brutalist Federal office and red seal |
| `fatal-frame.css` | FATAL FRAME | redraw | Photograph/viewfinder frame, washi strip and shutter |

Count method: six directly verified existing keys/CSS paths, four redraw/two tone-down, matching audit §7. **All six stock under Foundation**; none adopts a bundled face and wishlist is not approval to download/substitute. Body/status/control readability stays distinct from decoration.

Ender owns these six CSS paths plus agreed evidence docs; Judy this document/visual review; Futaba independent pinned QA; Sully exact commits/pushes. Preserve others' frozen fallback/controller QA and all earlier docs. Exclude shared source/layout rewrite, new controls/features/surfaces/fonts/dependencies/downloads, catalogue/banner behavior change, other batch/completed-theme palette sweep, hooks/guards/QA-tool repair/permissions, native input/display/scale/taskbar/sleep/running QuickLauncher/signed-in browser, version/tag/release. STOP/report missing approval/resource or issue needing shared source; routine bounded art-alpha/contrast/type fit changes return exact evidence to Judy.

## 0.1 Chrome and interaction contract

Inherit audit C1/C3–C5/H1–H8, Foundation A/B, Batch06 §0.1–0.2, Batch07 §§0.1/0.2/0.3/8 **except per-theme horror-I palettes/type/motifs**, replaced here; counts six. Functional behavior remains familiar Windows (Jakob/Fluent), visible/quiet (NN/g), keyboard/target/focus accessible (WCAG/Fitts).

- Zero infinite animations all six: delete scan/hiss/bubble/fog/PDA loops, title/icon pulses, whole-app shadow/blackout, moving texture/particles, hover sheen and ghost readouts. Existing functional transitions only. No added blur/will-change; base backdrop blur preserved.
- Legacy panno/file/PDA/viewfinder/roster/redaction geometry under tiles is deleted. Grid art in existing scrolling frame background,8px outer bands/four-pixel tile/focus keep-out. No words/schematics/rings/figures/hard edges behind app glyphs/labels. Fan/Ring omit frame layers without safe bands. No content-obscuring app-after; decoration pointer-events:none.
- Header84×20 inherited right172/top10 motif slot; hidden below424px/filter/long-title/control conflict. Legacy title≤156px, actual dynamic-title/control rects govern; art hides before controls move/shrink. Lines inside40px header. Banner22px icon/≤7px seam/optional measured reserved motif; existing authored arrays/one-line fit/rotation, no fake telemetry or invented lore/case files.
- Full app glyphs on separate **plates**, cuts≤20px, Control diamonds removed. No dark icon filter/glow/scanline, label halo, field pulse. Tail margin3px. Actual tooltips/F5/control/menu/keyboard routes and state messages unchanged.

## 0.2 Binding palette and functional mapping

Opaque surfaces stabilize wallpaper composition while preserving base blur. Audit dark/saturated red/teal/olive is small material decoration, not unreadable live text. First root gate declarations, no duplicate leading-comment variable definitions.

| Theme | bg | panel | header | hover | pressed/selected | text | dim/hints | functional accent | border | focus |
|---|---|---|---|---|---|---|---|---|---|---|
| resident-evil | #0A0A0A | #242424 | #292424 | #342C2C | #3E3333 | #E8E8E8 | #C7C3BE | #F09B9F | #A39B92 | #A8C995 |
| scp | #0E0E0E | #1A1A1A | #242424 | #2D2929 | #373030 | #D8D8D8 | #BFBDB7 | #E3A2A2 | #A49C91 | #E8CA74 |
| soma | #06090C | #1A2A32 | #20323B | #293F47 | #324B53 | #D9E5E8 | #B7CCD1 | #92CADC | #91ABB3 | #E8D070 |
| stalker | #0E100B | #292C22 | #33362A | #3E4231 | #484D39 | #E3E3C8 | #CCCCAF | #C4C985 | #A3AA88 | #ECC16B |
| control | #0C0C0E | #1A1A1E | #242428 | #2E292D | #393035 | #E8E4DC | #C6C2BB | #F48D94 | #A49DA1 | #F48D94 |
| fatal-frame | #08080C | #171E2A | #202737 | #2A3345 | #333E50 | #D9DDEA | #BBC5D9 | #A5BFD7 | #8F9FB5 | #C3D6E8 |

Banner uses header surface/text/functional accent for first five. Fatal Frame banner is **#E8DCC8 washi with #2F3440 text/icon ink**; no inherited pale text on cream. Existing banner quote/content unchanged.

Apply Batch07 token mapping with these values: panel/overlay/rest fields; text title/body/labels/banner/control/tooltip, dim version/secondary/hints, functional accent for accent-c/accent-text/accent-m/accent-y and hotkey/edit/update/selected states, hover/pressed across tile/button/rename/picker/skin/Manager, border/focus actionable outlines/drop hints. No functional foreground opacity. Decorative blood/teal/redaction below never overrides live title-dot/recording/status tokens. Correct inherited literal colours in actual theme-scoped selectors, behavior unchanged.

Remove/error controls Batch07 dark-theme opaque #70222C fill/#FFF4F0 glyph rest/hover/pressed; error text#F1B5B7, prevent inherited OKLCH state bypass. Accessibility is structural/text/icon as well as colour: ECG/class stripe is decoration, not app status, no colour-only functional state introduced.

Five-surface opaque arithmetic screen minimum text/accent/dim≥5.02:1, border≥3.62:1, focus≥5.18:1. This excludes banner exception/art/compositing/app icons/inherited CSS and is **not rendered acceptance**. Actual text≥4.5:1/non-text-focus-action-icon≥3:1 all reachable states/brightest pixels. No rebaseline/legacy exemption. Fix failing art alpha/fill/foreground within approved direction and report exact pair/value to Judy.

## 0.3 Typography

Body/Manager/forms Segoe UI/Yu Gothic/Arial at current functional sizes/weights. Title11px line-height1.2; labels12px line-height1.2/no halo/tail-margin3px; banner11px. No bundled-face adoption/download despite eleven approved files elsewhere.

| Theme | Title / weight / style / starting tracking | Labels / weight / style / tracking | Banner / weight / style / tracking |
|---|---|---|---|
| resident-evil | `'Segoe UI',Arial,sans-serif` /600/normal/2px caps | `'Courier New',Consolas,monospace` /400/normal/.3px as typed | same /400/normal/.3px |
| scp | `'Segoe UI',Arial,sans-serif` /600/normal/2px | `Consolas,'Courier New',monospace` /400/normal/.3px caps | same /400/normal/.3px |
| soma | `'Segoe UI',Arial,sans-serif` /400/normal/2px | `Consolas,'Courier New',monospace` /400/normal/.3px as typed | same /400/normal/.3px |
| stalker | `Bahnschrift,'Segoe UI',sans-serif` /600/normal/2px caps | same /400/normal/.3px caps | same /400/normal/.3px |
| control | `Bahnschrift,'Segoe UI',sans-serif` /600/normal/3px caps | same /400/normal/.3px caps | same /400/normal/.3px |
| fatal-frame | `'Palatino Linotype',Georgia,serif` /400/italic/2px | same /400/italic/.3px as typed | same /400/italic/.3px |

Control real small caps only if supported without shrinking glyph size; otherwise full-height uppercase, no faux tiny letters. StalkerЗОНА tag Bahnschrift600 Cyrillic, no installed Russo/Stalinist. No SpecialElite/Shippori/ZenAntique/ShareTech/Saira downloads or arbitrary substitute. Foundation tracking→10px→specified stock fallback ladder and actual dynamic art suppression remain. Six standard labels fit, long genuine names ellipsize. Wait fonts ready/report loaded stock face/weight/style/ЩЦ/descenders/numerals, positive misspelled-family fallback, simulated1×/1.5×/2× (no OS-scale change). Existing one-line banner arrays/fit preserved, narrow fallback reported.

## 1. Resident Evil — clinical warning layer

Delete typewriter/item-box/ribbon-count panno and ghost text. Grey slabs/square radius2px plates, full icon. Header84×20 original static ECG zigzag divided green/yellow/red segments (not a live health monitor): **no FINE/CAUTION/DANGER labels or fake state**; decorative colour line only. Banner22px four-segment red/white circle (two red #B5121B, two white #E8E8E8), no umbrella/spokes copying the corporation logo. White tile-grid texture5% alpha in banner only, text contrast measured over its brightest line. One herb-green#3F5A3A corner tick outside content. Courier labels, no scan/glow. Squint: clinical red-white/ECG, not generic black-red horror.

## 2. SCP — restrained containment file

Keep clinical grey/wiki direction, delete every redaction bar under labels and ghost class list/scan. Header84×20 and banner seam have original black redaction bars of three varied lengths, **only safe decorative slots**, no unreadable fake document text. Banner22px original three simple inward arrows around a small ring, different proportions/spacing from the logo; no exact mark or trademark copy. One decorative hazard triangle/euclid-yellow#E8B020 tick in seam, no new class/status text. Square full-glyph plates, Segoe title/Consolas names. Warning#B01818 decorative class stripe only, functional warnings table-readable. Static. Squint: restrained containment/redaction/wiki, distinct from Control's concrete red office.

## 3. SOMA — abyssal rust and growth

Remove centre orbit/dots/WAU readout/bubbles. Preserve porthole **plates**, full app glyph. Header84×20 original three short pressure-hull ring fragments around one bolt (never a complete big ring across grid). Safe outer pad ring segments and two rust streaks#9A3A2A, one thin branching grey-pink vein#9A7880 in a corner, max5% alpha; no branching across content. Banner22px original porthole ring with three unequal bolt dots, cold-lamp focus. Teal/slate hull with quiet organic/rust injury, not clean teal dashboard. Current consciousness-question banner retained under normal fit mechanism, no forced tiny type. Static. Squint: underwater pressure hull with growth/rust, not space orbit UI.

## 4. STALKER — PDA frame, Cyrillic

Delete inner PDA/map/compass/bars/anomaly dots/readout; window frame itself becomes PDA. Audit12px bezel uses **only available outer pad**, clipped to safe8px band in near-fit/shared geometry (never steals control/tile space). Two screw dots and three decorative small button-square shapes in header84×20 slot; not interactive/no tooltip/button semantics. Tag `ЗОНА` in Bahnschrift600 at11px within same measured slot, suppress extra squares if tag requires room, hide whole art on narrow/control conflict. Banner22px generic radiation trefoil (public symbol), no emblem copy. Tile-field LCD tone#8A9A8A at maximum8% alpha only soft/static; actual brightest label/icon/fill contrasts required, reduce tone on failure. Olive/amber, rust#C84A1A decorative edit seam. Square plates, full icons, stock Cyrillic. Static. Squint: industrial olive PDA/ЗОНА/radiation, not a tactical game HUD painted over tiles.

## 5. Control — Federal concrete and red seal

Remove case file/altered-item list/Hiss bar/seal panno, diamond glyph crops and title distortion. Square concrete slabs/full icons. Header84×20 original black redaction bars of varied lengths on small concrete insert; no agency name/logotype. Safe outer-pad brutalist step (three offsets) never enters tile/focus field. Banner22px generic official-seal circle with concentric line/notches, no pyramid/eagle/Bureau logo. Bureau#D8202A one small decorative glyph beside icon **inside measured icon/decor slot** (two broken vertical bars, not Hiss script), functional text uses lighter table red. Bahnschrift600 full-height caps, no tiny decorative status. Static. Squint: concrete/red Federal office, distinct from SCP grey wiki and ResidentEvil clinical tile.

## 6. Fatal Frame — viewfinder becomes frame

Delete middle-column viewfinder rectangle/ring/ghost text. Four original static viewfinder brackets at window outer corners within safe bands, thin film-frame pad line outside content; no rectangular overlay under app tiles. Banner pale washi#E8DCC8 with dark ink and original22px shutter/viewfinder corner icon; thin incomplete ring arc beside icon within reserved decoration slot, not a functional meter. Decorative blood#8A1A2A one shutter dot/edit seam, not pale-surface functional foreground. Header84×20 two film-perforation notches and one faint camera-frame edge, no logo/text. Radius4px plates, full icon, Palatino italic. Static. Squint: haunted camera photograph/washi/ink, not navy ring console.

## 7. Acceptance and delivery

Apply Batch07 §8 live integration matrix **to six themes**: actual Grid/Fan/Ring directions/near-fit capacity, region empty/populated/filter/edit/rename/remove/hover/pressed/focus/update/menu/tooltip/scroll states; Manager selected/unselected/options/skin/hotkey rest/recording/active-only/error/clear/form/footer/scroll/control states. Deleted Settings overlays invalid. Actual hit rect intersections0/art-content A/B/C overlap0/four-pixel keep-out, worst rendered text4.5/non-text3 including art/composited fills/icons, font/edge/tail/ЩЦ/banner fit, motion0 and texture sigma≤documented completed-batch ceiling (Batch06 reference3.72). Positive broken colour/font/overlap controls fail. All101 F5/Q2/shared-forwarding/scroll/fallback smoke reads all101, edits only these six.

Additional focus:

1. Stalker12px-bezel adaptation never steals live tile/focus/control space; LCD8% brightest-pixel contrast, Cyrillic tag loaded and uncut.
2. Control diamond crop removed/full glyphs, no Hiss title motion; all red title/hotkey/error/selected states pass actual pair floors.
3. FatalFrame pale banner dark text/icon at every quote/state, true viewfinder frame outside content, no fake meter.
4. Redaction/schematic removal in SCP/Control, all remaining decorative bars outside labels; intentional open menus/dialogs only Z-stack exception.
5. True22px1× motif sheet/title-banner-hidden squint: ECG/segmented disc, containment arrows, rust porthole, radiation PDA, concrete seal, washi shutter distinct; no copied logos.
6. No environmental/fake-status semantics added: ECG/anomaly/decorative buttons/meter arcs static decoration, tool's actual control/status unchanged.

Keep32 static legacy warnings separate from19 inherited expanded diagnostics; these six clear unchanged gate as modified/new without waiver/rebaseline. No completed-batch sweep. Ender exact paths/per-theme ratio/font/edge/loop table/key-named before-after/state/rect/art evidence/native debt; Judy actual visual review; Futaba independent pinned GO/NO-GO safe scope; Sully scoped doc/development publication only. Headless mocks do not certify native/packaged/performance. No fresh timed away window/input/display/sleep authority. Preserve before/after for Sergei/version1.94.3 unchanged/no tag/release.

## 8. Preparation disposition

No open font/era/product choice. Spec is not implementation/rendered acceptance. Publish after fallback QA; implement after Batch11 sequentially. Earlier final pins and frozen QA source untouched.
