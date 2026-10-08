'use strict';
// Mock library + settings for the theme gallery. Generic app names, flat neutral
// pictogram icons drawn here as SVG, and fake paths that are never launched. The
// same 14 tiles are used for every theme so captures compare like for like.
// Nothing here is read from a real QuickLauncher profile.

const glyph = {
  notepad:  '<rect x="18" y="12" width="28" height="40" rx="2" fill="#fff" fill-opacity=".9"/><path d="M23 22h18M23 29h18M23 36h18M23 43h11" stroke="#5b7fa6" stroke-width="2.5"/>',
  calc:     '<rect x="17" y="10" width="30" height="44" rx="3" fill="#fff" fill-opacity=".9"/><rect x="21" y="14" width="22" height="9" fill="#6b6f76"/><g fill="#6b6f76"><rect x="21" y="27" width="6" height="6"/><rect x="29" y="27" width="6" height="6"/><rect x="37" y="27" width="6" height="6"/><rect x="21" y="35" width="6" height="6"/><rect x="29" y="35" width="6" height="6"/><rect x="37" y="35" width="6" height="6"/><rect x="21" y="43" width="6" height="6"/><rect x="29" y="43" width="14" height="6"/></g>',
  paint:    '<path d="M32 12c-12 0-21 8-21 19 0 8 6 12 11 12 4 0 4 3 4 5 0 3 2 5 6 5 12 0 21-9 21-21S44 12 32 12z" fill="#fff" fill-opacity=".9"/><g><circle cx="22" cy="28" r="3.5" fill="#c0503c"/><circle cx="30" cy="20" r="3.5" fill="#d8b23c"/><circle cx="40" cy="21" r="3.5" fill="#4f8a5b"/><circle cx="46" cy="30" r="3.5" fill="#4d6d9f"/></g>',
  terminal: '<rect x="10" y="14" width="44" height="36" rx="3" fill="#1d2127"/><path d="M17 25l7 6-7 6" stroke="#e6e6e6" stroke-width="3" fill="none"/><path d="M28 39h12" stroke="#e6e6e6" stroke-width="3"/>',
  browser:  '<circle cx="32" cy="32" r="19" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="3"/><ellipse cx="32" cy="32" rx="8" ry="19" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2.5"/><path d="M13 32h38M16 22h32M16 42h32" stroke="#fff" stroke-opacity=".9" stroke-width="2.5"/>',
  files:    '<path d="M11 20h16l4 5h22v23H11z" fill="#fff" fill-opacity=".9"/><path d="M11 26h42" stroke="#c09a3e" stroke-width="2"/>',
  settings: '<circle cx="32" cy="32" r="15" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="7" stroke-dasharray="6 5.8"/><circle cx="32" cy="32" r="10" fill="#fff" fill-opacity=".9"/><circle cx="32" cy="32" r="4.5" fill="#707a86"/>',
  music:    '<path d="M27 15l18-4v28" stroke="#fff" stroke-opacity=".9" stroke-width="3.5" fill="none"/><path d="M27 15v30" stroke="#fff" stroke-opacity=".9" stroke-width="3.5"/><ellipse cx="22" cy="45" rx="6" ry="4.5" fill="#fff" fill-opacity=".9"/><ellipse cx="40" cy="40" rx="6" ry="4.5" fill="#fff" fill-opacity=".9"/>',
  photos:   '<rect x="11" y="15" width="42" height="34" rx="3" fill="#fff" fill-opacity=".9"/><path d="M14 46l11-14 8 9 6-6 11 11z" fill="#5a8f5a"/><circle cx="42" cy="24" r="4" fill="#d8b23c"/>',
  mail:     '<rect x="11" y="18" width="42" height="28" rx="2" fill="#fff" fill-opacity=".9"/><path d="M12 20l20 15 20-15" stroke="#a85d5d" stroke-width="2.5" fill="none"/>',
  calendar: '<rect x="12" y="15" width="40" height="36" rx="3" fill="#fff" fill-opacity=".9"/><rect x="12" y="15" width="40" height="9" fill="#7a5530"/><g fill="#9a6f3e"><rect x="17" y="29" width="6" height="5"/><rect x="26" y="29" width="6" height="5"/><rect x="35" y="29" width="6" height="5"/><rect x="17" y="38" width="6" height="5"/><rect x="26" y="38" width="6" height="5"/></g>',
  clock:    '<circle cx="32" cy="32" r="19" fill="#fff" fill-opacity=".9"/><path d="M32 19v13l9 6" stroke="#4d6d8f" stroke-width="3" fill="none"/>',
  sheet:    '<rect x="12" y="14" width="40" height="36" rx="2" fill="#fff" fill-opacity=".9"/><path d="M12 23h40M12 32h40M12 41h40M24 14v36M38 14v36" stroke="#4f7f5f" stroke-width="2"/>',
  archive:  '<rect x="12" y="17" width="40" height="9" rx="1" fill="#fff" fill-opacity=".9"/><rect x="15" y="27" width="34" height="22" fill="#fff" fill-opacity=".8"/><path d="M27 33h10" stroke="#7d6a58" stroke-width="3"/>',
};

const TILES = [
  ['notepad', 'Notepad', '#5b7fa6'],
  ['calc', 'Calculator', '#6b6f76'],
  ['paint', 'Paint', '#b07a4f'],
  ['terminal', 'Terminal', '#3d4450'],
  ['browser', 'Browser', '#4f8a8b'],
  ['files', 'Files', '#c09a3e'],
  ['settings', 'Settings', '#707a86'],
  ['music', 'Music', '#8a5a9e'],
  ['photos', 'Photos', '#5a8f5a'],
  ['mail', 'Mail', '#a85d5d'],
  ['calendar', 'Calendar', '#9a6f3e'],
  ['clock', 'Clock', '#4d6d8f'],
  ['sheet', 'Spreadsheet Editor', '#4f7f5f'], // long name: shows the label ellipsis
  ['archive', 'Archive', '#7d6a58'],
];

function iconDataUrl(key, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="13" fill="${bg}"/>${glyph[key]}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

/** A fresh copy each call, so a renderer-side mutation can never leak into the next theme. */
function apps() {
  return TILES.map(([key, name, bg], i) => ({
    id: `gallery-${String(i + 1).padStart(2, '0')}-${key}`,
    name,
    path: `C:\\QLGallery\\mock\\${key}.exe`, // never launched: the launch-app stub is a counted no-op
    iconDataUrl: iconDataUrl(key, bg),
  }));
}

/** Store defaults (src/main/store.js _defaults) with the theme under test. */
function settings(theme) {
  return {
    iconSize: 64,
    startWithWindows: true,
    randomTheme: true,
    theme,
    windowPosition: null,
    globalHotkey: 'Ctrl+Space',
    reducedMotion: false,
  };
}

module.exports = { apps, settings, TILE_COUNT: TILES.length, HOVER_TILE_INDEX: 1 };

// Complete Manager state for current regions snapshots; one harmless mock Grid.
module.exports.managerState = (theme) => ({
  theme, sharedTheme: theme, matchAll: false, cap: 8,
  regions: [{ id: 'gallery', name: 'Gallery', layout: 'grid', theme, icon: 'games', count: TILES.length, primary: true }],
  strings: { lastRegion: 'Keep one region', cap: 'Eight regions' },
  layouts: ['grid', 'column', 'row'],
  moved: { orphans: [], available: true, count: 0, countText: '0 moved shortcuts',
    tips: { noneToMoveBack: 'None to move back', moveAllBack: 'Move all back' }, items: [] },
});
