const { app } = require('electron');
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
