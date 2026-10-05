// A stand-in for the main BrowserWindow as Electron 32 on Windows behaves for
// a frameless transparent window (measured 2026-10-05): setFullScreen(true)
// emits 'enter-full-screen', resizes the window to the display and fires
// 'resize', but isFullScreen() stays false; setFullScreen(false) emits
// 'leave-full-screen' and puts back the bounds Electron recorded.
const { EventEmitter } = require('events');

const DISPLAY = { x: 0, y: 0, width: 5120, height: 1440 };

class FakeWindow extends EventEmitter {
  constructor(bounds = { x: 200, y: 200, width: 424, height: 300 }) {
    super();
    this.bounds = { ...bounds };
    this.sent = [];
    this.destroyed = false;
    this._electronRestore = null;
    this.webContents = { send: (channel, ...args) => this.sent.push([channel, ...args]) };
  }
  isFullScreen() {
    if (this.destroyed) throw new Error('Object has been destroyed');
    return false;
  }
  isDestroyed() { return this.destroyed; }
  getBounds() { return { ...this.bounds }; }
  getSize() { return [this.bounds.width, this.bounds.height]; }
  getPosition() { return [this.bounds.x, this.bounds.y]; }
  setBounds(b) {
    const moved = b.x !== this.bounds.x || b.y !== this.bounds.y;
    const resized = b.width !== this.bounds.width || b.height !== this.bounds.height;
    this.bounds = { ...b };
    if (resized) this.emit('resize');
    if (moved) this.emit('moved');
  }
  setFullScreen(on) {
    if (on) {
      this._electronRestore = this.getBounds();
      this.emit('enter-full-screen');
      this.setBounds(DISPLAY);
    } else {
      this.emit('leave-full-screen');
      if (this._electronRestore) this.setBounds(this._electronRestore);
    }
  }
}

module.exports = { FakeWindow, DISPLAY };
