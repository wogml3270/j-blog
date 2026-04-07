"use client";

import { useEffect, useRef, useState } from "react";
import { EditorDrawer } from "@/components/admin/common/editor-drawer";
import { ManagerList, ManagerListRow } from "@/components/admin/common/manager-list";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { StatusRadioGroup } from "@/components/admin/common/status-radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { ContactMessage, ContactMessageStatus } from "@/types/content";

type ContactManagerProps = {
  initialContacts: ContactMessage[];
  initialSelectedId?: string | null;
};

const STATUS_OPTIONS: Array<{ value: ContactMessageStatus; label: string }> = [
  { value: "new", label: "신규" },
  { value: "read", label: "확인함" },
  { value: "replied", label: "답변완료" },
];

function statusBadge(status: ContactMessageStatus): string {
  if (status === "replied") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "read") {
    return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  }

  return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
}

function toStatusLabel(status: ContactMessageStatus): string {
  if (status === "replied") {
    return "답변완료";
  }

  if (status === "read") {
    return "확인함";
  }

  return "신규";
}

function toDisplayDate(value: string): string {
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

export function ContactManager({ initialContacts, initialSelectedId = null }: ContactManagerProps) {
  const [contacts, setContacts] = useState<ContactMessage[]>(initialContacts);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [nextStatus, setNextStatus] = useState<ContactMessageStatus>("new");
  const [adminNote, setAdminNote] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasAppliedInitialSelection = useRef(false);

  // 상세 패널을 열 때 상태/메모의 기준값을 동기화해 dirty 판단 기준을 고정한다.
  const openDetail = (contact: ContactMessage) => {
    setSelected(contact);
    setNextStatus(contact.status);
    setAdminNote(contact.adminNote);
    setMessage(null);
  };

  const closeDetail = () => {
    setSelected(null);
    setAdminNote("");
    setMessage(null);
  };

  // 저장 직후 목록 상태(배지/정렬/updatedAt)를 정확히 반영하기 위해 서버 목록을 재조회한다.
  const loadContacts = async () => {
    const response = await fetch("/api/admin/contact", { method: "GET" });

    if (!response.ok) {
      throw new Error("문의 목록을 불러오지 못했습니다.");
    }

    const payload = (await response.json()) as { contacts: ContactMessage[] };
    setContacts(payload.contacts ?? []);
  };

  // 문의 상세에서 상태/메모를 한 번에 저장해 운영 기록이 분리되지 않도록 한다.
  const saveContact = async () => {
    if (!selected) {
      return;
    }

    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/contact/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          adminNote,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "문의 업데이트에 실패했습니다.");
      }

      const payload = (await response.json()) as { contact?: ContactMessage };

      if (payload.contact) {
        setSelected(payload.contact);
        setNextStatus(payload.contact.status);
        setAdminNote(payload.contact.adminNote);
      }

      await loadContacts();
      setMessage("문의 상태와 관리자 메모를 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    // 딥링크(id 쿼리) 진입 시 최초 한 번만 해당 항목을 자동 오픈한다.
    if (hasAppliedInitialSelection.current || !initialSelectedId) {
      return;
    }

    const target = contacts.find((item) => item.id === initialSelectedId);

    if (!target) {
      return;
    }

    openDetail(target);
    hasAppliedInitialSelection.current = true;
  }, [contacts, initialSelectedId]);

  const isDirty =
    selected !== null &&
    (selected.status !== nextStatus || selected.adminNote !== adminNote);

  return (
    <>
      <ManagerShell
        motion
        summary={`문의함 ${contacts.length}건`}
        detail="항목을 클릭하면 상세 패널에서 상태/메모를 함께 관리할 수 있습니다."
      >
        <ManagerList hasItems={contacts.length > 0} emptyLabel="아직 문의가 없습니다.">
          {contacts.map((contact) => (
            <ManagerListRow key={contact.id} onClick={() => openDetail(contact)}>
              <>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusBadge(contact.status))}>
                    {toStatusLabel(contact.status)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {contact.subject}
                  </span>
                  {contact.adminNote.trim() ? (
                    <span className="hidden rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted sm:inline">
                      메모 있음
                    </span>
                  ) : null}
                  <span className="hidden max-w-[180px] truncate text-xs text-muted sm:inline">{contact.email}</span>
                  <span className="text-xs text-muted">{toDisplayDate(contact.createdAt)}</span>
              </>
            </ManagerListRow>
          ))}
        </ManagerList>
      </ManagerShell>

      <EditorDrawer
        open={Boolean(selected)}
        onClose={closeDetail}
        title={selected ? `${selected.subject} 의 문의` : ""}
        description={selected ? `${selected.name} · ${selected.email}` : ""}
      >
        {selected ? (
          <div className="space-y-4">
            <SurfaceCard tone="background" padding="sm">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">문의자 정보</p>
              <div className="space-y-1.5 text-sm text-foreground">
                <p>
                  <span className="text-muted">이름:</span> {selected.name}
                </p>
                <p>
                  <span className="text-muted">이메일:</span> {selected.email}
                </p>
                <p>
                  <span className="text-muted">접수일:</span> {toDisplayDate(selected.createdAt)}
                </p>
                <p>
                  <span className="text-muted">수정일:</span> {toDisplayDate(selected.updatedAt)}
                </p>
              </div>
            </SurfaceCard>

            <SurfaceCard tone="background" padding="sm">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">문의 내용</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{selected.message}</p>
            </SurfaceCard>

            <SurfaceCard tone="background" padding="sm" className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">관리자 메모</p>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground"
                placeholder="내부 확인 내용을 기록하세요. (공개되지 않음)"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                maxLength={3000}
              />
            </SurfaceCard>

            <StatusRadioGroup
              legend="상태"
              name="contact-status"
              value={nextStatus}
              options={STATUS_OPTIONS}
              onChange={(value) => setNextStatus(value as ContactMessageStatus)}
            />

            <Button
              type="button"
              className="w-full"
              onClick={saveContact}
              disabled={isPending || !isDirty}
            >
              {isPending ? "저장 중..." : "상태/메모 저장"}
            </Button>

            {message ? <p className="text-sm text-muted">{message}</p> : null}
          </div>
        ) : null}
      </EditorDrawer>
    </>
  );
}
