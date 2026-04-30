# 블로그/프로젝트 검색·정렬 UX 개편 (v2.2.x)

## 작업 목적
- 관리자/공개 페이지에서 블로그·프로젝트 목록의 검색/정렬 UX를 통일하고, URL 쿼리 기반으로 상태를 재현 가능하게 개선한다.

## 주요 변경 사항
- 관리자 블로그/프로젝트
  - 기존 필터(`전체/메인노출/일반/공개/비공개`) 제거.
  - 검색(`q`) + 정렬(`sort=name|created|updated`) 추가.
  - 정렬 기본값을 `updated`로 유지.
  - 리스트 행 메타를 `생성일`/`수정일` 2줄 표기로 통일.
  - 공개/비공개 섹션별 페이지네이션은 유지하고, 검색/정렬은 두 섹션에 동일 적용.
  - EN/JA 탭에 `한국어 태그 불러오기` 체크박스 추가(체크 시 KO 태그 1회 복사 후 독립 편집).

- 관리자 상태 저장 (Zustand)
  - `stores/admin-list-ui`에 `searchQueryByScope`, `sortByScope` 추가.
  - URL이 소스 오브 트루스, zustand는 재진입 복원용 캐시로 사용.

- 관리자 API/저장소
  - `GET /api/admin/posts`, `GET /api/admin/projects`가 `q`, `sort`, `statusScope`를 처리하도록 확장.
  - 저장소 검색 범위는 KO+EN+JA의 제목/내용/태그를 포함.
  - 저장소 정렬은 `name|created|updated` 지원.

- 공개 블로그/프로젝트
  - URL 규칙 확장:
    - `/blog?q=...&sort=name|date&page=n`
    - `/projects?q=...&sort=name|date&page=n`
  - 공통 `ContentSearchToolbar`에 정렬 select 확장.
  - 검색/정렬 변경 시 `page`는 자동으로 1로 리셋.
  - 정렬 규칙:
    - `name`: 제목 오름차순
    - `date`: 최신순

- i18n
  - 블로그/프로젝트 로케일 JSON(ko/en/ja)에 정렬 라벨 키 추가:
    - `sortLabel`, `sortDate`, `sortName`

## 타입/유틸 변경
- `types/admin.ts`
  - `AdminListSort = "name" | "created" | "updated"` 사용.
- `types/blog.ts`
  - `AdminPost.createdAt` 필드 반영.
- `lib/utils/search-params.ts`
  - `normalizeAdminListSort`, `normalizePublicSort` 사용.

## 검증 결과
- `npx tsc --noEmit`: 통과
- `npm run lint`: 통과
- `npm run build`: 실패
  - 원인: 빌드 시점 Supabase fetch 실패로 `/ko` prerender 중단 (`ProjectServiceUnavailableError`)
  - 코드 타입/린트 오류가 아닌 외부 데이터 연결 상태 이슈로 확인
