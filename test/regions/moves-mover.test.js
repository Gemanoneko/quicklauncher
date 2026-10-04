'use strict';
// Plain Node: node --test test/
// The safe file move (tech plan § 3) on REAL files: every test builds its own
// fake Desktop, Public Desktop, store folder and profile inside the temp
// folder (QL_TEST_TMP, else os.tmpdir(); refused anywhere else) and runs the
// real mover with the real MoveFileExW through koffi. Locks are real
// (CreateFileW share modes), access denied is a real deny ACE (removed
// afterwards), a placeholder is a real FILE_ATTRIBUTE_OFFLINE. A crash is a
// hook that throws at a step; a fresh mover on the same disk state then
// reconciles. Nothing is deleted: the folders stay in the temp folder.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const koffi = require('koffi');
const win32 = require('../../src/main/moves/win32');
const R = require('../../src/main/moves/rules');
const { Mover } = require('../../src/main/moves/mover');

const BASE = path.resolve(process.env.QL_TEST_TMP || os.tmpdir());
const temps = [os.tmpdir(), process.env.TEMP, process.env.TMP].filter(Boolean).map((p) => fs.realpathSync.native(p));
const baseReal = (() => { fs.mkdirSync(BASE, { recursive: true }); return fs.realpathSync.native(BASE); })();
if (!temps.some((t) => R.isInside(t, baseReal) || R.samePath(t, baseReal))) throw new Error(`moves-mover.test refuses to run outside the temp folder: ${baseReal}`);
const ROOT = path.join(baseReal, 'ql-m3-unit', `${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}-${process.pid}`);

const k32 = koffi.load('kernel32.dll');
const CreateFileW = k32.func('intptr __stdcall CreateFileW(str16 name, uint32 access, uint32 share, intptr sa, uint32 disp, uint32 flags, intptr tmpl)');
const CloseHandle = k32.func('int __stdcall CloseHandle(intptr h)');
const SetFileAttributesW = k32.func('int __stdcall SetFileAttributesW(str16 name, uint32 attrs)');
const lock = (p, share) => { const h = CreateFileW(p, 0x80000000, share, 0, 3, 0x80, 0); assert.ok(h && h !== -1, `lock ${p}`); return () => CloseHandle(h); };
const SHARE_NONE = 0;
const SHARE_READ = 1;

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const exists = (p) => fs.existsSync(p);
class Crash extends Error {}

let seq = 0;
function setup({ apps = [], regions = ['r1', 'r2'], writable = true, caps = {}, steps = {}, fault = null, win = win32 } = {}) {
  const root = path.join(ROOT, `t${++seq}`);
  const dirs = {
    root, desktop: path.join(root, 'Desktop'), publicDesktop: path.join(root, 'Public Desktop'),
    store: path.join(root, 'QuickLauncher Shortcuts'), profile: path.join(root, 'profile'),
  };
  for (const k of ['desktop', 'publicDesktop', 'profile']) fs.mkdirSync(dirs[k], { recursive: true });
  const state = { apps: apps.slice(), regions: regions.slice(), writable, caps, commitOk: true };
  const events = [];
  const reads = [];
  const fsp = { ...fs.promises, readFile: (p, ...a) => { reads.push(String(p)); return fs.promises.readFile(p, ...a); } };
  const data = {
    apps: () => state.apps,
    commit: (a) => { state.apps = a; events.push('commit'); return state.commitOk; },
    regionExists: (id) => state.regions.includes(id),
    primaryId: () => state.regions[0] || null,
    writable: () => state.writable,
    capOf: (id) => (id in state.caps ? state.caps[id] : Infinity),
  };
  const make = (extra = {}) => {
    const m = new Mover({
      folders: { desktop: dirs.desktop, publicDesktop: dirs.publicDesktop, store: dirs.store }, journalDir: dirs.profile, data, win32: win, fsp,
      buildEntry: async (p) => { reads.push(`entry:${p}`); return { name: R.displayName(p), iconDataUrl: 'data:,icon' }; },
      hooks: {
        step: async (name, ctx) => { events.push(name); if (steps[name]) await steps[name](ctx, m); },
        fault: (op, src, dst) => (fault ? fault(op, src, dst) : null),
      },
      log: () => {},
      ...extra,
    });
    m.on('changed', () => { events.push('changed'); pendingAtChanged.push(journalNow()); });
    return m;
  };
  const pendingAtChanged = [];
  const journalNow = () => { try { return JSON.parse(fs.readFileSync(path.join(dirs.profile, 'moves-journal.json'), 'utf8')).entries.length; } catch { return null; } };
  const file = (dir, name, text = `${name} ${Math.random()}`) => { const p = path.join(dirs[dir] || dir, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); return p; };
  const journal = () => { try { return JSON.parse(fs.readFileSync(path.join(dirs.profile, 'moves-journal.json'), 'utf8')).entries; } catch { return null; } };
  const log = () => { try { return fs.readFileSync(path.join(dirs.profile, 'moves-log.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
  return { dirs, state, events, reads, make, file, journal, log, pendingAtChanged };
}

test('sanity: koffi and the real MoveFileExW are in use; every test folder is inside the temp folder', () => {
  assert.equal(win32.available, true);
  assert.equal(win32.MOVE_FLAGS, 0x8, 'MOVEFILE_WRITE_THROUGH only');
  const t = setup();
  assert.ok(temps.some((x) => R.isInside(x, t.dirs.root)), t.dirs.root);
});

test('add: a desktop .lnk and .url move into the store folder in order; intent before the move, commit before done, the tile only after done', async () => {
  const at = {};
  // The first file's state at each step (the second file passes the same steps).
  const t = setup({
    apps: [{ id: 'x1', name: 'X1', path: 'C:\\x1.exe', regionId: 'r1' }, { id: 'x2', name: 'X2', path: 'C:\\x2.exe', regionId: 'r1' }],
    steps: {
      'add:intent': async (ctx) => { at.intent = at.intent || { journal: t.journal(), src: exists(ctx.src), dst: exists(ctx.dst) }; },
      'add:moved': async (ctx) => { at.moved = at.moved || { src: exists(ctx.src), dst: exists(ctx.dst), items: t.state.apps.length }; },
      'add:committed': async () => { at.committed = at.committed || { journal: t.journal().length, items: t.state.apps.length }; },
    },
  });
  const a = t.file('desktop', 'Steam.lnk');
  const b = t.file('desktop', 'Game.url');
  const ha = sha(a);
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [a, b], 1);
  assert.equal(r.refused, null);
  assert.equal(r.added.length, 2);
  assert.deepEqual(r.failures, []);
  // The intent was on disk (with its target) before anything moved.
  assert.equal(at.intent.journal.length, 1);
  assert.equal(at.intent.journal[0].op, 'add');
  assert.equal(at.intent.journal[0].sha256, ha);
  assert.ok(at.intent.src && !at.intent.dst, 'at the intent the file is still on the desktop');
  assert.ok(!at.moved.src && at.moved.dst && at.moved.items === 2, 'moved, not yet committed (2 items, as before the drop)');
  assert.equal(at.committed.items, 3, 'committed: the first new item is in');
  assert.equal(at.committed.journal, 1, 'committed, the intent still pending until done');
  // Event order per file: ... commit, add:committed, changed (after done).
  const ev = t.events.filter((e) => /^add:|commit|changed/.test(e));
  assert.deepEqual(ev, ['add:validated', 'add:intent', 'add:moved', 'commit', 'add:committed', 'changed',
    'add:validated', 'add:intent', 'add:moved', 'commit', 'add:committed', 'changed']);
  assert.deepEqual(t.journal(), [], 'nothing pending');
  assert.deepEqual(t.pendingAtChanged, [0, 0], 'the page hears of each tile only once its journal entry is done');
  assert.deepEqual(t.log().filter((l) => l.state === 'done').length, 2);
  // Files: off the desktop, in the store folder, same bytes; README made.
  const sa = path.join(t.dirs.store, 'Steam.lnk');
  assert.ok(!exists(a) && !exists(b) && exists(sa) && exists(path.join(t.dirs.store, 'Game.url')));
  assert.equal(sha(sa), ha);
  assert.ok(exists(path.join(t.dirs.store, 'README.txt')));
  // Items: at the drop slot, in order, kind moved, origin = where they came from.
  assert.deepEqual(t.state.apps.map((x) => x.name), ['X1', 'Steam', 'Game', 'X2']);
  const s = t.state.apps[1];
  assert.equal(s.kind, 'moved');
  assert.equal(s.path, sa);
  assert.equal(s.origin, fs.realpathSync.native(path.dirname(a)) + path.sep + 'Steam.lnk');
});

test('add: an .exe on the desktop, a nested .lnk and a .lnk elsewhere are references and stay; other files are ignored (Q11, spec 5.2)', async () => {
  const t = setup();
  const exe = t.file('desktop', 'Tool.exe');
  const inner = t.file('desktop', 'Sub\\Inner.lnk');
  const other = t.file(path.join(t.dirs.root, 'Elsewhere'), 'Other.lnk');
  const txt = t.file('desktop', 'notes.txt');
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [exe, inner, other, txt], Infinity);
  assert.equal(r.added.length, 0);
  assert.equal(r.refs.length, 3);
  assert.deepEqual(r.ignored, [txt]);
  assert.ok([exe, inner, other, txt].every(exists), 'nothing moved');
  assert.ok(t.state.apps.every((a) => a.kind === undefined && a.regionId === 'r1'));
  assert.ok(!exists(t.dirs.store), 'no store folder for references');
  assert.deepEqual(t.journal(), null, 'no journal written');
  const again = await m.addPaths('r1', [exe], Infinity);
  assert.equal(again.refs.length, 0, 'a path already in the region is not added twice');
});

test('locked file: unreadable (no sharing) fails before any intent; read-sharing only fails at the move; both read "The file is in use." and stay', async () => {
  const t = setup();
  const a = t.file('desktop', 'Locked.lnk');
  const b = t.file('desktop', 'Shared.lnk');
  const m = t.make();
  await m.init();
  const unlockA = lock(a, SHARE_NONE);
  const unlockB = lock(b, SHARE_READ);
  let r;
  try { r = await m.addPaths('r1', [a, b], Infinity); } finally { unlockA(); unlockB(); }
  assert.equal(r.added.length, 0);
  assert.deepEqual(r.failures.map((f) => [f.name, f.reason]), [['Locked', 'The file is in use.'], ['Shared', 'The file is in use.']]);
  assert.equal(r.failures[1].code, 32, 'ERROR_SHARING_VIOLATION from MoveFileExW');
  assert.ok(exists(a) && exists(b));
  assert.deepEqual(t.journal(), []);
  const aborted = t.log().filter((l) => l.state === 'aborted');
  assert.equal(aborted.length, 1, 'only the one that reached its intent');
  assert.equal(aborted[0].code, 32);
  assert.deepEqual(fs.readdirSync(t.dirs.store).sort(), ['README.txt']);
  const box = R.moveFailedBox(r.failures);
  assert.equal(box.message, "Couldn't move 2 shortcuts off the desktop (Locked, Shared). They are still on the desktop.");
  assert.equal(box.detail, 'The file is in use.');
});

test('existing target: a name already in the store folder gets (2); the file already there is untouched', async () => {
  const t = setup();
  fs.mkdirSync(t.dirs.store, { recursive: true });
  const old = t.file('store', 'Steam.lnk', 'OLD');
  const a = t.file('desktop', 'Steam.lnk', 'NEW');
  const m = t.make();
  await m.init();
  const before = sha(old);
  const r = await m.addPaths('r1', [a], Infinity);
  assert.equal(r.added.length, 1);
  assert.equal(r.added[0].path, path.join(t.dirs.store, 'Steam (2).lnk'));
  assert.equal(sha(old), before);
  assert.equal(fs.readFileSync(path.join(t.dirs.store, 'Steam (2).lnk'), 'utf8'), 'NEW');
});

test('a race on the name: a file appears at the target after the intent; the move takes the next number, nothing is overwritten', async () => {
  let intruder = null;
  const t = setup({ steps: { 'add:intent': async (ctx) => { intruder = ctx.dst; fs.writeFileSync(ctx.dst, 'INTRUDER'); } } });
  const a = t.file('desktop', 'Race.lnk', 'MINE');
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [a], Infinity);
  assert.equal(r.added.length, 1);
  assert.equal(intruder, path.join(t.dirs.store, 'Race.lnk'));
  assert.equal(fs.readFileSync(intruder, 'utf8'), 'INTRUDER', 'the file that appeared is untouched');
  assert.equal(fs.readFileSync(path.join(t.dirs.store, 'Race (2).lnk'), 'utf8'), 'MINE');
  assert.ok(t.log().some((l) => l.state === 'intent-updated' && /Race \(2\)\.lnk$/.test(l.dst)), 'the intent took the new name before the retry');
});

test('cross-volume: MoveFileExW refuses without COPY_ALLOWED (ERROR_NOT_SAME_DEVICE, injected): "The desktop is on a different drive.", the file stays', async () => {
  const t = setup({ fault: (op) => (op === 'add' ? 17 : null) });
  const a = t.file('desktop', 'Far.lnk');
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [a], Infinity);
  assert.deepEqual(r.failures.map((f) => [f.code, f.reason]), [[17, 'The desktop is on a different drive.']]);
  assert.ok(exists(a));
  assert.equal(t.log().find((l) => l.state === 'aborted').code, 17);
});

// A real Public Desktop file: the user may read it but not delete it, and may
// not delete children of the folder. The same ACL on temp files gives the real
// ERROR_ACCESS_DENIED; /reset puts the inherited ACL back afterwards.
const icacls = (args) => spawnSync('icacls', args, { encoding: 'utf8', windowsHide: true }).status;
function readOnlyAcl(f) {
  const user = process.env.USERNAME;
  assert.equal(icacls([f, '/inheritance:r', '/grant:r', `${user}:(RX)`]), 0);
  assert.equal(icacls([path.dirname(f), '/inheritance:r', '/grant:r', `${user}:(RX,W)`]), 0);
  return () => { icacls([path.dirname(f), '/reset']); icacls([f, '/reset']); };
}

test('access denied on the Public Desktop (a real read-only ACL): "Needs administrator rights."; on the user desktop: "Windows denied access to the file."', async () => {
  const t = setup();
  const p = t.file('publicDesktop', 'Zoom.lnk');
  const u = t.file('desktop', 'Mine.lnk');
  const m = t.make();
  await m.init();
  let r;
  const undoP = readOnlyAcl(p);
  const undoU = readOnlyAcl(u);
  try { r = await m.addPaths('r1', [p, u], Infinity); } finally { undoP(); undoU(); }
  assert.deepEqual(r.failures.map((f) => [f.name, f.code, f.reason]), [['Zoom', 5, 'Needs administrator rights.'], ['Mine', 5, 'Windows denied access to the file.']]);
  assert.ok(exists(p) && exists(u));
  assert.ok(fs.readFileSync(p) && fs.readFileSync(u), 'readable again after the reset');
});

test('cloud-only placeholder (a real OFFLINE attribute): refused before the file is read at all; the attribute stays', async () => {
  const t = setup();
  const a = t.file('desktop', 'Cloud.lnk');
  assert.equal(SetFileAttributesW(a, 0x1000 | 0x20), 1);
  const m = t.make();
  await m.init();
  let r;
  try { r = await m.addPaths('r1', [a], Infinity); } finally { /* attribute checked below, then cleared */ }
  const attrs = win32.attributes(a);
  SetFileAttributesW(a, 0x20);
  assert.deepEqual(r.failures.map((f) => [f.code, f.reason]), [[-2, 'The file is online only. Keep it on this device, then try again.']]);
  assert.ok(exists(a));
  assert.ok(attrs & 0x1000, 'still OFFLINE');
  assert.deepEqual(t.reads.filter((x) => x.toLowerCase().includes('cloud.lnk')), [], 'never read');
  assert.equal(t.journal(), null, 'no intent');
});

test('verify: a target that differs from what was hashed is moved back to the desktop and the add is aborted', async () => {
  const t = setup({ steps: { 'add:moved': async (ctx) => { fs.appendFileSync(ctx.dst, 'X'); } } });
  const a = t.file('desktop', 'Changed.lnk', 'ABC');
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [a], Infinity);
  assert.equal(r.added.length, 0);
  assert.equal(r.failures[0].code, -3);
  assert.equal(fs.readFileSync(a, 'utf8'), 'ABCX', 'back on the desktop, its bytes kept');
  assert.ok(!exists(path.join(t.dirs.store, 'Changed.lnk')));
  assert.equal(t.state.apps.length, 0);
  assert.ok(t.log().some((l) => l.state === 'aborted' && l.rolledBack));
});

test('back: to the folder it came from; a name taken there gets (2); the tile goes after the commit', async () => {
  const t = setup();
  const a = t.file('desktop', 'Steam.lnk', 'ORIG');
  const m = t.make();
  await m.init();
  const [item] = (await m.addPaths('r1', [a], Infinity)).added;
  const taken = t.file('desktop', 'Steam.lnk', 'SOMEONE ELSE');
  const r = await m.moveBack([item.id]);
  assert.equal(r.moved.length, 1);
  assert.equal(fs.readFileSync(taken, 'utf8'), 'SOMEONE ELSE');
  assert.equal(fs.readFileSync(path.join(t.dirs.desktop, 'Steam (2).lnk'), 'utf8'), 'ORIG');
  assert.equal(t.state.apps.length, 0);
  assert.deepEqual(t.journal(), []);
  const ev = t.events.filter((e) => /^back:|commit|changed/.test(e));
  assert.deepEqual(ev.slice(-5), ['back:intent', 'back:moved', 'commit', 'back:committed', 'changed']);
});

test('back: the folder it came from is gone, so it goes to the current desktop; a missing file fails and is marked broken', async () => {
  const t = setup();
  fs.mkdirSync(t.dirs.store, { recursive: true });
  const f = t.file('store', 'Old.lnk', 'OLD');
  const g = path.join(t.dirs.store, 'Gone.lnk');
  t.state.apps = [
    { id: 'm1', name: 'Old', path: f, regionId: 'r1', kind: 'moved', origin: path.join(t.dirs.root, 'NoSuchDesk', 'Old.lnk') },
    { id: 'm2', name: 'Gone', path: g, regionId: 'r1', kind: 'moved', origin: path.join(t.dirs.desktop, 'Gone.lnk') },
  ];
  const m = t.make();
  await m.init();
  assert.deepEqual([...m.missing], ['m2'], 'the scan finds the missing file');
  const r = await m.moveBack(['m1', 'm2']);
  assert.equal(r.moved.length, 1);
  assert.equal(fs.readFileSync(path.join(t.dirs.desktop, 'Old.lnk'), 'utf8'), 'OLD');
  assert.deepEqual(r.failures.map((x) => [x.itemId, x.code]), [['m2', 2]]);
  assert.deepEqual(t.state.apps.map((x) => x.id), ['m2'], 'the failed tile stays');
  assert.ok(!exists(path.join(t.dirs.root, 'NoSuchDesk')), 'the gone folder is not re-created');
  const rm = await m.removeMissing('m2');
  assert.equal(rm.ok, true);
  assert.deepEqual(t.state.apps, []);
});

test('moving unavailable (store read-only, or no koffi): a drop with a desktop file changes nothing; references still work', async () => {
  const t = setup({ writable: false });
  const a = t.file('desktop', 'Steam.lnk');
  const exe = t.file('desktop', 'Tool.exe');
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [a, exe], Infinity);
  assert.equal(r.refused, 'unavailable');
  assert.ok(exists(a) && t.state.apps.length === 0 && !exists(t.dirs.store));
  const refsOnly = await m.addPaths('r1', [exe], Infinity);
  assert.equal(refsOnly.refs.length, 1);
  const t2 = setup();
  const b = t2.file('desktop', 'Steam.lnk');
  const m2 = t2.make({ available: false, reason: 'test' });
  await m2.init();
  assert.equal((await m2.addPaths('r1', [b], Infinity)).refused, 'unavailable');
  assert.ok(exists(b));
});

test('a full region refuses the whole drop before anything moves (spec 5.2)', async () => {
  const t = setup({ apps: [{ id: 'x', name: 'X', path: 'C:\\x.exe', regionId: 'r1' }], caps: { r1: 2 } });
  const a = t.file('desktop', 'A.lnk');
  const b = t.file('desktop', 'B.lnk');
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [a, b], Infinity);
  assert.equal(r.refused, 'full');
  assert.ok(exists(a) && exists(b) && t.state.apps.length === 1);
});

// ── crash after each step, then the startup reconcile ─────────────────────
async function crashAt(step, { regionGoneAfter = false } = {}) {
  const t = setup({ steps: { [step]: async () => { throw new Crash(step); } } });
  const a = t.file('desktop', 'Crash.lnk', 'C');
  const m = t.make();
  await m.init();
  let item = null;
  // For a crash on the way back, the add runs first (its own steps do not crash).
  if (step.startsWith('back:')) [item] = (await m.addPaths('r1', [a], Infinity)).added;
  const run = step.startsWith('add:') ? m.addPaths('r1', [a], Infinity) : m.moveBack([item.id]);
  await assert.rejects(run, Crash);
  if (regionGoneAfter) t.state.regions = ['r2'];
  // "Restart": a new mover on the same disk state.
  const m2 = t.make();
  const report = await m2.init();
  return { t, a, item, report, m2 };
}

test('crash after the add intent: reconcile aborts it; the file is still on the desktop, no tile', async () => {
  const { t, a, report } = await crashAt('add:intent');
  assert.deepEqual(report.resolved.map((x) => [x.op, x.outcome]), [['add', 'aborted']]);
  assert.ok(exists(a));
  assert.equal(t.state.apps.length, 0);
  assert.deepEqual(t.journal(), []);
});

test('crash after the add move (before the commit): reconcile finishes the add; one tile, file in the store folder', async () => {
  const { t, a, report } = await crashAt('add:moved');
  assert.deepEqual(report.resolved.map((x) => [x.op, x.outcome, x.note]), [['add', 'done', 'finished the add']]);
  assert.ok(!exists(a));
  assert.equal(t.state.apps.length, 1);
  assert.equal(t.state.apps[0].kind, 'moved');
  assert.equal(t.state.apps[0].path, path.join(t.dirs.store, 'Crash.lnk'));
  assert.ok(R.samePath(path.dirname(t.state.apps[0].origin), fs.realpathSync.native(t.dirs.desktop)));
  assert.deepEqual(t.journal(), []);
});

test('crash after the add move, region deleted meanwhile: the file is listed as a file without a tile', async () => {
  const { t, report, m2 } = await crashAt('add:moved', { regionGoneAfter: true });
  assert.deepEqual(report.resolved.map((x) => [x.op, x.outcome]), [['add', 'aborted']]);
  assert.equal(t.state.apps.length, 0);
  assert.deepEqual(m2.orphans.map((o) => o.name), ['Crash']);
});

test('crash after the add commit (before done): reconcile marks it done; still exactly one tile', async () => {
  const { t, report } = await crashAt('add:committed');
  assert.deepEqual(report.resolved.map((x) => [x.op, x.outcome]), [['add', 'done']]);
  assert.equal(t.state.apps.length, 1);
  assert.deepEqual(t.journal(), []);
});

test('crash after the back intent: reconcile aborts it; the file stays in the store folder with its tile', async () => {
  const { t, report } = await crashAt('back:intent');
  assert.deepEqual(report.resolved.map((x) => [x.op, x.outcome]), [['back', 'aborted']]);
  assert.equal(t.state.apps.length, 1);
  assert.ok(exists(t.state.apps[0].path));
});

test('crash after the back move (before the commit): reconcile finishes the removal; the file is on the desktop', async () => {
  const { t, a, report } = await crashAt('back:moved');
  assert.deepEqual(report.resolved.map((x) => [x.op, x.outcome, x.note]), [['back', 'done', 'finished the removal']]);
  assert.equal(t.state.apps.length, 0);
  assert.ok(exists(a));
});

test('crash after the back commit (before done): reconcile marks it done', async () => {
  const { t, a, report } = await crashAt('back:committed');
  assert.deepEqual(report.resolved.map((x) => [x.op, x.outcome]), [['back', 'done']]);
  assert.equal(t.state.apps.length, 0);
  assert.ok(exists(a));
  assert.deepEqual(t.journal(), []);
});

// ── files without a tile, restore-all ─────────────────────────────────────
test('files without a tile: listed; Add back gives a tile in the first region (origin from the history); Move to desktop is collision-safe', async () => {
  const t = setup();
  const a = t.file('desktop', 'Lost.lnk', 'L');
  const m = t.make();
  await m.init();
  const [item] = (await m.addPaths('r2', [a], Infinity)).added;
  t.state.apps = []; // the tile went (e.g. the data file came from a backup)
  t.file('store', 'Stray.url', 'S');
  t.file('desktop', 'Stray.url', 'ON DESKTOP');
  await m.scan();
  assert.deepEqual(m.orphans.map((o) => o.name).sort(), ['Lost', 'Stray']);
  const add = await m.adoptOrphan(item.path);
  assert.equal(add.ok, true);
  assert.equal(add.item.regionId, 'r1', 'the first region');
  assert.equal(add.item.kind, 'moved');
  assert.ok(R.samePath(add.item.origin, item.origin), 'origin recovered from the history');
  const out = await m.orphanToDesktop(path.join(t.dirs.store, 'Stray.url'));
  assert.equal(out.ok, true);
  assert.equal(fs.readFileSync(path.join(t.dirs.desktop, 'Stray (2).url'), 'utf8'), 'S');
  assert.equal(fs.readFileSync(path.join(t.dirs.desktop, 'Stray.url'), 'utf8'), 'ON DESKTOP');
  assert.deepEqual(m.orphans, []);
});

test('restore-all: every moved file and every file without a tile goes back; a locked one remains and is reported', async () => {
  const t = setup();
  const a = t.file('desktop', 'One.lnk');
  const b = t.file('publicDesktop', 'Two.url');
  const c = t.file('desktop', 'Three.lnk');
  const m = t.make();
  await m.init();
  await m.addPaths('r1', [a, b, c], Infinity);
  t.file('store', 'Orphan.lnk');
  await m.scan();
  const unlock = lock(path.join(t.dirs.store, 'Three.lnk'), SHARE_READ);
  let out;
  try { out = await m.restoreAll(); } finally { unlock(); }
  assert.equal(out.moved, 2);
  assert.equal(out.orphansMoved, 1);
  assert.deepEqual(out.remaining, ['Three.lnk']);
  assert.ok(exists(a) && exists(b) && exists(path.join(t.dirs.desktop, 'Orphan.lnk')));
  assert.ok(exists(path.join(t.dirs.publicDesktop, 'Two.url')), 'back to the Public Desktop it came from');
  const again = await m.restoreAll();
  assert.deepEqual(again.remaining, []);
  assert.ok(exists(c));
});

test('test mode: a moved item whose file lies outside the test folder (copied real data) is never moved; inside it, moves work', async () => {
  const t = setup();
  const outside = path.join(t.dirs.root, '..', `outside-${seq}`);
  fs.mkdirSync(outside, { recursive: true });
  const real = path.join(outside, 'Real.lnk');
  fs.writeFileSync(real, 'a file in some real store folder');
  t.state.apps = [{ id: 'r', name: 'Real', path: real, regionId: 'r1', kind: 'moved', origin: path.join(outside, 'Desk', 'Real.lnk') }];
  const m = t.make({ confineTo: [t.dirs.root] });
  await m.init();
  const r = await m.moveBack(['r']);
  assert.deepEqual(r.failures.map((f) => [f.code, f.why]), [[-4, 'outside the test folder (test mode)']]);
  assert.ok(exists(real), 'left where it is');
  const all = await m.restoreAll();
  assert.equal(all.moved, 0);
  assert.ok(exists(real));
  const a = t.file('desktop', 'Inside.lnk');
  assert.equal((await m.addPaths('r1', [a], Infinity)).added.length, 1, 'moves inside the test folder still work');
});

test('an unreadable journal is set aside (never deleted) and the move still starts', async () => {
  const t = setup();
  fs.writeFileSync(path.join(t.dirs.profile, 'moves-journal.json'), '{ not json');
  const m = t.make();
  await m.init();
  const aside = fs.readdirSync(t.dirs.profile).filter((n) => n.startsWith('moves-journal.json.corrupt-'));
  assert.equal(aside.length, 1);
  assert.equal(fs.readFileSync(path.join(t.dirs.profile, aside[0]), 'utf8'), '{ not json');
  const a = t.file('desktop', 'Ok.lnk');
  assert.equal((await m.addPaths('r1', [a], Infinity)).added.length, 1);
});
