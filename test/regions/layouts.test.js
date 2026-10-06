'use strict';
// Plain Node: node --test test/
// Column and Row geometry (regions UX spec 2.3, 2.4; tech plan § 9) against the
// spec's own numbers, and the room a box has before a neighbour (placement).
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../../src/main/regions/layouts');
const P = require('../../src/main/regions/placement');

test('Column height follows content: 40 + 32 + n x (S + 32) + (n - 1) x 8, 180 wide (spec 2.3)', () => {
  // The spec's examples at S = 64: 168 for 0 or 1 item, 376 for 3, 688 for 6.
  assert.deepEqual(L.contentSize('column', 0, 64), { width: 180, height: 168 });
  assert.deepEqual(L.contentSize('column', 1, 64), { width: 180, height: 168 });
  assert.deepEqual(L.contentSize('column', 3, 64), { width: 180, height: 376 });
  assert.deepEqual(L.contentSize('column', 6, 64), { width: 180, height: 688 });
  for (let n = 1; n <= 20; n++) assert.equal(L.contentSize('column', n, 64).height, 64 + 104 * n, `n = ${n}`);
  // Width max(180, S + 68): 180 until S = 112, then S + 68.
  assert.equal(L.contentSize('column', 1, 32).width, 180);
  assert.equal(L.contentSize('column', 1, 112).width, 180);
  assert.equal(L.contentSize('column', 1, 128).width, 196);
  assert.equal(L.contentSize('column', 2, 32).height, 72 + 2 * 64 + 8);
});

test('Row width follows content: 124 + 104n at S = 64, height S + 64 (spec 2.4)', () => {
  assert.deepEqual(L.contentSize('row', 0, 64), { width: 228, height: 128 });
  assert.deepEqual(L.contentSize('row', 1, 64), { width: 228, height: 128 });
  assert.deepEqual(L.contentSize('row', 5, 64), { width: 644, height: 128 }); // the SVG's Row
  for (let n = 1; n <= 30; n++) assert.equal(L.contentSize('row', n, 64).width, 124 + 104 * n, `n = ${n}`);
  assert.equal(L.contentSize('row', 1, 32).height, 96);
  assert.equal(L.contentSize('row', 1, 128).height, 192);
  assert.equal(L.contentSize('row', 2, 32).width, 96 + 16 + 2 * 64 + 8 + 20);
});

test('the edit bar and the notice slot add 38 each to a Column; a Row keeps its size', () => {
  assert.equal(L.contentSize('column', 3, 64, { edit: true }).height, 376 + 38);
  assert.equal(L.contentSize('column', 3, 64, { edit: true, notice: true }).height, 376 + 76);
  assert.deepEqual(L.contentSize('row', 5, 64, { edit: true, notice: true }), { width: 644, height: 128 });
  assert.equal(L.contentSize('grid', 3, 64), null);
});

test('90% cap: the spec\'s examples (912 high: 7 Column tiles; 3413 wide: 28 Row tiles; 1920 wide: 15)', () => {
  const fit = (layout, wa) => {
    const cap = L.capLength(layout, wa);
    let n = 0;
    while (L.contentSize(layout, n + 1, 64)[layout === 'row' ? 'width' : 'height'] <= cap) n++;
    return n;
  };
  assert.equal(L.capLength('column', { width: 3413, height: 912 }), 820);
  assert.equal(fit('column', { width: 3413, height: 912 }), 7);
  assert.equal(fit('row', { width: 3413, height: 912 }), 28);
  assert.equal(fit('row', { width: 1920, height: 1040 }), 15);
});

test('boxAt: the anchor never moves; the length stops at 90% and at the room, never below what still fits', () => {
  const wa = { x: 0, y: 0, width: 1920, height: 912 };
  const want = L.contentSize('column', 8, 64); // 896 > 820
  let b = L.boxAt('column', { x: 50, y: 60 }, want, wa, Infinity);
  assert.deepEqual(b.rect, { x: 50, y: 60, width: 180, height: 820 });
  assert.equal(b.capped, true);
  b = L.boxAt('column', { x: 50, y: 60 }, want, wa, 500);
  assert.deepEqual(b.rect, { x: 50, y: 60, width: 180, height: 500 }, 'stops at the room');
  b = L.boxAt('column', { x: 50, y: 60 }, L.contentSize('column', 2, 64), wa, 500);
  assert.equal(b.rect.height, 272, 'fits: the wanted height');
  // A room smaller than the length it already had keeps that length (a box that fitted keeps fitting).
  b = L.boxAt('column', { x: 50, y: 60 }, want, wa, 300, 400);
  assert.equal(b.rect.height, 400);
  // Row grows on x.
  b = L.boxAt('row', { x: 10, y: 20 }, L.contentSize('row', 40, 64), wa, Infinity);
  assert.deepEqual(b.rect, { x: 10, y: 20, width: 1728, height: 128 });
});

test('iconSizeOf: the store\'s icon size, clamped 32 to 128, default 64', () => {
  assert.equal(L.iconSizeOf({ iconSize: 96 }), 96);
  assert.equal(L.iconSizeOf({ iconSize: 8 }), 32);
  assert.equal(L.iconSizeOf({ iconSize: 400 }), 128);
  assert.equal(L.iconSizeOf({}), 64);
  assert.equal(L.iconSizeOf(null), 64);
});

test('roomAlong: the free length before the margin or the 12 px gap to a region in the way', () => {
  const inner = { x: 12, y: 12, width: 1896, height: 1016 }; // 1920 x 1040 minus the margin
  const col = { x: 100, y: 100, width: 180, height: 168 };
  assert.equal(P.roomAlong(col, 'y', inner, []), 1028 - 100, 'to the bottom margin');
  // A region below, overlapping in x: stop 12 px above it.
  assert.equal(P.roomAlong(col, 'y', inner, [{ x: 200, y: 600, width: 424, height: 300 }]), 600 - 12 - 100);
  // A region below but beside it (more than the gap away in x): not in the way.
  assert.equal(P.roomAlong(col, 'y', inner, [{ x: 292, y: 600, width: 424, height: 300 }]), 928);
  // A region exactly at the gap beside it (x = 280 + 12) is not in the way; one pixel nearer is.
  assert.equal(P.roomAlong(col, 'y', inner, [{ x: 291, y: 600, width: 424, height: 300 }]), 488);
  // A region above, or one straddling the start, does not count.
  assert.equal(P.roomAlong(col, 'y', inner, [{ x: 100, y: 10, width: 180, height: 50 }, { x: 100, y: 50, width: 180, height: 60 }]), 928);
  // Row: rightward.
  const row = { x: 100, y: 100, width: 228, height: 128 };
  assert.equal(P.roomAlong(row, 'x', inner, [{ x: 800, y: 150, width: 200, height: 200 }]), 800 - 12 - 100);
  assert.equal(P.roomAlong(row, 'x', inner, []), 1908 - 100);
});

// ── M4 rulings Q1, Q2: the peek ─────────────────────────────────────────────
test('peek: the rulings vectors (S = 64): Column 820 820, 864 824, 655 616, 936 936; Row 2304 2232, 1229 1192, 3071 and 1728 stay; Column with the edit bar 820 758', () => {
  const wa = { width: 99999, height: 99999 };
  const col = (h, x = {}) => L.boxAt('column', { x: 0, y: 0 }, { width: 180, height: 99999 }, wa, h, 0, { S: 64, ...x }).rect.height;
  const row = (w) => L.boxAt('row', { x: 0, y: 0 }, { width: 99999, height: 128 }, wa, w, 0, { S: 64 }).rect.width;
  assert.deepEqual([820, 864, 655, 936].map((h) => col(h)), [820, 824, 616, 936]);
  assert.deepEqual([2304, 1229, 3071, 1728].map(row), [2232, 1192, 3071, 1728]);
  assert.equal(col(820, { edit: true }), 758);
});

test('peek sweep: S = 32, 64, 96, 128, every stop from 400 to 2400: never longer, at most 87 shorter, the next tile shows 24 to S unless one cell is the floor', () => {
  const wa = { width: 99999, height: 99999 };
  let n = 0;
  for (const S of [32, 64, 96, 128]) {
    for (const layout of ['column', 'row']) {
      for (const x of layout === 'column' ? [{}, { edit: true }, { edit: true, notice: true }] : [{}]) {
        const lead = layout === 'column' ? 40 + (x.edit ? 38 : 0) + (x.notice ? 38 : 0) : 96;
        const len = layout === 'column' ? 'height' : 'width';
        const want = layout === 'column' ? { width: 180, height: 99999 } : { width: 99999, height: S + 64 };
        const one = L.contentSize(layout, 1, S, x)[len];
        for (let stop = 400; stop <= 2400; stop++) {
          const got = L.boxAt(layout, { x: 0, y: 0 }, want, wa, stop, 0, { S, ...x }).rect[len];
          const phase = (((got - lead - 16) % (S + 40)) + (S + 40)) % (S + 40);
          assert.ok(got <= stop, `${layout} S ${S} ${stop}: longer (${got})`);
          assert.ok(stop - got <= 87, `${layout} S ${S} ${stop}: ${stop - got} shorter`);
          if (!(phase >= 24 && phase <= S)) {
            // Only allowed where the trim would have gone below one cell.
            const land = Math.max(24, S - 24);
            const cut = phase < 24 ? phase + (S + 40) - land : phase - land;
            assert.ok(got === stop && stop - cut < one, `${layout} S ${S} ${stop}: peek ${phase}`);
          }
          n++;
        }
      }
    }
  }
  assert.ok(n > 20000);
});

test('peek: nothing is trimmed when the list fits, and never below one cell', () => {
  const wa = { width: 99999, height: 99999 };
  assert.equal(L.boxAt('column', { x: 0, y: 0 }, L.contentSize('column', 3, 64), wa, Infinity, 0, { S: 64 }).rect.height, 376);
  // A stop 10 DIP into the second tile at S = 64: trimming would go below one cell (168), so it stays.
  assert.equal(L.boxAt('column', { x: 0, y: 0 }, L.contentSize('column', 5, 64), wa, 178, 0, { S: 64 }).rect.height, 178);
});
