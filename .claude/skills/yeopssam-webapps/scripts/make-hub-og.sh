#!/usr/bin/env bash
# 모음집(YScode) 공유 그림 og-image.jpg 다시 그리기 — 앱 개수(N)는 index.html 카드 수로 자동.
# 사용: source scripts/setup-tools.sh && bash scripts/make-hub-og.sh  → /home/user/YScode/og-image.jpg
# 오른쪽 타일 9개(대표 앱)를 바꾸려면 아래 <div class="t"> 줄을 고친다. 그린 뒤 index.html의 og-image 주소 ?v=날짜 를 올린다.
set -e
mkdir -p /tmp/ys-og && cd /tmp/ys-og && cp "${YS_FONT:-/tmp/ys-tools/node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2}" . && N=$(cd /home/user/YScode && grep -cE "^\s+name: '" index.html) && echo apps=$N && cat > og.html <<EOF
<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(PretendardVariable.woff2)}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;font-family:P,sans-serif;background:#0d0f12;color:#f4f4f2;position:relative}
.bg{position:absolute;inset:0;background:radial-gradient(600px 420px at 0% 0%,rgba(20,184,166,.35),transparent 70%),radial-gradient(520px 420px at 100% 10%,rgba(99,102,241,.35),transparent 70%),radial-gradient(520px 380px at 75% 110%,rgba(219,39,119,.25),transparent 70%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:40px 40px}
.left{position:absolute;left:84px;top:132px}
.pill{display:inline-flex;align-items:center;gap:10px;padding:9px 16px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(255,255,255,.05);font:600 17px ui-monospace,DejaVu Sans Mono,monospace;color:#d9d9d4}
.pill i{width:10px;height:10px;border-radius:50%;background:#22c55e;display:block}
h1{font-size:74px;font-weight:800;letter-spacing:-.04em;line-height:1.12;margin-top:28px}
h1 b{background:linear-gradient(90deg,#5eead4,#a5b4fc 55%,#f0abfc);-webkit-background-clip:text;color:transparent}
.vibe{font:italic 56px "Liberation Serif",serif;margin-top:6px;color:#efeee9}
.sub{font-size:22px;color:#c9c8c2;margin-top:28px}
.url{position:absolute;left:84px;bottom:46px;display:flex;align-items:center;gap:12px;font:15px ui-monospace,DejaVu Sans Mono,monospace;color:#9a9a94}
.url span{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#334155,#1e293b);display:grid;place-items:center;font-size:14px}
.tiles{position:absolute;left:705px;top:70px;display:grid;grid-template-columns:repeat(3,158px);gap:22px 16px;transform:rotate(-6deg) skewY(2deg)}
.t{height:118px;border-radius:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);padding:16px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.t:nth-child(3n+2){transform:translateY(-48px)}
.t em{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;font-style:normal;font-size:26px;background:rgba(255,255,255,.08)}
.t b{font-size:15px;font-weight:600;color:#e7e6e1;white-space:nowrap}
</style></head><body><div class="bg"></div><div class="grid"></div>
<div class="left"><div class="pill"><i></i>Yeop's Vibe Coding Lab · $N apps</div>
<h1>엽쌤의<br><b>바이브 코딩 교실</b></h1><div class="vibe">made with vibe.</div>
<div class="sub">수업과 일상을 바꾸는 작은 웹앱 ${N}가지</div></div>
<div class="url"><span>✦</span>gmlduqzhd123-lab.github.io/YScode</div>
<div class="tiles">
<div class="t"><em style="background:#4c1d95aa">🕹️</em><b>쉬는시간 오락실</b></div>
<div class="t"><em style="background:#14532daa">🏆</em><b>아시안게임 체육</b></div>
<div class="t"><em style="background:#1e3a8aaa">📚</em><b>교직백서 1000</b></div>
<div class="t"><em style="background:#064e3baa">🎤</em><b>우리 함께 아카펠라</b></div>
<div class="t"><em style="background:#7f1d1daa">🔥</em><b>화재 탈출 넘버원</b></div>
<div class="t"><em style="background:#7c2d12aa">🗺️</em><b>전국 맛집 지도</b></div>
<div class="t"><em style="background:#0c4a6eaa">🗝️</em><b>교실 탈출</b></div>
<div class="t"><em style="background:#1e40afaa">📖</em><b>요리 대백과</b></div>
<div class="t"><em style="background:#581c87aa">🔮</em><b>별빛 나침반</b></div>
</div></body></html>
EOF
cat > shot.cjs <<'EOF'
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1200,height:630}});await p.goto('file:///tmp/ys-og/og.html');await p.waitForTimeout(800);await p.screenshot({path:'/tmp/ys-og/og.jpg',type:'jpeg',quality:88});await b.close();})();
EOF
NODE_PATH=/opt/node22/lib/node_modules node shot.cjs && cp og.jpg /home/user/YScode/og-image.jpg && echo "og-image.jpg saved ($N apps)"
