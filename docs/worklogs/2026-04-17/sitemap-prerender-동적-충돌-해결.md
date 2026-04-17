# sitemap prerender 동적 충돌 해결

## 증상
- `/sitemap.xml` prerender 중 `Dynamic server usage` 오류 발생
- 원인 fetch: Supabase REST 요청이 `revalidate: 0`/`no-store`로 실행되어 정적 렌더링과 충돌

## 원인 분석
- `app/sitemap.ts`가 `getAllPublishedProjects`, `getAllPublishedPosts`를 호출
- 해당 저장소 함수 내부는 `createSupabaseServiceClient()`를 사용
- 이 클라이언트는 전역 fetch를 `cache: no-store`, `next.revalidate: 0`으로 고정
- 결과적으로 sitemap 정적 생성 단계에서 동적 사용 에러가 발생

## 조치
- `app/sitemap.ts`에서 저장소 함수 호출 제거
- sitemap 전용 Supabase 클라이언트 추가:
  - `cache: force-cache`
  - `next.revalidate: 3600`
- sitemap 함수는 다음 순서로 동작:
  1. 정적 라우트 생성
  2. 캐시 가능한 DB 조회로 프로젝트/블로그 slug 병합
  3. 조회 실패 시 정적 라우트만 반환(fail-safe)

## 파일
- 수정: `app/sitemap.ts`

## 기대 효과
- `/sitemap.xml` 정적 생성 충돌 제거
- DB 일시 장애 시에도 빌드 실패 없이 기본 sitemap 생성
- 1시간 단위 재검증으로 최신성 확보
