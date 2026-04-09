# 작업 일지 (2026-04-08)

## 요약

- 관리자 `blog/projects/contact` 탭에 페이지네이션(기본 10개)과 `id` 쿼리스트링 동기화를 적용했습니다.
- 공개 사이트 로그인 모달을 전역 오버레이(전체 블러) 방식으로 보강하고, 문의 모달 상태를 Zustand로 이관했습니다.
- 타입 구조를 `types/` 도메인 파일로 분리하고, 주요 컴포넌트/API의 인라인 타입을 정리했습니다.
- `detailLabel`을 공개 UI/로케일에서 완전 제거했습니다.
- `supabase/schema-v1.0.5.sql` 증분 마이그레이션 파일을 추가했습니다.

## 주요 변경

- 상태관리
  - `stores/public-ui.ts`: 공개 로그인/문의 모달 상태
  - `stores/admin-detail.ts`: 관리자 상세 패널 선택 id 상태
- 관리자 목록/API
  - `/api/admin/posts|projects|contact` GET 응답을 페이지네이션 객체로 표준화
  - 각 관리자 매니저에서 URL `?page=&pageSize=&id=` 동기화
  - 페이지 이동 시 상세 id 제거, 상세 열기 시 id 부여, 닫기 시 id 제거
- 타입 분리
  - `types/blog.ts`, `types/projects.ts`, `types/contact.ts`, `types/profile.ts`, `types/db.ts`, `types/admin.ts`, `types/ui.ts`
  - `types/content.ts`는 호환용 re-export barrel로 유지
- 공개 UI
  - 헤더 로그인 모달을 body portal 기반 전역 오버레이로 변경
  - `components/contact/fab.tsx` 모달 open/close를 Zustand로 이관
  - 프로젝트 `detailLabel` 텍스트/키 제거
- 관리자 사이드바
  - 설정 버튼용 SVG 아이콘 컴포넌트 추가 (`components/admin/common/icons/settings-gear-icon.tsx`)

## DB 마이그레이션

- `supabase/schema-v1.0.5.sql`
  - 인덱스 추가
    - `idx_posts_updated_at_desc`
    - `idx_projects_updated_at_desc`
    - `idx_contact_messages_created_at_desc`
  - 더미 데이터 삽입
    - `posts` 10건
    - `projects` 10건
    - `contact_messages` 10건
  - `schema_migrations`에 `v1.0.5` 기록

## 검증 결과

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과
