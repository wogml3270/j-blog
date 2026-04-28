# 관리자 권한 useAuth + Zustand 전역화

## 배경
- 관리자 권한 정보를 컴포넌트마다 개별 전달하지 않고, 어디서든 공통 훅으로 사용하고자 했다.
- 요구사항: `lib/hooks/useAuth.ts` 커스텀 훅 + Zustand 전역 스토어 연동.

## 변경 사항
- 타입 추가
  - `types/admin.ts`
  - `AdminAuthSession` 타입 신설

- 전역 스토어 추가
  - `stores/admin-auth.ts`
  - 상태: `userId`, `role`, `canReadAdmin`, `canWriteAdmin`, `canManageAdmin`
  - 파생값: `isAdmin`, `isSuperAdmin`, `isTestAdmin`
  - 액션: `setAuth`, `clearAuth`, `hasPermission`

- 커스텀 훅 추가
  - `lib/hooks/useAuth.ts`
  - `useAuth()`: 권한 상태 + 파생값 + `hasPermission` 반환
  - `useHasAdminPermission(permission)`: 단일 권한 체크 헬퍼

- Provider 동기화
  - `components/admin/common/admin-session-provider.tsx`
  - 서버에서 내려온 관리자 세션을 `useEffect`로 Zustand 스토어에 동기화

## 부가 정리
- 대시보드에서 미사용 `profile/about` 전달값 제거
  - `components/admin/dashboard/dashboard-manager.tsx`
  - `app/admin/(protected)/dashboard/page.tsx`

## 검증
- `npx tsc --noEmit` 통과
- `npm run -s lint` 통과

