'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {resolveInstalledPath,resolveStoredInstalledApp}=require('../../src/main/installed-apps');
const source=fs.readFileSync(process.env.QL_BASELINE_IPC || path.join(__dirname,'../../src/main/ipc.js'),'utf8');
function launch(catalog){
  let apps=[{id:'a',regionId:'r',name:'Custom label',path:'shell:AppsFolder\\blender.5.1',iconDataUrl:'custom'}],handler;
  const events=[],runs=[],store={get:()=>apps,set:(_k,value)=>{apps=value;}},changes=[];
  const options={list:async()=>catalog};
  const context={store,testHooks:false,regionOf:()=> 'r',ipcMain:{handle:(_ch,fn)=>{handler=fn;}},testLaunches:[],
    ctl:{_pushItems:id=>changes.push(id),_managerChanged(){},noteMissing(){}},fs:{existsSync:()=>true},
    execFile:(...argv)=>runs.push(argv.slice(0,3)),shell:{openPath:async value=>{runs.push(value);return ''; }},
    resolveInstalledPath:value=>resolveInstalledPath(value,options),
    resolveStoredInstalledApp:(item,storage,changed)=>resolveStoredInstalledApp(item,storage,changed,options)};
  const start=source.indexOf("  ipcMain.handle('launch-app',"),end=source.indexOf("  ipcMain.handle('get-installed-apps',",start);
  vm.runInNewContext(source.slice(start,end),context);
  return {call:value=>handler({sender:{isDestroyed:()=>false,send:(...event)=>events.push(event)}},value),runs,events,changes,apps:()=>apps,
    replace:value=>{apps=value;}};
}
test('launching an upgraded Blender uses replacement URI and updates the original tile; no stale Explorer argument',async()=>{
  const l=launch([{AppID:'blender.5.2'}]);await l.call('shell:AppsFolder\\blender.5.1');
  assert.equal(l.runs.length,1);assert.equal(l.runs[0][0],'explorer.exe');assert.equal(l.runs[0][1][0],'shell:AppsFolder\\blender.5.2');
  assert.equal(l.apps()[0].id,'a');assert.equal(l.apps()[0].name,'Custom label');assert.equal(l.apps()[0].iconDataUrl,'custom');
  assert.deepEqual(l.changes,['r']);assert.equal(l.events.length,0);
});
test('missing, unavailable and ambiguous installed IDs produce the existing error and never open Explorer fallback',async()=>{
  for(const catalog of [[],null,[{AppID:'unrelated.5.2'}],[{AppID:'blender.5.2'},{AppID:'blender.4.5'}]]){
    const l=launch(catalog);await l.call('shell:AppsFolder\\blender.5.1');
    assert.equal(l.runs.length,0);assert.equal(l.events[0][0],'launch-error');
    assert.equal(l.events[0][1].reason,catalog===null?'TARGET UNREADABLE':'TARGET MISSING');
  }
});
test('ordinary shortcut launch and Steam keep their original route and arguments',async()=>{
  const l=launch(null);l.replace([{id:'b',path:'C:\\my app\\custom.lnk'}]);await l.call('C:\\my app\\custom.lnk');
  assert.equal(l.runs[0],'C:\\my app\\custom.lnk');await l.call('steam://rungameid/123');
  assert.equal(l.runs[1][1][0],'steam://rungameid/123');
});
