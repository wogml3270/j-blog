"use client";

import { useMemo } from "react";
import { useAdminSession } from "@/components/admin/common/admin-session-provider";
import { useAdminAuthStore } from "@/stores/admin-auth";
import type { AdminPermission } from "@/types/admin";

// 관리자 권한 정보를 화면 어디에서든 동일한 형태로 읽기 위한 공통 훅
export function useAuth() {
  const session = useAdminSession();
  const store = useAdminAuthStore((state) => state);

  // Provider 바깥에서는 zustand 스냅샷을, 안쪽에서는 최신 session 값을 우선 사용한다.
  const source = session.role !== null || session.userId !== null ? session : store;

  return useMemo(
    () => ({
      userId: source.userId,
      role: source.role,
      canReadAdmin: source.canReadAdmin,
      canWriteAdmin: source.canWriteAdmin,
      canManageAdmin: source.canManageAdmin,
      isAdmin: source.role !== null,
      isSuperAdmin: source.role === "super_admin",
      isTestAdmin: source.role === "test_admin",
      hasPermission: (permission: AdminPermission) => {
        if (permission === "manage_admin") {
          return source.canManageAdmin;
        }

        if (permission === "write") {
          return source.canWriteAdmin;
        }

        return source.canReadAdmin;
      },
    }),
    [source],
  );
}

// 특정 권한이 필요한 버튼/섹션에서 boolean만 간단히 꺼내 쓰기 위한 헬퍼 훅
export function useHasAdminPermission(permission: AdminPermission) {
  const auth = useAuth();
  return auth.hasPermission(permission);
}
