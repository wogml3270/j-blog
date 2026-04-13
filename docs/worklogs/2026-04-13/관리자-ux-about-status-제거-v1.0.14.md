# v1.0.14 관리자 UX 정비 + About 상태 제거

## 작업 목적
- 홈 슬라이드 관리 탭에 페이지네이션 없이 필터만 추가
- About 공개/비공개 상태 기능을 DB/API/UI에서 제거
- 블로그/프로젝트 리스트를 썸네일/제목/태그/날짜 중심 미리보기형으로 강화
- 기존 더미데이터 생성 흔적 및 실제 더미 데이터 정리

## 적용 내용
- 홈 슬라이드 관리
  - 소스 필터(`전체 소스/프로젝트/블로그`) 추가
  - 노출 필터(`전체 노출/활성/비활성`) 추가
  - 필터 적용 상태에서도 드래그 정렬/활성 토글/CTA 라벨 편집 유지
- About 상태 제거
  - `types/profile.ts`에서 `status` 필드 제거
  - `lib/profile/repository.ts`에서 `profile_content.status` 의존 제거
  - `/api/admin/about` 요청/응답에서 `status` 제거
  - 관리자 About 탭에서 상태 배지/라디오 제거
  - 대시보드의 About 상태 표시를 이름/최종 변경일 중심으로 정리
- 관리자 리스트 미리보기 강화
  - 블로그/프로젝트 모두 리스트 행에 썸네일, 제목, 태그(상위 3개), 날짜 표시
  - 블로그 날짜는 `publishedAt` 우선, 없으면 `updatedAt` 사용
  - 프로젝트 날짜는 `updatedAt` 고정
- SQL 정리
  - `supabase/v1/schema-v1.0.5.sql`에서 더미 insert 블록 제거(인덱스 전용)
  - `supabase/v1/schema-v1.0.14.sql` 추가
    - `profile_content.status` 제거
    - `profile_public_read` 정책을 상시 조회로 재정의
    - 더미 posts/projects/contact_messages 삭제
    - `schema_migrations` 기록/보정

## 확인 포인트
- `/admin/home` 필터 조합별 목록 노출 확인
- `/admin/about`에서 상태 UI 제거 및 저장 정상 동작 확인
- `/admin/blog`, `/admin/projects` 리스트의 미리보기 요소 노출 확인
- `schema-v1.0.14.sql` 실행 전 백업 여부 확인 후 적용
