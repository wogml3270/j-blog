# 관리자 `<img>` 일괄 `Image` 전환

## 변경 목적
- 관리자 영역에 남아 있던 `<img>` 태그를 `next/image`로 통일해 렌더링 정책을 일관화했습니다.
- 업로드 직후 `blob:` 미리보기 URL이 깨지지 않도록 `unoptimized` 분기 처리를 추가했습니다.

## 변경 파일
- `components/admin/about/about-manager.tsx`
- `components/admin/blog/blog-manager.tsx`
- `components/admin/projects/projects-manager.tsx`
- `components/admin/home/home-manager.tsx`
- `components/admin/common/sidebar.tsx`
- `components/admin/settings/sections/admin-members-section.tsx`

## 구현 내용
- 목록 썸네일, 프로필 아바타, 업로드 미리보기 이미지를 `Image`로 변환.
- `blob:` URL 미리보기는 `isBlobUrl` 유틸로 감지해 `unoptimized` 적용.
- 비어 있는 로고 URL은 `Image` 렌더 대신 플레이스홀더 요소를 노출하도록 보강.

## 검증
- `npx tsc --noEmit`
- `npm run -s build`
- `npm run -s lint`

모두 통과.
