'use strict';
const { contextBridge, ipcRenderer, webUtils } = require('electron');
const version = process.argv.find(a => a.startsWith('--app-version='))?.slice('--app-version='.length) ?? '';

// Allowlists — only these channels can be used from the renderer.
// Any call outside these sets is rejected before it reaches the main process.
const INVOKE_CHANNELS = new Set([
  'get-apps',
  'save-apps',
  'get-settings',
  'save-settings',
  'launch-app',
  'get-installed-apps',
  'add-app-from-appid',
  'add-app-dialog',
  'add-app-from-path',
  'resize-window',
  'set-auto-launch',
  'check-update',
  'show-window',
  'hide-window',
  'close-window',
  'toggle-fullscreen',
  'download-update',
  'install-update',
]);

const ON_CHANNELS = new Set([
  'update-checking',
  'update-available',
  'update-progress',
  'update-ready',
  'update-not-available',
  'update-error',
  'store-save-error',
]);

contextBridge.exposeInMainWorld('api', {
  /** Two-way IPC: invoke a main-process handler and await the result. */
  invoke(channel, ...args) {
    if (!INVOKE_CHANNELS.has(channel)) {
      throw new Error(`Blocked IPC channel: ${channel}`);
    }
    return ipcRenderer.invoke(channel, ...args);
  },

  /** One-way IPC: subscribe to a main-process event. Returns an unsubscribe function. */
  on(channel, fn) {
    if (!ON_CHANNELS.has(channel)) {
      throw new Error(`Blocked IPC channel: ${channel}`);
    }
    // Strip the internal Electron event object so callers receive plain arguments.
    const wrapper = (_event, ...args) => fn(...args);
    ipcRenderer.on(channel, wrapper);
    return () => ipcRenderer.removeListener(channel, wrapper);
  },

  /** Resolve a File object to its filesystem path (drag-and-drop). */
  getPathForFile(file) {
    return webUtils.getPathForFile(file);
  },

  /** App version string from package.json, injected at preload time. */
  version,
});
