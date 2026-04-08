import type { ComponentType } from "react";
import type { PublishStatus } from "@/types/db";

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
  source: "supabase" | "mdx";
  bodyMarkdown?: string;
  Component?: ComponentType;
  toc: TocItem[];
  status?: PublishStatus;
  publishedAt?: string | null;
  updatedAt?: string;
};

export type BlogRegistryItem = {
  meta: BlogPostMeta;
  Component: ComponentType;
};

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  featured: boolean;
  bodyMarkdown: string;
  useMarkdownEditor: boolean;
  tags: string[];
  status: PublishStatus;
  publishedAt: string | null;
  updatedAt: string;
};

export type AdminPostInput = {
  slug: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  featured: boolean;
  bodyMarkdown: string;
  useMarkdownEditor: boolean;
  status: PublishStatus;
  publishedAt?: string | null;
  tags: string[];
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
