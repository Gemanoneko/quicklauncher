'use strict';
// Preload for the Manager window. Its own allowlist: the Manager can manage
// regions and global settings; it cannot save a region's items directly.
// The main process also checks that every manager:* call comes from the
// Manager's own webContents.
const { contextBridge, ipcRenderer } = require('electron');
const version = process.argv.find((a) => a.startsWith('--app-version='))?.slice('--app-version='.length) ?? '';

const INVOKE_CHANNELS = new Set([
  'renderer-ready',
  'get-valid-themes',
  'get-settings',
  'save-settings',
  'set-auto-launch',
  'apply-global-hotkey',
  'get-global-hotkey-status',
  'check-update',
  'get-update-state',
  'download-update',
  'install-update',
  'get-installed-apps',
  'manager:state',
  'manager:create-region',
  'manager:new-region-menu',
  'manager:update-region',
  'manager:delete-region',
  'manager:set-match-all',
  'manager:set-shared-theme',
  'manager:add-installed',
  'manager:add-file',
  // Moved shortcuts: open the store folder, move all back, a file without a tile.
  'manager:open-store',
  'manager:move-all-back',
  'manager:orphan',
  'manager:close',
  // Self-test operations; refused by the main process unless it runs with --ql-test-hooks.
  'manager:test',
]);

const ON_CHANNELS = new Set([
  'manager:changed',
  'manager:update-state',
  'manager:created',
  'manager:show-view',
  'settings-changed-externally',
]);

contextBridge.exposeInMainWorld('api', {
  invoke(channel, ...args) {
    if (!INVOKE_CHANNELS.has(channel)) throw new Error(`Blocked IPC channel: ${channel}`);
    return ipcRenderer.invoke(channel, ...args);
  },
  on(channel, fn) {
    if (!ON_CHANNELS.has(channel)) throw new Error(`Blocked IPC channel: ${channel}`);
    const wrapper = (_event, ...args) => fn(...args);
    ipcRenderer.on(channel, wrapper);
    return () => ipcRenderer.removeListener(channel, wrapper);
  },
  version,
});
