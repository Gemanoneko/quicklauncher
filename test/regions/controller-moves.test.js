'use strict';
// Plain Node: node --test test/
// M3 in the real RegionController (electron and the desktop host stubbed, as in
// controller.test.js) with the real mover on real files in the temp folder
// (QL_TEST_TMP, else os.tmpdir()): drops and their one box, ↩ from a page,
// region delete and Move all back with their boxes, the native menus, the
// page-save guard for moved items, broken tiles, the Manager's section.
// Message boxes are recorded and answered by the test hooks; none is shown.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const koffi = require('koffi');
const R = require('../../src/main/moves/rules');

// ── stubs (no window, no display, no Win32 window calls) ───────────────────
class FakeHost extends EventEmitter {
  constructor(opts) { super(); this.opts = opts; this.mode = 'attached'; }
  start() { return Promise.resolve(); }
  tick() { return Promise.resolve(); }
  setScreenRect() { return true; }
  setHidden() {}
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
const opened = [];
const fakeElectron = {
  BrowserWindow: FakeBrowserWindow,
  Menu: { buildFromTemplate: () => ({ popup() {} }) },
  dialog: { showMessageBox: async () => { throw new Error('a real message box was asked for'); } },
  shell: { openPath: async (p) => { opened.push(p); return ''; } },
  screen: { getPrimaryDisplay: () => ({ workArea: { x: 0, y: 0, width: 1920, height: 1040 } }), dipToScreenRect: (_w, r) => ({ ...r }), on() {} },
  powerMonitor: { on() {} },
  app: { getVersion: () => '0.0.0-test', getAppMetrics: () => [], exit() { throw new Error('exit'); } },
};
const realLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === 'electron') return fakeElectron;
  if (/[\\/]desktop[\\/]region-host$/.test(request) || request === '../desktop/region-host') return { RegionHost: FakeHost };
  return realLoad.call(this, request, parent, isMain);
};
const { RegionController } = require('../../src/main/regions/controller');
Module._load = realLoad;
const win32 = require('../../src/main/moves/win32');

const k32 = koffi.load('kernel32.dll');
const CreateFileW = k32.func('intptr __stdcall CreateFileW(str16 name, uint32 access, uint32 share, intptr sa, uint32 disp, uint32 flags, intptr tmpl)');
const CloseHandle = k32.func('int __stdcall CloseHandle(intptr h)');
const lockRead = (p) => { const h = CreateFileW(p, 0x80000000, 1, 0, 3, 0x80, 0); assert.ok(h && h !== -1); return () => CloseHandle(h); };

const BASE = path.resolve(process.env.QL_TEST_TMP || os.tmpdir());
fs.mkdirSync(BASE, { recursive: true });
const temps = [os.tmpdir(), process.env.TEMP, process.env.TMP].filter(Boolean).map((p) => fs.realpathSync.native(p));
const baseReal = fs.realpathSync.native(BASE);
if (!temps.some((t) => R.isInside(t, baseReal) || R.samePath(t, baseReal))) throw new Error(`refuses to run outside the temp folder: ${baseReal}`);
const ROOT = path.join(baseReal, 'ql-m3-ctl', `${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}-${process.pid}`);
let seq = 0;

const R0 = (x, y) => ({ x, y, width: 424, height: 300 });
async function make({ env = {}, readOnly = false } = {}) {
  const root = path.join(ROOT, `c${++seq}`);
  const dirs = { desktop: path.join(root, 'Desktop'), publicDesktop: path.join(root, 'Public Desktop'), store: path.join(root, 'QuickLauncher Shortcuts'), profile: path.join(root, 'profile') };
  for (const k of ['desktop', 'publicDesktop', 'profile']) fs.mkdirSync(dirs[k], { recursive: true });
  const home = { x: 0, y: 0, width: 1920, height: 1040 };
  const data = {
    apps: [{ id: 'ref1', name: 'REF1', path: 'C:\\ref1.exe', iconDataUrl: '', regionId: 'r1' }],
    settings: { theme: 'matrix', randomTheme: false, matchAll: false, sharedTheme: null, managerBounds: null },
    regions: [
      { id: 'r1', name: 'QUICK.LAUNCH', icon: 'apps', layout: 'grid', theme: 'matrix', rect: R0(100, 100), home },
      { id: 'r2', name: 'Games', icon: 'games', layout: 'grid', theme: 'tron', rect: R0(1000, 100), home },
    ],
    regionsVersion: 1,
  };
  let flushes = 0;
  const store = {
    data, dataPath: path.join(dirs.profile, 'quicklauncher-data.json'),
    get: (k) => data[k], set: (k, v) => { data[k] = v; }, flush: () => { flushes++; return !readOnly; }, isReadOnly: () => readOnly,
    rendererView: () => undefined, setFromRenderer() {}, pendingRendererState: () => null, recheck() {}, rendererSynced() {},
  };
  const ctl = new RegionController({
    store, validThemes: new Set(['matrix', 'tron']), testHooks: true, log: () => {}, win32, env,
    moveSetup: { available: true, testMode: true, folders: { desktop: dirs.desktop, publicDesktop: dirs.publicDesktop, store: dirs.store } },
    buildEntry: async (p) => ({ name: R.displayName(p), iconDataUrl: 'data:,i' }),
  });
  ctl.init();
  const sent = [];
  for (const rt of ctl.rt.values()) {
    rt.ready = true;
    rt.wc = { id: rt.id, isDestroyed: () => false, send: (ch, msg) => sent.push({ to: rt.id, ch, msg }) };
  }
  await ctl.mover.ready;
  const file = (dir, name, text = name) => { const p = path.join(dirs[dir], name); fs.writeFileSync(p, text); return p; };
  const pushed = (id) => sent.filter((s) => s.to === id && s.ch === 'region:items-changed').map((s) => s.msg);
  return { ctl, data, dirs, sent, file, pushed, flushes: () => flushes, done: () => ctl.releaseAll() };
}

test('drop: desktop shortcuts move and arrive as moved tiles; the store is written at once; no box when all move', async () => {
  const t = await make();
  try {
    const a = t.file('desktop', 'Steam.lnk');
    const exe = t.file('desktop', 'Tool.exe');
    const r = await t.ctl.dropFiles('r2', [a, exe], 0);
    assert.deepEqual({ moved: r.moved, refs: r.refs, failed: r.failed, refused: r.refused }, { moved: 1, refs: 1, failed: 0, refused: null });
    const last = t.pushed('r2').slice(-1)[0];
    assert.deepEqual(last.map((x) => [x.name, x.kind || 'ref']), [['Steam', 'moved'], ['Tool', 'ref']]);
    assert.ok(t.flushes() >= 2, 'each commit is written now');
    assert.equal(t.ctl.boxLog.length, 0);
    assert.ok(!fs.existsSync(a) && fs.existsSync(exe));
  } finally { t.done(); }
});

test('drop with one failure: N-1 tiles, the failed file stays, exactly one box naming it (spec 14.4)', async () => {
  const t = await make();
  try {
    const a = t.file('desktop', 'A.lnk');
    const b = t.file('desktop', 'Busy.lnk');
    const c = t.file('desktop', 'C.url');
    const unlock = lockRead(b);
    let r;
    try { r = await t.ctl.dropFiles('r1', [a, b, c], Infinity); } finally { unlock(); }
    assert.equal(r.moved, 2);
    assert.equal(r.failed, 1);
    assert.ok(fs.existsSync(b) && !fs.existsSync(a) && !fs.existsSync(c));
    assert.equal(t.ctl.boxLog.length, 1);
    assert.equal(t.ctl.boxLog[0].message, "Couldn't move “Busy” off the desktop. It is still on the desktop.");
    assert.equal(t.ctl.boxLog[0].detail, 'The file is in use.');
  } finally { t.done(); }
});

test('moving unavailable: one box with the spec string, nothing changes', async () => {
  const t = await make({ readOnly: true });
  try {
    const a = t.file('desktop', 'A.lnk');
    const r = await t.ctl.dropFiles('r1', [a], Infinity);
    assert.equal(r.refused, 'unavailable');
    assert.deepEqual(t.ctl.boxLog.map((b) => b.message), ['Moving is unavailable. Nothing was changed.']);
    assert.ok(fs.existsSync(a));
    assert.deepEqual(t.data.apps.map((x) => x.id), ['ref1']);
  } finally { t.done(); }
});

test('↩ from a page moves only that region\'s own moved items back', async () => {
  const t = await make();
  try {
    const a = t.file('desktop', 'Mine.lnk');
    await t.ctl.dropFiles('r2', [a], Infinity);
    const id = t.data.apps.find((x) => x.name === 'Mine').id;
    const wrong = await t.ctl.moveBackFromPage('r1', [id, 'ref1']);
    assert.deepEqual(wrong, { moved: [], failures: [] }, 'another region cannot move it, and a reference is not a moved item');
    const ok = await t.ctl.moveBackFromPage('r2', [id]);
    assert.deepEqual(ok, { moved: 1, failed: 0 });
    assert.ok(fs.existsSync(a));
    assert.ok(!t.data.apps.some((x) => x.id === id));
  } finally { t.done(); }
});

test('delete region: the confirm counts both kinds; files go back first; a failure keeps the region and says so', async () => {
  const t = await make();
  try {
    const a = t.file('desktop', 'One.lnk');
    const b = t.file('desktop', 'Two.lnk');
    await t.ctl.dropFiles('r2', [a, b], Infinity);
    t.data.apps.push({ id: 'ref2', name: 'R', path: 'C:\\r.exe', iconDataUrl: '', regionId: 'r2' });
    const two = t.data.apps.find((x) => x.name === 'Two');
    // Cancel (the default answer): nothing happens.
    const c = await t.ctl.deleteRegion('r2');
    assert.equal(c.cancelled, true);
    assert.equal(t.ctl.boxLog[0].message, 'Delete “Games”?');
    assert.equal(t.ctl.boxLog[0].detail, '2 shortcuts move back to the desktop.\n1 other shortcut is removed from QuickLauncher. The app stays installed.');
    assert.equal(t.ctl.boxLog[0].cancelId, 1);
    // Delete, with Two held open: One goes back, the region stays with Two.
    t.ctl._boxAnswers.push(0);
    const unlock = lockRead(two.path);
    let r;
    try { r = await t.ctl.deleteRegion('r2'); } finally { unlock(); }
    assert.deepEqual({ ok: r.ok, kept: r.kept, failed: r.failed }, { ok: false, kept: true, failed: 1 });
    assert.ok(t.data.regions.some((x) => x.id === 'r2'), 'region kept');
    assert.ok(fs.existsSync(a) && !fs.existsSync(b));
    const box = t.ctl.boxLog.slice(-1)[0];
    assert.equal(box.message, "Couldn't move “Two” back to the desktop. The region was kept.");
    assert.equal(box.detail, 'The file is in use.\n1 other is back on the desktop.', 'One went back (addendum B1)');
    // Again with nothing held: Two goes back, the region and its reference go.
    t.ctl._boxAnswers.push(0);
    const r2 = await t.ctl.deleteRegion('r2');
    assert.equal(r2.ok, true);
    assert.ok(fs.existsSync(b));
    assert.ok(!t.data.regions.some((x) => x.id === 'r2'));
    assert.ok(!t.data.apps.some((x) => x.regionId === 'r2'));
  } finally { t.done(); }
});

test('Move all back: region menu (named) and Manager (every region); Cancel changes nothing; references stay', async () => {
  const t = await make();
  try {
    const a = t.file('desktop', 'A.lnk');
    const b = t.file('desktop', 'B.lnk');
    await t.ctl.dropFiles('r1', [a], Infinity);
    await t.ctl.dropFiles('r2', [b], Infinity);
    const c = await t.ctl.moveAllBack('r1');
    assert.equal(c.cancelled, true);
    assert.deepEqual([t.ctl.boxLog[0].message, t.ctl.boxLog[0].detail, t.ctl.boxLog[0].buttons],
      ['Move 1 shortcut back to the desktop?', 'It leaves “QUICK.LAUNCH”. Names already on the desktop get a number.', ['Move back', 'Cancel']]);
    assert.ok(!fs.existsSync(a));
    t.ctl._boxAnswers.push(0);
    const all = await t.ctl.moveAllBack(null);
    assert.deepEqual({ ok: all.ok, moved: all.moved }, { ok: true, moved: 2 });
    assert.equal(t.ctl.boxLog.slice(-1)[0].message, 'Move 2 shortcuts back to the desktop?');
    assert.equal(t.ctl.boxLog.slice(-1)[0].detail, 'They leave 2 regions. Names already on the desktop get a number.', 'addendum B2');
    assert.ok(fs.existsSync(a) && fs.existsSync(b));
    assert.deepEqual(t.data.apps.map((x) => x.id), ['ref1']);
    assert.deepEqual(await t.ctl.moveAllBack('r1'), { ok: false, none: true });
  } finally { t.done(); }
});

test('menus (spec 9.2): tile menu says "Move back to desktop" for a moved tile, "Remove" for a reference; the region item is enabled only with moved tiles', async () => {
  const t = await make();
  try {
    t.ctl.rt.get('r1').win = new FakeBrowserWindow();
    t.ctl.popupRegionMenu('r1', 0, 0);
    let items = t.ctl.menuLog.slice(-1)[0].items;
    assert.equal(items.find((i) => i.label === 'Move all shortcuts back to desktop…').enabled, false);
    const a = t.file('desktop', 'A.lnk');
    await t.ctl.dropFiles('r1', [a], Infinity);
    t.ctl.popupRegionMenu('r1', 0, 0);
    items = t.ctl.menuLog.slice(-1)[0].items;
    const labels = items.map((i) => i.label);
    assert.ok(labels.indexOf('Move all shortcuts back to desktop…') === labels.indexOf('Delete region…') - 1, 'just above Delete region…');
    assert.equal(items.find((i) => i.label === 'Move all shortcuts back to desktop…').enabled, true);
    const moved = t.data.apps.find((x) => x.name === 'A');
    t.ctl.popupTileMenu('r1', moved.id, 0, 0);
    assert.deepEqual(t.ctl.menuLog.slice(-1)[0].items.map((i) => i.label), ['Rename', 'Move to', 'Move back to desktop']);
    t.ctl.popupTileMenu('r1', 'ref1', 0, 0);
    assert.deepEqual(t.ctl.menuLog.slice(-1)[0].items.map((i) => i.label), ['Rename', 'Move to', 'Remove']);
    t.ctl.popupTileMenu('r1', moved.id, 0, 0);
    assert.equal(t.ctl.menuClick([2]).ok, true);
    await t.ctl.mover._tail;
    await new Promise((r) => setTimeout(r, 50));
    assert.ok(fs.existsSync(a), 'the menu item moved the file back');
  } finally { t.done(); }
});

test('page saves cannot drop, re-path, steal or forge a moved item; they can rename and reorder it', async () => {
  const t = await make();
  try {
    const a = t.file('desktop', 'A.lnk');
    await t.ctl.dropFiles('r1', [a], Infinity);
    const m = t.data.apps.find((x) => x.name === 'A');
    const sanitized = (list) => list.map(({ id, name, path: p, iconDataUrl }) => ({ id, name, path: p, iconDataUrl: iconDataUrl || '' }));
    // Leaves the moved item out: it is kept, at its place, and the page is told.
    const before = t.pushed('r1').length;
    t.ctl.saveItemsFromRenderer('r1', sanitized(t.data.apps.filter((x) => x.id !== m.id)));
    assert.deepEqual(t.data.apps.map((x) => x.id), ['ref1', m.id]);
    assert.equal(t.pushed('r1').length, before + 1);
    // Re-path and rename and reorder: only the name and the order are taken.
    t.ctl.saveItemsFromRenderer('r1', sanitized([{ ...m, name: 'Renamed', path: 'C:\\evil.lnk' }, t.data.apps[0]]));
    const now = t.data.apps.find((x) => x.id === m.id);
    assert.deepEqual([now.name, now.path, now.kind, t.data.apps[0].id], ['Renamed', m.path, 'moved', m.id]);
    // From another region's page: not taken there.
    t.ctl.saveItemsFromRenderer('r2', sanitized([now]));
    assert.equal(t.data.apps.filter((x) => x.id === m.id).length, 1);
    assert.equal(t.data.apps.find((x) => x.id === m.id).regionId, 'r1');
    // A new item pointing into the store folder: dropped.
    t.ctl.saveItemsFromRenderer('r2', [{ id: 'forged', name: 'F', path: path.join(t.dirs.store, 'X.lnk'), iconDataUrl: '' }]);
    assert.ok(!t.data.apps.some((x) => x.id === 'forged'));
  } finally { t.done(); }
});

test('broken tile: a missing file shows broken; the click box offers Remove tile / Keep (Keep is the default)', async () => {
  const t = await make();
  try {
    const a = t.file('desktop', 'Gone.lnk');
    await t.ctl.dropFiles('r1', [a], Infinity);
    const m = t.data.apps.find((x) => x.name === 'Gone');
    const aside = path.join(path.dirname(t.dirs.store), 'aside');
    fs.mkdirSync(aside, { recursive: true });
    assert.equal(win32.moveFileNoReplace(m.path, path.join(aside, 'Gone.lnk')).ok, true); // taken away, not deleted
    await t.ctl.refreshMoves();
    const items = t.pushed('r1').slice(-1)[0];
    assert.equal(items.find((x) => x.id === m.id).broken, true);
    assert.equal(t.data.apps.find((x) => x.id === m.id).broken, undefined, 'never stored');
    const keep = await t.ctl.brokenClick('r1', m.id);
    assert.equal(keep.kept, true);
    assert.deepEqual([t.ctl.boxLog.slice(-1)[0].message, t.ctl.boxLog.slice(-1)[0].buttons], ['“Gone” is missing from the QuickLauncher Shortcuts folder.', ['Remove tile', 'Keep']]);
    t.ctl._boxAnswers.push(0);
    const rm = await t.ctl.brokenClick('r1', m.id);
    assert.equal(rm.removed, true);
    assert.ok(!t.data.apps.some((x) => x.id === m.id));
    assert.ok(fs.existsSync(path.join(aside, 'Gone.lnk')));
  } finally { t.done(); }
});

test('Manager section: counts, OneDrive note only when the desktop is under OneDrive, files without a tile, Open folder (recorded)', async () => {
  const t = await make();
  try {
    let s = t.ctl.managerState().moved;
    assert.deepEqual([s.count, s.countText, s.oneDrive, s.orphanText], [0, 'None moved off the desktop.', null, null]);
    const a = t.file('desktop', 'A.lnk');
    await t.ctl.dropFiles('r1', [a], Infinity);
    fs.writeFileSync(path.join(t.dirs.store, 'Stray.lnk'), 'S');
    await t.ctl.refreshMoves();
    s = t.ctl.managerState().moved;
    assert.deepEqual([s.count, s.countText, s.orphanText, s.orphans.map((o) => o.name)], [1, '1 moved off the desktop.', '1 file without a tile.', ['Stray']]);
    const o = await t.ctl.openStoreFolder();
    assert.deepEqual(o, { ok: true, recorded: true });
    assert.deepEqual(t.ctl.openedLog, [t.dirs.store]);
    assert.deepEqual(opened, [], 'nothing opened for real');
    const add = await t.ctl.orphanAction('add', path.join(t.dirs.store, 'Stray.lnk'));
    assert.equal(add.ok, true);
    assert.equal(t.data.apps.find((x) => x.name === 'Stray').regionId, 'r1');
    const t2 = await make({ env: { OneDrive: ROOT } }); // every test desktop lies under ROOT
    try { assert.equal(t2.ctl.managerState().moved.oneDrive, 'Your desktop is synced by OneDrive. Moved shortcuts stop syncing.'); } finally { t2.done(); }
  } finally { t.done(); }
});

test('region info carries its cap (null for a Grid; the test cap when set)', async () => {
  const t = await make();
  try {
    assert.equal(t.ctl.info('r1').cap, null);
    t.ctl.setTestCap('r1', 3);
    assert.equal(t.ctl.info('r1').cap, 3);
  } finally { t.done(); }
});

// ── M3 rulings (UX spec "Addendum — M3 rulings"; Sergei 2026-10-03) ─────────
// Takes a moved item's file out of the store folder (moved aside, never deleted) and rescans.
async function breakIt(t, item) {
  const aside = path.join(path.dirname(t.dirs.store), 'aside');
  fs.mkdirSync(aside, { recursive: true });
  assert.equal(win32.moveFileNoReplace(item.path, path.join(aside, path.basename(item.path))).ok, true);
  await t.ctl.refreshMoves();
  return path.join(aside, path.basename(item.path));
}

test('B4b: a missing-file tile never blocks Delete region: it counts as a reference, goes with the region, no failure box, no file touched', async () => {
  const t = await make();
  try {
    t.data.apps.push({ id: 'refB', name: 'R', path: 'C:\\r.exe', iconDataUrl: '', regionId: 'r2' });
    const a = t.file('desktop', 'Gone.lnk');
    await t.ctl.dropFiles('r2', [a], Infinity);
    const gone = t.data.apps.find((x) => x.name === 'Gone');
    const aside = await breakIt(t, gone);
    t.ctl._boxAnswers.push(0);
    const r = await t.ctl.deleteRegion('r2');
    assert.equal(r.ok, true);
    assert.equal(t.ctl.boxLog.length, 1, 'only the confirm');
    assert.equal(t.ctl.boxLog[0].detail, '2 shortcuts are removed from QuickLauncher. The apps stay installed.');
    assert.ok(!t.data.regions.some((x) => x.id === 'r2'));
    assert.ok(!t.data.apps.some((x) => x.regionId === 'r2'));
    assert.ok(fs.existsSync(aside), 'the file was never touched');
  } finally { t.done(); }
});

test('B4b: Move all back skips a missing-file tile (count, confirm, menu item); the broken tile stays', async () => {
  const t = await make();
  try {
    const files = ['A.lnk', 'B.lnk', 'C.lnk'].map((n) => t.file('desktop', n));
    await t.ctl.dropFiles('r1', files, Infinity);
    const c = t.data.apps.find((x) => x.name === 'C');
    await breakIt(t, c);
    assert.equal(t.ctl.managerState().moved.count, 2, 'the Manager count leaves it out');
    assert.equal(t.ctl.managerState().moved.countText, '2 moved off the desktop.');
    t.ctl.rt.get('r1').win = new FakeBrowserWindow();
    t.ctl._boxAnswers.push(0);
    const r = await t.ctl.moveAllBack('r1');
    assert.deepEqual({ ok: r.ok, moved: r.moved, failed: r.failed }, { ok: true, moved: 2, failed: 0 });
    assert.equal(t.ctl.boxLog[0].message, 'Move 2 shortcuts back to the desktop?');
    assert.equal(t.ctl.boxLog.length, 1, 'no failure box for the broken one');
    assert.deepEqual(t.data.apps.filter((x) => x.kind === 'moved').map((x) => x.name), ['C']);
    t.ctl.popupRegionMenu('r1', 0, 0);
    assert.equal(t.ctl.menuLog.slice(-1)[0].items.find((i) => i.label === 'Move all shortcuts back to desktop…').enabled, false, 'only a broken tile left: disabled');
    assert.deepEqual(await t.ctl.moveAllBack('r1'), { ok: false, none: true });
    assert.equal(t.ctl.managerState().moved.countText, 'None moved off the desktop.');
  } finally { t.done(); }
});

test('B4: a broken tile\'s tile menu reads Remove tile; it removes the record at once (no box); a file that came back is kept', async () => {
  const t = await make();
  try {
    const [a, b] = ['Gone.lnk', 'Back.lnk'].map((n) => t.file('desktop', n));
    await t.ctl.dropFiles('r1', [a, b], Infinity);
    const gone = t.data.apps.find((x) => x.name === 'Gone');
    const back = t.data.apps.find((x) => x.name === 'Back');
    await breakIt(t, gone);
    const asideBack = await breakIt(t, back);
    t.ctl.rt.get('r1').win = new FakeBrowserWindow();
    t.ctl.popupTileMenu('r1', gone.id, 0, 0);
    assert.deepEqual(t.ctl.menuLog.slice(-1)[0].items.map((i) => i.label), ['Rename', 'Move to', 'Remove tile']);
    assert.equal(t.ctl.menuClick([2]).ok, true);
    await t.ctl.mover._tail;
    await new Promise((r) => setTimeout(r, 50));
    assert.ok(!t.data.apps.some((x) => x.id === gone.id));
    // The other one's file comes back before its ✕: nothing is removed, the page gets it unbroken.
    assert.equal(win32.moveFileNoReplace(asideBack, back.path).ok, true);
    const r = await t.ctl.removeBrokenFromPage('r1', back.id);
    assert.deepEqual(r, { ok: false, removed: false });
    assert.ok(t.data.apps.some((x) => x.id === back.id));
    assert.equal(t.pushed('r1').slice(-1)[0].find((x) => x.id === back.id).broken, undefined);
    assert.equal(t.ctl.boxLog.length, 0, 'no box at any point');
    assert.deepEqual(await t.ctl.removeBrokenFromPage('r2', back.id), { ok: false }, 'another region cannot');
  } finally { t.done(); }
});

test('B7: files that are not shortcuts give the region notice (one, many), never a box; a full region says nothing', async () => {
  const t = await make();
  try {
    const lnk = t.file('desktop', 'Real.lnk');
    const txt = t.file('desktop', 'notes.txt');
    const dir = path.join(t.dirs.desktop, 'Folder');
    fs.mkdirSync(dir);
    const r = await t.ctl.dropFiles('r1', [txt, dir, lnk], Infinity);
    assert.deepEqual({ moved: r.moved, ignored: r.ignored, notice: r.notice }, { moved: 1, ignored: 2, notice: '2 FILES ARE NOT SHORTCUTS' });
    const one = await t.ctl.dropFiles('r1', [txt], Infinity);
    assert.equal(one.notice, 'NOT A SHORTCUT');
    assert.equal(t.ctl.boxLog.length, 0);
    assert.ok(fs.existsSync(txt) && fs.existsSync(dir));
    const clean = await t.ctl.dropFiles('r1', [t.file('desktop', 'Other.lnk')], Infinity);
    assert.equal(clean.notice, null);
    t.ctl.setTestCap('r1', 1);
    const full = await t.ctl.dropFiles('r1', [txt, t.file('desktop', 'X.lnk')], Infinity);
    assert.deepEqual({ refused: full.refused, notice: full.notice }, { refused: 'full', notice: null });
  } finally { t.done(); }
});

test('B5: moving unavailable gives the Manager its standing line and tooltips, and the orphan buttons are refused', async () => {
  const t = await make({ readOnly: true });
  try {
    fs.mkdirSync(t.dirs.store, { recursive: true });
    fs.writeFileSync(path.join(t.dirs.store, 'Stray.url'), 'S');
    await t.ctl.refreshMoves();
    const m = t.ctl.managerState().moved;
    assert.equal(m.available, false);
    assert.equal(m.unavailableText, 'Moving is unavailable.');
    assert.deepEqual(m.tips, {
      moveAllBack: 'Move every moved shortcut back to the desktop', noneToMoveBack: 'No shortcuts to move back.', unavailable: 'Moving is unavailable.',
      addBack: 'Add this shortcut to “QUICK.LAUNCH”', moveToDesktop: 'Move this shortcut to the desktop',
    });
    assert.deepEqual(m.orphans.map((o) => [o.name, o.fileName]), [['Stray', 'Stray.url']]);
    assert.deepEqual(await t.ctl.orphanAction('add', m.orphans[0].file), { ok: false, unavailable: true });
    assert.deepEqual(await t.ctl.orphanAction('desktop', m.orphans[0].file), { ok: false, unavailable: true });
    assert.ok(fs.existsSync(path.join(t.dirs.store, 'Stray.url')));
    const t2 = await make();
    try { assert.equal(t2.ctl.managerState().moved.unavailableText, null); } finally { t2.done(); }
  } finally { t.done(); }
});

test('B1: a file without a tile that cannot go to the desktop names where it still is', async () => {
  const t = await make();
  try {
    fs.mkdirSync(t.dirs.store, { recursive: true });
    const stray = path.join(t.dirs.store, 'Stray.lnk');
    fs.writeFileSync(stray, 'S');
    await t.ctl.refreshMoves();
    const release = lockRead(stray);
    let r;
    try { r = await t.ctl.orphanAction('desktop', stray); } finally { release(); }
    assert.equal(r.ok, false);
    assert.deepEqual([t.ctl.boxLog[0].message, t.ctl.boxLog[0].detail],
      ["Couldn't move “Stray” to the desktop. It is still in the QuickLauncher Shortcuts folder.", 'The file is in use.']);
    assert.ok(fs.existsSync(stray));
  } finally { t.done(); }
});

// ── fix pass (UX spec "Addendum — M3 fix pass") ────────────────────────────
test('C1 (M-1): a FILE where the store folder goes: the drop answers with the B1 box and the ruled reason; the .exe still becomes a tile; the next drop, once the file is gone, moves', async () => {
  const t = await make();
  try {
    fs.writeFileSync(t.dirs.store, 'a file in the way');
    const a = t.file('desktop', 'Steam.lnk');
    const b = t.file('desktop', 'Notes.lnk');
    const exe = t.file('desktop', 'Tool.exe');
    const r = await t.ctl.dropFiles('r2', [a, b, exe], 0);
    assert.deepEqual({ moved: r.moved, refs: r.refs, failed: r.failed }, { moved: 0, refs: 1, failed: 2 });
    assert.equal(t.ctl.boxLog.length, 1);
    assert.deepEqual([t.ctl.boxLog[0].message, t.ctl.boxLog[0].detail, t.ctl.boxLog[0].buttons],
      ["Couldn't move 2 shortcuts off the desktop (Steam, Notes). They are still on the desktop.",
        'A file named “QuickLauncher Shortcuts” is in your user folder. Rename or move it, then try again.', ['OK']]);
    assert.ok(t.pushed('r2').slice(-1)[0].some((x) => x.name === 'Tool'), 'the .exe tile arrived');
    assert.ok(fs.existsSync(a) && fs.existsSync(b));
    fs.renameSync(t.dirs.store, path.join(t.dirs.profile, 'moved-aside'));
    const r2 = await t.ctl.dropFiles('r2', [a], 0);
    assert.deepEqual({ moved: r2.moved, failed: r2.failed }, { moved: 1, failed: 0 });
    assert.equal(t.ctl.boxLog.length, 1, 'no second box');
  } finally { t.done(); }
});

test('C1: OPEN FOLDER when the store folder cannot be made: the box and its reason (only the three), nothing passed to the shell; once it can, it opens', async () => {
  const t = await make();
  try {
    fs.writeFileSync(t.dirs.store, 'a file in the way');
    const o = await t.ctl.openStoreFolder();
    assert.equal(o.ok, false);
    assert.deepEqual(t.ctl.boxLog.map((b) => [b.message, b.detail, b.buttons]), [["Couldn't open the QuickLauncher Shortcuts folder.",
      'A file named “QuickLauncher Shortcuts” is in your user folder. Rename or move it, then try again.', ['OK']]]);
    assert.deepEqual(t.ctl.openedLog, []);
    assert.deepEqual(opened, [], 'the file in the way is never opened');
    fs.renameSync(t.dirs.store, path.join(t.dirs.profile, 'moved-aside'));
    for (const [code, detail] of [['EPERM', 'Access to the QuickLauncher Shortcuts folder was denied. Check its permissions and your security software.'], ['ENOSPC', 'The disk is full.'], ['EIO', '']]) {
      t.ctl.setMoveHook({ stepFault: { at: 'store', code } });
      const n = t.ctl.boxLog.length;
      assert.equal((await t.ctl.openStoreFolder()).ok, false, code);
      assert.deepEqual(t.ctl.boxLog.slice(n).map((b) => [b.message, b.detail]), [["Couldn't open the QuickLauncher Shortcuts folder.", detail]], code);
    }
    assert.deepEqual(t.ctl.openedLog, []);
    t.ctl.setMoveHook({});
    assert.deepEqual(await t.ctl.openStoreFolder(), { ok: true, recorded: true });
    assert.deepEqual(t.ctl.openedLog, [t.dirs.store]);
  } finally { t.done(); }
});

test('C1: the injected store and journal faults (test hooks) give their reasons; a journal fault never names the store folder', async () => {
  const t = await make();
  try {
    const a = t.file('desktop', 'Steam.lnk');
    const cases = [['store', 'ENOSPC', 'The disk is full.'], ['store', 'EIO', 'The disk refused the move.'], ['journal', 'EPERM', 'The disk refused the move.'], ['journal', 'ENOSPC', 'The disk is full.']];
    for (const [at, code, detail] of cases) {
      t.ctl.setMoveHook({ stepFault: { at, code } });
      const n = t.ctl.boxLog.length;
      const r = await t.ctl.dropFiles('r1', [a], Infinity);
      assert.equal(r.failed, 1, `${at} ${code}`);
      assert.deepEqual(t.ctl.boxLog.slice(n).map((b) => [b.message, b.detail]), [["Couldn't move “Steam” off the desktop. It is still on the desktop.", detail]], `${at} ${code}`);
    }
    t.ctl.setMoveHook({});
    assert.equal((await t.ctl.dropFiles('r1', [a], Infinity)).moved, 1);
  } finally { t.done(); }
});

test('C1: a drop is never left unanswered: if the mover throws, one box names the dropped shortcuts that are still there', async () => {
  const t = await make();
  try {
    const a = t.file('desktop', 'Steam.lnk');
    const real = t.ctl.mover.addPaths;
    t.ctl.mover.addPaths = () => Promise.reject(Object.assign(new Error('boom'), { code: 'EBOOM' }));
    let r;
    try { r = await t.ctl.dropFiles('r1', [a, t.file('desktop', 'notes.txt')], Infinity); } finally { t.ctl.mover.addPaths = real; }
    assert.equal(r.failed, 1);
    assert.deepEqual(t.ctl.boxLog.map((b) => [b.message, b.detail]), [["Couldn't move “Steam” off the desktop. It is still on the desktop.", 'The disk refused the move.']]);
  } finally { t.done(); }
});

test('C2: a reference tile on a desktop shortcut dropped on another region: both pages get their items (it left one, arrived in the other as moved); no box, no notice', async () => {
  const t = await make();
  try {
    const f = t.file('desktop', 'Refd.lnk');
    t.data.apps.push({ id: 'refd', name: 'Refd', path: f, iconDataUrl: 'data:,r', regionId: 'r1' });
    const r = await t.ctl.dropFiles('r2', [f], 0);
    assert.deepEqual({ moved: r.moved, refs: r.refs, taken: r.taken, failed: r.failed, notice: r.notice }, { moved: 1, refs: 0, taken: 0, failed: 0, notice: null });
    assert.ok(!t.pushed('r1').slice(-1)[0].some((x) => x.id === 'refd'), 'gone from its old region');
    assert.deepEqual(t.pushed('r2').slice(-1)[0].filter((x) => x.id === 'refd').map((x) => [x.name, x.kind]), [['Refd', 'moved']]);
    assert.equal(t.ctl.boxLog.length, 0);
    // The store file dropped back on r1: the same tile goes there; no file moves.
    const stored = t.data.apps.find((x) => x.id === 'refd').path;
    const r2 = await t.ctl.dropFiles('r1', [stored], 0);
    assert.deepEqual({ moved: r2.moved, refs: r2.refs, taken: r2.taken }, { moved: 0, refs: 0, taken: 1 });
    assert.deepEqual(t.data.apps.filter((x) => x.id === 'refd').map((x) => x.regionId), ['r1']);
    assert.ok(t.pushed('r1').slice(-1)[0].some((x) => x.id === 'refd') && !t.pushed('r2').slice(-1)[0].some((x) => x.id === 'refd'));
    assert.ok(fs.existsSync(stored));
  } finally { t.done(); }
});

test('C2: the data adapter gives the mover the region order', async () => {
  const t = await make();
  try {
    assert.deepEqual(t.ctl.mover.data.regionIds(), ['r1', 'r2']);
    t.data.regions = [t.data.regions[1], t.data.regions[0]];
    assert.deepEqual(t.ctl.mover.data.regionIds(), ['r2', 'r1']);
  } finally { t.done(); }
});

test('D3: moving unavailable: a dropped store file with no tile gets one box, exactly "Moving is unavailable. Nothing was changed.", and nothing changes', async () => {
  const t = await make();
  try {
    const a = t.file('desktop', 'Lost.lnk');
    await t.ctl.dropFiles('r1', [a], Infinity);
    const stored = t.data.apps.find((x) => x.name === 'Lost').path;
    t.data.apps = t.data.apps.filter((x) => x.name !== 'Lost');
    await t.ctl.refreshMoves();
    const before = JSON.stringify(t.data.apps);
    t.ctl.mover.offForTest = true;
    const n = t.ctl.boxLog.length;
    const r = await t.ctl.dropFiles('r2', [stored, t.file('desktop', 'Tool.exe')], 0);
    t.ctl.mover.offForTest = false;
    assert.deepEqual({ ok: r.ok, refused: r.refused, taken: r.taken, refs: r.refs }, { ok: false, refused: 'unavailable', taken: 0, refs: 0 });
    assert.deepEqual(t.ctl.boxLog.slice(n).map((b) => [b.message, b.detail, b.buttons]), [['Moving is unavailable. Nothing was changed.', '', ['OK']]]);
    assert.equal(JSON.stringify(t.data.apps), before);
    assert.deepEqual(t.ctl.managerState().moved.orphans.map((o) => o.name), ['Lost']);
  } finally { t.done(); }
});
