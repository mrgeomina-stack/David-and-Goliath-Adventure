/* Every installed version owns one complete, immutable offline shell. */
const VERSION='__BUILD_VERSION__';
const PREFIX='davids-adventure-';
const CACHE=PREFIX+VERSION;
const REQUIRED=['index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'].map(path=>new URL(path,self.registration.scope).href);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  try{const cache=await caches.open(CACHE);await cache.addAll(REQUIRED.map(url=>new Request(url,{cache:'reload'})));}
  catch(error){await caches.delete(CACHE);throw error;}
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
 if(event.data?.type==='CACHE_STATUS')event.waitUntil((async()=>{
  const cache=await caches.open(CACHE),entries=await Promise.all(REQUIRED.map(url=>cache.match(url)));
  event.ports[0]?.postMessage({ready:entries.every(Boolean),version:VERSION});
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url),scope=new URL(self.registration.scope);
 if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).catch(async()=>{
   const cached=await (await caches.open(CACHE)).match(REQUIRED[0]);
   return cached||new Response('Open the adventure online once to save it for offline play.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }));return;
 }
 if(REQUIRED.some(asset=>new URL(asset).pathname===url.pathname))event.respondWith((async()=>{
  const cached=await (await caches.open(CACHE)).match(request,{ignoreSearch:true});return cached||fetch(request);
 })());
});
