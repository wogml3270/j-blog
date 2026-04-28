import { create } from "zustand";
import type { AdminAuthSession, AdminPermission } from "@/types/admin";

type AdminAuthStore = AdminAuthSession & {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isTestAdmin: boolean;
  setAuth: (session: AdminAuthSession) => void;
  clearAuth: () => void;
  hasPermission: (permission: AdminPermission) => boolean;
};

const DEFAULT_AUTH_SESSION: AdminAuthSession = {
  userId: null,
  role: null,
  canReadAdmin: false,
  canWriteAdmin: false,
  canManageAdmin: false,
};

function toDerivedState(session: AdminAuthSession) {
  const isAdmin = Boolean(session.role);
  const isSuperAdmin = session.role === "super_admin";
  const isTestAdmin = session.role === "test_admin";

  return {
    ...session,
    isAdmin,
    isSuperAdmin,
    isTestAdmin,
  };
}

export const useAdminAuthStore = create<AdminAuthStore>((set, get) => ({
  ...toDerivedState(DEFAULT_AUTH_SESSION),
  // 서버에서 내려준 관리자 세션 스냅샷을 전역 상태로 동기화한다.
  setAuth: (session) =>
    set({
      ...toDerivedState(session),
    }),
  // 로그아웃/세션 초기화 시 권한 상태를 기본값으로 되돌린다.
  clearAuth: () =>
    set({
      ...toDerivedState(DEFAULT_AUTH_SESSION),
    }),
  // 화면 공통 가드에서 read/write/manage_admin 권한 판정을 재사용한다.
  hasPermission: (permission) => {
    const state = get();

    if (permission === "manage_admin") {
      return state.canManageAdmin;
    }

    if (permission === "write") {
      return state.canWriteAdmin;
    }

    return state.canReadAdmin;
  },
}));
