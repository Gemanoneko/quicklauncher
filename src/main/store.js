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
      // On corruption (SyntaxError), try the .bak written after the last good save.
      if (err instanceof SyntaxError) {
        try {
          const raw = fs.readFileSync(this.dataPath + '.bak', 'utf8');
          return { ...this._defaults(), ...JSON.parse(raw) };
        } catch {
          // fall through to defaults
        }
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
          fs.copyFile(this.dataPath, this.dataPath + '.bak', () => {});
        });
      });
    }, 100);
  }
}

module.exports = Store;
