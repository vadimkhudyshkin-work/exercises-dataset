// Офлайн-режим для workout.html: страница и анимации кэшируются на телефоне.
const CACHE = 'gym-v3';
const GIFS = ['0017-kiJ4Z2K', '0200-dU605di', '0235-FWdVhcW', '0294-NbVPDMW', '0313-slDvUAU', '0314-ns0SIbU', '0334-DsgkuIt', '0489-zhMwOwE', '0577-T0yTjgW', '0585-my33uHU', '0586-17lJ1kr', '0596-v3xmPAR', '0597-CHpahtl', '0598-oHsrypV', '0599-Zg3XY7P', '0602-myfUsKf', '0603-67n3r98', '0605-ykUOVze', '0818-rkg41Fb', '0861-fUBheHs', '1350-7I6LNUG', '1463-2Qh2J1e', '3013-u0cNiij'].map(id => 'videos/' + id + '.gif');
const CORE = ['workout.html', ...GIFS];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Данные таблицы не кэшируем — они всегда свежие или ошибка.
  if (url.hostname.includes('script.google') || url.hostname.includes('googleusercontent')) return;

  // Страница: сначала сеть (чтобы приходили обновления), без сети — из кэша.
  if (req.mode === 'navigate' || url.pathname.endsWith('workout.html')) {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r;
    }).catch(() => caches.match(req).then(r => r || caches.match('workout.html'))));
    return;
  }

  // Анимации, шрифты, библиотека графиков: сначала кэш, потом сеть.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
