'use strict';
// Plain Node: node --test test/
// The banner slot's two layers (UX spec, fix-pass addendum C5): a notice over
// an update offer, the offer back after it as it is then, the tray dot cleared
// only by the update message's own ✕. Fake timers; no DOM.
const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('../../src/renderer/banner-layers.js');

function rig() {
  const views = [];
  let dismissed = 0;
  let seq = 0;
  const timers = new Map();
  const banner = B.createBanner({
    draw: (v) => views.push(v ? JSON.parse(JSON.stringify(v)) : null),
    dismissUpdate: () => { dismissed += 1; },
    setTimer: (fn, ms) => { const id = ++seq; timers.set(id, { fn, ms }); return id; },
    clearTimer: (id) => { timers.delete(id); },
  });
  // Run every timer of this length that is pending now (time passing).
  const elapse = (ms) => { for (const [id, t] of [...timers]) if (t.ms === ms) { timers.delete(id); t.fn(); } };
  return { banner, views, last: () => views[views.length - 1], dismissed: () => dismissed, timers, elapse };
}
const OFFER = ['UPDATE AVAILABLE — v9.9.9', [{ label: 'DOWNLOAD', action: 'download' }]];

test('a notice over an update offer: the notice takes the slot; after 8 s the offer is back with its button; the tray dot stays', () => {
  const r = rig();
  r.banner.setUpdate(...OFFER);
  assert.deepEqual(r.last(), { layer: 'update', text: OFFER[0], actions: [{ label: 'DOWNLOAD', action: 'download', disabled: false }] });
  r.banner.showNotice('NOT A SHORTCUT');
  assert.deepEqual(r.last(), { layer: 'notice', text: 'NOT A SHORTCUT', actions: [] });
  assert.equal(B.NOTICE_MS, 8000);
  r.elapse(8000);
  assert.deepEqual(r.last(), { layer: 'update', text: OFFER[0], actions: [{ label: 'DOWNLOAD', action: 'download', disabled: false }] });
  assert.equal(r.dismissed(), 0, 'a notice ending never clears the tray dot');
});

test('the notice ✕ brings the offer back too; the offer ✕ hides the slot and clears the tray dot (once)', () => {
  const r = rig();
  r.banner.setUpdate(...OFFER);
  r.banner.showNotice('COULD NOT LAUNCH "X" — TARGET MISSING');
  r.banner.close('notice');
  assert.equal(r.last().layer, 'update');
  assert.equal(r.dismissed(), 0);
  r.banner.close('update');
  assert.equal(r.last(), null);
  assert.equal(r.dismissed(), 1);
  assert.equal(r.banner.state().drawn, null);
});

test('a notice alone: the slot hides after it; nothing to dismiss', () => {
  const r = rig();
  r.banner.showNotice('SAVE ERROR — SETTINGS MAY NOT PERSIST');
  r.elapse(8000);
  assert.equal(r.last(), null);
  assert.equal(r.dismissed(), 0);
});

test('another notice replaces the notice and restarts its time', () => {
  const r = rig();
  r.banner.showNotice('NOT A SHORTCUT');
  r.banner.showNotice('2 FILES ARE NOT SHORTCUTS');
  assert.equal([...r.timers.values()].filter((t) => t.ms === 8000).length, 1, 'one notice timer');
  assert.deepEqual(r.last(), { layer: 'notice', text: '2 FILES ARE NOT SHORTCUTS', actions: [] });
});

test('update events during a notice change the hidden update layer and show when it ends: percentage, button state, a newer message', () => {
  const r = rig();
  r.banner.setUpdate(...OFFER);
  r.banner.markAction('download', { label: 'DOWNLOADING...', disabled: true });
  r.banner.showNotice('NOT A SHORTCUT');
  const n = r.views.length;
  r.banner.updateProgress(42);
  assert.equal(r.views.length, n, 'nothing redrawn behind the notice');
  r.elapse(8000);
  assert.deepEqual(r.last(), { layer: 'update', text: 'DOWNLOADING... 42%', actions: [{ label: 'DOWNLOADING...', action: 'download', disabled: true }] });
  r.banner.showNotice('NOT A SHORTCUT');
  r.banner.setUpdate('UPDATE READY — WILL INSTALL AND RESTART', [{ label: 'INSTALL NOW', action: 'install' }]);
  assert.equal(r.last().layer, 'notice', 'no update event replaces a notice early');
  r.elapse(8000);
  assert.deepEqual(r.last(), { layer: 'update', text: 'UPDATE READY — WILL INSTALL AND RESTART', actions: [{ label: 'INSTALL NOW', action: 'install', disabled: false }] });
});

test('a timed update message starts its timer when it is drawn, not behind a notice', () => {
  const r = rig();
  r.banner.showNotice('NOT A SHORTCUT');
  r.banner.setUpdate('SYSTEM IS UP TO DATE', [], 3000);
  assert.ok(![...r.timers.values()].some((t) => t.ms === 3000), 'no update timer while covered');
  r.elapse(8000);
  assert.deepEqual(r.last(), { layer: 'update', text: 'SYSTEM IS UP TO DATE', actions: [] });
  assert.ok([...r.timers.values()].some((t) => t.ms === 3000), 'its timer starts now');
  // Covered again before it ran out: the timer stops, and starts afresh when drawn.
  r.banner.showNotice('NOT A SHORTCUT');
  assert.ok(![...r.timers.values()].some((t) => t.ms === 3000));
  r.elapse(8000);
  r.elapse(3000);
  assert.equal(r.last(), null);
  assert.equal(r.dismissed(), 1, 'the update layer\'s own timer, as before');
});

test('progress with no update message does nothing (it was dismissed)', () => {
  const r = rig();
  r.banner.updateProgress(10);
  assert.deepEqual(r.views, []);
});
