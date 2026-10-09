// Service worker : toujours la dernière version en ligne (sans cache navigateur), copie en secours hors ligne.
const V='lampyria-v8';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!=V).map(n=>caches.delete(n)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;
e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
