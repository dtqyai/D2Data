const databaseRoute=/^\/d2r\/data\/(runeword|unique|set|normal|cube|craft|affix|skill|rune)$/;

export default {
 async fetch(request,env){
  const url=new URL(request.url),route=url.pathname.replace(/\/+$/,'')||'/';
  if(['/', '/index.html','/d4/boss-timer','/wiki'].includes(route)||databaseRoute.test(route))url.pathname='/index.html';
  // The archived site uses its original directory index pages and meta charset.
  if(url.pathname.startsWith('/encyclopedia/')&&url.pathname.endsWith('/'))url.pathname+='index.html';
  const response=await env.ASSETS.fetch(new Request(url,request));
  if(url.pathname.startsWith('/encyclopedia/')&&/\.html?$/i.test(url.pathname)&&response.ok){
   const headers=new Headers(response.headers);headers.set('Content-Type','text/html');
   return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
  return response;
 }
};
