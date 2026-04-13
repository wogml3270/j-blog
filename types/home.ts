import type { Locale } from "@/lib/i18n/config";

export type HomeHighlightSourceType = "project" | "post";
export type HomeSourceFilter = "all" | HomeHighlightSourceType;
export type HomeActiveFilter = "all" | "active" | "inactive";

export type HomeHighlight = {
  id: string;
  sourceType: HomeHighlightSourceType;
  sourceId: string;
  orderIndex: number;
  isActive: boolean;
  overrideCtaLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HomeHighlightSourceOption = {
  id: string;
  sourceType: HomeHighlightSourceType;
  title: string;
  description: string;
  slug: string;
  imageUrl: string | null;
  status: "published" | "draft";
  featured: boolean;
  updatedAt: string;
};

export type HomeHighlightResolvedSlide = {
  id: string;
  sourceType: HomeHighlightSourceType;
  sourceId: string;
  orderIndex: number;
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  ctaLabel: string | null;
  locale: Locale;
};

export type HomeHighlightInput = {
  sourceType: HomeHighlightSourceType;
  sourceId: string;
  orderIndex: number;
  isActive: boolean;
  overrideCtaLabel?: string | null;
};
