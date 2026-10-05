'use strict';
// Plain Node: node --test test/
// F-2 (Futaba, away window 2026-10-05): Chromium paints a region window and
// routes its input only after Electron's own show. Every Win32 show in
// region-host.js (the fallback show, Show all in either mode) must be followed
// by the window's showInactive(), and a hidden region must stay hidden.
// Checked on the real RegionHost with desktop-layer.js and the window replaced
// by recording fakes: no Win32, no Electron.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

let calls;
let hostOk;
const fakeLayer = {
  available: true,
  hex: (h) => `0x${Number(h).toString(16)}`,
  hwndOf: () => 0x1234,
  className: () => 'Progman',
  findHost: () => (hostOk ? { ok: true, host: 0x99, layout: 'test' } : { ok: false, reason: 'none', layout: 'none' }),
  attachToHost: () => { calls.push('win32:attach'); return { ok: true }; },
  detachToTopLevel: (_h, _r, { show }) => { calls.push(`win32:detach show=${show}`); return { ok: true }; },
  showTopLevelAtBottom: () => { calls.push('win32:showTopLevelAtBottom'); return true; },
  showNoActivate: () => { calls.push('win32:showNoActivate'); return true; },
  hide: () => { calls.push('win32:hide'); return true; },
  isWindow: () => true,
  parentOf: () => 0x99,
  hasDefView: () => true,
  isAboveDefView: () => ({ above: true, me: 0, defView: 1 }),
  releaseFromShell: () => true,
  describe: () => ({ alive: true }),
};
const realLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === './desktop-layer') return fakeLayer;
  return realLoad.call(this, request, parent, isMain);
};
delete require.cache[require.resolve('../../src/main/desktop/region-host')];
const { RegionHost } = require('../../src/main/desktop/region-host');
Module._load = realLoad;

function fakeWindow() {
  return {
    destroyed: false,
    isDestroyed() { return this.destroyed; },
    once() {},
    showInactive() { calls.push('electron:showInactive'); },
    destroy() { this.destroyed = true; },
  };
}
async function host({ killSwitch, hidden }) {
  calls = [];
  const h = new RegionHost({ createWindow: async () => fakeWindow(), screenRect: { left: 0, top: 0, right: 400, bottom: 300 }, killSwitch, hidden });
  await h.start();
  return h;
}

test('fallback (kill switch): the Win32 show is followed by Electron\'s showInactive', async () => {
  const h = await host({ killSwitch: true, hidden: false });
  assert.equal(h.mode, 'fallback');
  assert.deepEqual(calls, ['win32:detach show=true', 'electron:showInactive']);
});

test('fallback, hidden at start: no show of either kind', async () => {
  const h = await host({ killSwitch: true, hidden: true });
  assert.equal(h.mode, 'fallback');
  assert.deepEqual(calls, ['win32:detach show=false']);
});

test('fallback, Show all after a hidden start: showTopLevelAtBottom, then showInactive', async () => {
  const h = await host({ killSwitch: true, hidden: true });
  calls = [];
  h.setHidden(false);
  assert.deepEqual(calls, ['win32:showTopLevelAtBottom', 'electron:showInactive']);
});

test('fallback, Hide all: Win32 hide only, no show', async () => {
  const h = await host({ killSwitch: true, hidden: false });
  calls = [];
  h.setHidden(true);
  assert.deepEqual(calls, ['win32:hide']);
});

test('attached, hidden at start (a rebuild under Hide all): Show all shows it to Chromium too', async () => {
  hostOk = true;
  const h = await host({ killSwitch: false, hidden: true });
  assert.equal(h.mode, 'attached');
  assert.deepEqual(calls, ['win32:attach'], 'a hidden region is attached but not shown');
  calls = [];
  h.setHidden(false);
  assert.deepEqual(calls, ['win32:showNoActivate', 'electron:showInactive']);
});

test('attached, shown at start: one showInactive, as before', async () => {
  hostOk = true;
  await host({ killSwitch: false, hidden: false });
  assert.deepEqual(calls, ['win32:attach', 'electron:showInactive']);
});

test('the drop from attached to fallback shows the window to Chromium again', async () => {
  hostOk = true;
  const h = await host({ killSwitch: false, hidden: false });
  calls = [];
  assert.equal(h.testDropToFallback(), true);
  assert.deepEqual(calls, ['win32:detach show=true', 'electron:showInactive']);
});
