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
- 문서(README/과거 worklog)에 남아 있는 MDX 언급은 히스토리 설명 용도로만 남아 있음
