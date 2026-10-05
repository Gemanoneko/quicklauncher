// F-1 (QA 2026-10-05): F11 fullscreen could not be exited, and the display
// size was saved as windowSize. Run: node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
const { FakeWindow, DISPLAY } = require('./fake-window');
const fs = require('../../src/main/fullscreen');

const PRIOR = { x: 200, y: 200, width: 424, height: 300 };

test('enter: window takes the display and counts as fullscreen though isFullScreen() is false', () => {
  const win = new FakeWindow(PRIOR);
  assert.equal(fs.toggleFullscreen(win), true);
  assert.deepEqual(win.getBounds(), DISPLAY);
  assert.equal(win.isFullScreen(), false); // the Windows behaviour behind F-1
  assert.equal(fs.isFullscreen(win), true);
});

test('F11 twice: back to the prior bounds, renderer told fullscreen is off', () => {
  const win = new FakeWindow(PRIOR);
  fs.toggleFullscreen(win);
  assert.equal(fs.toggleFullscreen(win), false);
  assert.deepEqual(win.getBounds(), PRIOR);
  assert.equal(fs.isFullscreen(win), false);
  assert.deepEqual(win.sent, [['fullscreen-changed', false]]);
});

test('Esc (exit-fullscreen) leaves fullscreen to the prior bounds', () => {
  const win = new FakeWindow(PRIOR);
  fs.enterFullscreen(win);
  assert.equal(fs.exitFullscreen(win), false);
  assert.deepEqual(win.getBounds(), PRIOR);
  assert.equal(fs.isFullscreen(win), false);
});

test('Esc when not fullscreen does nothing and reports false', () => {
  const win = new FakeWindow(PRIOR);
  let events = 0;
  win.on('resize', () => events++);
  win.on('moved', () => events++);
  assert.equal(fs.exitFullscreen(win), false);
  assert.deepEqual(win.getBounds(), PRIOR);
  assert.equal(events, 0);
  assert.deepEqual(win.sent, []);
});

test('a second enter while fullscreen keeps the first prior bounds', () => {
  const win = new FakeWindow(PRIOR);
  fs.enterFullscreen(win);
  assert.equal(fs.enterFullscreen(win), true);
  fs.exitFullscreen(win);
  assert.deepEqual(win.getBounds(), PRIOR);
});

test('the resize caused by entering already sees the window as fullscreen', () => {
  const win = new FakeWindow(PRIOR);
  const seen = [];
  win.on('resize', () => seen.push(fs.isFullscreen(win)));
  fs.enterFullscreen(win);
  fs.exitFullscreen(win);
  assert.ok(seen.length >= 2);
  assert.ok(seen.every(v => v === true), `resize saw ${JSON.stringify(seen)}`);
});

test('state is per window', () => {
  const a = new FakeWindow(PRIOR);
  const b = new FakeWindow(PRIOR);
  fs.enterFullscreen(a);
  assert.equal(fs.isFullscreen(b), false);
  fs.exitFullscreen(a);
});
