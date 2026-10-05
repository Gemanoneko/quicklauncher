// At startup a saved windowSize larger than the work area of the display the
// window opens on is clamped to that work area (Sergei 2026-10-05). F11
// fullscreen used to save the display size (F-1), and such files still exist.
// Run: node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
const { setDisplays, open } = require('./stub-electron');

// Sergei's display: 5120x1440, taskbar 48 px at the bottom.
const WIDE = { bounds: { x: 0, y: 0, width: 5120, height: 1440 }, workArea: { x: 0, y: 0, width: 5120, height: 1392 } };

function opened(win) {
  const { x, y, width, height } = win.opts;
  return { x, y, width, height };
}

test('a display-sized saved window opens inside the work area (taskbar respected)', () => {
  setDisplays([WIDE]);
  const { win, store } = open({ windowSize: { width: 5120, height: 1440 }, windowPosition: { x: 0, y: 0 } });
  assert.deepEqual(opened(win), { x: 0, y: 0, width: 5120, height: 1392 });
  assert.deepEqual(store.writes, [], 'the data file is not rewritten at startup');
});

test('taskbar at the top: the clamped window starts below it', () => {
  setDisplays([{ bounds: WIDE.bounds, workArea: { x: 0, y: 48, width: 5120, height: 1392 } }]);
  const { win } = open({ windowSize: { width: 5120, height: 1440 }, windowPosition: { x: 0, y: 0 } });
  assert.deepEqual(opened(win), { x: 0, y: 48, width: 5120, height: 1392 });
});

test('too large with no saved position: clamped on the primary display', () => {
  setDisplays([WIDE]);
  const { win } = open({ windowSize: { width: 6000, height: 2000 } });
  assert.deepEqual(opened(win), { x: 0, y: 0, width: 5120, height: 1392 });
});

test('only the axis that is too large is cut, and the position moves only as far as needed', () => {
  setDisplays([WIDE]);
  const { win } = open({ windowSize: { width: 6000, height: 300 }, windowPosition: { x: 100, y: 500 } });
  assert.deepEqual(opened(win), { x: 0, y: 500, width: 5120, height: 300 });
});

test('second display: clamped to the work area of the display the window opens on', () => {
  setDisplays([
    { bounds: { x: 0, y: 0, width: 2560, height: 1440 }, workArea: { x: 0, y: 0, width: 2560, height: 1392 } },
    { bounds: { x: 2560, y: 0, width: 1920, height: 1080 }, workArea: { x: 2560, y: 0, width: 1920, height: 1040 } },
  ]);
  const { win } = open({ windowSize: { width: 2560, height: 1440 }, windowPosition: { x: 2600, y: 100 } });
  assert.deepEqual(opened(win), { x: 2560, y: 0, width: 1920, height: 1040 });
});

// Unchanged behaviour: these pass before and after the clamp.
test('a window that fits keeps its saved size and position', () => {
  setDisplays([WIDE]);
  const { win } = open({ windowSize: { width: 424, height: 300 }, windowPosition: { x: 200, y: 200 } });
  assert.deepEqual(opened(win), { x: 200, y: 200, width: 424, height: 300 });
});

test('a window that fits but is partly off-screen is left where it was saved', () => {
  setDisplays([WIDE]);
  const { win } = open({ windowSize: { width: 424, height: 300 }, windowPosition: { x: -200, y: 1200 } });
  assert.deepEqual(opened(win), { x: -200, y: 1200, width: 424, height: 300 });
});

test('no saved size or position: default size at the bottom-right of the primary work area', () => {
  setDisplays([WIDE]);
  const { win } = open({});
  assert.deepEqual(opened(win), { x: 5120 - 424 - 20, y: 1392 - 300 - 20, width: 424, height: 300 });
});
