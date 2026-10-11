#!/usr/bin/env bash
# 전체 앱을 "최신 main 코드" 기준으로 로컬에 띄울 준비를 한다.
#  1) /home/user/<dir> 클론을 origin/main 으로 맞춤(작업 중인 변경이 있으면 건너뛰고 알림)
#  2) build 가 있는 앱은 빌드(dist 등)
#  3) /tmp/ys-serve/<serve> → 클론(또는 dist) 링크를 만들고 8810 포트로 정적 서버 실행
#     → http://localhost:8810/<serve>/ 가 실제 https://gmlduqzhd123-lab.github.io/<serve>/ 와 같은 경로가 된다.
#  4) mode=next(엽쌤스쿨)는 next build 후 3100 포트로 실행
# 사용: bash scripts/prepare-local.sh [--no-build] [--only 앱repo1,앱repo2]
set -u
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REG="$HERE/apps.json"; SERVE=/tmp/ys-serve; mkdir -p "$SERVE"
NOBUILD=0; ONLY=""
while [ $# -gt 0 ]; do case "$1" in --no-build) NOBUILD=1;; --only) ONLY="$2"; shift;; esac; shift; done
python3 - "$REG" "$ONLY" <<'PY' > /tmp/ys-apps.txt
import json,sys
only=set(filter(None,sys.argv[2].split(',')))
seen=set()
for a in json.load(open(sys.argv[1]))['apps']:
    if only and a['repo'] not in only: continue
    key=a['dir']
    if key in seen: continue
    seen.add(key)
    print('|'.join([a['repo'],a['dir'],a.get('serve',''),a.get('root','.'),a.get('build',''),a['mode'],str(a.get('port',''))]))
PY
while IFS='|' read -r repo dir serve root build mode port <&3; do
  d=/home/user/$dir
  if [ ! -d "$d/.git" ]; then
    echo "· $repo: 클론 없음 → 읽기용으로 받음"; GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 "https://github.com/gmlduqzhd123-lab/$repo" "$d" || { echo "  ✗ 클론 실패"; continue; }
  fi
  ( cd "$d"
    git fetch -q origin main 2>/dev/null
    if [ -n "$(git status --porcelain)" ]; then echo "· $repo: 작업 중인 변경이 있어 main 동기화를 건너뜀"; 
    elif ! git diff --quiet HEAD origin/main; then git checkout -q --detach origin/main && echo "· $repo: 최신 main 으로 맞춤"; fi
    if [ "$NOBUILD" = 0 ] && [ -n "$build" ]; then echo "  빌드: $build"; bash -c "$build" >/tmp/ys-build-$dir.log 2>&1 || echo "  ✗ 빌드 실패(/tmp/ys-build-$dir.log)"; fi )
  if [ "$mode" = static ]; then ln -sfn "$d/$( [ "$root" = . ] && echo || echo "$root")" "$SERVE/$serve"; fi
  if [ "$mode" = next ]; then for p in $(pgrep -f "[n]ext start -p $port"); do kill "$p"; done; ( cd "$d" && setsid nohup npx next start -p "$port" </dev/null >/tmp/ys-next-$port.log 2>&1 & ); fi
done 3< /tmp/ys-apps.txt
if ! curl -s -o /dev/null http://localhost:8810/; then (cd "$SERVE" && setsid nohup python3 -m http.server 8810 </dev/null >/dev/null 2>&1 &); sleep 1; fi
echo "ready: http://localhost:8810/<앱경로>/"
