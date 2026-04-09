import type { ProfileContent } from "@/types/profile";
import type { PublishStatus } from "@/types/db";
import type { Locale } from "@/lib/i18n/config";
import {
  DEFAULT_ABOUT_PHOTO_URL,
  DEFAULT_ABOUT_TECH_ITEMS,
  TECH_STACK,
  getAboutSummary,
  getHomeIntro,
} from "@/lib/site/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import koAbout from "@/locales/ko/about.json";

interface ProfileRow {
  id: number;
  name: string;
  title: string;
  summary: string;
  tech_stack: unknown;
  about_photo_url: string | null;
  about_tech_items: unknown;
  about_intro_description_ko: string | null;
  about_experience: string;
  strengths: unknown;
  work_style: string;
  status: PublishStatus;
  updated_at: string;
}

export type AdminAboutInput = {
  name: string;
  title: string;
  summary: string;
  techStack: string[];
  introDescription: string;
  aboutPhotoUrl: string;
  aboutTechItems: Array<{
    name: string;
    description: string;
    logoUrl: string;
  }>;
  aboutExperience: string;
  strengths: string[];
  workStyle: string;
  status: PublishStatus;
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

const PROFILE_SELECT_FIELDS =
  "id,name,title,summary,tech_stack,about_photo_url,about_tech_items,about_intro_description_ko,about_experience,strengths,work_style,status,updated_at";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

function toAboutTechItems(
  value: unknown,
): Array<{ name: string; description: string; logoUrl: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const items: Array<{ name: string; description: string; logoUrl: string }> = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const raw = item as Record<string, unknown>;
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const description = typeof raw.description === "string" ? raw.description.trim() : "";
    const logoUrl = typeof raw.logoUrl === "string" ? raw.logoUrl.trim() : "";

    if (!name || !description || !logoUrl) {
      continue;
    }

    const key = `${name}::${logoUrl}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push({ name, description, logoUrl });
  }

  return items;
}

function rowToProfile(row: ProfileRow): ProfileContent {
  const aboutTechItems = toAboutTechItems(row.about_tech_items);

  return {
    id: row.id,
    name: row.name,
    title: row.title,
    summary: row.summary,
    techStack: toStringArray(row.tech_stack),
    aboutPhotoUrl: row.about_photo_url?.trim() || DEFAULT_ABOUT_PHOTO_URL,
    aboutTechItems: aboutTechItems.length > 0 ? aboutTechItems : DEFAULT_ABOUT_TECH_ITEMS,
    aboutIntroDescriptionKo: row.about_intro_description_ko ?? "",
    aboutExperience: row.about_experience,
    strengths: toStringArray(row.strengths),
    workStyle: row.work_style,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function normalizeStatus(value: PublishStatus): PublishStatus {
  return value === "published" ? "published" : "draft";
}

function fallbackProfile(locale: Locale): ProfileContent {
  const home = getHomeIntro(locale);
  const about = getAboutSummary(locale);

  return {
    id: 1,
    name: home.name,
    title: home.title,
    summary: home.summary,
    techStack: TECH_STACK,
    aboutPhotoUrl: DEFAULT_ABOUT_PHOTO_URL,
    aboutTechItems: DEFAULT_ABOUT_TECH_ITEMS,
    aboutIntroDescriptionKo: koAbout.introDescription,
    aboutExperience: about.experience,
    strengths: about.strengths,
    workStyle: about.workStyle,
    status: "published",
    updatedAt: new Date().toISOString(),
  };
}

export async function getPublishedProfileContent(locale: Locale): Promise<ProfileContent> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return fallbackProfile(locale);
  }

  const { data, error } = await service
    .from("profile_content")
    .select(PROFILE_SELECT_FIELDS)
    .eq("id", 1)
    .eq("status", "published")
    .maybeSingle<ProfileRow>();

  if (error || !data) {
    return fallbackProfile(locale);
  }

  return rowToProfile(data);
}

export async function getAdminProfileContent(locale: Locale = "ko"): Promise<ProfileContent> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return fallbackProfile(locale);
  }

  const { data, error } = await service
    .from("profile_content")
    .select(PROFILE_SELECT_FIELDS)
    .eq("id", 1)
    .maybeSingle<ProfileRow>();

  if (error || !data) {
    return fallbackProfile(locale);
  }

  return rowToProfile(data);
}

export async function upsertAdminAboutContent(
  input: AdminAboutInput,
): Promise<RepoResult<ProfileContent>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { error } = await service.from("profile_content").upsert(
    {
      id: 1,
      name: input.name,
      title: input.title,
      summary: input.summary,
      tech_stack: input.techStack,
      about_photo_url: input.aboutPhotoUrl,
      about_tech_items: input.aboutTechItems,
      about_intro_description_ko: input.introDescription,
      about_experience: input.aboutExperience,
      strengths: input.strengths,
      work_style: input.workStyle,
      status: normalizeStatus(input.status),
    },
    { onConflict: "id" },
  );

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: await getAdminProfileContent("ko"),
    error: null,
  };
}
