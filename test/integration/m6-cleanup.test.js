'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n');
const app=read('src/renderer/app.js'),html=read('src/renderer/index.html'),manager=read('src/renderer/manager.js');
const mapSource=read('src/renderer/theme-names.js');
function names(){const ctx={window:{}};vm.runInNewContext(mapSource,ctx);return ctx.window.QL_THEME_NAMES;}

test('region markup has no old overlays and loads the shared catalog before app boot',()=>{
  for(const id of ['settings-overlay','apps-picker','cheatsheet-overlay','theme-search','theme-picker-list','input-hotkey','slider-icon-size'])assert.ok(!html.includes('id="'+id+'"'),id);
  assert.ok(html.indexOf('src="theme-names.js"')>=0);
  assert.ok(html.indexOf('src="theme-names.js"')<html.indexOf('src="app.js"'));
  const mgr=read('src/renderer/manager.html');
  for(const id of ['apps-picker','cheatsheet-overlay','theme-picker-list','input-hotkey','slider-icon-size'])assert.ok(mgr.includes('id="'+id+'"'),id);
});
test('all 101 names exactly cover CSS keys and preserve the approved Republic name',()=>{
  const keys=fs.readdirSync(path.join(root,'src/renderer/styles/themes')).filter(x=>x.endsWith('.css')).map(x=>x.slice(0,-4)).sort();
  assert.equal(keys.length,101);assert.deepEqual(Object.keys(names()).sort(),keys);
  assert.equal(names()['star-wars-republic'],'STAR WARS: GALACTIC REPUBLIC');
  assert.ok(!app.includes('const THEME_NAMES = {'));assert.ok(!manager.includes('GALACTIC REPUBLIC'));
});
function regionCatalog(window){const line=app.match(/^const THEME_NAMES =[^\n]+/m)[0];return vm.runInNewContext(line+';THEME_NAMES["star-wars-republic"]',{window});}
test('region consumes the loaded catalog and missing script is a detected fault',()=>{
  assert.equal(regionCatalog({QL_THEME_NAMES:names()}),'STAR WARS: GALACTIC REPUBLIC');
  assert.throws(()=>regionCatalog({}));
});
test('Manager consumes the identical loaded catalog without a duplicate label table',()=>{
  const code=manager.match(/const NAMES =[^\n]+/)[0]+manager.match(/const themeName =[^\n]+/)[0];
  const ctx={window:{QL_THEME_NAMES:names()}};
  assert.equal(vm.runInNewContext(code+';themeName("star-wars-republic")',ctx),'STAR WARS: GALACTIC REPUBLIC');
  assert.notEqual(vm.runInNewContext(code+';themeName("star-wars-republic")',{window:{}}),'STAR WARS: GALACTIC REPUBLIC');
});
test('gallery uses loaded shared names with fallback confined to legacy snapshots',()=>{
  const line=read('scripts/theme-gallery/main.cjs').match(/^  name: [^\n]+/m)[0].trim();
  const expr=line.slice(6).replace(/,$/,'').replaceAll('${theme}','star-wars-republic');
  const legacy={'star-wars-republic':'HISTORICAL LABEL'};
  assert.equal(vm.runInNewContext(expr,{window:{QL_THEME_NAMES:names()},THEME_NAMES:legacy}),'STAR WARS: GALACTIC REPUBLIC');
  assert.equal(vm.runInNewContext(expr,{window:{},THEME_NAMES:legacy}),'HISTORICAL LABEL');
  assert.equal(vm.runInNewContext(expr,{window:{}}),null);
});
test('region contains no dead overlay consumers while captured help still requests Manager',()=>{
  for(const term of ['elSettingsOverlay','elAppsPicker','onSkinApplied','openInstalledAppsPicker','themeSearchTier','THEME_ALIASES',"$('btn-close-settings')","$('slider-icon-size')"])assert.ok(!app.includes(term),term);
  const region=read('src/renderer/region.js');
  assert.match(region,/api\.invoke\('region:open-manager', \{ view: 'cheatsheet' \}\)/);
  assert.match(app,/api\.invoke\('region:open-manager', \{ view: 'settings' \}\)/);
  assert.match(app,/api\.invoke\('region:open-manager', \{ view: 'picker' \}\)/);
});
function preload(source){let api;const calls=[];const mock={contextBridge:{exposeInMainWorld:(_name,value)=>api=value},ipcRenderer:{invoke:c=>{calls.push(c);return Promise.resolve(null);},on(){},removeListener(){}},webUtils:{getPathForFile(){}}};vm.runInNewContext(source,{require:n=>{assert.equal(n,'electron');return mock;},process:{argv:[]}});return{api,calls};}
test('region denies dead overlay privileges but Manager retains required global controls',()=>{
  const r=preload(read('src/main/preload.js')),m=preload(read('src/main/manager-preload.js'));
  for(const c of ['add-app-from-appid','set-auto-launch','apply-global-hotkey','get-global-hotkey-status'])assert.throws(()=>r.api.invoke(c),/Blocked IPC/);
  assert.deepEqual(r.calls,[]);
  for(const c of ['set-auto-launch','apply-global-hotkey','get-global-hotkey-status','manager:add-installed'])m.api.invoke(c);
  assert.equal(m.calls.length,4);
  for(const c of ['get-installed-apps','region:open-manager','save-settings','download-update','install-update'])r.api.invoke(c);
  assert.equal(r.calls.length,5);
});
test('restoring a removed region privilege is caught even with a valid mocked main reply',()=>{
  const source=read('src/main/preload.js'),bad=source.replace("  'get-valid-themes',","  'get-valid-themes',\n  'set-auto-launch',");
  assert.notEqual(bad,source);const r=preload(bad);r.api.invoke('set-auto-launch');
  assert.deepEqual(r.calls,['set-auto-launch']);assert.throws(()=>assert.throws(()=>r.api.invoke('set-auto-launch'),/Blocked IPC/));
});
test('dead main registration is absent while actual Manager add-installed still adopts its entry',()=>{
  const source=read('src/main/ipc.js');
  assert.ok(!source.includes("ipcMain.handle('add-app-from-appid'"));
  const start=source.indexOf("  onManager('manager:add-installed',");
  const wire=source.slice(start,source.indexOf('\n  });',start)+6);
  const routes=new Map(),calls=[],entry={id:'fake-entry',path:'mock-shortcut'};
  const ctx={onManager:(name,fn)=>routes.set(name,fn),entryFromAppId:()=>entry,ctl:{addItems:(id,items)=>{calls.push([id,items]);return {ok:true};}}};
  vm.runInNewContext(wire,ctx);
  assert.equal(routes.get('manager:add-installed')('mock-region',{}).ok,true);
  assert.equal(calls[0][0],'mock-region');assert.equal(calls[0][1][0],entry);
  const bad=wire.replace("onManager('manager:add-installed'","onManager('manager:missing-installed'");
  assert.notEqual(bad,wire);routes.clear();vm.runInNewContext(bad,ctx);
  assert.throws(()=>routes.get('manager:add-installed')('mock-region',{}));
});
test('dead scroll-panel wrapper styles are gone and Manager shared panel/list styles remain',()=>{
  const css=read('src/renderer/styles/base.css');assert.ok(!css.includes('.scroll-panel'));assert.ok(!css.includes('.theme-picker {'));
  for(const selector of ['.overlay-panel {','.overlay-title {','.setting-row {','.theme-picker-list {','.hotkey-input {','.cheat-list {'])assert.ok(css.includes(selector),selector);
});
const checker=read('scripts/check-theme-contrast.js');
function audit(source,panel){const css=':root { --bg:#000; --text:#fff; --text-dim:#fff; --accent-c:#fff; --accent-text:#fff; --hint-sub-color:#fff; --btn-close-color:#000; --panel-bg:'+panel+'; }';const mod={exports:{}};const fakefs={readFileSync:()=>css};const requireMock=n=>n==='fs'?fakefs:require(n);const ctx={module:mod,require:requireMock,__dirname:path.join(root,'scripts'),process:{argv:[]}};vm.runInNewContext(source+'\n;this.findings=auditTheme("fixture.css", "");',ctx);return ctx.findings;}
const pair="{ label: '--text on --panel-bg', color: text, on: panelBg, threshold: AA_NORMAL_TEXT }";
test('real linter detects white text on a white panel at the unchanged 4.5 floor',()=>{
  const bad=audit(checker,'#fff').filter(f=>f.msg.startsWith('--text on --panel-bg'));
  assert.equal(bad.length,1);assert.match(bad[0].msg,/1\.00:1 \(needs 4\.5:1\)/);
  assert.equal(audit(checker,'#111').filter(f=>f.msg.startsWith('--text on --panel-bg')).length,0);
});
test('wrong panel surface and missing new contrast pair are both detected controls',()=>{
  for(const replacement of [pair.replace('on: panelBg','on: bg'),'']){
    const bad=checker.replace(pair+',',replacement ? replacement+',' : '');assert.notEqual(bad,checker);
    assert.equal(audit(bad,'#fff').filter(f=>f.msg.startsWith('--text on --panel-bg')).length,0);
    assert.throws(()=>assert.equal(audit(bad,'#fff').filter(f=>f.msg.startsWith('--text on --panel-bg')).length,1));
  }
});
