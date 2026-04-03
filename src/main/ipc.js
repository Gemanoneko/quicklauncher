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
      // Use explorer.exe to launch shell: URIs (Store apps, AUMIDs)
      execFile('explorer.exe', [filePath], { windowsHide: false, stdio: 'pipe' }, () => {});
    } else {
      shell.openPath(filePath);
    }
    // Give the launched app time to take focus, then push launcher back down
    setTimeout(() => sendToBottom(win), 500);
  });

  ipcMain.handle('get-installed-apps', () => {
    return new Promise((resolve) => {
      const ps = `
$startDirs = @([Environment]::GetFolderPath('ApplicationData') + '\\Microsoft\\Windows\\Start Menu\\Programs', [Environment]::GetFolderPath('CommonApplicationData') + '\\Microsoft\\Windows\\Start Menu\\Programs')
$wsh = New-Object -ComObject WScript.Shell
$pkgMap = @{}
Get-AppxPackage -ErrorAction SilentlyContinue | ForEach-Object { $pkgMap[$_.PackageFamilyName] = $_ }
$apps = Get-StartApps | ForEach-Object {
  $appId = $_.AppID; $name = $_.Name; $iconPath = $null; $exePath = $null
  if ($appId -match '^(.+)!.+$') {
    $pfn = $Matches[1]
    try {
      $pkg = $pkgMap[$pfn]
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
        }
      }
    } catch {}
  } else {
    # Win32 app: find exe via Start Menu shortcut
    try {
      $lnk = Get-ChildItem -Path $startDirs -Filter '*.lnk' -Recurse -ErrorAction SilentlyContinue |
             Where-Object { $_.BaseName -ieq $name } | Select-Object -First 1
      if ($lnk) {
        $sc = $wsh.CreateShortcut($lnk.FullName)
        # Prefer IconLocation (Squirrel apps point TargetPath to Update.exe; icon is on real exe)
        if ($sc.IconLocation -and $sc.IconLocation -notmatch '^\s*,') {
          $iconExe = ($sc.IconLocation -split ',')[0].Trim()
          if ($iconExe -and (Test-Path $iconExe)) { $exePath = $iconExe }
        }
        if (-not $exePath -and $sc.TargetPath -and (Test-Path $sc.TargetPath)) {
          $exePath = $sc.TargetPath
        }
      }
    } catch {}
  }
  [PSCustomObject]@{ Name=$name; AppID=$appId; IconPath=$iconPath; ExePath=$exePath }
}
$apps | ConvertTo-Json -Depth 2
`;
      execFile('powershell.exe',
        ['-NoProfile', '-NonInteractive', '-Command', ps],
        { windowsHide: true, stdio: 'pipe', timeout: 25000 },
        async (err, stdout) => {
          if (err || !stdout) { resolve([]); return; }
          try {
            let data = JSON.parse(stdout.trim());
            if (!Array.isArray(data)) data = data ? [data] : [];
            const items = data.filter(item => item.Name && item.AppID)
                              .sort((a, b) => a.Name.localeCompare(b.Name));
            const result = [];
            for (const item of items) {
              let iconDataUrl = '';
              if (item.IconPath) {
                try {
                  const buf = fs.readFileSync(item.IconPath);
                  const ext = item.IconPath.split('.').pop().toLowerCase();
                  const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
                  iconDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
                } catch { /* skip */ }
              } else if (item.ExePath) {
                try {
                  const icon = await app.getFileIcon(item.ExePath, { size: 'large' });
                  iconDataUrl = icon.toDataURL();
                } catch { /* skip */ }
              }
              result.push({ name: item.Name, appId: item.AppID, iconDataUrl });
            }
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
