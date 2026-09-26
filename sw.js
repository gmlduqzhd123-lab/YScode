// 앱 설치(PWA)용 서비스워커.
// 페이지는 항상 네트워크를 먼저 확인해 최신 내용을 보여 주고, 오프라인일 때만 저장해 둔 사본을 씁니다.
// 이미지·아이콘처럼 잘 바뀌지 않는 파일은 저장해 둔 사본을 먼저 씁니다. 이런 파일을 바꾸면 CACHE_VERSION을 올려 주세요.
const CACHE_VERSION = 'yscode-v2';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);
    if (req.method !== 'GET' || url.origin !== self.location.origin) return;

    const isStatic = /\.(png|jpe?g|webp|svg)$/.test(url.pathname);
    if (isStatic) {
        event.respondWith(
            caches.match(req).then(hit => hit || fetch(req).then(res => {
                const copy = res.clone();
                caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
                return res;
            }))
        );
        return;
    }

    event.respondWith(
        fetch(req).then(res => {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
            return res;
        }).catch(() => caches.match(req).then(hit => hit || caches.match('./')))
    );
});
