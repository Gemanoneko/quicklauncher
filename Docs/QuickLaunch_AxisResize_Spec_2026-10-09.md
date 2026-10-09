# Manual Column and Row resizing

Sergei reported that a Column region cannot be enlarged downward and requires scrolling. He confirmed Column layout, then requested the same horizontal resizing ability for Row.

Judy's combined specification: Column gets a bottom resize edge for height; Row gets a right resize edge for width, using the existing6px affordance and appropriate resize cursor. Keep Column width and Row height derived from their one-dimensional layouts. Auto-fit each layout until its first completed manual resize, then remember its chosen dimension separately per region across dragging, restarting, content/icon-size changes and layout switches. Overflow retains existing vertical scrolling for Column and horizontal behavior for Row; removing items must not shrink manually sized regions.

Hold the opposite edge fixed and constrain resizing to the existing minimum usable size, desktop work area and collision spacing, without moving other regions. Save only successful completed resizes. Cancellation/failure preserves the prior dimension and auto/manual state. Temporary geometry clamps retain the saved preferred dimension for when it fits again. Manual dimensions override post-drag auto-fit; free dragging and nearest-space placement remain intact. Grid stays unchanged; Fan and Ring gain no resize controls.

Use validated optional per-layout dimensions with missing legacy values meaning auto. Reuse existing resize IPC and extend only necessary axis hit surfaces. The confirmed v1.98 post-drag Row/Column auto-fit regression is repaired by anchored content refitting after a valid drop; preserve the chosen drop anchor and do not relocate other regions. Apply this repair consistently with manual preferences.

Expected scope: regions/model.js, controller.js, layouts.js, renderer/region.js and styles/region.css; existing window bounds must include the new axis resize rim. Source investigation determines exact consumers. No unrelated theme, native backend or data-model redesign is requested. Original integration native-test drafts remain parked and excluded.

Sergei owns manual QA. No automated tests, agent QA, application launches or native-test tooling. Manual checks after release: pull Column bottom down and Row right outward; verify overflow, fixed cross-axis and other regions; cancel a resize; drag into open space before/after a manual resize; switch layouts and restart to confirm remembered dimensions; retain existing Grid/Ring/Fan behavior.
