# 어바웃 기술스택 카테고리 enum 전환

## 배경
- 기존 `about_tech_stack.category`를 자유 문자열로 저장하면서 카테고리 오탈자/중복(예: 프론트엔드, frontend, 프론트) 관리가 어려웠습니다.
- 카테고리 순서와 값이 고정되지 않아 UI 탭 렌더에서 일관성이 떨어졌고, 클라이언트 렌더 차이 가능성도 커졌습니다.

## 변경 내용
- 기술스택 카테고리를 고정 enum으로 정의했습니다.
- enum 값: `frontend`, `backend`, `database`, `infrastructure`, `version_control`, `other`
- 신규 유틸 추가: `lib/about/tech-categories.ts`
  - 카테고리 순서 상수
  - 로케일별 라벨 맵
  - 레거시 문자열 -> enum 정규화 함수
- 관리자 About UI를 자유입력에서 선택형으로 변경했습니다.
  - 항목 추가 카테고리 입력: `Input` -> `select`
  - 항목 수정 카테고리 입력: `Input` -> `select`
- 공개 About 탭도 고정 enum 순서 기반으로 렌더되도록 변경했습니다.

## DB 마이그레이션
- `supabase/v2/schema-v2.1.1.sql` 추가
  - `public.about_tech_category` enum 타입 생성
  - `about_tech_stack.category`를 enum으로 안전 전환
  - 기존 한글/영문 카테고리 값 매핑 로직 포함
  - 인덱스 재생성
  - `schema_migrations` 버전 기록 (`v2.1.1`)

## 검증
- `npm run -s lint` 통과 (기존 경고 1건 유지)
- `npx tsc --noEmit` 통과
- `npm run -s build` 통과

## 비고
- API/리포지토리에서도 카테고리를 정규화해 저장하므로, 구 데이터/외부 입력이 들어와도 enum 규칙으로 보정됩니다.
