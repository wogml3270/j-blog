# 관리자 EN/JA 입력 확장 정비

## 작업 목적
- 관리자에서 KO 기본 콘텐츠 외에 EN/JA 입력을 직접 저장하고 재수정할 수 있도록 정비.
- v2 SQL 적용 중 발생한 `is_admin_user()` 함수 오류를 스키마 기준에 맞게 정리.

## 적용 내용
- 블로그 관리자:
  - EN/JA 번역 탭(제목, 설명, 태그, 본문) 입력/저장/재조회 흐름 연결.
  - 폼 dirty 스냅샷 비교에 번역 데이터 포함.
- 프로젝트 관리자:
  - EN/JA 번역 탭(제목, 부제목, 태그, 프로젝트 내용) 입력 UI 추가.
  - 저장 payload에 `translations` 포함 및 편집 진입 시 번역 데이터 복원.
- 소개 관리자:
  - EN/JA 번역 탭(이름, 직함, 소개) 입력 UI 추가.
  - 저장 payload에 번역 데이터 포함, 저장 후 재조회 데이터로 상태 동기화.
- API/리포지토리:
  - posts/projects/about 관리자 API에서 EN/JA 번역 파싱 및 upsert 연결.
  - 번역 테이블(`posts_translations`, `projects_translations`, `about_translations`) 저장 로직 사용.
- SQL:
  - `supabase/v2/schema-v2.0.0.sql`의 정책 함수 참조를 `public.is_admin_email()` 기준으로 정리.

## 검증 결과
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
- `npm run -s build` 통과 (외부 네트워크 허용 환경에서 확인)

## 비고
- 번역 데이터가 비어 있으면 공개 페이지는 KO 기본 콘텐츠로 fallback.
- 현재 About 번역의 기술 항목(`aboutTechItems`)은 폼에서 별도 편집하지 않고 기본값(`[]`) 저장 정책으로 유지.
