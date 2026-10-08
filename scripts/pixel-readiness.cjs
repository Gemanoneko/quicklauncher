'use strict';
// QA-only. The original F-2 painted-window predicate stays exact; waiting must
// never turn a blank page into a pass. No Electron, Win32 or product imports.
const { performance } = require('node:perf_hooks');
function paintedFrame({ printed, lines, height, colours, litShare }) {
  return !!printed && lines === height && colours >= 16 && litShare >= 0.1;
}
async function waitForPaintedFrame(capture, { timeoutMs = 3000, intervalMs = 50,
  now = () => performance.now(), wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  if (!(timeoutMs > 0) || !(intervalMs > 0)) throw new Error('positive timeout and interval required');
  const start = now();
  let last = { ok: false, why: 'no frame' }, attempts = 0;
  const limit = Math.ceil(timeoutMs / intervalMs) + 1;
  for (; attempts < limit;) {
    attempts++;
    try { last = await capture(); } catch (error) { last = { ok: false, why: String(error.message || error) }; }
    const elapsedMs = Math.max(0, now() - start);
    if (last.ok && elapsedMs <= timeoutMs) return { ...last, attempts, elapsedMs, timedOut: false };
    if (elapsedMs >= timeoutMs) break;
    await wait(Math.min(intervalMs, timeoutMs - elapsedMs));
  }
  return { ...last, ok: false, attempts, elapsedMs: Math.max(0, now() - start), timedOut: true,
    why: 'first painted frame timed out after ' + timeoutMs + ' ms' + (last.why ? ': ' + last.why : '') };
}
module.exports = { paintedFrame, waitForPaintedFrame };
