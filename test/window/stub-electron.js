// Loads the real src/main/window.js with a stubbed 'electron' module.
// The stub BrowserWindow records its constructor options and stands in for
// the window's bounds, 'resize'/'moved' events and webContents events.
// Displays are set per test with setDisplays(); the first one is primary.
const Module = require('module');
const { EventEmitter } = require('events');

let displays = [];
const windows = [];

class StubBrowserWindow extends EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;
    this.bounds = { x: opts.x, y: opts.y, width: opts.width, height: opts.height };
    this.destroyed = false;
    this.webContents = new EventEmitter();
    this.webContents.send = () => {};
    windows.push(this);
  }
  loadFile() {}
  isDestroyed() { return this.destroyed; }
  getSize() { return [this.bounds.width, this.bounds.height]; }
  getPosition() { return [this.bounds.x, this.bounds.y]; }
  setBounds(b) {
    const moved = b.x !== this.bounds.x || b.y !== this.bounds.y;
    const resized = b.width !== this.bounds.width || b.height !== this.bounds.height;
    this.bounds = { ...b };
    if (resized) this.emit('resize');
    if (moved) this.emit('moved');
  }
}

function overlap(r, area) {
  const ox = Math.min(r.x + r.width, area.x + area.width) - Math.max(r.x, area.x);
  const oy = Math.min(r.y + r.height, area.y + area.height) - Math.max(r.y, area.y);
  return Math.max(0, ox) * Math.max(0, oy);
}

const electronStub = {
  BrowserWindow: StubBrowserWindow,
  app: { getVersion: () => '0.0.0-test' },
  screen: {
    getPrimaryDisplay: () => {
      const d = displays[0];
      return { ...d, workAreaSize: { width: d.workArea.width, height: d.workArea.height } };
    },
    getAllDisplays: () => displays,
    // Electron: the display that most closely intersects the rectangle.
    getDisplayMatching: (rect) =>
      displays.reduce((best, d) => (overlap(rect, d.bounds) > overlap(rect, best.bounds) ? d : best), displays[0]),
  },
};

function setDisplays(list) { displays = list; }

const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'electron') return electronStub;
  return origLoad.call(this, request, ...rest);
};
const { createWindow } = require('../../src/main/window');
Module._load = origLoad;

function makeStore(settings = {}) {
  const data = { settings: JSON.parse(JSON.stringify(settings)) };
  const writes = [];
  return {
    writes,
    get: (k) => data[k],
    set: (k, v) => { data[k] = v; writes.push(JSON.parse(JSON.stringify(v))); },
    settings: () => data.settings,
  };
}

// Creates the window and returns it with the store.
function open(settings) {
  const store = makeStore(settings);
  createWindow(store);
  return { store, win: windows[windows.length - 1] };
}

module.exports = { setDisplays, open };
