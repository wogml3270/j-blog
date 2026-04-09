# 작업일지 - 2026-04-07 (대시보드 재구성 + 썸네일 업로드 2방식)

## 1) 관리자 대시보드 재구성

- `Quick Links` 섹션 제거.
- 대시보드 역할을 운영 관점으로 강화:
  - 핵심 지표 카드: 블로그/프로젝트/문의/소개 공개상태
  - 즉시 확인 항목: 신규 문의, 임시저장 블로그/프로젝트, 소개 임시저장 여부
  - 최근 변경 현황: 최근 블로그/프로젝트/문의 3건씩 요약

## 2) 프로젝트 썸네일 입력 2가지 방식 지원

- 관리자 프로젝트 편집 화면에 썸네일 입력 모드 추가:
  - 외부 링크 붙여넣기
  - PC 파일 업로드
- 파일 업로드 API 추가:
  - `POST /api/admin/projects/upload-thumbnail`
  - 관리자 권한 검증 후 Supabase Storage 업로드
  - 업로드 성공 시 공개 URL 반환 후 폼의 `thumbnail` 값에 자동 반영
- 업로드 제한:
  - 이미지 파일만 허용
  - 최대 5MB

## 3) Supabase 설정 보완

- `.env.example`에 썸네일 버킷 변수 추가:
  - `SUPABASE_PROJECT_THUMBNAIL_BUCKET=project-thumbnails`
- `supabase/schema-v1.0.0.sql`에 기본 버킷 생성 SQL 추가:
  - `project-thumbnails` (public)

## 4) 검증

- `npm run lint` 통과
- `npx tsc --noEmit` 통과
