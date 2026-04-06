import type { ComponentType } from "react";

export type PublishStatus = "draft" | "published";
export type CommentStatus = "pending" | "approved" | "rejected";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

export type ProjectLinks = {
  live?: string;
  repo?: string;
  detail?: string;
};

export type Project = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  role: string;
  period: string;
  techStack: string[];
  achievements: string[];
  contributions: string[];
  links: ProjectLinks;
  featured: boolean;
  status?: PublishStatus;
  updatedAt?: string;
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  toc: TocItem[];
  readingTime: string;
};

export type BlogPostSummary = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: string;
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
  bodyMarkdown: string;
  tags: string[];
  readingTime: string;
  status: PublishStatus;
  publishedAt: string | null;
  updatedAt: string;
};

export type AdminProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  role: string;
  period: string;
  techStack: string[];
  achievements: string[];
  contributions: string[];
  links: ProjectLinks;
  featured: boolean;
  status: PublishStatus;
  updatedAt: string;
};

export type ProfileContent = {
  id: number;
  name: string;
  title: string;
  summary: string;
  aboutExperience: string;
  strengths: string[];
  workStyle: string;
  status: PublishStatus;
  updatedAt: string;
};

export type BlogComment = {
  id: string;
  postId: string;
  authorUserId: string;
  authorEmail: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  content: string;
  status: CommentStatus;
  createdAt: string;
};
