'use strict';
// Compare mode for the theme gallery (run through run.mjs --compare; loaded by main.cjs).
// Reads two gallery folders (BEFORE and AFTER, same names) and writes, per theme,
// <theme>-compare.png (before left, after right; grid, settings and hover rows), one batch
// sheet holding every theme of the batch (main grid, sized for a chat preview), index.html
// (a static local page, no scripts, no network) and compare-manifest.json.
// No QuickLaunch page is loaded: images are composed on a canvas in an offscreen data: page.
// Every label carries a measured change figure (share of pixels that differ at all).
const path = require('path');
const fs = require('fs');
const { nativeImage } = require('electron');

const STATES = ['grid', 'settings', 'hover'];
const BG = '#2b2d31', CELL = '#3a3d42', INK = '#e8e8e8', DIM = '#a9adb3';
const TAG = { before: { fill: '#7f9cc4', ink: '#10151d', text: 'BEFORE' }, after: { fill: '#e0b050', ink: '#1d1608', text: 'AFTER' } };
const FONT = 'Segoe UI';

function bitmap(file) {
  const img = nativeImage.createFromPath(file);
  if (img.isEmpty()) throw new Error(`cannot read ${file}`);
  const s = img.getSize();
  return { w: s.width, h: s.height, bmp: img.toBitmap() };
}

/** Share of pixels where any channel differs, plus where the change sits (device px). */
function diff(a, b) {
  if (a.w !== b.w || a.h !== b.h) return { sizeMismatch: true, before: [a.w, a.h], after: [b.w, b.h] };
  let n = 0, sum = 0, x0 = a.w, y0 = a.h, x1 = -1, y1 = -1;
  for (let i = 0, p = 0; i < a.bmp.length; i += 4, p++) {
    const d = Math.max(Math.abs(a.bmp[i] - b.bmp[i]), Math.abs(a.bmp[i + 1] - b.bmp[i + 1]), Math.abs(a.bmp[i + 2] - b.bmp[i + 2]), Math.abs(a.bmp[i + 3] - b.bmp[i + 3]));
    if (!d) continue;
    n++; sum += d;
    const x = p % a.w, y = (p / a.w) | 0;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { changedPct: +(100 * n / (a.w * a.h)).toFixed(3), changedPx: n, meanDelta: n ? +(sum / n).toFixed(1) : 0, box: n ? [x0, y0, x1, y1] : null };
}
const changeText = (d) => (!d ? 'not compared' : d.sizeMismatch ? 'SIZE MISMATCH' : d.changedPx === 0 ? 'IDENTICAL'
  : `changed ${d.changedPct < 0.1 ? '<0.1' : d.changedPct.toFixed(1)}% of pixels`);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function tag(ops, side, x, y, h) {
  const t = TAG[side];
  const w = Math.round(h * 3.2);
  ops.push({ t: 'rect', x, y, w, h, c: t.fill });
  ops.push({ t: 'text', s: t.text, x: x + 7, y: y + Math.round(h * 0.18), f: `bold ${Math.round(h * 0.62)}px ${FONT}`, c: t.ink, max: w - 10 });
  return w;
}

async function runCompare({ cfg, OUT, log, drawSheet, makeSheetPage, afterTheme, results, extra }) {
  const C = cfg.compare;
  const sides = { before: C.before, after: C.after };
  for (const f of fs.readdirSync(OUT)) if (/^([a-z0-9-]+-compare\.png|batch-[a-z0-9-]+\.png|index\.html|compare-manifest\.json)$/.test(f)) fs.unlinkSync(path.join(OUT, f));
  const file = (side, theme, state) => path.join(sides[side].dir, `${theme}-${state}.png`);

  // Positive control for the change figure: a grid and a hover capture of the same theme differ.
  const first = C.themes[0].theme;
  const ctl = diff(bitmap(file('before', first, 'grid')), bitmap(file('before', first, 'hover')));
  extra.diffControl = { pair: `${first} grid vs ${first} hover (both BEFORE)`, ...ctl, pass: ctl.changedPx > 0 };
  log(`diff control: ${extra.diffControl.pair} -> ${changeText(ctl)}`);

  const win = await makeSheetPage();
  try {
    for (const { theme, name } of C.themes) {
      const r = { theme, name, ok: true, problems: [], file: `${theme}-compare.png`, diffs: {} };
      let cw = 0, ch = 0;
      for (const s of STATES) {
        const a = bitmap(file('before', theme, s)), b = bitmap(file('after', theme, s));
        r.diffs[s] = diff(a, b);
        if (r.diffs[s].sizeMismatch) r.problems.push(`${s}: before ${a.w}x${a.h}, after ${b.w}x${b.h}`);
        cw = Math.max(cw, a.w, b.w); ch = Math.max(ch, a.h, b.h);
      }
      // Per-theme sheet at native capture size: nothing is scaled, so it is what Sergei sees.
      const pad = 16, head = 68, rowLab = 28, panLab = 26, gap = 18, foot = 30;
      const w = pad + 2 * (cw + pad);
      const h = head + STATES.length * (rowLab + panLab + ch + gap) + foot;
      const ops = [
        { t: 'text', s: `${name}   (${theme})`, x: pad, y: 12, f: `bold 24px ${FONT}`, c: INK, max: w - 2 * pad },
        { t: 'text', s: `BEFORE ${C.before.label}   vs   AFTER ${C.after.label}`, x: pad, y: 44, f: `14px ${FONT}`, c: DIM, max: w - 2 * pad },
      ];
      const images = [];
      STATES.forEach((s, i) => {
        const y = head + i * (rowLab + panLab + ch + gap);
        ops.push({ t: 'text', s: `${s.toUpperCase()}  ·  ${changeText(r.diffs[s])}`, x: pad, y: y + 4, f: `bold 16px ${FONT}`, c: r.diffs[s].changedPx === 0 ? DIM : INK, max: w - 2 * pad });
        ['before', 'after'].forEach((side, j) => {
          const x = pad + j * (cw + pad);
          const tw = tag(ops, side, x, y + rowLab, 20);
          ops.push({ t: 'text', s: `${name}  ·  ${sides[side].label}`, x: x + tw + 8, y: y + rowLab + 2, f: `14px ${FONT}`, c: INK, max: cw - tw - 8 });
          ops.push({ t: 'rect', x, y: y + rowLab + panLab, w: cw, h: ch, c: CELL });
          const k = `${side}-${s}`;
          images.push([k, file(side, theme, s)]);
          ops.push({ t: 'img', k, x, y: y + rowLab + panLab, w: cw, h: ch });
        });
      });
      ops.push({ t: 'text', s: C.footer, x: pad, y: h - foot + 8, f: `12px ${FONT}`, c: DIM, max: w - 2 * pad });
      await drawSheet(win, path.join(OUT, r.file), { w, h, bg: BG, ops, themes: [theme] }, images);
      r.ok = r.problems.length === 0;
      results.push(r);
      await afterTheme(r);
    }

    // Batch sheet: one image, every theme's main grid before | after, laid out so the whole
    // thing stays legible at a ~1000-1200 px wide chat preview.
    const n = results.length;
    const cols = n <= 3 ? 1 : n <= 12 ? 2 : 3;
    const W = cols === 3 ? 1800 : 1200;
    const pad = 16, pairGap = 10, head = 74, nameH = 30, tagH = 24, cellGap = 18, foot = 30;
    const cellW = Math.floor((W - pad * (cols + 1)) / cols);
    const capW = Math.floor((cellW - pairGap) / 2);
    const cw0 = bitmap(file('before', results[0].theme, 'grid'));
    const capH = Math.round(capW * cw0.h / cw0.w);
    const cellH = nameH + tagH + capH + cellGap;
    const rows = Math.ceil(n / cols);
    const H = head + rows * cellH + foot;
    const ops = [
      { t: 'text', s: `${C.batchTitle}: ${n} theme${n === 1 ? '' : 's'}, main grid`, x: pad, y: 12, f: `bold 26px ${FONT}`, c: INK, max: W - 2 * pad },
      { t: 'text', s: `BEFORE ${C.before.label}   vs   AFTER ${C.after.label}.   Full size, all three states: <theme>-compare.png`, x: pad, y: 46, f: `15px ${FONT}`, c: DIM, max: W - 2 * pad },
    ];
    const images = [];
    results.forEach((r, i) => {
      const x = pad + (i % cols) * (cellW + pad), y = head + Math.floor(i / cols) * cellH;
      ops.push({ t: 'text', s: r.name, x, y: y + 2, f: `bold 19px ${FONT}`, c: INK, max: Math.floor(cellW * 0.6) });
      ops.push({ t: 'text', s: `grid ${changeText(r.diffs.grid)}`, x: x + cellW, y: y + 5, a: 'right', f: `15px ${FONT}`, c: r.diffs.grid.changedPx === 0 ? DIM : INK, max: Math.floor(cellW * 0.38) });
      ['before', 'after'].forEach((side, j) => {
        const cx = x + j * (capW + pairGap);
        const tw = tag(ops, side, cx, y + nameH, 20);
        ops.push({ t: 'text', s: sides[side].label, x: cx + tw + 6, y: y + nameH + 2, f: `13px ${FONT}`, c: DIM, max: capW - tw - 6 });
        ops.push({ t: 'rect', x: cx, y: y + nameH + tagH, w: capW, h: capH, c: CELL });
        const k = `${side}-${r.theme}`;
        images.push([k, file(side, r.theme, 'grid')]);
        ops.push({ t: 'img', k, x: cx, y: y + nameH + tagH, w: capW, h: capH });
      });
    });
    ops.push({ t: 'text', s: C.footer, x: pad, y: H - foot + 8, f: `12px ${FONT}`, c: DIM, max: W - 2 * pad });
    const batchFile = `batch-${C.batch}.png`;
    await drawSheet(win, path.join(OUT, batchFile), { w: W, h: H, bg: BG, ops, themes: results.map((r) => r.theme) }, images);
    extra.batchSheet = { file: batchFile, size: [W, H], columns: cols, captureWidth: capW };

    // A static local index: plain HTML and CSS, relative image links, nothing fetched.
    const rowsHtml = results.map((r) => `<tr><td><a href="#${esc(r.theme)}">${esc(r.name)}</a> <span class="k">${esc(r.theme)}</span></td>${STATES.map((s) => `<td class="${r.diffs[s].changedPx ? 'chg' : 'same'}">${esc(changeText(r.diffs[s]))}</td>`).join('')}</tr>`).join('\n');
    const figs = results.map((r) => `<section id="${esc(r.theme)}"><h3>${esc(r.name)} <span class="k">${esc(r.theme)}</span></h3><a href="${esc(r.file)}"><img src="${esc(r.file)}" alt="${esc(r.name)}: before and after" loading="lazy"></a></section>`).join('\n');
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>QuickLaunch theme compare</title>
<style>
:root { color-scheme: dark; }
body { margin: 0; padding: 16px; background: ${BG}; color: ${INK}; font: 15px/1.45 "Segoe UI", system-ui, sans-serif; }
main { max-width: 1360px; margin: 0 auto; }
h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 18px; margin: 28px 0 8px; } h3 { font-size: 16px; margin: 24px 0 8px; }
p.sub { color: ${DIM}; margin: 0 0 16px; }
img { max-width: 100%; height: auto; display: block; border: 1px solid #44474d; }
table { border-collapse: collapse; width: 100%; } th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #44474d; }
td.same { color: ${DIM}; } td.chg { color: ${INK}; font-weight: 600; } .k { color: ${DIM}; font-size: 13px; font-weight: 400; }
a { color: #9cc0f0; }
</style></head><body><main>
<h1>${esc(C.batchTitle)}: before and after</h1>
<p class="sub">BEFORE ${esc(C.before.label)} &nbsp;vs&nbsp; AFTER ${esc(C.after.label)}. ${esc(C.footer)}</p>
<h2>Batch sheet</h2>
<a href="${esc(batchFile)}"><img src="${esc(batchFile)}" alt="Batch sheet"></a>
<h2>Change per state</h2>
<table><thead><tr><th>Theme</th>${STATES.map((s) => `<th>${s}</th>`).join('')}</tr></thead><tbody>
${rowsHtml}
</tbody></table>
<h2>Per theme (full size)</h2>
${figs}
</main></body></html>
`;
    fs.writeFileSync(path.join(OUT, 'index.html'), html);
  } finally { win.destroy(); }
}

module.exports = { runCompare, changeText };
