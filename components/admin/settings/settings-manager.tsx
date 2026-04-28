"use client";

import { useMemo, useState } from "react";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { Button } from "@/components/ui/button";
import { AccessRequestsSection } from "@/components/admin/settings/sections/access-requests-section";
import { AdminMembersSection } from "@/components/admin/settings/sections/admin-members-section";
import { SETTINGS_SECTIONS, type SettingsSectionId } from "@/components/admin/settings/config";
import type { SettingsManagerProps } from "@/types/ui";

const DEFAULT_TAB: SettingsSectionId = "access-requests";

function normalizeTab(value: string | undefined): SettingsSectionId {
  if (value === "access-requests" || value === "admin-members") {
    return value;
  }

  return DEFAULT_TAB;
}

export function SettingsManager({
  initialRequests,
  initialMembers,
  initialTab,
}: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<SettingsSectionId>(normalizeTab(initialTab));
  const sections = useMemo(() => [...SETTINGS_SECTIONS].sort((a, b) => a.order - b.order), []);

  return (
    <ManagerShell
      title="관리자 설정"
      summary="권한 요청과 관리자 계정을 관리합니다."
      detail="이 페이지는 super_admin 권한에서만 수정 가능합니다."
      motion
      action={
        <div className="flex flex-wrap items-center gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              type="button"
              size="sm"
              variant={activeTab === section.id ? "solid" : "outline"}
              onClick={() => setActiveTab(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </div>
      }
    >
      {activeTab === "access-requests" ? (
        <AccessRequestsSection initialRequests={initialRequests} />
      ) : (
        <AdminMembersSection initialMembers={initialMembers} />
      )}
    </ManagerShell>
  );
}
