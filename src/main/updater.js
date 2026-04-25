const { autoUpdater } = require('electron-updater');
const { app, ipcMain } = require('electron');

// Lazy-imported on first use to avoid the tray.js ↔ updater.js circular
// require: tray.js needs `checkForUpdates` from this module to wire the
// "Check for Updates" menu item, and we need `setUpdateAvailable` from
// tray.js to flip the icon. Top-level requires would resolve one of them
// to `undefined`. Indirecting through a function keeps both modules'
// exports populated by the time the call actually fires.
function setTrayUpdateAvailable(flag) {
  try {
    require('./tray').setUpdateAvailable(flag);
  } catch { /* noop — tray module unavailable in tests / abnormal startup */ }
}

let _win = null;

// Guard: only send if the window is still alive
function send(channel, ...args) {
  if (_win && !_win.isDestroyed() && _win.webContents && !_win.webContents.isDestroyed()) {
    _win.webContents.send(channel, ...args);
  }
}

function setupUpdater(win) {
  _win = win;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('checking-for-update', () => {
    send('update-checking');
  });

  autoUpdater.on('update-available', (info) => {
    send('update-available', { version: info.version });
    // UX Review §7: surface update state via the tray icon. Indicator
    // stays on until the user dismisses the banner, the update is
    // installed, or a subsequent check reports up-to-date / errored.
    setTrayUpdateAvailable(true);
  });

  autoUpdater.on('update-not-available', () => {
    send('update-not-available');
    setTrayUpdateAvailable(false);
  });

  autoUpdater.on('download-progress', (progress) => {
    send('update-progress', Math.floor(progress.percent));
  });

  autoUpdater.on('update-downloaded', () => {
    send('update-ready');
    // Keep the tray indicator on through "ready" — the user still
    // needs to act (INSTALL NOW). Cleared when they trigger install
    // (handler below) or dismiss the banner (ipc 'dismiss-update').
  });

  autoUpdater.on('error', (err) => {
    send('update-error', err.message);
    setTrayUpdateAvailable(false);
  });

  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
    } catch (err) {
      send('update-error', err.message);
    }
  });

  // Renderer pushes this when the user clicks the banner's ✕ to dismiss
  // it without acting. Mirroring the dismissal in the tray prevents a
  // stale "update available" dot from sitting in the tray after the
  // user has explicitly waved the notification away.
  ipcMain.handle('dismiss-update', () => {
    setTrayUpdateAvailable(false);
  });

  // Silent install: no installer UI shown, app restarts automatically
  ipcMain.handle('install-update', () => {
    setTrayUpdateAvailable(false);
    autoUpdater.quitAndInstall(true, true);
  });

  // Auto-check 5 seconds after launch (packaged only)
  if (app.isPackaged) {
    setTimeout(() => checkForUpdates(), 5000);
  }
}

function checkForUpdates() {
  if (!app.isPackaged) {
    // In dev mode just send "up to date"
    send('update-not-available');
    return;
  }
  autoUpdater.checkForUpdates().catch((err) => {
    send('update-error', err.message);
  });
}

module.exports = { setupUpdater, checkForUpdates };
