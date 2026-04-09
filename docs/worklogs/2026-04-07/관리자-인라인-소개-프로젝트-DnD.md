# 작업일지 - 2026-04-07 (Admin 인라인 편집 + About KO DB + Projects DnD)

## 1) About 소개 문구 DB 전환 (KO 전용)

- `profile_content.about_intro_description_ko` 컬럼 기준으로 KO 소개 문구를 DB에서 관리하도록 반영.
- 공개 About 페이지는 `ko`에서 DB 문구 우선, 비어 있으면 locale 문구 fallback.
- `en/ja`는 기존 locale JSON 문구를 그대로 유지.
- 관리자 About API(`PUT /api/admin/about`)에 `introDescription` 필드 추가.

## 2) Home/About 편집 UX 인라인 전환

- Home 관리에서 드로어 편집을 제거하고, 페이지 본문에서 즉시 편집/저장하도록 변경.
- About 관리도 동일하게 인라인 편집으로 전환.
- 공통 UX 보강:
  - Dirty state 표시(변경 사항 있음/저장된 상태)
  - 저장 중 버튼 비활성화
  - 성공/실패 메시지 표시

## 3) 상태 라벨/입력 방식 정리

- 관리자 화면 상태 라벨을 `공개 / 비공개`로 통일 (`draft` 내부값은 유지).
- 대시보드 요약/최근 항목의 상태 텍스트도 동일 라벨로 교체.
- Posts/Projects/About 편집 폼 상태 선택을 select에서 라디오 버튼으로 변경.

## 4) Projects 입력 모델 개편 + DnD

- `성과`, `주요 기여`를 줄바꿈 텍스트에서 아이템 입력/삭제/드래그 재정렬 방식으로 전환.
- `관련 링크`를 고정 3종에서 동적 목록(`label + url`) 추가/삭제/드래그 재정렬 방식으로 전환.
- 저장 시 링크는 배열 형태로 정규화해 저장.
- 레거시 링크 객체(`live/repo/detail`)는 API/리포지토리에서 읽기 호환 유지.

## 5) 인터랙션/접근성

- 관리자 편집 패널 및 About 공개 섹션에 강한 모션/호버 인터랙션 적용.
- `prefers-reduced-motion` 환경에서 `.ui-strong-motion` 범위의 transition/animation 시간을 축소.

## 6) 스키마/문서

- 신규 증분 마이그레이션 파일 추가:
  - `supabase/schema-v1.0.2.sql`
  - 내용: `about_intro_description_ko` 추가/백필 + `schema_migrations` 기록
- README의 스키마 적용 순서를 `v1.0.0 -> v1.0.1 -> v1.0.2`로 갱신.
