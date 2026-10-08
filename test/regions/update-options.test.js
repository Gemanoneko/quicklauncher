'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),{EventEmitter}=require('node:events');
const root=path.resolve(__dirname,'../..');
function updater(){const auto=new EventEmitter(),handlers={},dots=[];auto.checkForUpdates=()=>Promise.resolve();auto.downloadUpdate=()=>Promise.resolve();auto.quitAndInstall=()=>{};const module={exports:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'src/main/updater.js'),'utf8'),{module,process:{argv:['--ql-no-update-check']},require:n=>n==='electron-updater'?{autoUpdater:auto}:n==='electron'?{app:{isPackaged:true},ipcMain:{handle:(ch,fn)=>handlers[ch]=fn}}:{setUpdateAvailable:f=>dots.push(f),refreshTrayMenu(){}}});
 module.exports.setupUpdater(()=>null,()=>null);return{api:module.exports,handlers,dots};}
test('approved replay retains available, downloading and ready offers on a banner-capable primary',()=>{
 for(const offer of ['available','downloading','ready']){const u=updater(),sent=[];u.api.publish('update-available',{version:'1.95.0'});if(offer==='downloading')u.api.publish('update-progress',45);if(offer==='ready')u.api.publish('update-ready');
  assert.equal(u.api.replayOffer({isDestroyed:()=>false,send:(...a)=>sent.push(a)},'grid'),true);
  assert.equal(sent[0][0],offer==='ready'?'update-ready':'update-available');
  if(offer==='downloading'){assert.equal(sent.length,2);assert.equal(sent[1][0],'update-progress');assert.equal(sent[1][1],45);}
  assert.equal(u.api.getUpdateState().offer,offer);
 }
});
test('dismissed offer survives rebuild/promotion without replay; fresh availability resets notification',()=>{
 const u=updater(),sent=[],wc={isDestroyed:()=>false,send:(...a)=>sent.push(a)};
 u.api.publish('update-available',{version:'1.95.0'});u.handlers['dismiss-update']();
 assert.equal(u.api.replayOffer(wc,'column'),false);assert.equal(sent.length,0);assert.equal(u.api.getUpdateState().offer,'available');assert.equal(u.dots.at(-1),false);
 u.api.publish('update-progress',45);assert.equal(u.api.replayOffer(wc,'column'),false);
 u.api.publish('update-ready');assert.equal(u.api.replayOffer(wc,'column'),false);
 u.api.publish('update-available',{version:'1.95.0'});assert.equal(u.api.replayOffer(wc,'column'),true);assert.equal(sent.length,1);
});
test('replay never routes a banner to Row/Fan/Ring, a dead page or an absent offer',()=>{
 const u=updater();let sent=0;const wc={isDestroyed:()=>false,send:()=>sent++};assert.equal(u.api.replayOffer(wc,'grid'),false);u.api.publish('update-available',{version:'x'});
 for(const layout of ['row','fan','ring'])assert.equal(u.api.replayOffer(wc,layout),false);
 assert.equal(u.api.replayOffer({isDestroyed:()=>true},'grid'),false);assert.equal(u.api.replayOffer(null,'grid'),false);assert.equal(sent,0);
});
test('tray B labels every state and opens Manager Settings without download/install',()=>{
 let state={offer:'none',checking:false},checks=0,opened=[],menu;
 const image={resize(){return this;},isEmpty:()=>false,toBitmap:()=>Buffer.alloc(1024,255),getSize:()=>({width:16,height:16})};
 class Tray{setToolTip(){}setImage(){}setContextMenu(m){menu=m;}on(){}}
 const module={exports:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'src/main/tray.js'),'utf8'),{module,Buffer,console,__dirname:path.join(root,'src/main'),require:n=>n==='electron'?{Tray,Menu:{buildFromTemplate:m=>m},nativeImage:{createFromPath:()=>image,createFromBitmap:()=>image}}:n==='path'?path:n==='./updater'?{getUpdateState:()=>({...state}),checkForUpdates:()=>checks++}:n==='./regions/model'?{REGION_CAP:8}:n==='../renderer/radial-layout'?require('../../src/renderer/radial-layout'):null});
 module.exports.setupTray({ctl:{regions:()=>[{id:'r'}],workArea:()=>({width:1920,height:1040})},mgr:{open:v=>opened.push(v)},electronApp:{isPackaged:false},store:{get:()=>({})},quit(){}});
 const cases=[['none',false,'Check for Updates',1],['none',true,'Check for Updates',0],['available',true,'Update available — v1.95.0…',0],['downloading',false,'Update downloading…',0],['ready',false,'Update ready to install…',0]];
 for(const [offer,checking,label,added]of cases){state={offer,checking,version:'1.95.0'};module.exports.refreshTrayMenu();const item=menu.at(-3);assert.equal(item.label,label);const before=checks;item.click();assert.equal(checks-before,added);assert.equal(opened.at(-1),'settings');}
 assert.equal(opened.length,5);
});
