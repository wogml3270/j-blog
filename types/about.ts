import type { ContentLocale } from "@/types/content-locale";

export type AboutTechItem = {
  name: string;
  description: string;
  logoUrl: string;
};

export type AboutTranslationInput = {
  name: string;
  title: string;
  summary: string;
  aboutTechItems: AboutTechItem[];
};

// 번역은 일부 로케일만 먼저 저장될 수 있으므로 부분 맵으로 관리한다.
export type AboutTranslationMap = Partial<Record<ContentLocale, AboutTranslationInput>>;

export type AboutContent = {
  id: number;
  name: string;
  title: string;
  summary: string;
  aboutPhotoUrl: string;
  aboutTechItems: AboutTechItem[];
  updatedAt: string;
  translations?: AboutTranslationMap;
};
