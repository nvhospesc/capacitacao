/* Modo offline: guarda o site e o último conteúdo carregado neste aparelho */
const VERSAO = 'nep-v2';
const ESTATICOS = ['./', 'index.html', 'config.js', 'assets/style.css', 'assets/app.js', 'assets/logo-hospesc.png', 'assets/favicon.png', 'dados/conteudo.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ESTATICOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const conteudo = u.hostname.endsWith('google.com') && u.pathname.includes('/spreadsheets/') || u.pathname.endsWith('conteudo.json') || u.pathname.endsWith('config.js');
  const proprio = u.origin === self.location.origin;
  if (!conteudo && !proprio) return; // fontes, Drive, Forms: direto da rede
  // conteúdo e código: rede primeiro, cópia guardada se estiver sem internet
  e.respondWith(
    fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(VERSAO).then(c => c.put(req, cp)); }
      return r;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
