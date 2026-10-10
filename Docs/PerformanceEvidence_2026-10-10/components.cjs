'use strict';
// Read-only component timings. Does not import Electron or product main/store.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const v8 = require('node:v8');
const { performance } = require('node:perf_hooks');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/main/regions/model.js'));
const source = path.join(process.env.APPDATA, 'QuickLauncher/quicklauncher-data.json');
const bytes = fs.readFileSync(source);
const data = JSON.parse(bytes);
const themes = new Set(fs.readdirSync(path.join(root, 'src/renderer/styles/themes')).filter(n => n.endsWith('.css')).map(n => n.slice(0, -4)));
const timed = fn => { const cpu = process.cpuUsage(), t = performance.now(); const value = fn(); return { value, ms: performance.now() - t, cpuMs: Object.values(process.cpuUsage(cpu)).reduce((a,b) => a+b,0)/1000 }; };
const trials = [];
for (let i = 0; i < 5; i++) {
  const read = timed(() => fs.readFileSync(source, 'utf8'));
  const parse = timed(() => JSON.parse(read.value));
  const migration = timed(() => M.migrate(parse.value, { workArea: {x:0,y:0,width:2560,height:1440}, validThemes:themes, newId:crypto.randomUUID, defaultTheme:'cyberpunk' }));
  const payload = timed(() => parse.value.regions.map(r => M.itemsOf(parse.value.apps,r.id)));
  const clone = timed(() => payload.value.map(items => v8.deserialize(v8.serialize(items))));
  trials.push({ index:i, read:{ms:read.ms,cpuMs:read.cpuMs}, parse:{ms:parse.ms,cpuMs:parse.cpuMs}, migration:{ms:migration.ms,cpuMs:migration.cpuMs,changed:migration.value.changed}, regionPayloads:{ms:payload.ms,cpuMs:payload.cpuMs}, nodeCloneProxy:{ms:clone.ms,cpuMs:clone.cpuMs} });
}
const icons = data.apps.map(a => a.iconDataUrl || '');
const pngs = icons.map(url => { if(!url.startsWith('data:image/png;base64,'))return null; const buf=Buffer.from(url.split(',')[1],'base64'); if(buf.length<24||buf.toString('ascii',1,4)!=='PNG')return null; return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20),bytes:buf.length}; }).filter(Boolean);
const result = { method:'5 sequential warm-cache trials; Node components, not full Electron startup; fixed synthetic 2560x1440 migration work area; Node V8 clone is only serialization proxy', profileSha256:crypto.createHash('sha256').update(bytes).digest('hex'), fileBytes:bytes.length, regions:data.regions.length, apps:data.apps.length, totalRegionPayloadBytes:data.regions.reduce((n,r)=>n+Buffer.byteLength(JSON.stringify(M.itemsOf(data.apps,r.id))),0), iconDataUrlBytes:icons.reduce((n,s)=>n+Buffer.byteLength(s),0), uniqueIconDataUrls:new Set(icons.filter(Boolean)).size, pngIcons:pngs.length, summedPngPixelBytes:pngs.reduce((n,p)=>n+p.width*p.height*4,0), maxPngWidth:Math.max(0,...pngs.map(p=>p.width)), maxPngHeight:Math.max(0,...pngs.map(p=>p.height)), trials };
console.log(JSON.stringify(result,null,2));
