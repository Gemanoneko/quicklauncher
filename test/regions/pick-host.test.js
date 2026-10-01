'use strict';
// Plain Node: node --test test/ (ported from the spike)
const test = require('node:test');
const assert = require('node:assert/strict');
const { pickHost } = require('../../src/main/desktop/pick-host');

const DV = { hwnd: 0xb4, cls: 'SHELLDLL_DefView' };

test('24H2+ raised layout: DefView and wallpaper WorkerW both under Progman', () => {
  const r = pickHost({ progman: 0xa4, progmanChildren: [DV, { hwnd: 0xc0, cls: 'WorkerW' }], workerWs: [{ hwnd: 0x21c, children: [] }] });
  assert.deepEqual([r.ok, r.host, r.defView, r.layout], [true, 0xa4, 0xb4, 'raised']);
});

test('unsplit layout: DefView under Progman, no WorkerW', () => {
  const r = pickHost({ progman: 0xa4, progmanChildren: [DV], workerWs: [] });
  assert.deepEqual([r.ok, r.host, r.layout], [true, 0xa4, 'unsplit']);
});

test('classic split (Win10 / pre-24H2 after 0x052C): DefView in a top-level WorkerW', () => {
  const r = pickHost({
    progman: 0xa4, progmanChildren: [],
    workerWs: [{ hwnd: 0x300, children: [DV] }, { hwnd: 0x310, children: [] }],
  });
  assert.deepEqual([r.ok, r.host, r.defView, r.layout], [true, 0x300, 0xb4, 'classic-split']);
});

test('Explorer gone: no Progman -> not ok, no guess', () => {
  const r = pickHost({ progman: 0, progmanChildren: [], workerWs: [] });
  assert.equal(r.ok, false);
  assert.equal(r.layout, 'no-progman');
});

test('unknown layout: no DefView anywhere -> not ok, caller falls back', () => {
  const r = pickHost({ progman: 0xa4, progmanChildren: [{ hwnd: 0xc0, cls: 'WorkerW' }], workerWs: [{ hwnd: 0x300, children: [] }] });
  assert.equal(r.ok, false);
  assert.equal(r.layout, 'unknown');
});

test('ambiguous: two WorkerWs claim a DefView -> not ok', () => {
  const r = pickHost({ progman: 0xa4, progmanChildren: [], workerWs: [{ hwnd: 1, children: [DV] }, { hwnd: 2, children: [DV] }] });
  assert.equal(r.ok, false);
});

test('Progman wins when DefView is under it, even if a WorkerW also has one', () => {
  const r = pickHost({ progman: 0xa4, progmanChildren: [DV], workerWs: [{ hwnd: 0x300, children: [DV] }] });
  assert.equal(r.host, 0xa4);
});
