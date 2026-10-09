'use strict';
// Column and Row geometry (regions UX spec 2.3, 2.4, 2.7; tech plan § 9). Pure:
// no Electron, so plain Node unit-tests it (test/regions/layouts.test.js).
// Sizes are DIP; S is the global icon size (32 to 128, default 64).
//
//   Column  width  max(180, S + 68)                      not resizable
//           height (auto until manually resized) 40 header + 32 padding + c cells of S + 54, 8 apart
//                  (+ 38 edit bar, + 38 notice slot), c = max(n, 1)
//                  + 6 bottom rim = 70 + 126n at S = 64
//   Row     height S + 86                                not resizable
//           width (auto until manually resized) 96 leading cell + 16 + c cells of S + 32, 8 apart, + 20
//                  + 6 right rim = 130 + 104n at S = 64
// Auto sizes stop at 90% of the work area along their growth axis, then scroll; a
// stopped list is trimmed so the next tile peeks 24 to S DIP (M4 rulings Q1, Q2).

const HEADER = 40;      // Column header band (spec 2.3)
const PAD = 16;         // tile-field padding (margin contract, spec 6.1)
const GUTTER = 4;       // the 4 px scrollbar gutter beside the field (margin contract: x 16 to W - 20)
const CELL_GAP = 8;     // gap between tiles (spec 2.1)
const LEAD = 96;        // Row leading cell width (spec 2.4)
const BAR = 38;         // Column edit bar and notice slot (spec 2.3)
const MAX_SHARE = 0.9;  // grow to 90% of the work area, then scroll (spec 2.3, 2.4)
const AXIS_RIM = 6;     // reserved outside the tile material, inside outer bounds
const COLUMN_MIN_WIDTH = 180;

const CONTENT_LAYOUTS = new Set(['column', 'row']);
const isContentSized = (layout) => CONTENT_LAYOUTS.has(layout);

/** The icon size as the store keeps it, clamped to the setting's range. */
function iconSizeOf(settings) {
  const v = settings ? settings.iconSize : undefined;
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(128, Math.max(32, Math.round(v))) : 64;
}

const cellsLength = (n, S, extra = 32) => {
  const c = Math.max(1, Math.floor(Number(n) || 0));
  return c * (S + extra) + (c - 1) * CELL_GAP;
};

/**
 * The size a Column or Row region wants for n items (spec 2.3, 2.4), before
 * the 90% cap and before the room it has. `extras` (Column only): the edit bar
 * and the notice slot, 38 each, when shown. Returns { width, height } or null
 * for a layout that is not content-sized.
 */
function contentSize(layout, n, S = 64, { edit = false, notice = false } = {}) {
  if (layout === 'column') {
    const height = HEADER + 2 * PAD + cellsLength(n, S, 54) + (edit ? BAR : 0) + (notice ? BAR : 0) + AXIS_RIM;
    return { width: Math.max(COLUMN_MIN_WIDTH, S + 68), height };
  }
  if (layout === 'row') {
    return { width: LEAD + PAD + cellsLength(n, S) + PAD + GUTTER + AXIS_RIM, height: S + 86 };
  }
  return null;
}

/** The smallest useful box: one cell (the empty state's size; a display change may shrink to it). */
function minSize(layout, S = 64) {
  return contentSize(layout, 1, S);
}

/** Which way a layout grows: Column downward (height), Row rightward (width). */
function growAxis(layout) {
  return layout === 'row' ? 'x' : 'y';
}

/** 90% of the work area along the growth axis, in whole DIP. */
function capLength(layout, workArea) {
  const wa = workArea || { width: 1920, height: 1040 };
  return Math.floor(MAX_SHARE * (growAxis(layout) === 'x' ? wa.width : wa.height));
}

/**
 * The box a Column or Row shows at a fixed anchor (spec 2.3 "grows downward
 * from a fixed top-left corner", 2.4 "rightward from a fixed left edge"): the
 * wanted length, stopped at 90% of the work area and at `room` (the free length
 * before the work-area margin or the 12 px gap to a neighbour), never below the
 * length it already had when that still fits (`keep`). It never moves: past
 * what fits, the list scrolls (as spec 2.3 rules for the edit bar).
 * Returns { rect, wanted, capped }.
 */
function boxAt(layout, anchor, want, workArea, room, keep = 0, { S = 64, edit = false, notice = false, preferredLength = null, maxLength = Infinity } = {}) {
  const axis = growAxis(layout);
  const len = axis === 'x' ? 'width' : 'height';
  const wanted = want[len];
  // A manual viewport survives content changes; temporary limits never alter
  // its stored preference. Unlike auto-fit, it is not trimmed to a tile peek.
  if (Number.isSafeInteger(preferredLength) && preferredLength > 0) {
    const minimum = minSize(layout, S)[len] + (layout === 'column' ? (edit ? BAR : 0) + (notice ? BAR : 0) : 0);
    const length = Math.max(1, Math.round(Math.min(Math.max(preferredLength, minimum), maxLength, Number.isFinite(room) ? room : Infinity)));
    return { rect: { x: Math.round(anchor.x), y: Math.round(anchor.y), ...want, [len]: length }, wanted, capped: length < wanted };
  }
  const cap = capLength(layout, workArea);
  let L = Math.min(wanted, cap);
  if (Number.isFinite(room)) L = Math.min(L, Math.max(room, Math.min(keep, wanted)));
  L = Math.max(1, Math.round(L));
  // The peek (M4 rulings Q1, Q2): when the list scrolls, whatever stopped it (the 90%
  // cap, a neighbour, the edge), the window is trimmed so the next tile shows 24 to S
  // DIP: never a sliver, never only its label. Never longer, never below one cell.
  if (L < wanted) {
    const lead = layout === 'column' ? HEADER + (edit ? BAR : 0) + (notice ? BAR : 0) : LEAD;
    const pitch = S + (layout === 'column' ? 62 : 40); // rectangular height includes the two-line label band
    const phase = (((L - lead - PAD - AXIS_RIM) % pitch) + pitch) % pitch;  // how far the cut is into a tile
    if (phase < 24 || phase > S) {                               // under 24 DIP of the next tile, or into its label
      const land = Math.max(24, S - 24);                         // 40 at S = 64: the cut falls inside the icon
      const cut = phase < 24 ? phase + pitch - land : phase - land;
      const oneCell = contentSize(layout, 1, S, { edit, notice })[len];
      if (L - cut >= oneCell) L -= cut;
    }
  }
  const rect = { x: Math.round(anchor.x), y: Math.round(anchor.y), width: want.width, height: want.height };
  rect[len] = L;
  return { rect, wanted, capped: L < wanted };
}

module.exports = {
  HEADER, PAD, GUTTER, CELL_GAP, LEAD, BAR, MAX_SHARE, AXIS_RIM, COLUMN_MIN_WIDTH,
  CONTENT_LAYOUTS, isContentSized, iconSizeOf, contentSize, minSize, growAxis, capLength, boxAt,
};
