import type { PublishStatus } from "@/types/db";

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

export type AdminProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  useSummaryEditor: boolean;
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

export type AdminProjectInput = {
  slug: string;
  title: string;
  summary: string;
  useSummaryEditor: boolean;
  thumbnail: string;
  role: string;
  period?: string;
  startDate?: string | null;
  endDate?: string | null;
  techStack: string[];
  achievements: string[];
  contributions: string[];
  links: ProjectLinks;
  featured: boolean;
  status: PublishStatus;
};
