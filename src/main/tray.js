const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { checkForUpdates, getUpdateState } = require('./updater');
const { REGION_CAP } = require('./regions/model');

let tray = null;
// Cached icon variants — built once at setupTray() and reused by every
// state swap. Keeping references avoids re-decoding icon.png and
// re-running the bitmap stamp on each update event.
let iconDefault = null;
let iconUpdate = null;
let updateAvailable = false;
let rebuildMenu = null;

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

// Tray menu (regions spec 7.1), in order: Show / Hide, Regions…, New region ▸,
// Settings…, Start with Windows, Random theme on startup, ─, Check for
// Updates, ─, Quit QuickLauncher. Show / Hide and double-click act on all
// regions. Quit is the only quit path (no region has a close button) and
// ends the process at once, as before.
//   ctl: RegionController   mgr: Manager   quit: (reason) => void
function setupTray({ ctl, mgr, electronApp, store, quit }) {
  const iconPath = path.join(__dirname, '../../icon.png');
  iconDefault = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  // Defense against a missing / unreadable icon.png in a packaged build
  // (Senua review M3, 2026-04-25). createFromPath returns an empty image
  // on failure, which would feed an invalid bitmap into composeUpdateIcon
  // and then throw inside `new Tray()` — killing main-process bootstrap
  // with a confusing stack. Fail loud here, then degrade: no tray surface,
  // but the rest of the app (regions, hotkey, IPC) still comes up.
  // setUpdateAvailable already guards on `if (!tray) return`.
  if (iconDefault.isEmpty()) {
    console.error('[tray] icon.png is missing or unreadable at', iconPath, '— tray disabled');
    return;
  }
  iconUpdate = composeUpdateIcon(iconDefault);

  tray = new Tray(iconDefault);
  tray.setToolTip('QuickLauncher');

  const newRegion = (layout) => {
    const r = ctl.createRegion(layout);
    if (!r.ok) {
      // Refusal strings from the spec (cap, no room): one native box.
      const { dialog } = require('electron');
      dialog.showMessageBox({ type: 'info', title: 'QuickLauncher', message: r.error, buttons: ['OK'], noLink: true }).catch(() => {});
    }
  };

  const buildMenu = () => {
    const settings = store.get('settings') || {};
    const startWithWindows = settings.startWithWindows !== false;
    const randomTheme       = settings.randomTheme !== false;
    const atCap = ctl.regions().length >= REGION_CAP;

    return Menu.buildFromTemplate([
      { label: 'Show / Hide', click: () => ctl.toggleAll() },
      { label: 'Regions…', click: () => mgr.open('regions') },
      {
        label: 'New region',
        enabled: !atCap,
        // The layouts this build draws (spec 7.1); Fan and Ring arrive in M5.
        submenu: [['Grid', 'grid'], ['Column', 'column'], ['Row', 'row']]
          .map(([label, layout]) => ({ label, click: () => { newRegion(layout); rebuildMenu(); } })),
      },
      { label: 'Settings…', click: () => mgr.open('settings') },
      {
        label: 'Start with Windows',
        type: 'checkbox',
        checked: startWithWindows,
        click: (item) => {
          const next = !!item.checked;
          ctl.applySettingsPatch({ startWithWindows: next });
          // Mirror the Settings flow in `set-auto-launch`: only touch
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
          tray.setContextMenu(buildMenu());
        }
      },
      {
        label: 'Random theme on startup',
        type: 'checkbox',
        checked: randomTheme,
        click: (item) => {
          ctl.applySettingsPatch({ randomTheme: !!item.checked });
          tray.setContextMenu(buildMenu());
        }
      },
      { type: 'separator' },
      {
        label: (() => {
          const u = getUpdateState();
          return u.offer === 'available' ? `Update available — v${u.version}…`
            : u.offer === 'downloading' ? 'Update downloading…'
            : u.offer === 'ready' ? 'Update ready to install…' : 'Check for Updates';
        })(),
        click: () => {
          mgr.open('settings');
          const u = getUpdateState();
          if (u.offer === 'none' && !u.checking) checkForUpdates();
        },
      },
      { type: 'separator' },
      { label: 'Quit QuickLauncher', click: () => quit('tray') }
    ]);
  };

  tray.setContextMenu(buildMenu());
  rebuildMenu = () => tray.setContextMenu(buildMenu());

  tray.on('double-click', () => ctl.toggleAll());
}

// Rebuild the menu from the store (its checkboxes are read at build time) —
// used when settings change underneath it, e.g. a read-only store merged.
function refreshTrayMenu() {
  if (tray && rebuildMenu) rebuildMenu();
}

module.exports = { setupTray, setUpdateAvailable, refreshTrayMenu };
