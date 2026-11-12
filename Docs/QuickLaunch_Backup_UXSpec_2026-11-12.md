# QuickLaunch backup UX spec — 2026-11-12

Status: ready for prerequisite spec commit. Judy; source inspection only, no app launch or measured product rects. EXTEND QuickLaunch 1.104.3 Manager Settings. Sergei authorized a complete backup before uninstall and restore after reinstall.

## Outcome and boundaries

Export one `.qlbackup` file containing regions/layout, settings, shortcut records and the actual shortcut files managed by QuickLauncher. Import replaces the QuickLauncher setup after validation and explicit confirmation. On the same PC after uninstall, matching returned desktop shortcuts are safely reclaimed so the launcher and desktop have the same managed-shortcut membership as at export. Sergei explicitly requires one instance of each shortcut: importing moves matching desktop shortcuts into QuickLauncher, rather than leaving a desktop copy. Repeated import is idempotent and must not create duplicates.

Installed apps and documents referenced by shortcuts remain external. Import reports unavailable targets; it cannot reinstall apps or recover external documents. Windows desktop icon pixel positions are outside this feature. Existing region work-area fitting still applies when display geometry differs. Do not add a merge mode, per-item restore wizard, cloud backup or unrelated settings.

Duplicate prevention concerns only shortcuts this import would restore. This is not a desktop cleanup feature: unrelated desktop duplicates do not block import or trigger cleanup. Do not add duplicate-management controls or a global scan result to the UX.

## Placement and layout

Add a **BACKUP** section to Manager → Settings immediately before VERSION. Keep the current Settings scrollbar and footer; do not add a tab or tray menu item.

Use the existing section/setting typography, with this content in normal document flow:

- Heading: `BACKUP`
- Help: `Save your layout, settings, and shortcuts for reinstalling QuickLauncher.`
- Buttons: `EXPORT BACKUP…` then `IMPORT BACKUP…`
- Persistent result/status area immediately below the buttons, empty when idle.

Section top padding 16 px, border-top using `--border`, heading-to-help gap 6 px, help-to-actions 10 px, actions gap 8 px, status gap 8 px. Buttons minimum 32 px tall and 24 px wide; 8 px horizontal padding minimum. Use wrapping flex actions: each button keeps its whole label; at narrow width wrap the second below the first. No absolute positioning. Text and result paths wrap within the section, including long unbroken filenames; no horizontal overflow or hidden result behind the footer. Status uses normal 12 px body text, at least 1.4 line-height, `--text`, without uppercase transformation or extra tracking. Do not color errors using color alone.

Exact control metadata:

| Control | title / accessible name |
|---|---|
| EXPORT BACKUP… | `Save layout, settings, and shortcut files to a backup` |
| IMPORT BACKUP… | `Replace the QuickLauncher setup from a backup` |

Use the visible button label as the accessible name and the longer string as title; associate both actions with the section help. All new controls need titles in their creation commit.

## Export flow

1. Click Export → native Save dialog, title `Export QuickLauncher backup`, button `Save`. Suggest `QuickLauncher-backup-YYYY-MM-DD.qlbackup`. Filter label `QuickLauncher backup (*.qlbackup)`. Honor Windows overwrite confirmation.
2. Dialog cancellation returns to idle without a notice or file change.
3. Export validation and writing show `Saving backup…` in the inline status. Snapshot layout/settings/files consistently. Do not label a backup complete if any required managed shortcut could not be included.
4. Success: `Backup saved.` followed by the selected path on its own wrapping line. Keep the result until the next backup action or Manager closes. No timed toast and no automatic Explorer launch.
5. Missing/unreadable managed file: `Backup not saved: a shortcut file is unavailable.` Then `Check the shortcut and try again.` Include affected filenames in native error detail, no internal IDs/stack traces. Unresolved missing tiles must be disclosed; never silently promise a complete backup.
6. Other write/space/access failure: `Backup not saved: {plain reason}.` Then the actionable fix, such as `Choose another folder and try again.` Existing complete destination backups must survive a failed export.

## Import flow

1. Click Import → native Open dialog, title `Import QuickLauncher backup`, button `Open`, same backup filter, single-file selection. Cancel is quiet.
2. Inline status `Checking backup…`. Validate archive contents and required shortcut payloads before a confirmation or live state/file mutation. Invalid files never partially replace the setup.
3. Present a native question dialog, owned by Manager, title `Import QuickLauncher backup?`, message `Replace this QuickLauncher setup?`. Detail begins `Backup: {filename}` and `{regions} regions · {shortcuts} shortcuts`, then `{managed} moved shortcuts · {references} references`. Next: `This replaces your layout, settings, and shortcut list.` Then `Matching shortcuts on the desktop move into QuickLauncher.` Then `QuickLauncher restarts to apply the backup.` If checks find unavailable external targets, append `{missing} shortcut targets are unavailable.` and name those targets in the detail. Count records included in the validated backup; managed plus reference counts equal the shortcut total; do not count archive entries or folders as shortcuts. Zero missing targets needs no warning. Apply singular/plural grammar.
4. Buttons `Cancel`, `Import`; Cancel is default and Escape/cancel action. Import is the single explicit authorization to apply this chosen backup. Do not silently import after the Open dialog.
5. Preflight conflicts that cannot be resolved without ambiguity refuse import before any replacement. Dialog title `Backup not imported`, message `A shortcut conflicts with an existing file.`, detail lists affected filenames/paths and `Move the conflicting file, then try again.` Button `OK`. Multiple matching files use `More than one matching shortcut was found.` / `Keep one copy, then try again.` Never overwrite or remove unrelated desktop files, choose by filename alone, or silently leave duplicates after reporting a full restore. A renamed but uniquely verified byte-identical desktop shortcut is reclaimed; changed or ambiguous originals refuse the whole import. Existing managed files that would be displaced must be returned safely through the import transaction; if that cannot be done safely, refuse with an actionable explanation. After uninstall, an embedded shortcut may recreate a genuinely absent original, but only once reconciliation proves that it will not leave a matching desktop/store copy.
6. After Import, status `Restoring backup…`. Apply a coherent setup; no incremental launcher/desktop flicker that looks like a completed restore. Ender owns transaction/recovery mechanics. Do not announce success until files, configuration and live region windows agree.
7. Success: `Backup imported.` and `{regions} regions · {shortcuts} shortcuts restored.` On the next line show `Matching desktop shortcuts were moved into QuickLauncher.` when any were reclaimed. Show `{missing} shortcut targets are unavailable.` only when validated target checks establish that condition; provide filenames/targets in native result detail. Such tiles stay identifiable as missing through the existing app behavior. Do not execute shortcuts merely to check their targets.
8. Persist the pending result, finish the durable transaction and perform one controlled restart to apply layout, settings, login behavior and hotkey. No manual relaunch is required. Reopen Manager Settings with the completed result scrolled into view after the restarted app validates its restored state; do not announce success before that check. The restart is authorized by the explicit confirmation and cannot happen during validation or after Cancel. A restored global hotkey conflict must use the existing conflict/fallback behavior and report `Hotkey unavailable: {keys}.` without pretending the requested binding is active.

## Busy, cancellation and failures

Only one backup action runs at a time. Disable both backup buttons from dialog opening through completion. Before commit, validation/preflight must detect concurrent setup changes and recheck or refuse; never restore over unseen newer state.

During actual snapshot/import mutation, block conflicting edits, drops, move-back, delete, settings changes, updater install and overlapping backup operations through the authoritative operation lock; native region interactions must not bypass it. Busy operations do not steal focus. Manager's close/hide can remain usable only if the operation and result survive reopening; otherwise defer dismissal until safe and show `Finishing backup…` or `Finishing import…`. Do not add a misleading Cancel button once an operation cannot safely cancel. Existing Quit/uninstall paths must coordinate with the transaction, rather than interrupting it mid-move.

No mutation starts during preview. Cancel from either native file picker or confirmation leaves setup and files unchanged. Closing the native confirmation equals Cancel. On error release the busy state, return focus to the invoking action and retain a useful result. Retrying remains possible.

Error copy contract (native detail may name the offending path):

| Condition | Message / fix |
|---|---|
| Invalid or incomplete backup | `Backup not imported: the file is invalid or incomplete.` / `Choose another backup.` |
| Unsupported newer format | `Backup not imported: this backup needs a newer QuickLauncher.` / `Update QuickLauncher, then try again.` |
| Store read-only or unstable transaction | `Backup not imported: QuickLauncher cannot save its setup.` / `Check access to the data folder, then try again.` |
| State changed during preview | `Backup not imported: your setup changed.` / `Open the backup again to review it.` |
| Import failed and rollback verified | `Backup not imported: {plain reason}.` / `Your setup is unchanged.` |
| Recovery incomplete | `Import needs recovery.` / `Keep QuickLauncher open and check these files.` |

The last condition must disclose verified retained/recovery locations and actual next steps in a persistent native error detail; do not use the rollback-verified message. Ender must supply recovery behavior before that message is wired. Normal actionable OS errors use plain terms (access denied, disk full, file in use), not raw JavaScript text.

## Keyboard, themes and verification

Tab order follows the section's visual order: Export, Import, then existing Version/Keyboard Shortcuts/footer controls. Enter/Space activates focused buttons; no new global accelerator. Native dialogs own their default and Escape behavior. Disabled controls cannot launch a second operation. Inline status is `role=status`/polite live; final errors use an alert announcement once, without repeating every render. Focus indication is at least 2 px and visible in every theme.

Use existing Manager theme tokens and button styling, including the existing `--text` hover rule. Normal, hover, focus, busy and error text must meet WCAG AA 4.5:1; no new palette. Respect reduce-motion and avoid progress animation requiring ambient motion.

Futaba measures actual button and footer rects (getBoundingClientRect, report x/y/width/height) at Manager minimum size, standard size and supported scaling; idle, wrapped controls, long success path, multiline error and busy state. Same-plane actionable rects must not intersect; all content remains reachable by vertical scroll. Native dialogs are the deliberate overlay exception. Theme checks include the light themes and prior white-hover failure cases mirrors-edge, portal and silent-hill; run the normal full-theme contrast/hover gates for changed controls.

Behavior acceptance uses isolated fake desktops/data, never Sergei's live setup: export → uninstall restore → fresh install/import, matching desktop reclamation, duplicate/conflicting name, changed content/identity, missing reference target, invalid/truncated/newer backup, locked file, disk/store failure, interruption/recovery, cancellation and repeat import. Verify file identities/contents and launcher records, not only tile counts or a success message. No headless result is a visual GO; follow the studio focus-permission rule for any native inspection.

## Local lessons applied

- QuickLaunch Brief, Store durability/read-only recovery decisions (2026-09-28): prior BSOD shortcut loss means backup/import must never replace a recoverable setup with empty/partial state. Success requires durable file and store completion; failure copy must reflect verified recovery.
- ProcessRules, No UI element may cover another: Settings section remains in scroll flow; verify actual hit rects for wrapping/status/footer states.
- QuickLaunch M5 tray/options UX addendum (2026-10-08): white hover text failed in several themes; retain Manager's `--text` hover and measure it.
- Existing moved shortcut identity checks (mover.js): config plus naive file copies is insufficient. Ender must rebuild and verify valid managed identities and reconcile matching desktop originals. This is a required technical acceptance outcome, not a file-format prescription.

No implementation, live testing, new incident or disposable scratch output was produced by this spec pass. Sully must commit this exact spec before Ender cites it to implement.
