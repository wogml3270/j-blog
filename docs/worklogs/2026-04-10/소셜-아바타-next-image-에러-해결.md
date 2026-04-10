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
- `next.config.ts`
