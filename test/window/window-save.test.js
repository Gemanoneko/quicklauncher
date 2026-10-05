// window.js saves the window's position and size after a move or resize, and
// F11 does nothing (fullscreen removed, Sergei 2026-10-05).
// Run: node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
const { setDisplays, open } = require('./stub-electron');

const DISPLAY = { x: 0, y: 0, width: 5120, height: 1440 };
setDisplays([{ bounds: DISPLAY, workArea: { ...DISPLAY, height: 1392 } }]);
const SAVED = { windowSize: { width: 424, height: 300 }, windowPosition: { x: 200, y: 200 } };

test('a resize and a move are saved after the debounce', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { store, win } = open(SAVED);
  win.setBounds({ x: 250, y: 240, width: 500, height: 320 });
  t.mock.timers.tick(1000);
  assert.deepEqual(store.settings().windowSize, { width: 500, height: 320 });
  assert.deepEqual(store.settings().windowPosition, { x: 250, y: 240 });
});

test('a pending save on a destroyed window does not throw', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { store, win } = open(SAVED);
  win.setBounds({ x: 200, y: 200, width: 500, height: 300 });
  win.destroyed = true;
  assert.doesNotThrow(() => t.mock.timers.tick(1000));
  assert.deepEqual(store.writes, []);
});

test('F11 is swallowed before the page and the default menu see it; other keys are not', () => {
  const { win } = open(SAVED);
  const press = (key) => {
    let prevented = false;
    win.webContents.emit('before-input-event', { preventDefault: () => { prevented = true; } }, { type: 'keyDown', key });
    return prevented;
  };
  assert.equal(press('F11'), true);
  for (const key of ['Escape', 'F5', 'F12', 'Enter', 'a', '?']) assert.equal(press(key), false, key);
});
