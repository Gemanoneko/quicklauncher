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
//      trouble) puts the store in read-only mode for the session, so defaults
//      or a stale backup are never written over it.

// Windows error codes that are usually transient (AV scanner, search indexer,
// backup agent briefly holding the file). Worth a short retry.
const TRANSIENT = new Set(['EBUSY', 'EPERM', 'EACCES']);

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
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
    // True when the data file exists but couldn't be read: never write it.
    this._readOnly = false;
    this.data = this._load();
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

  _load() {
    // 1. The data file itself. Up to ~2 s of retries if something holds it.
    const main = this._readCandidate(this.dataPath, 5);
    if (main.ok) {
      this._mainGood = true;
      this._mainAppsCount = main.data.apps.length;
      return { ...this._defaults(), ...main.data };
    }

    if (main.reason === 'locked') {
      // The data file exists but is unreadable. It may be perfectly good, so it
      // must not be overwritten this session. Show the newest readable copy.
      this._readOnly = true;
      console.error(`[store] data file unreadable (${main.code}); read-only this session — nothing will be written`);
      for (const p of [this.tmpPath, this.bakPath]) {
        const r = this._readCandidate(p, 1);
        if (r.ok) return { ...this._defaults(), ...r.data };
      }
      return this._defaults();
    }

    // 2. Data file missing or corrupt: newest intact generation wins.
    //    .tmp is only ever left behind by a crash after it was fully written
    //    (it is fsync'ed before the rename); a partial .tmp fails validation.
    const tmp = this._readCandidate(this.tmpPath, 1);
    const bak = tmp.ok ? null : this._readCandidate(this.bakPath, 1);
    const recovered = tmp.ok ? tmp : (bak && bak.ok ? bak : null);

    if (main.reason === 'corrupt') this._quarantine(this.dataPath);

    if (recovered) {
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
      console.error(`[store] backup unreadable (${bak.code}); read-only this session`);
    }
    if (main.reason === 'corrupt' || tmp.reason === 'corrupt' || (bak && bak.reason === 'corrupt')) {
      console.error('[store] no intact data file or backup found; unreadable files were quarantined as *.corrupt-<timestamp>');
    }
    // (All missing = first run: defaults, normal saving.)
    return this._defaults();
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
  flush() {
    clearTimeout(this._saveTimer);
    this._saveTimer = null;
    if (this._dirty) this._flush();
  }

  _flush() {
    this._saveTimer = null;
    if (this._readOnly) {
      const err = new Error('store is read-only this session (data file was unreadable at startup)');
      console.error('Failed to save store:', err.message);
      this.emit('save-error', err);
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

module.exports = Store;
