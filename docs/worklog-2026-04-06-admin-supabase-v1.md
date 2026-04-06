# 작업일지 - 2026-04-06 (Admin CMS + Supabase v1)

## 1) 라우팅/접근 제어
- 관리자 경로를 locale 비적용 단일 경로로 추가했습니다.
  - `/admin/login`
  - `/admin`
  - `/admin/posts`
  - `/admin/projects`
  - `/admin/profile`
- OAuth 콜백 경로 `/auth/callback`을 추가했습니다.
- `proxy.ts`를 업데이트해 locale 리다이렉트 예외에 `/admin`, `/auth`, `/api`를 포함했습니다.
- Supabase 세션 갱신 로직을 proxy 단계에 통합했습니다.

## 2) Supabase 연동/권한 모델
- `@supabase/supabase-js`, `@supabase/ssr` 의존성을 추가했습니다.
- Supabase 클라이언트 계층을 분리했습니다.
  - 브라우저 클라이언트
  - 서버 클라이언트
  - 서비스 롤 클라이언트
  - proxy 세션 갱신 유틸
- 관리자 권한 판별 로직을 구현했습니다.
  - 소셜 로그인 사용자 이메일 검증 체크
  - `ADMIN_ALLOWED_EMAILS` + `admin_allowlist` 테이블 allowlist 체크

## 3) 데이터 계층 전환
- 공개 데이터 읽기를 Supabase 우선 구조로 변경했습니다.
  - 블로그: `lib/blog/repository.ts`
  - 프로젝트: `lib/projects/repository.ts`
  - 프로필: `lib/profile/repository.ts`
- Supabase 미설정/실패 시 기존 로컬 데이터(MDX/seed)로 fallback하도록 구성했습니다.
- 블로그 본문은 Markdown 렌더러와 TOC 추출 유틸을 추가해 DB 본문 렌더링을 지원했습니다.

## 4) 관리자 UI/API
- 관리자 로그인/대시보드/콘텐츠 관리 UI를 추가했습니다.
  - 게시글 CRUD + draft/published + 태그/본문 편집 + Markdown 미리보기
  - 프로젝트 CRUD + featured/status 편집
  - 프로필 편집
- 내부 API 엔드포인트를 추가했습니다.
  - `GET/POST /api/admin/posts`
  - `PUT/DELETE /api/admin/posts/[id]`
  - `GET/POST /api/admin/projects`
  - `PUT/DELETE /api/admin/projects/[id]`
  - `GET/PUT /api/admin/profile`
- 변경 후 공개 페이지 반영을 위해 `revalidatePath` 헬퍼를 추가했습니다.

## 5) 확장 준비 (댓글/문의)
- Phase 2용 엔드포인트를 선반영했습니다.
  - `POST /api/comments` (로그인 사용자, pending 저장)
  - `POST /api/contact` (DB 저장 + Resend 옵션 발송)

## 6) DB/운영 문서화
- Supabase 초기 스키마 및 RLS 정책 SQL을 추가했습니다.
  - `supabase/schema.sql`
- 초기 데이터 이관 스크립트를 추가했습니다.
  - `scripts/seed-supabase.mjs`
  - `npm run seed:supabase`
- 환경변수 예시를 추가했습니다.
  - `.env.example`
- README를 Admin + Supabase 세팅 기준으로 갱신했습니다.

## 7) SEO/크롤링
- `robots`에 `/admin`, `/api/admin` disallow 규칙을 추가했습니다.
- sitemap 데이터 소스를 Supabase 우선 읽기 구조로 변경했습니다.

## 8) 검증
- `npm run lint`: 통과
- `npx tsc --noEmit`: 통과
- `npm run build`: 샌드박스 제약(Turbopack 포트 바인딩 권한 오류)으로 실패
