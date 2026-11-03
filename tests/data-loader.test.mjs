import test from 'node:test';
import assert from 'node:assert/strict';
import {loadDatabaseData} from '../web/data-loader.mjs';

const animation=Uint8Array.of(1,2,3,4,5,6,7,8);

test('database, selected language and animation start together using the manifest version',async t=>{
 const requests=[];
 t.mock.method(globalThis,'fetch',url=>new Promise(resolve=>requests.push({url,resolve})));
 const loaded=loadDatabaseData({version:'next-version'},'zhTW');
 assert.deepEqual(requests.map(item=>item.url),[
  '/data/d2r/next-version/planner.json',
  '/data/d2r/next-version/strings_zhTW.json',
  '/data/d2r/next-version/sprite.new.d2r'
 ]);
 requests[0].resolve(Response.json({runewords:[{id:'test'}]}));
 requests[1].resolve(Response.json([[1,'test','測試']]));
 requests[2].resolve(new Response('data:application/octet-stream;base64,'+Buffer.from(animation).toString('base64')));
 const [planner,strings,decoded]=await loaded;
 assert.deepEqual(planner,{runewords:[{id:'test'}]});
 assert.deepEqual(strings,[[1,'test','測試']]);
 assert.deepEqual(new Uint8Array(decoded),animation);
});

test('binary animation data remains intact',async t=>{
 t.mock.method(globalThis,'fetch',async url=>url.endsWith('.d2r')?new Response(animation):Response.json({}));
 const [,,decoded]=await loadDatabaseData({version:'test'},'enUS');
 assert.deepEqual(new Uint8Array(decoded),animation);
});

test('a missing database file reports the failing resource',async t=>{
 t.mock.method(globalThis,'fetch',async url=>url.endsWith('planner.json')?new Response('Not Found',{status:404}):url.endsWith('.d2r')?new Response(animation):Response.json([]));
 await assert.rejects(loadDatabaseData({version:'test'},'zhCN'),/planner\.json.*404/);
});
