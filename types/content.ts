import type { ComponentType } from "react";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  role: string;
  period: string;
  techStack: string[];
  achievements: string[];
  contributions: string[];
  links: {
    live?: string;
    repo?: string;
    detail?: string;
  };
  featured: boolean;
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

export type BlogRegistryItem = {
  meta: BlogPostMeta;
  Component: ComponentType;
};
