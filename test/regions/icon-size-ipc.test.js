'use strict';
// Plain Node: node --test test/
// M4, Column and Row (regions UX spec 2.3, 2.4, 3.3, 9.2, 8.1; tech plan § 9):
// the real RegionController with `electron` and the desktop host stubbed (no
// window, no display, no Win32). Layout switch (anchor, room, refusal, Grid's
// remembered size), size that follows content (90%, room, edit bar, notice),
// the home rule on display change, creation, and the menus.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { EventEmitter } = require('node:events');

// ── stubs (as controller.test.js) ──────────────────────────────────────────
const screenOn = {};
let WA = { x: 0, y: 0, width: 1920, height: 1040 };
class FakeHost extends EventEmitter {
  constructor(opts) { super(); this.opts = opts; this.mode = 'attached'; this.rects = []; this.hidden = !!opts.hidden; }
  start() { return Promise.resolve(); }
  tick() { return Promise.resolve(); }
  setScreenRect(r) { this.rects.push(r); return true; }
  setHidden(h) { this.hidden = !!h; }
  focusAfterClick() { return false; }
  describe() { return { mode: this.mode }; }
  stop() { return { released: true }; }
}
let wcSeq = 500;
class FakeBrowserWindow extends EventEmitter {
  constructor() { super(); this.webContents = Object.assign(new EventEmitter(), { id: ++wcSeq, send() {}, isDestroyed: () => false }); }
  loadFile() {}
  isDestroyed() { return false; }
  destroy() {}
}
let matching = null;
const fakeElectron = {
  BrowserWindow: FakeBrowserWindow,
  Menu: { buildFromTemplate: () => ({ popup() {} }) },
  dialog: { showMessageBox: async () => ({ response: 0 }) },
  screen: {
    getPrimaryDisplay: () => ({ workArea: { ...WA } }),
    getDisplayMatching: rect => ({workArea:matching ? matching(rect) : {...WA}}),
    dipToScreenRect: (_w, r) => ({ ...r }),
    on: (ev, fn) => { (screenOn[ev] = screenOn[ev] || []).push(fn); },
  },
  powerMonitor: { on() {} },
  app: { getVersion: () => '0.0.0-test', getAppMetrics: () => [] },
};
const realLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === 'electron') return fakeElectron;
  if (/[\\/]desktop[\\/]region-host$/.test(request) || request === '../desktop/region-host') return { RegionHost: FakeHost };
  return realLoad.call(this, request, parent, isMain);
};
const { RegionController } = require('../../src/main/regions/controller');
Module._load = realLoad;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = (x, y, width = 424, height = 300) => ({ x, y, width, height });
const tooClose = (a, b, gap = 12) => a.x < b.x + b.width + gap && b.x < a.x + a.width + gap && a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;

/**
 * regions: [{ id, layout, rect, items }]; defaults: r1 Grid at (100,100) with 3
 * items, r2 Grid at (1000,100) with 2, r3 Grid at (1000,600) empty.
 */
function make({ regions = null, iconSize = 64 } = {}) {
  WA = { x: 0, y: 0, width: 1920, height: 1040 };
  for (const k of Object.keys(screenOn)) delete screenOn[k];
  const home = { ...WA };
  const spec = regions || [
    { id: 'r1', layout: 'grid', rect: R(100, 100), items: 3 },
    { id: 'r2', layout: 'grid', rect: R(1000, 100), items: 2 },
    { id: 'r3', layout: 'grid', rect: R(1000, 600), items: 0 },
  ];
  const apps = [];
  for (const r of spec) for (let i = 0; i < (r.items || 0); i++) apps.push({ id: `${r.id}-${i}`, name: `${r.id.toUpperCase()} ${i}`, path: `C:\\${r.id}-${i}.exe`, iconDataUrl: '', regionId: r.id });
  const data = {
    apps,
    settings: { theme: 'matrix', randomTheme: false, matchAll: false, sharedTheme: null, managerBounds: null, iconSize },
    regions: spec.map((r, i) => ({ id: r.id, name: i ? `Region ${i}` : 'QUICK.LAUNCH', icon: 'apps', layout: r.layout, theme: 'matrix', rect: { ...r.rect }, home: { ...home }, ...(r.gridSize ? { gridSize: r.gridSize } : {}) })),
    regionsVersion: 1,
  };
  const store = {
    data, dataPath: 'Z:\\nowhere\\quicklauncher-data.json',
    get: (k) => data[k], set: (k, v) => { data[k] = v; },
    rendererView: () => undefined, setFromRenderer() {}, pendingRendererState: () => null, recheck() {}, rendererSynced() {},
  };
  const ctl = new RegionController({ store, validThemes: new Set(['matrix', 'tron']), testHooks: true, log: () => {} });
  ctl.init();
  const sent = [];
  for (const rt of ctl.rt.values()) {
    rt.ready = true;
    rt.wc = { id: rt.id, isDestroyed: () => false, send: (ch, msg) => sent.push({ to: rt.id, ch, msg }) };
  }
  const shown = (id) => ({ ...ctl.rt.get(id).shown });
  const saved = (id) => ({ ...data.regions.find((r) => r.id === id).rect });
  const rec = (id) => data.regions.find((r) => r.id === id);
  const lastRect = (id) => { const h = ctl.rt.get(id).host; return h.rects[h.rects.length - 1]; };
  return { ctl, data, sent, shown, saved, rec, lastRect, done: () => ctl.releaseAll() };
}
const fireDisplay = () => screenOn['display-metrics-changed'].forEach((fn) => fn());


const Rad=require('../../src/renderer/radial-layout');
function shaped(t,id='r1'){const rt=t.ctl.rt.get(id),shapes=[];rt.win={isDestroyed:()=>false,setShape:a=>shapes.push(JSON.stringify(a))};t.ctl._applyShape(rt,t.rec(id));return{rt,shapes};}


const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
function contract(t,{mutant=false}={}){
 const code=fs.readFileSync(path.join(root,'src/main/ipc.js'),'utf8'),patch=code.slice(code.indexOf('function settingsPatch(settings) {'),code.indexOf('// A picker entry'));
 let handler=code.slice(code.indexOf("  ipcMain.handle('save-settings'"),code.indexOf('  // Store delivery:'));
 if(mutant)handler=handler.replace('return result;','void result;');
 const handlers={};let refreshed=0;
 vm.runInNewContext(patch+handler,{ipcMain:{handle:(ch,fn)=>handlers[ch]=fn},regionOf:e=>e.sender==='region'?'r1':null,fromManager:e=>e.sender==='manager',ctl:t.ctl,store:{get:k=>t.data[k]},refreshTrayMenu:()=>refreshed++});
 let api;vm.runInNewContext(fs.readFileSync(path.join(root,'src/main/manager-preload.js'),'utf8'),{process:{argv:[]},require:n=>{assert.equal(n,'electron');return{contextBridge:{exposeInMainWorld:(_name,a)=>api=a},ipcRenderer:{invoke:(ch,...args)=>Promise.resolve(handlers[ch]({sender:'manager'},...args)),on(){},removeListener(){}}};}});
 return{api,handler:handlers['save-settings'],refreshed:()=>refreshed};
}
test('real save-settings handler and real Manager preload forward authoritative rejection and acceptance',async()=>{
 const t=make({iconSize:32,regions:[{id:'r1',layout:'ring',rect:R(100,100,220,220),items:8}]});
 try{WA={x:0,y:0,width:350,height:350};const c=contract(t),before=JSON.stringify(t.data);const r=await c.api.invoke('save-settings',{iconSize:64,startWithWindows:false});assert.equal(r.ok,false);assert.equal(r.iconSize,32);assert.equal(r.error,'No room at this icon size. Use a smaller size.');assert.equal(JSON.stringify(t.data),before);assert.equal(c.refreshed(),0);
  WA={x:0,y:0,width:1920,height:1040};const accepted=await c.api.invoke('save-settings',{iconSize:72,randomTheme:true});assert.equal(accepted.ok,true);assert.equal(accepted.iconSize,72);assert.equal(t.data.settings.iconSize,72);assert.equal(c.refreshed(),1);assert.throws(()=>c.api.invoke('not-an-allowed-channel'),/Blocked IPC channel/);
 }finally{matching=null;t.done();}
});
test('Manager authentication and theme-only region sender cannot write global icon size',()=>{
 const t=make();try{const c=contract(t),before=t.data.settings.iconSize;c.handler({sender:'intruder'},{iconSize:128});c.handler({sender:'region'},{iconSize:128});assert.equal(t.data.settings.iconSize,before);}finally{matching=null;t.done();}
});
test('known-bad omitted IPC response is detected through the actual preload',async()=>{
 const t=make();try{const c=contract(t,{mutant:true}),r=await c.api.invoke('save-settings',{iconSize:72});assert.equal(r,undefined);assert.equal(t.data.settings.iconSize,72);assert.throws(()=>assert.equal(r&&r.iconSize,72));}finally{matching=null;t.done();}
});
