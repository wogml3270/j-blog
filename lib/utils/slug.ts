// 슬러그 입력값을 URL 안전 규칙(한글/영문/숫자/언더스코어)으로 정규화한다.
export function normalizeSlug(value: string): string {
  const normalized = value.normalize("NFKC").trim();

  if (!normalized) {
    return "";
  }

  return normalized
    .replace(/[\s\-–—/\\|.,:;+=]+/g, "_")
    .replace(/[^A-Za-z0-9\p{Script=Hangul}_]/gu, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// 동적 세그먼트 경로 생성 시 슬러그를 안전하게 인코딩한다.
export function encodeSlugSegment(value: string): string {
  return encodeURIComponent(value);
}

// URL 파라미터를 안전하게 디코딩하고 실패 시 원문을 반환한다.
export function decodeSlugSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
