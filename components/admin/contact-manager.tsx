"use client";

import { useEffect, useRef, useState } from "react";
import { EditorDrawer } from "@/components/admin/editor-drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { ContactMessage, ContactMessageStatus } from "@/types/content";

type ContactManagerProps = {
  initialContacts: ContactMessage[];
  initialSelectedId?: string | null;
};

const STATUS_OPTIONS: ContactMessageStatus[] = ["new", "read", "replied"];

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
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasAppliedInitialSelection = useRef(false);

  const openDetail = (contact: ContactMessage) => {
    setSelected(contact);
    setNextStatus(contact.status);
    setMessage(null);
  };

  const closeDetail = () => {
    setSelected(null);
    setMessage(null);
  };

  const loadContacts = async () => {
    const response = await fetch("/api/admin/contact", { method: "GET" });

    if (!response.ok) {
      throw new Error("문의 목록을 불러오지 못했습니다.");
    }

    const payload = (await response.json()) as { contacts: ContactMessage[] };
    setContacts(payload.contacts ?? []);
  };

  const saveStatus = async () => {
    if (!selected) {
      return;
    }

    setIsPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/contact/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "상태 변경에 실패했습니다.");
      }

      const payload = (await response.json()) as { contact?: ContactMessage };

      if (payload.contact) {
        setSelected(payload.contact);
      }

      await loadContacts();
      setMessage("상태를 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
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

  return (
    <>
      <section className="mx-auto w-full space-y-4">
        <header className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-sm text-muted">문의함 {contacts.length}건</p>
          <p className="text-xs text-muted">항목을 클릭하면 상세 내용과 상태를 수정할 수 있습니다.</p>
        </header>

        <ul className="overflow-hidden rounded-xl border border-border bg-surface">
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <li key={contact.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => openDetail(contact)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-foreground/5"
                >
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusBadge(contact.status))}>
                    {toStatusLabel(contact.status)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {contact.subject}
                  </span>
                  <span className="hidden max-w-[160px] truncate text-xs text-muted sm:inline">{contact.email}</span>
                  <span className="text-xs text-muted">{toDisplayDate(contact.createdAt)}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-sm text-muted">아직 문의가 없습니다.</li>
          )}
        </ul>
      </section>

      <EditorDrawer
        open={Boolean(selected)}
        onClose={closeDetail}
        title={selected ? selected.subject : "문의 상세"}
        description={selected ? `${selected.name} · ${selected.email}` : ""}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">문의 내용</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{selected.message}</p>
            </div>

            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">상태</span>
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as ContactMessageStatus)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {toStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <Button type="button" className="w-full" onClick={saveStatus} disabled={isPending}>
              {isPending ? "저장 중..." : "상태 저장"}
            </Button>

            {message ? <p className="text-sm text-muted">{message}</p> : null}
          </div>
        ) : null}
      </EditorDrawer>
    </>
  );
}
