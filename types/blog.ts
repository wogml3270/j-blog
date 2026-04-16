import type { PublishStatus } from "@/types/db";
import type { ContentLocale } from "@/types/content-locale";

export type BlogTranslationInput = {
  title: string;
  description: string;
  bodyMarkdown: string;
  tags: string[];
};

// 번역은 일부 로케일만 먼저 저장될 수 있으므로 부분 맵으로 관리한다.
export type BlogTranslationMap = Partial<Record<ContentLocale, BlogTranslationInput>>;

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  toc: TocItem[];
};

export type BlogPostSummary = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  thumbnail?: string | null;
  featured?: boolean;
  tags: string[];
};

export type BlogPostDetail = BlogPostSummary & {
  source: "supabase";
  bodyMarkdown?: string;
  toc: TocItem[];
  status?: PublishStatus;
  publishedAt?: string | null;
  scheduledPublishAt?: string | null;
  updatedAt?: string;
};

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  featured: boolean;
  syncSlugWithTitle: boolean;
  bodyMarkdown: string;
  useMarkdownEditor: boolean;
  tags: string[];
  status: PublishStatus;
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  updatedAt: string;
  translations?: BlogTranslationMap;
};

export type AdminPostInput = {
  slug: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  featured: boolean;
  syncSlugWithTitle: boolean;
  bodyMarkdown: string;
  useMarkdownEditor: boolean;
  status: PublishStatus;
  publishedAt?: string | null;
  scheduledPublishAt?: string | null;
  tags: string[];
  translations?: BlogTranslationMap;
};

export type BlogComment = {
  id: string;
  postId: string;
  authorUserId: string;
  authorEmail: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  content: string;
  status: import("@/types/db").CommentStatus;
  createdAt: string;
};
