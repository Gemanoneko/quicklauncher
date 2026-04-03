const { ipcMain, dialog, shell, app } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { sendToBottom } = require('./window');
const { checkForUpdates } = require('./updater');

function setupIPC(win, store, electronApp) {

  ipcMain.handle('get-apps', () => store.get('apps'));

  ipcMain.handle('save-apps', (_, apps) => {
    store.set('apps', apps);
  });

  ipcMain.handle('get-settings', () => store.get('settings'));

  ipcMain.handle('save-settings', (_, settings) => {
    store.set('settings', settings);
  });

  ipcMain.handle('launch-app', (_, filePath) => {
    if (filePath.startsWith('shell:')) {
      shell.openExternal(filePath);
    } else {
      shell.openPath(filePath);
    }
    // Give the launched app time to take focus, then push launcher back down
    setTimeout(() => sendToBottom(win), 500);
  });

  ipcMain.handle('get-installed-apps', () => {
    return new Promise((resolve) => {
      const ps = `
$apps = Get-StartApps | ForEach-Object {
  $appId = $_.AppID; $name = $_.Name; $iconPath = $null
  if ($appId -match '^(.+)!.+$') {
    $pfn = $Matches[1]
    try {
      $pkg = Get-AppxPackage -PackageFamilyName $pfn -ErrorAction SilentlyContinue
      if ($pkg) {
        [xml]$mf = Get-Content "$($pkg.InstallLocation)\\AppxManifest.xml" -ErrorAction SilentlyContinue
        $logoRel = $null
        try { $logoRel = $mf.Package.Applications.Application.VisualElements.Square44x44Logo } catch {}
        if (-not $logoRel) { try { $logoRel = $mf.Package.Properties.Logo } catch {} }
        if ($logoRel) {
          $logoRel  = $logoRel -replace '/', '\\'
          $baseDir  = $pkg.InstallLocation
          $logoBase = [IO.Path]::GetFileNameWithoutExtension($logoRel)
          $logoDir  = [IO.Path]::GetDirectoryName($logoRel)
          $logoExt  = [IO.Path]::GetExtension($logoRel)
          $fullDir  = if ($logoDir) { Join-Path $baseDir $logoDir } else { $baseDir }
          $exact    = Join-Path $baseDir $logoRel
          if (Test-Path $exact) { $iconPath = $exact }
          else {
            $found = Get-ChildItem -Path $fullDir -Filter "$logoBase*$logoExt" -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -First 1
            if ($found) { $iconPath = $found.FullName }
          }
          if (-not $iconPath) {
            $logoRel2 = $null
            try { $logoRel2 = $mf.Package.Properties.Logo } catch {}
            if ($logoRel2 -and $logoRel2 -ne $logoRel) {
              $logoRel2 = $logoRel2 -replace '/', '\\'
              $logoBase2 = [IO.Path]::GetFileNameWithoutExtension($logoRel2)
              $logoDir2  = [IO.Path]::GetDirectoryName($logoRel2)
              $logoExt2  = [IO.Path]::GetExtension($logoRel2)
              $fullDir2  = if ($logoDir2) { Join-Path $baseDir $logoDir2 } else { $baseDir }
              $exact2    = Join-Path $baseDir $logoRel2
              if (Test-Path $exact2) { $iconPath = $exact2 }
              else {
                $found2 = Get-ChildItem -Path $fullDir2 -Filter "$logoBase2*$logoExt2" -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -First 1
                if ($found2) { $iconPath = $found2.FullName }
              }
            }
          }
        }
      }
    } catch {}
  }
  [PSCustomObject]@{ Name=$name; AppID=$appId; IconPath=$iconPath }
}
$apps | ConvertTo-Json -Depth 2
`;
      execFile('powershell.exe',
        ['-NoProfile', '-NonInteractive', '-Command', ps],
        { windowsHide: true, stdio: 'pipe', timeout: 20000 },
        (err, stdout) => {
          if (err || !stdout) { resolve([]); return; }
          try {
            let data = JSON.parse(stdout.trim());
            if (!Array.isArray(data)) data = data ? [data] : [];
            const result = data
              .filter(item => item.Name && item.AppID)
              .sort((a, b) => a.Name.localeCompare(b.Name))
              .map(item => {
                let iconDataUrl = '';
                if (item.IconPath) {
                  try {
                    const buf = fs.readFileSync(item.IconPath);
                    const ext = item.IconPath.split('.').pop().toLowerCase();
                    const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
                    iconDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
                  } catch { /* skip */ }
                }
                return { name: item.Name, appId: item.AppID, iconDataUrl };
              });
            resolve(result);
          } catch { resolve([]); }
        }
      );
    });
  });

  ipcMain.handle('add-app-from-appid', (_, { name, appId, iconDataUrl }) => {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      path: `shell:AppsFolder\\${appId}`,
      iconDataUrl: iconDataUrl || ''
    };
  });

  ipcMain.handle('add-app-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Add Application',
      filters: [
        { name: 'Applications & Shortcuts', extensions: ['exe', 'lnk'] }
      ],
      properties: ['openFile']
    });
    if (canceled || !filePaths.length) return null;
    return buildAppEntry(filePaths[0]);
  });

  ipcMain.handle('add-app-from-path', async (_, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.exe' && ext !== '.lnk') return null;
    return buildAppEntry(filePath);
  });

  ipcMain.handle('resize-window', (_, { width, height }) => {
    win.setContentSize(Math.max(width, 200), Math.max(height, 150));
    sendToBottom(win);
  });

  ipcMain.handle('set-auto-launch', (_, enabled) => {
    electronApp.setLoginItemSettings({
      openAtLogin: enabled,
      path: electronApp.getPath('exe')
    });
  });

  ipcMain.handle('check-update', () => {
    checkForUpdates();
  });

  ipcMain.handle('show-window', () => win.show());
  ipcMain.handle('hide-window', () => win.hide());
}

async function buildAppEntry(filePath) {
  const { app } = require('electron');
  const name = path.basename(filePath, path.extname(filePath));
  try {
    const icon = await app.getFileIcon(filePath, { size: 'large' });
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      path: filePath,
      iconDataUrl: icon.toDataURL()
    };
  } catch {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      path: filePath,
      iconDataUrl: ''
    };
  }
}

module.exports = { setupIPC };
