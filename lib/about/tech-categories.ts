import type { Locale } from "@/lib/i18n/config";
import type { AboutTechCategory } from "@/types/about";

export const ABOUT_TECH_CATEGORY_ORDER: AboutTechCategory[] = [
  "frontend",
  "backend",
  "database",
  "infrastructure",
  "version_control",
  "other",
];

const ABOUT_TECH_CATEGORY_LABELS: Record<
  AboutTechCategory,
  {
    ko: string;
    en: string;
    ja: string;
  }
> = {
  frontend: {
    ko: "프론트엔드",
    en: "Frontend",
    ja: "フロントエンド",
  },
  backend: {
    ko: "백엔드",
    en: "Backend",
    ja: "バックエンド",
  },
  database: {
    ko: "데이터베이스",
    en: "Database",
    ja: "データベース",
  },
  infrastructure: {
    ko: "인프라/운영",
    en: "Infrastructure",
    ja: "インフラ/運用",
  },
  version_control: {
    ko: "버전 관리",
    en: "Version Control",
    ja: "バージョン管理",
  },
  other: {
    ko: "기타",
    en: "Other",
    ja: "その他",
  },
};

const LEGACY_CATEGORY_MAP: Array<{
  keywords: string[];
  value: AboutTechCategory;
}> = [
  { keywords: ["front", "프론트", "ui"], value: "frontend" },
  { keywords: ["back", "백엔", "server", "api"], value: "backend" },
  { keywords: ["data", "db", "sql", "database", "데이터"], value: "database" },
  { keywords: ["infra", "cloud", "devops", "운영", "인프라", "deploy"], value: "infrastructure" },
  { keywords: ["version", "git", "형상", "버전"], value: "version_control" },
];

export function isAboutTechCategory(value: string): value is AboutTechCategory {
  return ABOUT_TECH_CATEGORY_ORDER.includes(value as AboutTechCategory);
}

// 기존 자유 문자열 카테고리를 고정 enum으로 정규화한다.
export function normalizeAboutTechCategory(value: string | null | undefined): AboutTechCategory {
  const trimmed = (value ?? "").trim();

  if (!trimmed) {
    return "other";
  }

  if (isAboutTechCategory(trimmed)) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();

  for (const item of LEGACY_CATEGORY_MAP) {
    if (item.keywords.some((keyword) => lower.includes(keyword.toLowerCase()))) {
      return item.value;
    }
  }

  return "other";
}

export function getAboutTechCategoryLabel(locale: Locale, category: AboutTechCategory): string {
  return ABOUT_TECH_CATEGORY_LABELS[category][locale];
}

export function getAboutTechCategoryLabelMap(
  locale: Locale,
): Record<AboutTechCategory, string> {
  return {
    frontend: ABOUT_TECH_CATEGORY_LABELS.frontend[locale],
    backend: ABOUT_TECH_CATEGORY_LABELS.backend[locale],
    database: ABOUT_TECH_CATEGORY_LABELS.database[locale],
    infrastructure: ABOUT_TECH_CATEGORY_LABELS.infrastructure[locale],
    version_control: ABOUT_TECH_CATEGORY_LABELS.version_control[locale],
    other: ABOUT_TECH_CATEGORY_LABELS.other[locale],
  };
}

