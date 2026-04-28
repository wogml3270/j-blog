import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { normalizeAvatarUrl } from "@/lib/utils/avatar-url";
import type { AdminPermission, AdminRole } from "@/types/admin";

const DEFAULT_SUPER_ADMIN_EMAIL = "wogml3270@gmail.com";

type AdminStateReason =
  | "supabase_not_configured"
  | "unauthenticated"
  | "email_not_verified"
  | "not_allowed"
  | "insufficient_permission"
  | "authorized";

export type AdminState = {
  user: User | null;
  isAdmin: boolean;
  role: AdminRole | null;
  canReadAdmin: boolean;
  canWriteAdmin: boolean;
  canManageAdmin: boolean;
  reason: AdminStateReason;
  email: string | null;
  expiresAt: string | null;
  avatarUrl: string | null;
};

type AdminAllowlistRow = {
  email: string;
  is_super_admin: boolean;
  role: string | null;
  is_active: boolean | null;
  expires_at: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// 사용자 메타데이터에서 프로필 이미지를 우선순위대로 추출한다.
function getAvatarFromUser(user: User | null): string | null {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata ?? {};
  const candidates = [metadata.avatar_url, metadata.picture];

  for (const value of candidates) {
    const normalized = normalizeAvatarUrl(value);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function getAllowedEmailsFromEnv(): Set<string> {
  const values = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeEmail);

  values.push(DEFAULT_SUPER_ADMIN_EMAIL);
  return new Set(values);
}

function normalizeRole(value: string | null, isSuperAdmin: boolean): AdminRole {
  if (isSuperAdmin) {
    return "super_admin";
  }

  if (value === "super_admin" || value === "admin" || value === "test_admin") {
    return value;
  }

  return "admin";
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }

  const date = new Date(expiresAt);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() <= Date.now();
}

async function getAllowlistEntry(email: string): Promise<AdminAllowlistRow | null> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return null;
  }

  const { data, error } = await service
    .from("admin_allowlist")
    .select("email,is_super_admin,role,is_active,expires_at")
    .eq("email", email)
    .maybeSingle<AdminAllowlistRow>();

  if (error || !data) {
    return null;
  }

  return data;
}

export function isUserEmailVerified(user: User): boolean {
  if (Boolean(user.email_confirmed_at)) {
    return true;
  }

  const emailVerifiedFromMetadata = user.user_metadata?.email_verified;
  return emailVerifiedFromMetadata === true;
}

async function isEmailInAllowlistTable(email: string): Promise<boolean> {
  const entry = await getAllowlistEntry(email);

  if (!entry) {
    return false;
  }

  if (entry.is_active === false) {
    return false;
  }

  return !isExpired(entry.expires_at);
}

export async function isAllowedAdminEmail(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);

  const allowlistEntry = await getAllowlistEntry(normalized);

  if (allowlistEntry) {
    if (allowlistEntry.is_active === false) {
      return false;
    }

    return !isExpired(allowlistEntry.expires_at);
  }

  if (getAllowedEmailsFromEnv().has(normalized)) {
    return true;
  }

  return isEmailInAllowlistTable(normalized);
}

async function resolveAdminRole(email: string): Promise<{ role: AdminRole | null; expiresAt: string | null }> {
  const normalized = normalizeEmail(email);
  const allowlistEntry = await getAllowlistEntry(normalized);

  if (allowlistEntry) {
    if (allowlistEntry.is_active === false || isExpired(allowlistEntry.expires_at)) {
      return {
        role: null,
        expiresAt: allowlistEntry.expires_at,
      };
    }

    return {
      role: normalizeRole(allowlistEntry.role, allowlistEntry.is_super_admin),
      expiresAt: allowlistEntry.expires_at,
    };
  }

  if (normalized === normalizeEmail(DEFAULT_SUPER_ADMIN_EMAIL)) {
    return {
      role: "super_admin",
      expiresAt: null,
    };
  }

  if (getAllowedEmailsFromEnv().has(normalized)) {
    return {
      role: "admin",
      expiresAt: null,
    };
  }

  return {
    role: null,
    expiresAt: null,
  };
}

export async function getAdminState(): Promise<AdminState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      user: null,
      isAdmin: false,
      role: null,
      canReadAdmin: false,
      canWriteAdmin: false,
      canManageAdmin: false,
      reason: "supabase_not_configured",
      email: null,
      expiresAt: null,
      avatarUrl: null,
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      isAdmin: false,
      role: null,
      canReadAdmin: false,
      canWriteAdmin: false,
      canManageAdmin: false,
      reason: "unauthenticated",
      email: null,
      expiresAt: null,
      avatarUrl: null,
    };
  }

  const email = user.email ? normalizeEmail(user.email) : null;

  if (!email) {
    return {
      user,
      isAdmin: false,
      role: null,
      canReadAdmin: false,
      canWriteAdmin: false,
      canManageAdmin: false,
      reason: "not_allowed",
      email: null,
      expiresAt: null,
      avatarUrl: getAvatarFromUser(user),
    };
  }

  if (!isUserEmailVerified(user)) {
    return {
      user,
      isAdmin: false,
      role: null,
      canReadAdmin: false,
      canWriteAdmin: false,
      canManageAdmin: false,
      reason: "email_not_verified",
      email,
      expiresAt: null,
      avatarUrl: getAvatarFromUser(user),
    };
  }

  const resolved = await resolveAdminRole(email);

  if (!resolved.role) {
    return {
      user,
      isAdmin: false,
      role: null,
      canReadAdmin: false,
      canWriteAdmin: false,
      canManageAdmin: false,
      reason: "not_allowed",
      email,
      expiresAt: resolved.expiresAt,
      avatarUrl: getAvatarFromUser(user),
    };
  }

  const canWriteAdmin = resolved.role !== "test_admin";
  const canManageAdmin = resolved.role === "super_admin";

  return {
    user,
    isAdmin: true,
    role: resolved.role,
    canReadAdmin: true,
    canWriteAdmin,
    canManageAdmin,
    reason: "authorized",
    email,
    expiresAt: resolved.expiresAt,
    avatarUrl: getAvatarFromUser(user),
  };
}

export async function getAdminGuardForApi(requiredPermission: AdminPermission = "read") {
  const state = await getAdminState();

  if (!state.user) {
    return {
      ok: false as const,
      status: 401,
      error: "Authentication is required.",
      state,
    };
  }

  if (!state.isAdmin) {
    const error =
      state.reason === "email_not_verified"
        ? "Your email is not verified by the provider."
        : "This account is not allowed to access admin features.";

    return {
      ok: false as const,
      status: 403,
      error,
      state,
    };
  }

  const hasPermission =
    requiredPermission === "read"
      ? state.canReadAdmin
      : requiredPermission === "write"
        ? state.canWriteAdmin
        : state.canManageAdmin;

  if (!hasPermission) {
    const error =
      requiredPermission === "manage_admin"
        ? "Only super admin can access this resource."
        : requiredPermission === "write"
          ? "This account is read-only and cannot modify admin data."
          : "This account is not allowed to access admin resources.";

    return {
      ok: false as const,
      status: 403,
      error,
      state: {
        ...state,
        reason: "insufficient_permission" as const,
      },
    };
  }

  return {
    ok: true as const,
    user: state.user,
    state,
  };
}
