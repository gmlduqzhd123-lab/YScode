# 전체 앱 자동 배포 점검

"main에 올리면(PR 병합 포함) 사람 손 없이 공개 사이트에 반영되는가"를 저장소별로 확인한다.

```bash
bash scripts/deploy-check.sh
```

결과 읽는 법(각 저장소 main 최신 커밋 기준):

| 보이는 것 | 뜻 |
|---|---|
| `pages build and deployment[dynamic]=completed/success` | GitHub Pages가 main 브랜치를 바로 배포 → 자동 ✅ |
| `<워크플로 이름>[push]=completed/success` | 커스텀 워크플로가 push로 자동 실행 ✅ (한글 마감실·AcaScore AI·Math Survival·웜즈·지도안 대백과 — 이 중 일부는 배포 전에 테스트를 돌려 실패하면 배포가 멈춘다) |
| `[push]=in_progress` | 방금 올라온 코드가 배포 중 ⏳ |
| `[workflow_dispatch]` 만 있거나 실행 기록 없음 | 수동 배포 ❌ → 고칠 대상 |
| `vercel-prod: <sha>` 가 main 과 같음 | Vercel 자동 배포 반영 ✅ (엽쌤스쿨·수영부) |
| `runs: -` 인데 최신 커밋 메시지에 `[skip ci]` | 검수 기록만 올린 커밋이라 일부러 배포를 건너뜀 → 바로 앞 커밋의 배포가 성공했으면 정상 ✅ (`gh api repos/<o>/<r>/commits/main --jq .commit.message`로 확인) |
| Vercel 앱에 `Quality Check[push]=failure` 같은 검사 실패 | 배포(Vercel)와 별개인 검사다. 운영 반영은 vercel-prod 로 판단하고, 검사 실패는 따로 알려 준다 |

수동 배포 저장소 고치기(웜즈 때 한 방법):
```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```
워크플로가 `_site`로 파일을 골라 복사하는 방식이면, 새로 넣은 파일(manifest, sw.js, ys-install.js, ys-qr.js, qr.svg, og-image.jpg, icons/)도 복사 목록에 있는지 확인한다. 배포 안내 문서(DEPLOYMENT.md 등)에 "수동 실행"이라고 쓰여 있으면 같이 고친다. 병합 후 push 이벤트로 실행돼 성공하는지까지 확인하고 보고한다.

배포 실패 시: 실패한 단계 이름은 `gh api repos/<owner>/<repo>/actions/runs/<id>/jobs`로 보이지만 로그 본문은 이 환경에서 받을 수 없다(외부 저장소로 리다이렉트). 같은 검사 명령을 로컬에서 돌려 재현하고, 재현이 안 되면 실패한 작업을 한 번만 다시 실행(`POST .../runs/<id>/rerun-failed-jobs`)한다. 두 번째도 실패하면 진짜 문제로 보고 원인을 찾는다.
