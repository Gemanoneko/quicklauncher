'use strict';
// Plain Node: node --test test/
// Option A (TechPlan section 7, UX spec "Fallback focus"): SetParent(NULL)
// activates a top-level window it moves, so desktop-layer.js never calls it on
// a window that already is top-level. A desktop child still gets it, while it
// carries WS_CHILD (the style is changed only after the call). Checked on
// desktop-layer.js itself with koffi replaced by a recording fake: no Win32.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const DESKTOP = 0x10010;
const PROGMAN = 0x20020;
const WS_CHILD = 0x40000000;
let parents;
let styles;
let exStyles;
let calls;
let refusal;
let lastError;
function impl(name, args) {
  const [h] = args;
  switch (name) {
    case 'GetDesktopWindow': return DESKTOP;
    case 'GetAncestor': return parents.get(h) || DESKTOP;
    case 'SetParent': {
      calls.push({ name, h, to: args[1], styleAtCall: styles.get(h) || 0 });
      if (refusal === name) { lastError = 5; return 0; }
      const prev = parents.get(h) || DESKTOP;
      parents.set(h, args[1] || DESKTOP);
      return prev;
    }
    case 'GetWindowLongW': return (args[1] === -16 ? styles : exStyles).get(h) || 0;
    case 'SetWindowLongW':
      if (args[1] === -16) { styles.set(h, args[2]); calls.push({ name: 'SetStyle', h, style: args[2] }); }
      else exStyles.set(h, args[2]);
      return 0;
    case 'SetLayeredWindowAttributes':
      calls.push({ name, args });
      if (refusal === name) { lastError = 87; return 0; }
      return 1;
    case 'FindWindowW': return 0;
    case 'FindWindowExW': return 0;
    case 'GetWindow': return 0;
    case 'EnumWindows': return 1;
    case 'SetLastError': lastError = h; return;
    case 'GetLastError': return lastError;
    default: return 1;
  }
}
const fakeKoffi = {
  load: () => ({ func: (sig) => { const name = /__stdcall (\w+)\(/.exec(sig)[1]; return (...args) => impl(name, args); } }),
  proto: () => ({}),
};
const realLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === 'koffi') return fakeKoffi;
  return realLoad.call(this, request, parent, isMain);
};
delete require.cache[require.resolve('../../src/main/desktop/desktop-layer')];
const d = require('../../src/main/desktop/desktop-layer');
Module._load = realLoad;

const RECT = { left: 100, top: 100, right: 500, bottom: 400 };
function reset(hwnd, { child, exStyle = 0, fail = null }) {
  parents = new Map(child ? [[hwnd, PROGMAN]] : []);
  styles = new Map([[hwnd, child ? WS_CHILD : 0x80000000 | 0]]);
  exStyles = new Map([[hwnd, exStyle]]);
  calls = [];
  refusal = fail;
  lastError = 0;
}

test('the module runs on the fake (sanity: koffi replaced, Win32 never touched)', () => {
  assert.equal(d.available, true);
});

test('attach adds desktop alpha blending without changing overall opacity or existing flags', () => {
  const hwnd = 0x501;
  reset(hwnd, { child: false, exStyle: d.C.WS_EX_TOOLWINDOW });
  assert.equal(d.attachToHost(hwnd, PROGMAN, RECT).ok, true);
  assert.equal(exStyles.get(hwnd), d.C.WS_EX_TOOLWINDOW | d.C.WS_EX_LAYERED);
  assert.deepEqual(calls.find(call => call.name === 'SetLayeredWindowAttributes').args, [hwnd, 0, 255, d.C.LWA_ALPHA]);
});

test('attaching a window already layered by its compositor leaves its alpha attributes alone', () => {
  const hwnd = 0x502;
  reset(hwnd, { child: false, exStyle: d.C.WS_EX_LAYERED });
  assert.equal(d.attachToHost(hwnd, PROGMAN, RECT).ok, true);
  assert.equal(calls.filter(call => call.name === 'SetLayeredWindowAttributes').length, 0);
  assert.equal(exStyles.get(hwnd), d.C.WS_EX_LAYERED);
});

test('a failed alpha setup leaves the window in its original parent and styles', () => {
  const hwnd = 0x503;
  reset(hwnd, { child: false, exStyle: d.C.WS_EX_TOOLWINDOW, fail: 'SetLayeredWindowAttributes' });
  assert.match(d.attachToHost(hwnd, PROGMAN, RECT).error, /SetLayeredWindowAttributes failed.*87/);
  assert.equal(calls.filter(call => call.name === 'SetParent').length, 0);
  assert.equal(styles.get(hwnd), d.C.WS_POPUP);
  assert.equal(exStyles.get(hwnd), d.C.WS_EX_TOOLWINDOW);
});

test('a failed SetParent rolls back the new layered style and the regular style', () => {
  const hwnd = 0x504;
  reset(hwnd, { child: false, exStyle: d.C.WS_EX_TOOLWINDOW, fail: 'SetParent' });
  assert.match(d.attachToHost(hwnd, PROGMAN, RECT).error, /SetParent failed.*5/);
  assert.equal(styles.get(hwnd), d.C.WS_POPUP);
  assert.equal(exStyles.get(hwnd), d.C.WS_EX_TOOLWINDOW);
});

test('detachToTopLevel: a window that already is top-level is not re-parented (no activation)', () => {
  reset(0x501, { child: false });
  const r = d.detachToTopLevel(0x501, RECT, { show: true });
  assert.equal(calls.filter((c) => c.name === 'SetParent').length, 0);
  assert.equal(r.ok, true, 'still a top-level popup');
});

test('detachToTopLevel: a desktop child IS re-parented, while it still has WS_CHILD', () => {
  reset(0x502, { child: true });
  const r = d.detachToTopLevel(0x502, RECT, { show: true });
  const sp = calls.filter((c) => c.name === 'SetParent');
  assert.equal(sp.length, 1);
  assert.equal(sp[0].to, 0, 'to the desktop');
  assert.ok(sp[0].styleAtCall & WS_CHILD, 'WS_CHILD at the moment of the call (a child cannot be activated)');
  const iParent = calls.findIndex((c) => c.name === 'SetParent');
  const iStyle = calls.findIndex((c) => c.name === 'SetStyle' && !(c.style & WS_CHILD));
  assert.ok(iParent >= 0 && iStyle > iParent, 'the style loses WS_CHILD only after SetParent');
  assert.equal(r.ok, true);
});

test('releaseFromShell: top-level (fallback) not re-parented; a desktop child is, with WS_CHILD still set', () => {
  reset(0x503, { child: false });
  assert.equal(d.releaseFromShell(0x503), true);
  assert.equal(calls.filter((c) => c.name === 'SetParent').length, 0);
  reset(0x504, { child: true });
  assert.equal(d.releaseFromShell(0x504), true);
  const sp = calls.filter((c) => c.name === 'SetParent');
  assert.equal(sp.length, 1);
  assert.ok(sp[0].styleAtCall & WS_CHILD);
});
