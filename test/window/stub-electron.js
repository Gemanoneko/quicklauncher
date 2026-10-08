'use strict';
// Actual region model/controller; Electron and desktop host are recording fakes.
const Module=require('node:module'),{EventEmitter}=require('node:events');
let displays=[],seq=1;const windows=[],controllers=[];
class StubBrowserWindow extends EventEmitter{constructor(opts){super();this.opts=opts;this.destroyed=false;this.webContents=Object.assign(new EventEmitter(),{id:seq++,send(){},isDestroyed:()=>this.destroyed});windows.push(this);}loadFile(){queueMicrotask(()=>this.emit('ready-to-show'));}isDestroyed(){return this.destroyed;}destroy(){this.destroyed=true;this.emit('closed');}}
class FakeHost extends EventEmitter{constructor(opts){super();this.opts=opts;this.mode='attached';}start(){return Promise.resolve();}stop(){return{released:true};}setScreenRect(){return true;}setHidden(){}focusAfterClick(){return false;}describe(){return{mode:this.mode};}}
const electron={BrowserWindow:StubBrowserWindow,Menu:{buildFromTemplate:()=>({popup(){}})},dialog:{showMessageBox:async()=>({response:0})},app:{getVersion:()=> 'test',getAppMetrics:()=>[]},screen:{getPrimaryDisplay:()=>displays[0],getAllDisplays:()=>displays,dipToScreenRect:(_w,r)=>({...r}),on(){}},powerMonitor:{on(){}}};
const load=Module._load;let RegionController;try{Module._load=function(n,...a){if(n==='electron')return electron;if(n==='../desktop/region-host')return{RegionHost:FakeHost};return load.call(this,n,...a);};({RegionController}=require('../../src/main/regions/controller'));}finally{Module._load=load;}
function setDisplays(list){displays=list;}
function open(settings={}){const data={apps:[],settings:{randomTheme:false,...structuredClone(settings)}},writes=[];const store={writes,data,dataPath:'Z:/not-a-real-profile/data.json',get:k=>data[k],set:(k,v)=>{data[k]=v;writes.push({key:k,value:structuredClone(v)});},settings:()=>data.settings,rendererView:()=>undefined,pendingRendererState:()=>null,recheck(){}};const ctl=new RegionController({store,validThemes:new Set(['cyberpunk','matrix']),testHooks:true,log(){}});controllers.push(ctl);ctl.init();const region=data.regions[0],rt=ctl.rt.get(region.id);return{store,ctl,region,rt};}
function closeAll(){for(const ctl of controllers.splice(0))ctl.releaseAll();for(const win of windows.splice(0))if(!win.destroyed)win.destroy();}
module.exports={setDisplays,open,closeAll,StubBrowserWindow,electron,RegionController};
