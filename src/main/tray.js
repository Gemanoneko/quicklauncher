const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { sendToBottom } = require('./window');
const { checkForUpdates } = require('./updater');

let tray = null;

function setupTray(win, electronApp, store) {
  const iconPath = path.join(__dirname, '../../icon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

  tray = new Tray(icon);
  tray.setToolTip('QuickLauncher');

  const buildMenu = () => Menu.buildFromTemplate([
    {
      label: 'Quit QuickLauncher',
      click: () => {
        electronApp.exit(0);
      }
    },
    { type: 'separator' },
    {
      label: 'Show / Hide',
      click: () => {
        if (win.isVisible()) {
          win.hide();
        } else {
          win.show();
          sendToBottom(win);
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: () => checkForUpdates()
    }
  ]);

  tray.setContextMenu(buildMenu());

  tray.on('double-click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      sendToBottom(win);
    }
  });
}

module.exports = { setupTray };
