import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from "@/lib/supabase/env";

// 서버에서 수행하는 Supabase 조회는 항상 최신 값을 읽도록 no-store로 고정한다.
const noStoreFetch: typeof fetch = (input, init) => {
  const nextConfig = ((init as RequestInit & { next?: Record<string, unknown> })?.next ??
    {}) as Record<string, unknown>;

  return globalThis.fetch(input, {
    ...init,
    cache: "no-store",
    next: {
      ...nextConfig,
      revalidate: 0,
    } as RequestInit["next"],
  });
};

export function createSupabaseServiceClient() {
  const env = getSupabasePublicEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!env || !serviceRoleKey) {
    return null;
  }

  return createClient(env.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: noStoreFetch,
    },
  });
}
