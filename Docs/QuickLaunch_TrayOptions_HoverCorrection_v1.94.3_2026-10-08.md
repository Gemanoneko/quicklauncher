# Manager CLOSE hover correction — v1.94.3 — 2026-10-08

Futaba found that the approved class-qualified Manager hover rule did not override the base ID-qualified CLOSE colour. CLOSE remained below 4.5:1 in 55 of 101 themes. Ender added body.manager #btn-close-settings:hover to the existing approved --text rule, preserving all colours, sizing and tooltips.

Changed files for this correction: src/renderer/styles/manager.css and test/regions/manager-hover.test.js. The focused regression uses actual base/Manager colour rules and CSS ID/class/tag specificity; its known-bad control removes the ID-qualified selector and reproduces --btn-close-color winning. Independent renderer QA must remeasure CLOSE across 101 themes. Valid prior Column/tray/replay measurements carry only by unchanged snapshot hashes.

Pin2 is copied from immutable tray-options pin1, with only manager.css, the new test and this report replaced/added. No current M5 production files enter this pin. The sibling tray-options-pin-2-manifest.json identifies the original pre-M5 source HEAD, current correction source HEAD, all hashes and changed files. Pin1 is untouched. Entry receipts/native checks remain pending; no product main, real input, visible test, display change or actual update was used.
