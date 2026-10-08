'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {paintedFrame,waitForPaintedFrame}=require('../../scripts/pixel-readiness.cjs');
const ready={ok:true,colours:2069,lit:0.94,w:192,h:162};
function clock(){let time=0;return{now:()=>time,wait:async ms=>{time+=ms;},advance:ms=>{time+=ms;}};}
test('unchanged painted predicate preserves every original threshold and capture success condition',()=>{
 const base={printed:1,lines:100,height:100,colours:16,litShare:0.1};
 for(const [patch,expected]of [[{},true],[{printed:0},false],[{lines:99},false],[{colours:15},false],[{litShare:0.09999},false],[{colours:1,litShare:1},false],[{colours:4096,litShare:0},false]])assert.equal(paintedFrame({...base,...patch}),expected);
});
test('ready on first read passes immediately without a delay',async()=>{
 const c=clock();let reads=0;const r=await waitForPaintedFrame(()=>{reads++;return ready;},c);
 assert.equal(r.ok,true);assert.equal(r.attempts,1);assert.equal(reads,1);assert.equal(r.elapsedMs,0);
});
test('delayed first paint reproduces read-once failure then passes without widening predicate',async()=>{
 const c=clock();let reads=0;const capture=()=>{reads++;return c.now()<150?{ok:false,colours:reads===1?1:6,lit:reads===1?0:0.9}:ready;};
 assert.equal(capture().ok,false,'old read-once check fails known healthy delayed page');reads=0;
 const r=await waitForPaintedFrame(capture,c);assert.equal(r.ok,true);assert.equal(r.attempts,4);assert.equal(r.elapsedMs,150);assert.equal(r.colours,2069);
});
test('a never-painted page stays red at exact bounded deadline with last evidence',async()=>{
 const c=clock();const r=await waitForPaintedFrame(()=>({ok:false,colours:1,lit:0}),c);
 assert.equal(r.ok,false);assert.equal(r.timedOut,true);assert.equal(r.elapsedMs,3000);assert.equal(r.attempts,61);assert.equal(r.colours,1);assert.match(r.why,/timed out/);
});
test('insufficient colour or coverage never becomes a pass while polling',async()=>{
 for(const px of [{colours:15,litShare:1},{colours:4096,litShare:0.0999}]){
  const c=clock();const r=await waitForPaintedFrame(()=>({...px,ok:paintedFrame({printed:1,lines:100,height:100,...px})}),c);
  assert.equal(r.ok,false);assert.equal(r.timedOut,true);
 }
});
test('a successful read completing after deadline is refused',async()=>{
 const c=clock();const r=await waitForPaintedFrame(()=>{c.advance(3001);return ready;},c);
 assert.equal(r.ok,false);assert.equal(r.timedOut,true);assert.equal(r.attempts,1);
});
test('transient capture exceptions retry; persistent exception times out with evidence',async()=>{
 const c=clock();let n=0;const r=await waitForPaintedFrame(()=>{if(++n<3)throw Error('capture incomplete');return ready;},c);
 assert.equal(r.ok,true);assert.equal(r.attempts,3);
 const fail=await waitForPaintedFrame(()=>{throw Error('missing window');},clock());assert.equal(fail.ok,false);assert.match(fail.why,/missing window/);
});
test('attempt budget is bounded even with a stopped injected clock',async()=>{
 let calls=0;const r=await waitForPaintedFrame(()=>{calls++;return{ok:false};},{now:()=>0,wait:async()=>{}});
 assert.equal(r.ok,false);assert.equal(r.timedOut,true);assert.equal(calls,61);
});
