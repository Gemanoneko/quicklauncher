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

const D = require('../../src/main/regions/display-adaptation');
test('display shrink uses actual rounded geometry at every count/direction/size boundary', () => {
  for(let size=32;size<=128;size+=8) for(const layout of ['fan','ring']) for(const direction of layout==='fan'?Rad.DIRECTIONS:['up']) for(let count=0;count<=Rad.CAPS[layout];count++) {
    const region={id:'r1',layout,fanDirection:direction}, g=Rad.geometry(layout,count,size,direction);
    const area={x:0,y:0,width:g.width+48,height:g.height+48};
    assert.equal(D.radialFits(region,count,size,area),true);
    assert.equal(D.radialFits(region,count,size,{...area,width:area.width-1}),false);
    assert.equal(D.radialFits(region,count,size,{...area,height:area.height-1}),false);
  }
});
test('automatic entry/restoration preserves all saved data; repeated transition announces once',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,200),items:12}]});try{
  shaped(t);await t.ctl.setLayout('r1','ring');const before=JSON.stringify(t.data), original=t.shown('r1');
  WA={x:0,y:0,width:620,height:440};t.ctl.relayoutAll('shrink');
  const rt=t.ctl.rt.get('r1');assert.equal(rt.displayFallback,true);assert.equal(t.ctl.info('r1').layout,'ring');assert.equal(t.ctl.info('r1').presentation,'grid');
  t.ctl.setExtras('r1',{gridMinimum:{width:350,height:270}});
  assert.equal(rt.host.hidden,false);assert.equal(rt.radialShape,false);assert.equal(JSON.stringify(t.data),before);
  const notices=t.sent.filter(s=>s.msg&&s.msg.cmd==='display-notice').length;
  t.ctl.relayoutAll('repeat');assert.equal(t.sent.filter(s=>s.msg&&s.msg.cmd==='display-notice').length,notices);
  WA={x:0,y:0,width:1920,height:1040};t.ctl.relayoutAll('restore');
  assert.equal(rt.displayFallback,false);assert.deepEqual(t.shown('r1'),original);assert.equal(JSON.stringify(t.data),before);
 }finally{t.done();}
});
test('temporary resize persists none; accepted moves translate preferred anchor and rect only',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,200),items:12}]});try{
  shaped(t);await t.ctl.setLayout('r1','ring');WA={x:0,y:0,width:850,height:470};t.ctl.relayoutAll('shrink');t.ctl.setExtras('r1',{gridMinimum:{width:350,height:270}});
  const before=JSON.stringify(t.data), saved={...t.rec('r1').rect}, anchor={...t.rec('r1').radialAnchor};
  t.ctl.resize('r1',{phase:'start',edges:{right:true,bottom:true}});t.ctl.resize('r1',{phase:'move',dx:30,dy:10,alt:true});t.ctl.resize('r1',{phase:'end'});
  assert.equal(JSON.stringify(t.data),before);assert.equal(t.ctl.rt.get('r1').pendingSave,null);
  const start=t.shown('r1');t.ctl.nudge('r1',-10,0);const delta=t.shown('r1').x-start.x;t.ctl.flushPendingRects();
  assert.deepEqual(t.rec('r1').rect,{...saved,x:saved.x+delta});assert.deepEqual(t.rec('r1').radialAnchor,{x:anchor.x+delta,y:anchor.y});assert.deepEqual(t.rec('r1').home,WA);
  assert.equal(t.rec('r1').layout,'ring');assert.equal(t.rec('r1').gridSize.width,424);
 }finally{t.done();}
});
test('tiny/crowded suppression remains runtime only and show cannot reveal an unsafe host',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,200),items:12}]});try{
  shaped(t);await t.ctl.setLayout('r1','ring');const before=JSON.stringify(t.data);
  WA={x:0,y:0,width:130,height:120};t.ctl.relayoutAll('tiny');t.ctl.showAll();assert.equal(t.ctl.rt.get('r1').host.hidden,true);assert.equal(t.ctl.info('r1').displaySuppressed,true);assert.equal(JSON.stringify(t.data),before);
  WA={x:0,y:0,width:1920,height:1040};t.ctl.relayoutAll('recover');assert.equal(t.ctl.rt.get('r1').host.hidden,false);assert.equal(t.ctl.info('r1').displaySuppressed,false);assert.equal(JSON.stringify(t.data),before);
 }finally{t.done();}
});
test('rename holds safe temporary Grid until it ends; edit and filter alone do not hold restoration',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,200),items:12}]});try{
  shaped(t);await t.ctl.setLayout('r1','ring');WA={x:0,y:0,width:620,height:440};t.ctl.relayoutAll('shrink');t.ctl.setExtras('r1',{gridMinimum:{width:350,height:270},edit:true,renaming:true});
  WA={x:0,y:0,width:1920,height:1040};t.ctl.relayoutAll('bigger');assert.equal(t.ctl.info('r1').displayFallback,true);
  t.ctl.setExtras('r1',{gridMinimum:{width:350,height:270},edit:true,renaming:false});assert.equal(t.ctl.info('r1').displayFallback,false);
 }finally{t.done();}
});
test('display interruption rolls move back and rejects late drag completion without saving',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,200),items:12}]});try{
  shaped(t);await t.ctl.setLayout('r1','ring');const before=JSON.stringify(t.data);
  t.ctl.drag('r1',{phase:'start'});t.ctl.drag('r1',{phase:'move',dx:70,dy:20,alt:true});t.ctl.relayoutAll('interrupted');
  assert.equal(t.ctl.drag('r1',{phase:'end'}).ok,false);assert.equal(JSON.stringify(t.data),before);
  t.ctl.tileDragFrom('r1',{phase:'start',itemId:'r1-0'});const dragId=t.ctl.tileDrag.id;t.ctl.relayoutAll('interrupt tile');assert.equal(t.ctl.tileDropFrom('r1',{dragId,index:0}).ok,false);assert.equal(JSON.stringify(t.data),before);
 }finally{t.done();}
});
test('explicit Grid adopts runtime viewport and ends automatic radial restoration',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,200),items:12}]});try{
  shaped(t);await t.ctl.setLayout('r1','ring');WA={x:0,y:0,width:620,height:440};t.ctl.relayoutAll('shrink');t.ctl.setExtras('r1',{gridMinimum:{width:350,height:270}});const visible=t.shown('r1');
  assert.equal((await t.ctl.setLayout('r1','grid')).ok,true);assert.deepEqual(t.rec('r1').rect,visible);assert.equal(t.ctl.info('r1').displayFallback,false);
  WA={x:0,y:0,width:1920,height:1040};t.ctl.relayoutAll('bigger');assert.equal(t.ctl.info('r1').layout,'grid');
 }finally{t.done();}
});

test('stale theme/icon measurement never replaces current minimum or reveals unsafe host',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,200),items:12}]});try{
  shaped(t);await t.ctl.setLayout('r1','ring');WA={x:0,y:0,width:620,height:440};t.ctl.relayoutAll('shrink');const rt=t.ctl.rt.get('r1');
  t.ctl.setExtras('r1',{gridMinimum:{width:350,height:270,iconSize:32,theme:'matrix'}});assert.equal(rt.gridMinimum,undefined);assert.equal(rt.host.hidden,true);
  t.ctl.setExtras('r1',{gridMinimum:{width:350,height:270,iconSize:64,theme:'matrix'}});assert.equal(rt.host.hidden,false);
  const accepted={...rt.gridMinimum};t.ctl.setExtras('r1',{gridMinimum:{width:180,height:150,iconSize:64,theme:'tron'}});assert.deepEqual(rt.gridMinimum,accepted);
 }finally{t.done();}
});

test('accepted Fan direction recovers a suppressed temporary panel through existing validated geometry',async()=>{
 const t=make({regions:[{id:'r1',layout:'grid',rect:R(500,200),items:6}]});try{
  shaped(t);await t.ctl.setLayout('r1','fan');WA={x:0,y:0,width:350,height:800};t.ctl.relayoutAll('narrow');
  assert.equal(t.ctl.rt.get('r1').displaySuppressed,true);
  assert.equal(t.ctl.setFanDirection('r1','left').ok,true);
  assert.equal(t.ctl.rt.get('r1').host.hidden,false);
 }finally{t.done();}
});
