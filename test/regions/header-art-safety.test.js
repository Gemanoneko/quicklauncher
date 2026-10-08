'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const H=require('../../src/renderer/header-art-safety');
const base=()=>({header:{x:6,y:6,width:628,height:40},art:{x:378,y:16,width:84,height:20},title:{x:18,y:16,width:140,height:20},controls:[{x:490,y:12,width:32,height:32}]});
test('actual coordinates permit safe slot and twelve-pixel title separation, exact boundary included',()=>{
 const s=base();assert.equal(H.safe(s),true);s.title.width=348;assert.equal(H.safe(s),true);s.title.width++;assert.equal(H.safe(s),false);
});
test('actual pseudo offset and controls/focus determine overlap; fixed width shortcut fails',()=>{
 const s=base();s.art.x=492;assert.equal(H.safe(s),false);s.art.x=450;assert.equal(H.safe(s),false);s.art.x=390;assert.equal(H.safe(s),true);
});
test('hidden layouts, unresolved metrics, missing/invalid geometry and out-of-header art fail closed',()=>{
 for(const patch of [{ready:false},{allowed:false},{title:null},{art:{x:378,y:16,width:NaN,height:20}},{art:{x:378,y:30,width:84,height:20}}])assert.equal(H.safe({...base(),...patch}),false);
});
test('known-bad no-control oracle exposes actual overlap that production rejects',()=>{
 const s=base();s.controls=[{x:390,y:20,width:24,height:24}];assert.equal(H.safe(s),false);assert.equal(H.safe({...s,controls:[]}),true);
});
