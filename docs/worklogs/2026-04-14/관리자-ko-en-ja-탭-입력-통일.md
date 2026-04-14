# 관리자 KO/EN/JA 탭 입력 통일

## 작업 목표
- Blog / Projects / About 관리자 입력을 기존 섹션 내부에서 `KO | EN | JA` 탭 전환 방식으로 통일.
- KO는 기본 테이블, EN/JA는 번역 테이블 저장 정책 유지.
- About의 EN/JA 번역에서도 기술 항목(이름/설명/로고/순서) 편집 가능하도록 확장.

## 적용 내용
- 공통 로케일 탭 컴포넌트 추가:
  - `components/admin/common/locale-tabs.tsx`
  - 세 매니저가 동일한 탭 UI를 재사용하도록 정리.
- 블로그 관리자:
  - 제목/설명/태그/본문 입력을 탭 전환으로 통합.
  - 기존 EN/JA 별도 카드 제거.
- 프로젝트 관리자:
  - 제목/부제목/태그/프로젝트 내용을 탭 전환으로 통합.
  - 기존 EN/JA 별도 카드 제거.
  - KO 탭은 기존 `projects` 필드, EN/JA 탭은 `projects_translations` 필드로 저장.
- 소개 관리자:
  - 이름/직함/요약 + 기술 항목 리스트를 탭 전환으로 통합.
  - EN/JA 번역에 기술 항목 저장(`about_translations.about_tech_items`) 반영.
  - 기술 항목 추가/수정/삭제/드래그 정렬을 KO/EN/JA 각각 독립 유지.

## 검증
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
- `npm run -s build` 통과

## 비고
- EN/JA 번역 미입력 시 공개 페이지는 기존 정책대로 KO 콘텐츠 fallback.
- Contact/Home 탭은 이번 범위에서 다국어 탭 입력 대상 제외.
