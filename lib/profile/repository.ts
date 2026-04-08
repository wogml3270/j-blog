import type { ProfileContent } from "@/types/profile";
import type { PublishStatus } from "@/types/db";
import type { Locale } from "@/lib/i18n/config";
import { TECH_STACK, getAboutSummary, getHomeIntro } from "@/lib/site/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import koAbout from "@/locales/ko/about.json";

interface ProfileRow {
  id: number;
  name: string;
  title: string;
  summary: string;
  tech_stack: unknown;
  about_intro_description_ko: string | null;
  about_experience: string;
  strengths: unknown;
  work_style: string;
  status: PublishStatus;
  updated_at: string;
};

export type AdminHomeInput = {
  name: string;
  title: string;
  summary: string;
  techStack: string[];
};

export type AdminAboutInput = {
  introDescription: string;
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
  "id,name,title,summary,tech_stack,about_intro_description_ko,about_experience,strengths,work_style,status,updated_at";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

function rowToProfile(row: ProfileRow): ProfileContent {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    summary: row.summary,
    techStack: toStringArray(row.tech_stack),
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

async function getPersistedProfileForWrite(
  locale: Locale = "ko",
): Promise<RepoResult<ProfileContent>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const { data, error } = await service
    .from("profile_content")
    .select(PROFILE_SELECT_FIELDS)
    .eq("id", 1)
    .maybeSingle<ProfileRow>();

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  if (!data) {
    return {
      data: fallbackProfile(locale),
      error: null,
    };
  }

  return {
    data: rowToProfile(data),
    error: null,
  };
}

export async function upsertAdminHomeContent(
  input: AdminHomeInput,
): Promise<RepoResult<ProfileContent>> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  const baseResult = await getPersistedProfileForWrite("ko");

  if (baseResult.error || !baseResult.data) {
    return {
      data: null,
      error: baseResult.error ?? "Failed to load profile data.",
    };
  }

  const base = baseResult.data;
  const { error } = await service.from("profile_content").upsert(
    {
      id: 1,
      name: input.name,
      title: input.title,
      summary: input.summary,
      tech_stack: input.techStack,
      about_intro_description_ko: base.aboutIntroDescriptionKo,
      about_experience: base.aboutExperience,
      strengths: base.strengths,
      work_style: base.workStyle,
      status: normalizeStatus(base.status),
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

  const baseResult = await getPersistedProfileForWrite("ko");

  if (baseResult.error || !baseResult.data) {
    return {
      data: null,
      error: baseResult.error ?? "Failed to load profile data.",
    };
  }

  const base = baseResult.data;
  const { error } = await service.from("profile_content").upsert(
    {
      id: 1,
      name: base.name,
      title: base.title,
      summary: base.summary,
      tech_stack: base.techStack,
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
