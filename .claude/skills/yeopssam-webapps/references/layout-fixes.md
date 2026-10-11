# 휴대폰에서 버튼을 맨 윗줄로 올리는 방법 (검증된 패턴)

원칙: **PC 화면은 바꾸지 않는다.** 휴대폰용 `@media (max-width: 520px)`(또는 앱이 이미 쓰는 기준폭) 안에서만 고친다.

## 1. 첫 줄 = 앱 이름 + 설치·QR, 나머지는 둘째 줄

나머지 버튼(음악, 목록, 배지 등)과 설치·QR이 한 상자에 섞여 있으면, 설치·QR만 따로 묶고(`.key`) 나머지를 다른 묶음(`.more`)으로 나눈다. 휴대폰에서 바깥 상자를 `display: contents`로 풀면 두 묶음이 헤더의 직접 자식이 되어 자리를 따로 잡는다.

```css
@media (max-width: 519px) {
  nav.top { flex-wrap: wrap; gap: 10px 8px; }
  .top-actions { display: contents; }      /* 묶음 상자 풀기 */
  .top-more { width: 100%; justify-content: flex-end; }  /* 둘째 줄 전체 차지 */
}
```

## 2. 줄바꿈 강제: 보이지 않는 줄바꿈 요소

DOM 순서를 못 바꿀 때는 `order`로 순서를 정하고, 가로 100% 짜리 빈 요소로 줄을 끊는다. 요소를 추가하기 어렵다면 `::before`/`::after` 가상 요소도 flex 항목이 된다.

```css
header > div::after { content: ""; order: 1; flex-basis: 100%; height: 0; }
header .badge { order: 2; }          /* 둘째 줄로 */
/* 한글 마감실: .site-header::before{order:3;flex-basis:100%} + 설치 order 1, QR order 2, 메뉴 order 3, 표시 order 4 */
```

## 3. 한 줄에 안 들어갈 때 줄이는 순서

1. 버튼 글자: `📲 <span class="wide">앱 </span>설치` → 휴대폰에서 `.wide{display:none}`, QR은 "📱 QR"
2. 버튼 안쪽 여백(padding 5~7px 9~11px)·글자 12.5~13.5px
3. 앱 이름 글자 크기(15~17px)·로고 크기(32~36px)·간격
4. 부제(작은 영문 글씨 등) 숨기기
목표: **360px에서 맨 윗줄**, 오른쪽 끝 여백 4px 이상. 320px는 둘째 줄이어도 괜찮다(보고만).

## 4. 자주 빠지는 함정

- **내 규칙이 안 먹힘** → 파일 뒤쪽에 같은 선택자 규칙이 또 있으면 그게 이긴다(4시 40분의 용사 `.ix-brand`, 아카펠라 `.app-header h1`). 측정해서 값이 안 바뀌면 `nav.ix-nav`, `header.app-header h1`처럼 선택자를 더 구체적으로.
- **`display:inline-flex` 버튼에서 "📲 앱 설치"의 띄어쓰기가 사라짐** → 글자 조각이 각각 flex 항목이 되며 끝 공백이 잘린다. 버튼을 `inline-block`으로 하거나 글자 전체를 `<span>` 하나로 감싼다. (Pretendard에서 📲 뒤 공백은 원래 좁아 보이니 고배율 스크린샷으로 확인)
- **미리 컴파일된 Tailwind**(아시안게임 `#tailwind-offline`)에는 새 유틸리티 클래스가 없다 → 직접 CSS 클래스를 만든다.
- **메뉴(☰) 버튼이 화면 밖으로 밀림** → 버튼을 추가한 뒤 다른 사람이 헤더에 버튼(검색 등)을 더 넣으면 다시 생긴다. 헤더 가장 오른쪽 요소의 오른쪽 끝이 화면 폭 안인지 꼭 잰다.
- **이미 같은 이름의 클래스가 있음**(요리 앱 `.intro-chip`) → 새 클래스 이름을 쓴다.

## 5. 캐시 버전

정적 앱은 서비스 워커가 옛 파일을 보여 줄 수 있으니, 바꾼 CSS/JS가 CORE 목록에 있거나 캐시 우선 앱이면 캐시 이름 숫자(`agpe-v33`, `acaroom-cache-v77`, `history-quest-v50` …)를 올리고, `?v=` 쿼리를 쓰는 앱은 그것도 올린다. 네트워크 우선 앱(Math Survival)은 안 올려도 된다.
