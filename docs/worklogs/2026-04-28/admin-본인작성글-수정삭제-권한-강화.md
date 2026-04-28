# admin 본인 작성글 수정/삭제 권한 강화

## 이슈
- admin 계정에서 본인 작성글이 아닌 블로그/프로젝트도 수정 가능한 것으로 보이는 문제 확인.

## 조치
1. 서버 권한 강제
- 블로그/프로젝트 상세 수정/삭제 API에서 `admin`은 `created_by === auth.user.id`일 때만 허용.
- `super_admin`은 전체 허용, `test_admin`은 write 자체 차단 유지.

2. 관리자 UI 추가 차단
- 블로그/프로젝트 매니저에서 현재 편집 대상의 `createdBy`와 세션 `userId`를 비교.
- 본인 글이 아니면 저장/삭제 버튼과 필드셋 비활성화.
- 안내 문구로 권한 정책 명시.

3. 세션 컨텍스트 보강
- `AdminSessionProvider`에 `userId` 추가.
- protected layout에서 `state.user.id` 주입.

## 변경 파일
- `components/admin/common/admin-session-provider.tsx`
- `app/admin/(protected)/layout.tsx`
- `components/admin/blog/blog-manager.tsx`
- `components/admin/projects/projects-manager.tsx`

## 검증
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과
