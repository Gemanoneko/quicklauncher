'use strict';
// Preload of the hidden icon helper renderer (see icon-worker.js). The page
// is empty and nothing is exposed to it; this script only answers the main
// process: icon jobs in, data URLs out.
const { ipcRenderer } = require('electron');
const { encodeIcon } = require('./icon-trim');

ipcRenderer.on('icon-jobs', (_e, msg) => {
  const jobs = msg && Array.isArray(msg.jobs) ? msg.jobs : [];
  ipcRenderer.send('icon-results', { id: msg && msg.id, urls: jobs.map(encodeIcon) });
});
ipcRenderer.send('icon-worker-ready');
