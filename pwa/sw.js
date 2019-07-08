const CACHE_NAME = 'static-cache-v' + (new Date).getTime();
const FILES_TO_CACHE = [
];

const logger = function(...args){
    console.log('[SW-LOG]', ...args);
}
const getFilePath = function(url) {
    return url.replace('https://pwa-test.tadigital.com','');
};
logger.cache = {};

self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', async (evt) => {
    logger('Active event....');
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
    if (evt.request.url.indexOf('api') >= 0 ) {
        evt.respondWith(async () => {
            return fetch(evt.request);
        });
    } else {
        evt.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(evt.request).then((response) => {
                    if (response) {
                        return response;
                    } else {
                        return fetch(evt.request);
                    }
                });
            })
        );
    }
});