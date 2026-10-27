---
name: yeopssam-webapps
description: 엽쌤(gmlduqzhd123-lab)의 웹앱 모음집(YScode)과 개별 웹앱들을 관리하는 작업 묶음. ① 새 웹앱을 모음집에 등록하고(수업용·업무용·여가용·기타, 커버 이미지 포함) 다른 앱과 똑같이 맞추기(📲 앱 설치·📱 QR 상단 버튼, 공유 미리보기 이미지, © 2026 엽쌤 하단 문구, manifest·서비스 워커, 자동 배포) ② 전체 앱의 앱 설치·QR 상단 배치 점검과 수정(휴대폰 360·390px / PC 1280px) ③ 전체 앱 자동 배포 여부 점검. 사용자가 "○○ 웹앱도 모음집에 넣어줘", "업무용/여가용으로 추가", "다른 앱처럼 맞춰줘/만들어줘", "앱설치·QR 상단 배치 체크", "맨 윗줄로 올려줘", "자동 배포 체크", "연결된 앱 목록" 처럼 말하면 앱 이름이나 저장소 주소만 있어도 반드시 이 스킬을 쓴다. github.com/gmlduqzhd123-lab/... 링크가 오거나 엽쌤의 앱(쉬는시간 오락실, 4시 40분의 용사, 아카라카, 지도안 대백과, 웜즈 등)을 여러 개 한꺼번에 손볼 때도 쓴다.
---

# 엽쌤 웹앱 관리

엽쌤은 초등 교사이고, 코딩 용어보다 결과를 궁금해한다. **답은 한국어로, 쉬운 말로**, "어디에 무엇이 보이게 됐는지"를 중심으로 보고한다. 파일명·CSS 이야기는 꼭 필요할 때만 짧게 한다.

## 먼저 알아 둘 구조

- 모음집: `gmlduqzhd123-lab/YScode` → https://gmlduqzhd123-lab.github.io/YScode/ . 앱 카드는 `index.html` 안의 앱 배열(`id, cover, accent, name, category, icon, desc, url`)에 있다. 분류는 `수업용 · 업무용 · 여가용 · 기타`(업무용 색 `#3b82f6`, 여가용 `#f59e0b`).
- 앱 대부분이 **같은 주소(gmlduqzhd123-lab.github.io)** 아래의 GitHub Pages 프로젝트 사이트다. 그래서
  - manifest `id`는 반드시 절대경로 `"/저장소이름/"` (`"./"`면 다른 앱과 같은 앱으로 취급돼 엉뚱한 앱이 설치된다)
  - 서비스 워커는 캐시 이름에 앱 고유 접두어를 붙이고 **자기 접두어 캐시만 지운다** (`k.startsWith(PREFIX) && k !== CACHE`). 남의 캐시를 지우면 다른 앱의 오프라인이 깨진다.
- 예외: 엽쌤스쿨 홈페이지(`ysschool`, Next.js, ysschool.vercel.app)와 한려초 수영부(`hallyo`, Next.js, hallyo.vercel.app, 로그인 필요)는 Vercel.
- 전체 앱 목록·클론 폴더·빌드 방법은 `apps.json`. 새 앱을 등록하면 여기에도 한 줄 추가한다.
- 공통 도우미: `assets/ys-install.js`(📲 설치 버튼 `[data-ys-install]`, 기기별 설치 안내 창), `assets/ys-qr.js`(`[data-qr]` → 큰 QR 창, 같은 폴더의 `qr.svg` 사용, `<html data-qr-url data-qr-name>`로 주소·이름 지정).

## 작업별 안내 — 해당 파일을 읽고 따른다

| 요청 | 읽을 파일 |
|---|---|
| 새 앱을 모음집에 넣기, "다른 앱처럼 맞춰줘" | `references/onboard-app.md` |
| 전체 앱 설치·QR 상단 배치 점검 / 맨 윗줄로 올리기 | `references/top-buttons-check.md` (+ 고칠 때 `references/layout-fixes.md`) |
| 전체 앱 자동 배포 점검 / 자동 배포로 바꾸기 | `references/deploy-check.md` |
| 새로 연결된 앱 찾기, 앱 이름이 바뀌었을 때, 모음집 공유 정보 갱신 | `references/app-changes.md` |
| 커밋·PR·병합·배포 확인 (모든 작업 공통 마무리) | `references/git-workflow.md` |

도구 준비(한 번): `source scripts/setup-tools.sh` — QR 생성, 커버 글꼴, 로컬 Tailwind를 `/tmp/ys-tools`에 받고 `NODE_PATH`·`YS_CHROMIUM`을 잡는다. Playwright·Chromium은 환경에 미리 깔린 것을 쓴다(`playwright install` 금지).

## 이 환경에서 자주 막히는 것 (미리 알면 시간 절약)

- **공개 사이트(github.io, vercel.app)는 이 컨테이너에서 열리지 않는다.** 그래서 각 저장소의 최신 main 코드를 실제 배포 경로와 같은 모양(`http://localhost:8810/<저장소>/`)으로 띄워서 확인한다(`scripts/prepare-local.sh`). 보고할 때 "공개 사이트는 직접 열 수 없어 최신 코드를 같은 경로로 띄워 확인했다"고 밝힌다.
- 한글 마감실(Hwp)은 `engine-strict`로 Node 24를 요구하지만 이 환경은 Node 22다 → `npm ci --engine-strict=false`로 설치(apps.json 빌드 명령에 반영됨). 빌드·테스트는 Node 22에서도 통과한다.
- `gh`는 내장 클라이언트라 `gh api ...`만 된다(`gh pr create` 등 불가). Pages 설정 API(`/pages`)는 막혀 있으니 실행 기록으로 판단한다.
- 저장소가 세션에 없으면 `add_repo`(수정이 필요하면 `access: "push"`)로 붙이고 안내대로 `/home/user/<repo>`에 클론한다. 땀방울 원정대(physical-pi), 담임노트(nicehelperys)는 접근 권한이 없었다 → 시도는 하되 안 되면 "접근 불가로 제외"라고 보고.
- `pkill -f <패턴>`은 내 셸 명령줄까지 잡아 셸이 죽는다(exit 144). `pgrep -f "[h]ttp.server 8810"`처럼 첫 글자를 대괄호로 감싸서 찾고 `kill` 한다.
- 컨테이너가 새로 시작되면 클론이 사라져 있다(`ls /home/user`). 필요한 저장소만 `add_repo` 후 클론한다. 이때 `gh`가 내장 클라이언트가 아닌 진짜 GitHub CLI일 수도 있다 — 어느 쪽이든 `gh api ...`는 그대로 된다.
- 다른 작업이 같은 저장소를 동시에 고치는 일이 잦다. 올리기 직전에 `git fetch origin main && git rebase origin/main`. 예전 작업 브랜치를 덮어쓸 때는 `compare/main...<원격sha>`의 ahead가 0이거나, 그 커밋의 PR이 `merged_at`이 있는지(squash 병합) 확인한 뒤 `--force-with-lease`.
- 저장소 자체 점검 스크립트가 Windows 경로(Edge·Chrome)를 박아 둔 경우가 많다 → `CHROME_PATH`/`EDGE_PATH`/`CHROMIUM_PATH`=/opt/pw-browsers/chromium 환경변수로 돌리거나, 고치지 않는 임시 사본(`_tmp*`)으로 돌리고 지운다. 실패하면 **반드시 수정 전 코드(git stash)로 같은 점검을 돌려** 원래부터 실패하는지 확인하고, 그렇다고 보고한다.
- Pages 배포가 GitHub 서버 오류(500)로만 실패하면(점검·빌드는 성공) 실패한 작업만 한 번 다시 돌린다.
- 외부 참고 링크 확인: 이 컨테이너에서 막힌 사이트가 있다(예: gardens.si.edu는 첫 화면도 403). 막히면 깨졌다고 단정하지 말고, 같은 내용을 담은 열리는 공식 출처를 웹 검색으로 찾아 `curl`로 200·제목을 확인한 뒤 바꾼다.
- 테스트·스크린샷 결과물이 저장소 안에 생기면 커밋 전에 지운다(`git status`로 꼭 확인). 실수로 스크린샷이 커밋돼 다시 지운 적이 있다.

## 보고 형식

마지막 답은 표로 짧게: 앱 이름 | 휴대폰 화면에서 어디에 보이는지 | PR 링크(`[repo#번호](https://github.com/gmlduqzhd123-lab/<repo>/pull/<번호>)`). 그 아래 "확인한 것", "못 한 것(이유)"을 한두 줄씩. 커밋 메시지·PR 본문에 모델 이름은 넣지 않는다.
