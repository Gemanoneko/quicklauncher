const { ipcMain, dialog, shell, app, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { randomUUID, createHash } = require('crypto');
const { checkForUpdates, dismissals: updateDismissals, publish: publishUpdate } = require('./updater');
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
      if (SHGetFileInfo(path, 0, ref s, (uint)Marshal.SizeOf(s), 0x4000) == IntPtr.Zero) return null;
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
  // Let the shell interpret the shortcut's entire IconLocation, including
  // positive ordinals, negative resource IDs and paths containing commas.
  // Reject the generic document cache entry instead of overwriting a good icon.
  public static string GetShortcutBase64(string path) {
    try {
      var actual = new ShFI(); var generic = new ShFI();
      if (SHGetFileInfo(path, 0, ref actual, (uint)Marshal.SizeOf(actual), 0x4000) == IntPtr.Zero) return null;
      if (SHGetFileInfo("ql-icon.unknown", 0x80, ref generic, (uint)Marshal.SizeOf(generic), 0x4010) != IntPtr.Zero
          && actual.iIcon == generic.iIcon) return null;
      return GetBase64(path);
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
    const helperVersion = createHash('sha256').update(ICON_HELPER_CS).digest('hex').slice(0, 16);
    const dllPath = path.join(app.getPath('userData'), `ql-icon-helper-${helperVersion}.dll`);
    if (fs.existsSync(dllPath)) { _iconHelperDll = dllPath; return resolve(dllPath); }
    const winDir = process.env.WINDIR || 'C:\\Windows';
    const candidates = [
      path.join(winDir, 'Microsoft.NET', 'Framework64', 'v4.0.30319', 'csc.exe'),
      path.join(winDir, 'Microsoft.NET', 'Framework', 'v4.0.30319', 'csc.exe'),
    ];
    const csc = candidates.find(c => fs.existsSync(c));
    if (!csc) return resolve(null);
    const csPath = path.join(app.getPath('temp'), `QLIconHelper-${helperVersion}.cs`);
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

// Steam's current cache keeps icons under the app ID, named by content hash.
// Share this exact lookup between the picker and the one-time stored refresh.
const STEAM_ICON_LOOKUP = `
function Find-SteamIcon([string]$root, [string]$id) {
  if (-not $root -or $id -notmatch '^\\d+$') { return $null }
  $legacy = Join-Path $root ("appcache\\librarycache\\" + $id + "_icon.jpg")
  if (Test-Path -LiteralPath $legacy -PathType Leaf) { return $legacy }
  $folder = Join-Path $root ("appcache\\librarycache\\" + $id)
  $icon = Get-ChildItem -LiteralPath $folder -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '^[a-fA-F0-9]{40}\\.jpg$' } |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($icon) { return $icon.FullName }
  return $null
}
`;

function storedSteamIconPaths(ids) {
  if (!ids.length) return Promise.resolve([]);
  const ps = `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
${STEAM_ICON_LOOKUP}
$root = $null
try { $root = (Get-ItemProperty 'HKLM:\\SOFTWARE\\WOW6432Node\\Valve\\Steam' -EA SilentlyContinue).InstallPath } catch {}
if (-not $root) { try { $root = (Get-ItemProperty 'HKLM:\\SOFTWARE\\Valve\\Steam' -EA SilentlyContinue).InstallPath } catch {} }
if (-not $root) { try { $root = (Get-ItemProperty 'HKCU:\\Software\\Valve\\Steam' -EA SilentlyContinue).SteamPath } catch {} }
@($env:QL_STEAM_IDS -split ',' | ForEach-Object { $icon = Find-SteamIcon $root $_; if ($icon) { @{ Id = $_; IconPath = $icon } } }) | ConvertTo-Json -Compress`;
  return new Promise(resolve => execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
    { windowsHide: true, timeout: 15000, env: { ...process.env, QL_STEAM_IDS: ids.join(',') } }, (err, stdout) => {
      if (err) { resolve(null); return; }
      try { const data = stdout && stdout.trim() ? JSON.parse(stdout.trim()) : []; resolve(Array.isArray(data) ? data : data ? [data] : []); }
      catch { resolve(null); }
    }));
}

// Global settings a page may change, validated field by field. Only fields
// present in `settings` come back, so a caller sends a patch. The theme and
// the window rects are not global settings any more: themes belong to
// regions (controller), rects are saved by the main process.
function settingsPatch(settings) {
  const patch = {};
  if (typeof settings.sortShortcuts === 'boolean') patch.sortShortcuts = settings.sortShortcuts;
  if (typeof settings.regionTransparency === 'number' && Number.isFinite(settings.regionTransparency)) {
    patch.regionTransparency = Math.round(Math.max(0, Math.min(100, settings.regionTransparency)) / 5) * 5;
  }
  if (typeof settings.iconSize === 'number' && settings.iconSize >= 32 && settings.iconSize <= 128) {
    patch.iconSize = settings.iconSize;
  }
  if (typeof settings.startWithWindows === 'boolean') patch.startWithWindows = settings.startWithWindows;
  if (typeof settings.randomTheme === 'boolean') patch.randomTheme = settings.randomTheme;
  // globalHotkey: null (disabled), or a non-empty string up to 64 chars.
  // String shape is validated lazily by globalShortcut.register at apply time.
  if ('globalHotkey' in settings) {
    if (settings.globalHotkey === null || settings.globalHotkey === '') patch.globalHotkey = null;
    else if (typeof settings.globalHotkey === 'string' && settings.globalHotkey.length <= 64) patch.globalHotkey = settings.globalHotkey;
  }
  if (typeof settings.reducedMotion === 'boolean') patch.reducedMotion = settings.reducedMotion;
  return patch;
}

// A picker entry (Start menu AppID, Steam URL or Start menu .lnk) as a shortcut.
function entryFromAppId({ name, appId, iconDataUrl }) {
  if (typeof name !== 'string' || typeof appId !== 'string' || !name || !appId) return null;
  // Steam URLs and other protocol-based IDs are stored as-is; everything else uses shell:AppsFolder.
  // Exception: a full Start Menu .lnk path (the IDs the Get-StartApps-empty fallback emits) is
  // not an AppsFolder name — store it as a file path so launch-app opens it via shell.openPath.
  const isLnkPath = /^[a-z]:\\.+\.lnk$/i.test(appId);
  const appPath = (isLnkPath || /^[a-z][a-z0-9+.-]*:\/\//i.test(appId)) ? appId : `shell:AppsFolder\\${appId}`;
  return {
    id: randomUUID(),
    name: name.slice(0, 100),
    path: appPath,
    iconDataUrl: typeof iconDataUrl === 'string' ? iconDataUrl : '',
  };
}

const DIALOG_OPTS = {
  title: 'Add Application',
  // .url: Steam and web shortcuts (regions Q5).
  filters: [{ name: 'Applications & Shortcuts', extensions: ['exe', 'lnk', 'url'] }],
  properties: ['openFile'],
};

// ctl: RegionController, mgr: Manager. Every handler is scoped by the sender:
// a region page gets and saves its own region's items; the Manager gets the
// manager:* channels. A call from anything else is ignored.
function setupIPC(ctl, store, electronApp, mgr, { testHooks = false, quit = null } = {}) {
  // Compile icon helper DLL in the background (async, non-blocking).
  // Must finish before any icon extraction calls use iconHelperLoadSnippet().
  compileIconHelperDll().then(() => refreshStoredShortcutIcons(ctl, store)).catch(() => {});
  // Compile/cache only: no shell helper process is started until a user asks.
  require('./shell-menu').prepare().catch(() => {});

  const regionOf = (e) => ctl.regionIdOf(e.sender);
  const fromManager = (e) => mgr.isSender(e.sender);

  // Authoritative list of theme identifiers, derived from the CSS files on disk
  // (see VALID_THEMES module constant). Renderer calls this at startup to stay in sync.
  ipcMain.handle('get-valid-themes', () => [...VALID_THEMES]);

  ipcMain.handle('get-apps', (e) => {
    const id = regionOf(e);
    return id ? ctl.itemsForRenderer(id) : [];
  });

  ipcMain.handle('save-apps', (e, apps) => {
    const id = regionOf(e);
    if (!id || !Array.isArray(apps)) return;
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
    // The controller replaces only this region's items. Right after a
    // read-only store merged the data file mid-session, a save from a page
    // that still shows the pre-merge copy is merged against that copy.
    return ctl.saveItemsFromRenderer(id, sanitized);
  });

  ipcMain.handle('get-settings', (e) => {
    const id = regionOf(e);
    return id ? ctl.settingsFor(id) : store.get('settings');
  });

  ipcMain.handle('save-settings', (e, settings) => {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return;
    const id = regionOf(e);
    if (id) {
      // A region page has no settings UI of its own; only its theme (⚄) changes.
      ctl.applyRegionSettings(id, settings);
      return;
    }
    if (!fromManager(e)) return;
    const current = store.get('settings') || {};
    const result = ctl.applySettingsPatch(settingsPatch(settings));
    // The tray's "Start with Windows" and "Random theme on startup" checkboxes
    // are read when its menu is built: rebuild it so it matches the Manager.
    const saved = store.get('settings') || {};
    if (saved.startWithWindows !== current.startWithWindows
        || saved.randomTheme !== current.randomTheme) refreshTrayMenu();
    return result;
  });

  // Store delivery: each page says when it is listening, and acks a merged state.
  ipcMain.handle('renderer-ready', (e) => {
    const id = regionOf(e);
    if (id) ctl.rendererReady(id);
    else if (fromManager(e)) mgr.rendererReady();
  });
  ipcMain.handle('store-reload-ack', (e, seq) => {
    const id = regionOf(e);
    if (id) ctl.ack(id, seq);
  });

  // --ql-test-hooks: a launch is recorded, never run (a self-test must not
  // open an app window on Sergei's desktop). manager:test 'launches' reads it.
  const testLaunches = [];

  ipcMain.handle('launch-app', async (e, filePath) => {
    if (typeof filePath !== 'string' || !filePath) return;

    // Only launch paths that are in the stored app list, or known-safe protocol URIs
    const storedApps = store.get('apps') || [];
    const matchedApp = storedApps.find(a => a.path === filePath);
    const isProtocol = filePath.startsWith('shell:') || filePath.startsWith('steam://');
    const isKnown = !!matchedApp || isProtocol;
    if (!isKnown) return;
    if (testHooks) {
      testLaunches.push({ path: filePath, region: regionOf(e), at: Date.now() });
      return;
    }

    // Display name for error reporting (renderer surfaces this verbatim)
    const displayName = matchedApp ? matchedApp.name : filePath;
    // A moved shortcut whose file is gone shows the broken state from now on (spec 2.1).
    const noteMissing = () => { if (matchedApp && matchedApp.kind === 'moved') ctl.noteMissing(matchedApp.id); };

    // Helper: report a launch failure back to the renderer, where it's surfaced
    // via the update-banner channel. Plain-language reason, lightweight overlay.
    // Per Judy's UX Review (2026-04-25, §10 / Critical C3): silent failure was
    // a major NN/g "help users recover from errors" violation — clicking a tile
    // that pointed at a missing/broken target produced no feedback at all.
    // Shown in the region that launched it (spec 7.5).
    const reportFailure = (reason) => {
      if (e.sender && !e.sender.isDestroyed()) {
        e.sender.send('launch-error', { name: displayName, reason });
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
        noteMissing();
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
if (-not $steamInstall) { try { $steamInstall = (Get-ItemProperty 'HKCU:\\Software\\Valve\\Steam' -EA SilentlyContinue).SteamPath } catch {} }
${STEAM_ICON_LOOKUP}
try { ${iconHelperLoadSnippet()} } catch {}
$apps = Get-StartApps | ForEach-Object {
  $appId = $_.AppID; $name = $_.Name; $iconPath = $null; $exePath = $null
  if ($appId -match '^steam://rungameid/(\\d+)$') {
    # Steam game: use library cache icon (most reliable), fall back to Uninstall registry
    $steamId = $Matches[1]
    if ($steamInstall) {
      $iconPath = Find-SteamIcon $steamInstall $steamId
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
        # Resolve the original link so its resource index is preserved.
        $exePath = $lnk.FullName
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
        $exePath = $lnkFile.FullName
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
                try { return { buf: await fs.promises.readFile(item.IconPath), requireNonEmpty: true }; }
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

  ipcMain.handle('add-app-dialog', async (e) => {
    // A region is a desktop child: a dialog owned by it would be owned by the
    // desktop window (and disable it while open). Regions get an unowned
    // dialog (spec U4 fallback, used from the start).
    const regionId = regionOf(e);
    if (!regionId && !fromManager(e)) return null;
    const parent = fromManager(e) ? mgr.window : null;
    const { canceled, filePaths } = parent
      ? await dialog.showOpenDialog(parent, DIALOG_OPTS)
      : await dialog.showOpenDialog(DIALOG_OPTS);
    if (canceled || !filePaths.length) return null;
    // + FILE in a region (spec 5.2): a desktop shortcut moves like a drop. The
    // main process adds the tile and sends the page its items, so the page adds nothing.
    if (regionId) {
      const r = await ctl.dropFiles(regionId, [filePaths[0]], Infinity);
      // The new tile must not land hidden by a type-to-filter (addendum B10).
      if (r && (r.moved || r.refs || r.taken)) ctl._command(regionId, 'clear-filter');
      return null;
    }
    return buildAppEntry(filePaths[0]);
  });

  ipcMain.handle('add-app-from-path', async (_, filePath) => {
    if (typeof filePath !== 'string') return null;
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.exe' && ext !== '.lnk' && ext !== '.url') return null;
    try {
      if (!fs.existsSync(filePath)) return null;
    } catch { return null; }
    return buildAppEntry(filePath);
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

  // ╌ on any region hides all of them (spec 7.2).
  ipcMain.handle('hide-window', (e) => { if (regionOf(e)) ctl.hideAll(); });

  // ── Region pages (region.js) ──────────────────────────────────────────────
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  const onRegion = (channel, fn) => ipcMain.handle(channel, (e, arg) => {
    const id = regionOf(e);
    return id ? fn(id, arg && typeof arg === 'object' ? arg : {}) : null;
  });
  onRegion('region:info', (id) => ctl.info(id));
  onRegion('region:pointer-down', (id) => { ctl.onPointerDown(id); });
  onRegion('region:drag', (id, a) => ctl.drag(id, {
    phase: String(a.phase || ''), dx: num(a.dx), dy: num(a.dy), alt: !!a.alt,
  }));
  onRegion('region:resize', (id, a) => ctl.resize(id, {
    phase: String(a.phase || ''), dx: num(a.dx), dy: num(a.dy), alt: !!a.alt,
    edges: a.edges && typeof a.edges === 'object'
      ? { left: !!a.edges.left, right: !!a.edges.right, top: !!a.edges.top, bottom: !!a.edges.bottom } : {},
  }));
  onRegion('region:nudge', (id, a) => ctl.nudge(id, num(a.dx), num(a.dy)));
  onRegion('region:menu', (id, a) => { ctl.popupRegionMenu(id, num(a.x), num(a.y)); });
  onRegion('region:tile-menu', (id, a) => {
    if (typeof a.itemId === 'string') return ctl.popupTileMenu(id, a.itemId, num(a.x), num(a.y), !!a.shift);
  });
  onRegion('region:file-rename', (id, a) => ctl.renameShortcutFile(id, String(a.itemId || ''), String(a.ticket || ''), a.name));
  onRegion('region:file-rename-cancel', (id, a) => ctl.renameShortcutFile(id, String(a.itemId || ''), String(a.ticket || ''), '', true));
  onRegion('region:swap-items', (id, a) => ctl.swapItems(id, a.sourceId, a.targetId, a.order));
  // A tile dragged out of its region (source page) and the slot it lands in (target page).
  onRegion('region:tile-drag', (id, a) => ctl.tileDragFrom(id, {
    phase: String(a.phase || ''), itemId: typeof a.itemId === 'string' ? a.itemId : '', x: num(a.x), y: num(a.y),
  }));
  onRegion('region:tile-drop', (id, a) => ctl.tileDropFrom(id, {
    dragId: num(a.dragId), index: Number.isInteger(a.index) && a.index >= 0 ? a.index : Infinity,
  }));
  // M3: files dropped from the desktop or Explorer (paths from the page's drop),
  // ↩ on moved tiles, and a click on a broken tile.
  const strList = (v, max) => (Array.isArray(v) ? v.filter((s) => typeof s === 'string' && s && s.length < 1024).slice(0, max) : []);
  onRegion('region:drop-files', (id, a) => ctl.dropFiles(id, strList(a.paths, 64),
    Number.isInteger(a.index) && a.index >= 0 ? a.index : Infinity));
  onRegion('region:move-back', (id, a) => ctl.moveBackFromPage(id, strList(a.itemIds, 256)));
  onRegion('region:broken-click', (id, a) => (typeof a.itemId === 'string' ? ctl.brokenClick(id, a.itemId) : { ok: false }));
  // A broken tile's ✕, Delete or tile menu "Remove tile" (addendum B4).
  onRegion('region:remove-broken', (id, a) => (typeof a.itemId === 'string' ? ctl.removeBrokenFromPage(id, a.itemId) : { ok: false }));
  onRegion('region:rename', (id, a) => ctl.rename(id, typeof a.name === 'string' ? a.name : ''));
  // M4: the page's edit bar or notice slot shows or hides (a Column grows by 38 for each).
  onRegion('region:extras', (id, a) => ctl.setExtras(id, { edit: a.edit === true, notice: a.notice === true, preview: a.preview === true,
    renaming: a.renaming === true, gridMinimum: a.gridMinimum && typeof a.gridMinimum === 'object' ? { width: num(a.gridMinimum.width), height: num(a.gridMinimum.height), iconSize:num(a.gridMinimum.iconSize), theme:typeof a.gridMinimum.theme==='string'?a.gridMinimum.theme:'' } : null }));
  onRegion('region:cycle', (id, a) => { ctl.cycle(id, num(a.dir) < 0 ? -1 : 1); });
  onRegion('region:open-manager', (id, a) => {
    const view = ['regions', 'settings', 'picker', 'cheatsheet'].includes(a.view) ? a.view : 'regions';
    mgr.open(view, { regionId: id });
  });

  // ── Manager ───────────────────────────────────────────────────────────────
  const onManager = (channel, fn) => ipcMain.handle(channel, (e, ...args) => (fromManager(e) ? fn(...args) : null));
  onManager('manager:state', () => {
    // Broken tiles and files without a tile are re-checked in the background;
    // a change sends manager:changed, which reads the state again.
    ctl.refreshMoves().catch(() => {});
    return { ...ctl.managerState(), version: electronApp.getVersion(),
      installedPaths: ctl.apps().map(a => ({ regionId: a.regionId, path: a.path })) };
  });
  // M3, Moved shortcuts (spec 8.1, 5.4, 5.5).
  onManager('manager:open-store', () => ctl.openStoreFolder({ parent: mgr.window }));
  onManager('manager:move-all-back', () => ctl.moveAllBack(null, { parent: mgr.window }));
  onManager('manager:orphan', (action, file) => ctl.orphanAction(String(action || ''), typeof file === 'string' ? file : '', { parent: mgr.window }));
  onManager('manager:create-region', (layout) => ctl.createRegion(typeof layout === 'string' ? layout : 'grid'));
  // + NEW REGION opens a native menu of the layouts (spec 8.1); a pick answers on 'manager:created'.
  onManager('manager:new-region-menu', (at) => ctl.popupNewRegionMenu(num(at && at.x), num(at && at.y)));
  onManager('manager:update-region', (id, patch) => {
    if (typeof id !== 'string' || !patch || typeof patch !== 'object') return { ok: false };
    if (typeof patch.name === 'string') return ctl.rename(id, patch.name);
    if (typeof patch.icon === 'string') return ctl.setIcon(id, patch.icon);
    if (typeof patch.theme === 'string') return ctl.setTheme(id, patch.theme);
    // M4: the row's layout select (spec 3.3); a refusal is a box over the Manager.
    if (typeof patch.layout === 'string') return ctl.setLayout(id, patch.layout, { parent: mgr.window });
    return { ok: false };
  });
  onManager('manager:delete-region', (id) => (typeof id === 'string' ? ctl.deleteRegion(id, { parent: mgr.window }) : { ok: false }));
  onManager('manager:set-match-all', (on) => ctl.setMatchAll(!!on));
  onManager('manager:set-shared-theme', (theme) => (typeof theme === 'string' ? ctl.setSharedTheme(theme) : { ok: false }));
  onManager('manager:add-installed', (regionId, item) => {
    const entry = entryFromAppId(item || {});
    if (typeof regionId !== 'string' || !entry) return { ok: false };
    if (ctl.apps().some(a => a.regionId === regionId && String(a.path).toLowerCase() === entry.path.toLowerCase())) return { ok: true, alreadyAdded: true };
    return ctl.addItems(regionId, [entry]);
  });
  onManager('manager:add-file', async (regionId) => {
    if (typeof regionId !== 'string' || !ctl.region(regionId)) return { ok: false };
    const parent = mgr.window;
    const { canceled, filePaths } = parent ? await dialog.showOpenDialog(parent, DIALOG_OPTS) : await dialog.showOpenDialog(DIALOG_OPTS);
    if (canceled || !filePaths.length) return { ok: false, cancelled: true };
    // A desktop shortcut chosen here moves too (spec 5.2: any route).
    return ctl.dropFiles(regionId, [filePaths[0]], Infinity, { parent });
  });
  onManager('manager:close', () => { mgr.close(); });

  // Self-test operations. Refused unless the app runs with --ql-test-hooks.
  const UPDATE_TEST_CHANNELS = new Set(['update-checking', 'update-available', 'update-progress', 'update-ready',
    'update-not-available', 'update-error', 'store-save-error', 'launch-error']);
  onManager('manager:test', (op, arg) => {
    if (!testHooks) return { ok: false, error: 'test hooks are off' };
    const a = arg && typeof arg === 'object' ? arg : {};
    switch (op) {
      case 'describe': return { ok: true, regions: ctl.describe(), hidden: ctl.isHidden(), active: ctl.activeId, workArea: ctl.workArea(), managerVisible: !!(mgr.window && mgr.window.isVisible()) };
      case 'metrics': return { ok: true, ...ctl.metrics() };
      case 'move-item': return ctl.moveItemToRegion(String(a.itemId || ''), String(a.regionId || ''));
      // M2: a stand-in work area and resume run the real display / resume
      // handlers without touching the display; menus are recorded, not shown.
      case 'set-work-area': ctl.setTestWorkArea(a.rect && typeof a.rect === 'object' ? a.rect : null); return { ok: true };
      case 'resume': ctl.testResume(); return { ok: true };
      case 'displace': return ctl.testDisplace(String(a.regionId || ''), num(a.dx), num(a.dy));
      case 'set-cap': return ctl.setTestCap(String(a.regionId || ''), a.cap === null ? null : num(a.cap));
      // M2b: the desktop-child to top-level path, and an activation's own listeners.
      case 'force-fallback': return ctl.testForceFallback(String(a.regionId || ''));
      case 'emit-focus': return ctl.testEmitFocus(String(a.regionId || ''));
      case 'menus': return { ok: true, menus: ctl.menuLog.slice() };
      case 'menu-click': return ctl.menuClick(Array.isArray(a.path) ? a.path.map(num) : []);
      case 'launches': return { ok: true, launches: testLaunches.slice() };
      case 'tile-drag': return { ok: true, drag: ctl.tileDrag ? { sourceId: ctl.tileDrag.sourceId, targetId: ctl.tileDrag.targetId, dropping: ctl.tileDrag.dropping } : null };
      case 'toggle-all': ctl.toggleAll(); return { ok: true, hidden: ctl.isHidden() };
      case 'place': return ctl.place(String(a.regionId || ''), String(a.where || ''));
      case 'random-theme': return ctl.randomTheme(String(a.regionId || ''));
      // M3: the move's state, steps that pause / crash / fail on purpose,
      // message boxes recorded (and answered from a queue), Open folder recorded.
      case 'moves-state': return ctl.movesTestState();
      case 'move-hook': return ctl.setMoveHook(a);
      case 'move-continue': return ctl.moveContinue();
      case 'moves-off': if (ctl.mover) ctl.mover.offForTest = true; ctl._managerChanged(); return { ok: !!ctl.mover };
      case 'moves-on': if (ctl.mover) ctl.mover.offForTest = false; ctl._managerChanged(); return { ok: !!ctl.mover };
      case 'rescan': return ctl.refreshMoves().then((r) => ({ ok: true, ...r }));
      case 'boxes': return { ok: true, boxes: ctl.boxLog.slice() };
      case 'box-answers': ctl._boxAnswers.push(...(Array.isArray(a.answers) ? a.answers.filter(Number.isInteger) : [])); return { ok: true, queued: ctl._boxAnswers.length };
      case 'opened': return { ok: true, opened: ctl.openedLog.slice() };
      // The banner's two layers (fix-pass addendum C5): an updater or notice message sent to
      // the primary region's page as the updater sends it, and the tray-dot clears counted.
      case 'update-event': {
        const ch = String(a.channel || '');
        if (!UPDATE_TEST_CHANNELS.has(ch)) return { ok: false, error: 'not an update channel' };
        publishUpdate(ch, a.arg);
        return { ok: true };
      }
      case 'update-dismissals': return { ok: true, count: updateDismissals() };
      case 'quit': setTimeout(() => { if (quit) quit('self-test'); }, 50); return { ok: true };
      default: return { ok: false, error: `unknown op ${op}` };
    }
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
    $p = $sc.IconLocation
    if ($p -match '^(.*),\\s*-?\\d+\\s*$') { $p = $Matches[1] }
    $p = $p.Trim().Trim('"')
    $p = [Environment]::ExpandEnvironmentVariables($p)
    if ($p -and (Test-Path -LiteralPath $p)) { $icon = $p }
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
function getJumboIconBase64(exePath, shortcut = false) {
  return new Promise((resolve) => {
    const ps = `try { ${iconHelperLoadSnippet()} } catch {}
$b = [IconHelper]::${shortcut ? 'GetShortcutBase64' : 'GetBase64'}($env:QL_PATH)
if ($b) { Write-Output $b }`;
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps],
      { windowsHide: true, stdio: 'pipe', timeout: 15000, env: { ...process.env, QL_PATH: exePath } },
      (err, stdout) => resolve(stdout ? stdout.trim() : null)
    );
  });
}

async function shortcutIconDataUrl(filePath) {
  const b64 = await getJumboIconBase64(filePath, true);
  if (!b64) return '';
  try {
    const img = trimIcon(nativeImage.createFromBuffer(Buffer.from(b64, 'base64')));
    return img.isEmpty() ? '' : img.toDataURL();
  } catch { return ''; }
}

// One source-version refresh for stored links and Steam protocol artwork. Re-read the live list
// before merging so removal/reorder/rename while extraction runs is preserved.
async function refreshStoredShortcutIcons(ctl, store) {
  const revision = 2;
  if (store.get('shortcutIconRevision') === revision) return;
  const changes = new Map();
  const stored = [...(store.get('apps') || [])];
  const steamIds = [...new Set(stored.map(item => item && /^steam:\/\/rungameid\/(\d+)$/i.exec(item.path || '')).filter(Boolean).map(match => match[1]))];
  const steamLookup = await storedSteamIconPaths(steamIds);
  const steamPaths = new Map((steamLookup || []).map(item => [String(item.Id), item.IconPath]));
  for (const item of stored) {
    const steam = item && /^steam:\/\/rungameid\/(\d+)$/i.exec(item.path || '');
    const source = steam && steamPaths.get(steam[1]);
    if (!source) continue;
    try {
      const img = trimIcon(nativeImage.createFromBuffer(await fs.promises.readFile(source)));
      if (!img.isEmpty()) {
        const icon = img.toDataURL();
        if (icon && icon !== item.iconDataUrl) changes.set(item.id, { path: item.path, oldIcon: item.iconDataUrl, icon });
      }
    } catch { /* keep the old icon if the source disappeared or failed to decode */ }
  }
  for (const item of [...(store.get('apps') || [])]) {
    if (!item || typeof item.path !== 'string' || path.extname(item.path).toLowerCase() !== '.lnk') continue;
    const info = await resolveShortcutLink(item.path);
    if (info && !info.icon && info.target) {
      try { if ((await fs.promises.stat(info.target)).isDirectory()) continue; } catch { /* shell may still resolve it */ }
    }
    const icon = await shortcutIconDataUrl(item.path);
    if (icon && icon !== item.iconDataUrl) changes.set(item.id, { path: item.path, oldIcon: item.iconDataUrl, icon });
  }
  const regions = new Set();
  const current = store.get('apps') || [];
  const updated = current.map(item => {
    const change = changes.get(item.id);
    if (!change || item.path !== change.path || item.iconDataUrl !== change.oldIcon) return item;
    regions.add(item.regionId);
    return { ...item, iconDataUrl: change.icon };
  });
  if (regions.size) {
    store.set('apps', updated);
    for (const id of regions) ctl._pushItems(id);
    ctl._managerChanged();
  }
  if (steamLookup !== null) store.set('shortcutIconRevision', revision);
}

// The IconFile= line of an Internet Shortcut (.url, INI text), or null.
async function urlIconFile(filePath) {
  try {
    const text = await fs.promises.readFile(filePath, 'utf8');
    const m = /^\s*IconFile\s*=\s*(.+?)\s*$/im.exec(text);
    return m ? m[1] : null;
  } catch { return null; }
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
  if (path.extname(filePath).toLowerCase() === '.url') {
    // A Steam or web shortcut (regions Q5): its own IconFile= when it has one,
    // else the shell's icon for the .url below.
    const icon = await urlIconFile(filePath);
    const r = icon ? resolveIconPath(icon) : null;
    if (r) iconSourcePath = r;
  } else if (path.extname(filePath).toLowerCase() === '.lnk') {
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
  if (path.extname(filePath).toLowerCase() === '.lnk' && !folderTarget) {
    iconDataUrl = await shortcutIconDataUrl(filePath);
  }
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

module.exports = { setupIPC, VALID_THEMES, buildAppEntry };
