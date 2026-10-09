/* Fan/Ring geometry shared by main and renderer. No DOM, Electron or native APIs.
   Regions UX spec 2.5–2.7 and the committed M5 empty-Fan correction. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.QL_RADIAL=api;}(typeof self!=='undefined'?self:this,function(){
 'use strict';
 const HUB=96, PAD=8, GAP=6, CAPS={fan:10,ring:12}, DIRECTIONS=['up','right','down','left'];
 const radial=layout=>layout==='fan'||layout==='ring';
 const size=S=>Math.max(32,Math.min(128,Math.round(Number(S)||64)));
 function points(layout,n,R){const pitch=layout==='ring'?360/n:n===1?0:Math.min(180/(n-1),60);return Array.from({length:n},(_,k)=>{
   const angle=(layout==='ring'?-90+k*pitch:-90+(k-(n-1)/2)*pitch)*Math.PI/180;
   return{x:R*Math.cos(angle),y:R*Math.sin(angle)};
 });}
 function separated(centres,T){return centres.every((a,i)=>centres.slice(i+1).every(b=>Math.abs(a.x-b.x)>=T+GAP-1e-8||Math.abs(a.y-b.y)>=T+GAP-1e-8));}
 // Distance from the Ring centre to the actual rounded square tile bounds.
 function ringClearance(centres,T,R){const pivot=R+T/2+PAD;return Math.min(...centres.map(c=>{
  const x=Math.round(pivot+c.x-T/2),y=Math.round(pivot+c.y-T/2);
  return Math.hypot(Math.max(x-pivot,pivot-x-T,0),Math.max(y-pivot,pivot-y-T,0));
 }));}
 function fanFrame(centres,T){const maxX=Math.max(...centres.map(c=>Math.abs(c.x))),rise=Math.max(...centres.map(c=>-c.y)),dip=Math.max(0,...centres.map(c=>c.y));
  const width=Math.ceil(Math.max(2*maxX+T,HUB)+2*PAD-1e-8),height=Math.ceil(rise+T/2+PAD+Math.max(HUB/2,T/2+dip)+PAD-1e-8);
  return{width,height,pivot:{x:width/2,y:Math.ceil(rise+T/2+PAD-1e-8)}};
 }
 function tileClearance(pivot,chips){return Math.min(...chips.map(c=>Math.hypot(Math.max(c.x-pivot.x,pivot.x-c.x-c.width,0),Math.max(c.y-pivot.y,pivot.y-c.y-c.height,0))));}
 function turnPoint(x,y,width,height,turn){return turn===1?{x:height-y,y:x}:turn===2?{x:width-x,y:height-y}:turn===3?{x:y,y:width-x}:{x,y};}
 // Base hub must clear the actual rounded tiles in every Fan direction.
 function fanClearance(centres,T){const f=fanFrame(centres,T);return Math.min(...DIRECTIONS.map((_,turn)=>{
  const pivot=turnPoint(f.pivot.x,f.pivot.y,f.width,f.height,turn);
  const chips=centres.map(c=>{const p=turnPoint(f.pivot.x+c.x,f.pivot.y+c.y,f.width,f.height,turn);return{x:Math.round(p.x-T/2),y:Math.round(p.y-T/2),width:T,height:T};});
  return tileClearance(pivot,chips);
 }));}
 function radius(layout,n,S=64){if(!radial(layout))throw Error('not a radial layout');n=Math.max(1,Math.min(CAPS[layout],Math.floor(Number(n)||1)));const T=size(S)+12;let previous=48+T/2+10;
  for(let count=1;count<=n;count++){let R=48+T/2+10;while(!separated(points(layout,count,R),T)||(layout==='ring'?ringClearance(points(layout,count,R),T,R):fanClearance(points(layout,count,R),T))<HUB/2+GAP)R+=2;previous=Math.max(previous,R);}
  return previous;
 }
 function geometry(layout,count,S=64,direction='up'){
  if(!radial(layout))throw Error('not a radial layout');S=size(S);const n=Math.max(1,Math.min(CAPS[layout],Math.floor(Number(count)||0))),T=S+12,R=radius(layout,n,S),centres=points(layout,n,R);
  let width,height,pivot;
  if(layout==='ring'){width=height=2*R+T+2*PAD;pivot={x:width/2,y:height/2};}
  else{({width,height,pivot}=fanFrame(centres,T));}
  const turn=layout==='fan'?DIRECTIONS.indexOf(direction):0;if(turn<0)throw Error('unknown Fan direction');
  const rotate=(x,y)=>turnPoint(x,y,width,height,turn);
  const chips=centres.map(c=>{const p=rotate(pivot.x+c.x,pivot.y+c.y);return{x:Math.round(p.x-T/2),y:Math.round(p.y-T/2),width:T,height:T};});
  const hub=rotate(pivot.x,pivot.y),box=turn%2?{width:height,height:width}:{width,height};
  const diameter=layout==='ring'?Math.max(HUB,2*Math.floor(Math.min(HUB*R/radius('ring',1,S),2*(ringClearance(centres,T,R)-GAP))/2))
   :Math.max(HUB,2*Math.floor(Math.min(HUB*R/radius('fan',1,S),2*(tileClearance(hub,chips)-GAP))/2));
  if(layout==='fan'){
   // Extend only the circle's missing bounds. Integer shifts preserve the
   // rounded tile positions and their clearance, including after rotation.
   const left=Math.ceil(Math.max(0,diameter/2+PAD-hub.x)),top=Math.ceil(Math.max(0,diameter/2+PAD-hub.y));
   const right=Math.ceil(Math.max(0,hub.x+diameter/2+PAD-box.width)),bottom=Math.ceil(Math.max(0,hub.y+diameter/2+PAD-box.height));
   hub.x+=left;hub.y+=top;box.width+=left+right;box.height+=top+bottom;
   chips.forEach(c=>{c.x+=left;c.y+=top;});
  }
  return{layout,count:Math.max(0,Math.floor(Number(count)||0)),S,T,R,direction,pivot:hub,hub:{x:hub.x-diameter/2,y:hub.y-diameter/2,width:diameter,height:diameter},chips,...box};
 }
 function capacity(layout,S,workArea,direction='up'){if(!radial(layout))return Infinity;let cap=0;for(let n=1;n<=CAPS[layout];n++){const g=geometry(layout,n,S,direction);if(g.width<=workArea.width-48&&g.height<=workArea.height-48)cap=n;}return cap;}
 function inHub(g,x,y){return (x-g.pivot.x)**2+(y-g.pivot.y)**2<=(g.hub.width/2)**2;}
 function shapeRects(g){const rects=g.chips.map(c=>({...c}));const h=g.hub,R=h.width/2;for(let y=0;y<h.height;y++){const half=Math.sqrt(Math.max(0,R*R-(y+.5-R)**2));const left=Math.ceil(h.x+R-half),right=Math.floor(h.x+R+half);if(right>left)rects.push({x:left,y:Math.round(h.y+y),width:right-left,height:1});}return rects;}
 return{HUB,PAD,GAP,CAPS,DIRECTIONS,isRadial:radial,points,separated,radius,geometry,capacity,inHub,shapeRects};
}));
