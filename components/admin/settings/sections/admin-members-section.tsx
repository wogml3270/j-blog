"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { AdminMember, AdminRole } from "@/types/admin";

type AdminMembersSectionProps = {
  initialMembers: AdminMember[];
};

type ExpiryMode = "none" | "7d" | "14d" | "30d" | "90d" | "custom";

type ExpiryControlState = {
  mode: ExpiryMode;
  customLocalValue: string;
};

type MutableAdminRole = Exclude<AdminRole, "super_admin">;

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

function toIsoFromLocal(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function toFutureIso(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now.toISOString();
}

function buildInitialExpiryState(member: AdminMember): ExpiryControlState {
  if (member.role !== "test_admin") {
    return {
      mode: "none",
      customLocalValue: toDateTimeLocalValue(toFutureIso(14)),
    };
  }

  if (!member.expiresAt) {
    return {
      mode: "none",
      customLocalValue: toDateTimeLocalValue(toFutureIso(14)),
    };
  }

  return {
    mode: "custom",
    customLocalValue: toDateTimeLocalValue(member.expiresAt),
  };
}

function toMutableRole(role: AdminRole): MutableAdminRole {
  return role === "test_admin" ? "test_admin" : "admin";
}

export function AdminMembersSection({ initialMembers }: AdminMembersSectionProps) {
  const [members, setMembers] = useState(initialMembers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expiryControls, setExpiryControls] = useState<Record<string, ExpiryControlState>>(() =>
    Object.fromEntries(
      initialMembers.map((member) => [member.id, buildInitialExpiryState(member)]),
    ),
  );

  // 관리자 행에서 수정 가능한 필드를 로컬 상태에 반영한다.
  const updateLocalMember = (
    id: string,
    next: Partial<{ role: AdminRole; expiresAt: string | null; avatarUrl: string | null }>,
  ) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id
          ? {
              ...member,
              role: next.role ?? member.role,
              expiresAt: next.expiresAt !== undefined ? next.expiresAt : member.expiresAt,
              avatarUrl: next.avatarUrl !== undefined ? next.avatarUrl : member.avatarUrl,
            }
          : member,
      ),
    );
  };

  // 역할 변경 시 test_admin 전용 만료 설정 상태를 함께 정리한다.
  const onChangeRole = (member: AdminMember, role: MutableAdminRole) => {
    if (member.role === "super_admin") {
      return;
    }

    if (role !== "test_admin") {
      updateLocalMember(member.id, { role, expiresAt: null });
      setExpiryControls((prev) => ({
        ...prev,
        [member.id]: {
          mode: "none",
          customLocalValue:
            prev[member.id]?.customLocalValue || toDateTimeLocalValue(toFutureIso(14)),
        },
      }));
      return;
    }

    const currentControl = expiryControls[member.id] ?? buildInitialExpiryState(member);
    const nextExpiresAt = member.expiresAt ?? toFutureIso(14);
    const nextCustomLocal =
      currentControl.customLocalValue || toDateTimeLocalValue(nextExpiresAt) || "";

    updateLocalMember(member.id, { role: "test_admin", expiresAt: nextExpiresAt });
    setExpiryControls((prev) => ({
      ...prev,
      [member.id]: {
        mode: currentControl.mode === "none" ? "14d" : currentControl.mode,
        customLocalValue: nextCustomLocal,
      },
    }));
  };

  // 만료 정책 변경은 프리셋/직접 지정 모두 즉시 expiresAt에 동기화한다.
  const onChangeExpiryMode = (member: AdminMember, mode: ExpiryMode) => {
    if (member.role !== "test_admin") {
      return;
    }

    const currentControl = expiryControls[member.id] ?? buildInitialExpiryState(member);

    if (mode === "none") {
      updateLocalMember(member.id, { expiresAt: null });
      setExpiryControls((prev) => ({
        ...prev,
        [member.id]: {
          ...currentControl,
          mode: "none",
        },
      }));
      return;
    }

    if (mode === "custom") {
      const fallbackLocal =
        currentControl.customLocalValue ||
        toDateTimeLocalValue(member.expiresAt) ||
        toDateTimeLocalValue(toFutureIso(14));
      const fallbackIso = toIsoFromLocal(fallbackLocal) ?? toFutureIso(14);

      updateLocalMember(member.id, { expiresAt: fallbackIso });
      setExpiryControls((prev) => ({
        ...prev,
        [member.id]: {
          mode: "custom",
          customLocalValue: fallbackLocal,
        },
      }));
      return;
    }

    const days = mode === "7d" ? 7 : mode === "14d" ? 14 : mode === "30d" ? 30 : 90;
    const nextIso = toFutureIso(days);

    updateLocalMember(member.id, { expiresAt: nextIso });
    setExpiryControls((prev) => ({
      ...prev,
      [member.id]: {
        mode,
        customLocalValue: toDateTimeLocalValue(nextIso),
      },
    }));
  };

  // 직접 지정 만료일은 datetime-local 값을 ISO로 변환해 저장 상태에 반영한다.
  const onChangeCustomExpiry = (member: AdminMember, value: string) => {
    if (member.role !== "test_admin") {
      return;
    }

    setExpiryControls((prev) => ({
      ...prev,
      [member.id]: {
        mode: "custom",
        customLocalValue: value,
      },
    }));

    updateLocalMember(member.id, {
      expiresAt: toIsoFromLocal(value),
    });
  };

  // 관리자 계정 편집 결과를 서버에 저장한다.
  const saveMember = async (member: AdminMember) => {
    if (member.role === "super_admin") {
      return;
    }

    setPendingId(member.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/settings/admin-members/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: toMutableRole(member.role),
          expiresAt: member.role === "test_admin" ? member.expiresAt : null,
        }),
      });
      const payload = (await response.json()) as { member?: AdminMember; error?: string };

      if (!response.ok || !payload.member) {
        throw new Error(payload.error ?? "관리자 계정 저장에 실패했습니다.");
      }

      const savedMember = payload.member;

      setMembers((prev) => prev.map((item) => (item.id === member.id ? savedMember : item)));
      setExpiryControls((prev) => ({
        ...prev,
        [member.id]: buildInitialExpiryState(savedMember),
      }));
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
            const expiryControl = expiryControls[member.id] ?? buildInitialExpiryState(member);
            const isSuperAdminRole = member.role === "super_admin";
            const canEditExpiry = member.role === "test_admin";

            return (
              <li key={member.id} className="rounded-lg border border-border bg-background p-3">
                <div className="space-y-3">
                  <div className="flex min-w-0 flex-wrap items-start gap-3">
                    {member.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatarUrl}
                        alt={member.email}
                        className="h-10 w-10 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold text-foreground">
                        {(member.email || "U").slice(0, 1).toUpperCase()}
                      </span>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="break-all text-sm font-semibold text-foreground">
                        {member.email}
                      </p>
                      <p className="text-xs text-muted">
                        {isSuperAdminRole ? "super_admin" : member.role}
                      </p>
                    </div>
                    {!isSuperAdminRole && (
                      <div className="ml-auto shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          disabled={disabled || isSuperAdminRole}
                          onClick={() => void saveMember(member)}
                        >
                          {disabled ? "저장 중..." : "저장"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex flex-col md:flex-row gap-2">
                    {isSuperAdminRole ? null : (
                      <label className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm mb-0">
                        <span className="shrink-0 text-muted">역할</span>
                        <select
                          className="min-w-0 flex-1 bg-transparent outline-none"
                          value={toMutableRole(member.role)}
                          onChange={(event) =>
                            onChangeRole(member, event.target.value as MutableAdminRole)
                          }
                          disabled={disabled}
                        >
                          <option value="admin">admin</option>
                          <option value="test_admin">test_admin</option>
                        </select>
                      </label>
                    )}

                    {canEditExpiry ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm">
                          <span className="shrink-0 text-muted">만료 정책</span>
                          <select
                            className="min-w-0 flex-1 bg-transparent outline-none"
                            value={expiryControl.mode}
                            onChange={(event) =>
                              onChangeExpiryMode(member, event.target.value as ExpiryMode)
                            }
                            disabled={disabled}
                          >
                            <option value="none">만료일 지정 안함</option>
                            <option value="7d">7일</option>
                            <option value="14d">14일</option>
                            <option value="30d">30일</option>
                            <option value="90d">90일</option>
                            <option value="custom">기간 설정(직접 지정)</option>
                          </select>
                        </label>

                        {expiryControl.mode === "custom" ? (
                          <label className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm">
                            <span className="shrink-0 text-muted">만료일</span>
                            <input
                              type="datetime-local"
                              className="min-w-0 flex-1 bg-transparent outline-none"
                              value={expiryControl.customLocalValue}
                              onChange={(event) => onChangeCustomExpiry(member, event.target.value)}
                              disabled={disabled}
                            />
                          </label>
                        ) : (
                          <div className="rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm text-muted">
                            선택한 정책으로 저장 시 만료일이 자동 계산됩니다.
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
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
