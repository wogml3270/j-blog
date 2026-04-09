# 작업일지 - 2026-04-07 (Admin IA 5탭 + Contact FAB + Home/About 분리)

## 1) 관리자 IA 재정렬 (공개 메뉴 기준)

- 관리자 정식 탭을 다음 5개로 정리:
  - `/admin/home`
  - `/admin/about`
  - `/admin/projects`
  - `/admin/blog`
  - `/admin/contact`
- 현재 동작:
  - `/admin`은 별도 리다이렉트 없이 관리자 대시보드 페이지를 직접 렌더링.
  - `/admin/posts`, `/admin/profile`, `/admin/project`는 라우트 파일 자체를 제거해 정크 리다이렉트 경로를 없앰.
- 사이드바 메뉴도 5탭 기준으로 교체.

## 2) Home/About 편집 범위 분리

- `profile_content` 싱글톤을 기준으로 편집 범위를 분리:
  - Home 탭: `name`, `title`, `summary`, `tech_stack`
  - About 탭: `about_experience`, `strengths`, `work_style`, `status`
- 신규 API:
  - `GET/PUT /api/admin/home`
  - `GET/PUT /api/admin/about`
- 기존 `GET/PUT /api/admin/profile`는 호환용으로 유지(내부적으로 home/about 업데이트 연계).

## 3) Home 기술스택 DB 연동

- `profile_content.tech_stack` 컬럼을 통해 홈 기술스택을 DB에서 조회/편집하도록 전환.
- 공개 홈 페이지에서 상수 `TECH_STACK` 대신 `profile.techStack` 사용.
- 시드 스크립트 profile seed에도 `tech_stack` 반영.

## 4) Contact 기능 완성

- 공개 사이트 전역 우하단 고정 버튼(FAB) + 문의 모달 UI 추가.
- 문의 제출은 기존 `/api/contact`를 사용.
- 관리자 문의함 추가:
  - 페이지: `/admin/contact`
  - API: `GET /api/admin/contact`, `PUT /api/admin/contact/[id]`
  - 기능: 목록/상세 + 상태(`new`, `read`, `replied`) 변경.

## 5) i18n 및 스키마

- 문의 FAB/폼 문구를 locale JSON으로 분리:
  - `locales/ko/contact.json`
  - `locales/en/contact.json`
  - `locales/ja/contact.json`
- `lib/i18n/dictionary.ts`에 `contact` 딕셔너리 추가.
- `supabase/schema-v1.0.0.sql`에 `profile_content.tech_stack` 생성/보정 SQL 반영.

## 6) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 실패 (현 환경 DNS 제한으로 Google Fonts fetch 실패)

## 7) 후속 정리

- `/admin`를 실제 대시보드 페이지로 전환(통계/퀵링크 제공).
- 관리자 로고 클릭 시 `/admin` 대시보드로 이동하도록 수정.
- `app/admin/(protected)/posts/page.tsx` 삭제.
- 동일 성격의 리다이렉트 정크 파일인 `project/page.tsx`, `profile/page.tsx`도 삭제.
- 문의 FAB를 텍스트 버튼에서 SVG 아이콘 버튼으로 변경.
- 문의 전송 성공 시 모달 폼 자동 닫힘 적용.
