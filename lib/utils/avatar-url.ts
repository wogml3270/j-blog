const ALLOWED_SOCIAL_AVATAR_HOSTS = new Set([
  "k.kakaocdn.net",
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
]);

// 소셜 프로필 이미지 URL을 안전한 형식으로 정규화한다.
export function normalizeAvatarUrl(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }

    if (parsed.protocol === "http:" && ALLOWED_SOCIAL_AVATAR_HOSTS.has(parsed.hostname)) {
      parsed.protocol = "https:";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}
