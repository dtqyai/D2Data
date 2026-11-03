import {loadDatabaseData} from '/data-loader.mjs';
const $=id=>document.getElementById(id);
const manifest=await fetch('/manifest.json',{cache:'no-store'}).then(r=>r.json());
const params=new URLSearchParams(location.search);
const path=location.pathname.replace(/\/+$/,'')||'/';
const key=path.split('/').filter(Boolean).at(-1);
const section=path==='/d4/boss-timer'?'boss':path==='/wiki'?'wiki':'database';
const page=Object.hasOwn(manifest.pages,key)?key:'runeword';
const lang=params.get('lang')||'zhCN';

function addTab(title,href,active){
 const link=document.createElement('a');link.href=href;link.textContent=title;
 if(active){link.className='active';link.setAttribute('aria-current','page')}
 $('offline-nav').append(link);
}
for(const [id,title] of Object.entries(manifest.modules))addTab(title,'/d2r/data/'+id+(lang==='zhCN'?'':'?lang='+lang),section==='database'&&id===page);
addTab('D4 Boss计时','/d4/boss-timer',section==='boss');
addTab('百科','/wiki',section==='wiki');
$('offline-nav').querySelector('.active')?.scrollIntoView({block:'nearest',inline:'nearest'});

if(section==='database'){
 $('offline-language').value=lang;
 $('data-version').textContent=`数据 ${manifest.version} · ${new Date(manifest.syncedAt).toLocaleDateString('zh-CN')}`;
 $('offline-language').onchange=e=>{const query=new URLSearchParams(location.search);query.set('lang',e.target.value);location.search=query.toString()};
 function detail(label,value){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;$('data-details').append(dt,dd)}
 detail('数据版本',manifest.version);detail('数据时间',new Date(manifest.syncedAt).toLocaleString('zh-CN'));detail('本地图片',`${manifest.images} 张`);
 if(manifest.missingImages)detail('原站缺失图片',`${manifest.missingImages} 张`);
 const dt=document.createElement('dt'),dd=document.createElement('dd'),source=document.createElement('a');dt.textContent='数据来源';source.href=manifest.source;source.textContent='暗黑核 D2Core';source.target='_blank';source.rel='noreferrer';dd.append(source);$('data-details').append(dt,dd);
 $('info-button').onclick=()=>$('data-dialog').showModal();
 $('close-dialog').onclick=()=>$('data-dialog').close();
 $('data-dialog').onclick=e=>{if(e.target===$('data-dialog'))$('data-dialog').close()};
}else{
 $('data-version').remove();document.querySelector('.offline-actions').remove();$('data-dialog').remove();
}

try{
 if(section==='boss'){
  document.title='D4 Boss计时';
  $('app').innerHTML=await fetch('/boss.html').then(r=>{if(!r.ok)throw new Error('计时页面缺失');return r.text()});
  const schedule=await fetch('/data/boss-schedule.json',{cache:'no-store'}).then(r=>r.json());
  for(const cfg of [schedule.world,schedule.normal])if(!Number.isFinite(cfg.intervalSeconds)||cfg.intervalSeconds<=0||!Number.isFinite(Date.parse(cfg.baseTime)))throw new Error('Boss 周期配置无效');
  const {initBossTimer}=await import('/boss-timer.mjs');initBossTimer(schedule);
 }else if(section==='wiki'){
  document.title='百科';document.body.classList.add('encyclopedia-page');
  const frame=document.createElement('iframe');frame.className='encyclopedia-frame';frame.title='百科';frame.src='/encyclopedia/diablo/index.htm';$('app').replaceChildren(frame);
 }else{
  const styles=Promise.all(manifest.css.map(href=>new Promise((resolve,reject)=>{
   const link=document.createElement('link');link.rel='stylesheet';link.href=href;
   link.onload=resolve;link.onerror=()=>reject(new Error('样式文件加载失败：'+href));
   document.head.insertBefore(link,document.querySelector('link[href="/offline.css"]'));
  })));
  const resources=Promise.all([styles,import(manifest.main),import('/tooltips.js'),loadDatabaseData(manifest,lang)]);
  let tooltipsInstalled=false;

  function databasePage(url){
   if(url.origin!==location.origin||(url.searchParams.get('lang')||'zhCN')!==lang)return null;
   const route=url.pathname.replace(/\/+$/,'')||'/';
   if(route==='/'||route==='/index.html')return 'runeword';
   const match=route.match(/^\/d2r\/data\/([^/]+)$/);
   return match&&Object.hasOwn(manifest.pages,match[1])?match[1]:null;
  }
  async function renderDatabase(){
   const url=new URL(location.href),nextPage=databasePage(url);
   if(!nextPage){location.reload();return;}
   const [[,engine,tooltips,data],component]=await Promise.all([resources,import(manifest.pages[nextPage])]);
   if(location.href!==url.href)return;
   engine.mountOffline(component.default,data);
   if(!tooltipsInstalled){tooltips.installTooltips(engine);tooltipsInstalled=true;}
   document.title=manifest.modules[nextPage]+' · D2数据库';
   for(const link of $('offline-nav').querySelectorAll('a')){
    const active=new URL(link.href).pathname==='/d2r/data/'+nextPage;
    link.classList.toggle('active',active);
    if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
   }
   $('offline-nav').querySelector('.active')?.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  function showError(error){$('app').textContent='页面加载失败：'+error.message;console.error(error.stack||String(error));}
  async function navigate(href){
   const url=new URL(href,location.href);
   if(!databasePage(url)){location.assign(url.href);return;}
   if(url.href===location.href)return;
   history.pushState(null,'',url.pathname+url.search+url.hash);
   try{await renderDatabase();if(location.href===url.href)window.scrollTo(0,0);}catch(error){showError(error);}
  }
  await renderDatabase();
  window.__D2_NAVIGATE__=navigate;
  document.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target.closest('a[href]');
   if(!link||link.hasAttribute('download')||link.target&&link.target!=='_self'||!databasePage(new URL(link.href)))return;
   event.preventDefault();navigate(link.href);
  });
  window.addEventListener('popstate',()=>{renderDatabase().catch(showError);});
 }
}catch(error){$('app').textContent='页面加载失败：'+error.message;console.error(error.stack||String(error))}
