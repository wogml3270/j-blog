import type { AdminProject, Project, ProjectLinks, PublishStatus } from "@/types/content";
import type { Locale } from "@/lib/i18n/config";
import {
  getAllProjects as getFallbackProjects,
  getFeaturedProjects as getFallbackFeaturedProjects,
  getProjectBySlug as getFallbackProjectBySlug,
} from "@/lib/projects/data";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  role: string;
  period: string;
  tech_stack: unknown;
  achievements: unknown;
  contributions: unknown;
  links: unknown;
  featured: boolean;
  status: PublishStatus;
  updated_at: string;
};

export type AdminProjectInput = {
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
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

function toLinks(value: unknown): ProjectLinks {
  if (!value || typeof value !== "object") {
    return {};
  }

  const raw = value as Record<string, unknown>;

  return {
    live: typeof raw.live === "string" ? raw.live : undefined,
    repo: typeof raw.repo === "string" ? raw.repo : undefined,
    detail: typeof raw.detail === "string" ? raw.detail : undefined,
  };
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    thumbnail: row.thumbnail,
    role: row.role,
    period: row.period,
    techStack: toStringArray(row.tech_stack),
    achievements: toStringArray(row.achievements),
    contributions: toStringArray(row.contributions),
    links: toLinks(row.links),
    featured: row.featured,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function rowToAdminProject(row: ProjectRow): AdminProject {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    thumbnail: row.thumbnail,
    role: row.role,
    period: row.period,
    techStack: toStringArray(row.tech_stack),
    achievements: toStringArray(row.achievements),
    contributions: toStringArray(row.contributions),
    links: toLinks(row.links),
    featured: row.featured,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function normalizeStatus(value: PublishStatus): PublishStatus {
  return value === "published" ? "published" : "draft";
}

function fallbackAll(locale: Locale): Project[] {
  return getFallbackProjects(locale).map((project) => ({
    ...project,
    id: project.slug,
    status: "published",
    updatedAt: new Date().toISOString(),
  }));
}

export async function getAllPublishedProjects(locale: Locale): Promise<Project[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return fallbackAll(locale);
  }

  const { data, error } = await service
    .from("projects")
    .select(
      "id,slug,title,summary,thumbnail,role,period,tech_stack,achievements,contributions,links,featured,status,updated_at",
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return fallbackAll(locale);
  }

  return (data as ProjectRow[]).map(rowToProject);
}

export async function getFeaturedProjects(locale: Locale, limit = 3): Promise<Project[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return getFallbackFeaturedProjects(locale, limit).map((project) => ({
      ...project,
      id: project.slug,
      status: "published",
      updatedAt: new Date().toISOString(),
    }));
  }

  const { data, error } = await service
    .from("projects")
    .select(
      "id,slug,title,summary,thumbnail,role,period,tech_stack,achievements,contributions,links,featured,status,updated_at",
    )
    .eq("status", "published")
    .eq("featured", true)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return getFallbackFeaturedProjects(locale, limit).map((project) => ({
      ...project,
      id: project.slug,
      status: "published",
      updatedAt: new Date().toISOString(),
    }));
  }

  return (data as ProjectRow[]).map(rowToProject);
}

export async function getPublishedProjectBySlug(slug: string, locale: Locale): Promise<Project | null> {
  const service = createSupabaseServiceClient();

  if (!service) {
    const fallback = getFallbackProjectBySlug(slug, locale);
    return fallback
      ? {
          ...fallback,
          id: fallback.slug,
          status: "published",
          updatedAt: new Date().toISOString(),
        }
      : null;
  }

  const { data, error } = await service
    .from("projects")
    .select(
      "id,slug,title,summary,thumbnail,role,period,tech_stack,achievements,contributions,links,featured,status,updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<ProjectRow>();

  if (error || !data) {
    const fallback = getFallbackProjectBySlug(slug, locale);
    return fallback
      ? {
          ...fallback,
          id: fallback.slug,
          status: "published",
          updatedAt: new Date().toISOString(),
        }
      : null;
  }

  return rowToProject(data);
}

export async function getProjectSlugsForSitemap(): Promise<string[]> {
  const projects = await getAllPublishedProjects("ko");
  return projects.map((project) => project.slug);
}

export async function getAdminProjects(): Promise<AdminProject[]> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return [];
  }

  const { data, error } = await service
    .from("projects")
    .select(
      "id,slug,title,summary,thumbnail,role,period,tech_stack,achievements,contributions,links,featured,status,updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ProjectRow[]).map(rowToAdminProject);
}

async function getAdminProjectById(id: string): Promise<AdminProject | null> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return null;
  }

  const { data, error } = await service
    .from("projects")
    .select(
      "id,slug,title,summary,thumbnail,role,period,tech_stack,achievements,contributions,links,featured,status,updated_at",
    )
    .eq("id", id)
    .maybeSingle<ProjectRow>();

  if (error || !data) {
    return null;
  }

  return rowToAdminProject(data);
}

export async function createAdminProject(
  input: AdminProjectInput,
): Promise<RepoResult<AdminProject>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data, error } = await service
    .from("projects")
    .insert({
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      thumbnail: input.thumbnail,
      role: input.role,
      period: input.period,
      tech_stack: input.techStack,
      achievements: input.achievements,
      contributions: input.contributions,
      links: input.links,
      featured: input.featured,
      status: normalizeStatus(input.status),
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    return {
      data: null,
      error: error?.message ?? "Failed to create project.",
    };
  }

  return {
    data: await getAdminProjectById(data.id),
    error: null,
  };
}

export async function updateAdminProject(
  id: string,
  input: AdminProjectInput,
): Promise<RepoResult<AdminProject>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { error } = await service
    .from("projects")
    .update({
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      thumbnail: input.thumbnail,
      role: input.role,
      period: input.period,
      tech_stack: input.techStack,
      achievements: input.achievements,
      contributions: input.contributions,
      links: input.links,
      featured: input.featured,
      status: normalizeStatus(input.status),
    })
    .eq("id", id);

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: await getAdminProjectById(id),
    error: null,
  };
}

export async function deleteAdminProject(id: string): Promise<RepoResult<{ id: string }>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { error } = await service.from("projects").delete().eq("id", id);

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: { id },
    error: null,
  };
}
