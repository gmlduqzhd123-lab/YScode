#!/usr/bin/env bash
# 스킬 도구 준비: QR 생성(qrcode), 커버 글꼴(Pretendard), 로컬 Tailwind(For-Teacher 측정용)를 /tmp/ys-tools 에 설치한다.
# Playwright·Chromium 은 클라우드 환경에 미리 깔려 있는 것을 쓴다(/opt/node22/lib/node_modules, /opt/pw-browsers/chromium).
# 사용: source scripts/setup-tools.sh   (NODE_PATH, YS_TOOLS, YS_CHROMIUM 이 설정된다)
set -e
export YS_TOOLS=/tmp/ys-tools
mkdir -p "$YS_TOOLS"
if [ ! -d "$YS_TOOLS/node_modules/qrcode" ]; then
  (cd "$YS_TOOLS" && npm init -y >/dev/null 2>&1 && npm i --no-audit --no-fund qrcode@1.5.4 pretendard@1.3.9 @tailwindcss/browser@4.3.3 >/dev/null 2>&1)
fi
export NODE_PATH="$YS_TOOLS/node_modules:/opt/node22/lib/node_modules"
export YS_CHROMIUM=/opt/pw-browsers/chromium
[ -x "$YS_CHROMIUM" ] || YS_CHROMIUM=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | head -1)
export YS_FONT="$YS_TOOLS/node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2"
export YS_TAILWIND="$YS_TOOLS/node_modules/@tailwindcss/browser/dist/index.global.js"
echo "tools ready: NODE_PATH=$NODE_PATH chromium=$YS_CHROMIUM"
