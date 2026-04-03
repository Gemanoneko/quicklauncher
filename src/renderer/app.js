/* global require */
const { ipcRenderer, webUtils } = require('electron');
const { version: APP_VERSION } = require('../../package.json');

// ── State ────────────────────────────────────────────────────────────────────
let apps = [];
let settings = {};
let editMode = false;
let pendingUpdateReady = false;

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
  const appItem = await ipcRenderer.invoke('add-app-dialog');
  if (!appItem) return;
  apps.push(appItem);
  await saveApps();
  renderGrid();
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

// ── Context menu (right-click → edit mode) ────────────────────────────────────
function setupContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!editMode && !e.target.closest('#settings-overlay')) {
      enterEditMode();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editMode) exitEditMode();
  });
}

// ── Update banner ─────────────────────────────────────────────────────────────
function setupUpdateListeners() {
  ipcRenderer.on('update-available', (_, info) => {
    showUpdateBanner(
      `UPDATE AVAILABLE — v${info.version}`,
      [{ label: 'DOWNLOAD', action: 'download' }]
    );
  });

  ipcRenderer.on('update-progress', (_, pct) => {
    document.getElementById('update-text').textContent = `DOWNLOADING UPDATE... ${pct}%`;
  });

  ipcRenderer.on('update-ready', () => {
    pendingUpdateReady = true;
    showUpdateBanner(
      'UPDATE READY — RESTART TO INSTALL',
      [{ label: 'RESTART NOW', action: 'install' }]
    );
  });

  ipcRenderer.on('update-not-available', () => {
    // Only show if user manually checked
    if (document.getElementById('update-banner').dataset.manual === 'true') {
      showUpdateBanner('SYSTEM IS UP TO DATE', [], 3000);
    }
  });

  ipcRenderer.on('update-error', (_, msg) => {
    console.warn('Update error:', msg);
    hideUpdateBanner();
  });

  ipcRenderer.on('trigger-update-check', () => {
    document.getElementById('update-banner').dataset.manual = 'true';
    ipcRenderer.invoke('check-update');
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
  document.getElementById('update-banner').dataset.manual = 'true';
  ipcRenderer.invoke('check-update');
  document.getElementById('settings-overlay').classList.add('hidden');
});

document.getElementById('btn-add-edit').addEventListener('click', addAppFromDialog);
document.getElementById('btn-done-edit').addEventListener('click', exitEditMode);

// ── Start ─────────────────────────────────────────────────────────────────────
init();
