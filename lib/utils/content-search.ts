// 검색 쿼리는 URL/입력 어디서 오든 동일 규칙으로 정규화한다.
export function normalizeContentSearchQuery(raw: string | null | undefined): string {
  return (raw ?? "").trim().replace(/\s+/g, " ").normalize("NFKC");
}

function flattenSearchField(field: string | string[] | null | undefined): string {
  if (!field) {
    return "";
  }

  if (Array.isArray(field)) {
    return field.join(" ");
  }

  return field;
}

// 여러 필드(title/description/tags 등)를 하나의 텍스트로 합쳐 토큰 단위 매칭을 수행한다.
export function matchesContentSearchQuery(
  fields: Array<string | string[] | null | undefined>,
  query: string,
): boolean {
  const normalizedQuery = normalizeContentSearchQuery(query).toLocaleLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);

  if (tokens.length === 0) {
    return true;
  }

  const haystack = fields
    .map((field) => flattenSearchField(field))
    .join(" ")
    .toLocaleLowerCase()
    .normalize("NFKC");

  return tokens.every((token) => haystack.includes(token));
}
