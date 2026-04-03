const { ipcMain, dialog, shell, app, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { sendToBottom } = require('./window');
const { checkForUpdates } = require('./updater');

// Crop background padding from an icon image.
// Detects background via corner sampling (handles both transparent and solid backgrounds).
function trimIcon(img) {
  const { width, height } = img.getSize();
  if (width < 8 || height < 8) return img;
  const bitmap = img.toBitmap(); // raw BGRA

  const px = (x, y) => {
    const i = (y * width + x) * 4;
    return [bitmap[i], bitmap[i + 1], bitmap[i + 2], bitmap[i + 3]];
  };

  // Decide mode: transparent bg or solid-color bg
  const useAlpha = px(0, 0)[3] < 10;
  let bgB = 0, bgG = 0, bgR = 0;
  if (!useAlpha) {
    const corners = [px(0, 0), px(width - 1, 0), px(0, height - 1), px(width - 1, height - 1)];
    bgB = Math.round(corners.reduce((s, c) => s + c[0], 0) / 4);
    bgG = Math.round(corners.reduce((s, c) => s + c[1], 0) / 4);
    bgR = Math.round(corners.reduce((s, c) => s + c[2], 0) / 4);
  }

  const isContent = (x, y) => {
    const [b, g, r, a] = px(x, y);
    if (useAlpha) return a > 15;
    return Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) > 25;
  };

  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isContent(x, y)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return img; // all background
  const savings = 1 - ((maxX - minX + 1) * (maxY - minY + 1)) / (width * height);
  if (savings < 0.10) return img; // not worth cropping

  const pad = Math.round(Math.min(width, height) * 0.04);
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  const w = Math.min(width - x, maxX + pad + 1 - x);
  const h = Math.min(height - y, maxY + pad + 1 - y);
  return img.crop({ x, y, width: w, height: h });
}

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
        try { $logoRel = $mf.Package.Applications.Application.VisualElements.Square150x150Logo } catch {}
        if (-not $logoRel) { try { $logoRel = $mf.Package.Applications.Application.VisualElements.Square44x44Logo } catch {} }
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
  }
  # Fallback: if no icon found yet, try Start Menu shortcut (covers Win32 apps and
  # MSIX/Click-to-Run apps not listed by Get-AppxPackage e.g. Office 2021)
  if (-not $iconPath -and -not $exePath) {
    try {
      $lnk = Get-ChildItem -Path $startDirs -Filter '*.lnk' -Recurse -ErrorAction SilentlyContinue |
             Where-Object { $_.BaseName -ieq $name } | Select-Object -First 1
      if ($lnk) {
        $sc = $wsh.CreateShortcut($lnk.FullName)
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
  # Resolve GUID-based AUMID like {GUID}\path\app.exe (e.g. BOINC, older Win32 apps)
  if (-not $iconPath -and -not $exePath -and $appId -match '^\{[0-9A-Fa-f-]+\}\\(.+\.exe)$') {
    $relPath = $Matches[1]
    $searchDirs = @($env:ProgramFiles, ${env:ProgramFiles(x86)}, "$env:LOCALAPPDATA\Programs")
    foreach ($dir in $searchDirs) {
      if ($dir) {
        $fullPath = Join-Path $dir $relPath
        if (Test-Path $fullPath) { $exePath = $fullPath; break }
      }
    }
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
            const items = data
              .filter(item => item.Name && item.AppID
                // Skip document/URL shortcuts dumped into the Start Menu by installers
                && !/\.(txt|htm|html|pdf|rtf|url|chm|doc|docx|md)(\b|$)/i.test(item.AppID)
                // Must have at least one icon source — if neither found, it's not a real app
                && (item.IconPath || item.ExePath))
              .sort((a, b) => a.Name.localeCompare(b.Name));
            const result = [];
            for (const item of items) {
              let iconDataUrl = '';
              if (item.IconPath) {
                try {
                  const buf = fs.readFileSync(item.IconPath);
                  const img = trimIcon(nativeImage.createFromBuffer(buf));
                  iconDataUrl = img.toDataURL();
                } catch { /* skip */ }
              } else if (item.ExePath) {
                try {
                  const img = trimIcon(await app.getFileIcon(item.ExePath, { size: 'large' }));
                  iconDataUrl = img.toDataURL();
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
  const name = path.basename(filePath, path.extname(filePath));
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // For .lnk files, resolve the shortcut target/IconLocation so we get the real
  // app icon instead of the generic shortcut-overlay icon.
  let iconSourcePath = filePath;
  if (path.extname(filePath).toLowerCase() === '.lnk') {
    const psPath = filePath.replace(/'/g, "''");
    const resolved = await new Promise((resolve) => {
      execFile('powershell.exe',
        ['-NoProfile', '-NonInteractive', '-Command',
         `$wsh=New-Object -ComObject WScript.Shell;$sc=$wsh.CreateShortcut('${psPath}');` +
         `$i=($sc.IconLocation-split',')[0].Trim();$t=$sc.TargetPath;` +
         `if($i-and(Test-Path $i)){Write-Output $i}elseif($t-and(Test-Path $t)){Write-Output $t}`],
        { windowsHide: true, stdio: 'pipe', timeout: 5000 },
        (err, stdout) => resolve(stdout ? stdout.trim() : null)
      );
    });
    if (resolved) iconSourcePath = resolved;
  }

  try {
    const icon = trimIcon(await app.getFileIcon(iconSourcePath, { size: 'large' }));
    return { id, name, path: filePath, iconDataUrl: icon.toDataURL() };
  } catch {
    return { id, name, path: filePath, iconDataUrl: '' };
  }
}

module.exports = { setupIPC };
