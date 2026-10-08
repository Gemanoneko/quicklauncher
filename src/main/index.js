const { app, globalShortcut, ipcMain, BaseWindow } = require('electron');
const path = require('path');

// --ql-restore-all (the uninstaller runs it and waits): move every moved
// desktop shortcut back, then exit. No window, tray, hotkey or startup entry.
// Exit codes: 0 nothing left in the store folder, 2 something is left,
// 3 QuickLauncher is already running (nothing done), 4 moving is unavailable,
// 64 a refused --ql-test-desktop.
const RESTORE_ALL = process.argv.includes('--ql-restore-all');

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(RESTORE_ALL ? 3 : 0);
}

const Store = require('./store');
const { setupTray, refreshTrayMenu } = require('./tray');
const { setupUpdater } = require('./updater');
const { setupIPC, VALID_THEMES, buildAppEntry } = require('./ipc');
const { RegionController } = require('./regions/controller');
const { Manager } = require('./manager');
const win32Moves = require('./moves/win32');
const { resolveMoveSetup } = require('./moves/setup');

// Runtime flags (never build modes):
//   --ql-no-desktop-layer  regions are ordinary tool windows just above the desktop
//   --ql-no-update-check   no update check 5 s after start (local test builds; updater.js)
//   --ql-test-hooks        self-test: the Manager opens hidden and is never shown
//                          or focused; region bounds and metrics are logged;
//                          the manager:test channel answers; message boxes
//                          are recorded, never shown. Without --ql-test-desktop
//                          moving is unavailable (no real desktop file moves).
//   --ql-test-desktop=<dir>  the file move uses <dir>\Desktop, <dir>\Public Desktop
//                          and <dir>\QuickLauncher Shortcuts; refused (exit 64)
//                          unless they and the profile lie inside %TEMP%.
const KILL_SWITCH = process.argv.includes('--ql-no-desktop-layer');
const TEST_HOOKS = process.argv.includes('--ql-test-hooks');

const logRegions = (o) => { try { console.log(`[regions] ${JSON.stringify(o)}`); } catch { /* noop */ } };

// The move's folders, checked before anything else runs (tech plan § 3).
const moveSetup = resolveMoveSetup({ argv: process.argv, env: process.env, userData: app.getPath('userData'), win32: win32Moves, testHooks: TEST_HOOKS });
if (moveSetup.refused) {
  console.error(`[moves] --ql-test-desktop refused: ${moveSetup.refused.join('; ')}`);
  process.exit(64);
}
logRegions({ event: 'moves-setup', available: moveSetup.available, reason: moveSetup.reason, testMode: !!moveSetup.testMode, folders: moveSetup.testMode ? moveSetup.folders : undefined });

const store = new Store();
const ctl = new RegionController({
  store, validThemes: VALID_THEMES, killSwitch: KILL_SWITCH, testHooks: TEST_HOOKS, log: logRegions,
  moveSetup, win32: win32Moves, buildEntry: (p) => buildAppEntry(p),
});
const mgr = new Manager({ store, testHooks: TEST_HOOKS, log: logRegions });
ctl.manager = mgr;
let sentinel = null;

// ── Store → renderer delivery ──────────────────────────────────────────────
// A message sent before a page has registered its listeners is dropped. The
// boot-time save error (data file locked at login) fires ~100 ms after start,
// long before the primary region's page has subscribed — so it waits until
// that page says it is listening (controller.rendererReady).
store.on('save-error', () => {
  if (!ctl.sendToPrimary('store-save-error')) ctl.saveErrorPending = true;
});
// Read-only ended mid-session and the data file was merged with this
// session's changes: every region page adopts its part of the merged state
// and acks it; the store is told once all of them have.
store.on('renderer-sync', () => ctl.onStoreRendererSync());
// Settings the main process applied at boot from the read-only copy.
store.on('reconciled', () => {
  if (RESTORE_ALL) return; // no hotkey, no windows in restore mode
  // A read-only save error still waiting for the renderer no longer applies.
  ctl.saveErrorPending = false;
  const accel = (store.get('settings') || {}).globalHotkey;
  if (accel !== _activeHotkey) applyGlobalHotkey(accel);
  try { ctl.onStoreReconciled(); } catch (e) { logRegions({ event: 'reconcile-error', error: String(e && e.message) }); }
  refreshTrayMenu();
});

// Every quit path: write pending saves, take the regions out of Explorer's
// tree, end the process. No renderer round-trip.
let quitting = false;
function quitApp(reason) {
  if (quitting) return;
  quitting = true;
  try { ctl.flushPendingRects(); } catch { /* never block quitting */ }
  try { store.flush(); } catch { /* never block quitting */ }
  try { logRegions({ event: 'quit', reason, released: ctl.releaseAll() }); } catch { /* noop */ }
  app.exit(0);
}

// --ql-restore-all: the store and the mover only.
async function restoreAll() {
  const { Mover } = require('./moves/mover');
  const regions = () => store.get('regions') || [];
  const mover = new Mover({
    folders: moveSetup.folders || {}, journalDir: path.dirname(store.dataPath), win32: win32Moves, confineTo: moveSetup.confineTo || null,
    available: moveSetup.available, reason: moveSetup.reason, log: logRegions,
    data: {
      apps: () => store.get('apps') || [],
      commit: (apps) => { store.set('apps', apps); return store.flush(); },
      regionExists: (id) => regions().some((r) => r && r.id === id),
      primaryId: () => (regions()[0] ? regions()[0].id : null),
      writable: () => !store.isReadOnly(),
      capOf: () => Infinity,
    },
  });
  await mover.init();
  const out = await mover.restoreAll();
  logRegions({ event: 'restore-all', moved: out.moved, orphansMoved: out.orphansMoved, failed: out.failures.length, remaining: out.remaining, unavailable: out.unavailable || null });
  if (out.unavailable) return 4;
  return out.remaining.length ? 2 : 0;
}

app.whenReady().then(() => {
  if (RESTORE_ALL) {
    restoreAll()
      .then((code) => { try { store.flush(); } catch { /* noop */ } app.exit(code); })
      .catch((e) => { logRegions({ event: 'restore-all-error', error: String(e && e.message) }); app.exit(1); });
    return;
  }
  // Migration, random theme on startup and the region windows.
  ctl.init();

  // Desktop children never receive WM_QUERYENDSESSION. This hidden top-level
  // window (no renderer) does, so logoff and shutdown still flush the store.
  try {
    sentinel = new BaseWindow({ show: false, width: 1, height: 1, skipTaskbar: true, focusable: false });
    sentinel.on('session-end', () => {
      try { ctl.flushPendingRects(); } catch { /* noop */ }
      try { store.flush(); } catch { /* noop */ }
      try { ctl.releaseAll(); } catch { /* noop */ }
    });
  } catch (e) {
    logRegions({ event: 'sentinel-error', error: String(e && e.message) });
  }

  setupTray({ ctl, mgr, electronApp: app, store, quit: quitApp });
  // The tray's New region item is disabled at the cap: rebuild it when the count changes.
  ctl.on('regions-changed', () => refreshTrayMenu());
  setupIPC(ctl, store, app, mgr, { testHooks: TEST_HOOKS, quit: quitApp });
  setupUpdater(() => ctl.primaryWebContents(), () => mgr.window && !mgr.window.isDestroyed() ? mgr.window.webContents : null);
  ctl.getUpdateState = require('./updater').getUpdateState;
  ctl.replayUpdateOffer = (id) => {
    const rt = ctl.rt.get(id), region = ctl.region(id);
    if (id === ctl.primaryId() && rt && rt.ready && region) require('./updater').replayOffer(rt.wc, region.layout);
  };

  // ── Global show/hide hotkey ────────────────────────────────────────────
  // Sergei's default Ctrl+Space, rebindable. It hides every region if they
  // are shown, and shows them if hidden (regions spec Q1: toggle). It never
  // moves keyboard focus. globalShortcut is the only Electron mechanism that
  // fires while the regions are hidden or unfocused.
  applyGlobalHotkey(store.get('settings').globalHotkey);
  registerHotkeyIpc();

  // Apply auto-launch preference (packaged builds only — dev builds use the
  // bare Electron binary as exe path, which would register the wrong entry)
  if (app.isPackaged) {
    const settings = store.get('settings');
    const desiredOpenAtLogin = settings.startWithWindows !== false;
    const current = app.getLoginItemSettings();
    // Only rewrite the Run-key entry when the registered state actually differs.
    // (getLoginItemSettings on Windows doesn't expose the registered exe path, so we
    // can't compare it here — openAtLogin is the only stable field to check.)
    if (current.openAtLogin !== desiredOpenAtLogin) {
      app.setLoginItemSettings({
        openAtLogin: desiredOpenAtLogin,
        path: app.getPath('exe')
      });
    }
  }
});

// A second launch shows every region. It does not open the Manager (spec 7.2).
app.on('second-instance', () => {
  ctl.showAll();
});

// Keep running in the tray when windows close. Required: an Explorer restart
// destroys every region window at once, and the watchdog rebuilds them.
app.on('window-all-closed', () => {
  // Intentionally empty
});

// Belt-and-braces: Electron unregisters globalShortcuts on process exit, but
// being explicit avoids edge cases on rapid restart (cached registrations
// occasionally survive on Windows when a child crash kills the renderer).
app.on('will-quit', () => {
  try { globalShortcut.unregisterAll(); } catch { /* noop */ }
  // Normal quit paths (including autoUpdater.quitAndInstall) — write any
  // change still sitting in a debounce, and leave Explorer's tree.
  try { ctl.flushPendingRects(); } catch { /* noop */ }
  try { store.flush(); } catch { /* noop */ }
  try { ctl.releaseAll(); } catch { /* noop */ }
});

// ── Global hotkey machinery ────────────────────────────────────────────────
// Track the currently-registered accelerator so we can unregister cleanly
// before applying a new one.
let _activeHotkey = null;

function applyGlobalHotkey(accel) {
  // Accelerator string shape (e.g. 'Ctrl+Space', 'Alt+Shift+Q') is validated
  // by globalShortcut.register itself — bad strings throw; we catch and
  // report failure so the Manager can surface it in Settings.
  try {
    if (_activeHotkey) {
      globalShortcut.unregister(_activeHotkey);
      _activeHotkey = null;
    }
    if (!accel) return { ok: true, registered: null };
    const ok = globalShortcut.register(accel, () => ctl.toggleAll());
    if (!ok) {
      console.warn(`[hotkey] register failed for "${accel}" — likely held by another app`);
      return { ok: false, registered: null, reason: 'CONFLICT' };
    }
    _activeHotkey = accel;
    return { ok: true, registered: accel };
  } catch (err) {
    console.warn(`[hotkey] register threw for "${accel}":`, err.message);
    return { ok: false, registered: null, reason: 'INVALID' };
  }
}

function registerHotkeyIpc() {
  ipcMain.handle('apply-global-hotkey', (_, accel) => {
    // Persist + register. The Manager calls save-settings separately for
    // the value to survive restart; this handler does the live re-bind.
    return applyGlobalHotkey(accel);
  });
  ipcMain.handle('get-global-hotkey-status', () => ({
    registered: _activeHotkey
  }));
}
