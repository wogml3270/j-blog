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
- 업로드 선택 즉시 미리보기 및 URL 반영이 되는지.
