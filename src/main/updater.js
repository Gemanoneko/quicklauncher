const { autoUpdater } = require('electron-updater');
const { app, ipcMain } = require('electron');

let _win = null;

function setupUpdater(win) {
  _win = win;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('checking-for-update', () => {
    _win.webContents.send('update-checking');
  });

  autoUpdater.on('update-available', (info) => {
    _win.webContents.send('update-available', { version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    _win.webContents.send('update-not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    _win.webContents.send('update-progress', Math.floor(progress.percent));
  });

  autoUpdater.on('update-downloaded', () => {
    _win.webContents.send('update-ready');
  });

  autoUpdater.on('error', (err) => {
    _win.webContents.send('update-error', err.message);
  });

  ipcMain.handle('download-update', () => autoUpdater.downloadUpdate());

  // Silent install: no installer UI shown, app restarts automatically
  ipcMain.handle('install-update', () => {
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
    if (_win) _win.webContents.send('update-not-available');
    return;
  }
  autoUpdater.checkForUpdates().catch((err) => {
    if (_win) _win.webContents.send('update-error', err.message);
  });
}

module.exports = { setupUpdater, checkForUpdates };
