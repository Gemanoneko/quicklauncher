const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class Store extends EventEmitter {
  constructor() {
    super();
    this.dataPath = path.join(app.getPath('userData'), 'quicklauncher-data.json');
    this.data = this._load();
  }

  _load() {
    try {
      const raw = fs.readFileSync(this.dataPath, 'utf8');
      return { ...this._defaults(), ...JSON.parse(raw) };
    } catch (err) {
      // ENOENT: no file yet (first run). Silent return of defaults — expected.
      if (err && err.code === 'ENOENT') {
        return this._defaults();
      }
      // SyntaxError: main file is corrupt. Try .bak silently (the common case
      // after a crashed write), then fall through to defaults if .bak is also bad.
      if (err instanceof SyntaxError) {
        try {
          const raw = fs.readFileSync(this.dataPath + '.bak', 'utf8');
          return { ...this._defaults(), ...JSON.parse(raw) };
        } catch {
          // fall through to defaults
        }
        return this._defaults();
      }
      // Anything else (EBUSY, EACCES, EPERM, transient IO failure): warn loudly
      // and try .bak. Do NOT silently reset to defaults — that would destroy the
      // user's data if the main file was merely temporarily locked.
      console.warn('[store] main file load failed:', err && (err.code ?? err.message));
      try {
        const raw = fs.readFileSync(this.dataPath + '.bak', 'utf8');
        return { ...this._defaults(), ...JSON.parse(raw) };
      } catch (bakErr) {
        console.warn('[store] .bak load also failed:', bakErr && (bakErr.code ?? bakErr.message));
      }
      return this._defaults();
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
        windowPosition: null
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

  _save() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      // Atomic write: write to .tmp, then rename onto dataPath.
      // Rename is atomic on Windows when src/dst are on the same volume (always true here — same userData folder).
      const tmp = this.dataPath + '.tmp';
      const json = JSON.stringify(this.data, null, 2);
      fs.writeFile(tmp, json, 'utf8', (err) => {
        if (err) {
          console.error('Failed to save store:', err);
          this.emit('save-error', err);
          return;
        }
        fs.rename(tmp, this.dataPath, (err2) => {
          if (err2) {
            console.error('Failed to save store:', err2);
            this.emit('save-error', err2);
            return;
          }
          // Refresh .bak from the now-good file so _load() can recover on future corruption. Best-effort.
          fs.copyFile(this.dataPath, this.dataPath + '.bak', (err3) => {
            if (err3) console.warn('[store] .bak refresh failed:', err3.code ?? err3.message);
          });
        });
      });
    }, 100);
  }
}

module.exports = Store;
