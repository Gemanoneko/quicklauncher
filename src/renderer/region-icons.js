/* Region glyphs (regions spec 1, Q7: built-in glyphs). 20 x 20 line drawings
   in currentColor, so they take --accent-text from the theme. Shared by the
   region page and the Manager. Placeholder drawings for M1: Judy reviews them. */
(function () {
  const svg = (body) => `<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const ICONS = {
    apps: ['Apps', '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/>'],
    games: ['Games', '<path d="M6 6h8a4 4 0 0 1 4 4v1.5a2.5 2.5 0 0 1-4.5 1.5L12 11H8l-1.5 2A2.5 2.5 0 0 1 2 11.5V10a4 4 0 0 1 4-4z"/><path d="M6 8.5v3M4.5 10h3"/><circle cx="13.5" cy="9" r=".6"/><circle cx="15" cy="10.8" r=".6"/>'],
    tools: ['Tools', '<path d="M12.5 3.5a3.5 3.5 0 0 0-3.2 4.9L3.5 14.2a1.4 1.4 0 0 0 2 2l5.8-5.8a3.5 3.5 0 0 0 4.9-3.2l-2.2 2.2-2-.5-.5-2z"/>'],
    web: ['Web', '<circle cx="10" cy="10" r="7"/><path d="M3 10h14"/><path d="M10 3c2.2 2 3.2 4.4 3.2 7s-1 5-3.2 7c-2.2-2-3.2-4.4-3.2-7s1-5 3.2-7z"/>'],
    media: ['Media', '<rect x="2.5" y="4" width="15" height="12" rx="2"/><path d="M8.5 7.5v5l4.2-2.5z"/>'],
    music: ['Music', '<path d="M8 14.5V4.5l8-1.5v10"/><circle cx="6" cy="14.5" r="2"/><circle cx="14" cy="13" r="2"/>'],
    photos: ['Photos', '<rect x="2.5" y="4" width="15" height="12" rx="2"/><path d="M3.5 14l4-4 3 3 2-2 4 3.5"/><circle cx="13.5" cy="7.8" r="1.3"/>'],
    files: ['Files', '<path d="M5 2.5h6l4 4v11H5z"/><path d="M11 2.5v4h4"/>'],
    work: ['Work', '<rect x="2.5" y="6" width="15" height="11" rx="1.5"/><path d="M7 6V4h6v2"/><path d="M2.5 11h15"/>'],
    code: ['Code', '<path d="M7 6l-4 4 4 4"/><path d="M13 6l4 4-4 4"/><path d="M11 4l-2 12"/>'],
    chat: ['Chat', '<path d="M3 4h14v9H8.5L5 16v-3H3z"/>'],
    mail: ['Mail', '<rect x="2.5" y="5" width="15" height="10" rx="1.5"/><path d="M3 5.5l7 5.5 7-5.5"/>'],
    star: ['Star', '<path d="M10 2.8l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 8.1l5-.7z"/>'],
    home: ['Home', '<path d="M3 9.5L10 3.5l7 6"/><path d="M5 8v8.5h10V8"/><path d="M8.5 16.5v-4.5h3v4.5"/>'],
    terminal: ['Terminal', '<rect x="2.5" y="3.5" width="15" height="13" rx="1.5"/><path d="M5.5 8l3 2-3 2"/><path d="M10 13h4.5"/>'],
    folder: ['Folder', '<path d="M2.5 5h5.5l2 2h7.5v9h-15z"/>'],
  };
  window.QL_REGION_ICONS = Object.fromEntries(Object.entries(ICONS).map(([k, [name, body]]) => [k, { name, svg: svg(body) }]));
})();
