import type { AboutContent, AboutTechItem, AboutTranslationMap } from "@/types/about";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_ABOUT_PHOTO_URL, DEFAULT_ABOUT_TECH_ITEMS, getHomeIntro } from "@/lib/site/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface AboutRow {
  id: number;
  name: string;
  title: string;
  summary: string;
  about_photo_url: string | null;
  about_tech_items: unknown;
  updated_at: string;
}

export type AdminAboutInput = {
  name: string;
  title: string;
  summary: string;
  aboutPhotoUrl: string;
  aboutTechItems: AboutTechItem[];
  translations?: AboutTranslationMap;
};

interface AboutTranslationRow {
  locale: "ko" | "en" | "ja";
  name: string;
  title: string;
  summary: string;
  about_tech_items: unknown;
}

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

const ABOUT_SELECT_FIELDS = "id,name,title,summary,about_photo_url,about_tech_items,updated_at";

function toAboutTechItems(
  value: unknown,
): AboutTechItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const items: AboutTechItem[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const raw = item as Record<string, unknown>;
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const description = typeof raw.description === "string" ? raw.description.trim() : "";
    const logoUrl = typeof raw.logoUrl === "string" ? raw.logoUrl.trim() : "";

    if (!name || !description || !logoUrl) {
      continue;
    }

    const key = `${name}::${logoUrl}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push({ name, description, logoUrl });
  }

  return items;
}

// 번역 map은 EN/JA만 관리하고, 미입력일 때는 빈 값으로 초기화한다.
function toEmptyTranslations(): AboutTranslationMap {
  return {
    en: {
      name: "",
      title: "",
      summary: "",
      aboutTechItems: [],
    },
    ja: {
      name: "",
      title: "",
      summary: "",
      aboutTechItems: [],
    },
  };
}

// about_translations 조회 결과를 폼 친화적인 맵 구조로 정규화한다.
function toTranslationMap(rows: AboutTranslationRow[] | null | undefined): AboutTranslationMap {
  const base = toEmptyTranslations();

  for (const row of rows ?? []) {
    if (row.locale !== "en" && row.locale !== "ja") {
      continue;
    }

    base[row.locale] = {
      name: row.name?.trim() ?? "",
      title: row.title?.trim() ?? "",
      summary: row.summary?.trim() ?? "",
      aboutTechItems: toAboutTechItems(row.about_tech_items),
    };
  }

  return base;
}

function rowToAbout(row: AboutRow, translations: AboutTranslationMap): AboutContent {
  const aboutTechItems = toAboutTechItems(row.about_tech_items);

  return {
    id: row.id,
    name: row.name,
    title: row.title,
    summary: row.summary,
    aboutPhotoUrl: row.about_photo_url?.trim() || DEFAULT_ABOUT_PHOTO_URL,
    aboutTechItems: aboutTechItems.length > 0 ? aboutTechItems : DEFAULT_ABOUT_TECH_ITEMS,
    updatedAt: row.updated_at,
    translations,
  };
}

function fallbackAbout(locale: Locale): AboutContent {
  const home = getHomeIntro(locale);

  return {
    id: 1,
    name: home.name,
    title: home.title,
    summary: home.summary,
    aboutPhotoUrl: DEFAULT_ABOUT_PHOTO_URL,
    aboutTechItems: DEFAULT_ABOUT_TECH_ITEMS,
    updatedAt: new Date().toISOString(),
    translations: toEmptyTranslations(),
  };
}

// 공개 about는 locale 번역 우선, 미번역 필드는 KO 기본값으로 fallback한다.
export async function getPublishedAboutContent(locale: Locale): Promise<AboutContent> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return fallbackAbout(locale);
  }

  const { data, error } = await service
    .from("about")
    .select(ABOUT_SELECT_FIELDS)
    .eq("id", 1)
    .maybeSingle<AboutRow>();

  if (error || !data) {
    return fallbackAbout(locale);
  }

  const { data: translationRows } = await service
    .from("about_translations")
    .select("locale,name,title,summary,about_tech_items")
    .eq("about_id", 1);
  const translations = toTranslationMap((translationRows ?? []) as AboutTranslationRow[]);
  const base = rowToAbout(data, translations);

  if (locale === "ko") {
    return base;
  }

  const translated = translations[locale];

  if (!translated) {
    return base;
  }
  const translatedTechItems = translated.aboutTechItems.length
    ? translated.aboutTechItems
    : base.aboutTechItems;

  return {
    ...base,
    name: translated.name || base.name,
    title: translated.title || base.title,
    summary: translated.summary || base.summary,
    aboutTechItems: translatedTechItems,
  };
}

// 관리자 about 편집은 base + EN/JA 번역을 함께 내려준다.
export async function getAdminAboutContent(locale: Locale = "ko"): Promise<AboutContent> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return fallbackAbout(locale);
  }

  const { data, error } = await service
    .from("about")
    .select(ABOUT_SELECT_FIELDS)
    .eq("id", 1)
    .maybeSingle<AboutRow>();

  if (error || !data) {
    return fallbackAbout(locale);
  }

  const { data: translationRows } = await service
    .from("about_translations")
    .select("locale,name,title,summary,about_tech_items")
    .eq("about_id", 1);
  return rowToAbout(data, toTranslationMap((translationRows ?? []) as AboutTranslationRow[]));
}

export async function upsertAdminAboutContent(
  input: AdminAboutInput,
): Promise<RepoResult<AboutContent>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { error } = await service.from("about").upsert(
    {
      id: 1,
      name: input.name,
      title: input.title,
      summary: input.summary,
      about_photo_url: input.aboutPhotoUrl,
      about_tech_items: input.aboutTechItems,
    },
    { onConflict: "id" },
  );

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  // EN/JA 번역은 about_translations에 upsert하여 locale별 콘텐츠를 관리한다.
  const translations = {
    ...toEmptyTranslations(),
    ...(input.translations ?? {}),
  };

  // 부분 번역 입력을 허용하되, 누락된 필드는 빈 값으로 정규화해서 저장한다.
  await service.from("about_translations").upsert(
    (["en", "ja"] as const).map((locale) => ({
      about_id: 1,
      locale,
      name: translations[locale]?.name?.trim() ?? "",
      title: translations[locale]?.title?.trim() ?? "",
      summary: translations[locale]?.summary?.trim() ?? "",
      about_tech_items: translations[locale]?.aboutTechItems ?? [],
    })),
    { onConflict: "about_id,locale" },
  );

  return {
    data: await getAdminAboutContent("ko"),
    error: null,
  };
}

// 기존 호출처 호환을 위해 v1 이름을 유지한다.
export const getPublishedProfileContent = getPublishedAboutContent;
export const getAdminProfileContent = getAdminAboutContent;
