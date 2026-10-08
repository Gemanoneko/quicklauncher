'use strict';
const test=require('node:test'), assert=require('node:assert/strict'), vm=require('node:vm'), fs=require('node:fs'), path=require('node:path');
const {EventEmitter}=require('node:events');
const root=path.resolve(__dirname,'../..');
function main(source=fs.readFileSync(path.join(root,'src/main/updater.js'),'utf8')) {
  const auto=new EventEmitter(), handlers={}, primary=[], manager=[], dots=[];
  let checks=0, downloads=0, installs=0;
  auto.checkForUpdates=()=>{checks++; return Promise.resolve();};
  auto.downloadUpdate=()=>{downloads++; return Promise.resolve();};
  auto.quitAndInstall=()=>{installs++;};
  const module={exports:{}};
  const context={module, process:{argv:['--ql-no-update-check']},setTimeout(){throw Error('timer forbidden');},require(name){
    if(name==='electron-updater')return {autoUpdater:auto};
    if(name==='electron')return {app:{isPackaged:true},ipcMain:{handle:(ch,fn)=>{handlers[ch]=fn;}}};
    if(name==='./tray')return {setUpdateAvailable:flag=>dots.push(flag)};
    throw Error('unexpected require '+name);
  }};
  vm.runInNewContext(source,context);
  module.exports.setupUpdater(()=>({isDestroyed:()=>false,send:(...a)=>primary.push(a)}),()=>({isDestroyed:()=>false,send:(...a)=>manager.push(a)}));
  return {api:module.exports,auto,handlers,primary,manager,dots,counts:()=>({checks,downloads,installs})};
}
test('main owns offer and answers an opening Manager; copy cannot change live state',()=>{
 const m=main(); m.auto.emit('update-available',{version:'1.95.0'});
 assert.equal(m.handlers['get-update-state']().offer,'available');
 assert.equal(m.manager.at(-1)[0],'manager:update-state');
 const copy=m.api.getUpdateState(); copy.offer='ready'; assert.equal(m.api.getUpdateState().offer,'available');
});
test('main guards download, check and install before async work; errors restore download route',async()=>{
 const m=main(); await m.handlers['download-update'](); m.handlers['install-update']();
 assert.deepEqual(m.counts(),{checks:0,downloads:0,installs:0});
 m.api.checkForUpdates(); m.api.checkForUpdates(); assert.equal(m.counts().checks,1);
 m.auto.emit('update-available',{version:'1.95.0'});
 const first=m.handlers['download-update'](); await m.handlers['download-update'](); m.api.checkForUpdates(); await first;
 assert.deepEqual(m.counts(),{checks:1,downloads:1,installs:0});
 m.auto.emit('error',Error('failed')); assert.equal(m.api.getUpdateState().offer,'available');
 await m.handlers['download-update'](); assert.equal(m.counts().downloads,2);
 m.auto.emit('update-downloaded'); m.handlers['install-update'](); m.handlers['install-update'](); assert.equal(m.counts().installs,1);
});
test('dismiss clears tray only; test hook and real events use same published record',()=>{
 const m=main(); m.api.publish('update-available',{version:'2.0.0'}); m.handlers['dismiss-update']();
 assert.equal(m.api.getUpdateState().offer,'available'); assert.equal(m.api.dismissals(),1); assert.equal(m.dots.at(-1),false);
 m.api.publish('update-progress',47); assert.equal(m.api.getUpdateState().percent,47);
 m.api.publish('update-error','failed'); assert.equal(m.api.getUpdateState().offer,'available');
 m.api.publish('update-not-available'); assert.equal(m.api.getUpdateState().offer,'none');
});
function renderer(source=fs.readFileSync(path.join(root,'src/renderer/manager.js'),'utf8')) {
 const start=source.indexOf('  let updateState ='),end=source.indexOf("  $('btn-close-settings')",start);
 assert.ok(start>=0&&end>start,'F5 production block present');
 const elements={},calls=[],listeners={};
 const $=id=>elements[id]||(elements[id]={textContent:'',title:'',attributes:{},classes:new Set(),listeners:{},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];},addEventListener(k,fn){this.listeners[k]=fn;},classList:{toggle(k,on){if(on)elements[id].classes.add(k);else elements[id].classes.delete(k);}}});
 const ctx={$ ,api:{invoke:ch=>calls.push(ch),on:(ch,fn)=>{listeners[ch]=fn;}}};
 vm.runInNewContext(source.slice(start,end)+'\nthis.draw=drawUpdate;',ctx);
 return {draw:ctx.draw,$,calls,push:(state,channel,arg)=>listeners['manager:update-state']({state,channel,arg})};
}
test('Manager state text, status persistence and disabled click behavior match spec',()=>{
 const r=renderer(),none={offer:'none',checking:false,percent:0};
 r.draw(none); assert.ok(r.$('mgr-update').classes.has('hidden'));
 r.draw({...none,checking:true}); assert.equal(r.$('update-status').textContent,'CHECKING FOR UPDATES...');
 r.$('btn-check-update').listeners.click(); assert.equal(r.calls.length,0);
 r.push({...none,offer:'available',version:'1.95.0'},'update-available');
 assert.equal(r.$('mgr-update-text').textContent,'UPDATE AVAILABLE — v1.95.0'); r.$('btn-mgr-update').listeners.click(); assert.deepEqual(r.calls,['download-update']);
 r.push({...none,offer:'downloading',percent:47},'update-progress');
 assert.equal(r.$('mgr-update-text').textContent,'DOWNLOADING... 45%'); assert.equal(r.$('btn-mgr-update').getAttribute('aria-disabled'),'true');
 r.$('btn-mgr-update').listeners.click(); r.$('btn-check-update').listeners.click(); assert.equal(r.calls.length,1);
 r.push({...none,offer:'ready'},'update-ready'); assert.equal(r.$('btn-mgr-update').textContent,'INSTALL NOW'); r.$('btn-mgr-update').listeners.click(); assert.equal(r.calls.at(-1),'install-update');
 r.push(none,'update-error','x'.repeat(164)); assert.equal(r.$('update-status').title,'UPDATE ERROR: '+'x'.repeat(164));
 r.draw(none); assert.equal(r.$('update-status').title,'UPDATE ERROR: '+'x'.repeat(164));
 assert.equal(renderer().$('update-status').textContent,'');
});
test('positive control: removing main download guard produces duplicate downloads',async()=>{
 const s=fs.readFileSync(path.join(root,'src/main/updater.js'),'utf8').replace("    if (state.offer !== 'available') return;",'');
 const m=main(s); m.auto.emit('update-available',{version:'x'}); await m.handlers['download-update'](); await m.handlers['download-update']();
 assert.equal(m.counts().downloads,2);
});
test('positive control: progress disables banner DOWNLOAD even behind notice',()=>{
 const {createBanner}=require('../../src/renderer/banner-layers');
 let draw; const b=createBanner({draw:v=>draw=v,setTimer:()=>1,clearTimer(){}});
 b.setUpdate('offer',[{action:'download',label:'DOWNLOAD'}]); b.showNotice('notice'); b.updateProgress(45); b.endNotice();
 assert.equal(draw.actions[0].disabled,true); assert.equal(draw.actions[0].label,'DOWNLOADING...');
});

test('every region menu offers current update above Settings and opens Manager Settings',()=>{
 const source=fs.readFileSync(path.join(root,'src/main/regions/controller.js'),'utf8');
 const start=source.indexOf('  popupRegionMenu(id, x, y) {'),end=source.indexOf('\n  popupTileMenu(',start);
 const fn=vm.runInNewContext('({'+source.slice(start,end)+'}).popupRegionMenu',{M:{BUILT_LAYOUTS:['grid','column','row']},layoutLabel:x=>x});
 for(const layout of ['grid','column','row'])for(const offer of ['none','available','downloading','ready']){
  let menu,opened;
  const fake={rt:new Map([['r',{win:{}}]]),region:()=>({layout}),settings:()=>({}),regions:()=>[{id:'r'}],_movedItems:()=>[],manager:{open:v=>opened=v},getUpdateState:()=>({offer,version:'1.95.0'}),_popup:(_type,_rt,t)=>menu=t};
  fn.call(fake,'r',0,0);
  const settings=menu.findIndex(x=>x.label==='Settings…');
  const expected=offer==='available'?'Update available — v1.95.0…':offer==='downloading'?'Update downloading…':offer==='ready'?'Update ready to install…':null;
  if(expected){assert.equal(menu[settings-1].label,expected);menu[settings-1].click();assert.equal(opened,'settings');}
  else assert.equal(menu[settings-1].type,'separator');
 }
});

test('F5 title and accessible name equal committed table in every applicable state',()=>{
 const r=renderer();
 const cases=[
  [{offer:'none',checking:false},null,'Check for a newer version'],
  [{offer:'none',checking:true},null,'Checking for updates.'],
  [{offer:'available',version:'1.95.0',checking:false},'Download the update. QuickLauncher keeps running.','Check for a newer version'],
  [{offer:'downloading',percent:45,checking:false},'The update is downloading.','The update is downloading.'],
  [{offer:'ready',checking:false},'Close QuickLauncher, install the update, and start it again.','The update is ready to install.'],
 ];
 for(const [state,strip,check] of cases){
  r.draw(state);
  for(const [id,expected] of [['btn-mgr-update',strip],['btn-check-update',check]]){
   if(expected===null)continue;
   assert.equal(r.$(id).title,expected);assert.equal(r.$(id).getAttribute('aria-label'),expected);
  }
 }
});
test('positive control: missing accessible name fails F5 title parity',()=>{
 const source=fs.readFileSync(path.join(root,'src/renderer/manager.js'),'utf8').replace("    button.setAttribute('aria-label', title);",'');
 const r=renderer(source);r.draw({offer:'available',version:'x',checking:false});
 assert.notEqual(r.$('btn-mgr-update').getAttribute('aria-label'),r.$('btn-mgr-update').title);
 assert.notEqual(r.$('btn-check-update').getAttribute('aria-label'),r.$('btn-check-update').title);
});
