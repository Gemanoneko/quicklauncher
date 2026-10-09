# Add Region in the launcher context menu

Sergei requested: "Need to add 'Add Region' to a right click menu."

Judy's bounded specification: add **Add Region** as a native submenu immediately after **Add installed app…**, before the first separator, in the existing region header right-click/⋯ menu. Reuse the existing new-region layout labels, order, radial capacity annotations and availability rules; choosing a layout calls the existing creation flow. Keep Add Region visible but disabled at the eight-region limit. Preserve native keyboard navigation and dismissal; cancelling leaves focus on the invoking region, while successful creation follows existing creation focus behavior without opening the Manager or requiring a rename. Background, tile and tray menus remain unchanged.

Implementation scope: `src/main/regions/controller.js`, existing `popupRegionMenu` and creation helpers. No new IPC or preload channel is needed. Native menu items use native platform interaction; no custom tooltip surface is introduced.

Sergei owns manual QA. No agent QA, automated tests, application launches or native-test tooling work is authorized for this change. Manual check after release: header right-click and ⋯ both show Add Region; create a region through the submenu, and check the entry is disabled when eight regions exist.
