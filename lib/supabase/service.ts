import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from "@/lib/supabase/env";

type ServiceCacheStrategy = "no-store" | "revalidate";

type ServiceClientOptions = {
  cacheStrategy?: ServiceCacheStrategy;
  revalidateSeconds?: number;
};

const DEFAULT_PUBLIC_REVALIDATE_SECONDS = 60;

// 관리자/쓰기 경로는 항상 최신 값을 읽도록 no-store로 고정한다.
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

// 공개 조회 경로는 짧은 ISR 캐시를 사용해 반복 요청의 TTFB를 낮춘다.
function createRevalidateFetch(revalidateSeconds: number): typeof fetch {
  return (input, init) => {
    const nextConfig = ((init as RequestInit & { next?: Record<string, unknown> })?.next ??
      {}) as Record<string, unknown>;

    return globalThis.fetch(input, {
      ...init,
      cache: "force-cache",
      next: {
        ...nextConfig,
        revalidate: Math.max(1, Math.floor(revalidateSeconds)),
      } as RequestInit["next"],
    });
  };
}

export function createSupabaseServiceClient(options: ServiceClientOptions = {}) {
  const env = getSupabasePublicEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!env || !serviceRoleKey) {
    return null;
  }

  const cacheStrategy = options.cacheStrategy ?? "no-store";
  const revalidateSeconds = options.revalidateSeconds ?? DEFAULT_PUBLIC_REVALIDATE_SECONDS;
  const fetchImpl =
    cacheStrategy === "revalidate" ? createRevalidateFetch(revalidateSeconds) : noStoreFetch;

  return createClient(env.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: fetchImpl,
    },
  });
}
