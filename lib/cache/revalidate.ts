import { revalidatePath } from "next/cache";
import { locales, withLocalePath, withLocaleRoutePath } from "@/lib/i18n/config";
import { encodeSlugSegment } from "@/lib/utils/slug";

const DEFAULT_REVALIDATE_ENDPOINT = "/api/internal/revalidate";

type RevalidateOptions = {
  propagateRemote?: boolean;
};

function normalizePaths(paths: string[]): string[] {
  return [...new Set(paths.map((path) => path.trim()).filter(Boolean))];
}

// 공개 URL(/blog)과 내부 locale 경로(/ko/blog)를 모두 재검증 대상으로 포함한다.
function buildLocaleRevalidatePaths(locale: (typeof locales)[number], pathname: string): string[] {
  return normalizePaths([withLocalePath(locale, pathname), withLocaleRoutePath(locale, pathname)]);
}

// 현재 런타임 인스턴스의 Next 캐시를 즉시 무효화한다.
export function revalidatePathsLocally(paths: string[]) {
  for (const path of normalizePaths(paths)) {
    revalidatePath(path);
  }
}

function getRemoteRevalidateConfig() {
  const baseUrl = process.env.REVALIDATE_TARGET_URL?.trim() || "";
  const secret = process.env.REVALIDATE_SECRET?.trim() || "";

  if (!baseUrl || !secret) {
    return null;
  }

  return {
    endpoint: `${baseUrl.replace(/\/+$/, "")}${DEFAULT_REVALIDATE_ENDPOINT}`,
    secret,
  };
}

// 로컬 개발에서 수정 시 프로덕션 인스턴스에도 동일 revalidate를 전달한다.
async function propagateRevalidateToRemote(paths: string[]) {
  const config = getRemoteRevalidateConfig();

  if (!config || paths.length === 0) {
    return;
  }

  try {
    await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": config.secret,
      },
      body: JSON.stringify({ paths }),
      cache: "no-store",
    });
  } catch {
    // 원격 재검증 실패는 저장 실패로 간주하지 않는다.
  }
}

async function revalidateWithStrategy(paths: string[], options: RevalidateOptions = {}) {
  const normalized = normalizePaths(paths);
  revalidatePathsLocally(normalized);

  // 운영 인스턴스에서는 로컬 revalidate만 수행하고, 개발 인스턴스에서만 원격 전파를 시도한다.
  if (options.propagateRemote === false || process.env.NODE_ENV === "production") {
    return;
  }

  await propagateRevalidateToRemote(normalized);
}

export async function revalidateHomePaths() {
  const paths = locales.flatMap((locale) => buildLocaleRevalidatePaths(locale, "/"));
  await revalidateWithStrategy(paths);
}

// 블로그 관련 정적 경로를 locale별로 일괄 revalidate 한다.
export async function revalidateBlogPaths(slug?: string) {
  const paths: string[] = [];

  for (const locale of locales) {
    paths.push(...buildLocaleRevalidatePaths(locale, "/"));
    paths.push(...buildLocaleRevalidatePaths(locale, "/blog"));

    if (slug) {
      paths.push(...buildLocaleRevalidatePaths(locale, `/blog/${encodeSlugSegment(slug)}`));
    }
  }

  await revalidateWithStrategy(paths);
}

// 프로젝트 관련 정적 경로를 locale별로 일괄 revalidate 한다.
export async function revalidateProjectPaths(slug?: string) {
  const paths: string[] = [];

  for (const locale of locales) {
    paths.push(...buildLocaleRevalidatePaths(locale, "/"));
    paths.push(...buildLocaleRevalidatePaths(locale, "/projects"));

    if (slug) {
      paths.push(...buildLocaleRevalidatePaths(locale, `/projects/${encodeSlugSegment(slug)}`));
    }
  }

  await revalidateWithStrategy(paths);
}

export async function revalidateProfilePaths() {
  const paths: string[] = [];

  for (const locale of locales) {
    paths.push(...buildLocaleRevalidatePaths(locale, "/"));
    paths.push(...buildLocaleRevalidatePaths(locale, "/about"));
  }

  await revalidateWithStrategy(paths);
}
