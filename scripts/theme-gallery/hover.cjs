'use strict';
// Hover legibility gate (npm run check:hover). Loaded by main.cjs when run.mjs is started with
// --hover-check; run.mjs owns the baseline, the verdict and every guard around this process.
//
// Definition: Docs/QuickLaunch_HoverFix57_Spec_2026-10-02.md section 5 (which amends
// Docs/QuickLaunch_HoverAndPickerSearch_Spec_2026-10-01.md section 2).
//   - One page per theme: the real index.html + base.css + theme + app.js, the gallery's stub
//     preload and mock data, in an offscreen 520x760 window at 1x on an opaque black backdrop,
//     transitions and animations off, #app-entrance hidden.
//   - 40 readings per theme (TARGETS below). States are forced with CSS.forcePseudoState
//     (hover; hover + active = "pressed"); no mouse or key input is sent. DOM.getDocument is
//     called once per page (a second call drops forced states).
//   - Label = the computed `color`, resolved through a 1x1 canvas (so oklch()/color-mix()
//     results are read as the sRGB that is painted), composited over the fill when translucent.
//   - Fill = the worst of (a) the element's own background-color when it is opaque and has no
//     background-image (elements read on their own box only, not tile or picker-row names) and
//     (b) every colour covering >= 20 % of the non-label pixels in the label's text box (the
//     text node's range rect padded 3 px sideways and 2 px up and down, clipped to the element's
//     border box; non-label = channel-difference sum from the label colour >= 60; the most
//     frequent colour always counts; no non-label pixel -> all pixels).
//   - Ratio: the WCAG function of scripts/check-theme-contrast.js (shared, not copied).
//   - Two positive controls run first, on fixture copies of a theme's text set through the
//     DevTools protocol (nothing is written to disk); run.mjs voids the run if either passes.
const fs = require('fs');
const path = require('path');
const { BrowserWindow } = require('electron');
const { contrast, composite, AA_NORMAL_TEXT, AA_UI_ELEMENT } = require('../check-theme-contrast.js');

const PROF = { frames: 0, grab: 0, n: 0 }; // capture timing (ms waiting for frames, ms in capturePage, grabs), in the report
const FLOOR = { label: AA_NORMAL_TEXT, glyph: AA_UI_ELEMENT };

// sc = scene the element is shown in; sub = the label inside the element (read on the element's box);
// withTile = the remove button's tile is hovered too; forceSub = the label gets the same forced state.
const TARGETS = [
  { sc: 'main', id: 'hdr-random', sel: '#btn-random-theme', kind: 'glyph', states: ['hover', 'pressed'] },
  { sc: 'main', id: 'hdr-settings', sel: '#btn-settings', kind: 'glyph', states: ['hover', 'pressed'] },
  { sc: 'main', id: 'hdr-hide', sel: '#btn-hide', kind: 'glyph', states: ['hover', 'pressed'] },
  { sc: 'main', id: 'hdr-full', sel: '#btn-fullscreen', kind: 'glyph', states: ['hover', 'pressed'] },
  { sc: 'main', id: 'chip-clear', sel: '#filter-chip-clear', kind: 'glyph', states: ['hover', 'pressed'] },
  { sc: 'main', id: 'edit-add-file', sel: '#btn-add-edit', kind: 'label', states: ['hover', 'pressed'] },
  { sc: 'main', id: 'edit-add-installed', sel: '#btn-add-installed', kind: 'label', states: ['hover', 'pressed'] },
  { sc: 'main', id: 'edit-done', sel: '#btn-done-edit', kind: 'label', states: ['hover', 'pressed'] },
  { sc: 'main', id: 'update-action', sel: '#update-actions .update-btn:not(.update-dismiss)', kind: 'label', states: ['hover', 'pressed'] },
  { sc: 'main', id: 'update-dismiss', sel: '#update-actions .update-dismiss', kind: 'glyph', states: ['hover', 'pressed'] },
  { sc: 'main', id: 'tile-remove', sel: '#app-grid .app-tile .btn-remove', kind: 'glyph', states: ['hover', 'pressed'], withTile: true },
  { sc: 'main', id: 'tile-label', sel: '#app-grid .app-tile', sub: '.tile-label', kind: 'label', states: ['hover'] },
  { sc: 'main', id: 'tile-label-rename', sel: '#app-grid .app-tile', sub: '.tile-label.renameable', kind: 'label', states: ['hover'], forceSub: true },
  { sc: 'settings', id: 'set-hotkey-clear', sel: '#btn-hotkey-clear', kind: 'glyph', states: ['hover', 'pressed'] },
  { sc: 'settings', id: 'set-check-update', sel: '#btn-check-update', kind: 'label', states: ['hover', 'pressed'] },
  { sc: 'settings', id: 'set-close', sel: '#btn-close-settings', kind: 'label', states: ['hover', 'pressed'] },
  { sc: 'skin', id: 'skin-row-hover', sel: '.theme-picker-item[data-qlh="row-hover"]', kind: 'label', states: ['hover'] },
  { sc: 'skin', id: 'skin-row-active', sel: '.theme-picker-item[data-qlh="row-active"]', kind: 'label', states: ['rest'] },
  { sc: 'skin', id: 'skin-row-selected', sel: '.theme-picker-item[data-qlh="row-selected"]', kind: 'label', states: ['rest'] },
  { sc: 'cheat', id: 'cheat-close', sel: '#btn-close-cheatsheet', kind: 'label', states: ['hover', 'pressed'] },
  { sc: 'picker', id: 'picker-browse', sel: '#btn-browse-picker', kind: 'label', states: ['hover', 'pressed'] },
  { sc: 'picker', id: 'picker-close', sel: '#btn-close-picker', kind: 'label', states: ['hover', 'pressed'] },
  { sc: 'picker', id: 'picker-row-hover', sel: '#picker-list .picker-item', sub: '.picker-item-name', kind: 'label', states: ['hover'] },
];
const READINGS = TARGETS.flatMap((t) => t.states.map((st) => ({ ...t, st, pair: `${t.id}/${st}`, floor: FLOOR[t.kind] })));
const SCENES = ['main', 'settings', 'skin', 'cheat', 'picker'];
const PER_THEME = READINGS.length; // 40: 17 buttons x 2 states + 6 single-state readings

// Rows the installed-apps picker shows (get-installed-apps is answered with these in this mode).
const INSTALLED_ROWS = ['Calculator', 'Paint', 'Visual Studio Code'].map((name, i) => ({ name, appId: `QLHover.Mock${i + 1}`, iconDataUrl: null }));

// Each scene is reached through the app's own functions (app.js is a classic script, so its
// top-level functions and bindings are reachable from the page's main world).
const SCENE_JS = {
  main: `(() => {
    enterEditMode();
    _filterText = 'vis'; updateFilterChip();
    showUpdateBanner('UPDATE READY \\u2014 WILL INSTALL AND RESTART', [{ label: 'INSTALL NOW', action: 'install' }]);
    const shown = (id) => !document.getElementById(id).classList.contains('hidden');
    const problems = [];
    if (!shown('edit-bar')) problems.push('edit bar not shown');
    if (!shown('filter-chip')) problems.push('filter chip not shown');
    if (!shown('update-banner')) problems.push('update banner not shown');
    if (!document.querySelector('#app-grid .app-tile .btn-remove')) problems.push('no tile remove button');
    if (!document.querySelector('#app-grid .app-tile .tile-label.renameable')) problems.push('no renameable tile label');
    return problems;
  })()`,
  settings: `(() => {
    exitEditMode();
    _filterText = ''; updateFilterChip();
    document.getElementById('update-banner').classList.add('hidden');
    showOverlayAtTop(elSettingsOverlay);
    return elSettingsOverlay.classList.contains('hidden') ? ['settings overlay not shown'] : [];
  })()`,
  skin: `(() => {
    // The app opens the skin list on the search field's focus event.
    const input = document.getElementById('theme-search');
    input.dispatchEvent(new FocusEvent('focus'));
    const list = document.getElementById('theme-picker-list');
    if (list.classList.contains('hidden')) return ['skin list did not open'];
    const items = [...list.querySelectorAll('.theme-picker-item')];
    const s = items.findIndex((i) => i.classList.contains('selected'));
    if (s < 0 || items.length < 3) return ['skin list has no current-skin row or fewer than 3 rows'];
    // The arrow-key cursor row below the current skin, the hovered row above it (or the next free one).
    const a = s + 1 < items.length ? s + 1 : s - 1;
    const h = [s - 1, s + 2, s - 2].find((i) => i >= 0 && i < items.length && i !== a);
    items.forEach((i) => i.classList.remove('active'));
    items[a].classList.add('active');
    items[s].dataset.qlh = 'row-selected'; items[a].dataset.qlh = 'row-active'; items[h].dataset.qlh = 'row-hover';
    const top = items[Math.min(s, a, h)];
    list.scrollTop += top.getBoundingClientRect().top - list.getBoundingClientRect().top - list.clientTop;
    const lr = list.getBoundingClientRect();
    const out = [s, a, h].filter((i) => { const r = items[i].getBoundingClientRect(); return !(r.top >= lr.top - 0.5 && r.bottom <= lr.bottom + 0.5 && r.bottom <= innerHeight); });
    return out.length ? ['skin rows not fully in view: ' + out.join(',')] : [];
  })()`,
  cheat: `(() => {
    document.getElementById('theme-picker-list').classList.add('hidden');
    const sc = document.getElementById('theme-search').closest('.overlay-scroll');
    if (sc) sc.classList.remove('picker-open');
    elSettingsOverlay.classList.add('hidden');
    openCheatsheet();
    return document.getElementById('cheatsheet-overlay').classList.contains('hidden') ? ['cheat-sheet not shown'] : [];
  })()`,
  picker: `(async () => {
    closeCheatsheet();
    await openInstalledAppsPicker();
    const problems = [];
    if (document.getElementById('apps-picker').classList.contains('hidden')) problems.push('installed-apps picker not shown');
    const n = document.querySelectorAll('#picker-list .picker-item').length;
    if (n !== ${INSTALLED_ROWS.length}) problems.push('installed-apps picker shows ' + n + ' rows');
    return problems;
  })()`,
};

// In-page reader: geometry of the element and its label, the label's computed colour and the
// element's background, both resolved to sRGB through a 1x1 canvas.
const INSTALL_READER = `(() => {
  const c = document.createElement('canvas'); c.width = c.height = 1;
  const x = c.getContext('2d', { willReadFrequently: true });
  const cv = (s) => { x.clearRect(0, 0, 1, 1); x.fillStyle = '#000'; x.fillStyle = s; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], +(d[3] / 255).toFixed(3)]; };
  window.__qlhRead = (sel, sub) => {
    const box = document.querySelector(sel);
    if (!box) return { error: 'no element ' + sel };
    const txt = sub ? box.querySelector(sub) : box;
    if (!txt) return { error: 'no label ' + sub + ' in ' + sel };
    const r = box.getBoundingClientRect();
    const rg = document.createRange(); rg.selectNodeContents(txt); const rr = rg.getBoundingClientRect();
    const cs = getComputedStyle(txt), cb = getComputedStyle(box);
    return { rect: [r.left, r.top, r.width, r.height], xrect: [rr.left, rr.top, rr.width, rr.height],
      color: cs.color, rgba: cv(cs.color), bg: cb.backgroundColor, bgRGBA: cv(cb.backgroundColor),
      hasImg: cb.backgroundImage !== 'none', text: (txt.textContent || '').trim().slice(0, 24) };
  };
  return true;
})()`;

const NO_MOTION = '*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; } #app-entrance { display: none !important; }';
const hex = (rgb) => '#' + rgb.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();

/** The label's text box: its range rect padded 3 px sideways and 2 px up and down, clipped to the element's border box (whole CSS px at 1x). */
function textBox(m, t, vw, vh) {
  const [bl, bt, bw, bh] = m.rect, [xl, xt, xw, xh] = m.xrect;
  if (!(bw > 0 && bh > 0)) return { error: `element has no box (${t.sel})` };
  if (!(xw > 0 && xh > 0)) return { error: `label has no text box (${t.sub || t.sel})` };
  const x0 = Math.max(bl, xl - 3), y0 = Math.max(bt, xt - 2), x1 = Math.min(bl + bw, xl + xw + 3), y1 = Math.min(bt + bh, xt + xh + 2);
  const cx = Math.floor(x0), cy = Math.floor(y0);
  const cw = Math.max(2, Math.ceil(x1 - cx)), ch = Math.max(2, Math.ceil(y1 - cy));
  if (cx < 0 || cy < 0 || cx + cw > vw || cy + ch > vh) return { error: `text box ${cx},${cy} ${cw}x${ch} is outside the ${vw}x${vh} view` };
  return { box: [cx, cy, cw, ch] };
}

/** Fill candidates and the worst reading for one label, from the BGRA capture of its text box. */
function readFill(img, m, t) {
  const L = { r: m.rgba[0], g: m.rgba[1], b: m.rgba[2], a: m.rgba[3] };
  const hist = (skipNear) => {
    const map = new Map();
    for (let i = 0; i < img.w * img.h * 4; i += 4) {
      const a = img.bmp[i + 3] / 255; // the window is opaque black; composite anyway
      const r = Math.round(img.bmp[i + 2] * a), g = Math.round(img.bmp[i + 1] * a), b = Math.round(img.bmp[i] * a);
      if (skipNear && Math.abs(r - L.r) + Math.abs(g - L.g) + Math.abs(b - L.b) < 60) continue;
      const k = (r << 16) | (g << 8) | b;
      map.set(k, (map.get(k) || 0) + 1);
    }
    return [...map.entries()].sort((p, q) => q[1] - p[1]);
  };
  let ents = hist(true);
  const allNear = !ents.length;
  if (allNear) ents = hist(false);
  const total = ents.reduce((n, e) => n + e[1], 0);
  const cands = ents.filter((e, i) => i === 0 || e[1] >= 0.2 * total).map((e) => ({ rgb: [e[0] >> 16, (e[0] >> 8) & 255, e[0] & 255], src: 'box' }));
  if (!t.sub && m.bgRGBA[3] >= 0.999 && !m.hasImg) cands.push({ rgb: m.bgRGBA.slice(0, 3), src: 'css' });
  let worst = null;
  for (const c of cands) {
    const bg = { r: c.rgb[0], g: c.rgb[1], b: c.rgb[2], a: 1 };
    const ratio = contrast(composite(L, bg), bg);
    if (!worst || ratio < worst.ratio) worst = { ...c, ratio };
  }
  return { ratio: worst.ratio, fill: hex(worst.rgb), src: worst.src, candidates: cands.length, allNear };
}

async function runHover(o) {
  const { cfg, log, js, waitFor, sleep, FRAMES, mock, themeOfWc, extra, results, INDEX, RENDERER, THEMES, checkpoint, emulate, viewportProblem, isFinished } = o;
  const hc = cfg.hover || {};
  const neuter = new Set(hc.neuter || []);
  extra.hover = { perTheme: PER_THEME, pairs: READINGS.map((r) => ({ pair: r.pair, kind: r.kind, floor: r.floor })), pcs: [], window: [cfg.width, cfg.height], scale: cfg.scale, fps: hc.fps };

  // ── positive controls (fixture theme text, set over the real theme's stylesheet) ─────────
  const pcJobs = [];
  if (hc.controls !== false) { // with several processes, only process 1 runs the controls
    const bg = neuter.has('pc1') ? '#101010' : '#E3C68E';
    pcJobs.push({ kind: 'pc', id: 'PC1', theme: 'cyberpunk', pair: 'edit-add-file/hover', under: 2,
      what: `fixture theme --btn-hover-bg:${bg} with a white hover label`, neutered: neuter.has('pc1'),
      fixture: `/* check:hover PC1 fixture */\n:root { --btn-hover-bg: ${bg}; --btn-hover-text: #fff; }\n` });
    // A light theme that forgets to opt out of the band must fail. If 2001.css has lost the line
    // itself, the file is used as it is (its own readings then fail the run as well).
    const src = fs.readFileSync(path.join(RENDERER, 'styles', 'themes', '2001.css'), 'utf8');
    const stripped = src.replace(/^[ \t]*--hover-label-floor[ \t]*:[ \t]*0[ \t]*;[^\n]*\n/gm, '');
    pcJobs.push({ kind: 'pc', id: 'PC2', theme: '2001', pair: 'edit-done/hover', under: AA_NORMAL_TEXT, neutered: neuter.has('pc2'),
      what: neuter.has('pc2') ? 'real 2001 theme with an explicit --hover-label-floor: 0 (neutered)'
        : `real 2001 theme with its --hover-label-floor: 0 line stripped${stripped === src ? ' (2001.css has no such line)' : ''}`,
      fixture: neuter.has('pc2') ? `${src}\n:root { --hover-label-floor: 0; }\n` : stripped });
  }

  function makeWindow() {
    const win = new BrowserWindow({
      x: 0, y: 0, width: cfg.width + 16, height: cfg.height + 16, useContentSize: true,
      show: false, focusable: false, skipTaskbar: true, frame: false, transparent: false,
      backgroundColor: '#000000', hasShadow: false, resizable: false,
      webPreferences: {
        offscreen: true, sandbox: true, contextIsolation: true, nodeIntegration: false,
        preload: path.join(__dirname, 'preload.cjs'), backgroundThrottling: false, spellcheck: false,
        autoplayPolicy: 'document-user-activation-required',
      },
    });
    // A new window is clamped to its display's work area. With the monitors asleep the desktop can
    // shrink to a virtual 800x600, which cut the 776 px window to 552 and left the lower controls
    // unrendered. The clamp applies at creation only, so the size is set again here.
    win.setContentSize(cfg.width + 16, cfg.height + 16);
    win.webContents.setFrameRate(hc.fps || 120);
    return win;
  }
  // Every window is still checked before use: a window smaller than the view would leave controls unrendered.
  const windowProblem = (win) => {
    const [w, h] = win.getContentSize();
    if (w >= cfg.width && h >= cfg.height) return null;
    const d = require('electron').screen.getPrimaryDisplay();
    return `offscreen window is ${w}x${h}, needs at least ${cfg.width}x${cfg.height}: the display is ${d.bounds.width}x${d.bounds.height} (work area ${d.workArea.width}x${d.workArea.height}); monitors asleep or locked? Re-run with a display on`;
  };
  {
    const probe = makeWindow();
    extra.hover.preflight = windowProblem(probe);
    probe.destroy();
    if (extra.hover.preflight) { log(`hover preflight failed: ${extra.hover.preflight}`); return; }
  }

  async function grab(win, box) {
    const [x, y, width, height] = box;
    const img = await win.webContents.capturePage({ x, y, width, height });
    const sz = img.getSize();
    return { w: sz.width, h: sz.height, bmp: img.toBitmap() };
  }

  /** One page: load, reach each scene, take every reading in `readings`. */
  async function measurePage(win, job, readings) {
    const wc = win.webContents;
    const wp = windowProblem(win);
    if (wp) throw new Error(wp);
    themeOfWc.set(wc.id, job.theme);
    await win.loadFile(INDEX);
    emulate(win);
    await wc.insertCSS(NO_MOTION, { cssOrigin: 'user' });
    await waitFor(win, `(() => { const l = document.getElementById('theme-stylesheet'); if (!l || !l.sheet || !l.sheet.href || !l.sheet.href.endsWith('/styles/themes/${job.theme}.css')) return false; try { if (!l.sheet.cssRules.length) return false; } catch { return false; } return document.querySelectorAll('#app-grid .app-tile').length === ${mock.TILE_COUNT} && document.getElementById('header-version').textContent.length > 0; })()`, 10000, `theme ${job.theme} applied`);
    await js(win, `(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => null))); return true; })()`);
    await js(win, `(() => { try { clearInterval(bannerInterval); clearTimeout(bannerFadeTimer); bannerInterval = null; document.getElementById('theme-banner-text').style.opacity = '1'; return true; } catch (e) { return String(e); } })()`);
    const vp = await js(win, '({ viewport: [innerWidth, innerHeight], dpr: devicePixelRatio })');
    if (viewportProblem(vp)) throw new Error(viewportProblem(vp));

    const d = wc.debugger;
    const sheets = [];
    const onMsg = (e, method, params) => { if (method === 'CSS.styleSheetAdded' && params && params.header) sheets.push(params.header); };
    if (d.isAttached()) d.detach();
    d.attach('1.3');
    d.on('message', onMsg);
    const send = (m, p) => d.sendCommand(m, p || {});
    const forced = [];
    let root = null;
    const force = async (sel, classes) => {
      const { nodeId } = await send('DOM.querySelector', { nodeId: root, selector: sel });
      if (!nodeId) throw new Error(`no node for ${sel}`);
      await send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: classes });
      forced.push(nodeId);
    };
    const unforce = async () => {
      for (const nodeId of forced.splice(0)) { try { await send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] }); } catch { /* node replaced */ } }
    };
    const rows = [];
    try {
      await send('DOM.enable');
      await send('CSS.enable');
      await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 1 } });
      if (job.fixture != null) {
        let sheet = null;
        for (let i = 0; i < 50 && !sheet; i++) {
          sheet = sheets.find((h) => String(h.sourceURL || '').endsWith(`/styles/themes/${job.theme}.css`));
          if (!sheet) await sleep(20);
        }
        if (!sheet) throw new Error(`${job.id}: the theme stylesheet was not reported by the DevTools protocol`);
        await send('CSS.setStyleSheetText', { styleSheetId: sheet.styleSheetId, text: job.fixture });
        await js(win, `document.fonts.ready.then(() => ${FRAMES})`);
      }
      await js(win, INSTALL_READER);
      root = (await send('DOM.getDocument', { depth: 0 })).root.nodeId; // once per page
      for (const sc of SCENES) {
        const list = readings.filter((r) => r.sc === sc);
        if (!list.length) continue;
        await unforce();
        const problems = await js(win, SCENE_JS[sc]);
        if (problems.length) throw new Error(`scene ${sc}: ${problems.join('; ')}`);
        for (const r of list) {
          await unforce();
          const row = { pair: r.pair, id: r.id, st: r.st, kind: r.kind, floor: r.floor };
          try {
            if (r.st !== 'rest') {
              const cls = r.st === 'pressed' ? ['hover', 'active'] : ['hover'];
              if (r.withTile) await force('#app-grid .app-tile', ['hover']);
              await force(r.sel, cls);
              if (r.forceSub) await force(`${r.sel} ${r.sub}`, cls);
            }
            const m = await js(win, `__qlhRead(${JSON.stringify(r.sel)}, ${JSON.stringify(r.sub || null)})`);
            if (m.error) throw new Error(m.error);
            const tb = textBox(m, r, cfg.width, cfg.height);
            if (tb.error) throw new Error(tb.error);
            const [, , cw, ch] = tb.box;
            // A capture is used once two consecutive grabs agree, each taken after two animation frames
            // (so the frame holding the forced state has been produced; grabs without that wait read stale
            // frames that still agreed with each other).
            let prev = null, img = null, grabs = 0, stable = false;
            for (let k = 0; k < 6 && !stable; k++) {
              const q0 = Date.now();
              await js(win, FRAMES);
              const q1 = Date.now();
              img = await grab(win, tb.box);
              PROF.frames += q1 - q0; PROF.grab += Date.now() - q1; PROF.n++;
              grabs++;
              if (img.w !== cw || img.h !== ch) { prev = null; continue; }
              if (prev && prev.bmp.equals(img.bmp)) stable = true;
              prev = img;
            }
            if (!stable) throw new Error(`capture never settled in ${grabs} grabs`);
            const a = readFill(img, m, r);
            Object.assign(row, { label: hex(m.rgba), alpha: m.rgba[3], color: m.color, fill: a.fill, src: a.src, ratio: a.ratio, ratio2: +a.ratio.toFixed(2), fail: a.ratio < r.floor, textBox: tb.box, text: m.text, grabs });
          } catch (e) {
            row.error = String(e.message || e).slice(0, 200);
          }
          rows.push(row);
        }
        await unforce();
      }
    } finally {
      d.removeListener('message', onMsg);
      try { d.detach(); } catch { /* gone */ }
    }
    return rows;
  }

  const themeJobs = THEMES.map((t) => ({ kind: 'theme', theme: t, id: t }));
  const queue = [...pcJobs, ...themeJobs];
  let done = 0;
  const t0 = Date.now();
  async function worker() {
    let win = makeWindow();
    try {
      while (queue.length && !isFinished()) {
        const job = queue.shift();
        const readings = job.kind === 'pc' ? READINGS.filter((r) => r.pair === job.pair) : READINGS;
        const s0 = Date.now();
        let rows = null;
        const problems = [];
        for (let attempt = 1; attempt <= 2 && !rows; attempt++) {
          try { rows = await measurePage(win, job, readings); }
          catch (e) {
            log(`hover ${job.id} attempt ${attempt} failed: ${e.message}`);
            if (attempt === 2) problems.push(`page failed: ${e.message}`);
            try { win.destroy(); } catch { /* gone */ }
            win = makeWindow();
          }
        }
        rows = rows || [];
        for (const r of rows) if (r.error) problems.push(`${r.pair}: ${r.error}`);
        if (job.kind === 'pc') {
          const r = rows[0];
          const pc = { id: job.id, theme: job.theme, pair: job.pair, what: job.what, under: job.under, neutered: job.neutered, problems,
            label: r && r.label, fill: r && r.fill, ratio: r && r.ratio, ratio2: r && r.ratio2 };
          pc.failed = !problems.length && typeof pc.ratio === 'number' && pc.ratio < job.under;
          extra.hover.pcs.push(pc);
          log(`${job.id} ${job.what}: ${job.pair} ${pc.label || '?'} on ${pc.fill || '?'} = ${pc.ratio2 ?? '?'}:1 -> ${pc.failed ? `fails (under ${job.under}), control fired` : 'DID NOT FAIL'}${problems.length ? ' [' + problems.join('; ') + ']' : ''}`);
          continue;
        }
        results.push({ theme: job.theme, ok: problems.length === 0, problems, rows, ms: Date.now() - s0 });
        done++;
        if (done % 25 === 0 || done === THEMES.length) log(`hover ${done}/${THEMES.length} themes, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
        if ((cfg.checkpoints || []).includes(done)) await checkpoint(done);
      }
    } finally { try { win.destroy(); } catch { /* gone */ } }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(cfg.concurrency, queue.length)) }, () => worker()));
  results.sort((a, b) => a.theme.localeCompare(b.theme));
  extra.hover.measureMs = Date.now() - t0;
  extra.hover.profile = PROF;
}

module.exports = { runHover, READINGS, PER_THEME, INSTALLED_ROWS };
