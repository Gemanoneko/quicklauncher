# Region drag overlap and free-space drop

Sergei requested that regions can be dragged over one another, then an overlapping drop moves the dragged region to the closest free desktop space.

Judy's bounded behavior specification: during dragging, the dragged region follows the pointer and appears above other regions, allowing temporary overlap. On release, keep a valid non-overlapping position; otherwise move only the dragged region to the nearest available position within existing desktop work-area boundaries, using current collision geometry and minimum spacing for every layout. Nearest means smallest straight-line displacement from the released position, measured using the existing region position anchor. Equal-distance candidates resolve topmost, then leftmost. Other regions stay put.

Persist only the final valid position. If no free position exists, restore the position from before the drag. Cancellation also restores that position. Preserve existing monitor/taskbar constraints and normal stacking behavior after drag ends. Add no animation, control, drag decoration, polling or timer loop. Programmatic positioning, layout changes and restoration retain their existing safety behavior.

Implement on clean codex/region-drop-snap product source, preserving parked native-test drafts in the original integration checkout. Source inspection determines the minimal renderer/main/placement contract ends; no unrelated geometry rewrite is requested.

Sergei handles manual QA; no automated tests, agent QA, app launches or native-test tooling. Manual checks after release: drag freely across other regions and release in free space; drop on an occupied region and verify only the dragged region snaps; check several layouts and screen edges; cancel a drag and verify original position; restart and verify final placement persists. Real-file grouping remains deferred; Fan direction Down already supplies upside-down Fan and requires no change.
