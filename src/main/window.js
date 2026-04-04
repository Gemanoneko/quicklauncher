const { BrowserWindow, screen } = require('electron');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');

let sendToBottomScriptPath = null;
let sendToBottomLastHwnd = null; // cache: only rewrite the script when hwnd changes

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
    skipTaskbar: true,
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
    sendToBottom(win);
  });

  // Re-send to bottom after losing focus so it stays behind other windows
  win.on('blur', () => {
    sendToBottom(win);
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
      sendToBottom(win);
    }, 400);
  });

  // Open DevTools in dev mode only
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

let sendToBottomTimer = null;

// Debounced: coalesces rapid blur/resize/launch calls into a single PS invocation.
// Without debouncing, every window-blur event spawns a PowerShell process that
// compiles C# — typically 1-2 s each, accumulating when switching windows rapidly.
function sendToBottom(win) {
  if (process.platform !== 'win32') return;
  clearTimeout(sendToBottomTimer);
  sendToBottomTimer = setTimeout(() => {
    sendToBottomTimer = null;
    _sendToBottomNow(win);
  }, 200);
}

function _sendToBottomNow(win) {
  try {
    const hwndBuf = win.getNativeWindowHandle();
    // On 64-bit Windows the HWND buffer is 8 bytes
    const hwnd = hwndBuf.length >= 8
      ? hwndBuf.readBigUInt64LE(0)
      : BigInt(hwndBuf.readUInt32LE(0));
    const hwndStr = hwnd.toString();

    if (!sendToBottomScriptPath) {
      sendToBottomScriptPath = path.join(os.tmpdir(), 'ql-bottom.ps1');
    }

    // The HWND is stable for the window's lifetime; only rewrite when it changes.
    if (sendToBottomLastHwnd !== hwndStr) {
      const script = `Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class WinPos {
    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
}
'@
$hwnd = [IntPtr][long]${hwndStr}
[WinPos]::SetWindowPos($hwnd, [IntPtr]1, 0, 0, 0, 0, 0x0013)
`;
      fs.writeFileSync(sendToBottomScriptPath, script, 'utf8');
      sendToBottomLastHwnd = hwndStr;
    }

    execFile('powershell.exe', [
      '-ExecutionPolicy', 'Bypass',
      '-NonInteractive',
      '-WindowStyle', 'Hidden',
      '-File', sendToBottomScriptPath
    ], { windowsHide: true, stdio: 'pipe' }, () => {});
  } catch {
    // Non-critical — silently ignore
  }
}

module.exports = { createWindow, sendToBottom };
