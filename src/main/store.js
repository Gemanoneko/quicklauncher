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
    } catch {
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
      fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Failed to save store:', err);
          this.emit('save-error', err);
        }
      });
    }, 100);
  }
}

module.exports = Store;
