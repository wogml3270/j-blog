# 작업일지 - 2026-04-07 (문의 FAB 개선 + 관리자 대시보드 정리)

## 1) 문의 FAB 아이콘화

- 문의 버튼을 텍스트형에서 SVG 아이콘형 원형 FAB로 변경.
- 접근성 보완:
  - `aria-label` 유지
  - `sr-only` 텍스트(`fabLabel`) 추가

## 2) 문의 전송 성공 시 자동 닫힘

- 문의 폼 제출 성공(`201`) 시:
  - 폼 값 초기화
  - 성공 메시지 설정
  - 모달 자동 닫힘(`setOpen(false)`) 처리

## 3) 문의 이메일 알림 경로 정리

- `/api/contact`에서 문의 DB 저장 후 이메일 알림 시도 로직 유지.
- 수신 이메일 결정 우선순위:
  - `SITE_CONTACT_TO_EMAIL`
  - 없으면 `SITE_CONFIG.email` fallback
- 메일 전송 실패는 문의 저장 실패로 간주하지 않도록 분리 처리 유지.

## 4) 관리자 첫 화면/로고 이동 정리

- `/admin` 경로를 관리자 대시보드로 확정.
- 대시보드에 콘텐츠 현황 카드(블로그/프로젝트/문의/new/About 상태)와 퀵링크 추가.
- 관리자 사이드바 로고 클릭 시 `/admin`으로 이동하도록 수정.

## 5) 정크 라우트 정리

- 불필요한 레거시 페이지 삭제:
  - `app/admin/(protected)/posts/page.tsx`
  - `app/admin/(protected)/profile/page.tsx`
  - `app/admin/(protected)/project/page.tsx`

## 6) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
  - 삭제된 admin 라우트로 인해 남아 있던 `.next/dev/types` 잔여 파일 정리 후 정상화
