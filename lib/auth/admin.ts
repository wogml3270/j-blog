import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const DEFAULT_SUPER_ADMIN_EMAIL = "wogml3270@gmail.com";

type AdminStateReason =
  | "supabase_not_configured"
  | "unauthenticated"
  | "email_not_verified"
  | "not_allowed"
  | "authorized";

export type AdminState = {
  user: User | null;
  isAdmin: boolean;
  reason: AdminStateReason;
  email: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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

export function isUserEmailVerified(user: User): boolean {
  if (Boolean(user.email_confirmed_at)) {
    return true;
  }

  const emailVerifiedFromMetadata = user.user_metadata?.email_verified;
  return emailVerifiedFromMetadata === true;
}

async function isEmailInAllowlistTable(email: string): Promise<boolean> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return false;
  }

  const { data, error } = await service
    .from("admin_allowlist")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data?.email);
}

export async function isAllowedAdminEmail(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);

  if (getAllowedEmailsFromEnv().has(normalized)) {
    return true;
  }

  return isEmailInAllowlistTable(normalized);
}

export async function getAdminState(): Promise<AdminState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      user: null,
      isAdmin: false,
      reason: "supabase_not_configured",
      email: null,
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
      reason: "unauthenticated",
      email: null,
    };
  }

  const email = user.email ? normalizeEmail(user.email) : null;

  if (!email) {
    return {
      user,
      isAdmin: false,
      reason: "not_allowed",
      email: null,
    };
  }

  if (!isUserEmailVerified(user)) {
    return {
      user,
      isAdmin: false,
      reason: "email_not_verified",
      email,
    };
  }

  const allowed = await isAllowedAdminEmail(email);

  if (!allowed) {
    return {
      user,
      isAdmin: false,
      reason: "not_allowed",
      email,
    };
  }

  return {
    user,
    isAdmin: true,
    reason: "authorized",
    email,
  };
}

export async function getAdminGuardForApi() {
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

  return {
    ok: true as const,
    user: state.user,
    state,
  };
}
