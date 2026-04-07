import type { ComponentType } from "react";

export type PublishStatus = "draft" | "published";
export type CommentStatus = "pending" | "approved" | "rejected";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

export type ProjectLinkItem = {
  label: string;
  url: string;
};

export type ProjectLinks = ProjectLinkItem[];

export type Project = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  role: string;
  period: string;
  startDate?: string | null;
  endDate?: string | null;
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
  thumbnail?: string | null;
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
  thumbnail?: string | null;
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
  startDate?: string | null;
  endDate?: string | null;
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
  techStack: string[];
  aboutIntroDescriptionKo: string;
  aboutExperience: string;
  strengths: string[];
  workStyle: string;
  status: PublishStatus;
  updatedAt: string;
};

export type ContactMessageStatus = "new" | "read" | "replied";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
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
