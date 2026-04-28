"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminAccessRequest } from "@/types/admin";

type AccessRequestCardProps = {
  email: string;
  initialRequest: AdminAccessRequest | null;
};

function toStatusLabel(status: AdminAccessRequest["status"]): string {
  if (status === "approved") {
    return "승인";
  }

  if (status === "rejected") {
    return "반려";
  }

  return "대기";
}

function toDisplayDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function AccessRequestCard({ email, initialRequest }: AccessRequestCardProps) {
  const [request, setRequest] = useState<AdminAccessRequest | null>(initialRequest);
  const [messageInput, setMessageInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    setIsPending(true);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageInput,
        }),
      });
      const payload = (await response.json()) as { request?: AdminAccessRequest; error?: string };

      if (!response.ok || !payload.request) {
        throw new Error(payload.error ?? "권한 요청 전송에 실패했습니다.");
      }

      setRequest(payload.request);
      setNotice("권한 요청이 접수되었습니다. 관리자 승인 후 접근할 수 있습니다.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  const isAlreadyPending = request?.status === "pending";

  return (
    <div className="mt-4 rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-semibold text-foreground">관리자 권한 요청</p>
      <p className="mt-1 text-xs text-muted">
        권한이 필요하면 아래에서 요청을 남겨주세요. 문의:{" "}
        <a href="mailto:wogml3270@gmail.com" className="underline">
          wogml3270@gmail.com
        </a>
        ,{" "}
        <a href="mailto:wogml3270@naver.com" className="underline">
          wogml3270@naver.com
        </a>
      </p>
      <p className="mt-1 text-xs text-muted">현재 계정: {email}</p>

      {request ? (
        <div className="mt-3 rounded-lg border border-border bg-surface p-3 text-sm">
          <p className="text-foreground">
            최근 요청 상태: <span className="font-semibold">{toStatusLabel(request.status)}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            요청일 {toDisplayDate(request.requestedAt)} / 처리일 {toDisplayDate(request.resolvedAt)}
          </p>
          {request.message ? <p className="mt-2 text-xs text-muted">메모: {request.message}</p> : null}
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        <textarea
          value={messageInput}
          onChange={(event) => setMessageInput(event.target.value)}
          className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-foreground/35"
          placeholder="권한 요청 메시지(선택)"
          disabled={isPending || isAlreadyPending}
        />
        <Button type="button" onClick={submit} disabled={isPending || isAlreadyPending}>
          {isPending ? "요청 중..." : isAlreadyPending ? "대기 중" : "권한 요청"}
        </Button>
      </div>

      {notice ? <p className="mt-2 text-sm text-muted">{notice}</p> : null}
    </div>
  );
}
