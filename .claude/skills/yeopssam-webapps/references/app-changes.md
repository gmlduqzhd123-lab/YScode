# 연결된 앱 변화 관리 (새 앱 · 이름 변경 · 공유 정보)

## 1. "연결 상태 점검 / 새로 추가할 앱 있는지" 요청
1. `list_repos`로 저장소 목록을 받아 `apps.json`의 `repo`와 비교한다.
2. 목록에 없는 저장소는 임시 폴더에 `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1`로 받아 `index.html`의 `<title>`·description, README 첫 줄, `.github/workflows`(자동 배포 여부)를 본다.
3. 보고: 앱 이름(앱 안의 제목) · 무엇인지 한 줄 · 배포 상태 · 분류 추천(수업용/업무용/여가용/기타). "넣을까요?"로 묻는다.
4. 넣지 않기로 한 저장소(아래 표)는 "제외한 저장소"로만 한 줄 언급한다.
5. 배포 점검(`deploy-check.sh`)과 버튼 점검(`prepare-local.sh` → `topcheck.cjs`)도 함께 돌린다. 오래 걸리니 백그라운드로.

| 저장소 | 상태 | 이유·약속 |
|---|---|---|
| Reading-Handy | 모음집에 넣지 않음 | 웹앱이 아닌 손글씨 OCR 모델 저장소. 엽쌤이 "넣지 마"라고 함 |
| Thinking (생각의 갈림길 AI) | 카드만 있음(설명 끝 "(개발판)"), **앱은 손대지 않음** | 개발 미리보기·검색 비노출·gh-pages 수동 배포·캐시 비저장 원칙. 엽쌤이 "작업하라고 할 때 하자"고 함. 저장소 CLAUDE.md에 '다른 엽쌤 앱 보호 규칙'을 넣어 둠. topcheck의 ❌·로컬 빌드 실패(모델 파일 없음)는 정상으로 보고 |
| physical-pi(땀방울 원정대), nicehelperys(담임노트) | 카드만 있음 | 접근 권한 없음 |

## 2. 앱 이름이 바뀌었을 때 (예: 명운 → 별빛 나침반, 여순광 맛집 지도 → 전국 맛집 지도, 웜즈 → 조준! 각도왕)
보통 다른 작업이 앱 안의 이름은 이미 바꿔 둔다. 남는 곳을 찾아 고친다.
1. 앱 저장소: `git grep -n "<옛 이름>"` — 화면·manifest·og 제목·`data-qr-name`. **og-image(공유 그림)에 옛 이름이 그려져 있는지 직접 열어 본다.** 데이터 파일의 출처 기록(attribution)처럼 과거 사실을 적은 곳은 그대로 둔다.
2. 모음집: 카드 `name`·`desc`·`icon`, 커버 그림 새로 만들기(`make-cover.cjs`, 게임은 앱 속 캐릭터 PNG/webp로 `--main-img`), 커버 주소에 `?v=날짜`. 첫 화면 쇼케이스에 같은 커버가 쓰이면 그것도 `?v=`.
3. 공유 그림을 바꾸면 og:image·twitter:image 주소에도 `?v=날짜`를 붙여 카톡이 새로 받게 한다.
4. `apps.json`의 `name`, `top-buttons-check.md` 앱별 메모를 새 이름으로.

## 3. 모음집(YScode) 공유 정보
- `og:description`·`og:image:alt`와 `og-image.jpg` 안에 앱 개수("N가지", "N apps")와 대표 앱 이름이 들어 있다. 앱을 넣거나 이름이 바뀌면 낡는다.
- 개수 = 모음집 카드 수: `grep -cE "^\s+name: '" index.html` (접근 불가 카드 포함).
- og-image는 HTML(왼쪽 제목·pill·"made with vibe.", 오른쪽 기울어진 앱 타일 9개)을 Pretendard(`$YS_FONT`)로 그려 Playwright로 1200×630 JPEG 스크린샷 → `og-image.jpg`, 주소에 `?v=날짜`.
- 썸네일·커버에 버전 숫자를 넣으면 앱이 올라갈 때마다 어긋난다(매쓰 서바이벌 2.1 vs 3.0.2). 넣을 때는 앱의 공유 제목(og:title)과 맞춘다.
