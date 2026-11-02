import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import worker from '../worker.mjs';

const root=new URL('../dist/',import.meta.url);
async function serve(path,method='GET'){
 const calls=[];
 const response=await worker.fetch(new Request('https://example.test'+path,{method}),{ASSETS:{async fetch(request){
  const url=new URL(request.url);calls.push(url.pathname+url.search);
  try{
   const data=await readFile(new URL('.'+url.pathname,root));
   return new Response(method==='HEAD'?null:data,{headers:{'Content-Type':/\.html?$/.test(url.pathname)?'text/html; charset=utf-8':'application/octet-stream'}});
  }catch(error){if(error.code==='ENOENT'||error.code==='EISDIR')return new Response('Not Found',{status:404});throw error}
 }}});
 return {response,calls};
}

test('all database tabs and the two new tabs resolve to the site shell',async()=>{
 for(const path of ['/','/d2r/data/unique','/d2r/data/skill?lang=zhTW','/d4/boss-timer','/wiki','/wiki/']){
  const {response,calls}=await serve(path);assert.equal(response.status,200,path);assert.match(calls[0],/^\/index\.html/);assert.match(await response.text(),/offline-nav/);
 }
});

test('encyclopedia bytes and its declared legacy encoding remain intact',async()=>{
 const path='/encyclopedia/diablo/index.htm';const {response,calls}=await serve(path);
 assert.equal(response.status,200);assert.equal(calls[0],path);assert.equal(response.headers.get('Content-Type'),'text/html');
 const bytes=Buffer.from(await response.arrayBuffer());assert.deepEqual(bytes,await readFile(new URL('.'+path,root)));assert.match(bytes.toString('latin1'),/charset=gb2312/i);
 const index=await serve('/encyclopedia/diablo/basics/');assert.equal(index.response.status,200);assert.equal(index.calls[0],'/encyclopedia/diablo/basics/index.html');
});

test('missing archive content remains a 404 and the retired update endpoint is absent',async()=>{
 for(const path of ['/encyclopedia/diablo/not-a-page.htm','/api/sync'])assert.equal((await serve(path)).response.status,404,path);
});

test('boss schedule is a separate static asset and the page has no update controls',async()=>{
 const {response}=await serve('/data/boss-schedule.json');const schedule=await response.json();for(const cfg of [schedule.world,schedule.normal]){assert.ok(Number.isFinite(cfg.intervalSeconds)&&cfg.intervalSeconds>0);assert.ok(Number.isFinite(Date.parse(cfg.baseTime)))}
 const shell=await readFile(new URL('index.html',root),'utf8'),script=await readFile(new URL('offline.js',root),'utf8');
 assert.doesNotMatch(shell,/sync-button|sync-dialog|同步数据/);assert.doesNotMatch(script,/api\/sync|synchronize\(/);
});
