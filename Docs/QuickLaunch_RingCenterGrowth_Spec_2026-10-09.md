# Ring center circle growth

Sergei requested that the circle inside a Ring grows together with the Ring, referring to the existing central region handle.

Judy's bounded specification: keep the center circle concentric and scale its diameter as current base diameter × current Ring radius ÷ base radius, never smaller than today's base diameter. Cap growth before it reaches any shortcut tile, preserving the existing shared spacing gap; measure clearance against actual tile bounds. Recalculate whenever Ring geometry changes, including item count and icon size.

Keep labels, icons and menu controls upright at existing readable sizes. The visible circle defines its drag hit area, excluding interactive controls. Controls retain their own hit areas, and no central hit area may cover a shortcut. Fan and all other layouts remain unchanged. No new setting or control is requested.

Source mapping determines existing geometry constants and all renderer/native hit-shape consumers before implementation. Keep layout, collision bounds, desktop fitting and native hit testing consistent with the grown circle. Retain the global transparency setting on the enlarged background.

This joins the current v1.98.0 scope with drag/drop placement,16 regions and the reported Match All transparency correction. Real-file grouping stays deferred. Sergei owns manual QA; no automated tests, agent QA or app launches. Manual check: enlarge/shrink a Ring, change item count/icon size, confirm center stays centered and clear of tiles; drag the circle and use its menu, retaining solid readable foreground and global transparency.
