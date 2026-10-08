# Tray B and three options — v1.94.3 — 2026-10-08

Ender. Source HEAD b6cc4b3624768bfd7d865027287a8dba54ca2552. This is a separate production snapshot before M5 implementation, extending the committed M5TrayOptions addendum.

Tray B retains the existing item position, shows the committed offer label, and opens Manager Settings. With no offer it checks once unless already checking; available/downloading/ready clicks do not check, download or install. Main updater state changes refresh the menu. Dot and icon-tooltip rules are unchanged.

The three approved options are implemented: Column checking/current/error text is shown unless an action button carries the message; the current available/downloading/ready offer replays to a ready Grid/Column primary after rebuild, promotion or layout switch; and Manager hover glyphs use --text. A dismissed offer stays dismissed through replay and state progression, while a fresh update-available resets notification dismissal. Row/Fan/Ring pages receive no replayed banner. Replaying never modifies the offer, tray dot or download state.

Replay boundaries: updater exports replayOffer; index installs a role/layout/readiness-scoped controller callback; controller calls it from rendererReady, primary promotion after delete, and layout switch. Down­loading replay seeds the offer then sends progress so the existing banner action becomes disabled. The stored item list, files and order are unchanged.

Focused mock tests pass 13/13: the prior nine updater route regressions plus four new option tests. New tests cover all three replay states, dismissal through download/ready and fresh notification, excluded layouts/dead pages/no offer, and five tray offer/checking label/click cases. No real tray/menu or updater service is used. Geometry, message rects and all-theme hover contrast remain independent renderer QA work; no native route or real-input acceptance is claimed.

Files: src/main/tray.js, src/main/updater.js, src/main/index.js, src/main/regions/controller.js, src/renderer/styles/region.css, src/renderer/styles/manager.css and test/regions/update-options.test.js. The saved tray-options.patch captures this stage's tracked hunks so later M5 changes can be reviewed separately. QA-tool files belong to their separate snapshot; no M5, Q2 fit-policy, merge, version or release change is included here.

Pin: C:/Antigravity Projects/Studio Illuminati/WIP/QuickLaunch/scratch/2026-10-08-qa-tools-ender/tray-options-pin-1; sibling tray-options-pin-1-manifest.json records SHA256 hashes and the actual source HEAD. From pin, run node --test test/regions/update-options.test.js test/regions/updater-route.test.js. Full product/main/native host launch, visible tests, real input, display/scale/taskbar changes, sleep and actual updates remain prohibited. Entry-receipt compatibility remains outside this scope.
