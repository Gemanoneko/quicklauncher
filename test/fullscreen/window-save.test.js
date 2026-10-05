// F-1 (QA 2026-10-05): window.js must never save the fullscreen bounds as
// windowSize / windowPosition. Loads the real window.js with a stubbed
// 'electron' module. Run: node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');
const { FakeWindow, DISPLAY } = require('./fake-window');

const PRIOR = { x: 200, y: 200, width: 424, height: 300 };
let lastWin = null;

class StubBrowserWindow extends FakeWindow {
  constructor(opts) {
    super({ x: opts.x, y: opts.y, width: opts.width, height: opts.height });
    lastWin = this;
  }
  loadFile() {}
  once() {}
}
const electronStub = {
  BrowserWindow: StubBrowserWindow,
  app: { getVersion: () => '0.0.0-test' },
  screen: {
    getPrimaryDisplay: () => ({ workAreaSize: { width: DISPLAY.width, height: DISPLAY.height - 48 } }),
    getAllDisplays: () => [{ workArea: { ...DISPLAY, height: DISPLAY.height - 48 } }],
  },
};
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'electron') return electronStub;
  return origLoad.call(this, request, ...rest);
};
const { createWindow } = require('../../src/main/window');
const fs = require('../../src/main/fullscreen');
Module._load = origLoad;

function makeStore() {
  const data = { settings: { windowSize: { width: PRIOR.width, height: PRIOR.height }, windowPosition: { x: PRIOR.x, y: PRIOR.y } } };
  const writes = [];
  return {
    writes,
    get: (k) => data[k],
    set: (k, v) => { data[k] = v; writes.push(JSON.parse(JSON.stringify(v))); },
    settings: () => data.settings,
  };
}

function setup(t) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const store = makeStore();
  createWindow(store);
  return { store, win: lastWin };
}

test('F11 then wait: nothing saved while fullscreen', (t) => {
  const { store, win } = setup(t);
  fs.toggleFullscreen(win);
  assert.deepEqual(win.getBounds(), DISPLAY);
  t.mock.timers.tick(1000);
  assert.deepEqual(store.writes, []);
  assert.deepEqual(store.settings().windowSize, { width: PRIOR.width, height: PRIOR.height });
});

test('F11, wait, Esc: saved size and position stay the prior ones', (t) => {
  const { store, win } = setup(t);
  fs.toggleFullscreen(win);
  t.mock.timers.tick(1000);
  fs.exitFullscreen(win);
  t.mock.timers.tick(1000);
  assert.deepEqual(win.getBounds(), PRIOR);
  assert.deepEqual(store.settings().windowSize, { width: PRIOR.width, height: PRIOR.height });
  assert.deepEqual(store.settings().windowPosition, { x: PRIOR.x, y: PRIOR.y });
  for (const w of store.writes) {
    assert.notDeepEqual(w.windowSize, { width: DISPLAY.width, height: DISPLAY.height });
  }
});

test('a resize just before F11 does not save the fullscreen size when its timer fires', (t) => {
  const { store, win } = setup(t);
  win.setBounds({ ...PRIOR, width: 500, height: 320 }); // user resize, debounce starts
  t.mock.timers.tick(100);
  fs.toggleFullscreen(win); // within the 400 ms debounce
  t.mock.timers.tick(1000);
  assert.deepEqual(store.writes, []);
  fs.exitFullscreen(win);
  assert.deepEqual(win.getBounds(), { ...PRIOR, width: 500, height: 320 });
});

test('a move just before F11 does not save the fullscreen position when its timer fires', (t) => {
  const { store, win } = setup(t);
  win.setBounds({ ...PRIOR, x: 300, y: 260 }); // user drag, debounce starts
  t.mock.timers.tick(100);
  fs.toggleFullscreen(win);
  t.mock.timers.tick(1000);
  assert.deepEqual(store.writes, []);
});

test('outside fullscreen, a resize and a move are still saved', (t) => {
  const { store, win } = setup(t);
  win.setBounds({ x: 250, y: 240, width: 500, height: 320 });
  t.mock.timers.tick(1000);
  assert.deepEqual(store.settings().windowSize, { width: 500, height: 320 });
  assert.deepEqual(store.settings().windowPosition, { x: 250, y: 240 });
});

test('a pending save on a destroyed window does not throw', (t) => {
  const { store, win } = setup(t);
  win.setBounds({ ...PRIOR, width: 500 });
  win.destroyed = true;
  assert.doesNotThrow(() => t.mock.timers.tick(1000));
  assert.deepEqual(store.writes, []);
});
