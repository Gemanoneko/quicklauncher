const { app, globalShortcut } = require('electron');
const path = require('path');

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

const { createWindow } = require('./window');
const Store = require('./store');
const { setupTray } = require('./tray');
const { setupUpdater } = require('./updater');
const { setupIPC, VALID_THEMES } = require('./ipc');

let mainWindow = null;
const store = new Store();

app.whenReady().then(() => {
  const s = store.get('settings');
  if (s.randomTheme !== false && VALID_THEMES.size > 0) {
    const themes = [...VALID_THEMES];
    const others = themes.filter(t => t !== s.theme);
    const pool = others.length ? others : themes;
    store.set('settings', { ...s, theme: pool[Math.floor(Math.random() * pool.length)] });
  }

  mainWindow = createWindow(store);
  setupTray(mainWindow, app, store);
  setupIPC(mainWindow, store, app);
  setupUpdater(mainWindow);

  // ── Global show/hide hotkey ────────────────────────────────────────────
  // Per UX Review §6A / I1 (Sergei's locked default Ctrl+Space, rebindable).
  // globalShortcut is the only Electron mechanism that fires while the
  // window is hidden / unfocused — exactly what's needed for a launcher.
  // applyGlobalHotkey is invoked here at boot, and again from the renderer
  // (via 'apply-global-hotkey' IPC) whenever the user changes the binding.
  applyGlobalHotkey(store.get('settings').globalHotkey, mainWindow);
  registerHotkeyIpc(store, () => mainWindow);

  store.on('save-error', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('store-save-error');
    }
  });

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

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

// Keep running in tray when all windows are closed
app.on('window-all-closed', () => {
  // Intentionally empty — prevents the default quit so the tray icon stays alive
});

// Belt-and-braces: Electron unregisters globalShortcuts on process exit, but
// being explicit avoids edge cases on rapid restart (cached registrations
// occasionally survive on Windows when a child crash kills the renderer).
app.on('will-quit', () => {
  try { globalShortcut.unregisterAll(); } catch { /* noop */ }
});

// ── Global hotkey machinery ────────────────────────────────────────────────
// Track the currently-registered accelerator so we can unregister cleanly
// before applying a new one.
let _activeHotkey = null;

function applyGlobalHotkey(accel, win) {
  // Accelerator string shape (e.g. 'Ctrl+Space', 'Alt+Shift+Q') is validated
  // by globalShortcut.register itself — bad strings throw; we catch and
  // report failure so the renderer can surface it in settings.
  try {
    if (_activeHotkey) {
      globalShortcut.unregister(_activeHotkey);
      _activeHotkey = null;
    }
    if (!accel) return { ok: true, registered: null };
    const ok = globalShortcut.register(accel, () => {
      // Show/hide toggle — restore from minimized first so the window
      // reliably comes to the foreground.
      if (!win || win.isDestroyed()) return;
      if (win.isVisible() && win.isFocused()) {
        win.hide();
      } else {
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
      }
    });
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

function registerHotkeyIpc(store, getWin) {
  const { ipcMain } = require('electron');
  ipcMain.handle('apply-global-hotkey', (_, accel) => {
    // Persist + register. Renderer should call save-settings separately for
    // the value to survive restart; this handler does the live re-bind.
    return applyGlobalHotkey(accel, getWin());
  });
  ipcMain.handle('get-global-hotkey-status', () => ({
    registered: _activeHotkey
  }));
}
