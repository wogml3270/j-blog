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
- `npx tsc --noEmit`: 통과
