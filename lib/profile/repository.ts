import type { Locale } from "@/lib/i18n/config";
import { normalizeAboutTechCategory } from "@/lib/about/tech-categories";
import { DEFAULT_ABOUT_PHOTO_URL, DEFAULT_ABOUT_TECH_ITEMS, getHomeIntro } from "@/lib/site/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type {
  AboutContent,
  AboutTechItem,
  AboutTranslationMap,
} from "@/types/about";

type AboutLocale = "ko" | "en" | "ja";

interface AboutRow {
  id: number;
  locale: AboutLocale;
  name: string;
  title: string;
  summary: string;
  about_photo_url: string | null;
  updated_at: string;
}

interface AboutTechStackRow {
  about_id: number;
  category: string | null;
  name: string | null;
  description: string | null;
  logo_url: string | null;
  order_index: number | null;
}

export type AdminAboutInput = {
  name: string;
  title: string;
  summary: string;
  aboutPhotoUrl: string;
  aboutTechItems: AboutTechItem[];
  translations?: AboutTranslationMap;
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

const ABOUT_LOCALES = ["ko", "en", "ja"] as const;
const ABOUT_ID_BY_LOCALE: Record<AboutLocale, number> = {
  ko: 1,
  en: 2,
  ja: 3,
};
const LOCALE_BY_ABOUT_ID: Record<number, AboutLocale> = {
  1: "ko",
  2: "en",
  3: "ja",
};
const ABOUT_SELECT_FIELDS = "id,locale,name,title,summary,about_photo_url,updated_at";
const ABOUT_TECH_SELECT_FIELDS = "about_id,category,name,description,logo_url,order_index";

function toNormalizedText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

// 기술 항목은 카테고리/이름/설명/로고를 모두 정규화해서 중복 없이 관리한다.
function normalizeAboutTechItems(items: AboutTechItem[]): AboutTechItem[] {
  const seen = new Set<string>();
  const normalized: AboutTechItem[] = [];

  for (const item of items) {
    const category = normalizeAboutTechCategory(item.category);
    const name = item.name.trim();
    const description = item.description.trim();
    const logoUrl = item.logoUrl.trim();

    if (!name || !description || !logoUrl) {
      continue;
    }

    const key = `${category}::${name}::${logoUrl}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push({ category, name, description, logoUrl });
  }

  return normalized;
}

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

// about_tech_stack row를 AboutTechItem 배열로 변환하고 order_index 순서도 유지한다.
function toAboutTechItems(rows: AboutTechStackRow[] | undefined): AboutTechItem[] {
  if (!rows || rows.length === 0) {
    return [];
  }

  return normalizeAboutTechItems(
    rows
      .slice()
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((row) => ({
        category: normalizeAboutTechCategory(toNormalizedText(row.category)),
        name: toNormalizedText(row.name),
        description: toNormalizedText(row.description),
        logoUrl: toNormalizedText(row.logo_url),
      })),
  );
}

function fallbackAbout(locale: Locale): AboutContent {
  const intro = getHomeIntro(locale);

  return {
    id: ABOUT_ID_BY_LOCALE[locale],
    name: intro.name,
    title: intro.title,
    summary: intro.summary,
    aboutPhotoUrl: DEFAULT_ABOUT_PHOTO_URL,
    aboutTechItems: DEFAULT_ABOUT_TECH_ITEMS,
    updatedAt: new Date().toISOString(),
    translations: toEmptyTranslations(),
  };
}

// locale row와 tech stack row를 한 번에 조회해 locale별 맵으로 정리한다.
async function getAboutDataMaps(
  service: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
): Promise<{
  rowsByLocale: Map<AboutLocale, AboutRow>;
  techByLocale: Map<AboutLocale, AboutTechItem[]>;
}> {
  const { data: aboutRows, error: aboutError } = await service
    .from("about")
    .select(ABOUT_SELECT_FIELDS)
    .in("locale", [...ABOUT_LOCALES])
    .order("id", { ascending: true });

  if (aboutError || !aboutRows) {
    return {
      rowsByLocale: new Map(),
      techByLocale: new Map(),
    };
  }

  const rowsByLocale = new Map<AboutLocale, AboutRow>();

  for (const row of aboutRows as AboutRow[]) {
    rowsByLocale.set(row.locale, row);
  }

  const aboutIds = [...rowsByLocale.values()].map((row) => row.id);

  if (aboutIds.length === 0) {
    return {
      rowsByLocale,
      techByLocale: new Map(),
    };
  }

  const { data: techRows } = await service
    .from("about_tech_stack")
    .select(ABOUT_TECH_SELECT_FIELDS)
    .in("about_id", aboutIds)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  const rawTechByLocale = new Map<AboutLocale, AboutTechStackRow[]>();

  for (const row of (techRows ?? []) as AboutTechStackRow[]) {
    const locale = LOCALE_BY_ABOUT_ID[row.about_id];

    if (!locale) {
      continue;
    }

    const current = rawTechByLocale.get(locale) ?? [];
    current.push(row);
    rawTechByLocale.set(locale, current);
  }

  const techByLocale = new Map<AboutLocale, AboutTechItem[]>();

  for (const locale of ABOUT_LOCALES) {
    techByLocale.set(locale, toAboutTechItems(rawTechByLocale.get(locale)));
  }

  return {
    rowsByLocale,
    techByLocale,
  };
}

function buildTranslationMap(
  rowsByLocale: Map<AboutLocale, AboutRow>,
  techByLocale: Map<AboutLocale, AboutTechItem[]>,
): AboutTranslationMap {
  return {
    en: {
      name: toNormalizedText(rowsByLocale.get("en")?.name),
      title: toNormalizedText(rowsByLocale.get("en")?.title),
      summary: toNormalizedText(rowsByLocale.get("en")?.summary),
      aboutTechItems: techByLocale.get("en") ?? [],
    },
    ja: {
      name: toNormalizedText(rowsByLocale.get("ja")?.name),
      title: toNormalizedText(rowsByLocale.get("ja")?.title),
      summary: toNormalizedText(rowsByLocale.get("ja")?.summary),
      aboutTechItems: techByLocale.get("ja") ?? [],
    },
  };
}

// 공개 About은 locale row 우선, 누락 필드는 KO row로 fallback한다.
export async function getPublishedAboutContent(locale: Locale): Promise<AboutContent> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return fallbackAbout(locale);
  }

  const { rowsByLocale, techByLocale } = await getAboutDataMaps(service);
  const koRow = rowsByLocale.get("ko");

  if (!koRow) {
    return fallbackAbout(locale);
  }

  const localeKey: AboutLocale = locale === "ko" ? "ko" : locale === "en" ? "en" : "ja";
  const selectedRow = rowsByLocale.get(localeKey) ?? koRow;
  const koTechItems = techByLocale.get("ko") ?? [];
  const selectedTechItems = techByLocale.get(localeKey) ?? [];
  const translations = buildTranslationMap(rowsByLocale, techByLocale);

  return {
    id: selectedRow.id,
    name: toNormalizedText(selectedRow.name) || koRow.name,
    title: toNormalizedText(selectedRow.title) || koRow.title,
    summary: toNormalizedText(selectedRow.summary) || koRow.summary,
    aboutPhotoUrl:
      toNormalizedText(selectedRow.about_photo_url) ||
      toNormalizedText(koRow.about_photo_url) ||
      DEFAULT_ABOUT_PHOTO_URL,
    aboutTechItems:
      selectedTechItems.length > 0
        ? selectedTechItems
        : koTechItems.length > 0
          ? koTechItems
          : DEFAULT_ABOUT_TECH_ITEMS,
    updatedAt: selectedRow.updated_at || koRow.updated_at || new Date().toISOString(),
    translations,
  };
}

// 관리자 About 편집은 KO 원본 + EN/JA 번역 맵을 함께 내려준다.
export async function getAdminAboutContent(locale: Locale = "ko"): Promise<AboutContent> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return fallbackAbout(locale);
  }

  const { rowsByLocale, techByLocale } = await getAboutDataMaps(service);
  const koRow = rowsByLocale.get("ko");

  if (!koRow) {
    return fallbackAbout(locale);
  }

  const koTechItems = techByLocale.get("ko") ?? [];

  return {
    id: koRow.id,
    name: koRow.name,
    title: koRow.title,
    summary: koRow.summary,
    aboutPhotoUrl: toNormalizedText(koRow.about_photo_url) || DEFAULT_ABOUT_PHOTO_URL,
    aboutTechItems: koTechItems.length > 0 ? koTechItems : DEFAULT_ABOUT_TECH_ITEMS,
    updatedAt: koRow.updated_at,
    translations: buildTranslationMap(rowsByLocale, techByLocale),
  };
}

async function replaceAboutTechItems(
  service: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  aboutId: number,
  items: AboutTechItem[],
) {
  await service.from("about_tech_stack").delete().eq("about_id", aboutId);

  const normalized = normalizeAboutTechItems(items);

  if (normalized.length === 0) {
    return;
  }

  await service.from("about_tech_stack").insert(
    normalized.map((item, index) => ({
      about_id: aboutId,
      category: normalizeAboutTechCategory(item.category),
      name: item.name,
      description: item.description,
      logo_url: item.logoUrl,
      order_index: index,
    })),
  );
}

// 관리자 저장은 KO=about row, EN/JA=about row(각 locale)로 동일 테이블에 통합 저장한다.
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

  const translations = {
    ...toEmptyTranslations(),
    ...(input.translations ?? {}),
  };

  const rows = (["ko", "en", "ja"] as const).map((locale) => {
    if (locale === "ko") {
      return {
        id: ABOUT_ID_BY_LOCALE.ko,
        locale: "ko" as const,
        name: input.name.trim(),
        title: input.title.trim(),
        summary: input.summary.trim(),
        about_photo_url: input.aboutPhotoUrl.trim() || DEFAULT_ABOUT_PHOTO_URL,
      };
    }

    const translated = translations[locale];

    return {
      id: ABOUT_ID_BY_LOCALE[locale],
      locale,
      name: translated?.name?.trim() ?? "",
      title: translated?.title?.trim() ?? "",
      summary: translated?.summary?.trim() ?? "",
      about_photo_url: input.aboutPhotoUrl.trim() || DEFAULT_ABOUT_PHOTO_URL,
    };
  });

  const { error } = await service.from("about").upsert(rows, {
    onConflict: "locale",
  });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  await replaceAboutTechItems(service, ABOUT_ID_BY_LOCALE.ko, input.aboutTechItems);
  await replaceAboutTechItems(
    service,
    ABOUT_ID_BY_LOCALE.en,
    translations.en?.aboutTechItems ?? [],
  );
  await replaceAboutTechItems(
    service,
    ABOUT_ID_BY_LOCALE.ja,
    translations.ja?.aboutTechItems ?? [],
  );

  return {
    data: await getAdminAboutContent("ko"),
    error: null,
  };
}

// 기존 호출처 호환을 위해 v1 이름을 유지한다.
export const getPublishedProfileContent = getPublishedAboutContent;
export const getAdminProfileContent = getAdminAboutContent;
