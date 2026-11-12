'use strict';
// Reinstall backups. The bundle has no executable extraction paths: only
// validated shortcut basenames can become files in the managed store.
// File changes use the mover's no-replace Windows rename. A durable intent
// survives interruption; the store's transaction marker decides commit/rollback.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const R = require('./moves/rules');
const M = require('./regions/model');

const FORMAT = 'QuickLauncher backup';
const VERSION = 1;
const MAX_BYTES = 64 * 1024 * 1024;
const MAX_FILE = 2 * 1024 * 1024;
const MAX_ITEMS = 4096;
const JOURNAL = 'backup-import.json';
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const clone = x => JSON.parse(JSON.stringify(x));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const plain = x => x && typeof x === 'object' && !Array.isArray(x);
function fail(message) { throw new Error(message); }
function safeName(n) {
  return typeof n === 'string' && n.length > 0 && n.length <= 200
    && !/[<>:"/\\|?*\x00-\x1f]/.test(n) && !/[. ]$/.test(n)
    && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(n)
    && R.isShortcut(n);
}
function checkTree(x, depth = 0) {
  if (depth > 24) fail('The backup contains too many nested fields.');
  if (x && typeof x === 'object') for (const k of Object.keys(x)) {
    if (['__proto__', 'constructor', 'prototype'].includes(k)) fail('The backup contains an invalid field.');
    checkTree(x[k], depth + 1);
  }
}
function readBounded(file, maximum) {
  const fd = fs.openSync(file, 'r');
  try {
    const before = fs.fstatSync(fd);
    if (!before.isFile() || before.size > maximum) fail('The file is too large or unavailable.');
    const bytes = Buffer.alloc(before.size);
    let offset = 0;
    while (offset < bytes.length) {
      const n = fs.readSync(fd, bytes, offset, bytes.length - offset, offset);
      if (!n) fail('The file changed while it was read.');
      offset += n;
    }
    const after = fs.fstatSync(fd);
    if (after.size !== before.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs) fail('The file changed while it was read.');
    return bytes;
  } finally { fs.closeSync(fd); }
}
function validate(bundle, validThemes) {
  checkTree(bundle);
  if (!plain(bundle) || bundle.format !== FORMAT || bundle.version !== VERSION) fail('Choose a supported QuickLauncher backup.');
  const d = bundle.data;
  if (!plain(d) || !Array.isArray(d.apps) || d.apps.length > MAX_ITEMS || !plain(d.settings)
      || !Array.isArray(d.regions) || !d.regions.length || d.regions.length > M.REGION_CAP
      || d.regionsVersion !== M.REGIONS_VERSION || !Array.isArray(bundle.files)) fail('The backup configuration is invalid.');
  const bounded = n => Number.isSafeInteger(n) && Math.abs(n) <= 1000000;
  const coordinate = n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 1000000;
  const rect = r => plain(r) && ['x', 'y', 'width', 'height'].every(k => bounded(r[k])) && r.width > 0 && r.height > 0;
  const s = d.settings;
  for (const k of ['sortShortcuts', 'startWithWindows', 'randomTheme', 'reducedMotion', 'matchAll'])
    if (k in s && typeof s[k] !== 'boolean') fail('A backup setting is invalid.');
  if (('iconSize' in s && (!Number.isFinite(s.iconSize) || s.iconSize < 32 || s.iconSize > 128))
      || ('regionTransparency' in s && (!Number.isFinite(s.regionTransparency) || s.regionTransparency < 0 || s.regionTransparency > 100))
      || ('globalHotkey' in s && s.globalHotkey !== null && (typeof s.globalHotkey !== 'string' || s.globalHotkey.length > 64))
      || ['theme', 'sharedTheme'].some(k => s[k] != null && (typeof s[k] !== 'string' || (validThemes && !validThemes.has(s[k]))))
      || (s.managerBounds != null && !rect(s.managerBounds))) fail('A backup setting is invalid or unsupported.');
  const ids = new Set(), names = new Set();
  for (const r of d.regions) {
    if (!plain(r) || typeof r.id !== 'string' || !r.id || ids.has(r.id) || !rect(r.rect)
        || !rect(r.home) || !M.BUILT_LAYOUTS.has(r.layout) || !M.ICONS.includes(r.icon)
        || typeof r.name !== 'string' || !r.name.trim() || r.name.length > M.NAME_MAX
        || names.has(r.name.toLowerCase()) || typeof r.theme !== 'string'
        || (validThemes && !validThemes.has(r.theme))) fail('A region in the backup is invalid or unsupported.');
    if ((r.gridSize != null && (!plain(r.gridSize) || !bounded(r.gridSize.width) || !bounded(r.gridSize.height) || r.gridSize.width <= 0 || r.gridSize.height <= 0))
        || ['columnHeight', 'rowWidth'].some(k => r[k] != null && (!bounded(r[k]) || r[k] <= 0))
        || (r.radialAnchor != null && (!plain(r.radialAnchor) || !coordinate(r.radialAnchor.x) || !coordinate(r.radialAnchor.y)))
        || (r.fanDirection != null && !['up', 'down', 'left', 'right'].includes(r.fanDirection))) fail('A backup layout is invalid.');
    ids.add(r.id); names.add(r.name.toLowerCase());
  }
  const appIds = new Set(), paths = new Set();
  for (const a of d.apps) {
    if (!plain(a) || typeof a.id !== 'string' || !a.id || appIds.has(a.id)
        || !ids.has(a.regionId) || typeof a.name !== 'string' || typeof a.path !== 'string' || !a.path
        || a.path.includes('\0') || a.path.length > 32767 || a.id.length > 200 || a.name.length > 100 || paths.has(a.regionId + ':' + a.path.toLowerCase())
        || (a.kind !== undefined && !['moved', 'ref'].includes(a.kind))) fail('A shortcut in the backup is invalid or duplicated.');
    if (a.iconDataUrl && (typeof a.iconDataUrl !== 'string' || !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(a.iconDataUrl))) fail('A shortcut icon in the backup is invalid.');
    appIds.add(a.id); paths.add(a.regionId + ':' + a.path.toLowerCase());
  }
  const moved = d.apps.filter(a => a.kind === 'moved');
  if (bundle.files.length !== moved.length) fail('The backup is missing shortcut files.');
  const fileIds = new Set(), fileNames = new Set(), hashes = new Set();
  let total = 0;
  for (const f of bundle.files) {
    if (!plain(f) || !moved.some(a => a.id === f.itemId) || fileIds.has(f.itemId)
        || !safeName(f.name) || !safeName(f.originName) || !['desktop', 'publicDesktop'].includes(f.originFolder)
        || fileNames.has(f.name.toLowerCase()) || typeof f.bytes !== 'string'
        || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(f.bytes)) fail('A shortcut file in the backup is invalid.');
    const b = Buffer.from(f.bytes, 'base64'); total += b.length;
    if (!b.length || b.length > MAX_FILE || total > MAX_BYTES || f.sha256 !== hash(b) || hashes.has(f.sha256)) fail('A shortcut file is damaged or duplicated in the backup.');
    fileIds.add(f.itemId); fileNames.add(f.name.toLowerCase()); hashes.add(f.sha256);
  }
  for (const r of d.regions) if (d.apps.filter(a => a.regionId === r.id).length > M.capacityOf(r.layout)) fail('A region in the backup has too many shortcuts.');
  return bundle;
}

class Backup {
  constructor({ store, mover, folders, win32, validThemes = null, version = '', step = () => {} }) {
    Object.assign(this, { store, mover, folders, win32, validThemes, version, step });
    this.journalPath = path.join(path.dirname(store.dataPath), JOURNAL);
    this.busy = false;
  }
  _durable(p, data, flags = 'w') {
    const fd = fs.openSync(p, flags);
    try { fs.writeFileSync(fd, data); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  }
  _writeJournal(j) {
    this._durable(this.journalPath + '.tmp', JSON.stringify(j));
    fs.renameSync(this.journalPath + '.tmp', this.journalPath);
  }
  _root(p) {
    const s = fs.lstatSync(p);
    if (!s.isDirectory() || s.isSymbolicLink()) fail('A shortcut folder is unavailable or redirected.');
    // The resolved known folders may be redirected (OneDrive), but must not
    // change underneath a transaction. Each file operation rechecks them.
    return fs.realpathSync.native(p);
  }
  _roots() {
    const out = {};
    for (const k of ['desktop', 'publicDesktop', 'store']) {
      const p = this.folders[k];
      if (!p) { if (k === 'publicDesktop') continue; fail('A shortcut folder is unavailable.'); }
      out[k] = !fs.existsSync(p) && k === 'store'
        ? path.join(this._root(path.dirname(p)), path.basename(p)) : this._root(p);
    }
    return out;
  }
  _read(p) {
    const attrs = this.win32.attributes(p);
    if (attrs == null || R.isPlaceholder(attrs) || (attrs & (0x400 | 0x10))) fail(`The shortcut “${path.basename(p)}” is unavailable. Keep it on this device and try again.`);
    const s = fs.lstatSync(p);
    if (!s.isFile() || s.isSymbolicLink() || s.size > MAX_FILE || !s.size) fail(`The shortcut “${path.basename(p)}” cannot be backed up safely.`);
    const identity = this.win32.fileIdentity(p);
    if (!identity) fail(`The shortcut “${path.basename(p)}” cannot be read safely.`);
    const bytes = readBounded(p, MAX_FILE);
    if (bytes.length > MAX_FILE || !same(identity, this.win32.fileIdentity(p))) fail('A shortcut changed. Try again.');
    return { path: p, bytes, sha256: hash(bytes), identity };
  }
  _sameFile(p, proof) {
    try {
    const r = this._read(p);
      // NTFS filename tunnelling can restore a recently deleted destination's
      // creation timestamp during rename. The volume/file ID and exact bytes
      // must still be the same; capture the full new identity for the tile.
      const renamed = proof.dst && R.samePath(p, proof.dst);
      return r.sha256 === proof.sha256 && (same(r.identity, proof.identity) || (renamed && proof.identity
        && r.identity.volume === proof.identity.volume && r.identity.id === proof.identity.id));
    } catch { return false; }
  }
  async _exclusive(fn) {
    if (this.busy) fail('A backup operation is already running.');
    this.busy = true;
    try {
      if (this.mover) await this.mover.ready;
      const run = () => {
        if (this.store.isReadOnly() || !this.store.flush()) fail('Your setup cannot be saved. Try again when it is writable.');
        if (this.mover && (!this.mover.canMove() || this.mover.activeShellTickets.size || this.mover.journal.pending().length)) fail('Finish the shortcut operation, then try again.');
        this.store.backupLocked = true;
        try { return fn(); } finally { this.store.backupLocked = false; }
      };
      return this.mover ? await this.mover._run(run) : run();
    } finally { this.busy = false; }
  }
  exportTo(file) {
    return this._exclusive(() => {
      if (fs.existsSync(this.journalPath)) fail('An interrupted import needs recovery. Restart QuickLauncher.');
      const roots = this._roots();
      const data = clone(this.store.data);
      delete data.backupImportId; delete data.backupResult;
      const files = [];
      for (const a of data.apps.filter(a => a.kind === 'moved')) {
        if (!R.samePath(path.dirname(a.path), roots.store) && !R.samePath(path.dirname(a.path), this.folders.store)) fail('A moved shortcut is outside the QuickLauncher Shortcuts folder.');
        const r = this._read(path.join(roots.store, path.basename(a.path)));
        if (a.fileIdentity && !same(a.fileIdentity, r.identity)) fail(`The shortcut “${a.name}” changed. Refresh it before exporting.`);
        const originFolder = [this.folders.publicDesktop, roots.publicDesktop].filter(Boolean).some(p => R.samePath(path.dirname(a.origin || ''), p)) ? 'publicDesktop' : 'desktop';
        const originName = path.basename(a.origin || a.path);
        files.push({ itemId: a.id, name: path.basename(a.path), originFolder, originName, sha256: r.sha256, bytes: r.bytes.toString('base64') });
      }
      const b = validate({ format: FORMAT, version: VERSION, appVersion: this.version, createdAt: new Date().toISOString(), data, files }, this.validThemes);
      const bytes = Buffer.from(JSON.stringify(b));
      if (bytes.length > MAX_BYTES) fail('The backup is too large.');
      // Save dialog owns overwrite consent; reject aliases of live data/files.
      this._checkOutput(file, roots);
      const tmp = file + '.' + crypto.randomUUID() + '.tmp';
      try {
        this._durable(tmp, bytes, 'wx');
        if (hash(fs.readFileSync(tmp)) !== hash(bytes)) fail('The backup could not be verified.');
        fs.renameSync(tmp, file);
      } finally { try { fs.unlinkSync(tmp); } catch (e) { if (e.code !== 'ENOENT') throw e; } }
      return { ok: true, file, regions: data.regions.length, shortcuts: data.apps.length };
    });
  }
  _checkOutput(file, roots) {
    if (typeof file !== 'string' || !path.isAbsolute(file) || !file.toLowerCase().endsWith('.qlbackup')) fail('Choose a .qlbackup file.');
    const dir = fs.realpathSync.native(path.dirname(file));
    if (Object.values(roots).some(p => R.samePath(dir, p) && R.isShortcut(file))
        || R.samePath(dir, path.dirname(this.store.dataPath)) || R.samePath(dir, roots.store) || R.isInside(roots.store, dir)) fail('Save the backup outside QuickLauncher’s data folders.');
    if (fs.existsSync(file) && (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink())) fail('Choose a regular backup file.');
  }
  read(file) {
    const s = fs.lstatSync(file);
    if (!s.isFile() || s.isSymbolicLink() || s.size > MAX_BYTES) fail('Choose a supported QuickLauncher backup smaller than 64 MB.');
    let b;
    try { b = JSON.parse(readBounded(file, MAX_BYTES).toString('utf8')); } catch { fail('The backup could not be read. Choose another backup.'); }
    return validate(b, this.validThemes);
  }
  _scan(roots) {
    const all = []; let total = 0, count = 0;
    for (const dir of new Set(Object.values(roots))) {
      if (!fs.existsSync(dir)) continue;
      const names = fs.readdirSync(dir);
      if (names.length > 20000) fail('A shortcut folder has too many files to check safely.');
      for (const n of names) if (R.isShortcut(n)) {
        if (++count > MAX_ITEMS) fail('There are too many shortcuts to check safely.');
        const p = path.join(dir, n);
        // Do not hydrate/read unrelated cloud placeholders. They cannot match;
        // same-name checks below still refuse to create a duplicate over them.
        const attrs = this.win32.attributes(p);
        if (attrs == null || R.isPlaceholder(attrs) || attrs & (0x400 | 0x10)) continue;
        const st = fs.lstatSync(p);
        if (st.size > MAX_FILE) continue;
        total += st.size;
        if (total > MAX_BYTES * 2) fail('The shortcut folders are too large to check safely.');
        try { all.push(this._read(p)); } catch { /* unrelated unreadable files are not matches; same-name collisions still refuse below */ }
      }
    }
    return all;
  }
  _plan(bundle) {
    const roots = this._roots(), all = this._scan(roots), ops = [], target = clone(bundle.data);
    const used = new Set(), wanted = new Set(bundle.files.map(f => f.sha256));
    const reserved = new Set(all.map(f => f.path.toLowerCase()));
    for (const f of bundle.files) {
      const matches = all.filter(p => p.sha256 === f.sha256);
      if (matches.length > 1) fail(`“${f.originName}” has duplicate files. Keep one copy, then import again.`);
      const src = matches[0];
      const dst = src && R.samePath(path.dirname(src.path), roots.store) ? src.path : path.join(roots.store, f.name);
      if (dst.length >= R.MAX_STORE_PATH) fail('A restored shortcut name is too long.');
      const names = new Set([f.name.toLowerCase(), f.originName.toLowerCase()]);
      for (const dir of Object.values(roots)) for (const name of names) {
        // Use actual case-insensitive name lookup even in non-Windows fixtures.
        const actual = fs.existsSync(dir) && fs.readdirSync(dir).find(n => n.toLowerCase() === name);
        if (actual) {
          const p = path.join(dir, actual);
          if (!src || !R.samePath(src.path, p)) fail(`“${actual}” conflicts with this backup. Rename or move the conflicting shortcut, then try again.`);
        }
      }
      if (used.has(dst.toLowerCase())) fail('The backup contains duplicate shortcut destinations.');
      used.add(dst.toLowerCase()); reserved.add(dst.toLowerCase());
      const origin = src && !R.samePath(path.dirname(src.path), roots.store) ? src.path
        : path.join(roots[f.originFolder] || roots.desktop, f.originName);
      const a = target.apps.find(a => a.id === f.itemId);
      a.path = dst; a.origin = origin; delete a.fileIdentity;
      if (!src || !R.samePath(src.path, dst)) ops.push({ type: src ? 'move' : 'create', src: src ? src.path : null, dst, sha256: f.sha256,
        identity: src ? src.identity : null, bytes: src ? undefined : f.bytes, itemId: a.id });
      else a.fileIdentity = src.identity;
    }
    // Replacing a setup must not strand its other managed files. Return them
    // to a desktop, collision-safe, within this same recoverable transaction.
    for (const a of this.store.data.apps.filter(a => a.kind === 'moved')) {
      const src = all.find(p => R.samePath(p.path, a.path));
      if (!src) fail(`The current shortcut “${a.name}” is unavailable. Resolve it before importing.`);
      if (a.fileIdentity && !same(a.fileIdentity, src.identity)) fail(`The current shortcut “${a.name}” changed. Resolve it before importing.`);
      if (wanted.has(src.sha256)) continue;
      if (!R.samePath(path.dirname(src.path), roots.store)) fail('A current moved shortcut is outside its folder.');
      const dir = roots.publicDesktop && R.samePath(path.dirname(a.origin || ''), roots.publicDesktop) ? roots.publicDesktop : roots.desktop;
      const name = safeName(path.basename(a.origin || '')) ? path.basename(a.origin) : path.basename(src.path);
      let dst;
      for (let n = 1; n <= 999; n++) { const p = path.join(dir, R.candidateName(name, n)); if (!reserved.has(p.toLowerCase()) && !fs.existsSync(p)) { dst = p; break; } }
      if (!dst) fail('There is no free desktop filename for a current shortcut.');
      reserved.add(dst.toLowerCase());
      ops.push({ type: 'move', src: src.path, dst, sha256: src.sha256, identity: src.identity });
    }
    const external = target.apps.filter(a => a.kind !== 'moved');
    // A reference pointing at a managed shortcut would create a second tile.
    for (const a of external) if (target.apps.some(b => b !== a && b.regionId === a.regionId && R.samePath(a.path, b.path))) fail('The backup contains duplicate shortcut tiles.');
    const missing = external.filter(a => path.isAbsolute(a.path) && !fs.existsSync(a.path)).length;
    return { roots, target, ops, token: hash(Buffer.from(JSON.stringify({ bundle, current: this.store.data, all: all.map(f => ({ path: f.path, sha256: f.sha256, identity: f.identity })) }))),
      summary: { regions: target.regions.length, shortcuts: target.apps.length, managed: bundle.files.length,
      external: external.length, missing, missingPaths: external.filter(a => path.isAbsolute(a.path) && !fs.existsSync(a.path)).map(a => a.path),
      reclaimed: ops.filter(o => o.type === 'move' && o.itemId).length,
      returned: ops.filter(o => !R.samePath(path.dirname(o.dst), roots.store)).length } };
  }
  preview(file) { return this._exclusive(() => { const plan = this._plan(this.read(file)); return { ok: true, token: plan.token, ...plan.summary }; }); }
  importFrom(file, token) {
    return this._exclusive(() => {
      if (fs.existsSync(this.journalPath)) fail('An interrupted import needs recovery. Restart QuickLauncher.');
      const plan = this._plan(this.read(file));
      if (token && plan.token !== token) fail('Your setup changed. Open the backup again to review it.');
      const id = crypto.randomUUID(), stage = path.join(plan.roots.store, '.backup-' + id);
      if (!fs.existsSync(plan.roots.store)) fs.mkdirSync(plan.roots.store);
      fs.mkdirSync(stage);
      const j = { version: 1, id, roots: plan.roots, stage, before: clone(this.store.data), ops: plan.ops };
      try {
        const payloads = new Map();
        for (let i = 0; i < j.ops.length; i++) if (j.ops[i].type === 'create') {
          const o = j.ops[i]; o.src = path.join(stage, `${i}${path.extname(o.dst)}`);
          payloads.set(o.src, Buffer.from(o.bytes, 'base64')); delete o.bytes;
        }
        this._writeJournal(j);
        for (const o of j.ops.filter(o => o.type === 'create')) {
          this._durable(o.src, payloads.get(o.src), 'wx');
          o.identity = this._read(o.src).identity;
          this._writeJournal(j);
        }
        this.step('intent', j);
        for (const o of j.ops) {
          this._assertRoots(j.roots);
          if (!this._sameFile(o.src, o)) fail('A shortcut changed during import.');
          const r = this.win32.moveFileNoReplace(o.src, o.dst);
          if (!r.ok) fail(`“${path.basename(o.src)}” could not be moved. Check its permissions and try again.`);
          if (!this._sameFile(o.dst, o)) fail('A shortcut changed during import.');
          if (o.itemId) plan.target.apps.find(a => a.id === o.itemId).fileIdentity = this._read(o.dst).identity;
          this.step('moved', j);
        }
        plan.target.backupImportId = id;
        plan.target.backupResult = { message: `Backup imported.\n${plan.summary.regions} regions · ${plan.summary.shortcuts} shortcuts restored.`
          + (plan.summary.reclaimed ? '\nMatching desktop shortcuts were moved into QuickLauncher.' : '')
          + (plan.summary.missing ? `\n${plan.summary.missing} shortcut targets are unavailable.` : ''), at: new Date().toISOString() };
        if (!this.store.replaceData(plan.target)) fail('The imported setup could not be saved.');
        this.step('committed', j);
        this._finish(j);
        return { ok: true, ...plan.summary, restart: true };
      } catch (e) {
        // Fault hooks model process death: recovery is performed on next boot.
        if (e && e.simulatedCrash) throw e;
        if (this.store.data.backupImportId === id) {
          // The target generation is durable. Cleanup failure cannot turn it
          // into a reported rollback or leave old live windows running. The
          // controlled restart retries cleanup before applying the setup.
          return { ok: true, ...plan.summary, restart: true, recoveryPending: true };
        }
        if (fs.existsSync(this.journalPath)) {
          try { this.recover(); } catch (recovery) {
            throw Object.assign(new Error(`Import needs recovery. ${recovery.message}`, { cause: e }), { recoveryRequired: true, recoveryPath: this.journalPath });
          }
        } else this._cleanStage(j);
        throw e;
      }
    });
  }
  _assertRoots(roots) {
    for (const [k, p] of Object.entries(roots)) if (!R.samePath(this._root(this.folders[k]), p)) fail('A shortcut folder changed during import.');
  }
  _cleanStage(j) {
    if (!fs.existsSync(j.stage)) return;
    if (fs.lstatSync(j.stage).isSymbolicLink()) fail('The import recovery folder changed.');
    // Only our known staged files, verified against the intent, may be removed.
    for (const o of j.ops.filter(o => o.type === 'create' && o.src && R.samePath(path.dirname(o.src), j.stage))) {
      if (fs.existsSync(o.src)) { if (!this._sameFile(o.src, o)) fail('A staged shortcut changed.'); fs.unlinkSync(o.src); }
    }
    fs.rmdirSync(j.stage);
  }
  _finish(j) {
    this._cleanStage(j);
    fs.unlinkSync(this.journalPath);
  }
  recover() {
    if (!fs.existsSync(this.journalPath)) return { recovered: false };
    let j; try { j = JSON.parse(fs.readFileSync(this.journalPath, 'utf8')); } catch { fail('The import recovery record is unreadable. Keep it and restore your backup after resolving it.'); }
    checkTree(j);
    if (j.version !== 1 || !/^[0-9a-f-]{36}$/.test(j.id) || !plain(j.before) || !Array.isArray(j.ops) || j.ops.length > MAX_ITEMS * 2
        || !plain(j.roots) || !R.samePath(j.stage, path.join(this.folders.store, '.backup-' + j.id))) fail('The import recovery record is invalid.');
    this._assertRoots(j.roots);
    for (const o of j.ops) {
      const dirs = Object.values(j.roots);
      if (!['move', 'create'].includes(o.type) || !safeName(path.basename(o.dst)) || !dirs.some(d => R.samePath(path.dirname(o.dst), d))
          || !safeName(path.basename(o.src)) || !(dirs.some(d => R.samePath(path.dirname(o.src), d)) || (o.type === 'create' && R.samePath(path.dirname(o.src), j.stage)))
          || !/^[a-f0-9]{64}$/.test(o.sha256) || !(plain(o.identity) || (o.type === 'create' && o.identity === null))) fail('The import recovery record has an unsafe file path.');
    }
    if (this.store.data.backupImportId === j.id) {
      for (const o of j.ops) if (!this._sameFile(o.dst, o)) fail('A restored shortcut changed. Recovery needs attention.');
      this._finish(j); return { recovered: true, committed: true };
    }
    for (const o of [...j.ops].reverse()) {
      if (o.type === 'create' && !o.identity) {
        if (fs.existsSync(o.dst)) fail('A shortcut destination changed during staging.');
        if (!fs.existsSync(o.src)) continue;
        const staged = this._read(o.src);
        if (staged.sha256 !== o.sha256) fail('A staged shortcut is incomplete. Your original setup was kept.');
        o.identity = staged.identity;
      }
      if (this._sameFile(o.src, o) && !fs.existsSync(o.dst)) continue;
      if (!fs.existsSync(o.src) && this._sameFile(o.dst, o)) {
        if (!this.win32.moveFileNoReplace(o.dst, o.src).ok) fail('A shortcut could not be returned during recovery.');
      } else fail('A shortcut changed during recovery. Your files were kept.');
    }
    if (!this.store.replaceData(j.before)) fail('The original setup could not be saved during recovery.');
    this._finish(j); return { recovered: true, committed: false };
  }
}
module.exports = { Backup, validate, safeName, FORMAT, VERSION, MAX_BYTES };
