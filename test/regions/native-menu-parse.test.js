'use strict';
// Optional Windows parse-only integration. No Form, popup, launch, key or real
// profile write: compile the actual production parsing block into a one-shot
// STA probe, then run it hidden under the verification runner's private Job.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const enabled=process.platform==='win32'&&!!process.env.QL_TEST_ROOT;
test('native shell parser accepts the original AppsFolder alias and filesystem path; stale ID fails before any menu', {skip:!enabled},()=>{
  const root=path.resolve(process.env.QL_TEST_ROOT);
  const temp=path.resolve(process.env.TEMP);
  assert.ok(root.toLowerCase().startsWith(temp.toLowerCase()+path.sep),'owned probe root is under TEMP');
  fs.mkdirSync(root,{recursive:true});
  const source=fs.readFileSync(process.env.QL_BASELINE_SHELL || path.join(__dirname,'../../src/main/native/ShellMenu.cs'),'utf8');
  const start=source.indexOf('uint attrs;string target=request.path;'),end=source.indexOf('   Guid folderId=',start);
  assert.ok(start>0&&end>start,'production parsing block found');
  const block=source.slice(start,end);
  const program=`static class Program {
    [STAThread] static void Main(){
      Console.InputEncoding=new UTF8Encoding(false);Console.OutputEncoding=new UTF8Encoding(false);
      var json=new JavaScriptSerializer();var paths=json.Deserialize<string[]>(Console.In.ReadToEnd());
      Marshal.ThrowExceptionForHR(Native.CoInitializeEx(IntPtr.Zero,2));
      foreach(string path in paths){IntPtr pidl=IntPtr.Zero;try{var request=new Request{path=path};${block}
        Console.WriteLine(json.Serialize(new{path=path,ok=true}));
      }catch(Exception error){Console.WriteLine(json.Serialize(new{path=path,ok=false,hr=Marshal.GetHRForException(error).ToString("x")}));}
      finally{if(pidl!=IntPtr.Zero)Marshal.FreeCoTaskMem(pidl);}}
      Native.CoUninitialize();
    }
  }`;
  const cs=path.join(root,'menu-parse.cs'),exe=path.join(root,'menu-parse.exe');
  fs.writeFileSync(cs,source.slice(0,source.indexOf('static class Program {'))+program);
  const compiler=path.join(process.env.WINDIR,'Microsoft.NET/Framework64/v4.0.30319/csc.exe');
  cp.execFileSync(compiler,['/nologo','/target:exe','/reference:System.Windows.Forms.dll','/reference:System.Drawing.dll','/reference:System.Web.Extensions.dll','/out:'+exe,cs],{windowsHide:true,timeout:10000});
  const file=path.join(root,'unicode short cut-שלום.url');fs.writeFileSync(file,'[InternetShortcut]\r\nURL=file:///C:/Windows\r\n');
  const paths=['shell:AppsFolder',file,'shell:AppsFolder\\ql.missing-'+process.pid];
  if(process.env.QL_NATIVE_APP_ID)paths.push('shell:AppsFolder\\'+process.env.QL_NATIVE_APP_ID);
  const output=cp.execFileSync(exe,[],{input:JSON.stringify(paths),encoding:'utf8',windowsHide:true,timeout:10000});
  const results=output.trim().split(/\r?\n/).map(line=>JSON.parse(line));
  assert.equal(results[0].ok,true,'AppsFolder root');assert.equal(results[1].ok,true,'Unicode filesystem shortcut');
  assert.equal(results[2].ok,false,'missing identity');assert.ok(['80070057','80070002'].includes(results[2].hr),'missing identity is rejected by the shell parser');
  if(paths.length===4)assert.equal(results[3].ok,true,'installed identity');
});
