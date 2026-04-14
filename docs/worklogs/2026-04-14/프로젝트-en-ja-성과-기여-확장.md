# 프로젝트 EN/JA 성과/기여 입력 확장

## 작업 목적
- 관리자 프로젝트 탭에서 KO뿐 아니라 EN/JA에서도 `성과`, `주요 기여`를 입력/정렬/저장할 수 있도록 확장.

## 변경 내용
1. 프로젝트 번역 타입 확장
- `types/projects.ts`
- `ProjectTranslationInput`에 아래 필드 추가
  - `achievements: string[]`
  - `contributions: string[]`

2. 관리자 API 번역 파서 확장
- `app/api/admin/projects/route.ts`
- `app/api/admin/projects/[id]/route.ts`
- `parseTranslations()`에서 EN/JA 번역 payload에 아래 배열 필드 파싱 추가
  - `achievements`
  - `contributions`

3. 프로젝트 저장소 번역 매핑/저장 확장
- `lib/projects/repository.ts`
- `projects_translations` 조회 select 필드에 `achievements`, `contributions` 추가
- `toProjectTranslationInput()`에 성과/기여 매핑 추가
- `applyProjectTranslation()`에서 locale별 성과/기여 우선 적용(fallback은 KO 원문)
- `upsertProjectTranslations()`에서 성과/기여 배열 저장 추가

4. 관리자 프로젝트 UI locale 탭 입력 확장
- `components/admin/projects/projects-manager.tsx`
- EN/JA 번역 상태에 성과/기여 리스트 + 입력값 상태 추가
- KO/EN/JA 공통으로 성과/기여 섹션이 동작하도록 locale-aware 핸들러 적용
  - 추가
  - 삭제
  - 드래그 정렬
- 저장 payload(`translations`)에 EN/JA 성과/기여 포함

5. DB 증분 마이그레이션 추가
- `supabase/v2/schema-v2.0.1.sql`
- `projects_translations` 테이블에 컬럼 추가
  - `achievements text[] not null default '{}'::text[]`
  - `contributions text[] not null default '{}'::text[]`
- `schema_migrations`에 `v2.0.1` 기록

## 적용 순서
1. Supabase SQL Editor에서 `supabase/v2/schema-v2.0.1.sql` 실행
2. 관리자 `/admin/projects`에서 EN/JA 탭으로 성과/기여 입력 및 저장 확인
3. 공개 프로젝트 페이지 locale 전환 시 성과/기여 번역 반영 확인
