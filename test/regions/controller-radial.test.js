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
const fakeElectron = {
  BrowserWindow: FakeBrowserWindow,
  Menu: { buildFromTemplate: () => ({ popup() {} }) },
  dialog: { showMessageBox: async () => ({ response: 0 }) },
  screen: {
    getPrimaryDisplay: () => ({ workArea: { ...WA } }),
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
test('M5 Grid switch preserves items and puts radial pivot at former box centre',async()=>{
 for(const layout of ['fan','ring']){const t=make({regions:[{id:'r1',layout:'grid',rect:R(300,200),items:6},{id:'r2',layout:'grid',rect:R(1000,600),items:0}]});try{
  const before=JSON.stringify(t.data.apps),s=shaped(t);const res=await t.ctl.setLayout('r1',layout);assert.equal(res.ok,true);const g=t.ctl.info('r1').radial;
  assert.ok(Math.abs(t.shown('r1').x+g.pivot.x-512)<=.5);assert.ok(Math.abs(t.shown('r1').y+g.pivot.y-350)<=.5);assert.equal(JSON.stringify(t.data.apps),before);assert.ok(s.shapes.at(-1).length>0);
 }finally{t.done();}}
});
test('M5 Fan directions rotate around the preserved pivot without saving items',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(700,400),items:1}]});try{shaped(t);await t.ctl.setLayout('r1','fan');const before=JSON.stringify(t.data.apps),anchor={...t.rec('r1').radialAnchor};
 for(const dir of ['right','down','left','up']){const res=t.ctl.setFanDirection('r1',dir);assert.equal(res.ok,true);assert.equal(t.ctl.info('r1').fanDirection,dir);assert.deepEqual(t.rec('r1').radialAnchor,anchor);assert.equal(JSON.stringify(t.data.apps),before);}
 }finally{t.done();}
});
test('accepted radial preview expands then restores exact bounds, anchor and shape on cancel',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,300),items:6}]});try{const s=shaped(t);await t.ctl.setLayout('r1','ring');const old={shown:t.shown('r1'),anchor:{...s.rt.radialAnchor},shape:s.shapes.at(-1),items:JSON.stringify(t.data.apps)};
 const over=t.ctl.setExtras('r1',{preview:true});assert.equal(over.ok,true);assert.equal(over.preview,true);assert.equal(t.ctl.info('r1').radial.count,7);assert.ok(t.shown('r1').width>old.shown.width);
 const gone=t.ctl.setExtras('r1',{preview:false});assert.equal(gone.ok,true);assert.deepEqual(t.shown('r1'),old.shown);assert.deepEqual(s.rt.radialAnchor,old.anchor);assert.equal(s.shapes.at(-1),old.shape);assert.equal(JSON.stringify(t.data.apps),old.items);
 }finally{t.done();}
});
test('rejected radial preview leaves bounds/shape/items unchanged and names refusal',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,300),items:6}]});try{const s=shaped(t);await t.ctl.setLayout('r1','ring');const shown=t.shown('r1'),shape=s.shapes.at(-1),items=JSON.stringify(t.data.apps);t.ctl.workArea=()=>({x:0,y:0,width:100,height:100});
 const res=t.ctl.setExtras('r1',{preview:true});assert.equal(res.ok,false);assert.equal(res.previewRejected,true);assert.equal(res.preview,false);assert.equal(res.error,'No room for this layout. Move the region first.');assert.deepEqual(t.shown('r1'),shown);assert.equal(s.shapes.at(-1),shape);assert.equal(JSON.stringify(t.data.apps),items);
 }finally{t.done();}
});
test('radial add preflight refuses full/no-room before store mutation; duplicate path adds no count',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,300),items:2}]});try{shaped(t);await t.ctl.setLayout('r1','fan');const before=JSON.stringify(t.data.apps);
 const duplicate=t.ctl.addItems('r1',[{...t.data.apps[0]}]);assert.equal(duplicate.added,0);assert.equal(JSON.stringify(t.data.apps),before);
 t.ctl._findRadialFit=()=>null;const r=t.ctl.addItems('r1',[{id:'new',name:'New',path:'C:/new.exe'}]);assert.equal(r.ok,false);assert.equal(r.added,0);assert.equal(JSON.stringify(t.data.apps),before);
 }finally{t.done();}
});
test('radial caps and layout menu refuse an over-cap switch without mutation',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,300),items:13}]});try{const before=JSON.stringify(t.data);const res=await t.ctl.setLayout('r1','ring');assert.equal(res.ok,false);assert.equal(res.error,'13 shortcuts. Ring holds 12.');assert.equal(JSON.stringify(t.data),before);
 }finally{t.done();}
});
test('native shape failure fails closed instead of leaving transparent rectangle interactive',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,300),items:1}]});try{const s=shaped(t);await t.ctl.setLayout('r1','ring');s.rt.win.setShape=()=>{throw Error('shape unavailable');};t.ctl._applyShape(s.rt,t.rec('r1'));assert.equal(s.rt.shapeBlocked,true);assert.equal(s.rt.host.hidden,true);
 }finally{t.done();}
});
test('known-bad full rectangular shape is detected by corner containment',()=>{
 const g=Rad.geometry('ring',8,64),good=Rad.shapeRects(g),bad=[{x:0,y:0,width:g.width,height:g.height}],covers=(rs,x,y)=>rs.some(r=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height);
 assert.equal(covers(good,0,0),false);assert.equal(covers(bad,0,0),true);
});

test('largest Fan cap never substitutes for actual empty or one-item box fit',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',items:1,rect:{x:12,y:12,width:200,height:160}}]});
 try {WA={x:0,y:0,width:500,height:242};assert.equal(Rad.capacity('fan',64,t.ctl.workArea()),4);const before=JSON.stringify(t.data);assert.equal(t.ctl.createRegion('fan').ok,false);assert.equal((await t.ctl.setLayout('r1','fan')).ok,false);assert.equal(JSON.stringify(t.data),before);const region={...t.rec('r1'),layout:'fan'};assert.equal(t.ctl._findRadialFit(region,0),null);assert.equal(t.ctl._findRadialFit(region,1),null);}
 finally{t.done();}
});

test('moving out and back changes radial geometry count while preserving every item',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(300,200),items:6},{id:'r2',layout:'grid',rect:R(1200,400),items:0}]});
 try{await t.ctl.setLayout('r1','ring');const ids=t.data.apps.map(a=>a.id),id=ids[0];assert.equal(t.ctl.moveItemToRegion(id,'r2').ok,true);assert.equal(t.ctl.info('r1').radial.count,5);assert.equal(t.ctl.moveItemToRegion(id,'r1').ok,true);assert.equal(t.ctl.info('r1').radial.count,6);assert.deepEqual(t.data.apps.map(a=>a.id).sort(),ids.sort());assert.equal(t.ctl.moveItemToRegion(id,'r1').ok,false);assert.equal(t.ctl.info('r1').radial.count,6);}
 finally{t.done();}
});

test('completed rejected tile drop reports refusal before leave without changing items',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(300,200),items:12},{id:'r2',layout:'grid',rect:R(1200,400),items:1}]});
 try{await t.ctl.setLayout('r1','ring');const id=t.data.apps.find(a=>a.regionId==='r2').id,before=JSON.stringify(t.data.apps);t.ctl.tileDrag={id:99,itemId:id,sourceId:'r2',targetId:'r1',dropping:'r1'};const res=t.ctl.tileDropFrom('r1',{dragId:99,index:0});assert.equal(res.ok,false);assert.equal(JSON.stringify(t.data.apps),before);const msgs=t.sent.filter(m=>m.ch==='region:tile-drop-preview').map(m=>m.msg);assert.deepEqual(msgs.map(m=>m.phase),['refused','leave']);assert.equal(msgs[0].text,'FULL (12 max)');}
 finally{t.done();}
});

test('renderer-created reference growth cannot bypass radial cap or mutate stored items',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(300,200),items:12}]});
 try{await t.ctl.setLayout('r1','ring');const before=JSON.stringify(t.data.apps),res=t.ctl.saveItemsFromRenderer('r1',[...t.data.apps,{id:'new',path:'C:/new.exe',name:'New'}]);assert.equal(res.ok,false);assert.equal(res.error,'FULL (12 max)');assert.equal(JSON.stringify(t.data.apps),before);const command=t.sent.find(x=>x.ch==='region:command'&&x.msg.cmd==='add-refused');assert.equal(command.msg.text,res.error);}
 finally{t.done();}
});

test('successful radial preview commits the real count once and keeps preview geometry',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(300,200),items:6},{id:'r2',layout:'grid',rect:R(1200,400),items:1}]});
 try{await t.ctl.setLayout('r1','ring');const state=shaped(t);assert.equal(t.ctl.setExtras('r1',{preview:true}).preview,true);const box=t.shown('r1'),shape=state.shapes.at(-1),id=t.data.apps.find(a=>a.regionId==='r2').id;assert.equal(t.ctl.moveItemToRegion(id,'r1').ok,true);assert.equal(t.ctl.info('r1').radial.count,7);assert.equal(state.rt.extras.preview,false);assert.equal(state.rt.previewBase,null);assert.deepEqual(t.shown('r1'),box);assert.equal(state.shapes.at(-1),shape);t.ctl.setExtras('r1',{preview:false});assert.deepEqual(t.shown('r1'),box);}
 finally{t.done();}
});
