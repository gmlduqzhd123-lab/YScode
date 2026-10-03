// 앱 설치(PWA)용 서비스워커.
// 페이지는 항상 네트워크를 먼저 확인해 최신 내용을 보여 주고, 오프라인일 때만 저장해 둔 사본을 씁니다.
// 이미지는 저장해 둔 사본을 먼저 보여 주고 뒤에서 새로 받아 둡니다. 크게 바꿀 때는 CACHE_VERSION도 올려 주세요.
const CACHE_VERSION = 'yscode-v7';
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

    // 이미지: 저장해 둔 사본을 먼저 보여 주고, 뒤에서 새 파일을 받아 다음 방문 때 반영 (stale-while-revalidate)
    const isStatic = /\.(png|jpe?g|webp|svg)$/.test(url.pathname);
    if (isStatic) {
        event.respondWith(
            caches.open(CACHE_VERSION).then(cache => cache.match(req).then(hit => {
                const network = fetch(req).then(res => {
                    if (res.ok) cache.put(req, res.clone());
                    return res;
                }).catch(() => hit || Response.error());
                return hit || network;
            }))
        );
        return;
    }

    event.respondWith(
        fetch(req).then(res => {
            // 정상 응답만 저장 (404 같은 오류 페이지는 저장하지 않음)
            if (res.ok) {
                const copy = res.clone();
                caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
            }
            return res;
        }).catch(() => caches.match(req).then(hit => {
            if (hit) return hit;
            // 오프라인일 때 첫 화면으로 대신 보여 주는 것은 페이지 이동에만
            if (req.mode === 'navigate') return caches.match('./').then(home => home || Response.error());
            return Response.error();
        }))
    );
});
