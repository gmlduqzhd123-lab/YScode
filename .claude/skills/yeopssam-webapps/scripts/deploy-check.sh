#!/usr/bin/env bash
# 전체 앱 자동 배포 점검: 각 저장소 main 최신 커밋에 대해 배포가 "사람 손 없이" 돌았는지 확인한다.
#  - GitHub Pages(브랜치 배포): 'pages build and deployment' [dynamic] 실행이 있으면 자동
#  - 커스텀 워크플로: push 이벤트로 실행됐으면 자동 (workflow_dispatch 만 있으면 수동 → on.push 추가 필요)
#  - Vercel(엽쌤스쿨·수영부): Production 배포 sha == main sha 이면 반영됨
# gh 는 이 환경의 내장 GitHub 클라이언트(gh api 만 가능). Pages 설정 API(/pages)는 프록시가 막으므로 실행 기록으로 판단한다.
OWNER=gmlduqzhd123-lab
REG="$(cd "$(dirname "$0")/.." && pwd)/apps.json"
for n in $(python3 -c "import json;print(' '.join(sorted({a['repo'] for a in json.load(open('$REG'))['apps']})))"); do
  main=$(gh api repos/$OWNER/$n/commits/main --jq .sha 2>/dev/null) || { echo "$n | 접근 불가"; continue; }
  runs=$(gh api "repos/$OWNER/$n/actions/runs?head_sha=$main" --jq '[.workflow_runs[]|"\(.name)[\(.event)]=\(.status)/\(.conclusion)"]|join("; ")')
  prod=$(gh api "repos/$OWNER/$n/deployments?per_page=6" --jq '[.[]|select(.environment=="Production")][0].sha // ""' | cut -c1-7)
  echo "$n | main=${main:0:7} | runs: ${runs:--} | vercel-prod: ${prod:--}"
done
