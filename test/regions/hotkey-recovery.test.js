'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path');
const mainSource=()=>fs.readFileSync(process.env.QL_BASELINE_MAIN || path.join(__dirname,'../../src/main/index.js'),'utf8');
function binding(source=mainSource()) {
  const keys=new Map(),calls=[],handlers={};let configured='Ctrl+Space',blocked=null;
  const context={console:{warn(){}},store:{get:()=>({globalHotkey:configured})},ctl:{toggleForeground:()=>calls.push('toggle')},
    ipcMain:{handle:(name,fn)=>{handlers[name]=fn;}},globalShortcut:{
      register(key,fn){calls.push(['register',key]);if(key==='bad')throw Error('bad');if(key===blocked)return false;keys.set(key,fn);return true;},
      unregister(key){calls.push(['unregister',key]);keys.delete(key);},isRegistered:key=>keys.has(key)}};
  vm.runInNewContext(source.slice(source.indexOf('let _activeHotkey = null;')),context);
  return {context,keys,calls,apply:context.applyGlobalHotkey,block:key=>{blocked=key;},configure:key=>{configured=key;}};
}
test('failed/invalid replacement leaves the working configured hotkey alive',()=>{
  const h=binding();h.apply('Ctrl+Space');h.block('Alt+Q');
  assert.equal(h.apply('Alt+Q').ok,false);assert.equal(h.keys.has('Ctrl+Space'),true);
  assert.equal(h.apply('bad').ok,false);assert.equal(h.keys.has('Ctrl+Space'),true);
  h.keys.get('Ctrl+Space')();assert.equal(h.calls.at(-1),'toggle');
});
test('successful rebind retires old registration only after replacement; same key is not unregistered',()=>{
  const h=binding();h.apply('Ctrl+Space');h.calls.length=0;h.apply('Ctrl+Space');
  assert.equal(h.keys.has('Ctrl+Space'),true);assert.equal(h.calls.length,0);
  h.apply('Alt+Q');assert.deepEqual(h.calls,[['register','Alt+Q'],['unregister','Ctrl+Space']]);
  assert.equal(h.keys.has('Ctrl+Space'),false);assert.equal(h.keys.has('Alt+Q'),true);
  h.apply(null);assert.equal(h.keys.size,0);
});
test('transient startup conflict and lost registration recover only the configured binding; disabled stays disabled',()=>{
  const h=binding();h.block('Ctrl+Space');assert.equal(h.apply('Ctrl+Space').ok,false);
  assert.equal(typeof h.context.retryGlobalHotkey,'function');
  h.block(null);h.context.retryGlobalHotkey();assert.equal(h.keys.has('Ctrl+Space'),true);
  h.keys.clear();h.context.retryGlobalHotkey();assert.equal(h.keys.has('Ctrl+Space'),true);
  h.configure('Alt+Shift+Q');h.context.retryGlobalHotkey();assert.equal(h.keys.has('Alt+Shift+Q'),true);assert.equal(h.keys.has('Ctrl+Space'),false);
  h.configure(null);h.apply(null);h.calls.length=0;h.context.retryGlobalHotkey();assert.equal(h.calls.length,0);
});
