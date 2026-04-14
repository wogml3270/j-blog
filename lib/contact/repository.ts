import type { ContactListFilter, PaginatedResult } from "@/types/admin";
import type { Contact } from "@/types/contacts";
import type { ContactStatus } from "@/types/db";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  ADMIN_PAGE_SIZE_OPTIONS,
  buildPaginatedResult,
  DEFAULT_ADMIN_PAGE_SIZE,
} from "@/lib/utils/pagination";

type ContactRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  admin_note: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

function normalizeContactStatus(status: string): ContactStatus {
  if (status === "replied") {
    return "replied";
  }

  return "new";
}

function rowToContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    adminNote: row.admin_note,
    status: normalizeContactStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 관리자 문의 전체 목록을 최신순으로 조회한다.
export async function getAdminContacts(): Promise<Contact[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("contacts")
    .select("id,name,email,subject,message,admin_note,status,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ContactRow[]).map(rowToContact);
}

// 관리자 문의 목록을 상태/페이지 기준으로 조회한다.
export async function getAdminContactsPaginated(
  page = 1,
  pageSize = 10,
  statusFilter: ContactListFilter = "all",
): Promise<PaginatedResult<Contact>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return buildPaginatedResult([], page, pageSize, 0);
  }

  const safePage = Math.max(1, Math.floor(page));
  const parsedPageSize = Math.floor(pageSize);
  const safePageSize = ADMIN_PAGE_SIZE_OPTIONS.includes(parsedPageSize as 3 | 5 | 10)
    ? parsedPageSize
    : DEFAULT_ADMIN_PAGE_SIZE;
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = service
    .from("contacts")
    .select("id,name,email,subject,message,admin_note,status,created_at,updated_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (statusFilter === "new" || statusFilter === "replied") {
    query = query.eq("status", statusFilter);
  }

  const { data, error, count } = await query.range(from, to);

  if (error || !data) {
    return buildPaginatedResult([], safePage, safePageSize, 0);
  }

  return buildPaginatedResult(
    (data as ContactRow[]).map(rowToContact),
    safePage,
    safePageSize,
    count ?? 0,
  );
}

// 관리자 문의 상세를 단건 조회한다.
export async function getAdminContactById(id: string): Promise<Contact | null> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return null;
  }

  const { data, error } = await service
    .from("contacts")
    .select("id,name,email,subject,message,admin_note,status,created_at,updated_at")
    .eq("id", id)
    .maybeSingle<ContactRow>();

  if (error || !data) {
    return null;
  }

  return rowToContact(data);
}

// 관리자 문의 상태/메모를 업데이트한다.
export async function updateAdminContact(
  id: string,
  input: { status: ContactStatus; adminNote: string },
): Promise<RepoResult<Contact>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { error } = await service
    .from("contacts")
    .update({
      status: input.status,
      admin_note: input.adminNote,
    })
    .eq("id", id);

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  const row = await getAdminContactById(id);

  if (!row) {
    return {
      data: null,
      error: "Contact message not found.",
    };
  }

  return {
    data: row,
    error: null,
  };
}

// v1 호출처 호환을 위해 기존 함수명을 alias로 유지한다.
export const getAdminContactMessages = getAdminContacts;
export const getAdminContactMessagesPaginated = getAdminContactsPaginated;
export const getAdminContactMessageById = getAdminContactById;
export const updateAdminContactMessage = updateAdminContact;
