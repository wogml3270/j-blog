# 소개 문구 교체 + About 아이콘 렌더링 수정

## 변경 요약
- 사이트 대표 설명 문구를 연차 의존 표현에서 고정 브랜딩 문구로 교체.
- About 기술스택 아이콘 렌더에서 `400 Bad Request`가 발생하던 경로를 제거.
- 공개 페이지 컴포넌트의 일부 `<img>`를 `next/image`로 전환.

## 적용 상세
1. 사이트 문구 교체
- `lib/site/profile.ts`
  - KO: `클릭은 가볍게, 경험은 선명하게 만드는 프론트엔드 포트폴리오`
  - EN/JA도 동일 의미로 자연 번역 적용
- `locales/ko|en|ja/main.json` 홈 설명 문구 동기화

2. About 기술스택 아이콘 400 오류 수정
- 원인: 일부 외부 도메인(Cafe24/가비아 등) 아이콘 URL이 프록시 정책과 충돌하여 400 발생
- 조치:
  - `components/about/interactive-about-reveal.tsx`
  - 로고 렌더를 `Image`로 통일
  - URL 정규화 함수(`http -> https`) 적용
  - 프록시 경유 로직 제거

3. 공개 댓글 프로필 이미지 전환
- `components/comments/shared-comments-section.tsx`
  - 사용자/댓글 아바타 `<img>` -> `Image` 전환

4. 정리
- 더 이상 쓰지 않는 파일 제거
  - `app/api/media-cache/route.ts`
  - `lib/utils/media-cache-url.ts`

## 검증
- `npm run -s build` 통과
- `npx tsc --noEmit` 통과
