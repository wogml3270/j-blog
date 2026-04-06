export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

function readPublicKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    null
  );
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const publishableKey = readPublicKey();

  if (!url || !publishableKey) {
    return null;
  }

  return {
    url,
    publishableKey,
  };
}

export function getSupabaseServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
}

export function hasSupabasePublicEnv(): boolean {
  return Boolean(getSupabasePublicEnv());
}
