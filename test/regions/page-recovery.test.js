'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(process.env.QL_BASELINE_CONTROLLER || path.join(__dirname,'../../src/main/regions/controller.js'),'utf8');
function method(name,next,context={}){
  const start=source.indexOf('  '+name+'('),end=source.indexOf('\n  '+next+'(',start);
  if(start<0||end<0)return null;
  return vm.runInNewContext('({'+source.slice(start,end)+'}).'+name,context);
}
const reset=method('_resetPageInteractions','setActive');
const toggle=method('toggleForeground','_returnToDesktop',{desktopLayer:{foregroundToken:()=>({hwnd:1})}});
function state(){
  const r={id:'region',extras:{renaming:true},host:{endDragRaise(){},mode:'attached',busy:false,captureForeground:()=>({}),beginForeground:()=>true},win:{isDestroyed:()=>false},
    menuOpen:true,previewBase:{shown:{x:1,y:2,width:100,height:100},anchor:{x:51,y:52}},drag:{start:{x:3}},resize:{start:{x:4}}};
  const c={rt:new Map([[r.id,r]]),shellMenuPending:0,tileDrag:{sourceId:r.id},log(){},_managerChanged(){},_applyShown(_rt,b){this.restored=b;},
    _cancelTileDrag(){this.tileDrag=null;},_returnToDesktop(){this.foregroundSession=null;return true;}};
  return {r,c};
}
test('reload discards the departed page blockers so Ctrl+Space works again without discarding saved state',()=>{
  const {r,c}=state();assert.equal(toggle.call(c),false);
  assert.equal(typeof reset,'function','page invalidation has a reset');reset.call(c,r);
  assert.equal(r.menuOpen,false);assert.equal(r.extras.renaming,false);assert.equal(r.previewBase,null);assert.equal(r.drag,null);assert.equal(r.resize,null);
  assert.equal(c.tileDrag,null);assert.deepEqual(c.restored,{x:1,y:2,width:100,height:100});
  assert.equal(toggle.call(c),true);assert.equal(toggle.call(c),true);
});
test('valid active rename/menu/gesture work is still protected; a queued shell action is not cleared',()=>{
  assert.equal(typeof reset,'function');
  for(const flag of ['drag','resize','previewBase','menuOpen']){
    const {r,c}=state();reset.call(c,r);r[flag]=true;assert.equal(toggle.call(c),false,flag);
  }
  const {r,c}=state();reset.call(c,r);r.extras.renaming=true;assert.equal(toggle.call(c),false);
  reset.call(c,r);c.shellMenuPending=1;reset.call(c,r);assert.equal(toggle.call(c),false);
});
test('all document invalidation paths call the same scoped reset',()=>{
  assert.match(source,/const invalidateShellPage = \(\) => \{[\s\S]*?this\._resetPageInteractions\(rt\)/);
  assert.match(source,/win\.webContents\.on\('did-start-loading', invalidateShellPage\)/);
  assert.match(source,/win\.webContents\.on\('render-process-gone', invalidateShellPage\)/);
  assert.match(source,/win\.on\('closed', \(\) => \{[\s\S]*?this\._resetPageInteractions\(rt\)/);
});
