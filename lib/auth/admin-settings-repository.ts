import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type {
  AdminAccessRequest,
  AdminAccessRequestStatus,
  AdminMember,
  AdminRole,
} from "@/types/admin";

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

type AdminAccessRequestRow = {
  id: string;
  user_id: string;
  email: string;
  message: string;
  status: string;
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  test_admin_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type AdminAllowlistRow = {
  id: string;
  email: string;
  is_super_admin: boolean;
  role: string | null;
  is_active: boolean | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeRole(value: string | null, isSuperAdmin: boolean): AdminRole {
  if (isSuperAdmin || value === "super_admin") {
    return "super_admin";
  }

  if (value === "test_admin") {
    return "test_admin";
  }

  return "admin";
}

function normalizeRequestStatus(value: string): AdminAccessRequestStatus {
  if (value === "approved" || value === "rejected") {
    return value;
  }

  return "pending";
}

function rowToAccessRequest(row: AdminAccessRequestRow): AdminAccessRequest {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    message: row.message,
    status: normalizeRequestStatus(row.status),
    requestedAt: row.requested_at,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    testAdminExpiresAt: row.test_admin_expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToMember(row: AdminAllowlistRow): AdminMember {
  return {
    id: row.id,
    email: row.email,
    isSuperAdmin: row.is_super_admin,
    role: normalizeRole(row.role, row.is_super_admin),
    isActive: row.is_active ?? true,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getLatestAdminAccessRequestByEmail(email: string): Promise<AdminAccessRequest | null> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);
  const { data, error } = await service
    .from("admin_access_requests")
    .select(
      "id,user_id,email,message,status,requested_at,resolved_at,resolved_by,test_admin_expires_at,created_at,updated_at",
    )
    .eq("email", normalizedEmail)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle<AdminAccessRequestRow>();

  if (error || !data) {
    return null;
  }

  return rowToAccessRequest(data);
}

export async function createAdminAccessRequest(input: {
  userId: string;
  email: string;
  message: string;
}): Promise<RepoResult<AdminAccessRequest>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const normalizedEmail = normalizeEmail(input.email);
  const existing = await getLatestAdminAccessRequestByEmail(normalizedEmail);

  if (existing && existing.status === "pending") {
    return {
      data: existing,
      error: null,
    };
  }

  const { data, error } = await service
    .from("admin_access_requests")
    .insert({
      user_id: input.userId,
      email: normalizedEmail,
      message: input.message.trim(),
      status: "pending",
      requested_at: new Date().toISOString(),
    })
    .select(
      "id,user_id,email,message,status,requested_at,resolved_at,resolved_by,test_admin_expires_at,created_at,updated_at",
    )
    .single<AdminAccessRequestRow>();

  if (error || !data) {
    return {
      data: null,
      error: error?.message ?? "Failed to create admin access request.",
    };
  }

  return {
    data: rowToAccessRequest(data),
    error: null,
  };
}

export async function getAdminAccessRequests(
  status?: AdminAccessRequestStatus,
): Promise<AdminAccessRequest[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  let query = service
    .from("admin_access_requests")
    .select(
      "id,user_id,email,message,status,requested_at,resolved_at,resolved_by,test_admin_expires_at,created_at,updated_at",
    )
    .order("requested_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return (data as AdminAccessRequestRow[]).map(rowToAccessRequest);
}

export async function getPendingAdminAccessRequestsCount(): Promise<number> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return 0;
  }

  const { count, error } = await service
    .from("admin_access_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function resolveAdminAccessRequest(input: {
  id: string;
  status: Extract<AdminAccessRequestStatus, "approved" | "rejected">;
  resolvedBy: string;
  role?: AdminRole;
  testAdminExpiresAt?: string | null;
}): Promise<RepoResult<AdminAccessRequest>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data: currentRow, error: currentError } = await service
    .from("admin_access_requests")
    .select(
      "id,user_id,email,message,status,requested_at,resolved_at,resolved_by,test_admin_expires_at,created_at,updated_at",
    )
    .eq("id", input.id)
    .maybeSingle<AdminAccessRequestRow>();

  if (currentError || !currentRow) {
    return {
      data: null,
      error: currentError?.message ?? "Request not found.",
    };
  }

  if (input.status === "approved") {
    const nextRole = input.role ?? "test_admin";
    const nextExpiresAt =
      nextRole === "test_admin" ? input.testAdminExpiresAt ?? null : null;
    const normalizedEmail = normalizeEmail(currentRow.email);

    const { error: upsertError } = await service.from("admin_allowlist").upsert(
      {
        email: normalizedEmail,
        is_super_admin: nextRole === "super_admin",
        role: nextRole,
        is_active: true,
        expires_at: nextExpiresAt,
      },
      { onConflict: "email" },
    );

    if (upsertError) {
      return {
        data: null,
        error: upsertError.message,
      };
    }
  }

  const { data, error } = await service
    .from("admin_access_requests")
    .update({
      status: input.status,
      resolved_at: new Date().toISOString(),
      resolved_by: input.resolvedBy,
      test_admin_expires_at: input.status === "approved" ? input.testAdminExpiresAt ?? null : null,
    })
    .eq("id", input.id)
    .select(
      "id,user_id,email,message,status,requested_at,resolved_at,resolved_by,test_admin_expires_at,created_at,updated_at",
    )
    .single<AdminAccessRequestRow>();

  if (error || !data) {
    return {
      data: null,
      error: error?.message ?? "Failed to resolve request.",
    };
  }

  return {
    data: rowToAccessRequest(data),
    error: null,
  };
}

export async function getAdminMembers(): Promise<AdminMember[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("admin_allowlist")
    .select("id,email,is_super_admin,role,is_active,expires_at,created_at,updated_at")
    .order("is_super_admin", { ascending: false })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as AdminAllowlistRow[]).map(rowToMember);
}

export async function updateAdminMember(input: {
  id: string;
  role: AdminRole;
  isActive: boolean;
  expiresAt: string | null;
}): Promise<RepoResult<AdminMember>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const nextRole = input.role;
  const nextExpiresAt = nextRole === "test_admin" ? input.expiresAt : null;
  const { data, error } = await service
    .from("admin_allowlist")
    .update({
      role: nextRole,
      is_super_admin: nextRole === "super_admin",
      is_active: input.isActive,
      expires_at: nextExpiresAt,
    })
    .eq("id", input.id)
    .select("id,email,is_super_admin,role,is_active,expires_at,created_at,updated_at")
    .maybeSingle<AdminAllowlistRow>();

  if (error || !data) {
    return {
      data: null,
      error: error?.message ?? "Failed to update admin member.",
    };
  }

  return {
    data: rowToMember(data),
    error: null,
  };
}
