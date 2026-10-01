'use strict';
// Plain Node: node --test test/
// The self-test's focus gate (scripts/fg-verdict.cjs) on observer logs shaped
// like scripts/fg-observer.mjs writes them.
const test = require('node:test');
const assert = require('node:assert/strict');
const { readEvents, foregroundVerdict } = require('../../scripts/fg-verdict.cjs');

const EXE = 'C:\\Antigravity Projects\\QuickLaunch-regions-spike\\dist\\win-unpacked\\QuickLauncher.exe';
const INSTALLED = 'C:\\Users\\x\\AppData\\Local\\Programs\\QuickLauncher\\QuickLauncher.exe';
const w = (cls, proc, visible = true) => ({ h: '0x1', cls, proc, visible });
const line = (o) => JSON.stringify(o);
const base = [
  line({ t: 1000, ev: 'start', fg: w('Chrome_WidgetWin_1', 'claude.exe') }),
  line({ t: 1001, ev: 'hooks', ok: [true, true] }),
  line({ t: 2000, ev: 'FOREGROUND', now: w('Chrome_WidgetWin_1', 'chrome.exe'), prev: w('Chrome_WidgetWin_1', 'claude.exe') }),
  line({ t: 2500, ev: 'SHOW', h: '0x2', id: `Chrome_WidgetWin_1|${EXE}` }),
  line({ t: 2600, ev: 'FOREGROUND', now: w('Chrome_WidgetWin_1', INSTALLED), prev: w('Chrome_WidgetWin_1', 'chrome.exe') }),
];
const end = line({ t: 9000, ev: 'end', fg: w('Chrome_WidgetWin_1', 'chrome.exe') });

test('no foreground change to this build: pass; every change is listed; the installed QuickLauncher is not this build', () => {
  const v = foregroundVerdict(readEvents([...base, end].join('\n')), { exe: EXE });
  assert.equal(v.ok, true);
  assert.equal(v.changes.length, 2);
  assert.equal(v.ours.length, 0);
  assert.equal(v.ourShows, 1);
  assert.deepEqual(v.changes[0], { at: 1000, from: 'Chrome_WidgetWin_1|claude.exe', to: 'Chrome_WidgetWin_1|chrome.exe', ours: false });
  assert.equal(v.started && v.ended, true);
});

test('one foreground change to a hidden window of this build (what the unguarded SetParent did): fail', () => {
  const ours = line({ t: 3000, ev: 'FOREGROUND', now: w('Chrome_WidgetWin_1', EXE.toLowerCase().replace(/\\/g, '/'), false), prev: w('Chrome_WidgetWin_1', 'chrome.exe') });
  const v = foregroundVerdict(readEvents([...base, ours, end].join('\n')), { exe: EXE });
  assert.equal(v.ok, false);
  assert.equal(v.ours.length, 1, 'matched ignoring case and slash style');
});

test('hooks that did not install never pass; junk lines are skipped', () => {
  const bad = base.map((l) => (l.includes('"hooks"') ? line({ t: 1001, ev: 'hooks', ok: [true, false] }) : l));
  assert.equal(foregroundVerdict(readEvents([...bad, 'not json', end].join('\n')), { exe: EXE }).ok, false);
  assert.equal(foregroundVerdict([], { exe: EXE }).ok, false);
});
