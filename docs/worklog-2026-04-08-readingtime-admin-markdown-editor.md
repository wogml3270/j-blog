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
- `@toast-ui/react-editor`는 React 19 peer dependency 충돌로 채택하지 않았고, 동일한 Toast UI의 vanilla 패키지(`@toast-ui/editor`)로 구현함.
