import type { AdminListFilter, PaginatedResult } from "@/types/admin";
import type { PublishStatus } from "@/types/db";
import type {
  AdminProject,
  AdminProjectInput,
  Project,
  ProjectLinkItem,
  ProjectLinks,
  ProjectTranslationInput,
  ProjectTranslationMap,
} from "@/types/projects";
import type { Locale } from "@/lib/i18n/config";
import { stripMarkdownToPlainText } from "@/lib/blog/markdown";
import { removeHomeHighlightSource, syncHomeHighlightSource } from "@/lib/home/sync";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  ADMIN_PAGE_SIZE_OPTIONS,
  buildPaginatedResult,
  DEFAULT_ADMIN_PAGE_SIZE,
} from "@/lib/utils/pagination";
import { toSlugConflictMessage } from "@/lib/utils/db-error";

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  home_summary: string | null;
  summary: string;
  sync_slug_with_title: boolean | null;
  use_markdown_editor: boolean | null;
  thumbnail: string;
  role: string;
  period: string;
  start_date: string | null;
  end_date: string | null;
  tech_stack: unknown;
  links: unknown;
  featured: boolean;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
};

type ProjectTranslationRow = {
  project_id: string;
  title: string | null;
  subtitle: string | null;
  content_markdown: string | null;
  tags: unknown;
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

const PROJECT_SELECT_FIELDS =
  "id,slug,title,home_summary,summary,sync_slug_with_title,use_markdown_editor,thumbnail,role,period,start_date,end_date,tech_stack,links,featured,status,created_at,updated_at";

export class ProjectServiceUnavailableError extends Error {
  constructor(message = "Project database is unavailable.") {
    super(message);
    this.name = "ProjectServiceUnavailableError";
  }
}

// 프로젝트는 DB를 단일 소스로 사용하므로 연결 실패 시 즉시 장애 에러를 노출한다.
function requireProjectService() {
  const service = createSupabaseServiceClient();

  if (!service) {
    throw new ProjectServiceUnavailableError("Supabase service client is not configured.");
  }

  return service;
}

function deriveHomeSummary(source: string): string {
  const plain = stripMarkdownToPlainText(source);

  if (!plain) {
    return "";
  }

  return plain.slice(0, 140);
}

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

function uniqueStringList(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function toNormalizedText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function toProjectTranslationInput(row: ProjectTranslationRow): ProjectTranslationInput {
  return {
    title: toNormalizedText(row.title),
    subtitle: toNormalizedText(row.subtitle),
    contentMarkdown: row.content_markdown ?? "",
    tags: toStringArray(row.tags),
  };
}

function normalizeProjectLinks(items: ProjectLinkItem[]): ProjectLinks {
  const seen = new Map<string, ProjectLinkItem>();
  const normalized: ProjectLinks = [];

  for (const item of items) {
    const label = item.label.trim();
    const url = item.url.trim();
    const isPublic = typeof item.isPublic === "boolean" ? item.isPublic : true;

    if (!label || !url) {
      continue;
    }

    const key = `${label}::${url}`;
    seen.set(key, { label, url, isPublic });
  }

  for (const value of seen.values()) {
    normalized.push(value);
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
            isPublic: typeof raw.isPublic === "boolean" ? raw.isPublic : true,
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
      isPublic: true,
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

function syncPeriod(startDate: string | null, endDate: string | null, fallback?: string): string {
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
    homeSummary: row.home_summary?.trim() || deriveHomeSummary(row.summary),
    summary: row.summary,
    thumbnail: row.thumbnail,
    role: row.role,
    period: syncPeriod(startDate, endDate, row.period),
    startDate,
    endDate,
    techStack: toStringArray(row.tech_stack),
    links: toLinks(row.links),
    featured: row.featured,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// locale 번역이 있으면 제목/부제목/내용/태그를 우선 적용하고, 없으면 KO 원문을 유지한다.
function applyProjectTranslation(
  project: Project,
  translation: ProjectTranslationRow | null | undefined,
): Project {
  if (!translation) {
    return project;
  }

  const translatedTags = toStringArray(translation.tags);

  return {
    ...project,
    title: toNormalizedText(translation.title) || project.title,
    homeSummary: toNormalizedText(translation.subtitle) || project.homeSummary,
    summary: toNormalizedText(translation.content_markdown) || project.summary,
    techStack: translatedTags.length > 0 ? translatedTags : project.techStack,
  };
}

function rowToAdminProject(row: ProjectRow, translations: ProjectTranslationMap = {}): AdminProject {
  const startDate = normalizeDate(row.start_date);
  const endDate = normalizeDate(row.end_date);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    homeSummary: row.home_summary?.trim() || deriveHomeSummary(row.summary),
    summary: row.summary,
    syncSlugWithTitle: Boolean(row.sync_slug_with_title),
    useSummaryEditor: Boolean(row.use_markdown_editor),
    thumbnail: row.thumbnail,
    role: row.role,
    period: syncPeriod(startDate, endDate, row.period),
    startDate,
    endDate,
    techStack: toStringArray(row.tech_stack),
    links: toLinks(row.links),
    featured: row.featured,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    translations,
  };
}

function normalizeStatus(value: PublishStatus): PublishStatus {
  return value === "published" ? "published" : "draft";
}

// 프로젝트 번역은 locale에 맞는 projects_en/projects_ja에서만 조회한다.
async function getProjectTranslationMap(
  service: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  projectIds: string[],
  locale: Locale,
): Promise<Map<string, ProjectTranslationRow>> {
  if (locale === "ko" || projectIds.length === 0) {
    return new Map();
  }

  const table = locale === "en" ? "projects_en" : "projects_ja";
  const { data, error } = await service
    .from(table)
    .select("project_id,title,subtitle,content_markdown,tags")
    .in("project_id", projectIds);

  if (error || !data) {
    return new Map();
  }

  return new Map((data as ProjectTranslationRow[]).map((row) => [row.project_id, row]));
}

export async function getAllPublishedProjects(locale: Locale): Promise<Project[]> {
  const service = requireProjectService();

  const { data, error } = await service
    .from("projects")
    .select(PROJECT_SELECT_FIELDS)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error || !data) {
    throw new ProjectServiceUnavailableError(error?.message ?? "Failed to load published projects.");
  }

  const projects = (data as ProjectRow[]).map(rowToProject);
  const translationMap = await getProjectTranslationMap(
    service,
    projects.map((item) => item.id ?? "").filter(Boolean),
    locale,
  );

  return projects.map((project) =>
    applyProjectTranslation(project, project.id ? translationMap.get(project.id) : null),
  );
}

export async function getFeaturedProjects(locale: Locale, limit?: number): Promise<Project[]> {
  const service = requireProjectService();
  const safeLimit =
    typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : null;

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
    throw new ProjectServiceUnavailableError(error?.message ?? "Failed to load featured projects.");
  }

  const projects = (data as ProjectRow[]).map(rowToProject);
  const translationMap = await getProjectTranslationMap(
    service,
    projects.map((item) => item.id ?? "").filter(Boolean),
    locale,
  );

  return projects.map((project) =>
    applyProjectTranslation(project, project.id ? translationMap.get(project.id) : null),
  );
}

export async function getPublishedProjectBySlug(
  slug: string,
  locale: Locale,
): Promise<Project | null> {
  const service = requireProjectService();

  const { data, error } = await service
    .from("projects")
    .select(PROJECT_SELECT_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<ProjectRow>();

  if (error) {
    throw new ProjectServiceUnavailableError(error.message);
  }

  if (!data) {
    return null;
  }

  const base = rowToProject(data);
  const translationMap = await getProjectTranslationMap(service, [data.id], locale);

  return applyProjectTranslation(base, translationMap.get(data.id));
}

export async function getProjectSlugsForSitemap(): Promise<string[]> {
  const projects = await getAllPublishedProjects("ko");
  return projects.map((project) => project.slug);
}

// 관리자 목록용 번역 맵은 project_id 기준으로 EN/JA를 묶어 반환한다.
async function getAdminProjectTranslationMapByIds(
  service: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  projectIds: string[],
): Promise<Map<string, ProjectTranslationMap>> {
  if (projectIds.length === 0) {
    return new Map();
  }

  const [{ data: enRows, error: enError }, { data: jaRows, error: jaError }] = await Promise.all([
    service
      .from("projects_en")
      .select("project_id,title,subtitle,content_markdown,tags")
      .in("project_id", projectIds),
    service
      .from("projects_ja")
      .select("project_id,title,subtitle,content_markdown,tags")
      .in("project_id", projectIds),
  ]);

  if (enError || jaError) {
    return new Map();
  }

  const map = new Map<string, ProjectTranslationMap>();

  for (const row of (enRows ?? []) as ProjectTranslationRow[]) {
    const current = map.get(row.project_id) ?? {};
    current.en = toProjectTranslationInput(row);
    map.set(row.project_id, current);
  }

  for (const row of (jaRows ?? []) as ProjectTranslationRow[]) {
    const current = map.get(row.project_id) ?? {};
    current.ja = toProjectTranslationInput(row);
    map.set(row.project_id, current);
  }

  return map;
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

  const rows = data as ProjectRow[];
  const translationMap = await getAdminProjectTranslationMapByIds(
    service,
    rows.map((row) => row.id),
  );

  return rows.map((row) => rowToAdminProject(row, translationMap.get(row.id) ?? {}));
}

export async function getAdminProjectsPaginated(
  page = 1,
  pageSize = 10,
  filter: AdminListFilter = "all",
  statusScope: PublishStatus | null = null,
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

  let query = service.from("projects").select(PROJECT_SELECT_FIELDS, { count: "exact" });

  if (statusScope) {
    query = query.eq("status", statusScope);
  }

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

  const rows = data as ProjectRow[];
  const translationMap = await getAdminProjectTranslationMapByIds(
    service,
    rows.map((row) => row.id),
  );

  return buildPaginatedResult(
    rows.map((row) => rowToAdminProject(row, translationMap.get(row.id) ?? {})),
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

  const translationMap = await getAdminProjectTranslationMapByIds(service, [id]);
  return rowToAdminProject(data, translationMap.get(id) ?? {});
}

// 관리자 입력 번역은 EN/JA를 각각 projects_en/projects_ja에 upsert한다.
async function upsertProjectTranslations(
  service: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  projectId: string,
  translations: ProjectTranslationMap | undefined,
) {
  if (!translations) {
    return;
  }

  const en = translations.en;
  const ja = translations.ja;

  if (en) {
    await service.from("projects_en").upsert(
      {
        project_id: projectId,
        title: en.title.trim(),
        subtitle: en.subtitle.trim(),
        content_markdown: en.contentMarkdown,
        tags: uniqueStringList(en.tags),
      },
      { onConflict: "project_id" },
    );
  }

  if (ja) {
    await service.from("projects_ja").upsert(
      {
        project_id: projectId,
        title: ja.title.trim(),
        subtitle: ja.subtitle.trim(),
        content_markdown: ja.contentMarkdown,
        tags: uniqueStringList(ja.tags),
      },
      { onConflict: "project_id" },
    );
  }
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
      home_summary: input.homeSummary.trim(),
      summary: input.summary,
      sync_slug_with_title: Boolean(input.syncSlugWithTitle),
      use_markdown_editor: input.useSummaryEditor,
      thumbnail: input.thumbnail,
      role: input.role,
      period,
      start_date: startDate,
      end_date: endDate,
      tech_stack: input.techStack,
      links,
      featured: input.featured,
      status: normalizeStatus(input.status),
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    return {
      data: null,
      error:
        toSlugConflictMessage(error, "프로젝트") ?? error?.message ?? "Failed to create project.",
    };
  }

  await upsertProjectTranslations(service, data.id, input.translations);
  await syncHomeHighlightSource({
    sourceType: "project",
    sourceId: data.id,
    featured: Boolean(input.featured),
    status: normalizeStatus(input.status),
  });

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
      home_summary: input.homeSummary.trim(),
      summary: input.summary,
      sync_slug_with_title: Boolean(input.syncSlugWithTitle),
      use_markdown_editor: input.useSummaryEditor,
      thumbnail: input.thumbnail,
      role: input.role,
      period,
      start_date: startDate,
      end_date: endDate,
      tech_stack: input.techStack,
      links,
      featured: input.featured,
      status: normalizeStatus(input.status),
    })
    .eq("id", id);

  if (error) {
    return {
      data: null,
      error: toSlugConflictMessage(error, "프로젝트") ?? error.message,
    };
  }

  await upsertProjectTranslations(service, id, input.translations);
  await syncHomeHighlightSource({
    sourceType: "project",
    sourceId: id,
    featured: Boolean(input.featured),
    status: normalizeStatus(input.status),
  });

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

  await removeHomeHighlightSource("project", id);

  return {
    data: { id },
    error: null,
  };
}
