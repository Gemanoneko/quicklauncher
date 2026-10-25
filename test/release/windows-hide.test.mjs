import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../../scripts/release.mjs',import.meta.url),'utf8');
// Execute the actual release control flow with inert process/filesystem fakes.
// No GitHub call, npm build, token lookup, native process or UI can occur.
function run({draft=false,authFailure=false,code=source}={}){
 const calls=[],logs=[],secret='PRIVATE_TOKEN_FIXTURE';
 const context={URL,SOURCE_URL:'file:///owned/scripts/release.mjs',console:{log:message=>logs.push(message),error:message=>logs.push(message)},
  process:{platform:'win32',env:{PROGRAMFILES:'C:\\Program Files'},exit:code=>{throw Object.assign(Error('exit'),{exitCode:code});}},
  existsSync:file=>file==='C:\\Program Files\\GitHub CLI\\gh.exe',readFileSync:()=>JSON.stringify({version:'1.104.3',build:{publish:{owner:'fixture',repo:'fixture'}}}),
  spawnSync(file,args,options){calls.push({file,args,options});
   if(args[0]==='auth')return{status:authFailure?1:0,stdout:secret+'\n',stderr:''};
   if(args[1]==='view')return{status:draft?0:1,stdout:draft?'true\n':'',stderr:''};
   return{status:0,stdout:'',stderr:''};
  }};
 let exitCode=0;try{vm.runInNewContext(code.replace(/^import .*;\r?$/gm,'').replaceAll('import.meta.url','SOURCE_URL'),context);}catch(error){if(error.exitCode===undefined)throw error;exitCode=error.exitCode;}
 return{calls,logs,secret,exitCode};
}
test('canonical fresh/reused draft release hides every child and keeps token inside build environment',()=>{
 for(const draft of [false,true]){
  const r=run({draft});assert.equal(r.exitCode,0);assert.ok(r.calls.length>=4);
  for(const call of r.calls)assert.equal(call.options.windowsHide,true,call.args.join(' '));
  const build=r.calls.find(call=>call.file==='npm');assert.equal(build.options.env.GH_TOKEN,r.secret);
  assert.equal(r.logs.join('\n').includes(r.secret),false);
  assert.equal(r.calls.filter(call=>call.file!=='npm').some(call=>call.args.includes(r.secret)),false);
 }
});
test('auth failure also stays hidden and exits before build/publish',()=>{
 const r=run({authFailure:true});assert.equal(r.exitCode,1);assert.equal(r.calls.length,1);assert.equal(r.calls[0].options.windowsHide,true);
 assert.equal(r.logs.join('\n').includes(r.secret),false);
});
test('positive control: removing hidden-child options exposes the omitted protection',()=>{
 const r=run({code:source.replace(/windowsHide:\s*true,?/g,'')});
 assert.ok(r.calls.some(call=>call.options.windowsHide!==true));
});
