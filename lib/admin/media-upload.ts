import { createSupabaseServiceClient } from "@/lib/supabase/service";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const THUMBNAIL_BUCKET = process.env.SUPABASE_PROJECT_THUMBNAIL_BUCKET ?? "project-thumbnails";

export type UploadScope = "projects" | "posts" | "misc";

type UploadResult = {
  url: string;
  bucket: string;
  path: string;
};

type UploadResultWithError = {
  data: UploadResult | null;
  error: string | null;
};

export function normalizeUploadScope(raw: unknown): UploadScope {
  if (raw === "projects" || raw === "posts" || raw === "misc") {
    return raw;
  }

  return "misc";
}

function normalizeFilename(name: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized.slice(0, 48) || "thumbnail";
}

function resolveExtension(fileName: string, mimeType: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase();

  if (fromName && fromName.length <= 8) {
    return fromName;
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  if (mimeType === "image/gif") {
    return "gif";
  }

  return "jpg";
}

export async function uploadAdminImageToStorage(
  file: File,
  userId: string,
  scope: UploadScope,
): Promise<UploadResultWithError> {
  const service = createSupabaseServiceClient();

  if (!service) {
    return {
      data: null,
      error: "Supabase service role key is not configured.",
    };
  }

  if (!file.type.startsWith("image/")) {
    return {
      data: null,
      error: "이미지 파일만 업로드할 수 있습니다.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      data: null,
      error: "이미지 용량은 5MB 이하만 업로드할 수 있습니다.",
    };
  }

  const datePrefix = new Date().toISOString().slice(0, 10);
  const extension = resolveExtension(file.name, file.type);
  const baseName = normalizeFilename(file.name);
  const unique = `${Date.now()}-${userId.slice(0, 8)}`;
  const path = `${scope}/${datePrefix}/${unique}-${baseName}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await service.storage.from(THUMBNAIL_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
    cacheControl: "31536000",
  });

  if (uploadError) {
    return {
      data: null,
      error:
        uploadError.message ??
        `스토리지 업로드에 실패했습니다. Supabase Storage에 '${THUMBNAIL_BUCKET}' 버킷이 있는지 확인해주세요.`,
    };
  }

  const { data: publicUrlData } = service.storage.from(THUMBNAIL_BUCKET).getPublicUrl(path);

  if (!publicUrlData.publicUrl) {
    return {
      data: null,
      error: "공개 URL 생성에 실패했습니다.",
    };
  }

  return {
    data: {
      bucket: THUMBNAIL_BUCKET,
      path,
      url: publicUrlData.publicUrl,
    },
    error: null,
  };
}
