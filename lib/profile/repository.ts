import type { ProfileContent, PublishStatus } from "@/types/content";
import type { Locale } from "@/lib/i18n/config";
import { getAboutSummary, getHomeIntro } from "@/lib/site/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type ProfileRow = {
  id: number;
  name: string;
  title: string;
  summary: string;
  about_experience: string;
  strengths: unknown;
  work_style: string;
  status: PublishStatus;
  updated_at: string;
};

export type AdminProfileInput = {
  name: string;
  title: string;
  summary: string;
  aboutExperience: string;
  strengths: string[];
  workStyle: string;
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

function rowToProfile(row: ProfileRow): ProfileContent {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    summary: row.summary,
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
    .select("id,name,title,summary,about_experience,strengths,work_style,status,updated_at")
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
    .select("id,name,title,summary,about_experience,strengths,work_style,status,updated_at")
    .eq("id", 1)
    .maybeSingle<ProfileRow>();

  if (error || !data) {
    return fallbackProfile(locale);
  }

  return rowToProfile(data);
}

export async function upsertAdminProfileContent(
  input: AdminProfileInput,
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
