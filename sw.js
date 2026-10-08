// Service worker : le réseau d'abord (les mises à jour s'affichent tout de suite), le cache en secours hors ligne.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;
e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open('lampyria').then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
