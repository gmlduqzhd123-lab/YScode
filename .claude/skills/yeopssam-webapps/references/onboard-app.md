# 새 웹앱 등록 + 다른 앱처럼 맞추기

두 단계로 나뉜다. 사용자가 "모음집에 넣어줘"만 했으면 1단계만 하고, 끝에 "앱 자체도 다른 앱처럼 맞출까요?"라고 한 줄로 묻는다. "다른 앱처럼 만들어줘/맞춰줘"면 2단계까지 한다.

## 1단계 — 모음집(YScode)에 카드 추가

1. 앱 저장소를 읽기용으로 클론해 README·`index.html`에서 공개 주소, 앱 이름, 한 줄 설명을 확인한다.
2. 커버 이미지(1200×630)를 다른 카드와 같은 형식으로 만든다.
   ```bash
   source scripts/setup-tools.sh
   node scripts/make-cover.cjs --out /home/user/YScode/covers/<id>.jpg \
     --line1 "지도안" --line2 "대백과" --color "#10b981" --main "📚" --minis "📝,🔍,🏫,📄"
   # 게임 캐릭터처럼 앱 안의 그림이 있으면 --main-img / --mini-imgs 로 PNG를 쓴다 (웜즈 예)
   ```
   만든 뒤 이미지를 직접 열어 보고(Read) 글자 잘림·빈 칸이 없는지 확인한다.
3. `index.html` 앱 배열에서 **같은 분류의 마지막 앱 뒤**에 항목을 넣는다.
   ```js
   {
       id: 'lesson-plan',
       cover: 'covers/lesson-plan.jpg',
       accent: '#10b981',
       name: '지도안 대백과',
       category: '업무용',
       icon: '📚',
       desc: '학년·교과·단원으로 찾는 초등·유아 지도안 1,700여 개 · 한글 파일 분석까지',
       url: 'https://gmlduqzhd123-lab.github.io/lesson-plan/'
   },
   ```
   설명(desc)은 카드에서 2줄 안에 들어가게 40자 안팎으로. 길면 "…"으로 잘린다.
4. 로컬에서 모음집을 띄워 해당 분류 구역에 카드·커버가 보이는지 확인한다(카드 스크린샷).
5. `apps.json`에 새 앱 한 줄 추가. 마무리는 `git-workflow.md`.

## 2단계 — 앱을 다른 엽쌤 앱처럼 맞추기

수정하려면 `add_repo`(access `push`)로 붙이고 `/home/user/<repo>`에 클론한다. 저장소에 CLAUDE.md/AGENTS.md가 있으면 먼저 따른다.

넣을 것(정적 앱은 루트, Vite/React는 `public/`):

| 항목 | 내용 |
|---|---|
| `ys-install.js`, `ys-qr.js` | `assets/`에서 복사 |
| `qr.svg` | `node scripts/make-qr.cjs <공개주소> qr.svg "<앱 이름>"` |
| `og-image.jpg` | 1단계 커버와 같은 그림 |
| `icons/` | `node scripts/make-icons.cjs --out icons --emoji "📚"` (또는 `--img 캐릭터.png`, `--svg 로고.svg`, 색 `--from/--to`) |
| `manifest.webmanifest` | `"id": "/<저장소>/"`(절대경로!), `start_url`·`scope` `"./"`, `display: standalone`, 아이콘 3개(192, 512, maskable 512) |
| `sw.js` | 아래 틀. 캐시 이름 `<app>-v1`, 접두어 `<app>-v`, 네트워크 우선 |
| `<head>` | description, theme-color, og:*·twitter:* (이미지 주소는 절대 URL), manifest·apple-touch-icon 링크, `apple-mobile-web-app-title`, 두 스크립트. `<html>`에 `data-qr-url`, `data-qr-name` |
| 상단 버튼 | 첫 화면 **맨 윗줄 오른쪽**에 `<button data-ys-install>📲 <span class="…wide">앱 </span>설치</button>` + `<button data-qr aria-label="QR 코드로 접속">📱 QR</button>`. 휴대폰에서는 "앱 " 글자를 숨겨 "📲 설치"로 |
| 하단 문구 | `© 2026 엽쌤. All rights reserved. · <a href="https://gmlduqzhd123-lab.github.io/YScode/">엽쌤의 다른 앱 보기 →</a>` |
| 서비스 워커 등록 | `navigator.serviceWorker.register('./sw.js')` (Vite는 `import.meta.env.PROD`일 때 `BASE_URL + 'sw.js'`) |
| 자동 배포 | `deploy-check.md` 참고. 커스텀 워크플로가 `workflow_dispatch`만 있으면 `on.push.branches: [main]` 추가, 복사 목록에 새 파일 추가 |

```js
// sw.js 틀 — 같은 주소의 다른 앱과 캐시 저장소를 같이 쓰므로 내 접두어 캐시만 지운다
const CACHE = 'myapp-v1';
const CACHE_PREFIX = 'myapp-v';
const CORE = ['./', './index.html', './manifest.webmanifest', './ys-install.js', './ys-qr.js', './qr.svg', './icons/icon-192.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // 큰 원본 파일 폴더가 있으면 여기서 제외 (지도안 대백과의 /plans/)
  e.respondWith(fetch(req).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; })
    .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
```

특수한 경우:
- **CSP가 엄격한 앱**(패들렛 정리함 `style-src 'self'`, 한글 마감실 Vite+CSP): 인라인 스타일·스크립트를 쓰는 `ys-qr.js` 대신 네이티브 `<dialog>` + 정적 `qr.svg` + CSS 파일로 QR 창을 만든다. 빌드 산출물 허용 목록(`scripts/check-dist.mjs` 등)이 있으면 새 파일을 추가한다.
- **이미 서비스 워커가 있는 앱**: 새로 만들지 말고 CORE 목록에 새 파일을 넣고 캐시 버전을 올린다.
- **게임(캔버스) 앱**: 시작 화면(오버레이 패널) 맨 위에 버튼을 둔다. 게임 중 화면은 건드리지 않는다.
- **가로 전용 게임**(화재 탈출 넘버원, 조준! 각도왕, 오디세이 런): 세로 휴대폰에서는 '가로로 돌려주세요' 안내가 화면 전체를 덮어 버튼이 가려진다. 안내 화면 오른쪽 위에도 설치·QR을 넣는다. 측정기는 가려진 버튼도 "맨 윗줄"로 잴 수 있으니 **세로 390×844에서 QR을 실제로 눌러** 창이 열리는지 확인한다.
- **Vite/React/TS 앱**(교실 탈출, 뚝딱 바이브 공작소, 오디세이 런, 다국어 수업자료 변환기 등): 키트·qr.svg·og-image·icons·manifest·sw.js는 `public/`에. `index.html`의 `<script src="./ys-install.js" defer>`는 빌드 때 "can't be bundled" 경고가 나지만 그대로 복사되어 정상. 서비스 워커 등록은 `src/main.ts(x)`에서 `if ("serviceWorker" in navigator && import.meta.env.PROD) navigator.serviceWorker.register(\`${import.meta.env.BASE_URL}sw.js\`)` (CSP `script-src 'self'`면 인라인 스크립트 금지이므로 이 방식). 화면을 JS로 다시 그리는 앱이라도 키트는 document 클릭 위임이라 버튼만 HTML에 있으면 된다.
- **터치 크기 점검이 있는 앱**(교실 탈출: 모든 보이는 버튼 44px 이상, 오디세이 런): 설치·QR 버튼 `min-height: 44px`.
- **하단 문구가 두 번 보이는지**: 첫 화면과 작업 화면 footer가 따로 있는 앱(뚝딱 바이브 공작소)은 각 화면에서 하나만 보이는지 확인. 기존 CSS가 `footer span:last-child{display:none}`처럼 숨기면 `<p class="ys-credit">`로 넣는다.
- **이미 자체 QR 기능이 있는 앱**(할로윈의 교사용 QR 창, 뚝딱 바이브의 QR 카드): 그대로 두고 상단 공통 버튼만 추가한다.
- **점검 도구가 저장소 안 기록용 스크린샷(artifacts/ 등)을 덮어쓰면** `git checkout -- artifacts`와 새 파일 삭제로 되돌린 뒤 커밋한다.

확인: 360·390·1280px에서 버튼이 맨 윗줄·가로 넘침 없음(`top-buttons-check.md`의 측정기), QR 창 열림, manifest `id`, 서비스 워커 등록, 앱의 원래 기능(예: 전투 시작) 정상, 콘솔 오류 없음. 저장소에 테스트가 있으면 돌린다.
