// The size and position the window opens with (src/main/window.js).
// Sergei ruling 2026-10-05, option (b): a saved windowSize larger than the work
// area of the display the window opens on opens as a fresh install does, the
// default 424x300 at the default position. F11 fullscreen used to save the
// display size (F-1), and such files still exist. A malformed saved size or
// position counts as nothing saved (QA 2026-10-05, m-3).
// Run: node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
const { setDisplays, open } = require('./stub-electron');

// Sergei's display: 5120x1440, taskbar 48 px at the bottom.
const WIDE = { bounds: { x: 0, y: 0, width: 5120, height: 1440 }, workArea: { x: 0, y: 0, width: 5120, height: 1392 } };
// Fresh-install window on WIDE: 424x300, bottom-right of the work area, 20 px in.
const FRESH = { x: 5120 - 424 - 20, y: 1392 - 300 - 20, width: 424, height: 300 };

function opened(win) {
  const { x, y, width, height } = win.opts;
  return { x, y, width, height };
}

// 1. Oversized -> the fresh-install window.
for (const [name, settings] of [
  ['display-sized, saved at 0,0', { windowSize: { width: 5120, height: 1440 }, windowPosition: { x: 0, y: 0 } }],
  ['display-sized, no saved position', { windowSize: { width: 5120, height: 1440 } }],
  ['display-sized, saved at 3000,900', { windowSize: { width: 5120, height: 1440 }, windowPosition: { x: 3000, y: 900 } }],
  ['display-sized, saved off every display', { windowSize: { width: 5120, height: 1440 }, windowPosition: { x: -3000, y: -200 } }],
  ['too wide only', { windowSize: { width: 6000, height: 300 }, windowPosition: { x: 100, y: 500 } }],
  ['too tall only (1 px over the work area)', { windowSize: { width: 424, height: 1393 }, windowPosition: { x: 100, y: 0 } }],
]) {
  test(`oversized (${name}): opens as a fresh install, 424x300 at the default position`, () => {
    setDisplays([WIDE]);
    const { win, store } = open(settings);
    assert.deepEqual(opened(win), FRESH);
    assert.deepEqual(store.writes, [], 'the data file is not rewritten at startup');
  });
}

test('oversized for the display it opens on (second display): the fresh-install window on the primary', () => {
  setDisplays([
    { bounds: { x: 0, y: 0, width: 2560, height: 1440 }, workArea: { x: 0, y: 0, width: 2560, height: 1392 } },
    { bounds: { x: 2560, y: 0, width: 1920, height: 1080 }, workArea: { x: 2560, y: 0, width: 1920, height: 1040 } },
  ]);
  const { win } = open({ windowSize: { width: 2000, height: 1200 }, windowPosition: { x: 2600, y: 100 } });
  assert.deepEqual(opened(win), { x: 2560 - 424 - 20, y: 1392 - 300 - 20, width: 424, height: 300 });
});

// 2. Malformed or non-positive size -> as if no size were saved.
for (const [name, windowSize] of [
  ['{null,null}', { width: null, height: null }],
  ['{"abc",300}', { width: 'abc', height: 300 }],
  ['{"500","300"} (numeric strings)', { width: '500', height: '300' }],
  ['{500} (no height)', { width: 500 }],
  ['{} (no keys)', {}],
  ['{0,0}', { width: 0, height: 0 }],
  ['{-5,300}', { width: -5, height: 300 }],
  ['{500.5,300.7} (fractions)', { width: 500.5, height: 300.7 }],
  ['{Infinity,300} (1e400 in the file)', JSON.parse('{"width":1e400,"height":300}')],
  ['[500,300] (array)', [500, 300]],
  ['5 (number)', 5],
  ['"abc" (string)', 'abc'],
]) {
  test(`malformed size ${name}: the default 424x300 at the default position`, () => {
    setDisplays([WIDE]);
    const { win, store } = open({ windowSize });
    assert.deepEqual(opened(win), FRESH);
    assert.deepEqual(store.writes, []);
  });
}

test('malformed size with a valid saved position: default size, saved position kept (as for no saved size)', () => {
  setDisplays([WIDE]);
  const { win } = open({ windowSize: { width: null, height: null }, windowPosition: { x: 100, y: 100 } });
  assert.deepEqual(opened(win), { x: 100, y: 100, width: 424, height: 300 });
});

for (const [name, windowPosition] of [
  ['{null,null} (threw at startup on b67b82f)', { x: null, y: null }],
  ['{"a",5}', { x: 'a', y: 5 }],
  ['{} (no keys)', {}],
  ['{1.5,2} (fraction)', { x: 1.5, y: 2 }],
  ['5 (number)', 5],
]) {
  test(`malformed position ${name}: no throw, saved size at the default position`, () => {
    setDisplays([WIDE]);
    let win;
    assert.doesNotThrow(() => { ({ win } = open({ windowSize: { width: 500, height: 320 }, windowPosition })); });
    assert.deepEqual(opened(win), { x: 5120 - 500 - 20, y: 1392 - 320 - 20, width: 500, height: 320 });
  });
}

// Unchanged behaviour: these pass before and after.
test('a window that fits keeps its saved size and position', () => {
  setDisplays([WIDE]);
  const { win } = open({ windowSize: { width: 424, height: 300 }, windowPosition: { x: 200, y: 200 } });
  assert.deepEqual(opened(win), { x: 200, y: 200, width: 424, height: 300 });
});

test('a window exactly the size of the work area (a remembered maximise) is kept', () => {
  setDisplays([WIDE]);
  const { win } = open({ windowSize: { width: 5120, height: 1392 }, windowPosition: { x: 0, y: 0 } });
  assert.deepEqual(opened(win), { x: 0, y: 0, width: 5120, height: 1392 });
});

test('a window that fits but is partly off-screen is left where it was saved', () => {
  setDisplays([WIDE]);
  const { win } = open({ windowSize: { width: 424, height: 300 }, windowPosition: { x: -200, y: 1200 } });
  assert.deepEqual(opened(win), { x: -200, y: 1200, width: 424, height: 300 });
});

test('a saved position off every display: the saved size at the default position', () => {
  setDisplays([WIDE]);
  const { win } = open({ windowSize: { width: 600, height: 400 }, windowPosition: { x: -20000, y: -20000 } });
  assert.deepEqual(opened(win), { x: 5120 - 600 - 20, y: 1392 - 400 - 20, width: 600, height: 400 });
});

test('a tiny valid size is passed through (Electron raises it to the 180x150 minimum)', () => {
  setDisplays([WIDE]);
  // 10x10 can never overlap a display by 100x50, so the saved position is not used.
  const { win } = open({ windowSize: { width: 10, height: 10 }, windowPosition: { x: 100, y: 100 } });
  assert.deepEqual(opened(win), { x: 5120 - 10 - 20, y: 1392 - 10 - 20, width: 10, height: 10 });
});

test('no saved size or position: default size at the bottom-right of the primary work area', () => {
  setDisplays([WIDE]);
  const { win } = open({});
  assert.deepEqual(opened(win), FRESH);
});
