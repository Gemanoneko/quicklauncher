'use strict';
// Real files + native no-replace moves/Windows identities, isolated from all
// user data. No Electron launch, registry, shortcut execution or shell calls.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Backup, validate } = require('../../src/main/backup');
const { Mover } = require('../../src/main/moves/mover');
const win32 = require('../../src/main/moves/win32');
const clone = x => JSON.parse(JSON.stringify(x));

function setup(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ql-backup-'));
  const folders = { desktop: path.join(root, 'Desktop'), publicDesktop: path.join(root, 'Public Desktop'), store: path.join(root, 'QuickLauncher Shortcuts') };
  const profile = path.join(root, 'profile');
  for (const p of [...Object.values(folders), profile]) fs.mkdirSync(p);
  const region = { id: 'region-1', name: 'Apps', icon: 'apps', layout: 'grid', theme: 'cyberpunk', rect: { x: 30, y: 40, width: 424, height: 300 }, home: { x: 0, y: 0, width: 1920, height: 1040 } };
  const empty = () => ({ apps: [], regions: [clone(region)], regionsVersion: 1, settings: { iconSize: 64, regionTransparency: 0, randomTheme: true, globalHotkey: null, startWithWindows: false, sortShortcuts: false } });
  const store = { dataPath: path.join(profile, 'quicklauncher-data.json'), data: empty(),
    isReadOnly: () => false, flush: () => true, failCommit: false,
    replaceData(d) { if (this.failCommit) { this.failCommit = false; return false; } this.data = clone(d); fs.writeFileSync(this.dataPath, JSON.stringify(d)); return true; } };
  store.replaceData(store.data);
  const file = path.join(folders.store, 'Game.url');
  const content = Buffer.from('[InternetShortcut]\r\nURL=steam://rungameid/123\r\n');
  fs.writeFileSync(file, content);
  store.data.apps.push({ id: 'game-1', name: 'My custom game', path: file, kind: 'moved', regionId: region.id,
    origin: path.join(folders.desktop, 'Game.url'), fileIdentity: win32.fileIdentity(file), iconDataUrl: '' });
  store.data.apps.push({ id: 'reference-1', name: 'Missing app', path: path.join(root, 'missing.exe'), regionId: region.id });
  store.replaceData(store.data);
  const make = step => new Backup({ store, folders, win32, validThemes: new Set(['cyberpunk']), step });
  const backup = make();
  const archive = path.join(root, 'setup.qlbackup');
  // Only test-created files under the returned mkdtemp root are removed.
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { root, folders, profile, region, empty, store, file, content, make, backup, archive };
}

test('uninstall → fresh setup → import twice reclaims one physical shortcut and restores exact layout/settings/order', async t => {
  const f = setup(t), before = clone(f.store.data);
  await f.backup.exportTo(f.archive);
  const mover = new Mover({ folders: f.folders, journalDir: f.profile, win32,
    data: { apps: () => f.store.data.apps, commit: apps => f.store.replaceData({ ...f.store.data, apps }), writable: () => true,
      regionExists: id => id === f.region.id, primaryId: () => f.region.id, capOf: () => Infinity } });
  await mover.init();
  assert.equal((await mover.restoreAll()).remaining.length, 0);
  const desktopFile = path.join(f.folders.desktop, 'Game.url');
  assert.equal(fs.existsSync(desktopFile), true);
  f.store.replaceData(f.empty());
  const preview = await f.backup.preview(f.archive);
  assert.equal(preview.missing, 1);
  assert.equal(preview.reclaimed, 1);
  await f.backup.importFrom(f.archive, preview.token);
  assert.deepEqual(f.store.data.regions, before.regions);
  assert.deepEqual(f.store.data.settings, before.settings);
  assert.deepEqual(f.store.data.apps.map(a => [a.id, a.name, a.path]), before.apps.map(a => [a.id, a.name, a.path]));
  assert.equal(fs.existsSync(desktopFile), false);
  assert.deepEqual(fs.readFileSync(f.file), f.content);
  assert.deepEqual(f.store.data.apps[0].fileIdentity, win32.fileIdentity(f.file));
  await f.backup.importFrom(f.archive);
  assert.equal(f.store.data.apps.length, 2);
  assert.deepEqual(fs.readdirSync(f.folders.store), ['Game.url']);
  assert.equal(fs.existsSync(desktopFile), false);
});

test('a unique renamed returned desktop shortcut is moved instead of copied', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive);
  const renamed = path.join(f.folders.desktop, 'Renamed.url'); fs.renameSync(f.file, renamed); f.store.replaceData(f.empty());
  await f.backup.importFrom(f.archive);
  assert.equal(fs.existsSync(renamed), false);
  assert.deepEqual(fs.readFileSync(f.file), f.content);
  assert.equal(f.store.data.apps[0].origin, renamed);
});

test('missing managed file recreates once from embedded bytes with a new valid identity', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive); fs.unlinkSync(f.file); f.store.replaceData(f.empty());
  await f.backup.importFrom(f.archive); await f.backup.importFrom(f.archive);
  assert.deepEqual(fs.readdirSync(f.folders.store), ['Game.url']);
  assert.deepEqual(f.store.data.apps[0].fileIdentity, win32.fileIdentity(f.file));
});

test('changed same-name shortcut refuses unchanged; known bad payload is detected', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive); fs.unlinkSync(f.file); f.store.replaceData(f.empty());
  const p = path.join(f.folders.desktop, 'Game.url'); fs.writeFileSync(p, 'different target'); const before = clone(f.store.data);
  await assert.rejects(f.backup.importFrom(f.archive), /conflicts/);
  assert.deepEqual(f.store.data, before); assert.equal(fs.readFileSync(p, 'utf8'), 'different target'); assert.equal(fs.existsSync(f.file), false);
});

test('multiple matching physical files refuse without deleting either', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive); const p = path.join(f.folders.desktop, 'Copy.url'); fs.copyFileSync(f.file, p);
  await assert.rejects(f.backup.importFrom(f.archive), /duplicate/);
  assert.equal(fs.existsSync(f.file), true); assert.equal(fs.existsSync(p), true);
});

test('unrelated invalid desktop shortcuts do not block import', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive); const unrelated = path.join(f.folders.desktop, 'Unrelated.url'); fs.writeFileSync(unrelated, '');
  await f.backup.importFrom(f.archive); assert.equal(fs.statSync(unrelated).size, 0);
});

test('current extra moved shortcut returns to desktop during replacement', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive); const extra = path.join(f.folders.store, 'Extra.lnk'); fs.writeFileSync(extra, 'other-shortcut');
  f.store.data.apps.push({ id: 'extra', name: 'Extra', path: extra, origin: path.join(f.folders.desktop, 'Extra.lnk'), kind: 'moved', regionId: f.region.id, fileIdentity: win32.fileIdentity(extra) });
  await f.backup.importFrom(f.archive);
  assert.equal(fs.readFileSync(path.join(f.folders.desktop, 'Extra.lnk'), 'utf8'), 'other-shortcut'); assert.equal(fs.existsSync(extra), false);
  assert.equal(f.store.data.apps.length, 2);
});

test('preview token refuses a later setup edit', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive); const p = await f.backup.preview(f.archive); f.store.data.settings.iconSize = 72;
  await assert.rejects(f.backup.importFrom(f.archive, p.token), /setup changed/); assert.equal(f.store.data.settings.iconSize, 72);
});

test('malformed, newer, tampered, traversal, duplicate and invalid settings backups fail validation', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive); const b = JSON.parse(fs.readFileSync(f.archive));
  for (const mutate of [x => x.version++, x => x.files[0].sha256 = '0'.repeat(64), x => x.files[0].name = '../bad.url',
    x => x.data.apps.push(clone(x.data.apps[0])), x => x.data.settings.globalHotkey = {},
    x => x.data.settings.managerBounds = { x: 0, y: 0, width: 1e308, height: 400 }, x => x.data.regions[0].rowWidth = -3,
    x => x.files = [], x => Object.defineProperty(x.data.settings, '__proto__', { value: {}, enumerable: true })]) {
    const bad = clone(b); mutate(bad); assert.throws(() => validate(bad, new Set(['cyberpunk'])));
  }
  fs.writeFileSync(f.archive, '{truncated'); await assert.rejects(f.backup.preview(f.archive), /could not be read/);
});

test('export refuses missing managed file and preserves an existing complete backup', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive); const original = fs.readFileSync(f.archive); fs.unlinkSync(f.file);
  await assert.rejects(f.backup.exportTo(f.archive)); assert.deepEqual(fs.readFileSync(f.archive), original);
});

test('store commit failure rolls desktop move back and keeps original setup', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive); const p = path.join(f.folders.desktop, 'Game.url'); fs.renameSync(f.file, p); f.store.replaceData(f.empty());
  const before = clone(f.store.data); f.store.failCommit = true;
  await assert.rejects(f.backup.importFrom(f.archive), /could not be saved/);
  assert.deepEqual(f.store.data, before); assert.equal(fs.existsSync(p), true); assert.equal(fs.existsSync(f.file), false);
  assert.equal(fs.existsSync(f.backup.journalPath), false);
});

test('interrupted move rolls back on next startup; committed import finishes instead', async t => {
  for (const crashAt of ['moved', 'committed']) {
    const f = setup(t); await f.backup.exportTo(f.archive); const p = path.join(f.folders.desktop, 'Game.url'); fs.renameSync(f.file, p); f.store.replaceData(f.empty());
    const crashing = f.make(step => { if (step === crashAt) { const e = new Error('crash'); e.simulatedCrash = true; throw e; } });
    await assert.rejects(crashing.importFrom(f.archive), /crash/);
    const r = f.make().recover(); assert.equal(r.committed, crashAt === 'committed');
    assert.equal(fs.existsSync(f.file), crashAt === 'committed'); assert.equal(fs.existsSync(p), crashAt !== 'committed');
  }
});

test('cleanup error after commit still requests restart and remains recoverable', async t => {
  const f = setup(t); await f.backup.exportTo(f.archive);
  const original = f.backup._finish; f.backup._finish = () => { throw new Error('cleanup denied'); };
  const result = await f.backup.importFrom(f.archive); assert.equal(result.restart, true); assert.equal(result.recoveryPending, true);
  f.backup._finish = original; assert.equal(f.backup.recover().committed, true);
});

test('cross-region reference tiles are preserved without copying physical files', async t => {
  const f = setup(t); f.store.data.regions.push({ ...clone(f.region), id: 'region-2', name: 'Other' });
  f.store.data.apps.push({ ...clone(f.store.data.apps[1]), id: 'reference-2', regionId: 'region-2' });
  await f.backup.exportTo(f.archive); await f.backup.importFrom(f.archive); await f.backup.importFrom(f.archive);
  assert.equal(f.store.data.apps.filter(a => a.id.startsWith('reference-')).length, 2);
  assert.deepEqual(fs.readdirSync(f.folders.store), ['Game.url']);
});

test('real Fan half-pixel pivot anchor survives export/import exactly', async t => {
  const f = setup(t);
  const radial = require('../../src/renderer/radial-layout');
  const g = radial.geometry('fan', 2, 64);
  const region = f.store.data.regions[0];
  region.layout = 'fan';
  region.radialAnchor = { x: region.rect.x + g.pivot.x, y: region.rect.y + g.pivot.y };
  assert.equal(Number.isInteger(region.radialAnchor.x), false, 'positive control: real geometry produces a fractional anchor');
  const expected = clone(region);
  await f.backup.exportTo(f.archive); f.store.replaceData(f.empty()); await f.backup.importFrom(f.archive);
  assert.deepEqual(f.store.data.regions[0], expected);
});

test('newly recreated shortcut rolls back after commit failure or interrupted promotion', async t => {
  for (const crash of [false, true]) {
    const f = setup(t); await f.backup.exportTo(f.archive); fs.unlinkSync(f.file); f.store.replaceData(f.empty());
    if (!crash) f.store.failCommit = true;
    const b = crash ? f.make(step => { if (step === 'moved') { const e = new Error('crash'); e.simulatedCrash = true; throw e; } }) : f.backup;
    await assert.rejects(b.importFrom(f.archive));
    if (crash) assert.equal(f.make().recover().committed, false);
    assert.deepEqual(fs.readdirSync(f.folders.store), []); assert.equal(f.store.data.apps.length, 0);
    assert.equal(fs.existsSync(f.backup.journalPath), false);
  }
});
