# 관리자 권한정책 정교화 (super_admin / admin / test_admin)

## 목표
- `super_admin`: 모든 기능 가능
- `admin`: 글 생성 가능, 블로그/프로젝트는 본인 작성글만 수정/삭제 가능, 문의함은 super_admin과 동일 권한
- `test_admin`: 조회 전용

## 적용 내용
1. 소유권 기반 수정/삭제 서버 강제
- 블로그/프로젝트 상세 수정(`PUT`) 및 삭제(`DELETE`) API에서 role별 소유권 검증 추가
- `admin`은 `created_by === 현재 사용자 id`인 콘텐츠만 수정/삭제 허용
- `super_admin`은 전체 허용, `test_admin`은 write guard에서 차단 유지

2. 프로젝트 작성자 컬럼 보강
- 신규 마이그레이션: `supabase/v2/schema-v2.2.3-admin-content-ownership.sql`
- `posts.created_by`, `projects.created_by` 컬럼 보강 (`uuid -> auth.users(id)`)
- `created_by` 인덱스 추가
- 신규 프로젝트 생성 시 `created_by = guard.user.id` 저장

3. super_admin 고정 정책 보강
- `ADMIN_SUPER_ADMIN_EMAILS` 도입 후 ENV 기반 super_admin 판정 우선
- 관리자 권한요청 승인/관리자 멤버 수정 경로에서 super_admin role 부여/수정 불가 처리

## 변경 파일
- `lib/auth/admin-emails.ts`
- `lib/auth/admin.ts`
- `lib/auth/admin-settings-repository.ts`
- `app/api/admin/posts/[id]/route.ts`
- `app/api/admin/projects/[id]/route.ts`
- `app/api/admin/projects/route.ts`
- `types/blog.ts`
- `types/projects.ts`
- `lib/blog/repository.ts`
- `lib/projects/repository.ts`
- `supabase/v2/schema-v2.2.3-admin-content-ownership.sql`

## 검증
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
