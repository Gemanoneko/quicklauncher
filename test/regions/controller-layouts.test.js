'use strict';
// Plain Node: node --test test/
// M4, Column and Row (regions UX spec 2.3, 2.4, 3.3, 9.2, 8.1; tech plan § 9):
// the real RegionController with `electron` and the desktop host stubbed (no
// window, no display, no Win32). Layout switch (anchor, room, refusal, Grid's
// remembered size), size that follows content (90%, room, edit bar, notice),
// the home rule on display change, creation, and the menus.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { EventEmitter } = require('node:events');

// ── stubs (as controller.test.js) ──────────────────────────────────────────
const screenOn = {};
let WA = { x: 0, y: 0, width: 1920, height: 1040 };
class FakeHost extends EventEmitter {
  constructor(opts) { super(); this.opts = opts; this.mode = 'attached'; this.rects = []; this.hidden = !!opts.hidden; }
  start() { return Promise.resolve(); }
  tick() { return Promise.resolve(); }
  setScreenRect(r) { this.rects.push(r); return true; }
  setHidden(h) { this.hidden = !!h; }
  focusAfterClick() { return false; }
  describe() { return { mode: this.mode }; }
  stop() { return { released: true }; }
}
let wcSeq = 500;
class FakeBrowserWindow extends EventEmitter {
  constructor() { super(); this.webContents = Object.assign(new EventEmitter(), { id: ++wcSeq, send() {}, isDestroyed: () => false }); }
  loadFile() {}
  isDestroyed() { return false; }
  destroy() {}
}
const fakeElectron = {
  BrowserWindow: FakeBrowserWindow,
  Menu: { buildFromTemplate: () => ({ popup() {} }) },
  dialog: { showMessageBox: async () => ({ response: 0 }) },
  screen: {
    getPrimaryDisplay: () => ({ workArea: { ...WA } }),
    dipToScreenRect: (_w, r) => ({ ...r }),
    on: (ev, fn) => { (screenOn[ev] = screenOn[ev] || []).push(fn); },
  },
  powerMonitor: { on() {} },
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
const tooClose = (a, b, gap = 12) => a.x < b.x + b.width + gap && b.x < a.x + a.width + gap && a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;

/**
 * regions: [{ id, layout, rect, items }]; defaults: r1 Grid at (100,100) with 3
 * items, r2 Grid at (1000,100) with 2, r3 Grid at (1000,600) empty.
 */
function make({ regions = null, iconSize = 64 } = {}) {
  WA = { x: 0, y: 0, width: 1920, height: 1040 };
  for (const k of Object.keys(screenOn)) delete screenOn[k];
  const home = { ...WA };
  const spec = regions || [
    { id: 'r1', layout: 'grid', rect: R(100, 100), items: 3 },
    { id: 'r2', layout: 'grid', rect: R(1000, 100), items: 2 },
    { id: 'r3', layout: 'grid', rect: R(1000, 600), items: 0 },
  ];
  const apps = [];
  for (const r of spec) for (let i = 0; i < (r.items || 0); i++) apps.push({ id: `${r.id}-${i}`, name: `${r.id.toUpperCase()} ${i}`, path: `C:\\${r.id}-${i}.exe`, iconDataUrl: '', regionId: r.id });
  const data = {
    apps,
    settings: { theme: 'matrix', randomTheme: false, matchAll: false, sharedTheme: null, managerBounds: null, iconSize },
    regions: spec.map((r, i) => ({ id: r.id, name: i ? `Region ${i}` : 'QUICK.LAUNCH', icon: 'apps', layout: r.layout, theme: 'matrix', rect: { ...r.rect }, home: { ...home }, ...(r.gridSize ? { gridSize: r.gridSize } : {}) })),
    regionsVersion: 1,
  };
  const store = {
    data, dataPath: 'Z:\\nowhere\\quicklauncher-data.json',
    get: (k) => data[k], set: (k, v) => { data[k] = v; },
    rendererView: () => undefined, setFromRenderer() {}, pendingRendererState: () => null, recheck() {}, rendererSynced() {},
  };
  const ctl = new RegionController({ store, validThemes: new Set(['matrix', 'tron']), testHooks: true, log: () => {} });
  ctl.init();
  const sent = [];
  for (const rt of ctl.rt.values()) {
    rt.ready = true;
    rt.wc = { id: rt.id, isDestroyed: () => false, send: (ch, msg) => sent.push({ to: rt.id, ch, msg }) };
  }
  const shown = (id) => ({ ...ctl.rt.get(id).shown });
  const saved = (id) => ({ ...data.regions.find((r) => r.id === id).rect });
  const rec = (id) => data.regions.find((r) => r.id === id);
  const lastRect = (id) => { const h = ctl.rt.get(id).host; return h.rects[h.rects.length - 1]; };
  return { ctl, data, sent, shown, saved, rec, lastRect, done: () => ctl.releaseAll() };
}
const fireDisplay = () => screenOn['display-metrics-changed'].forEach((fn) => fn());

// ── layout switch (spec 3.3) ───────────────────────────────────────────────
test('switch Grid to Column: the top-left anchor stays, the size follows the items (180 x 376 for 3), saved with its work area', async () => {
  const t = make();
  try {
    const r = await t.ctl.setLayout('r1', 'column');
    assert.equal(r.ok, true);
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 180, height: 376 });
    assert.equal(t.rec('r1').layout, 'column');
    assert.deepEqual(t.saved('r1'), { x: 100, y: 100, width: 180, height: 376 });
    assert.deepEqual(t.rec('r1').home, { x: 0, y: 0, width: 1920, height: 1040 });
    // The window: no resize rim for Column.
    assert.deepEqual(t.lastRect('r1'), { left: 100, top: 100, right: 280, bottom: 476 });
    // The page hears its new layout.
    const st = t.sent.filter((s) => s.to === 'r1' && s.ch === 'region:state').pop();
    assert.equal(st.msg.layout, 'column');
    // Items, order and theme kept.
    assert.deepEqual(t.data.apps.filter((a) => a.regionId === 'r1').map((a) => a.id), ['r1-0', 'r1-1', 'r1-2']);
    assert.equal(t.rec('r1').theme, 'matrix');
  } finally { t.done(); }
});

test('Grid remembers its last size across a switch (tech plan § 2.1 gridSize): Column, Row, then Grid again at 300 x 200', async () => {
  const t = make({ regions: [
    { id: 'r1', layout: 'grid', rect: R(100, 100, 300, 200), items: 3 },
    { id: 'r2', layout: 'grid', rect: R(1000, 100), items: 2 },
  ] });
  try {
    await t.ctl.setLayout('r1', 'column');
    assert.deepEqual(t.rec('r1').gridSize, { width: 300, height: 200 });
    await t.ctl.setLayout('r1', 'row');
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 124 + 104 * 3, height: 128 });
    assert.deepEqual(t.rec('r1').gridSize, { width: 300, height: 200 }, 'Column to Row keeps the Grid size');
    await t.ctl.setLayout('r1', 'grid');
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 300, height: 200 });
    assert.deepEqual(t.saved('r1'), { x: 100, y: 100, width: 300, height: 200 });
    // Grid has its 6 px resize rim again.
    assert.deepEqual(t.lastRect('r1'), { left: 94, top: 94, right: 406, bottom: 306 });
  } finally { t.done(); }
});

test('a region that never was a Grid comes back at the default 424 x 300', async () => {
  const t = make({ regions: [{ id: 'r1', layout: 'column', rect: R(100, 100, 180, 168), items: 1 }] });
  try {
    await t.ctl.setLayout('r1', 'grid');
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 424, height: 300 });
  } finally { t.done(); }
});

test('switch finds room: a Column that would meet the region below moves by the smallest 12 px step that fits, and is saved there', async () => {
  const t = make({ regions: [
    { id: 'r1', layout: 'grid', rect: R(100, 100), items: 8 },
    { id: 'r4', layout: 'grid', rect: R(100, 412), items: 0 },
    { id: 'r2', layout: 'grid', rect: R(1000, 100), items: 0 },
    { id: 'r3', layout: 'grid', rect: R(1000, 600), items: 0 },
  ] });
  try {
    const others = ['r4', 'r2', 'r3'].map((id) => t.shown(id));
    const r = await t.ctl.setLayout('r1', 'column');
    assert.equal(r.ok, true);
    const s = t.shown('r1');
    assert.deepEqual(s, { x: 544, y: 100, width: 180, height: 64 + 104 * 8 }, 'nearest free spot: 37 steps of 12 px to the right');
    for (const o of others) assert.ok(!tooClose(s, o), 'no neighbour within 12 px');
    assert.deepEqual(['r4', 'r2', 'r3'].map((id) => t.shown(id)), others, 'the others never move');
    assert.deepEqual(t.saved('r1'), s);
  } finally { t.done(); }
});

test('switch refused when nothing fits: the spec string in one box, nothing changes', async () => {
  const t = make({ regions: [
    { id: 'r1', layout: 'grid', rect: R(100, 100), items: 8 },
    { id: 'r2', layout: 'grid', rect: R(1000, 100), items: 0 },
  ] });
  try {
    t.ctl.setTestWorkArea({ x: 0, y: 0, width: 220, height: 400 });
    await sleep(400);
    const before = { shown: t.shown('r1'), rec: JSON.stringify(t.rec('r1')) };
    const r = await t.ctl.setLayout('r1', 'column');
    assert.equal(r.ok, false);
    assert.equal(r.error, 'No room for this layout. Move the region first.');
    assert.equal(t.ctl.boxLog.length, 1);
    assert.equal(t.ctl.boxLog[0].message, 'No room for this layout. Move the region first.');
    assert.deepEqual(t.shown('r1'), before.shown);
    assert.equal(JSON.stringify(t.rec('r1')), before.rec, 'layout, rect and gridSize unchanged');
  } finally { t.done(); }
});

test('An unknown layout is refused without a box', async () => {
  const t = make();
  try {
    const r = await t.ctl.setLayout('r1', 'spiral');
    assert.equal(r.ok, false);
    assert.equal(t.rec('r1').layout, 'grid');
    assert.equal(t.ctl.boxLog.length, 0);
  } finally { t.done(); }
});

// ── size follows content (spec 2.3, 2.4) ───────────────────────────────────
test('Column grows downward from its fixed top-left corner as items arrive and shrinks as they leave; nothing is saved', async () => {
  const t = make();
  try {
    await t.ctl.setLayout('r1', 'column');
    const savedAfterSwitch = t.saved('r1');
    t.ctl.moveItemToRegion('r2-0', 'r1');
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 180, height: 64 + 104 * 4 });
    t.ctl.moveItemToRegion('r1-0', 'r3');
    t.ctl.moveItemToRegion('r1-1', 'r3');
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 180, height: 64 + 104 * 2 });
    await sleep(500);
    assert.deepEqual(t.saved('r1'), savedAfterSwitch, 'the home rule: only a move or a switch saves');
  } finally { t.done(); }
});

test('Row grows rightward from its fixed left edge; an empty Row keeps its one-cell size (228 x 128)', async () => {
  const t = make();
  try {
    await t.ctl.setLayout('r3', 'row');
    assert.deepEqual(t.shown('r3'), { x: 1000, y: 600, width: 228, height: 128 });
    t.ctl.moveItemToRegion('r2-0', 'r3');
    t.ctl.moveItemToRegion('r2-1', 'r3');
    assert.deepEqual(t.shown('r3'), { x: 1000, y: 600, width: 124 + 104 * 2, height: 128 });
  } finally { t.done(); }
});

test('a page save that removes a tile shrinks the Column (saveItemsFromRenderer)', async () => {
  const t = make();
  try {
    await t.ctl.setLayout('r1', 'column');
    const items = t.data.apps.filter((a) => a.regionId === 'r1').slice(1).map(({ regionId, ...a }) => a);
    t.ctl.saveItemsFromRenderer('r1', items);
    assert.equal(t.shown('r1').height, 64 + 104 * 2);
  } finally { t.done(); }
});

test('growth stops at the room: a Column reaching the region below stops 12 px short and scrolls; it never moves, nor does the other', async () => {
  const t = make({ regions: [
    { id: 'r1', layout: 'column', rect: R(100, 100, 180, 376), items: 3 },
    { id: 'r4', layout: 'grid', rect: R(100, 700), items: 6 },
  ] });
  try {
    const r4 = t.shown('r4');
    for (let i = 0; i < 6; i++) t.ctl.moveItemToRegion(`r4-${i}`, 'r1');
    // The room is 588; the peek rule (M4 rulings Q2) trims it to 512 so the next tile shows 40 DIP.
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 180, height: 512 });
    assert.deepEqual(t.shown('r4'), r4);
  } finally { t.done(); }
});

test('90% cap: a Column stops at 90% of the work-area height, a Row at 90% of its width', async () => {
  let t = make({ regions: [{ id: 'r1', layout: 'column', rect: R(12, 12, 180, 168), items: 12 }] });
  try {
    assert.deepEqual(t.shown('r1'), { x: 12, y: 12, width: 180, height: 936 }, 'floor(0.9 x 1040)');
  } finally { t.done(); }
  t = make({ regions: [{ id: 'r2', layout: 'row', rect: R(12, 12, 228, 128), items: 30 }] });
  try {
    assert.deepEqual(t.shown('r2'), { x: 12, y: 12, width: 1728, height: 128 }, 'floor(0.9 x 1920)');
  } finally { t.done(); }
});

test('edit bar and notice slot: a Column grows by 38 each when there is room, and the list scrolls instead when not', async () => {
  const t = make({ regions: [
    { id: 'r1', layout: 'column', rect: R(100, 100, 180, 376), items: 3 },
    { id: 'r4', layout: 'grid', rect: R(100, 600), items: 0 },
  ] });
  try {
    t.ctl.setExtras('r1', { edit: true });
    assert.equal(t.shown('r1').height, 376 + 38);
    t.ctl.setExtras('r1', { edit: true, notice: true });
    assert.equal(t.shown('r1').height, 376 + 76);
    t.ctl.setExtras('r1', { edit: false, notice: false });
    assert.equal(t.shown('r1').height, 376);
    // No room: the region below sits 12 px under the Column.
    t.ctl.drag('r4', { phase: 'start' });
    t.ctl.drag('r4', { phase: 'move', dx: 0, dy: 488 - 600, alt: true });
    t.ctl.drag('r4', { phase: 'end' });
    assert.equal(t.shown('r4').y, 488);
    t.ctl.setExtras('r1', { edit: true });
    // No room for the bar: the list scrolls, and the peek rule trims 376 to 342 (the cut 34 DIP into a label otherwise).
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 180, height: 342 }, 'no room: never taller, the list scrolls with a peek');
  } finally { t.done(); }
});

test('a Row ignores the edit bar and notices (they live in its leading cell)', async () => {
  const t = make({ regions: [{ id: 'r1', layout: 'row', rect: R(100, 100, 436, 128), items: 3 }] });
  try {
    t.ctl.setExtras('r1', { edit: true, notice: true });
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 436, height: 128 });
  } finally { t.done(); }
});

test('icon size: a Column follows S (width max(180, S + 68), cells of S + 32); a Row is S + 64 high', async () => {
  const t = make({ regions: [
    { id: 'r1', layout: 'column', rect: R(100, 100, 180, 376), items: 3 },
    { id: 'r2', layout: 'row', rect: R(600, 100, 436, 128), items: 3 },
  ] });
  try {
    t.data.settings = { ...t.data.settings, iconSize: 128 };
    t.ctl.broadcastSettingsChanged();
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 196, height: 72 + 3 * 160 + 16 });
    assert.deepEqual(t.shown('r2'), { x: 600, y: 100, width: 132 + 3 * 160 + 16, height: 192 });
  } finally { t.done(); }
});

// ── start-up and display changes (spec 4.4) ────────────────────────────────
test('start-up: a Column comes back at its anchor with the size its items want, stopped by the region below, which does not move', async () => {
  const t = make({ regions: [
    { id: 'r1', layout: 'column', rect: R(100, 100, 180, 900), items: 8 },
    { id: 'r4', layout: 'grid', rect: R(100, 600), items: 0 },
  ] });
  try {
    assert.deepEqual(t.shown('r1'), { x: 100, y: 100, width: 180, height: 408 }, 'room 488, trimmed to a 40 DIP peek');
    assert.deepEqual(t.shown('r4'), R(100, 600));
    assert.deepEqual(t.saved('r1'), R(100, 100, 180, 900), 'nothing saved');
  } finally { t.done(); }
});

test('display change: Column and Row fit a small work area without saving; the same work area again brings them back', async () => {
  const t = make({ regions: [
    { id: 'r1', layout: 'column', rect: R(100, 100, 180, 376), items: 3 },
    { id: 'r2', layout: 'row', rect: R(600, 100, 436, 128), items: 3 },
    { id: 'r3', layout: 'grid', rect: R(1000, 600), items: 0 },
  ] });
  try {
    const before = ['r1', 'r2', 'r3'].map((id) => t.shown(id));
    const savedBefore = JSON.stringify(t.data.regions);
    WA = { x: 0, y: 0, width: 800, height: 600 };
    fireDisplay();
    await sleep(400);
    const now = ['r1', 'r2', 'r3'].map((id) => t.shown(id));
    for (const s of now) assert.ok(s.x >= 12 && s.y >= 12 && s.x + s.width <= 788 && s.y + s.height <= 588, 'inside the small area');
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) assert.ok(!tooClose(now[i], now[j]), 'apart');
    assert.equal(now[0].width, 180, 'a Column keeps its width');
    assert.equal(now[1].height, 128, 'a Row keeps its height');
    assert.equal(JSON.stringify(t.data.regions), savedBefore, 'nothing saved');
    WA = { x: 0, y: 0, width: 1920, height: 1040 };
    fireDisplay();
    await sleep(400);
    assert.deepEqual(['r1', 'r2', 'r3'].map((id) => t.shown(id)), before);
  } finally { t.done(); }
});

test('cramped display: the fit may shorten a Column (it scrolls) but never below one cell, and never narrows it', async () => {
  const t = make({ regions: [
    { id: 'r2', layout: 'grid', rect: R(100, 100), items: 0 },
    { id: 'r1', layout: 'column', rect: R(700, 100, 180, 896), items: 8 },
  ] });
  try {
    WA = { x: 0, y: 0, width: 600, height: 400 }; // the Grid must shrink before the Column fits beside it
    fireDisplay();
    await sleep(400);
    const c = t.shown('r1');
    const g = t.shown('r2');
    assert.equal(c.width, 180, 'Column width fixed');
    assert.ok(c.height >= 168, `at least one cell (${c.height})`);
    assert.ok(!tooClose(c, g), 'apart');
    assert.ok(c.x >= 12 && c.y >= 12 && c.x + c.width <= 588 && c.y + c.height <= 388, 'inside');
    assert.ok(c.height < 360, `shortened (${c.height}); it scrolls`);
  } finally { t.done(); }
});

// ── create, menus, Manager (spec 3.1, 7.1, 8.1, 9.2) ───────────────────────
test('create: an empty Column is 180 x 168 and an empty Row 228 x 128, placed by the create rule', () => {
  const t = make();
  try {
    const c = t.ctl.createRegion('column');
    const r = t.ctl.createRegion('row');
    assert.equal(c.ok, true);
    assert.equal(r.ok, true);
    const sc = t.shown(c.id);
    const sr = t.shown(r.id);
    assert.equal(sc.width, 180); assert.equal(sc.height, 168);
    assert.equal(sr.width, 228); assert.equal(sr.height, 128);
    assert.equal(t.rec(c.id).layout, 'column');
    assert.equal(t.rec(r.id).layout, 'row');
    assert.equal(t.ctl.createRegion('spiral').ok, false, 'unknown layout');
  } finally { t.done(); }
});

test('region menu: Layout lists Grid, Column and Row with the current one checked; a pick switches', async () => {
  const t = make();
  try {
    t.ctl.rt.get('r1').win = {};
    t.ctl.popupRegionMenu('r1', 10, 10);
    const menu = t.ctl.menuLog[t.ctl.menuLog.length - 1];
    const li = menu.items.findIndex((i) => i.label === 'Layout');
    assert.ok(li > 0, 'Layout in the region menu');
    assert.deepEqual(menu.items[li].submenu.map((i) => [i.label, i.checked]), [['Grid', true], ['Column', false], ['Row', false], ['Fan (max 10)', false], ['Ring (max 12)', false]]);
    assert.equal(menu.items[li - 1].label, 'Rename', 'after Rename (spec 9.2)');
    assert.equal(menu.items[li + 1].label, 'Place', 'before Place');
    assert.equal(t.ctl.menuClick([li, 2]).ok, true);
    await sleep(20);
    assert.equal(t.rec('r1').layout, 'row');
    t.ctl.popupRegionMenu('r1', 10, 10);
    const again = t.ctl.menuLog[t.ctl.menuLog.length - 1].items[li].submenu.map((i) => i.checked);
    assert.deepEqual(again, [false, false, true, false, false]);
  } finally { t.done(); }
});

test('Manager + NEW REGION: a menu of Grid, Column and Row; a pick creates that region and tells the Manager page', () => {
  const t = make();
  try {
    const got = [];
    t.ctl.manager = { window: { isDestroyed: () => false, webContents: { send: (ch, m) => got.push({ ch, m }) } }, changed() {}, open() {} };
    assert.deepEqual(t.ctl.popupNewRegionMenu(10, 20), { ok: true, recorded: true });
    const menu = t.ctl.menuLog[t.ctl.menuLog.length - 1];
    assert.equal(menu.kind, 'new-region');
    assert.deepEqual(menu.items.map((i) => i.label), ['Grid', 'Column', 'Row', 'Fan (max 10)', 'Ring (max 12)']);
    assert.equal(t.ctl.menuClick([1]).ok, true);
    const created = got.find((g) => g.ch === 'manager:created');
    assert.ok(created && created.m.ok && created.m.id);
    assert.equal(t.rec(created.m.id).layout, 'column');
    assert.deepEqual(t.ctl.managerState().layouts, ['grid', 'column', 'row', 'fan', 'ring']);
  } finally { t.done(); }
});

test('Manager + NEW REGION at the cap: every layout is listed disabled', () => {
  const t = make();
  try {
    t.ctl.manager = { window: { isDestroyed: () => false, webContents: { send() {} } }, changed() {}, open() {} };
    for (let i = 0; i < 5; i++) assert.equal(t.ctl.createRegion('grid').ok, true);
    t.ctl.popupNewRegionMenu(0, 0);
    assert.deepEqual(t.ctl.menuLog[t.ctl.menuLog.length - 1].items.map((i) => i.enabled), [false, false, false, false, false]);
  } finally { t.done(); }
});

test('the region page loads with its layout in the URL (no Grid frame first)', async () => {
  const t = make({ regions: [{ id: 'r1', layout: 'row', rect: R(100, 100, 436, 128), items: 3 }] });
  try {
    let query = null;
    const orig = FakeBrowserWindow.prototype.loadFile;
    FakeBrowserWindow.prototype.loadFile = function (_f, o) { query = o && o.query; };
    try {
      const rt = t.ctl.rt.get('r1');
      t.ctl._createRegionWindow(rt).catch(() => {});
    } finally { FakeBrowserWindow.prototype.loadFile = orig; }
    assert.equal(query && query.layout, 'row');
  } finally { t.done(); }
});
