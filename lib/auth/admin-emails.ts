const DEFAULT_SUPER_ADMIN_EMAIL = "wogml3270@gmail.com";

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseEmailCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeAdminEmail);
}

// super_admin 이메일은 환경변수 우선, 미설정 시 기본 이메일 1개로 fallback한다.
export function getSuperAdminEmailsFromEnv(): Set<string> {
  const raw = (process.env.ADMIN_SUPER_ADMIN_EMAILS ?? "").trim();

  if (!raw) {
    return new Set([normalizeAdminEmail(DEFAULT_SUPER_ADMIN_EMAIL)]);
  }

  return new Set(parseEmailCsv(raw));
}

export function isEnvSuperAdminEmail(email: string): boolean {
  return getSuperAdminEmailsFromEnv().has(normalizeAdminEmail(email));
}

export function getAllowedAdminEmailsFromEnv(): Set<string> {
  const values = parseEmailCsv(process.env.ADMIN_ALLOWED_EMAILS ?? "");

  for (const superAdminEmail of getSuperAdminEmailsFromEnv()) {
    values.push(superAdminEmail);
  }

  return new Set(values);
}
