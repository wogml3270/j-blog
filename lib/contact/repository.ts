import type { ContactMessage, ContactMessageStatus } from "@/types/content";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
  updated_at: string;
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

function rowToContactMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
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
    .select("id,name,email,subject,message,status,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ContactMessageRow[]).map(rowToContactMessage);
}

export async function getAdminContactMessageById(id: string): Promise<ContactMessage | null> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return null;
  }

  const { data, error } = await service
    .from("contact_messages")
    .select("id,name,email,subject,message,status,created_at,updated_at")
    .eq("id", id)
    .maybeSingle<ContactMessageRow>();

  if (error || !data) {
    return null;
  }

  return rowToContactMessage(data);
}

export async function updateAdminContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
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
    .update({ status })
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
