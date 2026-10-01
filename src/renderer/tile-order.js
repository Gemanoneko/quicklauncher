/* Tile order helpers for a region page (regions spec 2.1, 5.3, 7.4). Pure:
   no DOM, so plain Node unit-tests them (test/regions/tile-order.test.js).
   In the page they are window.QL_TILE_ORDER; region.js uses them for the
   drop slot of a tile dragged in from another region and for Ctrl+Arrow. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.QL_TILE_ORDER = api;
}(typeof self !== 'undefined' ? self : this, () => {
  'use strict';

  const inside = (r, p) => p.x >= r.left && p.x < r.right && p.y >= r.top && p.y < r.bottom;
  // Distance from a coordinate to a span [lo, hi) (0 inside).
  const span = (v, lo, hi) => (v < lo ? lo - v : v >= hi ? v - hi : 0);

  /**
   * Where a tile dropped at point `p` lands: "a dashed insertion slot at the
   * nearest position" (spec 2.1). The row nearest the pointer wins first (so
   * the empty cells after the last tile mean "at the end"), then the nearest
   * tile in that row; the slot goes before it when `p` is left of its centre,
   * after it otherwise. While the pointer is on, or nearest to, the slot
   * already shown, the slot stays, so the reflow it causes cannot make it
   * jump back and forth.
   *
   *   tiles  [{ index, rect }] visible tiles, rect = {left, top, right, bottom};
   *          index = position among ALL the region's items (hidden ones too)
   *   slot   { index, rect } of the slot already shown, or null
   *   total  number of items in the region
   * Returns an index from 0 to total.
   */
  function insertionIndex(tiles, slot, p, total) {
    if (slot && inside(slot.rect, p)) return slot.index;
    const list = (tiles || []).map((t) => ({ ...t, isSlot: false }));
    if (!list.length) return Math.max(0, total | 0);
    if (slot) list.push({ ...slot, isSlot: true });
    const dy = (t) => span(p.y, t.rect.top, t.rect.bottom);
    const dx = (t) => span(p.x, t.rect.left, t.rect.right);
    const rowD = Math.min(...list.map(dy));
    let best = null;
    for (const t of list) {
      if (dy(t) !== rowD) continue;
      if (!best || dx(t) < dx(best)) best = t;
    }
    if (best.isSlot) return best.index;
    const cx = (best.rect.left + best.rect.right) / 2;
    return p.x < cx ? best.index : best.index + 1;
  }

  /**
   * Ctrl+Arrow (spec addendum A5): move `id` by `delta` places among the tiles
   * the user can see (a filter may hide some): -1 / +1 for Left / Right,
   * -cols / +cols for Up / Down (one row). The tile goes before the tile now
   * at the target place when moving earlier, after it when moving later; the
   * tiles in between shift one place. A target outside the visible tiles does
   * nothing (no clamp, no wrap), like the plain arrows. `order` is every item
   * id in display order, `visible` the shown ones in the same order.
   * Returns the new order, or null.
   */
  function stepOrder(order, visible, id, delta) {
    const vi = visible.indexOf(id);
    const d = Math.trunc(delta);
    if (vi < 0 || !d || !order.includes(id)) return null;
    const ni = vi + d;
    if (ni < 0 || ni >= visible.length) return null;
    const neighbour = visible[ni];
    const rest = order.filter((x) => x !== id);
    const at = rest.indexOf(neighbour);
    if (at < 0) return null;
    rest.splice(delta < 0 ? at : at + 1, 0, id);
    return rest;
  }

  return { insertionIndex, stepOrder };
}));
