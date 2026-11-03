import {cp,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('dist/manifest.json',root),'utf8'));
const mainPath=new URL('dist'+manifest.main,root);
const source=await readFile(mainPath,'utf8');
const boundary=source.indexOf('\nfunction offlineNavigate(');
if(boundary<0)throw new Error('数据库引擎适配入口已变化，请检查当前数据包。');
const adapter=await readFile(new URL('tools/offline-engine.mjs',root),'utf8');
await cp(new URL('web/',root),new URL('dist/',root),{
 recursive:true,
 filter:path=>!['content-layout.js','database-layout.js','.DS_Store'].includes(String(path).split('/').at(-1))
});
await writeFile(mainPath,source.slice(0,boundary)+'\n'+adapter);
console.log('已生成站点页面和百科资源。');
