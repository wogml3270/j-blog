"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { AdminAccessRequest, AdminAccessRequestStatus, AdminRole } from "@/types/admin";

function toDisplayDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function toDefaultExpiryIso(): string {
  const now = new Date();
  now.setDate(now.getDate() + 14);
  return now.toISOString();
}

type AccessRequestsSectionProps = {
  initialRequests: AdminAccessRequest[];
};

export function AccessRequestsSection({ initialRequests }: AccessRequestsSectionProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState<AdminAccessRequestStatus | "all">("pending");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [decisionById, setDecisionById] = useState<
    Record<string, { role: AdminRole; expiresAt: string }>
  >(() =>
    Object.fromEntries(
      initialRequests.map((request) => [
        request.id,
        {
          role: "test_admin" as const,
          expiresAt: request.testAdminExpiresAt
            ? request.testAdminExpiresAt.slice(0, 16)
            : "",
        },
      ]),
    ),
  );

  const visibleRequests = useMemo(
    () =>
      statusFilter === "all"
        ? requests
        : requests.filter((request) => request.status === statusFilter),
    [requests, statusFilter],
  );

  const updateDecision = (id: string, next: Partial<{ role: AdminRole; expiresAt: string }>) => {
    setDecisionById((prev) => ({
      ...prev,
      [id]: {
        role: next.role ?? prev[id]?.role ?? "test_admin",
        expiresAt: next.expiresAt ?? prev[id]?.expiresAt ?? "",
      },
    }));
  };

  const resolveRequest = async (
    request: AdminAccessRequest,
    status: Extract<AdminAccessRequestStatus, "approved" | "rejected">,
  ) => {
    setPendingId(request.id);
    setMessage(null);

    try {
      const role = decisionById[request.id]?.role ?? "test_admin";
      const expiresAt = role === "test_admin" ? (decisionById[request.id]?.expiresAt ?? "") : "";
      const resolvedExpiryIso =
        role === "test_admin"
          ? expiresAt.trim()
            ? new Date(expiresAt).toISOString()
            : toDefaultExpiryIso()
          : null;
      const response = await fetch(`/api/admin/settings/access-requests/${request.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          role,
          testAdminExpiresAt: resolvedExpiryIso,
        }),
      });

      const payload = (await response.json()) as { request?: AdminAccessRequest; error?: string };

      if (!response.ok || !payload.request) {
        throw new Error(payload.error ?? "요청 처리에 실패했습니다.");
      }

      setRequests((prev) => prev.map((item) => (item.id === request.id ? payload.request! : item)));
      setMessage(status === "approved" ? "권한 요청을 승인했습니다." : "권한 요청을 반려했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <SurfaceCard tone="surface" padding="md" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">권한 요청 관리</h2>
        <label className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
          <span className="text-muted">상태</span>
          <select
            className="bg-transparent text-sm outline-none"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as AdminAccessRequestStatus | "all")}
          >
            <option value="all">전체</option>
            <option value="pending">대기</option>
            <option value="approved">승인</option>
            <option value="rejected">반려</option>
          </select>
        </label>
      </div>

      {message ? <p className="text-sm text-muted">{message}</p> : null}

      <ul className="space-y-2">
        {visibleRequests.length > 0 ? (
          visibleRequests.map((request) => {
            const decision = decisionById[request.id] ?? {
              role: "test_admin" as const,
              expiresAt: "",
            };
            const disabled = pendingId === request.id || request.status !== "pending";

            return (
              <li key={request.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground">{request.email}</p>
                    <p className="text-xs text-muted">요청일: {toDisplayDate(request.requestedAt)}</p>
                    {request.message ? (
                      <p className="mt-1 text-sm text-foreground">{request.message}</p>
                    ) : null}
                    <p className="text-xs text-muted">
                      상태:{" "}
                      {request.status === "pending"
                        ? "대기"
                        : request.status === "approved"
                          ? "승인"
                          : "반려"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm">
                      <span className="text-muted">역할</span>
                      <select
                        className="bg-transparent outline-none"
                        value={decision.role}
                        onChange={(event) =>
                          updateDecision(request.id, { role: event.target.value as AdminRole })
                        }
                        disabled={disabled}
                      >
                        <option value="test_admin">test_admin</option>
                        <option value="admin">admin</option>
                      </select>
                    </label>
                    <label className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm">
                      <span className="text-muted">만료일</span>
                      <input
                        type="datetime-local"
                        className="bg-transparent outline-none"
                        value={decision.expiresAt}
                        onChange={(event) =>
                          updateDecision(request.id, { expiresAt: event.target.value })
                        }
                        disabled={disabled || decision.role !== "test_admin"}
                      />
                    </label>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={disabled}
                    onClick={() => void resolveRequest(request, "approved")}
                  >
                    승인
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => void resolveRequest(request, "rejected")}
                  >
                    반려
                  </Button>
                </div>
              </li>
            );
          })
        ) : (
          <li className="rounded-lg border border-border bg-background px-3 py-4 text-sm text-muted">
            조건에 맞는 권한 요청이 없습니다.
          </li>
        )}
      </ul>
    </SurfaceCard>
  );
}
