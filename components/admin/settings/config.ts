import type { AdminPermission } from "@/types/admin";

export type SettingsSectionId = "access-requests" | "admin-members";

export type SettingsSectionConfig = {
  id: SettingsSectionId;
  label: string;
  order: number;
  requiredPermission: AdminPermission;
};

export const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  {
    id: "access-requests",
    label: "권한 요청 관리",
    order: 1,
    requiredPermission: "manage_admin",
  },
  {
    id: "admin-members",
    label: "관리자 계정 관리",
    order: 2,
    requiredPermission: "manage_admin",
  },
];
