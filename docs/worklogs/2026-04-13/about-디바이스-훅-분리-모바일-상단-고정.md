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
- 두 검증 모두 통과
