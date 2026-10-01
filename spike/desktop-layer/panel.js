'use strict';
if (new URLSearchParams(location.search).get('view') === 'steps') document.body.classList.add('steps-view');

const btn = document.getElementById('btn');
const status = document.getElementById('status');
const input = document.getElementById('type');
let clicks = 0;

btn.addEventListener('click', (e) => {
  clicks++;
  btn.textContent = `Click me (${clicks})`;
  window.spike.send('clicked', { clicks, x: e.clientX, y: e.clientY });
});
document.getElementById('close').addEventListener('click', () => window.spike.send('close'));
document.addEventListener('pointerdown', () => {
  window.spike.send('pointerdown');
  window.spike.send('input', { kind: 'pointer' });
});
// Keystrokes are counted, never read: no key, no code and no text leave the page.
document.addEventListener('keydown', () => window.spike.send('input', { kind: 'key' }), true);
input.addEventListener('focus', () => window.spike.send('input-focus'));

window.spike.onStatus((text) => { status.textContent = text; });

function reportLayout() {
  const r = btn.getBoundingClientRect();
  window.spike.send('layout', { btn: { x: r.left, y: r.top, w: r.width, h: r.height }, dpr: window.devicePixelRatio });
}
window.addEventListener('load', reportLayout);

// Heartbeat for the run log: does Chromium think the page is visible, and is
// it painting? rAF ticks are counted over a short window, then it idles.
function rafTicks(ms) {
  return new Promise((resolve) => {
    let n = 0;
    let done = false;
    const t0 = performance.now();
    const finish = () => { if (!done) { done = true; resolve(n); } };
    const step = (t) => { n++; if (t - t0 < ms) requestAnimationFrame(step); else finish(); };
    requestAnimationFrame(step);
    setTimeout(finish, ms + 300); // hidden pages get no rAF at all
  });
}
async function beat() {
  const raf = await rafTicks(250);
  window.spike.send('beat', { vis: document.visibilityState, raf, dpr: window.devicePixelRatio, focus: document.hasFocus() });
}
setInterval(beat, 1000);
document.addEventListener('visibilitychange', beat);
