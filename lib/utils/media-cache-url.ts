// About 기술스택처럼 자주 재사용되는 원격 public 이미지는 캐시 프록시 경로로 정규화한다.
export function toCachedMediaUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/api/media-cache?url=${encodeURIComponent(trimmed)}`;
}
