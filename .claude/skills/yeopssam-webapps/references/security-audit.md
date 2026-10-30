# 전체 앱 보안점검 ("연결된 앱 전체 보안점검해줘")

생각의 갈림길 AI(thinking)는 엽쌤이 허락할 때까지 고치지 않는다 — 찾은 것만 보고.

## 1. 점검 순서
1. **열쇠값 노출**: `grep -rnI "AIza[0-9A-Za-z_-]\{30,\}\|sk-\|service_role"` (node_modules·.next·dist 제외).
   base64 그림 자료는 거짓 경보. 남(제3자)의 열쇠값이 든 자료는 엽쌤에게 알리고, 지우라 하면 그 항목만 삭제.
2. **부품 약점**: Next.js/npm 앱마다 `npm audit --omit=dev`.
   - 고칠 수 있으면 올리고 lint·tsc·test·build 확인 (hallyo 로컬 build는 Supabase env가 없어 원래 실패 → Vercel 미리보기로 확인).
   - 검사 도구가 "큰 부품을 되돌려라(isSemVerMajor)"만 제안하면, package.json `overrides`로 **안쪽 작은 부품만** 같은 계열 안전 버전으로 올린다
     (예: ysschool `"postcss-selector-parser": "^6.1.5"`). 전후 빌드 CSS 해시가 같은지 확인.
3. **링크로 들어오는 자료(XSS)**: `?xxx=`·`#` 공유 링크를 `atob`/`JSON.parse`로 읽는 곳을 찾아, 화면에 넣기 전에 걸러지는지 본다.
   안 걸러지면 `< > & " ' \``를 빼는 정리 함수를 거친다 (예: fire-safety `sanitizeCustomQuiz`). 고치기 전 공격 재현 → 고친 뒤 안 되는 것 확인.
4. **새 창 보호**: `<a target="_blank">`는 여러 줄 JSX가 많아 줄 단위 grep은 거짓 경보가 많다 — 태그 전체를 보는 스크립트로 센다.
   실제로 빠지기 쉬운 곳은 `window.open(url, '_blank')` → `window.open(url, '_blank', 'noopener,noreferrer')` (반환값을 쓰지 않을 때만).
5. **바깥 스크립트 위조 확인**: Tailwind play CDN(`cdn.tailwindcss.com`)은 위조 확인(SRI) 불가 →
   `npx tailwindcss@3.4.17`로 CSS를 미리 만들어 앱 안에 넣고 `<link>`로 교체 (For-Teacher, Fire-Safety 적용).
   설정은 `tailwind.config.cjs`(주석에 다시 만드는 명령), `tailwind.input.css`. 서비스 워커 CORE에 새 CSS 추가, CDN 줄 삭제, 캐시 버전 올림.
   이후 그 앱에 **새 Tailwind 클래스를 넣으면 CSS를 다시 만들어 함께 커밋**.
   전후 화면 캡처(PC·휴대폰·어두운 화면)를 픽셀 비교 — 차이는 움직이는 애니메이션뿐이어야 한다.

## 2. 보고
- 고친 것 / 문제 없던 것 / 남겨 둔 것(위험 낮음·미룬 이유) 세 덩어리, 표 + PR 링크.
- 숫자를 셀 때 거짓 경보가 섞였으면 다음 보고에서 솔직히 바로잡는다.
- 위험 설명은 "누가, 어떻게 이용할 수 있나"와 "실제로 이용될 길이 있나"로 쉽게.
