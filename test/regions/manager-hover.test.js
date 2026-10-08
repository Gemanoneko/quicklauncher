'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
// Focused cascade reader for the exact CLOSE element: button#btn-close-settings,
// body.manager ancestor, hover=true. Pseudo-state and specificity matter, not
// simply whether an approved colour string occurs somewhere in the stylesheet.
function closeColor(css){let order=0,rules=[];css=css.replace(/\/\*[\s\S]*?\*\//g,'');for(const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
 const color=/(?:^|;)\s*color\s*:\s*([^;]+)/.exec(m[2]);if(!color)continue;
 for(const selector of m[1].split(',').map(s=>s.trim())){order++;if(!['button','button:hover','#btn-close-settings','#btn-close-settings:hover','body.manager button:hover','body.manager #btn-close-settings:hover'].includes(selector))continue;
 const ids=(selector.match(/#/g)||[]).length,classes=(selector.match(/[.:]/g)||[]).length,tags=(selector.match(/(?:^|\s)(?:body|button)(?=[.#:]|$)/g)||[]).length;
 rules.push({specificity:ids*100+classes*10+tags,order,color:color[1].trim()});
 }}return rules.sort((a,b)=>a.specificity-b.specificity||a.order-b.order).at(-1).color;}
const base=fs.readFileSync(path.join(root,'src/renderer/styles/base.css'),'utf8'),manager=fs.readFileSync(path.join(root,'src/renderer/styles/manager.css'),'utf8').replaceAll('\r\n','\n');
test('Manager CLOSE hover wins over the existing base ID colour',()=>{assert.equal(closeColor(base+'\n'+manager),'var(--text)');});
test('known-bad class-only rule loses the approved Manager glyph colour',()=>{const old=manager.replace('body.manager #btn-close-settings:hover { color: var(--text); }','');assert.notEqual(old,manager,'class-only mutant applied');assert.notEqual(closeColor(base+'\n'+old),'var(--text)');assert.throws(()=>assert.equal(closeColor(base+'\n'+old),'var(--text)'));});
