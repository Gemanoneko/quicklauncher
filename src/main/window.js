const { BrowserWindow, screen } = require('electron');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');

let sendToBottomScriptPath = null;

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
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
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

  // Save position on move
  win.on('moved', () => {
    const [x, y] = win.getPosition();
    const s = store.get('settings');
    store.set('settings', { ...s, windowPosition: { x, y } });
  });

  // Save size on resize and re-anchor to desktop
  win.on('resize', () => {
    const [width, height] = win.getSize();
    const s = store.get('settings');
    store.set('settings', { ...s, windowSize: { width, height } });
    sendToBottom(win);
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

    const script = `Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class WinPos {
    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
}
'@
$hwnd = [IntPtr][long]${hwnd.toString()}
[WinPos]::SetWindowPos($hwnd, [IntPtr]1, 0, 0, 0, 0, 0x0013)
`;

    if (!sendToBottomScriptPath) {
      sendToBottomScriptPath = path.join(os.tmpdir(), 'ql-bottom.ps1');
    }
    fs.writeFileSync(sendToBottomScriptPath, script, 'utf8');

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
