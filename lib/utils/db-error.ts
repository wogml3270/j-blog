type KnownDbError = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

// DB 에러에서 slug UNIQUE 충돌을 식별해 사용자 친화 메시지로 변환한다.
export function toSlugConflictMessage(error: unknown, entityLabel: string): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const dbError = error as KnownDbError;
  const joined = [dbError.message, dbError.details, dbError.hint]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  if (dbError.code === "23505" && joined.includes("slug")) {
    return `${entityLabel} 슬러그가 이미 사용 중입니다. 다른 슬러그를 입력해주세요.`;
  }

  return null;
}
