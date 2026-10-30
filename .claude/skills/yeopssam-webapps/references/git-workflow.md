# 커밋 · PR · 병합 · 배포 확인 (모든 작업 공통)

엽쌤은 "고쳐줘/넣어줘"라고 하면 **배포까지 끝난 상태**를 기대한다. 지금까지는 PR을 만들어 바로 squash 병합하고 배포 완료를 확인한 뒤 보고했다.

1. **브랜치**: 세션이 지정한 작업 브랜치(예: `claude/zen-shannon-ua3fcw`)를 쓴다. 이전 작업이 이미 병합됐으면 최신 main에서 다시 시작:
   `git fetch origin main && git checkout -B <브랜치> origin/main` (작업 중 변경은 그대로 따라온다. 충돌하면 `git stash` → checkout → `git stash pop`).
2. **검사**: 저장소의 테스트·타입검사·빌드를 돌린다. 테스트가 남긴 파일(fixtures, 스크린샷, docs/verification 등)은 `git checkout --` 로 되돌리고 `git status`로 내 변경만 남았는지 확인.
3. **커밋**: 한국어 제목 + 무엇을 왜 바꿨는지 2~3줄. 끝에 세션이 지정한 Co-Authored-By / Claude-Session 줄. 모델 이름 금지.
4. **푸시**: 원격 브랜치가 남아 있으면 그것이 이미 병합된 내용인지 확인한 뒤(트리가 main 최근 커밋과 같거나 main에 포함) `git push --force-with-lease=<브랜치>:<원격 sha> origin HEAD:<브랜치>`. 처음이면 `git push -u origin <브랜치>`. 얕은 클론이면 추적 설정:
   `git config --add remote.origin.fetch "+refs/heads/<브랜치>:refs/remotes/origin/<브랜치>"; git fetch origin; git branch -u origin/<브랜치>` (안 하면 "unpushed commit" 경고가 뜬다).
5. **PR 생성·병합**: `gh api -X POST repos/gmlduqzhd123-lab/<repo>/pulls --input pr.json` (제목, 본문=변경 내용·확인 + 세션 지정 PR 꼬리말) → CI 검사가 있는 저장소(한글 마감실 "Validate static app" 등)는 통과를 기다린 뒤 →
   `gh api -X PUT repos/.../pulls/<번호>/merge -f merge_method=squash -f sha=<head sha> -f commit_title="<제목> (#번호)"`.
   "Pull Request has merge conflicts"가 나면 보통 이전 squash 병합 때문이다 → 최신 main에서 브랜치를 다시 만들고 내 커밋만 cherry-pick 후 다시 푸시.
6. **배포 확인**: `gh api "repos/<owner>/<repo>/deployments?per_page=5"`에서 병합 커밋 sha의 배포를 찾아 `.../deployments/<id>/statuses`가 `success`인지. 기다릴 때는 Monitor의 until-루프로(그냥 sleep 금지). Vercel 앱은 environment `Production`.
7. **보고**: 앱별로 어디에 무엇이 보이게 됐는지, PR 링크, 확인한 것·못 한 것.

## 원격 브랜치가 이미 있을 때 / 멈춤 훅 경고
- 같은 이름 원격 브랜치에 예전(이미 squash 병합된) 커밋이 있으면 `--force-with-lease`가 "stale info"로 거절된다.
  `gh api repos/<o>/<r>/branches/claude/zen-shannon-ua3fcw`로 sha를 받아 그 커밋의 PR `merged_at`을 확인한 뒤
  `git push --force-with-lease=claude/zen-shannon-ua3fcw:<sha>`. **PR은 반드시 push 성공 후에 만든다** (먼저 만들면 예전 커밋으로 PR이 생김).
- 멈춤 훅이 "no remote branch / unpushed"라고 하면 대개 추적 설정만 빠진 것:
  `git config --add remote.origin.fetch "+refs/heads/claude/zen-shannon-ua3fcw:refs/remotes/origin/claude/zen-shannon-ua3fcw"; git fetch origin; git branch -u origin/claude/zen-shannon-ua3fcw`
- 이전 작업 커밋이 HEAD가 아닌 곳(detached)에 남아 있을 수 있다 → `git log --all --grep` 으로 찾아 `checkout -B`.
