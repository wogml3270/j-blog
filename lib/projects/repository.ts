import type { AdminListFilter, PaginatedResult } from "@/types/admin";
import type { PublishStatus } from "@/types/db";
import type {
  AdminProject,
  AdminProjectInput,
  Project,
  ProjectLinkItem,
  ProjectLinks,
} from "@/types/projects";
import type { Locale } from "@/lib/i18n/config";
import {
  getAllProjects as getFallbackProjects,
  getFeaturedProjects as getFallbackFeaturedProjects,
  getProjectBySlug as getFallbackProjectBySlug,
} from "@/lib/projects/data";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  ADMIN_PAGE_SIZE_OPTIONS,
  buildPaginatedResult,
  DEFAULT_ADMIN_PAGE_SIZE,
} from "@/lib/utils/pagination";

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  use_markdown_editor: boolean | null;
  thumbnail: string;
  role: string;
  period: string;
  start_date: string | null;
  end_date: string | null;
  tech_stack: unknown;
  achievements: unknown;
  contributions: unknown;
  links: unknown;
  featured: boolean;
  status: PublishStatus;
  updated_at: string;
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

const PROJECT_SELECT_FIELDS =
  "id,slug,title,summary,use_markdown_editor,thumbnail,role,period,start_date,end_date,tech_stack,achievements,contributions,links,featured,status,updated_at";

const LEGACY_LINK_LABELS: Record<string, string> = {
  live: "Live",
  repo: "Repository",
  detail: "Case Study",
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeProjectLinks(items: ProjectLinkItem[]): ProjectLinks {
  const seen = new Set<string>();
  const normalized: ProjectLinks = [];

  for (const item of items) {
    const label = item.label.trim();
    const url = item.url.trim();

    if (!label || !url) {
      continue;
    }

    const key = `${label}::${url}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push({ label, url });
  }

  return normalized;
}

function toLinks(value: unknown): ProjectLinks {
  if (Array.isArray(value)) {
    return normalizeProjectLinks(
      value
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const raw = item as Record<string, unknown>;

          return {
            label: typeof raw.label === "string" ? raw.label : "",
            url: typeof raw.url === "string" ? raw.url : "",
          };
        }),
    );
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const raw = value as Record<string, unknown>;
  const legacy: ProjectLinkItem[] = [];

  for (const [key, maybeUrl] of Object.entries(raw)) {
    if (typeof maybeUrl !== "string") {
      continue;
    }

    const url = maybeUrl.trim();

    if (!url) {
      continue;
    }

    legacy.push({
      label: LEGACY_LINK_LABELS[key] ?? key,
      url,
    });
  }

  return normalizeProjectLinks(legacy);
}

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  // HTML date input은 YYYY-MM-DD를 반환하므로 그대로 허용.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function formatPeriodDate(value: string): string {
  const [year, month] = value.split("-");

  if (!year || !month) {
    return value;
  }

  return `${year}.${month}`;
}

function syncPeriod(
  startDate: string | null,
  endDate: string | null,
  fallback?: string,
): string {
  if (startDate && endDate) {
    return `${formatPeriodDate(startDate)} - ${formatPeriodDate(endDate)}`;
  }

  if (startDate && !endDate) {
    return `${formatPeriodDate(startDate)} - 진행중`;
  }

  if (!startDate && endDate) {
    return `~ ${formatPeriodDate(endDate)}`;
  }

  return fallback?.trim() || "";
}

function rowToProject(row: ProjectRow): Project {
  const startDate = normalizeDate(row.start_date);
  const endDate = normalizeDate(row.end_date);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    thumbnail: row.thumbnail,
    role: row.role,
    period: syncPeriod(startDate, endDate, row.period),
    startDate,
    endDate,
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
  const startDate = normalizeDate(row.start_date);
  const endDate = normalizeDate(row.end_date);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    useSummaryEditor: Boolean(row.use_markdown_editor),
    thumbnail: row.thumbnail,
    role: row.role,
    period: syncPeriod(startDate, endDate, row.period),
    startDate,
    endDate,
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
    .select(PROJECT_SELECT_FIELDS)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return fallbackAll(locale);
  }

  return (data as ProjectRow[]).map(rowToProject);
}

export async function getFeaturedProjects(locale: Locale, limit?: number): Promise<Project[]> {
  const service = createSupabaseServiceClient();
  const safeLimit = typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : null;

  if (!service) {
    return getFallbackFeaturedProjects(locale, safeLimit ?? undefined).map((project) => ({
      ...project,
      id: project.slug,
      status: "published",
      updatedAt: new Date().toISOString(),
    }));
  }

  let query = service
    .from("projects")
    .select(PROJECT_SELECT_FIELDS)
    .eq("status", "published")
    .eq("featured", true)
    .order("updated_at", { ascending: false });

  if (safeLimit) {
    query = query.limit(safeLimit);
  }

  const { data, error } = await query;

  if (error || !data) {
    return getFallbackFeaturedProjects(locale, safeLimit ?? undefined).map((project) => ({
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
    .select(PROJECT_SELECT_FIELDS)
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
    .select(PROJECT_SELECT_FIELDS)
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ProjectRow[]).map(rowToAdminProject);
}

export async function getAdminProjectsPaginated(
  page = 1,
  pageSize = 10,
  filter: AdminListFilter = "all",
): Promise<PaginatedResult<AdminProject>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return buildPaginatedResult([], page, pageSize, 0);
  }

  const safePage = Math.max(1, Math.floor(page));
  const parsedPageSize = Math.floor(pageSize);
  const safePageSize = ADMIN_PAGE_SIZE_OPTIONS.includes(parsedPageSize as 3 | 5 | 10)
    ? parsedPageSize
    : DEFAULT_ADMIN_PAGE_SIZE;
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = service
    .from("projects")
    .select(PROJECT_SELECT_FIELDS, { count: "exact" });

  if (filter === "main") {
    query = query.eq("featured", true);
  } else if (filter === "general") {
    query = query.eq("featured", false);
  } else if (filter === "published") {
    query = query.eq("status", "published");
  } else if (filter === "draft") {
    query = query.eq("status", "draft");
  }

  const { data, error, count } = await query
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return buildPaginatedResult([], safePage, safePageSize, 0);
  }

  return buildPaginatedResult(
    (data as ProjectRow[]).map(rowToAdminProject),
    safePage,
    safePageSize,
    count ?? 0,
  );
}

async function getAdminProjectById(id: string): Promise<AdminProject | null> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return null;
  }

  const { data, error } = await service
    .from("projects")
    .select(PROJECT_SELECT_FIELDS)
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

  const startDate = normalizeDate(input.startDate);
  const endDate = normalizeDate(input.endDate);
  const period = syncPeriod(startDate, endDate, input.period);
  const links = normalizeProjectLinks(input.links);
  const { data, error } = await service
    .from("projects")
    .insert({
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      use_markdown_editor: input.useSummaryEditor,
      thumbnail: input.thumbnail,
      role: input.role,
      period,
      start_date: startDate,
      end_date: endDate,
      tech_stack: input.techStack,
      achievements: input.achievements,
      contributions: input.contributions,
      links,
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

  const startDate = normalizeDate(input.startDate);
  const endDate = normalizeDate(input.endDate);
  const period = syncPeriod(startDate, endDate, input.period);
  const links = normalizeProjectLinks(input.links);
  const { error } = await service
    .from("projects")
    .update({
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      use_markdown_editor: input.useSummaryEditor,
      thumbnail: input.thumbnail,
      role: input.role,
      period,
      start_date: startDate,
      end_date: endDate,
      tech_stack: input.techStack,
      achievements: input.achievements,
      contributions: input.contributions,
      links,
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
