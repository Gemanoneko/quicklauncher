'use strict';
// Regions spike - run-log analysis. Pure: no Electron, no native calls (the
// one exception, leftoverPids, shells out to tasklist and is never used by
// analyze()). ONE piece of code computes the verdict, used three ways:
//   - main.js writes the end-of-run "summary" line with it,
//   - tryit.mjs re-runs it after the process has exited (adds the exit check),
//   - read-run.mjs re-runs it on a saved log, so a better inference rule can be
//     applied to an old run without repeating it.
// Unit tests (simulated runs): node --test spike/desktop-layer/test/
//
// Win+D is inferred from window STATE sampled once a second - no key hooks:
// app windows all minimised, or the desktop holding the foreground with no app
// window shown, or a desktop window raised above the app windows (the Win7-10
// way). Every raw signal is in the log, so the reader can re-infer.

const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const STEP_NAMES = ['launch', 'under windows', 'survives Win+D', 'back after Win+D again', 'recovers after Explorer restart', 'clean exit'];
const USER_QUIT = new Set(['x', 'ctrl-c', 'sigint']);
const GRID_POINTS = 9;          // the recorder hit-tests a 3x3 grid on the panel
const MIN_UNCOVERED = 5;        // ...and calls the panel uncovered at >= 5 of 9
const GOOD_SHARE = 0.8;         // share of a phase's samples that must be good
const LAUNCH_ATTACH_MS = 15000;
const RECOVER_MS = 60000;
const ERROR_EVENTS = new Set(['fatal', 'stop-error', 'summary-error']);

function defaultRunsDir() { return path.join(os.tmpdir(), 'ql-regions-spike', 'runs'); }

function runStamp(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
}

// ------------------------------------------------------------ Show Desktop
function sdOf(s) {
  if (!s || !s.apps || !s.fg) return null;
  const fgDesk = s.fg.kind === 'desktop';
  if (s.apps.shown === 0 && (s.apps.min > 0 || fgDesk)) return true;
  if (fgDesk && s.desktopAboveApps) return true;
  return false;
}

function sdBasis(s) {
  if (s.apps.shown === 0 && s.apps.min > 0) return `all ${s.apps.min} app windows minimised`;
  if (s.apps.shown === 0) return 'desktop in the foreground, no app window showing';
  return 'desktop raised above the app windows';
}

// Debounced on/off tracker: a new state counts once `confirm` samples in a row
// agree. The recorder runs it live (to time the captures); analyze() replays
// it over the logged samples, so both always agree.
function toggleTracker(confirm = 2) {
  let state = null;
  let cand = null;
  let candT = 0;
  let candN = 0;
  return function push(s) {
    const v = sdOf(s);
    if (v === null) return null;
    if (state === null) { state = v; return null; }
    if (v === state) { cand = null; candN = 0; return null; }
    if (cand === v) candN++; else { cand = v; candT = s.t; candN = 1; }
    if (candN < confirm) return null;
    state = v; cand = null; candN = 0;
    return { on: v, t: candT, basis: v ? sdBasis(s) : `${s.apps.shown} app window(s) showing again` };
  };
}

// --------------------------------------------------- renderer payload hygiene
// Only counts and page state cross from the panel. Never a key, never text.
function cleanBeat(p) {
  const o = p && typeof p === 'object' ? p : {};
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 100) / 100 : null);
  return {
    vis: o.vis === 'visible' || o.vis === 'hidden' ? o.vis : 'unknown',
    raf: num(o.raf),
    dpr: num(o.dpr),
    focus: o.focus === true,
  };
}
function cleanInputKind(p) {
  const k = p && p.kind;
  return k === 'key' || k === 'pointer' ? k : null;
}

// ------------------------------------------------------------------ helpers
const onLayer = (s) => !!(s && s.state === 'attached' && s.alive && s.visible && s.parented && s.z && s.z.above);
const uncovered = (s) => !s.cover || s.cover.panel >= MIN_UNCOVERED;
const underApps = (s) => !!(s.rootDesktop && !s.desktopAboveApps && s.apps && s.apps.shown > 0);
const sec = (ms) => `${(ms / 1000).toFixed(1)} s`;
const pct = (f) => (f == null ? '?' : `${Math.round(f * 100)}%`);
const clock = (t) => new Date(t).toLocaleTimeString('en-GB');

function whyNot(s) {
  if (!s) return 'no sample';
  if (s.state !== 'attached') return `state ${s.state}`;
  if (!s.alive) return 'window gone';
  if (!s.visible) return 'hidden';
  if (!s.parented) return `parent is ${s.parentCls || '?'}`;
  if (!s.z || !s.z.above) return 'behind the icons';
  if (s.cover && s.cover.panel < MIN_UNCOVERED) return `covered at ${GRID_POINTS - s.cover.panel}/${GRID_POINTS} points`;
  if (s.desktopAboveApps) return 'desktop above the app windows';
  return 'ok';
}

// Did the panel render in [t0, t1)? A capture decides; a missing or failed
// capture falls back to the page's own paint heartbeat (rAF ticks).
function renderedIn(caps, samples, t0, t1) {
  const cap = caps.find((c) => c.t >= t0 && c.t < t1);
  const painting = samples.some((s) => s.t >= t0 && s.t < t1 && s.rend && s.rend.raf > 0);
  if (cap && cap.ok) {
    return {
      ok: !!cap.rendered,
      text: `capture "${cap.label}" ${cap.rendered ? 'shows the panel' : 'does NOT show the panel'} (${pct(cap.panelBg)} panel colour, ${cap.w}x${cap.h} px)`,
    };
  }
  if (cap) return { ok: painting ? true : false, text: `capture failed (${cap.why})${painting ? ', but the page was painting' : ''}` };
  return { ok: painting ? true : null, text: painting ? 'no capture; the page was painting' : 'rendering not checked' };
}

function phase(samples, t0, t1, settleMs) {
  let p = samples.filter((s) => s.t >= t0 + settleMs && s.t < t1);
  if (!p.length) p = samples.filter((s) => s.t >= t0 && s.t < t1);
  return p;
}

function pidsFrom(events, extraPid) {
  const set = new Set();
  for (const e of events) {
    if (e.event === 'launch' && e.pid) set.add(e.pid);
    if (e.event === 'pids' && Array.isArray(e.pids)) for (const p of e.pids) if (p && p.pid) set.add(p.pid);
  }
  if (extraPid) set.add(extraPid);
  return [...set];
}

// --------------------------------------------------------------- analyze
function analyze(events, opts = {}) {
  const ev = (events || []).filter((e) => e && typeof e.t === 'number' && typeof e.event === 'string');
  const all = (name) => ev.filter((e) => e.event === name);
  const launch = ev.find((e) => e.event === 'launch') || null;
  const samples = all('sample');
  // A test-only stand-in parent (--ql-sim-parent) never counts as the desktop.
  const attachOk = ev.filter((e) => e.event === 'attach-attempt' && e.ok && e.layout !== 'forced-test-parent');
  const caps = all('capture');
  const quit = ev.find((e) => e.event === 'quit') || null;
  const stop = ev.find((e) => e.event === 'stop') || null;
  const exitCheck = opts.exitCheck || [...ev].reverse().find((e) => e.event === 'exit-check') || null;
  const errors = ev.filter((e) => ERROR_EVENTS.has(e.event));
  const tStart = launch ? launch.t : (ev.length ? ev[0].t : 0);
  const tEnd = ev.length ? ev[ev.length - 1].t : tStart;
  const tQuit = quit ? quit.t : tEnd + 1;

  const track = toggleTracker();
  const toggles = [];
  for (const s of samples) { const x = track(s); if (x) toggles.push(x); }

  // Explorer restarts, from the shell-PID sequence (probe lines, else samples).
  let pidSeq = all('explorer').map((e) => ({ t: e.t, pid: e.to || 0 }));
  if (!pidSeq.length) pidSeq = samples.filter((s) => s.shell).map((s) => ({ t: s.t, pid: s.shell.pid || 0 }));
  const restarts = [];
  let known = 0;
  let goneAt = 0;
  for (const p of pidSeq) {
    if (!known) { if (p.pid) known = p.pid; continue; }
    if (p.pid === known) { goneAt = 0; continue; }
    if (!p.pid) { if (!goneAt) goneAt = p.t; continue; }
    restarts.push({ from: known, to: p.pid, tGone: goneAt || p.t, tBack: p.t });
    known = p.pid;
    goneAt = 0;
  }
  const explorerDown = goneAt ? { from: known, tGone: goneAt } : null;

  const steps = [];
  const put = (n, pass, why) => steps.push({ n, name: STEP_NAMES[n - 1], result: pass ? 'PASS' : 'FAIL', why });

  // 1 launch
  const att0 = attachOk[0] || null;
  if (!launch) put(1, false, 'no launch line in the log');
  else if (!att0) {
    const fb = ev.find((e) => e.event === 'mode' && e.to === 'fallback');
    put(1, false, `never reached the desktop layer${fb ? ` (fallback: ${fb.reason})` : ''}`);
  } else if (att0.t - tStart > LAUNCH_ATTACH_MS) {
    put(1, false, `reached the desktop layer only after ${sec(att0.t - tStart)}`);
  } else {
    const r = renderedIn(caps, samples, att0.t, att0.t + 15000);
    put(1, r.ok !== false, `on the desktop layer (${att0.layout}, parent ${att0.hostCls || '?'}) ${sec(att0.t - tStart)} after start; ${r.text}`);
  }

  // 2 under windows (launch .. first Win+D / Explorer gone / quit)
  const sd1 = toggles.find((x) => x.on) || null;
  const r0 = restarts[0] || null;
  let coveredBefore = false;
  if (!att0) put(2, false, 'never on the desktop layer');
  else {
    const end = Math.min(sd1 ? sd1.t : Infinity, r0 ? r0.tGone : Infinity, explorerDown ? explorerDown.tGone : Infinity, tQuit);
    const p2 = samples.filter((s) => s.t >= att0.t && s.t < end && s.state === 'attached' && s.layout !== 'forced-test-parent'
      && s.apps && s.apps.shown > 0 && !sdOf(s));
    const g2 = p2.filter((s) => onLayer(s) && underApps(s));
    const cov = g2.filter((s) => s.cover && s.cover.app > 0);
    coveredBefore = cov.length > 0;
    if (!p2.length) put(2, false, 'no sample with app windows open before Win+D');
    else {
      const bad = p2.find((s) => !(onLayer(s) && underApps(s)));
      put(2, g2.length / p2.length >= GOOD_SHARE,
        `${g2.length}/${p2.length} samples on the desktop layer, in front of the icons, below up to ${Math.max(0, ...g2.map((s) => s.apps.shown))} app windows; `
        + (coveredBefore ? `seen covered by a window in ${cov.length} samples` : 'no window overlapped the panel, so this rests on z-order only')
        + (bad ? `; first bad sample: ${whyNot(bad)}` : ''));
    }
  }

  // 3 survives Win+D
  let sdOff1 = null;
  if (!sd1) put(3, false, 'Win+D not seen in the samples (see the timeline)');
  else {
    sdOff1 = toggles.find((x) => !x.on && x.t > sd1.t) || null;
    const rIn = restarts.find((r) => r.tGone > sd1.t);
    const end = Math.min(sdOff1 ? sdOff1.t : Infinity, rIn ? rIn.tGone : Infinity, tQuit);
    const p3 = phase(samples, sd1.t, end, 1000);
    const g3 = p3.filter((s) => onLayer(s) && uncovered(s));
    const last = p3[p3.length - 1];
    const bad = p3.find((s) => !(onLayer(s) && uncovered(s)));
    const r = renderedIn(caps, samples, sd1.t, end === Infinity ? tEnd + 1 : end);
    const ok = p3.length > 0 && g3.length / p3.length >= GOOD_SHARE && onLayer(last) && r.ok !== false;
    put(3, ok, `Win+D at ${clock(sd1.t)} (${sd1.basis}); panel on the layer and uncovered in ${g3.length}/${p3.length} samples; ${r.text}`
      + (bad ? `; first bad sample: ${whyNot(bad)}` : ''));
  }

  // 4 back after Win+D again
  if (!sd1) put(4, false, 'first Win+D not seen');
  else if (!sdOff1) put(4, false, 'second Win+D not seen (the desktop stayed shown)');
  else {
    const nextOn = toggles.find((x) => x.on && x.t > sdOff1.t);
    const rAfter = restarts.find((r) => r.tGone > sdOff1.t);
    const end = Math.min(nextOn ? nextOn.t : Infinity, rAfter ? rAfter.tGone : Infinity, tQuit, sdOff1.t + 20000);
    const p4 = phase(samples, sdOff1.t, end, 1500);
    const good = (s) => onLayer(s) && underApps(s);
    const g4 = p4.filter(good);
    const coveredAfter = g4.some((s) => s.cover && s.cover.app > 0);
    const bad = p4.find((s) => !good(s));
    const r = renderedIn(caps, samples, sdOff1.t, end);
    const ok = p4.length > 0 && g4.length / p4.length >= GOOD_SHARE && r.ok !== false;
    put(4, ok, `second Win+D at ${clock(sdOff1.t)}; windows back (up to ${Math.max(0, ...p4.map((s) => (s.apps ? s.apps.shown : 0)))}); `
      + `panel still on the layer under them in ${g4.length}/${p4.length} samples; ${r.text}`
      + (coveredBefore ? (coveredAfter ? '; covered by a window again, as before' : '; note: covered before Win+D, not after') : '')
      + (bad ? `; first bad sample: ${whyNot(bad)}` : ''));
  }

  // 5 recovers after Explorer restart
  if (!r0) {
    put(5, false, explorerDown ? `Explorer went away at ${clock(explorerDown.tGone)} and never came back` : 'no Explorer restart seen (its PID never changed)');
  } else {
    const reatt = attachOk.find((a) => a.t >= r0.tGone && a.hostPid === r0.to);
    if (!reatt) {
      const lastMode = [...ev].reverse().find((e) => e.event === 'mode');
      put(5, false, `Explorer restarted (PID ${r0.from} -> ${r0.to}) but the panel never re-attached to the new desktop; last state: ${lastMode ? lastMode.to : '?'}`);
    } else {
      const ms = reatt.t - r0.tGone;
      const confirm = samples.find((s) => s.t >= reatt.t && onLayer(s));
      const rebuilt = ev.some((e) => e.event === 'window' && e.t > r0.tGone && e.t <= reatt.t);
      const fb = ev.some((e) => e.event === 'mode' && e.to === 'fallback' && e.t > r0.tGone && e.t <= reatt.t);
      const r = renderedIn(caps, samples, reatt.t, reatt.t + 15000);
      put(5, ms <= RECOVER_MS && !!confirm && r.ok !== false,
        `Explorer PID ${r0.from} -> ${r0.to}; panel back on the desktop layer ${sec(ms)} after Explorer went away `
        + `(window rebuilt: ${rebuilt ? 'yes' : 'no'}, fallback used: ${fb ? 'yes' : 'no'}); ${r.text}${confirm ? '' : '; no later sample confirmed it'}`);
    }
  }

  // 6 clean exit
  const left = exitCheck && Array.isArray(exitCheck.leftovers) ? exitCheck.leftovers : [];
  if (!quit) {
    put(6, false, left.length ? 'no quit line yet: the spike is still running' : 'no quit line: the process crashed or was killed');
  } else {
    const problems = [];
    if (!USER_QUIT.has(quit.reason)) problems.push(`ended by "${quit.reason}", not by the x or Ctrl+C`);
    if (!stop) problems.push('no stop line');
    else if (stop.ok === false) problems.push(`shutdown error: ${stop.error}`);
    if (errors.length) problems.push(`${errors.length} error line(s), first: ${errors[0].event}`);
    if (left.length) problems.push(`still running after exit: PID ${left.join(', ')}`);
    if (exitCheck && exitCheck.code != null && exitCheck.code !== 0) problems.push(`exit code ${exitCheck.code}`);
    if (exitCheck && exitCheck.forced) problems.push('had to be force-killed');
    const how = quit.reason === 'x' ? 'the x' : 'Ctrl+C';
    const exitText = exitCheck
      ? (exitCheck.tasklist === false ? 'process list unavailable' : `all ${exitCheck.checked} processes gone (checked by the ${exitCheck.by})`)
      : 'process exit not checked yet';
    put(6, problems.length === 0, problems.length ? problems.join('; ') : `closed with ${how}; released from the desktop; ${exitText}`);
  }

  // facts
  const prim = launch && Array.isArray(launch.displays) ? launch.displays.find((x) => x.primary) || launch.displays[0] : null;
  const inputs = all('input');
  const lastIn = inputs[inputs.length - 1];
  const lastS = samples[samples.length - 1];
  const facts = {
    start: tStart,
    durationMs: tEnd - tStart,
    electron: launch ? launch.electron : null,
    os: launch ? launch.os : null,
    scale: prim ? prim.scaleFactor : null,
    dpis: [...new Set(samples.map((s) => s.dpi).filter(Boolean))],
    dprs: [...new Set(samples.map((s) => s.rend && s.rend.dpr).filter(Boolean))],
    sizeMismatchSamples: samples.filter((s) => s.sizeOk === false).length,
    captureSizeMismatches: caps.filter((c) => c.ok && c.scaleOk === false).length,
    layouts: [...new Set(attachOk.map((a) => a.layout))],
    explorerPids: [...new Set(pidSeq.map((p) => p.pid).filter(Boolean))],
    restarts: restarts.length,
    attaches: attachOk.length,
    losses: lastS && lastS.stats ? lastS.stats.losses : 0,
    rebuilt: lastS && lastS.stats ? lastS.stats.recreated : 0,
    fallbacks: ev.filter((e) => e.event === 'mode' && e.to === 'fallback').length,
    clicks: Math.max(lastIn ? lastIn.clicks : 0, lastS && lastS.input ? lastS.input.clicks : 0),
    keys: Math.max(lastIn ? lastIn.keys : 0, lastS && lastS.input ? lastS.input.keys : 0),
    showDesktopToggles: toggles.length,
    captures: caps.length,
    capturesShowingPanel: caps.filter((c) => c.ok && c.rendered).length,
    runDir: launch ? launch.runDir : null,
    samples: samples.length,
    maxSampleMs: samples.reduce((m, s) => Math.max(m, s.ms || 0), 0),
    tickErrors: all('tick-error').length,
    sim: !!(launch && launch.sim) || samples.some((s) => s.sim),
  };
  const overall = steps.every((s) => s.result === 'PASS') ? 'PASS' : 'FAIL';
  const text = steps.map((s) => `${s.n} ${s.name} ${s.result}`).join(' | ');
  return { steps, overall, text, facts, toggles, restarts };
}

function summaryFields(r) {
  return { overall: r.overall, text: r.text, steps: r.steps, facts: r.facts };
}

// ------------------------------------------------------------ presentation
function format(r, { logFile } = {}) {
  const f = r.facts;
  const passed = r.steps.filter((s) => s.result === 'PASS').length;
  const when = f.start ? new Date(f.start).toLocaleString('sv-SE') : '?';
  const mins = Math.floor(f.durationMs / 60000);
  const secs = Math.round((f.durationMs % 60000) / 1000);
  const lines = [];
  lines.push(`Regions spike run ${when}, ${mins} min ${secs} s${f.sim ? '   [SIMULATED EVENTS - not a real try-it]' : ''}`);
  lines.push(`Electron ${f.electron || '?'}, Windows ${f.os || '?'}, display scale ${pct(f.scale)}, panel DPI ${f.dpis.join('/') || '?'}, page DPR ${f.dprs.join('/') || '?'}`
    + (!f.dpis.length ? ', panel size not measured'
      : f.sizeMismatchSamples ? `, panel size WRONG in ${f.sizeMismatchSamples} samples` : ', panel size matches the scale')
    + (f.captureSizeMismatches ? `, ${f.captureSizeMismatches} captures at the wrong pixel size` : ''));
  for (const s of r.steps) lines.push(`  ${s.result}  ${s.n} ${s.name.padEnd(31)} ${s.why}`);
  lines.push(`Overall: ${r.overall} (${passed}/${r.steps.length} steps)`);
  lines.push(`Clicks ${f.clicks}, keystrokes ${f.keys} (counted only, text never logged). Explorer PIDs ${f.explorerPids.join(' -> ') || '?'}. `
    + `Re-attaches ${Math.max(0, f.attaches - 1)}, windows rebuilt ${f.rebuilt}, fallbacks ${f.fallbacks}. Slowest sample ${f.maxSampleMs} ms.`);
  if (logFile) lines.push(`Log: ${logFile}`);
  if (f.runDir) lines.push(`Panel captures (${f.capturesShowingPanel}/${f.captures} show the panel): ${f.runDir}`);
  return lines;
}

function panelState(s) {
  const w = whyNot(s);
  return w === 'ok' ? 'on the layer' : w;
}

function timeline(events, max = 80) {
  const ev = (events || []).filter((e) => e && typeof e.t === 'number');
  if (!ev.length) return [];
  const launch = ev.find((e) => e.event === 'launch');
  const t0 = launch ? launch.t : ev[0].t;
  const out = [];
  let lastAttachFail = '';
  let lastFgKind = null;
  let lastScene = null;
  for (const e of ev) {
    let line = null;
    switch (e.event) {
      case 'launch': line = `launch, PID ${e.pid}${e.sim ? ' (simulated events on)' : ''}`; break;
      case 'mode': line = `state ${e.from} -> ${e.to}${e.reason ? `: ${e.reason}` : ''}${e.recoveredMs != null ? ` (back after ${sec(e.recoveredMs)})` : ''}`; break;
      case 'attach-attempt':
        if (e.ok) { lastAttachFail = ''; line = `attached to ${e.hostCls} ${e.host} (PID ${e.hostPid}, ${e.layout})`; } else if (e.reason !== lastAttachFail) { lastAttachFail = e.reason; line = `attach failed: ${e.reason}`; }
        break;
      case 'explorer': line = e.from == null ? `Explorer PID ${e.to}` : e.to ? `Explorer PID ${e.from} -> ${e.to}` : `Explorer gone (was PID ${e.from})`; break;
      case 'fg': if (e.kind !== lastFgKind) { lastFgKind = e.kind; line = `foreground: ${e.kind}${e.kind === 'desktop' || e.kind === 'taskbar' ? ` (${e.cls})` : ''}`; } break;
      case 'show-desktop': line = `SHOW DESKTOP ${e.on ? 'ON' : 'OFF'} #${e.n}: ${e.basis}`; break;
      case 'sample': {
        if (!e.apps) break;
        const k = `${e.apps.shown}/${e.apps.min}/${!!e.desktopAboveApps}/${panelState(e)}`;
        if (k !== lastScene) { lastScene = k; line = `app windows ${e.apps.shown} showing, ${e.apps.min} minimised${e.desktopAboveApps ? ', desktop above them' : ''}; panel ${panelState(e)}${e.sim ? ' [sim]' : ''}`; }
        break;
      }
      case 'page-visibility': line = `page says ${e.vis}`; break;
      case 'capture': line = `capture ${e.label}: ${e.ok ? (e.rendered ? 'panel drawn' : 'panel NOT drawn') : `failed (${e.why})`}`; break;
      case 'window': line = `panel window ${e.hwnd}${e.rebuilt ? ` (rebuilt #${e.rebuilt})` : ''}`; break;
      case 'input': line = `input so far: ${e.clicks} clicks, ${e.keys} keys`; break;
      case 'focus-hook': line = `keyboard focus ${e.set ? 'given to the panel' : `not given (${e.reason})`}`; break;
      case 'display': // Electron sends one with no metric named at startup: raw log only
        if (Array.isArray(e.what) && e.what.length) line = `display ${e.what.join(',')}: scale ${e.scaleFactor}, ${e.bounds ? `${e.bounds.width}x${e.bounds.height} DIP` : ''}`;
        break;
      case 'power': line = `power: ${e.what}`; break;
      case 'quit': line = `quit (${e.reason})`; break;
      case 'stop': line = `stop: ${e.ok ? 'released from the desktop' : `error ${e.error}`}`; break;
      case 'exit-check': line = `exit check by ${e.by}: ${e.leftovers && e.leftovers.length ? `still running ${e.leftovers.join(',')}` : `all ${e.checked} processes gone`}`; break;
      case 'fatal': case 'tick-error': case 'stop-error': line = `${e.event}: ${String(e.error).split('\n')[0]}`; break;
      default: break;
    }
    if (line) out.push(`+${((e.t - t0) / 1000).toFixed(1).padStart(6)} s  ${line}`);
  }
  if (out.length <= max) return out;
  const half = Math.floor(max / 2);
  return [...out.slice(0, half), `   ... ${out.length - 2 * half} lines skipped ...`, ...out.slice(-half)];
}

// ------------------------------------------------------------------ files
function readLog(file) {
  let raw = '';
  try { raw = fs.readFileSync(file, 'utf8'); } catch { return []; }
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* a line cut off by a crash */ }
  }
  return out;
}

function latestRun(dir = defaultRunsDir()) {
  let names = [];
  try { names = fs.readdirSync(dir).filter((n) => /^run-\d{8}-\d{6}\.jsonl$/.test(n)); } catch { return null; }
  names.sort();
  return names.length ? path.join(dir, names[names.length - 1]) : null;
}

// PIDs from `pids` that are still running as electron.exe (null: tasklist failed).
function leftoverPids(pids) {
  if (!pids.length) return [];
  const { execFileSync } = require('node:child_process');
  let out = '';
  try {
    out = execFileSync('tasklist', ['/FO', 'CSV', '/NH', '/FI', 'IMAGENAME eq electron.exe'], { encoding: 'utf8', windowsHide: true });
  } catch { return null; }
  const alive = new Set();
  for (const line of out.split(/\r?\n/)) {
    const m = line.match(/^"[^"]*","(\d+)"/);
    if (m) alive.add(Number(m[1]));
  }
  return pids.filter((p) => alive.has(p));
}

module.exports = {
  STEP_NAMES, MIN_UNCOVERED, GRID_POINTS,
  defaultRunsDir, runStamp, sdOf, sdBasis, toggleTracker, cleanBeat, cleanInputKind,
  analyze, summaryFields, format, timeline, readLog, latestRun, leftoverPids, pidsFrom,
};
