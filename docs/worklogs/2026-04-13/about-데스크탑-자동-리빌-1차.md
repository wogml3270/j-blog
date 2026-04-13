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
- `npx eslint components/about/interactive-about-reveal.tsx` 통과
