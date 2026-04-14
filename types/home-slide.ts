import type { Locale } from "@/lib/i18n/config";

export type HomeSlideSourceType = "project" | "post";
export type HomeSourceFilter = "all" | HomeSlideSourceType;
export type HomeActiveFilter = "all" | "active" | "inactive";

export type HomeSlide = {
  id: string;
  sourceType: HomeSlideSourceType;
  sourceId: string;
  orderIndex: number;
  isActive: boolean;
  overrideCtaLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HomeSlideSourceOption = {
  id: string;
  sourceType: HomeSlideSourceType;
  title: string;
  description: string;
  slug: string;
  imageUrl: string | null;
  status: "published" | "draft";
  featured: boolean;
  updatedAt: string;
};

export type HomeSlideResolved = {
  id: string;
  sourceType: HomeSlideSourceType;
  sourceId: string;
  orderIndex: number;
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  ctaLabel: string | null;
  locale: Locale;
};

export type HomeSlideInput = {
  sourceType: HomeSlideSourceType;
  sourceId: string;
  orderIndex: number;
  isActive: boolean;
  overrideCtaLabel?: string | null;
};
