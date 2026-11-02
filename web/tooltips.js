// The online tooltip host lives in the portal. Keep item hints available locally.
export function installTooltips(engine){
 const box=document.createElement('div');box.id='offline-tooltip';box.role='tooltip';box.hidden=true;document.body.append(box);
 let active=null;
 function hide(){active=null;box.hidden=true}
 function show(target){
  if(active===target)return;
  const value=target.getAttribute('data-tooltip');if(!value)return;
  let type,id,data;
  if(value.startsWith('{')){const hint=JSON.parse(value);type=hint.type?.replace('d2r_','');data=hint.data;id=data?.id}
  else{if(!value.startsWith('d2r_'))return;const colon=value.indexOf(':');if(colon<0)return;type=value.slice(4,colon);id=value.slice(colon+1)}
  const info=engine.cc({id,type,data,fromDB:true});if(!info?.desc?.length)return;
  box.replaceChildren();
  for(const line of info.desc){
   const row=document.createElement('div');row.className='offline-tooltip-line';
   for(const part of Array.isArray(line)?line:[{text:line}]){const span=document.createElement('span');span.textContent=part.content??part.text??'';if(part.tag)span.className=part.tag;row.append(span)}
   if(!row.textContent)row.append(document.createElement('br'));box.append(row);
  }
  active=target;box.hidden=false;
  const rect=target.getBoundingClientRect(),padding=12;
  const x=rect.right+10+box.offsetWidth<innerWidth?rect.right+10:Math.max(padding,rect.left-box.offsetWidth-10);
  box.style.left=x+'px';box.style.top=Math.max(padding,Math.min(rect.top,innerHeight-box.offsetHeight-padding))+'px';
 }
 document.addEventListener('pointerover',event=>{const target=event.target.closest('[data-tooltip]');if(target)show(target)});
 document.addEventListener('pointerout',event=>{if(active&&!active.contains(event.relatedTarget))hide()});
 document.addEventListener('click',event=>{if(!matchMedia('(hover: none)').matches)return;const target=event.target.closest('[data-tooltip]');target?show(target):hide()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')hide()});window.addEventListener('scroll',hide,{passive:true});
}
