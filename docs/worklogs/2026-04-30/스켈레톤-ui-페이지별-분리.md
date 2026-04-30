# 스켈레톤 UI 페이지별 분리

## 목적
- `components/admin/common`에 몰려 있던 스켈레톤 코드를 분리해서 페이지별로 찾기 쉽게 정리.
- 이후 개별 스타일 수정이 쉽도록 `loading.tsx`는 렌더 전용 래퍼로 단순화.

## 구조 변경
- 신규 디렉토리:
  - `components/ui/skeleton/admin`
  - `components/ui/skeleton/site`

### admin 분리 파일
- `components/ui/skeleton/admin/login-loading-skeleton.tsx`
- `components/ui/skeleton/admin/dashboard-loading-skeleton.tsx`
- `components/ui/skeleton/admin/list-manager-loading-skeleton.tsx`
- `components/ui/skeleton/admin/about-loading-skeleton.tsx`

### site 분리 파일
- `components/ui/skeleton/site/home-hero-loading-skeleton.tsx`
- `components/ui/skeleton/site/content-list-loading-skeleton.tsx`
- `components/ui/skeleton/site/about-loading-skeleton.tsx`
- `components/ui/skeleton/site/blog-detail-loading-skeleton.tsx`
- `components/ui/skeleton/site/project-detail-loading-skeleton.tsx`

## 라우트 연결 변경
- 모든 `app/**/loading.tsx`는 페이지별 스켈레톤 컴포넌트를 import 후 반환만 하도록 정리.

## 제거 파일
- `components/admin/common/protected-loading-skeleton.tsx`
- `components/home/immersive-hero-skeleton.tsx`
- `components/ui/content-list-loading-skeleton.tsx`
- `components/about/interactive-about-loading-skeleton.tsx`

## 검증
- `npx tsc --noEmit` 통과
- `npm run lint` 통과
