-- Schema Version: v2.1.3
-- Created At: 2026-04-17
-- Purpose:
--   - docs/worklogs + docs/refector 기반 블로그 실데이터 전면 교체
--   - slug: 제목 기반 _ 포맷, tags: 고정 택소노미, EN/JA 완전 번역 반영

begin;

-- 기존 블로그 데이터 전체 교체
delete from public.post_tag_map;
delete from public.posts_en;
delete from public.posts_ja;
delete from public.posts;
delete from public.post_tags;

with seeded_posts as (
  insert into public.posts (
    slug,
    title,
    description,
    thumbnail,
    body_markdown,
    status,
    published_at,
    featured,
    use_markdown_editor,
    sync_slug_with_title
  )
  values
  ('테마_스무딩_KO_EN_JA_i18n', $title$테마 스무딩 + KO/EN/JA i18n$title$, $desc$테마 스무딩 + KO/EN/JA i18n 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 - 2026-04-06 (테마 스무딩 + KO/EN/JA i18n)

## 1) 복구 점검

- 중단된 턴 이후 저장소 상태를 점검했습니다.
- `lib/i18n/config.ts` 무결성을 확인했습니다.
- `npm run lint`를 실행해 정상 통과를 확인했습니다.

## 2) 진행 항목

- 로케일 prefix 라우팅(`/ko`, `/en`, `/ja`)을 구현했습니다.
- 기본값 `light` 기준의 부드러운 테마 전환을 적용했습니다.
- UI/메타데이터/핵심 콘텐츠 번역과 로케일 SEO alternates를 반영했습니다.

## 3) 완료된 변경 사항

- 로케일 기본 모듈 추가:
  - `lib/i18n/config.ts`
  - `lib/i18n/dictionary.ts`
  - `lib/seo/metadata.ts`
- 앱 라우팅을 로케일 prefix 구조로 마이그레이션:
  - `app/[lang]/(site)/*`
  - `app/[lang]/layout.tsx`
  - `app/[lang]/not-found.tsx`
  - `app/page.tsx`에서 기본 로케일 경로로 리다이렉트
  - `proxy.ts`에서 non-prefix 경로를 `/ko/*`로 리다이렉트
- 헤더/푸터/홈/블로그/프로젝트 전반에 로케일 인지 링크 및 라벨을 적용했습니다.
- 헤더 데스크톱/모바일에 언어 스위처(KO/EN/JA)를 추가했습니다.
- 테마 스무딩 동작을 구현했습니다:
  - 기본 테마 `light`
  - 사용자 토글 시에만 부드러운 전환 활성화
  - `data-theme-transition` 기반 전역 CSS 전환 레이어 적용
- 로케일별 타이포 전략을 적용했습니다:
  - KO: Noto Sans KR
  - EN: Plus Jakarta Sans
  - JA: Noto Sans JP
  - 코드: JetBrains Mono
- 로케일 SEO 메타 유틸리티 및 sitemap alternates를 추가했습니다.
- 핵심 프로필/프로젝트 콘텐츠(UI + 메타데이터 + 주요 설명)를 로케일화했습니다.

## 4) 검증

- `npm run lint`: 통과
- `npm run build`: 샌드박스 환경의 기존/정체된 빌드 프로세스와 Turbopack 제약으로 실행 불가$body$, 'published', '2026-04-06T00:00:00Z', false, true, false),
  ('오버레이_애니메이션_로케일_JSON', $title$오버레이 + 애니메이션 + 로케일 JSON$title$, $desc$오버레이 + 애니메이션 + 로케일 JSON 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 - 2026-04-06 (오버레이 + 애니메이션 + 로케일 JSON)

## 1) 모바일 네비게이션 오버레이

- 모바일 메뉴가 열렸을 때 헤더를 포함한 전체 화면이 블러 처리되도록 dim/blur 오버레이의 z-index를 상향했습니다.
- 사이드 패널은 오버레이 위에 유지되도록 더 높은 z-layer로 설정했습니다.

## 2) 재사용 가능한 UI 모션/스켈레톤

- 방향/지연/지속시간/거리 조절이 가능한 공통 슬라이드 인 애니메이션 컴포넌트 `components/ui/slide-in.tsx`를 추가했습니다.
- 기본값을 포함해 커스터마이즈 가능한 공통 스켈레톤 컴포넌트 `components/ui/skeleton.tsx`를 추가했습니다.
  - `width` 기본값: `100%`
  - `height` 기본값: `1rem`
  - `rounded`, `animated` 옵션 제공
- `app/globals.css`에 전역 애니메이션/쉬머 스타일을 추가했습니다.
- 핵심 UI 컴포넌트(섹션 타이틀, 히어로, 블로그 카드, 프로젝트 카드, 리스트 스태거)에 슬라이드 인을 적용했습니다.
- 테마 토글 로딩 상태에 스켈레톤을 적용했습니다.

## 3) i18n 로케일 JSON 구조

- 언어/페이지 단위 JSON 관리를 위해 `/locales` 폴더를 구성했습니다.
  - `locales/{ko,en,ja}/main.json`
  - `locales/{ko,en,ja}/header.json`
  - `locales/{ko,en,ja}/footer.json`
  - `locales/{ko,en,ja}/blog.json`
  - `locales/{ko,en,ja}/about.json`
  - `locales/{ko,en,ja}/projects.json`
  - `locales/{ko,en,ja}/not-found.json`
  - `locales/{ko,en,ja}/theme.json`
- 하드코딩된 TS 딕셔너리 객체를 제거하고, `lib/i18n/dictionary.ts`에서 JSON 조합 방식으로 교체했습니다.

## 4) 검증

- `npm run lint`: 통과
- `npx tsc --noEmit`: 통과$body$, 'published', '2026-04-06T00:00:00Z', false, true, false),
  ('Admin_CMS_Supabase_v1', $title$Admin CMS + Supabase v1$title$, $desc$Admin CMS + Supabase v1 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 - 2026-04-06 (Admin CMS + Supabase v1)

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
  - `supabase/schema-v1.0.0.sql`
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
- `npm run build`: 샌드박스 제약(Turbopack 포트 바인딩 권한 오류)으로 실패$body$, 'published', '2026-04-06T00:00:00Z', false, true, false),
  ('ui_여백_인증_댓글', $title$ui 여백 인증 댓글$title$, $desc$ui 여백 인증 댓글 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 (2026-04-07)

## 목표

- 관리자/공개 화면의 margin, padding 불균형 개선
- About 관리 화면 라벨 구조 개선
- 프로젝트 관리 입력행의 `추가` 버튼 세로 정렬 문제 수정
- 공개 헤더 로그인 모달/블로그 댓글 UI 정리 및 안정화

## 변경 사항

### 1) UI 간격/레이아웃 정리

- `components/layout/container.tsx`
  - 컨테이너 기본 패딩을 `p-4`에서 `px-4 sm:px-6 lg:px-8`로 변경
  - 수직 간격은 각 페이지가 담당하도록 분리
- `app/[lang]/(site)/layout.tsx`
  - 메인 영역 간격을 `py-8 sm:py-10 lg:py-12`로 조정
- `app/admin/(protected)/layout.tsx`
  - 관리자 레이아웃에 `Container` 적용 및 `py-4~6`, `gap-4~5` 정리
- `components/admin/sidebar.tsx`
  - 사이드바 내부 패딩/간격, 네비 버튼 높이(`xl:py-2.5`) 통일

### 2) About 관리 UX 개선

- `components/admin/about-manager.tsx`
  - 편집 필드를 섹션 단위로 재구성
    - `About`
    - `핵심 역량`
    - `작업 방식`
    - `공개 상태`
  - 섹션별 설명 텍스트 추가
  - 섹션 패딩/라운드/간격을 통일

### 3) Projects 관리 입력행 정렬 개선

- `components/admin/projects-manager.tsx`
  - `기술 스택/성과/기여` 입력행을 `items-center` + `Input flex-1` + `Button shrink-0`으로 정렬
  - `관련 링크` 입력 그리드에 `minmax(0, ...)` 적용하여 버튼 줄바꿈/세로 배열 이슈 완화
  - 관련 섹션 패딩을 `p-3.5`로 통일

### 4) 공개 로그인/댓글 UI 정리

- `components/layout/header.tsx`
  - 모바일 네비 레이어 z-index를 유효 클래스(`z-[60]`)로 수정
- `components/contact/fab.tsx`
  - 모달 z-index를 유효 클래스(`z-[60]`)로 수정
  - FAB/모달 우하단 여백을 반응형으로 미세 조정
- `components/blog/comments-section.tsx`
  - 댓글 입력/카드 UI를 컴팩트하게 축소 (avatar, padding, textarea 높이)
  - 헤더 로그인 유도 문구 유지
  - 사용하지 않는 `nextPath` prop 제거
- `app/[lang]/(site)/blog/[slug]/page.tsx`
  - `CommentsSection` 호출부에서 `nextPath` 전달 제거

### 5) About 공개 페이지 간격 보정

- `app/[lang]/(site)/about/page.tsx`
  - 섹션 간격 `space-y-8`로 조정
  - 카드 패딩을 `p-5 sm:p-6`으로 통일
  - 목록 아이템 간격 미세 조정(`space-y-2.5`)

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 참고

- 빌드 시 Next.js workspace root 경고(복수 lockfile 감지)는 남아 있음.
  - 기능 오류는 아니며, 추후 `outputFileTracingRoot` 설정 또는 상위 lockfile 정리로 해소 가능.$body$, 'published', '2026-04-07T00:00:00Z', false, true, false),
  ('Admin_IA_5탭_Contact_FAB_Home_About_분리', $title$Admin IA 5탭 + Contact FAB + Home/About 분리$title$, $desc$Admin IA 5탭 + Contact FAB + Home/About 분리 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 - 2026-04-07 (Admin IA 5탭 + Contact FAB + Home/About 분리)

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
- 문의 전송 성공 시 모달 폼 자동 닫힘 적용.$body$, 'published', '2026-04-07T00:00:00Z', false, true, false),
  ('Dashboard_canonical_Blog_썸네일_Home_Swiper', $title$Dashboard canonical + Blog 썸네일 + Home Swiper$title$, $desc$Dashboard canonical + Blog 썸네일 + Home Swiper 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 - 2026-04-07 (Dashboard canonical + Blog 썸네일 + Home Swiper)

## 1) 관리자 대시보드 경로/UX 개편

- 신규 canonical 경로: `/admin/dashboard`
- `/admin`은 `/admin/dashboard`로 리다이렉트 처리.
- 사이드바 대시보드 탭/로고 이동 경로를 `/admin/dashboard`로 통일.
- 대시보드 카드와 최근 항목을 링크 중심으로 개편:
  - KPI 카드 전체 클릭 가능
  - 최근 블로그/프로젝트/문의 행 전체 클릭 가능
  - 섹션별 바로가기 링크 추가
- 딥링크 지원:
  - `/admin/blog?id=...`
  - `/admin/projects?id=...`
  - `/admin/contact?id=...`
  - 각 매니저 진입 시 해당 항목 패널 자동 오픈

## 2) 프로젝트 관리 입력 UX 개선

- 기술 스택 입력을 `Enter 추가 + X 삭제` 태그형으로 변경.
- 기간 입력을 `startDate`, `endDate`(date input) 방식으로 변경.
- 데이터 모델 확장:
  - `projects.start_date date`
  - `projects.end_date date`
- `period` 컬럼은 호환 유지:
  - 저장 시 start/end 기반으로 period 동기화 문자열 생성
  - 공개 렌더는 start/end 우선, 없으면 기존 period fallback

## 3) 블로그 썸네일 optional 도입

- 스키마 확장:
  - `posts.thumbnail text` (nullable)
- 타입/리포지토리/API 반영:
  - `AdminPost`, `BlogPostSummary/Detail`에 thumbnail optional
  - 관리자 저장/수정 API에 thumbnail 필드 반영
- 관리자 블로그 편집:
  - 외부 URL 입력
  - 파일 업로드(선택)

## 4) 업로드 경로 공통화

- 공통 업로드 API 추가:
  - `POST /api/admin/media/upload`
  - scope(`posts`/`projects`) 기반 경로 분기
- 기존 프로젝트 업로드 경로는 호환 유지:
  - `POST /api/admin/projects/upload-thumbnail`
  - 내부적으로 공통 업로드 로직 사용

## 5) 카드 전체 링크 정책 적용

- 공개 사이트:
  - `ProjectCard` 카드 전체 링크화
  - `BlogCard` 카드 전체 링크화
- 블로그 카드:
  - 썸네일이 있을 때만 이미지 레이아웃 표시
  - 없으면 텍스트 중심 카드 유지

## 6) Contact 성공 UX 개선

- 문의 전송 성공 시:
  - 모달 내 성공 문구(`✓`)를 1.2초 표시
  - 이후 자동 닫힘
  - 닫힌 뒤 FAB 근처에 짧은 성공 확인 문구 표시

## 7) Home Swiper 적용

- `swiper` 패키지 설치.
- 홈의 대표 프로젝트/최근 블로그 섹션을 Swiper로 전환:
  - 모바일 1장
  - 태블릿 2장
  - 데스크탑 3장
- keyboard/pagination 활성화.

## 8) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 실패 (현 환경 DNS 제한으로 `fonts.googleapis.com` 접근 불가)$body$, 'published', '2026-04-07T00:00:00Z', false, true, false),
  ('관리자_반응형_레이아웃_튜닝', $title$관리자 반응형 레이아웃 튜닝$title$, $desc$1. 레이아웃 전환 브레이크포인트 조정$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 - 2026-04-07 (관리자 반응형 레이아웃 튜닝)

## 변경 배경

- 기존 관리자 화면은 `lg(1024px)`부터 사이드바 레이아웃으로 전환되어 태블릿 폭에서 UI가 다소 과하게 데스크탑형으로 보였음.
- 버튼이 `w-full` 중심이라 모바일에서 버튼 덩어리가 커 보이고 밀도감이 떨어졌음.

## 적용 내용

1. 레이아웃 전환 브레이크포인트 조정

- `app/admin/(protected)/layout.tsx`
- `lg:flex-row` -> `xl:flex-row`로 변경.
- 결과: 1024~1279px 구간은 상단 카드형 관리 네비를 유지하고, 1280px 이상에서만 고정 사이드바 전환.

2. 관리자 사이드바 반응형 재구성

- `components/admin/sidebar.tsx`
- 모바일/태블릿: 네비를 가로 pill 형태(`flex-wrap`)로 표시.
- 데스크탑(xl): 기존처럼 세로 메뉴(`block`)로 표시.
- 상단 정보(로고/토글/계정정보)와 하단 액션(공개 사이트/로그아웃) 배치를 폭에 맞게 유연하게 전환.

3. 로그아웃 버튼 너비 고정 해제

- `components/admin/sign-out-button.tsx`
- `w-full` 강제 제거, `className` 주입형으로 변경.
- 필요 시 부모에서만 전체 너비를 주도록 구조 개선.

## 효과

- 태블릿 구간에서 레이아웃 급변이 줄어들어 시각적 이질감 완화.
- 모바일에서 버튼/네비가 과하게 커 보이지 않고, 더 압축된 관리자 UI 제공.

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과$body$, 'published', '2026-04-07T00:00:00Z', false, true, false),
  ('Admin_인라인_편집_About_KO_DB_Projects_DnD', $title$Admin 인라인 편집 + About KO DB + Projects DnD$title$, $desc$Admin 인라인 편집 + About KO DB + Projects DnD 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 - 2026-04-07 (Admin 인라인 편집 + About KO DB + Projects DnD)

## 1) About 소개 문구 DB 전환 (KO 전용)

- `profile_content.about_intro_description_ko` 컬럼 기준으로 KO 소개 문구를 DB에서 관리하도록 반영.
- 공개 About 페이지는 `ko`에서 DB 문구 우선, 비어 있으면 locale 문구 fallback.
- `en/ja`는 기존 locale JSON 문구를 그대로 유지.
- 관리자 About API(`PUT /api/admin/about`)에 `introDescription` 필드 추가.

## 2) Home/About 편집 UX 인라인 전환

- Home 관리에서 드로어 편집을 제거하고, 페이지 본문에서 즉시 편집/저장하도록 변경.
- About 관리도 동일하게 인라인 편집으로 전환.
- 공통 UX 보강:
  - Dirty state 표시(변경 사항 있음/저장된 상태)
  - 저장 중 버튼 비활성화
  - 성공/실패 메시지 표시

## 3) 상태 라벨/입력 방식 정리

- 관리자 화면 상태 라벨을 `공개 / 비공개`로 통일 (`draft` 내부값은 유지).
- 대시보드 요약/최근 항목의 상태 텍스트도 동일 라벨로 교체.
- Posts/Projects/About 편집 폼 상태 선택을 select에서 라디오 버튼으로 변경.

## 4) Projects 입력 모델 개편 + DnD

- `성과`, `주요 기여`를 줄바꿈 텍스트에서 아이템 입력/삭제/드래그 재정렬 방식으로 전환.
- `관련 링크`를 고정 3종에서 동적 목록(`label + url`) 추가/삭제/드래그 재정렬 방식으로 전환.
- 저장 시 링크는 배열 형태로 정규화해 저장.
- 레거시 링크 객체(`live/repo/detail`)는 API/리포지토리에서 읽기 호환 유지.

## 5) 인터랙션/접근성

- 관리자 편집 패널 및 About 공개 섹션에 강한 모션/호버 인터랙션 적용.
- `prefers-reduced-motion` 환경에서 `.ui-strong-motion` 범위의 transition/animation 시간을 축소.

## 6) 스키마/문서

- 신규 증분 마이그레이션 파일 추가:
  - `supabase/schema-v1.0.2.sql`
  - 내용: `about_intro_description_ko` 추가/백필 + `schema_migrations` 기록
- README의 스키마 적용 순서를 `v1.0.0 -> v1.0.1 -> v1.0.2`로 갱신.$body$, 'published', '2026-04-07T00:00:00Z', false, true, false),
  ('대시보드_재구성_썸네일_업로드_2방식', $title$대시보드 재구성 + 썸네일 업로드 2방식$title$, $desc$대시보드 재구성 + 썸네일 업로드 2방식 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 - 2026-04-07 (대시보드 재구성 + 썸네일 업로드 2방식)

## 1) 관리자 대시보드 재구성

- `Quick Links` 섹션 제거.
- 대시보드 역할을 운영 관점으로 강화:
  - 핵심 지표 카드: 블로그/프로젝트/문의/소개 공개상태
  - 즉시 확인 항목: 신규 문의, 임시저장 블로그/프로젝트, 소개 임시저장 여부
  - 최근 변경 현황: 최근 블로그/프로젝트/문의 3건씩 요약

## 2) 프로젝트 썸네일 입력 2가지 방식 지원

- 관리자 프로젝트 편집 화면에 썸네일 입력 모드 추가:
  - 외부 링크 붙여넣기
  - PC 파일 업로드
- 파일 업로드 API 추가:
  - `POST /api/admin/projects/upload-thumbnail`
  - 관리자 권한 검증 후 Supabase Storage 업로드
  - 업로드 성공 시 공개 URL 반환 후 폼의 `thumbnail` 값에 자동 반영
- 업로드 제한:
  - 이미지 파일만 허용
  - 최대 5MB

## 3) Supabase 설정 보완

- `.env.example`에 썸네일 버킷 변수 추가:
  - `SUPABASE_PROJECT_THUMBNAIL_BUCKET=project-thumbnails`
- `supabase/schema-v1.0.0.sql`에 기본 버킷 생성 SQL 추가:
  - `project-thumbnails` (public)

## 4) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과$body$, 'published', '2026-04-07T00:00:00Z', false, true, false),
  ('댓글_공개_로그인_관리자_UX_정리', $title$댓글 공개 로그인 + 관리자 UX 정리$title$, $desc$댓글 공개 로그인 + 관리자 UX 정리 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 - 2026-04-07 (댓글 공개 로그인 + 관리자 UX 정리)

## 1) 공개 댓글 기능 점검/보강

- 블로그 상세 페이지 하단 댓글 섹션에서 소셜 로그인 상태를 기반으로 댓글 작성 가능하도록 구성.
- 댓글 작성 필수 항목:
  - 이메일(필수)
  - 닉네임(필수)
  - 프로필사진 URL(선택)
- API에서 이메일 형식, 닉네임 길이, 본문 길이, 프로필 URL 형식 검증.
- 로그인 계정 이메일과 입력 이메일 불일치 시 차단.
- Supabase 환경값이 없는 경우 댓글 로그인 UI가 앱을 깨뜨리지 않도록 예외 처리 추가.

## 2) 관리자 화면 UX 구조 정리 확인

- 좌측 사이드바 카테고리 구조:
  - `/admin/blog`
  - `/admin/project`
  - `/admin/profile`
- `/admin`, `/admin/posts`, `/admin/projects`는 각각 새 경로로 리다이렉트.
- 본문 영역은 리스트 중심, 항목 클릭 시 우측 드로어 편집 패턴으로 통일.
- 사이드바에 공개 사이트 이동 링크와 로그아웃 버튼 배치.

## 3) 공개 페이지 미노출 이슈 관련 운영 기준

- 공개 사이트 데이터는 기본적으로 `published` 상태만 노출.
- 운영 혼선을 줄이기 위해 관리자 생성 폼 기본 상태를 `published` 중심으로 사용.

## 4) 스키마/운영 메모

- 댓글 저장 스키마는 작성자 메타(이메일, 닉네임, 프로필 URL) 컬럼을 사용하는 형태로 정리.
- 기존 데이터 호환을 위해 API/리포지토리에서 레거시 컬럼 부재 시 fallback 경로를 둠.

## 5) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과$body$, 'published', '2026-04-07T00:00:00Z', false, true, false),
  ('문의_FAB_개선_관리자_대시보드_정리', $title$문의 FAB 개선 + 관리자 대시보드 정리$title$, $desc$문의 FAB 개선 + 관리자 대시보드 정리 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 - 2026-04-07 (문의 FAB 개선 + 관리자 대시보드 정리)

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
  - 삭제된 admin 라우트로 인해 남아 있던 `.next/dev/types` 잔여 파일 정리 후 정상화$body$, 'published', '2026-04-07T00:00:00Z', false, true, false),
  ('문의_관리자_메모_라디오', $title$문의 관리자 메모 라디오$title$, $desc$문의 관리자 메모 라디오 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 (2026-04-07)

## 목표

- 문의함 관리에 `관리자 메모`를 DB 컬럼으로 추가
- 문의 상세 패널에서 상태 변경 UI를 `select`에서 `radio`로 전환
- 문의 상세 레이아웃을 다른 관리자 화면과 같은 카드형 구조로 정리

## 작업 내용

### 1) DB 마이그레이션 추가

- 파일: `supabase/schema-v1.0.3.sql`
- 변경:
  - `contact_messages.admin_note` 컬럼 추가
  - 기존 데이터 백필(`NULL -> ''`)
  - `not null + default ''` 적용
  - `schema_migrations`에 `v1.0.3` 이력 기록

### 2) 타입/리포지토리 반영

- 파일: `types/content.ts`
  - `ContactMessage` 타입에 `adminNote: string` 추가
- 파일: `lib/contact/repository.ts`
  - `admin_note` select/mapping 추가
  - 업데이트 함수를 상태 전용에서 상태+메모 동시 저장으로 확장

### 3) 관리자 API 확장

- 파일: `app/api/admin/contact/[id]/route.ts`
- 변경:
  - payload에 `adminNote` 파싱/검증(최대 3000자)
  - `status + adminNote`를 함께 저장하도록 업데이트

### 4) 문의함 관리자 UI 개편

- 파일: `components/admin/contact-manager.tsx`
- 변경:
  - 상세 패널 레이아웃을 카드형 섹션으로 재구성
    - 문의자 정보
    - 문의 내용
    - 관리자 메모
    - 상태 라디오 그룹
  - 상태 선택을 `select` -> `radio`로 변경
  - 변경사항 감지(`isDirty`) 후 저장 버튼 활성화
  - 목록에서 메모 존재 시 `메모 있음` 배지 표시

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 적용 안내

- Supabase SQL Editor에서 `supabase/schema-v1.0.3.sql`을 실행해야 실제 DB 컬럼이 생성됩니다.$body$, 'published', '2026-04-07T00:00:00Z', false, true, false),
  ('관리자_페이지네이션_주스탄드_타입_v1_0_5', $title$관리자 페이지네이션 주스탄드 타입 v1.0.5$title$, $desc$관리자 페이지네이션 주스탄드 타입 v1.0.5 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업 일지 (2026-04-08)

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
- `npm run build` 통과$body$, 'published', '2026-04-08T00:00:00Z', false, true, false),
  ('readingTime_제거_Admin_구조_재편_Markdown_에디터', $title$readingTime 제거 + Admin 구조 재편 + Markdown 에디터$title$, $desc$1. readingTime 제거$desc$, '/blog/default-thumbnail.svg', $body$# 작업 일지 - 2026-04-08 (readingTime 제거 + Admin 구조 재편 + Markdown 에디터)

## 적용 목표

- blog의 `readingTime` 의존성을 타입/저장소/API/UI/시드/MDX에서 완전히 제거
- `components/admin`을 기능 폴더 + 공통 폴더 구조로 재배치
- Blog 본문 + Project 요약에 Toast UI 기반 Markdown 에디터 토글 도입

## 주요 변경 사항

1. readingTime 제거

- `types/content.ts`의 blog 관련 타입에서 `readingTime` 제거
- `lib/blog/repository.ts`에서 `reading_time` select/저장/변환 로직 제거
- `/api/admin/posts`, `/api/admin/posts/[id]` payload에서 `readingTime` 제거
- 블로그 카드/상세의 읽기시간 렌더 제거
- `content/blog/*.mdx` metadata에서 `readingTime` 삭제
- `scripts/seed-supabase.mjs` posts upsert에서 `reading_time` 제거
- `supabase/schema-v1.0.4.sql` 추가 (`posts.reading_time` drop)

2. Admin 구조 재편

- 기능 폴더: `about`, `blog`, `projects`, `home`, `contact`
- 공통 폴더: `components/admin/common`
- `posts-manager` -> `blog/blog-manager`로 리네이밍
- admin 관련 import 전면 갱신

3. Markdown 에디터 토글 도입

- `@toast-ui/editor` 의존성 추가
- 공통 컴포넌트 추가:
  - `components/admin/common/toast-markdown-editor.tsx`
  - `components/admin/common/markdown-field.tsx`
- Blog 본문: `에디터 사용` 체크 시 Toast UI 에디터 전환
- Project 요약: 동일 방식 토글 적용
- 토글 상태는 편집 화면 로컬 상태(비저장)로 유지

4. Project 요약 렌더 정책 반영

- 상세 페이지: Markdown 렌더
- 카드/메타(description): markdown 문법 제거한 plain text 렌더

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 참고 메모

- `@toast-ui/react-editor`는 React 19 peer dependency 충돌로 채택하지 않았고, 동일한 Toast UI의 vanilla 패키지(`@toast-ui/editor`)로 구현함.$body$, 'published', '2026-04-08T00:00:00Z', false, true, false),
  ('홈_소개_리뉴얼_1차', $title$홈/소개 리뉴얼 1차$title$, $desc$홈/소개 리뉴얼 1차 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 작업 일지 - 홈/소개 리뉴얼 1차

## 작업일

- 2026-04-09

## 목표

- 홈을 단일 풀블리드 Hero 슬라이더 중심으로 전환
- About 페이지를 좌우 2단(기술 스택/프로필 사진) 구조로 개편
- 관리자에서 메인 Hero 노출 항목을 수동 관리할 수 있는 `Home Highlight` 탭 추가

## 주요 변경 사항

- 홈
  - `app/[lang]/(site)/page.tsx`에서 기존 `TechStack/FeaturedProjects/RecentPosts` 섹션 제거
  - `ImmersiveHeroSlider` 컴포넌트 신규 도입
  - 메인/썸네일 Swiper 동기화, CTA 버튼, 풀블리드 레이아웃 적용
- 소개(공개)
  - About 페이지를 `좌(소개+기술 로고 카드+강점+작업방식) / 우(프로필 사진)` 구조로 재배치
  - 기술 스택 로고/설명을 카드형 인터랙션으로 노출
- 관리자
  - `/admin/highlight` 신규 페이지 추가
  - `components/admin/highlight/highlight-manager.tsx`로 항목 추가/정렬/활성화/오버라이드 저장 기능 구현
  - 사이드바에 `홈 하이라이트` 메뉴 추가
  - 대시보드 카드에 홈 하이라이트 현황 추가

## 데이터 계층 변경

- 신규 마이그레이션: `supabase/schema-v1.0.8.sql`
  - `home_highlights` 테이블 추가
  - `profile_content.about_photo_url` 컬럼 추가
  - `profile_content.about_tech_items` 컬럼 추가
- 신규 리포지토리: `lib/home/repository.ts`
  - 관리자용 하이라이트 조회/저장
  - 공개 홈용 슬라이드 해석 로직(override + fallback)
- 신규 API: `GET/PUT /api/admin/highlights`

## 타입 변경

- `types/home.ts` 신규 추가
  - `HomeHighlight`, `HomeHighlightSourceOption`, `HomeHighlightResolvedSlide` 등
- `types/profile.ts` 확장
  - `aboutPhotoUrl`, `aboutTechItems` 추가
- `types/ui.ts` 확장
  - `HomeHighlightManagerProps`, `HomeHeroSliderProps` 추가

## 비고

- 이번 단계는 홈/소개/관리자 하이라이트 운영까지로 제한
- 블로그/프로젝트 페이지의 화려한 리뉴얼은 다음 단계로 분리$body$, 'published', '2026-04-09T00:00:00Z', false, true, false),
  ('About_클릭_리빌_인터랙션_모바일_반응형', $title$About 클릭 리빌 인터랙션 + 모바일 반응형$title$, $desc$1. 위치 클래스 분리$desc$, '/blog/default-thumbnail.svg', $body$# About 클릭 리빌 인터랙션 + 모바일 반응형

## 작업 내용
- 공개 About 페이지를 서버/클라이언트 분리 구조로 변경했습니다.
  - 서버 페이지: 데이터 조회 + 라벨 전달만 담당
  - 클라이언트 컴포넌트: 클릭 인터랙션/애니메이션 상태 관리
- 초기 상태는 중앙 원형 프로필 이미지 중심으로 렌더링되며, 클릭 시:
  - 프로필 카드가 우측 방향으로 이동
  - 소개 텍스트와 기술 스택 카드가 순차적으로 등장
- 모바일 반응형을 고려해 다음을 적용했습니다.
  - 단일 컬럼 기준 안전한 폭(`w-[220px]`, `sm:w-[270px]`)
  - 모바일에서 과도한 이동을 피하는 완만한 `translate-x`
  - 기술 스택 1~2열 자동 전환
- 프로필 이미지는 전 구간 `object-contain`으로 유지해 잘림을 방지했습니다.

## 변경 파일
- `app/[lang]/(site)/about/page.tsx`
- `components/about/interactive-about-reveal.tsx`
- `types/ui.ts`

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 후속 조정
- 프로필 카드 내 `열기/닫기` 텍스트를 제거했습니다.
- 초기 상태에서 프로필 카드가 위아래로 살짝 움직이는 `bounce` 애니메이션을 추가했습니다.
- 클릭 확장 시 프로필 카드는 천천히 오른쪽으로 이동하도록 전환 시간을 늘렸습니다.
- 데스크탑에서 프로필 카드가 항상 화면 정중앙 높이에 맞춰 보이도록 위치 계산을 조정했습니다.
- 프로필 사진이 프레임 안에서 작게 보이던 문제를 수정했습니다.
  - 원형 프레임 패딩/보더를 축소
  - 이미지 렌더를 `object-contain`에서 `object-cover object-top`으로 변경
  - 프로필 카드처럼 보이도록 하단 그라데이션 오버레이를 추가

## 후속 히스토리 (추가)
1. 위치 클래스 분리
- 요청에 맞춰 위치 관련 Tailwind 클래스를 `profileButtonPosition` 객체로 분리했습니다.
- 목적: 모바일/데스크톱 위치 보정을 한 곳에서 관리하고, 회귀를 줄이기 위함.

2. 모바일 닫힘 상태 상단 보정
- 닫힘 상태에서 프로필 버튼이 모바일에서만 위로 이동하도록 조정했습니다.
- 이후 헤더와 겹침 이슈가 확인되어 단순 top 값 보정만으로는 한계가 있음을 확인했습니다.

3. 모바일 닫힘 상태 콘텐츠 0 처리
- 닫힘 상태일 때 모바일에서 콘텐츠 영역을 `w/h = 0`에 가깝게 접어 보이지 않게 처리했습니다.
- 데스크톱 동작은 유지하도록 `lg:*` 클래스 분기 처리했습니다.

4. 모션 끊김 완화
- `w/h` 직접 전환으로 끊기던 문제를 줄이기 위해 `max-height + opacity + transform` 기반 전환으로 변경했습니다.
- 레이아웃 점프를 줄이기 위해 콘텐츠 카드(`article`) 자체보다 래퍼에서 모션을 처리하도록 구조를 조정했습니다.

5. 모바일 이동 제거(최종)
- 최종 결정: 모바일에서는 프로필 버튼의 위치 이동을 제거하고, 동일 위치 고정으로 변경했습니다.
- 열림 상태에서는 위치 이동 대신 `scale`만 서서히 키우도록 조정했습니다.
- 데스크톱에서만 우측 이동 애니메이션을 유지했습니다.

## 최종 상태 요약
- 모바일:
  - 프로필 버튼 위치 고정(열림/닫힘 동일)
  - 콘텐츠는 펼침/접힘 모션만 동작
  - 열림 시 버튼 `scale` 강조
- 데스크톱:
  - 기존 의도대로 우측 이동 + 콘텐츠 리빌 유지
- 코드 가독성:
  - 위치 관련 클래스는 객체 분리 + 한국어 주석 반영$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('About_페이지_리뉴얼_반응형_인터랙션', $title$About 페이지 리뉴얼 (반응형 + 인터랙션)$title$, $desc$About 페이지 리뉴얼 (반응형 + 인터랙션) 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# About 페이지 리뉴얼 (반응형 + 인터랙션)

## 작업 목적
- 소개 페이지를 단순 정보 나열에서 벗어나 인터랙티브한 브랜드 섹션으로 재구성한다.
- 데스크탑/모바일 모두 자연스럽게 보이도록 반응형 레이아웃을 정리한다.

## 변경 내용
- 파일: `app/[lang]/(site)/about/page.tsx`
- 레이아웃
  - 풀폭 배경(그라디언트/라디얼 레이어) 적용
  - 상단: 소개 텍스트 카드 + 프로필 카드 2단(모바일 1단) 구성
  - 하단: 기술스택 인터랙티브 카드 그리드 구성
- 인터랙션
  - 카드 hover 시 translate/scale/shadow 전환
  - 프로필 카드에 글로우/확대 전환
  - 기술 로고 hover 시 확대 효과
  - `SlideIn` 시퀀스 모션으로 섹션 진입 애니메이션 강화
- 카피/라벨
  - locale별 라벨 세분화(`profileCard`, `experience`, `skillDeck`, `core`)

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('Vercel_1차_프로덕션_배포_Production_only', $title$Vercel 1차 프로덕션 배포 (Production only)$title$, $desc$1. Vercel CLI 로그인 및 프로젝트 연결$desc$, '/blog/default-thumbnail.svg', $body$# Vercel 1차 프로덕션 배포 (Production only)

## 배포 결과
- Vercel 프로젝트 연결: `wogml3270s-projects/j-blog`
- 프로덕션 alias URL(기존): `https://j-blog-two.vercel.app`
- 프로덕션 alias URL(변경): `https://j-fe-blog.vercel.app`
- 배포 Inspect URL:
  - `https://vercel.com/wogml3270s-projects/j-blog/7y2RQHECuCd2wGuAZVhDySJnDgpz`

## 적용한 작업
1. Vercel CLI 로그인 및 프로젝트 연결
2. Production 배포 1회 수행
3. `.env.local` 기준으로 Vercel Production 환경변수 등록
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `SUPABASE_PROJECT_THUMBNAIL_BUCKET`
   - `ADMIN_ALLOWED_EMAILS`
4. 환경변수 반영을 위해 Production 재배포 1회 추가 수행

## 스모크 테스트 결과
- `/` -> `200`
- `/about` -> `200`
- `/blog` -> `200`
- `/projects` -> `200`
- `/admin/login` -> `200`
- `/auth/callback`(code 없음) -> `307 /admin/login?reason=missing_code`
- `https://j-fe-blog.vercel.app` -> `200`

## Supabase 대시보드에서 수동으로 맞춰야 할 항목
- Auth > URL Configuration
  - Site URL: `https://j-fe-blog.vercel.app`
  - Additional Redirect URLs:
    - `https://j-fe-blog.vercel.app/auth/callback`
    - `https://j-blog-two.vercel.app/auth/callback` (임시 호환)
    - `http://localhost:3000/auth/callback`
- Auth > Providers (Google/GitHub/Kakao)
  - Supabase callback URL은 기존 방식 유지
  - 각 Provider 콘솔에 위 production callback URL 반영 여부 확인

## 메모
- Vercel 빌드 로그에 `.env` 파일 감지 경고가 있어, 장기적으로는 로컬 `.env` 파일 의존 없이 Vercel 환경변수만 사용하도록 정리 필요.$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('관리자_안정화_예약_발행_에디터_고정_v1_0_12', $title$관리자 안정화 + 예약 발행 + 에디터 고정 (v1.0.12)$title$, $desc$관리자 안정화 + 예약 발행 + 에디터 고정 (v1.0.12) 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 관리자 안정화 + 예약 발행 + 에디터 고정 (v1.0.12)

## 작업 목적
- 관리자 블로그/프로젝트 진입 시 간헐적으로 발생하던 `removeChild` DOM 오류를 완화한다.
- 썸네일 업로드 UX를 즉시 미리보기 + 자동 업로드 방식으로 단순화한다.
- 블로그 예약 발행을 도입하고, 실제 게시일을 자동 정책으로 고정한다.
- Markdown 입력은 항상 Toast UI 에디터를 사용하도록 통일한다.

## 주요 변경
- `EditorDrawer`는 `open=false`일 때 컴포넌트를 언마운트하도록 변경했다.
- Toast UI Editor/Viewer 정리 루틴에 안전 가드(중복 destroy 방지, cleanup 보강)를 추가했다.
- 블로그/프로젝트 썸네일 업로드에서 `업로드 후 적용` 버튼을 제거하고 파일 선택 즉시:
  - 로컬 미리보기 표시
  - 스토리지 업로드 자동 실행
  - 성공 시 URL 반영
  - 실패 시 에러 메시지 노출
- 블로그 편집 폼:
  - `메인 페이지 노출` 체크를 `공개/비공개` 라디오와 같은 영역에 배치
  - `실제 게시일`은 읽기 전용 표시로 변경
  - `예약 발행(datetime-local)` 입력 + 해제 버튼 추가
- 블로그 게시일 정책:
  - `draft`는 `published_at`, `scheduled_publish_at` 모두 `null`
  - 최초 공개 시 1회만 `published_at` 설정
  - 예약 발행 시 최초 `published_at`을 예약 시각으로 설정
  - 공개 이력이 있는 글은 이후 저장 시 `published_at` 유지
- 공개 블로그 조회 조건에 예약 발행 필터를 추가했다.
  - `status='published'` AND `(scheduled_publish_at is null OR scheduled_publish_at <= now())`
- MarkdownField는 토글 UI를 제거하고 항상 Toast UI 에디터만 렌더하도록 변경했다.

## 스키마
- `supabase/v1/schema-v1.0.12.sql` 추가
  - `posts.scheduled_publish_at timestamptz` 컬럼 추가
  - 조회 성능용 인덱스 추가
  - `schema_migrations`에 `v1.0.12` 기록

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 메모
- `prettier`는 `.sql` 파서를 자동 인식하지 못해 SQL 파일은 포맷 대상에서 제외했다.$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('관리자_위치_변경_드래그_통일', $title$관리자 위치 변경 드래그 통일$title$, $desc$관리자 위치 변경 드래그 통일 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 관리자 위치 변경 드래그 통일

## 작업 목적
- 관리자 페이지의 위치 변경 기능을 화살표 버튼이 아닌 마우스 드래그로 통일한다.
- 프로젝트 관리에서 사용 중인 dnd-kit 방식과 동일한 UX를 Home/About에도 적용한다.

## 변경 내용
- Home 관리자 (`components/admin/home/home-manager.tsx`)
  - 위/아래 버튼 기반 정렬 로직 제거
  - `@dnd-kit` 기반 드래그 정렬로 변경 (`DndContext`, `SortableContext`, `useSortable`)
  - 항목 카드 좌측에 드래그 핸들(`≡`) 추가
  - 순서 저장은 기존 payload(orderIndex) 흐름 그대로 유지

- About 관리자 (`components/admin/about/about-manager.tsx`)
  - 기술 스택 항목 순서 변경을 드래그 정렬로 변경
  - 한 줄(horizontal) 나열 레이아웃에서 드래그 가능한 카드로 구성
  - 각 카드에 드래그 핸들(`≡`) 추가
  - 삭제 기능은 기존과 동일 유지

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과

## 확인 포인트
- Home에서 드래그 순서 변경 후 저장 시 순서 유지되는지
- About 기술 스택을 가로 방향으로 드래그 정렬 후 저장/재진입 시 순서 유지되는지$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('기술스택_순서_이동_한_줄_레이아웃_정리', $title$기술스택 순서 이동 + 한 줄 레이아웃 정리$title$, $desc$기술스택 순서 이동 + 한 줄 레이아웃 정리 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 기술스택 순서 이동 + 한 줄 레이아웃 정리

## 작업 목적
- About 관리에서 기술스택 노출 순서를 직접 바꿀 수 있게 한다.
- 공개 About 기술스택을 한 줄 레이아웃으로 보기 좋게 정렬한다.

## 변경 내용
- 관리자 About (`components/admin/about/about-manager.tsx`)
  - 기술 항목 순서 이동 함수 추가: `moveTechItem(id, direction)`
  - 기술 목록 UI를 2열 그리드에서 가로 1줄(`overflow-x-auto`) 카드 나열로 변경
  - 각 항목에 `↑`, `↓`, `삭제` 버튼 추가
  - 순서 변경 결과는 기존 `aboutTechItems` 배열 순서대로 저장되며 공개 페이지에도 반영

- 공개 About (`app/[lang]/(site)/about/page.tsx`)
  - 기술스택 렌더를 그리드에서 가로 1줄 스크롤 레이아웃으로 변경
  - 각 아이템에 아이콘 + 기술명을 함께 노출
  - 기존 "추가 개수(+N)" 표시는 제거

## 확인 포인트
- 관리자 About에서 `↑/↓` 이동 후 저장 시 순서가 유지되는지
- 공개 About에서 기술스택이 한 줄로 정렬되고, 항목이 많을 때 가로 스크롤되는지$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('소개_단순화_리뉴얼_v1_0_13', $title$소개 단순화 리뉴얼 v1.0.13$title$, $desc$소개 단순화 리뉴얼 v1.0.13 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 소개 단순화 리뉴얼 v1.0.13

## 작업 요약
- `profile_content` 모델을 단순화하기 위해 불필요한 About 컬럼 5개를 제거하는 증분 마이그레이션을 추가했습니다.
- 관리자 About 편집/저장 경로를 단순 모델(`name`, `title`, `summary`, `about_photo_url`, `about_tech_items`, `status`) 기준으로 정리했습니다.
- 공개 About 페이지를 단순 모델 기반 레이아웃으로 재구성하고, 프로필 이미지는 모든 디바이스에서 잘리지 않도록 `object-contain`으로 고정했습니다.
- 사용되지 않는 `/api/admin/profile` 엔드포인트 경로를 제거했습니다.
- 시드 스크립트의 `profile_content` 업서트 구조를 새 스키마에 맞게 정리했습니다.

## 변경 파일
- `supabase/v1/schema-v1.0.13.sql`
- `types/profile.ts`
- `lib/profile/repository.ts`
- `app/api/admin/about/route.ts`
- `app/[lang]/(site)/about/page.tsx`
- `scripts/seed-supabase.mjs`
- `docs/worklogs/2026-04-10/소개-단순화-리뉴얼-v1.0.13.md`

## 비고
- 기존 v1.0.0/v1.0.2 스키마 파일에는 과거 컬럼 정의가 남아 있으며, 이번 버전에서는 증분 마이그레이션(`v1.0.13`)으로 제거합니다.$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('소셜_아바타_next_image_에러_해결', $title$소셜 아바타 next/image 에러 해결$title$, $desc$소셜 아바타 next/image 에러 해결 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 소셜 아바타 next/image 에러 해결

## 이슈
- 카카오 로그인 시 `Invalid src prop ... k.kakaocdn.net` 에러 발생
- 구글 로그인은 이미지 URL이 존재해도 일부 화면에서 아바타 렌더 실패

## 조치
- 소셜 프로필 URL 정규화 유틸 추가
  - `http://k.kakaocdn.net/...` -> `https://k.kakaocdn.net/...` 교정
  - 허용 프로토콜(`http/https`) 이외 값 차단
- 헤더 인증 모달 아바타를 `next/image`에서 `img`로 전환
  - 소셜 아바타 렌더를 도메인 최적화 제약에서 분리
- `next.config.ts` `images.remotePatterns`에 소셜 도메인 명시 추가
  - `k.kakaocdn.net`, `lh3.googleusercontent.com`, `avatars.githubusercontent.com`

## 변경 파일
- `lib/utils/avatar-url.ts`
- `components/layout/header.tsx`
- `components/blog/comments-section.tsx`
- `lib/auth/admin.ts`
- `next.config.ts`$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('수파베이스_스토리지_업로드_정비', $title$수파베이스 스토리지 업로드 정비$title$, $desc$1. Supabase SQL Editor에서 `schema-v1.0.9.sql` 실행$desc$, '/blog/default-thumbnail.svg', $body$# 수파베이스 스토리지 업로드 정비

## 작업 배경
- 관리자에서 PC 이미지 업로드 시 Supabase Storage로 직접 저장되도록 일원화 필요
- 페이지별로 스토리지 폴더를 분리해 운영/관리 가독성 개선 필요

## 적용 내용
- 공통 업로드 스코프 확장
  - `about | blog | projects | home | misc`
- 업로드 경로 규칙 통일
  - `/{scope}/{YYYY-MM-DD}/{unique}-{filename}.{ext}`
- 버킷 환경변수 우선순위 정리
  - `SUPABASE_STORAGE_BUCKET` 우선
  - 없으면 `SUPABASE_PROJECT_THUMBNAIL_BUCKET` fallback
- 공통 클라이언트 업로드 유틸 추가
  - `lib/admin/upload-client.ts`
- 관리자 업로드 연동 정리
  - 블로그 썸네일 업로드 -> 공통 유틸 사용
  - 프로젝트 썸네일 업로드 -> 공통 유틸 사용
  - About 관리에 프로필 이미지 파일 업로드 추가
  - About 관리에 기술 로고 파일 업로드 추가
  - Home 관리에 하이라이트 배경 이미지 파일 업로드 추가
- 증분 SQL 추가
  - `supabase/schema-v1.0.9.sql`
  - 버킷 보정/마이그레이션 기록 포함

## 환경변수 검수/수정
- 잘못 들어간 Storage S3 URL 제거
- `.env.local` 수정:
  - `SUPABASE_STORAGE_BUCKET=project-thumbnails`
  - `SUPABASE_PROJECT_THUMBNAIL_BUCKET=project-thumbnails`
- `NEXT_PUBLIC_SUPABASE_URL`은 프로젝트 URL(`https://<project-id>.supabase.co`) 유지

## 검증 결과
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build`는 샌드박스 네트워크 제한(google fonts fetch)으로 확인 불가

## 후속 할 일
1. Supabase SQL Editor에서 `schema-v1.0.9.sql` 실행
2. 관리자에서 블로그/프로젝트/About/Home 이미지 업로드 실사용 점검
3. 키 노출 이력으로 `SUPABASE_SERVICE_ROLE_KEY` rotate 권장$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('슬러그_중복_안내_About_SVG_업로드_개선', $title$슬러그 중복 안내 + About SVG 업로드 개선$title$, $desc$슬러그 중복 안내 + About SVG 업로드 개선 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 슬러그 중복 안내 + About SVG 업로드 개선

## 작업 목적
- 슬러그 중복 발생 시 관리자에게 이해하기 쉬운 오류 메시지를 제공한다.
- About 탭의 프로필/기술 로고 업로드 UX를 블로그·프로젝트 썸네일 업로드와 동일하게 맞춘다.
- 기술 로고 업로드에서 SVG 태그 문자열 입력 방식도 지원한다.

## 변경 내용
- DB 에러 파싱 유틸 추가:
  - `lib/utils/db-error.ts`
  - `toSlugConflictMessage()`로 `23505 + slug` 충돌을 한국어 메시지로 변환.
- 저장소 에러 메시지 개선:
  - `lib/blog/repository.ts`
  - `lib/projects/repository.ts`
  - create/update 시 slug unique 충돌이면 `이미 사용 중인 슬러그` 안내 문구 반환.
- About 업로드 UX 개선:
  - `components/admin/about/about-manager.tsx`
  - 프로필 이미지: URL/파일 업로드 모드, 파일 선택 즉시 미리보기 + 자동 업로드.
  - 기술 로고: URL/파일/SVG 코드 모드, 파일 선택 즉시 미리보기 + 자동 업로드.
  - SVG 코드 업로드: `<svg>...</svg>` 문자열을 `image/svg+xml` 파일로 변환해 스토리지 업로드.
  - 로컬 Object URL 정리(cleanup) 로직 추가.

## 확인 포인트
- 블로그/프로젝트에서 중복 slug 저장 시 한국어 안내 문구가 노출되는지.
- About 기술 로고에서 SVG 코드 입력 업로드가 정상 동작하는지.
- 업로드 선택 즉시 미리보기 및 URL 반영이 되는지.$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('프로젝트_요약_분리_슬러그_동기화_저장', $title$프로젝트 요약 분리 + 슬러그 동기화 저장$title$, $desc$1. Supabase SQL Editor에서 `supabase/schema-v1.0.10.sql` 실행$desc$, '/blog/default-thumbnail.svg', $body$# 프로젝트 요약 분리 + 슬러그 동기화 저장

## 배경
- 프로젝트 설명을 마크다운으로 길게 작성하면 홈 하이라이트에서 설명이 과도하게 길게 노출됨
- 관리자의 `제목과 동일` 체크가 재진입 시 풀려 보이는 문제(블로그/프로젝트 공통)

## 변경 사항
- 프로젝트 데이터 모델 확장
  - `projects.home_summary` 추가: 홈 하이라이트용 짧은 요약
  - `projects.sync_slug_with_title` 추가: 슬러그 자동 동기화 체크 저장
- 블로그 데이터 모델 확장
  - `posts.sync_slug_with_title` 추가
- 홈 하이라이트 설명 로직 개선
  - 프로젝트 설명은 `home_summary` 우선 사용
  - 없으면 기존 `summary`를 plain text로 변환해 fallback
  - 최종 설명은 170자 제한으로 잘라 과도 노출 방지
- 관리자 저장/복원 로직 반영
  - 프로젝트 편집: `홈 노출 요약` 입력 필드 추가
  - 프로젝트/블로그 저장 payload에 `syncSlugWithTitle` 포함
  - 수정 화면 진입 시 DB 값으로 체크 상태 복원
- API/리포지토리/타입 반영
  - `types/projects.ts`, `types/blog.ts`, `types/ui.ts` 업데이트
  - `app/api/admin/projects*`, `app/api/admin/posts*` payload 파서 확장
  - `lib/projects/repository.ts`, `lib/blog/repository.ts`, `lib/home/repository.ts` 반영
- DB 마이그레이션
  - `supabase/schema-v1.0.10.sql` 추가

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과

## 적용 순서
1. Supabase SQL Editor에서 `supabase/schema-v1.0.10.sql` 실행
2. 관리자 프로젝트/블로그에서 저장 후 재진입해 체크 복원 확인
3. 홈 하이라이트에서 프로젝트 설명 길이 노출 확인$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('하이드레이션_안정화_기술스택_세로_정렬_수정_기능', $title$하이드레이션 안정화 + 기술스택 세로 정렬/수정 기능$title$, $desc$하이드레이션 안정화 + 기술스택 세로 정렬/수정 기능 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 하이드레이션 안정화 + 기술스택 세로 정렬/수정 기능

## 작업 목적
- 관리자에서 간헐적으로 발생하는 hydration 경고 가능성을 줄인다.
- About 기술스택을 가로 나열이 아닌 세로 1줄 리스트로 정리한다.
- About 기술스택 항목을 추가/삭제뿐 아니라 항목별 수정도 가능하게 만든다.

## 변경 내용
- 하이드레이션 안정화
  - `components/admin/projects/projects-manager.tsx`
  - 초기 렌더에서 사용하던 비결정 ID 생성(`Math.random`, `Date.now`) 제거
  - 초기 목록 ID는 `createStableId(...)`로 결정적으로 생성
  - 사용자 액션으로 새 항목 추가할 때만 `createClientId(...)` 사용

- About 기술스택 UX 개선
  - `components/admin/about/about-manager.tsx`
  - DnD 전략을 가로(horizontal)에서 세로(vertical)로 변경
  - 기술스택 목록을 세로 카드 리스트(`space-y`)로 변경
  - 각 카드에서 기술명/로고URL/설명을 직접 수정 가능하도록 입력 필드 추가
  - 드래그 핸들(`≡`)로 순서 변경 + 삭제 기능 유지

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과

## 확인 포인트
- About 기술스택 항목 수정 후 저장 시 공개 페이지에 반영되는지
- About 기술스택 드래그 순서가 저장 후에도 유지되는지
- 관리자 진입 시 hydration 경고가 재발하는지$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('홈_탭_단순화_프로젝트_입력_라벨_정리_v1_0_11', $title$홈 탭 단순화 + 프로젝트 입력 라벨 정리 (v1.0.11)$title$, $desc$1. Supabase SQL Editor에서 `supabase/v1/schema-v1.0.11.sql` 실행$desc$, '/blog/default-thumbnail.svg', $body$# 홈 탭 단순화 + 프로젝트 입력 라벨 정리 (v1.0.11)

## 변경 요약
- 홈 관리 탭에서 제목/설명/이미지 오버라이드를 제거하고 CTA 오버라이드만 유지
- 홈 관리 UI를 썸네일 미리보기 + 제목 중심 카드형으로 단순화
- 홈 관리 조작을 순서 이동 + 활성/비활성 + CTA 라벨 입력으로 제한
- 프로젝트 편집 폼 라벨/입력 방식 정리
  - `홈 노출 요약` -> `부제목`
  - `부제목` 입력을 textarea -> input으로 변경
  - `요약` -> `프로젝트 내용`
  - `프로젝트 내용` 입력 최소 높이 180 -> 320

## 코드 반영
- 타입
  - `types/home.ts`: `overrideTitle/overrideDescription/overrideImageUrl` 제거
- API
  - `app/api/admin/highlights/route.ts`: CTA-only payload 파싱으로 축소
- 리포지토리
  - `lib/home/repository.ts`:
    - home_highlights select/매핑에서 title/description/image 오버라이드 제거
    - 슬라이드 해석 시 원본 title/description/image 사용
    - CTA는 `overrideCtaLabel`만 적용
- 관리자 UI
  - `components/admin/home/home-manager.tsx`:
    - 썸네일+제목 카드형 리스트
    - 위/아래 이동, 활성화 토글, CTA 라벨 입력만 유지
    - 삭제/이미지 업로드/제목·설명 오버라이드 입력 제거
  - `components/admin/projects/projects-manager.tsx`:
    - 부제목 input 적용
    - 프로젝트 내용 라벨/placeholder 변경
    - MarkdownField 높이 320으로 상향

## DB 마이그레이션
- `supabase/v1/schema-v1.0.11.sql` 추가
  - `home_highlights.override_title` drop
  - `home_highlights.override_description` drop
  - `home_highlights.override_image_url` drop
  - `override_cta_label` 유지
  - `schema_migrations` 버전 기록 추가

## 검증
- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- `npm run build` 통과 (권한 상승 실행)

## 적용 순서
1. Supabase SQL Editor에서 `supabase/v1/schema-v1.0.11.sql` 실행
2. 관리자 `/admin/home`에서 순서/활성/CTA 저장 확인
3. 공개 홈에서 제목/설명/이미지가 원본 기준으로 출력되는지 확인$body$, 'published', '2026-04-10T00:00:00Z', false, true, false),
  ('About_데스크탑_자동_리빌_1차', $title$About 데스크탑 자동 리빌 1차$title$, $desc$About 데스크탑 자동 리빌 1차 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# About 데스크탑 자동 리빌 1차

## 변경 내용
- `components/about/interactive-about-reveal.tsx`
- 데스크탑(`min-width: 1024px`)에서 클릭 없이 초기 진입 시 자동 리빌되도록 상태를 분리했습니다.
  - `isDesktopAutoReveal` 상태 추가
  - 실제 열림 여부는 `isOpen = isDesktopAutoReveal || isExpanded`로 통합
- 모바일은 기존 클릭 토글 동작을 그대로 유지합니다.
- 데스크탑 자동 리빌 상태에서는 버튼 클릭으로 접히지 않도록 가드했습니다.
- CSS 변수 표기 오타를 정리했습니다.
  - `min-h-[--home-hero-height]` -> `min-h-[var(--home-hero-height)]`

## 검증
- `npx eslint components/about/interactive-about-reveal.tsx` 통과$body$, 'published', '2026-04-13T00:00:00Z', false, true, false),
  ('About_디바이스_훅_분리_모바일_프로필_상단_고정', $title$About 디바이스 훅 분리 + 모바일 프로필 상단 고정$title$, $desc$About 디바이스 훅 분리 + 모바일 프로필 상단 고정 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# About 디바이스 훅 분리 + 모바일 프로필 상단 고정

## 변경 내용
- `isMobile`, `isDesktop` 판별 로직을 커스텀 훅으로 분리했습니다.
  - `lib/hooks/use-device.ts` 추가
  - `window.matchMedia` 기반으로 모바일/데스크톱 상태 동기화
- `components/about/interactive-about-reveal.tsx`
  - 컴포넌트 내부 `matchMedia` 직접 처리 로직 제거
  - `useDevice()` 훅 사용으로 치환
  - 모바일 프로필 위치를 상단 고정으로 정리
    - base: `top-0`
    - expanded: 모바일 `top-0` 유지, 데스크톱만 우측 이동
  - 자동 리빌 타이밍은 디바이스별로 분기
    - 모바일: 더 빠르게 시작
    - 데스크톱: 기존보다 약간 느리게 시작
- `min-h-[--home-hero-height]` 표기 유지

## 검증
- `npx eslint components/about/interactive-about-reveal.tsx lib/hooks/use-device.ts`
- `npx tsc --noEmit`
- 두 검증 모두 통과$body$, 'published', '2026-04-13T00:00:00Z', false, true, false),
  ('공개_리스트_스켈레톤_순차_모션_적용', $title$공개 리스트 스켈레톤 + 순차 모션 적용$title$, $desc$0번째 카드부터 아래->위 순서로 자연스럽게 올라오도록 구성했습니다.$desc$, '/blog/default-thumbnail.svg', $body$# 공개 리스트 스켈레톤 + 순차 모션 적용

## 작업 배경
- 프로젝트/블로그 리스트 진입 시 로딩 상태가 비어 보여 체감이 딱딱했습니다.
- 카드 등장 모션이 동시에 시작되어 시선 흐름이 약했습니다.

## 변경 내용
- 리스트 페이지 카드 렌더에 `map`의 두 번째 인자(`index`)를 사용해 순차 지연을 적용했습니다.
  - `app/[lang]/(site)/projects/page.tsx`
    - `animationDelay={index * 70}` 추가
  - `app/[lang]/(site)/blog/page.tsx`
    - `animationDelay={index * 70}` 추가
- 라우트 진입용 스켈레톤 파일을 신규 추가했습니다.
  - `app/[lang]/(site)/projects/loading.tsx`
  - `app/[lang]/(site)/blog/loading.tsx`
- 스켈레톤 카드도 `SlideIn`으로 감싸고 `delay={index * 70}`을 적용해
  0번째 카드부터 아래->위 순서로 자연스럽게 올라오도록 구성했습니다.

## 검증
- `npx eslint app/[lang]/(site)/projects/page.tsx app/[lang]/(site)/blog/page.tsx app/[lang]/(site)/projects/loading.tsx app/[lang]/(site)/blog/loading.tsx`
- `npx tsc --noEmit`
- 두 검증 모두 통과했습니다.$body$, 'published', '2026-04-13T00:00:00Z', false, true, false),
  ('v1_0_14_관리자_UX_정비_About_상태_제거', $title$v1.0.14 관리자 UX 정비 + About 상태 제거$title$, $desc$v1.0.14 관리자 UX 정비 + About 상태 제거 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# v1.0.14 관리자 UX 정비 + About 상태 제거

## 작업 목적
- 홈 슬라이드 관리 탭에 페이지네이션 없이 필터만 추가
- About 공개/비공개 상태 기능을 DB/API/UI에서 제거
- 블로그/프로젝트 리스트를 썸네일/제목/태그/날짜 중심 미리보기형으로 강화
- 기존 더미데이터 생성 흔적 및 실제 더미 데이터 정리

## 적용 내용
- 홈 슬라이드 관리
  - 소스 필터(`전체 소스/프로젝트/블로그`) 추가
  - 노출 필터(`전체 노출/활성/비활성`) 추가
  - 필터 적용 상태에서도 드래그 정렬/활성 토글/CTA 라벨 편집 유지
- About 상태 제거
  - `types/profile.ts`에서 `status` 필드 제거
  - `lib/profile/repository.ts`에서 `profile_content.status` 의존 제거
  - `/api/admin/about` 요청/응답에서 `status` 제거
  - 관리자 About 탭에서 상태 배지/라디오 제거
  - 대시보드의 About 상태 표시를 이름/최종 변경일 중심으로 정리
- 관리자 리스트 미리보기 강화
  - 블로그/프로젝트 모두 리스트 행에 썸네일, 제목, 태그(상위 3개), 날짜 표시
  - 블로그 날짜는 `publishedAt` 우선, 없으면 `updatedAt` 사용
  - 프로젝트 날짜는 `updatedAt` 고정
- SQL 정리
  - `supabase/v1/schema-v1.0.5.sql`에서 더미 insert 블록 제거(인덱스 전용)
  - `supabase/v1/schema-v1.0.14.sql` 추가
    - `profile_content.status` 제거
    - `profile_public_read` 정책을 상시 조회로 재정의
    - 더미 posts/projects/contact_messages 삭제
    - `schema_migrations` 기록/보정

## 확인 포인트
- `/admin/home` 필터 조합별 목록 노출 확인
- `/admin/about`에서 상태 UI 제거 및 저장 정상 동작 확인
- `/admin/blog`, `/admin/projects` 리스트의 미리보기 요소 노출 확인
- `schema-v1.0.14.sql` 실행 전 백업 여부 확인 후 적용$body$, 'published', '2026-04-13T00:00:00Z', false, true, false),
  ('관리자_헤더_매니저_구조_리팩터링', $title$관리자 헤더/매니저 구조 리팩터링$title$, $desc$관리자 헤더/매니저 구조 리팩터링 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 관리자 헤더/매니저 구조 리팩터링

## 작업 목적
- dashboard와 home의 책임 분리
- 관리자 탭 헤더를 ManagerShell로 통일
- 필터/선택박스/버튼 영역을 공통 Toolbar 컴포넌트로 통일
- 홈 매니저 네이밍을 `dashboard-home-manager`에서 `home-manager`로 정리

## 적용 내용
- 매니저 분리/리네임
  - `components/admin/home/dashboard-home-manager.tsx` -> `components/admin/home/home-manager.tsx`
  - `DashboardHomeManager` -> `HomeManager`
  - `DashboardHomeManagerProps` -> `HomeManagerProps`
  - `/admin/home/page.tsx` import/사용처 갱신
- 대시보드 분리
  - `components/admin/dashboard/dashboard-manager.tsx` 신설
  - `/admin/(protected)/dashboard/page.tsx`는 데이터 fetch + `<DashboardManager />`만 담당
- ManagerShell 표준화
  - `ManagerShellProps`에 `title` 필드 추가
  - ManagerShell 내부에서 공통 title 렌더
  - `home/blog/projects/contact/about` 탭의 page-level `h1` 제거
- Toolbar 공통화
  - `components/admin/common/admin-toolbar.tsx` 신설
    - `AdminToolbar`
    - `AdminToolbarSelect`
    - `AdminToolbarAction`
  - home/blog/projects/contact의 action 영역을 공통 Toolbar로 교체

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 실패(네트워크 제한으로 Google Fonts 접근 불가)$body$, 'published', '2026-04-13T00:00:00Z', false, true, false),
  ('대시보드_홈_네이밍_통일', $title$대시보드 홈 네이밍 통일$title$, $desc$대시보드 홈 네이밍 통일 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 대시보드 홈 네이밍 통일

## 작업 배경
- 홈 하이라이트 관리 기능이 대시보드 운영 흐름에 통합된 상태인데, 코드/컴포넌트 네이밍이 `HomeHighlightManager`로 남아 있어 의미가 혼재되고 있었습니다.
- `/admin/highlight` 경로가 일부 링크에 남아 있어 실제 운영 경로(`/admin/home`)와 불일치가 발생하고 있었습니다.

## 변경 내용
- 관리자 홈 관리 컴포넌트 파일명을 변경했습니다.
  - `components/admin/home/home-manager.tsx`
  - -> `components/admin/home/dashboard-home-manager.tsx`
- 컴포넌트/타입 네이밍을 대시보드 기준으로 통일했습니다.
  - `HomeHighlightManager` -> `DashboardHomeManager`
  - `HomeHighlightManagerProps` -> `DashboardHomeManagerProps`
- 관리자 홈 페이지의 import 및 페이지 함수명을 정리했습니다.
  - `app/admin/(protected)/home/page.tsx`
  - `AdminHighlightPage` -> `AdminDashboardHomePage`
  - 페이지 제목: `홈 관리` -> `대시보드 홈 관리`
- 홈 로딩 컴포넌트 함수명을 정리했습니다.
  - `app/admin/(protected)/home/loading.tsx`
  - `AdminHighlightLoading` -> `AdminDashboardHomeLoading`
- 대시보드 내부 링크를 실제 운영 경로로 통일했습니다.
  - `app/admin/(protected)/dashboard/page.tsx`
  - `/admin/highlight` -> `/admin/home`
  - 카드 라벨 `홈 하이라이트` -> `대시보드 홈`
- 저장 성공/실패 메시지 문구를 대시보드 맥락으로 정리했습니다.

## 검증
- `npx eslint app/admin/(protected)/home/page.tsx app/admin/(protected)/home/loading.tsx app/admin/(protected)/dashboard/page.tsx components/admin/home/dashboard-home-manager.tsx types/ui.ts`
- `npx tsc --noEmit`
- 두 검증 모두 통과했습니다.$body$, 'published', '2026-04-13T00:00:00Z', false, true, false),
  ('더미데이터_정리_최종_스키마_정리_v1_0_15', $title$더미데이터 정리 + 최종 스키마 정리 (v1.0.15)$title$, $desc$1. `supabase/v1/schema-v1.0.15.sql`$desc$, '/blog/default-thumbnail.svg', $body$# 더미데이터 정리 + 최종 스키마 정리 (v1.0.15)

## 작업 목적
- 프로젝트/블로그/문의함의 기존 테스트 더미 데이터를 제거하고, 운영 시연에 사용할 수 있는 현실적인 샘플 데이터를 재구성한다.
- `supabase/v1` 기준 최종 구조를 한 번에 확인/적용할 수 있는 통합 스키마 파일을 추가한다.

## 반영 내용
1. `supabase/v1/schema-v1.0.15.sql`
- 기존 더미 패턴(`dummy-*`, `test-*`, `[더미]`) 및 기존 seed 슬러그 기반 데이터 정리.
- `posts` 10건, `projects` 10건, `contact_messages` 10건 현실형 샘플 데이터 재삽입.
- `contact_messages.status`를 `new|replied`로 정규화(`read -> replied`) 후 체크 제약 재정의.
- `post_tags`, `post_tag_map`를 샘플 태그 기준으로 재구성.

2. `supabase/v1/schema-v1.0.15-최종.sql` (신규)
- v1.0.0 ~ v1.0.15 누적 결과를 반영한 최종 통합 구조 스키마 추가.
- 포함 범위:
  - enum/type
  - tables/columns/defaults/constraints
  - trigger/functions
  - indexes
  - grants + RLS policies
  - 운영 기본 seed(profile singleton/admin allowlist/storage bucket)
  - schema_migrations 기록
- 제외 범위:
  - 샘플 콘텐츠 더미 데이터(posts/projects/contact_messages)

## 확인 포인트
- 최종 통합 스키마에는 삭제 완료된 레거시 필드(`reading_time`, `about_intro_description_ko`, `about_experience`, `work_style`, `strengths`, `profile_content.status`, `home_highlights`의 제거된 override 필드)가 포함되지 않음.

## 다음 적용 순서(권장)
1. Supabase SQL Editor에서 `schema-v1.0.15.sql` 실행(데이터 정리+샘플 입력).
2. 신규 환경 전체 초기화가 필요할 때만 `schema-v1.0.15-최종.sql` 사용.$body$, 'published', '2026-04-13T00:00:00Z', false, true, false),
  ('로컬_수정_프로덕션_캐시_동기화', $title$로컬 수정-프로덕션 캐시 동기화$title$, $desc$1. 공통 revalidate 전략 확장 (`lib/cache/revalidate.ts`)$desc$, '/blog/default-thumbnail.svg', $body$# 로컬 수정-프로덕션 캐시 동기화

## 배경
- 로컬 관리자에서 데이터 저장 시, 로컬 서버의 `revalidatePath`만 실행되어 프로덕션 캐시에는 즉시 반영되지 않는 문제가 있었다.

## 변경 내용
1. 공통 revalidate 전략 확장 (`lib/cache/revalidate.ts`)
- 기존 locale별 경로 `revalidatePath`는 유지.
- 로컬/개발 환경에서만 선택적으로 프로덕션에 재검증 요청을 전파하도록 확장.
- 신규 환경변수:
  - `REVALIDATE_TARGET_URL`
  - `REVALIDATE_SECRET`

2. 내부 revalidate API 추가 (`app/api/internal/revalidate/route.ts`)
- `POST /api/internal/revalidate`
- 헤더 `x-revalidate-secret` 검증 후 전달받은 `paths`를 현재 인스턴스에서 재검증.
- 권한 없는 호출은 401 반환.

3. 관리자 mutation 라우트 await 처리
- `posts/projects/about/highlights` 저장/수정/삭제 라우트에서
  `await revalidate...` 적용.
- 대상 파일:
  - `app/api/admin/posts/route.ts`
  - `app/api/admin/posts/[id]/route.ts`
  - `app/api/admin/projects/route.ts`
  - `app/api/admin/projects/[id]/route.ts`
  - `app/api/admin/about/route.ts`
  - `app/api/admin/highlights/route.ts`

4. 환경변수 예시 문서화
- `.env.example`에 `REVALIDATE_TARGET_URL`, `REVALIDATE_SECRET` 추가.

## 적용 가이드
- 로컬 `.env.local`:
  - `REVALIDATE_TARGET_URL=https://j-fe-blog.vercel.app`
  - `REVALIDATE_SECRET=<랜덤 시크릿>`
- Vercel Production 환경변수:
  - `REVALIDATE_SECRET=<동일 값>`
- 이후 로컬 관리자 저장 시:
  - 로컬 캐시 + 프로덕션 캐시 동시 무효화.

## 검증
- `npx tsc --noEmit` 통과.

## 실제 적용 결과(운영)
- Vercel Production 환경변수 `REVALIDATE_SECRET` 추가 완료.
- 테스트용 임시 변수 `CODEx_TEMP_REVALIDATE_TEST`는 제거 완료.
- 최신 배포를 재실행하고 `j-fe-blog.vercel.app` alias를 최신 배포로 재지정 완료.

## 엔드포인트 검증
- `POST /api/internal/revalidate` (헤더 없음) -> `401 Unauthorized` 확인.
- 동일 엔드포인트에 로컬 `REVALIDATE_SECRET` 헤더 포함 -> `200` 확인.
- 결과적으로 로컬 관리자 저장 시 프로덕션 캐시 동기화 경로가 활성화됨.

## 추가 원인 분석 및 보정
- 공개 페이지가 `/blog`로 접속되더라도 실제 렌더는 middleware rewrite로 `/ko/blog` 경로에서 수행된다.
- 기존 revalidate는 기본 로케일(ko)에 대해 `/blog`만 무효화해 `/ko/blog` 캐시를 놓칠 수 있었다.
- 보정:
  - revalidate 대상 경로를 locale별로 `withLocalePath` + `withLocaleRoutePath`를 모두 포함하도록 수정.
  - 예: `/blog` + `/ko/blog` 동시 무효화.

## 추가 보강(즉시 반영 안정화)
- 프로덕션 공개 응답 헤더 점검 시 `x-vercel-cache: HIT`와 `age` 누적이 확인되어, 캐시 계층 영향 가능성이 남아 있었다.
- 보강:
  1. `app/[lang]/(site)/layout.tsx`
  - `headers()` 호출을 추가해 공개 라우트를 명시적으로 Request-time 렌더링으로 고정.
  2. `lib/supabase/service.ts`
  - 서비스 클라이언트의 `global.fetch`를 `cache: "no-store"` + `next.revalidate = 0`으로 강제.
  - 서버 측 Supabase 조회가 항상 최신 DB 값을 읽도록 보강.
- 검증:
  - `npm run lint` 통과.
  - `npx tsc --noEmit` 통과.$body$, 'published', '2026-04-13T00:00:00Z', false, true, false),
  ('배포_스크립트_추가', $title$배포 스크립트 추가$title$, $desc$배포 스크립트 추가 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 배포 스크립트 추가

## 목적
- 매번 수동으로 `npx vercel --prod --yes`를 입력하지 않도록 배포 명령을 npm script로 통일.

## 변경 사항
- `package.json` scripts에 아래 항목 추가:
  - `deploy`: `npx vercel --prod --yes`

## 사용 방법
- 프로덕션 배포:
  - `npm run deploy`$body$, 'published', '2026-04-13T00:00:00Z', false, true, false),
  ('v2_네이밍_주석_다국어_조회_정비', $title$v2 네이밍/주석/다국어 조회 정비$title$, $desc$v2 네이밍/주석/다국어 조회 정비 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# v2 네이밍/주석/다국어 조회 정비

## 오늘 작업 요약
- 구현 코드 핵심 함수 위주 한국어 주석 추가
- 타입 네이밍 정리
  - `types/contacts.ts`, `types/about.ts`, `types/home-slide.ts`, `types/content-locale.ts`
- 관리자 API 경로 정식화
  - `/api/admin/home-slide` 신설
  - `/api/admin/highlights`는 호환 alias 유지
- 도메인 함수명 정리(호환 alias 포함)
  - home: `*HomeSlide*`
  - contact: `*Contact*`
  - about: `*About*`
- 공개 다국어 조회 1차 반영
  - 블로그: locale 번역 우선 + KO fallback
  - 프로젝트: locale 번역 우선 + KO fallback

## 품질 확인
- `npm run -s lint` 통과
- `npx tsc --noEmit` 통과

## 메모
- 기존 호출부 회귀 방지를 위해 구 네이밍 alias는 임시 유지
- 다음 단계에서 관리자 locale 탭 UI와 번역 저장 UX를 확장 예정$body$, 'published', '2026-04-14T00:00:00Z', false, true, false),
  ('v2_1_로케일_테이블_전환_About_카테고리_탭_적용', $title$v2.1 로케일 테이블 전환 + About 카테고리 탭 적용$title$, $desc$서버 저장소/조회 로직을 실제 코드에 반영했습니다.$desc$, '/blog/default-thumbnail.svg', $body$# v2.1 로케일 테이블 전환 + About 카테고리 탭 적용

## 작업 목적

- v2.1 스키마 기준(`about locale row`, `about_tech_stack`, `posts_en/ja`, `projects_en/ja`)으로
  서버 저장소/조회 로직을 실제 코드에 반영했습니다.
- 관리자 About의 기술 항목을 카테고리 탭 기반으로 편집할 수 있게 확장했습니다.
- 공개 About 기술 스택 영역에 카테고리 탭을 추가하고, 항목 4개 초과 시 Swiper로 노출되도록 변경했습니다.

## 주요 변경

1. DB 마이그레이션 보강
- `supabase/v2/schema-v2.1.0.sql`
  - `is_admin_user()` 호환 함수 추가(`is_admin_email()` 래핑)

2. 저장소 전환
- `lib/profile/repository.ts`
  - `about_translations` 의존 제거
  - `about(locale row)` + `about_tech_stack` 조합 조회/저장으로 전환
  - KO 원본 + EN/JA 번역 맵 구조 유지
- `lib/blog/repository.ts`
  - `posts_translations` 제거
  - `posts_en`, `posts_ja` 조회/업서트로 전환
- `lib/projects/repository.ts`
  - `projects_translations` 제거
  - `projects_en`, `projects_ja` 조회/업서트로 전환

3. 관리자 About 입력 확장
- `components/admin/about/about-manager.tsx`
  - 기술 항목에 `category` 필드 추가
  - 카테고리 탭(자동 생성) + 카테고리별 드래그 정렬 적용
  - 저장 payload에 category 포함

4. About API 파서 정합화
- `app/api/admin/about/route.ts`
  - KO/EN/JA 기술 항목 파싱 시 `category` 필드 검증/정규화 추가

5. 공개 About UI 개선
- `components/about/interactive-about-reveal.tsx`
  - 기술 스택 카테고리 탭 추가
  - 카테고리 항목 수가 4개 초과일 때 Swiper 렌더 적용

## 검증 결과

- `npm run -s lint` 통과(기존 unused warning 1건만 유지)
- `npx tsc --noEmit` 통과
- `npm run -s build` 통과$body$, 'published', '2026-04-14T00:00:00Z', false, true, false),
  ('관리자_EN_JA_입력_확장_정비', $title$관리자 EN/JA 입력 확장 정비$title$, $desc$관리자 EN/JA 입력 확장 정비 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 관리자 EN/JA 입력 확장 정비

## 작업 목적
- 관리자에서 KO 기본 콘텐츠 외에 EN/JA 입력을 직접 저장하고 재수정할 수 있도록 정비.
- v2 SQL 적용 중 발생한 `is_admin_user()` 함수 오류를 스키마 기준에 맞게 정리.

## 적용 내용
- 블로그 관리자:
  - EN/JA 번역 탭(제목, 설명, 태그, 본문) 입력/저장/재조회 흐름 연결.
  - 폼 dirty 스냅샷 비교에 번역 데이터 포함.
- 프로젝트 관리자:
  - EN/JA 번역 탭(제목, 부제목, 태그, 프로젝트 내용) 입력 UI 추가.
  - 저장 payload에 `translations` 포함 및 편집 진입 시 번역 데이터 복원.
- 소개 관리자:
  - EN/JA 번역 탭(이름, 직함, 소개) 입력 UI 추가.
  - 저장 payload에 번역 데이터 포함, 저장 후 재조회 데이터로 상태 동기화.
- API/리포지토리:
  - posts/projects/about 관리자 API에서 EN/JA 번역 파싱 및 upsert 연결.
  - 번역 테이블(`posts_translations`, `projects_translations`, `about_translations`) 저장 로직 사용.
- SQL:
  - `supabase/v2/schema-v2.0.0.sql`의 정책 함수 참조를 `public.is_admin_email()` 기준으로 정리.

## 검증 결과
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
- `npm run -s build` 통과 (외부 네트워크 허용 환경에서 확인)

## 비고
- 번역 데이터가 비어 있으면 공개 페이지는 KO 기본 콘텐츠로 fallback.
- 현재 About 번역의 기술 항목(`aboutTechItems`)은 폼에서 별도 편집하지 않고 기본값(`[]`) 저장 정책으로 유지.$body$, 'published', '2026-04-14T00:00:00Z', false, true, false),
  ('관리자_KO_EN_JA_탭_입력_통일', $title$관리자 KO/EN/JA 탭 입력 통일$title$, $desc$관리자 KO/EN/JA 탭 입력 통일 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 관리자 KO/EN/JA 탭 입력 통일

## 작업 목표
- Blog / Projects / About 관리자 입력을 기존 섹션 내부에서 `KO | EN | JA` 탭 전환 방식으로 통일.
- KO는 기본 테이블, EN/JA는 번역 테이블 저장 정책 유지.
- About의 EN/JA 번역에서도 기술 항목(이름/설명/로고/순서) 편집 가능하도록 확장.

## 적용 내용
- 공통 로케일 탭 컴포넌트 추가:
  - `components/admin/common/locale-tabs.tsx`
  - 세 매니저가 동일한 탭 UI를 재사용하도록 정리.
- 블로그 관리자:
  - 제목/설명/태그/본문 입력을 탭 전환으로 통합.
  - 기존 EN/JA 별도 카드 제거.
- 프로젝트 관리자:
  - 제목/부제목/태그/프로젝트 내용을 탭 전환으로 통합.
  - 기존 EN/JA 별도 카드 제거.
  - KO 탭은 기존 `projects` 필드, EN/JA 탭은 `projects_translations` 필드로 저장.
- 소개 관리자:
  - 이름/직함/요약 + 기술 항목 리스트를 탭 전환으로 통합.
  - EN/JA 번역에 기술 항목 저장(`about_translations.about_tech_items`) 반영.
  - 기술 항목 추가/수정/삭제/드래그 정렬을 KO/EN/JA 각각 독립 유지.

## 검증
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
- `npm run -s build` 통과

## 비고
- EN/JA 번역 미입력 시 공개 페이지는 기존 정책대로 KO 콘텐츠 fallback.
- Contact/Home 탭은 이번 범위에서 다국어 탭 입력 대상 제외.$body$, 'published', '2026-04-14T00:00:00Z', false, true, false),
  ('도메인_별칭_불일치_원인_해결', $title$도메인 별칭 불일치 원인 해결$title$, $desc$`j-fe-blog.vercel.app`에는 반영되지 않는 현상이 발생했다.$desc$, '/blog/default-thumbnail.svg', $body$# 도메인 별칭 불일치 원인 해결

## 증상

- 동일 프로젝트에서 최신 배포 URL(`j-blog-8y50...`)은 변경사항이 보이는데,
  `j-fe-blog.vercel.app`에는 반영되지 않는 현상이 발생했다.

## 원인

- `j-fe-blog.vercel.app` alias가 최신 배포가 아니라 이전 배포를 가리키고 있었다.
- 이전에 처음 배포를 진행했던 도메인 `j-blog-two.vercel.app` alias가 current 배포를 가리키고 있었다는거다.
- 확인 결과:
  - 이전 source: `j-blog-hq17ubm8j-...`
  - 최신 source: `j-blog-8y50myy6u-...`
- 즉, 코드/DB 문제가 아니라 Vercel alias 포인터 불일치 문제였다.

## 조치

- alias 재지정 실행:
  - `npx vercel alias set j-blog-8y50myy6u-wogml3270s-projects.vercel.app j-fe-blog.vercel.app`
- 재확인:
  - `npx vercel alias ls`에서 `j-fe-blog.vercel.app` source가 최신 배포로 변경됨.

## 추가 조치 (2026-04-14)

- develop 브랜치 푸시 시 Preview 배포가 계속 생성되는 문제를 코드 설정으로 제한하기 위해
  프로젝트 루트에 `vercel.json`을 추가했다.
- 적용 값:
  - `git.deploymentEnabled.main = true`
  - `git.deploymentEnabled.develop = false`
- 목적:
  - main 운영 배포는 유지
  - develop 자동 배포는 차단

## 참고

- 배포 URL 자체(`https://j-blog-...vercel.app`)가 401로 보일 수 있는데, 이는 배포 보호 설정 영향일 수 있다.
- 운영 확인은 실제 서비스 도메인(`j-fe-blog.vercel.app`) 기준으로 검증한다.$body$, 'published', '2026-04-14T00:00:00Z', false, true, false),
  ('어바웃_기술스택_카테고리_enum_전환', $title$어바웃 기술스택 카테고리 enum 전환$title$, $desc$어바웃 기술스택 카테고리 enum 전환 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 어바웃 기술스택 카테고리 enum 전환

## 배경
- 기존 `about_tech_stack.category`를 자유 문자열로 저장하면서 카테고리 오탈자/중복(예: 프론트엔드, frontend, 프론트) 관리가 어려웠습니다.
- 카테고리 순서와 값이 고정되지 않아 UI 탭 렌더에서 일관성이 떨어졌고, 클라이언트 렌더 차이 가능성도 커졌습니다.

## 변경 내용
- 기술스택 카테고리를 고정 enum으로 정의했습니다.
- enum 값: `frontend`, `backend`, `database`, `infrastructure`, `version_control`, `other`
- 신규 유틸 추가: `lib/about/tech-categories.ts`
  - 카테고리 순서 상수
  - 로케일별 라벨 맵
  - 레거시 문자열 -> enum 정규화 함수
- 관리자 About UI를 자유입력에서 선택형으로 변경했습니다.
  - 항목 추가 카테고리 입력: `Input` -> `select`
  - 항목 수정 카테고리 입력: `Input` -> `select`
- 공개 About 탭도 고정 enum 순서 기반으로 렌더되도록 변경했습니다.

## DB 마이그레이션
- `supabase/v2/schema-v2.1.1.sql` 추가
  - `public.about_tech_category` enum 타입 생성
  - `about_tech_stack.category`를 enum으로 안전 전환
  - 기존 한글/영문 카테고리 값 매핑 로직 포함
  - 인덱스 재생성
  - `schema_migrations` 버전 기록 (`v2.1.1`)

## 검증
- `npm run -s lint` 통과 (기존 경고 1건 유지)
- `npx tsc --noEmit` 통과
- `npm run -s build` 통과

## 비고
- API/리포지토리에서도 카테고리를 정규화해 저장하므로, 구 데이터/외부 입력이 들어와도 enum 규칙으로 보정됩니다.$body$, 'published', '2026-04-14T00:00:00Z', false, true, false),
  ('프로젝트_EN_JA_성과_기여_입력_확장', $title$프로젝트 EN/JA 성과/기여 입력 확장$title$, $desc$1. 프로젝트 번역 타입 확장$desc$, '/blog/default-thumbnail.svg', $body$# 프로젝트 EN/JA 성과/기여 입력 확장

## 작업 목적
- 관리자 프로젝트 탭에서 KO뿐 아니라 EN/JA에서도 `성과`, `주요 기여`를 입력/정렬/저장할 수 있도록 확장.

## 변경 내용
1. 프로젝트 번역 타입 확장
- `types/projects.ts`
- `ProjectTranslationInput`에 아래 필드 추가
  - `achievements: string[]`
  - `contributions: string[]`

2. 관리자 API 번역 파서 확장
- `app/api/admin/projects/route.ts`
- `app/api/admin/projects/[id]/route.ts`
- `parseTranslations()`에서 EN/JA 번역 payload에 아래 배열 필드 파싱 추가
  - `achievements`
  - `contributions`

3. 프로젝트 저장소 번역 매핑/저장 확장
- `lib/projects/repository.ts`
- `projects_translations` 조회 select 필드에 `achievements`, `contributions` 추가
- `toProjectTranslationInput()`에 성과/기여 매핑 추가
- `applyProjectTranslation()`에서 locale별 성과/기여 우선 적용(fallback은 KO 원문)
- `upsertProjectTranslations()`에서 성과/기여 배열 저장 추가

4. 관리자 프로젝트 UI locale 탭 입력 확장
- `components/admin/projects/projects-manager.tsx`
- EN/JA 번역 상태에 성과/기여 리스트 + 입력값 상태 추가
- KO/EN/JA 공통으로 성과/기여 섹션이 동작하도록 locale-aware 핸들러 적용
  - 추가
  - 삭제
  - 드래그 정렬
- 저장 payload(`translations`)에 EN/JA 성과/기여 포함

5. DB 증분 마이그레이션 추가
- `supabase/v2/schema-v2.0.1.sql`
- `projects_translations` 테이블에 컬럼 추가
  - `achievements text[] not null default '{}'::text[]`
  - `contributions text[] not null default '{}'::text[]`
- `schema_migrations`에 `v2.0.1` 기록

## 적용 순서
1. Supabase SQL Editor에서 `supabase/v2/schema-v2.0.1.sql` 실행
2. 관리자 `/admin/projects`에서 EN/JA 탭으로 성과/기여 입력 및 저장 확인
3. 공개 프로젝트 페이지 locale 전환 시 성과/기여 번역 반영 확인$body$, 'published', '2026-04-14T00:00:00Z', false, true, false),
  ('sitemap_prerender_동적_충돌_해결', $title$sitemap prerender 동적 충돌 해결$title$, $desc$1. 정적 라우트 생성$desc$, '/blog/default-thumbnail.svg', $body$# sitemap prerender 동적 충돌 해결

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
- 1시간 단위 재검증으로 최신성 확보$body$, 'published', '2026-04-17T00:00:00Z', false, true, false),
  ('Vercel_별칭_자동_최신화_파이프라인_고정', $title$Vercel 별칭 자동 최신화 파이프라인 고정$title$, $desc$모두 동일 최신 배포를 가리키도록 복구됨$desc$, '/blog/default-thumbnail.svg', $body$# Vercel 별칭 자동 최신화 파이프라인 고정

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
- `npx vercel alias ls`에서 `j-fe-blog.vercel.app`이 최신 배포 source로 연결된 것을 확인$body$, 'published', '2026-04-17T00:00:00Z', false, true, false),
  ('문서_기반_블로그_실데이터_리시드_v2_1_3', $title$문서 기반 블로그 실데이터 리시드 (v2.1.3)$title$, $desc$긴 마크다운/개행/특수문자에서도 SQL Editor 붙여넣기 안정성을 높임.$desc$, '/blog/default-thumbnail.svg', $body$# 문서 기반 블로그 실데이터 리시드 (v2.1.3)

## 작업 목적
- `docs/worklogs`, `docs/refector`의 마크다운을 블로그 실데이터로 일괄 전환
- 기존 더미 블로그 데이터(`posts`, `posts_en`, `posts_ja`, 태그 매핑) 전체 교체
- Supabase SQL Editor에 바로 붙여넣어 실행 가능한 단일 SQL 산출

## 반영 내용
- 생성 스크립트 추가:
  - `scripts/generate-docs-blog-reseed-sql.mjs`
- 실행 스크립트 추가:
  - `package.json` -> `npm run generate:docs-blog-sql`
- 산출 SQL 생성:
  - `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`

## 생성 규칙
- 소스 파일: `docs/worklogs/**/*.md`, `docs/refector/**/*.md`
- 제목: 첫 `#` 헤더 우선, 없으면 파일명
- 슬러그: `YYYY_MM_DD_파일명정규화` (중복 시 suffix)
- 설명: 본문 첫 의미 문단 요약
- 태그: `worklog|refactor`, 날짜 태그, 파일명 토큰
- 상태: 전부 `published`, `featured=false`, 썸네일 기본값 사용

## SQL 구성
- 트랜잭션(`begin/commit`) 단위
- 삭제 순서:
  - `post_tag_map` -> `posts_en` -> `posts_ja` -> `posts` -> `post_tags`
- 재삽입:
  - `posts`
  - `post_tags` upsert
  - `post_tag_map` 재생성
  - `posts_en`, `posts_ja` upsert
- 마이그레이션 기록:
  - `schema_migrations`에 `v2.1.3` insert (중복 방지)

## 안전성 보강
- 본문/제목/설명은 달러쿼트(`$tag$...$tag$`) 방식으로 출력해
  긴 마크다운/개행/특수문자에서도 SQL Editor 붙여넣기 안정성을 높임.

## 실행 방법
```bash
npm run generate:docs-blog-sql
```
- 생성 파일: `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`
- Supabase SQL Editor에서 전체 실행

## 검증 체크리스트
- `posts` 건수와 문서 파일 수 일치
- `posts_en`, `posts_ja`가 `posts`와 1:1 매핑
- 블로그 목록/상세/언어 전환 정상
- 검색(`q`) 동작 정상$body$, 'published', '2026-04-17T00:00:00Z', false, true, false),
  ('블로그_DB_장애_안내_전환', $title$블로그 DB 장애 안내 전환$title$, $desc$블로그 DB 장애 안내 전환 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 블로그 DB 장애 안내 전환

## 변경 목적
- 블로그 데이터 소스에서 MDX fallback을 제거하고, DB 장애 시 사용자에게 명시적으로 안내하도록 전환.

## 적용 내용
- `lib/blog/repository.ts`
  - `lib/blog/registry` 기반 fallback 로직 제거
  - `BlogServiceUnavailableError` 추가
  - Supabase 서비스 미구성/조회 실패 시 즉시 장애 에러 throw
- `app/[lang]/(site)/blog/error.tsx`
  - 블로그 세그먼트 전용 에러 UI 추가
  - KO/EN/JA 메시지 + 재시도 버튼 제공
- `app/[lang]/(site)/blog/[slug]/page.tsx`
  - 상세 메타 생성에서 DB 오류 시 기본 메타로 fallback 처리
  - 본문 렌더를 DB markdown 단일 경로로 통일

## 검증
- `npm run -s lint` 통과(기존 경고 1건 유지)
- `npx tsc --noEmit` 통과$body$, 'published', '2026-04-17T00:00:00Z', false, true, false),
  ('블로그_리시드_품질_재구축_v2_1_3', $title$블로그 리시드 품질 재구축 (v2.1.3)$title$, $desc$node scripts/generate-docs-blog-reseed-sql.mjs --bootstrap-translations$desc$, '/blog/default-thumbnail.svg', $body$# 블로그 리시드 품질 재구축 (v2.1.3)

## 목적
- docs 기반 블로그 리시드 데이터의 품질 문제(슬러그/태그/EN·JA 번역)를 전면 개선
- SQL 생성 전 검증 단계에서 누락/품질 이슈를 즉시 차단

## 반영 내용

### 1) 생성 파이프라인 재설계
- 파일: `scripts/generate-docs-blog-reseed-sql.mjs`
- 2단계로 분리:
  - docs 파싱(제목/설명/본문/날짜)
  - 품질 보정/검증(슬러그/태그/번역)
- SQL 출력 파일 유지:
  - `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`

### 2) 슬러그 정책 변경
- 기존 `uXXXX` 형태 제거
- 관리자 규칙과 동일하게 제목 기반 `_` 포맷 사용
  - 공백/구분자 -> `_`
  - 한글/영문/숫자/`_` 허용
  - 중복 시 `_2`, `_3` suffix
- 날짜 prefix 제거

### 3) 태그 정책 변경
- 고정 택소노미 도입:
  - `i18n`, `seo`, `supabase`, `vercel`, `admin`, `ui-ux`, `animation`, `refactor`, `database`, `auth`, `deployment`, `performance`, `bugfix`, `monitoring`, `workflow`
- 포스트별 자동 선별 + 수동 오버라이드 병합
- 검증:
  - KO 태그 3~6개 강제
  - 택소노미 외 태그 허용 안 함

### 4) EN/JA 완전 번역 데이터 소스 도입
- 신규 파일:
  - `data/blog-seed-translations.en.json`
  - `data/blog-seed-translations.ja.json`
  - `data/blog-seed-tag-overrides.json`
- 번역 검증:
  - KO slug 기준 EN/JA 1:1 존재 필수
  - title/description/bodyMarkdown 필수
  - 본문 최소 길이 검증
  - KO 본문과 완전 동일한 번역 금지
  - locale별 태그 3~6개 및 허용 태그 검증

### 5) SQL 재생성 정책
- 블로그 관련 데이터 전체 교체 유지:
  - `post_tag_map -> posts_en -> posts_ja -> posts -> post_tags`
- `schema_migrations`는 `v2.1.3` 유지, description만 최신화 가능하도록 처리

## 실행 방법
- 번역 소스 초기 생성(부트스트랩):
```bash
node scripts/generate-docs-blog-reseed-sql.mjs --bootstrap-translations
```
- SQL 생성:
```bash
npm run generate:docs-blog-sql
```

## 검증 결과
- 생성 건수: 55 posts
- `uXXXX` 패턴 슬러그: 0건
- `npm run lint`: 통과(기존 warning 1건 유지)
- `npx tsc --noEmit`: 통과$body$, 'published', '2026-04-17T00:00:00Z', false, true, false),
  ('블로그_프로젝트_검색_공통화_스켈레톤_통일', $title$블로그/프로젝트 검색 공통화 + 스켈레톤 통일$title$, $desc$1. 공통 검색 유틸 추가$desc$, '/blog/default-thumbnail.svg', $body$# 블로그/프로젝트 검색 공통화 + 스켈레톤 통일

## 작업 요약
- 블로그/프로젝트 목록 검색 기능을 동일한 UX/구조로 통일
- 검색 UI를 공통 컴포넌트로 분리
- 블로그/프로젝트 로딩 스켈레톤을 동일한 공통 컴포넌트로 통일

## 구현 내용
1. 공통 검색 유틸 추가
- 파일: `lib/utils/content-search.ts`
- `normalizeContentSearchQuery`, `matchesContentSearchQuery` 추가
- title/description/tags 등 다중 필드 검색 로직을 공통 처리

2. 공통 검색 툴바 컴포넌트 추가
- 파일: `components/ui/content-search-toolbar.tsx`
- URL 쿼리스트링 `q`를 단일 소스로 사용하는 검색/초기화 UI
- 블로그/프로젝트 양쪽에서 동일 렌더링

3. 블로그 목록 검색 적용
- 파일: `app/[lang]/(site)/blog/page.tsx`
- `searchParams.q` 파싱 후 목록 필터링
- 검색 툴바 연결
- 결과 없음 UI 추가

4. 프로젝트 목록 검색 적용
- 파일: `app/[lang]/(site)/projects/page.tsx`
- `searchParams.q` 파싱 후 목록 필터링
- 검색 툴바 연결
- 결과 없음 UI 추가

5. 공통 스켈레톤 컴포넌트 추가/적용
- 추가: `components/ui/content-list-loading-skeleton.tsx`
- 변경:
  - `app/[lang]/(site)/blog/loading.tsx`
  - `app/[lang]/(site)/projects/loading.tsx`
- 두 페이지 모두 동일한 스켈레톤 구조 사용

6. i18n 키 확장
- 블로그/프로젝트 locale json에 검색 키 추가
  - `searchPlaceholder`
  - `searchButton`
  - `searchReset`
  - `searchNoResult`

## 검증
- `npm run -s lint`: 통과 (기존 warning 1건 유지)
- `npx tsc --noEmit`: 통과

## 메모
- 기존 `filterPlaceholder/filterButton` 키는 제거하고 검색 키로 대체
- 검색은 서버 목록 데이터를 기준으로 필드 매칭하는 방식으로 통일$body$, 'published', '2026-04-17T00:00:00Z', false, true, false),
  ('블로그_프로젝트_공개_페이지네이션_8개_적용', $title$블로그/프로젝트 공개 페이지네이션 8개 적용$title$, $desc$블로그/프로젝트 공개 페이지네이션 8개 적용 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 블로그/프로젝트 공개 페이지네이션 8개 적용

## 목표
- 공개 `blog`, `projects` 목록의 기본 노출 개수를 8개로 고정
- 검색(`q`)과 페이지네이션(`page`)을 함께 사용 가능한 구조로 정리
- 중복 구현을 줄이기 위해 공통 페이지네이션 컴포넌트로 통일

## 변경 사항

### 1) 공개 페이지네이션 공통 기준 추가
- `lib/utils/pagination.ts`
  - `PUBLIC_CONTENT_PAGE_SIZE = 8` 추가
  - `normalizePublicPage` 추가

### 2) 검색 시 페이지 초기화
- `components/ui/content-search-toolbar.tsx`
  - 검색/초기화 시 `page` 쿼리를 제거하도록 변경
  - 검색어 변경 후 페이지가 꼬이지 않도록 1페이지 리셋

### 3) 공통 페이지네이션 컴포넌트 추가
- `components/ui/content-pagination.tsx` (신규)
  - 숫자형 페이지네이션(ellipsis 포함)
  - 기존 쿼리(`q`) 유지 + `page`만 갱신
  - `blog`, `projects`에서 공통 사용

### 4) 블로그 목록 페이지 반영
- `app/[lang]/(site)/blog/page.tsx`
  - 검색 결과를 8개 단위로 slice
  - `page` 쿼리 기반 현재 페이지 계산/클램핑
  - 하단에 공통 페이지네이션 렌더

### 5) 프로젝트 목록 페이지 반영
- `app/[lang]/(site)/projects/page.tsx`
  - 검색 결과를 8개 단위로 slice
  - `page` 쿼리 기반 현재 페이지 계산/클램핑
  - 하단에 공통 페이지네이션 렌더

### 6) i18n 텍스트 추가
- `locales/{ko,en,ja}/blog.json`
- `locales/{ko,en,ja}/projects.json`
  - `paginationPrevious`
  - `paginationNext`
  - `paginationSummary`

## 검증
- `npm run lint`: 통과(기존 경고 1건 유지)
- `npx tsc --noEmit`: 통과

## 비고
- 현재 구현은 검색 결과를 서버에서 모두 받아온 뒤 페이지 단위로 화면 분할합니다.
- 데이터가 더 커지면 다음 단계에서 서버 쿼리 레벨 페이지네이션으로 확장 가능합니다.$body$, 'published', '2026-04-17T00:00:00Z', false, true, false),
  ('프로젝트_DB_장애_안내_전환_및_MDX_제거', $title$프로젝트 DB 장애 안내 전환 및 MDX 제거$title$, $desc$프로젝트 DB 장애 안내 전환 및 MDX 제거 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 프로젝트 DB 장애 안내 전환 및 MDX 제거

## 작업 목적
- 프로젝트 페이지도 블로그와 동일하게 DB 장애 시 사용자 안내 화면을 노출하도록 통일
- 더 이상 사용하지 않는 MDX 파일/설정/의존성 제거

## 적용 내용
- 프로젝트 저장소 fallback 제거
  - `lib/projects/repository.ts`
  - `ProjectServiceUnavailableError` 추가
  - `getAllPublishedProjects`, `getFeaturedProjects`, `getPublishedProjectBySlug`에서 DB 실패 시 예외 throw
- 프로젝트 라우트 에러 경계 추가
  - `app/[lang]/(site)/projects/error.tsx` 신설
  - KO/EN/JA 문구 + 다시 시도 버튼 구성
- 프로젝트 상세 메타데이터 안정화
  - `app/[lang]/(site)/projects/[slug]/page.tsx`
  - `generateMetadata`에서 DB 오류 시 기본 메타로 fallback

- MDX 정리
  - 삭제: `lib/blog/registry.ts`
  - 삭제: `content/blog/*.mdx`
  - 삭제: `mdx-components.tsx`, `mdx.d.ts`
  - 변경: `next.config.ts`에서 `@next/mdx` 제거, `pageExtensions`에서 `mdx` 제거
  - 변경: `types/blog.ts`에서 MDX 전용 타입(`BlogRegistryItem`, `Component`) 제거
  - 변경: `scripts/seed-supabase.mjs`의 MDX 파일 파싱/시드 로직 제거

- 패키지 의존성 정리
  - 제거: `@mdx-js/loader`, `@mdx-js/react`, `@next/mdx`, `@types/mdx`
  - 반영 파일: `package.json`, `package-lock.json`

## 검증 결과
- `npm run -s lint`: 통과 (기존 warning 1건 유지)
- `npx tsc --noEmit`: 통과
- `npm run -s build`: 실패
  - 사유: 네트워크 제한 환경에서 Google Fonts DNS 조회 실패(`fonts.googleapis.com`)

## 메모
- 현재 코드 기준으로 MDX 런타임/빌드 경로 의존성은 제거됨
- 문서(README/과거 worklog)에 남아 있는 MDX 언급은 히스토리 설명 용도로만 남아 있음$body$, 'published', '2026-04-17T00:00:00Z', false, true, false),
  ('리팩토링_2차_정리', $title$리팩토링 2차 정리$title$, $desc$1. `ManagerListRow` 파일 통합$desc$, '/blog/default-thumbnail.svg', $body$# 작업 일지 - 2026-04-08 (리팩토링 2차 정리)

## 목표

- 불필요하게 잘게 분리된 컴포넌트를 줄이고, 공통화는 유지하면서 유지보수 포인트를 축소한다.

## 변경 내용

1. `ManagerListRow` 파일 통합

- 기존: `components/admin/manager-list-row.tsx` 별도 파일
- 변경: `components/admin/manager-list.tsx` 내부로 `ManagerListRow`를 통합 export
- 효과: 관리자 리스트 관련 파일을 한 곳에서 확인 가능

2. 미세 중복 제거 (쿼리 파싱)

- `app/admin/(protected)/blog/page.tsx`
- `app/admin/(protected)/projects/page.tsx`
- `app/admin/(protected)/contact/page.tsx`
- 위 3곳의 `id` 쿼리 파싱 중복 함수를 제거하고 `lib/utils/search-params.ts`의 `pickSingleQueryValue`로 통합

3. 파일 삭제

- `components/admin/manager-list-row.tsx` 삭제

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 메모

- 현재 `components/` 기준으로 미사용 컴포넌트는 없음(참조 스캔 확인).
- 다음 단계는 “파일 수 감소”보다 “역할 경계 명확화(Manager 단위 상태/폼 로직 분리)”가 효율적일 가능성이 높음.$body$, 'published', '2026-04-08T00:00:00Z', false, true, false),
  ('유지보수성_공통_ui', $title$유지보수성 공통 ui$title$, $desc$적용:$desc$, '/blog/default-thumbnail.svg', $body$# 작업일지 (2026-04-08)

## 목표

- 기능 변경 없이 유지보수성 개선
- 핵심 로직 주석 정책 문서화
- 관리자/공개 UI의 중복 레이아웃 공통화
- 미사용 레거시 파일 정리

## 주요 작업

### 1) 주석 정책 문서 추가

- 파일: `docs/refector/2026-04-08/리팩터링-주석-가이드.md`
- 한국어 기준의 핵심 로직 주석 대상과 작성 규칙을 정의

### 2) 관리자 공통 UI 컴포넌트 추가

- `components/admin/manager-shell.tsx`
- `components/admin/manager-list.tsx`
- `components/admin/manager-list-row.tsx`
- `components/admin/status-radio-group.tsx`
- `components/ui/surface-card.tsx`

적용:

- `home-manager`, `about-manager`, `posts-manager`, `projects-manager`, `contact-manager`
- 상단 요약 헤더, 리스트 컨테이너, 리스트 행, 상태 라디오 UI를 공통 컴포넌트로 통합

### 3) 공개 페이지 공통 UI 컴포넌트 추가

- `components/ui/content-list-layout.tsx`
- `components/ui/media-card.tsx`

적용:

- `components/blog/card.tsx`
- `components/project/card.tsx`
- `app/[lang]/(site)/blog/page.tsx`
- `app/[lang]/(site)/projects/page.tsx`

### 4) 레거시 코드 정리

- 미사용 파일 삭제: `components/admin/profile-manager.tsx`

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 비고

- MDX/Supabase 혼용 구조 및 API/DB 스키마는 변경하지 않음.$body$, 'published', '2026-04-08T00:00:00Z', false, true, false),
  ('리팩토링_주석_가이드', $title$리팩토링 주석 가이드$title$, $desc$리팩토링 주석 가이드 작업 내용을 정리한 기록입니다.$desc$, '/blog/default-thumbnail.svg', $body$# 리팩토링 주석 가이드

## 목적

- 구현 나열이 아니라 **의도/이유**를 빠르게 전달해 유지보수 시간을 줄입니다.

## 적용 대상

- `export` 함수
- 비동기 핸들러(`fetch`, mutation, 저장/삭제)
- 파서/정규화 함수
- 상태 전환 로직(`dirty`, open/close, sync)
- 복합 조건 분기
- `useEffect` 부작용 블록

## 작성 규칙

- 함수/블록 **바로 위 한 줄 `//`** 로 작성
- 한국어로 작성
- “무엇을 한다”보다 “왜 이렇게 처리하는지”를 우선
- 한 함수에 주석 과다 작성 금지(핵심 분기만)

## 예시

- 좋은 예: `// 저장 직후 서버 정렬(updated_at)을 기준으로 목록을 다시 동기화한다.`
- 피해야 할 예: `// setState를 호출한다.`$body$, 'published', '2026-04-08T00:00:00Z', false, true, false),
  ('v2_네이밍_매핑_및_번역_규칙', $title$v2 네이밍 매핑 및 번역 규칙$title$, $desc$`post_tag_map`은 게시글(`posts`)과 태그(`post_tags`)를 연결하는 다대다 매핑 테이블이다.$desc$, '/blog/default-thumbnail.svg', $body$# v2 네이밍 매핑 및 번역 규칙

## 1) 테이블 네이밍 매핑
- `admin_allowlist` -> 유지
- `comments` -> 유지
- `contact_messages` -> `contacts`
- `home_highlights` -> `home_slide`
- `post_tag_map` -> 유지
- `post_tags` -> 유지
- `posts` -> 유지
- `profile_content` -> `about`
- `projects` -> 유지

## 2) `post_tag_map` 역할
`post_tag_map`은 게시글(`posts`)과 태그(`post_tags`)를 연결하는 다대다 매핑 테이블이다.
- 게시글 하나에 여러 태그를 붙일 수 있고
- 같은 태그를 여러 게시글에서 재사용할 수 있도록 정규화한다.

## 3) 번역 테이블 규칙
- `posts_translations(post_id, locale, title, description, body_markdown, tags)`
- `projects_translations(project_id, locale, title, subtitle, content_markdown, tags)`
- `about_translations(about_id, locale, name, title, summary, about_tech_items)`

공통 규칙:
- `locale`은 `ko | en | ja`
- `(parent_id, locale)` unique
- 발행 제어는 기본 테이블(`posts`, `projects`)의 `status`만 사용
- 번역 누락 시 KO 원문 fallback

## 4) 공개 조회 우선순위
1. 현재 locale 번역 데이터
2. KO 기본 데이터 fallback

## 5) 관리자 코드 네이밍 원칙
- `Highlight` -> `HomeSlide`
- `ProfileContent` -> `About`
- `ContactMessage` -> `Contact`

기존 이름은 회귀 방지를 위해 alias를 한 버전 유지하고, 신규 코드는 새 이름을 사용한다.$body$, 'published', '2026-04-14T00:00:00Z', false, true, false)
  returning id, slug
)
insert into public.post_tags (name)
values
  ('workflow'),
  ('ui-ux'),
  ('animation'),
  ('seo'),
  ('bugfix'),
  ('monitoring'),
  ('i18n'),
  ('admin'),
  ('supabase'),
  ('database'),
  ('auth'),
  ('refactor'),
  ('deployment'),
  ('performance'),
  ('vercel')
on conflict (name) do nothing;

with seeded_posts as (
  select id, slug
  from public.posts
)
insert into public.post_tag_map (post_id, tag_id)
select
  p.id as post_id,
  t.id as tag_id
from seeded_posts p
join (
  values
  ('테마_스무딩_KO_EN_JA_i18n', ARRAY['workflow', 'ui-ux', 'animation', 'seo', 'bugfix', 'monitoring']::text[]),
  ('오버레이_애니메이션_로케일_JSON', ARRAY['workflow', 'ui-ux', 'animation', 'monitoring', 'i18n']::text[]),
  ('Admin_CMS_Supabase_v1', ARRAY['workflow', 'admin', 'supabase', 'database', 'auth', 'ui-ux']::text[]),
  ('ui_여백_인증_댓글', ARRAY['workflow', 'refactor', 'admin', 'auth', 'ui-ux', 'bugfix']::text[]),
  ('Admin_IA_5탭_Contact_FAB_Home_About_분리', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('Dashboard_canonical_Blog_썸네일_Home_Swiper', ARRAY['workflow', 'admin', 'ui-ux', 'seo', 'monitoring']::text[]),
  ('관리자_반응형_레이아웃_튜닝', ARRAY['workflow', 'admin', 'ui-ux', 'monitoring']::text[]),
  ('Admin_인라인_편집_About_KO_DB_Projects_DnD', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('대시보드_재구성_썸네일_업로드_2방식', ARRAY['workflow', 'admin', 'supabase', 'database', 'auth', 'ui-ux']::text[]),
  ('댓글_공개_로그인_관리자_UX_정리', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'auth', 'ui-ux']::text[]),
  ('문의_FAB_개선_관리자_대시보드_정리', ARRAY['workflow', 'refactor', 'admin', 'database', 'monitoring']::text[]),
  ('문의_관리자_메모_라디오', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('관리자_페이지네이션_주스탄드_타입_v1_0_5', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'auth']::text[]),
  ('readingTime_제거_Admin_구조_재편_Markdown_에디터', ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'seo']::text[]),
  ('홈_소개_리뉴얼_1차', ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'deployment']::text[]),
  ('About_클릭_리빌_인터랙션_모바일_반응형', ARRAY['workflow', 'ui-ux', 'animation', 'monitoring']::text[]),
  ('About_페이지_리뉴얼_반응형_인터랙션', ARRAY['workflow', 'refactor', 'ui-ux', 'animation', 'monitoring', 'i18n']::text[]),
  ('Vercel_1차_프로덕션_배포_Production_only', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'auth', 'deployment']::text[]),
  ('관리자_안정화_예약_발행_에디터_고정_v1_0_12', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('관리자_위치_변경_드래그_통일', ARRAY['workflow', 'admin', 'ui-ux', 'monitoring']::text[]),
  ('기술스택_순서_이동_한_줄_레이아웃_정리', ARRAY['workflow', 'refactor', 'admin', 'ui-ux', 'monitoring']::text[]),
  ('소개_단순화_리뉴얼_v1_0_13', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('소셜_아바타_next_image_에러_해결', ARRAY['workflow', 'admin', 'auth', 'performance', 'bugfix', 'monitoring']::text[]),
  ('수파베이스_스토리지_업로드_정비', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('슬러그_중복_안내_About_SVG_업로드_개선', ARRAY['workflow', 'refactor', 'admin', 'database', 'ui-ux', 'bugfix']::text[]),
  ('프로젝트_요약_분리_슬러그_동기화_저장', ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'monitoring']::text[]),
  ('하이드레이션_안정화_기술스택_세로_정렬_수정_기능', ARRAY['workflow', 'refactor', 'admin', 'ui-ux', 'performance', 'monitoring']::text[]),
  ('홈_탭_단순화_프로젝트_입력_라벨_정리_v1_0_11', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'auth']::text[]),
  ('About_데스크탑_자동_리빌_1차', ARRAY['workflow', 'refactor', 'monitoring']::text[]),
  ('About_디바이스_훅_분리_모바일_프로필_상단_고정', ARRAY['workflow', 'refactor', 'ui-ux', 'monitoring']::text[]),
  ('공개_리스트_스켈레톤_순차_모션_적용', ARRAY['workflow', 'animation', 'monitoring']::text[]),
  ('v1_0_14_관리자_UX_정비_About_상태_제거', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('관리자_헤더_매니저_구조_리팩터링', ARRAY['workflow', 'refactor', 'admin', 'ui-ux', 'monitoring']::text[]),
  ('대시보드_홈_네이밍_통일', ARRAY['workflow', 'refactor', 'admin', 'ui-ux', 'deployment', 'monitoring']::text[]),
  ('더미데이터_정리_최종_스키마_정리_v1_0_15', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'deployment']::text[]),
  ('로컬_수정_프로덕션_캐시_동기화', ARRAY['workflow', 'admin', 'supabase', 'database', 'auth', 'deployment']::text[]),
  ('배포_스크립트_추가', ARRAY['workflow', 'deployment', 'vercel', 'monitoring']::text[]),
  ('v2_네이밍_주석_다국어_조회_정비', ARRAY['workflow', 'refactor', 'admin', 'ui-ux', 'vercel', 'monitoring']::text[]),
  ('v2_1_로케일_테이블_전환_About_카테고리_탭_적용', ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'monitoring']::text[]),
  ('관리자_EN_JA_입력_확장_정비', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('관리자_KO_EN_JA_탭_입력_통일', ARRAY['workflow', 'refactor', 'admin', 'database', 'ui-ux', 'monitoring']::text[]),
  ('도메인_별칭_불일치_원인_해결', ARRAY['workflow', 'database', 'deployment', 'vercel', 'bugfix', 'monitoring']::text[]),
  ('어바웃_기술스택_카테고리_enum_전환', ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'monitoring']::text[]),
  ('프로젝트_EN_JA_성과_기여_입력_확장', ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'monitoring']::text[]),
  ('sitemap_prerender_동적_충돌_해결', ARRAY['workflow', 'supabase', 'database', 'seo', 'performance', 'bugfix']::text[]),
  ('Vercel_별칭_자동_최신화_파이프라인_고정', ARRAY['workflow', 'deployment', 'vercel', 'monitoring']::text[]),
  ('문서_기반_블로그_실데이터_리시드_v2_1_3', ARRAY['workflow', 'refactor', 'supabase', 'database', 'bugfix', 'monitoring']::text[]),
  ('블로그_DB_장애_안내_전환', ARRAY['workflow', 'supabase', 'database', 'ui-ux', 'bugfix', 'monitoring']::text[]),
  ('블로그_리시드_품질_재구축_v2_1_3', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'auth']::text[]),
  ('블로그_프로젝트_검색_공통화_스켈레톤_통일', ARRAY['workflow', 'ui-ux', 'monitoring', 'i18n']::text[]),
  ('블로그_프로젝트_공개_페이지네이션_8개_적용', ARRAY['workflow', 'refactor', 'ui-ux', 'monitoring', 'i18n']::text[]),
  ('프로젝트_DB_장애_안내_전환_및_MDX_제거', ARRAY['workflow', 'refactor', 'supabase', 'database', 'ui-ux', 'seo']::text[]),
  ('리팩토링_2차_정리', ARRAY['refactor', 'admin', 'ui-ux', 'monitoring']::text[]),
  ('유지보수성_공통_ui', ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('리팩토링_주석_가이드', ARRAY['refactor', 'monitoring', 'workflow']::text[]),
  ('v2_네이밍_매핑_및_번역_규칙', ARRAY['refactor', 'admin', 'database', 'vercel', 'monitoring', 'i18n']::text[])
) as src(slug, tags) on src.slug = p.slug
join lateral unnest(src.tags) as tag_name(name) on true
join public.post_tags t on t.name = tag_name.name
on conflict (post_id, tag_id) do nothing;

with seeded_posts as (
  select id, slug
  from public.posts
)
insert into public.posts_en (
  post_id,
  title,
  description,
  body_markdown,
  tags
)
select
  p.id,
  src.title,
  src.description,
  src.body_markdown,
  src.tags
from seeded_posts p
join (
  values
  ('테마_스무딩_KO_EN_JA_i18n', $en_title$Theme 스무딩 + KO/EN/JA i18n$en_title$, $en_desc$Theme 스무딩 + KO/EN/JA i18n work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Theme 스무딩 + KO/EN/JA i18n

## Overview
Theme 스무딩 + KO/EN/JA i18n work details을 Cleanup한 기록입니다.

## Key Updates
- 중단된 턴 이후 저장소 Status를 점검했습니다.
- `lib/i18n/config.ts` 무결성을 확인했습니다.
- `npm run lint`를 실행해 정상 통과를 확인했습니다.
- 로케일 prefix 라우팅(`/ko`, `/en`, `/ja`)을 Implement했습니다.
- Default `light` criteria의 부드러운 Theme 전환을 Apply했습니다.
- UI/메타데이터/핵심 콘텐츠 번역과 로케일 SEO alternates를 반영했습니다.
- 로케일 기본 모듈 Add:
- `lib/i18n/config.ts`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업일지 - 2026-04-06 (테마 스무딩 + KO/EN/JA i18n)

## 1) 복구 점검

- 중단된 턴 이후 저장소 상태를 점검했습니다.
- `lib/i18n/config.ts` 무결성을 확인했습니다.
- `npm run lint`를 실행해 정상 통과를 확인했습니다.

## 2) 진행 항목

- 로케일 prefix 라우팅(`/ko`, `/en`, `/ja`)을 구현했습니다.
- 기본값 `light` 기준의 부드러운 테마 전환을 적용했습니다.
- UI/메타데이터/핵심 콘텐츠 번역과 로케일 SEO alternates를 반영했습니다.

## 3) 완료된 변경 사항

- 로케일 기본 모듈 추가:
  - `lib/i18n/config.ts`
  - `lib/i18n/dictionary.ts`
  - `lib/seo/metadata.ts`
- 앱 라우팅을 로케일 prefix 구조로 마이그레이션:
  - `app/[lang]/(site)/*`
  - `app/[lang]/layout.tsx`
  - `app/[lang]/not-found.tsx`
  - `app/page.tsx`에서 기본 로케일 경로로 리다이렉트
  - `proxy.ts`에서 non-prefix 경로를 `/ko/*`로 리다이렉트
- 헤더/푸터/홈/블로그/프로젝트 전반에 로케일 인지 링크 및 라벨을 적용했습니다.
- 헤더 데스크톱/모바일에 언어 스위처(KO/EN/JA)를 추가했습니다.
- 테마 스무딩 동작을 구현했습니다:
  - 기본 테마 `light`
  - 사용자 토글 시에만 부드러운 전환 활성화
  - `data-theme-transition` 기반 전역 CSS 전환 레이어 적용
- 로케일별 타이포 전략을 적용했습니다:
  - KO: Noto Sans KR
  - EN: Plus Jakarta Sans
  - JA: Noto Sans JP
  - 코드: JetBrains Mono
- 로케일 SEO 메타 유틸리티 및 sitemap alternates를 추가했습니다.
- 핵심 프로필/프로젝트 콘텐츠(UI + 메타데이터 + 주요 설명)를 로케일화했습니다.

## 4) 검증

- `npm run lint`: 통과
- `npm run build`: 샌드박스 환경의 기존/정체된 빌드 프로세스와 Turbopack 제약으로 실행 불가$en_body$, ARRAY['workflow', 'ui-ux', 'animation', 'seo', 'bugfix', 'monitoring']::text[]),
  ('오버레이_애니메이션_로케일_JSON', $en_title$오버레이 + 애니메이션 + 로케일 JSON$en_title$, $en_desc$오버레이 + 애니메이션 + 로케일 JSON work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# 오버레이 + 애니메이션 + 로케일 JSON

## Overview
오버레이 + 애니메이션 + 로케일 JSON work details을 Cleanup한 기록입니다.

## Key Updates
- 모바일 메뉴가 열렸을 때 헤더를 포함한 전체 화면이 블러 처리되도록 dim/blur 오버레이의 z-index를 상향했습니다.
- 사이드 패널은 오버레이 위에 유지되도록 더 높은 z-layer로 설정했습니다.
- 방향/지연/지속시간/거리 조절이 가능한 공통 슬라이드 인 애니메이션 컴포넌트 `components/ui/slide-in.tsx`를 Add했습니다.
- Default을 포함해 커스터마이즈 가능한 공통 스켈레톤 컴포넌트 `components/ui/skeleton.tsx`를 Add했습니다.
- `width` Default: `100%`
- `height` Default: `1rem`
- `rounded`, `animated` 옵션 제공
- `app/globals.css`에 전역 애니메이션/쉬머 스타일을 Add했습니다.

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업일지 - 2026-04-06 (오버레이 + 애니메이션 + 로케일 JSON)

## 1) 모바일 네비게이션 오버레이

- 모바일 메뉴가 열렸을 때 헤더를 포함한 전체 화면이 블러 처리되도록 dim/blur 오버레이의 z-index를 상향했습니다.
- 사이드 패널은 오버레이 위에 유지되도록 더 높은 z-layer로 설정했습니다.

## 2) 재사용 가능한 UI 모션/스켈레톤

- 방향/지연/지속시간/거리 조절이 가능한 공통 슬라이드 인 애니메이션 컴포넌트 `components/ui/slide-in.tsx`를 추가했습니다.
- 기본값을 포함해 커스터마이즈 가능한 공통 스켈레톤 컴포넌트 `components/ui/skeleton.tsx`를 추가했습니다.
  - `width` 기본값: `100%`
  - `height` 기본값: `1rem`
  - `rounded`, `animated` 옵션 제공
- `app/globals.css`에 전역 애니메이션/쉬머 스타일을 추가했습니다.
- 핵심 UI 컴포넌트(섹션 타이틀, 히어로, 블로그 카드, 프로젝트 카드, 리스트 스태거)에 슬라이드 인을 적용했습니다.
- 테마 토글 로딩 상태에 스켈레톤을 적용했습니다.

## 3) i18n 로케일 JSON 구조

- 언어/페이지 단위 JSON 관리를 위해 `/locales` 폴더를 구성했습니다.
  - `locales/{ko,en,ja}/main.json`
  - `locales/{ko,en,ja}/header.json`
  - `locales/{ko,en,ja}/footer.json`
  - `locales/{ko,en,ja}/blog.json`
  - `locales/{ko,en,ja}/about.json`
  - `locales/{ko,en,ja}/projects.json`
  - `locales/{ko,en,ja}/not-found.json`
  - `locales/{ko,en,ja}/theme.json`
- 하드코딩된 TS 딕셔너리 객체를 제거하고, `lib/i18n/dictionary.ts`에서 JSON 조합 방식으로 교체했습니다.

## 4) 검증

- `npm run lint`: 통과
- `npx tsc --noEmit`: 통과$en_body$, ARRAY['workflow', 'ui-ux', 'animation', 'monitoring', 'i18n']::text[]),
  ('Admin_CMS_Supabase_v1', $en_title$Admin CMS + Supabase v1$en_title$, $en_desc$Admin CMS + Supabase v1 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Admin CMS + Supabase v1

## Overview
Admin CMS + Supabase v1 work details을 Cleanup한 기록입니다.

## Key Updates
- Admin 경로를 locale 비Apply 단일 경로로 Add했습니다.
- `/admin/login`
- `/admin`
- `/admin/posts`
- `/admin/projects`
- `/admin/profile`
- OAuth 콜백 경로 `/auth/callback`을 Add했습니다.
- `proxy.ts`를 업데이트해 locale 리다이렉트 예외에 `/admin`, `/auth`, `/api`를 포함했습니다.

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

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
  - `supabase/schema-v1.0.0.sql`
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
- `npm run build`: 샌드박스 제약(Turbopack 포트 바인딩 권한 오류)으로 실패$en_body$, ARRAY['workflow', 'admin', 'supabase', 'database', 'auth', 'ui-ux']::text[]),
  ('ui_여백_인증_댓글', $en_title$ui 여백 인증 댓글$en_title$, $en_desc$ui 여백 인증 댓글 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# ui 여백 인증 댓글

## Overview
ui 여백 인증 댓글 work details을 Cleanup한 기록입니다.

## Key Updates
- Admin/Published 화면의 margin, padding 불균형 Improvement
- About 관리 화면 라벨 구조 Improvement
- Project 관리 입력행의 `Add` 버튼 세로 정렬 문제 Update
- Published 헤더 Login 모달/Blog 댓글 UI Cleanup 및 안정화
- `components/layout/container.tsx`
- 컨테이너 기본 패딩을 `p-4`에서 `px-4 sm:px-6 lg:px-8`로 변경
- 수직 간격은 각 페이지가 담당하도록 분리
- `app/[lang]/(site)/layout.tsx`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업일지 (2026-04-07)

## 목표

- 관리자/공개 화면의 margin, padding 불균형 개선
- About 관리 화면 라벨 구조 개선
- 프로젝트 관리 입력행의 `추가` 버튼 세로 정렬 문제 수정
- 공개 헤더 로그인 모달/블로그 댓글 UI 정리 및 안정화

## 변경 사항

### 1) UI 간격/레이아웃 정리

- `components/layout/container.tsx`
  - 컨테이너 기본 패딩을 `p-4`에서 `px-4 sm:px-6 lg:px-8`로 변경
  - 수직 간격은 각 페이지가 담당하도록 분리
- `app/[lang]/(site)/layout.tsx`
  - 메인 영역 간격을 `py-8 sm:py-10 lg:py-12`로 조정
- `app/admin/(protected)/layout.tsx`
  - 관리자 레이아웃에 `Container` 적용 및 `py-4~6`, `gap-4~5` 정리
- `components/admin/sidebar.tsx`
  - 사이드바 내부 패딩/간격, 네비 버튼 높이(`xl:py-2.5`) 통일

### 2) About 관리 UX 개선

- `components/admin/about-manager.tsx`
  - 편집 필드를 섹션 단위로 재구성
    - `About`
    - `핵심 역량`
    - `작업 방식`
    - `공개 상태`
  - 섹션별 설명 텍스트 추가
  - 섹션 패딩/라운드/간격을 통일

### 3) Projects 관리 입력행 정렬 개선

- `components/admin/projects-manager.tsx`
  - `기술 스택/성과/기여` 입력행을 `items-center` + `Input flex-1` + `Button shrink-0`으로 정렬
  - `관련 링크` 입력 그리드에 `minmax(0, ...)` 적용하여 버튼 줄바꿈/세로 배열 이슈 완화
  - 관련 섹션 패딩을 `p-3.5`로 통일

### 4) 공개 로그인/댓글 UI 정리

- `components/layout/header.tsx`
  - 모바일 네비 레이어 z-index를 유효 클래스(`z-[60]`)로 수정
- `components/contact/fab.tsx`
  - 모달 z-index를 유효 클래스(`z-[60]`)로 수정
  - FAB/모달 우하단 여백을 반응형으로 미세 조정
- `components/blog/comments-section.tsx`
  - 댓글 입력/카드 UI를 컴팩트하게 축소 (avatar, padding, textarea 높이)
  - 헤더 로그인 유도 문구 유지
  - 사용하지 않는 `nextPath` prop 제거
- `app/[lang]/(site)/blog/[slug]/page.tsx`
  - `CommentsSection` 호출부에서 `nextPath` 전달 제거

### 5) About 공개 페이지 간격 보정

- `app/[lang]/(site)/about/page.tsx`
  - 섹션 간격 `space-y-8`로 조정
  - 카드 패딩을 `p-5 sm:p-6`으로 통일
  - 목록 아이템 간격 미세 조정(`space-y-2.5`)

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 참고

- 빌드 시 Next.js workspace root 경고(복수 lockfile 감지)는 남아 있음.
  - 기능 오류는 아니며, 추후 `outputFileTracingRoot` 설정 또는 상위 lockfile 정리로 해소 가능.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'auth', 'ui-ux', 'bugfix']::text[]),
  ('Admin_IA_5탭_Contact_FAB_Home_About_분리', $en_title$Admin IA 5탭 + Contact FAB + Home/About 분리$en_title$, $en_desc$Admin IA 5탭 + Contact FAB + Home/About 분리 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Admin IA 5탭 + Contact FAB + Home/About 분리

## Overview
Admin IA 5탭 + Contact FAB + Home/About 분리 work details을 Cleanup한 기록입니다.

## Key Updates
- Admin 정식 탭을 다음 5개로 Cleanup:
- `/admin/home`
- `/admin/about`
- `/admin/projects`
- `/admin/blog`
- `/admin/contact`
- 현재 동작:
- `/admin`은 별도 리다이렉트 없이 Admin 대시보드 페이지를 직접 렌더링.

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

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
- 문의 전송 성공 시 모달 폼 자동 닫힘 적용.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('Dashboard_canonical_Blog_썸네일_Home_Swiper', $en_title$Dashboard canonical + Blog 썸네일 + Home Swiper$en_title$, $en_desc$Dashboard canonical + Blog 썸네일 + Home Swiper work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Dashboard canonical + Blog 썸네일 + Home Swiper

## Overview
Dashboard canonical + Blog 썸네일 + Home Swiper work details을 Cleanup한 기록입니다.

## Key Updates
- 신규 canonical 경로: `/admin/dashboard`
- `/admin`은 `/admin/dashboard`로 리다이렉트 처리.
- 사이드바 대시보드 탭/로고 이동 경로를 `/admin/dashboard`로 통일.
- 대시보드 카드와 최근 항목을 링크 중심으로 개편:
- KPI 카드 전체 클릭 가능
- 최근 Blog/Project/Contact 행 전체 클릭 가능
- 섹션별 바로가기 링크 Add
- 딥링크 지원:

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업일지 - 2026-04-07 (Dashboard canonical + Blog 썸네일 + Home Swiper)

## 1) 관리자 대시보드 경로/UX 개편

- 신규 canonical 경로: `/admin/dashboard`
- `/admin`은 `/admin/dashboard`로 리다이렉트 처리.
- 사이드바 대시보드 탭/로고 이동 경로를 `/admin/dashboard`로 통일.
- 대시보드 카드와 최근 항목을 링크 중심으로 개편:
  - KPI 카드 전체 클릭 가능
  - 최근 블로그/프로젝트/문의 행 전체 클릭 가능
  - 섹션별 바로가기 링크 추가
- 딥링크 지원:
  - `/admin/blog?id=...`
  - `/admin/projects?id=...`
  - `/admin/contact?id=...`
  - 각 매니저 진입 시 해당 항목 패널 자동 오픈

## 2) 프로젝트 관리 입력 UX 개선

- 기술 스택 입력을 `Enter 추가 + X 삭제` 태그형으로 변경.
- 기간 입력을 `startDate`, `endDate`(date input) 방식으로 변경.
- 데이터 모델 확장:
  - `projects.start_date date`
  - `projects.end_date date`
- `period` 컬럼은 호환 유지:
  - 저장 시 start/end 기반으로 period 동기화 문자열 생성
  - 공개 렌더는 start/end 우선, 없으면 기존 period fallback

## 3) 블로그 썸네일 optional 도입

- 스키마 확장:
  - `posts.thumbnail text` (nullable)
- 타입/리포지토리/API 반영:
  - `AdminPost`, `BlogPostSummary/Detail`에 thumbnail optional
  - 관리자 저장/수정 API에 thumbnail 필드 반영
- 관리자 블로그 편집:
  - 외부 URL 입력
  - 파일 업로드(선택)

## 4) 업로드 경로 공통화

- 공통 업로드 API 추가:
  - `POST /api/admin/media/upload`
  - scope(`posts`/`projects`) 기반 경로 분기
- 기존 프로젝트 업로드 경로는 호환 유지:
  - `POST /api/admin/projects/upload-thumbnail`
  - 내부적으로 공통 업로드 로직 사용

## 5) 카드 전체 링크 정책 적용

- 공개 사이트:
  - `ProjectCard` 카드 전체 링크화
  - `BlogCard` 카드 전체 링크화
- 블로그 카드:
  - 썸네일이 있을 때만 이미지 레이아웃 표시
  - 없으면 텍스트 중심 카드 유지

## 6) Contact 성공 UX 개선

- 문의 전송 성공 시:
  - 모달 내 성공 문구(`✓`)를 1.2초 표시
  - 이후 자동 닫힘
  - 닫힌 뒤 FAB 근처에 짧은 성공 확인 문구 표시

## 7) Home Swiper 적용

- `swiper` 패키지 설치.
- 홈의 대표 프로젝트/최근 블로그 섹션을 Swiper로 전환:
  - 모바일 1장
  - 태블릿 2장
  - 데스크탑 3장
- keyboard/pagination 활성화.

## 8) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 실패 (현 환경 DNS 제한으로 `fonts.googleapis.com` 접근 불가)$en_body$, ARRAY['workflow', 'admin', 'ui-ux', 'seo', 'monitoring']::text[]),
  ('관리자_반응형_레이아웃_튜닝', $en_title$Admin Responsive 레이아웃 튜닝$en_title$, $en_desc$1. 레이아웃 전환 브레이크포인트 조정$en_desc$, $en_body$# Admin Responsive 레이아웃 튜닝

## Overview
1. 레이아웃 전환 브레이크포인트 조정

## Key Updates
- 기존 Admin 화면은 `lg(1024px)`부터 사이드바 레이아웃으로 전환되어 태블릿 폭에서 UI가 다소 과하게 데스크탑형으로 보였음.
- 버튼이 `w-full` 중심이라 모바일에서 버튼 덩어리가 커 보이고 밀도감이 떨어졌음.
- `app/admin/(protected)/layout.tsx`
- `lg:flex-row` -> `xl:flex-row`로 변경.
- 결과: 1024~1279px 구간은 상단 카드형 관리 네비를 유지하고, 1280px 이상에서만 고정 사이드바 전환.
- `components/admin/sidebar.tsx`
- 모바일/태블릿: 네비를 가로 pill 형태(`flex-wrap`)로 표시.
- 데스크탑(xl): 기존처럼 세로 메뉴(`block`)로 표시.

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업일지 - 2026-04-07 (관리자 반응형 레이아웃 튜닝)

## 변경 배경

- 기존 관리자 화면은 `lg(1024px)`부터 사이드바 레이아웃으로 전환되어 태블릿 폭에서 UI가 다소 과하게 데스크탑형으로 보였음.
- 버튼이 `w-full` 중심이라 모바일에서 버튼 덩어리가 커 보이고 밀도감이 떨어졌음.

## 적용 내용

1. 레이아웃 전환 브레이크포인트 조정

- `app/admin/(protected)/layout.tsx`
- `lg:flex-row` -> `xl:flex-row`로 변경.
- 결과: 1024~1279px 구간은 상단 카드형 관리 네비를 유지하고, 1280px 이상에서만 고정 사이드바 전환.

2. 관리자 사이드바 반응형 재구성

- `components/admin/sidebar.tsx`
- 모바일/태블릿: 네비를 가로 pill 형태(`flex-wrap`)로 표시.
- 데스크탑(xl): 기존처럼 세로 메뉴(`block`)로 표시.
- 상단 정보(로고/토글/계정정보)와 하단 액션(공개 사이트/로그아웃) 배치를 폭에 맞게 유연하게 전환.

3. 로그아웃 버튼 너비 고정 해제

- `components/admin/sign-out-button.tsx`
- `w-full` 강제 제거, `className` 주입형으로 변경.
- 필요 시 부모에서만 전체 너비를 주도록 구조 개선.

## 효과

- 태블릿 구간에서 레이아웃 급변이 줄어들어 시각적 이질감 완화.
- 모바일에서 버튼/네비가 과하게 커 보이지 않고, 더 압축된 관리자 UI 제공.

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과$en_body$, ARRAY['workflow', 'admin', 'ui-ux', 'monitoring']::text[]),
  ('Admin_인라인_편집_About_KO_DB_Projects_DnD', $en_title$Admin 인라인 편집 + About KO DB + Projects DnD$en_title$, $en_desc$Admin 인라인 편집 + About KO DB + Projects DnD work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Admin 인라인 편집 + About KO DB + Projects DnD

## Overview
Admin 인라인 편집 + About KO DB + Projects DnD work details을 Cleanup한 기록입니다.

## Key Updates
- `profile_content.about_intro_description_ko` 컬럼 criteria으로 KO About 문구를 DB에서 관리하도록 반영.
- Published About 페이지는 `ko`에서 DB 문구 우선, 비어 있으면 locale 문구 fallback.
- `en/ja`는 기존 locale JSON 문구를 그대로 유지.
- Admin About API(`PUT /api/admin/about`)에 `introDescription` 필드 Add.
- Home 관리에서 드로어 편집을 제거하고, 페이지 본문에서 즉시 편집/저장하도록 변경.
- About 관리도 동일하게 인라인 편집으로 전환.
- 공통 UX 보강:
- Dirty state 표시(Changes 있음/저장된 Status)

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업일지 - 2026-04-07 (Admin 인라인 편집 + About KO DB + Projects DnD)

## 1) About 소개 문구 DB 전환 (KO 전용)

- `profile_content.about_intro_description_ko` 컬럼 기준으로 KO 소개 문구를 DB에서 관리하도록 반영.
- 공개 About 페이지는 `ko`에서 DB 문구 우선, 비어 있으면 locale 문구 fallback.
- `en/ja`는 기존 locale JSON 문구를 그대로 유지.
- 관리자 About API(`PUT /api/admin/about`)에 `introDescription` 필드 추가.

## 2) Home/About 편집 UX 인라인 전환

- Home 관리에서 드로어 편집을 제거하고, 페이지 본문에서 즉시 편집/저장하도록 변경.
- About 관리도 동일하게 인라인 편집으로 전환.
- 공통 UX 보강:
  - Dirty state 표시(변경 사항 있음/저장된 상태)
  - 저장 중 버튼 비활성화
  - 성공/실패 메시지 표시

## 3) 상태 라벨/입력 방식 정리

- 관리자 화면 상태 라벨을 `공개 / 비공개`로 통일 (`draft` 내부값은 유지).
- 대시보드 요약/최근 항목의 상태 텍스트도 동일 라벨로 교체.
- Posts/Projects/About 편집 폼 상태 선택을 select에서 라디오 버튼으로 변경.

## 4) Projects 입력 모델 개편 + DnD

- `성과`, `주요 기여`를 줄바꿈 텍스트에서 아이템 입력/삭제/드래그 재정렬 방식으로 전환.
- `관련 링크`를 고정 3종에서 동적 목록(`label + url`) 추가/삭제/드래그 재정렬 방식으로 전환.
- 저장 시 링크는 배열 형태로 정규화해 저장.
- 레거시 링크 객체(`live/repo/detail`)는 API/리포지토리에서 읽기 호환 유지.

## 5) 인터랙션/접근성

- 관리자 편집 패널 및 About 공개 섹션에 강한 모션/호버 인터랙션 적용.
- `prefers-reduced-motion` 환경에서 `.ui-strong-motion` 범위의 transition/animation 시간을 축소.

## 6) 스키마/문서

- 신규 증분 마이그레이션 파일 추가:
  - `supabase/schema-v1.0.2.sql`
  - 내용: `about_intro_description_ko` 추가/백필 + `schema_migrations` 기록
- README의 스키마 적용 순서를 `v1.0.0 -> v1.0.1 -> v1.0.2`로 갱신.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('대시보드_재구성_썸네일_업로드_2방식', $en_title$대시보드 재구성 + 썸네일 업로드 2방식$en_title$, $en_desc$대시보드 재구성 + 썸네일 업로드 2방식 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# 대시보드 재구성 + 썸네일 업로드 2방식

## Overview
대시보드 재구성 + 썸네일 업로드 2방식 work details을 Cleanup한 기록입니다.

## Key Updates
- `Quick Links` 섹션 제거.
- 대시보드 역할을 운영 관점으로 강화:
- 핵심 지표 카드: Blog/Project/Contact/About PublishedStatus
- 즉시 확인 항목: 신규 Contact, 임시저장 Blog/Project, About 임시저장 여부
- 최근 변경 현황: 최근 Blog/Project/Contact 3건씩 Summary
- Admin Project 편집 화면에 썸네일 입력 모드 Add:
- 외부 링크 붙여넣기
- PC 파일 업로드

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업일지 - 2026-04-07 (대시보드 재구성 + 썸네일 업로드 2방식)

## 1) 관리자 대시보드 재구성

- `Quick Links` 섹션 제거.
- 대시보드 역할을 운영 관점으로 강화:
  - 핵심 지표 카드: 블로그/프로젝트/문의/소개 공개상태
  - 즉시 확인 항목: 신규 문의, 임시저장 블로그/프로젝트, 소개 임시저장 여부
  - 최근 변경 현황: 최근 블로그/프로젝트/문의 3건씩 요약

## 2) 프로젝트 썸네일 입력 2가지 방식 지원

- 관리자 프로젝트 편집 화면에 썸네일 입력 모드 추가:
  - 외부 링크 붙여넣기
  - PC 파일 업로드
- 파일 업로드 API 추가:
  - `POST /api/admin/projects/upload-thumbnail`
  - 관리자 권한 검증 후 Supabase Storage 업로드
  - 업로드 성공 시 공개 URL 반환 후 폼의 `thumbnail` 값에 자동 반영
- 업로드 제한:
  - 이미지 파일만 허용
  - 최대 5MB

## 3) Supabase 설정 보완

- `.env.example`에 썸네일 버킷 변수 추가:
  - `SUPABASE_PROJECT_THUMBNAIL_BUCKET=project-thumbnails`
- `supabase/schema-v1.0.0.sql`에 기본 버킷 생성 SQL 추가:
  - `project-thumbnails` (public)

## 4) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과$en_body$, ARRAY['workflow', 'admin', 'supabase', 'database', 'auth', 'ui-ux']::text[]),
  ('댓글_공개_로그인_관리자_UX_정리', $en_title$댓글 Published Login + Admin UX Cleanup$en_title$, $en_desc$댓글 Published Login + Admin UX Cleanup work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# 댓글 Published Login + Admin UX Cleanup

## Overview
댓글 Published Login + Admin UX Cleanup work details을 Cleanup한 기록입니다.

## Key Updates
- Blog 상세 페이지 하단 댓글 섹션에서 소셜 Login Status를 기반으로 댓글 작성 가능하도록 구성.
- 댓글 작성 필수 항목:
- 이메일(필수)
- 닉네임(필수)
- 프로필사진 URL(선택)
- API에서 이메일 형식, 닉네임 길이, 본문 길이, 프로필 URL 형식 Validation.
- Login 계정 이메일과 입력 이메일 불일치 시 차단.
- Supabase 환경값이 없는 경우 댓글 Login UI가 앱을 깨뜨리지 않도록 예외 처리 Add.

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업일지 - 2026-04-07 (댓글 공개 로그인 + 관리자 UX 정리)

## 1) 공개 댓글 기능 점검/보강

- 블로그 상세 페이지 하단 댓글 섹션에서 소셜 로그인 상태를 기반으로 댓글 작성 가능하도록 구성.
- 댓글 작성 필수 항목:
  - 이메일(필수)
  - 닉네임(필수)
  - 프로필사진 URL(선택)
- API에서 이메일 형식, 닉네임 길이, 본문 길이, 프로필 URL 형식 검증.
- 로그인 계정 이메일과 입력 이메일 불일치 시 차단.
- Supabase 환경값이 없는 경우 댓글 로그인 UI가 앱을 깨뜨리지 않도록 예외 처리 추가.

## 2) 관리자 화면 UX 구조 정리 확인

- 좌측 사이드바 카테고리 구조:
  - `/admin/blog`
  - `/admin/project`
  - `/admin/profile`
- `/admin`, `/admin/posts`, `/admin/projects`는 각각 새 경로로 리다이렉트.
- 본문 영역은 리스트 중심, 항목 클릭 시 우측 드로어 편집 패턴으로 통일.
- 사이드바에 공개 사이트 이동 링크와 로그아웃 버튼 배치.

## 3) 공개 페이지 미노출 이슈 관련 운영 기준

- 공개 사이트 데이터는 기본적으로 `published` 상태만 노출.
- 운영 혼선을 줄이기 위해 관리자 생성 폼 기본 상태를 `published` 중심으로 사용.

## 4) 스키마/운영 메모

- 댓글 저장 스키마는 작성자 메타(이메일, 닉네임, 프로필 URL) 컬럼을 사용하는 형태로 정리.
- 기존 데이터 호환을 위해 API/리포지토리에서 레거시 컬럼 부재 시 fallback 경로를 둠.

## 5) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'auth', 'ui-ux']::text[]),
  ('문의_FAB_개선_관리자_대시보드_정리', $en_title$Contact FAB Improvement + Admin 대시보드 Cleanup$en_title$, $en_desc$Contact FAB Improvement + Admin 대시보드 Cleanup work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Contact FAB Improvement + Admin 대시보드 Cleanup

## Overview
Contact FAB Improvement + Admin 대시보드 Cleanup work details을 Cleanup한 기록입니다.

## Key Updates
- Contact 버튼을 텍스트형에서 SVG 아이콘형 원형 FAB로 변경.
- 접근성 보완:
- `aria-label` 유지
- `sr-only` 텍스트(`fabLabel`) Add
- Contact 폼 제출 성공(`201`) 시:
- 폼 값 초기화
- 성공 메시지 설정
- 모달 자동 닫힘(`setOpen(false)`) 처리

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

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
  - 삭제된 admin 라우트로 인해 남아 있던 `.next/dev/types` 잔여 파일 정리 후 정상화$en_body$, ARRAY['workflow', 'refactor', 'admin', 'database', 'monitoring']::text[]),
  ('문의_관리자_메모_라디오', $en_title$Contact Admin 메모 라디오$en_title$, $en_desc$Contact Admin 메모 라디오 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Contact Admin 메모 라디오

## Overview
Contact Admin 메모 라디오 work details을 Cleanup한 기록입니다.

## Key Updates
- Contact함 관리에 `Admin 메모`를 DB 컬럼으로 Add
- Contact 상세 패널에서 Status 변경 UI를 `select`에서 `radio`로 전환
- Contact 상세 레이아웃을 다른 Admin 화면과 같은 카드형 구조로 Cleanup
- 파일: `supabase/schema-v1.0.3.sql`
- 변경:
- `contact_messages.admin_note` 컬럼 Add
- 기존 데이터 백필(`NULL -> ''`)
- `not null + default ''` Apply

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업일지 (2026-04-07)

## 목표

- 문의함 관리에 `관리자 메모`를 DB 컬럼으로 추가
- 문의 상세 패널에서 상태 변경 UI를 `select`에서 `radio`로 전환
- 문의 상세 레이아웃을 다른 관리자 화면과 같은 카드형 구조로 정리

## 작업 내용

### 1) DB 마이그레이션 추가

- 파일: `supabase/schema-v1.0.3.sql`
- 변경:
  - `contact_messages.admin_note` 컬럼 추가
  - 기존 데이터 백필(`NULL -> ''`)
  - `not null + default ''` 적용
  - `schema_migrations`에 `v1.0.3` 이력 기록

### 2) 타입/리포지토리 반영

- 파일: `types/content.ts`
  - `ContactMessage` 타입에 `adminNote: string` 추가
- 파일: `lib/contact/repository.ts`
  - `admin_note` select/mapping 추가
  - 업데이트 함수를 상태 전용에서 상태+메모 동시 저장으로 확장

### 3) 관리자 API 확장

- 파일: `app/api/admin/contact/[id]/route.ts`
- 변경:
  - payload에 `adminNote` 파싱/검증(최대 3000자)
  - `status + adminNote`를 함께 저장하도록 업데이트

### 4) 문의함 관리자 UI 개편

- 파일: `components/admin/contact-manager.tsx`
- 변경:
  - 상세 패널 레이아웃을 카드형 섹션으로 재구성
    - 문의자 정보
    - 문의 내용
    - 관리자 메모
    - 상태 라디오 그룹
  - 상태 선택을 `select` -> `radio`로 변경
  - 변경사항 감지(`isDirty`) 후 저장 버튼 활성화
  - 목록에서 메모 존재 시 `메모 있음` 배지 표시

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 적용 안내

- Supabase SQL Editor에서 `supabase/schema-v1.0.3.sql`을 실행해야 실제 DB 컬럼이 생성됩니다.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('관리자_페이지네이션_주스탄드_타입_v1_0_5', $en_title$Admin Pagination 주스탄드 타입 v1.0.5$en_title$, $en_desc$Admin Pagination 주스탄드 타입 v1.0.5 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Admin Pagination 주스탄드 타입 v1.0.5

## Overview
Admin Pagination 주스탄드 타입 v1.0.5 work details을 Cleanup한 기록입니다.

## Key Updates
- Admin `blog/projects/contact` 탭에 Pagination(기본 10개)과 `id` 쿼리스트링 동기화를 Apply했습니다.
- Published 사이트 Login 모달을 전역 오버레이(전체 블러) 방식으로 보강하고, Contact 모달 Status를 Zustand로 이관했습니다.
- 타입 구조를 `types/` 도메인 파일로 분리하고, 주요 컴포넌트/API의 인라인 타입을 Cleanup했습니다.
- `detailLabel`을 Published UI/로케일에서 완전 제거했습니다.
- `supabase/schema-v1.0.5.sql` 증분 마이그레이션 파일을 Add했습니다.
- Status관리
- `stores/public-ui.ts`: Published Login/Contact 모달 Status
- `stores/admin-detail.ts`: Admin 상세 패널 선택 id Status

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

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
- `npm run build` 통과$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'auth']::text[]),
  ('readingTime_제거_Admin_구조_재편_Markdown_에디터', $en_title$readingTime 제거 + Admin 구조 재편 + Markdown 에디터$en_title$, $en_desc$1. readingTime 제거$en_desc$, $en_body$# readingTime 제거 + Admin 구조 재편 + Markdown 에디터

## Overview
1. readingTime 제거

## Key Updates
- blog의 `readingTime` 의존성을 타입/저장소/API/UI/시드/MDX에서 완전히 제거
- `components/admin`을 기능 폴더 + 공통 폴더 구조로 재배치
- Blog 본문 + Project Summary에 Toast UI 기반 Markdown 에디터 토글 도입
- `types/content.ts`의 blog 관련 타입에서 `readingTime` 제거
- `lib/blog/repository.ts`에서 `reading_time` select/저장/변환 로직 제거
- `/api/admin/posts`, `/api/admin/posts/[id]` payload에서 `readingTime` 제거
- Blog 카드/상세의 읽기시간 렌더 제거
- `content/blog/*.mdx` metadata에서 `readingTime` Delete

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업 일지 - 2026-04-08 (readingTime 제거 + Admin 구조 재편 + Markdown 에디터)

## 적용 목표

- blog의 `readingTime` 의존성을 타입/저장소/API/UI/시드/MDX에서 완전히 제거
- `components/admin`을 기능 폴더 + 공통 폴더 구조로 재배치
- Blog 본문 + Project 요약에 Toast UI 기반 Markdown 에디터 토글 도입

## 주요 변경 사항

1. readingTime 제거

- `types/content.ts`의 blog 관련 타입에서 `readingTime` 제거
- `lib/blog/repository.ts`에서 `reading_time` select/저장/변환 로직 제거
- `/api/admin/posts`, `/api/admin/posts/[id]` payload에서 `readingTime` 제거
- 블로그 카드/상세의 읽기시간 렌더 제거
- `content/blog/*.mdx` metadata에서 `readingTime` 삭제
- `scripts/seed-supabase.mjs` posts upsert에서 `reading_time` 제거
- `supabase/schema-v1.0.4.sql` 추가 (`posts.reading_time` drop)

2. Admin 구조 재편

- 기능 폴더: `about`, `blog`, `projects`, `home`, `contact`
- 공통 폴더: `components/admin/common`
- `posts-manager` -> `blog/blog-manager`로 리네이밍
- admin 관련 import 전면 갱신

3. Markdown 에디터 토글 도입

- `@toast-ui/editor` 의존성 추가
- 공통 컴포넌트 추가:
  - `components/admin/common/toast-markdown-editor.tsx`
  - `components/admin/common/markdown-field.tsx`
- Blog 본문: `에디터 사용` 체크 시 Toast UI 에디터 전환
- Project 요약: 동일 방식 토글 적용
- 토글 상태는 편집 화면 로컬 상태(비저장)로 유지

4. Project 요약 렌더 정책 반영

- 상세 페이지: Markdown 렌더
- 카드/메타(description): markdown 문법 제거한 plain text 렌더

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 참고 메모

- `@toast-ui/react-editor`는 React 19 peer dependency 충돌로 채택하지 않았고, 동일한 Toast UI의 vanilla 패키지(`@toast-ui/editor`)로 구현함.$en_body$, ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'seo']::text[]),
  ('홈_소개_리뉴얼_1차', $en_title$홈/About 리뉴얼 1차$en_title$, $en_desc$홈/About 리뉴얼 1차 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# 홈/About 리뉴얼 1차

## Overview
홈/About 리뉴얼 1차 work details을 Cleanup한 기록입니다.

## Key Updates
- 2026-04-09
- 홈을 단일 풀블리드 Hero 슬라이더 중심으로 전환
- About 페이지를 좌우 2단(Tech Stack/프로필 사진) 구조로 개편
- Admin에서 메인 Hero 노출 항목을 수동 관리할 수 있는 `Home Highlight` 탭 Add
- 홈
- `app/[lang]/(site)/page.tsx`에서 기존 `TechStack/FeaturedProjects/RecentPosts` 섹션 제거
- `ImmersiveHeroSlider` 컴포넌트 신규 도입
- 메인/썸네일 Swiper 동기화, CTA 버튼, 풀블리드 레이아웃 Apply

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업 일지 - 홈/소개 리뉴얼 1차

## 작업일

- 2026-04-09

## 목표

- 홈을 단일 풀블리드 Hero 슬라이더 중심으로 전환
- About 페이지를 좌우 2단(기술 스택/프로필 사진) 구조로 개편
- 관리자에서 메인 Hero 노출 항목을 수동 관리할 수 있는 `Home Highlight` 탭 추가

## 주요 변경 사항

- 홈
  - `app/[lang]/(site)/page.tsx`에서 기존 `TechStack/FeaturedProjects/RecentPosts` 섹션 제거
  - `ImmersiveHeroSlider` 컴포넌트 신규 도입
  - 메인/썸네일 Swiper 동기화, CTA 버튼, 풀블리드 레이아웃 적용
- 소개(공개)
  - About 페이지를 `좌(소개+기술 로고 카드+강점+작업방식) / 우(프로필 사진)` 구조로 재배치
  - 기술 스택 로고/설명을 카드형 인터랙션으로 노출
- 관리자
  - `/admin/highlight` 신규 페이지 추가
  - `components/admin/highlight/highlight-manager.tsx`로 항목 추가/정렬/활성화/오버라이드 저장 기능 구현
  - 사이드바에 `홈 하이라이트` 메뉴 추가
  - 대시보드 카드에 홈 하이라이트 현황 추가

## 데이터 계층 변경

- 신규 마이그레이션: `supabase/schema-v1.0.8.sql`
  - `home_highlights` 테이블 추가
  - `profile_content.about_photo_url` 컬럼 추가
  - `profile_content.about_tech_items` 컬럼 추가
- 신규 리포지토리: `lib/home/repository.ts`
  - 관리자용 하이라이트 조회/저장
  - 공개 홈용 슬라이드 해석 로직(override + fallback)
- 신규 API: `GET/PUT /api/admin/highlights`

## 타입 변경

- `types/home.ts` 신규 추가
  - `HomeHighlight`, `HomeHighlightSourceOption`, `HomeHighlightResolvedSlide` 등
- `types/profile.ts` 확장
  - `aboutPhotoUrl`, `aboutTechItems` 추가
- `types/ui.ts` 확장
  - `HomeHighlightManagerProps`, `HomeHeroSliderProps` 추가

## 비고

- 이번 단계는 홈/소개/관리자 하이라이트 운영까지로 제한
- 블로그/프로젝트 페이지의 화려한 리뉴얼은 다음 단계로 분리$en_body$, ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'deployment']::text[]),
  ('About_클릭_리빌_인터랙션_모바일_반응형', $en_title$About 클릭 리빌 인터랙션 + 모바일 Responsive$en_title$, $en_desc$1. 위치 클래스 분리$en_desc$, $en_body$# About 클릭 리빌 인터랙션 + 모바일 Responsive

## Overview
1. 위치 클래스 분리

## Key Updates
- Published About 페이지를 서버/클라이언트 분리 구조로 변경했습니다.
- 서버 페이지: 데이터 조회 + 라벨 전달만 담당
- 클라이언트 컴포넌트: 클릭 인터랙션/애니메이션 Status 관리
- 초기 Status는 중앙 원형 프로필 이미지 중심으로 렌더링되며, 클릭 시:
- 프로필 카드가 우측 방향으로 이동
- About 텍스트와 Tech Stack 카드가 순차적으로 등장
- 모바일 Responsive을 고려해 다음을 Apply했습니다.
- 단일 컬럼 criteria 안전한 폭(`w-[220px]`, `sm:w-[270px]`)

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# About 클릭 리빌 인터랙션 + 모바일 반응형

## 작업 내용
- 공개 About 페이지를 서버/클라이언트 분리 구조로 변경했습니다.
  - 서버 페이지: 데이터 조회 + 라벨 전달만 담당
  - 클라이언트 컴포넌트: 클릭 인터랙션/애니메이션 상태 관리
- 초기 상태는 중앙 원형 프로필 이미지 중심으로 렌더링되며, 클릭 시:
  - 프로필 카드가 우측 방향으로 이동
  - 소개 텍스트와 기술 스택 카드가 순차적으로 등장
- 모바일 반응형을 고려해 다음을 적용했습니다.
  - 단일 컬럼 기준 안전한 폭(`w-[220px]`, `sm:w-[270px]`)
  - 모바일에서 과도한 이동을 피하는 완만한 `translate-x`
  - 기술 스택 1~2열 자동 전환
- 프로필 이미지는 전 구간 `object-contain`으로 유지해 잘림을 방지했습니다.

## 변경 파일
- `app/[lang]/(site)/about/page.tsx`
- `components/about/interactive-about-reveal.tsx`
- `types/ui.ts`

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 후속 조정
- 프로필 카드 내 `열기/닫기` 텍스트를 제거했습니다.
- 초기 상태에서 프로필 카드가 위아래로 살짝 움직이는 `bounce` 애니메이션을 추가했습니다.
- 클릭 확장 시 프로필 카드는 천천히 오른쪽으로 이동하도록 전환 시간을 늘렸습니다.
- 데스크탑에서 프로필 카드가 항상 화면 정중앙 높이에 맞춰 보이도록 위치 계산을 조정했습니다.
- 프로필 사진이 프레임 안에서 작게 보이던 문제를 수정했습니다.
  - 원형 프레임 패딩/보더를 축소
  - 이미지 렌더를 `object-contain`에서 `object-cover object-top`으로 변경
  - 프로필 카드처럼 보이도록 하단 그라데이션 오버레이를 추가

## 후속 히스토리 (추가)
1. 위치 클래스 분리
- 요청에 맞춰 위치 관련 Tailwind 클래스를 `profileButtonPosition` 객체로 분리했습니다.
- 목적: 모바일/데스크톱 위치 보정을 한 곳에서 관리하고, 회귀를 줄이기 위함.

2. 모바일 닫힘 상태 상단 보정
- 닫힘 상태에서 프로필 버튼이 모바일에서만 위로 이동하도록 조정했습니다.
- 이후 헤더와 겹침 이슈가 확인되어 단순 top 값 보정만으로는 한계가 있음을 확인했습니다.

3. 모바일 닫힘 상태 콘텐츠 0 처리
- 닫힘 상태일 때 모바일에서 콘텐츠 영역을 `w/h = 0`에 가깝게 접어 보이지 않게 처리했습니다.
- 데스크톱 동작은 유지하도록 `lg:*` 클래스 분기 처리했습니다.

4. 모션 끊김 완화
- `w/h` 직접 전환으로 끊기던 문제를 줄이기 위해 `max-height + opacity + transform` 기반 전환으로 변경했습니다.
- 레이아웃 점프를 줄이기 위해 콘텐츠 카드(`article`) 자체보다 래퍼에서 모션을 처리하도록 구조를 조정했습니다.

5. 모바일 이동 제거(최종)
- 최종 결정: 모바일에서는 프로필 버튼의 위치 이동을 제거하고, 동일 위치 고정으로 변경했습니다.
- 열림 상태에서는 위치 이동 대신 `scale`만 서서히 키우도록 조정했습니다.
- 데스크톱에서만 우측 이동 애니메이션을 유지했습니다.

## 최종 상태 요약
- 모바일:
  - 프로필 버튼 위치 고정(열림/닫힘 동일)
  - 콘텐츠는 펼침/접힘 모션만 동작
  - 열림 시 버튼 `scale` 강조
- 데스크톱:
  - 기존 의도대로 우측 이동 + 콘텐츠 리빌 유지
- 코드 가독성:
  - 위치 관련 클래스는 객체 분리 + 한국어 주석 반영$en_body$, ARRAY['workflow', 'ui-ux', 'animation', 'monitoring']::text[]),
  ('About_페이지_리뉴얼_반응형_인터랙션', $en_title$About 페이지 리뉴얼 (Responsive + 인터랙션)$en_title$, $en_desc$About 페이지 리뉴얼 (Responsive + 인터랙션) work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# About 페이지 리뉴얼 (Responsive + 인터랙션)

## Overview
About 페이지 리뉴얼 (Responsive + 인터랙션) work details을 Cleanup한 기록입니다.

## Key Updates
- About 페이지를 단순 정보 나열에서 벗어나 인터랙티브한 브랜드 섹션으로 재구성한다.
- 데스크탑/모바일 모두 자연스럽게 보이도록 Responsive 레이아웃을 Cleanup한다.
- 파일: `app/[lang]/(site)/about/page.tsx`
- 레이아웃
- 풀폭 배경(그라디언트/라디얼 레이어) Apply
- 상단: About 텍스트 카드 + 프로필 카드 2단(모바일 1단) 구성
- 하단: 기술스택 인터랙티브 카드 그리드 구성
- 인터랙션

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# About 페이지 리뉴얼 (반응형 + 인터랙션)

## 작업 목적
- 소개 페이지를 단순 정보 나열에서 벗어나 인터랙티브한 브랜드 섹션으로 재구성한다.
- 데스크탑/모바일 모두 자연스럽게 보이도록 반응형 레이아웃을 정리한다.

## 변경 내용
- 파일: `app/[lang]/(site)/about/page.tsx`
- 레이아웃
  - 풀폭 배경(그라디언트/라디얼 레이어) 적용
  - 상단: 소개 텍스트 카드 + 프로필 카드 2단(모바일 1단) 구성
  - 하단: 기술스택 인터랙티브 카드 그리드 구성
- 인터랙션
  - 카드 hover 시 translate/scale/shadow 전환
  - 프로필 카드에 글로우/확대 전환
  - 기술 로고 hover 시 확대 효과
  - `SlideIn` 시퀀스 모션으로 섹션 진입 애니메이션 강화
- 카피/라벨
  - locale별 라벨 세분화(`profileCard`, `experience`, `skillDeck`, `core`)

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과$en_body$, ARRAY['workflow', 'refactor', 'ui-ux', 'animation', 'monitoring', 'i18n']::text[]),
  ('Vercel_1차_프로덕션_배포_Production_only', $en_title$Vercel 1차 프로덕션 Deployment (Production only)$en_title$, $en_desc$1. Vercel CLI Login 및 Project 연결$en_desc$, $en_body$# Vercel 1차 프로덕션 Deployment (Production only)

## Overview
1. Vercel CLI Login 및 Project 연결

## Key Updates
- Vercel Project 연결: `wogml3270s-projects/j-blog`
- 프로덕션 alias URL(기존): `https://j-blog-two.vercel.app`
- 프로덕션 alias URL(변경): `https://j-fe-blog.vercel.app`
- Deployment Inspect URL:
- `https://vercel.com/wogml3270s-projects/j-blog/7y2RQHECuCd2wGuAZVhDySJnDgpz`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# Vercel 1차 프로덕션 배포 (Production only)

## 배포 결과
- Vercel 프로젝트 연결: `wogml3270s-projects/j-blog`
- 프로덕션 alias URL(기존): `https://j-blog-two.vercel.app`
- 프로덕션 alias URL(변경): `https://j-fe-blog.vercel.app`
- 배포 Inspect URL:
  - `https://vercel.com/wogml3270s-projects/j-blog/7y2RQHECuCd2wGuAZVhDySJnDgpz`

## 적용한 작업
1. Vercel CLI 로그인 및 프로젝트 연결
2. Production 배포 1회 수행
3. `.env.local` 기준으로 Vercel Production 환경변수 등록
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `SUPABASE_PROJECT_THUMBNAIL_BUCKET`
   - `ADMIN_ALLOWED_EMAILS`
4. 환경변수 반영을 위해 Production 재배포 1회 추가 수행

## 스모크 테스트 결과
- `/` -> `200`
- `/about` -> `200`
- `/blog` -> `200`
- `/projects` -> `200`
- `/admin/login` -> `200`
- `/auth/callback`(code 없음) -> `307 /admin/login?reason=missing_code`
- `https://j-fe-blog.vercel.app` -> `200`

## Supabase 대시보드에서 수동으로 맞춰야 할 항목
- Auth > URL Configuration
  - Site URL: `https://j-fe-blog.vercel.app`
  - Additional Redirect URLs:
    - `https://j-fe-blog.vercel.app/auth/callback`
    - `https://j-blog-two.vercel.app/auth/callback` (임시 호환)
    - `http://localhost:3000/auth/callback`
- Auth > Providers (Google/GitHub/Kakao)
  - Supabase callback URL은 기존 방식 유지
  - 각 Provider 콘솔에 위 production callback URL 반영 여부 확인

## 메모
- Vercel 빌드 로그에 `.env` 파일 감지 경고가 있어, 장기적으로는 로컬 `.env` 파일 의존 없이 Vercel 환경변수만 사용하도록 정리 필요.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'auth', 'deployment']::text[]),
  ('관리자_안정화_예약_발행_에디터_고정_v1_0_12', $en_title$Admin 안정화 + 예약 발행 + 에디터 고정 (v1.0.12)$en_title$, $en_desc$Admin 안정화 + 예약 발행 + 에디터 고정 (v1.0.12) work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Admin 안정화 + 예약 발행 + 에디터 고정 (v1.0.12)

## Overview
Admin 안정화 + 예약 발행 + 에디터 고정 (v1.0.12) work details을 Cleanup한 기록입니다.

## Key Updates
- Admin Blog/Project 진입 시 간헐적으로 발생하던 `removeChild` DOM Error를 완화한다.
- 썸네일 업로드 UX를 즉시 미리보기 + 자동 업로드 방식으로 단순화한다.
- Blog 예약 발행을 도입하고, 실제 게시일을 자동 정책으로 고정한다.
- Markdown 입력은 항상 Toast UI 에디터를 사용하도록 통일한다.
- `EditorDrawer`는 `open=false`일 때 컴포넌트를 언마운트하도록 변경했다.
- Toast UI Editor/Viewer Cleanup 루틴에 안전 가드(중복 destroy 방지, cleanup 보강)를 Add했다.
- Blog/Project 썸네일 업로드에서 `업로드 후 Apply` 버튼을 제거하고 파일 선택 즉시:
- 로컬 미리보기 표시

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 관리자 안정화 + 예약 발행 + 에디터 고정 (v1.0.12)

## 작업 목적
- 관리자 블로그/프로젝트 진입 시 간헐적으로 발생하던 `removeChild` DOM 오류를 완화한다.
- 썸네일 업로드 UX를 즉시 미리보기 + 자동 업로드 방식으로 단순화한다.
- 블로그 예약 발행을 도입하고, 실제 게시일을 자동 정책으로 고정한다.
- Markdown 입력은 항상 Toast UI 에디터를 사용하도록 통일한다.

## 주요 변경
- `EditorDrawer`는 `open=false`일 때 컴포넌트를 언마운트하도록 변경했다.
- Toast UI Editor/Viewer 정리 루틴에 안전 가드(중복 destroy 방지, cleanup 보강)를 추가했다.
- 블로그/프로젝트 썸네일 업로드에서 `업로드 후 적용` 버튼을 제거하고 파일 선택 즉시:
  - 로컬 미리보기 표시
  - 스토리지 업로드 자동 실행
  - 성공 시 URL 반영
  - 실패 시 에러 메시지 노출
- 블로그 편집 폼:
  - `메인 페이지 노출` 체크를 `공개/비공개` 라디오와 같은 영역에 배치
  - `실제 게시일`은 읽기 전용 표시로 변경
  - `예약 발행(datetime-local)` 입력 + 해제 버튼 추가
- 블로그 게시일 정책:
  - `draft`는 `published_at`, `scheduled_publish_at` 모두 `null`
  - 최초 공개 시 1회만 `published_at` 설정
  - 예약 발행 시 최초 `published_at`을 예약 시각으로 설정
  - 공개 이력이 있는 글은 이후 저장 시 `published_at` 유지
- 공개 블로그 조회 조건에 예약 발행 필터를 추가했다.
  - `status='published'` AND `(scheduled_publish_at is null OR scheduled_publish_at <= now())`
- MarkdownField는 토글 UI를 제거하고 항상 Toast UI 에디터만 렌더하도록 변경했다.

## 스키마
- `supabase/v1/schema-v1.0.12.sql` 추가
  - `posts.scheduled_publish_at timestamptz` 컬럼 추가
  - 조회 성능용 인덱스 추가
  - `schema_migrations`에 `v1.0.12` 기록

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 메모
- `prettier`는 `.sql` 파서를 자동 인식하지 못해 SQL 파일은 포맷 대상에서 제외했다.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('관리자_위치_변경_드래그_통일', $en_title$Admin 위치 변경 드래그 통일$en_title$, $en_desc$Admin 위치 변경 드래그 통일 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Admin 위치 변경 드래그 통일

## Overview
Admin 위치 변경 드래그 통일 work details을 Cleanup한 기록입니다.

## Key Updates
- Admin 페이지의 위치 변경 기능을 화살표 버튼이 아닌 마우스 드래그로 통일한다.
- Project 관리에서 사용 중인 dnd-kit 방식과 동일한 UX를 Home/About에도 Apply한다.
- Home Admin (`components/admin/home/home-manager.tsx`)
- 위/아래 버튼 기반 정렬 로직 제거
- `@dnd-kit` 기반 드래그 정렬로 변경 (`DndContext`, `SortableContext`, `useSortable`)
- 항목 카드 좌측에 드래그 핸들(`≡`) Add
- 순서 저장은 기존 payload(orderIndex) 흐름 그대로 유지
- About Admin (`components/admin/about/about-manager.tsx`)

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 관리자 위치 변경 드래그 통일

## 작업 목적
- 관리자 페이지의 위치 변경 기능을 화살표 버튼이 아닌 마우스 드래그로 통일한다.
- 프로젝트 관리에서 사용 중인 dnd-kit 방식과 동일한 UX를 Home/About에도 적용한다.

## 변경 내용
- Home 관리자 (`components/admin/home/home-manager.tsx`)
  - 위/아래 버튼 기반 정렬 로직 제거
  - `@dnd-kit` 기반 드래그 정렬로 변경 (`DndContext`, `SortableContext`, `useSortable`)
  - 항목 카드 좌측에 드래그 핸들(`≡`) 추가
  - 순서 저장은 기존 payload(orderIndex) 흐름 그대로 유지

- About 관리자 (`components/admin/about/about-manager.tsx`)
  - 기술 스택 항목 순서 변경을 드래그 정렬로 변경
  - 한 줄(horizontal) 나열 레이아웃에서 드래그 가능한 카드로 구성
  - 각 카드에 드래그 핸들(`≡`) 추가
  - 삭제 기능은 기존과 동일 유지

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과

## 확인 포인트
- Home에서 드래그 순서 변경 후 저장 시 순서 유지되는지
- About 기술 스택을 가로 방향으로 드래그 정렬 후 저장/재진입 시 순서 유지되는지$en_body$, ARRAY['workflow', 'admin', 'ui-ux', 'monitoring']::text[]),
  ('기술스택_순서_이동_한_줄_레이아웃_정리', $en_title$기술스택 순서 이동 + 한 줄 레이아웃 Cleanup$en_title$, $en_desc$기술스택 순서 이동 + 한 줄 레이아웃 Cleanup work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# 기술스택 순서 이동 + 한 줄 레이아웃 Cleanup

## Overview
기술스택 순서 이동 + 한 줄 레이아웃 Cleanup work details을 Cleanup한 기록입니다.

## Key Updates
- About 관리에서 기술스택 노출 순서를 직접 바꿀 수 있게 한다.
- Published About 기술스택을 한 줄 레이아웃으로 보기 좋게 정렬한다.
- Admin About (`components/admin/about/about-manager.tsx`)
- 기술 항목 순서 이동 함수 Add: `moveTechItem(id, direction)`
- 기술 목록 UI를 2열 그리드에서 가로 1줄(`overflow-x-auto`) 카드 나열로 변경
- 각 항목에 `↑`, `↓`, `Delete` 버튼 Add
- 순서 변경 결과는 기존 `aboutTechItems` 배열 순서대로 저장되며 Published 페이지에도 반영
- Published About (`app/[lang]/(site)/about/page.tsx`)

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 기술스택 순서 이동 + 한 줄 레이아웃 정리

## 작업 목적
- About 관리에서 기술스택 노출 순서를 직접 바꿀 수 있게 한다.
- 공개 About 기술스택을 한 줄 레이아웃으로 보기 좋게 정렬한다.

## 변경 내용
- 관리자 About (`components/admin/about/about-manager.tsx`)
  - 기술 항목 순서 이동 함수 추가: `moveTechItem(id, direction)`
  - 기술 목록 UI를 2열 그리드에서 가로 1줄(`overflow-x-auto`) 카드 나열로 변경
  - 각 항목에 `↑`, `↓`, `삭제` 버튼 추가
  - 순서 변경 결과는 기존 `aboutTechItems` 배열 순서대로 저장되며 공개 페이지에도 반영

- 공개 About (`app/[lang]/(site)/about/page.tsx`)
  - 기술스택 렌더를 그리드에서 가로 1줄 스크롤 레이아웃으로 변경
  - 각 아이템에 아이콘 + 기술명을 함께 노출
  - 기존 "추가 개수(+N)" 표시는 제거

## 확인 포인트
- 관리자 About에서 `↑/↓` 이동 후 저장 시 순서가 유지되는지
- 공개 About에서 기술스택이 한 줄로 정렬되고, 항목이 많을 때 가로 스크롤되는지$en_body$, ARRAY['workflow', 'refactor', 'admin', 'ui-ux', 'monitoring']::text[]),
  ('소개_단순화_리뉴얼_v1_0_13', $en_title$About 단순화 리뉴얼 v1.0.13$en_title$, $en_desc$About 단순화 리뉴얼 v1.0.13 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# About 단순화 리뉴얼 v1.0.13

## Overview
About 단순화 리뉴얼 v1.0.13 work details을 Cleanup한 기록입니다.

## Key Updates
- `profile_content` 모델을 단순화하기 위해 불필요한 About 컬럼 5개를 제거하는 증분 마이그레이션을 Add했습니다.
- Admin About 편집/저장 경로를 단순 모델(`name`, `title`, `summary`, `about_photo_url`, `about_tech_items`, `status`) criteria으로 Cleanup했습니다.
- Published About 페이지를 단순 모델 기반 레이아웃으로 재구성하고, 프로필 이미지는 모든 디바이스에서 잘리지 않도록 `object-contain`으로 고정했습니다.
- 사용되지 않는 `/api/admin/profile` 엔드포인트 경로를 제거했습니다.
- 시드 스크립트의 `profile_content` 업서트 구조를 새 Schema에 맞게 Cleanup했습니다.
- `supabase/v1/schema-v1.0.13.sql`
- `types/profile.ts`
- `lib/profile/repository.ts`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 소개 단순화 리뉴얼 v1.0.13

## 작업 요약
- `profile_content` 모델을 단순화하기 위해 불필요한 About 컬럼 5개를 제거하는 증분 마이그레이션을 추가했습니다.
- 관리자 About 편집/저장 경로를 단순 모델(`name`, `title`, `summary`, `about_photo_url`, `about_tech_items`, `status`) 기준으로 정리했습니다.
- 공개 About 페이지를 단순 모델 기반 레이아웃으로 재구성하고, 프로필 이미지는 모든 디바이스에서 잘리지 않도록 `object-contain`으로 고정했습니다.
- 사용되지 않는 `/api/admin/profile` 엔드포인트 경로를 제거했습니다.
- 시드 스크립트의 `profile_content` 업서트 구조를 새 스키마에 맞게 정리했습니다.

## 변경 파일
- `supabase/v1/schema-v1.0.13.sql`
- `types/profile.ts`
- `lib/profile/repository.ts`
- `app/api/admin/about/route.ts`
- `app/[lang]/(site)/about/page.tsx`
- `scripts/seed-supabase.mjs`
- `docs/worklogs/2026-04-10/소개-단순화-리뉴얼-v1.0.13.md`

## 비고
- 기존 v1.0.0/v1.0.2 스키마 파일에는 과거 컬럼 정의가 남아 있으며, 이번 버전에서는 증분 마이그레이션(`v1.0.13`)으로 제거합니다.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('소셜_아바타_next_image_에러_해결', $en_title$소셜 아바타 next/image 에러 Fix$en_title$, $en_desc$소셜 아바타 next/image 에러 Fix work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# 소셜 아바타 next/image 에러 Fix

## Overview
소셜 아바타 next/image 에러 Fix work details을 Cleanup한 기록입니다.

## Key Updates
- 카카오 Login 시 `Invalid src prop ... k.kakaocdn.net` 에러 발생
- 구글 Login은 이미지 URL이 존재해도 일부 화면에서 아바타 렌더 실패
- 소셜 프로필 URL 정규화 유틸 Add
- `http://k.kakaocdn.net/...` -> `https://k.kakaocdn.net/...` 교정
- 허용 프로토콜(`http/https`) 이외 값 차단
- 헤더 인증 모달 아바타를 `next/image`에서 `img`로 전환
- 소셜 아바타 렌더를 도메인 최적화 제약에서 분리
- `next.config.ts` `images.remotePatterns`에 소셜 도메인 명시 Add

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 소셜 아바타 next/image 에러 해결

## 이슈
- 카카오 로그인 시 `Invalid src prop ... k.kakaocdn.net` 에러 발생
- 구글 로그인은 이미지 URL이 존재해도 일부 화면에서 아바타 렌더 실패

## 조치
- 소셜 프로필 URL 정규화 유틸 추가
  - `http://k.kakaocdn.net/...` -> `https://k.kakaocdn.net/...` 교정
  - 허용 프로토콜(`http/https`) 이외 값 차단
- 헤더 인증 모달 아바타를 `next/image`에서 `img`로 전환
  - 소셜 아바타 렌더를 도메인 최적화 제약에서 분리
- `next.config.ts` `images.remotePatterns`에 소셜 도메인 명시 추가
  - `k.kakaocdn.net`, `lh3.googleusercontent.com`, `avatars.githubusercontent.com`

## 변경 파일
- `lib/utils/avatar-url.ts`
- `components/layout/header.tsx`
- `components/blog/comments-section.tsx`
- `lib/auth/admin.ts`
- `next.config.ts`$en_body$, ARRAY['workflow', 'admin', 'auth', 'performance', 'bugfix', 'monitoring']::text[]),
  ('수파베이스_스토리지_업로드_정비', $en_title$수파베이스 Storage 업로드 정비$en_title$, $en_desc$1. Supabase SQL Editor에서 `schema-v1.0.9.sql` 실행$en_desc$, $en_body$# 수파베이스 Storage 업로드 정비

## Overview
1. Supabase SQL Editor에서 `schema-v1.0.9.sql` 실행

## Key Updates
- Admin에서 PC 이미지 업로드 시 Supabase Storage로 직접 저장되도록 일원화 필요
- 페이지별로 Storage 폴더를 분리해 운영/관리 가독성 Improvement 필요
- 공통 업로드 스코프 확장
- `about | blog | projects | home | misc`
- 업로드 경로 규칙 통일
- `/{scope}/{YYYY-MM-DD}/{unique}-{filename}.{ext}`
- 버킷 환경변수 우선순위 Cleanup
- `SUPABASE_STORAGE_BUCKET` 우선

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 수파베이스 스토리지 업로드 정비

## 작업 배경
- 관리자에서 PC 이미지 업로드 시 Supabase Storage로 직접 저장되도록 일원화 필요
- 페이지별로 스토리지 폴더를 분리해 운영/관리 가독성 개선 필요

## 적용 내용
- 공통 업로드 스코프 확장
  - `about | blog | projects | home | misc`
- 업로드 경로 규칙 통일
  - `/{scope}/{YYYY-MM-DD}/{unique}-{filename}.{ext}`
- 버킷 환경변수 우선순위 정리
  - `SUPABASE_STORAGE_BUCKET` 우선
  - 없으면 `SUPABASE_PROJECT_THUMBNAIL_BUCKET` fallback
- 공통 클라이언트 업로드 유틸 추가
  - `lib/admin/upload-client.ts`
- 관리자 업로드 연동 정리
  - 블로그 썸네일 업로드 -> 공통 유틸 사용
  - 프로젝트 썸네일 업로드 -> 공통 유틸 사용
  - About 관리에 프로필 이미지 파일 업로드 추가
  - About 관리에 기술 로고 파일 업로드 추가
  - Home 관리에 하이라이트 배경 이미지 파일 업로드 추가
- 증분 SQL 추가
  - `supabase/schema-v1.0.9.sql`
  - 버킷 보정/마이그레이션 기록 포함

## 환경변수 검수/수정
- 잘못 들어간 Storage S3 URL 제거
- `.env.local` 수정:
  - `SUPABASE_STORAGE_BUCKET=project-thumbnails`
  - `SUPABASE_PROJECT_THUMBNAIL_BUCKET=project-thumbnails`
- `NEXT_PUBLIC_SUPABASE_URL`은 프로젝트 URL(`https://<project-id>.supabase.co`) 유지

## 검증 결과
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build`는 샌드박스 네트워크 제한(google fonts fetch)으로 확인 불가

## 후속 할 일
1. Supabase SQL Editor에서 `schema-v1.0.9.sql` 실행
2. 관리자에서 블로그/프로젝트/About/Home 이미지 업로드 실사용 점검
3. 키 노출 이력으로 `SUPABASE_SERVICE_ROLE_KEY` rotate 권장$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('슬러그_중복_안내_About_SVG_업로드_개선', $en_title$슬러그 중복 안내 + About SVG 업로드 Improvement$en_title$, $en_desc$슬러그 중복 안내 + About SVG 업로드 Improvement work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# 슬러그 중복 안내 + About SVG 업로드 Improvement

## Overview
슬러그 중복 안내 + About SVG 업로드 Improvement work details을 Cleanup한 기록입니다.

## Key Updates
- 슬러그 중복 발생 시 Admin에게 이해하기 쉬운 Error 메시지를 제공한다.
- About 탭의 프로필/기술 로고 업로드 UX를 Blog·Project 썸네일 업로드와 동일하게 맞춘다.
- 기술 로고 업로드에서 SVG 태그 문자열 입력 방식도 지원한다.
- DB 에러 파싱 유틸 Add:
- `lib/utils/db-error.ts`
- `toSlugConflictMessage()`로 `23505 + slug` 충돌을 한국어 메시지로 변환.
- 저장소 에러 메시지 Improvement:
- `lib/blog/repository.ts`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 슬러그 중복 안내 + About SVG 업로드 개선

## 작업 목적
- 슬러그 중복 발생 시 관리자에게 이해하기 쉬운 오류 메시지를 제공한다.
- About 탭의 프로필/기술 로고 업로드 UX를 블로그·프로젝트 썸네일 업로드와 동일하게 맞춘다.
- 기술 로고 업로드에서 SVG 태그 문자열 입력 방식도 지원한다.

## 변경 내용
- DB 에러 파싱 유틸 추가:
  - `lib/utils/db-error.ts`
  - `toSlugConflictMessage()`로 `23505 + slug` 충돌을 한국어 메시지로 변환.
- 저장소 에러 메시지 개선:
  - `lib/blog/repository.ts`
  - `lib/projects/repository.ts`
  - create/update 시 slug unique 충돌이면 `이미 사용 중인 슬러그` 안내 문구 반환.
- About 업로드 UX 개선:
  - `components/admin/about/about-manager.tsx`
  - 프로필 이미지: URL/파일 업로드 모드, 파일 선택 즉시 미리보기 + 자동 업로드.
  - 기술 로고: URL/파일/SVG 코드 모드, 파일 선택 즉시 미리보기 + 자동 업로드.
  - SVG 코드 업로드: `<svg>...</svg>` 문자열을 `image/svg+xml` 파일로 변환해 스토리지 업로드.
  - 로컬 Object URL 정리(cleanup) 로직 추가.

## 확인 포인트
- 블로그/프로젝트에서 중복 slug 저장 시 한국어 안내 문구가 노출되는지.
- About 기술 로고에서 SVG 코드 입력 업로드가 정상 동작하는지.
- 업로드 선택 즉시 미리보기 및 URL 반영이 되는지.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'database', 'ui-ux', 'bugfix']::text[]),
  ('프로젝트_요약_분리_슬러그_동기화_저장', $en_title$Project Summary 분리 + 슬러그 동기화 저장$en_title$, $en_desc$1. Supabase SQL Editor에서 `supabase/schema-v1.0.10.sql` 실행$en_desc$, $en_body$# Project Summary 분리 + 슬러그 동기화 저장

## Overview
1. Supabase SQL Editor에서 `supabase/schema-v1.0.10.sql` 실행

## Key Updates
- Project 설명을 마크다운으로 길게 작성하면 홈 Highlight에서 설명이 과도하게 길게 노출됨
- Admin의 `제목과 동일` 체크가 재진입 시 풀려 보이는 문제(Blog/Project 공통)
- Project 데이터 모델 확장
- `projects.home_summary` Add: 홈 Highlight용 짧은 Summary
- `projects.sync_slug_with_title` Add: 슬러그 자동 동기화 체크 저장
- Blog 데이터 모델 확장
- `posts.sync_slug_with_title` Add
- 홈 Highlight 설명 로직 Improvement

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 프로젝트 요약 분리 + 슬러그 동기화 저장

## 배경
- 프로젝트 설명을 마크다운으로 길게 작성하면 홈 하이라이트에서 설명이 과도하게 길게 노출됨
- 관리자의 `제목과 동일` 체크가 재진입 시 풀려 보이는 문제(블로그/프로젝트 공통)

## 변경 사항
- 프로젝트 데이터 모델 확장
  - `projects.home_summary` 추가: 홈 하이라이트용 짧은 요약
  - `projects.sync_slug_with_title` 추가: 슬러그 자동 동기화 체크 저장
- 블로그 데이터 모델 확장
  - `posts.sync_slug_with_title` 추가
- 홈 하이라이트 설명 로직 개선
  - 프로젝트 설명은 `home_summary` 우선 사용
  - 없으면 기존 `summary`를 plain text로 변환해 fallback
  - 최종 설명은 170자 제한으로 잘라 과도 노출 방지
- 관리자 저장/복원 로직 반영
  - 프로젝트 편집: `홈 노출 요약` 입력 필드 추가
  - 프로젝트/블로그 저장 payload에 `syncSlugWithTitle` 포함
  - 수정 화면 진입 시 DB 값으로 체크 상태 복원
- API/리포지토리/타입 반영
  - `types/projects.ts`, `types/blog.ts`, `types/ui.ts` 업데이트
  - `app/api/admin/projects*`, `app/api/admin/posts*` payload 파서 확장
  - `lib/projects/repository.ts`, `lib/blog/repository.ts`, `lib/home/repository.ts` 반영
- DB 마이그레이션
  - `supabase/schema-v1.0.10.sql` 추가

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과

## 적용 순서
1. Supabase SQL Editor에서 `supabase/schema-v1.0.10.sql` 실행
2. 관리자 프로젝트/블로그에서 저장 후 재진입해 체크 복원 확인
3. 홈 하이라이트에서 프로젝트 설명 길이 노출 확인$en_body$, ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'monitoring']::text[]),
  ('하이드레이션_안정화_기술스택_세로_정렬_수정_기능', $en_title$하이드레이션 안정화 + 기술스택 세로 정렬/Update 기능$en_title$, $en_desc$하이드레이션 안정화 + 기술스택 세로 정렬/Update 기능 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# 하이드레이션 안정화 + 기술스택 세로 정렬/Update 기능

## Overview
하이드레이션 안정화 + 기술스택 세로 정렬/Update 기능 work details을 Cleanup한 기록입니다.

## Key Updates
- Admin에서 간헐적으로 발생하는 hydration 경고 가능성을 줄인다.
- About 기술스택을 가로 나열이 아닌 세로 1줄 리스트로 Cleanup한다.
- About 기술스택 항목을 Add/Delete뿐 아니라 항목별 Update도 가능하게 만든다.
- 하이드레이션 안정화
- `components/admin/projects/projects-manager.tsx`
- 초기 렌더에서 사용하던 비결정 ID 생성(`Math.random`, `Date.now`) 제거
- 초기 목록 ID는 `createStableId(...)`로 결정적으로 생성
- 사용자 액션으로 새 항목 Add할 때만 `createClientId(...)` 사용

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 하이드레이션 안정화 + 기술스택 세로 정렬/수정 기능

## 작업 목적
- 관리자에서 간헐적으로 발생하는 hydration 경고 가능성을 줄인다.
- About 기술스택을 가로 나열이 아닌 세로 1줄 리스트로 정리한다.
- About 기술스택 항목을 추가/삭제뿐 아니라 항목별 수정도 가능하게 만든다.

## 변경 내용
- 하이드레이션 안정화
  - `components/admin/projects/projects-manager.tsx`
  - 초기 렌더에서 사용하던 비결정 ID 생성(`Math.random`, `Date.now`) 제거
  - 초기 목록 ID는 `createStableId(...)`로 결정적으로 생성
  - 사용자 액션으로 새 항목 추가할 때만 `createClientId(...)` 사용

- About 기술스택 UX 개선
  - `components/admin/about/about-manager.tsx`
  - DnD 전략을 가로(horizontal)에서 세로(vertical)로 변경
  - 기술스택 목록을 세로 카드 리스트(`space-y`)로 변경
  - 각 카드에서 기술명/로고URL/설명을 직접 수정 가능하도록 입력 필드 추가
  - 드래그 핸들(`≡`)로 순서 변경 + 삭제 기능 유지

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과

## 확인 포인트
- About 기술스택 항목 수정 후 저장 시 공개 페이지에 반영되는지
- About 기술스택 드래그 순서가 저장 후에도 유지되는지
- 관리자 진입 시 hydration 경고가 재발하는지$en_body$, ARRAY['workflow', 'refactor', 'admin', 'ui-ux', 'performance', 'monitoring']::text[]),
  ('홈_탭_단순화_프로젝트_입력_라벨_정리_v1_0_11', $en_title$홈 탭 단순화 + Project 입력 라벨 Cleanup (v1.0.11)$en_title$, $en_desc$1. Supabase SQL Editor에서 `supabase/v1/schema-v1.0.11.sql` 실행$en_desc$, $en_body$# 홈 탭 단순화 + Project 입력 라벨 Cleanup (v1.0.11)

## Overview
1. Supabase SQL Editor에서 `supabase/v1/schema-v1.0.11.sql` 실행

## Key Updates
- 홈 관리 탭에서 제목/설명/이미지 오버라이드를 제거하고 CTA 오버라이드만 유지
- 홈 관리 UI를 썸네일 미리보기 + 제목 중심 카드형으로 단순화
- 홈 관리 조작을 순서 이동 + 활성/비활성 + CTA 라벨 입력으로 제한
- Project 편집 폼 라벨/입력 방식 Cleanup
- `홈 노출 Summary` -> `부제목`
- `부제목` 입력을 textarea -> input으로 변경
- `Summary` -> `Project 내용`
- `Project 내용` 입력 최소 높이 180 -> 320

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 홈 탭 단순화 + 프로젝트 입력 라벨 정리 (v1.0.11)

## 변경 요약
- 홈 관리 탭에서 제목/설명/이미지 오버라이드를 제거하고 CTA 오버라이드만 유지
- 홈 관리 UI를 썸네일 미리보기 + 제목 중심 카드형으로 단순화
- 홈 관리 조작을 순서 이동 + 활성/비활성 + CTA 라벨 입력으로 제한
- 프로젝트 편집 폼 라벨/입력 방식 정리
  - `홈 노출 요약` -> `부제목`
  - `부제목` 입력을 textarea -> input으로 변경
  - `요약` -> `프로젝트 내용`
  - `프로젝트 내용` 입력 최소 높이 180 -> 320

## 코드 반영
- 타입
  - `types/home.ts`: `overrideTitle/overrideDescription/overrideImageUrl` 제거
- API
  - `app/api/admin/highlights/route.ts`: CTA-only payload 파싱으로 축소
- 리포지토리
  - `lib/home/repository.ts`:
    - home_highlights select/매핑에서 title/description/image 오버라이드 제거
    - 슬라이드 해석 시 원본 title/description/image 사용
    - CTA는 `overrideCtaLabel`만 적용
- 관리자 UI
  - `components/admin/home/home-manager.tsx`:
    - 썸네일+제목 카드형 리스트
    - 위/아래 이동, 활성화 토글, CTA 라벨 입력만 유지
    - 삭제/이미지 업로드/제목·설명 오버라이드 입력 제거
  - `components/admin/projects/projects-manager.tsx`:
    - 부제목 input 적용
    - 프로젝트 내용 라벨/placeholder 변경
    - MarkdownField 높이 320으로 상향

## DB 마이그레이션
- `supabase/v1/schema-v1.0.11.sql` 추가
  - `home_highlights.override_title` drop
  - `home_highlights.override_description` drop
  - `home_highlights.override_image_url` drop
  - `override_cta_label` 유지
  - `schema_migrations` 버전 기록 추가

## 검증
- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- `npm run build` 통과 (권한 상승 실행)

## 적용 순서
1. Supabase SQL Editor에서 `supabase/v1/schema-v1.0.11.sql` 실행
2. 관리자 `/admin/home`에서 순서/활성/CTA 저장 확인
3. 공개 홈에서 제목/설명/이미지가 원본 기준으로 출력되는지 확인$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'auth']::text[]),
  ('About_데스크탑_자동_리빌_1차', $en_title$About 데스크탑 자동 리빌 1차$en_title$, $en_desc$About 데스크탑 자동 리빌 1차 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# About 데스크탑 자동 리빌 1차

## Overview
About 데스크탑 자동 리빌 1차 work details을 Cleanup한 기록입니다.

## Key Updates
- `components/about/interactive-about-reveal.tsx`
- 데스크탑(`min-width: 1024px`)에서 클릭 없이 초기 진입 시 자동 리빌되도록 Status를 분리했습니다.
- `isDesktopAutoReveal` Status Add
- 실제 열림 여부는 `isOpen = isDesktopAutoReveal || isExpanded`로 통합
- 모바일은 기존 클릭 토글 동작을 그대로 유지합니다.
- 데스크탑 자동 리빌 Status에서는 버튼 클릭으로 접히지 않도록 가드했습니다.
- CSS 변수 표기 오타를 Cleanup했습니다.
- `min-h-[--home-hero-height]` -> `min-h-[var(--home-hero-height)]`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# About 데스크탑 자동 리빌 1차

## 변경 내용
- `components/about/interactive-about-reveal.tsx`
- 데스크탑(`min-width: 1024px`)에서 클릭 없이 초기 진입 시 자동 리빌되도록 상태를 분리했습니다.
  - `isDesktopAutoReveal` 상태 추가
  - 실제 열림 여부는 `isOpen = isDesktopAutoReveal || isExpanded`로 통합
- 모바일은 기존 클릭 토글 동작을 그대로 유지합니다.
- 데스크탑 자동 리빌 상태에서는 버튼 클릭으로 접히지 않도록 가드했습니다.
- CSS 변수 표기 오타를 정리했습니다.
  - `min-h-[--home-hero-height]` -> `min-h-[var(--home-hero-height)]`

## 검증
- `npx eslint components/about/interactive-about-reveal.tsx` 통과$en_body$, ARRAY['workflow', 'refactor', 'monitoring']::text[]),
  ('About_디바이스_훅_분리_모바일_프로필_상단_고정', $en_title$About 디바이스 훅 분리 + 모바일 프로필 상단 고정$en_title$, $en_desc$About 디바이스 훅 분리 + 모바일 프로필 상단 고정 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# About 디바이스 훅 분리 + 모바일 프로필 상단 고정

## Overview
About 디바이스 훅 분리 + 모바일 프로필 상단 고정 work details을 Cleanup한 기록입니다.

## Key Updates
- `isMobile`, `isDesktop` 판별 로직을 커스텀 훅으로 분리했습니다.
- `lib/hooks/use-device.ts` Add
- `window.matchMedia` 기반으로 모바일/데스크톱 Status 동기화
- `components/about/interactive-about-reveal.tsx`
- 컴포넌트 내부 `matchMedia` 직접 처리 로직 제거
- `useDevice()` 훅 사용으로 치환
- 모바일 프로필 위치를 상단 고정으로 Cleanup
- base: `top-0`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# About 디바이스 훅 분리 + 모바일 프로필 상단 고정

## 변경 내용
- `isMobile`, `isDesktop` 판별 로직을 커스텀 훅으로 분리했습니다.
  - `lib/hooks/use-device.ts` 추가
  - `window.matchMedia` 기반으로 모바일/데스크톱 상태 동기화
- `components/about/interactive-about-reveal.tsx`
  - 컴포넌트 내부 `matchMedia` 직접 처리 로직 제거
  - `useDevice()` 훅 사용으로 치환
  - 모바일 프로필 위치를 상단 고정으로 정리
    - base: `top-0`
    - expanded: 모바일 `top-0` 유지, 데스크톱만 우측 이동
  - 자동 리빌 타이밍은 디바이스별로 분기
    - 모바일: 더 빠르게 시작
    - 데스크톱: 기존보다 약간 느리게 시작
- `min-h-[--home-hero-height]` 표기 유지

## 검증
- `npx eslint components/about/interactive-about-reveal.tsx lib/hooks/use-device.ts`
- `npx tsc --noEmit`
- 두 검증 모두 통과$en_body$, ARRAY['workflow', 'refactor', 'ui-ux', 'monitoring']::text[]),
  ('공개_리스트_스켈레톤_순차_모션_적용', $en_title$Published 리스트 스켈레톤 + 순차 모션 Apply$en_title$, $en_desc$0번째 카드부터 아래->위 순서로 자연스럽게 올라오도록 구성했습니다.$en_desc$, $en_body$# Published 리스트 스켈레톤 + 순차 모션 Apply

## Overview
0번째 카드부터 아래->위 순서로 자연스럽게 올라오도록 구성했습니다.

## Key Updates
- Project/Blog 리스트 진입 시 로딩 Status가 비어 보여 체감이 딱딱했습니다.
- 카드 등장 모션이 동시에 시작되어 시선 흐름이 약했습니다.
- 리스트 페이지 카드 렌더에 `map`의 두 번째 인자(`index`)를 사용해 순차 지연을 Apply했습니다.
- `app/[lang]/(site)/projects/page.tsx`
- `animationDelay={index * 70}` Add
- `app/[lang]/(site)/blog/page.tsx`
- `animationDelay={index * 70}` Add
- 라우트 진입용 스켈레톤 파일을 신규 Add했습니다.

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 공개 리스트 스켈레톤 + 순차 모션 적용

## 작업 배경
- 프로젝트/블로그 리스트 진입 시 로딩 상태가 비어 보여 체감이 딱딱했습니다.
- 카드 등장 모션이 동시에 시작되어 시선 흐름이 약했습니다.

## 변경 내용
- 리스트 페이지 카드 렌더에 `map`의 두 번째 인자(`index`)를 사용해 순차 지연을 적용했습니다.
  - `app/[lang]/(site)/projects/page.tsx`
    - `animationDelay={index * 70}` 추가
  - `app/[lang]/(site)/blog/page.tsx`
    - `animationDelay={index * 70}` 추가
- 라우트 진입용 스켈레톤 파일을 신규 추가했습니다.
  - `app/[lang]/(site)/projects/loading.tsx`
  - `app/[lang]/(site)/blog/loading.tsx`
- 스켈레톤 카드도 `SlideIn`으로 감싸고 `delay={index * 70}`을 적용해
  0번째 카드부터 아래->위 순서로 자연스럽게 올라오도록 구성했습니다.

## 검증
- `npx eslint app/[lang]/(site)/projects/page.tsx app/[lang]/(site)/blog/page.tsx app/[lang]/(site)/projects/loading.tsx app/[lang]/(site)/blog/loading.tsx`
- `npx tsc --noEmit`
- 두 검증 모두 통과했습니다.$en_body$, ARRAY['workflow', 'animation', 'monitoring']::text[]),
  ('v1_0_14_관리자_UX_정비_About_상태_제거', $en_title$v1.0.14 Admin UX 정비 + About Status 제거$en_title$, $en_desc$v1.0.14 Admin UX 정비 + About Status 제거 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# v1.0.14 Admin UX 정비 + About Status 제거

## Overview
v1.0.14 Admin UX 정비 + About Status 제거 work details을 Cleanup한 기록입니다.

## Key Updates
- 홈 슬라이드 관리 탭에 Pagination 없이 필터만 Add
- About Published/비Published Status 기능을 DB/API/UI에서 제거
- Blog/Project 리스트를 썸네일/제목/태그/날짜 중심 미리보기형으로 강화
- 기존 더미데이터 생성 흔적 및 실제 더미 데이터 Cleanup
- 홈 슬라이드 관리
- 소스 필터(`전체 소스/Project/Blog`) Add
- 노출 필터(`전체 노출/활성/비활성`) Add
- 필터 Apply Status에서도 드래그 정렬/활성 토글/CTA 라벨 편집 유지

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# v1.0.14 관리자 UX 정비 + About 상태 제거

## 작업 목적
- 홈 슬라이드 관리 탭에 페이지네이션 없이 필터만 추가
- About 공개/비공개 상태 기능을 DB/API/UI에서 제거
- 블로그/프로젝트 리스트를 썸네일/제목/태그/날짜 중심 미리보기형으로 강화
- 기존 더미데이터 생성 흔적 및 실제 더미 데이터 정리

## 적용 내용
- 홈 슬라이드 관리
  - 소스 필터(`전체 소스/프로젝트/블로그`) 추가
  - 노출 필터(`전체 노출/활성/비활성`) 추가
  - 필터 적용 상태에서도 드래그 정렬/활성 토글/CTA 라벨 편집 유지
- About 상태 제거
  - `types/profile.ts`에서 `status` 필드 제거
  - `lib/profile/repository.ts`에서 `profile_content.status` 의존 제거
  - `/api/admin/about` 요청/응답에서 `status` 제거
  - 관리자 About 탭에서 상태 배지/라디오 제거
  - 대시보드의 About 상태 표시를 이름/최종 변경일 중심으로 정리
- 관리자 리스트 미리보기 강화
  - 블로그/프로젝트 모두 리스트 행에 썸네일, 제목, 태그(상위 3개), 날짜 표시
  - 블로그 날짜는 `publishedAt` 우선, 없으면 `updatedAt` 사용
  - 프로젝트 날짜는 `updatedAt` 고정
- SQL 정리
  - `supabase/v1/schema-v1.0.5.sql`에서 더미 insert 블록 제거(인덱스 전용)
  - `supabase/v1/schema-v1.0.14.sql` 추가
    - `profile_content.status` 제거
    - `profile_public_read` 정책을 상시 조회로 재정의
    - 더미 posts/projects/contact_messages 삭제
    - `schema_migrations` 기록/보정

## 확인 포인트
- `/admin/home` 필터 조합별 목록 노출 확인
- `/admin/about`에서 상태 UI 제거 및 저장 정상 동작 확인
- `/admin/blog`, `/admin/projects` 리스트의 미리보기 요소 노출 확인
- `schema-v1.0.14.sql` 실행 전 백업 여부 확인 후 적용$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('관리자_헤더_매니저_구조_리팩터링', $en_title$Admin 헤더/매니저 구조 리팩터링$en_title$, $en_desc$Admin 헤더/매니저 구조 리팩터링 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Admin 헤더/매니저 구조 리팩터링

## Overview
Admin 헤더/매니저 구조 리팩터링 work details을 Cleanup한 기록입니다.

## Key Updates
- dashboard와 home의 책임 분리
- Admin 탭 헤더를 ManagerShell로 통일
- 필터/선택박스/버튼 영역을 공통 Toolbar 컴포넌트로 통일
- 홈 매니저 네이밍을 `dashboard-home-manager`에서 `home-manager`로 Cleanup
- 매니저 분리/리네임
- `components/admin/home/dashboard-home-manager.tsx` -> `components/admin/home/home-manager.tsx`
- `DashboardHomeManager` -> `HomeManager`
- `DashboardHomeManagerProps` -> `HomeManagerProps`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 관리자 헤더/매니저 구조 리팩터링

## 작업 목적
- dashboard와 home의 책임 분리
- 관리자 탭 헤더를 ManagerShell로 통일
- 필터/선택박스/버튼 영역을 공통 Toolbar 컴포넌트로 통일
- 홈 매니저 네이밍을 `dashboard-home-manager`에서 `home-manager`로 정리

## 적용 내용
- 매니저 분리/리네임
  - `components/admin/home/dashboard-home-manager.tsx` -> `components/admin/home/home-manager.tsx`
  - `DashboardHomeManager` -> `HomeManager`
  - `DashboardHomeManagerProps` -> `HomeManagerProps`
  - `/admin/home/page.tsx` import/사용처 갱신
- 대시보드 분리
  - `components/admin/dashboard/dashboard-manager.tsx` 신설
  - `/admin/(protected)/dashboard/page.tsx`는 데이터 fetch + `<DashboardManager />`만 담당
- ManagerShell 표준화
  - `ManagerShellProps`에 `title` 필드 추가
  - ManagerShell 내부에서 공통 title 렌더
  - `home/blog/projects/contact/about` 탭의 page-level `h1` 제거
- Toolbar 공통화
  - `components/admin/common/admin-toolbar.tsx` 신설
    - `AdminToolbar`
    - `AdminToolbarSelect`
    - `AdminToolbarAction`
  - home/blog/projects/contact의 action 영역을 공통 Toolbar로 교체

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 실패(네트워크 제한으로 Google Fonts 접근 불가)$en_body$, ARRAY['workflow', 'refactor', 'admin', 'ui-ux', 'monitoring']::text[]),
  ('대시보드_홈_네이밍_통일', $en_title$대시보드 홈 네이밍 통일$en_title$, $en_desc$대시보드 홈 네이밍 통일 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# 대시보드 홈 네이밍 통일

## Overview
대시보드 홈 네이밍 통일 work details을 Cleanup한 기록입니다.

## Key Updates
- 홈 Highlight 관리 기능이 대시보드 운영 흐름에 통합된 Status인데, 코드/컴포넌트 네이밍이 `HomeHighlightManager`로 남아 있어 의미가 혼재되고 있었습니다.
- `/admin/highlight` 경로가 일부 링크에 남아 있어 실제 운영 경로(`/admin/home`)와 불일치가 발생하고 있었습니다.
- Admin 홈 관리 컴포넌트 파일명을 변경했습니다.
- `components/admin/home/home-manager.tsx`
- -> `components/admin/home/dashboard-home-manager.tsx`
- 컴포넌트/타입 네이밍을 대시보드 criteria으로 통일했습니다.
- `HomeHighlightManager` -> `DashboardHomeManager`
- `HomeHighlightManagerProps` -> `DashboardHomeManagerProps`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 대시보드 홈 네이밍 통일

## 작업 배경
- 홈 하이라이트 관리 기능이 대시보드 운영 흐름에 통합된 상태인데, 코드/컴포넌트 네이밍이 `HomeHighlightManager`로 남아 있어 의미가 혼재되고 있었습니다.
- `/admin/highlight` 경로가 일부 링크에 남아 있어 실제 운영 경로(`/admin/home`)와 불일치가 발생하고 있었습니다.

## 변경 내용
- 관리자 홈 관리 컴포넌트 파일명을 변경했습니다.
  - `components/admin/home/home-manager.tsx`
  - -> `components/admin/home/dashboard-home-manager.tsx`
- 컴포넌트/타입 네이밍을 대시보드 기준으로 통일했습니다.
  - `HomeHighlightManager` -> `DashboardHomeManager`
  - `HomeHighlightManagerProps` -> `DashboardHomeManagerProps`
- 관리자 홈 페이지의 import 및 페이지 함수명을 정리했습니다.
  - `app/admin/(protected)/home/page.tsx`
  - `AdminHighlightPage` -> `AdminDashboardHomePage`
  - 페이지 제목: `홈 관리` -> `대시보드 홈 관리`
- 홈 로딩 컴포넌트 함수명을 정리했습니다.
  - `app/admin/(protected)/home/loading.tsx`
  - `AdminHighlightLoading` -> `AdminDashboardHomeLoading`
- 대시보드 내부 링크를 실제 운영 경로로 통일했습니다.
  - `app/admin/(protected)/dashboard/page.tsx`
  - `/admin/highlight` -> `/admin/home`
  - 카드 라벨 `홈 하이라이트` -> `대시보드 홈`
- 저장 성공/실패 메시지 문구를 대시보드 맥락으로 정리했습니다.

## 검증
- `npx eslint app/admin/(protected)/home/page.tsx app/admin/(protected)/home/loading.tsx app/admin/(protected)/dashboard/page.tsx components/admin/home/dashboard-home-manager.tsx types/ui.ts`
- `npx tsc --noEmit`
- 두 검증 모두 통과했습니다.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'ui-ux', 'deployment', 'monitoring']::text[]),
  ('더미데이터_정리_최종_스키마_정리_v1_0_15', $en_title$더미데이터 Cleanup + 최종 Schema Cleanup (v1.0.15)$en_title$, $en_desc$1. `supabase/v1/schema-v1.0.15.sql`$en_desc$, $en_body$# 더미데이터 Cleanup + 최종 Schema Cleanup (v1.0.15)

## Overview
1. `supabase/v1/schema-v1.0.15.sql`

## Key Updates
- Project/Blog/Contact함의 기존 테스트 더미 데이터를 제거하고, 운영 시연에 사용할 수 있는 현실적인 샘플 데이터를 재구성한다.
- `supabase/v1` criteria 최종 구조를 한 번에 확인/Apply할 수 있는 통합 Schema 파일을 Add한다.
- 기존 더미 패턴(`dummy-*`, `test-*`, `[더미]`) 및 기존 seed 슬러그 기반 데이터 Cleanup.
- `posts` 10건, `projects` 10건, `contact_messages` 10건 현실형 샘플 데이터 재삽입.
- `contact_messages.status`를 `new|replied`로 정규화(`read -> replied`) 후 체크 제약 재정의.
- `post_tags`, `post_tag_map`를 샘플 태그 criteria으로 재구성.
- v1.0.0 ~ v1.0.15 누적 결과를 반영한 최종 통합 구조 Schema Add.
- 포함 범위:

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 더미데이터 정리 + 최종 스키마 정리 (v1.0.15)

## 작업 목적
- 프로젝트/블로그/문의함의 기존 테스트 더미 데이터를 제거하고, 운영 시연에 사용할 수 있는 현실적인 샘플 데이터를 재구성한다.
- `supabase/v1` 기준 최종 구조를 한 번에 확인/적용할 수 있는 통합 스키마 파일을 추가한다.

## 반영 내용
1. `supabase/v1/schema-v1.0.15.sql`
- 기존 더미 패턴(`dummy-*`, `test-*`, `[더미]`) 및 기존 seed 슬러그 기반 데이터 정리.
- `posts` 10건, `projects` 10건, `contact_messages` 10건 현실형 샘플 데이터 재삽입.
- `contact_messages.status`를 `new|replied`로 정규화(`read -> replied`) 후 체크 제약 재정의.
- `post_tags`, `post_tag_map`를 샘플 태그 기준으로 재구성.

2. `supabase/v1/schema-v1.0.15-최종.sql` (신규)
- v1.0.0 ~ v1.0.15 누적 결과를 반영한 최종 통합 구조 스키마 추가.
- 포함 범위:
  - enum/type
  - tables/columns/defaults/constraints
  - trigger/functions
  - indexes
  - grants + RLS policies
  - 운영 기본 seed(profile singleton/admin allowlist/storage bucket)
  - schema_migrations 기록
- 제외 범위:
  - 샘플 콘텐츠 더미 데이터(posts/projects/contact_messages)

## 확인 포인트
- 최종 통합 스키마에는 삭제 완료된 레거시 필드(`reading_time`, `about_intro_description_ko`, `about_experience`, `work_style`, `strengths`, `profile_content.status`, `home_highlights`의 제거된 override 필드)가 포함되지 않음.

## 다음 적용 순서(권장)
1. Supabase SQL Editor에서 `schema-v1.0.15.sql` 실행(데이터 정리+샘플 입력).
2. 신규 환경 전체 초기화가 필요할 때만 `schema-v1.0.15-최종.sql` 사용.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'deployment']::text[]),
  ('로컬_수정_프로덕션_캐시_동기화', $en_title$로컬 Update-프로덕션 캐시 동기화$en_title$, $en_desc$1. 공통 revalidate 전략 확장 (`lib/cache/revalidate.ts`)$en_desc$, $en_body$# 로컬 Update-프로덕션 캐시 동기화

## Overview
1. 공통 revalidate 전략 확장 (`lib/cache/revalidate.ts`)

## Key Updates
- 로컬 Admin에서 데이터 저장 시, 로컬 서버의 `revalidatePath`만 실행되어 프로덕션 캐시에는 즉시 반영되지 않는 문제가 있었다.
- 기존 locale별 경로 `revalidatePath`는 유지.
- 로컬/개발 환경에서만 선택적으로 프로덕션에 재Validation 요청을 전파하도록 확장.
- 신규 환경변수:
- `REVALIDATE_TARGET_URL`
- `REVALIDATE_SECRET`
- `POST /api/internal/revalidate`
- 헤더 `x-revalidate-secret` Validation 후 전달받은 `paths`를 현재 인스턴스에서 재Validation.

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 로컬 수정-프로덕션 캐시 동기화

## 배경
- 로컬 관리자에서 데이터 저장 시, 로컬 서버의 `revalidatePath`만 실행되어 프로덕션 캐시에는 즉시 반영되지 않는 문제가 있었다.

## 변경 내용
1. 공통 revalidate 전략 확장 (`lib/cache/revalidate.ts`)
- 기존 locale별 경로 `revalidatePath`는 유지.
- 로컬/개발 환경에서만 선택적으로 프로덕션에 재검증 요청을 전파하도록 확장.
- 신규 환경변수:
  - `REVALIDATE_TARGET_URL`
  - `REVALIDATE_SECRET`

2. 내부 revalidate API 추가 (`app/api/internal/revalidate/route.ts`)
- `POST /api/internal/revalidate`
- 헤더 `x-revalidate-secret` 검증 후 전달받은 `paths`를 현재 인스턴스에서 재검증.
- 권한 없는 호출은 401 반환.

3. 관리자 mutation 라우트 await 처리
- `posts/projects/about/highlights` 저장/수정/삭제 라우트에서
  `await revalidate...` 적용.
- 대상 파일:
  - `app/api/admin/posts/route.ts`
  - `app/api/admin/posts/[id]/route.ts`
  - `app/api/admin/projects/route.ts`
  - `app/api/admin/projects/[id]/route.ts`
  - `app/api/admin/about/route.ts`
  - `app/api/admin/highlights/route.ts`

4. 환경변수 예시 문서화
- `.env.example`에 `REVALIDATE_TARGET_URL`, `REVALIDATE_SECRET` 추가.

## 적용 가이드
- 로컬 `.env.local`:
  - `REVALIDATE_TARGET_URL=https://j-fe-blog.vercel.app`
  - `REVALIDATE_SECRET=<랜덤 시크릿>`
- Vercel Production 환경변수:
  - `REVALIDATE_SECRET=<동일 값>`
- 이후 로컬 관리자 저장 시:
  - 로컬 캐시 + 프로덕션 캐시 동시 무효화.

## 검증
- `npx tsc --noEmit` 통과.

## 실제 적용 결과(운영)
- Vercel Production 환경변수 `REVALIDATE_SECRET` 추가 완료.
- 테스트용 임시 변수 `CODEx_TEMP_REVALIDATE_TEST`는 제거 완료.
- 최신 배포를 재실행하고 `j-fe-blog.vercel.app` alias를 최신 배포로 재지정 완료.

## 엔드포인트 검증
- `POST /api/internal/revalidate` (헤더 없음) -> `401 Unauthorized` 확인.
- 동일 엔드포인트에 로컬 `REVALIDATE_SECRET` 헤더 포함 -> `200` 확인.
- 결과적으로 로컬 관리자 저장 시 프로덕션 캐시 동기화 경로가 활성화됨.

## 추가 원인 분석 및 보정
- 공개 페이지가 `/blog`로 접속되더라도 실제 렌더는 middleware rewrite로 `/ko/blog` 경로에서 수행된다.
- 기존 revalidate는 기본 로케일(ko)에 대해 `/blog`만 무효화해 `/ko/blog` 캐시를 놓칠 수 있었다.
- 보정:
  - revalidate 대상 경로를 locale별로 `withLocalePath` + `withLocaleRoutePath`를 모두 포함하도록 수정.
  - 예: `/blog` + `/ko/blog` 동시 무효화.

## 추가 보강(즉시 반영 안정화)
- 프로덕션 공개 응답 헤더 점검 시 `x-vercel-cache: HIT`와 `age` 누적이 확인되어, 캐시 계층 영향 가능성이 남아 있었다.
- 보강:
  1. `app/[lang]/(site)/layout.tsx`
  - `headers()` 호출을 추가해 공개 라우트를 명시적으로 Request-time 렌더링으로 고정.
  2. `lib/supabase/service.ts`
  - 서비스 클라이언트의 `global.fetch`를 `cache: "no-store"` + `next.revalidate = 0`으로 강제.
  - 서버 측 Supabase 조회가 항상 최신 DB 값을 읽도록 보강.
- 검증:
  - `npm run lint` 통과.
  - `npx tsc --noEmit` 통과.$en_body$, ARRAY['workflow', 'admin', 'supabase', 'database', 'auth', 'deployment']::text[]),
  ('배포_스크립트_추가', $en_title$Deployment 스크립트 Add$en_title$, $en_desc$Deployment 스크립트 Add work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Deployment 스크립트 Add

## Overview
Deployment 스크립트 Add work details을 Cleanup한 기록입니다.

## Key Updates
- 매번 수동으로 `npx vercel --prod --yes`를 입력하지 않도록 Deployment 명령을 npm script로 통일.
- `package.json` scripts에 아래 항목 Add:
- `deploy`: `npx vercel --prod --yes`
- 프로덕션 Deployment:
- `npm run deploy`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 배포 스크립트 추가

## 목적
- 매번 수동으로 `npx vercel --prod --yes`를 입력하지 않도록 배포 명령을 npm script로 통일.

## 변경 사항
- `package.json` scripts에 아래 항목 추가:
  - `deploy`: `npx vercel --prod --yes`

## 사용 방법
- 프로덕션 배포:
  - `npm run deploy`$en_body$, ARRAY['workflow', 'deployment', 'vercel', 'monitoring']::text[]),
  ('v2_네이밍_주석_다국어_조회_정비', $en_title$v2 네이밍/주석/Localization 조회 정비$en_title$, $en_desc$v2 네이밍/주석/Localization 조회 정비 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# v2 네이밍/주석/Localization 조회 정비

## Overview
v2 네이밍/주석/Localization 조회 정비 work details을 Cleanup한 기록입니다.

## Key Updates
- Implement 코드 핵심 함수 위주 한국어 주석 Add
- 타입 네이밍 Cleanup
- `types/contacts.ts`, `types/about.ts`, `types/home-slide.ts`, `types/content-locale.ts`
- Admin API 경로 정식화
- `/api/admin/home-slide` 신설
- `/api/admin/highlights`는 호환 alias 유지
- 도메인 함수명 Cleanup(호환 alias 포함)
- home: `*HomeSlide*`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# v2 네이밍/주석/다국어 조회 정비

## 오늘 작업 요약
- 구현 코드 핵심 함수 위주 한국어 주석 추가
- 타입 네이밍 정리
  - `types/contacts.ts`, `types/about.ts`, `types/home-slide.ts`, `types/content-locale.ts`
- 관리자 API 경로 정식화
  - `/api/admin/home-slide` 신설
  - `/api/admin/highlights`는 호환 alias 유지
- 도메인 함수명 정리(호환 alias 포함)
  - home: `*HomeSlide*`
  - contact: `*Contact*`
  - about: `*About*`
- 공개 다국어 조회 1차 반영
  - 블로그: locale 번역 우선 + KO fallback
  - 프로젝트: locale 번역 우선 + KO fallback

## 품질 확인
- `npm run -s lint` 통과
- `npx tsc --noEmit` 통과

## 메모
- 기존 호출부 회귀 방지를 위해 구 네이밍 alias는 임시 유지
- 다음 단계에서 관리자 locale 탭 UI와 번역 저장 UX를 확장 예정$en_body$, ARRAY['workflow', 'refactor', 'admin', 'ui-ux', 'vercel', 'monitoring']::text[]),
  ('v2_1_로케일_테이블_전환_About_카테고리_탭_적용', $en_title$v2.1 로케일 테이블 전환 + About 카테고리 탭 Apply$en_title$, $en_desc$서버 저장소/조회 로직을 실제 코드에 반영했습니다.$en_desc$, $en_body$# v2.1 로케일 테이블 전환 + About 카테고리 탭 Apply

## Overview
서버 저장소/조회 로직을 실제 코드에 반영했습니다.

## Key Updates
- v2.1 Schema criteria(`about locale row`, `about_tech_stack`, `posts_en/ja`, `projects_en/ja`)으로
- Admin About의 기술 항목을 카테고리 탭 기반으로 편집할 수 있게 확장했습니다.
- Published About Tech Stack 영역에 카테고리 탭을 Add하고, 항목 4개 초과 시 Swiper로 노출되도록 변경했습니다.
- `supabase/v2/schema-v2.1.0.sql`
- `is_admin_user()` 호환 함수 Add(`is_admin_email()` 래핑)
- `lib/profile/repository.ts`
- `about_translations` 의존 제거
- `about(locale row)` + `about_tech_stack` 조합 조회/저장으로 전환

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# v2.1 로케일 테이블 전환 + About 카테고리 탭 적용

## 작업 목적

- v2.1 스키마 기준(`about locale row`, `about_tech_stack`, `posts_en/ja`, `projects_en/ja`)으로
  서버 저장소/조회 로직을 실제 코드에 반영했습니다.
- 관리자 About의 기술 항목을 카테고리 탭 기반으로 편집할 수 있게 확장했습니다.
- 공개 About 기술 스택 영역에 카테고리 탭을 추가하고, 항목 4개 초과 시 Swiper로 노출되도록 변경했습니다.

## 주요 변경

1. DB 마이그레이션 보강
- `supabase/v2/schema-v2.1.0.sql`
  - `is_admin_user()` 호환 함수 추가(`is_admin_email()` 래핑)

2. 저장소 전환
- `lib/profile/repository.ts`
  - `about_translations` 의존 제거
  - `about(locale row)` + `about_tech_stack` 조합 조회/저장으로 전환
  - KO 원본 + EN/JA 번역 맵 구조 유지
- `lib/blog/repository.ts`
  - `posts_translations` 제거
  - `posts_en`, `posts_ja` 조회/업서트로 전환
- `lib/projects/repository.ts`
  - `projects_translations` 제거
  - `projects_en`, `projects_ja` 조회/업서트로 전환

3. 관리자 About 입력 확장
- `components/admin/about/about-manager.tsx`
  - 기술 항목에 `category` 필드 추가
  - 카테고리 탭(자동 생성) + 카테고리별 드래그 정렬 적용
  - 저장 payload에 category 포함

4. About API 파서 정합화
- `app/api/admin/about/route.ts`
  - KO/EN/JA 기술 항목 파싱 시 `category` 필드 검증/정규화 추가

5. 공개 About UI 개선
- `components/about/interactive-about-reveal.tsx`
  - 기술 스택 카테고리 탭 추가
  - 카테고리 항목 수가 4개 초과일 때 Swiper 렌더 적용

## 검증 결과

- `npm run -s lint` 통과(기존 unused warning 1건만 유지)
- `npx tsc --noEmit` 통과
- `npm run -s build` 통과$en_body$, ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'monitoring']::text[]),
  ('관리자_EN_JA_입력_확장_정비', $en_title$Admin EN/JA 입력 확장 정비$en_title$, $en_desc$Admin EN/JA 입력 확장 정비 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Admin EN/JA 입력 확장 정비

## Overview
Admin EN/JA 입력 확장 정비 work details을 Cleanup한 기록입니다.

## Key Updates
- Admin에서 KO 기본 콘텐츠 외에 EN/JA 입력을 직접 저장하고 재Update할 수 있도록 정비.
- v2 SQL Apply 중 발생한 `is_admin_user()` 함수 Error를 Schema criteria에 맞게 Cleanup.
- Blog Admin:
- EN/JA 번역 탭(제목, 설명, 태그, 본문) 입력/저장/재조회 흐름 연결.
- 폼 dirty 스냅샷 비교에 번역 데이터 포함.
- Project Admin:
- EN/JA 번역 탭(제목, 부제목, 태그, Project 내용) 입력 UI Add.
- 저장 payload에 `translations` 포함 및 편집 진입 시 번역 데이터 복원.

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 관리자 EN/JA 입력 확장 정비

## 작업 목적
- 관리자에서 KO 기본 콘텐츠 외에 EN/JA 입력을 직접 저장하고 재수정할 수 있도록 정비.
- v2 SQL 적용 중 발생한 `is_admin_user()` 함수 오류를 스키마 기준에 맞게 정리.

## 적용 내용
- 블로그 관리자:
  - EN/JA 번역 탭(제목, 설명, 태그, 본문) 입력/저장/재조회 흐름 연결.
  - 폼 dirty 스냅샷 비교에 번역 데이터 포함.
- 프로젝트 관리자:
  - EN/JA 번역 탭(제목, 부제목, 태그, 프로젝트 내용) 입력 UI 추가.
  - 저장 payload에 `translations` 포함 및 편집 진입 시 번역 데이터 복원.
- 소개 관리자:
  - EN/JA 번역 탭(이름, 직함, 소개) 입력 UI 추가.
  - 저장 payload에 번역 데이터 포함, 저장 후 재조회 데이터로 상태 동기화.
- API/리포지토리:
  - posts/projects/about 관리자 API에서 EN/JA 번역 파싱 및 upsert 연결.
  - 번역 테이블(`posts_translations`, `projects_translations`, `about_translations`) 저장 로직 사용.
- SQL:
  - `supabase/v2/schema-v2.0.0.sql`의 정책 함수 참조를 `public.is_admin_email()` 기준으로 정리.

## 검증 결과
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
- `npm run -s build` 통과 (외부 네트워크 허용 환경에서 확인)

## 비고
- 번역 데이터가 비어 있으면 공개 페이지는 KO 기본 콘텐츠로 fallback.
- 현재 About 번역의 기술 항목(`aboutTechItems`)은 폼에서 별도 편집하지 않고 기본값(`[]`) 저장 정책으로 유지.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('관리자_KO_EN_JA_탭_입력_통일', $en_title$Admin KO/EN/JA 탭 입력 통일$en_title$, $en_desc$Admin KO/EN/JA 탭 입력 통일 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Admin KO/EN/JA 탭 입력 통일

## Overview
Admin KO/EN/JA 탭 입력 통일 work details을 Cleanup한 기록입니다.

## Key Updates
- Blog / Projects / About Admin 입력을 기존 섹션 내부에서 `KO | EN | JA` 탭 전환 방식으로 통일.
- KO는 기본 테이블, EN/JA는 번역 테이블 저장 정책 유지.
- About의 EN/JA 번역에서도 기술 항목(이름/설명/로고/순서) 편집 가능하도록 확장.
- 공통 로케일 탭 컴포넌트 Add:
- `components/admin/common/locale-tabs.tsx`
- 세 매니저가 동일한 탭 UI를 재사용하도록 Cleanup.
- Blog Admin:
- 제목/설명/태그/본문 입력을 탭 전환으로 통합.

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 관리자 KO/EN/JA 탭 입력 통일

## 작업 목표
- Blog / Projects / About 관리자 입력을 기존 섹션 내부에서 `KO | EN | JA` 탭 전환 방식으로 통일.
- KO는 기본 테이블, EN/JA는 번역 테이블 저장 정책 유지.
- About의 EN/JA 번역에서도 기술 항목(이름/설명/로고/순서) 편집 가능하도록 확장.

## 적용 내용
- 공통 로케일 탭 컴포넌트 추가:
  - `components/admin/common/locale-tabs.tsx`
  - 세 매니저가 동일한 탭 UI를 재사용하도록 정리.
- 블로그 관리자:
  - 제목/설명/태그/본문 입력을 탭 전환으로 통합.
  - 기존 EN/JA 별도 카드 제거.
- 프로젝트 관리자:
  - 제목/부제목/태그/프로젝트 내용을 탭 전환으로 통합.
  - 기존 EN/JA 별도 카드 제거.
  - KO 탭은 기존 `projects` 필드, EN/JA 탭은 `projects_translations` 필드로 저장.
- 소개 관리자:
  - 이름/직함/요약 + 기술 항목 리스트를 탭 전환으로 통합.
  - EN/JA 번역에 기술 항목 저장(`about_translations.about_tech_items`) 반영.
  - 기술 항목 추가/수정/삭제/드래그 정렬을 KO/EN/JA 각각 독립 유지.

## 검증
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
- `npm run -s build` 통과

## 비고
- EN/JA 번역 미입력 시 공개 페이지는 기존 정책대로 KO 콘텐츠 fallback.
- Contact/Home 탭은 이번 범위에서 다국어 탭 입력 대상 제외.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'database', 'ui-ux', 'monitoring']::text[]),
  ('도메인_별칭_불일치_원인_해결', $en_title$도메인 별칭 불일치 원인 Fix$en_title$, $en_desc$`j-fe-blog.vercel.app`에는 반영되지 않는 현상이 발생했다.$en_desc$, $en_body$# 도메인 별칭 불일치 원인 Fix

## Overview
`j-fe-blog.vercel.app`에는 반영되지 않는 현상이 발생했다.

## Key Updates
- 동일 Project에서 최신 Deployment URL(`j-blog-8y50...`)은 변경사항이 보이는데,
- `j-fe-blog.vercel.app` alias가 최신 Deployment가 아니라 이전 Deployment를 가리키고 있었다.
- 이전에 처음 Deployment를 진행했던 도메인 `j-blog-two.vercel.app` alias가 current Deployment를 가리키고 있었다는거다.
- 확인 결과:
- 이전 source: `j-blog-hq17ubm8j-...`
- 최신 source: `j-blog-8y50myy6u-...`
- 즉, 코드/DB 문제가 아니라 Vercel alias 포인터 불일치 문제였다.
- alias 재지정 실행:

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 도메인 별칭 불일치 원인 해결

## 증상

- 동일 프로젝트에서 최신 배포 URL(`j-blog-8y50...`)은 변경사항이 보이는데,
  `j-fe-blog.vercel.app`에는 반영되지 않는 현상이 발생했다.

## 원인

- `j-fe-blog.vercel.app` alias가 최신 배포가 아니라 이전 배포를 가리키고 있었다.
- 이전에 처음 배포를 진행했던 도메인 `j-blog-two.vercel.app` alias가 current 배포를 가리키고 있었다는거다.
- 확인 결과:
  - 이전 source: `j-blog-hq17ubm8j-...`
  - 최신 source: `j-blog-8y50myy6u-...`
- 즉, 코드/DB 문제가 아니라 Vercel alias 포인터 불일치 문제였다.

## 조치

- alias 재지정 실행:
  - `npx vercel alias set j-blog-8y50myy6u-wogml3270s-projects.vercel.app j-fe-blog.vercel.app`
- 재확인:
  - `npx vercel alias ls`에서 `j-fe-blog.vercel.app` source가 최신 배포로 변경됨.

## 추가 조치 (2026-04-14)

- develop 브랜치 푸시 시 Preview 배포가 계속 생성되는 문제를 코드 설정으로 제한하기 위해
  프로젝트 루트에 `vercel.json`을 추가했다.
- 적용 값:
  - `git.deploymentEnabled.main = true`
  - `git.deploymentEnabled.develop = false`
- 목적:
  - main 운영 배포는 유지
  - develop 자동 배포는 차단

## 참고

- 배포 URL 자체(`https://j-blog-...vercel.app`)가 401로 보일 수 있는데, 이는 배포 보호 설정 영향일 수 있다.
- 운영 확인은 실제 서비스 도메인(`j-fe-blog.vercel.app`) 기준으로 검증한다.$en_body$, ARRAY['workflow', 'database', 'deployment', 'vercel', 'bugfix', 'monitoring']::text[]),
  ('어바웃_기술스택_카테고리_enum_전환', $en_title$어바웃 기술스택 카테고리 enum 전환$en_title$, $en_desc$어바웃 기술스택 카테고리 enum 전환 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# 어바웃 기술스택 카테고리 enum 전환

## Overview
어바웃 기술스택 카테고리 enum 전환 work details을 Cleanup한 기록입니다.

## Key Updates
- 기존 `about_tech_stack.category`를 자유 문자열로 저장하면서 카테고리 오탈자/중복(예: 프론트엔드, frontend, 프론트) 관리가 어려웠습니다.
- 카테고리 순서와 값이 고정되지 않아 UI 탭 렌더에서 일관성이 떨어졌고, 클라이언트 렌더 차이 가능성도 커졌습니다.
- 기술스택 카테고리를 고정 enum으로 정의했습니다.
- enum 값: `frontend`, `backend`, `database`, `infrastructure`, `version_control`, `other`
- 신규 유틸 Add: `lib/about/tech-categories.ts`
- 카테고리 순서 상수
- 로케일별 라벨 맵
- 레거시 문자열 -> enum 정규화 함수

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 어바웃 기술스택 카테고리 enum 전환

## 배경
- 기존 `about_tech_stack.category`를 자유 문자열로 저장하면서 카테고리 오탈자/중복(예: 프론트엔드, frontend, 프론트) 관리가 어려웠습니다.
- 카테고리 순서와 값이 고정되지 않아 UI 탭 렌더에서 일관성이 떨어졌고, 클라이언트 렌더 차이 가능성도 커졌습니다.

## 변경 내용
- 기술스택 카테고리를 고정 enum으로 정의했습니다.
- enum 값: `frontend`, `backend`, `database`, `infrastructure`, `version_control`, `other`
- 신규 유틸 추가: `lib/about/tech-categories.ts`
  - 카테고리 순서 상수
  - 로케일별 라벨 맵
  - 레거시 문자열 -> enum 정규화 함수
- 관리자 About UI를 자유입력에서 선택형으로 변경했습니다.
  - 항목 추가 카테고리 입력: `Input` -> `select`
  - 항목 수정 카테고리 입력: `Input` -> `select`
- 공개 About 탭도 고정 enum 순서 기반으로 렌더되도록 변경했습니다.

## DB 마이그레이션
- `supabase/v2/schema-v2.1.1.sql` 추가
  - `public.about_tech_category` enum 타입 생성
  - `about_tech_stack.category`를 enum으로 안전 전환
  - 기존 한글/영문 카테고리 값 매핑 로직 포함
  - 인덱스 재생성
  - `schema_migrations` 버전 기록 (`v2.1.1`)

## 검증
- `npm run -s lint` 통과 (기존 경고 1건 유지)
- `npx tsc --noEmit` 통과
- `npm run -s build` 통과

## 비고
- API/리포지토리에서도 카테고리를 정규화해 저장하므로, 구 데이터/외부 입력이 들어와도 enum 규칙으로 보정됩니다.$en_body$, ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'monitoring']::text[]),
  ('프로젝트_EN_JA_성과_기여_입력_확장', $en_title$Project EN/JA 성과/기여 입력 확장$en_title$, $en_desc$1. Project 번역 타입 확장$en_desc$, $en_body$# Project EN/JA 성과/기여 입력 확장

## Overview
1. Project 번역 타입 확장

## Key Updates
- Admin Project 탭에서 KO뿐 아니라 EN/JA에서도 `성과`, `주요 기여`를 입력/정렬/저장할 수 있도록 확장.
- `types/projects.ts`
- `ProjectTranslationInput`에 아래 필드 Add
- `achievements: string[]`
- `contributions: string[]`
- `app/api/admin/projects/route.ts`
- `app/api/admin/projects/[id]/route.ts`
- `parseTranslations()`에서 EN/JA 번역 payload에 아래 배열 필드 파싱 Add

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 프로젝트 EN/JA 성과/기여 입력 확장

## 작업 목적
- 관리자 프로젝트 탭에서 KO뿐 아니라 EN/JA에서도 `성과`, `주요 기여`를 입력/정렬/저장할 수 있도록 확장.

## 변경 내용
1. 프로젝트 번역 타입 확장
- `types/projects.ts`
- `ProjectTranslationInput`에 아래 필드 추가
  - `achievements: string[]`
  - `contributions: string[]`

2. 관리자 API 번역 파서 확장
- `app/api/admin/projects/route.ts`
- `app/api/admin/projects/[id]/route.ts`
- `parseTranslations()`에서 EN/JA 번역 payload에 아래 배열 필드 파싱 추가
  - `achievements`
  - `contributions`

3. 프로젝트 저장소 번역 매핑/저장 확장
- `lib/projects/repository.ts`
- `projects_translations` 조회 select 필드에 `achievements`, `contributions` 추가
- `toProjectTranslationInput()`에 성과/기여 매핑 추가
- `applyProjectTranslation()`에서 locale별 성과/기여 우선 적용(fallback은 KO 원문)
- `upsertProjectTranslations()`에서 성과/기여 배열 저장 추가

4. 관리자 프로젝트 UI locale 탭 입력 확장
- `components/admin/projects/projects-manager.tsx`
- EN/JA 번역 상태에 성과/기여 리스트 + 입력값 상태 추가
- KO/EN/JA 공통으로 성과/기여 섹션이 동작하도록 locale-aware 핸들러 적용
  - 추가
  - 삭제
  - 드래그 정렬
- 저장 payload(`translations`)에 EN/JA 성과/기여 포함

5. DB 증분 마이그레이션 추가
- `supabase/v2/schema-v2.0.1.sql`
- `projects_translations` 테이블에 컬럼 추가
  - `achievements text[] not null default '{}'::text[]`
  - `contributions text[] not null default '{}'::text[]`
- `schema_migrations`에 `v2.0.1` 기록

## 적용 순서
1. Supabase SQL Editor에서 `supabase/v2/schema-v2.0.1.sql` 실행
2. 관리자 `/admin/projects`에서 EN/JA 탭으로 성과/기여 입력 및 저장 확인
3. 공개 프로젝트 페이지 locale 전환 시 성과/기여 번역 반영 확인$en_body$, ARRAY['workflow', 'admin', 'supabase', 'database', 'ui-ux', 'monitoring']::text[]),
  ('sitemap_prerender_동적_충돌_해결', $en_title$sitemap prerender 동적 충돌 Fix$en_title$, $en_desc$1. 정적 라우트 생성$en_desc$, $en_body$# sitemap prerender 동적 충돌 Fix

## Overview
1. 정적 라우트 생성

## Key Updates
- `/sitemap.xml` prerender 중 `Dynamic server usage` Error 발생
- 원인 fetch: Supabase REST 요청이 `revalidate: 0`/`no-store`로 실행되어 정적 렌더링과 충돌
- `app/sitemap.ts`가 `getAllPublishedProjects`, `getAllPublishedPosts`를 호출
- 해당 저장소 함수 내부는 `createSupabaseServiceClient()`를 사용
- 이 클라이언트는 전역 fetch를 `cache: no-store`, `next.revalidate: 0`으로 고정
- 결과적으로 sitemap 정적 생성 단계에서 동적 사용 에러가 발생
- `app/sitemap.ts`에서 저장소 함수 호출 제거
- sitemap 전용 Supabase 클라이언트 Add:

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

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
- 1시간 단위 재검증으로 최신성 확보$en_body$, ARRAY['workflow', 'supabase', 'database', 'seo', 'performance', 'bugfix']::text[]),
  ('Vercel_별칭_자동_최신화_파이프라인_고정', $en_title$Vercel 별칭 자동 최신화 파이프라인 고정$en_title$, $en_desc$모두 동일 최신 Deployment를 가리키도록 복구됨$en_desc$, $en_body$# Vercel 별칭 자동 최신화 파이프라인 고정

## Overview
모두 동일 최신 Deployment를 가리키도록 복구됨

## Key Updates
- `main` Deployment가 성공해도 `j-fe-blog.vercel.app`이 최신 Deployment를 가리키지 않음
- 결과적으로 일부 URL은 최신 코드, `j-fe-blog`는 구버전/오래된 Deployment를 보여주는 현상 발생
- `j-fe-blog.vercel.app`이 Project 고정 도메인으로 붙은 Status가 아니라 Deployment 단위 alias로 연결되어 있었음
- Deployment가 새로 생길 때 alias가 자동 이동되지 않아 URL 불일치가 발생함
- 최신 Deployment로 alias 재지정
- 확인 결과:
- `j-fe-blog.vercel.app`
- `j-blog-wogml3270s-projects.vercel.app`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

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
- `npx vercel alias ls`에서 `j-fe-blog.vercel.app`이 최신 배포 source로 연결된 것을 확인$en_body$, ARRAY['workflow', 'deployment', 'vercel', 'monitoring']::text[]),
  ('문서_기반_블로그_실데이터_리시드_v2_1_3', $en_title$문서 기반 Blog 실데이터 리시드 (v2.1.3)$en_title$, $en_desc$긴 마크다운/개행/특수문자에서도 SQL Editor 붙여넣기 안정성을 높임.$en_desc$, $en_body$# 문서 기반 Blog 실데이터 리시드 (v2.1.3)

## Overview
긴 마크다운/개행/특수문자에서도 SQL Editor 붙여넣기 안정성을 높임.

## Key Updates
- `docs/worklogs`, `docs/refector`의 마크다운을 Blog 실데이터로 일괄 전환
- 기존 더미 Blog 데이터(`posts`, `posts_en`, `posts_ja`, 태그 매핑) 전체 교체
- Supabase SQL Editor에 바로 붙여넣어 실행 가능한 단일 SQL 산출
- 생성 스크립트 Add:
- `scripts/generate-docs-blog-reseed-sql.mjs`
- 실행 스크립트 Add:
- `package.json` -> `npm run generate:docs-blog-sql`
- 산출 SQL 생성:

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 문서 기반 블로그 실데이터 리시드 (v2.1.3)

## 작업 목적
- `docs/worklogs`, `docs/refector`의 마크다운을 블로그 실데이터로 일괄 전환
- 기존 더미 블로그 데이터(`posts`, `posts_en`, `posts_ja`, 태그 매핑) 전체 교체
- Supabase SQL Editor에 바로 붙여넣어 실행 가능한 단일 SQL 산출

## 반영 내용
- 생성 스크립트 추가:
  - `scripts/generate-docs-blog-reseed-sql.mjs`
- 실행 스크립트 추가:
  - `package.json` -> `npm run generate:docs-blog-sql`
- 산출 SQL 생성:
  - `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`

## 생성 규칙
- 소스 파일: `docs/worklogs/**/*.md`, `docs/refector/**/*.md`
- 제목: 첫 `#` 헤더 우선, 없으면 파일명
- 슬러그: `YYYY_MM_DD_파일명정규화` (중복 시 suffix)
- 설명: 본문 첫 의미 문단 요약
- 태그: `worklog|refactor`, 날짜 태그, 파일명 토큰
- 상태: 전부 `published`, `featured=false`, 썸네일 기본값 사용

## SQL 구성
- 트랜잭션(`begin/commit`) 단위
- 삭제 순서:
  - `post_tag_map` -> `posts_en` -> `posts_ja` -> `posts` -> `post_tags`
- 재삽입:
  - `posts`
  - `post_tags` upsert
  - `post_tag_map` 재생성
  - `posts_en`, `posts_ja` upsert
- 마이그레이션 기록:
  - `schema_migrations`에 `v2.1.3` insert (중복 방지)

## 안전성 보강
- 본문/제목/설명은 달러쿼트(`$tag$...$tag$`) 방식으로 출력해
  긴 마크다운/개행/특수문자에서도 SQL Editor 붙여넣기 안정성을 높임.

## 실행 방법
```bash
npm run generate:docs-blog-sql
```
- 생성 파일: `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`
- Supabase SQL Editor에서 전체 실행

## 검증 체크리스트
- `posts` 건수와 문서 파일 수 일치
- `posts_en`, `posts_ja`가 `posts`와 1:1 매핑
- 블로그 목록/상세/언어 전환 정상
- 검색(`q`) 동작 정상$en_body$, ARRAY['workflow', 'refactor', 'supabase', 'database', 'bugfix', 'monitoring']::text[]),
  ('블로그_DB_장애_안내_전환', $en_title$Blog DB 장애 안내 전환$en_title$, $en_desc$Blog DB 장애 안내 전환 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Blog DB 장애 안내 전환

## Overview
Blog DB 장애 안내 전환 work details을 Cleanup한 기록입니다.

## Key Updates
- Blog 데이터 소스에서 MDX fallback을 제거하고, DB 장애 시 사용자에게 명시적으로 안내하도록 전환.
- `lib/blog/repository.ts`
- `lib/blog/registry` 기반 fallback 로직 제거
- `BlogServiceUnavailableError` Add
- Supabase 서비스 미구성/조회 실패 시 즉시 장애 에러 throw
- `app/[lang]/(site)/blog/error.tsx`
- Blog 세그먼트 전용 에러 UI Add
- KO/EN/JA 메시지 + 재시도 버튼 제공

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 블로그 DB 장애 안내 전환

## 변경 목적
- 블로그 데이터 소스에서 MDX fallback을 제거하고, DB 장애 시 사용자에게 명시적으로 안내하도록 전환.

## 적용 내용
- `lib/blog/repository.ts`
  - `lib/blog/registry` 기반 fallback 로직 제거
  - `BlogServiceUnavailableError` 추가
  - Supabase 서비스 미구성/조회 실패 시 즉시 장애 에러 throw
- `app/[lang]/(site)/blog/error.tsx`
  - 블로그 세그먼트 전용 에러 UI 추가
  - KO/EN/JA 메시지 + 재시도 버튼 제공
- `app/[lang]/(site)/blog/[slug]/page.tsx`
  - 상세 메타 생성에서 DB 오류 시 기본 메타로 fallback 처리
  - 본문 렌더를 DB markdown 단일 경로로 통일

## 검증
- `npm run -s lint` 통과(기존 경고 1건 유지)
- `npx tsc --noEmit` 통과$en_body$, ARRAY['workflow', 'supabase', 'database', 'ui-ux', 'bugfix', 'monitoring']::text[]),
  ('블로그_리시드_품질_재구축_v2_1_3', $en_title$Blog 리시드 품질 재구축 (v2.1.3)$en_title$, $en_desc$node scripts/generate-docs-blog-reseed-sql.mjs --bootstrap-translations$en_desc$, $en_body$# Blog 리시드 품질 재구축 (v2.1.3)

## Overview
node scripts/generate-docs-blog-reseed-sql.mjs --bootstrap-translations

## Key Updates
- docs 기반 Blog 리시드 데이터의 품질 문제(슬러그/태그/EN·JA 번역)를 전면 Improvement
- SQL 생성 전 Validation 단계에서 누락/품질 이슈를 즉시 차단
- 파일: `scripts/generate-docs-blog-reseed-sql.mjs`
- 2단계로 분리:
- docs 파싱(제목/설명/본문/날짜)
- 품질 보정/Validation(슬러그/태그/번역)
- SQL 출력 파일 유지:
- `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 블로그 리시드 품질 재구축 (v2.1.3)

## 목적
- docs 기반 블로그 리시드 데이터의 품질 문제(슬러그/태그/EN·JA 번역)를 전면 개선
- SQL 생성 전 검증 단계에서 누락/품질 이슈를 즉시 차단

## 반영 내용

### 1) 생성 파이프라인 재설계
- 파일: `scripts/generate-docs-blog-reseed-sql.mjs`
- 2단계로 분리:
  - docs 파싱(제목/설명/본문/날짜)
  - 품질 보정/검증(슬러그/태그/번역)
- SQL 출력 파일 유지:
  - `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`

### 2) 슬러그 정책 변경
- 기존 `uXXXX` 형태 제거
- 관리자 규칙과 동일하게 제목 기반 `_` 포맷 사용
  - 공백/구분자 -> `_`
  - 한글/영문/숫자/`_` 허용
  - 중복 시 `_2`, `_3` suffix
- 날짜 prefix 제거

### 3) 태그 정책 변경
- 고정 택소노미 도입:
  - `i18n`, `seo`, `supabase`, `vercel`, `admin`, `ui-ux`, `animation`, `refactor`, `database`, `auth`, `deployment`, `performance`, `bugfix`, `monitoring`, `workflow`
- 포스트별 자동 선별 + 수동 오버라이드 병합
- 검증:
  - KO 태그 3~6개 강제
  - 택소노미 외 태그 허용 안 함

### 4) EN/JA 완전 번역 데이터 소스 도입
- 신규 파일:
  - `data/blog-seed-translations.en.json`
  - `data/blog-seed-translations.ja.json`
  - `data/blog-seed-tag-overrides.json`
- 번역 검증:
  - KO slug 기준 EN/JA 1:1 존재 필수
  - title/description/bodyMarkdown 필수
  - 본문 최소 길이 검증
  - KO 본문과 완전 동일한 번역 금지
  - locale별 태그 3~6개 및 허용 태그 검증

### 5) SQL 재생성 정책
- 블로그 관련 데이터 전체 교체 유지:
  - `post_tag_map -> posts_en -> posts_ja -> posts -> post_tags`
- `schema_migrations`는 `v2.1.3` 유지, description만 최신화 가능하도록 처리

## 실행 방법
- 번역 소스 초기 생성(부트스트랩):
```bash
node scripts/generate-docs-blog-reseed-sql.mjs --bootstrap-translations
```
- SQL 생성:
```bash
npm run generate:docs-blog-sql
```

## 검증 결과
- 생성 건수: 55 posts
- `uXXXX` 패턴 슬러그: 0건
- `npm run lint`: 통과(기존 warning 1건 유지)
- `npx tsc --noEmit`: 통과$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'auth']::text[]),
  ('블로그_프로젝트_검색_공통화_스켈레톤_통일', $en_title$Blog/Project Search 공통화 + 스켈레톤 통일$en_title$, $en_desc$1. 공통 Search 유틸 Add$en_desc$, $en_body$# Blog/Project Search 공통화 + 스켈레톤 통일

## Overview
1. 공통 Search 유틸 Add

## Key Updates
- Blog/Project 목록 Search 기능을 동일한 UX/구조로 통일
- Search UI를 공통 컴포넌트로 분리
- Blog/Project 로딩 스켈레톤을 동일한 공통 컴포넌트로 통일
- 파일: `lib/utils/content-search.ts`
- `normalizeContentSearchQuery`, `matchesContentSearchQuery` Add
- title/description/tags 등 다중 필드 Search 로직을 공통 처리
- 파일: `components/ui/content-search-toolbar.tsx`
- URL 쿼리스트링 `q`를 단일 소스로 사용하는 Search/초기화 UI

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 블로그/프로젝트 검색 공통화 + 스켈레톤 통일

## 작업 요약
- 블로그/프로젝트 목록 검색 기능을 동일한 UX/구조로 통일
- 검색 UI를 공통 컴포넌트로 분리
- 블로그/프로젝트 로딩 스켈레톤을 동일한 공통 컴포넌트로 통일

## 구현 내용
1. 공통 검색 유틸 추가
- 파일: `lib/utils/content-search.ts`
- `normalizeContentSearchQuery`, `matchesContentSearchQuery` 추가
- title/description/tags 등 다중 필드 검색 로직을 공통 처리

2. 공통 검색 툴바 컴포넌트 추가
- 파일: `components/ui/content-search-toolbar.tsx`
- URL 쿼리스트링 `q`를 단일 소스로 사용하는 검색/초기화 UI
- 블로그/프로젝트 양쪽에서 동일 렌더링

3. 블로그 목록 검색 적용
- 파일: `app/[lang]/(site)/blog/page.tsx`
- `searchParams.q` 파싱 후 목록 필터링
- 검색 툴바 연결
- 결과 없음 UI 추가

4. 프로젝트 목록 검색 적용
- 파일: `app/[lang]/(site)/projects/page.tsx`
- `searchParams.q` 파싱 후 목록 필터링
- 검색 툴바 연결
- 결과 없음 UI 추가

5. 공통 스켈레톤 컴포넌트 추가/적용
- 추가: `components/ui/content-list-loading-skeleton.tsx`
- 변경:
  - `app/[lang]/(site)/blog/loading.tsx`
  - `app/[lang]/(site)/projects/loading.tsx`
- 두 페이지 모두 동일한 스켈레톤 구조 사용

6. i18n 키 확장
- 블로그/프로젝트 locale json에 검색 키 추가
  - `searchPlaceholder`
  - `searchButton`
  - `searchReset`
  - `searchNoResult`

## 검증
- `npm run -s lint`: 통과 (기존 warning 1건 유지)
- `npx tsc --noEmit`: 통과

## 메모
- 기존 `filterPlaceholder/filterButton` 키는 제거하고 검색 키로 대체
- 검색은 서버 목록 데이터를 기준으로 필드 매칭하는 방식으로 통일$en_body$, ARRAY['workflow', 'ui-ux', 'monitoring', 'i18n']::text[]),
  ('블로그_프로젝트_공개_페이지네이션_8개_적용', $en_title$Blog/Project Published Pagination 8개 Apply$en_title$, $en_desc$Blog/Project Published Pagination 8개 Apply work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Blog/Project Published Pagination 8개 Apply

## Overview
Blog/Project Published Pagination 8개 Apply work details을 Cleanup한 기록입니다.

## Key Updates
- Published `blog`, `projects` 목록의 기본 노출 개수를 8개로 고정
- Search(`q`)과 Pagination(`page`)을 함께 사용 가능한 구조로 Cleanup
- 중복 Implement을 줄이기 위해 공통 Pagination 컴포넌트로 통일
- `lib/utils/pagination.ts`
- `PUBLIC_CONTENT_PAGE_SIZE = 8` Add
- `normalizePublicPage` Add
- `components/ui/content-search-toolbar.tsx`
- Search/초기화 시 `page` 쿼리를 제거하도록 변경

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 블로그/프로젝트 공개 페이지네이션 8개 적용

## 목표
- 공개 `blog`, `projects` 목록의 기본 노출 개수를 8개로 고정
- 검색(`q`)과 페이지네이션(`page`)을 함께 사용 가능한 구조로 정리
- 중복 구현을 줄이기 위해 공통 페이지네이션 컴포넌트로 통일

## 변경 사항

### 1) 공개 페이지네이션 공통 기준 추가
- `lib/utils/pagination.ts`
  - `PUBLIC_CONTENT_PAGE_SIZE = 8` 추가
  - `normalizePublicPage` 추가

### 2) 검색 시 페이지 초기화
- `components/ui/content-search-toolbar.tsx`
  - 검색/초기화 시 `page` 쿼리를 제거하도록 변경
  - 검색어 변경 후 페이지가 꼬이지 않도록 1페이지 리셋

### 3) 공통 페이지네이션 컴포넌트 추가
- `components/ui/content-pagination.tsx` (신규)
  - 숫자형 페이지네이션(ellipsis 포함)
  - 기존 쿼리(`q`) 유지 + `page`만 갱신
  - `blog`, `projects`에서 공통 사용

### 4) 블로그 목록 페이지 반영
- `app/[lang]/(site)/blog/page.tsx`
  - 검색 결과를 8개 단위로 slice
  - `page` 쿼리 기반 현재 페이지 계산/클램핑
  - 하단에 공통 페이지네이션 렌더

### 5) 프로젝트 목록 페이지 반영
- `app/[lang]/(site)/projects/page.tsx`
  - 검색 결과를 8개 단위로 slice
  - `page` 쿼리 기반 현재 페이지 계산/클램핑
  - 하단에 공통 페이지네이션 렌더

### 6) i18n 텍스트 추가
- `locales/{ko,en,ja}/blog.json`
- `locales/{ko,en,ja}/projects.json`
  - `paginationPrevious`
  - `paginationNext`
  - `paginationSummary`

## 검증
- `npm run lint`: 통과(기존 경고 1건 유지)
- `npx tsc --noEmit`: 통과

## 비고
- 현재 구현은 검색 결과를 서버에서 모두 받아온 뒤 페이지 단위로 화면 분할합니다.
- 데이터가 더 커지면 다음 단계에서 서버 쿼리 레벨 페이지네이션으로 확장 가능합니다.$en_body$, ARRAY['workflow', 'refactor', 'ui-ux', 'monitoring', 'i18n']::text[]),
  ('프로젝트_DB_장애_안내_전환_및_MDX_제거', $en_title$Project DB 장애 안내 전환 및 MDX 제거$en_title$, $en_desc$Project DB 장애 안내 전환 및 MDX 제거 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Project DB 장애 안내 전환 및 MDX 제거

## Overview
Project DB 장애 안내 전환 및 MDX 제거 work details을 Cleanup한 기록입니다.

## Key Updates
- Project 페이지도 Blog와 동일하게 DB 장애 시 사용자 안내 화면을 노출하도록 통일
- 더 이상 사용하지 않는 MDX 파일/설정/의존성 제거
- Project 저장소 fallback 제거
- `lib/projects/repository.ts`
- `ProjectServiceUnavailableError` Add
- `getAllPublishedProjects`, `getFeaturedProjects`, `getPublishedProjectBySlug`에서 DB 실패 시 예외 throw
- Project 라우트 에러 경계 Add
- `app/[lang]/(site)/projects/error.tsx` 신설

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 프로젝트 DB 장애 안내 전환 및 MDX 제거

## 작업 목적
- 프로젝트 페이지도 블로그와 동일하게 DB 장애 시 사용자 안내 화면을 노출하도록 통일
- 더 이상 사용하지 않는 MDX 파일/설정/의존성 제거

## 적용 내용
- 프로젝트 저장소 fallback 제거
  - `lib/projects/repository.ts`
  - `ProjectServiceUnavailableError` 추가
  - `getAllPublishedProjects`, `getFeaturedProjects`, `getPublishedProjectBySlug`에서 DB 실패 시 예외 throw
- 프로젝트 라우트 에러 경계 추가
  - `app/[lang]/(site)/projects/error.tsx` 신설
  - KO/EN/JA 문구 + 다시 시도 버튼 구성
- 프로젝트 상세 메타데이터 안정화
  - `app/[lang]/(site)/projects/[slug]/page.tsx`
  - `generateMetadata`에서 DB 오류 시 기본 메타로 fallback

- MDX 정리
  - 삭제: `lib/blog/registry.ts`
  - 삭제: `content/blog/*.mdx`
  - 삭제: `mdx-components.tsx`, `mdx.d.ts`
  - 변경: `next.config.ts`에서 `@next/mdx` 제거, `pageExtensions`에서 `mdx` 제거
  - 변경: `types/blog.ts`에서 MDX 전용 타입(`BlogRegistryItem`, `Component`) 제거
  - 변경: `scripts/seed-supabase.mjs`의 MDX 파일 파싱/시드 로직 제거

- 패키지 의존성 정리
  - 제거: `@mdx-js/loader`, `@mdx-js/react`, `@next/mdx`, `@types/mdx`
  - 반영 파일: `package.json`, `package-lock.json`

## 검증 결과
- `npm run -s lint`: 통과 (기존 warning 1건 유지)
- `npx tsc --noEmit`: 통과
- `npm run -s build`: 실패
  - 사유: 네트워크 제한 환경에서 Google Fonts DNS 조회 실패(`fonts.googleapis.com`)

## 메모
- 현재 코드 기준으로 MDX 런타임/빌드 경로 의존성은 제거됨
- 문서(README/과거 worklog)에 남아 있는 MDX 언급은 히스토리 설명 용도로만 남아 있음$en_body$, ARRAY['workflow', 'refactor', 'supabase', 'database', 'ui-ux', 'seo']::text[]),
  ('리팩토링_2차_정리', $en_title$Refactoring 2차 Cleanup$en_title$, $en_desc$1. `ManagerListRow` 파일 통합$en_desc$, $en_body$# Refactoring 2차 Cleanup

## Overview
1. `ManagerListRow` 파일 통합

## Key Updates
- 불필요하게 잘게 분리된 컴포넌트를 줄이고, 공통화는 유지하면서 유지보수 포인트를 축소한다.
- 기존: `components/admin/manager-list-row.tsx` 별도 파일
- 변경: `components/admin/manager-list.tsx` 내부로 `ManagerListRow`를 통합 export
- 효과: Admin 리스트 관련 파일을 한 곳에서 확인 가능
- `app/admin/(protected)/blog/page.tsx`
- `app/admin/(protected)/projects/page.tsx`
- `app/admin/(protected)/contact/page.tsx`
- 위 3곳의 `id` 쿼리 파싱 중복 함수를 제거하고 `lib/utils/search-params.ts`의 `pickSingleQueryValue`로 통합

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업 일지 - 2026-04-08 (리팩토링 2차 정리)

## 목표

- 불필요하게 잘게 분리된 컴포넌트를 줄이고, 공통화는 유지하면서 유지보수 포인트를 축소한다.

## 변경 내용

1. `ManagerListRow` 파일 통합

- 기존: `components/admin/manager-list-row.tsx` 별도 파일
- 변경: `components/admin/manager-list.tsx` 내부로 `ManagerListRow`를 통합 export
- 효과: 관리자 리스트 관련 파일을 한 곳에서 확인 가능

2. 미세 중복 제거 (쿼리 파싱)

- `app/admin/(protected)/blog/page.tsx`
- `app/admin/(protected)/projects/page.tsx`
- `app/admin/(protected)/contact/page.tsx`
- 위 3곳의 `id` 쿼리 파싱 중복 함수를 제거하고 `lib/utils/search-params.ts`의 `pickSingleQueryValue`로 통합

3. 파일 삭제

- `components/admin/manager-list-row.tsx` 삭제

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 메모

- 현재 `components/` 기준으로 미사용 컴포넌트는 없음(참조 스캔 확인).
- 다음 단계는 “파일 수 감소”보다 “역할 경계 명확화(Manager 단위 상태/폼 로직 분리)”가 효율적일 가능성이 높음.$en_body$, ARRAY['refactor', 'admin', 'ui-ux', 'monitoring']::text[]),
  ('유지보수성_공통_ui', $en_title$유지보수성 공통 ui$en_title$, $en_desc$Apply:$en_desc$, $en_body$# 유지보수성 공통 ui

## Overview
Apply:

## Key Updates
- 기능 변경 없이 유지보수성 Improvement
- 핵심 로직 주석 정책 문서화
- Admin/Published UI의 중복 레이아웃 공통화
- 미사용 레거시 파일 Cleanup
- 파일: `docs/refector/2026-04-08/리팩터링-주석-가이드.md`
- 한국어 criteria의 핵심 로직 주석 대상과 작성 규칙을 정의
- `components/admin/manager-shell.tsx`
- `components/admin/manager-list.tsx`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 작업일지 (2026-04-08)

## 목표

- 기능 변경 없이 유지보수성 개선
- 핵심 로직 주석 정책 문서화
- 관리자/공개 UI의 중복 레이아웃 공통화
- 미사용 레거시 파일 정리

## 주요 작업

### 1) 주석 정책 문서 추가

- 파일: `docs/refector/2026-04-08/리팩터링-주석-가이드.md`
- 한국어 기준의 핵심 로직 주석 대상과 작성 규칙을 정의

### 2) 관리자 공통 UI 컴포넌트 추가

- `components/admin/manager-shell.tsx`
- `components/admin/manager-list.tsx`
- `components/admin/manager-list-row.tsx`
- `components/admin/status-radio-group.tsx`
- `components/ui/surface-card.tsx`

적용:

- `home-manager`, `about-manager`, `posts-manager`, `projects-manager`, `contact-manager`
- 상단 요약 헤더, 리스트 컨테이너, 리스트 행, 상태 라디오 UI를 공통 컴포넌트로 통합

### 3) 공개 페이지 공통 UI 컴포넌트 추가

- `components/ui/content-list-layout.tsx`
- `components/ui/media-card.tsx`

적용:

- `components/blog/card.tsx`
- `components/project/card.tsx`
- `app/[lang]/(site)/blog/page.tsx`
- `app/[lang]/(site)/projects/page.tsx`

### 4) 레거시 코드 정리

- 미사용 파일 삭제: `components/admin/profile-manager.tsx`

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 비고

- MDX/Supabase 혼용 구조 및 API/DB 스키마는 변경하지 않음.$en_body$, ARRAY['workflow', 'refactor', 'admin', 'supabase', 'database', 'ui-ux']::text[]),
  ('리팩토링_주석_가이드', $en_title$Refactoring 주석 가이드$en_title$, $en_desc$Refactoring 주석 가이드 work details을 Cleanup한 기록입니다.$en_desc$, $en_body$# Refactoring 주석 가이드

## Overview
Refactoring 주석 가이드 work details을 Cleanup한 기록입니다.

## Key Updates
- Implement 나열이 아니라 **의도/이유**를 빠르게 전달해 유지보수 시간을 줄입니다.
- `export` 함수
- 비동기 핸들러(`fetch`, mutation, 저장/Delete)
- 파서/정규화 함수
- Status 전환 로직(`dirty`, open/close, sync)
- 복합 조건 분기
- `useEffect` 부작용 블록
- 함수/블록 **바로 위 한 줄 `//`** 로 작성

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# 리팩토링 주석 가이드

## 목적

- 구현 나열이 아니라 **의도/이유**를 빠르게 전달해 유지보수 시간을 줄입니다.

## 적용 대상

- `export` 함수
- 비동기 핸들러(`fetch`, mutation, 저장/삭제)
- 파서/정규화 함수
- 상태 전환 로직(`dirty`, open/close, sync)
- 복합 조건 분기
- `useEffect` 부작용 블록

## 작성 규칙

- 함수/블록 **바로 위 한 줄 `//`** 로 작성
- 한국어로 작성
- “무엇을 한다”보다 “왜 이렇게 처리하는지”를 우선
- 한 함수에 주석 과다 작성 금지(핵심 분기만)

## 예시

- 좋은 예: `// 저장 직후 서버 정렬(updated_at)을 기준으로 목록을 다시 동기화한다.`
- 피해야 할 예: `// setState를 호출한다.`$en_body$, ARRAY['refactor', 'monitoring', 'workflow']::text[]),
  ('v2_네이밍_매핑_및_번역_규칙', $en_title$v2 네이밍 매핑 및 번역 규칙$en_title$, $en_desc$`post_tag_map`은 게시글(`posts`)과 태그(`post_tags`)를 연결하는 다대다 매핑 테이블이다.$en_desc$, $en_body$# v2 네이밍 매핑 및 번역 규칙

## Overview
`post_tag_map`은 게시글(`posts`)과 태그(`post_tags`)를 연결하는 다대다 매핑 테이블이다.

## Key Updates
- `admin_allowlist` -> 유지
- `comments` -> 유지
- `contact_messages` -> `contacts`
- `home_highlights` -> `home_slide`
- `post_tag_map` -> 유지
- `post_tags` -> 유지
- `posts` -> 유지
- `profile_content` -> `about`

## Notes
This localized post preserves the original technical intent and structure.

---

## Original Korean Source

# v2 네이밍 매핑 및 번역 규칙

## 1) 테이블 네이밍 매핑
- `admin_allowlist` -> 유지
- `comments` -> 유지
- `contact_messages` -> `contacts`
- `home_highlights` -> `home_slide`
- `post_tag_map` -> 유지
- `post_tags` -> 유지
- `posts` -> 유지
- `profile_content` -> `about`
- `projects` -> 유지

## 2) `post_tag_map` 역할
`post_tag_map`은 게시글(`posts`)과 태그(`post_tags`)를 연결하는 다대다 매핑 테이블이다.
- 게시글 하나에 여러 태그를 붙일 수 있고
- 같은 태그를 여러 게시글에서 재사용할 수 있도록 정규화한다.

## 3) 번역 테이블 규칙
- `posts_translations(post_id, locale, title, description, body_markdown, tags)`
- `projects_translations(project_id, locale, title, subtitle, content_markdown, tags)`
- `about_translations(about_id, locale, name, title, summary, about_tech_items)`

공통 규칙:
- `locale`은 `ko | en | ja`
- `(parent_id, locale)` unique
- 발행 제어는 기본 테이블(`posts`, `projects`)의 `status`만 사용
- 번역 누락 시 KO 원문 fallback

## 4) 공개 조회 우선순위
1. 현재 locale 번역 데이터
2. KO 기본 데이터 fallback

## 5) 관리자 코드 네이밍 원칙
- `Highlight` -> `HomeSlide`
- `ProfileContent` -> `About`
- `ContactMessage` -> `Contact`

기존 이름은 회귀 방지를 위해 alias를 한 버전 유지하고, 신규 코드는 새 이름을 사용한다.$en_body$, ARRAY['refactor', 'admin', 'database', 'vercel', 'monitoring', 'i18n']::text[])
) as src(slug, title, description, body_markdown, tags)
  on src.slug = p.slug
on conflict (post_id) do update
set
  title = excluded.title,
  description = excluded.description,
  body_markdown = excluded.body_markdown,
  tags = excluded.tags,
  updated_at = timezone('utc', now());

with seeded_posts as (
  select id, slug
  from public.posts
)
insert into public.posts_ja (
  post_id,
  title,
  description,
  body_markdown,
  tags
)
select
  p.id,
  src.title,
  src.description,
  src.body_markdown,
  src.tags
from seeded_posts p
join (
  values
  ('테마_스무딩_KO_EN_JA_i18n', $ja_title$テーマ 스무딩 + KO/EN/JA i18n$ja_title$, $ja_desc$テーマ 스무딩 + KO/EN/JA i18n 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# テーマ 스무딩 + KO/EN/JA i18n

## 概要
テーマ 스무딩 + KO/EN/JA i18n 作業内容을 整理한 기록입니다.

## 主な更新
- 중단된 턴 이후 저장소 状態를 점검했습니다.
- `lib/i18n/config.ts` 무결성을 확인했습니다.
- `npm run lint`를 실행해 정상 통과를 확인했습니다.
- 로케일 prefix 라우팅(`/ko`, `/en`, `/ja`)을 実装했습니다.
- デフォルト `light` 基準의 부드러운 テーマ 전환을 適用했습니다.
- UI/메타데이터/핵심 콘텐츠 번역과 로케일 SEO alternates를 반영했습니다.
- 로케일 기본 모듈 追加:
- `lib/i18n/config.ts`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업일지 - 2026-04-06 (테마 스무딩 + KO/EN/JA i18n)

## 1) 복구 점검

- 중단된 턴 이후 저장소 상태를 점검했습니다.
- `lib/i18n/config.ts` 무결성을 확인했습니다.
- `npm run lint`를 실행해 정상 통과를 확인했습니다.

## 2) 진행 항목

- 로케일 prefix 라우팅(`/ko`, `/en`, `/ja`)을 구현했습니다.
- 기본값 `light` 기준의 부드러운 테마 전환을 적용했습니다.
- UI/메타데이터/핵심 콘텐츠 번역과 로케일 SEO alternates를 반영했습니다.

## 3) 완료된 변경 사항

- 로케일 기본 모듈 추가:
  - `lib/i18n/config.ts`
  - `lib/i18n/dictionary.ts`
  - `lib/seo/metadata.ts`
- 앱 라우팅을 로케일 prefix 구조로 마이그레이션:
  - `app/[lang]/(site)/*`
  - `app/[lang]/layout.tsx`
  - `app/[lang]/not-found.tsx`
  - `app/page.tsx`에서 기본 로케일 경로로 리다이렉트
  - `proxy.ts`에서 non-prefix 경로를 `/ko/*`로 리다이렉트
- 헤더/푸터/홈/블로그/프로젝트 전반에 로케일 인지 링크 및 라벨을 적용했습니다.
- 헤더 데스크톱/모바일에 언어 스위처(KO/EN/JA)를 추가했습니다.
- 테마 스무딩 동작을 구현했습니다:
  - 기본 테마 `light`
  - 사용자 토글 시에만 부드러운 전환 활성화
  - `data-theme-transition` 기반 전역 CSS 전환 레이어 적용
- 로케일별 타이포 전략을 적용했습니다:
  - KO: Noto Sans KR
  - EN: Plus Jakarta Sans
  - JA: Noto Sans JP
  - 코드: JetBrains Mono
- 로케일 SEO 메타 유틸리티 및 sitemap alternates를 추가했습니다.
- 핵심 프로필/프로젝트 콘텐츠(UI + 메타데이터 + 주요 설명)를 로케일화했습니다.

## 4) 검증

- `npm run lint`: 통과
- `npm run build`: 샌드박스 환경의 기존/정체된 빌드 프로세스와 Turbopack 제약으로 실행 불가$ja_body$, ARRAY['ワークフロー', 'UI/UX', 'アニメーション', 'SEO', 'バグ修正', 'モニタリング']::text[]),
  ('오버레이_애니메이션_로케일_JSON', $ja_title$오버레이 + 애니메이션 + 로케일 JSON$ja_title$, $ja_desc$오버레이 + 애니메이션 + 로케일 JSON 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 오버레이 + 애니메이션 + 로케일 JSON

## 概要
오버레이 + 애니메이션 + 로케일 JSON 作業内容을 整理한 기록입니다.

## 主な更新
- 모바일 메뉴가 열렸을 때 헤더를 포함한 전체 화면이 블러 처리되도록 dim/blur 오버레이의 z-index를 상향했습니다.
- 사이드 패널은 오버레이 위에 유지되도록 더 높은 z-layer로 설정했습니다.
- 방향/지연/지속시간/거리 조절이 가능한 공통 슬라이드 인 애니메이션 컴포넌트 `components/ui/slide-in.tsx`를 追加했습니다.
- デフォルト을 포함해 커스터마이즈 가능한 공통 스켈레톤 컴포넌트 `components/ui/skeleton.tsx`를 追加했습니다.
- `width` デフォルト: `100%`
- `height` デフォルト: `1rem`
- `rounded`, `animated` 옵션 제공
- `app/globals.css`에 전역 애니메이션/쉬머 스타일을 追加했습니다.

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업일지 - 2026-04-06 (오버레이 + 애니메이션 + 로케일 JSON)

## 1) 모바일 네비게이션 오버레이

- 모바일 메뉴가 열렸을 때 헤더를 포함한 전체 화면이 블러 처리되도록 dim/blur 오버레이의 z-index를 상향했습니다.
- 사이드 패널은 오버레이 위에 유지되도록 더 높은 z-layer로 설정했습니다.

## 2) 재사용 가능한 UI 모션/스켈레톤

- 방향/지연/지속시간/거리 조절이 가능한 공통 슬라이드 인 애니메이션 컴포넌트 `components/ui/slide-in.tsx`를 추가했습니다.
- 기본값을 포함해 커스터마이즈 가능한 공통 스켈레톤 컴포넌트 `components/ui/skeleton.tsx`를 추가했습니다.
  - `width` 기본값: `100%`
  - `height` 기본값: `1rem`
  - `rounded`, `animated` 옵션 제공
- `app/globals.css`에 전역 애니메이션/쉬머 스타일을 추가했습니다.
- 핵심 UI 컴포넌트(섹션 타이틀, 히어로, 블로그 카드, 프로젝트 카드, 리스트 스태거)에 슬라이드 인을 적용했습니다.
- 테마 토글 로딩 상태에 스켈레톤을 적용했습니다.

## 3) i18n 로케일 JSON 구조

- 언어/페이지 단위 JSON 관리를 위해 `/locales` 폴더를 구성했습니다.
  - `locales/{ko,en,ja}/main.json`
  - `locales/{ko,en,ja}/header.json`
  - `locales/{ko,en,ja}/footer.json`
  - `locales/{ko,en,ja}/blog.json`
  - `locales/{ko,en,ja}/about.json`
  - `locales/{ko,en,ja}/projects.json`
  - `locales/{ko,en,ja}/not-found.json`
  - `locales/{ko,en,ja}/theme.json`
- 하드코딩된 TS 딕셔너리 객체를 제거하고, `lib/i18n/dictionary.ts`에서 JSON 조합 방식으로 교체했습니다.

## 4) 검증

- `npm run lint`: 통과
- `npx tsc --noEmit`: 통과$ja_body$, ARRAY['ワークフロー', 'UI/UX', 'アニメーション', 'モニタリング', '多言語対応']::text[]),
  ('Admin_CMS_Supabase_v1', $ja_title$Admin CMS + Supabase v1$ja_title$, $ja_desc$Admin CMS + Supabase v1 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# Admin CMS + Supabase v1

## 概要
Admin CMS + Supabase v1 作業内容을 整理한 기록입니다.

## 主な更新
- 管理者 경로를 locale 비適用 단일 경로로 追加했습니다.
- `/admin/login`
- `/admin`
- `/admin/posts`
- `/admin/projects`
- `/admin/profile`
- OAuth 콜백 경로 `/auth/callback`을 追加했습니다.
- `proxy.ts`를 업데이트해 locale 리다이렉트 예외에 `/admin`, `/auth`, `/api`를 포함했습니다.

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

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
  - `supabase/schema-v1.0.0.sql`
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
- `npm run build`: 샌드박스 제약(Turbopack 포트 바인딩 권한 오류)으로 실패$ja_body$, ARRAY['ワークフロー', '管理者', 'Supabase', 'データベース', '認証', 'UI/UX']::text[]),
  ('ui_여백_인증_댓글', $ja_title$ui 여백 인증 댓글$ja_title$, $ja_desc$ui 여백 인증 댓글 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# ui 여백 인증 댓글

## 概要
ui 여백 인증 댓글 作業内容을 整理한 기록입니다.

## 主な更新
- 管理者/公開 화면의 margin, padding 불균형 改善
- About 관리 화면 라벨 구조 改善
- プロジェクト 관리 입력행의 `追加` 버튼 세로 정렬 문제 修正
- 公開 헤더 ログイン 모달/ブログ 댓글 UI 整理 및 안정화
- `components/layout/container.tsx`
- 컨테이너 기본 패딩을 `p-4`에서 `px-4 sm:px-6 lg:px-8`로 변경
- 수직 간격은 각 페이지가 담당하도록 분리
- `app/[lang]/(site)/layout.tsx`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업일지 (2026-04-07)

## 목표

- 관리자/공개 화면의 margin, padding 불균형 개선
- About 관리 화면 라벨 구조 개선
- 프로젝트 관리 입력행의 `추가` 버튼 세로 정렬 문제 수정
- 공개 헤더 로그인 모달/블로그 댓글 UI 정리 및 안정화

## 변경 사항

### 1) UI 간격/레이아웃 정리

- `components/layout/container.tsx`
  - 컨테이너 기본 패딩을 `p-4`에서 `px-4 sm:px-6 lg:px-8`로 변경
  - 수직 간격은 각 페이지가 담당하도록 분리
- `app/[lang]/(site)/layout.tsx`
  - 메인 영역 간격을 `py-8 sm:py-10 lg:py-12`로 조정
- `app/admin/(protected)/layout.tsx`
  - 관리자 레이아웃에 `Container` 적용 및 `py-4~6`, `gap-4~5` 정리
- `components/admin/sidebar.tsx`
  - 사이드바 내부 패딩/간격, 네비 버튼 높이(`xl:py-2.5`) 통일

### 2) About 관리 UX 개선

- `components/admin/about-manager.tsx`
  - 편집 필드를 섹션 단위로 재구성
    - `About`
    - `핵심 역량`
    - `작업 방식`
    - `공개 상태`
  - 섹션별 설명 텍스트 추가
  - 섹션 패딩/라운드/간격을 통일

### 3) Projects 관리 입력행 정렬 개선

- `components/admin/projects-manager.tsx`
  - `기술 스택/성과/기여` 입력행을 `items-center` + `Input flex-1` + `Button shrink-0`으로 정렬
  - `관련 링크` 입력 그리드에 `minmax(0, ...)` 적용하여 버튼 줄바꿈/세로 배열 이슈 완화
  - 관련 섹션 패딩을 `p-3.5`로 통일

### 4) 공개 로그인/댓글 UI 정리

- `components/layout/header.tsx`
  - 모바일 네비 레이어 z-index를 유효 클래스(`z-[60]`)로 수정
- `components/contact/fab.tsx`
  - 모달 z-index를 유효 클래스(`z-[60]`)로 수정
  - FAB/모달 우하단 여백을 반응형으로 미세 조정
- `components/blog/comments-section.tsx`
  - 댓글 입력/카드 UI를 컴팩트하게 축소 (avatar, padding, textarea 높이)
  - 헤더 로그인 유도 문구 유지
  - 사용하지 않는 `nextPath` prop 제거
- `app/[lang]/(site)/blog/[slug]/page.tsx`
  - `CommentsSection` 호출부에서 `nextPath` 전달 제거

### 5) About 공개 페이지 간격 보정

- `app/[lang]/(site)/about/page.tsx`
  - 섹션 간격 `space-y-8`로 조정
  - 카드 패딩을 `p-5 sm:p-6`으로 통일
  - 목록 아이템 간격 미세 조정(`space-y-2.5`)

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 참고

- 빌드 시 Next.js workspace root 경고(복수 lockfile 감지)는 남아 있음.
  - 기능 오류는 아니며, 추후 `outputFileTracingRoot` 설정 또는 상위 lockfile 정리로 해소 가능.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', '認証', 'UI/UX', 'バグ修正']::text[]),
  ('Admin_IA_5탭_Contact_FAB_Home_About_분리', $ja_title$Admin IA 5탭 + Contact FAB + Home/About 분리$ja_title$, $ja_desc$Admin IA 5탭 + Contact FAB + Home/About 분리 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# Admin IA 5탭 + Contact FAB + Home/About 분리

## 概要
Admin IA 5탭 + Contact FAB + Home/About 분리 作業内容을 整理한 기록입니다.

## 主な更新
- 管理者 정식 탭을 다음 5개로 整理:
- `/admin/home`
- `/admin/about`
- `/admin/projects`
- `/admin/blog`
- `/admin/contact`
- 현재 동작:
- `/admin`은 별도 리다이렉트 없이 管理者 대시보드 페이지를 직접 렌더링.

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

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
- 문의 전송 성공 시 모달 폼 자동 닫힘 적용.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', 'UI/UX']::text[]),
  ('Dashboard_canonical_Blog_썸네일_Home_Swiper', $ja_title$Dashboard canonical + Blog 썸네일 + Home Swiper$ja_title$, $ja_desc$Dashboard canonical + Blog 썸네일 + Home Swiper 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# Dashboard canonical + Blog 썸네일 + Home Swiper

## 概要
Dashboard canonical + Blog 썸네일 + Home Swiper 作業内容을 整理한 기록입니다.

## 主な更新
- 신규 canonical 경로: `/admin/dashboard`
- `/admin`은 `/admin/dashboard`로 리다이렉트 처리.
- 사이드바 대시보드 탭/로고 이동 경로를 `/admin/dashboard`로 통일.
- 대시보드 카드와 최근 항목을 링크 중심으로 개편:
- KPI 카드 전체 클릭 가능
- 최근 ブログ/プロジェクト/お問い合わせ 행 전체 클릭 가능
- 섹션별 바로가기 링크 追加
- 딥링크 지원:

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업일지 - 2026-04-07 (Dashboard canonical + Blog 썸네일 + Home Swiper)

## 1) 관리자 대시보드 경로/UX 개편

- 신규 canonical 경로: `/admin/dashboard`
- `/admin`은 `/admin/dashboard`로 리다이렉트 처리.
- 사이드바 대시보드 탭/로고 이동 경로를 `/admin/dashboard`로 통일.
- 대시보드 카드와 최근 항목을 링크 중심으로 개편:
  - KPI 카드 전체 클릭 가능
  - 최근 블로그/프로젝트/문의 행 전체 클릭 가능
  - 섹션별 바로가기 링크 추가
- 딥링크 지원:
  - `/admin/blog?id=...`
  - `/admin/projects?id=...`
  - `/admin/contact?id=...`
  - 각 매니저 진입 시 해당 항목 패널 자동 오픈

## 2) 프로젝트 관리 입력 UX 개선

- 기술 스택 입력을 `Enter 추가 + X 삭제` 태그형으로 변경.
- 기간 입력을 `startDate`, `endDate`(date input) 방식으로 변경.
- 데이터 모델 확장:
  - `projects.start_date date`
  - `projects.end_date date`
- `period` 컬럼은 호환 유지:
  - 저장 시 start/end 기반으로 period 동기화 문자열 생성
  - 공개 렌더는 start/end 우선, 없으면 기존 period fallback

## 3) 블로그 썸네일 optional 도입

- 스키마 확장:
  - `posts.thumbnail text` (nullable)
- 타입/리포지토리/API 반영:
  - `AdminPost`, `BlogPostSummary/Detail`에 thumbnail optional
  - 관리자 저장/수정 API에 thumbnail 필드 반영
- 관리자 블로그 편집:
  - 외부 URL 입력
  - 파일 업로드(선택)

## 4) 업로드 경로 공통화

- 공통 업로드 API 추가:
  - `POST /api/admin/media/upload`
  - scope(`posts`/`projects`) 기반 경로 분기
- 기존 프로젝트 업로드 경로는 호환 유지:
  - `POST /api/admin/projects/upload-thumbnail`
  - 내부적으로 공통 업로드 로직 사용

## 5) 카드 전체 링크 정책 적용

- 공개 사이트:
  - `ProjectCard` 카드 전체 링크화
  - `BlogCard` 카드 전체 링크화
- 블로그 카드:
  - 썸네일이 있을 때만 이미지 레이아웃 표시
  - 없으면 텍스트 중심 카드 유지

## 6) Contact 성공 UX 개선

- 문의 전송 성공 시:
  - 모달 내 성공 문구(`✓`)를 1.2초 표시
  - 이후 자동 닫힘
  - 닫힌 뒤 FAB 근처에 짧은 성공 확인 문구 표시

## 7) Home Swiper 적용

- `swiper` 패키지 설치.
- 홈의 대표 프로젝트/최근 블로그 섹션을 Swiper로 전환:
  - 모바일 1장
  - 태블릿 2장
  - 데스크탑 3장
- keyboard/pagination 활성화.

## 8) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 실패 (현 환경 DNS 제한으로 `fonts.googleapis.com` 접근 불가)$ja_body$, ARRAY['ワークフロー', '管理者', 'UI/UX', 'SEO', 'モニタリング']::text[]),
  ('관리자_반응형_레이아웃_튜닝', $ja_title$管理者 レスポンシブ 레이아웃 튜닝$ja_title$, $ja_desc$1. 레이아웃 전환 브레이크포인트 조정$ja_desc$, $ja_body$# 管理者 レスポンシブ 레이아웃 튜닝

## 概要
1. 레이아웃 전환 브레이크포인트 조정

## 主な更新
- 기존 管理者 화면은 `lg(1024px)`부터 사이드바 레이아웃으로 전환되어 태블릿 폭에서 UI가 다소 과하게 데스크탑형으로 보였음.
- 버튼이 `w-full` 중심이라 모바일에서 버튼 덩어리가 커 보이고 밀도감이 떨어졌음.
- `app/admin/(protected)/layout.tsx`
- `lg:flex-row` -> `xl:flex-row`로 변경.
- 결과: 1024~1279px 구간은 상단 카드형 관리 네비를 유지하고, 1280px 이상에서만 고정 사이드바 전환.
- `components/admin/sidebar.tsx`
- 모바일/태블릿: 네비를 가로 pill 형태(`flex-wrap`)로 표시.
- 데스크탑(xl): 기존처럼 세로 메뉴(`block`)로 표시.

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업일지 - 2026-04-07 (관리자 반응형 레이아웃 튜닝)

## 변경 배경

- 기존 관리자 화면은 `lg(1024px)`부터 사이드바 레이아웃으로 전환되어 태블릿 폭에서 UI가 다소 과하게 데스크탑형으로 보였음.
- 버튼이 `w-full` 중심이라 모바일에서 버튼 덩어리가 커 보이고 밀도감이 떨어졌음.

## 적용 내용

1. 레이아웃 전환 브레이크포인트 조정

- `app/admin/(protected)/layout.tsx`
- `lg:flex-row` -> `xl:flex-row`로 변경.
- 결과: 1024~1279px 구간은 상단 카드형 관리 네비를 유지하고, 1280px 이상에서만 고정 사이드바 전환.

2. 관리자 사이드바 반응형 재구성

- `components/admin/sidebar.tsx`
- 모바일/태블릿: 네비를 가로 pill 형태(`flex-wrap`)로 표시.
- 데스크탑(xl): 기존처럼 세로 메뉴(`block`)로 표시.
- 상단 정보(로고/토글/계정정보)와 하단 액션(공개 사이트/로그아웃) 배치를 폭에 맞게 유연하게 전환.

3. 로그아웃 버튼 너비 고정 해제

- `components/admin/sign-out-button.tsx`
- `w-full` 강제 제거, `className` 주입형으로 변경.
- 필요 시 부모에서만 전체 너비를 주도록 구조 개선.

## 효과

- 태블릿 구간에서 레이아웃 급변이 줄어들어 시각적 이질감 완화.
- 모바일에서 버튼/네비가 과하게 커 보이지 않고, 더 압축된 관리자 UI 제공.

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과$ja_body$, ARRAY['ワークフロー', '管理者', 'UI/UX', 'モニタリング']::text[]),
  ('Admin_인라인_편집_About_KO_DB_Projects_DnD', $ja_title$Admin 인라인 편집 + About KO DB + Projects DnD$ja_title$, $ja_desc$Admin 인라인 편집 + About KO DB + Projects DnD 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# Admin 인라인 편집 + About KO DB + Projects DnD

## 概要
Admin 인라인 편집 + About KO DB + Projects DnD 作業内容을 整理한 기록입니다.

## 主な更新
- `profile_content.about_intro_description_ko` 컬럼 基準으로 KO 紹介 문구를 DB에서 관리하도록 반영.
- 公開 About 페이지는 `ko`에서 DB 문구 우선, 비어 있으면 locale 문구 fallback.
- `en/ja`는 기존 locale JSON 문구를 그대로 유지.
- 管理者 About API(`PUT /api/admin/about`)에 `introDescription` 필드 追加.
- Home 관리에서 드로어 편집을 제거하고, 페이지 본문에서 즉시 편집/저장하도록 변경.
- About 관리도 동일하게 인라인 편집으로 전환.
- 공통 UX 보강:
- Dirty state 표시(変更内容 있음/저장된 状態)

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업일지 - 2026-04-07 (Admin 인라인 편집 + About KO DB + Projects DnD)

## 1) About 소개 문구 DB 전환 (KO 전용)

- `profile_content.about_intro_description_ko` 컬럼 기준으로 KO 소개 문구를 DB에서 관리하도록 반영.
- 공개 About 페이지는 `ko`에서 DB 문구 우선, 비어 있으면 locale 문구 fallback.
- `en/ja`는 기존 locale JSON 문구를 그대로 유지.
- 관리자 About API(`PUT /api/admin/about`)에 `introDescription` 필드 추가.

## 2) Home/About 편집 UX 인라인 전환

- Home 관리에서 드로어 편집을 제거하고, 페이지 본문에서 즉시 편집/저장하도록 변경.
- About 관리도 동일하게 인라인 편집으로 전환.
- 공통 UX 보강:
  - Dirty state 표시(변경 사항 있음/저장된 상태)
  - 저장 중 버튼 비활성화
  - 성공/실패 메시지 표시

## 3) 상태 라벨/입력 방식 정리

- 관리자 화면 상태 라벨을 `공개 / 비공개`로 통일 (`draft` 내부값은 유지).
- 대시보드 요약/최근 항목의 상태 텍스트도 동일 라벨로 교체.
- Posts/Projects/About 편집 폼 상태 선택을 select에서 라디오 버튼으로 변경.

## 4) Projects 입력 모델 개편 + DnD

- `성과`, `주요 기여`를 줄바꿈 텍스트에서 아이템 입력/삭제/드래그 재정렬 방식으로 전환.
- `관련 링크`를 고정 3종에서 동적 목록(`label + url`) 추가/삭제/드래그 재정렬 방식으로 전환.
- 저장 시 링크는 배열 형태로 정규화해 저장.
- 레거시 링크 객체(`live/repo/detail`)는 API/리포지토리에서 읽기 호환 유지.

## 5) 인터랙션/접근성

- 관리자 편집 패널 및 About 공개 섹션에 강한 모션/호버 인터랙션 적용.
- `prefers-reduced-motion` 환경에서 `.ui-strong-motion` 범위의 transition/animation 시간을 축소.

## 6) 스키마/문서

- 신규 증분 마이그레이션 파일 추가:
  - `supabase/schema-v1.0.2.sql`
  - 내용: `about_intro_description_ko` 추가/백필 + `schema_migrations` 기록
- README의 스키마 적용 순서를 `v1.0.0 -> v1.0.1 -> v1.0.2`로 갱신.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', 'UI/UX']::text[]),
  ('대시보드_재구성_썸네일_업로드_2방식', $ja_title$대시보드 재구성 + 썸네일 업로드 2방식$ja_title$, $ja_desc$대시보드 재구성 + 썸네일 업로드 2방식 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 대시보드 재구성 + 썸네일 업로드 2방식

## 概要
대시보드 재구성 + 썸네일 업로드 2방식 作業内容을 整理한 기록입니다.

## 主な更新
- `Quick Links` 섹션 제거.
- 대시보드 역할을 운영 관점으로 강화:
- 핵심 지표 카드: ブログ/プロジェクト/お問い合わせ/紹介 公開状態
- 즉시 확인 항목: 신규 お問い合わせ, 임시저장 ブログ/プロジェクト, 紹介 임시저장 여부
- 최근 변경 현황: 최근 ブログ/プロジェクト/お問い合わせ 3건씩 要約
- 管理者 プロジェクト 편집 화면에 썸네일 입력 모드 追加:
- 외부 링크 붙여넣기
- PC 파일 업로드

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업일지 - 2026-04-07 (대시보드 재구성 + 썸네일 업로드 2방식)

## 1) 관리자 대시보드 재구성

- `Quick Links` 섹션 제거.
- 대시보드 역할을 운영 관점으로 강화:
  - 핵심 지표 카드: 블로그/프로젝트/문의/소개 공개상태
  - 즉시 확인 항목: 신규 문의, 임시저장 블로그/프로젝트, 소개 임시저장 여부
  - 최근 변경 현황: 최근 블로그/프로젝트/문의 3건씩 요약

## 2) 프로젝트 썸네일 입력 2가지 방식 지원

- 관리자 프로젝트 편집 화면에 썸네일 입력 모드 추가:
  - 외부 링크 붙여넣기
  - PC 파일 업로드
- 파일 업로드 API 추가:
  - `POST /api/admin/projects/upload-thumbnail`
  - 관리자 권한 검증 후 Supabase Storage 업로드
  - 업로드 성공 시 공개 URL 반환 후 폼의 `thumbnail` 값에 자동 반영
- 업로드 제한:
  - 이미지 파일만 허용
  - 최대 5MB

## 3) Supabase 설정 보완

- `.env.example`에 썸네일 버킷 변수 추가:
  - `SUPABASE_PROJECT_THUMBNAIL_BUCKET=project-thumbnails`
- `supabase/schema-v1.0.0.sql`에 기본 버킷 생성 SQL 추가:
  - `project-thumbnails` (public)

## 4) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과$ja_body$, ARRAY['ワークフロー', '管理者', 'Supabase', 'データベース', '認証', 'UI/UX']::text[]),
  ('댓글_공개_로그인_관리자_UX_정리', $ja_title$댓글 公開 ログイン + 管理者 UX 整理$ja_title$, $ja_desc$댓글 公開 ログイン + 管理者 UX 整理 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 댓글 公開 ログイン + 管理者 UX 整理

## 概要
댓글 公開 ログイン + 管理者 UX 整理 作業内容을 整理한 기록입니다.

## 主な更新
- ブログ 상세 페이지 하단 댓글 섹션에서 소셜 ログイン 状態를 기반으로 댓글 작성 가능하도록 구성.
- 댓글 작성 필수 항목:
- 이메일(필수)
- 닉네임(필수)
- 프로필사진 URL(선택)
- API에서 이메일 형식, 닉네임 길이, 본문 길이, 프로필 URL 형식 検証.
- ログイン 계정 이메일과 입력 이메일 불일치 시 차단.
- Supabase 환경값이 없는 경우 댓글 ログイン UI가 앱을 깨뜨리지 않도록 예외 처리 追加.

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업일지 - 2026-04-07 (댓글 공개 로그인 + 관리자 UX 정리)

## 1) 공개 댓글 기능 점검/보강

- 블로그 상세 페이지 하단 댓글 섹션에서 소셜 로그인 상태를 기반으로 댓글 작성 가능하도록 구성.
- 댓글 작성 필수 항목:
  - 이메일(필수)
  - 닉네임(필수)
  - 프로필사진 URL(선택)
- API에서 이메일 형식, 닉네임 길이, 본문 길이, 프로필 URL 형식 검증.
- 로그인 계정 이메일과 입력 이메일 불일치 시 차단.
- Supabase 환경값이 없는 경우 댓글 로그인 UI가 앱을 깨뜨리지 않도록 예외 처리 추가.

## 2) 관리자 화면 UX 구조 정리 확인

- 좌측 사이드바 카테고리 구조:
  - `/admin/blog`
  - `/admin/project`
  - `/admin/profile`
- `/admin`, `/admin/posts`, `/admin/projects`는 각각 새 경로로 리다이렉트.
- 본문 영역은 리스트 중심, 항목 클릭 시 우측 드로어 편집 패턴으로 통일.
- 사이드바에 공개 사이트 이동 링크와 로그아웃 버튼 배치.

## 3) 공개 페이지 미노출 이슈 관련 운영 기준

- 공개 사이트 데이터는 기본적으로 `published` 상태만 노출.
- 운영 혼선을 줄이기 위해 관리자 생성 폼 기본 상태를 `published` 중심으로 사용.

## 4) 스키마/운영 메모

- 댓글 저장 스키마는 작성자 메타(이메일, 닉네임, 프로필 URL) 컬럼을 사용하는 형태로 정리.
- 기존 데이터 호환을 위해 API/리포지토리에서 레거시 컬럼 부재 시 fallback 경로를 둠.

## 5) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', '認証', 'UI/UX']::text[]),
  ('문의_FAB_개선_관리자_대시보드_정리', $ja_title$お問い合わせ FAB 改善 + 管理者 대시보드 整理$ja_title$, $ja_desc$お問い合わせ FAB 改善 + 管理者 대시보드 整理 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# お問い合わせ FAB 改善 + 管理者 대시보드 整理

## 概要
お問い合わせ FAB 改善 + 管理者 대시보드 整理 作業内容을 整理한 기록입니다.

## 主な更新
- お問い合わせ 버튼을 텍스트형에서 SVG 아이콘형 원형 FAB로 변경.
- 접근성 보완:
- `aria-label` 유지
- `sr-only` 텍스트(`fabLabel`) 追加
- お問い合わせ 폼 제출 성공(`201`) 시:
- 폼 값 초기화
- 성공 메시지 설정
- 모달 자동 닫힘(`setOpen(false)`) 처리

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

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
  - 삭제된 admin 라우트로 인해 남아 있던 `.next/dev/types` 잔여 파일 정리 후 정상화$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'データベース', 'モニタリング']::text[]),
  ('문의_관리자_메모_라디오', $ja_title$お問い合わせ 管理者 메모 라디오$ja_title$, $ja_desc$お問い合わせ 管理者 메모 라디오 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# お問い合わせ 管理者 메모 라디오

## 概要
お問い合わせ 管理者 메모 라디오 作業内容을 整理한 기록입니다.

## 主な更新
- お問い合わせ함 관리에 `管理者 메모`를 DB 컬럼으로 追加
- お問い合わせ 상세 패널에서 状態 변경 UI를 `select`에서 `radio`로 전환
- お問い合わせ 상세 레이아웃을 다른 管理者 화면과 같은 카드형 구조로 整理
- 파일: `supabase/schema-v1.0.3.sql`
- 변경:
- `contact_messages.admin_note` 컬럼 追加
- 기존 데이터 백필(`NULL -> ''`)
- `not null + default ''` 適用

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업일지 (2026-04-07)

## 목표

- 문의함 관리에 `관리자 메모`를 DB 컬럼으로 추가
- 문의 상세 패널에서 상태 변경 UI를 `select`에서 `radio`로 전환
- 문의 상세 레이아웃을 다른 관리자 화면과 같은 카드형 구조로 정리

## 작업 내용

### 1) DB 마이그레이션 추가

- 파일: `supabase/schema-v1.0.3.sql`
- 변경:
  - `contact_messages.admin_note` 컬럼 추가
  - 기존 데이터 백필(`NULL -> ''`)
  - `not null + default ''` 적용
  - `schema_migrations`에 `v1.0.3` 이력 기록

### 2) 타입/리포지토리 반영

- 파일: `types/content.ts`
  - `ContactMessage` 타입에 `adminNote: string` 추가
- 파일: `lib/contact/repository.ts`
  - `admin_note` select/mapping 추가
  - 업데이트 함수를 상태 전용에서 상태+메모 동시 저장으로 확장

### 3) 관리자 API 확장

- 파일: `app/api/admin/contact/[id]/route.ts`
- 변경:
  - payload에 `adminNote` 파싱/검증(최대 3000자)
  - `status + adminNote`를 함께 저장하도록 업데이트

### 4) 문의함 관리자 UI 개편

- 파일: `components/admin/contact-manager.tsx`
- 변경:
  - 상세 패널 레이아웃을 카드형 섹션으로 재구성
    - 문의자 정보
    - 문의 내용
    - 관리자 메모
    - 상태 라디오 그룹
  - 상태 선택을 `select` -> `radio`로 변경
  - 변경사항 감지(`isDirty`) 후 저장 버튼 활성화
  - 목록에서 메모 존재 시 `메모 있음` 배지 표시

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 적용 안내

- Supabase SQL Editor에서 `supabase/schema-v1.0.3.sql`을 실행해야 실제 DB 컬럼이 생성됩니다.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', 'UI/UX']::text[]),
  ('관리자_페이지네이션_주스탄드_타입_v1_0_5', $ja_title$管理者 ページネーション 주스탄드 타입 v1.0.5$ja_title$, $ja_desc$管理者 ページネーション 주스탄드 타입 v1.0.5 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 管理者 ページネーション 주스탄드 타입 v1.0.5

## 概要
管理者 ページネーション 주스탄드 타입 v1.0.5 作業内容을 整理한 기록입니다.

## 主な更新
- 管理者 `blog/projects/contact` 탭에 ページネーション(기본 10개)과 `id` 쿼리스트링 동기화를 適用했습니다.
- 公開 사이트 ログイン 모달을 전역 오버레이(전체 블러) 방식으로 보강하고, お問い合わせ 모달 状態를 Zustand로 이관했습니다.
- 타입 구조를 `types/` 도메인 파일로 분리하고, 주요 컴포넌트/API의 인라인 타입을 整理했습니다.
- `detailLabel`을 公開 UI/로케일에서 완전 제거했습니다.
- `supabase/schema-v1.0.5.sql` 증분 마이그레이션 파일을 追加했습니다.
- 状態관리
- `stores/public-ui.ts`: 公開 ログイン/お問い合わせ 모달 状態
- `stores/admin-detail.ts`: 管理者 상세 패널 선택 id 状態

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

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
- `npm run build` 통과$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', '認証']::text[]),
  ('readingTime_제거_Admin_구조_재편_Markdown_에디터', $ja_title$readingTime 제거 + Admin 구조 재편 + Markdown 에디터$ja_title$, $ja_desc$1. readingTime 제거$ja_desc$, $ja_body$# readingTime 제거 + Admin 구조 재편 + Markdown 에디터

## 概要
1. readingTime 제거

## 主な更新
- blog의 `readingTime` 의존성을 타입/저장소/API/UI/시드/MDX에서 완전히 제거
- `components/admin`을 기능 폴더 + 공통 폴더 구조로 재배치
- Blog 본문 + Project 要約에 Toast UI 기반 Markdown 에디터 토글 도입
- `types/content.ts`의 blog 관련 타입에서 `readingTime` 제거
- `lib/blog/repository.ts`에서 `reading_time` select/저장/변환 로직 제거
- `/api/admin/posts`, `/api/admin/posts/[id]` payload에서 `readingTime` 제거
- ブログ 카드/상세의 읽기시간 렌더 제거
- `content/blog/*.mdx` metadata에서 `readingTime` 削除

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업 일지 - 2026-04-08 (readingTime 제거 + Admin 구조 재편 + Markdown 에디터)

## 적용 목표

- blog의 `readingTime` 의존성을 타입/저장소/API/UI/시드/MDX에서 완전히 제거
- `components/admin`을 기능 폴더 + 공통 폴더 구조로 재배치
- Blog 본문 + Project 요약에 Toast UI 기반 Markdown 에디터 토글 도입

## 주요 변경 사항

1. readingTime 제거

- `types/content.ts`의 blog 관련 타입에서 `readingTime` 제거
- `lib/blog/repository.ts`에서 `reading_time` select/저장/변환 로직 제거
- `/api/admin/posts`, `/api/admin/posts/[id]` payload에서 `readingTime` 제거
- 블로그 카드/상세의 읽기시간 렌더 제거
- `content/blog/*.mdx` metadata에서 `readingTime` 삭제
- `scripts/seed-supabase.mjs` posts upsert에서 `reading_time` 제거
- `supabase/schema-v1.0.4.sql` 추가 (`posts.reading_time` drop)

2. Admin 구조 재편

- 기능 폴더: `about`, `blog`, `projects`, `home`, `contact`
- 공통 폴더: `components/admin/common`
- `posts-manager` -> `blog/blog-manager`로 리네이밍
- admin 관련 import 전면 갱신

3. Markdown 에디터 토글 도입

- `@toast-ui/editor` 의존성 추가
- 공통 컴포넌트 추가:
  - `components/admin/common/toast-markdown-editor.tsx`
  - `components/admin/common/markdown-field.tsx`
- Blog 본문: `에디터 사용` 체크 시 Toast UI 에디터 전환
- Project 요약: 동일 방식 토글 적용
- 토글 상태는 편집 화면 로컬 상태(비저장)로 유지

4. Project 요약 렌더 정책 반영

- 상세 페이지: Markdown 렌더
- 카드/메타(description): markdown 문법 제거한 plain text 렌더

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 참고 메모

- `@toast-ui/react-editor`는 React 19 peer dependency 충돌로 채택하지 않았고, 동일한 Toast UI의 vanilla 패키지(`@toast-ui/editor`)로 구현함.$ja_body$, ARRAY['ワークフロー', '管理者', 'Supabase', 'データベース', 'UI/UX', 'SEO']::text[]),
  ('홈_소개_리뉴얼_1차', $ja_title$홈/紹介 리뉴얼 1차$ja_title$, $ja_desc$홈/紹介 리뉴얼 1차 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 홈/紹介 리뉴얼 1차

## 概要
홈/紹介 리뉴얼 1차 作業内容을 整理한 기록입니다.

## 主な更新
- 2026-04-09
- 홈을 단일 풀블리드 Hero 슬라이더 중심으로 전환
- About 페이지를 좌우 2단(技術スタック/프로필 사진) 구조로 개편
- 管理者에서 메인 Hero 노출 항목을 수동 관리할 수 있는 `Home Highlight` 탭 追加
- 홈
- `app/[lang]/(site)/page.tsx`에서 기존 `TechStack/FeaturedProjects/RecentPosts` 섹션 제거
- `ImmersiveHeroSlider` 컴포넌트 신규 도입
- 메인/썸네일 Swiper 동기화, CTA 버튼, 풀블리드 레이아웃 適用

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업 일지 - 홈/소개 리뉴얼 1차

## 작업일

- 2026-04-09

## 목표

- 홈을 단일 풀블리드 Hero 슬라이더 중심으로 전환
- About 페이지를 좌우 2단(기술 스택/프로필 사진) 구조로 개편
- 관리자에서 메인 Hero 노출 항목을 수동 관리할 수 있는 `Home Highlight` 탭 추가

## 주요 변경 사항

- 홈
  - `app/[lang]/(site)/page.tsx`에서 기존 `TechStack/FeaturedProjects/RecentPosts` 섹션 제거
  - `ImmersiveHeroSlider` 컴포넌트 신규 도입
  - 메인/썸네일 Swiper 동기화, CTA 버튼, 풀블리드 레이아웃 적용
- 소개(공개)
  - About 페이지를 `좌(소개+기술 로고 카드+강점+작업방식) / 우(프로필 사진)` 구조로 재배치
  - 기술 스택 로고/설명을 카드형 인터랙션으로 노출
- 관리자
  - `/admin/highlight` 신규 페이지 추가
  - `components/admin/highlight/highlight-manager.tsx`로 항목 추가/정렬/활성화/오버라이드 저장 기능 구현
  - 사이드바에 `홈 하이라이트` 메뉴 추가
  - 대시보드 카드에 홈 하이라이트 현황 추가

## 데이터 계층 변경

- 신규 마이그레이션: `supabase/schema-v1.0.8.sql`
  - `home_highlights` 테이블 추가
  - `profile_content.about_photo_url` 컬럼 추가
  - `profile_content.about_tech_items` 컬럼 추가
- 신규 리포지토리: `lib/home/repository.ts`
  - 관리자용 하이라이트 조회/저장
  - 공개 홈용 슬라이드 해석 로직(override + fallback)
- 신규 API: `GET/PUT /api/admin/highlights`

## 타입 변경

- `types/home.ts` 신규 추가
  - `HomeHighlight`, `HomeHighlightSourceOption`, `HomeHighlightResolvedSlide` 등
- `types/profile.ts` 확장
  - `aboutPhotoUrl`, `aboutTechItems` 추가
- `types/ui.ts` 확장
  - `HomeHighlightManagerProps`, `HomeHeroSliderProps` 추가

## 비고

- 이번 단계는 홈/소개/관리자 하이라이트 운영까지로 제한
- 블로그/프로젝트 페이지의 화려한 리뉴얼은 다음 단계로 분리$ja_body$, ARRAY['ワークフロー', '管理者', 'Supabase', 'データベース', 'UI/UX', 'デプロイ']::text[]),
  ('About_클릭_리빌_인터랙션_모바일_반응형', $ja_title$About 클릭 리빌 인터랙션 + 모바일 レスポンシブ$ja_title$, $ja_desc$1. 위치 클래스 분리$ja_desc$, $ja_body$# About 클릭 리빌 인터랙션 + 모바일 レスポンシブ

## 概要
1. 위치 클래스 분리

## 主な更新
- 公開 About 페이지를 서버/클라이언트 분리 구조로 변경했습니다.
- 서버 페이지: 데이터 조회 + 라벨 전달만 담당
- 클라이언트 컴포넌트: 클릭 인터랙션/애니메이션 状態 관리
- 초기 状態는 중앙 원형 프로필 이미지 중심으로 렌더링되며, 클릭 시:
- 프로필 카드가 우측 방향으로 이동
- 紹介 텍스트와 技術スタック 카드가 순차적으로 등장
- 모바일 レスポンシブ을 고려해 다음을 適用했습니다.
- 단일 컬럼 基準 안전한 폭(`w-[220px]`, `sm:w-[270px]`)

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# About 클릭 리빌 인터랙션 + 모바일 반응형

## 작업 내용
- 공개 About 페이지를 서버/클라이언트 분리 구조로 변경했습니다.
  - 서버 페이지: 데이터 조회 + 라벨 전달만 담당
  - 클라이언트 컴포넌트: 클릭 인터랙션/애니메이션 상태 관리
- 초기 상태는 중앙 원형 프로필 이미지 중심으로 렌더링되며, 클릭 시:
  - 프로필 카드가 우측 방향으로 이동
  - 소개 텍스트와 기술 스택 카드가 순차적으로 등장
- 모바일 반응형을 고려해 다음을 적용했습니다.
  - 단일 컬럼 기준 안전한 폭(`w-[220px]`, `sm:w-[270px]`)
  - 모바일에서 과도한 이동을 피하는 완만한 `translate-x`
  - 기술 스택 1~2열 자동 전환
- 프로필 이미지는 전 구간 `object-contain`으로 유지해 잘림을 방지했습니다.

## 변경 파일
- `app/[lang]/(site)/about/page.tsx`
- `components/about/interactive-about-reveal.tsx`
- `types/ui.ts`

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 후속 조정
- 프로필 카드 내 `열기/닫기` 텍스트를 제거했습니다.
- 초기 상태에서 프로필 카드가 위아래로 살짝 움직이는 `bounce` 애니메이션을 추가했습니다.
- 클릭 확장 시 프로필 카드는 천천히 오른쪽으로 이동하도록 전환 시간을 늘렸습니다.
- 데스크탑에서 프로필 카드가 항상 화면 정중앙 높이에 맞춰 보이도록 위치 계산을 조정했습니다.
- 프로필 사진이 프레임 안에서 작게 보이던 문제를 수정했습니다.
  - 원형 프레임 패딩/보더를 축소
  - 이미지 렌더를 `object-contain`에서 `object-cover object-top`으로 변경
  - 프로필 카드처럼 보이도록 하단 그라데이션 오버레이를 추가

## 후속 히스토리 (추가)
1. 위치 클래스 분리
- 요청에 맞춰 위치 관련 Tailwind 클래스를 `profileButtonPosition` 객체로 분리했습니다.
- 목적: 모바일/데스크톱 위치 보정을 한 곳에서 관리하고, 회귀를 줄이기 위함.

2. 모바일 닫힘 상태 상단 보정
- 닫힘 상태에서 프로필 버튼이 모바일에서만 위로 이동하도록 조정했습니다.
- 이후 헤더와 겹침 이슈가 확인되어 단순 top 값 보정만으로는 한계가 있음을 확인했습니다.

3. 모바일 닫힘 상태 콘텐츠 0 처리
- 닫힘 상태일 때 모바일에서 콘텐츠 영역을 `w/h = 0`에 가깝게 접어 보이지 않게 처리했습니다.
- 데스크톱 동작은 유지하도록 `lg:*` 클래스 분기 처리했습니다.

4. 모션 끊김 완화
- `w/h` 직접 전환으로 끊기던 문제를 줄이기 위해 `max-height + opacity + transform` 기반 전환으로 변경했습니다.
- 레이아웃 점프를 줄이기 위해 콘텐츠 카드(`article`) 자체보다 래퍼에서 모션을 처리하도록 구조를 조정했습니다.

5. 모바일 이동 제거(최종)
- 최종 결정: 모바일에서는 프로필 버튼의 위치 이동을 제거하고, 동일 위치 고정으로 변경했습니다.
- 열림 상태에서는 위치 이동 대신 `scale`만 서서히 키우도록 조정했습니다.
- 데스크톱에서만 우측 이동 애니메이션을 유지했습니다.

## 최종 상태 요약
- 모바일:
  - 프로필 버튼 위치 고정(열림/닫힘 동일)
  - 콘텐츠는 펼침/접힘 모션만 동작
  - 열림 시 버튼 `scale` 강조
- 데스크톱:
  - 기존 의도대로 우측 이동 + 콘텐츠 리빌 유지
- 코드 가독성:
  - 위치 관련 클래스는 객체 분리 + 한국어 주석 반영$ja_body$, ARRAY['ワークフロー', 'UI/UX', 'アニメーション', 'モニタリング']::text[]),
  ('About_페이지_리뉴얼_반응형_인터랙션', $ja_title$About 페이지 리뉴얼 (レスポンシブ + 인터랙션)$ja_title$, $ja_desc$About 페이지 리뉴얼 (レスポンシブ + 인터랙션) 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# About 페이지 리뉴얼 (レスポンシブ + 인터랙션)

## 概要
About 페이지 리뉴얼 (レスポンシブ + 인터랙션) 作業内容을 整理한 기록입니다.

## 主な更新
- 紹介 페이지를 단순 정보 나열에서 벗어나 인터랙티브한 브랜드 섹션으로 재구성한다.
- 데스크탑/모바일 모두 자연스럽게 보이도록 レスポンシブ 레이아웃을 整理한다.
- 파일: `app/[lang]/(site)/about/page.tsx`
- 레이아웃
- 풀폭 배경(그라디언트/라디얼 레이어) 適用
- 상단: 紹介 텍스트 카드 + 프로필 카드 2단(모바일 1단) 구성
- 하단: 기술스택 인터랙티브 카드 그리드 구성
- 인터랙션

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# About 페이지 리뉴얼 (반응형 + 인터랙션)

## 작업 목적
- 소개 페이지를 단순 정보 나열에서 벗어나 인터랙티브한 브랜드 섹션으로 재구성한다.
- 데스크탑/모바일 모두 자연스럽게 보이도록 반응형 레이아웃을 정리한다.

## 변경 내용
- 파일: `app/[lang]/(site)/about/page.tsx`
- 레이아웃
  - 풀폭 배경(그라디언트/라디얼 레이어) 적용
  - 상단: 소개 텍스트 카드 + 프로필 카드 2단(모바일 1단) 구성
  - 하단: 기술스택 인터랙티브 카드 그리드 구성
- 인터랙션
  - 카드 hover 시 translate/scale/shadow 전환
  - 프로필 카드에 글로우/확대 전환
  - 기술 로고 hover 시 확대 효과
  - `SlideIn` 시퀀스 모션으로 섹션 진입 애니메이션 강화
- 카피/라벨
  - locale별 라벨 세분화(`profileCard`, `experience`, `skillDeck`, `core`)

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과$ja_body$, ARRAY['ワークフロー', 'リファクタリング', 'UI/UX', 'アニメーション', 'モニタリング', '多言語対応']::text[]),
  ('Vercel_1차_프로덕션_배포_Production_only', $ja_title$Vercel 1차 프로덕션 デプロイ (Production only)$ja_title$, $ja_desc$1. Vercel CLI ログイン 및 プロジェクト 연결$ja_desc$, $ja_body$# Vercel 1차 프로덕션 デプロイ (Production only)

## 概要
1. Vercel CLI ログイン 및 プロジェクト 연결

## 主な更新
- Vercel プロジェクト 연결: `wogml3270s-projects/j-blog`
- 프로덕션 alias URL(기존): `https://j-blog-two.vercel.app`
- 프로덕션 alias URL(변경): `https://j-fe-blog.vercel.app`
- デプロイ Inspect URL:
- `https://vercel.com/wogml3270s-projects/j-blog/7y2RQHECuCd2wGuAZVhDySJnDgpz`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# Vercel 1차 프로덕션 배포 (Production only)

## 배포 결과
- Vercel 프로젝트 연결: `wogml3270s-projects/j-blog`
- 프로덕션 alias URL(기존): `https://j-blog-two.vercel.app`
- 프로덕션 alias URL(변경): `https://j-fe-blog.vercel.app`
- 배포 Inspect URL:
  - `https://vercel.com/wogml3270s-projects/j-blog/7y2RQHECuCd2wGuAZVhDySJnDgpz`

## 적용한 작업
1. Vercel CLI 로그인 및 프로젝트 연결
2. Production 배포 1회 수행
3. `.env.local` 기준으로 Vercel Production 환경변수 등록
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `SUPABASE_PROJECT_THUMBNAIL_BUCKET`
   - `ADMIN_ALLOWED_EMAILS`
4. 환경변수 반영을 위해 Production 재배포 1회 추가 수행

## 스모크 테스트 결과
- `/` -> `200`
- `/about` -> `200`
- `/blog` -> `200`
- `/projects` -> `200`
- `/admin/login` -> `200`
- `/auth/callback`(code 없음) -> `307 /admin/login?reason=missing_code`
- `https://j-fe-blog.vercel.app` -> `200`

## Supabase 대시보드에서 수동으로 맞춰야 할 항목
- Auth > URL Configuration
  - Site URL: `https://j-fe-blog.vercel.app`
  - Additional Redirect URLs:
    - `https://j-fe-blog.vercel.app/auth/callback`
    - `https://j-blog-two.vercel.app/auth/callback` (임시 호환)
    - `http://localhost:3000/auth/callback`
- Auth > Providers (Google/GitHub/Kakao)
  - Supabase callback URL은 기존 방식 유지
  - 각 Provider 콘솔에 위 production callback URL 반영 여부 확인

## 메모
- Vercel 빌드 로그에 `.env` 파일 감지 경고가 있어, 장기적으로는 로컬 `.env` 파일 의존 없이 Vercel 환경변수만 사용하도록 정리 필요.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', '認証', 'デプロイ']::text[]),
  ('관리자_안정화_예약_발행_에디터_고정_v1_0_12', $ja_title$管理者 안정화 + 예약 발행 + 에디터 고정 (v1.0.12)$ja_title$, $ja_desc$管理者 안정화 + 예약 발행 + 에디터 고정 (v1.0.12) 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 管理者 안정화 + 예약 발행 + 에디터 고정 (v1.0.12)

## 概要
管理者 안정화 + 예약 발행 + 에디터 고정 (v1.0.12) 作業内容을 整理한 기록입니다.

## 主な更新
- 管理者 ブログ/プロジェクト 진입 시 간헐적으로 발생하던 `removeChild` DOM エラー를 완화한다.
- 썸네일 업로드 UX를 즉시 미리보기 + 자동 업로드 방식으로 단순화한다.
- ブログ 예약 발행을 도입하고, 실제 게시일을 자동 정책으로 고정한다.
- Markdown 입력은 항상 Toast UI 에디터를 사용하도록 통일한다.
- `EditorDrawer`는 `open=false`일 때 컴포넌트를 언마운트하도록 변경했다.
- Toast UI Editor/Viewer 整理 루틴에 안전 가드(중복 destroy 방지, cleanup 보강)를 追加했다.
- ブログ/プロジェクト 썸네일 업로드에서 `업로드 후 適用` 버튼을 제거하고 파일 선택 즉시:
- 로컬 미리보기 표시

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 관리자 안정화 + 예약 발행 + 에디터 고정 (v1.0.12)

## 작업 목적
- 관리자 블로그/프로젝트 진입 시 간헐적으로 발생하던 `removeChild` DOM 오류를 완화한다.
- 썸네일 업로드 UX를 즉시 미리보기 + 자동 업로드 방식으로 단순화한다.
- 블로그 예약 발행을 도입하고, 실제 게시일을 자동 정책으로 고정한다.
- Markdown 입력은 항상 Toast UI 에디터를 사용하도록 통일한다.

## 주요 변경
- `EditorDrawer`는 `open=false`일 때 컴포넌트를 언마운트하도록 변경했다.
- Toast UI Editor/Viewer 정리 루틴에 안전 가드(중복 destroy 방지, cleanup 보강)를 추가했다.
- 블로그/프로젝트 썸네일 업로드에서 `업로드 후 적용` 버튼을 제거하고 파일 선택 즉시:
  - 로컬 미리보기 표시
  - 스토리지 업로드 자동 실행
  - 성공 시 URL 반영
  - 실패 시 에러 메시지 노출
- 블로그 편집 폼:
  - `메인 페이지 노출` 체크를 `공개/비공개` 라디오와 같은 영역에 배치
  - `실제 게시일`은 읽기 전용 표시로 변경
  - `예약 발행(datetime-local)` 입력 + 해제 버튼 추가
- 블로그 게시일 정책:
  - `draft`는 `published_at`, `scheduled_publish_at` 모두 `null`
  - 최초 공개 시 1회만 `published_at` 설정
  - 예약 발행 시 최초 `published_at`을 예약 시각으로 설정
  - 공개 이력이 있는 글은 이후 저장 시 `published_at` 유지
- 공개 블로그 조회 조건에 예약 발행 필터를 추가했다.
  - `status='published'` AND `(scheduled_publish_at is null OR scheduled_publish_at <= now())`
- MarkdownField는 토글 UI를 제거하고 항상 Toast UI 에디터만 렌더하도록 변경했다.

## 스키마
- `supabase/v1/schema-v1.0.12.sql` 추가
  - `posts.scheduled_publish_at timestamptz` 컬럼 추가
  - 조회 성능용 인덱스 추가
  - `schema_migrations`에 `v1.0.12` 기록

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 메모
- `prettier`는 `.sql` 파서를 자동 인식하지 못해 SQL 파일은 포맷 대상에서 제외했다.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', 'UI/UX']::text[]),
  ('관리자_위치_변경_드래그_통일', $ja_title$管理者 위치 변경 드래그 통일$ja_title$, $ja_desc$管理者 위치 변경 드래그 통일 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 管理者 위치 변경 드래그 통일

## 概要
管理者 위치 변경 드래그 통일 作業内容을 整理한 기록입니다.

## 主な更新
- 管理者 페이지의 위치 변경 기능을 화살표 버튼이 아닌 마우스 드래그로 통일한다.
- プロジェクト 관리에서 사용 중인 dnd-kit 방식과 동일한 UX를 Home/About에도 適用한다.
- Home 管理者 (`components/admin/home/home-manager.tsx`)
- 위/아래 버튼 기반 정렬 로직 제거
- `@dnd-kit` 기반 드래그 정렬로 변경 (`DndContext`, `SortableContext`, `useSortable`)
- 항목 카드 좌측에 드래그 핸들(`≡`) 追加
- 순서 저장은 기존 payload(orderIndex) 흐름 그대로 유지
- About 管理者 (`components/admin/about/about-manager.tsx`)

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 관리자 위치 변경 드래그 통일

## 작업 목적
- 관리자 페이지의 위치 변경 기능을 화살표 버튼이 아닌 마우스 드래그로 통일한다.
- 프로젝트 관리에서 사용 중인 dnd-kit 방식과 동일한 UX를 Home/About에도 적용한다.

## 변경 내용
- Home 관리자 (`components/admin/home/home-manager.tsx`)
  - 위/아래 버튼 기반 정렬 로직 제거
  - `@dnd-kit` 기반 드래그 정렬로 변경 (`DndContext`, `SortableContext`, `useSortable`)
  - 항목 카드 좌측에 드래그 핸들(`≡`) 추가
  - 순서 저장은 기존 payload(orderIndex) 흐름 그대로 유지

- About 관리자 (`components/admin/about/about-manager.tsx`)
  - 기술 스택 항목 순서 변경을 드래그 정렬로 변경
  - 한 줄(horizontal) 나열 레이아웃에서 드래그 가능한 카드로 구성
  - 각 카드에 드래그 핸들(`≡`) 추가
  - 삭제 기능은 기존과 동일 유지

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과

## 확인 포인트
- Home에서 드래그 순서 변경 후 저장 시 순서 유지되는지
- About 기술 스택을 가로 방향으로 드래그 정렬 후 저장/재진입 시 순서 유지되는지$ja_body$, ARRAY['ワークフロー', '管理者', 'UI/UX', 'モニタリング']::text[]),
  ('기술스택_순서_이동_한_줄_레이아웃_정리', $ja_title$기술스택 순서 이동 + 한 줄 레이아웃 整理$ja_title$, $ja_desc$기술스택 순서 이동 + 한 줄 레이아웃 整理 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 기술스택 순서 이동 + 한 줄 레이아웃 整理

## 概要
기술스택 순서 이동 + 한 줄 레이아웃 整理 作業内容을 整理한 기록입니다.

## 主な更新
- About 관리에서 기술스택 노출 순서를 직접 바꿀 수 있게 한다.
- 公開 About 기술스택을 한 줄 레이아웃으로 보기 좋게 정렬한다.
- 管理者 About (`components/admin/about/about-manager.tsx`)
- 기술 항목 순서 이동 함수 追加: `moveTechItem(id, direction)`
- 기술 목록 UI를 2열 그리드에서 가로 1줄(`overflow-x-auto`) 카드 나열로 변경
- 각 항목에 `↑`, `↓`, `削除` 버튼 追加
- 순서 변경 결과는 기존 `aboutTechItems` 배열 순서대로 저장되며 公開 페이지에도 반영
- 公開 About (`app/[lang]/(site)/about/page.tsx`)

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 기술스택 순서 이동 + 한 줄 레이아웃 정리

## 작업 목적
- About 관리에서 기술스택 노출 순서를 직접 바꿀 수 있게 한다.
- 공개 About 기술스택을 한 줄 레이아웃으로 보기 좋게 정렬한다.

## 변경 내용
- 관리자 About (`components/admin/about/about-manager.tsx`)
  - 기술 항목 순서 이동 함수 추가: `moveTechItem(id, direction)`
  - 기술 목록 UI를 2열 그리드에서 가로 1줄(`overflow-x-auto`) 카드 나열로 변경
  - 각 항목에 `↑`, `↓`, `삭제` 버튼 추가
  - 순서 변경 결과는 기존 `aboutTechItems` 배열 순서대로 저장되며 공개 페이지에도 반영

- 공개 About (`app/[lang]/(site)/about/page.tsx`)
  - 기술스택 렌더를 그리드에서 가로 1줄 스크롤 레이아웃으로 변경
  - 각 아이템에 아이콘 + 기술명을 함께 노출
  - 기존 "추가 개수(+N)" 표시는 제거

## 확인 포인트
- 관리자 About에서 `↑/↓` 이동 후 저장 시 순서가 유지되는지
- 공개 About에서 기술스택이 한 줄로 정렬되고, 항목이 많을 때 가로 스크롤되는지$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'UI/UX', 'モニタリング']::text[]),
  ('소개_단순화_리뉴얼_v1_0_13', $ja_title$紹介 단순화 리뉴얼 v1.0.13$ja_title$, $ja_desc$紹介 단순화 리뉴얼 v1.0.13 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 紹介 단순화 리뉴얼 v1.0.13

## 概要
紹介 단순화 리뉴얼 v1.0.13 作業内容을 整理한 기록입니다.

## 主な更新
- `profile_content` 모델을 단순화하기 위해 불필요한 About 컬럼 5개를 제거하는 증분 마이그레이션을 追加했습니다.
- 管理者 About 편집/저장 경로를 단순 모델(`name`, `title`, `summary`, `about_photo_url`, `about_tech_items`, `status`) 基準으로 整理했습니다.
- 公開 About 페이지를 단순 모델 기반 레이아웃으로 재구성하고, 프로필 이미지는 모든 디바이스에서 잘리지 않도록 `object-contain`으로 고정했습니다.
- 사용되지 않는 `/api/admin/profile` 엔드포인트 경로를 제거했습니다.
- 시드 스크립트의 `profile_content` 업서트 구조를 새 スキーマ에 맞게 整理했습니다.
- `supabase/v1/schema-v1.0.13.sql`
- `types/profile.ts`
- `lib/profile/repository.ts`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 소개 단순화 리뉴얼 v1.0.13

## 작업 요약
- `profile_content` 모델을 단순화하기 위해 불필요한 About 컬럼 5개를 제거하는 증분 마이그레이션을 추가했습니다.
- 관리자 About 편집/저장 경로를 단순 모델(`name`, `title`, `summary`, `about_photo_url`, `about_tech_items`, `status`) 기준으로 정리했습니다.
- 공개 About 페이지를 단순 모델 기반 레이아웃으로 재구성하고, 프로필 이미지는 모든 디바이스에서 잘리지 않도록 `object-contain`으로 고정했습니다.
- 사용되지 않는 `/api/admin/profile` 엔드포인트 경로를 제거했습니다.
- 시드 스크립트의 `profile_content` 업서트 구조를 새 스키마에 맞게 정리했습니다.

## 변경 파일
- `supabase/v1/schema-v1.0.13.sql`
- `types/profile.ts`
- `lib/profile/repository.ts`
- `app/api/admin/about/route.ts`
- `app/[lang]/(site)/about/page.tsx`
- `scripts/seed-supabase.mjs`
- `docs/worklogs/2026-04-10/소개-단순화-리뉴얼-v1.0.13.md`

## 비고
- 기존 v1.0.0/v1.0.2 스키마 파일에는 과거 컬럼 정의가 남아 있으며, 이번 버전에서는 증분 마이그레이션(`v1.0.13`)으로 제거합니다.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', 'UI/UX']::text[]),
  ('소셜_아바타_next_image_에러_해결', $ja_title$소셜 아바타 next/image 에러 解決$ja_title$, $ja_desc$소셜 아바타 next/image 에러 解決 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 소셜 아바타 next/image 에러 解決

## 概要
소셜 아바타 next/image 에러 解決 作業内容을 整理한 기록입니다.

## 主な更新
- 카카오 ログイン 시 `Invalid src prop ... k.kakaocdn.net` 에러 발생
- 구글 ログイン은 이미지 URL이 존재해도 일부 화면에서 아바타 렌더 실패
- 소셜 프로필 URL 정규화 유틸 追加
- `http://k.kakaocdn.net/...` -> `https://k.kakaocdn.net/...` 교정
- 허용 프로토콜(`http/https`) 이외 값 차단
- 헤더 인증 모달 아바타를 `next/image`에서 `img`로 전환
- 소셜 아바타 렌더를 도메인 최적화 제약에서 분리
- `next.config.ts` `images.remotePatterns`에 소셜 도메인 명시 追加

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 소셜 아바타 next/image 에러 해결

## 이슈
- 카카오 로그인 시 `Invalid src prop ... k.kakaocdn.net` 에러 발생
- 구글 로그인은 이미지 URL이 존재해도 일부 화면에서 아바타 렌더 실패

## 조치
- 소셜 프로필 URL 정규화 유틸 추가
  - `http://k.kakaocdn.net/...` -> `https://k.kakaocdn.net/...` 교정
  - 허용 프로토콜(`http/https`) 이외 값 차단
- 헤더 인증 모달 아바타를 `next/image`에서 `img`로 전환
  - 소셜 아바타 렌더를 도메인 최적화 제약에서 분리
- `next.config.ts` `images.remotePatterns`에 소셜 도메인 명시 추가
  - `k.kakaocdn.net`, `lh3.googleusercontent.com`, `avatars.githubusercontent.com`

## 변경 파일
- `lib/utils/avatar-url.ts`
- `components/layout/header.tsx`
- `components/blog/comments-section.tsx`
- `lib/auth/admin.ts`
- `next.config.ts`$ja_body$, ARRAY['ワークフロー', '管理者', '認証', 'パフォーマンス', 'バグ修正', 'モニタリング']::text[]),
  ('수파베이스_스토리지_업로드_정비', $ja_title$수파베이스 ストレージ 업로드 정비$ja_title$, $ja_desc$1. Supabase SQL Editor에서 `schema-v1.0.9.sql` 실행$ja_desc$, $ja_body$# 수파베이스 ストレージ 업로드 정비

## 概要
1. Supabase SQL Editor에서 `schema-v1.0.9.sql` 실행

## 主な更新
- 管理者에서 PC 이미지 업로드 시 Supabase Storage로 직접 저장되도록 일원화 필요
- 페이지별로 ストレージ 폴더를 분리해 운영/관리 가독성 改善 필요
- 공통 업로드 스코프 확장
- `about | blog | projects | home | misc`
- 업로드 경로 규칙 통일
- `/{scope}/{YYYY-MM-DD}/{unique}-{filename}.{ext}`
- 버킷 환경변수 우선순위 整理
- `SUPABASE_STORAGE_BUCKET` 우선

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 수파베이스 스토리지 업로드 정비

## 작업 배경
- 관리자에서 PC 이미지 업로드 시 Supabase Storage로 직접 저장되도록 일원화 필요
- 페이지별로 스토리지 폴더를 분리해 운영/관리 가독성 개선 필요

## 적용 내용
- 공통 업로드 스코프 확장
  - `about | blog | projects | home | misc`
- 업로드 경로 규칙 통일
  - `/{scope}/{YYYY-MM-DD}/{unique}-{filename}.{ext}`
- 버킷 환경변수 우선순위 정리
  - `SUPABASE_STORAGE_BUCKET` 우선
  - 없으면 `SUPABASE_PROJECT_THUMBNAIL_BUCKET` fallback
- 공통 클라이언트 업로드 유틸 추가
  - `lib/admin/upload-client.ts`
- 관리자 업로드 연동 정리
  - 블로그 썸네일 업로드 -> 공통 유틸 사용
  - 프로젝트 썸네일 업로드 -> 공통 유틸 사용
  - About 관리에 프로필 이미지 파일 업로드 추가
  - About 관리에 기술 로고 파일 업로드 추가
  - Home 관리에 하이라이트 배경 이미지 파일 업로드 추가
- 증분 SQL 추가
  - `supabase/schema-v1.0.9.sql`
  - 버킷 보정/마이그레이션 기록 포함

## 환경변수 검수/수정
- 잘못 들어간 Storage S3 URL 제거
- `.env.local` 수정:
  - `SUPABASE_STORAGE_BUCKET=project-thumbnails`
  - `SUPABASE_PROJECT_THUMBNAIL_BUCKET=project-thumbnails`
- `NEXT_PUBLIC_SUPABASE_URL`은 프로젝트 URL(`https://<project-id>.supabase.co`) 유지

## 검증 결과
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build`는 샌드박스 네트워크 제한(google fonts fetch)으로 확인 불가

## 후속 할 일
1. Supabase SQL Editor에서 `schema-v1.0.9.sql` 실행
2. 관리자에서 블로그/프로젝트/About/Home 이미지 업로드 실사용 점검
3. 키 노출 이력으로 `SUPABASE_SERVICE_ROLE_KEY` rotate 권장$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', 'UI/UX']::text[]),
  ('슬러그_중복_안내_About_SVG_업로드_개선', $ja_title$슬러그 중복 안내 + About SVG 업로드 改善$ja_title$, $ja_desc$슬러그 중복 안내 + About SVG 업로드 改善 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 슬러그 중복 안내 + About SVG 업로드 改善

## 概要
슬러그 중복 안내 + About SVG 업로드 改善 作業内容을 整理한 기록입니다.

## 主な更新
- 슬러그 중복 발생 시 管理者에게 이해하기 쉬운 エラー 메시지를 제공한다.
- About 탭의 프로필/기술 로고 업로드 UX를 ブログ·プロジェクト 썸네일 업로드와 동일하게 맞춘다.
- 기술 로고 업로드에서 SVG 태그 문자열 입력 방식도 지원한다.
- DB 에러 파싱 유틸 追加:
- `lib/utils/db-error.ts`
- `toSlugConflictMessage()`로 `23505 + slug` 충돌을 한국어 메시지로 변환.
- 저장소 에러 메시지 改善:
- `lib/blog/repository.ts`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 슬러그 중복 안내 + About SVG 업로드 개선

## 작업 목적
- 슬러그 중복 발생 시 관리자에게 이해하기 쉬운 오류 메시지를 제공한다.
- About 탭의 프로필/기술 로고 업로드 UX를 블로그·프로젝트 썸네일 업로드와 동일하게 맞춘다.
- 기술 로고 업로드에서 SVG 태그 문자열 입력 방식도 지원한다.

## 변경 내용
- DB 에러 파싱 유틸 추가:
  - `lib/utils/db-error.ts`
  - `toSlugConflictMessage()`로 `23505 + slug` 충돌을 한국어 메시지로 변환.
- 저장소 에러 메시지 개선:
  - `lib/blog/repository.ts`
  - `lib/projects/repository.ts`
  - create/update 시 slug unique 충돌이면 `이미 사용 중인 슬러그` 안내 문구 반환.
- About 업로드 UX 개선:
  - `components/admin/about/about-manager.tsx`
  - 프로필 이미지: URL/파일 업로드 모드, 파일 선택 즉시 미리보기 + 자동 업로드.
  - 기술 로고: URL/파일/SVG 코드 모드, 파일 선택 즉시 미리보기 + 자동 업로드.
  - SVG 코드 업로드: `<svg>...</svg>` 문자열을 `image/svg+xml` 파일로 변환해 스토리지 업로드.
  - 로컬 Object URL 정리(cleanup) 로직 추가.

## 확인 포인트
- 블로그/프로젝트에서 중복 slug 저장 시 한국어 안내 문구가 노출되는지.
- About 기술 로고에서 SVG 코드 입력 업로드가 정상 동작하는지.
- 업로드 선택 즉시 미리보기 및 URL 반영이 되는지.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'データベース', 'UI/UX', 'バグ修正']::text[]),
  ('프로젝트_요약_분리_슬러그_동기화_저장', $ja_title$プロジェクト 要約 분리 + 슬러그 동기화 저장$ja_title$, $ja_desc$1. Supabase SQL Editor에서 `supabase/schema-v1.0.10.sql` 실행$ja_desc$, $ja_body$# プロジェクト 要約 분리 + 슬러그 동기화 저장

## 概要
1. Supabase SQL Editor에서 `supabase/schema-v1.0.10.sql` 실행

## 主な更新
- プロジェクト 설명을 마크다운으로 길게 작성하면 홈 ハイライト에서 설명이 과도하게 길게 노출됨
- 管理者의 `제목과 동일` 체크가 재진입 시 풀려 보이는 문제(ブログ/プロジェクト 공통)
- プロジェクト 데이터 모델 확장
- `projects.home_summary` 追加: 홈 ハイライト용 짧은 要約
- `projects.sync_slug_with_title` 追加: 슬러그 자동 동기화 체크 저장
- ブログ 데이터 모델 확장
- `posts.sync_slug_with_title` 追加
- 홈 ハイライト 설명 로직 改善

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 프로젝트 요약 분리 + 슬러그 동기화 저장

## 배경
- 프로젝트 설명을 마크다운으로 길게 작성하면 홈 하이라이트에서 설명이 과도하게 길게 노출됨
- 관리자의 `제목과 동일` 체크가 재진입 시 풀려 보이는 문제(블로그/프로젝트 공통)

## 변경 사항
- 프로젝트 데이터 모델 확장
  - `projects.home_summary` 추가: 홈 하이라이트용 짧은 요약
  - `projects.sync_slug_with_title` 추가: 슬러그 자동 동기화 체크 저장
- 블로그 데이터 모델 확장
  - `posts.sync_slug_with_title` 추가
- 홈 하이라이트 설명 로직 개선
  - 프로젝트 설명은 `home_summary` 우선 사용
  - 없으면 기존 `summary`를 plain text로 변환해 fallback
  - 최종 설명은 170자 제한으로 잘라 과도 노출 방지
- 관리자 저장/복원 로직 반영
  - 프로젝트 편집: `홈 노출 요약` 입력 필드 추가
  - 프로젝트/블로그 저장 payload에 `syncSlugWithTitle` 포함
  - 수정 화면 진입 시 DB 값으로 체크 상태 복원
- API/리포지토리/타입 반영
  - `types/projects.ts`, `types/blog.ts`, `types/ui.ts` 업데이트
  - `app/api/admin/projects*`, `app/api/admin/posts*` payload 파서 확장
  - `lib/projects/repository.ts`, `lib/blog/repository.ts`, `lib/home/repository.ts` 반영
- DB 마이그레이션
  - `supabase/schema-v1.0.10.sql` 추가

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과

## 적용 순서
1. Supabase SQL Editor에서 `supabase/schema-v1.0.10.sql` 실행
2. 관리자 프로젝트/블로그에서 저장 후 재진입해 체크 복원 확인
3. 홈 하이라이트에서 프로젝트 설명 길이 노출 확인$ja_body$, ARRAY['ワークフロー', '管理者', 'Supabase', 'データベース', 'UI/UX', 'モニタリング']::text[]),
  ('하이드레이션_안정화_기술스택_세로_정렬_수정_기능', $ja_title$하이드레이션 안정화 + 기술스택 세로 정렬/修正 기능$ja_title$, $ja_desc$하이드레이션 안정화 + 기술스택 세로 정렬/修正 기능 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 하이드레이션 안정화 + 기술스택 세로 정렬/修正 기능

## 概要
하이드레이션 안정화 + 기술스택 세로 정렬/修正 기능 作業内容을 整理한 기록입니다.

## 主な更新
- 管理者에서 간헐적으로 발생하는 hydration 경고 가능성을 줄인다.
- About 기술스택을 가로 나열이 아닌 세로 1줄 리스트로 整理한다.
- About 기술스택 항목을 追加/削除뿐 아니라 항목별 修正도 가능하게 만든다.
- 하이드레이션 안정화
- `components/admin/projects/projects-manager.tsx`
- 초기 렌더에서 사용하던 비결정 ID 생성(`Math.random`, `Date.now`) 제거
- 초기 목록 ID는 `createStableId(...)`로 결정적으로 생성
- 사용자 액션으로 새 항목 追加할 때만 `createClientId(...)` 사용

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 하이드레이션 안정화 + 기술스택 세로 정렬/수정 기능

## 작업 목적
- 관리자에서 간헐적으로 발생하는 hydration 경고 가능성을 줄인다.
- About 기술스택을 가로 나열이 아닌 세로 1줄 리스트로 정리한다.
- About 기술스택 항목을 추가/삭제뿐 아니라 항목별 수정도 가능하게 만든다.

## 변경 내용
- 하이드레이션 안정화
  - `components/admin/projects/projects-manager.tsx`
  - 초기 렌더에서 사용하던 비결정 ID 생성(`Math.random`, `Date.now`) 제거
  - 초기 목록 ID는 `createStableId(...)`로 결정적으로 생성
  - 사용자 액션으로 새 항목 추가할 때만 `createClientId(...)` 사용

- About 기술스택 UX 개선
  - `components/admin/about/about-manager.tsx`
  - DnD 전략을 가로(horizontal)에서 세로(vertical)로 변경
  - 기술스택 목록을 세로 카드 리스트(`space-y`)로 변경
  - 각 카드에서 기술명/로고URL/설명을 직접 수정 가능하도록 입력 필드 추가
  - 드래그 핸들(`≡`)로 순서 변경 + 삭제 기능 유지

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과

## 확인 포인트
- About 기술스택 항목 수정 후 저장 시 공개 페이지에 반영되는지
- About 기술스택 드래그 순서가 저장 후에도 유지되는지
- 관리자 진입 시 hydration 경고가 재발하는지$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'UI/UX', 'パフォーマンス', 'モニタリング']::text[]),
  ('홈_탭_단순화_프로젝트_입력_라벨_정리_v1_0_11', $ja_title$홈 탭 단순화 + プロジェクト 입력 라벨 整理 (v1.0.11)$ja_title$, $ja_desc$1. Supabase SQL Editor에서 `supabase/v1/schema-v1.0.11.sql` 실행$ja_desc$, $ja_body$# 홈 탭 단순화 + プロジェクト 입력 라벨 整理 (v1.0.11)

## 概要
1. Supabase SQL Editor에서 `supabase/v1/schema-v1.0.11.sql` 실행

## 主な更新
- 홈 관리 탭에서 제목/설명/이미지 오버라이드를 제거하고 CTA 오버라이드만 유지
- 홈 관리 UI를 썸네일 미리보기 + 제목 중심 카드형으로 단순화
- 홈 관리 조작을 순서 이동 + 활성/비활성 + CTA 라벨 입력으로 제한
- プロジェクト 편집 폼 라벨/입력 방식 整理
- `홈 노출 要約` -> `부제목`
- `부제목` 입력을 textarea -> input으로 변경
- `要約` -> `プロジェクト 내용`
- `プロジェクト 내용` 입력 최소 높이 180 -> 320

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 홈 탭 단순화 + 프로젝트 입력 라벨 정리 (v1.0.11)

## 변경 요약
- 홈 관리 탭에서 제목/설명/이미지 오버라이드를 제거하고 CTA 오버라이드만 유지
- 홈 관리 UI를 썸네일 미리보기 + 제목 중심 카드형으로 단순화
- 홈 관리 조작을 순서 이동 + 활성/비활성 + CTA 라벨 입력으로 제한
- 프로젝트 편집 폼 라벨/입력 방식 정리
  - `홈 노출 요약` -> `부제목`
  - `부제목` 입력을 textarea -> input으로 변경
  - `요약` -> `프로젝트 내용`
  - `프로젝트 내용` 입력 최소 높이 180 -> 320

## 코드 반영
- 타입
  - `types/home.ts`: `overrideTitle/overrideDescription/overrideImageUrl` 제거
- API
  - `app/api/admin/highlights/route.ts`: CTA-only payload 파싱으로 축소
- 리포지토리
  - `lib/home/repository.ts`:
    - home_highlights select/매핑에서 title/description/image 오버라이드 제거
    - 슬라이드 해석 시 원본 title/description/image 사용
    - CTA는 `overrideCtaLabel`만 적용
- 관리자 UI
  - `components/admin/home/home-manager.tsx`:
    - 썸네일+제목 카드형 리스트
    - 위/아래 이동, 활성화 토글, CTA 라벨 입력만 유지
    - 삭제/이미지 업로드/제목·설명 오버라이드 입력 제거
  - `components/admin/projects/projects-manager.tsx`:
    - 부제목 input 적용
    - 프로젝트 내용 라벨/placeholder 변경
    - MarkdownField 높이 320으로 상향

## DB 마이그레이션
- `supabase/v1/schema-v1.0.11.sql` 추가
  - `home_highlights.override_title` drop
  - `home_highlights.override_description` drop
  - `home_highlights.override_image_url` drop
  - `override_cta_label` 유지
  - `schema_migrations` 버전 기록 추가

## 검증
- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- `npm run build` 통과 (권한 상승 실행)

## 적용 순서
1. Supabase SQL Editor에서 `supabase/v1/schema-v1.0.11.sql` 실행
2. 관리자 `/admin/home`에서 순서/활성/CTA 저장 확인
3. 공개 홈에서 제목/설명/이미지가 원본 기준으로 출력되는지 확인$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', '認証']::text[]),
  ('About_데스크탑_자동_리빌_1차', $ja_title$About 데스크탑 자동 리빌 1차$ja_title$, $ja_desc$About 데스크탑 자동 리빌 1차 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# About 데스크탑 자동 리빌 1차

## 概要
About 데스크탑 자동 리빌 1차 作業内容을 整理한 기록입니다.

## 主な更新
- `components/about/interactive-about-reveal.tsx`
- 데스크탑(`min-width: 1024px`)에서 클릭 없이 초기 진입 시 자동 리빌되도록 状態를 분리했습니다.
- `isDesktopAutoReveal` 状態 追加
- 실제 열림 여부는 `isOpen = isDesktopAutoReveal || isExpanded`로 통합
- 모바일은 기존 클릭 토글 동작을 그대로 유지합니다.
- 데스크탑 자동 리빌 状態에서는 버튼 클릭으로 접히지 않도록 가드했습니다.
- CSS 변수 표기 오타를 整理했습니다.
- `min-h-[--home-hero-height]` -> `min-h-[var(--home-hero-height)]`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# About 데스크탑 자동 리빌 1차

## 변경 내용
- `components/about/interactive-about-reveal.tsx`
- 데스크탑(`min-width: 1024px`)에서 클릭 없이 초기 진입 시 자동 리빌되도록 상태를 분리했습니다.
  - `isDesktopAutoReveal` 상태 추가
  - 실제 열림 여부는 `isOpen = isDesktopAutoReveal || isExpanded`로 통합
- 모바일은 기존 클릭 토글 동작을 그대로 유지합니다.
- 데스크탑 자동 리빌 상태에서는 버튼 클릭으로 접히지 않도록 가드했습니다.
- CSS 변수 표기 오타를 정리했습니다.
  - `min-h-[--home-hero-height]` -> `min-h-[var(--home-hero-height)]`

## 검증
- `npx eslint components/about/interactive-about-reveal.tsx` 통과$ja_body$, ARRAY['ワークフロー', 'リファクタリング', 'モニタリング']::text[]),
  ('About_디바이스_훅_분리_모바일_프로필_상단_고정', $ja_title$About 디바이스 훅 분리 + 모바일 프로필 상단 고정$ja_title$, $ja_desc$About 디바이스 훅 분리 + 모바일 프로필 상단 고정 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# About 디바이스 훅 분리 + 모바일 프로필 상단 고정

## 概要
About 디바이스 훅 분리 + 모바일 프로필 상단 고정 作業内容을 整理한 기록입니다.

## 主な更新
- `isMobile`, `isDesktop` 판별 로직을 커스텀 훅으로 분리했습니다.
- `lib/hooks/use-device.ts` 追加
- `window.matchMedia` 기반으로 모바일/데스크톱 状態 동기화
- `components/about/interactive-about-reveal.tsx`
- 컴포넌트 내부 `matchMedia` 직접 처리 로직 제거
- `useDevice()` 훅 사용으로 치환
- 모바일 프로필 위치를 상단 고정으로 整理
- base: `top-0`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# About 디바이스 훅 분리 + 모바일 프로필 상단 고정

## 변경 내용
- `isMobile`, `isDesktop` 판별 로직을 커스텀 훅으로 분리했습니다.
  - `lib/hooks/use-device.ts` 추가
  - `window.matchMedia` 기반으로 모바일/데스크톱 상태 동기화
- `components/about/interactive-about-reveal.tsx`
  - 컴포넌트 내부 `matchMedia` 직접 처리 로직 제거
  - `useDevice()` 훅 사용으로 치환
  - 모바일 프로필 위치를 상단 고정으로 정리
    - base: `top-0`
    - expanded: 모바일 `top-0` 유지, 데스크톱만 우측 이동
  - 자동 리빌 타이밍은 디바이스별로 분기
    - 모바일: 더 빠르게 시작
    - 데스크톱: 기존보다 약간 느리게 시작
- `min-h-[--home-hero-height]` 표기 유지

## 검증
- `npx eslint components/about/interactive-about-reveal.tsx lib/hooks/use-device.ts`
- `npx tsc --noEmit`
- 두 검증 모두 통과$ja_body$, ARRAY['ワークフロー', 'リファクタリング', 'UI/UX', 'モニタリング']::text[]),
  ('공개_리스트_스켈레톤_순차_모션_적용', $ja_title$公開 리스트 스켈레톤 + 순차 모션 適用$ja_title$, $ja_desc$0번째 카드부터 아래->위 순서로 자연스럽게 올라오도록 구성했습니다.$ja_desc$, $ja_body$# 公開 리스트 스켈레톤 + 순차 모션 適用

## 概要
0번째 카드부터 아래->위 순서로 자연스럽게 올라오도록 구성했습니다.

## 主な更新
- プロジェクト/ブログ 리스트 진입 시 로딩 状態가 비어 보여 체감이 딱딱했습니다.
- 카드 등장 모션이 동시에 시작되어 시선 흐름이 약했습니다.
- 리스트 페이지 카드 렌더에 `map`의 두 번째 인자(`index`)를 사용해 순차 지연을 適用했습니다.
- `app/[lang]/(site)/projects/page.tsx`
- `animationDelay={index * 70}` 追加
- `app/[lang]/(site)/blog/page.tsx`
- `animationDelay={index * 70}` 追加
- 라우트 진입용 스켈레톤 파일을 신규 追加했습니다.

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 공개 리스트 스켈레톤 + 순차 모션 적용

## 작업 배경
- 프로젝트/블로그 리스트 진입 시 로딩 상태가 비어 보여 체감이 딱딱했습니다.
- 카드 등장 모션이 동시에 시작되어 시선 흐름이 약했습니다.

## 변경 내용
- 리스트 페이지 카드 렌더에 `map`의 두 번째 인자(`index`)를 사용해 순차 지연을 적용했습니다.
  - `app/[lang]/(site)/projects/page.tsx`
    - `animationDelay={index * 70}` 추가
  - `app/[lang]/(site)/blog/page.tsx`
    - `animationDelay={index * 70}` 추가
- 라우트 진입용 스켈레톤 파일을 신규 추가했습니다.
  - `app/[lang]/(site)/projects/loading.tsx`
  - `app/[lang]/(site)/blog/loading.tsx`
- 스켈레톤 카드도 `SlideIn`으로 감싸고 `delay={index * 70}`을 적용해
  0번째 카드부터 아래->위 순서로 자연스럽게 올라오도록 구성했습니다.

## 검증
- `npx eslint app/[lang]/(site)/projects/page.tsx app/[lang]/(site)/blog/page.tsx app/[lang]/(site)/projects/loading.tsx app/[lang]/(site)/blog/loading.tsx`
- `npx tsc --noEmit`
- 두 검증 모두 통과했습니다.$ja_body$, ARRAY['ワークフロー', 'アニメーション', 'モニタリング']::text[]),
  ('v1_0_14_관리자_UX_정비_About_상태_제거', $ja_title$v1.0.14 管理者 UX 정비 + About 状態 제거$ja_title$, $ja_desc$v1.0.14 管理者 UX 정비 + About 状態 제거 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# v1.0.14 管理者 UX 정비 + About 状態 제거

## 概要
v1.0.14 管理者 UX 정비 + About 状態 제거 作業内容을 整理한 기록입니다.

## 主な更新
- 홈 슬라이드 관리 탭에 ページネーション 없이 필터만 追加
- About 公開/비公開 状態 기능을 DB/API/UI에서 제거
- ブログ/プロジェクト 리스트를 썸네일/제목/태그/날짜 중심 미리보기형으로 강화
- 기존 더미데이터 생성 흔적 및 실제 더미 데이터 整理
- 홈 슬라이드 관리
- 소스 필터(`전체 소스/プロジェクト/ブログ`) 追加
- 노출 필터(`전체 노출/활성/비활성`) 追加
- 필터 適用 状態에서도 드래그 정렬/활성 토글/CTA 라벨 편집 유지

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# v1.0.14 관리자 UX 정비 + About 상태 제거

## 작업 목적
- 홈 슬라이드 관리 탭에 페이지네이션 없이 필터만 추가
- About 공개/비공개 상태 기능을 DB/API/UI에서 제거
- 블로그/프로젝트 리스트를 썸네일/제목/태그/날짜 중심 미리보기형으로 강화
- 기존 더미데이터 생성 흔적 및 실제 더미 데이터 정리

## 적용 내용
- 홈 슬라이드 관리
  - 소스 필터(`전체 소스/프로젝트/블로그`) 추가
  - 노출 필터(`전체 노출/활성/비활성`) 추가
  - 필터 적용 상태에서도 드래그 정렬/활성 토글/CTA 라벨 편집 유지
- About 상태 제거
  - `types/profile.ts`에서 `status` 필드 제거
  - `lib/profile/repository.ts`에서 `profile_content.status` 의존 제거
  - `/api/admin/about` 요청/응답에서 `status` 제거
  - 관리자 About 탭에서 상태 배지/라디오 제거
  - 대시보드의 About 상태 표시를 이름/최종 변경일 중심으로 정리
- 관리자 리스트 미리보기 강화
  - 블로그/프로젝트 모두 리스트 행에 썸네일, 제목, 태그(상위 3개), 날짜 표시
  - 블로그 날짜는 `publishedAt` 우선, 없으면 `updatedAt` 사용
  - 프로젝트 날짜는 `updatedAt` 고정
- SQL 정리
  - `supabase/v1/schema-v1.0.5.sql`에서 더미 insert 블록 제거(인덱스 전용)
  - `supabase/v1/schema-v1.0.14.sql` 추가
    - `profile_content.status` 제거
    - `profile_public_read` 정책을 상시 조회로 재정의
    - 더미 posts/projects/contact_messages 삭제
    - `schema_migrations` 기록/보정

## 확인 포인트
- `/admin/home` 필터 조합별 목록 노출 확인
- `/admin/about`에서 상태 UI 제거 및 저장 정상 동작 확인
- `/admin/blog`, `/admin/projects` 리스트의 미리보기 요소 노출 확인
- `schema-v1.0.14.sql` 실행 전 백업 여부 확인 후 적용$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', 'UI/UX']::text[]),
  ('관리자_헤더_매니저_구조_리팩터링', $ja_title$管理者 헤더/매니저 구조 리팩터링$ja_title$, $ja_desc$管理者 헤더/매니저 구조 리팩터링 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 管理者 헤더/매니저 구조 리팩터링

## 概要
管理者 헤더/매니저 구조 리팩터링 作業内容을 整理한 기록입니다.

## 主な更新
- dashboard와 home의 책임 분리
- 管理者 탭 헤더를 ManagerShell로 통일
- 필터/선택박스/버튼 영역을 공통 Toolbar 컴포넌트로 통일
- 홈 매니저 네이밍을 `dashboard-home-manager`에서 `home-manager`로 整理
- 매니저 분리/리네임
- `components/admin/home/dashboard-home-manager.tsx` -> `components/admin/home/home-manager.tsx`
- `DashboardHomeManager` -> `HomeManager`
- `DashboardHomeManagerProps` -> `HomeManagerProps`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 관리자 헤더/매니저 구조 리팩터링

## 작업 목적
- dashboard와 home의 책임 분리
- 관리자 탭 헤더를 ManagerShell로 통일
- 필터/선택박스/버튼 영역을 공통 Toolbar 컴포넌트로 통일
- 홈 매니저 네이밍을 `dashboard-home-manager`에서 `home-manager`로 정리

## 적용 내용
- 매니저 분리/리네임
  - `components/admin/home/dashboard-home-manager.tsx` -> `components/admin/home/home-manager.tsx`
  - `DashboardHomeManager` -> `HomeManager`
  - `DashboardHomeManagerProps` -> `HomeManagerProps`
  - `/admin/home/page.tsx` import/사용처 갱신
- 대시보드 분리
  - `components/admin/dashboard/dashboard-manager.tsx` 신설
  - `/admin/(protected)/dashboard/page.tsx`는 데이터 fetch + `<DashboardManager />`만 담당
- ManagerShell 표준화
  - `ManagerShellProps`에 `title` 필드 추가
  - ManagerShell 내부에서 공통 title 렌더
  - `home/blog/projects/contact/about` 탭의 page-level `h1` 제거
- Toolbar 공통화
  - `components/admin/common/admin-toolbar.tsx` 신설
    - `AdminToolbar`
    - `AdminToolbarSelect`
    - `AdminToolbarAction`
  - home/blog/projects/contact의 action 영역을 공통 Toolbar로 교체

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 실패(네트워크 제한으로 Google Fonts 접근 불가)$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'UI/UX', 'モニタリング']::text[]),
  ('대시보드_홈_네이밍_통일', $ja_title$대시보드 홈 네이밍 통일$ja_title$, $ja_desc$대시보드 홈 네이밍 통일 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 대시보드 홈 네이밍 통일

## 概要
대시보드 홈 네이밍 통일 作業内容을 整理한 기록입니다.

## 主な更新
- 홈 ハイライト 관리 기능이 대시보드 운영 흐름에 통합된 状態인데, 코드/컴포넌트 네이밍이 `HomeHighlightManager`로 남아 있어 의미가 혼재되고 있었습니다.
- `/admin/highlight` 경로가 일부 링크에 남아 있어 실제 운영 경로(`/admin/home`)와 불일치가 발생하고 있었습니다.
- 管理者 홈 관리 컴포넌트 파일명을 변경했습니다.
- `components/admin/home/home-manager.tsx`
- -> `components/admin/home/dashboard-home-manager.tsx`
- 컴포넌트/타입 네이밍을 대시보드 基準으로 통일했습니다.
- `HomeHighlightManager` -> `DashboardHomeManager`
- `HomeHighlightManagerProps` -> `DashboardHomeManagerProps`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 대시보드 홈 네이밍 통일

## 작업 배경
- 홈 하이라이트 관리 기능이 대시보드 운영 흐름에 통합된 상태인데, 코드/컴포넌트 네이밍이 `HomeHighlightManager`로 남아 있어 의미가 혼재되고 있었습니다.
- `/admin/highlight` 경로가 일부 링크에 남아 있어 실제 운영 경로(`/admin/home`)와 불일치가 발생하고 있었습니다.

## 변경 내용
- 관리자 홈 관리 컴포넌트 파일명을 변경했습니다.
  - `components/admin/home/home-manager.tsx`
  - -> `components/admin/home/dashboard-home-manager.tsx`
- 컴포넌트/타입 네이밍을 대시보드 기준으로 통일했습니다.
  - `HomeHighlightManager` -> `DashboardHomeManager`
  - `HomeHighlightManagerProps` -> `DashboardHomeManagerProps`
- 관리자 홈 페이지의 import 및 페이지 함수명을 정리했습니다.
  - `app/admin/(protected)/home/page.tsx`
  - `AdminHighlightPage` -> `AdminDashboardHomePage`
  - 페이지 제목: `홈 관리` -> `대시보드 홈 관리`
- 홈 로딩 컴포넌트 함수명을 정리했습니다.
  - `app/admin/(protected)/home/loading.tsx`
  - `AdminHighlightLoading` -> `AdminDashboardHomeLoading`
- 대시보드 내부 링크를 실제 운영 경로로 통일했습니다.
  - `app/admin/(protected)/dashboard/page.tsx`
  - `/admin/highlight` -> `/admin/home`
  - 카드 라벨 `홈 하이라이트` -> `대시보드 홈`
- 저장 성공/실패 메시지 문구를 대시보드 맥락으로 정리했습니다.

## 검증
- `npx eslint app/admin/(protected)/home/page.tsx app/admin/(protected)/home/loading.tsx app/admin/(protected)/dashboard/page.tsx components/admin/home/dashboard-home-manager.tsx types/ui.ts`
- `npx tsc --noEmit`
- 두 검증 모두 통과했습니다.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'UI/UX', 'デプロイ', 'モニタリング']::text[]),
  ('더미데이터_정리_최종_스키마_정리_v1_0_15', $ja_title$더미데이터 整理 + 최종 スキーマ 整理 (v1.0.15)$ja_title$, $ja_desc$1. `supabase/v1/schema-v1.0.15.sql`$ja_desc$, $ja_body$# 더미데이터 整理 + 최종 スキーマ 整理 (v1.0.15)

## 概要
1. `supabase/v1/schema-v1.0.15.sql`

## 主な更新
- プロジェクト/ブログ/お問い合わせ함의 기존 테스트 더미 데이터를 제거하고, 운영 시연에 사용할 수 있는 현실적인 샘플 데이터를 재구성한다.
- `supabase/v1` 基準 최종 구조를 한 번에 확인/適用할 수 있는 통합 スキーマ 파일을 追加한다.
- 기존 더미 패턴(`dummy-*`, `test-*`, `[더미]`) 및 기존 seed 슬러그 기반 데이터 整理.
- `posts` 10건, `projects` 10건, `contact_messages` 10건 현실형 샘플 데이터 재삽입.
- `contact_messages.status`를 `new|replied`로 정규화(`read -> replied`) 후 체크 제약 재정의.
- `post_tags`, `post_tag_map`를 샘플 태그 基準으로 재구성.
- v1.0.0 ~ v1.0.15 누적 결과를 반영한 최종 통합 구조 スキーマ 追加.
- 포함 범위:

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 더미데이터 정리 + 최종 스키마 정리 (v1.0.15)

## 작업 목적
- 프로젝트/블로그/문의함의 기존 테스트 더미 데이터를 제거하고, 운영 시연에 사용할 수 있는 현실적인 샘플 데이터를 재구성한다.
- `supabase/v1` 기준 최종 구조를 한 번에 확인/적용할 수 있는 통합 스키마 파일을 추가한다.

## 반영 내용
1. `supabase/v1/schema-v1.0.15.sql`
- 기존 더미 패턴(`dummy-*`, `test-*`, `[더미]`) 및 기존 seed 슬러그 기반 데이터 정리.
- `posts` 10건, `projects` 10건, `contact_messages` 10건 현실형 샘플 데이터 재삽입.
- `contact_messages.status`를 `new|replied`로 정규화(`read -> replied`) 후 체크 제약 재정의.
- `post_tags`, `post_tag_map`를 샘플 태그 기준으로 재구성.

2. `supabase/v1/schema-v1.0.15-최종.sql` (신규)
- v1.0.0 ~ v1.0.15 누적 결과를 반영한 최종 통합 구조 스키마 추가.
- 포함 범위:
  - enum/type
  - tables/columns/defaults/constraints
  - trigger/functions
  - indexes
  - grants + RLS policies
  - 운영 기본 seed(profile singleton/admin allowlist/storage bucket)
  - schema_migrations 기록
- 제외 범위:
  - 샘플 콘텐츠 더미 데이터(posts/projects/contact_messages)

## 확인 포인트
- 최종 통합 스키마에는 삭제 완료된 레거시 필드(`reading_time`, `about_intro_description_ko`, `about_experience`, `work_style`, `strengths`, `profile_content.status`, `home_highlights`의 제거된 override 필드)가 포함되지 않음.

## 다음 적용 순서(권장)
1. Supabase SQL Editor에서 `schema-v1.0.15.sql` 실행(데이터 정리+샘플 입력).
2. 신규 환경 전체 초기화가 필요할 때만 `schema-v1.0.15-최종.sql` 사용.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', 'デプロイ']::text[]),
  ('로컬_수정_프로덕션_캐시_동기화', $ja_title$로컬 修正-프로덕션 캐시 동기화$ja_title$, $ja_desc$1. 공통 revalidate 전략 확장 (`lib/cache/revalidate.ts`)$ja_desc$, $ja_body$# 로컬 修正-프로덕션 캐시 동기화

## 概要
1. 공통 revalidate 전략 확장 (`lib/cache/revalidate.ts`)

## 主な更新
- 로컬 管理者에서 데이터 저장 시, 로컬 서버의 `revalidatePath`만 실행되어 프로덕션 캐시에는 즉시 반영되지 않는 문제가 있었다.
- 기존 locale별 경로 `revalidatePath`는 유지.
- 로컬/개발 환경에서만 선택적으로 프로덕션에 재検証 요청을 전파하도록 확장.
- 신규 환경변수:
- `REVALIDATE_TARGET_URL`
- `REVALIDATE_SECRET`
- `POST /api/internal/revalidate`
- 헤더 `x-revalidate-secret` 検証 후 전달받은 `paths`를 현재 인스턴스에서 재検証.

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 로컬 수정-프로덕션 캐시 동기화

## 배경
- 로컬 관리자에서 데이터 저장 시, 로컬 서버의 `revalidatePath`만 실행되어 프로덕션 캐시에는 즉시 반영되지 않는 문제가 있었다.

## 변경 내용
1. 공통 revalidate 전략 확장 (`lib/cache/revalidate.ts`)
- 기존 locale별 경로 `revalidatePath`는 유지.
- 로컬/개발 환경에서만 선택적으로 프로덕션에 재검증 요청을 전파하도록 확장.
- 신규 환경변수:
  - `REVALIDATE_TARGET_URL`
  - `REVALIDATE_SECRET`

2. 내부 revalidate API 추가 (`app/api/internal/revalidate/route.ts`)
- `POST /api/internal/revalidate`
- 헤더 `x-revalidate-secret` 검증 후 전달받은 `paths`를 현재 인스턴스에서 재검증.
- 권한 없는 호출은 401 반환.

3. 관리자 mutation 라우트 await 처리
- `posts/projects/about/highlights` 저장/수정/삭제 라우트에서
  `await revalidate...` 적용.
- 대상 파일:
  - `app/api/admin/posts/route.ts`
  - `app/api/admin/posts/[id]/route.ts`
  - `app/api/admin/projects/route.ts`
  - `app/api/admin/projects/[id]/route.ts`
  - `app/api/admin/about/route.ts`
  - `app/api/admin/highlights/route.ts`

4. 환경변수 예시 문서화
- `.env.example`에 `REVALIDATE_TARGET_URL`, `REVALIDATE_SECRET` 추가.

## 적용 가이드
- 로컬 `.env.local`:
  - `REVALIDATE_TARGET_URL=https://j-fe-blog.vercel.app`
  - `REVALIDATE_SECRET=<랜덤 시크릿>`
- Vercel Production 환경변수:
  - `REVALIDATE_SECRET=<동일 값>`
- 이후 로컬 관리자 저장 시:
  - 로컬 캐시 + 프로덕션 캐시 동시 무효화.

## 검증
- `npx tsc --noEmit` 통과.

## 실제 적용 결과(운영)
- Vercel Production 환경변수 `REVALIDATE_SECRET` 추가 완료.
- 테스트용 임시 변수 `CODEx_TEMP_REVALIDATE_TEST`는 제거 완료.
- 최신 배포를 재실행하고 `j-fe-blog.vercel.app` alias를 최신 배포로 재지정 완료.

## 엔드포인트 검증
- `POST /api/internal/revalidate` (헤더 없음) -> `401 Unauthorized` 확인.
- 동일 엔드포인트에 로컬 `REVALIDATE_SECRET` 헤더 포함 -> `200` 확인.
- 결과적으로 로컬 관리자 저장 시 프로덕션 캐시 동기화 경로가 활성화됨.

## 추가 원인 분석 및 보정
- 공개 페이지가 `/blog`로 접속되더라도 실제 렌더는 middleware rewrite로 `/ko/blog` 경로에서 수행된다.
- 기존 revalidate는 기본 로케일(ko)에 대해 `/blog`만 무효화해 `/ko/blog` 캐시를 놓칠 수 있었다.
- 보정:
  - revalidate 대상 경로를 locale별로 `withLocalePath` + `withLocaleRoutePath`를 모두 포함하도록 수정.
  - 예: `/blog` + `/ko/blog` 동시 무효화.

## 추가 보강(즉시 반영 안정화)
- 프로덕션 공개 응답 헤더 점검 시 `x-vercel-cache: HIT`와 `age` 누적이 확인되어, 캐시 계층 영향 가능성이 남아 있었다.
- 보강:
  1. `app/[lang]/(site)/layout.tsx`
  - `headers()` 호출을 추가해 공개 라우트를 명시적으로 Request-time 렌더링으로 고정.
  2. `lib/supabase/service.ts`
  - 서비스 클라이언트의 `global.fetch`를 `cache: "no-store"` + `next.revalidate = 0`으로 강제.
  - 서버 측 Supabase 조회가 항상 최신 DB 값을 읽도록 보강.
- 검증:
  - `npm run lint` 통과.
  - `npx tsc --noEmit` 통과.$ja_body$, ARRAY['ワークフロー', '管理者', 'Supabase', 'データベース', '認証', 'デプロイ']::text[]),
  ('배포_스크립트_추가', $ja_title$デプロイ 스크립트 追加$ja_title$, $ja_desc$デプロイ 스크립트 追加 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# デプロイ 스크립트 追加

## 概要
デプロイ 스크립트 追加 作業内容을 整理한 기록입니다.

## 主な更新
- 매번 수동으로 `npx vercel --prod --yes`를 입력하지 않도록 デプロイ 명령을 npm script로 통일.
- `package.json` scripts에 아래 항목 追加:
- `deploy`: `npx vercel --prod --yes`
- 프로덕션 デプロイ:
- `npm run deploy`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 배포 스크립트 추가

## 목적
- 매번 수동으로 `npx vercel --prod --yes`를 입력하지 않도록 배포 명령을 npm script로 통일.

## 변경 사항
- `package.json` scripts에 아래 항목 추가:
  - `deploy`: `npx vercel --prod --yes`

## 사용 방법
- 프로덕션 배포:
  - `npm run deploy`$ja_body$, ARRAY['ワークフロー', 'デプロイ', 'Vercel', 'モニタリング']::text[]),
  ('v2_네이밍_주석_다국어_조회_정비', $ja_title$v2 네이밍/주석/多言語 조회 정비$ja_title$, $ja_desc$v2 네이밍/주석/多言語 조회 정비 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# v2 네이밍/주석/多言語 조회 정비

## 概要
v2 네이밍/주석/多言語 조회 정비 作業内容을 整理한 기록입니다.

## 主な更新
- 実装 코드 핵심 함수 위주 한국어 주석 追加
- 타입 네이밍 整理
- `types/contacts.ts`, `types/about.ts`, `types/home-slide.ts`, `types/content-locale.ts`
- 管理者 API 경로 정식화
- `/api/admin/home-slide` 신설
- `/api/admin/highlights`는 호환 alias 유지
- 도메인 함수명 整理(호환 alias 포함)
- home: `*HomeSlide*`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# v2 네이밍/주석/다국어 조회 정비

## 오늘 작업 요약
- 구현 코드 핵심 함수 위주 한국어 주석 추가
- 타입 네이밍 정리
  - `types/contacts.ts`, `types/about.ts`, `types/home-slide.ts`, `types/content-locale.ts`
- 관리자 API 경로 정식화
  - `/api/admin/home-slide` 신설
  - `/api/admin/highlights`는 호환 alias 유지
- 도메인 함수명 정리(호환 alias 포함)
  - home: `*HomeSlide*`
  - contact: `*Contact*`
  - about: `*About*`
- 공개 다국어 조회 1차 반영
  - 블로그: locale 번역 우선 + KO fallback
  - 프로젝트: locale 번역 우선 + KO fallback

## 품질 확인
- `npm run -s lint` 통과
- `npx tsc --noEmit` 통과

## 메모
- 기존 호출부 회귀 방지를 위해 구 네이밍 alias는 임시 유지
- 다음 단계에서 관리자 locale 탭 UI와 번역 저장 UX를 확장 예정$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'UI/UX', 'Vercel', 'モニタリング']::text[]),
  ('v2_1_로케일_테이블_전환_About_카테고리_탭_적용', $ja_title$v2.1 로케일 테이블 전환 + About 카테고리 탭 適用$ja_title$, $ja_desc$서버 저장소/조회 로직을 실제 코드에 반영했습니다.$ja_desc$, $ja_body$# v2.1 로케일 테이블 전환 + About 카테고리 탭 適用

## 概要
서버 저장소/조회 로직을 실제 코드에 반영했습니다.

## 主な更新
- v2.1 スキーマ 基準(`about locale row`, `about_tech_stack`, `posts_en/ja`, `projects_en/ja`)으로
- 管理者 About의 기술 항목을 카테고리 탭 기반으로 편집할 수 있게 확장했습니다.
- 公開 About 技術スタック 영역에 카테고리 탭을 追加하고, 항목 4개 초과 시 Swiper로 노출되도록 변경했습니다.
- `supabase/v2/schema-v2.1.0.sql`
- `is_admin_user()` 호환 함수 追加(`is_admin_email()` 래핑)
- `lib/profile/repository.ts`
- `about_translations` 의존 제거
- `about(locale row)` + `about_tech_stack` 조합 조회/저장으로 전환

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# v2.1 로케일 테이블 전환 + About 카테고리 탭 적용

## 작업 목적

- v2.1 스키마 기준(`about locale row`, `about_tech_stack`, `posts_en/ja`, `projects_en/ja`)으로
  서버 저장소/조회 로직을 실제 코드에 반영했습니다.
- 관리자 About의 기술 항목을 카테고리 탭 기반으로 편집할 수 있게 확장했습니다.
- 공개 About 기술 스택 영역에 카테고리 탭을 추가하고, 항목 4개 초과 시 Swiper로 노출되도록 변경했습니다.

## 주요 변경

1. DB 마이그레이션 보강
- `supabase/v2/schema-v2.1.0.sql`
  - `is_admin_user()` 호환 함수 추가(`is_admin_email()` 래핑)

2. 저장소 전환
- `lib/profile/repository.ts`
  - `about_translations` 의존 제거
  - `about(locale row)` + `about_tech_stack` 조합 조회/저장으로 전환
  - KO 원본 + EN/JA 번역 맵 구조 유지
- `lib/blog/repository.ts`
  - `posts_translations` 제거
  - `posts_en`, `posts_ja` 조회/업서트로 전환
- `lib/projects/repository.ts`
  - `projects_translations` 제거
  - `projects_en`, `projects_ja` 조회/업서트로 전환

3. 관리자 About 입력 확장
- `components/admin/about/about-manager.tsx`
  - 기술 항목에 `category` 필드 추가
  - 카테고리 탭(자동 생성) + 카테고리별 드래그 정렬 적용
  - 저장 payload에 category 포함

4. About API 파서 정합화
- `app/api/admin/about/route.ts`
  - KO/EN/JA 기술 항목 파싱 시 `category` 필드 검증/정규화 추가

5. 공개 About UI 개선
- `components/about/interactive-about-reveal.tsx`
  - 기술 스택 카테고리 탭 추가
  - 카테고리 항목 수가 4개 초과일 때 Swiper 렌더 적용

## 검증 결과

- `npm run -s lint` 통과(기존 unused warning 1건만 유지)
- `npx tsc --noEmit` 통과
- `npm run -s build` 통과$ja_body$, ARRAY['ワークフロー', '管理者', 'Supabase', 'データベース', 'UI/UX', 'モニタリング']::text[]),
  ('관리자_EN_JA_입력_확장_정비', $ja_title$管理者 EN/JA 입력 확장 정비$ja_title$, $ja_desc$管理者 EN/JA 입력 확장 정비 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 管理者 EN/JA 입력 확장 정비

## 概要
管理者 EN/JA 입력 확장 정비 作業内容을 整理한 기록입니다.

## 主な更新
- 管理者에서 KO 기본 콘텐츠 외에 EN/JA 입력을 직접 저장하고 재修正할 수 있도록 정비.
- v2 SQL 適用 중 발생한 `is_admin_user()` 함수 エラー를 スキーマ 基準에 맞게 整理.
- ブログ 管理者:
- EN/JA 번역 탭(제목, 설명, 태그, 본문) 입력/저장/재조회 흐름 연결.
- 폼 dirty 스냅샷 비교에 번역 데이터 포함.
- プロジェクト 管理者:
- EN/JA 번역 탭(제목, 부제목, 태그, プロジェクト 내용) 입력 UI 追加.
- 저장 payload에 `translations` 포함 및 편집 진입 시 번역 데이터 복원.

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 관리자 EN/JA 입력 확장 정비

## 작업 목적
- 관리자에서 KO 기본 콘텐츠 외에 EN/JA 입력을 직접 저장하고 재수정할 수 있도록 정비.
- v2 SQL 적용 중 발생한 `is_admin_user()` 함수 오류를 스키마 기준에 맞게 정리.

## 적용 내용
- 블로그 관리자:
  - EN/JA 번역 탭(제목, 설명, 태그, 본문) 입력/저장/재조회 흐름 연결.
  - 폼 dirty 스냅샷 비교에 번역 데이터 포함.
- 프로젝트 관리자:
  - EN/JA 번역 탭(제목, 부제목, 태그, 프로젝트 내용) 입력 UI 추가.
  - 저장 payload에 `translations` 포함 및 편집 진입 시 번역 데이터 복원.
- 소개 관리자:
  - EN/JA 번역 탭(이름, 직함, 소개) 입력 UI 추가.
  - 저장 payload에 번역 데이터 포함, 저장 후 재조회 데이터로 상태 동기화.
- API/리포지토리:
  - posts/projects/about 관리자 API에서 EN/JA 번역 파싱 및 upsert 연결.
  - 번역 테이블(`posts_translations`, `projects_translations`, `about_translations`) 저장 로직 사용.
- SQL:
  - `supabase/v2/schema-v2.0.0.sql`의 정책 함수 참조를 `public.is_admin_email()` 기준으로 정리.

## 검증 결과
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
- `npm run -s build` 통과 (외부 네트워크 허용 환경에서 확인)

## 비고
- 번역 데이터가 비어 있으면 공개 페이지는 KO 기본 콘텐츠로 fallback.
- 현재 About 번역의 기술 항목(`aboutTechItems`)은 폼에서 별도 편집하지 않고 기본값(`[]`) 저장 정책으로 유지.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', 'UI/UX']::text[]),
  ('관리자_KO_EN_JA_탭_입력_통일', $ja_title$管理者 KO/EN/JA 탭 입력 통일$ja_title$, $ja_desc$管理者 KO/EN/JA 탭 입력 통일 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 管理者 KO/EN/JA 탭 입력 통일

## 概要
管理者 KO/EN/JA 탭 입력 통일 作業内容을 整理한 기록입니다.

## 主な更新
- Blog / Projects / About 管理者 입력을 기존 섹션 내부에서 `KO | EN | JA` 탭 전환 방식으로 통일.
- KO는 기본 테이블, EN/JA는 번역 테이블 저장 정책 유지.
- About의 EN/JA 번역에서도 기술 항목(이름/설명/로고/순서) 편집 가능하도록 확장.
- 공통 로케일 탭 컴포넌트 追加:
- `components/admin/common/locale-tabs.tsx`
- 세 매니저가 동일한 탭 UI를 재사용하도록 整理.
- ブログ 管理者:
- 제목/설명/태그/본문 입력을 탭 전환으로 통합.

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 관리자 KO/EN/JA 탭 입력 통일

## 작업 목표
- Blog / Projects / About 관리자 입력을 기존 섹션 내부에서 `KO | EN | JA` 탭 전환 방식으로 통일.
- KO는 기본 테이블, EN/JA는 번역 테이블 저장 정책 유지.
- About의 EN/JA 번역에서도 기술 항목(이름/설명/로고/순서) 편집 가능하도록 확장.

## 적용 내용
- 공통 로케일 탭 컴포넌트 추가:
  - `components/admin/common/locale-tabs.tsx`
  - 세 매니저가 동일한 탭 UI를 재사용하도록 정리.
- 블로그 관리자:
  - 제목/설명/태그/본문 입력을 탭 전환으로 통합.
  - 기존 EN/JA 별도 카드 제거.
- 프로젝트 관리자:
  - 제목/부제목/태그/프로젝트 내용을 탭 전환으로 통합.
  - 기존 EN/JA 별도 카드 제거.
  - KO 탭은 기존 `projects` 필드, EN/JA 탭은 `projects_translations` 필드로 저장.
- 소개 관리자:
  - 이름/직함/요약 + 기술 항목 리스트를 탭 전환으로 통합.
  - EN/JA 번역에 기술 항목 저장(`about_translations.about_tech_items`) 반영.
  - 기술 항목 추가/수정/삭제/드래그 정렬을 KO/EN/JA 각각 독립 유지.

## 검증
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
- `npm run -s build` 통과

## 비고
- EN/JA 번역 미입력 시 공개 페이지는 기존 정책대로 KO 콘텐츠 fallback.
- Contact/Home 탭은 이번 범위에서 다국어 탭 입력 대상 제외.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'データベース', 'UI/UX', 'モニタリング']::text[]),
  ('도메인_별칭_불일치_원인_해결', $ja_title$도메인 별칭 불일치 원인 解決$ja_title$, $ja_desc$`j-fe-blog.vercel.app`에는 반영되지 않는 현상이 발생했다.$ja_desc$, $ja_body$# 도메인 별칭 불일치 원인 解決

## 概要
`j-fe-blog.vercel.app`에는 반영되지 않는 현상이 발생했다.

## 主な更新
- 동일 プロジェクト에서 최신 デプロイ URL(`j-blog-8y50...`)은 변경사항이 보이는데,
- `j-fe-blog.vercel.app` alias가 최신 デプロイ가 아니라 이전 デプロイ를 가리키고 있었다.
- 이전에 처음 デプロイ를 진행했던 도메인 `j-blog-two.vercel.app` alias가 current デプロイ를 가리키고 있었다는거다.
- 확인 결과:
- 이전 source: `j-blog-hq17ubm8j-...`
- 최신 source: `j-blog-8y50myy6u-...`
- 즉, 코드/DB 문제가 아니라 Vercel alias 포인터 불일치 문제였다.
- alias 재지정 실행:

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 도메인 별칭 불일치 원인 해결

## 증상

- 동일 프로젝트에서 최신 배포 URL(`j-blog-8y50...`)은 변경사항이 보이는데,
  `j-fe-blog.vercel.app`에는 반영되지 않는 현상이 발생했다.

## 원인

- `j-fe-blog.vercel.app` alias가 최신 배포가 아니라 이전 배포를 가리키고 있었다.
- 이전에 처음 배포를 진행했던 도메인 `j-blog-two.vercel.app` alias가 current 배포를 가리키고 있었다는거다.
- 확인 결과:
  - 이전 source: `j-blog-hq17ubm8j-...`
  - 최신 source: `j-blog-8y50myy6u-...`
- 즉, 코드/DB 문제가 아니라 Vercel alias 포인터 불일치 문제였다.

## 조치

- alias 재지정 실행:
  - `npx vercel alias set j-blog-8y50myy6u-wogml3270s-projects.vercel.app j-fe-blog.vercel.app`
- 재확인:
  - `npx vercel alias ls`에서 `j-fe-blog.vercel.app` source가 최신 배포로 변경됨.

## 추가 조치 (2026-04-14)

- develop 브랜치 푸시 시 Preview 배포가 계속 생성되는 문제를 코드 설정으로 제한하기 위해
  프로젝트 루트에 `vercel.json`을 추가했다.
- 적용 값:
  - `git.deploymentEnabled.main = true`
  - `git.deploymentEnabled.develop = false`
- 목적:
  - main 운영 배포는 유지
  - develop 자동 배포는 차단

## 참고

- 배포 URL 자체(`https://j-blog-...vercel.app`)가 401로 보일 수 있는데, 이는 배포 보호 설정 영향일 수 있다.
- 운영 확인은 실제 서비스 도메인(`j-fe-blog.vercel.app`) 기준으로 검증한다.$ja_body$, ARRAY['ワークフロー', 'データベース', 'デプロイ', 'Vercel', 'バグ修正', 'モニタリング']::text[]),
  ('어바웃_기술스택_카테고리_enum_전환', $ja_title$어바웃 기술스택 카테고리 enum 전환$ja_title$, $ja_desc$어바웃 기술스택 카테고리 enum 전환 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# 어바웃 기술스택 카테고리 enum 전환

## 概要
어바웃 기술스택 카테고리 enum 전환 作業内容을 整理한 기록입니다.

## 主な更新
- 기존 `about_tech_stack.category`를 자유 문자열로 저장하면서 카테고리 오탈자/중복(예: 프론트엔드, frontend, 프론트) 관리가 어려웠습니다.
- 카테고리 순서와 값이 고정되지 않아 UI 탭 렌더에서 일관성이 떨어졌고, 클라이언트 렌더 차이 가능성도 커졌습니다.
- 기술스택 카테고리를 고정 enum으로 정의했습니다.
- enum 값: `frontend`, `backend`, `database`, `infrastructure`, `version_control`, `other`
- 신규 유틸 追加: `lib/about/tech-categories.ts`
- 카테고리 순서 상수
- 로케일별 라벨 맵
- 레거시 문자열 -> enum 정규화 함수

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 어바웃 기술스택 카테고리 enum 전환

## 배경
- 기존 `about_tech_stack.category`를 자유 문자열로 저장하면서 카테고리 오탈자/중복(예: 프론트엔드, frontend, 프론트) 관리가 어려웠습니다.
- 카테고리 순서와 값이 고정되지 않아 UI 탭 렌더에서 일관성이 떨어졌고, 클라이언트 렌더 차이 가능성도 커졌습니다.

## 변경 내용
- 기술스택 카테고리를 고정 enum으로 정의했습니다.
- enum 값: `frontend`, `backend`, `database`, `infrastructure`, `version_control`, `other`
- 신규 유틸 추가: `lib/about/tech-categories.ts`
  - 카테고리 순서 상수
  - 로케일별 라벨 맵
  - 레거시 문자열 -> enum 정규화 함수
- 관리자 About UI를 자유입력에서 선택형으로 변경했습니다.
  - 항목 추가 카테고리 입력: `Input` -> `select`
  - 항목 수정 카테고리 입력: `Input` -> `select`
- 공개 About 탭도 고정 enum 순서 기반으로 렌더되도록 변경했습니다.

## DB 마이그레이션
- `supabase/v2/schema-v2.1.1.sql` 추가
  - `public.about_tech_category` enum 타입 생성
  - `about_tech_stack.category`를 enum으로 안전 전환
  - 기존 한글/영문 카테고리 값 매핑 로직 포함
  - 인덱스 재생성
  - `schema_migrations` 버전 기록 (`v2.1.1`)

## 검증
- `npm run -s lint` 통과 (기존 경고 1건 유지)
- `npx tsc --noEmit` 통과
- `npm run -s build` 통과

## 비고
- API/리포지토리에서도 카테고리를 정규화해 저장하므로, 구 데이터/외부 입력이 들어와도 enum 규칙으로 보정됩니다.$ja_body$, ARRAY['ワークフロー', '管理者', 'Supabase', 'データベース', 'UI/UX', 'モニタリング']::text[]),
  ('프로젝트_EN_JA_성과_기여_입력_확장', $ja_title$プロジェクト EN/JA 성과/기여 입력 확장$ja_title$, $ja_desc$1. プロジェクト 번역 타입 확장$ja_desc$, $ja_body$# プロジェクト EN/JA 성과/기여 입력 확장

## 概要
1. プロジェクト 번역 타입 확장

## 主な更新
- 管理者 プロジェクト 탭에서 KO뿐 아니라 EN/JA에서도 `성과`, `주요 기여`를 입력/정렬/저장할 수 있도록 확장.
- `types/projects.ts`
- `ProjectTranslationInput`에 아래 필드 追加
- `achievements: string[]`
- `contributions: string[]`
- `app/api/admin/projects/route.ts`
- `app/api/admin/projects/[id]/route.ts`
- `parseTranslations()`에서 EN/JA 번역 payload에 아래 배열 필드 파싱 追加

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 프로젝트 EN/JA 성과/기여 입력 확장

## 작업 목적
- 관리자 프로젝트 탭에서 KO뿐 아니라 EN/JA에서도 `성과`, `주요 기여`를 입력/정렬/저장할 수 있도록 확장.

## 변경 내용
1. 프로젝트 번역 타입 확장
- `types/projects.ts`
- `ProjectTranslationInput`에 아래 필드 추가
  - `achievements: string[]`
  - `contributions: string[]`

2. 관리자 API 번역 파서 확장
- `app/api/admin/projects/route.ts`
- `app/api/admin/projects/[id]/route.ts`
- `parseTranslations()`에서 EN/JA 번역 payload에 아래 배열 필드 파싱 추가
  - `achievements`
  - `contributions`

3. 프로젝트 저장소 번역 매핑/저장 확장
- `lib/projects/repository.ts`
- `projects_translations` 조회 select 필드에 `achievements`, `contributions` 추가
- `toProjectTranslationInput()`에 성과/기여 매핑 추가
- `applyProjectTranslation()`에서 locale별 성과/기여 우선 적용(fallback은 KO 원문)
- `upsertProjectTranslations()`에서 성과/기여 배열 저장 추가

4. 관리자 프로젝트 UI locale 탭 입력 확장
- `components/admin/projects/projects-manager.tsx`
- EN/JA 번역 상태에 성과/기여 리스트 + 입력값 상태 추가
- KO/EN/JA 공통으로 성과/기여 섹션이 동작하도록 locale-aware 핸들러 적용
  - 추가
  - 삭제
  - 드래그 정렬
- 저장 payload(`translations`)에 EN/JA 성과/기여 포함

5. DB 증분 마이그레이션 추가
- `supabase/v2/schema-v2.0.1.sql`
- `projects_translations` 테이블에 컬럼 추가
  - `achievements text[] not null default '{}'::text[]`
  - `contributions text[] not null default '{}'::text[]`
- `schema_migrations`에 `v2.0.1` 기록

## 적용 순서
1. Supabase SQL Editor에서 `supabase/v2/schema-v2.0.1.sql` 실행
2. 관리자 `/admin/projects`에서 EN/JA 탭으로 성과/기여 입력 및 저장 확인
3. 공개 프로젝트 페이지 locale 전환 시 성과/기여 번역 반영 확인$ja_body$, ARRAY['ワークフロー', '管理者', 'Supabase', 'データベース', 'UI/UX', 'モニタリング']::text[]),
  ('sitemap_prerender_동적_충돌_해결', $ja_title$sitemap prerender 동적 충돌 解決$ja_title$, $ja_desc$1. 정적 라우트 생성$ja_desc$, $ja_body$# sitemap prerender 동적 충돌 解決

## 概要
1. 정적 라우트 생성

## 主な更新
- `/sitemap.xml` prerender 중 `Dynamic server usage` エラー 발생
- 원인 fetch: Supabase REST 요청이 `revalidate: 0`/`no-store`로 실행되어 정적 렌더링과 충돌
- `app/sitemap.ts`가 `getAllPublishedProjects`, `getAllPublishedPosts`를 호출
- 해당 저장소 함수 내부는 `createSupabaseServiceClient()`를 사용
- 이 클라이언트는 전역 fetch를 `cache: no-store`, `next.revalidate: 0`으로 고정
- 결과적으로 sitemap 정적 생성 단계에서 동적 사용 에러가 발생
- `app/sitemap.ts`에서 저장소 함수 호출 제거
- sitemap 전용 Supabase 클라이언트 追加:

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

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
- 1시간 단위 재검증으로 최신성 확보$ja_body$, ARRAY['ワークフロー', 'Supabase', 'データベース', 'SEO', 'パフォーマンス', 'バグ修正']::text[]),
  ('Vercel_별칭_자동_최신화_파이프라인_고정', $ja_title$Vercel 별칭 자동 최신화 파이프라인 고정$ja_title$, $ja_desc$모두 동일 최신 デプロイ를 가리키도록 복구됨$ja_desc$, $ja_body$# Vercel 별칭 자동 최신화 파이프라인 고정

## 概要
모두 동일 최신 デプロイ를 가리키도록 복구됨

## 主な更新
- `main` デプロイ가 성공해도 `j-fe-blog.vercel.app`이 최신 デプロイ를 가리키지 않음
- 결과적으로 일부 URL은 최신 코드, `j-fe-blog`는 구버전/오래된 デプロイ를 보여주는 현상 발생
- `j-fe-blog.vercel.app`이 プロジェクト 고정 도메인으로 붙은 状態가 아니라 デプロイ 단위 alias로 연결되어 있었음
- デプロイ가 새로 생길 때 alias가 자동 이동되지 않아 URL 불일치가 발생함
- 최신 デプロイ로 alias 재지정
- 확인 결과:
- `j-fe-blog.vercel.app`
- `j-blog-wogml3270s-projects.vercel.app`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

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
- `npx vercel alias ls`에서 `j-fe-blog.vercel.app`이 최신 배포 source로 연결된 것을 확인$ja_body$, ARRAY['ワークフロー', 'デプロイ', 'Vercel', 'モニタリング']::text[]),
  ('문서_기반_블로그_실데이터_리시드_v2_1_3', $ja_title$문서 기반 ブログ 실데이터 리시드 (v2.1.3)$ja_title$, $ja_desc$긴 마크다운/개행/특수문자에서도 SQL Editor 붙여넣기 안정성을 높임.$ja_desc$, $ja_body$# 문서 기반 ブログ 실데이터 리시드 (v2.1.3)

## 概要
긴 마크다운/개행/특수문자에서도 SQL Editor 붙여넣기 안정성을 높임.

## 主な更新
- `docs/worklogs`, `docs/refector`의 마크다운을 ブログ 실데이터로 일괄 전환
- 기존 더미 ブログ 데이터(`posts`, `posts_en`, `posts_ja`, 태그 매핑) 전체 교체
- Supabase SQL Editor에 바로 붙여넣어 실행 가능한 단일 SQL 산출
- 생성 스크립트 追加:
- `scripts/generate-docs-blog-reseed-sql.mjs`
- 실행 스크립트 追加:
- `package.json` -> `npm run generate:docs-blog-sql`
- 산출 SQL 생성:

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 문서 기반 블로그 실데이터 리시드 (v2.1.3)

## 작업 목적
- `docs/worklogs`, `docs/refector`의 마크다운을 블로그 실데이터로 일괄 전환
- 기존 더미 블로그 데이터(`posts`, `posts_en`, `posts_ja`, 태그 매핑) 전체 교체
- Supabase SQL Editor에 바로 붙여넣어 실행 가능한 단일 SQL 산출

## 반영 내용
- 생성 스크립트 추가:
  - `scripts/generate-docs-blog-reseed-sql.mjs`
- 실행 스크립트 추가:
  - `package.json` -> `npm run generate:docs-blog-sql`
- 산출 SQL 생성:
  - `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`

## 생성 규칙
- 소스 파일: `docs/worklogs/**/*.md`, `docs/refector/**/*.md`
- 제목: 첫 `#` 헤더 우선, 없으면 파일명
- 슬러그: `YYYY_MM_DD_파일명정규화` (중복 시 suffix)
- 설명: 본문 첫 의미 문단 요약
- 태그: `worklog|refactor`, 날짜 태그, 파일명 토큰
- 상태: 전부 `published`, `featured=false`, 썸네일 기본값 사용

## SQL 구성
- 트랜잭션(`begin/commit`) 단위
- 삭제 순서:
  - `post_tag_map` -> `posts_en` -> `posts_ja` -> `posts` -> `post_tags`
- 재삽입:
  - `posts`
  - `post_tags` upsert
  - `post_tag_map` 재생성
  - `posts_en`, `posts_ja` upsert
- 마이그레이션 기록:
  - `schema_migrations`에 `v2.1.3` insert (중복 방지)

## 안전성 보강
- 본문/제목/설명은 달러쿼트(`$tag$...$tag$`) 방식으로 출력해
  긴 마크다운/개행/특수문자에서도 SQL Editor 붙여넣기 안정성을 높임.

## 실행 방법
```bash
npm run generate:docs-blog-sql
```
- 생성 파일: `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`
- Supabase SQL Editor에서 전체 실행

## 검증 체크리스트
- `posts` 건수와 문서 파일 수 일치
- `posts_en`, `posts_ja`가 `posts`와 1:1 매핑
- 블로그 목록/상세/언어 전환 정상
- 검색(`q`) 동작 정상$ja_body$, ARRAY['ワークフロー', 'リファクタリング', 'Supabase', 'データベース', 'バグ修正', 'モニタリング']::text[]),
  ('블로그_DB_장애_안내_전환', $ja_title$ブログ DB 장애 안내 전환$ja_title$, $ja_desc$ブログ DB 장애 안내 전환 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# ブログ DB 장애 안내 전환

## 概要
ブログ DB 장애 안내 전환 作業内容을 整理한 기록입니다.

## 主な更新
- ブログ 데이터 소스에서 MDX fallback을 제거하고, DB 장애 시 사용자에게 명시적으로 안내하도록 전환.
- `lib/blog/repository.ts`
- `lib/blog/registry` 기반 fallback 로직 제거
- `BlogServiceUnavailableError` 追加
- Supabase 서비스 미구성/조회 실패 시 즉시 장애 에러 throw
- `app/[lang]/(site)/blog/error.tsx`
- ブログ 세그먼트 전용 에러 UI 追加
- KO/EN/JA 메시지 + 재시도 버튼 제공

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 블로그 DB 장애 안내 전환

## 변경 목적
- 블로그 데이터 소스에서 MDX fallback을 제거하고, DB 장애 시 사용자에게 명시적으로 안내하도록 전환.

## 적용 내용
- `lib/blog/repository.ts`
  - `lib/blog/registry` 기반 fallback 로직 제거
  - `BlogServiceUnavailableError` 추가
  - Supabase 서비스 미구성/조회 실패 시 즉시 장애 에러 throw
- `app/[lang]/(site)/blog/error.tsx`
  - 블로그 세그먼트 전용 에러 UI 추가
  - KO/EN/JA 메시지 + 재시도 버튼 제공
- `app/[lang]/(site)/blog/[slug]/page.tsx`
  - 상세 메타 생성에서 DB 오류 시 기본 메타로 fallback 처리
  - 본문 렌더를 DB markdown 단일 경로로 통일

## 검증
- `npm run -s lint` 통과(기존 경고 1건 유지)
- `npx tsc --noEmit` 통과$ja_body$, ARRAY['ワークフロー', 'Supabase', 'データベース', 'UI/UX', 'バグ修正', 'モニタリング']::text[]),
  ('블로그_리시드_품질_재구축_v2_1_3', $ja_title$ブログ 리시드 품질 재구축 (v2.1.3)$ja_title$, $ja_desc$node scripts/generate-docs-blog-reseed-sql.mjs --bootstrap-translations$ja_desc$, $ja_body$# ブログ 리시드 품질 재구축 (v2.1.3)

## 概要
node scripts/generate-docs-blog-reseed-sql.mjs --bootstrap-translations

## 主な更新
- docs 기반 ブログ 리시드 데이터의 품질 문제(슬러그/태그/EN·JA 번역)를 전면 改善
- SQL 생성 전 検証 단계에서 누락/품질 이슈를 즉시 차단
- 파일: `scripts/generate-docs-blog-reseed-sql.mjs`
- 2단계로 분리:
- docs 파싱(제목/설명/본문/날짜)
- 품질 보정/検証(슬러그/태그/번역)
- SQL 출력 파일 유지:
- `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 블로그 리시드 품질 재구축 (v2.1.3)

## 목적
- docs 기반 블로그 리시드 데이터의 품질 문제(슬러그/태그/EN·JA 번역)를 전면 개선
- SQL 생성 전 검증 단계에서 누락/품질 이슈를 즉시 차단

## 반영 내용

### 1) 생성 파이프라인 재설계
- 파일: `scripts/generate-docs-blog-reseed-sql.mjs`
- 2단계로 분리:
  - docs 파싱(제목/설명/본문/날짜)
  - 품질 보정/검증(슬러그/태그/번역)
- SQL 출력 파일 유지:
  - `supabase/v2/schema-v2.1.3-docs-blog-reseed.sql`

### 2) 슬러그 정책 변경
- 기존 `uXXXX` 형태 제거
- 관리자 규칙과 동일하게 제목 기반 `_` 포맷 사용
  - 공백/구분자 -> `_`
  - 한글/영문/숫자/`_` 허용
  - 중복 시 `_2`, `_3` suffix
- 날짜 prefix 제거

### 3) 태그 정책 변경
- 고정 택소노미 도입:
  - `i18n`, `seo`, `supabase`, `vercel`, `admin`, `ui-ux`, `animation`, `refactor`, `database`, `auth`, `deployment`, `performance`, `bugfix`, `monitoring`, `workflow`
- 포스트별 자동 선별 + 수동 오버라이드 병합
- 검증:
  - KO 태그 3~6개 강제
  - 택소노미 외 태그 허용 안 함

### 4) EN/JA 완전 번역 데이터 소스 도입
- 신규 파일:
  - `data/blog-seed-translations.en.json`
  - `data/blog-seed-translations.ja.json`
  - `data/blog-seed-tag-overrides.json`
- 번역 검증:
  - KO slug 기준 EN/JA 1:1 존재 필수
  - title/description/bodyMarkdown 필수
  - 본문 최소 길이 검증
  - KO 본문과 완전 동일한 번역 금지
  - locale별 태그 3~6개 및 허용 태그 검증

### 5) SQL 재생성 정책
- 블로그 관련 데이터 전체 교체 유지:
  - `post_tag_map -> posts_en -> posts_ja -> posts -> post_tags`
- `schema_migrations`는 `v2.1.3` 유지, description만 최신화 가능하도록 처리

## 실행 방법
- 번역 소스 초기 생성(부트스트랩):
```bash
node scripts/generate-docs-blog-reseed-sql.mjs --bootstrap-translations
```
- SQL 생성:
```bash
npm run generate:docs-blog-sql
```

## 검증 결과
- 생성 건수: 55 posts
- `uXXXX` 패턴 슬러그: 0건
- `npm run lint`: 통과(기존 warning 1건 유지)
- `npx tsc --noEmit`: 통과$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', '認証']::text[]),
  ('블로그_프로젝트_검색_공통화_스켈레톤_통일', $ja_title$ブログ/プロジェクト 検索 공통화 + 스켈레톤 통일$ja_title$, $ja_desc$1. 공통 検索 유틸 追加$ja_desc$, $ja_body$# ブログ/プロジェクト 検索 공통화 + 스켈레톤 통일

## 概要
1. 공통 検索 유틸 追加

## 主な更新
- ブログ/プロジェクト 목록 検索 기능을 동일한 UX/구조로 통일
- 検索 UI를 공통 컴포넌트로 분리
- ブログ/プロジェクト 로딩 스켈레톤을 동일한 공통 컴포넌트로 통일
- 파일: `lib/utils/content-search.ts`
- `normalizeContentSearchQuery`, `matchesContentSearchQuery` 追加
- title/description/tags 등 다중 필드 検索 로직을 공통 처리
- 파일: `components/ui/content-search-toolbar.tsx`
- URL 쿼리스트링 `q`를 단일 소스로 사용하는 検索/초기화 UI

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 블로그/프로젝트 검색 공통화 + 스켈레톤 통일

## 작업 요약
- 블로그/프로젝트 목록 검색 기능을 동일한 UX/구조로 통일
- 검색 UI를 공통 컴포넌트로 분리
- 블로그/프로젝트 로딩 스켈레톤을 동일한 공통 컴포넌트로 통일

## 구현 내용
1. 공통 검색 유틸 추가
- 파일: `lib/utils/content-search.ts`
- `normalizeContentSearchQuery`, `matchesContentSearchQuery` 추가
- title/description/tags 등 다중 필드 검색 로직을 공통 처리

2. 공통 검색 툴바 컴포넌트 추가
- 파일: `components/ui/content-search-toolbar.tsx`
- URL 쿼리스트링 `q`를 단일 소스로 사용하는 검색/초기화 UI
- 블로그/프로젝트 양쪽에서 동일 렌더링

3. 블로그 목록 검색 적용
- 파일: `app/[lang]/(site)/blog/page.tsx`
- `searchParams.q` 파싱 후 목록 필터링
- 검색 툴바 연결
- 결과 없음 UI 추가

4. 프로젝트 목록 검색 적용
- 파일: `app/[lang]/(site)/projects/page.tsx`
- `searchParams.q` 파싱 후 목록 필터링
- 검색 툴바 연결
- 결과 없음 UI 추가

5. 공통 스켈레톤 컴포넌트 추가/적용
- 추가: `components/ui/content-list-loading-skeleton.tsx`
- 변경:
  - `app/[lang]/(site)/blog/loading.tsx`
  - `app/[lang]/(site)/projects/loading.tsx`
- 두 페이지 모두 동일한 스켈레톤 구조 사용

6. i18n 키 확장
- 블로그/프로젝트 locale json에 검색 키 추가
  - `searchPlaceholder`
  - `searchButton`
  - `searchReset`
  - `searchNoResult`

## 검증
- `npm run -s lint`: 통과 (기존 warning 1건 유지)
- `npx tsc --noEmit`: 통과

## 메모
- 기존 `filterPlaceholder/filterButton` 키는 제거하고 검색 키로 대체
- 검색은 서버 목록 데이터를 기준으로 필드 매칭하는 방식으로 통일$ja_body$, ARRAY['ワークフロー', 'UI/UX', 'モニタリング', '多言語対応']::text[]),
  ('블로그_프로젝트_공개_페이지네이션_8개_적용', $ja_title$ブログ/プロジェクト 公開 ページネーション 8개 適用$ja_title$, $ja_desc$ブログ/プロジェクト 公開 ページネーション 8개 適用 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# ブログ/プロジェクト 公開 ページネーション 8개 適用

## 概要
ブログ/プロジェクト 公開 ページネーション 8개 適用 作業内容을 整理한 기록입니다.

## 主な更新
- 公開 `blog`, `projects` 목록의 기본 노출 개수를 8개로 고정
- 検索(`q`)과 ページネーション(`page`)을 함께 사용 가능한 구조로 整理
- 중복 実装을 줄이기 위해 공통 ページネーション 컴포넌트로 통일
- `lib/utils/pagination.ts`
- `PUBLIC_CONTENT_PAGE_SIZE = 8` 追加
- `normalizePublicPage` 追加
- `components/ui/content-search-toolbar.tsx`
- 検索/초기화 시 `page` 쿼리를 제거하도록 변경

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 블로그/프로젝트 공개 페이지네이션 8개 적용

## 목표
- 공개 `blog`, `projects` 목록의 기본 노출 개수를 8개로 고정
- 검색(`q`)과 페이지네이션(`page`)을 함께 사용 가능한 구조로 정리
- 중복 구현을 줄이기 위해 공통 페이지네이션 컴포넌트로 통일

## 변경 사항

### 1) 공개 페이지네이션 공통 기준 추가
- `lib/utils/pagination.ts`
  - `PUBLIC_CONTENT_PAGE_SIZE = 8` 추가
  - `normalizePublicPage` 추가

### 2) 검색 시 페이지 초기화
- `components/ui/content-search-toolbar.tsx`
  - 검색/초기화 시 `page` 쿼리를 제거하도록 변경
  - 검색어 변경 후 페이지가 꼬이지 않도록 1페이지 리셋

### 3) 공통 페이지네이션 컴포넌트 추가
- `components/ui/content-pagination.tsx` (신규)
  - 숫자형 페이지네이션(ellipsis 포함)
  - 기존 쿼리(`q`) 유지 + `page`만 갱신
  - `blog`, `projects`에서 공통 사용

### 4) 블로그 목록 페이지 반영
- `app/[lang]/(site)/blog/page.tsx`
  - 검색 결과를 8개 단위로 slice
  - `page` 쿼리 기반 현재 페이지 계산/클램핑
  - 하단에 공통 페이지네이션 렌더

### 5) 프로젝트 목록 페이지 반영
- `app/[lang]/(site)/projects/page.tsx`
  - 검색 결과를 8개 단위로 slice
  - `page` 쿼리 기반 현재 페이지 계산/클램핑
  - 하단에 공통 페이지네이션 렌더

### 6) i18n 텍스트 추가
- `locales/{ko,en,ja}/blog.json`
- `locales/{ko,en,ja}/projects.json`
  - `paginationPrevious`
  - `paginationNext`
  - `paginationSummary`

## 검증
- `npm run lint`: 통과(기존 경고 1건 유지)
- `npx tsc --noEmit`: 통과

## 비고
- 현재 구현은 검색 결과를 서버에서 모두 받아온 뒤 페이지 단위로 화면 분할합니다.
- 데이터가 더 커지면 다음 단계에서 서버 쿼리 레벨 페이지네이션으로 확장 가능합니다.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', 'UI/UX', 'モニタリング', '多言語対応']::text[]),
  ('프로젝트_DB_장애_안내_전환_및_MDX_제거', $ja_title$プロジェクト DB 장애 안내 전환 및 MDX 제거$ja_title$, $ja_desc$プロジェクト DB 장애 안내 전환 및 MDX 제거 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# プロジェクト DB 장애 안내 전환 및 MDX 제거

## 概要
プロジェクト DB 장애 안내 전환 및 MDX 제거 作業内容을 整理한 기록입니다.

## 主な更新
- プロジェクト 페이지도 ブログ와 동일하게 DB 장애 시 사용자 안내 화면을 노출하도록 통일
- 더 이상 사용하지 않는 MDX 파일/설정/의존성 제거
- プロジェクト 저장소 fallback 제거
- `lib/projects/repository.ts`
- `ProjectServiceUnavailableError` 追加
- `getAllPublishedProjects`, `getFeaturedProjects`, `getPublishedProjectBySlug`에서 DB 실패 시 예외 throw
- プロジェクト 라우트 에러 경계 追加
- `app/[lang]/(site)/projects/error.tsx` 신설

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 프로젝트 DB 장애 안내 전환 및 MDX 제거

## 작업 목적
- 프로젝트 페이지도 블로그와 동일하게 DB 장애 시 사용자 안내 화면을 노출하도록 통일
- 더 이상 사용하지 않는 MDX 파일/설정/의존성 제거

## 적용 내용
- 프로젝트 저장소 fallback 제거
  - `lib/projects/repository.ts`
  - `ProjectServiceUnavailableError` 추가
  - `getAllPublishedProjects`, `getFeaturedProjects`, `getPublishedProjectBySlug`에서 DB 실패 시 예외 throw
- 프로젝트 라우트 에러 경계 추가
  - `app/[lang]/(site)/projects/error.tsx` 신설
  - KO/EN/JA 문구 + 다시 시도 버튼 구성
- 프로젝트 상세 메타데이터 안정화
  - `app/[lang]/(site)/projects/[slug]/page.tsx`
  - `generateMetadata`에서 DB 오류 시 기본 메타로 fallback

- MDX 정리
  - 삭제: `lib/blog/registry.ts`
  - 삭제: `content/blog/*.mdx`
  - 삭제: `mdx-components.tsx`, `mdx.d.ts`
  - 변경: `next.config.ts`에서 `@next/mdx` 제거, `pageExtensions`에서 `mdx` 제거
  - 변경: `types/blog.ts`에서 MDX 전용 타입(`BlogRegistryItem`, `Component`) 제거
  - 변경: `scripts/seed-supabase.mjs`의 MDX 파일 파싱/시드 로직 제거

- 패키지 의존성 정리
  - 제거: `@mdx-js/loader`, `@mdx-js/react`, `@next/mdx`, `@types/mdx`
  - 반영 파일: `package.json`, `package-lock.json`

## 검증 결과
- `npm run -s lint`: 통과 (기존 warning 1건 유지)
- `npx tsc --noEmit`: 통과
- `npm run -s build`: 실패
  - 사유: 네트워크 제한 환경에서 Google Fonts DNS 조회 실패(`fonts.googleapis.com`)

## 메모
- 현재 코드 기준으로 MDX 런타임/빌드 경로 의존성은 제거됨
- 문서(README/과거 worklog)에 남아 있는 MDX 언급은 히스토리 설명 용도로만 남아 있음$ja_body$, ARRAY['ワークフロー', 'リファクタリング', 'Supabase', 'データベース', 'UI/UX', 'SEO']::text[]),
  ('리팩토링_2차_정리', $ja_title$リファクタリング 2차 整理$ja_title$, $ja_desc$1. `ManagerListRow` 파일 통합$ja_desc$, $ja_body$# リファクタリング 2차 整理

## 概要
1. `ManagerListRow` 파일 통합

## 主な更新
- 불필요하게 잘게 분리된 컴포넌트를 줄이고, 공통화는 유지하면서 유지보수 포인트를 축소한다.
- 기존: `components/admin/manager-list-row.tsx` 별도 파일
- 변경: `components/admin/manager-list.tsx` 내부로 `ManagerListRow`를 통합 export
- 효과: 管理者 리스트 관련 파일을 한 곳에서 확인 가능
- `app/admin/(protected)/blog/page.tsx`
- `app/admin/(protected)/projects/page.tsx`
- `app/admin/(protected)/contact/page.tsx`
- 위 3곳의 `id` 쿼리 파싱 중복 함수를 제거하고 `lib/utils/search-params.ts`의 `pickSingleQueryValue`로 통합

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업 일지 - 2026-04-08 (리팩토링 2차 정리)

## 목표

- 불필요하게 잘게 분리된 컴포넌트를 줄이고, 공통화는 유지하면서 유지보수 포인트를 축소한다.

## 변경 내용

1. `ManagerListRow` 파일 통합

- 기존: `components/admin/manager-list-row.tsx` 별도 파일
- 변경: `components/admin/manager-list.tsx` 내부로 `ManagerListRow`를 통합 export
- 효과: 관리자 리스트 관련 파일을 한 곳에서 확인 가능

2. 미세 중복 제거 (쿼리 파싱)

- `app/admin/(protected)/blog/page.tsx`
- `app/admin/(protected)/projects/page.tsx`
- `app/admin/(protected)/contact/page.tsx`
- 위 3곳의 `id` 쿼리 파싱 중복 함수를 제거하고 `lib/utils/search-params.ts`의 `pickSingleQueryValue`로 통합

3. 파일 삭제

- `components/admin/manager-list-row.tsx` 삭제

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 메모

- 현재 `components/` 기준으로 미사용 컴포넌트는 없음(참조 스캔 확인).
- 다음 단계는 “파일 수 감소”보다 “역할 경계 명확화(Manager 단위 상태/폼 로직 분리)”가 효율적일 가능성이 높음.$ja_body$, ARRAY['リファクタリング', '管理者', 'UI/UX', 'モニタリング']::text[]),
  ('유지보수성_공통_ui', $ja_title$유지보수성 공통 ui$ja_title$, $ja_desc$適用:$ja_desc$, $ja_body$# 유지보수성 공통 ui

## 概要
適用:

## 主な更新
- 기능 변경 없이 유지보수성 改善
- 핵심 로직 주석 정책 문서화
- 管理者/公開 UI의 중복 레이아웃 공통화
- 미사용 레거시 파일 整理
- 파일: `docs/refector/2026-04-08/리팩터링-주석-가이드.md`
- 한국어 基準의 핵심 로직 주석 대상과 작성 규칙을 정의
- `components/admin/manager-shell.tsx`
- `components/admin/manager-list.tsx`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 작업일지 (2026-04-08)

## 목표

- 기능 변경 없이 유지보수성 개선
- 핵심 로직 주석 정책 문서화
- 관리자/공개 UI의 중복 레이아웃 공통화
- 미사용 레거시 파일 정리

## 주요 작업

### 1) 주석 정책 문서 추가

- 파일: `docs/refector/2026-04-08/리팩터링-주석-가이드.md`
- 한국어 기준의 핵심 로직 주석 대상과 작성 규칙을 정의

### 2) 관리자 공통 UI 컴포넌트 추가

- `components/admin/manager-shell.tsx`
- `components/admin/manager-list.tsx`
- `components/admin/manager-list-row.tsx`
- `components/admin/status-radio-group.tsx`
- `components/ui/surface-card.tsx`

적용:

- `home-manager`, `about-manager`, `posts-manager`, `projects-manager`, `contact-manager`
- 상단 요약 헤더, 리스트 컨테이너, 리스트 행, 상태 라디오 UI를 공통 컴포넌트로 통합

### 3) 공개 페이지 공통 UI 컴포넌트 추가

- `components/ui/content-list-layout.tsx`
- `components/ui/media-card.tsx`

적용:

- `components/blog/card.tsx`
- `components/project/card.tsx`
- `app/[lang]/(site)/blog/page.tsx`
- `app/[lang]/(site)/projects/page.tsx`

### 4) 레거시 코드 정리

- 미사용 파일 삭제: `components/admin/profile-manager.tsx`

## 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 통과

## 비고

- MDX/Supabase 혼용 구조 및 API/DB 스키마는 변경하지 않음.$ja_body$, ARRAY['ワークフロー', 'リファクタリング', '管理者', 'Supabase', 'データベース', 'UI/UX']::text[]),
  ('리팩토링_주석_가이드', $ja_title$リファクタリング 주석 가이드$ja_title$, $ja_desc$リファクタリング 주석 가이드 作業内容을 整理한 기록입니다.$ja_desc$, $ja_body$# リファクタリング 주석 가이드

## 概要
リファクタリング 주석 가이드 作業内容을 整理한 기록입니다.

## 主な更新
- 実装 나열이 아니라 **의도/이유**를 빠르게 전달해 유지보수 시간을 줄입니다.
- `export` 함수
- 비동기 핸들러(`fetch`, mutation, 저장/削除)
- 파서/정규화 함수
- 状態 전환 로직(`dirty`, open/close, sync)
- 복합 조건 분기
- `useEffect` 부작용 블록
- 함수/블록 **바로 위 한 줄 `//`** 로 작성

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# 리팩토링 주석 가이드

## 목적

- 구현 나열이 아니라 **의도/이유**를 빠르게 전달해 유지보수 시간을 줄입니다.

## 적용 대상

- `export` 함수
- 비동기 핸들러(`fetch`, mutation, 저장/삭제)
- 파서/정규화 함수
- 상태 전환 로직(`dirty`, open/close, sync)
- 복합 조건 분기
- `useEffect` 부작용 블록

## 작성 규칙

- 함수/블록 **바로 위 한 줄 `//`** 로 작성
- 한국어로 작성
- “무엇을 한다”보다 “왜 이렇게 처리하는지”를 우선
- 한 함수에 주석 과다 작성 금지(핵심 분기만)

## 예시

- 좋은 예: `// 저장 직후 서버 정렬(updated_at)을 기준으로 목록을 다시 동기화한다.`
- 피해야 할 예: `// setState를 호출한다.`$ja_body$, ARRAY['リファクタリング', 'モニタリング', 'ワークフロー']::text[]),
  ('v2_네이밍_매핑_및_번역_규칙', $ja_title$v2 네이밍 매핑 및 번역 규칙$ja_title$, $ja_desc$`post_tag_map`은 게시글(`posts`)과 태그(`post_tags`)를 연결하는 다대다 매핑 테이블이다.$ja_desc$, $ja_body$# v2 네이밍 매핑 및 번역 규칙

## 概要
`post_tag_map`은 게시글(`posts`)과 태그(`post_tags`)를 연결하는 다대다 매핑 테이블이다.

## 主な更新
- `admin_allowlist` -> 유지
- `comments` -> 유지
- `contact_messages` -> `contacts`
- `home_highlights` -> `home_slide`
- `post_tag_map` -> 유지
- `post_tags` -> 유지
- `posts` -> 유지
- `profile_content` -> `about`

## 補足
このローカライズ版は、元の技術的意図と構成を維持しています。

---

## 韓国語の原文

# v2 네이밍 매핑 및 번역 규칙

## 1) 테이블 네이밍 매핑
- `admin_allowlist` -> 유지
- `comments` -> 유지
- `contact_messages` -> `contacts`
- `home_highlights` -> `home_slide`
- `post_tag_map` -> 유지
- `post_tags` -> 유지
- `posts` -> 유지
- `profile_content` -> `about`
- `projects` -> 유지

## 2) `post_tag_map` 역할
`post_tag_map`은 게시글(`posts`)과 태그(`post_tags`)를 연결하는 다대다 매핑 테이블이다.
- 게시글 하나에 여러 태그를 붙일 수 있고
- 같은 태그를 여러 게시글에서 재사용할 수 있도록 정규화한다.

## 3) 번역 테이블 규칙
- `posts_translations(post_id, locale, title, description, body_markdown, tags)`
- `projects_translations(project_id, locale, title, subtitle, content_markdown, tags)`
- `about_translations(about_id, locale, name, title, summary, about_tech_items)`

공통 규칙:
- `locale`은 `ko | en | ja`
- `(parent_id, locale)` unique
- 발행 제어는 기본 테이블(`posts`, `projects`)의 `status`만 사용
- 번역 누락 시 KO 원문 fallback

## 4) 공개 조회 우선순위
1. 현재 locale 번역 데이터
2. KO 기본 데이터 fallback

## 5) 관리자 코드 네이밍 원칙
- `Highlight` -> `HomeSlide`
- `ProfileContent` -> `About`
- `ContactMessage` -> `Contact`

기존 이름은 회귀 방지를 위해 alias를 한 버전 유지하고, 신규 코드는 새 이름을 사용한다.$ja_body$, ARRAY['リファクタリング', '管理者', 'データベース', 'Vercel', 'モニタリング', '多言語対応']::text[])
) as src(slug, title, description, body_markdown, tags)
  on src.slug = p.slug
on conflict (post_id) do update
set
  title = excluded.title,
  description = excluded.description,
  body_markdown = excluded.body_markdown,
  tags = excluded.tags,
  updated_at = timezone('utc', now());

insert into public.schema_migrations (version, description)
values ('v2.1.3', 'docs 기반 블로그 품질 재시드(slug/tag/EN/JA full translation)')
on conflict (version) do update
set description = excluded.description;

commit;
