'use strict';
const { contextBridge, ipcRenderer } = require('electron');

const ALLOWED = new Set(['clicked', 'close', 'pointerdown', 'input', 'input-focus', 'layout', 'beat']);

contextBridge.exposeInMainWorld('spike', {
  send: (channel, payload) => { if (ALLOWED.has(channel)) ipcRenderer.send(`spike:${channel}`, payload); },
  onStatus: (fn) => ipcRenderer.on('spike:status', (_e, text) => fn(String(text))),
});
