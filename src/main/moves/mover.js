'use strict';
// The safe file move (tech plan § 3, UX spec 5.2, 5.4, 5.5).
//
// A top-level .lnk or .url in a desktop folder, added to a region, moves into
// the store folder; it comes back with ↩, Move all back, region delete or
// --ql-restore-all. Nothing is ever deleted: the only file operation is
// win32.moveFileNoReplace (an atomic same-volume rename that fails when the
// target exists). This module has no unlink, rm, rmdir, copy or fs.rename
// (test/regions/moves-never-delete.test.js scans it).
//
// Order of work, add:  validate (attributes only, then the file is read) ->
//   free target name -> journal intent -> move -> verify -> item + store commit
//   -> journal done -> 'changed' (only now the tile is sent to the page).
// Order of work, back: target = origin folder, else the desktop -> free name
//   -> intent -> move -> verify -> item removed + commit -> done.
// Every operation runs through one queue, after the startup reconcile.
//
// The data adapter (the controller, or index.js in restore mode):
//   apps()            the flat item list (store)
//   commit(apps)      set it and write it now; true when it is on disk
//   regionExists(id), primaryId(), writable(), capOf(regionId)

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { randomUUID } = require('crypto');
const { EventEmitter } = require('events');
const R = require('./rules');
const { Journal } = require('./journal');

const README = 'README.txt';
// The store folder's README (addendum B6): plain ASCII, CRLF, written once and never overwritten.
const README_TEXT = [
  'These shortcuts came off your desktop. QuickLauncher moved them here when',
  'you added them to a region, and its tiles open them from here.',
  '',
  'Do not delete, rename or move them: their tiles would stop working.',
  '',
  'To put them back on the desktop, right-click the QuickLauncher tray icon,',
  'choose Regions, then press MOVE ALL BACK under Moved shortcuts.',
  'Uninstalling QuickLauncher puts them back too.',
  '',
  'Without QuickLauncher you can drag them out of this folder yourself.',
  '',
].join('\r\n');

const COLLISION = new Set([80, 183]); // ERROR_FILE_EXISTS, ERROR_ALREADY_EXISTS
const MAX_NAMES = 999;

const lower = (p) => String(p || '').toLowerCase();
// A file that cannot be read before its move: held by another program (in use),
// or its ACL refuses us (access denied, e.g. on the Public Desktop).
const readCode = (e) => (e && e.code === 'EBUSY' ? 32 : e && (e.code === 'EPERM' || e.code === 'EACCES') ? 5 : -1);

function insertAt(apps, regionId, item, index) {
  const list = (Array.isArray(apps) ? apps : []).slice();
  const slots = [];
  list.forEach((a, i) => { if (a && a.regionId === regionId) slots.push(i); });
  if (!slots.length) { list.push(item); return list; }
  const n = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : slots.length;
  if (n >= slots.length) list.splice(slots[slots.length - 1] + 1, 0, item);
  else list.splice(slots[n], 0, item);
  return list;
}

class Mover extends EventEmitter {
  /**
   * folders: { desktop, publicDesktop, store }; journalDir: the profile folder;
   * data: the adapter above; win32: ./win32 (or a test fake);
   * buildEntry(path) -> { name, iconDataUrl } (reads the file; never called on a placeholder);
   * hooks (--ql-test-hooks only): { step(name, ctx), fault(op, src, dst) -> Win32 code | null }.
   */
  constructor({ folders, journalDir, data, win32, available = true, reason = null, fsp = fs.promises,
    buildEntry = async (p) => ({ name: R.displayName(p), iconDataUrl: '' }), log = () => {}, hooks = null, newId = randomUUID, confineTo = null }) {
    super();
    this.folders = { ...folders };
    this.data = data;
    this.win32 = win32;
    this.fsp = fsp;
    this.buildEntry = buildEntry;
    this.log = log;
    this.hooks = hooks;
    this.newId = newId;
    this.available = !!available && !!(win32 && win32.available);
    this.reason = this.available ? null : (reason || 'win32 unavailable');
    this.offForTest = false;
    // Test mode (--ql-test-desktop): no file outside this folder is ever moved, even if the
    // data file (a copy of a real one) names one in the real store folder.
    this.confineTo = confineTo;
    this.journal = new Journal(journalDir, { fsp });
    this.real = { desktop: null, publicDesktop: null, store: null };
    this.missing = new Set();   // moved items whose file is gone (the broken state)
    this.orphans = [];          // { file, name }: shortcuts in the store folder with no item
    this._tail = Promise.resolve();
    this.ready = null;
  }

  // ── plumbing ───────────────────────────────────────────────────────────────
  _run(fn) {
    const p = this._tail.then(fn, fn);
    this._tail = p.catch(() => {});
    return p;
  }

  async _step(name, ctx) {
    if (this.hooks && typeof this.hooks.step === 'function') await this.hooks.step(name, ctx);
  }

  _move(op, src, dst) {
    if (this.hooks && typeof this.hooks.fault === 'function') {
      const code = this.hooks.fault(op, src, dst);
      if (code) return { ok: false, code, injected: true };
    }
    return this.win32.moveFileNoReplace(src, dst);
  }

  async _exists(p) {
    try { await this.fsp.lstat(p); return true; } catch (e) { return !(e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')); }
  }

  async _isDir(p) {
    try { return (await this.fsp.stat(p)).isDirectory(); } catch { return false; }
  }

  async _realDir(p) {
    if (!p) return null;
    try { return await this.fsp.realpath(p); } catch { return path.resolve(p); }
  }

  /** A file's real path through its folder's realpath. The file itself is never opened. */
  async _realFile(p) {
    const dir = await this._realDir(path.dirname(p));
    return path.join(dir, path.basename(p));
  }

  async _fingerprint(p) {
    const st = await this.fsp.lstat(p);
    const buf = await this.fsp.readFile(p);
    return { size: st.size, mtimeMs: st.mtimeMs, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
  }

  async _verify(src, dst, fp) {
    if (await this._exists(src)) return { ok: false, why: 'source still there' };
    let now;
    try { now = await this._fingerprint(dst); } catch (e) { return { ok: false, why: `target unreadable (${e && e.code})` }; }
    if (now.size !== fp.size) return { ok: false, why: `size ${now.size} != ${fp.size}` };
    if (now.sha256 !== fp.sha256) return { ok: false, why: 'hash differs' };
    return { ok: true };
  }

  async _ensureStore() {
    await this.fsp.mkdir(this.folders.store, { recursive: true });
    try {
      await this.fsp.writeFile(path.join(this.folders.store, README), README_TEXT, { encoding: 'utf8', flag: 'wx' });
    } catch (e) {
      if (!e || e.code !== 'EEXIST') this.log({ event: 'moves', note: `README not written: ${e && e.code}` });
    }
    this.real.store = await this._realDir(this.folders.store);
  }

  async _freeTarget(dir, fileName, from = 1) {
    for (let n = from; n <= MAX_NAMES; n++) {
      const cand = path.join(dir, R.candidateName(fileName, n));
      if (!(await this._exists(cand))) return { dst: cand, n };
    }
    return null;
  }

  /** True when `p` may be moved: always, unless test mode confines moves to its own folder. */
  _allowed(p) {
    return !this.confineTo || [].concat(this.confineTo).some((root) => R.isInside(root, p));
  }

  canMove() { return this.available && !this.offForTest && this.data.writable(); }
  unavailableReason() {
    if (!this.available) return this.reason;
    if (this.offForTest) return 'off (test hook)';
    if (!this.data.writable()) return 'store is read-only';
    return null;
  }

  // ── boot ───────────────────────────────────────────────────────────────────
  /** Resolve the folders, then reconcile the journal and scan the store folder, before any drop is taken. */
  init() {
    if (this.ready) return this.ready;
    this.ready = this._run(async () => {
      this.real.desktop = this.folders.desktop ? await this._realDir(this.folders.desktop) : null;
      this.real.publicDesktop = this.folders.publicDesktop ? await this._realDir(this.folders.publicDesktop) : null;
      this.real.store = this.folders.store ? await this._realDir(this.folders.store) : null;
      let report = { resolved: [] };
      if (this.available) {
        try { await this.journal.load(); } catch (e) { this.log({ event: 'moves', note: `journal not read: ${e && e.code}` }); }
        if (this.journal.loadNote) this.log({ event: 'moves', note: this.journal.loadNote });
        report = await this._reconcile();
      }
      await this._scan();
      this.initDone = true;
      this.log({ event: 'moves-ready', available: this.available, reason: this.reason, reconciled: report.resolved, missing: this.missing.size, orphans: this.orphans.length });
      return report;
    });
    return this.ready;
  }

  // ── add (spec 5.2) ─────────────────────────────────────────────────────────
  /**
   * Add dropped or chosen files to a region at `index` (among its items),
   * in order. Desktop shortcuts move; other .lnk/.url/.exe are references;
   * anything else is ignored. Result:
   *   { refused: null | 'region' | 'full' | 'unavailable', added: [items], refs: [items],
   *     failures: [{ name, file, code, reason }], ignored: [paths] }
   */
  addPaths(regionId, paths, index = Infinity) {
    return this._run(async () => {
      const res = { refused: null, added: [], refs: [], failures: [], ignored: [] };
      if (!this.data.regionExists(regionId)) { res.refused = 'region'; return res; }
      const plan = [];
      for (const p of Array.isArray(paths) ? paths : []) {
        if (typeof p !== 'string' || !p || !R.isAccepted(p)) { res.ignored.push(p); continue; }
        const real = await this._realFile(p);
        plan.push({ given: p, real, ...R.classify(real, this.real) });
      }
      if (!plan.length) return res;
      const count = this.data.apps().filter((a) => a && a.regionId === regionId).length;
      if (count + plan.length > this.data.capOf(regionId)) { res.refused = 'full'; return res; }
      if (plan.some((x) => x.action === 'move') && !this.canMove()) { res.refused = 'unavailable'; return res; }
      let at = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : Infinity;
      for (const step of plan) {
        if (step.action === 'ref') {
          const item = await this._addRef(regionId, step.given, at);
          if (item) { res.refs.push(item); at += 1; }
          continue;
        }
        const r = await this._addOne(regionId, step, at);
        if (r.ok) { res.added.push(r.item); at += 1; } else res.failures.push(r.failure);
      }
      return res;
    });
  }

  async _addRef(regionId, file, index) {
    if (!(await this._exists(file))) return null;
    const mine = this.data.apps().filter((a) => a && a.regionId === regionId);
    if (mine.some((a) => lower(a.path) === lower(file))) return null; // already a tile here (as today)
    const e = await this.buildEntry(file);
    const item = { id: this.newId(), name: e.name || R.displayName(file), path: file, iconDataUrl: e.iconDataUrl || '', regionId };
    this.data.commit(insertAt(this.data.apps(), regionId, item, index));
    this.emit('changed', { regionIds: [regionId] });
    return item;
  }

  async _addOne(regionId, step, index) {
    const src = step.real;
    const publicDesktop = step.desktop === 'public';
    const name = R.displayName(src);
    const fail = (code, why) => {
      this.log({ event: 'move', op: 'add', result: 'failed', name, code, why });
      return { ok: false, failure: { name, file: src, code, why, reason: R.reasonFor(code, { publicDesktop }) } };
    };
    // 1. Attributes only: a cloud-only placeholder is refused before anything reads it.
    const attrs = this.win32.attributes(src);
    if (attrs == null) return fail(2, 'not found');
    if (R.isPlaceholder(attrs)) return fail(-2, 'cloud-only placeholder');
    if (!this._allowed(src) || !this._allowed(this.folders.store)) return fail(-4, 'outside the test folder (test mode)');
    await this._step('add:validated', { src });
    // 2. Now the file may be read: its tile icon and its fingerprint.
    let entry;
    let fp;
    try {
      entry = await this.buildEntry(src);
      fp = await this._fingerprint(src);
    } catch (e) {
      return fail(readCode(e), `not readable (${e && e.code})`);
    }
    // 3. A free name in the store folder, then the intent, before anything moves.
    await this._ensureStore();
    const fileName = path.basename(src);
    let t = await this._freeTarget(this.folders.store, fileName);
    if (!t) return fail(-1, 'no free name');
    const itemId = this.newId();
    const j = await this.journal.intent({
      id: this.newId(), op: 'add', itemId, regionId, name, src, dst: t.dst,
      size: fp.size, mtimeMs: fp.mtimeMs, sha256: fp.sha256, index: Number.isFinite(index) ? index : null,
    });
    await this._step('add:intent', { journal: j, src, dst: t.dst });
    // 4. The move. A target that appeared since (a race on the name) takes the next number.
    let m;
    for (;;) {
      m = this._move('add', src, t.dst);
      if (m.ok || !COLLISION.has(m.code)) break;
      const next = await this._freeTarget(this.folders.store, fileName, t.n + 1);
      if (!next) break;
      t = next;
      await this.journal.update(j.id, { dst: t.dst });
    }
    if (!m.ok) {
      await this.journal.finish(j.id, 'aborted', { code: m.code, injected: !!m.injected });
      return fail(m.code, 'MoveFileExW');
    }
    const dst = t.dst;
    await this._step('add:moved', { journal: j, src, dst });
    // 5. Verify: the file is at the target with the same bytes, and gone from the desktop.
    const v = await this._verify(src, dst, fp);
    if (!v.ok) {
      const back = this._move('rollback', dst, src);
      this.log({ event: 'move', op: 'add', verify: v.why, rolledBack: !!back.ok });
      if (back.ok) {
        await this.journal.finish(j.id, 'aborted', { why: `verify: ${v.why}`, rolledBack: true });
        return fail(-3, `verify: ${v.why}`);
      }
      // It cannot go back: it stays in the store folder and gets its tile, which is the way back.
    }
    // 6. The item, committed to the store on disk.
    const item = { id: itemId, name, path: dst, iconDataUrl: (entry && entry.iconDataUrl) || '', regionId, kind: 'moved', origin: src };
    const onDisk = this.data.commit(insertAt(this.data.apps(), regionId, item, index));
    await this._step('add:committed', { journal: j, src, dst, item });
    // 7. Done: only now does the tile go to the page.
    if (onDisk) await this.journal.finish(j.id, 'done', { dst });
    else this.log({ event: 'move', op: 'add', note: 'store not written yet; the intent stays for the next start' });
    this.missing.delete(itemId);
    this.log({ event: 'move', op: 'add', result: 'moved', name, item: itemId.slice(0, 8) });
    this.emit('changed', { regionIds: [regionId] });
    return { ok: true, item };
  }

  // ── back to the desktop (spec 5.4) ─────────────────────────────────────────
  /** Move these moved items' files back. Result: { moved: [items], failures: [{ name, code, reason, itemId }] }. */
  moveBack(itemIds) {
    return this._run(async () => {
      const res = { moved: [], failures: [] };
      if (!this.canMove()) {
        for (const id of itemIds || []) {
          const it = this.data.apps().find((a) => a && a.id === id && a.kind === 'moved');
          if (it) res.failures.push({ itemId: id, name: it.name, code: 0, reason: R.STRINGS.unavailable, unavailable: true });
        }
        return res;
      }
      for (const id of itemIds || []) {
        const r = await this._backOne(id);
        if (!r) continue;
        if (r.ok) res.moved.push(r.item); else res.failures.push(r.failure);
      }
      return res;
    });
  }

  /** Where a file goes back to: its origin folder if that still exists, else the current desktop. */
  async _restoreTarget(origin, fallbackName) {
    const name = origin ? path.basename(origin) : fallbackName;
    const originDir = origin ? path.dirname(origin) : null;
    const dir = originDir && (await this._isDir(originDir)) ? originDir : (this.real.desktop || this.folders.desktop);
    const publicDesktop = !!(this.real.publicDesktop && R.samePath(dir, this.real.publicDesktop));
    return { dir, name, publicDesktop };
  }

  async _backOne(itemId) {
    const item = this.data.apps().find((a) => a && a.id === itemId && a.kind === 'moved');
    if (!item) return null;
    const src = item.path;
    const name = item.name || R.displayName(src);
    const target = await this._restoreTarget(item.origin, path.basename(src));
    const fail = (code, why) => {
      this.log({ event: 'move', op: 'back', result: 'failed', name, code, why });
      return { ok: false, failure: { itemId, name, file: src, code, why, reason: R.reasonFor(code, { publicDesktop: target.publicDesktop }) } };
    };
    if (!this._allowed(src) || !this._allowed(target.dir)) return fail(-4, 'outside the test folder (test mode)');
    if (this.win32.attributes(src) == null) { this.missing.add(itemId); return fail(2, 'missing from the store folder'); }
    let fp;
    try { fp = await this._fingerprint(src); } catch (e) { return fail(readCode(e), `not readable (${e && e.code})`); }
    let t = await this._freeTarget(target.dir, target.name);
    if (!t) return fail(-1, 'no free name');
    const j = await this.journal.intent({
      id: this.newId(), op: 'back', itemId, regionId: item.regionId, name, src, dst: t.dst,
      size: fp.size, mtimeMs: fp.mtimeMs, sha256: fp.sha256,
    });
    await this._step('back:intent', { journal: j, src, dst: t.dst });
    let m;
    for (;;) {
      m = this._move('back', src, t.dst);
      if (m.ok || !COLLISION.has(m.code)) break;
      const next = await this._freeTarget(target.dir, target.name, t.n + 1);
      if (!next) break;
      t = next;
      await this.journal.update(j.id, { dst: t.dst });
    }
    if (!m.ok) {
      await this.journal.finish(j.id, 'aborted', { code: m.code, injected: !!m.injected });
      return fail(m.code, 'MoveFileExW');
    }
    const dst = t.dst;
    await this._step('back:moved', { journal: j, src, dst });
    const v = await this._verify(src, dst, fp);
    if (!v.ok) {
      const undo = this._move('rollback', dst, src);
      this.log({ event: 'move', op: 'back', verify: v.why, rolledBack: !!undo.ok });
      if (undo.ok) {
        await this.journal.finish(j.id, 'aborted', { why: `verify: ${v.why}`, rolledBack: true });
        return fail(-3, `verify: ${v.why}`);
      }
      // It cannot come back into the store folder: it is on the desktop, so the tile goes.
    }
    const onDisk = this.data.commit(this.data.apps().filter((a) => !(a && a.id === itemId)));
    await this._step('back:committed', { journal: j, src, dst });
    if (onDisk) await this.journal.finish(j.id, 'done', { dst });
    else this.log({ event: 'move', op: 'back', note: 'store not written yet; the intent stays for the next start' });
    this.missing.delete(itemId);
    this.log({ event: 'move', op: 'back', result: 'moved', name, to: path.basename(dst) });
    this.emit('changed', { regionIds: [item.regionId] });
    return { ok: true, item: { ...item, restoredTo: dst } };
  }

  /** A broken tile's "Remove tile": the item goes; there is no file to move. */
  removeMissing(itemId) {
    return this._run(async () => {
      const item = this.data.apps().find((a) => a && a.id === itemId && a.kind === 'moved');
      if (!item) return { ok: false };
      if (await this._exists(item.path)) return { ok: false, reason: 'file is there' };
      this.data.commit(this.data.apps().filter((a) => !(a && a.id === itemId)));
      this.missing.delete(itemId);
      await this.journal.note({ op: 'remove-missing', itemId, name: item.name, path: item.path });
      this.emit('changed', { regionIds: [item.regionId] });
      return { ok: true };
    });
  }

  // ── files in the store folder with no tile (spec 5.5.3) ───────────────────
  async _originFromLog(file) {
    let text = '';
    try { text = await this.fsp.readFile(this.journal.logPath, 'utf8'); } catch { return null; }
    let origin = null;
    for (const line of text.split(/\r?\n/)) {
      if (!line) continue;
      try {
        const r = JSON.parse(line);
        if (r && r.op === 'add' && r.state === 'done' && lower(r.dst) === lower(file) && r.src) origin = r.src;
      } catch { /* skip */ }
    }
    return origin;
  }

  /** "Add back": the file stays where it is and gets a tile in a region (the first one by default). */
  adoptOrphan(file, regionId = null) {
    return this._run(async () => {
      const target = regionId && this.data.regionExists(regionId) ? regionId : this.data.primaryId();
      const o = this.orphans.find((x) => lower(x.file) === lower(file));
      if (!o || !target || !(await this._exists(o.file))) return { ok: false };
      if (!this.data.writable()) return { ok: false, reason: R.STRINGS.unavailable };
      const attrs = this.win32.attributes(o.file);
      const entry = attrs != null && !R.isPlaceholder(attrs) ? await this.buildEntry(o.file) : { name: o.name, iconDataUrl: '' };
      const origin = await this._originFromLog(o.file);
      const item = { id: this.newId(), name: R.displayName(o.file), path: o.file, iconDataUrl: entry.iconDataUrl || '', regionId: target, kind: 'moved', origin };
      this.data.commit(insertAt(this.data.apps(), target, item, Infinity));
      await this.journal.note({ op: 'adopt', itemId: item.id, file: o.file, regionId: target, origin });
      this.orphans = this.orphans.filter((x) => x !== o);
      this.emit('changed', { regionIds: [target] });
      return { ok: true, item };
    });
  }

  /** "Move to desktop": a file with no tile goes to the current desktop (collision-safe). */
  orphanToDesktop(file) {
    return this._run(() => this._orphanToDesktop(file));
  }

  async _orphanToDesktop(file) {
    const o = this.orphans.find((x) => lower(x.file) === lower(file));
    if (!o) return { ok: false };
    const name = o.name;
    const target = await this._restoreTarget(null, path.basename(o.file));
    const fail = (code, why) => ({ ok: false, failure: { name, file: o.file, code, why, reason: R.reasonFor(code, { publicDesktop: target.publicDesktop }) } });
    if (!this.canMove()) return { ok: false, failure: { name, file: o.file, code: 0, reason: R.STRINGS.unavailable, unavailable: true } };
    if (!this._allowed(o.file) || !this._allowed(target.dir)) return fail(-4, 'outside the test folder (test mode)');
    let fp;
    try { fp = await this._fingerprint(o.file); } catch (e) { return fail(-1, `not readable (${e && e.code})`); }
    let t = await this._freeTarget(target.dir, target.name);
    if (!t) return fail(-1, 'no free name');
    const j = await this.journal.intent({ id: this.newId(), op: 'orphan', name, src: o.file, dst: t.dst, size: fp.size, mtimeMs: fp.mtimeMs, sha256: fp.sha256 });
    let m;
    for (;;) {
      m = this._move('orphan', o.file, t.dst);
      if (m.ok || !COLLISION.has(m.code)) break;
      const next = await this._freeTarget(target.dir, target.name, t.n + 1);
      if (!next) break;
      t = next;
      await this.journal.update(j.id, { dst: t.dst });
    }
    if (!m.ok) { await this.journal.finish(j.id, 'aborted', { code: m.code }); return fail(m.code, 'MoveFileExW'); }
    await this.journal.finish(j.id, 'done', { dst: t.dst });
    this.orphans = this.orphans.filter((x) => x !== o);
    this.emit('changed', { regionIds: [] });
    return { ok: true, dst: t.dst };
  }

  // ── startup reconcile (tech plan § 3) ─────────────────────────────────────
  async _reconcile() {
    const resolved = [];
    for (const e of this.journal.pending()) {
      const srcThere = await this._exists(e.src);
      const dstThere = await this._exists(e.dst);
      const apps = this.data.apps();
      const item = apps.find((a) => a && a.id === e.itemId);
      let outcome = 'aborted';
      let note = '';
      if (e.op === 'add') {
        if (dstThere && !srcThere) {
          if (item) { outcome = 'done'; note = 'item already committed'; }
          else if (this.data.regionExists(e.regionId) && !this.data.writable()) {
            this.log({ event: 'moves-reconcile', id: e.id, note: 'store read-only; intent kept' });
            continue;
          } else if (this.data.regionExists(e.regionId)) {
            let icon = '';
            const attrs = this.win32.attributes(e.dst);
            if (attrs != null && !R.isPlaceholder(attrs)) { try { icon = (await this.buildEntry(e.dst)).iconDataUrl || ''; } catch { /* no icon */ } }
            const it = { id: e.itemId, name: e.name || R.displayName(e.src), path: e.dst, iconDataUrl: icon, regionId: e.regionId, kind: 'moved', origin: e.src };
            const onDisk = this.data.commit(insertAt(this.data.apps(), e.regionId, it, e.index == null ? Infinity : e.index));
            if (!onDisk) { this.log({ event: 'moves-reconcile', id: e.id, note: 'store not written; intent kept' }); continue; }
            outcome = 'done'; note = 'finished the add';
            this.emit('changed', { regionIds: [e.regionId] });
          } else { outcome = 'aborted'; note = 'file without a tile (its region is gone)'; }
        } else if (srcThere && !dstThere) { outcome = 'aborted'; note = 'nothing moved'; }
        else if (srcThere && dstThere) { outcome = item ? 'done' : 'aborted'; note = 'both paths exist'; }
        else { outcome = 'aborted'; note = 'file not found at either path'; }
      } else if (e.op === 'back') {
        if (dstThere && !srcThere) {
          if (item) {
            if (!this.data.writable()) { this.log({ event: 'moves-reconcile', id: e.id, note: 'store read-only; intent kept' }); continue; }
            const onDisk = this.data.commit(this.data.apps().filter((a) => !(a && a.id === e.itemId)));
            if (!onDisk) { this.log({ event: 'moves-reconcile', id: e.id, note: 'store not written; intent kept' }); continue; }
            this.emit('changed', { regionIds: [item.regionId] });
            note = 'finished the removal';
          } else note = 'item already removed';
          outcome = 'done';
        } else if (srcThere && !dstThere) { outcome = 'aborted'; note = 'nothing moved'; }
        else { outcome = 'aborted'; note = srcThere ? 'both paths exist' : 'file not found at either path'; }
      } else if (e.op === 'orphan') {
        outcome = dstThere && !srcThere ? 'done' : 'aborted';
      }
      await this.journal.finish(e.id, outcome, { reconciled: true, note });
      resolved.push({ id: e.id, op: e.op, outcome, note });
      this.log({ event: 'moves-reconcile', op: e.op, outcome, note, name: e.name });
    }
    return { resolved };
  }

  /** Broken tiles (moved items whose file is gone) and files with no tile. */
  scan() { return this._run(() => this._scan()); }

  async _scan() {
    const moved = this.data.apps().filter((a) => a && a.kind === 'moved');
    const missing = new Set();
    for (const a of moved) if (!(await this._exists(a.path))) missing.add(a.id);
    this.missing = missing;
    const orphans = [];
    if (this.folders.store) {
      let names = [];
      try { names = await this.fsp.readdir(this.folders.store); } catch { names = []; }
      const owned = new Set(moved.map((a) => lower(a.path)));
      const storeReal = this.real.store || this.folders.store;
      for (const n of names) {
        if (!R.isShortcut(n)) continue;
        const file = path.join(this.folders.store, n);
        const alt = path.join(storeReal, n);
        if (owned.has(lower(file)) || owned.has(lower(alt))) continue;
        try { if (!(await this.fsp.lstat(file)).isFile()) continue; } catch { continue; }
        orphans.push({ file, name: R.displayName(n) });
      }
    }
    this.orphans = orphans;
    return { missing: [...missing], orphans: orphans.slice() };
  }

  /** The shortcuts still in the store folder (restore-all's "anything left?"). */
  async remaining() {
    let names = [];
    try { names = await this.fsp.readdir(this.folders.store); } catch { return []; }
    return names.filter((n) => R.isShortcut(n));
  }

  // ── uninstall: everything back (--ql-restore-all) ─────────────────────────
  restoreAll() {
    return this._run(async () => {
      const out = { moved: 0, failures: [], orphansMoved: 0, remaining: [] };
      if (!this.canMove()) { out.remaining = await this.remaining(); out.unavailable = this.unavailableReason(); return out; }
      for (const a of this.data.apps().filter((x) => x && x.kind === 'moved')) {
        const r = await this._backOne(a.id);
        if (r && r.ok) out.moved++; else if (r) out.failures.push(r.failure);
      }
      await this._scan();
      for (const o of this.orphans.slice()) {
        const r = await this._orphanToDesktop(o.file);
        if (r && r.ok) out.orphansMoved++; else if (r && r.failure) out.failures.push(r.failure);
      }
      out.remaining = await this.remaining();
      return out;
    });
  }
}

module.exports = { Mover, insertAt, README, README_TEXT };
