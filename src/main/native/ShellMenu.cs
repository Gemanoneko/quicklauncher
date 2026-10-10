// A single user-requested shell menu/rename on its own STA, isolated from
// Electron. No operation occurs until a selected menu command or rename submit.
using System;
using System.IO;
using System.Text;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using System.Web.Script.Serialization;

[ComImport, Guid("000214E6-0000-0000-C000-000000000046"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IShellFolder {
 [PreserveSig] int ParseDisplayName(IntPtr w,IntPtr b,[MarshalAs(UnmanagedType.LPWStr)] string s,out uint eaten,out IntPtr p,ref uint a);
 [PreserveSig] int EnumObjects(IntPtr w,uint f,out IntPtr p);
 [PreserveSig] int BindToObject(IntPtr p,IntPtr b,ref Guid g,out IntPtr o);
 [PreserveSig] int BindToStorage(IntPtr p,IntPtr b,ref Guid g,out IntPtr o);
 [PreserveSig] int CompareIDs(IntPtr f,IntPtr a,IntPtr b);
 [PreserveSig] int CreateViewObject(IntPtr w,ref Guid g,out IntPtr o);
 [PreserveSig] int GetAttributesOf(uint n,[MarshalAs(UnmanagedType.LPArray,SizeParamIndex=0)] IntPtr[] p,ref uint a);
 [PreserveSig] int GetUIObjectOf(IntPtr w,uint n,[MarshalAs(UnmanagedType.LPArray,SizeParamIndex=1)] IntPtr[] p,ref Guid g,IntPtr r,out IntPtr o);
 [PreserveSig] int GetDisplayNameOf(IntPtr p,uint f,IntPtr s);
 [PreserveSig] int SetNameOf(IntPtr w,IntPtr p,[MarshalAs(UnmanagedType.LPWStr)] string s,uint f,out IntPtr o);
}
[ComImport, Guid("000214E4-0000-0000-C000-000000000046"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IContextMenu {
 [PreserveSig] int QueryContextMenu(IntPtr m,uint at,uint first,uint last,uint flags);
 [PreserveSig] int InvokeCommand(ref InvokeInfo i);
 [PreserveSig] int GetCommandString(UIntPtr id,uint flags,IntPtr reserved,[MarshalAs(UnmanagedType.LPStr)] StringBuilder text,uint size);
}
[ComImport, Guid("000214F4-0000-0000-C000-000000000046"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IContextMenu2 {
 [PreserveSig] int QueryContextMenu(IntPtr m,uint at,uint first,uint last,uint flags);
 [PreserveSig] int InvokeCommand(ref InvokeInfo i);
 [PreserveSig] int GetCommandString(UIntPtr id,uint flags,IntPtr reserved,[MarshalAs(UnmanagedType.LPStr)] StringBuilder text,uint size);
 [PreserveSig] int HandleMenuMsg(uint m,IntPtr w,IntPtr l);
}
[ComImport, Guid("BCFCE0A0-EC17-11D0-8D10-00A0C90F2719"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IContextMenu3 {
 [PreserveSig] int QueryContextMenu(IntPtr m,uint at,uint first,uint last,uint flags);
 [PreserveSig] int InvokeCommand(ref InvokeInfo i);
 [PreserveSig] int GetCommandString(UIntPtr id,uint flags,IntPtr reserved,[MarshalAs(UnmanagedType.LPStr)] StringBuilder text,uint size);
 [PreserveSig] int HandleMenuMsg(uint m,IntPtr w,IntPtr l);
 [PreserveSig] int HandleMenuMsg2(uint m,IntPtr w,IntPtr l,out IntPtr result);
}
[StructLayout(LayoutKind.Sequential)] struct Point { public int x,y; }
[StructLayout(LayoutKind.Sequential)] struct InvokeInfo {
 public int cbSize; public uint mask; public IntPtr hwnd,verb,parameters,directory;
 public int show; public uint hotKey; public IntPtr icon,title,verbW,parametersW,directoryW,titleW; public Point point;
}
class Identity { public string volume,id,created; }
class Request { public string mode,path,name; public int x,y; public long owner; public bool shift; public Identity identity; }
class Result { public bool ok,cancelled,rename; public string error,verb,path,fileName; public Identity identity; }
// Optional classic-menu compatibility hooks used by Microsoft PowerToys.
// Ordinal135 changed ABI at1903: never call it on an unknown build/signature.
static class PopupTheme {
 [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)] struct VersionInfo {
  public uint size,major,minor,build,platform;
  [MarshalAs(UnmanagedType.ByValTStr,SizeConst=128)] public string servicePack;
 }
 [DllImport("ntdll.dll",CharSet=CharSet.Unicode)] static extern int RtlGetVersion(ref VersionInfo version);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode)] static extern IntPtr LoadLibraryEx(string file,IntPtr reserved,uint flags);
 [DllImport("kernel32.dll",ExactSpelling=true)] static extern IntPtr GetProcAddress(IntPtr module,IntPtr ordinal);
 [UnmanagedFunctionPointer(CallingConvention.Winapi)] [return:MarshalAs(UnmanagedType.I1)] delegate bool ShouldDark();
 [UnmanagedFunctionPointer(CallingConvention.Winapi)] [return:MarshalAs(UnmanagedType.I1)] delegate bool AllowApp([MarshalAs(UnmanagedType.I1)] bool allow);
 [UnmanagedFunctionPointer(CallingConvention.Winapi)] delegate int PreferApp(int mode);
 [UnmanagedFunctionPointer(CallingConvention.Winapi)] [return:MarshalAs(UnmanagedType.I1)] delegate bool AllowWindow(IntPtr window,[MarshalAs(UnmanagedType.I1)] bool allow);
 [UnmanagedFunctionPointer(CallingConvention.Winapi)] delegate void Refresh();
 static AllowWindow allowWindow;static bool useDark;
 static Delegate Export(IntPtr module,int ordinal,Type type){IntPtr address=GetProcAddress(module,new IntPtr(ordinal));return address==IntPtr.Zero?null:Marshal.GetDelegateForFunctionPointer(address,type);}
 public static void Initialize(){
  try {
   if(SystemInformation.HighContrast)return;
   var version=new VersionInfo();version.size=(uint)Marshal.SizeOf(typeof(VersionInfo));
   if(RtlGetVersion(ref version)!=0||version.major!=10||version.minor!=0||version.platform!=2)return;
   bool legacy=version.build==17763;
   bool modern=version.build==18362||version.build==18363||(version.build>=19041&&version.build<=19045)
    ||version.build==22000||version.build==22621||version.build==22631||version.build==26100||version.build==26200;
   if(!legacy&&!modern)return;
   // Absolute System32 path and system-only loader search; retained for this
   // one-shot helper lifetime so optional delegates never reference an unloaded DLL.
   IntPtr module=LoadLibraryEx(Path.Combine(Environment.SystemDirectory,"uxtheme.dll"),IntPtr.Zero,0x800);
   if(module==IntPtr.Zero)return;
   var should=(ShouldDark)Export(module,132,typeof(ShouldDark));
   var window=(AllowWindow)Export(module,133,typeof(AllowWindow));
   var refresh=(Refresh)Export(module,104,typeof(Refresh));
   var flush=(Refresh)Export(module,136,typeof(Refresh));
   var appMode=Export(module,135,legacy?typeof(AllowApp):typeof(PreferApp));
   if(should==null||window==null||refresh==null||flush==null||appMode==null)return;
   refresh();useDark=should();
   if(legacy)((AllowApp)appMode)(useDark);else((PreferApp)appMode)(useDark?2:3);
   allowWindow=window;flush();
  } catch {allowWindow=null;useDark=false;} // ordinary genuine shell menu remains available
 }
 public static void ApplyWindow(IntPtr window){try{if(allowWindow!=null)allowWindow(window,useDark);}catch{}}
}
static class Native {
 public static string lastPhase="initial";
 public static void Phase(string phase){if(phase==lastPhase)return;lastPhase=phase;Console.WriteLine("{\"phase\":\""+phase+"\"}");Console.Out.Flush();}
 [DllImport("shell32.dll",CharSet=CharSet.Unicode)] public static extern int SHParseDisplayName(string n,IntPtr b,out IntPtr p,uint a,out uint attrs);
 [DllImport("shell32.dll")] public static extern int SHBindToParent(IntPtr p,ref Guid g,[MarshalAs(UnmanagedType.Interface)] out IShellFolder f,out IntPtr child);
 [DllImport("user32.dll")] public static extern IntPtr CreatePopupMenu();
 [DllImport("user32.dll")] public static extern bool DestroyMenu(IntPtr menu);
 [DllImport("user32.dll")] public static extern uint TrackPopupMenuEx(IntPtr m,uint f,int x,int y,IntPtr w,IntPtr r);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr w);
 [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr w);
 [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr w);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr w,StringBuilder name,int count);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr w,out uint pid);
 public delegate bool WindowProc(IntPtr w,IntPtr p);
 [DllImport("user32.dll")] public static extern bool EnumWindows(WindowProc f,IntPtr p);
 [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
 [DllImport("shlwapi.dll")] public static extern int SHCreateThreadRef(IntPtr count,out IntPtr value);
 [DllImport("shlwapi.dll")] public static extern int SHSetThreadRef(IntPtr value);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode)] public static extern IntPtr CreateFile(string p,uint access,uint share,IntPtr security,uint disposition,uint flags,IntPtr template);
 [DllImport("kernel32.dll")] public static extern bool GetFileInformationByHandleEx(IntPtr h,int type,byte[] b,uint size);
 [DllImport("kernel32.dll")] public static extern bool CloseHandle(IntPtr h);
 [DllImport("ole32.dll")] public static extern int CoInitializeEx(IntPtr reserved,uint flags);
 [DllImport("ole32.dll")] public static extern void CoUninitialize();
 public static Identity ReadIdentity(string p) {
  IntPtr h=CreateFile(p,0x80,7,IntPtr.Zero,3,0x200000,IntPtr.Zero);
  if(h==new IntPtr(-1)||h==IntPtr.Zero)return null;
  try {
   byte[] id=new byte[24],basic=new byte[40];
   if(!GetFileInformationByHandleEx(h,18,id,24)||!GetFileInformationByHandleEx(h,0,basic,40))return null;
   if((BitConverter.ToUInt32(basic,32)&(0x10|0x400|0x1000|0x40000|0x400000))!=0)return null;
   string fileId=BitConverter.ToString(id,8,16).Replace("-","").ToLowerInvariant();
   if(fileId==new string('0',32))return null;
   return new Identity {volume=BitConverter.ToUInt64(id,0).ToString("x"),id=fileId,created=BitConverter.ToUInt64(basic,0).ToString("x")};
  } finally {CloseHandle(h);}
 }
 public static bool Same(Identity a,Identity b){return a!=null&&b!=null&&a.volume==b.volume&&a.id==b.id&&a.created==b.created;}
}
class MenuHost:Form {
 readonly Request request; public Result result=new Result();
 IContextMenu menu; IContextMenu2 menu2; IContextMenu3 menu3; bool done;
 IntPtr refCount,threadRef;
 System.Windows.Forms.Timer completionTimer;
 object commandContext;IShellFolder commandFolder;IntPtr commandPidl;
 System.Diagnostics.Stopwatch commandClock;long lastBusy;
 public MenuHost(Request r){request=r;ShowInTaskbar=false;FormBorderStyle=FormBorderStyle.FixedToolWindow;Opacity=0;StartPosition=FormStartPosition.Manual;Location=new System.Drawing.Point(r.x,r.y);Size=new Size(1,1);}
 protected override void OnShown(EventArgs e){PopupTheme.ApplyWindow(Handle);base.OnShown(e);BeginInvoke(new Action(Run));}
 protected override void WndProc(ref Message m){
  if(m.Msg==0x121&&m.WParam==IntPtr.Zero)Native.Phase("interactive");
  if(menu!=null&&(m.Msg==0x117||m.Msg==0x2b||m.Msg==0x2c||m.Msg==0x120)){
   string previous=Native.lastPhase;Native.Phase("invoke");
   try {IntPtr answer;if(menu3!=null&&menu3.HandleMenuMsg2((uint)m.Msg,m.WParam,m.LParam,out answer)==0){m.Result=answer;return;}
    if(menu2!=null&&menu2.HandleMenuMsg((uint)m.Msg,m.WParam,m.LParam)==0){m.Result=IntPtr.Zero;return;}
   } catch { /* unsupported extension messages use default dispatch */ }
   finally {Native.Phase(previous);}
  }base.WndProc(ref m);
 }
 void Validate(){if(request.owner!=0&&!Native.IsWindow(new IntPtr(request.owner)))throw new IOException("The region was closed.");if(request.identity!=null&&!Native.Same(request.identity,Native.ReadIdentity(request.path)))throw new IOException("The shortcut changed or is unavailable. Refresh and try again.");}
 void Run(){
  IntPtr pidl=IntPtr.Zero,child=IntPtr.Zero,raw=IntPtr.Zero,hmenu=IntPtr.Zero;IShellFolder folder=null;object context=null;bool invokedShell=false;
  try{
   Validate();uint attrs;string target=request.path;
   if(target.StartsWith("shell:AppsFolder\\",StringComparison.OrdinalIgnoreCase))target="::{4234D49B-0245-4DF3-B780-3893943456E1}\\"+target.Substring(17);
   Marshal.ThrowExceptionForHR(Native.SHParseDisplayName(target,IntPtr.Zero,out pidl,0,out attrs));
   Guid folderId=new Guid("000214E6-0000-0000-C000-000000000046");
   Marshal.ThrowExceptionForHR(Native.SHBindToParent(pidl,ref folderId,out folder,out child));
   uint canRename=0x10;Marshal.ThrowExceptionForHR(folder.GetAttributesOf(1,new IntPtr[]{child},ref canRename));
   if(request.identity==null)canRename=0;
   if(request.mode=="rename"){
    if((canRename&0x10)==0)throw new IOException("Windows does not support renaming this item.");
    string name=request.name;
    if(String.IsNullOrWhiteSpace(name)||name=="."||name==".."||name.IndexOfAny(Path.GetInvalidFileNameChars())>=0||name.EndsWith(".")||name.EndsWith(" "))throw new IOException("Enter a valid file name without an extension.");
    string fullName=name+Path.GetExtension(request.path),destination=Path.Combine(Path.GetDirectoryName(request.path),fullName);
    if(!String.Equals(destination,request.path,StringComparison.OrdinalIgnoreCase)&&(File.Exists(destination)||Directory.Exists(destination)))throw new IOException("A file with that name already exists.");
    Validate();Native.Phase("invoke");IntPtr renamed=IntPtr.Zero;
    try{Marshal.ThrowExceptionForHR(folder.SetNameOf(Handle,child,fullName,0x8000,out renamed));}finally{if(renamed!=IntPtr.Zero)Marshal.FreeCoTaskMem(renamed);}
    result.path=destination;result.ok=true;result.identity=Native.ReadIdentity(destination);
   } else {
    Guid menuId=new Guid("000214E4-0000-0000-C000-000000000046");
    Marshal.ThrowExceptionForHR(folder.GetUIObjectOf(Handle,1,new IntPtr[]{child},ref menuId,IntPtr.Zero,out raw));
    context=Marshal.GetObjectForIUnknown(raw);Marshal.Release(raw);raw=IntPtr.Zero;menu=(IContextMenu)context;
    menu2=context as IContextMenu2;menu3=context as IContextMenu3;hmenu=Native.CreatePopupMenu();if(hmenu==IntPtr.Zero)throw new IOException("Windows could not open the shortcut menu.");
    refCount=Marshal.AllocHGlobal(4);Marshal.WriteInt32(refCount,0);Marshal.ThrowExceptionForHR(Native.SHCreateThreadRef(refCount,out threadRef));Marshal.ThrowExceptionForHR(Native.SHSetThreadRef(threadRef));
    uint flags=0x80|((canRename&0x10)!=0?0x10u:0u)|(request.shift?0x100u:0u);
    Marshal.ThrowExceptionForHR(menu.QueryContextMenu(hmenu,0,1,0x7fff,flags));
    Native.Phase("menu");Native.SetForegroundWindow(Handle);uint selected=Native.TrackPopupMenuEx(hmenu,0x102,request.x,request.y,Handle,IntPtr.Zero);
    if(selected==0){result.ok=true;result.cancelled=true;}else{
     Validate();var verb=new StringBuilder(256);menu.GetCommandString(new UIntPtr(selected-1),0,IntPtr.Zero,verb,256);result.verb=verb.ToString();
     if(String.Equals(result.verb,"rename",StringComparison.OrdinalIgnoreCase)){
      result.rename=true;result.fileName=Path.GetFileNameWithoutExtension(request.path);result.identity=request.identity;result.ok=true;
     }else{
      var invoke=new InvokeInfo {cbSize=Marshal.SizeOf(typeof(InvokeInfo)),mask=0x4000|0x100|0x20000000|(request.shift?0x10000000u:0u),hwnd=Handle,verb=new IntPtr(selected-1),verbW=new IntPtr(selected-1),show=1,point=new Point{x=request.x,y=request.y}};
      Native.Phase("invoke");Validate();invokedShell=true;int invoked=menu.InvokeCommand(ref invoke);
      if(invoked!=0){Marshal.ThrowExceptionForHR(invoked);throw new IOException("Windows did not carry out the selected shortcut action.");}result.ok=true;
     }
    }
   }
  }catch(Exception e){result.error=e.Message;result.ok=false;}
  finally{
   menu=null;menu2=null;menu3=null;if(hmenu!=IntPtr.Zero)Native.DestroyMenu(hmenu);if(raw!=IntPtr.Zero)Marshal.Release(raw);
   done=true;
   // Closing the popup does not guarantee another WinForms Idle event: its
   // native nested loop can already have exhausted the queue. No command means
   // there is no asynchronous shell work/dialog whose host must stay alive.
   if(!invokedShell){if(context!=null)Marshal.FinalReleaseComObject(context);if(folder!=null)Marshal.FinalReleaseComObject(folder);if(pidl!=IntPtr.Zero)Marshal.FreeCoTaskMem(pidl);Native.SHSetThreadRef(IntPtr.Zero);Close();}
   else {
    // NOASYNC is advisory: retain native resources while queued command UI
    // gets a chance to appear, not only until InvokeCommand returns.
    commandContext=context;commandFolder=folder;commandPidl=pidl;commandClock=System.Diagnostics.Stopwatch.StartNew();
    Native.Phase("invoke");Application.Idle+=OnIdle;
    // Shell ref releases need not post a window message. Check only while
    // this selected command still owns asynchronous work or a real dialog.
    if(!IsDisposed){completionTimer=new System.Windows.Forms.Timer();completionTimer.Interval=200;completionTimer.Tick+=OnIdle;completionTimer.Start();}
   }
  }
 }
 void OnIdle(object sender,EventArgs e){
  if(!done)return;
  long elapsed=commandClock.ElapsedMilliseconds;
  if(elapsed<600)return;
  bool dialogs=false,pendingDialog=false;uint ours=(uint)System.Diagnostics.Process.GetCurrentProcess().Id;
  Native.EnumWindows((w,p)=>{
   uint pid;Native.GetWindowThreadProcessId(w,out pid);
   if(w!=Handle&&pid==ours){
    if(Native.IsWindowVisible(w))dialogs=true;
    else {var name=new StringBuilder(64);Native.GetClassName(w,name,64);if(name.ToString()=="#32770")pendingDialog=true;}
   }return true;
  },IntPtr.Zero);
  if(dialogs){lastBusy=elapsed;Native.Phase("interactive");return;}
  if(pendingDialog){lastBusy=elapsed;Native.Phase("invoke");return;}
  // Only the helper's own IUnknown reference is known to be self-held.
  // Any additional thread reference can represent outstanding shell work:
  // preserve context/folder/PIDL until it releases, even without visible UI.
  if(refCount!=IntPtr.Zero&&Marshal.ReadInt32(refCount)>1){lastBusy=elapsed;Native.Phase("invoke");return;}
  if(commandContext!=null||commandFolder!=null||commandPidl!=IntPtr.Zero){ReleaseCommandResources();lastBusy=elapsed;}
  // Let queued close/release messages drain before destroying their owner.
  if(elapsed-lastBusy<600)return;
  Application.Idle-=OnIdle;if(completionTimer!=null)completionTimer.Stop();Close();
 }
 void ReleaseCommandResources(){
  if(commandContext!=null){Marshal.FinalReleaseComObject(commandContext);commandContext=null;}
  if(commandFolder!=null){Marshal.FinalReleaseComObject(commandFolder);commandFolder=null;}
  if(commandPidl!=IntPtr.Zero){Marshal.FreeCoTaskMem(commandPidl);commandPidl=IntPtr.Zero;}
  Native.SHSetThreadRef(IntPtr.Zero);
 }
 protected override void Dispose(bool disposing){
  Application.Idle-=OnIdle;
  if(completionTimer!=null){completionTimer.Stop();completionTimer.Dispose();completionTimer=null;}
  ReleaseCommandResources();
  if(threadRef!=IntPtr.Zero){Marshal.Release(threadRef);threadRef=IntPtr.Zero;}
  // A dismissed menu extension may retain its reference. Keep its counter
  // allocated until this one-shot process exits rather than free live memory.
  if(refCount!=IntPtr.Zero){if(Marshal.ReadInt32(refCount)==0)Marshal.FreeHGlobal(refCount);refCount=IntPtr.Zero;}
  base.Dispose(disposing);
 }
}
static class Program {
 [STAThread] static void Main(){
  Console.InputEncoding=new System.Text.UTF8Encoding(false);Console.OutputEncoding=new System.Text.UTF8Encoding(false);
  var json=new JavaScriptSerializer();Result result;
  bool initialized=false;
  try{Marshal.ThrowExceptionForHR(Native.CoInitializeEx(IntPtr.Zero,2));initialized=true;Native.SetProcessDPIAware();PopupTheme.Initialize();var request=json.Deserialize<Request>(Console.In.ReadToEnd());using(var host=new MenuHost(request)){Application.Run(host);result=host.result;}}
  catch(Exception e){result=new Result{ok=false,error=e.Message};}
  finally{if(initialized)Native.CoUninitialize();}
  Console.WriteLine(json.Serialize(result));
 }
}
