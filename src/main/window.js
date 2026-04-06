const { BrowserWindow, screen } = require('electron');
const path = require('path');

function createWindow(store) {
  const settings = store.get('settings');
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  const defaultWidth = 424;
  const defaultHeight = 300;

  const size = settings.windowSize || { width: defaultWidth, height: defaultHeight };
  const pos = settings.windowPosition || {
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
      sandbox: false,          // preload needs require() to load package.json for version
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
