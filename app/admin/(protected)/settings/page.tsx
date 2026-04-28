import { ManagerShell } from "@/components/admin/common/manager-shell";
import { SettingsManager } from "@/components/admin/settings/settings-manager";
import { getAdminState } from "@/lib/auth/admin";
import { getAdminAccessRequests, getAdminMembers } from "@/lib/auth/admin-settings-repository";
import { pickSingleQueryValue } from "@/lib/utils/search-params";
import type { AdminSearchParams } from "@/types/admin";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: AdminSearchParams;
}) {
  const state = await getAdminState();

  if (!state.canManageAdmin) {
    return (
      <ManagerShell
        title="관리자 설정"
        summary="이 페이지는 super_admin 권한에서만 접근할 수 있습니다."
        detail="일반 admin/test_admin 계정은 조회/수정이 제한됩니다."
      >
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          현재 계정 권한으로는 관리자 설정에 접근할 수 없습니다.
        </p>
      </ManagerShell>
    );
  }

  const query = await searchParams;
  const initialTab = pickSingleQueryValue(query.tab);
  const [initialRequests, initialMembers] = await Promise.all([
    getAdminAccessRequests(),
    getAdminMembers(),
  ]);

  return (
    <SettingsManager
      initialRequests={initialRequests}
      initialMembers={initialMembers}
      initialTab={initialTab === "admin-members" ? "admin-members" : "access-requests"}
    />
  );
}
