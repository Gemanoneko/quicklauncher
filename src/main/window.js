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

function createWindow(store) {
  const settings = store.get('settings');
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  const defaultWidth = 424;
  const defaultHeight = 300;

  const size = settings.windowSize || { width: defaultWidth, height: defaultHeight };
  const savedPos = settings.windowPosition;
  const pos = (savedPos && visiblePosition(savedPos, size)) || {
    x: sw - size.width - 20,
    y: sh - size.height - 20
  };

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

  // Debounce position saves — fired on every pixel during drag without this
  let moveTimer = null;
  win.on('moved', () => {
    if (win.isFullScreen()) return;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      const [x, y] = win.getPosition();
      const s = store.get('settings');
      store.set('settings', { ...s, windowPosition: { x, y } });
    }, 400);
  });

  // Debounce size saves — same reason
  let resizeTimer = null;
  win.on('resize', () => {
    if (win.isFullScreen()) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
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
