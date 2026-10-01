'use strict';
// Plain Node: node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../../src/main/regions/placement');

const WA = { x: 0, y: 0, width: 1920, height: 1040 };
const IN = P.innerArea(WA); // 12..1908 x 12..1028
const R = (x, y, width = 424, height = 300) => ({ x, y, width, height });
const MIN = { width: 180, height: 150 };

test('innerArea keeps a 12 px margin', () => {
  assert.deepEqual(IN, { x: 12, y: 12, width: 1896, height: 1016 });
});

test('tooClose: exactly 12 px apart is fine, 11 is not', () => {
  const a = R(100, 100);
  assert.equal(P.tooClose(a, R(100 + 424 + 12, 100)), false);
  assert.equal(P.tooClose(a, R(100 + 424 + 11, 100)), true);
  assert.equal(P.tooClose(a, R(100, 100 + 300 + 12)), false);
});

test('placeNew: centre first, then steps down-right when taken, never overlapping', () => {
  const first = P.placeNew({ width: 424, height: 300 }, IN, []);
  assert.deepEqual(first, R(748, 370));
  const second = P.placeNew({ width: 424, height: 300 }, IN, [first]);
  assert.ok(P.fits(second, IN, [first]), 'second fits');
  const all = [first, second];
  for (let i = 0; i < 6; i++) {
    const r = P.placeNew({ width: 424, height: 300 }, IN, all);
    assert.ok(r && P.fits(r, IN, all), `region ${i + 3} fits`);
    all.push(r);
  }
  assert.equal(all.length, 8);
});

test('placeNew returns null when there is no room', () => {
  const big = R(12, 12, 1896, 1016);
  assert.equal(P.placeNew({ width: 424, height: 300 }, IN, [big]), null);
});

test('drag: stops at the work-area margin', () => {
  const r = P.dragStep(R(100, 100), R(5000, -400), IN, [], { alt: true });
  assert.deepEqual(r.rect, R(1908 - 424, 12));
  assert.equal(r.blocked, true);
});

test('drag: bump, not push — stops 12 px before a neighbour and slides along it', () => {
  const other = R(800, 100);
  const r = P.dragStep(R(100, 100), R(700, 160), IN, [other], { alt: true });
  assert.equal(r.rect.x, 800 - 12 - 424, 'x stops at the gap');
  assert.equal(r.rect.y, 160, 'y still follows the pointer');
  assert.equal(r.blocked, true);
  assert.ok(!P.tooClose(r.rect, other));
});

test('drag: a region that already overlaps can move out', () => {
  const other = R(300, 100);
  const r = P.dragStep(R(100, 100), R(100, 500), IN, [other], { alt: true });
  assert.deepEqual(r.rect, R(100, 500));
});

test('snap: within 12 px of the margin or a neighbour gap; Alt turns it off', () => {
  const s = P.dragStep(R(100, 100), R(20, 100), IN, []);
  assert.equal(s.rect.x, 12);
  assert.equal(s.snapped, true);
  const free = P.dragStep(R(100, 100), R(20, 100), IN, [], { alt: true });
  assert.equal(free.rect.x, 20);
  const other = R(800, 100);
  const g = P.dragStep(R(100, 400), R(800 - 424 - 20, 400), IN, [other]);
  assert.equal(g.rect.x, 800 - 12 - 424, 'snaps to the gap left of the neighbour');
  const align = P.dragStep(R(100, 500), R(805, 470), IN, [other]);
  assert.equal(align.rect.x, 800, 'left edges align');
});

test('resize: min size, margin, and the neighbour gap', () => {
  const start = R(100, 100);
  const small = P.resizeStep(start, { right: true, bottom: true }, -1000, -1000, IN, [], MIN, { alt: true });
  assert.deepEqual(small.rect, R(100, 100, 180, 150));
  const big = P.resizeStep(start, { right: true, bottom: true }, 5000, 5000, IN, [], MIN, { alt: true });
  assert.deepEqual(big.rect, R(100, 100, 1908 - 100, 1028 - 100));
  const other = R(700, 150);
  const stop = P.resizeStep(start, { right: true }, 500, 0, IN, [other], MIN, { alt: true });
  assert.equal(stop.rect.x + stop.rect.width, 700 - 12);
  assert.equal(stop.blocked, true);
  const left = P.resizeStep(start, { left: true, top: true }, -500, -500, IN, [], MIN, { alt: true });
  assert.deepEqual(left.rect, R(12, 12, 424 + 88, 300 + 88));
});

test('placeAt: corners and centre at the first free spot', () => {
  assert.deepEqual(P.placeAt('top-left', R(500, 500), IN, []), R(12, 12));
  assert.deepEqual(P.placeAt('bottom-right', R(500, 500), IN, []), R(1908 - 424, 1028 - 300));
  const taken = R(12, 12);
  const r = P.placeAt('top-left', R(500, 500), IN, [taken]);
  assert.ok(P.fits(r, IN, [taken]));
});

test('relayout: a smaller display clamps and resolves overlaps without moving the primary needlessly', () => {
  const small = P.innerArea({ x: 0, y: 0, width: 800, height: 560 });
  const saved = [R(1400, 600), R(1400, 100)];
  const { rects, overlaps } = P.relayout(saved, small, [MIN, MIN]);
  assert.equal(overlaps, 0);
  assert.ok(rects.every((r) => P.inside(r, small)));
  assert.ok(!P.tooClose(rects[0], rects[1]));
  // Same display again: the saved places come back unchanged.
  const back = P.relayout(saved, IN, [MIN, MIN]);
  assert.deepEqual(back.rects, saved);
});

test('relayout: Grid shrinks toward its minimum on a tiny display', () => {
  const tiny = P.innerArea({ x: 0, y: 0, width: 300, height: 260 });
  const { rects } = P.relayout([R(0, 0, 424, 300)], tiny, [MIN]);
  assert.deepEqual(rects[0], { x: 12, y: 12, width: 276, height: 236 });
});

test('regionAt: the visible box only; edges, rims and gaps', () => {
  const list = [{ id: 'a', rect: R(100, 100) }, { id: 'b', rect: R(100 + 424 + 12, 100) }];
  assert.equal(P.regionAt({ x: 300, y: 250 }, list), 'a');
  assert.equal(P.regionAt({ x: 100, y: 100 }, list), 'a', 'top-left corner is inside');
  assert.equal(P.regionAt({ x: 524, y: 250 }, list), null, 'right edge is outside');
  assert.equal(P.regionAt({ x: 530, y: 250 }, list), null, 'the 12 px gap (and each 6 px rim) is desktop');
  assert.equal(P.regionAt({ x: 536, y: 250 }, list), 'b');
  assert.equal(P.regionAt({ x: 300, y: 400 }, list), null, 'bottom edge is outside');
  assert.equal(P.regionAt({ x: NaN, y: 1 }, list), null);
  assert.equal(P.regionAt(null, list), null);
});

test('relayout: 8 Grid regions on an 800 x 600 display all fit apart (each shrinks toward its minimum)', () => {
  const big = P.innerArea({ x: 0, y: 0, width: 5120, height: 1392 });
  const saved = [];
  for (let i = 0; i < 8; i++) saved.push(P.placeNew({ width: 424, height: 300 }, big, saved));
  const small = P.innerArea({ x: 0, y: 0, width: 800, height: 600 });
  const mins = saved.map(() => MIN);
  const { rects, overlaps } = P.relayout(saved, small, mins);
  assert.equal(overlaps, 0);
  assert.ok(rects.every((r) => P.inside(r, small)), 'all inside');
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) assert.ok(!P.tooClose(rects[i], rects[j]), `${i} and ${j} apart`);
  assert.ok(rects.every((r) => r.width >= 180 && r.height >= 150), 'never below the minimum');
  // Back on the big display: the saved rects, untouched.
  assert.deepEqual(P.relayout(saved, big, mins).rects, saved);
});
