"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EditorDrawer } from "@/components/admin/common/editor-drawer";
import { ManagerList, ManagerListRow } from "@/components/admin/common/manager-list";
import { ManagerShell } from "@/components/admin/common/manager-shell";
import { AdminPagination } from "@/components/admin/common/pagination";
import { StatusRadioGroup } from "@/components/admin/common/status-radio-group";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "@/components/ui/icons/filter-icon";
import { RowsIcon } from "@/components/ui/icons/rows-icon";
import { SurfaceCard } from "@/components/ui/surface-card";
import { ADMIN_PAGE_SIZE_OPTIONS } from "@/lib/utils/pagination";
import { cn } from "@/lib/utils/cn";
import { useAdminDetailStore } from "@/stores/admin-detail";
import { useAdminListUiStore } from "@/stores/admin-list-ui";
import type { ContactListFilter, PaginatedResult } from "@/types/admin";
import type { ContactMessage } from "@/types/contact";
import type { ContactMessageStatus } from "@/types/db";
import type { ContactManagerProps, StatusOption } from "@/types/ui";

const STATUS_OPTIONS: StatusOption<ContactMessageStatus>[] = [
  { value: "new", label: "신규" },
  { value: "replied", label: "답변완료" },
];

const CONTACT_FILTER_OPTIONS: Array<{ value: ContactListFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "new", label: "신규" },
  { value: "replied", label: "답변완료" },
];

function statusBadge(status: ContactMessageStatus): string {
  if (status === "replied") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }

  return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
}

function toStatusLabel(status: ContactMessageStatus): string {
  if (status === "replied") {
    return "답변완료";
  }

  return "신규";
}

// 관리 화면에 맞춰 접수/수정 시간을 동일 포맷으로 표현한다.
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

// 문의 상태별 페이지 응답을 재사용 가능한 함수로 분리한다.
async function fetchContactPage(
  status: ContactMessageStatus,
  page: number,
  pageSize: number,
): Promise<PaginatedResult<ContactMessage>> {
  const response = await fetch(
    `/api/admin/contact?page=${page}&pageSize=${pageSize}&status=${status}`,
    { method: "GET" },
  );

  if (!response.ok) {
    throw new Error("문의 목록을 불러오지 못했습니다.");
  }

  return (await response.json()) as PaginatedResult<ContactMessage>;
}

export function ContactManager({
  initialNewPage,
  initialRepliedPage,
  initialStatusFilter = "all",
  initialSelectedId = null,
}: ContactManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [newContacts, setNewContacts] = useState<ContactMessage[]>(initialNewPage.items);
  const [newPage, setNewPage] = useState(initialNewPage.page);
  const [newTotal, setNewTotal] = useState(initialNewPage.total);
  const [newTotalPages, setNewTotalPages] = useState(initialNewPage.totalPages);
  const [repliedContacts, setRepliedContacts] = useState<ContactMessage[]>(
    initialRepliedPage.items,
  );
  const [repliedPage, setRepliedPage] = useState(initialRepliedPage.page);
  const [repliedTotal, setRepliedTotal] = useState(initialRepliedPage.total);
  const [repliedTotalPages, setRepliedTotalPages] = useState(initialRepliedPage.totalPages);
  const [pageSize, setPageSize] = useState(initialNewPage.pageSize);
  const [statusFilter, setStatusFilter] = useState<ContactListFilter>(initialStatusFilter);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [nextStatus, setNextStatus] = useState<ContactMessageStatus>("new");
  const [adminNote, setAdminNote] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasAppliedInitialSelection = useRef(false);

  const openDetailStore = useAdminDetailStore((state) => state.open);
  const closeDetailStore = useAdminDetailStore((state) => state.close);
  const savedPageSize = useAdminListUiStore((state) => state.pageSizeByScope.contact);
  const setSavedPageSize = useAdminListUiStore((state) => state.setPageSize);

  // URL 쿼리(newPage/repliedPage/pageSize/id)와 현재 리스트/상세 상태를 항상 맞춘다.
  const syncQuery = useCallback(
    (next: {
      id?: string | null;
      newPage?: number;
      repliedPage?: number;
      pageSize?: number;
      status?: ContactListFilter;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      params.set("newPage", String(next.newPage ?? newPage));
      params.set("repliedPage", String(next.repliedPage ?? repliedPage));
      params.set("pageSize", String(next.pageSize ?? pageSize));
      const nextStatus = next.status ?? statusFilter;

      if (nextStatus === "all") {
        params.delete("status");
      } else {
        params.set("status", nextStatus);
      }

      if (next.id) {
        params.set("id", next.id);
      } else {
        params.delete("id");
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [newPage, pageSize, pathname, repliedPage, router, searchParams, statusFilter],
  );

  // 상세 패널을 열 때 상태/메모의 기준값을 동기화해 dirty 판단 기준을 고정한다.
  const openDetail = useCallback(
    (contact: ContactMessage) => {
      setSelected(contact);
      setNextStatus(contact.status);
      setAdminNote(contact.adminNote);
      setMessage(null);
      openDetailStore("contact", contact.id);
      syncQuery({ id: contact.id });
    },
    [openDetailStore, syncQuery],
  );

  const closeDetail = () => {
    setSelected(null);
    setAdminNote("");
    setMessage(null);
    closeDetailStore("contact");
    syncQuery({ id: null });
  };

  // 상태별 리스트를 각각 조회해 섹션별 페이지네이션 상태를 독립적으로 유지한다.
  const loadContacts = useCallback(
    async (
      nextNewPage = newPage,
      nextRepliedPage = repliedPage,
      nextPageSize = pageSize,
      nextStatusFilter: ContactListFilter = statusFilter,
    ) => {
      const [newPayload, repliedPayload] = await Promise.all([
        fetchContactPage("new", nextNewPage, nextPageSize),
        fetchContactPage("replied", nextRepliedPage, nextPageSize),
      ]);

      if (
        (newPayload.items.length === 0 && newPayload.total > 0 && nextNewPage > 1) ||
        (repliedPayload.items.length === 0 && repliedPayload.total > 0 && nextRepliedPage > 1)
      ) {
        const adjustedNewPage =
          newPayload.items.length === 0 && newPayload.total > 0 && nextNewPage > 1
            ? nextNewPage - 1
            : nextNewPage;
        const adjustedRepliedPage =
          repliedPayload.items.length === 0 && repliedPayload.total > 0 && nextRepliedPage > 1
            ? nextRepliedPage - 1
            : nextRepliedPage;

        await loadContacts(adjustedNewPage, adjustedRepliedPage, nextPageSize, nextStatusFilter);
        return;
      }

      setNewContacts(newPayload.items ?? []);
      setNewPage(newPayload.page);
      setNewTotal(newPayload.total);
      setNewTotalPages(newPayload.totalPages);

      setRepliedContacts(repliedPayload.items ?? []);
      setRepliedPage(repliedPayload.page);
      setRepliedTotal(repliedPayload.total);
      setRepliedTotalPages(repliedPayload.totalPages);

      setPageSize(newPayload.pageSize);
      setStatusFilter(nextStatusFilter);
      syncQuery({
        id: null,
        newPage: newPayload.page,
        repliedPage: repliedPayload.page,
        pageSize: newPayload.pageSize,
        status: nextStatusFilter,
      });
    },
    [newPage, pageSize, repliedPage, statusFilter, syncQuery],
  );

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

      await loadContacts(newPage, repliedPage, pageSize, statusFilter);
      setMessage("문의 상태와 관리자 메모를 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  const onChangeNewPage = async (nextPage: number) => {
    if (nextPage === newPage || nextPage < 1 || nextPage > newTotalPages) {
      return;
    }

    closeDetailStore("contact");
    setSelected(null);
    await loadContacts(nextPage, repliedPage, pageSize, statusFilter);
  };

  const onChangeRepliedPage = async (nextPage: number) => {
    if (nextPage === repliedPage || nextPage < 1 || nextPage > repliedTotalPages) {
      return;
    }

    closeDetailStore("contact");
    setSelected(null);
    await loadContacts(newPage, nextPage, pageSize, statusFilter);
  };

  const onChangePageSize = async (nextPageSize: number) => {
    if (nextPageSize === pageSize) {
      return;
    }

    setSavedPageSize("contact", nextPageSize);
    closeDetailStore("contact");
    setSelected(null);
    await loadContacts(1, 1, nextPageSize, statusFilter);
  };

  const onChangeStatusFilter = async (nextStatusFilter: ContactListFilter) => {
    if (nextStatusFilter === statusFilter) {
      return;
    }

    closeDetailStore("contact");
    setSelected(null);
    await loadContacts(1, 1, pageSize, nextStatusFilter);
  };

  useEffect(() => {
    // URL에 pageSize가 없으면 마지막으로 선택한 표시 개수를 우선 적용한다.
    if (searchParams.get("pageSize")) {
      return;
    }

    if (savedPageSize === pageSize) {
      return;
    }

    void loadContacts(1, 1, savedPageSize, statusFilter);
  }, [loadContacts, pageSize, savedPageSize, searchParams, statusFilter]);

  useEffect(() => {
    // 딥링크(id 쿼리) 진입 시 최초 한 번만 해당 항목을 자동 오픈한다.
    if (hasAppliedInitialSelection.current || !initialSelectedId) {
      return;
    }

    const target = [...newContacts, ...repliedContacts].find(
      (item) => item.id === initialSelectedId,
    );

    if (!target) {
      syncQuery({ id: null });
      hasAppliedInitialSelection.current = true;
      return;
    }

    openDetail(target);
    hasAppliedInitialSelection.current = true;
  }, [initialSelectedId, newContacts, openDetail, repliedContacts, syncQuery]);

  const isDirty =
    selected !== null && (selected.status !== nextStatus || selected.adminNote !== adminNote);
  const showNewSection = statusFilter !== "replied";
  const showRepliedSection = statusFilter !== "new";
  const summaryTotal =
    statusFilter === "new"
      ? newTotal
      : statusFilter === "replied"
        ? repliedTotal
        : newTotal + repliedTotal;

  return (
    <>
      <ManagerShell
        motion
        summary={`문의함 ${summaryTotal}건`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <FilterIcon className="h-3.5 w-3.5 text-muted" />
              <span className="sr-only">상태 필터</span>
              <select
                className="bg-transparent text-sm outline-none"
                value={statusFilter}
                aria-label="상태 필터"
                onChange={(event) =>
                  void onChangeStatusFilter(event.target.value as ContactListFilter)
                }
              >
                {CONTACT_FILTER_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <RowsIcon className="h-3.5 w-3.5 text-muted" />
              <span className="sr-only">표시 개수</span>
              <select
                className="bg-transparent text-sm outline-none"
                value={String(pageSize)}
                aria-label="페이지 표시 개수"
                onChange={(event) => void onChangePageSize(Number(event.target.value))}
              >
                {ADMIN_PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}줄씩 보기
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      >
        {showNewSection ? (
          <>
            <section className="space-y-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                신규 ({newTotal})
              </h2>
              <ManagerList hasItems={newContacts.length > 0} emptyLabel="신규 문의가 없습니다.">
                {newContacts.map((contact) => (
                  <ManagerListRow key={contact.id} onClick={() => openDetail(contact)}>
                    <>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          statusBadge(contact.status),
                        )}
                      >
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
                      <span className="hidden max-w-[180px] truncate text-xs text-muted sm:inline">
                        {contact.email}
                      </span>
                      <span className="text-xs text-muted">{toDisplayDate(contact.createdAt)}</span>
                    </>
                  </ManagerListRow>
                ))}
              </ManagerList>
            </section>

            <AdminPagination
              page={newPage}
              totalPages={newTotalPages}
              total={newTotal}
              onPageChange={onChangeNewPage}
            />
          </>
        ) : null}

        {showRepliedSection ? (
          <>
            <section className="space-y-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                답변완료 ({repliedTotal})
              </h2>
              <ManagerList
                hasItems={repliedContacts.length > 0}
                emptyLabel="답변완료 상태의 문의가 없습니다."
              >
                {repliedContacts.map((contact) => (
                  <ManagerListRow key={contact.id} onClick={() => openDetail(contact)}>
                    <>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          statusBadge(contact.status),
                        )}
                      >
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
                      <span className="hidden max-w-[180px] truncate text-xs text-muted sm:inline">
                        {contact.email}
                      </span>
                      <span className="text-xs text-muted">{toDisplayDate(contact.createdAt)}</span>
                    </>
                  </ManagerListRow>
                ))}
              </ManagerList>
            </section>

            <AdminPagination
              page={repliedPage}
              totalPages={repliedTotalPages}
              total={repliedTotal}
              onPageChange={onChangeRepliedPage}
            />
          </>
        ) : null}
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
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                문의자 정보
              </p>
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
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                문의 내용
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {selected.message}
              </p>
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
