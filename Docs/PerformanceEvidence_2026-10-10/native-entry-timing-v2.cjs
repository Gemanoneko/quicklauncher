'use strict';
const entryDateNowMs=Date.now();
const entryHrNs=process.hrtime.bigint();
const {performance}=require('node:perf_hooks');
const entryPerformanceNowMs=performance.now();
// Snapshot-only entry, never packaged into production. Canonical safe launcher
// owns this copy. Native window attachment needs an active human away window.
const fs=require('node:fs'),path=require('node:path');
const {app,ipcMain,session,globalShortcut,shell,dialog}=require('electron');
const expectedRoot=path.resolve('C:/Users/AnGeLZzZ/AppData/Local/Temp/illuminati-quicklaunch-startup-perf-2026-10-10');
const profile=path.resolve(app.getPath('userData'));
if(!profile.toLowerCase().startsWith(expectedRoot.toLowerCase()+path.sep)||fs.realpathSync(profile).toLowerCase()!==profile.toLowerCase())throw Error('benchmark profile refused');
if(!process.argv.includes('--ql-test-hooks')||!process.argv.includes('--ql-no-update-check'))throw Error('mandatory isolation flags missing');
app.setPath('temp',profile);
for(const n of ['quicklauncher-data.json','quicklauncher-data.json.tmp','quicklauncher-data.json.bak']){
  const p=path.join(profile,n),s=fs.lstatSync(p);if(!s.isFile()||s.isSymbolicLink()||s.nlink!==1)throw Error('unsafe seed');
  const d=JSON.parse(fs.readFileSync(p,'utf8'));if(d.settings?.startWithWindows!==false||d.settings?.globalHotkey!==null||d.settings?.randomTheme!==false)throw Error('unsafe benchmark settings');
}
// Enforce independent of seed fallback/reconcile. No system registration calls
// escape these stubs. The getLogin response matches the false isolated seed.
const guards={},identity=[];
function stub(o,k,fn){o[k]=fn;identity.push([o,k,fn]);}
function blocked(k){guards[k]=(guards[k]||0)+1;throw Error('Blocked benchmark operation '+k);}
stub(app,'getLoginItemSettings',()=>({openAtLogin:false}));
stub(app,'setLoginItemSettings',()=>blocked('setLoginItemSettings'));
stub(globalShortcut,'register',()=>blocked('register'));
stub(globalShortcut,'registerAll',()=>blocked('registerAll'));
stub(globalShortcut,'unregister',()=>{});stub(globalShortcut,'unregisterAll',()=>{});
for(const k of ['openExternal','openPath','showItemInFolder'])stub(shell,k,()=>blocked(k));
for(const k of ['showErrorBox','showMessageBox','showMessageBoxSync','showOpenDialog','showOpenDialogSync','showSaveDialog','showSaveDialogSync'])stub(dialog,k,()=>blocked(k));
// Positive controls cannot reach OS implementations.
for(const [o,k] of identity){if(['getLoginItemSettings','unregister','unregisterAll'].includes(k))continue;try{o[k]();}catch{}if(guards[k]!==1)throw Error('guard positive control failed');}
for(const k of Object.keys(guards))delete guards[k];
const began=performance.now(),ready=new Map(),snapshots=[],errors=[];
const clock=()=>({dateNowMs:Date.now(),epochMonotonicMs:performance.timeOrigin+performance.now(),hrElapsedMs:Number(process.hrtime.bigint()-entryHrNs)/1e6});
const entryClock={dateNowMs:entryDateNowMs,epochMonotonicMs:performance.timeOrigin+entryPerformanceNowMs,hrElapsedMs:0};
const timeOriginMs=performance.timeOrigin;
const seed=JSON.parse(fs.readFileSync(path.join(profile,'quicklauncher-data.json'),'utf8'));
const originalHandle=ipcMain.handle.bind(ipcMain);
ipcMain.handle=(channel,fn)=>originalHandle(channel,channel==='renderer-ready'?async(e,...args)=>{const result=await fn(e,...args);if(!ready.has(e.sender.id))ready.set(e.sender.id,{webContentsId:e.sender.id,rendererPid:e.sender.getOSProcessId(),elapsedMs:performance.now()-began,clock:clock()});return result;}:fn);
app.commandLine.appendSwitch('mute-audio');app.commandLine.appendSwitch('disable-background-networking');app.commandLine.appendSwitch('disable-component-update');app.commandLine.appendSwitch('host-resolver-rules','MAP * ~NOTFOUND');
app.on('web-contents-created',(_,wc)=>{wc.setAudioMuted(true);wc.setWindowOpenHandler(()=>({action:'deny'}));wc.on('will-navigate',e=>{e.preventDefault();});wc.on('will-attach-webview',e=>e.preventDefault());wc.on('console-message',(_e,l,m)=>{if(l>=3)errors.push(m);});});
let mainReadyMs=null,mainReadyClock=null;
app.whenReady().then(()=>{
  mainReadyMs=performance.now()-began;
  mainReadyClock=clock();
  session.defaultSession.webRequest.onBeforeRequest((d,cb)=>{if(d.url.startsWith('file:')||d.url.startsWith('data:'))return cb({});blockedNetwork(d.url,cb);});
  session.defaultSession.setPermissionRequestHandler((_w,_p,cb)=>cb(false));session.defaultSession.setPermissionCheckHandler(()=>false);
});
function blockedNetwork(_url,cb){guards.network=(guards.network||0)+1;cb({cancel:true});}
const timer=setInterval(()=>{const samplingStart=clock();const metrics=app.isReady()?app.getAppMetrics():[];snapshots.push({elapsedMs:performance.now()-began,samplingStart,samplingEnd:clock(),ready:ready.size,metrics});},1000);
const finish=()=>{
  clearInterval(timer);
  const valid=identity.every(([o,k,f])=>o[k]===f);
  const firstReady=[...ready.values()].sort((a,b)=>a.clock.epochMonotonicMs-b.clock.epochMonotonicMs);
  const browser=snapshots.flatMap(s=>s.metrics).find(m=>m.pid===process.pid&&m.type==='Browser');
  const rootCreationTimeMs=browser?.creationTime??null;
  const processStartToMainReadyMs=rootCreationTimeMs!==null&&mainReadyClock?mainReadyClock.epochMonotonicMs-rootCreationTimeMs:null;
  const processStartToAllRegionsReadyMs=rootCreationTimeMs!==null&&firstReady.length===seed.regions.length?firstReady.at(-1).clock.epochMonotonicMs-rootCreationTimeMs:null;
  fs.writeFileSync(path.join(profile,'native-metrics.json'),JSON.stringify({kind:'native-isolated-startup-timing-v2',rootPid:process.pid,rootCreationTimeMs,entryClock,timeOriginMs,mainReadyClock,mainReadyMs,regionReadyMs:firstReady.map(r=>r.elapsedMs),regionFirstReady:firstReady,processStartToMainReadyMs,processStartToAllRegionsReadyMs,expectedRegions:seed.regions.length,guards,guardIdentitiesValid:valid,errors,snapshots},null,2));
};
app.on('will-quit',finish);
require('./src/main/index.js');
// Original will-quit handler detaches own windows and flushes only temp store.
setTimeout(()=>app.quit(),30000);
