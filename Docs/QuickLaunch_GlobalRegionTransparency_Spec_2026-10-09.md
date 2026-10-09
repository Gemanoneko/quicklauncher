# Global region transparency

Sergei requested transparency and one slider in Settings controlling all regions together.

Judy's specification: place **Region transparency** immediately below **Icon Size** in Settings, using the existing slider style with a visible percentage: 0–100%, step5%, default0% (fully opaque). Helper text: **Applies to all regions. Icons and text stay solid.** Changes apply live to every open region and persist for restarts and newly created regions.

Fade background fills only: rectangular region bodies, headers, tiles and filled controls; for Fan/Ring, existing handle and tile-chip backgrounds fade while the surrounding area stays transparent. Keep text, icons, control glyphs, outlines and focus indicators fully opaque. Never apply opacity to a whole window or a content container. Preserve theme colors and existing blur behavior; introduce no blur, animation, timer or polling loop. Keep existing artwork and layouts intact. Use native slider keyboard behavior and expose its label and current percentage to accessibility tools.

Reuse the existing global settings save/broadcast contract. Clamp and validate the numeric setting at its existing main-process boundary; missing legacy values resolve to0. A transparency-only update should not reload a theme or restart existing banner/entrance animation unnecessarily. Restrict background treatment to region windows, leaving Manager surfaces unchanged.

Implementation works from the clean product checkout on codex/region-transparency. Original integration main/store/IPC native-test drafts remain parked and excluded. Primary expected files: manager.html, manager.js, app.js, region.css, ipc.js and store.js; existing controller settings propagation may be reused or minimally adjusted if necessary. No new IPC channel or per-region setting is requested.

Sergei owns manual QA. No automated tests, agent QA, app launches, test harnesses or native-test work. Manual checks after release: change the slider with several region layouts open; all backgrounds change together while foreground stays solid;0% preserves original theme appearance; switching themes/layouts, creating a region and restarting retain the value; Manager appearance stays unchanged.
