"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { AdminMember, AdminRole } from "@/types/admin";

type AdminMembersSectionProps = {
  initialMembers: AdminMember[];
};

function toDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}

export function AdminMembersSection({ initialMembers }: AdminMembersSectionProps) {
  const [members, setMembers] = useState(initialMembers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateLocalMember = (
    id: string,
    next: Partial<{ role: AdminRole; isActive: boolean; expiresAt: string | null }>,
  ) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? {
              ...member,
              role: next.role ?? member.role,
              isActive: next.isActive ?? member.isActive,
              expiresAt: next.expiresAt ?? member.expiresAt,
            }
          : member,
      ),
    );
  };

  const saveMember = async (member: AdminMember) => {
    setPendingId(member.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/settings/admin-members/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: member.role,
          isActive: member.isActive,
          expiresAt: member.role === "test_admin" && member.expiresAt ? member.expiresAt : null,
        }),
      });
      const payload = (await response.json()) as { member?: AdminMember; error?: string };

      if (!response.ok || !payload.member) {
        throw new Error(payload.error ?? "관리자 계정 저장에 실패했습니다.");
      }

      setMembers((prev) => prev.map((item) => (item.id === member.id ? payload.member! : item)));
      setMessage("관리자 계정 정보를 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <SurfaceCard tone="surface" padding="md" className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">관리자 계정 관리</h2>
      {message ? <p className="text-sm text-muted">{message}</p> : null}

      <ul className="space-y-2">
        {members.length > 0 ? (
          members.map((member) => {
            const disabled = pendingId === member.id;
            return (
              <li key={member.id} className="rounded-lg border border-border bg-background p-3">
                <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{member.email}</p>
                    <p className="text-xs text-muted">
                      {member.isSuperAdmin ? "super_admin (원본)" : "일반 allowlist 계정"}
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm">
                    <span className="text-muted">역할</span>
                    <select
                      className="bg-transparent outline-none"
                      value={member.role}
                      onChange={(event) =>
                        updateLocalMember(member.id, {
                          role: event.target.value as AdminRole,
                          expiresAt: event.target.value === "test_admin" ? member.expiresAt : null,
                        })
                      }
                      disabled={disabled}
                    >
                      <option value="super_admin">super_admin</option>
                      <option value="admin">admin</option>
                      <option value="test_admin">test_admin</option>
                    </select>
                  </label>

                  <label className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={member.isActive}
                      onChange={(event) =>
                        updateLocalMember(member.id, { isActive: event.target.checked })
                      }
                      disabled={disabled}
                    />
                    <span className="text-muted">활성</span>
                  </label>

                  <label className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm">
                    <span className="text-muted">만료</span>
                    <input
                      type="datetime-local"
                      className="bg-transparent outline-none"
                      value={toDateTimeLocalValue(member.expiresAt)}
                      onChange={(event) =>
                        updateLocalMember(member.id, {
                          expiresAt: event.target.value
                            ? new Date(event.target.value).toISOString()
                            : null,
                        })
                      }
                      disabled={disabled || member.role !== "test_admin"}
                    />
                  </label>
                </div>

                <div className="mt-3">
                  <Button
                    type="button"
                    size="sm"
                    disabled={disabled}
                    onClick={() => void saveMember(member)}
                  >
                    {disabled ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </li>
            );
          })
        ) : (
          <li className="rounded-lg border border-border bg-background px-3 py-4 text-sm text-muted">
            관리자 계정이 없습니다.
          </li>
        )}
      </ul>
    </SurfaceCard>
  );
}
