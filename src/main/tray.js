const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { checkForUpdates } = require('./updater');

let tray = null;
// Cached icon variants — built once at setupTray() and reused by every
// state swap. Keeping references avoids re-decoding icon.png and
// re-running the bitmap stamp on each update event.
let iconDefault = null;
let iconUpdate = null;
let updateAvailable = false;

// Compose an "update available" tray-icon variant from the base icon
// bitmap. The base icon is loaded, downsized to 16×16, and a small
// magenta dot is stamped into the bottom-right corner — matching the
// renderer's --accent-m (used elsewhere for edit-mode and update banners).
//
// Per UX Review 2026-04-25 §7: "the icon can convey live state — here
// that's update available." We compose at runtime via nativeImage to
// avoid checking in a second binary asset that would have to be kept
// in lockstep with icon.png on every future logo refresh.
function composeUpdateIcon(baseImage) {
  const bm = Buffer.from(baseImage.toBitmap()); // copy: don't mutate the cached default
  const { width: W, height: H } = baseImage.getSize();
  // Buffer is BGRA (Electron's native bitmap order on Windows).
  // Dot: ~31% of the icon width, anchored in the corner with a 1 px gap.
  const dotR = Math.max(2, Math.round(W * 0.22));
  const cx = W - dotR - 1;
  const cy = H - dotR - 1;
  // Magenta accent (matches --accent-m #ff00aa). Anti-aliased single-pixel
  // edge so the dot doesn't look stair-stepped at 16 px.
  const R = 0xff, G = 0x00, B = 0xaa;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx, dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const i = (y * W + x) * 4;
      if (d <= dotR) {
        bm[i + 0] = B; bm[i + 1] = G; bm[i + 2] = R; bm[i + 3] = 0xff;
      } else if (d <= dotR + 1) {
        const t = dotR + 1 - d;
        bm[i + 0] = Math.round(bm[i + 0] * (1 - t) + B * t);
        bm[i + 1] = Math.round(bm[i + 1] * (1 - t) + G * t);
        bm[i + 2] = Math.round(bm[i + 2] * (1 - t) + R * t);
        bm[i + 3] = Math.max(bm[i + 3], Math.round(0xff * t));
      }
    }
  }
  return nativeImage.createFromBitmap(bm, { width: W, height: H });
}

// Public: flip the tray to the update-available variant (or back).
// Called from updater.js when electron-updater fires update-available
// (and again on update-not-available / update-error / install).
function setUpdateAvailable(flag) {
  if (!tray) return;
  const next = !!flag;
  if (next === updateAvailable) return;
  updateAvailable = next;
  tray.setImage(updateAvailable ? iconUpdate : iconDefault);
  tray.setToolTip(updateAvailable
    ? 'QuickLauncher — Update available'
    : 'QuickLauncher');
}

// Per UX Review 2026-04-25 §7 / Important I5:
// "Reorder and expand the tray menu" to surface the 3–5 most common
// actions plus Settings and Quit. Spec lists the exact items in order:
//   Show/Hide, Settings…, Start with Windows, Random theme on startup,
//   ─, Check for Updates, ─, Quit QuickLauncher.
// Quit moves to the bottom (was top) — desktop convention places
// destructive actions last.
function setupTray(win, electronApp, store) {
  const iconPath = path.join(__dirname, '../../icon.png');
  iconDefault = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  iconUpdate = composeUpdateIcon(iconDefault);

  tray = new Tray(iconDefault);
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

module.exports = { setupTray, setUpdateAvailable };
