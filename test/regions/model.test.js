'use strict';
// Plain Node: node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../../src/main/regions/model');

const WA = { x: 0, y: 0, width: 3413, height: 928 };
const THEMES = new Set(['cyberpunk', 'matrix', 'tron', 'alien']);
let n = 0;
const ctx = (extra = {}) => ({ workArea: WA, validThemes: THEMES, newId: () => `id-${++n}`, defaultTheme: 'cyberpunk', ...extra });

const legacy = () => ({
  apps: [
    { id: 'a', name: 'One', path: 'shell:AppsFolder\\One', iconDataUrl: 'data:x' },
    { id: 'b', name: 'Two', path: 'C:\\Two.lnk', iconDataUrl: '' },
    { id: 'c', name: 'Three', path: 'steam://rungameid/1', iconDataUrl: '' },
  ],
  settings: {
    iconSize: 72, startWithWindows: true, randomTheme: false, theme: 'matrix',
    windowPosition: { x: 2900, y: 500 }, globalHotkey: 'Ctrl+Space', reducedMotion: false,
    windowSize: { width: 500, height: 400 },
  },
});

test('migration: today\'s grid becomes one Grid region, nothing lost, order kept', () => {
  const input = legacy();
  const before = JSON.stringify(input);
  const r = M.migrate(input, ctx());
  assert.equal(JSON.stringify(input), before, 'input is not modified');
  assert.equal(r.migrated, true);
  assert.equal(r.changed, true);
  assert.equal(r.data.regions.length, 1);
  const reg = r.data.regions[0];
  assert.equal(reg.name, 'QUICK.LAUNCH');
  assert.equal(reg.layout, 'grid');
  assert.equal(reg.icon, 'apps');
  assert.equal(reg.theme, 'matrix');
  assert.deepEqual(reg.rect, { x: 2900, y: 500, width: 500, height: 400 });
  assert.deepEqual(reg.home, WA);
  assert.deepEqual(r.data.apps.map((a) => a.id), ['a', 'b', 'c']);
  assert.ok(r.data.apps.every((a) => a.regionId === reg.id));
  for (const k of ['id', 'name', 'path', 'iconDataUrl']) {
    assert.deepEqual(r.data.apps.map((a) => a[k]), input.apps.map((a) => a[k]), `item field ${k} kept`);
  }
  // Every old setting is kept as it was; three keys are added.
  for (const [k, v] of Object.entries(input.settings)) assert.deepEqual(r.data.settings[k], v, `setting ${k} kept`);
  assert.equal(r.data.settings.matchAll, false);
  assert.equal(r.data.settings.sharedTheme, null);
  assert.equal(r.data.settings.managerBounds, null);
  assert.equal(r.data.regionsVersion, M.REGIONS_VERSION);
});

test('migration with no saved position: bottom-right 20 px from the work area edge (as before)', () => {
  const input = legacy();
  delete input.settings.windowPosition;
  delete input.settings.windowSize;
  const r = M.migrate(input, ctx());
  assert.deepEqual(r.data.regions[0].rect, { x: WA.width - 424 - 20, y: WA.height - 300 - 20, width: 424, height: 300 });
});

test('migration is idempotent: a migrated store comes back unchanged', () => {
  const first = M.migrate(legacy(), ctx()).data;
  const again = M.migrate(first, ctx());
  assert.equal(again.changed, false);
  assert.equal(again.migrated, false);
  assert.deepEqual(again.data, first);
});

test('repair: unknown regionId goes to the primary; bad region fields are fixed', () => {
  const first = M.migrate(legacy(), ctx()).data;
  const broken = structuredClone(first);
  broken.apps[1].regionId = 'gone';
  delete broken.apps[2].regionId;
  broken.regions.push({ id: 'r2', name: 'quick.launch', layout: 'weird', icon: 'nope', theme: 'missing', rect: { x: 'a' } });
  const r = M.migrate(broken, ctx());
  assert.equal(r.migrated, false);
  assert.ok(r.data.apps.every((a) => a.regionId === first.regions[0].id));
  const r2 = r.data.regions[1];
  assert.equal(r2.id, 'r2');
  assert.equal(r2.name, 'Region 1', 'case-insensitive duplicate name renamed');
  assert.equal(r2.layout, 'grid');
  assert.equal(r2.icon, 'apps');
  assert.equal(r2.theme, 'matrix', 'unknown theme falls back to the store theme');
  assert.equal(r2.rect.width, 424);
});

test('downgrade round trip: v1.94.3 strips regionId on save; regions comes back intact', () => {
  const migrated = M.migrate(legacy(), ctx()).data;
  // What v1.94.3 writes after any edit: apps sanitized to 4 fields, other top-level keys kept.
  const downgraded = { ...migrated, apps: migrated.apps.map(({ id, name, path, iconDataUrl }) => ({ id, name, path, iconDataUrl })) };
  const r = M.migrate(downgraded, ctx());
  assert.equal(r.migrated, false);
  assert.equal(r.data.regions[0].id, migrated.regions[0].id);
  assert.ok(r.data.apps.every((a) => a.regionId === migrated.regions[0].id));
});

test('validateName: trim, 24 max, unique ignoring case, errors from the spec', () => {
  const regs = [{ id: '1', name: 'QUICK.LAUNCH' }, { id: '2', name: 'Games' }];
  assert.deepEqual(M.validateName('  ', regs, '2'), { ok: false, error: 'Enter a name.' });
  assert.deepEqual(M.validateName('quick.launch', regs, '2'), { ok: false, error: 'That name is used.' });
  assert.deepEqual(M.validateName(' games ', regs, '2'), { ok: true, name: 'games' }, 'own name in another case is fine');
  assert.equal(M.validateName('x'.repeat(40), regs, '2').name.length, 24);
});

test('nextDefaultName: smallest unused number', () => {
  assert.equal(M.nextDefaultName([{ name: 'QUICK.LAUNCH' }]), 'Region 1');
  assert.equal(M.nextDefaultName([{ name: 'Region 1' }, { name: 'region 3' }]), 'Region 2');
});

test('effectiveTheme: shared while Match all is on, own otherwise (Q2 revert)', () => {
  const r = { theme: 'tron' };
  assert.equal(M.effectiveTheme(r, { matchAll: true, sharedTheme: 'alien' }), 'alien');
  assert.equal(M.effectiveTheme(r, { matchAll: false, sharedTheme: 'alien' }), 'tron');
});

test('replaceRegionItems keeps the other regions where they are', () => {
  const apps = [
    { id: 'a', regionId: 'r1' }, { id: 'x', regionId: 'r2' }, { id: 'b', regionId: 'r1' }, { id: 'y', regionId: 'r2' },
  ];
  const out = M.replaceRegionItems(apps, 'r1', [{ id: 'b' }, { id: 'a' }, { id: 'c' }]);
  assert.deepEqual(out.map((a) => a.id), ['b', 'a', 'c', 'x', 'y']);
  assert.ok(out.filter((a) => ['a', 'b', 'c'].includes(a.id)).every((a) => a.regionId === 'r1'));
  const fresh = M.replaceRegionItems(apps, 'r3', [{ id: 'z' }]);
  assert.deepEqual(fresh.map((a) => a.id), ['a', 'x', 'b', 'y', 'z']);
  assert.equal(M.replaceRegionItems(apps, 'r2', []).length, 2);
});

test('moveItem puts the item at the end of the target region', () => {
  const apps = [{ id: 'a', regionId: 'r1' }, { id: 'x', regionId: 'r2' }, { id: 'b', regionId: 'r1' }];
  const out = M.moveItem(apps, 'a', 'r2');
  assert.deepEqual(out.map((a) => `${a.id}:${a.regionId}`), ['x:r2', 'a:r2', 'b:r1']);
  assert.equal(M.moveItem(apps, 'nope', 'r2'), null);
});

test('pickOtherTheme never returns the current theme when another exists', () => {
  for (let i = 0; i < 50; i++) assert.notEqual(M.pickOtherTheme(THEMES, 'tron', Math.random), 'tron');
  assert.equal(M.pickOtherTheme(new Set(['solo']), 'solo'), 'solo');
});

test('deleteConfirmText: spec 3.4 lines, empty region needs no box', () => {
  const reg = { name: 'Games' };
  assert.equal(M.deleteConfirmText(reg, []).needsConfirm, false);
  const t = M.deleteConfirmText(reg, [{}, {}, {}]);
  assert.equal(t.message, 'Delete “Games”?');
  assert.equal(t.detail, '3 shortcuts are removed from QuickLauncher. The apps stay installed.');
  const one = M.deleteConfirmText(reg, [{}]);
  assert.equal(one.detail, '1 shortcut is removed from QuickLauncher. The apps stay installed.');
  const mixed = M.deleteConfirmText(reg, [{ kind: 'moved' }, { kind: 'moved' }, {}]);
  assert.equal(mixed.detail, '2 shortcuts move back to the desktop.\n1 other shortcut is removed from QuickLauncher. The apps stay installed.');
});

// ── M2: between regions ────────────────────────────────────────────────────
test('moveItemTo: lands at the slot among the target\'s items; everything else keeps its order', () => {
  const apps = [
    { id: 'a', regionId: 'r1' }, { id: 'x', regionId: 'r2' }, { id: 'b', regionId: 'r1' },
    { id: 'y', regionId: 'r2' }, { id: 'z', regionId: 'r2' },
  ];
  const ids = (list, r) => list.filter((i) => i.regionId === r).map((i) => i.id);
  assert.deepEqual(ids(M.moveItemTo(apps, 'a', 'r2', 0), 'r2'), ['a', 'x', 'y', 'z'], 'first');
  assert.deepEqual(ids(M.moveItemTo(apps, 'a', 'r2', 2), 'r2'), ['x', 'y', 'a', 'z'], 'middle');
  assert.deepEqual(ids(M.moveItemTo(apps, 'a', 'r2', 3), 'r2'), ['x', 'y', 'z', 'a'], 'after the last');
  assert.deepEqual(ids(M.moveItemTo(apps, 'a', 'r2', 99), 'r2'), ['x', 'y', 'z', 'a'], 'past the end clamps');
  assert.deepEqual(ids(M.moveItemTo(apps, 'a', 'r2', -4), 'r2'), ['a', 'x', 'y', 'z'], 'below 0 clamps');
  const out = M.moveItemTo(apps, 'a', 'r2', 1);
  assert.deepEqual(ids(out, 'r1'), ['b'], 'source keeps the rest in order');
  assert.equal(out.length, apps.length, 'nothing lost or duplicated');
  assert.equal(out.find((i) => i.id === 'a').regionId, 'r2');
  assert.deepEqual(ids(M.moveItemTo(apps, 'b', 'r3', 0), 'r3'), ['b'], 'into an empty region');
  assert.equal(M.moveItemTo(apps, 'nope', 'r2', 0), null);
  assert.equal(apps[0].regionId, 'r1', 'input not modified');
});

test('capacityOf and dropDecision: Grid takes any number; a full Fan or Ring, the source, or nothing is refused', () => {
  assert.equal(M.capacityOf('grid'), Infinity);
  assert.equal(M.capacityOf('fan'), 10);
  assert.equal(M.capacityOf('ring'), 12);
  assert.deepEqual(M.dropDecision({ target: null }), { ok: false, reason: 'none' });
  assert.equal(M.dropDecision({ target: { id: 'r1', layout: 'grid' }, sourceId: 'r1', count: 0 }).reason, 'self');
  assert.equal(M.dropDecision({ target: { id: 'r2', layout: 'grid' }, sourceId: 'r1', count: 500 }).ok, true);
  const full = M.dropDecision({ target: { id: 'r2', layout: 'ring' }, sourceId: 'r1', count: 12 });
  assert.deepEqual([full.ok, full.reason, full.text], [false, 'full', 'FULL (12 max)']);
  assert.equal(M.dropDecision({ target: { id: 'r2', layout: 'fan' }, sourceId: 'r1', count: 9 }).ok, true);
  assert.equal(M.dropDecision({ target: { id: 'r2', layout: 'fan' }, sourceId: 'r1', count: 10 }).text, 'FULL (10 max)');
  assert.equal(M.dropDecision({ target: { id: 'r2', layout: 'grid' }, sourceId: 'r1', count: 3, cap: 3 }).reason, 'full', 'explicit cap');
});
