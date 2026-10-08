'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),R=require('../../src/renderer/radial-layout');
test('committed S64 radius/box/pivot tables are exact oracles',()=>{
 const ring=[96,96,96,96,96,96,122,122,158,164,194,226];
 const fan=[[96,112,198,142],[96,188,186,130],[96,259,198,142],[96,284,186,130],[116,324,218,162],[164,420,258,202],[226,544,328,272],[236,564,333,277],[254,600,356,300],[310,712,408,352]];
 ring.forEach((r,i)=>{const g=R.geometry('ring',i+1,64);assert.equal(g.R,r);assert.equal(g.width,2*r+92);assert.equal(g.height,g.width);});
 fan.forEach(([r,w,h,p],i)=>{const g=R.geometry('fan',i+1,64);assert.deepEqual([g.R,g.width,g.height,g.pivot.y],[r,w,h,p]);});
 assert.deepEqual(R.geometry('ring',8,64).chips[0],{x:130,y:8,width:76,height:76});
 assert.deepEqual(R.geometry('fan',6,64).chips[0],{x:8,y:164,width:76,height:76});
});
test('all counts, directions and icon sizes preserve bounds, chip gaps and monotonic radius',()=>{
 for(const layout of ['fan','ring'])for(const S of [32,64,128])for(const direction of R.DIRECTIONS){let previous=0;for(let n=0;n<=R.CAPS[layout];n++){
  const g=R.geometry(layout,n,S,direction);assert.ok(g.R>=previous);previous=g.R;
  for(const a of [g.hub,...g.chips])assert.ok(a.x>=0&&a.y>=0&&a.x+a.width<=g.width&&a.y+a.height<=g.height);
  for(let i=0;i<g.chips.length;i++)for(let j=i+1;j<g.chips.length;j++){const a=g.chips[i],b=g.chips[j];assert.ok(Math.abs(a.x-b.x)>=g.T+6||Math.abs(a.y-b.y)>=g.T+6);}
 }}
});
test('empty Fan slot matches first-item geometry in every direction; Ring stays top',()=>{
 for(const S of [32,64,128])for(const direction of R.DIRECTIONS){assert.deepEqual(R.geometry('fan',0,S,direction),{...R.geometry('fan',1,S,direction),count:0});const r=R.geometry('ring',0,S,direction);assert.equal(r.chips[0].y,8);}
});
test('work-area capacity uses both dimensions and 24px per-side reserve',()=>{
 for(const layout of ['fan','ring'])for(const S of [32,64,128])for(const direction of R.DIRECTIONS)for(const workArea of [{width:1920,height:1040},{width:640,height:480},{width:100,height:100}]){
  const cap=R.capacity(layout,S,workArea,direction);assert.ok(cap<=R.CAPS[layout]);if(cap){const g=R.geometry(layout,cap,S,direction);assert.ok(g.width<=workArea.width-48&&g.height<=workArea.height-48);}if(cap<R.CAPS[layout]){const g=R.geometry(layout,cap+1,S,direction);assert.ok(g.width>workArea.width-48||g.height>workArea.height-48);}
 }
});
test('shape covers chips and circular hub, omitting transparent corners and gaps',()=>{
 const g=R.geometry('ring',8,64),rects=R.shapeRects(g),has=(x,y)=>rects.some(r=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height);
 assert.equal(has(0,0),false);assert.equal(has(g.pivot.x,g.pivot.y),true);for(const c of g.chips)assert.equal(has(c.x+c.width/2,c.y+c.height/2),true);assert.equal(has(g.hub.x,g.hub.y),false);
});

test('Fan capacity scans non-monotonic heights instead of stopping at first miss',()=>{assert.equal(R.capacity('fan',64,{width:500,height:242}),4);assert.ok(R.geometry('fan',1,64).height>194);assert.ok(R.geometry('fan',4,64).height<=194);});
