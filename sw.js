// service worker: קדם-אחסון של כל קבצי המשחק — עובד אופליין לגמרי.
// בכל עדכון לאפליקציה יש להעלות את מספר הגרסה כאן:
const CACHE = 'math-adventure-v24';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/main.css',
  './js/app.js',
  './js/storage.js',
  './js/audio.js',
  './js/curriculum/index.js',
  './js/curriculum/noya.js',
  './js/curriculum/alin.js',
  './js/curriculum/memNoya.js',
  './js/curriculum/memAlin.js',
  './js/curriculum/hebNoya.js',
  './js/curriculum/hebAlin.js',
  './js/engine/generator.js',
  './js/engine/rewards.js',
  './js/engine/shopCatalog.js',
  './js/engine/hebrewContent.js',
  './js/engine/careData.js',
  './js/screens/profileSelect.js',
  './js/screens/subjectSelect.js',
  './js/screens/worldMap.js',
  './js/screens/exercise.js',
  './js/screens/prizes.js',
  './js/screens/character.js',
  './js/screens/shop.js',
  './js/screens/parent.js',
  './js/screens/memory.js',
  './js/screens/collection.js',
  './js/screens/room.js',
  './js/ui/components.js',
  './js/ui/character-svg.js',
  './js/ui/confetti.js',
  './js/ui/flags.js',
  './js/ui/celebrate.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(e.request).catch(() => {
        // אין רשת ואין במטמון — ניווט נופל חזרה למסך הראשי
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline');
      });
    })
  );
});
