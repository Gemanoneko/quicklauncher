const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// Crash-safe JSON store.
//
// On-disk format is unchanged: quicklauncher-data.json holds { apps, settings }
// and quicklauncher-data.json.bak holds the previous good generation.
//
// Durability rules (a BSOD / power loss can keep journaled metadata such as a
// rename while losing file data that was never flushed — which is how both the
// data file and its .bak came back zero-filled on Sergei's machine):
//   1. Every generation is written to .tmp, fsync'ed, and only then renamed
//      over the data file. The data file is never written in place.
//   2. The .bak is the previous data file moved aside by an atomic rename —
//      never a copy made in place from a file that may still be unflushed.
//   3. A file that can't be parsed, or parses to the wrong shape, is never
//      treated as "no data": the next candidate (.tmp, then .bak) is tried and
//      the unreadable file is quarantined (renamed, not deleted).
//   4. A data file that exists but can't be READ (locked by AV at login, ACL
//      trouble) puts the store in read-only mode, so defaults or a stale
//      backup are never written over it.
//   5. Read-only mode is re-checked before every save it would refuse, when
//      the window gets focus, and every few seconds. Once the file reads
//      again it is loaded exactly as at startup, this session's changes are
//      merged into it (reconcile), and only the merged result is written —
//      through the same .tmp → fsync → rename path. A save refused before the
//      second failed timer re-check (~10 s) raises nothing; still read-only
//      at that re-check: the save-error banner is raised once, and every
//      save refused after it raises it again.

// Windows error codes that are usually transient (AV scanner, search indexer,
// backup agent briefly holding the file). Worth a short retry.
const TRANSIENT = new Set(['EBUSY', 'EPERM', 'EACCES']);

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ── Three-way merge ─────────────────────────────────────────────────────────
// base = the copy the read-only session started from (what the user was
// shown), mine = that copy plus the session's edits, disk = what the data
// file holds now. The rules, in order of priority: nothing the user can see
// is dropped; nothing on disk is dropped unless the user removed it this
// session; the user's edits and additions win.

function mergeApps(base, mine, disk) {
  if (!Array.isArray(mine)) mine = [];
  if (!Array.isArray(disk)) return mine;
  if (!Array.isArray(base)) base = [];
  // Disk hasn't moved since the copy the user edited: their list stands as is
  // (order included).
  if (same(base, disk)) return mine;
  const baseById = new Map(base.map(a => [a && a.id, a]));
  const mineById = new Map(mine.map(a => [a && a.id, a]));
  const out = [];
  for (const d of disk) {
    const id = d && d.id;
    const b = baseById.get(id);
    const m = mineById.get(id);
    if (b && !m) continue;                        // removed by the user this session
    out.push(b && m && !same(b, m) ? m : d);      // edited this session → the user's version
  }
  const ids = new Set(out.map(a => a && a.id));
  const paths = new Set(out.map(a => a && a.path));
  for (const m of mine) {
    const id = m && m.id;
    if (ids.has(id)) continue;
    // Added this session but already on disk under another id (re-added while
    // the library wasn't visible). The renderer never allows two tiles with
    // the same path either.
    if (!baseById.has(id) && paths.has(m && m.path)) continue;
    out.push(m);                                  // added this session, or shown but not on disk
    ids.add(id);
    paths.add(m && m.path);
  }
  return out;
}

function mergeFields(base, mine, disk) {
  if (!isPlainObject(base)) base = {};
  const out = { ...disk };
  for (const k of Object.keys(mine)) {
    if (!same(mine[k], base[k]) || !(k in disk)) out[k] = mine[k];
  }
  return out;
}

function mergeValue(key, base, mine, disk) {
  if (key === 'apps') return mergeApps(base, mine, disk);
  if (isPlainObject(mine) && isPlainObject(disk)) return mergeFields(base, mine, disk);
  if (disk === undefined || !same(mine, base)) return mine;
  return disk;
}

function reconcile(base, mine, disk) {
  const out = { ...disk };
  for (const k of Object.keys(mine)) {
    out[k] = mergeValue(k, isPlainObject(base) ? base[k] : undefined, mine[k], disk[k]);
  }
  return out;
}

class Store extends EventEmitter {
  constructor() {
    super();
    this.dataPath = path.join(app.getPath('userData'), 'quicklauncher-data.json');
    this.tmpPath = this.dataPath + '.tmp';
    this.bakPath = this.dataPath + '.bak';
    this._saveTimer = null;
    this._dirty = false;
    // True while dataPath on disk holds a verified-good generation (loaded and
    // validated, or written by us). Only then may it be rotated into .bak.
    this._mainGood = false;
    this._mainAppsCount = 0;
    // True while the data file exists but can't be read: never write it.
    this._readOnly = false;
    this._roCause = null;      // the file whose unreadability made the store read-only
    this._roBase = null;       // copy of the data shown when read-only began (merge base)
    this._loadSource = null;   // where _load() got its data: main | tmp | bak | none
    this._recheckTimer = null;
    this._roTicks = 0;          // failed timer re-checks in this read-only stretch
    this._roBannerRaised = false; // save-error already raised in this read-only stretch
    // Renderer sync after a mid-session merge (setFromRenderer / rendererSynced).
    this._view = null;         // { apps, settings } the renderer holds while it may be stale
    this._syncSeq = 0;
    this._pushed = new Map();  // seq → state pushed to the renderer, until acked
    this.data = this._load();
    if (this._readOnly) {
      this._roBase = structuredClone(this.data);
      this._startRecheckTimer();
    }
  }

  // Valid store shape: a plain object whose `apps` is an array (every version
  // since v1.0.0 has written both keys) and whose `settings`, if present, is
  // a plain object. `null`, `{}`, `[]`, `{ apps: null }` are all rejected.
  _isValid(obj) {
    return isPlainObject(obj)
      && Array.isArray(obj.apps)
      && (obj.settings === undefined || isPlainObject(obj.settings));
  }

  // Read + validate one candidate file.
  // Returns { ok: true, data } or { ok: false, reason: 'missing'|'locked'|'corrupt', code }.
  _readCandidate(p, retries) {
    let raw;
    for (let attempt = 0; ; attempt++) {
      try {
        raw = fs.readFileSync(p, 'utf8');
        break;
      } catch (err) {
        if (err && err.code === 'ENOENT') return { ok: false, reason: 'missing' };
        if (err && TRANSIENT.has(err.code) && attempt < retries) {
          sleepSync(100 * (attempt + 1));
          continue;
        }
        return { ok: false, reason: 'locked', code: err && (err.code || err.message) };
      }
    }
    try {
      const obj = JSON.parse(raw);
      if (!this._isValid(obj)) return { ok: false, reason: 'corrupt', code: 'BAD_SHAPE' };
      return { ok: true, data: obj };
    } catch {
      return { ok: false, reason: 'corrupt', code: 'PARSE' };
    }
  }

  // retries: read retries for the data file (startup: 5, ~1.5 s of sleeps on
  // a held file). Mid-session re-checks pass 0 so the UI thread never sleeps.
  _load(retries = 5) {
    const other = Math.min(retries, 1);
    // 1. The data file itself. Up to ~2 s of retries if something holds it.
    const main = this._readCandidate(this.dataPath, retries);
    if (main.ok) {
      this._mainGood = true;
      this._mainAppsCount = main.data.apps.length;
      this._loadSource = 'main';
      return { ...this._defaults(), ...main.data };
    }

    if (main.reason === 'locked') {
      // The data file exists but is unreadable. It may be perfectly good, so it
      // must not be overwritten until it can be read again. Show the newest
      // readable copy.
      this._readOnly = true;
      this._roCause = this.dataPath;
      console.error(`[store] data file unreadable (${main.code}); read-only until it can be read — nothing will be written`);
      for (const p of [this.tmpPath, this.bakPath]) {
        const r = this._readCandidate(p, other);
        if (r.ok) return { ...this._defaults(), ...r.data };
      }
      return this._defaults();
    }

    // 2. Data file missing or corrupt: newest intact generation wins.
    //    .tmp is only ever left behind by a crash after it was fully written
    //    (it is fsync'ed before the rename); a partial .tmp fails validation.
    const tmp = this._readCandidate(this.tmpPath, other);
    const bak = tmp.ok ? null : this._readCandidate(this.bakPath, other);
    const recovered = tmp.ok ? tmp : (bak && bak.ok ? bak : null);

    if (main.reason === 'corrupt') this._quarantine(this.dataPath);

    if (recovered) {
      this._loadSource = tmp.ok ? 'tmp' : 'bak';
      console.warn(`[store] data file ${main.reason} (${main.code || '-'}); recovered from ${path.basename(tmp.ok ? this.tmpPath : this.bakPath)}`);
      // Restore the data file promptly so there are two good copies again.
      this._save();
      return { ...this._defaults(), ...recovered.data };
    }

    // Nothing intact anywhere. Preserve every unreadable file for manual
    // recovery; never let defaults silently replace them.
    if (tmp.reason === 'corrupt') this._quarantine(this.tmpPath);
    if (bak && bak.reason === 'corrupt') this._quarantine(this.bakPath);
    if (bak && bak.reason === 'locked') {
      // .bak exists but can't be read: don't rotate anything over it later.
      this._readOnly = true;
      this._roCause = this.bakPath;
      console.error(`[store] backup unreadable (${bak.code}); read-only until it can be read`);
    }
    if (main.reason === 'corrupt' || tmp.reason === 'corrupt' || (bak && bak.reason === 'corrupt')) {
      console.error('[store] no intact data file or backup found; unreadable files were quarantined as *.corrupt-<timestamp>');
    }
    // (All missing = first run: defaults, normal saving.)
    this._loadSource = 'none';
    return this._defaults();
  }

  // ── Leaving read-only ─────────────────────────────────────────────────────

  _startRecheckTimer() {
    if (this._recheckTimer) return;
    this._recheckTimer = setInterval(() => this._recheckTick(), Store.RECHECK_MS);
    if (this._recheckTimer.unref) this._recheckTimer.unref();
  }

  // Timer tick. Still read-only after two failed ticks (~10 s) and no refused
  // save has raised the save-error banner yet in this read-only stretch →
  // raise it once (same 'save-error' event, so it reaches the renderer through
  // the same delivery queue). A lock that clears sooner shows nothing.
  _recheckTick() {
    this.recheck();
    if (!this._readOnly) return;
    this._roTicks++;
    if (this._roTicks >= 2 && !this._roBannerRaised) {
      this._roBannerRaised = true;
      const err = new Error('store is read-only (data file is unreadable)');
      console.error('[store] still read-only after two re-checks —', err.message);
      this.emit('save-error', err);
    }
  }

  // Focus / timer entry point. No-op unless read-only; writes the merged
  // result as soon as the file reads again.
  recheck() {
    if (!this._readOnly) return;
    if (this._recheck(0) && this._dirty) this.flush();
  }

  // While read-only: has the file that caused it become readable (or gone, or
  // corrupt)? If so, load it exactly as at startup — same validation,
  // quarantine and .tmp/.bak recovery — and merge this session's changes into
  // it. Nothing is written here; the caller saves the merged data through the
  // normal durable path. Returns true once the store is writable again.
  _recheck(retries = 0) {
    if (!this._readOnly) return true;
    // Cheap probe first; while the file is still held this is one failed open.
    if (this._readCandidate(this._roCause, retries).reason === 'locked') return false;

    const mine = this.data;
    this._readOnly = false;
    this._mainGood = false;
    this._mainAppsCount = 0;
    const disk = this._load(retries);
    // _load()'s recovery path schedules a save of its own; the merged save
    // below replaces it.
    clearTimeout(this._saveTimer);
    this._saveTimer = null;
    if (this._readOnly) return false; // unreadable again (or now the backup is)

    // Nothing intact on disk any more (all missing or quarantined): this
    // session's copy is the only one left, so it is kept whole.
    const merged = this._loadSource === 'none' ? mine : reconcile(this._roBase, mine, disk);
    clearInterval(this._recheckTimer);
    this._recheckTimer = null;
    this._roTicks = 0;
    this._roBannerRaised = false;
    this._roCause = null;
    this._roBase = null;
    this.data = merged;
    if (this._loadSource === 'none' || !same(merged, disk)) this._dirty = true;
    console.warn(`[store] data file readable again (loaded from ${this._loadSource}); merged this session's changes — saving resumes`);
    if (!same(mine.apps, merged.apps) || !same(mine.settings, merged.settings)) {
      // The renderer still shows `mine`. Until it has applied the merged state
      // its saves are merged against that copy (setFromRenderer), so a stale
      // save can't overwrite what the merge brought back from disk. Set up
      // before any listener runs, so no listener can skip it.
      this._view = { apps: mine.apps, settings: mine.settings };
      this._pushRendererState();
    }
    // The timer is already stopped and the caller still has to write the
    // merged data (the _flush in progress, or recheck()'s flush): a throwing
    // listener must not skip that save.
    this._emitSafe('reconciled');
    return true;
  }

  // emit(), except that a listener's exception is logged instead of thrown
  // into the store (each listener runs even if an earlier one threw).
  _emitSafe(name, ...args) {
    for (const fn of this.rawListeners(name)) {
      try { fn.apply(this, args); } catch (err) { console.error(`[store] '${name}' listener threw:`, err); }
    }
  }

  _pushRendererState() {
    const state = { seq: ++this._syncSeq, apps: this.data.apps, settings: this.data.settings };
    this._pushed.set(state.seq, state);
    this._emitSafe('renderer-sync', state);
  }

  // A save from the renderer (whole `apps` array / whole `settings` object).
  // Normally a plain set(). Right after a mid-session merge the renderer may
  // still hold its pre-merge copy; its save is then merged against that copy
  // and the result pushed back, until it acks the latest state.
  setFromRenderer(key, value) {
    if (!this._view || !(key in this._view)) return this.set(key, value);
    const merged = mergeValue(key, this._view[key], value, this.data[key]);
    this._view[key] = value; // what the renderer holds now
    this.set(key, merged);
    this._pushRendererState();
  }

  // The renderer adopted pushed state `seq`. It acks synchronously right after
  // adopting it, so every save it sent before the ack was based on an older
  // copy and has already been merged.
  rendererSynced(seq) {
    const st = this._pushed.get(seq);
    if (!st) return;
    for (const s of [...this._pushed.keys()]) if (s <= seq) this._pushed.delete(s);
    this._view = seq === this._syncSeq ? null : { apps: st.apps, settings: st.settings };
  }

  // Latest un-acked state, for a renderer that (re)attaches mid-sync.
  pendingRendererState() {
    return this._view ? (this._pushed.get(this._syncSeq) || null) : null;
  }

  // The pre-merge copy the renderers still show (undefined when none is
  // pending). With several region pages, the controller replaces one
  // region's items inside this copy before calling setFromRenderer().
  rendererView(key) {
    return this._view ? this._view[key] : undefined;
  }

  // Move an unreadable file aside (never delete it) so a later save can't
  // replace the only remaining copy of the user's data.
  _quarantine(p) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = `${p}.corrupt-${stamp}`;
    try {
      fs.renameSync(p, dest);
    } catch (err) {
      try { fs.copyFileSync(p, dest); } catch { /* best effort */ }
      console.warn('[store] quarantine rename failed:', err && (err.code || err.message));
    }
  }

  _defaults() {
    return {
      apps: [],
      settings: {
        iconSize: 64,
        startWithWindows: true,
        randomTheme: true,
        theme: 'cyberpunk',
        windowPosition: null,
        // Global show/hide hotkey — Sergei's locked default 'Ctrl+Space'
        // (UX Review §6A / I1, Decisions Locked In #1). Use null to disable.
        globalHotkey: 'Ctrl+Space',
        // Reduce motion: explicit user setting independent of OS pref.
        // When true (or when prefers-reduced-motion: reduce is set at the OS
        // level), persistent ambient animations are suppressed. (UX Review §5)
        reducedMotion: false
      }
    };
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this._save();
  }

  // Debounced save — same 100 ms coalescing as before.
  _save() {
    this._dirty = true;
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this._flush(), 100);
  }

  // Write any pending change now, synchronously. Call before app.exit() /
  // quitAndInstall() so the last change isn't dropped with the debounce timer.
  // Returns true when the data on disk is current (the file move commits
  // through this and only marks its journal entry done on true).
  flush() {
    clearTimeout(this._saveTimer);
    this._saveTimer = null;
    // Quit / logoff: a read-only re-check may wait out a short hold (~0.3 s).
    if (this._dirty) this._flush(2);
    return !this._dirty;
  }

  // The data file exists but cannot be read: nothing may be written. The file
  // move refuses to start while this is true ("Moving is unavailable").
  isReadOnly() {
    return this._readOnly;
  }

  _flush(retries = 0) {
    this._saveTimer = null;
    // Read-only: re-check before refusing — the file may be readable again,
    // in which case this.data is now the merged result and is saved below.
    if (this._readOnly && !this._recheck(retries)) {
      const err = new Error('store is read-only (data file is unreadable)');
      console.error('Failed to save store:', err.message);
      // A lock that clears within ~10 s shows nothing: before the second
      // failed timer re-check a refusal is only logged (the change stays
      // _dirty and is written once the file reads). From then on every
      // refused save raises the save-error banner.
      if (this._roTicks >= 2) {
        this._roBannerRaised = true; // the 10 s read-only notice won't repeat it
        this.emit('save-error', err);
      }
      return;
    }
    const json = JSON.stringify(this.data, null, 2);
    try {
      this._writeDurable(this.tmpPath, json);
      this._rotateBackup();
      this._renameRetry(this.tmpPath, this.dataPath);
      this._mainGood = true;
      this._mainAppsCount = Array.isArray(this.data.apps) ? this.data.apps.length : 0;
      this._dirty = false;
    } catch (err) {
      // _dirty stays true: the next set() or flush() retries the whole sequence.
      // If the backup rotation already happened, the data file is missing but
      // .tmp (fsync'ed) and .bak are intact, and _load() recovers from .tmp.
      if (!fs.existsSync(this.dataPath)) this._mainGood = false;
      console.error('Failed to save store:', err);
      this.emit('save-error', err);
    }
  }

  // open → write → fsync → close. The bytes are on disk before anything
  // points at this file.
  _writeDurable(p, text) {
    const fd = fs.openSync(p, 'w');
    try {
      fs.writeFileSync(fd, text, 'utf8');
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
  }

  // Move the current (verified-good) data file to .bak with an atomic rename.
  // Skipped when the data file isn't a verified-good generation, and when it
  // has no shortcuts but the existing .bak does — so an emptied library can
  // never replace the last backup that still has them.
  _rotateBackup() {
    if (!this._mainGood) return;
    if (this._mainAppsCount === 0) {
      const b = this._readCandidate(this.bakPath, 1);
      if (b.ok && b.data.apps.length > 0) return;
    }
    try {
      this._renameRetry(this.dataPath, this.bakPath);
    } catch (err) {
      // Not fatal: the tmp → data rename below still lands the new generation.
      console.warn('[store] backup rotation failed:', err && (err.code || err.message));
    }
  }

  // rename with a short retry for transient AV/indexer locks.
  _renameRetry(from, to) {
    for (let attempt = 0; ; attempt++) {
      try {
        fs.renameSync(from, to);
        return;
      } catch (err) {
        if (err && TRANSIENT.has(err.code) && attempt < 4) {
          sleepSync(50 * (attempt + 1));
          continue;
        }
        throw err;
      }
    }
  }
}

// How often a read-only store re-checks the data file (one failed open per
// tick while it is still held).
Store.RECHECK_MS = 5000;

module.exports = Store;
