const { ipcMain, dialog, shell, app } = require('electron');
const path = require('path');
const { sendToBottom } = require('./window');

function setupIPC(win, store, electronApp) {

  ipcMain.handle('get-apps', () => store.get('apps'));

  ipcMain.handle('save-apps', (_, apps) => {
    store.set('apps', apps);
  });

  ipcMain.handle('get-settings', () => store.get('settings'));

  ipcMain.handle('save-settings', (_, settings) => {
    store.set('settings', settings);
  });

  ipcMain.handle('launch-app', (_, filePath) => {
    shell.openPath(filePath);
    // Give the launched app time to take focus, then push launcher back down
    setTimeout(() => sendToBottom(win), 500);
  });

  ipcMain.handle('add-app-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Add Application',
      filters: [
        { name: 'Applications & Shortcuts', extensions: ['exe', 'lnk'] }
      ],
      properties: ['openFile']
    });
    if (canceled || !filePaths.length) return null;
    return buildAppEntry(filePaths[0]);
  });

  ipcMain.handle('add-app-from-path', async (_, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.exe' && ext !== '.lnk') return null;
    return buildAppEntry(filePath);
  });

  ipcMain.handle('resize-window', (_, { width, height }) => {
    win.setContentSize(Math.max(width, 200), Math.max(height, 150));
    sendToBottom(win);
  });

  ipcMain.handle('set-auto-launch', (_, enabled) => {
    electronApp.setLoginItemSettings({
      openAtLogin: enabled,
      path: electronApp.getPath('exe')
    });
  });

  ipcMain.handle('check-update', () => {
    win.webContents.send('trigger-update-check');
  });

  ipcMain.handle('show-window', () => win.show());
  ipcMain.handle('hide-window', () => win.hide());
}

async function buildAppEntry(filePath) {
  const { app } = require('electron');
  const name = path.basename(filePath, path.extname(filePath));
  try {
    const icon = await app.getFileIcon(filePath, { size: 'large' });
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      path: filePath,
      iconDataUrl: icon.toDataURL()
    };
  } catch {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      path: filePath,
      iconDataUrl: ''
    };
  }
}

module.exports = { setupIPC };
