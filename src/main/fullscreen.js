// Fullscreen state for the main window.
//
// The state is kept here instead of being read from win.isFullScreen(): the
// main window is frameless and transparent, and on Windows such a window has
// no native fullscreen state. Electron's setFullScreen(true) only resizes it
// to the display, and isFullScreen() stays false (measured on Electron 32:
// enter-full-screen fires, the bounds become the display, isFullScreen() is
// false). Code that asked isFullScreen() could therefore never leave
// fullscreen, and the resize handler saved the display size as windowSize
// (QA 2026-10-05, F-1).
//
// The map holds, per window, the bounds it had before entering fullscreen;
// a window is in fullscreen while it has an entry.
const priorBounds = new WeakMap();

function isFullscreen(win) {
  return priorBounds.has(win) || win.isFullScreen();
}

function enterFullscreen(win) {
  if (isFullscreen(win)) return true;
  // Recorded before setFullScreen: the resize it causes must already see the
  // window as fullscreen, so window.js does not save the display size.
  priorBounds.set(win, win.getBounds());
  win.setFullScreen(true);
  return true;
}

function exitFullscreen(win) {
  if (!isFullscreen(win)) return false;
  const prior = priorBounds.get(win);
  win.setFullScreen(false);
  if (prior) win.setBounds(prior);
  // Cleared only after the bounds are back, so no size or position seen on
  // the way out is saved.
  priorBounds.delete(win);
  win.webContents.send('fullscreen-changed', false);
  return false;
}

// Returns the new state: true = fullscreen.
function toggleFullscreen(win) {
  return isFullscreen(win) ? exitFullscreen(win) : enterFullscreen(win);
}

module.exports = { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
