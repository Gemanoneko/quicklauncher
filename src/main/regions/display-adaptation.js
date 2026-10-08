'use strict';
// Runtime-only display presentation. Never receives a store or native host.
const P = require('./placement');
const R = require('../../renderer/radial-layout');
const M = require('./model');

const FALLBACK_TEXT = 'Using Grid while the display is smaller.';
const FALLBACK_TITLE = `${FALLBACK_TEXT} Your Fan or Ring layout returns when it fits.`;
const SUPPRESSED_TEXT = 'This region does not fit on this display. Use Manager to change its layout or hide another region.';

function radialFits(region, count, iconSize, workArea) {
  const geometry = R.geometry(region.layout, count, iconSize, region.fanDirection || 'up');
  return geometry.width <= workArea.width - 48 && geometry.height <= workArea.height - 48;
}

function gridMinimum(iconSize, measured) {
  // A not-yet-measured page uses the existing default width and a conservative
  // one-tile viewport with header, edit, notice and banner space. The renderer
  // replaces this with its actual theme/control measurement before revealing it.
  return measured || { width: Math.max(M.GRID.minWidth, M.GRID.defaultWidth), height: Math.max(M.GRID.minHeight, iconSize + 240) };
}

function freeBox(want, minimum, inner, others, rim = 0) {
  const hostInner = { x: inner.x + rim, y: inner.y + rim, width: Math.max(0, inner.width - rim * 2), height: Math.max(0, inner.height - rim * 2) };
  const obstacles = others.map(r => ({ x: r.x - rim, y: r.y - rim, width: r.width + rim * 2, height: r.height + rim * 2 }));
  if (minimum.width > hostInner.width || minimum.height > hostInner.height) return null;
  let box = P.clampInto(want, hostInner, minimum);
  let found = P.findFree(box, hostInner, obstacles);
  while (!found && (box.width > minimum.width || box.height > minimum.height)) {
    box = { ...box, width: Math.max(minimum.width, Math.floor(box.width * .9)), height: Math.max(minimum.height, Math.floor(box.height * .9)) };
    found = P.findFree(box, hostInner, obstacles);
  }
  return found;
}

function plan({ regions, wanted, minimums, iconSize, workArea, runtime = new Map() }) {
  const inner = P.innerArea(workArea);
  const occupied = [];
  return regions.map((region, index) => {
    const rt = runtime.get(region.id);
    const radial = R.isRadial(region.layout);
    const fallback = radial && (!radialFits(region, rt ? rt.count : 0, iconSize, workArea) || !!(rt && rt.holdFallback));
    const minimum = fallback ? gridMinimum(iconSize, rt && rt.gridMinimum) : minimums[index];
    const want = fallback ? rt && rt.temporaryRect || { ...wanted[index], width: Math.max(minimum.width, M.GRID.defaultWidth), height: Math.max(minimum.height, M.GRID.defaultHeight) } : wanted[index];
    const rim = fallback || region.layout === 'grid' ? M.GRID.rim : 0;
    const rect = freeBox(want, minimum, inner, occupied, rim);
    const suppressed = !rect;
    const shown = rect || { ...want };
    if (rect) occupied.push({ x: rect.x-rim, y: rect.y-rim, width:rect.width+rim*2, height:rect.height+rim*2 });
    return { rect: shown, fallback, suppressed, minimum, presentation: fallback ? 'grid' : region.layout };
  });
}

module.exports = { plan, freeBox, radialFits, gridMinimum, FALLBACK_TEXT, FALLBACK_TITLE, SUPPRESSED_TEXT };
