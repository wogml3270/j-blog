# 관리자 권한요청 + Settings + 읽기전용 권한 도입

## 작업 배경
- 관리자 페이지 접근 제어를 `super_admin / admin / test_admin` 역할 모델로 확장해야 했습니다.
- 일반 사용자의 관리자 접근 시 권한 요청 플로우와, super_admin 전용 설정 페이지가 필요했습니다.
- `test_admin` 계정은 조회만 허용하고 생성/수정/삭제는 서버/API 레벨에서 차단해야 했습니다.

## 주요 변경
- 권한 타입 확장
  - `types/admin.ts`에 `AdminRole`, `AdminPermission`, `AdminAccessRequest` 관련 타입 추가
  - `lib/auth/admin.ts`에서 역할/권한 플래그(`canReadAdmin/canWriteAdmin/canManageAdmin`) 계산 로직 추가
  - `getAdminGuardForApi(requiredPermission)`를 `read|write|manage_admin` 기반으로 확장

- 관리자 세션 컨텍스트 추가
  - `components/admin/common/admin-session-provider.tsx` 신규 생성
  - `app/admin/(protected)/layout.tsx`에서 관리자 세션 정보를 Provider로 주입
  - 사이드바에 role 라벨 표시

- Settings 페이지 신설
  - `/admin/settings` 라우트 추가
  - 사이드바 설정 아이콘을 실제 링크로 활성화
  - `components/admin/settings/*` 구조로 확장 가능한 섹션 레지스트리 도입
  - 1차 섹션: `권한 요청 관리`, `관리자 계정 관리`
  - settings 접근 권한은 `super_admin`으로 제한

- 권한 요청 플로우 구현
  - `components/admin/access-request-card.tsx` 신규
  - 관리자 로그인 페이지에서 비허용 로그인 사용자에게 권한 요청 UI 노출
  - `/api/admin/access-requests` `GET/POST` 추가
  - `RESEND_API_KEY`가 있을 때만 알림 메일 전송(저장은 항상 성공 우선)

- super_admin 설정 API 추가
  - `/api/admin/settings/access-requests` (`GET`)
  - `/api/admin/settings/access-requests/[id]` (`PATCH`)
  - `/api/admin/settings/admin-members` (`GET`)
  - `/api/admin/settings/admin-members/[id]` (`PATCH`)

- 대시보드 연동
  - 대기중 권한 요청 수 KPI 추가
  - “지금 확인할 항목”에 권한 요청 처리 링크 추가

- 읽기 전용(test_admin) UX
  - `home/about/blog/projects/contact` 관리자 화면에서 읽기 전용 안내 표시
  - 저장/삭제/생성 버튼 비활성 및 클라이언트 가드 추가
  - 서버 API write 엔드포인트는 `requiredPermission: "write"`로 통일

## DB 마이그레이션
- 파일: `supabase/v2/schema-v2.2.1-admin-access-requests.sql`
- 내용:
  - `admin_allowlist` 확장: `role`, `is_active`, `expires_at`, `updated_at`
  - `is_admin_email`, `is_super_admin_email`, `is_admin_user` 함수 정비
  - `admin_allowlist_admin_manage` 정책을 `super_admin` 기준으로 강화
  - `admin_access_requests` 테이블/인덱스/RLS/policy/trigger 추가
  - `schema_migrations`에 `v2.2.1` 기록

## 환경변수
- `.env.example`에 `ADMIN_REQUEST_NOTIFY_TO_EMAILS`(선택) 추가

## 검증
- `npm run lint` 통과
- `npx tsc --noEmit` 통과

## 적용 체크리스트
1. Supabase SQL Editor에서 `schema-v2.2.1-admin-access-requests.sql` 적용
2. super_admin 계정으로 `/admin/settings` 접근 확인
3. 비허용 계정 로그인 후 `/admin/login` 권한 요청 생성 확인
4. `test_admin` 계정으로 관리자 탭 진입 시 조회만 가능하고 저장/삭제가 차단되는지 확인
