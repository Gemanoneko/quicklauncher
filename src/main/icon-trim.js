'use strict';
// Icon trimming and picker-icon encoding, shared by the main process and the
// hidden icon helper renderer (icon-worker.js / icon-worker-preload.js), so
// both produce byte-identical data URLs from the same input.
const { nativeImage } = require('electron');

// Crop background padding from an icon image.
// Detects background via corner sampling (handles both transparent and solid backgrounds).
function trimIcon(img) {
  const { width, height } = img.getSize();
  if (width < 8 || height < 8) return img;
  const bitmap = img.toBitmap(); // raw BGRA

  const px = (x, y) => {
    const i = (y * width + x) * 4;
    return [bitmap[i], bitmap[i + 1], bitmap[i + 2], bitmap[i + 3]];
  };

  // Decide mode: transparent bg or solid-color bg
  const useAlpha = px(0, 0)[3] < 10;
  let bgB = 0, bgG = 0, bgR = 0;
  if (!useAlpha) {
    const corners = [px(0, 0), px(width - 1, 0), px(0, height - 1), px(width - 1, height - 1)];
    bgB = Math.round(corners.reduce((s, c) => s + c[0], 0) / 4);
    bgG = Math.round(corners.reduce((s, c) => s + c[1], 0) / 4);
    bgR = Math.round(corners.reduce((s, c) => s + c[2], 0) / 4);
  }

  const isContent = (x, y) => {
    const [b, g, r, a] = px(x, y);
    if (useAlpha) return a > 15;
    return Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) > 25;
  };

  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isContent(x, y)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return img; // all background
  const savings = 1 - ((maxX - minX + 1) * (maxY - minY + 1)) / (width * height);
  if (savings < 0.10) return img; // not worth cropping

  const pad = Math.round(Math.min(width, height) * 0.04);
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  const w = Math.min(width - x, maxX + pad + 1 - x);
  const h = Math.min(height - y, maxY + pad + 1 - y);
  return img.crop({ x, y, width: w, height: h });
}

// One picker icon: decode → trim → PNG data URL.
// job: { buf } — an image file's bytes, or { b64 } — a PNG from the C# icon
// helper; null → ''. requireNonEmpty: return '' when the image decoded to
// nothing. The picker's image-file branch has never had that check (an
// undecodable file still yields the empty image's data URL), and that
// behaviour is kept exactly.
function encodeIcon(job) {
  if (!job) return '';
  try {
    const buf = job.b64 !== undefined ? Buffer.from(job.b64, 'base64') : Buffer.from(job.buf);
    const img = trimIcon(nativeImage.createFromBuffer(buf));
    return (!job.requireNonEmpty || !img.isEmpty()) ? img.toDataURL() : '';
  } catch {
    return '';
  }
}

module.exports = { trimIcon, encodeIcon };
