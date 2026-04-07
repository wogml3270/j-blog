# 작업일지 - 2026-04-07 (Dashboard canonical + Blog 썸네일 + Home Swiper)

## 1) 관리자 대시보드 경로/UX 개편
- 신규 canonical 경로: `/admin/dashboard`
- `/admin`은 `/admin/dashboard`로 리다이렉트 처리.
- 사이드바 대시보드 탭/로고 이동 경로를 `/admin/dashboard`로 통일.
- 대시보드 카드와 최근 항목을 링크 중심으로 개편:
  - KPI 카드 전체 클릭 가능
  - 최근 블로그/프로젝트/문의 행 전체 클릭 가능
  - 섹션별 바로가기 링크 추가
- 딥링크 지원:
  - `/admin/blog?id=...`
  - `/admin/projects?id=...`
  - `/admin/contact?id=...`
  - 각 매니저 진입 시 해당 항목 패널 자동 오픈

## 2) 프로젝트 관리 입력 UX 개선
- 기술 스택 입력을 `Enter 추가 + X 삭제` 태그형으로 변경.
- 기간 입력을 `startDate`, `endDate`(date input) 방식으로 변경.
- 데이터 모델 확장:
  - `projects.start_date date`
  - `projects.end_date date`
- `period` 컬럼은 호환 유지:
  - 저장 시 start/end 기반으로 period 동기화 문자열 생성
  - 공개 렌더는 start/end 우선, 없으면 기존 period fallback

## 3) 블로그 썸네일 optional 도입
- 스키마 확장:
  - `posts.thumbnail text` (nullable)
- 타입/리포지토리/API 반영:
  - `AdminPost`, `BlogPostSummary/Detail`에 thumbnail optional
  - 관리자 저장/수정 API에 thumbnail 필드 반영
- 관리자 블로그 편집:
  - 외부 URL 입력
  - 파일 업로드(선택)

## 4) 업로드 경로 공통화
- 공통 업로드 API 추가:
  - `POST /api/admin/media/upload`
  - scope(`posts`/`projects`) 기반 경로 분기
- 기존 프로젝트 업로드 경로는 호환 유지:
  - `POST /api/admin/projects/upload-thumbnail`
  - 내부적으로 공통 업로드 로직 사용

## 5) 카드 전체 링크 정책 적용
- 공개 사이트:
  - `ProjectCard` 카드 전체 링크화
  - `BlogCard` 카드 전체 링크화
- 블로그 카드:
  - 썸네일이 있을 때만 이미지 레이아웃 표시
  - 없으면 텍스트 중심 카드 유지

## 6) Contact 성공 UX 개선
- 문의 전송 성공 시:
  - 모달 내 성공 문구(`✓`)를 1.2초 표시
  - 이후 자동 닫힘
  - 닫힌 뒤 FAB 근처에 짧은 성공 확인 문구 표시

## 7) Home Swiper 적용
- `swiper` 패키지 설치.
- 홈의 대표 프로젝트/최근 블로그 섹션을 Swiper로 전환:
  - 모바일 1장
  - 태블릿 2장
  - 데스크탑 3장
- keyboard/pagination 활성화.

## 8) 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과
- `npm run build` 실패 (현 환경 DNS 제한으로 `fonts.googleapis.com` 접근 불가)
