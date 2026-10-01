'use strict';
// Simulated runs through the run analyzer - no Electron, no desktop, no input.
// Plain Node: node --test spike/desktop-layer/test/
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../run-summary');

const BASE = Date.UTC(2026, 9, 1, 12, 0, 0);
const OLD_PID = 100;
const NEW_PID = 200;

function sample(over = {}) {
  return {
    event: 'sample', state: 'attached', layout: 'raised', alive: true, visible: true, parented: true,
    parentCls: 'Progman', z: { me: 0, defView: 1, above: true }, rootDesktop: true, desktopAboveApps: false,
    apps: { shown: 5, min: 0, cloaked: 0, topmost: 0 }, fg: { kind: 'other', cls: 'CASCADIA_HOSTING_WINDOW_CLASS' },
    cover: { panel: 6, app: 3, desktop: 0, ours: 0, n: 9 }, hostPid: OLD_PID, shell: { pid: OLD_PID },
    dpi: 144, sizeOk: true, rend: { vis: 'visible', raf: 15, dpr: 1.5 }, input: { clicks: 0, keys: 0 },
    stats: { attaches: 1, losses: 0, recreated: 0, raises: 0, fallbacks: 0 }, ms: 3.2, ...over,
  };
}
const SD_ON = { apps: { shown: 0, min: 5, cloaked: 0, topmost: 0 }, fg: { kind: 'desktop', cls: 'WorkerW' }, cover: { panel: 9, app: 0, desktop: 0, ours: 0, n: 9 } };

// A whole try-it run as the recorder would log it. Options switch parts off
// or break them, to check each step's verdict.
function run(o = {}) {
  const ev = [];
  let t = 0;
  const at = (dt, e) => { t += dt; ev.push({ t: BASE + t, ...e }); };
  at(0, { event: 'launch', pid: 4000, electron: '32.3.3', os: '10.0.26300', displays: [{ primary: true, scaleFactor: 1.5 }], runDir: 'C:\\tmp\\run' });
  at(5, { event: 'explorer', from: null, to: OLD_PID });
  at(200, { event: 'window', hwnd: '0x10', rebuilt: 0 });
  at(300, { event: 'mode', from: 'pending', to: 'attached' });
  at(0, { event: 'attach-attempt', ok: true, layout: 'raised', host: '0xa4', hostCls: 'Progman', hostPid: OLD_PID });
  at(0, { event: 'pids', pids: [{ pid: 4000, type: 'Browser' }, { pid: 4001, type: 'GPU' }] });
  for (let i = 0; i < 8; i++) {
    at(1000, sample());
    if (i === 1) at(10, { event: 'capture', label: 'launch', ok: true, rendered: true, panelBg: 0.7, w: 600, h: 750 });
  }
  if (!o.noWinD) {
    for (let i = 0; i < 6; i++) {
      const on = o.raisedDesktop
        ? { fg: { kind: 'desktop', cls: 'WorkerW' }, desktopAboveApps: true, cover: SD_ON.cover }
        : SD_ON;
      at(1000, sample({ ...on, ...(o.hiddenDuringWinD && i >= 1 ? { visible: false } : {}) }));
      if (i === 2) at(10, { event: 'capture', label: 'show-desktop-on-1', ok: true, rendered: !o.blankAfterWinD, panelBg: o.blankAfterWinD ? 0 : 0.7, w: 600, h: 750 });
    }
    if (!o.noSecondWinD) {
      for (let i = 0; i < 6; i++) {
        at(1000, sample());
        if (i === 2) at(10, { event: 'capture', label: 'show-desktop-off-1', ok: true, rendered: true, panelBg: 0.7, w: 600, h: 750 });
      }
    }
  }
  let hostPid = OLD_PID;
  if (!o.noExplorer) {
    at(1000, o.samplesOnlyExplorer ? sample() : { event: 'explorer', from: OLD_PID, to: 0, progman: '0' });
    at(10, { event: 'mode', from: 'attached', to: 'pending', reason: 'window destroyed with its parent' });
    for (let i = 0; i < 3; i++) at(1000, sample({ state: 'pending', alive: false, visible: false, parented: false, z: null, cover: null, shell: { pid: 0 } }));
    if (!o.samplesOnlyExplorer) at(200, { event: 'explorer', from: 0, to: NEW_PID, progman: '0xb8' });
    at(300, { event: 'window', hwnd: '0x20', rebuilt: 1 });
    if (o.fallbackFirst) {
      at(9000, { event: 'mode', from: 'pending', to: 'fallback', reason: 'Progman not found' });
      at(1000, sample({ state: 'fallback', parented: false, z: null, shell: { pid: NEW_PID } }));
    }
    if (!o.noRecover) {
      at(400, { event: 'mode', from: o.fallbackFirst ? 'fallback' : 'pending', to: 'attached', recovered: true, recoveredMs: 2300 });
      at(0, { event: 'attach-attempt', ok: true, layout: 'raised', host: '0xb8', hostCls: 'Progman', hostPid: NEW_PID });
      hostPid = NEW_PID;
    }
    for (let i = 0; i < 6; i++) {
      at(1000, o.noRecover
        ? sample({ state: 'pending', alive: true, visible: false, parented: false, z: null, shell: { pid: NEW_PID } })
        : sample({ hostPid, shell: { pid: NEW_PID }, stats: { attaches: 2, losses: 0, recreated: 1, raises: 0, fallbacks: o.fallbackFirst ? 1 : 0 } }));
      if (i === 1 && !o.noRecover) at(10, { event: 'capture', label: 'recovered-1', ok: true, rendered: true, panelBg: 0.7, w: 600, h: 750 });
    }
  }
  if (!o.crash) {
    at(500, { event: 'quit', code: 0, reason: o.quitReason || 'x' });
    at(5, { event: 'stop', ok: true, released: true });
    at(1500, { event: 'exit-check', by: 'launcher', code: 0, checked: 3, leftovers: o.leftovers || [], tasklist: true, forced: false });
  }
  return ev;
}

const verdict = (r) => r.steps.map((s) => s.result);

test('full run: every step passes', () => {
  const r = S.analyze(run());
  assert.deepEqual(verdict(r), ['PASS', 'PASS', 'PASS', 'PASS', 'PASS', 'PASS'], JSON.stringify(r.steps, null, 1));
  assert.equal(r.overall, 'PASS');
  assert.match(r.steps[2].why, /all 5 app windows minimised/);
  assert.match(r.steps[3].why, /covered by a window again/);
  assert.match(r.steps[4].why, /PID 100 -> 200/);
  assert.equal(r.facts.scale, 1.5);
  assert.deepEqual(r.facts.explorerPids, [OLD_PID, NEW_PID]);
});

test('no Win+D seen: steps 3 and 4 fail with "not seen", the rest still pass', () => {
  const r = S.analyze(run({ noWinD: true }));
  assert.deepEqual(verdict(r), ['PASS', 'PASS', 'FAIL', 'FAIL', 'PASS', 'PASS']);
  assert.match(r.steps[2].why, /not seen/);
  assert.ok(S.timeline(run({ noWinD: true })).length > 5);
});

test('Win7-10 style Show Desktop (desktop raised, windows not minimised) is detected', () => {
  const r = S.analyze(run({ raisedDesktop: true }));
  assert.equal(r.steps[2].result, 'PASS', r.steps[2].why);
  assert.match(r.steps[2].why, /desktop raised above the app windows/);
});

test('panel hidden during Win+D fails step 3 and says why', () => {
  const r = S.analyze(run({ hiddenDuringWinD: true }));
  assert.equal(r.steps[2].result, 'FAIL');
  assert.match(r.steps[2].why, /hidden/);
});

test('capture after Win+D without the panel fails step 3', () => {
  const r = S.analyze(run({ blankAfterWinD: true }));
  assert.equal(r.steps[2].result, 'FAIL');
  assert.match(r.steps[2].why, /does NOT show the panel/);
});

test('second Win+D missing fails step 4 only', () => {
  // windows stay minimised to the end, so no Explorer restart either
  const r = S.analyze(run({ noSecondWinD: true, noExplorer: true }));
  assert.equal(r.steps[2].result, 'PASS', r.steps[2].why);
  assert.equal(r.steps[3].result, 'FAIL');
  assert.match(r.steps[3].why, /second Win\+D not seen/);
});

test('Explorer restarted but the panel never came back fails step 5', () => {
  const r = S.analyze(run({ noRecover: true }));
  assert.equal(r.steps[4].result, 'FAIL');
  assert.match(r.steps[4].why, /never re-attached/);
});

test('recovery through the fallback still passes step 5 and says so', () => {
  const r = S.analyze(run({ fallbackFirst: true }));
  assert.equal(r.steps[4].result, 'PASS', r.steps[4].why);
  assert.match(r.steps[4].why, /fallback used: yes/);
  assert.match(r.steps[4].why, /window rebuilt: yes/);
});

test('Explorer restart is found from the samples when there are no probe lines', () => {
  const ev = run({ samplesOnlyExplorer: true }).filter((e) => e.event !== 'explorer');
  const r = S.analyze(ev);
  assert.equal(r.steps[4].result, 'PASS', r.steps[4].why);
});

test('no Explorer restart: step 5 fails with "never changed"', () => {
  const r = S.analyze(run({ noExplorer: true }));
  assert.equal(r.steps[4].result, 'FAIL');
  assert.match(r.steps[4].why, /PID never changed/);
});

test('clean exit: crash, leftovers and a timer quit all fail step 6', () => {
  assert.match(S.analyze(run({ crash: true })).steps[5].why, /crashed or was killed/);
  assert.match(S.analyze(run({ leftovers: [4001] })).steps[5].why, /still running after exit: PID 4001/);
  assert.match(S.analyze(run({ quitReason: 'exit-after' })).steps[5].why, /not by the x or Ctrl\+C/);
  assert.equal(S.analyze(run({ quitReason: 'ctrl-c' })).steps[5].result, 'PASS');
});

test('a test stand-in parent (--ql-sim-parent) never counts as the desktop layer', () => {
  const ev = run().map((e) => (e.event === 'attach-attempt' && e.hostPid === OLD_PID ? { ...e, layout: 'forced-test-parent' } : e));
  const r = S.analyze(ev);
  // the first REAL attach is the one after the simulated Explorer restart
  assert.equal(r.steps[0].result, 'FAIL');
  assert.match(r.steps[0].why, /only after/);
  assert.doesNotMatch(r.steps[0].why, /forced-test-parent/);
});

test('one odd sample does not count as a Show Desktop toggle (debounce)', () => {
  const ev = run({ noWinD: true });
  const i = ev.findIndex((e) => e.event === 'sample');
  ev.splice(i + 3, 1, { ...ev[i + 3], ...SD_ON });
  assert.equal(S.analyze(ev).toggles.length, 0);
});

test('the live tracker and the analyzer find the same toggles', () => {
  const ev = run();
  const track = S.toggleTracker();
  const live = ev.filter((e) => e.event === 'sample').map(track).filter(Boolean);
  assert.deepEqual(live, S.analyze(ev).toggles);
  assert.equal(live.length, 2);
});

test('renderer payloads keep counts and page state only - never text', () => {
  assert.deepEqual(S.cleanBeat({ vis: 'visible', raf: 14, dpr: 1.5, focus: true, text: 'secret' }), { vis: 'visible', raf: 14, dpr: 1.5, focus: true });
  assert.equal(S.cleanBeat({ vis: '<b>' }).vis, 'unknown');
  assert.equal(S.cleanInputKind({ kind: 'key', key: 'a', text: 'abc' }), 'key');
  assert.equal(S.cleanInputKind({ kind: 'paste' }), null);
});

test('a log cut off mid-line still reads', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const f = path.join(os.tmpdir(), `ql-run-summary-test-${process.pid}.jsonl`);
  fs.writeFileSync(f, run().map((e) => JSON.stringify(e)).join('\n') + '\n{"t":1,"event":"sam');
  try {
    assert.equal(S.readLog(f).length, run().length);
  } finally { fs.rmSync(f, { force: true }); }
});
