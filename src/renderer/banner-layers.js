/* The banner slot's two layers (regions UX spec, fix-pass addendum C5). Pure:
   no DOM, so plain Node unit-tests it (test/regions/banner-layers.test.js).
   In the page it is window.QL_BANNER; app.js draws what it says.

   The update layer holds the updater's message (checking, available with
   DOWNLOAD, downloading n%, ready with INSTALL NOW, up to date, error). The
   notice layer holds every other message (a drop's notice, a launch error,
   SAVE ERROR) for 8 s, with its own ✕. One layer is drawn at a time: a notice
   takes the slot and the update message is kept behind it, changed by any
   update event meanwhile, and drawn again as it is then when the notice ends.
   A timed update message starts its timer when it is drawn. Only the update
   layer's own ✕ (or its own timer, as before) calls dismissUpdate, which
   clears the tray's update dot; a notice ending never does. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.QL_BANNER = api;
}(typeof self !== 'undefined' ? self : this, () => {
  'use strict';

  const NOTICE_MS = 8000;

  /**
   * draw(view): paint the slot; view is null (hide it) or
   *   { layer: 'update' | 'notice', text, actions: [{ label, action, disabled }] }.
   * dismissUpdate(): the tray dot goes (the update layer's ✕ and timer only).
   */
  function createBanner({ draw, dismissUpdate = () => {}, setTimer = setTimeout, clearTimer = clearTimeout, noticeMs = NOTICE_MS } = {}) {
    let update = null; // { text, actions, autoMs }
    let notice = null; // { text }
    let updateTimer = null;
    let noticeTimer = null;

    const stopUpdateTimer = () => { if (updateTimer !== null) clearTimer(updateTimer); updateTimer = null; };
    const stopNoticeTimer = () => { if (noticeTimer !== null) clearTimer(noticeTimer); noticeTimer = null; };
    const copyActions = () => (update ? update.actions.map((a) => ({ ...a })) : []);

    function render() {
      if (notice) { draw({ layer: 'notice', text: notice.text, actions: [] }); return; }
      if (update) {
        draw({ layer: 'update', text: update.text, actions: copyActions() });
        if (update.autoMs > 0 && updateTimer === null) updateTimer = setTimer(closeUpdate, update.autoMs);
        return;
      }
      draw(null);
    }

    /** A new update message replaces the last one (drawn now unless a notice holds the slot). */
    function setUpdate(text, actions = [], autoMs = 0) {
      stopUpdateTimer();
      update = {
        text: String(text),
        actions: (actions || []).map((a) => ({ label: String(a.label), action: String(a.action), disabled: !!a.disabled })),
        autoMs: Number(autoMs) > 0 ? Number(autoMs) : 0,
      };
      render();
    }

    /** Download progress: the update message's text, kept behind a notice. */
    function updateProgress(pct) {
      if (!update) return;
      update.text = `DOWNLOADING... ${pct}%`;
      if (!notice) render();
    }

    /** A button of the update message changed (DOWNLOAD becomes DOWNLOADING..., disabled). */
    function markAction(action, patch) {
      if (!update) return;
      const a = update.actions.find((x) => x.action === action);
      if (!a) return;
      if (patch && typeof patch.label === 'string') a.label = patch.label;
      if (patch && 'disabled' in patch) a.disabled = !!patch.disabled;
      if (!notice) render();
    }

    /** A notice takes the slot for noticeMs; another notice replaces it and restarts the time. */
    function showNotice(text) {
      stopNoticeTimer();
      stopUpdateTimer(); // a covered update message's timer starts again when it is drawn
      notice = { text: String(text) };
      noticeTimer = setTimer(endNotice, noticeMs);
      render();
    }

    /** The notice's time is up, or its ✕: the update message (if any) comes back. Never dismissUpdate. */
    function endNotice() {
      stopNoticeTimer();
      if (!notice) return;
      notice = null;
      render();
    }

    /** The update message's ✕ (or its own timer): it goes, and so does the tray dot. */
    function closeUpdate() {
      stopUpdateTimer();
      if (!update) return;
      update = null;
      if (!notice) render();
      dismissUpdate();
    }

    /** The drawn layer's ✕. */
    function close(layer) {
      if (layer === 'notice') endNotice();
      else if (layer === 'update' && !notice) closeUpdate();
    }

    function state() {
      return {
        drawn: notice ? 'notice' : update ? 'update' : null,
        notice: notice ? { ...notice } : null,
        update: update ? { text: update.text, actions: copyActions(), autoMs: update.autoMs } : null,
        updateTimer: updateTimer !== null,
        noticeTimer: noticeTimer !== null,
      };
    }

    function destroy() { stopUpdateTimer(); stopNoticeTimer(); }

    return { setUpdate, updateProgress, markAction, showNotice, endNotice, closeUpdate, close, state, destroy };
  }

  return { createBanner, NOTICE_MS };
}));
