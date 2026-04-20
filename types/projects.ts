import type { PublishStatus } from "@/types/db";
import type { ContentLocale } from "@/types/content-locale";

export type ProjectTranslationInput = {
  title: string;
  subtitle: string;
  contentMarkdown: string;
  tags: string[];
};

// 번역은 일부 로케일만 먼저 저장될 수 있으므로 부분 맵으로 관리한다.
export type ProjectTranslationMap = Partial<Record<ContentLocale, ProjectTranslationInput>>;

export type ProjectLinkItem = {
  label: string;
  url: string;
  isPublic: boolean;
};

export type ProjectLinks = ProjectLinkItem[];

export type Project = {
  id?: string;
  slug: string;
  title: string;
  homeSummary: string;
  summary: string;
  thumbnail: string;
  role: string;
  period: string;
  startDate?: string | null;
  endDate?: string | null;
  techStack: string[];
  links: ProjectLinks;
  featured: boolean;
  status?: PublishStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminProject = {
  id: string;
  slug: string;
  title: string;
  homeSummary: string;
  summary: string;
  syncSlugWithTitle: boolean;
  useSummaryEditor: boolean;
  thumbnail: string;
  role: string;
  period: string;
  startDate?: string | null;
  endDate?: string | null;
  techStack: string[];
  links: ProjectLinks;
  featured: boolean;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
  translations?: ProjectTranslationMap;
};

export type AdminProjectInput = {
  slug: string;
  title: string;
  homeSummary: string;
  summary: string;
  syncSlugWithTitle: boolean;
  useSummaryEditor: boolean;
  thumbnail: string;
  role: string;
  period?: string;
  startDate?: string | null;
  endDate?: string | null;
  techStack: string[];
  links: ProjectLinks;
  featured: boolean;
  status: PublishStatus;
  translations?: ProjectTranslationMap;
};

export type ProjectComment = {
  id: string;
  projectId: string;
  authorUserId: string;
  authorEmail: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  content: string;
  status: import("@/types/db").CommentStatus;
  createdAt: string;
  updatedAt?: string | null;
};
