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

// A saved windowSize larger than the work area of the display the window
// opens on is cut down to that work area, and the position is moved just far
// enough for the whole window to sit inside it (taskbar respected). Data files
// written while F11 fullscreen saved the display size hold such a value
// (F-1, QA 2026-10-05). A size that fits is left alone, and so is its position.
// The store is not rewritten here; the next move or resize saves real bounds.
function fitToWorkArea(size, pos, wa) {
  const width = Math.min(size.width, wa.width);
  const height = Math.min(size.height, wa.height);
  if (width === size.width && height === size.height) return { size, pos };
  const x = Math.min(Math.max(pos.x, wa.x), wa.x + wa.width - width);
  const y = Math.min(Math.max(pos.y, wa.y), wa.y + wa.height - height);
  return { size: { width, height }, pos: { x, y } };
}

function createWindow(store) {
  const settings = store.get('settings');
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  const defaultWidth = 424;
  const defaultHeight = 300;

  const savedSize = settings.windowSize || { width: defaultWidth, height: defaultHeight };
  const savedPos = settings.windowPosition;
  const visiblePos = savedPos && visiblePosition(savedPos, savedSize);
  const openPos = visiblePos || {
    x: sw - savedSize.width - 20,
    y: sh - savedSize.height - 20
  };
  // The display the window opens on: the one it overlaps most when its saved
  // position is used, the primary display when the default position is used.
  const display = visiblePos
    ? screen.getDisplayMatching({ ...visiblePos, ...savedSize })
    : screen.getPrimaryDisplay();
  const { size, pos } = fitToWorkArea(savedSize, openPos, display.workArea);

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

  // Debounce size saves — same reason
  let resizeTimer = null;
  win.on('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (win.isDestroyed()) return;
      const [width, height] = win.getSize();
      const s = store.get('settings');
      store.set('settings', { ...s, windowSize: { width, height } });
    }, 400);
  });

  // Open DevTools in dev mode only
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

module.exports = { createWindow };
