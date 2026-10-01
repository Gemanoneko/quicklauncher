'use strict';
// Plain Node: node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('../../src/renderer/tile-order.js');

// A Grid row of 96 x 96 cells, 8 px apart, starting at (16, 56).
const cell = (col, row = 0) => ({ left: 16 + col * 104, top: 56 + row * 104, right: 16 + col * 104 + 96, bottom: 56 + row * 104 + 96 });
const tiles = (n, cols = 3) => Array.from({ length: n }, (_, i) => ({ index: i, rect: cell(i % cols, Math.floor(i / cols)) }));

test('insertionIndex: before the nearest tile left of its centre, after it right of its centre', () => {
  const t = tiles(5);
  assert.equal(T.insertionIndex(t, null, { x: 130, y: 100 }, 5), 1, 'left half of tile 1');
  assert.equal(T.insertionIndex(t, null, { x: 190, y: 100 }, 5), 2, 'right half of tile 1');
  assert.equal(T.insertionIndex(t, null, { x: 20, y: 100 }, 5), 0, 'left half of the first tile');
  assert.equal(T.insertionIndex(t, null, { x: 300, y: 200 }, 5), 5, 'right of the last tile');
});

test('insertionIndex: from the header or a gap, the nearest tile still decides', () => {
  const t = tiles(3);
  assert.equal(T.insertionIndex(t, null, { x: 230, y: 10 }, 3), 2, 'above tile 2, left of its centre');
  assert.equal(T.insertionIndex(t, null, { x: 115, y: 100 }, 3), 1, 'in the gap between tiles 0 and 1');
});

test('insertionIndex: an empty region (or every tile filtered out) takes it at the end', () => {
  assert.equal(T.insertionIndex([], null, { x: 50, y: 50 }, 0), 0);
  assert.equal(T.insertionIndex([], null, { x: 50, y: 50 }, 4), 4);
});

test('insertionIndex: the slot already shown keeps its place while the pointer is on it or nearest to it', () => {
  // Slot drawn at index 1 (in cell 1); tiles 1.. shifted one cell right.
  const t = [{ index: 0, rect: cell(0) }, { index: 1, rect: cell(2) }, { index: 2, rect: cell(0, 1) }];
  const slot = { index: 1, rect: cell(1) };
  assert.equal(T.insertionIndex(t, slot, { x: 160, y: 100 }, 3), 1, 'on the slot');
  assert.equal(T.insertionIndex(t, slot, { x: 160, y: 40 }, 3), 1, 'above the slot, nearest to it');
  assert.equal(T.insertionIndex(t, slot, { x: 300, y: 100 }, 3), 2, 'right half of the shifted tile');
});

test('insertionIndex: indices count hidden (filtered) tiles, so the drop lands between the right items', () => {
  // Item 1 is filtered out: visible tiles are items 0, 2, 3 in cells 0..2.
  const t = [{ index: 0, rect: cell(0) }, { index: 2, rect: cell(1) }, { index: 3, rect: cell(2) }];
  assert.equal(T.insertionIndex(t, null, { x: 130, y: 100 }, 4), 2, 'before item 2');
  assert.equal(T.insertionIndex(t, null, { x: 90, y: 100 }, 4), 1, 'after item 0');
});

test('stepOrder: Ctrl+Arrow moves one place earlier or later, and stops at either end', () => {
  const order = ['a', 'b', 'c', 'd'];
  assert.deepEqual(T.stepOrder(order, order, 'b', 1), ['a', 'c', 'b', 'd']);
  assert.deepEqual(T.stepOrder(order, order, 'b', -1), ['b', 'a', 'c', 'd']);
  assert.equal(T.stepOrder(order, order, 'a', -1), null);
  assert.equal(T.stepOrder(order, order, 'd', 1), null);
  assert.equal(T.stepOrder(order, order, 'zz', 1), null);
});

test('stepOrder: with a filter, the tile passes the next VISIBLE tile', () => {
  const order = ['a', 'b', 'c', 'd'];
  const visible = ['a', 'c', 'd'];
  assert.deepEqual(T.stepOrder(order, visible, 'a', 1), ['b', 'c', 'a', 'd']);
  assert.deepEqual(T.stepOrder(order, visible, 'c', -1), ['c', 'a', 'b', 'd']);
});

// ── M2b (addendum A5): Ctrl+Up / Ctrl+Down move one row ─────────────────────
test('stepOrder: a signed place count; the tile goes after (later) or before (earlier) the tile at the target place', () => {
  const v = ['a', 'b', 'c', 'd', 'e'];
  assert.deepEqual(T.stepOrder(v, v, 'a', 3), ['b', 'c', 'd', 'a', 'e'], 'the addendum example');
  assert.deepEqual(T.stepOrder(v, v, 'e', -3), ['a', 'e', 'b', 'c', 'd']);
  assert.equal(T.stepOrder(v, v, 'c', 3), null, 'past the end: nothing, no clamp');
  assert.equal(T.stepOrder(v, v, 'b', -2), null, 'before the start: nothing, no wrap');
  assert.equal(T.stepOrder(v, v, 'b', 0), null);
});

test('stepOrder: 12 tiles, 5 columns (Futaba measure 5)', () => {
  const order = Array.from({ length: 12 }, (_, i) => 't' + i);
  const down2 = T.stepOrder(order, order, 't2', 5);
  assert.equal(down2.indexOf('t2'), 7, 'Ctrl+Down on index 2 goes to 7');
  assert.equal(T.stepOrder(order, order, 't8', 5), null, 'index 8 down: nothing');
  assert.equal(T.stepOrder(order, order, 't3', -5), null, 'index 3 up: nothing');
  assert.equal(T.stepOrder(order, order, 't7', -5).indexOf('t7'), 2, 'index 7 up goes to 2');
  assert.deepEqual(T.stepOrder(down2, down2, 't2', -5), order, 'and back');
});

test('stepOrder: with a filter, a row is counted in visible tiles only', () => {
  const order = ['a0', 'b1', 'a2', 'b3', 'a4', 'b5', 'a6', 'b7'];
  const visible = ['a0', 'a2', 'a4', 'a6'];
  assert.deepEqual(T.stepOrder(order, visible, 'a0', 2), ['b1', 'a2', 'b3', 'a4', 'a0', 'b5', 'a6', 'b7']);
});
