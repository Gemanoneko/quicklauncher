const { ipcMain, dialog, shell, app, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { sendToBottom } = require('./window');
const { checkForUpdates } = require('./updater');

// C# type injected into PowerShell to extract 256×256 (SHIL_JUMBO) icons.
const ICON_HELPER_CS = `
using System;
using System.Runtime.InteropServices;
using System.Drawing;
using System.IO;
[ComImport, Guid("46EB5926-582E-4017-9FDF-E8998DAA0950"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IImageList2 {
  [PreserveSig] int Add(IntPtr a, IntPtr b, out int c);
  [PreserveSig] int ReplaceIcon(int a, IntPtr b, out int c);
  [PreserveSig] int SetOverlayImage(int a, int b);
  [PreserveSig] int Replace(int a, IntPtr b, IntPtr c);
  [PreserveSig] int AddMasked(IntPtr a, int b, out int c);
  [PreserveSig] int Draw(IntPtr p);
  [PreserveSig] int Remove(int i);
  [PreserveSig] int GetIcon(int i, int flags, out IntPtr picon);
}
[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
public struct ShFI {
  public IntPtr hIcon; public int iIcon; public uint dwAttr;
  [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)] public string szDisplay;
  [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 80)] public string szType;
}
public static class IconHelper {
  [DllImport("shell32.dll", CharSet = CharSet.Auto)]
  static extern IntPtr SHGetFileInfo(string p, uint a, ref ShFI s, uint sz, uint f);
  [DllImport("shell32.dll")]
  static extern int SHGetImageList(int n, ref Guid g, out IImageList2 v);
  [DllImport("user32.dll")]
  static extern bool DestroyIcon(IntPtr h);
  public static string GetBase64(string path) {
    try {
      var s = new ShFI();
      SHGetFileInfo(path, 0, ref s, (uint)Marshal.SizeOf(s), 0x4000);
      var g = new Guid("46EB5926-582E-4017-9FDF-E8998DAA0950");
      IImageList2 l;
      if (SHGetImageList(4, ref g, out l) != 0) return null;
      IntPtr h = IntPtr.Zero;
      l.GetIcon(s.iIcon, 1, out h);
      if (h == IntPtr.Zero) return null;
      try {
        using (var ic = Icon.FromHandle(h))
        using (var bmp = ic.ToBitmap())
        using (var ms = new MemoryStream()) {
          bmp.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
          return Convert.ToBase64String(ms.ToArray());
        }
      } finally { DestroyIcon(h); }
    } catch { return null; }
  }
}`;

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

// Resolve an icon path that may contain %ENV% vars or be a bare filename like "appwiz.cpl".
function resolveIconPath(p) {
  if (!p) return null;
  const expanded = p.replace(/%([^%]+)%/gi, (_, v) => process.env[v] || `%${v}%`);
  if (fs.existsSync(expanded)) return expanded;
  // Bare filename with no directory part: search System32
  if (!path.isAbsolute(expanded) && !expanded.includes('\\') && !expanded.includes('/')) {
    const sys32 = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', expanded);
    if (fs.existsSync(sys32)) return sys32;
  }
  return null;
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
    if (filePath.startsWith('shell:') || filePath.startsWith('steam://')) {
      // Use explorer.exe for shell: URIs (Store apps) and steam:// URLs
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
$steamInstall = $null
try { $steamInstall = (Get-ItemProperty 'HKLM:\SOFTWARE\WOW6432Node\Valve\Steam' -EA SilentlyContinue).InstallPath } catch {}
if (-not $steamInstall) { try { $steamInstall = (Get-ItemProperty 'HKLM:\SOFTWARE\Valve\Steam' -EA SilentlyContinue).InstallPath } catch {} }
try {
  Add-Type -TypeDefinition @'
${ICON_HELPER_CS}
'@ -ReferencedAssemblies System.Drawing -EA SilentlyContinue
} catch {}
$apps = Get-StartApps | ForEach-Object {
  $appId = $_.AppID; $name = $_.Name; $iconPath = $null; $exePath = $null
  if ($appId -match '^steam://rungameid/(\d+)$') {
    # Steam game: use library cache icon (most reliable), fall back to Uninstall registry
    $steamId = $Matches[1]
    if ($steamInstall) {
      $cacheIcon = Join-Path $steamInstall ("appcache\librarycache\" + $steamId + "_icon.jpg")
      if (Test-Path $cacheIcon) { $iconPath = $cacheIcon }
    }
    if (-not $iconPath) {
      try {
        $reg = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Steam App $steamId" -ErrorAction SilentlyContinue
        if ($reg -and $reg.DisplayIcon) {
          $iconExe = ($reg.DisplayIcon -split ',')[0].Trim('" ')
          if ($iconExe -and (Test-Path $iconExe)) { $exePath = $iconExe }
        }
      } catch {}
    }
  } elseif ($appId -match '^(.+)!.+$') {
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
             Where-Object { $_.BaseName -ieq $name -or $name -ilike ('*' + $_.BaseName + '*') -or $_.BaseName -ilike ('*' + $name + '*') } | Select-Object -First 1
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
  if (-not $iconPath -and -not $exePath -and $appId -match '^\{[0-9A-Fa-f-]+\}\\\\(.+\.exe)$') {
    $relPath = $Matches[1]
    $searchDirs = @($env:ProgramFiles, \${env:ProgramFiles(x86)}, "$env:LOCALAPPDATA\Programs")
    foreach ($dir in $searchDirs) {
      if ($dir) {
        $fullPath = Join-Path $dir $relPath
        if (Test-Path $fullPath) { $exePath = $fullPath; break }
      }
    }
  }
  $exeIconB64 = $null
  if ($exePath -and -not $iconPath) {
    try { $exeIconB64 = [IconHelper]::GetBase64($exePath) } catch {}
  }
  [PSCustomObject]@{ Name=$name; AppID=$appId; IconPath=$iconPath; ExePath=$exePath; ExeIconB64=$exeIconB64 }
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
                // Must have an icon source, OR be a known launchable protocol (Steam etc.)
                && (item.IconPath || item.ExePath || /^steam:\/\//.test(item.AppID)))
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
              } else if (item.ExeIconB64) {
                try {
                  const img = trimIcon(nativeImage.createFromBuffer(Buffer.from(item.ExeIconB64, 'base64')));
                  if (!img.isEmpty()) iconDataUrl = img.toDataURL();
                } catch { /* skip */ }
              }
              if (!iconDataUrl && item.ExePath) {
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
    // Steam URLs and other protocol-based IDs are stored as-is; everything else uses shell:AppsFolder
    const appPath = /^[a-z][a-z0-9+.-]*:\/\//i.test(appId) ? appId : `shell:AppsFolder\\${appId}`;
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      path: appPath,
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

// Extract a 256×256 icon from an executable via the Windows jumbo image list.
// Spawns a short PowerShell process (~1-2 s first call due to C# compilation).
function getJumboIconBase64(exePath) {
  return new Promise((resolve) => {
    const escaped = exePath.replace(/'/g, "''");
    const ps = `try {
  Add-Type -TypeDefinition @'
${ICON_HELPER_CS}
'@ -ReferencedAssemblies System.Drawing -EA SilentlyContinue
} catch {}
$b = [IconHelper]::GetBase64('${escaped}')
if ($b) { Write-Output $b }`;
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
      { windowsHide: true, stdio: 'pipe', timeout: 15000 },
      (err, stdout) => resolve(stdout ? stdout.trim() : null)
    );
  });
}

async function buildAppEntry(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // For .lnk files, resolve the icon source via Electron's native readShortcutLink.
  // Prefer the explicit icon field; fall back to target (only if it's a file, not a folder).
  let iconSourcePath = filePath;
  if (path.extname(filePath).toLowerCase() === '.lnk') {
    try {
      const info = shell.readShortcutLink(filePath);
      if (info.icon) {
        const r = resolveIconPath(info.icon);
        if (r) iconSourcePath = r;
      }
      if (iconSourcePath === filePath && info.target) {
        const r = resolveIconPath(info.target) || info.target;
        try {
          if (fs.existsSync(r) && !fs.statSync(r).isDirectory()) iconSourcePath = r;
        } catch { /* ignore */ }
      }
    } catch { /* fall through to .lnk itself */ }
  }

  let iconDataUrl = '';
  const srcExt = path.extname(iconSourcePath).toLowerCase();
  const imageExts = new Set(['.ico', '.png', '.jpg', '.jpeg', '.bmp']);
  const execExts = new Set(['.exe', '.dll', '.cpl', '.scr']);

  if (imageExts.has(srcExt)) {
    // Image file: read at native resolution (supports 256×256 .ico)
    try {
      const img = trimIcon(nativeImage.createFromPath(iconSourcePath));
      if (!img.isEmpty()) iconDataUrl = img.toDataURL();
    } catch { /* fall through */ }
  } else if (execExts.has(srcExt)) {
    // Executable: use jumbo (256×256) extraction, fall back to getFileIcon
    const b64 = await getJumboIconBase64(iconSourcePath);
    if (b64) {
      try {
        const img = trimIcon(nativeImage.createFromBuffer(Buffer.from(b64, 'base64')));
        if (!img.isEmpty()) iconDataUrl = img.toDataURL();
      } catch { /* fall through */ }
    }
  }
  if (!iconDataUrl) {
    try {
      const img = trimIcon(await app.getFileIcon(iconSourcePath, { size: 'large' }));
      if (!img.isEmpty()) iconDataUrl = img.toDataURL();
    } catch { /* leave empty */ }
  }
  return { id, name, path: filePath, iconDataUrl };
}

module.exports = { setupIPC };
