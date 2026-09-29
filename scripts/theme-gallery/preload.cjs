'use strict';
// Stub preload for the theme gallery. Same shape as src/main/preload.js
// (window.api.invoke / on / getPathForFile / version) and the same channel
// allowlists, which the harness parses out of the real preload's source and hands
// over here. Every invoke goes to the harness's mock handler (main.cjs), which
// counts it and answers from mock data. Nothing reaches QuickLaunch's main process:
// it is never loaded.
const { contextBridge, ipcRenderer } = require('electron');

const contract = ipcRenderer.sendSync('qlg:contract');
const INVOKE = new Set(contract.invoke);
const ON = new Set(contract.on);

contextBridge.exposeInMainWorld('api', {
  invoke(channel, ...args) {
    if (!INVOKE.has(channel)) throw new Error(`Blocked IPC channel: ${channel}`);
    return ipcRenderer.invoke('qlg:invoke', channel, args);
  },
  on(channel, fn) {
    if (!ON.has(channel)) throw new Error(`Blocked IPC channel: ${channel}`);
    void fn; // the harness never pushes events
    return () => {};
  },
  getPathForFile() { return ''; },
  version: contract.version,
});
