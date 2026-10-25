'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { chooseInstalledApp, resolveStoredInstalledApp, resolveInstalledPath } = require('../../src/main/installed-apps');
const apps = (...ids) => ids.map(AppID => ({ AppID, Name: 'Display label is not an identity' }));
const oldPath = 'shell:AppsFolder\\blender.5.1';

test('current identities are retained; a missing versioned Blender identity uses one unique current Blender', () => {
  assert.deepEqual(chooseInstalledApp(oldPath, apps('blender.5.1','blender.5.2')), {ok:true,path:oldPath});
  assert.deepEqual(chooseInstalledApp(oldPath, apps('blender.5.2','other.5.1')), {ok:true,path:'shell:AppsFolder\\blender.5.2'});
  for (const catalog of [[], apps('other.5.2'), apps('blender.5.2','blender.4.5')]) {
    assert.deepEqual(chooseInstalledApp(oldPath, catalog), {ok:false,reason:'TARGET MISSING'});
  }
  assert.deepEqual(chooseInstalledApp(oldPath, null), {ok:false,reason:'TARGET UNREADABLE'});
});

test('unrelated numeric identities and similar names never repair; existing custom protocols/files avoid the catalog', async () => {
  for (const id of ['vendor.tool.1','blender.render','blender.5.1.backup','notblender.5.1']) {
    assert.equal(chooseInstalledApp('shell:AppsFolder\\'+id, apps('blender.5.2','vendor.tool.2')).ok, false);
  }
  for (const value of ['C:\\App\\a.lnk','steam://rungameid/123','shell:ControlPanelFolder']) {
    assert.deepEqual(await resolveInstalledPath(value,{list(){throw Error('must not query');}}), {ok:true,path:value});
  }
});

test('repair preserves ID, custom label/icon/arguments/order and latest unrelated edits; removed/retargeted items cannot revive', async () => {
  const item={id:'a',regionId:'r',name:'My blender',path:oldPath,iconDataUrl:'mine',arguments:'--custom',kind:'reference'};
  const other={id:'b',path:'C:\\other.exe'};
  let current=[item,other],updates=0,pushed=[];
  const store={get:()=>current,set:(_k,value)=>{current=value;updates++;}};
  const options={list:async()=>{current=[{...item,name:'New custom label'},other];return apps('blender.5.2');}};
  const result=await resolveStoredInstalledApp(item,store,id=>pushed.push(id),options);
  assert.equal(result.path,'shell:AppsFolder\\blender.5.2');
  assert.deepEqual(current,[{...item,name:'New custom label',path:result.path},other]);
  assert.equal(updates,1);assert.deepEqual(pushed,['r']);
  for(const replacement of [[],[{...item,path:'C:\\new.exe'}],[{...item,regionId:'elsewhere'}]]){
    current=[item];updates=0;
    const refused=await resolveStoredInstalledApp(item,store,()=>{}, {list:async()=>{current=replacement;return apps('blender.5.2');}});
    assert.equal(refused.ok,false);assert.equal(updates,0);
  }
});

test('two concurrent resolutions of the same upgrade are idempotent; one repair and no false missing error', async()=>{
  const item={id:'a',regionId:'r',name:'Custom',path:oldPath};let current=[item],writes=0,pushes=0;
  const store={get:()=>current,set:(_k,value)=>{current=value;writes++;}};
  const options={list:async()=>apps('blender.5.2')};
  const results=await Promise.all([resolveStoredInstalledApp(item,store,()=>pushes++,options),resolveStoredInstalledApp(item,store,()=>pushes++,options)]);
  assert.ok(results.every(result=>result.ok&&result.path==='shell:AppsFolder\\blender.5.2'));
  assert.equal(writes,1);assert.equal(pushes,1);assert.equal(current[0].name,'Custom');
});
