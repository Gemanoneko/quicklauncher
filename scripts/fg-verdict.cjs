'use strict';
// Verdict on a foreground-observer log (scripts/fg-observer.mjs). Pure: the
// self-test gates on it and test/regions/fg-verdict.test.js checks it.
//
// The gate: no foreground change may go to a window of our test build
// (`exe`, full path). Every foreground change is still listed, so a run can
// report what happened on the machine while it ran.

const norm = (p) => String(p || '').replace(/\//g, '\\').toLowerCase();

function readEvents(text) {
  return String(text || '').split(/\r?\n/).filter(Boolean).map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

const short = (w) => (w && w.alive !== false ? `${w.cls}|${String(w.proc || '?').split('\\').pop()}` : 'gone');

/**
 * events: parsed observer lines. Returns { ok, hooksOk, ours, changes, ourShows, started, ended }.
 *   ours      foreground changes to our build's windows (the gate: must be 0)
 *   changes   every foreground change, as { at (ms after start), from, to, ours }
 *   ourShows  top-level windows of our build shown (proves the hook sees our process)
 */
function foregroundVerdict(events, { exe } = {}) {
  const ourExe = norm(exe);
  const isOurs = (p) => !!ourExe && norm(p) === ourExe;
  const list = Array.isArray(events) ? events : [];
  const start = list.find((e) => e.ev === 'start');
  const hooks = list.find((e) => e.ev === 'hooks');
  const t0 = start ? start.t : (list[0] && list[0].t) || 0;
  const changes = list.filter((e) => e.ev === 'FOREGROUND').map((e) => ({
    at: e.t - t0, from: short(e.prev), to: short(e.now), ours: isOurs(e.now && e.now.proc),
  }));
  const ours = changes.filter((c) => c.ours);
  const ourShows = list.filter((e) => e.ev === 'SHOW' && typeof e.id === 'string' && isOurs(e.id.split('|').slice(1).join('|'))).length;
  const hooksOk = !!(hooks && Array.isArray(hooks.ok) && hooks.ok.length && hooks.ok.every(Boolean));
  return { ok: hooksOk && ours.length === 0, hooksOk, ours, changes, ourShows, started: !!start, ended: list.some((e) => e.ev === 'end') };
}

module.exports = { readEvents, foregroundVerdict };
