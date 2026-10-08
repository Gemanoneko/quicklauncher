'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),app=fs.readFileSync(path.join(root,'src/renderer/app.js'),'utf8');
function apply(source) {
  const calls=[],theme={};
  const ctx={settings:{iconSize:72,theme:'matrix'},document:{documentElement:{style:{setProperty:(...v)=>calls.push(v)}}},$:()=>theme,applyReducedMotion(){},VALID_THEMES:new Set(['matrix']),startBannerCycle:t=>calls.push(['banner',t]),window:{qlRadialRefresh:()=>calls.push(['radial'])}};
  vm.runInNewContext(source+';applySettings();',ctx);
  return {calls,theme};
}
const applied=app.slice(app.indexOf('function applySettings() {'),app.indexOf('// Apply reduced-motion: union'));
test('actual region theme application retains icon size, theme, banner and radial refresh',()=>{
  const out=apply(applied);
  assert.deepEqual(out.calls,[['--icon-size','72px'],['banner','matrix'],['radial']]);
  assert.equal(out.theme.href,'styles/themes/matrix.css');
});
test('removing actual radial or theme application is a detected mutation',()=>{
  for(const line of ['if (window.qlRadialRefresh) window.qlRadialRefresh();',"$('theme-stylesheet').href = \x60styles/themes/\x24{theme}.css\x60;"]){
    const bad=applied.replace(line,'');assert.notEqual(bad,applied);
    assert.throws(()=>assert.deepEqual(apply(bad),apply(applied)));
  }
});
function escape(source) {
  const listeners=[],calls=[];
  const ctx={document:{addEventListener:(_type,fn)=>listeners.push(fn)},_filterText:'a',editMode:true,clearFilter:()=>{calls.push('filter');ctx._filterText='';},exitEditMode:()=>{calls.push('edit');ctx.editMode=false;}};
  vm.runInNewContext(source,ctx);
  const press=()=>listeners.forEach(fn=>fn({key:'Escape',target:{tagName:'BODY'},preventDefault(){}}));
  return {ctx,calls,press};
}
const keyStart=app.indexOf("document.addEventListener('keydown', (e) => {");
const key=app.slice(keyStart,app.indexOf('\n});',keyStart)+4);
test('actual region Escape clears filter before edit mode and does nothing afterwards',()=>{
  const s=escape(key);s.press();assert.deepEqual(s.calls,['filter']);assert.equal(s.ctx.editMode,true);
  s.press();assert.deepEqual(s.calls,['filter','edit']);s.press();assert.deepEqual(s.calls,['filter','edit']);
});
test('known-bad duplicate Escape handler wrongly exits edit mode under a filter',()=>{
  const s=escape(key+"\ndocument.addEventListener('keydown',e=>{if(e.key==='Escape'&&editMode)exitEditMode();});");
  s.press();assert.equal(s.ctx.editMode,false);assert.throws(()=>assert.equal(s.ctx.editMode,true));
});
test('reachable Settings button still invokes scoped Manager rather than legacy overlay',()=>{const start=app.indexOf("$('btn-settings').addEventListener('click', () => {");const wire=app.slice(start,app.indexOf('\n});',start)+4);let click,calls=[];vm.runInNewContext(wire,{$:()=>({addEventListener:(_type,fn)=>click=fn}),window:{api:{invoke:(...args)=>calls.push(args)}}});click();assert.equal(calls[0][0],'region:open-manager');assert.equal(calls[0][1].view,'settings');});
test('both branches command registry survives and prebuild still gates contrast then hover',()=>{const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));for(const key of ['gallery:themes','gallery:regions','test:regions','selftest:regions','tryit:regions','check:contrast','check:hover','check'])assert.ok(pkg.scripts[key],key);assert.equal(pkg.scripts.prebuild,'npm run check');assert.equal(pkg.scripts.check,'npm run check:contrast && npm run check:hover');});
test('actual migration guard mutations lose malformed/oversized default reset',()=>{const source=fs.readFileSync(path.join(root,'src/main/regions/model.js'),'utf8'),ctx={workArea:{x:0,y:0,width:1920,height:1040},newId:()=> 'r1',defaultTheme:'cyberpunk',validThemes:new Set(['cyberpunk'])};for(const [bad,input]of [[source.replace('Number.isInteger(saved.width) && Number.isInteger(saved.height)','isFiniteNum(saved.width) && isFiniteNum(saved.height)'),{windowSize:{width:500.5,height:300.5}}],[source.replace('validSize && !oversized ? saved : null','validSize ? saved : null'),{windowSize:{width:1921,height:300}}]]){assert.notEqual(bad,source);const mod={exports:{}};vm.runInNewContext(bad,{module:mod,require:n=>require(path.join(root,'src/main/regions',n))});const result=mod.exports.migrate({apps:[],settings:input},ctx).data.regions[0].rect;assert.notEqual(result.width,424,'actual guard mutation breaks default width');assert.throws(()=>assert.equal(result.width,424));}});
