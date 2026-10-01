'use strict';
// Pure layout finder for the desktop layer (from the 2026-09-30 spike). No native calls here, so it
// can be unit-tested in plain Node against synthetic window trees.
//
// Input: a snapshot from desktop-layer.readDesktopTree():
//   { progman, progmanChildren: [{hwnd, cls}], workerWs: [{hwnd, children: [{hwnd, cls}]}] }
//   Children lists are in z-order, topmost first.
//
// Rule: a region must sit IN FRONT of the desktop icons and UNDER normal
// windows, so it is parented to whatever window currently hosts
// SHELLDLL_DefView (the icon view). That host is:
//   - Progman itself   -> "raised" (Win11 24H2+: a wallpaper WorkerW is a
//                         sibling below DefView) or "unsplit" (no WorkerW)
//   - a top-level WorkerW on Progman's thread -> "classic-split" (Win10 /
//                         pre-24H2 after a wallpaper app sent 0x052C)
// Anything else is "unknown" and the caller must fall back, never guess.

const DEFVIEW = 'SHELLDLL_DefView';

function pickHost(tree) {
  if (!tree || !tree.progman) {
    return { ok: false, layout: 'no-progman', reason: 'Progman not found (Explorer not running or restarting)' };
  }
  const kids = tree.progmanChildren || [];
  const defInProgman = kids.find((c) => c.cls === DEFVIEW);
  if (defInProgman) {
    const hasWorkerW = kids.some((c) => c.cls === 'WorkerW');
    return {
      ok: true,
      host: tree.progman,
      defView: defInProgman.hwnd,
      layout: hasWorkerW ? 'raised' : 'unsplit',
    };
  }
  const workers = tree.workerWs || [];
  const hosts = workers.filter((w) => (w.children || []).some((c) => c.cls === DEFVIEW));
  if (hosts.length === 1) {
    const w = hosts[0];
    return {
      ok: true,
      host: w.hwnd,
      defView: w.children.find((c) => c.cls === DEFVIEW).hwnd,
      layout: 'classic-split',
    };
  }
  if (hosts.length > 1) {
    return { ok: false, layout: 'unknown', reason: `${hosts.length} WorkerW windows host a DefView` };
  }
  return { ok: false, layout: 'unknown', reason: 'no SHELLDLL_DefView under Progman or any Explorer WorkerW' };
}

module.exports = { pickHost, DEFVIEW };
