'use strict';
// Picker icons, processed off the Electron main thread.
//
// Decoding, trimming and re-encoding the picker's ~570 icons with nativeImage
// is 2–4 s of synchronous work. On the main thread it froze the tray, the
// global hotkey, IPC and window dragging on every scan. Node worker threads
// can't load Electron modules and the utility process has no nativeImage, so
// the work runs in a hidden helper renderer with the same nativeImage codecs
// and the same encodeIcon() — the data URLs are byte-identical. The helper
// lives for one batch only. If it can't start, dies or stalls, the icons it
// hasn't returned are done in-process in short slices (same output; the main
// thread still yields between slices).
const { BrowserWindow } = require('electron');
const path = require('path');
const { encodeIcon } = require('./icon-trim');

const CHUNK = 16;        // icons per message: each IPC copy stays around 1 MB
const IN_FLIGHT = 2;     // chunks queued ahead so the helper never waits on us
const STALL_MS = 20000;  // no reply for this long → finish in-process
const SLICE_MS = 12;     // in-process fallback: yield to the event loop this often

function encodeSliced(idxs, jobs, urls) {
  return new Promise((resolve) => {
    let k = 0;
    const step = () => {
      const t0 = Date.now();
      while (k < idxs.length && Date.now() - t0 < SLICE_MS) {
        const i = idxs[k++];
        urls[i] = encodeIcon(jobs[i]);
      }
      if (k < idxs.length) setImmediate(step);
      else resolve();
    };
    step();
  });
}

// jobs: array of encodeIcon() jobs (or null). Resolves to a same-length array
// of data URLs ('' where there was nothing to encode or it failed). Never rejects.
function encodeIcons(jobs) {
  const urls = new Array(jobs.length).fill('');
  const todo = [];
  jobs.forEach((j, i) => { if (j) todo.push(i); });
  if (todo.length === 0) return Promise.resolve(urls);

  return new Promise((resolve) => {
    let helper = null;
    let next = 0;               // next position in `todo` to send
    let chunkId = 0;
    const pending = new Map();  // chunk id → indices sent, not yet returned
    let stallTimer = null;
    let settled = false;
    let failed = false;

    // Deferred a tick: finish() can run inside the helper's own IPC callback.
    const destroyHelper = () => {
      const h = helper;
      helper = null;
      if (h) setImmediate(() => { if (!h.isDestroyed()) h.destroy(); });
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(stallTimer);
      destroyHelper();
      resolve(urls);
    };
    const fallback = (why) => {
      if (failed || settled) return;
      failed = true;
      clearTimeout(stallTimer);
      console.warn(`[icons] helper unavailable (${why}); encoding the rest in-process`);
      const rest = [];
      for (const idxs of pending.values()) rest.push(...idxs);
      pending.clear();
      rest.push(...todo.slice(next));
      next = todo.length;
      destroyHelper();
      encodeSliced(rest, jobs, urls).then(finish);
    };
    const armStall = () => {
      clearTimeout(stallTimer);
      stallTimer = setTimeout(() => fallback(`no reply in ${STALL_MS} ms`), STALL_MS);
    };
    const sendMore = () => {
      while (!failed && pending.size < IN_FLIGHT && next < todo.length) {
        const idxs = todo.slice(next, next + CHUNK);
        next += idxs.length;
        const id = ++chunkId;
        pending.set(id, idxs);
        helper.webContents.send('icon-jobs', { id, jobs: idxs.map(i => jobs[i]) });
      }
      if (!failed && pending.size === 0 && next >= todo.length) finish();
    };

    try {
      helper = new BrowserWindow({
        show: false,
        width: 64,
        height: 64,
        focusable: false,
        skipTaskbar: true,
        webPreferences: {
          // Not sandboxed: nativeImage.toBitmap(), which trimIcon needs,
          // crashes a sandboxed renderer. The page is an empty local file
          // with a deny-all CSP, context isolation is on, and the page has no
          // Node access — only the preload answers the main process.
          sandbox: false,
          contextIsolation: true,
          nodeIntegration: false,
          backgroundThrottling: false,
          spellcheck: false,
          preload: path.join(__dirname, 'icon-worker-preload.js'),
        },
      });
    } catch (e) {
      fallback(`create failed: ${e && e.message}`);
      return;
    }
    const wc = helper.webContents;
    wc.setWindowOpenHandler(() => ({ action: 'deny' }));
    wc.on('will-navigate', (e) => e.preventDefault());
    wc.on('render-process-gone', (_e, d) => fallback(`helper ${d && d.reason}`));
    wc.ipc.once('icon-worker-ready', () => { armStall(); sendMore(); });
    wc.ipc.on('icon-results', (_e, msg) => {
      if (failed || settled || !msg || !pending.has(msg.id)) return;
      const idxs = pending.get(msg.id);
      pending.delete(msg.id);
      const got = Array.isArray(msg.urls) ? msg.urls : [];
      idxs.forEach((i, k) => { urls[i] = typeof got[k] === 'string' ? got[k] : ''; });
      armStall();
      sendMore();
    });
    armStall(); // also covers a helper that never becomes ready
    helper.loadFile(path.join(__dirname, 'icon-worker.html'))
      .catch((e) => fallback(`load failed: ${e && e.message}`));
  });
}

module.exports = { encodeIcons };
