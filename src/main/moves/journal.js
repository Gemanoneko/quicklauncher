'use strict';
// Write-ahead journal for the safe file move (tech plan § 3).
//
// moves-journal.json (profile folder) holds the moves that have started and
// not yet finished: an `intent` is written BEFORE a file moves, and it leaves
// the journal only when the move and the store commit are both on disk
// (`done`) or the move is known not to have happened (`aborted`). The file is
// written like the store: .tmp, fsync, rename. moves-log.jsonl is the
// append-only history (every intent, done and aborted record, fsync'ed).
//
// Only the journal's own two files are ever written here. No user file is
// touched, and nothing is deleted.

const fs = require('fs');
const path = require('path');

const JOURNAL = 'moves-journal.json';
const LOG = 'moves-log.jsonl';

class Journal {
  constructor(dir, { fsp = fs.promises } = {}) {
    this.dir = dir;
    this.path = path.join(dir, JOURNAL);
    this.tmpPath = `${this.path}.tmp`;
    this.logPath = path.join(dir, LOG);
    this.fsp = fsp;
    this.entries = [];
    this.loadNote = null;
  }

  /** Read the pending entries. A missing journal is empty; an unreadable one is set aside, never deleted. */
  async load() {
    let raw = null;
    try {
      raw = await this.fsp.readFile(this.path, 'utf8');
    } catch (e) {
      if (e && e.code === 'ENOENT') { this.entries = []; return this.entries; }
      throw e;
    }
    try {
      const j = JSON.parse(raw);
      this.entries = Array.isArray(j && j.entries) ? j.entries.filter((x) => x && typeof x === 'object' && x.id) : [];
    } catch {
      // Keep the unreadable journal for a person to read; the store-folder scan
      // still finds any file it was about.
      const aside = `${this.path}.corrupt-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      try { await this.fsp.rename(this.path, aside); } catch { /* left in place */ }
      this.loadNote = `journal unreadable, kept as ${path.basename(aside)}`;
      this.entries = [];
    }
    return this.entries;
  }

  pending() { return this.entries.slice(); }

  async _write() {
    const text = `${JSON.stringify({ version: 1, entries: this.entries }, null, 2)}\n`;
    const fh = await this.fsp.open(this.tmpPath, 'w');
    try {
      await fh.writeFile(text, 'utf8');
      await fh.sync();
    } finally {
      await fh.close();
    }
    await this.fsp.rename(this.tmpPath, this.path);
  }

  async _append(rec) {
    const fh = await this.fsp.open(this.logPath, 'a');
    try {
      await fh.writeFile(`${JSON.stringify({ at: new Date().toISOString(), ...rec })}\n`, 'utf8');
      await fh.sync();
    } finally {
      await fh.close();
    }
  }

  /** Before a file moves: the intent is on disk first. */
  async intent(entry) {
    const e = { ...entry, state: 'intent', startedAt: new Date().toISOString() };
    this.entries.push(e);
    try {
      await this._write();
    } catch (err) {
      // Not on disk: the caller must not move, so the intent is not pending either (fix-pass C1).
      this.entries = this.entries.filter((x) => x !== e);
      throw err;
    }
    await this._append({ ...e }); // on a throw here the intent is on disk; the caller aborts it
    return e;
  }

  /** An intent changed before its move ran (a new target name after a collision). */
  async update(id, patch) {
    const e = this.entries.find((x) => x.id === id);
    if (!e) return null;
    Object.assign(e, patch);
    await this._write();
    await this._append({ id, state: 'intent-updated', ...patch });
    return e;
  }

  /** done or aborted: into the history, out of the pending list. */
  async finish(id, state, extra = {}) {
    const e = this.entries.find((x) => x.id === id);
    await this._append({ ...(e || { id }), ...extra, state });
    this.entries = this.entries.filter((x) => x.id !== id);
    await this._write();
  }

  /** A history line with no pending entry (reconcile notes, orphan adoptions). */
  async note(rec) { await this._append(rec); }
}

module.exports = { Journal, JOURNAL, LOG };
