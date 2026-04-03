/* global require */
const { ipcRenderer, webUtils } = require('electron');
const { version: APP_VERSION } = require('../../package.json');

// ── State ────────────────────────────────────────────────────────────────────
let apps = [];
let settings = {};
let editMode = false;
let pendingUpdateReady = false;
let installedApps = [];

// ── Boot ─────────────────────────────────────────────────────────────────────
async function init() {
  apps = await ipcRenderer.invoke('get-apps');
  settings = await ipcRenderer.invoke('get-settings');
  applySettings();
  renderGrid();
  setupDragDrop();
  setupContextMenu();
  setupUpdateListeners();
  document.getElementById('app-version').textContent = `v${APP_VERSION}`;
  document.getElementById('header-version').textContent = `v${APP_VERSION}`;
  refreshMissingIcons();
}

async function refreshMissingIcons() {
  const missing = apps.filter(a => a.path && (a.path.startsWith('shell:') || /^[a-z][a-z0-9+.-]*:\/\//i.test(a.path)) && !a.iconDataUrl);
  if (missing.length === 0) return;
  const installed = await ipcRenderer.invoke('get-installed-apps');
  let changed = false;
  for (const appItem of missing) {
    const appId = appItem.path.startsWith('shell:') ? appItem.path.replace('shell:AppsFolder\\', '') : appItem.path;
    const match = installed.find(i => i.appId === appId);
    if (match && match.iconDataUrl) {
      appItem.iconDataUrl = match.iconDataUrl;
      changed = true;
    }
  }
  if (changed) {
    await saveApps();
    renderGrid();
  }
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderGrid() {
  const grid = document.getElementById('app-grid');
  const dropHint = document.getElementById('drop-hint');

  grid.innerHTML = '';

  if (apps.length === 0 && !editMode) {
    dropHint.classList.remove('hidden');
  } else {
    dropHint.classList.add('hidden');
  }

  apps.forEach(appItem => grid.appendChild(createAppTile(appItem)));
}

function createAppTile(appItem) {
  const tile = document.createElement('div');
  tile.className = 'app-tile';
  tile.dataset.id = appItem.id;

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'tile-icon-wrap';

  const img = document.createElement('img');
  img.className = 'tile-icon';
  img.src = appItem.iconDataUrl || '';
  img.alt = appItem.name;
  img.draggable = false;
  img.onerror = () => { img.style.visibility = 'hidden'; };

  iconWrapper.appendChild(img);

  if (editMode) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeApp(appItem.id);
    });
    iconWrapper.appendChild(removeBtn);
  }

  const label = document.createElement('span');
  label.className = 'tile-label';
  label.textContent = appItem.name;
  label.title = editMode ? 'Click to rename' : appItem.name;

  if (editMode) {
    label.classList.add('renameable');
    label.addEventListener('click', (e) => {
      e.stopPropagation();
      startRename(appItem, label);
    });
  }

  tile.appendChild(iconWrapper);
  tile.appendChild(label);

  if (!editMode) {
    tile.addEventListener('click', () => launchApp(appItem.path));
  }

  return tile;
}

function startRename(appItem, labelEl) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'rename-input';
  input.value = appItem.name;
  input.maxLength = 40;

  labelEl.replaceWith(input);
  input.focus();
  input.select();

  async function commit() {
    const newName = input.value.trim() || appItem.name;
    appItem.name = newName;
    labelEl.textContent = newName;
    labelEl.title = 'Click to rename';
    input.replaceWith(labelEl);
    await saveApps();
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.replaceWith(labelEl); }
  });
}

// ── Actions ──────────────────────────────────────────────────────────────────
async function launchApp(filePath) {
  await ipcRenderer.invoke('launch-app', filePath);
}

function enterEditMode() {
  if (editMode) return;
  editMode = true;
  document.getElementById('edit-bar').classList.remove('hidden');
  renderGrid();
}

function exitEditMode() {
  editMode = false;
  document.getElementById('edit-bar').classList.add('hidden');
  renderGrid();
}

async function addAppFromDialog() {
  try {
    const appItem = await ipcRenderer.invoke('add-app-dialog');
    if (!appItem) return;
    apps.push(appItem);
    await saveApps();
    renderGrid();
  } catch (e) {
    console.error('Failed to add app:', e);
  }
}

async function removeApp(id) {
  apps = apps.filter(a => a.id !== id);
  await saveApps();
  renderGrid();
}

async function saveApps() {
  await ipcRenderer.invoke('save-apps', apps);
}

// ── Settings ──────────────────────────────────────────────────────────────────
function applySettings() {
  const size = settings.iconSize || 64;
  document.documentElement.style.setProperty('--icon-size', size + 'px');
  document.getElementById('slider-icon-size').value = size;
  document.getElementById('icon-size-val').textContent = size + 'px';
  document.getElementById('chk-startup').checked = settings.startWithWindows !== false;

  const theme = settings.theme || 'cyberpunk';
  document.documentElement.className = theme !== 'cyberpunk' ? 'theme-' + theme : '';
  document.querySelectorAll('.skin-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

document.getElementById('slider-icon-size').addEventListener('input', async (e) => {
  const size = parseInt(e.target.value, 10);
  document.getElementById('icon-size-val').textContent = size + 'px';
  document.documentElement.style.setProperty('--icon-size', size + 'px');
  settings.iconSize = size;
  await ipcRenderer.invoke('save-settings', settings);
});

document.getElementById('chk-startup').addEventListener('change', async (e) => {
  settings.startWithWindows = e.target.checked;
  await ipcRenderer.invoke('save-settings', settings);
  await ipcRenderer.invoke('set-auto-launch', e.target.checked);
});

// ── Drag & Drop ────────────────────────────────────────────────────────────────
function setupDragDrop() {
  const body = document.body;

  body.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    document.getElementById('app').classList.add('drag-over');
  });

  body.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
      document.getElementById('app').classList.remove('drag-over');
    }
  });

  body.addEventListener('drop', async (e) => {
    e.preventDefault();
    document.getElementById('app').classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      const filePath = webUtils.getPathForFile(file);
      const ext = filePath.split('.').pop().toLowerCase();
      if (ext === 'exe' || ext === 'lnk') {
        const appItem = await ipcRenderer.invoke('add-app-from-path', filePath);
        if (appItem && !apps.find(a => a.path === appItem.path)) {
          apps.push(appItem);
        }
      }
    }
    await saveApps();
    renderGrid();
  });
}

// ── Installed apps picker ─────────────────────────────────────────────────────
async function openInstalledAppsPicker() {
  const pickerEl = document.getElementById('apps-picker');
  const loadingEl = document.getElementById('picker-loading');
  const listEl = document.getElementById('picker-list');
  const searchEl = document.getElementById('picker-search');

  listEl.innerHTML = '';
  searchEl.value = '';
  loadingEl.classList.remove('hidden');
  pickerEl.classList.remove('hidden');

  installedApps = await ipcRenderer.invoke('get-installed-apps');
  loadingEl.classList.add('hidden');
  renderPickerList(installedApps);
  searchEl.focus();
}

function renderPickerList(items) {
  const listEl = document.getElementById('picker-list');
  listEl.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'picker-empty';
    empty.textContent = 'NO APPS FOUND';
    listEl.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'picker-item';

    if (item.iconDataUrl) {
      const img = document.createElement('img');
      img.src = item.iconDataUrl;
      img.alt = '';
      el.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'picker-icon-placeholder';
      el.appendChild(placeholder);
    }

    const nameEl = document.createElement('span');
    nameEl.className = 'picker-item-name';
    nameEl.textContent = item.name;
    el.appendChild(nameEl);

    el.addEventListener('click', async () => {
      const appItem = await ipcRenderer.invoke('add-app-from-appid', {
        name: item.name,
        appId: item.appId,
        iconDataUrl: item.iconDataUrl
      });
      if (appItem && !apps.find(a => a.path === appItem.path)) {
        apps.push(appItem);
        await saveApps();
        renderGrid();
      }
      document.getElementById('apps-picker').classList.add('hidden');
    });

    listEl.appendChild(el);
  });
}

document.getElementById('picker-search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderPickerList(q ? installedApps.filter(a => a.name.toLowerCase().includes(q)) : installedApps);
});

document.getElementById('btn-close-picker').addEventListener('click', () => {
  document.getElementById('apps-picker').classList.add('hidden');
});

// ── Context menu (right-click → edit mode) ────────────────────────────────────
function setupContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!editMode && !e.target.closest('#settings-overlay') && !e.target.closest('#apps-picker')) {
      enterEditMode();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editMode) exitEditMode();
  });
}

// ── Update banner ─────────────────────────────────────────────────────────────
function setupUpdateListeners() {
  ipcRenderer.on('update-checking', () => {
    showUpdateBanner('CHECKING FOR UPDATES...', []);
  });

  ipcRenderer.on('update-available', (_, info) => {
    showUpdateBanner(
      `UPDATE AVAILABLE — v${info.version}`,
      [{ label: 'DOWNLOAD', action: 'download' }]
    );
  });

  ipcRenderer.on('update-progress', (_, pct) => {
    document.getElementById('update-text').textContent = `DOWNLOADING... ${pct}%`;
  });

  ipcRenderer.on('update-ready', () => {
    pendingUpdateReady = true;
    showUpdateBanner(
      'UPDATE READY — WILL INSTALL AND RESTART',
      [{ label: 'INSTALL NOW', action: 'install' }]
    );
  });

  ipcRenderer.on('update-not-available', () => {
    showUpdateBanner('SYSTEM IS UP TO DATE', [], 3000);
  });

  ipcRenderer.on('update-error', (_, msg) => {
    showUpdateBanner(`UPDATE ERROR: ${msg}`, [], 6000);
    console.warn('Update error:', msg);
  });
}

function showUpdateBanner(text, actions, autoDismissMs = 0) {
  const banner = document.getElementById('update-banner');
  const textEl = document.getElementById('update-text');
  const actionsEl = document.getElementById('update-actions');

  textEl.textContent = text;
  actionsEl.innerHTML = '';

  actions.forEach(({ label, action }) => {
    const btn = document.createElement('button');
    btn.className = 'update-btn';
    btn.textContent = label;
    btn.addEventListener('click', async () => {
      if (action === 'download') {
        btn.textContent = 'DOWNLOADING...';
        btn.disabled = true;
        await ipcRenderer.invoke('download-update');
      } else if (action === 'install') {
        await ipcRenderer.invoke('install-update');
      }
    });
    actionsEl.appendChild(btn);
  });

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'update-btn update-dismiss';
  dismissBtn.textContent = '✕';
  dismissBtn.addEventListener('click', () => {
    hideUpdateBanner();
    pendingUpdateReady = false;
  });
  actionsEl.appendChild(dismissBtn);

  banner.classList.remove('hidden');

  if (autoDismissMs > 0) {
    setTimeout(hideUpdateBanner, autoDismissMs);
  }
}

function hideUpdateBanner() {
  document.getElementById('update-banner').classList.add('hidden');
}

// ── Button wiring ─────────────────────────────────────────────────────────────
document.getElementById('btn-settings').addEventListener('click', () => {
  document.getElementById('settings-overlay').classList.toggle('hidden');
});

document.getElementById('btn-hide').addEventListener('click', () => {
  ipcRenderer.invoke('hide-window');
});

document.getElementById('btn-close-settings').addEventListener('click', () => {
  document.getElementById('settings-overlay').classList.add('hidden');
});

document.getElementById('btn-check-update').addEventListener('click', () => {
  ipcRenderer.invoke('check-update');
  document.getElementById('settings-overlay').classList.add('hidden');
});

document.getElementById('btn-add-edit').addEventListener('click', addAppFromDialog);
document.getElementById('btn-add-installed').addEventListener('click', openInstalledAppsPicker);
document.getElementById('btn-done-edit').addEventListener('click', exitEditMode);

// ── Skin selection ────────────────────────────────────────────────────────────
document.querySelectorAll('.skin-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    settings.theme = btn.dataset.theme;
    applySettings();
    await ipcRenderer.invoke('save-settings', settings);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
init();
