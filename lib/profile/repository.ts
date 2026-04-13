import type { ProfileContent } from "@/types/profile";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_ABOUT_PHOTO_URL, DEFAULT_ABOUT_TECH_ITEMS, getHomeIntro } from "@/lib/site/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

interface ProfileRow {
  id: number;
  name: string;
  title: string;
  summary: string;
  about_photo_url: string | null;
  about_tech_items: unknown;
  updated_at: string;
}

export type AdminAboutInput = {
  name: string;
  title: string;
  summary: string;
  aboutPhotoUrl: string;
  aboutTechItems: Array<{
    name: string;
    description: string;
    logoUrl: string;
  }>;
};

type RepoResult<T> = {
  data: T | null;
  error: string | null;
};

const PROFILE_SELECT_FIELDS = "id,name,title,summary,about_photo_url,about_tech_items,updated_at";

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
    aboutPhotoUrl: row.about_photo_url?.trim() || DEFAULT_ABOUT_PHOTO_URL,
    aboutTechItems: aboutTechItems.length > 0 ? aboutTechItems : DEFAULT_ABOUT_TECH_ITEMS,
    updatedAt: row.updated_at,
  };
}

function fallbackProfile(locale: Locale): ProfileContent {
  const home = getHomeIntro(locale);

  return {
    id: 1,
    name: home.name,
    title: home.title,
    summary: home.summary,
    aboutPhotoUrl: DEFAULT_ABOUT_PHOTO_URL,
    aboutTechItems: DEFAULT_ABOUT_TECH_ITEMS,
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
      about_photo_url: input.aboutPhotoUrl,
      about_tech_items: input.aboutTechItems,
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
