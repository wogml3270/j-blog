"use client";

import { createContext, useContext, useEffect } from "react";
import { useAdminAuthStore } from "@/stores/admin-auth";
import type { AdminAuthSession } from "@/types/admin";

export type AdminSessionValue = AdminAuthSession;

const AdminSessionContext = createContext<AdminSessionValue>({
  userId: null,
  role: null,
  canReadAdmin: false,
  canWriteAdmin: false,
  canManageAdmin: false,
});

export function AdminSessionProvider({
  value,
  children,
}: {
  value: AdminSessionValue;
  children: React.ReactNode;
}) {
  const setAuth = useAdminAuthStore((state) => state.setAuth);

  // 서버에서 계산한 관리자 권한 스냅샷을 클라이언트 전역 스토어에 동기화한다.
  useEffect(() => {
    setAuth(value);
  }, [setAuth, value]);

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}
