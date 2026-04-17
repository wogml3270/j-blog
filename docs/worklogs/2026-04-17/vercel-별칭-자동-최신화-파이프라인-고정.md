# Vercel 별칭 자동 최신화 파이프라인 고정

## 문제
- `main` 배포가 성공해도 `j-fe-blog.vercel.app`이 최신 배포를 가리키지 않음
- 결과적으로 일부 URL은 최신 코드, `j-fe-blog`는 구버전/오래된 배포를 보여주는 현상 발생

## 원인
- `j-fe-blog.vercel.app`이 프로젝트 고정 도메인으로 붙은 상태가 아니라 배포 단위 alias로 연결되어 있었음
- 배포가 새로 생길 때 alias가 자동 이동되지 않아 URL 불일치가 발생함

## 즉시 복구
- 최신 배포로 alias 재지정
- 확인 결과:
  - `j-fe-blog.vercel.app`
  - `j-blog-wogml3270s-projects.vercel.app`
  - `j-blog-git-main-wogml3270s-projects.vercel.app`
  모두 동일 최신 배포를 가리키도록 복구됨

## 영구 대응
1. alias 동기화 스크립트 추가
- 파일: `scripts/vercel-sync-production-alias.mjs`
- 동작:
  - Vercel API로 production READY 배포 탐색
  - `GITHUB_SHA` 기준 배포를 우선 찾고, 없으면 최신 READY 배포 사용
  - `j-fe-blog.vercel.app` alias를 해당 배포로 자동 재할당

2. GitHub Actions 자동 동기화 추가
- 파일: `.github/workflows/vercel-alias-sync.yml`
- 트리거: `push` on `main`
- 수행: 스크립트 실행으로 alias 자동 재고정

3. 수동 복구 스크립트 추가
- `package.json`
  - `vercel:sync-alias`: `node scripts/vercel-sync-production-alias.mjs`

## 필요한 GitHub Secrets
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID`

## 검증
- `npx vercel alias ls`에서 `j-fe-blog.vercel.app`이 최신 배포 source로 연결된 것을 확인
