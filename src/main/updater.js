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

// Returns the webContents that shows update banners: the primary region's
// page, which changes when the primary region is deleted or rebuilt.
let _target = () => null;
let _manager = () => null;
let state = { offer: 'none', version: '', percent: 0, checking: false };
let offerDismissed = false;
function getUpdateState() { return { ...state }; }
function publish(channel, arg) {
  const downloading = state.offer === 'downloading';
  switch (channel) {
    case 'update-checking': state.checking = true; break;
    case 'update-available': offerDismissed = false; state = { offer: 'available', version: String(arg && arg.version || ''), percent: 0, checking: false }; break;
    case 'update-progress': state.offer = 'downloading'; state.percent = Math.max(0, Math.min(100, Number(arg) || 0)); state.checking = false; break;
    case 'update-ready': state.offer = 'ready'; state.checking = false; break;
    case 'update-not-available': state = { offer: 'none', version: '', percent: 0, checking: false }; break;
    case 'update-error': if (downloading) state.offer = 'available'; state.checking = false; break;
  }
  send(channel, arg);
  try { require('./tray').refreshTrayMenu(); } catch { /* no tray in isolated tests */ }
  const wc = _manager();
  if (wc && !wc.isDestroyed()) wc.send('manager:update-state', { state: getUpdateState(), channel, arg });
}
// How many times the tray dot was cleared from a banner ✕ (read by the self-test through
// --ql-test-hooks: a notice ending must never count here; fix-pass addendum C5).
let dismissals = 0;

// Guard: only send if the page is still alive
function send(channel, ...args) {
  const wc = _target();
  if (wc && !wc.isDestroyed()) wc.send(channel, ...args);
}

function setupUpdater(getTarget, getManager) {
  _manager = typeof getManager === 'function' ? getManager : () => null;
  ipcMain.handle('get-update-state', () => getUpdateState());
  _target = typeof getTarget === 'function' ? getTarget : () => null;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('checking-for-update', () => {
    publish('update-checking');
  });

  autoUpdater.on('update-available', (info) => {
    publish('update-available', { version: info.version });
    // UX Review §7: surface update state via the tray icon. Indicator
    // stays on until the user dismisses the banner, the update is
    // installed, or a subsequent check reports up-to-date / errored.
    setTrayUpdateAvailable(true);
  });

  autoUpdater.on('update-not-available', () => {
    publish('update-not-available');
    setTrayUpdateAvailable(false);
  });

  autoUpdater.on('download-progress', (progress) => {
    publish('update-progress', Math.floor(progress.percent));
  });

  autoUpdater.on('update-downloaded', () => {
    publish('update-ready');
    // Keep the tray indicator on through "ready" — the user still
    // needs to act (INSTALL NOW). Cleared when they trigger install
    // (handler below) or dismiss the banner (ipc 'dismiss-update').
  });

  autoUpdater.on('error', (err) => {
    publish('update-error', err.message);
    setTrayUpdateAvailable(false);
  });

  ipcMain.handle('download-update', async () => {
    if (state.offer !== 'available') return;
    publish('update-progress', 0);
    try {
      await autoUpdater.downloadUpdate();
    } catch (err) {
      publish('update-error', err.message);
    }
  });

  // Renderer pushes this when the user clicks the banner's ✕ to dismiss
  // it without acting. Mirroring the dismissal in the tray prevents a
  // stale "update available" dot from sitting in the tray after the
  // user has explicitly waved the notification away.
  ipcMain.handle('dismiss-update', () => {
    dismissals += 1;
    offerDismissed = true;
    setTrayUpdateAvailable(false);
  });

  // Silent install: no installer UI shown, app restarts automatically
  ipcMain.handle('install-update', () => {
    if (state.offer !== 'ready') return;
    state.offer = 'none';
    setTrayUpdateAvailable(false);
    autoUpdater.quitAndInstall(true, true);
  });

  // Auto-check 5 seconds after launch (packaged only). --ql-no-update-check
  // (runtime flag) skips it for local test builds, which have no update feed.
  if (app.isPackaged && !process.argv.includes('--ql-no-update-check')) {
    setTimeout(() => checkForUpdates(), 5000);
  }
}

function checkForUpdates() {
  if (state.checking || state.offer === 'downloading') return;
  publish('update-checking');
  if (!app.isPackaged) {
    // In dev mode just send "up to date"
    publish('update-not-available');
    return;
  }
  autoUpdater.checkForUpdates().catch((err) => {
    publish('update-error', err.message);
  });
}

// Replay only an undismissed offer to a ready primary with a banner slot.
// This does not create a new notification, change the dot, or restart a check.
function replayOffer(wc, layout) {
  if (offerDismissed || !['grid', 'column'].includes(layout) || !wc || wc.isDestroyed()) return false;
  if (state.offer === 'available' || state.offer === 'downloading') {
    wc.send('update-available', { version: state.version });
    if (state.offer === 'downloading') wc.send('update-progress', state.percent);
    return true;
  }
  if (state.offer === 'ready') { wc.send('update-ready'); return true; }
  return false;
}

module.exports = { setupUpdater, checkForUpdates, dismissals: () => dismissals, getUpdateState, publish, replayOffer };
