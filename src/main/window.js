const { BrowserWindow, screen, app } = require('electron');
const path = require('path');

// Returns the saved position if at least 100×50px of the window overlaps any
// active display workArea; otherwise returns null so we fall back to the default.
function visiblePosition(pos, size) {
  return screen.getAllDisplays().some(d => {
    const wa = d.workArea;
    const ox = Math.min(pos.x + size.width,  wa.x + wa.width)  - Math.max(pos.x, wa.x);
    const oy = Math.min(pos.y + size.height, wa.y + wa.height) - Math.max(pos.y, wa.y);
    return ox >= 100 && oy >= 50;
  }) ? pos : null;
}

const DEFAULT_SIZE = { width: 424, height: 300 };

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// The store never validates windowSize / windowPosition. window.js only ever
// writes integers from getSize()/getPosition(), so anything else (null,
// strings, fractions, 0 or negative sizes, Infinity, missing keys) is treated
// as if nothing were saved. Electron ignores non-integer or string bounds, and
// screen.getDisplayMatching() throws on a null coordinate, which crashed
// startup (QA 2026-10-05, m-3).
function savedSize(v) {
  return isPlainObject(v) && Number.isInteger(v.width) && Number.isInteger(v.height)
    && v.width > 0 && v.height > 0 ? { width: v.width, height: v.height } : null;
}
function savedPosition(v) {
  return isPlainObject(v) && Number.isInteger(v.x) && Number.isInteger(v.y) ? { x: v.x, y: v.y } : null;
}

// Size and position the window opens with. A saved size that fits the work
// area of the display it opens on keeps its size and saved position (the
// position is used while at least 100x50 px of the window is on a display).
// A saved size wider or taller than that work area opens as a fresh install
// does: the default size at the default position (Sergei ruling 2026-10-05,
// option b). Files written while F11 fullscreen existed hold the display size
// (F-1). The store is not rewritten here; the next move or resize saves the
// real bounds.
function initialBounds(settings) {
  const primary = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = primary.workAreaSize;
  // Fresh-install position: bottom-right of the primary work area, 20 px in.
  const defaultPos = (size) => ({ x: sw - size.width - 20, y: sh - size.height - 20 });

  const size = savedSize(settings.windowSize) || DEFAULT_SIZE;
  const savedPos = savedPosition(settings.windowPosition);
  const visiblePos = savedPos && visiblePosition(savedPos, size);
  // The display the window opens on: the one it overlaps most when its saved
  // position is used, the primary display when the default position is used.
  const wa = (visiblePos ? screen.getDisplayMatching({ ...visiblePos, ...size }) : primary).workArea;
  if (size.width > wa.width || size.height > wa.height) {
    return { size: DEFAULT_SIZE, pos: defaultPos(DEFAULT_SIZE) };
  }
  return { size, pos: visiblePos || defaultPos(size) };
}

function createWindow(store) {
  const { size, pos } = initialBounds(store.get('settings'));

  const win = new BrowserWindow({
    width: size.width,
    height: size.height,
    minWidth: 180,
    minHeight: 150,
    x: pos.x,
    y: pos.y,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    skipTaskbar: false,
    resizable: true,
    alwaysOnTop: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      additionalArguments: [`--app-version=${app.getVersion()}`],
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  win.once('ready-to-show', () => {
    win.show();
  });

  // F11 does nothing (fullscreen removed, Sergei 2026-10-05). The app sets no
  // application menu, so Electron installs its default one, whose
  // View > Toggle Full Screen is bound to F11 on Windows (seen on Electron 32).
  // The renderer used to swallow F11; now this does, before the page and any
  // menu accelerator can see it.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11') event.preventDefault();
  });

  // Debounce position saves — fired on every pixel during drag without this.
  // The timer checks the window still exists: it can be destroyed before it fires.
  let moveTimer = null;
  win.on('moved', () => {
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      if (win.isDestroyed()) return;
      const [x, y] = win.getPosition();
      const s = store.get('settings');
      store.set('settings', { ...s, windowPosition: { x, y } });
    }, 400);
  });

  // Debounce size saves — same reason. The position is saved with the size:
  // a window that opened at the default position (oversized or off-screen
  // saved bounds) and is then resized without being moved would otherwise
  // keep the old saved position, and open there next time (QA 2026-10-05, m-2).
  let resizeTimer = null;
  win.on('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (win.isDestroyed()) return;
      const [width, height] = win.getSize();
      const [x, y] = win.getPosition();
      const s = store.get('settings');
      store.set('settings', { ...s, windowSize: { width, height }, windowPosition: { x, y } });
    }, 400);
  });

  // Open DevTools in dev mode only
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

module.exports = { createWindow };
