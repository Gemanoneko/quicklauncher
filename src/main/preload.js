'use strict';
const { contextBridge, ipcRenderer, webUtils } = require('electron');
const version = process.argv.find(a => a.startsWith('--app-version='))?.slice('--app-version='.length) ?? '';

// Allowlists — only these channels can be used from the renderer.
// Any call outside these sets is rejected before it reaches the main process.
const INVOKE_CHANNELS = new Set([
  'get-valid-themes',
  'get-apps',
  'save-apps',
  'get-settings',
  'save-settings',
  'launch-app',
  'get-installed-apps',
  'add-app-from-appid',
  'add-app-dialog',
  'add-app-from-path',
  'set-auto-launch',
  'check-update',
  'hide-window',
  'download-update',
  'install-update',
  'dismiss-update',
  'apply-global-hotkey',
  'get-global-hotkey-status',
  // Store delivery: the renderer is listening (queued store messages follow),
  // and it has adopted a merged state pushed via 'store-reloaded'.
  'renderer-ready',
  'store-reload-ack',
  // Region window (region.js): which region this page is, pointer and key
  // events the main process acts on, and the Manager it opens.
  'region:info',
  'region:pointer-down',
  'region:drag',
  'region:resize',
  'region:nudge',
  'region:menu',
  'region:tile-menu',
  'region:rename',
  'region:cycle',
  'region:open-manager',
]);

const ON_CHANNELS = new Set([
  'update-checking',
  'update-available',
  'update-progress',
  'update-ready',
  'update-not-available',
  'update-error',
  'store-save-error',
  'store-reloaded',
  'launch-error',
  // Settings changed in the main process (tray checkbox, Manager, theme of
  // this region changed elsewhere): the page re-reads its settings.
  'settings-changed-externally',
  // Region window: name/icon/active state, commands from the native region
  // and tile menus, items changed by the main process, back to view mode.
  'region:state',
  'region:command',
  'region:items-changed',
  'region:reset-view',
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
