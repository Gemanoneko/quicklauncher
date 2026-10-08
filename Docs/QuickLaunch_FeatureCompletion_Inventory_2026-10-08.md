# QuickLaunch original-spec completion inventory — 2026-10-08

Owner: Ender, read-only inventory. This records approved product work and acceptance debt; it makes no new UX decisions, runs no tests and grants no release authorization.

## Verified baseline and authority

- Integration disk: `codex/regions-themes-integration`, HEAD `537bf068aaeee57f6dc86be3ce8c3a952483ac54`, clean/tracking without ahead/behind flags when inspected. Original theme checkout: `wip/theme-fidelity`, HEAD `8de41d52e3ed1ad08b2e83ce727462ac3842cc08`, equally clean. These observations preceded concurrent fallback implementation. No checkout, source edit or git mutation was performed for this inventory.
- `rg --files Team/Docs` found `Session_2026-10-08_Recap.md` as the newest dated recap; no newer recap existed. Its final append records closure of the global-hook diagnostic detour, not product acceptance.
- Current user instruction is to continue QuickLaunch until feature complete according to the original spec. Root interprets that as authorization to continue approved product development while formal receipt/release clearance remains pending. Existing machine restrictions and explicit no-version/no-release ruling remain.
- Regions canonical UX: `Docs/QuickLaunch_Regions_UXSpec_2026-10-01.md` (latest file-touch commit `52fc7c8`, F5 addendum), with approved followups `Docs/QuickLaunch_M5TrayOptions_UXSpec_2026-10-08.md`, `Docs/QuickLaunch_GridScroll_UXClarification_2026-10-08.md` and `Docs/QuickLaunch_DisplayShrink_UXSpec_2026-10-08.md` (`98dd104`). Tech milestones: `Docs/QuickLaunch_Regions_TechPlan_2026-10-01.md` §4.
- Theme canonical scope: `Docs/QuickLaunch_ThemeFidelity_Plan_2026-09-29.md` § Sergei's rulings item 1: **all 101 themes**, item 3: **one batch at a time**. Latest plan file-touch commit `9719edc`. Audit/catalog and per-theme direction: `Docs/QuickLaunch_ThemeAudit_2026-09-30.md` §§1,6,7 (`a659bf9`). Foundation layout/type contracts: `Docs/QuickLaunch_ThemeSpec_Foundation_2026-09-30.md` Parts A/B (`75b9f7c`). Last completed batch spec: `Docs/QuickLaunch_ThemeSpec_Batch06_2026-10-01.md` (`16d89bf`); build `4191e24`.

## Remaining implementation

1. **Display-shrink fallback:** implement the committed `98dd104` spec, then independently verify. Reposition a preferred Fan/Ring if it fits; otherwise temporarily render Grid without replacing preferred layout/direction, saved radial dimensions or user data. Restore radial layout when space returns. Preserve primary-display/home rules, hidden state, order, size and existing growth/file-safety guards. Deliberate drag translates the radial anchor; temporary Grid resizing is runtime-only. This is already approved, not a new feature proposal.
2. **Theme fidelity batches 7–14:** 60 themes remain by audit membership. No dedicated Batch07–Batch14 spec exists in either current Docs tree. Judy must produce and commit each batch spec before Ender implements it. Audit direction and Foundation are inputs, not a substitute for that exact per-batch spec. Sequential spec → implementation → bounded independent QA → scoped development commit/push; version stays 1.94.3.
3. **Inherited theme acceptance debt:** carry the 19 expanded diagnostic failures across 15 themes into Judy's theme completion disposition. Integration QA identifies FF8 header/rest (3), Persona4 header/active-only (3), Manager hotkey active-only (13). Six are in already-completed batches; therefore blindly finishing only later themes would not resolve all inherited debt. Exact foreground/fill/geometry comparison found all 19 inherited and zero introduced. They are not a passing matrix or 19 new features. Fixing them requires a committed bounded Judy spec rather than ad hoc palette changes.

Regions M1–M5, F5 controls, Grid art scrolling, tray/options, icon-size refusal, branch integration and bounded M6 code cleanup have recorded implementation and safe QA. The inventory finds no additional named unimplemented regions milestone beyond the approved display fallback. Full native acceptance is still required to substantiate completion.

## Remaining theme batches

Counts are a manual sum of the exact comma-separated keys in audit §7: 7+8+10+7+8+6+8+6 = 60, with 41 keys in batches 1–6, total 101. Artwork action counts are copied from the audit, not new evaluations.

| Batch | Identity and exact keys | Audit art action: redraw / tone down / keep | Foundation adoption to carry into Judy's spec |
|---|---|---|---|
| 7 | Horror I: `amnesia`, `lovecraft`, `event-horizon`, `blair-witch`, `silent-hill`, `tiny-bunny`, `alan-wake` | 4 / 2 / 1 | Amnesia IM Fell English 400 title; Lovecraft IM Fell English 400 title and roman 12px banner; Event Horizon Cinzel 600 title. |
| 8 | Adventure journals and TV: `life-is-strange`, `the-sandman`, `indiana-jones`, `tomb-raider`, `uncharted`, `broken-sword`, `twin-peaks`, `x-files` | 5 / 3 / 0 | Tomb Raider Cinzel 700 title; other themes stock per Foundation. Audit explicitly assigns Twin Peaks title defect to this batch. |
| 9 | Fantasy RPG and heraldry: `wow-scourge`, `wow-alliance`, `wow-horde`, `wow-legion`, `wow-nightelf`, `diablo`, `dragon-age`, `the-witcher`, `game-of-thrones`, `mortal-kombat` | 8 / 2 / 0 | Scourge/Legion/Diablo Pirata One 400 titles; Alliance Cinzel 700; Horde/Dragon Age/Witcher Metamorphous 400; Game of Thrones Cinzel 700. |
| 10 | Harry Potter and Middle-earth: `hufflepuff`, `mordor`, `hogwarts`, `slytherin`, `ministry-of-magic`, `rivendell`, `ravenclaw` | 3 / 3 / 1 | Mordor Metamorphous 400; Hogwarts IM Fell English 400 title; Slytherin/Ravenclaw Cinzel 600 titles. |
| 11 | Film/TV sci-fi and game HUDs: `blade-runner`, `dune`, `firefly`, `doctor-who`, `lcars`, `eve-online`, `mass-effect`, `the-expanse` | 5 / 3 / 0 | Dune Jost 300 title/labels/banner with wide tracking; others stock per Foundation. |
| 12 | Horror II: `resident-evil`, `scp`, `soma`, `stalker`, `control`, `fatal-frame` | 4 / 2 / 0 | Stock under Foundation map; wishlist is not approval to download fonts. |
| 13 | Terminals and tactical HUDs: `alien`, `pip-boy`, `terminator`, `half-life`, `metal-gear`, `robocop`, `predator`, `matrix` | 4 / 3 / 1 | Stock under Foundation map. |
| 14 | Clean lines and wireframes: `tron`, `ghost-shell`, `evangelion`, `deus-ex`, `mirrors-edge`, `portal` | 0 / 4 / 2 | Portal Jost 400 title/labels/banner. |

**Scope wording inconsistency:** audit §7 says Batch14 is last and to run it only if Sergei wants full coverage; earlier handoffs mention only 7–13. The canonical plan's explicit all101 approval plus the latest feature-complete-original-spec instruction supplies full-coverage intent. Include Batch14 as original-scope completion, without claiming its six themes all need redraws (two are keep). No additional feature choice is inferred.

## Required theme constraints and acceptance

- Original franchise-style artwork only: no copied logos, ripped game art or assets. Judy chooses precise palettes/type/motifs and the audited redraw/tone-down/keep treatment, including the approved era decisions.
- Foundation H1–H8/C4/C5 remain: remove old panno/ghost readout; bounded header art/tag; one-line banner strings; no synchronized blackout, full-window background scrolling or expensive app-shadow animation; no glyph cropping; plate contrast ≥3:1; stock or approved local bundled type; at most two infinite animations; art stays out of interactive content. Grid scrolling fixes already landed and must survive.
- Every modified theme clears unchanged contrast floors; a legacy warning does not exempt a redesigned theme. Current integration/M6 static checker reports zero errors and **32 unchanged legacy warnings**. Treat this separately from the 19 actual expanded interactive-state failures. Do not rebaseline or lower thresholds to convert either into a pass.
- Verify actual reachable region and Manager states, hover/pressed/active/filter/edit/rename/empty/populated states and relevant layouts; obsolete deleted Settings overlays are invalid acceptance targets. Preserve all-theme F5 and Q2 evidence.
- Foundation type rules include declared weight/no synthesis, roman-only IM Fell, local fonts before measurement, title-edge ≤156px ladder where applicable, standard label fit, Cyrillic fallback and one-line banner-fit. Adapt exact targets to live layouts through Judy rather than assuming the old Grid title geometry applies everywhere.
- `src/renderer/fonts/README.md` (`4191e24`) supersedes the Foundation's historical seven-only inventory: **11 approved local font files** now exist (Dela Gothic One, Jost, Cinzel, Pirata One, UnifrakturCook, IM Fell English, Metamorphous, Cormorant Garamond italic, Libre Franklin, Black Ops One, Oxanium), each with OFL. No new file/font download is implied. Foundation adoption table gives later-batch defaults; Judy may reference the later committed font approvals when specifying the exact batch. No arbitrary locally installed face may slip into captures.
- CPU must not increase from theme motion. No removal of the preserved base blur is authorized: Foundation A7 records Sergei's prior refusal to ship that removal. Theme rule forbidding added blur does not reverse it.
- Before/after evidence and visual inspection remain required. Original plan wants Sergei to see the complete before/after before final shipping; implementation can accumulate without releasing. The later explicit no-release/no-version ruling governs this session.

## Native/performance/release acceptance debt — not extra features

The remaining obligations are named in Regions UX §§11/12, TechPlan §4 M6, and current integration/M6/M5/Q2 QA reports. Existing safe/mock passes certify only their stated scope.

- Fresh timed away window: native desktop shaping and transparent click-through, z-order/focus/keyboard/hotkey, region menus, real pointer movement/drag/drop/cross-region moves, Grid scrolling/focus-border near-fit cases, file-move/recovery routes and actual host rebuild/Quit. Use isolated data, never Sergei's running QuickLauncher or signed-in browser. The boundary-length launch check is a harmless `.lnk` to Notepad/Calculator; `.url` is refusal-only and never launched (Regions UX final M3 clarification).
- Explicit permitted display/scale/taskbar acceptance must restore the original settings and verify restoration; native display-shrink/return coverage comes after safe fallback implementation. No current window exists and sleep remains prohibited.
- M6 original obligations beyond completed cleanup: gallery visual review in all layouts; measured five-region idle CPU for 60s against one-region baseline; packaged Bitdefender/startup/local-font/lifecycle smoke; full Futaba pass and Senua accumulated-diff review. Visible/native parts require the machine window. Do not call cleanup-only QA a completed M6 release gate.
- Fractional last-focused-tile border excess is a pre-existing deferred Minor (0.5625px/1.171875px baseline readings, reachable icons/labels). Record actual native disposition rather than silently calling it fixed.
- Matching actual Ender/Futaba entry receipts remain unavailable. Global hook observation/compatibility evidence remains tooling debt; user explicitly directed product continuation. Do not disable hooks, broaden permissions, activate exceptions or fabricate receipts to proceed.
- Release/version/tag remains unauthorized. At completion, report implemented scope, acceptance performed and any machine-dependent items separately; do not equate feature implementation with installer/release clearance.

## Branch continuation

Use the existing integration branch/checkout for fallback and later theme batches, preserving original theme/regions branches as the verified historical inputs. This is the actual merged M6 architecture: shared `src/renderer/theme-names.js`, live Manager, reduced region privileges, and current gallery forwarding. Reimplementing batches on the preserved original theme branch would reintroduce the obsolete overlay/catalog divergence and require avoidable second integration.

After fallback implementation, pinned safe QA and exact development publication, begin **Judy Batch07 spec → Sully spec commit/push → Ender Batch07 → Futaba bounded independent QA → Sully exact development commit/push**, then Batch08 through Batch14 sequentially. Keep batch modifications separate, preserve other themes/behavior, route inherited completed-batch findings through explicit Judy followup specs. Native acceptance can run only when a fresh timed away window is provided; it need not block safe sequential theme implementation under the latest work instruction.
