"use client";

import { createContext, useContext } from "react";
import type { AdminRole } from "@/types/admin";

type AdminSessionValue = {
  role: AdminRole | null;
  canReadAdmin: boolean;
  canWriteAdmin: boolean;
  canManageAdmin: boolean;
};

const AdminSessionContext = createContext<AdminSessionValue>({
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
  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}
