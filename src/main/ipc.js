const { ipcMain, dialog, shell, app, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { randomUUID } = require('crypto');
const { checkForUpdates } = require('./updater');
const { refreshTrayMenu } = require('./tray');
const { trimIcon } = require('./icon-trim');
const { encodeIcons } = require('./icon-worker');

// Derive valid theme identifiers from the CSS files on disk.
// This automatically stays in sync when themes are added or removed.
const VALID_THEMES = new Set(
  fs.readdirSync(path.join(__dirname, '../renderer/styles/themes'))
    .filter(f => f.endsWith('.css'))
    .map(f => f.slice(0, -4))
);

// C# type injected into PowerShell for high-quality icon/thumbnail extraction.
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
[StructLayout(LayoutKind.Sequential)]
public struct ThumbSize { public int cx; public int cy; }
[StructLayout(LayoutKind.Sequential)]
public struct BmpInfoHdr {
  public int biSize, biWidth, biHeight; public short biPlanes, biBitCount;
  public int biCompression, biSizeImage, biXPels, biYPels, biClrUsed, biClrImportant;
}
[StructLayout(LayoutKind.Sequential)]
public struct BmpInfo { public BmpInfoHdr hdr; public int colors; }
[ComImport, Guid("bcc18b79-ba16-442f-80c4-8a59c30c463b"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IShellItemImageFactory {
  [PreserveSig] int GetImage([In] ThumbSize sz, [In] int flags, out IntPtr phbm);
}
public static class IconHelper {
  [DllImport("shell32.dll", CharSet = CharSet.Auto)]
  static extern IntPtr SHGetFileInfo(string p, uint a, ref ShFI s, uint sz, uint f);
  [DllImport("shell32.dll")]
  static extern int SHGetImageList(int n, ref Guid g, out IImageList2 v);
  [DllImport("user32.dll")]
  static extern bool DestroyIcon(IntPtr h);
  [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
  static extern int SHCreateItemFromParsingName(string path, IntPtr pbc, ref Guid riid, out IShellItemImageFactory ppv);
  [DllImport("gdi32.dll")] static extern bool DeleteObject(IntPtr h);
  [DllImport("gdi32.dll")] static extern IntPtr CreateCompatibleDC(IntPtr h);
  [DllImport("gdi32.dll")] static extern bool DeleteDC(IntPtr h);
  [DllImport("gdi32.dll")] static extern int GetDIBits(IntPtr dc, IntPtr bm, uint s, uint l, byte[] b, ref BmpInfo bi, uint u);
  // 256x256 icon from the jumbo system image list (exe, lnk, cpl, etc.)
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
  // Shell thumbnail via IShellItemImageFactory.
  // Uses GetDIBits to read raw BGRA pixel data so the alpha channel is preserved
  // (Image.FromHbitmap strips alpha, turning transparent areas white).
  public static string GetThumbnailBase64(string path) {
    try {
      var riid = new Guid("bcc18b79-ba16-442f-80c4-8a59c30c463b");
      IShellItemImageFactory fac;
      if (SHCreateItemFromParsingName(path, IntPtr.Zero, ref riid, out fac) != 0) return null;
      var sz = new ThumbSize { cx = 256, cy = 256 };
      IntPtr hbm = IntPtr.Zero;
      if (fac.GetImage(sz, 0, out hbm) != 0 || hbm == IntPtr.Zero) return null;
      try {
        const int W = 256, H = 256;
        var bi = new BmpInfo();
        bi.hdr.biSize = Marshal.SizeOf(typeof(BmpInfoHdr));
        bi.hdr.biWidth = W; bi.hdr.biHeight = -H;
        bi.hdr.biPlanes = 1; bi.hdr.biBitCount = 32;
        bi.hdr.biCompression = 0;
        var pix = new byte[W * H * 4];
        var hdc = CreateCompatibleDC(IntPtr.Zero);
        try { GetDIBits(hdc, hbm, 0, (uint)H, pix, ref bi, 0); }
        finally { DeleteDC(hdc); }
        // If no pixel has non-zero alpha the channel is absent — make fully opaque
        bool hasAlpha = false;
        for (int i = 3; i < pix.Length; i += 4) { if (pix[i] != 0) { hasAlpha = true; break; } }
        if (!hasAlpha) for (int i = 3; i < pix.Length; i += 4) pix[i] = 255;
        using (var result = new Bitmap(W, H, System.Drawing.Imaging.PixelFormat.Format32bppArgb)) {
          var bd = result.LockBits(new Rectangle(0, 0, W, H),
                                   System.Drawing.Imaging.ImageLockMode.WriteOnly,
                                   System.Drawing.Imaging.PixelFormat.Format32bppArgb);
          Marshal.Copy(pix, 0, bd.Scan0, pix.Length);
          result.UnlockBits(bd);
          using (var ms = new MemoryStream()) {
            result.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
            return Convert.ToBase64String(ms.ToArray());
          }
        }
      } finally { DeleteObject(hbm); }
    } catch { return null; }
  }
}`;

// Pre-compiled DLL path — avoids inline Add-Type -TypeDefinition which triggers
// antivirus heuristics (Bitdefender et al. flag inline C# + DllImport as malicious).
// We compile once with csc.exe (async, at startup) and cache the DLL in userData.
let _iconHelperDll = null;

// Async compilation — called once at startup, never blocks the main thread.
function compileIconHelperDll() {
  return new Promise((resolve) => {
    const dllPath = path.join(app.getPath('userData'), 'ql-icon-helper.dll');
    if (fs.existsSync(dllPath)) { _iconHelperDll = dllPath; return resolve(dllPath); }
    const winDir = process.env.WINDIR || 'C:\\Windows';
    const candidates = [
      path.join(winDir, 'Microsoft.NET', 'Framework64', 'v4.0.30319', 'csc.exe'),
      path.join(winDir, 'Microsoft.NET', 'Framework', 'v4.0.30319', 'csc.exe'),
    ];
    const csc = candidates.find(c => fs.existsSync(c));
    if (!csc) return resolve(null);
    const csPath = path.join(app.getPath('temp'), 'QLIconHelper.cs');
    try { fs.writeFileSync(csPath, ICON_HELPER_CS); } catch { return resolve(null); }
    execFile(csc, [
      '/target:library', '/reference:System.Drawing.dll',
      '/nologo', '/optimize', `/out:${dllPath}`, csPath
    ], { windowsHide: true, timeout: 30000 }, (err) => {
      try { fs.unlinkSync(csPath); } catch { /* ignore */ }
      if (!err && fs.existsSync(dllPath)) { _iconHelperDll = dllPath; resolve(dllPath); }
      else resolve(null);
    });
  });
}

// Returns the PowerShell snippet to load the icon helper.
// Uses pre-compiled DLL (AV-safe) or falls back to inline Add-Type (legacy).
function iconHelperLoadSnippet() {
  if (_iconHelperDll) return `Add-Type -Path '${_iconHelperDll.replace(/'/g, "''")}'`;
  return `Add-Type -TypeDefinition @'\n${ICON_HELPER_CS}\n'@ -ReferencedAssemblies System.Drawing -EA SilentlyContinue`;
}

// trimIcon (crop background padding from an icon) lives in icon-trim.js, shared
// with the picker's icon helper renderer.

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

// Guard against concurrent get-installed-apps invocations (e.g. rapidly opening the picker).
// Returns the in-flight promise if one is already running.
let installedAppsPromise = null;

function setupIPC(win, store, electronApp) {
  // Compile icon helper DLL in the background (async, non-blocking).
  // Must finish before any icon extraction calls use iconHelperLoadSnippet().
  compileIconHelperDll();

  // Authoritative list of theme identifiers, derived from the CSS files on disk
  // (see VALID_THEMES module constant). Renderer calls this at startup to stay in sync.
  ipcMain.handle('get-valid-themes', () => [...VALID_THEMES]);

  ipcMain.handle('get-apps', () => store.get('apps'));

  ipcMain.handle('save-apps', (_, apps) => {
    if (!Array.isArray(apps)) return;
    // Validate and strip to known shape; silently drop malformed entries
    const sanitized = apps
      .filter(a => a && typeof a === 'object')
      .map(a => ({
        id:          typeof a.id          === 'string' ? a.id          : '',
        name:        typeof a.name        === 'string' ? a.name.slice(0, 100) : '',
        path:        typeof a.path        === 'string' ? a.path        : '',
        iconDataUrl: typeof a.iconDataUrl === 'string' ? a.iconDataUrl : '',
      }))
      .filter(a => a.id && a.path);
    // setFromRenderer, not set: right after a read-only store merged the data
    // file mid-session, this save may come from the renderer's pre-merge copy.
    store.setFromRenderer('apps', sanitized);
  });

  ipcMain.handle('get-settings', () => store.get('settings'));

  ipcMain.handle('save-settings', (_, settings) => {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return;
    const current = store.get('settings');
    const sanitized = { ...current };

    if (typeof settings.iconSize === 'number'
        && settings.iconSize >= 32 && settings.iconSize <= 128) {
      sanitized.iconSize = settings.iconSize;
    }
    if (typeof settings.startWithWindows === 'boolean') {
      sanitized.startWithWindows = settings.startWithWindows;
    }
    if (typeof settings.randomTheme === 'boolean') {
      sanitized.randomTheme = settings.randomTheme;
    }
    if (typeof settings.theme === 'string' && VALID_THEMES.has(settings.theme)) {
      sanitized.theme = settings.theme;
    }
    // windowPosition / windowSize are not taken from the renderer: window.js
    // saves them on every move and resize, while the renderer only echoes the
    // copy it fetched at init() — accepting it put the window back where it
    // was at launch whenever any setting changed.
    // globalHotkey: accept null (disabled), or a non-empty string up to 64 chars.
    // String shape is validated lazily by globalShortcut.register at apply time.
    if (settings.globalHotkey === null || settings.globalHotkey === '') {
      sanitized.globalHotkey = null;
    } else if (typeof settings.globalHotkey === 'string' && settings.globalHotkey.length <= 64) {
      sanitized.globalHotkey = settings.globalHotkey;
    }
    if (typeof settings.reducedMotion === 'boolean') {
      sanitized.reducedMotion = settings.reducedMotion;
    }
    store.setFromRenderer('settings', sanitized); // see save-apps
    // The tray's "Start with Windows" and "Random theme on startup" checkboxes
    // are read when its menu is built: rebuild it so it matches the Settings
    // overlay.
    const saved = store.get('settings') || {};
    if (saved.startWithWindows !== current.startWithWindows
        || saved.randomTheme !== current.randomTheme) refreshTrayMenu();
  });

  ipcMain.handle('launch-app', async (_, filePath) => {
    if (typeof filePath !== 'string' || !filePath) return;

    // Only launch paths that are in the stored app list, or known-safe protocol URIs
    const storedApps = store.get('apps') || [];
    const matchedApp = storedApps.find(a => a.path === filePath);
    const isProtocol = filePath.startsWith('shell:') || filePath.startsWith('steam://');
    const isKnown = !!matchedApp || isProtocol;
    if (!isKnown) return;

    // Display name for error reporting (renderer surfaces this verbatim)
    const displayName = matchedApp ? matchedApp.name : filePath;

    // Helper: report a launch failure back to the renderer, where it's surfaced
    // via the update-banner channel. Plain-language reason, lightweight overlay.
    // Per Judy's UX Review (2026-04-25, §10 / Critical C3): silent failure was
    // a major NN/g "help users recover from errors" violation — clicking a tile
    // that pointed at a missing/broken target produced no feedback at all.
    const reportFailure = (reason) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('launch-error', { name: displayName, reason });
      }
    };

    if (isProtocol) {
      // Use explorer.exe for shell: URIs (Store apps) and steam:// URLs.
      // explorer.exe always exits 1 even on success, so we can't reliably
      // detect failure here — leave silent. Errors here are extremely rare
      // (Store apps that have been uninstalled fall back to "open with"
      // dialog which is itself a form of feedback).
      execFile('explorer.exe', [filePath], { windowsHide: false, stdio: 'pipe' }, () => {});
      return;
    }

    // Filesystem path: pre-flight existence check so we can give a clear
    // reason. shell.openPath returns a non-empty string on failure but its
    // messages are inconsistent across Windows versions and AV interactions.
    try {
      if (!fs.existsSync(filePath)) {
        reportFailure('TARGET MISSING');
        return;
      }
    } catch {
      reportFailure('TARGET UNREADABLE');
      return;
    }

    try {
      const errMsg = await shell.openPath(filePath);
      if (errMsg) {
        // shell.openPath resolves with an error string when the OS refused.
        reportFailure('LAUNCH FAILED');
      }
    } catch {
      reportFailure('LAUNCH FAILED');
    }
  });

  ipcMain.handle('get-installed-apps', () => {
    if (installedAppsPromise) return installedAppsPromise;

    installedAppsPromise = new Promise((resolve) => {
      const ps = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
# Each path is parenthesised: PowerShell's comma binds tighter than '+', so
# @(a + 'x', b + 'y') is ONE garbage string, which made every .lnk lookup
# below find nothing and dropped most desktop apps from the picker.
$startDirs = @(([Environment]::GetFolderPath('ApplicationData') + '\\Microsoft\\Windows\\Start Menu\\Programs'), ([Environment]::GetFolderPath('CommonApplicationData') + '\\Microsoft\\Windows\\Start Menu\\Programs'))
$wsh = New-Object -ComObject WScript.Shell
# Walk the Start Menu once (not once per app) into an exact-name index.
# Exact match only: a loose contains-match hands out other apps' icons
# ("Access" -> "Accessibility..."); entries with no exact .lnk fall through to
# the shell's own Start icon below, which is always the right one.
$allLnk = @(Get-ChildItem -Path $startDirs -Filter '*.lnk' -Recurse -ErrorAction SilentlyContinue)
$lnkByName = @{}
foreach ($l in $allLnk) {
  $k = $l.BaseName.ToLowerInvariant()
  if (-not $lnkByName.ContainsKey($k)) { $lnkByName[$k] = $l }
}
function Find-StartLnk([string]$appName) {
  if (-not $appName) { return $null }
  return $lnkByName[$appName.ToLowerInvariant()]
}
$pkgMap = @{}
Get-AppxPackage -ErrorAction SilentlyContinue | ForEach-Object { $pkgMap[$_.PackageFamilyName] = $_ }
$steamInstall = $null
try { $steamInstall = (Get-ItemProperty 'HKLM:\\SOFTWARE\\WOW6432Node\\Valve\\Steam' -EA SilentlyContinue).InstallPath } catch {}
if (-not $steamInstall) { try { $steamInstall = (Get-ItemProperty 'HKLM:\\SOFTWARE\\Valve\\Steam' -EA SilentlyContinue).InstallPath } catch {} }
try { ${iconHelperLoadSnippet()} } catch {}
$apps = Get-StartApps | ForEach-Object {
  $appId = $_.AppID; $name = $_.Name; $iconPath = $null; $exePath = $null
  if ($appId -match '^steam://rungameid/(\\d+)$') {
    # Steam game: use library cache icon (most reliable), fall back to Uninstall registry
    $steamId = $Matches[1]
    if ($steamInstall) {
      $cacheIcon = Join-Path $steamInstall ("appcache\\librarycache\\" + $steamId + "_icon.jpg")
      if (Test-Path $cacheIcon) { $iconPath = $cacheIcon }
    }
    if (-not $iconPath) {
      try {
        $reg = Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App $steamId" -ErrorAction SilentlyContinue
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
        $mf = Get-AppxPackageManifest -Package $pkg.PackageFullName -EA SilentlyContinue
        # Application may be a single node or an array — always work with the first entry
        $appNodes = $mf.Package.Applications.Application
        $appNode  = if ($appNodes -is [System.Array]) { $appNodes[0] } else { $appNodes }
        $ve = try { $appNode.VisualElements } catch { $null }
        $logoRel = $null
        try { $logoRel = $ve.Square150x150Logo } catch {}
        if (-not $logoRel) { try { $logoRel = $ve.Square44x44Logo } catch {} }
        if (-not $logoRel) { try { $logoRel = $ve.Square71x71Logo  } catch {} }
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
            # Prefer highest-resolution scaled/targetsize variant
            $found = Get-ChildItem -Path $fullDir -Filter "$logoBase*$logoExt" -EA SilentlyContinue |
                     Sort-Object {
                       if ($_.Name -match 'targetsize-(\\d+)') { [int]$Matches[1] * -1 }
                       elseif ($_.Name -match 'scale-(\\d+)')  { [int]$Matches[1] * -1 }
                       else { 0 }
                     } | Select-Object -First 1
            if ($found) { $iconPath = $found.FullName }
          }
        }
        # Fallback: grab the package's main executable so SHGetImageList can extract its icon
        if (-not $iconPath -and $appNode -and $appNode.Executable) {
          $exeRel = $appNode.Executable -replace '/', '\\'
          $exeCandidate = Join-Path $pkg.InstallLocation $exeRel
          if (Test-Path $exeCandidate) { $exePath = $exeCandidate }
        }
      }
    } catch {}
  }
  # Fallback: if no icon found yet, try Start Menu shortcut (covers Win32 apps and
  # MSIX/Click-to-Run apps not listed by Get-AppxPackage e.g. Office 2021)
  # (Not for URL/protocol IDs: those never had .lnk icons, and web links /
  # non-Steam protocols can't be launched by launch-app, so they stay hidden.)
  if (-not $iconPath -and -not $exePath -and $appId -notmatch '^[a-z][a-z0-9+.-]*://') {
    try {
      $lnk = Find-StartLnk $name
      if ($lnk) {
        $sc = $wsh.CreateShortcut($lnk.FullName)
        if ($sc.IconLocation -and $sc.IconLocation -notmatch '^\\s*,') {
          $iconExe = ($sc.IconLocation -split ',')[0].Trim()
          if ($iconExe -and (Test-Path $iconExe)) { $exePath = $iconExe }
        }
        if (-not $exePath -and $sc.TargetPath -and (Test-Path $sc.TargetPath)) {
          $exePath = $sc.TargetPath
        }
        # Target in WindowsApps or other protected path: fall back to the .lnk itself.
        # SHGetFileInfo on a .lnk resolves the icon through the shell cache regardless.
        if (-not $exePath -and -not $iconPath) { $exePath = $lnk.FullName }
      }
    } catch {}
  }
  # Resolve GUID-based AUMID like {GUID}\\path\\app.exe (e.g. BOINC, older Win32 apps)
  if (-not $iconPath -and -not $exePath -and $appId -match '^\\{[0-9A-Fa-f-]+\\}\\\\(.+\\.exe)$') {
    $relPath = $Matches[1]
    $searchDirs = @($env:ProgramFiles, \${env:ProgramFiles(x86)}, "$env:LOCALAPPDATA\\Programs")
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
  # Last resort: ask the shell for the icon it shows in Start. Works for AppX
  # (WindowsApps is inaccessible), System32/Windows known-folder IDs, localized
  # names with no matching .lnk, and plain AUMIDs — every Start entry except
  # URL/protocol IDs (web links that launch-app can't open).
  $shellIconB64 = $null
  if (-not $iconPath -and -not $exeIconB64 -and $appId -notmatch '^[a-z][a-z0-9+.-]*://') {
    try { $shellIconB64 = [IconHelper]::GetThumbnailBase64("shell:AppsFolder\\$appId") } catch {}
  }
  [PSCustomObject]@{ Name=$name; AppID=$appId; IconPath=$iconPath; ExePath=$exePath; ExeIconB64=$exeIconB64; ShellIconB64=$shellIconB64 }
}
# Fallback: Get-StartApps returned nothing (broken on some Windows 11 builds).
# Scan Start Menu .lnk files directly as a reliable alternative.
if (-not $apps -or @($apps).Count -eq 0) {
  $apps = $allLnk |
    Where-Object { $_.Name -notmatch '^\s*$' } |
    ForEach-Object {
      $lnkFile = $_
      $name = [IO.Path]::GetFileNameWithoutExtension($lnkFile.Name)
      $exePath = $null; $exeIconB64 = $null
      try {
        $sc = $wsh.CreateShortcut($lnkFile.FullName)
        if ($sc.IconLocation -and $sc.IconLocation -notmatch '^\s*,') {
          $p = ($sc.IconLocation -split ',')[0].Trim()
          $p = [Environment]::ExpandEnvironmentVariables($p)
          if ($p -and (Test-Path $p)) { $exePath = $p }
        }
        if (-not $exePath -and $sc.TargetPath) {
          $p = [Environment]::ExpandEnvironmentVariables($sc.TargetPath)
          try { if ($p -and (Test-Path $p)) { $exePath = $p } } catch {}
        }
        if (-not $exePath) { $exePath = $lnkFile.FullName }
        try { $exeIconB64 = [IconHelper]::GetBase64($exePath) } catch {}
      } catch {}
      [PSCustomObject]@{ Name=$name; AppID=$lnkFile.FullName; IconPath=$null; ExePath=$exePath; ExeIconB64=$exeIconB64; ShellIconB64=$null }
    }
}
$apps | ConvertTo-Json -Depth 2
`;
      execFile('powershell.exe',
        ['-NoProfile', '-NonInteractive', '-Command', ps],
        { windowsHide: true, stdio: 'pipe', timeout: 45000, maxBuffer: 64 * 1024 * 1024 },
        async (err, stdout, stderr) => {
          installedAppsPromise = null;
          if (err || !stdout) {
            // Previously silent: a timeout / crash looked exactly like "no apps".
            console.warn('[get-installed-apps] scan failed:',
              err ? (err.killed ? `killed (timeout ${err.signal || ''})` : (err.code || err.message)) : 'empty output',
              stderr ? String(stderr).slice(0, 2000) : '');
            resolve([]);
            return;
          }
          try {
            let data = JSON.parse(stdout.trim());
            if (!Array.isArray(data)) data = data ? [data] : [];
            const items = data
              .filter(item => item.Name && item.AppID
                // Skip document/URL shortcuts dumped into the Start Menu by installers
                && !/\.(txt|htm|html|pdf|rtf|url|chm|doc|docx|md)(\b|$)/i.test(item.AppID)
                // Must have an icon source, OR be a known launchable protocol (Steam/AppX etc.)
                && (item.IconPath || item.ExePath || item.ExeIconB64 || item.ShellIconB64
                    || /^steam:\/\//.test(item.AppID)
                    || /^[^!\\]+![^!\\]+$/.test(item.AppID)))
              .sort((a, b) => a.Name.localeCompare(b.Name));
            // Icon bytes per item (same precedence as ever: image file, then the
            // C# helper's exe icon, then the shell icon). Files are read without
            // blocking; the decode → trim → re-encode step runs off the main
            // thread in the icon helper (icon-worker.js), with identical output.
            const jobs = await Promise.all(items.map(async (item) => {
              if (item.IconPath) {
                try { return { buf: await fs.promises.readFile(item.IconPath), requireNonEmpty: false }; }
                catch { return null; }
              }
              if (item.ExeIconB64) return { b64: item.ExeIconB64, requireNonEmpty: true };
              if (item.ShellIconB64) return { b64: item.ShellIconB64, requireNonEmpty: true };
              return null;
            }));
            const urls = await encodeIcons(jobs);
            // Fallback for items still without an icon — getFileIcon calls are independent
            const result = await Promise.all(items.map(async (item, i) => {
              let iconDataUrl = urls[i] || '';
              if (!iconDataUrl && item.ExePath) {
                try {
                  const img = trimIcon(await app.getFileIcon(item.ExePath, { size: 'large' }));
                  iconDataUrl = img.toDataURL();
                } catch { /* skip */ }
              }
              return { name: item.Name, appId: item.AppID, iconDataUrl };
            }));
            resolve(result);
          } catch (e) {
            console.warn('[get-installed-apps] could not parse scan output:', e && e.message);
            resolve([]);
          }
        }
      );
    });

    return installedAppsPromise;
  });

  ipcMain.handle('add-app-from-appid', (_, { name, appId, iconDataUrl }) => {
    // Steam URLs and other protocol-based IDs are stored as-is; everything else uses shell:AppsFolder.
    // Exception: a full Start Menu .lnk path (the IDs the Get-StartApps-empty fallback emits) is
    // not an AppsFolder name — store it as a file path so launch-app opens it via shell.openPath.
    const isLnkPath = /^[a-z]:\\.+\.lnk$/i.test(appId);
    const appPath = (isLnkPath || /^[a-z][a-z0-9+.-]*:\/\//i.test(appId)) ? appId : `shell:AppsFolder\\${appId}`;
    return {
      id: randomUUID(),
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
    if (typeof filePath !== 'string') return null;
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.exe' && ext !== '.lnk') return null;
    try {
      if (!fs.existsSync(filePath)) return null;
    } catch { return null; }
    return buildAppEntry(filePath);
  });

  ipcMain.handle('resize-window', (_, { width, height }) => {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    win.setContentSize(
      Math.min(Math.max(width, 200), sw),
      Math.min(Math.max(height, 150), sh)
    );
  });

  ipcMain.handle('set-auto-launch', (_, enabled) => {
    if (!electronApp.isPackaged) return; // dev builds must not touch the startup registry
    const desiredOpenAtLogin = !!enabled;
    const current = electronApp.getLoginItemSettings();
    // Skip the registry write when state already matches — keeps auto-launch idempotent
    // so repeated toggles (or startup re-application) don't churn the Run key.
    if (current.openAtLogin === desiredOpenAtLogin) return;
    electronApp.setLoginItemSettings({
      openAtLogin: desiredOpenAtLogin,
      path: electronApp.getPath('exe')
    });
  });

  ipcMain.handle('check-update', () => {
    checkForUpdates();
  });

  ipcMain.handle('show-window', () => win.show());
  ipcMain.handle('hide-window', () => win.hide());

  let preFullscreenBounds = null;

  function exitFullscreen() {
    win.setFullScreen(false);
    if (preFullscreenBounds) {
      win.setBounds(preFullscreenBounds);
      preFullscreenBounds = null;
    }
    win.webContents.send('fullscreen-changed', false);
  }

  ipcMain.handle('toggle-fullscreen', () => {
    if (win.isFullScreen()) {
      exitFullscreen();
      return false;
    } else {
      preFullscreenBounds = win.getBounds();
      win.setFullScreen(true);
      return true;
    }
  });

  // Renderer-scoped Escape handling (see 'exit-fullscreen' handler below).
  ipcMain.handle('exit-fullscreen', () => {
    if (win.isFullScreen()) {
      exitFullscreen();
      return false;
    }
    return win.isFullScreen();
  });
}

// Remove a solid background color from a thumbnail image using BFS flood-fill from
// the four corners. Works for any background color (black, white, grey, etc.).
// Returns a new NativeImage with the background pixels made transparent, or the
// original image if no solid background is detected.
function removeSolidBackground(img) {
  const { width: W, height: H } = img.getSize();
  if (W < 4 || H < 4) return img;
  const src = img.toBitmap(); // raw BGRA

  const idx = (x, y) => (y * W + x) * 4;
  const corner = (x, y) => { const i = idx(x, y); return [src[i], src[i+1], src[i+2], src[i+3]]; };
  const corners = [corner(0,0), corner(W-1,0), corner(0,H-1), corner(W-1,H-1)];

  // All corners must be opaque for solid-background detection
  if (!corners.every(c => c[3] > 200)) return img;

  // Average the corner colors to get the background reference
  const bgB = Math.round(corners.reduce((s,c) => s+c[0], 0) / 4);
  const bgG = Math.round(corners.reduce((s,c) => s+c[1], 0) / 4);
  const bgR = Math.round(corners.reduce((s,c) => s+c[2], 0) / 4);
  // Use a wider tolerance for near-black or near-white backgrounds — anti-aliasing
  // fringing at folder icon edges can push corner pixels several units off pure black/white.
  const tol = (bgR + bgG + bgB < 80 || bgR + bgG + bgB > 680) ? 40 : 22;
  const isBg = (b, g, r, a) =>
    a > 200 && Math.abs(b-bgB) < tol && Math.abs(g-bgG) < tol && Math.abs(r-bgR) < tol;

  // At least 3 of 4 corners must agree on the background color (1 corner may be occluded
  // by a folder icon edge, especially on near-full-bleed folder thumbnail images).
  if (corners.filter(c => isBg(c[0], c[1], c[2], c[3])).length < 3) return img;

  // BFS flood-fill from the four corners to erase the background
  const buf = Buffer.from(src);
  const vis = new Uint8Array(W * H);
  const q = [0, W-1, (H-1)*W, (H-1)*W + W-1];
  q.forEach(p => (vis[p] = 1));

  for (let qi = 0; qi < q.length; qi++) {
    const p = q[qi];
    const pi = p * 4;
    if (!isBg(buf[pi], buf[pi+1], buf[pi+2], buf[pi+3])) continue;
    buf[pi+3] = 0; // transparent
    const x = p % W, y = (p / W) | 0;
    if (x > 0     && !vis[p-1]) { vis[p-1] = 1; q.push(p-1); }
    if (x < W-1   && !vis[p+1]) { vis[p+1] = 1; q.push(p+1); }
    if (y > 0     && !vis[p-W]) { vis[p-W] = 1; q.push(p-W); }
    if (y < H-1   && !vis[p+W]) { vis[p+W] = 1; q.push(p+W); }
  }

  return nativeImage.createFromBuffer(buf, { width: W, height: H });
}

// Extract a shell thumbnail (folder stack preview, file preview) via IShellItemImageFactory.
// Path is passed via environment variable to avoid PowerShell injection via special characters.
function getFolderThumbnailBase64(folderPath) {
  return new Promise((resolve) => {
    const ps = `try { ${iconHelperLoadSnippet()} } catch {}
$b = [IconHelper]::GetThumbnailBase64($env:QL_PATH)
if ($b) { Write-Output $b }`;
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
      { windowsHide: true, stdio: 'pipe', timeout: 15000, env: { ...process.env, QL_PATH: folderPath } },
      (err, stdout) => resolve(stdout ? stdout.trim() : null)
    );
  });
}

// Resolve a .lnk shortcut's icon path and target via PowerShell WScript.Shell.
// This is safer than Electron's shell.readShortcutLink(), which can hard-crash the
// main process on MSIX/AppX-generated shortcuts (the COM error is not catchable in JS).
// Path is passed via environment variable to avoid PowerShell injection.
function resolveShortcutLink(lnkPath) {
  return new Promise((resolve) => {
    const ps = `
$wsh = New-Object -ComObject WScript.Shell
try {
  $sc = $wsh.CreateShortcut($env:QL_PATH)
  $icon = $null; $target = $null
  if ($sc.IconLocation -and $sc.IconLocation -notmatch '^\\s*,') {
    $p = (($sc.IconLocation -split ',')[0]).Trim()
    $p = [Environment]::ExpandEnvironmentVariables($p)
    if ($p -and (Test-Path $p)) { $icon = $p }
  }
  if ($sc.TargetPath) {
    $target = [Environment]::ExpandEnvironmentVariables($sc.TargetPath)
  }
  @{ Icon = $icon; Target = $target } | ConvertTo-Json -Compress
} catch { '{}' }`;
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
      { windowsHide: true, stdio: 'pipe', timeout: 8000, env: { ...process.env, QL_PATH: lnkPath } },
      (err, stdout) => {
        if (err || !stdout) { resolve(null); return; }
        try {
          const r = JSON.parse(stdout.trim());
          resolve({ icon: r.Icon || null, target: r.Target || null });
        } catch { resolve(null); }
      }
    );
  });
}

// Extract a 256×256 icon from an executable via the Windows jumbo image list.
// Path is passed via environment variable to avoid PowerShell injection.
function getJumboIconBase64(exePath) {
  return new Promise((resolve) => {
    const ps = `try { ${iconHelperLoadSnippet()} } catch {}
$b = [IconHelper]::GetBase64($env:QL_PATH)
if ($b) { Write-Output $b }`;
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
      { windowsHide: true, stdio: 'pipe', timeout: 15000, env: { ...process.env, QL_PATH: exePath } },
      (err, stdout) => resolve(stdout ? stdout.trim() : null)
    );
  });
}

async function buildAppEntry(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  const id = randomUUID();

  // For .lnk files, resolve the icon source via PowerShell WScript.Shell.
  // (Replaces Electron's shell.readShortcutLink which hard-crashes on MSIX shortcuts.)
  // Prefer the explicit icon field; fall back to target (only if it's a file, not a folder).
  // Track directory targets separately so we can fetch a shell thumbnail.
  let iconSourcePath = filePath;
  let folderTarget = null;
  if (path.extname(filePath).toLowerCase() === '.lnk') {
    const info = await resolveShortcutLink(filePath);
    if (info) {
      if (info.icon) {
        const r = resolveIconPath(info.icon);
        if (r) iconSourcePath = r;
      }
      if (iconSourcePath === filePath && info.target) {
        const r = resolveIconPath(info.target) || info.target;
        try {
          if (fs.existsSync(r)) {
            if (fs.statSync(r).isDirectory()) folderTarget = r;
            else iconSourcePath = r;
          }
        } catch { /* ignore */ }
      }
    }
  }

  let iconDataUrl = '';
  const srcExt = path.extname(iconSourcePath).toLowerCase();
  const imageExts = new Set(['.ico', '.png', '.jpg', '.jpeg', '.bmp']);
  // .lnk included: SHGetFileInfo resolves the link and returns the target icon (no overlay)
  const execExts = new Set(['.exe', '.dll', '.cpl', '.scr', '.lnk']);

  // Folder target: try IShellItemImageFactory thumbnail (shows stack preview)
  if (folderTarget) {
    const b64 = await getFolderThumbnailBase64(folderTarget);
    if (b64) {
      try {
        const raw = nativeImage.createFromBuffer(Buffer.from(b64, 'base64'));
        const img = removeSolidBackground(raw);
        if (!img.isEmpty()) iconDataUrl = img.toDataURL();
      } catch { /* fall through */ }
    }
  }

  if (!iconDataUrl) {
    if (imageExts.has(srcExt)) {
      // Image file: read at native resolution (supports 256×256 .ico)
      try {
        const img = trimIcon(nativeImage.createFromPath(iconSourcePath));
        if (!img.isEmpty()) iconDataUrl = img.toDataURL();
      } catch { /* fall through */ }
    } else if (execExts.has(srcExt)) {
      // Executable / shortcut: use jumbo (256×256) extraction
      const b64 = await getJumboIconBase64(iconSourcePath);
      if (b64) {
        try {
          const img = trimIcon(nativeImage.createFromBuffer(Buffer.from(b64, 'base64')));
          if (!img.isEmpty()) iconDataUrl = img.toDataURL();
        } catch { /* fall through */ }
      }
      // Fallback: IShellItemImageFactory thumbnail (works for portable/standalone .exe)
      if (!iconDataUrl) {
        const tb64 = await getFolderThumbnailBase64(iconSourcePath);
        if (tb64) {
          try {
            const raw = nativeImage.createFromBuffer(Buffer.from(tb64, 'base64'));
            const img = removeSolidBackground(raw);
            if (!img.isEmpty()) iconDataUrl = img.toDataURL();
          } catch { /* fall through */ }
        }
      }
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

module.exports = { setupIPC, VALID_THEMES };
