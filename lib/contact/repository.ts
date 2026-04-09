import type { ContactListFilter, PaginatedResult } from "@/types/admin";
import type { ContactMessage } from "@/types/contact";
import type { ContactMessageStatus } from "@/types/db";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  ADMIN_PAGE_SIZE_OPTIONS,
  buildPaginatedResult,
  DEFAULT_ADMIN_PAGE_SIZE,
} from "@/lib/utils/pagination";

type ContactMessageRow = {
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

function normalizeContactStatus(status: string): ContactMessageStatus {
  if (status === "replied") {
    return "replied";
  }

  return "new";
}

function rowToContactMessage(row: ContactMessageRow): ContactMessage {
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

export async function getAdminContactMessages(): Promise<ContactMessage[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("contact_messages")
    .select("id,name,email,subject,message,admin_note,status,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ContactMessageRow[]).map(rowToContactMessage);
}

export async function getAdminContactMessagesPaginated(
  page = 1,
  pageSize = 10,
  statusFilter: ContactListFilter = "all",
): Promise<PaginatedResult<ContactMessage>> {
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
    .from("contact_messages")
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
    (data as ContactMessageRow[]).map(rowToContactMessage),
    safePage,
    safePageSize,
    count ?? 0,
  );
}

export async function getAdminContactMessageById(id: string): Promise<ContactMessage | null> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return null;
  }

  const { data, error } = await service
    .from("contact_messages")
    .select("id,name,email,subject,message,admin_note,status,created_at,updated_at")
    .eq("id", id)
    .maybeSingle<ContactMessageRow>();

  if (error || !data) {
    return null;
  }

  return rowToContactMessage(data);
}

export async function updateAdminContactMessage(
  id: string,
  input: { status: ContactMessageStatus; adminNote: string },
): Promise<RepoResult<ContactMessage>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { error } = await service
    .from("contact_messages")
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

  const row = await getAdminContactMessageById(id);

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
