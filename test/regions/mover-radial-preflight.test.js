'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{Mover}=require('../../src/main/moves/mover');
test('deduplicated prospective file count is checked before journal/file/store mutation',async()=>{
 let planned=[],fitCount=-1,writes=0;
 const actor={_run:fn=>fn(),_plan:async(_id,file)=>{planned.push(file);return{real:file,here:file==='C:/same.lnk',action:'ref'};},data:{regionExists:()=>true,apps:()=>[{id:'old',regionId:'r'}],capOf:()=>10,canAccept:(_id,count)=>{fitCount=count;return false;},commit:()=>{writes++;throw Error('must not commit');}},journal:new Proxy({},{get:()=>()=>{writes++;throw Error('must not journal');}}),canMove:()=>{writes++;throw Error('must not reach moves');}};
 const res=await Mover.prototype.addPaths.call(actor,'r',['C:/same.lnk','C:/new.lnk','C:/new.lnk']);
 assert.equal(fitCount,2);assert.equal(res.refused,'no-room');assert.deepEqual(res.added,[]);assert.equal(writes,0);assert.equal(planned.length,3);
});
test('already-owned path adds no count and bypasses growth refusal',async()=>{
 let called=0;const actor={_run:fn=>fn(),_plan:async(_id,file)=>({real:file,here:true,action:'none'}),data:{regionExists:()=>true,apps:()=>[{regionId:'r'}],capOf:()=>10,canAccept:()=>{called++;return false;}},canMove:()=>true,_addOne:async()=>({ok:true,item:{id:"old",regionId:"r"}})};
 const res=await Mover.prototype.addPaths.call(actor,'r',['C:/same.lnk']);assert.equal(called,0);assert.equal(res.refused,null);
});

test('orphan adoption refuses prospective radial box before metadata/journal/store work',async()=>{
 let touched=0,count=0;const actor={_run:fn=>fn(),orphans:[{file:'C:/orphan.lnk'}],data:{primaryId:()=> 'r',apps:()=>[{regionId:'r'}],capOf:()=>12,canAccept:(_id,n)=>{count=n;return false;},commit:()=>{touched++;}},_exists:async()=>{touched++;return true;},win32:{attributes:()=>{touched++;}},journal:{note:()=>{touched++;}}};
 const before=JSON.stringify(actor.orphans),r=await Mover.prototype.adoptOrphan.call(actor,'C:/orphan.lnk');assert.equal(r.ok,false);assert.equal(r.reason,'no-room');assert.equal(count,2);assert.equal(touched,0);assert.equal(JSON.stringify(actor.orphans),before);
 const code=require('fs').readFileSync(require.resolve('../../src/main/moves/mover'),'utf8');const begin=code.indexOf('  adoptOrphan(file, regionId = null) {'),end=code.indexOf('\n  /**',begin+5);const method=code.slice(begin,end).replace(/      if \(this.data.canAccept && !this.data.canAccept\(target, nextCount\)\) return \{[^\n]+\};\n/,'');assert.notEqual(method,code.slice(begin,end),'guard mutation applied');const Bad=require('vm').runInNewContext('(class {'+method+'})',{lower:x=>x.toLowerCase()});actor._exists=async()=>{touched++;throw Error('forbidden metadata reached');};await assert.rejects(Bad.prototype.adoptOrphan.call(actor,'C:/orphan.lnk'),/forbidden metadata reached/);assert.equal(touched,1,'actual method mutant without guard reaches metadata');
});
