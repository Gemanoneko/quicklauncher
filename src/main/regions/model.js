'use strict';
// Region data model: shape, validation, migration from the single-grid store,
// and the flat-list helpers. Pure: no Electron, no fs, so it is unit-tested in
// plain Node (test/regions/model.test.js).
//
// Store shape (see Docs/QuickLaunch_Regions_TechPlan_2026-10-01.md § 2):
//   apps[]    flat, as before, each item gains `regionId`. Display order of a
//             region = the order of its items in apps[].
//   regions[] creation order; regions[0] is the primary region.
//   settings  gains matchAll, sharedTheme, managerBounds.

const LAYOUTS = ['grid', 'column', 'row', 'fan', 'ring'];
// Layouts this build can draw. The rest arrive in later milestones.
const BUILT_LAYOUTS = new Set(['grid']);

const ICONS = [
  'apps', 'games', 'tools', 'web', 'media', 'music', 'photos', 'files',
  'work', 'code', 'chat', 'mail', 'star', 'home', 'terminal', 'folder',
];

const REGION_CAP = 8;
const NAME_MAX = 24;
const MIGRATED_NAME = 'QUICK.LAUNCH';
const REGIONS_VERSION = 1;

const GRID = Object.freeze({
  defaultWidth: 424, defaultHeight: 300,
  minWidth: 180, minHeight: 150,
  rim: 6, // invisible resize rim around the panel (spec 4.3)
});

const STRINGS = Object.freeze({
  nameEmpty: 'Enter a name.',
  nameUsed: 'That name is used.',
  cap: `${REGION_CAP} regions is the limit.`,
  noRoom: 'No room for a new region. Move or delete one.',
  lastRegion: 'At least one region is required.',
});

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);

function cleanRect(r) {
  if (!isPlainObject(r)) return null;
  const { x, y, width, height } = r;
  if (![x, y, width, height].every(isFiniteNum)) return null;
  if (width <= 0 || height <= 0) return null;
  return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
}

function normName(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
}

/** Name rules (spec 3.2): 1 to 24 characters, trimmed, unique ignoring case. */
function validateName(name, regions, selfId) {
  const n = normName(name);
  if (!n) return { ok: false, error: STRINGS.nameEmpty };
  const clipped = n.slice(0, NAME_MAX);
  const lower = clipped.toLowerCase();
  const clash = (regions || []).some((r) => r && r.id !== selfId && normName(r.name).toLowerCase() === lower);
  if (clash) return { ok: false, error: STRINGS.nameUsed };
  return { ok: true, name: clipped };
}

/** `Region N`, N = the smallest number not already used by a region named that way (spec 3.1). */
function nextDefaultName(regions) {
  const used = new Set((regions || []).map((r) => normName(r && r.name).toLowerCase()));
  for (let n = 1; ; n++) {
    if (!used.has(`region ${n}`)) return `Region ${n}`;
  }
}

/** The theme a region shows: the shared theme while Match all is on, else its own (spec 6.3). */
function effectiveTheme(region, settings, fallback = 'cyberpunk') {
  const s = settings || {};
  if (s.matchAll === true && typeof s.sharedTheme === 'string' && s.sharedTheme) return s.sharedTheme;
  return (region && region.theme) || s.theme || fallback;
}

function itemsOf(apps, regionId) {
  return (Array.isArray(apps) ? apps : []).filter((a) => a && a.regionId === regionId);
}

/**
 * Replace one region's items inside the flat list, keeping every other item
 * where it is. The region's new list goes where its first item was (or at the
 * end when it had none), so the file stays grouped and stable.
 */
function replaceRegionItems(apps, regionId, items) {
  const list = Array.isArray(apps) ? apps : [];
  const tagged = (items || []).map((it) => ({ ...it, regionId }));
  const out = [];
  let placed = false;
  for (const a of list) {
    if (a && a.regionId === regionId) {
      if (!placed) { out.push(...tagged); placed = true; }
      continue;
    }
    out.push(a);
  }
  if (!placed) out.push(...tagged);
  return out;
}

/** Move one item to the end of another region. Returns the new list, or null if the item is unknown. */
function moveItem(apps, itemId, targetRegionId) {
  const list = Array.isArray(apps) ? apps : [];
  const item = list.find((a) => a && a.id === itemId);
  if (!item) return null;
  const rest = list.filter((a) => a !== item);
  const moved = { ...item, regionId: targetRegionId };
  // Insert after the target's last item so it lands at the end of that region.
  let at = -1;
  rest.forEach((a, i) => { if (a && a.regionId === targetRegionId) at = i; });
  if (at < 0) rest.push(moved); else rest.splice(at + 1, 0, moved);
  return rest;
}

function defaultGridRect(workArea) {
  const wa = workArea || { x: 0, y: 0, width: 1920, height: 1040 };
  // Same default as the single window had: bottom-right, 20 px from the edges.
  return {
    x: Math.round(wa.x + wa.width - GRID.defaultWidth - 20),
    y: Math.round(wa.y + wa.height - GRID.defaultHeight - 20),
    width: GRID.defaultWidth,
    height: GRID.defaultHeight,
  };
}

function cleanRegion(raw, ctx, taken) {
  if (!isPlainObject(raw)) return null;
  const id = typeof raw.id === 'string' && raw.id && !taken.ids.has(raw.id) ? raw.id : ctx.newId();
  taken.ids.add(id);
  let name = normName(raw.name).slice(0, NAME_MAX);
  if (!name || taken.names.has(name.toLowerCase())) {
    name = nextDefaultName([...taken.names].map((n) => ({ name: n })));
  }
  taken.names.add(name.toLowerCase());
  const layout = LAYOUTS.includes(raw.layout) ? raw.layout : 'grid';
  const icon = ICONS.includes(raw.icon) ? raw.icon : 'apps';
  const theme = typeof raw.theme === 'string' && (!ctx.validThemes || ctx.validThemes.has(raw.theme))
    ? raw.theme : ctx.defaultTheme;
  const rect = cleanRect(raw.rect) || defaultGridRect(ctx.workArea);
  const home = cleanRect(raw.home) || (ctx.workArea ? { ...ctx.workArea } : null);
  const out = { id, name, icon, layout, theme, rect, home };
  const gridSize = isPlainObject(raw.gridSize) && isFiniteNum(raw.gridSize.width) && isFiniteNum(raw.gridSize.height)
    ? { width: Math.round(raw.gridSize.width), height: Math.round(raw.gridSize.height) } : null;
  if (gridSize) out.gridSize = gridSize;
  if (['up', 'down', 'left', 'right'].includes(raw.fanDirection)) out.fanDirection = raw.fanDirection;
  return out;
}

/**
 * Bring a loaded store up to the regions shape. Idempotent: a store that is
 * already valid comes back unchanged (`changed: false`).
 *
 * ctx: { workArea: {x,y,width,height} (DIP, primary display),
 *        validThemes: Set<string> | null, newId: () => string,
 *        defaultTheme: string }
 * Returns { data, changed, migrated, notes[] }. `data` is a new object; the
 * input is not modified.
 */
function migrate(input, ctx) {
  const notes = [];
  const data = { ...input };
  const settingsIn = isPlainObject(input && input.settings) ? input.settings : {};
  const defaultTheme = ctx.validThemes && ctx.validThemes.has(settingsIn.theme)
    ? settingsIn.theme : (ctx.defaultTheme || 'cyberpunk');
  const c = { ...ctx, defaultTheme };
  const apps = Array.isArray(input && input.apps) ? input.apps : [];
  let migrated = false;

  const taken = { ids: new Set(), names: new Set() };
  let regions = [];
  if (Array.isArray(input && input.regions) && input.regions.length) {
    for (const r of input.regions) {
      const cr = cleanRegion(r, c, taken);
      if (cr) regions.push(cr);
    }
    if (regions.length > REGION_CAP) {
      notes.push(`regions over the cap (${regions.length}); extra regions kept, creation is refused until below ${REGION_CAP}`);
    }
  }

  if (!regions.length) {
    // First start with regions: today's grid becomes the primary region.
    migrated = true;
    const size = isPlainObject(settingsIn.windowSize)
      && isFiniteNum(settingsIn.windowSize.width) && isFiniteNum(settingsIn.windowSize.height)
      ? settingsIn.windowSize : null;
    const pos = isPlainObject(settingsIn.windowPosition)
      && isFiniteNum(settingsIn.windowPosition.x) && isFiniteNum(settingsIn.windowPosition.y)
      ? settingsIn.windowPosition : null;
    const def = defaultGridRect(c.workArea);
    const width = size ? size.width : GRID.defaultWidth;
    const height = size ? size.height : GRID.defaultHeight;
    const rect = pos
      ? { x: Math.round(pos.x), y: Math.round(pos.y), width: Math.round(width), height: Math.round(height) }
      : { ...def, width: Math.round(width), height: Math.round(height),
        x: Math.round(c.workArea ? c.workArea.x + c.workArea.width - width - 20 : def.x),
        y: Math.round(c.workArea ? c.workArea.y + c.workArea.height - height - 20 : def.y) };
    regions = [cleanRegion({
      id: c.newId(), name: MIGRATED_NAME, icon: 'apps', layout: 'grid', theme: defaultTheme, rect,
      home: c.workArea ? { ...c.workArea } : null,
    }, c, { ids: new Set(), names: new Set() })];
    notes.push(`migrated ${apps.length} shortcut(s) into region ${MIGRATED_NAME}`);
  }

  const known = new Set(regions.map((r) => r.id));
  const primaryId = regions[0].id;
  let repaired = 0;
  const newApps = apps.map((a) => {
    if (!isPlainObject(a)) return a;
    if (typeof a.regionId === 'string' && known.has(a.regionId)) return a;
    repaired++;
    return { ...a, regionId: primaryId };
  });
  if (repaired && !migrated) notes.push(`${repaired} shortcut(s) without a known region went to the primary region`);

  const settings = { ...settingsIn };
  if (typeof settings.matchAll !== 'boolean') settings.matchAll = false;
  if (settings.sharedTheme !== null && !(typeof settings.sharedTheme === 'string'
      && (!c.validThemes || c.validThemes.has(settings.sharedTheme)))) {
    settings.sharedTheme = null;
  }
  if (!('managerBounds' in settings)) settings.managerBounds = null;
  // settings.theme mirrors the primary region, so a downgrade shows the same look.
  settings.theme = effectiveTheme(regions[0], settings, defaultTheme);

  data.apps = newApps;
  data.regions = regions;
  data.settings = settings;
  data.regionsVersion = REGIONS_VERSION;

  const changed = migrated
    || JSON.stringify(input && input.regions) !== JSON.stringify(regions)
    || JSON.stringify(apps) !== JSON.stringify(newApps)
    || JSON.stringify(settingsIn) !== JSON.stringify(settings)
    || (input && input.regionsVersion) !== REGIONS_VERSION;
  return { data, changed, migrated, notes };
}

/** Items whose region is gone go to the primary region. Returns { apps, moved }. */
function repairItems(apps, regions) {
  const known = new Set((regions || []).map((r) => r.id));
  const primaryId = regions && regions[0] ? regions[0].id : null;
  let moved = 0;
  const out = (Array.isArray(apps) ? apps : []).map((a) => {
    if (!isPlainObject(a) || !primaryId) return a;
    if (typeof a.regionId === 'string' && known.has(a.regionId)) return a;
    moved++;
    return { ...a, regionId: primaryId };
  });
  return { apps: out, moved };
}

/** A different theme from `current`, picked with `rand` (0..1). */
function pickOtherTheme(themes, current, rand = Math.random) {
  const list = [...themes];
  if (!list.length) return current;
  const others = list.filter((t) => t !== current);
  const pool = others.length ? others : list;
  return pool[Math.floor(rand() * pool.length) % pool.length];
}

/** The confirm text for deleting a region (spec 3.4; no moved files before M3). */
function deleteConfirmText(region, items) {
  const moved = items.filter((a) => a.kind === 'moved').length;
  const refs = items.length - moved;
  const lines = [];
  if (moved) lines.push(`${moved} shortcut${moved === 1 ? '' : 's'} move back to the desktop.`);
  if (refs) {
    lines.push(`${refs} ${moved ? 'other ' : ''}shortcut${refs === 1 ? '' : 's'} ${refs === 1 ? 'is' : 'are'} removed from QuickLauncher. The apps stay installed.`);
  }
  return { message: `Delete “${region.name}”?`, detail: lines.join('\n'), needsConfirm: items.length > 0 };
}

module.exports = {
  LAYOUTS, BUILT_LAYOUTS, ICONS, REGION_CAP, NAME_MAX, MIGRATED_NAME, REGIONS_VERSION, GRID, STRINGS,
  cleanRect, validateName, nextDefaultName, effectiveTheme, itemsOf, replaceRegionItems, moveItem,
  defaultGridRect, migrate, repairItems, pickOtherTheme, deleteConfirmText,
};
