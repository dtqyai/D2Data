async function readAnimation(response){
 const buffer=await response.arrayBuffer();
 const prefix=String.fromCharCode(...new Uint8Array(buffer,0,Math.min(5,buffer.byteLength)));
 if(prefix!=='data:')return buffer;
 const text=new TextDecoder().decode(buffer);
 return Uint8Array.from(atob(text.slice(text.indexOf(',')+1)),character=>character.charCodeAt(0)).buffer;
}

export function loadDatabaseData(manifest,language){
 const base=`/data/d2r/${manifest.version}/`;
 async function read(name,animation=false){
  const response=await fetch(base+name);
  if(!response.ok)throw new Error(`数据文件加载失败：${name}（${response.status}）`);
  return animation?readAnimation(response):response.json();
 }
 return Promise.all([
  read('planner.json'),
  read(`strings_${language}.json`),
  read('sprite.new.d2r',true)
 ]);
}
