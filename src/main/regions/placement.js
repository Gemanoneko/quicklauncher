'use strict';
// Region placement rules (spec 4.1), pure rect math in DIP. No Electron.
// Every rect here is a PANEL rect: the visible box. The window rect adds the
// Grid's resize rim on top (controller).
//
//   1. no overlap: panels keep a GAP between them
//   2. inside the work area with a MARGIN
//   3. snap within SNAP px to the margin, to a neighbour at the gap, or to an
//      edge alignment (Alt turns snapping off; rules 1 and 2 still hold)
//   4. bump, not push: a dragged region stops at the gap; others never move

const GAP = 12;
const MARGIN = 12;
const SNAP = 12;

const right = (r) => r.x + r.width;
const bottom = (r) => r.y + r.height;
const round = (r) => ({ x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) });

/** The usable area: the work area minus the margin on every side. */
function innerArea(workArea) {
  return {
    x: workArea.x + MARGIN,
    y: workArea.y + MARGIN,
    width: Math.max(0, workArea.width - 2 * MARGIN),
    height: Math.max(0, workArea.height - 2 * MARGIN),
  };
}

/** True when a and b are closer than `gap` (touching at exactly `gap` is fine). */
function tooClose(a, b, gap = GAP) {
  return a.x < right(b) + gap && b.x < right(a) + gap
    && a.y < bottom(b) + gap && b.y < bottom(a) + gap;
}

function inside(r, inner) {
  return r.x >= inner.x && r.y >= inner.y && right(r) <= right(inner) && bottom(r) <= bottom(inner);
}

function fits(r, inner, others) {
  return inside(r, inner) && !others.some((o) => tooClose(r, o));
}

/** Shrink to the area (never below min), then shift inside it. */
function clampInto(r, inner, min = { width: 0, height: 0 }) {
  const width = Math.max(Math.min(r.width, inner.width), Math.min(min.width, inner.width));
  const height = Math.max(Math.min(r.height, inner.height), Math.min(min.height, inner.height));
  const x = Math.min(Math.max(r.x, inner.x), right(inner) - width);
  const y = Math.min(Math.max(r.y, inner.y), bottom(inner) - height);
  return round({ x, y, width, height });
}

/**
 * Nearest free spot to `r` (same size), searching rings outward in `step`
 * px. Returns null when the whole area has no room.
 */
function findFree(r, inner, others, step = GAP) {
  const start = clampInto(r, inner);
  if (fits(start, inner, others)) return start;
  const maxX = right(inner) - start.width;
  const maxY = bottom(inner) - start.height;
  if (maxX < inner.x || maxY < inner.y) return null;
  const reach = Math.ceil(Math.max(inner.width, inner.height) / step) + 1;
  for (let ring = 1; ring <= reach; ring++) {
    let best = null;
    let bestD = Infinity;
    for (let i = -ring; i <= ring; i++) {
      for (const [dx, dy] of [[i, -ring], [i, ring], [-ring, i], [ring, i]]) {
        const x = Math.min(Math.max(start.x + dx * step, inner.x), maxX);
        const y = Math.min(Math.max(start.y + dy * step, inner.y), maxY);
        const c = { x, y, width: start.width, height: start.height };
        if (!fits(c, inner, others)) continue;
        const d = Math.hypot(x - start.x, y - start.y);
        if (d < bestD) { bestD = d; best = c; }
      }
    }
    if (best) return round(best);
  }
  return null;
}

/** Spec 3.1: centre, then 32 px steps right and down (20 steps), then an outward search. */
function placeNew(size, inner, others) {
  const w = Math.min(size.width, inner.width);
  const h = Math.min(size.height, inner.height);
  const cx = Math.round(inner.x + (inner.width - w) / 2);
  const cy = Math.round(inner.y + (inner.height - h) / 2);
  for (let i = 0; i <= 20; i++) {
    const c = { x: cx + 32 * i, y: cy + 32 * i, width: w, height: h };
    if (fits(c, inner, others)) return c;
  }
  return findFree({ x: cx, y: cy, width: w, height: h }, inner, others);
}

// One axis of a swept move: from `cur` toward `target`, stopping at the area
// edge and at the gap before any obstacle that overlaps on the other axis.
function sweepAxis(rect, axis, target, inner, obstacles) {
  const pos = axis === 'x' ? 'x' : 'y';
  const size = axis === 'x' ? 'width' : 'height';
  const opos = axis === 'x' ? 'y' : 'x';
  const osize = axis === 'x' ? 'height' : 'width';
  const cur = rect[pos];
  const lo = inner[pos];
  const hi = inner[pos] + inner[size] - rect[size];
  let t = Math.min(Math.max(target, lo), Math.max(lo, hi));
  for (const o of obstacles) {
    const overlapOther = rect[opos] < o[opos] + o[osize] + GAP && o[opos] < rect[opos] + rect[osize] + GAP;
    if (!overlapOther) continue;
    if (t > cur && o[pos] >= cur + rect[size]) t = Math.min(t, o[pos] - GAP - rect[size]);
    if (t < cur && o[pos] + o[size] <= cur) t = Math.max(t, o[pos] + o[size] + GAP);
  }
  return { ...rect, [pos]: Math.round(t) };
}

/**
 * Drag step: move from `from` (the last valid rect) toward `proposed`, X then
 * Y, so a region slides along an obstacle instead of sticking. Obstacles that
 * already overlap `from` are ignored, so a region can always move out of a
 * bad spot. Returns { rect, blocked } (blocked: the result is not `proposed`).
 */
function moveConstrained(from, proposed, inner, others) {
  const obstacles = others.filter((o) => !tooClose(from, o));
  let r = sweepAxis(from, 'x', proposed.x, inner, obstacles);
  r = sweepAxis(r, 'y', proposed.y, inner, obstacles);
  const blocked = r.x !== Math.round(proposed.x) || r.y !== Math.round(proposed.y);
  return { rect: round(r), blocked };
}

function snapCandidates(r, inner, others, axis) {
  const pos = axis === 'x' ? 'x' : 'y';
  const size = axis === 'x' ? 'width' : 'height';
  const list = [inner[pos], inner[pos] + inner[size] - r[size]];
  for (const o of others) {
    list.push(o[pos] - GAP - r[size]);      // just before o, at the gap
    list.push(o[pos] + o[size] + GAP);      // just after o, at the gap
    list.push(o[pos]);                       // leading edges aligned
    list.push(o[pos] + o[size] - r[size]);  // trailing edges aligned
  }
  return list;
}

/** Snap within SNAP px on each axis, only to a spot that still fits. Returns { rect, snapped }. */
function snap(r, inner, others, threshold = SNAP) {
  const pick = (axis) => {
    const pos = axis === 'x' ? 'x' : 'y';
    let best = null;
    let bestD = threshold + 1;
    for (const c of snapCandidates(r, inner, others, axis)) {
      const d = Math.abs(c - r[pos]);
      if (d <= threshold && d < bestD) { bestD = d; best = c; }
    }
    return best;
  };
  const sx = pick('x');
  const sy = pick('y');
  const tries = [];
  if (sx !== null && sy !== null) tries.push({ ...r, x: sx, y: sy });
  if (sx !== null) tries.push({ ...r, x: sx });
  if (sy !== null) tries.push({ ...r, y: sy });
  for (const t of tries) {
    if (fits(t, inner, others)) return { rect: round(t), snapped: true };
  }
  return { rect: round(r), snapped: false };
}

/** One drag frame: constrain, then snap unless Alt is held. */
function dragStep(from, proposed, inner, others, { alt = false } = {}) {
  const m = moveConstrained(from, proposed, inner, others);
  if (alt) return { rect: m.rect, snapped: false, blocked: m.blocked };
  const s = snap(m.rect, inner, others);
  return { rect: s.rect, snapped: s.snapped, blocked: m.blocked && !s.snapped };
}

/**
 * Resize (Grid): move the edges named in `edges` ({left,right,top,bottom}) by
 * dx/dy from `start`. Each moving edge stops at the area edge, at the gap
 * before a neighbour, and at the minimum size; it snaps to those lines within
 * SNAP px unless Alt is held. Returns { rect, blocked }.
 */
function resizeStep(start, edges, dx, dy, inner, others, min, { alt = false } = {}) {
  const obstacles = others.filter((o) => !tooClose(start, o));
  let l = start.x;
  let t = start.y;
  let r = right(start);
  let b = bottom(start);
  let blocked = false;
  const snapTo = (v, lines) => {
    if (alt) return v;
    let best = v;
    let bestD = SNAP + 1;
    for (const line of lines) {
      const d = Math.abs(line - v);
      if (d <= SNAP && d < bestD) { bestD = d; best = line; }
    }
    return best;
  };
  const overlapsY = (o, top, bot) => top < bottom(o) + GAP && o.y < bot + GAP;
  const overlapsX = (o, lft, rgt) => lft < right(o) + GAP && o.x < rgt + GAP;

  // Horizontal edges first (they use the start's vertical extent), then vertical.
  if (edges.right) {
    let want = right(start) + dx;
    let limit = right(inner);
    for (const o of obstacles) if (overlapsY(o, start.y, bottom(start)) && o.x >= right(start)) limit = Math.min(limit, o.x - GAP);
    want = Math.max(want, l + min.width);
    if (want > limit) { want = limit; blocked = true; }
    r = Math.min(snapTo(want, [limit]), limit);
    r = Math.max(r, l + Math.min(min.width, limit - l));
  }
  if (edges.left) {
    let want = start.x + dx;
    let limit = inner.x;
    for (const o of obstacles) if (overlapsY(o, start.y, bottom(start)) && right(o) <= start.x) limit = Math.max(limit, right(o) + GAP);
    want = Math.min(want, r - min.width);
    if (want < limit) { want = limit; blocked = true; }
    l = Math.max(snapTo(want, [limit]), limit);
    l = Math.min(l, r - Math.min(min.width, r - limit));
  }
  if (edges.bottom) {
    let want = bottom(start) + dy;
    let limit = bottom(inner);
    for (const o of obstacles) if (overlapsX(o, l, r) && o.y >= bottom(start)) limit = Math.min(limit, o.y - GAP);
    want = Math.max(want, t + min.height);
    if (want > limit) { want = limit; blocked = true; }
    b = Math.min(snapTo(want, [limit]), limit);
    b = Math.max(b, t + Math.min(min.height, limit - t));
  }
  if (edges.top) {
    let want = start.y + dy;
    let limit = inner.y;
    for (const o of obstacles) if (overlapsX(o, l, r) && bottom(o) <= start.y) limit = Math.max(limit, bottom(o) + GAP);
    want = Math.min(want, b - min.height);
    if (want < limit) { want = limit; blocked = true; }
    t = Math.max(snapTo(want, [limit]), limit);
    t = Math.min(t, b - Math.min(min.height, b - limit));
  }
  return { rect: round({ x: l, y: t, width: r - l, height: b - t }), blocked };
}

/** Spec 4.1.7: put a region in a corner (or the centre), at the first free spot next to it. */
function placeAt(where, r, inner, others) {
  const w = Math.min(r.width, inner.width);
  const h = Math.min(r.height, inner.height);
  const spots = {
    'top-left': { x: inner.x, y: inner.y },
    'top-right': { x: right(inner) - w, y: inner.y },
    'bottom-left': { x: inner.x, y: bottom(inner) - h },
    'bottom-right': { x: right(inner) - w, y: bottom(inner) - h },
    center: { x: Math.round(inner.x + (inner.width - w) / 2), y: Math.round(inner.y + (inner.height - h) / 2) },
  };
  const s = spots[where];
  if (!s) return null;
  return findFree({ ...s, width: w, height: h }, inner, others);
}

/**
 * Display change (spec 4.4): fit every region on the current area without
 * touching what is saved. Regions are taken in order (primary first); each is
 * clamped (Grid may shrink to its minimum), then moved to the nearest free
 * spot if it overlaps one already placed. If some region still finds no
 * room, every region shrinks a step (never below its minimum) and the fit
 * runs again, so a small display shows all of them apart when they can fit
 * at all. The first pass is the plain fit, so on the display the layout was
 * saved on, the saved rects come back unchanged. Returns rects in input
 * order; a region with no room anywhere keeps its clamped rect (overlap is
 * reported).
 */
function relayout(rects, inner, mins) {
  const minOf = (i) => (mins && mins[i]) || { width: 0, height: 0 };
  let res = relayoutOnce(rects, inner, mins);
  let scale = 1;
  while (res.overlaps) {
    const atMin = rects.every((r, i) => Math.round(r.width * scale) <= minOf(i).width && Math.round(r.height * scale) <= minOf(i).height);
    if (atMin) break;
    scale *= 0.85;
    const smaller = rects.map((r, i) => ({
      ...r,
      width: Math.max(minOf(i).width, Math.round(r.width * scale)),
      height: Math.max(minOf(i).height, Math.round(r.height * scale)),
    }));
    const next = relayoutOnce(smaller, inner, mins);
    if (next.overlaps <= res.overlaps) res = next;
  }
  return res;
}

function relayoutOnce(rects, inner, mins) {
  const placed = [];
  const out = [];
  let overlaps = 0;
  rects.forEach((r, i) => {
    const min = (mins && mins[i]) || { width: 0, height: 0 };
    let c = clampInto(r, inner, min);
    if (!fits(c, inner, placed)) {
      let f = findFree(c, inner, placed);
      // No room at this size: a region may shrink toward its minimum (spec 4.4).
      let w = c.width;
      let h = c.height;
      while (!f && (w > min.width || h > min.height)) {
        w = Math.max(min.width, Math.round(w * 0.9));
        h = Math.max(min.height, Math.round(h * 0.9));
        f = findFree({ ...c, width: w, height: h }, inner, placed);
      }
      if (f) c = f; else overlaps++;
    }
    placed.push(c);
    out.push(c);
  });
  return { rects: out, overlaps };
}

/**
 * Column and Row (M4): the free length from `rect`'s start along `axis`
 * ('y' = downward, 'x' = rightward) before the area edge or the GAP before a
 * region that overlaps it on the other axis. A region already too close at the
 * start (it straddles it) is ignored, as moveConstrained ignores one, so a
 * region in a bad spot never gets a room of zero. Returns a length in DIP.
 */
function roomAlong(rect, axis, inner, others) {
  const pos = axis === 'x' ? 'x' : 'y';
  const size = axis === 'x' ? 'width' : 'height';
  const opos = axis === 'x' ? 'y' : 'x';
  const osize = axis === 'x' ? 'height' : 'width';
  const start = rect[pos];
  let limit = inner[pos] + inner[size];
  for (const o of others || []) {
    const overlapOther = rect[opos] < o[opos] + o[osize] + GAP && o[opos] < rect[opos] + rect[osize] + GAP;
    if (!overlapOther) continue;
    if (o[pos] >= start) limit = Math.min(limit, o[pos] - GAP);
  }
  return Math.max(0, Math.round(limit - start));
}

/**
 * Which region's visible box holds `point` (spec 5.3 drop target)? `entries`
 * is [{ id, rect }] with PANEL rects, so a Grid's invisible resize rim and the
 * 12 px gap count as empty desktop. Left and top edges are inside, right and
 * bottom edges are not. Returns the id or null.
 */
function regionAt(point, entries) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
  for (const e of entries || []) {
    const r = e && e.rect;
    if (r && point.x >= r.x && point.x < right(r) && point.y >= r.y && point.y < bottom(r)) return e.id;
  }
  return null;
}

module.exports = {
  GAP, MARGIN, SNAP,
  innerArea, tooClose, inside, fits, clampInto, findFree, placeNew,
  moveConstrained, snap, dragStep, resizeStep, placeAt, relayout, regionAt, roomAlong,
};
