import {cp,access} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
await access(new URL('dist/manifest.json',root));
await cp(new URL('web/',root),new URL('dist/',root),{
 recursive:true,
 filter:path=>!['content-layout.js','database-layout.js','.DS_Store'].includes(String(path).split('/').at(-1))
});
console.log('已生成站点页面和百科资源。');
