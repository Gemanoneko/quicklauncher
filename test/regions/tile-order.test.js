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
