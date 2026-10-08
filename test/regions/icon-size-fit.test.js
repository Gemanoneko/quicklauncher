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

const MESSAGE='No room at this icon size. Use a smaller size.';
function bytes(t){return JSON.stringify({data:t.data,rt:[...t.ctl.rt.values()].map(r=>({shown:r.shown,anchor:r.radialAnchor,geometry:r.radialGeometry,extras:r.extras,previewBase:r.previewBase,rects:r.host.rects,hidden:r.host.hidden})),sent:t.sent});}
test('every selectable size/count/direction uses exact rounded geometry at exact-fit and one-pixel-over display limits',()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(100,100),items:0}]});let checks=0;
 try{for(const layout of ['fan','ring'])for(const direction of Rad.DIRECTIONS)for(let count=0;count<=Rad.CAPS[layout];count++)for(let S=32;S<=128;S+=8){
  t.data.regions[0].layout=layout;t.data.regions[0].fanDirection=direction;t.data.apps=Array.from({length:count},(_,i)=>({id:String(i),regionId:'r1'}));const g=Rad.geometry(layout,count,S,direction);
  matching=()=>({x:0,y:0,width:g.width+48,height:g.height+48});assert.equal(t.ctl._iconSizeFits(S),true);checks++;
  matching=()=>({x:0,y:0,width:g.width+47,height:g.height+48});assert.equal(t.ctl._iconSizeFits(S),false);checks++;
  matching=()=>({x:0,y:0,width:g.width+48,height:g.height+47});assert.equal(t.ctl._iconSizeFits(S),false);checks++;
 }assert.equal(checks,3744);}finally{matching=null;t.done();}
});
test('one hidden nonprimary radial region on its own display atomically refuses the entire settings patch',()=>{
 const t=make({iconSize:32,regions:[{id:'r1',layout:'grid',rect:R(100,100),items:0},{id:'r2',layout:'ring',rect:R(1000,100,220,220),items:7}]});
 try{t.ctl.hidden=true;t.ctl.rt.get('r2').host.hidden=true;matching=r=>({x:r.x<900?0:900,y:0,width:r.x<900?1920:340,height:r.x<900?1040:340});const before=bytes(t);const res=t.ctl.applySettingsPatch({iconSize:64,randomTheme:true});assert.deepEqual(res,{ok:false,iconSize:32,error:MESSAGE});assert.equal(bytes(t),before);}finally{matching=null;t.done();}
});
test('nonmonotonic Fan cap is not a proxy for empty/one-item icon fit',()=>{
 const t=make({iconSize:32,regions:[{id:'r1',layout:'fan',rect:R(12,12,112,182),items:0}]});
 try{matching=()=>({x:0,y:0,width:500,height:242});assert.equal(Rad.capacity('fan',64,matching()),4);const before=bytes(t);assert.equal(t.ctl.applySettingsPatch({iconSize:64}).ok,false);assert.equal(bytes(t),before);}finally{matching=null;t.done();}
});
test('a stored box fitting while its valid preview fails rejects without cancelling or mutating preview',async()=>{
 const t=make({iconSize:32,regions:[{id:'r1',layout:'ring',rect:R(12,12,220,220),items:6}]});
 try{WA={x:0,y:0,width:350,height:350};assert.equal(t.ctl.setExtras('r1',{preview:true}).preview,true);const before=bytes(t);assert.ok(Rad.geometry('ring',6,64).width<=302);assert.ok(Rad.geometry('ring',7,64).width>302);assert.equal(t.ctl.applySettingsPatch({iconSize:64}).ok,false);assert.equal(bytes(t),before);assert.equal(t.ctl.rt.get('r1').extras.preview,true);}finally{matching=null;t.done();}
});
test('test work-area override remains authoritative over real-display matching',()=>{
 const t=make({iconSize:32,regions:[{id:'r1',layout:'ring',rect:R(100,100,220,220),items:8}]});
 try{matching=()=>({width:1920,height:1040});t.ctl._testWorkArea={x:0,y:0,width:300,height:300};assert.equal(t.ctl.applySettingsPatch({iconSize:64}).ok,false);}finally{matching=null;t.done();}
});
test('accepted sizes and unrelated/nonradial settings keep existing write and refresh behavior',()=>{
 for(const layout of ['grid','column','row','fan','ring']){const t=make({iconSize:64,regions:[{id:'r1',layout,rect:R(100,100),items:2}]});try{const res=t.ctl.applySettingsPatch({iconSize:72});assert.deepEqual(res,{ok:true,iconSize:72});assert.equal(t.data.settings.iconSize,72);assert.ok(t.sent.some(m=>m.ch==='settings-changed-externally'));assert.equal(t.ctl.applySettingsPatch({randomTheme:true}).ok,true);assert.equal(t.data.settings.randomTheme,true);}finally{matching=null;t.done();}}
});
test('actual preflight-removal mutant reaches forbidden settings/broadcast mutations',()=>{
 let writes=0;const actor={settings:()=>({iconSize:32}),_iconSize:()=>32,_iconSizeFits:()=>false,store:{set:()=>writes++},broadcastSettingsChanged:()=>writes++};const res=RegionController.prototype.applySettingsPatch.call(actor,{iconSize:128});assert.equal(res.ok,false);assert.equal(writes,0);
 const source=RegionController.prototype.applySettingsPatch.toString(),mutant=source.replace(/    if \(Object\.prototype\.hasOwnProperty\.call\(patch,'iconSize'\)[\s\S]*?\n    }/,'');assert.notEqual(mutant,source);const bad=Function('return function '+mutant)();bad.call(actor,{iconSize:128});assert.equal(writes,2,'omitted guard causes settings write and broadcast');
});

test('accepted icon size recomputes valid preview and cancellation baseline at the new size',()=>{
 const t=make({iconSize:32,regions:[{id:'r1',layout:'ring',rect:R(300,200,220,220),items:6}]});
 try{const s=shaped(t);assert.equal(t.ctl.setExtras('r1',{preview:true}).preview,true);assert.equal(t.ctl.applySettingsPatch({iconSize:64}).ok,true);assert.equal(s.rt.extras.preview,true);assert.equal(s.rt.radialGeometry.S,64);assert.equal(s.rt.radialGeometry.count,7);t.ctl.setExtras('r1',{preview:false});const g=Rad.geometry('ring',6,64);assert.equal(t.shown('r1').width,g.width);assert.equal(t.shown('r1').height,g.height);assert.equal(s.shapes.at(-1),JSON.stringify(Rad.shapeRects(g)));assert.equal(t.data.apps.length,6);}finally{matching=null;t.done();}
});
test('accepted icon size followed by preview commit keeps the recomputed preview box/shape',()=>{
 const t=make({iconSize:32,regions:[{id:'r1',layout:'ring',rect:R(300,200,220,220),items:6}]});
 try{const s=shaped(t);t.ctl.setExtras('r1',{preview:true});assert.equal(t.ctl.applySettingsPatch({iconSize:64}).ok,true);const box=t.shown('r1'),shape=s.shapes.at(-1);assert.equal(t.ctl.addItems('r1',[{id:'new',path:'C:/new.exe',name:'New'}]).ok,true);assert.equal(t.ctl.info('r1').radial.count,7);assert.equal(t.ctl.info('r1').radial.S,64);assert.equal(s.rt.extras.preview,false);assert.deepEqual(t.shown('r1'),box);assert.equal(s.shapes.at(-1),shape);}finally{matching=null;t.done();}
});
