'use strict';
const { execFile } = require('node:child_process');

const APPS = /^shell:AppsFolder\\(.+)$/i;
const BLENDER = /^blender\.\d+(?:\.\d+)*$/i;
let pending = null;

// Read the current Start identities, not the icon picker's cached list. An
// installer may replace an AppID while QuickLauncher stays running.
function listInstalledApps() {
  if (pending) return pending;
  pending = new Promise(resolve => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      '[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; @(Get-StartApps -ErrorAction Stop | Select-Object Name,AppID) | ConvertTo-Json -Compress'],
    { windowsHide: true, timeout: 8000, maxBuffer: 4 * 1024 * 1024 }, (error, stdout) => {
      try {
        const apps = !error && JSON.parse(stdout);
        resolve(Array.isArray(apps) ? apps : apps && typeof apps === 'object' ? [apps] : null);
      } catch { resolve(null); }
    });
  }).finally(() => { pending = null; });
  return pending;
}

function chooseInstalledApp(filePath, apps) {
  const match = APPS.exec(filePath);
  if (!match) return { ok: true, path: filePath };
  if (!Array.isArray(apps)) return { ok: false, reason: 'TARGET UNREADABLE' };
  const id = match[1];
  const ids = apps.filter(app => app && typeof app.AppID === 'string').map(app => app.AppID);
  if (ids.some(candidate => candidate.toLowerCase() === id.toLowerCase())) return { ok: true, path: filePath };
  // Blender publishes the version in its AppID (blender.5.1 -> blender.5.2).
  // Never guess by a display label (which may be custom), path similarity or
  // an arbitrary numeric suffix in another vendor's identity. Multiple Blender
  // installations are ambiguous and must not silently pick a different one.
  if (BLENDER.test(id)) {
    const replacements = [...new Set(ids.filter(candidate => BLENDER.test(candidate)))];
    if (replacements.length === 1) return { ok: true, path: 'shell:AppsFolder\\' + replacements[0] };
  }
  return { ok: false, reason: 'TARGET MISSING' };
}

async function resolveInstalledPath(filePath, { list = listInstalledApps } = {}) {
  if (!APPS.test(filePath)) return { ok: true, path: filePath };
  return chooseInstalledApp(filePath, await list());
}

async function resolveStoredInstalledApp(item, store, changed = () => {}, options) {
  const resolved = await resolveInstalledPath(item.path, options);
  if (!resolved.ok) return resolved;
  const current = store.get('apps') || [];
  const same = current.find(app => app.id === item.id && app.regionId === item.regionId);
  // Another click/menu can finish the identical repair while this lookup is
  // pending. It is still this item, at exactly the target we just resolved.
  if (!same || (same.path !== item.path && same.path !== resolved.path)) return { ok: false, reason: 'TARGET MISSING' };
  if (resolved.path !== same.path) {
    store.set('apps', current.map(app => app === same ? { ...app, path: resolved.path } : app));
    changed(same.regionId);
  }
  return resolved;
}

module.exports = { chooseInstalledApp, resolveInstalledPath, resolveStoredInstalledApp };
