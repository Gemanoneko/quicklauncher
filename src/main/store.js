const { app } = require('electron');
const fs = require('fs');
const path = require('path');

class Store {
  constructor() {
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
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save store:', e);
    }
  }
}

module.exports = Store;
