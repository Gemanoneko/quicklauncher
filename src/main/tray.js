const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { checkForUpdates } = require('./updater');

let tray = null;

// Per UX Review 2026-04-25 §7 / Important I5:
// "Reorder and expand the tray menu" to surface the 3–5 most common
// actions plus Settings and Quit. Spec lists the exact items in order:
//   Show/Hide, Settings…, Start with Windows, Random theme on startup,
//   ─, Check for Updates, ─, Quit QuickLauncher.
// Quit moves to the bottom (was top) — desktop convention places
// destructive actions last.
function setupTray(win, electronApp, store) {
  const iconPath = path.join(__dirname, '../../icon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

  tray = new Tray(icon);
  tray.setToolTip('QuickLauncher');

  // Notify the renderer that settings changed in the main process (e.g. a
  // tray checkbox toggle). The renderer rehydrates its local `settings`
  // object and reflects the new value in any open Settings overlay so the
  // checkbox state never drifts from the store.
  const notifyRendererSettingsChanged = () => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('settings-changed-externally');
    }
  };

  const showOrHide = () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  };

  const buildMenu = () => {
    const settings = store.get('settings') || {};
    const startWithWindows = settings.startWithWindows !== false;
    const randomTheme       = settings.randomTheme !== false;

    return Menu.buildFromTemplate([
      {
        label: 'Show / Hide',
        click: showOrHide
      },
      {
        label: 'Settings…',
        click: () => {
          // Surface the existing in-renderer Settings overlay. Showing
          // the window first guarantees the overlay is actually visible
          // — without this, clicking "Settings…" while hidden would
          // toggle the overlay class on a hidden window.
          if (win && !win.isDestroyed()) {
            if (win.isMinimized()) win.restore();
            if (!win.isVisible()) win.show();
            win.focus();
            win.webContents.send('tray-open-settings');
          }
        }
      },
      {
        label: 'Start with Windows',
        type: 'checkbox',
        checked: startWithWindows,
        click: (item) => {
          const next = !!item.checked;
          const current = store.get('settings') || {};
          store.set('settings', { ...current, startWithWindows: next });
          // Mirror the renderer's flow in `set-auto-launch`: only touch
          // the Run-key in packaged builds, and only when the registered
          // state actually differs.
          if (electronApp.isPackaged) {
            const cur = electronApp.getLoginItemSettings();
            if (cur.openAtLogin !== next) {
              electronApp.setLoginItemSettings({
                openAtLogin: next,
                path: electronApp.getPath('exe')
              });
            }
          }
          notifyRendererSettingsChanged();
          tray.setContextMenu(buildMenu());
        }
      },
      {
        label: 'Random theme on startup',
        type: 'checkbox',
        checked: randomTheme,
        click: (item) => {
          const next = !!item.checked;
          const current = store.get('settings') || {};
          store.set('settings', { ...current, randomTheme: next });
          notifyRendererSettingsChanged();
          tray.setContextMenu(buildMenu());
        }
      },
      { type: 'separator' },
      {
        label: 'Check for Updates',
        click: () => checkForUpdates()
      },
      { type: 'separator' },
      {
        label: 'Quit QuickLauncher',
        click: () => {
          electronApp.exit(0);
        }
      }
    ]);
  };

  tray.setContextMenu(buildMenu());

  tray.on('double-click', showOrHide);
}

module.exports = { setupTray };
