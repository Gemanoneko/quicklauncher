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
function setup({ apps = [], regions = ['r1', 'r2'], writable = true, caps = {}, steps = {}, fault = null, win = win32, fsFault = null } = {}) {
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
  // fsFault(method, path) -> a Node error code to throw instead of the call (fix pass, C1).
  if (fsFault) {
    for (const k of ['mkdir', 'open', 'writeFile', 'rename']) {
      const real = fsp[k];
      fsp[k] = (p, ...a) => { const code = fsFault(k, String(p)); if (code) { const e = new Error(`${code}: injected ${k} '${p}'`); e.code = code; return Promise.reject(e); } return real(p, ...a); };
    }
  }
  const data = {
    apps: () => state.apps,
    commit: (a) => { state.apps = a; events.push('commit'); return state.commitOk; },
    regionExists: (id) => state.regions.includes(id),
    regionIds: () => state.regions.slice(),
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

// ── fix pass (UX spec "Addendum — M3 fix pass") ────────────────────────────
const S = R.STRINGS;
const addIntents = (t) => t.log().filter((l) => l.op === 'add' && l.state === 'intent');

test('C1 (M-1, repro 1): a FILE named "QuickLauncher Shortcuts" in the way: the shortcut fails with the ruled reason, stays, nothing journalled; the .exe still becomes a tile; once the file is gone the next drop moves, no restart', async () => {
  const t = setup();
  fs.writeFileSync(t.dirs.store, 'a file where the store folder goes');
  const a = t.file('desktop', 'Steam.lnk');
  const exe = t.file('desktop', 'Tool.exe');
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [a, exe], Infinity);
  assert.equal(r.refused, null);
  assert.deepEqual(r.failures.map((f) => [f.name, f.reason]), [['Steam', S.reasonStoreBlocked]]);
  assert.deepEqual(r.refs.map((x) => x.name), ['Tool'], 'the .exe needs no store folder');
  assert.ok(exists(a) && fs.statSync(t.dirs.store).isFile(), 'the shortcut stays; the file in the way is untouched');
  assert.deepEqual(addIntents(t), [], 'nothing journalled');
  assert.deepEqual(m.journal.pending(), []);
  // The person moves the file away (the test plays them; nothing is deleted) and drops again.
  fs.mkdirSync(path.join(t.dirs.root, 'Aside'));
  fs.renameSync(t.dirs.store, path.join(t.dirs.root, 'Aside', 'QuickLauncher Shortcuts'));
  const r2 = await m.addPaths('r1', [a], Infinity);
  assert.deepEqual([r2.added.length, r2.failures.length], [1, 0]);
  assert.ok(!exists(a) && exists(path.join(t.dirs.store, 'Steam.lnk')));
});

test('C1 (M-1, repro 2): a denied ACL on a scratch store folder: in the shipped runtime (Electron 32, Node 20) the store step is denied and says so; the file stays', async () => {
  const t = setup();
  fs.mkdirSync(t.dirs.store);
  const a = t.file('desktop', 'Steam.lnk');
  const m = t.make();
  await m.init();
  const user = process.env.USERNAME;
  assert.equal(icacls([t.dirs.store, '/deny', `${user}:(W,AD,WD)`]), 0);
  let r;
  try { r = await m.addPaths('r1', [a], Infinity); } finally { assert.equal(icacls([t.dirs.store, '/remove:d', user]), 0); }
  // Node 20's recursive mkdir fails on the denied folder (EPERM); a newer Node's
  // passes it, and the move itself is then refused (Win32 5).
  const want = process.versions.electron ? [-7, S.reasonStoreDenied] : [5, S.reasonDenied];
  assert.deepEqual(r.failures.map((f) => [f.code, f.reason]), [want], `runtime ${process.version}`);
  assert.ok(exists(a));
  assert.deepEqual(m.journal.pending(), []);
  assert.deepEqual(fs.readdirSync(t.dirs.store).filter((n) => n !== 'README.txt'), [], 'nothing reached the store folder');
});

test('C1: a store folder that cannot be made in a denied profile folder (both runtimes): the folder reason', async () => {
  const t = setup();
  const a = t.file('desktop', 'Steam.lnk');
  const m = t.make();
  await m.init();
  const user = process.env.USERNAME;
  assert.equal(icacls([t.dirs.root, '/deny', `${user}:(AD)`]), 0); // this folder only: no new subfolder in it
  let r;
  try { r = await m.addPaths('r1', [a], Infinity); } finally { assert.equal(icacls([t.dirs.root, '/remove:d', user]), 0); }
  assert.deepEqual(r.failures.map((f) => [f.code, f.reason]), [[-7, S.reasonStoreDenied]]);
  assert.ok(exists(a) && !exists(t.dirs.store));
  assert.deepEqual(addIntents(t), []);
});

test('C1: a full disk at the store step says so; any other store error is the catch-all; a journal that cannot be written never names the store folder', async () => {
  let fault = null;
  const t = setup({ fsFault: (k, p) => (fault && fault(k, p)) || null });
  const a = t.file('desktop', 'Steam.lnk');
  const m = t.make();
  await m.init();
  const isStore = (k, p) => k === 'mkdir' && R.samePath(p, t.dirs.store);
  const isJournal = (k, p) => k === 'open' && /moves-journal\.json\.tmp$/i.test(p);
  const cases = [
    ['store ENOSPC', (k, p) => (isStore(k, p) ? 'ENOSPC' : null), S.reasonDiskFull],
    ['store EIO', (k, p) => (isStore(k, p) ? 'EIO' : null), S.reasonDisk],
    ['journal ENOSPC', (k, p) => (isJournal(k, p) ? 'ENOSPC' : null), S.reasonDiskFull],
    ['journal EIO', (k, p) => (isJournal(k, p) ? 'EIO' : null), S.reasonDisk],
    ['journal EPERM', (k, p) => (isJournal(k, p) ? 'EPERM' : null), S.reasonDisk],
    ['journal EEXIST', (k, p) => (isJournal(k, p) ? 'EEXIST' : null), S.reasonDisk],
  ];
  for (const [label, f, reason] of cases) {
    fault = f;
    const r = await m.addPaths('r1', [a], Infinity);
    assert.deepEqual(r.failures.map((x) => x.reason), [reason], label);
    assert.ok(exists(a), `${label}: the file stays`);
    assert.deepEqual(m.journal.pending(), [], `${label}: no intent is left pending`);
  }
  assert.deepEqual(addIntents(t), [], 'no intent ever reached the history');
  fault = null;
  const r = await m.addPaths('r1', [a], Infinity);
  assert.equal(r.added.length, 1, 'the next drop tries again and moves');
});

test('C2 (m-1): a reference tile on a desktop shortcut takes the drop: the file moves and the same tile becomes moved, keeping its name and icon, at the dropped slot; on another region it leaves its old one', async () => {
  const t = setup();
  const f = t.file('desktop', 'Refd.lnk');
  t.state.apps = [
    { id: 'x1', name: 'X1', path: 'C:\\x1.exe', regionId: 'r1' },
    { id: 'ref', name: 'My Refd', path: f, iconDataUrl: 'data:,old', regionId: 'r1' },
    { id: 'y1', name: 'Y1', path: 'C:\\y1.exe', regionId: 'r2' },
  ];
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [f], 0);
  assert.deepEqual([r.added.length, r.refs.length, r.failures.length], [1, 0, 0]);
  const it = t.state.apps.find((a) => a.id === 'ref');
  assert.deepEqual([it.kind, it.name, it.iconDataUrl, it.regionId], ['moved', 'My Refd', 'data:,old', 'r1']);
  assert.ok(R.samePath(it.path, path.join(t.dirs.store, 'Refd.lnk')) && !exists(f));
  assert.deepEqual(t.state.apps.map((a) => a.id), ['ref', 'x1', 'y1'], 'one tile, at the slot');
  assert.equal(t.log().find((l) => l.op === 'add' && l.state === 'intent').convert, true);
  assert.deepEqual(t.journal(), []);
  // The same with a second reference tile, dropped on the other region.
  const g = t.file('desktop', 'Other.lnk');
  t.state.apps.push({ id: 'ref2', name: 'Other', path: g, iconDataUrl: 'data:,o', regionId: 'r1' });
  const r2 = await m.addPaths('r2', [g], 0);
  assert.equal(r2.added.length, 1);
  assert.deepEqual(t.state.apps.filter((a) => a.regionId === 'r2').map((a) => [a.id, a.kind || 'ref']), [['ref2', 'moved'], ['y1', 'ref']]);
  assert.ok(!t.state.apps.some((a) => a.regionId === 'r1' && a.id === 'ref2'), 'none left in the old region');
  assert.equal(t.state.apps.length, 4);
});

test('C2: if the move fails, the reference tile stays exactly where it was and keeps working', async () => {
  const t = setup({ fault: (op) => (op === 'add' ? 32 : null) });
  const f = t.file('desktop', 'Refd.lnk');
  t.state.apps = [{ id: 'x1', name: 'X1', path: 'C:\\x1.exe', regionId: 'r1' }, { id: 'ref', name: 'Refd', path: f, regionId: 'r1' }];
  const before = JSON.stringify(t.state.apps);
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r2', [f], 0);
  assert.deepEqual(r.failures.map((x) => [x.name, x.reason]), [['Refd', S.reasonInUse]]);
  assert.equal(JSON.stringify(t.state.apps), before);
  assert.ok(exists(f));
});

test('C2 (m-3): a store file a moved tile owns, dropped on another region: that tile goes there, no file moves; onto its own region it is a reorder; ↩ still returns it to its own origin', async () => {
  const t = setup();
  const a = t.file('desktop', 'Twice.lnk', 'T');
  const m = t.make();
  await m.init();
  t.state.apps = [{ id: 'y1', name: 'Y1', path: 'C:\\y1.exe', regionId: 'r2' }];
  const [moved] = (await m.addPaths('r1', [a], Infinity)).added;
  const sf = moved.path;
  const h = sha(sf);
  const r = await m.addPaths('r2', [sf], 0);
  assert.deepEqual([r.taken.length, r.added.length, r.refs.length, r.failures.length], [1, 0, 0, 0]);
  assert.deepEqual(t.state.apps.map((x) => [x.id, x.regionId]), [[moved.id, 'r2'], ['y1', 'r2']]);
  assert.ok(exists(sf) && sha(sf) === h && !exists(a), 'no file moved');
  // Onto its own region: a reorder (the slot index counts the tile itself).
  await m.addPaths('r2', [sf], 2);
  assert.deepEqual(t.state.apps.map((x) => x.id), ['y1', moved.id]);
  const back = await m.moveBack([moved.id]);
  assert.equal(back.moved.length, 1);
  assert.equal(fs.readFileSync(a, 'utf8'), 'T', 'back at its own origin');
  assert.deepEqual(t.state.apps.map((x) => x.id), ['y1']);
});

test('C2: a store file with no tile gets a moved tile at the dropped slot (origin from the history) and leaves "files without a tile"; no file moves', async () => {
  const t = setup();
  const a = t.file('desktop', 'Lost.lnk', 'L');
  const m = t.make();
  await m.init();
  const [item] = (await m.addPaths('r1', [a], Infinity)).added;
  t.state.apps = [{ id: 'y1', name: 'Y1', path: 'C:\\y1.exe', regionId: 'r2' }];
  await m.scan();
  assert.deepEqual(m.orphans.map((o) => o.name), ['Lost']);
  const r = await m.addPaths('r2', [item.path], 0);
  assert.deepEqual([r.taken.length, r.refs.length], [1, 0]);
  const it = t.state.apps[0];
  assert.deepEqual([it.regionId, it.kind, it.name], ['r2', 'moved', 'Lost']);
  assert.ok(R.samePath(it.origin, item.origin) && R.samePath(it.path, item.path));
  assert.deepEqual(m.orphans, []);
  await m.scan();
  assert.deepEqual(m.orphans, [], 'still owned after a rescan');
  assert.ok(exists(item.path) && !exists(a));
});

test('C2: a tile already in the dropped region adds nothing to the count (never FULL); a new file at the cap is still FULL', async () => {
  const t = setup({ caps: { r1: 2 } });
  const f = t.file('desktop', 'Refd.lnk');
  const n = t.file('desktop', 'New.lnk');
  t.state.apps = [{ id: 'x1', name: 'X1', path: 'C:\\x1.exe', regionId: 'r1' }, { id: 'ref', name: 'Refd', path: f, regionId: 'r1' }];
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [f], 0);
  assert.equal(r.refused, null);
  assert.deepEqual(t.state.apps.map((a) => [a.id, a.kind || 'ref']), [['ref', 'moved'], ['x1', 'ref']]);
  const r2 = await m.addPaths('r1', [n], 0);
  assert.equal(r2.refused, 'full');
  assert.ok(exists(n));
});

test('C2: several tiles on one file: the one in the dropped region takes it, else the first in region order; the others stay references', async () => {
  const t = setup({ regions: ['r1', 'r2', 'r3'] });
  const f = t.file('desktop', 'Dup.lnk');
  t.state.apps = [{ id: 'in2', name: 'Dup', path: f, regionId: 'r2' }, { id: 'in1', name: 'Dup', path: f, regionId: 'r1' }];
  const m = t.make();
  await m.init();
  await m.addPaths('r2', [f], 0);
  assert.deepEqual(t.state.apps.map((a) => [a.id, a.regionId, a.kind || 'ref']).sort(), [['in1', 'r1', 'ref'], ['in2', 'r2', 'moved']]);
  // Region order, not list order: on a region with none, r1's tile is the one (the flat list has r2's first).
  const g = t.file('desktop', 'Dup2.lnk');
  t.state.apps = [{ id: 'b2', name: 'Dup2', path: g, regionId: 'r2' }, { id: 'b1', name: 'Dup2', path: g, regionId: 'r1' }];
  await m.addPaths('r3', [g], 0);
  assert.deepEqual(t.state.apps.map((a) => [a.id, a.regionId, a.kind || 'ref']).sort(), [['b1', 'r3', 'moved'], ['b2', 'r2', 'ref']]);
});

test('C2: the slot index: a tile from before the slot in its own region lands at the slot; the next file of the drop goes right after it', async () => {
  const t = setup();
  const a = t.file('desktop', 'T.lnk');
  const m = t.make();
  await m.init();
  const [tt] = (await m.addPaths('r1', [a], Infinity)).added;
  t.state.apps = [{ id: 'A', path: 'C:\\a.exe', regionId: 'r1' }, tt, { id: 'B', path: 'C:\\b.exe', regionId: 'r1' }, { id: 'C', path: 'C:\\c.exe', regionId: 'r1' }];
  await m.addPaths('r1', [tt.path], 3); // the slot between B and C, as the page counts it (T included)
  assert.deepEqual(t.state.apps.map((x) => x.id), ['A', 'B', tt.id, 'C']);
  const x = t.file('desktop', 'X.lnk');
  const r = await m.addPaths('r1', [tt.path, x], 1);
  const xid = r.added[0].id;
  assert.deepEqual(t.state.apps.map((i) => i.id), ['A', tt.id, xid, 'B', 'C']);
});

test('C2: a reference to a file outside the desktops and the store folder is unchanged: one per region, another region gets its own', async () => {
  const t = setup();
  const exe = t.file('desktop', 'Tool.exe');
  const other = t.file(path.join(t.dirs.root, 'Elsewhere'), 'Other.lnk');
  t.state.apps = [{ id: 'e1', name: 'Tool', path: exe, regionId: 'r1' }, { id: 'o1', name: 'Other', path: other, regionId: 'r1' }];
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r2', [exe, other], 0);
  assert.equal(r.refs.length, 2);
  assert.deepEqual(t.state.apps.map((a) => a.regionId).sort(), ['r1', 'r1', 'r2', 'r2']);
  const r1 = await m.addPaths('r1', [exe], 0);
  assert.equal(r1.refs.length, 0, 'already a tile here: nothing added (as before)');
});

async function crashConvert(step) {
  const t = setup({ steps: { [step]: async () => { throw new Crash(step); } } });
  const f = t.file('desktop', 'Refd.lnk', 'R');
  t.state.apps = [{ id: 'ref', name: 'My Refd', path: f, iconDataUrl: 'data:,old', regionId: 'r1' }];
  const m = t.make();
  await m.init();
  await assert.rejects(m.addPaths('r2', [f], 0), Crash);
  const m2 = t.make();
  const report = await m2.init();
  return { t, f, report };
}

test('C2: a crash after the move of a conversion: the reconcile makes the reference tile the moved tile (one tile, its name, the dropped region)', async () => {
  const { t, f, report } = await crashConvert('add:moved');
  assert.deepEqual(report.resolved.map((x) => [x.op, x.outcome, x.note]), [['add', 'done', 'finished the conversion']]);
  assert.equal(t.state.apps.length, 1);
  const it = t.state.apps[0];
  assert.deepEqual([it.id, it.name, it.kind, it.regionId, it.iconDataUrl], ['ref', 'My Refd', 'moved', 'r2', 'data:,old']);
  assert.ok(R.samePath(it.path, path.join(t.dirs.store, 'Refd.lnk')) && !exists(f));
  assert.deepEqual(t.journal(), []);
});

test('C2: a crash after the intent of a conversion: aborted, the reference tile is untouched', async () => {
  const { t, f, report } = await crashConvert('add:intent');
  assert.deepEqual(report.resolved.map((x) => [x.op, x.outcome]), [['add', 'aborted']]);
  assert.deepEqual(t.state.apps.map((a) => [a.id, a.kind || 'ref', a.regionId]), [['ref', 'ref', 'r1']]);
  assert.ok(exists(f));
});

test('C3 (m-2): a name a moved tile owns is never reused, its file there or missing: the new file takes the next number; each ↩ returns its own file to its own desktop', async () => {
  const t = setup();
  const pubSteam = t.file('publicDesktop', 'Steam.lnk', 'PUBLIC');
  const m = t.make();
  await m.init();
  const [t1] = (await m.addPaths('r1', [pubSteam], Infinity)).added;
  // Its file is taken out of the store folder (the test plays a person; nothing is deleted).
  const aside = path.join(t.dirs.root, 'Aside');
  fs.mkdirSync(aside);
  fs.renameSync(t1.path, path.join(aside, 'Steam.lnk'));
  await m.scan();
  assert.deepEqual([...m.missing], [t1.id]);
  const deskSteam = t.file('desktop', 'Steam.lnk', 'DESKTOP');
  const [t2] = (await m.addPaths('r1', [deskSteam], Infinity)).added;
  assert.ok(R.samePath(t2.path, path.join(t.dirs.store, 'Steam (2).lnk')), t2.path);
  assert.equal(t2.name, 'Steam');
  assert.ok(!exists(path.join(t.dirs.store, 'Steam.lnk')), 'the owned name stays free for its own file');
  assert.deepEqual([...m.missing], [t1.id], 'the first is still broken');
  // Its file comes back: the pip goes.
  fs.renameSync(path.join(aside, 'Steam.lnk'), t1.path);
  await m.scan();
  assert.deepEqual([...m.missing], []);
  const back = await m.moveBack([t1.id, t2.id]);
  assert.equal(back.moved.length, 2);
  assert.equal(fs.readFileSync(pubSteam, 'utf8'), 'PUBLIC');
  assert.equal(fs.readFileSync(deskSteam, 'utf8'), 'DESKTOP');
});

test('C3: a race on the name skips an owned name too', async () => {
  const t = setup({ steps: { 'add:intent': async (ctx) => { if (/Race\.lnk$/i.test(ctx.dst)) fs.writeFileSync(ctx.dst, 'INTRUDER'); } } });
  fs.mkdirSync(t.dirs.store);
  t.state.apps = [{ id: 'own2', name: 'Race', path: path.join(t.dirs.store, 'Race (2).lnk'), regionId: 'r1', kind: 'moved', origin: path.join(t.dirs.desktop, 'Race.lnk') }];
  const a = t.file('desktop', 'Race.lnk', 'NEW');
  const m = t.make();
  await m.init();
  const r = await m.addPaths('r1', [a], Infinity);
  assert.equal(r.added.length, 1);
  assert.ok(R.samePath(r.added[0].path, path.join(t.dirs.store, 'Race (3).lnk')), r.added[0].path);
  assert.equal(fs.readFileSync(path.join(t.dirs.store, 'Race.lnk'), 'utf8'), 'INTRUDER');
});

test('C4 (m-4): a store path of 260 characters or more is refused before the move with the ruled reason; 259 moves; a "(2)" counts', async () => {
  const t = setup();
  const m = t.make();
  await m.init();
  const nameFor = (len, ch) => `${ch.repeat(len - t.dirs.store.length - 1 - 4)}.url`;
  const ok = t.file('desktop', nameFor(259, 'A'), '[InternetShortcut]\r\nURL=https://example.invalid/a\r\n');
  const no = t.file('desktop', nameFor(260, 'B'), '[InternetShortcut]\r\nURL=https://example.invalid/b\r\n');
  const hNo = sha(no);
  const r = await m.addPaths('r1', [ok, no], Infinity);
  assert.equal(r.added.length, 1);
  assert.equal(r.added[0].path.length, 259);
  assert.ok(exists(r.added[0].path) && !exists(ok));
  assert.deepEqual(r.failures.map((f) => [f.code, f.reason]), [[-5, S.reasonTooLong]]);
  assert.ok(exists(no) && sha(no) === hNo, 'untouched');
  assert.equal(R.moveFailedBox(r.failures).message.endsWith('It is still on the desktop.'), true);
  assert.equal(addIntents(t).length, 1, 'only the one that moved was journalled');
  // 257 is short enough, but the name is taken in the store folder: "(2)" makes 261.
  const c = t.file('desktop', nameFor(257, 'C'), 'C');
  fs.writeFileSync(path.join(t.dirs.store, path.basename(c)), 'TAKEN');
  const r2 = await m.addPaths('r1', [c], Infinity);
  assert.deepEqual(r2.failures.map((f) => f.reason), [S.reasonTooLong]);
  assert.ok(exists(c));
});

test('C1: the journal itself: an intent that could not be written is not pending, and nothing reached the history', async () => {
  const { Journal } = require('../../src/main/moves/journal');
  const dir = path.join(ROOT, `j${++seq}`);
  fs.mkdirSync(dir, { recursive: true });
  let fail = 'ENOSPC';
  const fsp = { ...fs.promises, open: (p, ...a) => (fail && /moves-journal\.json\.tmp$/i.test(String(p)) ? Promise.reject(Object.assign(new Error(`${fail}: injected`), { code: fail })) : fs.promises.open(p, ...a)) };
  const j = new Journal(dir, { fsp });
  await j.load();
  await assert.rejects(j.intent({ id: 'a1', op: 'add', src: 'x', dst: 'y' }), (e) => e.code === 'ENOSPC');
  assert.deepEqual(j.pending(), [], 'not pending in memory');
  assert.ok(!fs.existsSync(path.join(dir, 'moves-log.jsonl')), 'nothing in the history');
  assert.ok(!fs.existsSync(path.join(dir, 'moves-journal.json')), 'nothing on disk');
  fail = null;
  await j.intent({ id: 'a2', op: 'add', src: 'x', dst: 'y' });
  assert.deepEqual(j.pending().map((e) => e.id), ['a2'], 'the next intent is written');
});

// ── C2 follow-up (UX spec "Addendum — M3 fix pass, C2 follow-up", D3) ─────
test('D3: moving unavailable: a drop with a store file that has no tile is refused whole; the reference dropped with it is not added, the row stays', async () => {
  const t = setup();
  const a = t.file('desktop', 'Lost.lnk', 'L');
  const exe = t.file('desktop', 'Tool.exe');
  const m = t.make();
  await m.init();
  const [item] = (await m.addPaths('r1', [a], Infinity)).added;
  t.state.apps = [];
  await m.scan();
  m.offForTest = true;
  const r = await m.addPaths('r2', [item.path, exe], 0);
  assert.equal(r.refused, 'unavailable');
  assert.deepEqual([r.taken.length, r.refs.length, r.added.length], [0, 0, 0]);
  assert.deepEqual(t.state.apps, [], 'nothing was changed');
  assert.deepEqual(m.orphans.map((o) => o.name), ['Lost']);
  m.offForTest = false;
  const r2 = await m.addPaths('r2', [item.path, exe], 0);
  assert.deepEqual([r2.refused, r2.taken.length, r2.refs.length], [null, 1, 1], 'available again: adopted, and the reference added');
});

test('D3: moving unavailable: an older build\'s reference tile on a store file is not turned into its moved tile; a moved tile still moves (no file moves)', async () => {
  const t = setup();
  const a = t.file('desktop', 'Old.lnk', 'O');
  const b = t.file('desktop', 'Kept.lnk', 'K');
  const m = t.make();
  await m.init();
  const [oldItem, keptItem] = (await m.addPaths('r1', [a, b], Infinity)).added;
  // Old.lnk: only a reference tile on the store file (as m-3 made them); Kept.lnk: its moved tile.
  t.state.apps = [{ id: 'legacy', name: 'Old', path: oldItem.path, regionId: 'r1' }, keptItem];
  m.offForTest = true;
  const r = await m.addPaths('r2', [oldItem.path], 0);
  assert.equal(r.refused, 'unavailable');
  assert.deepEqual(t.state.apps.find((x) => x.id === 'legacy'), { id: 'legacy', name: 'Old', path: oldItem.path, regionId: 'r1' });
  const r2 = await m.addPaths('r2', [keptItem.path], 0);
  assert.deepEqual([r2.refused, r2.taken.length], [null, 1], 'a moved tile taking its own file needs no move (as Move to)');
  assert.equal(t.state.apps.find((x) => x.id === keptItem.id).regionId, 'r2');
});
