const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

function setupUpdater(win) {
  // Only run updater in packaged app
  if (!require('electron').app.isPackaged) return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('update-available', (info) => {
    win.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes
    });
  });

  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update-not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    win.webContents.send('update-progress', Math.floor(progress.percent));
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-ready');
  });

  autoUpdater.on('error', (err) => {
    win.webContents.send('update-error', err.message);
  });

  // Check for updates 3 seconds after launch (non-blocking)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 3000);

  // Expose download trigger via IPC
  const { ipcMain } = require('electron');
  ipcMain.handle('download-update', () => autoUpdater.downloadUpdate());
  ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall(false, true);
  });
}

module.exports = { setupUpdater };
