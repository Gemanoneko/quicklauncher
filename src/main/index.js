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
const { setupIPC } = require('./ipc');

let mainWindow = null;
const store = new Store();

app.whenReady().then(() => {
  mainWindow = createWindow(store);
  setupTray(mainWindow, app, store);
  setupIPC(mainWindow, store, app);
  setupUpdater(mainWindow);

  // Apply auto-launch preference (packaged builds only — dev builds use the
  // bare Electron binary as exe path, which would register the wrong entry)
  if (app.isPackaged) {
    const settings = store.get('settings');
    app.setLoginItemSettings({
      openAtLogin: settings.startWithWindows !== false,
      path: app.getPath('exe')
    });
  }
});

app.on('second-instance', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

// Keep running in tray when all windows are closed
app.on('window-all-closed', () => {
  // Intentionally empty — prevents the default quit so the tray icon stays alive
});
