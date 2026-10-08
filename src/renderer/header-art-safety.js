/* Opted-in, bounded header decoration only. Never changes text, fonts or input. */
(function (root, factory) {
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else {root.QL_HEADER_ART_SAFETY=api;api.start(root.document);}
}(typeof window==='object'?window:this,()=>{
  'use strict';
  const CLASS='ql-header-art-suppressed';
  const valid=r=>!!r&&['x','y','width','height'].every(k=>Number.isFinite(r[k]))&&r.width>0&&r.height>0;
  const right=r=>r.x+r.width,bottom=r=>r.y+r.height;
  const intersects=(a,b)=>a.x<right(b)&&b.x<right(a)&&a.y<bottom(b)&&b.y<bottom(a);
  const expand=(r,n)=>({x:r.x-n,y:r.y-n,width:r.width+2*n,height:r.height+2*n});
  function safe({art,header,title,controls=[],ready=true,allowed=true}){
    if(!ready||!allowed||![art,header,title].every(valid)||!controls.every(valid))return false;
    if(art.x<header.x||art.y<header.y||right(art)>right(header)||bottom(art)>bottom(header))return false;
    const vertical=art.y<bottom(title)&&title.y<bottom(art);
    if(vertical&&!(right(title)+12<=art.x||right(art)+12<=title.x))return false;
    return controls.every(rect=>!intersects(art,rect));
  }
  function start(doc){
    if(!doc)return null;
    const view=doc.defaultView,header=doc.getElementById('header'),sheet=doc.getElementById('theme-stylesheet');
    if(!view||!header||!sheet)return null;
    let disposed=false,frame=null,generation=0,refreshes=0,writes=0,last=null;
    const styles=el=>view.getComputedStyle(el),rect=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};
    const visible=el=>{if(!el)return false;const s=styles(el);return s.display!=='none'&&s.visibility!=='hidden'&&valid(rect(el));};
    const opted=()=>styles(header).getPropertyValue('--ql-header-art-safety').trim()==='1';
    const setHidden=hidden=>{if(header.classList.contains(CLASS)!==hidden){header.classList.toggle(CLASS,hidden);writes++;}};
    function measure(){
      if(!opted())return{opted:false,safe:true};
      const title=doc.getElementById('title-area'),controls=doc.getElementById('header-controls'),filter=doc.getElementById('filter-chip');
      // Flush the containing block's layout before reading its pseudo style.
      const h=rect(header),hs=styles(header),pseudo=view.getComputedStyle(header,'::after');
      const width=parseFloat(pseudo.width),height=parseFloat(pseudo.height),top=parseFloat(pseudo.top),left=parseFloat(pseudo.left),offset=parseFloat(pseudo.right);
      const originX=h.x+(parseFloat(hs.borderLeftWidth)||0),originY=h.y+(parseFloat(hs.borderTopWidth)||0);
      // The opted-in motifs are right anchored. Chromium can return a resolved
      // used `left` from the previous pseudo layout during a CSSOM change, while
      // `right` already contains the new authored offset. Read the actual right
      // constraint first; a left-only motif still uses its computed left.
      const art={x:originX+(Number.isFinite(offset)?header.clientWidth-offset-width:left),y:originY+top,width,height};
      const needed=[...header.querySelectorAll('button,input,[role="status"],#radial-refusal,#filter-chip')].filter(visible);
      const functional=needed.map(el=>{const s=styles(el),outset=Math.max(4,(parseFloat(s.outlineWidth)||0)+(parseFloat(s.outlineOffset)||0));return expand(rect(el),outset);});
      // The group includes icon and name. Its focus ring gets the same protection
      // as controls; this does not shorten the title or change its ellipsis.
      if(title&&visible(title))functional.push(expand(rect(title),4));
      const ready=!!sheet.sheet&&(!doc.fonts||doc.fonts.status==='loaded');
      const body=doc.body.classList;
      const allowed=visible(header)&&view.innerWidth>=424&&!body.contains('manager')&&!body.contains('layout-column')&&!body.contains('layout-row')
        &&pseudo.display!=='none'&&pseudo.content!=='none'&&pseudo.transform==='none'&&!visible(filter)&&!!title&&!!controls&&!!filter&&visible(title)&&visible(controls);
      const data={art,header:h,title:title?rect(title):null,controls:functional,ready,allowed};
      return{opted:true,safe:safe(data),...data};
    }
    function refresh(){
      frame=null;if(disposed)return;
      refreshes++;
      try{last=measure();setHidden(last.opted&&!last.safe);}catch{last={opted:true,safe:false,reason:'invalid measurement'};setHidden(true);}
    }
    function schedule(){
      if(disposed)return;
      generation++;
      // DOM/font/theme changes suppress in the same microtask before painting;
      // a bounded two-frame refresh restores the authored motif only if safe.
      try{setHidden(opted());}catch{setHidden(true);}
      if(frame===null)frame=view.requestAnimationFrame(()=>{
        if(disposed)return;
        // A CSSOM change can invalidate the pseudo after the first style pass.
        // Keep the art suppressed through that pass, then validate the settled
        // computed constraint before the next paint. No recurring poll exists.
        try{measure();}catch{ /* the final pass remains fail-closed */ }
        const seen=generation;
        frame=view.requestAnimationFrame(()=>{
          if(disposed)return;
          if(seen!==generation){frame=null;schedule();return;}
          refresh();
        });
      });
    }
    const ownClassOnly=record=>record.target===header&&record.type==='attributes'&&record.attributeName==='class'
      &&(record.oldValue||'').split(/\s+/).filter(x=>x&&x!==CLASS).join(' ')===header.className.split(/\s+/).filter(x=>x&&x!==CLASS).join(' ');
    const mutation=new view.MutationObserver(records=>{if(records.some(record=>!ownClassOnly(record)))schedule();});
    mutation.observe(header,{subtree:true,childList:true,characterData:true,attributes:true,attributeOldValue:true,attributeFilter:['class','style','value','hidden']});
    mutation.observe(doc.body,{attributes:true,attributeFilter:['class']});
    mutation.observe(doc.documentElement,{attributes:true,attributeFilter:['style']});
    mutation.observe(sheet,{attributes:true,attributeFilter:['href']});
    const resize=new view.ResizeObserver(schedule);resize.observe(header);
    for(const id of ['title-area','header-controls','filter-chip']){const el=doc.getElementById(id);if(el)resize.observe(el);}
    const listeners=[[view,'resize'],[sheet,'load'],[sheet,'error'],[doc,'focusin'],[doc,'focusout']];
    for(const [el,event]of listeners)el.addEventListener(event,schedule);
    if(doc.fonts){doc.fonts.ready.then(schedule).catch(schedule);for(const event of ['loading','loadingdone','loadingerror']){doc.fonts.addEventListener(event,schedule);listeners.push([doc.fonts,event]);}}
    function dispose(){if(disposed)return;disposed=true;mutation.disconnect();resize.disconnect();if(frame!==null)view.cancelAnimationFrame(frame);frame=null;for(const[el,event]of listeners)el.removeEventListener(event,schedule);view.removeEventListener('pagehide',dispose);}
    view.addEventListener('pagehide',dispose);schedule();
    const instance={measure,refresh:schedule,dispose,stats:()=>({refreshes,writes,disposed,pending:frame!==null,last})};
    api.instance=instance;return instance;
  }
  const api={safe,valid,intersects,expand,start};return api;
}));
