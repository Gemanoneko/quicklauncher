'use strict';
// Plain Node: node --test test/
// The real RegionController with `electron` and the desktop host stubbed:
// no window, no display, no Win32. It checks the main-process rules of M2:
// the home-layout rule on display change and resume (spec 4.4) and the
// tile drag relayed between regions (spec 5.3).
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { EventEmitter } = require('node:events');

// ── stubs ──────────────────────────────────────────────────────────────────
const screenOn = {};
const powerOn = {};
let WA = { x: 0, y: 0, width: 1920, height: 1040 };
const hosts = [];
class FakeHost extends EventEmitter {
  constructor(opts) { super(); this.opts = opts; this.mode = 'attached'; this.rects = []; this.hidden = !!opts.hidden; hosts.push(this); }
  start() { return Promise.resolve(); }
  tick() { return Promise.resolve(); }
  setScreenRect(r) { this.rects.push(r); return true; }
  setHidden(h) { this.hidden = !!h; }
  focusAfterClick() { return false; }
  describe() { return { mode: this.mode }; }
  stop() { return { released: true }; }
}
let wcSeq = 100;
class FakeBrowserWindow extends EventEmitter {
  constructor() {
    super();
    this.webContents = Object.assign(new EventEmitter(), { id: ++wcSeq, send() {}, isDestroyed: () => false });
    this.destroyed = false;
  }
  loadFile() {}
  isDestroyed() { return this.destroyed; }
  destroy() { this.destroyed = true; this.emit('closed'); }
}
const fakeElectron = {
  BrowserWindow: FakeBrowserWindow,
  Menu: { buildFromTemplate: () => ({ popup() {} }) },
  dialog: { showMessageBox: async () => ({ response: 0 }) },
  screen: {
    getPrimaryDisplay: () => ({ workArea: { ...WA } }),
    dipToScreenRect: (_w, r) => ({ ...r }), // 100 %
    on: (ev, fn) => { (screenOn[ev] = screenOn[ev] || []).push(fn); },
  },
  powerMonitor: { on: (ev, fn) => { (powerOn[ev] = powerOn[ev] || []).push(fn); } },
  app: { getVersion: () => '0.0.0-test', getAppMetrics: () => [] },
};
const realLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === 'electron') return fakeElectron;
  if (/[\\/]desktop[\\/]region-host$/.test(request) || request === '../desktop/region-host') return { RegionHost: FakeHost };
  return realLoad.call(this, request, parent, isMain);
};
const { RegionController } = require('../../src/main/regions/controller');
Module._load = realLoad;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = (x, y, width = 424, height = 300) => ({ x, y, width, height });

function make({ items = 3, caps = null } = {}) {
  WA = { x: 0, y: 0, width: 1920, height: 1040 };
  for (const k of Object.keys(screenOn)) delete screenOn[k];
  for (const k of Object.keys(powerOn)) delete powerOn[k];
  hosts.length = 0;
  const home = { ...WA };
  const data = {
    apps: [
      ...Array.from({ length: items }, (_, i) => ({ id: `a${i}`, name: `A${i}`, path: `C:\\a${i}.exe`, iconDataUrl: '', regionId: 'r1' })),
      { id: 'b0', name: 'B0', path: 'C:\\b0.exe', iconDataUrl: '', regionId: 'r2' },
      { id: 'b1', name: 'B1', path: 'C:\\b1.exe', iconDataUrl: '', regionId: 'r2' },
    ],
    settings: { theme: 'matrix', randomTheme: false, matchAll: false, sharedTheme: null, managerBounds: null },
    regions: [
      { id: 'r1', name: 'QUICK.LAUNCH', icon: 'apps', layout: 'grid', theme: 'matrix', rect: R(100, 100), home },
      { id: 'r2', name: 'Games', icon: 'games', layout: 'grid', theme: 'tron', rect: R(1000, 100), home },
      { id: 'r3', name: 'Tools', icon: 'tools', layout: 'grid', theme: 'tron', rect: R(1000, 600), home },
    ],
    regionsVersion: 1,
  };
  const store = {
    data, dataPath: 'Z:\\nowhere\\quicklauncher-data.json',
    get: (k) => data[k], set: (k, v) => { data[k] = v; },
    rendererView: () => undefined, setFromRenderer() {}, pendingRendererState: () => null, recheck() {}, rendererSynced() {},
  };
  const ctl = new RegionController({ store, validThemes: new Set(['matrix', 'tron', 'cyberpunk']), testHooks: true, log: () => {} });
  ctl.init();
  const sent = [];
  for (const rt of ctl.rt.values()) {
    rt.ready = true;
    rt.wc = { id: rt.id, isDestroyed: () => false, send: (ch, msg) => sent.push({ to: rt.id, ch, msg }) };
  }
  if (caps) for (const [id, cap] of Object.entries(caps)) ctl.setTestCap(id, cap);
  const hostOf = (id) => ctl.rt.get(id).host;
  const shown = (id) => ({ ...ctl.rt.get(id).shown });
  const saved = (id) => ({ ...data.regions.find((r) => r.id === id).rect });
  const ids = (r) => data.apps.filter((a) => a.regionId === r).map((a) => a.id);
  const of = (to, ch) => sent.filter((s) => s.to === to && s.ch === ch);
  return { ctl, data, sent, hostOf, shown, saved, ids, of, done: () => ctl.releaseAll() };
}
const fireDisplay = () => screenOn['display-metrics-changed'].forEach((fn) => fn());
const fireResume = () => powerOn.resume.forEach((fn) => fn());

// ── display change and resume: the home-layout rule (spec 4.4) ─────────────
test('display change: regions fit a small work area, nothing is saved; the same work area again restores the saved places', async () => {
  const t = make();
  try {
    const before = JSON.stringify(t.data.regions);
    WA = { x: 0, y: 0, width: 800, height: 600 };
    fireDisplay();
    await sleep(400);
    const inner = { x: 12, y: 12, r: 788, b: 588 };
    for (const id of ['r1', 'r2', 'r3']) {
      const s = t.shown(id);
      assert.ok(s.x >= inner.x && s.y >= inner.y && s.x + s.width <= inner.r && s.y + s.height <= inner.b, `${id} inside the small area`);
    }
    assert.equal(JSON.stringify(t.data.regions), before, 'saved rects and homes untouched');
    WA = { x: 0, y: 0, width: 1920, height: 1040 };
    fireDisplay();
    await sleep(400);
    for (const id of ['r1', 'r2', 'r3']) assert.deepEqual(t.shown(id), t.saved(id), `${id} back at its saved place`);
  } finally { t.done(); }
});

test('display change: every window is re-applied, even when its rect did not change (scale changes move the physical rect)', async () => {
  const t = make();
  try {
    const counts = ['r1', 'r2', 'r3'].map((id) => t.hostOf(id).rects.length);
    fireDisplay();
    await sleep(400);
    ['r1', 'r2', 'r3'].forEach((id, i) => assert.equal(t.hostOf(id).rects.length, counts[i] + 1, `${id} re-applied once`));
  } finally { t.done(); }
});

test('a move that ends inside the save debounce keeps the user\'s rect and work area when the display changes', async () => {
  const t = make();
  try {
    t.ctl.drag('r1', { phase: 'start' });
    t.ctl.drag('r1', { phase: 'move', dx: 0, dy: 300, alt: true });
    t.ctl.drag('r1', { phase: 'end' });
    const chosen = t.shown('r1');
    assert.deepEqual(chosen, R(100, 400));
    WA = { x: 0, y: 0, width: 800, height: 600 }; // inside the 400 ms debounce
    fireDisplay();
    await sleep(600);
    const rec = t.data.regions.find((r) => r.id === 'r1');
    assert.deepEqual(rec.rect, chosen, 'the rect the user chose is saved, not the fitted one');
    assert.deepEqual(rec.home, { x: 0, y: 0, width: 1920, height: 1040 }, 'against the work area it was made on');
    assert.notDeepEqual(t.shown('r1'), chosen, 'shown fitted to the small area meanwhile');
  } finally { t.done(); }
});

test('a relayout inside the debounce uses the rect just chosen, not the old saved one', async () => {
  const t = make();
  try {
    t.ctl.nudge('r1', 0, 32);
    const chosen = t.shown('r1');
    t.ctl.relayoutAll('test');
    assert.deepEqual(t.shown('r1'), chosen, 'no jump back to the old saved rect');
    t.ctl.flushPendingRects();
    assert.deepEqual(t.saved('r1'), chosen, 'flush writes the chosen rect');
  } finally { t.done(); }
});

test('a drag in flight is cancelled by a display change, and its page is told', async () => {
  const t = make();
  try {
    t.ctl.drag('r2', { phase: 'start' });
    t.ctl.drag('r2', { phase: 'move', dx: -50, dy: 0, alt: true });
    fireDisplay();
    assert.equal(t.ctl.rt.get('r2').drag, null, 'drag state dropped at once');
    assert.ok(t.of('r2', 'region:command').some((s) => s.msg.cmd === 'cancel-drag'), 'page told to stop');
    assert.deepEqual(t.ctl.drag('r2', { phase: 'move', dx: -80, dy: 0 }), { ok: false }, 'later moves do nothing');
    await sleep(400);
    assert.deepEqual(t.shown('r2'), t.saved('r2'), 'back at its saved place');
  } finally { t.done(); }
});

test('resume: the same rule after the settle delay', async () => {
  const t = make();
  try {
    WA = { x: 0, y: 0, width: 900, height: 700 };
    fireResume();
    await sleep(200);
    assert.deepEqual(t.shown('r2'), t.saved('r2'), 'nothing moves before the work area settles');
    await sleep(1100);
    const s = t.shown('r2');
    assert.ok(s.x + s.width <= 888, 'fitted after the delay');
    assert.deepEqual(t.saved('r2'), R(1000, 100), 'not saved');
  } finally { t.done(); }
});

// ── a tile dragged between regions (spec 5.3) ──────────────────────────────
// r1's window starts at (94, 94) DIP (panel 100,100 minus the 6 px rim).
const inR2 = { x: 1000 + 50 - 94, y: 100 + 60 - 94 };       // page point of r1 over r2's panel
const inR2Rim = { x: 1000 - 3 - 94, y: 100 + 60 - 94 };     // r2's rim, outside its panel
const onDesktop = { x: 700 - 94, y: 800 - 94 };              // no region near

test('over another region: the first message carries the tile, moving on to the desktop clears it', () => {
  const t = make();
  try {
    assert.equal(t.ctl.tileDragFrom('r1', { phase: 'start', itemId: 'a1' }).ok, true);
    const r = t.ctl.tileDragFrom('r1', { phase: 'move', ...inR2 });
    assert.equal(r.over, 'r2');
    const over = t.of('r2', 'region:tile-drop-preview');
    assert.equal(over.length, 1);
    assert.deepEqual([over[0].msg.phase, over[0].msg.x, over[0].msg.y], ['over', 56, 66], 'r2 page coordinates (window at 994, 94)');
    assert.equal(over[0].msg.item.name, 'A1');
    assert.equal(over[0].msg.rejected, null);
    t.ctl.tileDragFrom('r1', { phase: 'move', x: inR2.x + 5, y: inR2.y });
    assert.equal(t.of('r2', 'region:tile-drop-preview')[1].msg.item, undefined, 'the tile is sent once');
    t.ctl.tileDragFrom('r1', { phase: 'move', ...onDesktop });
    assert.equal(t.of('r2', 'region:tile-drop-preview').at(-1).msg.phase, 'leave');
    assert.equal(t.of('r1', 'region:tile-drop-preview').length, 0, 'the source never draws a slot');
  } finally { t.done(); }
});

test('release on a region: its page names the slot and the item moves there, in order, both pages updated', async () => {
  const t = make();
  try {
    t.ctl.tileDragFrom('r1', { phase: 'start', itemId: 'a1' });
    t.ctl.tileDragFrom('r1', { phase: 'move', ...inR2 });
    const pending = t.ctl.tileDragFrom('r1', { phase: 'end', ...inR2 });
    const drop = t.of('r2', 'region:tile-drop-preview').at(-1).msg;
    assert.equal(drop.phase, 'drop');
    assert.deepEqual(t.ctl.tileDropFrom('r3', { dragId: drop.dragId, index: 0 }), { ok: false }, 'only the target page can answer');
    const res = t.ctl.tileDropFrom('r2', { dragId: drop.dragId, index: 1 });
    assert.equal(res.ok, true);
    assert.deepEqual((await pending).result, 'moved');
    assert.deepEqual(t.ids('r2'), ['b0', 'a1', 'b1']);
    assert.deepEqual(t.ids('r1'), ['a0', 'a2']);
    assert.equal(t.of('r1', 'region:items-changed').length, 1);
    assert.equal(t.of('r2', 'region:items-changed').length, 1);
    assert.equal(t.ctl.tileDrag, null);
  } finally { t.done(); }
});

test('release on empty desktop, in a gap or rim, or back in the source: cancelled, nothing moves', async () => {
  for (const [label, p] of [['desktop', onDesktop], ['rim', inR2Rim]]) {
    const t = make();
    try {
      const before = JSON.stringify(t.data.apps);
      t.ctl.tileDragFrom('r1', { phase: 'start', itemId: 'a0' });
      t.ctl.tileDragFrom('r1', { phase: 'move', ...inR2 });
      const r = await t.ctl.tileDragFrom('r1', { phase: 'end', ...p });
      assert.equal(r.result, 'cancelled', label);
      assert.ok(!t.of('r2', 'region:tile-drop-preview').some((s) => s.msg.phase === 'drop'), `${label}: no drop was offered`);
      assert.equal(JSON.stringify(t.data.apps), before, `${label}: store unchanged`);
      assert.equal(t.of('r2', 'region:tile-drop-preview').at(-1).msg.phase, 'leave', `${label}: preview cleared`);
    } finally { t.done(); }
  }
  const t = make();
  try {
    t.ctl.tileDragFrom('r1', { phase: 'start', itemId: 'a0' });
    t.ctl.tileDragFrom('r1', { phase: 'move', ...inR2 });
    t.ctl.tileDragFrom('r1', { phase: 'cancel' });
    assert.equal(t.ctl.tileDrag, null);
    assert.equal(t.of('r2', 'region:tile-drop-preview').at(-1).msg.phase, 'leave', 'back in the source: preview cleared');
  } finally { t.done(); }
});

test('a full region: rejected outline text, release cancels, Move to lists it disabled', async () => {
  const t = make({ caps: { r2: 2 } });
  try {
    t.ctl.tileDragFrom('r1', { phase: 'start', itemId: 'a0' });
    const r = t.ctl.tileDragFrom('r1', { phase: 'move', ...inR2 });
    assert.equal(r.rejected, 'full');
    assert.equal(t.of('r2', 'region:tile-drop-preview')[0].msg.rejected, 'FULL (2 max)');
    const end = await t.ctl.tileDragFrom('r1', { phase: 'end', ...inR2 });
    assert.equal(end.result, 'cancelled');
    assert.deepEqual(t.ids('r2'), ['b0', 'b1']);
    assert.equal(t.ctl.moveItemToRegion('a0', 'r2').ok, false, 'Move to refused too');
    t.ctl.rt.get('r1').win = {};
    t.ctl.popupTileMenu('r1', 'a0', 10, 10);
    const moveTo = t.ctl.menuLog.at(-1).items.find((i) => i.label === 'Move to');
    assert.deepEqual(moveTo.submenu.map((s) => [s.label, s.enabled]), [['Games', false], ['Tools', true]]);
  } finally { t.done(); }
});

test('the target page never answers: the drop is cancelled after 2 s and the source hears it', async () => {
  const t = make();
  try {
    t.ctl.tileDragFrom('r1', { phase: 'start', itemId: 'a0' });
    const pending = t.ctl.tileDragFrom('r1', { phase: 'end', ...inR2 });
    const r = await pending;
    assert.equal(r.result, 'cancelled');
    assert.deepEqual(t.ids('r1'), ['a0', 'a1', 'a2']);
  } finally { t.done(); }
});

test('hide all, a display change, or a window closing stops a tile drag and tells the source', () => {
  for (const stop of ['hide', 'display']) {
    const t = make();
    try {
      t.ctl.tileDragFrom('r1', { phase: 'start', itemId: 'a0' });
      t.ctl.tileDragFrom('r1', { phase: 'move', ...inR2 });
      if (stop === 'hide') t.ctl.hideAll(); else fireDisplay();
      assert.equal(t.ctl.tileDrag, null, stop);
      assert.ok(t.of('r1', 'region:command').some((s) => s.msg.cmd === 'cancel-tile-drag'), `${stop}: source told`);
      assert.equal(t.of('r2', 'region:tile-drop-preview').at(-1).msg.phase, 'leave', `${stop}: target cleared`);
    } finally { t.done(); }
  }
});

test('a drag of an item the source does not own is refused', () => {
  const t = make();
  try {
    assert.equal(t.ctl.tileDragFrom('r1', { phase: 'start', itemId: 'b0' }).ok, false);
    assert.deepEqual(t.ctl.tileDragFrom('r1', { phase: 'move', ...inR2 }), { ok: false });
  } finally { t.done(); }
});

// ── M2b ─────────────────────────────────────────────────────────────────────
test('an activated region window (its focus event) becomes the active region (fallback focus 3)', async () => {
  const t = make();
  try {
    assert.equal(t.ctl.activeId, 'r1');
    const rt = t.ctl.rt.get('r2');
    const pending = t.ctl._createRegionWindow(rt);
    const win = rt.win;
    win.emit('ready-to-show');
    await pending;
    win.emit('focus');
    assert.equal(t.ctl.activeId, 'r2');
  } finally { t.done(); }
});

test('the target closes its slot through the reflow when the pointer leaves, at once on a system cancel (A6)', () => {
  const t = make();
  try {
    t.ctl.tileDragFrom('r1', { phase: 'start', itemId: 'a0' });
    t.ctl.tileDragFrom('r1', { phase: 'move', ...inR2 });
    t.ctl.tileDragFrom('r1', { phase: 'move', ...onDesktop });
    const leave = t.of('r2', 'region:tile-drop-preview').at(-1).msg;
    assert.deepEqual([leave.phase, !!leave.instant], ['leave', false], 'pointer left: animated close');
    t.ctl.tileDragFrom('r1', { phase: 'move', ...inR2 });
    fireDisplay();
    const cancel = t.of('r2', 'region:tile-drop-preview').at(-1).msg;
    assert.deepEqual([cancel.phase, cancel.instant], ['leave', true], 'display change: instant');
  } finally { t.done(); }
});

test('a drop the main process refuses tells the target to drop the slot it kept (A6)', async () => {
  const t = make();
  try {
    t.ctl.tileDragFrom('r1', { phase: 'start', itemId: 'a0' });
    t.ctl.tileDragFrom('r1', { phase: 'move', ...inR2 });
    const pending = t.ctl.tileDragFrom('r1', { phase: 'end', ...inR2 });
    const drop = t.of('r2', 'region:tile-drop-preview').at(-1).msg;
    t.ctl.setTestCap('r2', 2); // r2 fills up before the page answers
    const res = t.ctl.tileDropFrom('r2', { dragId: drop.dragId, index: 0 });
    assert.equal(res.ok, false);
    assert.equal((await pending).result, 'cancelled');
    const last = t.of('r2', 'region:tile-drop-preview').at(-1).msg;
    assert.deepEqual([last.phase, last.instant], ['leave', true]);
    assert.deepEqual(t.ids('r2'), ['b0', 'b1']);
  } finally { t.done(); }
});
